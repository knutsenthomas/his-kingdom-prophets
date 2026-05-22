import React from 'react';
import SupportArticleLayout from '@/pages/support-articles/SupportArticleLayout';

export default function ArtikkelLoggInn() {
  return (
    <SupportArticleLayout
      title="Hvordan komme i gang med ditt første kurs"
      breadcrumbs={[
        { label: 'Hjem', href: '#' },
        { label: 'Hjelpesenter', href: '#' },
        { label: 'Kom i gang', active: true }
      ]}
      featuredImage={{
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfi37COOVJyHfWnUfOYGUTAgE_OdOJPU0vOmWNBq9gJMHDnBmnwaWG_9C6PabihYmjJosxunOrVZj5GDGVxnv7soPIkMbFANAX3txPMpNWP8a71yiMF1srFswgLaw_gcRbuleRH2h5Y1UW_DrME5E2NaQ3XLl_9hWOio2D7xvzElvUVuJ859exvgdEVDs6eqk4QOjv3fKe_zRTqlWV59uVNJgyvSXbW9ZM6-wsGehXCHa68SEyZWRAOHDRtvlzIW3euxn1s8rUeuA',
        alt: 'A clean, minimalist university library setting with soft natural light streaming through large windows. A single laptop sits on a polished oak desk, displaying a modern educational dashboard. The atmosphere is quiet, studious, and premium, utilizing a palette of deep blues and ivory whites to convey academic excellence and focus.'
      }}
      relatedArticles={[
        { title: 'Slik endrer du kontoinnstillinger', href: '#', meta: 'Lest av 1.2k brukere' },
        { title: 'Nedlasting av sertifikater', href: '#', meta: 'Lest av 800 brukere' },
        { title: 'Bruk av diskusjonsforumet', href: '#', meta: 'Lest av 2.5k brukere' }
      ]}
      cta={
        <div className="mt-20 p-10 bg-surface-container rounded-xl border border-outline-variant text-center">
          <h4 className="font-headline-md text-headline-md text-primary mb-4">Fant du ikke det du lette etter?</h4>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8 max-w-md mx-auto">Vårt support-team er tilgjengelig 24/7 for å hjelpe deg med tekniske spørsmål eller veiledning.</p>
          <button className="bg-primary text-on-primary px-8 py-3 rounded-full font-label-md text-label-md font-bold hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-95 flex items-center gap-2 mx-auto">
            <span className="material-symbols-outlined">support_agent</span>
            Kontakt support
          </button>
        </div>
      }
      feedback={
        <div className="fixed bottom-8 right-8 flex flex-col items-end gap-4 z-40">
          <div className="hidden bg-white p-4 rounded-xl shadow-xl border border-outline-variant w-64" id="feedback-bubble">
            <p className="font-label-md text-label-md text-primary mb-2">Var denne artikkelen nyttig?</p>
            <div className="flex gap-2">
              <button className="flex-1 py-1 bg-surface-container rounded hover:bg-green-100 transition-colors">Ja</button>
              <button className="flex-1 py-1 bg-surface-container rounded hover:bg-red-100 transition-colors">Nei</button>
            </div>
          </div>
          <button className="w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all" onClick={() => {
            const el = document.getElementById('feedback-bubble');
            if (el) el.classList.toggle('hidden');
          }}>
            <span className="material-symbols-outlined">thumb_up</span>
          </button>
        </div>
      }
    >
      <div className="font-serif-editor text-body-lg text-on-surface-variant leading-relaxed mb-10">
        <p>Velkommen til Scholastic Premium! Vi er glade for at du har valgt å starte din læringsreise hos oss. Denne guiden vil ta deg gjennom de grunnleggende stegene for å finne, melde deg på og starte din første leksjon i plattformen vår.</p>
      </div>
      <div className="space-y-12">
        <section className="flex gap-6 group">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-sm text-headline-sm">1</div>
          <div>
            <h3 className="font-headline-md text-headline-md text-primary mb-3">Logg inn på din konto</h3>
            <div className="font-body-md text-body-md text-on-surface-variant article-content">
              <p>Start med å navigere til vår innloggingsside. Bruk e-postadressen og passordet som ble opprettet under registreringen. Hvis du har glemt passordet ditt, kan du bruke "Glemt passord"-lenken for å tilbakestille det via e-post.</p>
            </div>
          </div>
        </section>
        <section className="flex gap-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-sm text-headline-sm">2</div>
          <div>
            <h3 className="font-headline-md text-headline-md text-primary mb-3">Velg ditt kurs</h3>
            <div className="font-body-md text-body-md text-on-surface-variant article-content">
              <p>Gå til <strong>Biblioteket</strong> via navigasjonsmenyen til venstre. Her kan du utforske vårt brede utvalg av kurs. Bruk søkefeltet eller filtrer etter kategori for å finne emnet som interesserer deg mest. Klikk på et kurskort for å se detaljer, pensum og læringsmål.</p>
            </div>
          </div>
        </section>
        <section className="flex gap-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-sm text-headline-sm">3</div>
          <div>
            <h3 className="font-headline-md text-headline-md text-primary mb-3">Start din første leksjon</h3>
            <div className="font-body-md text-body-md text-on-surface-variant article-content">
              <p>Når du har valgt et kurs, klikker du på knappen <strong>"Start kurs"</strong>. Du vil da bli ført til kursbyggeren hvor den første modulen automatisk åpnes. Klikk på den første videoen eller tekstmodulen for å begynne. Lykke til med studiene!</p>
            </div>
          </div>
        </section>
      </div>
    </SupportArticleLayout>
  );
}
