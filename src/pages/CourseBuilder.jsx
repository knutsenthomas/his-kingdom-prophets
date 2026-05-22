import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, BookOpen, Plus, PlusCircle, CheckCircle2, 
  Settings, Layers, Trash2, Eye, GripVertical, AlertCircle
} from 'lucide-react';

export default function CourseBuilder() {
  const navigate = useNavigate();
  const { user, courses, addCourseModule, showToast } = useApp();
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || 'prop101');
  const [newModuleTitle, setNewModuleTitle] = useState('');

  const activeCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  const handleAddModule = (e) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) {
      showToast("Vennligst oppgi en modultittel.");
      return;
    }
    
    addCourseModule(selectedCourseId, newModuleTitle);
    setNewModuleTitle('');
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-12 py-6 md:py-12 flex flex-col gap-6 md:gap-8 font-sans">
      
      {/* Navigation Breadcrumbs */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm">
          <button 
            onClick={() => navigate('/teacher/dashboard')}
            className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors text-xs font-bold uppercase tracking-wider active:scale-95"
          >
            <ArrowLeft size={14} />
            Tilbake til Dashboard
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        
        {/* Left Side: Select Course Column */}
        <div className="w-full lg:w-4/12 flex flex-col gap-6">
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-primary mb-2 flex items-center gap-2">
              <Layers size={20} className="text-[#c5a059]" /> Velg Studie / Modul
            </h2>
            <p className="text-xs text-on-surface-variant mb-6 font-medium">
              Velg studiet eller linjen du vil tilføre nye moduler eller læringskapitler.
            </p>

            <div className="space-y-3">
              {courses.map(course => {
                const isActive = course.id === selectedCourseId;
                return (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourseId(course.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 active:scale-[0.99] group ${
                      isActive 
                        ? 'bg-primary border-primary text-white shadow-sm font-bold' 
                        : 'bg-white border-outline-variant hover:border-primary/50 hover:bg-surface-container-low text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isActive ? 'bg-white/20 text-white' : 'bg-surface-container text-primary'
                      }`}>
                        {course.code}
                      </span>
                      <span className={`text-xs ${isActive ? 'text-white/80' : 'text-outline'} font-semibold`}>
                        {course.totalModules} Moduler
                      </span>
                    </div>
                    <h3 className="font-serif text-base font-bold leading-tight group-hover:text-primary-container transition-colors">
                      {course.title}
                    </h3>
                    <p className={`text-[10px] mt-2 ${isActive ? 'text-white/70' : 'text-outline'}`}>
                      Ansvarlig: {course.instructor}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Modules Editor */}
        <div className="w-full lg:w-8/12 flex flex-col gap-6">
          {activeCourse ? (
            <motion.div 
              key={activeCourse.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border border-outline-variant/30 rounded-xl p-5 sm:p-8 shadow-sm flex flex-col gap-6 sm:gap-8"
            >
              {/* Info Header */}
              <div className="border-b border-outline-variant/30 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-primary text-white rounded-full">
                    Studieplan & Moduler
                  </span>
                  <h2 className="font-serif text-3xl font-bold text-primary mt-2">
                    {activeCourse.title}
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-1 font-medium">
                    Studiekode: <span className="font-semibold text-primary">{activeCourse.code}</span> • Ansvarlig: <span className="font-semibold text-primary">{activeCourse.instructor}</span>
                  </p>
                </div>
                
                <button
                  onClick={() => navigate(`/student/library`)}
                  className="py-2.5 px-4 rounded border border-outline-variant hover:border-primary text-xs font-bold uppercase flex items-center gap-2 hover:text-primary transition-all active:scale-95 shrink-0"
                >
                  <Eye size={14} /> Vis studentvisning
                </button>
              </div>

              {/* Modules List */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-primary">Modulrekkefølge</h3>
                
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {activeCourse.modules.map((mod, index) => (
                      <motion.div
                        key={mod.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-surface-container-low border border-outline-variant/30 p-3 sm:p-4 rounded-lg flex items-center gap-2.5 sm:gap-4 hover:border-primary-container/40 transition-colors"
                      >
                        <div className="text-outline cursor-grab shrink-0">
                          <GripVertical size={16} />
                        </div>
                        
                        <div className="w-8 h-8 rounded bg-primary/5 text-primary font-bold text-xs flex items-center justify-center border border-primary-container/10 shrink-0">
                          {index + 1}
                        </div>

                        <div className="flex-grow min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-primary leading-tight truncate">
                            {mod.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            mod.completed ? 'bg-green-100 text-green-700 font-bold' : 'bg-surface-container text-outline'
                          }`}>
                            {mod.completed ? 'Publisert' : 'Utkast'}
                          </span>
                          <button className="p-1.5 hover:bg-error-container/30 rounded text-outline hover:text-error transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Add New Module Form */}
              <form onSubmit={handleAddModule} className="border-t border-outline-variant/30 pt-6 flex flex-col gap-4">
                <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                  <PlusCircle size={18} className="text-[#c5a059]" /> Legg til ny undervisningsmodul
                </h3>
                
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-grow space-y-2 w-full">
                    <label className="text-xs font-bold uppercase tracking-wider text-outline block">Modulens Tittel / Kjerneemne</label>
                    <input
                      type="text"
                      value={newModuleTitle}
                      onChange={(e) => setNewModuleTitle(e.target.value)}
                      placeholder="Skriv inn tittel på modulen (f.eks. Modul 9: Profetisk modning og prøving)..."
                      className="w-full p-3.5 border border-outline-variant rounded-lg font-sans text-xs focus:outline-none focus:border-primary shadow-sm transition-all focus:ring-1 focus:ring-primary font-medium"
                      style={{
                        transform: 'translateZ(0) !important',
                        backfaceVisibility: 'hidden !important'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-primary text-white font-bold py-3.5 px-6 rounded-lg hover:bg-primary/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 w-full md:w-auto shadow-md whitespace-nowrap h-[46px]"
                  >
                    <Plus size={16} /> LEGG TIL MODUL
                  </button>
                </div>
                
                <div className="bg-surface-container-low border border-outline-variant/20 p-4 rounded-lg flex gap-2.5 items-start mt-2">
                  <AlertCircle size={16} className="text-secondary mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-on-surface-variant leading-relaxed font-semibold">
                    <strong>Sanntidsoppdatering (CMS):</strong> Når du legger til modulen, vil den umiddelbart integreres i studieplanen. Studenter som følger denne linjen vil få tilgang til det nye undervisningsmaterialet på sine dashbord og leksjonssider i sanntid.
                  </p>
                </div>
              </form>
            </motion.div>
          ) : (
            <div className="bg-white border border-outline-variant/30 rounded-xl p-12 text-center text-outline shadow-sm font-medium">
              Velg et studie fra venstre kolonne for å bygge læreplanen.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
