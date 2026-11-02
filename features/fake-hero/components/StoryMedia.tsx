"use client";
import {useState} from "react";
type Props={kind:"image"|"video";file:string;label:string};
export default function StoryMedia({kind,file,label}:Props){
 const [missing,setMissing]=useState(false);
 if(missing)return <div className="fh-placeholder" role="note">สื่อภาพประกอบ: {label} (เพิ่มไฟล์ใน public/fake-hero/ เพื่อเปิดใช้งาน)</div>;
 const src="/fake-hero/"+file;
 return <figure className="fh-story-media">{kind==="video"?<video controls playsInline preload="metadata" aria-label={label} onError={()=>setMissing(true)}><source src={src} type="video/mp4" />ไม่รองรับวิดีโอนี้</video>:<img loading="lazy" src={src} alt={label} onError={()=>setMissing(true)}/>}<figcaption>{label}</figcaption></figure>
}
