import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { 
  GraduationCap, Search, Bell, Power, Compass, BookOpen, CheckSquare, Users, 
  ArrowRight, Filter, Award, BookOpen as BookIcon, Laptop
} from 'lucide-react';
import HkmChatWidget from '@/components/HkmChatWidget';

export default function LibraryView() {
  const navigate = useNavigate();
  const { user, courses, logout, showToast } = useApp();
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredCourses = courses.filter(course => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Pedagogikk') return course.id === 'ped101';
    if (activeFilter === 'Physics') return course.id === 'phys301';
    if (activeFilter === 'Skriving') return course.id === 'write201';
    return true;
  });

  const handleLogOut = () => {
    logout();
    navigate('/');
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
            <button onClick={() => navigate('/student/library')} className="text-primary border-b-2 border-primary pb-1 font-bold text-sm">Kursbibliotek</button>
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

      {/* Sidebar & Canvas */}
      <div className="flex flex-1 w-full max-w-[1440px] mx-auto">
        {/* Sidebar */}
        <aside className="bg-white border-r border-outline-variant/20 w-72 h-[calc(100vh-80px)] sticky top-20 hidden md:flex flex-col py-8 px-6 justify-between shrink-0">
          <div className="space-y-8">
            <div className="px-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="text-primary" size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface uppercase tracking-wider">{user?.name}</p>
                  <p className="text-[11px] text-on-surface-variant font-medium">Aktiv Læringsprofil</p>
                </div>
              </div>
              <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[45%]" style={{ transition: 'width 0.8s ease-in-out' }}></div>
              </div>
              <p className="text-[10px] text-on-surface-variant font-semibold mt-2">45% Total fullføringsgrad</p>
            </div>

            <nav className="space-y-1.5">
              <button onClick={() => navigate('/student/dashboard')} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-all rounded-lg font-medium text-left">
                <Compass size={18} />
                <span>Dashboard</span>
              </button>
              <button onClick={() => navigate('/student/library')} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-primary bg-primary/5 rounded-lg border-l-4 border-primary font-bold text-left">
                <BookOpen size={18} />
                <span>Mine Kurs</span>
              </button>
              <button onClick={() => navigate('/student/assignments')} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-all rounded-lg font-medium text-left">
                <CheckSquare size={18} />
                <span>Oppgaver</span>
              </button>
              <button onClick={() => navigate('/student/chat')} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-all rounded-lg font-medium text-left">
                <Users size={18} />
                <span>Fagfellesskap</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Canvas */}
        <main className="flex-grow p-6 md:p-10 space-y-10 overflow-x-hidden">
          
          {/* Header section */}
          <section className="space-y-3">
            <nav className="flex items-center gap-2 text-xs font-semibold text-outline">
              <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/student/dashboard')}>Hjem</span>
              <span>/</span>
              <span className="text-primary font-bold">Kursbibliotek</span>
            </nav>
            <h1 className="font-serif text-3xl font-bold text-primary">Kursbibliotek</h1>
            <p className="text-sm text-on-surface-variant max-w-3xl leading-relaxed">
              Utforsk det faglige innholdet og finn dine aktive kurs. Klikk på et kurs for å begynne å lese forelesninger, se live zoom-undervisning eller løse oppgaver.
            </p>
          </section>

          {/* Filters */}
          <section className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => setActiveFilter('All')}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                activeFilter === 'All' ? 'bg-primary text-white' : 'bg-white text-on-surface-variant border border-outline-variant/30 hover:bg-slate-50'
              }`}
            >
              Alle Kurs
            </button>
            <button 
              onClick={() => setActiveFilter('Pedagogikk')}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                activeFilter === 'Pedagogikk' ? 'bg-primary text-white' : 'bg-white text-on-surface-variant border border-outline-variant/30 hover:bg-slate-50'
              }`}
            >
              Pedagogikk
            </button>
            <button 
              onClick={() => setActiveFilter('Physics')}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                activeFilter === 'Physics' ? 'bg-primary text-white' : 'bg-white text-on-surface-variant border border-outline-variant/30 hover:bg-slate-50'
              }`}
            >
              Teoretisk Fysikk
            </button>
            <button 
              onClick={() => setActiveFilter('Skriving')}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                activeFilter === 'Skriving' ? 'bg-primary text-white' : 'bg-white text-on-surface-variant border border-outline-variant/30 hover:bg-slate-50'
              }`}
            >
              Akademisk Skriving
            </button>
          </section>

          {/* Course Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <motion.article 
                key={course.id}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl border border-outline-variant/20 overflow-hidden flex flex-col justify-between shadow-sm cursor-pointer hover:shadow-md transition-all duration-300"
                onClick={() => navigate('/student/lesson', { state: { courseId: course.id } })}
              >
                <div>
                  {/* Mock banner */}
                  <div className="h-44 bg-gradient-to-br from-primary-container to-[#1B4965] relative flex items-center justify-center p-6 text-white text-center overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <BookIcon size={48} className="text-white/20 absolute -right-2 -bottom-2" />
                    <h3 className="font-serif font-bold text-lg leading-tight relative z-10">{course.title}</h3>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="bg-primary/5 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                        {course.code}
                      </span>
                      <span className="text-xs text-outline font-medium">Dr. Vance</span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Undervisning og eksamensoppgaver levert av akkrediterte professorer. Dette kurset teller 10 studiepoeng.
                    </p>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: `${course.progress}%` }}></div>
                    </div>
                    <span className="text-[11px] font-bold text-on-surface-variant">{course.progress}%</span>
                  </div>
                  <button className="text-xs font-bold text-primary flex items-center gap-1 hover:gap-1.5 transition-all">
                    Fortsett
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.article>
            ))}

            {/* Premium Blocked Card */}
            <article className="bg-white rounded-2xl border border-outline-variant/20 overflow-hidden flex flex-col justify-between shadow-sm opacity-65">
              <div>
                <div className="h-44 bg-slate-200 relative flex items-center justify-center p-6 text-slate-500 text-center">
                  <Laptop size={48} className="text-slate-300 absolute -right-2 -bottom-2" />
                  <h3 className="font-serif font-bold text-lg leading-tight">Merkevarebygging 2.0</h3>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                      MKT 401
                    </span>
                    <span className="text-xs text-outline font-medium">Premium</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Dette er et avansert kurs for masterstudenter. Lær moderne merkevarestrategi og markedskommunikasjon.
                  </p>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-burnt-orange font-bold uppercase tracking-wide">Kun for Pro-medlemmer</span>
                <button onClick={() => showToast("Lås opp dette kurset ved å oppgradere!")} className="text-xs font-bold text-primary hover:underline">
                  Lås opp
                </button>
              </div>
            </article>
          </section>

        </main>
      </div>

      <HkmChatWidget />
    </div>
  );
}
