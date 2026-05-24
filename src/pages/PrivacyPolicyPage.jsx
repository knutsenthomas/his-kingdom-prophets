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
              {isEn ? 'Privacy Policy' : 'Personvernserklæring'}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {isEn 
                ? 'Last updated: May 23, 2026. Your privacy and security are paramount to us.' 
                : 'Sist oppdatert: 23. mai 2026. Ditt personvern og din sikkerhet er av største betydning for oss.'}
            </p>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <div className="text-primary"><Lock size={18} /></div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
                {isEn ? 'Secure Data' : 'Sikker Lagring'}
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                {isEn 
                  ? 'All spiritual and profile data is stored on highly secure servers using Supabase.' 
                  : 'Alle åndelige- og profildata lagres på svært sikre servere ved bruk av Supabase.'}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <div className="text-primary"><Eye size={18} /></div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
                {isEn ? 'No Third-Party Sharing' : 'Ingen Tredjepartsdeling'}
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                {isEn 
                  ? 'We never sell or distribute your personal or theological data to outside networks.' 
                  : 'Vi selger eller distribuerer aldri dine personlige eller teologiske data til eksterne.'}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <div className="text-primary"><FileText size={18} /></div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
                {isEn ? 'Your Rights' : 'Dine Rettigheter'}
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                {isEn 
                  ? 'You have complete access to request deletion or modification of your data at any time.' 
                  : 'Du har full tilgang til å be om sletting eller endring av dine data når som helst.'}
              </p>
            </div>
          </div>

          {/* Detailed sections */}
          <div className="space-y-6 pt-4 text-slate-700 leading-relaxed text-xs sm:text-sm font-medium">
            {isEn ? (
              <>
                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">1. Overview of Data We Collect</h2>
                  <p>
                    We collect personal information necessary to deliver our academic services and prophetic equipping. This includes your name, email, role selection, courses registered, assignment answers, and spiritual profiles that you fill out as a student or mentor.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">2. How We Use Your Information</h2>
                  <p>
                    Your data is solely used to customize your student portal, support mentorship discipling, calculate evaluations using the weighted grading system, deliver live session streaming, and manage community interactions in the prayer chat.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">3. Storage & Encryption</h2>
                  <p>
                    We utilize enterprise-grade servers powered by Supabase with modern TLS encryption in transit and secure database access rules. Access to student prophetic profiles and development charts is strictly restricted to authorized mentors.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">4. Cookies & Analytics</h2>
                  <p>
                    Our site uses cookies to ensure stable logins and authenticate users. Analytics are gathered using Google Analytics 4 (GA4) under explicit consent rules, ensuring no personal identifiers are tracked without authorization.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">5. Contact Information</h2>
                  <p>
                    If you have any questions, wish to access your stored data, or request permanent deletion of your profile under GDPR guidelines, please contact us at hiskingdomprophets@hiskingdomministry.no.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">1. Hvilke opplysninger vi samler inn</h2>
                  <p>
                    Vi samler inn personopplysninger som er nødvendige for å levere våre utdannings- og utrustningstjenester. Dette inkluderer navn, e-post, rollevalg, registrerte kurs, innleverte oppgaver og åndelige profiler som du fyller ut som student eller mentor.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">2. Hvordan vi bruker opplysningene</h2>
                  <p>
                    Dine opplysninger brukes utelukkende til å tilpasse din studentportal, støtte mentorskap, beregne evalueringer ved hjelp av det vektede karaktersystemet, levere live-strømmer og administrere samtaler i bønnefellesskapet.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">3. Dataselgersikkerhet og kryptering</h2>
                  <p>
                    Vi benytter datasikkerhet levert av Supabase med moderne TLS-kryptering under overføring og strenge tilgangsregler. Tilgang til studentenes profilerte åpenbaringer og evalueringer er strengt begrenset til autoriserte mentorer.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">4. Informasjonskapsler (Cookies) og Analyse</h2>
                  <p>
                    Vår plattform bruker informasjonskapsler for å sikre stabil innlogging. Analyse utføres via Google Analytics 4 (GA4) under eksplisitt samtykke, noe som garanterer at ingen personlige identifikatorer spores uten autorisasjon.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">5. Kontaktinformasjon</h2>
                  <p>
                    Dersom du har spørsmål, ønsker innsyn i dine lagrede data, eller ber om permanent sletting av profilen din i henhold til GDPR-retningslinjene, vennligst kontakt oss på hiskingdomprophets@hiskingdomministry.no.
                  </p>
                </section>
              </>
            )}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 bg-[#561291] text-white/80 text-center text-xs mt-12 border-t border-slate-700/30 font-medium">
        <p>© 2026 His Kingdom Prophets. All rights reserved.</p>
      </footer>
    </div>
  );
}
