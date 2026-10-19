'use strict';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const state = { name: '', screen: 'door', opening: false };
const FLOW = ['door', 'name', 'album', 'envelope', 'letter', 'garden', 'ticket'];
const FLOWER_COLORS = ['#fffdf5', '#bca4d9', '#f2c76b', '#e9b7a5', '#f8f4e4', '#c6b2df', '#d6a6b0', '#e8bf6d'];
let toastTimer;
let openTimer;
let activeScreen = $('.screen[data-screen="door"]');
let doorOpening = false;
let doorTimer;
let nameWrapping = false;
let nameWrapTimer;

function toast(message) {
  const el = $('#toast');
  clearTimeout(toastTimer);
  el.textContent = message;
  el.classList.add('visible');
  toastTimer = setTimeout(() => el.classList.remove('visible'), 3500);
}

// Code-drawn flowers keep the bouquet sharp, lightweight, and available offline.
function flowerHead(index, color, size = 1) {
  const variant = index % 4;
  let art = '';
  if (variant === 1) {
    art = `<path d="M-16-6Q-20 15 0 20Q20 15 16-6L7 2 0-12-7 2Z" fill="${color}"/><path d="M0-7V17" stroke="#ffffff66" stroke-width="1.4" fill="none"/>`;
  } else if (variant === 2) {
    for (let i = 0; i < 6; i++) art += `<ellipse cy="-9" rx="6" ry="10" fill="${color}" transform="rotate(${i * 60})"/>`;
    art += '<circle r="5" fill="#dcae4b"/><circle cx="-1.4" cy="-1.4" r="1.2" fill="#f8e8a6"/>';
  } else {
    for (let i = 0; i < 9; i++) art += `<ellipse cy="-11" rx="4.5" ry="10" fill="${color}" transform="rotate(${i * 40})"/>`;
    art += '<circle r="6" fill="#e5b84d"/><circle cx="-1.5" cy="-1.5" r="1.6" fill="#f6d978"/>';
  }
  return `<g transform="scale(${size})">${art}</g>`;
}

function keyboardFlower(index) {
  if (window.drawFlowerSprig) return window.drawFlowerSprig(index);
  const color = FLOWER_COLORS[index % FLOWER_COLORS.length];
  const head = flowerHead(index, color, .43);
  return `<svg viewBox="0 0 34 42" aria-hidden="true"><path d="M17 39Q16 23 17 12" stroke="#96a77d" stroke-width="1.1" fill="none"/><path d="M17 32Q7 30 9 24Q17 24 17 32M17 27Q24 25 25 19Q19 19 17 27" fill="#a6b68f"/><g transform="translate(17 12)">${head}</g></svg>`;
}

function buildKeyboard() {
  ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].forEach((row, rowIndex) => {
    const div = document.createElement('div');
    div.className = 'keyboard-row';
    [...row].forEach((letter) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'flower-key';
      button.dataset.key = letter;
      button.setAttribute('aria-label', `Thêm chữ ${letter}`);
      button.innerHTML = `${keyboardFlower(letter.charCodeAt(0) - 65)}<span>${letter}</span>`;
      div.appendChild(button);
    });
    if (rowIndex === 2) {
      const space = document.createElement('button');
      space.type = 'button';
      space.className = 'flower-key control space-key';
      space.dataset.key = ' ';
      space.textContent = 'cách';
      space.setAttribute('aria-label', 'Thêm dấu cách');
      div.appendChild(space);
      const backspace = document.createElement('button');
      backspace.type = 'button';
      backspace.className = 'flower-key control';
      backspace.dataset.key = 'Backspace';
      backspace.textContent = '⌫';
      backspace.setAttribute('aria-label', 'Xóa chữ trước con trỏ');
      div.appendChild(backspace);
      const confirm = document.createElement('button');
      confirm.type = 'submit';
      confirm.className = 'flower-key control confirm-key';
      confirm.textContent = 'OK';
      confirm.setAttribute('aria-label', 'Xác nhận tên và gói bó hoa');
      div.appendChild(confirm);
    }
    $('#flowerKeyboard').appendChild(div);
  });
}

function nameLetters(name) {
  return [...name.normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')].filter(c => /\p{L}/u.test(c));
}

function bouquetSVG(name, options = {}) {
  return window.drawBouquet(name, options);
}

let bouquetFrame = 0;
let previousNameLetters = 0;
let previousNameValue = '';
function updateNamePreview(event) {
  const input = $('#nameInput');
  const name = input.value.trim().replace(/\s+/g, ' ');
  $('#bouquetFor').textContent = name;
  $('#bouquetFor').hidden = !name;
  $('#nameError').textContent = '';
  $('.name-field').classList.remove('invalid');
  cancelAnimationFrame(bouquetFrame);
  bouquetFrame = requestAnimationFrame(() => {
    const art = $('#nameBouquet');
    const count = nameLetters(name).length;
    const added = Math.max(0, count - previousNameLetters);
    art.innerHTML = bouquetSVG(name, { wrapped: false, animateFrom: previousNameLetters });
    if (!event?.isComposing && added && name !== previousNameValue) {
      const lastLetter = nameLetters(event?.data || input.value.slice(0, input.selectionStart)).at(-1);
      for (let i = 0; i < Math.min(added, 3); i++) flyFlower(lastLetter, Math.max(0, count - 1 - i));
    }
    previousNameLetters = count;
    previousNameValue = name;
  });
}

buildKeyboard();
$('#nameBouquet').innerHTML = bouquetSVG('');
$('#nameInput').addEventListener('input', updateNamePreview);

function flyFlower(letter, index) {
  if (!letter || reducedMotion.matches || $$('.flower-flight').length >= 8) return;
  const key = $$('.flower-key').find(button => button.dataset.key === letter.toUpperCase());
  const source = (key || $('#nameInput')).getBoundingClientRect();
  const target = $$('#nameBouquet .bouquet-flower')[index]?.getBoundingClientRect();
  if (!target) return;
  const x = source.x + source.width / 2, y = source.y + source.height / 2;
  const flower = document.createElement('span');
  flower.className = 'flower-flight';
  flower.setAttribute('aria-hidden', 'true');
  flower.innerHTML = keyboardFlower(letter.toUpperCase().charCodeAt(0) - 65);
  flower.style.left = `${x}px`;
  flower.style.top = `${y}px`;
  flower.style.setProperty('--flight-x', `${target.x + target.width / 2 - x}px`);
  flower.style.setProperty('--flight-y', `${target.y + target.height / 2 - y}px`);
  document.body.appendChild(flower);
  setTimeout(() => flower.remove(), 760);
  for (let i = 0; i < 6; i++) {
    const petal = document.createElement('i');
    petal.className = 'typing-petal';
    petal.setAttribute('aria-hidden', 'true');
    petal.style.left = `${x}px`;
    petal.style.top = `${y}px`;
    petal.style.setProperty('--petal-color', FLOWER_COLORS[(index + i) % FLOWER_COLORS.length]);
    petal.style.setProperty('--petal-x', `${(Math.random() - .5) * 130}px`);
    petal.style.setProperty('--petal-y', `${-35 - Math.random() * 85}px`);
    petal.style.setProperty('--petal-turn', `${Math.random() * 240}deg`);
    document.body.appendChild(petal);
    setTimeout(() => petal.remove(), 1050);
  }
}

// Keep the insertion position when the flower keyboard takes focus.
let selection = { start: 0, end: 0 };
function rememberSelection() {
  selection = { start: $('#nameInput').selectionStart, end: $('#nameInput').selectionEnd };
}
$('#nameInput').addEventListener('select', rememberSelection);
$('#nameInput').addEventListener('keyup', rememberSelection);
$('#nameInput').addEventListener('click', rememberSelection);
$('#nameInput').addEventListener('input', rememberSelection);
$('#nameInput').addEventListener('blur', rememberSelection);
const keyTimers = new WeakMap();
function flashFlowerKey(key) {
  const button = $$('.flower-key').find(el => el.dataset.key === key);
  if (!button) return;
  clearTimeout(keyTimers.get(button));
  button.classList.add('pressed');
  keyTimers.set(button, setTimeout(() => button.classList.remove('pressed'), 180));
}

function focusNameOnDesktop() {
  // Avoid opening a phone's software keyboard before the visitor taps the field.
  if (state.screen === 'name' && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $('#nameInput').focus({ preventScroll: true });
  }
}
focusNameOnDesktop();

$('#flowerKeyboard').addEventListener('pointerdown', () => {
  if (document.activeElement === $('#nameInput')) rememberSelection();
});
$('#flowerKeyboard').addEventListener('click', event => {
  const button = event.target.closest('button[data-key]');
  if (!button) return;
  insertNameKey(button.dataset.key);
});

function insertNameKey(key) {
  const input = $('#nameInput');
  let { start, end } = selection;
  let insertion = key;
  if (key === 'Backspace') {
    insertion = '';
    if (start === end && start > 0) {
      const prefix = input.value.slice(0, start);
      const graphemes = typeof Intl.Segmenter === 'function'
        ? [...new Intl.Segmenter('vi', { granularity: 'grapheme' }).segment(prefix)].map(x => x.segment)
        : [...prefix];
      start -= graphemes.at(-1)?.length || 0;
    }
  }
  const next = input.value.slice(0, start) + insertion + input.value.slice(end);
  if (next.length > input.maxLength) { toast('Tên tối đa 30 ký tự.'); return; }
  input.value = next;
  selection = { start: start + insertion.length, end: start + insertion.length };
  input.setSelectionRange(selection.start, selection.end);
  updateNamePreview({ data: key });

  flashFlowerKey(key === 'Backspace' || key === ' ' ? key : key.toUpperCase());
}

// Native typing stays native inside the field, including Vietnamese IME,
// selection, paste, arrow keys, and operating-system editing shortcuts.
document.addEventListener('keydown', event => {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey ||
      event.isComposing || event.keyCode === 229) return;

  const target = event.target instanceof Element ? event.target : null;
  if (target?.closest('dialog[open]')) return;
  const isEditable = target?.closest('input, textarea, select, [contenteditable="true"]');
  if (state.screen === 'name' && nameWrapping) { event.preventDefault(); return; }
  if (state.screen === 'name') {
    const flowerKey = event.key === 'Backspace' || event.key === ' ' ? event.key
      : /^Key[A-Z]$/.test(event.code) ? event.code.slice(3) : event.key.toUpperCase();
    flashFlowerKey(flowerKey);
    if (event.key === ' ' && target?.closest('button, a')) return;
    if (target !== $('#nameInput') && !isEditable && (event.key === 'Backspace' ||
        (event.key.length === 1 && /[\p{L}\p{M}\s.'’\-]/u.test(event.key)))) {
      event.preventDefault();
      $('#nameInput').focus({ preventScroll: true });
      insertNameKey(event.key);
      return;
    }
  } else if (isEditable) return;

  // Holding Enter must never skip multiple steps as the focused screen changes.
  if (event.key === 'Enter' && event.repeat) { event.preventDefault(); return; }
  if (event.repeat) return;

  if (event.key === 'Escape') {
    const back = activeScreen.querySelector('[data-back]');
    if (back) { event.preventDefault(); back.click(); }
    return;
  }
  // Buttons and links keep their normal Enter behavior for Tab navigation.
  if (event.key !== 'Enter' || target?.closest('button, a')) return;
  const next = { door: '#openDoor', envelope: '#openLetter' }[state.screen];
  if (state.screen === 'name') {
    event.preventDefault();
    $('#nameForm').requestSubmit();
  } else if (next) {
    event.preventDefault();
    if (!$(next).disabled) $(next).click();
  }
});

$('#nameForm').addEventListener('submit', event => {
  event.preventDefault();
  if (nameWrapping) return;
  const name = $('#nameInput').value.normalize('NFC').trim().replace(/\s+/g, ' ');
  if (!name || name.length > 30 || !/^[\p{L}\p{M}\s.'’\-]+$/u.test(name) || !/\p{L}/u.test(name)) {
    $('#nameError').textContent = !name ? 'Nhập tên trước khi tiếp tục.' : name.length > 30 ? 'Tên tối đa 30 ký tự.' : 'Nhập tên bằng chữ.';
    $('.name-field').classList.add('invalid');
    $('#nameInput').focus();
    return;
  }
  state.name = name;
  $('#nameInput').value = name;
  selection = { start: name.length, end: name.length };
  cancelAnimationFrame(bouquetFrame);
  $('#bouquetFor').textContent = name;
  $('#bouquetFor').hidden = false;
  $('#nameBouquet').innerHTML = bouquetSVG(name, { wrapped: true, animateFrom: Infinity });
  const friendlyName = window.ClassroomPersonalization.formatGreetingName(name);
  $$('[data-personal-name]').forEach(el => { el.textContent = friendlyName; });
  $('#letterBouquet').innerHTML = bouquetSVG(name);
  nameWrapping = true;
  $('.name-screen').classList.add('is-wrapping');
  $('#nameInput').disabled = true;
  $$('#flowerKeyboard button').forEach(button => { button.disabled = true; });
  nameWrapTimer = setTimeout(() => goTo('album'), reducedMotion.matches ? 50 : 850);
});

function goTo(screen) {
  if (!FLOW.includes(screen)) return;
  state.screen = screen;
  document.body.dataset.view = screen;
  activeScreen.hidden = true;
  activeScreen = $(`.screen[data-screen="${screen}"]`);
  activeScreen.hidden = false;
  $('.journey').hidden = ['door', 'name', 'album', 'garden', 'ticket'].includes(screen);
  $('.name-screen').inert = screen !== 'name';
  const stepIndex = Math.max(0, Math.min(FLOW.indexOf(screen) - 1, 1));
  if (screen === 'door') {
    doorOpening = false;
    $('#doorFrame').classList.remove('is-opening');
    $('#openDoor').disabled = false;
    $('.name-screen').hidden = true;
  }
  if (screen === 'name') {
    nameWrapping = false;
    $('.name-screen').classList.remove('is-wrapping');
    $('#nameInput').disabled = false;
    $$('#flowerKeyboard button').forEach(button => { button.disabled = false; });
    $('#nameBouquet').innerHTML = bouquetSVG($('#nameInput').value, { wrapped: false, animateFrom: Infinity });
  }
  $$('#progressSteps li').forEach((step, i) => {
    step.classList.toggle('current', i === stepIndex);
    step.classList.toggle('done', i < stepIndex);
    if (i === stepIndex) step.setAttribute('aria-current', 'step');
    else step.removeAttribute('aria-current');
    step.querySelector('.step-dot').textContent = i < stepIndex ? '✓' : String(i + 1);
  });
  const heading = activeScreen.querySelector('h1,h2');
  heading?.focus({ preventScroll: true });
  if (screen === 'name' || screen === 'door') window.scrollTo({ top: 0, behavior: 'instant' });
  if (screen === 'door') $('#openDoor').focus({ preventScroll: true });
  if (screen === 'name') focusNameOnDesktop();
  if (window.scrollY > 100) $('#app').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  if (screen === 'envelope') {
    state.opening = false;
    $('#envelope').classList.remove('open');
    $('#envelope').disabled = false;
    $('#openLetter').disabled = false;
  }
  if (screen === 'letter') {
    loadCaptureLibrary().catch(() => {});
  }
  document.dispatchEvent(new CustomEvent('classroom:screen-changed', { detail: { screen } }));
}

$$('[data-back], [data-next]').forEach(button => button.addEventListener('click', () => {
  clearTimeout(openTimer);
  goTo(button.dataset.back || button.dataset.next);
}));

async function letterRequest() {
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch('/api/letter', {
      method:'POST', credentials:'same-origin', cache:'no-store', signal:controller.signal,
      headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ action:'reserve' })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Chưa lấy được thư. Cậu thử lại nhé.');
    return data;
  } finally { clearTimeout(timer); }
}
async function openLetter() {
  if (state.opening) return;
  state.opening = true;
  $('#envelope').disabled = true;
  $('#openLetter').disabled = true;
  $('#envelopeStatus').textContent = 'Đang lấy một bức thư…';
  try {
    const record = await letterRequest();
    if (state.screen !== 'envelope') return;
    $('#letterBody').replaceChildren(...record.letter.paragraphs.map(text => {
      const p = document.createElement('p'); p.textContent = window.ClassroomPersonalization.personalizeText(text, state.name); return p;
    }));
    $('#letterSignature').textContent = record.letter.signature;
    $('#letterStatus').textContent = ''; $('#retryLetter').hidden = true;
    $('#envelopeStatus').textContent = '';
    $('#envelope').classList.add('open');
    window.ClassroomEffects?.paper('envelope');
    window.ClassroomEffects?.letterPetals();
    openTimer = setTimeout(() => {
      goTo('letter');
    }, reducedMotion.matches ? 50 : 1100);
  } catch (error) {
    if (state.screen === 'envelope') {
      $('#envelopeStatus').textContent = error.name === 'AbortError' ? 'Kết nối hơi lâu. Cậu bấm mở thư để thử lại nhé.' : error.message;
      state.opening = false; $('#envelope').disabled = false; $('#openLetter').disabled = false;
    }
  }
}
$('#envelope').addEventListener('click', openLetter);
$('#openLetter').addEventListener('click', openLetter);

$('#restartButton').addEventListener('click', () => {
  clearTimeout(openTimer);
  clearTimeout(nameWrapTimer);
  nameWrapping = false;
  state.name = '';
  state.opening = false;
  $('#nameInput').value = '';
  selection = { start: 0, end: 0 };
  updateNamePreview();
  stopMusic(true);
  goTo('door');
});

// Friendly star trail: throttled, capped, and disabled for reduced motion.
let lastPointerTime = 0;
let previousPoint = { x: -100, y: -100 };
const trailColors = ['#c4a4de', '#dfbb59', '#aab991', '#e0ac98'];
function cursorSparkle(x, y) {
  if (reducedMotion.matches || $('#cursorStars').childElementCount >= 32) return;
  const particle = document.createElement('span');
  particle.className = 'cursor-star';
  particle.textContent = Math.random() > .5 ? '✦' : '✧';
  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;
  particle.style.color = trailColors[Math.floor(Math.random() * trailColors.length)];
  particle.style.fontSize = `${12 + Math.random() * 12}px`;
  particle.style.setProperty('--dx', `${(Math.random() - .5) * 58}px`);
  $('#cursorStars').appendChild(particle);
  setTimeout(() => particle.remove(), 850);
}
document.addEventListener('pointermove', event => {
  if (state.screen === 'door' || event.pointerType === 'touch') return;
  const now = performance.now();
  if (now - lastPointerTime < 42 || Math.hypot(event.clientX - previousPoint.x, event.clientY - previousPoint.y) < 5) return;
  lastPointerTime = now;
  previousPoint = { x: event.clientX, y: event.clientY };
  cursorSparkle(event.clientX, event.clientY);
}, { passive: true });
document.addEventListener('pointerdown', event => {
  if (state.screen !== 'door' && event.pointerType === 'touch') cursorSparkle(event.clientX, event.clientY);
}, { passive: true });

// Photograph starts inside the opening click so browsers permit playback.
const backgroundMusic = $('#bgMusic');
const MUSIC_VOLUME = .16;
let musicRequested = false;
let musicRequest = 0;
let volumeFrame = 0;

function updateMusicButton() {
  const playing = !backgroundMusic.paused && musicRequested;
  $('#soundButton').setAttribute('aria-pressed', String(playing));
  $('#soundButton').setAttribute('aria-label', playing ? 'Tắt nhạc Photograph' : 'Bật nhạc Photograph');
  $('#soundLabel').textContent = playing ? 'Photograph · đang phát' : 'Bật nhạc';
}
function fadeMusic() {
  cancelAnimationFrame(volumeFrame);
  const start = performance.now();
  const from = backgroundMusic.volume;
  function tick(now) {
    if (!musicRequested || backgroundMusic.paused) return;
    const progress = Math.max(0, Math.min((now - start) / 3200, 1));
    backgroundMusic.volume = from + (MUSIC_VOLUME - from) * progress;
    if (progress < 1) volumeFrame = requestAnimationFrame(tick);
  }
  volumeFrame = requestAnimationFrame(tick);
}
function startMusic() {
  const request = ++musicRequest;
  musicRequested = true;
  backgroundMusic.volume = 0;
  // A failed media request needs a fresh load before the next user-triggered play.
  if (backgroundMusic.error || backgroundMusic.readyState === 0) backgroundMusic.load();
  const playback = backgroundMusic.play();
  if (playback) playback.then(() => {
    if (request === musicRequest && musicRequested) { updateMusicButton(); fadeMusic(); }
  }).catch(() => {
    if (request !== musicRequest) return;
    musicRequested = false;
    updateMusicButton();
    toast('Bấm nút nhạc ở góc trang để bật Photograph.');
  });
}
function stopMusic(restart = false) {
  ++musicRequest;
  musicRequested = false;
  cancelAnimationFrame(volumeFrame);
  backgroundMusic.pause();
  if (restart) backgroundMusic.currentTime = 0;
  updateMusicButton();
}
backgroundMusic.addEventListener('playing', updateMusicButton);
backgroundMusic.addEventListener('pause', updateMusicButton);
$('#soundButton').addEventListener('click', () => {
  if (musicRequested) stopMusic();
  else startMusic();
});
function openDoor() {
  if (doorOpening) return;
  doorOpening = true;
  $('#openDoor').disabled = true;
  $('.name-screen').hidden = false;
  $('#doorFrame').classList.add('is-opening');
  startMusic();
  doorTimer = setTimeout(() => goTo('name'), reducedMotion.matches ? 180 : 2050);
}
$('#openDoor').addEventListener('click', openDoor);

let capturePromise;
function loadCaptureLibrary() {
  if (window.html2canvas) return Promise.resolve(window.html2canvas);
  if (capturePromise) return capturePromise;
  capturePromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'html2canvas.min.js';
    script.onload = () => resolve(window.html2canvas);
    script.onerror = () => { script.remove(); capturePromise = undefined; reject(new Error('Cannot load capture library')); };
    document.head.appendChild(script);
  });
  return capturePromise;
}

$('#saveButton').addEventListener('click', async () => {
  const button = $('#saveButton');
  button.disabled = true;
  button.textContent = 'Đang lưu ảnh…';
  try {
    const html2canvas = await loadCaptureLibrary();
    await document.fonts.ready;
    const canvas = await html2canvas($('#letterCapture'), {
      scale: 2,
      backgroundColor: '#fffdf6',
      useCORS: false,
      logging: false,
      onclone: doc => {
        const card = doc.querySelector('#letterCapture');
        card.style.boxShadow = 'none';
        card.classList.add('capture-frozen');
      }
    });
    const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Empty image')), 'image/png'));
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const safeName = state.name.normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'ban-cung-lop';
    anchor.download = `20-10-gui-${safeName}.png`;
    anchor.href = url;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    toast('Đã tải thiệp.');
  } catch {
    toast('Chưa lưu được ảnh. Hãy thử lại.');
  } finally {
    button.disabled = false;
    button.innerHTML = '<svg><use href="#icon-download"/></svg> Lưu thiệp về máy';
  }
});

window.ClassroomApp = Object.freeze({
  getScreen: () => state.screen,
  getName: () => state.name,
  navigate(screen) {
    clearTimeout(doorTimer);
    clearTimeout(nameWrapTimer);
    clearTimeout(openTimer);
    goTo(screen);
  },
  toast
});
