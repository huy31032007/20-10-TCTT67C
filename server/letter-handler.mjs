import { randomInt } from 'node:crypto';
import { LETTERS } from './letter-catalog.mjs';

const reply = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

// Each opening is independent. No visitor tracking, reservation, cycle or DB
// access; a wish can be picked again immediately, even for the same visitor.
export function createLetterHandler({ pick = randomInt } = {}) {
  return async request => {
    try {
      if (request.method !== 'POST') return reply({ error:'Phương thức không được hỗ trợ.' }, 405);
      if (request.headers.get('origin') && request.headers.get('origin') !== new URL(request.url).origin) return reply({ error:'Yêu cầu không hợp lệ.' }, 403);
      if (!request.headers.get('content-type')?.startsWith('application/json')) return reply({ error:'Dữ liệu không hợp lệ.' }, 415);
      const reader = request.body?.getReader();
      if (!reader) return reply({ error:'Thiếu dữ liệu.' }, 400);
      let raw = '', size = 0;
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 512) { await reader.cancel(); return reply({ error:'Dữ liệu quá dài.' }, 413); }
        raw += decoder.decode(value, { stream:true });
      }
      let input;
      try { input = JSON.parse(raw + decoder.decode()); } catch { return reply({ error:'Dữ liệu không hợp lệ.' }, 400); }
      if (!['reserve', 'open'].includes(input?.action) ||
          (input.visitor !== undefined && !/^[a-f0-9]{32}$/.test(input.visitor))) return reply({ error:'Dữ liệu không hợp lệ.' }, 400);
      // Older cached pages may still confirm an ID from the former 60-letter
      // catalog. Acknowledge it without reading, changing or migrating storage.
      if (input.action === 'open') {
        if (!Number.isInteger(input.id) || input.id < 1 || input.id > 60 || !Number.isSafeInteger(input.cycle) || input.cycle < 1) return reply({ error:'Dữ liệu không hợp lệ.' }, 400);
        const letter = { ...LETTERS[(input.id - 1) % LETTERS.length], id:input.id };
        return reply({ letter, cycle:input.cycle, opened:true });
      }
      return reply({ letter:LETTERS[pick(LETTERS.length)], cycle:1, opened:false });
    } catch (error) {
      console.error('Letter response error:', error.message);
      return reply({ error:'Chưa lấy được thư. Cậu thử lại nhé.' }, 503);
    }
  };
}
