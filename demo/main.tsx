import React from 'react';
import {createRoot} from 'react-dom/client';
import LearnloomApp from '../components/learnloom-app';
import FakeHero from '../features/fake-hero/components/FakeHero';
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
createRoot(document.getElementById('root')!).render(<DemoBoundary><aside className="demo-notice" role="note"><strong>LearnLOOM · THE FAKE HERO (EP.01 EXCERPT)</strong><span>เคมีอินทรีย์ ม.6 · The Fake Hero · บันทึกเฉพาะเบราว์เซอร์นี้</span></aside>{new URLSearchParams(location.search).has('standalone')?<FakeHero/>:<LearnloomApp/>}</DemoBoundary>);
