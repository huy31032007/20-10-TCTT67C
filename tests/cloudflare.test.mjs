import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createD1Store } from '../cloudflare/d1-store.mjs';
import { createGardenHandler } from '../server/garden-handler.mjs';
import worker from '../cloudflare/worker.mjs';

// Execute the adapter's SQL in SQLite, rather than simulating its write decisions.
let DatabaseSync;
try { ({ DatabaseSync } = await import('node:sqlite')); } catch {}
function database(t) {
  const sql = new DatabaseSync(':memory:');
  t.after(() => sql.close());
  sql.exec(readFileSync(new URL('../cloudflare/schema.sql', import.meta.url), 'utf8'));
  const prepare = (query, values = []) => ({
    bind: (...args) => prepare(query, args),
    first: async () => sql.prepare(query).get(...values) || null,
    run: async () => ({ meta: { changes: Number(sql.prepare(query).run(...values).changes) } })
  });
  return { withSession(mode) { assert.equal(mode, 'first-primary'); return { prepare }; } };
}

test('Worker reserves and confirms letters through D1 without exposing assignments in the garden API', { skip: !DatabaseSync }, async t => {
  const env = { GARDEN_DB: database(t) };
  const make = (action, record) => new Request('https://class.example/api/letter', {
    method:'POST', headers:{ 'Content-Type':'application/json' },
    body:JSON.stringify({ action, visitor:'b'.repeat(32), ...(record ? { id:record.letter.id, cycle:record.cycle } : {}) })
  });
  const record = await (await worker.fetch(make('reserve'), env)).json();
  assert.equal(record.opened, false);
  const opened = await (await worker.fetch(make('open', record), env)).json();
  assert.equal(opened.opened, true);
  const garden = await (await worker.fetch(new Request('https://class.example/api/garden'), env)).json();
  assert.deepEqual(Object.keys(garden).sort(), ['members','revision']);
  assert.equal(garden.members.length, 0);
  assert.equal(garden.revision, 2);
});

test('D1 SQL rejects competing first inserts and stale updates without losing stored data', { skip: !DatabaseSync }, async t => {
  const db = database(t), a = createD1Store(db), b = createD1Store(db);
  assert.equal(await a.read(), null);
  const first = { revision: 1, members: [{ id: 'a', name: 'An' }] };
  assert.equal(await a.write(first, null), true);
  assert.equal(await b.write({ revision: 1, members: [{ id: 'b', name: 'Bình' }] }, null), false);
  const snapshot = await b.read();
  assert.deepEqual(snapshot.data, first);
  const next = { revision: 2, members: [...first.members, { id: 'b', name: 'Bình' }] };
  assert.equal(await a.write(next, snapshot.etag), true);
  assert.equal(await b.write({ revision: 2, members: [] }, snapshot.etag), false);
  assert.deepEqual((await createD1Store(db).read()).data, next);
});

test('separate handlers using D1 SQL share all concurrent joins and deduplicate names', { skip: !DatabaseSync }, async t => {
  const db = database(t);
  const names = ['An', 'Bình', 'Chi', 'Dung', 'Hà', 'Lan'];
  const serve = () => createGardenHandler(createD1Store(db), { sleep: async () => {} });
  const post = name => new Request('https://class.example/api/garden', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name })
  });
  const replies = await Promise.all(names.map(name => serve()(post(name))));
  assert(replies.every(response => response.status === 201));
  const duplicate = await (await serve()(post('  AN  '))).json();
  assert.equal(duplicate.created, false);
  const garden = await (await serve()(new Request('https://class.example/api/garden'))).json();
  assert.equal(garden.revision, names.length);
  assert.deepEqual(garden.members.map(member => member.name).sort(), names.sort());
});

test('Worker serves assets separately and returns JSON for unknown API routes', async () => {
  let assetCalls = 0;
  const env = { ASSETS: { fetch: async () => { assetCalls++; return new Response('asset'); } } };
  assert.equal(await (await worker.fetch(new Request('https://class.example/'), env)).text(), 'asset');
  const unknown = await worker.fetch(new Request('https://class.example/api/missing'), env);
  assert.equal(unknown.status, 404);
  assert.match(unknown.headers.get('content-type'), /application\/json/);
  assert.equal(assetCalls, 1);
});

test('Worker persists photo reactions in D1 and returns only public totals', { skip: !DatabaseSync }, async t => {
  const env = { GARDEN_DB:database(t) };
  const result = await worker.fetch(new Request('https://class.example/api/reactions', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ photo:43, visitor:'c'.repeat(32), action:'set', emoji:3, active:true }) }), env);
  assert.equal(result.status, 200);
  const data = await (await worker.fetch(new Request('https://class.example/api/reactions?photo=43'), env)).json();
  assert.deepEqual(data, { photo:43, revision:1, counts:[0,0,0,1] });
  const garden = await (await worker.fetch(new Request('https://class.example/api/garden'), env)).json();
  assert.deepEqual(garden, { revision:1, members:[] });
});

test('Cloudflare Worker connects admin authorization and deletion to D1', { skip: !DatabaseSync }, async t => {
  const env = { GARDEN_DB: database(t), GARDEN_ADMIN_TOKEN: 'local-cloudflare-test-secret-not-for-production' };
  const post = await worker.fetch(new Request('https://class.example/api/garden', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'An' })
  }), env);
  const { member } = await post.json();
  const unauthorized = await worker.fetch(new Request('https://class.example/api/admin/garden'), env);
  assert.equal(unauthorized.status, 401);
  const removed = await worker.fetch(new Request('https://class.example/api/admin/garden', {
    method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.GARDEN_ADMIN_TOKEN}` }, body: JSON.stringify({ id: member.id })
  }), env);
  assert.equal(removed.status, 200);
  assert.deepEqual((await removed.json()).garden, { revision: 2, members: [] });
});
