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
