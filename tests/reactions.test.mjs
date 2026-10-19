import test from 'node:test';
import assert from 'node:assert/strict';
import { createReactionHandler } from '../server/reaction-handler.mjs';
import { createGardenHandler } from '../server/garden-handler.mjs';
import { createLetterHandler } from '../server/letter-handler.mjs';

const origin = 'https://class.example';
const visitor = i => i.toString(16).padStart(32, '0');
const vote = (i, extra = {}) => new Request(origin + '/api/reactions', {
  method:'POST', headers:{ 'Content-Type':'application/json' },
  body:JSON.stringify({ photo:1, visitor:visitor(i), action:'set', emoji:0, active:true, ...extra })
});
const read = photo => new Request(origin + '/api/reactions?photo=' + photo);
function setup(initial = null) {
  let data = initial, version = 0, writes = 0;
  const store = {
    async read() { return data ? { data:structuredClone(data), etag:String(version) } : null; },
    async write(next, etag) {
      if (etag !== (data ? String(version) : null)) return false;
      data = structuredClone(next); version++; writes++; return true;
    }
  };
  return { store, serve:createReactionHandler(store, { sleep:async () => {} }), writes:() => writes };
}
test('reaction reads cover exactly 43 photos without creating records or exposing visitor keys', async () => {
  const app = setup();
  for (let i = 1; i <= 43; i++) {
    const data = await (await app.serve(read(i))).json();
    assert.deepEqual(data, { photo:i, revision:0, counts:[0,0,0,0] });
  }
  const mine = await (await app.serve(vote(1, { action:'read' }))).json();
  assert.deepEqual(mine.mine, [false,false,false,false]);
  assert.equal(app.writes(), 0);
});
test('concurrent reaction handlers preserve all visitors and separate photos and emojis', async () => {
  const app = setup();
  const replies = await Promise.all(Array.from({ length:60 }, (_, i) => createReactionHandler(app.store, { sleep:async () => {} })(vote(i + 1))));
  assert(replies.every(response => response.ok));
  assert.deepEqual((await (await app.serve(read(1))).json()).counts, [60,0,0,0]);
  await app.serve(vote(1, { emoji:1 }));
  await app.serve(vote(1, { photo:2, emoji:3 }));
  assert.deepEqual((await (await app.serve(read(1))).json()).counts, [60,1,0,0]);
  assert.deepEqual((await (await app.serve(read(2))).json()).counts, [0,0,0,1]);
});
test('retrying an identical reaction is idempotent and only its visitor can remove that vote', async () => {
  const app = setup();
  await app.serve(vote(1)); await app.serve(vote(1)); await app.serve(vote(2));
  assert.equal(app.writes(), 2);
  await app.serve(vote(1, { active:false })); await app.serve(vote(1, { active:false }));
  const mine = await (await app.serve(vote(1, { action:'read' }))).json();
  assert.deepEqual(mine.counts, [1,0,0,0]); assert.deepEqual(mine.mine, [false,false,false,false]);
  assert.deepEqual((await (await app.serve(vote(2, { action:'read' }))).json()).mine, [true,false,false,false]);
  assert.equal(app.writes(), 3);
  assert.deepEqual(Object.keys(await (await app.serve(read(1))).json()).sort(), ['counts','photo','revision']);
});
test('random letters do not change shared reactions, garden joins or protected deletion', async () => {
  const app = setup(), garden = createGardenHandler(app.store, { sleep:async () => {} });
  await app.serve(vote(1));
  const joined = await (await garden(new Request(origin + '/api/garden', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ name:'Kiểm thử Lan' }) }))).json();
  const letters = createLetterHandler({ pick:() => 0 });
  const letter = await (await letters(new Request(origin + '/api/letter', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ visitor:visitor(1), action:'reserve' }) }))).json();
  await app.serve(vote(2, { emoji:2 }));
  const secret = 'local-reaction-admin-test-secret-only';
  const admin = createGardenHandler(app.store, { adminOnly:true, adminToken:secret });
  await admin(new Request(origin + '/api/admin/garden', { method:'DELETE', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${secret}` }, body:JSON.stringify({ id:joined.member.id }) }));
  const opened = await letters(new Request(origin + '/api/letter', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ visitor:visitor(1), action:'open', id:letter.letter.id, cycle:letter.cycle }) }));
  assert.equal((await opened.json()).opened, true);
  assert.deepEqual((await (await app.serve(read(1))).json()).counts, [1,0,1,0]);
  const publicGarden = await (await garden(new Request(origin + '/api/garden'))).json();
  assert.deepEqual(Object.keys(publicGarden).sort(), ['members','revision']); assert.deepEqual(publicGarden.members, []);
});
test('reaction API rejects invalid writes, bounds storage and reports storage outages', async () => {
  const app = setup();
  for (const extra of [{ photo:0 },{ photo:44 },{ emoji:4 },{ emoji:-1 },{ active:1 },{ visitor:'bad' },{ action:'delete' }]) assert.equal((await app.serve(vote(1, extra))).status, 400);
  const foreign = vote(1); foreign.headers.set('Origin','https://other.example');
  assert.equal((await app.serve(foreign)).status, 403);
  assert.equal((await app.serve(new Request(origin + '/api/reactions', { method:'DELETE' }))).status, 405);
  assert.equal((await app.serve(new Request(origin + '/api/reactions', { method:'POST', body:'{}' }))).status, 415);
  assert.equal((await app.serve(new Request(origin + '/api/reactions', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:'x'.repeat(513) }))).status, 413);
  assert.equal(app.writes(), 0);
  const full = setup({ revision:1, members:[], reactions:{ 1:Object.fromEntries(Array.from({ length:500 }, (_, i) => [i.toString(16).padStart(64,'0'), 1])) } });
  assert.equal((await full.serve(vote(999))).status, 409);
  const failed = createReactionHandler({ read:async () => { throw new Error('test outage'); } });
  assert.equal((await failed(read(1))).status, 503);
});
