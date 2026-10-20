const hash = value => [...value].reduce((seed, c) => Math.imul(seed ^ c.codePointAt(0), 16777619) >>> 0, 2166136261);
function random(seed) {
  return () => {
    seed = (seed + 0x6D2B79F5) >>> 0;
    let value = Math.imul(seed ^ seed >>> 15, seed | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

// Fit the entire garden above the foreground grass; navigation sits in the sky.
// IDs seed the scatter, so unchanged gardens never jump during polling/reloads.
// A busier garden scales down and repacks instead of spilling below the viewport.
export function gardenLayout(members, width, viewportHeight) {
  const frameHeight = Math.max(viewportHeight || 620, 1);
  if (!(width > 0) || !members.length) return { items:[], height:frameHeight, frameHeight };
  const compact = width < 650;
  const safeBottom = Math.max(40, Math.min(frameHeight * .91, frameHeight - 60));
  const fieldTop = Math.min(frameHeight * .40 + 8, safeBottom * .65);
  const fieldDepth = safeBottom - fieldTop - 8;
  const availableWidth = Math.max(1,width - 40);
  const nominal = compact ? Math.min(150,width * .32) : Math.min(205,Math.max(145,width * .14));
  const base = Math.min(nominal, Math.sqrt(availableWidth * fieldDepth / members.length));
  for (let pass = 0; pass < 32; pass++) {
    const items = [];
    const scale = .96 ** pass;
    for (const [index, member] of members.entries()) {
      const next = random(hash(member.id));
      let placed;
      for (let attempt = 0; attempt < 384; attempt++) {
        const depth = next();
        const size = base * scale * (.82 + depth * .2) * (.96 + next() * .08);
        const height = size * 485 / 460;
        const edge = 16 + size * .59;
        const x = index === 0 ? width * (.45 + next() * .1) : edge + next() * Math.max(0,width - edge * 2);
        const y = fieldTop + depth * Math.max(0,fieldDepth - height);
        const crown = {x,y:y + height * .27,width:size * .8,height:height * .5};
        // Rounded crowns can nestle diagonally without hiding each other's center.
        // Rectangular empty corners no longer force every clump to shrink.
        if (items.some(other => {
          const dx = (crown.x - other.crown.x) / ((crown.width + other.crown.width) / 2 + 3);
          const dy = (crown.y - other.crown.y) / ((crown.height + other.crown.height) / 2 + 3);
          return dx * dx + dy * dy < 1;
        })) continue;
        placed = {id:member.id,x,y,size,height,bottom:y + height,crown};
        break;
      }
      if (!placed) break;
      items.push(placed);
    }
    if (items.length !== members.length) continue;
    const depths = [...items].sort((a,b) => a.bottom - b.bottom);
    depths.forEach((item,i) => {item.zIndex = 10 + Math.round(i * 60 / Math.max(1,items.length - 1));});
    return {items,frameHeight,height:frameHeight};
  }
  throw new Error('Garden could not fit its available space');
}
