export function inlineTextKey(text) {
  let hash = 0x811c9dc5;
  for (const char of text) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return `site-inline-${(hash >>> 0).toString(16)}`;
}

export function createInlineContentRevision(current, defaults, key, value, previous) {
  if ((current[key] ?? defaults[key]) !== previous) {
    throw new Error('Teksten er endret av en annen administrator. Lukk og åpne teksten på nytt.');
  }
  return { before: { [key]: current[key] ?? null }, after: { [key]: value } };
}
