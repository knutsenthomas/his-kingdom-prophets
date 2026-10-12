/** Only accept the website's supported language codes from an app link. */
export function languageFromUrl(search) {
  const language = new URLSearchParams(search).get('lang');
  return language === 'no' || language === 'en' ? language : null;
}
