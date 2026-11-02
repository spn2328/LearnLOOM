"use client";
import React, {useState} from "react";
import type {Choice, Question} from "../content/episode01";
import type {PathId} from "../content/adaptive04";
import {pickPath, pickTransfer, type AdaptiveUnitData} from "../content/adaptiveUnits";
import {Choices, Loom, Popup} from "./ui";
import {PathActivity} from "./PathActivities";

// Generic adaptive flow for R01–R05 (เนื้อเรื่องและคำถามล่าสุด.pdf):
// diagnose → path (hands-on activity + PDF text) → practice R0x-1/R0x-2 → recheck RC0x → RC0x-B if wrong → transfer.
// The first attempt is stored by the parent and never touched here.
export type UnitStage = "diagnose" | "path" | "practice" | "recheck" | "recheckB" | "transfer";
export type UnitRecord = {
  stage?: UnitStage; diagnosis?: Record<string, Choice>; path?: PathId; pathStep?: number;
  practice?: Record<string, Choice>; recheck?: Choice; recheckB?: Choice; transfer?: string;
};

export default function AdaptiveUnit({unit, rec, onChange, onFinish}: {unit: AdaptiveUnitData; rec: UnitRecord; onChange: (r: UnitRecord) => void; onFinish: () => void}) {
  const [sel, setSel] = useState<Choice>();
  const [text, setText] = useState(rec.transfer ?? "");
  const [shown, setShown] = useState(false);
  const [actDone, setActDone] = useState<Record<string, boolean>>({});
  const [pop, setPop] = useState<null | {tone: "good" | "warn"; title: string; text: string; next: () => void}>(null);
  const stage = rec.stage ?? "diagnose";
  const set = (r: UnitRecord) => { setSel(undefined); onChange({...rec, ...r}); };
  const d = rec.diagnosis ?? {};
  const dIndex = unit.diagnosis.findIndex(q => !d[q.id]);
  const path = rec.path ?? "C";
  const pathSteps: PathId[] = path === "D" ? ["A", "B", "C"] : [path];
  const step = Math.min(rec.pathStep ?? 0, pathSteps.length - 1);
  const transfer = pickTransfer(unit, d);
  const pr = rec.practice ?? {};
  const pIndex = unit.practice.findIndex(q => !pr[q.id]);
  const answerText = (q: Question) => q.choices[q.answer.charCodeAt(0) - 65];
  const flowOn = (s: string) => s === stage || (s === "recheck" && stage === "recheckB") || (s === "path" && stage === "practice");

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
        {path === "D" && <div className="fh-flow small">{pathSteps.map((p, i) => <span key={p} className={i === step ? "on" : ""}>{unit.paths[p].level}</span>)}</div>}
        {path === "D" && <h3>{unit.paths[pathSteps[step]].name}</h3>}
        <PathActivity key={`${pathSteps[step]}-${step}`} unit={unit.id} path={pathSteps[step]} onDone={() => setActDone(a => ({...a, [`${pathSteps[step]}-${step}`]: true}))} />
        <details className="fh-act-notes">
          <summary>เกี่ยวกับเส้นทางนี้</summary>
          {(path === "D" && step === 0 ? unit.paths.D.lines : []).map(l => <p key={l} className="fh-hint">{l}</p>)}
          {unit.paths[pathSteps[step]].lines.map(l => <p key={l}>{l}</p>)}
        </details>
        {!actDone[`${pathSteps[step]}-${step}`] && <p className="fh-hint">ทำกิจกรรมด้านบนให้สำเร็จก่อน แล้วปุ่มจะกดได้</p>}
        {step < pathSteps.length - 1
          ? <button className="fh-primary" disabled={!actDone[`${pathSteps[step]}-${step}`]} onClick={() => set({pathStep: step + 1})}>ขั้นถัดไป</button>
          : <button className="fh-primary" disabled={!actDone[`${pathSteps[step]}-${step}`]} onClick={() => set({stage: "practice"})}>ทำแบบฝึกก่อนตรวจซ้ำ</button>}
      </>}

      {stage === "practice" && pIndex >= 0 && ask(unit.practice[pIndex], `แบบฝึก ${pIndex + 1}/${unit.practice.length}`, v => {
        const q = unit.practice[pIndex], ok = v === q.answer;
        setPop({tone: ok ? "good" : "warn", title: ok ? "ถูกต้อง!" : "ยังไม่ถูก", text: ok ? "ไปข้อต่อไปกัน" : `คำตอบที่ถูกคือ ${answerText(q)}`,
          next: () => set({practice: {...pr, [q.id]: v}, ...(pIndex === unit.practice.length - 1 ? {stage: "recheck" as const} : {})})});
      })}

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
