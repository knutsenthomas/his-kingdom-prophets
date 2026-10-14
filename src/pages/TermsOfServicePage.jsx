import SiteText from '@/components/SiteText';
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { Scale, ArrowLeft, HelpCircle, AlertOctagon, UserPlus } from 'lucide-react';
import CmsText from '@/components/CmsText';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import SeoHead from '@/components/SeoHead';
import '@/styles/hkpc-redesign.css';
import '@/styles/legal-pages.css';

export default function TermsOfServicePage() {
  const { language } = useApp();

  const isEn = language === 'en';

  return (
    <div className="hkpc-landing legal-page min-h-screen flex flex-col">
      <SeoHead
        title={isEn ? "Terms of Service | HKPC" : "Brukervilkår & Betingelser | HKPC"}
        description={isEn 
          ? "Terms of Service and conditions of enrollment for His Kingdom Prophetic Community (HKPC)."
          : "Brukervilkår og avtalevilkår for studenter og brukere av His Kingdom Prophetic Community (HKPC)."}
        canonicalPath="/terms"
        keywords="vilkår HKPC, terms of service bibelskole, betingelser, studieavtale"
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": "https://hkpc.no/terms#webpage",
              "url": "https://hkpc.no/terms",
              "name": isEn ? "Terms of Service" : "Brukervilkår"
            },
            {
              "@type": "BreadcrumbList",
              "@id": "https://hkpc.no/terms#breadcrumb",
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
                  "name": isEn ? "Terms of Service" : "Brukervilkår",
                  "item": "https://hkpc.no/terms"
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
              <Scale size={24} />
            </div>
            <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-primary break-words">
              <CmsText slug="terms-title" fallback={isEn ? 'Terms of Service' : 'Vilkår og Betingelser'} />
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              <CmsText slug="terms-updated" fallback={isEn ? 'Last updated: October 14, 2026. Please read these terms carefully before accessing our platform.' : 'Sist oppdatert: 14. oktober 2026. Vennligst les disse vilkårene nøye før du tar plattformen i bruk.'} />
            </p>
          </div>

          {/* Key Terms Summarized */}
          <div className="legal-summary">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <div className="text-primary"><UserPlus size={18} /></div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
                <CmsText slug="terms-security-title" fallback={isEn ? 'Account Responsibility' : 'Kontosikkerhet'} />
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                <CmsText slug="terms-security-desc" fallback={isEn ? 'Keep login credentials secure. You are fully responsible for your profile actions.' : 'Hold innloggingsdetaljer sikre. Du er selv fullt ut ansvarlig for alle handlinger på profilen din.'} />
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <div className="text-primary"><AlertOctagon size={18} /></div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
                <CmsText slug="terms-conduct-title" fallback={isEn ? 'Ethical Conduct' : 'Etisk Oppførsel'} />
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                <CmsText slug="terms-conduct-desc" fallback={isEn ? 'We demand high integrity, ethical prophetic practice, and mutual respect in chat rooms.' : 'Vi krever høy åndelig integritet, etisk profetisk praksis og gjensidig respekt i våre fellesskap.'} />
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <div className="text-primary"><HelpCircle size={18} /></div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
                <CmsText slug="terms-copyright-title" fallback={isEn ? 'Prophetic Integrity' : 'Opphavsrett'} />
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                <CmsText slug="terms-copyright-desc" fallback={isEn ? 'All educational material and study guides are proprietary property.' : 'Alt studiemateriell og faghefter er beskyttet opphavsrettslig åndsverk tilhørende skolen.'} />
              </p>
            </div>
          </div>

          <section className="legal-payments" id="payments">
            <h2 className="text-xl font-bold text-primary"><SiteText fallback={isEn ? 'School payments and monthly gifts' : 'Skolebetaling og faste gaver'} /></h2>
            <p><SiteText fallback={isEn ? 'School fees are NOK 10,000 per year. The monthly agreement consists of 10 payments of NOK 1,000 and ends automatically after 10 paid instalments. The NOK 1,000 registration fee covers NOK 500 for administration and NOK 500 for meals and accommodation at kickoff. It may be paid separately or included in the monthly plan, making 10 payments of NOK 1,100. Any registered payment of this fee is deducted before the plan is created.' : 'Studieavgiften er 10 000 kr per år. Den månedlige avtalen består av 10 trekk à 1 000 kr. Avtalen avsluttes automatisk etter 10 betalte terminer. Registreringsavgiften på 1 000 kr dekker 500 kr for administrasjon og 500 kr for kost og losji på kickoff. Den kan betales separat eller inkluderes i den månedlige avtalen, slik at det blir 10 trekk à 1 100 kr. Registrert betaling av avgiften trekkes fra før avtalen opprettes.'} /></p>
            <p><SiteText fallback={isEn ? 'Monthly gifts have no maximum number of payments and continue until you cancel. Contact school@hiskingdomministry.no to change or cancel your agreement. PayPal agreements can also be cancelled in PayPal. Cancelling payments does not itself cancel the study agreement; outstanding tuition must be resolved with the school.' : 'Faste månedlige gaver har ingen grense for antall trekk og fortsetter til du avslutter avtalen. Kontakt school@hiskingdomministry.no for å endre eller avslutte avtalen. PayPal-avtaler kan også avsluttes i PayPal. Avslutning av trekk endrer ikke i seg selv studieavtalen; ubetalte skoleterminer avklares med skolen.'} /></p>
            <p><SiteText fallback={isEn ? 'Payments are processed by His Kingdom Ministry through Vipps, Stripe or PayPal. With Vipps, the first payment is due at least two days after approval; subsequent payments are monthly. With card or PayPal, the first payment is initiated during setup. An approved agreement is not itself a completed payment. Recurring Vipps agreements are approved in Vipps and can be cancelled in Vipps or through the agreement management link. Each payment is registered after confirmation from the payment provider. Bank transfers are registered when received.' : 'Betalingene behandles av His Kingdom Ministry via Vipps, Stripe eller PayPal. Med Vipps skjer første trekk tidligst to dager etter godkjenning; senere trekk skjer månedlig. Med kort eller PayPal startes første betaling ved opprettelse. En godkjent avtale er ikke i seg selv en gjennomført betaling. Faste Vipps-avtaler godkjennes i Vipps og kan avsluttes i Vipps eller via avtalens administrasjonslenke. Hver betaling registreres etter bekreftelse fra betalingstjenesten. Bankoverføringer registreres når de er mottatt.'} /></p>
          </section>

          {/* Terms content */}
          <div className="legal-details">
            <section className="space-y-3">
              <h2 className="font-sans text-lg sm:text-xl font-bold text-primary">
                <CmsText slug="terms-sec1-title" fallback={isEn ? '1. Acceptable Use' : '1. Akseptabel bruk'} />
              </h2>
              <p>
                <CmsText slug="terms-sec1-desc" fallback={isEn ? 'By registering as a student or faglærer on His Kingdom Prophets, you agree to access educational tools exclusively for spiritual growth and theological discipling. Disruption, harassment, or unauthorized copying of resources is strictly prohibited.' : 'Ved å registrere deg som student eller mentor på His Kingdom Prophets, samtykker du i å bruke plattformens verktøy utelukkende til teologisk opplæring og åndelig vekst. Forstyrrelser, trakassering eller uautorisert kopiering av ressurser er strengt forbudt.'} />
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-sans text-lg sm:text-xl font-bold text-primary">
                <CmsText slug="terms-sec2-title" fallback={isEn ? '2. User Account Security' : '2. Kontosikkerhet'} />
              </h2>
              <p>
                <CmsText slug="terms-sec2-desc" fallback={isEn ? 'Users must provide authentic names and emails when setting up credentials. Sharing profile access or study credentials with unregistered students is a breach of security and can lead to suspension.' : 'Brukere må oppgi sanne opplysninger under profilering. Å dele kontotilgang eller studierettigheter med uregistrerte eksterne personer regnes som sikkerhetsbrudd og kan føre til suspensjon av konto.'} />
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-sans text-lg sm:text-xl font-bold text-primary">
                <CmsText slug="terms-sec3-title" fallback={isEn ? '3. Intellectuel Property' : '3. Opphavsrett og Åndsverk'} />
              </h2>
              <p>
                <CmsText slug="terms-sec3-desc" fallback={isEn ? 'All study guides, weighted grading structures, courses, and portal code interfaces are unique creations and remain proprietary intellectual properties of His Kingdom Ministry & His Kingdom Prophets.' : 'Alt undervisningsmateriell, kursinnhold, det vektede karaktersystemet og plattformens kildekode er beskyttede åndsverk og tilhører His Kingdom Ministry & His Kingdom Prophets.'} />
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-sans text-lg sm:text-xl font-bold text-primary">
                <CmsText slug="terms-sec4-title" fallback={isEn ? '4. Limitation of Liability' : '4. Ansvarsbegrensning'} />
              </h2>
              <p>
                <CmsText slug="terms-sec4-desc" fallback={isEn ? 'Academic calculations and prophetic evaluations are for training and discipling purposes. While we maintain a 99.9% uptime using cloud-based database systems, we are not liable for temporary service interruptions.' : 'Faglige vurderinger og profetisk veiledning gis for personlig opplæring og disippelskap. Selv om vi sikrer 99,9% oppetid med skybaserte databaser via Supabase, kan vi ikke holdes ansvarlig for kortere midlertidige driftsavbrudd.'} />
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-sans text-lg sm:text-xl font-bold text-primary">
                <CmsText slug="terms-sec5-title" fallback={isEn ? '5. Modifications to Terms' : '5. Endring av vilkår'} />
              </h2>
              <p>
                <CmsText slug="terms-sec5-desc" fallback={isEn ? 'We reserve the right to modify these Terms of Service as our CMS updates and features expand. Major updates will be broadcasted to students inside the portal notice center.' : 'Vi forbeholder oss retten til å endre disse vilkårene ettersom CMS-systemet oppdateres og plattformens funksjoner utvides. Større oppdateringer vil bli kunngjort under varslingssenteret i portalene.'} />
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
