import React from 'react';
import { Icon } from './Decorations.jsx';

export function VinylPlayer({ photo, playing, moving, onToggle }) {
  return <button id="albumSound" type="button" className={`album-vinyl-player ${moving ? 'is-playing' : ''}`} aria-label={playing ? 'Tắt nhạc Photograph' : 'Bật nhạc Photograph'} aria-pressed={playing} onClick={onToggle}>
    <span className="album-vinyl" aria-hidden="true"><img src={photo.src} alt=""/><i/></span>
    <span className="album-track"><span className="album-track-title" aria-hidden="true">Photograph</span><span className="album-soundwave" aria-hidden="true">{Array.from({ length:5 }, (_, i) => <i key={i} style={{ '--bar-delay':`${i * -.17}s`, '--bar-height':`${8 + i % 3 * 3}px` }}/>)}</span></span>
    <Icon name={playing ? 'pause' : 'sound'}/>
  </button>;
}
