import TuitionPaymentDetails from "../features/admission/panels/TuitionPaymentDetails";
import AdmissionForm from "../features/admission/panels/AdmissionForm";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { useState, useEffect } from "react";
import { ADMISSION_OPEN_DATE } from "../features/admission/lib/ADMISSION_OPEN_DATE";
import {
  sanitizeEmail,
  sanitizeEmailSubject,
  escapeHtml,
  escapeHtmlWithLineBreaks,
} from "@/utils/security";
import { DRAFT_KEY } from "../features/admission/lib/DRAFT_KEY";
import { DRAFT_STEP_KEY } from "../features/admission/lib/DRAFT_STEP_KEY";
import { calculateAge } from "../features/admission/lib/calculateAge";
import SeoHead from "@/components/SeoHead";
import SiteHeader from "@/components/SiteHeader";
import CmsText from "@/components/CmsText";
import {
  ChevronRight,
  Lock,
  Calendar,
  Check,
  CreditCard,
  Clock,
  Sparkles,
  Bell,
  CheckCircle2,
  FileText,
  GraduationCap,
  RotateCcw,
  User,
  AlertTriangle,
  Save,
  ArrowRight,
  BookOpen,
  ArrowLeft,
  Heart,
  Send,
} from "lucide-react";
import SiteText from "@/components/SiteText";
import { motion, AnimatePresence } from "framer-motion";
import { getEighteenYearsAgoDateString } from "../features/admission/lib/getEighteenYearsAgoDateString";
import SiteFooter from "@/components/SiteFooter";

export default function AdmissionPage() {
  const navigate = useNavigate();
  const {
    language,
    toggleLanguage,
    showToast,
    user,
    admissionFormOpen,
    setAdmissionFormOpenState,
  } = useApp();

  const stripePublicKey =
    "pk_live_51Pab8rAL393JGrO9bTUitYflDKlHGpLiqZCCBp0dCzBEV3ZFxARFfK6MgWraehq7i79tJHPIEzlpMwPiT2K3HsiZ00gJ1TQ71Y";

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const [fillRealApplication, setFillRealApplication] = useState(false);
  const adminPreview = isAdmin && !fillRealApplication;
  const isPreviewMode =
    new URLSearchParams(window.location.search).get("preview") === "true";
  const isFormManuallyOpen = Boolean(admissionFormOpen);

  // Check if admission is open (automatically unlocks on Jan 1, 2027, or when toggled open by admin, or with ?preview=true / admin)
  const isAdmissionOpen =
    isFormManuallyOpen ||
    new Date() >= ADMISSION_OPEN_DATE ||
    isPreviewMode ||
    isAdmin;

  // Interest List / Reminder State (for visitors before Jan 1, 2027)
  const [interestEmail, setInterestEmail] = useState("");
  const [interestName, setInterestName] = useState("");
  const [interestSubmitted, setInterestSubmitted] = useState(false);
  const [isSubmittingInterest, setIsSubmittingInterest] = useState(false);

  const handleInterestSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!interestEmail.trim() || !interestEmail.includes("@")) {
      showToast(
        language === "en"
          ? "Please enter a valid email address."
          : "Vennligst oppgi en gyldig e-postadresse.",
        "error",
      );
      return;
    }

    setIsSubmittingInterest(true);
    try {
      const { db } = await import("@/firebase");
      const { collection, addDoc, serverTimestamp, doc, setDoc } = await import(
        "firebase/firestore"
      );

      await addDoc(collection(db, "admission_leads"), {
        name: interestName.trim(),
        email: interestEmail.trim(),
        createdAt: serverTimestamp(),
        source: "admission_portal_reminder_2027",
      });

      try {
        const emailRef = doc(collection(db, "support_emails"));
        await setDoc(emailRef, {
          to: "school@hiskingdomministry.no",
          replyTo:
            sanitizeEmail(interestEmail) || "school@hiskingdomministry.no",
          message: {
            subject: `[HKPC Opptak 2027] Ny interessert student: ${sanitizeEmailSubject(interestName.trim() || interestEmail.trim())}`,
            text: `En potensiell søker har registrert seg for påminnelse når søknadsportalen åpner 1. januar 2027:\n\nNavn: ${interestName.trim() || "Ikke oppgitt"}\nE-post: ${interestEmail.trim()}`,
          },
        });
      } catch (mailErr) {}

      setInterestSubmitted(true);
      showToast(
        language === "en"
          ? "Thank you! We will notify you when applications open."
          : "Takk! Vi sender deg varsel så snart søknaden åpner 1. januar 2027.",
      );
    } catch (err) {
      console.error("Kunne ikke lagre interesse:", err);
      showToast("Noe gikk galt: " + err.message, "error");
    } finally {
      setIsSubmittingInterest(false);
    }
  };

  // Multi-step Application Form States (4 steps)
  const [currentStep, setCurrentStep] = useState(1); // 1: Personalia, 2: Studielinje, 3: Åndelig bakgrunn, 4: Referanse
  const [hasDraft, setHasDraft] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState(null);
  const [formData, setFormData] = useState({
    // Del 1: Personalia & kontaktinformasjon
    name: "",
    gender: "", // 'Mann', 'Kvinne'
    birthDate: "",
    email: "",
    phone: "",
    address: "",
    maritalStatus: "", // 'Gift', 'Ugift', 'Forlovet', 'Separert / skilt', 'Enke / enkemann'
    occupation: "",

    // Del 2: Studielinje & praktiske rammer
    program: "prophetic_community",
    paymentPlan: "monthly", // 'monthly', 'biannual', 'full'
    languageAgreement: false,
    confirmYear1: false,

    // Del 3: Åndelig bakgrunn, vandring & motivasjon
    whySeeking: "",
    expectations: "",
    howHeard: "",
    testimony: "",
    churchCommunity: "",
    currentMinistry: "",
    ministryCalling: "",
    dreamsVision: "",
    hobbies: "",

    // Del 4: Referanse & tilleggsopplysninger
    reference: "",
    additionalNotes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePlan, setActivePlan] = useState("full"); // 'full', 'biannual', 'monthly'

  const [stripeElements, setStripeElements] = useState(null);
  const [stripeInstance, setStripeInstance] = useState(null);
  const [paymentStep, setPaymentStep] = useState("form"); // 'form', 'payment', 'success'
  const [clientSecret, setClientSecret] = useState("");
  const [paymentError, setPaymentError] = useState("");

  // 1. Auto-restore draft from localStorage on initial load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
        setHasDraft(true);
        setDraftSavedAt(new Date());

        const savedStep = localStorage.getItem(DRAFT_STEP_KEY);
        if (savedStep && !isNaN(parseInt(savedStep))) {
          const stepNum = parseInt(savedStep);
          if (stepNum >= 1 && stepNum <= 4) {
            setCurrentStep(stepNum);
          }
        }
      }
    } catch (err) {
      console.warn("Klarte ikke gjenopprette kladd:", err);
    }
  }, []);

  // Helper to persist draft
  const saveDraft = (dataToSave, step = currentStep) => {
    if (adminPreview) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(dataToSave));
      localStorage.setItem(DRAFT_STEP_KEY, String(step));
      setHasDraft(true);
      setDraftSavedAt(new Date());
    } catch (err) {
      console.warn("Klarte ikke lagre kladd:", err);
    }
  };

  // Helper to clear draft
  const clearDraft = () => {
    const confirmMsg =
      language === "en"
        ? "Are you sure you want to clear your saved draft and start over?"
        : "Er du sikker på at du vil slette den lagrede kladden og starte på nytt?";
    if (window.confirm(confirmMsg)) {
      try {
        localStorage.removeItem(DRAFT_KEY);
        localStorage.removeItem(DRAFT_STEP_KEY);
      } catch (e) {}
      setFormData({
        name: user?.name || "",
        gender: "",
        birthDate: "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: "",
        maritalStatus: "",
        occupation: "",
        program: "prophetic_community",
        paymentPlan: "monthly",
        languageAgreement: false,
        confirmYear1: false,
        whySeeking: "",
        expectations: "",
        howHeard: "",
        testimony: "",
        churchCommunity: "",
        currentMinistry: "",
        ministryCalling: "",
        dreamsVision: "",
        hobbies: "",
        reference: "",
        additionalNotes: "",
      });
      setCurrentStep(1);
      setHasDraft(false);
      setDraftSavedAt(null);
      showToast(language === "en" ? "Draft cleared." : "Kladden er slettet.");
    }
  };

  // Prepopulate form if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  // Handle URL redirect query parameters (post-payment verification)
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const paymentIntentSecret =
      query.get("payment_intent_client_secret") ||
      query.get("subscription_client_secret");
    const redirectStatus = query.get("redirect_status");

    if (paymentIntentSecret && redirectStatus === "succeeded" && user) {
      const updateUserRole = async () => {
        setIsSubmitting(true);
        try {
          const { db } = await import("@/firebase");
          const { doc, setDoc } = await import("firebase/firestore");
          await setDoc(
            doc(db, "users", user.uid),
            { role: "student" },
            { merge: true },
          );

          localStorage.setItem(
            "hkm-current-user",
            JSON.stringify({
              ...user,
              role: "student",
            }),
          );

          setPaymentStep("success");
          showToast(
            language === "en"
              ? "Payment successful! You are now enrolled as a student."
              : "Betaling fullført! Du er nå registrert som student.",
          );
        } catch (err) {
          console.error("Failed to update user role to student:", err);
          showToast(
            "Kunne ikke oppdatere studentrolle. Kontakt support.",
            "error",
          );
        } finally {
          setIsSubmitting(false);
        }
      };
      updateUserRole();
    }
  }, [user, language, showToast]);

  const updateFieldValue = (field, val) => {
    if (
      field === "program" &&
      programs.find((program) => program.id === val)?.isLocked
    )
      return;
    setFormData((prev) => {
      const updated = { ...prev, [field]: val };
      saveDraft(updated, currentStep);
      return updated;
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFieldValue(name, type === "checkbox" ? checked : value);
  };

  // Step Validation Helpers
  const validateStep1 = () => {
    if (!formData.name.trim()) {
      showToast(
        language === "en"
          ? "Please enter your full name."
          : "Vennligst fyll inn fullt navn.",
        "error",
      );
      return false;
    }
    if (!formData.gender) {
      showToast(
        language === "en" ? "Please select gender." : "Vennligst velg kjønn.",
        "error",
      );
      return false;
    }
    if (!formData.birthDate) {
      showToast(
        language === "en"
          ? "Please enter birth date."
          : "Vennligst fyll inn fødselsdato.",
        "error",
      );
      return false;
    }
    if (calculateAge(formData.birthDate) < 18) {
      showToast(
        language === "en"
          ? "You must be at least 18 years old to apply as a student."
          : "Du må være minst 18 år for å søke elevplass ved skolen.",
        "error",
      );
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      showToast(
        language === "en"
          ? "Please enter a valid email address."
          : "Vennligst fyll inn en gyldig e-postadresse.",
        "error",
      );
      return false;
    }
    if (!formData.phone.trim()) {
      showToast(
        language === "en"
          ? "Please enter phone number."
          : "Vennligst fyll inn telefonnummer.",
        "error",
      );
      return false;
    }
    if (!formData.address.trim()) {
      showToast(
        language === "en"
          ? "Please enter residential address."
          : "Vennligst fyll inn bostedsadresse.",
        "error",
      );
      return false;
    }
    if (!formData.maritalStatus) {
      showToast(
        language === "en"
          ? "Please select marital status."
          : "Vennligst velg sivilstatus.",
        "error",
      );
      return false;
    }
    if (!formData.occupation.trim()) {
      showToast(
        language === "en"
          ? "Please enter your occupation / education."
          : "Vennligst fyll inn yrke / utdannelse.",
        "error",
      );
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (
      !programs.some(
        (program) => program.id === formData.program && !program.isLocked,
      )
    ) {
      showToast(
        language === "en"
          ? "Year 2 is not open for applications yet. Please select Year 1."
          : "Påmelding til andre året har ikke åpnet ennå. Velg første året.",
        "error",
      );
      return false;
    }
    if (!formData.languageAgreement) {
      showToast(
        language === "en"
          ? "Please confirm that you accept instruction in English and the kickoff in Norway."
          : "Vennligst bekreft at du godtar undervisningsspråk (engelsk) og kickoff-samlingen i Norge.",
        "error",
      );
      return false;
    }
    if (formData.program === "prophets_advanced" && !formData.confirmYear1) {
      showToast(
        language === "en"
          ? "Please confirm that you plan to complete or have completed Track 1 first."
          : "Vennligst bekreft at du har fullført eller planlegger å fullføre 1. år (Track 1) først.",
        "error",
      );
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.whySeeking.trim()) {
      showToast(
        language === "en"
          ? "Please explain why you are applying to Bible school."
          : "Vennligst svar på hvorfor du søker bibelskole.",
        "error",
      );
      return false;
    }
    if (!formData.expectations.trim()) {
      showToast(
        language === "en"
          ? "Please share what you expect from the school year."
          : "Vennligst svar på hva du forventer deg av skoleåret.",
        "error",
      );
      return false;
    }
    if (!formData.howHeard.trim()) {
      showToast(
        language === "en"
          ? "Please share how you heard about HKPC."
          : "Vennligst svar på hvordan du hørte om HKPC.",
        "error",
      );
      return false;
    }
    if (!formData.testimony.trim()) {
      showToast(
        language === "en"
          ? "Please share a bit about your experience with Jesus."
          : "Vennligst skriv litt om din erfaring med Jesus.",
        "error",
      );
      return false;
    }
    if (!formData.churchCommunity.trim()) {
      showToast(
        language === "en"
          ? "Please specify your church community."
          : "Vennligst oppgi menighetstilhørighet.",
        "error",
      );
      return false;
    }
    if (!formData.currentMinistry.trim()) {
      showToast(
        language === "en"
          ? "Please answer if you are in any ministry or volunteer work."
          : "Vennligst skriv litt om nåværende tjeneste eller frivillig arbeid.",
        "error",
      );
      return false;
    }
    if (!formData.ministryCalling.trim()) {
      showToast(
        language === "en"
          ? "Please describe the ministry/gift you feel called to grow in."
          : "Vennligst beskriv hvilken tjeneste/gave du ønsker å vokse i.",
        "error",
      );
      return false;
    }
    if (!formData.dreamsVision.trim()) {
      showToast(
        language === "en"
          ? "Please share your dreams and visions."
          : "Vennligst skriv litt om dine drømmer og visjoner.",
        "error",
      );
      return false;
    }
    if (!formData.hobbies.trim()) {
      showToast(
        language === "en"
          ? "Please share your hobbies and interests."
          : "Vennligst skriv litt om dine hobbyer og interesser.",
        "error",
      );
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (!formData.reference.trim()) {
      showToast(
        language === "en"
          ? "Please provide a reference (name, phone, email)."
          : "Vennligst oppgi en referanse (navn, telefon og e-post).",
        "error",
      );
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (!adminPreview && currentStep === 1 && !validateStep1()) return;
    if (!adminPreview && currentStep === 2 && !validateStep2()) return;
    if (!adminPreview && currentStep === 3 && !validateStep3()) return;

    const nextStep = Math.min(currentStep + 1, 4);
    setCurrentStep(nextStep);
    saveDraft(formData, nextStep);
    const element = document.getElementById("apply-form");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePrevStep = () => {
    const prevStep = Math.max(currentStep - 1, 1);
    setCurrentStep(prevStep);
    saveDraft(formData, prevStep);
    const element = document.getElementById("apply-form");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleFormSubmit = async (e) => {
    if (e) e.preventDefault();
    if (adminPreview) return;
    if (!isAdmissionOpen) {
      showToast(
        language === "en"
          ? "The application portal opens January 1, 2027."
          : "Søknadsportalen åpner offisielt 1. januar 2027.",
        "error",
      );
      return;
    }
    if (
      !validateStep1() ||
      !validateStep2() ||
      !validateStep3() ||
      !validateStep4()
    )
      return;

    setIsSubmitting(true);
    setPaymentError("");

    try {
      const { db } = await import("@/firebase");
      const { collection, addDoc, serverTimestamp, doc, setDoc } = await import(
        "firebase/firestore"
      );

      const prog =
        programs.find((p) => p.id === formData.program) || programs[0];

      const applicationPayload = {
        userId: user?.uid || null,
        name: formData.name.trim(),
        gender: formData.gender,
        birthDate: formData.birthDate,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        maritalStatus: formData.maritalStatus,
        occupation: formData.occupation.trim(),
        programId: formData.program,
        programTitle: prog.title,
        programCode: prog.code,
        paymentPlan: formData.paymentPlan,
        languageAgreement: formData.languageAgreement,
        confirmYear1: formData.confirmYear1 || false,
        whySeeking: formData.whySeeking.trim(),
        expectations: formData.expectations.trim(),
        howHeard: formData.howHeard.trim(),
        testimony: formData.testimony.trim(),
        churchCommunity: formData.churchCommunity.trim(),
        currentMinistry: formData.currentMinistry.trim(),
        ministryCalling: formData.ministryCalling.trim(),
        dreamsVision: formData.dreamsVision.trim(),
        hobbies: formData.hobbies.trim(),
        reference: formData.reference.trim(),
        additionalNotes: formData.additionalNotes
          ? formData.additionalNotes.trim()
          : "",
        status: "pending_review",
        submittedAt: new Date().toISOString(),
        createdAt: serverTimestamp(),
      };

      // 1. Lagre søknad i Firestore 'applications' for administrasjonens opptaksbehandling
      const docRef = await addDoc(
        collection(db, "applications"),
        applicationPayload,
      );

      // 2. Send e-postvarsel til administrasjonen via 'support_emails'
      try {
        const safeName = escapeHtml(formData.name.trim());
        const rawEmail = sanitizeEmail(formData.email);
        const safeEmail = escapeHtml(rawEmail);
        const safePhone = escapeHtml(formData.phone.trim());
        const safeBirthDate = escapeHtml(formData.birthDate || "-");
        const safeGender = escapeHtml(formData.gender || "-");
        const safeMaritalStatus = escapeHtml(formData.maritalStatus || "-");
        const safeAddress = escapeHtml(formData.address.trim() || "-");
        const safeOccupation = escapeHtml(formData.occupation.trim() || "-");
        const safeProgTitle = escapeHtml(prog.title);
        const safeProgCode = escapeHtml(prog.code);
        const safePaymentPlan =
          formData.paymentPlan === "monthly"
            ? "Månedlig delbetaling (1 000,- / $100 USD per mnd i 10 mnd)"
            : formData.paymentPlan === "biannual" ||
                formData.paymentPlan === "semester"
              ? "Halvårlig betaling (5 000,- / $500 USD to ganger i året)"
              : "Hele prisen på en gang (10 000,- / $1,000 USD fullt studieår)";
        const safeChurchCommunity = escapeHtml(
          formData.churchCommunity.trim() || "-",
        );
        const safeCurrentMinistry = escapeHtml(
          formData.currentMinistry.trim() || "-",
        );
        const safeMinistryCalling = escapeHtml(
          formData.ministryCalling.trim() || "-",
        );
        const safeReference = escapeHtml(formData.reference.trim() || "-");
        const safeTestimony = escapeHtmlWithLineBreaks(
          formData.testimony.trim() || "",
        );
        const safeWhySeeking = escapeHtmlWithLineBreaks(
          formData.whySeeking.trim() || "",
        );
        const quoteText = safeTestimony || safeWhySeeking;
        const safeDocId = escapeHtml(docRef.id);

        const emailPlanText =
          formData.paymentPlan === "monthly"
            ? "Månedlig (1 000,- per mnd)"
            : formData.paymentPlan === "biannual" ||
                formData.paymentPlan === "semester"
              ? "Halvårlig (5 000,- x 2)"
              : "Hele prisen på en gang (10 000,-)";

        const emailRef = doc(collection(db, "support_emails"));
        await setDoc(emailRef, {
          to: "school@hiskingdomministry.no",
          replyTo: rawEmail || "school@hiskingdomministry.no",
          message: {
            subject: `[HKPC Opptak] Ny søknad fra ${sanitizeEmailSubject(formData.name)}`,
            text: `Det har kommet inn en ny søknad om opptak ved HKPC!\n\nNavn: ${formData.name.trim()}\nE-post: ${formData.email.trim()}\nTelefon: ${formData.phone.trim()}\nStudielinje: ${prog.title} (${prog.code})\nBetalingsordning: ${emailPlanText}\n\nÅpne Google Regneark eller administrasjonsportalen for å se hele søknaden med vitnesbyrd og referanser.`,
            html: `
              <!DOCTYPE html>
              <html lang="no">
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  @media only screen and (max-width: 620px) {
                    .email-container { width: 100% !important; border-radius: 12px !important; }
                    .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
                    .mobile-header-padding { padding: 20px 16px !important; }
                    .mobile-field-label { width: 110px !important; font-size: 13px !important; }
                    .mobile-field-val { font-size: 13px !important; }
                  }
                </style>
              </head>
              <body style="margin: 0; padding: 0; background-color: #F6F4F8; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #271F30;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F6F4F8; margin: 0; padding: 20px 8px 40px 8px;">
                  <tr>
                    <td align="center">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="email-container" style="width: 100%; max-width: 600px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #E2DCE7; box-shadow: 0 10px 30px rgba(86, 18, 145, 0.07);">
                        <tr>
                          <td class="mobile-header-padding" style="background-color: #561291; border-top: 4px solid #D7B978; padding: 26px 28px; text-align: left;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td width="52" valign="middle" style="padding-right: 14px;">
                                  <img src="https://hkpc.no/logo.png" alt="HKPC Logo" width="48" height="48" style="display: block; border-radius: 50%; border: 2px solid #D7B978; background-color: #FFFFFF; object-fit: contain;">
                                </td>
                                <td valign="middle">
                                  <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 19px; font-weight: 700; color: #FFFFFF; line-height: 24px; letter-spacing: 0.01em;">
                                    His Kingdom Prophetic Community
                                  </div>
                                  <div style="font-size: 10px; font-weight: 600; color: #D7B978; text-transform: uppercase; letter-spacing: 0.12em; margin-top: 2px;">
                                    Profetisk Skole &amp; Utrustningssenter
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td class="mobile-padding" style="padding: 28px 24px 20px 24px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                              <tr>
                                <td style="background-color: #FBF5E7; border: 1px solid #D7B978; border-radius: 9999px; padding: 5px 14px; font-size: 11px; font-weight: 700; color: #561291; text-transform: uppercase; letter-spacing: 0.08em;">
                                  ✦ Ny søknad om opptak
                                </td>
                              </tr>
                            </table>
                            <h1 style="margin: 0 0 10px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; line-height: 32px; font-weight: 700; color: #271F30;">
                              Ny søknad fra ${safeName}
                            </h1>
                            <p style="margin: 0 0 22px 0; font-size: 15px; line-height: 24px; color: #6D6575;">
                              Det har kommet inn en ny søknad om opptak ved <strong>HKPC</strong>! Nedenfor finner du en oversikt over søkerens personalia og opptaksdetaljer:
                            </p>
                            
                            <!-- BENTO KORT 1: Personalia -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF8FC; border: 1px solid #EAE6EF; border-radius: 14px; margin-bottom: 16px; overflow: hidden;">
                              <tr>
                                <td style="padding: 18px 20px;">
                                  <div style="font-size: 11px; font-weight: 700; color: #561291; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; border-bottom: 1px solid #EAE6EF; padding-bottom: 8px;">
                                    1. Personalia &amp; Kontaktinformasjon
                                  </div>
                                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; line-height: 22px;">
                                    <tr>
                                      <td width="130" valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">Fullt navn:</td>
                                      <td valign="top" class="mobile-field-val" style="padding: 4px 0; color: #271F30; font-weight: 700;">${safeName}</td>
                                    </tr>
                                    <tr>
                                      <td valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">E-postadresse:</td>
                                      <td valign="top" class="mobile-field-val" style="padding: 4px 0;">
                                        <a href="mailto:${safeEmail}" style="color: #561291; font-weight: 600; text-decoration: underline;">${safeEmail}</a>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">Telefon:</td>
                                      <td valign="top" class="mobile-field-val" style="padding: 4px 0;">
                                        <a href="tel:${safePhone}" style="color: #561291; font-weight: 600; text-decoration: none;">${safePhone}</a>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">Fødselsdato:</td>
                                      <td valign="top" class="mobile-field-val" style="padding: 4px 0; color: #271F30;">${safeBirthDate}</td>
                                    </tr>
                                    <tr>
                                      <td valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">Kjønn / Sivil:</td>
                                      <td valign="top" class="mobile-field-val" style="padding: 4px 0; color: #271F30;">${safeGender} • ${safeMaritalStatus}</td>
                                    </tr>
                                    <tr>
                                      <td valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">Adresse / Sted:</td>
                                      <td valign="top" class="mobile-field-val" style="padding: 4px 0; color: #271F30;">${safeAddress}</td>
                                    </tr>
                                    <tr>
                                      <td valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">Yrke / Utdanning:</td>
                                      <td valign="top" class="mobile-field-val" style="padding: 4px 0; color: #271F30;">${safeOccupation}</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>

                            <!-- BENTO KORT 2: Studielinje -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF8FC; border: 1px solid #EAE6EF; border-radius: 14px; margin-bottom: 16px; overflow: hidden;">
                              <tr>
                                <td style="padding: 18px 20px;">
                                  <div style="font-size: 11px; font-weight: 700; color: #561291; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; border-bottom: 1px solid #EAE6EF; padding-bottom: 8px;">
                                    2. Studielinje &amp; Praktiske Rammer
                                  </div>
                                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; line-height: 22px;">
                                    <tr>
                                      <td width="130" valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">Studielinje:</td>
                                      <td valign="top" class="mobile-field-val" style="padding: 4px 0; color: #271F30; font-weight: 700;">
                                        ${safeProgTitle} 
                                        <span style="display: inline-block; background-color: #561291; color: #FFFFFF; font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 4px; margin-left: 4px; text-transform: uppercase; letter-spacing: 0.04em;">${safeProgCode}</span>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">Betalingsordning:</td>
                                      <td valign="top" class="mobile-field-val" style="padding: 4px 0; color: #271F30; font-weight: 600;">${safePaymentPlan}</td>
                                    </tr>
                                    <tr>
                                      <td valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">Språk &amp; Kickoff:</td>
                                      <td valign="top" class="mobile-field-val" style="padding: 4px 0; color: #271F30;">Godtatt (Engelsk undervisning + Kickoff i Norge 20.–22. aug 2027)</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>

                            <!-- BENTO KORT 3: Bakgrunn & Referanse -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF8FC; border: 1px solid #EAE6EF; border-radius: 14px; margin-bottom: 22px; overflow: hidden;">
                              <tr>
                                <td style="padding: 18px 20px;">
                                  <div style="font-size: 11px; font-weight: 700; color: #561291; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; border-bottom: 1px solid #EAE6EF; padding-bottom: 8px;">
                                    3. Bakgrunn, Tjeneste &amp; Referanse
                                  </div>
                                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; line-height: 22px;">
                                    <tr>
                                      <td width="130" valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">Menighet:</td>
                                      <td valign="top" class="mobile-field-val" style="padding: 4px 0; color: #271F30;">${safeChurchCommunity}</td>
                                    </tr>
                                    <tr>
                                      <td valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">Nåværende tjeneste:</td>
                                      <td valign="top" class="mobile-field-val" style="padding: 4px 0; color: #271F30;">${safeCurrentMinistry}</td>
                                    </tr>
                                    <tr>
                                      <td valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">Kall / nådegave:</td>
                                      <td valign="top" class="mobile-field-val" style="padding: 4px 0; color: #271F30;">${safeMinistryCalling}</td>
                                    </tr>
                                    <tr>
                                      <td valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">Oppgitt referanse:</td>
                                      <td valign="top" class="mobile-field-val" style="padding: 4px 0; color: #271F30; font-weight: 700;">${safeReference}</td>
                                    </tr>
                                  </table>

                                  ${
                                    quoteText
                                      ? `
                                  <div style="margin-top: 14px; padding: 12px 16px; background-color: #FFFFFF; border-left: 3px solid #561291; border-radius: 0 10px 10px 0; font-size: 13px; line-height: 20px; color: #464554; font-style: italic; word-break: break-word;">
                                    &ldquo;${quoteText}&rdquo;
                                  </div>`
                                      : ""
                                  }
                                </td>
                              </tr>
                            </table>

                            <!-- Call to Action Box -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #FAF8FC 0%, #F5EEFC 100%); border: 1px solid #E2DCE7; border-radius: 16px; margin-bottom: 6px;">
                              <tr>
                                <td style="padding: 24px 20px; text-align: center;">
                                  <div style="font-size: 13px; font-weight: 600; color: #561291; margin-bottom: 6px;">
                                    Fullstendig søknadsdokumentasjon
                                  </div>
                                  <div style="font-size: 14px; color: #464554; line-height: 20px; margin-bottom: 18px;">
                                    Åpne Google Regneark eller administrasjonsportalen for å se hele søknaden med vitnesbyrd og referanser.
                                  </div>
                                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                                    <tr>
                                      <td align="center" style="border-radius: 12px; background-color: #561291;">
                                        <a href="https://app.hkpc.no/admin?section=admissions" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: 700; color: #FFFFFF; text-decoration: none; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.05em; min-height: 44px; line-height: 20px; box-sizing: border-box;">
                                          Åpne Adminportalen &rarr;
                                        </a>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>

                          </td>
                        </tr>
                        <tr>
                          <td style="background-color: #FAF8FC; border-top: 1px solid #EAE6EF; padding: 22px 24px; text-align: center;">
                            <div style="font-size: 12px; font-weight: 700; color: #561291; margin-bottom: 4px;">
                              His Kingdom Prophetic Community (HKPC)
                            </div>
                            <div style="font-size: 11px; color: #6D6575; line-height: 18px; margin-bottom: 8px;">
                              Offisiell søknadsportal: <a href="https://hkpc.no" target="_blank" style="color: #561291; text-decoration: underline;">hkpc.no</a> • Kontakt: <a href="mailto:school@hiskingdomministry.no" style="color: #561291; text-decoration: underline;">school@hiskingdomministry.no</a>
                            </div>
                            <div style="font-size: 10px; color: #8F8B99;">
                              Søknads-ID: ${safeDocId} • Registrert via www.hkpc.no/admission
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            `,
          },
        });
      } catch (emailErr) {
        console.warn(
          "Kunne ikke sende e-postvarsel, men søknaden er lagret i Firestore:",
          emailErr,
        );
      }

      // 3. Webhook til Google Sheets (miljøvariabel med fallback til aktiv implementering)
      const sheetsWebhook =
        import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL ||
        "https://script.google.com/macros/s/AKfycbydGBIQJZY76iGUA623g4qkoTyihKauzcLPCHZ8u8zWqxyO1hUkxKtb3UJBSkbgEEY51A/exec";
      if (sheetsWebhook) {
        try {
          await fetch(sheetsWebhook, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: docRef.id,
              ...applicationPayload,
              createdAt: new Date().toISOString(),
            }),
          });
        } catch (sheetErr) {
          console.warn("Google Sheets webhook varsel:", sheetErr);
        }
      }

      // Clear saved draft on successful submission
      try {
        localStorage.removeItem(DRAFT_KEY);
        localStorage.removeItem(DRAFT_STEP_KEY);
        setHasDraft(false);
        setDraftSavedAt(null);
      } catch (e) {}

      setPaymentStep("success");
      showToast(
        language === "en"
          ? "Application submitted successfully!"
          : "Søknaden er sendt inn! Vi tar kontakt for en samtale.",
      );
    } catch (err) {
      console.error("Submission failed:", err);
      showToast(
        language === "en"
          ? "Failed to submit application: " + err.message
          : "Kunne ikke sende søknad: " + err.message,
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const programs = [
    {
      id: "prophetic_community",
      code: language === "en" ? "Year 1" : "1. år",
      title: "His Kingdom Prophetic Community",
      duration:
        language === "en"
          ? "1 Year • English • On-site Kickoff Aug 20–22"
          : "1 År • Engelsk • Kickoff i Norge 20.–22. aug",
      priceYear: language === "en" ? "$1,000 USD" : "10 000,-",
      priceMonthly: language === "en" ? "$100 USD / mo" : "1 000,- / mnd",
      priceBiannual: language === "en" ? "$500 USD x 2" : "5 000,- x 2",
      isLocked: false,
      features:
        language === "en"
          ? [
              "Age requirement: Minimum 18 years old",
              "All instruction & teaching conducted in English",
              "On-site kickoff gathering in Norway August 20–22, 2027",
              "Tuition: $1,000 USD full year (monthly, semi-annually, or in full)",
              "Admin startup fee: $50 USD",
              "Kickoff room & board: $50 USD (own hotel not covered)",
              "Grow in relationship with Jesus & gifts of the Spirit",
              "Prophecy 101, How to Hear God, Gift vs Office",
              "Join year after year (different subjects yearly)",
            ]
          : [
              "Opptakskrav: Du må være fylt 18 år",
              "All undervisning og veiledning foregår på engelsk",
              "On-site kickoff-samling i Norge 20.–22. august 2027",
              "Studieavgift: 10 000,- (betal mnd, halvår eller hele prisen samlet)",
              "Admin oppstartsgebyr: 500,-",
              "Kost og losji for kickoff-helgen: 500,- (egenvalgt hotell dekkes ikke)",
              "Vokse i relasjon med Jesus og Åndens gaver",
              "Profeti 101, Å høre Guds stemme, Gave vs Tjeneste",
              "Kan tas år etter år med nye temaer hvert år",
            ],
    },
    {
      id: "prophets_advanced",
      code: language === "en" ? "Year 2" : "2. år",
      title:
        language === "en"
          ? "His Kingdom Prophets (starts in 2028)"
          : "His Kingdom Prophets (oppstart 2028)",
      duration:
        language === "en"
          ? "Starts in 2028 (Requires Year 1)"
          : "Starter i 2028 (Krever 1. År)",
      priceYear: language === "en" ? "$1,000 USD" : "10 000,-",
      priceMonthly: language === "en" ? "$100 USD / mo" : "1 000,- / mnd",
      priceBiannual: language === "en" ? "$500 USD x 2" : "5 000,- x 2",
      isLocked: true,
      features:
        language === "en"
          ? [
              "Specifically for those called to the office of a prophet (Launches 2028)",
              "Tuition: $1,000 USD full year (monthly, semi-annually, or in full)",
              "Requires separate reapplication & prayer evaluation",
              "Reading list, paper writing & physical SUPER CHARGE",
              "PREREQUISITE: Must complete Year 1 first",
            ]
          : [
              "Spesifikt for de kalt til embetet som profet (oppstart 2028)",
              "Studieavgift: 10 000,- (betal mnd, halvår eller hele prisen samlet)",
              "Krever ny søknad, pensumliste og skriftlig oppgave",
              "Krav om deltakelse på 1-2 ukers fysisk samling",
              "FORKUNNSKAP: Må ha fullført 1. år først",
            ],
    },
  ];

  const selectedProg =
    programs.find((p) => p.id === formData.program) || programs[0];

  return (
    <div className="bg-[#F6F4F8] text-[#271f30] font-sans min-h-screen">
      <SeoHead
        title={
          language === "en"
            ? "Admissions & Tuition 2027 | His Kingdom Prophetic Community"
            : "Opptak & Priser 2027 | His Kingdom Prophetic Community"
        }
        description={
          language === "en"
            ? "Apply for His Kingdom Prophetic Community 2027. Application period Jan 1 – June 30. Tuition $1,000 USD (10,000 NOK). On-site kickoff in Norway August 20–22, 2027."
            : "Søk opptak ved His Kingdom Prophetic Community for skoleåret 2027. Søkeperiode 1. jan – 30. juni. Studieavgift 10 000 NOK. Kickoff i Norge 20.–22. august 2027."
        }
        canonicalPath="/admission"
        keywords="HKPC opptak, bibelskole opptak, søknad bibelskole, profetisk utrustning, studieavgift, priser bibelskole 2027, His Kingdom Ministry"
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Course",
              "@id": "https://hkpc.no/#course-year1",
              name: "His Kingdom Prophetic Community - 1. Studieår (Track 1)",
              courseCode: "HKPC-Y1",
              description:
                "1-årig nettbasert studie for bibelsk fundament, personlig relasjon til Jesus og praktisk utrustning i Åndens profetiske gaver. Inkluderer kickoff i Norge 20.–22. august 2027.",
              provider: {
                "@type": "EducationalOrganization",
                name: "His Kingdom Prophetic Community",
                url: "https://hkpc.no",
              },
              educationalLevel: "Bibelskole & Disippeltrening",
              educationalCredentialAwarded: "Kursbevis i Profetisk Utrustning",
              coursePrerequisites:
                "Minst 18 år ved studiestart. Søknadsskjema.",
              offers: {
                "@type": "Offer",
                price: "10000",
                priceCurrency: "NOK",
                category: "Tuition",
                availability: "https://schema.org/InStock",
                validFrom: "2027-01-01",
                url: "https://hkpc.no/admission",
              },
            },
            {
              "@type": "BreadcrumbList",
              "@id": "https://hkpc.no/admission#breadcrumb",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Hjem",
                  item: "https://hkpc.no/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Opptak & Priser",
                  item: "https://hkpc.no/admission",
                },
              ],
            },
          ],
        }}
      />

      {/* Site Header */}
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#561291] to-[#3b0b66] text-white py-16 px-6 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-[#D7B978]/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6 sm:space-y-8">
          <CmsText
            slug="admission-hero-title"
            fallback={
              language === "en"
                ? "Be Equipped for Your God-Given Ministry"
                : "Bli utrustet til din gudgitte tjeneste"
            }
            as="h1"
            className="font-sans text-3xl sm:text-5xl font-extrabold leading-snug sm:leading-[1.25] tracking-normal max-w-3xl mx-auto text-white"
          />

          <CmsText
            slug="admission-hero-subtitle"
            fallback={
              language === "en"
                ? "Application period: January 1 – June 30, 2027. On-site kickoff in Norway August 20–22, 2027. All teaching is conducted in English."
                : "Søkeperioden er fra 1. januar til 30. juni 2027, med on-site kickoff i Norge 20.–22. august 2027. All undervisning foregår på engelsk."
            }
            as="p"
            className="text-base sm:text-lg text-[#E5DDED] font-medium max-w-2xl mx-auto leading-relaxed pt-1"
          />

          <div className="pt-4">
            <a
              href="#apply-form"
              className="px-8 py-3.5 bg-[#D7B978] hover:bg-[#c4a565] text-[#561291] font-bold text-sm sm:text-base font-sans uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
            >
              <span>
                {isAdmissionOpen ? (
                  <CmsText
                    slug="admission-hero-cta"
                    fallback={
                      language === "en"
                        ? "Fill Out Application Form"
                        : "Gå til søknadsskjema"
                    }
                  />
                ) : (
                  <CmsText
                    slug="admission-hero-cta-closed"
                    fallback={
                      language === "en"
                        ? "Applications Open Jan 1, 2027"
                        : "Søknaden åpner 1. jan 2027"
                    }
                  />
                )}
              </span>
              <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12 sm:space-y-16">
        {/* SECTION 1: PROGRAMS GRID */}
        <section className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <CmsText
              slug="admission-programs-title"
              fallback={
                language === "en"
                  ? "Our Study Lines and Courses"
                  : "Våre studielinjer og fag"
              }
              as="h2"
              className="font-sans text-2xl sm:text-3xl font-bold text-[#561291]"
            />
            <CmsText
              slug="admission-programs-subtitle"
              fallback={
                language === "en"
                  ? "Each course consists of 8 step-by-step modules integrating thorough theology with personal mentoring."
                  : "Hvert fag består av 8 trinnvise moduler som integrerer grundig teologi med personlig mentorskap."
              }
              as="p"
              className="text-base text-slate-600 font-medium leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {programs.map((prog) => (
              <div
                key={prog.id}
                className={`bg-white border rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                  prog.isLocked
                    ? "border-amber-200 hover:border-amber-300"
                    : "border-[#e2dce7]/70 hover:border-[#561291]/30"
                }`}
              >
                {prog.isLocked && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-bl-lg flex items-center gap-1">
                    <Lock size={12} />
                    <span>2028</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                        prog.isLocked
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-[#561291]/10 text-[#561291] border border-[#561291]/15"
                      }`}
                    >
                      <CmsText
                        slug={`admission-${prog.id}-code`}
                        fallback={prog.code}
                      />
                    </span>
                  </div>

                  <h3 className="font-sans text-xl sm:text-2xl font-bold text-[#561291] leading-snug">
                    <CmsText
                      slug={`admission-${prog.id}-title`}
                      fallback={prog.title}
                    />
                  </h3>

                  <div className="flex items-center gap-2 text-sm sm:text-base text-slate-600 font-medium">
                    <Calendar
                      size={16}
                      className="text-[#561291]/70 shrink-0"
                    />
                    <span>
                      <CmsText
                        slug={`admission-${prog.id}-duration`}
                        fallback={prog.duration}
                      />
                    </span>
                  </div>

                  <div className="w-full h-[1px] bg-slate-100 my-4" />

                  <ul className="space-y-3">
                    {prog.features.map((feat, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-base text-slate-700 leading-relaxed font-normal"
                      >
                        <Check className="stroke-[3] text-green-600 shrink-0 w-4 h-4 mt-1" />
                        <span>
                          <CmsText
                            slug={`admission-${prog.id}-feat-${i + 1}`}
                            fallback={feat}
                          />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-end">
                  <div className="space-y-0.5">
                    <span className="text-xs uppercase font-bold text-slate-500 block">
                      <CmsText
                        slug="admission-tuition-fee-label"
                        fallback={
                          language === "en"
                            ? "Total Tuition (Full Year)"
                            : "Studieavgift (skoleår)"
                        }
                      />
                    </span>
                    <span className="font-sans text-xl font-extrabold text-[#561291]">
                      <CmsText
                        slug={`admission-${prog.id}-price`}
                        fallback={prog.priceYear}
                      />
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      <SiteText
                        fallback={
                          language === "en"
                            ? "Pay monthly, semi-annually, or full"
                            : "Mnd, halvår eller samlet betaling"
                        }
                      />
                    </span>
                  </div>

                  {prog.isLocked ? (
                    <span className="text-sm font-semibold text-slate-500">
                      {language === "en"
                        ? "Applications open later"
                        : "Påmelding åpner senere"}
                    </span>
                  ) : (
                    <a
                      href="#apply-form"
                      onClick={() => {
                        updateFieldValue("program", prog.id);
                        setCurrentStep(2);
                        saveDraft({ ...formData, program: prog.id }, 2);
                      }}
                      className="text-base font-bold text-[#561291] hover:text-[#3b0b66] flex items-center gap-1 font-sans transition-colors"
                    >
                      <span>
                        <CmsText
                          slug="admission-select-btn"
                          fallback={language === "en" ? "Select" : "Velg linje"}
                        />
                      </span>
                      <ChevronRight size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: TUITION PAYMENT DETAILS */}
        <TuitionPaymentDetails {...{ activePlan, language, setActivePlan }} />

        {/* SECTION 3: STEP BY STEP APPLICATION PROCESS */}
        <section className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <CmsText
              slug="admission-steps-title"
              fallback={
                language === "en"
                  ? "How the Application Process Works"
                  : "Slik fungerer søknadsprosessen"
              }
              as="h2"
              className="font-sans text-2xl sm:text-3xl font-bold text-[#561291]"
            />
            <CmsText
              slug="admission-steps-subtitle"
              fallback={
                language === "en"
                  ? "Four simple steps from submitting your application to your approved study space and access."
                  : "Fire enkle steg fra innsendt søknad til godkjent studieplass og tilgang."
              }
              as="p"
              className="text-base text-slate-600 font-medium leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                slugNum: "admission-step1-num",
                fallbackNum: "01",
                slugTitle: "admission-step1-title",
                fallbackTitle:
                  language === "en" ? "Submit Form" : "Send søknad",
                slugDesc: "admission-step1-desc",
                fallbackDesc:
                  language === "en"
                    ? "Fill out the 4-step admission form below with your background and motivation."
                    : "Fyll ut det 4-delte søknadsskjemaet nedenfor i ro og mak.",
              },
              {
                slugNum: "admission-step2-num",
                fallbackNum: "02",
                slugTitle: "admission-step2-title",
                fallbackTitle:
                  language === "en" ? "Admission Interview" : "Søknadssamtale",
                slugDesc: "admission-step2-desc",
                fallbackDesc:
                  language === "en"
                    ? "We will schedule a brief Zoom or phone call to align callings and course goals."
                    : "Vi tar en kort og uforpliktende samtale på telefon eller Zoom for å bli kjent.",
              },
              {
                slugNum: "admission-step3-num",
                fallbackNum: "03",
                slugTitle: "admission-step3-title",
                fallbackTitle:
                  language === "en" ? "Tuition Setup" : "Betaling & Faktura",
                slugDesc: "admission-step3-desc",
                fallbackDesc:
                  language === "en"
                    ? "Select your preferred payment plan: monthly, semi-annually, or full. Spouses enjoy 25% off."
                    : "Velg din foretrukne betalingsordning: månedlig, halvårlig eller engangsbetaling. Ektepar får 25 % rabatt.",
              },
              {
                slugNum: "admission-step4-num",
                fallbackNum: "04",
                slugTitle: "admission-step4-title",
                fallbackTitle:
                  language === "en"
                    ? "Instant Portal Access"
                    : "Portal-tilgang",
                slugDesc: "admission-step4-desc",
                fallbackDesc:
                  language === "en"
                    ? "Get your login, workbook, study materials, and mobile portal active."
                    : "Du får tilsendt brukerkonto og kan logge inn i portalen og starte studiet!",
              },
            ].map((stepObj, i) => (
              <div
                key={i}
                className="bg-white border border-[#e2dce7]/70 p-6 rounded-2xl relative shadow-sm hover:shadow transition-all duration-200 space-y-3"
              >
                <span className="font-sans text-3xl font-extrabold text-[#D7B978]/30 block">
                  <CmsText
                    slug={stepObj.slugNum}
                    fallback={stepObj.fallbackNum}
                  />
                </span>
                <h4 className="font-sans text-base sm:text-lg font-bold text-[#561291]">
                  <CmsText
                    slug={stepObj.slugTitle}
                    fallback={stepObj.fallbackTitle}
                  />
                </h4>
                <p className="text-base text-slate-600 leading-relaxed font-normal">
                  <CmsText
                    slug={stepObj.slugDesc}
                    fallback={stepObj.fallbackDesc}
                  />
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: INTERACTIVE 4-STEP APPLICATION FORM OR OPENING ANNOUNCEMENT */}
        <section
          id="apply-form"
          className="max-w-4xl mx-auto scroll-mt-24 space-y-4"
        >
          {isAdmin && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#561291] text-white shadow-md border border-[#7924c7]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3.5 h-3.5 rounded-full ${isFormManuallyOpen ? "bg-green-400 shadow-sm shadow-green-400/80 animate-pulse" : "bg-amber-400"}`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#D7B978]">
                      <SiteText fallback={"Admin Styring"} />
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/10 font-medium">
                      <SiteText
                        fallback={
                          isFormManuallyOpen
                            ? "Offentlig status: ÅPENT"
                            : "Offentlig status: LÅST (Planlagt 1. jan 2027)"
                        }
                      />
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
                    <SiteText
                      fallback={
                        isFormManuallyOpen
                          ? "Søknadsskjemaet er nå direkte tilgjengelig for alle besøkende på nettsiden."
                          : "Skjemaet er låst for publikum fram til 1. januar 2027. Du ser det fordi du er logget inn som administrator."
                      }
                    />
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <span className="text-xs font-bold text-white/90">
                  <SiteText
                    fallback={
                      isFormManuallyOpen ? "Skjema er ÅPENT" : "Skjema er LÅST"
                    }
                  />
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isFormManuallyOpen}
                  onClick={async () => {
                    const nextState = !isFormManuallyOpen;
                    await setAdmissionFormOpenState(nextState);
                    showToast(
                      nextState
                        ? "Søknadsskjemaet er nå ÅPENT for alle besøkende!"
                        : "Søknadsskjemaet er nå LÅST for vanlige besøkende.",
                    );
                  }}
                  className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#D7B978] ${
                    isFormManuallyOpen
                      ? "bg-green-500 justify-end"
                      : "bg-white/20 justify-start"
                  }`}
                  title={
                    isFormManuallyOpen
                      ? "Klikk for å stenge/låse skjemaet"
                      : "Klikk for å åpne skjemaet for alle"
                  }
                >
                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="bg-white w-6 h-6 rounded-full shadow-md flex items-center justify-center text-[#561291]"
                  >
                    {isFormManuallyOpen ? (
                      <Check size={14} className="text-green-600 stroke-[3]" />
                    ) : (
                      <Lock size={12} className="text-slate-500" />
                    )}
                  </motion.div>
                </button>
              </div>
            </div>
          )}

          {!isAdmissionOpen ? (
            /* LOCKED / COMING SOON VIEW (Before January 1, 2027) */
            <div className="bg-white border border-[#e2dce7]/70 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 shadow-lg text-center space-y-6 sm:space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#561291]/5 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#D7B978]/10 blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-3">
                <h3 className="font-sans text-2xl sm:text-4xl font-extrabold text-[#561291]">
                  <CmsText
                    slug="admission-locked-title"
                    fallback={
                      language === "en"
                        ? "Applications Open January 1, 2027"
                        : "Søknadsportalen åpner 1. januar 2027"
                    }
                  />
                </h3>

                <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
                  <CmsText
                    slug="admission-locked-desc"
                    fallback={
                      language === "en"
                        ? "The application period for the 2027/2028 academic year officially opens January 1, 2027 and remains open through June 30, 2027. Review our study lines and tuition plans above, and leave your details below to get a reminder when applications open."
                        : "Søkeperioden for studieåret 2027/2028 åpner offisielt 1. januar 2027 og varer frem til 30. juni 2027. Les om våre linjer og opplegg ovenfor, og meld deg på under for å få påminnelse så snart søknadsskjemaet åpner."
                    }
                  />
                </p>
              </div>

              {/* Timeline Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left relative z-10">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#561291] text-xs font-bold uppercase tracking-wider">
                    <Calendar size={14} />
                    <span>
                      <SiteText
                        fallback={
                          language === "en" ? "Opening" : "Søknad åpner"
                        }
                      />
                    </span>
                  </div>
                  <div className="font-bold text-slate-800 text-base">
                    <SiteText fallback={"1. januar 2027"} />
                  </div>
                  <p className="text-xs text-slate-500 font-normal">
                    <SiteText
                      fallback={
                        language === "en"
                          ? "Digital form available"
                          : "Digitalt skjema åpner"
                      }
                    />
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#561291] text-xs font-bold uppercase tracking-wider">
                    <Clock size={14} />
                    <span>
                      <SiteText
                        fallback={
                          language === "en" ? "Deadline" : "Søknadsfrist"
                        }
                      />
                    </span>
                  </div>
                  <div className="font-bold text-slate-800 text-base">
                    <SiteText fallback={"30. juni 2027"} />
                  </div>
                  <p className="text-xs text-slate-500 font-normal">
                    <SiteText
                      fallback={
                        language === "en"
                          ? "Continuous evaluation"
                          : "Fortløpende opptak"
                      }
                    />
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#561291]/5 border border-[#561291]/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#561291] text-xs font-bold uppercase tracking-wider">
                    <Sparkles size={14} className="text-[#D7B978]" />
                    <span>
                      <SiteText
                        fallback={
                          language === "en" ? "Kickoff" : "Kickoff i Norge"
                        }
                      />
                    </span>
                  </div>
                  <div className="font-bold text-[#561291] text-base">
                    <SiteText
                      fallback={
                        language === "en"
                          ? "August 20–22, 2027"
                          : "20.–22. august 2027"
                      }
                    />
                  </div>
                  <p className="text-xs text-slate-600 font-normal">
                    <SiteText
                      fallback={
                        language === "en"
                          ? "On-site weekend gathering"
                          : "Fysisk helgesamling"
                      }
                    />
                  </p>
                </div>
              </div>

              {/* Get Notified / Lead Capture Form */}
              <div className="max-w-lg mx-auto bg-gradient-to-br from-[#561291]/5 to-[#D7B978]/10 border border-[#561291]/15 rounded-2xl p-5 sm:p-8 space-y-4 relative z-10 text-center">
                <div className="space-y-1">
                  <div className="w-11 h-11 rounded-2xl bg-[#561291]/10 text-[#561291] flex items-center justify-center mx-auto mb-2 shadow-xs">
                    <Bell size={20} />
                  </div>
                  <h4 className="font-bold text-lg text-[#561291]">
                    <SiteText
                      fallback={
                        language === "en"
                          ? "Get Notified When Applications Open"
                          : "Få påminnelse når søknaden åpner"
                      }
                    />
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                    <SiteText
                      fallback={
                        language === "en"
                          ? "Leave your name and email to receive an instant reminder the moment the portal opens on January 1, 2027."
                          : "Legg igjen navn og e-post, så sender vi deg en påminnelse så snart søknadsskjemaet åpner 1. januar 2027."
                      }
                    />
                  </p>
                </div>

                {interestSubmitted ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm font-semibold flex items-center justify-center gap-2">
                    <CheckCircle2
                      size={18}
                      className="text-green-600 shrink-0"
                    />
                    <span>
                      <SiteText
                        fallback={
                          language === "en"
                            ? "Thank you! We will notify you on January 1, 2027."
                            : "Takk! Vi sender deg en påminnelse 1. januar 2027."
                        }
                      />
                    </span>
                  </div>
                ) : (
                  <form
                    onSubmit={handleInterestSubmit}
                    className="space-y-3 pt-1"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                      <input
                        type="text"
                        placeholder={
                          language === "en" ? "Your Name" : "Ditt navn"
                        }
                        value={interestName}
                        onChange={(e) => setInterestName(e.target.value)}
                        className="w-full min-h-[44px] px-4 py-2.5 bg-white border border-slate-200 focus:border-[#561291] rounded-xl text-base sm:text-sm focus:outline-none transition-colors"
                      />
                      <input
                        type="email"
                        required
                        placeholder={
                          language === "en" ? "Your Email *" : "Din e-post *"
                        }
                        value={interestEmail}
                        onChange={(e) => setInterestEmail(e.target.value)}
                        className="w-full min-h-[44px] px-4 py-2.5 bg-white border border-slate-200 focus:border-[#561291] rounded-xl text-base sm:text-sm focus:outline-none transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingInterest}
                      className="w-full min-h-[44px] py-3 bg-[#561291] hover:bg-[#430d72] text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Bell size={16} />
                      <span>
                        <SiteText
                          fallback={
                            isSubmittingInterest
                              ? language === "en"
                                ? "Saving..."
                                : "Lagrer..."
                              : language === "en"
                                ? "Notify Me"
                                : "Send meg påminnelse"
                          }
                        />
                      </span>
                    </button>
                  </form>
                )}
              </div>

              {/* Discreet Admin Preview Link */}
              <div className="pt-2 relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set("preview", "true");
                    window.location.href = url.toString();
                  }}
                  className="text-xs text-slate-400 hover:text-[#561291] underline decoration-slate-300 transition-colors"
                >
                  <SiteText
                    fallback={
                      language === "en"
                        ? "Admin / Developer: Preview & test application form"
                        : "Admin / Utvikler: Forhåndsvis og test søknadsskjema"
                    }
                  />
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE APPLICATION WIZARD (Opens Jan 1, 2027 or in ?preview=true mode) */
            <div className="bg-white border border-[#e2dce7]/70 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 shadow-lg">
              {isPreviewMode && !isAdmin && (
                <div className="mb-6 p-3 px-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">
                      <SiteText
                        fallback={
                          "⚠️ Forhåndsvisningsmodus aktiv (?preview=true):"
                        }
                      />
                    </span>
                    <span>
                      <SiteText
                        fallback={
                          "Søknadsskjemaet er synlig for deg, men åpner offisielt for publikum 1. januar 2027."
                        }
                      />
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.delete("preview");
                      window.location.href = url.toString();
                    }}
                    className="font-bold underline text-amber-800 hover:text-amber-950"
                  >
                    <SiteText fallback={"Avslutt forhåndsvisning"} />
                  </button>
                </div>
              )}
              <AnimatePresence mode="wait">
                {paymentStep === "form" ? (
                  <div key="form-container" className="space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-[#561291]/10 text-[#561291] flex items-center justify-center mx-auto shadow-sm">
                        <FileText size={26} />
                      </div>
                      <CmsText
                        slug="admission-form-title"
                        fallback={
                          language === "en"
                            ? "Application for Admission – HKPC"
                            : "Søknad om opptak – His Kingdom Prophetic Community"
                        }
                        as="h3"
                        className="font-sans text-2xl sm:text-3xl font-bold text-[#561291]"
                      />
                      <CmsText
                        slug="admission-form-subtitle"
                        fallback={
                          language === "en"
                            ? "Please complete all fields carefully. Applications are reviewed continuously by the leadership."
                            : "Vennligst fyll ut feltene nedenfor. Alle søknader behandles konfidensielt og fortløpende av skolens ledelse."
                        }
                        as="p"
                        className="text-base text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto"
                      />
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#561291]/5 text-[#561291] font-semibold text-xs sm:text-sm tracking-wide border border-[#561291]/15">
                          <GraduationCap size={15} className="text-[#561291]" />
                          <SiteText
                            fallback={
                              language === "en"
                                ? "No account required to apply – Login credentials are issued upon approved admission"
                                : "Ingen forhåndskonto kreves – Brukerkonto tildeles av administrasjonen etter godkjent opptak"
                            }
                          />
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar & Step Indicators */}
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
                        <span>
                          {language === "en"
                            ? `Step ${currentStep} of 4`
                            : `Steg ${currentStep} av 4`}
                        </span>
                        <span className="text-[#561291]">
                          {currentStep === 1 &&
                            (language === "en"
                              ? "Personal Details"
                              : "Personalia & Kontakt")}
                          {currentStep === 2 &&
                            (language === "en"
                              ? "Study Line & Payment"
                              : "Studielinje & Betaling")}
                          {currentStep === 3 &&
                            (language === "en"
                              ? "Spiritual Background"
                              : "Åndelig Bakgrunn & Kall")}
                          {currentStep === 4 &&
                            (language === "en"
                              ? "Reference & Submit"
                              : "Referanse & Fullfør")}
                        </span>
                      </div>

                      {/* Visual Progress Bar */}
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#561291] to-[#D7B978] transition-all duration-300 ease-out rounded-full"
                          style={{ width: `${(currentStep / 4) * 100}%` }}
                        />
                      </div>

                      {/* Step Pills Navigation */}
                      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 pt-2">
                        {[
                          {
                            step: 1,
                            title:
                              language === "en"
                                ? "1. Details"
                                : "1. Personalia",
                            short: "1. Info",
                          },
                          {
                            step: 2,
                            title:
                              language === "en"
                                ? "2. Program"
                                : "2. Studielinje",
                            short: "2. Linje",
                          },
                          {
                            step: 3,
                            title:
                              language === "en"
                                ? "3. Background"
                                : "3. Bakgrunn",
                            short: "3. Tro",
                          },
                          {
                            step: 4,
                            title:
                              language === "en"
                                ? "4. Reference"
                                : "4. Referanse",
                            short: "4. Svar",
                          },
                        ].map((item) => (
                          <button
                            key={item.step}
                            type="button"
                            onClick={() => {
                              if (adminPreview || item.step < currentStep) {
                                setCurrentStep(item.step);
                              } else if (item.step === 2 && validateStep1()) {
                                setCurrentStep(2);
                              } else if (
                                item.step === 3 &&
                                validateStep1() &&
                                validateStep2()
                              ) {
                                setCurrentStep(3);
                              } else if (
                                item.step === 4 &&
                                validateStep1() &&
                                validateStep2() &&
                                validateStep3()
                              ) {
                                setCurrentStep(4);
                              }
                            }}
                            className={`min-h-[44px] py-2 px-1 text-center text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center ${
                              currentStep === item.step
                                ? "bg-[#561291] text-white shadow-sm"
                                : currentStep > item.step
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : "bg-slate-50 text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            <span className="hidden sm:inline">
                              <SiteText fallback={item.title} />
                            </span>
                            <span className="sm:hidden">{item.short}</span>
                          </button>
                        ))}
                      </div>

                      {/* Draft Auto-Saved Indicator & Reset Option */}
                      {hasDraft && (
                        <div className="flex flex-wrap items-center justify-between gap-2 p-3 px-4 bg-emerald-50/90 border border-emerald-200/80 rounded-2xl text-xs text-emerald-900 shadow-xs">
                          <div className="flex items-center gap-2 font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>
                              <SiteText
                                fallback={
                                  language === "en"
                                    ? "Draft auto-saved on this device"
                                    : "Søknaden lagres automatisk på denne enheten"
                                }
                              />
                            </span>
                            {draftSavedAt && (
                              <span className="text-emerald-700/70 hidden sm:inline">
                                •{" "}
                                <SiteText
                                  fallback={
                                    language === "en"
                                      ? "Last saved"
                                      : "Sist lagret"
                                  }
                                />{" "}
                                {draftSavedAt.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={clearDraft}
                            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-red-600 font-semibold transition-colors underline decoration-slate-300 underline-offset-2 hover:decoration-red-400"
                          >
                            <RotateCcw size={13} />
                            <span>
                              <SiteText
                                fallback={
                                  language === "en"
                                    ? "Clear & start over"
                                    : "Nullstill skjema"
                                }
                              />
                            </span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* FORM CONTENT PER STEP */}
                    {isAdmin && (
                      <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-purple-900">
                          {adminPreview
                            ? language === "en"
                              ? "Admin preview: browse all steps without filling in or submitting an application."
                              : "Forhåndsvisning: Bla gjennom alle steg uten å fylle ut eller sende inn en søknad."
                            : language === "en"
                              ? "You are filling in a real application."
                              : "Du fyller nå ut en reell søknad."}
                        </p>
                        <button
                          type="button"
                          className="min-h-11 text-sm font-semibold text-purple-900 underline"
                          onClick={() => {
                            setFillRealApplication((value) => !value);
                          }}
                        >
                          {adminPreview
                            ? language === "en"
                              ? "Fill in a real application"
                              : "Fyll ut en reell søknad"
                            : language === "en"
                              ? "Back to preview"
                              : "Tilbake til forhåndsvisning"}
                        </button>
                      </div>
                    )}
                    <AdmissionForm
                      {...{
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
                      }}
                    />
                  </div>
                ) : (
                  /* SUCCESS CONFIRMATION SCREEN */
                  <motion.div
                    key="success"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-8 space-y-6"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 border border-green-200 flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 size={36} className="text-green-600" />
                    </div>

                    <div className="space-y-2">
                      <span className="inline-block px-3.5 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider border border-green-200">
                        <SiteText
                          fallback={
                            language === "en"
                              ? "Application Received"
                              : "Søknad registrert"
                          }
                        />
                      </span>
                      <CmsText
                        slug="admission-success-title"
                        fallback={
                          language === "en"
                            ? "Application Successfully Submitted!"
                            : "Søknad om opptak er mottatt!"
                        }
                        as="h3"
                        className="font-sans text-2xl sm:text-3xl font-bold text-[#561291]"
                      />
                      <p className="text-base text-slate-700 font-normal max-w-md mx-auto leading-relaxed">
                        {language === "en"
                          ? `Thank you, ${formData.name}! Your application has been submitted directly to the leadership at His Kingdom Prophetic Community.`
                          : `Takk for din søknad, ${formData.name}! Søknaden din er nå oversendt til ledelsen ved His Kingdom Prophetic Community.`}
                      </p>
                    </div>

                    {/* Information Card about Next Steps and Account Assignment */}
                    <div className="bg-[#fbf8fe] border border-[#e2dce7]/70 rounded-2xl p-6 text-left max-w-lg mx-auto space-y-3.5">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-[#561291]/10 text-[#561291] shrink-0 mt-0.5">
                          <GraduationCap size={22} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-base font-bold text-[#561291]">
                            <SiteText
                              fallback={
                                language === "en"
                                  ? "Next Steps: Review & Account Assignment"
                                  : "Veien videre: opptaksbehandling & tildeling av konto"
                              }
                            />
                          </h4>
                          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                            <SiteText
                              fallback={
                                language === "en"
                                  ? "We review all applications continuously and will contact you for a brief conversation. Upon approved admission, your personal user account and portal login credentials will be issued directly by the school administration."
                                  : "Vi behandler søknader fortløpende og kontakter deg for en kort samtale. Når opptaket er godkjent, vil din personlige brukerkonto og innloggingsdetaljer til portalen bli opprettet og tildelt direkte av skolens administrasjon."
                              }
                            />
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-[#e2dce7]/40 pt-3.5 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-slate-500 text-xs uppercase font-bold block">
                            <SiteText
                              fallback={
                                language === "en" ? "Program" : "Studielinje"
                              }
                            />
                          </span>
                          <span className="font-bold text-[#561291]">
                            {
                              programs.find((p) => p.id === formData.program)
                                ?.code
                            }
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-xs uppercase font-bold block">
                            <SiteText
                              fallback={
                                language === "en" ? "Kickoff" : "Kickoff"
                              }
                            />
                          </span>
                          <span className="font-bold text-[#561291]">
                            <SiteText
                              fallback={
                                language === "en"
                                  ? "Aug 20–22, 2027 (Norway)"
                                  : "20.–22. aug 2027 (Norge)"
                              }
                            />
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                      <button
                        onClick={() => navigate("/")}
                        className="px-6 py-3.5 bg-[#D7B978] hover:bg-[#c4a565] text-[#561291] font-bold text-base uppercase tracking-wider rounded-xl transition-all duration-200 shadow-sm active:scale-95"
                      >
                        <CmsText
                          slug="admission-success-home-btn"
                          fallback={
                            language === "en"
                              ? "Back to Home"
                              : "Gå til forsiden"
                          }
                        />
                      </button>
                      <button
                        onClick={() => navigate("/support")}
                        className="px-6 py-3.5 bg-slate-50 hover:bg-slate-100 text-[#561291] text-base font-bold uppercase tracking-wider rounded-xl transition-all duration-200 active:scale-95 border border-slate-200 font-sans"
                      >
                        <CmsText
                          slug="admission-success-contact-btn"
                          fallback={
                            language === "en"
                              ? "Contact Administration"
                              : "Kontakt administrasjonen"
                          }
                        />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
