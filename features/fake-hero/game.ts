// Game layer: XP, levels, stars and badges derived from the saved result (never stored on its own,
// so replaying a page cannot farm XP and the numbers always match what the teacher sees).
import type {StudentResult} from "./results";

export type VarkKey = "V" | "A" | "R" | "K";
export type VarkUse = Partial<Record<VarkKey, number>>;
export type XpPart = {label: string; xp: number};
export type Badge = {id: string; icon: string; name: string; desc: string; got: boolean};

export const LEVELS: [number, string][] = [
  [0, "นักสืบฝึกหัด"], [60, "ผู้ช่วยนักสืบ"], [150, "นักสืบเคมี"], [260, "นักสืบอาวุโส"], [380, "ยอดนักสืบ"], [480, "ฮีโร่ตัวจริง"],
];

// 3 = right answer and reason on the first try, 2 = passed after help, 1 = tried, still reviewing
export function starsOf(c: StudentResult["concepts"][number]): number {
  return c.outcome === "ผ่านด้วยตนเอง" ? 3 : c.outcome === "ผ่านหลังช่วยเหลือ" ? 2 : c.outcome === "ยังต้องทบทวน" ? 1 : 0;
}

export function xpOf(r: StudentResult): {xp: number; parts: XpPart[]} {
  const parts: XpPart[] = [];
  r.concepts.forEach(c => {
    const s = starsOf(c);
    if (s) parts.push({label: `${c.id} ${s === 1 ? "ลองตอบแล้ว สู้ต่อ!" : c.outcome}`, xp: [0, 10, 25, 40][s]});
    // effort counts too: trying another form of help after a mistake
    const sw = Math.min(c.helpSwitches?.length ?? 0, 2);
    if (sw) parts.push({label: `${c.id} ไม่ยอมแพ้ (เปลี่ยนวิธีช่วย)`, xp: sw * 5});
    if (c.transfer) parts.push({label: `${c.id} ยืนยันความเข้าใจ`, xp: 10});
  });
  if (r.checkpoint.score) parts.push({label: `Checkpoint ${r.checkpoint.score}/10`, xp: r.checkpoint.score * 12});
  if (r.transfer) parts.push({label: "Transfer Checkpoint", xp: 30});
  if (r.finished) parts.push({label: "ปิดคดี EP.01", xp: 60});
  return {xp: parts.reduce((n, p) => n + p.xp, 0), parts};
}

export function levelOf(xp: number) {
  let i = 0;
  while (i < LEVELS.length - 1 && xp >= LEVELS[i + 1][0]) i++;
  const at = LEVELS[i][0], next = LEVELS[i + 1]?.[0];
  return {level: i + 1, name: LEVELS[i][1], at, next, pct: next ? Math.round((xp - at) / (next - at) * 100) : 100};
}

export function badgesOf(r: StudentResult, use: VarkUse = {}): Badge[] {
  const tried = r.concepts.filter(c => c.outcome !== "ยังไม่ได้ทำ");
  const first = r.concepts.filter(c => c.firstCorrect).length;
  return [
    {id: "start", icon: "🔍", name: "เปิดแฟ้มคดีแรก", desc: "ตอบคำถามหลักข้อแรก", got: tried.length > 0},
    {id: "sharp", icon: "🎯", name: "ตาไว", desc: "ถูกทั้งคำตอบและเหตุผลตั้งแต่ครั้งแรก 3 แนวคิด", got: first >= 3},
    {id: "grit", icon: "💪", name: "ไม่ยอมแพ้", desc: "ผ่านแนวคิดหลังลองวิธีช่วยแบบใหม่", got: r.concepts.some(c => c.helpSwitches?.length && c.recheckCorrect)},
    {id: "comeback", icon: "🌱", name: "เข้าใจแล้ว!", desc: "ผ่านการตรวจซ้ำหลังได้รับความช่วยเหลือ", got: r.concepts.some(c => c.outcome === "ผ่านหลังช่วยเหลือ")},
    {id: "transfer", icon: "🌉", name: "นักคิดข้ามสถานการณ์", desc: "ตอบ Transfer ด้วยเหตุผลของตัวเอง", got: !!r.transfer || r.concepts.some(c => !!c.transfer)},
    {id: "checkpoint", icon: "🏅", name: "ผ่าน Checkpoint", desc: "ได้ 7/10 ขึ้นไป", got: r.checkpoint.score >= 7},
    {id: "vark", icon: "🎨", name: "ครบทุกสไตล์", desc: "ลองเรียนทั้ง ภาพ ฟัง อ่าน และลงมือทำ", got: (["V", "A", "R", "K"] as const).every(k => (use[k] ?? 0) > 0)},
    {id: "closed", icon: "🦸", name: "ปิดคดี EP.01", desc: "เรียนจบตอนแรก", got: r.finished},
  ];
}
