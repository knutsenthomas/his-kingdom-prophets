import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { 
  Sparkles, BookOpen, ShieldCheck, Compass, Users, Check, 
  ArrowLeft, ArrowRight, Globe, Award, Heart, Youtube, Mic, 
  Calendar, Briefcase, Mail, Send, ExternalLink, HelpCircle
} from 'lucide-react';
import logo from '@/assets/logo.png';
import CmsText from '@/components/CmsText';

export default function HkmAboutPage() {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useApp();
  const isEn = language === 'en';

  const handleApplyClick = () => {
    navigate('/admission');
  };

  const handleSupportClick = () => {
    navigate('/support');
  };

  const stats = [
    {
      icon: <Mic size={24} className="text-[#d17d39]" />,
      numberSlug: "hkm-stat-podcast-num",
      numberFallback: "46+",
      labelSlug: "hkm-stat-podcast-lbl",
      labelFallback: isEn ? "Podcast Episodes" : "Podcast-episoder",
      descSlug: "hkm-stat-podcast-desc",
      descFallback: isEn ? "Deep weekly conversations on faith and growth" : "Ukentlige samtaler om tro, liv og åndelig vekst"
    },
    {
      icon: <Globe size={24} className="text-[#bd4f2a]" />,
      numberSlug: "hkm-stat-countries-num",
      numberFallback: "9",
      labelSlug: "hkm-stat-countries-lbl",
      labelFallback: isEn ? "Countries Visited" : "Land besøkt",
      descSlug: "hkm-stat-countries-desc",
      descFallback: isEn ? "Preaching, seminars and international missions" : "Forkynnelse, seminarer og internasjonalt misjonsarbeid"
    },
    {
      icon: <Youtube size={24} className="text-red-500" />,
      numberSlug: "hkm-stat-yt-num",
      numberFallback: "10k+",
      labelSlug: "hkm-stat-yt-lbl",
      labelFallback: isEn ? "YouTube Views" : "YouTube-visninger",
      descSlug: "hkm-stat-yt-desc",
      descFallback: isEn ? "Spreading solid biblical teachings digitally" : "Solid bibelsk undervisning spredt digitalt"
    },
    {
      icon: <Users size={24} className="text-primary" />,
      numberSlug: "hkm-stat-meetings-num",
      numberFallback: "500+",
      labelSlug: "hkm-stat-meetings-lbl",
      labelFallback: isEn ? "Gatherings & Meetings" : "Møter & samlinger",
      descSlug: "hkm-stat-meetings-desc",
      descFallback: isEn ? "Prayer meetings, seminars and conferences" : "Bønnemøter, seminarer og nasjonale samlinger"
    }
  ];

  return (
    <div className="bg-[#faf7fc] text-[#240046] font-sans min-h-screen flex flex-col justify-between">
      
      {/* Brand Header Navigation */}
      <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-[#dec2ef]/50 px-6 py-4 shadow-sm select-none">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2.5 font-serif font-extrabold text-primary text-base transition-all active:scale-95"
          >
            <img src={logo} alt="Logo" className="w-8 h-8 object-contain shrink-0" />
            <span className="hidden sm:inline">
              <CmsText slug="layout-logo-title" fallback="His Kingdom Prophets" />
            </span>
            <span className="inline sm:hidden">
              <CmsText slug="layout-logo-mobile-title" fallback="HKP" />
            </span>
          </button>
          
          <div className="flex items-center gap-3">
            {/* Language Switcher Toggle */}
            <button 
              onClick={toggleLanguage}
              className="px-3 py-1.5 border border-[#561291]/20 hover:border-primary text-xs font-bold uppercase rounded-lg text-primary bg-[#561291]/5 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm shrink-0"
              title={isEn ? 'Bytt til norsk (Switch to Norwegian)' : 'Bytt til engelsk (Switch to English)'}
            >
              <Globe size={13} />
              <span>{isEn ? 'EN' : 'NO'}</span>
            </button>

            <button 
              onClick={() => navigate('/')} 
              className="px-4 py-2 hover:bg-[#dec2ef]/20 rounded-xl text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1 transition-all active:scale-95"
            >
              <ArrowLeft size={14} />
              <span>{isEn ? "Back" : "Tilbake"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Header Section with vibrant blending colors */}
      <section className="relative bg-gradient-to-br from-primary via-[#561291] to-[#240046] text-white py-20 px-6 overflow-hidden">
        {/* Glow rings and absolute blobs */}
        <div className="absolute top-[-30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#d17d39]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-15%] w-[450px] h-[450px] rounded-full bg-primary/20 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <motion.span 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 text-[#ffd580] font-semibold text-[10px] sm:text-xs uppercase tracking-widest border border-white/20 shadow-md"
          >
            <Sparkles size={13} className="text-[#ffd580] animate-pulse" />
            <CmsText slug="hkm-hero-tagline" fallback={isEn ? "NON-PROFIT FELLOWSHIP" : "NON-PROFIT FELLESSKAP"} />
          </motion.span>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight max-w-3xl mx-auto text-white"
          >
            <CmsText slug="hkm-hero-title" fallback="His Kingdom Ministry" />
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-200 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            <CmsText 
              slug="hkm-hero-subtitle" 
              fallback={isEn 
                ? "A fellowship dedicated to spiritual growth through biblical teaching, active media outreach, and dynamic travel ministry. We walk together to grow in our relation to Jesus."
                : "Et fellesskap dedikert til åndelig vekst gjennom bibelundervisning, aktiv medieformidling og reisevirksomhet. Vi går sammen for å styrke troen og relasjonen til Jesus."}
            />
          </motion.p>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="flex-grow max-w-6xl mx-auto px-6 py-16 space-y-24 w-full">
        
        {/* SECTION 1: ABOUT US & STORY */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
              <CmsText slug="hkm-about-tagline" fallback={isEn ? "About the NGO" : "Bli kjent med oss"} />
            </div>
            
            <h2 className="font-serif text-3xl font-bold text-primary leading-tight">
              <CmsText slug="hkm-about-title" fallback={isEn ? "A Church Without Walls - Built for Growth" : "En kirke uten vegger - bygget for vekst"} />
            </h2>
            
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              <CmsText 
                slug="hkm-about-desc1" 
                fallback={isEn
                  ? "His Kingdom Ministry is a non-profit organization dedicated to facilitating spiritual growth and community building. Through our prayer gatherings, deep teaching seminars, and international outreach, we strive to be a vibrant house of fellowship where individuals are built up to walk strongly in their faith."
                  : "His Kingdom Ministry er en non-profit organisasjon dedikert til å tilrettelegge for åndelig vekst og fellesskapsbygging. Gjennom våre bønnemøter, dype undervisningsseminarer og internasjonale reisevirksomhet, ønsker vi å være et levende fellesskap der det enkelte menneske blir utrustet til å gå frimodig i sin tro."}
              />
            </p>
            
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              <CmsText 
                slug="hkm-about-desc2" 
                fallback={isEn
                  ? "Regardless of where you currently stand in your spiritual walk, we welcome you to join our family. Our core foundation rests upon the redemptive work of Christ, authentic fellowship, and making sound discipleship accessible to everyone."
                  : "Uansett hvor du befinner deg på din åndelige vandring, er du hjertelig velkommen til å bli en del av familien vår. Vår grunnmur hviler på Kristi forsoning, ekte fellesskap, og å gjøre sunn disippelgjøring tilgjengelig for alle."}
              />
            </p>
          </div>

          <div className="lg:col-span-5 relative flex justify-center">
            {/* Visual Design Element */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#d17d39]/10 to-[#bd4f2a]/10 rounded-3xl -rotate-3 scale-105 pointer-events-none" />
            <div className="relative bg-white border border-[#dec2ef]/40 rounded-3xl p-8 shadow-md space-y-6 max-w-sm w-full z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-[#d17d39] to-[#bd4f2a] rounded-2xl flex items-center justify-center text-white shadow-md">
                <Award size={24} />
              </div>
              <div className="space-y-4">
                <h4 className="font-serif text-lg font-bold text-primary">
                  <CmsText slug="hkm-strategy-title" fallback={isEn ? "Core NGO Strategy" : "Sentralt fokusområde"} />
                </h4>
                <div className="space-y-3.5 text-xs font-semibold text-slate-600">
                  <div className="flex gap-2">
                    <Check size={16} className="text-[#d17d39] shrink-0" />
                    <span>
                      <CmsText slug="hkm-strategy-bullet1" fallback={isEn ? "Bilingual theological outreach" : "Tospråklig teologisk formidling"} />
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Check size={16} className="text-[#d17d39] shrink-0" />
                    <span>
                      <CmsText slug="hkm-strategy-bullet2" fallback={isEn ? "Active localized prayer groups" : "Lokale og nasjonale bønnegrupper"} />
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Check size={16} className="text-[#d17d39] shrink-0" />
                    <span>
                      <CmsText slug="hkm-strategy-bullet3" fallback={isEn ? "Support for global ministries & travel" : "Støtte til misjon og reisevirksomhet"} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: MISSION & HISTORY PILLARS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission Card */}
          <div className="bg-white border border-[#dec2ef]/30 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all space-y-5 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#d17d39] flex items-center justify-center transition-colors group-hover:bg-[#d17d39]/10">
                <Compass size={22} />
              </div>
              <h3 className="font-serif text-xl font-bold text-primary">
                <CmsText slug="hkm-mission-title" fallback={isEn ? "Our Mission" : "Vårt oppdrag"} />
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
                <CmsText 
                  slug="hkm-mission-desc" 
                  fallback={isEn
                    ? "To equip and inspire individuals for a deeper, authentic life with God through solid teaching, healthy fellowship, and faithful prayer."
                    : "Å utruste og inspirere mennesker til et dypere, autentisk liv med Gud gjennom solid undervisning, sunt fellesskap og trofast bønn."}
                />
              </p>
            </div>
            <div className="pt-2 text-xs font-bold text-[#d17d39] flex items-center gap-1">
              <span>
                <CmsText slug="hkm-mission-tag" fallback={isEn ? "Empowering the body of Christ" : "Utrustning av Kristi kropp"} />
              </span>
            </div>
          </div>

          {/* History Card */}
          <div className="bg-white border border-[#dec2ef]/30 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all space-y-5 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-primary flex items-center justify-center transition-colors group-hover:bg-primary/10">
                <ShieldCheck size={22} />
              </div>
              <h3 className="font-serif text-xl font-bold text-primary">
                <CmsText slug="hkm-history-title" fallback={isEn ? "Our History" : "Vår historie"} />
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
                <CmsText 
                  slug="hkm-history-desc" 
                  fallback={isEn
                    ? "What began as a localized vision to gather believers for spiritual growth has blossomed into a thriving ministry driving nation-wide prayer networks, targeted study seminars, and active missions abroad."
                    : "Det som startet som en lokal visjon om å samle troende for åndelig vekst, har utviklet seg til et levende fellesskap som driver bønnenettverk over hele landet, målrettede seminarer og misjon i utlandet."}
                />
              </p>
            </div>
            <div className="pt-2 text-xs font-bold text-primary flex items-center gap-1">
              <span>
                <CmsText slug="hkm-history-tag" fallback={isEn ? "Established on solid values" : "Grunnlagt på stødige verdier"} />
              </span>
            </div>
          </div>
        </section>

        {/* SECTION 3: IMPACT STATS */}
        <section className="bg-white border border-[#dec2ef]/40 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="section-label uppercase tracking-widest text-xs font-extrabold text-[#d17d39]">
              <CmsText slug="hkm-stats-tagline" fallback={isEn ? "Our Global Footprint" : "Våre resultater i tall"} />
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary">
              <CmsText slug="hkm-stats-title" fallback={isEn ? "Ministry Impact" : "Arbeidet som utføres"} />
            </h2>
            <p className="text-xs text-slate-500 font-semibold">
              <CmsText slug="hkm-stats-subtitle" fallback={isEn ? "Key statistics showing the reach and activity of His Kingdom Ministry." : "Nøkkeltall som beskriver omfanget av arbeidet i His Kingdom Ministry."} />
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="p-6 bg-[#faf7fc] border border-slate-200/50 rounded-2xl space-y-3 hover:border-[#dec2ef] transition-all hover:-translate-y-0.5 shadow-sm text-center sm:text-left">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm mx-auto sm:mx-0">
                  {stat.icon}
                </div>
                <div className="space-y-1">
                  <span className="font-serif text-3xl font-extrabold text-primary block">
                    <CmsText slug={stat.numberSlug} fallback={stat.numberFallback} />
                  </span>
                  <span className="text-xs font-bold text-[#240046] block">
                    <CmsText slug={stat.labelSlug} fallback={stat.labelFallback} />
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold block leading-relaxed">
                    <CmsText slug={stat.descSlug} fallback={stat.descFallback} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: GET INVOLVED (ENGASJER DEG) */}
        <section className="space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="section-label uppercase tracking-widest text-xs font-extrabold text-primary">
              <CmsText slug="hkm-engage-tagline" fallback={isEn ? "Get Involved" : "Bli involvert"} />
            </span>
            <h2 className="font-serif text-2xl font-bold text-primary">
              <CmsText slug="hkm-engage-title" fallback={isEn ? "How to Engage & Support" : "Hvordan stå sammen med oss"} />
            </h2>
            <p className="text-xs text-slate-500 font-semibold">
              <CmsText slug="hkm-engage-subtitle" fallback={isEn ? "There are multiple ways to partner with the ministry. Choose the pathway that fits you." : "Det finnes flere måter du kan koble deg på arbeidet vårt. Velg det sporet som passer best."} />
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Donor Support */}
            <div className="bg-white border border-[#dec2ef]/40 p-8 rounded-2xl shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#f39c12] to-[#e74c3c] rounded-xl flex items-center justify-center text-white shadow-sm">
                  <Heart size={20} />
                </div>
                <h4 className="font-serif text-lg font-bold text-primary">
                  <CmsText slug="hkm-engage-card1-title" fallback={isEn ? "Support the Work" : "Støtt arbeidet"} />
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  <CmsText slug="hkm-engage-card1-desc" fallback={isEn ? "His Kingdom Ministry is run on voluntary donations. You can give a one-time gift or sign up as a regular monthly donor." : "His Kingdom Ministry drives ved hjelp av frivillige gaver. Du kan støtte oss med enkeltgaver eller melde deg som fast månedlig støttepartner."} />
                </p>
              </div>
              <button 
                onClick={handleSupportClick}
                className="w-full py-2.5 bg-gradient-to-br from-[#f39c12] to-[#e74c3c] hover:opacity-95 text-white text-xs font-bold uppercase rounded-lg shadow transition-all active:scale-[0.98]"
              >
                <CmsText slug="hkm-engage-card1-btn" fallback={isEn ? "Support Now" : "Gi gave / Støtt nå"} />
              </button>
            </div>

            {/* Church Seminars */}
            <div className="bg-white border border-[#dec2ef]/40 p-8 rounded-2xl shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Calendar size={20} />
                </div>
                <h4 className="font-serif text-lg font-bold text-primary">
                  <CmsText slug="hkm-engage-card2-title" fallback={isEn ? "For Churches" : "For menigheter"} />
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  <CmsText slug="hkm-engage-card2-desc" fallback={isEn ? "We organize weekend seminars, training hours, and active prophetic activation modules to help mature spiritual ministries within local churches." : "Vi holder seminarer, undervisningshelger og moduler for profetisk aktivisering som utruster lokale ledere og modner menigheten."} />
                </p>
              </div>
              <a 
                href="mailto:kontakt@hiskingdomministry.no?subject=Undervisning%20for%20menighet" 
                className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-primary text-xs font-bold uppercase rounded-lg transition-all text-center flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
              >
                <span>
                  <CmsText slug="hkm-engage-card2-btn" fallback={isEn ? "Contact Us" : "Kontakt oss"} />
                </span>
                <Mail size={13} />
              </a>
            </div>

            {/* Business Network */}
            <div className="bg-white border border-[#dec2ef]/40 p-8 rounded-2xl shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Briefcase size={20} />
                </div>
                <h4 className="font-serif text-lg font-bold text-primary">
                  <CmsText slug="hkm-engage-card3-title" fallback={isEn ? "Business Network" : "Business Network"} />
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  <CmsText slug="hkm-engage-card3-desc" fallback={isEn ? "Connect with Christian business owners to share wisdom, encourage marketplace ministries, and strategically sponsor outreaches." : "Møt kristne forretningsfolk og ledere for å dele visdom, bygge relasjoner og støtte misjon i fellesskap."} />
                </p>
              </div>
              <a 
                href="mailto:kontakt@hiskingdomministry.no?subject=Business%20Network" 
                className="w-full py-2.5 bg-primary hover:bg-[#240046] text-white text-xs font-bold uppercase rounded-lg transition-all text-center flex items-center justify-center gap-1.5 shadow active:scale-[0.98]"
              >
                <span>
                  <CmsText slug="hkm-engage-card3-btn" fallback={isEn ? "Join Network" : "Meld din interesse"} />
                </span>
                <Send size={13} />
              </a>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA: COMBINED SCHOOL & MINISTRY */}
        <section className="bg-gradient-to-br from-primary to-[#240046] border border-[#dec2ef]/30 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="absolute top-[-40%] right-[-10%] w-[350px] h-[350px] rounded-full bg-white/5 blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl space-y-6 relative z-10">
            <span className="inline-flex items-center gap-1 bg-[#c5a059]/25 text-[#ffd580] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <CmsText slug="hkm-bottom-tagline" fallback={isEn ? "His Kingdom Prophets School" : "Bibelundervisning & Utrustningsskole"} />
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
              <CmsText slug="hkm-bottom-title" fallback={isEn ? "Ready to dive deeper into theology and revelation?" : "Ønsker du teologisk dybde og profetisk utrustning?"} />
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
              <CmsText slug="hkm-bottom-desc" fallback={isEn ? "Our highly acclaimed prophetic school combines sound biblical hermeneutics with mentor coaching and study tools. Read study course modules or submit an application today." : "Vår profetiske åpenbaringsskole forener solid hermeneutikk med grundig bibelundervisning og personlig oppfølging. Utforsk studielinjene eller søk om opptak i dag."} />
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={handleApplyClick}
                className="px-6 py-3 bg-[#c5a059] hover:bg-[#b08e4f] text-white text-xs font-serif font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
              >
                <span>
                  <CmsText slug="hkm-bottom-btn1" fallback={isEn ? "Apply to Prophets School" : "Søk Opptak til skolen"} />
                </span>
                <ArrowRight size={13} />
              </button>
              <button 
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase rounded-xl transition-all border border-white/20 active:scale-95"
              >
                <CmsText slug="hkm-bottom-btn2" fallback={isEn ? "Explore Course Lines" : "Utforsk studielinjer"} />
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* Footer Segment */}
      <footer className="w-full py-12 px-6 flex flex-col md:flex-row justify-between items-center gap-6 bg-[#240046] text-white select-none shrink-0 border-t border-white/5">
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
          <button onClick={handleSupportClick} className="hover:text-white transition-opacity">
            <CmsText slug="landing-footer-link-support" fallback={isEn ? "Contact Support" : "Kontakt Support"} />
          </button>
        </nav>
      </footer>

    </div>
  );
}
