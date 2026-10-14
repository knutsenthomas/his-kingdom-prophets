import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Lock, Eye, FileText } from 'lucide-react';
import CmsText from '@/components/CmsText';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import SeoHead from '@/components/SeoHead';
import '@/styles/hkpc-redesign.css';
import '@/styles/legal-pages.css';

export default function PrivacyPolicyPage() {
  const { language } = useApp();

  const isEn = language === 'en';

  return (
    <div className="hkpc-landing legal-page min-h-screen flex flex-col">
      <SeoHead
        title={isEn ? "Privacy Policy (GDPR) | HKPC" : "Personvernerklæring (GDPR) | HKPC"}
        description={isEn 
          ? "Privacy Policy for His Kingdom Prophetic Community (HKPC). Read how we protect and process personal data in compliance with GDPR."
          : "Personvernerklæring for His Kingdom Prophetic Community (HKPC). Les hvordan vi behandler og sikrer personopplysninger i tråd med GDPR."}
        canonicalPath="/personvern"
        keywords="personvern HKPC, GDPR, personopplysninger, personvernerklæring bibelskole"
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": "https://hkpc.no/personvern#webpage",
              "url": "https://hkpc.no/personvern",
              "name": isEn ? "Privacy Policy" : "Personvernerklæring"
            },
            {
              "@type": "BreadcrumbList",
              "@id": "https://hkpc.no/personvern#breadcrumb",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Hjem",
                  "item": "https://hkpc.no/"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": isEn ? "Privacy Policy" : "Personvernerklæring",
                  "item": "https://hkpc.no/personvern"
                }
              ]
            }
          ]
        }}
      />
      {/* Header */}
      <SiteHeader />

      {/* Main Content */}
      <main className="legal-main flex-1">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="legal-content"
        >
          {/* Hero */}
          <div className="legal-hero">
            <Link to="/" className="legal-back"><ArrowLeft size={18} />{isEn ? 'Back to home' : 'Tilbake til forsiden'}</Link>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto sm:mx-0">
              <Shield size={24} />
            </div>
            <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-primary break-words">
              <CmsText slug="privacy-title" fallback={isEn ? 'Privacy Policy' : 'Personvernserklæring'} />
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              <CmsText slug="privacy-updated" fallback={isEn ? 'Last updated: October 14, 2026. Your privacy and security are paramount to us.' : 'Sist oppdatert: 14. oktober 2026. Ditt personvern og din sikkerhet er av største betydning for oss.'} />
            </p>
          </div>

          {/* Quick Summary Cards */}
          <div className="legal-summary">
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
                <CmsText slug="privacy-sharing-title" fallback={isEn ? 'Necessary sharing' : 'Nødvendig deling'} />
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                <CmsText slug="privacy-sharing-desc" fallback={isEn ? 'We do not sell your personal data. Necessary information is shared with His Kingdom Ministry and the service providers that operate the school and process payments.' : 'Vi selger ikke personopplysninger. Nødvendige opplysninger deles med His Kingdom Ministry og tjenesteleverandører som drifter skolen og behandler betalinger.'} />
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
          <div className="legal-details">
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
                <CmsText slug="privacy-sec2-desc" fallback={isEn ? 'Your data is used to customize your student portal, support mentorship discipling, calculate evaluations using the weighted grading system, deliver live session streaming, and manage community interactions in the prayer chat, and administer gifts and school payments.' : 'Dine opplysninger brukes til å tilpasse din studentportal, støtte mentorskap, beregne evalueringer ved hjelp av det vektede karaktersystemet, levere live-strømmer og administrere samtaler i bønnefellesskapet og behandle gaver og skolebetaling.'} />
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-sans text-lg sm:text-xl font-bold text-primary">
                <CmsText slug="privacy-sec3-title" fallback={isEn ? '3. Storage & Encryption' : '3. Datasikkerhet og kryptering'} />
              </h2>
              <p>
                <CmsText slug="privacy-sec3-desc" fallback={isEn ? 'We utilize enterprise-grade cloud architecture powered by Google Cloud Platform and Firebase with TLS encryption in transit and strict security rules. Authentication is handled seamlessly via Google, Apple ID, or passwordless email links. We never store passwords.' : 'Vi benytter sikker skyarkitektur levert av Google Cloud Platform og Firebase med kryptering under overføring (TLS) og strenge sikkerhetsregler. Autentisering håndteres sikkert via Google, Apple ID eller passordfrie e-postlenker. Vi lagrer aldri passord.'} />
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

            <section className="space-y-3" id="payments">
              <h2><CmsText slug="privacy-payments-title" fallback={isEn ? 'Payments and recurring agreements' : 'Betalinger og faste avtaler'} /></h2>
              <p><CmsText slug="privacy-payments-data" fallback={isEn ? 'For gifts and school payments, we process the name and email you provide, amount, currency, payment method, purpose, agreement and transaction references, payment status and dates. School payments may also be linked to the student account, school year and allocation between tuition and the registration fee. A message is stored if you choose to provide one.' : 'Ved gaver og skolebetaling behandler vi navn og e-post du oppgir, beløp, valuta, betalingsmåte, formål, avtale- og transaksjonsreferanser, betalingsstatus og datoer. Skolebetaling kan også knyttes til elevkonto, skoleår og fordeling mellom studieavgift og registreringsavgift. En hilsen lagres dersom du velger å oppgi den.'} /></p>
              <p><CmsText slug="privacy-payments-purpose" fallback={isEn ? 'His Kingdom Ministry processes payments for HKPC. We use this information to establish and administer the agreement you request, schedule recurring payments, verify payments and refunds, update student balances, provide support and maintain accounting records. Only verified payments are registered as received.' : 'His Kingdom Ministry behandler betalinger for HKPC. Opplysningene brukes til å opprette og administrere avtalen du ber om, planlegge faste trekk, kontrollere betalinger og refusjoner, oppdatere elevens betalingsoversikt, gi kundestøtte og dokumentere regnskapet. Bare bekreftede betalinger registreres som mottatt.'} /></p>
              <p><CmsText slug="privacy-payments-providers" fallback={isEn ? 'Depending on your chosen payment method, necessary payment information is exchanged with Vipps MobilePay, Stripe or PayPal. They process payment credentials under their own privacy notices. We store agreement and transaction references, not full card numbers or security codes. Agreement and payment records are stored in the payment backend on Google Cloud/Firebase.' : 'Avhengig av valgt betalingsmåte utveksles nødvendige betalingsopplysninger med Vipps MobilePay, Stripe eller PayPal. Betalingsleverandørene behandler betalingsmiddelet etter sine egne personvernerklæringer. Vi lagrer avtale- og transaksjonsreferanser, ikke fullstendige kortnumre eller sikkerhetskoder. Avtale- og betalingsopplysninger lagres i betalingssystemet på Google Cloud/Firebase.'} /></p>
              <p><CmsText slug="privacy-payments-cancellation" fallback={isEn ? 'Recurring gifts continue until you cancel; school plans have at most ten instalments. You can cancel a Vipps agreement in Vipps or through its management link. Cancelling stops future payments, but does not automatically delete earlier transaction records or settle outstanding tuition. Information is retained for agreement administration and as required for accounting and legal claims. Contact us to request access, correction or deletion; accounting obligations may limit deletion.' : 'Faste gaver fortsetter til du sier opp; skoleavtaler har maksimalt ti terminer. Vipps-avtaler kan avsluttes i Vipps eller via avtalens administrasjonslenke. Oppsigelse stopper kommende trekk, men sletter ikke automatisk tidligere transaksjoner eller gjør opp ubetalt skoleavgift. Opplysningene oppbevares for administrasjon av avtalen og så lenge det er nødvendig for regnskap og rettslige krav. Kontakt oss for innsyn, retting eller sletting; regnskapsplikter kan begrense retten til sletting.'} /></p>
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
