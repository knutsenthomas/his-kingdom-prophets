import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { db } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, CheckCircle, PlayCircle, ExternalLink, FileText,
  Eye, EyeOff, Maximize2, Minimize2, BookOpen, Edit3, Trash2, Bold, Italic,
  List, Quote, ClipboardCopy, Download, X
} from 'lucide-react';

export default function LessonView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { courses, toggleModuleCompleted, showToast, user, sendAssistantMessage } = useApp();
  
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [hideStudyPlan, setHideStudyPlan] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('write'); // 'write' or 'preview'
  
  const textareaRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  
  // Determine selected course from location state or default to prop101
  const courseId = location.state?.courseId || 'prop101';
  const course = courses?.find(c => c.id === courseId) || courses?.[0];
  
  // Keep track of the active selected module in the lesson reading screen
  const [activeModuleIndex, setActiveModuleIndex] = useState(2); // Default to Module 3
  
  const currentModule = course?.modules?.[activeModuleIndex] || course?.modules?.[0];
 
  const toggleFocusMode = () => {
    const nextFocusMode = !isFocusMode;
    setIsFocusMode(nextFocusMode);
    setHideStudyPlan(nextFocusMode);
    
    // Dispatch event to collapse/expand main layout sidebar
    const eventName = user?.role === 'teacher' ? 'hkm-toggle-teacher-sidebar' : 'hkm-toggle-student-sidebar';
    window.dispatchEvent(new CustomEvent(eventName, { detail: nextFocusMode }));
    
    if (nextFocusMode) {
      showToast("Fokusmodus aktivert! Sidemenyer skjult.");
    } else {
      showToast("Fokusmodus deaktivert.");
    }
  };

  useEffect(() => {
    return () => {
      // Ensure we restore the sidebar when leaving the lesson page
      const eventName = user?.role === 'teacher' ? 'hkm-toggle-teacher-sidebar' : 'hkm-toggle-student-sidebar';
      window.dispatchEvent(new CustomEvent(eventName, { detail: false }));
    };
  }, [user?.role]);

  // Save notes securely to Firestore
  const saveNotesToFirestore = async (val) => {
    if (!user?.uid) return;
    try {
      const noteDocRef = doc(db, "user_notes", `${user.uid}_${courseId}_${currentModule.id}`);
      await setDoc(noteDocRef, {
        text: val,
        userId: user.uid,
        userName: user.name,
        courseId,
        courseTitle: course.title,
        moduleId: currentModule.id,
        moduleTitle: currentModule.title,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error("Klarte ikke lagre notater i Firestore:", err);
    }
  };

  // Load notes from localStorage first, then sync with Firestore cloud
  useEffect(() => {
    const loadNotes = async () => {
      if (!courseId || !currentModule?.id) return;
      
      // 1. Load from localStorage for instant display
      const savedNotes = localStorage.getItem(`hkm-notes-${courseId}-${currentModule.id}`) || "";
      setNotes(savedNotes);
      setActiveTab('write'); // Reset tab

      // 2. Fetch from Firestore for cloud sync if user is logged in
      if (user?.uid) {
        try {
          const noteDocRef = doc(db, "user_notes", `${user.uid}_${courseId}_${currentModule.id}`);
          const noteSnap = await getDoc(noteDocRef);
          if (noteSnap.exists()) {
            const cloudText = noteSnap.data().text || "";
            if (cloudText && cloudText !== savedNotes) {
              setNotes(cloudText);
              localStorage.setItem(`hkm-notes-${courseId}-${currentModule.id}`, cloudText);
            }
          }
        } catch (err) {
          console.error("Klarte ikke hente notater fra Firestore:", err);
        }
      }
    };

    loadNotes();
  }, [courseId, currentModule?.id, user?.uid]);

  // Loading guard placed safely AFTER all hook declarations to comply with React Hook Rules
  if (!course || !currentModule) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-primary font-bold text-sm bg-background min-h-screen">
        <div className="animate-pulse flex items-center gap-2">
          <span>Laster leksjonsmateriale...</span>
        </div>
      </div>
    );
  }

  // Handle note change with autosave debounce to local and firestore
  const handleNotesChange = (e) => {
    const val = e.target.value;
    setNotes(val);
    setIsSaving(true);
    
    // Save to localStorage immediately
    localStorage.setItem(`hkm-notes-${courseId}-${currentModule.id}`, val);
    
    // Debounce cloud Firestore save
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      await saveNotesToFirestore(val);
      setIsSaving(false);
    }, 800);
  };

  // Cursor formatting helper for Rich Text actions
  const insertFormatting = async (syntax) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    
    let replacement = "";
    if (syntax === 'bold') {
      replacement = `**${selected || 'fet tekst'}**`;
    } else if (syntax === 'italic') {
      replacement = `*${selected || 'kursiv tekst'}*`;
    } else if (syntax === 'list') {
      replacement = `\n- ${selected || 'punkt'}`;
    } else if (syntax === 'quote') {
      replacement = `\n> ${selected || 'sitat'}`;
    }

    const newText = text.substring(0, start) + replacement + text.substring(end);
    setNotes(newText);
    localStorage.setItem(`hkm-notes-${courseId}-${currentModule.id}`, newText);
    
    setIsSaving(true);
    await saveNotesToFirestore(newText);
    setIsSaving(false);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
  };

  // Share note to theological AI assistant
  const sendNoteToAssistant = () => {
    if (!notes.trim()) {
      showToast("Ingen notater å sende!");
      return;
    }
    const messageText = `Her er mine notater fra leksjonen "${currentModule.title}" under kurset ${course.title}:\n\n${notes}\n\nKan du gi meg teologisk tilbakemelding på disse notatene?`;
    
    sendAssistantMessage(messageText);
    showToast("Notater sendt til HKM Assistent! Åpne chatten nede til høyre.");
    window.dispatchEvent(new CustomEvent('hkm-open-chat'));
  };

  // Share note to community chat as a message
  const shareNoteToCommunity = () => {
    if (!notes.trim()) {
      showToast("Ingen notater å dele!");
      return;
    }
    
    const shareMessage = `Hei alle sammen! 📖 Her er mine notater fra leksjonen "${currentModule.title}" under kurset *${course.title}*:\n\n"${notes}"\n\nHva tenker dere om disse punktene?`;
    
    // Save to localStorage so CommunityChatView can read it
    localStorage.setItem('hkm-pending-chat-message', shareMessage);
    
    showToast("Notater klargjort! Omdirigerer til bønnefellesskapet...");
    
    setTimeout(() => {
      navigate('/student/chat');
    }, 800);
  };

  // Downloader for Markdown file
  const downloadNotes = () => {
    if (!notes.trim()) {
      showToast("Ingen notater å laste ned!");
      return;
    }
    const blob = new Blob([notes], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Notat-${currentModule.title.replace(/\s+/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Notater lastet ned!");
  };

  // Clipboard copy action
  const copyNotesToClipboard = () => {
    if (!notes.trim()) {
      showToast("Ingen notater å kopiere!");
      return;
    }
    navigator.clipboard.writeText(notes);
    showToast("Notater kopiert til utklippstavlen!");
  };

  // Clear notes with confirmation dialog
  const clearNotes = () => {
    if (window.confirm("Er du sikker på at du vil slette notatene dine for denne leksjonen? Dette kan ikke angres.")) {
      setNotes("");
      localStorage.removeItem(`hkm-notes-${courseId}-${currentModule.id}`);
      showToast("Notater slettet.");
    }
  };

  // Safe client-side markdown to html parser
  const parseMarkdown = (text) => {
    if (!text.trim()) return '<p class="text-outline italic text-xs py-4 text-center">Ingen notater skrevet ennå... Begynn å skrive i "Skriv" fanen!</p>';
    
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
      
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/^&gt;\s+(.*?)$/gm, '<blockquote class="border-l-4 border-[#1B4965] pl-4 py-1.5 my-3 italic text-on-surface-variant bg-slate-50 rounded-r">$1</blockquote>');
    html = html.replace(/^-\s+(.*?)$/gm, '<li class="ml-5 list-disc my-1">$1</li>');
    html = html.replace(/\n/g, '<br />');
    
    return `<div class="font-sans text-xs space-y-2 leading-relaxed text-on-surface p-1">${html}</div>`;
  };

  const handleToggleModule = (modId, e) => {
    e.stopPropagation(); // Avoid selecting module when clicking checkbox
    toggleModuleCompleted(course.id, modId);
    showToast("Kursfremgang oppdatert!");
  };

  const handleNextModule = () => {
    if (activeModuleIndex < course.modules.length - 1) {
      setActiveModuleIndex(prev => prev + 1);
    } else {
      showToast("Du har nådd slutten av dette kurset!");
    }
  };

  const handlePrevModule = () => {
    if (activeModuleIndex > 0) {
      setActiveModuleIndex(prev => prev - 1);
    }
  };

  // Simulated high-fidelity content for active modules
  const getModuleText = (title) => {
    if (course.id === 'prop101') {
      return (
        <div className="font-serif space-y-6 text-on-surface leading-relaxed text-base md:text-lg">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-4">{title}</h2>
          <p>
            Velkommen til denne modulen i profetisk utrustning. I dette kapittelet skal vi ta for oss det bibelske og teologiske grunnlaget for den profetiske tjenesten. Åndelig skjelneevne og det å høre Guds stemme handler ikke om egne prestasjoner, men om et nært og levende fellesskap med Den Hellige Ånd.
          </p>
          <blockquote className="border-l-4 border-primary pl-6 py-2 my-8 italic text-on-surface-variant bg-surface-container-low/50 rounded-r-lg">
            "Men den som taler profetisk, taler for mennesker, til oppbyggelse, formaning og trøst." — 1. Korinterbrev 14:3
          </blockquote>
          <p>
            Gjennom de kommende avsnittene vil vi utforske profetiens tre kjerneområder: oppbyggelse, formaning (oppmuntring til helliggjørelse) og trøst. Som profetisk student er det avgjørende at du lar kjærligheten være drivkraften i all din betjening.
          </p>
          <h3 className="font-serif text-xl font-bold text-primary pt-4">Den profetiske karakteren og sunn etikk</h3>
          <p>
            Uten en solid karakter vil enhver profetisk gave før eller siden lide skipbrudd. We må tillate at Guds ord ransaker våre hjerter, slik at vi formidler Hans budskap rent og uten personlige motiver eller manipulasjon.
          </p>
          <div className="my-8 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 font-sans space-y-3">
            <p className="text-xs font-bold text-primary uppercase tracking-wide">Praktisk oppgave for uken</p>
            <p className="text-xs text-on-surface-variant">
              Reflekter over en situasjon der du opplevde å motta et inntrykk eller ord fra Herren. Hvordan testet du dette ordet mot skriften, og hva ble frukten av det? Skriv 300-500 ord.
            </p>
            <button 
              onClick={() => navigate('/student/assignments')}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-container transition-all active:scale-95"
            >
              Gå til innlevering
            </button>
          </div>
        </div>
      );
    } else if (course.id === 'bible301') {
      return (
        <div className="font-serif space-y-6 text-on-surface leading-relaxed text-base md:text-lg">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-4">{title}</h2>
          <p>
            Velkommen til denne avanserte modulen i bibelsk hermeneutikk. I dette kapittelet fokuserer vi på historisk-grammatisk eksegese og tolkning. Å tolke Bibelen krever at vi forstår teksten i dens opprinnelige historiske, kulturelle og litterære kontekst før vi anvender den på vår egen tid.
          </p>
          <blockquote className="border-l-4 border-primary pl-6 py-2 my-8 italic text-on-surface-variant bg-surface-container-low/50 rounded-r-lg">
            "Gjør ditt ytterste for å stå din prøve overfor Gud, som en arbeider som ikke har noe å skamme seg over, en som deler sannhetens ord på rett vis." — 2. Timoteusbrev 2:15
          </blockquote>
          <p>
            Gjennom disse studiene skal vi se på de store paktlinjene som spenner fra Genesis to Johannes' åpenbaring. Ved å forstå paktsteologien vil du oppdage hvordan Det Gamle og Det Nye Testamente henger uløselig sammen og peker frem mot Kristus.
          </p>
          <h3 className="font-serif text-xl font-bold text-primary pt-4">Hermeneutikkens gyldne regel</h3>
          <p>
            En tekst kan aldri bety noe i dag som den aldri kunne bety for sin opprinnelige forfatter og sine opprinnelige lesere. Vi må unngå å lese våre egne moderne fordommer og idéer inn i de hellige skrifter (eisegetikk), og i stedet trekke betydningen ut av teksten (eksegese).
          </p>
          <div className="my-8 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 font-sans space-y-3">
            <p className="text-xs font-bold text-primary uppercase tracking-wide">Praktisk oppgave for uken</p>
            <p className="text-xs text-on-surface-variant">
              Velg en profetisk passasje fra Det Gamle Testamente (f.eks. Jesaja 53 eller Daniel 7) og utfør en kort historisk-grammatisk eksegese basert på de hermeneutiske verktøyene du har lært. Skriv 400-600 ord.
            </p>
            <button 
              onClick={() => navigate('/student/assignments')}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-container transition-all active:scale-95"
            >
              Gå til innlevering
            </button>
          </div>
        </div>
      );
    } else { // min201
      return (
        <div className="font-serif space-y-6 text-on-surface leading-relaxed text-base md:text-lg">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-4">{title}</h2>
          <p>
            Velkommen til denne modulen om sjelesorg og indre helbredelse. I dette kapittelet utforsker vi sjelesorgens bibelske fundament og den åndelige veiledningens dynamikk. Vårt kall som menighetsledere er å møte brutte mennesker med Kristi kjærlighet og lede dem inn i åndelig og emosjonell frihet.
          </p>
          <blockquote className="border-l-4 border-primary pl-6 py-2 my-8 italic text-on-surface-variant bg-surface-container-low/50 rounded-r-lg">
            "Herrens Ånd er over meg, for han har salvet meg til å forkynne et godt budskap for fattige. Han har sendt meg for å rope ut at fanger skal få frihet og blinde få synet igjen, for å sette undertrykte i frihet..." — Lukas 4:18
          </blockquote>
          <p>
            Gjennom undervisningen vil vi lære hvordan vi kombinerer sunn bibelsk sjelesorg med en dyp avhengighet av Den Hellige Ånds åpenbaring og gaver (f.eks. kunnskapsord og visdomsord) for å identifisere og lege indre sår, utilgivelse og åndelige bindinger.
          </p>
          <h3 className="font-serif text-xl font-bold text-primary pt-4">Pastoral etikk og konfidensialitet</h3>
          <p>
            Taushetsplikten og den pastorale etikken er absolutte hjørnesteiner i all sjelesorg. Som sjelesørger må du skape et trygt rom preget av fullstendig konfidensialitet, dyp empati og uforbeholden nåde.
          </p>
          <div className="my-8 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 font-sans space-y-3">
            <p className="text-xs font-bold text-primary uppercase tracking-wide">Praktisk oppgave for uken</p>
            <p className="text-xs text-on-surface-variant">
              Analyser et case-studie om sjelesorg og indre helbredelse. Skisser en veiledningsplan som kombinerer skriftbaserte prinsipper med sensitivitet for Den Hellige Ånds ledelse. Skriv 300-500 ord.
            </p>
            <button 
              onClick={() => navigate('/student/assignments')}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-container transition-all active:scale-95"
            >
              Gå til innlevering
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-1 w-full max-w-[1440px] mx-auto items-start">
      
      {/* Lesson Modules Sidebar */}
      <aside 
        className={`bg-white border-r border-outline-variant/20 h-[calc(100vh-80px)] sticky top-20 hidden md:flex flex-col py-8 px-6 overflow-y-auto shrink-0 transition-all duration-300 ease-in-out ${
          hideStudyPlan 
            ? 'md:w-0 md:opacity-0 md:p-0 md:border-r-0 overflow-hidden' 
            : 'md:w-80 md:opacity-100'
        }`}
      >
        <div className="space-y-6">
          <button 
            onClick={() => navigate('/student/library')} 
            className="flex items-center gap-2 text-xs font-bold text-primary hover:underline uppercase tracking-wide"
          >
            <ArrowLeft size={14} />
            <span>Tilbake til biblioteket</span>
          </button>

          <div>
            <span className="bg-primary/5 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
              {course.code}
            </span>
            <h2 className="font-serif font-bold text-primary text-lg mt-3">{course.title}</h2>
            <p className="text-xs text-outline font-medium mt-1">Av {course.instructor}</p>
          </div>

          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full transition-all duration-300" style={{ width: `${course.progress}%` }}></div>
          </div>
          <p className="text-[10px] text-outline font-bold uppercase tracking-wider">{course.progress}% FULLFØRT ({course.modulesCompleted} av {course.totalModules} moduler)</p>

          <nav className="space-y-1.5 pt-4 border-t border-slate-100">
            {course.modules.map((mod, index) => (
              <div
                key={mod.id}
                onClick={() => setActiveModuleIndex(index)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-lg text-xs transition-all cursor-pointer ${
                  activeModuleIndex === index 
                    ? 'bg-primary/5 border border-primary/20 text-primary font-bold shadow-sm' 
                    : 'hover:bg-slate-50 text-on-surface-variant border border-transparent'
                }`}
              >
                <span className="line-clamp-2 pr-2">{mod.title}</span>
                <button 
                  onClick={(e) => handleToggleModule(mod.id, e)}
                  className="shrink-0"
                  title={mod.completed ? "Marker som ufullført" : "Marker som fullført"}
                >
                  <CheckCircle 
                    size={16} 
                    className={`transition-all ${
                      mod.completed 
                        ? 'fill-primary text-white font-bold' 
                        : 'text-outline/40 hover:text-primary/60'
                    }`} 
                  />
                </button>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Lesson Reading Panel */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 lg:p-12 overflow-x-hidden">
        <div className="max-w-[760px] mx-auto space-y-8">
          
          {/* Immersive View Controls Bar */}
          <div className="flex items-center justify-between bg-white border border-outline-variant/30 px-5 py-3 rounded-xl shadow-sm text-xs font-bold text-primary">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-primary animate-pulse" />
              <span className="font-sans uppercase tracking-wider text-[10px]">Visningsmodus</span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Individual study plan toggle */}
              <button
                onClick={() => {
                  const nextHide = !hideStudyPlan;
                  setHideStudyPlan(nextHide);
                  showToast(nextHide ? "Studieplan skjult" : "Studieplan vist");
                  // If we manually show study plan, we exit Focus Mode
                  if (!nextHide) {
                    setIsFocusMode(false);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all active:scale-[0.97] font-sans ${
                  hideStudyPlan 
                    ? 'bg-primary/5 border-primary/20 text-primary font-bold shadow-sm' 
                    : 'bg-white border-outline-variant/30 text-on-surface hover:bg-slate-50'
                }`}
                title={hideStudyPlan ? "Vis studieplan" : "Skjul studieplan"}
              >
                {hideStudyPlan ? <Eye size={14} /> : <EyeOff size={14} />}
                <span>{hideStudyPlan ? "Vis studieplan" : "Skjul studieplan"}</span>
              </button>

              {/* Notes Panel toggle */}
              <button
                onClick={() => {
                  setIsNotesOpen(!isNotesOpen);
                  showToast(isNotesOpen ? "Notater lukket" : "Notatfelt åpnet");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all active:scale-[0.97] font-sans ${
                  isNotesOpen 
                    ? 'bg-[#1B4965] border-[#1B4965] text-white font-bold shadow-sm animate-fade-in' 
                    : 'bg-white border-outline-variant/30 text-on-surface hover:bg-slate-50'
                }`}
                title={isNotesOpen ? "Lukk notater" : "Åpne notatfelt"}
              >
                <Edit3 size={14} />
                <span>Notater</span>
              </button>

              {/* Fullscreen Focus Mode toggle */}
              <button
                onClick={toggleFocusMode}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all active:scale-[0.97] font-sans ${
                  isFocusMode 
                    ? 'bg-burnt-orange/10 border-burnt-orange/20 text-burnt-orange font-bold shadow-sm animate-pulse' 
                    : 'bg-white border-outline-variant/30 text-on-surface hover:bg-slate-50'
                }`}
                title={isFocusMode ? "Avslutt fullskjerm" : "Aktiver fullskjerm"}
              >
                {isFocusMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                <span>{isFocusMode ? "Avslutt fullskjerm" : "Fullskjerm (Fokusmodus)"}</span>
              </button>
            </div>
          </div>
          
          {/* Top course info card */}
          <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileText className="text-primary shrink-0" size={24} />
              <div>
                <h4 className="text-xs font-bold text-primary uppercase tracking-wide">Gjeldende leksjon</h4>
                <p className="text-sm font-semibold text-on-surface mt-0.5">{currentModule.title}</p>
              </div>
            </div>

            {/* Zoom Join Card */}
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg border border-outline-variant/30 text-xs font-bold text-primary">
              <PlayCircle className="text-burnt-orange" size={16} />
              <span>Neste live-samling: {course.code} Live</span>
              <a 
                href={course.zoomLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-burnt-orange pl-2 border-l border-slate-100 hover:underline flex items-center gap-0.5"
              >
                Bli med <ExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* Main scholarly text */}
          <motion.div 
            key={currentModule.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border border-outline-variant/20 shadow-sm p-5 sm:p-8 md:p-12 rounded-xl sm:rounded-2xl"
          >
            {getModuleText(currentModule.title)}
          </motion.div>

          {/* Stepper Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-100 text-xs font-bold">
            <button 
              onClick={handlePrevModule}
              disabled={activeModuleIndex === 0}
              className="flex items-center gap-1.5 px-5 py-3 border border-outline-variant/30 rounded-lg bg-white text-on-surface hover:bg-slate-50 disabled:opacity-40"
            >
              <ArrowLeft size={14} />
              <span>Forrige modul</span>
            </button>

            <button 
              onClick={handleNextModule}
              className="flex items-center gap-1.5 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-container shadow"
            >
              <span>Neste modul</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </div>
      </main>

      {/* Right Side Notes Drawer */}
      <aside 
        className={`bg-white border-l border-outline-variant/20 h-[calc(100vh-80px)] sticky top-20 flex flex-col py-6 px-5 overflow-y-auto shrink-0 transition-all duration-300 ease-in-out z-30 ${
          isNotesOpen 
            ? 'w-full md:w-96 opacity-100 p-6' 
            : 'w-0 opacity-0 pointer-events-none border-l-0 p-0 overflow-hidden'
        }`}
      >
        <div className="flex flex-col h-full space-y-4 min-w-0">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30 shrink-0">
            <div>
              <h3 className="font-serif font-bold text-primary text-base flex items-center gap-1.5">
                <Edit3 size={16} className="text-burnt-orange shrink-0" />
                <span>Mine Notater</span>
              </h3>
              <p className="text-[10px] text-outline font-medium truncate max-w-[200px] mt-0.5">Leksjon: {currentModule.title}</p>
            </div>
            
            <button 
              onClick={() => setIsNotesOpen(false)}
              className="p-1 hover:bg-surface-container rounded-lg text-primary transition-colors shrink-0"
              title="Lukk notater"
            >
              <X size={18} />
            </button>
          </div>

          {/* Autosave and Info */}
          <div className="flex items-center justify-between text-[10px] shrink-0 font-medium">
            <div className="flex items-center gap-1.5 text-on-surface-variant">
              <span className={`w-2 h-2 rounded-full ${isSaving ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></span>
              <span>{isSaving ? 'Lagrer notater...' : 'Autolagret i nettleser'}</span>
            </div>
            <span className="text-outline font-bold uppercase tracking-wider">{notes.trim().split(/\s+/).filter(Boolean).length} ord</span>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-outline-variant/20 text-xs font-bold shrink-0">
            <button
              onClick={() => setActiveTab('write')}
              className={`flex-1 py-2 text-center border-b-2 transition-all ${
                activeTab === 'write' 
                  ? 'border-[#1B4965] text-[#1B4965] font-bold' 
                  : 'border-transparent text-outline hover:text-[#1B4965]'
              }`}
            >
              Skriv
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-2 text-center border-b-2 transition-all ${
                activeTab === 'preview' 
                  ? 'border-[#1B4965] text-[#1B4965] font-bold' 
                  : 'border-transparent text-outline hover:text-[#1B4965]'
              }`}
            >
              Forhåndsvisning
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 flex flex-col min-h-0 min-w-0">
            {activeTab === 'write' ? (
              <div className="flex flex-col flex-1 min-h-0 min-w-0 space-y-2">
                {/* Toolbar */}
                <div className="flex items-center gap-1 bg-surface-container-low p-1.5 rounded-lg border border-outline-variant/20 shrink-0">
                  <button
                    onClick={() => insertFormatting('bold')}
                    className="p-1 hover:bg-white rounded hover:shadow-xs text-primary font-bold font-serif text-xs min-w-6"
                    title="Fet skrift"
                  >
                    B
                  </button>
                  <button
                    onClick={() => insertFormatting('italic')}
                    className="p-1 hover:bg-white rounded hover:shadow-xs text-primary italic font-serif text-xs min-w-6"
                    title="Kursiv"
                  >
                    I
                  </button>
                  <button
                    onClick={() => insertFormatting('list')}
                    className="p-1 hover:bg-white rounded hover:shadow-xs text-primary flex justify-center min-w-6"
                    title="Punktliste"
                  >
                    <List size={14} />
                  </button>
                  <button
                    onClick={() => insertFormatting('quote')}
                    className="p-1 hover:bg-white rounded hover:shadow-xs text-primary flex justify-center min-w-6"
                    title="Sitatblokk"
                  >
                    <Quote size={14} />
                  </button>
                  
                  <div className="flex-grow"></div>
                  
                  <button
                    onClick={clearNotes}
                    className="p-1 hover:bg-red-50 text-red-500 hover:text-red-600 rounded flex justify-center min-w-6 transition-colors"
                    title="Tøm alle notater"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Skriv dine leksjonsnotater her... Støtter markdown formatting (**fet**, *kursiv*, - punkter og > sitater)."
                  className="w-full flex-1 p-3 rounded-xl border border-outline-variant/30 shadow-xs focus:border-primary focus:ring-1 focus:ring-primary/20 text-xs font-sans leading-relaxed outline-none resize-none bg-surface-container-lowest/30"
                />
              </div>
            ) : (
              <div 
                className="w-full flex-1 p-3 rounded-xl border border-outline-variant/20 bg-surface-container-lowest/10 overflow-y-auto min-h-0 min-w-0"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(notes) }}
              />
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col gap-2 shrink-0 pt-3 border-t border-outline-variant/20 text-xs font-bold font-sans">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={copyNotesToClipboard}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 border border-outline-variant/30 rounded-lg bg-white text-on-surface hover:bg-slate-50 transition-all active:scale-[0.97]"
                title="Kopier til utklippstavle"
              >
                <ClipboardCopy size={12} />
                <span>Kopier</span>
              </button>
              <button
                onClick={downloadNotes}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-primary text-white rounded-lg hover:bg-primary-container transition-all active:scale-[0.97]"
                title="Last ned som markdown-fil"
              >
                <Download size={12} />
                <span>Last ned (.md)</span>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={sendNoteToAssistant}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 border border-primary/20 bg-primary/5 text-primary rounded-lg hover:bg-primary/10 transition-all active:scale-[0.97]"
                title="Send notat til HKM Assistent"
              >
                <MessageSquare size={12} className="text-burnt-orange" />
                <span>Send til HKM</span>
              </button>
              <button
                onClick={shareNoteToCommunity}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 border border-[#bd4f2a]/20 bg-[#bd4f2a]/5 text-[#bd4f2a] rounded-lg hover:bg-[#bd4f2a]/10 transition-all active:scale-[0.97]"
                title="Del notat i bønnefellesskapet"
              >
                <Send size={12} />
                <span>Del i fellesskap</span>
              </button>
            </div>
          </div>

        </div>
      </aside>
    </div>
  );
}
