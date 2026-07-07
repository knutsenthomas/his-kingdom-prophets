import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import worshipHero from '@/assets/worship_hero.png';
import logo from '@/assets/logo.png';
import CmsText from '@/components/CmsText';
import { 
  Sparkles, BookOpen, UserCheck, Globe, ArrowRight, Check, Menu, X,
  Heart, Info, Calendar, Award, ShoppingBag, Link2, Users, Laptop, 
  BookOpenCheck, ShieldCheck, HelpCircle, Lock
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, cmsContent, language, toggleLanguage } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('about');
  const [activeCurriculumTab, setActiveCurriculumTab] = useState('community');
  
  const portalPath = user?.role === 'teacher' || user?.role === 'admin' || user?.role === 'superadmin' ? '/teacher/dashboard' : '/student/dashboard';

  const navItems = [
    { slug: 'landing-nav-about', fallback: 'Om oss', href: '#about', id: 'about' },
    { slug: 'landing-nav-shop', fallback: 'Designbutikk', href: '#shop', id: 'shop' },
    { slug: 'landing-nav-school', fallback: 'Utdanning', href: '#school', id: 'school' },
    { slug: 'landing-nav-curriculum', fallback: 'Fagplaner', href: '#curriculum', id: 'curriculum' },
    { slug: 'landing-nav-resources', fallback: 'Bibelressurser', href: '/bible-resources', id: 'research' }
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
    const sections = ['about', 'shop', 'school', 'curriculum'];
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
        setActiveSection('about');
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
        <div className="flex justify-between items-center w-full px-3 sm:px-4 md:px-6 lg:px-8 h-20 max-w-[1440px] mx-auto">
          <div className="font-serif text-[11px] min-[360px]:text-xs sm:text-sm md:text-base lg:text-base xl:text-lg text-primary font-bold cursor-pointer shrink-0 flex items-center gap-1.5 sm:gap-2" onClick={() => navigate('/')}>
            <img 
              src={logo} 
              alt="His Kingdom Prophets Logo" 
              className="w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0" 
            />
            <span className="hidden sm:inline"><CmsText slug="layout-logo-title" fallback="His Kingdom Prophetic Community" /></span>
            <span className="inline sm:hidden"><CmsText slug="layout-logo-mobile-title" fallback="HKP" /></span>
          </div>
          
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-xs xl:text-sm">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`font-bold cursor-pointer pb-1 border-b-2 transition-all duration-200 ${
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
              {user ? (
                <button 
                  onClick={() => navigate(portalPath)} 
                  className="px-6 py-2 bg-primary text-on-primary font-semibold rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98] shadow-sm text-sm shrink-0 flex items-center gap-1"
                >
                  <CmsText slug="landing-btn-portal" fallback="Gå til portal" />
                  <ArrowRight size={14} />
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/login')} 
                    className="px-6 py-2 font-semibold text-on-surface-variant hover:text-primary transition-colors text-sm shrink-0"
                  >
                    <CmsText slug="landing-btn-login" fallback="Logg inn" />
                  </button>
                  <button 
                    onClick={() => navigate('/admission')} 
                    className="px-6 py-2 bg-primary text-on-primary font-semibold rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98] shadow-sm text-sm shrink-0"
                  >
                    <CmsText slug="landing-btn-apply" fallback="Søk Nå" />
                  </button>
                </>
              )}
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
              {user ? (
                <button 
                  onClick={() => navigate(portalPath)} 
                  className="px-2.5 sm:px-4 py-2 bg-primary text-on-primary font-semibold rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98] shadow-sm text-[10px] min-[360px]:text-xs shrink-0 flex items-center gap-0.5"
                >
                  <CmsText slug="landing-btn-portal" fallback="Gå til portal" />
                  <ArrowRight size={12} />
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/admission')} 
                  className="px-2.5 sm:px-4 py-2 bg-primary text-on-primary font-semibold rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98] shadow-sm text-[10px] min-[360px]:text-xs shrink-0"
                >
                  <CmsText slug="landing-btn-apply" fallback="Søk Nå" />
                </button>
              )}
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
                    <CmsText slug="layout-logo-title" fallback="His Kingdom Prophetic Community" />
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
                {user ? (
                  <button
                    onClick={() => { navigate(portalPath); setIsMobileMenuOpen(false); }}
                    className="w-full py-3 bg-primary text-white font-bold rounded-xl text-xs transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-1.5"
                  >
                    <CmsText slug="landing-btn-portal" fallback="Gå til portal" />
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                      className="w-full py-3 border border-outline-variant text-primary hover:bg-primary/5 font-bold rounded-xl text-xs transition-all active:scale-[0.98]"
                    >
                      <CmsText slug="landing-btn-login" fallback="Logg inn" />
                    </button>
                    <button
                      onClick={() => { navigate('/admission'); setIsMobileMenuOpen(false); }}
                      className="w-full py-3 bg-primary text-white font-bold rounded-xl text-xs transition-all active:scale-[0.98] shadow-md"
                    >
                      <CmsText slug="landing-btn-apply" fallback="Søk Nå" />
                    </button>
                  </>
                )}
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
                fallback="His Kingdom Prophetic Community" 
                as="h1" 
                className="font-serif text-3xl md:text-5xl lg:text-6xl text-white mb-8 leading-tight font-bold" 
              />
              <CmsText 
                slug="landing-hero-description" 
                fallback="His Kingdom Ministry fokuserer på misjon, utrustning av de hellige, bibelundervisning, bønn, helbredelse og utfrielse, samt å vokse i Åndens profetiske gaver. Alt gjøres etter bibelsk standard." 
                as="p" 
                className="text-base md:text-lg text-on-primary-container mb-10 max-w-xl" 
              />
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={(e) => handleNavClick(e, { href: '#about', id: 'about' })} 
                  className="px-8 py-4 bg-white text-[#3c096c] font-semibold rounded-xl hover:bg-slate-100 transition-all shadow-lg hover:-translate-y-0.5 text-sm active:scale-[0.98]"
                >
                  <CmsText slug="landing-hero-cta-primary" fallback="Les mer om oss" />
                </button>
                <button 
                  onClick={(e) => handleNavClick(e, { href: '#school', id: 'school' })} 
                  className="px-8 py-4 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all group flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
                >
                  <CmsText slug="landing-hero-cta-secondary" fallback="Våre Studielinjer" />
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: About the Organization & Founders */}
        <section id="about" className="py-20 px-4 sm:px-6 md:px-12 max-w-[1200px] mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#3c096c]/10 text-[#3c096c] font-bold text-xs uppercase tracking-wider">
              <Info size={14} />
              {language === 'no' ? "Vårt fundament & Grunnleggere" : "Our Foundation & Founders"}
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-[#3c096c] font-extrabold leading-tight">
              {language === 'no' ? "Om stiftelsen og folkene bak" : "About the Organization & Founders"}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* The Foundation text */}
            <div className="space-y-6 bg-white border border-[#dec2ef]/40 p-8 rounded-3xl shadow-sm hover:border-[#3c096c]/20 transition-all">
              <div className="flex items-center gap-3 text-[#3c096c]">
                <Award size={24} className="shrink-0" />
                <h3 className="font-serif text-xl font-bold">{language === 'no' ? "Vårt fundament" : "Our Foundation"}</h3>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {language === 'no' 
                  ? "His Kingdom Ministry har fokus på misjon, utrustning av de hellige, bibelundervisning, bønn, forbønn, helbredelse og utfrielse, samt å vokse i Åndens profetiske gaver. Alt vi gjør skal gjøres etter bibelske standarder og med Guds ledelse."
                  : "Our Foundation: His Kingdom Ministry focuses on missions, equipping the saints, Bible teaching, prayer, intercession, healing and deliverance, and growing in the prophetic gifts of the Spirit. Everything we do will be done by Biblical standards and God’s guidance."}
              </p>

              <div className="w-full h-[1px] bg-slate-100 my-4" />

              <div className="space-y-2">
                <h4 className="font-serif text-base font-bold text-[#3c096c]">
                  {language === 'no' ? "Fra \"Stiftelse\" til \"Ministry 2.0\"" : "From \"Foundation\" to \"Ministry 2.0\""}
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {language === 'no'
                    ? "Før Hilde Karin møtte Thomas, drev hun organisasjonen \"His Kingdom Foundation\". Hun fikk navnet fra Herren i bønn i 2008, hvor Jesus forklarte hvordan Han ønsket at arbeidet hennes skulle være grunnlagt på Hans rikes prinsipper fra Bibelen. His Kingdom Ministry ble registrert mens paret var på bryllupsreise. Det fungerer som en \"2.0 oppgradering\", men vi holder fortsatt fast på den samme høye verdien."
                    : "Before Hilde Karin met Thomas, she had an organization called His Kingdom Foundation. She had received the name from the Lord in prayer in 2008, where Jesus explained how He wanted her work to be founded on His Kingdom Principles from the Bible. His Kingdom Ministry was registered while the couple was on their honeymoon. It serves as a \"2.0 upgrade,\" but we still hold the same high value."}
                </p>
              </div>
            </div>

            {/* The Story Behind */}
            <div className="space-y-6 bg-white border border-[#dec2ef]/40 p-8 rounded-3xl shadow-sm hover:border-[#3c096c]/20 transition-all">
              <div className="flex items-center gap-3 text-[#3c096c]">
                <Heart size={24} className="shrink-0 text-red-500" />
                <h3 className="font-serif text-xl font-bold">{language === 'no' ? "Historien bak" : "The Story Behind"}</h3>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {language === 'no'
                  ? "Hilde Karin begynte å dra på misjons- og bibelsmuglingsturer da hun var 14 år, og har siden levd som misjonær i Midtøsten, Afrika og Spania. I mai 2022 kalte Gud henne hjem til Norge, hvor hun møtte Thomas Knutsen. De giftet seg 2. desember 2023."
                  : "Hilde Karin started going on mission and Bible smuggling trips when she was 14 and has since lived as a missionary in the Middle East, Africa, and Spain. In May 2022, God called her back home to Norway, where she met Thomas Knutsen. They were married on December 2, 2023."}
              </p>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {language === 'no'
                  ? "Thomas har arbeidet 16 år i kirkeadministrasjon og regnskap, og har vært på flere korttidsmisjonsturer. Sammen har de besøkt 9 land, og det å nå de fortapte ligger tungt på hjertet deres."
                  : "Thomas has worked for 16 years in Church Administration and Accounting and has gone on several short-term mission trips. Together, they have visited 9 countries, and reaching the lost is heavy on their hearts."}
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Creative Work & Digital Platforms */}
        <section id="shop" className="py-20 bg-surface-container-low border-y border-outline-variant/40">
          <div className="px-4 sm:px-6 md:px-12 max-w-[1200px] mx-auto space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#3c096c]/10 text-[#3c096c] rounded-full text-xs font-bold uppercase tracking-wider">
                  <ShoppingBag size={14} />
                  {language === 'no' ? "Kreativt Arbeid & Butikk" : "Creative Work & Store"}
                </span>
                <h2 className="font-serif text-3xl font-bold text-[#3c096c] leading-tight">
                  {language === 'no' ? "His Kingdom Designs" : "His Kingdom Designs Shop"}
                </h2>
                <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
                  {language === 'no'
                    ? "Organisasjonen driver også nettbutikken His Kingdom Designs. Butikken tilbyr mange produkter på norsk, engelsk og spansk som er flotte som gaver og til bruk i evangelisering. Den gir også inntekter til stiftelsen og prosjektene Gud legger på våre hjerter."
                    : "The organization also runs the His Kingdom Designs shop. The store offers many products in Norwegian, English, and Spanish that are great as gifts and for use in Evangelism. It also provides income for the ministry and the projects God puts on our hearts."}
                </p>
                <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 space-y-4">
                  <h4 className="font-serif text-base font-bold text-[#3c096c]">{language === 'no' ? "Rollefordeling i teamet:" : "Team Roles:"}</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#3c096c] rounded-full" />
                      <span><strong>Thomas:</strong> {language === 'no' ? "Webdesigner (opprettet nettstedene)" : "Webdesigner (created the websites)"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#3c096c] rounded-full" />
                      <span><strong>Hilde Karin:</strong> {language === 'no' ? "Designer produktene" : "Designs the products"}</span>
                    </li>
                  </ul>
                  <p className="text-xs text-slate-500 italic mt-2">
                    {language === 'no'
                      ? "Vår visjon for butikken: Vi har en visjon om å hjelpe andre designere til å bli sett og kunne selge sine ting gjennom vår butikk, slik at det kan velsigne mange!"
                      : "Our vision for the shop: We have a vision of helping other designers to be seen and able to sell their things through our store, so that it can help bless many people!"}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white border border-[#dec2ef]/55 p-8 rounded-3xl shadow-sm space-y-6">
                  <h3 className="font-serif text-lg font-bold text-[#3c096c]">{language === 'no' ? "Nettsteder & Ressurser" : "Websites & Resources"}</h3>
                  
                  <div className="space-y-4">
                    <a 
                      href="https://hiskingdomministry.no" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-all group"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-[#3c096c] flex items-center gap-1">
                          hiskingdomministry.no
                          <Link2 size={12} className="opacity-60" />
                        </span>
                        <p className="text-[10px] text-slate-500">
                          {language === 'no' ? "Hovedsiden (Blogg, YouTube, podcast, bibelverktøy)" : "Ministry page (Blog, YouTube, podcast, Bible tools)"}
                        </p>
                      </div>
                      <ArrowRight size={14} className="text-[#3c096c] group-hover:translate-x-1 transition-transform" />
                    </a>

                    <a 
                      href="https://hiskingdomdesigns.no" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-all group"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-[#3c096c] flex items-center gap-1">
                          hiskingdomdesigns.no
                          <Link2 size={12} className="opacity-60" />
                        </span>
                        <p className="text-[10px] text-slate-500">
                          {language === 'no' ? "Nettbutikken (inntektskilde for misjonsprosjekter)" : "The store (income source for the ministry)"}
                        </p>
                      </div>
                      <ArrowRight size={14} className="text-[#3c096c] group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: The Prophetic School and Online Concept */}
        <section id="school" className="py-20 px-4 sm:px-6 md:px-12 max-w-[1200px] mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#3c096c]/10 text-[#3c096c] font-bold text-xs uppercase tracking-wider">
              <Laptop size={14} />
              {language === 'no' ? "Skole og Studieforløp" : "Prophetic School & Concept"}
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-[#3c096c] font-extrabold leading-tight">
              {language === 'no' ? "Vår visjon for den profetiske skolen" : "Vision for the Prophetic School"}
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-2xl mx-auto">
              {language === 'no'
                ? "Vår visjon for den ONLINE profetiske skolen er at det vil være to studielinjer. Studenter må søke på begge linjene, og vi vil be over hvem vi skal ta opp."
                : "Our vision for the ONLINE prophetic ministry and the prophet school is that there will be two ministry tracks/lines. Students need to apply to both of the school lines, and we will pray about whom to accept."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Track 1 Box */}
            <div className="bg-white border border-[#dec2ef]/55 p-8 rounded-3xl shadow-sm flex flex-col justify-between hover:border-[#3c096c]/20 transition-all min-h-[420px]">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-[#3c096c]/5 text-[#3c096c] border border-[#3c096c]/10 rounded-md uppercase tracking-wider">
                    {language === 'no' ? "Linje 1 (1. år)" : "Track 1 (Year 1)"}
                  </span>
                  <span className="text-xs font-bold text-[#c5a059] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={14} />
                    {language === 'no' ? "Aktiv for søknad" : "Open for applications"}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#3c096c] mb-4">
                  His Kingdom Prophetic Community
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-6 font-medium">
                  {language === 'no'
                    ? "Dette sporet er for alle som ønsker å vokse i sitt forhold til Jesus og i Åndens gaver, uavhengig av om de er kalt til profetembetet eller ikke. Vi ønsker å bygge et trygt fellesskap for profetiske mennesker til å vokse."
                    : "This track is for everyone who wants to grow in their relationship with Jesus and in the gifts of the Spirit, regardless of whether they are called into the office as a prophet or not. We want to build a safe community for prophetic people to grow and be seen."}
                </p>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs font-semibold text-slate-700 mb-6">
                  <span className="text-[#3c096c] block mb-1 font-bold">💡 Intercession Core Team:</span>
                  {language === 'no' 
                    ? "Som en del av vårt kjerne-forbønnsteam er du velkommen til å bli med på alle klasser du ønsker helt GRATIS." 
                    : "As part of our Intercession Core Team, you are welcome to join any, all, or as many of the classes as you like for FREE."}
                </div>
              </div>
              
              <div className="border-t border-slate-100 pt-6 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-green-600 shrink-0" />
                  <span>{language === 'no' ? "Kan tas år etter år (nye temaer hvert år)" : "Can join year after year (different subjects yearly)"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-green-600 shrink-0" />
                  <span>{language === 'no' ? "Basisfag: Profeti 101, Å høre Guds stemme, Gave vs Tjeneste" : "Fundamentals: Prophecy 101, Hearing God, Gift vs Office"}</span>
                </div>
              </div>
            </div>

            {/* Track 2 Box */}
            <div className="bg-white border border-[#dec2ef]/55 p-8 rounded-3xl shadow-sm flex flex-col justify-between hover:border-[#3c096c]/20 transition-all min-h-[420px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent pointer-events-none" />
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-amber-500/10 text-amber-700 border border-amber-500/20 rounded-md uppercase tracking-wider flex items-center gap-1">
                    <Lock size={12} />
                    {language === 'no' ? "Linje 2 (2. år)" : "Track 2 (Year 2)"}
                  </span>
                  <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {language === 'no' ? "Oppstart 2028" : "Launches 2028"}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#3c096c] mb-4">
                  His Kingdom Prophets
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-6 font-medium">
                  {language === 'no'
                    ? "Dette er sporet for de som vet at de er kalt til tjenesten som profet (profetembetet). Vi er Hans profeter som sprer Hans Rike, og fokuserer ikke på oss selv eller våre egne plattformer."
                    : "This is the track for those who know they are called to the office of a prophet. We are His prophets, spreading His Kingdom, not focusing on ourselves or \"our\" platforms."}
                </p>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-xs font-semibold text-amber-900 mb-6">
                  <span className="text-amber-800 block mb-1 font-bold">⚠️ Opptakskrav:</span>
                  {language === 'no' 
                    ? "Alle som skal gå His Kingdom Prophets må først fullføre det 1. året (Prophetic Community)." 
                    : "Everyone who wants to attend His Kingdom Prophets must go through the 1st year (Track 1)."}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-green-600 shrink-0" />
                  <span>{language === 'no' ? "Krever ny søknad, pensumliste og skriftlig oppgave" : "Requires reapplication, reading list, and writing a paper"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-green-600 shrink-0" />
                  <span>{language === 'no' ? "Krav om deltakelse på 1-2 ukers fysisk \"SUPER CHARGE\" samling" : "Requires attending a 1-2 week physical \"SUPER CHARGE\" event"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dream & Launch Details */}
          <div className="bg-gradient-to-r from-[#3c096c]/5 to-transparent border border-[#3c096c]/10 p-8 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-2">
              <h4 className="font-serif text-lg font-bold text-[#3c096c]">{language === 'no' ? "Oppstartsdato" : "Launch Details"}</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {language === 'no'
                  ? "Skolen starter 27. august 2027."
                  : "The school starts August 27, 2027."}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-serif text-lg font-bold text-[#3c096c]">{language === 'no' ? "Vår Drøm" : "Our Dream"}</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {language === 'no'
                  ? "Vår drøm er å ha et hus og et sted hvor vi også kan være vertskap for fysiske arrangementer som vil bli strømmet på Zoom eller i lukkede Facebook-grupper."
                  : "Our Dream: To have a house and place where we can also host in-person events that will be streamed on Zoom/closed Facebook groups."}
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Teaching Topics / Curriculum */}
        <section id="curriculum" className="py-20 bg-surface-container-low border-t border-outline-variant/40">
          <div className="px-4 sm:px-6 md:px-12 max-w-[1200px] mx-auto space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#3c096c]/10 text-[#3c096c] font-bold text-xs uppercase tracking-wider">
                <BookOpenCheck size={14} />
                {language === 'no' ? "Fagplan & Emner" : "Curriculum & Topics"}
              </span>
              <h2 className="font-serif text-3xl font-extrabold text-[#3c096c]">
                {language === 'no' ? "Hva lærer du hos oss?" : "Teaching Topics & Curriculum"}
              </h2>
            </div>

            {/* Directly display Year 1 Curriculum */}
            <div className="bg-white border border-[#dec2ef]/40 p-6 sm:p-8 rounded-3xl shadow-sm hover:border-[#3c096c]/20 transition-all space-y-8">
              <div className="space-y-4 border-b border-slate-100 pb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-[#3c096c] uppercase tracking-wider">
                    {language === 'no' ? "Fagplan: 1. år (Prophetic Community)" : "Teaching Plan: Year 1 (Prophetic Community)"}
                  </h3>
                  <span className="self-start text-[10px] font-bold bg-green-500 text-white px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {language === 'no' ? "Aktiv for søknad" : "Open for Admission"}
                  </span>
                </div>
                
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {language === 'no'
                    ? "Førsteåret fokuserer på å bygge et solid bibelsk fundament, styrke din personlige relasjon til Jesus og utruste deg i Åndens profetiske gaver. Undervisningen forener sunn teologi med praktisk åpenbaring og et trygt trosfellesskap."
                    : "The first year focuses on building a solid biblical foundation, strengthening your personal relationship with Jesus, and equipping you in the prophetic gifts of the Spirit. The teaching unites sound theology with practical revelation and a safe faith community."}
                </p>
              </div>

              {/* Categorized Curriculum Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[
                  {
                    title: language === 'no' ? "1. Fundament & Relasjon" : "1. Foundation & Relationship",
                    topics: language === 'no' ? [
                      "Bønn og profetisk forbønn", "Faste", "Gudsfrykt / Frykt for Gud", 
                      "Disippelskap", "Identitet og autoritet i Kristus", "Ydmykhet", 
                      "Ulike måter å høre Gud på", "Lønnkammeret og journalføring"
                    ] : [
                      "Prayer and Prophetic Intercession", "Fasting", "The Fear of God", 
                      "Discipleship", "Identity and Authority in Christ", "Humility", 
                      "Different Ways to Hear God", "The Secret Place and Journaling"
                    ]
                  },
                  {
                    title: language === 'no' ? "2. Profetisk Utrustning & Gaver" : "2. Prophetic Equipping & Gifts",
                    topics: language === 'no' ? [
                      "Personlig profeti / Profeti 101", "Åndens gaver", 
                      "Hvordan vokse i det profetiske?", "Kunnskapsord, tydning av tunger", 
                      "Tungetale", "Proklamasjoner og erklæringer", 
                      "Hva er en profet vs. profetisk gave", "Retningslinjer for det profetiske fellesskapet"
                    ] : [
                      "Personal Prophecy / Prophecy 101", "Gifts of the Spirit", 
                      "How to Grow in the Prophetic?", "Word of Knowledge, Interpretation of Tongues", 
                      "Speaking in Tongues", "Proclamations and Decreeing", 
                      "What is a prophet vs prophetic gift", "Prophetic Community Guidelines"
                    ]
                  },
                  {
                    title: language === 'no' ? "3. Indre Helbredelse & Utfrielse" : "3. Inner Healing & Deliverance",
                    topics: language === 'no' ? [
                      "Omvendelse og tilgivelse", "Helbredelse / Indre helbredelse", 
                      "Forbannelser (generelt)", "Kristen religiøs heksekunst / Forbannelser / sjelelige bønner", 
                      "Hvordan overvinne blokkeringer?", "Forkastelse, foreldreløs ånd", 
                      "Perversjonsånd, Lilith, Incubus & Succubus", "Spådomsånder og overvåkende ånder", 
                      "Bryte okkulte og heksekunstbånd", "Traumer og triggere", 
                      "Frasigelsesbønner / Avsvergelser", "Mental og emosjonell helse"
                    ] : [
                      "Repentance and Forgiveness", "Healing / Inner Healing", 
                      "Curses (general)", "Christian Religious Witchcraft / Curses / soulish prayers", 
                      "How to Overcome Blockage?", "Rejection, Orphan Spirit", 
                      "Spirit of Perversion, Lilith, Incubus & Succubus", "Familiar Spirits and Monitoring Spirits", 
                      "Breaking Occult and Witchcraft Ties", "Trauma and Triggers", 
                      "Renouncing prayers", "Mental and Emotional Health"
                    ]
                  },
                  {
                    title: language === 'no' ? "4. Praktisk Kristenliv & Tjeneste" : "4. Practical Christian Life & Ministry",
                    topics: language === 'no' ? [
                      "Overnaturlig økonomi", "Misjon / Misjonær", 
                      "Bønnevakter / Nattbønn / Morgenbønn", "Smågrupper"
                    ] : [
                      "Supernatural Finances", "Missions / Missionary", 
                      "Prayer Watches / Night Prayers / Morning Prayers", "Small Groups"
                    ]
                  }
                ].map((cat, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-3.5 hover:bg-slate-100/50 transition-all duration-200">
                    <h4 className="font-serif text-[13px] font-bold text-[#3c096c] uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3c096c]" />
                      {cat.title}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {cat.topics.map((topic, j) => (
                        <div key={j} className="bg-white border border-slate-200/50 p-2.5 rounded-xl text-xs text-slate-700 font-semibold flex items-center gap-2">
                          <span className="w-1 h-1 bg-[#3c096c] rounded-full shrink-0" />
                          <span>{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Call to action section */}
        <section id="admissions" className="py-24 bg-background border-t border-outline-variant/30 text-center">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12">
            <div className="inline-flex items-center gap-2 mb-6 text-[#3c096c]">
              <Sparkles size={16} />
              <CmsText slug="landing-cta-tagline" fallback="Opptak Åpent for 2027" as="span" className="text-xs font-semibold tracking-widest uppercase" />
            </div>
            <CmsText slug="landing-cta-title" fallback="Er du klar til å vokse i dine åndelige gaver?" as="h2" className="font-serif text-3xl md:text-4xl text-[#3c096c] font-bold mb-6 max-w-2xl mx-auto" />
            <CmsText slug="landing-cta-desc" fallback="Søk om opptak til His Kingdom Prophetic Community i dag. Vi gleder oss til å gå sammen med deg." as="p" className="text-base text-on-surface-variant mb-10 max-w-xl mx-auto" />
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button 
                onClick={() => navigate('/admission')} 
                className="w-full sm:w-auto px-8 py-4 bg-[#3c096c] hover:bg-[#3c096c]/90 text-white font-semibold rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98]"
              >
                <CmsText slug="landing-cta-btn-primary" fallback="Søk Opptak 2027" />
              </button>
              <button 
                onClick={(e) => handleNavClick(e, { href: '#curriculum', id: 'curriculum' })}
                className="w-full sm:w-auto px-8 py-4 bg-surface-container border border-outline-variant text-[#3c096c] font-semibold rounded-xl hover:bg-surface-container-high transition-all active:scale-[0.98]"
              >
                <CmsText slug="landing-cta-btn-secondary" fallback="Se Undervisningsemner" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-4 sm:px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 bg-[#3c096c] text-white">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <CmsText slug="landing-footer-title" fallback="His Kingdom Ministry" as="div" className="font-serif text-lg font-bold text-white" />
          <CmsText slug="landing-footer-copyright" fallback="© 2026 His Kingdom Ministry. Alle rettigheter reservert. Utrustning av profetiske tjenester for Hans Rike." as="p" className="text-xs text-slate-300 opacity-90 max-w-md" />
        </div>
        <nav className="flex flex-wrap justify-center gap-6 text-xs text-center">
          <Link className="text-slate-300 hover:text-white transition-colors" to="/privacy">
            <CmsText slug="landing-footer-link-privacy" fallback="Personvern" />
          </Link>
          <Link className="text-slate-300 hover:text-white transition-colors" to="/terms">
            <CmsText slug="landing-footer-link-terms" fallback="Betingelser" />
          </Link>
          <Link className="text-slate-300 hover:text-white transition-colors" to="/accessibility">
            <CmsText slug="landing-footer-link-accessibility" fallback="Tilgjengelighet" />
          </Link>
          <Link className="text-slate-300 hover:text-white transition-colors" to="/support">
            <CmsText slug="landing-footer-link-support" fallback="Kontakt Support" />
          </Link>
        </nav>
      </footer>
    </div>
  );
}
