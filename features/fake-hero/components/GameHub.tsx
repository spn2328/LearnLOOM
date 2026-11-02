"use client";
// Game panels for the dashboard: level/XP HUD (home) and the mission map, badges and VARK profile
// (My Progress). Everything is derived from the saved result, so it always matches the teacher view.
import {lessons} from "../content/episode01";
import {adaptiveUnits} from "../content/adaptiveUnits";
import {badgesOf, levelOf, starsOf, xpOf} from "../game";
import {VARK_INFO, VARK_ORDER, useVark} from "../vark";
import type {StudentResult} from "../results";
import "../styles/game.css";

const Stars = ({n}: {n: number}) => <span className="gm-stars" aria-label={`${n} จาก 3 ดาว`}>{[1, 2, 3].map(i => <span key={i} className={i <= n ? "" : "off"}>★</span>)}</span>;

export function GameHud({r}: {r: StudentResult}) {
  const vark = useVark();
  const {xp} = xpOf(r), lv = levelOf(xp);
  const stars = r.concepts.reduce((n, c) => n + starsOf(c), 0);
  const badges = badgesOf(r, vark.use).filter(b => b.got).length;
  return <section className="gm-hud" aria-label="ระดับนักสืบ">
    <div className="gm-lv" style={{["--p" as string]: lv.pct}}><b><span>Lv.</span><strong>{lv.level}</strong></b></div>
    <div className="gm-hud-main">
      <h3>{lv.name}</h3>
      <div className="gm-xpbar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={lv.pct} aria-label="XP สู่เลเวลถัดไป"><i style={{width: `${Math.max(lv.pct, 3)}%`}}/></div>
      <small>{lv.next ? `${xp} XP · อีก ${lv.next - xp} XP สู่เลเวล ${lv.level + 1}` : `${xp} XP · เลเวลสูงสุดแล้ว!`}</small>
    </div>
    <div className="gm-hud-stats">
      <div className="gm-stat"><b>⭐ {stars}</b><small>ดาว /15</small></div>
      <div className="gm-stat"><b>🏅 {badges}</b><small>เหรียญ</small></div>
      <div className="gm-stat"><b>{vark.pref ? VARK_INFO[vark.pref].icon : "🎨"}</b><small>{vark.pref ? VARK_INFO[vark.pref].name : "สไตล์เรียน"}</small></div>
    </div>
  </section>;
}

// One row per concept: how the system adapted for this learner (first try → path → switches → recheck).
function routeSteps(c: StudentResult["concepts"][number]) {
  const steps: {t: string; k?: "sw" | "ok"}[] = [];
  if (c.outcome === "ยังไม่ได้ทำ") return steps;
  steps.push({t: c.firstCorrect ? "ตอบถูกตั้งแต่ครั้งแรก" : "ครั้งแรกยังไม่ถูก", k: c.firstCorrect ? "ok" : undefined});
  if (c.firstCorrect) return steps;
  if (c.path) {
    steps.push({t: `วินิจฉัย → Path ${c.path}`});
    c.helpSwitches?.forEach(s => steps.push({t: `เปลี่ยนวิธีช่วย → Path ${s.to}`, k: "sw"}));
  } else steps.push({t: "ตัวช่วยตามเหตุผลที่เลือก"});
  if (c.recheck || c.recheckB) steps.push({t: c.recheckCorrect ? "Recheck ผ่าน" : "Recheck ยังไม่ผ่าน", k: c.recheckCorrect ? "ok" : undefined});
  return steps;
}

export function GameProgress({r}: {r: StudentResult}) {
  const vark = useVark();
  const badges = badgesOf(r, vark.use);
  const {xp, parts} = xpOf(r);
  const total = VARK_ORDER.reduce((n, k) => n + (vark.use[k] ?? 0), 0);
  return <>
    <article className="gm-card">
      <h3>🗺️ แผนที่ภารกิจของฉัน (Adaptive Route)</h3>
      <p>ลูมปรับเส้นทางให้แต่ละคนตามคำตอบ ถ้าตอบถูกตั้งแต่ครั้งแรกจะไปต่อได้เลย ถ้ายังไม่ถูก ระบบจะวินิจฉัยแล้วพาไป Path ที่ตรงกับจุดที่สับสน และเปลี่ยนวิธีช่วยถ้าวิธีแรกยังไม่ได้ผล</p>
      <ol className="gm-map">{r.concepts.map((c, i) => {
        const s = starsOf(c), steps = routeSteps(c), unit = adaptiveUnits[c.id as keyof typeof adaptiveUnits];
        return <li key={c.id}>
          <span className={`gm-node s${s}`} aria-hidden>{c.id}</span>
          <div>
            <b>{lessons[i].title}</b>
            <div className="gm-route">{steps.length ? steps.map((x, k) => <span key={k} className={x.k ?? ""} title={x.t.includes("Path") && unit ? unit.paths[x.t.slice(-1) as "A"]?.name : undefined}>{x.t}</span>) : <span>ยังไม่ได้เริ่ม</span>}</div>
          </div>
          <Stars n={s}/>
        </li>;
      })}</ol>
    </article>

    <article className="gm-card">
      <h3>🏅 เหรียญรางวัล ({badges.filter(b => b.got).length}/{badges.length})</h3>
      <p>สะสม XP ทั้งหมด {xp} XP{parts.length ? ` · ล่าสุด: ${parts[parts.length - 1].label}` : ""}</p>
      <div className="gm-badges">{badges.map(b => <div key={b.id} className={`gm-badge ${b.got ? "got" : ""}`}>
        <span aria-hidden>{b.icon}</span><b>{b.name}</b><small>{b.desc}</small><span className="sr-only">{b.got ? "ได้แล้ว" : "ยังไม่ได้"}</span>
      </div>)}</div>
    </article>

    <article className="gm-card">
      <h3>🎨 สไตล์การเรียนของฉัน (VARK)</h3>
      <p>{vark.pref ? `สไตล์หลัก: ${VARK_INFO[vark.pref].icon} ${VARK_INFO[vark.pref].name}${vark.how === "quiz" ? " (จากแบบทดสอบ)" : " (เลือกเอง)"} — ${VARK_INFO[vark.pref].tip}` : "ยังไม่ได้เลือกสไตล์ กดปุ่ม “สไตล์เรียน” มุมล่างซ้ายระหว่างเรียนได้เลย"}</p>
      <div className="gm-vark">{VARK_ORDER.map(k => {
        const n = vark.use[k] ?? 0, pct = total ? Math.round(n / total * 100) : 0;
        return <div key={k} className={`gm-vark-row ${vark.pref === k ? "pref" : ""}`}>
          <span>{VARK_INFO[k].icon} {VARK_INFO[k].name}</span>
          <div className="gm-xpbar" aria-hidden><i style={{width: `${pct}%`}}/></div>
          <small>{n} ครั้ง</small>
        </div>;
      })}</div>
    </article>
  </>;
}
