import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, HelpCircle, BookOpen, User, ShieldAlert,
  ChevronDown, MessageSquare, Mail, Send, ChevronRight,
  Compass, ArrowRight, HelpCircle as HelpIcon, PlayCircle
} from 'lucide-react';
import CmsText from '@/components/CmsText';

const CATEGORIES = [
  { id: 'all', slug: 'support-cat-all', label: 'Alle artikler', labelEn: 'All Articles' },
  { id: 'startup', slug: 'support-cat-startup', label: 'Kom i gang', labelEn: 'Getting Started' },
  { id: 'portal', slug: 'support-cat-portal', label: 'Studentportal', labelEn: 'Student Portal' },
  { id: 'academic', slug: 'support-cat-academic', label: 'Kurs & Læreplan', labelEn: 'Course & Curriculum' },
  { id: 'technical', slug: 'support-cat-technical', label: 'Teknisk støtte', labelEn: 'Technical Support' },
  { id: 'mentoring', slug: 'support-cat-mentoring', label: 'Veiledning', labelEn: 'Mentoring' },
];

const ARTICLES = [
  {
    id: 'art-1',
    category: 'startup',
    titleSlug: 'support-art1-title',
    title: 'Slik logger du på for første gang',
    titleEn: 'How to Sign In for the First Time',
    descSlug: 'support-art1-desc',
    desc: 'En rask innføring i pålogging med e-post, Google eller Apple, samt utfylling av din tjenesteprofil.',
    descEn: 'A quick introduction to logging in with email, Google, or Apple, and setting up your ministry profile.',
    views: '1.2k visninger',
    time: '2 min lesetid'
  },
  {
    id: 'art-2',
    category: 'portal',
    titleSlug: 'support-art2-title',
    title: 'Navigering i Bønnefellesskapet og chatten',
    titleEn: 'Navigating the Prayer Community & Chat',
    descSlug: 'support-art2-desc',
    desc: 'Hvordan bruke det integrerte samtalerommet til å dele åpenbaringer, bønnebegjær og chatte med andre.',
    descEn: 'How to use the integrated chat room to share revelations, prayer requests, and connect with peers.',
    views: '840 visninger',
    time: '3 min lesetid'
  },
  {
    id: 'art-3',
    category: 'academic',
    titleSlug: 'support-art3-title',
    title: 'Bruk av Bibelkalkulatoren for karakterer',
    titleEn: 'Using the Bible Grade Calculator',
    descSlug: 'support-art3-desc',
    desc: 'Slik fungerer det vektede karaktersystemet og oppgavevurderingen på plattformen.',
    descEn: 'How the weighted grading system and assignment evaluation works on the platform.',
    views: '920 visninger',
    time: '4 min lesetid'
  },
  {
    id: 'art-4',
    category: 'technical',
    titleSlug: 'support-art4-title',
    title: 'Feilsøking ved Zoom- og videostrømmer',
    titleEn: 'Troubleshooting Zoom & Video Streams',
    descSlug: 'support-art4-desc',
    desc: 'Opplever du forsinkelser eller manglende lyd under live-samlingene? Følg disse enkle stegene.',
    descEn: 'Experiencing lag or missing audio during live gatherings? Follow these simple steps.',
    views: '650 visninger',
    time: '3 min lesetid'
  },
  {
    id: 'art-5',
    category: 'mentoring',
    titleSlug: 'support-art5-title',
    title: 'Hvordan bestille digital veiledningstid',
    titleEn: 'How to Book Digital Mentoring Time',
    descSlug: 'support-art5-desc',
    desc: 'Lær å koble deg opp på faglærers kontortid og starte din private videosamtale.',
    descEn: 'Learn how to book teacher office hours and launch your private video call.',
    views: '1.1k visninger',
    time: '2 min lesetid'
  },
  {
    id: 'art-6',
    category: 'academic',
    titleSlug: 'support-art6-title',
    title: 'Oversikt over de fem tjenestegavene',
    titleEn: 'Overview of the Fivefold Ministry Gifts',
    descSlug: 'support-art6-desc',
    desc: 'En teologisk og praktisk guide til hvordan apostoliske, profetiske, evangeliske, pastorale og læregaver ruster kirken.',
    descEn: 'A theological and practical guide to how apostolic, prophetic, evangelistic, pastoral, and teaching gifts equip the church.',
    views: '1.4k visninger',
    time: '6 min lesetid'
  }
];

const FAQS = [
  {
    qSlug: 'support-faq1-q',
    aSlug: 'support-faq1-a',
    q: 'Hvordan leverer jeg inn skriftlige essay- og sjelesorg-oppgaver?',
    qEn: 'How do I submit written essays and assignments?',
    a: 'Du navigerer til "Oppgaver" i studentmenyen, klikker på gjeldende oppgave, skriver inn din besvarelse eller laster opp en PDF, og trykker på "Send inn oppgave". Mentoren din vil da bli varslet automatisk.',
    aEn: 'Navigate to "Assignments" in the student menu, click the assignment, write your response or upload a PDF, and click "Submit Assignment". Your mentor will be notified automatically.'
  },
  {
    qSlug: 'support-faq2-q',
    aSlug: 'support-faq2-a',
    q: 'Hvem har tilgang til mine profetiske åpenbaringsprofiler?',
    qEn: 'Who has access to my prophetic revelation profile?',
    a: 'Kun autoriserte mentorer (lærere) og administratorer har tilgang til din private åndelige profil og profilskisse for å gi deg best mulig disippelskap.',
    aEn: 'Only authorized mentors (teachers) and administrators have access to your private spiritual profile to provide the best possible discipleship.'
  },
  {
    qSlug: 'support-faq3-q',
    aSlug: 'support-faq3-a',
    q: 'Hvordan fungerer provisjonsutbetalingene i partnerportalen?',
    qEn: 'How do commission payouts work in the partner portal?',
    a: 'Når en ny student melder seg på et kurs via din unike affiliate-lenke, registreres salget umiddelbart. Du tjener 15% i provisjon som godkjennes månedlig og overføres direkte til din oppgitte konto.',
    aEn: 'When a new student signs up via your unique affiliate link, the sale is recorded instantly. You earn 15% commission, approved monthly and transferred directly to your account.'
  },
  {
    qSlug: 'support-faq4-q',
    aSlug: 'support-faq4-a',
    q: 'Hvor ofte arrangeres det live-undervisning og fellesbønn?',
    qEn: 'How often are live lectures and corporate prayer held?',
    a: 'Våre live-samlinger skjer fast hver tirsdag og torsdag. Du finner direkte lenker til samlingene under "Klasserom / Video" i studentmenyen i forkant av timene.',
    aEn: 'Our live gatherings are held every Tuesday and Thursday. Direct links are provided under "Classroom / Video" in the student menu before sessions.'
  }
];

export default function SupportCenter() {
  const navigate = useNavigate();
  const { user, showToast, submitSupportTicket, language } = useApp();

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
          <CmsText slug="support-breadcrumb-home" fallback={language === 'en' ? "Home" : "Hjem"} />
        </span>
        <ChevronRight size={12} />
        <span className="text-primary font-bold">
          <CmsText slug="support-breadcrumb-center" fallback={language === 'en' ? "Support Center" : "Hjelpesenter"} />
        </span>
      </div>

      {/* Hero Search Section */}
      <div className="bg-gradient-to-r from-[#561291] to-[#240046] rounded-2xl p-6 sm:p-10 text-white relative overflow-hidden shadow-lg border border-slate-800">
        <div className="absolute inset-0 opacity-15"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(197, 160, 89, 0.5), transparent 70%)' }} />
        
        <div className="relative z-10 max-w-xl space-y-4">
          <span className="px-3 py-1 rounded-full bg-[#c5a059]/25 text-[#f1d297] text-[10px] font-bold uppercase tracking-wider border border-[#c5a059]/30">
            <CmsText slug="support-hero-tag" fallback={language === 'en' ? "Documentation & Support" : "Dokumentasjon & Støtte"} />
          </span>
          <CmsText 
            slug="support-hero-title" 
            fallback={language === 'en' ? "How can we help you today?" : "Hvordan kan vi hjelpe deg i dag?"} 
            as="h1"
            className="font-serif text-2xl sm:text-4xl font-bold tracking-tight leading-tight"
          />
          <CmsText 
            slug="support-hero-desc" 
            fallback={language === 'en' ? "Search our thorough articles, theological overviews, and user guides for students and mentors." : "Søk i våre grundige artikler, teologiske oversikter og tekniske brukerveiledninger for både studenter og mentorer."} 
            as="p"
            className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium"
          />

          <div className="relative flex items-center bg-white text-slate-800 rounded-xl overflow-hidden shadow-md px-4 py-3.5 border border-slate-100 group focus-within:ring-2 focus-within:ring-[#c5a059]/40 transition-all">
            <Search size={18} className="text-slate-400 group-focus-within:text-[#561291] transition-colors shrink-0 mr-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'en' ? "Search help articles (e.g. assignments, zoom, bible)..." : "Søk i hjelpeartikler (f.eks. oppgave, zoom, bibel)..."}
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
                <CmsText slug={cat.slug} fallback={language === 'en' ? cat.labelEn : cat.label} />
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredArticles.length > 0 ? (
                filteredArticles.map(art => {
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
                            <CmsText 
                              slug={CATEGORIES.find(c => c.id === art.category)?.slug || `support-cat-${art.category}`} 
                              fallback={language === 'en' ? (CATEGORIES.find(c => c.id === art.category)?.labelEn || art.category) : (CATEGORIES.find(c => c.id === art.category)?.label || art.category)} 
                            />
                          </span>
                          <PlayCircle size={14} className="text-slate-400 group-hover:text-primary transition-colors" />
                        </div>
                        <h3 className="font-serif font-bold text-primary text-sm group-hover:text-[#c5a059] transition-colors leading-snug">
                          <CmsText slug={art.titleSlug} fallback={language === 'en' ? art.titleEn : art.title} />
                        </h3>
                        <CmsText 
                          slug={art.descSlug} 
                          fallback={language === 'en' ? art.descEn : art.desc} 
                          as="p"
                          className="text-xs text-on-surface-variant leading-relaxed font-medium"
                        />
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
                  <CmsText slug="support-no-articles-title" fallback={language === 'en' ? "No articles found" : "Ingen artikler funnet"} as="h4" className="text-sm font-bold text-primary" />
                  <CmsText slug="support-no-articles-desc" fallback={language === 'en' ? "Try another search keyword or change the category filter." : "Prøv et annet søkeord eller endre kategorifilteret."} as="p" className="text-xs text-outline font-medium" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Interactive FAQs Section */}
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="font-serif text-base font-bold text-primary flex items-center gap-2">
              <HelpIcon size={16} className="text-[#c5a059]" /> 
              <CmsText slug="support-faqs-header" fallback={language === 'en' ? "Frequently Asked Questions (FAQ)" : "Ofte stilte spørsmål (FAQ)"} />
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
                      <span><CmsText slug={faq.qSlug} fallback={language === 'en' ? faq.qEn : faq.q} /></span>
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
                            <CmsText slug={faq.aSlug} fallback={language === 'en' ? faq.aEn : faq.a} />
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
              <MessageSquare size={16} className="text-[#c5a059]" /> 
              <CmsText slug="support-direct-title" fallback={language === 'en' ? "Direct Help" : "Direkte hjelp"} />
            </h3>
            <CmsText 
              slug="support-direct-desc" 
              fallback={language === 'en' ? "Cannot find the solution? Our support team is ready to help with your study or portal questions." : "Finner du ikke løsningen? Vårt støtteteam står klare til å hjelpe deg med dine studie- eller portalspørsmål."} 
              as="p"
              className="text-xs text-on-surface-variant leading-relaxed font-medium"
            />

            <form onSubmit={handleContactSubmit} className="space-y-3.5 pt-2">
              <div>
                <label className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">
                  <CmsText slug="support-form-label-name" fallback={language === 'en' ? "Your Name" : "Ditt navn"} />
                </label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={language === 'en' ? "Your name..." : "Ditt navn..."}
                  className="w-full p-2.5 bg-slate-50 border border-outline-variant/30 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">
                  <CmsText slug="support-form-label-email" fallback={language === 'en' ? "Email Address" : "E-postadresse"} />
                </label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={language === 'en' ? "Email address..." : "E-postadresse..."}
                  className="w-full p-2.5 bg-slate-50 border border-outline-variant/30 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">
                  <CmsText slug="support-form-label-message" fallback={language === 'en' ? "What do you need help with?" : "Hva trenger du hjelp til?"} />
                </label>
                <textarea
                  rows={4}
                  value={contactForm.msg}
                  onChange={(e) => setContactForm(prev => ({ ...prev, msg: e.target.value }))}
                  placeholder={language === 'en' ? "Describe your request here..." : "Skriv din henvendelse her..."}
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
                  <span><CmsText slug="support-form-submitting" fallback={language === 'en' ? "Submitting..." : "Sender..."} /></span>
                ) : (
                  <>
                    <Send size={12} />
                    <span><CmsText slug="support-form-submit" fallback={language === 'en' ? "Send Message" : "Send henvendelse"} /></span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-[#c5a059]/10 border border-[#c5a059]/20 rounded-2xl p-6 space-y-3.5">
            <h4 className="text-xs font-bold text-[#866324] uppercase tracking-wider">
              <CmsText slug="support-guides-title" fallback={language === 'en' ? "Quick Guides" : "Hurtigguider"} />
            </h4>
            <div className="space-y-2 text-xs font-semibold text-primary">
              <button 
                onClick={() => showToast('Starter videoguide...')} 
                className="flex items-center gap-2 hover:text-[#c5a059] transition-colors text-left"
              >
                <PlayCircle size={14} className="text-[#c5a059]" /> 
                <span><CmsText slug="support-guide1-title" fallback={language === 'en' ? "Video: Getting started with the portal" : "Video: Kom i gang med portalen"} /></span>
              </button>
              <button 
                onClick={() => navigate('/student/library')} 
                className="flex items-center gap-2 hover:text-[#c5a059] transition-colors text-left"
              >
                <BookOpen size={14} className="text-[#c5a059]" /> 
                <span><CmsText slug="support-guide2-title" fallback={language === 'en' ? "Documentation: Student Handbook 2026" : "Dokumentasjon: Studiehåndboken 2026"} /></span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
