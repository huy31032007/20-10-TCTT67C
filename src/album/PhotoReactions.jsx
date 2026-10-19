import React, { useCallback, useEffect, useRef, useState } from 'react';

const emojis = ['❤️','😂','🥺','✨'];
const labels = ['Thả tim','Cười vui','Xúc động','Lấp lánh'];
let memoryVisitor;
function visitorKey() {
  try { const saved = localStorage.getItem('tctt67c-reaction-visitor'); if (/^[a-f0-9]{32}$/.test(saved || '')) return saved; } catch {}
  memoryVisitor ||= [...crypto.getRandomValues(new Uint8Array(16))].map(byte => byte.toString(16).padStart(2,'0')).join('');
  try { localStorage.setItem('tctt67c-reaction-visitor', memoryVisitor); } catch {}
  return memoryVisitor;
}

export function PhotoReactions({ photo }) {
  const [visitor] = useState(visitorKey);
  const [data, setData] = useState(null), [error, setError] = useState(''), [saving, setSaving] = useState(false);
  const alive = useRef(false), revision = useRef(-1), busy = useRef(false), controllers = useRef(new Set());
  const request = useCallback(async extra => {
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 12000);
    controllers.current.add(controller);
    try {
      const response = await fetch('/api/reactions', {
        method:'POST', credentials:'same-origin', cache:'no-store', signal:controller.signal,
        headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ photo, visitor, ...extra })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Chưa ghi được cảm xúc. Thử lại nhé.');
      if (!Array.isArray(result.counts) || result.counts.length !== 4 || !Array.isArray(result.mine) || result.mine.length !== 4 || !Number.isSafeInteger(result.revision)) throw new Error('Chưa tải được cảm xúc. Thử lại nhé.');
      if (alive.current && result.revision >= revision.current) { revision.current = result.revision; setData(result); setError(''); }
    } finally { clearTimeout(timer); controllers.current.delete(controller); }
  }, [photo, visitor]);
  const refresh = useCallback(async () => {
    if (busy.current) return;
    try { await request({ action:'read' }); }
    catch { if (alive.current) setError('Chưa tải được cảm xúc của lớp.'); }
  }, [request]);
  useEffect(() => {
    alive.current = true; let timer;
    const tick = async () => {
      clearTimeout(timer);
      if (document.hidden) return;
      await refresh();
      if (alive.current && !document.hidden) timer = setTimeout(tick, 4000);
    };
    const visibility = () => { clearTimeout(timer); if (!document.hidden) tick(); };
    tick(); document.addEventListener('visibilitychange', visibility);
    return () => { alive.current = false; clearTimeout(timer); document.removeEventListener('visibilitychange', visibility); for (const controller of controllers.current) controller.abort(); };
  }, [refresh]);
  const react = async emoji => {
    if (!data || busy.current) return;
    busy.current = true; setSaving(true);
    try { await request({ action:'set', emoji, active:!data.mine[emoji] }); }
    catch { if (alive.current) setError('Chưa ghi được cảm xúc. Cậu thử lại nhé.'); }
    finally { busy.current = false; if (alive.current) setSaving(false); }
  };
  return <div className="album-reactions" aria-label="Cảm xúc của cả lớp">
    <div className="reaction-buttons">{emojis.map((emoji, i) => <button key={emoji} type="button" disabled={!data || saving} aria-pressed={Boolean(data?.mine[i])} aria-label={`${labels[i]}, ${data?.counts[i] ?? 'đang tải'} lượt`} onClick={() => react(i)}><span aria-hidden="true">{emoji}</span><span aria-hidden="true">{data?.counts[i] ?? '—'}</span></button>)}</div>
    <p className="reaction-status" role="status">{error || (!data ? 'Đang tải cảm xúc…' : '')}{error && <button className="reaction-retry" type="button" onClick={refresh} aria-label="Thử tải lại cảm xúc">Thử lại</button>}</p>
  </div>;
}
