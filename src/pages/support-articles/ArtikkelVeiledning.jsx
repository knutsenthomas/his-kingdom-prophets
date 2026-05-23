import React from 'react';
import { useNavigate } from 'react-router-dom';
import SupportArticleLayout from '@/pages/support-articles/SupportArticleLayout';

export default function ArtikkelVeiledning() {
  const navigate = useNavigate();

  const handleOpenChat = () => {
    const event = new CustomEvent('hkm-open-chat');
    window.dispatchEvent(event);
  };

  return (
    <SupportArticleLayout
      title="Hvordan bestille digital veiledningstid"
      breadcrumbs={[
        { label: 'Hjem', to: '/student/dashboard' },
        { label: 'Hjelpesenter', to: '/student/support' },
        { label: 'Digital Veiledning', active: true }
      ]}
      relatedArticles={[
        { title: 'Slik logger du på for første gang', href: '/support/artikkel-logginn', meta: 'Lest av 1.2k brukere' },
        { title: 'Navigering i Bønnefellesskapet', href: '/support/artikkel-chat', meta: 'Lest av 840 brukere' },
        { title: 'Feilsøking ved Zoom- og videostrømmer', href: '/support/artikkel-zoom', meta: 'Lest av 650 brukere' }
      ]}
      cta={
        <section className="bg-secondary-container p-6 rounded-lg mt-12 text-left">
          <h3 className="font-headline-sm text-headline-sm text-on-secondary-container mb-4">Trenger du mer hjelp?</h3>
          <p className="text-body-md text-on-secondary-container/80 mb-6">Vår supportavdeling er tilgjengelig mandag til fredag 08:00 - 16:00.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleOpenChat}
              className="flex-1 bg-primary text-white font-label-md py-3 rounded-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 font-bold"
            >
              <span className="material-symbols-outlined">chat</span>
              Start en chat
            </button>
            <button 
              onClick={() => navigate('/student/support')}
              className="flex-1 border border-primary text-primary font-label-md py-3 rounded-lg hover:bg-primary/5 transition-all flex items-center justify-center gap-2 font-bold"
            >
              <span className="material-symbols-outlined">mail</span>
              Kontakt support
            </button>
          </div>
        </section>
      }
    >
      <p>Som student ved Scholastic Premium har du tilgang til personlig oppfølging fra dine faglærere gjennom vårt digitale veiledningssystem. Denne guiden forklarer steg-for-steg hvordan du finner ledige tider, bestiller en konsultasjon og kobler deg til videosamtalen.</p>
      <h2 className="font-headline-md text-headline-md text-primary mt-12 mb-6">1. Finn din faglærer</h2>
      <p>Naviger til "Courses" i venstremenyen og velg emnet du trenger veiledning i. Inne på emnesiden vil du se en modul merket <strong>"Veiledning og kontortid"</strong> i høyre marg. Her vil alle tilknyttede faglærere og assistenter være listet med sine tilgjengelige tidsluker.</p>
      <div className="my-10 bg-surface-container p-6 rounded-lg border border-outline-variant flex items-start gap-6">
        <img alt="Interface preview" className="w-48 h-32 object-cover rounded shadow-md" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA52sx4KR7vd29PnAqLa9yXQQIJdYaAnC-KPvhyydECVfgML9XhpKaDrJQPXR6eyKBGOSg3JuPlCtjWM5d_kyGyt-NE4Wi3Axl27ujSDfGjOjcu92aUtrv9NMmc2Fkbhp1yDWYJAGR0CTWMQV7hvMCaeSkv5BSLPslaU1PhRfAewX3zpzDXeCNayiz7xGhJZk4KuIUWHWuns-dCW4kedw8SNPCoF60zvffFfOd6ScxoaQWNmKh3Sj5et7U2SU9fDhyauugGSwXAQvM" />
        <div>
          <h4 className="font-headline-sm text-headline-sm text-primary mb-2">Tips fra support</h4>
          <p className="font-body-md text-body-md text-on-surface-variant m-0">Du kan filtrere veiledere basert på fagområde eller spesifikke moduler hvis emnet er stort.</p>
        </div>
      </div>
      <h2 className="font-headline-md text-headline-md text-primary mt-12 mb-6">2. Velg tidspunkt</h2>
      <p>Når du klikker på "Bestill tid", åpnes en kalendervisning. De blå markerte områdene representerer ledig kontortid. Klikk på en ledig blokk for å se detaljer.</p>
      <ul className="list-disc pl-6 mb-6 space-y-2 text-body-md">
        <li><strong>Standard veiledning:</strong> 15 eller 30 minutter.</li>
        <li><strong>Temabasert veiledning:</strong> Noen lærere setter opp egne tider for spesifikke innleveringer.</li>
      </ul>
      <h2 className="font-headline-md text-headline-md text-primary mt-12 mb-6">3. Bekreftelse og forberedelse</h2>
      <p>Etter valgt tid vil du bli bedt om å skrive en kort beskrivelse (maks 200 ord) om hva du ønsker hjelp med. Dette er <strong>obligatorisk</strong> for at læreren skal kunne forberede seg best mulig til samtalen.</p>
      <div className="bg-primary text-white p-8 rounded-lg my-12 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="font-headline-sm text-headline-sm mb-4">Sjekkliste før samtalen</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-inverse-primary">check_circle</span>
              <span className="font-label-md">Test mikrofon og kamera</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-inverse-primary">check_circle</span>
              <span className="font-label-md">Ha oppgavebeskrivelsen klar</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-inverse-primary">check_circle</span>
              <span className="font-label-md">Last opp relevante utkast</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-inverse-primary">check_circle</span>
              <span className="font-label-md">Sitt på et rolig sted</span>
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10">
          <span className="material-symbols-outlined text-[160px]">video_chat</span>
        </div>
      </div>
      <h2 className="font-headline-md text-headline-md text-primary mt-12 mb-6">4. Hvordan koble seg til</h2>
      <p>5 minutter før avtalt tid vil en grønn knapp merket <strong>"Bli med i møte"</strong> dukke opp på startsiden din i Scholastic Premium. Du vil også motta en lenke på e-post.</p>
    </SupportArticleLayout>
  );
}
