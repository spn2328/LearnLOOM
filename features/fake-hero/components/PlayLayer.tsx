"use client";
// Overlay around the Fake Hero story: the VARK style dock (with tap-to-listen), the first-visit
// style quiz, and XP / level-up / badge pop-ups. XP is derived from the saved result (game.ts).
import {useEffect, useRef, useState} from "react";
import {buildResult} from "../results";
import {CARD_ICON, badgesOf, cardsOf, levelOf, questTick, xpOf} from "../game";
import {setSfx, sfx, sfxOn} from "../sfx";
import {NO_THAI_VOICE, useThaiVoice, VARK_INFO, VARK_ORDER, VARK_QUIZ, canListen, markVark, quizResult, setVarkPref, skipVarkQuiz, speak, stopSpeak, textParts, useVark, type VarkKey} from "../vark";
import {loomSrc} from "./ui";
import {autoSync} from "../sheets";
import "../styles/game.css";

const SEEN_KEY = "learnloom-game-seen-v1";
const TEXT = "h1,h2,h3,p,li,label,.fh-choice,.fh-sp-line,.fh-act-card,.fh-act-bin b";

function readSeen(): {xp: number; level: number; badges: string[]; cards?: string[]} | null {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || "null"); } catch { return null; }
}

export function VarkQuiz({onClose}: {onClose: () => void}) {
  const [ans, setAns] = useState<Record<string, VarkKey>>({});
  const [i, setI] = useState(0);
  const [done, setDone] = useState<VarkKey>();
  const q = VARK_QUIZ[i];
  return <div className="gm-modal" role="dialog" aria-modal="true" aria-labelledby="gm-quiz-title">
    <div className="gm-modal-card gm-pop">
      <img className="gm-modal-loom" src={loomSrc(done ? "cheer" : "think")} alt=""/>
      {!done ? <>
        <span className="gm-eyebrow">สไตล์การเรียนของฉัน · ข้อ {i + 1}/{VARK_QUIZ.length}</span>
        <h2 id="gm-quiz-title">{q.q}</h2>
        <div className="gm-quiz">{VARK_ORDER.map(k => <button key={k} type="button" onClick={() => {
          const next = {...ans, [q.id]: k}; setAns(next);
          if (i < VARK_QUIZ.length - 1) setI(i + 1); else { const r = quizResult(next); setVarkPref(r, "quiz", next); setDone(r); }
        }}><span aria-hidden>{VARK_INFO[k].icon}</span>{q.a[k]}</button>)}</div>
        <button type="button" className="gm-link" onClick={() => { skipVarkQuiz(); onClose(); }}>ข้ามไปก่อน (เลือกทีหลังได้ที่ปุ่มสไตล์เรียน)</button>
      </> : <>
        <span className="gm-eyebrow">ลูมจะปรับบทเรียนให้เธอ</span>
        <h2 id="gm-quiz-title">{VARK_INFO[done].icon} สไตล์ “{VARK_INFO[done].name}”</h2>
        <p>{VARK_INFO[done].tip}</p>
        <p className="gm-fine">เปลี่ยนสไตล์ได้ตลอดจากปุ่มมุมล่างซ้าย ทุกสไตล์ยังเข้าถึงได้ครบ แค่สลับลำดับให้เหมาะกับเธอ</p>
        <button type="button" className="gm-btn" onClick={onClose}>ไปสืบคดีกัน!</button>
      </>}
    </div>
  </div>;
}

export default function PlayLayer() {
  const vark = useVark();
  const thai = useThaiVoice();
  const [open, setOpen] = useState(false);
  const [quiz, setQuiz] = useState(false);
  const [reading, setReading] = useState(false);
  const [toasts, setToasts] = useState<{id: number; icon: string; text: string}[]>([]);
  const [levelUp, setLevelUp] = useState<{level: number; name: string} | null>(null);
  const [sound, setSound] = useState(true);
  useEffect(() => setSound(sfxOn()), []);
  const last = useRef<Element | null>(null);
  const pref = vark.pref;

  // first visit: ask once which style suits the learner
  useEffect(() => { const t = setTimeout(() => { if (!pref && !vark.skipped) setQuiz(true); }, 900); return () => clearTimeout(t); }, [pref, vark.skipped]);

  // the chosen style is a page-wide attribute so CSS and components can follow it
  useEffect(() => {
    if (pref) document.documentElement.dataset.vark = pref; else delete document.documentElement.dataset.vark;
    if (pref !== "A") stopSpeak();
  }, [pref]);

  // listen mode: tap any text in the story to hear it
  useEffect(() => {
    if (pref !== "A") return;
    const on = (e: MouseEvent) => {
      const el = (e.target as Element).closest?.(TEXT);
      if (!el || !el.closest(".fh-shell,.fh-sp") || el.closest(".gm-dock,.fh-sp-tap")) return;
      last.current?.classList.remove("gm-reading");
      el.classList.add("gm-reading"); last.current = el;
      speak(textParts(el), () => el.classList.remove("gm-reading"));
    };
    document.addEventListener("click", on, true);
    return () => { document.removeEventListener("click", on, true); last.current?.classList.remove("gm-reading"); };
  }, [pref]);

  // XP watcher: compare with what the learner has already seen and celebrate the difference
  useEffect(() => {
    const tick = () => {
      const r = buildResult(), {xp, parts} = xpOf(r), lv = levelOf(xp);
      const got = badgesOf(r, vark.use).filter(b => b.got);
      const seen = readSeen();
      const cards = cardsOf(r);
      const save = () => { try { localStorage.setItem(SEEN_KEY, JSON.stringify({xp, level: lv.level, badges: got.map(b => b.id), cards})); } catch {} };
      const quests = questTick(xp, vark.use, vark.pref).newly;
      if (!seen) { save(); return; }
      const add: {icon: string; text: string}[] = [];
      if (xp > seen.xp) add.push({icon: "⭐", text: `+${xp - seen.xp} XP · ${parts[parts.length - 1]?.label ?? ""}`});
      got.filter(b => !seen.badges.includes(b.id)).forEach(b => add.push({icon: b.icon, text: `ได้เหรียญ “${b.name}”`}));
      const newCards = cards.filter(c => !(seen.cards ?? cards).includes(c));
      newCards.forEach(c => add.push({icon: CARD_ICON[c] ?? "🃏", text: `ได้การ์ดหลักฐาน ${c} เข้าแฟ้มคดี`}));
      quests.forEach(q => add.push({icon: "🎟️", text: `ภารกิจวันนี้สำเร็จ: ${q.name}`}));
      if (lv.level > seen.level) { setLevelUp({level: lv.level, name: lv.name}); sfx("level"); }
      else if (got.length > seen.badges.length || newCards.length) sfx(newCards.length ? "card" : "badge");
      else if (quests.length) sfx("quest");
      else if (xp > seen.xp) sfx("xp");
      if (add.length || xp !== seen.xp || newCards.length) save();
      autoSync(r, xp !== seen.xp);
      if (add.length) {
        const stamp = Date.now();
        setToasts(t => [...t, ...add.map((a, k) => ({...a, id: stamp + k}))]);
        setTimeout(() => setToasts(t => t.filter(x => x.id < stamp)), 3800);
      }
    };
    tick();
    const t = setInterval(tick, 1500);
    return () => clearInterval(t);
  }, [vark.use, vark.pref]);

  const choose = (k: VarkKey) => { setVarkPref(k, "choose"); setOpen(false); };
  const readPage = () => {
    if (reading) { stopSpeak(); setReading(false); return; }
    const root = document.querySelector(".fh-shell");
    const text = root ? [...root.querySelectorAll("h1,h2,h3,p,.fh-choice,.fh-sp-line")].filter(e => (e as HTMLElement).offsetParent && !e.closest(".gm-dock")).flatMap(textParts) : [];
    markVark("A"); setReading(true);
    if (!speak(text, () => setReading(false))) setReading(false);
  };

  return <>
    <div className={`gm-dock ${open ? "open" : ""}`}>
      {open && <div className="gm-dock-panel gm-pop" role="group" aria-label="เลือกสไตล์การเรียน">
        <b>เรียนแบบไหนดี?</b>
        {VARK_ORDER.map(k => <button key={k} type="button" aria-pressed={pref === k} className={pref === k ? "on" : ""} onClick={() => choose(k)}>
          <span aria-hidden>{VARK_INFO[k].icon}</span><span><b>{VARK_INFO[k].name}</b><small>{VARK_INFO[k].long}</small></span>
        </button>)}
        {pref === "A" && thai === false && <p className="gm-fine">{NO_THAI_VOICE}</p>}
        <button type="button" className="gm-link" onClick={() => { setOpen(false); setQuiz(true); }}>ทำแบบทดสอบสไตล์อีกครั้ง</button>
      </div>}
      <div className="gm-dock-bar">
        <button type="button" className="gm-dock-main" aria-expanded={open} onClick={() => setOpen(o => !o)}>
          <span aria-hidden>{pref ? VARK_INFO[pref].icon : "🎨"}</span>{pref ? VARK_INFO[pref].name : "สไตล์เรียน"}
        </button>
        <button type="button" className="gm-dock-read" aria-pressed={sound} aria-label={sound ? "ปิดเสียงเอฟเฟกต์" : "เปิดเสียงเอฟเฟกต์"} onClick={() => { setSfx(!sound); setSound(!sound); if (!sound) setTimeout(() => sfx("xp"), 50); }}>{sound ? "🔔" : "🔕"}</button>
        {pref === "A" && canListen() && <button type="button" className="gm-dock-read" onClick={readPage} aria-label={reading ? "หยุดอ่าน" : "ฟังทั้งหน้า"}>{reading ? "⏹ หยุด" : "▶ ฟังทั้งหน้า"}</button>}
      </div>
    </div>

    <div className="gm-toasts" aria-live="polite">{toasts.map(t => <div key={t.id} className="gm-toast gm-pop"><span aria-hidden>{t.icon}</span>{t.text}</div>)}</div>

    {levelUp && <div className="gm-modal" role="dialog" aria-modal="true" aria-label="เลเวลอัป">
      <div className="gm-confetti" aria-hidden>{Array.from({length: 24}, (_, k) => <i key={k} style={{["--k" as string]: k}}/>)}</div>
      <div className="gm-modal-card gm-pop gm-levelup">
        <img className="gm-modal-loom" src={loomSrc("cheer")} alt=""/>
        <span className="gm-eyebrow">LEVEL UP!</span>
        <h2>Lv.{levelUp.level} {levelUp.name}</h2>
        <p>เก่งมาก! ลูมภูมิใจในตัวเธอ สืบต่อกันเลย</p>
        <button type="button" className="gm-btn" onClick={() => setLevelUp(null)}>ลุยต่อ!</button>
      </div>
    </div>}

    {quiz && <VarkQuiz onClose={() => setQuiz(false)}/>}
  </>;
}
