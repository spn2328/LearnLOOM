"use client";
// Pause button shown on every EP.01 page. Pausing stops the study timer, voice and video; leaving the
// page saves at once; coming back (reload, new tab, sign-in) offers "เรียนต่อจากจุดเดิม" first.
import React, {useEffect, useRef, useState} from "react";
import {addStudy, lastPlace, readStudy, saveDrafts, studyText} from "../pause";
import {stopSpeak} from "../vark";
import {Popup} from "./ui";

const FLUSH_EVERY = 15; // seconds of study time kept in memory before writing
let welcomed = false; // once per page load: a reload or a new tab asks again

export default function PauseControl() {
  const [mode, setMode] = useState<null | "pause" | "welcome">(null);
  const [place, setPlace] = useState<string | null>(null);
  const pending = useRef(0);
  const flush = () => { addStudy(pending.current); pending.current = 0; };

  useEffect(() => {
    if (welcomed) return;
    welcomed = true;
    const at = lastPlace();
    if (at) { setPlace(at); setMode("welcome"); }
  }, []);

  // count study time only while open, visible and not paused
  useEffect(() => {
    if (mode) return;
    const t = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (++pending.current >= FLUSH_EVERY) flush();
    }, 1000);
    return () => { clearInterval(t); flush(); };
  }, [mode]);

  // save on leave / hide (autosave of answers already happens on every change)
  useEffect(() => {
    const save = () => { flush(); saveDrafts(); };
    const hide = () => { if (document.visibilityState === "hidden") save(); };
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", hide);
    return () => { window.removeEventListener("pagehide", save); document.removeEventListener("visibilitychange", hide); save(); };
  }, []);

  function pause() {
    flush(); saveDrafts(); stopSpeak();
    document.querySelectorAll("video, audio").forEach(m => (m as HTMLMediaElement).pause());
    setPlace(lastPlace());
    setMode("pause");
  }

  const welcome = mode === "welcome";
  return <>
    {!mode && <button className="fh-pause" onClick={pause} aria-label="พักการเรียน"><span aria-hidden="true">❚❚</span> พัก</button>}
    <Popup open={!!mode} title={welcome ? "ยินดีต้อนรับกลับ" : "พักอยู่"} onClose={() => setMode(null)}
      actions={<button className="fh-primary" onClick={() => setMode(null)}>{welcome ? "เรียนต่อจากจุดเดิม" : "เรียนต่อ"}</button>}>
      {place && <p>{welcome ? "หยุดไว้ที่" : "อยู่ที่"} <b>{place}</b></p>}
      <p>{welcome ? "คำตอบที่ทำไว้ยังอยู่ครบ ไม่ต้องเริ่มใหม่" : "บันทึกความคืบหน้าแล้ว ปิดหน้านี้ได้เลย กลับมาก็เรียนต่อจากตรงนี้ได้"}</p>
      <p className="fh-muted">เวลาเรียนสะสม {studyText(readStudy().seconds + pending.current)}{welcome ? "" : " · หยุดนับเวลาระหว่างพัก"}</p>
    </Popup>
  </>;
}
