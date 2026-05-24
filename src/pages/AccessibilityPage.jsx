import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { Eye, ArrowLeft, Globe, Zap, CheckCircle, HeartHandshake } from 'lucide-react';
import logo from '@/assets/logo.png';
import CmsText from '@/components/CmsText';

export default function AccessibilityPage() {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useApp();

  const isEn = language === 'en';

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-sm">
        <div className="flex justify-between items-center w-full px-4 sm:px-6 md:px-12 h-20 max-w-[1440px] mx-auto">
          <div className="font-serif text-xs min-[360px]:text-sm sm:text-lg md:text-xl lg:text-2xl text-primary font-bold cursor-pointer shrink-0 flex items-center gap-1.5 sm:gap-2.5" onClick={() => navigate('/')}>
            <img src={logo} alt="His Kingdom Prophets Logo" className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0" />
            <span className="hidden sm:inline">
              <CmsText slug="layout-logo-title" fallback="His Kingdom Prophets" />
            </span>
            <span className="inline sm:hidden">
              <CmsText slug="layout-logo-mobile-title" fallback="HKP" />
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="px-3 py-1.5 border border-[#561291]/20 hover:border-primary text-xs font-bold uppercase rounded-lg text-primary bg-[#561291]/5 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
              title={isEn ? 'Bytt til norsk (Switch to Norwegian)' : 'Bytt til engelsk (Switch to English)'}
            >
              <Globe size={13} />
              <span>{isEn ? 'EN' : 'NO'}</span>
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:text-primary-container transition-colors"
            >
              <ArrowLeft size={16} />
              <span>{isEn ? 'Back' : 'Tilbake'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1000px] mx-auto px-4 sm:px-6 py-12 md:py-16">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200/60 rounded-2xl p-6 sm:p-10 md:p-12 shadow-sm space-y-8"
        >
          {/* Hero */}
          <div className="space-y-4 border-b border-slate-100 pb-8 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto sm:mx-0">
              <Eye size={24} />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-primary break-words">
              {isEn ? 'Accessibility Statement' : 'Tilgjengelighetserklæring'}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {isEn 
                ? 'Last updated: May 23, 2026. Committed to providing a platform accessible to everyone.' 
                : 'Sist oppdatert: 23. mai 2026. Forpliktet til å levere en universelt utformet plattform for alle.'}
            </p>
          </div>

          {/* Core Commitments */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <div className="text-primary"><Zap size={18} /></div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
                {isEn ? 'WCAG 2.1 Compliance' : 'Følge WCAG 2.1'}
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                {isEn 
                  ? 'We actively build features in accordance with WCAG 2.1 level AA standards.' 
                  : 'Vi utvikler aktivt i tråd med standardene for WCAG 2.1 nivå AA.'}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <div className="text-primary"><CheckCircle size={18} /></div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
                {isEn ? 'Contrast & Fonts' : 'Kontrast og Skrift'}
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                {isEn 
                  ? 'Carefully chosen dark-blue color tones and flexible text sizing prevent strain.' 
                  : 'Nøye utvalgte kontraster og dynamisk tekstskalering hindrer synsbelastning.'}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <div className="text-primary"><HeartHandshake size={18} /></div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
                {isEn ? 'Inclusive Tech' : 'Inkluderende Teknologi'}
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                {isEn 
                  ? 'Optimized navigation flow for screen readers and keyboard navigation.' 
                  : 'Optimalisert navigasjonsflyt for skjermlesere og tastaturstyring.'}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6 pt-4 text-slate-700 leading-relaxed text-xs sm:text-sm font-medium">
            {isEn ? (
              <>
                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">1. Our Commitment</h2>
                  <p>
                    His Kingdom Prophets is dedicated to ensuring digital accessibility for people with disabilities. We are continuously improving the user experience for everyone and applying the relevant accessibility standards to make sure that our prophetic resources are accessible.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">2. Accessibility Standards</h2>
                  <p>
                    We target the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA requirements. Our features include high contrast support (such as our `#561291` primary brand color against light backgrounds), aria-labels for assistive screen readers, and robust semantic structures.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">3. Tested Technologies</h2>
                  <p>
                    The platform is designed to be compatible with modern web browsers, screen magnification software, and screen readers (such as VoiceOver and NVDA). Interactive elements like the CMS visual toggles and profile options are built to support focus styling.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">4. Feedback & Contact</h2>
                  <p>
                    We welcome your feedback on the accessibility of our platform. If you encounter any barriers or have difficulty using any feature, please submit a support ticket or email us at hiskingdomprophets@hiskingdomministry.no.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">1. Vår forpliktelse</h2>
                  <p>
                    His Kingdom Prophets er opptatt av å sikre digital tilgjengelighet for alle brukere. Vi forbedrer kontinuerlig brukeropplevelsen for alle og anvender de relevante tilgjengelighetsstandardene for å sikre at våre teologiske ressurser når ut til alle.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">2. Standarder for tilgjengelighet</h2>
                  <p>
                    Vi sikter mot å oppfylle kravene i Web Content Accessibility Guidelines (WCAG) 2.1 Nivå AA. Våre løsninger inkluderer gode fargekontraster (som vår `#561291` mørkeblå profilfarge mot lyse bakgrunner), aria-labels for skjermlesere og solid semantisk HTML-struktur.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">3. Kompatibel teknologi</h2>
                  <p>
                    Plattformen er utviklet for å fungere best mulig med moderne nettlesere, forstørrelsesprogramvare og skjermlesere (som VoiceOver og NVDA). Interaktive elementer som visuelle CMS-redigerere har tydelig fokusalternativ og kan styres via tastaturet.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">4. Tilbakemelding og kontakt</h2>
                  <p>
                    Vi setter pris på dine tilbakemeldinger angående tilgjengeligheten på nettstedet vårt. Dersom du opplever hindringer eller har forbedringsforslag, vennligst kontakt oss via support eller send en e-post til hiskingdomprophets@hiskingdomministry.no.
                  </p>
                </section>
              </>
            )}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 bg-[#240046] text-white/80 text-center text-xs mt-12 border-t border-white/10 font-medium">
        <p>© 2026 His Kingdom Prophets. All rights reserved.</p>
      </footer>
    </div>
  );
}
