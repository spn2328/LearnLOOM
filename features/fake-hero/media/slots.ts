// Every place in the story that can show an image/video.
// To show media, drop a file named after the slot id into /media (e.g. media/ep01-s02-1.webp).
// The text is used as alt text and in the ?slots overlay.
export const mediaSlots = {
  "ep01-s01": "Scene 01 · เสียงแจ้งเตือนโทรศัพท์ คลิปที่กำลังถูกแชร์",
  "ep01-s01b": "Scene 01 · ลูมดูคลิปในโทรศัพท์ (เจอตัวแล้ว!)",
  "ep01-s01c": "Scene 01 · คราบบนแม่น้ำ…คือใครกันนะ?",
  "ep01-a01": "Action A01 · ภาพหลักฐาน (ท่อระบายน้ำ / ภาพรวมในคลิป / คราบบนแม่น้ำ)",
  "ep01-s02a": "Scene 02 · ชาวบ้านสอบถามเจฟที่ริมแม่น้ำ",
  "ep01-s02b": "Scene 02 · ข้อความจากแม่ของเจฟ",
  "ep01-s02c": "Scene 02 · เจฟยืนยันว่าไม่ได้เทน้ำมัน",
  "ep01-s02d": "Scene 02 · ลูมบอกว่าน้ำเชื่อมก็ไม่ควรเทลงท่อ",
  "ep01-a02": "Action A02 · บันทึกแฟ้มหลักฐาน",
  "ep01-a02b": "Action A02 · ลูมชวนอ่านข้อมูลทางเคมีของสาร",
  "ep01-l01": "Scene 03 · เปิดแฟ้ม CARBON CASE FILE",
  "ep01-l01b": "Scene 03 · สารประกอบอินทรีย์ที่พบในชีวิตประจำวัน",
  "ep01-c02-story": "Scene 04 · เรื่องเล่า C02",
  "ep01-c02-learn": "Learn L02 · บทเรียน C02",
  "ep01-c03-story": "Scene 05 · เรื่องเล่า C03",
  "ep01-c03-learn": "Learn L03 · บทเรียน C03",
  "ep01-c04-story": "Scene 06 · เรื่องเล่า C04",
  "ep01-c04-learn": "Learn L04 · บทเรียน C04",
  "ep01-c05-story": "Scene 07 · เรื่องเล่า C05",
  "ep01-c05-learn": "Learn L05 · บทเรียน C05",
  "ep01-s08": "Scene 08 · สมุดหลักฐาน รู้แล้ว / ยังต้องตรวจ",
  "ep01-s09": "Scene 09 · เรือเฮียศักดิ์แล่นเข้ามา",
  "ep01-s09b": "Scene 09 · ถังน้ำยา สูตรชีวภาพ รักษ์สายน้ำ",
  "ep01-end": "TO BE CONTINUED…",
  "loom-point": "ลูมชี้ / อธิบาย (PNG พื้นใส)",
  "loom-think": "ลูมคิด / บอกใบ้ (PNG พื้นใส)",
  "loom-cheer": "ลูมชื่นชม / ผ่าน (PNG พื้นใส)",
  "loom-happy": "ลูมยิ้ม / ทักทาย (PNG พื้นใส)",
  "loom-clipboard": "ลูมถือแฟ้มหลักฐาน (PNG พื้นใส)",
} as const;

export type MediaSlotId = keyof typeof mediaSlots;
