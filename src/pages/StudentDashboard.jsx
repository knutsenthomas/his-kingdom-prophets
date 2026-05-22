import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { 
  BookOpen, Calendar, CheckSquare, Clock, GraduationCap, PlayCircle, 
  Users, ExternalLink, ArrowRight, Award, Compass, Bell, Power, Search 
} from 'lucide-react';
import HkmChatWidget from '@/components/HkmChatWidget';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, courses, logout, toggleModuleCompleted, showToast } = useApp();
  const [todoList, setTodoList] = useState([
    { id: 1, text: 'Lese Modul 3 i Pedagogikk 101', done: false },
    { id: 2, text: 'Gjennomføre fysikkoppgave 4', done: true },
    { id: 3, text: 'Akademisk skriving kapittel 2 utkast', done: false }
  ]);

  const handleToggleTodo = (id) => {
    setTodoList(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
    showToast("Gjøremål oppdatert!");
  };

  const handleLogOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="bg-background min-h-screen flex flex-col font-sans text-on-surface pb-20 md:pb-0">
      {/* Top Navbar */}
      <header className="bg-white border-b border-outline-variant/30 sticky top-0 z-40 shadow-sm">
        <div className="flex justify-between items-center w-full px-4 sm:px-6 md:px-12 max-w-[1440px] mx-auto h-20">
          <div className="font-serif text-lg sm:text-2xl font-bold text-primary flex items-center gap-1.5 sm:gap-2 cursor-pointer truncate mr-2" onClick={() => navigate('/student/dashboard')}>
            <GraduationCap className="text-primary shrink-0" size={24} />
            <span className="truncate">Scholastic Premium</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('/student/dashboard')} className="text-primary border-b-2 border-primary pb-1 font-bold text-sm">Dashboard</button>
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

      {/* Main Content Layout with Sidebar */}
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
                  <p className="text-xs font-bold text-on-surface uppercase tracking-wider">Thomas Knutsen</p>
                  <p className="text-[11px] text-on-surface-variant font-medium">Aktiv Læringsprofil</p>
                </div>
              </div>
              <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[45%]" style={{ transition: 'width 0.8s ease-in-out' }}></div>
              </div>
              <p className="text-[10px] text-on-surface-variant font-semibold mt-2">45% Total fullføringsgrad</p>
            </div>

            <nav className="space-y-1.5">
              <button onClick={() => navigate('/student/dashboard')} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-primary bg-primary/5 rounded-lg border-l-4 border-primary font-bold text-left">
                <Compass size={18} />
                <span>Dashboard</span>
              </button>
              <button onClick={() => navigate('/student/library')} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-all rounded-lg font-medium text-left">
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

          <div className="px-2">
            <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 text-center">
              <p className="text-xs font-bold text-primary mb-2 uppercase tracking-wide">Oppgrader plattform</p>
              <p className="text-[11px] text-on-surface-variant mb-3 leading-relaxed">Få ubegrenset tilgang til alle premium forskningsressurser.</p>
              <button onClick={() => showToast("Premium-oppgradering forespurt!")} className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-lg shadow-sm hover:bg-primary-container transition-all active:scale-[0.97]">
                Oppgrader til Pro
              </button>
            </div>
          </div>
        </aside>

        {/* Main Dashboard Canvas */}
        <main className="flex-grow p-6 md:p-10 space-y-8 overflow-x-hidden">
          
          {/* Welcome Banner Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary to-[#1B4965] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden"
          >
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12">
              <GraduationCap size={240} />
            </div>
            <div className="max-w-xl space-y-2.5">
              <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase inline-block">Akademisk Status</span>
              <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">Velkommen tilbake, Thomas!</h1>
              <p className="text-sm text-on-primary-container leading-relaxed">
                Du gjør fremragende fremgang i fysikk og pedagogikk denne uken. Dine faglærere har publisert 2 nye forelesningsnotater i biblioteket.
              </p>
            </div>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Columns: Courses Progress */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-xl font-bold text-primary">Mine aktive kurs</h2>
                <button onClick={() => navigate('/student/library')} className="text-primary hover:text-primary-container text-xs font-bold flex items-center gap-1">
                  Vis alle
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <motion.div 
                    key={course.id}
                    whileHover={{ y: -3 }}
                    className="bg-white rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden flex flex-col justify-between p-6 cursor-pointer"
                    onClick={() => navigate('/student/lesson', { state: { courseId: course.id } })}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="bg-primary/5 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                          {course.code}
                        </span>
                        <span className="text-[11px] text-outline font-medium">{course.instructor}</span>
                      </div>
                      <h3 className="font-serif font-bold text-primary text-base line-clamp-1 mb-2 hover:underline">{course.title}</h3>
                      <p className="text-xs text-on-surface-variant mb-6 line-clamp-2 leading-relaxed">
                        Fullført {course.modulesCompleted} av {course.totalModules} faglige læringsmoduler.
                      </p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-on-surface-variant">Fremgang</span>
                        <span className="text-primary font-bold">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full transition-all duration-500" 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <button className="text-xs font-bold text-primary flex items-center gap-1 hover:gap-1.5 transition-all">
                          Fortsett leksjon
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Column: Calendar & Join Live Zoom Class */}
            <div className="space-y-6">
              <h2 className="font-serif text-xl font-bold text-primary">Live-undervisning</h2>
              
              <div className="bg-white rounded-xl border border-outline-variant/40 shadow-sm p-6 space-y-6">
                <div className="bg-surface-container-low p-4 rounded-lg flex items-start gap-3 border-l-4 border-burnt-orange">
                  <PlayCircle className="text-burnt-orange shrink-0 animate-pulse mt-0.5" size={20} />
                  <div>
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wide">Neste Live Klasse</h4>
                    <p className="text-sm font-serif font-bold text-on-surface mt-1">PED 101: Didaktikk & Metoder</p>
                    <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">Startet kl. 12:15 med Dr. Vance</p>
                    <a 
                      href={courses[0]?.zoomLink || "https://zoom.us"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-burnt-orange hover:underline cursor-pointer"
                    >
                      Bli med via Zoom
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                {/* Calendar / Schedule List */}
                <div className="space-y-3.5 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wide flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>Neste forelesninger</span>
                  </h4>
                  
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center p-2 rounded hover:bg-slate-50">
                      <div>
                        <p className="font-semibold text-on-surface">WRIT 201: Kildekritikk</p>
                        <p className="text-[10px] text-outline">Mandag 25. mai, 10:15</p>
                      </div>
                      <span className="bg-slate-100 text-on-surface-variant text-[9px] font-bold px-2 py-0.5 rounded font-mono">Zoom</span>
                    </div>

                    <div className="flex justify-between items-center p-2 rounded hover:bg-slate-50">
                      <div>
                        <p className="font-semibold text-on-surface">PHYS 301: Spin & Perturbation</p>
                        <p className="text-[10px] text-outline">Onsdag 27. mai, 14:00</p>
                      </div>
                      <span className="bg-slate-100 text-on-surface-variant text-[9px] font-bold px-2 py-0.5 rounded font-mono">Zoom</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Section: Gjøremål & Studiestatistikk */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 columns: Task List Checklist */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="font-serif text-xl font-bold text-primary">Mine gjøremål & oppgaver</h2>
              
              <div className="bg-white rounded-xl border border-outline-variant/40 shadow-sm p-6">
                <div className="space-y-3">
                  {todoList.map((todo) => (
                    <div 
                      key={todo.id} 
                      onClick={() => handleToggleTodo(todo.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none ${
                        todo.done 
                          ? 'bg-slate-50/50 border-slate-100 text-outline/70 line-through' 
                          : 'bg-white border-outline-variant/20 text-on-surface hover:border-primary/40'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={todo.done} 
                        onChange={() => {}} // Controlled via onClick on div
                        className="rounded text-primary focus:ring-primary h-4 w-4 shrink-0 border-outline-variant"
                      />
                      <span className="text-sm font-medium">{todo.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column: Study Stats Card */}
            <div className="space-y-6">
              <h2 className="font-serif text-xl font-bold text-primary">Studie-statistikk</h2>
              
              <div className="bg-white rounded-xl border border-outline-variant/40 shadow-sm p-6 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-surface-container-low p-4 rounded-lg">
                    <p className="text-2xl font-serif font-bold text-primary">14.5</p>
                    <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider mt-1">Timer studert</p>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-lg">
                    <p className="text-2xl font-serif font-bold text-primary">8</p>
                    <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider mt-1">Fullførte leksjoner</p>
                  </div>
                </div>

                <div className="space-y-2 mt-6 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-on-surface-variant font-medium">Ukemål (20t)</span>
                    <span className="text-primary font-bold">72% nådd</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-burnt-orange h-full rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant/30 z-40 flex justify-around py-3 shadow-lg">
        <button onClick={() => navigate('/student/dashboard')} className="flex flex-col items-center gap-0.5 text-xs text-primary font-bold">
          <Compass size={18} />
          <span>Dashboard</span>
        </button>
        <button onClick={() => navigate('/student/library')} className="flex flex-col items-center gap-0.5 text-xs text-on-surface-variant hover:text-primary transition-colors">
          <BookOpen size={18} />
          <span>Kurs</span>
        </button>
        <button onClick={() => navigate('/student/assignments')} className="flex flex-col items-center gap-0.5 text-xs text-on-surface-variant hover:text-primary transition-colors">
          <CheckSquare size={18} />
          <span>Oppgaver</span>
        </button>
        <button onClick={() => navigate('/student/chat')} className="flex flex-col items-center gap-0.5 text-xs text-on-surface-variant hover:text-primary transition-colors">
          <Users size={18} />
          <span>Fagprat</span>
        </button>
      </div>

      {/* Floating HKM Chat Widget */}
      <HkmChatWidget />
    </div>
  );
}
