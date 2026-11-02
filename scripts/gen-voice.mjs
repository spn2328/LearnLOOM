// Pre-renders every fixed Thai lesson text as an MP3 with Microsoft neural Thai voices, one voice per
// character (casting in scripts/voice-cast.mjs).
// Engine: Azure AI Speech when AZURE_SPEECH_KEY / AZURE_SPEECH_REGION are in .env.local (gitignored),
// otherwise the Edge "Read aloud" service via msedge-tts (no key; unofficial, may stop working).
// Only lesson text from the source files is sent to Microsoft, never learner data. A line is rendered
// again only when its text or its voice changed (public/voice/manifest.json).
// Output: public/voice/<key>.mp3 + public/voice/index.json
// Flags: --dry-run (count only), --edge (ignore the Azure key), --samples (one line per role into
// public/voice-samples/, for listening before a full run)
import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";
import {collectTexts, loomTexts, voiceKey} from "./voice-texts.mjs";
import {ROLES, roleOf, spokenText} from "./voice-cast.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "voice");
const MANIFEST = path.join(OUT, "manifest.json");
const env = {...process.env};
for (const f of [".env.local", ".env"]) {
  const p = path.join(ROOT, f);
  if (fs.existsSync(p)) for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*"?([^"\r\n]*)"?\s*$/.exec(line);
    if (m && !env[m[1]]) env[m[1]] = m[2];
  }
}
const KEY = env.AZURE_SPEECH_KEY, REGION = env.AZURE_SPEECH_REGION;
const AZURE = !!(KEY && REGION && KEY !== "YOUR_KEY" && !process.argv.includes("--edge"));
const dryRun = process.argv.includes("--dry-run");

const LOOM = loomTexts();
const plan = t => { const role = roleOf(t, LOOM), r = ROLES[role]; return {role, ...r, say: spokenText(t)}; };
const signature = p => [p.voice, p.rate, p.pitch, p.say].join("|");

async function tts(p, worker) {
  if (!AZURE) return edge(p, worker);
  const body = `<speak version="1.0" xml:lang="th-TH"><voice name="${p.voice}"><prosody rate="${p.rate}" pitch="${p.pitch}">${p.say}</prosody></voice></speak>`;
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: {"Ocp-Apim-Subscription-Key": KEY, "Content-Type": "application/ssml+xml", "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3", "User-Agent": "learnloom-gen-voice"},
      body,
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if ((res.status === 429 || res.status >= 500) && attempt < 6) { await new Promise(r => setTimeout(r, 1000 * 2 ** attempt)); continue; }
    throw new Error(`Azure ${res.status} ${res.statusText}: ${(await res.text()).slice(0, 200)}`);
  }
}

// one Edge connection per worker, reopened after an error or a voice change
const edgeClients = [];
async function edge(p, worker) {
  const {MsEdgeTTS, OUTPUT_FORMAT} = await import("msedge-tts");
  for (let attempt = 1; ; attempt++) {
    try {
      let c = edgeClients[worker];
      if (!c || c.voice !== p.voice) {
        c?.tts.close();
        c = edgeClients[worker] = {voice: p.voice, tts: new MsEdgeTTS()};
        await c.tts.setMetadata(p.voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      }
      const {audioStream} = c.tts.toStream(p.say, {rate: p.rate, pitch: p.pitch});
      const chunks = [];
      await new Promise((ok, fail) => {
        const t = setTimeout(() => fail(new Error("timeout")), 30000);
        audioStream.on("data", d => chunks.push(d));
        audioStream.on("end", () => { clearTimeout(t); ok(); });
        audioStream.on("close", () => { clearTimeout(t); ok(); });
        audioStream.on("error", e => { clearTimeout(t); fail(e); });
      });
      const buf = Buffer.concat(chunks);
      if (buf.length < 1000) throw new Error("empty audio");
      return buf;
    } catch (e) {
      edgeClients[worker]?.tts.close(); edgeClients[worker] = null;
      if (attempt >= 4) throw e;
      await new Promise(r => setTimeout(r, 1500 * attempt));
    }
  }
}

const texts = collectTexts();
console.log(`engine: ${AZURE ? "Azure AI Speech" : "Edge read aloud (msedge-tts)"}`);

if (process.argv.includes("--samples")) {
  const dir = path.join(ROOT, "public", "voice-samples");
  fs.mkdirSync(dir, {recursive: true});
  for (const role of Object.keys(ROLES)) {
    const t = texts.filter(x => roleOf(x, LOOM) === role).sort((a, b) => Math.abs(a.length - 60) - Math.abs(b.length - 60))[0];
    if (!t) continue;
    fs.writeFileSync(path.join(dir, `${role}.mp3`), await tts(plan(t), 0));
    console.log(`${role} (${ROLES[role].name}): ${t.slice(0, 50)}`);
  }
  edgeClients.forEach(c => c?.tts.close());
  process.exit(0);
}

const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : {};
const todo = texts.filter(t => manifest[voiceKey(t)] !== signature(plan(t)) || !fs.existsSync(path.join(OUT, voiceKey(t) + ".mp3")));
const roles = {};
texts.forEach(t => { const r = roleOf(t, LOOM); roles[r] = (roles[r] ?? 0) + 1; });
console.log(`${texts.length} texts by role ${JSON.stringify(roles)}; ${todo.length} to render (${todo.reduce((n, s) => n + plan(s).say.length, 0)} characters)`);
if (dryRun) process.exit(0);
fs.mkdirSync(OUT, {recursive: true});
let done = 0, failed = 0;
const queue = [...todo];
await Promise.all(Array.from({length: 3}, async (_, worker) => {
  for (let t; (t = queue.shift()) !== undefined;) {
    const p = plan(t), k = voiceKey(t);
    try { fs.writeFileSync(path.join(OUT, k + ".mp3"), await tts(p, worker)); manifest[k] = signature(p); done++; }
    catch (e) { failed++; console.error(`✗ ${t.slice(0, 40)}… ${e.message}`); if (/Azure 40[13]/.test(e.message)) { queue.length = 0; } }
    if ((done + failed) % 50 === 0) console.log(`… ${done + failed}/${todo.length}`);
  }
}));
// index = keys that have a file; texts no longer in the lesson are dropped (their files are deleted)
const keys = new Set(texts.map(voiceKey).filter(k => fs.existsSync(path.join(OUT, k + ".mp3"))));
for (const f of fs.readdirSync(OUT)) if (f.endsWith(".mp3") && !keys.has(f.slice(0, -4))) fs.unlinkSync(path.join(OUT, f));
for (const k of Object.keys(manifest)) if (!keys.has(k)) delete manifest[k];
fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify([...keys].sort()));
fs.writeFileSync(MANIFEST, JSON.stringify(manifest));
console.log(`rendered ${done}, failed ${failed}, index has ${keys.size} files`);
edgeClients.forEach(c => c?.tts.close());
process.exit(failed ? 1 : 0);
