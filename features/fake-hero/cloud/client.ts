// Supabase connection. Only the public URL + anon key reach the browser; every permission is
// checked by Row Level Security in supabase/migrations. Without these env vars the site stays local-only.
import {createClient, type SupabaseClient} from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const cloudEnabled = !!(url && anonKey);
export const supabase: SupabaseClient | null = cloudEnabled
  ? createClient(url!, anonKey!, {auth: {persistSession: true, autoRefreshToken: true, storageKey: "learnloom-auth"}})
  : null;

export type CloudProfile = {id: string; nickname: string; role: "student" | "teacher"};
export type Classroom = {id: string; name: string; join_code: string; teacher_id: string};

export function thaiError(e: unknown): string {
  const m = e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? String((e as {message: unknown}).message) : String(e);
  if (/Invalid login credentials/i.test(m)) return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  if (/already registered|already been registered/i.test(m)) return "อีเมลนี้มีบัญชีแล้ว ลองเข้าสู่ระบบแทน";
  if (/Password should be at least/i.test(m)) return "รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร";
  if (/Email not confirmed/i.test(m)) return "ยังไม่ได้ยืนยันอีเมล กรุณาเปิดลิงก์ในอีเมลก่อน";
  if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return "เชื่อมต่ออินเทอร์เน็ตไม่ได้";
  if (/students only/i.test(m)) return "บัญชีครูเข้าร่วมห้องในฐานะนักเรียนไม่ได้";
  return "เกิดข้อผิดพลาด: " + m;
}
