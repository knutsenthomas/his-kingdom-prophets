import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Search, ArrowLeft, ArrowRight, Share2, Copy, Send, Check, RefreshCw, Sparkles, BookMarked
} from 'lucide-react';

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

const TRANSLATIONS = [
  { id: 'bibelselskap', name: 'Norsk Bokmål (1930)' },
  { id: 'norsmb', name: 'Norsk Nynorsk (1921)' },
  { id: 'web', name: 'English (World English Bible)' },
  { id: 'kjv', name: 'English (King James Version)' },
];

export default function BibleView() {
  const navigate = useNavigate();
  const { showToast, sendAssistantMessage } = useApp();
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

  // Load verses when book, chapter, or translation changes
  useEffect(() => {
    fetchBibleChapter();
  }, [selectedBook, selectedChapter, selectedTranslation]);

  const fetchBibleChapter = async () => {
    setIsLoading(true);
    setVerses([]);
    try {
      const refString = `${selectedBook.eng} ${selectedChapter}`;
      const url = `https://query.getbible.net/v2/${selectedTranslation}/${encodeURIComponent(refString)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Kunne ikke hente bibeldata');
      }

      const data = await response.json();
      // getbible returnerer en nøkkel per kapittel, vi henter den første
      const keys = Object.keys(data);
      if (keys.length > 0) {
        const chapterData = data[keys[0]];
        setVerses(chapterData.verses || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Klarte ikke å laste bibelkapittelet. Sjekk internettforbindelsen.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setVerses([]);
    try {
      // getbible støtter å søke etter referanser som "John 3:16" eller "Salmene 23"
      // Vi prøver å oversette norske boknavn i søket til engelsk
      let cleanQuery = searchQuery.trim();
      
      // Enkel norsk-til-engelsk erstatning for søk
      BIBLE_BOOKS.forEach(book => {
        const norLower = book.nor.toLowerCase();
        const queryLower = cleanQuery.toLowerCase();
        if (queryLower.startsWith(norLower)) {
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
            // Prøv å finne boken i vår liste
            const found = BIBLE_BOOKS.find(b => b.eng.toLowerCase() === item.book_name.toLowerCase() || b.nor.toLowerCase() === item.book_name.toLowerCase());
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
          showToast('Søk fullført!');
        } else {
          showToast('Ingen vers funnet for dette søket.');
        }
      } else {
        showToast('Fant ikke skriftstedet. Prøv f.eks. "Johannes 3:16" eller "Salme 23".');
      }
    } catch (err) {
      console.error(err);
      showToast('Fant ikke skriftstedet. Sjekk stavelsen og formatet (f.eks. "Johannes 3:16").');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (verse) => {
    const textToCopy = `"${verse.text.trim()}" — ${selectedBook.nor} ${verse.chapter}:${verse.verse} (${TRANSLATIONS.find(t => t.id === selectedTranslation)?.name})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(verse.verse);
    showToast('Kopiert til utklippstavle!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareToChat = (verse) => {
    const shareMessage = `Her er et kraftfullt skriftsted jeg leste i Bibelen:\n\n*"${verse.text.trim()}"*\n— **${selectedBook.nor} ${verse.chapter}:${verse.verse}** (${TRANSLATIONS.find(t => t.id === selectedTranslation)?.name})`;
    
    // Save to localStorage for the Community Chat View
    localStorage.setItem('hkm-pending-chat-message', shareMessage);
    showToast('Klar til å deles! Sender deg til bønnefellesskapet...');
    
    setTimeout(() => {
      navigate('/student/chat');
    }, 1200);
  };

  const handleSendToAssistant = (verse) => {
    const assistantPrompt = `Jeg leste akkurat ${selectedBook.nor} ${verse.chapter}:${verse.verse} som sier: "${verse.text.trim()}". Kan du gi meg en dypere teologisk og profetisk forklaring av dette skriftstedet og hva det betyr for oss i dag?`;
    
    sendAssistantMessage(assistantPrompt);
    showToast('Sendt til HKM Assistent! Åpne chatten nede til høyre.');
    
    // Dispatch custom event to automatically open the chat panel
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('hkm-open-chat'));
    }, 500);
  };

  const navigateChapter = (direction) => {
    if (direction === 'prev') {
      if (selectedChapter > 1) {
        setSelectedChapter(prev => prev - 1);
      } else {
        // Gå til forrige bok hvis mulig
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
        // Gå til neste bok hvis mulig
        const currentIndex = BIBLE_BOOKS.findIndex(b => b.id === selectedBook.id);
        if (currentIndex < BIBLE_BOOKS.length - 1) {
          const nextBook = BIBLE_BOOKS[currentIndex + 1];
          setSelectedBook(nextBook);
          setSelectedChapter(1);
        }
      }
    }
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredBooks = BIBLE_BOOKS.filter(book => {
    if (testamentFilter === 'all') return true;
    return book.testament === testamentFilter;
  });

  return (
    <main className="flex-grow p-4 md:p-10 space-y-8 overflow-x-hidden" ref={topRef}>
      
      {/* Header and navigation */}
      <section className="space-y-3">
        <nav className="flex items-center gap-2 text-xs font-semibold text-outline">
          <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/student/dashboard')}>Hjem</span>
          <span>/</span>
          <span className="text-primary font-bold">Bibelen</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary flex items-center gap-2.5">
              <BookOpen className="text-primary" size={28} />
              Den Hellige Skrift
            </h1>
            <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
              Utforsk, les og studer Guds ord i ulike oversettelser. Klikk på vers for å dele dem med bønnefellesskapet, kopiere eller be HKM Assistenten om en dypere teologisk utredning.
            </p>
          </div>

          {/* Quick search input */}
          <form onSubmit={handleSearch} className="w-full md:w-80 shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Søk f.eks. 'Johannes 3:16'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-outline-variant/60 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium shadow-sm"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary-container"
              >
                <Search size={18} />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Main interactive grid layout */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Book and chapter selection pane (4/12 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-outline-variant/20 rounded-2xl p-5 shadow-sm space-y-5">
            <h2 className="font-serif font-bold text-base text-primary flex items-center gap-2 border-b border-slate-100 pb-3">
              <BookMarked size={18} />
              Bok- og kapittelvelger
            </h2>

            {/* Translation Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">Oversettelse</label>
              <select
                value={selectedTranslation}
                onChange={(e) => setSelectedTranslation(e.target.value)}
                className="w-full bg-slate-50 border border-outline-variant rounded-xl px-3 py-2.5 text-sm font-semibold text-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  testamentFilter === 'all' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Alle
              </button>
              <button
                onClick={() => setTestamentFilter('GT')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  testamentFilter === 'GT' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                GT
              </button>
              <button
                onClick={() => setTestamentFilter('NT')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  testamentFilter === 'NT' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                NT
              </button>
            </div>

            {/* Books List (scrollable) */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">Bibelbok</label>
              <div className="h-60 overflow-y-auto border border-outline-variant/40 rounded-xl bg-slate-50/50 p-2 space-y-1 scrollbar-thin">
                {filteredBooks.map(book => (
                  <button
                    key={book.id}
                    onClick={() => {
                      setSelectedBook(book);
                      setSelectedChapter(1);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex justify-between items-center transition-all ${
                      selectedBook.id === book.id 
                        ? 'bg-primary/5 text-primary border border-primary/20 shadow-sm font-bold' 
                        : 'text-on-surface-variant hover:bg-slate-100 hover:text-primary'
                    }`}
                  >
                    <span>{book.nor}</span>
                    <span className="text-[10px] opacity-60 font-mono">{book.testament}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Chapters Grid */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">
                Velg Kapittel (1 - {selectedBook.chapters})
              </label>
              <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1 scrollbar-thin">
                {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(chap => (
                  <button
                    key={chap}
                    onClick={() => setSelectedChapter(chap)}
                    className={`h-9 w-full rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                      selectedChapter === chap 
                        ? 'bg-primary text-white shadow-md font-extrabold' 
                        : 'bg-slate-50 text-on-surface-variant border border-outline-variant/30 hover:bg-slate-100 hover:text-primary'
                    }`}
                  >
                    {chap}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Bible reading pane (8/12 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-outline-variant/20 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between min-h-[500px]">
            
            {/* Reading header with next/prev buttons */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <button 
                onClick={() => navigateChapter('prev')}
                className="p-2 bg-slate-50 text-primary border border-outline-variant/40 rounded-xl hover:bg-slate-100 hover:text-primary-container active:scale-[0.97] transition-all"
                title="Forrige kapittel"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="text-center">
                <h2 className="font-serif font-extrabold text-xl md:text-2xl text-primary leading-tight">
                  {selectedBook.nor} {selectedChapter}
                </h2>
                <span className="text-[10px] font-bold text-outline tracking-wider uppercase font-mono mt-1 block">
                  {TRANSLATIONS.find(t => t.id === selectedTranslation)?.name}
                </span>
              </div>

              <button 
                onClick={() => navigateChapter('next')}
                className="p-2 bg-slate-50 text-primary border border-outline-variant/40 rounded-xl hover:bg-slate-100 hover:text-primary-container active:scale-[0.97] transition-all"
                title="Neste kapittel"
              >
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Reading body */}
            <div className="flex-grow relative">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center space-y-4"
                  >
                    <RefreshCw className="text-primary animate-spin" size={32} />
                    <p className="text-xs text-outline font-bold uppercase tracking-wider">Henter skriftsteder...</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5 text-justify select-text font-serif leading-loose"
                  >
                    {verses.length > 0 ? (
                      verses.map((verse) => (
                        <div 
                          key={`${verse.chapter}-${verse.verse}`}
                          onClick={() => setHighlightedVerse(highlightedVerse === verse.verse ? null : verse.verse)}
                          className={`group p-2.5 rounded-xl transition-all cursor-pointer relative ${
                            highlightedVerse === verse.verse 
                              ? 'bg-primary/5 border border-primary/20 shadow-sm shadow-primary/5' 
                              : 'hover:bg-slate-50/80 border border-transparent'
                          }`}
                        >
                          <p className="text-sm md:text-base text-on-surface leading-relaxed pr-24">
                            <span className="font-sans font-bold text-primary select-none mr-2.5 text-xs inline-block text-center w-5 h-5 leading-5 rounded bg-slate-100/80 group-hover:bg-primary group-hover:text-white transition-colors">
                              {verse.verse}
                            </span>
                            {verse.text}
                          </p>

                          {/* Quick Actions (only visible on hover or click) */}
                          <div className={`absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white border border-outline-variant/40 p-1 rounded-lg shadow-sm transition-all duration-200 ${
                            highlightedVerse === verse.verse ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto'
                          }`}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(verse);
                              }}
                              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-primary rounded-md transition-colors"
                              title="Kopier vers"
                            >
                              {copiedId === verse.verse ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendToAssistant(verse);
                              }}
                              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-burnt-orange rounded-md transition-colors"
                              title="Spør HKM Assistent"
                            >
                              <Sparkles size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShareToChat(verse);
                              }}
                              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-primary rounded-md transition-colors"
                              title="Del med Bønnefellesskap"
                            >
                              <Send size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-outline font-medium text-sm">
                        Ingen vers tilgjengelig. Prøv å laste på nytt.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Floating helper note */}
            <div className="mt-8 border-t border-slate-100 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-outline font-medium">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Share2 size={13} />
                Klikk på et vers for å dele det eller hente teologiske forklaringer.
              </span>
              <span className="italic">
                Husk å undersøke skriftene selv for å hente full åpenbaring!
              </span>
            </div>

          </div>
        </div>

      </section>

    </main>
  );
}
