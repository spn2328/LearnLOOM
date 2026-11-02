// Ball-and-stick models for the EP.01 lessons. Only heavy atoms are listed; hydrogens are added
// from each carbon/oxygen's remaining valence so every model stays chemically consistent.
export type Element = "C" | "H" | "O" | "Na";
export type Atom = {el: Element; p: [number, number, number]};
export type Bond = [number, number, 1 | 2 | 3];
export type Molecule = {atoms: Atom[]; bonds: Bond[]};
type Spec = {atoms: [Element, number, number, number][]; bonds: Bond[]; flat?: boolean};

const valence: Partial<Record<Element, number>> = {C: 4, O: 2};
type V = [number, number, number];
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V, k: number): V => [a[0] * k, a[1] * k, a[2] * k];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]) || 1;
const unit = (a: V) => mul(a, 1 / len(a));
const cross = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const perp = (d: V): V => unit(Math.abs(d[2]) < 0.9 ? cross(d, [0, 0, 1]) : cross(d, [1, 0, 0]));

// Directions for the missing hydrogens, given unit vectors to existing neighbours.
function hydrogenDirs(nb: V[], n: number, multiple: number, flat: boolean): V[] {
  if (n <= 0) return [];
  if (nb.length === 0) { // CH4-like centre
    const t: V[] = [[1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]];
    return t.slice(0, n).map(unit);
  }
  const back = unit(mul(nb.reduce(add, [0, 0, 0] as V), -1));
  if (multiple >= 2) return [back]; // linear (triple bond)
  if (multiple === 1) { // trigonal planar
    if (n === 1) return [back];
    const side = perp(nb[0]);
    const c = Math.cos(Math.PI / 3), s = Math.sin(Math.PI / 3);
    return [unit(add(mul(back, c), mul(side, s))), unit(add(mul(back, c), mul(side, -s)))];
  }
  // tetrahedral
  if (n === 1 && nb.length === 1) { // bent, e.g. O–H in CH3OH
    const t = 109.5 * Math.PI / 180, d = nb[0], side = unit(cross(cross(d, [0, 0, 1]), d));
    return [unit(add(mul(d, Math.cos(t)), mul(side, Math.sin(t))))];
  }
  if (n === 1) return [back];
  if (n === 2) {
    const side = unit(cross(nb[0], nb[1]));
    const a = (109.5 / 2) * Math.PI / 180;
    return [unit(add(mul(back, Math.cos(a)), mul(side, Math.sin(a)))), unit(add(mul(back, Math.cos(a)), mul(side, -Math.sin(a))))];
  }
  // one neighbour, three H: cone around -d, with one H in the drawing plane for a clean 2D view
  const d = nb[0], up = flat ? unit(cross(cross(d, [0, 0, 1]), d)) : perp(d);
  const w = unit(cross(d, up)), t = 109.5 * Math.PI / 180;
  return [0, 120, 240].map(deg => {
    const r = deg * Math.PI / 180;
    const ring = add(mul(up, Math.cos(r)), mul(w, Math.sin(r)));
    return unit(add(mul(d, Math.cos(t)), mul(ring, Math.sin(t))));
  });
}

function build(spec: Spec): Molecule {
  const atoms: Atom[] = spec.atoms.map(([el, x, y, z]) => ({el, p: [x, y, z]}));
  const bonds: Bond[] = [...spec.bonds];
  spec.atoms.forEach(([el], i) => {
    const v = valence[el];
    if (!v) return;
    const mine = spec.bonds.filter(b => b[0] === i || b[1] === i);
    const used = mine.reduce((s, b) => s + b[2], 0);
    const multiple = Math.max(0, ...mine.map(b => b[2] - 1));
    const nb = mine.map(b => unit(sub(atoms[b[0] === i ? b[1] : b[0]].p, atoms[i].p)));
    const dist = el === "O" ? 0.96 : 1.09;
    for (const d of hydrogenDirs(nb, v - used, multiple, spec.flat ?? true)) {
      atoms.push({el: "H", p: add(atoms[i].p, mul(d, dist))});
      bonds.push([i, atoms.length - 1, 1]);
    }
  });
  return {atoms, bonds};
}

const zig = (n: number): [Element, number, number, number][] =>
  Array.from({length: n}, (_, i) => ["C", (i - (n - 1) / 2) * 1.27, i % 2 ? 0.42 : -0.42, 0]);
const chain = (n: number, orders: (1 | 2 | 3)[] = []): Bond[] =>
  Array.from({length: n - 1}, (_, i) => [i, i + 1, orders[i] ?? 1]);
const tet = (k: number): V => unit(([[1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]] as V[])[k]);

const specs = {
  CH4: {atoms: [["C", 0, 0, 0]], bonds: [], flat: false},
  C2H6: {atoms: [["C", -0.77, 0, 0], ["C", 0.77, 0, 0]], bonds: [[0, 1, 1]], flat: false},
  CH3OH: {atoms: [["C", -0.71, 0, 0], ["O", 0.71, 0, 0]], bonds: [[0, 1, 1]], flat: false},
  CO2: {atoms: [["C", 0, 0, 0], ["O", -1.16, 0, 0], ["O", 1.16, 0, 0]], bonds: [[0, 1, 2], [0, 2, 2]]},
  Na2CO3: {atoms: [["C", 0, 0, 0], ["O", 0, 1.28, 0], ["O", -1.11, -0.64, 0], ["O", 1.11, -0.64, 0], ["Na", -2.4, -0.9, 0], ["Na", 2.4, -0.9, 0]], bonds: [[0, 1, 2], [0, 2, 1], [0, 3, 1]]},
  C2H4: {atoms: [["C", -0.67, 0, 0], ["C", 0.67, 0, 0]], bonds: [[0, 1, 2]]},
  C2H2: {atoms: [["C", -0.6, 0, 0], ["C", 0.6, 0, 0]], bonds: [[0, 1, 3]]},
  butane: {atoms: zig(4), bonds: chain(4)},
  isobutane: {atoms: [["C", 0, 0, 0], ...[0, 1, 2].map(k => ["C", ...mul(tet(k), 1.53)] as [Element, number, number, number])], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]], flat: false},
  cyclobutane: {atoms: [["C", -0.78, -0.78, 0.1], ["C", 0.78, -0.78, -0.1], ["C", 0.78, 0.78, 0.1], ["C", -0.78, 0.78, -0.1]], bonds: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 0, 1]], flat: false},
  cyclohexane: {atoms: Array.from({length: 6}, (_, k) => ["C", 1.46 * Math.cos(k * Math.PI / 3), 1.46 * Math.sin(k * Math.PI / 3), k % 2 ? 0.25 : -0.25] as [Element, number, number, number]), bonds: Array.from({length: 6}, (_, k) => [k, (k + 1) % 6, 1] as Bond), flat: false},
  propene: {atoms: zig(3), bonds: chain(3, [1, 2])},
  but2ene: {atoms: zig(4), bonds: chain(4, [1, 2, 1])},
  propyne: {atoms: [["C", -1.46, 0, 0], ["C", 0, 0, 0], ["C", 1.2, 0, 0]], bonds: chain(3, [1, 3])},
  but1ene: {atoms: zig(4), bonds: chain(4, [2, 1, 1])},
} satisfies Record<string, Spec>;

export type MoleculeId = keyof typeof specs;
const cache = new Map<MoleculeId, Molecule>();
export function molecule(id: MoleculeId): Molecule {
  if (!cache.has(id)) cache.set(id, build(specs[id] as Spec));
  return cache.get(id)!;
}

export const atomColor: Record<Element, string> = {C: "#2f3432", H: "#f4f4f1", O: "#d8433b", Na: "#8a55c9"};
export const atomRadius: Record<Element, number> = {C: 0.36, H: 0.24, O: 0.36, Na: 0.5};
