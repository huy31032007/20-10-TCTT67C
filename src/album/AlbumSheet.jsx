import React from 'react';
import { PageDoodles, PaperClip } from './Decorations.jsx';
import { PolaroidCard } from './PolaroidCard.jsx';

export function AlbumSheet({ photo, index, slot = 0, onPhoto, enabled, reduced, canHover, still = false }) {
  return <div className={`album-sheet album-sheet-${slot % 2 ? 'right' : 'left'}`} style={{ '--sticker-delay':`${index % 6 * -1.3}s` }}>
    <PaperClip/><PageDoodles index={index}/>
    <PolaroidCard photo={photo} index={index} slot={slot} onPhoto={onPhoto} enabled={enabled} reduced={reduced} canHover={canHover} still={still}/>
  </div>;
}

export function TurningLeaf({ turn, pages, photos, onComplete }) {
  const full = pages[turn.from].length === 1 || pages[turn.to].length === 1;
  return <div className="album-turn-viewport" aria-hidden="true" inert>
    <div className={`album-turn ${turn.delta > 0 ? 'turn-forward' : 'turn-back'} ${full ? 'turn-full' : ''}`} onAnimationEnd={event => { if (event.target === event.currentTarget) onComplete(); }}>
      {[turn.from, turn.to].map((page, face) => {
        const indices = pages[page];
        const desktopSlot = face === 0 ? (turn.delta > 0 ? indices.length - 1 : 0) : (turn.delta > 0 ? 0 : indices.length - 1);
        return <div className={`album-turn-face ${face ? 'turn-reverse' : 'turn-front'}`} key={face}>
          <div className={`album-turn-layout ${indices.length === 1 ? 'turn-layout-single' : ''} ${full ? '' : 'turn-layout-half'}`}>
            {indices.map((index, slot) => <div key={index} className={slot === desktopSlot ? '' : 'turn-mobile-only'}>
              <AlbumSheet photo={photos[index]} index={index} slot={slot} still/>
            </div>)}
          </div>
        </div>;
      })}
    </div>
  </div>;
}
