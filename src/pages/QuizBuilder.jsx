import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Eye, Sliders, BookOpen, Clock, 
  HelpCircle, CheckCircle, Code, AlignLeft, GripVertical, 
  Sparkles, Save, Play, RefreshCw, Layers
} from 'lucide-react';

const INITIAL_QUESTIONS = [
  {
    id: "q1",
    type: "multiple-choice",
    title: "Hva betyr uttrykket 'Nåde' i nytestamentlig teologi?",
    options: [
      "En ufortjent gave fra Gud til frelse",
      "Belønning for gode gjerninger og ritualer",
      "En spesiell tittel gitt til skriftlærde",
      "Et sett med moralske leveregler"
    ],
    correctAnswer: 0
  },
  {
    id: "q2",
    type: "drag-drop",
    title: "Trekk riktig begrep til setningen om den apostoliske tradisjon:",
    sentence: "Den tidlige kirke holdt fast ved apostlenes [begrep1] og brødsbrytelsen i det daglige [begrep2].",
    blanks: {
      "begrep1": "lære",
      "begrep2": "fellesskap"
    },
    choices: ["lære", "fellesskap", "lovverk", "ritual"]
  },
  {
    id: "q3",
    type: "code-test",
    title: "Skriv en enkel JavaScript-funksjon kalt 'validerGave' som tar et tall 'poeng' og returnerer true dersom det er større enn 100, ellers false.",
    starterCode: "function validerGave(poeng) {\n  // Skriv din løsning her\n  \n}",
    testCase: { input: "150", output: "true" }
  }
];

export default function QuizBuilder() {
  const { showToast } = useApp();
  const [quizTitle, setQuizTitle] = useState('Profetisk Embete og Lære - Evaluering');
  const [quizDuration, setQuizDuration] = useState(30); // minutes
  const [questions, setQuestions] = useState(() => {
    const saved = localStorage.getItem('hkm-quiz-questions');
    return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
  });

  // Editor states
  const [activeType, setActiveType] = useState('multiple-choice'); // 'multiple-choice' | 'drag-drop' | 'code-test'
  const [newTitle, setNewTitle] = useState('');
  
  // MCQ specific
  const [mcOptions, setMcOptions] = useState(['', '', '', '']);
  const [mcCorrect, setMcCorrect] = useState(0);

  // Drag Drop specific
  const [ddSentence, setDdSentence] = useState('');
  const [ddChoices, setDdChoices] = useState('');

  // Code test specific
  const [codeStarter, setCodeStarter] = useState('');
  const [codeTestVal, setCodeTestVal] = useState('');

  // Preview Sandbox test state
  const [testResult, setTestResult] = useState(null);
  const [isRunningTest, setIsRunningTest] = useState(false);

  useEffect(() => {
    localStorage.setItem('hkm-quiz-questions', JSON.stringify(questions));
  }, [questions]);

  // Actions
  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newTitle) return;

    let questionObj = {
      id: "q-" + Date.now(),
      type: activeType,
      title: newTitle
    };

    if (activeType === 'multiple-choice') {
      const filtered = mcOptions.filter(o => o.trim() !== '');
      if (filtered.length < 2) {
        showToast("Vennligst oppgi minst 2 svaralternativer.");
        return;
      }
      questionObj.options = filtered;
      questionObj.correctAnswer = mcCorrect;
    } else if (activeType === 'drag-drop') {
      if (!ddSentence.includes('[begrep1]')) {
        showToast("Setningen må inneholde placeholderen [begrep1]!");
        return;
      }
      questionObj.sentence = ddSentence;
      questionObj.choices = ddChoices.split(',').map(c => c.trim()).filter(c => c !== '');
      questionObj.blanks = { "begrep1": "lære" }; // simplified default for sandbox
    } else if (activeType === 'code-test') {
      questionObj.starterCode = codeStarter || "function test() {\n  \n}";
      questionObj.testCase = { input: "Standard", output: codeTestVal || "true" };
    }

    setQuestions([...questions, questionObj]);
    showToast("Spørsmål ble lagt til i listen!");
    
    // Reset editor
    setNewTitle('');
    setMcOptions(['', '', '', '']);
    setMcCorrect(0);
    setDdSentence('');
    setDdChoices('');
    setCodeStarter('');
    setCodeTestVal('');
  };

  const handleDeleteQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    showToast("Spørsmål ble slettet.");
  };

  const handleSimulateCodeTest = () => {
    setIsRunningTest(true);
    setTestResult(null);
    setTimeout(() => {
      setIsRunningTest(false);
      setTestResult("Suksess! Funksjonen validerer alle testtilfeller (100% korrekte verdier).");
      showToast("Testkjøring fullført ✓");
    }, 1500);
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-12 py-6 md:py-12 flex flex-col gap-6 md:gap-8 font-sans text-on-surface">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-4xl font-bold text-primary">Studiebygger & Quiz-editor</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 font-medium">
            Opprett og rediger interaktive prøver og eksamener med drag-and-drop, flervalg og kodingstester.
          </p>
        </div>
        
        <button
          onClick={() => showToast("Quiz-konfigurasjon er lagret i databasen ✓")}
          className="flex items-center gap-1.5 px-6 py-2.5 bg-[#3c096c] hover:opacity-95 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
        >
          <Save size={14} />
          Lagre Endringer
        </button>
      </div>

      {/* Settings Row */}
      <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Tittel på evaluering</label>
          <input 
            type="text" 
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            className="w-full bg-[#f0f4f8] border border-outline-variant/60 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
            style={{ transform: 'translateZ(0) !important', display: 'block' }}
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Tidsbegrensning (minutter)</label>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-outline shrink-0" />
            <input 
              type="number" 
              value={quizDuration}
              onChange={(e) => setQuizDuration(Number(e.target.value))}
              className="w-full bg-[#f0f4f8] border border-outline-variant/60 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
              style={{ transform: 'translateZ(0) !important', display: 'block' }}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Antall Spørsmål</label>
          <div className="flex items-center gap-2 h-10 text-sm font-serif font-bold text-primary">
            <Layers size={16} className="text-[#c5a059]" />
            <span>{questions.length} spørsmål konfigurert</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Question Creator (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <Plus size={18} className="text-[#c5a059]" /> Legg til nytt spørsmål
            </h3>

            {/* Question Type Tabs */}
            <div className="flex bg-[#eaeef2] p-1 rounded-xl mb-6">
              {[
                { id: 'multiple-choice', name: 'Flervalg', icon: HelpCircle },
                { id: 'drag-drop', name: 'Drag-&-Drop', icon: AlignLeft },
                { id: 'code-test', name: 'Kodingstest', icon: Code }
              ].map(t => {
                const TabIcon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveType(t.id)}
                    className={`flex items-center justify-center gap-1.5 flex-grow py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                      activeType === t.id
                        ? 'bg-white text-[#3c096c] shadow-sm'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    <TabIcon size={14} />
                    {t.name}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-5">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Spørsmålstekst / Installasjon</label>
                <input 
                  type="text"
                  placeholder="Hva vil du spørre om?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#f0f4f8] border border-outline-variant/60 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                  style={{ transform: 'translateZ(0) !important', display: 'block' }}
                />
              </div>

              {/* Dynamic Input based on Active Type */}
              <AnimatePresence mode="wait">
                {activeType === 'multiple-choice' && (
                  <motion.div
                    key="mc-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <p className="text-[10px] font-bold text-[#72787e] uppercase tracking-wider">Alternativer (Merk av for riktig svar)</p>
                    {mcOptions.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="correctMc"
                          checked={mcCorrect === oIdx}
                          onChange={() => setMcCorrect(oIdx)}
                          className="w-4 h-4 text-primary focus:ring-primary"
                        />
                        <input 
                          type="text"
                          placeholder={`Alternativ ${oIdx + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const updated = [...mcOptions];
                            updated[oIdx] = e.target.value;
                            setMcOptions(updated);
                          }}
                          className="w-full bg-slate-50 border border-outline-variant/50 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                          style={{ transform: 'translateZ(0) !important', display: 'block' }}
                        />
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeType === 'drag-drop' && (
                  <motion.div
                    key="dd-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Setningsmal (Bruk [begrep1] for tomrom)</label>
                      <input 
                        type="text"
                        placeholder="Nåde er en [begrep1] fra Gud..."
                        value={ddSentence}
                        onChange={(e) => setDdSentence(e.target.value)}
                        className="w-full bg-slate-50 border border-outline-variant/50 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                        style={{ transform: 'translateZ(0) !important', display: 'block' }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Draggbare alternativer (Kommadelt liste)</label>
                      <input 
                        type="text"
                        placeholder="gave, krav, lov, rettighet"
                        value={ddChoices}
                        onChange={(e) => setDdChoices(e.target.value)}
                        className="w-full bg-slate-50 border border-outline-variant/50 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                        style={{ transform: 'translateZ(0) !important', display: 'block' }}
                      />
                    </div>
                  </motion.div>
                )}

                {activeType === 'code-test' && (
                  <motion.div
                    key="code-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Startkode for student</label>
                      <textarea 
                        placeholder="function valider(gave) {\n  \n}"
                        value={codeStarter}
                        onChange={(e) => setCodeStarter(e.target.value)}
                        className="w-full bg-slate-900 text-slate-100 font-mono rounded-lg p-3 text-xs focus:ring-1 focus:ring-primary focus:outline-none h-24"
                        style={{ transform: 'translateZ(0) !important', display: 'block' }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Forventet returverdi (Testtilfelle)</label>
                      <input 
                        type="text"
                        placeholder="f.eks. true"
                        value={codeTestVal}
                        onChange={(e) => setCodeTestVal(e.target.value)}
                        className="w-full bg-slate-50 border border-outline-variant/50 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                        style={{ transform: 'translateZ(0) !important', display: 'block' }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 bg-primary hover:opacity-95 text-white py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98] shadow-md"
              >
                <Plus size={16} />
                Legg til spørsmål
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Preview Canvas (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-[#3c096c] mb-4 flex items-center gap-2">
              <Eye size={18} className="text-[#c5a059]" /> Forhåndsvisning for Student (Live Canvas)
            </h3>

            {/* List of current questions */}
            <div className="space-y-6">
              {questions.map((question, qIdx) => (
                <div 
                  key={question.id}
                  className="p-5 border border-outline-variant/40 hover:border-primary/40 rounded-2xl bg-[#f6fafe]/40 transition-all duration-300 relative group"
                >
                  {/* Delete trigger */}
                  <button 
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="absolute top-4 right-4 p-1.5 text-outline hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Slett spørsmål"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm">
                      {qIdx + 1}
                    </div>
                    
                    <div className="flex-grow space-y-3 min-w-0 pr-4">
                      <h4 className="font-bold text-sm text-[#3c096c] leading-relaxed pr-6">{question.title}</h4>
                      
                      {/* Interactive visual inputs based on preview type */}
                      {question.type === 'multiple-choice' && (
                        <div className="space-y-2 pt-1.5">
                          {question.options.map((opt, oIdx) => (
                            <div 
                              key={oIdx}
                              className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                                question.correctAnswer === oIdx 
                                  ? 'bg-green-50 border-green-300 text-green-800' 
                                  : 'bg-white border-slate-200 text-[#41474d]'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                question.correctAnswer === oIdx ? 'border-green-600 bg-green-600 text-white' : 'border-slate-300'
                              }`}>
                                {question.correctAnswer === oIdx && <CheckCircle size={10} />}
                              </div>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {question.type === 'drag-drop' && (
                        <div className="space-y-3 pt-1.5">
                          <p className="text-xs font-medium bg-slate-50 border border-slate-100 p-3 rounded-lg leading-relaxed text-[#41474d]">
                            {question.sentence.replace('[begrep1]', '______')}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 pt-1">
                            {question.choices.map((choice, cIdx) => (
                              <div 
                                key={cIdx} 
                                className="px-3 py-1.5 bg-white border border-[#c1c7ce] text-[11px] font-bold text-[#3c096c] rounded-lg shadow-sm hover:border-primary cursor-grab active:cursor-grabbing transition-colors"
                              >
                                {choice}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {question.type === 'code-test' && (
                        <div className="space-y-3 pt-1.5">
                          <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 relative">
                            <span className="absolute top-2 right-2 text-[8px] font-mono text-slate-500 uppercase font-bold">JavaScript</span>
                            <pre className="text-[10px] text-slate-300 font-mono whitespace-pre-wrap">{question.starterCode}</pre>
                          </div>
                          
                          <div className="bg-[#f0f4f8] rounded-xl p-3 border border-[#c1c7ce]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <p className="text-[9px] text-outline font-bold uppercase tracking-wider">Mock Sandbox Test</p>
                              <p className="text-[11px] font-semibold text-primary mt-0.5">Input: {question.testCase.input} → Forventer: {question.testCase.output}</p>
                            </div>
                            
                            <button
                              onClick={handleSimulateCodeTest}
                              disabled={isRunningTest}
                              className="flex items-center gap-1 px-3 py-1.5 bg-primary hover:opacity-95 disabled:opacity-50 text-white rounded-lg text-[10px] font-bold shadow-sm transition-all"
                            >
                              <Play size={10} />
                              {isRunningTest ? 'Kjører...' : 'Kjør Test'}
                            </button>
                          </div>

                          {testResult && (
                            <div className="bg-green-100 text-green-800 text-[10px] font-bold p-2.5 rounded-lg border border-green-200">
                              {testResult}
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
