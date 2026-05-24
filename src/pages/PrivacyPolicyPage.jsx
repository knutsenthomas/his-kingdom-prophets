import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Globe, Lock, Eye, FileText } from 'lucide-react';
import logo from '@/assets/logo.png';
import CmsText from '@/components/CmsText';

export default function PrivacyPolicyPage() {
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
              <Shield size={24} />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-primary break-words">
              <CmsText slug="privacy-title" fallback={isEn ? 'Privacy Policy' : 'Personvernserklæring'} />
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              <CmsText slug="privacy-updated" fallback={isEn ? 'Last updated: May 23, 2026. Your privacy and security are paramount to us.' : 'Sist oppdatert: 23. mai 2026. Ditt personvern og din sikkerhet er av største betydning for oss.'} />
            </p>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <div className="text-primary"><Lock size={18} /></div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
                <CmsText slug="privacy-secure-title" fallback={isEn ? 'Secure Data' : 'Sikker Lagring'} />
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                <CmsText slug="privacy-secure-desc" fallback={isEn ? 'All spiritual and profile data is stored on highly secure servers using Supabase.' : 'Alle åndelige- og profildata lagres på svært sikre servere ved bruk av Supabase.'} />
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <div className="text-primary"><Eye size={18} /></div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
                <CmsText slug="privacy-sharing-title" fallback={isEn ? 'No Third-Party Sharing' : 'Ingen Tredjepartsdeling'} />
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                <CmsText slug="privacy-sharing-desc" fallback={isEn ? 'We never sell or distribute your personal or theological data to outside networks.' : 'Vi selger eller distribuerer aldri dine personlige eller teologiske data til eksterne.'} />
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <div className="text-primary"><FileText size={18} /></div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
                <CmsText slug="privacy-rights-title" fallback={isEn ? 'Your Rights' : 'Dine Rettigheter'} />
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                <CmsText slug="privacy-rights-desc" fallback={isEn ? 'You have complete access to request deletion or modification of your data at any time.' : 'Du har full tilgang til å be om sletting eller endring av dine data når som helst.'} />
              </p>
            </div>
          </div>

          {/* Detailed sections */}
          <div className="space-y-6 pt-4 text-slate-700 leading-relaxed text-xs sm:text-sm font-medium">
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">
                <CmsText slug="privacy-sec1-title" fallback={isEn ? '1. Overview of Data We Collect' : '1. Hvilke opplysninger vi samler inn'} />
              </h2>
              <p>
                <CmsText slug="privacy-sec1-desc" fallback={isEn ? 'We collect personal information necessary to deliver our academic services and prophetic equipping. This includes your name, email, role selection, courses registered, assignment answers, and spiritual profiles that you fill out as a student or mentor.' : 'Vi samler inn personopplysninger som er nødvendige for å levere våre utdannings- og utrustningstjenester. Dette inkluderer navn, e-post, rollevalg, registrerte kurs, innleverte oppgaver og åndelige profiler som du fyller ut som student eller mentor.'} />
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">
                <CmsText slug="privacy-sec2-title" fallback={isEn ? '2. How We Use Your Information' : '2. Hvordan vi bruker opplysningene'} />
              </h2>
              <p>
                <CmsText slug="privacy-sec2-desc" fallback={isEn ? 'Your data is solely used to customize your student portal, support mentorship discipling, calculate evaluations using the weighted grading system, deliver live session streaming, and manage community interactions in the prayer chat.' : 'Dine opplysninger brukes utelukkende til å tilpasse din studentportal, støtte mentorskap, beregne evalueringer ved hjelp av det vektede karaktersystemet, levere live-strømmer og administrere samtaler i bønnefellesskapet.'} />
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">
                <CmsText slug="privacy-sec3-title" fallback={isEn ? '3. Storage & Encryption' : '3. Dataselgersikkerhet og kryptering'} />
              </h2>
              <p>
                <CmsText slug="privacy-sec3-desc" fallback={isEn ? 'We utilize enterprise-grade servers powered by Supabase with modern TLS encryption in transit and secure database access rules. Access to student prophetic profiles and development charts is strictly restricted to authorized mentors.' : 'Vi benytter datasikkerhet levert av Supabase med moderne TLS-kryptering under overføring og strenge tilgangsregler. Tilgang til studentenes profilerte åpenbaringer og evalueringer er strengt begrenset til autoriserte mentorer.'} />
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">
                <CmsText slug="privacy-sec4-title" fallback={isEn ? '4. Cookies & Analytics' : '4. Informasjonskapsler (Cookies) og Analyse'} />
              </h2>
              <p>
                <CmsText slug="privacy-sec4-desc" fallback={isEn ? 'Our site uses cookies to ensure stable logins and authenticate users. Analytics are gathered using Google Analytics 4 (GA4) under explicit consent rules, ensuring no personal identifiers are tracked without authorization.' : 'Vår plattform bruker informasjonskapsler for å sikre stabil innlogging. Analyse utføres via Google Analytics 4 (GA4) under eksplisitt samtykke, noe som garanterer at ingen personlige identifikatorer spores uten autorisasjon.'} />
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">
                <CmsText slug="privacy-sec5-title" fallback={isEn ? '5. Contact Information' : '5. Kontaktinformasjon'} />
              </h2>
              <p>
                <CmsText slug="privacy-sec5-desc" fallback={isEn ? 'If you have any questions, wish to access your stored data, or request permanent deletion of your profile under GDPR guidelines, please contact us at hiskingdomprophets@hiskingdomministry.no.' : 'Dersom du hopopplever spørsmål, ønsker innsyn i dine lagrede data, eller ber om permanent sletting av profilen din i henhold til GDPR-retningslinjene, vennligst kontakt oss på hiskingdomprophets@hiskingdomministry.no.'} />
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-6 flex flex-col md:flex-row justify-between items-center gap-6 bg-[#240046] text-white select-none shrink-0 border-t border-white/5 font-medium">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <div className="font-serif text-lg font-bold text-[#e0aaff]">
            <CmsText slug="landing-footer-title" fallback="His Kingdom Prophets" />
          </div>
          <p className="text-[10px] text-slate-300 opacity-80 max-w-md">
            <CmsText slug="landing-footer-copyright" fallback={isEn ? "© 2026 His Kingdom Prophets. All rights reserved. Equipping prophetic ministries for the church." : "© 2026 His Kingdom Prophets. Alle rettigheter reservert. Utrustning av profetiske tjenester for menigheten."} />
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-[#e0aaff]">
          <button onClick={() => navigate('/privacy')} className="hover:text-white transition-opacity">
            <CmsText slug="landing-footer-link-privacy" fallback={isEn ? "Privacy Policy" : "Personvern"} />
          </button>
          <button onClick={() => navigate('/terms')} className="hover:text-white transition-opacity">
            <CmsText slug="landing-footer-link-terms" fallback={isEn ? "Terms of Service" : "Betingelser"} />
          </button>
          <button onClick={() => navigate('/accessibility')} className="hover:text-white transition-opacity">
            <CmsText slug="landing-footer-link-accessibility" fallback={isEn ? "Accessibility" : "Tilgjengelighet"} />
          </button>
          <button onClick={() => navigate('/support')} className="hover:text-white transition-opacity">
            <CmsText slug="landing-footer-link-support" fallback={isEn ? "Contact Support" : "Kontakt Support"} />
          </button>
        </nav>
      </footer>
    </div>
  );
}
