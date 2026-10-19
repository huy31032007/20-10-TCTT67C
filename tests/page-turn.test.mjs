import test from 'node:test';
import assert from 'node:assert/strict';
import { turnTarget, dragIntent, dragProgress, shouldCompleteTurn } from '../src/album/page-turn.mjs';
import { buildAlbumPages } from '../src/album/album-layout.mjs';

test('page turns cannot cross either end or skip a spread', () => {
  assert.equal(turnTarget(0, -1, 24), null);
  assert.equal(turnTarget(23, 1, 24), null);
  assert.equal(turnTarget(7, 2, 24), null);
  assert.equal(turnTarget(7, -1, 24), 6);
  assert.equal(turnTarget(7, 1, 24), 8);
});
test('vertical scrolling and pointer jitter do not start a page turn', () => {
  assert.equal(dragIntent(7, 0), false);
  assert.equal(dragIntent(20, 30), false);
  assert.equal(dragIntent(-30, 10), true);
  assert.equal(dragIntent(30, -10), true);
});
test('forward and backward drags follow the finger and clamp at both ends', () => {
  assert.equal(dragProgress(600, 300, 1, 600), .5);
  assert.equal(dragProgress(100, 400, -1, 600), .5);
  assert.equal(dragProgress(600, 700, 1, 600), 0);
  assert.equal(dragProgress(600, -200, 1, 600), 1);
  assert.equal(dragProgress(0, 50, -1, 0), 0);
});
test('release finishes long drags and flicks but returns short or reversed drags', () => {
  assert.equal(shouldCompleteTurn(.4, 0), true);
  assert.equal(shouldCompleteTurn(.12, .7), true);
  assert.equal(shouldCompleteTurn(.04, 2), false);
  assert.equal(shouldCompleteTurn(.2, .1), false);
  assert.equal(shouldCompleteTurn(.6, -.5), false);
  assert.equal(shouldCompleteTurn(.9, -.5), true);
});
test('album grouping keeps all 43 reaction identities exactly once in 24 views', () => {
  const pages = buildAlbumPages(Array.from({ length:43 }, () => ({})));
  assert.equal(pages.length, 24);
  assert(pages.every(page => page.length >= 1 && page.length <= 3));
  assert.deepEqual(pages.flat().sort((a,b) => a-b), Array.from({ length:43 }, (_, i) => i));
});
