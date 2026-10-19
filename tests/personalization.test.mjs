import test from 'node:test';
import assert from 'node:assert/strict';
import { formatGreetingName, personalizeText } from '../src/shared/personalization.mjs';
import { LETTERS } from '../server/letter-catalog.mjs';

test('greetings use the last two words with proper Vietnamese capitalization', () => {
  for (const [input, expected] of [
    ['Nguyễn Thu Phương', 'Thu Phương'], ['Lương đan lê', 'Đan Lê'],
    ['  ngUYỄN   tHỊ   mINH\tANH  ', 'Minh Anh'], ['ĐẶNG THU HÀ', 'Thu Hà']
  ]) assert.equal(formatGreetingName(input), expected);
});
test('one-word, two-word and decomposed Unicode names stay readable', () => {
  assert.equal(formatGreetingName('PHƯƠNG'), 'Phương');
  assert.equal(formatGreetingName('đan lê'.normalize('NFD')), 'Đan Lê');
  assert.equal(formatGreetingName("H’HEN NIÊ"), 'H’Hen Niê');
  assert.equal(formatGreetingName('MAI-ANH'), 'Mai-Anh');
});
test('all 30 wishes replace the placeholder with the friendly name', () => {
  for (const letter of LETTERS) {
    const text = letter.paragraphs.map(p => personalizeText(p, 'Nguyễn Thu Phương')).join(' ');
    assert(text.includes('Thu Phương'));
    assert(!text.includes('[tên]')); assert(!text.includes('Nguyễn Thu Phương'));
  }
  assert.equal(personalizeText('Chào [tên], cảm ơn [tên] nhé!', 'Lương đan lê'), 'Chào Đan Lê, cảm ơn Đan Lê nhé!');
});
test('empty display names fall back naturally without undefined or blank greetings', () => {
  assert.equal(formatGreetingName('  '), 'cậu');
  assert.equal(formatGreetingName(null), 'cậu');
  assert.equal(personalizeText('Chào [tên]!', undefined), 'Chào cậu!');
});
