import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { Scale, ArrowLeft, Globe, HelpCircle, AlertOctagon, UserPlus } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function TermsOfServicePage() {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useApp();

  const isEn = language === 'en';

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-sm">
        <div className="flex justify-between items-center w-full px-4 sm:px-6 md:px-12 h-20 max-w-[1440px] mx-auto">
          <div className="font-serif text-xl sm:text-2xl text-primary font-bold cursor-pointer flex items-center gap-2.5" onClick={() => navigate('/')}>
            <img src={logo} alt="His Kingdom Prophets Logo" className="w-8 h-8 object-contain shrink-0" />
            <span>His Kingdom Prophets</span>
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
              <Scale size={24} />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-primary">
              {isEn ? 'Terms of Service' : 'Vilkår og Betingelser'}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {isEn 
                ? 'Last updated: May 23, 2026. Please read these terms carefully before accessing our platform.' 
                : 'Sist oppdatert: 23. mai 2026. Vennligst les disse vilkårene nøye før du tar plattformen i bruk.'}
            </p>
          </div>

          {/* Key Terms Summarized */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <div className="text-primary"><UserPlus size={18} /></div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
                {isEn ? 'Account Responsibility' : 'Kontosikkerhet'}
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                {isEn 
                  ? 'Keep login credentials secure. You are fully responsible for your profile actions.' 
                  : 'Hold innloggingsdetaljer sikre. Du er selv fullt ut ansvarlig for alle handlinger på profilen din.'}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <div className="text-primary"><AlertOctagon size={18} /></div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
                {isEn ? 'Ethical Conduct' : 'Etisk Oppførsel'}
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                {isEn 
                  ? 'We demand high integrity, ethical prophetic practice, and mutual respect in chat rooms.' 
                  : 'Vi krever høy åndelig integritet, etisk profetisk praksis og gjensidig respekt i våre fellesskap.'}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <div className="text-primary"><HelpCircle size={18} /></div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
                {isEn ? 'Prophetic Integrity' : 'Opphavsrett'}
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                {isEn 
                  ? 'All educational material and study guides are proprietary property.' 
                  : 'Alt studiemateriell og faghefter er beskyttet opphavsrettslig åndsverk tilhørende skolen.'}
              </p>
            </div>
          </div>

          {/* Terms content */}
          <div className="space-y-6 pt-4 text-slate-700 leading-relaxed text-xs sm:text-sm font-medium">
            {isEn ? (
              <>
                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">1. Acceptable Use</h2>
                  <p>
                    By registering as a student or faglærer on His Kingdom Prophets, you agree to access educational tools exclusively for spiritual growth and theological discipling. Disruption, harassment, or unauthorized copying of resources is strictly prohibited.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">2. User Account Security</h2>
                  <p>
                    Users must provide authentic names and emails when setting up credentials. Sharing profile access or study credentials with unregistered students is a breach of security and can lead to suspension.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">3. Intellectuel Property</h2>
                  <p>
                    All study guides, weighted grading structures, courses, and portal code interfaces are unique creations and remain proprietary intellectual properties of Mandal Regnskapskontor & His Kingdom Prophets.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">4. Limitation of Liability</h2>
                  <p>
                    Academic calculations and prophetic evaluations are for training and discipling purposes. While we maintain a 99.9% uptime using cloud-based database systems, we are not liable for temporary service interruptions.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">5. Modifications to Terms</h2>
                  <p>
                    We reserve the right to modify these Terms of Service as our CMS updates and features expand. Major updates will be broadcasted to students inside the portal notice center.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">1. Akseptabel bruk</h2>
                  <p>
                    Ved å registrere deg som student eller mentor på His Kingdom Prophets, samtykker du i å bruke plattformens verktøy utelukkende til teologisk opplæring og åndelig vekst. Forstyrrelser, trakassering eller uautorisert kopiering av ressurser er strengt forbudt.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">2. Kontosikkerhet</h2>
                  <p>
                    Brukere må oppgi sanne opplysninger under profilering. Å dele kontotilgang eller studierettigheter med uregistrerte eksterne personer regnes som sikkerhetsbrudd og kan føre til suspensjon av konto.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">3. Opphavsrett og Åndsverk</h2>
                  <p>
                    Alt undervisningsmateriell, kursinnhold, det vektede karaktersystemet og plattformens kildekode er beskyttede åndsverk og tilhører Mandal Regnskapskontor & His Kingdom Prophets.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">4. Ansvarsbegrensning</h2>
                  <p>
                    Faglige vurderinger og profetisk veiledning gis for personlig opplæring og disippelskap. Selv om vi sikrer 99,9% oppetid med skybaserte databaser via Supabase, kan vi ikke holdes ansvarlig for kortere midlertidige driftsavbrudd.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">5. Endring av vilkår</h2>
                  <p>
                    Vi forbeholder oss retten til å endre disse vilkårene ettersom CMS-systemet oppdateres og plattformens funksjoner utvides. Større oppdateringer vil bli kunngjort under varslingssenteret i portalene.
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
