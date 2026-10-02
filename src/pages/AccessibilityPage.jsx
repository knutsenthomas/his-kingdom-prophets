import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { Eye, ArrowLeft, Globe, Zap, CheckCircle, HeartHandshake } from 'lucide-react';
import logo from '@/assets/logo.png';
import CmsText from '@/components/CmsText';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function AccessibilityPage() {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useApp();

  const isEn = language === 'en';

  return (
    <div className="bg-[#F6F4F8] min-h-screen flex flex-col font-sans text-slate-800">
      {/* Header */}
      <SiteHeader />

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
            <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-primary break-words">
              <CmsText slug="accessibility-title" fallback={isEn ? 'Accessibility Statement' : 'Tilgjengelighetserklæring'} />
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              <CmsText slug="accessibility-updated" fallback={isEn ? 'Last updated: May 23, 2026. Committed to providing a platform accessible to everyone.' : 'Sist oppdatert: 23. mai 2026. Forpliktet til å levere en universelt utformet plattform for alle.'} />
            </p>
          </div>

          {/* Core Commitments */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <div className="text-primary"><Zap size={18} /></div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
                <CmsText slug="accessibility-wcag-title" fallback={isEn ? 'WCAG 2.1 Compliance' : 'Følge WCAG 2.1'} />
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                <CmsText slug="accessibility-wcag-desc" fallback={isEn ? 'We actively build features in accordance with WCAG 2.1 level AA standards.' : 'Vi utvikler aktivt i tråd med standardene for WCAG 2.1 nivå AA.'} />
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <div className="text-primary"><CheckCircle size={18} /></div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
                <CmsText slug="accessibility-contrast-title" fallback={isEn ? 'Contrast & Fonts' : 'Kontrast og Skrift'} />
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                <CmsText slug="accessibility-contrast-desc" fallback={isEn ? 'Carefully chosen dark-blue color tones and flexible text sizing prevent strain.' : 'Nøye utvalgte kontraster og dynamisk tekstskalering hindrer synsbelastning.'} />
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <div className="text-primary"><HeartHandshake size={18} /></div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
                <CmsText slug="accessibility-tech-title" fallback={isEn ? 'Inclusive Tech' : 'Inkluderende Teknologi'} />
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                <CmsText slug="accessibility-tech-desc" fallback={isEn ? 'Optimized navigation flow for screen readers and keyboard navigation.' : 'Optimalisert navigasjonsflyt for skjermlesere og tastaturstyring.'} />
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6 pt-4 text-slate-700 leading-relaxed text-xs sm:text-sm font-medium">
            <section className="space-y-3">
              <h2 className="font-sans text-lg sm:text-xl font-bold text-primary">
                <CmsText slug="accessibility-sec1-title" fallback={isEn ? '1. Our Commitment' : '1. Vår forpliktelse'} />
              </h2>
              <p>
                <CmsText slug="accessibility-sec1-desc" fallback={isEn ? 'His Kingdom Prophets is dedicated to ensuring digital accessibility for people with disabilities. We are continuously improving the user experience for everyone and applying the relevant accessibility standards to make sure that our prophetic resources are accessible.' : 'His Kingdom Prophets er opptatt av å sikre digital tilgjengelighet for alle brukere. Vi forbedrer kontinuerlig brukeropplevelsen for alle og anvender de relevante tilgjengelighetsstandardene for å sikre at våre teologiske ressurser når ut til alle.'} />
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-sans text-lg sm:text-xl font-bold text-primary">
                <CmsText slug="accessibility-sec2-title" fallback={isEn ? '2. Accessibility Standards' : '2. Standarder for tilgjengelighet'} />
              </h2>
              <p>
                <CmsText slug="accessibility-sec2-desc" fallback={isEn ? 'We target the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA requirements. Our features include high contrast support (such as our `#561291` primary brand color against light backgrounds), aria-labels for assistive screen readers, and robust semantic structures.' : 'Vi sikter mot å oppfylle kravene i Web Content Accessibility Guidelines (WCAG) 2.1 Nivå AA. Våre løsninger inkluderer gode fargekontraster (som vår `#561291` mørkeblå profilfarge mot lyse bakgrunner), aria-labels for skjermlesere og solid semantisk HTML-struktur.'} />
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-sans text-lg sm:text-xl font-bold text-primary">
                <CmsText slug="accessibility-sec3-title" fallback={isEn ? '3. Tested Technologies' : '3. Kompatibel teknologi'} />
              </h2>
              <p>
                <CmsText slug="accessibility-sec3-desc" fallback={isEn ? 'The platform is designed to be compatible with modern web browsers, screen magnification software, and screen readers (such as VoiceOver and NVDA). Interactive elements like the CMS visual toggles and profile options are built to support focus styling.' : 'Plattformen er utviklet for å fungere best mulig med moderne nettlesere, forstørrelsesprogramvare og skjermlesere (som VoiceOver og NVDA). Interaktive elementer som visuelle CMS-redigerere har tydelig fokusalternativ og kan styres via tastaturet.'} />
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-sans text-lg sm:text-xl font-bold text-primary">
                <CmsText slug="accessibility-sec4-title" fallback={isEn ? '4. Feedback & Contact' : '4. Tilbakemelding og kontakt'} />
              </h2>
              <p>
                <CmsText slug="accessibility-sec4-desc" fallback={isEn ? 'We welcome your feedback on the accessibility of our platform. If you encounter any barriers or have difficulty using any feature, please submit a support ticket or email us at hiskingdomprophets@hiskingdomministry.no.' : 'Vi setter pris på dine tilbakemeldinger angående tilgjengeligheten på nettstedet vårt. Dersom du opplever hindringer eller har forbedringsforslag, vennligst kontakt oss via support eller send en e-post til hiskingdomprophets@hiskingdomministry.no.'} />
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
