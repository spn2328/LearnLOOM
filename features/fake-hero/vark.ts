// VARK learning styles (ข้อมูลเว็บล่าสุด.pdf: "รองรับการเรียนรู้ผ่านภาพ เสียง การอ่านและเขียน และการลงมือปฏิบัติ
// โดยผู้เรียนเลือกสลับรูปแบบได้"). The preferred style reorders help in the adaptive paths; usage is
// counted so the learner and teacher can see which styles were actually used.
import {useEffect, useState} from "react";
import type {VarkKey, VarkUse} from "./game";
import {hasVoice, loadVoiceIndex, norm, voiceKey, voiceUrl} from "./voice";

export type {VarkKey};
export type VarkState = {pref?: VarkKey; how?: "quiz" | "choose"; use: VarkUse; quiz?: Record<string, VarkKey>; skipped?: boolean};
export const VARK_KEY = "learnloom-vark-v1";
const EVENT = "ll-vark";

export const VARK_INFO: Record<VarkKey, {icon: string; name: string; long: string; tip: string}> = {
  V: {icon: "👁️", name: "ภาพ", long: "Visual · ดูภาพ แผนภาพ แบบจำลอง", tip: "ลูมจะเปิดภาพช่วยจำและแบบจำลองให้ก่อน"},
  A: {icon: "🔊", name: "ฟัง", long: "Aural · ฟังลูมอ่านและอธิบาย", tip: "แตะข้อความใดก็ได้ ลูมจะอ่านให้ฟัง และอ่านบทเรื่องให้อัตโนมัติ"},
  R: {icon: "📖", name: "อ่าน-เขียน", long: "Read/Write · อ่านสรุปและจดบันทึก", tip: "เปิดบทเต็ม ข้อความสรุป และช่องจดโน้ตให้ก่อน"},
  K: {icon: "✋", name: "ลงมือทำ", long: "Kinesthetic · แตะ ลาก ต่อ ประกอบ", tip: "เริ่มจากกิจกรรมลงมือทำก่อนอ่านคำอธิบาย"},
};
export const VARK_ORDER: VarkKey[] = ["V", "A", "R", "K"];

// Short picker quiz (written by Claude, not from the PDF); each choice points to one style.
export const VARK_QUIZ: {id: string; q: string; a: Record<VarkKey, string>}[] = [
  {id: "q1", q: "ถ้าต้องจำว่าพันธะคู่คืออะไร เธออยากได้อะไรที่สุด?", a: {V: "รูปวาดคู่อิเล็กตรอนระหว่างคาร์บอน", A: "ให้ใครสักคนอธิบายให้ฟัง", R: "สรุปสั้น ๆ เป็นข้อความ", K: "ได้ลองต่อพันธะเอง"}},
  {id: "q2", q: "เวลาเล่นเกมใหม่ เธอเริ่มยังไง?", a: {V: "ดูภาพตัวอย่างหรือคลิป", A: "ฟังเพื่อนเล่าวิธีเล่น", R: "อ่านคู่มือก่อน", K: "กดเล่นเลย ลองผิดลองถูก"}},
  {id: "q3", q: "เวลาทบทวนก่อนสอบ เธอชอบ…", a: {V: "ทำ mind map หรือแผนภาพสี ๆ", A: "อ่านออกเสียงหรือคุยกับเพื่อน", R: "จดสรุปเป็นข้อ ๆ", K: "ทำโจทย์หรือทดลองจริง"}},
];

const blank = (): VarkState => ({use: {}});
export function readVark(): VarkState {
  try { return {...blank(), ...JSON.parse(localStorage.getItem(VARK_KEY) || "{}")}; } catch { return blank(); }
}
function write(s: VarkState) {
  try { localStorage.setItem(VARK_KEY, JSON.stringify(s)); } catch {}
  window.dispatchEvent(new Event(EVENT));
}
export function setVarkPref(pref: VarkKey, how: "quiz" | "choose", quiz?: Record<string, VarkKey>) {
  const s = readVark();
  write({...s, pref, how, ...(quiz ? {quiz} : {}), use: {...s.use, [pref]: (s.use[pref] ?? 0) + 1}});
}
export function skipVarkQuiz() { write({...readVark(), skipped: true}); }
export function markVark(k: VarkKey) {
  const s = readVark();
  write({...s, use: {...s.use, [k]: (s.use[k] ?? 0) + 1}});
}
export function quizResult(ans: Record<string, VarkKey>): VarkKey {
  const n: Partial<Record<VarkKey, number>> = {};
  Object.values(ans).forEach(k => { n[k] = (n[k] ?? 0) + 1; });
  return VARK_ORDER.reduce((best, k) => (n[k] ?? 0) > (n[best] ?? 0) ? k : best, Object.values(ans)[0] ?? "K");
}

export function useVark(): VarkState {
  const [s, setS] = useState<VarkState>(blank);
  useEffect(() => {
    const on = () => setS(readVark());
    on();
    window.addEventListener(EVENT, on); window.addEventListener("storage", on);
    return () => { window.removeEventListener(EVENT, on); window.removeEventListener("storage", on); };
  }, []);
  return s;
}

// ---- read aloud (Web Speech API, works offline when the device has a Thai voice)
export const canSpeak = () => typeof window !== "undefined" && "speechSynthesis" in window;
export function hasThaiVoice() { return canSpeak() && speechSynthesis.getVoices().some(v => v.lang.toLowerCase().startsWith("th")); }
// Parts are read one after another: a pre-rendered Thai AI voice file when there is one (voice.ts),
// otherwise the device voice. Passing fixed texts as separate parts lets each one find its file.
let audio: HTMLAudioElement | null = null;
let run = 0;
export function speak(text: string | string[], onEnd?: () => void) {
  const parts = (Array.isArray(text) ? text : [text]).map(norm).filter(Boolean);
  if (typeof window === "undefined" || !parts.length || (!canSpeak() && !parts.some(hasVoice))) { onEnd?.(); return false; }
  stopSpeak();
  const me = ++run;
  const next = (i: number) => {
    if (me !== run) return;
    if (i >= parts.length) { onEnd?.(); return; }
    const p = parts[i], go = () => next(i + 1);
    if (hasVoice(p)) {
      // file missing or blocked: read this part with the device voice instead (error and play() both report it)
      let fell = false;
      const fallback = () => { if (me === run && !fell) { fell = true; device(p, go); } };
      audio = new Audio(voiceUrl(voiceKey(p)));
      audio.onended = go;
      audio.onerror = fallback;
      audio.play().catch(e => { if ((e as Error).name !== "AbortError") fallback(); });
    } else device(p, go);
  };
  next(0);
  return true;
}
function device(text: string, done: () => void) {
  if (!canSpeak()) { done(); return; }
  const u = new SpeechSynthesisUtterance(text.replace(/[–=≡]/g, m => ({"–": " พันธะเดี่ยว ", "=": " พันธะคู่ ", "≡": " พันธะสาม "})[m]!));
  u.lang = "th-TH"; u.rate = 0.95;
  const th = speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith("th"));
  if (th) u.voice = th;
  u.onend = done; u.onerror = done;
  speechSynthesis.speak(u);
}
export function stopSpeak() {
  run++;
  if (audio) { audio.onended = audio.onerror = null; audio.pause(); audio = null; }
  if (canSpeak()) speechSynthesis.cancel();
}
// Text of an element as parts: whole text when it has a voice file, else its direct children one by one
// (e.g. "<strong>A.</strong> choice" -> "ตัวเลือก A", choice).
export function textParts(el: Element): string[] {
  const all = norm((el as HTMLElement).innerText ?? el.textContent ?? "");
  if (hasVoice(all) || !el.childNodes.length) return [all];
  return [...el.childNodes].map(n => norm(n.textContent ?? "")).filter(Boolean).map(t => /^[A-D]\.$/.test(t) ? `ตัวเลือก ${t[0]}` : t);
}
export const canListen = () => canSpeak() || aiVoiceReady();
const aiVoiceReady = () => hasVoice("ตัวเลือก A");
// Thai voice available: the pre-rendered AI voice, or a Thai voice installed on the device.
// null = not known yet (voices and the voice index load asynchronously).
export function useThaiVoice(): boolean | null {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    void loadVoiceIndex().then(() => { if (live && aiVoiceReady()) setOk(true); });
    if (!canSpeak()) { const t = setTimeout(() => setOk(o => o ?? aiVoiceReady()), 1500); return () => { live = false; clearTimeout(t); }; }
    const check = () => { if (aiVoiceReady()) setOk(true); else if (speechSynthesis.getVoices().length) setOk(hasThaiVoice()); };
    check(); speechSynthesis.addEventListener("voiceschanged", check);
    const t = setTimeout(() => setOk(o => o ?? hasThaiVoice()), 2500);
    return () => { live = false; speechSynthesis.removeEventListener("voiceschanged", check); clearTimeout(t); };
  }, []);
  return ok;
}
export const NO_THAI_VOICE = "เครื่องนี้ยังไม่มีเสียงอ่านภาษาไทย ถ้าฟังไม่ชัด ให้เพิ่มเสียงภาษาไทยในการตั้งค่าเครื่อง (Windows: เวลาและภาษา › คำพูด, Android/iOS: การอ่านออกเสียง) หรือเปิดข้อความอ่านแทน";
export const NO_THAI_SHORT = "⚠️ เครื่องนี้ยังไม่มีเสียงไทย อาจฟังไม่ชัด (วิธีเพิ่มเสียงดูที่ปุ่มสไตล์เรียน)";
