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

// Robust helpers to parse Bible references (e.g., "1. Joh 5:7", "Johannes 3,16", "Johannes 3 16", "Joh 3")
const parseBibleReference = (query) => {
  if (!query) return null;
  const clean = query.trim();
  // Match: (Optional Book number with space/dot) (Book name letters/dots) (whitespace) (Chapter number) (optional separators and verse number)
  // Matches "1. Joh 3:16", "1.Joh 3,16", "Johannes 3 16", "Joh 3"
  const match = clean.match(/^([1-3]?\s*\.?\s*[a-zA-Z\u00C0-\u00FF]+(?:\s*[a-zA-Z\u00C0-\u00FF]+)*)\s+(\d+)(?:[\s:,v\.\-]+(\d+))?/i);
  if (!match) return null;
  
  return {
    bookStr: match[1].trim(),
    chapter: parseInt(match[2], 10),
    verse: match[3] ? parseInt(match[3], 10) : null
  };
};

const findBibleBook = (bookStr) => {
  if (!bookStr) return null;
  const cleanStr = bookStr.toLowerCase().replace(/[\.\s]/g, ''); // "1.joh" -> "1joh", "joh" -> "joh"
  
  // 1. Exact match (ignoring dots and spaces)
  let found = BIBLE_BOOKS.find(b => 
    b.nor.toLowerCase().replace(/[\.\s]/g, '') === cleanStr ||
    b.eng.toLowerCase().replace(/[\.\s]/g, '') === cleanStr ||
    b.id.toLowerCase() === cleanStr
  );
  if (found) return found;

  // 2. Prefix match
  found = BIBLE_BOOKS.find(b => 
    b.nor.toLowerCase().replace(/[\.\s]/g, '').startsWith(cleanStr) ||
    b.eng.toLowerCase().replace(/[\.\s]/g, '').startsWith(cleanStr)
  );
  if (found) return found;

  // 3. Contains match
  found = BIBLE_BOOKS.find(b => 
    b.nor.toLowerCase().replace(/[\.\s]/g, '').includes(cleanStr) ||
    b.eng.toLowerCase().replace(/[\.\s]/g, '').includes(cleanStr)
  );
  return found;
};


const migrateMarkdownToHtml = (text) => {
  if (!text) return "";
  // If it already contains HTML tags (like <strong>, <em>, <blockquote, <p, etc.), assume it is already HTML
  if (/<[a-z][\s\S]*>/i.test(text)) return text;
  
  // Basic markdown to HTML conversion
  let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/^&gt;\s+(.*?)$/gm, '<blockquote style="border-left: 4px solid #561291; padding-left: 1rem; margin: 0.75rem 0; font-style: italic; background-color: #f8fafc; border-top-right-radius: 0.375rem; border-bottom-right-radius: 0.375rem; padding-top: 0.375rem; padding-bottom: 0.375rem;">$1</blockquote>');
  html = html.replace(/^-\s+(.*?)$/gm, '<li style="margin-left: 1.25rem; list-style-type: disc; margin-top: 0.25rem; margin-bottom: 0.25rem;">$1</li>');
  html = html.replace(/\n/g, '<br />');
  return html;
};

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
  const [highlightedBibleVerse, setHighlightedBibleVerse] = useState(null);
  const [selectedBibleVerses, setSelectedBibleVerses] = useState([]);
  
  const textareaRef = useRef(null);
  const editorRef = useRef(null);
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
      const migratedNotes = migrateMarkdownToHtml(savedNotes) || "<p><br/></p>";
      setNotes(migratedNotes);
      
      // Manually set editor innerHTML on load/switch
      if (editorRef.current) {
        editorRef.current.innerHTML = migratedNotes;
      }
      
      setActiveTab('write'); // Reset tab

      // 2. Fetch from Firestore for cloud sync if user is logged in
      if (user?.uid) {
        try {
          const noteDocRef = doc(db, "user_notes", `${user.uid}_${courseId}_${currentModule.id}`);
          const noteSnap = await getDoc(noteDocRef);
          if (noteSnap.exists()) {
            const cloudText = noteSnap.data().text || "";
            const migratedCloud = migrateMarkdownToHtml(cloudText) || "<p><br/></p>";
            if (migratedCloud && migratedCloud !== migratedNotes) {
              setNotes(migratedCloud);
              localStorage.setItem(`hkm-notes-${courseId}-${currentModule.id}`, migratedCloud);
              
              // Sync to editor DOM manually on cloud load
              if (editorRef.current) {
                editorRef.current.innerHTML = migratedCloud;
              }
            }
          }
        } catch (err) {
          console.error("Klarte ikke hente notater fra Firestore:", err);
        }
      }
    };
    loadNotes();
  }, [courseId, currentModule?.id, user?.uid, sidebarTab]);

  // Ensure that pressing Enter in the editor always creates <p> tags rather than divs
  useEffect(() => {
    if (editorRef.current && activeTab === 'write') {
      document.execCommand('defaultParagraphSeparator', false, 'p');
    }
  }, [activeTab, sidebarTab]);

  // Sync state changes to editor innerHTML ONLY when the change is external (e.g. database load or bibel insert)
  // This completely prevents React from overriding the DOM during typing, avoiding stutters or cursor jumps!
  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.innerHTML !== notes) {
      editor.innerHTML = notes;
    }
  }, [notes]);

  useEffect(() => {
    if (isNotesOpen && sidebarTab === 'bible') {
      fetchBibleChapter();
    }
  }, [selectedBibleBook, selectedBibleChapter, selectedBibleTranslation, sidebarTab, isNotesOpen]);

  // Handle smooth scroll to highlighted verse inside the lesson bible panel when verses finish loading
  useEffect(() => {
    if (highlightedBibleVerse && bibleVerses.length > 0) {
      setTimeout(() => {
        const el = document.getElementById(`v-lesson-${highlightedBibleVerse}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 400);
    }
  }, [highlightedBibleVerse, bibleVerses]);

  const fetchBibleChapter = async () => {
    setIsBibleLoading(true);
    setBibleVerses([]);
    try {
      const bookIndex = BIBLE_BOOKS.findIndex(b => b.id === selectedBibleBook.id);
      const bookNumber = bookIndex + 1;
      const url = `https://api.getbible.net/v2/${selectedBibleTranslation}/${bookNumber}/${selectedBibleChapter}.json`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setBibleVerses(data.verses || []);
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

    // 1. Try parsing as a specific Bible reference (e.g. "Johannes 3:16" or "1. Joh 5:7")
    const parsedRef = parseBibleReference(bibleSearchQuery);
    if (parsedRef) {
      const foundBook = findBibleBook(parsedRef.bookStr);
      if (foundBook) {
        setSelectedBibleBook(foundBook);
        const clampedChapter = Math.max(1, Math.min(parsedRef.chapter, foundBook.chapters));
        setSelectedBibleChapter(clampedChapter);
        
        if (parsedRef.verse) {
          setHighlightedBibleVerse(parsedRef.verse);
          setSelectedBibleVerses([parsedRef.verse]); // Auto-select searched verse!
          showToast(`Viser ${foundBook.nor} ${clampedChapter} med vers ${parsedRef.verse} uthevet!`);
        } else {
          setHighlightedBibleVerse(null);
          setSelectedBibleVerses([]);
          showToast(`Viser ${foundBook.nor} ${clampedChapter}!`);
        }
        setBibleSearchQuery('');
        return;
      }
    }

    // 2. Fallback to API-based keyword or complex query search
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
            // Fail-safe: if the search returned a single verse and we detected the book & chapter,
            // let's load the entire chapter instead of showing only a single verse!
            const hasNumbers = /\d+/.test(bibleSearchQuery);
            if (detectedBook && hasNumbers && resultVerses.length === 1) {
              setSelectedBibleBook(detectedBook);
              setSelectedBibleChapter(detectedChapter);
              setHighlightedBibleVerse(resultVerses[0].verse);
              setSelectedBibleVerses([resultVerses[0].verse]); // Auto-select searched verse!
              showToast(`Viser hele ${detectedBook.nor} ${detectedChapter} med vers ${resultVerses[0].verse} uthevet!`);
              setBibleSearchQuery('');
              return;
            }

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

  const insertHtmlToNotes = (html) => {
    const editor = editorRef.current;
    if (editor && sidebarTab === 'notes') {
      editor.focus();
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (editor.contains(range.commonAncestorContainer)) {
          range.deleteContents();
          const el = document.createElement("div");
          el.innerHTML = html;
          const frag = document.createDocumentFragment();
          let node, lastNode;
          while ((node = el.firstChild)) {
            lastNode = frag.appendChild(node);
          }
          range.insertNode(frag);
          if (lastNode) {
            const newRange = range.cloneRange();
            newRange.setStartAfter(lastNode);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
          const newHtml = editor.innerHTML;
          setNotes(newHtml);
          localStorage.setItem(`hkm-notes-${courseId}-${currentModule.id}`, newHtml);
          saveNotesToFirestore(newHtml);
          return;
        }
      }
    }
    
    // Fallback: Append directly to state if editor is unmounted or selection is lost
    setNotes(prev => {
      let current = prev ? prev.trim() : "";
      if (current === "<p><br/></p>" || current === "<p></p>" || current === "<br>") {
        current = "";
      }
      const separator = current ? "<br/>" : "";
      const newText = current + separator + html;
      localStorage.setItem(`hkm-notes-${courseId}-${currentModule.id}`, newText);
      saveNotesToFirestore(newText);
      return newText;
    });
  };

  const insertVerseToNotes = (verse) => {
    const transName = selectedBibleTranslation === 'bibelselskap' ? 'N11' : selectedBibleTranslation.toUpperCase();
    const htmlRef = `<div class="bible-quote-block" contenteditable="false" style="margin: 1rem 0; padding: 0.5rem 0; border-left: 4px solid #561291; background-color: #f8fafc; border-top-right-radius: 0.375rem; border-bottom-right-radius: 0.375rem; user-select: all;">
      <blockquote style="margin: 0; padding: 0 1rem; font-style: italic; border: none; background: transparent; color: #1e293b;">
        "${verse.text.trim()}"
      </blockquote>
      <p style="font-size: 0.75rem; color: #64748b; margin: 0.25rem 0 0 1rem; font-style: normal;">
        — <b>${selectedBibleBook.nor} ${verse.chapter}:${verse.verse}</b> (${transName})
      </p>
    </div><p><br/></p>`;
    
    insertHtmlToNotes(htmlRef);
    showToast("Skriftsted limt inn i dine notater!");
    setSelectedBibleVerses([]); // Clear selection when single verse is added
    setSidebarTab('notes');
  };

  const toggleVerseSelection = (verseNum) => {
    setSelectedBibleVerses(prev => {
      if (prev.includes(verseNum)) {
        return prev.filter(num => num !== verseNum);
      } else {
        return [...prev, verseNum].sort((a, b) => a - b);
      }
    });
  };

  const insertSelectedVersesToNotes = () => {
    if (selectedBibleVerses.length === 0) return;
    
    // Sort verse numbers in ascending order
    const sortedVerseNums = [...selectedBibleVerses].sort((a, b) => a - b);
    
    // Get corresponding verse objects with robust Number conversion
    const targetVerses = sortedVerseNums
      .map(num => bibleVerses.find(v => Number(v.verse) === Number(num)))
      .filter(Boolean);
      
    if (targetVerses.length === 0) return;

    // Combine text neatly
    const combinedText = targetVerses
      .map(v => `<span style="font-weight: bold; color: #561291; margin-right: 0.25rem;">${v.verse}</span>${v.text.trim()}`)
      .join(' ');

    // Create the range string: f.eks. "16-17" or "16"
    const verseRange = sortedVerseNums.length === 1 
      ? `${sortedVerseNums[0]}` 
      : `${sortedVerseNums[0]}-${sortedVerseNums[sortedVerseNums.length - 1]}`;

    const transName = selectedBibleTranslation === 'bibelselskap' ? 'N11' : selectedBibleTranslation.toUpperCase();
    const htmlRef = `<div class="bible-quote-block" contenteditable="false" style="margin: 1rem 0; padding: 0.5rem 0; border-left: 4px solid #561291; background-color: #f8fafc; border-top-right-radius: 0.375rem; border-bottom-right-radius: 0.375rem; user-select: all;">
      <blockquote style="margin: 0; padding: 0 1rem; font-style: italic; border: none; background: transparent; color: #1e293b;">
        "${combinedText}"
      </blockquote>
      <p style="font-size: 0.75rem; color: #64748b; margin: 0.25rem 0 0 1rem; font-style: normal;">
        — <b>${selectedBibleBook.nor} ${selectedBibleChapter}:${verseRange}</b> (${transName})
      </p>
    </div><p><br/></p>`;
    
    insertHtmlToNotes(htmlRef);
    showToast(`${selectedBibleVerses.length} skriftsteder limt inn i dine notater!`);
    setSelectedBibleVerses([]); // Clear selection
    setSidebarTab('notes'); // Switch to notes tab
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

  const handleKeyDown = (e) => {
    const editor = editorRef.current;
    if (!editor) return;

    if (e.key === 'Backspace') {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // 1. If editor is empty or just contains a single br, make sure we keep a clean <p><br/></p>
        if (editor.innerHTML.trim() === "" || editor.innerHTML.trim() === "<br>") {
          e.preventDefault();
          editor.innerHTML = "<p><br/></p>";
          const newRange = document.createRange();
          newRange.selectNodeContents(editor.firstChild);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
          handleContentChange(editor.innerHTML);
          return;
        }

        // 2. Check if we are right after a .bible-quote-block
        let container = range.commonAncestorContainer;
        if (container.nodeType === Node.TEXT_NODE) {
          if (range.startOffset === 0) {
            let blockNode = container.parentNode;
            while (blockNode && blockNode.parentNode !== editor && blockNode !== editor) {
              blockNode = blockNode.parentNode;
            }
            
            if (blockNode && blockNode.previousSibling && blockNode.previousSibling.classList?.contains('bible-quote-block')) {
              e.preventDefault();
              const blockToDelete = blockNode.previousSibling;
              editor.removeChild(blockToDelete);
              
              // Handle cursor positioning inside the remaining block
              const newRange = document.createRange();
              newRange.selectNodeContents(blockNode);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
              
              handleContentChange(editor.innerHTML);
              return;
            }
          }
        } else if (container === editor) {
          const offset = range.startOffset;
          if (offset > 0) {
            const prevSibling = editor.childNodes[offset - 1];
            if (prevSibling && prevSibling.classList?.contains('bible-quote-block')) {
              e.preventDefault();
              editor.removeChild(prevSibling);
              
              // Maintain focus inside a block or create one
              if (editor.childNodes[offset - 1]) {
                const newRange = document.createRange();
                newRange.selectNodeContents(editor.childNodes[offset - 1]);
                newRange.collapse(false);
                selection.removeAllRanges();
                selection.addRange(newRange);
              } else {
                editor.innerHTML = "<p><br/></p>";
                const newRange = document.createRange();
                newRange.selectNodeContents(editor.firstChild);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
              }
              
              handleContentChange(editor.innerHTML);
              return;
            }
          }
        }
        
        // 3. Resilient deletion for legacy (non-wrapped) blockquotes and citation paragraphs!
        let blockNode = container;
        while (blockNode && blockNode !== editor) {
          if (['BLOCKQUOTE', 'LI', 'P'].includes(blockNode.nodeName)) {
            break;
          }
          blockNode = blockNode.parentNode;
        }
        
        if (blockNode && blockNode !== editor) {
          const isAtStart = range.startOffset === 0 && (container.nodeType !== Node.TEXT_NODE || !container.previousSibling);
          
          if (isAtStart) {
            const prevSibling = blockNode.previousSibling;
            
            // Scenario A: Cursor is at the start of a paragraph immediately following a blockquote (legacy citation)
            if (prevSibling && prevSibling.nodeName === 'BLOCKQUOTE') {
              e.preventDefault();
              editor.removeChild(prevSibling);
              editor.removeChild(blockNode);
              
              if (editor.innerHTML.trim() === "") {
                editor.innerHTML = "<p><br/></p>";
              }
              
              const newRange = document.createRange();
              if (editor.firstChild) {
                newRange.selectNodeContents(editor.firstChild);
                newRange.collapse(true);
              } else {
                newRange.selectNodeContents(editor);
                newRange.collapse(true);
              }
              selection.removeAllRanges();
              selection.addRange(newRange);
              
              handleContentChange(editor.innerHTML);
              return;
            }
            
            // Scenario B: Cursor is at the start of a blockquote block
            if (blockNode.nodeName === 'BLOCKQUOTE') {
              e.preventDefault();
              const p = document.createElement("p");
              p.innerHTML = blockNode.innerHTML;
              editor.replaceChild(p, blockNode);
              
              const newRange = document.createRange();
              newRange.selectNodeContents(p);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
              
              handleContentChange(editor.innerHTML);
              return;
            }
          }
          
          // Original simple clean fallback for completely empty blocks
          const text = blockNode.textContent.trim();
          if (text === "") {
            e.preventDefault();
            
            const parent = blockNode.parentNode;
            const prevSibling = blockNode.previousSibling;
            
            parent.removeChild(blockNode);
            
            if (prevSibling) {
              const newRange = document.createRange();
              newRange.selectNodeContents(prevSibling);
              newRange.collapse(false);
              selection.removeAllRanges();
              selection.addRange(newRange);
            } else {
              const p = document.createElement("p");
              p.innerHTML = "<br/>";
              editor.insertBefore(p, editor.firstChild);
              
              const newRange = document.createRange();
              newRange.selectNodeContents(p);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
            
            handleContentChange(editor.innerHTML);
          }
        }
      }
    }
  };

  const handleContentChange = (val) => {
    setNotes(val);
    setIsSaving(true);
    localStorage.setItem(`hkm-notes-${courseId}-${currentModule.id}`, val);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      await saveNotesToFirestore(val);
      setIsSaving(false);
    }, 800);
  };

  const insertFormatting = (syntax) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();

    document.execCommand('styleWithCSS', false, false);
    
    if (syntax === 'bold') {
      document.execCommand('bold', false, null);
    } else if (syntax === 'italic') {
      document.execCommand('italic', false, null);
    } else if (syntax === 'list') {
      document.execCommand('insertUnorderedList', false, null);
    } else if (syntax === 'quote') {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let node = range.commonAncestorContainer;
        while (node && node !== editor) {
          if (node.nodeName === 'BLOCKQUOTE') {
            document.execCommand('formatBlock', false, 'p');
            return;
          }
          node = node.parentNode;
        }
      }
      
      document.execCommand('formatBlock', false, 'blockquote');
      
      setTimeout(() => {
        const bqs = editor.querySelectorAll('blockquote');
        bqs.forEach(bq => {
          bq.style.borderLeft = '4px solid #561291';
          bq.style.paddingLeft = '1rem';
          bq.style.margin = '0.75rem 0';
          bq.style.fontStyle = 'italic';
          bq.style.backgroundColor = '#f8fafc';
          bq.style.borderTopRightRadius = '0.375rem';
          bq.style.borderBottomRightRadius = '0.375rem';
          bq.style.paddingTop = '0.375rem';
          bq.style.paddingBottom = '0.375rem';
        });
      }, 50);
    }
    
    const newHtml = editor.innerHTML;
    handleContentChange(newHtml);
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
    const blob = new Blob([notes], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Notat-${currentModule.title.replace(/\s+/g, '_')}.html`);
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
      setNotes("<p><br/></p>");
      localStorage.setItem(`hkm-notes-${courseId}-${currentModule.id}`, "<p><br/></p>");
      saveNotesToFirestore("<p><br/></p>");
      if (editorRef.current) {
        editorRef.current.innerHTML = "<p><br/></p>";
      }
      showToast("Notater slettet.");
    }
  };

  const parseMarkdown = (text) => {
    if (!text.trim()) return '<p class="text-outline italic text-xs py-4 text-center">Ingen notater skrevet ennå... Begynn å skrive i "Skriv" fanen!</p>';
    let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/^&gt;\s+(.*?)$/gm, '<blockquote class="border-l-4 border-[#561291] pl-4 py-1.5 my-3 italic text-on-surface-variant bg-slate-50 rounded-r">$1</blockquote>');
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
              <button onClick={() => { setIsNotesOpen(true); setSidebarTab('notes'); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${isNotesOpen && sidebarTab === 'notes' ? 'bg-[#561291] text-white' : 'bg-white'}`}><Edit3 size={14} /><span>Notater</span></button>
              <button onClick={() => { setIsNotesOpen(true); setSidebarTab('bible'); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${isNotesOpen && sidebarTab === 'bible' ? 'bg-[#561291] text-white' : 'bg-white'}`}><BookOpen size={14} /><span>Bibel</span></button>
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
                <button onClick={() => setActiveTab('write')} className={`flex-1 py-2 ${activeTab === 'write' ? 'border-[#561291] text-[#561291]' : ''}`}>Skriv</button>
                <button onClick={() => setActiveTab('preview')} className={`flex-1 py-2 ${activeTab === 'preview' ? 'border-[#561291] text-[#561291]' : ''}`}>Forhåndsvisning</button>
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
                    <div 
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning={true}
                      onKeyDown={handleKeyDown}
                      onBlur={(e) => {
                        const newHtml = e.target.innerHTML;
                        handleContentChange(newHtml);
                      }}
                      onInput={(e) => {
                        const newHtml = e.target.innerHTML;
                        handleContentChange(newHtml);
                      }}
                      className="w-full flex-grow p-3 border outline-none overflow-y-auto bg-slate-50 rounded-lg min-h-[200px] text-xs font-sans focus:bg-white focus:border-[#561291] transition-all"
                    />
                  </div>
                ) : (
                  <div 
                    className="w-full flex-grow p-3 border overflow-y-auto font-sans text-xs space-y-2 leading-relaxed text-on-surface bg-white rounded-lg min-h-[200px]" 
                    dangerouslySetInnerHTML={{ __html: notes || '<p class="text-outline italic text-xs py-4 text-center">Ingen notater skrevet ennå... Begynn å skrive i "Skriv" fanen!</p>' }} 
                  />
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
                <select 
                  value={selectedBibleBook.id} 
                  onChange={(e) => { 
                    const f = BIBLE_BOOKS.find(b => b.id === e.target.value); 
                    setSelectedBibleBook(f); 
                    setSelectedBibleChapter(1); 
                    setHighlightedBibleVerse(null);
                    setSelectedBibleVerses([]);
                  }} 
                  className="w-full bg-slate-50 border p-2 rounded-lg text-xs"
                >
                  {BIBLE_BOOKS.map(b => <option key={b.id} value={b.id}>{b.nor}</option>)}
                </select>
                <select 
                  value={selectedBibleChapter} 
                  onChange={(e) => {
                    setSelectedBibleChapter(Number(e.target.value));
                    setHighlightedBibleVerse(null);
                    setSelectedBibleVerses([]);
                  }} 
                  className="w-full bg-slate-50 border p-2 rounded-lg text-xs"
                >
                  {Array.from({ length: selectedBibleBook.chapters }, (_, i) => i + 1).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-2 shrink-0">
                <select value={selectedBibleTranslation} onChange={(e) => setSelectedBibleTranslation(e.target.value)} className="flex-1 bg-slate-50 border p-2 text-xs"><option value="bibelselskap">Bokmål</option><option value="web">WEB</option></select>
                <form onSubmit={handleBibleSearch} className="flex-[1.2] flex"><input type="text" placeholder="Søk..." value={bibleSearchQuery} onChange={(e) => setBibleSearchQuery(e.target.value)} className="w-full bg-slate-50 border p-2 text-xs" /><button type="submit"><Search size={14} /></button></form>
              </div>
              <div className="flex-grow border rounded-xl bg-slate-50/50 overflow-y-auto p-3.5 space-y-1">
                {isBibleLoading ? (
                  <div className="text-center text-xs py-8 text-slate-400">Laster...</div>
                ) : bibleVerses.length > 0 ? (
                  bibleVerses.map(v => (
                    <div 
                      key={v.verse} 
                      id={`v-lesson-${v.verse}`}
                      onClick={() => toggleVerseSelection(v.verse)}
                      className={`group relative p-2 border-b cursor-pointer transition-all rounded-lg ${
                        selectedBibleVerses.includes(Number(v.verse)) || selectedBibleVerses.includes(v.verse) || highlightedBibleVerse === v.verse
                          ? 'bg-[#561291]/5 border border-[#561291]/20 shadow-sm' 
                          : 'hover:bg-slate-100 border border-transparent'
                      }`}
                    >
                      <p className="text-xs text-slate-700 leading-relaxed pr-6">
                        <span className="font-bold text-primary mr-1.5">{v.verse}</span>
                        {v.text}
                      </p>
                      {selectedBibleVerses.length === 0 && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); insertVerseToNotes(v); }} 
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-primary hover:bg-primary/10 rounded transition-all animate-fade-in"
                          title="Sett inn i notater"
                        >
                          <Send size={10} />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-xs py-8 text-slate-400">Ingen vers funnet.</div>
                )}
              </div>
              
              {/* Floating control bar for multi-verse selection */}
              {selectedBibleVerses.length > 0 && (
                <div className="bg-[#561291]/5 border border-[#561291]/20 p-3 rounded-xl flex items-center justify-between gap-2 shrink-0 animate-fade-in">
                  <div className="text-[11px] font-bold text-[#561291]">
                    {selectedBibleVerses.length} {selectedBibleVerses.length === 1 ? 'vers' : 'vers'} valgt
                  </div>
                  <div className="flex gap-1.5 text-[11px]">
                    <button 
                      onClick={() => setSelectedBibleVerses([])}
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium text-slate-500 hover:bg-slate-50 active:scale-[0.97] transition-all"
                    >
                      Nullstill
                    </button>
                    <button 
                      onClick={insertSelectedVersesToNotes}
                      className="px-3 py-1.5 bg-[#561291] text-white rounded-lg font-bold flex items-center gap-1 hover:bg-[#561291]/90 active:scale-[0.97] transition-all shadow-sm"
                    >
                      <Send size={10} />
                      <span>Legg til</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
