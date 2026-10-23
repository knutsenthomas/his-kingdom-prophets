import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { useApp } from '@/contexts/AppContext';

import { CONSENT_KEY as KEY, CONSENT_VERSION, CONSENT_MAX_AGE, parseConsent, analyticsPage, cleanAnalyticsEvent, analyticsAllowed, updateConsentMode } from '@/utils/cookieConsent';
function savedConsent() {
  try { return parseConsent(localStorage.getItem(KEY)); } catch { return null; }
}
export default function CookieConsent() {
  const { language } = useApp();
  const { pathname } = useLocation();
  const en = language !== 'no';
  const privacySignal = navigator.globalPrivacyControl === true;
  const [consent, setConsent] = useState(savedConsent);
  const [open, setOpen] = useState(() => !savedConsent());
  const [customize, setCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(() => savedConsent()?.analytics === true);
  useEffect(() => {
    const reopen = () => { setAnalytics(consent?.analytics === true); setCustomize(true); setOpen(true); };
    window.addEventListener('hkpc-cookie-settings', reopen);
    return () => window.removeEventListener('hkpc-cookie-settings', reopen);
  }, [consent]);
  useEffect(() => {
    const allowed = analyticsAllowed(consent, privacySignal) && analyticsPage(pathname);
    window['ga-disable-G-03629NPBTY'] = !allowed;
    updateConsentMode(allowed);
    if (!allowed) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    if (!document.getElementById('hkpc-google-analytics')) {
      window.gtag('js', new Date());
      window.gtag('config', 'G-03629NPBTY', { send_page_view: false, page_location: location.origin + pathname, page_referrer: '', page_title: 'HKPC', allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 15552000, cookie_update: false });
      const script = document.createElement('script');
      script.id = 'hkpc-google-analytics'; script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-03629NPBTY';
      document.head.appendChild(script);
    }
    window.gtag('event', 'page_view', { page_location: location.origin + pathname, page_referrer: '', page_title: 'HKPC' });
  }, [consent, pathname, privacySignal]);
  useEffect(() => {
    const sync = event => {
      if (event.key !== KEY) return;
      const next = savedConsent();
      window['ga-disable-G-03629NPBTY'] = !analyticsAllowed(next, navigator.globalPrivacyControl === true) || !analyticsPage(location.pathname);
      if (document.getElementById('hkpc-google-analytics') && !next?.analytics) { location.reload(); return; }
      setConsent(next); setOpen(!next);
    };
    window.addEventListener('storage', sync);
    const timer = setInterval(() => {
      if (!consent || Date.now() - consent.savedAt < CONSENT_MAX_AGE) return;
      window['ga-disable-G-03629NPBTY'] = true;
      if (document.getElementById('hkpc-google-analytics')) location.reload();
      else { setConsent(null); setAnalytics(false); setOpen(true); }
    }, 60000);
    return () => { window.removeEventListener('storage', sync); clearInterval(timer); };
  }, [consent]);
  function save(requested) {
    const allowed = requested && !privacySignal;
    updateConsentMode(allowed);
    const next = { version: CONSENT_VERSION, analytics: allowed, savedAt: Date.now() };
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* Keep the choice for this visit. */ }
    if (!allowed) {
      window['ga-disable-G-03629NPBTY'] = true;
      const domains = ['', location.hostname, `.${location.hostname}`, '.hkpc.no'];
      document.cookie.split(';').forEach(item => {
        const name = item.split('=')[0].trim();
        if (/^_ga(?:_|$)|^_gid$|^_gat/.test(name)) domains.forEach(domain => {
          document.cookie = `${name}=; Max-Age=0; path=/;${domain ? ` domain=${domain};` : ''}`;
        });
      });
    }
    if (!allowed && document.getElementById('hkpc-google-analytics')) { location.reload(); return; }
    setConsent(next); setOpen(false); setCustomize(false);
  }
  return <>
    {analyticsAllowed(consent, privacySignal) && analyticsPage(pathname) && <Analytics beforeSend={event => window['ga-disable-G-03629NPBTY'] === false ? cleanAnalyticsEvent(event) : null} />}
    {open && <section aria-label={en ? 'Cookie choices' : 'Informasjonskapsler'} className="fixed inset-x-3 bottom-3 sm:inset-x-6 sm:bottom-6 z-[10000] mx-auto max-w-3xl rounded-2xl border border-purple-200 bg-white p-5 sm:p-6 shadow-2xl text-slate-900 max-h-[85dvh] overflow-y-auto">
      <h2 className="text-xl font-bold text-purple-900">{en ? 'Your privacy, your choice' : 'Ditt personvern, ditt valg'}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{en ? 'We use necessary storage for login, security and your preferences. With your permission, Google Analytics and Vercel Analytics measure visits to public information pages. Optional analytics stays off until you accept.' : 'Vi bruker nødvendig lagring for innlogging, sikkerhet og dine innstillinger. Med ditt samtykke bruker vi Google Analytics og Vercel Analytics for å måle besøk på offentlige informasjonssider. Valgfri besøksanalyse er avslått til du godtar.'} <Link to="/privacy" className="underline text-purple-800">{en ? 'Read our privacy policy' : 'Les personvernerklæringen'}</Link></p>
      <p className="mt-2 text-xs leading-relaxed text-slate-600">{en ? 'Requested features include Firebase sign-in, school application drafts, Bible/course notes, progress, language and portal preferences. Payment providers load when you use payment functions.' : 'Funksjoner du ber om omfatter Firebase-innlogging, søknadsutkast, bibel-/kursnotater, progresjon, språk og portalvalg. Betalingsleverandører lastes når du bruker betalingsfunksjonene.'}</p>
      {privacySignal && <p className="mt-3 rounded-xl bg-purple-50 p-3 text-sm">{en ? 'Your browser sends Global Privacy Control (GPC). We respect this by keeping optional analytics disabled, even if you select Accept all.' : 'Nettleseren sender Global Privacy Control (GPC). Vi respekterer signalet ved å holde valgfri analyse avslått, også om du velger Godta alle.'}</p>}
      {customize && <div className="my-4 space-y-3 rounded-xl bg-purple-50 p-4 text-sm">
        <div className="flex justify-between gap-4"><span>{en ? 'Login, security and requested preferences' : 'Innlogging, sikkerhet og valgte innstillinger'}</span><span>{en ? 'Always active' : 'Alltid aktiv'}</span></div>
        <label className="flex items-center justify-between gap-4 cursor-pointer"><span>{en ? 'Visitor analytics' : 'Besøksanalyse'}</span><input type="checkbox" disabled={privacySignal} checked={analytics && !privacySignal} onChange={event => setAnalytics(event.target.checked)} className="w-5 h-5 accent-purple-800" /></label>
      </div>}
      <p className="mt-2 text-xs text-slate-600">{en ? 'His Kingdom Ministry is responsible for this website. Your choice is stored on this device for 180 days. Declining does not prevent you from using the website. You can withdraw consent using Cookie settings.' : 'His Kingdom Ministry er ansvarlig for nettsiden. Valget lagres på denne enheten i 180 dager. Du kan bruke nettsiden selv om du avslår, og trekke samtykket tilbake via Informasjonskapsler.'}</p>
      <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-2">
        <button onClick={() => save(false)} className="min-h-11 rounded-xl border border-purple-800 px-5 py-3 font-semibold text-purple-900">{en ? 'Reject optional' : 'Avslå valgfrie'}</button>
        <button onClick={() => save(true)} className="min-h-11 rounded-xl border border-purple-800 px-5 py-3 font-semibold text-purple-900">{en ? 'Accept all' : 'Godta alle'}</button>
        {customize ? <button onClick={() => save(analytics)} className="min-h-11 rounded-xl bg-purple-800 px-5 py-3 font-semibold text-white">{en ? 'Save choices' : 'Lagre valg'}</button> : <button onClick={() => setCustomize(true)} className="min-h-11 rounded-xl px-5 py-3 underline text-purple-900">{en ? 'Customize' : 'Tilpass'}</button>}
      </div>
    </section>}
  </>;
}
