import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import worshipHero from '@/assets/worship_hero.png';
import logo from '@/assets/logo.png';
import CmsText from '@/components/CmsText';
import { Sparkles, BookOpen, UserCheck, Globe, ArrowRight, Check, Menu, X } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, cmsContent, language, toggleLanguage } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('programs');

  const navItems = [
    { slug: 'landing-nav-programs', fallback: 'Studielinjer', href: '#programs', id: 'programs' },
    { slug: 'landing-nav-faculty', fallback: 'Mentorer', href: '#faculty', id: 'faculty' },
    { slug: 'landing-nav-resources', fallback: 'Bibelressurser', href: '/bible-resources', id: 'research' },
    { slug: 'landing-nav-admissions', fallback: 'Søk Opptak', href: '#admissions', id: 'admissions' }
  ];

  const handleNavClick = (e, item) => {
    if (item.href.startsWith('/')) {
      navigate(item.href);
      return;
    }
    e.preventDefault();
    setActiveSection(item.id);
    const element = document.getElementById(item.id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const sections = ['programs', 'faculty', 'research', 'admissions'];
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // Fallback when scrolled to top
    const handleScroll = () => {
      if (window.scrollY < 100) {
        setActiveSection('programs');
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="bg-background text-on-background font-sans min-h-screen">
      {/* TopNavBar */}
      <header className="sticky top-0 z-40 w-full glass-nav border-b border-outline-variant">
        <div className="flex justify-between items-center w-full px-3 sm:px-6 md:px-12 h-20 max-w-[1440px] mx-auto">
          <div className="font-serif text-xs min-[360px]:text-sm sm:text-lg md:text-xl lg:text-2xl text-primary font-bold cursor-pointer shrink-0 flex items-center gap-1.5 sm:gap-2.5" onClick={() => navigate('/')}>
            <img 
              src={logo} 
              alt="His Kingdom Prophets Logo" 
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0" 
            />
            <CmsText slug="layout-logo-title" fallback="His Kingdom Prophets" />
          </div>
          
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`font-semibold cursor-pointer pb-1 border-b-2 transition-all duration-200 ${
                    isActive 
                      ? 'text-primary border-primary' 
                      : 'text-on-surface-variant border-transparent hover:text-primary hover:border-primary/40'
                  }`}
                >
                  <CmsText slug={item.slug} fallback={item.fallback} />
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 min-[360px]:gap-2 sm:gap-4">
            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <button 
                onClick={toggleLanguage}
                className="px-3 py-1.5 border border-[#561291]/20 hover:border-primary text-xs font-bold uppercase rounded-lg text-primary bg-[#561291]/5 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm shrink-0"
                title={language === 'no' ? 'Bytt til engelsk (Switch to English)' : 'Bytt til norsk (Switch to Norwegian)'}
              >
                <Globe size={13} />
                <span>{language === 'no' ? 'NO' : 'EN'}</span>
              </button>
              <button 
                onClick={() => navigate('/login')} 
                className="px-6 py-2 font-semibold text-on-surface-variant hover:text-primary transition-colors text-sm shrink-0"
              >
                <CmsText slug="landing-btn-login" fallback="Logg inn" />
              </button>
              <button 
                onClick={() => navigate('/login')} 
                className="px-6 py-2 bg-primary text-on-primary font-semibold rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98] shadow-sm text-sm shrink-0"
              >
                <CmsText slug="landing-btn-apply" fallback="Søk Nå" />
              </button>
            </div>
            
            {/* Mobile/Tablet Actions & Toggle */}
            <div className="lg:hidden flex items-center gap-1.5 sm:gap-3">
              <button 
                onClick={toggleLanguage}
                className="px-2.5 sm:px-3 py-1.5 border border-[#561291]/20 hover:border-primary text-[10px] sm:text-xs font-bold uppercase rounded-lg text-primary bg-[#561291]/5 transition-all active:scale-95 flex items-center gap-1 shadow-sm shrink-0"
                title={language === 'no' ? 'Bytt til engelsk (Switch to English)' : 'Bytt til norsk (Switch to Norwegian)'}
              >
                <Globe size={12} />
                <span>{language === 'no' ? 'NO' : 'EN'}</span>
              </button>
              <button 
                onClick={() => navigate('/login')} 
                className="px-2.5 sm:px-4 py-2 bg-primary text-on-primary font-semibold rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98] shadow-sm text-[10px] min-[360px]:text-xs shrink-0"
              >
                <CmsText slug="landing-btn-apply" fallback="Søk Nå" />
              </button>
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 hover:bg-primary/5 rounded-lg text-primary transition-all shrink-0 active:scale-95"
                aria-label="Åpne meny"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-[#3c096c]/45 backdrop-blur-sm"
            />

            {/* Slide-in Panel */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="absolute top-0 bottom-0 right-0 w-80 bg-white shadow-2xl flex flex-col justify-between p-6 border-l border-surface-container overflow-y-auto"
            >
              <div className="space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-outline-variant/30">
                  <div className="font-serif text-base font-bold text-primary flex items-center gap-2 cursor-pointer" onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }}>
                    <img 
                      src={logo} 
                      alt="His Kingdom Prophets Logo" 
                      className="w-7 h-7 object-contain shrink-0" 
                    />
                    <CmsText slug="layout-logo-title" fallback="His Kingdom Prophets" />
                  </div>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 hover:bg-primary/5 rounded-lg text-primary transition-colors active:scale-95"
                    aria-label="Lukk meny"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col gap-2">
                  {navItems.map(item => {
                    const isActive = activeSection === item.id;
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={(e) => {
                          handleNavClick(e, item);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`px-4 py-3.5 text-sm font-semibold rounded-xl transition-all ${
                          isActive 
                            ? 'text-primary bg-primary/5 font-bold' 
                            : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                        }`}
                      >
                        <CmsText slug={item.slug} fallback={item.fallback} />
                      </a>
                    );
                  })}
                </nav>
              </div>

              {/* Footer Actions inside Drawer */}
              <div className="pt-6 border-t border-surface-container space-y-3.5">
                <button
                  onClick={toggleLanguage}
                  className="w-full py-3 border border-[#561291]/20 text-primary hover:bg-[#561291]/5 font-bold rounded-xl text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 bg-white shadow-sm"
                >
                  <Globe size={14} />
                  <span>{language === 'no' ? 'Bytt til Engelsk (EN)' : 'Switch to Norwegian (NO)'}</span>
                </button>
                <button
                  onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                  className="w-full py-3 border border-outline-variant text-primary hover:bg-primary/5 font-bold rounded-xl text-xs transition-all active:scale-[0.98]"
                >
                  <CmsText slug="landing-btn-login" fallback="Logg inn" />
                </button>
                <button
                  onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                  className="w-full py-3 bg-primary text-white font-bold rounded-xl text-xs transition-all active:scale-[0.98] shadow-md"
                >
                  <CmsText slug="landing-btn-apply" fallback="Søk Nå" />
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

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
            <div className="bg-white rounded-2xl border border-surface-container shadow-[0_4px_20px_-4px_rgba(86,18,145,0.04)] p-8 sm:p-10 flex flex-col justify-between relative group hover:border-[#561291]/20 hover:shadow-[0_12px_32px_rgba(86,18,145,0.07)] transition-all duration-300 ease-out min-h-[360px]">
              <span className="absolute top-6 right-8 font-serif text-5xl font-extrabold text-[#561291]/5 select-none pointer-events-none group-hover:text-[#561291]/10 transition-colors duration-300">01</span>
              <div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#561291]/10 to-[#561291]/5 flex items-center justify-center text-[#561291] mb-6 group-hover:scale-105 transition-transform duration-300">
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
              <ul className="space-y-2.5 border-t border-outline-variant/30 pt-6 text-xs text-on-surface-variant font-medium font-sans">
                <li className="flex items-center gap-2">
                  <span className="p-0.5 bg-green-50 text-green-600 rounded-full shrink-0"><Check size={12} /></span>
                  <CmsText slug="landing-pillar1-bullet1" fallback="Åndelig skjelneevne og etikk" />
                </li>
                <li className="flex items-center gap-2">
                  <span className="p-0.5 bg-green-50 text-green-600 rounded-full shrink-0"><Check size={12} /></span>
                  <CmsText slug="landing-pillar1-bullet2" fallback="Drømmetydning & Åpenbaring" />
                </li>
                <li className="flex items-center gap-2">
                  <span className="p-0.5 bg-green-50 text-green-600 rounded-full shrink-0"><Check size={12} /></span>
                  <CmsText slug="landing-pillar1-bullet3" fallback="Etisk karakter og modenhet" />
                </li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white rounded-2xl border border-surface-container shadow-[0_4px_20px_-4px_rgba(86,18,145,0.04)] p-8 sm:p-10 flex flex-col justify-between relative group hover:border-[#561291]/20 hover:shadow-[0_12px_32px_rgba(86,18,145,0.07)] transition-all duration-300 ease-out min-h-[360px]">
              <span className="absolute top-6 right-8 font-serif text-5xl font-extrabold text-[#561291]/5 select-none pointer-events-none group-hover:text-[#561291]/10 transition-colors duration-300">02</span>
              <div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#561291]/10 to-[#561291]/5 flex items-center justify-center text-[#561291] mb-6 group-hover:scale-105 transition-transform duration-300">
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
              <ul className="space-y-2.5 border-t border-outline-variant/30 pt-6 text-xs text-on-surface-variant font-medium font-sans">
                <li className="flex items-center gap-2">
                  <span className="p-0.5 bg-green-50 text-green-600 rounded-full shrink-0"><Check size={12} /></span>
                  <CmsText slug="landing-pillar2-bullet1" fallback="Historisk-grammatisk hermeneutikk" />
                </li>
                <li className="flex items-center gap-2">
                  <span className="p-0.5 bg-green-50 text-green-600 rounded-full shrink-0"><Check size={12} /></span>
                  <CmsText slug="landing-pillar2-bullet2" fallback="Paktsteologi & Eskatologi" />
                </li>
                <li className="flex items-center gap-2">
                  <span className="p-0.5 bg-green-50 text-green-600 rounded-full shrink-0"><Check size={12} /></span>
                  <CmsText slug="landing-pillar2-bullet3" fallback="Sunn eksegese og Skriftlære" />
                </li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white rounded-2xl border border-surface-container shadow-[0_4px_20px_-4px_rgba(86,18,145,0.04)] p-8 sm:p-10 flex flex-col justify-between relative group hover:border-[#561291]/20 hover:shadow-[0_12px_32px_rgba(86,18,145,0.07)] transition-all duration-300 ease-out min-h-[360px]">
              <span className="absolute top-6 right-8 font-serif text-5xl font-extrabold text-[#561291]/5 select-none pointer-events-none group-hover:text-[#561291]/10 transition-colors duration-300">03</span>
              <div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#561291]/10 to-[#561291]/5 flex items-center justify-center text-[#561291] mb-6 group-hover:scale-105 transition-transform duration-300">
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
              <ul className="space-y-2.5 border-t border-outline-variant/30 pt-6 text-xs text-on-surface-variant font-medium font-sans">
                <li className="flex items-center gap-2">
                  <span className="p-0.5 bg-green-50 text-green-600 rounded-full shrink-0"><Check size={12} /></span>
                  <CmsText slug="landing-pillar3-bullet1" fallback="1-til-1 oppfølging & mentorsamtaler" />
                </li>
                <li className="flex items-center gap-2">
                  <span className="p-0.5 bg-green-50 text-green-600 rounded-full shrink-0"><Check size={12} /></span>
                  <CmsText slug="landing-pillar3-bullet2" fallback="Personlig disippelskapsprogram" />
                </li>
                <li className="flex items-center gap-2">
                  <span className="p-0.5 bg-green-50 text-green-600 rounded-full shrink-0"><Check size={12} /></span>
                  <CmsText slug="landing-pillar3-bullet3" fallback="Karakterutvikling & Åndelig vekst" />
                </li>
              </ul>
            </div>
          </div>
          
          {/* Symmetrical full-width global network banner below */}
          <div id="research" className="mt-12 bg-gradient-to-r from-[#561291]/5 to-transparent border border-[#561291]/10 rounded-2xl p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-[#561291]/20 transition-all duration-300 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-4 sm:gap-6 relative z-10">
              <div className="w-14 h-14 rounded-full bg-white text-[#561291] shadow-sm flex items-center justify-center border border-outline-variant/30 flex-shrink-0 animate-float">
                <Globe size={26} className="text-[#561291]" />
              </div>
              <div className="space-y-1">
                <CmsText slug="landing-network-title" fallback="Globale Profetiske Nettverk" as="h4" className="font-serif text-lg text-[#561291] font-bold" />
                <CmsText slug="landing-network-desc" fallback="Koble deg til bønnenettverk, misjonsreiser og tjenester over hele verden for å utvide ditt åndelige perspektiv." as="p" className="text-xs sm:text-sm text-on-surface-variant leading-relaxed max-w-2xl" />
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/login')}
              className="relative z-10 shrink-0 px-6 py-3 bg-[#561291] hover:bg-[#3c096c] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.98] flex items-center gap-2 group-hover:translate-x-0.5"
            >
              <CmsText slug="landing-network-btn" fallback="Bli en Del" />
              <ArrowRight size={14} />
            </button>
          </div>
        </section>

        <section id="faculty" className="py-24 bg-surface-container-low overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12">
            <div className="mb-12 max-w-2xl">
              <CmsText slug="landing-testimonials-title" fallback="Vitnesbyrd & Erfaringer" as="h2" className="font-serif text-3xl text-primary font-bold mb-4" />
              <CmsText slug="landing-testimonials-desc" fallback="Hør hva våre studenter og mentorer sier om det profetiske fellesskapet." as="p" className="text-on-surface-variant" />
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
                    <CmsText slug="landing-testimonial1-name" fallback="Apostel David Hansen" as="h4" className="font-serif text-lg text-primary font-bold" />
                    <CmsText slug="landing-testimonial1-role" fallback="Grunnlegger & Hovedmentor" as="p" className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold" />
                  </div>
                </div>
                <CmsText slug="landing-testimonial1-quote" fallback="&quot;Det profetiske fellesskapet her er helt unikt. Plattformen gir studentene de nødvendige åndelige og teologiske rammene for å vokse inn i sin tjeneste.&quot;" as="p" className="font-serif italic text-on-surface leading-relaxed text-sm md:text-base" />
              </div>

              <div className="p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-outline-variant relative">
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    alt="Pastor Siri Knutsen" 
                    className="w-16 h-16 rounded-full object-cover border border-primary-fixed"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
                  />
                  <div>
                    <CmsText slug="landing-testimonial2-name" fallback="Pastor Siri Knutsen" as="h4" className="font-serif text-lg text-primary font-bold" />
                    <CmsText slug="landing-testimonial2-role" fallback="Fagansvarlig for Sjelesorg & Menighet" as="p" className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold" />
                  </div>
                </div>
                <CmsText slug="landing-testimonial2-quote" fallback="&quot;Å bygge bro mellom solid bibellære og praktisk betjening i menigheten er kjernen i mitt hjerte. Mentorskapet her gir studentene retning og soliditet.&quot;" as="p" className="font-serif italic text-on-surface leading-relaxed text-sm md:text-base" />
              </div>
            </div>
          </div>
        </section>

        <section id="admissions" className="py-24 bg-background border-t border-outline-variant text-center">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12">
            <div className="inline-flex items-center gap-2 mb-6 text-primary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              <CmsText slug="landing-cta-tagline" fallback="Opptak Åpent for Høsten 2026" as="span" className="text-xs font-semibold tracking-widest uppercase" />
            </div>
            <CmsText slug="landing-cta-title" fallback="Er du klar til å tre inn i din gudgitte tjeneste?" as="h2" className="font-serif text-3xl md:text-4xl text-primary font-bold mb-6 max-w-2xl mx-auto" />
            <CmsText slug="landing-cta-desc" fallback="Bli en del av et levende og solid læringsmiljø dedikert til bibelundervisning og åndelig utrustning." as="p" className="text-base text-on-surface-variant mb-10 max-w-xl mx-auto" />
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button 
                onClick={() => navigate('/login')} 
                className="w-full sm:w-auto px-8 py-4 bg-primary text-on-primary font-semibold rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98]"
              >
                <CmsText slug="landing-cta-btn-primary" fallback="Søk Opptak 2026" />
              </button>
              <button 
                onClick={() => navigate('/student/library')} 
                className="w-full sm:w-auto px-8 py-4 bg-surface-container border border-outline-variant text-primary font-semibold rounded-xl hover:bg-surface-container-high transition-all"
              >
                <CmsText slug="landing-cta-btn-secondary" fallback="Se Fagplan" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-4 sm:px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 bg-tertiary text-white">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <CmsText slug="landing-footer-title" fallback="His Kingdom Prophets" as="div" className="font-serif text-lg font-bold text-on-tertiary" />
          <CmsText slug="landing-footer-copyright" fallback="© 2026 His Kingdom Prophets. Alle rettigheter reservert. Utrustning av profetiske tjenester for menigheten." as="p" className="text-xs text-on-tertiary opacity-80 max-w-md" />
        </div>
        <nav className="flex flex-wrap justify-center gap-6 text-xs text-center">
          <Link className="text-on-tertiary-container hover:text-on-tertiary transition-opacity" to="/privacy">
            <CmsText slug="landing-footer-link-privacy" fallback="Personvern" />
          </Link>
          <Link className="text-on-tertiary-container hover:text-on-tertiary transition-opacity" to="/terms">
            <CmsText slug="landing-footer-link-terms" fallback="Betingelser" />
          </Link>
          <Link className="text-on-tertiary-container hover:text-on-tertiary transition-opacity" to="/accessibility">
            <CmsText slug="landing-footer-link-accessibility" fallback="Tilgjengelighet" />
          </Link>
          <Link className="text-on-tertiary-container hover:text-on-tertiary transition-opacity" to="/support">
            <CmsText slug="landing-footer-link-support" fallback="Kontakt Support" />
          </Link>
        </nav>
      </footer>
    </div>
  );
}
