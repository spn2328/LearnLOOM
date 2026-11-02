# ตั้งค่า Supabase (บัญชีครู/นักเรียน + ฐานข้อมูลจริง)

ถ้ายังไม่ได้ตั้งค่าตามนี้ เว็บจะทำงานแบบเดิม คือบันทึกเฉพาะในเบราว์เซอร์ และไม่มีปุ่มเข้าสู่ระบบ

## 1. สร้างโปรเจกต์
1. สมัคร/เข้า https://supabase.com แล้วกด New project (เลือก Region ใกล้ไทย เช่น Singapore)
2. Project Settings → API: จด **Project URL** และ **anon public key** (ห้ามใช้ `service_role` key ในเว็บ)

## 2. สร้างตารางและสิทธิ์
1. SQL Editor → New query → วางทั้งไฟล์ `supabase/migrations/20261103000000_phase1_core.sql` → Run
2. ตั้ง **รหัสสำหรับครู** (ใช้ตอนสมัครบัญชีครู เก็บไว้ฝั่ง server เบราว์เซอร์อ่านไม่ได้):
   ```sql
   insert into private.settings (key, value) values ('teacher_code', 'ตั้งรหัสที่เดายาก')
   on conflict (key) do update set value = excluded.value;
   ```
   ห้ามใส่รหัสนี้ลงใน repo

## 3. ตั้งค่า Auth
- Authentication → Sign In / Providers → Email: เปิดไว้
- **Confirm email**: ถ้าเปิด นักเรียนต้องกดลิงก์ในอีเมลก่อนเข้าระบบ ถ้าปิด สมัครแล้วเข้าได้ทันที (เหมาะกับห้องเรียนที่นักเรียนไม่ค่อยเช็กอีเมล) — เจ้าของเลือก
- Authentication → URL Configuration → Site URL: `https://learnloom-murex.vercel.app`

## 4. ใส่ค่าใน Vercel
Project → Settings → Environment Variables (Production + Preview):
- `VITE_SUPABASE_URL` = Project URL
- `VITE_SUPABASE_ANON_KEY` = anon public key

แล้ว Redeploy เครื่องตัวเอง: คัดลอก `.env.example` เป็น `.env.local` แล้วใส่ค่าเดียวกัน

## 5. ทดสอบหลังตั้งค่า (ยังไม่ได้ทำ ต้องทำบนโปรเจกต์จริง)
1. สมัครบัญชีครู (ติ๊ก "ฉันเป็นครู" + รหัสครู) → สร้างห้อง → ได้รหัสห้อง 6 ตัว
2. สมัครนักเรียน 2 บัญชี (ชื่อเล่นสมมติ) → เข้าห้องด้วยรหัส → เรียน C01 → ป้ายขึ้น "ซิงก์แล้ว"
3. ออกจากระบบ → เข้าใหม่ (หรือเครื่องอื่น) → ต้องเรียนต่อจากจุดเดิม
4. เริ่มคดีใหม่แล้วตอบ → Table Editor `attempts` มีครั้งที่ 1 และ 2 แยกกัน `answer_events` ของครั้งแรกยังอยู่
5. ครูเห็นนักเรียนในห้องตัวเอง ครูอีกคน/นักเรียนอีกคนไม่เห็น

## สิ่งที่ฐานข้อมูลตรวจเอง (Row Level Security)
- นักเรียนเห็น/เขียนเฉพาะข้อมูลตัวเอง ไม่เห็นข้อมูลเพื่อน
- ครูเห็นเฉพาะนักเรียนที่อยู่ในห้องที่ตนสร้าง และเห็นแบบอ่านอย่างเดียว
- เปลี่ยนตัวเองเป็นครูได้ทางเดียวคือรหัสครู; รหัสห้องสร้างโดย server
- คำตอบ (`answer_events`) เพิ่มได้อย่างเดียว แก้/ลบไม่ได้; ส่งซ้ำไม่เกิดแถวซ้ำ
- ตรวจด้วย `pnpm test:db` (Postgres จำลองในเครื่อง ไม่ใช่ Supabase จริง)
