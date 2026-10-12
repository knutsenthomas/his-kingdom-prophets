import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { APP_RELEASES, appLandingLink } from '../src/lib/app-releases.js';
test('prelaunch apps do not advertise unverified download URLs', () => {
  assert.deepEqual(APP_RELEASES.map(app => app.id), ['ios', 'android', 'mac']);
  for (const app of APP_RELEASES) assert.equal(app.downloadUrl, null);
});
test('printed QR destinations match language-aware permanent app links', () => {
  const links = JSON.parse(readFileSync(new URL('../public/app-qr/links.json', import.meta.url)));
  for (const app of APP_RELEASES) for (const language of ['no', 'en']) {
    assert.equal(links.find(link => link.file === `${app.id}-${language}.png`).url, appLandingLink(app.id, language));
  }
});
