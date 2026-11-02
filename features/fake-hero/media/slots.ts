// Every place in the story that can show an image/video.
// To show media, drop a file named after the slot id into /media (e.g. media/ep01-s02-1.webp).
// The text is used as alt text and in the ?slots overlay.
export const mediaSlots = {
  "ep01-s01": "Scene 01 · คลิปที่กำลังถูกแชร์",
  "ep01-s02a": "Scene 02 · ชาวบ้านสอบถามเจฟที่ริมแม่น้ำ",
  "ep01-s02b": "Scene 02 · ข้อความจากแม่ของเจฟ",
  "ep01-s02c": "Scene 02 · เจฟยอมรับว่าเทของเหลวลงท่อ แต่ยืนยันว่าไม่ใช่น้ำมัน",
  "ep01-a02": "Action A02 · สมุดหลักฐาน",
  "ep01-l01": "Scene 03 · ลูมชวนอ่านข้อมูลเคมี (Learn L01)",
  "ep01-c02-story": "Scene 04 · เรื่องเล่า C02",
  "ep01-c02-learn": "Learn L02 · บทเรียน C02",
  "ep01-c03-story": "Scene 05 · เรื่องเล่า C03",
  "ep01-c03-learn": "Learn L03 · บทเรียน C03",
  "ep01-c04-story": "Scene 06 · เรื่องเล่า C04",
  "ep01-c04-learn": "Learn L04 · บทเรียน C04",
  "ep01-c05-story": "Scene 07 · เรื่องเล่า C05",
  "ep01-c05-learn": "Learn L05 · บทเรียน C05",
  "ep01-s08": "Scene 08 · คราบแวววาวบนแม่น้ำ / สมุดหลักฐาน",
  "ep01-s09": "Scene 09 · ฮีโร่กำลังมา (เสียงเรือ / เรือเฮียศักดิ์ / ถังน้ำยา)",
  "loom-point": "ลูมชี้ / อธิบาย (PNG พื้นใส)",
  "loom-think": "ลูมคิด / บอกใบ้ (PNG พื้นใส)",
  "loom-cheer": "ลูมชื่นชม / ผ่าน (PNG พื้นใส)",
  "loom-happy": "ลูมยิ้ม / ทักทาย (PNG พื้นใส)",
  "loom-clipboard": "ลูมถือแฟ้มหลักฐาน (PNG พื้นใส)",
} as const;

export type MediaSlotId = keyof typeof mediaSlots;
