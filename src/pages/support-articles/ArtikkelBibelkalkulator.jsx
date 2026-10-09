import SiteText from '@/components/SiteText';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import SupportArticleLayout from '@/pages/support-articles/SupportArticleLayout';

export default function ArtikkelBibelkalkulator() {
  const navigate = useNavigate();

  const handleOpenChat = () => {
    const event = new CustomEvent('hkm-open-chat');
    window.dispatchEvent(event);
  };

  return (
    <SupportArticleLayout
      title="Bruk av Bibelkalkulatoren for karakterer"
      breadcrumbs={[
        { label: 'Hjem', to: '/student/dashboard' },
        { label: 'Hjelpesenter', to: '/student/support' },
        { label: 'Karakterberegning', active: true }
      ]}
      relatedArticles={[
        { title: 'Slik logger du på for første gang', href: '/support/artikkel-logginn', meta: 'Lest av 1.2k brukere' },
        { title: 'Navigering i Bønnefellesskapet', href: '/support/artikkel-chat', meta: 'Lest av 840 brukere' },
        { title: 'Feilsøking ved Zoom- og videostrømmer', href: '/support/artikkel-zoom', meta: 'Lest av 650 brukere' }
      ]}
      cta={
        <section className="mt-10 bg-primary p-8 rounded-lg text-on-primary flex items-center justify-between shadow-lg">
          <div className="max-w-md text-left">
            <h4 className="font-headline-sm text-headline-sm mb-2"><SiteText fallback={"Trenger du ytterligere assistanse?"} /></h4>
            <p className="text-body-sm opacity-90"><SiteText fallback={"Våre eksperter på akademisk administrasjon er tilgjengelige for å hjelpe deg med oppsettet av ditt vurderingssystem."} /></p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/student/support')}
              className="bg-on-primary text-primary px-6 py-3 rounded font-bold hover:bg-opacity-90 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined"><SiteText fallback={"mail"} /></span><SiteText fallback={" Kontakt Support"} /></button>
            <button 
              onClick={handleOpenChat}
              className="border border-on-primary px-6 py-3 rounded font-bold hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined"><SiteText fallback={"forum"} /></span><SiteText fallback={" Live Chat"} /></button>
          </div>
        </section>
      }
    >
      <p><SiteText fallback={"Bibelkalkulatoren er Scholastic Premiums avanserte verktøy for å sikre rettferdig og konsistent vurdering på tvers av komplekse kursmoduler. Dette systemet er designet for å håndtere både numeriske verdier og de tradisjonelle kvalitative vurderingskriteriene som kreves i akademiske miljøer."} /></p>
      <h3 className="font-headline-md text-headline-md text-primary mt-8"><SiteText fallback={"Forståelse av Vektet Karaktersystem"} /></h3>
      <p><SiteText fallback={"I Scholastic Premium er ikke alle oppgaver likeverdige. Systemet lar administratorer tildele en spesifikk prosentvis vekt til hver modul eller enkeltoppgave. For eksempel kan en avsluttende semesteroppgave telle 40%, mens ukentlige refleksjonsoppgaver utgjør de resterende 60%."} /></p>
      <div className="my-8 p-6 bg-surface-container-low rounded-lg border border-outline-variant">
        <div className="flex items-center justify-between mb-4">
          <span className="font-headline-sm text-primary"><SiteText fallback={"Eksempel på Vektingsmatrise"} /></span>
          <span className="text-label-md text-outline uppercase"><SiteText fallback={"Modul 402: Teologisk Analyse"} /></span>
        </div>
        <div className="space-y-4">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div className="text-label-md"><SiteText fallback={"Obligatorisk innlevering 1"} /></div>
              <div className="text-label-md font-bold">20%</div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-surface-variant">
              <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary" style={{ width: '20%' }}></div>
            </div>
          </div>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div className="text-label-md"><SiteText fallback={"Midtveiseksamen"} /></div>
              <div className="text-label-md font-bold">30%</div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-surface-variant">
              <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary" style={{ width: '30%' }}></div>
            </div>
          </div>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div className="text-label-md"><SiteText fallback={"Semesteroppgave"} /></div>
              <div className="text-label-md font-bold">50%</div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-surface-variant">
              <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary" style={{ width: '50%' }}></div>
            </div>
          </div>
        </div>
      </div>
      <h3 className="font-headline-md text-headline-md text-primary mt-8"><SiteText fallback={"Oppgaveevaluering og Algoritmen"} /></h3>
      <p><SiteText fallback={"Selve \"kalkulatoren\" benytter en algoritme som tar høyde for standardavvik og normalfordeling innenfor hver studentgruppe. Dette sikrer at karakterene ikke bare reflekterer råpoeng, men også studentens relative prestasjon i forhold til læringsmålene definert i emnebeskrivelsen."} /></p>
      <blockquote className="border-l-4 border-primary pl-6 py-4 my-8 italic bg-surface-bright text-on-surface-variant"><SiteText fallback={"\"Vårt mål med Bibelkalkulatoren er å eliminere subjektivitet i karaktersettingen, slik at akademisk integritet opprettholdes på høyeste nivå.\""} /><footer className="mt-2 font-label-md non-italic"><SiteText fallback={"— Dr. Arvid Holte, Dekan for Digitale Studier"} /></footer>
      </blockquote>
      <h3 className="font-headline-md text-headline-md text-primary mt-8"><SiteText fallback={"Slik aktiverer du kalkulatoren"} /></h3>
      <ol className="list-decimal pl-6 space-y-4">
        <li><SiteText fallback={"Naviger til "} /><strong><SiteText fallback={"Kursinnstillinger"} /></strong><SiteText fallback={" fra sidepanelet."} /></li>
        <li><SiteText fallback={"Velg fanen "} /><strong><SiteText fallback={"Vurderingsskjema"} /></strong>.</li>
        <li><SiteText fallback={"Aktiver bryteren for "} /><strong><SiteText fallback={"Automatisert Vektingskalkulator"} /></strong>.</li>
        <li><SiteText fallback={"Definer terskelverdiene for hver karaktergrad (A-F)."} /></li>
      </ol>
    </SupportArticleLayout>
  );
}
