import React, { useCallback, useEffect, useRef, useState } from 'react';
import { animate, domAnimation, LazyMotion, MotionConfig, useMotionValue } from 'framer-motion';
import { Doodle, FilmGrain, Icon } from './Decorations.jsx';
import { AlbumSheet, TurningLeaf } from './AlbumSheet.jsx';
import { VinylPlayer } from './VinylPlayer.jsx';
import { ProgressBar } from './ProgressBar.jsx';
import { PhotoReactions } from './PhotoReactions.jsx';

const photos = window.CLASS_ALBUM || [];
const featured = [0,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,12];
const order = [...new Set([...featured, ...photos.map((_, i) => i)])].filter(i => photos[i]);
// Five single-photo pages and nineteen pairs: 43 originals, 24 pages, no duplicates.
const singles = new Set([0,6,12,18,23]);
const pages = [];
for (let cursor = 0; cursor < order.length;) {
  const count = singles.has(pages.length) ? 1 : 2;
  pages.push(order.slice(cursor, cursor + count));
  cursor += count;
}
const total = pages.length;

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return reduced;
}

function StoryViewer({ initialPage, onPageChange }) {
  const reduced = useReducedMotion();
  const [canHover, setCanHover] = useState(() => matchMedia('(hover: hover) and (pointer: fine)').matches);
  const [page, setPage] = useState(initialPage);
  const [turn, setTurn] = useState(null);
  const turning = Boolean(turn);
  const [zoom, setZoom] = useState(null);
  const [automatic, setAutomatic] = useState(false);
  const [paused, setPaused] = useState(false);
  const [holding, setHolding] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const [playing, setPlaying] = useState(!document.getElementById('bgMusic').paused);
  const dialog = useRef(null), touch = useRef(null), holdStart = useRef(null), suppressUntil = useRef(0);
  const progress = useMotionValue(0);
  const flip = useCallback(delta => {
    if (turning || zoom) return;
    const next = Math.max(0, Math.min(total - 1, page + delta));
    if (next !== page) { window.ClassroomEffects?.paper(); if (!reduced) setTurn({ from:page, to:next, delta }); setPage(next); }
  }, [page, turning, zoom, reduced]);

  useEffect(() => {
    document.getElementById('albumTitle')?.focus({ preventScroll:true });
    window.scrollTo({ top:0, behavior:'instant' });
    const visibility = () => { setHidden(document.hidden); setHolding(false); setTurn(null); };
    document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, []);
  useEffect(() => {
    const media = matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setCanHover(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => { onPageChange(page); progress.set(0); }, [page, automatic, onPageChange, progress]);
  useEffect(() => {
    const audio = document.getElementById('bgMusic'), sync = () => setPlaying(!audio.paused);
    audio.addEventListener('play', sync); audio.addEventListener('pause', sync);
    return () => { audio.removeEventListener('play', sync); audio.removeEventListener('pause', sync); };
  }, []);
  useEffect(() => { if (reduced) setTurn(null); }, [reduced]);

  const running = automatic && !paused && !holding && !hidden && !zoom && !turning;
  useEffect(() => {
    if (!running) return;
    const control = animate(progress, 1, {
      duration:Math.max(.05, (1 - progress.get()) * 7), ease:'linear',
      onComplete:() => { if (page < total - 1) flip(1); else setPaused(true); }
    });
    return () => control.stop();
  }, [running, page, progress, flip]);

  // Preload one next page into the browser cache; it never enters the DOM.
  useEffect(() => {
    const pending = (pages[page + 1] || []).map(index => {
      const image = new Image(); image.decoding = 'async'; image.src = photos[index].src; return image;
    });
    return () => { pending.forEach(image => image.removeAttribute('src')); };
  }, [page]);
  useEffect(() => {
    const key = event => {
      if (zoom || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault(); flip(event.key === 'ArrowRight' ? 1 : -1);
      }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [zoom, flip]);
  const release = useCallback(() => {
    if (holdStart.current !== null && performance.now() - holdStart.current > 250) suppressUntil.current = performance.now() + 400;
    holdStart.current = null; setHolding(false);
  }, []);
  useEffect(() => {
    document.addEventListener('pointerup', release); document.addEventListener('pointercancel', release);
    return () => { document.removeEventListener('pointerup', release); document.removeEventListener('pointercancel', release); };
  }, [release]);
  useEffect(() => {
    const element = dialog.current;
    if (zoom && !element.open) element.showModal();
    else if (!zoom && element.open) element.close();
  }, [zoom]);
  useEffect(() => {
    const element = dialog.current;
    return () => { if (element?.open) element.close(); };
  }, []);

  const openPhoto = photo => { if (!turning && performance.now() >= suppressUntil.current) setZoom(photo); };
  const toggleStory = () => {
    if (automatic && paused) {
      if (page === total - 1 && progress.get() >= 1) setPage(0);
      setPaused(false);
    }
    else if (automatic) setPaused(true);
    else { if (page === total - 1) setPage(0); setAutomatic(true); setPaused(false); }
  };
  const stopStory = () => { setAutomatic(false); setPaused(false); };
  const moving = playing && !hidden && !zoom && !turning && !holding && !reduced && !(automatic && paused);
  const decorationEnabled = !hidden && !zoom && !turning && !holding && !reduced && !(automatic && paused);

  return <div className="album-shell" data-turning={turning} style={{ '--album-decoration-play':decorationEnabled ? 'running' : 'paused' }}>
    <FilmGrain/>
    <div className="album-top">
      <button className="album-icon" type="button" data-back="name" aria-label="Quay lại nhập tên" onClick={() => window.ClassroomApp.navigate('name')}><Icon name="back"/></button>
      <div className="album-tools">
        <button className="album-icon" type="button" aria-label={automatic && !paused ? 'Tạm dừng trình chiếu' : 'Tiếp tục trình chiếu'} aria-pressed={automatic && !paused} onClick={toggleStory}><Icon name={automatic && !paused ? 'pause' : 'play'}/></button>
        {automatic && <button className="album-icon" type="button" aria-label="Lật sổ bằng tay" onClick={stopStory}><Icon name="book"/></button>}
        <VinylPlayer photo={photos[0]} playing={playing} moving={moving} onToggle={() => document.getElementById('soundButton').click()}/>
      </div>
    </div>
    <ProgressBar total={total} page={page} progress={progress} automatic={automatic} reduced={reduced}/>
    <div className="album-reader">
      <button id="albumPrev" className="album-icon album-side" type="button" aria-label="Trang ảnh trước" disabled={page === 0} onClick={() => flip(-1)}><Icon name="prev"/></button>
      <div className={`album-book ${pages[page].length === 1 ? 'album-book-single' : ''}`} id="albumBook" aria-label="Sổ ảnh kỷ niệm của lớp"
        onPointerDown={event => { if (automatic && event.button === 0) { holdStart.current = performance.now(); setHolding(true); } }} onPointerUp={release} onPointerCancel={release}
        onTouchStart={event => { touch.current = event.touches.length === 1 ? { x:event.touches[0].clientX, y:event.touches[0].clientY } : null; }}
        onTouchEnd={event => {
          if (!touch.current) return;
          const dx = event.changedTouches[0].clientX - touch.current.x, dy = event.changedTouches[0].clientY - touch.current.y;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) { suppressUntil.current = performance.now() + 400; flip(dx < 0 ? 1 : -1); }
          touch.current = null; release();
        }} onTouchCancel={() => { touch.current = null; release(); }}
        onClick={event => {
          if (!automatic || event.target.closest('button') || performance.now() < suppressUntil.current) return;
          const bounds = event.currentTarget.getBoundingClientRect(); flip(event.clientX < bounds.left + bounds.width / 2 ? -1 : 1);
        }}>
        <div className="album-page" id="albumPage" key={page}>
          {pages[page].map((index, slot) => <AlbumSheet key={index} photo={photos[index]} index={index} slot={slot} onPhoto={openPhoto} enabled={decorationEnabled} reduced={reduced} canHover={canHover}/>)}
        </div>
        <span className="album-ribbon" aria-hidden="true"/>
        {turn && <TurningLeaf key={`turn-${page}`} turn={turn} pages={pages} photos={photos} onComplete={() => setTurn(null)}/>}
      </div>
      <button id="albumNext" className="album-icon album-side" type="button" aria-label="Trang ảnh tiếp" disabled={page === total - 1} onClick={() => flip(1)}><Icon name="next"/></button>
    </div>
    <div className="album-bottom"><Doodle kind="arrow" className="album-continue-doodle"/><button id="albumContinue" type="button" onClick={() => window.ClassroomApp.navigate('envelope')}>Tiếp tục<Icon name="mail"/></button></div>
    <p className="sr-only" id="albumCounter" aria-live="polite">Trang {page + 1} trên {total}</p>
    <dialog className="album-zoom has-reactions" id="albumZoom" aria-label="Ảnh kỷ niệm phóng lớn" ref={dialog} onClose={() => setZoom(null)} onCancel={() => setZoom(null)} onClick={event => { if (event.target === event.currentTarget) setZoom(null); }}>
      <button id="albumZoomClose" className="album-icon" type="button" aria-label="Đóng ảnh phóng lớn" onClick={() => setZoom(null)}><Icon name="close"/></button>
      {zoom && <img id="albumZoomImage" src={zoom.src} alt={zoom.alt} width={zoom.width} height={zoom.height}/>}
      {zoom && <PhotoReactions key={zoom.src} photo={photos.indexOf(zoom) + 1}/>}
    </dialog>
  </div>;
}

// Only this screen listener survives navigation. The whole viewer unmounts on exit,
// cleaning up its progress animation, preload, audio and input listeners.
export function AlbumApp() {
  const saved = useRef({ name:window.ClassroomApp.getName(), page:0 });
  const [active, setActive] = useState(() => window.ClassroomApp.getScreen() === 'album');
  const rememberPage = useCallback(page => { saved.current.page = page; }, []);
  useEffect(() => {
    const screenChanged = event => {
      if (event.detail.screen === 'album') {
        const name = window.ClassroomApp.getName();
        if (saved.current.name !== name) saved.current = { name, page:0 };
      }
      setActive(event.detail.screen === 'album');
    };
    document.addEventListener('classroom:screen-changed', screenChanged);
    return () => document.removeEventListener('classroom:screen-changed', screenChanged);
  }, []);
  return active ? <MotionConfig reducedMotion="user"><LazyMotion features={domAnimation}><StoryViewer initialPage={saved.current.page} onPageChange={rememberPage}/></LazyMotion></MotionConfig> : null;
}
