"use client";
import React,{useState} from "react";

// In-page two-step confirm. window.confirm is silently blocked (returns false)
// in some embedded/in-app browsers, which made restart buttons do nothing.
export function ConfirmButton({label,question,onConfirm}:{label:string;question:string;onConfirm:()=>void}){
 const [asking,setAsking]=useState(false);
 if(!asking)return <button onClick={()=>setAsking(true)}>{label}</button>;
 return <span className="fh-confirm" role="group" aria-label={question}><span>{question}</span><button className="fh-confirm-yes" onClick={()=>{setAsking(false);onConfirm()}}>ยืนยัน</button><button onClick={()=>setAsking(false)}>ยกเลิก</button></span>;
}
