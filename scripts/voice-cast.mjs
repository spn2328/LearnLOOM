// Voice casting for the pre-rendered Thai voice (scripts/gen-voice.mjs). Only two Thai neural voices exist
// (Premwadee, Niwat), so characters are told apart by pitch and speed. Edit a role here and re-run
// `pnpm gen:voice`: only the lines whose voice changed are rendered again.
export const ROLES = {
  narrator: {name: "ผู้บรรยาย", voice: "th-TH-PremwadeeNeural", rate: "-6%", pitch: "-4%"},
  loom:     {name: "ลูม",       voice: "th-TH-PremwadeeNeural", rate: "+6%", pitch: "+16%"},
  player:   {name: "ผู้เล่น",    voice: "th-TH-NiwatNeural",     rate: "+6%", pitch: "+12%"},
  jeff:     {name: "เจฟ",       voice: "th-TH-NiwatNeural",     rate: "-4%", pitch: "-2%"},
  hia:      {name: "เฮียศักดิ์",  voice: "th-TH-NiwatNeural",     rate: "-8%", pitch: "-16%"},
  villager: {name: "ชาวบ้าน",    voice: "th-TH-NiwatNeural",     rate: "+10%", pitch: "-8%"},
  mom:      {name: "แม่",       voice: "th-TH-PremwadeeNeural", rate: "-10%", pitch: "-10%"},
  clip:     {name: "เสียงในคลิป", voice: "th-TH-NiwatNeural",     rate: "+14%", pitch: "+4%"},
};
const SPEAKERS = {"ลูม": "loom", "ผู้เล่น": "player", "เจฟ": "jeff", "เฮียศักดิ์": "hia", "ชาวบ้าน": "villager", "แม่": "mom"};
const LABEL = /^(ลูม|ผู้เล่น|เจฟ|ชาวบ้าน|เฮียศักดิ์|แม่|SFX)\s*:\s*/;

// Which role reads a text: "Name: line" -> that character; quoted on-screen messages -> mom / the clip;
// everything else (narration, lessons, buttons) -> narrator.
// loom = texts shown in Loom's speech bubble (loomTexts() in voice-texts.mjs).
export function roleOf(text, loom = new Set()) {
  const m = LABEL.exec(text);
  if (m) return SPEAKERS[m[1]] ?? "narrator";
  if (loom.has(text)) return "loom";
  if (/^[“"]/.test(text)) return /แม่(?!น้ำ)/.test(text) ? "mom" : "clip";
  return "narrator";
}

// What the voice actually says (the file key stays the on-screen text), XML-escaped for SSML.
const SUB = "₀₁₂₃₄₅₆₇₈₉";
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export function spokenText(text) {
  const s = text
    .replace(LABEL, "")
    .replace(/\p{Extended_Pictographic}|️|[✕✓⠿]/gu, "")
    .replace(/[₀-₉]/g, c => String(SUB.indexOf(c)))
    // bond symbols are read by their look, not their name, so the voice never gives an answer away
    .replace(/\s*([–=≡])\s*(?=[A-Z(\s])/g, (_, b) => ({"–": " ขีดเดี่ยว ", "=": " ขีดคู่ ", "≡": " ขีดสาม "})[b])
    .replace(/\s*→\s*/g, " แล้วไปที่ ")
    .replace(/(?<=[฀-๿])\s*\/\s*(?=[฀-๿])/g, " หรือ ")
    .replace(/\bXP\b/g, "เอ็กซ์พี").replace(/\bEP\.?\s?0?(\d)/g, "อีพี $1")
    .replace(/[“”"«»]/g, "")
    .replace(/\s+/g, " ").trim();
  // natural pauses from punctuation (the Edge service rejects SSML <break> tags)
  return esc(s.replace(/\.\.\./g, "…").replace(/\s*·\s*/g, ", ").replace(/…(?=\S)/g, "… "));
}
