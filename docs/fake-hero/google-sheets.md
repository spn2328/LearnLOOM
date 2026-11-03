# Link learner data to Google Sheets / Excel (for developers)

LearnLOOM is browser-only, so data stays on each device until someone exports or sends it. There are three ways to get it out:

| Who | How | Output |
|---|---|---|
| Learner | My Progress → "ส่งผลการเรียนให้ครู" (send results to the teacher) | `.json` result file |
| Teacher | Teacher page → upload the class's `.json` files → "Excel" | `.xlsx` with summary, per-concept, Checkpoint, XP and VARK sheets |
| Developer / researcher | Settings → "สำหรับผู้พัฒนา" (for developers) → "ดาวน์โหลด .xlsx" (download .xlsx) | `.xlsx` of everything this device saved (including raw localStorage) |
| Developer (optional) | Settings → Google Sheets link | One row per learner in a Google Sheet, updated as they progress |

## Set up the Google Sheet (about 5 minutes)

1. Create a Google Sheet, then open **Extensions → Apps Script**.
2. Replace the code with:

```js
// Upserts one row per device (learner) in the "LearnLOOM" tab. Keeps the full JSON in the last column.
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const row = data.row;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('LearnLOOM') || ss.insertSheet('LearnLOOM');
  const keys = Object.keys(row).concat(['json', 'receivedAt']);
  if (sh.getLastRow() === 0) sh.appendRow(keys);
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  keys.forEach(k => { if (head.indexOf(k) < 0) { head.push(k); sh.getRange(1, head.length).setValue(k); } });
  const values = head.map(k => k === 'json' ? JSON.stringify(data.result) : k === 'receivedAt' ? new Date() : (row[k] ?? ''));
  const col = head.indexOf('device') + 1;
  const ids = sh.getLastRow() > 1 && col ? sh.getRange(2, col, sh.getLastRow() - 1, 1).getValues().map(r => r[0]) : [];
  const at = ids.indexOf(row.device);
  if (at >= 0) sh.getRange(at + 2, 1, 1, values.length).setValues([values]);
  else sh.appendRow(values);
  return ContentService.createTextOutput('ok');
}
```

3. Click **Deploy → New deployment → Web app**. Set *Execute as*: Me, and *Who has access*: Anyone. Copy the URL, which ends in `/exec`.
4. **Every device, automatic (recommended):** in Vercel → Settings → Environment Variables, add `VITE_SHEET_URL` = the `/exec` URL, then Redeploy. Every learner's progress is then sent automatically; learners press nothing and never see the link. Locally, put the same line in `.env.local`.
   **One device only:** open **Settings → สำหรับผู้พัฒนา** (for developers), paste the URL, and press **ส่งตอนนี้** (send now) or turn on **ส่งอัตโนมัติ** (send automatically). A URL saved here overrides the built-in one on that device.
5. To get an Excel file, open the sheet and choose **File → Download → Microsoft Excel (.xlsx)**. Excel can also connect to it live through **Data → From Web** with the sheet published as CSV.

### Notes
- Only nicknames and learning data are sent. Do not ask learners to enter real names.
- The site only accepts `https://script.google.com/macros/s/…/exec`, or `http://localhost…` for testing, so a typo cannot send data somewhere else.
- Google does not return a readable reply to the browser (`no-cors`). Check the sheet to confirm that a row arrived.
- Progress made offline is marked "รอส่ง" (waiting to send) and is sent when the device is back online, while the story page is open.
- One row per browser (`device` is a random id kept in that browser), so learners with the same or no nickname never overwrite each other.
- Row columns: `device, nickname, exportedAt, finished, xp, level, levelName, stars, vark, varkHow, varkUse, cpAnswer, cpReason, cpTotal, C01_outcome, C01_first, C01_route, … C05_route, transfer, json, receivedAt`.
