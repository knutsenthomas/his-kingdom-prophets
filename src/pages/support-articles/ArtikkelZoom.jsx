import React from 'react';
import SupportArticleLayout from '@/pages/support-articles/SupportArticleLayout';

export default function ArtikkelZoom() {
  return (
    <SupportArticleLayout
      title="Feilsøking ved Zoom- og videostrømmer"
      breadcrumbs={[
        { label: 'Hjem', href: '#' },
        { label: 'Hjelpesenter', href: '#' },
        { label: 'Teknisk støtte', active: true }
      ]}
      relatedArticles={[
        { title: 'Bruk av Bibelkalkulatoren for karakterer', href: '/support/artikkel-bibelkalkulator', meta: 'Lest av 920 brukere' },
        { title: 'Navigering i Bønnefellesskapet og chatten', href: '/support/artikkel-chat', meta: 'Lest av 840 brukere' },
        { title: 'Hvordan bestille digital veiledningstid', href: '/support/artikkel-veiledning', meta: 'Lest av 1.1k brukere' }
      ]}
      cta={
        <div className="mt-20 p-10 bg-surface-container rounded-xl border border-outline-variant text-center">
          <h4 className="font-headline-md text-headline-md text-primary mb-4">Tekniske problemer?</h4>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8 max-w-md mx-auto">Kontakt teknisk support hvis du opplever problemer med Zoom eller video.</p>
          <button className="bg-primary text-on-primary px-8 py-3 rounded-full font-label-md text-label-md font-bold hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-95 flex items-center gap-2 mx-auto">
            <span className="material-symbols-outlined">support_agent</span>
            Kontakt support
          </button>
        </div>
      }
    >
      <div className="font-serif-editor text-body-lg text-on-surface-variant leading-relaxed mb-10">
        <p>Opplever du forsinkelser eller manglende lyd under live-samlingene? Følg disse enkle stegene.</p>
      </div>
      <div className="space-y-12">
        <section className="flex gap-6 group">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-sm text-headline-sm">1</div>
          <div>
            <h3 className="font-headline-md text-headline-md text-primary mb-3">Sjekk internettforbindelsen</h3>
            <div className="font-body-md text-body-md text-on-surface-variant article-content">
              <p>Sørg for at du har stabil internettforbindelse før du starter Zoom-møtet.</p>
            </div>
          </div>
        </section>
        <section className="flex gap-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-sm text-headline-sm">2</div>
          <div>
            <h3 className="font-headline-md text-headline-md text-primary mb-3">Oppdater Zoom</h3>
            <div className="font-body-md text-body-md text-on-surface-variant article-content">
              <p>Oppdater Zoom til siste versjon for å unngå kompatibilitetsproblemer.</p>
            </div>
          </div>
        </section>
        <section className="flex gap-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-sm text-headline-sm">3</div>
          <div>
            <h3 className="font-headline-md text-headline-md text-primary mb-3">Test lyd og bilde</h3>
            <div className="font-body-md text-body-md text-on-surface-variant article-content">
              <p>Test lyd og bilde før samlingen starter. Start datamaskinen på nytt ved problemer.</p>
            </div>
          </div>
        </section>
      </div>
    </SupportArticleLayout>
  );
}
