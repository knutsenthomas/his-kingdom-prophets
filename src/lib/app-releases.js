// Add verified public download URLs here when each app is released.
// QR codes keep pointing to the permanent landing page, so printed codes stay valid.
export const APP_RELEASES = [
  { id: 'ios', name: 'iPhone og iPad', downloadUrl: null, description: { no: 'Ha undervisningen og fellesskapet med deg. Tilpasset både mobil og nettbrett.', en: 'Keep your teaching and community close. Designed for phone and tablet.' } },
  { id: 'android', name: 'Android', downloadUrl: null, description: { no: 'Følg skolehverdagen fra Android-telefonen eller nettbrettet ditt.', en: 'Follow your school day from your Android phone or tablet.' } },
  { id: 'mac', name: 'Mac', downloadUrl: null, description: { no: 'Få plass til fordypning med HKP Community i et eget vindu på Mac.', en: 'Make room for deeper study with HKP Community in its own Mac window.' } },
];
export function appLandingLink(id, language = 'no') {
  const platform = APP_RELEASES.some(app => app.id === id) ? id : '';
  return `https://hkpc.no/apper?lang=${language === 'en' ? 'en' : 'no'}${platform ? `#${platform}` : ''}`;
}
