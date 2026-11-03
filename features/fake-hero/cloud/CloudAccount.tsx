"use client";
// Account chip for the top notice bar + account dialog (sign in, consent, dashboards, sync status).
// Renders the original local-only notice when Supabase is not configured.
import React, {useEffect, useState, useSyncExternalStore} from "react";
import {createPortal} from "react-dom";
import type {Session} from "@supabase/supabase-js";
import {cloudEnabled, supabase, thaiError, type CloudProfile} from "./client";
import {adoptDevice, flush, installSync, signOutDevice, syncStore, type SyncStatus} from "./sync";
import {stableId} from "./records";
import {StudentProgress, TeacherDashboard} from "./Dashboards";
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

// Students sign in with class code + nickname + PIN. Supabase Auth still needs an email/password pair, so
// both are derived: the same code + nickname always maps to the same hidden address, which also keeps
// nicknames unique within a class. No real email is collected or contacted ("Confirm email" must be off).
const cleanCode = (code: string) => code.trim().toUpperCase();
const cleanNick = (nick: string) => nick.trim().replace(/\s+/g, " ").slice(0, 40);
const studentEmail = (code: string, nick: string) => `s${stableId(`${cleanCode(code)}|${cleanNick(nick).toLowerCase()}`).slice(1)}@student.learnloom.app`;
const studentPassword = (code: string, pin: string) => `ll-${pin}-${cleanCode(code)}`;

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
    // Keyed on the user, not the session object, so token refreshes do not re-run device adoption.
  }, [session?.user.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (session === undefined) return <span>กำลังตรวจบัญชี…</span>;
  const wide = !conflict && profile?.role === "teacher";
  return <>
    {session && profile
      ? <span className="ll-cloud-chip">
          <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog">{profile.role === "teacher" ? "📊 แดชบอร์ดครู" : "👤 " + profile.nickname}</button>
          <b className={`ll-cloud-badge is-${sync.status}`} role="status">{STATUS[sync.status]}{sync.pending && sync.status !== "synced" ? ` · ${sync.pending}` : ""}</b>
        </span>
      : <span className="ll-cloud-chip">ความคืบหน้าบันทึกในเบราว์เซอร์นี้ <button type="button" onClick={() => setOpen(true)}>เข้าสู่ระบบ</button></span>}
    {error && !open && <span className="ll-cloud-error" role="alert">{error}</span>}
    {/* Portal: the notice bar is its own stacking context, so a dialog inside it sits under the floating dock. */}
    {open && createPortal(<div className="ll-cloud-backdrop" onClick={e => { if (e.target === e.currentTarget && !conflict) setOpen(false); }}>
      <section className={`ll-cloud-dialog${wide ? " is-wide" : ""}`} role="dialog" aria-modal="true" aria-label="บัญชี LearnLOOM">
        {!conflict && <button type="button" className="ll-cloud-close" onClick={() => setOpen(false)} aria-label="ปิด">✕</button>}
        {conflict && profile ? <Conflict profile={profile}/>
          : session && profile ? <Signed profile={profile} close={() => setOpen(false)}/>
          : <SignIn/>}
      </section>
    </div>, document.body)}
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
  const [who, setWho] = useState<"student" | "teacher">("student");
  return <>
    <h2>เข้าสู่ระบบ LearnLOOM</h2>
    <div className="ll-cloud-tabs" role="tablist">
      <button type="button" role="tab" aria-selected={who === "student"} className={who === "student" ? "ll-cloud-primary" : ""} onClick={() => setWho("student")}>นักเรียน</button>
      <button type="button" role="tab" aria-selected={who === "teacher"} className={who === "teacher" ? "ll-cloud-primary" : ""} onClick={() => setWho("teacher")}>ครู</button>
    </div>
    {who === "student" ? <StudentSignIn/> : <TeacherSignIn/>}
  </>;
}

function Consent({checked, set}: {checked: boolean; set: (v: boolean) => void}) {
  return <div className="ll-cloud-consent">
    <b>ก่อนเริ่มทดลองใช้</b>
    <ul>
      <li>เว็บนี้อยู่ในช่วงทดลองใช้ (pilot) เพื่อพัฒนาบทเรียน</li>
      <li>ระบบเก็บ: ชื่อเล่น คำตอบ เหตุผลที่เลือก เส้นทางการเรียน และเวลาที่ทำ <b>ไม่เก็บชื่อจริง อีเมล หรือเบอร์โทร</b></li>
      <li>ผู้ที่เห็นข้อมูล: ตัวนักเรียนเอง และครูของห้องที่เข้าร่วมเท่านั้น เพื่อนในห้องไม่เห็น</li>
      <li>ไม่มีผลต่อคะแนนเก็บของรายวิชา ถ้าไม่สะดวกใจ ใช้แบบไม่เข้าสู่ระบบได้ (บันทึกในเครื่องเท่านั้น) หรือแจ้งครูเพื่อขอลบข้อมูลได้</li>
    </ul>
    <label className="ll-cloud-check"><input type="checkbox" checked={checked} onChange={e => set(e.target.checked)} required/> รับทราบและยินยอม</label>
  </div>;
}

function StudentSignIn() {
  const [code, setCode] = useState(""), [nick, setNick] = useState(""), [pin, setPin] = useState(""), [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const sb = supabase!;
      if (!/^\d{4,6}$/.test(pin)) throw new Error("PIN ต้องเป็นตัวเลข 4–6 หลัก");
      if (!cleanNick(nick)) throw new Error("กรุณากรอกชื่อเล่น");
      const {data: className, error: e0} = await sb.rpc("class_name", {code: cleanCode(code)});
      if (e0) throw e0;
      if (!className) throw new Error("ไม่พบห้องเรียนรหัสนี้ ตรวจรหัสจากครูอีกครั้ง");
      const email = studentEmail(code, nick), password = studentPassword(code, pin);
      const signIn = await sb.auth.signInWithPassword({email, password});
      if (signIn.error && !/Invalid login credentials/i.test(signIn.error.message)) throw signIn.error;
      if (signIn.error) {
        // Unknown pair: either a new student or a wrong PIN for an existing nickname.
        const up = await sb.auth.signUp({email, password, options: {data: {nickname: cleanNick(nick), consent_at: new Date().toISOString()}}});
        if (up.error && /already registered|already been registered|already exists/i.test(up.error.message))
          throw new Error(`ชื่อเล่น "${cleanNick(nick)}" มีในห้องนี้แล้ว แต่ PIN ไม่ตรง ถ้าเป็นคนละคน ให้ใช้ชื่อเล่นอื่น ถ้าลืม PIN แจ้งครู`);
        if (up.error) throw up.error;
        if (!up.data.session) throw new Error("ระบบยังเปิดการยืนยันอีเมลอยู่ ให้ครู/ผู้ดูแลปิด Confirm email ใน Supabase ก่อน");
        await loadProfile(up.data.session);
      }
      const {error: e2} = await sb.rpc("join_class", {code: cleanCode(code)});
      if (e2) throw e2;
      location.reload();
    } catch (e) { setError(e instanceof Error && /^[ก-๙"]/.test(e.message) ? e.message : thaiError(e)); }
    finally { setBusy(false); }
  };
  return <form onSubmit={submit}>
    <p className="ll-cloud-note">ครั้งแรกระบบจะสร้างบัญชีให้อัตโนมัติ ครั้งต่อไปใช้รหัสห้อง ชื่อเล่น และ PIN เดิม เพื่อเรียนต่อได้ทุกเครื่อง</p>
    <label>รหัสห้อง (ขอจากครู)<input value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={12} required autoComplete="off" autoCapitalize="characters" placeholder="เช่น 3FA9C1"/></label>
    <label>ชื่อเล่น (ห้ามใช้ชื่อจริง-นามสกุล)<input value={nick} onChange={e => setNick(e.target.value)} maxLength={40} required autoComplete="nickname"/></label>
    <label>PIN ตัวเลข 4–6 หลัก (ตั้งเองครั้งแรก และจำไว้)<input value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ""))} inputMode="numeric" type="password" maxLength={6} required autoComplete="current-password"/></label>
    <Consent checked={ok} set={setOk}/>
    <button type="submit" className="ll-cloud-primary" disabled={busy || !ok}>{busy ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}</button>
    {error && <p className="ll-cloud-error" role="alert">{error}</p>}
  </form>;
}

function TeacherSignIn() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [nickname, setNickname] = useState(""), [code, setCode] = useState("");
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const sb = supabase!;
      if (mode === "up") {
        if (!nickname.trim()) throw new Error("กรุณากรอกชื่อที่จะแสดง");
        if (code.trim().length < 6) throw new Error("รหัสครูต้องยาวอย่างน้อย 6 ตัวอักษร");
        const {data, error} = await sb.auth.signUp({email: email.trim(), password, options: {data: {nickname: nickname.trim().slice(0, 40)}}});
        if (error) throw error;
        if (!data.session) throw new Error("ระบบยังเปิดการยืนยันอีเมลอยู่ ให้ปิด Confirm email ใน Supabase ก่อน (ดูคู่มือ)");
        await loadProfile(data.session);
        const {data: okRole, error: e2} = await sb.rpc("claim_teacher", {code: code.trim()});
        if (e2) throw e2;
        if (!okRole) throw new Error("รหัสครูไม่ถูกต้อง บัญชีถูกสร้างแล้วแต่ยังเป็นนักเรียน เข้าสู่ระบบแล้วใส่รหัสครูที่ถูกต้องในหน้าบัญชี");
      } else {
        const {error} = await sb.auth.signInWithPassword({email: email.trim(), password});
        if (error) throw error;
      }
      location.reload();
    } catch (e) { setError(e instanceof Error && /^[ก-๙]/.test(e.message) ? e.message : thaiError(e)); }
    finally { setBusy(false); }
  };
  return <form onSubmit={submit}>
    {mode === "up" && <label>ชื่อที่จะแสดง (เช่น ครูเอ)<input value={nickname} onChange={e => setNickname(e.target.value)} maxLength={40} required/></label>}
    <label>อีเมล<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"/></label>
    <label>รหัสผ่าน (อย่างน้อย 6 ตัว)<input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required autoComplete={mode === "in" ? "current-password" : "new-password"}/></label>
    {mode === "up" && <label>รหัสครู (อย่างน้อย 6 ตัว)<input value={code} onChange={e => setCode(e.target.value)} minLength={6} required autoComplete="off"/>
      <span className="ll-cloud-note">ครูคนแรกของระบบ: ตั้งรหัสใหม่ได้เลย ระบบจะจำไว้ · ครูคนต่อไป: ขอรหัสจากครูคนแรก</span></label>}
    <button type="submit" className="ll-cloud-primary" disabled={busy}>{busy ? "กำลังดำเนินการ…" : mode === "in" ? "เข้าสู่ระบบ" : "สมัครบัญชีครู"}</button>
    <button type="button" className="ll-cloud-link" onClick={() => { setMode(mode === "in" ? "up" : "in"); setError(""); }}>{mode === "in" ? "ยังไม่มีบัญชีครู? สมัคร" : "มีบัญชีแล้ว? เข้าสู่ระบบ"}</button>
    {error && <p className="ll-cloud-error" role="alert">{error}</p>}
  </form>;
}

function Signed({profile, close}: {profile: CloudProfile; close: () => void}) {
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
    {profile.role === "teacher" ? <TeacherDashboard profile={profile}/> : <StudentHome profile={profile} close={close}/>}
    {error && <p className="ll-cloud-error" role="alert">{error}</p>}
  </>;
}

function StudentHome({profile, close}: {profile: CloudProfile; close: () => void}) {
  const [classes, setClasses] = useState<string[]>([]);
  const [teacherCode, setTeacherCode] = useState(""), [error, setError] = useState("");
  useEffect(() => {
    supabase!.from("classrooms").select("name").order("created_at").then(({data, error}) => {
      if (error) setError(thaiError(error)); else setClasses((data ?? []).map(c => c.name as string));
    });
  }, []);
  const claim = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    const {data, error} = await supabase!.rpc("claim_teacher", {code: teacherCode.trim()});
    if (error) return setError(thaiError(error));
    if (!data) return setError("รหัสครูไม่ถูกต้อง");
    location.reload();
  };
  return <>
    <p className="ll-cloud-note">ห้องเรียน: {classes.join(", ") || "-"} · ครูเห็นเฉพาะข้อมูลของคนในห้องที่ครูสอน เพื่อนไม่เห็นข้อมูลของกันและกัน</p>
    <StudentProgress profile={profile} onContinue={close}/>
    <details className="ll-cloud-details"><summary>สำหรับครู: เปลี่ยนบัญชีนี้เป็นบัญชีครู</summary>
      <form className="ll-cloud-row" onSubmit={claim}>
        <input aria-label="รหัสสำหรับครู" placeholder="รหัสสำหรับครู" value={teacherCode} onChange={e => setTeacherCode(e.target.value)} required autoComplete="off"/>
        <button type="submit">ยืนยัน</button>
      </form>
    </details>
    {error && <p className="ll-cloud-error" role="alert">{error}</p>}
  </>;
}
