import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { 
  Sparkles, BookOpen, ShieldCheck, Compass, Users, Check, 
  ArrowLeft, ArrowRight, Globe, Award, Send, MessageSquare 
} from 'lucide-react';
import logo from '@/assets/logo.png';
import CmsText from '@/components/CmsText';

export default function AboutPage() {
  const navigate = useNavigate();
  const { language, toggleLanguage, user } = useApp();
  const isEn = language === 'en';

  const handleApplyClick = () => {
    navigate('/admission');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="bg-[#faf7fc] text-[#240046] font-sans min-h-screen flex flex-col justify-between">
      
      {/* Mini Brand Header Navigation */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-[#dec2ef] px-6 py-4 shadow-sm select-none">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2.5 font-serif font-extrabold text-primary text-base transition-all active:scale-95"
          >
            <img src={logo} alt="Logo" className="w-8 h-8 object-contain shrink-0" />
            <span className="hidden sm:inline"><CmsText slug="layout-logo-title" fallback="His Kingdom Prophets" /></span>
            <span className="inline sm:hidden"><CmsText slug="layout-logo-mobile-title" fallback="HKP" /></span>
          </button>
          
          <div className="flex items-center gap-3">
            {/* Language Switcher Toggle */}
            <button 
              onClick={toggleLanguage}
              className="px-3 py-1.5 border border-[#561291]/20 hover:border-primary text-xs font-bold uppercase rounded-lg text-primary bg-[#561291]/5 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm shrink-0"
              title={language === 'no' ? 'Bytt til engelsk (Switch to English)' : 'Bytt til norsk (Switch to Norwegian)'}
            >
              <Globe size={13} />
              <span>{language === 'no' ? 'NO' : 'EN'}</span>
            </button>

            <button 
              onClick={() => navigate('/')} 
              className="px-4 py-2 hover:bg-[#dec2ef]/20 rounded-xl text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1 transition-all"
            >
              <ArrowLeft size={14} />
              <span>{language === 'en' ? "Back to Home" : "Gå tilbake"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Header Section */}
      <section className="relative bg-gradient-to-br from-primary via-[#561291] to-[#240046] text-white py-20 px-6 overflow-hidden">
        {/* Visual glassmorphic blobs for agency standards */}
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-on-primary-container font-semibold text-[10px] sm:text-xs uppercase tracking-widest border border-white/20">
            <Sparkles size={13} className="text-secondary-fixed-dim" />
            <CmsText slug="about-hero-tagline" fallback={language === 'en' ? "Who We Are & What We Believe" : "Hvem vi er & hva vi tror på"} />
          </span>

          <CmsText 
            slug="about-hero-title" 
            fallback={language === 'en' ? "Welcome to His Kingdom Prophets" : "Velkommen til His Kingdom Prophets"} 
            as="h1"
            className="font-serif text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight max-w-3xl mx-auto text-white"
          />

          <CmsText 
            slug="about-hero-subtitle" 
            fallback={language === 'en' ? "Merging sound, rigorous biblical hermeneutics with active, mature prophetic ministry. We equip the body of Christ for the assignments of tomorrow." : "Vi forener grundig bibelsk hermeneutikk med en aktiv, sunn og moden profetisk gaverolle. Vi utruster Kristi kropp for morgendagens oppgaver."} 
            as="p"
            className="text-sm sm:text-base text-[#e0aaff] font-medium max-w-2xl mx-auto leading-relaxed"
          />
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="flex-grow max-w-5xl mx-auto px-6 py-16 space-y-20 w-full">
        
        {/* SECTION 1: WHO WE ARE (TEXT & STATS) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary">
              <CmsText slug="about-sec1-title" fallback={language === 'en' ? "Solid Theology. Authentic Spirit." : "Solid teologi. Autentisk Ånd."} />
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
              <CmsText slug="about-sec1-desc1" fallback={language === 'en' 
                ? "His Kingdom Prophets (HKP) is a contemporary prophetic school and equipping center. We believe that spiritual gifts must never be divorced from academic integrity and deep biblical study. Our curriculum is designed to prevent shallow emotionalism by grounding students in robust covenant theology, historical context, and sound exegesis."
                : "His Kingdom Prophets (HKP) er en tidsaktuell profetisk åpenbaringsskole og et utrustningssenter. Vi tror at åndelige gaver aldri må skilles fra teologisk integritet og dype bibelstudier. Vår fagplan er utformet for å forhindre overfladisk følelsesstyring, og forankrer i stedet studentene i solid paktsteologi, historisk kontekst og sunn skriftforståelse."} />
            </p>
            <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
              <CmsText slug="about-sec1-desc2" fallback={language === 'en'
                ? "Through our high-end digital study workbook, personal one-on-one mentor coaching, and vibrant prayer community, we prepare leaders who stand firm in character, ethical integrity, and prophetic clarity."
                : "Gjennom vårt digitale studiehefte, personlig én-til-én mentorveiledning og et levende bønnefellesskap, former vi tjenere som står støtt i karakter, etisk integritet og profetisk klarhet."} />
            </p>
          </div>

          {/* Stats Cards Layout */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-white border border-[#dec2ef]/40 rounded-2xl text-center space-y-1 shadow-sm">
              <span className="font-serif text-3xl font-extrabold text-primary block">
                <CmsText slug="about-stat1-num" fallback="8+" />
              </span>
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
                <CmsText slug="about-stat1-lbl" fallback={language === 'en' ? "Modules per course" : "Moduler per fag"} />
              </span>
            </div>
            <div className="p-6 bg-white border border-[#dec2ef]/40 rounded-2xl text-center space-y-1 shadow-sm">
              <span className="font-serif text-3xl font-extrabold text-primary block">
                <CmsText slug="about-stat2-num" fallback="1-on-1" />
              </span>
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
                <CmsText slug="about-stat2-lbl" fallback={language === 'en' ? "Personal mentoring" : "Personlig veiledning"} />
              </span>
            </div>
            <div className="p-6 bg-white border border-[#dec2ef]/40 rounded-2xl text-center space-y-1 shadow-sm">
              <span className="font-serif text-3xl font-extrabold text-primary block">
                <CmsText slug="about-stat3-num" fallback="100%" />
              </span>
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
                <CmsText slug="about-stat3-lbl" fallback={language === 'en' ? "Digital Study Bible" : "Digital Studiebibel"} />
              </span>
            </div>
            <div className="p-6 bg-white border border-[#dec2ef]/40 rounded-2xl text-center space-y-1 shadow-sm">
              <span className="font-serif text-3xl font-extrabold text-primary block">
                <CmsText slug="about-stat4-num" fallback="24/7" />
              </span>
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
                <CmsText slug="about-stat4-lbl" fallback={language === 'en' ? "AI Theology Assistant" : "AI-Teologiassistent"} />
              </span>
            </div>
          </div>
        </section>

        {/* SECTION 2: THREE CORE PILLARS */}
        <section className="space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-serif text-2xl font-bold text-primary">
              <CmsText slug="about-pillars-title" fallback={language === 'en' ? "Our Three Core Pillars" : "Våre tre grunnpilarer"} />
            </h2>
            <p className="text-xs text-on-surface-variant font-semibold">
              <CmsText slug="about-pillars-desc" fallback={language === 'en' 
                ? "Every course and tool on our platform is built on these foundational values."
                : "Hvert kurs og verktøy på plattformen vår er bygget på disse grunnleggende verdiene."} />
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="bg-white border border-[#dec2ef]/50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-primary flex items-center justify-center">
                <BookOpen size={22} />
              </div>
              <h3 className="font-serif text-lg font-bold text-primary">
                <CmsText slug="about-pillar1-title" fallback={language === 'en' ? "1. Hermeneutical Depth" : "1. Hermeneutisk dybde"} />
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed font-semibold">
                <CmsText slug="about-pillar1-desc" fallback={language === 'en'
                  ? "We prioritize the historical-grammatical method of interpretation. Students learn to read scripture in its original context before attempting modern applications."
                  : "Vi prioriterer den historisk-grammatiske tolkningsmetoden. Studentene lærer å lese Skriften i sin opprinnelige kontekst før de gjør moderne anvendelser."} />
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white border border-[#dec2ef]/50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-primary flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>
              <h3 className="font-serif text-lg font-bold text-primary">
                <CmsText slug="about-pillar2-title" fallback={language === 'en' ? "2. Character & Accountability" : "2. Karakter & etikk"} />
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed font-semibold">
                <CmsText slug="about-pillar2-desc" fallback={language === 'en'
                  ? "A prophetic gift without a mature, Christ-like character is dangerous. We emphasize local church accountability, integrity, and personal discipleship."
                  : "En profetisk gave uten en moden, Kristus-lik karakter er sårbar. Vi legger stor vekt på menighetsrelasjon, personlig integritet og disippelskap."} />
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white border border-[#dec2ef]/50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-primary flex items-center justify-center">
                <Compass size={22} />
              </div>
              <h3 className="font-serif text-lg font-bold text-primary">
                <CmsText slug="about-pillar3-title" fallback={language === 'en' ? "3. Practical Equipping" : "3. Tjenesteutrustning"} />
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed font-semibold">
                <CmsText slug="about-pillar3-desc" fallback={language === 'en'
                  ? "Our curriculum provides concrete, actionable tools. Learn to interpret dreams, discern spiritual climates, and lead with apostolic wisdom."
                  : "Studiet gir konkrete, anvendelige verktøy. Lær å tyde drømmer, skjelne åndelige trender, og lede med apostolisk og profetisk visdom."} />
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: LEADERSHIP & MENTORS */}
        <section className="space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-serif text-2xl font-bold text-primary">
              <CmsText slug="about-faculty-title" fallback={language === 'en' ? "Our Faculty & Leadership" : "Våre mentorer og ledere"} />
            </h2>
            <p className="text-xs text-on-surface-variant font-semibold">
              <CmsText slug="about-faculty-desc" fallback={language === 'en'
                ? "Learn from seasoned ministry leaders who combine deep theological training with years of practical experience."
                : "Motta veiledning fra erfarne ledere som forener solid teologisk ballast med mangeårig tjenesteerfaring."} />
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Mentor 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex gap-4 items-center sm:items-start flex-col sm:flex-row text-center sm:text-left">
              <img 
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150"
                alt="Apostel David Hansen" 
                className="w-20 h-20 rounded-full object-cover border border-primary shrink-0"
              />
              <div className="space-y-2">
                <div>
                  <h4 className="font-serif text-lg font-bold text-primary">
                    <CmsText slug="about-faculty-m1-name" fallback="David Hansen" />
                  </h4>
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
                    <CmsText slug="about-faculty-m1-role" fallback={language === 'en' ? "Founder & Main Mentor" : "Grunnlegger & Hovedmentor"} />
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  <CmsText slug="about-faculty-m1-bio" fallback={language === 'en'
                    ? "David combines extensive pastoral experience with apostolic vision. He leads the prophetic activation and dream interpretation seminars."
                    : "David kombinerer bred pastorallære med en apostolisk visjon. Han leder seminarene innen profetisk aktivisering og drømmetydning."} />
                </p>
              </div>
            </div>

            {/* Mentor 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex gap-4 items-center sm:items-start flex-col sm:flex-row text-center sm:text-left">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
                alt="Pastor Siri Knutsen" 
                className="w-20 h-20 rounded-full object-cover border border-primary shrink-0"
              />
              <div className="space-y-2">
                <div>
                  <h4 className="font-serif text-lg font-bold text-primary">
                    <CmsText slug="about-faculty-m2-name" fallback="Siri Knutsen" />
                  </h4>
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
                    <CmsText slug="about-faculty-m2-role" fallback={language === 'en' ? "Director of Pastoral Care" : "Fagansvarlig for Sjelesorg & Menighet"} />
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  <CmsText slug="about-faculty-m2-bio" fallback={language === 'en'
                    ? "Siri is dedicated to spiritual counseling and inner healing. She ensures that students develop sound emotional health and relational stability."
                    : "Siri er opptatt av sjelesorg, indre helbredelse og sunn emosjonell helse. Hun veileder studentene inn i personlig modenhet og relasjonell stabilitet."} />
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: DIGITAL PLATFORM WORKSPACE */}
        <section className="bg-white border border-[#dec2ef]/55 rounded-3xl p-8 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f3e8ff] text-primary font-bold text-[10px] uppercase tracking-wider select-none">
              <Award size={12} />
              <CmsText slug="about-workspace-tag" fallback={language === 'en' ? "State-of-the-Art Student Workspace" : "Førsteklasses digitalt studiemiljø"} />
            </span>

            <h2 className="font-serif text-2xl font-bold text-primary leading-tight">
              <CmsText slug="about-workspace-title" fallback={language === 'en' ? "A Modern Digital Workbook Built for Discipleship" : "Et moderne, digitalt verktøy bygget for vekst"} />
            </h2>

            <p className="text-xs text-on-surface-variant font-semibold leading-relaxed">
              <CmsText slug="about-workspace-desc" fallback={language === 'en'
                ? "Our students don't just read books; they interact in a fully immersive study ecosystem. Our high-end student platform includes:"
                : "Våre studenter leser ikke bare tørre bøker; de deltar i et fullverdig, interaktivt økosystem. Vår moderne studentportal inneholder:"} />
            </p>

            <ul className="space-y-3 pt-2 text-xs text-on-surface-variant font-semibold font-sans">
              <li className="flex items-center gap-2.5">
                <span className="p-0.5 bg-green-50 text-green-600 rounded-full shrink-0"><Check size={13} /></span>
                <span><CmsText slug="about-workspace-b1" fallback={language === 'en' ? "Bilingual Study Bible with interactive footnotes" : "Tospråklig Studiebibel med integrerte kommentarer"} /></span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="p-0.5 bg-green-50 text-green-600 rounded-full shrink-0"><Check size={13} /></span>
                <span><CmsText slug="about-workspace-b2" fallback={language === 'en' ? "Premium WYSIWYG note editor with highlight markers" : "Førsteklasses rikteksteditor (WYSIWYG) med markørpenner"} /></span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="p-0.5 bg-green-50 text-green-600 rounded-full shrink-0"><Check size={13} /></span>
                <span><CmsText slug="about-workspace-b3" fallback={language === 'en' ? "Immediate 'Paste from AI' integration for theological deep-dives" : "Direkte 'Lim inn fra AI'-integrasjon for teologisk fordypning"} /></span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="p-0.5 bg-green-50 text-green-600 rounded-full shrink-0"><Check size={13} /></span>
                <span><CmsText slug="about-workspace-b4" fallback={language === 'en' ? "Interactive Prayer & Study groups with community chat" : "Interaktive bønnegrupper med felles diskusjonsrom"} /></span>
              </li>
            </ul>
          </div>

          <div className="bg-[#faf7fc] border border-slate-200/60 rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 bg-white border border-[#dec2ef] rounded-full flex items-center justify-center text-primary shadow-sm">
              <MessageSquare size={28} />
            </div>
            <div className="space-y-2">
              <h4 className="font-serif text-lg font-bold text-primary">
                <CmsText slug="about-start-title" fallback={language === 'en' ? "Ready to Start?" : "Klar for å starte?"} />
              </h4>
              <p className="text-[11px] text-on-surface-variant font-semibold leading-relaxed max-w-xs">
                <CmsText slug="about-start-desc" fallback={language === 'en'
                  ? "Explore our public study lines or apply for admission to unlock the full student portal."
                  : "Utforsk våre studielinjer eller søk om opptak for å låse opp hele studentportalen og mentorskapet."} />
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
              <button 
                onClick={handleApplyClick}
                className="flex-1 py-3 bg-[#c5a059] hover:bg-[#b08e4f] text-white text-xs font-serif font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span><CmsText slug="about-start-btn-apply" fallback={language === 'en' ? "Apply Now" : "Søk Opptak"} /></span>
                <ArrowRight size={13} />
              </button>
              <button 
                onClick={handleLoginClick}
                className="flex-1 py-3 bg-white border border-slate-200 text-primary hover:bg-slate-50 text-xs font-bold uppercase rounded-xl transition-all active:scale-95"
              >
                <CmsText slug="about-start-btn-login" fallback={language === 'en' ? "Log In" : "Logg inn"} />
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-6 flex flex-col md:flex-row justify-between items-center gap-6 bg-[#240046] text-white select-none shrink-0 border-t border-white/5 font-medium">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <div className="font-serif text-lg font-bold text-[#e0aaff]">
            <CmsText slug="landing-footer-title" fallback="His Kingdom Prophets" />
          </div>
          <p className="text-[10px] text-slate-300 opacity-80 max-w-md">
            <CmsText slug="landing-footer-copyright" fallback={language === 'en' ? "© 2026 His Kingdom Prophets. All rights reserved. Equipping prophetic ministries for the church." : "© 2026 His Kingdom Prophets. Alle rettigheter reservert. Utrustning av profetiske tjenester for menigheten."} />
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-[#e0aaff]">
          <button onClick={() => navigate('/privacy')} className="hover:text-white transition-opacity">
            <CmsText slug="landing-footer-link-privacy" fallback={language === 'en' ? "Privacy Policy" : "Personvern"} />
          </button>
          <button onClick={() => navigate('/terms')} className="hover:text-white transition-opacity">
            <CmsText slug="landing-footer-link-terms" fallback={language === 'en' ? "Terms of Service" : "Betingelser"} />
          </button>
          <button onClick={() => navigate('/accessibility')} className="hover:text-white transition-opacity">
            <CmsText slug="landing-footer-link-accessibility" fallback={language === 'en' ? "Accessibility" : "Tilgjengelighet"} />
          </button>
          <button onClick={() => navigate('/support')} className="hover:text-white transition-opacity">
            <CmsText slug="landing-footer-link-support" fallback={language === 'en' ? "Contact Support" : "Kontakt Support"} />
          </button>
        </nav>
      </footer>

    </div>
  );
}
