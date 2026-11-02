// Pre-rendered Thai AI voice (Azure neural TTS, made by scripts/gen-voice.mjs into /voice/<key>.mp3).
// Every fixed lesson text has its own file, so it sounds the same on every device and works offline once
// cached. Text without a file (names, numbers typed by the learner) falls back to the device voice.

// Must match norm() / voiceKey() in scripts/voice-texts.mjs (checked by scripts/test-fake-hero.mjs)
export const norm = (s: string) => s.replace(/\s+/g, " ").trim();
export function voiceKey(s: string) {
  const str = norm(s);
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
}

let index: Set<string> | null = null;
let loading: Promise<Set<string>> | null = null;
export function loadVoiceIndex() {
  if (index) return Promise.resolve(index);
  loading ??= fetch("/voice/index.json").then(r => r.ok ? r.json() : []).catch(() => [])
    .then((keys: unknown) => (index = new Set(Array.isArray(keys) ? keys as string[] : [])));
  return loading;
}
export const voiceUrl = (key: string) => `/voice/${key}.mp3`;
export const hasVoice = (text: string) => !!index?.has(voiceKey(text));
export async function voiceFiles() { return [...await loadVoiceIndex()].map(k => voiceUrl(k)); }
if (typeof window !== "undefined") void loadVoiceIndex();
