import BibleReader from "../features/bible/panels/BibleReader";
import BibleTimeline from "../features/bible/panels/BibleTimeline";
import BibleSelector from "../features/bible/panels/BibleSelector";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { useState, useRef, useEffect } from "react";
import { BIBLE_BOOKS } from "../features/bible/lib/BIBLE_BOOKS";
import { TRANSLATIONS } from "../features/bible/lib/TRANSLATIONS";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { generateDynamicCommentary } from "../features/bible/lib/generateDynamicCommentary";
import { parseBibleReference } from "../features/bible/lib/parseBibleReference";
import { findBibleBook } from "../features/bible/lib/findBibleBook";
import {
  BookOpen,
  Users,
  History,
  Search,
  BookMarked,
  ArrowLeft,
  ChevronDown,
  Type,
  Edit3,
  Minimize2,
  Maximize2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Share2,
  X,
  Loader2,
  Check,
  Send,
  Save,
  Trash2,
  Copy,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { STUDY_BIBLE_DATA } from "../features/bible/lib/STUDY_BIBLE_DATA";
import { biblicalCharacters } from "@/lib/bibelske-personer-data";
import { timelineData, empiresData } from "@/lib/timelineData";

export default function BibleView() {
  const navigate = useNavigate();
  const {
    showToast,
    sendAssistantMessage,
    user,
    setAssistantContext,
    isAdminEditing,
    setIsAdminEditing,
    language,
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

  const [activeViewTab, setActiveViewTab] = useState("bible"); // bible, characters, timeline

  // Biblical Characters and Timeline States
  const [characterSearch, setCharacterSearch] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [timelineSubTab, setTimelineSubTab] = useState("history"); // history, empires
  const [activeTimelineSection, setActiveTimelineSection] =
    useState("urhistorien");
  const [returnOriginTab, setReturnOriginTab] = useState(null);

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
  const [previousReference, setPreviousReference] = useState(null);

  // Fullscreen Mobile Selector States
  const [showMobileSelector, setShowMobileSelector] = useState(false);
  const [selectorTab, setSelectorTab] = useState("book"); // book, chapter
  const [selectorSearch, setSelectorSearch] = useState("");

  // Study Bible & Commentary States
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

  useEffect(() => {
    if (selectedBook && selectedChapter) {
      const transName =
        TRANSLATIONS.find((t) => t.id === selectedTranslation)?.name ||
        selectedTranslation.toUpperCase();
      setAssistantContext({
        pageType: "bible",
        title: `Bibelen: ${selectedBook.nor} ${selectedChapter}`,
        book: selectedBook.nor,
        chapter: selectedChapter,
        translation: selectedTranslation,
        translationName: transName,
        content: `Brukeren leser ${selectedBook.nor} kapittel ${selectedChapter} i oversettelsen ${transName}.`,
      });
    }
    return () => setAssistantContext(null);
  }, [selectedBook, selectedChapter, selectedTranslation, setAssistantContext]);

  // Load notes for current book and chapter
  useEffect(() => {
    const loadNote = async () => {
      if (!selectedBook) return;
      const refKey = `${selectedBook.id}_${selectedChapter}`;
      const cacheKey = `hkm-bible-note-${user?.uid || "guest"}-${refKey}`;

      // Try local cache first for instant loading
      const cached = localStorage.getItem(cacheKey);
      setNoteText(cached || "");
      setNoteSaveStatus("idle");

      if (!user?.uid) return;

      try {
        setNoteSaveStatus("loading");
        const docRef = doc(db, "bible_notes", `${user.uid}_${refKey}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const content = data.content || "";
          setNoteText(content);
          localStorage.setItem(cacheKey, content);
          setNoteSaveStatus("saved");
        } else {
          setNoteSaveStatus("idle");
        }
      } catch (err) {
        console.error("Feil ved lasting av notater:", err);
        setNoteSaveStatus("error");
      }
    };

    loadNote();

    // Clear any pending auto-saves when switching chapters
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  }, [selectedBook, selectedChapter, user]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleSaveNote = async (textToSave = noteText) => {
    if (!selectedBook) return;
    const refKey = `${selectedBook.id}_${selectedChapter}`;
    const cacheKey = `hkm-bible-note-${user?.uid || "guest"}-${refKey}`;

    // Always save to localStorage immediately
    localStorage.setItem(cacheKey, textToSave);
    setNoteSaveStatus("saving");

    if (!user?.uid) {
      // For guests, we only have local storage
      setTimeout(() => {
        setNoteSaveStatus("saved");
      }, 500);
      return;
    }

    try {
      const docRef = doc(db, "bible_notes", `${user.uid}_${refKey}`);
      await setDoc(
        docRef,
        {
          userId: user.uid,
          userName: user.name || "",
          bookId: selectedBook.id,
          bookName: selectedBook.nor,
          chapter: selectedChapter,
          content: textToSave,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      setNoteSaveStatus("saved");
    } catch (err) {
      console.error("Feil ved lagring av notater:", err);
      setNoteSaveStatus("error");
      showToast(
        "Kunne ikke synkronisere notatene til skyen. De er lagret lokalt.",
      );
    }
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

  const handleSendNoteToAssistant = () => {
    if (!noteText.trim()) {
      showToast("Skriv et notat først!");
      return;
    }
    const assistantPrompt = `Jeg studerer ${selectedBook.nor} ${selectedChapter} og har skrevet følgende notater og refleksjoner:\n\n"${noteText}"\n\nKan du hjelpe meg å utdype disse refleksjonene ut fra et teologisk og historisk perspektiv?`;
    sendAssistantMessage(assistantPrompt);
    showToast("Sendt til HKM Assistent! Åpne chatten nede til høyre.");
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("hkm-open-chat"));
    }, 500);
  };

  const handleShareNoteToChat = () => {
    if (!noteText.trim()) {
      showToast("Skriv et notat først!");
      return;
    }
    const shareMessage = `Hei alle sammen! 📖 Her er mine studie-notater og refleksjoner fra **${selectedBook.nor} ${selectedChapter}** i dag:\n\n"${noteText}"`;
    localStorage.setItem("hkm-pending-chat-message", shareMessage);
    showToast("Deling klargjort! Sender deg til bønnefellesskapet...");
    setTimeout(() => {
      navigate("/student/chat");
    }, 1200);
  };

  const handleClearNote = async () => {
    if (
      !window.confirm(
        "Er du sikker på at du vil slette notatet for dette kapittelet? Dette kan ikke angres.",
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

    if (!user?.uid) {
      showToast("Notatet er slettet.");
      return;
    }

    try {
      const docRef = doc(db, "bible_notes", `${user.uid}_${refKey}`);
      await deleteDoc(docRef);
      showToast("Notatet er slettet.");
    } catch (err) {
      console.error("Feil ved sletting av notater:", err);
      showToast(
        "Kunne ikke slette notatet fra skyen, men det er fjernet lokalt.",
      );
    }
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
    showToast(`${selectedVerses.length} vers kopiert til utklippstavlen!`);
    setSelectedVerses([]);
  };

  const handleBulkSendToAssistant = () => {
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

    const assistantPrompt = `Jeg studerer akkurat ${selectedBook.nor} ${selectedChapter}:${verseRange} som lyder:\n\n"${combinedText}"\n\nKan du gi meg en dypere teologisk, historisk og profetisk kommentar av disse versene og hvordan de henger sammen?`;
    sendAssistantMessage(assistantPrompt);
    showToast("Sendt til HKM Assistent! Åpne chatten nede til høyre.");
    setSelectedVerses([]);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("hkm-open-chat"));
    }, 500);
  };

  const handleBulkShareToChat = () => {
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

    const shareMessage = `Hei alle sammen! 📖 Her er et avsnitt fra bibelstudiet mitt i dag:\n\n*"${combinedText}"*\n— **${selectedBook.nor} ${selectedChapter}:${verseRange}** (${translationName})`;
    localStorage.setItem("hkm-pending-chat-message", shareMessage);
    showToast("Deling klargjort! Sender deg til bønnefellesskapet...");
    setSelectedVerses([]);
    setTimeout(() => {
      navigate("/student/chat");
    }, 1200);
  };

  const handleGenerateCommentary = () => {
    setIsGeneratingCommentary(true);
    setGenerationStep(0);

    const steps = [
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
        showToast(
          `Teologisk kommentar for ${selectedBook.nor} ${selectedChapter} er klar!`,
        );
      }
    }, 600);
  };

  // Load verses when book, chapter, or translation changes
  useEffect(() => {
    fetchBibleChapter();
  }, [selectedBook, selectedChapter, selectedTranslation]);

  // Handle smooth scroll to highlighted verse when verses finish loading
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
      showToast(
        "Klarte ikke å laste bibelkapittelet. Sjekk internettforbindelsen.",
      );
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
          showToast(
            `Viser ${foundBook.nor} ${clampedChapter} med vers ${parsedRef.verse} uthevet!`,
          );
        } else {
          setHighlightedVerse(null);
          showToast(`Viser ${foundBook.nor} ${clampedChapter}!`);
        }

        // Scroll the reading pane into focus so the user sees it immediately
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
      setActiveViewTab("bible");
    }
  };

  const handleGoBackToReference = () => {
    if (!previousReference) return;
    setSelectedBook(previousReference.book);
    setSelectedChapter(previousReference.chapter);
    setHighlightedVerse(previousReference.verse);

    showToast(
      `Returnerte til ${previousReference.book.nor} ${previousReference.chapter}${previousReference.verse ? `:${previousReference.verse}` : ""}!`,
    );

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

    // 1. Try loading directly as a specific Bible reference
    const success = loadBibleReference(searchQuery);
    if (success) {
      setSearchQuery("");
      return;
    }

    // 2. Fallback to API-based keyword or complex query search
    setIsLoading(true);
    setVerses([]);
    try {
      let cleanQuery = searchQuery.trim();
      // Replace norwegian book names with english for the API
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
          // If we got verses, let's check if the search query looks like a specific verse query that the API returned
          // If we detected a single book and chapter, and the user's query contains a number (likely a chapter/verse),
          // let's load the entire chapter instead of showing only a single verse! This is a wonderful UX fail-safe!
          const hasNumbers = /\d+/.test(searchQuery);
          if (detectedBook && hasNumbers && resultVerses.length === 1) {
            setSelectedBook(detectedBook);
            setSelectedChapter(detectedChapter);
            setHighlightedVerse(resultVerses[0].verse);
            showToast(
              `Viser hele ${detectedBook.nor} ${detectedChapter} med vers ${resultVerses[0].verse} uthevet!`,
            );
            setSearchQuery("");
            return;
          }

          setVerses(resultVerses);
          if (detectedBook) {
            setSelectedBook(detectedBook);
            setSelectedChapter(detectedChapter);
          }
          showToast("Søk fullført!");
        } else {
          showToast("Ingen vers funnet for dette søket.");
        }
      } else {
        showToast(
          'Fant ikke skriftstedet. Prøv f.eks. "Johannes 3:16" eller "Salme 23".',
        );
      }
    } catch (err) {
      console.error(err);
      showToast(
        'Fant ikke skriftstedet. Sjekk stavelsen og formatet (f.eks. "Johannes 3:16").',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (verse) => {
    const textToCopy = `"${verse.text.trim()}" — ${selectedBook.nor} ${verse.chapter}:${verse.verse} (${TRANSLATIONS.find((t) => t.id === selectedTranslation)?.name})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(verse.verse);
    showToast("Kopiert til utklippstavle!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareToChat = (verse) => {
    const shareMessage = `Her er et kraftfullt skriftsted jeg leste i Bibelen:\n\n*"${verse.text.trim()}"*\n— **${selectedBook.nor} ${verse.chapter}:${verse.verse}** (${TRANSLATIONS.find((t) => t.id === selectedTranslation)?.name})`;
    localStorage.setItem("hkm-pending-chat-message", shareMessage);
    showToast("Klar til å deles! Sender deg til bønnefellesskapet...");
    setTimeout(() => {
      navigate("/student/chat");
    }, 1200);
  };

  const handleSendToAssistant = (verse) => {
    const assistantPrompt = `Jeg leste akkurat ${selectedBook.nor} ${verse.chapter}:${verse.verse} som sier: "${verse.text.trim()}". Kan du gi meg en dypere teologisk og profetisk forklaring av dette skriftstedet og hva det betyr for oss i dag?`;
    sendAssistantMessage(assistantPrompt);
    showToast("Sendt til HKM Assistent! Åpne chatten nede til høyre.");
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("hkm-open-chat"));
    }, 500);
  };

  const navigateChapter = (direction) => {
    setHighlightedVerse(null); // Reset highlight when navigating chapters
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
    // Scroll the reading pane into view, respecting the sticky header offset
    if (readerRef.current) {
      readerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const filteredBooks = BIBLE_BOOKS.filter((book) => {
    if (testamentFilter === "all") return true;
    return book.testament === testamentFilter;
  });

  return (
    <main className="flex-grow p-4 md:p-10 space-y-8" ref={topRef}>
      {/* Header and navigation */}
      <section className="space-y-3">
        <nav className="flex items-center gap-2 text-xs font-semibold text-outline">
          <span
            className="hover:text-primary cursor-pointer"
            onClick={() => navigate("/student/dashboard")}
          >
            Hjem
          </span>
          <span>/</span>
          <span className="text-primary font-bold">Bibelen</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary flex items-center gap-2.5">
              {activeViewTab === "bible" && (
                <BookOpen className="text-primary" size={28} />
              )}
              {activeViewTab === "characters" && (
                <Users className="text-primary" size={28} />
              )}
              {activeViewTab === "timeline" && (
                <History className="text-primary" size={28} />
              )}
              {activeViewTab === "bible" && "Den Hellige Skrift"}
              {activeViewTab === "characters" && "Bibelske personer"}
              {activeViewTab === "timeline" && "Bibelsk tidslinje"}
            </h1>
            <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
              {activeViewTab === "bible" &&
                "Utforsk, les og studer Guds ord i ulike oversettelser. Klikk på vers for å dele dem med bønnefellesskapet, kopiere eller be HKM Assistenten om en dypere teologisk utredning."}
              {activeViewTab === "characters" &&
                "Utforsk biografiene, de sentrale bibelske skriftene, og den teologiske betydningen av Bibelens mest sentrale skikkelser."}
              {activeViewTab === "timeline" &&
                "Følg den røde tråden gjennom Bibelens historiske epoker og få oversikt over imperiene som formet den bibelske historien."}
            </p>
          </div>

          {/* Quick search input (only shown on bible tab) */}
          {activeViewTab === "bible" && (
            <form onSubmit={handleSearch} className="w-full md:w-80 shrink-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Søk f.eks. 'Johannes 3:16'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-outline-variant/60 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium shadow-sm"
                />
                <button
                  type="submit"
                  className="absolute left-1.5 top-0 bottom-0 my-auto h-8 w-8 flex items-center justify-center text-primary hover:text-primary-container hover:bg-slate-100/60 rounded-lg transition-colors m-0 p-0 border-none outline-none cursor-pointer"
                >
                  <Search size={18} />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-none h-14 items-center gap-6 mt-4">
          {[
            { id: "bible", label: "Bibel", icon: BookOpen },
            { id: "characters", label: "Bibelske personer", icon: Users },
            { id: "timeline", label: "Bibelsk tidslinje", icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeViewTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveViewTab(tab.id)}
                className={`flex items-center gap-2 h-full px-2 text-sm font-bold border-b-2 transition-all relative ${
                  isActive
                    ? "border-primary text-primary font-extrabold"
                    : "border-transparent text-slate-500 hover:text-primary hover:border-primary/30"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main interactive grid layout */}
      {activeViewTab === "bible" ? (
        <BibleReader
          {...{
            cardContainerRef,
            filteredBooks,
            generatedCommentaries,
            generationStep,
            getTextSizeClass,
            handleClearNote,
            handleGenerateCommentary,
            handleGoBackToReference,
            handleNoteChange,
            handleSaveNote,
            handleSendNoteToAssistant,
            handleShareNoteToChat,
            highlightedVerse,
            isAdminEditing,
            isAdminUser,
            isFullscreenReading,
            isGeneratingCommentary,
            isLoading,
            loadBibleReference,
            navigateChapter,
            noteSaveStatus,
            noteText,
            previousReference,
            readerRef,
            returnOriginTab,
            selectedBook,
            selectedChapter,
            selectedTranslation,
            selectedVerses,
            setActiveViewTab,
            setIsAdminEditing,
            setIsFullscreenReading,
            setReturnOriginTab,
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
      ) : activeViewTab === "characters" ? (
        <div className="space-y-10 animate-in fade-in duration-300">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h3 className="font-serif text-2xl font-bold text-primary">
              {isEn ? "Biblical Characters Catalog" : "Bibelske personer"}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              {isEn
                ? "Explore the biographies, key scripture passages, and theological significance of the central figures of the biblical narrative."
                : "Utforsk biografiene, de sentrale bibelske skriftene, og den teologiske betydningen av Bibelens mest sentrale skikkelser."}
            </p>
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
                  {isEn
                    ? "No characters match your search query."
                    : "Ingen personer samsvarer med søket ditt."}
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {filtered.map((char) => {
                  const charName = char.name[language] || char.name.no;
                  const charRole = char.role[language] || char.role.no;
                  const charEra = char.era[language] || char.era.no;
                  const charSummary = char.summary[language] || char.summary.no;

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
                          <h4 className="font-serif text-lg font-bold text-primary group-hover:text-burnt-orange transition-colors">
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
                          <span>{isEn ? "Read Biography" : "Les mer"}</span>
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
      ) : (
        <BibleTimeline
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
                      <h3 className="font-serif font-extrabold text-lg text-primary leading-tight">
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
                      <p className="text-sm font-bold text-primary leading-relaxed font-serif bg-primary/5 p-4 rounded-xl border border-primary/10">
                        {charSummary}
                      </p>

                      {/* Biography */}
                      <div className="space-y-2">
                        <h4 className="font-serif font-extrabold text-sm text-primary uppercase tracking-wide border-b pb-1.5">
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
                        <h4 className="font-serif font-extrabold text-sm text-primary uppercase tracking-wide border-b pb-1.5">
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
                        <h4 className="font-serif font-extrabold text-sm text-primary uppercase tracking-wide border-b pb-1.5">
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
                  setActiveViewTab(returnOriginTab);
                  setReturnOriginTab(null);
                }}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-burnt-orange to-[#bd4f2a] hover:from-[#bd4f2a] hover:to-[#a03d1e] text-white shadow-xl shadow-burnt-orange/25 rounded-full text-xs font-extrabold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.95] cursor-pointer border-2 border-white/20 backdrop-blur-sm"
              >
                <ArrowLeft size={14} className="stroke-[3] animate-pulse" />
                <span>
                  {returnOriginTab === "characters"
                    ? "Tilbake til personer"
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
      <BibleSelector
        {...{
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
                title="Forrige kapittel"
              >
                <ArrowLeft size={16} />
              </button>

              <button
                onClick={() => {
                  setSelectorTab("book");
                  setSelectorSearch("");
                  setShowMobileSelector(true);
                }}
                className="flex-grow text-center font-serif font-extrabold text-[13px] hover:text-slate-900 active:scale-[0.97] transition-all flex items-center gap-1 justify-center py-1 px-2 bg-transparent border-none outline-none text-slate-800 cursor-pointer select-none"
              >
                <span>
                  {selectedBook.nor} {selectedChapter}
                </span>
                <ChevronDown size={10} className="text-slate-400" />
              </button>

              <button
                onClick={() => navigateChapter("next")}
                className="p-1.5 text-slate-500 hover:text-slate-800 active:scale-[0.9] transition-all cursor-pointer bg-transparent border-none outline-none flex items-center justify-center shrink-0"
                title="Neste kapittel"
              >
                <ArrowRight size={16} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium Floating Actions Dialog when verses are selected */}
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

            <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
              <button
                onClick={handleBulkCopy}
                className="px-2.5 sm:px-3 py-1.5 bg-[#561291] hover:bg-[#561291] active:scale-[0.96] rounded-xl font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer text-white text-[11px] sm:text-xs border-none"
                title="Kopier markerte vers"
              >
                <Copy size={13} className="text-white" />
                <span>Kopier</span>
              </button>

              <button
                onClick={handleBulkSendToAssistant}
                className="px-2.5 sm:px-3 py-1.5 bg-[#561291] hover:bg-[#561291] active:scale-[0.96] rounded-xl font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer text-white text-[11px] sm:text-xs border-none"
                title="Spør HKM-assistenten"
              >
                <Sparkles size={13} />
                <span>Spør HKM</span>
              </button>

              <button
                onClick={handleBulkShareToChat}
                className="px-2.5 sm:px-3 py-1.5 bg-[#561291] hover:bg-[#561291] active:scale-[0.96] rounded-xl font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer text-white text-[11px] sm:text-xs border-none"
                title="Del i chatten"
              >
                <Send size={13} className="text-white" />
                <span>Del</span>
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
    </main>
  );
}
