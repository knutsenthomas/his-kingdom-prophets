import BibleStudyCenter from "../features/bible-resources/panels/BibleStudyCenter";
import ResourcesTimeline from "../features/bible-resources/panels/ResourcesTimeline";
import ResourcesSelector from "../features/bible-resources/panels/ResourcesSelector";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Search,
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  BookMarked,
  X,
  Trash2,
  Save,
  Globe,
  Video,
  FileText,
  Calendar,
  Compass,
  UserCheck,
  Flame,
  BookText,
  Settings,
  ChevronDown,
  Maximize2,
  Minimize2,
  Type,
  Edit3,
  Users,
  History,
} from "lucide-react";
import logo from "@/assets/logo.png";
import CmsText from "@/components/CmsText";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  generateFastingPdf,
  generateIntercessionPdf,
} from "@/utils/pdfGenerator";
import {
  BIBLE_BOOKS,
  TRANSLATIONS,
  STUDY_BIBLE_DATA,
  parseBibleReference,
  findBibleBook,
  generateDynamicCommentary,
} from "@/lib/bibleData";
import { biblicalCharacters } from "@/lib/bibelske-personer-data";
import { timelineData, empiresData } from "@/lib/timelineData";

export default function BibleResourcesPage() {
  const navigate = useNavigate();
  const {
    language,
    toggleLanguage,
    user,
    cmsContent,
    isAdminEditing,
    setIsAdminEditing,
    showToast,
  } = useApp();
  const isEn = language === "en";

  // Check admin status from both AppContext user AND localStorage (needed for public pages)
  const ADMIN_EMAILS = ["knutsenthomas@gmail.com", "thomas@tk-design.no"];
  const cleanEmail = user?.email?.toLowerCase();
  const localStorageUser = (() => {
    try {
      const raw = localStorage.getItem("hkm-current-user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  const localEmail = localStorageUser?.email?.toLowerCase();
  const localRole = localStorageUser?.role;

  const isAdminUser =
    user?.role === "admin" ||
    user?.role === "superadmin" ||
    ADMIN_EMAILS.includes(cleanEmail) ||
    localRole === "admin" ||
    localRole === "superadmin" ||
    ADMIN_EMAILS.includes(localEmail);

  // Navigation tab for the resource hub
  const [activeTab, setActiveTab] = useState("bible"); // bible, curriculums, video, fasting, characters, timeline

  // Biblical Characters and Timeline States
  const [characterSearch, setCharacterSearch] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [timelineSubTab, setTimelineSubTab] = useState("history"); // history, empires
  const [activeTimelineSection, setActiveTimelineSection] =
    useState("urhistorien");
  const [returnOriginTab, setReturnOriginTab] = useState(null);

  // Interactive Bible States (Same as BibleView)
  const [selectedBook, setSelectedBook] = useState(
    BIBLE_BOOKS.find((b) => b.id === "joh"),
  );
  const [selectedChapter, setSelectedChapter] = useState(3);
  const [selectedTranslation, setSelectedTranslation] =
    useState("bibelselskap");
  const [searchQuery, setSearchQuery] = useState("");
  const [verses, setVerses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [highlightedVerse, setHighlightedVerse] = useState(null);
  const [testamentFilter, setTestamentFilter] = useState("all"); // all, GT, NT
  const topRef = useRef(null);
  const readerRef = useRef(null);
  const tabsRef = useRef(null);
  const [previousReference, setPreviousReference] = useState(null);

  // Fullscreen Mobile Selector States
  const [showMobileSelector, setShowMobileSelector] = useState(false);
  const [selectorTab, setSelectorTab] = useState("book"); // book, chapter
  const [selectorSearch, setSelectorSearch] = useState("");

  // Study Panel States
  const [showStudyPanel, setShowStudyPanel] = useState(false);
  const [studyTab, setStudyTab] = useState("overview"); // overview, commentary, cross, notes
  const [isGeneratingCommentary, setIsGeneratingCommentary] = useState(false);
  const [generatedCommentaries, setGeneratedCommentaries] = useState({});
  const [generationStep, setGenerationStep] = useState(0);

  // Multi-verse Selection States
  const [selectedVerses, setSelectedVerses] = useState([]);

  // Fullscreen Reading & Text Sizing States
  const [isFullscreenReading, setIsFullscreenReading] = useState(false);
  const [textSize, setTextSize] = useState(
    () => localStorage.getItem("hkm-bible-text-size") || "md",
  );

  // Text size persistence in localStorage
  useEffect(() => {
    localStorage.setItem("hkm-bible-text-size", textSize);
  }, [textSize]);

  // Lock body scroll in fullscreen mode and toggle body class
  useEffect(() => {
    if (isFullscreenReading) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("bible-reader-fullscreen");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("bible-reader-fullscreen");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("bible-reader-fullscreen");
    };
  }, [isFullscreenReading]);

  const cardContainerRef = useRef(null);
  const [cardPosition, setCardPosition] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (!cardContainerRef.current) return;

    const updatePosition = () => {
      if (cardContainerRef.current) {
        const rect = cardContainerRef.current.getBoundingClientRect();
        setCardPosition({ left: rect.left, width: rect.width });
      }
    };

    // Initial measure
    updatePosition();

    // Use ResizeObserver for highly responsive layout tracking
    const observer = new ResizeObserver(() => {
      updatePosition();
    });
    observer.observe(cardContainerRef.current);

    // Also listen to window resize, scroll and sidebar animations
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    // Dynamic checks during transition animations
    const interval = setInterval(updatePosition, 100);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
      clearInterval(interval);
    };
  }, [isFullscreenReading]);

  // Typography Scaling Helper
  const getTextSizeClass = () => {
    switch (textSize) {
      case "sm":
        return "text-[13px] sm:text-[14px] md:text-[15px] leading-relaxed";
      case "md":
        return "text-[15px] sm:text-[17px] md:text-lg leading-relaxed sm:leading-loose md:leading-loose";
      case "lg":
        return "text-[18px] sm:text-[20px] md:text-xl leading-relaxed sm:leading-loose md:leading-loose";
      case "xl":
        return "text-[21px] sm:text-[23px] md:text-2xl leading-relaxed sm:leading-loose md:leading-loose";
      case "2xl":
        return "text-[24px] sm:text-[26px] md:text-3xl leading-relaxed sm:leading-loose md:leading-loose";
      default:
        return "text-[15px] sm:text-[17px] md:text-lg leading-relaxed sm:leading-loose md:leading-loose";
    }
  };

  // Personal Study Notes States
  const [noteText, setNoteText] = useState("");
  const [noteSaveStatus, setNoteSaveStatus] = useState("idle"); // idle, loading, saving, saved, error
  const saveTimeoutRef = useRef(null);

  // Load notes for current book and chapter
  useEffect(() => {
    const loadNote = () => {
      if (!selectedBook) return;
      const refKey = `${selectedBook.id}_${selectedChapter}`;
      const cacheKey = `hkm-bible-note-${user?.uid || "guest"}-${refKey}`;

      const cached = localStorage.getItem(cacheKey);
      setNoteText(cached || "");
      setNoteSaveStatus(cached ? "saved" : "idle");
    };

    loadNote();

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  }, [selectedBook, selectedChapter, user]);

  const handleSaveNote = (textToSave = noteText) => {
    if (!selectedBook) return;
    const refKey = `${selectedBook.id}_${selectedChapter}`;
    const cacheKey = `hkm-bible-note-${user?.uid || "guest"}-${refKey}`;

    localStorage.setItem(cacheKey, textToSave);
    setNoteSaveStatus("saving");

    setTimeout(() => {
      setNoteSaveStatus("saved");
    }, 400);
  };

  const handleNoteChange = (e) => {
    const text = e.target.value;
    setNoteText(text);
    setNoteSaveStatus("idle");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      handleSaveNote(text);
    }, 1500);
  };

  const handleClearNote = () => {
    if (
      !window.confirm(
        isEn
          ? "Are you sure you want to delete this note?"
          : "Er du sikker på at du vil slette notatet?",
      )
    )
      return;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    const refKey = `${selectedBook.id}_${selectedChapter}`;
    const cacheKey = `hkm-bible-note-${user?.uid || "guest"}-${refKey}`;
    localStorage.removeItem(cacheKey);
    setNoteText("");
    setNoteSaveStatus("idle");
  };

  // Reset verse selection when book or chapter changes
  useEffect(() => {
    setSelectedVerses([]);
  }, [selectedBook, selectedChapter]);

  const toggleVerseSelection = (verseNum) => {
    setHighlightedVerse(verseNum); // Sett denne som aktivt fokusvers for studier og kryssreferanser
    setSelectedVerses((prev) => {
      if (prev.includes(verseNum)) {
        return prev.filter((num) => num !== verseNum);
      } else {
        return [...prev, verseNum].sort((a, b) => a - b);
      }
    });
  };

  const handleBulkCopy = () => {
    if (selectedVerses.length === 0) return;
    const sortedVerses = [...selectedVerses].sort((a, b) => a - b);
    const targets = sortedVerses
      .map((num) => verses.find((v) => v.verse === num))
      .filter(Boolean);
    const combinedText = targets
      .map((v) => `[${v.verse}] ${v.text.trim()}`)
      .join(" ");
    const verseRange =
      sortedVerses.length === 1
        ? `${sortedVerses[0]}`
        : `${sortedVerses[0]}-${sortedVerses[sortedVerses.length - 1]}`;
    const translationName =
      TRANSLATIONS.find((t) => t.id === selectedTranslation)?.name ||
      selectedTranslation.toUpperCase();

    const textToCopy = `"${combinedText}" — ${selectedBook.nor} ${selectedChapter}:${verseRange} (${translationName})`;
    navigator.clipboard.writeText(textToCopy);
    alert(
      isEn
        ? `${selectedVerses.length} verses copied!`
        : `${selectedVerses.length} vers kopiert!`,
    );
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

    const steps = isEn
      ? [
          "Searching the holy scriptures...",
          "Analyzing theological context...",
          "Consulting Greek & Hebrew texts...",
          "Drafting exegetical commentary...",
          "Finalizing commentary study...",
        ]
      : [
          "Søker i de hellige skrifter...",
          "Analyserer teologisk kontekst...",
          "Slår opp gresk og hebraisk grunntekst...",
          "Utarbeider eksegetisk kommentar...",
          "Ferdigstiller studiekommentar...",
        ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setGenerationStep(currentStep);
      } else {
        clearInterval(interval);
        const refKey = `${selectedBook.id}_${selectedChapter}`;
        const computed = generateDynamicCommentary(
          selectedBook,
          selectedChapter,
        );
        setGeneratedCommentaries((prev) => ({
          ...prev,
          [refKey]: computed,
        }));
        setIsGeneratingCommentary(false);
        setStudyTab("overview");
      }
    }, 600);
  };

  const fetchBibleChapter = async () => {
    setIsLoading(true);
    setVerses([]);
    try {
      const bookIndex = BIBLE_BOOKS.findIndex((b) => b.id === selectedBook.id);
      const bookNumber = bookIndex + 1;

      // 1. Open Translation Bible (Norsk) - fetches from GitHub
      if (selectedTranslation === "openbible_nb") {
        const OPENBIBLE_NB_FOLDERS = [
          "01.1 Mosebok",
          "02.2 Mosebok",
          "03.3 Mosebok",
          "04.4 Mosebok",
          "05.5 Mosebok",
          "06.Josva",
          "07.Dommerne",
          "08.Rut",
          "09.1 Samuelsbok",
          "10.2 Samuelsbok",
          "11.1 Kongebok",
          "12.2 Kongebok",
          "13.1 Krønikebok",
          "14.2 Krønikebok",
          "15.Esra",
          "16.Nehemja",
          "17.Ester",
          "18.Job",
          "19.Salmene",
          "20.Ordspråkene",
          "21.Forkynneren",
          "22.Høysangen",
          "23.Jesaja",
          "24.Jeremia",
          "25.Klagesangene",
          "26.Esekiel",
          "27.Daniel",
          "28.Hosea",
          "29.Joel",
          "30.Amos",
          "31.Obadja",
          "32.Jona",
          "33.Mika",
          "34.Nahum",
          "35.Habakkuk",
          "36.Sefanja",
          "37.Haggai",
          "38.Sakarja",
          "39.Malaki",
          "40.Matteus",
          "41.Markus",
          "42.Lukas",
          "43.Johannes",
          "44.Apostlenes gjerninger",
          "45.Romerne",
          "46.1 Korinterne",
          "47.2 Korinterne",
          "48.Galaterne",
          "49.Efeserne",
          "50.Filipperne",
          "51.Kolosserne",
          "52.1 Tessalonikerne",
          "53.2 Tessalonikerne",
          "54.1 Timoteus",
          "55.2 Timoteus",
          "56.Titus",
          "57.Filemon",
          "58.Hebreerne",
          "59.Jakob",
          "60.1 Peter",
          "61.2 Peter",
          "62.1 Johannes",
          "63.2 Johannes",
          "64.3 Johannes",
          "65.Judas",
          "66.Åpenbaringen",
        ];

        const folderName = OPENBIBLE_NB_FOLDERS[bookIndex];
        if (folderName) {
          const dotIndex = folderName.indexOf(".");
          const displayName =
            dotIndex === -1 ? folderName : folderName.substring(dotIndex + 1);
          const jsonPrefix = displayName
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/\./g, "");
          const padLength = bookNumber === 19 ? 3 : 2;
          const chapterNumPadded = String(selectedChapter).padStart(
            padLength,
            "0",
          );

          const githubUrl = `https://raw.githubusercontent.com/OpentranslationBible/open-bible/main/lang/nb-NO/${encodeURIComponent(folderName)}/json/${jsonPrefix}-${chapterNumPadded}.json`;

          try {
            const response = await fetch(githubUrl);
            if (response.ok) {
              const data = await response.json();
              const mapped = (data.verses || [])
                .filter((v) => v.verse !== undefined && v.verse !== null)
                .map((v) => {
                  const rawLines = Array.isArray(v.text)
                    ? v.text
                    : [String(v.text || "")];
                  const cleaned = rawLines
                    .map((line) => line.trim().replace(/^>\s*/, ""))
                    .filter((line) => line !== "---" && line.length > 0)
                    .join(" ");
                  return {
                    verse: Number(v.verse),
                    text: cleaned,
                  };
                });
              if (mapped.length > 0) {
                setVerses(mapped);
                return;
              }
            }
          } catch (e) {
            console.warn(
              "OpenBible fetch failed, falling back to Bokmål 1930:",
              e,
            );
          }
        }

        // Fallback to Bokmål 1930 from getbible if OpenBible chapter is not available
        const fallbackUrl = `https://api.getbible.net/v2/bibelselskap/${bookNumber}/${selectedChapter}.json`;
        const res = await fetch(fallbackUrl);
        if (res.ok) {
          const data = await res.json();
          setVerses(data.verses || []);
          return;
        }
      }

      // 2. Spanish/Bolls.life Translations (rv1960, nvi)
      if (selectedTranslation === "rv1960" || selectedTranslation === "nvi") {
        const targetBible = selectedTranslation.toUpperCase();
        const bollsUrl = `https://bolls.life/get-chapter/${targetBible}/${bookNumber}/${selectedChapter}/`;
        try {
          const response = await fetch(bollsUrl);
          if (response.ok) {
            const data = await response.json(); // returns array of { pk, text, verse }
            const mapped = (data || []).map((v) => ({
              verse: Number(v.verse),
              text: v.text
                .replace(/<S>\d+<\/S>/g, "")
                .replace(/<[^>]+>/g, "")
                .trim(),
            }));
            if (mapped.length > 0) {
              setVerses(mapped);
              return;
            }
          }
        } catch (e) {
          console.warn("Bolls.life fetch failed:", e);
        }
      }

      // 3. Standard Translations (Getbible.net primary)
      const url = `https://api.getbible.net/v2/${selectedTranslation}/${bookNumber}/${selectedChapter}.json`;
      const response = await fetch(url);

      if (!response.ok) {
        // Fallback to Bolls.life if getbible fails
        const bollsTranslationMap = {
          bibelselskap: "DNB",
          norsmb: "NOR1921",
          web: "WEB",
          kjv: "KJV",
        };
        const bollsCode = bollsTranslationMap[selectedTranslation];
        if (bollsCode) {
          const bollsFallbackUrl = `https://bolls.life/get-chapter/${bollsCode}/${bookNumber}/${selectedChapter}/`;
          const bollsRes = await fetch(bollsFallbackUrl);
          if (bollsRes.ok) {
            const bollsData = await bollsRes.json();
            const mapped = (bollsData || []).map((v) => ({
              verse: Number(v.verse),
              text: v.text
                .replace(/<S>\d+<\/S>/g, "")
                .replace(/<[^>]+>/g, "")
                .trim(),
            }));
            setVerses(mapped);
            return;
          }
        }
        throw new Error("Kunne ikke hente bibeldata");
      }

      const data = await response.json();
      setVerses(data.verses || []);
    } catch (err) {
      console.error(err);
      if (typeof showToast === "function") {
        showToast(
          "Klarte ikke å laste bibelkapittelet. Sjekk internettforbindelsen.",
        );
      }
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
        const sourceVerse =
          highlightedVerse ||
          (selectedVerses.length > 0
            ? selectedVerses[selectedVerses.length - 1]
            : null);
        setPreviousReference({
          book: selectedBook,
          chapter: selectedChapter,
          verse: sourceVerse,
        });

        setSelectedBook(foundBook);
        const clampedChapter = Math.max(
          1,
          Math.min(parsedRef.chapter, foundBook.chapters),
        );
        setSelectedChapter(clampedChapter);

        if (parsedRef.verse) {
          setHighlightedVerse(parsedRef.verse);
        } else {
          setHighlightedVerse(null);
        }

        // Scroll leseren i fokus
        setTimeout(() => {
          if (readerRef.current) {
            readerRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 150);
        return true;
      }
    }
    return false;
  };

  const handleScriptureRefLink = (refString, originTab) => {
    if (!refString) return;
    const success = loadBibleReference(refString);
    if (success) {
      setReturnOriginTab(originTab);
      setActiveTab("bible");
    }
  };

  const handleGoBackToReference = () => {
    if (!previousReference) return;
    setSelectedBook(previousReference.book);
    setSelectedChapter(previousReference.chapter);
    setHighlightedVerse(previousReference.verse);

    setTimeout(() => {
      if (readerRef.current) {
        readerRef.current.scrollIntoView({ behavior: "smooth" });
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
      setSearchQuery("");
      return;
    }

    setIsLoading(true);
    setVerses([]);
    try {
      let cleanQuery = searchQuery.trim();
      BIBLE_BOOKS.forEach((book) => {
        const norLower = book.nor.toLowerCase();
        if (cleanQuery.toLowerCase().startsWith(norLower)) {
          cleanQuery = cleanQuery.replace(new RegExp(book.nor, "i"), book.eng);
        }
      });

      const url = `https://query.getbible.net/v2/${selectedTranslation}/${encodeURIComponent(cleanQuery)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Kunne ikke finne skriftstedet");
      }

      const data = await response.json();
      const keys = Object.keys(data);
      if (keys.length > 0) {
        const resultVerses = [];
        let detectedBook = null;
        let detectedChapter = 1;

        keys.forEach((key) => {
          const item = data[key];
          if (item.verses) {
            resultVerses.push(...item.verses);
          }
          if (!detectedBook && item.book_name) {
            const found = BIBLE_BOOKS.find(
              (b) =>
                b.eng.toLowerCase() === item.book_name.toLowerCase() ||
                b.nor.toLowerCase() === item.book_name.toLowerCase(),
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
    if (direction === "prev") {
      if (selectedChapter > 1) {
        setSelectedChapter((prev) => prev - 1);
      } else {
        const currentIndex = BIBLE_BOOKS.findIndex(
          (b) => b.id === selectedBook.id,
        );
        if (currentIndex > 0) {
          const prevBook = BIBLE_BOOKS[currentIndex - 1];
          setSelectedBook(prevBook);
          setSelectedChapter(prevBook.chapters);
        }
      }
    } else {
      if (selectedChapter < selectedBook.chapters) {
        setSelectedChapter((prev) => prev + 1);
      } else {
        const currentIndex = BIBLE_BOOKS.findIndex(
          (b) => b.id === selectedBook.id,
        );
        if (currentIndex < BIBLE_BOOKS.length - 1) {
          const nextBook = BIBLE_BOOKS[currentIndex + 1];
          setSelectedBook(nextBook);
          setSelectedChapter(1);
        }
      }
    }
    if (readerRef.current) {
      readerRef.current.scrollIntoView({ behavior: "smooth" });
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
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 400);
    }
  }, [highlightedVerse, verses]);

  // Scroll smoothly back to the tab controller top when switching tabs
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (tabsRef.current) {
      const offset = 80; // Height of the sticky public header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = tabsRef.current.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }, [activeTab]);

  const filteredBooks = BIBLE_BOOKS.filter((book) => {
    if (testamentFilter === "all") return true;
    return book.testament === testamentFilter;
  });

  const refKey = `${selectedBook.id}_${selectedChapter}`;
  const activeCommentary =
    generatedCommentaries[refKey] || STUDY_BIBLE_DATA[refKey];

  return (
    <div
      className="bg-[#F6F4F8] min-h-screen flex flex-col font-sans text-slate-800"
      ref={topRef}
    >
      {/* Site Header */}
      <SiteHeader />

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-br from-[#561291] to-[#561291] text-white py-16 md:py-20 px-4 sm:px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(224,170,255,0.15),transparent)] pointer-events-none"></div>
        <div className="max-w-[1440px] mx-auto space-y-4 relative z-10 text-center sm:text-left">
          <CmsText
            slug="resources-hero-title"
            fallback="Bibelressurser og studieportal"
            as="h1"
            className="font-sans text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight"
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
      <section
        ref={tabsRef}
        className="border-b border-slate-200 bg-white sticky top-20 z-30 shadow-sm"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 flex space-x-8 overflow-x-auto whitespace-nowrap scrollbar-none h-16 items-center">
          {[
            { id: "bible", fallback: "Interaktiv studiebibel", icon: BookOpen },
            {
              id: "curriculums",
              fallback: "Fagplaner og studiehefter",
              icon: BookText,
            },
            { id: "video", fallback: "Lyd- og videoundervisning", icon: Video },
            {
              id: "fasting",
              fallback: "Fastemanualer og bønneguider",
              icon: Flame,
            },
            { id: "characters", fallback: "Bibelske personer", icon: Users },
            { id: "timeline", fallback: "Bibelsk tidslinje", icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 h-full px-2 text-sm font-bold border-b-2 transition-all relative ${
                  isActive
                    ? "border-primary text-primary font-extrabold"
                    : "border-transparent text-slate-500 hover:text-primary hover:border-primary/30"
                }`}
              >
                <Icon size={16} />
                <span>
                  <CmsText
                    slug={`resources-tab-${tab.id}`}
                    fallback={tab.fallback}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Dynamic Tab Contents */}
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 py-10">
        {/* TAB 1: INTERACTIVE BIBLE & STUDY CENTER */}
        {activeTab === "bible" && (
          <BibleStudyCenter
            {...{
              activeCommentary,
              cardContainerRef,
              filteredBooks,
              generationStep,
              getTextSizeClass,
              handleClearNote,
              handleGenerateCommentary,
              handleGoBackToReference,
              handleNoteChange,
              handleSaveNote,
              handleSearch,
              highlightedVerse,
              isAdminEditing,
              isAdminUser,
              isEn,
              isFullscreenReading,
              isGeneratingCommentary,
              isLoading,
              loadBibleReference,
              navigate,
              navigateChapter,
              noteSaveStatus,
              noteText,
              previousReference,
              readerRef,
              searchQuery,
              selectedBook,
              selectedChapter,
              selectedTranslation,
              selectedVerses,
              setIsAdminEditing,
              setIsFullscreenReading,
              setSearchQuery,
              setSelectedBook,
              setSelectedChapter,
              setSelectedTranslation,
              setSelectorSearch,
              setSelectorTab,
              setShowMobileSelector,
              setShowStudyPanel,
              setStudyTab,
              setTestamentFilter,
              setTextSize,
              showStudyPanel,
              showToast,
              studyTab,
              testamentFilter,
              textSize,
              toggleVerseSelection,
              verses,
            }}
          />
        )}

        {/* TAB 2: CURRICULUMS & OUTLINES */}
        {activeTab === "curriculums" && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <CmsText
                slug="resources-curriculums-title"
                fallback="Studieplaner og teologiske fagplaner"
                as="h3"
                className="font-sans text-2xl font-bold text-primary"
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
                  code: "PROP 101",
                  titleSlug: "resources-curr-prop101-title",
                  titleFallback: isEn
                    ? "Prophetic Equipment & Character"
                    : "Innføring i den profetiske tjeneste",
                  descSlug: "resources-curr-prop101-desc",
                  descFallback: isEn
                    ? "Understand the ethics, spiritual maturity, and character required to carry revelation. Covers dreams, visions, and biblical prophets."
                    : "Forstå etikken, den åndelige karakteren og modenheten som kreves for å bære åpenbaringskunnskap. Moduler om drømmetydning og bibelsk profeti.",
                  modules: [
                    {
                      slug: "resources-curr-prop101-mod1",
                      fallback: isEn
                        ? "Ethics of the Prophet"
                        : "Den profetiske etikk og karakter",
                    },
                    {
                      slug: "resources-curr-prop101-mod2",
                      fallback: isEn
                        ? "Visions and Dreams"
                        : "Tyde syner og drømmer",
                    },
                    {
                      slug: "resources-curr-prop101-mod3",
                      fallback: isEn
                        ? "Spiritual Discernment"
                        : "Åndelig skjelneevne og prøving",
                    },
                    {
                      slug: "resources-curr-prop101-mod4",
                      fallback: isEn
                        ? "Prophecy in the Local Church"
                        : "Betjening i menigheten",
                    },
                  ],
                  color: "from-purple-500 to-indigo-600",
                },
                {
                  code: "BIBLE 301",
                  titleSlug: "resources-curr-bible301-title",
                  titleFallback: isEn
                    ? "Advanced Hermeneutics & Exegesis"
                    : "Avansert hermeneutikk og tolkning",
                  descSlug: "resources-curr-bible301-desc",
                  descFallback: isEn
                    ? "Deep-dive into historic covenant theology, typologies, and eschatological frameworks. Learn sound exegesis using original text principles."
                    : "Gå dypt inn i historisk paktsteologi, typologier og eskatologiske modeller. Lær sunn bibeltolkning og skriftgransking ut fra grunntekstens prinsipper.",
                  modules: [
                    {
                      slug: "resources-curr-bible301-mod1",
                      fallback: isEn
                        ? "Historical-Grammatical Method"
                        : "Historisk-grammatisk metode",
                    },
                    {
                      slug: "resources-curr-bible301-mod2",
                      fallback: isEn
                        ? "Covenant Theology Foundations"
                        : "Paktsteologiens røtter",
                    },
                    {
                      slug: "resources-curr-bible301-mod3",
                      fallback: isEn
                        ? "Eschatology & Typologies"
                        : "Eskatologiske typologier",
                    },
                    {
                      slug: "resources-curr-bible301-mod4",
                      fallback: isEn
                        ? "Old Testament Exegesis"
                        : "Gammeltestamentlig eksegese",
                    },
                  ],
                  color: "from-indigo-600 to-blue-600",
                },
                {
                  code: "MIN 201",
                  titleSlug: "resources-curr-min201-title",
                  titleFallback: isEn
                    ? "Pastoral Care & Inner Healing"
                    : "Sjelesorg, bønn og indre helbredelse",
                  descSlug: "resources-curr-min201-desc",
                  descFallback: isEn
                    ? "Equipping disciples for inner restoration, spiritual warfare, and prophetic counseling. Walk in the power of the Spirit to heal broken hearts."
                    : "Utruster disipler til indre gjenopprettelse, sjelesorg under Åndens ledelse, og bønnetjeneste. Lær å vandre i Åndens kraft til å helbrede knuste hjerter.",
                  modules: [
                    {
                      slug: "resources-curr-min201-mod1",
                      fallback: isEn
                        ? "Biblical Soul Care"
                        : "Bibelsk sjelesorg og samtale",
                    },
                    {
                      slug: "resources-curr-min201-mod2",
                      fallback: isEn
                        ? "Theology of Inner Healing"
                        : "Prinsipper for indre helbredelse",
                    },
                    {
                      slug: "resources-curr-min201-mod3",
                      fallback: isEn
                        ? "Deliverance and Authority"
                        : "Åndelig autoritet og frihet",
                    },
                    {
                      slug: "resources-curr-min201-mod4",
                      fallback: isEn
                        ? "Prophetic Counseling Ethics"
                        : "Etikk i bønnetjenesten",
                    },
                  ],
                  color: "from-purple-600 to-pink-600",
                },
              ].map((item) => (
                <div
                  key={item.code}
                  className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 flex flex-col justify-between hover:shadow-md hover:border-primary/20 transition-all duration-300 group"
                >
                  <div className="space-y-4">
                    <span
                      className={`inline-block px-3 py-1 bg-gradient-to-r ${item.color} text-white font-mono text-[10px] font-bold uppercase rounded-lg shadow-sm`}
                    >
                      {item.code}
                    </span>
                    <h4 className="font-sans text-lg font-bold text-primary group-hover:text-primary-container transition-colors">
                      <CmsText
                        slug={item.titleSlug}
                        fallback={item.titleFallback}
                      />
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      <CmsText
                        slug={item.descSlug}
                        fallback={item.descFallback}
                      />
                    </p>

                    <div className="space-y-2 border-t border-slate-100 pt-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        <CmsText
                          slug="resources-curr-modules-label"
                          fallback={isEn ? "Core Modules" : "Kjernemoduler"}
                        />
                      </span>
                      <ul className="space-y-1.5">
                        {item.modules.map((mod, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-xs text-slate-600 font-medium"
                          >
                            <span className="p-0.5 bg-green-50 text-green-600 rounded-full shrink-0">
                              <Check size={10} />
                            </span>
                            <span>
                              <CmsText
                                slug={mod.slug}
                                fallback={mod.fallback}
                              />
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(isEn ? "/admission" : "/opptak")}
                    className="w-full mt-6 py-2.5 bg-slate-50 hover:bg-primary hover:text-white border border-slate-200 hover:border-primary text-primary font-bold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Calendar size={13} />
                    <span>
                      <CmsText
                        slug="resources-curr-apply-btn"
                        fallback={
                          isEn ? "Apply / Request Info" : "Søk studieplass"
                        }
                      />
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: VIDEO & AUDIO LECTURES */}
        {activeTab === "video" && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <CmsText
                slug="resources-video-title"
                fallback="Lyd- og videoundervisning"
                as="h3"
                className="font-sans text-2xl font-bold text-primary"
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
                      <span className="px-2 py-0.5 bg-amber-500 text-white font-bold rounded text-[9px] uppercase tracking-wider">
                        <CmsText
                          slug="resources-video1-badge"
                          fallback={isEn ? "Open Seminar" : "Åpent seminar"}
                        />
                      </span>
                      <h4 className="font-sans font-bold text-white text-base leading-tight">
                        <CmsText
                          slug="resources-video1-title"
                          fallback={
                            isEn
                              ? "Understanding Prophetic Revelation & Ethics"
                              : "Å forstå profetisk åpenbaring og etikk"
                          }
                        />
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    <CmsText
                      slug="resources-video1-desc"
                      fallback={
                        isEn
                          ? "A comprehensive 45-minute introductory lecture by Apostle David Hansen explaining the biblical foundation of the prophetic gift in the early church, and how it must operate under sound theological testing."
                          : "En 45-minutters introduksjonsforelesning med Apostel David Hansen som tar for seg det bibelske fundamentet for den profetiske gave, og hvordan gaverollen må underlegges sunn teologisk testing og karakter."
                      }
                    />
                  </p>
                  <button
                    onClick={() => navigate(user ? "/student/video" : "/login")}
                    className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Video size={13} />
                    <span>
                      <CmsText
                        slug="resources-video1-btn"
                        fallback={
                          isEn
                            ? "Watch Lecture (45 min)"
                            : "Se forelesning (45 min)"
                        }
                      />
                    </span>
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
                      <span className="px-2 py-0.5 bg-indigo-600 text-white font-bold rounded text-[9px] uppercase tracking-wider">
                        <CmsText
                          slug="resources-video2-badge"
                          fallback={
                            isEn ? "Theological Deep-Dive" : "Teologisk dypdykk"
                          }
                        />
                      </span>
                      <h4 className="font-sans font-bold text-white text-base leading-tight">
                        <CmsText
                          slug="resources-video2-title"
                          fallback={
                            isEn
                              ? "Introduction to Covenant Theology & Typology"
                              : "Introduksjon til paktsteologi og typologi"
                          }
                        />
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    <CmsText
                      slug="resources-video2-desc"
                      fallback={
                        isEn
                          ? "Learn how the Old Testament promises and shadows point seamlessly to Christ in the New Testament. An introductory exegesis class covering Abrahamic and New Covenant typologies."
                          : "Lær hvordan det gamle testamentets skygger og løfter peker fram mot Kristus i det nye testamentet. En innføringsklasse i paktsteologi som dekker abrahamspakten og den nye pakt."
                      }
                    />
                  </p>
                  <button
                    onClick={() => navigate(user ? "/student/video" : "/login")}
                    className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Video size={13} />
                    <span>
                      <CmsText
                        slug="resources-video2-btn"
                        fallback={
                          isEn
                            ? "Watch Lecture (35 min)"
                            : "Se forelesning (35 min)"
                        }
                      />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FASTING & PRAYER MANUALS */}
        {activeTab === "fasting" && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <CmsText
                slug="resources-fasting-title"
                fallback="Fastemanualer og bønneguider"
                as="h3"
                className="font-sans text-2xl font-bold text-primary"
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
                  id: "fasting",
                  titleSlug: "pdf-fasting-card-title",
                  titleFallback: isEn
                    ? "The Biblical Fasting Manual (PDF)"
                    : "Bibelsk faste og åndelig disiplin (PDF)",
                  descSlug: "pdf-fasting-card-desc",
                  descFallback: isEn
                    ? "A detailed 14-page guide explaining the theology, health boundaries, and spiritual focus of Christian fasting. Includes daily scripture readings."
                    : "En grundig 14-siders guide som forklarer teologien, de helsemessige rammene, og det åndelige fokuset ved kristen faste. Inkluderer faste-skriftsteder.",
                  bullets: [
                    {
                      slug: "pdf-fasting-card-bullet1",
                      fallback: isEn
                        ? "Theology of Fasting (Matthew 6, Isaiah 58)"
                        : "Faste-teologi (Matteus 6 og Jesaja 58)",
                    },
                    {
                      slug: "pdf-fasting-card-bullet2",
                      fallback: isEn
                        ? "Practical health and hydration guidelines"
                        : "Praktiske helse- og væskeråd",
                    },
                    {
                      slug: "pdf-fasting-card-bullet3",
                      fallback: isEn
                        ? "Fasting for revelation and breakthrough"
                        : "Faste for åpenbaring og gjennombrudd",
                    },
                  ],
                  icon: Flame,
                },
                {
                  id: "intercession",
                  titleSlug: "pdf-intercession-card-title",
                  titleFallback: isEn
                    ? "Prophetic Intercession & Prayer Shield"
                    : "Profetisk forbønn og bønneskjold",
                  descSlug: "pdf-intercession-card-desc",
                  descFallback: isEn
                    ? "Learn how to pray under the leading of the Holy Spirit, establish prayer watches in your local church, and pray effectively for missions."
                    : "Lær å be strategisk under Helligåndens ledelse, etablere bønnevakter i menigheten, og be målrettet for misjonsfeltet og profetiske tjenester.",
                  bullets: [
                    {
                      slug: "pdf-intercession-card-bullet1",
                      fallback: isEn
                        ? "Hearing God in prayer watches"
                        : "Høre Guds stemme under bønnevakten",
                    },
                    {
                      slug: "pdf-intercession-card-bullet2",
                      fallback: isEn
                        ? "Developing spiritual authority"
                        : "Åndelig autoritet og posisjonering",
                    },
                    {
                      slug: "pdf-intercession-card-bullet3",
                      fallback: isEn
                        ? "Establishing a prayer shield for your ministry"
                        : "Sette opp et bønneskjold for din tjeneste",
                    },
                  ],
                  icon: Compass,
                },
              ].map((manual, index) => {
                const Icon = manual.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 sm:p-8 flex flex-col justify-between hover:shadow-md hover:border-primary/20 transition-all duration-300 group relative animate-in fade-in-50"
                  >
                    {/* Admin "Rediger PDF" Floating Shortcut Button */}
                    {["admin", "superadmin", "teacher"].includes(
                      user?.role,
                    ) && (
                      <button
                        onClick={() =>
                          navigate(
                            `/admin/cms?category=documents&expand=${manual.id}`,
                          )
                        }
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
                      <h4 className="font-sans text-lg font-bold text-primary group-hover:text-[#561291] transition-colors">
                        <CmsText
                          slug={manual.titleSlug}
                          fallback={manual.titleFallback}
                        />
                      </h4>
                      <CmsText
                        slug={manual.descSlug}
                        fallback={manual.descFallback}
                        as="p"
                        className="text-xs text-slate-500 leading-relaxed"
                      />

                      <ul className="space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600 font-medium">
                        {manual.bullets.map((b, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="p-0.5 bg-purple-50 text-primary rounded-full shrink-0">
                              <Check size={10} />
                            </span>
                            <CmsText slug={b.slug} fallback={b.fallback} />
                          </li>
                        ))}
                      </ul>
                    </div>

                    {index === 0 ? (
                      cmsContent?.["pdf_fasting_url"] ? (
                        <a
                          href={cmsContent["pdf_fasting_url"]}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full mt-6 py-2.5 bg-primary hover:bg-[#561291] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm font-sans select-none text-center animate-in"
                        >
                          <FileText size={13} />
                          <span>
                            <CmsText
                              slug="resources-fasting-download-btn"
                              fallback={
                                isEn
                                  ? "Download Resources"
                                  : "Last ned studiehefte"
                              }
                            />
                          </span>
                        </a>
                      ) : (
                        <button
                          onClick={() =>
                            generateFastingPdf(cmsContent, language)
                          }
                          className="w-full mt-6 py-2.5 bg-primary hover:bg-[#561291] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm font-sans select-none text-center animate-in"
                        >
                          <FileText size={13} />
                          <span>
                            <CmsText
                              slug="resources-fasting-download-btn"
                              fallback={
                                isEn
                                  ? "Download Resources"
                                  : "Last ned studiehefte"
                              }
                            />
                          </span>
                        </button>
                      )
                    ) : cmsContent?.["pdf_intercession_url"] ? (
                      <a
                        href={cmsContent["pdf_intercession_url"]}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full mt-6 py-2.5 bg-primary hover:bg-[#561291] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm font-sans select-none text-center animate-in"
                      >
                        <FileText size={13} />
                        <span>
                          <CmsText
                            slug="resources-fasting-download-btn"
                            fallback={
                              isEn
                                ? "Download Resources"
                                : "Last ned studiehefte"
                            }
                          />
                        </span>
                      </a>
                    ) : (
                      <button
                        onClick={() =>
                          generateIntercessionPdf(cmsContent, language)
                        }
                        className="w-full mt-6 py-2.5 bg-primary hover:bg-[#561291] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm font-sans select-none text-center animate-in"
                      >
                        <FileText size={13} />
                        <span>
                          <CmsText
                            slug="resources-fasting-download-btn"
                            fallback={
                              isEn
                                ? "Download Resources"
                                : "Last ned studiehefte"
                            }
                          />
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: BIBLICAL CHARACTERS */}
        {activeTab === "characters" && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <CmsText
                slug="resources-characters-title"
                fallback={
                  isEn ? "Biblical Characters Catalog" : "Bibelske personer"
                }
                as="h3"
                className="font-sans text-2xl font-bold text-primary"
              />
              <CmsText
                slug="resources-characters-desc"
                fallback={
                  isEn
                    ? "Explore the biographies, key scripture passages, and theological significance of the central figures of the biblical narrative."
                    : "Utforsk biografiene, de sentrale bibelske skriftene, og den teologiske betydningen av Bibelens mest sentrale skikkelser."
                }
                as="p"
                className="text-sm text-slate-500 leading-relaxed"
              />
            </div>

            {/* Search and Filters */}
            <div className="max-w-md mx-auto relative">
              <Search
                className="absolute left-4 top-3.5 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder={
                  isEn
                    ? "Search characters by name, role, era..."
                    : "Søk etter navn, rolle, historisk tid..."
                }
                value={characterSearch}
                onChange={(e) => setCharacterSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 focus:border-primary focus:bg-white rounded-xl text-sm focus:outline-none transition-all shadow-sm"
              />
            </div>

            {/* Grid of Characters */}
            {(() => {
              const searchLower = characterSearch.toLowerCase();
              const filtered = (biblicalCharacters || []).filter((char) => {
                const name = (
                  char.name[language] ||
                  char.name.no ||
                  ""
                ).toLowerCase();
                const role = (
                  char.role[language] ||
                  char.role.no ||
                  ""
                ).toLowerCase();
                const era = (
                  char.era[language] ||
                  char.era.no ||
                  ""
                ).toLowerCase();
                const summary = (
                  char.summary[language] ||
                  char.summary.no ||
                  ""
                ).toLowerCase();
                return (
                  name.includes(searchLower) ||
                  role.includes(searchLower) ||
                  era.includes(searchLower) ||
                  summary.includes(searchLower)
                );
              });

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-12 text-slate-500">
                    <CmsText
                      slug="resources-characters-no-results"
                      fallback={
                        isEn
                          ? "No characters match your search query."
                          : "Ingen personer samsvarer med søket ditt."
                      }
                    />
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                  {filtered.map((char) => {
                    const charName = char.name[language] || char.name.no;
                    const charRole = char.role[language] || char.role.no;
                    const charEra = char.era[language] || char.era.no;
                    const charSummary =
                      char.summary[language] || char.summary.no;

                    return (
                      <div
                        key={char.id}
                        className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-primary/20 transition-all duration-300 group"
                      >
                        <div>
                          {/* Image Wrap */}
                          <div className="h-56 bg-slate-100 overflow-hidden relative">
                            <img
                              src={char.image}
                              alt={charName}
                              className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                            <div className="hidden absolute inset-0 bg-gradient-to-br from-[#561291]/10 to-[#bd4f2a]/10 items-center justify-center font-bold text-4xl text-primary">
                              {charName.substring(0, 1)}
                            </div>
                            <div className="absolute top-4 left-4 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[9px] font-bold text-slate-600 uppercase tracking-wide border border-slate-200/40">
                              {charEra}
                            </div>
                          </div>

                          <div className="p-6 space-y-3">
                            <h4 className="font-sans text-lg font-bold text-primary group-hover:text-burnt-orange transition-colors">
                              {charName}
                            </h4>
                            <span className="text-[10px] font-bold text-burnt-orange uppercase tracking-wider block font-sans">
                              {charRole}
                            </span>
                            <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium line-clamp-3">
                              {charSummary}
                            </p>
                          </div>
                        </div>

                        <div className="px-6 pb-6 pt-2">
                          <button
                            onClick={() => setSelectedCharacter(char)}
                            className="w-full py-2 bg-slate-50 hover:bg-primary hover:text-white border border-slate-200 hover:border-primary text-primary font-bold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>
                              <CmsText
                                slug="resources-characters-read-btn"
                                fallback={isEn ? "Read Biography" : "Les mer"}
                              />
                            </span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 6: BIBLICAL TIMELINE */}
        {activeTab === "timeline" && (
          <ResourcesTimeline
            {...{
              activeTimelineSection,
              handleScriptureRefLink,
              isEn,
              language,
              setActiveTimelineSection,
              setTimelineSubTab,
              timelineSubTab,
            }}
          />
        )}
      </main>

      {/* Selected Character Detail Modal */}
      <AnimatePresence>
        {selectedCharacter &&
          (() => {
            const charName =
              selectedCharacter.name[language] || selectedCharacter.name.no;
            const charRole =
              selectedCharacter.role[language] || selectedCharacter.role.no;
            const charEra =
              selectedCharacter.era[language] || selectedCharacter.era.no;
            const charMeaning =
              selectedCharacter.meaning[language] ||
              selectedCharacter.meaning.no;
            const charSummary =
              selectedCharacter.summary[language] ||
              selectedCharacter.summary.no;
            const charStory =
              selectedCharacter.story[language] || selectedCharacter.story.no;
            const charTheology =
              selectedCharacter.theologicalSignificance[language] ||
              selectedCharacter.theologicalSignificance.no;

            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedCharacter(null)}
                className="fixed inset-0 z-[70] bg-[#561291]/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100"
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-slate-50">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-burnt-orange uppercase tracking-wider block font-sans">
                        {isEn
                          ? "Biblical Character Profile"
                          : "Profil av bibelsk person"}
                      </span>
                      <h3 className="font-sans font-extrabold text-lg text-primary leading-tight">
                        {charName}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedCharacter(null)}
                      className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-primary transition-all cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6 md:space-y-0 md:grid md:grid-cols-12 md:gap-8 font-sans scrollbar-thin">
                    {/* Left Column: Image and quick facts */}
                    <div className="md:col-span-4 space-y-5">
                      <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden shadow-sm border border-slate-200/40 relative">
                        <img
                          src={selectedCharacter.image}
                          alt={charName}
                          className="w-full h-full object-cover object-top"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                        <div className="hidden absolute inset-0 bg-gradient-to-br from-[#561291]/10 to-[#bd4f2a]/10 items-center justify-center font-bold text-6xl text-primary">
                          {charName.substring(0, 1)}
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-4">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                            {isEn ? "Name Meaning" : "Navnets betydning"}
                          </span>
                          <span className="text-xs font-bold text-primary mt-0.5 block leading-normal">
                            {charMeaning}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                            {isEn ? "Historical Era" : "Historisk tid"}
                          </span>
                          <span className="text-xs font-bold text-slate-700 mt-0.5 block">
                            {charEra}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                            {isEn ? "Biblical Role" : "Rolle / Tittel"}
                          </span>
                          <span className="text-xs font-bold text-slate-700 mt-0.5 block">
                            {charRole}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Biography & Significance */}
                    <div className="md:col-span-8 space-y-6">
                      {/* Excerpt */}
                      <p className="text-sm font-bold text-primary leading-relaxed font-sans bg-primary/5 p-4 rounded-xl border border-primary/10">
                        {charSummary}
                      </p>

                      {/* Biography */}
                      <div className="space-y-2">
                        <h4 className="font-sans font-extrabold text-sm text-primary uppercase tracking-wide border-b pb-1.5">
                          {isEn
                            ? "Biblical Biography & History"
                            : "Biografi og bibelsk historie"}
                        </h4>
                        <div className="text-xs text-slate-600 leading-relaxed space-y-3 font-medium text-justify whitespace-pre-line">
                          {charStory}
                        </div>
                      </div>

                      {/* Theological Significance */}
                      <div className="space-y-2">
                        <h4 className="font-sans font-extrabold text-sm text-primary uppercase tracking-wide border-b pb-1.5">
                          {isEn
                            ? "Theological Significance"
                            : "Teologisk betydning"}
                        </h4>
                        <div className="text-xs text-slate-600 leading-relaxed space-y-3 font-medium text-justify whitespace-pre-line">
                          {charTheology}
                        </div>
                      </div>

                      {/* Key Verses Links */}
                      <div className="space-y-2">
                        <h4 className="font-sans font-extrabold text-sm text-primary uppercase tracking-wide border-b pb-1.5">
                          {isEn
                            ? "Key Bible Passages"
                            : "Sentrale bibelske skrifter"}
                        </h4>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {selectedCharacter.verses.map((ref, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedCharacter(null);
                                handleScriptureRefLink(ref, "characters");
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-[#561291] hover:text-white border border-slate-200 text-primary rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95"
                            >
                              <BookOpen size={11} />
                              <span>{ref}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
      </AnimatePresence>

      {/* Flytende gå-tilbake-knapp sentrert nederst på skjermen */}
      <AnimatePresence>
        {(returnOriginTab || previousReference) && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-6 left-1/2 z-50 select-none pointer-events-auto"
          >
            {returnOriginTab ? (
              <button
                onClick={() => {
                  setActiveTab(returnOriginTab);
                  setReturnOriginTab(null);
                }}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-burnt-orange to-[#bd4f2a] hover:from-[#bd4f2a] hover:to-[#a03d1e] text-white shadow-xl shadow-burnt-orange/25 rounded-full text-xs font-extrabold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.95] cursor-pointer border-2 border-white/20 backdrop-blur-sm"
              >
                <ArrowLeft size={14} className="stroke-[3] animate-pulse" />
                <span>
                  {returnOriginTab === "characters"
                    ? isEn
                      ? "Back to Characters"
                      : "Tilbake til personer"
                    : isEn
                      ? "Back to Timeline"
                      : "Tilbake til tidslinje"}
                </span>
              </button>
            ) : (
              <button
                onClick={handleGoBackToReference}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-[#2c6e91] hover:from-[#153b52] hover:to-[#225672] text-white shadow-xl shadow-primary/25 rounded-full text-xs font-extrabold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.95] cursor-pointer border-2 border-white/20 backdrop-blur-sm"
              >
                <ArrowLeft size={14} className="stroke-[3] animate-pulse" />
                <span>
                  Tilbake til {previousReference.book.nor}{" "}
                  {previousReference.chapter}
                  {previousReference.verse ? `:${previousReference.verse}` : ""}
                </span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Book/Chapter Selector Modal for Mobile & Desktop */}
      <ResourcesSelector
        {...{
          isEn,
          readerRef,
          selectedBook,
          selectedChapter,
          selectorSearch,
          selectorTab,
          setSelectedBook,
          setSelectedChapter,
          setSelectorSearch,
          setSelectorTab,
          setShowMobileSelector,
          showMobileSelector,
        }}
      />

      {/* Mobile Bottom Thumb-Navigation Pill (Ergonomisk) */}
      <AnimatePresence>
        {selectedVerses.length === 0 && !showMobileSelector && (
          <div
            className="fixed bottom-6 z-[55] flex justify-center pointer-events-none select-none"
            style={
              cardPosition.width > 0
                ? {
                    left: `${cardPosition.left + cardPosition.width / 2}px`,
                    transform: "translate3d(-50%, 0, 0)",
                  }
                : {
                    left: "50%",
                    transform: "translate3d(-50%, 0, 0)",
                  }
            }
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="bg-white/95 backdrop-blur-md text-slate-800 border border-slate-200/80 px-3 py-1 rounded-full flex items-center justify-between gap-2 shadow-lg w-[75vw] max-w-[260px] pointer-events-auto"
            >
              <button
                onClick={() => navigateChapter("prev")}
                className="p-1.5 text-slate-500 hover:text-slate-800 active:scale-[0.9] transition-all cursor-pointer bg-transparent border-none outline-none flex items-center justify-center shrink-0"
                title={isEn ? "Previous chapter" : "Forrige kapittel"}
              >
                <ArrowLeft size={16} />
              </button>

              <button
                onClick={() => {
                  setSelectorTab("book");
                  setSelectorSearch("");
                  setShowMobileSelector(true);
                }}
                className="flex-grow text-center font-sans font-extrabold text-[13px] hover:text-slate-900 active:scale-[0.97] transition-all flex items-center gap-1 justify-center py-1 px-2 bg-transparent border-none outline-none text-slate-800 cursor-pointer select-none"
              >
                <span>
                  {selectedBook.nor} {selectedChapter}
                </span>
                <ChevronDown size={10} className="text-slate-400" />
              </button>

              <button
                onClick={() => navigateChapter("next")}
                className="p-1.5 text-slate-500 hover:text-slate-800 active:scale-[0.9] transition-all cursor-pointer bg-transparent border-none outline-none flex items-center justify-center shrink-0"
                title={isEn ? "Next chapter" : "Neste kapittel"}
              >
                <ArrowRight size={16} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Actions Dialog when verses are selected */}
      <AnimatePresence>
        {selectedVerses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: 50, x: "-50%", scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed bottom-8 z-[100] bg-white/95 backdrop-blur-md border border-slate-200/80 px-4 sm:px-6 py-3 rounded-2xl flex items-center justify-between gap-3 sm:gap-4 text-slate-800 shadow-2xl font-sans max-w-[92vw] sm:max-w-md w-max pointer-events-auto"
            style={
              cardPosition.width > 0
                ? {
                    left: `${cardPosition.left + cardPosition.width / 2}px`,
                    transform: "translate3d(-50%, 0, 0)",
                  }
                : {
                    left: "50%",
                    transform: "translate3d(-50%, 0, 0)",
                  }
            }
          >
            <div className="flex items-center gap-2 border-r border-slate-200/80 pr-2.5 sm:pr-3 shrink-0">
              <span className="h-6 w-6 rounded-full bg-[#561291] text-white flex items-center justify-center text-xs font-bold font-mono">
                {selectedVerses.length}
              </span>
              <span className="text-[11px] sm:text-xs font-extrabold text-slate-800 hidden min-[360px]:inline">
                {selectedVerses.length === 1 ? "vers" : "vers"} valgt
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <button
                onClick={handleBulkCopy}
                className="px-2.5 sm:px-3 py-1.5 bg-[#561291] hover:bg-[#561291] active:scale-[0.96] rounded-xl font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer text-white text-[11px] sm:text-xs border-none"
              >
                <Copy size={13} className="text-white" />
                <span>Kopier</span>
              </button>

              <button
                onClick={() => navigate("/login")}
                className="px-2.5 sm:px-3 py-1.5 bg-[#561291] hover:bg-[#561291] active:scale-[0.96] rounded-xl font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer text-white text-[11px] sm:text-xs border-none"
              >
                <Sparkles size={13} />
                <span>Logg inn</span>
              </button>

              <button
                onClick={() => {
                  setSelectedVerses([]);
                  setHighlightedVerse(null);
                }}
                className="p-1.5 text-[#561291]/70 hover:text-[#561291] hover:bg-[#561291]/5 rounded-xl transition-all cursor-pointer font-bold shrink-0 bg-transparent border-none outline-none"
                title="Nullstill"
              >
                <X size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
