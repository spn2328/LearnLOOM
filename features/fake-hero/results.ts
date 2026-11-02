// Result file a student downloads and hands to the teacher (no server needed).
// Built from the two Fake Hero saves; the teacher view imports many of these files.
import {lessons,checkpoint,checkpointReasons,type Choice} from "./content/episode01";
import {recheckB} from "./content/adaptive04";
import {adaptiveUnits} from "./content/adaptiveUnits";

export const RESULT_FORMAT = "learnloom-fake-hero-result";
const C01_KEY = "learnloom-fake-hero-v1";
const EXT_KEY = "learnloom-fake-hero-ep01-extension-v1";
const PROFILE_KEY = "learnloom-demo-v1";

export type ConceptResult = {
  id: string;
  firstMain?: string; // choice letter (Q03 drag may store an arrangement that matches no choice)
  firstReason?: Choice;
  firstCorrect: boolean; // answer AND reason right on the first attempt
  assisted: boolean;
  recheck?: Choice;
  recheckCorrect: boolean;
  path?: string; // adaptive help path A–D
  diagnosis?: Record<string, Choice>; // adaptive diagnostic answers (D0x-n; D01–D04 in older Q04 saves)
  recheckB?: Choice;
  transfer?: string; // free-text answer to the transfer / confirm-understanding item
  outcome: "ผ่านด้วยตนเอง" | "ผ่านหลังช่วยเหลือ" | "ยังต้องทบทวน" | "ยังไม่ได้ทำ";
};
export type StudentResult = {
  format: typeof RESULT_FORMAT;
  version: 1;
  episode: "EP.01";
  nickname: string;
  exportedAt: string;
  finished: boolean;
  concepts: ConceptResult[];
  checkpoint: {answers: Record<string, Choice>; reasons: Record<string, Choice>; answerScore: number; reasonScore: number; score: number};
  transfer: string;
};

function read(key: string): any {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? {}; } catch { return {}; }
}

// unit: the PDF adaptive record (AdaptiveUnit); adaptive: the older Q04 prototype record.
function concept(i: number, first?: {main?: string; reason?: Choice}, assisted = false, recheck?: Choice, adaptive?: any, unit?: any): ConceptResult {
  const l = lessons[i];
  const firstCorrect = first?.main === l.main.answer && first?.reason === l.reason.answer;
  const ud = adaptiveUnits[l.main.id.replace("Q", "C")];
  if (unit?.path && ud) { recheck = unit.recheck; adaptive = unit; }
  const recheckCorrect = unit?.path && ud
    ? unit.recheck === ud.recheck.answer || unit.recheckB === ud.recheckB.answer
    : recheck === l.recheck.answer || (!!adaptive?.recheckB && adaptive.recheckB === recheckB.answer);
  return {
    id: l.main.id.replace("Q", "C"),
    firstMain: first?.main, firstReason: first?.reason, firstCorrect,
    assisted, recheck, recheckCorrect,
    ...(adaptive?.path ? {path: adaptive.path, diagnosis: adaptive.diagnosis, recheckB: adaptive.recheckB, transfer: adaptive.transfer} : {}),
    outcome: !first?.main ? "ยังไม่ได้ทำ" : firstCorrect ? "ผ่านด้วยตนเอง" : recheckCorrect ? "ผ่านหลังช่วยเหลือ" : "ยังต้องทบทวน",
  };
}

export function buildResult(): StudentResult {
  const c01 = read(C01_KEY), ext = read(EXT_KEY), demo = read(PROFILE_KEY);
  const records = ext.records ?? {};
  const concepts = [
    concept(0, c01.first ? {main: c01.first.answer, reason: c01.first.reason} : undefined, !!c01.assisted, c01.recheck, undefined, c01.unit),
    ...lessons.slice(1).map((l, k) => {
      const r = records[l.main.id.replace("Q", "C")] ?? {};
      return concept(k + 1, r.first, !!r.assisted, r.adaptive?.recheck ?? r.recheck, r.adaptive, r.unit);
    }),
  ];
  const answers = ext.cp ?? {}, reasons = ext.cpReasons ?? {};
  const answerScore = checkpoint.filter(q => answers[q.id] === q.answer).length;
  const reasonScore = checkpointReasons.filter(q => reasons[q.id] === q.answer).length;
  return {
    format: RESULT_FORMAT, version: 1, episode: "EP.01",
    nickname: String(demo.profile?.nickname ?? "").trim() || "ไม่ระบุชื่อ",
    exportedAt: new Date().toISOString(),
    finished: ext.step === "ending",
    concepts,
    checkpoint: {answers, reasons, answerScore, reasonScore, score: answerScore + reasonScore},
    transfer: typeof ext.transfer === "string" ? ext.transfer : "",
  };
}

export function resultFileName(r: StudentResult) {
  const safe = r.nickname.replace(/[\\/:*?"<>|\s]+/g, "_").slice(0, 40);
  return `LearnLOOM-EP01-${safe}-${r.exportedAt.slice(0, 10)}.json`;
}

export function parseResult(text: string): StudentResult {
  const r = JSON.parse(text);
  if (r?.format !== RESULT_FORMAT || !Array.isArray(r.concepts) || !r.checkpoint) throw new Error("ไม่ใช่ไฟล์ผลการเรียน LearnLOOM");
  return r as StudentResult;
}
