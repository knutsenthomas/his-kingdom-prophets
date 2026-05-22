import React from 'react';
import SupportArticleLayout from '@/pages/support-articles/SupportArticleLayout';

export default function ArtikkelBibelkalkulator() {
  return (
    <SupportArticleLayout
      title="Bruk av Bibelkalkulatoren for karakterer"
      breadcrumbs={[
        { label: 'Hjem', href: '#' },
        { label: 'Hjelpesenter', href: '#' },
        { label: 'Kurs & Læreplan', active: true }
      ]}
      relatedArticles={[
        { title: 'Navigering i Bønnefellesskapet og chatten', href: '/support/artikkel-chat', meta: 'Lest av 840 brukere' },
        { title: 'Feilsøking ved Zoom- og videostrømmer', href: '/support/artikkel-zoom', meta: 'Lest av 650 brukere' },
        { title: 'Oversikt over de fem tjenestegavene', href: '/support/artikkel-tjenestegaver', meta: 'Lest av 1.4k brukere' }
      ]}
      cta={
        <div className="mt-20 p-10 bg-surface-container rounded-xl border border-outline-variant text-center">
          <h4 className="font-headline-md text-headline-md text-primary mb-4">Spørsmål om karakterer?</h4>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8 max-w-md mx-auto">Kontakt mentor eller support hvis du lurer på hvordan karakterene beregnes.</p>
          <button className="bg-primary text-on-primary px-8 py-3 rounded-full font-label-md text-label-md font-bold hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-95 flex items-center gap-2 mx-auto">
            <span className="material-symbols-outlined">support_agent</span>
            Kontakt support
          </button>
        </div>
      }
    >
      <div className="font-serif-editor text-body-lg text-on-surface-variant leading-relaxed mb-10">
        <p>Slik fungerer det vektede karaktersystemet og oppgavevurderingen på plattformen.</p>
      </div>
      <div className="space-y-12">
        <section className="flex gap-6 group">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-sm text-headline-sm">1</div>
          <div>
            <h3 className="font-headline-md text-headline-md text-primary mb-3">Gå til Karakterer</h3>
            <div className="font-body-md text-body-md text-on-surface-variant article-content">
              <p>Gå til <strong>Karakterer</strong> i studentportalen for å se dine resultater.</p>
            </div>
          </div>
        </section>
        <section className="flex gap-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-sm text-headline-sm">2</div>
          <div>
            <h3 className="font-headline-md text-headline-md text-primary mb-3">Bruk Bibelkalkulatoren</h3>
            <div className="font-body-md text-body-md text-on-surface-variant article-content">
              <p>Velg Bibelkalkulatoren for å se hvordan karakterene beregnes ut fra vektede oppgaver.</p>
            </div>
          </div>
        </section>
        <section className="flex gap-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-sm text-headline-sm">3</div>
          <div>
            <h3 className="font-headline-md text-headline-md text-primary mb-3">Kontakt mentor ved spørsmål</h3>
            <div className="font-body-md text-body-md text-on-surface-variant article-content">
              <p>Ta kontakt med mentor hvis du har spørsmål om vurdering eller karaktersetting.</p>
            </div>
          </div>
        </section>
      </div>
    </SupportArticleLayout>
  );
}
