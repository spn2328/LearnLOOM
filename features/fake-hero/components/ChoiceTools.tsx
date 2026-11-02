"use client";
// VARK tools on every multiple-choice question. The question text, choices and answer key never change;
// each style only adds a way in: V colours the atoms in formulas, A reads the item aloud, R keeps a note,
// K lets the learner cross out choices they have ruled out before answering.
import {Fragment, useEffect, useState, type ReactNode} from "react";
import type {Question} from "../content/episode01";
import {NO_THAI_SHORT, canListen, markVark, speak, stopSpeak, useThaiVoice, useVark} from "../vark";

const ATOM = /(?<![A-Za-z])(Cl|Br|C|H|O|N)(?![a-z])/g;

// V: colour element symbols so the structure of a formula stands out (text stays identical for screen readers)
export function atoms(v: ReactNode): ReactNode {
  if (typeof v !== "string") return v;
  const out: ReactNode[] = [];
  let at = 0;
  for (const m of v.matchAll(ATOM)) {
    out.push(v.slice(at, m.index), <span key={m.index} className={`gm-atom gm-atom-${m[1]}`}>{m[1]}</span>);
    at = m.index! + m[1].length;
  }
  out.push(v.slice(at));
  return <>{out.map((x, i) => <Fragment key={i}>{x}</Fragment>)}</>;
}

export function useChoiceTools(q: Question) {
  const {pref} = useVark();
  const thai = useThaiVoice();
  const [out, setOut] = useState<Record<number, boolean>>({});
  const [talk, setTalk] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const key = `learnloom-vark-q-${q.id}`;
  useEffect(() => { setOut({}); try { setNote(localStorage.getItem(key) ?? ""); } catch {} return () => stopSpeak(); }, [key]);

  const listen = () => {
    if (talk) { stopSpeak(); setTalk(false); return; }
    markVark("A"); setTalk(true);
    const parts = [q.prompt, ...q.choices.flatMap((c, i) => [`ตัวเลือก ${"ABCD"[i]}`, String(c)])];
    if (!speak(parts, () => setTalk(false))) setTalk(false);
  };
  const bar = pref ? <div className="gm-qtools" role="group" aria-label="เครื่องมือตามสไตล์การเรียน">
    {pref === "V" && <span className="gm-qtip">👁️ สีบอกธาตุ: <span className="gm-atom gm-atom-C">C</span> คาร์บอน <span className="gm-atom gm-atom-H">H</span> ไฮโดรเจน <span className="gm-atom gm-atom-O">O</span> ออกซิเจน</span>}
    {pref === "A" && canListen() && <button type="button" className="gm-qbtn" onClick={listen}>{talk ? "⏹ หยุดฟัง" : "🔊 ฟังโจทย์และตัวเลือก"}</button>}
    {pref === "A" && thai === false && <span className="gm-qtip">{NO_THAI_SHORT}</span>}
    {pref === "R" && <button type="button" className="gm-qbtn" aria-expanded={noteOpen} onClick={() => { setNoteOpen(o => !o); if (!noteOpen) markVark("R"); }}>📝 จดโน้ตข้อนี้</button>}
    {pref === "K" && <span className="gm-qtip">✋ แตะ ✕ เพื่อตัดตัวเลือกที่คิดว่าไม่ใช่ออกก่อน แล้วค่อยเลือกคำตอบ</span>}
    {pref === "R" && noteOpen && <textarea className="gm-qnote" rows={2} value={note} placeholder="โจทย์ถามอะไร / คำสำคัญคือ…" aria-label="โน้ตของฉันสำหรับข้อนี้"
      onChange={e => { setNote(e.target.value); try { localStorage.setItem(key, e.target.value); } catch {} }}/>}
  </div> : null;
  const cut = (i: number) => pref === "K" ? <button type="button" className="gm-cut" aria-pressed={!!out[i]} aria-label={`${out[i] ? "คืน" : "ตัด"}ตัวเลือก ${"ABCD"[i]}`}
    onClick={() => { if (!out[i]) markVark("K"); setOut(o => ({...o, [i]: !o[i]})); }}>{out[i] ? "↺" : "✕"}</button> : null;
  return {pref, bar, cut, out, fmt: pref === "V" ? atoms : (v: ReactNode) => v};
}
