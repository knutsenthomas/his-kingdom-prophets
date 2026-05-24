import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/firebase';
import { 
  collection, query, where, getDocs, 
  doc, setDoc, deleteDoc, updateDoc 
} from 'firebase/firestore';
import { 
  Search, Book, GraduationCap, Clock, Trash2, 
  FileText, Send, Sparkles, Download, ArrowLeft, 
  Plus, Check, Edit, Save, FileEdit, AlertCircle
} from 'lucide-react';
import CmsText from '@/components/CmsText';

const BIBLE_BOOKS = [
  // Det gamle testamentet (GT)
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

  // Det nye testamentet (NT)
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

export default function NotesPage() {
  const navigate = useNavigate();
  const { user, showToast, language, sendAssistantMessage, courses } = useApp();
  const [activeTab, setActiveTab] = useState('bible'); // bible, lesson
  const [searchQuery, setSearchQuery] = useState('');
  
  // Loading & Data States
  const [bibleNotes, setBibleNotes] = useState([]);
  const [lessonNotes, setLessonNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Editor Modal States
  const [selectedNote, setSelectedNote] = useState(null); // The note currently being edited
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorText, setEditorText] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error
  
  const saveTimeoutRef = useRef(null);
  const editorRef = useRef(null);

  // Note Creation Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newNoteType, setNewNoteType] = useState('bible'); // bible, lesson
  const [selectedBookId, setSelectedBookId] = useState('gen');
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Sync selected Course & Module for Lesson Note creation
  useEffect(() => {
    if (courses && courses.length > 0) {
      if (!selectedCourseId) {
        setSelectedCourseId(courses[0].id);
      }
      const currentCourseObj = courses.find(c => c.id === (selectedCourseId || courses[0].id));
      if (currentCourseObj && currentCourseObj.modules && currentCourseObj.modules.length > 0) {
        // If the selectedModuleId is not in the current course's modules, set it to the first module
        const hasModule = currentCourseObj.modules.some(m => m.id === selectedModuleId);
        if (!hasModule) {
          setSelectedModuleId(currentCourseObj.modules[0].id);
        }
      } else {
        setSelectedModuleId('');
      }
    }
  }, [selectedCourseId, courses, selectedModuleId]);

  // Reset creation modal fields when opening
  useEffect(() => {
    if (isCreateModalOpen) {
      setNewNoteType(activeTab);
      if (courses && courses.length > 0) {
        const defaultCourse = courses[0];
        setSelectedCourseId(defaultCourse.id);
        if (defaultCourse.modules && defaultCourse.modules.length > 0) {
          setSelectedModuleId(defaultCourse.modules[0].id);
        }
      }
      setSelectedBookId('gen');
      setSelectedChapter(1);
    }
  }, [isCreateModalOpen, activeTab, courses]);

  // Create Note Handler
  const handleCreateNote = async () => {
    if (!user?.uid) {
      showToast(language === 'en' ? "Please log in to create notes." : "Vennligst logg inn for å opprette notater.");
      return;
    }

    setIsCreating(true);

    try {
      if (newNoteType === 'bible') {
        const calculatedId = `${user.uid}_${selectedBookId}_${selectedChapter}`;
        
        // Check duplicate locally
        const existing = bibleNotes.find(n => n.id === calculatedId);
        if (existing) {
          showToast(language === 'en' ? "Note already exists. Opening editor..." : "Notatet eksisterer allerede. Åpner...");
          handleOpenEditor(existing);
          setIsCreateModalOpen(false);
          setIsCreating(false);
          return;
        }

        const book = BIBLE_BOOKS.find(b => b.id === selectedBookId);
        const bookName = book ? (language === 'en' ? book.eng : book.nor) : selectedBookId;

        const docRef = doc(db, "bible_notes", calculatedId);
        const now = new Date().toISOString();
        const newNoteData = {
          userId: user.uid,
          userName: user.name || user.displayName || '',
          bookId: selectedBookId,
          bookName: bookName,
          chapter: Number(selectedChapter),
          content: '',
          updatedAt: now
        };

        await setDoc(docRef, newNoteData);

        // Update local storage to prevent any offline desync
        localStorage.setItem(`hkm-bible-note-${user.uid}-${selectedBookId}_${selectedChapter}`, '');

        const newNoteObj = { id: calculatedId, ...newNoteData, type: 'bible' };
        setBibleNotes(prev => [newNoteObj, ...prev]);
        showToast(language === 'en' ? "Note created successfully." : "Notatet ble opprettet.");
        handleOpenEditor(newNoteObj);
        setIsCreateModalOpen(false);

      } else {
        // Lesson Note
        if (!selectedCourseId || !selectedModuleId) {
          showToast(language === 'en' ? "Select a course and module." : "Velg et kurs og en modul.");
          setIsCreating(false);
          return;
        }

        const calculatedId = `${user.uid}_${selectedCourseId}_${selectedModuleId}`;

        // Check duplicate
        const existing = lessonNotes.find(n => n.id === calculatedId);
        if (existing) {
          showToast(language === 'en' ? "Note already exists. Opening editor..." : "Notatet eksisterer allerede. Åpner...");
          handleOpenEditor(existing);
          setIsCreateModalOpen(false);
          setIsCreating(false);
          return;
        }

        const courseObj = courses.find(c => c.id === selectedCourseId);
        const moduleObj = courseObj?.modules?.find(m => m.id === selectedModuleId);

        if (!courseObj || !moduleObj) {
          showToast(language === 'en' ? "Invalid course or module selection." : "Ugyldig valg av kurs eller modul.");
          setIsCreating(false);
          return;
        }

        const docRef = doc(db, "user_notes", calculatedId);
        const now = new Date().toISOString();
        const newNoteData = {
          text: "<p><br/></p>",
          userId: user.uid,
          userName: user.name || user.displayName || '',
          courseId: selectedCourseId,
          courseTitle: courseObj.title,
          courseCode: courseObj.code || '',
          moduleId: selectedModuleId,
          moduleTitle: moduleObj.title,
          updatedAt: now
        };

        await setDoc(docRef, newNoteData);

        // Update local storage
        localStorage.setItem(`hkm-notes-${selectedCourseId}-${selectedModuleId}`, "<p><br/></p>");

        const newNoteObj = { id: calculatedId, ...newNoteData, type: 'lesson' };
        setLessonNotes(prev => [newNoteObj, ...prev]);
        showToast(language === 'en' ? "Note created successfully." : "Notatet ble opprettet.");
        handleOpenEditor(newNoteObj);
        setIsCreateModalOpen(false);
      }
    } catch (err) {
      console.error("Klarte ikke opprette notat:", err);
      showToast(language === 'en' ? "Failed to create note." : "Kunne ikke opprette notatet.");
    } finally {
      setIsCreating(false);
    }
  };

  // Fetch Notes from Firestore
  const fetchNotes = async () => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // 1. Fetch Bible Notes
      const bibleQuery = query(collection(db, "bible_notes"), where("userId", "==", user.uid));
      const bibleSnap = await getDocs(bibleQuery);
      const bNotes = [];
      bibleSnap.forEach((doc) => {
        bNotes.push({ id: doc.id, ...doc.data(), type: 'bible' });
      });
      // Sort by updatedAt descending
      bNotes.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
      setBibleNotes(bNotes);

      // 2. Fetch Lesson Notes
      const lessonQuery = query(collection(db, "user_notes"), where("userId", "==", user.uid));
      const lessonSnap = await getDocs(lessonQuery);
      const lNotes = [];
      lessonSnap.forEach((doc) => {
        lNotes.push({ id: doc.id, ...doc.data(), type: 'lesson' });
      });
      // Sort by updatedAt descending
      lNotes.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
      setLessonNotes(lNotes);

    } catch (err) {
      console.error("Klarte ikke hente notater fra Firestore:", err);
      showToast(language === 'en' ? "Failed to load notes from cloud." : "Kunne ikke hente notater fra skyen.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user]);

  // Clean HTML helper for text snippets (strips HTML tags and gets clean text)
  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
  };

  // Format Date beautifully
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'no-NO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Delete Note Handler
  const handleDeleteNote = async (note, e) => {
    e.stopPropagation(); // Prevent opening editor
    
    const confirmMsg = language === 'en' 
      ? `Are you sure you want to delete notes for ${note.type === 'bible' ? `${note.bookName} ${note.chapter}` : note.moduleTitle}?`
      : `Er du sikker på at du vil slette notatet for ${note.type === 'bible' ? `${note.bookName} ${note.chapter}` : note.moduleTitle}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const collectionName = note.type === 'bible' ? 'bible_notes' : 'user_notes';
      await deleteDoc(doc(db, collectionName, note.id));
      
      // Clean local storage cache if applicable
      if (note.type === 'bible') {
        localStorage.removeItem(`hkm-bible-note-${user.uid}-${note.bookId}_${note.chapter}`);
        setBibleNotes(prev => prev.filter(n => n.id !== note.id));
      } else {
        localStorage.removeItem(`hkm-notes-${note.courseId}-${note.moduleId}`);
        setLessonNotes(prev => prev.filter(n => n.id !== note.id));
      }

      showToast(language === 'en' ? "Note deleted." : "Notatet er slettet.");
    } catch (err) {
      console.error("Kunne ikke slette notat:", err);
      showToast(language === 'en' ? "Failed to delete note." : "Kunne ikke slette notatet.");
    }
  };

  // Open Editor
  const handleOpenEditor = (note) => {
    setSelectedNote(note);
    setEditorText(note.type === 'bible' ? note.content : note.text);
    setSaveStatus('idle');
    setIsEditorOpen(true);
  };

  // Close Editor
  const handleCloseEditor = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setIsEditorOpen(false);
    setSelectedNote(null);
    setEditorText('');
    fetchNotes(); // Reload notes in background to reflect edits on grid
  };

  // Manual & Auto-save Logic
  const handleSaveNote = async (textToSave = editorText) => {
    if (!selectedNote || !user?.uid) return;

    setSaveStatus('saving');
    
    try {
      const collectionName = selectedNote.type === 'bible' ? 'bible_notes' : 'user_notes';
      const docRef = doc(db, collectionName, selectedNote.id);
      
      const now = new Date().toISOString();
      const updatedFields = selectedNote.type === 'bible' 
        ? { content: textToSave, updatedAt: now } 
        : { text: textToSave, updatedAt: now };

      await setDoc(docRef, updatedFields, { merge: true });
      
      // Update local storage too to keep portals in sync instantly
      if (selectedNote.type === 'bible') {
        localStorage.setItem(`hkm-bible-note-${user.uid}-${selectedNote.bookId}_${selectedNote.chapter}`, textToSave);
      } else {
        localStorage.setItem(`hkm-notes-${selectedNote.courseId}-${selectedNote.moduleId}`, textToSave);
      }

      setSaveStatus('saved');
    } catch (err) {
      console.error("Feil ved lagring:", err);
      setSaveStatus('error');
    }
  };

  // Handle content change in text area or rich text contentEditable
  const handleTextChange = (newVal) => {
    setEditorText(newVal);
    setSaveStatus('idle');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      handleSaveNote(newVal);
    }, 1500);
  };

  // Rich Text Commands helper
  const execEditorCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      handleTextChange(editorRef.current.innerHTML);
    }
  };

  // Ask AI Widget synergy
  const handleSendToAI = (note) => {
    const content = note.type === 'bible' ? note.content : stripHtml(note.text);
    if (!content.trim()) {
      showToast(language === 'en' ? "Note is empty." : "Notatet er tomt.");
      return;
    }

    const title = note.type === 'bible' ? `${note.bookName} ${note.chapter}` : note.moduleTitle;
    const aiPrompt = language === 'en'
      ? `I am studying and have written these notes on "${title}":\n\n"${content}"\n\nCan you expand on this and give me a deeper theological perspective?`
      : `Jeg studerer og har skrevet følgende notater om "${title}":\n\n"${content}"\n\nKan du utdype dette notatet og gi meg et dypere teologisk og profetisk perspektiv?`;
    
    sendAssistantMessage(aiPrompt);
    showToast(language === 'en' ? "Sent to AI Assistant! Open chat." : "Sendt til HKM Assistent! Åpne chatten.");
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('hkm-open-chat'));
    }, 500);
  };

  // Share to Chat
  const handleShareToChat = (note) => {
    const content = note.type === 'bible' ? note.content : stripHtml(note.text);
    if (!content.trim()) {
      showToast(language === 'en' ? "Note is empty." : "Notatet er tomt.");
      return;
    }

    const title = note.type === 'bible' ? `${note.bookName} ${note.chapter}` : note.moduleTitle;
    const shareMessage = language === 'en'
      ? `Hey everyone! 📖 Sharing my study notes on **${title}**:\n\n"${content}"`
      : `Hei alle sammen! 📖 Her er mine studie-notater fra **${title}**:\n\n"${content}"`;

    localStorage.setItem('hkm-pending-chat-message', shareMessage);
    showToast(language === 'en' ? "Redirecting to chat..." : "Deling klargjort! Sender deg til bønnefellesskapet...");
    setTimeout(() => {
      navigate('/student/chat');
    }, 1200);
  };

  // Export note as Text file download
  const handleExportText = (note) => {
    const title = note.type === 'bible' ? `${note.bookName} ${note.chapter}` : note.moduleTitle;
    const rawContent = note.type === 'bible' ? note.content : stripHtml(note.text);

    const fileContent = `================================================
HIS KINGDOM PROPHETS - PERSONAL STUDY NOTES
================================================
Kategori: ${note.type === 'bible' ? 'Bibelstudie' : `Kursleksjon (${note.courseTitle})`}
Tittel: ${title}
Sist oppdatert: ${formatDate(note.updatedAt)}
------------------------------------------------

${rawContent}

================================================
© 2026 His Kingdom Prophets
================================================`;

    const element = document.createElement("a");
    const file = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_notater.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast(language === 'en' ? "Notes exported successfully." : "Notatet er eksportert.");
  };

  // Filter Notes List based on query
  const filteredBibleNotes = bibleNotes.filter(n => 
    n.bookName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLessonNotes = lessonNotes.filter(n => 
    n.moduleTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeNotes = activeTab === 'bible' ? filteredBibleNotes : filteredLessonNotes;

  return (
    <main className="flex-grow w-full max-w-[1440px] mx-auto px-6 md:px-12 py-10 flex flex-col font-sans">
      
      {/* Header section with styling tags */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-outline-variant/30 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/5 text-primary rounded-xl shrink-0">
            <FileText size={24} className="animate-pulse" />
          </div>
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-primary leading-tight">
              {language === 'en' ? "My Study Notes" : "Mine studienotater"}
            </h1>
            <p className="text-xs text-on-surface-variant font-semibold mt-1">
              {language === 'en' 
                ? "Manage and edit all your classroom lessons and personal Bible study notes in one majestic workspace."
                : "Administrer og rediger alle dine forelesningsnotater og personlige bibelrefleksjoner på ett sted."}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Create Note Trigger Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 bg-[#1B4965] hover:bg-[#14374b] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 group shrink-0"
          >
            <Plus size={15} className="group-hover:rotate-90 transition-transform duration-200" />
            <span>{language === 'en' ? "New Note" : "Nytt notat"}</span>
          </button>

          {/* Global search input */}
          <div className="relative w-full sm:w-64 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={16} />
            <input
              type="text"
              placeholder={language === 'en' ? "Search notes..." : "Søk i notater..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-xs rounded-xl focus:outline-none placeholder:text-outline font-semibold transition-all"
            />
          </div>
        </div>
      </div>

      {/* Tabs segment controller */}
      <div className="flex border-b border-slate-200 mb-8 gap-6 select-none shrink-0">
        <button
          onClick={() => { setActiveTab('bible'); setSearchQuery(''); }}
          className={`pb-3 font-serif font-bold text-sm flex items-center gap-2 border-b-2 transition-all relative ${
            activeTab === 'bible' 
              ? 'text-primary border-primary' 
              : 'text-outline border-transparent hover:text-primary'
          }`}
        >
          <Book size={16} />
          <span>{language === 'en' ? "Bible Study Notes" : "Bibelstudie-notater"}</span>
          {bibleNotes.length > 0 && (
            <span className="text-[10px] font-mono font-bold bg-[#f3e8ff] text-primary border border-primary/25 rounded-full w-5 h-5 flex items-center justify-center shrink-0">
              {bibleNotes.length}
            </span>
          )}
        </button>

        <button
          onClick={() => { setActiveTab('lesson'); setSearchQuery(''); }}
          className={`pb-3 font-serif font-bold text-sm flex items-center gap-2 border-b-2 transition-all relative ${
            activeTab === 'lesson' 
              ? 'text-primary border-primary' 
              : 'text-outline border-transparent hover:text-primary'
          }`}
        >
          <GraduationCap size={18} />
          <span>{language === 'en' ? "Classroom Lesson Notes" : "Leksjonsnotater"}</span>
          {lessonNotes.length > 0 && (
            <span className="text-[10px] font-mono font-bold bg-[#f3e8ff] text-primary border border-primary/25 rounded-full w-5 h-5 flex items-center justify-center shrink-0">
              {lessonNotes.length}
            </span>
          )}
        </button>
      </div>

      {/* Grid workspace / Loading / Empty state */}
      {isLoading ? (
        <div className="flex-grow py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-xs text-outline font-semibold tracking-wider uppercase">
            {language === 'en' ? "Fetching your notes from the cloud..." : "Henter notatene dine fra skyen..."}
          </p>
        </div>
      ) : activeNotes.length === 0 ? (
        <div className="flex-grow py-20 px-6 border-2 border-dashed border-slate-200 rounded-3xl bg-white text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-sm">
          <div className="p-4 bg-purple-50 text-primary rounded-2xl mb-4 shadow-inner">
            {activeTab === 'bible' ? <Book size={32} /> : <GraduationCap size={32} />}
          </div>
          <h3 className="font-serif text-lg font-bold text-primary mb-2">
            {language === 'en' ? "No notes found" : "Ingen notater funnet"}
          </h3>
          <p className="text-xs text-on-surface-variant font-semibold max-w-sm mb-6 leading-relaxed">
            {searchQuery 
              ? (language === 'en' ? "No matches found for your search query." : "Ingen notater samsvarte med søket ditt.")
              : (activeTab === 'bible' 
                  ? (language === 'en' ? "Read the scriptures in the Study Bible portal and write reflections to start building your personal library." : "Les Skriftene i studiebibelen og skriv refleksjoner for å starte ditt eget personlige studiebibliotek.")
                  : (language === 'en' ? "Study lessons inside courses and write classroom notes to build your curriculum workbook." : "Studer leksjonene i kurset og skriv leksjonsnotater for å fylle arbeidsboken din."))
            }
          </p>
          {!searchQuery && (
            <button
              onClick={() => navigate(activeTab === 'bible' ? '/student/bible' : '/student/library')}
              className="px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:bg-[#3c096c] transition-colors active:scale-95 flex items-center gap-2"
            >
              {activeTab === 'bible' 
                ? (language === 'en' ? "Open Study Bible" : "Åpne Studiebibelen")
                : (language === 'en' ? "Go to Classroom" : "Gå til Kursrommet")}
            </button>
          )}
        </div>
      ) : (
        /* Notes Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          <AnimatePresence mode="popLayout">
            {activeNotes.map((note) => {
              const title = note.type === 'bible' ? `${note.bookName} ${note.chapter}` : note.moduleTitle;
              const textSnippet = note.type === 'bible' ? note.content : stripHtml(note.text);
              const metadata = note.type === 'bible' ? 'Bibelstudie' : `${note.courseCode} - ${note.courseTitle}`;
              
              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  onClick={() => handleOpenEditor(note)}
                  className="bg-white border border-outline-variant/30 rounded-2xl p-5 hover:shadow-md hover:border-primary/25 cursor-pointer flex flex-col justify-between group active:scale-[0.99] transition-all relative h-60"
                >
                  <div className="space-y-3 overflow-hidden">
                    <div className="flex justify-between items-center gap-2">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border tracking-wider shrink-0 ${
                        note.type === 'bible' 
                          ? 'bg-purple-50 text-primary border-purple-100' 
                          : 'bg-cyan-50 text-cyan-700 border-cyan-100'
                      }`}>
                        {metadata}
                      </span>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleExportText(note); }}
                          className="p-1 hover:bg-slate-100 text-outline hover:text-primary rounded-lg"
                          title={language === 'en' ? "Export note" : "Eksporter notat"}
                        >
                          <Download size={13} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSendToAI(note); }}
                          className="p-1 hover:bg-[#f3e8ff] text-outline hover:text-primary rounded-lg"
                          title={language === 'en' ? "Consult AI assistant" : "Spør HKM Assistent"}
                        >
                          <Sparkles size={13} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleShareToChat(note); }}
                          className="p-1 hover:bg-slate-100 text-outline hover:text-[#561291] rounded-lg"
                          title={language === 'en' ? "Share in community chat" : "Del i bønnefellesskapet"}
                        >
                          <Send size={13} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteNote(note, e)}
                          className="p-1 hover:bg-red-50 text-outline hover:text-red-600 rounded-lg"
                          title={language === 'en' ? "Delete note" : "Slett notat"}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-serif font-extrabold text-primary text-base group-hover:text-primary-container transition-colors truncate">
                      {title}
                    </h3>

                    <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-4 break-words">
                      {textSnippet || (language === 'en' ? "Empty note reflection..." : "Tomt studie-notat...")}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 mt-auto flex justify-between items-center text-[10px] text-outline font-semibold select-none">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {formatDate(note.updatedAt)}
                    </span>
                    <span className="text-primary font-bold uppercase tracking-wider group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      {language === 'en' ? "Edit" : "Rediger"} <ArrowLeft size={10} className="rotate-180" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* DETAILED EDITOR MODAL (Notion-like experience) */}
      <AnimatePresence>
        {isEditorOpen && selectedNote && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#240046]/45 backdrop-blur-sm z-50 flex justify-end"
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="w-full md:w-[700px] lg:w-[850px] bg-white h-full shadow-2xl flex flex-col justify-between"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={handleCloseEditor}
                    className="p-2 hover:bg-slate-200 rounded-xl text-primary transition-all active:scale-95"
                    title={language === 'en' ? "Back to Notes" : "Tilbake til notater"}
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-bold uppercase px-1.5 py-0.2 rounded border tracking-wider shrink-0 ${
                        selectedNote.type === 'bible' ? 'bg-purple-50 text-primary border-purple-100' : 'bg-cyan-50 text-cyan-700 border-cyan-100'
                      }`}>
                        {selectedNote.type === 'bible' ? 'Bibelstudie' : `${selectedNote.courseCode} Leksjon`}
                      </span>
                      
                      {/* Cloud Sync Save Status Label */}
                      <span className="text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 select-none">
                        {saveStatus === 'saving' && (
                          <span className="text-amber-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                            {language === 'en' ? "Saving to cloud..." : "Lagrer i skyen..."}
                          </span>
                        )}
                        {saveStatus === 'saved' && (
                          <span className="text-green-600 flex items-center gap-1">
                            <Check size={11} className="stroke-[3]" />
                            {language === 'en' ? "Synced" : "Synkronisert"}
                          </span>
                        )}
                        {saveStatus === 'error' && (
                          <span className="text-red-600 flex items-center gap-1">
                            <AlertCircle size={11} />
                            {language === 'en' ? "Offline mode" : "Lagret lokalt"}
                          </span>
                        )}
                      </span>
                    </div>

                    <h2 className="font-serif font-extrabold text-primary text-base sm:text-lg leading-tight truncate mt-1">
                      {selectedNote.type === 'bible' 
                        ? `${selectedNote.bookName} ${selectedNote.chapter}` 
                        : selectedNote.moduleTitle}
                    </h2>
                  </div>
                </div>

                {/* Editor actions menu */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendToAI(selectedNote)}
                    className="p-2 bg-[#f3e8ff]/70 text-[#561291] border border-[#561291]/15 hover:bg-[#f3e8ff] rounded-xl flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider transition-all"
                    title={language === 'en' ? "Consult AI assistant" : "Spør HKM Assistent"}
                  >
                    <Sparkles size={13} />
                    <span className="hidden sm:inline">Spør AI</span>
                  </button>

                  <button
                    onClick={() => handleShareToChat(selectedNote)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider transition-all"
                    title={language === 'en' ? "Share in community chat" : "Del i bønnefellesskapet"}
                  >
                    <Send size={12} />
                    <span className="hidden sm:inline">Del</span>
                  </button>

                  <button
                    onClick={() => handleExportText(selectedNote)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider transition-all"
                    title={language === 'en' ? "Export as txt" : "Eksporter"}
                  >
                    <Download size={12} />
                    <span className="hidden sm:inline">Eksporter</span>
                  </button>
                </div>
              </div>

              {/* Rich Editor Core Workspace */}
              <div className="flex-grow p-6 overflow-y-auto bg-slate-50/15">
                
                {/* Visual Rich WYSIWYG Toolbar for Lesson HTML Notes */}
                {selectedNote.type === 'lesson' && (
                  <div className="flex items-center gap-1 mb-4 p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm flex-wrap shrink-0">
                    <button 
                      type="button"
                      onClick={() => execEditorCommand('bold')}
                      className="px-2.5 py-1.5 hover:bg-slate-100 text-xs font-bold text-slate-700 rounded-lg"
                      title="Fet skrift (Ctrl+B)"
                    >
                      B
                    </button>
                    <button 
                      type="button"
                      onClick={() => execEditorCommand('italic')}
                      className="px-2.5 py-1.5 hover:bg-slate-100 text-xs italic font-serif text-slate-700 rounded-lg"
                      title="Kursiv skrift (Ctrl+I)"
                    >
                      I
                    </button>
                    <button 
                      type="button"
                      onClick={() => execEditorCommand('insertUnorderedList')}
                      className="px-2.5 py-1.5 hover:bg-slate-100 text-xs text-slate-700 rounded-lg"
                      title="Kulepunktliste"
                    >
                      • Liste
                    </button>
                    <div className="w-[1px] h-5 bg-slate-200 mx-1" />
                    <button 
                      type="button"
                      onClick={() => execEditorCommand('removeFormat')}
                      className="px-2 py-1.5 hover:bg-slate-100 text-[10px] text-outline rounded-lg"
                      title="Fjern formatering"
                    >
                      Fjern stil
                    </button>
                  </div>
                )}

                {/* Editor Content Area */}
                <div className="h-[calc(100vh-220px)] w-full">
                  {selectedNote.type === 'bible' ? (
                    /* Plaintext Textarea for Bible Study notes */
                    <textarea
                      value={editorText}
                      onChange={(e) => handleTextChange(e.target.value)}
                      placeholder={language === 'en' ? "Write down your scriptures, Tyndale cross-references, and prophetic visions here..." : "Skriv ned dine bibelsitater, åpenbaringsvers, paktstolkninger og profetiske refleksjoner her..."}
                      className="w-full h-full bg-transparent border-0 resize-none outline-none focus:ring-0 font-sans text-sm sm:text-base leading-relaxed text-slate-800 placeholder:text-outline placeholder:font-semibold"
                    />
                  ) : (
                    /* WYSIWYG ContentEditable for Lesson Notes */
                    <div
                      ref={editorRef}
                      contentEditable
                      onInput={(e) => handleTextChange(e.currentTarget.innerHTML)}
                      className="w-full h-full bg-transparent border-0 overflow-y-auto outline-none focus:ring-0 font-sans text-sm sm:text-base leading-relaxed text-slate-800 placeholder:text-outline placeholder:font-semibold prose prose-sm max-w-none"
                      style={{ minHeight: '100%' }}
                      dangerouslySetInnerHTML={{ __html: selectedNote.text }}
                    />
                  )}
                </div>

              </div>

              {/* Modal Footer with quick manual save trigger */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-outline font-semibold shrink-0">
                <span className="select-none">
                  {selectedNote.type === 'bible' 
                    ? (language === 'en' ? "Bible Note Workspace" : "Bibelstudie-notatblokk")
                    : `${selectedNote.courseTitle} - Leksjonsbok`
                  }
                </span>

                <button
                  type="button"
                  onClick={() => handleSaveNote()}
                  className="px-4 py-2 bg-primary text-white hover:bg-[#3c096c] rounded-xl flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95"
                >
                  <Save size={13} />
                  <span>{language === 'en' ? "Save now" : "Lagre nå"}</span>
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE NEW NOTE MODAL (Immersive overlay with Royal Purple / Mørkeblå harmony) */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#240046]/45 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#1B4965]/10 text-[#1B4965] rounded-xl">
                    <FileEdit size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-serif font-extrabold text-[#1B4965] text-lg">
                      {language === 'en' ? "Create New Note" : "Opprett nytt notat"}
                    </h3>
                    <p className="text-[10px] text-outline font-semibold">
                      {language === 'en' ? "Select note type and location" : "Velg type notat og plassering"}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 hover:bg-slate-200 text-outline hover:text-slate-800 rounded-xl transition-all"
                >
                  <AlertCircle size={18} className="rotate-45" />
                </button>
              </div>

              {/* Note Type Toggle segment selector */}
              <div className="p-6 pb-2 shrink-0">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setNewNoteType('bible')}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
                      newNoteType === 'bible'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-outline hover:text-primary'
                    }`}
                  >
                    <Book size={14} />
                    <span>{language === 'en' ? "Bible Study" : "Bibelstudie"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewNoteType('lesson')}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
                      newNoteType === 'lesson'
                        ? 'bg-white text-[#1B4965] shadow-sm'
                        : 'text-outline hover:text-[#1B4965]'
                    }`}
                  >
                    <GraduationCap size={15} />
                    <span>{language === 'en' ? "Class Lesson" : "Kursleksjon"}</span>
                  </button>
                </div>
              </div>

              {/* Interactive Creation Form */}
              <div className="p-6 space-y-5 overflow-y-auto max-h-[350px]">
                {newNoteType === 'bible' ? (
                  <>
                    {/* Bible Book Select */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-outline">
                        {language === 'en' ? "Bible Book" : "Bibelbok"}
                      </label>
                      <select
                        value={selectedBookId}
                        onChange={(e) => {
                          setSelectedBookId(e.target.value);
                          setSelectedChapter(1);
                        }}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-sm rounded-xl focus:outline-none font-semibold transition-all font-sans"
                      >
                        {BIBLE_BOOKS.map(book => (
                          <option key={book.id} value={book.id}>
                            {language === 'en' ? book.eng : book.nor} ({book.testament})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Chapter select with fine numeric adjustment */}
                    {(() => {
                      const selectedBook = BIBLE_BOOKS.find(b => b.id === selectedBookId);
                      const maxChapters = selectedBook ? selectedBook.chapters : 50;

                      return (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-outline">
                            {language === 'en' ? "Chapter" : "Kapittel"}
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedChapter(prev => Math.max(1, prev - 1))}
                              className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-primary font-extrabold transition-all select-none w-11 h-11 flex items-center justify-center active:scale-95"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={maxChapters}
                              value={selectedChapter}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                if (val > 0) {
                                  setSelectedChapter(Math.min(maxChapters, val));
                                }
                              }}
                              className="flex-grow text-center h-11 bg-slate-50 border border-slate-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-sm rounded-xl focus:outline-none font-bold transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setSelectedChapter(prev => Math.min(maxChapters, prev + 1))}
                              className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-primary font-extrabold transition-all select-none w-11 h-11 flex items-center justify-center active:scale-95"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-[10px] text-outline font-semibold italic block text-center mt-1">
                            {selectedBook 
                              ? (language === 'en' 
                                  ? `${selectedBook.eng} contains ${maxChapters} chapters.` 
                                  : `${selectedBook.nor} har totalt ${maxChapters} kapitler.`)
                              : ''}
                          </span>
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <>
                    {/* Course Selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-outline">
                        {language === 'en' ? "Select Course" : "Velg kurs"}
                      </label>
                      {courses && courses.length > 0 ? (
                        <select
                          value={selectedCourseId}
                          onChange={(e) => setSelectedCourseId(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-sm rounded-xl focus:outline-none font-semibold transition-all font-sans"
                        >
                          {courses.map(course => (
                            <option key={course.id} value={course.id}>
                              [{course.code}] {course.title}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="p-3.5 bg-amber-50 text-amber-700 text-xs rounded-xl font-semibold border border-amber-200 flex items-center gap-2">
                          <AlertCircle size={16} />
                          <span>{language === 'en' ? "No enrolled courses found." : "Ingen påmeldte kurs funnet."}</span>
                        </div>
                      )}
                    </div>

                    {/* Module Dependent Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-outline">
                        {language === 'en' ? "Select Module / Lesson" : "Velg modul / leksjon"}
                      </label>
                      {(() => {
                        const currentCourseObj = courses?.find(c => c.id === selectedCourseId);
                        const modules = currentCourseObj?.modules || [];
                        
                        return modules.length > 0 ? (
                          <select
                            value={selectedModuleId}
                            onChange={(e) => setSelectedModuleId(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-sm rounded-xl focus:outline-none font-semibold transition-all font-sans"
                          >
                            {modules.map(mod => (
                              <option key={mod.id} value={mod.id}>
                                {mod.title}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="p-3.5 bg-slate-100 text-outline text-xs rounded-xl font-semibold border border-slate-200 text-center">
                            {language === 'en' ? "No modules available for this course." : "Ingen moduler tilgjengelig for dette kurset."}
                          </div>
                        );
                      })()}
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer with premium triggers */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 hover:bg-slate-200 text-outline hover:text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-[0.98]"
                >
                  {language === 'en' ? "Cancel" : "Avbryt"}
                </button>

                <button
                  type="button"
                  onClick={handleCreateNote}
                  disabled={isCreating || (newNoteType === 'lesson' && (!selectedCourseId || !selectedModuleId))}
                  className="px-5 py-2.5 bg-[#1B4965] hover:bg-[#14374b] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      <span>{language === 'en' ? "Creating..." : "Oppretter..."}</span>
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      <span>{language === 'en' ? "Create and write" : "Opprett og skriv"}</span>
                    </>
                  )}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
