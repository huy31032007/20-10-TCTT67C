import test from 'node:test';
import assert from 'node:assert/strict';
import { createGardenHandler } from '../server/garden-handler.mjs';

const token = 'local-test-admin-token-not-a-real-secret-2026';
const origin = 'https://class.example';
function setup() {
  let data = null, version = 0, reads = 0, writes = 0;
  const store = {
    async read() { reads++; return data ? { data: structuredClone(data), etag: String(version) } : null; },
    async write(next, expected) {
      await Promise.resolve();
      if ((data ? String(version) : null) !== expected) return false;
      data = structuredClone(next); version++; writes++; return true;
    }
  };
  const options = { sleep: async () => {} };
  return {
    store,
    public: createGardenHandler(store, options),
    admin: createGardenHandler(store, { ...options, adminOnly: true, adminToken: token }),
    counts: () => ({ reads, writes })
  };
}
const join = name => new Request(origin + '/api/garden', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
const adminRequest = (method = 'GET', id, password = token, extra = {}) => new Request(origin + '/api/admin/garden', {
  method, headers: { Authorization: `Bearer ${password}`, ...(id !== undefined ? { 'Content-Type': 'application/json' } : {}), ...extra },
  ...(id !== undefined ? { body: JSON.stringify({ id }) } : {})
});

test('missing or incorrect admin credentials cannot read the admin list or mutate storage', async () => {
  const app = setup();
  for (const request of [new Request(origin + '/api/admin/garden'), adminRequest('GET', undefined, 'wrong'), adminRequest('DELETE', 'a'.repeat(24), 'wrong')]) {
    const result = await app.admin(request);
    assert.equal(result.status, 401);
    assert.equal(result.headers.get('cache-control'), 'no-store');
  }
  assert.deepEqual(app.counts(), { reads: 0, writes: 0 });
});

test('admin endpoint remains disabled until a sufficiently long server secret is configured', async () => {
  for (const adminToken of [undefined, '', 'short']) {
    const app = setup();
    const handle = createGardenHandler(app.store, { adminOnly: true, adminToken });
    assert.equal((await handle(adminRequest())).status, 503);
    assert.deepEqual(app.counts(), { reads: 0, writes: 0 });
  }
});

test('authorized deletion removes only the selected flower, increments revision and is visible to public readers', async () => {
  const app = setup();
  const first = await (await app.public(join('Kiểm thử An'))).json();
  const second = await (await app.public(join('Kiểm thử Bình'))).json();
  assert.equal((await app.admin(adminRequest())).status, 200);
  const deleted = await app.admin(adminRequest('DELETE', first.member.id));
  assert.equal(deleted.status, 200);
  const result = await deleted.json();
  assert.equal(result.deleted, first.member.id);
  assert.equal(result.garden.revision, 3);
  assert.deepEqual(result.garden.members.map(member => member.id), [second.member.id]);
  const publicResponse = await app.public(new Request(origin + '/api/garden'));
  const body = await publicResponse.text();
  assert(!body.includes(token));
  assert.deepEqual(JSON.parse(body), result.garden);
  assert.equal((await app.admin(adminRequest('DELETE', first.member.id))).status, 404);
});

test('admin rejects invalid ids, cross-origin deletion, and writes to the public endpoint', async () => {
  const app = setup();
  const member = (await (await app.public(join('An'))).json()).member;
  assert.equal((await app.admin(adminRequest('DELETE', '../all'))).status, 400);
  assert.equal((await app.admin(adminRequest('DELETE', member.id, token, { Origin: 'https://other.example' }))).status, 403);
  assert.equal((await app.public(new Request(origin + '/api/garden', { method: 'DELETE' }))).status, 405);
  assert.equal((await app.public(new Request(origin + '/api/garden', { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }))).status, 405);
  assert.equal((await (await app.public(new Request(origin + '/api/garden'))).json()).members.length, 1);
});

test('concurrent delete and new join preserve the new participant without restoring the deleted flower', async () => {
  const app = setup();
  const member = (await (await app.public(join('An'))).json()).member;
  const replies = await Promise.all([app.admin(adminRequest('DELETE', member.id)), app.public(join('Bình'))]);
  assert.deepEqual(replies.map(response => response.status), [200, 201]);
  const garden = await (await app.public(new Request(origin + '/api/garden'))).json();
  assert.equal(garden.revision, 3);
  assert.deepEqual(garden.members.map(entry => entry.name), ['Bình']);
  const last = await app.admin(adminRequest('DELETE', garden.members[0].id));
  assert.deepEqual((await last.json()).garden, { revision: 4, members: [] });
});
