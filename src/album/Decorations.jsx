import React from 'react';

export function FilmGrain() {
  // SVG noise is cached as a small repeating image; there is no animated filter.
  return <><span className="album-grain" aria-hidden="true"/><span className="album-vignette" aria-hidden="true"/></>;
}

export function Icon({ name }) {
  const paths = {
    back:'M19 12H5m6-6-6 6 6 6', prev:'m14 6-6 6 6 6', next:'m10 6 6 6-6 6',
    close:'m6 6 12 12M18 6 6 18', play:'m9 5 11 7-11 7Z', pause:'M9 5v14M15 5v14',
    book:'M12 5Q7 2 3 5v15q4-3 9 0 5-3 9 0V5q-4-3-9 0Zm0 0v15',
    mail:'M3 5h18v14H3Zm0 1 9 7 9-7', sound:'M11 5 6 9H3v6h3l5 4ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14'
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name] || paths.next}/></svg>;
}

export function WashiTape({ index }) {
  return <span className={`album-washi album-washi-${index % 3}`} aria-hidden="true"/>;
}

export function PaperClip() {
  return <span className="album-paperclip" aria-hidden="true"><svg viewBox="0 0 20 42"><path d="M7 30V9a5 5 0 0 1 10 0v24a7 7 0 0 1-14 0V12m4 0v20a3 3 0 0 0 6 0V10"/></svg></span>;
}

export function Doodle({ kind = 'star', className = '' }) {
  const path = kind === 'arrow' ? 'M5 12c20-12 31 1 14 14m-1-9v11l11-2' : 'M20 3Q22 18 37 20Q22 22 20 37Q18 22 3 20Q18 18 20 3Z';
  return <span className={`album-doodle ${className}`} aria-hidden="true"><svg viewBox="0 0 40 40"><path d={path}/></svg></span>;
}

// Small original margin sketches: one motif per page corner, drawn as ink.
const youthPaths = {
  plane:'M3 15 35 4 23 30l-6-10-14-5Zm14 5L35 4M17 20l-1 10 7-5M4 26c-8 10 13 15 14 7 1-6-12-4-8 2',
  cassette:'M5 10q14-2 29 0l1 21q-15 2-31 0L5 10Zm4 4h20v10H9Zm3 15 3-7h10l3 7M14 18a2 2 0 1 0 .1 0m10 0a2 2 0 1 0 .1 0M8 12h.1m23 0h.1',
  guitar:'M26 4l6 4-11 15c3 4 1 10-4 12-7 4-15-3-11-9 2-4 7-2 8-6 1-4 4-5 7-3L30 5M24 7l5 4M16 23a4 4 0 1 0 .1 0M11 30l5 3M27 3l2 2m2 1 2 2',
  bicycle:'M11 28a8 8 0 1 0 .1 0m21 0a8 8 0 1 0 .1 0M11 28l7-13 7 13H11l12-10h6l3 10M15 13h7m7 5-2-8h5',
  sneakers:'M7 9l10 2 3 10 12 5q5 2 4 7L4 34q-2-9 3-25Zm0 8 7 5 5-2M4 29l31 1M14 13l5 1m-4 3 5 1m0 4 4-1m-2 4 5-2',
  notebooks:'M6 8 30 5l4 25-25 5L6 8Zm-2 5L2 36l28 1M10 13l17-2m-16 7 16-2M14 24l11-2M10 8l4 25M19 6l2 9 3-3 3 1-1-8',
  film:'M5 6l29 3-3 28-29-3L5 6Zm6 5 17 2-1 16-17-2 1-16ZM7 10h1m-2 6h1m-2 6h1m-2 6h1M31 13h1m-2 6h1m-2 6h1m-2 6h1',
  friends:'M6 13c-4-8 8-9 7-1m1 1c-1-10 10-10 10-1m2 0c-1-8 10-8 8 1M2 35l1-15q4-7 10-1m-4 16 2-15q5-7 13 0l2 15m-3-15q8-8 13 0l2 15M7 24q6 1 10-4m4 0q4 4 10 3'
};
export function YouthSketch({ kind, className = '' }) {
  return <span className={`album-doodle album-youth-sketch ${className}`} aria-hidden="true"><svg viewBox="0 0 40 40"><path d={youthPaths[kind] || youthPaths.plane}/></svg></span>;
}
export function Postmark() {
  return <span className="album-postmark album-doodle" aria-hidden="true"><svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="24"/><circle cx="30" cy="30" r="20" strokeDasharray="1 3"/><path d="M10 24q8-4 15 0m9 13q8-4 16 0"/><text x="30" y="33" textAnchor="middle">20·10</text></svg></span>;
}
export function PageDoodles({ index }) {
  const motifs = Object.keys(youthPaths);
  return <><YouthSketch kind={motifs[index % motifs.length]} className="album-margin-sketch"/>{index % 6 === 0 ? <Postmark/> : <Doodle className="album-tiny-star"/>}</>;
}

export function ClosingSparkles() {
  return <div className="album-closing-sparkles" aria-hidden="true">{Array.from({ length:14 }, (_, i) => <span key={i} style={{ '--sparkle-x':`${4 + i * 7}%`, '--sparkle-delay':`${i % 4 * .09}s`, '--sparkle-drift':`${(i % 3 - 1) * 18}px` }}><svg viewBox="0 0 40 40"><path d="M20 3Q22 18 37 20Q22 22 20 37Q18 22 3 20Q18 18 20 3Z"/></svg></span>)}</div>;
}
