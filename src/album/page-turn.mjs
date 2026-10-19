export const clampProgress = value => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

export function turnTarget(page, delta, total) {
  if (!Number.isInteger(page) || ![-1, 1].includes(delta)) return null;
  const next = page + delta;
  return next >= 0 && next < total ? next : null;
}

export function dragIntent(dx, dy) {
  return Math.abs(dx) >= 8 && Math.abs(dx) > Math.abs(dy) * 1.4;
}

export function dragProgress(startX, currentX, delta, travel) {
  return travel > 0 ? clampProgress((startX - currentX) * delta / travel) : 0;
}

// Distance wins for slow releases; a deliberate flick can finish a short turn.
// A reversal releases back to the source unless the leaf is almost over.
export function shouldCompleteTurn(progress, velocity) {
  const p = clampProgress(progress);
  if (velocity < -.35) return p > .8;
  return p >= .35 || (p >= .08 && velocity >= .5);
}
