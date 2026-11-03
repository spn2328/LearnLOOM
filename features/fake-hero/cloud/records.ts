// Pure helpers that turn the learner's local result into database rows (no browser or network use),
// so they can be unit-tested with plain Node.
import type {StudentResult} from "../results";

export type EventKind = "main" | "reason" | "diagnosis" | "practice" | "practice_retry" | "recheck" | "recheck_b" | "checkpoint" | "checkpoint_reason" | "transfer";
export type EventRow = {id: string; attempt_id: string; user_id: string; concept: string | null; item_id: string; kind: EventKind; value: string; correct: boolean | null; recorded_at: string};
export type ConceptRow = {attempt_id: string; user_id: string; concept: string; outcome: string; path: string | null; detail: Record<string, unknown>; updated_at: string};
/** Answer keys the caller looks up from the content files (kept out of here so this file stays pure). */
export type Keys = {main: Record<string, string>; reason: Record<string, string>; checkpoint: Record<string, string>; checkpointReason: Record<string, string>};

/** 64-bit FNV-1a, hex. Stable across devices, so the same answer always maps to the same event id. */
export function stableId(text: string): string {
  let h = BigInt("0xcbf29ce484222325");
  const prime = BigInt("0x100000001b3");
  for (const b of new TextEncoder().encode(text)) h = BigInt.asUintN(64, (h ^ BigInt(b)) * prime);
  return "e" + h.toString(16).padStart(16, "0");
}

/** Every answer in the result becomes one append-only event. Same attempt + item + kind + value → same id. */
export function eventsFrom(r: StudentResult, keys: Keys, attemptId: string, userId: string, now: string): EventRow[] {
  const out: EventRow[] = [];
  const add = (concept: string | null, item: string, kind: EventKind, value: unknown, answer?: string) => {
    if (value === undefined || value === null || value === "") return;
    const v = String(value);
    out.push({id: stableId(`${attemptId}|${kind}|${item}|${v}`), attempt_id: attemptId, user_id: userId, concept, item_id: item, kind, value: v,
      correct: answer === undefined ? null : v === answer, recorded_at: now});
  };
  for (const c of r.concepts) {
    const q = c.id.replace("C", "Q");
    add(c.id, q, "main", c.firstMain, keys.main[q]);
    add(c.id, `${q}-E`, "reason", c.firstReason, keys.reason[q]);
    for (const [item, v] of Object.entries(c.diagnosis ?? {})) add(c.id, item, "diagnosis", v);
    for (const [item, v] of Object.entries(c.practice ?? {})) add(c.id, item, "practice", v);
    for (const [item, v] of Object.entries(c.practiceRetry ?? {})) add(c.id, item, "practice_retry", v);
    add(c.id, `RC${q.slice(1)}`, "recheck", c.recheck);
    add(c.id, `RC${q.slice(1)}-B`, "recheck_b", c.recheckB);
    add(c.id, `T${q.slice(1)}`, "transfer", c.transfer);
  }
  for (const [item, v] of Object.entries(r.checkpoint.answers)) add(null, item, "checkpoint", v, keys.checkpoint[item]);
  for (const [item, v] of Object.entries(r.checkpoint.reasons)) add(null, item, "checkpoint_reason", v, keys.checkpointReason[item]);
  add(null, "EP01-transfer", "transfer", r.transfer);
  return out;
}

export type Route = "both" | "reason" | "answer";
// Path letters follow adaptiveUnits.pickPath: one wrong diagnosis group picks that path, two or more pick D, none picks C.
const PATH_REASON: Record<string, string> = {
  A: "ข้อวินิจฉัยกลุ่ม A ผิด จึงช่วยด้วยเส้นทาง A (Bloom L1)",
  B: "ข้อวินิจฉัยกลุ่ม B ผิด จึงช่วยด้วยเส้นทาง B (Bloom L2)",
  C: "ข้อวินิจฉัยไม่ผิดกลุ่มใด จึงฝึกนำไปใช้ด้วยเส้นทาง C (Bloom L3)",
  D: "ข้อวินิจฉัยผิดตั้งแต่ 2 กลุ่มขึ้นไป จึงช่วยด้วยเส้นทาง D (L1 → L2 → L3)",
};
/** Flowchart split on the first try: answer+reason right / answer right but reason wrong / answer wrong. */
export function routeOf(c: StudentResult["concepts"][number], keys: Keys): {route: Route; routeReason: string} | null {
  const q = c.id.replace("C", "Q");
  if (c.firstMain === undefined) return null;
  const mainOk = c.firstMain === keys.main[q], reasonOk = c.firstReason === keys.reason[q];
  const route: Route = mainOk && reasonOk ? "both" : mainOk ? "reason" : "answer";
  const head = route === "both" ? "ตอบถูกและให้เหตุผลถูกตั้งแต่ครั้งแรก จึงไปต่อได้เลย"
    : route === "reason" ? "ตอบถูกแต่เหตุผลยังไม่ถูก จึงส่งไปวินิจฉัยความเข้าใจที่คลาดเคลื่อน"
    : "คำตอบยังไม่ถูก จึงส่งไปวินิจฉัยความเข้าใจที่คลาดเคลื่อน";
  return {route, routeReason: [head, c.path ? PATH_REASON[c.path] : ""].filter(Boolean).join(" · ")};
}

/** The route each concept took and why, as currently computed (updated in place as the learner moves on). */
export function conceptsFrom(r: StudentResult, keys: Keys, attemptId: string, userId: string, now: string): ConceptRow[] {
  return r.concepts.filter(c => c.outcome !== "ยังไม่ได้ทำ").map(c => ({
    attempt_id: attemptId, user_id: userId, concept: c.id, outcome: c.outcome, path: c.path ?? null, updated_at: now,
    detail: {firstCorrect: c.firstCorrect, assisted: c.assisted, recheckCorrect: c.recheckCorrect, helpSwitches: c.helpSwitches ?? [], ...routeOf(c, keys)},
  }));
}

/** True once the learner has answered anything in this run. */
export function hasAnswers(r: StudentResult): boolean {
  return r.concepts.some(c => c.firstMain !== undefined) || Object.keys(r.checkpoint.answers).length > 0;
}
