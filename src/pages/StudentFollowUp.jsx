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
      `Hei ${student.name.split(' ')[0]}!\n\nJeg legger merke til at du har hatt en litt roligere periode i ${student.courseName} i det siste. \n\nJeg vil gjerne forsikre meg om at alt går bra med studiene dine, og heier på deg! Si gjerne ifra om det er deler av pensum du syns er ekstra utfordrende, så kan vi ta en prat.\n\nBeste hilsen\n${user?.name}`
    );
  };

  // Toggle template text
  const handleTemplateToggle = (type, student) => {
    setTemplateType(type);
    if (type === 'oppmuntring') {
      setCustomText(
        `Hei ${student.name.split(' ')[0]}!\n\nJeg legger merke til at du har hatt en litt roligere periode i ${student.courseName} i det siste. \n\nJeg vil gjerne forsikre meg om at alt går bra med studiene dine, og heier på deg! Si gjerne ifra om det er deler av pensum du syns er ekstra utfordrende, så kan vi ta en prat.\n\nBeste hilsen\n${user?.name}`
      );
    } else {
      setCustomText(
        `Hei ${student.name.split(' ')[0]}!\n\nDette er en vennlig påminnelse om at du henger litt etter den planlagte studieprogresjonen i ${student.courseName}. Du har fullført ${student.modulesCompleted} av ${student.totalModules} moduler.\n\nVennligst logg inn og gjør ferdig neste modul før ukens utgang, eller ta direkte kontakt så vi kan strukturere en plan.\n\nVennlig hilsen\n${user?.name}`
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
        <div className="flex justify-between items-center px-6 md:px-12 h-20 w-full max-w-[1440px] mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/teacher/dashboard')}
              className="p-2 hover:bg-surface-container rounded-full transition-colors active:scale-95 text-on-surface-variant hover:text-primary"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="font-serif text-2xl font-bold text-primary">Scholastic Premium</div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary px-3 py-1 bg-surface-container rounded-full">
              Følge Opp Studenter
            </span>
            <img 
              src={user?.avatar} 
              alt={user?.name} 
              className="w-10 h-10 rounded-full border-2 border-primary-container shadow"
            />
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-grow w-full max-w-[1140px] mx-auto px-6 md:px-12 py-12 flex flex-col gap-8">
        
        {/* Intro */}
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold text-primary flex items-center gap-2">
            <ShieldAlert size={28} className="text-error" /> Studenters Oppfølgingssenter
          </h1>
          <p className="text-sm text-on-surface-variant max-w-3xl leading-relaxed">
            Nedenfor finner du en oversikt over studenter som er merket i risikosonen. Disse har enten kritisk lav progresjon på leksjonsmodulene, eller har ikke vært aktive i systemet over lengre tid. Klikk på "Send oppfølging" for å sende en tilpasset støttemelding.
          </p>
        </div>

        {/* Filters/Summary */}
        <div className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-primary" />
            <span className="text-xs font-semibold text-on-surface-variant uppercase">Aktive risikokriterier: Siste aktivitet &gt; 3 dager eller Progresjon &lt; 60%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-error-container border border-error/30" />
            <span className="text-xs font-bold text-error mr-4">1 Kritisk</span>
            <span className="w-3.5 h-3.5 rounded bg-secondary-container/50 border border-outline-variant" />
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
                className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col justify-between gap-6 hover:border-primary transition-all duration-300 relative overflow-hidden bento-card"
              >
                {/* Risk Bar overlay accent */}
                <div className={`absolute top-0 left-0 w-full h-1.5 ${isCritical ? 'bg-error' : 'bg-secondary'}`} />

                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <img 
                      src={stud.avatar} 
                      alt={stud.name} 
                      className="w-12 h-12 rounded-full border border-outline-variant shadow-sm"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-lg font-bold text-primary">{stud.name}</h3>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isCritical ? 'bg-error-container text-error' : 'bg-secondary-container/50 text-on-secondary-container'
                        }`}>
                          {stud.status}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant font-semibold">{stud.courseName}</p>
                    </div>
                  </div>

                  {/* Progresjon Bar indicator */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-outline">Modulprogresjon</span>
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
                      <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Siste Lese-aktivitet</p>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-outline-variant rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 bg-primary text-white flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                    <Send size={18} /> Send faglært oppfølging
                  </h3>
                  <p className="text-xs text-on-primary-container/85">Mottaker: {selectedStudent.name} ({selectedStudent.courseName})</p>
                </div>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="p-1 hover:bg-white/10 rounded-full text-white/90 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={handleSend} className="p-6 space-y-6 form-field-stable">
                
                {/* Stepper / Toggle Tabs for Templates */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline block">1. Velg Meldingstype</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleTemplateToggle('oppmuntring', selectedStudent)}
                      className={`py-3 px-4 rounded-lg border font-bold text-xs uppercase tracking-wider text-center transition-all ${
                        templateType === 'oppmuntring'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary bg-transparent'
                      }`}
                    >
                      Oppmuntring / Heiarop
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTemplateToggle('paaminnelse', selectedStudent)}
                      className={`py-3 px-4 rounded-lg border font-bold text-xs uppercase tracking-wider text-center transition-all ${
                        templateType === 'paaminnelse'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary bg-transparent'
                      }`}
                    >
                      Formell Påminnelse
                    </button>
                  </div>
                </div>

                {/* Rich-text customizable field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline block">2. Tilpass meldingstekst</label>
                  <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    rows={8}
                    className="w-full p-4 border border-outline-variant rounded-lg font-sans text-sm focus:outline-none focus:border-primary shadow-sm transition-all focus:ring-1 focus:ring-primary leading-relaxed"
                  />
                </div>

                {/* Submitting Buttons */}
                <div className="flex gap-4 justify-end pt-4 border-t border-outline-variant/40">
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="py-3 px-6 rounded-lg font-bold text-xs uppercase tracking-wider text-on-surface-variant hover:bg-surface-container active:scale-95 transition-all"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-container transition-all active:scale-[0.98] shadow-md flex items-center gap-2"
                  >
                    <Send size={14} /> SEND MELDING
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
