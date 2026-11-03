"use client";
// Cute 2.5D icons (owner reference: Design System v2). Same names and props as the lucide icons they replace,
// so call sites keep their size and position; each draws a darker bottom edge, a soft gradient body and a top shine.
import {useId, type ReactNode, type SVGProps} from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "fill" | "children"> & {size?: number | string; fill?: string; strokeWidth?: number | string};

function Icon({size = 24, className = "", children, fill: _fill, strokeWidth: _sw, ...rest}: IconProps & {children: (g: (light: string, base: string) => string) => ReactNode}) {
  const uid = useId().replace(/:/g, "");
  const grads: [string, string][] = [];
  const g = (light: string, base: string) => { grads.push([light, base]); return `url(#ci${uid}${grads.length - 1})`; };
  const body = children(g);
  const labelled = rest["aria-label"] != null;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={`cute-icon ${className}`} aria-hidden={labelled ? undefined : true} role={labelled ? "img" : undefined} {...rest}>
      <defs>{grads.map(([a, b], i) => <linearGradient key={i} id={`ci${uid}${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a}/><stop offset="1" stopColor={b}/></linearGradient>)}</defs>
      {body}
    </svg>
  );
}

const shine = "rgba(255,255,255,.6)";

// Rounded control tile (play, pause, back, check): darker edge below, gradient face, light band on top.
function tile(g: (l: string, b: string) => string, light: string, base: string, edge: string, glyph: ReactNode) {
  return <>
    <rect x="2" y="3.6" width="20" height="19" rx="6" fill={edge}/>
    <rect x="2" y="1.8" width="20" height="19" rx="6" fill={g(light, base)}/>
    <rect x="5" y="3.3" width="14" height="3" rx="1.5" fill={shine}/>
    {glyph}
  </>;
}

export function Play(p: IconProps) {
  return <Icon {...p}>{g => tile(g, "#F0A584", "#DB7C56", "#A84A26", <path d="M9.6 7.6v7.8c0 .7.8 1.1 1.4.7l5.6-3.9c.5-.4.5-1.1 0-1.5L11 6.9c-.6-.4-1.4 0-1.4.7z" fill="#fff"/>)}</Icon>;
}
export function Pause(p: IconProps) {
  return <Icon {...p}>{g => tile(g, "#6BB88A", "#3A8F5D", "#23683F", <><rect x="8.2" y="7" width="2.8" height="8.6" rx="1.2" fill="#fff"/><rect x="13" y="7" width="2.8" height="8.6" rx="1.2" fill="#fff"/></>)}</Icon>;
}
export function ArrowLeft(p: IconProps) {
  return <Icon {...p}>{g => tile(g, "#9AA8D9", "#7285C1", "#3E4F8C", <path d="M13.8 6.8l-4.4 4.5 4.4 4.5" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>)}</Icon>;
}
export const ChevronLeft = ArrowLeft;
export function Check(p: IconProps) {
  return <Icon {...p}>{g => tile(g, "#6BB88A", "#3A8F5D", "#23683F", <path d="M7.2 11.4l3.2 3.2 6.4-6.6" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>)}</Icon>;
}
export const CheckCircle2 = Check;

export function Home(p: IconProps) {
  return <Icon {...p}>{g => <>
    <path d="M5 11.5h14v9.3a1.8 1.8 0 0 1-1.8 1.8H6.8A1.8 1.8 0 0 1 5 20.8z" fill="#C9B28C"/>
    <path d="M5 10.5h14v9.3a1.8 1.8 0 0 1-1.8 1.8H6.8A1.8 1.8 0 0 1 5 19.8z" fill={g("#FFFDF9", "#F3E3C6")}/>
    <rect x="10" y="14" width="4" height="7.6" rx="1.4" fill="#F1D64A" stroke="#C9AE2A" strokeWidth=".8"/>
    <rect x="15.3" y="3.8" width="2.4" height="5" rx=".6" fill="#A84A26"/>
    <path d="M2.4 12.6L12 4.6l9.6 8a1 1 0 0 1-.6 1.8H3a1 1 0 0 1-.6-1.8z" fill="#A84A26"/>
    <path d="M2.4 11.4L12 3.4l9.6 8a1 1 0 0 1-.6 1.8H3a1 1 0 0 1-.6-1.8z" fill={g("#F0A584", "#DB7C56")}/>
    <path d="M7.5 8.6L12 4.9l2.6 2.2" fill="none" stroke={shine} strokeWidth="1.4" strokeLinecap="round"/>
    <rect x="4" y="21.4" width="16" height="1.6" rx=".8" fill="#3A8F5D"/>
  </>}</Icon>;
}

function Book(p: IconProps) {
  return <Icon {...p}>{g => <>
    <path d="M1.8 6.4c3.6-1.6 7-1.2 10.2 1 3.2-2.2 6.6-2.6 10.2-1v14c-3.6-1.6-7-1.2-10.2 1-3.2-2.2-6.6-2.6-10.2-1z" fill="#3E4F8C"/>
    <path d="M1.8 5c3.6-1.6 7-1.2 10.2 1 3.2-2.2 6.6-2.6 10.2-1v14c-3.6-1.6-7-1.2-10.2 1-3.2-2.2-6.6-2.6-10.2-1z" fill={g("#9AA8D9", "#7285C1")}/>
    <path d="M3.4 5.6c2.8-1 5.8-.6 8.1 1.1v12.1c-2.3-1.4-5.3-1.7-8.1-.9z" fill="#FFFDF9"/>
    <path d="M20.6 5.6c-2.8-1-5.8-.6-8.1 1.1v12.1c2.3-1.4 5.3-1.7 8.1-.9z" fill="#EEF0F9"/>
    <path d="M5.2 9h4.6M5.2 11.6h4.6M5.2 14.2h3.4M14.2 9h4.6M14.2 11.6h4.6M14.2 14.2h3.4" stroke="#9AA8D9" strokeWidth="1.1" strokeLinecap="round"/>
  </>}</Icon>;
}
export const BookOpen = Book;
export const LibraryBig = Book;

export function ChartNoAxesCombined(p: IconProps) {
  const bar = (g: (l: string, b: string) => string, x: number, y: number) => <>
    <rect x={x} y={y + 1.4} width="5" height={21.6 - y} rx="2" fill="#23683F"/>
    <rect x={x} y={y} width="5" height={21.6 - y} rx="2" fill={g("#6BB88A", "#3A8F5D")}/>
    <rect x={x + 1.2} y={y + 1.2} width="1.4" height={Math.max(2, (21.6 - y) / 2.6)} rx=".7" fill={shine}/>
  </>;
  return <Icon {...p}>{g => <>{bar(g, 2.5, 13)}{bar(g, 9.5, 8)}{bar(g, 16.5, 2.6)}</>}</Icon>;
}

export function NotebookPen(p: IconProps) {
  return <Icon {...p}>{g => <>
    <rect x="4.5" y="3.4" width="16" height="19.6" rx="3" fill="#A84A26"/>
    <rect x="4.5" y="2" width="16" height="19.6" rx="3" fill={g("#F0A584", "#DB7C56")}/>
    <rect x="8.2" y="4.6" width="10" height="14.4" rx="1.6" fill="#FFFDF9"/>
    <path d="M10 8.4h6.4M10 11.2h6.4M10 14h4.4" stroke="#E5A285" strokeWidth="1.2" strokeLinecap="round"/>
    {[5.5, 10, 14.5, 19].map(y => <rect key={y} x="2.6" y={y - 1} width="4" height="2" rx="1" fill="#C9B28C" stroke="#7A6440" strokeWidth=".5"/>)}
  </>}</Icon>;
}

export function Award(p: IconProps) {
  return <Icon {...p}>{g => <>
    <rect x="1.6" y="4" width="20.8" height="15.4" rx="2.6" fill="#C9AE2A"/>
    <rect x="1.6" y="2.6" width="20.8" height="15.4" rx="2.6" fill={g("#FCEFA6", "#F1D64A")}/>
    <rect x="3.4" y="4.4" width="17.2" height="11.8" rx="1.6" fill="none" stroke="#FFFDF9" strokeWidth="1"/>
    <path d="M5.4 7.6h7M5.4 10.2h5" stroke="#B89A1E" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M15.2 15.6l-1.2 6 2.4-1.2 2.4 1.2-1.2-6z" fill="#A84A26"/>
    <circle cx="16.4" cy="13" r="3.6" fill="#A84A26"/>
    <circle cx="16.4" cy="12.4" r="3.4" fill={g("#F0A584", "#DB7C56")}/>
    <circle cx="16.4" cy="12.4" r="1.4" fill="#FCEFA6"/>
  </>}</Icon>;
}

// Chat with Loom: cream speech bubble holding a little red panda face.
export function MessageCircle(p: IconProps) {
  return <Icon {...p}>{g => <>
    <path d="M12 3.4c5.6 0 10 3.6 10 8.2s-4.4 8.2-10 8.2c-1.2 0-2.3-.2-3.4-.5L3.4 21.6l1.3-4A7.7 7.7 0 0 1 2 11.6C2 7 6.4 3.4 12 3.4z" fill="#C9B28C"/>
    <path d="M12 2.2c5.6 0 10 3.6 10 8.2s-4.4 8.2-10 8.2c-1.2 0-2.3-.2-3.4-.5L3.4 20.4l1.3-4A7.7 7.7 0 0 1 2 10.4C2 5.8 6.4 2.2 12 2.2z" fill={g("#FFFDF9", "#FCE7D6")}/>
    <path d="M7.6 6.2l-.6-2.4 2.6 1.2M16.4 6.2l.6-2.4-2.6 1.2" fill="#A84A26"/>
    <ellipse cx="12" cy="10.6" rx="5.6" ry="4.6" fill="#DB7C56"/>
    <ellipse cx="9.4" cy="11.6" rx="2" ry="1.8" fill="#FFFDF9"/>
    <ellipse cx="14.6" cy="11.6" rx="2" ry="1.8" fill="#FFFDF9"/>
    <circle cx="9.6" cy="10.4" r=".9" fill="#1A2238"/>
    <circle cx="14.4" cy="10.4" r=".9" fill="#1A2238"/>
    <ellipse cx="12" cy="12.4" rx=".9" ry=".6" fill="#1A2238"/>
    <path d="M8.4 7.6c1-.9 2.2-1.2 3.4-1.2" fill="none" stroke={shine} strokeWidth="1" strokeLinecap="round"/>
  </>}</Icon>;
}
