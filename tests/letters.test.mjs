import test from 'node:test';
import assert from 'node:assert/strict';
import { createLetterHandler } from '../server/letter-handler.mjs';
import { createGardenHandler } from '../server/garden-handler.mjs';
import { LETTERS } from '../server/letter-catalog.mjs';

const origin = 'https://class.example';
const visitor = i => i.toString(16).padStart(32, '0');
const request = (i, action = 'reserve', record) => new Request(origin + '/api/letter', {
  method:'POST', headers:{ 'Content-Type':'application/json' },
  body:JSON.stringify({ visitor:visitor(i), action, ...(record ? { id:record.letter.id, cycle:record.cycle } : {}) })
});
function setup() {
  let data = null, version = 0, time = Date.now();
  const store = {
    async read() { return data ? { data:structuredClone(data), etag:String(version) } : null; },
    async write(next, etag) {
      if (etag !== (data ? String(version) : null)) return false;
      data = structuredClone(next); version++; return true;
    }
  };
  const letters = createLetterHandler(store, { pick:() => 0, now:() => time, sleep:async () => {} });
  return { store, letters, garden:createGardenHandler(store, { sleep:async () => {} }), advance:ms => { time += ms; } };
}
test('catalog contains exactly 60 distinct original letters and the requested sender', () => {
  assert.equal(LETTERS.length, 60);
  assert.equal(new Set(LETTERS.map(letter => letter.paragraphs.join(' '))).size, 60);
  assert(LETTERS.every((letter, index) => letter.id === index + 1 && letter.paragraphs.length === 2 && letter.signature === 'Từ các bạn nam TCTT67C'));
});
test('60 simultaneous reservations get distinct letters, only confirmed opens consume a round', async () => {
  const app = setup();
  const responses = await Promise.all(Array.from({ length:60 }, (_, i) => app.letters(request(i + 1))));
  assert(responses.every(response => response.status === 200));
  const records = await Promise.all(responses.map(response => response.json()));
  assert.equal(new Set(records.map(record => record.letter.id)).size, 60);
  assert(records.every(record => !record.opened && record.cycle === 1));
  assert.equal((await app.letters(request(61))).status, 409);
  for (let i = 0; i < 60; i++) assert.equal((await app.letters(request(i + 1, 'open', records[i]))).status, 200);
  const next = await (await app.letters(request(61))).json();
  assert.equal(next.cycle, 2);
  // Reopening on the same visitor key returns their original letter, without consuming another.
  const original = await (await app.letters(request(1))).json();
  assert.equal(original.letter.id, records[0].letter.id); assert.equal(original.cycle, 1); assert.equal(original.opened, true);
});
test('abandoned reservations expire; stale confirmations cannot consume someone else’s letter', async () => {
  const app = setup();
  const first = await (await app.letters(request(1))).json();
  app.advance(10 * 60 * 1000 + 1);
  const second = await (await app.letters(request(2))).json();
  assert.equal(first.letter.id, second.letter.id);
  assert.equal((await app.letters(request(1, 'open', first))).status, 409);
  assert.equal((await app.letters(request(2, 'open', second))).status, 200);
});
test('garden joins, deletions and letter assignments preserve each other without leaking visitor keys', async () => {
  const app = setup();
  const join = name => new Request(origin + '/api/garden', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ name }) });
  const post = await (await app.garden(join('Kiểm thử Lan'))).json();
  const record = await (await app.letters(request(1))).json();
  await app.letters(request(1, 'open', record));
  await app.garden(join('Kiểm thử Mai'));
  const password = 'local-letter-delete-test-password-not-real';
  const admin = createGardenHandler(app.store, { adminOnly:true, adminToken:password });
  await admin(new Request(origin + '/api/admin/garden', { method:'DELETE', headers:{ Authorization:`Bearer ${password}`, 'Content-Type':'application/json' }, body:JSON.stringify({ id:post.member.id }) }));
  const list = await (await app.garden(new Request(origin + '/api/garden'))).json();
  assert.deepEqual(Object.keys(list).sort(), ['members','revision']);
  assert.deepEqual(list.members.map(member => member.name), ['Kiểm thử Mai']);
  assert.equal((await (await app.letters(request(1))).json()).opened, true);
});
test('letter API rejects invalid, oversized and foreign-origin requests without a write', async () => {
  const app = setup();
  assert.equal((await app.letters(new Request(origin + '/api/letter'))).status, 405);
  for (const body of [{ visitor:'short',action:'reserve' }, { visitor:visitor(1),action:'other' }]) {
    assert.equal((await app.letters(new Request(origin + '/api/letter', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) }))).status, 400);
  }
  const foreign = request(1); foreign.headers.set('Origin','https://other.example');
  assert.equal((await app.letters(foreign)).status, 403);
  assert.equal((await app.letters(new Request(origin + '/api/letter', { method:'POST', headers:{'Content-Type':'application/json'}, body:'x'.repeat(513) }))).status, 413);
  assert.equal(await app.store.read(), null);
});
