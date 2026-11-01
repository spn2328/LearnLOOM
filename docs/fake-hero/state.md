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
