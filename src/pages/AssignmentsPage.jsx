import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Award, CheckCircle2, 
  AlertCircle, ChevronRight, UploadCloud, Send
} from 'lucide-react';

export default function AssignmentsPage() {
  const navigate = useNavigate();
  const { user, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('pending'); // pending, submitted, graded
  const [selectedId, setSelectedId] = useState('ass-1');
  const [submissionText, setSubmissionText] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulated Assignment Data
  const [assignments, setAssignments] = useState([
    {
      id: 'ass-1',
      title: 'Det profetiske embete i GT vs NT',
      courseCode: 'PROP 101',
      courseName: 'Innføring i den Profetiske Tjeneste',
      dueDate: '2026-06-05',
      dueTime: '23:59',
      status: 'pending', // pending, submitted, graded
      description: 'Skriv et essay på 1500-2000 ord der du drøfter didaktiske og åndelige forskjeller mellom det gammeltestamentlige og det nytestamentlige profetembetet. Gi konkrete bibelske eksempler og diskuter hvordan profetens rolle endrer seg etter pinseedagen.',
      weight: '30% av totalkarakter',
      gradingRubric: [
        { criterion: 'Bibelforståelse & Hermeneutikk', points: 40 },
        { criterion: 'Åndelig refleksjon & karakter', points: 40 },
        { criterion: 'Struktur og formidling', points: 20 }
      ],
      submission: null,
      grade: null,
      feedback: null
    },
    {
      id: 'ass-2',
      title: 'Eksegese av Johannes\' åpenbaring',
      courseCode: 'BIBLE 301',
      courseName: 'Avansert Hermeneutikk og Tolkning',
      dueDate: '2026-06-12',
      dueTime: '12:00',
      status: 'pending',
      description: 'Foreta en grundig eksegetisk analyse av Johannes\' åpenbaring kapittel 5. Utled de eskatologiske typologiene og diskuter lammet som åpner seglene. Alle tolkninger og kildehenvisninger må dokumenteres grundig i PDF-format.',
      weight: '40% av totalkarakter',
      gradingRubric: [
        { criterion: 'Hermeneutisk stringens', points: 50 },
        { criterion: 'Teologisk tolkning', points: 30 },
        { criterion: 'Formatering & ryddighet', points: 20 }
      ],
      submission: null,
      grade: null,
      feedback: null
    },
    {
      id: 'ass-3',
      title: 'Sjelesorgstudie i Mandal',
      courseCode: 'MIN 201',
      courseName: 'Sjelesorg og Menighetsledelse',
      dueDate: '2026-05-18',
      dueTime: '23:59',
      status: 'submitted',
      description: 'Velg tre sjelesorgs-modeller eller case-studier innenfor kristen veiledning og foreta en komparativ analyse. Vurder modellsikkerhet, bibelsk forankring og pastoral relevans.',
      weight: '25% av totalkarakter',
      gradingRubric: [
        { criterion: 'Sjelesorgmodeller', points: 30 },
        { criterion: 'Sjelesorgfaglig evaluering', points: 50 },
        { criterion: 'Referering & Etikk', points: 20 }
      ],
      submission: {
        text: 'Dette essayet sammenligner tre sjelesorgsmodeller i en menighetskontekst med fokus på helbredelse av indre sår...',
        fileName: 'sjelesorg_analyse_knutsen.pdf',
        submittedAt: '2026-05-17 19:42'
      },
      grade: null,
      feedback: null
    },
    {
      id: 'ass-4',
      title: 'Problemstilling & Etablering av bønnesenter',
      courseCode: 'MIN 201',
      courseName: 'Sjelesorg og Menighetsledelse',
      dueDate: '2026-04-20',
      dueTime: '23:59',
      status: 'graded',
      description: 'Utarbeid en strukturert prosjektskisse for etablering av et bønne- og sjelesorgs-senter i Mandal, inkludert åndelig rammeverk og praktisk menighetsledelse.',
      weight: '15% av totalkarakter',
      gradingRubric: [
        { criterion: 'Skissens teologiske dybde', points: 40 },
        { criterion: 'Faglig & pastoral relevans', points: 35 },
        { criterion: 'Formidlingspresisjon', points: 25 }
      ],
      submission: {
        text: 'Jeg ønsker å utarbeide en skisse for et bønnesenter i Mandal menighet med fokus på kontinuerlig forbønn, opplæring i nådegaver, og sjelesorg...',
        fileName: 'prosjektskisse_bønnesenter_v1.pdf',
        submittedAt: '2026-04-18 11:15'
      },
      grade: 'A',
      feedback: 'En fremragende prosjektskisse med et solid teologisk fundament. Veldig godt spisset, og du viser stor åndelig og praktisk modenhet i din tilnærming. Fortsett det utmerkede arbeidet!',
      score: '96/100'
    }
  ]);

  const activeAssignment = assignments.find(a => a.id === selectedId) || assignments[0];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!submissionText.trim() && !uploadedFile) {
      showToast("Vennligst fyll ut besvarelsen eller last opp en fil.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setAssignments(prev => prev.map(ass => {
        if (ass.id === selectedId) {
          return {
            ...ass,
            status: 'submitted',
            submission: {
              text: submissionText,
              fileName: uploadedFile ? uploadedFile.name : 'skriftlig_besvarelse.pdf',
              submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
            }
          };
        }
        return ass;
      }));
      setIsSubmitting(false);
      setSubmissionText('');
      setUploadedFile(null);
      showToast("Oppgave besvart og sendt til vurdering!");
    }, 1000);
  };

  const filteredAssignments = assignments.filter(a => a.status === activeTab);

  return (
    <main className="flex-grow w-full max-w-[1440px] mx-auto px-6 md:px-12 py-12 flex flex-col lg:flex-row gap-8">
      
      {/* Left Side: Master List */}
      <div className="w-full lg:w-5/12 flex flex-col gap-6">
        <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
          <h1 className="font-serif text-2xl font-bold text-primary mb-2">Mine Oppgaver</h1>
          <p className="text-sm text-on-surface-variant mb-6">
            Oversikt over obligatoriske oppgaver, innleveringer og sensur.
          </p>

          {/* Sliding Segmented Control Tabs */}
          <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant mb-6">
            {[
              { id: 'pending', label: 'Utestående' },
              { id: 'submitted', label: 'Innsendt' },
              { id: 'graded', label: 'Vurdert' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  const found = assignments.find(a => a.status === tab.id);
                  if (found) setSelectedId(found.id);
                }}
                className={`flex-1 text-center py-2 text-xs font-bold uppercase tracking-wider rounded transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {filteredAssignments.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 text-center text-on-surface-variant text-sm flex flex-col items-center gap-3"
                >
                  <CheckCircle2 size={36} className="text-secondary/50" />
                  Ingen oppgaver i denne kategorien.
                </motion.div>
              ) : (
                filteredAssignments.map(ass => {
                  const isSelected = ass.id === selectedId;
                  return (
                    <motion.button
                      key={ass.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onClick={() => setSelectedId(ass.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-all duration-200 flex items-center justify-between group active:scale-[0.99] ${
                        isSelected 
                          ? 'bg-primary/5 border-primary shadow-sm' 
                          : 'bg-white border-outline-variant hover:border-primary-container/40 hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-surface-container-highest text-primary">
                            {ass.courseCode}
                          </span>
                          <span className="text-xs text-on-surface-variant font-semibold">
                            {ass.weight}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-primary group-hover:text-primary-container transition-colors">
                          {ass.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                          <Calendar size={12} />
                          <span>Frist: {ass.dueDate}</span>
                        </div>
                      </div>
                      <ChevronRight size={18} className={`text-outline transition-transform duration-200 ${isSelected ? 'translate-x-1 text-primary' : 'group-hover:translate-x-0.5'}`} />
                    </motion.button>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Right Side: Detail Pane */}
      <div className="w-full lg:w-7/12">
        {activeAssignment ? (
          <motion.div 
            key={activeAssignment.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-outline-variant rounded-xl p-5 sm:p-8 shadow-sm flex flex-col gap-6"
          >
            {/* Header Details */}
            <div className="border-b border-outline-variant pb-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-primary text-white rounded-full">
                  {activeAssignment.courseCode} - {activeAssignment.courseName}
                </span>
                {activeAssignment.status === 'pending' && (
                  <span className="text-xs font-semibold px-3 py-1 bg-error-container text-on-error-container rounded-full flex items-center gap-1">
                    <AlertCircle size={12} /> Ikke innlevert
                  </span>
                )}
                {activeAssignment.status === 'submitted' && (
                  <span className="text-xs font-semibold px-3 py-1 bg-secondary-container/50 text-on-secondary-container rounded-full flex items-center gap-1">
                    <Clock size={12} /> Venter på sensur
                  </span>
                )}
                {activeAssignment.status === 'graded' && (
                  <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-800 rounded-full flex items-center gap-1">
                    <Award size={12} /> Karakter: {activeAssignment.grade}
                  </span>
                )}
              </div>

              <h2 className="font-serif text-3xl font-bold text-primary mb-3 leading-tight">
                {activeAssignment.title}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-4">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <Calendar size={16} className="text-primary" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Innleveringsfrist</p>
                    <p className="font-semibold">{activeAssignment.dueDate} kl {activeAssignment.dueTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <Award size={16} className="text-primary" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Vekting</p>
                    <p className="font-semibold">{activeAssignment.weight}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-serif text-lg font-bold text-primary">Oppgavebeskrivelse</h3>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                {activeAssignment.description}
              </p>
            </div>

            {/* Rubric Criteria */}
            <div className="bg-surface-container-low border border-outline-variant p-5 rounded-lg">
              <h4 className="font-serif text-base font-bold text-primary mb-3">Vurderingskriterier</h4>
              <div className="space-y-2">
                {activeAssignment.gradingRubric.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs text-on-surface-variant py-1 border-b border-outline-variant/30 last:border-b-0">
                    <span className="font-medium">{item.criterion}</span>
                    <span className="font-semibold text-primary">{item.points} poeng</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contextual Action (Submit Form / Submission Details) */}
            {activeAssignment.status === 'pending' && (
              <form onSubmit={handleFormSubmit} className="border-t border-outline-variant pt-6 flex flex-col gap-6 form-field-stable">
                <h3 className="font-serif text-lg font-bold text-primary">Din Besvarelse</h3>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline block">Skriftlig besvarelse / Sammendrag</label>
                  <textarea
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Skriv inn sammendraget eller tekstdelen av besvarelsen din her..."
                    rows={5}
                    className="w-full p-4 border border-outline-variant rounded-lg font-sans text-sm focus:outline-none focus:border-primary-container shadow-sm transition-all focus:ring-1 focus:ring-primary-container"
                  />
                </div>

                {/* Dropzone mockup */}
                <div className="border-2 border-dashed border-outline-variant/60 hover:border-primary/50 transition-colors rounded-lg p-6 bg-surface-container-lowest text-center cursor-pointer relative group">
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <UploadCloud size={32} className="text-outline group-hover:text-primary transition-colors" />
                    <span className="text-sm font-semibold text-primary">
                      {uploadedFile ? uploadedFile.name : 'Last opp besvarelsesfil (PDF)'}
                    </span>
                    <span className="text-xs text-outline">
                      Dra og slipp filen her eller klikk for å velge
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-container transition-all active:scale-[0.98] flex items-center justify-center gap-2 w-full md:w-auto md:self-end shadow-md"
                >
                  {isSubmitting ? (
                    'Sender inn...'
                  ) : (
                    <>
                      <Send size={16} /> SEND INN BESVARELSE
                    </>
                  )}
                </button>
              </form>
            )}

            {activeAssignment.status === 'submitted' && (
              <div className="border-t border-outline-variant pt-6 space-y-4">
                <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-secondary" /> Din innlevering er mottatt
                </h3>
                <div className="bg-surface-container-low border border-outline-variant rounded-lg p-5 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-outline">Mottatt:</span>
                    <span className="font-bold">{activeAssignment.submission?.submittedAt}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-3 border-b border-outline-variant/30">
                    <span className="text-outline">Fil:</span>
                    <span className="font-semibold text-primary underline">{activeAssignment.submission?.fileName}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Tekstvedlegg</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed italic bg-white p-3 rounded border border-outline-variant/50">
                      "{activeAssignment.submission?.text || 'Ingen skriftlig tekst oppgitt.'}"
                    </p>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant italic text-center pt-2">
                  Sensur er normalt klar innen 10 virkedager. Du vil motta et varsel når karakter og tilbakemelding er klar.
                </p>
              </div>
            )}

            {activeAssignment.status === 'graded' && (
              <div className="border-t border-outline-variant pt-6 space-y-5">
                <h3 className="font-serif text-lg font-bold text-primary">Vurderingsresultat</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Grade box */}
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">Karakter</span>
                    <span className="text-5xl font-bold font-serif text-primary leading-none mb-2">{activeAssignment.grade}</span>
                    <span className="text-xs font-semibold text-secondary">Poengsum: {activeAssignment.score}</span>
                  </div>

                  {/* Meta box */}
                  <div className="bg-surface-container rounded-lg p-5 flex flex-col justify-between text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-outline">Innlevert:</span>
                      <span className="font-semibold">{activeAssignment.submission?.submittedAt}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-outline-variant/30">
                      <span className="text-outline">Fil:</span>
                      <span className="font-semibold text-primary underline truncate max-w-[150px]">{activeAssignment.submission?.fileName}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-outline">Vurdert av:</span>
                      <span className="font-semibold text-primary">Apostel David Hansen</span>
                    </div>
                  </div>
                </div>

                {/* Feedback comment */}
                <div className="bg-surface-container-low border border-outline-variant rounded-lg p-6 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Faglærers tilbakemelding</p>
                  <p className="text-sm text-on-surface-variant italic leading-relaxed">
                    "{activeAssignment.feedback}"
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="bg-white border border-outline-variant rounded-xl p-12 text-center text-outline shadow-sm">
            Velg en oppgave fra listen for å vise detaljene.
          </div>
        )}
      </div>
    </main>
  );
}
