import React from 'react';
import { useNavigate } from 'react-router-dom';
import SupportArticleLayout from '@/pages/support-articles/SupportArticleLayout';

export default function ArtikkelTjenestegaver() {
  const navigate = useNavigate();

  return (
    <SupportArticleLayout
      title="Oversikt over de fem tjenestegavene"
      breadcrumbs={[
        { label: 'Hjem', to: '/student/dashboard' },
        { label: 'Hjelpesenter', to: '/student/support' },
        { label: 'Kurs & Læreplan', active: true }
      ]}
      relatedArticles={[
        { title: 'Hvordan bestille digital veiledningstid', href: '/support/artikkel-veiledning', meta: 'Lest av 1.1k brukere' },
        { title: 'Bruk av Bibelkalkulatoren for karakterer', href: '/support/artikkel-bibelkalkulator', meta: 'Lest av 920 brukere' },
        { title: 'Navigering i Bønnefellesskapet og chatten', href: '/support/artikkel-chat', meta: 'Lest av 840 brukere' }
      ]}
      cta={
        <div className="mt-20 p-10 bg-surface-container rounded-xl border border-outline-variant text-center">
          <h4 className="font-headline-md text-headline-md text-primary mb-4">Vil du lære mer?</h4>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8 max-w-md mx-auto">Les mer om tjenestegavene i studiehåndboken eller spør din mentor.</p>
          <button 
            onClick={() => navigate('/student/support')}
            className="bg-primary text-on-primary px-8 py-3 rounded-full font-label-md text-label-md font-bold hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-95 flex items-center gap-2 mx-auto"
          >
            <span className="material-symbols-outlined">support_agent</span>
            Kontakt support
          </button>
        </div>
      }
    >
      <div className="font-serif-editor text-body-lg text-on-surface-variant leading-relaxed mb-10">
        <p>En teologisk og praktisk guide til hvordan apostoliske, profetiske, evangeliske, pastorale og læregaver ruster kirken.</p>
      </div>
      <div className="space-y-12">
        <section className="flex gap-6 group">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-sm text-headline-sm">1</div>
          <div>
            <h3 className="font-headline-md text-headline-md text-primary mb-3">Apostel</h3>
            <div className="font-body-md text-body-md text-on-surface-variant article-content">
              <p>Grunnlegger og pionér, bringer visjon og struktur.</p>
            </div>
          </div>
        </section>
        <section className="flex gap-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-sm text-headline-sm">2</div>
          <div>
            <h3 className="font-headline-md text-headline-md text-primary mb-3">Profet</h3>
            <div className="font-body-md text-body-md text-on-surface-variant article-content">
              <p>Formidler Guds ord og innsikt til menigheten.</p>
            </div>
          </div>
        </section>
        <section className="flex gap-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-sm text-headline-sm">3</div>
          <div>
            <h3 className="font-headline-md text-headline-md text-primary mb-3">Evangelist</h3>
            <div className="font-body-md text-body-md text-on-surface-variant article-content">
              <p>Inspirerer til misjon og trosdeling.</p>
            </div>
          </div>
        </section>
        <section className="flex gap-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-sm text-headline-sm">4</div>
          <div>
            <h3 className="font-headline-md text-headline-md text-primary mb-3">Pastor</h3>
            <div className="font-body-md text-body-md text-on-surface-variant article-content">
              <p>Leder, hyrde og omsorgsperson for fellesskapet.</p>
            </div>
          </div>
        </section>
        <section className="flex gap-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-sm text-headline-sm">5</div>
          <div>
            <h3 className="font-headline-md text-headline-md text-primary mb-3">Lærer</h3>
            <div className="font-body-md text-body-md text-on-surface-variant article-content">
              <p>Formidler og forklarer Guds ord grundig.</p>
            </div>
          </div>
        </section>
      </div>
    </SupportArticleLayout>
  );
}
