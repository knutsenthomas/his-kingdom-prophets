import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { 
  BookOpen, Calendar, GraduationCap, PlayCircle, 
  ExternalLink, ArrowRight, Award, Compass
} from 'lucide-react';
import CmsText from '@/components/CmsText';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { courses, toggleModuleCompleted, showToast, cmsContent, user, language } = useApp();
  const [todoList, setTodoList] = useState([
    { id: 1, text: 'Lese Modul 3 i Profetisk 101', done: false },
    { id: 2, text: 'Johannes åpenbaring kapittel 4 tolkning', done: true },
    { id: 3, text: 'Forberede bønneseminar', done: false }
  ]);

  const handleToggleTodo = (id) => {
    setTodoList(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
    showToast("Gjøremål oppdatert!");
  };

  return (
    <main className="flex-grow p-6 md:p-10 space-y-8 overflow-x-hidden">
      
      {/* Welcome Banner Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-[#561291] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden"
      >
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12">
          <GraduationCap size={240} />
        </div>
        <div className="max-w-xl space-y-2.5">
          <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase inline-block">
            <CmsText slug="student-status-badge" fallback="Studie-status" />
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
            <CmsText slug="student-welcome-title" fallback="Velkommen tilbake," /> {user?.name || 'Thomas'}!
          </h1>
          <CmsText
            slug="student-welcome-subtitle"
            fallback="Du gjør fremragende fremgang i den profetiske tjeneste og hermeneutikk denne uken. Dine mentorer har publisert 2 nye studiehefter i biblioteket."
            as="p"
            className="text-sm text-on-primary-container leading-relaxed"
          />
        </div>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Courses Progress */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-xl font-bold text-primary">
              <CmsText slug="student-active-courses-title" fallback="Mine aktive kurs" />
            </h2>
            <button onClick={() => navigate('/student/library')} className="text-primary hover:text-primary-container text-xs font-bold flex items-center gap-1">
              <CmsText slug="student-view-all" fallback="Vis alle" />
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
                    Fullført {course.modulesCompleted} av {course.totalModules} leksjonsmoduler.
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-on-surface-variant">
                      <CmsText slug="student-academic-eval" fallback="Faglig Vurdering" />
                    </span>
                    <span className={`font-bold ${course.modulesCompleted >= 4 ? 'text-green-600' : 'text-error'}`}>
                      {course.modulesCompleted >= 4 ? (language === 'en' ? 'Passed' : 'Bestått') : (language === 'en' ? 'Failed' : 'Ikke bestått')} ({course.modulesCompleted}/{course.totalModules} {language === 'en' ? 'lessons' : 'leksjoner'})
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-500" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button className="text-xs font-bold text-primary flex items-center gap-1 hover:gap-1.5 transition-all">
                      <CmsText slug="student-continue-lesson" fallback="Fortsett leksjon" />
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
          <h2 className="font-serif text-xl font-bold text-primary">
            <CmsText slug="student-live-gatherings-title" fallback="Live-undervisning & Bønn" />
          </h2>
          
          <div className="bg-white rounded-xl border border-outline-variant/40 shadow-sm p-6 space-y-6">
            <div className="bg-surface-container-low p-4 rounded-lg flex items-start gap-3 border-l-4 border-burnt-orange">
              <PlayCircle className="text-burnt-orange shrink-0 animate-pulse mt-0.5" size={20} />
              <div>
                <h4 className="text-xs font-bold text-primary uppercase tracking-wide">
                  <CmsText slug="student-live-header" fallback="Neste Live Samling" />
                </h4>
                <p className="text-sm font-serif font-bold text-on-surface mt-1">PROP 101: Høre Guds stemme</p>
                <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">Startet kl. 12:15 med Apostel David Hansen</p>
                <a 
                  href={courses[0]?.zoomLink || "https://zoom.us"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-burnt-orange hover:underline cursor-pointer"
                >
                  <CmsText slug="student-join-zoom" fallback="Bli med via Zoom" />
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Calendar / Schedule List */}
            <div className="space-y-3.5 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wide flex items-center gap-1.5">
                <Calendar size={14} />
                <CmsText slug="student-next-gatherings-title" fallback="Neste samlinger" as="span" />
              </h4>
              
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-2 rounded hover:bg-slate-50">
                  <div>
                    <p className="font-semibold text-on-surface">MIN 201: Sjelesorg</p>
                    <p className="text-[10px] text-outline">Mandag 25. mai, 10:15</p>
                  </div>
                  <span className="bg-slate-100 text-on-surface-variant text-[9px] font-bold px-2 py-0.5 rounded font-mono">Zoom</span>
                </div>

                <div className="flex justify-between items-center p-2 rounded hover:bg-slate-50">
                  <div>
                    <p className="font-semibold text-on-surface">BIBLE 301: Avansert Hermeneutikk</p>
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
          <h2 className="font-serif text-xl font-bold text-primary">
            <CmsText slug="student-tasks-title" fallback="Mine gjøremål & oppgaver" />
          </h2>
          
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
          <h2 className="font-serif text-xl font-bold text-primary">
            <CmsText slug="student-stats-title" fallback="Studie-statistikk" />
          </h2>
          
          <div className="bg-white rounded-xl border border-outline-variant/40 shadow-sm p-6 flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-surface-container-low p-4 rounded-lg">
                <p className="text-2xl font-serif font-bold text-primary">14.5</p>
                <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider mt-1">
                  <CmsText slug="student-stats-hours" fallback="Timer studert" />
                </p>
              </div>
              <div className="bg-surface-container-low p-4 rounded-lg">
                <p className="text-2xl font-serif font-bold text-primary">8</p>
                <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider mt-1">
                  <CmsText slug="student-stats-completed" fallback="Fullførte leksjoner" />
                </p>
              </div>
            </div>

            <div className="space-y-2 mt-6 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant font-medium">
                  <CmsText slug="student-stats-goal" fallback="Ukemål (20t)" />
                </span>
                <span className="text-primary font-bold">72% <CmsText slug="student-stats-reached" fallback="nådd" /></span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-burnt-orange h-full rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </main>
  );
}
