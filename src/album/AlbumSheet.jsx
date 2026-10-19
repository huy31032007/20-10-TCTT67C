import React from 'react';
import { m, useTransform } from 'framer-motion';
import { PageDoodles, PaperClip } from './Decorations.jsx';
import { PolaroidCard } from './PolaroidCard.jsx';
import { pagePresentation } from './album-layout.mjs';

export function AlbumSheet({ photo, index, slot = 0, onPhoto, enabled, reduced, canHover, still = false }) {
  return <div className={`album-sheet album-sheet-${slot ? 'right' : 'left'}`} style={{ '--sticker-delay':`${index % 6 * -1.3}s` }}>
    <PaperClip/><PageDoodles index={index}/>
    <PolaroidCard photo={photo} index={index} slot={slot} onPhoto={onPhoto} enabled={enabled} reduced={reduced} canHover={canHover} still={still}/>
  </div>;
}

export function AlbumSpread({ indices, photos, still = false, id, ...props }) {
  const className = `album-page album-layout-${pagePresentation(indices, photos).kind}`;
  const contents = indices.map((index, slot) => <AlbumSheet key={index} photo={photos[index]} index={index} slot={slot} still={still} {...props}/>);
  return still ? <div className={className}>{contents}</div> : <m.div id={id} className={className}
    variants={{ hidden:{}, visible:{ transition:{ staggerChildren:.1 } } }} initial={false} animate="visible">{contents}</m.div>;
}

export function TurningLeaf({ turn, position, pages, photos }) {
  const angle = useTransform(position, p => p * -180 * turn.delta);
  const lift = useTransform(position, p => Math.sin(p * Math.PI) * 18);
  const shade = useTransform(position, p => Math.sin(p * Math.PI) * .38);
  const castShadow = useTransform(position, p => {
    const lift = Math.sin(p * Math.PI);
    return `${-turn.delta * (4 + lift * 24)}px ${5 + lift * 9}px ${9 + lift * 24}px rgba(74,69,62,${.08 + lift * .22})`;
  });
  return <div className={`album-turn-viewport ${turn.delta > 0 ? 'turn-forward' : 'turn-back'}`} aria-hidden="true" inert>
    {/* The destination is exposed only under the moving half. The stationary
        source stays in place until the reverse face covers it. */}
    <div className="album-turn-under"><AlbumSpread indices={pages[turn.to]} photos={photos} still/></div>
    <m.div className="album-turn" data-phase={turn.phase} style={{ rotateY:angle, z:lift }}>
      {[turn.from, turn.to].map((page, face) => {
        const right = face === 0 ? turn.delta > 0 : turn.delta < 0;
        return <m.div className={`album-turn-face ${face ? 'turn-reverse' : 'turn-front'} ${right ? 'turn-face-right' : 'turn-face-left'}`} key={face} style={{ boxShadow:castShadow }}>
          <div className="album-face-clip"><div className="album-face-spread"><AlbumSpread indices={pages[page]} photos={photos} still/></div></div>
          <m.span className="album-turn-light" style={{ opacity:shade }}/>
        </m.div>;
      })}
    </m.div>
  </div>;
}
