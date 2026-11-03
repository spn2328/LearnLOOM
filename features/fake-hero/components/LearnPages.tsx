"use client";
import React, {useState} from "react";
import {lessons} from "../content/episode01";
import type {MoleculeId} from "../content/molecules";
import {Molecule2D, MoleculeView} from "./Molecule3D";
import {Dialogue, Loom} from "./ui";

// Infographic lesson pages (owner mockups, แก้ไข.pdf p.3–7). Key sentences come from the lesson
// content; card details (properties, uses, observations) are drafted and need teacher review.

type Info = {id: MoleculeId; formula: string; th: string; en: string};
const tabs = (names: string[], value: number, set: (i: number) => void) => (
  <div className="fh-tabs" role="tablist">
    {names.map((n, i) => <button key={n} role="tab" aria-selected={value === i} className={value === i ? "on" : ""} onClick={() => set(i)}>{n}</button>)}
  </div>
);
const Section = ({mark, title, sub, children, tone = ""}: {mark: string; title: string; sub?: string; children: React.ReactNode; tone?: string}) => (
  <section className={`fh-info ${tone}`}>
    <header><span className="fh-mark">{mark}</span><div><h3>{title}</h3>{sub && <p>{sub}</p>}</div></header>
    {children}
  </section>
);

// ---------- C01 · L01 ----------
const organic: (Info & {rows: [string, string][]; struct: string; uses: string[]; note: string})[] = [
  {id: "CH4", formula: "CH₄", th: "มีเทน", en: "Methane", struct: "คาร์บอน 1 อะตอมสร้างพันธะเดี่ยวกับไฮโดรเจน 4 อะตอม", uses: ["เชื้อเพลิงหุงต้มและผลิตไฟฟ้า", "องค์ประกอบหลักของแก๊สชีวภาพ"], note: "เป็นสารประกอบอินทรีย์อย่างง่าย ประกอบด้วยคาร์บอนและไฮโดรเจน",
    rows: [["สูตรโมเลกุล", "CH₄"], ["ชื่อเรียก", "มีเทน (Methane)"], ["ประเภท", "สารประกอบอินทรีย์"], ["องค์ประกอบ", "คาร์บอน 1 อะตอม + ไฮโดรเจน 4 อะตอม"], ["ลักษณะ", "แก๊ส ไม่มีสี ไม่มีกลิ่น"], ["ตัวอย่างการพบ", "แก๊สธรรมชาติ แก๊สชีวภาพ"]]},
  {id: "C2H6", formula: "C₂H₆", th: "อีเทน", en: "Ethane", struct: "คาร์บอน 2 อะตอมต่อกันด้วยพันธะเดี่ยว: CH₃–CH₃", uses: ["วัตถุดิบในอุตสาหกรรมปิโตรเคมี", "พบปนในแก๊สธรรมชาติ"], note: "มีพันธะระหว่างคาร์บอนกับคาร์บอน และคาร์บอนกับไฮโดรเจน",
    rows: [["สูตรโมเลกุล", "C₂H₆"], ["ชื่อเรียก", "อีเทน (Ethane)"], ["ประเภท", "สารประกอบอินทรีย์"], ["องค์ประกอบ", "คาร์บอน 2 อะตอม + ไฮโดรเจน 6 อะตอม"], ["ลักษณะ", "แก๊ส ไม่มีสี"], ["ตัวอย่างการพบ", "แก๊สธรรมชาติ"]]},
  {id: "CH3OH", formula: "CH₃OH", th: "เมทานอล", en: "Methanol", struct: "คาร์บอนต่อกับไฮโดรเจน 3 อะตอม และหมู่ –OH", uses: ["ตัวทำละลายในอุตสาหกรรม", "เป็นพิษ ห้ามดื่มหรือสัมผัสโดยตรง"], note: "สารอินทรีย์อาจมีธาตุอื่น เช่น ออกซิเจน อยู่ด้วย",
    rows: [["สูตรโมเลกุล", "CH₃OH"], ["ชื่อเรียก", "เมทานอล (Methanol)"], ["ประเภท", "สารประกอบอินทรีย์"], ["องค์ประกอบ", "คาร์บอน 1 · ไฮโดรเจน 4 · ออกซิเจน 1 อะตอม"], ["ลักษณะ", "ของเหลวใส ระเหยง่าย ติดไฟได้"], ["ตัวอย่างการพบ", "ตัวทำละลาย เชื้อเพลิงบางชนิด"]]},
];
const exceptions: (Info & {rows: [string, string][]; note: string})[] = [
  {id: "CO2", formula: "CO₂", th: "คาร์บอนไดออกไซด์", en: "Carbon dioxide", note: "แม้มีคาร์บอน แต่จัดเป็นสารอนินทรีย์ตามการจำแนกทั่วไป",
    rows: [["องค์ประกอบ", "คาร์บอน 1 · ออกซิเจน 2 อะตอม"], ["ประเภท", "สารอนินทรีย์"], ["ลักษณะ", "แก๊ส ไม่มีสี"], ["ตัวอย่างการพบ", "ในอากาศ ลมหายใจออก"]]},
  {id: "Na2CO3", formula: "Na₂CO₃", th: "โซเดียมคาร์บอเนต", en: "Sodium carbonate", note: "เป็นเกลือคาร์บอเนต จัดเป็นสารอนินทรีย์ แม้มีคาร์บอนเป็นองค์ประกอบ",
    rows: [["องค์ประกอบ", "โซเดียม 2 · คาร์บอน 1 · ออกซิเจน 3 อะตอม"], ["ประเภท", "สารอนินทรีย์"], ["ลักษณะ", "ของแข็งสีขาว"], ["ตัวอย่างการพบ", "ผงซักฟอก การทำแก้ว"]]},
];

export function LearnL01({story, media}: {story: string[]; media?: React.ReactNode}) {
  const [pick, setPick] = useState(0);
  const [tab, setTab] = useState(0);
  const m = organic[pick];
  return (
    <div className="fh-learn">
      <h2 className="fh-title">สารประกอบอินทรีย์คืออะไร?</h2>
      {media}
      <Dialogue lines={story} />
      <Section mark="A" title="รู้จักสารประกอบอินทรีย์" sub={lessons[0].concept[0]} tone="green">
        <div className="fh-mcards">
          {organic.map((o, i) => (
            <button key={o.id} className={`fh-mcard ${pick === i ? "on" : ""}`} aria-pressed={pick === i} onClick={() => { setPick(i); setTab(0); }}>
              <b>{o.formula}</b><span>{o.th}</span><small>({o.en})</small><Molecule2D id={o.id} size={90} />
            </button>
          ))}
        </div>
        <div className="fh-detail">
          <MoleculeView id={m.id} height={220} />
          <div>
            <h3 className="fh-detail-title">{m.formula} <span>{m.th} ({m.en})</span></h3>
            {tabs(["ข้อมูลเบื้องต้น", "สูตรและโครงสร้าง", "การใช้ประโยชน์"], tab, setTab)}
            {tab === 0 && <dl className="fh-rows">{m.rows.map(([k, v]) => <React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>)}</dl>}
            {tab === 1 && <div className="fh-rows-text"><div className="fh-formula-chip">{m.formula}</div><p>{m.struct}</p></div>}
            {tab === 2 && <ul className="fh-list">{m.uses.map(u => <li key={u}>{u}</li>)}</ul>}
            <p className="fh-note">🌿 {m.note}</p>
          </div>
        </div>
      </Section>
      <Section mark="B" title="มีคาร์บอนแล้ว…ไม่ใช่สารประกอบอินทรีย์เสมอไป" sub="สารบางชนิดมีคาร์บอน แต่จัดเป็นสารอนินทรีย์ตามการจำแนกทั่วไป" tone="orange">
        <div className="fh-excards">
          {exceptions.map(x => (
            <div key={x.id} className="fh-excard">
              <div className="fh-excard-head"><b>{x.formula}</b><span>{x.th}<small>({x.en})</small></span><em>ข้อยกเว้น</em></div>
              <div className="fh-excard-body"><Molecule2D id={x.id} size={110} /><dl className="fh-rows small">{x.rows.map(([k, v]) => <React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>)}</dl></div>
              <p className="fh-note warn">⚗️ {x.note}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section mark="B" title="เปรียบเทียบภาพรวม · เข้าใจข้อยกเว้น" tone="blue">
        <p>แม้ CH₄, CO₂ และ Na₂CO₃ มีคาร์บอนเป็นองค์ประกอบ แต่ไม่ได้จัดเป็นสารอินทรีย์ทั้งหมดตามการจำแนกทั่วไป การมีคาร์บอนไม่ใช่เงื่อนไขเพียงอย่างเดียวที่ใช้ตัดสินประเภทสาร</p>
        <div className="fh-compare">
          <div className="good"><h4>สารประกอบอินทรีย์ (ส่วนใหญ่)</h4><ul><li>เป็นสารประกอบของคาร์บอน</li><li>มักมีพันธะระหว่างคาร์บอนกับไฮโดรเจน หรือกับธาตุอื่น เช่น O, N, S, Cl</li><li>มีโครงสร้างหลากหลาย</li><li>พบได้ในเชื้อเพลิง อาหาร และสิ่งของรอบตัว</li></ul></div>
          <div className="bad"><h4>สารที่มีคาร์บอนแต่ไม่ใช่สารอินทรีย์ (ข้อยกเว้น)</h4><ul><li>คาร์บอนไดออกไซด์ (CO₂)</li><li>คาร์บอเนต (CO₃²⁻) เช่น Na₂CO₃, CaCO₃</li><li>คาร์ไบด์ (carbide)</li><li>คาร์บอนมอนอกไซด์ (CO)</li></ul></div>
        </div>
      </Section>
      <Section mark="C" title="เชื่อมความรู้กับสถานการณ์ในคดี" tone="purple">
        <p className="fh-hint">สารตัวอย่างเหล่านี้เป็นสารสำหรับฝึกจำแนก ไม่ใช่ผลตรวจจากแม่น้ำหรือถังของเจฟ</p>
        <Loom pose="clipboard" small>ตอนนี้เรายังบอกไม่ได้ว่าสารในแม่น้ำคืออะไร ต้องใช้หลักฐานจากการตรวจจริงเพิ่มเติม ก่อนสรุปว่าใครเป็นต้นเหตุ</Loom>
      </Section>
    </div>
  );
}

// ---------- C02 · bonds ----------
const bondCards: (Info & {bond: string; pairs: string; more: string})[] = [
  {id: "C2H6", formula: "CH₃–CH₃", th: "อีเทน", en: "Ethane", bond: "พันธะเดี่ยว", pairs: "C–C ใช้อิเล็กตรอนร่วมกัน 1 คู่", more: "คาร์บอนแต่ละอะตอมเชื่อมกับ H 3 อะตอม และ C อีก 1 อะตอม"},
  {id: "C2H4", formula: "CH₂=CH₂", th: "เอทีน", en: "Ethene", bond: "พันธะคู่", pairs: "C=C ใช้อิเล็กตรอนร่วมกัน 2 คู่", more: "คาร์บอนแต่ละอะตอมเชื่อมกับ H 2 อะตอม และ C อีก 1 อะตอมด้วยพันธะคู่"},
  {id: "C2H2", formula: "HC≡CH", th: "เอไทน์", en: "Ethyne", bond: "พันธะสาม", pairs: "C≡C ใช้อิเล็กตรอนร่วมกัน 3 คู่", more: "คาร์บอนแต่ละอะตอมเชื่อมกับ H 1 อะตอม และ C อีก 1 อะตอมด้วยพันธะสาม"},
];
function LearnC02() {
  const [open, setOpen] = useState<number>();
  const [tab, setTab] = useState(0);
  const c = open === undefined ? undefined : bondCards[open];
  return (
    <>
      <div className="fh-bondcards">
        {bondCards.map((b, i) => (
          <div key={b.id} className={`fh-bondcard ${open === i ? "on" : ""}`}>
            <span className="fh-pill">{b.bond}</span>
            <Molecule2D id={b.id} size={110} />
            <b className="fh-mol-formula">{b.formula}</b>
            <button onClick={() => { setOpen(i); setTab(0); }}>สำรวจ 3D</button>
          </div>
        ))}
      </div>
      <p className="fh-hint">💡 ลองกดดูแต่ละโมเลกุล แล้วสังเกตจำนวนเส้นพันธะว่าต่างกันอย่างไร</p>
      {c && (
        <div className="fh-explore fh-pop">
          <h3>{c.formula} <span>{c.bond}</span></h3>
          {tabs(["โมเดล 3D", "โครงสร้าง 2D", "ข้อมูลเพิ่มเติม"], tab, setTab)}
          {tab === 0 && <MoleculeView id={c.id} height={240} />}
          {tab === 1 && <div className="fh-center"><Molecule2D id={c.id} size={200} /><div className="fh-formula-chip">{c.formula}</div></div>}
          {tab === 2 && <dl className="fh-rows"><dt>ชื่อ</dt><dd>{c.th} ({c.en})</dd><dt>ชนิดพันธะ C กับ C</dt><dd>{c.bond}</dd><dt>อิเล็กตรอนคู่ร่วม</dt><dd>{c.pairs}</dd><dt>การเชื่อมต่อ</dt><dd>{c.more}</dd></dl>}
        </div>
      )}
    </>
  );
}

// ---------- C03 · shapes ----------
const shapes: (Info & {kind: string; desc: string; see: string[]})[] = [
  {id: "butane", formula: "CH₃–CH₂–CH₂–CH₃", th: "บิวเทน", en: "Butane", kind: "สายโซ่ตรง", desc: "คาร์บอนเชื่อมต่อกันเป็นสายเดียว เรียงต่อกันไป", see: ["คาร์บอนเรียงต่อกันเป็นสายเดียว ไม่มีการแตกกิ่ง", "แม้วาดเป็นซิกแซก ก็ยังเป็นโซ่ตรง", "ปลายทั้งสองด้านเป็นหมู่ CH₃"]},
  {id: "isobutane", formula: "CH₃–CH(CH₃)–CH₃", th: "2-เมทิลโพรเพน", en: "Isobutane", kind: "สายโซ่แตกกิ่ง", desc: "มีหมู่คาร์บอนแตกกิ่งออกจากสายโซ่หลัก", see: ["สายโซ่หลักมีคาร์บอน 3 อะตอม", "มีหมู่ CH₃ แตกกิ่งออกจากคาร์บอนตรงกลาง", "คาร์บอนตรงกลางเชื่อมกับคาร์บอน 3 อะตอม"]},
  {id: "cyclobutane", formula: "ไซโคลบิวเทน (C₄H₈)", th: "ไซโคลบิวเทน", en: "Cyclobutane", kind: "วง", desc: "คาร์บอนเชื่อมต่อกันเป็นวงปิด", see: ["คาร์บอนตัวสุดท้ายเชื่อมกลับมาที่ตัวแรก", "ไม่มีปลายโซ่", "คาร์บอนแต่ละอะตอมเชื่อมกับคาร์บอน 2 อะตอม"]},
];
function LearnC03() {
  const [t, setT] = useState(0);
  const s = shapes[t];
  return (
    <>
      {tabs(shapes.map(x => x.kind), t, setT)}
      <div className="fh-shape">
        <div className="fh-shape-main">
          <h3>{s.kind}</h3><p className="fh-muted">{s.desc}</p>
          <MoleculeView key={s.id} id={s.id} formula={s.formula} name={`${s.th} (${s.en})`} height={220} />
        </div>
        <div className="fh-observe">
          <h3>💡 สิ่งที่สังเกตได้</h3>
          <ol>{s.see.map(x => <li key={x}>{x}</li>)}</ol>
        </div>
      </div>
    </>
  );
}

// ---------- C04 · bond-order count per carbon ----------
type Count = {label: string; bonds: [string, number][]};
const counts: {id: MoleculeId; formula: string; name: string; carbons: Count[]}[] = [
  {id: "propene", formula: "CH₃–CH=CH₂", name: "โพรพีน", carbons: [
    {label: "C1 (CH₃)", bonds: [["C–H × 3", 3], ["C–C", 1]]},
    {label: "C2 (CH)", bonds: [["C–C", 1], ["C=C", 2], ["C–H", 1]]},
    {label: "C3 (CH₂)", bonds: [["C=C", 2], ["C–H × 2", 2]]},
  ]},
  {id: "but2ene", formula: "CH₃–CH=CH–CH₃", name: "บิวต์-2-อีน", carbons: [
    {label: "C1 (CH₃)", bonds: [["C–H × 3", 3], ["C–C", 1]]},
    {label: "C2 (CH)", bonds: [["C–C", 1], ["C=C", 2], ["C–H", 1]]},
    {label: "C3 (CH)", bonds: [["C=C", 2], ["C–C", 1], ["C–H", 1]]},
    {label: "C4 (CH₃)", bonds: [["C–C", 1], ["C–H × 3", 3]]},
  ]},
];
function LearnC04() {
  const [t, setT] = useState(0);
  const [c, setC] = useState(0);
  const m = counts[t], cur = m.carbons[c] ?? m.carbons[0];
  return (
    <>
      {tabs(counts.map(x => x.formula), t, i => { setT(i); setC(0); })}
      <div className="fh-shape">
        <div className="fh-shape-main"><MoleculeView key={m.id} id={m.id} formula={m.formula} name={m.name} height={210} /></div>
        <div className="fh-observe">
          <h3>🔍 นับพันธะทีละคาร์บอน</h3>
          <div className="fh-chips">{m.carbons.map((x, i) => <button key={x.label} className={c === i ? "on" : ""} onClick={() => setC(i)}>{x.label}</button>)}</div>
          <table className="fh-count"><tbody>
            {cur.bonds.map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}
            <tr className="sum"><td>ผลรวมอันดับพันธะ</td><td>{cur.bonds.reduce((s, b) => s + b[1], 0)}</td></tr>
          </tbody></table>
        </div>
      </div>
    </>
  );
}

// ---------- C05 · count atoms → molecular formula ----------
const groups: [string, number][] = [["CH₃", 3], ["C", 0], ["CH", 1]];
function LearnC05() {
  const [n, setN] = useState(0);
  const h = groups.slice(0, n).reduce((s, g) => s + g[1], 0);
  return (
    <div className="fh-shape">
      <div className="fh-shape-main"><MoleculeView id="propyne" formula="CH₃–C≡CH" name="โพรไพน์" height={200} /></div>
      <div className="fh-observe">
        <h3>🧮 นับ H ทีละส่วน</h3>
        <div className="fh-groups">{groups.map(([g, k], i) => <div key={i} className={i < n ? "on" : ""}><b>{g}</b><span>{i < n ? `H ${k}` : "?"}</span></div>)}</div>
        {n < groups.length ? <button onClick={() => setN(n + 1)}>นับส่วนถัดไป</button> :
          <p className="fh-result fh-pop">C 3 อะตอม · H 3 + 0 + 1 = {h} อะตอม → <b>C₃H₄</b></p>}
      </div>
    </div>
  );
}

export function LearnUnit({unit}: {unit: number}) {
  const u = lessons[unit];
  const loomHint = u.story[u.story.length - 1];
  return (
    <div className="fh-learn">
      <div className="fh-learn-top">
        <div><h2 className="fh-title">{u.title}</h2><p className="fh-muted">{u.concept[0]}</p></div>
        <Loom pose="point" small side="right"><b>ลูมบอกใบ้ให้!</b> {loomHint.replace(/^ลูม:\s*/, "")}</Loom>
      </div>
      {unit === 1 && <LearnC02 />}
      {unit === 2 && <LearnC03 />}
      {unit === 3 && <LearnC04 />}
      {unit === 4 && <LearnC05 />}
      <section className="fh-info green">
        <header><span className="fh-mark">✓</span><div><h3>สรุปสิ่งที่ได้เรียนรู้</h3></div></header>
        <ul className="fh-checks">{u.concept.map(x => <li key={x}>{x}</li>)}</ul>
      </section>
    </div>
  );
}
