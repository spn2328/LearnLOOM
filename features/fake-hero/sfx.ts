// Tiny synthesized sound effects (Web Audio, no files, so they work offline). Quiet by default and
// switchable from the style dock; nothing plays until the learner has interacted with the page.
const KEY = "learnloom-sfx-v1";
let ctx: AudioContext | null = null;

export const sfxOn = () => { try { return localStorage.getItem(KEY) !== "off"; } catch { return true; } };
export function setSfx(on: boolean) { try { localStorage.setItem(KEY, on ? "on" : "off"); } catch {} }

const NOTES: Record<string, [number, number][]> = {
  xp: [[660, 0], [880, .09]],
  badge: [[523, 0], [659, .1], [784, .2], [1047, .3]],
  level: [[392, 0], [523, .12], [659, .24], [784, .36], [1047, .5]],
  quest: [[784, 0], [1175, .12]],
  card: [[440, 0], [554, .08], [659, .16]],
};

export function sfx(kind: keyof typeof NOTES) {
  if (!sfxOn() || typeof window === "undefined" || !("AudioContext" in window)) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const t0 = ctx.currentTime;
    NOTES[kind].forEach(([f, at]) => {
      const o = ctx!.createOscillator(), g = ctx!.createGain();
      o.type = "triangle"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0 + at);
      g.gain.exponentialRampToValueAtTime(0.08, t0 + at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + at + 0.28);
      o.connect(g).connect(ctx!.destination);
      o.start(t0 + at); o.stop(t0 + at + 0.3);
    });
  } catch {}
}
