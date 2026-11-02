"use client";
import React, {useState} from "react";
import {lessons, type Choice} from "../content/episode01";
import {choosePath, diagnosis, fullExplanation, hintLevel2, midCheck, paths, recheckB, type PathId} from "../content/adaptive04";
import {Choices, Loom, Popup} from "./ui";

// Q04 prototype of the adaptive flowchart (แก้ไข.pdf p.1). The first attempt is stored by the parent
// and never touched here; this component only adds diagnosis/help/recheck fields.
export type AdaptiveStage = "diagnose" | "path" | "mid" | "switch" | "recheck" | "hint2" | "recheckB";
export type AdaptiveRecord = {
  stage?: AdaptiveStage; diagnosis?: Record<string, Choice>; path?: PathId; pathStep?: number;
  midCheck?: Choice; helpSwitched?: boolean; recheck?: Choice; recheckB?: Choice;
};

const u = lessons[3];

function SymbolTable() {
  return (
    <table className="fh-count wide"><thead><tr><th>สัญลักษณ์</th><th>ชนิดพันธะ</th><th>อันดับพันธะ</th><th>อิเล็กตรอนคู่ร่วม</th></tr></thead><tbody>
      <tr><td className="big">C–C</td><td>พันธะเดี่ยว</td><td>1</td><td>1 คู่</td></tr>
      <tr><td className="big">C=C</td><td>พันธะคู่</td><td>2</td><td>2 คู่</td></tr>
      <tr><td className="big">C≡C</td><td>พันธะสาม</td><td>3</td><td>3 คู่</td></tr>
    </tbody></table>
  );
}

// Electron-pair (Lewis-style) picture of C=C: two shared pairs between the carbons.
function PairModel({pairs = 2}: {pairs?: number}) {
  return (
    <svg className="fh-pairs" viewBox="0 0 260 120" role="img" aria-label={`แบบจำลองคู่อิเล็กตรอน ${pairs} คู่ระหว่างคาร์บอน`}>
      <circle cx="70" cy="60" r="34" fill="#2f3432" /><text x="70" y="70" textAnchor="middle" fontSize="30" fill="#fff">C</text>
      <circle cx="190" cy="60" r="34" fill="#2f3432" /><text x="190" y="70" textAnchor="middle" fontSize="30" fill="#fff">C</text>
      {Array.from({length: pairs}, (_, k) => {
        const y = 60 + (k - (pairs - 1) / 2) * 22;
        return <g key={k}><circle cx="122" cy={y} r="6" fill="#e0a526" /><circle cx="138" cy={y} r="6" fill="#3f8bd1" /></g>;
      })}
    </svg>
  );
}

function PathA() {
  return <><h3>เครื่องหมายบอกชนิดพันธะ</h3><p>เส้นระหว่างอะตอมคือพันธะ จำนวนเส้นบอกชนิดและอันดับพันธะ</p><SymbolTable /></>;
}
function PathB() {
  return <><h3>ดูแบบจำลองคู่อิเล็กตรอนของ C=C</h3><PairModel pairs={2} /><p>พันธะคู่เกิดจากคาร์บอนสองอะตอมใช้อิเล็กตรอนร่วมกัน 2 คู่ จึงมีอันดับพันธะเท่ากับ 2 ไม่ใช่ 1</p></>;
}
function PathC() {
  const [show, setShow] = useState(0);
  const steps = ["C(?) ต่อกับ CH₃ ด้วยพันธะเดี่ยว → นับ 1", "C(?) ต่อกับ CH₂ ด้วยพันธะคู่ → นับ 2", "รวมพันธะกับคาร์บอน = 1 + 2 = 3", "ต้องการผลรวม 4 → ขาดอีก 4 − 3 = 1 → เติม H 1 อะตอม"];
  return (
    <><h3>ฝึกนับทีละขั้นกับ CH₃–C(?)=CH₂</h3>
      <ol className="fh-steps">{steps.slice(0, show).map(s => <li key={s} className="fh-pop">{s}</li>)}</ol>
      {show < steps.length && <button onClick={() => setShow(show + 1)}>แสดงขั้นถัดไป ({show + 1}/{steps.length})</button>}
    </>
  );
}

// Hands-on activity used when the first help mode did not work (never repeats the same activity).
function HandsOn({onDone}: {onDone: () => void}) {
  const [pairs, setPairs] = useState(0);
  const [h, setH] = useState(0);
  const sum = 1 + 2 + h;
  return (
    <>
      <h3>ลงมือจัดคู่อิเล็กตรอน</h3>
      <p>1) สร้างพันธะคู่ C=C โดยเติมคู่อิเล็กตรอนระหว่างคาร์บอน</p>
      <PairModel pairs={pairs} />
      <div className="fh-actions"><button onClick={() => setPairs(Math.max(0, pairs - 1))}>− เอาคู่ออก</button><button onClick={() => setPairs(Math.min(3, pairs + 1))}>+ เติมคู่อิเล็กตรอน</button><span className="fh-badge">{pairs} คู่</span></div>
      {pairs === 2 && <>
        <p className="fh-good fh-pop">ถูกต้อง! C=C ใช้อิเล็กตรอนร่วมกัน 2 คู่ = อันดับพันธะ 2</p>
        <p>2) เติม H ให้คาร์บอนตรงกลางของ CH₃–C(?)=CH₂ จนผลรวมอันดับพันธะเท่ากับ 4</p>
        <div className="fh-sumbar"><span>C–CH₃ = 1</span><span>C=CH₂ = 2</span><span>C–H × {h} = {h}</span><b>รวม {sum}</b></div>
        <div className="fh-actions"><button onClick={() => setH(Math.max(0, h - 1))}>− เอา H ออก</button><button onClick={() => setH(Math.min(3, h + 1))}>+ เติม H</button></div>
        {sum > 4 && <p className="fh-hint">เกิน 4 แล้ว ลองเอา H ออก</p>}
        {sum === 4 && <><p className="fh-good fh-pop">ครบ 4 พอดี: คาร์บอนตรงกลางมี H 1 อะตอม</p><button className="fh-primary" onClick={onDone}>ไปทำ Recheck โจทย์ใหม่</button></>}
      </>}
      {pairs === 3 && <p className="fh-hint">3 คู่คือพันธะสาม (≡) ลองเอาออก 1 คู่</p>}
    </>
  );
}

export default function AdaptiveQ04({rec, onChange, onFinish}: {rec: AdaptiveRecord; onChange: (r: AdaptiveRecord) => void; onFinish: () => void}) {
  const [sel, setSel] = useState<Choice>();
  const [pop, setPop] = useState<null | {tone: "good" | "warn"; title: string; text: string; next: () => void}>(null);
  const stage = rec.stage ?? "diagnose";
  const set = (r: AdaptiveRecord) => { setSel(undefined); onChange({...rec, ...r}); };
  const d = rec.diagnosis ?? {};
  const dIndex = diagnosis.findIndex(q => !d[q.id]);
  const path = rec.path ?? "C";
  const pathSteps: PathId[] = path === "D" ? ["A", "B", "C"] : [path];
  const step = Math.min(rec.pathStep ?? 0, pathSteps.length - 1);

  return (
    <div className="fh-adaptive">
      <div className="fh-flow">{(["diagnose", "path", "recheck"] as const).map((s, i) => <span key={s} className={(stage === s || (s === "path" && ["mid", "switch"].includes(stage)) || (s === "recheck" && ["hint2", "recheckB"].includes(stage))) ? "on" : ""}>{i + 1}. {s === "diagnose" ? "วินิจฉัยสาเหตุ" : s === "path" ? "เรียนเสริม" : "ตรวจซ้ำ"}</span>)}</div>

      {stage === "diagnose" && dIndex >= 0 && <>
        <span className="fh-eyebrow">R04 · จำนวนพันธะคาร์บอน · วินิจฉัยสาเหตุย่อย {dIndex + 1}/4</span>
        <Loom pose="think" small>ลองตอบคำถามสั้น ๆ นี้ก่อน ลูมจะได้รู้ว่าควรช่วยตรงไหน</Loom>
        <h2>{diagnosis[dIndex].prompt}</h2>
        <Choices q={diagnosis[dIndex]} value={sel} onChoose={setSel} />
        <button className="fh-primary" disabled={!sel} onClick={() => {
          const next = {...d, [diagnosis[dIndex].id]: sel!};
          if (dIndex < diagnosis.length - 1) set({diagnosis: next});
          else set({diagnosis: next, path: choosePath(next), pathStep: 0, stage: "path"});
        }}>{dIndex < diagnosis.length - 1 ? "ข้อถัดไป" : "ดูผลวินิจฉัย"}</button>
      </>}

      {stage === "path" && <>
        <span className="fh-eyebrow">{paths[path].name} · ระดับ {paths[path].level}</span>
        <p className="fh-hint">สาเหตุที่พบ: {paths[path].cause} (เป็นเบาะแสจากคำตอบ ไม่ใช่การตัดสินผู้เรียนแบบถาวร)</p>
        {path === "D" && <div className="fh-flow small">{pathSteps.map((p, i) => <span key={p} className={i === step ? "on" : ""}>{paths[p].level}</span>)}</div>}
        {pathSteps[step] === "A" && <PathA />}
        {pathSteps[step] === "B" && <PathB />}
        {pathSteps[step] === "C" && <PathC />}
        {step < pathSteps.length - 1
          ? <button className="fh-primary" onClick={() => set({pathStep: step + 1})}>ขั้นถัดไป</button>
          : <button className="fh-primary" onClick={() => set({stage: "mid"})}>ตรวจความเข้าใจระหว่างกิจกรรม</button>}
      </>}

      {stage === "mid" && <>
        <span className="fh-eyebrow">ตรวจความเข้าใจ · {midCheck[path].id}</span>
        {path === "B" && <PairModel pairs={2} />}
        <h2>{midCheck[path].prompt}</h2>
        <Choices q={midCheck[path]} value={sel} onChoose={setSel} />
        <button className="fh-primary" disabled={!sel} onClick={() => {
          const ok = sel === midCheck[path].answer, v = sel!;
          setPop(ok
            ? {tone: "good", title: "เข้าใจแนวคิดย่อยแล้ว!", text: "ไปลองโจทย์ใหม่ระดับ L3 กัน", next: () => set({midCheck: v, stage: "recheck"})}
            : {tone: "warn", title: "ยังไม่ถูก ลองอีกวิธีกัน", text: "ลูมจะเปลี่ยนจากการดูภาพเป็นกิจกรรมลงมือจัดคู่อิเล็กตรอน", next: () => set({midCheck: v, helpSwitched: true, stage: "switch"})});
        }}>ตรวจคำตอบ</button>
      </>}

      {stage === "switch" && <><span className="fh-eyebrow">เปลี่ยนวิธีช่วยเหลือ · กิจกรรมลงมือทำ</span><HandsOn onDone={() => set({stage: "recheck"})} /></>}

      {(stage === "recheck" || stage === "recheckB") && <>
        <span className="fh-eyebrow">{stage === "recheck" ? u.recheck.id + " · Recheck" : recheckB.id + " · Recheck-B โจทย์ใหม่"}</span>
        <h2>{(stage === "recheck" ? u.recheck : recheckB).prompt}</h2>
        <Choices q={stage === "recheck" ? u.recheck : recheckB} value={sel} onChoose={setSel} />
        <button className="fh-primary" disabled={!sel} onClick={() => {
          const v = sel!;
          if (stage === "recheck") {
            if (v === u.recheck.answer) setPop({tone: "good", title: "ถูกต้อง!", text: "คุณนับพันธะของคาร์บอนได้แล้ว", next: () => { set({recheck: v}); onFinish(); }});
            else set({recheck: v, stage: "hint2"});
          } else {
            const ok = v === recheckB.answer;
            setPop(ok ? {tone: "good", title: "ถูกต้อง!", text: "ผ่านหลังได้รับความช่วยเหลือ", next: () => { set({recheckB: v}); onFinish(); }}
              : {tone: "warn", title: "บันทึกสถานะ: ยังต้องทบทวน", text: fullExplanation, next: () => { set({recheckB: v}); onFinish(); }});
          }
        }}>บันทึกคำตอบ</button>
      </>}

      {stage === "hint2" && <>
        <span className="fh-eyebrow">คำอธิบายและคำใบ้ระดับ 2</span>
        <Loom pose="think" small>ยังไม่ถูก ไม่เป็นไร ลองทำตามขั้นนี้ แล้วไปลองโจทย์ใหม่อีกข้อ</Loom>
        <ol className="fh-steps">{hintLevel2.map(h => <li key={h}>{h}</li>)}</ol>
        <button className="fh-primary" onClick={() => set({stage: "recheckB"})}>ทำ Recheck-B โจทย์ใหม่</button>
      </>}

      <Popup open={!!pop} tone={pop?.tone} title={pop?.title ?? ""} onClose={() => { const n = pop?.next; setPop(null); n?.(); }}>
        <p>{pop?.text}</p>
      </Popup>
    </div>
  );
}
