import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { db } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { 
  ArrowLeft, ArrowRight, CheckCircle, PlayCircle, ExternalLink, FileText,
  Eye, EyeOff, Maximize2, Minimize2, BookOpen, Edit3, Trash2, Bold, Italic,
  List, Quote, ClipboardCopy, Download, X, MessageSquare, Send, Book, Check, Sparkles, RefreshCw, Search
} from 'lucide-react';

const BIBLE_BOOKS = [
  { id: 'gen', nor: '1. Mosebok', eng: 'Genesis', chapters: 50, testament: 'GT' },
  { id: 'exo', nor: '2. Mosebok', eng: 'Exodus', chapters: 40, testament: 'GT' },
  { id: 'lev', nor: '3. Mosebok', eng: 'Leviticus', chapters: 27, testament: 'GT' },
  { id: 'num', nor: '4. Mosebok', eng: 'Numbers', chapters: 36, testament: 'GT' },
  { id: 'deu', nor: '5. Mosebok', eng: 'Deuteronomy', chapters: 34, testament: 'GT' },
  { id: 'jos', nor: 'Josva', eng: 'Joshua', chapters: 24, testament: 'GT' },
  { id: 'jdg', nor: 'Dommerne', eng: 'Judges', chapters: 21, testament: 'GT' },
  { id: 'rut', nor: 'Rut', eng: 'Ruth', chapters: 4, testament: 'GT' },
  { id: '1sa', nor: '1. Samuelsbok', eng: '1 Samuel', chapters: 31, testament: 'GT' },
  { id: '2sa', nor: '2. Samuelsbok', eng: '2 Samuel', chapters: 24, testament: 'GT' },
  { id: '1ki', nor: '1. Kongebok', eng: '1 Kings', chapters: 22, testament: 'GT' },
  { id: '2ki', nor: '2. Kongebok', eng: '2 Kings', chapters: 25, testament: 'GT' },
  { id: '1ch', nor: '1. Krønikerbok', eng: '1 Chronicles', chapters: 29, testament: 'GT' },
  { id: '2ch', nor: '2. Krønikerbok', eng: '2 Chronicles', chapters: 36, testament: 'GT' },
  { id: 'ezr', nor: 'Esra', eng: 'Ezra', chapters: 10, testament: 'GT' },
  { id: 'neh', nor: 'Nehemia', eng: 'Nehemiah', chapters: 13, testament: 'GT' },
  { id: 'est', nor: 'Ester', eng: 'Esther', chapters: 10, testament: 'GT' },
  { id: 'job', nor: 'Job', eng: 'Job', chapters: 42, testament: 'GT' },
  { id: 'psa', nor: 'Salmene', eng: 'Psalms', chapters: 150, testament: 'GT' },
  { id: 'pro', nor: 'Ordspråkene', eng: 'Proverbs', chapters: 31, testament: 'GT' },
  { id: 'ecc', nor: 'Forkynneren', eng: 'Ecclesiastes', chapters: 12, testament: 'GT' },
  { id: 'sng', nor: 'Høysangen', eng: 'Song of Solomon', chapters: 8, testament: 'GT' },
  { id: 'isa', nor: 'Jesaja', eng: 'Isaiah', chapters: 66, testament: 'GT' },
  { id: 'jer', nor: 'Jeremia', eng: 'Jeremiah', chapters: 52, testament: 'GT' },
  { id: 'lam', nor: 'Klagesangene', eng: 'Lamentations', chapters: 5, testament: 'GT' },
  { id: 'eze', nor: 'Esekiel', eng: 'Ezekiel', chapters: 48, testament: 'GT' },
  { id: 'dan', nor: 'Daniel', eng: 'Daniel', chapters: 12, testament: 'GT' },
  { id: 'hos', nor: 'Hosea', eng: 'Hosea', chapters: 14, testament: 'GT' },
  { id: 'joe', nor: 'Joel', eng: 'Joel', chapters: 3, testament: 'GT' },
  { id: 'amo', nor: 'Amos', eng: 'Amos', chapters: 9, testament: 'GT' },
  { id: 'oba', nor: 'Obadja', eng: 'Obadiah', chapters: 1, testament: 'GT' },
  { id: 'jon', nor: 'Jona', eng: 'Jonah', chapters: 4, testament: 'GT' },
  { id: 'mic', nor: 'Mika', eng: 'Micah', chapters: 7, testament: 'GT' },
  { id: 'nam', nor: 'Nahum', eng: 'Nahum', chapters: 3, testament: 'GT' },
  { id: 'hab', nor: 'Habakkuk', eng: 'Habakkuk', chapters: 3, testament: 'GT' },
  { id: 'zep', nor: 'Sefanja', eng: 'Zephaniah', chapters: 3, testament: 'GT' },
  { id: 'hag', nor: 'Haggai', eng: 'Haggai', chapters: 2, testament: 'GT' },
  { id: 'zec', nor: 'Sakarja', eng: 'Zechariah', chapters: 14, testament: 'GT' },
  { id: 'mal', nor: 'Malaki', eng: 'Malachi', chapters: 4, testament: 'GT' },
  { id: 'mat', nor: 'Matteus', eng: 'Matthew', chapters: 28, testament: 'NT' },
  { id: 'mrk', nor: 'Markus', eng: 'Mark', chapters: 16, testament: 'NT' },
  { id: 'luk', nor: 'Lukas', eng: 'Luke', chapters: 24, testament: 'NT' },
  { id: 'joh', nor: 'Johannes', eng: 'John', chapters: 21, testament: 'NT' },
  { id: 'act', nor: 'Apostlenes gjerninger', eng: 'Acts', chapters: 28, testament: 'NT' },
  { id: 'rom', nor: 'Romerne', eng: 'Romans', chapters: 16, testament: 'NT' },
  { id: '1co', nor: '1. Korinter', eng: '1 Corinthians', chapters: 16, testament: 'NT' },
  { id: '2co', nor: '2. Korinter', eng: '2 Corinthians', chapters: 13, testament: 'NT' },
  { id: 'gal', nor: 'Galaterne', eng: 'Galatians', chapters: 6, testament: 'NT' },
  { id: 'eph', nor: 'Efeserne', eng: 'Ephesians', chapters: 6, testament: 'NT' },
  { id: 'php', nor: 'Filipperne', eng: 'Philippians', chapters: 4, testament: 'NT' },
  { id: 'col', nor: 'Kolosserne', eng: 'Colossians', chapters: 4, testament: 'NT' },
  { id: '1th', nor: '1. Tessaloniker', eng: '1 Thessalonians', chapters: 5, testament: 'NT' },
  { id: '2th', nor: '2. Tessaloniker', eng: '2 Thessalonians', chapters: 3, testament: 'NT' },
  { id: '1ti', nor: '1. Timoteus', eng: '1 Timothy', chapters: 6, testament: 'NT' },
  { id: '2ti', nor: '2. Timoteus', eng: '2 Timothy', chapters: 4, testament: 'NT' },
  { id: 'tit', nor: 'Titus', eng: 'Titus', chapters: 3, testament: 'NT' },
  { id: 'phm', nor: 'Filemon', eng: 'Philemon', chapters: 1, testament: 'NT' },
  { id: 'heb', nor: 'Hebreerne', eng: 'Hebrews', chapters: 13, testament: 'NT' },
  { id: 'jas', nor: 'Jakob', eng: 'James', chapters: 5, testament: 'NT' },
  { id: '1pe', nor: '1. Peter', eng: '1 Peter', chapters: 5, testament: 'NT' },
  { id: '2pe', nor: '2. Peter', eng: '2 Peter', chapters: 3, testament: 'NT' },
  { id: '1jo', nor: '1. Johannes', eng: '1 John', chapters: 5, testament: 'NT' },
  { id: '2jo', nor: '2. Johannes', eng: '2 John', chapters: 1, testament: 'NT' },
  { id: '3jo', nor: '3. Johannes', eng: '3 John', chapters: 1, testament: 'NT' },
  { id: 'jud', nor: 'Judas', eng: 'Jude', chapters: 1, testament: 'NT' },
  { id: 'rev', nor: 'Åpenbaringen', eng: 'Revelation', chapters: 22, testament: 'NT' },
];

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
  
  // Bible Drawer State Integration
  const [sidebarTab, setSidebarTab] = useState('notes'); // 'notes' or 'bible'
  const [selectedBibleBook, setSelectedBibleBook] = useState(BIBLE_BOOKS.find(b => b.id === 'joh')); // Johannes default
  const [selectedBibleChapter, setSelectedBibleChapter] = useState(3);
  const [selectedBibleTranslation, setSelectedBibleTranslation] = useState('bibelselskap');
  const [bibleSearchQuery, setBibleSearchQuery] = useState('');
  const [bibleVerses, setBibleVerses] = useState([]);
  const [isBibleLoading, setIsBibleLoading] = useState(false);
  
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

  useEffect(() => {
    if (isNotesOpen && sidebarTab === 'bible') {
      fetchBibleChapter();
    }
  }, [selectedBibleBook, selectedBibleChapter, selectedBibleTranslation, sidebarTab, isNotesOpen]);

  const fetchBibleChapter = async () => {
    setIsBibleLoading(true);
    setBibleVerses([]);
    try {
      const refString = `${selectedBibleBook.eng} ${selectedBibleChapter}`;
      const url = `https://query.getbible.net/v2/${selectedBibleTranslation}/${encodeURIComponent(refString)}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const keys = Object.keys(data);
        if (keys.length > 0) {
          setBibleVerses(data[keys[0]].verses || []);
        }
      }
    } catch (err) {
      console.error("Klarte ikke hente bibelkapittel i verktøyet:", err);
    } finally {
      setIsBibleLoading(false);
    }
  };

  const handleBibleSearch = async (e) => {
    e.preventDefault();
    if (!bibleSearchQuery.trim()) return;
    setIsBibleLoading(true);
    setBibleVerses([]);
    try {
      let cleanQuery = bibleSearchQuery.trim();
      BIBLE_BOOKS.forEach(book => {
        const norLower = book.nor.toLowerCase();
        const queryLower = cleanQuery.toLowerCase();
        if (queryLower.startsWith(norLower)) {
          cleanQuery = cleanQuery.replace(new RegExp(book.nor, 'i'), book.eng);
        }
      });
      const url = `https://query.getbible.net/v2/${selectedBibleTranslation}/${encodeURIComponent(cleanQuery)}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const keys = Object.keys(data);
        if (keys.length > 0) {
          const resultVerses = [];
          let detectedBook = null;
          let detectedChapter = 1;
          keys.forEach(key => {
            const item = data[key];
            if (item.verses) resultVerses.push(...item.verses);
            if (!detectedBook && item.book_name) {
              const found = BIBLE_BOOKS.find(b => b.eng.toLowerCase() === item.book_name.toLowerCase() || b.nor.toLowerCase() === item.book_name.toLowerCase());
              if (found) {
                detectedBook = found;
                detectedChapter = item.chapter || 1;
              }
            }
          });
          if (resultVerses.length > 0) {
            setBibleVerses(resultVerses);
            if (detectedBook) {
              setSelectedBibleBook(detectedBook);
              setSelectedBibleChapter(detectedChapter);
            }
            showToast("Bibel-søk fullført!");
          } else {
            showToast("Ingen vers funnet.");
          }
        } else {
          showToast("Fant ikke skriftstedet.");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Søket feilet. Prøv f.eks. 'Joh 3:16'");
    } finally {
      setIsBibleLoading(false);
    }
  };

  const insertVerseToNotes = (verse) => {
    const verseRef = `\n> *"${verse.text.trim()}"* — **${selectedBibleBook.nor} ${verse.chapter}:${verse.verse}** (${selectedBibleTranslation === 'bibelselskap' ? 'N11' : selectedBibleTranslation.toUpperCase()})\n\n`;
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = notes.substring(0, start) + verseRef + notes.substring(end);
      setNotes(newText);
      localStorage.setItem(`hkm-notes-${courseId}-${currentModule.id}`, newText);
      saveNotesToFirestore(newText);
    } else {
      const newText = notes + verseRef;
      setNotes(newText);
      localStorage.setItem(`hkm-notes-${courseId}-${currentModule.id}`, newText);
      saveNotesToFirestore(newText);
    }
    showToast("Skriftsted limt inn i dine notater!");
    setSidebarTab('notes');
  };

  if (!course || !currentModule) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-primary font-bold text-sm bg-background min-h-screen">
        <div className="animate-pulse flex items-center gap-2">
          <span>Laster leksjonsmateriale...</span>
        </div>
      </div>
    );
  }

  const handleNotesChange = (e) => {
    const val = e.target.value;
    setNotes(val);
    setIsSaving(true);
    localStorage.setItem(`hkm-notes-${courseId}-${currentModule.id}`, val);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      await saveNotesToFirestore(val);
      setIsSaving(false);
    }, 800);
  };

  const insertFormatting = async (syntax) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    let replacement = "";
    if (syntax === 'bold') replacement = `**${selected || 'fet tekst'}**`;
    else if (syntax === 'italic') replacement = `*${selected || 'kursiv tekst'}*`;
    else if (syntax === 'list') replacement = `\n- ${selected || 'punkt'}`;
    else if (syntax === 'quote') replacement = `\n> ${selected || 'sitat'}`;
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

  const shareNoteToCommunity = () => {
    if (!notes.trim()) {
      showToast("Ingen notater å dele!");
      return;
    }
    const shareMessage = `Hei alle sammen! 📖 Her er mine notater fra leksjonen "${currentModule.title}" under kurset *${course.title}*:\n\n"${notes}"\n\nHva tenker dere om disse punktene?`;
    localStorage.setItem('hkm-pending-chat-message', shareMessage);
    showToast("Notater klargjort! Omdirigerer til bønnefellesskapet...");
    setTimeout(() => {
      navigate('/student/chat');
    }, 800);
  };

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

  const copyNotesToClipboard = () => {
    if (!notes.trim()) {
      showToast("Ingen notater å kopiere!");
      return;
    }
    navigator.clipboard.writeText(notes);
    showToast("Notater kopiert til utklippstavlen!");
  };

  const clearNotes = () => {
    if (window.confirm("Er du sikker på at du vil slette notatene dine for denne leksjonen? Dette kan ikke angres.")) {
      setNotes("");
      localStorage.removeItem(`hkm-notes-${courseId}-${currentModule.id}`);
      showToast("Notater slettet.");
    }
  };

  const parseMarkdown = (text) => {
    if (!text.trim()) return '<p class="text-outline italic text-xs py-4 text-center">Ingen notater skrevet ennå... Begynn å skrive i "Skriv" fanen!</p>';
    let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/^&gt;\s+(.*?)$/gm, '<blockquote class="border-l-4 border-[#1B4965] pl-4 py-1.5 my-3 italic text-on-surface-variant bg-slate-50 rounded-r">$1</blockquote>');
    html = html.replace(/^-\s+(.*?)$/gm, '<li class="ml-5 list-disc my-1">$1</li>');
    html = html.replace(/\n/g, '<br />');
    return `<div class="font-sans text-xs space-y-2 leading-relaxed text-on-surface p-1">${html}</div>`;
  };

  const handleToggleModule = (modId, e) => {
    e.stopPropagation();
    toggleModuleCompleted(course.id, modId);
    showToast("Kursfremgang oppdatert!");
  };

  const handleNextModule = () => {
    if (activeModuleIndex < course.modules.length - 1) setActiveModuleIndex(prev => prev + 1);
    else showToast("Du har nådd slutten av dette kurset!");
  };

  const handlePrevModule = () => {
    if (activeModuleIndex > 0) setActiveModuleIndex(prev => prev - 1);
  };

  const getModuleText = (title) => {
    if (course.id === 'prop101') return <div className="font-serif space-y-6 text-on-surface leading-relaxed text-base md:text-lg"><h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-4">{title}</h2><p>Velkommen til denne modulen i profetisk utrustning. I dette kapittelet skal vi ta for oss det bibelske og teologiske grunnlaget for den profetiske tjenesten.</p></div>;
    return <div className="font-serif space-y-6 text-on-surface leading-relaxed text-base md:text-lg"><h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-4">{title}</h2><p>Undervisning in progress...</p></div>;
  };

  return (
    <div className="flex flex-1 w-full max-w-[1440px] mx-auto items-start">
      <aside className={`bg-white border-r border-outline-variant/20 h-[calc(100vh-80px)] sticky top-20 hidden md:flex flex-col py-8 px-6 overflow-y-auto shrink-0 transition-all duration-300 ease-in-out ${hideStudyPlan ? 'md:w-0 md:opacity-0 md:p-0 md:border-r-0 overflow-hidden' : 'md:w-80 md:opacity-100'}`}>
        <div className="space-y-6">
          <button onClick={() => navigate('/student/library')} className="flex items-center gap-2 text-xs font-bold text-primary hover:underline uppercase tracking-wide"><ArrowLeft size={14} /><span>Tilbake til biblioteket</span></button>
          <div>
            <span className="bg-primary/5 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">{course.code}</span>
            <h2 className="font-serif font-bold text-primary text-lg mt-3">{course.title}</h2>
          </div>
          <nav className="space-y-1.5 pt-4 border-t border-slate-100">
            {course.modules.map((mod, index) => (
              <div key={mod.id} onClick={() => setActiveModuleIndex(index)} className={`flex items-center justify-between px-3.5 py-3 rounded-lg text-xs transition-all cursor-pointer ${activeModuleIndex === index ? 'bg-primary/5 border border-primary/20 text-primary font-bold' : 'hover:bg-slate-50'}`}>
                <span>{mod.title}</span>
                <button onClick={(e) => handleToggleModule(mod.id, e)}><CheckCircle size={16} className={mod.completed ? 'fill-primary text-white' : 'text-outline/40'} /></button>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-10 lg:p-12 overflow-x-hidden">
        <div className="max-w-[760px] mx-auto space-y-8">
          <div className="flex items-center justify-between bg-white border border-outline-variant/30 px-5 py-3 rounded-xl shadow-sm text-xs font-bold text-primary">
            <div className="flex items-center gap-2"><BookOpen size={16} className="text-primary animate-pulse" /><span>Visningsmodus</span></div>
            <div className="flex items-center gap-3">
              <button onClick={() => { setHideStudyPlan(!hideStudyPlan); setIsFocusMode(false); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${hideStudyPlan ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-white border-outline-variant/30'}`}><Eye size={14} /><span>{hideStudyPlan ? "Vis studieplan" : "Skjul studieplan"}</span></button>
              <button onClick={() => { setIsNotesOpen(true); setSidebarTab('notes'); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${isNotesOpen && sidebarTab === 'notes' ? 'bg-[#1B4965] text-white' : 'bg-white'}`}><Edit3 size={14} /><span>Notater</span></button>
              <button onClick={() => { setIsNotesOpen(true); setSidebarTab('bible'); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${isNotesOpen && sidebarTab === 'bible' ? 'bg-[#1B4965] text-white' : 'bg-white'}`}><BookOpen size={14} /><span>Bibel</span></button>
              <button onClick={toggleFocusMode} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${isFocusMode ? 'bg-burnt-orange/10 border-burnt-orange/20 text-burnt-orange' : 'bg-white'}`}><Maximize2 size={14} /><span>{isFocusMode ? "Avslutt fullskjerm" : "Fullskjerm"}</span></button>
            </div>
          </div>
          <div className="bg-white border border-outline-variant/20 shadow-sm p-5 sm:p-8 md:p-12 rounded-xl sm:rounded-2xl animate-fade-in">{getModuleText(currentModule.title)}</div>
          <div className="flex justify-between items-center pt-6 border-t border-slate-100">
            <button onClick={handlePrevModule} disabled={activeModuleIndex === 0} className="px-5 py-3 border rounded-lg">Forrige modul</button>
            <button onClick={handleNextModule} className="px-6 py-3 bg-primary text-white rounded-lg">Neste modul</button>
          </div>
        </div>
      </main>

      <aside className={`bg-white border-l border-outline-variant/20 h-[calc(100vh-80px)] sticky top-20 flex flex-col py-6 px-5 overflow-y-auto shrink-0 transition-all duration-300 ease-in-out z-30 ${isNotesOpen ? 'w-full md:w-96 opacity-100 p-6' : 'w-0 opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col h-full space-y-4 min-w-0">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30 shrink-0">
            <h3 className="font-bold text-primary text-base flex items-center gap-1.5">{sidebarTab === 'notes' ? <><Edit3 size={16} />Mine Notater</> : <><BookOpen size={16} />Bibelverktøy</>}</h3>
            <button onClick={() => setIsNotesOpen(false)}><X size={18} /></button>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl text-[11px] font-bold shrink-0">
            <button onClick={() => setSidebarTab('notes')} className={`flex-1 py-1.5 rounded-lg ${sidebarTab === 'notes' ? 'bg-white' : ''}`}>Mine Notater</button>
            <button onClick={() => setSidebarTab('bible')} className={`flex-1 py-1.5 rounded-lg ${sidebarTab === 'bible' ? 'bg-white' : ''}`}>Slå opp i Bibelen</button>
          </div>
          {sidebarTab === 'notes' ? (
            <>
              <div className="flex items-center justify-between text-[10px] shrink-0 font-medium">
                <div className="flex items-center gap-1.5 text-on-surface-variant"><span className={`w-2 h-2 rounded-full ${isSaving ? 'bg-amber-500' : 'bg-green-500'}`}></span><span>{isSaving ? 'Lagrer...' : 'Lagret'}</span></div>
              </div>
              <div className="flex border-b border-outline-variant/20 text-xs font-bold shrink-0">
                <button onClick={() => setActiveTab('write')} className={`flex-1 py-2 ${activeTab === 'write' ? 'border-[#1B4965] text-[#1B4965]' : ''}`}>Skriv</button>
                <button onClick={() => setActiveTab('preview')} className={`flex-1 py-2 ${activeTab === 'preview' ? 'border-[#1B4965] text-[#1B4965]' : ''}`}>Forhåndsvisning</button>
              </div>
              <div className="flex-grow flex flex-col min-h-0 min-w-0">
                {activeTab === 'write' ? (
                  <div className="flex flex-col flex-grow min-h-0 min-w-0 space-y-2">
                    <div className="flex items-center gap-1 bg-surface-container-low p-1.5 rounded-lg border shrink-0">
                      <button onClick={() => insertFormatting('bold')} className="p-1 min-w-6">B</button>
                      <button onClick={() => insertFormatting('italic')} className="p-1 min-w-6">I</button>
                      <button onClick={() => insertFormatting('list')} className="p-1 min-w-6"><List size={14} /></button>
                      <button onClick={() => insertFormatting('quote')} className="p-1 min-w-6"><Quote size={14} /></button>
                      <div className="flex-grow"></div>
                      <button onClick={clearNotes} className="p-1 min-w-6"><Trash2 size={14} /></button>
                    </div>
                    <textarea ref={textareaRef} value={notes} onChange={handleNotesChange} className="w-full flex-grow p-3 border outline-none resize-none bg-slate-50" />
                  </div>
                ) : (
                  <div className="w-full flex-grow p-3 border overflow-y-auto" dangerouslySetInnerHTML={{ __html: parseMarkdown(notes) }} />
                )}
              </div>
              <div className="flex flex-col gap-2 shrink-0 pt-3 border-t">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={copyNotesToClipboard} className="py-2 border rounded-lg">Kopier</button>
                  <button onClick={downloadNotes} className="py-2 bg-primary text-white rounded-lg">Last ned</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={sendNoteToAssistant} className="py-2 border rounded-lg">Send til HKM</button>
                  <button onClick={shareNoteToCommunity} className="py-2 border rounded-lg">Del i fellesskap</button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col flex-grow min-h-0 min-w-0 space-y-3.5 font-sans">
              <div className="grid grid-cols-2 gap-2 shrink-0">
                <select value={selectedBibleBook.id} onChange={(e) => { const f = BIBLE_BOOKS.find(b => b.id === e.target.value); setSelectedBibleBook(f); setSelectedBibleChapter(1); }} className="w-full bg-slate-50 border p-2 rounded-lg text-xs">{BIBLE_BOOKS.map(b => <option key={b.id} value={b.id}>{b.nor}</option>)}</select>
                <select value={selectedBibleChapter} onChange={(e) => setSelectedBibleChapter(Number(e.target.value))} className="w-full bg-slate-50 border p-2 rounded-lg text-xs">{Array.from({ length: selectedBibleBook.chapters }, (_, i) => i + 1).map(c => <option key={c} value={c}>{c}</option>)}</select>
              </div>
              <div className="flex gap-2 shrink-0">
                <select value={selectedBibleTranslation} onChange={(e) => setSelectedBibleTranslation(e.target.value)} className="flex-1 bg-slate-50 border p-2 text-xs"><option value="bibelselskap">Bokmål</option><option value="web">WEB</option></select>
                <form onSubmit={handleBibleSearch} className="flex-[1.2] flex"><input type="text" placeholder="Søk..." value={bibleSearchQuery} onChange={(e) => setBibleSearchQuery(e.target.value)} className="w-full bg-slate-50 border p-2 text-xs" /><button type="submit"><Search size={14} /></button></form>
              </div>
              <div className="flex-grow border rounded-xl bg-slate-50/50 overflow-y-auto p-3.5">
                {isBibleLoading ? <div className="text-center">Laster...</div> : bibleVerses.map(v => (
                  <div key={v.verse} className="group relative p-2 border-b">
                    <p className="text-xs">{v.verse} {v.text} <button onClick={() => insertVerseToNotes(v)}><Send size={10} /></button></p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
