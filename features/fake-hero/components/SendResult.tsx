"use client";
import {useState} from "react";
import {Send} from "lucide-react";
import {download} from "../../../lib/export";
import {buildResult,resultFileName} from "../results";

// Saves this browser's EP.01 progress as a file the student hands to the teacher.
export default function SendResult({className="primary"}:{className?:string}){
  const [sent,setSent]=useState("");
  function send(){const r=buildResult();download(resultFileName(r),JSON.stringify(r,null,2));setSent(resultFileName(r));}
  return <div className="fh-send-result"><button className={className} onClick={send}><Send size={18}/> ส่งผลให้ครู</button>
    <p className="fine">{sent?`บันทึกไฟล์ ${sent} แล้ว ส่งไฟล์นี้ให้ครูทางช่องทางของห้องเรียน`:"ระบบจะสร้างไฟล์ผลการเรียน (.json) เพื่อส่งให้ครู ไม่มีการส่งข้อมูลออกจากเครื่องเอง"}</p></div>;
}
