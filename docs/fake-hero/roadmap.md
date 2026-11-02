# Roadmap — LearnLOOM: The Fake Hero

อัปเดต: 2 พฤศจิกายน 2569 · ใช้คู่กับ `state.md` (สถานะจริง) และ `workflow.md` (วิธีทำงาน)
ที่มาเป้าหมาย: `docs/sources/ข้อมูลเว็บล่าสุด.pdf` (spec) และ `เนื้อเรื่องและคำถามล่าสุด.pdf` (เนื้อหา)

## เป้าหมายโครงการ (สรุปจาก spec)
- เว็บเรียนเคมีอินทรีย์ ม.6 (สสวท. เคมี เล่ม 5) ผ่านซีรีส์สืบสวน **The Fake Hero** — 1 Chapter = 1 ซีรีส์, EP.01–EP.06
- เดโมแรก: **EP.01 "คนในคลิป" เรียนได้ครบทั้งหน่วย (~30 นาที)** และแสดงโครงสร้าง EP ถัดไป
- ฟังก์ชันหลัก 8 อย่าง: Interactive Storytelling · Self-Learning · Johnstone's Triangle · VARK · Adaptive (Bloom's, ตรวจคำตอบ+เหตุผล) · Episode/Transfer Checkpoint · Pause & Resume กับลูม · Learning Dashboard
- ใช้ใน **FutureEd Fest 2026 รอบ Final (Pitching)** — spec กำหนดให้พร้อมและ **ทดลองกับนักเรียนก่อน 4 พ.ย. 2569**
- ระยะยาว: สื่อ Flipped Classroom, ขยาย EP/Chapter อื่น

## สถานะ ณ วันเริ่มแผน
Production (`main` → Vercel) มี EP.01 C01–C05, Checkpoint 10 คะแนน, Chapter Library/Progress/Notebook/Focus Mode, UI ครีม–เขียว + Itim, บันทึกในเบราว์เซอร์
ค้าง: E2E/อุปกรณ์จริง, Adaptive Path A–D ครบ, กิจกรรมโมเลกุล, ภาพ/แอนิเมชัน (PR #6 ค้าง), Dashboard ครู, บัญชี/คลาวด์, EP.02–06

---

## Phase 0 — ตั้งฐานงาน (2 พ.ย.) ✅ ส่วนใหญ่เสร็จ
- [x] ติดตั้ง Git, Node 26, pnpm 11.25.0; clone repo ลงโฟลเดอร์งาน
- [x] `CLAUDE.md`, project skills (`lf-content`, `lf-verify`, `lf-ui-guard`, `lf-ship`), `.claude/launch.json`
- [x] PDF ต้นฉบับใน `docs/sources/` (gitignore) + ไฟล์ text extract สำหรับค้นหา
- [x] Baseline 2 พ.ย.: `pnpm test`, test-fake-hero, `typecheck`, `build:demo` ผ่านบนเครื่องนี้ (Node 26; มีคำเตือน chunk 600kB ตามเดิม)
- [ ] Commit + push branch `chore/claude-workspace` (รอเจ้าของยืนยัน)
**เสร็จเมื่อ:** baseline ผ่าน และ commit โครงสร้างนี้เข้า branch `chore/claude-workspace`

## Phase 1 — พร้อม Pitching (2–3 พ.ย.) 🔥 เร่งด่วน
เป้าหมาย: เว็บ production เล่น EP.01 จบได้ไม่มีทางตัน บนอุปกรณ์ที่ใช้นำเสนอ + มีหลักฐานทดลองกับนักเรียน
1. Smoke test production ด้วย browser (desktop/tablet/mobile): เส้นทางถูก, ผิด, ถูกแต่เหตุผลผิด, refresh/resume, reset — แก้เฉพาะ blocker
2. ตัดสินใจ PR #6 (ภาพ/แอนิเมชัน): merge เฉพาะถ้า verify ผ่าน + ตรวจบน preview แล้ว; ไม่งั้นเลื่อนไป Phase 5
3. ครูตรวจ `checkpointReasons` (เหตุผล CP ที่ร่างใหม่) และถ้อยคำ A02
4. ชุดทดลองกับนักเรียน: ขั้นตอนสั้น, ใช้ชื่อเล่น, วิธีเก็บผล (ภาพ Learning Report หรือปุ่ม export ผล JSON ถ้าต้องเพิ่ม)
5. ปิด PR #1, #2 ที่ถูกแทนที่แล้ว
6. รายการ "ทำได้จริง / ยังเป็นต้นแบบ" สำหรับสไลด์ pitch (ซื่อตรงตาม state.md)
**เสร็จเมื่อ:** เล่นจบบนอุปกรณ์นำเสนอจริง, มีผลทดลอง/ข้อเสนอแนะจากนักเรียนบันทึกใน state.md

## Phase 2 — ปิด QA (Phase 3 เดิม)
1. ติดตั้ง Playwright + `pnpm test:e2e`; โฟลเดอร์ `tests/e2e/`
2. Acceptance cases: S01 ผิด→ลองใหม่, Q01 A+B, Q01 A+A→Path B→RC01 ผ่าน/ไม่ผ่าน, คำตอบอื่น, C02–C05, Checkpoint ≥7/10, Transfer, refresh/resume, reset, ปุ่มกลับ/Focus Mode
3. Viewport desktop/iPad/mobile + ตรวจ a11y เบื้องต้น; เพิ่ม E2E เข้า CI
**เสร็จเมื่อ:** E2E ผ่านใน CI และมีบันทึกทดสอบ iPad จริง 1 ครั้ง

## Phase 3 — ปรับโค้ดให้ดูแลง่าย/ประหยัด token (ไม่เปลี่ยนพฤติกรรม)
1. จัดรูปแบบด้วย Prettier (ไฟล์ตอนนี้บีบเป็นบรรทัดยาวมาก ทำให้ AI ต้องอ่านทั้งก้อน) — branch แยก, E2E ต้องผ่านเหมือนเดิม
2. แยก `FakeHero.tsx` / `EpisodeContinuation.tsx` เป็นคอมโพเนนต์ตามขั้น (Story, Learn, Activity, Question, Adaptive, Checkpoint, Report)
3. ย้าย C01 ที่ hard-code เข้า data แบบเดียวกับ C02–C05; สร้าง `features/fake-hero/flow/` (กติกาเปลี่ยนขั้น) และ `storage/` (schema มีเวอร์ชัน + migrate จาก v1 ไม่ให้ความคืบหน้าผู้ใช้หาย)
4. แยก/ซ่อนเนื้อหา M.1 เดิม (`lib/content.ts`) ที่ยังโผล่ใน Home/My Skills
**เสร็จเมื่อ:** E2E ผ่านทั้งหมด ไม่มีการเปลี่ยนหน้าตา

## Phase 4 — EP.01 ครบตาม spec
1. Adaptive Path A–D สำหรับ R01–R05, Diagnostic D01 ทุกข้อ, RC-B (ตามต้นฉบับ ห้ามแต่งเอง)
2. Learning Memory: บันทึกผลราย Concept + รหัส Misconception
3. Molecular Explorer: ใช้ `components/molecule-viewer.tsx` (Three.js + 2D fallback) ทำกิจกรรมหมุน/จับคู่โครงสร้าง
4. VARK: สลับภาพ/เสียง (speechSynthesis)/อ่าน/ลงมือ; Pause & Break กับลูม (มีระบบเดิมให้ reuse)
5. Transfer Checkpoint ตามเกณฑ์ในเอกสาร
**เสร็จเมื่อ:** ทุกหน้าจอ 1–12 ใน spec ของ EP.01 ทำงาน + E2E ครอบคลุม + ครูตรวจเนื้อหา

## Phase 5 — สื่อภาพและแอนิเมชัน
Storybook ภาพประกอบ/แอนิเมชัน (ต่อจาก PR #6), `public/fake-hero/`, WebP, reduced-motion, cache offline
**เสร็จเมื่อ:** ทุกฉากมีภาพ + fallback, performance ไม่ตก

## Phase 6 — ข้อมูลจริง: บัญชี / Dashboard ครู / Offline
ต้องตัดสินใจ backend ก่อน (ตัวเลือก: โค้ด Cloudflare D1 เดิมใน repo vs บริการฐานข้อมูลที่ต่อกับ Vercel ได้) แล้วทำบัญชีนักเรียน/ครู, ห้องเรียน, Dashboard, export Excel, PWA offline + sync
**เสร็จเมื่อ:** ทดสอบหลายบัญชีบน HTTPS จริง, ไม่มีข้อมูลนักเรียนรั่ว

## Phase 7 — Pilot วิจัย & ขยายซีรีส์
ทดลองในชั้นเรียน (Flipped Classroom), EP.02–EP.06, เกียรติบัตรเมื่อจบซีรีส์

---
หลักการ: ทำทีละ phase, หนึ่ง branch/PR ต่อหนึ่งงานย่อย, "เขียนแล้ว" ≠ "ทดสอบแล้ว"
