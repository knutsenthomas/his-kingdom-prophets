import React from "react";
import {
  Sparkles,
  Search,
  BookMarked,
  ArrowLeft,
  ChevronDown,
  Type,
  Edit3,
  Minimize2,
  Maximize2,
  ArrowRight,
  RefreshCw,
  X,
  BookOpen,
  Save,
  Trash2,
  Flame,
} from "lucide-react";
import CmsText from "@/components/CmsText";
import { TRANSLATIONS } from "@/lib/bibleData";
import { AnimatePresence, motion } from "framer-motion";

export default function BibleStudyCenter({
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
}) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header info */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="font-sans text-xl font-bold text-primary flex items-center gap-2">
            <Sparkles size={20} className="text-amber-500" />
            <CmsText
              slug="resources-bible-title"
              fallback="Interaktiv studiebibel"
            />
          </h3>
          <CmsText
            slug="resources-bible-desc"
            fallback='Trykk på et hvilket som helst vers for å kopiere det. Åpne "studiebibel"-panelet for ferdige teologiske kommentarer, ordstudier og personlige notater.'
            as="p"
            className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed"
          />
        </div>

        <form onSubmit={handleSearch} className="w-full md:w-80 shrink-0">
          <div className="relative">
            <input
              type="text"
              placeholder={
                isEn
                  ? "Search e.g. 'Genesis 1:1'..."
                  : "Søk f.eks. '1. Mosebok 1:1'..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all shadow-inner"
            />
            <button
              type="submit"
              className="absolute left-3 top-0 bottom-0 my-auto text-primary cursor-pointer border-none bg-none p-0"
            >
              <Search size={14} />
            </button>
          </div>
        </form>
      </div>

      {/* Reading Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Book selection (Desktop only) */}
        <div
          className={`hidden lg:block ${showStudyPanel ? "lg:col-span-3" : "lg:col-span-4"} space-y-6 lg:sticky lg:top-40`}
        >
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-5">
            <h4 className="font-sans font-bold text-sm text-primary flex items-center gap-2 border-b border-slate-100 pb-3">
              <BookMarked size={16} />
              {isEn ? "Book & Chapter" : "Bok- og kapittelvelger"}
            </h4>

            {/* Translation Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Oversettelse
              </label>
              <select
                value={selectedTranslation}
                onChange={(e) => setSelectedTranslation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  testamentFilter === "all"
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-500 hover:text-primary"
                }`}
              >
                {isEn ? "All" : "Alle"}
              </button>
              <button
                onClick={() => setTestamentFilter("GT")}
                className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  testamentFilter === "GT"
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-500 hover:text-primary"
                }`}
              >
                GT
              </button>
              <button
                onClick={() => setTestamentFilter("NT")}
                className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  testamentFilter === "NT"
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-500 hover:text-primary"
                }`}
              >
                NT
              </button>
            </div>

            {/* Books List (scrollable) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Bibelbok
              </label>
              <div className="h-56 overflow-y-auto border border-slate-100 rounded-xl bg-slate-50/50 p-2 space-y-0.5 scrollbar-thin">
                {filteredBooks.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => {
                      setSelectedBook(book);
                      setSelectedChapter(1);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex justify-between items-center transition-all ${
                      selectedBook.id === book.id
                        ? "bg-primary/5 text-primary border border-primary/20 shadow-sm font-bold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-primary"
                    }`}
                  >
                    <span>{book.nor}</span>
                    <span className="text-[9px] opacity-60 font-mono">
                      {book.testament}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Chapters Grid */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isEn
                  ? `Select Chapter (1 - ${selectedBook.chapters})`
                  : `Velg kapittel (1 - ${selectedBook.chapters})`}
              </label>
              <div className="grid grid-cols-5 gap-1.5 max-h-32 overflow-y-auto p-1 scrollbar-thin">
                {Array.from(
                  { length: selectedBook.chapters },
                  (_, i) => i + 1,
                ).map((chap) => (
                  <button
                    key={chap}
                    onClick={() => setSelectedChapter(chap)}
                    className={`h-8 w-full rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                      selectedChapter === chap
                        ? "bg-primary text-white shadow font-extrabold"
                        : "bg-slate-50 text-slate-600 border border-slate-200/50 hover:bg-slate-100"
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
        <div
          className={`${showStudyPanel ? "lg:col-span-5" : "lg:col-span-8"} space-y-6 scroll-mt-40`}
          ref={readerRef}
        >
          <div
            ref={cardContainerRef}
            className={
              isFullscreenReading
                ? "fixed inset-0 z-50 overflow-y-auto h-screen w-screen bg-white"
                : "bg-white border border-slate-200/60 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between min-h-[500px]"
            }
          >
            <div
              className={
                isFullscreenReading
                  ? "max-w-4xl mx-auto w-full px-6 py-8 md:px-12 flex flex-col min-h-screen"
                  : "flex flex-col justify-between h-full flex-grow"
              }
            >
              {/* Reading Header */}
              <div
                className={`flex items-center justify-between border-b border-slate-100 pb-3 mb-6 sticky bg-white z-20 ${
                  isFullscreenReading
                    ? "top-0 -mx-6 px-6 md:-mx-12 md:px-12 pt-4 shadow-sm"
                    : "top-[160px] -mx-6 -mt-6 pt-6 md:-mx-8 md:-mt-8 md:pt-8 px-6 md:px-8 rounded-t-2xl"
                }`}
              >
                <button
                  onClick={() => navigateChapter("prev")}
                  className="p-2 bg-slate-50 text-primary border border-slate-200/60 rounded-xl hover:bg-slate-100 active:scale-[0.97] transition-all cursor-pointer"
                >
                  <ArrowLeft size={16} />
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
                  title={
                    isEn ? "Select Book and Chapter" : "Velg bok og kapittel"
                  }
                >
                  <h2 className="font-sans font-extrabold text-base md:text-xl text-primary leading-tight flex items-center gap-1 sm:gap-2 justify-center">
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
                  <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase font-mono mt-0.5 block">
                    {
                      TRANSLATIONS.find((t) => t.id === selectedTranslation)
                        ?.name
                    }
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
                    className="p-2 bg-slate-50 text-primary border border-slate-200/60 rounded-xl hover:bg-slate-100 active:scale-[0.97] transition-all cursor-pointer flex items-center gap-1"
                    title={
                      isEn ? "Juster tekststørrelse" : "Juster tekststørrelse"
                    }
                  >
                    <Type size={14} />
                    <span className="text-[9px] font-bold uppercase">
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
                            isEn
                              ? "Visual CMS-redigering aktivert! Klikk på tekster for å endre dem."
                              : "Visuell CMS-redigering aktivert! Klikk på tekster for å endre dem.",
                          );
                        } else {
                          showToast(
                            isEn
                              ? "Visuell redigering avsluttet. Endringer lagret."
                              : "Visuell redigering avsluttet. Endringer lagret.",
                          );
                        }
                      }}
                      className={`p-2 rounded-xl border active:scale-[0.97] transition-all cursor-pointer flex items-center justify-center ${
                        isAdminEditing
                          ? "bg-[#d17d39] text-white border-[#d17d39] hover:bg-[#bd4f2a] shadow-sm shadow-[#d17d39]/20"
                          : "bg-slate-50 text-primary border-slate-200/60 hover:bg-slate-100"
                      }`}
                      title={
                        isEn
                          ? "Toggle Visual CMS Editing"
                          : "Aktiver visuell CMS-redigering"
                      }
                    >
                      <Edit3
                        size={14}
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
                        : "bg-slate-50 text-primary border-slate-200/60 hover:bg-slate-100"
                    }`}
                    title={
                      isFullscreenReading
                        ? isEn
                          ? "Avslutt lesemodus"
                          : "Avslutt lesemodus"
                        : isEn
                          ? "Fullskjerm lesemodus"
                          : "Fullskjerm lesemodus"
                    }
                  >
                    {isFullscreenReading ? (
                      <Minimize2 size={14} />
                    ) : (
                      <Maximize2 size={14} />
                    )}
                  </button>

                  {/* Hide Study Panel button in fullscreen mode */}
                  {!isFullscreenReading && (
                    <button
                      onClick={() => setShowStudyPanel(!showStudyPanel)}
                      className={`flex items-center gap-1 px-2.5 py-2 rounded-xl border text-[11px] font-bold transition-all active:scale-[0.97] cursor-pointer ${
                        showStudyPanel
                          ? "bg-primary text-white border-primary shadow"
                          : "bg-slate-50 text-primary border-slate-200/60 hover:bg-slate-100"
                      }`}
                    >
                      <Sparkles
                        size={12}
                        className={showStudyPanel ? "animate-pulse" : ""}
                      />
                      <span className="hidden sm:inline">
                        {showStudyPanel
                          ? isEn
                            ? "Lukk studie"
                            : "Studiebibel"
                          : isEn
                            ? "Studiebibel"
                            : "Studiebibel"}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => navigateChapter("next")}
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
                      Tilbake til {previousReference.book.nor}{" "}
                      {previousReference.chapter}
                      {previousReference.verse
                        ? `:${previousReference.verse}`
                        : ""}
                    </span>
                  </button>
                </div>
              )}

              {/* Reading Body */}
              <div className="flex-grow relative mt-2">
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 min-h-[300px]">
                      <RefreshCw
                        className="text-primary animate-spin"
                        size={28}
                      />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Henter skriftsteder...
                      </p>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={`select-text text-slate-800 font-sans space-y-4 pr-1 ${getTextSizeClass()}`}
                    >
                      <p className="text-justify md:text-left">
                        {verses.map((verse) => {
                          const isSelected = selectedVerses.includes(
                            verse.verse,
                          );
                          const isHighlighted =
                            highlightedVerse === verse.verse;
                          return (
                            <span
                              key={verse.verse}
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Study Panel (when open) */}
        {showStudyPanel && (
          <div
            onClick={() => setShowStudyPanel(false)}
            className="fixed inset-0 z-50 bg-[#271f30]/45 backdrop-blur-sm flex items-end justify-center p-0 lg:static lg:bg-transparent lg:backdrop-blur-none lg:z-auto lg:block lg:col-span-4 lg:space-y-6 lg:sticky lg:top-40"
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
              className="bg-white border-t border-slate-200 lg:border lg:border-slate-200/60 rounded-t-3xl lg:rounded-2xl p-5 shadow-2xl lg:shadow-sm space-y-4 flex flex-col w-full max-w-xl lg:max-w-none h-[80vh] lg:h-auto lg:min-h-[500px]"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h4 className="font-sans font-bold text-sm text-primary flex items-center gap-1.5">
                  <Sparkles size={16} className="text-amber-500" />
                  {isEn ? "Theological Study Center" : "Studie- og kommentarer"}
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
                  { id: "overview", name: isEn ? "Overview" : "Oversikt" },
                  { id: "commentary", name: isEn ? "Themes" : "Temaer" },
                  { id: "cross", name: isEn ? "Cross-Ref" : "Kryss-ref" },
                  { id: "notes", name: isEn ? "My Notes" : "Notater" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setStudyTab(t.id)}
                    className={`py-1.5 rounded-lg text-[9px] font-bold transition-all truncate ${
                      studyTab === t.id
                        ? "bg-primary text-white shadow-sm"
                        : "text-slate-500 hover:text-primary"
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
                    {studyTab === "overview" && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl space-y-2">
                          <h5 className="font-bold text-primary text-[13px]">
                            {activeCommentary.overview.title}
                          </h5>
                          <p className="text-slate-600 text-[11px] leading-relaxed italic">
                            {activeCommentary.overview.context}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <span className="font-bold text-slate-800 uppercase tracking-wider text-[9px] block">
                            Sentrale Temaer
                          </span>
                          <ul className="space-y-1.5">
                            {activeCommentary.overview.themes.map(
                              (theme, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <span className="mt-1 h-1.5 w-1.5 bg-[#561291] rounded-full shrink-0" />
                                  <span className="text-[11px] text-slate-600">
                                    {theme}
                                  </span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      </div>
                    )}

                    {studyTab === "commentary" && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        {activeCommentary.commentary.map((comm, idx) => (
                          <div
                            key={idx}
                            className="border-b border-slate-100 pb-3 last:border-0 space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <h5 className="font-sans font-bold text-primary text-[12px]">
                                {comm.title}
                              </h5>
                              <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                                {comm.verses}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              {comm.text}
                            </p>
                          </div>
                        ))}

                        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 space-y-2">
                          <h6 className="font-bold text-amber-800 text-[11px] uppercase tracking-wider">
                            Gresk/Hebraisk ordstudie
                          </h6>
                          {activeCommentary.wordStudies?.map((word, idx) => (
                            <div key={idx} className="space-y-0.5 text-[11px]">
                              <p className="font-bold text-slate-800">
                                {word.word} ({word.language})
                              </p>
                              <p className="text-slate-600">{word.meaning}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {studyTab === "cross" && (
                      <div className="space-y-3 animate-in fade-in duration-200">
                        <span className="font-bold text-slate-800 uppercase tracking-wider text-[9px] block">
                          Tilknyttede skriftsteder
                        </span>
                        {activeCommentary.crossReferences.map((ref, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl space-y-1 hover:border-primary/20 transition-all cursor-pointer"
                            onClick={() => {
                              loadBibleReference(ref.ref);
                              // Lukk studiepanelet på mobil slik at skriften er umiddelbart synlig
                              if (
                                typeof window !== "undefined" &&
                                window.innerWidth < 1024
                              ) {
                                setShowStudyPanel(false);
                              }
                            }}
                          >
                            <p className="font-bold text-primary text-[11px] flex items-center gap-1.5">
                              <BookOpen size={11} /> {ref.ref}
                            </p>
                            <p className="text-slate-500 text-[10px] leading-relaxed">
                              {ref.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {(studyTab === "overview" ||
                      studyTab === "commentary" ||
                      studyTab === "cross") && (
                      <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
                        <BookOpen size={36} className="text-slate-300" />
                        <div className="space-y-1">
                          <p className="font-bold text-slate-700 text-xs">
                            Kommentarer er uforberedt
                          </p>
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
                          {isEn
                            ? "Generate Study Notes"
                            : "Generer studiekommentar"}
                        </button>
                      </div>
                    )}
                  </>
                )}

                {studyTab === "notes" && (
                  <div className="space-y-3 h-full flex flex-col animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                      <span>
                        {isEn ? "Notes for" : "Notater for"} {selectedBook.nor}{" "}
                        {selectedChapter}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        {noteSaveStatus === "saving" && (
                          <span className="text-amber-600 animate-pulse">
                            Lagrer...
                          </span>
                        )}
                        {noteSaveStatus === "saved" && (
                          <span className="text-green-600">
                            ✓ Lagret lokalt
                          </span>
                        )}
                        {noteSaveStatus === "loading" && <span>Laster...</span>}
                        {noteSaveStatus === "idle" && <span>Ulagret</span>}
                      </span>
                    </div>

                    <textarea
                      value={noteText}
                      onChange={handleNoteChange}
                      placeholder={
                        isEn
                          ? "Write down your theological reflections here..."
                          : "Skriv dine refleksjoner, tolkninger eller åpenbaringer her..."
                      }
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
                        <Flame
                          size={12}
                          className="text-amber-500 animate-pulse"
                        />
                        {isEn
                          ? "Cloud Sync & Study Portal"
                          : "Vil du synkronisere notatene dine?"}
                      </p>
                      <p className="text-[9px] text-slate-500 leading-relaxed">
                        {isEn
                          ? "Notes are currently stored safely in your browser cache. Apply for admission or log in to sync notes to your permanent disciple account in the cloud!"
                          : "Notater lagres lokalt i nettleseren din. Søk opptak eller logg inn for å synkronisere dem permanent til din disippelkonto i skyen!"}
                      </p>
                      <button
                        onClick={() => navigate("/login")}
                        className="w-full py-1.5 bg-white border border-[#561291]/20 hover:border-primary text-primary font-bold rounded-lg text-[9px] uppercase tracking-wider transition-all shadow-sm"
                      >
                        {isEn ? "Log In / Register" : "Logg inn / søk opptak"}
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
                    <p className="font-bold text-slate-700 text-xs">
                      Forbereder teologisk forskning...
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono italic animate-pulse">
                      {isEn ? "Generating step: " : "Fase: "}{" "}
                      {generationStep + 1}/5
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
