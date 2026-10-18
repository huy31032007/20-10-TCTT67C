import test from 'node:test';
import assert from 'node:assert/strict';
import { createGardenHandler } from '../server/garden-handler.mjs';

function memoryStore() {
  let saved = null, version = 0;
  return {
    async read() { return saved ? { data: structuredClone(saved), etag: String(version) } : null; },
    async write(data, etag) {
      await Promise.resolve();
      if ((saved ? String(version) : null) !== etag) return false;
      saved = structuredClone(data); version++; return true;
    }
  };
}
const post = data => new Request('https://class.example/api/garden', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
const handler = () => createGardenHandler(memoryStore(), { sleep: async () => {} });

test('separate visitors read the same joined member; normalized duplicates do not overwrite it', async () => {
  const serve = handler();
  const initial = await (await serve(new Request('https://class.example/api/garden'))).json();
  assert.equal(initial.members.length, 0);
  const first = await serve(post({name:'Nguyễn Minh Anh', id:'spoofed', joinedAt:'yesterday'}));
  assert.equal(first.status, 201);
  const one = await first.json();
  assert.notEqual(one.member.id,'spoofed');
  assert.match(one.member.joinedAt,/^\d{4}-/);
  const duplicate = await (await serve(post({name:'  NGUYỄN   MINH ANH  '}))).json();
  assert.equal(duplicate.created, false);
  assert.equal(duplicate.member.id, one.member.id);
  assert.equal(duplicate.member.name, 'Nguyễn Minh Anh');
  const otherVisitor = await (await serve(new Request('https://class.example/api/garden'))).json();
  assert.equal(otherVisitor.members.length,1);
  assert.equal(otherVisitor.members[0].name,'Nguyễn Minh Anh');
});

test('concurrent function instances preserve all joins and deduplicate simultaneous repeats', async () => {
  const store = memoryStore();
  const functions = Array.from({length:8}, () => createGardenHandler(store,{ sleep: async () => {} }));
  const names = ['An','Bình','Chi','Dung','Hà','Hạ','Lan','Mai'];
  const responses = await Promise.all(names.map((name,i) => functions[i](post({name}))));
  assert(responses.every(response => response.status === 201));
  await Promise.all(functions.map(serve => serve(post({name:'Minh Anh'}))));
  const all = await (await functions[0](new Request('https://class.example/api/garden'))).json();
  assert.equal(all.members.length,9);
  assert.equal(all.revision,9);
  assert.equal(new Set(all.members.map(x=>x.id)).size,9);
});

test('invalid names, oversized data and cross-origin writes cannot modify the shared garden', async () => {
  const serve = handler();
  for (const name of ['', '123', '<script>alert(1)</script>', 'A'.repeat(31)]) assert.equal((await serve(post({name}))).status,400);
  assert.equal((await serve(post({name:'An',extra:'x'.repeat(3000)}))).status,413);
  const cross = new Request('https://class.example/api/garden',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://other.example'},body:JSON.stringify({name:'An'})});
  assert.equal((await serve(cross)).status,403);
  assert.equal((await serve(new Request('https://class.example/api/garden',{method:'DELETE'}))).status,405);
  assert.equal((await (await serve(new Request('https://class.example/api/garden'))).json()).members.length,0);
});
