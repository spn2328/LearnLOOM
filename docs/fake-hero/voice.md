# เสียงอ่านภาษาไทย (AI) — Azure AI Speech

เว็บอ่านออกเสียงด้วยไฟล์ MP3 ที่สร้างล่วงหน้าด้วยเสียง neural ภาษาไทยของ Microsoft
(`th-TH-PremwadeeNeural`; บทพูดของ เจฟ / เฮียศักดิ์ / ชาวบ้าน ใช้ `th-TH-NiwatNeural`)
ทุกเครื่องจึงได้ยินเสียงเดียวกัน และเปิดฟังออฟไลน์ได้หลังกด "เตรียมชุดออฟไลน์"
ข้อความที่ไม่มีไฟล์เสียง (เช่น ชื่อเล่นที่ผู้เรียนพิมพ์) จะใช้เสียงของเครื่องแทน

## ตั้งค่าครั้งแรก (เจ้าของโปรเจกต์ทำเอง)
1. สร้าง resource **Speech** ใน Azure Portal (ระดับราคา Free F0 = 500,000 ตัวอักษร/เดือน; ทั้งบทใช้ราว 33,000 ตัวอักษร)
2. คัดลอก Key และ Region (เช่น `southeastasia`) ใส่ไฟล์ `.env.local` ที่ root ของโปรเจกต์ (ไฟล์นี้อยู่ใน .gitignore ห้าม commit):
   ```
   AZURE_SPEECH_KEY=xxxxxxxx
   AZURE_SPEECH_REGION=southeastasia
   ```
3. รัน `pnpm gen:voice` → ได้ `public/voice/<key>.mp3` และ `public/voice/index.json`
4. commit โฟลเดอร์ `public/voice/` แล้ว deploy

## เมื่อแก้ข้อความในบทเรียน
รัน `pnpm gen:voice` อีกครั้ง สคริปต์จะสร้างเฉพาะข้อความใหม่/ที่เปลี่ยน (ไฟล์เดิมเก็บไว้)
`pnpm gen:voice -- --dry-run` ดูจำนวนตัวอักษรที่จะส่งโดยไม่เรียก Azure

## ข้อมูลที่ส่งออกนอกเครื่อง
ส่งเฉพาะข้อความบทเรียนจากไฟล์ source ไป Azure ตอนรันสคริปต์เท่านั้น ไม่ส่งข้อมูลผู้เรียน และหน้าเว็บไม่เรียก Azure เลย

## ทางเทคนิค
- `scripts/voice-texts.mjs` เก็บข้อความไทยทั้งหมด (string + JSX text ใน `features/fake-hero`) และ `voiceKey()`
- `features/fake-hero/voice.ts` ต้องมี `norm()`/`voiceKey()` ตรงกัน (ตรวจใน `scripts/test-fake-hero.mjs` พร้อมตรวจว่าโจทย์/ตัวเลือกทุกข้อถูกเก็บ)
- `speak(parts)` ใน `vark.ts` เล่นทีละส่วน: มีไฟล์ → MP3, ไม่มี/โหลดไม่ได้ → เสียงเครื่อง
