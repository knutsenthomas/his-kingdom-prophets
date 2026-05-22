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
  
  // Determine selected course from location state or default to ped101
  const courseId = location.state?.courseId || 'ped101';
  const course = courses.find(c => c.id === courseId) || courses[0];
  
  // Keep track of the active selected module in the lesson reading screen
  const [activeModuleIndex, setActiveModuleIndex] = useState(2); // Default to Module 3 (Didaktikk)
  
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
    return (
      <div className="font-serif space-y-6 text-on-surface leading-relaxed text-base md:text-lg">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-4">{title}</h2>
        <p>
          Velkommen til denne modulen. I dette kapittelet skal vi ta for oss de grunnleggende teoriene og didaktiske metodene som ligger til grunn for god, tilpasset opplæring. Pedagogikk handler ikke bare om overføring av kunnskap, men om å tilrettelegge for dyptgående forståelse og kritisk tenkning.
        </p>
        <blockquote className="border-l-4 border-primary pl-6 py-2 my-8 italic text-on-surface-variant bg-surface-container-low/50 rounded-r-lg">
          "Undervisningens sanne kjerne ligger i å tenne en flamme, ikke å fylle et kar." — Klassisk pedagogisk tankegods.
        </blockquote>
        <p>
          Gjennom de kommende avsnittene vil vi utforske didaktikkens tre kjerneområder: hva (innholdet), hvordan (metodene) og hvorfor (begrunnelsen). Som lærer eller veileder er det kritisk å konstant reflektere over disse dimensjonene i møte med elevene.
        </p>
        <h3 className="font-serif text-xl font-bold text-primary pt-4">Didaktikkens tre kjerneelementer</h3>
        <p>
          For å sikre et godt læringsutbytte må vi balansere den didaktiske relasjonstenkningen mellom eleven, læreren og lærestoffet. Dette kalles ofte for den didaktiske triaden.
        </p>
        <div className="my-8 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 font-sans space-y-3">
          <p className="text-xs font-bold text-primary uppercase tracking-wide">Praktisk oppgave for uken</p>
          <p className="text-xs text-on-surface-variant">
            Skriv et kort refleksjonsnotat (300-500 ord) om hvordan du ville tilrettelagt en undervisningsøkt i ditt fagfelt for en elevgruppe med ulik faglig bakgrunn.
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
  };

  return (
    <div className="bg-background min-h-screen flex flex-col font-sans text-on-surface">
      {/* Top Navbar */}
      <header className="bg-white border-b border-outline-variant/30 sticky top-0 z-40 shadow-sm">
        <div className="flex justify-between items-center w-full px-6 md:px-12 max-w-[1440px] mx-auto h-20">
          <div className="font-serif text-2xl font-bold text-primary flex items-center gap-2 cursor-pointer" onClick={() => navigate('/student/dashboard')}>
            <GraduationCap className="text-primary" size={26} />
            <span>Scholastic Premium</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('/student/dashboard')} className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">Dashboard</button>
            <button onClick={() => navigate('/student/library')} className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">Kursbibliotek</button>
            <button onClick={() => navigate('/student/assignments')} className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">Oppgaver</button>
            <button onClick={() => navigate('/student/chat')} className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">Fellesskap</button>
          </nav>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center bg-surface-container-low rounded-lg px-4 border border-outline-variant/30 py-2 w-64">
              <Search className="text-on-surface-variant mr-2" size={16} />
              <input className="bg-transparent border-none focus:ring-0 text-xs w-full outline-none" placeholder="Søk i plattformen..." type="text"/>
            </div>
            
            <div className="flex items-center gap-4 text-primary">
              <button className="relative hover:opacity-80 transition-all p-1">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-burnt-orange rounded-full"></span>
              </button>
              <div className="flex items-center gap-2.5 pl-2 border-l border-outline-variant/30">
                <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full object-cover border border-primary/20" />
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
        <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-x-hidden">
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
                <span>Neste live-klasse: Didaktikk</span>
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
              className="bg-white border border-outline-variant/20 shadow-sm p-8 md:p-12 rounded-2xl"
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

      <HkmChatWidget />
    </div>
  );
}
