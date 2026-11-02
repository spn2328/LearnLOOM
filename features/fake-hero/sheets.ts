// Developer data link: export everything saved on this device to Excel, and optionally push each
// learner's summary row to a Google Sheet through an Apps Script web app the developer deploys
// (docs/fake-hero/google-sheets.md). Off until a URL is set; nicknames only, no other personal data.
import {download, xlsx} from "../../lib/export";
import {buildResult, type StudentResult} from "./results";
import {levelOf, xpOf, starsOf} from "./game";

const KEY = "learnloom-dev-sheet-v1";
export type SheetCfg = {url: string; auto: boolean; lastSent?: string; lastError?: string; pending?: boolean; sentXp?: number};

export function readSheet(): SheetCfg {
  try { return {url: "", auto: false, ...JSON.parse(localStorage.getItem(KEY) || "{}")}; } catch { return {url: "", auto: false}; }
}
export function saveSheet(c: SheetCfg) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {} }

// Apps Script web apps or a local test receiver; anything else is refused so data never goes elsewhere by typo
export const validSheetUrl = (u: string) => /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(u) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(u);

export function flatRow(r: StudentResult) {
  const {xp} = xpOf(r), lv = levelOf(xp);
  const row: Record<string, string | number> = {
    nickname: r.nickname, exportedAt: r.exportedAt, finished: r.finished ? "จบ" : "ยังไม่จบ", xp, level: lv.level, levelName: lv.name,
    stars: r.concepts.reduce((n, c) => n + starsOf(c), 0), vark: r.vark?.pref ?? "", varkHow: r.vark?.how ?? "",
    varkUse: Object.entries(r.vark?.use ?? {}).map(([k, n]) => `${k}${n}`).join(" "),
    cpAnswer: r.checkpoint.answerScore, cpReason: r.checkpoint.reasonScore, cpTotal: r.checkpoint.score,
  };
  r.concepts.forEach(c => {
    row[`${c.id}_outcome`] = c.outcome;
    row[`${c.id}_first`] = c.firstMain ? `${c.firstMain}/${c.firstReason ?? "-"}` : "";
    row[`${c.id}_route`] = c.path ? ["Path " + c.path, ...(c.helpSwitches ?? []).map(s => s.to)].join(" → ") : "";
  });
  row.transfer = r.transfer;
  return row;
}

export async function sendToSheet(r: StudentResult = buildResult(), url = readSheet().url) {
  const cfg = readSheet();
  if (!validSheetUrl(url)) throw new Error("ลิงก์ต้องเป็น Apps Script web app (https://script.google.com/macros/s/…/exec)");
  try {
    // text/plain + no-cors = no preflight, which Apps Script cannot answer; the reply is opaque by design
    await fetch(url, {method: "POST", mode: url.startsWith("http://") ? "cors" : "no-cors", headers: {"Content-Type": "text/plain;charset=utf-8"}, body: JSON.stringify({row: flatRow(r), result: r})});
    saveSheet({...cfg, url, lastSent: new Date().toISOString(), lastError: undefined, pending: false, sentXp: xpOf(r).xp});
  } catch (e) {
    saveSheet({...cfg, url, lastError: (e as Error).message, pending: true});
    throw e;
  }
}

// Called by the play layer when progress changes; offline progress waits and is sent once back online.
let lastTry = 0;
export function autoSync(r: StudentResult, changed: boolean) {
  const cfg = readSheet();
  if (!cfg.auto || !validSheetUrl(cfg.url)) return;
  if (!changed && (!cfg.pending || Date.now() - lastTry < 30000)) return; // retry a waiting send at most every 30 s
  lastTry = Date.now();
  if (!navigator.onLine) { if (!cfg.pending) saveSheet({...cfg, pending: true}); return; }
  sendToSheet(r, cfg.url).catch(() => {});
}

// Everything LearnLOOM saved in this browser, as an Excel workbook for developers/researchers.
export function exportDeviceExcel() {
  const r = buildResult(), row = flatRow(r);
  const concepts = [["แนวคิด", "ผลลัพธ์", "ดาว", "ครั้งแรก", "ถูกทั้งคู่ครั้งแรก", "Path", "เปลี่ยนวิธีช่วย", "Recheck", "Recheck-B", "ผ่าน Recheck", "ยืนยันความเข้าใจ"],
    ...r.concepts.map(c => [c.id, c.outcome, starsOf(c), c.firstMain ? `${c.firstMain}/${c.firstReason ?? "-"}` : "", c.firstCorrect ? "ใช่" : "ไม่",
      c.path ?? "", (c.helpSwitches ?? []).map(s => `${s.at}: ${s.from}→${s.to}`).join(", "), c.recheck ?? "", c.recheckB ?? "", c.recheckCorrect ? "ใช่" : "ไม่", c.transfer ?? ""])];
  const xp = [["ที่มา XP", "XP"], ...xpOf(r).parts.map(p => [p.label, p.xp])];
  const raw = [["localStorage key", "ค่า (JSON)"]];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!;
    if (/^(learnloom|ll-)/.test(k)) raw.push([k, (localStorage.getItem(k) ?? "").slice(0, 32000)]);
  }
  const safe = r.nickname.replace(/[\\/:*?"<>|\s]+/g, "_").slice(0, 40);
  download(`LearnLOOM-dev-${safe}-${new Date().toISOString().slice(0, 10)}.xlsx`, xlsx([
    {name: "สรุป", rows: [Object.keys(row), Object.values(row)]},
    {name: "รายแนวคิด", rows: concepts},
    {name: "XP", rows: xp},
    {name: "ข้อมูลดิบ", rows: raw},
  ]));
}
