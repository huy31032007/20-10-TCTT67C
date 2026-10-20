import React, { useEffect, useState } from 'react';
import LunarBoardingPass from '../components/ui/lunar-boarding-pass.tsx';

function TicketViewer() {
  const audio = document.getElementById('bgMusic');
  const [playing, setPlaying] = useState(!audio.paused);
  useEffect(() => {
    window.scrollTo({ top:0, behavior:'instant' });
    document.getElementById('ticketTitle')?.focus({ preventScroll:true });
    const sync = () => setPlaying(!audio.paused);
    audio.addEventListener('play', sync); audio.addEventListener('pause', sync);
    return () => { audio.removeEventListener('play', sync); audio.removeEventListener('pause', sync); };
  }, [audio]);
  return <div className="ticket-shell">
    <div className="ticket-toolbar">
      <button className="ticket-control" type="button" data-back="garden" onClick={() => window.ClassroomApp.navigate('garden')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg>Vườn hoa</button>
      <button className="ticket-control ticket-audio" type="button" aria-label={playing ? 'Tắt nhạc Photograph' : 'Bật nhạc Photograph'} aria-pressed={playing} onClick={() => document.getElementById('soundButton').click()}><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-sound"/></svg></button>
    </div>
    <div className="ticket-center">
      <LunarBoardingPass className="class-coming-soon" title="TCTT67C" tier="20/10" date="SOON"
        welcome={'HẸN\nSỚM'} eyebrow={'MỘT ĐIỀU MỚI\nĐANG CHỜ'} words={['COMING', 'SOON']}
        notes={['TCTT67C · 20/10', 'HẸN GẶP LẠI']} passenger={window.ClassroomApp.getName() || 'BẠN CÙNG LỚP'}
        from="TCTT67C" to="Các bạn nữ TCTT67C" craft="TCTT67C" dateCode="COMING SOON" boardingTime="COMING SOON"
        gate="—" group="67C" seat="—" site="SẮP BẬT MÍ" seq="TCTT67C — TO BE CONTINUED"
        featuring="HẸN CẬU Ở ĐIỀU TIẾP THEO" headline="COMING SOON" stamp="HẸN SỚM"
        sideLabels={['Mặt trước', 'Mặt sau']} showCoordinates={false}
        night="#263b38" starInk="#f5efdc" paper="#e8e7d8" paperInk="#34463e" stampColor="#7b65ae"
        fontCondensed="'Be Vietnam Pro', sans-serif" fontDisplay="'Be Vietnam Pro', sans-serif" fontMono="'Courier New', monospace" tilt={3} maxWidth={1000}/>
      <p className="ticket-hint">Chạm vé để lật · Mặt sau có cuống vé để xé</p>
    </div>
  </div>;
}

export function TicketApp() {
  const [active, setActive] = useState(() => window.ClassroomApp.getScreen() === 'ticket');
  useEffect(() => {
    const changed = event => setActive(event.detail.screen === 'ticket');
    document.addEventListener('classroom:screen-changed', changed);
    return () => document.removeEventListener('classroom:screen-changed', changed);
  }, []);
  return active ? <TicketViewer/> : null;
}
