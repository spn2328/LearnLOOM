"use client";
// Teacher dashboard (class overview, per-student table, drill-down, shared misconceptions, formulas)
// and the student's own progress card. All numbers come from dashboard.ts.
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {supabase, thaiError, type Classroom, type CloudProfile} from "./client";
import {lessons} from "../content/episode01";
import {FORMULAS, ROUTE_LABEL, SCORING, attemptWeight, misconceptions, summarizeStudent,
  type AttemptRow, type AttemptSummary, type ConceptInfo, type ConceptRow, type EventRow, type Rows, type StudentSummary} from "./dashboard";

const CONCEPTS: ConceptInfo[] = lessons.map(l => ({id: l.main.id.replace("Q", "C"), title: (l as {title?: string}).title ?? l.main.id, main: l.main, reason: l.reason}));
/** Supabase returns at most 1000 rows per request, so read every page. */
async function all<T>(page: (from: number, to: number) => PromiseLike<{data: unknown; error: unknown}>): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    const {data, error} = await page(from, from + 999);
    if (error) throw error;
    const rows = (data ?? []) as T[];
    out.push(...rows);
    if (rows.length < 1000) return out;
  }
}

/** Everything the signed-in user may read (RLS limits a teacher to own students, a student to self). */
async function loadRows(userIds?: string[]) {
  const sb = supabase!;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the builder generics are too deep for tsc here
  const scope = (q: any) => userIds ? q.in("user_id", userIds) : q;
  const [attempts, concepts, events] = await Promise.all([
    all<AttemptRow>((a, b) => scope(sb.from("attempts").select("id, user_id, number, started_at, finished_at")).order("number").range(a, b)),
    all<ConceptRow>((a, b) => scope(sb.from("concept_results").select("attempt_id, user_id, concept, outcome, path, detail")).range(a, b)),
    all<EventRow>((a, b) => scope(sb.from("answer_events").select("attempt_id, user_id, concept, item_id, kind, value, correct, recorded_at")
      .in("kind", ["main", "reason", "recheck", "recheck_b", "checkpoint", "checkpoint_reason"])).order("recorded_at").range(a, b)),
  ]);
  return {attempts, concepts, events};
}



const pct = (n: number) => `${Math.round(n)}%`;
const date = (s?: string | null) => s ? new Date(s).toLocaleString("th-TH", {dateStyle: "medium", timeStyle: "short"}) : "-";
const conceptTitle = (id: string) => CONCEPTS.find(c => c.id === id)?.title ?? id;
const mark = (ok: boolean | null | undefined) => ok == null ? "" : ok ? " ✓" : " ✗";

export function goStudy() {
  window.dispatchEvent(new CustomEvent("learnloom:go", {detail: "fakehero"}));
}

/* ---------------- Student ---------------- */

export function StudentProgress({profile, onContinue}: {profile: CloudProfile; onContinue: () => void}) {
  const [me, setMe] = useState<StudentSummary | null>(null), [error, setError] = useState("");
  useEffect(() => {
    loadRows([profile.id]).then(rows => setMe(summarizeStudent(profile.id, profile.nickname, rows))).catch(e => setError(thaiError(e)));
  }, [profile.id, profile.nickname]);
  if (error) return <p className="ll-cloud-error" role="alert">{error}</p>;
  if (!me) return <p className="ll-cloud-note">กำลังโหลดความก้าวหน้า…</p>;
  const latest = me.latest;
  const mastered = (latest?.concepts ?? []).filter(c => c.outcome !== "ยังต้องทบทวน");
  return <div className="ll-cloud-progress">
    <h3>ความก้าวหน้าของฉัน</h3>
    <button type="button" className="ll-cloud-primary ll-cloud-continue" onClick={() => { onContinue(); goStudy(); }}>
      {latest ? "▶ เรียนต่อจากจุดเดิม" : "▶ เริ่มคดี EP.01"}
    </button>
    {latest ? <>
      <div className="ll-cloud-meter" role="img" aria-label={`ความคืบหน้า ${pct(latest.progress)}`}><span style={{width: pct(latest.progress)}}/></div>
      <p className="ll-cloud-note">ความคืบหน้าครั้งที่ {latest.attempt.number}: <b>{pct(latest.progress)}</b> (นับจากจำนวนขั้นที่ทำแล้ว แยกจากคะแนนความเข้าใจ)</p>
      <p>{latest.attempt.finished_at ? "ปิดคดีได้แล้ว เก่งมาก! ลองทบทวนจุดที่ยังไม่มั่นใจได้เสมอ"
        : mastered.length ? `ไขได้แล้ว ${mastered.length} เบาะแส ไปต่ออีกนิด คดีใกล้คลี่คลายแล้ว` : "ทุกคำตอบช่วยให้ลูมรู้ว่าจะช่วยเราตรงไหน ลองไปต่อกัน"}</p>
      {mastered.length > 0 && <><b>เข้าใจแล้ว</b><ul className="ll-cloud-list">{mastered.map(c => <li key={c.concept}>{c.concept} {conceptTitle(c.concept)}</li>)}</ul></>}
      {me.review.length > 0 && <><b>ไว้ทบทวนอีกรอบ</b><ul className="ll-cloud-list">{me.review.map(c => <li key={c}>{c} {conceptTitle(c)}</li>)}</ul></>}
      <b>คะแนน Checkpoint แต่ละครั้ง</b>
      <ul className="ll-cloud-list">{me.attempts.map(a => <li key={a.attempt.id}>
        ครั้งที่ {a.attempt.number}{a.attempt.number === 1 ? " (ครั้งแรก)" : ""}: {a.checkpointAnswered ? `${a.checkpointScore}/${SCORING.checkpointMax}` : "ยังไม่ถึง Checkpoint"}
        {a.attempt.finished_at ? " · จบแล้ว" : " · กำลังทำ"}</li>)}</ul>
    </> : <p className="ll-cloud-note">ยังไม่มีความคืบหน้าในบัญชี เริ่มคดีแรกได้เลย</p>}
  </div>;
}

/* ---------------- Teacher ---------------- */

type Roster = {student_id: string; joined_at: string; profiles: {nickname: string} | null};
type ClassWithRoster = Classroom & {roster: Roster[]};

export function TeacherDashboard({profile}: {profile: CloudProfile}) {
  const [classes, setClasses] = useState<ClassWithRoster[]>([]);
  const [classId, setClassId] = useState("");
  const [students, setStudents] = useState<StudentSummary[] | null>(null);
  const [pick, setPick] = useState<string | null>(null);
  const [name, setName] = useState(""), [error, setError] = useState(""), [loading, setLoading] = useState(false);

  const loadClasses = useCallback(async () => {
    const {data, error} = await supabase!.from("classrooms").select("id, name, join_code, teacher_id, enrollments(student_id, joined_at, profiles(nickname))")
      .eq("teacher_id", profile.id).order("created_at");
    if (error) return setError(thaiError(error));
    const list = (data ?? []).map((c: any) => ({...c, roster: c.enrollments ?? []})) as ClassWithRoster[];
    setClasses(list);
    setClassId(id => id && list.some(c => c.id === id) ? id : list[0]?.id ?? "");
  }, [profile.id]);
  useEffect(() => { void loadClasses(); }, [loadClasses]);

  const current = classes.find(c => c.id === classId);
  const loadStudents = useCallback(async () => {
    if (!current) { setStudents(null); return; }
    setLoading(true); setError("");
    try {
      const ids = current.roster.map(r => r.student_id);
      const rows: Rows = ids.length ? await loadRows(ids) : {attempts: [], concepts: [], events: []};
      setStudents(current.roster.map(r => summarizeStudent(r.student_id, r.profiles?.nickname ?? "-", rows))
        .sort((a, b) => a.nickname.localeCompare(b.nickname, "th")));
    } catch (e) { setError(thaiError(e)); } finally { setLoading(false); }
  }, [current]);
  useEffect(() => { setPick(null); void loadStudents(); }, [loadStudents]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    const {data, error} = await supabase!.from("classrooms").insert({teacher_id: profile.id, name: name.trim()}).select("id").single();
    if (error) return setError(thaiError(error));
    setName(""); setClassId(data.id); void loadClasses();
  };
  const refresh = async () => { await loadClasses(); await loadStudents(); };

  const counts = useMemo(() => {
    const s = students ?? [];
    const by = (x: string) => s.filter(v => v.status === x).length;
    return {total: s.length, done: by("เรียนจบ"), doing: by("กำลังเรียน"), follow: by("ต้องติดตาม"), none: by("ยังไม่เริ่ม")};
  }, [students]);
  const mis = useMemo(() => misconceptions(students ?? [], CONCEPTS), [students]);
  const picked = students?.find(s => s.id === pick);

  return <div className="ll-cloud-teacher">
    <h3>แดชบอร์ดครู</h3>
    <div className="ll-cloud-row">
      {classes.length > 0 && <label className="ll-cloud-inline">ห้องเรียน
        <select value={classId} onChange={e => setClassId(e.target.value)}>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>}
      <label className="ll-cloud-inline">บทเรียน<select value="EP.01" disabled><option>EP.01 คนในคลิป</option></select></label>
      <button type="button" onClick={refresh} disabled={loading}>{loading ? "กำลังโหลด…" : "↻ โหลดข้อมูลล่าสุด"}</button>
    </div>
    <form className="ll-cloud-row" onSubmit={create}>
      <input aria-label="ชื่อห้องเรียนใหม่" placeholder="สร้างห้องใหม่ เช่น ม.6/1 เคมี" value={name} onChange={e => setName(e.target.value)} maxLength={80} required/>
      <button type="submit">+ สร้างห้อง</button>
    </form>
    {error && <p className="ll-cloud-error" role="alert">{error}</p>}
    {!classes.length && <p className="ll-cloud-note">ยังไม่มีห้องเรียน สร้างห้องก่อน แล้วบอกรหัสห้องให้นักเรียน</p>}
    {current && <>
      <p className="ll-cloud-note">รหัสห้องให้นักเรียน: <code className="ll-cloud-code">{current.join_code}</code> · นักเรียนเข้าเว็บ → "เข้าสู่ระบบ" → แท็บนักเรียน → ใส่รหัสห้อง + ชื่อเล่น + PIN</p>
      <div className="ll-cloud-stats">
        <div><b>{counts.total}</b>นักเรียนทั้งหมด</div>
        <div><b>{counts.done}</b>เรียนจบ</div>
        <div><b>{counts.doing}</b>กำลังเรียน</div>
        <div className="is-warn"><b>{counts.follow}</b>ต้องติดตาม</div>
        <div><b>{counts.none}</b>ยังไม่เริ่ม</div>
      </div>
      {picked ? <StudentDetail s={picked} back={() => setPick(null)}/> : <>
        <h4>รายชื่อนักเรียน</h4>
        {students?.length ? <div className="ll-cloud-scroll"><table className="ll-cloud-table">
          <thead><tr><th>ชื่อเล่น</th><th>ความคืบหน้า</th><th>Checkpoint ครั้งแรก</th><th>ล่าสุด (คะแนนที่นับ)</th><th>ครั้งที่ทำ</th><th>ต้องทบทวน</th><th>สถานะ</th><th></th></tr></thead>
          <tbody>{students.map(s => <tr key={s.id}>
            <td>{s.nickname}</td>
            <td>{s.latest ? pct(s.latest.progress) : "-"}</td>
            <td>{s.first?.checkpointAnswered ? `${s.first.checkpointScore}/10` : "-"}</td>
            <td>{s.latest?.checkpointAnswered ? `${s.latest.checkpointScore}/10 (${s.latest.weighted})` : "-"}</td>
            <td>{s.attempts.length}</td>
            <td>{s.review.join(", ") || "-"}</td>
            <td><span className={`ll-cloud-status is-${s.status === "ต้องติดตาม" ? "warn" : s.status === "เรียนจบ" ? "ok" : "plain"}`}>{s.status}</span></td>
            <td><button type="button" onClick={() => setPick(s.id)} disabled={!s.attempts.length}>ดูรายละเอียด</button></td>
          </tr>)}</tbody></table></div>
          : !loading && <p className="ll-cloud-note">ยังไม่มีนักเรียนเข้าห้องนี้</p>}
        <h4>ความเข้าใจคลาดเคลื่อนที่พบร่วมกัน (จากการทำครั้งแรก)</h4>
        {mis.some(m => m.tried) ? <div className="ll-cloud-scroll"><table className="ll-cloud-table">
          <thead><tr><th>แนวคิด</th><th>ทำแล้ว</th><th>ถูกทั้งคู่</th><th>คำตอบถูก เหตุผลผิด</th><th>คำตอบผิด</th><th>ยังต้องทบทวน</th><th>ตัวเลือกผิดที่เลือกบ่อย</th></tr></thead>
          <tbody>{mis.map(m => <tr key={m.concept}>
            <td>{m.concept} {m.title}</td><td>{m.tried}</td><td>{m.both}</td><td>{m.reasonOnly}</td><td>{m.wrong}</td><td>{m.review}</td>
            <td className="ll-cloud-wrap">{m.wrongChoices.slice(0, 2).map(w => <div key={w.item + w.value}>{w.item} ข้อ {w.value} "{w.text}" · {w.count} คน</div>)}{!m.wrongChoices.length && "-"}</td>
          </tr>)}</tbody></table></div> : <p className="ll-cloud-note">ข้อมูลยังไม่เพียงพอ (ยังไม่มีนักเรียนตอบ)</p>}
      </>}
      <details className="ll-cloud-details" open><summary>วิธีคิดคะแนนและสถานะ</summary>
        <ul className="ll-cloud-list">{FORMULAS.map(f => <li key={f}>{f}</li>)}</ul></details>
    </>}
  </div>;
}

function StudentDetail({s, back}: {s: StudentSummary; back: () => void}) {
  const [n, setN] = useState(s.latest?.attempt.number ?? 1);
  const a: AttemptSummary | undefined = s.attempts.find(x => x.attempt.number === n);
  return <div className="ll-cloud-detail">
    <button type="button" onClick={back}>← กลับไปรายชื่อ</button>
    <h4>{s.nickname} · {s.status}</h4>
    <div className="ll-cloud-row" role="tablist">{s.attempts.map(x => <button key={x.attempt.id} type="button" role="tab" aria-selected={x.attempt.number === n}
      className={x.attempt.number === n ? "ll-cloud-primary" : ""} onClick={() => setN(x.attempt.number)}>ครั้งที่ {x.attempt.number}{x.attempt.number === 1 ? " (แรก)" : ""}</button>)}</div>
    {a && <>
      <p className="ll-cloud-note">เริ่ม {date(a.attempt.started_at)} · {a.attempt.finished_at ? `จบ ${date(a.attempt.finished_at)}` : "ยังไม่จบ"} · ความคืบหน้า {pct(a.progress)}{" "}
        · Checkpoint {a.checkpointScore}/10 × {pct(attemptWeight(a.attempt.number) * 100)} = {a.weighted}</p>
      <div className="ll-cloud-scroll"><table className="ll-cloud-table">
        <thead><tr><th>แนวคิด</th><th>ครั้งแรก: คำตอบ / เหตุผล</th><th>เส้นทาง</th><th>เหตุผลที่ระบบเลือกเส้นทาง</th><th>ผล</th></tr></thead>
        <tbody>{CONCEPTS.map(c => {
          const row = a.concepts.find(x => x.concept === c.id);
          const ev = (k: string) => a.events.find(e => e.concept === c.id && e.kind === k);
          const main = ev("main"), reason = ev("reason");
          return <tr key={c.id}>
            <td>{c.id} {c.title}</td>
            <td>{main ? `${main.value}${mark(main.correct)} / ${reason?.value ?? "-"}${mark(reason?.correct)}` : "-"}</td>
            <td>{row ? `${ROUTE_LABEL[String(row.detail?.route)] ?? "-"}${row.path ? ` → Path ${row.path}` : ""}` : "-"}</td>
            <td className="ll-cloud-wrap">{row?.detail?.routeReason ?? "-"}</td>
            <td>{row?.outcome ?? "ยังไม่ได้ทำ"}</td>
          </tr>;
        })}</tbody></table></div>
      <h4>Checkpoint</h4>
      {a.checkpointAnswered ? <ul className="ll-cloud-list">{Object.entries(a.checkpoint).sort().map(([id, x]) =>
        <li key={id}>{id}: คำตอบ {x.answer?.value ?? "-"}{mark(x.answer?.correct)} · เหตุผล {x.reason?.value ?? "-"}{mark(x.reason?.correct)}</li>)}</ul>
        : <p className="ll-cloud-note">ยังไม่ถึง Checkpoint</p>}
    </>}
  </div>;
}
