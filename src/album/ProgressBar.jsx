import React, { useEffect, useRef } from 'react';

export function ProgressBar({ total, page, progress, automatic, reduced }) {
  const current = useRef(null);
  useEffect(() => {
    if (!automatic || reduced) return;
    const update = value => { if (current.current) current.current.style.transform = `scaleX(${value})`; };
    update(progress.get());
    return progress.on('change', update);
  }, [automatic, page, progress, reduced]);
  return <div className="album-progress" id="albumProgress" role="progressbar" aria-label="Tiến độ sổ ảnh" aria-valuemin="1" aria-valuemax={total} aria-valuenow={page + 1}>
    {Array.from({ length:total }, (_, i) => <span key={i}><i ref={i === page ? current : null} style={{ transform:`scaleX(${i < page || i === page && !automatic ? 1 : 0})` }}/></span>)}
  </div>;
}
