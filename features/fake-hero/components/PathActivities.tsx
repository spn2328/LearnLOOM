"use client";
import React, {useState, type ReactNode} from "react";
import type {PathId} from "../content/adaptive04";

// Hands-on activities for the adaptive paths (activity names from เนื้อเรื่องและคำถามล่าสุด.pdf:
// Bond Symbol Match, Electron Pair Explorer, Build a Double Bond, Carbon Bond Highlighter,
// Atom Counter, Formula Decoder...). The example molecules here are practice material written
// by Claude, not graded questions, and deliberately avoid the molecules used in R/RC/Transfer.
// Every activity calls onDone once the learner has worked it out; the path's next button waits for it.

type Done = {onDone: () => void};
const Good = ({children}: {children: ReactNode}) => <p className="fh-good fh-pop">{children}</p>;

// ---- tap a card, then tap the box it belongs in
function TapSort({title, items, bins, hints = true, onDone}: Done & {title: string; items: [string, string][]; bins: string[]; hints?: boolean}) {
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [pick, setPick] = useState<string>();
  const [miss, setMiss] = useState("");
  const left = items.filter(([label]) => !placed[label]);
  const drop = (bin: string) => {
    if (!pick) return;
    const want = items.find(([label]) => label === pick)![1];
    if (want !== bin) { setMiss(hints ? `${pick} ไม่ได้อยู่กลุ่ม “${bin}” ลองคิดอีกครั้ง` : "ยังไม่ถูก ลองใหม่"); return; }
    const next = {...placed, [pick]: bin};
    setPlaced(next); setPick(undefined); setMiss("");
    if (Object.keys(next).length === items.length) onDone();
  };
  return (
    <div className="fh-act">
      <h3>{title}</h3>
      <p className="fh-act-help">แตะการ์ด แล้วแตะกล่องที่ถูกต้อง</p>
      <div className="fh-act-cards">{left.map(([label]) => <button key={label} type="button" className={`fh-act-card ${pick === label ? "on" : ""}`} aria-pressed={pick === label} onClick={() => { setPick(label); setMiss(""); }}>{label}</button>)}</div>
      <div className="fh-act-bins">{bins.map(bin => (
        <button key={bin} type="button" className="fh-act-bin" onClick={() => drop(bin)} disabled={!pick}>
          <b>{bin}</b>
          <span>{items.filter(([l]) => placed[l] === bin).map(([l]) => <em key={l} className="fh-pop">{l}</em>)}</span>
        </button>
      ))}</div>
      {miss && <p className="fh-act-miss" role="status">{miss}</p>}
      {!left.length && <Good>จัดครบทุกการ์ดแล้ว!</Good>}
    </div>
  );
}

// ---- tap to flip two cards, then say what the comparison shows
function CompareFlip({onDone}: Done) {
  const cards = [["CH₄", "มีเทน", "จัดเป็นสารอินทรีย์"], ["CO₂", "คาร์บอนไดออกไซด์", "จัดเป็นสารอนินทรีย์ตามการจำแนกทั่วไป"]];
  const [open, setOpen] = useState<boolean[]>([false, false]);
  const [ans, setAns] = useState<number>();
  return (
    <div className="fh-act">
      <h3>เปรียบเทียบ CH₄ กับ CO₂</h3>
      <p className="fh-act-help">แตะการ์ดทั้งสองใบเพื่อพลิกดู</p>
      <div className="fh-act-flip">{cards.map(([f, name, kind], i) => (
        <button key={f} type="button" className={`fh-act-fcard ${open[i] ? "open" : ""}`} aria-pressed={open[i]} onClick={() => setOpen(o => o.map((v, k) => k === i || v))}>
          <b>{f}</b><small>{name}</small>{open[i] ? <span className="fh-pop">มีธาตุคาร์บอน · {kind}</span> : <span>แตะเพื่อพลิก</span>}
        </button>
      ))}</div>
      {open.every(Boolean) && <>
        <p><b>ทั้งคู่มีคาร์บอน แต่จัดคนละประเภท แปลว่าอะไร?</b></p>
        <div className="fh-act-cards">
          {["การมีคาร์บอนอย่างเดียวยังใช้จำแนกสารไม่ได้", "สารที่มีคาร์บอนต้องเป็นสารอินทรีย์เสมอ"].map((t, i) => (
            <button key={t} type="button" className={`fh-act-card ${ans === i ? (i === 0 ? "ok" : "bad") : ""}`} onClick={() => { setAns(i); if (i === 0) onDone(); }}>{t}</button>
          ))}
        </div>
        {ans === 1 && <p className="fh-act-miss">ดูการ์ด CO₂ อีกครั้ง มีคาร์บอนแต่ไม่ได้เป็นสารอินทรีย์</p>}
        {ans === 0 && <Good>ใช่! ต้องดูมากกว่าแค่ “มีคาร์บอน”</Good>}
      </>}
    </div>
  );
}

// ---- electron pairs between two carbons; tasks ask for a bond type in order
const BOND = ["", "–", "=", "≡"], BOND_NAME = ["", "พันธะเดี่ยว", "พันธะคู่", "พันธะสาม"];
function PairBuilder({title, tasks, onDone}: Done & {title: string; tasks: {say: string; pairs: number}[]}) {
  const [pairs, setPairs] = useState(0);
  const [t, setT] = useState(0);
  const task = tasks[t], hit = !!task && pairs === task.pairs;
  return (
    <div className="fh-act">
      <h3>{title}</h3>
      {task ? <p className="fh-act-task">ภารกิจ {t + 1}/{tasks.length}: {task.say}</p> : <Good>ทำภารกิจครบแล้ว! จำนวนคู่อิเล็กตรอน = อันดับพันธะ</Good>}
      <svg className="fh-pairs" viewBox="0 0 260 120" role="img" aria-label={`คาร์บอนสองอะตอมใช้อิเล็กตรอนร่วมกัน ${pairs} คู่`}>
        <circle cx="62" cy="60" r="34" fill="#316552"/><text x="62" y="70" textAnchor="middle" fontSize="30" fill="#fff">C</text>
        <circle cx="198" cy="60" r="34" fill="#316552"/><text x="198" y="70" textAnchor="middle" fontSize="30" fill="#fff">C</text>
        {Array.from({length: pairs}, (_, k) => { const y = 60 + (k - (pairs - 1) / 2) * 24; return <g key={k} className="fh-pop"><circle cx="121" cy={y} r="7" fill="#f4c44e"/><circle cx="139" cy={y} r="7" fill="#3ea36b"/></g>; })}
      </svg>
      <p className="fh-act-read">{pairs ? <>C{BOND[pairs]}C · {BOND_NAME[pairs]} · ใช้อิเล็กตรอนร่วมกัน {pairs} คู่ · อันดับพันธะ {pairs}</> : "ยังไม่มีพันธะ"}</p>
      <div className="fh-actions">
        <button type="button" onClick={() => setPairs(Math.max(0, pairs - 1))} disabled={!pairs}>− เอาคู่ออก</button>
        <button type="button" onClick={() => setPairs(Math.min(3, pairs + 1))} disabled={pairs === 3}>+ เติมคู่อิเล็กตรอน</button>
        {task && <button type="button" className="fh-primary" onClick={() => { if (!hit) return; const n = t + 1; setT(n); if (n === tasks.length) onDone(); }} disabled={!hit}>ตรวจภารกิจ</button>}
      </div>
    </div>
  );
}

// ---- tap groups of a condensed formula to count atoms
const GROUP = /^C(H(\d)?)?$/;
const hOf = (g: string) => { const m = GROUP.exec(g); return m?.[1] ? Number(m[2] ?? 1) : 0; };
const sub = (n: number) => String(n).replace(/\d/g, d => "₀₁₂₃₄₅₆₇₈₉"[Number(d)]);
const pretty = (g: string) => g.replace(/\d/g, d => "₀₁₂₃₄₅₆₇₈₉"[Number(d)]);
function AtomCounter({title, molecules, ask, note, onDone}: Done & {title: string; molecules: {groups: string[]; bonds: string[]; name?: string}[]; ask?: boolean; note?: string}) {
  const [seen, setSeen] = useState<Record<string, boolean>>({});
  const [askAt, setAskAt] = useState<string>();
  const [miss, setMiss] = useState("");
  const total = molecules.reduce((n, m) => n + m.groups.length, 0);
  const mark = (key: string) => {
    const next = {...seen, [key]: true}; setSeen(next); setAskAt(undefined); setMiss("");
    if (Object.keys(next).length === total) onDone();
  };
  return (
    <div className="fh-act">
      <h3>{title}</h3>
      <p className="fh-act-help">{ask ? "แตะแต่ละกลุ่ม แล้วเลือกว่ามี H กี่อะตอม" : "แตะทีละกลุ่มเพื่อนับ กลุ่มที่นับแล้วจะเปลี่ยนสี จะได้ไม่นับซ้ำหรือข้าม"}</p>
      {molecules.map((m, mi) => {
        const keys = m.groups.map((_, gi) => `${mi}-${gi}`);
        const c = keys.filter(k => seen[k]).length, h = m.groups.reduce((n, g, gi) => n + (seen[keys[gi]] ? hOf(g) : 0), 0);
        const done = c === m.groups.length;
        return (
          <div key={mi} className="fh-act-mol">
            {m.name && <small>{m.name}</small>}
            <div className="fh-act-groups">{m.groups.map((g, gi) => <React.Fragment key={gi}>
              <button type="button" className={`fh-act-group ${seen[keys[gi]] ? "ok" : ""} ${askAt === keys[gi] ? "on" : ""}`} disabled={seen[keys[gi]]} onClick={() => ask ? setAskAt(keys[gi]) : mark(keys[gi])}>
                {pretty(g)}{seen[keys[gi]] && <small>H {hOf(g)}</small>}
              </button>
              {gi < m.bonds.length && <span className="fh-act-bond">{m.bonds[gi]}</span>}
            </React.Fragment>)}</div>
            <p className="fh-act-read">นับแล้ว: C = {c} · H = {h}{done && <b className="fh-pop"> → C{sub(c)}H{sub(h)}</b>}</p>
          </div>
        );
      })}
      {askAt && (() => { const [mi, gi] = askAt.split("-").map(Number), g = molecules[mi].groups[gi]; return (
        <div className="fh-act-ask fh-pop"><p><b>{pretty(g)}</b> มี H กี่อะตอม?</p><div className="fh-actions">{[0, 1, 2, 3].map(n => <button key={n} type="button" onClick={() => n === hOf(g) ? mark(askAt) : setMiss(n === 0 ? "ดูตัวอักษร H ในกลุ่มอีกครั้ง" : "ดูตัวเลขห้อยหลัง H (ถ้าไม่มีตัวเลข หมายถึง 1)")}>{n}</button>)}</div></div>
      ); })()}
      {miss && <p className="fh-act-miss" role="status">{miss}</p>}
      {Object.keys(seen).length === total && note && <Good>{note}</Good>}
    </div>
  );
}

// ---- butane drawn three ways: is there a branch?
function ZigzagLook({onDone}: Done) {
  const views: {name: string; pts: [number, number][]}[] = [
    {name: "วาดเป็นเส้นตรง", pts: [[40, 60], [120, 60], [200, 60], [280, 60]]},
    {name: "วาดเป็นซิกแซก", pts: [[40, 80], [120, 40], [200, 80], [280, 40]]},
    {name: "วาดหักมุม", pts: [[60, 30], [60, 95], [150, 95], [240, 95]]},
  ];
  const [v, setV] = useState(0);
  const [ok, setOk] = useState<boolean[]>([false, false, false]);
  const [miss, setMiss] = useState(false);
  const answer = (branch: boolean) => {
    if (branch) { setMiss(true); return; }
    const next = ok.map((x, i) => x || i === v); setOk(next); setMiss(false);
    if (next.every(Boolean)) onDone(); else setV(next.findIndex(x => !x));
  };
  return (
    <div className="fh-act">
      <h3>บิวเทนโมเลกุลเดียว วาดได้หลายแบบ</h3>
      <div className="fh-act-tabs">{views.map((x, i) => <button key={x.name} type="button" aria-pressed={v === i} className={v === i ? "on" : ""} onClick={() => setV(i)}>{ok[i] ? "✓ " : ""}{x.name}</button>)}</div>
      <svg className="fh-act-chain" viewBox="0 0 320 120" role="img" aria-label={`บิวเทน ${views[v].name}`}>
        <polyline points={views[v].pts.map(p => p.join(",")).join(" ")} fill="none" stroke="#27392f" strokeWidth="4"/>
        {views[v].pts.map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="16" fill={i === 0 || i === 3 ? "#f4c44e" : "#316552"}/><text x={x} y={y + 6} textAnchor="middle" fontSize="16" fill={i === 0 || i === 3 ? "#27392f" : "#fff"}>C</text></g>)}
      </svg>
      <p className="fh-act-help">วงสีเหลือง = ปลายสายโซ่ · ทุกแบบมีคาร์บอน 4 อะตอมต่อกันเรียงเป็นแถวเดียว</p>
      <p><b>รูปนี้มีคาร์บอนแตกกิ่งหรือไม่?</b></p>
      <div className="fh-actions"><button type="button" onClick={() => answer(true)}>มีกิ่ง</button><button type="button" onClick={() => answer(false)}>ไม่มีกิ่ง</button></div>
      {miss && <p className="fh-act-miss">นับปลายสายโซ่ (วงสีเหลือง) ดูนะ โซ่กิ่งต้องมีปลายมากกว่า 2 จุด</p>}
      {ok.every(Boolean) && <Good>การวาดซิกแซกหรือหักมุมไม่ได้ทำให้เกิดกิ่ง สิ่งที่ตัดสินคือการเชื่อมต่อ</Good>}
    </div>
  );
}

// ---- add the fourth carbon to C–C–C; goal: a branched chain
function BranchBuilder({onDone}: Done) {
  const [at, setAt] = useState<number>();
  const pos: [number, number][] = [[70, 80], [160, 80], [250, 80]];
  const branched = at === 1;
  const extra: [number, number] | undefined = at === undefined ? undefined : at === 1 ? [160, 20] : at === 0 ? [10, 80] : [310, 80];
  return (
    <div className="fh-act">
      <h3>ภารกิจ: สร้างโซ่กิ่งที่มีคาร์บอนรวมสี่อะตอม</h3>
      <p className="fh-act-help">แตะคาร์บอนตัวที่จะต่อคาร์บอนตัวที่ 4</p>
      <svg className="fh-act-chain" viewBox="0 0 320 120" role="img" aria-label="โซ่คาร์บอนสามอะตอม">
        <line x1="70" y1="80" x2="250" y2="80" stroke="#27392f" strokeWidth="4"/>
        {extra && at !== undefined && <line x1={pos[at][0]} y1={pos[at][1]} x2={extra[0]} y2={extra[1]} stroke="#27392f" strokeWidth="4" className="fh-pop"/>}
        {extra && <g className="fh-pop"><circle cx={extra[0]} cy={extra[1]} r="16" fill="#f4c44e"/><text x={extra[0]} y={extra[1] + 6} textAnchor="middle" fontSize="16">C</text></g>}
        {pos.map(([x, y], i) => <g key={i} role="button" tabIndex={0} aria-label={`ต่อที่คาร์บอนตัวที่ ${i + 1}`} style={{cursor: "pointer"}}
          onClick={() => { setAt(i); if (i === 1) onDone(); }} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setAt(i); if (i === 1) onDone(); } }}>
          <circle cx={x} cy={y} r="18" fill={at === i ? "#3ea36b" : "#316552"}/><text x={x} y={y + 6} textAnchor="middle" fontSize="16" fill="#fff">C</text>
        </g>)}
      </svg>
      {at !== undefined && !branched && <p className="fh-act-miss">ต่อที่ปลายแล้วได้คาร์บอน 4 อะตอมเรียงเป็นแถวเดียว = โซ่ตรง (บิวเทน) ลองต่อที่ตำแหน่งอื่น</p>}
      {branched && <Good>ได้โซ่กิ่งแล้ว! คาร์บอนตัวกลางต่อกับคาร์บอน 3 อะตอม (เมทิลโพรเพน)</Good>}
    </div>
  );
}

// ---- tap every bond on the target carbon, then add the bond orders
function BondHighlighter({onDone}: Done) {
  // CH₂=CH–CH₂–CH₃, target = the CH next to the double bond
  const bonds = [
    {id: "c=c", order: 2, on: true, label: "C=C"}, {id: "c-c", order: 1, on: true, label: "C–C"},
    {id: "c-h", order: 1, on: true, label: "C–H"}, {id: "far", order: 1, on: false, label: "C–C (ไกลออกไป)"},
  ];
  const [sel, setSel] = useState<string[]>([]);
  const [miss, setMiss] = useState("");
  const [sum, setSum] = useState<number>();
  const all = bonds.filter(b => b.on).every(b => sel.includes(b.id));
  const tap = (id: string) => {
    const b = bonds.find(x => x.id === id)!;
    if (!b.on) { setMiss("พันธะนี้ไม่ได้ต่อกับคาร์บอนเป้าหมาย (วงสีเหลือง)"); return; }
    setMiss(""); setSel(s => s.includes(id) ? s : [...s, id]);
  };
  const line = (id: string, x1: number, y1: number, x2: number, y2: number, dy = 0) => (
    <g key={id + dy} role="button" tabIndex={0} aria-label={`พันธะ ${bonds.find(b => b.id === id)!.label}`} style={{cursor: "pointer"}} onClick={() => tap(id)} onKeyDown={e => { if (e.key === "Enter") tap(id); }}>
      <line x1={x1} y1={y1 + dy} x2={x2} y2={y2 + dy} stroke="transparent" strokeWidth="22"/>
      <line x1={x1} y1={y1 + dy} x2={x2} y2={y2 + dy} stroke={sel.includes(id) ? "#d9792b" : "#27392f"} strokeWidth={sel.includes(id) ? 6 : 4}/>
    </g>
  );
  return (
    <div className="fh-act">
      <h3>Carbon Bond Highlighter: CH₂=CH–CH₂–CH₃</h3>
      <p className="fh-act-help">แตะพันธะทุกเส้นที่ต่อกับคาร์บอนเป้าหมาย (วงสีเหลือง)</p>
      <svg className="fh-act-chain" viewBox="0 0 360 150" role="img" aria-label="โครงสร้าง CH₂=CH–CH₂–CH₃">
        {line("c=c", 62, 60, 122, 60, -6)}{line("c=c", 62, 60, 122, 60, 6)}
        {line("c-c", 158, 60, 202, 60)}{line("far", 258, 60, 302, 60)}{line("c-h", 140, 78, 140, 112)}
        {[[40, "CH₂", false], [140, "C", true], [230, "CH₂", false], [330, "CH₃", false]].map(([x, t, target]) => <g key={String(x)}>
          <circle cx={Number(x)} cy="60" r="22" fill={target ? "#f4c44e" : "#fcfaf6"} stroke="#316552" strokeWidth="2"/>
          <text x={Number(x)} y="67" textAnchor="middle" fontSize="16" fill="#27392f">{String(t)}</text></g>)}
        <text x="140" y="134" textAnchor="middle" fontSize="18" fill="#27392f">H</text>
      </svg>
      <p className="fh-act-read">พันธะที่เลือก: {sel.length ? sel.map(id => { const b = bonds.find(x => x.id === id)!; return `${b.label} (${b.order})`; }).join(" + ") : "—"}</p>
      {miss && <p className="fh-act-miss" role="status">{miss}</p>}
      {all && <>
        <p><b>รวมอันดับพันธะของคาร์บอนเป้าหมายได้เท่าใด?</b></p>
        <div className="fh-actions">{[2, 3, 4, 5].map(n => <button key={n} type="button" className={sum === n ? (n === 4 ? "fh-primary" : "") : ""} onClick={() => { setSum(n); if (n === 4) onDone(); }}>{n}</button>)}</div>
        {sum !== undefined && sum !== 4 && <p className="fh-act-miss">บวกตัวเลขในวงเล็บทั้งหมดอีกครั้ง พันธะคู่นับเป็น 2</p>}
        {sum === 4 && <Good>2 + 1 + 1 = 4 ครบพอดี คาร์บอนตัวนี้จึงมี H เพียง 1 อะตอม</Good>}
      </>}
    </div>
  );
}

const symbolMatch: [string, string][] = [["–", "พันธะเดี่ยว"], ["=", "พันธะคู่"], ["≡", "พันธะสาม"]];

// unit id → path → activity. Path D runs the A, B, C steps in turn, so it reuses these.
export function PathActivity({unit, path, onDone}: {unit: string; path: PathId; onDone: () => void}) {
  const k = `${unit}${path}`;
  switch (k) {
    case "C01A": return <TapSort title="บัตรสาร: จัดเข้ากลุ่ม" items={[["CH₄", "สารอินทรีย์"], ["CO₂", "สารอนินทรีย์"], ["Na₂CO₃", "สารอนินทรีย์"]]} bins={["สารอินทรีย์", "สารอนินทรีย์"]} onDone={onDone}/>;
    case "C01B": return <CompareFlip onDone={onDone}/>;
    case "C01C": return <TapSort title="แฟ้มสารชุดใหม่ (ไม่มีคำใบ้)" hints={false} items={[["C₂H₅OH", "สารอินทรีย์"], ["CO", "สารอนินทรีย์"], ["C₆H₁₂O₆", "สารอินทรีย์"], ["K₂CO₃", "สารอนินทรีย์"]]} bins={["สารอินทรีย์", "สารอนินทรีย์"]} onDone={onDone}/>;
    case "C02A": case "C04A": return <TapSort title="Bond Symbol Match" items={symbolMatch} bins={symbolMatch.map(x => x[1])} onDone={onDone}/>;
    case "C02B": return <PairBuilder title="Electron Pair Explorer" tasks={[{say: "สร้างพันธะเดี่ยว", pairs: 1}, {say: "สร้างพันธะคู่", pairs: 2}]} onDone={onDone}/>;
    case "C02C": return <PairBuilder title="แปลงสัญลักษณ์เป็นแบบจำลองคู่อิเล็กตรอน" tasks={[{say: "สร้างพันธะตามสัญลักษณ์ C≡C", pairs: 3}, {say: "สร้างพันธะตามสัญลักษณ์ C=C", pairs: 2}, {say: "สร้างพันธะตามสัญลักษณ์ C–C", pairs: 1}]} onDone={onDone}/>;
    case "C03A": return <TapSort title="จับคู่โครงสร้างกับประเภท" items={[["CH₃–CH₂–CH₂–CH₃", "โซ่ตรง"], ["CH₃–C(CH₃)₂–CH₃", "โซ่กิ่ง"], ["ไซโคลเฮกเซน (คาร์บอน 6 อะตอมต่อเป็นวงปิด)", "วง"]]} bins={["โซ่ตรง", "โซ่กิ่ง", "วง"]} onDone={onDone}/>;
    case "C03B": return <ZigzagLook onDone={onDone}/>;
    case "C03C": return <BranchBuilder onDone={onDone}/>;
    case "C04B": return <PairBuilder title="Build a Double Bond" tasks={[{say: "เติมคู่อิเล็กตรอนจนได้พันธะคู่ C=C", pairs: 2}]} onDone={onDone}/>;
    case "C04C": return <BondHighlighter onDone={onDone}/>;
    case "C05A": return <AtomCounter title="Atom Counter: CH₃–CH₂–CH₃" ask molecules={[{groups: ["CH3", "CH2", "CH3"], bonds: ["–", "–"]}]} note="รวมแต่ละกลุ่มได้สูตรโมเลกุล C₃H₈" onDone={onDone}/>;
    case "C05B": return <AtomCounter title="บิวเทน เทียบกับ บิวต์-1-อีน" molecules={[{name: "บิวเทน", groups: ["CH3", "CH2", "CH2", "CH3"], bonds: ["–", "–", "–"]}, {name: "บิวต์-1-อีน", groups: ["CH2", "CH", "CH2", "CH3"], bonds: ["=", "–", "–"]}]} note="คาร์บอนเท่ากัน แต่พันธะคู่ทำให้ H หายไป 2 อะตอม (C₄H₁₀ → C₄H₈)" onDone={onDone}/>;
    case "C05C": return <AtomCounter title="Formula Decoder: CH₃–CH₂–CH₂–CH₂–CH₃" molecules={[{groups: ["CH3", "CH2", "CH2", "CH2", "CH3"], bonds: ["–", "–", "–", "–"]}]} note="นับครบทุกกลุ่มโดยไม่ข้าม ได้ C₅H₁₂" onDone={onDone}/>;
    default: return null;
  }
}
