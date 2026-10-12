import { test } from 'node:test';
import assert from 'node:assert/strict';
import { languageFromUrl } from '../src/utils/languageLink.js';
test('app links select Norwegian or English and ignore other query parameters', () => {
  assert.equal(languageFromUrl('?lang=en'), 'en');
  assert.equal(languageFromUrl('?source=app&lang=no'), 'no');
});
test('missing or unsupported language preserves browser language fallback', () => {
  for (const query of ['', '?lang=', '?lang=de', '?other=en']) assert.equal(languageFromUrl(query), null);
});
