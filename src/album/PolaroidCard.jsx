import React from 'react';
import { m } from 'framer-motion';
import { WashiTape } from './Decorations.jsx';

export function PolaroidCard({ photo, index, slot = 0, onPhoto, enabled, reduced, canHover, still = false }) {
  // Stable, different angles and offsets; the turning faces use the same pose.
  const tilt = reduced ? 0 : [-2, 1.6, -1.8, 2.2, -1.7, 1.4][index % 6];
  const offset = reduced ? 0 : [-2, 3, -2, 2, -3, 2][index % 6];
  const sourceStyle = { '--photo-native-width':`${photo.width}px`, '--photo-aspect':photo.width / photo.height };
  const contents = <>
    <WashiTape index={index}/>
    {still ? <div className="album-photo-open"><img src={photo.src} alt="" width={photo.width} height={photo.height} decoding="async"/></div> : <button type="button" className="album-photo-open" onClick={() => onPhoto(photo)} aria-label={`Xem ảnh kỷ niệm ${index + 1} ở kích thước lớn`}><img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} decoding="async"/></button>}
    <figcaption><span>TCTT67C</span><span className="album-print-number">{String(index + 1).padStart(2, '0')}</span></figcaption>
  </>;
  if (still) return <figure className="album-photo" style={{ ...sourceStyle, transform:`translateY(${offset}px) rotate(${tilt}deg)` }}>{contents}</figure>;
  return <m.figure className="album-photo" style={sourceStyle}
    variants={{ hidden:{ opacity:0, y:offset + 8, scale:.98, rotate:tilt }, visible:{ opacity:1, y:offset, scale:1, rotate:tilt, rotateX:0, rotateY:0, transition:reduced ? { duration:0 } : { type:'spring', stiffness:260, damping:20 } } }}
    whileHover={enabled && canHover && !reduced ? { scale:1.03, rotateX:5, rotateY:-5 } : undefined}>{contents}</m.figure>;
}
