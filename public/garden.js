'use strict';
(() => {
  const app = window.ClassroomApp;
  const el = id => document.getElementById(id);
  let revision = -1, members = [], previousScreen = 'letter';
  let refreshTimer, refreshInFlight = null, joinInFlight = false, pendingName = '';
  const plants = new Map();
  let namedPlant = null;
  function showName(plant) {
    if (namedPlant && namedPlant !== plant) hideName(namedPlant);
    namedPlant = plant;
    plant.classList.add('is-name-visible');
    plant.querySelector('.garden-bouquet-name').hidden = false;
  }
  function hideName(plant = namedPlant) {
    if (!plant) return;
    plant.classList.remove('is-name-visible');
    plant.querySelector('.garden-bouquet-name').hidden = true;
    if (namedPlant === plant) namedPlant = null;
  }
  const hash = value => [...value].reduce((seed, c) => Math.imul(seed ^ c.codePointAt(0), 16777619) >>> 0, 2166136261);

  // The empty landscape has no blooms; each saved classmate adds one planted clump.
  function scenery() {
    const fence = Array.from({length:37},(_,i)=>`<path d="M${i*42} 468v-61l8-9 8 9v61" fill="#fff8e9" stroke="#d7d7b6" stroke-width="1.5"/>`).join('');
    const tree = (x,flip) => `<g transform="translate(${x} 0) scale(${flip} 1)"><path d="M0 798Q50 527 18 240M24 435Q112 356 158 257M26 369Q-55 301-68 208" fill="none" stroke="#a6a17c" stroke-width="21" stroke-linecap="round"/><path d="M1 784Q38 567 25 407" fill="none" stroke="#c7bd94" stroke-width="5"/>${Array.from({length:30},(_,i)=>`<ellipse cx="${-35+Math.cos(i*2.4)*135}" cy="${198+Math.sin(i*2.4)*109}" rx="${62+i%4*8}" ry="${47+i%3*7}" fill="${['#c7d6ac','#d2dcb9','#b9cba2','#dbe2c6'][i%4]}"/>`).join('')}</g>`;
    el('gardenScenery').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 1000" preserveAspectRatio="none"><defs><linearGradient id="gs-sky" x2="0" y2="1"><stop stop-color="#e7edf0"/><stop offset=".55" stop-color="#f9edda"/><stop offset="1" stop-color="#f4e8d5"/></linearGradient><linearGradient id="gs-ground" x2=".2" y2="1"><stop stop-color="#d8dfb6"/><stop offset="1" stop-color="#aebf91"/></linearGradient><radialGradient id="gs-glow"><stop stop-color="#fff4cc" stop-opacity=".9"/><stop offset="1" stop-color="#fff3ce" stop-opacity="0"/></radialGradient><filter id="gs-soft"><feGaussianBlur stdDeviation="14"/></filter></defs>
      <path fill="url(#gs-sky)" d="M0 0h1440v1000H0z"/><circle cx="1060" cy="180" r="250" fill="url(#gs-glow)"/><circle cx="1060" cy="180" r="48" fill="#fff4d1"/>
      <g class="garden-clouds" fill="#fffbf2" opacity=".7"><path d="M255 156c-28-4-28-32-2-36 5-37 58-36 66-10 32-16 63 10 48 32 28 1 26 23 1 24Z"/><path d="M667 104c-25-4-18-29 4-26 2-25 38-33 52-10 32-11 50 13 39 25 24 13 7 25-16 22Z"/></g>
      <path d="M0 413Q170 330 359 391T720 374T1050 393T1440 358V1000H0Z" fill="#d4dcc2"/><path d="M0 486Q200 402 420 458T866 429T1440 450V1000H0Z" fill="#c3d0af"/>
      <g opacity=".8"><path d="M0 426H1440M0 451H1440" stroke="#f7f0d9" stroke-width="8"/>${fence}</g>
      <path d="M0 520Q320 445 662 511T1440 493V1000H0Z" fill="url(#gs-ground)"/><path d="M820 475Q660 581 789 670T632 1000H1040Q1049 856 866 737T880 475Z" fill="#e6d9b7"/><path d="M837 486Q726 581 817 671T861 800" fill="none" stroke="#f4e6c9" stroke-width="17" opacity=".65"/>
      <g fill="#f3e7ce" stroke="#d4c5a2" stroke-width="1.5"><ellipse cx="818" cy="584" rx="22" ry="8" transform="rotate(10 818 584)"/><ellipse cx="841" cy="643" rx="28" ry="11" transform="rotate(18 841 643)"/><ellipse cx="884" cy="716" rx="34" ry="13" transform="rotate(25 884 716)"/></g>
      <g fill="none" stroke="#e8dfc0" stroke-width="7" stroke-linecap="round" opacity=".9"><path d="M617 487V374a90 90 0 0 1 180 0v113M632 487V375a75 75 0 0 1 150 0v112"/><path d="M617 411h15m150 0h15M617 445h15m150 0h15"/></g>
      <g fill="#a2b88c"><ellipse cx="626" cy="386" rx="14" ry="28" transform="rotate(30 626 386)"/><ellipse cx="641" cy="328" rx="14" ry="24" transform="rotate(40 641 328)"/><ellipse cx="780" cy="382" rx="13" ry="26" transform="rotate(-24 780 382)"/></g>
      <g opacity=".95">${tree(30,1)}${tree(1415,-1)}</g>
      <path d="M0 837Q170 763 368 861T754 900T1145 849T1440 832V1000H0Z" fill="#a2b58a" opacity=".42"/>
      <g fill="#8da87d" opacity=".75">${Array.from({length:60},(_,i)=>`<path d="M${i*25} 1000q-16-44-26-50q18 3 26 30q2-42 16-55q-7 28-8 57q18-22 28-24q-14 20-20 42Z"/>`).join('')}</g>
      <g class="garden-butterfly" transform="translate(380 320)" fill="#d6b9d9"><path d="M0 0C-40-30-35 18 0 8C28-31 40 8 0 8Z"/><path d="M0 0v16" stroke="#a592a5" stroke-width="2"/></g><g class="garden-butterfly second" transform="translate(1110 510) scale(.65)" fill="#edcea0"><path d="M0 0C-40-30-35 18 0 8C28-31 40 8 0 8Z"/><path d="M0 0v16" stroke="#b5a07e" stroke-width="2"/></g>
    </svg>`;
  }
  function layout() {
    const width = el('gardenLandscape').clientWidth;
    if (!width) return;
    const compact = width < 650;
    const columns = Math.min(10, Math.max(2, Math.floor(width * .9 / (compact ? 105 : 110))));
    const rows = Math.max(1, Math.ceil(members.length / columns));
    const perRow = Math.ceil(members.length / rows) || 1;
    const viewport = Math.max(window.innerHeight, 620);
    // Give every clump its own footprint; reserve room for the sway at the edges.
    const padding = Math.max(22, width * .07);
    const nominalSize = Math.min(compact ? 185 : 230, (width - padding * 2) / ((perRow - 1) * .82 + 1));
    const spacing = Math.max(105, nominalSize * .77);
    const start = viewport * (compact ? .71 : .64);
    el('gardenLandscape').classList.toggle('has-members', members.length > 0);
    el('gardenLandscape').style.setProperty('--garden-frame', `${viewport}px`);
    el('gardenScenery').querySelector('svg').setAttribute('preserveAspectRatio', compact ? 'xMidYMid slice' : 'none');
    el('gardenLandscape').style.height = `${Math.max(viewport, start + (rows - 1) * spacing + 90)}px`;
    members.forEach((member, index) => {
      const row = Math.floor(index / perRow), count = Math.min(perRow, members.length - row * perRow);
      const seed = hash(member.id);
      const size = nominalSize * (.94 + seed % 7 / 100);
      const step = nominalSize * .82;
      const offset = (index % perRow - (count - 1) / 2) * step + (row % 2 ? 5 : -5);
      const x = width / 2 + offset;
      const y = start + row * spacing + Math.cos(offset / width * Math.PI * 1.5) * 24 + seed % 11;
      const plant = plants.get(member.id);
      Object.assign(plant.style, { left: `${x}px`, top: `${y - size * (485 / 460)}px`, width: `${size}px`, zIndex: String(10 + row), '--tilt': `${seed % 5 - 2}deg`, '--breeze-delay': `${seed % 60 * -.1}s`, '--breeze-time': `${5.5 + seed % 20 * .1}s` });
    });
  }

  async function request(method = 'GET', body) {
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch('/api/garden', { method, cache:'no-store', credentials:'same-origin', signal:controller.signal, ...(body ? { headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) } : {}) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Vườn chưa kết nối được.');
      return data;
    } finally { clearTimeout(timeout); }
  }
  function applyGarden(data) {
    if (!Number.isSafeInteger(data?.revision) || !Array.isArray(data.members)) throw new Error('Vườn chưa kết nối được.');
    if (data.revision < revision) return;
    revision = data.revision; members = data.members;
    for (const member of members) {
      if (plants.has(member.id)) continue;
      const plant = document.createElement('div');
      plant.className = 'garden-bouquet';
      plant.setAttribute('role','listitem');
      plant.setAttribute('aria-label', `Cụm hoa của ${member.name}`);
      plant.dataset.memberId = member.id;
      plant.tabIndex = 0;
      plant.innerHTML = `<div class="garden-bouquet-sway">${window.drawBouquet(member.name, {garden:true, wrapped:false, animateFrom:Infinity})}</div>`;
      const name = document.createElement('span');
      name.className = 'garden-bouquet-name';
      name.id = `garden-name-${member.id}`;
      name.setAttribute('role', 'tooltip');
      name.textContent = member.name;
      name.hidden = true;
      plant.appendChild(name);
      plant.setAttribute('aria-describedby', name.id);
      let shakeTimer;
      const shake = () => {
        clearTimeout(shakeTimer);
        plant.classList.add('is-touched');
        shakeTimer = setTimeout(() => plant.classList.remove('is-touched'), 900);
      };
      plant.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') showName(plant); });
      plant.addEventListener('pointerleave', () => { if (document.activeElement !== plant) hideName(plant); });
      plant.addEventListener('focus', () => showName(plant));
      plant.addEventListener('blur', () => hideName(plant));
      plant.addEventListener('pointerdown', () => { showName(plant); shake(); });
      plant.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showName(plant); shake(); }
      });
      plants.set(member.id,plant); el('gardenPlots').appendChild(plant);
    }
    layout();
  }
  function scheduleRefresh() {
    clearTimeout(refreshTimer);
    if (app.getScreen() === 'garden') refreshTimer = setTimeout(refresh,5000);
  }
  async function join(name) {
    if (!name || joinInFlight) return;
    pendingName = name; joinInFlight = true;
    el('gardenStatus').textContent = 'Đang thêm cụm hoa của bạn vào vườn.';
    try {
      const result = await request('POST',{name});
      applyGarden(result.garden); pendingName = '';
      el('retryGardenJoin').hidden = true;
      el('gardenStatus').textContent = `Đã thêm cụm hoa của bạn. Vườn có ${members.length} cụm hoa.`;
    } catch {
      el('retryGardenJoin').hidden = false;
      el('gardenStatus').textContent = 'Chưa thêm được cụm hoa. Có thể dùng nút thử kết nối lại.';
    } finally { joinInFlight = false; }
  }
  async function refresh() {
    if (refreshInFlight) return refreshInFlight;
    if (document.hidden) { scheduleRefresh(); return; }
    refreshInFlight = (async () => {
      try {
        if (pendingName) await join(pendingName);
        applyGarden(await request());
        if (!pendingName) el('retryGardenJoin').hidden = true;
      } catch { el('retryGardenJoin').hidden = false; el('gardenStatus').textContent = 'Vườn đang mất kết nối, sẽ tự thử lại.'; }
      finally { refreshInFlight = null; scheduleRefresh(); }
    })();
    return refreshInFlight;
  }
  async function openGarden() {
    previousScreen = app.getScreen();
    const joining = app.getName() ? join(app.getName()) : Promise.resolve();
    app.navigate('garden'); el('gardenLandscape').scrollIntoView({behavior:'instant'}); el('gardenScreen')?.focus(); layout();
    await joining; refresh();
  }
  scenery();
  document.querySelectorAll('[data-open-garden]').forEach(button => button.addEventListener('click',openGarden));
  el('gardenReturn').addEventListener('click',() => app.navigate(previousScreen === 'garden' ? 'letter' : previousScreen));
  el('retryGardenJoin').addEventListener('click',refresh);
  el('gardenSound').addEventListener('click',() => el('soundButton').click());
  const syncSound = () => {
    const playing = !el('bgMusic').paused;
    el('gardenSound').setAttribute('aria-pressed', String(playing));
    el('gardenSound').setAttribute('aria-label', playing ? 'Tắt nhạc Photograph' : 'Bật nhạc Photograph');
  };
  el('bgMusic').addEventListener('play',syncSound); el('bgMusic').addEventListener('pause',syncSound); syncSound();
  document.addEventListener('classroom:screen-changed',event => {
    hideName();
    if (event.detail.screen === 'garden') { layout(); if (!joinInFlight) refresh(); }
    else scheduleRefresh();
  });
  document.addEventListener('pointerdown', event => { if (namedPlant && !namedPlant.contains(event.target)) hideName(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hideName(); });
  document.addEventListener('visibilitychange',() => { if (!document.hidden && app.getScreen() === 'garden') refresh(); });
  new ResizeObserver(layout).observe(el('gardenPlots'));
  window.addEventListener('resize',layout);
})();
