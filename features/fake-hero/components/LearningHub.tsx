"use client";
// Dashboard pages around the Fake Hero story: home, chapter library, episode list/intro,
// progress, notebook, certificate and settings. Everything is read from this browser's saves.
import {useEffect, useState, type ReactNode} from "react";
import SendResult from "./SendResult";
import {GameHud, GameProgress, GameQuests} from "./GameHub";
import DevPanel from "./DevPanel";
import {loomSrc} from "./ui";
import {savedWhere} from "../cloud/client";
import {getMedia} from "../media/registry";
import {lessons} from "../content/episode01";
import {buildResult, type StudentResult} from "../results";
import "../styles/hub.css";
import {ArrowRight,Circle,LockKeyhole,Plus,Trash2,Download,HelpCircle} from "lucide-react";
import {CheckCircle2,Play,Award,NotebookPen,BookOpen,ChartNoAxesCombined} from "./CuteIcons";

export type HubMode = "home" | "library" | "episodes" | "intro" | "progress" | "notebook" | "certificates" | "settings";
export type HubSettings = {
  fontSize: number; setFontSize: (n: number) => void;
  reduce: boolean; setReduce: (b: boolean) => void;
  offlineReady: boolean; offlineBusy: boolean; prepareOffline: () => void;
};

const ACTIVITY_KEY = "learnloom-activity-v1";
const NOTES_KEY = "learnloom-notes-v1";
type Activity = {study: string[]; notebook: string[]; base: Record<string, number>};

const today = () => new Date().toLocaleDateString("sv-SE");
function readJSON<T>(key: string, fallback: T): T {
  try { return {...fallback, ...JSON.parse(localStorage.getItem(key) || "{}")}; } catch { return fallback; }
}
function readActivity(): Activity { return readJSON<Activity>(ACTIVITY_KEY, {study: [], notebook: [], base: {}}); }
function writeActivity(a: Activity) { try { localStorage.setItem(ACTIVITY_KEY, JSON.stringify(a)); } catch {} }

// Called when the student opens the story or the notebook (local activity log only).
export function markActivity(kind: "study" | "notebook") {
  const a = readActivity(), d = today();
  if (!a[kind].includes(d)) { a[kind] = [...a[kind], d].slice(-60); writeActivity(a); }
}

export const hubImage = (slot: string) => getMedia(slot).find(m => m.kind === "image")?.url ?? "/images/archive.webp";

export const episodes = [
  ["EP.01", "คนในคลิป", "พันธะของคาร์บอนและรูปแบบโครงสร้าง", "ep01-s02a"],
  ["EP.02", "ฮีโร่ของแม่น้ำ", "สูตรโครงสร้างลิวอิส แบบย่อ และแบบเส้นพันธะ", "ep01-s09-2"],
  ["EP.03", "ฉลากที่ซ่อนอยู่", "หมู่ฟังก์ชัน", "ep01-s09-3"],
  ["EP.04", "รหัสของสาร", "ชื่อสารอินทรีย์และไอโซเมอร์", "ep01-s08-2"],
  ["EP.05", "คราบที่หายไป", "สมบัติการละลายของสารประกอบอินทรีย์", "ep01-s09-1"],
  ["EP.06", "เปิดโปงฮีโร่", "บูรณาการความรู้และประเมินผล", "ep01-s02c"],
] as const;

const summaries = [
  "การมีคาร์บอนไม่ใช่เกณฑ์เดียวสำหรับจำแนกสารอินทรีย์",
  "พันธะเดี่ยว คู่ สาม ใช้อิเล็กตรอนร่วมกัน 1, 2, 3 คู่",
  "ประเภทโครงสร้างพิจารณาจากการเชื่อมต่อของคาร์บอน",
  "ผลรวมอันดับพันธะของคาร์บอนในสารอินทรีย์เป็นกลางทั่วไปมักเท่ากับ 4",
  "สูตรโมเลกุลบอกจำนวนอะตอม สูตรโครงสร้างบอกการเชื่อมต่อ",
];

type Data = {r: StudentResult; started: number; active: boolean; pct: number; next: number; act: Activity};
function load(): Data {
  const r = buildResult();
  const started = r.concepts.filter(c => c.outcome !== "ยังไม่ได้ทำ").length;
  let active = false;
  try { active = !!localStorage.getItem("learnloom-fake-hero-v1") || !!localStorage.getItem("learnloom-fake-hero-ep01-extension-v1"); } catch {}
  // Six milestones: five concepts plus the episode ending.
  const pct = Math.round((started + (r.finished ? 1 : 0)) / 6 * 100);
  const next = r.concepts.findIndex(c => c.outcome === "ยังไม่ได้ทำ");
  const act = readActivity();
  if (act.base[today()] === undefined) { act.base = {[today()]: started}; writeActivity(act); }
  return {r, started, active, pct, next, act};
}

function Bar({value, tone = "green", label}: {value: number; tone?: "green" | "amber" | "red"; label: string}) {
  return <div className={`fh-bar ${tone}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label={label}><span style={{width: value + "%"}}/></div>;
}

function Ring({value, children}: {value: number; children: ReactNode}) {
  return <div className="fh-ring" style={{["--v" as string]: value}}><div>{children}</div></div>;
}

const outcomeTone = (o: string) => o === "ผ่านด้วยตนเอง" ? "green" : o === "ผ่านหลังช่วยเหลือ" ? "amber" : "red";
const outcomeValue = (o: string) => o === "ยังไม่ได้ทำ" ? 0 : o === "ยังต้องทบทวน" ? 50 : 100;

export default function LearningHub({mode, go, onStart, nickname = "", settings}: {mode: HubMode; go: (v: string) => void; onStart: () => void; nickname?: string; settings?: HubSettings}) {
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => { if (mode === "notebook") markActivity("notebook"); setData(load()); }, [mode]);
  if (!data) return <section className="page-content fh-hub"/>;
  const {r, started, active, pct, next} = data;
  const startLabel = r.finished ? "ทบทวน EP.01" : active ? "เรียนต่อ EP.01" : "เริ่ม EP.01";

  return <section className={`page-content fh-hub fh-hub-${mode}`}>
    {mode === "home" && <Home data={data} nickname={nickname} go={go} onStart={onStart}/>}

    {mode === "library" && <>
      <Title eyebrow="LEARNLOOM · เคมีอินทรีย์ ม.6" title="คลังบทเรียน" text="หนึ่ง Chapter เท่ากับหนึ่งซีรีส์ แบ่งเป็น Episode ตามลำดับการเรียนรู้"/>
      <LibraryTabs finished={r.finished} active={active} go={go}/>
    </>}

    {mode === "episodes" && <>
      <article className="fh-series-head">
        <img src={hubImage("ep01-l01")} alt=""/>
        <div><span className="fh-chip red">Chapter 1</span><h1>The Fake Hero</h1><p>เคมีอินทรีย์ ม.6 · ซีรีส์สืบสวน 6 ตอน</p></div>
      </article>
      <ol className="fh-timeline">
        {episodes.map(([id, title, desc, slot], i) => <li key={id} className={i === 0 ? "open" : "locked"}>
          <span className="fh-dot" aria-hidden/>
          <img src={hubImage(slot)} alt=""/>
          <div><b>{id} {title}</b><small>{i === 0 ? (r.finished ? "เรียนจบตอนแล้ว" : active ? `กำลังเรียน · ${pct}%` : desc) : "ยังไม่เปิดให้เรียน"}</small></div>
          {i === 0
            ? <button className="fh-play" aria-label={`เปิด ${id} ${title}`} onClick={() => go("intro")}><Play size={20} fill="currentColor"/></button>
            : <LockKeyhole size={20} aria-label="ยังไม่เปิด"/>}
        </li>)}
      </ol>
    </>}

    {mode === "intro" && <article className="fh-intro">
      <div className="fh-intro-art"><img src={hubImage("ep01-l01")} alt="เจฟกับลูมเปิดสมุดข้อมูลเคมีริมแม่น้ำ"/></div>
      <div className="fh-intro-copy">
        <span className="fh-chip red">Chapter 1 : The Fake Hero</span>
        <h1>EP.01 คนในคลิป</h1>
        <p>ตามหาความจริงจากคราบปริศนาในแม่น้ำปราจีนบุรี</p>
        <ol className="fh-concepts">
          {lessons.map((l, i) => <li key={l.main.id}>
            {r.concepts[i].outcome === "ยังไม่ได้ทำ" ? <Circle size={18}/> : <CheckCircle2 size={18}/>}
            <span><b>C0{i + 1}</b> {l.title}</span>
          </li>)}
        </ol>
        <div className="fh-intro-progress"><Bar value={pct} label="ความคืบหน้า EP.01"/><small>{pct}%</small></div>
        <div className="fh-row"><button className="primary" onClick={onStart}>{active ? "เรียนต่อ" : "เริ่มตอนนี้"}<ArrowRight size={18}/></button><button className="secondary" onClick={() => go("episodes")}>เลือกตอนอื่น</button></div>
      </div>
    </article>}

    {mode === "progress" && <>
      <Title eyebrow="ความก้าวหน้าของฉัน" title="ความก้าวหน้าของฉัน" text="เรียนรู้ตามจังหวะของตัวเอง ดูสิ่งที่เข้าใจแล้วและสิ่งที่ควรทบทวน"/>
      <div className="fh-progress-grid">
        <article className="fh-card fh-progress-ring">
          <Ring value={pct}><b>{pct}%</b><small>EP.01</small></Ring>
          <p>เรียนแล้ว {started}/5 แนวคิด<br/><small>ซีรีส์: จบ {r.finished ? 1 : 0}/6 ตอน</small></p>
          <button className="primary" onClick={onStart}>{startLabel}<ArrowRight size={18}/></button>
        </article>
        <article className="fh-card">
          <h2>ความเข้าใจแต่ละแนวคิด (EP.01)</h2>
          <ul className="fh-concept-bars">
            {r.concepts.map((c, i) => <li key={c.id}>
              <b>{c.id}</b><span>{lessons[i].title}</span>
              <Bar value={outcomeValue(c.outcome)} tone={outcomeTone(c.outcome)} label={`${c.id} ${c.outcome}`}/>
              <small>{c.outcome}</small>
            </li>)}
          </ul>
          <p className="fine">Checkpoint: {r.checkpoint.score}/10 · {savedWhere()}</p>
        </article>
      </div>
      <GameHud r={r}/>
      <GameProgress r={r}/>
      {active && <article className="fh-card"><h2>ส่งผลการเรียนให้ครู</h2><SendResult className="secondary" hint={false}/></article>}
    </>}

    {mode === "notebook" && <Notebook r={r}/>}

    {mode === "certificates" && <>
      <Title eyebrow="เกียรติบัตร" title="เกียรติบัตร" text="เกียรติบัตรประจำซีรีส์ The Fake Hero"/>
      <div className="fh-cert-grid">
        <div className="fh-cert locked" aria-label="ตัวอย่างเกียรติบัตร ยังไม่เปิดรับ">
          <img src={loomSrc("cheer")} alt=""/>
          <small>LearnLOOM</small>
          <b>เกียรติบัตร</b>
          <span>ผ่านการเรียนรู้</span>
          <h2>The Fake Hero</h2>
          <span>เคมีอินทรีย์ ม.6</span>
          <em><LockKeyhole size={16}/> ยังไม่เปิดรับ</em>
        </div>
        <article className="fh-card">
          <h2><Award size={22}/> เงื่อนไขการรับเกียรติบัตร</h2>
          <ul className="fh-checks">
            <li className={r.finished ? "done" : ""}>{r.finished ? <CheckCircle2 size={18}/> : <Circle size={18}/>}เรียน EP.01 จบ</li>
            <li><Circle size={18}/>เรียนครบทั้ง 6 ตอน ({r.finished ? 1 : 0}/6)</li>
            <li><Circle size={18}/>ผ่านการประเมินปลายซีรีส์</li>
          </ul>
          <button className="primary" disabled><Download size={18}/>ดาวน์โหลดเกียรติบัตร</button>
          <p className="fine">ไม่ใช่เอกสารรับรองคุณวุฒิทางการศึกษา</p>
        </article>
      </div>
    </>}

    {mode === "settings" && settings && <>
      <Title eyebrow="ตั้งค่า" title="ตั้งค่า และอื่น ๆ" text="ปรับการอ่านให้สบายกับการเรียน"/>
      <article className="fh-card fh-settings">
        <div className="fh-setting"><span>ขนาดตัวอักษร</span><div className="fh-sizes" role="group" aria-label="ขนาดตัวอักษร">
          {[16, 18, 22].map((n, i) => <button key={n} aria-pressed={settings.fontSize === n} style={{fontSize: 14 + i * 4}} onClick={() => settings.setFontSize(n)}>ก</button>)}
        </div></div>
        <label className="fh-setting"><span>ลดภาพเคลื่อนไหว</span><input type="checkbox" role="switch" className="fh-switch" checked={settings.reduce} onChange={e => settings.setReduce(e.target.checked)}/></label>
        <div className="fh-setting"><span>ดาวน์โหลดไว้ใช้แบบออฟไลน์<small>{settings.offlineReady ? "มีชุดบทเรียนบนเครื่องนี้แล้ว" : "ดาวน์โหลดข้อความ ภาพ และกิจกรรมไว้ในเครื่อง"}</small></span>
          <button className="secondary" disabled={settings.offlineBusy} onClick={settings.prepareOffline}><Download size={17}/>{settings.offlineBusy ? "กำลังเตรียม…" : settings.offlineReady ? "เตรียมใหม่" : "เตรียมบทเรียน"}</button></div>
        <div className="fh-setting"><span>คู่มือ ไฟล์สำรอง และกู้คืนข้อมูล</span><button className="secondary" onClick={() => go("guide")}><HelpCircle size={17}/>เปิดคู่มือ</button></div>
      </article>
      <DevPanel/>
    </>}
  </section>;
}

function Title({eyebrow, title, text}: {eyebrow: string; title: string; text: string}) {
  return <div className="page-title"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>;
}

function Home({data, nickname, go, onStart}: {data: Data; nickname: string; go: (v: string) => void; onStart: () => void}) {
  const {r, active, pct} = data;
  const startLabel = r.finished ? "ทบทวน EP.01" : active ? "เรียนต่อจากจุดเดิม" : "เริ่มสืบคดี";
  return <>
    <div className="ll-welcome-line"><small>พื้นที่เรียนรู้ของคุณ</small></div>
    <section className="ll-hero" aria-label="เรียนเคมีผ่านการสืบคดี">
      <div className="ll-hero-copy">
        <span className="ll-kicker">LEARNLOOM · เคมีอินทรีย์ ม.6</span>
        <h1>เรียนเคมีให้เข้าใจ<br/><span className="ll-highlight">ทีละเบาะแส</span></h1>
        <div className="ll-hero-actions"><button className="primary" onClick={onStart}>{startLabel}<ArrowRight size={19}/></button><button className="text-button" onClick={() => go("episodes")}>ดูทุกตอน<ArrowRight size={17}/></button></div>      </div>
      <div className="ll-browser">
        <div className="ll-browser-top" aria-hidden="true"><i/><i/><i/><span>LearnLOOM / ห้องเรียนของคุณ</span></div>
        <div className="ll-browser-body">
          <div className="ll-preview-heading"><b>{r.finished ? "คดีที่เรียนจบแล้ว" : active ? "เรียนต่อจากตรงนี้" : "คดีแรกของคุณ"}</b><span>Chapter 01</span></div>
          <article className="ll-case-card">
            <img src={hubImage("ep01-s02a")} alt="ภาพเดิมจากเรื่อง The Fake Hero เจฟกับลูมสืบหาความจริง"/>
            <div className="ll-case-copy"><div><small>THE CHEMISTRY CASE FILE</small><h2>The Fake Hero</h2><p>EP.01 คนในคลิป</p></div><button className="fh-play" aria-label={active ? "เรียนต่อ EP.01" : "เริ่ม EP.01"} onClick={() => go("intro")}><Play size={21} fill="currentColor"/></button></div>
          </article>
          <div className="ll-mini-progress"><span>ความคืบหน้า EP.01</span><b>{pct}%</b><Bar value={pct} label="ความคืบหน้า EP.01"/></div>
          <div className="ll-preview-foot"><img src={loomSrc("happy")} alt="ลูมแพนด้าแดง"/><span>ลูมพร้อมช่วย เมื่อมีเรื่องที่ยังสงสัย<br/>ซีรีส์ The Fake Hero · จบ {r.finished ? 1 : 0}/6 ตอน</span></div>
        </div>
      </div>
    </section>
    <div className="ll-shortcuts" aria-label="ทางลัดการเรียนรู้">
      <button className="ll-shortcut" onClick={() => go("courses")}><BookOpen/><span><b>คลังบทเรียน</b><small>เลือกเรื่องที่อยากเรียน</small></span><ArrowRight/></button>
      <button className="ll-shortcut" onClick={() => go("skills")}><ChartNoAxesCombined/><span><b>ความก้าวหน้า</b><small>ดูสิ่งที่เข้าใจมากขึ้น</small></span><ArrowRight/></button>
      <button className="ll-shortcut" onClick={() => go("notebook")}><NotebookPen/><span><b>สมุดของฉัน</b><small>เก็บหลักฐานและข้อสงสัย</small></span><ArrowRight/></button>
    </div>
    <div className="ll-section-title"><h2>ทุกก้าวของการเรียนรู้</h2><span>ค่อย ๆ ไปต่อ ในแบบของคุณ</span></div>
    <GameHud r={r}/>
    <GameQuests r={r}/>
    <aside className="fh-card ll-home-concepts">
      <h3>แนวคิดใน EP.01</h3>
      <ul className="fh-checks">{lessons.map((l, i) => { const done = r.concepts[i]?.outcome !== "ยังไม่ได้ทำ"; return <li key={i} className={done ? "done" : ""}>{done ? <CheckCircle2 size={18}/> : <Circle size={18}/>}C0{i + 1} {l.title}</li>; })}</ul>
    </aside>
    <div className="section-heading"><h2>บทเรียนของฉัน</h2><button className="text-button" onClick={() => go("courses")}>ดูคลังบทเรียน<ArrowRight size={16}/></button></div>
    <div className="fh-chapter-tiles">
      <button className="fh-tile red" onClick={() => go("episodes")}><span>Chapter 1</span><b>The Fake Hero</b><img src={hubImage("ep01-l01")} alt=""/></button>
      {[2, 3, 4].map(n => <div className="fh-tile locked" key={n}><span>Chapter {n}</span><LockKeyhole size={22} aria-label="ยังไม่เปิด"/></div>)}
    </div>
    <button className="fh-link-card" onClick={onStart}><NotebookPen size={20}/><span>{active ? "เรียนต่อจากจุดเดิมทันที" : "เริ่มเรียน EP.01 ทันที"}</span><ArrowRight size={18}/></button>
  </>;
}

function LibraryTabs({finished, active, go}: {finished: boolean; active: boolean; go: (v: string) => void}) {
  const [tab, setTab] = useState<"all" | "doing" | "done">("all");
  const show = tab === "all" || (tab === "doing" ? active && !finished : finished);
  return <>
    <div className="fh-tabs" role="tablist">
      {([["all", "ทั้งหมด"], ["doing", "กำลังเรียน"], ["done", "เรียนจบ"]] as const).map(([id, label]) =>
        <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>)}
    </div>
    <div className="fh-chapters">
      {show && <article className="fh-chapter open">
        <img src={hubImage("ep01-l01")} alt=""/>
        <div><b>Chapter 1</b><span>The Fake Hero</span><small>{finished ? "จบ" : active ? "กำลังเรียน" : "พร้อมเรียน"} · {finished ? 1 : 0}/6 ตอน</small></div>
        <button className="fh-play" aria-label="เปิด Chapter 1 The Fake Hero" onClick={() => go("episodes")}><Play size={20} fill="currentColor"/></button>
      </article>}
      {tab === "all" && [2, 3, 4].map(n => <article className="fh-chapter locked" key={n}>
        <img src={hubImage("ep01-s09-2")} alt=""/>
        <div><b>Chapter {n}</b><small>เร็ว ๆ นี้</small></div>
        <LockKeyhole size={20} aria-label="ยังไม่เปิด"/>
      </article>)}
      {!show && <p className="fh-empty">{tab === "doing" ? "ยังไม่มีบทเรียนที่กำลังเรียน" : "ยังไม่มีบทเรียนที่เรียนจบ"}</p>}
    </div>
  </>;
}

function Notebook({r}: {r: StudentResult}) {
  const [tab, setTab] = useState<"summary" | "evidence" | "ideas">("summary");
  const [notes, setNotes] = useState<{id: number; text: string}[]>([]);
  const [draft, setDraft] = useState("");
  useEffect(() => { try { setNotes(JSON.parse(localStorage.getItem(NOTES_KEY) || "[]")); } catch {} }, []);
  function save(list: typeof notes) { setNotes(list); try { localStorage.setItem(NOTES_KEY, JSON.stringify(list)); } catch {} }
  const started = r.concepts[0].outcome !== "ยังไม่ได้ทำ";
  const evidence = [
    ["ep01-s02a", "ชาวบ้านถามถึงคลิป", "คลิปแสดงเจฟเทของเหลวลงท่อระบายน้ำ", started],
    ["ep01-s02b", "ข้อความจากแม่", "แม่ของเจฟส่งข้อความหาเจฟ", started],
    ["ep01-s02c", "คำให้การของเจฟ", "เจฟให้การว่าเป็นน้ำเชื่อมบูด แต่คำกล่าวอ้างยังไม่ใช่ผลตรวจสาร", started],
    ["ep01-s08-2", "ยังต้องตรวจ", "ของเหลวในถังและต้นกำเนิดคราบบนแม่น้ำ", r.finished],
  ] as const;
  return <>
    <Title eyebrow="สมุดบันทึกของฉัน" title="สมุดบันทึกของฉัน" text="สรุปเนื้อหา หลักฐานคดี และความคิดของคุณ เปิดอ่านได้ตลอดการเรียน"/>
    <div className="fh-tabs" role="tablist">
      {([["summary", "สรุปเนื้อหา"], ["evidence", "หลักฐานคดี"], ["ideas", "ไอเดียของฉัน"]] as const).map(([id, label]) =>
        <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>)}
    </div>
    {tab === "summary" && <ul className="fh-note-list">
      {lessons.map((l, i) => { const open = r.concepts[i].outcome !== "ยังไม่ได้ทำ"; return <li key={l.main.id} className={open ? "" : "locked"}>
        {open ? <CheckCircle2 size={20}/> : <LockKeyhole size={20}/>}
        <div><b>C0{i + 1} — {l.title}</b><p>{open ? summaries[i] : "เปิดเมื่อเรียนแนวคิดนี้แล้ว"}</p></div>
      </li>; })}
    </ul>}
    {tab === "evidence" && <div className="fh-evidence">
      {evidence.map(([slot, title, text, open]) => <article key={slot} className={open ? "" : "locked"}>
        {open ? <img src={hubImage(slot)} alt=""/> : <div className="fh-evidence-lock"><LockKeyhole size={26}/></div>}
        <b>{open ? title : "ยังไม่พบหลักฐาน"}</b><p>{open ? text : "เรียนต่อเพื่อเก็บหลักฐานชิ้นนี้"}</p>
      </article>)}
    </div>}
    {tab === "ideas" && <div className="fh-ideas">
      <form className="fh-card" onSubmit={e => { e.preventDefault(); if (draft.trim()) { save([{id: Date.now(), text: draft.trim()}, ...notes]); setDraft(""); } }}>
        <label htmlFor="fh-idea">จดสิ่งที่สงสัยหรือสิ่งที่ค้นพบ</label>
        <textarea id="fh-idea" value={draft} maxLength={500} onChange={e => setDraft(e.target.value)} placeholder="เช่น คราบแวววาวบนน้ำน่าจะมาจากอะไร?"/>
        <button className="primary" disabled={!draft.trim()}><Plus size={18}/>เพิ่มบันทึก</button>
      </form>
      {notes.map(n => <article className="fh-card fh-idea" key={n.id}>
        <p>{n.text}</p>
        <small>{new Date(n.id).toLocaleDateString("th-TH", {day: "numeric", month: "short"})}</small>
        <button className="fh-icon" aria-label="ลบบันทึกนี้" onClick={() => save(notes.filter(x => x.id !== n.id))}><Trash2 size={17}/></button>
      </article>)}
      <p className="fine">{savedWhere()}</p>
    </div>}
  </>;
}
