import React from 'react';
import { m } from 'framer-motion';
import { WashiTape } from './Decorations.jsx';

export function PolaroidCard({ photo, index, slot = 0, onPhoto, enabled, reduced, canHover, still = false }) {
  // Stable, different angles and offsets; the turning faces use the same pose.
  const tilt = reduced ? 0 : [-2.1, 1.7, -1.5, 2.3, -1.8, 1.4][index % 6];
  const offset = reduced ? 0 : [-5, 6, -3, 4, -6, 3][index % 6];
  const contents = <>
    <WashiTape index={index}/>
    {still ? <div className="album-photo-open"><img src={photo.src} alt="" width={photo.width} height={photo.height} decoding="async"/></div> : <button type="button" className="album-photo-open" onClick={() => onPhoto(photo)} aria-label={`Xem ảnh kỷ niệm ${index + 1} ở kích thước lớn`}><img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} decoding="async"/></button>}
  </>;
  if (still) return <figure className="album-photo" style={{ transform:`translateY(${offset}px) rotate(${tilt}deg)` }}>{contents}</figure>;
  return <m.figure className="album-photo" initial={enabled && !reduced ? { opacity:0, y:offset + 8, scale:.98, rotate:tilt } : false}
    animate={{ opacity:1, y:offset, scale:1, rotate:tilt, rotateX:0, rotateY:0 }}
    transition={enabled && !reduced ? { type:'spring', stiffness:260, damping:20, delay:slot * .1 } : { duration:0 }}
    whileHover={enabled && canHover && !reduced ? { scale:1.02, rotateX:5, rotateY:-5 } : undefined}>{contents}</m.figure>;
}
