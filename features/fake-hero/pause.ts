// Pause / autosave / resume for the EP.01 flow.
// - Study time counts only while the lesson is open, visible and not paused.
// - Drafts keep what the learner has picked or typed but not yet submitted (and the story line they
//   are on), so leaving the page never loses work. Submitted answers stay in the lesson save keys.
// Both keys start with "learnloom-", so cloud/sync.ts uploads them with the rest of the progress.
import {useEffect, useState} from "react";

const STUDY_KEY = "learnloom-study-time-v1";
const DRAFT_KEY = "learnloom-drafts-v1";
const LESSON_KEY = "learnloom-fake-hero-v1";
const EXT_KEY = "learnloom-fake-hero-ep01-extension-v1";

const read = <T,>(k: string): T | null => { try { return JSON.parse(localStorage.getItem(k) ?? "null"); } catch { return null; } };
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// ---- drafts: in memory, written to localStorage shortly after a change and at once when the page hides
let drafts: Record<string, unknown> | null = null;
let dirty = false;
let saveTimer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();
const all = () => (drafts ??= read<Record<string, unknown>>(DRAFT_KEY) ?? {});
export function saveDrafts() {
  clearTimeout(saveTimer);
  if (!dirty) return;
  dirty = false;
  write(DRAFT_KEY, all());
}
function setDraft(id: string, v: unknown) {
  const d = {...all()};
  if (v === undefined) delete d[id]; else d[id] = v;
  drafts = d; dirty = true;
  clearTimeout(saveTimer); saveTimer = setTimeout(saveDrafts, 600);
  listeners.forEach(f => f());
}
/** Like useState, but kept across reloads under `id` until the learner restarts the case. */
export function useDraft<T>(id: string, init: T): [T, (v: T) => void] {
  const [, force] = useState(0);
  useEffect(() => { const f = () => force(n => n + 1); listeners.add(f); return () => { listeners.delete(f); }; }, []);
  const d = all();
  return [(id in d ? d[id] : init) as T, (v: T) => setDraft(id, v)];
}
/** Restarting the case clears drafts so old picks do not reappear. */
export function clearDrafts() {
  clearTimeout(saveTimer);
  drafts = {}; dirty = false;
  try { localStorage.removeItem(DRAFT_KEY); } catch {}
  listeners.forEach(f => f());
}

// ---- study time
type Study = {seconds: number; at?: string};
export const readStudy = (): Study => ({seconds: 0, ...read<Study>(STUDY_KEY)});
export function addStudy(seconds: number) {
  if (seconds <= 0) return;
  const s = readStudy();
  write(STUDY_KEY, {seconds: Math.round(s.seconds + seconds), at: new Date().toISOString()});
}
export const studyText = (sec: number) => sec < 60 ? "ไม่ถึง 1 นาที" : sec < 3600 ? `${Math.floor(sec / 60)} นาที` : `${Math.floor(sec / 3600)} ชั่วโมง ${Math.floor((sec % 3600) / 60)} นาที`;

// ---- where the learner stopped, read from the lesson save keys
const C01_PAGES: Record<string, string> = {
  inspect: "A01 ตรวจหลักฐานจากคลิป", s01: "S01 ตรวจหลักฐาน", testimony: "Scene 02 คำให้การของเจฟ", notebook: "A02 สมุดหลักฐาน",
  learn: "Scene 03 · L01 บทเรียน", sort: "A03 จัดแฟ้มสาร", question: "Q01 คำถามหลัก", reason: "Q01 คำถามหลัก",
  diagnose: "บทช่วย C01", remedy: "R01 เรียนเสริม", recheck: "RC01 ตรวจซ้ำ", summary: "สรุปผล C01",
};
const EXT_STEPS: Record<string, string> = {
  story: "เนื้อเรื่อง", learn: "บทเรียน", activity: "กิจกรรม", main: "คำถามหลัก", reason: "คำถามหลัก", support: "บทช่วย",
  practice: "แบบฝึก", recheck: "ตรวจซ้ำ", report: "สรุปผล",
};
const EXT_END: Record<string, string> = {
  evidence: "Scene 08 แฟ้มคดีที่ยังปิดไม่ได้", s02: "S02 คำถามสืบสวน", checkpoint: "Episode Checkpoint", transfer: "Transfer Checkpoint", ending: "รายงานผล EP.01",
};
/** "EP.01 · …" for the place the learner stopped, or null when nothing has started yet. */
export function lastPlace(): string | null {
  const p = read<{page?: string}>(LESSON_KEY);
  if (!p?.page) return null;
  if (p.page === "continued") {
    const e = read<{unit?: number; step?: string}>(EXT_KEY);
    if (!e?.step) return "EP.01 · C02 พันธะของคาร์บอน";
    return `EP.01 · ${EXT_END[e.step] ?? `C0${(e.unit ?? 1) + 1} ${EXT_STEPS[e.step] ?? ""}`.trim()}`;
  }
  if (p.page === "intro") return Number(all()["story:Scene 01"] ?? 0) > 0 ? "EP.01 · Scene 01 คลิปที่ทุกคนเชื่อ" : null;
  return `EP.01 · ${C01_PAGES[p.page] ?? p.page}`;
}
