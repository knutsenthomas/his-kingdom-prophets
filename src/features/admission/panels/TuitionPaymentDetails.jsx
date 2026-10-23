import React from "react";
import { CreditCard, Check } from "lucide-react";
import CmsText from "@/components/CmsText";
import SiteText from "@/components/SiteText";

export default function TuitionPaymentDetails({
  activePlan,
  language,
  setActivePlan,
}) {
  return (
    <section className="bg-white border border-[#e2dce7]/70 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Payment Description */}
        <div className="space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#561291]/10 text-[#561291] font-bold text-xs uppercase tracking-wider select-none">
            <CreditCard size={14} />
            <CmsText
              slug="admission-payments-tag"
              fallback={
                language === "en"
                  ? "Flexible Payments and Tuition"
                  : "Fleksibel betaling og priser"
              }
            />
          </span>

          <CmsText
            slug="admission-payments-title"
            fallback={
              language === "en"
                ? "Invest in Your Future Without Financial Stress"
                : "Invester i din fremtid uten økonomisk stress"
            }
            as="h2"
            className="font-sans text-2xl sm:text-3xl font-bold text-[#561291] leading-tight"
          />

          <CmsText
            slug="admission-payments-desc"
            fallback={
              language === "en"
                ? "At His Kingdom Prophets, we want prophetic education to be accessible to all. We offer flexible and predictable payment options tailored to your situation: pay once a month, semi-annually (twice a year), or the entire fee at once."
                : "Hos His Kingdom Prophets ønsker vi at den profetiske utdanningen skal være tilgjengelig for alle. Vi tilbyr ryddige og forutsigbare betalingsordninger tilpasset din situasjon: betal en gang i måneden, en gang i halvåret, eller hele prisen på en gang."
            }
            as="p"
            className="text-base text-slate-700 font-normal leading-relaxed"
          />

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-green-50 text-green-600 rounded-full shrink-0 mt-0.5">
                <Check size={16} className="stroke-[3]" />
              </div>
              <div>
                <CmsText
                  slug="admission-payments-bullet1-title"
                  fallback={
                    language === "en"
                      ? "Flexible Payment Options"
                      : "Fleksibel betaling"
                  }
                  as="h4"
                  className="text-base font-bold text-[#561291]"
                />
                <CmsText
                  slug="admission-payments-bullet1-desc"
                  fallback={
                    language === "en"
                      ? "Tuition can be paid monthly (10 installments), semi-annually (twice a year), or as a single payment for the entire academic year."
                      : "Studieavgiften kan betales en gang i måneden (10 terminer), en gang i halvåret (2 terminer), eller som et engangsbeløp for hele året."
                  }
                  as="p"
                  className="text-base text-slate-600 mt-1 leading-relaxed font-normal"
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-green-50 text-green-600 rounded-full shrink-0 mt-0.5">
                <Check size={16} className="stroke-[3]" />
              </div>
              <div>
                <CmsText
                  slug="admission-payments-bullet2-title"
                  fallback={
                    language === "en"
                      ? "All-Inclusive Tuition Fee"
                      : "Alt inkludert i avgiften"
                  }
                  as="h4"
                  className="text-base font-bold text-[#561291]"
                />
                <CmsText
                  slug="admission-payments-bullet2-desc"
                  fallback={
                    language === "en"
                      ? "The fee covers study workbooks, 1-on-1 mentoring, Zoom gatherings, full access to the student portal and the video archives."
                      : "Studieavgiften dekker studiehefter, 1-til-1 samtaler, Zoom-møter, full tilgang til studentportalen og videoarkivet."
                  }
                  as="p"
                  className="text-base text-slate-600 mt-1 leading-relaxed font-normal"
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-green-50 text-green-600 rounded-full shrink-0 mt-0.5">
                <Check size={16} className="stroke-[3]" />
              </div>
              <div>
                <CmsText
                  slug="admission-payments-bullet3-title"
                  fallback={
                    language === "en"
                      ? "Scholarships & Partner Discounts"
                      : "Stipend og partner-rabatter"
                  }
                  as="h4"
                  className="text-base font-bold text-[#561291]"
                />
                <CmsText
                  slug="admission-payments-bullet3-desc"
                  fallback={
                    language === "en"
                      ? "Spouse discount, student discount, and special scholarship options for active church planters and missionary families."
                      : "Ektepar-rabatt, studentrabatt og særskilte stipendordninger for aktive menighetsplantere og misjonærfamilier."
                  }
                  as="p"
                  className="text-base text-slate-600 mt-1 leading-relaxed font-normal"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Card Comparison */}
        <div className="bg-[#F8F7FA] border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-8 space-y-5 sm:space-y-6 shadow-sm">
          <div className="flex bg-white/90 p-1 sm:p-1.5 rounded-xl border border-slate-200/70 shadow-xs gap-1 sm:gap-1.5 select-none">
            <button
              type="button"
              onClick={() => setActivePlan("monthly")}
              className={`flex-1 min-h-[44px] py-2 sm:py-2.5 px-2 text-xs sm:text-sm font-bold normal-case sm:uppercase tracking-normal sm:tracking-wider rounded-lg transition-all duration-200 flex items-center justify-center text-center ${
                activePlan === "monthly"
                  ? "bg-[#561291] text-white shadow-sm shadow-[#561291]/25 font-extrabold"
                  : "text-slate-600 hover:text-[#561291] hover:bg-slate-50"
              }`}
            >
              <CmsText
                slug="admission-price-plan-monthly"
                fallback={language === "en" ? "Monthly" : "1 gang i mnd"}
              />
            </button>
            <button
              type="button"
              onClick={() => setActivePlan("biannual")}
              className={`flex-1 min-h-[44px] py-2 sm:py-2.5 px-2 text-xs sm:text-sm font-bold normal-case sm:uppercase tracking-normal sm:tracking-wider rounded-lg transition-all duration-200 flex items-center justify-center text-center ${
                activePlan === "biannual"
                  ? "bg-[#561291] text-white shadow-sm shadow-[#561291]/25 font-extrabold"
                  : "text-slate-600 hover:text-[#561291] hover:bg-slate-50"
              }`}
            >
              <CmsText
                slug="admission-price-plan-biannual"
                fallback={
                  language === "en" ? "Semi-Annual" : "1 gang i halvåret"
                }
              />
            </button>
            <button
              type="button"
              onClick={() => setActivePlan("full")}
              className={`flex-1 min-h-[44px] py-2 sm:py-2.5 px-2 text-xs sm:text-sm font-bold normal-case sm:uppercase tracking-normal sm:tracking-wider rounded-lg transition-all duration-200 flex items-center justify-center text-center ${
                activePlan === "full"
                  ? "bg-[#561291] text-white shadow-sm shadow-[#561291]/25 font-extrabold"
                  : "text-slate-600 hover:text-[#561291] hover:bg-slate-50"
              }`}
            >
              <CmsText
                slug="admission-price-plan-full"
                fallback={language === "en" ? "Full Price" : "Hele prisen"}
              />
            </button>
          </div>

          <div className="text-center space-y-2 sm:space-y-3 pt-1">
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-widest block">
              <SiteText
                fallback={
                  activePlan === "monthly"
                    ? language === "en"
                      ? "Monthly installments (10 payments)"
                      : "Månedlig delbetaling (10 terminer)"
                    : activePlan === "biannual"
                      ? language === "en"
                        ? "Semi-annual payment (2 installments)"
                        : "Halvårlig betaling (2 terminer)"
                      : language === "en"
                        ? "Full academic year (single payment)"
                        : "Fullt studieår (engangsbetaling)"
                }
              />
            </span>

            <div className="font-sans text-3xl sm:text-5xl font-extrabold text-[#561291] tracking-tight">
              <SiteText
                fallback={
                  language === "en"
                    ? activePlan === "monthly"
                      ? "$100 USD / mo"
                      : activePlan === "biannual"
                        ? "$500 USD x 2"
                        : "$1,000 USD"
                    : activePlan === "monthly"
                      ? "1 000,- / mnd"
                      : activePlan === "biannual"
                        ? "5 000,- x 2"
                        : "10 000,- NOK"
                }
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              <SiteText
                fallback={
                  activePlan === "monthly"
                    ? language === "en"
                      ? "10 installments of $100 USD (Total $1,000 USD)"
                      : "10 månedlige innbetalinger à 1 000 kr (Totalt 10 000 kr)"
                    : activePlan === "biannual"
                      ? language === "en"
                        ? "2 installments of $500 USD (Total $1,000 USD)"
                        : "2 innbetalinger à 5 000 kr (Totalt 10 000 kr)"
                      : language === "en"
                        ? "Single upfront payment for entire year"
                        : "Ett samlet oppgjør for hele skoleåret"
                }
              />
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-sm mx-auto">
              <SiteText
                fallback={
                  language === "en"
                    ? "*In addition: $50 USD admin/startup fee and $50 USD room & board for the kickoff weekend. (Self-chosen hotel during kickoff weekend is not covered by the school)."
                    : "*I tillegg: 500 kr i admin oppstart og 500 kr for kost og losji for kickoff-helgen. (Hvis man skal bo på egenvalgt hotell i kickoff-helgen dekker skolen ikke dette)."
                }
              />
            </p>
          </div>

          <div className="w-full h-[1px] bg-slate-200/70" />

          <div className="bg-white rounded-xl border border-slate-200/70 divide-y divide-slate-100 shadow-xs overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-3.5 py-3 text-xs sm:text-sm">
              <span className="text-slate-700 font-medium leading-snug">
                <CmsText
                  slug="admission-price-row1-label"
                  fallback={
                    language === "en"
                      ? "Admin / Startup fee"
                      : "Admin / oppstartsgebyr"
                  }
                />
              </span>
              <span className="text-[#561291] font-bold whitespace-nowrap shrink-0 text-right">
                <CmsText
                  slug="admission-price-row1-val"
                  fallback={language === "en" ? "$50 USD" : "500,- NOK"}
                />
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 px-3.5 py-3 text-xs sm:text-sm">
              <span className="text-slate-700 font-medium leading-snug">
                <CmsText
                  slug="admission-price-row2-label"
                  fallback={
                    language === "en"
                      ? "Kickoff weekend room & board"
                      : "Kickoff-helg kost og losji"
                  }
                />
              </span>
              <span className="text-[#561291] font-bold whitespace-nowrap shrink-0 text-right">
                <CmsText
                  slug="admission-price-row2-val"
                  fallback={language === "en" ? "$50 USD" : "500,- NOK"}
                />
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 px-3.5 py-3 text-xs sm:text-sm">
              <span className="text-slate-700 font-medium leading-snug">
                <CmsText
                  slug="admission-price-row3-label"
                  fallback={
                    language === "en"
                      ? "Assigned personal mentor"
                      : "Tildelt personlig mentor"
                  }
                />
              </span>
              <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full font-bold text-xs whitespace-nowrap shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <CmsText
                  slug="admission-price-row3-val"
                  fallback={language === "en" ? "Included" : "Inkludert"}
                />
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 px-3.5 py-3 text-xs sm:text-sm">
              <span className="text-slate-700 font-medium leading-snug">
                <CmsText
                  slug="admission-price-row4-label"
                  fallback={
                    language === "en"
                      ? "Digital Study Platform & Lectures"
                      : "Digital studieportal & forelesninger"
                  }
                />
              </span>
              <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full font-bold text-xs whitespace-nowrap shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <CmsText
                  slug="admission-price-row4-val"
                  fallback={language === "en" ? "Included" : "Inkludert"}
                />
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 px-3.5 py-3 text-xs sm:text-sm">
              <span className="text-slate-700 font-medium leading-snug">
                <CmsText
                  slug="admission-price-row5-label"
                  fallback={
                    language === "en"
                      ? "Spouse / Family Discount"
                      : "Ektefelle/familierabatt"
                  }
                />
              </span>
              <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full font-bold text-xs whitespace-nowrap shrink-0">
                <CmsText slug="admission-price-row5-val" fallback="-25%" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
