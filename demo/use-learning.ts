"use client";
import {useCallback,useEffect,useRef,useState} from 'react';
import {initialGame,type Game} from '../lib/learning';
import type {UserProfile,Classroom} from '../lib/use-learning';
export type {UserProfile,Classroom};
const KEY='learnloom-demo-v1';
type Boot={identity:{id:string;signed:boolean;display:string};profile:UserProfile|null;game:Game|null;revision:number;syncedAt:number|null;classroom:Classroom|null};
const fresh=():Boot=>({identity:{id:'local-demo',signed:false,display:''},profile:null,game:null,revision:0,syncedAt:null,classroom:null});
export async function api(_action:string,_data:Record<string,unknown>={}):Promise<{profile:UserProfile}>{throw new Error('เดโมยังไม่เปิดระบบห้องเรียนออนไลน์');}
export function useLearning(){
  const [boot,setBoot]=useState<Boot|null>(null);
  const [game,setGame]=useState<Game|null>(null);
  const [error,setError]=useState('');
  const [status,setStatus]=useState('บันทึกในเครื่อง');
  const [syncedAt,setSyncedAt]=useState<number|null>(null);
  const state=useRef({boot,game});state.current={boot,game};
  const load=useCallback(async()=>{
    let b=fresh();
    try{const raw=localStorage.getItem(KEY);if(raw){const saved=JSON.parse(raw) as Boot;if(saved?.identity?.id==='local-demo'&&saved.profile?.role==='student'&&Array.isArray(saved.game?.answers))b=saved;}}
    catch{setError('อ่านข้อมูลเดิมไม่ได้ เริ่มเดโมใหม่โดยไม่ส่งข้อมูลออกจากเครื่อง');}
    setBoot(b);setGame(b.game??initialGame());setSyncedAt(b.syncedAt);
  },[]);
  useEffect(()=>{void load()},[load]);
  const save=useCallback(()=>{
    const {boot:b,game:g}=state.current;if(!b?.profile||!g)return;
    try{const now=Date.now();localStorage.setItem(KEY,JSON.stringify({...b,game:g,syncedAt:now}));setSyncedAt(now);setStatus('บันทึกในเครื่อง');}
    catch{setStatus('ยังบันทึกไม่ได้');setError('เบราว์เซอร์ไม่อนุญาตให้บันทึกหรือพื้นที่เต็ม กรุณาดาวน์โหลดสำรองในคู่มือ');}
  },[]);
  useEffect(()=>{save()},[boot?.profile,game,save]);
  useEffect(()=>{window.addEventListener('pagehide',save);return()=>window.removeEventListener('pagehide',save)},[save]);
  const update=useCallback((fn:(g:Game)=>Game)=>setGame(g=>g?fn(g):g),[]);
  async function createProfile(input:{nickname:string;role:'student'|'teacher';grade:string;classCode?:string}){
    const nickname=input.nickname.trim();if(!nickname)throw new Error('กรุณากรอกชื่อเล่น');
    const profile:UserProfile={id:'local-demo',nickname:nickname.slice(0,60),role:'student',grade:input.grade,classroom_id:null,signed:0};
    setBoot(b=>({...b??fresh(),profile}));return profile;
  }
  return {boot,game,setGame,update,error,setError,status,syncedAt,online:true,load,sync:async()=>save(),createProfile,conflict:null,resolveConflict:(_useLocal:boolean)=>{}};
}
