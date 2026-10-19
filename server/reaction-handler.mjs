import { createHash } from 'node:crypto';

const reply = (body, status = 200) => Response.json(body, { status, headers:{ 'Cache-Control':'no-store' } });
const validPhoto = value => Number.isInteger(value) && value >= 1 && value <= 43;
function present(data, photo, key) {
  const votes = data.reactions?.[photo] || {};
  const counts = [0,0,0,0];
  for (const mask of Object.values(votes)) for (let i = 0; i < 4; i++) if (mask & (1 << i)) counts[i]++;
  return { photo, revision:data.revision, counts, ...(key ? { mine:counts.map((_, i) => Boolean((votes[key] || 0) & (1 << i))) } : {}) };
}

// Reuse the existing atomic document. No new table, binding or service.
export function createReactionHandler(store, { sleep = ms => new Promise(resolve => setTimeout(resolve, ms)) } = {}) {
  return async request => {
    try {
      if (!['GET','POST'].includes(request.method)) return reply({ error:'Phương thức không được hỗ trợ.' }, 405);
      const url = new URL(request.url);
      let input;
      if (request.method === 'GET') {
        input = { photo:Number(url.searchParams.get('photo')) };
        if (!validPhoto(input.photo)) return reply({ error:'Ảnh không hợp lệ.' }, 400);
      } else {
        if (request.headers.get('origin') && request.headers.get('origin') !== url.origin) return reply({ error:'Yêu cầu không hợp lệ.' }, 403);
        if (!request.headers.get('content-type')?.startsWith('application/json')) return reply({ error:'Dữ liệu không hợp lệ.' }, 415);
        const reader = request.body?.getReader();
        if (!reader) return reply({ error:'Thiếu dữ liệu.' }, 400);
        let raw = '', bytes = 0;
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          bytes += value.byteLength;
          if (bytes > 512) { await reader.cancel(); return reply({ error:'Dữ liệu quá dài.' }, 413); }
          raw += decoder.decode(value, { stream:true });
        }
        try { input = JSON.parse(raw + decoder.decode()); } catch { return reply({ error:'Dữ liệu không hợp lệ.' }, 400); }
        if (!validPhoto(input?.photo) || !/^[a-f0-9]{32}$/.test(input?.visitor || '') || !['read','set'].includes(input?.action)) return reply({ error:'Dữ liệu không hợp lệ.' }, 400);
        if (input.action === 'set' && (!Number.isInteger(input.emoji) || input.emoji < 0 || input.emoji > 3 || typeof input.active !== 'boolean')) return reply({ error:'Cảm xúc không hợp lệ.' }, 400);
      }
      const key = input.visitor ? createHash('sha256').update(input.visitor).digest('hex') : null;
      for (let attempt = 0; attempt < 96; attempt++) {
        const saved = await store.read();
        const data = saved?.data || { revision:0, members:[] };
        if (!Number.isSafeInteger(data.revision) || !Array.isArray(data.members)) throw new Error('Invalid garden document');
        if (request.method === 'GET' || input.action === 'read') return reply(present(data, input.photo, key));
        const votes = { ...data.reactions?.[input.photo] };
        const mask = votes[key] || 0, bit = 1 << input.emoji;
        const nextMask = input.active ? mask | bit : mask & ~bit;
        // Repeating a successful request cannot increment again.
        if (nextMask === mask) return reply(present(data, input.photo, key));
        if (!mask && Object.keys(votes).length >= 500) return reply({ error:'Ảnh đã đạt giới hạn lượt thả cảm xúc.' }, 409);
        if (nextMask) votes[key] = nextMask; else delete votes[key];
        const next = { ...data, revision:data.revision + 1, reactions:{ ...data.reactions, [input.photo]:votes } };
        if (await store.write(next, saved?.etag ?? null)) return reply(present(next, input.photo, key));
        await sleep(15 + Math.random() * Math.min(220, (attempt + 1) * 20));
      }
      return reply({ error:'Nhiều bạn đang thả cảm xúc. Thử lại sau một lát nhé.' }, 503);
    } catch (error) {
      console.error('Reaction storage error:', error.message);
      return reply({ error:'Chưa kết nối được cảm xúc của lớp. Thử lại nhé.' }, 503);
    }
  };
}
