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
