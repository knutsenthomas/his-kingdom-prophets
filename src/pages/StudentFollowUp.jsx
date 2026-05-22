import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, AlertTriangle, Send, Mail, CheckCircle2, 
  MessageSquare, User, Filter, Sliders, ShieldAlert, X
} from 'lucide-react';
import HkmChatWidget from '@/components/HkmChatWidget';

export default function StudentFollowUp() {
  const navigate = useNavigate();
  const { user, students, sendSupportMessage, showToast } = useApp();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [templateType, setTemplateType] = useState('oppmuntring'); // oppmuntring, paaminnelse
  const [customText, setCustomText] = useState('');

  // Open modal handler and setup template
  const handleOpenModal = (student) => {
    setSelectedStudent(student);
    setTemplateType('oppmuntring');
    setCustomText(
      `Hei ${student.name.split(' ')[0]}!\n\nJeg legger merke til at du har hatt en litt roligere periode i ${student.courseName} i det siste.\n\nJeg ber for deg og din profetiske utrustning, og ønsker å høre hvordan det går med studieprogresjonen og din åndelige vandring. Si gjerne ifra om det er moduler eller emner du synes er krevende, eller om du trenger forbønn og sjelesorg.\n\nGuds velsignelse,\n${user?.name}`
    );
  };

  // Toggle template text
  const handleTemplateToggle = (type, student) => {
    setTemplateType(type);
    if (type === 'oppmuntring') {
      setCustomText(
        `Hei ${student.name.split(' ')[0]}!\n\nJeg legger merke til at du har hatt en litt roligere periode i ${student.courseName} i det siste.\n\nJeg ber for deg og din profetiske utrustning, og ønsker å høre hvordan det går med studieprogresjonen og din åndelige vandring. Si gjerne ifra om det er moduler eller emner du synes er krevende, eller om du trenger forbønn og sjelesorg.\n\nGuds velsignelse,\n${user?.name}`
      );
    } else {
      setCustomText(
        `Hei ${student.name.split(' ')[0]}!\n\nDette er en vennlig påminnelse om din framdrift i ${student.courseName}. Du har fullført ${student.modulesCompleted} av ${student.totalModules} moduler.\n\nFor å bevare kontinuiteten i din profetiske utrustning og disippelskap, vil jeg oppmuntre deg til å fullføre neste modul før ukens utgang. Ta gjerne kontakt om vi skal strukturere en personlig studieplan sammen.\n\nVennlig hilsen i Kristus,\n${user?.name}`
      );
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!customText.trim()) return;

    sendSupportMessage(selectedStudent.name, customText);
    setSelectedStudent(null);
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
            <div className="font-serif text-lg sm:text-2xl font-bold text-primary truncate">His Kingdom Prophets</div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-secondary px-3 py-1 bg-surface-container rounded-full">
              Disippeloppfølging
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
      <main className="flex-grow w-full max-w-[1140px] mx-auto px-6 md:px-12 py-12 flex flex-col gap-8">
        
        {/* Intro */}
        <div className="space-y-2">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2 flex-wrap">
            <ShieldAlert size={28} className="text-error shrink-0" /> Senter for Disippeloppfølging
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-3xl leading-relaxed">
            Nedenfor finner du en oversikt over disipler som har lavere studieaktivitet. Disse har enten lav progresjon på leksjonsmodulene, eller har ikke vært aktive i systemet over lengre tid. Klikk på "Send oppfølging" for å sende en tilpasset sjelesorgs- eller oppmuntringsmelding.
          </p>
        </div>

        {/* Filters/Summary */}
        <div className="bg-white border border-outline-variant rounded-xl p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-primary shrink-0" />
            <span className="text-xs font-semibold text-on-surface-variant uppercase leading-relaxed">
              Aktive kriterier: Siste aktivitet &gt; 3 dager eller Progresjon &lt; 60%
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-3.5 h-3.5 rounded bg-error-container border border-error/30 shrink-0" />
            <span className="text-xs font-bold text-error mr-4">1 Kritisk</span>
            <span className="w-3.5 h-3.5 rounded bg-secondary-container/50 border border-outline-variant shrink-0" />
            <span className="text-xs font-bold text-on-secondary-container">2 Forsinket</span>
          </div>
        </div>

        {/* Student Attention Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {students.map(stud => {
            const isCritical = stud.status === 'Kritisk';
            return (
              <div 
                key={stud.id} 
                className="bg-white border border-outline-variant rounded-xl p-5 sm:p-6 shadow-sm flex flex-col justify-between gap-6 hover:border-primary transition-all duration-300 relative overflow-hidden bento-card"
              >
                {/* Risk Bar overlay accent */}
                <div className={`absolute top-0 left-0 w-full h-1.5 ${isCritical ? 'bg-error' : 'bg-secondary'}`} />

                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <img 
                      src={stud.avatar} 
                      alt={stud.name} 
                      className="w-12 h-12 rounded-full border border-outline-variant shadow-sm object-cover shrink-0"
                    />
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif text-base sm:text-lg font-bold text-primary truncate">{stud.name}</h3>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isCritical ? 'bg-error-container text-error' : 'bg-secondary-container/50 text-on-secondary-container'
                        }`}>
                          {stud.status}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant font-semibold truncate">{stud.courseName}</p>
                    </div>
                  </div>

                  {/* Progresjon Bar indicator */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-outline">Studieprogresjon</span>
                      <span className="text-primary">{stud.progress}% ({stud.modulesCompleted} av {stud.totalModules} fullført)</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${isCritical ? 'bg-error' : 'bg-secondary'}`} 
                        style={{ width: `${stud.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Activity and details */}
                  <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-outline-variant/30 text-on-surface-variant">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Siste studieaktivitet</p>
                      <p className="font-semibold">{stud.lastActivity}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Oppfølgingshistorikk</p>
                      <p className="font-semibold text-secondary">Ingen forrige varsler</p>
                    </div>
                  </div>
                </div>

                {/* Send Support Message trigger button */}
                <button
                  onClick={() => handleOpenModal(stud)}
                  className={`w-full py-3 px-4 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] duration-150 ${
                    isCritical 
                      ? 'bg-error text-white hover:bg-error/95 shadow-md shadow-error/10' 
                      : 'bg-primary text-white hover:bg-primary-container shadow-md'
                  }`}
                >
                  <Mail size={14} /> SEND OPPFØLGING
                </button>
              </div>
            );
          })}
        </div>
      </main>

      {/* Support Dialog Template Modal Overlay */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-outline-variant rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 sm:p-6 bg-primary text-white flex justify-between items-center shrink-0">
                <div className="space-y-1 min-w-0 mr-4">
                  <h3 className="font-serif text-lg sm:text-xl font-bold flex items-center gap-2 truncate">
                    <Send size={18} className="shrink-0" /> Send pastoral oppfølging
                  </h3>
                  <p className="text-xs text-on-primary-container/85 truncate">Mottaker: {selectedStudent.name} ({selectedStudent.courseName})</p>
                </div>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="p-1 hover:bg-white/10 rounded-full text-white/90 transition-colors shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={handleSend} className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-grow form-field-stable">
                
                {/* Stepper / Toggle Tabs for Templates */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline block">1. Velg Meldingstype</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => handleTemplateToggle('oppmuntring', selectedStudent)}
                      className={`py-2.5 sm:py-3 px-4 rounded-lg border font-bold text-xs uppercase tracking-wider text-center transition-all ${
                        templateType === 'oppmuntring'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary bg-transparent'
                      }`}
                    >
                      Oppmuntring & Forbønn
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTemplateToggle('paaminnelse', selectedStudent)}
                      className={`py-2.5 sm:py-3 px-4 rounded-lg border font-bold text-xs uppercase tracking-wider text-center transition-all ${
                        templateType === 'paaminnelse'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary bg-transparent'
                      }`}
                    >
                      Kjærlig Påminnelse
                    </button>
                  </div>
                </div>

                {/* Rich-text customizable field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline block">2. Tilpass meldingstekst</label>
                  <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    rows={6}
                    className="w-full p-3 sm:p-4 border border-outline-variant rounded-lg font-sans text-sm focus:outline-none focus:border-primary shadow-sm transition-all focus:ring-1 focus:ring-primary leading-relaxed"
                  />
                </div>

                {/* Submitting Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-end pt-4 border-t border-outline-variant/40 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="py-3 px-6 rounded-lg font-bold text-xs uppercase tracking-wider text-on-surface-variant hover:bg-surface-container active:scale-95 transition-all w-full sm:w-auto"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-container transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <Send size={14} className="shrink-0" /> SEND MELDING
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating HKM Chat Widget */}
      <HkmChatWidget />
    </div>
  );
}
