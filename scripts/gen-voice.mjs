// Pre-renders every fixed Thai lesson text as an MP3 with Microsoft neural Thai voices.
// Engine: Azure AI Speech when AZURE_SPEECH_KEY / AZURE_SPEECH_REGION are in .env.local (gitignored),
// otherwise the Edge "Read aloud" service via msedge-tts (no key; unofficial, may stop working).
// Only lesson text from the source files is sent to Microsoft, never learner data. Existing files are kept,
// so re-running only renders new or changed lines. Output: public/voice/<key>.mp3 + public/voice/index.json
import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";
import {collectTexts, voiceKey} from "./voice-texts.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "voice");
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
const FEMALE = env.AZURE_VOICE_FEMALE || "th-TH-PremwadeeNeural";
const MALE = env.AZURE_VOICE_MALE || "th-TH-NiwatNeural";
const MALE_SPEAKERS = /^(เจฟ|เฮียศักดิ์|ชาวบ้าน)\s*:/;
const dryRun = process.argv.includes("--dry-run");

// what the voice should say (the file key stays the on-screen text)
const SUB = "₀₁₂₃₄₅₆₇₈₉";
const spoken = s => s
  .replace(/[₀-₉]/g, c => String(SUB.indexOf(c)))
  .replace(/[–=≡]/g, m => ({"–": " พันธะเดี่ยว ", "=": " พันธะคู่ ", "≡": " พันธะสาม "})[m])
  .replace(/[“”"]/g, "").replace(/\s+/g, " ").trim();
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const ssml = (text, voice) => `<speak version="1.0" xml:lang="th-TH"><voice name="${voice}"><prosody rate="-5%">${esc(spoken(text))}</prosody></voice></speak>`;

async function tts(text, worker) {
  const voice = MALE_SPEAKERS.test(text) ? MALE : FEMALE;
  if (!AZURE) return edge(text, voice, worker);
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: {"Ocp-Apim-Subscription-Key": KEY, "Content-Type": "application/ssml+xml", "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3", "User-Agent": "learnloom-gen-voice"},
      body: ssml(text, voice),
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if ((res.status === 429 || res.status >= 500) && attempt < 6) { await new Promise(r => setTimeout(r, 1000 * 2 ** attempt)); continue; }
    throw new Error(`Azure ${res.status} ${res.statusText}: ${(await res.text()).slice(0, 200)}`);
  }
}

// one Edge connection per worker, reopened after an error
const edgeClients = [];
async function edge(text, voice, worker) {
  const {MsEdgeTTS, OUTPUT_FORMAT} = await import("msedge-tts");
  for (let attempt = 1; ; attempt++) {
    try {
      let c = edgeClients[worker];
      if (!c || c.voice !== voice) {
        c?.tts.close();
        c = edgeClients[worker] = {voice, tts: new MsEdgeTTS()};
        await c.tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      }
      const {audioStream} = c.tts.toStream(esc(spoken(text)), {rate: "-5%"});
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
const todo = texts.filter(t => !fs.existsSync(path.join(OUT, voiceKey(t) + ".mp3")));
console.log(`engine: ${AZURE ? "Azure AI Speech" : "Edge read aloud (msedge-tts)"}`);
console.log(`${texts.length} texts, ${todo.length} to render (${todo.reduce((n, s) => n + spoken(s).length, 0)} characters)`);
if (dryRun) process.exit(0);
fs.mkdirSync(OUT, {recursive: true});
let done = 0, failed = 0;
const queue = [...todo];
await Promise.all(Array.from({length: 3}, async (_, worker) => {
  for (let t; (t = queue.shift()) !== undefined;) {
    try { fs.writeFileSync(path.join(OUT, voiceKey(t) + ".mp3"), await tts(t, worker)); done++; }
    catch (e) { failed++; console.error(`✗ ${t.slice(0, 40)}… ${e.message}`); if (/Azure 40[13]/.test(e.message)) { queue.length = 0; } }
    if ((done + failed) % 50 === 0) console.log(`… ${done + failed}/${todo.length}`);
  }
}));
// index = keys that have a file; texts no longer in the lesson are dropped from the index (files are left alone)
const keys = texts.map(voiceKey).filter(k => fs.existsSync(path.join(OUT, k + ".mp3")));
fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify([...new Set(keys)].sort()));
console.log(`rendered ${done}, failed ${failed}, index has ${keys.length} files`);
edgeClients.forEach(c => c?.tts.close());
process.exit(failed ? 1 : 0);
