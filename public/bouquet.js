/* Original SVG illustration inspired by spring bouquets: tulips, daisies,
   eucalyptus, baby's breath, layered tissue paper and a satin ribbon. */
(() => {
  let serial = 0;
  const palette = ['#fffaf0', '#b8a3df', '#f3c76b', '#edb9a1', '#faf7ed', '#cec1ee', '#d5a6ba', '#f6dc95'];
  const mix = (hex, target, amount) => '#' + [0, 1, 2].map(i => {
    const value = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
    return Math.round(value + (target - value) * amount).toString(16).padStart(2, '0');
  }).join('');

  function bloom(kind, tone, id, colors = palette) {
    const petal = `url(#${id}-p${tone})`;
    const light = mix(colors[tone], 255, .45);
    const dark = mix(colors[tone], 90, .2);
    let result = '';
    if (kind === 1) {
      // Tulip: overlapping cupped petals, a bright center and fine veins.
      result = `<path d="M-22-13Q-28 10-8 23Q1 29 12 19L13-13Q4-8 0-22Q-7-10-22-13" fill="${dark}"/>
        <path d="M-23-14Q-27 9-7 24Q0 28 4 19Q5-1-8-15Q-17-20-23-14" fill="${petal}"/>
        <path d="M22-14Q27 9 7 24Q0 28-4 19Q-5-1 8-15Q17-20 22-14" fill="${petal}"/>
        <path d="M0-22Q-17-8-11 13Q-2 34 9 15Q19-9 0-22" fill="${light}"/>
        <path d="M0-17Q-4 4 0 22M-20-11Q-17 10-5 21M20-11Q17 10 5 21" fill="none" stroke="${dark}" stroke-width=".65" opacity=".5"/>
        <path d="m-11 23 11 8 12-9-12 2Z" fill="#89a980"/>`;
    } else if (kind === 2) {
      // Ranunculus-like flower: many thin, irregular overlapping petals.
      for (let ring = 0; ring < 3; ring++) {
        const petals = 11 - ring * 2;
        for (let n = 0; n < petals; n++) {
          result += `<path d="M-8-8Q-17-22-9-28Q0-34 9-27Q17-19 7-7Z" transform="rotate(${n * 360 / petals + ring * 19}) scale(${1 - ring * .24})" fill="${ring === 1 ? light : petal}" stroke="${dark}" stroke-width=".35"/>`;
        }
      }
      result += `<circle r="6" fill="${dark}"/><path d="M-4-1Q4-7 5 0T-2 5Q-5 1 0-2" fill="none" stroke="${light}" stroke-width="1.7"/>`;
    } else if (kind === 4) {
      // Garden rose: curled, overlapping petals and a folded spiral heart.
      for (let ring=0;ring<3;ring++) for(let n=0;n<7;n++) result += `<path d="M-5-5C-25-12-30-31-10-33C7-40 25-18 6-3Z" transform="rotate(${n*360/7+ring*25}) scale(${1-ring*.25})" fill="${ring%2?light:petal}" stroke="${dark}" stroke-width=".6"/>`;
      result += `<path d="M-5 4C-14-8 10-16 10-2C10 10-7 11-5 1C-2-7 8-2 2 4" fill="none" stroke="${dark}" stroke-width="2"/>`;
    } else if (kind === 5) {
      for(let ring=0;ring<2;ring++) for(let n=0;n<16;n++) result += `<path d="M-4-8Q-15-29 0-40Q15-29 4-8Z" transform="rotate(${n*22.5+ring*11.25}) scale(${1-ring*.12})" fill="${ring?light:petal}" stroke="${dark}" stroke-width=".3"/>`;
      result += '<circle r="15" fill="#86613d"/><circle r="11" fill="#a57a46"/>';
      for(let n=0;n<34;n++)result += `<circle cx="${Math.cos(n*2.4)*Math.sqrt(n)*1.8}" cy="${Math.sin(n*2.4)*Math.sqrt(n)*1.8}" r=".9" fill="#e7bd6d"/>`;
    } else if (kind === 6) {
      for(let n=0;n<6;n++) result += `<g transform="rotate(${n*60})"><path d="M0 6C-24-8-21-25 0-43C21-25 24-8 0 6" fill="${n%2?light:petal}" stroke="${dark}" stroke-width=".5"/><path d="M0 2V-34" stroke="${dark}" opacity=".3" fill="none"/></g>`;
      for(let n=0;n<5;n++){const a=n*1.256;result+=`<path d="M0 4L${Math.cos(a)*15} ${Math.sin(a)*13-4}" stroke="#9aab64" fill="none" stroke-width="1.2"/><ellipse cx="${Math.cos(a)*15}" cy="${Math.sin(a)*13-4}" rx="3" ry="1.6" fill="#c48c4f"/>`;}
    } else if (kind === 7) {
      for(let n=0;n<17;n++) {const x=Math.cos(n*2.4)*Math.sqrt(n)*7,y=Math.sin(n*2.4)*Math.sqrt(n)*6;result+=`<g transform="translate(${x} ${y}) rotate(${n*17})">${[0,90,180,270].map(a=>`<ellipse cy="-4" rx="4.3" ry="5.6" transform="rotate(${a})" fill="${n%3?petal:light}" stroke="${dark}" stroke-opacity=".25" stroke-width=".4"/>`).join('')}<circle r="1.6" fill="#f4dfac"/></g>`;}
    } else if (kind === 8) {
      for(let ring=0;ring<3;ring++)for(let n=0;n<9;n++)result+=`<path d="M-5-4L-14-16-12-21-16-26-9-27-8-33-2-31 2-36 7-30 13-30 12-24 17-20 11-15 5-4Z" transform="rotate(${n*40+ring*17}) scale(${1-ring*.25})" fill="${ring%2?light:petal}" stroke="${dark}" stroke-width=".4"/>`;
      result+=`<circle r="4" fill="${dark}"/>`;
    } else if (kind === 9) {
      result=`<path d="M0 6C-24-4-30-30-12-32Q2-31 0-4C5-38 28-42 31-22Q31-5 0 6" fill="${petal}"/><path d="M0 4C-17-26-49-18-35 3Q-20 18 0 4M0 4C18-27 49-17 35 5Q20 20 0 4" fill="${light}" stroke="${dark}" stroke-width=".5"/><path d="M-3 4Q-29 28-10 32Q0 18 10 32Q29 28 3 4Z" fill="${petal}" stroke="${dark}" stroke-width=".7"/><path d="M-9 9Q0 28 9 9Q0 4-9 9" fill="#c66c9d"/><circle cy="3" r="4" fill="#e7c864"/>`;
    } else if (kind === 10) {
      result='<path d="M0 20V-39" stroke="#7d997b" stroke-width="1.4" fill="none"/>';
      for(let n=0;n<8;n++){const y=10-n*6;result+=`<ellipse cx="${n%2?4:-4}" cy="${y}" rx="5.5" ry="4" fill="${n%3?petal:light}" transform="rotate(${n%2?-28:28} ${n%2?4:-4} ${y})"/>`;}
      result+=`<ellipse cy="-40" rx="3.5" ry="5" fill="${light}"/>`;
    } else if (kind === 11) {
      for(let ring=0;ring<4;ring++)for(let n=0;n<10-ring;n++)result+=`<path d="M-6-4C-19-13-21-30-9-34Q-3-40 1-33Q13-41 18-28C24-13 12-6 6-3Z" transform="rotate(${n*360/(10-ring)+ring*19}) scale(${1-ring*.19})" fill="${ring%2?light:petal}" stroke="${dark}" stroke-opacity=".35" stroke-width=".45"/>`;
      result+=`<path d="M-4 1Q1-6 5 0L1 5Z" fill="${dark}"/>`;
    } else if (kind === 12) {
      for(let n=0;n<7;n++) result+=`<ellipse cy="-15" rx="12" ry="20" transform="rotate(${n*360/7})" fill="${n%2?light:petal}" stroke="${dark}" stroke-opacity=".2" stroke-width=".5"/>`;
      result+='<circle r="11" fill="#66536e"/>';
      for(let n=0;n<13;n++)result+=`<circle cx="${Math.cos(n*6.283/13)*13}" cy="${Math.sin(n*6.283/13)*13}" r="1.6" fill="#77617e"/>`;
    } else if (kind === 3) {
      for(let n=0;n<8;n++) result+=`<path d="M-2-5Q-20-19-12-31L-5-29 0-34 5-29 12-31Q20-19 2-5Z" transform="rotate(${n*45})" fill="${petal}" stroke="${dark}" stroke-opacity=".2" stroke-width=".5"/>`;
      result+='<circle r="7" fill="#edc866"/><circle r="4" fill="#d4a449"/>';
    } else {
      const petals = 13;
      for (let n = 0; n < petals; n++) {
        result += `<g transform="rotate(${n * 360 / petals})"><path d="M-2-6C-10-13-10-29-3-31Q0-34 3-31C10-29 10-13 2-6Z" fill="${petal}" stroke="${dark}" stroke-opacity=".18" stroke-width=".5"/><path d="M0-9V-27" stroke="${light}" stroke-width=".65" opacity=".9"/></g>`;
      }
      if (kind !== 3) {
        for (let n = 0; n < 10; n++) result += `<ellipse cy="-13" rx="3.2" ry="10" fill="${light}" transform="rotate(${n * 36 + 12})" opacity=".85"/>`;
      }
      result += `<circle r="9" fill="url(#${id}-gold)"/><circle cy="-2" r="6.5" fill="#efc55c"/>`;
      for (let n = 0; n < 17; n++) {
        const angle = n * 2.4, radius = Math.sqrt(n) * 1.65;
        result += `<circle cx="${(Math.cos(angle) * radius).toFixed(1)}" cy="${(Math.sin(angle) * radius - 1).toFixed(1)}" r=".7" fill="${n % 2 ? '#fff1a9' : '#cb9d38'}"/>`;
      }
    }
    return result;
  }

  function eucalyptus(x, y, angle, scale, id, index) {
    let leaves = `<path d="M0 0Q8-65 0-137" stroke="#799a85" stroke-width="1.5" fill="none"/>`;
    for (let n = 0; n < 6; n++) {
      const yy = -17 - n * 19, size = 13 - n * 1.1;
      leaves += `<ellipse cx="${-size * .58}" cy="${yy}" rx="${size}" ry="${size * .7}" fill="url(#${id}-leaf)" transform="rotate(28 ${-size * .58} ${yy})"/>
        <ellipse cx="${size * .65}" cy="${yy - 8}" rx="${size * .95}" ry="${size * .7}" fill="${n % 2 ? '#a6bea9' : '#8fac99'}" transform="rotate(-32 ${size * .65} ${yy - 8})"/>
        <path d="M0 ${yy + 5}l${-size} -8m${size} -2 ${size} -8" stroke="#d5dfca" stroke-width=".55" fill="none" opacity=".7"/>`;
    }
    return `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})"><g class="foliage-sway" style="--sway-delay:${index * -.7}s">${leaves}</g></g>`;
  }

  function fillers(x, y, angle, color, index) {
    let result = '<path d="M0 0Q3-53 0-100" stroke="#90ab83" stroke-width="1" fill="none"/>';
    for (let n = 0; n < 5; n++) {
      const yy = -38 - n * 13;
      const direction = n % 2 ? 1 : -1;
      const xx = direction * (18 - n * 2);
      result += `<path d="M1 ${yy + 15}Q${xx} ${yy + 8} ${xx} ${yy}" stroke="#9bb38c" stroke-width=".7" fill="none"/>`;
      for (let k = 0; k < 4; k++) {
        const bx = xx + Math.cos(k * 1.7) * 5, by = yy + Math.sin(k * 1.7) * 4;
        result += `<g transform="translate(${bx.toFixed(1)} ${by.toFixed(1)})"><circle cx="-2" r="2.7" fill="${color}"/><circle cx="2" r="2.7" fill="${color}"/><circle cy="-2" r="2.7" fill="${color}"/><circle cy="2" r="2.7" fill="${color}"/><circle r="1.2" fill="#e8ca7b"/></g>`;
      }
    }
    return `<g transform="translate(${x} ${y}) rotate(${angle})"><g class="foliage-sway" style="--sway-delay:${index * -.4}s">${result}</g></g>`;
  }

  const normalizeName = name => name.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi');
  function hashName(value) {
    let hash = 2166136261;
    for (const char of value) hash = Math.imul(hash ^ char.codePointAt(0), 16777619);
    return hash >>> 0;
  }
  const validColor = value => typeof value === 'string' && /^#[a-f\d]{6}$/i.test(value);


  const species = { daisy:0, tulip:1, ranunculus:2, cosmos:3, rose:4, sunflower:5, lily:6, hydrangea:7, carnation:8, orchid:9, lavender:10, peony:11, anemone:12 };
  const families = [[0,3,10],[1,4,0],[4,11,10],[5,0,3],[6,4,9],[7,1,10],[11,2,4],[9,6,10],[8,4,0],[12,1,10],[2,4,3],[3,8,7]];
  const colorways = [
    ['#fff8e9','#af89d4','#eed077','#c8a6df','#f9efde','#dbc3e7','#b799d1','#f3dfa2'],
    ['#fff0e5','#d97d9e','#e7afc4','#edb49c','#fae3dc','#b680b4','#efc4cd','#ebce9a'],
    ['#fff3c8','#e9b63d','#f4d16c','#e4a359','#fffae9','#d9ad6d','#edc48e','#eadcaa'],
    ['#fff2de','#eba184','#f1c4b2','#efc784','#fae3c7','#d99aa9','#dbc2dc','#edceaa'],
    ['#f1f1fa','#8f9fce','#b3b4df','#a1c8d8','#fff8ee','#b59bcf','#c3a8dc','#ebd8ab'],
    ['#fff8f0','#c97cab','#ad8dce','#e7a5c0','#f6d6df','#bc9ed6','#efd2af','#e6b9d4'],
    ['#fffdf0','#b7c994','#d3d9b2','#f0dfaf','#faf3d9','#97b4a0','#d4c0df','#e5c8a6'],
    ['#fff1df','#e1a664','#e8c17c','#cf8c85','#f5dcc6','#c293b8','#d8b5cc','#f0d9a0']
  ];
  function themeFor(name) {
    const seed = hashName(normalizeName(name));
    return { seed, family: (seed >>> 11) % families.length, colorway: (seed >>> 3) % colorways.length };
  }
  const keyFlowers = { G:4, R:4, V:4, K:6, L:6, Y:6 };
  const letterKind = letter => keyFlowers[letter.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase()];
  window.drawFlowerSprig = index => {
    const kind = letterKind(String.fromCharCode(65 + index)) ?? (index * 5) % 13, tone = (index + 1) % palette.length;
    const colors = colorways[index % colorways.length].slice(), id = `sprig-${++serial}`;
    if (kind === 10) colors[tone] = '#a386c5';
    if (kind === 5) colors[tone] = '#efc04d';
    if (kind === 4) colors[tone] = ['#dc7d9f','#eeae9b','#c56896'][index % 3];
    if (kind === 6) colors[tone] = ['#fff8ec','#eeb2cc','#f3d69b'][index % 3];
    return `<svg viewBox="0 0 48 62" aria-hidden="true"><defs><radialGradient id="${id}-p${tone}"><stop stop-color="${mix(colors[tone],255,.4)}"/><stop offset="1" stop-color="${colors[tone]}"/></radialGradient><radialGradient id="${id}-gold"><stop stop-color="#ffe6a0"/><stop offset="1" stop-color="#cfa23e"/></radialGradient><g id="${id}-head">${bloom(kind,tone,id,colors)}</g></defs><path d="M24 59Q25 31 24 15M24 58Q15 39 12 29M24 58Q35 44 36 31" stroke="#86a379" stroke-width="1.1" fill="none"/><path d="M24 47Q13 45 13 38Q23 39 24 47M25 42Q35 38 36 33Q27 34 25 42" fill="#a5bc92"/><use href="#${id}-head" transform="translate(24 16) scale(.30)"/><use href="#${id}-head" transform="translate(12 30) scale(.20) rotate(-16)"/><use href="#${id}-head" transform="translate(36 31) scale(.19) rotate(15)"/></svg>`;
  };

  window.drawBouquet = (name = '', options = {}) => {
    const canonical = normalizeName(name);
    let letters = [...canonical].filter(c => /\p{L}/u.test(c));
    if (!letters.length) return '';
    const seed = hashName(canonical);
    const configured = Object.entries(window.FLOWER_PROFILES || {}).find(([key]) => normalizeName(key) === canonical)?.[1] || {};
    const theme = themeFor(canonical);
    const colors = colorways[theme.colorway].map((color, i) => validColor(configured.color) && i % 3 === 1 ? configured.color : color);
    const papers = ['#d7c7eb', '#c9dfcc', '#e2d2bb', '#eacbc0', '#ccdce9'];
    const ribbons = ['#ead08e', '#a9c3a0', '#bc9cd5', '#e6b8a2', '#94b9c4'];
    const paper = validColor(configured.wrapping) ? configured.wrapping : papers[seed % papers.length];
    const ribbon = ribbons[(seed >>> 5) % ribbons.length];
    const selectedKind = species[configured.flower];
    const wrapped = options.wrapped !== false;
    const id = `flowers-${++serial}`;
    const positions = [[225,92,-4],[159,115,-17],[294,119,13],[108,166,-26],[340,173,24],[194,166,-8],[267,171,12],[146,220,-15],[310,228,20],[228,228,5],[187,65,-11],[267,62,9]];
    // Short names receive the same full canopy, without changing their letter stems.
    const baseDensity = Math.max(positions.length, letters.length);
    const branchCount = baseDensity;
    // Up to four garden accents fill the deficit; already-full clumps stay intact.
    const gardenAccents = options.garden ? Math.min(4, baseDensity - letters.length) : 0;
    const gardenStart = branchCount - gardenAccents;
    const fillPositions = [[112,111,-22],[339,115,20],[113,218,-20],[337,219,20],[224,139,0],[169,182,-10],[285,184,12],[219,254,1],[184,66,-11],[271,65,9],[146,223,-15],[308,226,20],[195,166,-8],[265,171,12]];
    const gardenPositions = [[169,152,-10],[284,154,10],[191,240,-7],[270,241,8]];
    let gradients = `<linearGradient id="${id}-leaf" x2="1" y2="1"><stop stop-color="#bfd0b5"/><stop offset="1" stop-color="#759c85"/></linearGradient>
      <linearGradient id="${id}-paper" x1="0" x2="1" y1="0" y2=".5"><stop stop-color="${mix(paper,255,.4)}"/><stop offset=".5" stop-color="${paper}"/><stop offset="1" stop-color="${mix(paper,255,.3)}"/></linearGradient>
      <linearGradient id="${id}-cream" x1="0" x2="1" y2="1"><stop stop-color="#fffdf4"/><stop offset="1" stop-color="#e9dfc9"/></linearGradient>
      <linearGradient id="${id}-ribbon" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${ribbon}"/><stop offset=".4" stop-color="${mix(ribbon,255,.4)}"/><stop offset=".7" stop-color="${mix(ribbon,90,.12)}"/><stop offset="1" stop-color="${ribbon}"/></linearGradient>
      <radialGradient id="${id}-gold" cx=".35" cy=".3"><stop stop-color="#ffe29a"/><stop offset="1" stop-color="#cfa039"/></radialGradient>`;
    colors.forEach((color,i) => { gradients += `<radialGradient id="${id}-p${i}" cx=".3" cy=".15" r=".95"><stop stop-color="${mix(color,255,.55)}"/><stop offset=".6" stop-color="${color}"/><stop offset="1" stop-color="${mix(color,95,.15)}"/></radialGradient>`; });
    let foliage = '', stems = '', heads = '', baby = '';
    const headDefinitions = new Map();
    const leafPositions = [[138,285,-38,.7],[322,285,40,.7],[178,238,-18,.85],[289,245,27,.8],[219,241,-1,.9],[99,273,-49,.6],[357,283,52,.6]];
    leafPositions.slice(0, Math.floor(branchCount / 2)).forEach((point,i) => { foliage += eucalyptus(...point,id,i); });
    [[120,240,-24],[341,256,26],[176,157,-13],[290,188,18],[220,210,-4],[98,280,-52]].slice(0,Math.floor(branchCount/3)).forEach(([x,y,a],i) => { baby += fillers(x,y,a,i%3?'#fffdf5':'#e4d4ef',i); });
    Array.from({length:branchCount},(_,i) => letters[i]).forEach((letter,i) => {
      // Prefix-derived stems stay in place as the next letter is added.
      // Full-name-derived paper and ribbon give every recipient a separate identity.
      const source = letter ? 'letter' : i < gardenStart ? 'fill' : 'garden';
      const branchSeed = hashName(letter ? letters.slice(0,i+1).join('') : `${canonical}|${source}|${i}`);
      let [x,y,angle] = source === 'letter'
        ? positions[i] || [225 + Math.cos(i*2.39996)*108,165 + Math.sin(i*2.39996)*82,Math.cos(i)*16]
        : source === 'garden' ? gardenPositions[i - gardenStart] : fillPositions[(i - letters.length) % fillPositions.length];
      x += (branchSeed % 23)-11;
      y += ((branchSeed >>> 6)%21)-10;
      angle += ((branchSeed >>> 12)%17)-8;
      const tone = (branchSeed >>> 4) % colors.length;
      const family = families[theme.family];
      const kind = selectedKind ?? (letter ? letterKind(letter) : undefined) ?? family[branchSeed % 5 < 3 ? 0 : 1 + (branchSeed >>> 7) % 2];
      const scale = .72 + (branchSeed % 5)*.045;
      const baseY = wrapped ? 375 : 455;
      const baseX = 224 + (i % 5) * 3;
      stems += `<path class="bouquet-stem" d="M${baseX} ${baseY+(i%3)*3}Q${x*.52+108} ${y+(baseY-y)*.65} ${x} ${y+8}" stroke="${i%2?'#87a97c':'#729675'}" stroke-width="1.7" fill="none"/>
        <path d="M${x*.45+122} ${y+125}q-26-3-23-27q25 4 23 27m2-20q26-2 26-27q-24 3-26 27" fill="#9db889" opacity=".8"/>`;
      const animate = options.animateFrom === undefined || (source === 'letter' && i >= options.animateFrom);
      const shapeKey = `${kind}-${tone}`;
      let definition = headDefinitions.get(shapeKey);
      if (!definition) {
        definition = `${id}-head-${shapeKey}`;
        headDefinitions.set(shapeKey, definition);
        gradients += `<g id="${definition}">${bloom(kind,tone,id,colors)}</g>`;
      }
      const petals = `<use href="#${definition}"/>`;
      const buds = `<g transform="translate(-21 24) scale(.37)">${petals}</g><g transform="translate(22 16) scale(.3)">${petals}</g><path d="M-21 25Q-7 32 0 37M22 17Q8 25 0 37" stroke="#91aa7f" stroke-width="1" fill="none"/>`;
      heads += `<g class="bouquet-flower" data-bloom-source="${source}" data-flower="${kind}-${tone}-${branchSeed.toString(16)}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)}) scale(${scale})"><g class="floral-sway" style="--sway-delay:${i*-.37}s"><g class="${animate?'floral-bloom':''}" style="--bloom-delay:${animate&&options.animateFrom!==undefined?'.25':'0'}s">${buds}${petals}</g></g></g>`;
    });
    const backPaper = wrapped ? `<g class="paper-unfold"><path d="M79 240Q116 213 147 235L225 394 164 335Z" fill="url(#${id}-cream)" stroke="#dcd0b8" stroke-width=".8"/><path d="M373 242Q340 212 308 233L228 399 291 332Z" fill="url(#${id}-cream)" stroke="#dcd0b8" stroke-width=".8"/><path d="M105 259 159 209 225 227 291 208 351 258 231 420Z" fill="${mix(paper,255,.45)}" opacity=".85"/></g>` : '';
    const frontPaper = wrapped ? `<g class="paper-unfold">
      <path d="M63 276Q92 246 122 269Q163 268 180 291L229 391 187 511Q228 540 275 513L234 392 283 293Q320 275 342 270Q370 254 396 277L286 400 250 419 210 419 174 399Z" fill="url(#${id}-paper)" stroke="${mix(paper,90,.12)}" stroke-width="1"/>
      <path d="M63 276Q92 246 122 269L227 394 167 348ZM396 277Q370 254 342 270L233 394 294 350Z" fill="#fcf8ff" fill-opacity=".72"/>
      <path d="M122 269Q159 291 229 391Q301 288 342 270" stroke="#fffdfd" stroke-width="2" fill="none" opacity=".9"/>
      <path d="M89 277 226 397M369 279 235 398M228 415 201 511M235 416 260 514" stroke="#fff8ff" stroke-width="1" opacity=".6"/>
      <g class="ribbon-float"><path d="M224 408C184 370 154 372 154 395C152 422 194 429 225 416M235 408C275 369 307 374 306 396C307 422 268 429 235 416" fill="url(#${id}-ribbon)" stroke="${mix(ribbon,90,.2)}" stroke-width=".9"/>
      <path d="M224 414Q211 450 197 484L214 474 222 489 234 419M234 416Q252 449 267 473L251 467 245 482 225 418" fill="url(#${id}-ribbon)" stroke="${mix(ribbon,90,.2)}" stroke-width=".8"/>
      <path d="M219 408Q178 384 163 394M241 408Q280 384 297 396" stroke="${mix(ribbon,90,.3)}" stroke-width="1" fill="none" opacity=".7"/>
      <ellipse cx="230" cy="412" rx="11" ry="10" fill="url(#${id}-ribbon)" stroke="${mix(ribbon,90,.2)}" stroke-width=".9"/></g>
      ${options.garden ? '' : `<g transform="translate(267 365) rotate(17)"><path d="M0 0H38V46H0Z" fill="#fffdf4" stroke="#d8ceb9" stroke-width=".6"/><circle cx="19" cy="6" r="2" fill="#c3b393"/><path d="M19 5 6-12" stroke="#bba883" stroke-width=".8"/><text x="19" y="23" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#9a88b3">20/10</text><path d="M11 32h16" stroke="#c4b6d4" stroke-width=".7"/></g>`}</g>` : '';
    const rooted = options.garden && !wrapped;
    const grass = rooted ? `<g fill="#93ae80" opacity=".75">${Array.from({length:5},(_,i) => { const x = 216 + i * 7, y = 460 + Math.sin(i) * 2; return `<path d="M${x} ${y}q-4-15-10-22q10 3 12 15q0-18 7-25q-4 16-3 24Z"/>`; }).join('')}</g>` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${wrapped?'0 0 460 560':rooted?'0 0 460 485':'0 0 460 500'}" data-profile="${seed.toString(16)}" data-family="${theme.family}" data-colorway="${theme.colorway}" data-wrapped="${wrapped}" role="img" aria-label="Những nhành hoa dành riêng cho cậu"><defs>${gradients}</defs>${wrapped?'<ellipse cx="232" cy="535" rx="90" ry="9" fill="#78805d" opacity=".11"/>':''}<g class="bouquet-living">${backPaper}${foliage}${stems}${baby}${heads}${frontPaper}${grass}</g></svg>`;
  };
  window.drawGardenFlower = (name) => {
    const canonical = normalizeName(name);
    const seed = hashName(canonical);
    const configured = Object.entries(window.FLOWER_PROFILES || {}).find(([key]) => normalizeName(key) === canonical)?.[1] || {};
    const colors = palette.map((color,i) => validColor(configured.color) && i % 3 === 1 ? configured.color : color);
    const kind = { daisy:0, tulip:1, ranunculus:2, cosmos:3 }[configured.flower] ?? seed % 4;
    const tone = (seed >>> 5) % colors.length;
    const id = `garden-flower-${++serial}`;
    const color = colors[tone];
    const angle = seed % 15 - 7;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 195" data-profile="${seed.toString(16)}" aria-hidden="true"><defs><radialGradient id="${id}-p${tone}" cx=".3" cy=".15" r=".95"><stop stop-color="${mix(color,255,.55)}"/><stop offset=".6" stop-color="${color}"/><stop offset="1" stop-color="${mix(color,95,.15)}"/></radialGradient><radialGradient id="${id}-gold"><stop stop-color="#ffe29a"/><stop offset="1" stop-color="#cfa039"/></radialGradient></defs><ellipse cx="80" cy="180" rx="29" ry="4" fill="#6e8b4920"/><g class="garden-flower-body" style="--plant-angle:${angle}deg;--plant-delay:${seed%7 * -.5}s"><path d="M80 180Q${70+seed%20} 115 80 53" stroke="#72966d" stroke-width="2.4" fill="none"/><path d="M80 140Q42 139 42 111Q75 111 80 140M80 118Q118 112 116 88Q86 90 80 118" fill="#9db986"/><path d="M80 140 50 119M81 117 109 96" stroke="#c8d6b6" stroke-width=".7" fill="none"/><g transform="translate(80 53) rotate(${angle})">${bloom(kind,tone,id,colors)}</g><g transform="translate(106 76) scale(.38)">${bloom(kind,tone,id,colors)}</g><path d="M103 83Q84 101 81 115" stroke="#8ea67c" fill="none" stroke-width="1.2"/></g></svg>`;
  };
})();
