# EP.01 Story Media

ระบบสื่อย้ายมาใช้ **การตั้งชื่อไฟล์ตามรหัสตำแหน่ง** แล้ว — ดูวิธีใช้และรหัสทั้งหมดที่ [`media/README.md`](../../media/README.md)

- โค้ด: `features/fake-hero/media/slots.ts` (รายการตำแหน่ง), `media/registry.ts` (อ่านไฟล์ใน `media/` ตอน build), `components/MediaSlot.tsx` (แสดงผล)
- ตำแหน่งจาก PR #6 เดิมแปลงเป็นรหัสดังนี้: `01-viral-video` → `ep01-s01`, `02-confrontation` → `ep01-s02a`, `03-mother-message` → `ep01-s02b`, `04-jeff-admits` → `ep01-s02c`, `07-evidence-notebook` (A02) → `ep01-a02`, `05-learning-chemistry` → `ep01-l01`, `06-*` + `07-*` (Scene 08) → `ep01-s08-1..4`, `08-*` + `09-*` → `ep01-s09-1..3`
- ไม่มีไฟล์ = ไม่แสดงอะไรให้ผู้เล่นเห็น (ไม่มีกรอบ "เพิ่มไฟล์")
- วิดีโอไม่เล่นอัตโนมัติ ยกเว้นไฟล์ `.loop` (ไม่มีเสียง, เคารพ prefers-reduced-motion)
- ภาพบางชิ้นเป็นภาพประกอบบริบท ไม่ได้อ้างว่า PDF กำหนดภาพนั้นตรงตัว
