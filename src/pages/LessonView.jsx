import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { 
  GraduationCap, Search, Bell, Power, Compass, BookOpen, CheckSquare, Users, 
  ArrowLeft, ArrowRight, CheckCircle, PlayCircle, ExternalLink, Award, FileText 
} from 'lucide-react';
import HkmChatWidget from '@/components/HkmChatWidget';

export default function LessonView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, courses, logout, toggleModuleCompleted, showToast } = useApp();
  
  // Determine selected course from location state or default to prop101
  const courseId = location.state?.courseId || 'prop101';
  const course = courses.find(c => c.id === courseId) || courses[0];
  
  // Keep track of the active selected module in the lesson reading screen
  const [activeModuleIndex, setActiveModuleIndex] = useState(2); // Default to Module 3
  
  const currentModule = course.modules[activeModuleIndex] || course.modules[0];
 
  const handleToggleModule = (modId, e) => {
    e.stopPropagation(); // Avoid selecting module when clicking checkbox
    toggleModuleCompleted(course.id, modId);
    showToast("Kursfremgang oppdatert!");
  };

  const handleNextModule = () => {
    if (activeModuleIndex < course.modules.length - 1) {
      setActiveModuleIndex(prev => prev + 1);
    } else {
      showToast("Du har nådd slutten av dette kurset!");
    }
  };

  const handlePrevModule = () => {
    if (activeModuleIndex > 0) {
      setActiveModuleIndex(prev => prev - 1);
    }
  };

  const handleLogOut = () => {
    logout();
    navigate('/');
  };

  // Simulated high-fidelity content for active modules
  const getModuleText = (title) => {
    if (course.id === 'prop101') {
      return (
        <div className="font-serif space-y-6 text-on-surface leading-relaxed text-base md:text-lg">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-4">{title}</h2>
          <p>
            Velkommen til denne modulen i profetisk utrustning. I dette kapittelet skal vi ta for oss det bibelske og teologiske grunnlaget for den profetiske tjenesten. Åndelig skjelneevne og det å høre Guds stemme handler ikke om egne prestasjoner, men om et nært og levende fellesskap med Den Hellige Ånd.
          </p>
          <blockquote className="border-l-4 border-primary pl-6 py-2 my-8 italic text-on-surface-variant bg-surface-container-low/50 rounded-r-lg">
            "Men den som taler profetisk, taler for mennesker, til oppbyggelse, formaning og trøst." — 1. Korinterbrev 14:3
          </blockquote>
          <p>
            Gjennom de kommende avsnittene vil vi utforske profetiens tre kjerneområder: oppbyggelse, formaning (oppmuntring til helliggjørelse) og trøst. Som profetisk student er det avgjørende at du lar kjærligheten være drivkraften i all din betjening.
          </p>
          <h3 className="font-serif text-xl font-bold text-primary pt-4">Den profetiske karakteren og sunn etikk</h3>
          <p>
            Uten en solid karakter vil enhver profetisk gave før eller siden lide skipbrudd. Vi må tillate at Guds ord ransaker våre hjerter, slik at vi formidler Hans budskap rent og uten personlige motiver eller manipulasjon.
          </p>
          <div className="my-8 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 font-sans space-y-3">
            <p className="text-xs font-bold text-primary uppercase tracking-wide">Praktisk oppgave for uken</p>
            <p className="text-xs text-on-surface-variant">
              Reflekter over en situasjon der du opplevde å motta et inntrykk eller ord fra Herren. Hvordan testet du dette ordet mot skriften, og hva ble frukten av det? Skriv 300-500 ord.
            </p>
            <button 
              onClick={() => navigate('/student/assignments')}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-container transition-all active:scale-95"
            >
              Gå til innlevering
            </button>
          </div>
        </div>
      );
    } else if (course.id === 'bible301') {
      return (
        <div className="font-serif space-y-6 text-on-surface leading-relaxed text-base md:text-lg">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-4">{title}</h2>
          <p>
            Velkommen til denne avanserte modulen i bibelsk hermeneutikk. I dette kapittelet fokuserer vi på historisk-grammatisk eksegese og tolkning. Å tolke Bibelen krever at vi forstår teksten i dens opprinnelige historiske, kulturelle og litterære kontekst før vi anvender den på vår egen tid.
          </p>
          <blockquote className="border-l-4 border-primary pl-6 py-2 my-8 italic text-on-surface-variant bg-surface-container-low/50 rounded-r-lg">
            "Gjør ditt ytterste for å stå din prøve overfor Gud, som en arbeider som ikke har noe å skamme seg over, en som deler sannhetens ord på rett vis." — 2. Timoteusbrev 2:15
          </blockquote>
          <p>
            Gjennom disse studiene skal vi se på de store paktlinjene som spenner fra Genesis to Johannes' åpenbaring. Ved å forstå paktsteologien vil du oppdage hvordan Det Gamle og Det Nye Testamente henger uløselig sammen og peker frem mot Kristus.
          </p>
          <h3 className="font-serif text-xl font-bold text-primary pt-4">Hermeneutikkens gyldne regel</h3>
          <p>
            En tekst kan aldri bety noe i dag som den aldri kunne bety for sin opprinnelige forfatter og sine opprinnelige lesere. Vi må unngå å lese våre egne moderne fordommer og idéer inn i de hellige skrifter (eisegetikk), og i stedet trekke betydningen ut av teksten (eksegese).
          </p>
          <div className="my-8 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 font-sans space-y-3">
            <p className="text-xs font-bold text-primary uppercase tracking-wide">Praktisk oppgave for uken</p>
            <p className="text-xs text-on-surface-variant">
              Velg en profetisk passasje fra Det Gamle Testamente (f.eks. Jesaja 53 eller Daniel 7) og utfør en kort historisk-grammatisk eksegese basert på de hermeneutiske verktøyene du har lært. Skriv 400-600 ord.
            </p>
            <button 
              onClick={() => navigate('/student/assignments')}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-container transition-all active:scale-95"
            >
              Gå til innlevering
            </button>
          </div>
        </div>
      );
    } else { // min201
      return (
        <div className="font-serif space-y-6 text-on-surface leading-relaxed text-base md:text-lg">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-4">{title}</h2>
          <p>
            Velkommen til denne modulen om sjelesorg og indre helbredelse. I dette kapittelet utforsker vi sjelesorgens bibelske fundament og den åndelige veiledningens dynamikk. Vårt kall som menighetsledere er å møte brutte mennesker med Kristi kjærlighet og lede dem inn i åndelig og emosjonell frihet.
          </p>
          <blockquote className="border-l-4 border-primary pl-6 py-2 my-8 italic text-on-surface-variant bg-surface-container-low/50 rounded-r-lg">
            "Herrens Ånd er over meg, for han har salvet meg til å forkynne et godt budskap for fattige. Han har sendt meg for å rope ut at fanger skal få frihet og blinde få synet igjen, for å sette undertrykte i frihet..." — Lukas 4:18
          </blockquote>
          <p>
            Gjennom undervisningen vil vi lære hvordan vi kombinerer sunn bibelsk sjelesorg med en dyp avhengighet av Den Hellige Ånds åpenbaring og gaver (f.eks. kunnskapsord og visdomsord) for å identifisere og lege indre sår, utilgivelse og åndelige bindinger.
          </p>
          <h3 className="font-serif text-xl font-bold text-primary pt-4">Pastoral etikk og konfidensialitet</h3>
          <p>
            Taushetsplikten og den pastorale etikken er absolutte hjørnesteiner i all sjelesorg. Som sjelesørger må du skape et trygt rom preget av fullstendig konfidensialitet, dyp empati og uforbeholden nåde.
          </p>
          <div className="my-8 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 font-sans space-y-3">
            <p className="text-xs font-bold text-primary uppercase tracking-wide">Praktisk oppgave for uken</p>
            <p className="text-xs text-on-surface-variant">
              Analyser et case-studie om sjelesorg og indre helbredelse. Skisser en veiledningsplan som kombinerer skriftbaserte prinsipper med sensitivitet for Den Hellige Ånds ledelse. Skriv 300-500 ord.
            </p>
            <button 
              onClick={() => navigate('/student/assignments')}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-container transition-all active:scale-95"
            >
              Gå til innlevering
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col font-sans text-on-surface pb-20 md:pb-0">
      {/* Top Navbar */}
      <header className="bg-white border-b border-outline-variant/30 sticky top-0 z-40 shadow-sm">
        <div className="flex justify-between items-center w-full px-4 sm:px-6 md:px-12 max-w-[1440px] mx-auto h-20">
          <div className="font-serif text-lg sm:text-2xl font-bold text-primary flex items-center gap-1.5 sm:gap-2 cursor-pointer truncate mr-2" onClick={() => navigate('/student/dashboard')}>
            <GraduationCap className="text-primary shrink-0" size={24} />
            <span className="truncate">His Kingdom Prophets</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('/student/dashboard')} className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">Dashboard</button>
            <button onClick={() => navigate('/student/library')} className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">Kursbibliotek</button>
            <button onClick={() => navigate('/student/assignments')} className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">Oppgaver</button>
            <button onClick={() => navigate('/student/chat')} className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">Fellesskap</button>
          </nav>

          <div className="flex items-center gap-4 text-primary shrink-0">
            <div className="hidden lg:flex items-center bg-surface-container-low rounded-lg px-4 border border-outline-variant/30 py-2 w-64">
              <Search className="text-on-surface-variant mr-2" size={16} />
              <input className="bg-transparent border-none focus:ring-0 text-xs w-full outline-none" placeholder="Søk i plattformen..." type="text"/>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4 text-primary">
              <button className="relative hover:opacity-80 transition-all p-1 shrink-0">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-burnt-orange rounded-full"></span>
              </button>
              <div className="flex items-center gap-2 sm:gap-2.5 pl-2 border-l border-outline-variant/30 shrink-0">
                <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full object-cover border border-primary/20 shrink-0" />
                <span className="hidden sm:inline text-xs font-semibold text-on-surface">{user?.name}</span>
                <button onClick={handleLogOut} className="hover:text-red-500 transition-colors p-1" title="Logg ut">
                   <Power size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar & Lesson content canvas */}
      <div className="flex flex-1 w-full max-w-[1440px] mx-auto">
        
        {/* Lesson Modules Sidebar */}
        <aside className="bg-white border-r border-outline-variant/20 w-80 h-[calc(100vh-80px)] sticky top-20 hidden md:flex flex-col py-8 px-6 overflow-y-auto shrink-0">
          <div className="space-y-6">
            <button 
              onClick={() => navigate('/student/library')} 
              className="flex items-center gap-2 text-xs font-bold text-primary hover:underline uppercase tracking-wide"
            >
              <ArrowLeft size={14} />
              <span>Tilbake til biblioteket</span>
            </button>

            <div>
              <span className="bg-primary/5 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                {course.code}
              </span>
              <h2 className="font-serif font-bold text-primary text-lg mt-3">{course.title}</h2>
              <p className="text-xs text-outline font-medium mt-1">Av {course.instructor}</p>
            </div>

            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full transition-all duration-300" style={{ width: `${course.progress}%` }}></div>
            </div>
            <p className="text-[10px] text-outline font-bold uppercase tracking-wider">{course.progress}% FULLFØRT ({course.modulesCompleted} av {course.totalModules} moduler)</p>

            <nav className="space-y-1.5 pt-4 border-t border-slate-100">
              {course.modules.map((mod, index) => (
                <div
                  key={mod.id}
                  onClick={() => setActiveModuleIndex(index)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-lg text-xs transition-all cursor-pointer ${
                    activeModuleIndex === index 
                      ? 'bg-primary/5 border border-primary/20 text-primary font-bold shadow-sm' 
                      : 'hover:bg-slate-50 text-on-surface-variant border border-transparent'
                  }`}
                >
                  <span className="line-clamp-2 pr-2">{mod.title}</span>
                  <button 
                    onClick={(e) => handleToggleModule(mod.id, e)}
                    className="shrink-0"
                    title={mod.completed ? "Marker som ufullført" : "Marker som fullført"}
                  >
                    <CheckCircle 
                      size={16} 
                      className={`transition-all ${
                        mod.completed 
                          ? 'fill-primary text-white font-bold' 
                          : 'text-outline/40 hover:text-primary/60'
                      }`} 
                    />
                  </button>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Lesson Reading Panel */}
        <main className="flex-1 p-4 sm:p-6 md:p-10 lg:p-12 overflow-x-hidden">
          <div className="max-w-[760px] mx-auto space-y-8">
            
            {/* Top course info card */}
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileText className="text-primary shrink-0" size={24} />
                <div>
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wide">Gjeldende leksjon</h4>
                  <p className="text-sm font-semibold text-on-surface mt-0.5">{currentModule.title}</p>
                </div>
              </div>

              {/* Zoom Join Card */}
              <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg border border-outline-variant/30 text-xs font-bold text-primary">
                <PlayCircle className="text-burnt-orange" size={16} />
                <span>Neste live-samling: {course.code} Live</span>
                <a 
                  href={course.zoomLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-burnt-orange pl-2 border-l border-slate-100 hover:underline flex items-center gap-0.5"
                >
                  Bli med <ExternalLink size={10} />
                </a>
              </div>
            </div>

            {/* Main scholarly text */}
            <motion.div 
              key={currentModule.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-outline-variant/20 shadow-sm p-5 sm:p-8 md:p-12 rounded-xl sm:rounded-2xl"
            >
              {getModuleText(currentModule.title)}
            </motion.div>

            {/* Stepper Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-100 text-xs font-bold">
              <button 
                onClick={handlePrevModule}
                disabled={activeModuleIndex === 0}
                className="flex items-center gap-1.5 px-5 py-3 border border-outline-variant/30 rounded-lg bg-white text-on-surface hover:bg-slate-50 disabled:opacity-40"
              >
                <ArrowLeft size={14} />
                <span>Forrige modul</span>
              </button>

              <button 
                onClick={handleNextModule}
                className="flex items-center gap-1.5 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-container shadow"
              >
                <span>Neste modul</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant/30 z-40 flex justify-around py-3 shadow-lg">
        <button onClick={() => navigate('/student/dashboard')} className="flex flex-col items-center gap-0.5 text-xs text-on-surface-variant hover:text-primary transition-colors">
          <Compass size={18} />
          <span>Dashboard</span>
        </button>
        <button onClick={() => navigate('/student/library')} className="flex flex-col items-center gap-0.5 text-xs text-primary font-bold">
          <BookOpen size={18} />
          <span>Kurs</span>
        </button>
        <button onClick={() => navigate('/student/assignments')} className="flex flex-col items-center gap-0.5 text-xs text-on-surface-variant hover:text-primary transition-colors">
          <CheckSquare size={18} />
          <span>Oppgaver</span>
        </button>
        <button onClick={() => navigate('/student/chat')} className="flex flex-col items-center gap-0.5 text-xs text-on-surface-variant hover:text-primary transition-colors">
          <Users size={18} />
          <span>Fellesskap</span>
        </button>
      </div>

      <HkmChatWidget />
    </div>
  );
}
