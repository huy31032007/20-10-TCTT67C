import React from 'react';
import { m } from 'framer-motion';
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
  const presentation = pagePresentation(indices, photos);
  const className = `album-page album-layout-${presentation.kind}`;
  const contents = indices.map((index, slot) => <AlbumSheet key={index} photo={photos[index]} index={index} slot={slot} still={still} {...props}/>);
  return still ? <div className={className}>{contents}</div> : <m.div id={id} className={className}
    variants={{ hidden:{}, visible:{ transition:{ staggerChildren:.1 } } }} initial={props.reduced ? false : 'hidden'} animate="visible">{contents}</m.div>;
}

export function TurningLeaf({ turn, pages, photos, onComplete }) {
  return <div className="album-turn-viewport" aria-hidden="true" inert>
    <div className={`album-turn ${turn.delta > 0 ? 'turn-forward' : 'turn-back'}`} onAnimationEnd={event => { if (event.target === event.currentTarget) onComplete(); }}>
      {[turn.from, turn.to].map((page, face) => {
        // Each face clips the matching half of the same full-size spread.
        // Singles, pairs and triples therefore share the same spine and geometry.
        const right = face === 0 ? turn.delta > 0 : turn.delta < 0;
        return <div className={`album-turn-face ${face ? 'turn-reverse' : 'turn-front'} ${right ? 'turn-face-right' : 'turn-face-left'}`} key={face}>
          <div className="album-face-spread"><AlbumSpread indices={pages[page]} photos={photos} still/></div>
        </div>;
      })}
    </div>
  </div>;
}
