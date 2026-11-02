"use client";
// Adaptive help shown in the learner's VARK style. The PDF path text is the same in every style;
// only its form and order change (picture steps, read-aloud, read + own summary, or activity first).
import {useEffect, useState, type ReactNode} from "react";
import type {Choice} from "../content/episode01";
import type {AdaptiveUnitData} from "../content/adaptiveUnits";
import type {PathId} from "../content/adaptive04";
import {NO_THAI_VOICE, VARK_INFO, VARK_ORDER, canSpeak, markVark, speak, stopSpeak, useThaiVoice, useVark, type VarkKey} from "../vark";
import {loomSrc} from "./ui";
import "../styles/game.css";

const GROUP: Record<"A" | "B" | "C", string> = {A: "พื้นฐาน / สัญลักษณ์", B: "ความเข้าใจคลาดเคลื่อน", C: "นำไปใช้กับสถานการณ์ใหม่"};

// Makes the diagnosis visible: which answers were off and which group they point to.
export function WhyPath({unit, d, path}: {unit: AdaptiveUnitData; d: Record<string, Choice>; path: PathId}) {
  const wrong = unit.diagnosis.filter(q => d[q.id] && d[q.id] !== q.answer);
  const count = (g: "A" | "B" | "C") => wrong.filter(q => q.group === g).length;
  return <section className="gm-why" aria-label="ทำไมลูมเลือกเส้นทางนี้">
    <img src={loomSrc("clipboard")} alt=""/>
    <div>
      <b>🔎 ทำไมลูมเลือก Path {path} ให้เธอ?</b>
      {wrong.length
        ? <>ลูมดูจากคำตอบวินิจฉัย {unit.diagnosis.length} ข้อ พบจุดที่ยังสับสน {wrong.length} ข้อ:
            <ul>{wrong.map(q => <li key={q.id}>{q.id}: {q.prompt} <small>(กลุ่ม {q.group} · {GROUP[q.group]})</small></li>)}</ul></>
        : <>เธอตอบวินิจฉัยถูกทุกข้อ ลูมจึงพาไปฝึกนำความรู้ไปใช้กับสถานการณ์ใหม่</>}
      <div className="gm-chips">{(["A", "B", "C"] as const).map(g => <span key={g} className={`gm-chip ${path === g || (path === "D" && count(g)) ? "on" : ""}`}>กลุ่ม {g} ผิด {count(g)} ข้อ</span>)}
        {path === "D" && <span className="gm-chip on">ผิดหลายกลุ่ม → Path D ทีละขั้น</span>}</div>
    </div>
  </section>;
}

export function VarkHelp({id, title, lines, pre = [], children}: {id: string; title: string; lines: string[]; pre?: string[]; children: ReactNode}) {
  const vark = useVark();
  const thai = useThaiVoice();
  const [mode, setMode] = useState<VarkKey>(vark.pref ?? "K");
  const [talking, setTalking] = useState(false);
  const noteKey = `learnloom-vark-note-${id}`;
  const [note, setNote] = useState("");
  useEffect(() => { if (vark.pref) setMode(vark.pref); }, [vark.pref]);
  useEffect(() => { try { setNote(localStorage.getItem(noteKey) ?? ""); } catch {} return () => stopSpeak(); }, [noteKey]);
  const all = [...pre, ...lines];
  const pick = (k: VarkKey) => { setMode(k); markVark(k); stopSpeak(); setTalking(false); };
  const listen = () => {
    if (talking) { stopSpeak(); setTalking(false); return; }
    setTalking(true); markVark("A");
    if (!speak(`${title}. ${all.join(" ")}`, () => setTalking(false))) setTalking(false);
  };

  const support = mode === "V"
    ? <ol className="gm-steps">{all.map((l, i) => <li key={l}><span aria-hidden>{["🧩", "🔍", "💡", "🎯", "✅", "📌"][i % 6]}</span><p>{l}</p></li>)}</ol>
    : mode === "A"
      ? <div className="gm-listen">
          {canSpeak() ? <button type="button" className="gm-btn" onClick={listen}>{talking ? "⏹ หยุดฟัง" : "🔊 ฟังลูมอธิบายเส้นทางนี้"}</button> : <p className="fh-hint">เบราว์เซอร์นี้อ่านออกเสียงไม่ได้ จึงแสดงเป็นข้อความแทน</p>}
          {canSpeak() && thai === false && <p className="fh-hint">{NO_THAI_VOICE}</p>}
          <details open={thai === false}><summary>ดูข้อความที่ลูมอ่าน</summary>{all.map(l => <p key={l}>{l}</p>)}</details>
        </div>
      : mode === "R"
        ? <div className="gm-read">
            {all.map(l => <p key={l}>{l}</p>)}
            <label>✍️ สรุปด้วยคำของฉัน (บันทึกในเครื่องนี้)
              <textarea rows={3} value={note} onChange={e => { setNote(e.target.value); try { localStorage.setItem(noteKey, e.target.value); } catch {} }} placeholder="เช่น สิ่งที่ต้องจำคือ…"/></label>
          </div>
        : <details className="fh-act-notes"><summary>เกี่ยวกับเส้นทางนี้ (อ่านหลังทำกิจกรรม)</summary>{all.map(l => <p key={l}>{l}</p>)}</details>;

  return <div className={`gm-help mode-${mode}`}>
    <div className="gm-modes" role="group" aria-label="รูปแบบความช่วยเหลือ">
      {VARK_ORDER.map(k => <button key={k} type="button" aria-pressed={mode === k} className={mode === k ? "on" : ""} onClick={() => pick(k)}>{VARK_INFO[k].icon} {VARK_INFO[k].name}</button>)}
    </div>
    {/* the activity keeps its place in the tree (order via CSS) so switching styles never resets it */}
    <div className="gm-help-act">{children}</div>
    <div className="gm-help-support">{support}</div>
  </div>;
}
