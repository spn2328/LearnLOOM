// LearnLOOM → Google Sheets: pulls every student's results from Supabase and rewrites the tabs.
// Setup: docs/fake-hero/google-sheets-auto.md. Paste this whole file into Extensions → Apps Script.
// Keys live in Project Settings → Script properties (never in this code):
//   SUPABASE_URL       e.g. https://xxxx.supabase.co
//   SUPABASE_ANON_KEY  the public anon key (same one the website uses)
//   EXPORT_KEY         shown once by supabase/migrations/20261104000000_sheet_export.sql
// Scoring mirrors features/fake-hero/cloud/dashboard.ts so the sheet matches the teacher dashboard.

const EVERY_MINUTES = 10;
const CONCEPTS = ['C01', 'C02', 'C03', 'C04', 'C05'];
const SCORING = {steps: [1, 0.9, 0.8], floor: 0.7, checkpointMax: 10, pass: 0.7};
const ROUTE_LABEL = {both: 'ถูกทั้งคำตอบและเหตุผล', reason: 'คำตอบถูก แต่เหตุผลผิด', answer: 'คำตอบผิด'};
const KIND_LABEL = {
  main: 'คำถามหลัก', reason: 'เหตุผล', diagnosis: 'วินิจฉัย', practice: 'ฝึก', practice_retry: 'ฝึกซ้ำ',
  recheck: 'ตรวจซ้ำ', recheck_b: 'ตรวจซ้ำ B', checkpoint: 'Checkpoint', checkpoint_reason: 'Checkpoint เหตุผล', transfer: 'Transfer',
};

function onOpen() {
  SpreadsheetApp.getUi().createMenu('LearnLOOM')
    .addItem('ดึงข้อมูลตอนนี้', 'syncNow')
    .addItem(`เปิดอัปเดตอัตโนมัติ (ทุก ${EVERY_MINUTES} นาที)`, 'startAutoSync')
    .addItem('หยุดอัปเดตอัตโนมัติ', 'stopAutoSync')
    .addToUi();
}

function startAutoSync() {
  stopAutoSync();
  ScriptApp.newTrigger('syncNow').timeBased().everyMinutes(EVERY_MINUTES).create();
  syncNow();
}

function stopAutoSync() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'syncNow').forEach(t => ScriptApp.deleteTrigger(t));
}

function syncNow() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  try {
    const data = fetchExport_();
    writeTabs_(ss, data);
    writeStatus_(ss, 'สำเร็จ', data);
  } catch (err) {
    writeStatus_(ss, 'ไม่สำเร็จ: ' + err.message, null);
    throw err;
  }
}

function fetchExport_() {
  const p = PropertiesService.getScriptProperties();
  const url = (p.getProperty('SUPABASE_URL') || '').replace(/\/+$/, '');
  const anon = p.getProperty('SUPABASE_ANON_KEY');
  const key = p.getProperty('EXPORT_KEY');
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url) || !anon || !key) {
    throw new Error('ยังตั้ง Script properties ไม่ครบ (SUPABASE_URL, SUPABASE_ANON_KEY, EXPORT_KEY)');
  }
  const res = UrlFetchApp.fetch(url + '/rest/v1/rpc/sheet_export', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: {apikey: anon, Authorization: 'Bearer ' + anon},
    payload: JSON.stringify({token: key}),
  });
  const code = res.getResponseCode();
  if (code !== 200) {
    const text = res.getContentText();
    throw new Error(/invalid export key/.test(text) ? 'EXPORT_KEY ไม่ถูกต้อง (หรือรัน SQL ใหม่แล้วแต่ยังไม่ได้เปลี่ยนคีย์)'
      : /sheet_export/.test(text) && code === 404 ? 'ยังไม่ได้รัน SQL sheet_export ใน Supabase'
      : `Supabase ตอบกลับ ${code}: ${text.slice(0, 200)}`);
  }
  return JSON.parse(res.getContentText());
}

// Same rules as summarizeAttempt / summarizeStudent in dashboard.ts.
function weight_(n) { return SCORING.steps[n - 1] ?? SCORING.floor; }
function summarizeAttempt_(a, concepts, events) {
  const mine = events.filter(e => e.attempt_id === a.id);
  const cs = concepts.filter(c => c.attempt_id === a.id).sort((x, y) => x.concept.localeCompare(y.concept));
  const cp = {};
  for (const e of mine) {
    if (e.kind === 'checkpoint') (cp[e.item_id] = cp[e.item_id] || {}).answer = e;
    if (e.kind === 'checkpoint_reason') (cp[e.item_id.replace(/-E$/, '')] = cp[e.item_id.replace(/-E$/, '')] || {}).reason = e;
  }
  const items = Object.values(cp);
  const answered = items.filter(x => x.answer).length;
  const score = items.reduce((s, x) => s + (x.answer && x.answer.correct ? 1 : 0) + (x.reason && x.reason.correct ? 1 : 0), 0);
  const progress = a.finished_at ? 100 : Math.round((Math.min(cs.length, 5) + Math.min(answered, 5)) / 10 * 100);
  return {a, cs, answered, score, weighted: Math.round(score * weight_(a.number) * 10) / 10, progress};
}
function statusOf_(latest) {
  if (!latest) return {status: 'ยังไม่เริ่ม', review: []};
  const review = latest.cs.filter(c => c.outcome === 'ยังต้องทบทวน').map(c => c.concept);
  const status = review.length || (latest.a.finished_at && latest.score < SCORING.pass * SCORING.checkpointMax) ? 'ต้องติดตาม'
    : latest.a.finished_at ? 'เรียนจบ' : 'กำลังเรียน';
  return {status, review};
}

function writeTabs_(ss, d) {
  const who = {};
  d.students.forEach(s => { who[s.id] = s; });
  const byStudent = {};
  d.attempts.slice().sort((x, y) => x.number - y.number).forEach(a => {
    (byStudent[a.user_id] = byStudent[a.user_id] || []).push(summarizeAttempt_(a, d.concepts, d.events));
  });
  const cpText = x => x && x.answered ? `${x.score}/${SCORING.checkpointMax}` : '-';
  const outcomeOf = (x, c) => { const r = x && x.cs.find(k => k.concept === c); return r ? r.outcome : '-'; };

  const summary = d.students.map(s => {
    const list = byStudent[s.id] || [];
    const first = list[0], latest = list[list.length - 1];
    const st = statusOf_(latest);
    return [s.classroom, s.nickname, st.status, list.length, cpText(first), cpText(latest),
      latest && latest.answered ? latest.weighted : '-', latest ? latest.progress : 0, st.review.join(', ') || '-']
      .concat(CONCEPTS.map(c => outcomeOf(latest, c)), [latest ? date_(latest.a.finished_at || latest.a.started_at) : '-']);
  });
  writeTab_(ss, 'สรุปรายคน', ['ห้อง', 'ชื่อเล่น', 'สถานะ', 'จำนวนครั้งที่ทำ', 'Checkpoint ครั้งแรก', 'Checkpoint ล่าสุด',
    'คะแนนที่นับ (ล่าสุด)', 'ความคืบหน้าล่าสุด (%)', 'แนวคิดที่ต้องทบทวน'].concat(CONCEPTS.map(c => `${c} (ล่าสุด)`), ['อัปเดตล่าสุด']), summary);

  const attempts = [];
  d.students.forEach(s => (byStudent[s.id] || []).forEach(x => attempts.push(
    [s.classroom, s.nickname, x.a.episode, x.a.number + (x.a.number === 1 ? ' (ครั้งแรก)' : ''), date_(x.a.started_at), date_(x.a.finished_at),
      x.progress, cpText(x), Math.round(weight_(x.a.number) * 100) + '%', x.answered ? x.weighted : '-'].concat(CONCEPTS.map(c => outcomeOf(x, c))))));
  writeTab_(ss, 'รายครั้ง', ['ห้อง', 'ชื่อเล่น', 'ตอน', 'ครั้งที่', 'เริ่ม', 'จบ', 'ความคืบหน้า (%)', 'Checkpoint',
    'น้ำหนักครั้งที่ทำ', 'คะแนนที่นับ'].concat(CONCEPTS), attempts);

  const num = {};
  d.attempts.forEach(a => { num[a.id] = a; });
  const conceptRows = d.concepts.filter(r => who[r.user_id] && num[r.attempt_id]).map(r => {
    const s = who[r.user_id], det = r.detail || {};
    return [s.classroom, s.nickname, num[r.attempt_id].number, r.concept, r.outcome, r.path || '-',
      det.firstCorrect === true ? 'ถูก' : det.firstCorrect === false ? 'ไม่ถูก' : '-',
      det.assisted ? 'ใช่' : '-', ROUTE_LABEL[det.route] || '-', det.routeReason || '-', date_(r.updated_at)];
  }).sort(byNames_);
  writeTab_(ss, 'ผลรายแนวคิด', ['ห้อง', 'ชื่อเล่น', 'ครั้งที่', 'แนวคิด', 'ผล', 'เส้นทาง', 'ครั้งแรกถูก', 'ได้รับความช่วยเหลือ',
    'เส้นทางหลังตอบครั้งแรก', 'เหตุผลของเส้นทาง', 'อัปเดต'], conceptRows);

  const eventRows = d.events.filter(e => who[e.user_id] && num[e.attempt_id]).map(e => {
    const s = who[e.user_id];
    return [s.classroom, s.nickname, num[e.attempt_id].number, e.concept || '-', e.item_id, KIND_LABEL[e.kind] || e.kind, e.value,
      e.correct === true ? 'ถูก' : e.correct === false ? 'ไม่ถูก' : '-', date_(e.recorded_at)];
  });
  writeTab_(ss, 'คำตอบทั้งหมด', ['ห้อง', 'ชื่อเล่น', 'ครั้งที่', 'แนวคิด', 'ข้อ', 'ประเภท', 'คำตอบ', 'ถูก/ไม่ถูก', 'เวลาที่ตอบ'], eventRows);
}

function byNames_(x, y) { return String(x[0]).localeCompare(String(y[0])) || String(x[1]).localeCompare(String(y[1])) || (x[2] - y[2]); }
function date_(iso) { return iso ? new Date(iso) : ''; }
// Student text starting with = + - @ would otherwise run as a formula in the sheet.
function safe_(v) { return typeof v === 'string' && /^[=+\-@]./.test(v) ? "'" + v : v; }

function writeTab_(ss, name, head, rows) {
  const sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clearContents();
  const values = [head].concat(rows.map(r => r.map(safe_)));
  sh.getRange(1, 1, values.length, head.length).setValues(values);
  sh.getRange(1, 1, 1, head.length).setFontWeight('bold');
  sh.setFrozenRows(1);
}

function writeStatus_(ss, result, d) {
  const sh = ss.getSheetByName('สถานะ') || ss.insertSheet('สถานะ');
  sh.clearContents();
  const auto = ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'syncNow');
  const rows = [
    ['ดึงข้อมูลล่าสุด', new Date()],
    ['ผล', result],
    ['อัปเดตอัตโนมัติ', auto ? `เปิด (ทุก ${EVERY_MINUTES} นาที)` : 'ปิด'],
  ];
  if (d) rows.push(['นักเรียน', d.students.length], ['ครั้งที่ทำ', d.attempts.length], ['คำตอบ', d.events.length]);
  sh.getRange(1, 1, rows.length, 2).setValues(rows);
}
