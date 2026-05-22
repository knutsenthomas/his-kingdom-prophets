import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, BookOpen, Plus, PlusCircle, CheckCircle2, 
  Settings, Layers, Trash2, Eye, GripVertical, AlertCircle
} from 'lucide-react';
import HkmChatWidget from '@/components/HkmChatWidget';

export default function CourseBuilder() {
  const navigate = useNavigate();
  const { user, courses, addCourseModule, showToast } = useApp();
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || 'ped101');
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
    <div className="bg-background min-h-screen flex flex-col font-sans text-on-background">
      {/* Header */}
      <header className="bg-white border-b border-outline-variant sticky top-0 z-40 shadow-sm">
        <div className="flex justify-between items-center px-4 sm:px-6 md:px-12 h-20 w-full max-w-[1440px] mx-auto">
          <div className="flex items-center gap-2 sm:gap-4 truncate mr-2">
            <button 
              onClick={() => navigate('/teacher/dashboard')}
              className="p-2 hover:bg-surface-container rounded-full transition-colors active:scale-95 text-on-surface-variant hover:text-primary shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="font-serif text-lg sm:text-2xl font-bold text-primary truncate">Scholastic Premium</div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-secondary px-2.5 sm:px-3 py-1 bg-surface-container rounded-full">
              Kursbygger
            </span>
            <img 
              src={user?.avatar} 
              alt={user?.name} 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-primary-container shadow object-cover shrink-0"
            />
          </div>
        </div>
      </header>
 
      {/* Main Grid */}
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-12 flex flex-col lg:flex-row gap-6 md:gap-8">
        
        {/* Left Side: Select Course Column */}
        <div className="w-full lg:w-4/12 flex flex-col gap-6">
          <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-primary mb-2 flex items-center gap-2">
              <Layers size={20} className="text-secondary" /> Velg Kurs
            </h2>
            <p className="text-xs text-on-surface-variant mb-6">
              Velg kurset du vil tilføre nye kapitler eller læreplanmoduler.
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
                        ? 'bg-primary border-primary text-white shadow-sm' 
                        : 'bg-white border-outline-variant hover:border-primary-container/40 hover:bg-surface-container-low text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isActive ? 'bg-primary-container text-white' : 'bg-surface-container text-primary'
                      }`}>
                        {course.code}
                      </span>
                      <span className={`text-xs ${isActive ? 'text-on-primary-container' : 'text-outline'} font-semibold`}>
                        {course.totalModules} Moduler
                      </span>
                    </div>
                    <h3 className="font-serif text-base font-bold leading-tight group-hover:text-primary-container transition-colors">
                      {course.title}
                    </h3>
                    <p className={`text-[10px] mt-2 ${isActive ? 'text-on-primary-container/85' : 'text-outline'}`}>
                      Faglærer: {course.instructor}
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
              className="bg-white border border-outline-variant rounded-xl p-5 sm:p-8 shadow-sm flex flex-col gap-6 sm:gap-8"
            >
              {/* Info Header */}
              <div className="border-b border-outline-variant pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-primary text-white rounded-full">
                    Gjeldende Læreplan
                  </span>
                  <h2 className="font-serif text-3xl font-bold text-primary mt-2">
                    {activeCourse.title}
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Kurskode: <span className="font-semibold">{activeCourse.code}</span> • Ansvarlig: <span className="font-semibold">{activeCourse.instructor}</span>
                  </p>
                </div>
                
                <button
                  onClick={() => navigate(`/student/dashboard`)}
                  className="py-2.5 px-4 rounded border border-outline-variant hover:border-primary text-xs font-bold uppercase flex items-center gap-2 hover:text-primary transition-all active:scale-95"
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
                        className="bg-surface-container-low border border-outline-variant p-3 sm:p-4 rounded-lg flex items-center gap-2.5 sm:gap-4 hover:border-primary-container/40 transition-colors"
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
                            mod.completed ? 'bg-green-100 text-green-700' : 'bg-surface-container text-outline'
                          }`}>
                            {mod.completed ? 'Låst opp' : (
                              <>
                                <span className="hidden sm:inline">Standard utkast</span>
                                <span className="sm:hidden">Utkast</span>
                              </>
                            )}
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
              <form onSubmit={handleAddModule} className="border-t border-outline-variant pt-6 flex flex-col gap-4 form-field-stable">
                <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                  <PlusCircle size={18} /> Legg til ny leksjon / modul
                </h3>
                
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-grow space-y-2 w-full">
                    <label className="text-xs font-bold uppercase tracking-wider text-outline block">Modulens Tittel / Kjerneemne</label>
                    <input
                      type="text"
                      value={newModuleTitle}
                      onChange={(e) => setNewModuleTitle(e.target.value)}
                      placeholder="Skriv inn tittel på modulen (f.eks. Modul 9: Semesteroppsummering)..."
                      className="w-full p-3.5 border border-outline-variant rounded-lg font-sans text-xs focus:outline-none focus:border-primary shadow-sm transition-all focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-primary text-white font-bold py-3.5 px-6 rounded-lg hover:bg-primary-container transition-all active:scale-[0.98] flex items-center justify-center gap-2 w-full md:w-auto shadow-md whitespace-nowrap h-[46px]"
                  >
                    <Plus size={16} /> LEGG TIL MODUL
                  </button>
                </div>
                
                <div className="bg-surface-container p-4 rounded-lg flex gap-2.5 items-start mt-2">
                  <AlertCircle size={16} className="text-secondary mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-on-surface-variant leading-normal leading-relaxed">
                    <strong>Synkronisering i sanntid:</strong> Når du klikker på "Legg til modul", vil denne leksjonen umiddelbart integreres i kursets læreplan. Studenter som har dette kurset i sin konto vil se den nye modulen dukke opp på sitt dashboard og leksjonsskjermer med en gang!
                  </p>
                </div>
              </form>
            </motion.div>
          ) : (
            <div className="bg-white border border-outline-variant rounded-xl p-12 text-center text-outline shadow-sm">
              Velg et kurs fra venstre kolonne for å bygge læreplanen.
            </div>
          )}
        </div>
      </main>

      {/* Floating HKM Chat Widget */}
      <HkmChatWidget />
    </div>
  );
}
