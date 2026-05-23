import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { 
  ArrowRight, BookOpen as BookIcon, Laptop
} from 'lucide-react';

export default function LibraryView() {
  const navigate = useNavigate();
  const { courses, showToast } = useApp();
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredCourses = courses.filter(course => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Profetisk') return course.id === 'prop101';
    if (activeFilter === 'Bibelstudier') return course.id === 'bible301';
    if (activeFilter === 'Sjelesorg') return course.id === 'min201';
    return true;
  });

  return (
    <main className="flex-grow p-6 md:p-10 space-y-10 overflow-x-hidden">
      
      {/* Header section */}
      <section className="space-y-3">
        <nav className="flex items-center gap-2 text-xs font-semibold text-outline">
          <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/student/dashboard')}>Hjem</span>
          <span>/</span>
          <span className="text-primary font-bold">Studieplan</span>
        </nav>
        <h1 className="font-serif text-3xl font-bold text-primary">Studieplan</h1>
        <p className="text-sm text-on-surface-variant max-w-3xl leading-relaxed">
          Utforsk det faglige innholdet og finn dine aktive kurs. Klikk på et emne for å åpne leksjoner, se live zoom-undervisning eller løse oppgaver.
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
          onClick={() => setActiveFilter('Profetisk')}
          className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
            activeFilter === 'Profetisk' ? 'bg-primary text-white' : 'bg-white text-on-surface-variant border border-outline-variant/30 hover:bg-slate-50'
          }`}
        >
          Profetisk
        </button>
        <button 
          onClick={() => setActiveFilter('Bibelstudier')}
          className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
            activeFilter === 'Bibelstudier' ? 'bg-primary text-white' : 'bg-white text-on-surface-variant border border-outline-variant/30 hover:bg-slate-50'
          }`}
        >
          Bibelstudier
        </button>
        <button 
          onClick={() => setActiveFilter('Sjelesorg')}
          className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
            activeFilter === 'Sjelesorg' ? 'bg-primary text-white' : 'bg-white text-on-surface-variant border border-outline-variant/30 hover:bg-slate-50'
          }`}
        >
          Sjelesorg
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
              <div className="h-44 bg-gradient-to-br from-primary-container to-[#561291] relative flex items-center justify-center p-6 text-white text-center overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <BookIcon size={48} className="text-white/20 absolute -right-2 -bottom-2" />
                <h3 className="font-serif font-bold text-lg leading-tight relative z-10">{course.title}</h3>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-primary/5 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                    {course.code}
                  </span>
                  <span className="text-xs text-outline font-medium">{course.instructor}</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Solid bibelsk undervisning levert av erfarne mentorer og tjenestegaver. Dette kurset gir grunnlag for videre tjenesteutrustning.
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
              <h3 className="font-serif font-bold text-lg leading-tight">Lovsang & Tilbedelse 401</h3>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-3">
                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                  WOR 401
                </span>
                <span className="text-xs text-outline font-medium">Tjenestegave</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Dette er et videregående kurs for lovsangere og tilbedere. Lær om tabernaklets tjeneste og åndelig lederskap i lovsang.
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
  );
}
