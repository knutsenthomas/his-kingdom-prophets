import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Award, HelpCircle, Save, Percent, 
  PlusCircle, RefreshCw, Calculator, UserCheck, AlertCircle
} from 'lucide-react';

export default function GradesCalculator() {
  const navigate = useNavigate();
  const { user, students, showToast } = useApp();
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || 's1');
  
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
  const [letterGrade, setLetterGrade] = useState('C');
  const [gradeColor, setGradeColor] = useState('text-primary');

  const activeStudent = students.find(s => s.id === selectedStudentId) || students[0];

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

    // Letter grade scale
    let grade = 'F';
    let color = 'text-error';
    if (calculated >= 90) {
      grade = 'A';
      color = 'text-primary';
    } else if (calculated >= 80) {
      grade = 'B';
      color = 'text-primary';
    } else if (calculated >= 68) {
      grade = 'C';
      color = 'text-[#c5a059]';
    } else if (calculated >= 55) {
      grade = 'D';
      color = 'text-on-secondary-container';
    } else if (calculated >= 40) {
      grade = 'E';
      color = 'text-on-secondary-container';
    }
    setLetterGrade(grade);
    setGradeColor(color);
  }, [weightQuiz, weightAssignment, weightExam, scoreQuiz, scoreAssignment, scoreExam]);

  const handleSaveGrade = (e) => {
    e.preventDefault();
    showToast(`Endelig vurderingsgrad ${letterGrade} (${finalScore}/100) er lagret og registrert for ${activeStudent.name}!`);
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
            Tilbake til Dashboard
          </button>
        </div>

        {/* Intro */}
        <div className="space-y-2">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2 flex-wrap">
            <Calculator size={28} className="text-[#c5a059] shrink-0" /> Bibelkalkulator & Vurderingsverktøy
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-3xl leading-relaxed font-medium">
            Velg en disippel, angi vekting for de ulike studieelementene (quizer, praktiske tjenesteoppgaver og semesteroppgave), og oppgi foreløpige poengsummer. Kalkulatoren beregner automatisk vektet poengsum og endelig vurdering i sanntid.
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
              <UserCheck size={18} className="shrink-0 text-primary" /> Velg disippel som skal vurderes
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
                <Percent size={18} className="shrink-0 text-[#c5a059]" /> Studieplanvekting (sum 100%)
              </h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${isWeightValid ? 'bg-green-100 text-green-700 font-bold' : 'bg-error-container text-error'}`}>
                Sum: {weightsSum}%
              </span>
            </div>

            {/* Slider 1: Quizzes */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-on-surface-variant">Skrift- & Leksjonsquizer</span>
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
                <span className="text-on-surface-variant">Praktiske Oppgaver & Veiledning</span>
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
                <span className="text-on-surface-variant">Semesteroppgave / Teologisk Fordypning</span>
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
            <h3 className="font-serif text-base font-bold text-primary">Poengsummer (foreløpige resultater, 0-100)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-outline block">Quizer</label>
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
                <label className="text-xs font-bold uppercase tracking-wider text-outline block">Tjenesteoppgaver</label>
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
                <label className="text-xs font-bold uppercase tracking-wider text-outline block">Semesteroppgave</label>
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Beregnet Vurderingsresymé</span>
            
            {/* Massive Grade Ring Visualizer */}
            <div className="relative w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center bg-surface-container rounded-full shadow-inner border-4 border-white shrink-0">
              <div className="absolute inset-4 bg-white rounded-full shadow-md flex flex-col items-center justify-center">
                <span className={`text-5xl sm:text-6xl font-bold font-serif ${gradeColor}`}>{letterGrade}</span>
                <span className="text-[11px] sm:text-xs font-bold text-outline">Resultat: {finalScore}/100</span>
              </div>
            </div>

            <div className="space-y-1.5 w-full border-t border-outline-variant/30 pt-6 text-left text-xs">
              <div className="flex justify-between font-semibold py-1">
                <span className="text-outline">Mottaker:</span>
                <span className="text-primary truncate ml-2 max-w-[180px] font-bold">{activeStudent.name}</span>
              </div>
              <div className="flex justify-between font-semibold py-1">
                <span className="text-outline">Tilmelt studie:</span>
                <span className="text-primary truncate ml-2 max-w-[180px]">{activeStudent.courseName}</span>
              </div>
              <div className="flex justify-between font-semibold py-1 pb-3">
                <span className="text-outline">Studieprogresjon:</span>
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
              <Save size={16} className="shrink-0" /> LAGRE ENDELIG EVALUERING
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
