import React, { useState } from 'react';
import { Smartphone, Tablet, Monitor, ArrowUpRight, PlayCircle, CalendarDays, Users, Copy, Check, Download, Globe } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import SeoHead from '@/components/SeoHead';
import { APP_RELEASES, appLandingLink } from '@/lib/app-releases';
import '@/styles/hkpc-redesign.css';
import '@/styles/apps-page.css';

const icons = { ios: Tablet, android: Smartphone, mac: Monitor };
export default function AppsPage() {
  const { language } = useApp();
  const en = language === 'en';
  const t = (no, english) => en ? english : no;
  const [copied, setCopied] = useState('');
  const [copyError, setCopyError] = useState('');
  async function copyLink(id) {
    try { await navigator.clipboard.writeText(appLandingLink(id, language)); setCopied(id); setCopyError(''); }
    catch { setCopyError(t('Kunne ikke kopiere. Bruk lenken under QR-koden.', 'Could not copy. Use the link below the QR code.')); }
  }
  return <div className="hkpc-landing apps-page">
    <SeoHead title={t('HKPC-apper', 'HKPC apps')} description={t('HKP Community for iPhone, iPad, Android og Mac. Følg undervisningen og hold kontakten med skolen.', 'HKP Community for iPhone, iPad, Android and Mac. Follow your courses and stay connected with the school.')} canonicalPath="/apper" />
    <SiteHeader />
    <main>
      <section className="apps-hero">
        <div className="apps-container apps-hero-layout">
          <div>
            <p className="apps-eyebrow">HKP COMMUNITY</p>
            <h1>{t('Skolehverdagen.\nDer du er.', 'Your school.\nWherever you are.')}</h1>
            <p className="apps-intro">{t('Undervisning, samlinger og fellesskap samlet på mobilen, nettbrettet og Mac-en din.', 'Teaching, gatherings and community together on your phone, tablet and Mac.')}</p>
            <a className="apps-primary" href="#velg-app">{t('Finn appen for deg', 'Find your app')} <ArrowUpRight size={20} /></a>
            <p className="apps-availability">{t('Appene kommer snart. Nettversjonen er tilgjengelig nå.', 'Apps coming soon. The web version is available now.')}</p>
          </div>
          <div className="apps-brand-art" aria-hidden="true"><img src="/hkp-logo.png" alt="" /><span>HKP Community</span><p>iPhone / iPad / Android / Mac</p></div>
        </div>
      </section>
      <section className="apps-container apps-features" aria-label={t('Dette finner du i appen', 'Inside the app')}>
        {[[PlayCircle,t('Undervisning når det passer', 'Teaching on your schedule'),t('Finn kursene dine og se publiserte opptak igjen.', 'Find your courses and revisit published recordings.')],[CalendarDays,t('Neste samling, lett å finne', 'Your next gathering, easy to find'),t('Hold oversikt over undervisning og kommende samlinger.', 'Keep track of teaching sessions and upcoming gatherings.')],[Users,t('Nærmere fellesskapet', 'Stay close to your community'),t('Les beskjeder og delta i samtaler og bønn.', 'Read messages and join conversations and prayer.')]].map(([Icon,title,body])=><div key={title}><Icon aria-hidden="true" size={28}/><h2>{title}</h2><p>{body}</p></div>)}
      </section>
      <section id="velg-app" className="apps-container apps-platforms">
        <div className="apps-section-heading"><p className="apps-eyebrow">{t('VELG DIN ENHET', 'CHOOSE YOUR DEVICE')}</p><h2>{t('Samme fellesskap. Din skjerm.', 'One community. Your screen.')}</h2><p>{t('Vi gjør appene klare til lansering. Her finner du nedlastingslenkene når de er tilgjengelige.', 'We are preparing the apps for launch. Download links will appear here when they are available.')}</p></div>
        <div className="apps-grid">
          {APP_RELEASES.map(app=>{const Icon=icons[app.id];const ready=Boolean(app.downloadUrl);return <article className="apps-card" id={app.id} key={app.id}>
            <div className="apps-card-top"><Icon size={30} aria-hidden="true"/><span className="apps-status">{ready?t('Tilgjengelig','Available'):t('Kommer snart','Coming soon')}</span></div>
            <h3>{app.id === 'ios' ? t('iPhone og iPad', 'iPhone and iPad') : app.name}</h3><p className="apps-card-description">{en?app.description.en:app.description.no}</p>
            {ready?<a className="apps-download" href={app.downloadUrl} target="_blank" rel="noopener noreferrer">{t('Last ned appen','Download the app')}<Download size={18}/></a>:<p className="apps-pending">{t('Ikke offentlig publisert ennå', 'Not publicly released yet')}</p>}
            <div className="apps-qr-block"><img width="176" height="176" src={`/app-qr/${app.id}-${en?'en':'no'}.png`} alt={t(`QR-kode til informasjon om ${app.name}`,`QR code for ${app.id === 'ios' ? 'iPhone and iPad' : app.name} information`)}/><p>{t('Skann for appinformasjon og lanseringsstatus.', 'Scan for app information and launch status.')}</p><a className="apps-short-link" href={appLandingLink(app.id,language)}>hkpc.no/apper#{app.id}</a></div>
            <div className="apps-card-actions"><button type="button" onClick={()=>copyLink(app.id)}>{copied===app.id?<Check size={17}/>:<Copy size={17}/>} {copied===app.id?t('Kopiert','Copied'):t('Kopier lenke','Copy link')}</button><a href={`/app-qr/${app.id}-${en?'en':'no'}.png`} download={`HKP-${app.id}-QR.png`}><Download size={17}/>{t('Lagre QR','Save QR')}</a></div>
          </article>;})}
        </div>
        <p role="status" className="apps-copy-status">{copyError || (copied?t('Lenken er kopiert.','Link copied.'):'')}</p>
      </section>
      <section className="apps-container"><div className="apps-web"><Globe size={38} aria-hidden="true"/><div><h2>{t('Bruk HKP Community i nettleseren', 'Use HKP Community in your browser')}</h2><p>{t('Du kan bruke nettversjonen allerede nå. Logg inn med skolekontoen din.', 'You can use the web version today. Sign in with your school account.')}</p></div><a href="https://app.hkpc.no" className="apps-primary">{t('Åpne nettappen','Open the web app')}<ArrowUpRight size={18}/></a></div></section>
      <section className="apps-container apps-faq"><h2>{t('Før du tar appen i bruk', 'Before you get started')}</h2><details><summary>{t('Trenger jeg en konto?', 'Do I need an account?')}</summary><p>{t('Ja. Bruk kontoen din hos HKP Community. Hvilke kurs og funksjoner du ser, avhenger av tilgangen din.', 'Yes. Use your HKP Community account. The courses and features you see depend on your access.')}</p></details><details><summary>{t('Hva åpner QR-kodene?', 'What do the QR codes open?')}</summary><p>{t('De åpner denne siden ved riktig app. Når appene er lansert, finner du den offisielle nedlastingslenken her. QR-kodene trenger ikke å byttes.', 'They open this page at the relevant app. After launch, you will find the official download link here. The QR codes will stay the same.')}</p></details><details><summary>{t('Kan jeg bruke appen på flere enheter?', 'Can I use the app on multiple devices?')}</summary><p>{t('Bruk samme skolekonto på enhetene dine. Du trenger internett for å logge inn og hente nytt innhold.', 'Use the same school account across your devices. You need an internet connection to sign in and access new content.')}</p></details></section>
    </main><SiteFooter />
  </div>;
}
