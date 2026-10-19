import React from 'react';

export function FilmGrain() {
  // A cached 128px tile, rather than a live full-screen SVG noise filter.
  return <span className="album-grain" aria-hidden="true"/>;
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
  return <span className={`album-doodle ${className}`} aria-hidden="true"><svg viewBox="0 0 40 40">
    {kind === 'flower' ? <><path d="M19 36Q16 25 20 15M18 30Q6 29 10 22Q17 23 18 30" className="doodle-leaf"/><g className="doodle-petals">{[0,60,120,180,240,300].map(angle => <ellipse key={angle} cx="20" cy="8" rx="4" ry="7" transform={`rotate(${angle} 20 15)`}/>)}</g><circle cx="20" cy="15" r="4.3" className="doodle-center"/></> : kind === 'music' ? <path d="M17 29V10l15-4v18M17 15l15-4M17 28c-7-5-14 5-7 6 4 1 7-1 7-6m15-5c-7-5-14 5-7 6 4 1 7-1 7-6"/> : kind === 'arrow' ? <path d="M5 12c20-12 31 1 14 14m-1-9v11l11-2"/> : <path d="M20 3Q22 18 37 20Q22 22 20 37Q18 22 3 20Q18 18 20 3Z"/>}
  </svg></span>;
}

export function PageDoodles({ index }) {
  return <><Doodle kind={index % 2 ? 'music' : 'flower'} className="album-corner-doodle"/><Doodle className="album-tiny-star"/></>;
}
