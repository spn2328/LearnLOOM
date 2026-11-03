"use client";
import {useEffect, useMemo, useRef, useState, type ReactNode} from "react";
import {speak, stopSpeak, useVark} from "../vark";
import {useDraft} from "../pause";
import {getMedia, type MediaFile} from "../media/registry";
import {mediaSlots, type MediaSlotId} from "../media/slots";
import {loomSrc} from "./ui";
import "../styles/story.css";

// A scene script: plain strings are story lines (kept word-for-word from the source),
// {media} switches the background slot, {quote} renders a line as an on-screen message.
export type ScriptItem = string | {media: MediaSlotId} | {quote: string};
type Beat = {text: string; quote: boolean; file?: MediaFile; slot?: MediaSlotId};

const VOICE_KEY = "learnloom-story-voice";
const readVoicePref = () => { try { return localStorage.getItem(VOICE_KEY) !== "off"; } catch { return true; } };
const SPEAKER = /^(ลูม|ผู้เล่น|เจฟ|ชาวบ้าน|เฮียศักดิ์|แม่)\s*:\s*(.*)$/;
const reducedMotion = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || !!document.querySelector(".reduce-motion"));

// Each line takes the current slot; a slot with several files is spread across its lines in order.
function toBeats(script: ScriptItem[]): Beat[] {
  const firstSlot = script.find((x): x is {media: MediaSlotId} => typeof x === "object" && "media" in x)?.media;
  const runs: {slot?: MediaSlotId; lines: {text: string; quote: boolean}[]}[] = [{slot: firstSlot, lines: []}];
  for (const item of script) {
    if (typeof item === "object" && "media" in item) {
      const last = runs[runs.length - 1];
      if (last.lines.length) runs.push({slot: item.media, lines: []});
      else last.slot = item.media;
    } else runs[runs.length - 1].lines.push(typeof item === "string" ? {text: item, quote: false} : {text: item.quote, quote: true});
  }
  return runs.flatMap(({slot, lines}) => {
    const files = slot ? getMedia(slot) : [];
    return lines.map((l, i) => ({...l, slot, file: files.length ? files[Math.floor((i * files.length) / lines.length)] : undefined}));
  });
}

export default function StoryPlayer({script, end, label = "ฉาก"}: {script: ScriptItem[]; end?: ReactNode; label?: string}) {
  const beats = useMemo(() => toBeats(script), [script]);
  // the line reached is kept, so leaving mid-scene resumes on the same line
  const [at, setI] = useDraft(`story:${label}`, 0);
  const i = Math.min(Math.max(at, 0), Math.max(beats.length - 1, 0));
  const [all, setAll] = useState(false);
  const [muted, setMuted] = useState(true);
  // VARK: listen mode reads each beat aloud, read-write mode opens the full script
  const vark = useVark();
  // Dialogue voice plays as soon as a scene opens (round-2 feedback); a learner who turns it off keeps it off.
  const [voice, setVoiceState] = useState(() => readVoicePref());
  // the browser refused to start sound without a tap: show a clear "start listening" call instead
  const [blocked, setBlocked] = useState(false);
  const setVoice = (on: boolean) => { setVoiceState(on); setBlocked(false); try { localStorage.setItem(VOICE_KEY, on ? "on" : "off"); } catch {} };
  useEffect(() => { if (vark.pref === "A") setVoiceState(true); if (vark.pref === "R") setAll(true); }, [vark.pref]);
  const video = useRef<HTMLVideoElement>(null);
  const beat = beats[i];
  const done = i >= beats.length - 1;
  const file = beat?.file;

  const next = () => setI(Math.min(i + 1, beats.length - 1));
  const back = () => setI(Math.max(i - 1, 0));

  useEffect(() => {
    const v = video.current;
    if (v && !reducedMotion()) v.play().catch(() => {});
  }, [file?.url]);

  useEffect(() => {
    if (!voice || !beat || blocked) return;
    if (started.current === i) { started.current = -1; return () => stopSpeak(); }
    const ua = (navigator as Navigator & {userActivation?: {hasBeenActive: boolean}}).userActivation;
    if (ua && !ua.hasBeenActive) { setBlocked(true); return; }
    speak(beat.text, undefined, () => setBlocked(true));
    return () => stopSpeak();
  }, [voice, i, beat?.text, blocked]);
  // runs inside the tap, so the browser allows sound from here on
  const started = useRef(-1);
  const startVoice = () => { started.current = i; setVoice(true); if (beat) speak(beat.text); };

  if (!beat) return null;
  const m = SPEAKER.exec(beat.text);
  const who = m?.[1];
  const said = m ? m[2] : beat.text;

  return (
    <div className="fh-sp">
      <div className={`fh-sp-stage ${file ? "" : "empty"}`}>
        <div className="fh-sp-media" key={file?.url ?? "none"}>
          {file?.kind === "video" ? (
            <video ref={video} src={file.url} aria-label={beat.slot ? mediaSlots[beat.slot] : ""} playsInline muted={muted} loop={file.loop} preload="auto" />
          ) : file ? (
            <img className={`kb${i % 3}`} src={file.url} alt={beat.slot ? mediaSlots[beat.slot] : ""} decoding="async" />
          ) : (
            <img className="fh-sp-loom" src={loomSrc("think")} alt="" />
          )}
        </div>

        <button type="button" className="fh-sp-tap" aria-label={done ? "จบฉาก" : "แตะเพื่ออ่านประโยคถัดไป"} onClick={next}
          onKeyDown={(e) => { if (e.key === "ArrowLeft") { e.preventDefault(); back(); } }}>
          <span className={`fh-sp-caption ${beat.quote ? "quote" : who ? "say" : "narration"} ${who === "ผู้เล่น" ? "me" : who === "ลูม" ? "loom" : ""}`} key={i} aria-live="polite">
            {who === "ลูม" && <img className="fh-sp-avatar" src={loomSrc(i % 2 ? "think" : "point")} alt="" />}
            <span>
              {who && <b className="fh-sp-who">{who}</b>}
              <span className="fh-sp-line" data-voice={beat.text}>{said}</span>
            </span>
          </span>
          {!done && <em className="fh-sp-more" aria-hidden="true">แตะเพื่อพลิกหน้า ▸</em>}
        </button>

        <div className="fh-sp-tools">
          <button type="button" onClick={() => setVoice(!voice)} aria-pressed={voice} aria-label={voice ? "หยุดให้ลูมอ่านบท" : "ให้ลูมอ่านบทให้ฟัง"}>{voice ? "🗣️" : "🔈"}</button>
          {file?.kind === "video" && (
            <>
              <button type="button" onClick={() => setMuted((v) => !v)} aria-label={muted ? "เปิดเสียงคลิป" : "ปิดเสียงคลิป"}>{muted ? "🔇" : "🔊"}</button>
              <button type="button" onClick={() => { const v = video.current; if (v) { v.currentTime = 0; v.play().catch(() => {}); } }} aria-label="เล่นคลิปอีกครั้ง">↻</button>
            </>
          )}
        </div>
      </div>

      {voice && blocked && (
        <div className="fh-sp-voicecall" role="status">
          <span>🔊 ช่วงนี้มีเสียงบทพูดให้ฟัง</span>
          <button type="button" onClick={startVoice}>▶ กดเพื่อเริ่มฟังเสียง</button>
        </div>
      )}

      <div className="fh-sp-bar">
        <button type="button" onClick={back} disabled={i === 0} aria-label="ประโยคก่อนหน้า">‹ ย้อน</button>
        <div className="fh-sp-dots" role="progressbar" aria-label={label} aria-valuemin={1} aria-valuemax={beats.length} aria-valuenow={i + 1}>
          {beats.map((_, k) => <span key={k} className={k <= i ? "on" : ""} />)}
        </div>
        <button type="button" onClick={() => setAll((v) => !v)} aria-expanded={all}>{all ? "ซ่อนบท" : "อ่านทั้งหมด"}</button>
      </div>

      {all && (
        <ol className="fh-sp-script">
          {beats.map((b, k) => <li key={k} className={b.quote ? "quote" : ""}>{b.text}</li>)}
        </ol>
      )}

      {(done || all) && end && <div className="fh-sp-end">{end}</div>}
    </div>
  );
}
