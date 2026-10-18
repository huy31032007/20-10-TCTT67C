import { createHash } from 'node:crypto';

const MAX_MEMBERS = 300;
const MAX_BODY = 2048;
const emptyGarden = () => ({ revision: 0, members: [] });
const canonicalName = name => name.normalize('NFC').trim().replace(/\s+/g, ' ');
const nameId = name => createHash('sha256').update(name.toLocaleLowerCase('vi')).digest('hex').slice(0, 24);
const json = (body, status = 200, extra = {}) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...extra } });

async function readGarden(store) {
  const saved = await store.read();
  if (!saved) return { data: emptyGarden(), etag: null };
  if (!Number.isSafeInteger(saved.data?.revision) || !Array.isArray(saved.data?.members)) throw new Error('Invalid garden data');
  return saved;
}

export function createGardenHandler(store, { sleep = ms => new Promise(resolve => setTimeout(resolve, ms)) } = {}) {
  return async function handle(request) {
    try {
      if (request.method === 'GET') return json((await readGarden(store)).data);
      if (request.method !== 'POST') return json({ error: 'Phương thức không được hỗ trợ.' }, 405, { Allow: 'GET, POST' });
      const origin = request.headers.get('origin');
      if (origin && origin !== new URL(request.url).origin) return json({ error: 'Yêu cầu không hợp lệ.' }, 403);
      if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'Dữ liệu không hợp lệ.' }, 415);
      if (Number(request.headers.get('content-length')) > MAX_BODY) return json({ error: 'Dữ liệu quá dài.' }, 413);
      const reader = request.body?.getReader();
      if (!reader) return json({ error: 'Thiếu tên.' }, 400);
      const chunks = [];
      let total = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > MAX_BODY) { await reader.cancel(); return json({ error: 'Dữ liệu quá dài.' }, 413); }
        chunks.push(Buffer.from(value));
      }
      let input;
      try { input = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
      catch { return json({ error: 'Dữ liệu không hợp lệ.' }, 400); }
      const name = typeof input?.name === 'string' ? canonicalName(input.name) : '';
      if (!name || name.length > 30 || !/^[\p{L}\p{M}\s.'’\-]+$/u.test(name) || !/\p{L}/u.test(name)) {
        return json({ error: 'Nhập tên bằng chữ, tối đa 30 ký tự.' }, 400);
      }
      const member = { id: nameId(name), name, joinedAt: new Date().toISOString() };
      // One shared document with atomic compare-and-swap: concurrent joins cannot
      // overwrite each other, including when Netlify runs separate function instances.
      for (let attempt = 0; attempt < 16; attempt++) {
        const { data, etag } = await readGarden(store);
        const existing = data.members.find(entry => entry.id === member.id);
        if (existing) return json({ member: existing, created: false, garden: data });
        if (data.members.length >= MAX_MEMBERS) return json({ error: 'Vườn đã đủ 300 tên.' }, 409);
        const next = { revision: data.revision + 1, members: [...data.members, member] };
        if (await store.write(next, etag)) return json({ member, created: true, garden: next }, 201);
        await sleep(15 + Math.random() * Math.min(220, 25 * (attempt + 1)));
      }
      return json({ error: 'Đang có nhiều bạn tham gia. Thử lại sau ít giây.' }, 503, { 'Retry-After': '2' });
    } catch (error) {
      console.error('Garden storage error:', error.message);
      return json({ error: 'Vườn tạm mất kết nối. Thử lại sau.' }, 503);
    }
  };
}
