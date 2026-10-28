import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'LearnLOOM · ห้องเก็บสารไร้ป้าย',description:'เรียนรู้ธาตุ สารประกอบ และสารผสม ผ่านนิยายแบบแตะเพื่อดำเนินเรื่อง พร้อมลูมและเส้นทางการเรียนรู้ของคุณ',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="th"><head><link rel="stylesheet" href="/fonts/fonts.css"/></head><body>{children}</body></html>}
