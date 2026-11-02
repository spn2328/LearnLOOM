// R01–R05 adaptive data from เนื้อเรื่องและคำถามล่าสุด.pdf (pp.5-22).
// Prompts, correct answers, path text, practice/recheck items and transfer items are copied from
// the PDF. The PDF gives diagnostic questions with the correct answer only, so the WRONG options
// of every D item (and of D01-4) are DRAFTS for teacher review. adaptive04.ts is the older
// R04 prototype (แก้ไข.pdf), kept only so earlier saved progress still reads.
import type {Question} from "./episode01";
import type {PathId} from "./adaptive04";

export type Diag = Question & {group: "A" | "B" | "C"; code: string};
export type UnitPath = {name: string; level: string; lines: string[]};
// seenIn: a diagnostic item that already showed this structure; the next transfer is used instead.
export type Transfer = {id: string; prompt: string; answer?: string; structure?: string; seenIn?: string};
export type AdaptiveUnitData = {
  id: string; label: string; diagnosis: Diag[]; paths: Record<PathId, UnitPath>;
  practice: Question[]; recheck: Question; recheckB: Question; transfer: Transfer | Transfer[]; misconception: string;
};

const yesNo = (yes: string, no: string) => [yes, no];

export const adaptiveUnits: Record<string, AdaptiveUnitData> = {
  C01: {
    id: "C01", label: "R01 — Adaptive Diagnosis", misconception: "M01_ALL_CARBON_ORGANIC",
    diagnosis: [
      {id: "D01-1", prompt: "CO₂ มีคาร์บอน จึงต้องเป็นสารอินทรีย์เสมอ ใช่หรือไม่?", choices: yesNo("ใช่", "ไม่ใช่"), answer: "B", group: "B", code: "M01_ALL_CARBON_ORGANIC"},
      {id: "D01-2", prompt: "CH₃OH เป็นสารอินทรีย์หรืออนินทรีย์?", choices: ["อินทรีย์", "อนินทรีย์"], answer: "A", group: "A", code: "C01_BASIC_SORT"},
      {id: "D01-3", prompt: "Na₂CO₃ จัดเป็นสารอินทรีย์หรืออนินทรีย์?", choices: ["อินทรีย์", "อนินทรีย์"], answer: "B", group: "A", code: "C01_BASIC_SORT"},
      {id: "D01-4", prompt: "เพราะเหตุใดการมีคาร์บอนจึงยังไม่เพียงพอที่จะจัดสารทุกชนิดเป็นอินทรีย์?", choices: ["มีสารประกอบคาร์บอนบางกลุ่มที่จัดเป็นอนินทรีย์ตามการจำแนกทั่วไป", "เพราะสารอินทรีย์ต้องไม่มีออกซิเจน", "เพราะคาร์บอนพบได้เฉพาะในสารอนินทรีย์"], answer: "A", group: "C", code: "C01_TRANSFER"},
    ],
    paths: {
      A: {name: "Path A — ยังจำแนกตัวอย่างพื้นฐานไม่ได้", level: "Bloom L1", lines: ["ผู้เรียนตอบผิดทั้งการรู้จักสารตัวอย่างและการจัดประเภท", "ระบบเปิดบัตรสารทีละใบ ให้จับคู่ชื่อ สูตร และประเภท พร้อมฝึกแยก CH₄, CO₂ และ Na₂CO₃"]},
      B: {name: "Path B — เข้าใจว่ามีคาร์บอนแล้วต้องเป็นอินทรีย์", level: "Bloom L2", lines: ["ผู้เรียนรู้จักสูตร แต่ใช้กฎเหมารวมผิด", "ระบบให้เปรียบเทียบ CH₄ กับ CO₂ แล้วให้ผู้เรียนอธิบายว่าทำไมเกณฑ์ “มีคาร์บอน” เพียงข้อเดียวจึงใช้ไม่ได้"]},
      C: {name: "Path C — รู้หลักการแต่จำแนกชุดสารใหม่ผิด", level: "Bloom L3", lines: ["ผู้เรียนอธิบายข้อยกเว้นได้ แต่ยังนำไปจัดกลุ่มสารหลายชนิดไม่ถูกต้อง", "ระบบเปิดแฟ้มสารอีกชุด ให้จัดกลุ่มและให้เหตุผลโดยไม่แสดงคำใบ้ตั้งแต่เริ่ม"]},
      D: {name: "Path D — ขาดหลายแนวคิด", level: "Bloom L1 → L2 → L3", lines: ["ผู้เรียนมีหลักฐานผิดหลายส่วน ระบบเริ่มจากบัตรสารพื้นฐาน แล้วเปรียบเทียบข้อยกเว้นก่อนให้จำแนกสารชุดใหม่", "ตรวจความเข้าใจแต่ละช่วง และไม่ให้ทบทวนส่วนที่ผ่านแล้วซ้ำโดยไม่จำเป็น"]},
    },
    practice: [
      {id: "R01-1", prompt: "CH₄ จัดเป็นสารประเภทใด?", choices: ["อินทรีย์", "อนินทรีย์"], answer: "A"},
      {id: "R01-2", prompt: "CO₂ จัดเป็นสารประเภทใดตามการจำแนกทั่วไป?", choices: ["อินทรีย์", "อนินทรีย์"], answer: "B"},
    ],
    recheck: {id: "RC01", prompt: "ข้อใดเป็นสารประกอบอินทรีย์?", choices: ["CaCO₃", "CH₃OH", "CO₂"], answer: "B"},
    recheckB: {id: "RC01-B", prompt: "ข้อใดเป็นสารอนินทรีย์?", choices: ["CH₄", "C₂H₆", "NaHCO₃"], answer: "C"},
    transfer: {id: "RC01 · ยืนยันความเข้าใจ", prompt: "เหตุใด CO₂ จึงไม่ควรถูกจัดเป็นสารอินทรีย์เพียงเพราะมีธาตุคาร์บอน"},
  },
  C02: {
    id: "C02", label: "R02 — Diagnostic ที่ต้องใช้จริง", misconception: "M02_DOUBLE_BOND_ONE_PAIR",
    diagnosis: [
      {id: "D02-1", prompt: "= ระหว่างคาร์บอนสองอะตอมหมายถึงพันธะชนิดใด?", choices: ["พันธะเดี่ยว", "พันธะคู่", "พันธะสาม"], answer: "B", group: "A", code: "C02_BOND_SYMBOL"},
      {id: "D02-2", prompt: "C=C มีคู่อิเล็กตรอนที่ใช้ร่วมกันกี่คู่?", choices: ["1 คู่", "2 คู่", "3 คู่"], answer: "B", group: "B", code: "C02_SHARED_PAIRS"},
      {id: "D02-3", prompt: "ใน HC≡CH คาร์บอนทั้งสองใช้อิเล็กตรอนร่วมกันกี่คู่?", choices: ["1 คู่", "2 คู่", "3 คู่"], answer: "C", group: "C", code: "C02_TRANSFER"},
      {id: "D02-4", prompt: "ข้อใดถูกต้องระหว่าง “พันธะคู่เชื่อม C สองอะตอม” กับ “พันธะคู่หมายถึงเชื่อม C สี่อะตอม”?", choices: ["พันธะคู่เชื่อม C สองอะตอม", "พันธะคู่หมายถึงเชื่อม C สี่อะตอม"], answer: "A", group: "B", code: "C02_SHARED_PAIRS"},
    ],
    paths: {
      A: {name: "Path A — อ่านสัญลักษณ์ไม่ได้", level: "L1", lines: ["ตัวอย่าง: นักเรียนเห็น = แต่ระบุว่าเป็นพันธะสาม", "กิจกรรม: จับคู่เครื่องหมาย –, =, ≡ กับชื่อพันธะและโมเลกุลอ้างอิง แล้วทำโจทย์สั้นยืนยันว่าจำแนกสัญลักษณ์ได้", "เมื่อผ่านแล้วจึงตรวจความเข้าใจเรื่องจำนวนคู่อิเล็กตรอน ไม่ถือว่าผ่าน Concept ทั้งหมดจากการจำชื่อพันธะได้อย่างเดียว"]},
      B: {name: "Path B — เข้าใจคู่อิเล็กตรอนผิด", level: "L2", lines: ["ตัวอย่าง: นักเรียนรู้ว่า = เป็นพันธะคู่ แต่คิดว่ามีอิเล็กตรอนร่วมกันเพียง 1 คู่", "กิจกรรมแรก: ใช้แบบจำลองระดับอนุภาค แสดงอิเล็กตรอนร่วมกันหนึ่งคู่ในพันธะเดี่ยวเทียบกับสองคู่ในพันธะคู่", "หากยังไม่เข้าใจ: เปลี่ยนจากการสังเกตเป็นกิจกรรมให้ผู้เรียนจัดคู่ e⁻ ระหว่างคาร์บอน แล้วอธิบายจำนวนคู่อิเล็กตรอนที่จัดได้ด้วยตนเอง"]},
      C: {name: "Path C — เข้าใจทฤษฎีแต่ใช้กับโครงสร้างใหม่ไม่ได้", level: "L3", lines: ["ตัวอย่าง: นักเรียนตอบเรื่อง C=C ถูก แต่เมื่อพบ C≡C กลับบอกว่ามีอิเล็กตรอนร่วมกันสองคู่", "กิจกรรม: ให้เปลี่ยนระหว่างสูตรโครงสร้างและแบบจำลองคู่อิเล็กตรอนของสารหลายชนิด พร้อมอธิบายหลักการเดียวกัน"]},
      D: {name: "Path D — ผิดหลายแนวคิด", level: "L1 → L2 → L3", lines: ["ขั้นที่ 1: ระบุสัญลักษณ์พันธะ", "ขั้นที่ 2: สร้างแบบจำลองคู่อิเล็กตรอน", "ขั้นที่ 3: อ่านและแปลความหมายพันธะในโมเลกุลที่ยังไม่เคยฝึก", "มีจุดตรวจความเข้าใจระหว่างแต่ละขั้น โดยใช้ผลจริงในการตัดสินว่าต้องทบทวนส่วนใดเพิ่มเติม"]},
    },
    practice: [
      {id: "R02-1", prompt: "พันธะ C–C ใช้อิเล็กตรอนร่วมกันกี่คู่?", choices: ["1", "2", "3"], answer: "A"},
      {id: "R02-2", prompt: "พันธะ C≡C ใช้อิเล็กตรอนร่วมกันกี่คู่?", choices: ["1", "2", "3"], answer: "C"},
    ],
    recheck: {id: "RC02", prompt: "ใน CH₃–CH=CH₂ พันธะ C=C ใช้อิเล็กตรอนร่วมกันกี่คู่?", choices: ["1", "2", "3"], answer: "B"},
    recheckB: {id: "RC02-B", prompt: "ใน HC≡CH พันธะระหว่างคาร์บอนเป็นพันธะชนิดใด?", choices: ["เดี่ยว", "คู่", "สาม"], answer: "C"},
    transfer: {id: "R02 · กิจกรรมยืนยันเพิ่มเติม", prompt: "แสดงแบบจำลองพันธะของคาร์บอนที่ใช้ร่วมกัน 3 คู่ แล้วให้ผู้เรียนเลือกสัญลักษณ์แทนพันธะและอธิบายเหตุผล โดยไม่มีคำใบ้"},
  },
  C03: {
    id: "C03", label: "R03 — คำถามวินิจฉัย", misconception: "M03_ZIGZAG_IS_BRANCH",
    diagnosis: [
      {id: "D03-1", prompt: "CH₃–CH₂–CH₃ มีคาร์บอนแตกกิ่งหรือไม่?", choices: ["มี", "ไม่มี"], answer: "B", group: "A", code: "C03_BASIC_TYPE"},
      {id: "D03-2", prompt: "เมื่อวาดบิวเทนเป็นเส้นซิกแซกโดยไม่เปลี่ยนการเชื่อมต่อ ยังเป็นโซ่ไม่แตกกิ่งหรือไม่?", choices: ["เป็น", "ไม่เป็น"], answer: "A", group: "B", code: "M03_ZIGZAG_IS_BRANCH"},
      {id: "D03-3", prompt: "CH₃–CH(CH₃)–CH₃ มีคาร์บอนแตกกิ่งหรือไม่?", choices: ["มี", "ไม่มี"], answer: "A", group: "A", code: "C03_BASIC_TYPE"},
      {id: "D03-4", prompt: "โครงสร้างวงคาร์บอนสี่อะตอมมีจุดปลายสายโซ่เปิดอยู่หรือไม่?", choices: ["มี", "ไม่มี เพราะเป็นวงปิด"], answer: "B", group: "A", code: "C03_BASIC_TYPE"},
    ],
    paths: {
      A: {name: "Path A — จำแนกโครงสร้างพื้นฐานไม่ได้", level: "L1", lines: ["ให้จับคู่ภาพโซ่ตรง โซ่กิ่ง และวงกับชื่อประเภท จากนั้นระบุลักษณะที่ใช้แยกประเภท"]},
      B: {name: "Path B — เข้าใจว่าซิกแซกคือโซ่กิ่ง", level: "L2", lines: ["ให้สังเกตโครงสร้างเดียวกันจากหลายมุม เปรียบเทียบการวาดเป็นเส้นตรงกับซิกแซก แล้วชี้ตำแหน่งที่มีหรือไม่มีคาร์บอนแตกกิ่งจริง"]},
      C: {name: "Path C — จำแนกตัวอย่างได้ แต่สร้างโครงสร้างไม่ถูก", level: "L3", lines: ["ให้ผู้เรียนลงมือสร้างโมเลกุลตามเงื่อนไข เช่น “สร้างโซ่กิ่งที่มีคาร์บอนรวมสี่อะตอม” แล้วตรวจการเชื่อมต่อ"]},
      D: {name: "Path D — สับสนหลายประเภท", level: "L1 → L2 → L3", lines: ["เริ่มจากระบุโครงสร้างพื้นฐาน เปรียบเทียบรูปแบบการเชื่อมต่อ แล้วให้ลงมือสร้างโครงสร้างด้วยตนเอง โดยตรวจผลระหว่างแต่ละขั้น"]},
    },
    practice: [
      {id: "R03-1", prompt: "CH₃–CH₂–CH₃ มีโครงสร้างแบบใด?", choices: ["โซ่ตรง", "โซ่กิ่ง", "วง"], answer: "A"},
      {id: "R03-2", prompt: "โครงสร้างคาร์บอนรูปห้าเหลี่ยมที่เชื่อมต่อกันเป็นวงปิด จัดเป็นแบบใด?", choices: ["โซ่ตรง", "โซ่กิ่ง", "วง"], answer: "C"},
    ],
    recheck: {id: "RC03", prompt: "CH₃–CH₂–CH(CH₃)–CH₃ มีโครงสร้างแบบใด?", choices: ["โซ่ตรง", "โซ่กิ่ง", "วง"], answer: "B"},
    recheckB: {id: "RC03-B", prompt: "ไซโคลเพนเทนมีโครงสร้างคาร์บอนแบบใด?", choices: ["โซ่ตรง", "โซ่กิ่ง", "วง"], answer: "C"},
    transfer: {id: "R03 · Transfer เพิ่มเติม", prompt: "ผู้เรียนได้รับแบบจำลองคาร์บอนห้าอะตอมที่หมุนได้ และต้องระบุว่ามีคาร์บอนแตกกิ่งหรือไม่ พร้อมแตะตำแหน่งที่ใช้เป็นหลักฐานในการตัดสิน"},
  },
  C04: {
    id: "C04", label: "R04 — Diagnostic Check", misconception: "M04_BOND_ORDER",
    diagnosis: [
      {id: "D04-1", prompt: "= คือพันธะชนิดใด?", choices: ["พันธะเดี่ยว", "พันธะคู่", "พันธะสาม"], answer: "B", group: "A", code: "C04_BOND_SYMBOL"},
      {id: "D04-2", prompt: "C=C ใช้อิเล็กตรอนร่วมกันกี่คู่?", choices: ["1 คู่", "2 คู่", "3 คู่"], answer: "B", group: "B", code: "C04_BOND_ORDER"},
      {id: "D04-3", prompt: "ใน CH₂=CH₂ คาร์บอนหนึ่งอะตอมเชื่อมโดยตรงกับอะตอมอื่นกี่อะตอม?", choices: ["2 อะตอม", "3 อะตอม", "4 อะตอม"], answer: "B", group: "C", code: "C04_COUNT_BONDS"},
      {id: "D04-4", prompt: "ใน CH₃–CH=CH₂ คาร์บอน CH ตรงกลางมีพันธะ C–H กี่พันธะ?", choices: ["0 พันธะ", "1 พันธะ", "2 พันธะ"], answer: "B", group: "C", code: "C04_COUNT_CH"},
      {id: "D04-5", prompt: "ใน CH₃–C(?)=CH₂ ต้องเติม H บนคาร์บอนตรงกลางกี่อะตอม?", choices: ["0 อะตอม", "1 อะตอม", "2 อะตอม"], answer: "B", group: "C", code: "C04_FILL_H"},
    ],
    paths: {
      A: {name: "Path A — ไม่รู้จักสัญลักษณ์พันธะ", level: "Bloom L1 → L2", lines: ["กิจกรรมแรก — Bond Symbol Match", "ผู้เรียนได้รับสัญลักษณ์ –, =, ≡ และบัตรชื่อพันธะ แล้วต้องจับคู่ให้ตรงกัน", "ตรวจระหว่างกิจกรรม: ให้ดู CH₂=CH₂ แล้วตอบว่าพันธะระหว่าง C เป็นชนิดใด", "หากยังผิด ระบบเปลี่ยนเป็นแบบจำลองแสดงจำนวนคู่อิเล็กตรอนและให้เชื่อมกลับไปยังสัญลักษณ์", "หากผ่าน จะตรวจความเข้าใจ L2 แล้วจึงเข้าสู่โจทย์ประยุกต์ L3", "การระบุสัญลักษณ์ถูกเพียงอย่างเดียวไม่ถือว่าผ่านเป้าหมาย Q04"]},
      B: {name: "Path B — เข้าใจอันดับพันธะคู่ผิด", level: "Bloom L2 → L3", lines: ["กิจกรรมแรก — Electron Pair Explorer", "ผู้เรียนแตะพันธะเดี่ยวแล้วเห็นคู่อิเล็กตรอนร่วมกันหนึ่งคู่ จากนั้นแตะพันธะคู่แล้วเปรียบเทียบกับสองคู่", "คำถามระหว่างกิจกรรม: “C=C มีอันดับพันธะเท่าใด และเพราะอะไร?”", "ถ้ายังตอบผิด เปลี่ยนเป็น Build a Double Bond ให้ลากคู่อิเล็กตรอนสองคู่มาจัดเป็นพันธะคู่ด้วยตนเอง", "จากนั้นกลับไปใช้หลักการกับโครงสร้างโมเลกุลใหม่"]},
      C: {name: "Path C — เข้าใจหลักการ แต่ตรวจพันธะไม่ครบ", level: "Bloom L3", lines: ["กิจกรรมแรก — Carbon Bond Highlighter", "ผู้เรียนต้องแตะพันธะที่เชื่อมกับคาร์บอนเป้าหมายทั้งหมด", "ระบบแสดงว่ามีพันธะ C–C, C=C และ C–H ที่ต้องพิจารณา แต่ยังไม่บอกผลรวมอันดับพันธะให้ทันที", "ตรวจระหว่างกิจกรรม: ให้ผู้เรียนเลือกพันธะทีละตำแหน่งและรวมอันดับพันธะเอง", "หากยังผิด เปลี่ยนเป็น Molecular Repair โดยให้เติม H ในโครงสร้างที่ยังไม่สมบูรณ์ แล้วอธิบายวิธีคิด"]},
      D: {name: "Path D — ขาดความรู้หลายส่วน", level: "Bloom L1 → L2 → L3", lines: ["กิจกรรมแบบขั้นบันได", "1. L1 — Bond Identification: จับคู่ชนิดพันธะกับสัญลักษณ์", "2. L2 — Electron Pair Explanation: สร้างและอธิบายพันธะเดี่ยว คู่ สาม", "3. L3 — Carbon Valence Checker: นับอันดับพันธะในโครงสร้างอย่างง่าย", "4. L3 — Molecular Repair: เติมพันธะหรือไฮโดรเจนที่หายไปในโครงสร้างใหม่", "หากผ่านขั้น L1 แต่ไม่ผ่าน L2 ระบบจะช่วยเฉพาะ L2 ต่อ ไม่ย้อนกลับไปเริ่ม L1 โดยไม่มีเหตุจำเป็น"]},
    },
    practice: [
      {id: "R04-1", prompt: "ใน CH₄ คาร์บอนสร้างพันธะเดี่ยวกับ H กี่พันธะ?", choices: ["2", "3", "4"], answer: "C"},
      {id: "R04-2", prompt: "ใน CH₂=CH₂ คาร์บอนแต่ละอะตอมมีผลรวมอันดับพันธะเท่าใด?", choices: ["2", "3", "4"], answer: "C"},
    ],
    recheck: {id: "RC04", prompt: "ใน CH₃–CH=CH₂ คาร์บอนตำแหน่ง CH ตรงกลางมีผลรวมอันดับพันธะเท่าใด?", choices: ["2", "3", "4"], answer: "C"},
    recheckB: {id: "RC04-B", prompt: "ใน HC≡CH คาร์บอนแต่ละอะตอมมีผลรวมอันดับพันธะเท่าใด?", choices: ["3", "4", "5"], answer: "B"},
    transfer: [
      {id: "TRANSFER T04-A · BLOOM L3 · ซ่อมโครงสร้างโมเลกุล", structure: "CH₃–C(?)=CH₂", seenIn: "D04-5", prompt: "ต้องเติม H กี่อะตอม และเพราะเหตุใด?", answer: "1 อะตอม เพราะมีพันธะเดี่ยวกับ C ด้านซ้ายอันดับ 1 และพันธะคู่กับ C ด้านขวาอันดับ 2 รวมเป็น 3 จึงต้องมีพันธะเดี่ยว C–H อีก 1"},
      {id: "TRANSFER T04-B · BLOOM L3 · ซ่อมโครงสร้างโมเลกุลใหม่", structure: "CH₃–C(?)≡CH", prompt: "ต้องเติม H กี่อะตอม และเพราะเหตุใด?", answer: "0 อะตอม เพราะมีพันธะเดี่ยวอันดับ 1 และพันธะสามอันดับ 3 รวมเป็น 4 อยู่แล้ว"},
    ],
  },
  C05: {
    id: "C05", label: "R05 — ระบบตรวจอะไรบ้าง?", misconception: "M05_FORMULA_COUNT",
    diagnosis: [
      {id: "D05-1", prompt: "CH₃ มี H กี่อะตอม?", choices: ["1", "3", "4"], answer: "B", group: "A", code: "C05_SUBSCRIPT"},
      {id: "D05-2", prompt: "ใน CH₂=CH–CH₃ มี C ทั้งหมดกี่อะตอม?", choices: ["2", "3", "4"], answer: "B", group: "C", code: "C05_COUNT_C"},
      {id: "D05-3", prompt: "ใน CH₂=CH–CH₃ มี H ทั้งหมดกี่อะตอม?", choices: ["6", "7", "8"], answer: "A", group: "C", code: "C05_COUNT_H"},
      {id: "D05-4", prompt: "CH₃–CH₃ และ CH₂=CH₂ มีจำนวน H เท่ากันหรือไม่?", choices: ["เท่ากัน", "ไม่เท่ากัน"], answer: "B", group: "B", code: "C05_BOND_H"},
      {id: "D05-5", prompt: "ใน CH₃–C≡CH คาร์บอนตรงกลางมี H หรือไม่?", choices: ["มี", "ไม่มี"], answer: "B", group: "B", code: "C05_BOND_H"},
    ],
    paths: {
      A: {name: "Path A — อ่านตัวห้อยหรือจำนวนอะตอมไม่ได้", level: "L1", lines: ["ผู้เรียนอาจอ่าน CH₃ ว่ามีไฮโดรเจนหนึ่งอะตอม หรือไม่เข้าใจว่าตัวห้อยบอกจำนวนอะตอม", "กิจกรรม: Atom Counter ให้แยกจำนวน C และ H ของแต่ละกลุ่มก่อน แล้วค่อยรวมเป็นสูตรโมเลกุล"]},
      B: {name: "Path B — เข้าใจความสัมพันธ์ระหว่างพันธะกับจำนวน H ผิด", level: "L2", lines: ["ผู้เรียนอาจใช้สูตร CₙH₂ₙ₊₂ กับสารทุกชนิดที่มีคาร์บอนและไฮโดรเจน แม้โครงสร้างมีพันธะคู่หรือพันธะสาม", "กิจกรรม: เปรียบเทียบบิวเทน CH₃–CH₂–CH₂–CH₃ กับบิวต์-1-อีน CH₂=CH–CH₂–CH₃ ผ่านแบบจำลองและสูตรโครงสร้าง เพื่อดูว่าจำนวน H ต่างกันอย่างไร", "ข้อนี้ไม่จำเป็นต้องสอนสูตรทั่วไปของสารทุกกลุ่มอย่างละเอียด เพราะ EP.01 ยังเน้นการอ่านโครงสร้างและนับอะตอม"]},
      C: {name: "Path C — รู้วิธีนับ แต่ข้ามบางกลุ่ม", level: "L3", lines: ["ผู้เรียนอ่าน CH₃, CH₂, CH ได้ แต่เมื่อนับโครงสร้างยาวขึ้นกลับข้ามตำแหน่งหรือรวมจำนวนผิด", "กิจกรรม: Formula Decoder แบบไฮไลต์ทีละกลุ่ม โดยบังคับให้ผู้เรียนเลือกกลุ่มที่ตนนับแล้ว เพื่อป้องกันการนับซ้ำหรือข้ามตำแหน่ง"]},
      D: {name: "Path D — มีปัญหาทั้งการอ่านสูตรและการเข้าใจพันธะ", level: "L1 → L2 → L3", lines: ["ระบบใช้ข้อมูลจาก Q02, Q04 และ D05 เพื่อเลือกจุดเริ่มต้น", "หากยังอ่านตัวห้อยไม่ได้ เริ่มที่ L1 แต่หากอ่านตัวห้อยได้แล้วและติดเรื่องจำนวน H รอบคาร์บอน จะข้าม L1 ไปช่วยเรื่อง L2–L3 แทน"]},
    },
    practice: [
      {id: "R05-1", prompt: "CH₃–CH₃ มีสูตรโมเลกุลใด?", choices: ["C₂H₆", "C₂H₄", "CH₃"], answer: "A"},
      {id: "R05-2", prompt: "HC≡CH มีสูตรโมเลกุลใด?", choices: ["C₂H₆", "C₂H₄", "C₂H₂"], answer: "C"},
    ],
    recheck: {id: "RC05", prompt: "CH₂=CH–CH₃ มีสูตรโมเลกุลใด?", choices: ["C₃H₈", "C₃H₆", "C₃H₄"], answer: "B"},
    recheckB: {id: "RC05-B", prompt: "CH₃–CH₂–C≡CH มีสูตรโมเลกุลใด?", choices: ["C₄H₆", "C₄H₈", "C₄H₁₀"], answer: "A"},
    transfer: {id: "T05-A", prompt: "กำหนด CH₃–CH₂–CH=CH₂ ให้ผู้เรียนระบุจำนวน C และ H พร้อมแสดงการนับแต่ละกลุ่ม", answer: "C₄H₈ โดยมี H = 3 + 2 + 1 + 2 = 8"},
  },
};

// First transfer item whose structure the learner has not already met in the diagnosis (PDF p.18).
export function pickTransfer(unit: AdaptiveUnitData, answers: Record<string, string>): Transfer {
  const list = Array.isArray(unit.transfer) ? unit.transfer : [unit.transfer];
  return list.find(t => !t.seenIn || !answers[t.seenIn]) ?? list[list.length - 1];
}

// Path from the diagnostic groups that were answered wrongly: one group -> that path,
// two or more groups -> D, none wrong (knows the parts but missed the main question) -> C.
export function pickPath(unit: AdaptiveUnitData, answers: Record<string, string>): PathId {
  const wrong = new Set(unit.diagnosis.filter(d => answers[d.id] && answers[d.id] !== d.answer).map(d => d.group));
  if (wrong.size >= 2) return "D";
  return ([...wrong][0] as PathId | undefined) ?? "C";
}
