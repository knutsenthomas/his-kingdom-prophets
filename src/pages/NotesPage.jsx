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

export default function NotesPage() {
  const navigate = useNavigate();
  const { user, showToast, language, sendAssistantMessage } = useApp();
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

        {/* Global search input */}
        <div className="relative w-full md:w-80">
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

    </main>
  );
}
