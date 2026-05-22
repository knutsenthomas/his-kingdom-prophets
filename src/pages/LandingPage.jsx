import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import worshipHero from '@/assets/worship_hero.png';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useApp();

  return (
    <div className="bg-background text-on-background font-sans min-h-screen">
      {/* TopNavBar */}
      <header className="sticky top-0 z-40 flex justify-between items-center w-full px-3 sm:px-6 md:px-12 h-20 max-w-[1440px] mx-auto glass-nav border-b border-outline-variant">
        <div className="font-serif text-sm min-[360px]:text-base sm:text-2xl text-primary font-bold cursor-pointer shrink-0" onClick={() => navigate('/')}>
          His Kingdom Prophets
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a className="font-semibold text-primary border-b-2 border-primary cursor-pointer transition-colors duration-200" href="#programs">Studielinjer</a>
          <a className="text-on-surface-variant hover:text-primary cursor-pointer transition-colors duration-200" href="#faculty">Mentorer</a>
          <a className="text-on-surface-variant hover:text-primary cursor-pointer transition-colors duration-200" href="#research">Bibelressurser</a>
          <a className="text-on-surface-variant hover:text-primary cursor-pointer transition-colors duration-200" href="#admissions">Søk Opptak</a>
        </nav>
        <div className="flex items-center gap-1 min-[360px]:gap-2 sm:gap-4">
          <button 
            onClick={() => navigate('/login')} 
            className="px-2 sm:px-6 py-2 font-semibold text-on-surface-variant hover:text-primary transition-colors text-[10px] min-[360px]:text-xs sm:text-sm shrink-0"
          >
            Logg inn
          </button>
          <button 
            onClick={() => navigate('/login')} 
            className="px-2.5 sm:px-6 py-2 bg-primary text-on-primary font-semibold rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98] shadow-sm text-[10px] min-[360px]:text-xs sm:text-sm shrink-0"
          >
            Søk Nå
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[75vh] flex items-center overflow-hidden bg-primary text-white">
          <div className="absolute inset-0 z-0">
            <img 
              alt="Prophetic Bible School" 
              className="w-full h-full object-cover opacity-50" 
              src={worshipHero}
            />
            <div className="absolute inset-0 hero-gradient"></div>
          </div>
          <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 py-16 md:py-32">
            <div className="max-w-2xl animate-in fade-in slide-in-from-left-8 duration-700">
              <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary-fixed/20 text-primary-fixed font-semibold text-xs uppercase tracking-wider backdrop-blur-md border border-primary-fixed/30">
                Profetisk Tjeneste og Åndelig Dybde
              </span>
              <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl text-white mb-8 leading-tight font-bold">
                Hans Kongerike Profeter
              </h1>
              <p className="text-base md:text-lg text-on-primary-container mb-10 max-w-xl">
                En åpenbaringsskole for profetisk utrustning, bibelundervisning og åndelig vekst, hvor solid bibelsk teologi møter den levende Ånd.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/login')} 
                  className="px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-primary-fixed transition-all shadow-lg hover:-translate-y-0.5 text-sm active:scale-[0.98]"
                >
                  Begynn Din Reise
                </button>
                <button 
                  onClick={() => navigate('/student/video')} 
                  className="px-8 py-4 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all group flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
                >
                  Se Introduksjon
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Pillars Section (Bento Layout) */}
        <section id="programs" className="py-16 md:py-24 px-4 sm:px-6 md:px-12 max-w-[1440px] mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl text-primary font-bold mb-4">Tre Søyler for Tjenesteutrustning</h2>
            <p className="text-base md:text-lg text-on-surface-variant">
              Vårt fundament forener grundig bibelsk lære med den profetiske gaverollen i Guds rike.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Pillar 1 */}
            <div className="md:col-span-8 group bento-card bg-surface-container-lowest border border-outline-variant p-6 sm:p-8 md:p-12 flex flex-col justify-between overflow-hidden relative rounded-2xl min-h-[320px]">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-primary-fixed rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-3xl">campaign</span>
                </div>
                <h3 className="font-serif text-2xl text-primary font-bold mb-3">Profetisk Utrustning og Tjeneste</h3>
                <p className="text-on-surface-variant max-w-md text-sm md:text-base leading-relaxed">
                  Lær å høre Guds stemme, tyde syner og drømmer, og formidle åpenbaringskunnskap med sunne bibelske rammer og etisk modenhet.
                </p>
              </div>
              <div className="absolute -bottom-6 -right-6 w-1/2 h-1/2 opacity-10 group-hover:opacity-30 transition-all duration-700">
                <span className="material-symbols-outlined text-[150px] text-primary">auto_awesome</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="md:col-span-4 group bento-card bg-primary text-white p-6 sm:p-8 flex flex-col justify-between rounded-2xl min-h-[320px]">
              <div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white mb-6 border border-white/20">
                  <span className="material-symbols-outlined text-2xl">menu_book</span>
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">Dyp Bibelundervisning</h3>
                <p className="text-on-primary-container text-sm leading-relaxed">
                  Gå i dybden på paktsteologi, eskatologi og hermeneutiske verktøy som ruster deg til å dele sannhetens ord rett.
                </p>
              </div>
              <div className="pt-6">
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-fixed-dim w-[85%]"></div>
                </div>
                <p className="mt-3 text-xs font-semibold text-primary-fixed-dim uppercase tracking-wider">85% Kjernefokus Skriftlære</p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="md:col-span-5 group bento-card bg-surface-container border border-outline-variant p-6 sm:p-8 flex flex-col justify-between rounded-2xl min-h-[260px]">
              <div>
                <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-2xl">favorite</span>
                </div>
                <h3 className="font-serif text-xl text-primary font-bold mb-3">Personlig Åndelig Veiledning</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Personlig oppfølging og disippelskap for din tjeneste. Vi hjelper deg å vokse i karakter og finne ditt spesifikke kall.
                </p>
              </div>
            </div>

            {/* Accent Piece */}
            <div className="md:col-span-7 bento-card bg-tertiary-fixed border border-outline-variant p-6 sm:p-8 flex items-center justify-between rounded-2xl overflow-hidden relative min-h-[260px]">
              <div className="flex-1 z-10">
                <h4 className="font-serif text-xl text-primary font-bold mb-2">Globale Profetiske Nettverk</h4>
                <p className="text-on-surface-variant text-sm leading-relaxed max-w-sm">
                  Koble deg til bønnenettverk, misjonsreiser og tjenester over hele verden for å utvide ditt åndelige perspektiv.
                </p>
              </div>
              <div className="flex-shrink-0 z-10 h-24 w-24 rounded-full border-4 border-white/50 bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-primary animate-pulse">language</span>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="faculty" className="py-24 bg-surface-container-low overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12">
            <div className="mb-12 max-w-2xl">
              <h2 className="font-serif text-3xl text-primary font-bold mb-4">Vitnesbyrd & Erfaringer</h2>
              <p className="text-on-surface-variant">Hør hva våre studenter og mentorer sier om det profetiske fellesskapet.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-outline-variant relative">
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    alt="Apostel David Hansen" 
                    className="w-16 h-16 rounded-full object-cover border border-primary-fixed"
                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120"
                  />
                  <div>
                    <h4 className="font-serif text-lg text-primary font-bold">Apostel David Hansen</h4>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Grunnlegger & Hovedmentor</p>
                  </div>
                </div>
                <p className="font-serif italic text-on-surface leading-relaxed text-sm md:text-base">
                  "Det profetiske fellesskapet her er helt unikt. Plattformen gir studentene de nødvendige åndelige og teologiske rammene for å vokse inn i sin tjeneste."
                </p>
              </div>

              <div className="p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-outline-variant relative">
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    alt="Pastor Siri Knutsen" 
                    className="w-16 h-16 rounded-full object-cover border border-primary-fixed"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
                  />
                  <div>
                    <h4 className="font-serif text-lg text-primary font-bold">Pastor Siri Knutsen</h4>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Fagansvarlig for Sjelesorg & Menighet</p>
                  </div>
                </div>
                <p className="font-serif italic text-on-surface leading-relaxed text-sm md:text-base">
                  "Å bygge bro mellom solid bibellære og praktisk betjening i menigheten er kjernen i mitt hjerte. Mentorskapet her gir studentene retning og soliditet."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section id="admissions" className="py-24 bg-background border-t border-outline-variant text-center">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12">
            <div className="inline-flex items-center gap-2 mb-6 text-primary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              <span className="text-xs font-semibold tracking-widest uppercase">Opptak Åpent for Høsten 2026</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-primary font-bold mb-6 max-w-2xl mx-auto">
              Er du klar til å tre inn i din gudgitte tjeneste?
            </h2>
            <p className="text-base text-on-surface-variant mb-10 max-w-xl mx-auto">
              Bli en del av et levende og solid læringsmiljø dedikert til bibelundervisning og åndelig utrustning.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button 
                onClick={() => navigate('/login')} 
                className="w-full sm:w-auto px-8 py-4 bg-primary text-on-primary font-semibold rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98]"
              >
                Søk Opptak 2026
              </button>
              <button 
                onClick={() => navigate('/student/library')} 
                className="w-full sm:w-auto px-8 py-4 bg-surface-container border border-outline-variant text-primary font-semibold rounded-xl hover:bg-surface-container-high transition-all"
              >
                Se Fagplan
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-4 sm:px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 bg-tertiary text-white">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <div className="font-serif text-lg font-bold text-on-tertiary">His Kingdom Prophets</div>
          <p className="text-xs text-on-tertiary opacity-80 max-w-md">
            © 2026 His Kingdom Prophets. Alle rettigheter reservert. Utrustning av profetiske tjenester for menigheten.
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-6 text-xs text-center">
          <a className="text-on-tertiary-container hover:text-on-tertiary transition-opacity" href="#">Personvern</a>
          <a className="text-on-tertiary-container hover:text-on-tertiary transition-opacity" href="#">Betingelser</a>
          <a className="text-on-tertiary-container hover:text-on-tertiary transition-opacity" href="#">Tilgjengelighet</a>
          <a className="text-on-tertiary-container hover:text-on-tertiary transition-opacity" href="#">Kontakt Support</a>
        </nav>
      </footer>
    </div>
  );
}
