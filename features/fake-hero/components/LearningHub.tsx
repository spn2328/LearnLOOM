"use client";
import {useEffect,useState} from "react";
import {BookOpen,ArrowRight,NotebookPen,ChartNoAxesCombined,LockKeyhole,CheckCircle2} from "lucide-react";

type Snapshot={page?:string;first?:{answer:string;reason:string};assisted?:boolean;recheck?:string};
type EpisodeSave={unit?:number;step?:string;records?:Record<string,{first?:{main:string;reason:string};recheck?:string;assisted?:boolean}>;cp?:Record<string,string>;cpReasons?:Record<string,string>};
const names=["สารอินทรีย์และสารอนินทรีย์","พันธะเดี่ยว คู่ สาม","โซ่ตรง โซ่กิ่ง และวง","การตรวจอันดับพันธะ","สูตรโครงสร้างและสูตรโมเลกุล"];
function getProgress(){
 let first:Snapshot={},extra:EpisodeSave={};
 try{first=JSON.parse(localStorage.getItem("learnloom-fake-hero-v1")||"{}");extra=JSON.parse(localStorage.getItem("learnloom-fake-hero-ep01-extension-v1")||"{}")}catch{}
 const done=extra.step==="ending";const active=!!first.page||!!extra.step;
 const states=names.map((_,i)=>{
 if(i===0)return first.first?.answer==="A"&&first.first.reason==="B"?"ผ่านด้วยตนเอง":first.recheck==="B"?"ผ่านหลังช่วย":"ยังไม่มีผลยืนยัน";
 const x=extra.records?.["C0"+(i+1)];
 return x?.first?.main===["","A","B","A","C","B"][i+1]&&x?.first?.reason===["","B","B","C","B","A"][i+1]?"ผ่านด้วยตนเอง":x?.recheck?"ผ่านการตรวจซ้ำ/ควรตรวจผล":"ยังไม่มีผลยืนยัน";
 });
 return {active,done,states,extra};
}
const episodes=[["EP.01","คนในคลิป","พันธะของคาร์บอนและรูปแบบโครงสร้าง",true],["EP.02","ฮีโร่ของแม่น้ำ","สูตรโครงสร้างลิวอิส แบบย่อ และแบบเส้นพันธะ",false],["EP.03","ฉลากที่ซ่อนอยู่","หมู่ฟังก์ชัน",false],["EP.04","รหัสของสาร","ชื่อสารอินทรีย์และไอโซเมอร์",false],["EP.05","คราบที่หายไป","สมบัติการละลายของสารประกอบอินทรีย์",false],["EP.06","เปิดโปงฮีโร่","บูรณาการความรู้และประเมินผล",false]] as const;
export default function LearningHub({mode,onStart}:{mode:"library"|"progress"|"notebook"|"certificates";onStart:()=>void}){
 const [data,setData]=useState<ReturnType<typeof getProgress>|null>(null);
 useEffect(()=>{setData(getProgress())},[mode]);
 return <section className="page-content">
 <div className="page-title"><span className="eyebrow">LEARNLOOM · เคมีอินทรีย์ ม.6</span><h1>{mode==="library"?"คลังบทเรียน":mode==="progress"?"ความก้าวหน้าของฉัน":mode==="notebook"?"สมุดบันทึกของฉัน":"เกียรติบัตร"}</h1><p>{mode==="library"?"หนึ่ง Chapter เท่ากับหนึ่งซีรีส์ และแบ่งเป็น Episode ตามลำดับการเรียนรู้":mode==="progress"?"เรียนรู้ตามจังหวะของตัวเอง ดูสิ่งที่เข้าใจและสิ่งที่ต้องทบทวน":mode==="notebook"?"สมุดหลักฐานและสาระสำคัญที่เปิดอ่านได้ตลอดการเรียน":"เกียรติบัตรจะเปิดให้รับเมื่อเรียนครบทั้งซีรีส์และผ่านเกณฑ์"}</p></div>
 {mode==="library"&&<><article className="chapter-card"><img src="/images/archive.webp" alt="ภาพประกอบ LearnLOOM ต้นฉบับ"/><div><span className="badge">CHAPTER 01 · THE FAKE HERO</span><h2>ซีรีส์สืบสวนเคมีอินทรีย์</h2><p>ร่วมกับลูมค้นหาความจริงเกี่ยวกับคราบปริศนาบนแม่น้ำปราจีนบุรี</p><button className="primary" onClick={onStart}>{data?.active?"เรียนต่อ EP.01":"เริ่ม EP.01"}<ArrowRight size={18}/></button></div></article><div className="ll-episode-list">{episodes.map(([id,title,desc,enabled])=><article className="ll-episode-card" key={id}><BookOpen size={22}/><div><strong>{id} — {title}</strong><p>{desc}</p><small>{enabled?(data?.done?"เรียนจบตอนแล้ว":data?.active?"กำลังเรียน":"พร้อมเรียน"):"ยังไม่เปิดให้เรียน"}</small></div>{enabled?<button className="secondary" onClick={onStart}>{data?.active?"เรียนต่อ":"เริ่มเรียน"}</button>:<LockKeyhole size={18} aria-label="ยังไม่เปิด"/>}</article>)}</div></>}
 {mode==="progress"&&<><div className="panel"><h2>ความก้าวหน้า EP.01</h2><p>{data?.done?"จบเนื้อหาต้นแบบแล้ว":data?.active?"กำลังเรียน · กลับมาเรียนต่อได้":"ยังไม่เริ่มเรียน"}</p><button className="primary" onClick={onStart}> {data?.active?"เรียนต่อจากจุดเดิม":"เริ่มเรียน"} <ArrowRight size={18}/></button></div><div className="ll-episode-list">{names.map((name,i)=><article key={name} className="ll-episode-card"><ChartNoAxesCombined size={20}/><div><strong>C0{i+1} — {name}</strong><p>{data?.states[i]??"ยังไม่ได้เริ่ม"}</p></div></article>)}</div><p className="fine">ข้อมูลนี้บันทึกเฉพาะเบราว์เซอร์นี้ ยังไม่ซิงก์ข้อมูลกับบัญชีครูหรือข้ามอุปกรณ์</p></>}
 {mode==="notebook"&&<><article className="panel"><h2><NotebookPen size={22}/> สมุดหลักฐานของคดี</h2><p><strong>สิ่งที่ทราบ:</strong> คลิปแสดงเจฟเทของเหลวลงท่อระบายน้ำ</p><p><strong>สิ่งที่ยังต้องตรวจ:</strong> ของเหลวในถังและต้นกำเนิดคราบบนแม่น้ำ</p><p>เจฟให้การว่าเป็นน้ำเชื่อมบูด แต่คำกล่าวอ้างยังไม่ใช่ผลตรวจสาร</p></article><div className="ll-episode-list">{names.map((name,i)=><article className="ll-episode-card" key={name}><NotebookPen size={20}/><div><strong>C0{i+1} — {name}</strong><p>{["การมีคาร์บอนไม่ใช่เกณฑ์เดียวสำหรับจำแนกสารอินทรีย์","พันธะเดี่ยว คู่ สาม ใช้อิเล็กตรอนร่วมกัน 1, 2, 3 คู่","ประเภทโครงสร้างพิจารณาจากการเชื่อมต่อของคาร์บอน","ผลรวมอันดับพันธะของคาร์บอนในสารอินทรีย์เป็นกลางทั่วไปมักเท่ากับ 4","สูตรโมเลกุลบอกจำนวนอะตอม สูตรโครงสร้างบอกการเชื่อมต่อ"][i]}</p></div><CheckCircle2 size={18}/></article>)}</div></>}
 {mode==="certificates"&&<article className="panel"><h2>เกียรติบัตรประจำซีรีส์</h2><p>ยังไม่เปิดรับเกียรติบัตรในเดโม EP.01 เพราะต้องเรียนครบทุก Episode ของ The Fake Hero และผ่านการประเมินปลายซีรีส์ก่อน</p><p className="fine">ไม่ใช่เอกสารรับรองคุณวุฒิทางการศึกษา</p></article>}
 </section>
}
