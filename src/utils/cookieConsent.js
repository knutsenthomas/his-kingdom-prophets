export const CONSENT_KEY = 'hkpc-cookie-consent-v2';
export const CONSENT_VERSION = 2;
export const CONSENT_MAX_AGE = 180 * 24 * 60 * 60 * 1000;
export function parseConsent(raw, now = Date.now()) {
  try {
    const value = JSON.parse(raw);
    if (value?.version !== CONSENT_VERSION || typeof value.analytics !== 'boolean' || !Number.isFinite(value.savedAt) || value.savedAt > now || now - value.savedAt >= CONSENT_MAX_AGE) return null;
    return value;
  } catch { return null; }
}
// Only public information pages. Never send form, payment, account or admin URLs.
export function analyticsPage(pathname) {
  return ['/', '/about', '/hkm', '/apper', '/privacy', '/personvern', '/terms', '/accessibility'].includes(pathname);
}
export function cleanAnalyticsEvent(event) {
  try {
    const url = new URL(event.url);
    if (!analyticsPage(url.pathname)) return null;
    return { ...event, url: url.origin + url.pathname };
  } catch { return null; }
}
