import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { 
  Compass, BookOpen, Book, Video, CheckSquare, Users, 
  Menu, Bell, Power, Search, Award, GraduationCap, ChevronLeft, User,
  Gift, HelpCircle, X, Globe, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HkmChatWidget from '@/components/HkmChatWidget';
import CmsText from '@/components/CmsText';
import logo from '@/assets/logo.png';

const SEARCH_DATABASE = [
  // Bibelske personer
  {
    id: "p-elias",
    category: "Bibelsk Person",
    title: "Elias",
    subtitle: "Profetisk dristighet og Guds stille hvisken",
    description: "En av de mest kraftfulle profetene i GT, kjent for Karmelfjellets ild og å høre Guds stemme i en stille susen.",
    details: "Elias demonstrerte Guds overveldende makt over avgudene (Baal), men opplevde også dyp motløshet der Gud møtte ham ikke i stormen eller ilden, men i 'en stille hvisken' (1. Kong 19). Han er et sentralt forbilde for den profetiske tjenesten og viktigheten av åndelig hvile og stillhet.",
    verses: "1. Kongebok 17-19, Jakob 5:17",
    relatedCourse: "PROP 101 (Modul 1: Profetisk historie)"
  },
  {
    id: "p-jesaja",
    category: "Bibelsk Person",
    title: "Jesaja",
    subtitle: "Messianske åpenbaringer og Guds hellighet",
    description: "Kjent for storslåtte profetier om Jesu fødsel, lidelse og framtidige herlighet.",
    details: "Jesaja fikk et skjellsettende syn av Guds trone i tempelet (Jesaja 6) og ropte: 'Her er jeg, send meg!'. His bok inneholder de mest detaljerte profetiene om Messias som den lidende tjener (Jesaja 53) og hans jomfrufødsel (Jesaja 7:14). Han viser oss betydningen av profetisk vigsling.",
    verses: "Jesaja 6:1-8, Jesaja 53:1-12",
    relatedCourse: "BIBLE 301 (Modul 4: Typologi i GT)"
  },
  {
    id: "p-jeremia",
    category: "Bibelsk Person",
    title: "Jeremia",
    subtitle: "Profetisk trofasthet og den nye pakt",
    description: "Den gråtende profeten som forkynte Guds ord under dyp motstand og forutsa den nye pakt.",
    details: "Jeremia ble kalt fra mors liv (Jeremia 1) og bar et tungt budskap om dom over Jerusalem. Samtidig bar han Guds hjerte og tårer. Han profeterte om 'den nye pakt' der Guds lov skrives i hjertene (Jeremia 31), og illustrerte Guds suverenitet i pottemakerens hus (Jeremia 18).",
    verses: "Jeremia 1:4-10, Jeremia 31:31-34",
    relatedCourse: "PROP 101 (Modul 1) & BIBLE 301 (Modul 2: Paktsteologi)"
  },
  {
    id: "p-david",
    category: "Bibelsk Person",
    title: "David",
    subtitle: "Hjertet for tilbedelse og Guds pakt",
    description: "Konge, kriger og salmist. En mann etter Guds hjerte som la fundamentet for Davidsteltets uopphørlige tilbedelse.",
    details: "David forente det profetiske og tilbedelsen ved å reise opp Davidsteltet (Tabernaklet), hvor levitter tilba Gud ansikt to ansikt uten slør. Han skrev mesteparten av Salmene og mottok Davids-pakten om et evig kongedømme, som oppfylles fullt ut i Jesus Kristus.",
    verses: "1. Samuel 16:13, Salmene 23, Amos 9:11",
    relatedCourse: "WOR 401 (Lovsang & Tilbedelse) & BIBLE 301"
  },
  {
    id: "p-moses",
    category: "Bibelsk Person",
    title: "Moses",
    subtitle: "Lovgiveren og paktens formidler",
    description: "Formidlet den gamle pakt på Sinai, førte folket ut av Egypt, og møtte Gud ansikt til ansikt.",
    details: "Moses er preget av enestående ydmykhet og intimitet med Gud. Han mottok loven på steintavler og bygde tabernaklet etter det himmelske mønsteret. Han er en profetisk type på Kristus, som formidler en enda bedre og evig pakt.",
    verses: "Exodus 33:11, Deuteronomium 18:15",
    relatedCourse: "BIBLE 301 (Modul 2: Paktsteologi)"
  },
  {
    id: "p-paulus",
    category: "Bibelsk Person",
    title: "Paulus",
    subtitle: "Apostolisk teologi og nådens åpenbaring",
    description: "Hedningenes apostel, forfatter av de fleste brevene i NT, teologen bak rettferdiggjørelse av tro.",
    details: "Paulus ble dramatisk omvendt på veien til Damaskus. Han mottok åpenbaringen om nåden og 'Kristus i dere, håpet om herlighet'. Hans teologi danner ryggraden i sunn kristen skriftforståelse og menighetsbygging.",
    verses: "Romerne 8:1-2, Galaterne 2:20, Efeserne 2:8-9",
    relatedCourse: "BIBLE 301 (Modul 1: Hermeneutikk)"
  },
  {
    id: "p-peter",
    category: "Bibelsk Person",
    title: "Peter",
    subtitle: "Apostolisk frimodighet og menighetens klippe",
    description: "Disippellederen som etter pinse forkynte med enorm åndskraft og åpnet døren for hedningene.",
    details: "Fra å fornekte Jesus i frykt, ble Peter fylt med Den Hellige Ånd på pinsehoveddagen og reiste opp 3000 sjeler med én preken. Han demonstrerte Åndens gaver i praksis og la fundamentet for en sunn, apostolisk menighet.",
    verses: "Matteus 16:18, Apostlenes gjerninger 2:14-41",
    relatedCourse: "PROP 101 (Modul 7: Tjenestegaver)"
  },
  {
    id: "p-johannes",
    category: "Bibelsk Person",
    title: "Johannes",
    subtitle: "Kjærlighetens apostel og apokalyptiske syner",
    description: "Forfatter av Johannesevangeliet, brevene og Johannes' åpenbaring. Kjent for dyp intimitet med Jesus.",
    details: "Johannes lå inntil Jesu bryst under nattverden og mottok senere på øya Patmos den mest omfattende endetidsåpenbaringen (Apokalypsen). Han viser oss koblingen mellom dyp kjærlighet til Gud og mottakelse av dype hemmeligheter og endetidssyner.",
    verses: "Johannes 13:23, Johannes' åpenbaring 1:1-3",
    relatedCourse: "BIBLE 301 (Modul 6: Johannes åpenbaring)"
  },

  // Bibelske emner
  {
    id: "e-profetisk",
    category: "Bibelsk Emne",
    title: "Profetisk Tjeneste & Utrustning",
    subtitle: "Å høre Guds stemme i nytestamentlig tid",
    description: "Læren om profetiens funksjon, gaver (syner, drømmer) og prøving av budskap i menigheten.",
    details: "Nytestamentlig profeti har som formål å oppbygge, formane og trøste (1. Kor 14:3). Den er tilgjengelig for alle troende under Åndens ledelse, men må alltid prøves mot Guds skrevne ord og bedømmes i kjærlighet.",
    verses: "1. Korinterbrev 14:1-3, Efeserne 4:11-12",
    relatedCourse: "PROP 101 (Innføring i den Profetiske Tjeneste)"
  },
  {
    id: "e-hermeneutikk",
    category: "Bibelsk Emne",
    title: "Hermeneutikk & Eksegese",
    subtitle: "Sunn tolkning av Guds ord",
    description: "Metoder for å forstå bibelske tekster ut fra opprinnelig historisk, grammatisk og teologisk kontekst.",
    details: "Avansert hermeneutikk hjelper oss å unngå 'eisegese' (å lese egne meninger inn i teksten) og i stedet trekke ut forfatterens sanne intensjon (eksegese) ved å analysere historisk bakgrunn, sjanger og språk.",
    verses: "2. Timoteus 2:15, 2. Peter 1:20-21",
    relatedCourse: "BIBLE 301 (Avansert Hermeneutikk og Tolkning)"
  },
  {
    id: "e-eskatologi",
    category: "Bibelsk Emne",
    title: "Eskatologi & Endetid",
    subtitle: "Guds frelsesplan og historiens fullendelse",
    description: "Studiet av endetidens hendelser, Jesu gjenkomst, oppstandelsen og gjenopprettelsen av skaperverket.",
    details: "Eskatologi handler ikke om frykt, men om det salige håp. Gjennom paktsperspektivet ser vi Guds trofasthet mot sine løfter til Israel og menigheten, og hans endelige seier over synd, død og mørke.",
    verses: "Titus 2:13, Johannes' åpenbaring 21-22",
    relatedCourse: "BIBLE 301 (Modul 3 & Modul 6)"
  },
  {
    id: "e-sjelesorg",
    category: "Bibelsk Emne",
    title: "Sjelesorg & Indre helbredelse",
    subtitle: "Omsorg for sjelen og gjenopprettelse",
    description: "Bibelsk sjelesorg for å bringe Jesu helbredende kraft inn i emosjonelle og åndelige sår.",
    details: "Sjelesorg betyr 'omsorg for sjelen'. I lys av Guds ord lærer vi å lytte aktivt under Den Hellige Ånds veiledning, bringe tilgivelse og sannhet inn i smertefulle minner, og erfare frihet i Kristus.",
    verses: "Salmene 147:3, Lukas 4:18, Galaterne 6:2",
    relatedCourse: "MIN 201 (Sjelesorg og Menighetsledelse)"
  },

  // Bønn
  {
    id: "b-personlig",
    category: "Bønn & Åndelig Liv",
    title: "Personlig Bønn & Intimitet",
    subtitle: "Fellesskap med Faderen i det skjulte",
    description: "Nøkkelen til et levende kristenliv gjennom regelmessig bønn, stillhet og meditasjon.",
    details: "Jesus lærte oss å gå inn i vårt lønnkammer og be til vår Far i det skjulte (Matteus 6). Personlig bønn bygger en dyp relasjon av intimitet der vi ikke bare presenterer våre behov, men lytter to Guds hjerte.",
    verses: "Matteus 6:6, Lukas 5:16",
    relatedCourse: "PROP 101 (Modul 2: Å høre Guds stemme)"
  },
  {
    id: "b-forboenn",
    category: "Bønn & Åndelig Liv",
    title: "Profetisk Forbønn & Åndelig Kamp",
    subtitle: "Å be i overensstemmelse med Guds vilje",
    description: "Forbønn ledet av Den Hellige Ånd for å forløse Guds vilje på jorden.",
    details: "Profetisk forbønn skjer når Ånden viser oss hva vi skal be for (Romerne 8:26). Det innebærer å stå i gapet for andre, proklamere Guds løfter, og drive åndelig krigføring ved å rive ned fiendens festningsverker.",
    verses: "Romerne 8:26-27, Efeserne 6:18, 2. Korinter 10:4",
    relatedCourse: "PROP 101 (Modul 6: Profetisk forbønn)"
  },
  {
    id: "b-begjaer",
    category: "Bønn & Åndelig Liv",
    title: "Send inn Bønnebegjær",
    subtitle: "La oss stå sammen i tro og bønn",
    description: "Opplever du motstand eller bærer på en tung byrde? Send inn ditt bønnebegjær til våre mentorer og bønneteam.",
    details: "Plattformen har et dedikert bønneteam under ledelse av Pastor Siri Knutsen. Hver uke ber våre mentorer og sjelesørgere spesifikt over innsendte bønnebegjær under full taushetsplikt. Klikk for å sende inn en support- eller bønnehenvendelse.",
    verses: "Matteus 18:19-20, Jakob 5:16",
    route: "/student/support"
  },

  // Undervisning og Leksjoner
  {
    id: "u-prop101",
    category: "Undervisning & Kurs",
    title: "PROP 101: Innføring i den Profetiske Tjeneste",
    subtitle: "Utrustning til tjenestearbeid under Apostel David Hansen",
    description: "Et 8-modulers studieprogram for å lære å høre Guds stemme, tyde drømmer, og fungere sunt i tjenestegaver.",
    details: "Dette kurset dekker alt fra profetiens historie i GT og NT, skjelning av ånder, profetisk karakter, formidling av budskap, og samarbeid mellom tjenestegavene i den lokale menigheten.",
    verses: "Efeserne 4:11-13, 1. Korinter 14",
    route: "/student/library"
  },
  {
    id: "u-bible301",
    category: "Undervisning & Kurs",
    title: "BIBLE 301: Avansert Hermeneutikk og Tolkning",
    subtitle: "Dypdykk i bibeltolkning under Profet Jon Arild",
    description: "Lær historisk-grammatisk eksegese, paktsteologi, eskatologi, og hvordan du tolker symbolspråk.",
    details: "BIBLE 301 gir deg verktøyene til å tolke skriften sunt og unngå populære feiltolkninger. Vi går i dybden på paktsperspektivet, typologier og Johannes' åpenbaring.",
    verses: "2. Timoteus 2:15, Johannes 5:39",
    route: "/student/library"
  },
  {
    id: "u-min201",
    category: "Undervisning & Kurs",
    title: "MIN 201: Sjelesorg og Menighetsledelse",
    subtitle: "Pastoral omsorg og disippelskap under Pastor Siri Knutsen",
    description: "Et kurs for å utruste deg til å lede andre og betjene mennesker med indre sår i Jesu kjærlighet.",
    details: "Dette kurset kombinerer sunn menighetsteologi med praktiske sjelesorgverktøy. Tema inkluderer aktiv lytting, Den Hellige Ånds ledelse i samtaler, og personlig disippelskap.",
    verses: "Johannes 21:15-17, Galaterne 6:2",
    route: "/student/library"
  },
  // Kirkehistorie
  {
    id: "h-tidligkirke",
    category: "Kirkehistorie",
    title: "Den tidlige kirke & Patristikk",
    subtitle: "Apostlenes etterfølgere og paktens bevaring",
    description: "Tiden etter apostlene der kirken vokste under sterk forfølgelse og formulerte sine kjerne-trosbekjennelser.",
    details: "Patristikken (kirkefedrenes tid) strekker seg fra apostoliske fedre som Polykarp og Ignatius, til de store økumeniske konsilene (f.eks. Nikea i 325 og Kalkedon i 451). Her ble fundamentale sannheter om treenigheten og Jesu to naturer (fullt Gud og fullt menneske) definert mot kjetteri, og Bibelens kanon ble samlet og bekreftet.",
    verses: "Apostlenes gjerninger 20:28-30, 2. Timoteus 4:1-5",
    relatedCourse: "BIBLE 301 (Modul 7: Skriftens autoritet)"
  },
  {
    id: "h-reformasjon",
    category: "Kirkehistorie",
    title: "Reformasjonen",
    subtitle: "Tilbake til skriften alene (Sola Scriptura)",
    description: "Den åndelige og teologiske omveltningen på 1500-tallet som gjenreiste Bibelens autoritet.",
    details: "Anført av skikkelser som Martin Luther (som spikret opp de 95 tesene i Wittenberg i 1517), Jean Calvin og Huldrych Zwingli, brøt reformasjonen med ubibelske tradisjoner i den katolske kirken. Hovedsøylene var Sola Scriptura (Skriften alene), Sola Fide (Troen alene) og Sola Gratia (Nåden alene), som ga vanlige folk Bibelen på sitt eget morsmål.",
    verses: "Romerne 1:17, Efeserne 2:8-9",
    relatedCourse: "BIBLE 301 (Modul 1: Hermeneutikk)"
  },
  {
    id: "h-vekkelse",
    category: "Kirkehistorie",
    title: "Pinsevekkelsen & Åndens utgytelse",
    subtitle: "Azusa Street og gjenreisingen av Åndens gaver",
    description: "Den moderne karismatiske vekkelsen som startet i 1906 og gjenreiste Den Hellige Ånds dåp og gaver.",
    details: "Etter århundrer med rasjonalisme brøt pinsevekkelsen frem under ledelse av William J. Seymour i Azusa Street, Los Angeles i 1906. Her opplevde troende dåpen i Den Hellige Ånd, tale i tunger, helbredelser og en gjenreising av de profetiske gavene. Dette la grunnlaget for den globale pinsebevegelsen og moderne karismatisk kristendom.",
    verses: "Joel 3:1-2, Apostlenes gjerninger 2:1-4",
    relatedCourse: "PROP 101 (Modul 1: Profetisk historie)"
  },
  {
    id: "h-profetiskmoderne",
    category: "Kirkehistorie",
    title: "Den profetiske gjenreisingen i vår tid",
    subtitle: "Gjenopprettelse av tjenestegaver (Efeserne 4:11)",
    description: "Bevegelsen mot slutten av det 20. århundre som reetablerte profet- og apostelembetet i menigheten.",
    details: "I løpet av de siste tiårene har Guds Ånd brakt en dypere forståelse og gjenreising av tjenestegavene beskrevet i Efeserne 4:11 - spesielt profeten og apostelen. Målet er at menigheten ikke bare skal drives administrativt, men ledes av åpenbaring, skjelneevne og åndelig autoritet for å utruste de hellige til tjeneste.",
    verses: "Efeserne 4:11-13, Amos 3:7",
    relatedCourse: "PROP 101 (Modul 7: Tjenestegavenes samspill)"
  }
];

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, logout, showToast, changePersona, cmsContent, isAdminEditing, language, toggleLanguage, sendAssistantMessage } = useApp();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('Alle');
  const [selectedSearchItem, setSelectedSearchItem] = useState(null);
  
  const handleAskAssistant = (item) => {
    setIsSearchOpen(false);
    // Open assistant chat
    const event = new CustomEvent('hkm-open-chat');
    window.dispatchEvent(event);
    
    // Wait a moment for layout to stabilize, then trigger AI inquiry
    setTimeout(() => {
      sendAssistantMessage(language === 'en' ? `Tell me more about ${item.title}` : `Fortell meg mer om ${item.title}`);
    }, 300);
  };
  
  // Collapse state initialized from localStorage for persistence
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('hkm-student-sidebar-collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('hkm-student-sidebar-collapsed', isCollapsed);
  }, [isCollapsed]);

  useEffect(() => {
    const handleToggle = (e) => {
      if (e.detail !== undefined) {
        setIsCollapsed(e.detail);
      } else {
        setIsCollapsed(prev => !prev);
      }
    };
    window.addEventListener('hkm-toggle-student-sidebar', handleToggle);
    return () => window.removeEventListener('hkm-toggle-student-sidebar', handleToggle);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  useEffect(() => {
    if (user?.role && user.role !== 'student' && user.role !== 'admin' && user.role !== 'superadmin' && user?.email !== 'thomas@tk-design.no') {
      changePersona('student');
    }
  }, [user?.role, user?.email, changePersona]);



  const handleLogOut = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: language === 'en' ? 'Dashboard' : 'Dashboard', path: '/student/dashboard', icon: Compass },
    { name: language === 'en' ? 'Bible' : 'Bibelen', path: '/student/bible', icon: Book },
    { name: language === 'en' ? 'Curriculum & Courses' : 'Studieplan & Kurs', path: '/student/library', icon: BookOpen },
    { name: language === 'en' ? 'Lesson' : 'Leksjon', path: '/student/lesson', icon: GraduationCap },
    { name: language === 'en' ? 'Classroom / Video' : 'Klasserom / Video', path: '/student/video', icon: Video },
    { name: language === 'en' ? 'Assignments' : 'Oppgaver', path: '/student/assignments', icon: CheckSquare },
    { name: language === 'en' ? 'Prayer Community' : 'Bønnefellesskap', path: '/student/chat', icon: Users },
    { name: language === 'en' ? 'Partner Portal' : 'Partnerportal', path: '/student/partner', icon: Gift },
    { name: language === 'en' ? 'Help Center' : 'Hjelpesenter', path: '/student/support', icon: HelpCircle },
    { name: language === 'en' ? 'My Profile' : 'Min profil', path: '/student/profile', icon: User },
  ];

  return (
    <div className="bg-background min-h-screen flex flex-col font-sans text-on-surface pt-20">
      {/* Dynamic Header */}
      <header className="bg-white border-b border-outline-variant/30 fixed top-0 left-0 right-0 z-40 shadow-sm">
        <div className="flex justify-between items-center w-full px-4 sm:px-6 md:px-12 max-w-[1440px] mx-auto h-20">
          
          {/* Logo & Toggle Trigger */}
          <div className="flex items-center gap-3 mr-2 truncate">
            <button 
              onClick={toggleMenu}
              className="p-2 hover:bg-surface-container rounded-lg transition-colors active:scale-[0.97] text-primary shrink-0"
              title={isCollapsed ? "Åpne venstremeny" : "Lukk venstremeny"}
            >
              <Menu size={22} />
            </button>
            <div 
              className="font-serif text-lg sm:text-2xl font-bold text-primary flex items-center gap-2 cursor-pointer truncate" 
              onClick={() => navigate('/student/dashboard')}
            >
              <img 
                src={logo} 
                alt="His Kingdom Prophets Logo" 
                className="w-8 h-8 object-contain shrink-0" 
              />
              <span className="truncate"><CmsText slug="layout-logo-title" fallback="His Kingdom Prophets" /></span>
            </div>
          </div>

          {/* Search bar, notifications, avatar and logout */}
          <div className="flex items-center gap-4 text-primary shrink-0">
            {/* Clickable Search Trigger styling to match Spotlight trigger */}
            <div 
              onClick={() => {
                setIsSearchOpen(true);
                setSelectedSearchItem(null);
                setSearchQuery('');
              }}
              className="hidden xl:flex items-center bg-surface-container-low rounded-lg px-4 border border-outline-variant/30 py-2 w-60 relative cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <Search className="text-on-surface-variant mr-2 shrink-0" size={16} />
              <span className="text-xs text-outline font-medium select-none">
                {cmsContent?.['layout-search-placeholder'] || (language === 'en' ? 'Search platform...' : 'Søk i plattformen...')}
              </span>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4 text-primary">
              <button 
                onClick={() => {
                  setIsSearchOpen(true);
                  setSelectedSearchItem(null);
                  setSearchQuery('');
                }}
                className="xl:hidden hover:opacity-80 transition-all p-1.5 hover:bg-surface-container rounded-full shrink-0 flex items-center justify-center text-primary"
                title={language === 'en' ? "Search" : "Søk"}
              >
                <Search size={20} />
              </button>

              <button 
                onClick={toggleLanguage}
                className="p-1.5 hover:bg-surface-container rounded-full shrink-0 text-primary transition-all active:scale-95 flex items-center justify-center"
                title={language === 'no' ? 'Bytt til engelsk (Switch to English)' : 'Bytt til norsk (Switch to Norwegian)'}
              >
                <Globe size={20} />
              </button>
              
              <button 
                onClick={() => navigate('/student/chat')}
                className="relative hover:opacity-80 transition-all p-1.5 hover:bg-surface-container rounded-full shrink-0 flex items-center justify-center text-primary"
                title={language === 'en' ? "Messages / Prayer Community" : "Meldinger / Bønnefellesskap"}
              >
                <Bell size={20} />
              </button>
              
              {/* Superadmin System View Switcher */}
              {(['thomas@tk-design.no', 'knutsenthomas@gmail.com'].includes(user?.email?.toLowerCase()) || user?.email?.includes('superadmin')) && (
                <div className="hidden md:flex items-center gap-1 bg-[#561291]/5 p-1 rounded-xl border border-[#561291]/20 shrink-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#561291] px-2">Visning:</span>
                  {[
                    { role: 'student', label: 'Elev', path: '/student/dashboard' },
                    { role: 'teacher', label: 'Mentor', path: '/teacher/dashboard' },
                    { role: 'superadmin', label: 'Superadmin', path: '/admin/portal' }
                  ].map(opt => {
                    const isCurrent = user?.role === opt.role;
                    return (
                      <button
                        key={opt.role}
                        onClick={() => {
                          setUser(prev => ({ ...prev, role: opt.role }));
                          navigate(opt.path);
                          showToast(`Visning endret til ${opt.label}`);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                          isCurrent 
                            ? 'bg-[#561291] text-white shadow-sm font-bold' 
                            : 'text-[#46617b] hover:bg-[#561291]/10 hover:text-[#561291]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              )}
              
              <div className="flex items-center gap-2 sm:gap-2.5 pl-2 border-l border-outline-variant/30 shrink-0">
                <Link
                  to="/student/profile"
                  className="group flex items-center gap-2 sm:gap-2.5 rounded-xl px-1.5 py-1 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all active:scale-[0.98]"
                  title="Åpne min profil"
                  aria-label="Åpne min profil"
                >
                  <span className="relative shrink-0">
                    <img
                      src={user?.avatar}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full object-cover border border-primary/20 cursor-pointer transition-all group-hover:ring-2 group-hover:ring-primary/30 group-hover:ring-offset-2"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary text-white border-2 border-white flex items-center justify-center shadow-sm">
                      <User size={9} />
                    </span>
                  </span>
                  <span className="hidden md:flex flex-col text-left min-w-0">
                    <span className="text-xs font-bold text-on-surface whitespace-nowrap md:max-w-none group-hover:text-primary transition-colors">
                      {user?.name}
                    </span>
                    <span className="text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Student</span>
                  </span>
                </Link>
                <button 
                  onClick={handleLogOut} 
                  className="hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors" 
                  title="Logg ut"
                >
                  <Power size={18} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Main Content Layout with Sidebar */}
      <div className="flex flex-1 w-full max-w-[1440px] mx-auto relative min-h-[calc(100vh-80px)]">
        
        {/* Collapsible Left Sidebar */}
        <aside 
          className="bg-white border-r border-outline-variant/20 sticky top-20 hidden md:flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out overflow-hidden z-30"
          style={{ 
            width: isCollapsed ? '0px' : '288px',
            opacity: isCollapsed ? 0 : 1,
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
          }}
        >
          <div className="py-8 px-6 space-y-8 w-72 shrink-0">
            {/* Student profile summary card */}
            <button
              onClick={() => navigate('/student/profile')}
              className="px-2 text-left w-full rounded-xl hover:bg-surface-container-low transition-colors active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20"
              title="Åpne min profil"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="text-primary animate-pulse" size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface uppercase tracking-wider">{user?.name}</p>
                  <p className="text-[11px] text-on-surface-variant font-medium">Aktiv Utrustningsprofil</p>
                </div>
              </div>
              <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[45%]" style={{ transition: 'width 0.8s ease-in-out' }}></div>
              </div>
              <p className="text-[10px] text-on-surface-variant font-semibold mt-2">45% Total fullføringsgrad</p>
            </button>

            {/* Side Navigation Menu */}
            <nav className="space-y-1.5">
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                const IconComponent = item.icon;
                return (
                  <button 
                    key={item.path}
                    onClick={() => navigate(item.path)} 
                    className={`flex items-center gap-3 w-full px-4 py-3 text-sm transition-all rounded-lg font-medium text-left ${
                      isActive 
                        ? 'text-primary bg-primary/5 border-l-4 border-primary font-bold shadow-sm' 
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                    }`}
                  >
                    <IconComponent size={18} className={isActive ? 'text-primary' : 'text-on-surface-variant'} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar footer with minimize trigger */}
          <div className="p-6 w-72 shrink-0">
            <button
              onClick={() => setIsCollapsed(true)}
              className="flex items-center justify-center gap-1.5 w-full py-1.5 text-[10px] uppercase font-bold tracking-widest text-on-surface-variant hover:text-primary transition-all"
            >
              <ChevronLeft size={14} />
              <span>Skjul meny</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area rendering the child Route components */}
        <main className="flex-grow flex flex-col min-w-0 transition-all duration-300 relative">
          <div className="flex-grow">
            <Outlet />
          </div>
        </main>

      </div>

      {/* Mobile Navigation Drawer */}
      <div 
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop overlay */}
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className={`absolute inset-0 bg-slate-900/60 transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Sliding Menu Panel */}
        <aside
          className={`absolute top-0 bottom-0 left-0 w-72 bg-white flex flex-col justify-between shadow-2xl border-r border-outline-variant/20 overflow-y-auto h-full transition-transform duration-300 ease-out transform ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="py-6 px-6 space-y-6">
            {/* Header in Drawer */}
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
              <div className="font-serif text-lg font-bold text-primary flex items-center gap-2 cursor-pointer" onClick={() => { navigate('/student/dashboard'); setIsMobileMenuOpen(false); }}>
                <GraduationCap className="text-primary shrink-0 animate-pulse" size={20} />
                <span>His Kingdom Prophets</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 hover:bg-surface-container rounded-lg text-primary"
              >
                <X size={20} />
              </button>
            </div>

            {/* Student profile summary */}
            <button
              onClick={() => {
                navigate('/student/profile');
                setIsMobileMenuOpen(false);
              }}
              className="px-2 text-left w-full rounded-xl hover:bg-surface-container-low transition-colors active:scale-[0.99]"
              title="Åpne min profil"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="text-primary animate-pulse" size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface uppercase tracking-wider">{user?.name}</p>
                  <p className="text-[10px] text-on-surface-variant font-medium">Aktiv Utrustningsprofil</p>
                </div>
              </div>
              <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[45%]" style={{ transition: 'width 0.8s ease-in-out' }}></div>
              </div>
            </button>

            {/* Nav Items */}
            <nav className="space-y-1">
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                const IconComponent = item.icon;
                return (
                  <button 
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }} 
                    className={`flex items-center gap-3 w-full px-4 py-3 text-sm transition-all rounded-lg font-medium text-left ${
                      isActive 
                        ? 'text-primary bg-primary/5 border-l-4 border-primary font-bold shadow-sm' 
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                    }`}
                  >
                    <IconComponent size={18} className={isActive ? 'text-primary' : 'text-on-surface-variant'} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>


        </aside>
      </div>

      {/* SEARCH OVERLAY MODAL */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white shadow-2xl border border-outline-variant/60 rounded-3xl w-full max-w-4xl h-[550px] overflow-hidden flex flex-col text-on-surface"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Search bar inside modal */}
              <div className="flex items-center px-6 py-4 border-b border-outline-variant/30 gap-3">
                <Search className="text-[#561291] shrink-0" size={20} />
                <input 
                  type="text"
                  className="flex-grow bg-transparent border-none focus:ring-0 text-base outline-none font-medium placeholder-outline"
                  placeholder={language === 'en' ? "Search for biblical characters, topics, prayer, teaching..." : "Søk etter bibelske personer, emner, bønn, undervisning..."}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedSearchItem(null); // Reset detail view on type
                  }}
                  autoFocus
                />
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-outline hover:text-on-surface transition-colors active:scale-95 flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 border-b border-outline-variant/20 overflow-x-auto whitespace-nowrap scrollbar-none">
                {[
                  { id: 'Alle', label: language === 'en' ? 'All' : 'Alle' },
                  { id: 'Bibelsk Person', label: language === 'en' ? 'Biblical People' : 'Bibelske Personer' },
                  { id: 'Bibelsk Emne', label: language === 'en' ? 'Topics' : 'Bibelske Emner' },
                  { id: 'Bønn & Åndelig Liv', label: language === 'en' ? 'Prayer' : 'Bønn & Åndelighet' },
                  { id: 'Undervisning & Kurs', label: language === 'en' ? 'Teaching' : 'Undervisning' },
                  { id: 'Kirkehistorie', label: language === 'en' ? 'Church History' : 'Kirkehistorie' }
                ].map(chip => (
                  <button
                    key={chip.id}
                    onClick={() => {
                      setSearchFilter(chip.id);
                      setSelectedSearchItem(null);
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-[0.97] ${
                      searchFilter === chip.id 
                        ? 'bg-[#561291] text-white shadow-sm' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Main Body - Split Layout */}
              <div className="flex-grow flex overflow-hidden min-h-0">
                
                {/* LEFT PANEL: Results List */}
                <div className={`w-full ${selectedSearchItem ? 'hidden md:block md:w-1/2' : ''} border-r border-outline-variant/30 overflow-y-auto p-4 space-y-2 bg-slate-50/50`}>
                  {SEARCH_DATABASE.filter(item => {
                    if (searchFilter !== 'Alle' && item.category !== searchFilter) return false;
                    if (!searchQuery.trim()) return true;
                    const query = searchQuery.toLowerCase();
                    return (
                      item.title.toLowerCase().includes(query) ||
                      item.subtitle.toLowerCase().includes(query) ||
                      item.description.toLowerCase().includes(query) ||
                      item.details.toLowerCase().includes(query) ||
                      item.category.toLowerCase().includes(query) ||
                      (item.verses && item.verses.toLowerCase().includes(query))
                    );
                  }).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                      <HelpCircle size={40} className="text-outline/60 animate-bounce" />
                      <div>
                        <h4 className="font-serif font-bold text-slate-800">{language === 'en' ? "No matches found" : "Ingen treff funnet"}</h4>
                        <p className="text-xs text-outline max-w-[240px] mt-1">{language === 'en' ? "Try another search term or select another category filter" : "Prøv et annet søkeord eller endre kategorifilteret"}</p>
                      </div>
                    </div>
                  ) : (
                    SEARCH_DATABASE.filter(item => {
                      if (searchFilter !== 'Alle' && item.category !== searchFilter) return false;
                      if (!searchQuery.trim()) return true;
                      const query = searchQuery.toLowerCase();
                      return (
                        item.title.toLowerCase().includes(query) ||
                        item.subtitle.toLowerCase().includes(query) ||
                        item.description.toLowerCase().includes(query) ||
                        item.details.toLowerCase().includes(query) ||
                        item.category.toLowerCase().includes(query) ||
                        (item.verses && item.verses.toLowerCase().includes(query))
                      );
                    }).map(item => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedSearchItem(item)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                          selectedSearchItem?.id === item.id 
                            ? 'bg-white border-[#561291] shadow-md ring-1 ring-[#561291]/20' 
                            : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            item.category === 'Bibelsk Person' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            item.category === 'Bibelsk Emne' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                            item.category.includes('Bønn') ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                            item.category === 'Kirkehistorie' ? 'bg-cyan-50 text-cyan-700 border border-cyan-100' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {item.category}
                          </span>
                          {item.verses && (
                            <span className="text-[10px] text-outline font-medium truncate font-mono">{item.verses.split(',')[0]}</span>
                          )}
                        </div>
                        <h4 className="font-serif font-bold text-sm text-slate-800">{item.title}</h4>
                        <p className="text-xs text-outline line-clamp-2 mt-1">{item.subtitle || item.description}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* RIGHT PANEL: Details View */}
                <div className={`w-full ${!selectedSearchItem ? 'hidden md:flex' : 'flex'} md:w-1/2 flex-col bg-white overflow-y-auto p-6 justify-between`}>
                  {selectedSearchItem ? (
                    <div className="space-y-6 text-left flex-grow flex flex-col justify-between h-full">
                      <div className="space-y-4">
                        {/* Header in detail */}
                        <div>
                          {/* Back button for mobile view */}
                          <button 
                            onClick={() => setSelectedSearchItem(null)}
                            className="md:hidden flex items-center gap-1 text-xs font-bold text-[#561291] mb-3 hover:underline"
                          >
                            <ChevronLeft size={16} />
                            {language === 'en' ? "Back to list" : "Tilbake til listen"}
                          </button>
                          
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              selectedSearchItem.category === 'Bibelsk Person' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                              selectedSearchItem.category === 'Bibelsk Emne' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                              selectedSearchItem.category.includes('Bønn') ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                              selectedSearchItem.category === 'Kirkehistorie' ? 'bg-cyan-50 text-cyan-700 border border-cyan-100' :
                              'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}>
                              {selectedSearchItem.category}
                            </span>
                            {selectedSearchItem.relatedCourse && (
                              <span className="text-[10px] font-semibold text-[#561291]">{selectedSearchItem.relatedCourse}</span>
                            )}
                          </div>
                          <h3 className="font-serif font-bold text-xl text-[#561291] leading-tight">{selectedSearchItem.title}</h3>
                          <p className="text-xs text-outline font-medium mt-1 italic">{selectedSearchItem.subtitle}</p>
                        </div>

                        {/* Subtitle / Description */}
                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                          {selectedSearchItem.description}
                        </p>

                        {/* Detailed explanation */}
                        <div className="space-y-2">
                          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{language === 'en' ? "Biblical Significance" : "Bibelsk & Teologisk Betydning"}</h5>
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {selectedSearchItem.details}
                          </p>
                        </div>

                        {/* Scriptural reference */}
                        {selectedSearchItem.verses && (
                          <div className="flex items-start gap-2.5 bg-amber-50/40 border border-amber-100/60 p-3 rounded-xl">
                            <BookOpen size={16} className="text-amber-700 shrink-0 mt-0.5" />
                            <div className="text-xs">
                              <span className="font-bold text-amber-800 block mb-0.5">{language === 'en' ? "Scripture References" : "Bibelske Skriftsteder"}</span>
                              <span className="text-amber-900/90 font-medium font-mono">{selectedSearchItem.verses}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2 mt-6">
                        <button
                          onClick={() => handleAskAssistant(selectedSearchItem)}
                          className="flex-1 bg-[#561291] hover:bg-[#123247] text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
                        >
                          <MessageSquare size={14} />
                          {language === 'en' ? "Ask HKM Assistant" : "Spør HKM Assistent"}
                        </button>
                        {selectedSearchItem.route && (
                          <button
                            onClick={() => {
                              setIsSearchOpen(false);
                              navigate(selectedSearchItem.route);
                            }}
                            className="bg-white border border-[#561291] text-[#561291] hover:bg-[#561291]/5 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
                          >
                            {language === 'en' ? "Open Resource" : "Åpne Ressurs"}
                            <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-outline">
                      <HelpCircle size={48} className="text-slate-200 mb-3" />
                      <h4 className="font-serif font-bold text-slate-700 text-sm">{language === 'en' ? "Explore & Discover" : "Utforsk & Gå dypere"}</h4>
                      <p className="text-xs text-outline max-w-[200px] mt-1">
                        {language === 'en' 
                          ? "Select an item from the search list to see theological details, scriptural verses, and direct actions." 
                          : "Velg et element i søkelisten for å se dypere teologiske detaljer, bibelske referanser og direkte handlinger."}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global HKM Assistent Chat Widget rendered once at layout level */}
      <HkmChatWidget />
    </div>
  );
}
