# Workflow พัฒนา LearnLOOM ด้วย Claude Code

## วงจรงานหนึ่งรอบ (1 งานย่อย = 1 branch = 1 PR)

```
 เจ้าของสั่งงาน (อ้าง phase/ข้อใน roadmap.md)
        │
 1. Claude อ่าน CLAUDE.md (อัตโนมัติ) → state.md ส่วนบน → roadmap ข้อที่เกี่ยวข้อง
        │
 2. lf-ship: สร้าง branch จาก main
        │
 3. ลงมือ ─ เนื้อหา/คำถาม → lf-content (เทียบ PDF หน้าเดียวที่เกี่ยวข้อง)
        │  ─ หน้าตา/CSS/สื่อ → lf-ui-guard
        │
 4. lf-verify: test → answer keys → typecheck → build:demo → (E2E) → browser ถ้าแก้ UI
        │        ไม่ผ่าน → กลับข้อ 3
 5. lf-ship: เขียนผลลง state.md → commit → push → PR
        │
 6. Vercel preview → เจ้าของ/ครูลองบน iPad/คอม → แก้ตาม feedback
        │
 7. เจ้าของสั่ง merge ในแชต → production
```

## เทคนิคประหยัด token
- **หนึ่งงานต่อหนึ่ง session**; จบงานแล้วเริ่ม session ใหม่ (หรือ `/clear`) — state.md คือความจำข้าม session
- สั่งงานให้เจาะจง: ระบุ id (เช่น `Q03`, `R02 Path C`) + ไฟล์ ถ้ารู้ — ใช้แม่แบบใน `PROMPTS.md`
- ไฟล์โค้ดบรรทัดยาวมาก: ให้ Grep หา id แล้วอ่านเฉพาะช่วง; ห้ามอ่านทั้งไฟล์ (`globals.css`, `learnloom-app.tsx`, `episode01.ts`) — จะดีขึ้นมากหลัง Phase 3 (Prettier)
- PDF: ค้นใน `*.extracted.md` ก่อน แล้วเปิด PDF เฉพาะหน้าเดียว
- งานเนื้อหาซ้ำ ๆ ใช้โมเดลที่ถูกกว่า (Sonnet/Haiku); งานออกแบบระบบ/adaptive ใช้ Opus
- state.md: เพิ่มส่วนใหม่สั้น ≤ 12 บรรทัด; เมื่อยาวเกิน ~300 บรรทัดให้ย้ายส่วนเก่าไป `docs/fake-hero/archive/`

## กติกาคงเดิมจากทีม
- คงข้อความคำถาม ตัวเลือก เฉลยและเรื่องราวที่ยืนยันแล้ว; เสนอข้อผิดพลาดให้ครูตรวจ
- แยกผลครั้งแรกจากผลหลังช่วย
- ใช้ชื่อเล่น/ข้อมูลจำลองเท่านั้น; ห้ามใส่ข้อมูลนักเรียนจริงลง repository
- ไม่กล่าวอ้างว่ามีฐานข้อมูลกลาง ออฟไลน์ ซิงก์ หรือผลทดสอบอุปกรณ์ จนกว่าจะทดสอบจริง
