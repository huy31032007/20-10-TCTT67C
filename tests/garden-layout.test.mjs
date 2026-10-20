import test from 'node:test';
import assert from 'node:assert/strict';
import { gardenLayout } from '../src/shared/garden-layout.mjs';

const members = Array.from({length:60}, (_,i) => ({id:`fixture-flower-${i}`}));

test('empty gardens have no placeholders and a single flower stays inside the scene', () => {
  assert.deepEqual(gardenLayout([],390,844), {items:[],height:844,frameHeight:844});
  const scene = gardenLayout(members.slice(0,1),390,844), plant = scene.items[0];
  assert.equal(scene.items.length,1);
  assert(plant.x > plant.size / 2 && plant.x + plant.size / 2 < 390);
  assert(plant.bottom >= scene.frameHeight * .47 && plant.bottom < scene.height - 60);
});

test('saved IDs give repeatable, irregular positions without modifying participant identities', () => {
  const first = gardenLayout(members.slice(0,15),1280,900);
  assert.deepEqual(first,gardenLayout(members.slice(0,15),1280,900));
  assert.deepEqual(first.items.map(item => item.id),members.slice(0,15).map(member => member.id));
  assert(new Set(first.items.map(item => item.y)).size > 12);
  assert(new Set(first.items.map(item => item.size)).size > 12);
});

test('30 and 60 flower crowns stay distinct and plants remain in bounds at six widths', () => {
  for (const [width,height] of [[320,740],[360,800],[390,844],[768,1024],[1024,768],[1280,900]]) {
    for (const count of [30,60]) {
      const scene = gardenLayout(members.slice(0,count),width,height);
      assert.equal(scene.items.length,count);
      assert.equal(scene.height,height); // No extra flowers below the visible landscape.
      for (const [i,item] of scene.items.entries()) {
        const extent = item.size * .5 + item.height * .04;
        assert(item.x >= extent && item.x + extent <= width, `clipped flower at ${width}`);
        assert(item.y >= height * .4 && item.bottom < Math.min(height * .91,height - 60));
        assert(item.zIndex >= 10 && item.zIndex <= 70);
        for (const other of scene.items.slice(i+1)) {
          const a=item.crown,b=other.crown;
          const dx=Math.abs(a.x-b.x),dy=Math.abs(a.y-b.y);
          assert((dx/((a.width+b.width)/2))**2 + (dy/((a.height+b.height)/2))**2 >= 1, `flower centers crowded at ${width}`);
          const overlap=Math.max(0,(a.width+b.width)/2-dx)*Math.max(0,(a.height+b.height)/2-dy);
          assert(overlap / Math.min(a.width*a.height,b.width*b.height) < .15, `crowns significantly obscured at ${width}`);
        }
      }
    }
  }
});

test('short browser panels also fit the entire garden without a 620px minimum', () => {
  for (const height of [420,560]) {
    const scene=gardenLayout(members.slice(0,30),768,height);
    assert.equal(scene.height,height);
    assert(scene.items.every(item=>item.bottom < height - 60));
  }
});

test('30 clumps stay large enough to read as bouquets on phones and desktop', () => {
  for (const [width,height,minSize] of [[320,740,48],[390,844,60],[1280,900,115]]) {
    const {items}=gardenLayout(members.slice(0,30),width,height);
    assert(items.reduce((total,item)=>total+item.size,0)/items.length >= minSize, `garden shrunk too far at ${width}`);
  }
});
