// Device ⇄ Supabase sync. The lesson components keep writing to localStorage exactly as before;
// this module watches those writes, turns them into append-only rows in a local outbox and sends the
// outbox when online. Row ids are stable, so re-sending after a failure never creates duplicates.
import {supabase, type CloudProfile} from "./client";
import {buildResult} from "../results";
import {lessons, checkpoint, checkpointReasons} from "../content/episode01";
import {eventsFrom, conceptsFrom, hasAnswers, type EventRow, type ConceptRow, type Keys} from "./records";
import {initialGame} from "@/lib/learning";

const EPISODE = "EP01";
const META = "learnloom-cloud-v1";
const OUTBOX = "learnloom-cloud-outbox-v1";
const PROFILE_KEY = "learnloom-demo-v1";
const PROGRESS_KEYS = ["learnloom-fake-hero-v1", "learnloom-fake-hero-ep01-extension-v1"];
// Device settings and sync bookkeeping are not learner progress.
const NOT_PROGRESS = [META, OUTBOX, "learnloom-auth", "learnloom-dev-sheet-v1", "learnloom-sfx-v1"];

type Attempt = {id: string; number: number; startedAt: string; finished: boolean; hadAnswers: boolean};
type Meta = {userId: string; attempt: Attempt; pendingNew: boolean; revision: number; syncedAt: number | null};
type AttemptRow = {id: string; user_id: string; episode: string; number: number; started_at: string; finished_at: string | null};
type Outbox = {attempts: Record<string, AttemptRow>; events: Record<string, EventRow>; concepts: Record<string, ConceptRow>; snapshot: boolean};

export type SyncStatus = "offline" | "pending" | "syncing" | "synced" | "error";
type State = {status: SyncStatus; pending: number; syncedAt: number | null; error: string};

const keys: Keys = {
  main: Object.fromEntries(lessons.map(l => [l.main.id, l.main.answer])),
  reason: Object.fromEntries(lessons.map(l => [l.main.id, l.reason.answer])),
  checkpoint: Object.fromEntries(checkpoint.map(q => [q.id, q.answer])),
  checkpointReason: Object.fromEntries(checkpointReasons.map(q => [q.id, q.answer])),
};

const raw = {get: Storage.prototype.getItem, set: Storage.prototype.setItem, remove: Storage.prototype.removeItem};
const read = <T,>(k: string): T | null => { try { return JSON.parse(raw.get.call(localStorage, k) ?? "null"); } catch { return null; } };
const write = (k: string, v: unknown) => raw.set.call(localStorage, k, JSON.stringify(v));
const emptyOutbox = (): Outbox => ({attempts: {}, events: {}, concepts: {}, snapshot: false});

let state: State = {status: "synced", pending: 0, syncedAt: null, error: ""};
const listeners = new Set<() => void>();
function setState(p: Partial<State>) { state = {...state, ...p}; listeners.forEach(f => f()); }
export const syncStore = {get: () => state, subscribe(f: () => void) { listeners.add(f); return () => { listeners.delete(f); }; }};

export function isProgressKey(k: string) { return k.startsWith("learnloom-") && !NOT_PROGRESS.includes(k); }
function progressKeys() {
  const out: string[] = [];
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && isProgressKey(k)) out.push(k); }
  return out.sort();
}
export function hasLocalProgress() { return PROGRESS_KEYS.some(k => raw.get.call(localStorage, k) !== null); }
function newAttempt(number: number): Attempt {
  return {id: crypto.randomUUID(), number, startedAt: new Date().toISOString(), finished: false, hadAnswers: false};
}
function pendingCount(o: Outbox) { return Object.keys(o.attempts).length + Object.keys(o.events).length + Object.keys(o.concepts).length + (o.snapshot ? 1 : 0); }

/** Read the current local result into the outbox. Runs before any progress key is overwritten or removed. */
export function capture() {
  const meta = read<Meta>(META);
  if (!meta) return;
  const r = buildResult();
  const answered = hasAnswers(r);
  // A restart empties the local run; the next answer then opens a new attempt instead of overwriting the old one.
  if (meta.attempt.hadAnswers && !answered) meta.pendingNew = true;
  if (answered && meta.pendingNew) { meta.attempt = newAttempt(meta.attempt.number + 1); meta.pendingNew = false; }
  if (answered) meta.attempt.hadAnswers = true;
  if (r.finished) meta.attempt.finished = true;
  write(META, meta);
  const o = read<Outbox>(OUTBOX) ?? emptyOutbox();
  const now = new Date().toISOString();
  const a = meta.attempt;
  o.attempts[a.id] = {id: a.id, user_id: meta.userId, episode: EPISODE, number: a.number, started_at: a.startedAt, finished_at: a.finished ? (o.attempts[a.id]?.finished_at ?? now) : null};
  const sent = new Set(read<string[]>(META + "-sent") ?? []);
  for (const e of eventsFrom(r, keys, a.id, meta.userId, now)) if (!sent.has(e.id) && !o.events[e.id]) o.events[e.id] = e;
  for (const c of conceptsFrom(r, a.id, meta.userId, now)) o.concepts[`${c.attempt_id}|${c.concept}`] = c;
  o.snapshot = true;
  write(OUTBOX, o);
  setState({pending: pendingCount(o), status: navigator.onLine ? "pending" : "offline"});
}

let busy = false;
/** Send the outbox. Safe to call repeatedly; everything is idempotent on the server. */
export async function flush(): Promise<boolean> {
  const meta = read<Meta>(META);
  if (!supabase || !meta || busy) return false;
  if (!navigator.onLine) { setState({status: "offline"}); return false; }
  const o = read<Outbox>(OUTBOX) ?? emptyOutbox();
  if (!pendingCount(o)) { setState({status: "synced", pending: 0}); return true; }
  busy = true; setState({status: "syncing"});
  try {
    const attempts = Object.values(o.attempts);
    if (attempts.length) {
      const {error} = await supabase.from("attempts").upsert(attempts.map(({finished_at, ...a}) => ({...a, finished_at: null})), {onConflict: "id", ignoreDuplicates: true});
      if (error) throw error;
      for (const a of attempts.filter(a => a.finished_at)) {
        const {error: e2} = await supabase.from("attempts").update({finished_at: a.finished_at}).eq("id", a.id).is("finished_at", null);
        if (e2) throw e2;
      }
    }
    const events = Object.values(o.events);
    for (let i = 0; i < events.length; i += 200) {
      const {error} = await supabase.from("answer_events").upsert(events.slice(i, i + 200), {onConflict: "id", ignoreDuplicates: true});
      if (error) throw error;
    }
    const concepts = Object.values(o.concepts);
    if (concepts.length) {
      const {error} = await supabase.from("concept_results").upsert(concepts, {onConflict: "attempt_id,concept"});
      if (error) throw error;
    }
    if (o.snapshot) {
      const data: Record<string, string> = {};
      for (const k of progressKeys()) data[k] = raw.get.call(localStorage, k) ?? "";
      const {error} = await supabase.from("progress_snapshots").upsert({user_id: meta.userId, episode: EPISODE, data: {keys: data, attempt: meta.attempt, pendingNew: meta.pendingNew}, revision: meta.revision + 1, updated_at: new Date().toISOString()}, {onConflict: "user_id,episode"});
      if (error) throw error;
      meta.revision += 1;
    }
    // Remove only what was sent; anything captured meanwhile stays queued.
    const now = read<Outbox>(OUTBOX) ?? emptyOutbox();
    const sent = new Set(read<string[]>(META + "-sent") ?? []);
    for (const a of attempts) if (JSON.stringify(now.attempts[a.id]) === JSON.stringify(a)) delete now.attempts[a.id];
    for (const e of events) { delete now.events[e.id]; sent.add(e.id); }
    for (const c of concepts) { const k = `${c.attempt_id}|${c.concept}`; if (now.concepts[k]?.updated_at === c.updated_at) delete now.concepts[k]; }
    if (o.snapshot) now.snapshot = false;
    write(OUTBOX, now); write(META + "-sent", [...sent]);
    meta.syncedAt = Date.now(); write(META, {...read<Meta>(META)!, revision: meta.revision, syncedAt: meta.syncedAt});
    const left = pendingCount(now);
    setState({status: left ? "pending" : "synced", pending: left, syncedAt: meta.syncedAt, error: ""});
    return left === 0;
  } catch (e) {
    setState({status: navigator.onLine ? "error" : "offline", error: e instanceof Error ? e.message : String((e as {message?: string})?.message ?? e)});
    return false;
  } finally { busy = false; }
}

let restoring = false;
let installed = false;
let timer: ReturnType<typeof setTimeout> | undefined;
/** Hook localStorage once: capture the old run before any progress key changes, then capture + send shortly after. */
export function installSync() {
  if (installed || !supabase) return;
  installed = true;
  const later = () => { clearTimeout(timer); timer = setTimeout(() => { capture(); void flush(); }, 1500); };
  Storage.prototype.setItem = function (k: string, v: string) {
    if (this === localStorage && isProgressKey(k)) { if (restoring) return; try { capture(); } catch {} raw.set.call(this, k, v); later(); return; }
    raw.set.call(this, k, v);
  };
  Storage.prototype.removeItem = function (k: string) {
    if (this === localStorage && isProgressKey(k)) { if (restoring) return; try { capture(); } catch {} raw.remove.call(this, k); later(); return; }
    raw.remove.call(this, k);
  };
  window.addEventListener("online", () => void flush());
  window.addEventListener("offline", () => setState({status: "offline"}));
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") { try { capture(); } catch {} void flush(); } });
  setInterval(() => void flush(), 30000);
  const o = read<Outbox>(OUTBOX);
  setState({pending: o ? pendingCount(o) : 0, syncedAt: read<Meta>(META)?.syncedAt ?? null, status: navigator.onLine ? (o && pendingCount(o) ? "pending" : "synced") : "offline"});
}

function writeLocalProfile(p: CloudProfile) {
  const saved = read<any>(PROFILE_KEY);
  const grade = saved?.profile?.grade ?? (p.role === "teacher" ? "ครู" : "ม.6");
  write(PROFILE_KEY, {identity: {id: "local-demo", signed: false, display: ""}, game: initialGame(), revision: 0, syncedAt: null, classroom: null, ...saved,
    profile: {id: "local-demo", nickname: p.nickname, role: p.role, grade, classroom_id: null, signed: 1}});
}

export type AdoptResult = "ready" | "restored" | "conflict";
/**
 * Attach this device to the signed-in account. Never silently mixes two people's progress:
 * - device already belongs to this account → keep going
 * - device empty, account has progress → restore it (resume where you left off)
 * - device has progress, account empty → upload it as the account's first attempt
 * - both have progress → ask the learner (conflict); server history is kept either way.
 */
export async function adoptDevice(p: CloudProfile, choice?: "account" | "device"): Promise<AdoptResult> {
  if (!supabase) return "ready";
  const meta = read<Meta>(META);
  if (meta?.userId === p.id && !choice) { writeLocalProfile(p); return "ready"; }
  const [{data: snap, error}, {data: last}] = await Promise.all([
    supabase.from("progress_snapshots").select("data, revision").eq("user_id", p.id).eq("episode", EPISODE).maybeSingle(),
    supabase.from("attempts").select("number").eq("user_id", p.id).eq("episode", EPISODE).order("number", {ascending: false}).limit(1).maybeSingle(),
  ]);
  if (error) throw error;
  const nextNumber = (last?.number ?? 0) + 1;
  const local = hasLocalProgress();
  if (snap && local && !choice) return "conflict";
  if (snap && (!local || choice === "account")) {
    restoring = true;
    for (const k of progressKeys()) raw.remove.call(localStorage, k);
    const d = snap.data as {keys: Record<string, string>; attempt: Attempt; pendingNew?: boolean};
    for (const [k, v] of Object.entries(d.keys ?? {})) if (isProgressKey(k)) raw.set.call(localStorage, k, v);
    write(META, {userId: p.id, attempt: d.attempt ?? newAttempt(nextNumber), pendingNew: !!d.pendingNew, revision: snap.revision, syncedAt: Date.now()});
    write(OUTBOX, emptyOutbox());
    writeLocalProfile(p);
    return "restored";
  }
  // Device progress (or nothing yet) becomes a new attempt on this account.
  write(META, {userId: p.id, attempt: newAttempt(nextNumber), pendingNew: false, revision: snap?.revision ?? 0, syncedAt: null});
  write(OUTBOX, emptyOutbox());
  raw.remove.call(localStorage, META + "-sent");
  writeLocalProfile(p);
  capture();
  await flush();
  return "ready";
}

/** Send what is left, then remove this account's progress from the device. Returns false if unsent data would be lost. */
export async function signOutDevice(force = false): Promise<boolean> {
  if (!supabase) return true;
  try { capture(); } catch {}
  const ok = await flush();
  if (!ok && !force) return false;
  restoring = true;
  await supabase.auth.signOut();
  for (const k of [...progressKeys(), META, OUTBOX, META + "-sent", PROFILE_KEY]) raw.remove.call(localStorage, k);
  return true;
}

export function deviceAccount() { return read<Meta>(META)?.userId ?? null; }
