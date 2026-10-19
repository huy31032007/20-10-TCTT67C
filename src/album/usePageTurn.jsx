import { useCallback, useEffect, useRef, useState } from 'react';
import { animate, useMotionValue } from 'framer-motion';
import { turnTarget } from './page-turn.mjs';

export function usePageTurn({ page, total, reduced, blocked, onCommit, onStart }) {
  const [turn, setTurn] = useState(null);
  const position = useMotionValue(0);
  const active = useRef(null), animation = useRef(null), generation = useRef(0);
  const latest = useRef(null);
  latest.current = { page, total, reduced, blocked, onCommit, onStart };

  const cancel = useCallback(() => {
    generation.current++; animation.current?.stop(); animation.current = null;
    active.current = null; setTurn(null); position.set(0);
  }, [position]);

  const begin = useCallback((delta, dragging = false) => {
    const state = latest.current;
    if (active.current || state.blocked) return false;
    const to = turnTarget(state.page, delta, state.total);
    if (to === null) return false;
    const next = { from:state.page, to, delta, phase:dragging ? 'dragging' : 'settling' };
    position.set(0); active.current = next; setTurn(next); state.onStart?.();
    return true;
  }, [position]);

  const settle = useCallback(complete => {
    if (!active.current) return;
    const leaf = active.current, token = ++generation.current;
    animation.current?.stop();
    active.current = { ...leaf, phase:'settling' }; setTurn(active.current);
    const finish = () => {
      if (token !== generation.current) return;
      animation.current = null; active.current = null;
      if (complete) latest.current.onCommit(leaf.to);
      setTurn(null);
    };
    if (latest.current.reduced) { position.set(complete ? 1 : 0); finish(); return; }
    const target = complete ? 1 : 0;
    animation.current = animate(position, target, {
      duration:Math.max(.2, .84 * Math.abs(target - position.get())),
      ease:[.645, .045, .355, 1], onComplete:finish
    });
  }, [position]);

  const flip = useCallback(delta => { if (begin(delta)) settle(true); }, [begin, settle]);
  useEffect(() => {
    const visibility = () => { if (document.hidden) cancel(); };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('resize', cancel);
    return () => {
      generation.current++; animation.current?.stop(); active.current = null;
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('resize', cancel);
    };
  }, [cancel]);
  useEffect(() => { if (reduced) cancel(); }, [reduced, cancel]);
  return { turn, position, begin, settle, flip, cancel, isBusy:() => Boolean(active.current) };
}
