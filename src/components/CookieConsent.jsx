import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { useApp } from '@/contexts/AppContext';

const KEY = 'hkpc-cookie-consent-v1';
const MAX_AGE = 180 * 24 * 60 * 60 * 1000;
function savedConsent() {
  try { const value = JSON.parse(localStorage.getItem(KEY)); return value?.version === 1 && Date.now() - value.savedAt < MAX_AGE ? value : null; } catch { return null; }
}
export default function CookieConsent() {
  const { language } = useApp();
  const en = language !== 'no';
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
    window['ga-disable-G-03629NPBTY'] = consent?.analytics !== true;
    if (!consent?.analytics) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    if (!document.getElementById('hkpc-google-analytics')) {
      window.gtag('js', new Date());
      window.gtag('config', 'G-03629NPBTY');
      const script = document.createElement('script');
      script.id = 'hkpc-google-analytics'; script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-03629NPBTY';
      document.head.appendChild(script);
    }
  }, [consent]);
  function save(allowed) {
    const next = { version: 1, analytics: allowed, savedAt: Date.now() };
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
    setConsent(next); setOpen(false); setCustomize(false);
  }
  return <>
    {consent?.analytics === true && <Analytics beforeSend={event => window['ga-disable-G-03629NPBTY'] === false ? event : null} />}
    {open && <section aria-label={en ? 'Cookie choices' : 'Informasjonskapsler'} className="fixed inset-x-3 bottom-3 sm:inset-x-6 sm:bottom-6 z-[10000] mx-auto max-w-3xl rounded-2xl border border-purple-200 bg-white p-5 sm:p-6 shadow-2xl text-slate-900 max-h-[85dvh] overflow-y-auto">
      <h2 className="text-xl font-bold text-purple-900">{en ? 'Your privacy, your choice' : 'Ditt personvern, ditt valg'}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{en ? 'We use necessary storage for login, security and your preferences. With your permission, Google Analytics and Vercel Analytics help us understand how the website is used. Optional analytics stays off until you accept.' : 'Vi bruker nødvendig lagring for innlogging, sikkerhet og dine innstillinger. Med ditt samtykke bruker vi Google Analytics og Vercel Analytics for å forstå hvordan nettsiden brukes. Valgfri besøksanalyse er avslått til du godtar.'} <Link to="/privacy" className="underline text-purple-800">{en ? 'Read our privacy policy' : 'Les personvernerklæringen'}</Link></p>
      {customize && <div className="my-4 space-y-3 rounded-xl bg-purple-50 p-4 text-sm">
        <div className="flex justify-between gap-4"><span>{en ? 'Necessary storage' : 'Nødvendig lagring'}</span><span>{en ? 'Always active' : 'Alltid aktiv'}</span></div>
        <label className="flex items-center justify-between gap-4 cursor-pointer"><span>{en ? 'Visitor analytics' : 'Besøksanalyse'}</span><input type="checkbox" checked={analytics} onChange={event => setAnalytics(event.target.checked)} className="w-5 h-5 accent-purple-800" /></label>
      </div>}
      <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-2">
        <button onClick={() => save(false)} className="min-h-11 rounded-xl border border-purple-800 px-5 py-3 font-semibold text-purple-900">{en ? 'Reject optional' : 'Avslå valgfrie'}</button>
        <button onClick={() => save(true)} className="min-h-11 rounded-xl border border-purple-800 px-5 py-3 font-semibold text-purple-900">{en ? 'Accept all' : 'Godta alle'}</button>
        {customize ? <button onClick={() => save(analytics)} className="min-h-11 rounded-xl bg-purple-800 px-5 py-3 font-semibold text-white">{en ? 'Save choices' : 'Lagre valg'}</button> : <button onClick={() => setCustomize(true)} className="min-h-11 rounded-xl px-5 py-3 underline text-purple-900">{en ? 'Customize' : 'Tilpass'}</button>}
      </div>
    </section>}
  </>;
}
