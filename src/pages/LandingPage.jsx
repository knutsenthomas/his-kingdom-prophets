import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import worshipHero from '@/assets/worship_hero.png';
import logo from '@/assets/logo.png';
import CmsText from '@/components/CmsText';
import { Sparkles, BookOpen, UserCheck, Globe, ArrowRight, Check } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, cmsContent } = useApp();

  return (
    <div className="bg-background text-on-background font-sans min-h-screen">
      {/* TopNavBar */}
      <header className="sticky top-0 z-40 w-full glass-nav border-b border-outline-variant">
        <div className="flex justify-between items-center w-full px-3 sm:px-6 md:px-12 h-20 max-w-[1440px] mx-auto">
          <div className="font-serif text-sm min-[360px]:text-base sm:text-2xl text-primary font-bold cursor-pointer shrink-0 flex items-center gap-2" onClick={() => navigate('/')}>
            <img 
              src={logo} 
              alt="His Kingdom Prophets Logo" 
              className="w-8 h-8 object-contain shrink-0" 
            />
            <CmsText slug="layout-logo-title" fallback="His Kingdom Prophets" />
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
                <CmsText slug="landing-hero-tagline" fallback="Profetisk Tjeneste og Åndelig Dybde" />
              </span>
              <CmsText 
                slug="landing-hero-title" 
                fallback="His Kingdom prophets" 
                as="h1" 
                className="font-serif text-3xl md:text-5xl lg:text-6xl text-white mb-8 leading-tight font-bold" 
              />
              <CmsText 
                slug="landing-hero-description" 
                fallback="En åpenbaringsskole for profetisk utrustning, bibelundervisning og åndelig vekst, hvor solid bibelsk teologi møter den levende Ånd." 
                as="p" 
                className="text-base md:text-lg text-on-primary-container mb-10 max-w-xl" 
              />
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/login')} 
                  className="px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-primary-fixed transition-all shadow-lg hover:-translate-y-0.5 text-sm active:scale-[0.98]"
                >
                  <CmsText slug="landing-hero-cta-primary" fallback="Begynn Din Reise" />
                </button>
                <button 
                  onClick={() => navigate('/student/video')} 
                  className="px-8 py-4 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all group flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
                >
                  <CmsText slug="landing-hero-cta-secondary" fallback="Se Introduksjon" />
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Pillars Section (Redesigned Cohesive Symmetrical Grid & Banner) */}
        <section id="programs" className="py-16 md:py-24 px-4 sm:px-6 md:px-12 max-w-[1440px] mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <CmsText 
              slug="landing-pillars-title" 
              fallback="Tre Søyler for Tjenesteutrustning" 
              as="h2" 
              className="font-serif text-3xl md:text-4xl text-primary font-bold mb-4" 
            />
            <CmsText 
              slug="landing-pillars-desc" 
              fallback="Vårt fundament forener grundig bibelsk lære med den profetiske gaverollen i Guds rike." 
              as="p" 
              className="text-base md:text-lg text-on-surface-variant" 
            />
          </div>
          
          {/* Exactly 3 Symmetrical, Balanced Pillars */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(27,73,101,0.04)] p-8 sm:p-10 flex flex-col justify-between relative group hover:border-[#1B4965]/20 hover:shadow-[0_12px_32px_rgba(27,73,101,0.06)] transition-all duration-300 ease-out min-h-[360px]">
              <span className="absolute top-6 right-8 font-serif text-5xl font-extrabold text-[#1B4965]/5 select-none pointer-events-none group-hover:text-[#1B4965]/10 transition-colors duration-300">01</span>
              <div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1B4965]/10 to-[#1B4965]/5 flex items-center justify-center text-[#1B4965] mb-6 group-hover:scale-105 transition-transform duration-300">
                  <Sparkles size={22} />
                </div>
                <CmsText 
                  slug="landing-pillar1-title" 
                  fallback="Profetisk Utrustning og Tjeneste" 
                  as="h3" 
                  className="font-serif text-xl text-primary font-bold mb-3" 
                />
                <CmsText 
                  slug="landing-pillar1-desc" 
                  fallback="Lær å høre Guds stemme, tyde syner og drømmer, og formidle åpenbaringskunnskap med sunne bibelske rammer." 
                  as="p" 
                  className="text-sm text-on-surface-variant leading-relaxed mb-6" 
                />
              </div>
              <ul className="space-y-2.5 border-t border-slate-100/55 pt-6 text-xs text-on-surface-variant font-medium font-sans">
                <li className="flex items-center gap-2">
                  <span className="p-0.5 bg-green-50 text-green-600 rounded-full shrink-0"><Check size={12} /></span>
                  <span>Åndelig skjelneevne og etikk</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="p-0.5 bg-green-50 text-green-600 rounded-full shrink-0"><Check size={12} /></span>
                  <span>Drømmetydning & Åpenbaring</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="p-0.5 bg-green-50 text-green-600 rounded-full shrink-0"><Check size={12} /></span>
                  <span>Etisk karakter og modenhet</span>
                </li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(27,73,101,0.04)] p-8 sm:p-10 flex flex-col justify-between relative group hover:border-[#1B4965]/20 hover:shadow-[0_12px_32px_rgba(27,73,101,0.06)] transition-all duration-300 ease-out min-h-[360px]">
              <span className="absolute top-6 right-8 font-serif text-5xl font-extrabold text-[#1B4965]/5 select-none pointer-events-none group-hover:text-[#1B4965]/10 transition-colors duration-300">02</span>
              <div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1B4965]/10 to-[#1B4965]/5 flex items-center justify-center text-[#1B4965] mb-6 group-hover:scale-105 transition-transform duration-300">
                  <BookOpen size={22} />
                </div>
                <CmsText 
                  slug="landing-pillar2-title" 
                  fallback="Dyp Bibelundervisning" 
                  as="h3" 
                  className="font-serif text-xl text-primary font-bold mb-3" 
                />
                <CmsText 
                  slug="landing-pillar2-desc" 
                  fallback="Gå i dybden på paktsteologi, eskatologi og hermeneutiske verktøy som ruster deg til å dele sannhetens ord rett." 
                  as="p" 
                  className="text-sm text-on-surface-variant leading-relaxed mb-6" 
                />
              </div>
              <ul className="space-y-2.5 border-t border-slate-100/55 pt-6 text-xs text-on-surface-variant font-medium font-sans">
                <li className="flex items-center gap-2">
                  <span className="p-0.5 bg-green-50 text-green-600 rounded-full shrink-0"><Check size={12} /></span>
                  <span>Historisk-grammatisk hermeneutikk</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="p-0.5 bg-green-50 text-green-600 rounded-full shrink-0"><Check size={12} /></span>
                  <span>Paktsteologi & Eskatologi</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="p-0.5 bg-green-50 text-green-600 rounded-full shrink-0"><Check size={12} /></span>
                  <span>Sunn eksegese og Skriftlære</span>
                </li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(27,73,101,0.04)] p-8 sm:p-10 flex flex-col justify-between relative group hover:border-[#1B4965]/20 hover:shadow-[0_12px_32px_rgba(27,73,101,0.06)] transition-all duration-300 ease-out min-h-[360px]">
              <span className="absolute top-6 right-8 font-serif text-5xl font-extrabold text-[#1B4965]/5 select-none pointer-events-none group-hover:text-[#1B4965]/10 transition-colors duration-300">03</span>
              <div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1B4965]/10 to-[#1B4965]/5 flex items-center justify-center text-[#1B4965] mb-6 group-hover:scale-105 transition-transform duration-300">
                  <UserCheck size={22} />
                </div>
                <CmsText 
                  slug="landing-pillar3-title" 
                  fallback="Personlig Åndelig Veiledning" 
                  as="h3" 
                  className="font-serif text-xl text-primary font-bold mb-3" 
                />
                <CmsText 
                  slug="landing-pillar3-desc" 
                  fallback="Personlig oppfølging og disippelskap for din tjeneste. Vi hjelper deg å vokse i karakter og finne ditt spesifikke kall." 
                  as="p" 
                  className="text-sm text-on-surface-variant leading-relaxed mb-6" 
                />
              </div>
              <ul className="space-y-2.5 border-t border-slate-100/55 pt-6 text-xs text-on-surface-variant font-medium font-sans">
                <li className="flex items-center gap-2">
                  <span className="p-0.5 bg-green-50 text-green-600 rounded-full shrink-0"><Check size={12} /></span>
                  <span>1-til-1 oppfølging & mentorsamtaler</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="p-0.5 bg-green-50 text-green-600 rounded-full shrink-0"><Check size={12} /></span>
                  <span>Personlig disippelskapsprogram</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="p-0.5 bg-green-50 text-green-600 rounded-full shrink-0"><Check size={12} /></span>
                  <span>Karakterutvikling & Åndelig vekst</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Symmetrical full-width global network banner below */}
          <div className="mt-12 bg-gradient-to-r from-[#1B4965]/5 to-transparent border border-[#1B4965]/10 rounded-2xl p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-[#1B4965]/20 transition-all duration-300 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-4 sm:gap-6 relative z-10">
              <div className="w-14 h-14 rounded-full bg-white text-[#1B4965] shadow-sm flex items-center justify-center border border-slate-100 flex-shrink-0 animate-float">
                <Globe size={26} className="text-[#1B4965]" />
              </div>
              <div className="space-y-1">
                <CmsText slug="landing-network-title" fallback="Globale Profetiske Nettverk" as="h4" className="font-serif text-lg text-[#1B4965] font-bold" />
                <CmsText slug="landing-network-desc" fallback="Koble deg til bønnenettverk, misjonsreiser og tjenester over hele verden for å utvide ditt åndelige perspektiv." as="p" className="text-xs sm:text-sm text-[#46617b] leading-relaxed max-w-2xl" />
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/login')}
              className="relative z-10 shrink-0 px-6 py-3 bg-[#1B4965] hover:bg-[#00324b] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.98] flex items-center gap-2 group-hover:translate-x-0.5"
            >
              <span>Bli en Del</span>
              <ArrowRight size={14} />
            </button>
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
