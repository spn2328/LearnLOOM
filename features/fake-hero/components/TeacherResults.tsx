"use client";
import {useState} from "react";
import {Download,FileUp,Trash2} from "lucide-react";
import {download,xlsx} from "../../../lib/export";
import {lessons,checkpoint,checkpointReasons} from "../content/episode01";
import {parseResult,type StudentResult} from "../results";

const conceptIds=lessons.map(l=>l.main.id.replace("Q","C"));
const mark=(ok:boolean,a?:string)=>a?`${a}${ok?" ✓":" ✗"}`:"—";
// Adaptive route with help switches, e.g. "Path B → A → C" (a switch = practice wrong, another activity tried)
type Concept=StudentResult["concepts"][number];
const route=(c:Concept)=>c.path?["Path "+c.path,...(c.helpSwitches??[]).map(x=>x.to)].join(" → "):"";
const switchText=(c:Concept)=>(c.helpSwitches??[]).map(x=>`${x.at}: ${x.from}→${x.to}${c.practiceRetry?.[x.at]?` ลองซ้ำ ${c.practiceRetry[x.at]}`:""}`).join(", ");

// Teacher area without a server: import the result files students send, review, export Excel.
export default function TeacherResults(){
  const [rows,setRows]=useState<StudentResult[]>([]);
  const [errors,setErrors]=useState<string[]>([]);
  async function importFiles(files:FileList|null){
    if(!files)return;const ok:StudentResult[]=[],bad:string[]=[];
    for(const f of Array.from(files)){try{ok.push(parseResult(await f.text()))}catch{bad.push(f.name)}}
    // Same nickname again = newer file replaces the older one
    setRows(prev=>{const m=new Map(prev.map(r=>[r.nickname,r]));for(const r of ok){const old=m.get(r.nickname);if(!old||old.exportedAt<=r.exportedAt)m.set(r.nickname,r)}return [...m.values()].sort((a,b)=>a.nickname.localeCompare(b.nickname,"th"))});
    setErrors(bad);
  }
  function exportExcel(){
    const overview=[["ชื่อเล่น","ส่งเมื่อ","จบ EP.01",...conceptIds,"ผ่านด้วยตนเอง (แนวคิด)","CP คำตอบ /5","CP เหตุผล /5","CP รวม /10","ผ่าน 70%","Transfer (ให้ครูตรวจ)"],
      ...rows.map(r=>[r.nickname,new Date(r.exportedAt).toLocaleString("th-TH"),r.finished?"จบ":"ยังไม่จบ",...r.concepts.map(c=>c.outcome),r.concepts.filter(c=>c.firstCorrect).length,r.checkpoint.answerScore,r.checkpoint.reasonScore,r.checkpoint.score,r.checkpoint.score>=7?"ผ่าน":"ไม่ผ่าน",r.transfer])];
    const detail=[["ชื่อเล่น","แนวคิด","คำตอบครั้งแรก","เหตุผลครั้งแรก","ครั้งแรกถูกทั้งคู่","ได้รับบทช่วย","เส้นทาง Adaptive","เปลี่ยนวิธีช่วย (ข้อ: จาก→เป็น)","ตอบซ้ำ (Recheck)","Recheck-B","Recheck ถูก","ยืนยันความเข้าใจ","ผล"],
      ...rows.flatMap(r=>r.concepts.map(c=>[r.nickname,c.id,c.firstMain??"",c.firstReason??"",c.firstCorrect?"ใช่":"ไม่",c.assisted?"ใช่":"ไม่",route(c),switchText(c),c.recheck??"",c.recheckB??"",c.recheckCorrect?"ใช่":"ไม่",c.transfer??"",c.outcome]))];
    const cp=[["ชื่อเล่น",...checkpoint.flatMap(q=>[q.id,q.id+"-E"])],
      ...rows.map(r=>[r.nickname,...checkpoint.flatMap((q,i)=>[mark(r.checkpoint.answers[q.id]===q.answer,r.checkpoint.answers[q.id]),mark(r.checkpoint.reasons[checkpointReasons[i].id]===checkpointReasons[i].answer,r.checkpoint.reasons[checkpointReasons[i].id])])])];
    download(`LearnLOOM-EP01-ผลห้องเรียน-${new Date().toISOString().slice(0,10)}.xlsx`,xlsx([{name:"สรุป",rows:overview},{name:"รายแนวคิด",rows:detail},{name:"Checkpoint",rows:cp}]));
  }
  // Wrong first-attempt reasons per concept show which misconception is common in the class
  const weak=conceptIds.map((id,i)=>({id,miss:rows.filter(r=>r.concepts[i]?.firstMain&&!r.concepts[i].firstCorrect).length,switched:rows.filter(r=>r.concepts[i]?.helpSwitches?.length).length})).filter(x=>x.miss>0);
  return <section className="page-content">
    <div className="panel"><h2>พื้นที่ครู · ผลการเรียน EP.01</h2>
      <p>ให้นักเรียนกด <strong>ส่งผลให้ครู</strong> ในหน้าสรุปตอนหรือหน้าความก้าวหน้า แล้วส่งไฟล์ .json มาให้ครู จากนั้นนำเข้าไฟล์ทั้งหมดพร้อมกันได้ที่นี่ ข้อมูลอยู่ในเบราว์เซอร์นี้เท่านั้น</p>
      <label className="primary" style={{display:"inline-flex",gap:8,alignItems:"center",cursor:"pointer"}}><FileUp size={18}/> นำเข้าไฟล์ผลของนักเรียน<input type="file" accept=".json,application/json" multiple hidden onChange={e=>{void importFiles(e.target.files);e.target.value=""}}/></label>
      {errors.length>0&&<p className="fine">อ่านไม่ได้ {errors.length} ไฟล์: {errors.join(", ")}</p>}
    </div>
    <div className="table-toolbar"><b>นักเรียน {rows.length} คน</b><div style={{display:"flex",gap:8}}>{rows.length>0&&<button className="secondary" onClick={()=>setRows([])}><Trash2 size={18}/>ล้างตาราง</button>}<button className="primary" disabled={!rows.length} onClick={exportExcel}><Download size={18}/>ส่งออก Excel</button></div></div>
    {rows.length>0&&<div className="table-scroll"><table><thead><tr><th>ชื่อเล่น</th><th>จบตอน</th>{conceptIds.map(id=><th key={id}>{id}<br/><small>คำตอบ/เหตุผลครั้งแรก</small></th>)}<th>CP /10</th><th>Transfer</th></tr></thead>
      <tbody>{rows.map(r=><tr key={r.nickname}><td><b>{r.nickname}</b><br/><small>{new Date(r.exportedAt).toLocaleString("th-TH")}</small></td><td>{r.finished?"จบ":"ยังไม่จบ"}</td>
        {r.concepts.map(c=><td key={c.id} title={c.outcome}>{c.firstMain?`${c.firstMain}/${c.firstReason??"—"} ${c.firstCorrect?"✓":"✗"}`:"—"}<br/><small>{c.outcome}{c.assisted?" · ได้บทช่วย":""}</small>{c.path&&<><br/><small title={switchText(c)||undefined}>{route(c)}{c.helpSwitches?.length?` (เปลี่ยนวิธี ${c.helpSwitches.length})`:""}</small></>}</td>)}
        <td><b>{r.checkpoint.score}</b> {r.checkpoint.score>=7?"ผ่าน":"ไม่ผ่าน"}<br/><small>คำตอบ {r.checkpoint.answerScore} · เหตุผล {r.checkpoint.reasonScore}</small></td>
        <td style={{minWidth:220,whiteSpace:"pre-wrap"}}>{r.transfer||"—"}</td></tr>)}</tbody></table></div>}
    {weak.length>0&&<div className="panel"><h2>แนวคิดที่ควรทบทวนทั้งห้อง</h2>{weak.sort((a,b)=>b.miss-a.miss).map(w=><p key={w.id}>{w.id}: ตอบครั้งแรกยังไม่ถูกทั้งคำตอบและเหตุผล {w.miss}/{rows.length} คน{w.switched>0&&` · ต้องเปลี่ยนวิธีช่วย ${w.switched} คน`}</p>)}<p className="fine">Transfer เป็นคำตอบอิสระ ครูต้องตรวจเหตุผลเอง · "เปลี่ยนวิธีช่วย" = ตอบแบบฝึกผิดแล้วระบบเปลี่ยนไปใช้กิจกรรมของเส้นทางอื่น ถ้ามีหลายคน อาจต้องสอนแนวคิดนั้นด้วยวิธีอื่นในห้อง</p></div>}
  </section>;
}
