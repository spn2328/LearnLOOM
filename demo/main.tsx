import React from 'react';
import {createRoot} from 'react-dom/client';
import LearnloomApp from '../components/learnloom-app';
import '../app/globals.css';
import './style.css';

class DemoBoundary extends React.Component<React.PropsWithChildren, {failed:boolean}> {
  state = {failed:false};
  static getDerivedStateFromError() { return {failed:true}; }
  render() {
    if(this.state.failed) return <main className="panel"><h1>เปิดเดโมไม่สำเร็จ</h1><p>ลองรีเฟรชหน้าอีกครั้ง ข้อมูลที่บันทึกไว้ยังอยู่ในเบราว์เซอร์นี้</p><button onClick={()=>location.reload()}>ลองใหม่</button></main>;
    return this.props.children;
  }
}
createRoot(document.getElementById('root')!).render(<DemoBoundary><aside className="demo-notice" role="note"><strong>LearnLOOM DEMO</strong><span>ทดลองเรียนได้ · บันทึกเฉพาะเบราว์เซอร์นี้ · ไม่มีบัญชีออนไลน์/ห้องเรียนจริง · ใช้ชื่อเล่นเท่านั้น</span></aside><LearnloomApp/></DemoBoundary>);
