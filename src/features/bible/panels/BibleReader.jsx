import React from "react";
import {
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
  BookOpen,
  Loader2,
  Check,
  Send,
  Save,
  Trash2,
} from "lucide-react";
import { TRANSLATIONS } from "../lib/TRANSLATIONS";
import { AnimatePresence, motion } from "framer-motion";
import { STUDY_BIBLE_DATA } from "../lib/STUDY_BIBLE_DATA";

export default function BibleReader({
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
}) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Book and chapter selection pane (Desktop only) */}
      <div
        className={`hidden lg:block ${showStudyPanel ? "lg:col-span-3" : "lg:col-span-4"} space-y-6 lg:sticky lg:top-24`}
      >
        <div className="bg-white border border-outline-variant/20 rounded-2xl p-5 shadow-sm space-y-5">
          <h2 className="font-serif font-bold text-base text-primary flex items-center gap-2 border-b border-slate-100 pb-3">
            <BookMarked size={18} />
            Bok- og kapittelvelger
          </h2>

          {/* Translation Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">
              Oversettelse
            </label>
            <select
              value={selectedTranslation}
              onChange={(e) => setSelectedTranslation(e.target.value)}
              className="w-full bg-slate-50 border border-outline-variant rounded-xl px-3 py-2.5 text-sm font-semibold text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {TRANSLATIONS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Testament Filter Toggles */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-xl">
            <button
              onClick={() => setTestamentFilter("all")}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                testamentFilter === "all"
                  ? "bg-primary text-white shadow-sm"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              Alle
            </button>
            <button
              onClick={() => setTestamentFilter("GT")}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                testamentFilter === "GT"
                  ? "bg-primary text-white shadow-sm"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              GT
            </button>
            <button
              onClick={() => setTestamentFilter("NT")}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                testamentFilter === "NT"
                  ? "bg-primary text-white shadow-sm"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              NT
            </button>
          </div>

          {/* Books List (scrollable) */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">
              Bibelbok
            </label>
            <div className="h-60 overflow-y-auto border border-outline-variant/40 rounded-xl bg-slate-50/50 p-2 space-y-1 scrollbar-thin">
              {filteredBooks.map((book) => (
                <button
                  key={book.id}
                  onClick={() => {
                    setSelectedBook(book);
                    setSelectedChapter(1);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex justify-between items-center transition-all ${
                    selectedBook.id === book.id
                      ? "bg-primary/5 text-primary border border-primary/20 shadow-sm font-bold"
                      : "text-on-surface-variant hover:bg-slate-100 hover:text-primary"
                  }`}
                >
                  <span>{book.nor}</span>
                  <span className="text-[10px] opacity-60 font-mono">
                    {book.testament}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Chapters Grid */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">
              Velg kapittel (1 - {selectedBook.chapters})
            </label>
            <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1 scrollbar-thin">
              {Array.from(
                { length: selectedBook.chapters },
                (_, i) => i + 1,
              ).map((chap) => (
                <button
                  key={chap}
                  onClick={() => setSelectedChapter(chap)}
                  className={`h-9 w-full rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                    selectedChapter === chap
                      ? "bg-primary text-white shadow-md font-extrabold"
                      : "bg-slate-50 text-on-surface-variant border border-outline-variant/30 hover:bg-slate-100 hover:text-primary"
                  }`}
                >
                  {chap}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Column: Bible reading pane */}
      <div
        ref={readerRef}
        className={`${showStudyPanel ? "lg:col-span-5" : "lg:col-span-8"} space-y-6 scroll-mt-24`}
      >
        <div
          ref={cardContainerRef}
          className={
            isFullscreenReading
              ? "fixed inset-0 z-50 overflow-y-auto h-screen w-screen bg-white"
              : "bg-white border border-outline-variant/20 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm flex flex-col justify-between min-h-[500px]"
          }
        >
          <div
            className={
              isFullscreenReading
                ? "max-w-4xl mx-auto w-full px-6 py-8 md:px-12 flex flex-col min-h-screen"
                : "flex flex-col justify-between h-full flex-grow"
            }
          >
            {/* Reading header with next/prev buttons and study panel toggle */}
            <div
              className={`flex items-center justify-between border-b border-slate-100 pb-3 mb-6 sticky bg-white z-20 ${
                isFullscreenReading
                  ? "top-0 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-12 md:px-12 pt-4 shadow-sm"
                  : "top-[96px] -mx-4 -mt-4 pt-4 sm:-mx-6 sm:-mt-6 sm:pt-6 sm:px-6 md:-mx-8 md:-mt-8 md:pt-8 md:px-8 rounded-t-2xl px-4"
              }`}
            >
              <button
                onClick={() => navigateChapter("prev")}
                className="p-2 bg-slate-50 text-primary border border-outline-variant/40 rounded-xl hover:bg-slate-100 hover:text-primary-container active:scale-[0.97] transition-all cursor-pointer"
                title="Forrige kapittel"
              >
                <ArrowLeft size={18} />
              </button>

              <div
                onClick={() => {
                  setSelectorTab("book");
                  setSelectorSearch("");
                  setShowMobileSelector(true);
                }}
                className={
                  isFullscreenReading
                    ? "text-center flex flex-col items-center select-none cursor-pointer group"
                    : "hidden"
                }
                title="Velg bok og kapittel"
              >
                <h2 className="font-serif font-extrabold text-lg md:text-2xl text-primary leading-tight flex items-center gap-1 sm:gap-2 justify-center">
                  <span>
                    {selectedBook.nor} {selectedChapter}
                  </span>
                  {!isFullscreenReading && (
                    <ChevronDown
                      size={14}
                      className="hidden sm:inline-block text-slate-400 group-hover:text-primary transition-transform duration-200 shrink-0"
                    />
                  )}
                </h2>
                <span className="text-[10px] font-bold text-outline tracking-wider uppercase font-mono mt-0.5 block">
                  {TRANSLATIONS.find((t) => t.id === selectedTranslation)?.name}
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Text size adjuster */}
                <button
                  onClick={() => {
                    setTextSize((prev) => {
                      if (prev === "sm") return "md";
                      if (prev === "md") return "lg";
                      if (prev === "lg") return "xl";
                      if (prev === "xl") return "2xl";
                      return "sm";
                    });
                  }}
                  className="p-2 bg-slate-50 text-primary border border-outline-variant/40 rounded-xl hover:bg-slate-100 active:scale-[0.97] transition-all cursor-pointer flex items-center gap-1"
                  title="Juster tekststørrelse"
                >
                  <Type size={16} />
                  <span className="text-[10px] font-bold uppercase">
                    {textSize.toUpperCase()}
                  </span>
                </button>

                {/* Admin CMS Edit Toggle */}
                {isAdminUser && !isFullscreenReading && (
                  <button
                    onClick={() => {
                      const nextState = !isAdminEditing;
                      setIsAdminEditing(nextState);
                      if (nextState) {
                        showToast(
                          "Visuell CMS-redigering aktivert! Klikk på tekster for å endre dem.",
                        );
                      } else {
                        showToast(
                          "Visuell redigering avsluttet. Endringer lagret.",
                        );
                      }
                    }}
                    className={`p-2 rounded-xl border active:scale-[0.97] transition-all cursor-pointer flex items-center justify-center ${
                      isAdminEditing
                        ? "bg-[#d17d39] text-white border-[#d17d39] hover:bg-[#bd4f2a] shadow-sm shadow-[#d17d39]/20"
                        : "bg-slate-50 text-primary border-outline-variant/40 hover:bg-slate-100"
                    }`}
                    title="Aktiver visuell CMS-redigering"
                  >
                    <Edit3
                      size={16}
                      className={isAdminEditing ? "animate-pulse" : ""}
                    />
                  </button>
                )}

                {/* Fullscreen toggle */}
                <button
                  onClick={() => setIsFullscreenReading(!isFullscreenReading)}
                  className={`p-2 rounded-xl border active:scale-[0.97] transition-all cursor-pointer ${
                    isFullscreenReading
                      ? "bg-amber-500 text-white border-amber-500 hover:bg-amber-600"
                      : "bg-slate-50 text-primary border-outline-variant/40 hover:bg-slate-100"
                  }`}
                  title={
                    isFullscreenReading
                      ? "Avslutt lesemodus"
                      : "Fullskjerm lesemodus"
                  }
                >
                  {isFullscreenReading ? (
                    <Minimize2 size={16} />
                  ) : (
                    <Maximize2 size={16} />
                  )}
                </button>

                {/* Hide Study Panel button in fullscreen mode */}
                {!isFullscreenReading && (
                  <button
                    onClick={() => setShowStudyPanel(!showStudyPanel)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all active:scale-[0.97] cursor-pointer ${
                      showStudyPanel
                        ? "bg-primary text-white border-primary shadow-md shadow-primary/15"
                        : "bg-slate-50 text-primary border-outline-variant/40 hover:bg-slate-100"
                    }`}
                    title="Åpne studiebibel og kommentarer"
                  >
                    <Sparkles
                      size={14}
                      className={showStudyPanel ? "animate-pulse" : ""}
                    />
                    <span className="hidden sm:inline">
                      {showStudyPanel ? "Lukk studie" : "Studiebibel"}
                    </span>
                  </button>
                )}

                <button
                  onClick={() => navigateChapter("next")}
                  className="p-2 bg-slate-50 text-primary border border-outline-variant/40 rounded-xl hover:bg-slate-100 hover:text-primary-container active:scale-[0.97] transition-all cursor-pointer"
                  title="Neste kapittel"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Back to previous reference button */}
            {(returnOriginTab || previousReference) && (
              <div className="mb-4 flex animate-fade-in justify-start select-none">
                {returnOriginTab ? (
                  <button
                    onClick={() => {
                      setActiveViewTab(returnOriginTab);
                      setReturnOriginTab(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-burnt-orange to-[#bd4f2a] hover:from-[#bd4f2a] hover:to-[#a03d1e] text-white shadow-md shadow-burnt-orange/10 rounded-full text-xs font-extrabold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] cursor-pointer"
                  >
                    <ArrowLeft size={12} className="stroke-[3]" />
                    <span>
                      {returnOriginTab === "characters"
                        ? "Tilbake til personer"
                        : "Tilbake til tidslinje"}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={handleGoBackToReference}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-[#2c6e91] hover:from-[#153b52] hover:to-[#225672] text-white shadow-md shadow-primary/10 rounded-full text-xs font-extrabold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] cursor-pointer"
                  >
                    <ArrowLeft size={12} className="stroke-[3]" />
                    <span>
                      Tilbake til {previousReference.book.nor}{" "}
                      {previousReference.chapter}
                      {previousReference.verse
                        ? `:${previousReference.verse}`
                        : ""}
                    </span>
                  </button>
                )}
              </div>
            )}

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
                    <RefreshCw
                      className="text-primary animate-spin"
                      size={32}
                    />
                    <p className="text-xs text-outline font-bold uppercase tracking-wider">
                      Henter skriftsteder...
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`select-text text-slate-800 font-serif space-y-4 pr-1 ${getTextSizeClass()}`}
                  >
                    {verses.length > 0 ? (
                      <p className="text-justify md:text-left">
                        {verses.map((verse) => {
                          const isSelected = selectedVerses.includes(
                            verse.verse,
                          );
                          const isHighlighted =
                            highlightedVerse === verse.verse;
                          return (
                            <span
                              key={`${verse.chapter}-${verse.verse}`}
                              id={`v-${verse.verse}`}
                              onClick={() => toggleVerseSelection(verse.verse)}
                              className={`inline cursor-pointer transition-all duration-200 rounded px-1.5 py-0.5 mx-0.5 select-text ${
                                isSelected
                                  ? "bg-primary/10 text-primary border-b border-primary/40 font-semibold"
                                  : isHighlighted
                                    ? "bg-amber-100 text-amber-900 border-b border-amber-400 font-semibold"
                                    : "hover:bg-slate-100/70"
                              }`}
                            >
                              <sup
                                className={`text-[10px] sm:text-[11px] font-extrabold font-sans mr-1 select-none ${
                                  isSelected
                                    ? "text-primary"
                                    : isHighlighted
                                      ? "text-amber-600"
                                      : "text-slate-400"
                                }`}
                              >
                                {verse.verse}
                              </sup>
                              {verse.text.trim()}{" "}
                            </span>
                          );
                        })}
                      </p>
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
            {!isFullscreenReading && (
              <div className="mt-8 border-t border-slate-100 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-outline font-medium">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Share2 size={13} />
                  Klikk på et vers for å dele det, få forklaring eller krysslese
                  kommentarer.
                </span>
                <span className="italic">
                  Husk å undersøke skriftene selv for å hente full åpenbaring!
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Study Bible & Commentary Panel */}
      {showStudyPanel && (
        <div
          onClick={() => setShowStudyPanel(false)}
          className="fixed inset-0 z-50 bg-[#240046]/45 backdrop-blur-sm flex items-end justify-center p-0 lg:static lg:bg-transparent lg:backdrop-blur-none lg:z-auto lg:block lg:col-span-4 lg:space-y-6 lg:sticky lg:top-24"
        >
          <motion.div
            initial={
              typeof window !== "undefined" && window.innerWidth < 1024
                ? { y: "100%" }
                : {}
            }
            animate={
              typeof window !== "undefined" && window.innerWidth < 1024
                ? { y: 0 }
                : {}
            }
            exit={
              typeof window !== "undefined" && window.innerWidth < 1024
                ? { y: "100%" }
                : {}
            }
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-t border-slate-200 lg:border lg:border-outline-variant/20 rounded-t-3xl lg:rounded-2xl p-5 shadow-2xl lg:shadow-sm space-y-4 flex flex-col w-full max-w-xl lg:max-w-none h-[80vh] lg:h-auto lg:min-h-[500px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-burnt-orange uppercase tracking-wider block">
                  Studiebibel & Kommentar
                </span>
                <h3 className="font-serif font-extrabold text-base text-primary">
                  {selectedBook.nor} {selectedChapter}
                </h3>
              </div>
              <button
                onClick={() => setShowStudyPanel(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-all cursor-pointer"
                title="Lukk studiepanel"
              >
                <X size={16} />
              </button>
            </div>

            {/* Loader or Content */}
            {isGeneratingCommentary ? (
              <div className="flex-grow flex flex-col items-center justify-center py-16 text-center space-y-4">
                <RefreshCw
                  className="text-burnt-orange animate-spin"
                  size={28}
                />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-primary uppercase tracking-wide">
                    Analyserer skriftene...
                  </p>
                  <p className="text-[11px] text-outline font-medium animate-pulse">
                    {generationStep === 0
                      ? "Søker i de hellige skrifter..."
                      : generationStep === 1
                        ? "Analyserer teologisk kontekst..."
                        : generationStep === 2
                          ? "Slår opp gresk og hebraisk grunntekst..."
                          : generationStep === 3
                            ? "Utarbeider eksegetisk kommentar..."
                            : "Ferdigstiller studiekommentar..."}
                  </p>
                </div>
              </div>
            ) : (
              (() => {
                const refKey = `${selectedBook.id}_${selectedChapter}`;
                const studyData =
                  STUDY_BIBLE_DATA[refKey] || generatedCommentaries[refKey];

                if (!studyData) {
                  return (
                    <div className="flex-grow flex flex-col items-center justify-center py-12 px-4 text-center space-y-5">
                      <div className="h-12 w-12 rounded-full bg-burnt-orange/5 flex items-center justify-center text-burnt-orange">
                        <Sparkles size={22} className="animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-serif font-bold text-sm text-primary">
                          Ingen studiekommentar lastet inn
                        </h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          Vil du at HKM teologiske AI-assistent skal utarbeide
                          en eksegetisk og profetisk kommentar av dette
                          kapittelet?
                        </p>
                      </div>
                      <button
                        onClick={handleGenerateCommentary}
                        className="w-full py-2.5 bg-burnt-orange text-white rounded-xl text-xs font-bold hover:bg-burnt-orange-dark shadow-sm active:scale-[0.97] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles size={13} />
                        <span>Generer studiekommentar</span>
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="flex-grow flex flex-col min-h-0 space-y-4">
                    {/* Tabs */}
                    <div className="flex bg-slate-50 p-1 rounded-xl text-[10px] font-bold shrink-0">
                      <button
                        onClick={() => setStudyTab("overview")}
                        className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${studyTab === "overview" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-primary"}`}
                      >
                        Oversikt
                      </button>
                      <button
                        onClick={() => setStudyTab("commentary")}
                        className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${studyTab === "commentary" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-primary"}`}
                      >
                        Kommentar
                      </button>
                      <button
                        onClick={() => setStudyTab("cross")}
                        className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${studyTab === "cross" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-primary"}`}
                      >
                        Ord & Ref
                      </button>
                      <button
                        onClick={() => setStudyTab("notes")}
                        className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${studyTab === "notes" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-primary"}`}
                      >
                        Notater
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-grow overflow-y-auto max-h-[480px] pr-1 space-y-4 scrollbar-thin text-xs">
                      {studyTab === "overview" && (
                        <div className="space-y-4 animate-fade-in">
                          <div className="bg-slate-50 border border-outline-variant/30 p-3.5 rounded-xl space-y-2">
                            <h5 className="font-serif font-bold text-primary text-xs flex items-center gap-1.5">
                              <BookOpen
                                size={12}
                                className="text-burnt-orange"
                              />
                              Teologisk sammendrag
                            </h5>
                            <p className="text-on-surface-variant leading-relaxed">
                              {studyData.overview.context}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <h5 className="font-bold text-primary text-[10px] uppercase tracking-wider block">
                              Sentralt åndelig tema
                            </h5>
                            <ul className="space-y-1.5">
                              {studyData.overview.themes.map((theme, i) => (
                                <li
                                  key={i}
                                  className="flex gap-2 text-on-surface-variant leading-relaxed items-start"
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-burnt-orange mt-1.5 shrink-0" />
                                  <span>{theme}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-2 pt-2 border-t">
                            <h5 className="font-bold text-primary text-[10px] uppercase tracking-wider block">
                              Strukturell disposisjon
                            </h5>
                            <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100 font-mono text-[10px] text-on-surface-variant whitespace-pre-line leading-relaxed">
                              {studyData.overview.outline}
                            </div>
                          </div>
                        </div>
                      )}

                      {studyTab === "commentary" && (
                        <div className="space-y-4 animate-fade-in leading-relaxed text-justify">
                          {studyData.commentary.map((section, idx) => (
                            <div
                              key={idx}
                              className="border-b border-slate-100 pb-3 last:border-b-0 space-y-1.5"
                            >
                              <div className="flex justify-between items-center bg-slate-50 px-2.5 py-1 rounded-lg">
                                <span className="font-bold text-primary text-[10px] uppercase tracking-wider">
                                  Vers {section.verses}
                                </span>
                                <span className="font-serif font-bold text-[11px] text-burnt-orange">
                                  {section.title}
                                </span>
                              </div>
                              <p className="text-on-surface-variant leading-relaxed text-xs pl-1">
                                {section.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {studyTab === "cross" && (
                        <div className="space-y-4 animate-fade-in">
                          <div className="space-y-2.5">
                            <h5 className="font-bold text-primary text-[10px] uppercase tracking-wider block">
                              Nøkkelord på grunnteksten
                            </h5>
                            <div className="space-y-3">
                              {studyData.wordStudies.map((word, idx) => (
                                <div
                                  key={idx}
                                  className="bg-primary/5 border border-primary/10 p-3 rounded-xl space-y-1"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-primary text-xs">
                                      {word.word}
                                    </span>
                                    <span className="text-[10px] text-outline font-semibold font-sans">
                                      {word.language}
                                    </span>
                                  </div>
                                  <p className="text-on-surface-variant text-[11px] leading-relaxed">
                                    {word.meaning}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2.5 pt-3 border-t">
                            <h5 className="font-bold text-primary text-[10px] uppercase tracking-wider block">
                              Teologiske Kryssreferanser
                            </h5>
                            <div className="space-y-2">
                              {studyData.crossReferences.map((cross, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => {
                                    loadBibleReference(cross.ref);
                                    // On mobile screens, close the bottom sheet drawer so the highlighted scripture is visible immediately!
                                    if (
                                      typeof window !== "undefined" &&
                                      window.innerWidth < 1024
                                    ) {
                                      setShowStudyPanel(false);
                                    }
                                  }}
                                  className="p-2.5 bg-slate-50 border hover:bg-slate-100 hover:border-primary/20 rounded-xl cursor-pointer transition-all flex flex-col space-y-0.5 group"
                                >
                                  <span className="font-bold text-primary group-hover:text-burnt-orange transition-colors flex items-center gap-1 text-[11px]">
                                    <BookOpen size={10} />
                                    {cross.ref}
                                  </span>
                                  <span className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
                                    {cross.desc}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {studyTab === "notes" && (
                        <div className="space-y-4 animate-fade-in flex flex-col h-full pb-2">
                          <div className="flex justify-between items-center bg-slate-50 px-2.5 py-1.5 rounded-lg">
                            <span className="font-bold text-primary text-[10px] uppercase tracking-wider">
                              Personlige notater
                            </span>
                            <div className="flex items-center gap-1.5 font-sans">
                              {noteSaveStatus === "loading" && (
                                <span className="text-[10px] text-outline flex items-center gap-1">
                                  <Loader2
                                    className="animate-spin text-primary"
                                    size={10}
                                  />
                                  Laster...
                                </span>
                              )}
                              {noteSaveStatus === "saving" && (
                                <span className="text-[10px] text-burnt-orange flex items-center gap-1 font-bold">
                                  <Loader2
                                    className="animate-spin text-burnt-orange"
                                    size={10}
                                  />
                                  Lagrer...
                                </span>
                              )}
                              {noteSaveStatus === "saved" && (
                                <span className="text-[10px] text-green-600 flex items-center gap-1 font-bold">
                                  <Check size={10} className="stroke-[3]" />
                                  Lagret i skyen
                                </span>
                              )}
                              {noteSaveStatus === "error" && (
                                <span className="text-[10px] text-rose-500 font-bold">
                                  Kun lagret lokalt
                                </span>
                              )}
                              {noteSaveStatus === "idle" && noteText && (
                                <span className="text-[10px] text-outline font-medium italic">
                                  Endret...
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="relative flex-grow">
                            <textarea
                              value={noteText}
                              onChange={handleNoteChange}
                              placeholder="Skriv ned dine personlige notater, åpenbaringer, tanker og bønner for dette kapittelet her... Endringer lagres automatisk."
                              className="w-full h-[220px] bg-slate-50/50 border border-outline-variant/35 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all leading-relaxed font-sans placeholder:italic resize-none scrollbar-thin text-on-surface"
                            />
                          </div>

                          {/* Utility and Action Row */}
                          <div className="grid grid-cols-2 gap-2 shrink-0 font-sans">
                            <button
                              onClick={handleSendNoteToAssistant}
                              disabled={!noteText.trim()}
                              className="py-2 px-3 bg-burnt-orange disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-[10px] font-bold hover:bg-burnt-orange-dark shadow-sm active:scale-[0.97] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Sparkles size={11} />
                              <span>Spør HKM</span>
                            </button>
                            <button
                              onClick={handleShareNoteToChat}
                              disabled={!noteText.trim()}
                              className="py-2 px-3 bg-[#561291]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-[10px] font-bold hover:bg-[#561291] shadow-sm active:scale-[0.97] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Send size={11} />
                              <span>Del i chat</span>
                            </button>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t text-[10px] shrink-0 font-sans">
                            <button
                              onClick={() => handleSaveNote(noteText)}
                              className="text-primary hover:text-primary-container font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Save size={12} />
                              <span>Lagre nå</span>
                            </button>
                            <button
                              onClick={handleClearNote}
                              className="text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 size={12} />
                              <span>Slett notat</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </motion.div>
        </div>
      )}
    </section>
  );
}
