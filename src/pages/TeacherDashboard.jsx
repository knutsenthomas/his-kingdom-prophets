import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { 
  Users, BookOpen, AlertTriangle, TrendingUp, ChevronRight,
  Sparkles, Calendar, ArrowRight, MessageSquare, ClipboardList,
  Sliders, Award
} from 'lucide-react';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user, students, courses } = useApp();

  // Attention status filter
  const atRiskStudents = students.filter(s => s.status === 'Kritisk' || s.status === 'Forsinket');

  return (
    <div className="w-full px-4 sm:px-6 md:px-12 py-6 md:py-12 flex flex-col gap-6 md:gap-8 font-sans">
      {/* Intro Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-4xl font-bold text-primary">
            Velkommen tilbake, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 font-medium">
            Oversikt over studentenes åndelige fremdrift, disippelskap og oppfølgingsvarsler.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-on-surface-variant font-semibold bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant/30">
            Aktuelt studieår: 2026
          </span>
        </div>
      </div>

      {/* Classroom Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-300">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-outline">Totalt Registrert</p>
            <h3 className="text-3xl font-bold font-serif text-primary">48</h3>
            <p className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
              <TrendingUp size={12} /> +12% fra forrige måned
            </p>
          </div>
          <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center text-primary">
            <Users size={22} />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-300">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-outline">Faglig Snittfremdrift</p>
            <h3 className="text-3xl font-bold font-serif text-primary">46%</h3>
            <div className="h-1.5 w-24 bg-surface-container rounded-full overflow-hidden mt-1.5">
              <div className="h-full bg-primary w-[46%]" />
            </div>
          </div>
          <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center text-primary">
            <BookOpen size={22} />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-300">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-outline">Evalueringssnitt</p>
            <h3 className="text-3xl font-bold font-serif text-primary">B+</h3>
            <p className="text-[10px] text-outline font-semibold">Basert på siste 3 innleveringer</p>
          </div>
          <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center text-primary">
            <Award size={22} />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-300">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-outline">Studenter under oppfølging</p>
            <h3 className="text-3xl font-bold font-serif text-error">{atRiskStudents.length}</h3>
            <p className="text-[10px] text-error font-semibold flex items-center gap-1">
              <AlertTriangle size={12} /> Trenger oppmuntring / veiledning
            </p>
          </div>
          <div className="w-12 h-12 bg-error-container/30 rounded-lg flex items-center justify-center text-error">
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Dashboard Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Action Modules: Left (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Quick Actions Panel */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-primary mb-6 flex items-center gap-2">
              <Sliders size={20} className="text-[#c5a059]" /> Administrative tjenester
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Module 1: Student Followup */}
              <button 
                onClick={() => navigate('/teacher/follow-up')}
                className="p-5 rounded-lg border border-outline-variant/50 hover:border-primary bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-300 text-left flex flex-col justify-between h-40 active:scale-[0.98] group"
              >
                <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-primary mb-1">Tjenesteoppfølging</h4>
                  <p className="text-xs text-on-surface-variant font-medium">Send oppmuntringer, veiledning og pastorale støttemeldinger.</p>
                </div>
              </button>

              {/* Module 2: Course Builder */}
              <button 
                onClick={() => navigate('/teacher/course-builder')}
                className="p-5 rounded-lg border border-outline-variant/50 hover:border-primary bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-300 text-left flex flex-col justify-between h-40 active:scale-[0.98] group"
              >
                <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-primary mb-1">Studiebygger (CMS)</h4>
                  <p className="text-xs text-on-surface-variant font-medium">Legg til profetiske leksjoner og studieplaner direkte.</p>
                </div>
              </button>

              {/* Module 3: Grade Calculator */}
              <button 
                onClick={() => navigate('/teacher/grading')}
                className="p-5 rounded-lg border border-outline-variant/50 hover:border-primary bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-300 text-left flex flex-col justify-between h-40 active:scale-[0.98] group"
              >
                <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Award size={18} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-primary mb-1">Bibelkalkulator</h4>
                  <p className="text-xs text-on-surface-variant font-medium">Beregne og simulere karakterer og bibelske evalueringer.</p>
                </div>
              </button>

              {/* Module 4: Notification Center */}
              <button 
                onClick={() => navigate('/teacher/notifications')}
                className="p-5 rounded-lg border border-outline-variant/50 hover:border-primary bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-300 text-left flex flex-col justify-between h-40 active:scale-[0.98] group"
              >
                <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-primary mb-1">Varslingssenter</h4>
                  <p className="text-xs text-on-surface-variant font-medium">Motta henvendelser og koordiner felles kunngjøringer.</p>
                </div>
              </button>

            </div>
          </div>

          {/* Simulated Grade Performance Metrics Visualizer */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-primary mb-4">Karakterfordeling</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold font-sans">
                <span>Karakter A</span>
                <div className="flex items-center gap-2 flex-grow mx-4">
                  <div className="h-3 bg-primary rounded-full flex-grow relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#c5a059] w-[20%]" />
                  </div>
                  <span className="w-6 text-right">20%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold font-sans">
                <span>Karakter B</span>
                <div className="flex items-center gap-2 flex-grow mx-4">
                  <div className="h-3 bg-primary rounded-full flex-grow relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#c5a059] w-[45%]" />
                  </div>
                  <span className="w-6 text-right">45%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold font-sans">
                <span>Karakter C</span>
                <div className="flex items-center gap-2 flex-grow mx-4">
                  <div className="h-3 bg-primary rounded-full flex-grow relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#c5a059] w-[25%]" />
                  </div>
                  <span className="w-6 text-right">25%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold font-sans">
                <span>Karakter D/F</span>
                <div className="flex items-center gap-2 flex-grow mx-4">
                  <div className="h-3 bg-primary rounded-full flex-grow relative overflow-hidden">
                    <div className="absolute inset-0 bg-error/25 w-[10%]" />
                  </div>
                  <span className="w-6 text-right">10%</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Attention Warnings Sidebar: Right (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Attention Index list */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                <AlertTriangle size={18} className="text-error" /> Behov for oppfølging
              </h3>
              <button 
                onClick={() => navigate('/teacher/follow-up')}
                className="text-xs text-primary font-bold uppercase hover:underline"
              >
                Vis alle
              </button>
            </div>

            <div className="space-y-4">
              {atRiskStudents.map((stud, idx) => (
                <div key={idx} className="flex gap-4 items-start p-3 bg-surface-container-low border border-outline-variant/60 rounded-lg hover:border-primary transition-all duration-300">
                  <img 
                    src={stud.avatar} 
                    alt={stud.name} 
                    className="w-10 h-10 rounded-full border border-outline-variant shadow object-cover shrink-0"
                  />
                  <div className="flex-grow space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-primary leading-tight truncate">{stud.name}</h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        stud.status === 'Kritisk' ? 'bg-error-container text-error' : 'bg-secondary-container/50 text-on-secondary-container'
                      }`}>
                        {stud.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-on-surface-variant font-semibold truncate">{stud.courseName}</p>
                    
                    <div className="flex items-center justify-between text-[10px] text-outline pt-2 gap-2">
                      <span className="truncate">Lese-aktivitet: {stud.lastActivity}</span>
                      <span className="shrink-0">Fremgang: {stud.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Course Builder summary info */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <BookOpen size={18} /> Studieplaner
            </h3>
            
            <div className="space-y-3">
              {courses.map((course, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs pb-3 border-b border-outline-variant/30 last:border-b-0 last:pb-0 gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-primary truncate">{course.title}</p>
                    <p className="text-[10px] text-outline truncate">{course.code} • {course.totalModules} Moduler</p>
                  </div>
                  <span className="font-semibold text-primary shrink-0">{course.progress}% snitt</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
