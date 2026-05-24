import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import CmsText from '@/components/CmsText';
import { 
  ArrowLeft, Award, HelpCircle, Save, Percent, 
  PlusCircle, RefreshCw, Calculator, UserCheck, AlertCircle,
  ClipboardList, FileText, CheckCircle2, Clock
} from 'lucide-react';

export default function GradesCalculator() {
  const navigate = useNavigate();
  const { user, students, assignments, gradeAssignment, showToast } = useApp();
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || 's1');
  const [assignmentTab, setAssignmentTab] = useState('submitted');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(assignments.find(a => a.status === 'submitted')?.id || assignments[0]?.id);
  const [assignmentGrade, setAssignmentGrade] = useState('Bestått');
  const [assignmentScore, setAssignmentScore] = useState('85/100');
  const [assignmentFeedback, setAssignmentFeedback] = useState('God besvarelse med tydelig refleksjon og god bibelsk forankring. Spiss gjerne konklusjonen enda mer.');
  
  // Weights (must sum to 100%)
  const [weightQuiz, setWeightQuiz] = useState(20);
  const [weightAssignment, setWeightAssignment] = useState(40);
  const [weightExam, setWeightExam] = useState(40);

  // Raw Scores (0-100)
  const [scoreQuiz, setScoreQuiz] = useState(85);
  const [scoreAssignment, setScoreAssignment] = useState(72);
  const [scoreExam, setScoreExam] = useState(65);

  // Calculated results
  const [finalScore, setFinalScore] = useState(0);
  const [letterGrade, setLetterGrade] = useState('Bestått');
  const [gradeColor, setGradeColor] = useState('text-primary');

  const activeStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const filteredAssignments = assignments.filter(assignment => assignment.status === assignmentTab);
  const activeAssignment = assignments.find(assignment => assignment.id === selectedAssignmentId) || filteredAssignments[0] || assignments[0];

  useEffect(() => {
    if (!assignments.some(assignment => assignment.id === selectedAssignmentId)) {
      setSelectedAssignmentId(assignments.find(assignment => assignment.status === assignmentTab)?.id || assignments[0]?.id);
    }
  }, [assignments, assignmentTab, selectedAssignmentId]);

  useEffect(() => {
    if (!activeAssignment) return;
    setAssignmentGrade(activeAssignment.grade || 'Bestått');
    setAssignmentScore(activeAssignment.score || '85/100');
    setAssignmentFeedback(activeAssignment.feedback || 'God besvarelse med tydelig refleksjon og god bibelsk forankring. Spiss gjerne konklusjonen enda mer.');
  }, [activeAssignment?.id]);

  // Update scores when changing student
  useEffect(() => {
    if (selectedStudentId === 's1') { // Anders Berg
      setScoreQuiz(60);
      setScoreAssignment(68);
      setScoreExam(55);
    } else if (selectedStudentId === 's2') { // Ingrid Nilsen
      setScoreQuiz(95);
      setScoreAssignment(88);
      setScoreExam(90);
    } else { // Marius Holm
      setScoreQuiz(45);
      setScoreAssignment(52);
      setScoreExam(40);
    }
  }, [selectedStudentId]);

  // Recalculate grade on inputs change
  useEffect(() => {
    const totalWeights = Number(weightQuiz) + Number(weightAssignment) + Number(weightExam);
    if (totalWeights === 0) return;

    // Weighted average
    const calculated = Math.round(
      ((scoreQuiz * weightQuiz) + (scoreAssignment * weightAssignment) + (scoreExam * weightExam)) / totalWeights
    );
    setFinalScore(calculated);

    // Passed / Not passed evaluation
    let grade = 'Ikke bestått';
    let color = 'text-error';
    if (calculated >= 50) {
      grade = 'Bestått';
      color = 'text-primary';
    }
    setLetterGrade(grade);
    setGradeColor(color);
  }, [weightQuiz, weightAssignment, weightExam, scoreQuiz, scoreAssignment, scoreExam]);

  const handleSaveGrade = (e) => {
    e.preventDefault();
    showToast(`Endelig vurderingsgrad ${letterGrade} (${finalScore}/100) er lagret og registrert for ${activeStudent.name}!`);
  };

  const handleGradeAssignment = (e) => {
    e.preventDefault();
    if (!activeAssignment) return;
    gradeAssignment(activeAssignment.id, {
      grade: assignmentGrade,
      score: assignmentScore,
      feedback: assignmentFeedback
    });
    setAssignmentTab('graded');
  };

  const weightsSum = Number(weightQuiz) + Number(weightAssignment) + Number(weightExam);
  const isWeightValid = weightsSum === 100;

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
            <CmsText slug="teacher-grading-breadcrumb" fallback="Tilbake til Dashboard" />
          </button>
        </div>

        {/* Intro */}
        <div className="space-y-2">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2 flex-wrap">
            <Calculator size={28} className="text-[#c5a059] shrink-0" /> <CmsText slug="teacher-grading-title" fallback="Bibelkalkulator & Vurderingsverktøy" />
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-3xl leading-relaxed font-medium">
            <CmsText slug="teacher-grading-desc" fallback="Velg en disippel, angi vekting for de ulike studieelementene (quizer, praktiske tjenesteoppgaver og semesteroppgave), og oppgi foreløpige poengsummer. Kalkulatoren beregner automatisk vektet poengsum og endelig vurdering i sanntid." />
          </p>
        </div>
      </div>

      {/* Master layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Inputs Column: Left (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Student selection card */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-5 sm:p-6 shadow-sm">
            <h3 className="font-serif text-base font-bold text-primary mb-4 flex items-center gap-2">
              <UserCheck size={18} className="shrink-0 text-primary" /> <CmsText slug="teacher-grading-select-student" fallback="Velg disippel som skal vurderes" />
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {students.map(stud => {
                const isSelected = stud.id === selectedStudentId;
                return (
                  <button
                    key={stud.id}
                    onClick={() => setSelectedStudentId(stud.id)}
                    className={`p-3 rounded-lg border flex sm:flex-col items-center sm:justify-center gap-3 sm:gap-2 text-left sm:text-center transition-all duration-200 active:scale-[0.98] ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                        : 'border-outline-variant hover:border-primary-container/40 text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <img 
                      src={stud.avatar} 
                      alt={stud.name} 
                      className="w-10 h-10 rounded-full border border-outline-variant shadow-sm object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold sm:font-normal truncate">{stud.name.split(' ')[0]}</p>
                      <span className="text-[9px] text-outline font-semibold uppercase block sm:inline">{stud.status}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calculations weights and sliders */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col gap-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-outline-variant/30">
              <h3 className="font-serif text-base font-bold text-primary flex items-center gap-2">
                <Percent size={18} className="shrink-0 text-[#c5a059]" /> <CmsText slug="teacher-grading-weights-title" fallback="Studieplanvekting (sum 100%)" />
              </h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${isWeightValid ? 'bg-green-100 text-green-700 font-bold' : 'bg-error-container text-error'}`}>
                Sum: {weightsSum}%
              </span>
            </div>

            {/* Slider 1: Quizzes */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-on-surface-variant"><CmsText slug="teacher-grading-weight-quiz" fallback="Skrift- & Leksjonsquizer" /></span>
                <span className="text-primary font-bold">{weightQuiz}% vekting</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={weightQuiz} 
                onChange={(e) => setWeightQuiz(Number(e.target.value))}
                className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Slider 2: Assignments */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-on-surface-variant"><CmsText slug="teacher-grading-weight-assignment" fallback="Praktiske Oppgaver & Veiledning" /></span>
                <span className="text-primary font-bold">{weightAssignment}% vekting</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={weightAssignment} 
                onChange={(e) => setWeightAssignment(Number(e.target.value))}
                className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Slider 3: Semester Project */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-on-surface-variant"><CmsText slug="teacher-grading-weight-exam" fallback="Semesteroppgave / Teologisk Fordypning" /></span>
                <span className="text-primary font-bold">{weightExam}% vekting</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={weightExam} 
                onChange={(e) => setWeightExam(Number(e.target.value))}
                className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>

          {/* Score Inputs Card */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-primary"><CmsText slug="teacher-grading-scores-title" fallback="Poengsummer (foreløpige resultater, 0-100)" /></h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-outline block"><CmsText slug="teacher-grading-score-quiz" fallback="Quizer" /></label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scoreQuiz}
                  onChange={(e) => setScoreQuiz(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-full p-3 border border-outline-variant rounded-lg font-sans text-xs focus:outline-none focus:border-primary shadow-sm transition-all font-medium"
                  style={{
                    transform: 'translateZ(0) !important',
                    backfaceVisibility: 'hidden !important'
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-outline block"><CmsText slug="teacher-grading-score-assignment" fallback="Tjenesteoppgaver" /></label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scoreAssignment}
                  onChange={(e) => setScoreAssignment(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-full p-3 border border-outline-variant rounded-lg font-sans text-xs focus:outline-none focus:border-primary shadow-sm transition-all font-medium"
                  style={{
                    transform: 'translateZ(0) !important',
                    backfaceVisibility: 'hidden !important'
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-outline block"><CmsText slug="teacher-grading-score-exam" fallback="Semesteroppgave" /></label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scoreExam}
                  onChange={(e) => setScoreExam(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-full p-3 border border-outline-variant rounded-lg font-sans text-xs focus:outline-none focus:border-primary shadow-sm transition-all font-medium"
                  style={{
                    transform: 'translateZ(0) !important',
                    backfaceVisibility: 'hidden !important'
                  }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Results Column: Right (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Grade output card */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 sm:p-8 shadow-sm flex flex-col items-center justify-between text-center gap-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline"><CmsText slug="teacher-grading-summary-title" fallback="Beregnet Vurderingsresymé" /></span>
            
            {/* Massive Grade Ring Visualizer */}
            <div className="relative w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center bg-surface-container rounded-full shadow-inner border-4 border-white shrink-0">
              <div className="absolute inset-4 bg-white rounded-full shadow-md flex flex-col items-center justify-center">
                <span className={`text-5xl sm:text-6xl font-bold font-serif ${gradeColor}`}>{letterGrade}</span>
                <span className="text-[11px] sm:text-xs font-bold text-outline">Resultat: {finalScore}/100</span>
              </div>
            </div>

            <div className="space-y-1.5 w-full border-t border-outline-variant/30 pt-6 text-left text-xs">
              <div className="flex justify-between font-semibold py-1">
                <span className="text-outline"><CmsText slug="teacher-grading-summary-recipient" fallback="Mottaker:" /></span>
                <span className="text-primary truncate ml-2 max-w-[180px] font-bold">{activeStudent.name}</span>
              </div>
              <div className="flex justify-between font-semibold py-1">
                <span className="text-outline"><CmsText slug="teacher-grading-summary-course" fallback="Tilmelt studie:" /></span>
                <span className="text-primary truncate ml-2 max-w-[180px]">{activeStudent.courseName}</span>
              </div>
              <div className="flex justify-between font-semibold py-1 pb-3">
                <span className="text-outline"><CmsText slug="teacher-grading-summary-progress" fallback="Studieprogresjon:" /></span>
                <span className="text-primary font-bold">{activeStudent.progress}%</span>
              </div>

              {!isWeightValid && (
                <div className="bg-error-container/30 border border-error/20 p-3 rounded-lg flex gap-2 items-start text-[11px] text-error mt-2 font-semibold">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  <span>Vektene summerer til {weightsSum}%. Evalueringen er ikke offisiell før summen er nøyaktig 100%.</span>
                </div>
              )}
            </div>

            <button
              onClick={handleSaveGrade}
              disabled={!isWeightValid}
              className={`w-full py-3.5 sm:py-4 px-6 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md ${
                isWeightValid 
                  ? 'bg-primary text-white hover:bg-primary/90 shadow-primary-container/20' 
                  : 'bg-surface-container text-outline border border-outline-variant cursor-not-allowed'
              }`}
            >
              <Save size={16} className="shrink-0" /> <CmsText slug="teacher-grading-summary-btn" fallback="LAGRE ENDELIG EVALUERING" />
            </button>
          </div>

        </div>
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-outline-variant/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-primary flex items-center gap-2">
              <ClipboardList size={20} className="text-[#c5a059]" /> <CmsText slug="teacher-grading-assignments-title" fallback="Oppgaver fra elevsidene" />
            </h2>
            <p className="text-xs text-on-surface-variant font-semibold mt-1">
              <CmsText slug="teacher-grading-assignments-desc" fallback="Synkronisert med oppgavene som vises for elevene i klasserom og oppgavemeny." />
            </p>
          </div>
          <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant">
            {[
              { id: 'pending', slug: 'teacher-grading-tab-pending', fallback: 'Utestående' },
              { id: 'submitted', slug: 'teacher-grading-tab-submitted', fallback: 'Innsendt' },
              { id: 'graded', slug: 'teacher-grading-tab-graded', fallback: 'Vurdert' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setAssignmentTab(tab.id);
                  const found = assignments.find(assignment => assignment.status === tab.id);
                  if (found) setSelectedAssignmentId(found.id);
                }}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                  assignmentTab === tab.id ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <CmsText slug={tab.slug} fallback={tab.fallback} />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12">
          <div className="xl:col-span-5 border-r border-outline-variant/20 p-5 max-h-[520px] overflow-y-auto">
            <div className="space-y-3">
              {filteredAssignments.length === 0 ? (
                <div className="py-12 text-center text-on-surface-variant text-sm flex flex-col items-center gap-3">
                  <CheckCircle2 size={34} className="text-secondary/50" />
                  <CmsText slug="teacher-grading-no-assignments" fallback="Ingen oppgaver i denne kategorien." />
                </div>
              ) : filteredAssignments.map(assignment => {
                const isSelected = assignment.id === activeAssignment?.id;
                return (
                  <button
                    key={assignment.id}
                    onClick={() => setSelectedAssignmentId(assignment.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      isSelected ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white border-outline-variant/40 hover:border-primary/40 hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-surface-container-highest text-primary">{assignment.courseCode}</span>
                      {assignment.source === 'module' && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary/5 text-primary"><CmsText slug="teacher-grading-classroom" fallback="Klasserom" /></span>}
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        assignment.status === 'pending'
                          ? 'bg-error-container text-error'
                          : assignment.status === 'submitted'
                          ? 'bg-secondary-container/50 text-on-secondary-container'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {assignment.status === 'pending' ? (
                          <CmsText slug="teacher-grading-status-pending" fallback="Ikke innlevert" />
                        ) : assignment.status === 'submitted' ? (
                          <CmsText slug="teacher-grading-status-submitted" fallback="Innsendt" />
                        ) : (
                          <CmsText slug="teacher-grading-status-graded" fallback="Vurdert" />
                        )}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-base text-primary leading-tight">{assignment.title}</h4>
                    <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{assignment.description}</p>
                    <div className="flex items-center gap-2 text-[10px] text-outline font-semibold mt-3">
                      <Clock size={11} />
                      <span><CmsText slug="teacher-grading-deadline-label" fallback="Frist:" /> {assignment.dueDate} <CmsText slug="teacher-grading-time-label" fallback="kl" /> {assignment.dueTime}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="xl:col-span-7 p-5 sm:p-6">
            {activeAssignment ? (
              <form onSubmit={handleGradeAssignment} className="space-y-6">
                <div className="border-b border-outline-variant/20 pb-5">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-primary text-white rounded-full">
                      {activeAssignment.courseCode} - {activeAssignment.courseName}
                    </span>
                    {activeAssignment.moduleTitle && (
                      <span className="text-xs font-bold px-3 py-1 bg-surface-container text-primary rounded-full">
                        {activeAssignment.moduleTitle}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-primary leading-tight">{activeAssignment.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed mt-3">{activeAssignment.description}</p>
                </div>

                <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 space-y-3">
                  <h4 className="font-serif text-base font-bold text-primary flex items-center gap-2">
                    <FileText size={16} /> <CmsText slug="teacher-grading-submission-title" fallback="Elevinnlevering" />
                  </h4>
                  {activeAssignment.submission ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-outline"><CmsText slug="teacher-grading-submission-student" fallback="Elev" /></p>
                          <p className="font-bold text-primary">{activeAssignment.submission.studentName || 'Thomas Knutsen'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-outline"><CmsText slug="teacher-grading-submission-received" fallback="Mottatt" /></p>
                          <p className="font-semibold text-on-surface-variant">{activeAssignment.submission.submittedAt}</p>
                        </div>
                      </div>
                      <p className="text-xs text-primary font-bold underline">{activeAssignment.submission.fileName}</p>
                      <p className="text-xs text-on-surface-variant leading-relaxed italic bg-white border border-outline-variant/30 rounded-lg p-3">
                        "{activeAssignment.submission.text || <CmsText slug="teacher-grading-no-text" fallback="Ingen skriftlig tekst oppgitt." />}"
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-on-surface-variant font-semibold"><CmsText slug="teacher-grading-not-delivered" fallback="Eleven har ikke levert denne oppgaven ennå." /></p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-outline"><CmsText slug="teacher-grading-result-label" fallback="Resultat" /></label>
                    <select
                      value={assignmentGrade}
                      onChange={e => setAssignmentGrade(e.target.value)}
                      className="w-full bg-[#f0f4f8] border border-outline-variant/60 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      <option value="Bestått">Bestått</option>
                      <option value="Ikke bestått">Ikke bestått</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-outline"><CmsText slug="teacher-grading-score-label" fallback="Poengsum" /></label>
                    <input value={assignmentScore} onChange={e => setAssignmentScore(e.target.value)} className="field-input" placeholder="85/100" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-outline"><CmsText slug="teacher-grading-feedback-label" fallback="Tilbakemelding til elev" /></label>
                    <textarea value={assignmentFeedback} onChange={e => setAssignmentFeedback(e.target.value)} rows={4} className="field-input resize-none leading-relaxed" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!activeAssignment.submission}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white text-xs font-bold uppercase rounded-lg shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Save size={15} /> <CmsText slug="teacher-grading-save-btn" fallback="Lagre vurdering til elev" />
                </button>
              </form>
            ) : (
              <div className="py-12 text-center text-outline"><CmsText slug="teacher-grading-select-prompt" fallback="Velg en oppgave for å se detaljer." /></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
