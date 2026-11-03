"use client";
import React, {useEffect, useRef, useState, type ReactNode} from "react";
import {getMedia} from "../media/registry";
import type {Choice, Question} from "../content/episode01";
import {useChoiceTools} from "./ChoiceTools";
import {cloudLinked} from "../cloud/client";

export const letters: Choice[] = ["A", "B", "C", "D"];

// Loom with a pose image from /media (loom-point.png, loom-think.png, ...); falls back to the default art.
export type LoomPose = "point" | "think" | "cheer" | "happy" | "clipboard";
export function loomSrc(pose: LoomPose = "point") {
  return getMedia("loom-" + pose)[0]?.url ?? "/images/loom.webp";
}
// voice = the full source line ("ลูม: …") so read-aloud finds its pre-rendered file
export function Loom({pose = "point", children, side = "left", small = false, voice}: {pose?: LoomPose; children: ReactNode; side?: "left" | "right"; small?: boolean; voice?: string}) {
  return (
    <div className={`fh-loom ${side} ${small ? "small" : ""}`}>
      <img src={loomSrc(pose)} alt="ลูม" />
      <div className="fh-bubble" data-voice={voice}>{children}</div>
    </div>
  );
}

// Story lines "ชื่อ: “...”" rendered as chat bubbles; other lines are narration.
export function Dialogue({lines}: {lines: string[]}) {
  return (
    <div className="fh-dialogue">
      {lines.map((line, i) => {
        const m = /^(ลูม|ผู้เล่น|เจฟ|ชาวบ้าน|เฮียศักดิ์)\s*:\s*(.*)$/.exec(line);
        if (!m) return <p key={i} className="fh-narration" data-voice={line}>{line}</p>;
        const [, who, text] = m;
        if (who === "ลูม") return <Loom key={i} pose={i % 2 ? "think" : "point"} small voice={line}><b>ลูม</b> {text}</Loom>;
        return <div key={i} className={`fh-say ${who === "ผู้เล่น" ? "me" : ""}`} data-voice={line}><b>{who}</b> {text}</div>;
      })}
    </div>
  );
}

// Pop-up message (warning / feedback). Focus moves to the first button for keyboard users.
export function Popup({open, tone = "info", title, children, actions, onClose}: {open: boolean; tone?: "info" | "warn" | "good"; title: string; children?: ReactNode; actions?: ReactNode; onClose: () => void}) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    box.current?.querySelector("button")?.focus();
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fh-popup-back" onClick={onClose}>
      <div ref={box} className={`fh-popup ${tone}`} role="alertdialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
        <div className="fh-popup-icon" aria-hidden="true">{tone === "warn" ? "!" : tone === "good" ? "✓" : "i"}</div>
        <h3>{title}</h3>
        {children}
        <div className="fh-actions">{actions ?? <button className="fh-primary" onClick={onClose}>เข้าใจแล้ว</button>}</div>
      </div>
    </div>
  );
}

export function Choices({q, value, onChoose}: {q: Question; value?: string; onChoose: (a: Choice) => void}) {
  const t = useChoiceTools(q);
  return (
    <>
      {t.bar}
      <div className={`fh-options ${t.pref === "K" ? "gm-cutting" : ""}`}>
        {q.choices.map((v, i) => (
          <div key={i} className={`gm-opt ${t.out[i] ? "out" : ""}`}>
            <button className={"fh-choice " + (value === letters[i] ? "active" : "")} aria-pressed={value === letters[i]} onClick={() => onChoose(letters[i])}>
              <strong>{letters[i]}.</strong> {t.fmt(v)}
            </button>
            {t.cut(i)}
          </div>
        ))}
      </div>
    </>
  );
}

// Main question + reason on one card (owner request: merge Qxx and Qxx-E, pop-up style boxes, background).
export function QuestionReason({eyebrow, main, reason, value, onMain, onReason, onSubmit, figure, help, onHelp}: {
  eyebrow: string; main?: Question; reason: Question; value: {main?: string; reason?: string};
  onMain?: (a: Choice) => void; onReason: (a: Choice) => void; onSubmit: () => void;
  figure?: ReactNode; help?: string; onHelp?: () => void;
}) {
  const [helpOpen, setHelpOpen] = useState(false);
  const ready = (!main || !!value.main) && !!value.reason;
  return (
    <div className="fh-qstage">
      <span className="fh-eyebrow">{eyebrow}</span>
      {figure && <div className="fh-qfigure fh-pop">{figure}</div>}
      {main && onMain && (
        <section className="fh-qbox fh-pop">
          <span className="fh-qtag">{main.id} · คำถาม</span>
          <h2>{main.prompt}</h2>
          <Choices q={main} value={value.main} onChoose={onMain} />
        </section>
      )}
      <section className={`fh-qbox fh-pop delay ${main && !value.main ? "dim" : ""}`}>
        <span className="fh-qtag">{reason.id} · เหตุผล</span>
        <h2>{reason.prompt}</h2>
        <Choices q={reason} value={value.reason} onChoose={onReason} />
      </section>
      <div className="fh-qfoot">
        {help && <button className="fh-help" onClick={() => { setHelpOpen(true); onHelp?.(); }}><img src={loomSrc("think")} alt="" /> ต้องการความช่วยเหลือหรือไม่?</button>}
        <button className="fh-primary" disabled={!ready} onClick={onSubmit}>ยืนยันคำตอบและเหตุผล</button>
      </div>
      <Popup open={helpOpen} title="ลูมบอกใบ้ให้" onClose={() => setHelpOpen(false)}>
        <Loom pose="think" small>{help}</Loom>
      </Popup>
    </div>
  );
}

// Drag-and-drop with a tap fallback (tap a card, then tap a box) for touch screens.
export type DragItem = {id: string; label: ReactNode};
export type DropTarget = {id: string; label: ReactNode; className?: string; empty?: ReactNode};
export function DragSort({items, targets, placed, onPlace, single = false, itemClass, layout = "bins"}: {
  items: DragItem[]; targets: DropTarget[]; placed: Record<string, string | undefined>;
  onPlace: (item: string, target?: string) => void; single?: boolean;
  itemClass?: (id: string) => string; layout?: "bins" | "slots";
}) {
  const [picked, setPicked] = useState<string>();
  const [over, setOver] = useState<string>();
  const drop = (target: string, item = picked) => {
    if (!item) return;
    if (single) { const other = items.find(x => x.id !== item && placed[x.id] === target); if (other) onPlace(other.id, placed[item]); }
    onPlace(item, target); setPicked(undefined); setOver(undefined);
  };
  const card = (x: DragItem) => (
    <button key={x.id} draggable className={`fh-dcard ${picked === x.id ? "picked" : ""} ${itemClass?.(x.id) ?? ""}`}
      aria-pressed={picked === x.id}
      onDragStart={e => { e.dataTransfer.setData("text/plain", x.id); setPicked(x.id); }}
      onDragEnd={() => setOver(undefined)}
      onClick={() => setPicked(picked === x.id ? undefined : x.id)}>
      <span className="fh-grip" aria-hidden="true">⠿</span>{x.label}
    </button>
  );
  const tray = items.filter(x => !placed[x.id]);
  return (
    <div className={`fh-drag ${layout}`}>
      <div className="fh-tray" onClick={e => { if (picked && placed[picked] && e.target === e.currentTarget) { onPlace(picked, undefined); setPicked(undefined); } }} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); onPlace(e.dataTransfer.getData("text/plain"), undefined); setPicked(undefined); }}>
        {tray.map(card)}
        {!tray.length && <span className="fh-tray-empty">วางครบทุกการ์ดแล้ว · แตะการ์ดในกล่องเพื่อย้ายได้</span>}
      </div>
      {picked && <p className="fh-hint" role="status">เลือกการ์ดแล้ว · แตะกล่องที่ต้องการวาง</p>}
      <div className="fh-targets">
        {targets.map(t => {
          const inside = items.filter(x => placed[x.id] === t.id);
          return (
            <div key={t.id} role="button" tabIndex={0} aria-label="วางการ์ดที่นี่"
              className={`fh-target ${t.className ?? ""} ${over === t.id ? "over" : ""} ${picked ? "ready" : ""}`}
              onClick={() => drop(t.id)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); drop(t.id); } }}
              onDragOver={e => { e.preventDefault(); setOver(t.id); }} onDragLeave={() => setOver(undefined)}
              onDrop={e => { e.preventDefault(); drop(t.id, e.dataTransfer.getData("text/plain")); }}>
              <div className="fh-target-head">{t.label}</div>
              <div className="fh-target-body" onClick={e => { if (inside.length && !picked) e.stopPropagation(); }}>
                {inside.length ? inside.map(card) : <span className="fh-target-empty">{t.empty ?? "ลากการ์ดมาวางที่นี่"}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Dashboard-style end-of-concept card (owner reference: C01 summary mockup).
export function SummaryCard({episode, id, title, progress, outcome, first, route, extra, next, conclusion, loom, actions}: {
  episode: string; id: string; title: string; progress: number; outcome: string; first: string; route: string;
  extra?: ReactNode; next?: string; conclusion?: string; loom: string; actions: ReactNode;
}) {
  const tone = outcome === "ผ่านด้วยตนเอง" ? "good" : outcome === "ผ่านหลังช่วยเหลือ" ? "ok" : "warn";
  return (
    <div className="fh-summary">
      <div className="fh-summary-head">
        <div><span className="fh-eyebrow">LEARNING MEMORY · {id}</span><h2>{episode}</h2><p>สรุปสิ่งที่คุณค้นพบจากหลักฐานในตอนนี้ · {title}</p></div>
        <Loom pose={tone === "warn" ? "think" : "cheer"} small side="right">{loom}</Loom>
      </div>
      <div className="fh-summary-grid">
        <section className="fh-scard"><h3>📁 แฟ้มหลักฐาน</h3><p>{id} · {title}</p><p className="fh-muted">{cloudLinked() ? "บันทึกแล้ว · ซิงก์ขึ้นบัญชีอัตโนมัติ" : "บันทึกในเบราว์เซอร์นี้แล้ว"}</p></section>
        <section className="fh-scard"><h3>📈 ความคืบหน้า</h3><div className="fh-big">{progress}/5</div><div className="fh-bar"><i style={{width: `${progress * 20}%`}} /></div></section>
        <section className={`fh-scard ${tone}`}><h3>🎯 ผลการเรียนรู้</h3><p className="fh-outcome">{outcome}</p><p>คำตอบครั้งแรก {first}</p><p className="fh-muted">เส้นทาง: {route}</p>{extra}</section>
        {next && <section className="fh-scard"><h3>➡️ หัวข้อถัดไป</h3><p>{next}</p></section>}
      </div>
      {conclusion && <div className="fh-conclusion"><b>ข้อสรุปของคดีตอนนี้</b> {conclusion}</div>}
      <div className="fh-actions">{actions}</div>
    </div>
  );
}
