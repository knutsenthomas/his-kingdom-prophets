import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingDown, TrendingUp, Users, BookOpen, AlertTriangle, ChevronRight,
  Clock, ArrowRight, MessageSquare, Send, Check, Search, Award, Sparkles,
  Filter, BarChart3, HelpCircle, Activity, FileText, CheckCircle
} from 'lucide-react';
import CmsText from '@/components/CmsText';

const MOCK_LESSON_STATS = [
  // PROP 101
  { id: 'ls-1', courseId: 'prop101', courseCode: 'PROP 101', title: 'Modul 2: Slektsledd & Profetisk Skjelning', dropOffRate: 28, avgTime: '1t 24m', difficulty: 'Høyt frafall', difficultyColor: 'bg-red-100 text-red-700 border-red-200' },
  { id: 'ls-2', courseId: 'prop101', courseCode: 'PROP 101', title: 'Modul 3: Drømmetydning & Symboler', dropOffRate: 18, avgTime: '1t 08m', difficulty: 'Medium frafall', difficultyColor: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'ls-3', courseId: 'prop101', courseCode: 'PROP 101', title: 'Modul 1: Profetene i GT vs NT', dropOffRate: 5, avgTime: '0t 45m', difficulty: 'Normal', difficultyColor: 'bg-green-100 text-green-700 border-green-200' },
  
  // BIBLE 301
  { id: 'ls-4', courseId: 'bible301', courseCode: 'BIBLE 301', title: 'Modul 6: Eskatologiske Typologier i Åp 5', dropOffRate: 34, avgTime: '2t 15m', difficulty: 'Høyt frafall', difficultyColor: 'bg-red-100 text-red-700 border-red-200' },
  { id: 'ls-5', courseId: 'bible301', courseCode: 'BIBLE 301', title: 'Modul 3: Historisk-Grammatisk Eksegese', dropOffRate: 22, avgTime: '1t 48m', difficulty: 'Medium frafall', difficultyColor: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'ls-6', courseId: 'bible301', courseCode: 'BIBLE 301', title: 'Modul 1: Paktsteologiske Rammeverk', dropOffRate: 8, avgTime: '0t 55m', difficulty: 'Normal', difficultyColor: 'bg-green-100 text-green-700 border-green-200' },

  // MIN 201
  { id: 'ls-7', courseId: 'min201', courseCode: 'MIN 201', title: 'Modul 4: Håndtering av Åndelig Krise', dropOffRate: 25, avgTime: '1t 50m', difficulty: 'Høyt frafall', difficultyColor: 'bg-red-100 text-red-700 border-red-200' },
  { id: 'ls-8', courseId: 'min201', courseCode: 'MIN 201', title: 'Modul 1: Sjelesorg og Emosjonell Legedom', dropOffRate: 12, avgTime: '1t 10m', difficulty: 'Normal', difficultyColor: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'ls-9', courseId: 'min201', courseCode: 'MIN 201', title: 'Modul 2: Praktisk Kirkeadministrasjon', dropOffRate: 9, avgTime: '0t 50m', difficulty: 'Normal', difficultyColor: 'bg-green-100 text-green-700 border-green-200' }
];

const MOCK_STRUGGLING_STUDENTS = [
  { id: 'st-1', name: 'Anders Berg', courseCode: 'PROP 101', courseId: 'prop101', currentModule: 'Modul 2: Profetisk Skjelning', risk: 'Kritisk', riskColor: 'bg-red-50 text-red-700 border-red-100', daysInactive: 12, reason: 'Står fast på essay om skjelning av ånder.' },
  { id: 'st-2', name: 'Ingrid Nilsen', courseCode: 'MIN 201', courseId: 'min201', currentModule: 'Modul 4: Åndelig Krise', risk: 'Forsinket', riskColor: 'bg-amber-50 text-amber-700 border-amber-100', daysInactive: 6, reason: 'Ikke påbegynt siste innlevering.' },
  { id: 'st-3', name: 'Marius Holm', courseCode: 'PROP 101', courseId: 'prop101', currentModule: 'Modul 2: Profetisk Skjelning', risk: 'Forsinket', riskColor: 'bg-amber-50 text-amber-700 border-amber-100', daysInactive: 8, reason: 'Bruker lang tid på videoavspillinger.' }
];

export default function CourseInsights() {
  const navigate = useNavigate();
  const { user, sendSupportMessage, showToast } = useApp();

  const [selectedCourse, setSelectedCourse] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Outreach modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [outreachMessage, setOutreachMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Filter lists based on selected course & search query
  const filteredLessons = MOCK_LESSON_STATS.filter(stat => {
    const matchesCourse = selectedCourse === 'all' || stat.courseId === selectedCourse;
    const matchesSearch = stat.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          stat.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  const filteredStudents = MOCK_STRUGGLING_STUDENTS.filter(student => {
    const matchesCourse = selectedCourse === 'all' || student.courseId === selectedCourse;
    return matchesCourse;
  });

  const handleOpenOutreach = (student) => {
    setSelectedStudent(student);
    setOutreachMessage(`Hei ${student.name.split(' ')[0]},\n\nJeg ser på innsikts-dashbordet at du er kommet til "${student.currentModule}" i ${student.courseCode}. Det kan være et krevende tema! Hvordan går det med studiene og innleveringen? Gi meg beskjed om du ønsker en veiledningstime eller forbønn.`);
  };

  const handleSendOutreachSubmit = (e) => {
    e.preventDefault();
    if (!outreachMessage.trim() || !selectedStudent) return;

    setIsSending(true);
    setTimeout(() => {
      sendSupportMessage(selectedStudent.name, outreachMessage);
      setIsSending(false);
      setSelectedStudent(null);
      setOutreachMessage('');
      showToast(`Oppfølgingsmelding sendt til ${selectedStudent.name}!`);
    }, 1000);
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 py-6 md:py-10 flex flex-col gap-6 md:gap-8 font-sans max-w-5xl bg-[#f8fafc]/30">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-outline">
        <span 
          className="hover:text-primary cursor-pointer transition-colors" 
          onClick={() => navigate('/teacher/dashboard')}
        >
          Hjem
        </span>
        <ChevronRight size={12} />
        <span className="text-primary font-bold">Kursinnsikt</span>
      </div>

      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-4xl font-bold text-primary flex items-center gap-2">
            <BarChart3 className="text-[#c5a059]" size={26} /> Kursinnsikt & Frafallsanalyse
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 font-medium">
            Følg studentenes tidsbruk, identifiser krevende leksjoner og ta kontakt med de som trenger ekstra støtte.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-outline-variant/30 rounded-xl px-3 py-2 text-xs font-bold text-primary shadow-sm">
            <Filter size={14} className="mr-1.5 text-[#c5a059]" />
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-transparent border-none outline-none focus:ring-0 cursor-pointer"
            >
              <option value="all">Alle fag & kurs</option>
              <option value="prop101">PROP 101 - Profetisk Tjeneste</option>
              <option value="bible301">BIBLE 301 - Avansert Hermeneutikk</option>
              <option value="min201">MIN 201 - Sjelesorg & Ledelse</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Gjennomsnittlig Tidsbruk</p>
            <h3 className="text-lg font-bold font-serif text-[#00324b]">1t 12m</h3>
            <p className="text-[9px] text-[#866324] font-semibold flex items-center gap-0.5">
              <Clock size={10} /> Per leksjonsmodul
            </p>
          </div>
          <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center shrink-0 shadow-inner">
            <Clock size={20} className="text-[#c5a059]" />
          </div>
        </div>

        <div className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Gjennomføringsindeks</p>
            <h3 className="text-lg font-bold font-serif text-[#00324b]">74.5%</h3>
            <p className="text-[9px] text-green-600 font-semibold flex items-center gap-0.5">
              <TrendingUp size={10} /> +2.4% denne måneden
            </p>
          </div>
          <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center shrink-0 shadow-inner">
            <BookOpen size={20} className="text-primary" />
          </div>
        </div>

        <div className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Kritiske Drops</p>
            <h3 className="text-lg font-bold font-serif text-[#00324b]">3 moduler</h3>
            <p className="text-[9px] text-red-600 font-semibold flex items-center gap-0.5">
              <AlertTriangle size={10} /> Har over 25% frafall
            </p>
          </div>
          <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center shrink-0 shadow-inner">
            <TrendingDown size={20} className="text-red-500" />
          </div>
        </div>

        <div className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Støttefrekvens</p>
            <h3 className="text-lg font-bold font-serif text-[#00324b]">88%</h3>
            <p className="text-[9px] text-blue-600 font-semibold flex items-center gap-0.5">
              <CheckCircle size={10} /> Oppfølging innen 24t
            </p>
          </div>
          <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center shrink-0 shadow-inner">
            <Activity size={20} className="text-blue-500" />
          </div>
        </div>
      </div>

      {/* Main Grid Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Struggle Index / Drop-off points */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="font-serif text-base font-bold text-primary flex items-center gap-2">
                <TrendingDown size={16} className="text-red-500" /> Frafalls-indikator (Struggle Index)
              </h2>
              
              <div className="relative flex items-center bg-slate-50 border border-outline-variant/30 rounded-lg px-2.5 py-1 text-xs focus-within:ring-1 focus-within:ring-[#c5a059]/40">
                <Search size={12} className="text-slate-400 mr-1.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Søk leksjon..."
                  className="bg-transparent border-none text-[10px] outline-none w-28"
                />
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
              Denne tabellen rangerer leksjonsmoduler basert på hvor mange prosent av studentene som faller av eller bruker unormalt lang tid på oppgavene.
            </p>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left border-collapse text-xs font-semibold text-on-surface">
                <thead>
                  <tr className="border-b border-outline-variant/25 text-outline text-[10px] uppercase tracking-wider">
                    <th className="pb-3 pr-2">Fag</th>
                    <th className="pb-3 pr-2">Leksjonsmodul</th>
                    <th className="pb-3 pr-2">Snitt-tid</th>
                    <th className="pb-3 pr-2 text-right">Frafall</th>
                    <th className="pb-3 text-right">Nivå</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence mode="popLayout">
                    {filteredLessons.map(stat => (
                      <motion.tr 
                        key={stat.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-3.5 pr-2 font-mono text-outline font-bold">{stat.courseCode}</td>
                        <td className="py-3.5 pr-2 font-bold text-primary leading-tight">{stat.title}</td>
                        <td className="py-3.5 pr-2 text-on-surface-variant font-medium">{stat.avgTime}</td>
                        <td className="py-3.5 pr-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="font-bold font-mono text-primary">{stat.dropOffRate}%</span>
                            <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0 hidden sm:block">
                              <div 
                                className={`h-full ${stat.dropOffRate > 25 ? 'bg-red-500' : stat.dropOffRate > 15 ? 'bg-amber-500' : 'bg-green-500'}`} 
                                style={{ width: `${stat.dropOffRate}%` }} 
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${stat.difficultyColor}`}>
                            {stat.difficulty}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mentee Risk Radar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-base font-bold text-primary flex items-center gap-2">
              <Users size={16} className="text-[#c5a059]" /> Mentee Risk Radar (Støttebehov)
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
              Studenter som er flagget som "Kritisk" eller "Forsinket" på grunn av langvarig inaktivitet eller krevende moduler.
            </p>

            <div className="space-y-3 pt-2">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <div key={student.id} className="border border-outline-variant/30 rounded-xl p-4 bg-slate-50/50 space-y-3 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-primary">{student.name}</h4>
                        <p className="text-[10px] text-outline font-semibold">{student.courseCode} — {student.currentModule}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${student.riskColor}`}>
                        {student.risk}
                      </span>
                    </div>

                    <div className="bg-white border border-outline-variant/20 rounded-lg p-2.5 text-[10px] font-medium text-on-surface-variant leading-relaxed">
                      <strong>Årsak:</strong> {student.reason}
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-red-500 font-mono">{student.daysInactive} dager inaktiv</span>
                      <button
                        onClick={() => handleOpenOutreach(student)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B4965] hover:bg-[#0f344c] text-white rounded shadow-sm hover:shadow transition-all active:scale-[0.97]"
                      >
                        <MessageSquare size={11} />
                        <span>Send oppfølging</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
                  <CheckCircle size={28} className="mx-auto text-green-500" />
                  <h4 className="text-xs font-bold text-primary">Ingen studenter i faresonen</h4>
                  <p className="text-[10px] text-outline font-medium">Alle studenter har stabil progresjon for øyeblikket.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Outreach Message Dialog (Modal) */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-outline-variant/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl hkm-chat-panel"
              style={{ transform: 'translateZ(0) !important', backfaceVisibility: 'hidden !important' }}
            >
              {/* Modal Header */}
              <div className="bg-[#1B4965] p-5 text-white flex justify-between items-center">
                <div>
                  <h3 className="font-serif font-bold text-base flex items-center gap-1.5">
                    <Sparkles size={16} className="text-[#c5a059]" /> Send disippelskaps-oppfølging
                  </h3>
                  <p className="text-[10px] text-slate-300 font-medium">Mottaker: {selectedStudent.name}</p>
                </div>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="text-slate-300 hover:text-white transition-colors text-sm font-bold p-1 bg-white/10 rounded-full"
                >
                  &times;
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSendOutreachSubmit} className="p-5 space-y-4">
                <div className="bg-slate-50 border border-outline-variant/35 rounded-xl p-3 text-[10px] font-medium text-on-surface-variant leading-relaxed">
                  <strong>Studentens utfordring:</strong> {selectedStudent.reason}
                </div>

                <div style={{ display: 'block' }}>
                  <label className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">Personlig melding</label>
                  <textarea
                    rows={6}
                    value={outreachMessage}
                    onChange={(e) => setOutreachMessage(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-outline-variant/30 rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium resize-none leading-relaxed hkm-chat-body"
                    style={{ position: 'relative !important' }}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="px-4 py-2 border border-outline-variant/30 rounded-lg text-xs font-bold text-[#1B4965] hover:bg-slate-50 transition-colors uppercase tracking-wider active:scale-[0.98]"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#1B4965] hover:bg-[#0f344c] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow transition-all active:scale-[0.97] disabled:opacity-50"
                  >
                    {isSending ? (
                      <span>Sender...</span>
                    ) : (
                      <>
                        <Send size={11} />
                        <span>Send oppfølging</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
