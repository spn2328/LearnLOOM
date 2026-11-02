# สถานะ LearnLOOM — The Fake Hero

อัปเดต: 1 พฤศจิกายน 2569
Branch พัฒนา: `feat/fake-hero-interactive-demo`
Pull Request (Draft): https://github.com/spn2328/LearnLOOM/pull/2
ฐานแผน: `docs/fake-hero-demo-plan` — **PR #3 merge เข้า main แล้ว; ดู Production update ด้านล่าง**

## Phase ปัจจุบัน

**Phase 2 — สร้างเดโม: โค้ดรอบแรกและ Build Vercel ผ่านแล้ว; พร้อมทดสอบการเล่น**
**Phase 3 — ตรวจคุณภาพ: CI ผ่าน install/source checks/typecheck/build:demo; ยังไม่ได้ตรวจ interaction/browser/iPad จริง**
Phase 4/5: **พักไว้ตามคำขอ**

| Phase | รายละเอียด | สถานะ |
| --- | --- | --- |
| 0 | กำหนดขอบเขตเดโม Scene 01–03, C01 และยืนยันชื่อเจฟ | เสร็จ |
| 1 | วาง flow และเลือกข้อความจาก PDF ต้นฉบับ | เสร็จระดับแผน; รอตรวจเทียบถ้อยคำ A02 สมุดหลักฐาน |
| 2 | สร้างหน้าและระบบตอบโต้, branching, localStorage | Build เดโมผ่านใน GitHub Actions; รอทดสอบ interaction |
| 3 | Test, TypeScript, demo build, browser/iPad | CI ผ่าน; ค้างทดสอบ browser/iPad |
| 4 | Pilot กับผู้เรียน | พัก |
| 5 | Deploy/ขยายผล | พัก |

## สิ่งที่ทำจริงแล้ว
- อ่าน `docs/fake-hero/{README,plan,demo-flow,folder-structure,workflow,state}.md` และต้นฉบับ `เนื้อเรื่องและคำถามล่าสุด.pdf` หน้า 2–7
- ใช้ชื่อ **เจฟ** และสงวนคำถาม/ตัวเลือก/เฉลยจากต้นฉบับตามคำยืนยัน
- เพิ่มฟีเจอร์แยกจากเว็บเดิม เปิดด้วย query `?fake-hero` ผ่าน `demo/main.tsx`
- ลงโค้ด Scene 01–03, A01/S01, คำให้การ, Evidence Notebook, L01, A03, Q01/Q01-E, Path B, RC01, สรุปผล
- มีปุ่มตรวจหลักฐาน 3 จุด, เลือกประเภทสาร, ตรวจคำตอบพร้อมเหตุผล, บทช่วย, สรุปผลครั้งแรกเทียบหลังช่วย
- บันทึกความคืบหน้าในเบราว์เซอร์แบบแยกจากเดโมเดิม (`learnloom-fake-hero-v1`)
- **จัดระเบียบไฟล์บน GitHub**: ย้าย component ไป `features/fake-hero/components/FakeHero.tsx`, styles ไป `features/fake-hero/styles/fake-hero.css`; อัปเดต import ใน `demo/main.tsx`; ลบไฟล์เก่าที่ซ้ำซ้อนหลังสร้างไฟล์ใหม่; เพิ่ม `features/fake-hero/README.md`
- มี Draft PR #2 สำหรับตรวจโค้ด; **ไม่ได้เปลี่ยน default app / main / deployment**

## โครงสร้างล่าสุดที่เกี่ยวข้อง
```text
docs/fake-hero/
  README.md
  plan.md
  state.md
  demo-flow.md
  folder-structure.md
  workflow.md
features/fake-hero/
  README.md
  components/FakeHero.tsx
  styles/fake-hero.css
demo/
  main.tsx          # เลือก FakeHero เมื่อ URL มี ?fake-hero
```

## สิ่งที่ยังไม่ได้ทำและข้อจำกัด
- **GitHub Actions รันผ่านทุกขั้นหลักแล้ว**: `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm typecheck`, `pnpm build:demo` (run #2, 41315982560, workflow completed / success). เครื่อง container ภายในแชตยัง clone GitHub ไม่ได้เนื่องจาก DNS; ใช้ผล CI เป็นหลักฐานแทน
- Vercel ระบุ preview commit `39e57417` สถานะ `READY` ที่ `https://learnloom-mwfr1drym-manifest23.vercel.app/?fake-hero`; ยังไม่มีผล browser interaction / iPad test ที่ยืนยัน
- ภาพ/วิดีโอ/แอนิเมชัน/3D/ลากบัตรยังไม่ใส่ตามคำสั่ง ใช้ข้อความและปุ่มแทน
- A02 สมุดหลักฐานย่อความจากต้นฉบับ ไม่ใช่ทุกประโยคจาก PDF; ต้องตรวจอีกครั้งก่อนอนุมัติ
- ระบบผิดหลายประเภทใช้การช่วยเหลือทั่วไป; ยังไม่พัฒนา Path A/C/D แบบเต็ม
- RC01 เป็นการตรวจการจำแนกหลังช่วย ไม่ใช่หลักฐาน Transfer Checkpoint หรือการผ่าน EP.01 ทั้งหน่วย
- ไม่มี backend, sign-in, cloud sync หรือข้อมูลผู้เรียนจริง

## งานถัดไป (ลำดับความสำคัญ)
1. รัน `pnpm install --frozen-lockfile && pnpm test && pnpm typecheck && pnpm build:demo` และแก้ปัญหาที่พบ
2. ทดสอบด้วยเบราว์เซอร์ที่ URL `/?fake-hero`; ครบทางถูก/ผิด, refresh, reset และหน้าจอสัมผัส
3. ตรวจถ้อยคำ/เคมี/บทสนทนาใน A02 กับ PDF ต้นฉบับ พร้อมผู้ดูแลเนื้อหา
4. รวบรวมผลทดสอบไว้ในไฟล์นี้ก่อนเปลี่ยน Draft PR เป็น Ready for Review
5. คง Phase 4/5 และการ deploy ไว้จนมีคำขอใหม่

## หลักเกณฑ์รายงานสถานะ
สถานะ `เขียนโค้ดแล้ว` ไม่เท่ากับ `ทดสอบผ่าน`. อย่าระบุว่ารันเว็บหรือใช้งานจริงผ่าน จนมีผลตรวจรองรับ

## ผลตรวจ CI และ Preview (1 พฤศจิกายน 2569)
- GitHub Actions: [Fake Hero demo checks run #2](https://github.com/spn2328/LearnLOOM/actions/runs/41315982560). workflow **completed / success**: install, source checks, TypeScript checks และ demo build ผ่านทั้งหมด
- Vercel preview: https://learnloom-mwfr1drym-manifest23.vercel.app/?fake-hero — deployment READY สำหรับ commit `39e57417f8e2376af452a97418fa4c491bfe0f18`
- ตรรกะ interaction, accessibility, device test และความถูกต้องของภาพยังไม่ได้ตรวจผ่าน browser จริง จึงยังไม่ปิด Phase 3

## เทียบ PDF ใหม่กับเว็บไซต์เดิม (1 พฤศจิกายน 2569)

PDF อ้างอิงจากผู้ใช้: `เนื้อเรื่องและคำถามล่าสุด(1).pdf` (26 หน้า) และ `ข้อมูลเว็บล่าสุด(1).pdf` (19 หน้า)

### สาเหตุที่ production แสดงเรื่องเดิม
- `main/demo/main.tsx` เดิม import และ render `components/learnloom-app.tsx` (บทเรียนเดิม ม.1) เสมอ
- The Fake Hero สร้างแยกใน `feat/fake-hero-interactive-demo` และเดิมต้องใช้ `?fake-hero`; ไม่ได้ merge เข้า `main`
- ปรับใน branch นี้แล้ว: เส้นทางปกติแสดง The Fake Hero; ระบบเดิมยังเปิดได้ผ่าน `?legacy` เพื่อย้อนตรวจ/เปรียบเทียบ
- PR ไป `main`: https://github.com/spn2328/LearnLOOM/pull/3

### Scope gap ตาม PDF ใหม่
| ประเด็นใน PDF | เว็บไซต์ใหม่ใน branch นี้ | งานที่เหลือ |
|---|---|---|
| เป้าหมาย ม.6 เคมีอินทรีย์ / The Fake Hero | ตั้งชื่อและ C01 | สร้างเนื้อหา C02–C05 |
| Scene 01–03, A01–A03, Q01/E | มีแบบ text-first | เพิ่มภาพ/สื่อภายหลัง และตรวจ A02 ให้ตรงต้นฉบับ |
| R01 adaptive | Path B และ general feedback | Path A/C/D, D01 ทุกข้อ, RC01-B |
| Scene 04–09 / Q02–Q05 | ยังไม่มี | พัฒนาตามลำดับต้นฉบับ ห้ามแก้ข้อความโดยพลการ |
| Episode Checkpoint / Transfer | ยังไม่มี | ใช้ข้อที่ไม่ซ้ำกับข้อฝึกและเก็บผลครั้งแรก |
| Online/offline, Dashboard, PWA, Certificates | ยังไม่รองรับในฟีเจอร์ใหม่ | แยกเป็นงานระยะต่อไป ไม่กล่าวอ้างว่าใช้งานแล้ว |

**ประเด็นขัดแย้งใน PDF**: `ข้อมูลเว็บล่าสุด(1).pdf` หน้า 4 มีชื่อ 'เต' แต่ `เนื้อเรื่องและคำถามล่าสุด(1).pdf` หน้า 2–3 ใช้ 'เจฟ'; เจ้าของยืนยัน 'เจฟ' จึงใช้ชื่อนี้ในหน้าเว็บ. เอกสารแผนใหม่ต้องการ EP.01 ทั้งตอน แต่แผน `docs/fake-hero/plan.md` เดิมเป็นเพียง excerpt; สถานะการพัฒนาจะยึดความจริงว่า excerpt พร้อมก่อน ไม่อ้างว่าทำครบ EP.01

**ข้อควรจำ**: การ merge ไป main จึงจะกระทบ URL production. การสร้าง Vercel preview ใน feature branch เพียงอย่างเดียวไม่เปลี่ยน `learnloom-murex.vercel.app`.

## Production update — 1 พฤศจิกายน 2569
- PR #3 merged into `main` by squash commit `ae08f0f54cf0dad27693626e02938420c5433ba3`.
- ค่าเริ่มต้นของ `demo/main.tsx` แสดง The Fake Hero (เคมีอินทรีย์ ม.6, **เฉพาะ Scene 01–03/C01 เท่านั้น**) แทนเรื่องเก่า; เว็บไซต์เดิมยังเข้าด้วย `?legacy`.
- Vercel production build for commit above triggered automatically; ตรวจสถานะ deployment ก่อนอ้างว่า URL สาธารณะเปลี่ยนแล้ว.
- **ยังไม่ครบเป้าหมาย PDF ใหม่:** EP.01 C02–C05, Scene 04–09, Q02–Q05, Adaptive R02–R05, Episode/Transfer Checkpoint และ Dashboard จำเป็นต้องพัฒนาต่อ. Phase 4/5 ยังคงพักไว้.
- PDF ฉบับล่าสุดเป็น source of truth สำหรับเนื้อเรื่อง/คำถาม; ภาพและแอนิเมชันทำภายหลังตามคำขอ.

## งานขยาย EP.01 — 1 พฤศจิกายน 2569 (Phase 2 → Phase 3)
- Branch: `feat/fake-hero-complete-ep01`; Draft PR #4: https://github.com/spn2328/LearnLOOM/pull/4
- **ข้อกำหนด UI ล่าสุด:** เจ้าของสั่งรักษาหน้าตาเว็บเดิมทั้งหมด เปลี่ยนเฉพาะบทเรียนและเนื้อหา — ไม่มีการแก้ `features/fake-hero/styles/fake-hero.css` ใน branch นี้
- เพิ่ม `features/fake-hero/content/episode01.ts`: เนื้อหา C01–C05, Q01–Q05, Q01-E–Q05-E, กิจกรรมข้อความและชุดคำถามตัวอย่างจากต้นฉบับ
- เพิ่ม `components/EpisodeContinuation.tsx`: Scene 04–09, S02, Recheck, Episode Checkpoint, Transfer แบบอธิบาย และ Learning Report; เชื่อมต่อจาก `FakeHero.tsx` ที่ C01 เดิม
- เพิ่ม `docs/fake-hero/PROMPTS.md`: ตัวอย่าง prompt ปรับเนื้อหา UI เฉพาะจุด แอนิเมชัน และฟังก์ชัน โดยห้ามเปลี่ยน UI เดิมหากไม่ได้รับคำสั่ง
- ปรับ GitHub Actions ให้ทดสอบ branch นี้ / PR to main

### ข้อจำกัดที่ต้องตรวจแก้ก่อนปิด Phase 3
1. Adaptive ในส่วน C02–C05 ยังเป็นการช่วยเหลือแบบสั้น ไม่ใช่ Path A–D และ Diagnostic ทั้งหมดใน PDF
2. กิจกรรม C02–C05 ยังเป็นการตอบคำถามแทนการหมุน/ประกอบโมเลกุล; สื่อภาพและแอนิเมชันคงเว้นไว้
3. Episode Checkpoint ตอนนี้มี 5 ข้อเลือกตอบและให้คะแนนแบบ 5 ข้อ ยังไม่ใช่คะแนนเต็ม 10 (คำตอบและเหตุผล) ที่เอกสารต้องการ
4. Transfer เป็นคำตอบอิสระสำหรับครูตรวจ ไม่ใช่ระบบตรวจอัตโนมัติ
5. ต้องตรวจด้วยเบราว์เซอร์จริงบน Desktop / iPad / mobile รวมทั้ง back/refresh, C01 ออกจากบทช่วย, ทุกเส้นทาง และความตรงของบทสนทนา
6. ห้ามอ้างว่าผ่านการทดสอบกับนักเรียนจริง / ซิงก์ cloud / offline / dashboard จนกว่าจะมีหลักฐาน

### Phase 3 — ผลตรวจเทคนิคล่าสุด
- GitHub Actions run #21 https://github.com/spn2328/LearnLOOM/actions/runs/41317476676 **completed / success** สำหรับ commit `c213f153b59fe41a32a7685f1341fc855ba30b30`: install, source checks, verify EP01 question-bank, TypeScript, Vite demo build ผ่าน
- Vercel preview `https://learnloom-ec1uw70t2-manifest23.vercel.app/` สถานะ **READY** สำหรับ commit เดียวกัน
- ตรวจรักษาหน้าตาเดิมด้วยการ **ไม่แก้ CSS** ของเว็บไซต์ใน branch นี้
- **ยังไม่ปิด Phase 3 แบบการใช้งานจริง**: ไม่มีผล browser automated end-to-end / physical iPad/phone และไม่มีผลทดลองโดยเจ้าของ; ต้องทดสอบการเล่นตาม acceptance cases ก่อน merge main
- สถานะ PR #4 เป็น draft สำหรับลองเล่นและตรวจข้อเสนอแนะ; production `learnloom-murex.vercel.app` ยังไม่เปลี่ยนเป็น EP01 ฉบับขยาย

### UI clarification / original screenshot (1 November 2026)
User clarified the appearance to preserve is the **original cream-and-green dashboard** screenshot: LearnLOOM logo, left sidebar, top bar, welcoming home hero with red panda Loom, course cards and My Skills. The prior dark Fake Hero standalone page was **not** the desired UI.
- Changed `demo/main.tsx` to show the original `LearnloomApp` shell by default. Standalone preview only at `?standalone`.
- Updated `components/learnloom-app.tsx` home copy to M.6 organic chemistry / The Fake Hero and added the `fakehero` view to open the episode **inside the original layout**.
- Updated only Fake Hero feature styling to blend with existing cream/green dashboard; did not redesign core `app/globals.css` or sidebar/navigation layout.
- Note: legacy pages 'My Skills', older courses and history still depend on earlier curriculum data and require content migration later. Original banner image is retained unchanged as requested; no new image/animation assets.
- Phase 3 requires checking that login, dashboard and all episode stages display consistently in Vercel preview on desktop/tablet/mobile.

### Readability follow-up — Screenshot feedback
- ผู้ใช้ยืนยันว่าชอบ layout/ธีมครีม–เขียวเดิม และต้องการแก้เฉพาะข้อความที่อ่านยากกับฟอนต์
- ปรับ `features/fake-hero/styles/fake-hero.css` เฉพาะฟีเจอร์: จัดลำดับ `Noto Sans Thai` ให้แสดงจริงก่อน system font, เพิ่มความชัดของตัวอักษร/น้ำหนัก, เปลี่ยนบัตร A03 จากพื้นเขียวเข้มตัวหนังสือเข้มเป็นพื้นเขียวอ่อนตัวหนังสือเข้ม และคงปุ่ม/เลย์เอาต์/สีหลักเดิม
- ไม่แก้ `app/globals.css` และไม่เปลี่ยน assets/fonts; รอ CI และตรวจภาพหน้าเว็บจริง

### Phase 3 follow-up — Itim + 10-point checkpoint
- เปลี่ยนฟอนต์หน้า Demo และบทเรียนเป็น **Itim** ผ่าน Google Fonts โดยใช้ Noto Sans Thai เป็น fallback; ยังคง layout สีและเมนูเดิมตามคำขอ; ไม่แนบหรือแจกจ่ายไฟล์ฟอนต์
- ปรับ `demo/index.html`, `app/globals.css`, `features/fake-hero/styles/fake-hero.css`; ฟอนต์สูตรเคมีและเครื่องหมายคง fallback ที่อ่านง่าย
- เพิ่ม `checkpointReasons` ใน `features/fake-hero/content/episode01.ts`: เหตุผลประกอบใหม่ห้าข้อ (ร่างใหม่ ไม่ใช่ตัวเลือกคำถามหลักจาก PDF) เพื่อเก็บคะแนนแยกคำตอบและเหตุผล
- `EpisodeContinuation.tsx` ให้คะแนน Checkpoint จากคำตอบ 5 + เหตุผล 5 = เต็ม 10 คะแนน เกณฑ์คะแนนรวม >=7/10 โดยไม่เปลี่ยนคำตอบหรือเหตุผลของ Main Questions Q01–Q05 และไม่ใช้การฝึกหลังช่วยมาทับการตอบครั้งแรก
- เพิ่มการตรวจเฉลย CP-E ใน `scripts/test-fake-hero.mjs`
- ข้อจำกัด: คะแนนตามแนวคิดและเหตุผลใน CP ใหม่ต้องได้รับการตรวจความตรงตามเนื้อหาจากผู้สอน; ยังไม่ได้ทดลองกับผู้เรียน, ยังไม่มี Automated browser E2E หรือ iPad test จึง **ไม่ประกาศ Phase 3 เสร็จ**

### Production release — 1 November 2026
- เจ้าของอนุญาตให้ merge PR #4 เข้าสู่เว็บไซต์หลักโดยตรง
- Pull Request: https://github.com/spn2328/LearnLOOM/pull/4 — merged to `main`, squash commit `45a227a47801488be1a759615e3a218fc7c4ac74`
- Vercel production deployment commit เดียวกัน `READY`: `dpl_98cguS9cc1xRWRjb1Tq8uNYGp8wL`, URL production ที่กำหนด `https://learnloom-murex.vercel.app/`
- รายการ: UI เดิมครีม–เขียว, font Itim และ fallback, The Fake Hero EP.01 C01–C05, Checkpoint 10 คะแนนคำตอบ+เหตุผล, บันทึกความคืบหน้าแบบ local
- ข้อจำกัดยังคงเดิม: ยังไม่มีผล automated browser E2E หรือทดลองบน iPad/โทรศัพท์จริง; Adaptive Path A–D ยังไม่ครบ; ข้อเหตุผล CP เพิ่มเติมยังต้องผู้สอนตรวจ; สื่อภาพและแอนิเมชันยังไม่ได้ทำ; ไม่อ้างว่าจบ Phase 3 ครบทุกเกณฑ์

### Phase 2 / 3 — UI/UX workflow navigation update
- User requests full workflow from original cream-and-green LearnLOOM dashboard, retaining visual identity and Itim font. Reference: Notion-style sidebar, Goodnotes-inspired notebook, YPT-inspired personal progress, Duolingo-style Chapter/Episode sequence, Focus Mode.
- Branch `feat/fake-hero-navigation-focus`; PR #5 https://github.com/spn2328/LearnLOOM/pull/5
- Added `features/fake-hero/components/LearningHub.tsx`: Chapter 01 / The Fake Hero, EP.01–EP.06 (future episodes clearly locked); personal progress based on locally stored C01–C05 attempts; evidence and concept notes; certificate page clearly disabled until series completion.
- Updated `components/learnloom-app.tsx` to route original sidebar navigation: `courses`, `skills`, `notebook`, `certificates`. Existing Home design retained. Entering `fakehero` shows a Focus Mode toolbar with return home and open notebook buttons.
- Updated `app/globals.css` with narrowly scoped episode cards and focus-mode rules, retaining palette and typography.
- This is an interactive prototype, not a functioning cloud notebook or actual series-wide certification; unfinished EP.02–EP.06 remain locked. Progress remains browser-local.
- Need confirm CI and browser/iPad manual tests; not considered Phase 3 finished until interactions verified. Do not automatically merge before verification.

### Production UI/UX navigation release — 1 พฤศจิกายน 2569
- User requested implementation of the 7-part plan's UI/UX section, keeping original cream/green LearnLOOM dashboard and Itim.
- PR #5 merged into `main`: https://github.com/spn2328/LearnLOOM/pull/5, merge commit `e34c693a6272058881560c4e9505811ee2b80913`.
- Vercel Production deployment for merge commit: `READY` (https://learnloom-murex.vercel.app/).
- Implemented functional Chapter Library (EP.01 active and EP.02–06 marked unavailable), My Progress based on browser-local EP01 record, Notes/Case Notebook, honest Certificate status page, and Focus Mode with return-home and notebook controls.
- Original sidebar dashboard, color palette, logo and Itim font maintained. Added scoped CSS for episode cards and focus.
- GitHub Actions run #55 passed source checks, question bank, TypeScript and demo build: https://github.com/spn2328/LearnLOOM/actions/runs/41326193738.
- Important limitations: My Progress and Notes are demo views using browser-local storage; no cloud sync, live teacher dashboard or certificate issuance. EP.02–EP.06 remain unavailable; old Home recommendation panels may still refer to preexisting chemistry concept data. No confirmed physical iPad/mobile browser E2E test, so Phase 3 remains open.

### EP.01 Story images and animation — 1 November 2026
- Received 10 illustrated PNG scenes and 2 videos from owner; inspected media and aligned by narrative: opening clip → เจฟ/คำให้การ/ข้อความแม่ → อ่านข้อมูลเคมี → หลักฐานแม่น้ำ → เฮียศักดิ์และถังน้ำยาท้าย EP01.
- Added `features/fake-hero/components/StoryMedia.tsx`, wired Scene 01–03 in `FakeHero.tsx`, Scene 08–09 in `EpisodeContinuation.tsx`; responsive story-media CSS in existing design palette.
- **Binary assets not yet in GitHub:** packed optimized WebP/H.264 files in separate user download `LearnLOOM_FakeHero_Media_For_GitHub.zip`. Read `docs/fake-hero/MEDIA.md` for exact path and upload instructions. React currently shows fallback if missing; do not claim assets uploaded or visible in Production.
- Testing needed: upload asset files, check scene order, verify first video and river clip play, mobile performance, Thai captions, accessible controls. Until done Phase 3 is still in progress. No merge main in this change.

- GitHub Actions run #56: CI checks (source, EP01 question bank, TypeScript, demo build) succeeded: https://github.com/spn2328/LearnLOOM/actions/runs/41328891941. This verifies the code only; image/video playback still awaits binary upload.

### พร้อมทดลองเล่น: ระบบสื่อ + ส่งผลให้ครู — 2 พฤศจิกายน 2569 (branch `feat/playtest-ready`)
- ระบบสื่อใหม่: วางไฟล์ใน `media/` ตั้งชื่อตามรหัสตำแหน่ง (`ep01-s01.mp4`, `ep01-s08-2.webp`, `.loop.` = วนเล่นเอง) → ขึ้นหน้าเว็บเอง; ดู `media/README.md`; `?slots` แสดงตำแหน่งว่าง; ลบ `StoryMedia.tsx`
- นักเรียน: ปุ่ม **ส่งผลให้ครู** (หน้าสรุป EP.01 และหน้าความก้าวหน้า) → ไฟล์ .json (ชื่อเล่น, คำตอบ/เหตุผลครั้งแรก C01–C05, บทช่วย, recheck, CP /10, Transfer)
- ครู: แท็บ "สำหรับครู" เปิดได้โดยไม่ต้องล็อกอิน → พื้นที่ครู นำเข้าไฟล์หลายไฟล์, ตาราง, แนวคิดที่ควรทบทวน, ส่งออก Excel 3 แผ่น
- ซ่อนแชทห้องเรียน/ล็อกอิน/รหัสห้อง (ต้องใช้ server); ลบคำว่า "เดโม" ใน UI; ระดับชั้นเป็น ม.4–ม.6; ไฟล์สำรองรวมความคืบหน้า Fake Hero แล้ว
- ตรวจแล้ว: test, test-fake-hero, typecheck, build:demo ผ่าน; เล่นใน browser (localhost) ส่งผล→นำเข้า→Excel ทำงาน, สื่อ png/loop mp4 แสดงได้
- ยังไม่ได้ตรวจ: iPad/มือถือจริง, เปิดไฟล์ Excel ใน Excel จริง, ไฟล์สื่อจริงยังไม่ได้ตั้งชื่อ/ใส่
### ปรับตาม แก้ไข.pdf — 2 พฤศจิกายน 2569 (branch `feat/playtest-ready`)
- S01: ตอบผิดมี pop-up เตือน · L01: infographic (การ์ดสารอินทรีย์ + โมเลกุล 3D/2D + แท็บ, ข้อยกเว้น CO₂/Na₂CO₃, ตารางเปรียบเทียบ, เชื่อมคดี) · A03: ลากการ์ดลงกล่องเขียว/ส้ม + pop-up วางผิด
- รวม Q01+Q01-E, Q02+Q02-E … เป็นหน้าเดียว (คำตอบ+เหตุผล) มีปุ่ม "ต้องการความช่วยเหลือหรือไม่?" · หน้าสรุปทุกแนวคิดเป็นการ์ด dashboard
- C02 การ์ดพันธะ+3D · C03 แท็บโซ่ตรง/โซ่กิ่ง/วง · C04/C05 รูปแบบเดียวกัน · Q03 ลากป้ายชื่อโซ่ · Q03-E แสดงโครงสร้างสาร B
- Q04 แทนที่ตาม PDF (เฉลย B / เหตุผล A) + ต้นแบบ adaptive: D01–D04 → Path A/B/C/D → ตรวจระหว่างกิจกรรม → เปลี่ยนวิธีช่วย (ลงมือทำ) → Recheck → คำใบ้ L2 → Recheck-B → Learning Memory (`content/adaptive04.ts`, `components/AdaptiveQ04.tsx`); คำตอบครั้งแรกไม่ถูกเขียนทับ
- **ร่างโดย Claude ต้องให้ครูตรวจ:** ตัวเลือก D01–D04, เนื้อหา Path A–D, M04-A..D, Recheck-B, รายละเอียดการ์ดใน L01/C02–C05
- **สงสัยพิมพ์ตกใน PDF:** โจทย์ Q04 "…จึงจะมีผลรวมอันดับพันธะเท่ากับ?" ไม่มีเลข 4 — คงข้อความตาม PDF ไว้ รอเจ้าของยืนยัน
- รูปลูมพื้นใส (รอเจ้าของส่ง): `media/loom-point.png`, `loom-think`, `loom-cheer`, `loom-happy`, `loom-clipboard` — ถ้าไม่มีใช้ `/images/loom.webp`
- ตรวจแล้ว (localhost): typecheck, test, test-fake-hero, build:demo ผ่าน; เล่นใน browser: L01 3D, A03, Q01 รวม, สรุป C01, Q03 ลาก, Q04 adaptive ครบทุกขั้น (Path A → เปลี่ยนวิธี → Recheck ผิด → L2 → Recheck-B ถูก), ความกว้าง 375px ไม่ล้นจอ, ไม่มี console error
- ยังไม่ได้ตรวจ: iPad/มือถือจริง, Path B/C/D ทีละเส้นใน browser, หน้า Checkpoint/Transfer หลังเปลี่ยน
### ใส่ภาพ/วิดีโอ EP.01 ลง `media/` — 2 พฤศจิกายน 2569
- สาเหตุภาพไม่ขึ้นบนเว็บ: `media/` ยังไม่มีไฟล์ (ไฟล์ดิบอยู่ใน `Pic_video/` ซึ่งไม่ขึ้น GitHub)
- แปลงภาพ 10 ภาพเป็น webp กว้าง 1600px (~120–250KB) จับคู่ตามเลขหน้ามุมภาพ: s02a(02) s02b(03) s02c(04) l01(05) s08-1 คราบแวววาว, s08-2(06), a02 + s08-3(07 สมุด), s09-1 เสียงเครื่องยนต์, s09-2(08), s09-3(09); วิดีโอเปิดเรื่อง → `ep01-s01.mp4` (H.264)
- ยังไม่ใส่: `Animate_illustration_with_red_panda….mov` เป็น HEVC (hvc1) เล่นไม่ได้บน Chrome/Android ส่วนใหญ่ ต้องแปลงเป็น H.264 mp4 ก่อน (เครื่องนี้ไม่มี ffmpeg)
- ตรวจแล้ว (localhost): build รวมไฟล์สื่อ, วิดีโอ s01 โหลดได้ (1920px), ภาพ Scene 02 แสดงผล
- แก้ต่อ 3 พ.ย.: แปลง `Animate_illustration_with_red_panda….mov` (HEVC) เป็น H.264 mp4 ด้วย ffmpeg → `ep01-s01.mp4` (คลิปเปิดคดี "คลิปหนึ่งกำลังถูกส่งต่อ…", 6 วินาที, 2.4MB); คลิปเดิมใน s01 คือคลิปคราบแวววาวบนแม่น้ำ ย้ายไป `ep01-s08-1.mp4` แทนภาพนิ่งซ้ำ; ตรวจแล้ว: คลิป s01 เล่นได้ใน browser (localhost)
### ปรับหน้าเว็บตาม mockup (ภาพที่ 2 + streak/เป้าหมายจากภาพ 1) — 3 พฤศจิกายน 2569 (branch `feat/playtest-ready`)
- หน้าแรก: เลือกบทบาท นักเรียน/ครู → ฟอร์มเดิม (มีปุ่ม "เปลี่ยนบทบาท")
- หน้าหลักใหม่: ทักทาย+ลูม, การ์ด "กำลังเรียน", เรียนต่อเนื่อง N วัน + เป้าหมายวันนี้ 3 ข้อ (นับจากการกดเรียน/เปิดสมุด เก็บใน `learnloom-activity-v1` บนเครื่องนี้เท่านั้น), ไทล์ Chapter 1–4 (2–4 ล็อก)
- คลังบทเรียน (แท็บ ทั้งหมด/กำลังเรียน/เรียนจบ) → เลือก EP แบบ timeline → หน้าแนะนำ EP.01 → เข้าเรื่อง
- ความก้าวหน้า (วงแหวน % + แถบรายแนวคิด + ส่งผลให้ครู), สมุดบันทึก 3 แท็บ (สรุปเนื้อหา / หลักฐาน / ไอเดียของฉัน — เก็บใน `learnloom-notes-v1`), เกียรติบัตร (ล็อกจนจบซีรีส์), หน้าตั้งค่าใหม่ (ขนาดตัวอักษร, ลดภาพเคลื่อนไหว, ดาวน์โหลดออฟไลน์ย้ายมาจากหน้าหลัก)
- มือถือ <768px: แถบเมนูล่าง 5 ปุ่ม (ซ่อนระหว่างเรียนเรื่อง)
- ไม่ได้ทำ (ไม่แสดงปุ่มหลอก): โหมดมืด, เสียงบรรยาย, dashboard ครูแบบสด, คำถามชนิดใหม่ (จับคู่/เติมคำ/เลือกหลายข้อ/เรียงลำดับ/simulation)
- ภาพปก Chapter/EP ใช้ภาพฉากจาก EP.01 ชั่วคราว (ตอนที่ล็อกเป็นภาพเทา); ชื่อ EP.02–06 ใช้ตามโค้ดเดิม ไม่ใช่ตาม mockup — รอเจ้าของยืนยัน
- ตรวจแล้ว (localhost): typecheck, test, test-fake-hero, build:demo ผ่าน; browser ที่ 375 / 768 / 1366px ทุกหน้าไม่ล้นจอ, เพิ่ม/ลบไอเดียได้, streak ขึ้น 1 วันหลังกดเรียน, แถบล่างซ่อนตอนเรียน, ไม่มี console error
- ยังไม่ได้ตรวจ: มือถือ/iPad จริง
### ฉากแบบแตะทีละประโยค + ธีมสดใส — 3 พฤศจิกายน 2569 (branch `feat/playtest-ready`)
- `StoryPlayer.tsx`: ฉาก 01, 02, 04–07 (เรื่องนำ C02–C05), 08, 09 → ภาพ/คลิปเต็มกรอบ บทพูดขึ้นทีละประโยค แตะที่ไหนก็ได้/Space/Enter/→ ไปต่อ, ← หรือปุ่ม "ย้อน" ถอยกลับ, จุดบอกความคืบหน้า, ปุ่ม "อ่านทั้งหมด" (บทเต็ม), ปุ่มไปต่อขึ้นเมื่อจบฉาก
- ข้อความบทพูดดึงจาก JSX เดิมอัตโนมัติ (สคริปต์ตรวจว่าตัวอักษรตรงกันทุกตัว) — ไม่ได้แก้ถ้อยคำ; แยกชื่อผู้พูดเป็นป้ายสี
- คลิปเล่นเองแบบปิดเสียง (มีปุ่มเปิดเสียง/เล่นซ้ำ), ภาพนิ่งซูม/เลื่อนช้า ๆ, เปลี่ยนภาพแบบจาง; slot ที่มีหลายไฟล์ (s08) กระจายตามบรรทัด; ไม่มีภาพ → ลูมบนพื้นไล่สี
- ทุกหน้าในเรื่องเปลี่ยนแบบจาง/เลื่อนขึ้น; ปิดภาพเคลื่อนไหวทั้งหมดเมื่อเปิด "ลดภาพเคลื่อนไหว" หรือ prefers-reduced-motion
- ธีม: เขียวมิ้นต์ + ส้มพีช (เจ้าของเลือก) — สีหลักปุ่ม #0b7d56 (ตัวอักษรขาว contrast 5.1:1), มิ้นต์ #22b07d, พีช #ff8a5b, เหลือง #ffc93c, ฟ้า #4da8f0, พื้น #f6fbff, ตัวอักษร #1f3b4d; แทนค่าสีเดิมใน globals.css / fake-hero.css / hub.css; ฟอนต์ Itim และโครงหน้าเดิม
- ตรวจแล้ว (localhost): typecheck, test, test-fake-hero, build:demo ผ่าน; browser: ฉาก 01 คลิปเล่นและแตะจนจบ → ไปหน้า A01, ฉาก 02 ภาพเปลี่ยน s02a→s02b ตรงบท, ฉาก 04 (ไม่มีภาพ → ลูม), ฉาก 08 คลิป→ภาพ→ภาพ แล้วตารางหลักฐานขึ้น; 375px ไม่ล้นจอ; ไม่มี console error
- ยังไม่ได้ตรวจ: มือถือ/iPad จริง, ฉาก 09 ใน browser, ความกว้าง 768 ของหน้าฉาก
### กลับมาอิงตาม PDF ล่าสุด (คงโครงหน้าใหม่) — 3 พฤศจิกายน 2569 (branch `feat/playtest-ready`)
- เจ้าของสั่ง "อิงทุกอย่างตาม PDF" (`เนื้อเรื่องและคำถามล่าสุด.pdf`, `ข้อมูลเว็บล่าสุด.pdf`) และเลือก "คงโครงใหม่ แก้ตาม PDF"
- สี: คืนธีมครีม-เขียวเดิม (`globals.css`, `fake-hero.css`, `hub.css` กลับเป็นก่อน 7001a37); ยกเลิกธีมมิ้นต์/พีช
- เอาออก: เรียนต่อเนื่อง N วัน + เป้าหมายวันนี้ (แทนด้วยรายการแนวคิด C01–C05 ที่ทำแล้ว), เมนูตั้งค่า/คู่มือในแถบข้าง (ยังเข้าได้จากปุ่มโปรไฟล์); แถบล่างมือถือ: หน้าหลัก/บทเรียน/ความก้าวหน้า/สมุด/เกียรติบัตร
- เพิ่มบทบาท "บุคคลทั่วไป" (ไม่ต้องเลือกชั้น/รหัสห้อง; เก็บเป็น role student, grade "บุคคลทั่วไป")
- ฉากเรื่อง: ข้อความอยู่บนภาพแบบหนังสือนิทาน (กล่องบรรยายมุมบน, กรอบคำพูดมีหาง ลูมซ้าย/ผู้เล่นขวา, ข้อความบนจอกลางภาพ), พลิกหน้าแบบหมุนหน้ากระดาษ
- Adaptive ตาม PDF: `content/adaptiveUnits.ts` + `components/AdaptiveUnit.tsx` ใช้กับ C01 (หน้า diagnose ใน FakeHero), C02, C03, C05 — วินิจฉัย D0x → Path A/B/C/D (ผิดกลุ่มเดียว→path นั้น, หลายกลุ่ม→D, ไม่ผิด→C) → ข้อความ path จาก PDF → R0x-1/R0x-2 → RC0x → RC0x-B ถ้าผิด → Transfer/ยืนยันความเข้าใจ (พิมพ์ตอบ; C05 แสดงแนวคำตอบ T05-A) → สรุปพร้อมเส้นทาง; คำตอบครั้งแรกไม่ถูกเขียนทับ
- **ร่างโดย Claude ต้องให้ครูตรวจ:** ตัวเลือกที่ผิดของ D01–D05 ทุกข้อ (PDF ให้แต่คำถาม+คำตอบ), โจทย์ R03-1 (ตัวเลือก โซ่ตรง/โซ่กิ่ง/วง), เหตุผล CP01-E–CP05-E (จากรอบก่อน), การจัดกลุ่ม A/B/C ของข้อ D ที่ใช้เลือก path
- **ต่างจาก PDF ล่าสุด รอเจ้าของเลือก:** C04 adaptive ยังใช้ D01–D04 จาก `แก้ไข.pdf`; PDF ล่าสุดมี D04-1…D04-5 และ Transfer T04-A/T04-B — ยังไม่ได้เปลี่ยน
- ยังไม่ได้ทำ (ตาม spec): ดาวน์โหลดออฟไลน์แบบ PWA เต็มรูปแบบ, Teacher Dashboard sync, Learning Memory ข้ามคำถาม
- ตรวจแล้ว (localhost): typecheck, test, test-fake-hero, build:demo ผ่าน; browser: C01 adaptive ครบ (D01-1 ผิด → Path B → R01 → RC01 ผิด → RC01-B ถูก → ยืนยันความเข้าใจ → สรุป "ผ่านหลังช่วยเหลือ" + เส้นทาง), C05 (ผิด 2 กลุ่ม → Path D 3 ขั้น → แนวคำตอบ T05-A → รายงาน), หน้าเลือกบทบาท 3 ปุ่มที่ 1366/768/375, ฟอร์มบุคคลทั่วไป, หน้าหลักครีม-เขียวที่ 1366/375, ฉาก 01/02 ข้อความบนภาพที่ 1366/375 ไม่ล้นจอ
- ยังไม่ได้ตรวจ: C02/C03 adaptive ใน browser (ใช้ component เดียวกับ C01/C05), มือถือ/iPad จริง, ฉากที่ 768px
- แก้ต่อ 3 พ.ย. (เจ้าของเลือก "ใช้ตาม PDF ล่าสุด"): C04 เปลี่ยนจากต้นแบบ `แก้ไข.pdf` มาใช้ `AdaptiveUnit` ตาม PDF ล่าสุด p.15–18 — D04-1…D04-5, Path A–D, R04-1/R04-2, RC04 (CH₃–CH=CH₂ เฉลย C), RC04-B (HC≡CH เฉลย B), Transfer T04-A/T04-B (เลือกข้อที่ผู้เรียนยังไม่เคยเห็น: ถ้าทำ D04-5 แล้ว → T04-B); `results.ts` ส่ง path/RC/RC-B/คำตอบ transfer ของทุกแนวคิดให้ครู; `test-fake-hero.mjs` ตรวจเฉลย R/RC/RC-B ทั้ง 5 แนวคิดและกฎเลือก path
- **ร่างโดย Claude:** ตัวเลือกที่ผิดของ D04-1…D04-5; กลุ่มเลือก path ของ C04 (D04-1→A, D04-2→B, D04-3/4/5→C) — PDF บอกว่า "ไม่จำเป็นต้องทำทั้งห้าข้อ" แต่ตอนนี้ถามครบ 5 ข้อ
- **ต่างจาก PDF รอเจ้าของยืนยัน:** RC04 ใน `episode01.ts` (CH₃–CH₂–C(?)=CH₂) ไม่ตรงกับ RC04 ใน PDF ล่าสุด — flow ใหม่ใช้ตาม PDF แล้ว แต่ข้อเดิมยังอยู่ในไฟล์ (ไม่ได้แก้ถ้อยคำ); กิจกรรมโต้ตอบใน path (Electron Pair Explorer, Build a Double Bond ฯลฯ) ยังแสดงเป็นคำอธิบาย ไม่ใช่กิจกรรมลากจริง
- ตรวจแล้ว (localhost): typecheck, test, test-fake-hero, build:demo ผ่าน; browser: C04 แบบผู้เรียน B ใน PDF (D04-2 ผิด → Path B → R04 → RC04 ถูก → T04-B + แนวคำตอบ → รายงาน "ผ่านหลังช่วยเหลือ"), ไฟล์ผลลัพธ์มี path/transfer, 375px ไม่ล้นจอ
- แก้ต่อ 3 พ.ย. (เจ้าของสั่ง "แทนด้วยข้อใน PDF"): RC04 ใน `episode01.ts` เปลี่ยนเป็นข้อจาก PDF ล่าสุด p.17 — "ใน CH₃–CH=CH₂ คาร์บอนตำแหน่ง CH ตรงกลางมีผลรวมอันดับพันธะเท่าใด?" A. 2 B. 3 C. 4 เฉลย C (เดิม CH₃–CH₂–C(?)=CH₂ เฉลย B); `test-fake-hero.mjs` อัปเดตเฉลย RC04 และตรวจว่า RC01–RC05 ใน flow adaptive ตรงกับ `episode01.ts`; ตรวจแล้ว: typecheck, test, test-fake-hero, build:demo ผ่าน, หน้า RC04 แสดงข้อใหม่ใน browser (localhost)
- หมายเหตุ: ผลที่บันทึกไว้ก่อนหน้านี้ด้วย flow Q04 แบบเดิม (เฉลย RC04 เป็น B) จะถูกตัดสินด้วยเฉลยใหม่ — มีผลเฉพาะข้อมูลทดสอบในเบราว์เซอร์ที่เคยเล่นก่อนหน้า
- แก้ต่อ 3 พ.ย. (เจ้าของให้อิสระปรับให้เป็นกิจกรรมมากขึ้น ห้ามเปลี่ยนคำถาม): `components/PathActivities.tsx` เพิ่มกิจกรรมลงมือทำในทุก Path A/B/C ของ C01–C05 (Path D ทำครบ 3 กิจกรรมต่อกัน) — แตะการ์ดจัดกลุ่ม (บัตรสาร, Bond Symbol Match, โซ่ตรง/กิ่ง/วง), พลิกการ์ดเทียบ CH₄/CO₂, Electron Pair Explorer/Build a Double Bond (เติม/เอาคู่อิเล็กตรอนออก สัญลักษณ์เปลี่ยนตาม), บิวเทนวาด 3 แบบ, ต่อคาร์บอนตัวที่ 4 ให้เป็นโซ่กิ่ง, Carbon Bond Highlighter (แตะพันธะรอบคาร์บอนเป้าหมายแล้วรวมอันดับพันธะ), Atom Counter/Formula Decoder (แตะนับทีละกลุ่ม); ปุ่ม "ขั้นถัดไป" กดได้เมื่อทำกิจกรรมสำเร็จ; ข้อความ path จาก PDF ย้ายไปอยู่ใน "เกี่ยวกับเส้นทางนี้" (ถ้อยคำเดิม); คำถาม D/R/RC/RC-B/Transfer ไม่เปลี่ยน
- **ร่างโดย Claude ต้องให้ครูตรวจ:** เนื้อหากิจกรรมทั้งหมด (สารตัวอย่าง C₂H₅OH, C₆H₁₂O₆, CO, K₂CO₃, Na₂CO₃, ไซโคลเฮกเซน, เมทิลโพรเพน, CH₂=CH–CH₂–CH₃, C₃H₈, C₄H₁₀/C₄H₈, C₅H₁₂ และข้อความคำใบ้) — เลือกสารที่ไม่ซ้ำกับโจทย์ R/RC/Transfer; กิจกรรมไม่ถูกบันทึกเป็นคะแนน
- ตรวจแล้ว (localhost): typecheck, test, test-fake-hero, build:demo ผ่าน; browser: Path D ของ C01–C05 ทำครบทุกกิจกรรม ปุ่มล็อกก่อนสำเร็จและปลดล็อกหลังสำเร็จ, คำใบ้เมื่อแตะผิด (C04), ไปต่อถึง R01-1 ได้, C01 ที่ 375px ไม่ล้นจอ
- ยังไม่ได้ตรวจ: กิจกรรมบนมือถือ/iPad จริง (ทดสอบด้วยการคลิกเมาส์/สคริปต์เท่านั้น), ใช้แป้นพิมพ์อย่างเดียว, 768px
- แก้ต่อ 3 พ.ย. (เจ้าของเลือก "ตัวช่วยเปลี่ยนตามผล"): ตาม `ข้อมูลเว็บล่าสุด.pdf` p.11 "ระหว่างกิจกรรม ระบบจะตรวจความเข้าใจและสามารถเปลี่ยนรูปแบบการช่วยเหลือได้" — ถ้าตอบแบบฝึก R0x-1/R0x-2 ผิด ระบบจะเปลี่ยนไปใช้กิจกรรมของ path อื่น (ระดับ Bloom ที่ติดกันก่อน: A→B, B→A, C→B, D→A; ผิดอีกข้อจะใช้อีกแบบที่ยังไม่เคยใช้; ฟังก์ชัน `nextSwitch` ใน `adaptiveUnits.ts`) แล้วให้ลองข้อเดิมอีกครั้ง (ยังไม่เฉลยก่อนลองซ้ำ); คำตอบแรกของแบบฝึกเก็บใน `practice` ไม่ถูกเขียนทับ คำตอบหลังเปลี่ยนวิธีเก็บใน `practiceRetry`; รายงานแสดงเส้นทาง "… → เปลี่ยนวิธีช่วยเป็น Path X → Recheck"; ไฟล์ผลลัพธ์มี `helpSwitches` และ `practiceRetry`; ผลแบบฝึกไม่มีผลต่อสถานะ (ยังตัดสินจาก RC/RC-B เหมือนเดิม)
- ตรวจแล้ว (localhost): typecheck, test, test-fake-hero (เพิ่มกฎ nextSwitch), build:demo ผ่าน; browser: C03 Path B — R03-1 ผิด → กิจกรรม Path A → ลองซ้ำถูก → R03-2 ผิด → กิจกรรม Path C → ลองซ้ำผิด (เฉลย) → RC03 → ยืนยันความเข้าใจ → รายงานแสดงการเปลี่ยนวิธีทั้งสองครั้ง, buildResult มี helpSwitches
- ยังไม่ได้ทำ: หน้าครู/LearningHub ยังไม่แสดง helpSwitches (มีในไฟล์ผลลัพธ์แล้ว); ผู้เรียนยังเลือกสลับรูปแบบเอง (VARK) ไม่ได้; ยังไม่ได้ทดสอบบนมือถือจริง
- แก้ต่อ 3 พ.ย. (เจ้าของสั่ง "ทำเลย"): พื้นที่ครู (`TeacherResults.tsx`) แสดงเส้นทาง Adaptive และการเปลี่ยนวิธีช่วยในแต่ละช่องแนวคิด เช่น "Path B → A → C (เปลี่ยนวิธี 2)" (ชี้เมาส์ดูรายละเอียด ข้อ: จาก→เป็น และคำตอบที่ลองซ้ำ); กล่อง "แนวคิดที่ควรทบทวนทั้งห้อง" บอกจำนวนคนที่ต้องเปลี่ยนวิธีช่วย; Excel แผ่น "รายแนวคิด" เพิ่มคอลัมน์ เส้นทาง Adaptive, เปลี่ยนวิธีช่วย, Recheck-B, ยืนยันความเข้าใจ
- ตรวจแล้ว (localhost): typecheck, test, test-fake-hero, build:demo ผ่าน; browser: นำเข้าไฟล์ผลตัวอย่าง 2 ไฟล์ (ชื่อสมมติ คนหนึ่งเปลี่ยนวิธี 2 ครั้ง อีกคนไม่เปลี่ยน) ตารางและกล่องสรุปแสดงถูกต้อง
- ยังไม่ได้ตรวจ: เปิดไฟล์ Excel ที่ส่งออกจริง (ตรวจแค่ typecheck)
- แก้ต่อ 3 พ.ย. (เจ้าของขอ "ฟีลเกม สีสดใส ออฟไลน์ VARK 4 แบบ adaptive ชัดขึ้น ลิงก์ข้อมูลลง Excel"): ชั้นเกม `PlayLayer.tsx` + `game.ts` (XP/เลเวล 6 ขั้น/ดาว 15 ดวง/เหรียญ 8 แบบ, toast, หน้าต่างเลเวลอัป+คอนเฟตตี); `GameHub.tsx` แถบ HUD บนหน้าหลัก + แผนที่ภารกิจ (ครั้งแรก → วินิจฉัย → Path → เปลี่ยนวิธี → Recheck) ในหน้าความก้าวหน้า; VARK (`vark.ts`, `VarkHelp.tsx`): แบบสำรวจ 3 ข้อตอนเข้าครั้งแรก (ข้ามได้), ปุ่มลอยเลือกสไตล์, ความช่วยเหลือใน Path แสดง 4 แบบ — ภาพ (การ์ดขั้นตอนมีไอคอน), ฟัง (อ่านออกเสียง th-TH + แตะข้อความเพื่อฟัง + ฉากเรื่องอ่านให้ฟังอัตโนมัติ), อ่าน-เขียน (ข้อความเต็ม + ช่องสรุปด้วยคำตัวเอง), ลงมือทำ (กิจกรรมก่อน) — ถ้อยคำ path จาก PDF เหมือนกันทุกแบบ เปลี่ยนแค่รูปแบบ/ลำดับ; การ์ด "ทำไมลูมเลือก Path นี้" แสดงข้อวินิจฉัยที่ผิดและกลุ่ม A/B/C; ผลลัพธ์/Excel ครูมี XP เลเวล สไตล์ VARK และจำนวนครั้งที่ใช้แต่ละสไตล์; ตั้งค่า → "สำหรับผู้พัฒนา" ดาวน์โหลด .xlsx ทุกข้อมูลในเครื่อง + ลิงก์ Google Sheets ผ่าน Apps Script (`sheets.ts`, วิธีตั้งค่า `docs/fake-hero/google-sheets.md`; รับเฉพาะ script.google.com/…/exec หรือ localhost, ส่งอัตโนมัติได้ ออฟไลน์จะรอส่ง); PWA manifest + ไอคอน, precache สื่อทั้งหมด, SW `learnloom-1.2-game`
- **ร่างโดย Claude ต้องให้ครูตรวจ:** คำถามแบบสำรวจ VARK 3 ข้อ (ไม่ได้มาจาก PDF และไม่ใช่แบบวัด VARK มาตรฐาน), ชื่อเลเวล/เหรียญ/ข้อความ XP; ไอคอนแอปเป็นภาพแว่นขยายที่วาดด้วยโค้ด
- ตรวจแล้ว (localhost): typecheck, test, test-fake-hero, build:demo ผ่าน; browser 800px: แบบสำรวจ, HUD, การ์ดทำไม Path (C03 Path D), สลับ V/R/K แล้วกิจกรรมไม่รีเซ็ต, toast XP/เหรียญ/เลเวลอัป, แผนที่ภารกิจ; 1366: "ส่งตอนนี้" ไปถึงตัวรับทดสอบ localhost (ได้ 1 แถว มี vark); 768/375: ไม่ล้นจอ ปุ่มลอยไม่บังปุ่มล่างสุด (เพิ่มระยะเผื่อล่างหน้า); ไฟล์ .xlsx เป็น zip ถูกต้อง 4 แผ่น
- ยังไม่ได้ตรวจ: เสียงอ่าน (โหมดฟัง) ได้ยินจริง/มีเสียงไทยในเครื่องไหม, ติดตั้ง PWA + ใช้ออฟไลน์บน HTTPS (Vercel), Google Apps Script จริง, เปิด .xlsx ใน Excel จริง, มือถือ/iPad จริง
- แก้ต่อ 3 พ.ย. (เจ้าของเลือก: กราฟิกเหมือนภาพตัวอย่าง, ความเป็นเกมมากขึ้น, VARK ทั่วทั้งบทเรียน, ตรวจงานที่ยังไม่ทดสอบ): ภาพสีน้ำ SVG วาดด้วยโค้ด (`public/images/deco/wash.svg`, `sprig.svg`) เป็นพื้นหลัง HUD/ภารกิจ/แผนที่/หน้าต่าง + กิ่งใบไม้, ภาพลูมกลืนกับกระดาษ (mix-blend multiply), ไอคอนแอปเป็นหน้าลูม (ครอปจาก `loom.webp` ด้วย sharp); เกม: ภารกิจรายวัน 3 ข้อ (ได้ตราประทับ ไม่ให้ XP เพื่อให้ XP สะท้อนการเรียนจริง), การ์ดหลักฐาน C01–C05 พลิกดูเส้นทางได้ (ปลดล็อกเมื่อผ่านแนวคิด), เสียงเอฟเฟกต์สังเคราะห์ Web Audio (ปิดได้ที่ปุ่ม 🔔); VARK ในทุกคำถามปรนัย (`ChoiceTools.tsx` ผ่าน `Choices`): ภาพ = ระบายสีธาตุในสูตร, ฟัง = อ่านโจทย์+ตัวเลือก, อ่าน-เขียน = โน้ตต่อข้อ, ลงมือทำ = ตัดตัวเลือกที่ไม่ใช่ออก — ถ้อยคำ/ตัวเลือก/เฉลยไม่เปลี่ยน; แจ้งเตือนเมื่อเครื่องไม่มีเสียงไทย; พื้นที่ครูมีตาราง "สไตล์การเรียน (VARK) กับผลลัพธ์" + แผ่น Excel "VARK" (เชิงพรรณนา ไม่สรุปเชิงสถิติ); SW `learnloom-1.3-watercolor`
- **ร่างโดย Claude:** ภาพสีน้ำ SVG และไอคอน (ไม่ใช่ภาพจากเจ้าของ), ข้อความภารกิจรายวัน, ไอคอนการ์ด
- ตรวจแล้ว (localhost): typecheck, test, test-fake-hero, build:demo ผ่าน; browser: หน้าหลักสีน้ำ + ภารกิจ (800/375 ไม่ล้นจอ), ภารกิจสำเร็จพร้อม toast, การ์ดหลักฐาน 5/5 พลิกได้, Q01 โหมด V (สีธาตุ) K (ตัดตัวเลือก) R (โน้ตบันทึก) A (ปุ่มอ่าน speechSynthesis เริ่มพูด), ตาราง VARK ครูจากไฟล์ตัวอย่าง 2 ไฟล์ (ชื่อสมมติ) คำนวณถูก, Excel ครูมี 4 แผ่นรวม VARK (ตรวจโครงสร้าง zip)
- พบระหว่างตรวจ: เบราว์เซอร์ทดสอบไม่มีเสียงภาษาไทย (มี 3 เสียง ไม่มี th) — โหมดฟังจะอ่านไทยไม่ชัดบนเครื่องแบบนี้ จึงเพิ่มคำแนะนำให้ติดตั้งเสียงไทย
- ยังไม่ได้ตรวจ: ได้ยินเสียงไทยจริงบนเครื่องที่มีเสียงไทย, เปิด .xlsx ใน Excel จริง (เครื่องนี้ไม่มี Excel/Python), ติดตั้ง PWA + ออฟไลน์บน Vercel HTTPS, Google Apps Script จริง, มือถือ/iPad จริง
- แก้ต่อ 3 พ.ย. (เจ้าของขอ "เสียงพูดเป็นภาษาไทย ใช้เสียง AI ได้" และเลือก Azure AI Speech): เสียงอ่านไทยแบบไฟล์ MP3 สร้างล่วงหน้า — `scripts/voice-texts.mjs` เก็บข้อความไทยทั้งหมด (~894 ข้อความ ~33,000 ตัวอักษร), `scripts/gen-voice.mjs` (`pnpm gen:voice`) เรียก Azure ด้วย key ใน `.env.local` (ไม่ commit) เสียง th-TH-PremwadeeNeural / NiwatNeural (เจฟ เฮียศักดิ์ ชาวบ้าน), `features/fake-hero/voice.ts` + `speak(parts)` ใน `vark.ts` เล่นไฟล์ทีละส่วน ข้อความที่ไม่มีไฟล์ใช้เสียงเครื่อง; ซ่อนคำเตือน "ไม่มีเสียงไทย" เมื่อมีไฟล์เสียง AI; ชุดออฟไลน์รวมไฟล์เสียง (SW `learnloom-1.4-thai-voice`); test-fake-hero ตรวจ voiceKey ตรงกันและโจทย์/ตัวเลือกทุกข้อถูกเก็บ; วิธีตั้งค่า `docs/fake-hero/voice.md`
- ตรวจแล้ว (localhost): typecheck, test, test-fake-hero, build:demo ผ่าน; browser ด้วยไฟล์เสียงทดสอบ (เสียงบี๊บ ไม่ใช่เสียง Azure): มีไฟล์ → เล่น MP3, ไม่มีไฟล์ → เสียงเครื่อง, ไฟล์หาย → ถอยไปเสียงเครื่องครั้งเดียว, ปุ่มหยุดหยุดทั้งสองแบบ, "ฟังทั้งหน้า" อ่านทีละส่วน, คำเตือนไม่มีเสียงไทยหายเมื่อมีไฟล์
- ยังไม่ได้ทำ/ตรวจ: **ยังไม่ได้สร้างไฟล์เสียงจริง** (ต้องมี Azure key ของเจ้าของ) จึงยังไม่ได้ฟังคุณภาพเสียง/การอ่านสูตรเคมี; ข้อความที่ประกอบขึ้นตอนรัน (เช่น ชื่อเล่น, XP) ยังใช้เสียงเครื่อง
- แก้ต่อ 3 พ.ย. (เจ้าของสมัคร Azure ไม่ได้ เลือก "ใช้ Edge TTS"): สร้างไฟล์เสียงไทยครบ 894 ไฟล์ (~22 MB, รวม ~57 นาที) ใน `public/voice/` ด้วยบริการอ่านออกเสียงของ Edge ผ่าน `msedge-tts@2.1.0` (devDependency, ไม่อนุญาต build script) — **ไม่ใช่ API ทางการของ Microsoft**; `gen-voice.mjs` ใช้ Azure อัตโนมัติถ้ามีคีย์จริงใน `.env.local`
- ตรวจแล้ว (localhost): typecheck, test, test-fake-hero, build:demo ผ่าน (dist-demo มีไฟล์เสียงครบ); ffprobe ทุกไฟล์เป็น MP3 ความยาวสมเหตุสมผล ไม่มีไฟล์ว่าง; browser: index 894 รายการ, หัวเรื่อง EP.01 เล่นจากไฟล์ MP3 (ไม่ใช้เสียงเครื่อง)
- ยังไม่ได้ตรวจ: ฟังคุณภาพเสียงด้วยหูจริง (Claude ฟังไม่ได้ — ส่งตัวอย่าง 3 ไฟล์ให้เจ้าของฟัง), การอ่านสูตรเคมี, ชุดออฟไลน์ 22 MB บนมือถือ/Vercel จริง
- แก้ต่อ 3 พ.ย. (เจ้าของขอ "แต่ละตัวละครมีเสียงของตัวเอง เสียงบรรยายเป็นอีกเสียง น้ำเสียงดีกว่านี้"): `scripts/voice-cast.mjs` กำหนดเสียง 8 บทบาท (ผู้บรรยาย ลูม ผู้เล่น เจฟ เฮียศักดิ์ ชาวบ้าน แม่ เสียงในคลิป) จาก Premwadee/Niwat + ปรับ pitch/rate (ภาษาไทยมีแค่ 2 เสียง); ไม่อ่านชื่อผู้พูด/อีโมจิ/เครื่องหมายคำพูด, หยุดตามจุดไข่ปลา, สัญลักษณ์พันธะอ่านตามรูป (ไม่เฉลย); `--samples` สร้างตัวอย่างบทละไฟล์; `manifest.json` ทำให้รันซ้ำสร้างเฉพาะบรรทัดที่เปลี่ยน; บทพูด/กล่องลูม/บรรยายมี `data-voice` ให้แตะฟังได้เสียงตัวละครถูกไฟล์; สร้างไฟล์ใหม่ทั้ง 894 ไฟล์ (ผู้บรรยาย 848, ลูม 28, ผู้เล่น 9, เจฟ 4, ชาวบ้าน 3, แม่ 1, คลิป 1; เฮียศักดิ์ยังไม่มีบรรทัดที่ขึ้นต้นด้วยชื่อ)
- ตรวจแล้ว (localhost): typecheck, test, test-fake-hero, build:demo ผ่าน; ffprobe 894 ไฟล์ถูกต้อง; manifest ยืนยันเสียง/ค่าที่ใช้ต่อบทบาท; browser: แตะชื่อ "เจฟ" ในบทพูด → ได้ไฟล์เสียงเจฟของบรรทัดเต็ม (200 audio/mpeg)
- ยังไม่ได้ตรวจ: ฟังด้วยหูว่าแต่ละตัวละครแยกกันชัดและเป็นธรรมชาติ (Claude ฟังไม่ได้ — ส่งตัวอย่างให้เจ้าของฟัง); ข้อความลูมบางส่วนที่แยกด้วย {…} ใน JSX ยังเป็นเสียงผู้บรรยาย
- แก้ต่อ 3 พ.ย. (เจ้าของขอ "การพูดสูตรสารเคมีให้ถูกต้อง"): `spokenText` ใน `scripts/voice-cast.mjs` อ่านสูตรแบบห้องเรียนไทย — ธาตุเป็นชื่อตัวอักษรอังกฤษ ตัวห้อยเป็นเลขอังกฤษ (Na₂CO₃ "เอ็นเอทู ซีโอทรี"), วงเล็บ/C(?) อ่านออกมา, ตรวจสัญลักษณ์ธาตุกับตารางธาตุจริงเพื่อไม่อ่านคำอังกฤษ/รหัส (Path, XP, CP01) เป็นสูตร; = ในการคำนวณ "เท่ากับ", + "บวก", − "ลบ", ช่วงรหัส "ถึง"; สัญลักษณ์พันธะยังอ่านตามรูป (ขีดคู่) ไม่บอกชื่อพันธะ; สร้างไฟล์ใหม่ 180 ไฟล์ที่คำอ่านเปลี่ยน
- ตรวจแล้ว (localhost): typecheck, test, test-fake-hero, build:demo ผ่าน; ffprobe ไฟล์ใหม่ถูกต้อง; ดูข้อความที่ส่งให้เสียงอ่านของบรรทัดตัวอย่าง (สูตรกิ่ง, C(?), เลขคณิต, รหัส CP01/R01-1/C02–C05) ถูกตามกฎ
- ยังไม่ได้ตรวจ: ฟังด้วยหูว่าเสียงออกเสียงคำทับศัพท์ ("ทเวลฟ์", "ซีเอชทรี") ชัด (ส่งตัวอย่าง 4 ไฟล์ให้เจ้าของฟัง); ครูยังไม่ได้ยืนยันว่าต้องการเลขอังกฤษหรือเลขไทยสำหรับตัวห้อย
