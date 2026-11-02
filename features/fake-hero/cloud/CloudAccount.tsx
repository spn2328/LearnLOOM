"use client";
// Account chip for the top notice bar + account dialog (sign in / sign up, classes, sync status).
// Renders the original local-only notice when Supabase is not configured.
import React, {useCallback, useEffect, useState, useSyncExternalStore} from "react";
import type {Session} from "@supabase/supabase-js";
import {cloudEnabled, supabase, thaiError, type Classroom, type CloudProfile} from "./client";
import {adoptDevice, flush, installSync, signOutDevice, syncStore, type SyncStatus} from "./sync";
import "./cloud.css";

const STATUS: Record<SyncStatus, string> = {offline: "ออฟไลน์", pending: "รอซิงก์", syncing: "กำลังซิงก์…", synced: "ซิงก์แล้ว", error: "รอซิงก์"};

async function loadProfile(session: Session): Promise<CloudProfile> {
  const sb = supabase!;
  const {data, error} = await sb.from("profiles").select("id, nickname, role").eq("id", session.user.id).maybeSingle();
  if (error) throw error;
  if (data) return data as CloudProfile;
  const nickname = String(session.user.user_metadata?.nickname ?? "").trim().slice(0, 40) || "ผู้เรียน";
  const {data: created, error: e2} = await sb.from("profiles").insert({id: session.user.id, nickname}).select("id, nickname, role").single();
  if (e2) throw e2;
  return created as CloudProfile;
}

export default function CloudAccount() {
  if (!cloudEnabled) return <span>เคมีอินทรีย์ ม.6 · ความคืบหน้าบันทึกในเบราว์เซอร์นี้</span>;
  return <Account/>;
}

function Account() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [profile, setProfile] = useState<CloudProfile | null>(null);
  const [open, setOpen] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [error, setError] = useState("");
  const sync = useSyncExternalStore(syncStore.subscribe, syncStore.get, syncStore.get);

  useEffect(() => {
    supabase!.auth.getSession().then(({data}) => setSession(data.session));
    const {data} = supabase!.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!session) { setProfile(null); return; }
    let live = true;
    (async () => {
      try {
        const p = await loadProfile(session);
        if (!live) return;
        setProfile(p);
        installSync();
        const r = await adoptDevice(p);
        if (r === "conflict") { setConflict(true); setOpen(true); }
        else void flush();
      } catch (e) { if (live) setError(thaiError(e)); }
    })();
    return () => { live = false; };
  }, [session]);

  if (session === undefined) return <span>กำลังตรวจบัญชี…</span>;
  return <>
    {session && profile
      ? <span className="ll-cloud-chip">
          <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog">👤 {profile.nickname}{profile.role === "teacher" ? " (ครู)" : ""}</button>
          <b className={`ll-cloud-badge is-${sync.status}`} role="status">{STATUS[sync.status]}{sync.pending && sync.status !== "synced" ? ` · ${sync.pending}` : ""}</b>
        </span>
      : <span className="ll-cloud-chip">ความคืบหน้าบันทึกในเบราว์เซอร์นี้ <button type="button" onClick={() => setOpen(true)}>เข้าสู่ระบบ / สมัคร</button></span>}
    {error && !open && <span className="ll-cloud-error" role="alert">{error}</span>}
    {open && <div className="ll-cloud-backdrop" onClick={e => { if (e.target === e.currentTarget && !conflict) setOpen(false); }}>
      <section className="ll-cloud-dialog" role="dialog" aria-modal="true" aria-label="บัญชี LearnLOOM">
        {!conflict && <button type="button" className="ll-cloud-close" onClick={() => setOpen(false)} aria-label="ปิด">✕</button>}
        {conflict && profile ? <Conflict profile={profile}/>
          : session && profile ? <Signed profile={profile} setProfile={setProfile}/>
          : <SignIn/>}
      </section>
    </div>}
  </>;
}

function Conflict({profile}: {profile: CloudProfile}) {
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const pick = async (choice: "account" | "device") => {
    setBusy(true);
    try { await adoptDevice(profile, choice); location.reload(); } catch (e) { setError(thaiError(e)); setBusy(false); }
  };
  return <>
    <h2>พบความคืบหน้า 2 ที่</h2>
    <p>ในเครื่องนี้มีความคืบหน้าที่ยังไม่ได้อยู่ในบัญชี <b>{profile.nickname}</b> และบัญชีนี้ก็มีความคืบหน้าเก็บไว้แล้ว จะเรียนต่อจากที่ไหน?</p>
    <p className="ll-cloud-note">ประวัติคำตอบทุกครั้งที่ส่งขึ้นบัญชีแล้วจะไม่ถูกลบไม่ว่าเลือกแบบไหน</p>
    <div className="ll-cloud-row">
      <button type="button" className="ll-cloud-primary" disabled={busy} onClick={() => pick("account")}>เรียนต่อจากบัญชี</button>
      <button type="button" disabled={busy} onClick={() => pick("device")}>ใช้ของเครื่องนี้ (บันทึกเป็นอีกครั้ง)</button>
    </div>
    {error && <p className="ll-cloud-error" role="alert">{error}</p>}
  </>;
}

function SignIn() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [nickname, setNickname] = useState("");
  const [teacher, setTeacher] = useState(false), [code, setCode] = useState("");
  const [busy, setBusy] = useState(false), [msg, setMsg] = useState(""), [error, setError] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError(""); setMsg("");
    try {
      const sb = supabase!;
      if (mode === "up") {
        if (!nickname.trim()) throw new Error("กรุณากรอกชื่อเล่น");
        const {data, error} = await sb.auth.signUp({email: email.trim(), password, options: {data: {nickname: nickname.trim().slice(0, 40)}}});
        if (error) throw error;
        if (!data.session) { setMsg("สมัครแล้ว กรุณายืนยันอีเมลจากลิงก์ที่ส่งไป แล้วกลับมาเข้าสู่ระบบ"); setMode("in"); return; }
        const p = await loadProfile(data.session);
        if (teacher) {
          const {data: okRole, error: e2} = await sb.rpc("claim_teacher", {code: code.trim()});
          if (e2) throw e2;
          if (!okRole) throw new Error("รหัสครูไม่ถูกต้อง บัญชีถูกสร้างเป็นนักเรียน เปลี่ยนเป็นครูได้ในหน้าบัญชี");
        }
        void p;
      } else {
        const {error} = await sb.auth.signInWithPassword({email: email.trim(), password});
        if (error) throw error;
      }
      location.reload();
    } catch (e) { setError(e instanceof Error && /^[ก-๙]/.test(e.message) ? e.message : thaiError(e)); }
    finally { setBusy(false); }
  };
  return <form onSubmit={submit}>
    <h2>{mode === "in" ? "เข้าสู่ระบบ" : "สมัครบัญชีใหม่"}</h2>
    <p className="ll-cloud-note">ครั้งแรกต้องใช้อินเทอร์เน็ต หลังจากนั้นความคืบหน้าจะเก็บในบัญชีและเรียนต่อได้ทุกเครื่อง</p>
    {mode === "up" && <label>ชื่อเล่น (ไม่ต้องใช้ชื่อจริง)<input value={nickname} onChange={e => setNickname(e.target.value)} maxLength={40} required autoComplete="nickname"/></label>}
    <label>อีเมล<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"/></label>
    <label>รหัสผ่าน<input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required autoComplete={mode === "in" ? "current-password" : "new-password"}/></label>
    {mode === "up" && <label className="ll-cloud-check"><input type="checkbox" checked={teacher} onChange={e => setTeacher(e.target.checked)}/> ฉันเป็นครู</label>}
    {mode === "up" && teacher && <label>รหัสสำหรับครู (ขอจากผู้ดูแลระบบ)<input value={code} onChange={e => setCode(e.target.value)} required autoComplete="off"/></label>}
    <button type="submit" className="ll-cloud-primary" disabled={busy}>{busy ? "กำลังดำเนินการ…" : mode === "in" ? "เข้าสู่ระบบ" : "สมัคร"}</button>
    <button type="button" className="ll-cloud-link" onClick={() => { setMode(mode === "in" ? "up" : "in"); setError(""); }}>{mode === "in" ? "ยังไม่มีบัญชี? สมัครใหม่" : "มีบัญชีแล้ว? เข้าสู่ระบบ"}</button>
    {msg && <p className="ll-cloud-ok" role="status">{msg}</p>}
    {error && <p className="ll-cloud-error" role="alert">{error}</p>}
  </form>;
}

function Signed({profile, setProfile}: {profile: CloudProfile; setProfile: (p: CloudProfile) => void}) {
  const sync = useSyncExternalStore(syncStore.subscribe, syncStore.get, syncStore.get);
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const logout = async () => {
    setBusy(true); setError("");
    try {
      if (!await signOutDevice()) {
        if (!window.confirm("ยังซิงก์ไม่ครบ (ออฟไลน์หรือเชื่อมต่อไม่ได้) ถ้าออกตอนนี้ คำตอบที่ยังไม่ซิงก์ในเครื่องนี้จะหาย ออกจากระบบเลยไหม?")) { setBusy(false); return; }
        await signOutDevice(true);
      }
      location.reload();
    } catch (e) { setError(thaiError(e)); setBusy(false); }
  };
  return <>
    <h2>สวัสดี {profile.nickname}</h2>
    <p className="ll-cloud-note">บทบาท: {profile.role === "teacher" ? "ครู" : "นักเรียน"} · สถานะ: <b className={`ll-cloud-badge is-${sync.status}`}>{STATUS[sync.status]}</b>
      {sync.syncedAt ? ` · ซิงก์ล่าสุด ${new Date(sync.syncedAt).toLocaleTimeString("th-TH")}` : ""}</p>
    {sync.status === "offline" && <p className="ll-cloud-note">ออฟไลน์อยู่: เรียนต่อได้ คำตอบเก็บในเครื่องและจะซิงก์เองเมื่อกลับมาออนไลน์</p>}
    {sync.status === "error" && <p className="ll-cloud-error">ซิงก์ไม่สำเร็จ จะลองใหม่อัตโนมัติ ({sync.error})</p>}
    <div className="ll-cloud-row">
      <button type="button" onClick={() => void flush()} disabled={sync.status === "syncing"}>ซิงก์ตอนนี้</button>
      <button type="button" onClick={logout} disabled={busy}>{busy ? "กำลังออก…" : "ออกจากระบบ"}</button>
    </div>
    {profile.role === "teacher" ? <TeacherClasses profile={profile}/> : <StudentClasses profile={profile} setProfile={setProfile}/>}
    {error && <p className="ll-cloud-error" role="alert">{error}</p>}
  </>;
}

function StudentClasses({profile, setProfile}: {profile: CloudProfile; setProfile: (p: CloudProfile) => void}) {
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [code, setCode] = useState(""), [teacherCode, setTeacherCode] = useState("");
  const [msg, setMsg] = useState(""), [error, setError] = useState("");
  const load = useCallback(async () => {
    const {data, error} = await supabase!.from("classrooms").select("id, name, join_code, teacher_id").order("created_at");
    if (error) setError(thaiError(error)); else setClasses(data as Classroom[]);
  }, []);
  useEffect(() => { void load(); }, [load]);
  const join = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setMsg("");
    const {data, error} = await supabase!.rpc("join_class", {code: code.trim()});
    if (error) return setError(thaiError(error));
    if (!data) return setError("ไม่พบห้องเรียนรหัสนี้ ตรวจรหัสจากครูอีกครั้ง");
    setCode(""); setMsg("เข้าห้องเรียนแล้ว"); void load();
  };
  const claim = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    const {data, error} = await supabase!.rpc("claim_teacher", {code: teacherCode.trim()});
    if (error) return setError(thaiError(error));
    if (!data) return setError("รหัสครูไม่ถูกต้อง");
    setProfile({...profile, role: "teacher"});
    location.reload();
  };
  return <>
    <h3>ห้องเรียนของฉัน</h3>
    {classes.length ? <ul className="ll-cloud-list">{classes.map(c => <li key={c.id}>{c.name}</li>)}</ul> : <p className="ll-cloud-note">ยังไม่ได้เข้าห้องเรียน ใส่รหัสห้องที่ได้จากครู</p>}
    <form className="ll-cloud-row" onSubmit={join}>
      <input aria-label="รหัสห้องเรียน" placeholder="รหัสห้อง 6 ตัว" value={code} onChange={e => setCode(e.target.value)} maxLength={12} required/>
      <button type="submit">เข้าห้อง</button>
    </form>
    <p className="ll-cloud-note">ครูเห็นเฉพาะความคืบหน้าและคำตอบของคนในห้องที่ครูสอน เพื่อนในห้องไม่เห็นข้อมูลของกันและกัน</p>
    <details className="ll-cloud-details"><summary>สำหรับครู: เปลี่ยนบัญชีนี้เป็นบัญชีครู</summary>
      <form className="ll-cloud-row" onSubmit={claim}>
        <input aria-label="รหัสสำหรับครู" placeholder="รหัสสำหรับครู" value={teacherCode} onChange={e => setTeacherCode(e.target.value)} required autoComplete="off"/>
        <button type="submit">ยืนยัน</button>
      </form>
    </details>
    {msg && <p className="ll-cloud-ok" role="status">{msg}</p>}
    {error && <p className="ll-cloud-error" role="alert">{error}</p>}
  </>;
}

type Roster = {student_id: string; joined_at: string; profiles: {nickname: string} | null};
function TeacherClasses({profile}: {profile: CloudProfile}) {
  const [classes, setClasses] = useState<(Classroom & {roster: Roster[]})[]>([]);
  const [attempts, setAttempts] = useState<Record<string, {count: number; finished: number}>>({});
  const [name, setName] = useState(""), [error, setError] = useState("");
  const load = useCallback(async () => {
    const sb = supabase!;
    const {data, error} = await sb.from("classrooms").select("id, name, join_code, teacher_id, enrollments(student_id, joined_at, profiles(nickname))").eq("teacher_id", profile.id).order("created_at");
    if (error) return setError(thaiError(error));
    setClasses((data ?? []).map((c: any) => ({...c, roster: c.enrollments ?? []})));
    const {data: rows, error: e2} = await sb.from("attempts").select("user_id, finished_at");
    if (e2) return setError(thaiError(e2));
    const by: Record<string, {count: number; finished: number}> = {};
    for (const r of rows ?? []) { const x = by[r.user_id] ??= {count: 0, finished: 0}; x.count++; if (r.finished_at) x.finished++; }
    setAttempts(by);
  }, [profile.id]);
  useEffect(() => { void load(); }, [load]);
  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    const {error} = await supabase!.from("classrooms").insert({teacher_id: profile.id, name: name.trim()});
    if (error) return setError(thaiError(error));
    setName(""); void load();
  };
  return <>
    <h3>ห้องเรียนที่สอน</h3>
    <form className="ll-cloud-row" onSubmit={create}>
      <input aria-label="ชื่อห้องเรียน" placeholder="เช่น ม.6/1 เคมี" value={name} onChange={e => setName(e.target.value)} maxLength={80} required/>
      <button type="submit">สร้างห้อง</button>
    </form>
    {classes.map(c => <div key={c.id} className="ll-cloud-class">
      <p><b>{c.name}</b> · รหัสให้นักเรียน: <code>{c.join_code}</code> · {c.roster.length} คน</p>
      {c.roster.length ? <table><thead><tr><th>ชื่อเล่น</th><th>เข้าห้องเมื่อ</th><th>ครั้งที่เริ่มเรียน</th><th>เรียนจบ</th></tr></thead>
        <tbody>{c.roster.map(s => <tr key={s.student_id}><td>{s.profiles?.nickname ?? "-"}</td><td>{new Date(s.joined_at).toLocaleDateString("th-TH")}</td><td>{attempts[s.student_id]?.count ?? 0}</td><td>{attempts[s.student_id]?.finished ?? 0}</td></tr>)}</tbody></table>
        : <p className="ll-cloud-note">ยังไม่มีนักเรียนเข้าห้อง</p>}
    </div>)}
    <p className="ll-cloud-note">แดชบอร์ดครูแบบละเอียด (คำตอบ เหตุผล เส้นทาง) จะมาใน Phase ถัดไป</p>
    {error && <p className="ll-cloud-error" role="alert">{error}</p>}
  </>;
}
