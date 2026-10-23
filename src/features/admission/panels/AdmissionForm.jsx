import React from "react";
import { motion } from "framer-motion";
import {
  User,
  AlertTriangle,
  Save,
  ArrowRight,
  BookOpen,
  Lock,
  ArrowLeft,
  Heart,
  GraduationCap,
  CheckCircle2,
  Send,
} from "lucide-react";
import SiteText from "@/components/SiteText";
import { getEighteenYearsAgoDateString } from "../lib/getEighteenYearsAgoDateString";
import { calculateAge } from "../lib/calculateAge";

export default function AdmissionForm({
  adminPreview,
  currentStep,
  formData,
  handleFormSubmit,
  handleInputChange,
  handleNextStep,
  handlePrevStep,
  isSubmitting,
  language,
  programs,
  saveDraft,
  selectedProg,
  showToast,
  updateFieldValue,
}) {
  return (
    <form
      onSubmit={handleFormSubmit}
      noValidate={adminPreview}
      className="space-y-6 pt-4"
    >
      {/* STEP 1: PERSONAL DETAILS */}
      {currentStep === 1 && (
        <motion.div
          key="step-1"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="space-y-6"
        >
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <User className="text-[#561291]" size={20} />
            <h4 className="font-bold text-lg text-[#561291]">
              <SiteText
                fallback={
                  language === "en"
                    ? "1. Personal Information & Contact"
                    : "1. Personalia & Kontaktinformasjon"
                }
              />
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
                <SiteText
                  fallback={language === "en" ? "Full Name *" : "Fullt navn *"}
                />
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder={
                  language === "en"
                    ? "E.g. Thomas Knutsen"
                    : "F.eks. Ola Nordmann"
                }
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all"
              />
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
                <SiteText
                  fallback={language === "en" ? "Gender *" : "Kjønn *"}
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["Mann", "Kvinne"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => updateFieldValue("gender", g)}
                    className={`min-h-[44px] py-2.5 px-4 rounded-xl border text-sm sm:text-base font-bold transition-all duration-200 flex items-center justify-center ${
                      formData.gender === g
                        ? "bg-[#561291]/10 border-[#561291] text-[#561291]"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Birth Date */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>
                  <SiteText
                    fallback={
                      language === "en" ? "Date of Birth *" : "Fødselsdato *"
                    }
                  />
                </span>
                <span className="text-[11px] font-semibold text-[#561291] bg-[#561291]/10 px-2 py-0.5 rounded-md normal-case">
                  <SiteText
                    fallback={
                      language === "en" ? "Min. 18 years old" : "Min. 18 år"
                    }
                  />
                </span>
              </label>
              <input
                type="date"
                name="birthDate"
                required
                max={getEighteenYearsAgoDateString()}
                lang={language === "en" ? "en-US" : "no"}
                value={formData.birthDate}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-slate-50 border ${
                  formData.birthDate && calculateAge(formData.birthDate) < 18
                    ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                    : "border-slate-200 focus:border-[#561291]/60 focus:ring-[#561291]/15"
                } focus:ring-2 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all`}
              />
              {formData.birthDate && calculateAge(formData.birthDate) < 18 ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  <AlertTriangle size={15} className="shrink-0 text-red-600" />
                  <span>
                    {language === "en"
                      ? `You must be at least 18 years old to apply (current age: ${calculateAge(formData.birthDate)}).`
                      : `Du må være minst 18 år for å søke elevplass ved skolen (oppgitt alder: ${calculateAge(formData.birthDate)} år).`}
                  </span>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 font-normal">
                  <SiteText
                    fallback={
                      language === "en"
                        ? "Format: MM/DD/YYYY (or pick from calendar)"
                        : "Format: DD.MM.ÅÅÅÅ (eller velg i kalenderen)"
                    }
                  />
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
                <SiteText
                  fallback={
                    language === "en" ? "Email Address *" : "E-postadresse *"
                  }
                />
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="ola@eksempel.no"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
                <SiteText
                  fallback={
                    language === "en" ? "Phone Number *" : "Mobiltelefon *"
                  }
                />
              </label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="+47 000 00 000"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all"
              />
            </div>

            {/* Occupation */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
                <SiteText
                  fallback={
                    language === "en"
                      ? "Occupation / Education *"
                      : "Yrke / utdannelse *"
                  }
                />
              </label>
              <input
                type="text"
                name="occupation"
                required
                placeholder={
                  language === "en"
                    ? "E.g. Teacher, Engineer, Student"
                    : "F.eks. Lærer, Ingeniør, Student"
                }
                value={formData.occupation}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all"
              />
            </div>
          </div>

          {/* Residential Address */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
              <SiteText
                fallback={
                  language === "en"
                    ? "Residential Address *"
                    : "Bostedsadresse *"
                }
              />
            </label>
            <input
              type="text"
              name="address"
              required
              placeholder={
                language === "en"
                  ? "Street address, postal code, city, country"
                  : "Adresse, postnummer, poststed, land"
              }
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all"
            />
          </div>

          {/* Marital Status */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
              <SiteText
                fallback={
                  language === "en" ? "Marital Status *" : "Sivilstatus *"
                }
              />
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                "Gift",
                "Ugift",
                "Forlovet",
                "Separert / skilt",
                "Enke / enkemann",
              ].map((ms, idx) => (
                <button
                  key={ms}
                  type="button"
                  onClick={() => updateFieldValue("maritalStatus", ms)}
                  className={`min-h-[44px] py-2.5 px-2 rounded-xl border text-xs sm:text-sm font-bold transition-all duration-200 text-center flex items-center justify-center ${
                    idx === 4 ? "col-span-2 sm:col-span-1" : ""
                  } ${
                    formData.maritalStatus === ms
                      ? "bg-[#561291]/10 border-[#561291] text-[#561291]"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {ms}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation & Draft Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <button
              type="button"
              disabled={adminPreview}
              onClick={() => {
                saveDraft(formData, currentStep);
                showToast(
                  language === "en"
                    ? "Draft saved! You can resume anytime."
                    : "Kladd lagret! Du kan lukke siden og fortsette senere.",
                );
              }}
              className="w-full sm:w-auto min-h-[44px] px-4 py-3 text-slate-600 hover:text-[#561291] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-medium text-sm transition-all duration-200 inline-flex items-center justify-center gap-2"
            >
              <Save size={16} />
              <span>
                <SiteText
                  fallback={
                    language === "en"
                      ? "Save Draft & Continue Later"
                      : "Lagre kladd & fortsett senere"
                  }
                />
              </span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full sm:w-auto min-h-[44px] px-8 py-3.5 bg-[#D7B978] hover:bg-[#c4a565] text-[#561291] font-bold text-base uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2"
            >
              <span>
                <SiteText
                  fallback={
                    language === "en"
                      ? "Next: Study Line & Payment"
                      : "Neste: Studielinje & betaling"
                  }
                />
              </span>
              <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 2: PROGRAM & TUITION */}
      {currentStep === 2 && (
        <motion.div
          key="step-2"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="space-y-6"
        >
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <BookOpen className="text-[#561291]" size={20} />
            <h4 className="font-bold text-lg text-[#561291]">
              <SiteText
                fallback={
                  language === "en"
                    ? "2. Program Track & Tuition Agreement"
                    : "2. Studielinje & Betalingsordning"
                }
              />
            </h4>
          </div>

          {/* Program Choice */}
          <div className="space-y-3">
            <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
              <SiteText
                fallback={
                  language === "en"
                    ? "Select Study Line *"
                    : "Velg studielinje *"
                }
              />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {programs.map((p) => (
                <label
                  key={p.id}
                  className={`border rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between ${p.isLocked ? "cursor-not-allowed bg-slate-50 opacity-70" : "cursor-pointer"} ${
                    formData.program === p.id
                      ? "border-[#561291] bg-[#561291]/5 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#561291]/10 text-[#561291] uppercase tracking-wider">
                        {p.code}
                      </span>
                      <h5 className="font-bold text-base text-[#561291] pt-1">
                        <SiteText fallback={p.title} />
                      </h5>
                      <p className="text-xs text-slate-500">{p.duration}</p>
                      {p.isLocked && (
                        <p className="text-xs font-semibold text-[#561291]">
                          {language === "en"
                            ? "Applications open later"
                            : "Påmelding åpner senere"}
                        </p>
                      )}
                    </div>
                    <input
                      type="radio"
                      name="program"
                      value={p.id}
                      disabled={p.isLocked}
                      checked={formData.program === p.id}
                      onChange={handleInputChange}
                      className="accent-[#561291] w-4 h-4 mt-1"
                    />
                  </div>
                  <div className="pt-4 border-t border-slate-100 mt-4 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">
                      <SiteText
                        fallback={
                          language === "en"
                            ? "Total Tuition (Year):"
                            : "Studieavgift (skoleår):"
                        }
                      />
                    </span>
                    <span className="font-bold text-[#561291] text-sm">
                      {p.priceYear || "10 000,-"}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Billing Plan */}
          <div className="space-y-3">
            <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
              <SiteText
                fallback={
                  language === "en"
                    ? "Preferred Payment Arrangement *"
                    : "Foretrukket betalingsordning *"
                }
              />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Månedlig */}
              <label
                className={`border rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
                  formData.paymentPlan === "monthly"
                    ? "border-[#561291] bg-[#561291]/5 text-[#561291] shadow-xs"
                    : "border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-base font-bold block">
                      <SiteText
                        fallback={
                          language === "en" ? "Monthly Payment" : "Månedlig"
                        }
                      />
                    </span>
                    <span className="text-xs text-slate-600 block">
                      <SiteText
                        fallback={
                          language === "en"
                            ? "$100 USD / month (10 months)"
                            : "1 000,- per mnd (10 terminer)"
                        }
                      />
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="paymentPlan"
                    value="monthly"
                    checked={formData.paymentPlan === "monthly"}
                    onChange={handleInputChange}
                    className="accent-[#561291] w-4 h-4 mt-1 shrink-0"
                  />
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/50 text-[11px] text-slate-500 font-medium">
                  <SiteText
                    fallback={
                      language === "en"
                        ? "Total tuition $1,000 USD"
                        : "Total studieavgift: 10 000,-"
                    }
                  />
                </div>
              </label>

              {/* 2. Halvårlig */}
              <label
                className={`border rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
                  formData.paymentPlan === "biannual" ||
                  formData.paymentPlan === "semester"
                    ? "border-[#561291] bg-[#561291]/5 text-[#561291] shadow-xs"
                    : "border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-base font-bold block">
                      <SiteText
                        fallback={
                          language === "en"
                            ? "Semi-Annual"
                            : "En gang i halvåret"
                        }
                      />
                    </span>
                    <span className="text-xs text-slate-600 block">
                      <SiteText
                        fallback={
                          language === "en"
                            ? "$500 USD twice a year (2 installments)"
                            : "5 000,- per halvår (2 terminer)"
                        }
                      />
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="paymentPlan"
                    value="biannual"
                    checked={
                      formData.paymentPlan === "biannual" ||
                      formData.paymentPlan === "semester"
                    }
                    onChange={handleInputChange}
                    className="accent-[#561291] w-4 h-4 mt-1 shrink-0"
                  />
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/50 text-[11px] text-slate-500 font-medium">
                  <SiteText
                    fallback={
                      language === "en"
                        ? "Total tuition $1,000 USD"
                        : "Total studieavgift: 10 000,-"
                    }
                  />
                </div>
              </label>

              {/* 3. Hele prisen på en gang */}
              <label
                className={`border rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
                  formData.paymentPlan === "full" ||
                  formData.paymentPlan === "year"
                    ? "border-[#561291] bg-[#561291]/5 text-[#561291] shadow-xs"
                    : "border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-base font-bold block">
                      <SiteText
                        fallback={
                          language === "en"
                            ? "Full Price at Once"
                            : "Hele prisen på en gang"
                        }
                      />
                    </span>
                    <span className="text-xs text-slate-600 block">
                      <SiteText
                        fallback={
                          language === "en"
                            ? "$1,000 USD (one-time payment)"
                            : "10 000,- NOK (engangsbetaling)"
                        }
                      />
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="paymentPlan"
                    value="full"
                    checked={
                      formData.paymentPlan === "full" ||
                      formData.paymentPlan === "year"
                    }
                    onChange={handleInputChange}
                    className="accent-[#561291] w-4 h-4 mt-1 shrink-0"
                  />
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/50 text-[11px] text-slate-500 font-medium">
                  <SiteText
                    fallback={
                      language === "en"
                        ? "Settled upon enrollment"
                        : "Oppgjøres ved studiestart"
                    }
                  />
                </div>
              </label>
            </div>
          </div>

          {/* Language & Kickoff Agreement Checkbox */}
          <div className="p-4 bg-[#561291]/5 border border-[#561291]/20 rounded-2xl space-y-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                name="languageAgreement"
                required
                checked={formData.languageAgreement}
                onChange={handleInputChange}
                className="mt-1 accent-[#561291] rounded border-slate-300 text-[#561291] w-5 h-5 shrink-0"
              />
              <div className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed">
                <span className="font-bold text-[#561291] block">
                  <SiteText
                    fallback={
                      language === "en"
                        ? "Instruction Language & Kickoff Gathering Agreement *"
                        : "Bekreftelse på undervisningsspråk & kickoff-samling *"
                    }
                  />
                </span>
                <SiteText
                  fallback={
                    language === "en"
                      ? "I confirm that I understand all instruction and materials are conducted in English, with an on-site kickoff gathering in Norway on August 20–22, 2027."
                      : "Jeg bekrefter at jeg er innforstått med at all undervisning foregår på engelsk via nett, med en obligatorisk/anbefalt kickoff-samling i Norge 20.–22. august 2027."
                  }
                />
              </div>
            </label>
          </div>

          {/* Track 2 Prerequisite Checkbox (if applicable) */}
          {formData.program === "prophets_advanced" && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
              <div className="flex gap-2.5 text-amber-900 text-sm">
                <Lock size={16} className="shrink-0 mt-0.5" />
                <p className="font-medium leading-relaxed">
                  <SiteText
                    fallback={
                      language === "en"
                        ? "This program (Year 2) launches in 2028. To apply, you must confirm that you plan to complete or have completed Year 1 (His Kingdom Prophetic Community) first."
                        : "Dette studieløpet (2. år) starter ikke før i 2028. For å søke opptak, må du bekrefte at du har fullført eller planlegger å fullføre 1. år (His Kingdom Prophetic Community) først."
                    }
                  />
                </p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  name="confirmYear1"
                  required
                  checked={formData.confirmYear1}
                  onChange={handleInputChange}
                  className="mt-1 accent-amber-600 rounded border-amber-300 text-amber-600 w-5 h-5 shrink-0"
                />
                <span className="text-sm sm:text-base text-amber-950 font-bold leading-normal">
                  <SiteText
                    fallback={
                      language === "en"
                        ? "I confirm that I plan to complete or have completed Year 1 first *"
                        : "Jeg bekrefter at jeg har fullført eller planlegger å fullføre 1. år først *"
                    }
                  />
                </span>
              </label>
            </div>
          )}

          {/* Navigation & Draft Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex-1 sm:flex-initial min-h-[44px] px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base uppercase tracking-wider rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />
                <span>
                  <SiteText fallback={language === "en" ? "Back" : "Tilbake"} />
                </span>
              </button>
              <button
                type="button"
                disabled={adminPreview}
                onClick={() => {
                  saveDraft(formData, currentStep);
                  showToast(
                    language === "en"
                      ? "Draft saved! You can resume anytime."
                      : "Kladd lagret! Du kan lukke siden og fortsette senere.",
                  );
                }}
                className="flex-1 sm:flex-initial min-h-[44px] px-4 py-3 text-slate-600 hover:text-[#561291] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-medium text-sm transition-all duration-200 inline-flex items-center justify-center gap-2"
              >
                <Save size={16} />
                <span>
                  <SiteText
                    fallback={language === "en" ? "Save Draft" : "Lagre kladd"}
                  />
                </span>
              </button>
            </div>
            <button
              type="button"
              onClick={handleNextStep}
              className="w-full sm:w-auto min-h-[44px] px-8 py-3.5 bg-[#D7B978] hover:bg-[#c4a565] text-[#561291] font-bold text-base uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2"
            >
              <span>
                <SiteText
                  fallback={
                    language === "en"
                      ? "Next: Spiritual Background"
                      : "Neste: Åndelig bakgrunn"
                  }
                />
              </span>
              <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: SPIRITUAL BACKGROUND & CALLING */}
      {currentStep === 3 && (
        <motion.div
          key="step-3"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="space-y-6"
        >
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Heart className="text-[#561291]" size={20} />
            <h4 className="font-bold text-lg text-[#561291]">
              <SiteText
                fallback={
                  language === "en"
                    ? "3. Spiritual Walk, Calling & Motivation"
                    : "3. Åndelig Bakgrunn, Vandring & Motivasjon"
                }
              />
            </h4>
          </div>

          {/* Q1: whySeeking */}
          <div className="space-y-1.5 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
            <label className="text-sm font-bold text-[#561291] block">
              <SiteText
                fallback={
                  language === "en"
                    ? "Why are you applying to Bible school? *"
                    : "Hvorfor søker du bibelskole? *"
                }
              />
            </label>
            <p className="text-xs text-slate-500 font-normal">
              <SiteText
                fallback={
                  language === "en"
                    ? "What inspires you to set aside this year to grow?"
                    : "Hva motiverer deg til å sette av dette året til å vokse?"
                }
              />
            </p>
            <textarea
              name="whySeeking"
              required
              rows={3}
              value={formData.whySeeking}
              onChange={handleInputChange}
              placeholder={
                language === "en"
                  ? "Write your answer here..."
                  : "Skriv ditt svar her..."
              }
              className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all resize-y"
            />
          </div>

          {/* Q2: expectations */}
          <div className="space-y-1.5 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
            <label className="text-sm font-bold text-[#561291] block">
              <SiteText
                fallback={
                  language === "en"
                    ? "What do you expect from the school year and community? *"
                    : "Hva forventer du deg av skoleåret og fellesskapet? *"
                }
              />
            </label>
            <textarea
              name="expectations"
              required
              rows={3}
              value={formData.expectations}
              onChange={handleInputChange}
              placeholder={
                language === "en"
                  ? "Write your answer here..."
                  : "Skriv ditt svar her..."
              }
              className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all resize-y"
            />
          </div>

          {/* Q3: howHeard */}
          <div className="space-y-1.5 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
            <label className="text-sm font-bold text-[#561291] block">
              <SiteText
                fallback={
                  language === "en"
                    ? "How did you hear about HKPC, and why are you applying here? *"
                    : "Hvordan hørte du om His Kingdom Prophetic Community, og hvorfor søker du her? *"
                }
              />
            </label>
            <textarea
              name="howHeard"
              required
              rows={3}
              value={formData.howHeard}
              onChange={handleInputChange}
              placeholder={
                language === "en"
                  ? "Write your answer here..."
                  : "Skriv ditt svar her..."
              }
              className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all resize-y"
            />
          </div>

          {/* Q4: testimony */}
          <div className="space-y-1.5 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
            <label className="text-sm font-bold text-[#561291] block">
              <SiteText
                fallback={
                  language === "en"
                    ? "Share a bit about your experience with Jesus *"
                    : "Skriv litt om din erfaring og vandring med Jesus *"
                }
              />
            </label>
            <p className="text-xs text-slate-500 font-normal">
              <SiteText
                fallback={
                  language === "en"
                    ? "Your salvation testimony and how your daily relationship with God looks like."
                    : "Din frelsesopplevelse og hvordan hverdagen din med Jesus ser ut."
                }
              />
            </p>
            <textarea
              name="testimony"
              required
              rows={3}
              value={formData.testimony}
              onChange={handleInputChange}
              placeholder={
                language === "en"
                  ? "Write your answer here..."
                  : "Skriv ditt svar her..."
              }
              className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all resize-y"
            />
          </div>

          {/* Q5: churchCommunity */}
          <div className="space-y-1.5 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
            <label className="text-sm font-bold text-[#561291] block">
              <SiteText
                fallback={
                  language === "en"
                    ? "Do you belong to a local church / community? If yes, which one? *"
                    : "Tilhører du en menighet? Hvis ja, hvilken? *"
                }
              />
            </label>
            <p className="text-xs text-slate-500 font-normal">
              <SiteText
                fallback={
                  language === "en"
                    ? "Church name, location, and optionally pastor/leader name."
                    : "Navn på menighet/fellesskap, sted og eventuelt pastor/leder."
                }
              />
            </p>
            <input
              type="text"
              name="churchCommunity"
              required
              value={formData.churchCommunity}
              onChange={handleInputChange}
              placeholder={
                language === "en"
                  ? "E.g. Filadelfia Oslo, Pastor..."
                  : "F.eks. Filadelfia Oslo, Pastor..."
              }
              className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all"
            />
          </div>

          {/* Q6: currentMinistry */}
          <div className="space-y-1.5 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
            <label className="text-sm font-bold text-[#561291] block">
              <SiteText
                fallback={
                  language === "en"
                    ? "Are you in any form of ministry or volunteer work? If yes, please describe *"
                    : "Er du i en form for tjeneste eller frivillig arbeid? Hvis ja, skriv litt om det *"
                }
              />
            </label>
            <textarea
              name="currentMinistry"
              required
              rows={3}
              value={formData.currentMinistry}
              onChange={handleInputChange}
              placeholder={
                language === "en"
                  ? "E.g. worship team, hospitality, prayer group, youth work..."
                  : "F.eks. lovsang, vertskap, forbønn, lederansvar, barne-/ungdomsarbeid..."
              }
              className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all resize-y"
            />
          </div>

          {/* Q7: ministryCalling */}
          <div className="space-y-1.5 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
            <label className="text-sm font-bold text-[#561291] block">
              <SiteText
                fallback={
                  language === "en"
                    ? "What ministry or spiritual gift do you feel called to grow in? *"
                    : "Hvilken tjeneste kunne du tenke deg å være i / nådegave å vokse i? *"
                }
              />
            </label>
            <textarea
              name="ministryCalling"
              required
              rows={3}
              value={formData.ministryCalling}
              onChange={handleInputChange}
              placeholder={
                language === "en"
                  ? "Write your answer here..."
                  : "Skriv ditt svar her..."
              }
              className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all resize-y"
            />
          </div>

          {/* Q8: dreamsVision */}
          <div className="space-y-1.5 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
            <label className="text-sm font-bold text-[#561291] block">
              <SiteText
                fallback={
                  language === "en"
                    ? "Tell us a bit about your dreams and visions *"
                    : "Si litt om dine drømmer og visjoner *"
                }
              />
            </label>
            <p className="text-xs text-slate-500 font-normal">
              <SiteText
                fallback={
                  language === "en"
                    ? "What has God placed on your heart for His kingdom and people?"
                    : "Hva har Gud lagt på hjertet ditt for Hans rike og mennesker rundt deg?"
                }
              />
            </p>
            <textarea
              name="dreamsVision"
              required
              rows={3}
              value={formData.dreamsVision}
              onChange={handleInputChange}
              placeholder={
                language === "en"
                  ? "Write your answer here..."
                  : "Skriv ditt svar her..."
              }
              className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all resize-y"
            />
          </div>

          {/* Q9: hobbies */}
          <div className="space-y-1.5 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
            <label className="text-sm font-bold text-[#561291] block">
              <SiteText
                fallback={
                  language === "en"
                    ? "What do you like to do? (Hobbies and leisure interests) *"
                    : "Hva liker du å gjøre? (hobbyer / fritidsinteresser) *"
                }
              />
            </label>
            <textarea
              name="hobbies"
              required
              rows={2}
              value={formData.hobbies}
              onChange={handleInputChange}
              placeholder={
                language === "en"
                  ? "E.g. music, outdoors, sports, reading, crafting..."
                  : "F.eks. musikk, friluftsliv, trening, lesing, baking, kunst..."
              }
              className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all resize-y"
            />
          </div>

          {/* Navigation & Draft Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex-1 sm:flex-initial min-h-[44px] px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base uppercase tracking-wider rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />
                <span>
                  <SiteText fallback={language === "en" ? "Back" : "Tilbake"} />
                </span>
              </button>
              <button
                type="button"
                disabled={adminPreview}
                onClick={() => {
                  saveDraft(formData, currentStep);
                  showToast(
                    language === "en"
                      ? "Draft saved! You can resume anytime."
                      : "Kladd lagret! Du kan lukke siden og fortsette senere.",
                  );
                }}
                className="flex-1 sm:flex-initial min-h-[44px] px-4 py-3 text-slate-600 hover:text-[#561291] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-medium text-sm transition-all duration-200 inline-flex items-center justify-center gap-2"
              >
                <Save size={16} />
                <span>
                  <SiteText
                    fallback={language === "en" ? "Save Draft" : "Lagre kladd"}
                  />
                </span>
              </button>
            </div>
            <button
              type="button"
              onClick={handleNextStep}
              className="w-full sm:w-auto min-h-[44px] px-8 py-3.5 bg-[#D7B978] hover:bg-[#c4a565] text-[#561291] font-bold text-base uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2"
            >
              <span>
                <SiteText
                  fallback={
                    language === "en"
                      ? "Next: Reference & Final Review"
                      : "Neste: Referanse & fullfør"
                  }
                />
              </span>
              <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 4: REFERENCE & FINAL REVIEW */}
      {currentStep === 4 && (
        <motion.div
          key="step-4"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="space-y-6"
        >
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <GraduationCap className="text-[#561291]" size={20} />
            <h4 className="font-bold text-lg text-[#561291]">
              <SiteText
                fallback={
                  language === "en"
                    ? "4. Reference & Final Submission"
                    : "4. Referanse & Innsending"
                }
              />
            </h4>
          </div>

          {/* Reference */}
          <div className="space-y-1.5 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
            <label className="text-sm font-bold text-[#561291] block">
              <SiteText
                fallback={
                  language === "en"
                    ? "Reference (Pastor, leader, or trusted mature Christian) *"
                    : "Referanse (Pastor, leder eller annen betrodd person) *"
                }
              />
            </label>
            <p className="text-xs text-slate-500 font-normal">
              <SiteText
                fallback={
                  language === "en"
                    ? "Please include: Full Name, Relationship/Title, Phone number, and Email address."
                    : "Vennligst oppgi: Fullt navn, relasjon/rolle, telefonnummer og e-postadresse."
                }
              />
            </p>
            <textarea
              name="reference"
              required
              rows={3}
              value={formData.reference}
              onChange={handleInputChange}
              placeholder={
                language === "en"
                  ? "E.g. Pastor John Doe, Cornerstone Church, Phone: +47 900 00 000, Email: pastor@church.com"
                  : "F.eks. Pastor Ola Hansen, Salemkirken, Tlf: +47 900 00 000, E-post: pastor@salem.no"
              }
              className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all resize-y"
            />
          </div>

          {/* Optional Notes */}
          <div className="space-y-1.5 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
            <label className="text-sm font-bold text-slate-700 block">
              <SiteText
                fallback={
                  language === "en"
                    ? "Other notes or health considerations (Optional)"
                    : "Annet du ønsker at vi skal vite om deg (Valgfritt)"
                }
              />
            </label>
            <p className="text-xs text-slate-500 font-normal">
              <SiteText
                fallback={
                  language === "en"
                    ? "Health conditions, special needs, or any additional context you wish to share."
                    : "Eventuelle helsemessige hensyn, spesielle behov, eller andre opplysninger du vil dele med ledelsen."
                }
              />
            </p>
            <textarea
              name="additionalNotes"
              rows={3}
              value={formData.additionalNotes}
              onChange={handleInputChange}
              placeholder={
                language === "en"
                  ? "Any optional info..."
                  : "Skriv eventuelle tilleggsopplysninger her..."
              }
              className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all resize-y"
            />
          </div>

          {/* Summary Review Card */}
          <div className="bg-[#561291]/5 border border-[#561291]/20 rounded-2xl p-5 space-y-3">
            <h5 className="font-bold text-[#561291] text-sm uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-[#561291]" />
              <span>
                <SiteText
                  fallback={
                    language === "en"
                      ? "Application Summary"
                      : "Oppsummering av søknaden"
                  }
                />
              </span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500 block text-xs uppercase font-semibold">
                  <SiteText
                    fallback={language === "en" ? "Applicant" : "Søker"}
                  />
                </span>
                <span className="font-bold text-slate-800">
                  {formData.name || "-"} ({formData.gender || "-"})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs uppercase font-semibold">
                  <SiteText
                    fallback={
                      language === "en" ? "Email / Phone" : "E-post & telefon"
                    }
                  />
                </span>
                <span className="font-bold text-slate-800">
                  {formData.email} • {formData.phone}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs uppercase font-semibold">
                  <SiteText
                    fallback={language === "en" ? "Study Line" : "Studielinje"}
                  />
                </span>
                <span className="font-bold text-[#561291]">
                  <SiteText fallback={selectedProg.title} />
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs uppercase font-semibold">
                  <SiteText
                    fallback={
                      language === "en" ? "Billing Plan" : "Betalingsordning"
                    }
                  />
                </span>
                <span className="font-bold text-[#561291]">
                  <SiteText
                    fallback={
                      formData.paymentPlan === "monthly"
                        ? language === "en"
                          ? "Monthly installment (10 payments)"
                          : "Månedlig delbetaling (10 terminer)"
                        : formData.paymentPlan === "biannual" ||
                            formData.paymentPlan === "semester"
                          ? language === "en"
                            ? "Semi-annual (2 installments)"
                            : "Halvårlig betaling (2 terminer)"
                          : language === "en"
                            ? "Full price at once"
                            : "Hele prisen på en gang"
                    }
                  />
                </span>
              </div>
            </div>
          </div>

          {/* Navigation & Submit Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex-1 sm:flex-initial min-h-[44px] px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base uppercase tracking-wider rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />
                <span>
                  <SiteText fallback={language === "en" ? "Back" : "Tilbake"} />
                </span>
              </button>
              <button
                type="button"
                disabled={adminPreview}
                onClick={() => {
                  saveDraft(formData, currentStep);
                  showToast(
                    language === "en"
                      ? "Draft saved! You can resume anytime."
                      : "Kladd lagret! Du kan lukke siden og fortsette senere.",
                  );
                }}
                className="flex-1 sm:flex-initial min-h-[44px] px-4 py-3 text-slate-600 hover:text-[#561291] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-medium text-sm transition-all duration-200 inline-flex items-center justify-center gap-2"
              >
                <Save size={16} />
                <span>
                  <SiteText
                    fallback={language === "en" ? "Save Draft" : "Lagre kladd"}
                  />
                </span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || adminPreview}
              className="w-full sm:w-auto min-h-[48px] px-10 py-4 bg-[#D7B978] hover:bg-[#c4a565] text-[#561291] font-bold text-base font-sans uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-[#561291]/30 border-t-[#561291] animate-spin" />
                  <span>
                    <SiteText
                      fallback={
                        language === "en"
                          ? "Submitting Application..."
                          : "Sender inn søknad..."
                      }
                    />
                  </span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>
                    <SiteText
                      fallback={
                        language === "en"
                          ? "Submit Application"
                          : "Send Inn Min Søknad"
                      }
                    />
                  </span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </form>
  );
}
