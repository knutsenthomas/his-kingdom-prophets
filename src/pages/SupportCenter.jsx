import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, HelpCircle, BookOpen, User, ShieldAlert,
  ChevronDown, MessageSquare, Mail, Send, ChevronRight,
  Compass, ArrowRight, HelpCircle as HelpIcon, PlayCircle
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'Alle artikler' },
  { id: 'startup', label: 'Kom i gang' },
  { id: 'portal', label: 'Studentportal' },
  { id: 'academic', label: 'Kurs & Læreplan' },
  { id: 'technical', label: 'Teknisk støtte' },
  { id: 'mentoring', label: 'Veiledning' },
];

const ARTICLES = [
  {
    id: 'art-1',
    category: 'startup',
    title: 'Slik logger du på for første gang',
    desc: 'En rask innføring i pålogging med e-post, Google eller Apple, samt utfylling av din tjenesteprofil.',
    views: '1.2k visninger',
    time: '2 min lesetid'
  },
  {
    id: 'art-2',
    category: 'portal',
    title: 'Navigering i Bønnefellesskapet og chatten',
    desc: 'Hvordan bruke det integrerte samtalerommet til å dele åpenbaringer, bønnebegjær og chatte med andre.',
    views: '840 visninger',
    time: '3 min lesetid'
  },
  {
    id: 'art-3',
    category: 'academic',
    title: 'Bruk av Bibelkalkulatoren for karakterer',
    desc: 'Slik fungerer det vektede karaktersystemet og oppgavevurderingen på plattformen.',
    views: '920 visninger',
    time: '4 min lesetid'
  },
  {
    id: 'art-4',
    category: 'technical',
    title: 'Feilsøking ved Zoom- og videostrømmer',
    desc: 'Opplever du forsinkelser eller manglende lyd under live-samlingene? Følg disse enkle stegene.',
    views: '650 visninger',
    time: '3 min lesetid'
  },
  {
    id: 'art-5',
    category: 'mentoring',
    title: 'Hvordan bestille digital veiledningstid',
    desc: 'Lær å koble deg opp på faglærers kontortid og starte din private videosamtale.',
    views: '1.1k visninger',
    time: '2 min lesetid'
  },
  {
    id: 'art-6',
    category: 'academic',
    title: 'Oversikt over de fem tjenestegavene',
    desc: 'En teologisk og praktisk guide til hvordan apostoliske, profetiske, evangeliske, pastorale og læregaver ruster kirken.',
    views: '1.4k visninger',
    time: '6 min lesetid'
  }
];

const FAQS = [
  {
    q: 'Hvordan leverer jeg inn skriftlige essay- og sjelesorg-oppgaver?',
    a: 'Du navigerer til "Oppgaver" i studentmenyen, klikker på gjeldende oppgave, skriver inn din besvarelse eller laster opp en PDF, og trykker på "Send inn oppgave". Mentoren din vil da bli varslet automatisk.'
  },
  {
    q: 'Hvem har tilgang til mine profetiske åpenbaringsprofiler?',
    a: 'Kun autoriserte mentorer (lærere) og administratorer har tilgang til din private åndelige profil og profilskisse for å gi deg best mulig disippelskap.'
  },
  {
    q: 'Hvordan fungerer provisjonsutbetalingene i partnerportalen?',
    a: 'Når en ny student melder seg på et kurs via din unike affiliate-lenke, registreres salget umiddelbart. Du tjener 15% i provisjon som godkjennes månedlig og overføres direkte til din oppgitte konto.'
  },
  {
    q: 'Hvor ofte arrangeres det live-undervisning og fellesbønn?',
    a: 'Våre live-samlinger skjer fast hver tirsdag og torsdag. Du finner direkte lenker til samlingene under "Klasserom / Video" i studentmenyen i forkant av timene.'
  }
];

export default function SupportCenter() {
  const navigate = useNavigate();
  const { user, showToast, submitSupportTicket } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [openFaq, setOpenFaq] = useState(null);

  // Support Form State
  const [contactForm, setContactForm] = useState({ name: '', email: user?.email || '', msg: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.msg.trim()) {
      showToast('Vennligst skriv en melding før du sender.');
      return;
    }
    setIsSubmitting(true);
    try {
      await submitSupportTicket({
        name: contactForm.name,
        email: contactForm.email,
        subject: 'Hjelpesenter forespørsel',
        message: contactForm.msg,
        source: 'support_center'
      });
      showToast('Hjelpeforespørsel sendt! Vi kontakter deg på e-post innen 24 timer.');
      setContactForm(prev => ({ ...prev, msg: '' }));
    } catch (err) {
      showToast('Klarte ikke å sende henvendelsen. Vennligst prøv igjen.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredArticles = ARTICLES.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCat === 'all' || art.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 py-6 md:py-10 flex flex-col gap-6 md:gap-8 font-sans max-w-5xl bg-[#f8fafc]/30">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-outline">
        <span 
          className="hover:text-primary cursor-pointer transition-colors" 
          onClick={() => navigate(user?.role === 'student' ? '/student/dashboard' : '/teacher/dashboard')}
        >
          Hjem
        </span>
        <ChevronRight size={12} />
        <span className="text-primary font-bold">Hjelpesenter</span>
      </div>

      {/* Hero Search Section */}
      <div className="bg-gradient-to-r from-[#561291] to-[#240046] rounded-2xl p-6 sm:p-10 text-white relative overflow-hidden shadow-lg border border-slate-800">
        <div className="absolute inset-0 opacity-15"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(197, 160, 89, 0.5), transparent 70%)' }} />
        
        <div className="relative z-10 max-w-xl space-y-4">
          <span className="px-3 py-1 rounded-full bg-[#c5a059]/25 text-[#f1d297] text-[10px] font-bold uppercase tracking-wider border border-[#c5a059]/30">
            Dokumentasjon & Støtte
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight leading-tight">
            Hvordan kan vi hjelpe deg i dag?
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            Søk i våre grundige artikler, teologiske oversikter og tekniske brukerveiledninger for både studenter og mentorer.
          </p>

          <div className="relative flex items-center bg-white text-slate-800 rounded-xl overflow-hidden shadow-md px-4 py-3.5 border border-slate-100 group focus-within:ring-2 focus-within:ring-[#c5a059]/40 transition-all">
            <Search size={18} className="text-slate-400 group-focus-within:text-[#561291] transition-colors shrink-0 mr-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Søk i hjelpeartikler (f.eks. oppgave, zoom, bibel)..."
              className="bg-transparent border-none focus:ring-0 text-sm outline-none w-full"
            />
          </div>
        </div>
      </div>

      {/* Main Support Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Article Catalog */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-wrap gap-1.5 pb-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedCat === cat.id 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'bg-white border border-outline-variant/30 text-on-surface-variant hover:text-primary hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredArticles.length > 0 ? (
                filteredArticles.map(art => {
                  // Map artikkel-id til path
                  let articlePath = '';
                  switch (art.id) {
                    case 'art-1':
                      articlePath = '/support/artikkel-logginn';
                      break;
                    case 'art-2':
                      articlePath = '/support/artikkel-chat';
                      break;
                    case 'art-3':
                      articlePath = '/support/artikkel-bibelkalkulator';
                      break;
                    case 'art-4':
                      articlePath = '/support/artikkel-zoom';
                      break;
                    case 'art-5':
                      articlePath = '/support/artikkel-veiledning';
                      break;
                    case 'art-6':
                      articlePath = '/support/artikkel-tjenestegaver';
                      break;
                    default:
                      articlePath = '/support';
                  }
                  return (
                    <motion.div
                      key={art.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white border border-outline-variant/30 hover:border-primary/30 p-5 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
                      onClick={() => navigate(articlePath)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-outline text-[9px] font-bold uppercase tracking-wider">
                            {CATEGORIES.find(c => c.id === art.category)?.label}
                          </span>
                          <PlayCircle size={14} className="text-slate-400 group-hover:text-primary transition-colors" />
                        </div>
                        <h3 className="font-serif font-bold text-primary text-sm group-hover:text-[#c5a059] transition-colors leading-snug">
                          {art.title}
                        </h3>
                        <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                          {art.desc}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-outline font-semibold border-t border-slate-100 pt-3 mt-4">
                        <span>{art.views}</span>
                        <span>{art.time}</span>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-12 text-center bg-white border border-outline-variant/30 rounded-xl space-y-3"
                >
                  <HelpCircle size={32} className="mx-auto text-slate-300" />
                  <h4 className="text-sm font-bold text-primary">Ingen artikler funnet</h4>
                  <p className="text-xs text-outline font-medium">Prøv et annet søkeord eller endre kategorifilteret.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Interactive FAQs Section */}
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="font-serif text-base font-bold text-primary flex items-center gap-2">
              <HelpIcon size={16} className="text-[#c5a059]" /> Ofte stilte spørsmål (FAQ)
            </h2>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="border border-outline-variant/20 rounded-xl overflow-hidden transition-all">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex justify-between items-center px-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 text-left text-xs font-bold text-primary transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown size={14} className={`text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-4 py-3 text-xs text-on-surface-variant leading-relaxed font-medium bg-white border-t border-slate-100">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Sidebar & Contact Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-primary text-sm flex items-center gap-2">
              <MessageSquare size={16} className="text-[#c5a059]" /> Direkte hjelp
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
              Finner du ikke løsningen? Vårt støtteteam står klare til å hjelpe deg med dine studie- eller portalspørsmål.
            </p>

            <form onSubmit={handleContactSubmit} className="space-y-3.5 pt-2">
              <div>
                <label className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">Ditt navn</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ditt navn..."
                  className="w-full p-2.5 bg-slate-50 border border-outline-variant/30 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">E-postadresse</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="E-postadresse..."
                  className="w-full p-2.5 bg-slate-50 border border-outline-variant/30 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">Hva trenger du hjelp til?</label>
                <textarea
                  rows={4}
                  value={contactForm.msg}
                  onChange={(e) => setContactForm(prev => ({ ...prev, msg: e.target.value }))}
                  placeholder="Skriv din henvendelse her..."
                  className="w-full p-2.5 bg-slate-50 border border-outline-variant/30 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium resize-none leading-relaxed"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#561291] hover:bg-[#0f344c] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow transition-all active:scale-[0.97] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Sender...</span>
                ) : (
                  <>
                    <Send size={12} />
                    <span>Send henvendelse</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-[#c5a059]/10 border border-[#c5a059]/20 rounded-2xl p-6 space-y-3.5">
            <h4 className="text-xs font-bold text-[#866324] uppercase tracking-wider">Hurtigguider</h4>
            <div className="space-y-2 text-xs font-semibold text-primary">
              <button 
                onClick={() => showToast('Starter videoguide...')} 
                className="flex items-center gap-2 hover:text-[#c5a059] transition-colors text-left"
              >
                <PlayCircle size={14} className="text-[#c5a059]" /> 
                <span>Video: Kom i gang med portalen</span>
              </button>
              <button 
                onClick={() => navigate('/student/library')} 
                className="flex items-center gap-2 hover:text-[#c5a059] transition-colors text-left"
              >
                <BookOpen size={14} className="text-[#c5a059]" /> 
                <span>Dokumentasjon: Studiehåndboken 2026</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
