import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const window = { FLOWER_PROFILES:{} };
runInNewContext(await readFile(new URL('../public/bouquet.js',import.meta.url),'utf8'), {window});
const branches = (name,options={}) => [...window.drawBouquet(name,options).matchAll(/<g class="bouquet-flower" data-bloom-source="([^"]+)" data-flower="([^"]+)" transform="([^"]+)">/g)]
  .map(([,source,flower,transform])=>({source,flower,transform}));

test('short names have full bouquets, while empty names still have no flowers', () => {
  for (const name of ['', '  ', '123']) assert.equal(window.drawBouquet(name,{garden:true,wrapped:false}),'');
  for (const name of ['An','Vy','Lê','Minh Anh','abcdefghijkl']) {
    assert.equal(branches(name).length,12);
    assert.equal(branches(name,{garden:true,wrapped:false}).length,12);
  }
});

test('garden accents only fill sparse clumps, never adding to an already-full clump', () => {
  for (const [name,letters,fill,garden] of [['An',2,6,4],['abcdefghij',10,0,2],['abcdefghijkl',12,0,0],['abcdefghijklmnopqrst',20,0,0]]) {
    const result=branches(name,{garden:true,wrapped:false});
    assert.equal(result.filter(b=>b.source==='letter').length,letters);
    assert.equal(result.filter(b=>b.source==='fill').length,fill);
    assert.equal(result.filter(b=>b.source==='garden').length,garden);
    assert.deepEqual(result.slice(0,letters).map(b=>b.source),Array(letters).fill('letter'));
  }
});

test('letter positions and rose/lily keys survive decorative infill', () => {
  const first=branches('GRV',{wrapped:false,animateFrom:2});
  const next=branches('GRVKLY',{wrapped:false,animateFrom:3});
  assert.deepEqual(first.slice(0,3),next.slice(0,3));
  assert.deepEqual(next.slice(0,6).map(b=>Number(b.flower.split('-')[0])),[4,4,4,6,6,6]);
  assert(next.slice(0,6).every(b=>b.source==='letter'));
  assert(next.slice(6).every(b=>b.source==='fill'));
});

test('saved names produce repeatable infill across casing, spacing and Unicode forms', () => {
  const result=branches('Ngọc An',{garden:true,wrapped:false});
  assert.deepEqual(result,branches('  NGỌC   AN  ',{garden:true,wrapped:false}));
  assert.deepEqual(result,branches('Ngọc An'.normalize('NFD'),{garden:true,wrapped:false}));
});

test('full names retain every original letter stem without extra decorative flowers', () => {
  const name='Nguyễn Hoàng Minh Anh';
  const count=[...name].filter(c=>/\p{L}/u.test(c)).length;
  const normal=branches(name,{wrapped:false});
  const garden=branches(name,{garden:true,wrapped:false});
  assert(count>=12);
  assert.equal(garden.length,count);
  assert(garden.every(b=>b.source==='letter'));
  assert.deepEqual(normal,garden);
});
