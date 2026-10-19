'use strict';
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = true, context, stopVoice;
  const emissions = new Set(), buffers = new Map();
  try { enabled = localStorage.getItem('tctt67c-paper-sound') !== 'off'; } catch {}
  const button = document.createElement('button');
  button.id = 'paperSound'; button.className = 'paper-sound-toggle'; button.type = 'button';
  button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h10l4 4v14H5ZM14 3v5h5M8 12h8M8 16h5"/></svg>';
  const sync = () => { button.setAttribute('aria-pressed', String(enabled)); button.setAttribute('aria-label', enabled ? 'Tắt âm thanh giấy (rất nhỏ)' : 'Bật âm thanh giấy (rất nhỏ)'); button.title = button.getAttribute('aria-label'); };
  sync(); document.body.appendChild(button);
  function unlock() {
    if (!enabled) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    try { context ||= new Audio(); if (context.state === 'suspended') context.resume().catch(() => {}); } catch {}
  }
  document.addEventListener('pointerdown', unlock, { passive:true, capture:true });
  document.addEventListener('keydown', event => { if (['Enter',' ','ArrowLeft','ArrowRight'].includes(event.key)) unlock(); }, { capture:true });
  function paper(kind = 'page') {
    if (!enabled) return;
    unlock();
    if (!context || context.state !== 'running') return;
    stopVoice?.();
    const length = kind === 'envelope' ? .38 : .22;
    let buffer = buffers.get(kind);
    if (!buffer) {
      buffer = context.createBuffer(1, Math.ceil(context.sampleRate * length), context.sampleRate);
      const samples = buffer.getChannelData(0); let smooth = 0;
      for (let i = 0; i < samples.length; i++) { smooth = smooth * .65 + (Math.random() * 2 - 1) * .35; samples[i] = smooth; }
      buffers.set(kind, buffer);
    }
    const source = context.createBufferSource(), filter = context.createBiquadFilter(), gain = context.createGain();
    source.buffer = buffer; filter.type = 'bandpass'; filter.frequency.value = 2200; filter.Q.value = .65;
    const now = context.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(.018, now + .025);
    gain.gain.linearRampToValueAtTime(.006, now + length * .45);
    gain.gain.linearRampToValueAtTime(.012, now + length * .65);
    gain.gain.linearRampToValueAtTime(0, now + length);
    source.connect(filter); filter.connect(gain); gain.connect(context.destination);
    const stop = () => { try { source.stop(); } catch {} };
    stopVoice = stop;
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); if (stopVoice === stop) stopVoice = null; };
    source.start(); source.stop(now + length);
  }
  button.addEventListener('click', () => {
    enabled = !enabled; sync();
    try { localStorage.setItem('tctt67c-paper-sound', enabled ? 'on' : 'off'); } catch {}
    if (enabled) { unlock(); paper(); } else stopVoice?.();
  });

  function emit(scope, parent, count, duration, position) {
    if (reduced.matches || document.hidden) return;
    const nodes = [];
    for (let i = 0; i < count; i++) {
      const petal = document.createElement('i');
      petal.className = `${scope === 'letter' ? 'letter-opening-petal' : 'garden-touch-petal'} ${i % 3 === 0 ? 'is-lily' : 'is-rose'}`;
      petal.setAttribute('aria-hidden', 'true');
      position(petal, i); parent.appendChild(petal); nodes.push(petal);
    }
    const emission = { scope, cancel:() => { clearTimeout(emission.timer); nodes.forEach(node => node.remove()); emissions.delete(emission); } };
    emission.timer = setTimeout(emission.cancel, duration);
    emissions.add(emission);
  }
  function cancel(scope) { for (const emission of emissions) if (!scope || emission.scope === scope) emission.cancel(); }
  function letterPetals() {
    cancel('letter');
    emit('letter', document.body, 18, 3000, (petal, i) => {
      const x = innerWidth * (.12 + i / 22), y = -25 + i % 5 * 15;
      const drift = (i % 2 ? 1 : -1) * (35 + i * 5);
      petal.style.left = `${x}px`; petal.style.top = `${y}px`;
      petal.style.setProperty('--petal-x', `${Math.max(12 - x, Math.min(innerWidth - x - 24, drift))}px`);
      petal.style.setProperty('--petal-y', `${Math.min(innerHeight - y - 24, innerHeight * (.6 + i % 4 * .1))}px`);
      petal.style.setProperty('--petal-turn', `${130 + i * 23}deg`);
    });
  }
  function gardenPetals(plant) {
    if (document.querySelectorAll('.garden-touch-petal').length >= 24) return;
    emit('garden', plant, 5, 1600, (petal, i) => {
      petal.style.left = `${32 + i * 8}%`; petal.style.top = `${20 + i % 3 * 6}%`;
      petal.style.setProperty('--petal-x', `${(i - 2) * 13}px`);
      petal.style.setProperty('--petal-y', `${65 + i * 13}px`);
      petal.style.setProperty('--petal-turn', `${90 + i * 37}deg`);
    });
  }
  document.addEventListener('classroom:screen-changed', event => {
    if (!['envelope','letter'].includes(event.detail.screen)) cancel('letter');
    if (event.detail.screen !== 'garden') cancel('garden');
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancel(); stopVoice?.(); } });
  reduced.addEventListener('change', () => { if (reduced.matches) cancel(); });
  window.addEventListener('pagehide', () => { cancel(); stopVoice?.(); context?.close().catch(() => {}); context = null; buffers.clear(); });
  window.ClassroomEffects = Object.freeze({ paper, letterPetals, gardenPetals });
})();
