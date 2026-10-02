import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Globe, Lock, Eye, FileText } from 'lucide-react';
import logo from '@/assets/logo.png';
import CmsText from '@/components/CmsText';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function PrivacyPolicyPage() {
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
              <Shield size={24} />
            </div>
            <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-primary break-words">
              <CmsText slug="privacy-title" fallback={isEn ? 'Privacy Policy' : 'Personvernserklæring'} />
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              <CmsText slug="privacy-updated" fallback={isEn ? 'Last updated: October 2026. Your privacy and security are paramount to us.' : 'Sist oppdatert: Oktober 2026. Ditt personvern og din sikkerhet er av største betydning for oss.'} />
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
                <CmsText slug="privacy-secure-desc" fallback={isEn ? 'All profile, course, and community data is stored on enterprise-grade servers powered by Google Cloud & Firebase.' : 'Alle profil-, kurs- og fellesskapsdata lagres på sikre servere levert av Google Cloud & Firebase.'} />
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
              <h2 className="font-sans text-lg sm:text-xl font-bold text-primary">
                <CmsText slug="privacy-sec1-title" fallback={isEn ? '1. Overview of Data We Collect' : '1. Hvilke opplysninger vi samler inn'} />
              </h2>
              <p>
                <CmsText slug="privacy-sec1-desc" fallback={isEn ? 'We collect personal information necessary to deliver our academic services and prophetic equipping. This includes your name, email, role selection, courses registered, assignment answers, and spiritual profiles that you fill out as a student or mentor.' : 'Vi samler inn personopplysninger som er nødvendige for å levere våre utdannings- og utrustningstjenester. Dette inkluderer navn, e-post, rollevalg, registrerte kurs, innleverte oppgaver og åndelige profiler som du fyller ut som student eller mentor.'} />
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-sans text-lg sm:text-xl font-bold text-primary">
                <CmsText slug="privacy-sec2-title" fallback={isEn ? '2. How We Use Your Information' : '2. Hvordan vi bruker opplysningene'} />
              </h2>
              <p>
                <CmsText slug="privacy-sec2-desc" fallback={isEn ? 'Your data is solely used to customize your student portal, support mentorship discipling, calculate evaluations using the weighted grading system, deliver live session streaming, and manage community interactions in the prayer chat.' : 'Dine opplysninger brukes utelukkende til å tilpasse din studentportal, støtte mentorskap, beregne evalueringer ved hjelp av det vektede karaktersystemet, levere live-strømmer og administrere samtaler i bønnefellesskapet.'} />
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-sans text-lg sm:text-xl font-bold text-primary">
                <CmsText slug="privacy-sec3-title" fallback={isEn ? '3. Storage & Encryption' : '3. Dataselgersikkerhet og kryptering'} />
              </h2>
              <p>
                <CmsText slug="privacy-sec3-desc" fallback={isEn ? 'We utilize enterprise-grade cloud architecture powered by Google Cloud Platform and Firebase with end-to-end TLS encryption and strict security rules. Authentication is handled seamlessly via Google, Apple ID, or passwordless email links. We never store passwords.' : 'Vi benytter sikker skyarkitektur levert av Google Cloud Platform og Firebase med ende-til-ende TLS-kryptering og strenge sikkerhetsregler. Autentisering håndteres sikkert via Google, Apple ID eller passordfrie e-postlenker. Vi lagrer aldri passord.'} />
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-sans text-lg sm:text-xl font-bold text-primary">
                <CmsText slug="privacy-sec4-title" fallback={isEn ? '4. Cookies & Analytics' : '4. Informasjonskapsler (Cookies) og Analyse'} />
              </h2>
              <p>
                <CmsText slug="privacy-sec4-desc" fallback={isEn ? 'Our site uses cookies to ensure stable logins and authenticate users. Analytics are gathered using Google Analytics 4 (GA4) under explicit consent rules, ensuring no personal identifiers are tracked without authorization.' : 'Vår plattform bruker informasjonskapsler for å sikre stabil innlogging. Analyse utføres via Google Analytics 4 (GA4) under eksplisitt samtykke, noe som garanterer at ingen personlige identifikatorer spores uten autorisasjon.'} />
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-sans text-lg sm:text-xl font-bold text-primary">
                <CmsText slug="privacy-sec5-title" fallback={isEn ? '5. Contact Information' : '5. Kontaktinformasjon'} />
              </h2>
              <p>
                <CmsText slug="privacy-sec5-desc" fallback={isEn ? 'If you have questions, wish to access your stored data, or request permanent deletion of your profile under GDPR guidelines, please contact us at school@hiskingdomministry.no or post@hiskingdomministry.no.' : 'Dersom du har spørsmål, ønsker innsyn i dine lagrede data, eller ber om sletting av profilen din i henhold til GDPR, vennligst kontakt oss på school@hiskingdomministry.no eller post@hiskingdomministry.no.'} />
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
