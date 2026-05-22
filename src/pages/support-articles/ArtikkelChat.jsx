import React from 'react';
import SupportArticleLayout from '@/pages/support-articles/SupportArticleLayout';

export default function ArtikkelChat() {
  return (
    <SupportArticleLayout
      title="Navigering i Bønnefellesskapet og chatten"
      breadcrumbs={[
        { label: 'Hjem', href: '#' },
        { label: 'Hjelpesenter', href: '#' },
        { label: 'Studentportal', active: true }
      ]}
      relatedArticles={[
        { title: 'Slik logger du på for første gang', href: '/support/artikkel-logginn', meta: 'Lest av 1.2k brukere' },
        { title: 'Bruk av Bibelkalkulatoren for karakterer', href: '/support/artikkel-bibelkalkulator', meta: 'Lest av 920 brukere' },
        { title: 'Feilsøking ved Zoom- og videostrømmer', href: '/support/artikkel-zoom', meta: 'Lest av 650 brukere' }
      ]}
      cta={
        <div className="mt-20 p-10 bg-surface-container rounded-xl border border-outline-variant text-center">
          <h4 className="font-headline-md text-headline-md text-primary mb-4">Trenger du mer hjelp?</h4>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8 max-w-md mx-auto">Kontakt vårt support-team for spørsmål om chat og fellesskap.</p>
          <button className="bg-primary text-on-primary px-8 py-3 rounded-full font-label-md text-label-md font-bold hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-95 flex items-center gap-2 mx-auto">
            <span className="material-symbols-outlined">support_agent</span>
            Kontakt support
          </button>
        </div>
      }
    >
      <div className="font-serif-editor text-body-lg text-on-surface-variant leading-relaxed mb-10">
        <p>Hvordan bruke det integrerte samtalerommet til å dele åpenbaringer, bønnebegjær og chatte med andre.</p>
      </div>
      <div className="space-y-12">
        <section className="flex gap-6 group">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-sm text-headline-sm">1</div>
          <div>
            <h3 className="font-headline-md text-headline-md text-primary mb-3">Åpne chatten</h3>
            <div className="font-body-md text-body-md text-on-surface-variant article-content">
              <p>Åpne chatten fra hovedmenyen. Her finner du alle tilgjengelige samtalerom og fellesskap.</p>
            </div>
          </div>
        </section>
        <section className="flex gap-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-sm text-headline-sm">2</div>
          <div>
            <h3 className="font-headline-md text-headline-md text-primary mb-3">Velg samtalerom</h3>
            <div className="font-body-md text-body-md text-on-surface-variant article-content">
              <p>Velg ønsket samtalerom eller fellesskap for å delta i diskusjoner, dele bønneemner eller åpenbaringer.</p>
            </div>
          </div>
        </section>
        <section className="flex gap-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-sm text-headline-sm">3</div>
          <div>
            <h3 className="font-headline-md text-headline-md text-primary mb-3">Del og diskuter</h3>
            <div className="font-body-md text-body-md text-on-surface-variant article-content">
              <p>Del meldinger, bønneemner eller åpenbaringer med gruppen. Bruk <b>@</b>-funksjonen for å nevne andre brukere.</p>
            </div>
          </div>
        </section>
      </div>
    </SupportArticleLayout>
  );
}
