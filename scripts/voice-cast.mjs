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

// Chemical formulas: element letters by their English names, subscripts as Thai numbers
// (Na₂CO₃ "เอ็นเอสอง ซีโอสาม"). Bond symbols are read by
// their look ("ขีดคู่"), not their name, so the voice never gives an answer away.
const SUB = "₀₁₂₃₄₅₆₇₈₉";
const ELEMENTS = new Set("H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr".split(" "));
const LETTER = {A: "เอ", B: "บี", C: "ซี", D: "ดี", E: "อี", F: "เอฟ", G: "จี", H: "เอช", I: "ไอ", J: "เจ", K: "เค", L: "แอล", M: "เอ็ม", N: "เอ็น", O: "โอ", P: "พี", Q: "คิว", R: "อาร์", S: "เอส", T: "ที", U: "ยู", V: "วี", W: "ดับเบิลยู", X: "เอ็กซ์", Y: "วาย", Z: "แซด"};
// subscripts as Thai numbers (owner's choice): CH₄ "ซีเอชสี่", C₆H₁₂O₆ "ซีหก เอชสิบสอง โอหก"
const DIGIT = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
const thai = n => n < 10 ? DIGIT[n] : (n >= 20 ? (n >= 30 ? DIGIT[Math.floor(n / 10)] : "ยี่") : "") + "สิบ" + (n % 10 === 1 ? "เอ็ด" : DIGIT[n % 10]);
const BOND = {"–": " ขีดเดี่ยว ", "=": " ขีดคู่ ", "≡": " ขีดสาม "};
// whole runs only (no backtracking "CP01" -> "C"); a run touching a digit or hyphen is an id, not a formula
const FORMULA = /(?<![0-9A-Za-z-])(?:\(\?\)|[A-Za-z₀-₉()–=≡])+/g;
function formula(tok) {
  let t = tok;
  const n = c => t.split(c).length - 1;
  while (t.startsWith("(") && n("(") > n(")")) t = t.slice(1);
  while (t.endsWith(")") && n(")") > n("(")) t = t.slice(0, -1);
  while (t.startsWith(")")) t = t.slice(1);
  if (/^\([^()]*\)$/.test(t)) t = t.slice(1, -1);
  const atoms = t.replace(/\(\?\)|[()₀-₉–=≡]/g, "");
  if (!atoms || !/^(?:[A-Z][a-z]?)+$/.test(atoms) || !atoms.match(/[A-Z][a-z]?/g).every(e => ELEMENTS.has(e))) return null;
  const say = t.replace(/\(\?\)|[A-Z][a-z]?|[₀-₉]+|[()–=≡]/g, m =>
    m === "(?)" ? " วงเล็บ เครื่องหมายคำถาม ปิดวงเล็บ " :
    m === "(" ? " วงเล็บ " : m === ")" ? " ปิดวงเล็บ " : BOND[m] ??
    (/[₀-₉]/.test(m) ? thai(Number([...m].map(c => SUB.indexOf(c)).join(""))) + " " : [...m].map(c => LETTER[c.toUpperCase()]).join("")));
  return ` ${say} `;
}
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export function spokenText(text) {
  const s = text
    .replace(LABEL, "")
    .replace(/\p{Extended_Pictographic}|️|[✕✓⠿]/gu, "")
    .replace(FORMULA, (tok, i, all) => (/[0-9-]/.test(all[i + tok.length] ?? "") ? null : formula(tok)) ?? tok)
    // symbols written alone: named as a symbol ("เครื่องหมาย = …", "–, =, ≡"), in arithmetic, or a range (C02–C05)
    .replace(/(^|\s)([–=≡])(?=\s*(?:,|และ|$|\s(?:ระหว่าง|คือ|เป็น|แต่|กับ)))/g, (_, a, b) => a + BOND[b])
    .replace(/(เครื่องหมาย|เห็น|ว่า)\s*([–=≡])(?=\s)/g, (_, a, b) => a + BOND[b])
    .replace(/(?<=[0-9A-Za-z])\s*–\s*(?=[0-9A-Za-z])/g, " ถึง ")
    .replace(/\s=\s/g, " เท่ากับ ").replace(/\s[−-]\s/g, " ลบ ").replace(/\s\+\s/g, " บวก ")
    .replace(/[₀-₉]/g, c => String(SUB.indexOf(c)))
    .replace(/\s*→\s*/g, " แล้วไปที่ ")
    .replace(/(?<=[฀-๿])\s*\/\s*(?=[฀-๿])/g, " หรือ ")
    .replace(/\bXP\b/g, "เอ็กซ์พี").replace(/\bEP\.?\s?0?(\d)/g, "อีพี $1")
    .replace(/[“”"«»]/g, "")
    .replace(/\s+/g, " ").trim();
  // natural pauses from punctuation (the Edge service rejects SSML <break> tags)
  return esc(s.replace(/\.\.\./g, "…").replace(/\s*·\s*/g, ", ").replace(/…(?=\S)/g, "… "));
}
