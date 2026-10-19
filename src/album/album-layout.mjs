// Keep each photo's original index: the shared reaction API uses index + 1.
const spreads = [
  [0], [27,28,29], [30], [31], [32,33,34],
  [35,36], [37], [38], [39], [40,41,42], [12],
  [1,3], [2,4,5], [6,7], [10,8,9], [11,13],
  [14,15], [23,16,17], [18,19], [25,20,21], [24,22,26]
];

export function buildAlbumPages(photos) {
  const used = new Set();
  const pages = spreads.map(indices => indices.filter(index => {
    if (!photos[index] || used.has(index)) return false;
    used.add(index); return true;
  })).filter(indices => indices.length);
  const extra = photos.map((_, i) => i).filter(i => !used.has(i));
  for (let i = 0; i < extra.length; i += 3) pages.push(extra.slice(i, i + 3));
  return pages;
}

export function pagePresentation(indices, photos) {
  // These consecutive landscape pairs share the left paper face; the next
  // photo remains on the right. Keep portrait-led trios in their original pose.
  const pairedLandscapes = indices.length === 3 && [27,32,40].includes(indices[0]);
  return { kind:pairedLandscapes ? 'compact' : indices.length === 3 ? 'trio' : indices.length === 2 ? 'pair' : 'hero' };
}
