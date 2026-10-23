import React from "react";
import CmsText from "@/components/CmsText";
import { timelineData, empiresData } from "@/lib/timelineData";
import { BookOpen } from "lucide-react";

export default function ResourcesTimeline({
  activeTimelineSection,
  handleScriptureRefLink,
  isEn,
  language,
  setActiveTimelineSection,
  setTimelineSubTab,
  timelineSubTab,
}) {
  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <CmsText
          slug="resources-timeline-title"
          fallback={
            isEn
              ? "Biblical Timeline"
              : "Bibelsk tidslinje og historiske epoker"
          }
          as="h3"
          className="font-sans text-2xl font-bold text-primary"
        />
        <CmsText
          slug="resources-timeline-desc"
          fallback={
            isEn
              ? "Explore the chronological progression of biblical history and the world empires that impacted the scriptures."
              : "Følg den røde tråden gjennom Bibelens historiske epoker og få oversikt over imperiene som formet den bibelske historien."
          }
          as="p"
          className="text-sm text-slate-500 leading-relaxed"
        />
      </div>

      {/* Sub Tabs Toggle (History vs. Empires) */}
      <div className="flex justify-center shrink-0">
        <div className="bg-slate-100 p-1.5 rounded-2xl flex max-w-md w-full border border-slate-200/50">
          <button
            onClick={() => {
              setTimelineSubTab("history");
              setActiveTimelineSection("urhistorien");
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer text-center ${
              timelineSubTab === "history"
                ? "bg-white text-primary shadow-md font-extrabold"
                : "text-slate-500 hover:text-primary"
            }`}
          >
            <CmsText
              slug="resources-timeline-subtab-history"
              fallback={isEn ? "Bible History" : "Bibelens historie"}
            />
          </button>
          <button
            onClick={() => {
              setTimelineSubTab("empires");
              setActiveTimelineSection("egypt");
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer text-center ${
              timelineSubTab === "empires"
                ? "bg-white text-primary shadow-md font-extrabold"
                : "text-slate-500 hover:text-primary"
            }`}
          >
            <CmsText
              slug="resources-timeline-subtab-empires"
              fallback={isEn ? "World Empires" : "Store imperier"}
            />
          </button>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        {/* Left Column: Sticky Sub-navigation list */}
        <div className="lg:col-span-3 hidden lg:block sticky top-40 h-fit space-y-2.5 bg-slate-50/50 border border-slate-100 p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 font-mono">
            <CmsText
              slug="resources-timeline-jump-era"
              fallback={isEn ? "Jump to era" : "Hurtignavigering"}
            />
          </span>
          {(timelineSubTab === "history" ? timelineData : empiresData).map(
            (section) => {
              const isActive = activeTimelineSection === section.id;
              const sectionTitle = section.title[language] || section.title.no;
              const dotColor =
                section.color === "emerald"
                  ? "bg-emerald-500"
                  : section.color === "amber"
                    ? "bg-amber-500"
                    : section.color === "yellow"
                      ? "bg-yellow-500"
                      : section.color === "red"
                        ? "bg-red-500"
                        : section.color === "purple"
                          ? "bg-purple-500"
                          : section.color === "orange"
                            ? "bg-orange-500"
                            : section.color === "cyan"
                              ? "bg-cyan-500"
                              : "bg-indigo-500";

              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveTimelineSection(section.id);
                    const el = document.getElementById(
                      `timeline-section-${section.id}`,
                    );
                    if (el) {
                      const offset = 180;
                      const bodyRect =
                        document.body.getBoundingClientRect().top;
                      const elementRect = el.getBoundingClientRect().top;
                      window.scrollTo({
                        top: elementRect - bodyRect - offset,
                        behavior: "smooth",
                      });
                    }
                  }}
                  className={`w-full text-left py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 border ${
                    isActive
                      ? "bg-white border-slate-200/80 text-primary shadow-sm font-extrabold"
                      : "bg-transparent border-transparent text-slate-500 hover:text-primary hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${dotColor} ${isActive ? "scale-125 animate-pulse" : ""}`}
                  />
                  <span className="truncate">{sectionTitle}</span>
                </button>
              );
            },
          )}
        </div>

        {/* Right Column: The Vertical Timeline Graphic */}
        <div className="lg:col-span-9 relative">
          {/* Vertical Central/Left Line */}
          <div className="absolute top-4 bottom-4 left-6 lg:left-1/2 w-1 rounded bg-gradient-to-b from-[#d17d39] via-[#bd4f2a] to-primary -translate-x-1/2" />

          <div className="space-y-16">
            {(timelineSubTab === "history" ? timelineData : empiresData).map(
              (section, idx) => {
                const sectionTitle =
                  section.title[language] || section.title.no;
                const sectionEra = section.era[language] || section.era.no;
                const sectionItalic =
                  section.italic[language] || section.italic.no;
                const sectionDesc = section.desc[language] || section.desc.no;
                const sectionScripTitle =
                  section.scripTitle[language] || section.scripTitle.no;

                const isEven = idx % 2 === 0;

                const accentClass =
                  section.color === "emerald"
                    ? "border-t-emerald-500 text-emerald-600 bg-emerald-50/50 text-emerald-800"
                    : section.color === "amber"
                      ? "border-t-amber-500 text-amber-600 bg-amber-50/50 text-amber-800"
                      : section.color === "yellow"
                        ? "border-t-yellow-500 text-yellow-600 bg-yellow-50/50 text-yellow-800"
                        : section.color === "red"
                          ? "border-t-red-500 text-red-600 bg-red-50/50 text-red-800"
                          : section.color === "purple"
                            ? "border-t-purple-500 text-purple-600 bg-purple-50/50 text-purple-800"
                            : section.color === "orange"
                              ? "border-t-orange-500 text-orange-600 bg-orange-50/50 text-orange-800"
                              : section.color === "cyan"
                                ? "border-t-cyan-500 text-cyan-600 bg-cyan-50/50 text-cyan-800"
                                : "border-t-indigo-500 text-indigo-600 bg-indigo-50/50 text-indigo-800";

                const dotBorderColor =
                  section.color === "emerald"
                    ? "border-emerald-500"
                    : section.color === "amber"
                      ? "border-amber-500"
                      : section.color === "yellow"
                        ? "border-yellow-500"
                        : section.color === "red"
                          ? "border-red-500"
                          : section.color === "purple"
                            ? "border-purple-500"
                            : section.color === "orange"
                              ? "border-orange-500"
                              : section.color === "cyan"
                                ? "border-cyan-500"
                                : "border-indigo-500";

                return (
                  <div
                    id={`timeline-section-${section.id}`}
                    key={section.id}
                    className="relative flex flex-col lg:flex-row w-full group"
                  >
                    {/* Timeline Node dot */}
                    <div
                      className={`absolute left-6 lg:left-1/2 w-5 h-5 rounded-full bg-white border-4 ${dotBorderColor} -translate-x-1/2 top-8 z-10 shadow-sm transition-all duration-300 group-hover:scale-125 group-hover:bg-primary`}
                    />

                    {/* Left Spacer / Card for even items on desktop */}
                    <div
                      className={`w-full lg:w-1/2 pl-16 lg:pl-0 lg:pr-12 flex justify-end order-2 ${isEven ? "lg:order-1" : "lg:order-2 hidden lg:flex"}`}
                    />

                    {/* Main Card */}
                    <div
                      className={`w-full lg:w-1/2 pl-16 lg:pl-12 lg:pr-0 flex justify-start order-2 ${isEven ? "lg:order-2" : "lg:order-1"}`}
                    >
                      <div
                        className={`bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 sm:p-8 w-full border-t-4 ${accentClass.split(" ")[0]} transition-all duration-300 hover:shadow-md`}
                      >
                        {/* Card Header */}
                        <div className="space-y-1 mb-4">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider font-sans ${accentClass.split(" ")[1]}`}
                          >
                            {sectionEra}
                          </span>
                          <h4 className="font-sans text-lg sm:text-xl font-bold text-primary">
                            {sectionTitle}
                          </h4>
                          {sectionItalic && (
                            <p className="text-xs font-semibold text-slate-400 italic">
                              {sectionItalic}
                            </p>
                          )}
                        </div>

                        {/* Summary Text */}
                        <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium mb-5">
                          {sectionDesc}
                        </p>

                        {/* Events bullet list */}
                        <div className="space-y-3.5 mb-6">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">
                            {isEn ? "Key Events / Details" : "Viktige detaljer"}
                          </span>
                          <ul className="space-y-3">
                            {section.events.map((evt, eidx) => {
                              const evtTitle =
                                evt.title[language] || evt.title.no;
                              const evtDesc = evt.desc[language] || evt.desc.no;
                              return (
                                <li
                                  key={eidx}
                                  className="flex gap-2.5 text-xs text-slate-600 leading-relaxed font-medium align-top"
                                >
                                  <span
                                    className={`shrink-0 w-1.5 h-1.5 rounded-full mt-2 ${accentClass.split(" ")[0].replace("border-t-", "bg-")}`}
                                  />
                                  <span>
                                    <strong className="text-slate-800">
                                      {evtTitle}{" "}
                                    </strong>
                                    {evtDesc}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        {/* Citation Link */}
                        <div
                          className={`p-4 rounded-xl border border-slate-200/10 flex items-start gap-3 ${accentClass.split(" ").slice(2).join(" ")}`}
                        >
                          <BookOpen size={16} className="shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-bold uppercase tracking-wider block font-sans">
                              {isEn
                                ? "Key Scripture Passage"
                                : "Sentrale skrifter"}
                            </span>
                            <button
                              onClick={() =>
                                handleScriptureRefLink(
                                  section.scripRef,
                                  "timeline",
                                )
                              }
                              className="text-xs font-bold hover:underline text-left block text-[#561291] transition-all cursor-pointer font-sans"
                            >
                              {sectionScripTitle}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Spacer for odd items on desktop */}
                    <div
                      className={`w-full lg:w-1/2 pl-16 lg:pl-0 lg:pr-12 flex justify-start order-2 ${!isEven ? "lg:order-2" : "lg:order-1 hidden lg:flex"}`}
                    />
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
