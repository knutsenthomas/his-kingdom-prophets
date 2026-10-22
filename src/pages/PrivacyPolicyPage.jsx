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
              {isEn ? 'Last updated: October 22, 2026.' : 'Sist oppdatert: 22. oktober 2026.'}
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
              <p>{isEn ? 'His Kingdom Ministry is responsible for the website. Necessary storage supports login, security and features you request. Optional visitor analytics from Google Analytics (Google Ireland Limited) and Vercel Web Analytics (Vercel Inc.) only starts after you actively consent. We do not enable advertising cookies through this banner.' : 'His Kingdom Ministry er ansvarlig for nettsiden. Nødvendig lagring støtter innlogging, sikkerhet og funksjoner du ber om. Valgfri besøksanalyse fra Google Analytics (Google Ireland Limited) og Vercel Web Analytics (Vercel Inc.) starter først etter ditt aktive samtykke. Vi aktiverer ikke reklamekapsler gjennom dette banneret.'}</p>
              <p>{isEn ? 'The legal basis for optional analytics is consent under GDPR Article 6(1)(a) and the Norwegian Electronic Communications Act section 3-15. Rejecting does not prevent use of the website. You can withdraw or change consent at any time using Cookie settings. Withdrawal stops future analytics; it does not automatically delete previously collected data. Contact school@hiskingdomministry.no for privacy requests.' : 'Grunnlaget for valgfri analyse er samtykke etter GDPR artikkel 6 nr. 1 bokstav a og ekomloven § 3-15. Avslag hindrer ikke bruk av nettsiden. Du kan når som helst trekke tilbake eller endre samtykket via Informasjonskapsler. Tilbaketrekking stopper videre analyse, men sletter ikke automatisk tidligere innsamlede data. Kontakt school@hiskingdomministry.no for personvernforespørsler.'}</p>
              <div className="overflow-x-auto"><table className="w-full text-sm text-left border-collapse"><thead><tr><th className="p-3 border-b">{isEn ? 'Storage / service' : 'Lagring / tjeneste'}</th><th className="p-3 border-b">{isEn ? 'Purpose and duration' : 'Formål og varighet'}</th></tr></thead><tbody>
                <tr><td className="p-3 border-b">hkpc-cookie-consent-v2</td><td className="p-3 border-b">{isEn ? 'Local storage: choice, time and notice version, for 180 days. Necessary to remember your consent choice.' : 'Lokal lagring: valg, tidspunkt og informasjonsversjon i 180 dager. Nødvendig for å huske samtykkevalget.'}</td></tr>
                <tr><td className="p-3 border-b">_ga, _ga_*</td><td className="p-3 border-b">{isEn ? 'Optional Google Analytics cookies for distinguishing browsers and sessions. Configured for up to 180 days, subject to browser limits; removed on withdrawal where accessible on this domain.' : 'Valgfrie Google Analytics-kapsler for å skille nettlesere og økter. Satt til opptil 180 dager, begrenset av nettleseren; fjernes ved tilbaketrekking der de er tilgjengelige på dette domenet.'}</td></tr>
                <tr><td className="p-3 border-b">Vercel Web Analytics</td><td className="p-3 border-b">{isEn ? 'Optional aggregated visitor statistics without analytics cookies. Enabled only with analytics consent on this website.' : 'Valgfri samlet besøksstatistikk uten analysekapsler. Aktiveres bare ved analysesamtykke på denne nettsiden.'}</td></tr>
                <tr><td className="p-3 border-b">Firebase / hkm-language</td><td className="p-3 border-b">{isEn ? 'Login state and your selected language, where these features are used. Login persists until sign-out or expiry; language remains until changed or browser storage is cleared.' : 'Innloggingsstatus og ditt valgte språk der funksjonene brukes. Innlogging beholdes til utlogging eller utløp; språk beholdes til det endres eller nettleserlagring slettes.'}</td></tr>
              </tbody></table></div>
              <p>{isEn ? 'Analytics on public information pages is limited to page paths without query parameters or fragments. Payment, application, account and administration pages are excluded from our analytics integration. Hosting still processes technical requests to deliver and secure the service.' : 'Analyse på offentlige informasjonssider begrenses til sidestier uten spørringsparametere eller fragmenter. Betalings-, søknads-, konto- og administrasjonssider er utelatt fra vår analyseintegrasjon. Hosting behandler fortsatt tekniske forespørsler for å levere og sikre tjenesten.'}</p>
              <p>{isEn ? 'Google and Vercel may process data outside the EEA. Their processor terms and applicable transfer mechanisms must cover this processing. More information:' : 'Google og Vercel kan behandle data utenfor EØS. Behandlingen må være dekket av deres databehandlervilkår og gyldige overføringsgrunnlag. Mer informasjon:'} <a href="https://policies.google.com/privacy" className="underline">Google</a> · <a href="https://vercel.com/docs/analytics/privacy-policy" className="underline">Vercel Web Analytics</a>.</p>
              <button type="button" onClick={() => window.dispatchEvent(new Event('hkpc-cookie-settings'))} className="min-h-11 px-4 py-2 border border-purple-800 rounded-xl text-purple-900 font-semibold">{isEn ? 'Change or withdraw consent' : 'Endre eller trekk tilbake samtykke'}</button>
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
            <section id="video-progress" className="space-y-3">
              <h2>{isEn ? 'Video viewing and learning progress' : 'Videovisning og studieprogresjon'}</h2>
              <p>{isEn ? 'When you play a teaching recording in the updated HKP Community app, we store your user ID, name, recording ID, played sections, percentage watched and the time of your last recorded viewing. Your progress is visible to you and authorised school teachers and administrators for educational follow-up. Other students cannot see it. This is separate from website traffic analytics.' : 'Når du spiller av et undervisningsopptak i den oppdaterte HKP Community-appen, lagrer vi bruker-ID, navn, opptaks-ID, avspilte deler, sett prosent og tidspunkt for sist registrerte visning. Progresjonen er tilgjengelig for deg og skolens autoriserte lærere og administratorer for oppfølging av undervisningen. Andre elever kan ikke se den. Dette er adskilt fra besøksanalyse på nettsiden.'}</p>
              <p>{isEn ? 'A recording is marked completed after at least 90% has been played. This does not confirm attention, learning outcomes or formal attendance. Playback outside the app is not recorded here. Previous viewing cannot be reconstructed. Progress is stored with your school account; contact us to request access, correction or deletion as described below.' : 'Et opptak markeres som fullført når minst 90 % er avspilt. Dette bekrefter ikke oppmerksomhet, læringsutbytte eller formelt oppmøte. Avspilling utenfor appen registreres ikke her. Tidligere visninger kan ikke rekonstrueres. Progresjonen lagres med skolekontoen din; kontakt oss for innsyn, retting eller sletting som beskrevet nedenfor.'}</p>
            </section>
            <section id="delete-account" className="space-y-3" style={{ scrollMarginTop: '110px' }}>
              <h2>{isEn ? 'Delete your HKP Community account and data' : 'Slett HKP Community-kontoen og dine data'}</h2>
              <p>{isEn ? 'You can request deletion without reinstalling the app. Email school@hiskingdomministry.no from the email address linked to your account, with the subject “Delete HKP Community account”. Do not include your password.' : 'Du kan be om sletting uten å installere appen på nytt. Send e-post til school@hiskingdomministry.no fra e-postadressen som er knyttet til kontoen, med emnet «Slett HKP Community-konto». Ikke oppgi passordet ditt.'}</p>
              <p><a href="mailto:school@hiskingdomministry.no?subject=Slett%20HKP%20Community-konto">{isEn ? 'Request account deletion by email' : 'Be om sletting av konto på e-post'}</a></p>
              <p>{isEn ? 'The request covers your HKP Community profile and associated personal data, including contact details, uploaded files, submissions, study notes and community content. You can also request deletion of specific data while keeping your account. Support may need to verify your identity before processing the request.' : 'Forespørselen gjelder HKP Community-profilen og tilknyttede personopplysninger, inkludert kontaktopplysninger, opplastede filer, innleveringer, studienotater og innhold i fellesskapet. Du kan også be om sletting av bestemte data og beholde kontoen. Kundestøtte kan måtte bekrefte identiteten din før forespørselen behandles.'}</p>
              <p>{isEn ? 'Tell us whether you also want to delete the shared His Kingdom Ministry login used for other HKM services. Deleting the HKPC profile does not itself cancel payment agreements. Contact support about any active agreements.' : 'Oppgi om du også ønsker å slette den felles His Kingdom Ministry-innloggingen som brukes i andre HKM-tjenester. Sletting av HKPC-profilen avslutter ikke i seg selv betalingsavtaler. Kontakt kundestøtte om aktive avtaler.'}</p>
              <p>{isEn ? 'Accounting records, payment documentation and information that must be retained for legal obligations or claims may be kept for the required period. Support will explain any exceptions and applicable retention periods when handling your request, and confirm when processing is complete.' : 'Regnskapsopplysninger, betalingsdokumentasjon og opplysninger som må beholdes for lovpålagte plikter eller rettslige krav, kan oppbevares i den nødvendige perioden. Kundestøtte opplyser om eventuelle unntak og aktuelle lagringsperioder når forespørselen behandles, og bekrefter når behandlingen er fullført.'}</p>
            </section>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
