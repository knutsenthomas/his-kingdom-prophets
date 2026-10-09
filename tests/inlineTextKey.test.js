import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inlineTextKey } from '../src/utils/inlineTextKey.js';

test('public text keys survive reloads and distinguish similar and translated texts', () => {
  const texts = ['Om oss', 'Om oss.', 'About us', 'Bønn og åndelig vekst', 'Bonn og andelig vekst'];
  assert.equal(new Set(texts.map(inlineTextKey)).size, texts.length);
  assert.equal(inlineTextKey(texts[3]), inlineTextKey(texts[3]));
  for (const text of texts) assert.match(inlineTextKey(text), /^site-inline-[a-f0-9]+$/);
});

import { createInlineContentRevision } from '../src/utils/inlineTextKey.js';
test('a default text can be saved even before it exists in the database', () => {
  assert.deepEqual(createInlineContentRevision({}, { heading: 'Velkommen' }, 'heading', 'Hei', 'Velkommen'), { before: { heading: null }, after: { heading: 'Hei' } });
});
test('only concurrent changes to the same field block saving', () => {
  assert.throws(() => createInlineContentRevision({ heading: 'Ny tekst' }, {}, 'heading', 'Min tekst', 'Gammel tekst'));
  assert.deepEqual(createInlineContentRevision({ other: 'Ny tekst' }, {}, 'heading', 'Min tekst', undefined).after, { heading: 'Min tekst' });
});
test('empty texts stay empty and history retains the previous text', () => {
  assert.deepEqual(createInlineContentRevision({ heading: '' }, { heading: 'Default' }, 'heading', 'Ny tekst', ''), { before: { heading: '' }, after: { heading: 'Ny tekst' } });
});
