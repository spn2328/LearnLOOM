"use client";
// Settings card for developers / researchers: Excel export of this device and the Google Sheets link.
import {useState} from "react";
import {BUILT_IN_SHEET, exportDeviceExcel, readSheet, saveSheet, sendToSheet, validSheetUrl} from "../sheets";

export default function DevPanel() {
  const [cfg, setCfg] = useState(readSheet);
  const [url, setUrl] = useState(cfg.url);
  const [msg, setMsg] = useState("");
  const ok = validSheetUrl(url.trim());
  const update = (c: typeof cfg) => { saveSheet(c); setCfg(c); };
  return <article className="fh-card fh-settings">
    <h2>🛠️ สำหรับผู้พัฒนา / ผู้วิจัย</h2>
    <div className="fh-setting"><span>ส่งออกข้อมูลทั้งหมดในเครื่องนี้เป็น Excel<small>สรุป XP เลเวล สไตล์ VARK เส้นทาง adaptive รายแนวคิด และข้อมูลดิบทุกคีย์</small></span>
      <button className="secondary" onClick={exportDeviceExcel}>⬇️ ดาวน์โหลด .xlsx</button></div>
    <label className="fh-setting gm-dev-url"><span>ลิงก์ Google Sheets (Apps Script)<small>{BUILT_IN_SHEET && url.trim() === BUILT_IN_SHEET ? "เชื่อมกับชีตของเว็บไว้แล้ว ทุกเครื่องส่งอัตโนมัติ ผู้เรียนไม่ต้องกดอะไร" : "วางลิงก์ web app ที่ลงท้ายด้วย /exec ดูวิธีตั้งค่าใน docs/fake-hero/google-sheets.md"}</small></span>
      <input type="url" inputMode="url" value={url} placeholder="https://script.google.com/macros/s/…/exec" onChange={e => setUrl(e.target.value)} aria-invalid={!!url && !ok}/></label>
    {url && !ok && <p className="fh-hint">ลิงก์ต้องเป็น https://script.google.com/macros/s/…/exec (หรือ http://localhost สำหรับทดสอบ)</p>}
    <label className="fh-setting"><span>ส่งอัตโนมัติเมื่อมีความคืบหน้า<small>ถ้าออฟไลน์อยู่ จะรอส่งเมื่อกลับมาออนไลน์</small></span>
      <input type="checkbox" role="switch" className="fh-switch" disabled={!ok} checked={cfg.auto && ok} onChange={e => update({...cfg, url: url.trim(), auto: e.target.checked})}/></label>
    <div className="fh-setting"><span>สถานะ<small>{cfg.lastSent ? `ส่งล่าสุด ${new Date(cfg.lastSent).toLocaleString("th-TH")}` : "ยังไม่เคยส่ง"}{cfg.pending ? " · มีข้อมูลรอส่ง" : ""}{cfg.lastError ? ` · ผิดพลาด: ${cfg.lastError}` : ""}</small></span>
      <button className="secondary" disabled={!ok} onClick={async () => {
        setMsg("กำลังส่ง…");
        try { await sendToSheet(undefined, url.trim()); setMsg("ส่งแล้ว (Google ไม่ตอบกลับผลให้เว็บเห็น ให้เปิดชีตตรวจ)"); }
        catch (e) { setMsg(`ส่งไม่สำเร็จ: ${(e as Error).message}`); }
        setCfg(readSheet());
      }}>📤 ส่งตอนนี้</button></div>
    {msg && <p className="fh-hint" role="status">{msg}</p>}
  </article>;
}
