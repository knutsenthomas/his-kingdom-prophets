import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, X, Search, BookMarked } from "lucide-react";
import { BIBLE_BOOKS } from "@/lib/bibleData";

export default function ResourcesSelector({
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
}) {
  return (
    <AnimatePresence>
      {showMobileSelector && (
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="fixed inset-0 z-[60] bg-white flex flex-col h-screen w-screen overflow-hidden"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-white shrink-0">
            <div className="flex items-center gap-3">
              {selectorTab === "chapter" && (
                <button
                  onClick={() => setSelectorTab("book")}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <h3 className="font-sans font-extrabold text-lg sm:text-xl text-primary">
                {selectorTab === "book"
                  ? isEn
                    ? "Select Book"
                    : "Velg bibelbok"
                  : isEn
                    ? "Select Chapter"
                    : "Velg kapittel"}
              </h3>
            </div>
            <button
              onClick={() => setShowMobileSelector(false)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Selector Sub-Tabs */}
          <div className="grid grid-cols-2 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <button
              onClick={() => setSelectorTab("book")}
              className={`py-4 text-xs sm:text-sm font-bold border-b-2 uppercase tracking-wide transition-all ${
                selectorTab === "book"
                  ? "border-primary text-primary font-extrabold"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {selectedBook ? selectedBook.nor : isEn ? "Book" : "Bibelbok"}
            </button>
            <button
              onClick={() => setSelectorTab("chapter")}
              className={`py-4 text-xs sm:text-sm font-bold border-b-2 uppercase tracking-wide transition-all ${
                selectorTab === "chapter"
                  ? "border-primary text-primary font-extrabold"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {isEn
                ? `Chapter ${selectedChapter}`
                : `Kapittel ${selectedChapter}`}
            </button>
          </div>

          {/* Search Input (Only on 'book' tab) */}
          {selectorTab === "book" && (
            <div className="p-4 sm:p-5 border-b border-slate-100 shrink-0">
              <div className="relative max-w-4xl mx-auto">
                <input
                  type="text"
                  placeholder={
                    isEn
                      ? "Search bible books..."
                      : "Søk etter bibelbok (f.eks. 'Mosebok', 'Joh')..."
                  }
                  value={selectorSearch}
                  onChange={(e) => setSelectorSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm sm:text-base font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all shadow-inner"
                />
                <div className="absolute left-4 top-0 bottom-0 my-auto h-4 w-4 text-slate-400 pointer-events-none">
                  <Search size={18} />
                </div>
                {selectorSearch && (
                  <button
                    onClick={() => setSelectorSearch("")}
                    className="absolute right-3 top-0 bottom-0 my-auto p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* List & Grids container (scrollable) */}
          <div className="flex-grow overflow-y-auto p-6 sm:p-8 bg-slate-50/30">
            {selectorTab === "book" ? (
              <div className="space-y-8 max-w-6xl mx-auto">
                {/* Filter books */}
                {(() => {
                  const cleanQuery = selectorSearch.toLowerCase().trim();
                  const matchingBooks = BIBLE_BOOKS.filter(
                    (b) =>
                      b.nor.toLowerCase().includes(cleanQuery) ||
                      b.eng.toLowerCase().includes(cleanQuery),
                  );

                  if (matchingBooks.length === 0) {
                    return (
                      <div className="text-center py-16 space-y-3">
                        <BookMarked
                          className="mx-auto text-slate-300"
                          size={48}
                        />
                        <p className="text-slate-500 font-bold text-base">
                          Ingen bøker funnet for "{selectorSearch}"
                        </p>
                      </div>
                    );
                  }

                  // Group by testament if no active search
                  const showGrouped = !selectorSearch;
                  if (showGrouped) {
                    const gtBooks = matchingBooks.filter(
                      (b) => b.testament === "GT",
                    );
                    const ntBooks = matchingBooks.filter(
                      (b) => b.testament === "NT",
                    );

                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        {/* Gamle testamentet */}
                        <div className="space-y-4">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider pl-2.5 border-l-2 border-primary/40">
                            Det gamle testamentet (GT)
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 bg-white p-3 sm:p-4.5 border border-slate-100 rounded-2xl shadow-sm">
                            {gtBooks.map((book) => (
                              <button
                                key={book.id}
                                onClick={() => {
                                  setSelectedBook(book);
                                  setSelectorTab("chapter");
                                }}
                                className={`w-full text-left px-4 py-3.5 sm:py-4 rounded-xl text-sm sm:text-[15px] font-bold transition-all flex justify-between items-center ${
                                  selectedBook.id === book.id
                                    ? "bg-primary/5 text-primary border border-primary/10 shadow-sm"
                                    : "text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                <span>{book.nor}</span>
                                <span className="text-xs font-mono opacity-50 font-normal">
                                  {book.chapters} {isEn ? "ch" : "kap"}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Nye testamentet */}
                        <div className="space-y-4">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider pl-2.5 border-l-2 border-primary/40">
                            Det nye testamentet (NT)
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 bg-white p-3 sm:p-4.5 border border-slate-100 rounded-2xl shadow-sm">
                            {ntBooks.map((book) => (
                              <button
                                key={book.id}
                                onClick={() => {
                                  setSelectedBook(book);
                                  setSelectorTab("chapter");
                                }}
                                className={`w-full text-left px-4 py-3.5 sm:py-4 rounded-xl text-sm sm:text-[15px] font-bold transition-all flex justify-between items-center ${
                                  selectedBook.id === book.id
                                    ? "bg-primary/5 text-primary border border-primary/10 shadow-sm"
                                    : "text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                <span>{book.nor}</span>
                                <span className="text-xs font-mono opacity-50 font-normal">
                                  {book.chapters} {isEn ? "ch" : "kap"}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Flat list of search results
                  return (
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {matchingBooks.map((book) => (
                        <button
                          key={book.id}
                          onClick={() => {
                            setSelectedBook(book);
                            setSelectorTab("chapter");
                          }}
                          className={`w-full text-left px-4 py-3.5 sm:py-4 rounded-xl text-sm sm:text-[15px] font-bold transition-all flex justify-between items-center ${
                            selectedBook.id === book.id
                              ? "bg-primary/5 text-primary border border-primary/10 shadow-sm"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span>{book.nor}</span>
                          <span className="text-xs font-mono opacity-50 font-normal">
                            {book.chapters} kap
                          </span>
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="max-w-5xl mx-auto space-y-6">
                <div className="text-center pb-2">
                  <p className="text-slate-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
                    Velg kapittel i {selectedBook.nor}
                  </p>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm">
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3 sm:gap-4">
                    {Array.from(
                      { length: selectedBook.chapters },
                      (_, i) => i + 1,
                    ).map((chap) => (
                      <button
                        key={chap}
                        onClick={() => {
                          setSelectedChapter(chap);
                          setShowMobileSelector(false);
                          // Scroll reading card to view
                          setTimeout(() => {
                            if (readerRef.current) {
                              readerRef.current.scrollIntoView({
                                behavior: "smooth",
                              });
                            }
                          }, 150);
                        }}
                        className={`h-12 sm:h-14 w-full rounded-xl text-sm sm:text-base font-extrabold transition-all flex items-center justify-center border ${
                          selectedChapter === chap
                            ? "bg-primary text-white border-primary shadow font-black active:scale-[0.95]"
                            : "bg-slate-50 text-slate-700 border-slate-200/50 hover:bg-slate-100 hover:border-slate-300 active:scale-[0.97]"
                        }`}
                      >
                        {chap}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
