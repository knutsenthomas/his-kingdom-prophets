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

export function googleConsentState(analytics) {
  return { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: analytics ? 'granted' : 'denied' };
}
export function initializeConsentMode(target = window) {
  if (target.hkpcConsentInitialized) return;
  target.dataLayer = target.dataLayer || [];
  target.gtag = target.gtag || function () { target.dataLayer.push(arguments); };
  target.gtag('consent', 'default', googleConsentState(false));
  target.gtag('set', 'ads_data_redaction', true);
  target['ga-disable-G-03629NPBTY'] = true;
  target.hkpcConsentInitialized = true;
}
export function updateConsentMode(analytics, target = window) {
  initializeConsentMode(target);
  target.gtag('consent', 'update', googleConsentState(analytics));
}
export function analyticsAllowed(consent, privacySignal = false) {
  return consent?.analytics === true && privacySignal !== true;
}
