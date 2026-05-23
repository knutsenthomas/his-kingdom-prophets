import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, BookOpen, AlertTriangle, TrendingUp, ChevronRight,
  Sparkles, Calendar, ArrowRight, MessageSquare, ClipboardList,
  Sliders, Award, Video, Play, CheckCircle, Clock, Send, ShieldAlert,
  GraduationCap, Check, X, FileText, BarChart3
} from 'lucide-react';
import CmsText from '@/components/CmsText';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { 
    user, 
    students, 
    courses, 
    cmsContent, 
    assignments, 
    gradeAssignment, 
    sendSupportMessage,
    showToast,
    language
  } = useApp();

  // Filter out at-risk students (Kritisk or Forsinket)
  const atRiskStudents = students.filter(s => s.status === 'Kritisk' || s.status === 'Forsinket');

  // Filter out unread/submitted assignments (status === 'submitted')
  const submittedAssignments = assignments.filter(a => a.status === 'submitted');

  // Inline grading modal state
  const [selectedGradingAssignment, setSelectedGradingAssignment] = useState(null);
  const [gradeInput, setGradeInput] = useState('Bestått');
  const [scoreInput, setScoreInput] = useState('95/100');
  const [feedbackInput, setFeedbackInput] = useState('');

  // Inline outreach outreach input state
  const [selectedOutreachStudent, setSelectedOutreachStudent] = useState(null);
  const [outreachMessage, setOutreachMessage] = useState('');
  const [isSendingOutreach, setIsSendingOutreach] = useState(false);

  // Mock list for live-timer
  const todayClasses = [
    {
      id: 'class-1',
      title: 'Profetisk Karakter & Modenhet',
      code: 'PROP 101',
      time: '10:00 - 11:30',
      instructor: 'Apostel David Hansen',
      studentsCount: 18,
      zoomLink: 'https://zoom.us/j/9270778606',
      status: 'completed'
    },
    {
      id: 'class-2',
      title: 'Apokalyptisk Hermeneutikk i Kristiansand',
      code: 'BIBLE 301',
      time: '19:00 - 20:30',
      instructor: 'Profet Jon Arild',
      studentsCount: 14,
      zoomLink: 'https://zoom.us/j/9270778607',
      status: 'live'
    },
    {
      id: 'class-3',
      title: 'Sjelesorg & Indre Helbredelse',
      code: 'MIN 201',
      time: 'I morgen 18:00',
      instructor: 'Pastor Siri Knutsen',
      studentsCount: 22,
      zoomLink: 'https://zoom.us/j/9270778608',
      status: 'scheduled'
    }
  ];

  const handleStartClass = (className, zoomLink) => {
    showToast(`Starter leksjon: ${className}...`);
    setTimeout(() => {
      window.open(zoomLink, '_blank');
    }, 1000);
  };

  const handleOpenGrader = (assignment) => {
    setSelectedGradingAssignment(assignment);
    setGradeInput('Bestått');
    setScoreInput('90/100');
    setFeedbackInput(`Kjære student,\n\nTakk for din grundige besvarelse. Du viser god teologisk forståelse og reflekterer modent rundt dette emnet. Fortsett det gode arbeidet!`);
  };

  const handleSaveGrade = (e) => {
    e.preventDefault();
    if (!selectedGradingAssignment) return;

    gradeAssignment(selectedGradingAssignment.id, {
      grade: gradeInput,
      score: scoreInput,
      feedback: feedbackInput
    });

    setSelectedGradingAssignment(null);
  };

  const handleOpenOutreach = (student) => {
    setSelectedOutreachStudent(student);
    setOutreachMessage(`Hei ${student.name.split(' ')[0]},\n\nJeg har lagt merke til at det er en stund siden din siste aktivitet i kurset. Håper alt står bra til med deg! La meg vite hvis det er noe jeg kan bistå med eller be for.`);
  };

  const handleSendOutreach = (e) => {
    e.preventDefault();
    if (!selectedOutreachStudent || !outreachMessage.trim()) return;

    setIsSendingOutreach(true);
    setTimeout(() => {
      sendSupportMessage(selectedOutreachStudent.name, outreachMessage);
      setIsSendingOutreach(false);
      setSelectedOutreachStudent(null);
      setOutreachMessage('');
    }, 1000);
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-12 py-6 md:py-12 flex flex-col gap-6 md:gap-8 font-sans bg-background/30">
      
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-4xl font-bold text-primary">
            <CmsText 
              slug="teacher-welcome-title" 
              fallback="Veiledningssenter & Mentorportal" 
              replaceObj={{ '{name}': user?.name.split(' ')[0] || 'Lærer' }} 
            />
          </h1>
          <CmsText
            slug="teacher-welcome-subtitle"
            fallback="Oversikt over studentenes åndelige fremdrift, disippelskap og oppfølgingsvarsler."
            as="p"
            className="text-xs sm:text-sm text-on-surface-variant mt-1 font-medium"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-on-surface-variant font-semibold bg-[#eaeef2] px-3 py-1.5 rounded-full border border-outline-variant/30 font-mono">
            <CmsText slug="teacher-academic-year-label" fallback="Studieår" />: 2026
          </span>
          <span className="text-xs text-white font-bold bg-[#c5a059] px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
            <Sparkles size={12} />
            HKM Headless CMS
          </span>
        </div>
      </div>

      {/* 2. Platform KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Active students */}
        <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-300">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
              <CmsText slug="teacher-kpi1-label" fallback="Aktive studenter" />
            </p>
            <h3 className="text-3xl font-bold font-serif text-[#3c096c]">{students.length + 45}</h3>
            <p className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
              <TrendingUp size={12} /> <CmsText slug="teacher-kpi1-trend" fallback="+12% fra forrige måned" />
            </p>
          </div>
          <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center text-primary">
            <Users size={22} />
          </div>
        </div>

        {/* KPI 2: Average progress */}
        <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-300">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
              <CmsText slug="teacher-kpi2-label" fallback="Faglig Snittfremdrift" />
            </p>
            <h3 className="text-3xl font-bold font-serif text-[#3c096c]">48%</h3>
            <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-[#3c096c] w-[48%]" />
            </div>
          </div>
          <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center text-primary">
            <BookOpen size={22} />
          </div>
        </div>

        {/* KPI 3: Average grade */}
        <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-300">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
              <CmsText slug="teacher-kpi3-label" fallback="Gjennomføringsrate" />
            </p>
            <h3 className="text-3xl font-bold font-serif text-[#3c096c]">95%</h3>
            <p className="text-[10px] text-outline font-semibold">
              <CmsText slug="teacher-kpi3-desc" fallback="Bestått-andel for aktive disipler" />
            </p>
          </div>
          <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center text-primary">
            <Award size={22} />
          </div>
        </div>

        {/* KPI 4: Under warnings */}
        <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-300">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
              <CmsText slug="teacher-kpi4-label" fallback="Studenter under oppfølging" />
            </p>
            <h3 className="text-3xl font-bold font-serif text-error">{atRiskStudents.length}</h3>
            <p className="text-[10px] text-error font-semibold flex items-center gap-1">
              <AlertTriangle size={12} /> <CmsText slug="teacher-kpi4-desc" fallback="Kritisk eller forsinket framdrift" />
            </p>
          </div>
          <div className="w-12 h-12 bg-error-container/30 rounded-lg flex items-center justify-center text-error">
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Live schedules & submitted papers (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Section A: Kommende Live-timer */}
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-lg md:text-xl font-bold text-primary flex items-center gap-2">
                <Video size={20} className="text-[#c5a059]" />
                <span><CmsText slug="teacher-classes-title" fallback="Dagens forelesninger & live-rom" /></span>
              </h3>
              <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                {language === 'en' ? 'Live Today' : 'Live i dag'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {todayClasses.map((item) => (
                <div 
                  key={item.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 ${
                    item.status === 'live'
                      ? 'border-[#c5a059] bg-[#c5a059]/5 shadow-sm'
                      : 'border-outline-variant/40 bg-[#f8fafc]/50 hover:bg-[#f8fafc]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'live' ? 'bg-[#c5a059] text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {item.code}
                      </span>
                      {item.status === 'live' && (
                        <span className="text-[10px] text-[#c5a059] font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                          <Play size={10} className="fill-[#c5a059]" /> Pågår nå
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif text-base font-bold text-primary">{item.title}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant font-medium">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock size={12} /> {item.time}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span>Lærer: {item.instructor}</span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1 text-[#3c096c]">
                        <Users size={12} /> {item.studentsCount} studenter
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartClass(item.title, item.zoomLink)}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all shrink-0 active:scale-95 shadow-sm ${
                      item.status === 'live'
                        ? 'bg-[#c5a059] hover:bg-[#b08b45] text-white'
                        : 'bg-[#3c096c] hover:opacity-95 text-white'
                    }`}
                  >
                    <Video size={14} />
                    {item.status === 'live' ? (language === 'en' ? 'Join / Start Lecture' : 'Bli med / Start leksjon') : <CmsText slug="teacher-btn-start-class" fallback="Start forelesning (Zoom)" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section B: Uleste oppgaver (Submitted exams needing grades) */}
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-lg md:text-xl font-bold text-primary flex items-center gap-2">
                <ClipboardList size={20} className="text-[#c5a059]" />
                <span><CmsText slug="teacher-incoming-title" fallback="Innkomne oppgaver til sensur" /></span>
              </h3>
              <span className="text-xs bg-[#eaeef2] text-primary font-bold px-3 py-1 rounded-full border border-outline-variant/30">
                {submittedAssignments.length} <CmsText slug="student-assignments-waiting-grade" fallback="venter på sensur" />
              </span>
            </div>

            {submittedAssignments.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-outline-variant/50 rounded-xl bg-slate-50">
                <CheckCircle size={32} className="text-green-500 mx-auto mb-3" />
                <p className="text-sm font-bold text-[#3c096c]">Alle oppgaver er vurdert!</p>
                <p className="text-xs text-outline font-semibold mt-1">Gode mentorer holder orden i studieplanen.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {submittedAssignments.map((assignment) => (
                  <div 
                    key={assignment.id}
                    className="p-5 border border-outline-variant/40 hover:border-primary/40 bg-white rounded-xl shadow-sm hover:shadow transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-bold bg-[#f0f4f8] text-[#3c096c] px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {assignment.courseCode}
                        </span>
                        <span className="text-[10px] text-outline font-semibold">
                          Levert: {assignment.submission?.submittedAt || 'Nylig'}
                        </span>
                      </div>
                      <h4 className="font-serif text-base font-bold text-primary truncate pr-4">{assignment.title}</h4>
                      <p className="text-xs text-on-surface-variant font-medium">
                        Student: <span className="font-bold text-[#3c096c]">Thomas Knutsen</span> (Student-persona)
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-[#c5a059] font-bold pt-1.5">
                        <FileText size={12} />
                        <span className="truncate max-w-md italic">"{assignment.submission?.text.substring(0, 80)}..."</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenGrader(assignment)}
                      className="flex items-center gap-1 px-4 py-2 bg-[#3c096c] hover:opacity-95 text-white rounded-lg text-xs font-bold transition-all shrink-0 active:scale-95"
                    >
                      <span>Vurder besvarelse</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right column: At-risk students & Quick actions (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Section C: Prioritert Studentoppfølging */}
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                <AlertTriangle size={18} className="text-error" />
                <span><CmsText slug="teacher-risk-title" fallback="Studenter som krever oppfølging" /></span>
              </h3>
              <button 
                onClick={() => navigate('/teacher/follow-up')}
                className="text-[10px] text-primary font-bold uppercase tracking-wider hover:underline"
              >
                <CmsText slug="student-view-all" fallback="Vis alle" />
              </button>
            </div>

            <div className="space-y-4">
              {atRiskStudents.map((stud, idx) => (
                <div 
                  key={idx} 
                  className="flex gap-3.5 items-start p-3 bg-[#f8fafc] border border-outline-variant/50 rounded-xl hover:border-primary/40 transition-all duration-300"
                >
                  <img 
                    src={stud.avatar} 
                    alt={stud.name} 
                    className="w-10 h-10 rounded-full border border-outline-variant/40 shadow object-cover shrink-0 mt-0.5"
                  />
                  <div className="flex-grow space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-primary leading-tight truncate">{stud.name}</h4>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        stud.status === 'Kritisk' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {stud.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-outline font-semibold truncate leading-tight">{stud.courseName}</p>
                    
                    <div className="flex items-center justify-between text-[9px] text-[#72787e] font-semibold">
                      <span>Lese-aktivitet: {stud.lastActivity}</span>
                      <span>Fremgang: {stud.progress}%</span>
                    </div>

                    <button
                      onClick={() => handleOpenOutreach(stud)}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 py-1 px-2.5 bg-white border border-[#c1c7ce] hover:border-primary text-primary hover:text-white hover:bg-primary rounded-lg text-[10px] font-bold transition-all"
                    >
                      <Send size={10} />
                      Send oppmuntring
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section D: Administrative Hurtigtjenester */}
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <Sliders size={18} className="text-[#c5a059]" />
              <span>Administrative tjenester</span>
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                { name: 'Studiebygger (CMS)', path: '/teacher/course-builder', desc: 'Legg til leksjoner og studieplaner.', icon: BookOpen },
                { name: 'Prøvebygger (Quiz)', path: '/teacher/quiz-builder', desc: 'Lag interaktive prøver og kodingstester.', icon: ClipboardList },
                { name: 'Bibelkalkulator', path: '/teacher/grading', desc: 'Beregne og simulere karakterer.', icon: Award },
                { name: 'Mediebibliotek', path: '/teacher/media-library', desc: 'Last opp videoer og ressurser.', icon: Video },
                { name: 'Varslingssenter', path: '/teacher/notifications', desc: 'Motta henvendelser og koordiner kunngjøringer.', icon: MessageSquare },
                { name: 'Vekst & Markedsføring', path: '/teacher/marketing', desc: 'Administrer kampanjer og rabattkoder.', icon: TrendingUp }
              ].map((act, idx) => {
                const ActIcon = act.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => navigate(act.path)}
                    className="p-3 text-left border border-outline-variant/40 hover:border-primary/40 bg-surface-container-lowest hover:bg-slate-50 transition-all rounded-xl active:scale-[0.98] group flex gap-3 items-center"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <ActIcon size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-primary leading-snug group-hover:text-primary transition-colors">{act.name}</h4>
                      <p className="text-[9px] text-[#72787e] font-semibold truncate mt-0.5">{act.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section E: Live Course Metrics Graph Simulator */}
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-[#c5a059]" />
              <span>Resultatfordeling</span>
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Bestått', pct: 85, color: 'bg-primary' },
                { label: 'Ikke bestått', pct: 5, color: 'bg-error/70' },
                { label: 'Ikke levert', pct: 10, color: 'bg-slate-300' }
              ].map((g, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-on-surface-variant font-semibold font-sans">
                  <span className="w-20 shrink-0">{g.label}</span>
                  <div className="flex items-center gap-2 flex-grow mx-4">
                    <div className="h-3 bg-slate-100 rounded-full flex-grow relative overflow-hidden">
                      <div className={`h-full ${g.color}`} style={{ width: `${g.pct}%` }} />
                    </div>
                    <span className="w-6 text-right font-mono font-bold text-primary">{g.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 4. INLINE GRADING MODAL DRAWERS */}
      <AnimatePresence>
        {selectedGradingAssignment && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGradingAssignment(null)}
              className="absolute inset-0 bg-[#240046]/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl border border-outline-variant/30 max-w-2xl w-full overflow-hidden shadow-2xl relative z-10 text-on-surface flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-[#3c096c] text-white px-6 py-4 flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold bg-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {selectedGradingAssignment.courseCode} • Sensur
                  </span>
                  <h3 className="font-serif text-lg font-bold truncate pr-6">{selectedGradingAssignment.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedGradingAssignment(null)}
                  className="p-1 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveGrade} className="p-6 overflow-y-auto space-y-6 flex-grow">
                {/* Assignment & Submission text */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Oppgavebeskrivelse</label>
                  <p className="text-xs text-on-surface-variant bg-[#eaeef2]/40 p-3 rounded-lg border border-outline-variant/30 leading-relaxed font-medium">
                    {selectedGradingAssignment.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Studentens besvarelse (Thomas Knutsen)</label>
                  <div className="text-xs text-slate-800 bg-[#f8fafc] p-4 rounded-xl border border-outline-variant/40 leading-relaxed font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {selectedGradingAssignment.submission?.text}
                  </div>
                </div>

                {/* Score & Grade Select */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Resultat</label>
                    <select
                      value={gradeInput}
                      onChange={(e) => setGradeInput(e.target.value)}
                      className="w-full bg-[#f0f4f8] border border-outline-variant/60 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                      style={{ transform: 'translateZ(0) !important', display: 'block' }}
                    >
                      <option value="Bestått">Bestått</option>
                      <option value="Ikke bestått">Ikke bestått</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Evaluering Score</label>
                    <input
                      type="text"
                      value={scoreInput}
                      onChange={(e) => setScoreInput(e.target.value)}
                      className="w-full bg-[#f0f4f8] border border-outline-variant/60 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                      placeholder="F.eks. 94/100"
                      style={{ transform: 'translateZ(0) !important', display: 'block' }}
                    />
                  </div>
                </div>

                {/* Written Feedback Textarea */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Tilbakemelding / Mentorveiledning</label>
                  <textarea
                    rows={4}
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    className="w-full bg-[#f0f4f8] border border-outline-variant/60 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none leading-relaxed"
                    style={{ transform: 'translateZ(0) !important', display: 'block' }}
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 bg-[#3c096c] hover:opacity-95 text-white py-3 rounded-xl text-xs font-bold transition-all active:scale-[0.98] shadow-md"
                >
                  <CheckCircle size={16} />
                  Lagre og publiser vurdering
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. INLINE OUTREACH DIALOGS */}
      <AnimatePresence>
        {selectedOutreachStudent && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOutreachStudent(null)}
              className="absolute inset-0 bg-[#240046]/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl border border-outline-variant/30 max-w-md w-full overflow-hidden shadow-2xl relative z-10 text-on-surface"
            >
              {/* Header */}
              <div className="bg-[#3c096c] text-white px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-[#c5a059]" />
                  <h3 className="font-serif text-sm sm:text-base font-bold">Pastoral oppmuntring & Veiledning</h3>
                </div>
                <button 
                  onClick={() => setSelectedOutreachStudent(null)}
                  className="p-1 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSendOutreach} className="p-6 space-y-4">
                <div className="flex items-center gap-3 bg-[#f8fafc] p-3 rounded-xl border border-outline-variant/40">
                  <img 
                    src={selectedOutreachStudent.avatar} 
                    alt={selectedOutreachStudent.name} 
                    className="w-10 h-10 rounded-full border border-outline-variant shadow object-cover shrink-0"
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-primary leading-tight">{selectedOutreachStudent.name}</h4>
                    <p className="text-[9px] text-outline font-semibold mt-0.5">{selectedOutreachStudent.courseName} • Framgang: {selectedOutreachStudent.progress}%</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Oppmuntringsmelding</label>
                  <textarea
                    rows={4}
                    value={outreachMessage}
                    onChange={(e) => setOutreachMessage(e.target.value)}
                    className="w-full bg-[#f0f4f8] border border-outline-variant/60 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none leading-relaxed"
                    style={{ transform: 'translateZ(0) !important', display: 'block' }}
                    required
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedOutreachStudent(null)}
                    className="flex-grow py-2.5 border border-[#c1c7ce] hover:bg-slate-50 text-xs font-bold text-primary rounded-xl transition-all"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingOutreach}
                    className="flex-grow flex items-center justify-center gap-1.5 bg-[#3c096c] hover:opacity-95 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98] shadow-md"
                  >
                    <Send size={12} />
                    {isSendingOutreach ? 'Sender...' : 'Send melding'}
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
