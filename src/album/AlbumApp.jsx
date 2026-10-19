import React, { useCallback, useEffect, useRef, useState } from 'react';
import { animate, domAnimation, LazyMotion, MotionConfig, useMotionValue } from 'framer-motion';
import { ClosingSparkles, Doodle, FilmGrain, Icon } from './Decorations.jsx';
import { AlbumSpread, TurningLeaf } from './AlbumSheet.jsx';
import { VinylPlayer } from './VinylPlayer.jsx';
import { ProgressBar } from './ProgressBar.jsx';
import { PhotoReactions } from './PhotoReactions.jsx';
import { buildAlbumPages } from './album-layout.mjs';
import { usePageTurn } from './usePageTurn.jsx';
import { dragIntent, dragProgress, shouldCompleteTurn } from './page-turn.mjs';

const photos = window.CLASS_ALBUM || [];
const pages = buildAlbumPages(photos);
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
  const [zoom, setZoom] = useState(null);
  const [automatic, setAutomatic] = useState(false);
  const [paused, setPaused] = useState(false);
  const [holding, setHolding] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const [playing, setPlaying] = useState(!document.getElementById('bgMusic').paused);
  const [sparkles, setSparkles] = useState(false);
  const celebrated = useRef(false);
  const dialog = useRef(null), gesture = useRef(null), holdStart = useRef(null), suppressUntil = useRef(0);
  const progress = useMotionValue(0);
  const { turn, position, begin, settle, flip, isBusy } = usePageTurn({
    page, total, reduced, blocked:Boolean(zoom) || hidden, onCommit:setPage,
    onStart:() => window.ClassroomEffects?.paper()
  });
  const turning = Boolean(turn);

  const startGesture = event => {
    if (event.button !== 0 || !event.isPrimary || isBusy() || zoom) return;
    const button = event.target.closest('button');
    if (button && !button.matches('.album-photo-open,.album-edge')) return;
    gesture.current = { id:event.pointerId, x:event.clientX, y:event.clientY, lastX:event.clientX,
      lastTime:performance.now(), velocity:0, active:false, travel:event.currentTarget.clientWidth,
      delta:Number(button?.dataset.turn) || null };
    if (automatic) { holdStart.current = performance.now(); setHolding(true); }
  };
  const moveGesture = event => {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    const dx = event.clientX - g.x, dy = event.clientY - g.y;
    if (!g.active) {
      if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { gesture.current = null; return; }
      if (!dragIntent(dx, dy)) return;
      g.delta ??= dx < 0 ? 1 : -1;
      if (!begin(g.delta, true)) { gesture.current = null; return; }
      g.active = true; event.currentTarget.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    const now = performance.now(), elapsed = now - g.lastTime;
    if (elapsed > 0) g.velocity = (g.lastX - event.clientX) * g.delta / elapsed;
    g.lastX = event.clientX; g.lastTime = now;
    position.set(dragProgress(g.x, event.clientX, g.delta, g.travel));
  };
  const finishGesture = (event, canceled = false) => {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    gesture.current = null;
    if (g.active) {
      suppressUntil.current = performance.now() + 450;
      const velocity = performance.now() - g.lastTime < 100 ? g.velocity : 0;
      settle(!canceled && shouldCompleteTurn(position.get(), velocity));
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  useEffect(() => {
    document.getElementById('albumTitle')?.focus({ preventScroll:true });
    window.scrollTo({ top:0, behavior:'instant' });
    const visibility = () => { setHidden(document.hidden); setHolding(false); gesture.current = null; };
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
  useEffect(() => {
    if (page === total - 1 && !turning && !zoom && !hidden && !reduced && !celebrated.current) {
      celebrated.current = true; setSparkles(true);
    }
  }, [page, turning, zoom, hidden, reduced]);
  useEffect(() => {
    if (!sparkles) return;
    const timer = setTimeout(() => setSparkles(false), 2800);
    return () => clearTimeout(timer);
  }, [sparkles]);
  useEffect(() => { if (hidden || zoom || reduced || turning) setSparkles(false); }, [hidden, zoom, reduced, turning]);

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

  const openPhoto = photo => { if (!isBusy() && performance.now() >= suppressUntil.current) setZoom(photo); };
  const toggleStory = () => {
    if (isBusy()) return;
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
      <div className="album-heading"><span>TCTT67C</span><h2>Sổ kỷ niệm</h2></div>
      <div className="album-tools">
        <button className="album-icon" type="button" aria-label={automatic && !paused ? 'Tạm dừng trình chiếu' : 'Tiếp tục trình chiếu'} aria-pressed={automatic && !paused} onClick={toggleStory}><Icon name={automatic && !paused ? 'pause' : 'play'}/></button>
        {automatic && <button className="album-icon" type="button" aria-label="Lật sổ bằng tay" onClick={stopStory}><Icon name="book"/></button>}
        <VinylPlayer photo={photos[0]} playing={playing} moving={moving} onToggle={() => document.getElementById('soundButton').click()}/>
      </div>
    </div>
    <ProgressBar total={total} page={page} progress={progress} automatic={automatic} reduced={reduced}/>
    <div className="album-reader">
      <button id="albumPrev" className="album-icon album-side" type="button" aria-label="Trang ảnh trước" disabled={page === 0 || turning} onClick={() => flip(-1)}><Icon name="prev"/></button>
      <div className="album-book" id="albumBook" aria-label="Sổ ảnh kỷ niệm của lớp" aria-busy={turning}
        onPointerDown={startGesture} onPointerMove={moveGesture}
        onPointerUp={event => { finishGesture(event); release(); }}
        onPointerCancel={event => { finishGesture(event, true); release(); }}
        onLostPointerCapture={event => finishGesture(event, true)}
        onDragStart={event => event.preventDefault()}
        onClick={event => {
          if (event.target.closest('button') || performance.now() < suppressUntil.current) return;
          const bounds = event.currentTarget.getBoundingClientRect(); flip(event.clientX < bounds.left + bounds.width / 2 ? -1 : 1);
        }}>
        <AlbumSpread id="albumPage" key={page} indices={pages[page]} photos={photos} onPhoto={openPhoto} enabled={decorationEnabled} reduced={reduced} canHover={canHover}/>
        <span className="album-ribbon" aria-hidden="true"/>
        {sparkles && <ClosingSparkles/>}
        {turn && !reduced && <TurningLeaf turn={turn} position={position} pages={pages} photos={photos}/>}
        {[-1, 1].map(delta => <button key={delta} type="button" className={`album-edge album-edge-${delta > 0 ? 'next' : 'prev'}`} data-turn={delta}
          aria-label={delta > 0 ? 'Lật từ mép phải' : 'Lật từ mép trái'} disabled={turning || (delta > 0 ? page === total - 1 : page === 0)}
          onClick={() => { if (performance.now() >= suppressUntil.current) flip(delta); }}><span className="album-corner-curl" aria-hidden="true"/></button>)}
      </div>
      <button id="albumNext" className="album-icon album-side" type="button" aria-label="Trang ảnh tiếp" disabled={page === total - 1 || turning} onClick={() => flip(1)}><Icon name="next"/></button>
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
