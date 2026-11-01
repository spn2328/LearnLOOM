# สถานะ LearnLOOM — The Fake Hero

อัปเดต: 1 พฤศจิกายน 2569
Branch พัฒนา: `feat/fake-hero-interactive-demo`
Pull Request (Draft): https://github.com/spn2328/LearnLOOM/pull/2
ฐานแผน: `docs/fake-hero-demo-plan` — **ยังไม่ merge เข้า main และยังไม่ deploy**

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
