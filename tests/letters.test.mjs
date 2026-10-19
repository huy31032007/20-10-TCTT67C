import test from 'node:test';
import assert from 'node:assert/strict';
import { createLetterHandler } from '../server/letter-handler.mjs';
import { LETTERS } from '../server/letter-catalog.mjs';

const origin = 'https://class.example';
const request = (body = { action:'reserve' }) => new Request(origin + '/api/letter', {
  method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(body)
});

test('catalog contains the 30 distinct personalized wishes and the requested sender', () => {
  assert.equal(LETTERS.length, 30);
  assert.equal(new Set(LETTERS.map(letter => letter.paragraphs.join(' '))).size, 30);
  assert(LETTERS.every((letter, index) => letter.id === index + 1 && letter.paragraphs.length >= 1 && letter.paragraphs.join(' ').includes('[tên]') && letter.signature === 'Từ các bạn nam TCTT67C'));
});
test('each opening chooses from all 30 wishes again, even for the same old visitor key', async () => {
  let index = 0;
  const bounds = [], serve = createLetterHandler({ pick:max => { bounds.push(max); return index++ % max; } });
  const ids = [];
  for (let i = 0; i < 60; i++) {
    const response = await serve(request({ action:'reserve', visitor:'a'.repeat(32) }));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    const record = await response.json();
    ids.push(record.letter.id); assert.equal(record.opened, false);
  }
  assert(bounds.every(max => max === 30));
  assert.deepEqual(ids.slice(0, 30), LETTERS.map(letter => letter.id));
  assert.deepEqual(ids.slice(30), ids.slice(0, 30));
});
test('simultaneous visitors can receive the same wish without leases, exhaustion or confirmation', async () => {
  const serve = createLetterHandler({ pick:() => 0 });
  const responses = await Promise.all(Array.from({ length:90 }, () => serve(request())));
  assert(responses.every(response => response.status === 200));
  const records = await Promise.all(responses.map(response => response.json()));
  assert(records.every(record => record.letter.id === 1));
});
test('cached clients can finish old 60-letter confirmations without allocating or consuming anything', async () => {
  const serve = createLetterHandler({ pick:() => 4 });
  const response = await serve(request({ action:'open', visitor:'b'.repeat(32), id:60, cycle:7 }));
  assert.equal(response.status, 200);
  const record = await response.json();
  assert.equal(record.opened, true); assert.equal(record.letter.id, 60); assert.equal(record.cycle, 7);
  assert.deepEqual(record.letter.paragraphs, LETTERS[29].paragraphs);
  const a = await (await serve(request())).json(), b = await (await serve(request())).json();
  assert.equal(a.letter.id, 5); assert.equal(b.letter.id, 5);
});
test('letter API rejects invalid, oversized and foreign-origin requests', async () => {
  const serve = createLetterHandler();
  assert.equal((await serve(new Request(origin + '/api/letter'))).status, 405);
  for (const body of [{ visitor:'short', action:'reserve' }, { action:'other' }, { action:'open', id:61, cycle:1 }, { action:'open', id:1, cycle:0 }]) {
    assert.equal((await serve(request(body))).status, 400);
  }
  const foreign = request(); foreign.headers.set('Origin', 'https://other.example');
  assert.equal((await serve(foreign)).status, 403);
  assert.equal((await serve(new Request(origin + '/api/letter', { method:'POST', body:'{}' }))).status, 415);
  assert.equal((await serve(new Request(origin + '/api/letter', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:'x'.repeat(513) }))).status, 413);
});
