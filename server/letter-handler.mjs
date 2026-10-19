import { createHash, randomInt } from 'node:crypto';
import { LETTERS } from './letter-catalog.mjs';

const reply = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const LEASE = 10 * 60 * 1000;
export function createLetterHandler(store, { now = Date.now, pick = randomInt, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)) } = {}) {
  return async request => {
    try {
      if (request.method !== 'POST') return reply({ error: 'Phương thức không được hỗ trợ.' }, 405);
      if (request.headers.get('origin') && request.headers.get('origin') !== new URL(request.url).origin) return reply({ error: 'Yêu cầu không hợp lệ.' }, 403);
      if (!request.headers.get('content-type')?.startsWith('application/json')) return reply({ error: 'Dữ liệu không hợp lệ.' }, 415);
      // Read only the small anonymous visitor key and action, never names or device data.
      const reader = request.body?.getReader();
      if (!reader) return reply({ error: 'Thiếu dữ liệu.' }, 400);
      let raw = '', size = 0;
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 512) { await reader.cancel(); return reply({ error: 'Dữ liệu quá dài.' }, 413); }
        raw += decoder.decode(value, { stream: true });
      }
      let input;
      try { input = JSON.parse(raw + decoder.decode()); } catch { return reply({ error: 'Dữ liệu không hợp lệ.' }, 400); }
      if (!/^[a-f0-9]{32}$/.test(input?.visitor || '') || !['reserve', 'open'].includes(input?.action)) return reply({ error: 'Dữ liệu không hợp lệ.' }, 400);
      const key = createHash('sha256').update(input.visitor).digest('hex');
      const present = record => ({ letter: LETTERS[record.id - 1], cycle: record.cycle, opened: Boolean(record.openedAt) });
      for (let attempt = 0; attempt < 96; attempt++) {
        const saved = await store.read();
        const data = saved?.data || { revision: 0, members: [] };
        const letters = data.letters || { cycle: 1, assignments: {} };
        const assignments = { ...letters.assignments };
        let cycle = letters.cycle;
        const stamp = now();
        const record = assignments[key];
        if (record?.openedAt) return reply(present(record));
        if (input.action === 'open') {
          if (!record || record.expiresAt <= stamp || input.id !== record.id || input.cycle !== record.cycle) return reply({ error: 'Lượt giữ thư đã hết. Hãy quay lại phong bì để lấy thư mới.' }, 409);
          assignments[key] = { id: record.id, cycle: record.cycle, openedAt: new Date(stamp).toISOString() };
        } else {
          if (record?.expiresAt > stamp) return reply(present(record));
          // Unopened reservations expire, making those letters available again.
          for (const [visitor, entry] of Object.entries(assignments)) if (!entry.openedAt && entry.expiresAt <= stamp) delete assignments[visitor];
          let opened = Object.values(assignments).filter(entry => entry.cycle === cycle && entry.openedAt);
          if (opened.length === LETTERS.length) cycle++;
          const used = new Set(Object.values(assignments).filter(entry => entry.cycle === cycle).map(entry => entry.id));
          const free = LETTERS.filter(letter => !used.has(letter.id));
          if (!free.length) return reply({ error: 'Các thư còn lại đang có bạn mở. Cậu thử lại sau một lát nhé.' }, 409);
          if (Object.keys(assignments).length >= 3000) return reply({ error: 'Đã đạt giới hạn lượt nhận thư.' }, 409);
          assignments[key] = { id: free[pick(free.length)].id, cycle, expiresAt: stamp + LEASE };
        }
        const next = { ...data, revision: data.revision + 1, letters: { cycle, assignments } };
        if (await store.write(next, saved?.etag ?? null)) return reply(present(assignments[key]));
        await sleep(15 + Math.random() * Math.min(220, 20 * (attempt + 1)));
      }
      return reply({ error: 'Nhiều bạn đang mở thư. Cậu thử lại sau vài giây nhé.' }, 503);
    } catch (error) {
      console.error('Letter storage error:', error.message);
      return reply({ error: 'Chưa kết nối được với hộp thư. Cậu thử lại nhé.' }, 503);
    }
  };
}
