// Q04 adaptive flow (owner flowchart, แก้ไข.pdf p.1). D01–D04 prompts and the RC04 prompt come
// from the flowchart; their choices, the path pages, mid-checks and Recheck-B are DRAFTS that
// still need teacher review.
import type {Choice, Question} from "./episode01";

export type PathId = "A" | "B" | "C" | "D";

export const diagnosis: (Question & {bloom: string; misconception: string})[] = [
  {id: "D01", prompt: "เครื่องหมาย = ระหว่างคาร์บอนสองอะตอมหมายถึงพันธะชนิดใด?", choices: ["พันธะเดี่ยว", "พันธะคู่", "พันธะสาม", "พันธะไอออนิก"], answer: "B", bloom: "L1 จำ", misconception: "อ่านสัญลักษณ์พันธะไม่ได้"},
  {id: "D02", prompt: "พันธะคู่ C=C มีอันดับพันธะเท่าใด?", choices: ["1", "2", "3", "4"], answer: "B", bloom: "L2 เข้าใจ", misconception: "นับพันธะคู่เป็นอันดับพันธะ 1"},
  {id: "D03", prompt: "ใน CH₂=CH₂ คาร์บอนหนึ่งอะตอมเชื่อมโดยตรงกับอะตอมอื่นกี่อะตอม และมีผลรวมอันดับพันธะเท่าใด?", choices: ["2 อะตอม · ผลรวม 3", "3 อะตอม · ผลรวม 3", "3 อะตอม · ผลรวม 4", "4 อะตอม · ผลรวม 4"], answer: "C", bloom: "L2 เข้าใจ", misconception: "สับสนจำนวนอะตอมที่เชื่อมกับผลรวมอันดับพันธะ"},
  {id: "D04", prompt: "ใน CH₃–CH=CH₂ คาร์บอนตำแหน่ง CH มีพันธะ C–H กี่พันธะ?", choices: ["0", "1", "2", "3"], answer: "B", bloom: "L3 นำไปใช้", misconception: "อ่าน H ในสูตรย่อไม่ครบ"},
];

/** Cause → help path, following the flowchart branches. */
export function choosePath(a: Record<string, Choice | undefined>): PathId {
  const wrong = diagnosis.filter(d => a[d.id] !== d.answer).map(d => d.id);
  if (wrong.includes("D01")) return "A";        // ขาดพื้นฐาน
  if (wrong.length >= 2) return "D";            // ผิดหลายแนวคิด
  if (wrong.includes("D02")) return "B";        // เข้าใจหลักการผิด
  return "C";                                   // ใช้ความรู้ไม่ถูก
}

export const paths: Record<PathId, {name: string; level: string; cause: string}> = {
  A: {name: "Path A · พื้นฐานสัญลักษณ์", level: "L1", cause: "ขาดพื้นฐาน"},
  B: {name: "Path B · แบบจำลองอธิบาย", level: "L2", cause: "เข้าใจหลักการผิด"},
  C: {name: "Path C · ฝึกประยุกต์", level: "L3", cause: "ใช้ความรู้ไม่ถูก"},
  D: {name: "Path D · ขั้นบันได", level: "L1→L2→L3", cause: "ผิดหลายแนวคิด"},
};

/** Check during the activity ("เข้าใจ Concept ย่อยแล้ว?"). */
export const midCheck: Record<PathId, Question> = {
  A: {id: "M04-A", prompt: "เครื่องหมาย = ระหว่างคาร์บอนคือพันธะชนิดใด และมีอันดับพันธะเท่าใด?", choices: ["พันธะเดี่ยว · อันดับ 1", "พันธะคู่ · อันดับ 2", "พันธะคู่ · อันดับ 1", "พันธะสาม · อันดับ 3"], answer: "B"},
  B: {id: "M04-B", prompt: "จากแบบจำลอง C=C ใช้อิเล็กตรอนร่วมกันกี่คู่?", choices: ["1 คู่", "2 คู่", "3 คู่", "4 คู่"], answer: "B"},
  C: {id: "M04-C", prompt: "ใน CH₃–CH₂–CH₃ คาร์บอนตรงกลางมีผลรวมอันดับพันธะกับคาร์บอนเท่าใด และต้องมี H กี่อะตอม?", choices: ["1 · H 3 อะตอม", "2 · H 2 อะตอม", "2 · H 1 อะตอม", "3 · H 1 อะตอม"], answer: "B"},
  D: {id: "M04-D", prompt: "ใน CH₂=CH–CH₃ คาร์บอนตรงกลางมีผลรวมอันดับพันธะกับคาร์บอนเท่าใด?", choices: ["2", "3", "4", "1"], answer: "B"},
};

export const recheckB: Question = {
  id: "RC04-B",
  prompt: "โครงสร้าง CH₂=CH–C(?)–CH₃ คาร์บอนที่มีเครื่องหมาย ? ต้องมีไฮโดรเจนกี่อะตอม?",
  choices: ["0 อะตอม", "1 อะตอม", "2 อะตอม", "3 อะตอม"],
  answer: "C",
};

export const hintLevel2 = [
  "ขั้นที่ 1 ดูเฉพาะพันธะที่ต่อกับคาร์บอนตัวที่มี ?",
  "ขั้นที่ 2 พันธะเดี่ยว (–) นับ 1 · พันธะคู่ (=) นับ 2 · พันธะสาม (≡) นับ 3",
  "ขั้นที่ 3 คาร์บอนต้องมีผลรวมอันดับพันธะเท่ากับ 4 ส่วนที่ยังขาดคือจำนวน H",
];

export const fullExplanation = "ใน CH₃–CH₂–C(?)=CH₂ คาร์บอนตัวที่มี ? ต่อกับ CH₂ ด้วยพันธะเดี่ยว (1) และต่อกับ =CH₂ ด้วยพันธะคู่ (2) รวมเป็น 3 จึงต้องมี H อีก 1 อะตอม ส่วนใน CH₂=CH–C(?)–CH₃ คาร์บอนตัวที่มี ? มีพันธะเดี่ยวกับคาร์บอน 2 พันธะ (รวม 2) จึงต้องมี H 2 อะตอม พันธะคู่ที่อยู่ไกลออกไปไม่นับรวม";
