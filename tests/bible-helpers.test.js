import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBibleReference } from '../src/features/bible/lib/parseBibleReference.js';
import { calculateAge } from '../src/features/admission/lib/calculateAge.js';

test('Bible references retain chapter, verse and numbered book names', () => {
  assert.deepEqual(parseBibleReference('Johannes 3:16'), { bookStr: 'Johannes', chapter: 3, verse: 16 });
  assert.deepEqual(parseBibleReference('1. Joh 4,8'), { bookStr: '1. Joh', chapter: 4, verse: 8 });
  assert.deepEqual(parseBibleReference('Joh 3'), { bookStr: 'Joh', chapter: 3, verse: null });
  assert.equal(parseBibleReference(''), null);
  assert.equal(parseBibleReference('ingen referanse'), null);
});

test('admission age respects whether the birthday has passed', () => {
  const now = new Date();
  const year = now.getFullYear() - 20;
  assert.equal(calculateAge(`${year}-01-01`), 20);
  assert.equal(calculateAge(`${year}-12-31`), now.getMonth() === 11 && now.getDate() === 31 ? 20 : 19);
  assert.equal(calculateAge(''), 0);
  assert.equal(calculateAge('invalid'), 0);
});
