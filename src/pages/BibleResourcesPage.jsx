import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Search, ArrowLeft, ArrowRight, Copy, Check, RefreshCw, Sparkles, BookMarked, X,
  Trash2, Save, Globe, Video, FileText, Calendar, Compass, UserCheck, Flame, BookText, Settings
} from 'lucide-react';
import logo from '@/assets/logo.png';
import CmsText from '@/components/CmsText';
import { generateFastingPdf, generateIntercessionPdf } from '@/utils/pdfGenerator';
import { 
  BIBLE_BOOKS, TRANSLATIONS, STUDY_BIBLE_DATA, 
  parseBibleReference, findBibleBook, generateDynamicCommentary 
} from '@/lib/bibleData';

export default function BibleResourcesPage() {
  const navigate = useNavigate();
  const { language, toggleLanguage, user, cmsContent } = useApp();
  const isEn = language === 'en';

  // Navigation tab for the resource hub
  const [activeTab, setActiveTab] = useState('bible'); // bible, curriculums, video, fasting

  // Interactive Bible States (Same as BibleView)
  const [selectedBook, setSelectedBook] = useState(BIBLE_BOOKS.find(b => b.id === 'joh'));
  const [selectedChapter, setSelectedChapter] = useState(3);
  const [selectedTranslation, setSelectedTranslation] = useState('bibelselskap');
  const [searchQuery, setSearchQuery] = useState('');
  const [verses, setVerses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [highlightedVerse, setHighlightedVerse] = useState(null);
  const [testamentFilter, setTestamentFilter] = useState('all'); // all, GT, NT
  const topRef = useRef(null);
  const readerRef = useRef(null);
  const [previousReference, setPreviousReference] = useState(null);

  // Study Panel States
  const [showStudyPanel, setShowStudyPanel] = useState(false);
  const [studyTab, setStudyTab] = useState('overview'); // overview, commentary, cross, notes
  const [isGeneratingCommentary, setIsGeneratingCommentary] = useState(false);
  const [generatedCommentaries, setGeneratedCommentaries] = useState({});
  const [generationStep, setGenerationStep] = useState(0);

  // Multi-verse Selection States
  const [selectedVerses, setSelectedVerses] = useState([]);

  // Personal Study Notes States
  const [noteText, setNoteText] = useState('');
  const [noteSaveStatus, setNoteSaveStatus] = useState('idle'); // idle, loading, saving, saved, error
  const saveTimeoutRef = useRef(null);

  // Load notes for current book and chapter
  useEffect(() => {
    const loadNote = () => {
      if (!selectedBook) return;
      const refKey = `${selectedBook.id}_${selectedChapter}`;
      const cacheKey = `hkm-bible-note-${user?.uid || 'guest'}-${refKey}`;
      
      const cached = localStorage.getItem(cacheKey);
      setNoteText(cached || '');
      setNoteSaveStatus(cached ? 'saved' : 'idle');
    };

    loadNote();
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  }, [selectedBook, selectedChapter, user]);

  const handleSaveNote = (textToSave = noteText) => {
    if (!selectedBook) return;
    const refKey = `${selectedBook.id}_${selectedChapter}`;
    const cacheKey = `hkm-bible-note-${user?.uid || 'guest'}-${refKey}`;
    
    localStorage.setItem(cacheKey, textToSave);
    setNoteSaveStatus('saving');
    
    setTimeout(() => {
      setNoteSaveStatus('saved');
    }, 400);
  };

  const handleNoteChange = (e) => {
    const text = e.target.value;
    setNoteText(text);
    setNoteSaveStatus('idle');
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      handleSaveNote(text);
    }, 1500);
  };

  const handleClearNote = () => {
    if (!window.confirm(isEn ? "Are you sure you want to delete this note?" : "Er du sikker på at du vil slette notatet?")) return;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    const refKey = `${selectedBook.id}_${selectedChapter}`;
    const cacheKey = `hkm-bible-note-${user?.uid || 'guest'}-${refKey}`;
    localStorage.removeItem(cacheKey);
    setNoteText('');
    setNoteSaveStatus('idle');
  };

  // Reset verse selection when book or chapter changes
  useEffect(() => {
    setSelectedVerses([]);
  }, [selectedBook, selectedChapter]);

  const toggleVerseSelection = (verseNum) => {
    setHighlightedVerse(verseNum); // Sett denne som aktivt fokusvers for studier og kryssreferanser
    setSelectedVerses(prev => {
      if (prev.includes(verseNum)) {
        return prev.filter(num => num !== verseNum);
      } else {
        return [...prev, verseNum].sort((a, b) => a - b);
      }
    });
  };

  const handleBulkCopy = () => {
    if (selectedVerses.length === 0) return;
    const sortedVerses = [...selectedVerses].sort((a, b) => a - b);
    const targets = sortedVerses.map(num => verses.find(v => v.verse === num)).filter(Boolean);
    const combinedText = targets.map(v => `[${v.verse}] ${v.text.trim()}`).join(' ');
    const verseRange = sortedVerses.length === 1 ? `${sortedVerses[0]}` : `${sortedVerses[0]}-${sortedVerses[sortedVerses.length - 1]}`;
    const translationName = TRANSLATIONS.find(t => t.id === selectedTranslation)?.name || selectedTranslation.toUpperCase();
    
    const textToCopy = `"${combinedText}" — ${selectedBook.nor} ${selectedChapter}:${verseRange} (${translationName})`;
    navigator.clipboard.writeText(textToCopy);
    alert(isEn ? `${selectedVerses.length} verses copied!` : `${selectedVerses.length} vers kopiert!`);
    setSelectedVerses([]);
  };

  const handleSingleCopy = (verse) => {
    const textToCopy = `"${verse.text.trim()}" — ${selectedBook.nor} ${selectedChapter}:${verse.verse}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(verse.verse);
    setTimeout(() => setCopiedId(null), 1200);
  };

  const handleGenerateCommentary = () => {
    setIsGeneratingCommentary(true);
    setGenerationStep(0);
    
    const steps = isEn ? [
      "Searching the holy scriptures...",
      "Analyzing theological context...",
      "Consulting Greek & Hebrew texts...",
      "Drafting exegetical commentary...",
      "Finalizing commentary study..."
    ] : [
      "Søker i de hellige skrifter...",
      "Analyserer teologisk kontekst...",
      "Slår opp gresk og hebraisk grunntekst...",
      "Utarbeider eksegetisk kommentar...",
      "Ferdigstiller studiekommentar..."
    ];
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setGenerationStep(currentStep);
      } else {
        clearInterval(interval);
        const refKey = `${selectedBook.id}_${selectedChapter}`;
        const computed = generateDynamicCommentary(selectedBook, selectedChapter);
        setGeneratedCommentaries(prev => ({
          ...prev,
          [refKey]: computed
        }));
        setIsGeneratingCommentary(false);
        setStudyTab('overview');
      }
    }, 600);
  };

  const fetchBibleChapter = async () => {
    setIsLoading(true);
    setVerses([]);
    try {
      const bookIndex = BIBLE_BOOKS.findIndex(b => b.id === selectedBook.id);
      const bookNumber = bookIndex + 1;
      const url = `https://api.getbible.net/v2/${selectedTranslation}/${bookNumber}/${selectedChapter}.json`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Kunne ikke hente bibeldata');
      }

      const data = await response.json();
      setVerses(data.verses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBibleReference = (refString) => {
    if (!refString) return false;
    const parsedRef = parseBibleReference(refString);
    if (parsedRef) {
      const foundBook = findBibleBook(parsedRef.bookStr);
      if (foundBook) {
        // Lagre nåværende posisjon (inkludert aktivt vers) før vi navigerer
        const sourceVerse = highlightedVerse || (selectedVerses.length > 0 ? selectedVerses[selectedVerses.length - 1] : null);
        setPreviousReference({
          book: selectedBook,
          chapter: selectedChapter,
          verse: sourceVerse
        });

        setSelectedBook(foundBook);
        const clampedChapter = Math.max(1, Math.min(parsedRef.chapter, foundBook.chapters));
        setSelectedChapter(clampedChapter);
        
        if (parsedRef.verse) {
          setHighlightedVerse(parsedRef.verse);
        } else {
          setHighlightedVerse(null);
        }
        
        // Scroll leseren i fokus
        setTimeout(() => {
          if (readerRef.current) {
            readerRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);
        return true;
      }
    }
    return false;
  };

  const handleGoBackToReference = () => {
    if (!previousReference) return;
    setSelectedBook(previousReference.book);
    setSelectedChapter(previousReference.chapter);
    setHighlightedVerse(previousReference.verse);
    
    setTimeout(() => {
      if (readerRef.current) {
        readerRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
    
    setPreviousReference(null);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // 1. Prøv å laste direkte som en spesifikk bibelreferanse
    const success = loadBibleReference(searchQuery);
    if (success) {
      setSearchQuery('');
      return;
    }

    setIsLoading(true);
    setVerses([]);
    try {
      let cleanQuery = searchQuery.trim();
      BIBLE_BOOKS.forEach(book => {
        const norLower = book.nor.toLowerCase();
        if (cleanQuery.toLowerCase().startsWith(norLower)) {
          cleanQuery = cleanQuery.replace(new RegExp(book.nor, 'i'), book.eng);
        }
      });

      const url = `https://query.getbible.net/v2/${selectedTranslation}/${encodeURIComponent(cleanQuery)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Kunne ikke finne skriftstedet');
      }

      const data = await response.json();
      const keys = Object.keys(data);
      if (keys.length > 0) {
        const resultVerses = [];
        let detectedBook = null;
        let detectedChapter = 1;

        keys.forEach(key => {
          const item = data[key];
          if (item.verses) {
            resultVerses.push(...item.verses);
          }
          if (!detectedBook && item.book_name) {
            const found = BIBLE_BOOKS.find(b => 
              b.eng.toLowerCase() === item.book_name.toLowerCase() || 
              b.nor.toLowerCase() === item.book_name.toLowerCase()
            );
            if (found) {
              detectedBook = found;
              detectedChapter = item.chapter || 1;
            }
          }
        });

        if (resultVerses.length > 0) {
          setVerses(resultVerses);
          if (detectedBook) {
            setSelectedBook(detectedBook);
            setSelectedChapter(detectedChapter);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateChapter = (direction) => {
    setHighlightedVerse(null);
    if (direction === 'prev') {
      if (selectedChapter > 1) {
        setSelectedChapter(prev => prev - 1);
      } else {
        const currentIndex = BIBLE_BOOKS.findIndex(b => b.id === selectedBook.id);
        if (currentIndex > 0) {
          const prevBook = BIBLE_BOOKS[currentIndex - 1];
          setSelectedBook(prevBook);
          setSelectedChapter(prevBook.chapters);
        }
      }
    } else {
      if (selectedChapter < selectedBook.chapters) {
        setSelectedChapter(prev => prev + 1);
      } else {
        const currentIndex = BIBLE_BOOKS.findIndex(b => b.id === selectedBook.id);
        if (currentIndex < BIBLE_BOOKS.length - 1) {
          const nextBook = BIBLE_BOOKS[currentIndex + 1];
          setSelectedBook(nextBook);
          setSelectedChapter(1);
        }
      }
    }
    if (readerRef.current) {
      readerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetchBibleChapter();
  }, [selectedBook, selectedChapter, selectedTranslation]);

  useEffect(() => {
    if (highlightedVerse && verses.length > 0) {
      setTimeout(() => {
        const el = document.getElementById(`v-${highlightedVerse}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 400);
    }
  }, [highlightedVerse, verses]);

  const filteredBooks = BIBLE_BOOKS.filter(book => {
    if (testamentFilter === 'all') return true;
    return book.testament === testamentFilter;
  });

  const refKey = `${selectedBook.id}_${selectedChapter}`;
  const activeCommentary = generatedCommentaries[refKey] || STUDY_BIBLE_DATA[refKey];

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col font-sans text-slate-800" ref={topRef}>
      {/* Public Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-sm">
        <div className="flex justify-between items-center w-full px-4 sm:px-6 md:px-12 h-20 max-w-[1440px] mx-auto">
          <div className="font-serif text-xs min-[360px]:text-sm sm:text-lg md:text-xl lg:text-2xl text-primary font-bold cursor-pointer shrink-0 flex items-center gap-1.5 sm:gap-2.5" onClick={() => navigate('/')}>
            <img src={logo} alt="His Kingdom Prophets Logo" className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0" />
            <span className="hidden sm:inline">
              <CmsText slug="layout-logo-title" fallback="His Kingdom Prophets" />
            </span>
            <span className="inline sm:hidden">
              <CmsText slug="layout-logo-mobile-title" fallback="HKP" />
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="px-3 py-1.5 border border-[#561291]/20 hover:border-primary text-xs font-bold uppercase rounded-lg text-primary bg-[#561291]/5 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
            >
              <Globe size={13} />
              <span>{isEn ? 'EN' : 'NO'}</span>
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:text-primary-container transition-colors"
            >
              <ArrowLeft size={16} />
              <span>{isEn ? 'Back' : 'Tilbake'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-br from-[#3c096c] to-[#561291] text-white py-16 md:py-20 px-4 sm:px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(224,170,255,0.15),transparent)] pointer-events-none"></div>
        <div className="max-w-[1440px] mx-auto space-y-4 relative z-10 text-center sm:text-left">
          <CmsText 
            slug="resources-hero-tagline" 
            fallback="Offentlig studieportal" 
            as="span" 
            className="px-3.5 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-bold uppercase tracking-wider border border-white/15 inline-block" 
          />
          <CmsText 
            slug="resources-hero-title" 
            fallback="Bibelressurser og studieportal" 
            as="h1" 
            className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight" 
          />
          <CmsText 
            slug="resources-hero-desc" 
            fallback="Dyp bibelundervisning, interaktiv studiebibel og verktøy som ruster deg til din tjeneste. Utforsk våre åpne bibelressurser under." 
            as="p" 
            className="text-sm sm:text-base text-purple-100 max-w-2xl leading-relaxed" 
          />
        </div>
      </section>

      {/* Tabs Controller */}
      <section className="border-b border-slate-200 bg-white sticky top-20 z-30 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 flex space-x-8 overflow-x-auto whitespace-nowrap scrollbar-none h-16 items-center">
          {[
            { id: 'bible', fallback: '📖 Interaktiv studiebibel', icon: BookOpen },
            { id: 'curriculums', fallback: '📚 Fagplaner og studiehefter', icon: BookText },
            { id: 'video', fallback: '🎙️ Lyd- og videoundervisning', icon: Video },
            { id: 'fasting', fallback: '📜 Fastemanualer og bønneguider', icon: Flame }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 h-full px-2 text-sm font-bold border-b-2 transition-all relative ${
                  isActive 
                    ? 'border-primary text-primary font-extrabold' 
                    : 'border-transparent text-slate-500 hover:text-primary hover:border-primary/30'
                }`}
              >
                <Icon size={16} />
                <span>
                  <CmsText slug={`resources-tab-${tab.id}`} fallback={tab.fallback} />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Dynamic Tab Contents */}
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 py-10">
        
        {/* TAB 1: INTERACTIVE BIBLE & STUDY CENTER */}
        {activeTab === 'bible' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header info */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-bold text-primary flex items-center gap-2">
                  <Sparkles size={20} className="text-amber-500" />
                  <CmsText slug="resources-bible-title" fallback="Interaktiv studiebibel" />
                </h3>
                <CmsText 
                  slug="resources-bible-desc" 
                  fallback="Trykk på et hvilket som helst vers for å kopiere det. Åpne &quot;studiebibel&quot;-panelet for ferdige teologiske kommentarer, ordstudier og personlige notater." 
                  as="p" 
                  className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed" 
                />
              </div>
              
              <form onSubmit={handleSearch} className="w-full md:w-80 shrink-0">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={isEn ? "Search e.g. 'Genesis 1:1'..." : "Søk f.eks. '1. Mosebok 1:1'..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all shadow-inner"
                  />
                  <button type="submit" className="absolute left-3 top-0 bottom-0 my-auto text-primary cursor-pointer border-none bg-none p-0">
                    <Search size={14} />
                  </button>
                </div>
              </form>
            </div>

            {/* Reading Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Book selection */}
              <div className={`${showStudyPanel ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-6 lg:sticky lg:top-24`}>
                <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-5">
                  <h4 className="font-serif font-bold text-sm text-primary flex items-center gap-2 border-b border-slate-100 pb-3">
                    <BookMarked size={16} />
                    {isEn ? 'Book & Chapter' : 'Bok- og kapittelvelger'}
                  </h4>

                  {/* Translation Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Oversettelse</label>
                    <select
                      value={selectedTranslation}
                      onChange={(e) => setSelectedTranslation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {TRANSLATIONS.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Testament Filter Toggles */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-xl">
                    <button
                      onClick={() => setTestamentFilter('all')}
                      className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        testamentFilter === 'all' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-primary'
                      }`}
                    >
                      {isEn ? 'All' : 'Alle'}
                    </button>
                    <button
                      onClick={() => setTestamentFilter('GT')}
                      className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        testamentFilter === 'GT' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-primary'
                      }`}
                    >
                      GT
                    </button>
                    <button
                      onClick={() => setTestamentFilter('NT')}
                      className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        testamentFilter === 'NT' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-primary'
                      }`}
                    >
                      NT
                    </button>
                  </div>

                  {/* Books List (scrollable) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bibelbok</label>
                    <div className="h-56 overflow-y-auto border border-slate-100 rounded-xl bg-slate-50/50 p-2 space-y-0.5 scrollbar-thin">
                      {filteredBooks.map(book => (
                        <button
                          key={book.id}
                          onClick={() => {
                            setSelectedBook(book);
                            setSelectedChapter(1);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex justify-between items-center transition-all ${
                            selectedBook.id === book.id 
                              ? 'bg-primary/5 text-primary border border-primary/20 shadow-sm font-bold' 
                              : 'text-slate-600 hover:bg-slate-100 hover:text-primary'
                          }`}
                        >
                          <span>{book.nor}</span>
                          <span className="text-[9px] opacity-60 font-mono">{book.testament}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chapters Grid */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {isEn ? `Select Chapter (1 - ${selectedBook.chapters})` : `Velg kapittel (1 - ${selectedBook.chapters})`}
                    </label>
                    <div className="grid grid-cols-5 gap-1.5 max-h-32 overflow-y-auto p-1 scrollbar-thin">
                      {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(chap => (
                        <button
                          key={chap}
                          onClick={() => setSelectedChapter(chap)}
                          className={`h-8 w-full rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                            selectedChapter === chap 
                              ? 'bg-primary text-white shadow font-extrabold' 
                              : 'bg-slate-50 text-slate-600 border border-slate-200/50 hover:bg-slate-100'
                          }`}
                        >
                          {chap}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Column: Reading Panel */}
              <div className={`${showStudyPanel ? 'lg:col-span-5' : 'lg:col-span-8'} space-y-6 scroll-mt-24`} ref={readerRef}>
                <div className="bg-white border border-slate-200/60 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between min-h-[500px]">
                  
                  {/* Reading Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                    <button 
                      onClick={() => navigateChapter('prev')}
                      className="p-2 bg-slate-50 text-primary border border-slate-200/60 rounded-xl hover:bg-slate-100 active:scale-[0.97] transition-all cursor-pointer"
                    >
                      <ArrowLeft size={16} />
                    </button>

                    <div className="text-center flex flex-col items-center">
                      <h2 className="font-serif font-extrabold text-lg md:text-xl text-primary leading-tight">
                        {selectedBook.nor} {selectedChapter}
                      </h2>
                      <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase font-mono mt-1 block">
                        {TRANSLATIONS.find(t => t.id === selectedTranslation)?.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowStudyPanel(!showStudyPanel)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all active:scale-[0.97] cursor-pointer ${
                          showStudyPanel 
                            ? 'bg-primary text-white border-primary shadow' 
                            : 'bg-slate-50 text-primary border-slate-200/60 hover:bg-slate-100'
                        }`}
                      >
                        <Sparkles size={12} className={showStudyPanel ? 'animate-pulse' : ''} />
                        <span className="hidden sm:inline">{showStudyPanel ? (isEn ? "Hide study" : "Lukk studie") : (isEn ? "Study Bible" : "Studiebibel")}</span>
                      </button>

                      <button 
                        onClick={() => navigateChapter('next')}
                        className="p-2 bg-slate-50 text-primary border border-slate-200/60 rounded-xl hover:bg-slate-100 active:scale-[0.97] transition-all cursor-pointer"
                      >
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Back to previous reference button */}
                  {previousReference && (
                    <div className="mb-4 flex animate-fade-in justify-start select-none">
                      <button
                        onClick={handleGoBackToReference}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-[#2c6e91] hover:from-[#153b52] hover:to-[#225672] text-white shadow-md shadow-primary/10 rounded-full text-xs font-extrabold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] cursor-pointer"
                      >
                        <ArrowLeft size={12} className="stroke-[3]" />
                        <span>
                          Tilbake til {previousReference.book.nor} {previousReference.chapter}{previousReference.verse ? `:${previousReference.verse}` : ''}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Reading Body */}
                  <div className="flex-grow relative">
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 min-h-[300px]">
                          <RefreshCw className="text-primary animate-spin" size={28} />
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Henter skriftsteder...</p>
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-2 select-text"
                        >
                          {verses.map((verse) => {
                            const isSelected = selectedVerses.includes(verse.verse);
                            const isHighlighted = highlightedVerse === verse.verse;
                            return (
                              <div
                                key={verse.verse}
                                id={`v-${verse.verse}`}
                                onClick={() => toggleVerseSelection(verse.verse)}
                                className={`group py-1.5 px-3 rounded-lg cursor-pointer transition-all flex items-start gap-3 select-text ${
                                  isSelected 
                                    ? 'bg-primary/5 border-l-4 border-primary' 
                                    : isHighlighted
                                      ? 'bg-amber-50 border-l-4 border-amber-500'
                                      : 'hover:bg-slate-50/80 border-l-4 border-transparent'
                                }`}
                              >
                                <span className={`text-[10px] font-bold font-mono shrink-0 mt-0.5 w-5 text-center ${
                                  isSelected ? 'text-primary' : isHighlighted ? 'text-amber-600' : 'text-slate-400'
                                }`}>
                                  {verse.verse}
                                </span>
                                <p className={`text-sm leading-relaxed flex-grow text-slate-700 font-sans ${
                                  isSelected ? 'text-primary font-medium' : ''
                                }`}>
                                  {verse.text}
                                </p>
                                
                                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all shrink-0">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSingleCopy(verse);
                                    }}
                                    className="p-1 text-slate-400 hover:text-primary hover:bg-slate-100 rounded transition-all"
                                    title={isEn ? "Copy verse" : "Kopier vers"}
                                  >
                                    {copiedId === verse.verse ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Multi-verse Action Banner */}
                  {selectedVerses.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4 text-xs font-semibold text-slate-700 shadow-inner shrink-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-5 bg-primary text-white rounded-full flex items-center justify-center font-bold font-mono text-[10px]">
                          {selectedVerses.length}
                        </span>
                        <span>{isEn ? 'selected verses' : 'vers valgt'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleBulkCopy}
                          className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98] transition-all flex items-center gap-1.5 font-bold shadow-sm"
                        >
                          <Copy size={12} />
                          <span>{isEn ? 'Copy' : 'Kopier'}</span>
                        </button>
                        <button
                          onClick={() => setSelectedVerses([])}
                          className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 rounded-lg transition-all text-slate-500 font-bold"
                        >
                          {isEn ? 'Clear' : 'Avbryt'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Right Column: Study Panel (when open) */}
              {showStudyPanel && (
                <div className="lg:col-span-4 space-y-6 animate-in slide-in-from-right-8 duration-300 lg:sticky lg:top-24">
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex flex-col min-h-[500px]">
                    
                    {/* Panel Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <h4 className="font-serif font-bold text-sm text-primary flex items-center gap-1.5">
                        <Sparkles size={16} className="text-amber-500" />
                        {isEn ? 'Theological Study Center' : 'Studie- og kommentarer'}
                      </h4>
                      <button 
                        onClick={() => setShowStudyPanel(false)}
                        className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Tab Selection inside Study Panel */}
                    <div className="grid grid-cols-4 gap-1 bg-slate-50 p-1 rounded-xl mb-4 shrink-0">
                      {[
                        { id: 'overview', name: isEn ? 'Overview' : 'Oversikt' },
                        { id: 'commentary', name: isEn ? 'Themes' : 'Temaer' },
                        { id: 'cross', name: isEn ? 'Cross-Ref' : 'Kryss-ref' },
                        { id: 'notes', name: isEn ? 'My Notes' : 'Notater' }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => setStudyTab(t.id)}
                          className={`py-1.5 rounded-lg text-[9px] font-bold transition-all truncate ${
                            studyTab === t.id ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-primary'
                          }`}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>

                    {/* Active study content */}
                    <div className="flex-grow overflow-y-auto max-h-[420px] scrollbar-thin text-xs text-slate-600 leading-relaxed font-sans pr-1">
                      
                      {activeCommentary ? (
                        <>
                          {studyTab === 'overview' && (
                            <div className="space-y-4 animate-in fade-in duration-200">
                              <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl space-y-2">
                                <h5 className="font-bold text-primary text-[13px]">{activeCommentary.overview.title}</h5>
                                <p className="text-slate-600 text-[11px] leading-relaxed italic">{activeCommentary.overview.context}</p>
                              </div>
                              <div className="space-y-2">
                                <span className="font-bold text-slate-800 uppercase tracking-wider text-[9px] block">Sentrale Temaer</span>
                                <ul className="space-y-1.5">
                                  {activeCommentary.overview.themes.map((theme, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <span className="mt-1 h-1.5 w-1.5 bg-[#561291] rounded-full shrink-0" />
                                      <span className="text-[11px] text-slate-600">{theme}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {studyTab === 'commentary' && (
                            <div className="space-y-4 animate-in fade-in duration-200">
                              {activeCommentary.commentary.map((comm, idx) => (
                                <div key={idx} className="border-b border-slate-100 pb-3 last:border-0 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <h5 className="font-serif font-bold text-primary text-[12px]">{comm.title}</h5>
                                    <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">{comm.verses}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 leading-relaxed">{comm.text}</p>
                                </div>
                              ))}
                              
                              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 space-y-2">
                                <h6 className="font-bold text-amber-800 text-[11px] uppercase tracking-wider">Gresk/Hebraisk ordstudie</h6>
                                {activeCommentary.wordStudies?.map((word, idx) => (
                                  <div key={idx} className="space-y-0.5 text-[11px]">
                                    <p className="font-bold text-slate-800">{word.word} ({word.language})</p>
                                    <p className="text-slate-600">{word.meaning}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {studyTab === 'cross' && (
                            <div className="space-y-3 animate-in fade-in duration-200">
                              <span className="font-bold text-slate-800 uppercase tracking-wider text-[9px] block">Tilknyttede skriftsteder</span>
                              {activeCommentary.crossReferences.map((ref, idx) => (
                                <div 
                                  key={idx} 
                                  className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl space-y-1 hover:border-primary/20 transition-all cursor-pointer" 
                                  onClick={() => {
                                    loadBibleReference(ref.ref);
                                    // Lukk studiepanelet på mobil slik at skriften er umiddelbart synlig
                                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                                      setShowStudyPanel(false);
                                    }
                                  }}
                                >
                                  <p className="font-bold text-primary text-[11px] flex items-center gap-1.5">
                                    <BookOpen size={11} /> {ref.ref}
                                  </p>
                                  <p className="text-slate-500 text-[10px] leading-relaxed">{ref.desc}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {(studyTab === 'overview' || studyTab === 'commentary' || studyTab === 'cross') && (
                            <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
                              <BookOpen size={36} className="text-slate-300" />
                              <div className="space-y-1">
                                <p className="font-bold text-slate-700 text-xs">Kommentarer er uforberedt</p>
                                <p className="text-[10px] text-slate-400 max-w-[200px] leading-relaxed">
                                  {isEn
                                    ? "We have no static teologisk study notes for this chapter. Click below to generate an AI teologisk outline."
                                    : "Det er ingen forhåndslagrede kommentarer for dette kapittelet. Generer en ny kommentar under."}
                                </p>
                              </div>
                              <button
                                onClick={handleGenerateCommentary}
                                disabled={isGeneratingCommentary}
                                className="px-4 py-2 bg-primary text-white font-bold rounded-xl text-[10px] uppercase tracking-wider hover:bg-primary-container active:scale-[0.98] transition-all flex items-center gap-1 shadow-sm shrink-0"
                              >
                                <Sparkles size={11} />
                                {isEn ? "Generate Study Notes" : "Generer studiekommentar"}
                              </button>
                            </div>
                          )}
                        </>
                      )}

                      {studyTab === 'notes' && (
                        <div className="space-y-3 h-full flex flex-col animate-in fade-in duration-200">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                            <span>{isEn ? "Notes for" : "Notater for"} {selectedBook.nor} {selectedChapter}</span>
                            <span className="flex items-center gap-1 font-mono">
                              {noteSaveStatus === 'saving' && <span className="text-amber-600 animate-pulse">Lagrer...</span>}
                              {noteSaveStatus === 'saved' && <span className="text-green-600">✓ Lagret lokalt</span>}
                              {noteSaveStatus === 'loading' && <span>Laster...</span>}
                              {noteSaveStatus === 'idle' && <span>Ulagret</span>}
                            </span>
                          </div>

                          <textarea
                            value={noteText}
                            onChange={handleNoteChange}
                            placeholder={isEn ? "Write down your theological reflections here..." : "Skriv dine refleksjoner, tolkninger eller åpenbaringer her..."}
                            className="w-full flex-grow h-40 bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all font-sans text-slate-700 leading-relaxed resize-none shadow-inner"
                          />

                          <div className="grid grid-cols-2 gap-2 shrink-0">
                            <button
                              onClick={() => handleSaveNote()}
                              className="py-2 bg-primary text-white font-bold rounded-lg text-[10px] uppercase tracking-wider hover:bg-primary-container active:scale-[0.97] transition-all flex items-center justify-center gap-1 shadow-sm"
                            >
                              <Save size={10} />
                              {isEn ? "Save now" : "Lagre nå"}
                            </button>
                            <button
                              onClick={handleClearNote}
                              disabled={!noteText}
                              className="py-2 border border-red-200 hover:bg-red-50 hover:text-red-700 text-slate-500 font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                            >
                              <Trash2 size={10} />
                              {isEn ? "Delete" : "Slett"}
                            </button>
                          </div>

                          {/* Cloud Sync Call to Action */}
                          <div className="mt-2 p-3 bg-purple-50/50 border border-purple-100 rounded-xl space-y-1.5">
                            <p className="font-bold text-primary text-[10px] flex items-center gap-1">
                              <Flame size={12} className="text-amber-500 animate-pulse" />
                              {isEn ? "Cloud Sync & Study Portal" : "Vil du synkronisere notatene dine?"}
                            </p>
                            <p className="text-[9px] text-slate-500 leading-relaxed">
                              {isEn
                                ? "Notes are currently stored safely in your browser cache. Apply for admission or log in to sync notes to your permanent disciple account in the cloud!"
                                : "Notater lagres lokalt i nettleseren din. Søk opptak eller logg inn for å synkronisere dem permanent til din disippelkonto i skyen!"}
                            </p>
                            <button
                              onClick={() => navigate('/login')}
                              className="w-full py-1.5 bg-white border border-[#561291]/20 hover:border-primary text-primary font-bold rounded-lg text-[9px] uppercase tracking-wider transition-all shadow-sm"
                            >
                              {isEn ? "Log In / Register" : "Logg Inn / Søk Opptak"}
                            </button>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Generating loader */}
                    {isGeneratingCommentary && (
                      <div className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center space-y-4 p-6 text-center animate-in fade-in duration-300">
                        <RefreshCw className="text-primary animate-spin" size={28} />
                        <div className="space-y-1">
                          <p className="font-bold text-slate-700 text-xs">Forbereder teologisk forskning...</p>
                          <p className="text-[10px] text-slate-400 font-mono italic animate-pulse">
                            {isEn ? "Generating step: " : "Fase: "} {generationStep + 1}/5
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* TAB 2: CURRICULUMS & OUTLINES */}
        {activeTab === 'curriculums' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <CmsText 
                slug="resources-curriculums-title" 
                fallback="Studieplaner og teologiske fagplaner" 
                as="h3" 
                className="font-serif text-2xl font-bold text-primary" 
              />
              <CmsText 
                slug="resources-curriculums-desc" 
                fallback="Vi forener dyp akademisk eksegese med Den Hellige Ånds gaverolle. Her er en oversikt over studieheftene og modulene i våre tre hovedlinjer." 
                as="p" 
                className="text-sm text-slate-500 leading-relaxed" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  code: 'PROP 101',
                  title: isEn ? 'Prophetic Equipment & Character' : 'Innføring i den profetiske tjeneste',
                  desc: isEn 
                    ? 'Understand the ethics, spiritual maturity, and character required to carry revelation. Covers dreams, visions, and biblical prophets.' 
                    : 'Forstå etikken, den åndelige karakteren og modenheten som kreves for å bære åpenbaringskunnskap. Moduler om drømmetydning og bibelsk profeti.',
                  modules: isEn 
                    ? ['Ethics of the Prophet', 'Visions and Dreams', 'Spiritual Discernment', 'Prophecy in the Local Church'] 
                    : ['Den profetiske etikk og karakter', 'Tyde syner og drømmer', 'Åndelig skjelneevne og prøving', 'Betjening i menigheten'],
                  color: 'from-purple-500 to-indigo-600'
                },
                {
                  code: 'BIBLE 301',
                  title: isEn ? 'Advanced Hermeneutics & Exegesis' : 'Avansert hermeneutikk og tolkning',
                  desc: isEn 
                    ? 'Deep-dive into historic covenant theology, typologies, and eschatological frameworks. Learn sound exegesis using original text principles.' 
                    : 'Gå dypt inn i historisk paktsteologi, typologier og eskatologiske modeller. Lær sunn bibeltolkning og skriftgransking ut fra grunntekstens prinsipper.',
                  modules: isEn 
                    ? ['Historical-Grammatical Method', 'Covenant Theology Foundations', 'Eschatology & Typologies', 'Old Testament Exegesis'] 
                    : ['Historisk-grammatisk metode', 'Paktsteologiens røtter', 'Eskatologiske typologier', 'Gammeltestamentlig eksegese'],
                  color: 'from-indigo-600 to-blue-600'
                },
                {
                  code: 'MIN 201',
                  title: isEn ? 'Pastoral Care & Inner Healing' : 'Sjelesorg, bønn og indre helbredelse',
                  desc: isEn 
                    ? 'Equipping disciples for inner restoration, spiritual warfare, and prophetic counseling. Walk in the power of the Spirit to heal broken hearts.' 
                    : 'Utruster disipler til indre gjenopprettelse, sjelesorg under Åndens ledelse, og bønnetjeneste. Lær å vandre i Åndens kraft til å helbrede knuste hjerter.',
                  modules: isEn 
                    ? ['Biblical Soul Care', 'Theology of Inner Healing', 'Deliverance and Authority', 'Prophetic Counseling Ethics'] 
                    : ['Bibelsk sjelesorg og samtale', 'Prinsipper for indre helbredelse', 'Åndelig autoritet og frihet', 'Etikk i bønnetjenesten'],
                  color: 'from-purple-600 to-pink-600'
                }
              ].map(item => (
                <div key={item.code} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 flex flex-col justify-between hover:shadow-md hover:border-primary/20 transition-all duration-300 group">
                  <div className="space-y-4">
                    <span className={`inline-block px-3 py-1 bg-gradient-to-r ${item.color} text-white font-mono text-[10px] font-bold uppercase rounded-lg shadow-sm`}>
                      {item.code}
                    </span>
                    <h4 className="font-serif text-lg font-bold text-primary group-hover:text-primary-container transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {item.desc}
                    </p>
                    
                    <div className="space-y-2 border-t border-slate-100 pt-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kjernemoduler</span>
                      <ul className="space-y-1.5">
                        {item.modules.map((mod, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                            <span className="p-0.5 bg-green-50 text-green-600 rounded-full shrink-0"><Check size={10} /></span>
                            <span>{mod}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(isEn ? '/admission' : '/opptak')}
                    className="w-full mt-6 py-2.5 bg-slate-50 hover:bg-primary hover:text-white border border-slate-200 hover:border-primary text-primary font-bold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Calendar size={13} />
                    <span>{isEn ? 'Apply / Request Info' : 'Søk studieplass'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: VIDEO & AUDIO LECTURES */}
        {activeTab === 'video' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <CmsText 
                slug="resources-video-title" 
                fallback="Lyd- og videoundervisning" 
                as="h3" 
                className="font-serif text-2xl font-bold text-primary" 
              />
              <CmsText 
                slug="resources-video-desc" 
                fallback="Få tilgang til åpne seminarer, live-strømmer av bønnesamlinger, og smakebiter av vår ukentlige video-undervisning." 
                as="p" 
                className="text-sm text-slate-500 leading-relaxed" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Feature Video 1 */}
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group">
                <div className="relative aspect-video bg-slate-950 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&q=80&w=800" 
                    alt="Prophetic Lecture" 
                    className="w-full h-full object-cover opacity-60 group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 bg-amber-500 text-white font-bold rounded text-[9px] uppercase tracking-wider">Åpent seminar</span>
                      <h4 className="font-serif font-bold text-white text-base leading-tight">
                        {isEn ? 'Understanding Prophetic Revelation & Ethics' : 'Å forstå profetisk åpenbaring og etikk'}
                      </h4>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {isEn
                      ? "A comprehensive 45-minute introductory lecture by Apostle David Hansen explaining the biblical foundation of the prophetic gift in the early church, and how it must operate under sound theological testing."
                      : "En 45-minutters introduksjonsforelesning med Apostel David Hansen som tar for seg det bibelske fundamentet for den profetiske gave, og hvordan gaverollen må underlegges sunn teologisk testing og karakter."}
                  </p>
                  <button
                    onClick={() => navigate(user ? '/student/video' : '/login')}
                    className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Video size={13} />
                    <span>{isEn ? 'Watch Lecture (45 min)' : 'Se forelesning (45 min)'}</span>
                  </button>
                </div>
              </div>

              {/* Feature Video 2 */}
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group">
                <div className="relative aspect-video bg-slate-950 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&q=80&w=800" 
                    alt="Covenant theology" 
                    className="w-full h-full object-cover opacity-60 group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 bg-indigo-600 text-white font-bold rounded text-[9px] uppercase tracking-wider">Teologisk dypdykk</span>
                      <h4 className="font-serif font-bold text-white text-base leading-tight">
                        {isEn ? 'Introduction to Covenant Theology & Typology' : 'Introduksjon til paktsteologi og typologi'}
                      </h4>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {isEn
                      ? "Learn how the Old Testament promises and shadows point seamlessly to Christ in the New Testament. An introductory exegesis class covering Abrahamic and New Covenant typologies."
                      : "Lær hvordan det gamle testamentets skygger og løfter peker fram mot Kristus i det nye testamentet. En innføringsklasse i paktsteologi som dekker abrahamspakten og den nye pakt."}
                  </p>
                  <button
                    onClick={() => navigate(user ? '/student/video' : '/login')}
                    className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Video size={13} />
                    <span>{isEn ? 'Watch Lecture (35 min)' : 'Se forelesning (35 min)'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FASTING & PRAYER MANUALS */}
        {activeTab === 'fasting' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <CmsText 
                slug="resources-fasting-title" 
                fallback="Fastemanualer og bønneguider" 
                as="h3" 
                className="font-serif text-2xl font-bold text-primary" 
              />
              <CmsText 
                slug="resources-fasting-desc" 
                fallback="Praktiske, bibelske verktøy som ruster deg til åndelig disiplin, bibelske fasteperioder, og profetisk forbønn under Åndens ledelse." 
                as="p" 
                className="text-sm text-slate-500 leading-relaxed" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  id: 'fasting',
                  titleSlug: 'pdf-fasting-card-title',
                  titleFallback: isEn ? 'The Biblical Fasting Manual (PDF)' : 'Bibelsk faste og åndelig disiplin (PDF)',
                  descSlug: 'pdf-fasting-card-desc',
                  descFallback: isEn
                    ? 'A detailed 14-page guide explaining the theology, health boundaries, and spiritual focus of Christian fasting. Includes daily scripture readings.'
                    : 'En grundig 14-siders guide som forklarer teologien, de helsemessige rammene, og det åndelige fokuset ved kristen faste. Inkluderer faste-skriftsteder.',
                  bullets: [
                    { slug: 'pdf-fasting-card-bullet1', fallback: isEn ? 'Theology of Fasting (Matthew 6, Isaiah 58)' : 'Faste-teologi (Matteus 6 og Jesaja 58)' },
                    { slug: 'pdf-fasting-card-bullet2', fallback: isEn ? 'Practical health and hydration guidelines' : 'Praktiske helse- og væskeråd' },
                    { slug: 'pdf-fasting-card-bullet3', fallback: isEn ? 'Fasting for revelation and breakthrough' : 'Faste for åpenbaring og gjennombrudd' }
                  ],
                  icon: Flame
                },
                {
                  id: 'intercession',
                  titleSlug: 'pdf-intercession-card-title',
                  titleFallback: isEn ? 'Prophetic Intercession & Prayer Shield' : 'Profetisk forbønn og bønneskjold',
                  descSlug: 'pdf-intercession-card-desc',
                  descFallback: isEn
                    ? 'Learn how to pray under the leading of the Holy Spirit, establish prayer watches in your local church, and pray effectively for missions.'
                    : 'Lær å be strategisk under Helligåndens ledelse, etablere bønnevakter i menigheten, og be målrettet for misjonsfeltet og profetiske tjenester.',
                  bullets: [
                    { slug: 'pdf-intercession-card-bullet1', fallback: isEn ? 'Hearing God in prayer watches' : 'Høre Guds stemme under bønnevakten' },
                    { slug: 'pdf-intercession-card-bullet2', fallback: isEn ? 'Developing spiritual authority' : 'Åndelig autoritet og posisjonering' },
                    { slug: 'pdf-intercession-card-bullet3', fallback: isEn ? 'Establishing a prayer shield for your ministry' : 'Sette opp et bønneskjold for din tjeneste' }
                  ],
                  icon: Compass
                }
              ].map((manual, index) => {
                const Icon = manual.icon;
                return (
                  <div key={index} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 sm:p-8 flex flex-col justify-between hover:shadow-md hover:border-primary/20 transition-all duration-300 group relative animate-in fade-in-50">
                    
                    {/* Admin "Rediger PDF" Floating Shortcut Button */}
                    {['admin', 'superadmin', 'teacher'].includes(user?.role) && (
                      <button
                        onClick={() => navigate(`/admin/cms?category=documents&expand=${manual.id}`)}
                        className="absolute top-4 right-4 z-10 p-2 bg-gradient-to-r from-[#d17d39] to-[#bd4f2a] hover:from-[#bd4f2a] hover:to-[#a03e1e] text-white rounded-full transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 text-[10px] font-bold px-3 py-1.5 uppercase font-sans tracking-wide"
                        title="Rediger hefteinnhold og filer i CMS"
                      >
                        <Settings size={12} />
                        <span>Rediger PDF</span>
                      </button>
                    )}

                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 text-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <Icon size={22} className="text-[#561291]" />
                      </div>
                      <h4 className="font-serif text-lg font-bold text-primary group-hover:text-[#561291] transition-colors">
                        <CmsText slug={manual.titleSlug} fallback={manual.titleFallback} />
                      </h4>
                      <CmsText slug={manual.descSlug} fallback={manual.descFallback} as="p" className="text-xs text-slate-500 leading-relaxed" />

                      <ul className="space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600 font-medium">
                        {manual.bullets.map((b, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="p-0.5 bg-purple-50 text-primary rounded-full shrink-0"><Check size={10} /></span>
                            <CmsText slug={b.slug} fallback={b.fallback} />
                          </li>
                        ))}
                      </ul>
                    </div>

                    {index === 0 ? (
                      cmsContent?.['pdf_fasting_url'] ? (
                        <a
                          href={cmsContent['pdf_fasting_url']}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full mt-6 py-2.5 bg-primary hover:bg-[#561291] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm font-sans select-none text-center animate-in"
                        >
                          <FileText size={13} />
                          <span>{isEn ? 'Download Resources' : 'Last ned studiehefte'}</span>
                        </a>
                      ) : (
                        <button
                          onClick={() => generateFastingPdf(cmsContent, language)}
                          className="w-full mt-6 py-2.5 bg-primary hover:bg-[#561291] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm font-sans select-none text-center animate-in"
                        >
                          <FileText size={13} />
                          <span>{isEn ? 'Download Resources' : 'Last ned studiehefte'}</span>
                        </button>
                      )
                    ) : (
                      cmsContent?.['pdf_intercession_url'] ? (
                        <a
                          href={cmsContent['pdf_intercession_url']}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full mt-6 py-2.5 bg-primary hover:bg-[#561291] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm font-sans select-none text-center animate-in"
                        >
                          <FileText size={13} />
                          <span>{isEn ? 'Download Resources' : 'Last ned studiehefte'}</span>
                        </a>
                      ) : (
                        <button
                          onClick={() => generateIntercessionPdf(cmsContent, language)}
                          className="w-full mt-6 py-2.5 bg-primary hover:bg-[#561291] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm font-sans select-none text-center animate-in"
                        >
                          <FileText size={13} />
                          <span>{isEn ? 'Download Resources' : 'Last ned studiehefte'}</span>
                        </button>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* Flytende gå-tilbake-knapp sentrert nederst på skjermen */}
      <AnimatePresence>
        {previousReference && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-50 select-none pointer-events-auto"
          >
            <button
              onClick={handleGoBackToReference}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-[#2c6e91] hover:from-[#153b52] hover:to-[#225672] text-white shadow-xl shadow-primary/25 rounded-full text-xs font-extrabold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.95] cursor-pointer border-2 border-white/20 backdrop-blur-sm"
            >
              <ArrowLeft size={14} className="stroke-[3] animate-pulse" />
              <span>
                Tilbake til {previousReference.book.nor} {previousReference.chapter}{previousReference.verse ? `:${previousReference.verse}` : ''}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="w-full py-12 px-4 sm:px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 bg-tertiary text-white">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <CmsText slug="landing-footer-title" fallback="His Kingdom Prophets" as="div" className="font-serif text-lg font-bold text-on-tertiary" />
          <CmsText slug="landing-footer-copyright" fallback="© 2026 His Kingdom Prophets. Alle rettigheter reservert. Utrustning av profetiske tjenester for menigheten." as="p" className="text-xs text-on-tertiary opacity-80 max-w-md" />
        </div>
        <nav className="flex flex-wrap justify-center gap-6 text-xs text-center">
          <Link className="text-on-tertiary-container hover:text-on-tertiary transition-opacity" to="/privacy">
            <CmsText slug="landing-footer-link-privacy" fallback="Personvern" />
          </Link>
          <Link className="text-on-tertiary-container hover:text-on-tertiary transition-opacity" to="/terms">
            <CmsText slug="landing-footer-link-terms" fallback="Betingelser" />
          </Link>
          <Link className="text-on-tertiary-container hover:text-on-tertiary transition-opacity" to="/accessibility">
            <CmsText slug="landing-footer-link-accessibility" fallback="Tilgjengelighet" />
          </Link>
          <Link className="text-on-tertiary-container hover:text-on-tertiary transition-opacity" to="/support">
            <CmsText slug="landing-footer-link-support" fallback="Kontakt Support" />
          </Link>
        </nav>
      </footer>
    </div>
  );
}
