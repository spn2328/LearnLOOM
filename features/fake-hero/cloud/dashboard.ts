// Dashboard numbers computed from the database rows (shared by the teacher and student views).
// Every formula shown on screen lives here, so what the teacher reads is what the code does.
// Pure (no browser, network or content imports) so scripts/test-db.mjs can check it with plain Node.

/** Retake weighting: attempt 1 = 100%, 2 = 90%, 3 = 80%, later attempts 70%. The first attempt is always shown on its own. */
export const SCORING = {steps: [1, 0.9, 0.8], floor: 0.7, checkpointMax: 10, pass: 0.7};
export const attemptWeight = (n: number) => SCORING.steps[n - 1] ?? SCORING.floor;
export const FORMULAS = [
  "ความคืบหน้า (%) = (แนวคิดที่ทำแล้ว + ข้อ Checkpoint ที่ตอบแล้ว) ÷ (5 + 5) × 100 · เรียนจบ = 100%",
  "คะแนน Checkpoint = คำตอบถูก (ข้อละ 1) + เหตุผลถูก (ข้อละ 1) เต็ม 10 · ผ่านเมื่อได้ 70% ขึ้นไป (7/10)",
  "คะแนนที่นับ = คะแนน Checkpoint × น้ำหนักครั้งที่ทำ (ครั้งที่ 1 = 100%, 2 = 90%, 3 = 80%, ครั้งต่อไป = 70%)",
  "คะแนนครั้งแรกเก็บแยกไว้เสมอ ทำใหม่ไม่ทับคะแนนครั้งแรก",
  "ผ่านด้วยตนเอง = ครั้งแรกตอบถูกทั้งคำตอบและเหตุผล · ผ่านหลังช่วยเหลือ = ตอบข้อตรวจซ้ำถูกหลังเรียนเส้นทางช่วยเหลือ",
  "ต้องติดตาม = มีแนวคิดที่ยังต้องทบทวน หรือเรียนจบแล้วแต่ Checkpoint ต่ำกว่า 7/10",
];

export type ConceptInfo = {id: string; title: string; main: {choices: string[]}; reason: {choices: string[]}};
export const ROUTE_LABEL: Record<string, string> = {both: "ถูกทั้งคำตอบและเหตุผล", reason: "คำตอบถูก แต่เหตุผลผิด", answer: "คำตอบผิด"};

export type AttemptRow = {id: string; user_id: string; number: number; started_at: string; finished_at: string | null};
export type ConceptRow = {attempt_id: string; user_id: string; concept: string; outcome: string; path: string | null; detail: {route?: string; routeReason?: string; helpSwitches?: unknown[]; [k: string]: unknown}};
export type EventRow = {attempt_id: string; user_id: string; concept: string | null; item_id: string; kind: string; value: string; correct: boolean | null; recorded_at: string};

export type AttemptSummary = {
  attempt: AttemptRow; concepts: ConceptRow[]; events: EventRow[];
  checkpoint: Record<string, {answer?: EventRow; reason?: EventRow}>;
  checkpointAnswered: number; checkpointScore: number; weighted: number; progress: number;
};
export type Status = "ยังไม่เริ่ม" | "กำลังเรียน" | "เรียนจบ" | "ต้องติดตาม";
export type StudentSummary = {id: string; nickname: string; attempts: AttemptSummary[]; first?: AttemptSummary; latest?: AttemptSummary; status: Status; review: string[]};

export type Rows = {attempts: AttemptRow[]; concepts: ConceptRow[]; events: EventRow[]};

export function summarizeAttempt(attempt: AttemptRow, concepts: ConceptRow[], events: EventRow[]): AttemptSummary {
  const mine = events.filter(e => e.attempt_id === attempt.id);
  const cs = concepts.filter(c => c.attempt_id === attempt.id).sort((a, b) => a.concept.localeCompare(b.concept));
  // Checkpoint choices are logged on every change; the latest one per item counts.
  const checkpoint: AttemptSummary["checkpoint"] = {};
  for (const e of mine) {
    if (e.kind === "checkpoint") (checkpoint[e.item_id] ??= {}).answer = e;
    if (e.kind === "checkpoint_reason") (checkpoint[e.item_id.replace(/-E$/, "")] ??= {}).reason = e;
  }
  const cp = Object.values(checkpoint);
  const checkpointAnswered = cp.filter(x => x.answer).length;
  const checkpointScore = cp.reduce((s, x) => s + (x.answer?.correct ? 1 : 0) + (x.reason?.correct ? 1 : 0), 0);
  const progress = attempt.finished_at ? 100 : Math.round((Math.min(cs.length, 5) + Math.min(checkpointAnswered, 5)) / 10 * 100);
  return {attempt, concepts: cs, events: mine, checkpoint, checkpointAnswered, checkpointScore,
    weighted: Math.round(checkpointScore * attemptWeight(attempt.number) * 10) / 10, progress};
}

export function summarizeStudent(id: string, nickname: string, rows: Rows): StudentSummary {
  const attempts = rows.attempts.filter(a => a.user_id === id).sort((a, b) => a.number - b.number)
    .map(a => summarizeAttempt(a, rows.concepts, rows.events));
  const first = attempts[0], latest = attempts[attempts.length - 1];
  const review = (latest?.concepts ?? []).filter(c => c.outcome === "ยังต้องทบทวน").map(c => c.concept);
  const status: Status = !latest ? "ยังไม่เริ่ม"
    : review.length || (latest.attempt.finished_at && latest.checkpointScore < SCORING.pass * SCORING.checkpointMax) ? "ต้องติดตาม"
    : latest.attempt.finished_at ? "เรียนจบ" : "กำลังเรียน";
  return {id, nickname, attempts, first, latest, status, review};
}

export type Misconception = {concept: string; title: string; tried: number; both: number; reasonOnly: number; wrong: number; review: number;
  wrongChoices: {item: string; value: string; text: string; count: number}[]};

/** Class-wide patterns from FIRST attempts only (retakes would hide what students thought at first). */
export function misconceptions(students: StudentSummary[], concepts: ConceptInfo[]): Misconception[] {
  const firsts = students.map(s => s.first).filter((x): x is AttemptSummary => !!x);
  return concepts.map(c => {
    const rows = firsts.map(f => f.concepts.find(x => x.concept === c.id)).filter((x): x is ConceptRow => !!x);
    const count = (r: string) => rows.filter(x => x.detail?.route === r).length;
    const tally = new Map<string, {item: string; value: string; text: string; count: number}>();
    for (const f of firsts) for (const e of f.events) {
      if (e.concept !== c.id || e.correct !== false || (e.kind !== "main" && e.kind !== "reason")) continue;
      const q = e.kind === "main" ? c.main : c.reason;
      const idx = "ABCD".indexOf(e.value);
      const k = `${e.item_id}|${e.value}`;
      const t = tally.get(k) ?? {item: e.item_id, value: e.value, text: idx >= 0 ? String(q.choices[idx] ?? "") : e.value, count: 0};
      t.count++; tally.set(k, t);
    }
    return {concept: c.id, title: c.title, tried: rows.length, both: count("both"), reasonOnly: count("reason"), wrong: count("answer"),
      review: rows.filter(x => x.outcome === "ยังต้องทบทวน").length, wrongChoices: [...tally.values()].sort((a, b) => b.count - a.count)};
  });
}
