// Collects every fixed Thai text the site can read aloud (string literals and JSX text in the Fake Hero
// feature) so scripts/gen-voice.mjs can pre-render them with an AI Thai voice.
import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIRS = ["features/fake-hero", "features/fake-hero/content", "features/fake-hero/components"];
const THAI = /[฀-๿]/;

// Must match norm() / voiceKey() in features/fake-hero/voice.ts (checked by scripts/test-fake-hero.mjs)
export const norm = s => s.replace(/\s+/g, " ").trim();
export function voiceKey(s) {
  const str = norm(s);
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
}

export function collectTexts() {
  const out = new Set();
  for (const d of DIRS) for (const f of fs.readdirSync(path.join(ROOT, d))) {
    if (!/\.(ts|tsx)$/.test(f)) continue;
    const src = fs.readFileSync(path.join(ROOT, d, f), "utf8").replace(/^\s*\/\/.*$/gm, "");
    // "..." '...' and `...` without ${}
    for (const m of src.matchAll(/"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'|`([^`$]*)`/g)) {
      const s = (m[1] ?? m[2] ?? m[3] ?? "").replace(/\\n/g, " ").replace(/\\(.)/g, "$1");
      if (THAI.test(s)) out.add(norm(s));
    }
    // JSX text between tags
    if (f.endsWith(".tsx")) for (const m of src.matchAll(/>([^<>{}]+)</g)) if (THAI.test(m[1])) out.add(norm(m[1]));
  }
  // choice prefix spoken before each choice
  for (const l of "ABCD") out.add(`ตัวเลือก ${l}`);
  // drop code fragments caught between unrelated quotes
  return [...out].filter(s => s.length > 1 && !/[{}]|=>|<\/|className|=\{/.test(s));
}

// Texts Loom says (speech bubbles, hints): lesson notes, literals in loom={...}, JSX text inside <Loom>
export function loomTexts() {
  const out = new Set();
  const lit = /"((?:[^"\\\n]|\\.)*)"/g;
  for (const d of DIRS) for (const f of fs.readdirSync(path.join(ROOT, d))) {
    if (!/\.(ts|tsx)$/.test(f)) continue;
    const src = fs.readFileSync(path.join(ROOT, d, f), "utf8");
    for (const m of src.matchAll(/\bnote:\s*"((?:[^"\\\n]|\\.)*)"/g)) out.add(norm(m[1]));
    for (const m of src.matchAll(/\bloom=\{([^}]*)\}/g)) for (const s of m[1].matchAll(lit)) out.add(norm(s[1]));
    for (const m of src.matchAll(/<Loom\b[^>]*>([^<{]+)/g)) out.add(norm(m[1]));
  }
  return out;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const t = collectTexts();
  console.log(`${t.length} texts, ${t.reduce((n, s) => n + s.length, 0)} characters`);
}
