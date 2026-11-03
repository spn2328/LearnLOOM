"use client";
import React, {useState} from "react";
import type {Choice, Question} from "../content/episode01";
import type {PathId} from "../content/adaptive04";
import {nextSwitch, pickPath, pickTransfer, type AdaptiveUnitData} from "../content/adaptiveUnits";
import {Choices, Loom, Popup} from "./ui";
import {PathActivity} from "./PathActivities";
import {VarkHelp, WhyPath} from "./VarkHelp";
import {useDraft} from "../pause";

// Generic adaptive flow for R01–R05 (เนื้อเรื่องและคำถามล่าสุด.pdf):
// diagnose → path (hands-on activity + PDF text) → practice R0x-1/R0x-2 (a wrong item switches to
// another path's activity, then the item is tried once more; ข้อมูลเว็บล่าสุด.pdf p.11) → recheck RC0x → RC0x-B if wrong → transfer.
// The first attempt is stored by the parent and never touched here.
export type UnitStage = "diagnose" | "path" | "practice" | "switch" | "recheck" | "recheckB" | "transfer";
export type UnitRecord = {
  stage?: UnitStage; diagnosis?: Record<string, Choice>; path?: PathId; pathStep?: number;
  practice?: Record<string, Choice>; recheck?: Choice;
  // help switches: the first practice answer stays in practice; the retry after the switch goes to practiceRetry
  switches?: {at: string; from: PathId; to: PathId}[]; switchFor?: string; practiceRetry?: Record<string, Choice>; recheckB?: Choice; transfer?: string;
};

export const unitRoute = (unit: AdaptiveUnitData, n: UnitRecord) =>
  `${unit.paths[n.path ?? "C"].name}${(n.switches ?? []).map(x => ` → เปลี่ยนวิธีช่วยเป็น Path ${x.to}`).join("")} → Recheck${n.recheckB ? " → Recheck-B" : ""}${n.transfer ? " → ยืนยันความเข้าใจ" : ""}`;

export default function AdaptiveUnit({unit, rec, onChange, onFinish}: {unit: AdaptiveUnitData; rec: UnitRecord; onChange: (r: UnitRecord) => void; onFinish: () => void}) {
  const [pop, setPop] = useState<null | {tone: "good" | "warn"; title: string; text: string; next: () => void}>(null);
  const stage = rec.stage ?? "diagnose";
  const d = rec.diagnosis ?? {};
  const dIndex = unit.diagnosis.findIndex(q => !d[q.id]);
  const path = rec.path ?? "C";
  const pathSteps: PathId[] = path === "D" ? ["A", "B", "C"] : [path];
  const step = Math.min(rec.pathStep ?? 0, pathSteps.length - 1);
  const transfer = pickTransfer(unit, d);
  const pr = rec.practice ?? {};
  const pIndex = unit.practice.findIndex(q => !pr[q.id]);
  const switches = rec.switches ?? [];
  const lastSwitch = switches[switches.length - 1];
  const retry = rec.practiceRetry ?? {};
  const retryQ = rec.switchFor && !retry[rec.switchFor] ? unit.practice.find(q => q.id === rec.switchFor) : undefined;
  // move on to the recheck once every practice item has a first answer and no retry is pending
  const afterPractice = (r: UnitRecord): UnitRecord => unit.practice.every(q => (r.practice ?? pr)[q.id]) ? {...r, stage: "recheck"} : r;
  const answerText = (q: Question) => q.choices[q.answer.charCodeAt(0) - 65];
  // picks not yet saved, typed text and finished activities survive a pause or reload (pause.ts)
  const [sel, setSel] = useDraft<Choice | undefined>(`${unit.id}:pick:${stage}:${dIndex}:${pIndex}:${retryQ?.id ?? ""}`, undefined);
  const [text, setText] = useDraft(`${unit.id}:transfer`, rec.transfer ?? "");
  const [actDone, setDone] = useDraft<Record<string, boolean>>(`${unit.id}:activities`, {});
  const setActDone = (f: (a: Record<string, boolean>) => Record<string, boolean>) => setDone(f(actDone));
  const [shown, setShown] = useState(!!rec.transfer);
  const set = (r: UnitRecord) => { setSel(undefined); onChange({...rec, ...r}); };
  const flowOn = (s: string) => s === stage || (s === "recheck" && stage === "recheckB") || (s === "path" && (stage === "practice" || stage === "switch"));

  const ask = (q: Question, label: string, onSave: (v: Choice) => void) => <>
    <span className="fh-eyebrow">{q.id} · {label}</span>
    <h2>{q.prompt}</h2>
    <Choices q={q} value={sel} onChoose={setSel} />
    <button className="fh-primary" disabled={!sel} onClick={() => onSave(sel!)}>บันทึกคำตอบ</button>
  </>;

  return (
    <div className="fh-adaptive">
      <div className="fh-flow">{(["diagnose", "path", "recheck", "transfer"] as const).map((s, i) => <span key={s} className={flowOn(s) ? "on" : ""}>{i + 1}. {s === "diagnose" ? "วินิจฉัยสาเหตุ" : s === "path" ? "เรียนเสริม" : s === "recheck" ? "ตรวจซ้ำ" : "ยืนยันความเข้าใจ"}</span>)}</div>

      {stage === "diagnose" && dIndex >= 0 && <>
        <span className="fh-eyebrow">{unit.label} · ข้อ {dIndex + 1}/{unit.diagnosis.length}</span>
        <Loom pose="think" small>ลองตอบคำถามสั้น ๆ นี้ก่อน ลูมจะได้รู้ว่าควรช่วยตรงไหน</Loom>
        <h2>{unit.diagnosis[dIndex].prompt}</h2>
        <Choices q={unit.diagnosis[dIndex]} value={sel} onChoose={setSel} />
        <button className="fh-primary" disabled={!sel} onClick={() => {
          const next = {...d, [unit.diagnosis[dIndex].id]: sel!};
          if (dIndex < unit.diagnosis.length - 1) set({diagnosis: next});
          else set({diagnosis: next, path: pickPath(unit, next), pathStep: 0, stage: "path"});
        }}>{dIndex < unit.diagnosis.length - 1 ? "ข้อถัดไป" : "ดูผลวินิจฉัย"}</button>
      </>}

      {stage === "path" && <>
        <span className="fh-eyebrow">{unit.paths[path].name} · {unit.paths[path].level}</span>
        <p className="fh-hint">เส้นทางนี้เลือกจากคำตอบวินิจฉัย เป็นเบาะแสว่าควรช่วยตรงไหน ไม่ใช่การตัดสินผู้เรียนแบบถาวร</p>
        {step === 0 && <WhyPath unit={unit} d={d} path={path} />}
        {path === "D" && <div className="fh-flow small">{pathSteps.map((p, i) => <span key={p} className={i === step ? "on" : ""}>{unit.paths[p].level}</span>)}</div>}
        {path === "D" && <h3>{unit.paths[pathSteps[step]].name}</h3>}
        <VarkHelp key={`${pathSteps[step]}-${step}`} id={`${unit.id}-${pathSteps[step]}`} title={unit.paths[pathSteps[step]].name} pre={path === "D" && step === 0 ? unit.paths.D.lines : []} lines={unit.paths[pathSteps[step]].lines}>
          <PathActivity unit={unit.id} path={pathSteps[step]} onDone={() => setActDone(a => ({...a, [`${pathSteps[step]}-${step}`]: true}))} />
        </VarkHelp>
        {!actDone[`${pathSteps[step]}-${step}`] && <p className="fh-hint">ทำกิจกรรมด้านบนให้สำเร็จก่อน แล้วปุ่มจะกดได้</p>}
        {step < pathSteps.length - 1
          ? <button className="fh-primary" disabled={!actDone[`${pathSteps[step]}-${step}`]} onClick={() => set({pathStep: step + 1})}>ขั้นถัดไป</button>
          : <button className="fh-primary" disabled={!actDone[`${pathSteps[step]}-${step}`]} onClick={() => set({stage: "practice"})}>ทำแบบฝึกก่อนตรวจซ้ำ</button>}
      </>}

      {stage === "practice" && retryQ && ask(retryQ, "ลองอีกครั้งหลังเปลี่ยนวิธี", v => {
        const ok = v === retryQ.answer;
        setPop({tone: ok ? "good" : "warn", title: ok ? "ถูกต้อง! วิธีนี้ช่วยได้" : "ยังไม่ถูก", text: ok ? "ไปต่อกัน" : `คำตอบที่ถูกคือ ${answerText(retryQ)}`,
          next: () => set(afterPractice({practiceRetry: {...retry, [retryQ.id]: v}}))});
      })}

      {stage === "practice" && !retryQ && pIndex >= 0 && ask(unit.practice[pIndex], `แบบฝึก ${pIndex + 1}/${unit.practice.length}`, v => {
        const q = unit.practice[pIndex];
        if (v === q.answer) { setPop({tone: "good", title: "ถูกต้อง!", text: "ไปข้อต่อไปกัน", next: () => set(afterPractice({practice: {...pr, [q.id]: v}}))}); return; }
        const to = nextSwitch(path, switches.map(x => x.to));
        setPop({tone: "warn", title: "ยังไม่ถูก ลองอีกวิธีกัน", text: "วิธีเดิมอาจยังไม่ช่วย ลูมจะเปลี่ยนเป็นกิจกรรมแบบอื่น แล้วกลับมาลองข้อนี้อีกครั้ง",
          next: () => set({practice: {...pr, [q.id]: v}, stage: "switch", switchFor: q.id, switches: [...switches, {at: q.id, from: path, to}]})});
      })}

      {stage === "switch" && lastSwitch && <>
        <span className="fh-eyebrow">เปลี่ยนวิธีช่วย · {unit.paths[lastSwitch.to].name}</span>
        <Loom pose="point" small>วิธีแรกอาจยังไม่ช่วย ลองมองอีกแบบนะ ทำกิจกรรมนี้ให้สำเร็จ แล้วกลับไปลองข้อ {lastSwitch.at} อีกครั้ง</Loom>
        <VarkHelp key={`sw-${switches.length}`} id={`${unit.id}-${lastSwitch.to}`} title={unit.paths[lastSwitch.to].name} lines={unit.paths[lastSwitch.to].lines}>
          <PathActivity unit={unit.id} path={lastSwitch.to} onDone={() => setActDone(a => ({...a, [`sw-${switches.length}`]: true}))} />
        </VarkHelp>
        {!actDone[`sw-${switches.length}`] && <p className="fh-hint">ทำกิจกรรมด้านบนให้สำเร็จก่อน แล้วปุ่มจะกดได้</p>}
        <button className="fh-primary" disabled={!actDone[`sw-${switches.length}`]} onClick={() => set({stage: "practice"})}>ลองข้อเดิมอีกครั้ง</button>
      </>}

      {stage === "recheck" && ask(unit.recheck, "Recheck", v => {
        if (v === unit.recheck.answer) setPop({tone: "good", title: "ถูกต้อง!", text: "ผ่านการตรวจซ้ำแล้ว ไปยืนยันความเข้าใจอีกขั้น", next: () => set({recheck: v, stage: "transfer"})});
        else setPop({tone: "warn", title: "ยังไม่ถูก ลองโจทย์ใหม่อีกข้อ", text: `คำตอบที่ถูกคือ ${answerText(unit.recheck)}`, next: () => set({recheck: v, stage: "recheckB"})});
      })}

      {stage === "recheckB" && ask(unit.recheckB, "Recheck-B โจทย์ใหม่", v => {
        const ok = v === unit.recheckB.answer;
        setPop(ok ? {tone: "good", title: "ถูกต้อง!", text: "ผ่านหลังได้รับความช่วยเหลือ", next: () => set({recheckB: v, stage: "transfer"})}
          : {tone: "warn", title: "บันทึกสถานะ: ยังต้องทบทวน", text: `คำตอบที่ถูกคือ ${answerText(unit.recheckB)} ครูจะเห็นแนวคิดนี้ในรายงาน`, next: () => set({recheckB: v, stage: "transfer"})});
      })}

      {stage === "transfer" && <>
        <span className="fh-eyebrow">{transfer.id}</span>
        {transfer.structure && <p className="fh-formula">{transfer.structure}<small>? คือจำนวน H ที่เชื่อมกับคาร์บอนตรงกลาง</small></p>}
        <h2>{transfer.prompt}</h2>
        <textarea className="fh-reason" rows={3} value={text} onChange={e => setText(e.target.value)} placeholder="พิมพ์คำตอบและเหตุผลของคุณ" aria-label="คำตอบยืนยันความเข้าใจ" />
        {!shown
          ? <button className="fh-primary" disabled={!text.trim()} onClick={() => { setShown(true); onChange({...rec, transfer: text.trim()}); }}>บันทึกคำตอบ</button>
          : <>
            {transfer.answer && <p className="fh-good fh-pop">แนวคำตอบ: {transfer.answer}</p>}
            {!transfer.answer && <p className="fh-hint">บันทึกคำตอบแล้ว ครูจะอ่านเหตุผลนี้ในรายงาน</p>}
            <button className="fh-primary" onClick={onFinish}>ไปต่อ</button>
          </>}
      </>}

      <Popup open={!!pop} tone={pop?.tone} title={pop?.title ?? ""} onClose={() => { const n = pop?.next; setPop(null); n?.(); }}>
        <p>{pop?.text}</p>
      </Popup>
    </div>
  );
}
