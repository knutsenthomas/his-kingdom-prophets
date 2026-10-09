import SiteText from '@/components/SiteText';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, BookOpen, CreditCard, ChevronRight, Check, 
  HelpCircle, ArrowLeft, ArrowRight, Send, Calendar, FileText, CheckCircle2, Globe, Lock, GraduationCap,
  User, Mail, Phone, MapPin, Heart, Church, Save, RotateCcw, Clock, Bell, AlertTriangle
} from 'lucide-react';
import CmsText from '@/components/CmsText';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import SeoHead from '@/components/SeoHead';
import { escapeHtml, escapeHtmlWithLineBreaks, sanitizeEmail, sanitizeEmailSubject } from '@/utils/security';

const DRAFT_KEY = 'hkpc_application_draft_v1';
const DRAFT_STEP_KEY = 'hkpc_application_draft_step';

// Admission period officially opens January 1, 2027 00:00:00
const ADMISSION_OPEN_DATE = new Date('2027-01-01T00:00:00');

// Helper to calculate applicant age in whole years without timezone shift
const calculateAge = (birthDateString) => {
  if (!birthDateString) return 0;
  const parts = birthDateString.split('-');
  if (parts.length !== 3) return 0;
  const birthYear = parseInt(parts[0], 10);
  const birthMonth = parseInt(parts[1], 10) - 1;
  const birthDay = parseInt(parts[2], 10);
  if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) return 0;

  const today = new Date();
  let age = today.getFullYear() - birthYear;
  const monthDiff = today.getMonth() - birthMonth;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDay)) {
    age--;
  }
  return age;
};

// Returns YYYY-MM-DD for exactly 18 years ago from today
const getEighteenYearsAgoDateString = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function AdmissionPage() {
  const navigate = useNavigate();
  const { language, toggleLanguage, showToast, user, admissionFormOpen, setAdmissionFormOpenState } = useApp();

  const stripePublicKey = "pk_live_51Pab8rAL393JGrO9bTUitYflDKlHGpLiqZCCBp0dCzBEV3ZFxARFfK6MgWraehq7i79tJHPIEzlpMwPiT2K3HsiZ00gJ1TQ71Y";

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isPreviewMode = new URLSearchParams(window.location.search).get('preview') === 'true';
  const isFormManuallyOpen = Boolean(admissionFormOpen);

  // Check if admission is open (automatically unlocks on Jan 1, 2027, or when toggled open by admin, or with ?preview=true / admin)
  const isAdmissionOpen = isFormManuallyOpen || (new Date() >= ADMISSION_OPEN_DATE) || isPreviewMode || isAdmin;

  // Interest List / Reminder State (for visitors before Jan 1, 2027)
  const [interestEmail, setInterestEmail] = useState('');
  const [interestName, setInterestName] = useState('');
  const [interestSubmitted, setInterestSubmitted] = useState(false);
  const [isSubmittingInterest, setIsSubmittingInterest] = useState(false);

  const handleInterestSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!interestEmail.trim() || !interestEmail.includes('@')) {
      showToast(language === 'en' ? "Please enter a valid email address." : "Vennligst oppgi en gyldig e-postadresse.", "error");
      return;
    }

    setIsSubmittingInterest(true);
    try {
      const { db } = await import('@/firebase');
      const { collection, addDoc, serverTimestamp, doc, setDoc } = await import('firebase/firestore');

      await addDoc(collection(db, "admission_leads"), {
        name: interestName.trim(),
        email: interestEmail.trim(),
        createdAt: serverTimestamp(),
        source: 'admission_portal_reminder_2027'
      });

      try {
        const emailRef = doc(collection(db, "support_emails"));
        await setDoc(emailRef, {
          to: 'school@hiskingdomministry.no',
          replyTo: sanitizeEmail(interestEmail) || 'school@hiskingdomministry.no',
          message: {
            subject: `[HKPC Opptak 2027] Ny interessert student: ${sanitizeEmailSubject(interestName.trim() || interestEmail.trim())}`,
            text: `En potensiell søker har registrert seg for påminnelse når søknadsportalen åpner 1. januar 2027:\n\nNavn: ${interestName.trim() || 'Ikke oppgitt'}\nE-post: ${interestEmail.trim()}`
          }
        });
      } catch (mailErr) {}

      setInterestSubmitted(true);
      showToast(language === 'en' ? "Thank you! We will notify you when applications open." : "Takk! Vi sender deg varsel så snart søknaden åpner 1. januar 2027.");
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
    name: '',
    gender: '', // 'Mann', 'Kvinne'
    birthDate: '',
    email: '',
    phone: '',
    address: '',
    maritalStatus: '', // 'Gift', 'Ugift', 'Forlovet', 'Separert / skilt', 'Enke / enkemann'
    occupation: '',

    // Del 2: Studielinje & praktiske rammer
    program: 'prophetic_community',
    paymentPlan: 'monthly', // 'monthly', 'biannual', 'full'
    languageAgreement: false,
    confirmYear1: false,

    // Del 3: Åndelig bakgrunn, vandring & motivasjon
    whySeeking: '',
    expectations: '',
    howHeard: '',
    testimony: '',
    churchCommunity: '',
    currentMinistry: '',
    ministryCalling: '',
    dreamsVision: '',
    hobbies: '',

    // Del 4: Referanse & tilleggsopplysninger
    reference: '',
    additionalNotes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePlan, setActivePlan] = useState('full'); // 'full', 'biannual', 'monthly'
  
  const [stripeElements, setStripeElements] = useState(null);
  const [stripeInstance, setStripeInstance] = useState(null);
  const [paymentStep, setPaymentStep] = useState('form'); // 'form', 'payment', 'success'
  const [clientSecret, setClientSecret] = useState('');
  const [paymentError, setPaymentError] = useState('');

  // 1. Auto-restore draft from localStorage on initial load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
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
    const confirmMsg = language === 'en' 
      ? "Are you sure you want to clear your saved draft and start over?" 
      : "Er du sikker på at du vil slette den lagrede kladden og starte på nytt?";
    if (window.confirm(confirmMsg)) {
      try {
        localStorage.removeItem(DRAFT_KEY);
        localStorage.removeItem(DRAFT_STEP_KEY);
      } catch (e) {}
      setFormData({
        name: user?.name || '',
        gender: '',
        birthDate: '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: '',
        maritalStatus: '',
        occupation: '',
        program: 'prophetic_community',
        paymentPlan: 'monthly',
        languageAgreement: false,
        confirmYear1: false,
        whySeeking: '',
        expectations: '',
        howHeard: '',
        testimony: '',
        churchCommunity: '',
        currentMinistry: '',
        ministryCalling: '',
        dreamsVision: '',
        hobbies: '',
        reference: '',
        additionalNotes: ''
      });
      setCurrentStep(1);
      setHasDraft(false);
      setDraftSavedAt(null);
      showToast(language === 'en' ? "Draft cleared." : "Kladden er slettet.");
    }
  };

  // Prepopulate form if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  // Handle URL redirect query parameters (post-payment verification)
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const paymentIntentSecret = query.get('payment_intent_client_secret') || query.get('subscription_client_secret');
    const redirectStatus = query.get('redirect_status');

    if (paymentIntentSecret && redirectStatus === 'succeeded' && user) {
      const updateUserRole = async () => {
        setIsSubmitting(true);
        try {
          const { db } = await import('@/firebase');
          const { doc, setDoc } = await import('firebase/firestore');
          await setDoc(doc(db, "users", user.uid), { role: 'student' }, { merge: true });
          
          localStorage.setItem('hkm-current-user', JSON.stringify({
            ...user,
            role: 'student'
          }));

          setPaymentStep('success');
          showToast(language === 'en' ? "Payment successful! You are now enrolled as a student." : "Betaling fullført! Du er nå registrert som student.");
        } catch (err) {
          console.error("Failed to update user role to student:", err);
          showToast("Kunne ikke oppdatere studentrolle. Kontakt support.", "error");
        } finally {
          setIsSubmitting(false);
        }
      };
      updateUserRole();
    }
  }, [user, language, showToast]);

  const updateFieldValue = (field, val) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: val };
      saveDraft(updated, currentStep);
      return updated;
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFieldValue(name, type === 'checkbox' ? checked : value);
  };

  // Step Validation Helpers
  const validateStep1 = () => {
    if (!formData.name.trim()) {
      showToast(language === 'en' ? "Please enter your full name." : "Vennligst fyll inn fullt navn.", "error");
      return false;
    }
    if (!formData.gender) {
      showToast(language === 'en' ? "Please select gender." : "Vennligst velg kjønn.", "error");
      return false;
    }
    if (!formData.birthDate) {
      showToast(language === 'en' ? "Please enter birth date." : "Vennligst fyll inn fødselsdato.", "error");
      return false;
    }
    if (calculateAge(formData.birthDate) < 18) {
      showToast(
        language === 'en' 
          ? "You must be at least 18 years old to apply as a student." 
          : "Du må være minst 18 år for å søke elevplass ved skolen.", 
        "error"
      );
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      showToast(language === 'en' ? "Please enter a valid email address." : "Vennligst fyll inn en gyldig e-postadresse.", "error");
      return false;
    }
    if (!formData.phone.trim()) {
      showToast(language === 'en' ? "Please enter phone number." : "Vennligst fyll inn telefonnummer.", "error");
      return false;
    }
    if (!formData.address.trim()) {
      showToast(language === 'en' ? "Please enter residential address." : "Vennligst fyll inn bostedsadresse.", "error");
      return false;
    }
    if (!formData.maritalStatus) {
      showToast(language === 'en' ? "Please select marital status." : "Vennligst velg sivilstatus.", "error");
      return false;
    }
    if (!formData.occupation.trim()) {
      showToast(language === 'en' ? "Please enter your occupation / education." : "Vennligst fyll inn yrke / utdannelse.", "error");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.languageAgreement) {
      showToast(language === 'en' 
        ? "Please confirm that you accept instruction in English and the kickoff in Norway." 
        : "Vennligst bekreft at du godtar undervisningsspråk (engelsk) og kickoff-samlingen i Norge.", "error");
      return false;
    }
    if (formData.program === 'prophets_advanced' && !formData.confirmYear1) {
      showToast(language === 'en' 
        ? "Please confirm that you plan to complete or have completed Track 1 first." 
        : "Vennligst bekreft at du har fullført eller planlegger å fullføre 1. år (Track 1) først.", "error");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.whySeeking.trim()) {
      showToast(language === 'en' ? "Please explain why you are applying to Bible school." : "Vennligst svar på hvorfor du søker bibelskole.", "error");
      return false;
    }
    if (!formData.expectations.trim()) {
      showToast(language === 'en' ? "Please share what you expect from the school year." : "Vennligst svar på hva du forventer deg av skoleåret.", "error");
      return false;
    }
    if (!formData.howHeard.trim()) {
      showToast(language === 'en' ? "Please share how you heard about HKPC." : "Vennligst svar på hvordan du hørte om HKPC.", "error");
      return false;
    }
    if (!formData.testimony.trim()) {
      showToast(language === 'en' ? "Please share a bit about your experience with Jesus." : "Vennligst skriv litt om din erfaring med Jesus.", "error");
      return false;
    }
    if (!formData.churchCommunity.trim()) {
      showToast(language === 'en' ? "Please specify your church community." : "Vennligst oppgi menighetstilhørighet.", "error");
      return false;
    }
    if (!formData.currentMinistry.trim()) {
      showToast(language === 'en' ? "Please answer if you are in any ministry or volunteer work." : "Vennligst skriv litt om nåværende tjeneste eller frivillig arbeid.", "error");
      return false;
    }
    if (!formData.ministryCalling.trim()) {
      showToast(language === 'en' ? "Please describe the ministry/gift you feel called to grow in." : "Vennligst beskriv hvilken tjeneste/gave du ønsker å vokse i.", "error");
      return false;
    }
    if (!formData.dreamsVision.trim()) {
      showToast(language === 'en' ? "Please share your dreams and visions." : "Vennligst skriv litt om dine drømmer og visjoner.", "error");
      return false;
    }
    if (!formData.hobbies.trim()) {
      showToast(language === 'en' ? "Please share your hobbies and interests." : "Vennligst skriv litt om dine hobbyer og interesser.", "error");
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (!formData.reference.trim()) {
      showToast(language === 'en' ? "Please provide a reference (name, phone, email)." : "Vennligst oppgi en referanse (navn, telefon og e-post).", "error");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    
    const nextStep = Math.min(currentStep + 1, 4);
    setCurrentStep(nextStep);
    saveDraft(formData, nextStep);
    const element = document.getElementById('apply-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrevStep = () => {
    const prevStep = Math.max(currentStep - 1, 1);
    setCurrentStep(prevStep);
    saveDraft(formData, prevStep);
    const element = document.getElementById('apply-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleFormSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!isAdmissionOpen) {
      showToast(language === 'en' ? "The application portal opens January 1, 2027." : "Søknadsportalen åpner offisielt 1. januar 2027.", "error");
      return;
    }
    if (!validateStep1() || !validateStep2() || !validateStep3() || !validateStep4()) return;

    setIsSubmitting(true);
    setPaymentError('');

    try {
      const { db } = await import('@/firebase');
      const { collection, addDoc, serverTimestamp, doc, setDoc } = await import('firebase/firestore');

      const prog = programs.find(p => p.id === formData.program) || programs[0];

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
        additionalNotes: formData.additionalNotes ? formData.additionalNotes.trim() : '',
        status: "pending_review",
        submittedAt: new Date().toISOString(),
        createdAt: serverTimestamp()
      };

      // 1. Lagre søknad i Firestore 'applications' for administrasjonens opptaksbehandling
      const docRef = await addDoc(collection(db, "applications"), applicationPayload);

      // 2. Send e-postvarsel til administrasjonen via 'support_emails'
      try {
        const safeName = escapeHtml(formData.name.trim());
        const rawEmail = sanitizeEmail(formData.email);
        const safeEmail = escapeHtml(rawEmail);
        const safePhone = escapeHtml(formData.phone.trim());
        const safeBirthDate = escapeHtml(formData.birthDate || '-');
        const safeGender = escapeHtml(formData.gender || '-');
        const safeMaritalStatus = escapeHtml(formData.maritalStatus || '-');
        const safeAddress = escapeHtml(formData.address.trim() || '-');
        const safeOccupation = escapeHtml(formData.occupation.trim() || '-');
        const safeProgTitle = escapeHtml(prog.title);
        const safeProgCode = escapeHtml(prog.code);
        const safePaymentPlan = formData.paymentPlan === 'monthly'
          ? 'Månedlig delbetaling (1 000,- / $100 USD per mnd i 10 mnd)'
          : (formData.paymentPlan === 'biannual' || formData.paymentPlan === 'semester')
          ? 'Halvårlig betaling (5 000,- / $500 USD to ganger i året)'
          : 'Hele prisen på en gang (10 000,- / $1,000 USD fullt studieår)';
        const safeChurchCommunity = escapeHtml(formData.churchCommunity.trim() || '-');
        const safeCurrentMinistry = escapeHtml(formData.currentMinistry.trim() || '-');
        const safeMinistryCalling = escapeHtml(formData.ministryCalling.trim() || '-');
        const safeReference = escapeHtml(formData.reference.trim() || '-');
        const safeTestimony = escapeHtmlWithLineBreaks(formData.testimony.trim() || '');
        const safeWhySeeking = escapeHtmlWithLineBreaks(formData.whySeeking.trim() || '');
        const quoteText = safeTestimony || safeWhySeeking;
        const safeDocId = escapeHtml(docRef.id);

        const emailPlanText = formData.paymentPlan === 'monthly'
          ? 'Månedlig (1 000,- per mnd)'
          : (formData.paymentPlan === 'biannual' || formData.paymentPlan === 'semester')
          ? 'Halvårlig (5 000,- x 2)'
          : 'Hele prisen på en gang (10 000,-)';

        const emailRef = doc(collection(db, "support_emails"));
        await setDoc(emailRef, {
          to: 'school@hiskingdomministry.no',
          replyTo: rawEmail || 'school@hiskingdomministry.no',
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

                                  ${quoteText ? `
                                  <div style="margin-top: 14px; padding: 12px 16px; background-color: #FFFFFF; border-left: 3px solid #561291; border-radius: 0 10px 10px 0; font-size: 13px; line-height: 20px; color: #464554; font-style: italic; word-break: break-word;">
                                    &ldquo;${quoteText}&rdquo;
                                  </div>` : ''}
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
            `
          }
        });
      } catch (emailErr) {
        console.warn("Kunne ikke sende e-postvarsel, men søknaden er lagret i Firestore:", emailErr);
      }

      // 3. Webhook til Google Sheets (miljøvariabel med fallback til aktiv implementering)
      const sheetsWebhook = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbydGBIQJZY76iGUA623g4qkoTyihKauzcLPCHZ8u8zWqxyO1hUkxKtb3UJBSkbgEEY51A/exec';
      if (sheetsWebhook) {
        try {
          await fetch(sheetsWebhook, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: docRef.id,
              ...applicationPayload,
              createdAt: new Date().toISOString()
            })
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

      setPaymentStep('success');
      showToast(language === 'en' ? "Application submitted successfully!" : "Søknaden er sendt inn! Vi tar kontakt for en samtale.");
    } catch (err) {
      console.error("Submission failed:", err);
      showToast(language === 'en' ? "Failed to submit application: " + err.message : "Kunne ikke sende søknad: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const programs = [
    {
      id: "prophetic_community",
      code: language === 'en' ? "Year 1" : "1. år",
      title: "His Kingdom Prophetic Community",
      duration: language === 'en' ? "1 Year • English • On-site Kickoff Aug 20–22" : "1 År • Engelsk • Kickoff i Norge 20.–22. aug",
      priceYear: language === 'en' ? "$1,000 USD" : "10 000,-",
      priceMonthly: language === 'en' ? "$100 USD / mo" : "1 000,- / mnd",
      priceBiannual: language === 'en' ? "$500 USD x 2" : "5 000,- x 2",
      isLocked: false,
      features: language === 'en' ? [
        "Age requirement: Minimum 18 years old",
        "All instruction & teaching conducted in English",
        "On-site kickoff gathering in Norway August 20–22, 2027",
        "Tuition: $1,000 USD full year (monthly, semi-annually, or in full)",
        "Admin startup fee: $50 USD",
        "Kickoff room & board: $50 USD (own hotel not covered)",
        "Grow in relationship with Jesus & gifts of the Spirit",
        "Prophecy 101, How to Hear God, Gift vs Office",
        "Join year after year (different subjects yearly)"
      ] : [
        "Opptakskrav: Du må være fylt 18 år",
        "All undervisning og veiledning foregår på engelsk",
        "On-site kickoff-samling i Norge 20.–22. august 2027",
        "Studieavgift: 10 000,- (betal mnd, halvår eller hele prisen samlet)",
        "Admin oppstartsgebyr: 500,-",
        "Kost og losji for kickoff-helgen: 500,- (egenvalgt hotell dekkes ikke)",
        "Vokse i relasjon med Jesus og Åndens gaver",
        "Profeti 101, Å høre Guds stemme, Gave vs Tjeneste",
        "Kan tas år etter år med nye temaer hvert år"
      ]
    },
    {
      id: "prophets_advanced",
      code: language === 'en' ? "Year 2" : "2. år",
      title: "His Kingdom Prophets (oppstart 2028)",
      duration: language === 'en' ? "Starts in 2028 (Requires Year 1)" : "Starter i 2028 (Krever 1. År)",
      priceYear: language === 'en' ? "$1,000 USD" : "10 000,-",
      priceMonthly: language === 'en' ? "$100 USD / mo" : "1 000,- / mnd",
      priceBiannual: language === 'en' ? "$500 USD x 2" : "5 000,- x 2",
      isLocked: true,
      features: language === 'en' ? [
        "Specifically for those called to the office of a prophet (Launches 2028)",
        "Tuition: $1,000 USD full year (monthly, semi-annually, or in full)",
        "Requires separate reapplication & prayer evaluation",
        "Reading list, paper writing & physical SUPER CHARGE",
        "PREREQUISITE: Must complete Year 1 first"
      ] : [
        "Spesifikt for de kalt til embetet som profet (oppstart 2028)",
        "Studieavgift: 10 000,- (betal mnd, halvår eller hele prisen samlet)",
        "Krever ny søknad, pensumliste og skriftlig oppgave",
        "Krav om deltakelse på 1-2 ukers fysisk samling",
        "FORKUNNSKAP: Må ha fullført 1. år først"
      ]
    }
  ];

  const selectedProg = programs.find(p => p.id === formData.program) || programs[0];

  return (
    <div className="bg-[#F6F4F8] text-[#271f30] font-sans min-h-screen">
      <SeoHead
        title={language === 'en' ? "Admissions & Tuition 2027 | His Kingdom Prophetic Community" : "Opptak & Priser 2027 | His Kingdom Prophetic Community"}
        description={language === 'en' 
          ? "Apply for His Kingdom Prophetic Community 2027. Application period Jan 1 – June 30. Tuition $1,000 USD (10,000 NOK). On-site kickoff in Norway August 20–22, 2027."
          : "Søk opptak ved His Kingdom Prophetic Community for skoleåret 2027. Søkeperiode 1. jan – 30. juni. Studieavgift 10 000 NOK. Kickoff i Norge 20.–22. august 2027."}
        canonicalPath="/admission"
        keywords="HKPC opptak, bibelskole opptak, søknad bibelskole, profetisk utrustning, studieavgift, priser bibelskole 2027, His Kingdom Ministry"
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Course",
              "@id": "https://hkpc.no/#course-year1",
              "name": "His Kingdom Prophetic Community - 1. Studieår (Track 1)",
              "courseCode": "HKPC-Y1",
              "description": "1-årig nettbasert studie for bibelsk fundament, personlig relasjon til Jesus og praktisk utrustning i Åndens profetiske gaver. Inkluderer kickoff i Norge 20.–22. august 2027.",
              "provider": {
                "@type": "EducationalOrganization",
                "name": "His Kingdom Prophetic Community",
                "url": "https://hkpc.no"
              },
              "educationalLevel": "Bibelskole & Disippeltrening",
              "educationalCredentialAwarded": "Kursbevis i Profetisk Utrustning",
              "coursePrerequisites": "Minst 18 år ved studiestart. Søknadsskjema.",
              "offers": {
                "@type": "Offer",
                "price": "10000",
                "priceCurrency": "NOK",
                "category": "Tuition",
                "availability": "https://schema.org/InStock",
                "validFrom": "2027-01-01",
                "url": "https://hkpc.no/admission"
              }
            },
            {
              "@type": "BreadcrumbList",
              "@id": "https://hkpc.no/admission#breadcrumb",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Hjem",
                  "item": "https://hkpc.no/"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Opptak & Priser",
                  "item": "https://hkpc.no/admission"
                }
              ]
            }
          ]
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
            fallback={language === 'en' ? "Be Equipped for Your God-Given Ministry" : "Bli utrustet til din gudgitte tjeneste"} 
            as="h1"
            className="font-sans text-3xl sm:text-5xl font-extrabold leading-snug sm:leading-[1.25] tracking-normal max-w-3xl mx-auto text-white"
          />

          <CmsText 
            slug="admission-hero-subtitle" 
            fallback={language === 'en' ? "Application period: January 1 – June 30, 2027. On-site kickoff in Norway August 20–22, 2027. All teaching is conducted in English." : "Søkeperioden er fra 1. januar til 30. juni 2027, med on-site kickoff i Norge 20.–22. august 2027. All undervisning foregår på engelsk."} 
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
                  <CmsText slug="admission-hero-cta" fallback={language === 'en' ? "Fill Out Application Form" : "Gå til søknadsskjema"} />
                ) : (
                  <CmsText slug="admission-hero-cta-closed" fallback={language === 'en' ? "Applications Open Jan 1, 2027" : "Søknaden åpner 1. jan 2027"} />
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
              fallback={language === 'en' ? "Our Study Lines and Courses" : "Våre studielinjer og fag"} 
              as="h2"
              className="font-sans text-2xl sm:text-3xl font-bold text-[#561291]"
            />
            <CmsText 
              slug="admission-programs-subtitle" 
              fallback={language === 'en' ? "Each course consists of 8 step-by-step modules integrating thorough theology with personal mentoring." : "Hvert fag består av 8 trinnvise moduler som integrerer grundig teologi med personlig mentorskap."} 
              as="p"
              className="text-base text-slate-600 font-medium leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {programs.map(prog => (
              <div 
                key={prog.id}
                className={`bg-white border rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                  prog.isLocked 
                    ? 'border-amber-200 hover:border-amber-300' 
                    : 'border-[#e2dce7]/70 hover:border-[#561291]/30'
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
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                      prog.isLocked 
                        ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                        : 'bg-[#561291]/10 text-[#561291] border border-[#561291]/15'
                    }`}>
                      <CmsText slug={`admission-${prog.id}-code`} fallback={prog.code} />
                    </span>
                  </div>

                  <h3 className="font-sans text-xl sm:text-2xl font-bold text-[#561291] leading-snug">
                    <CmsText slug={`admission-${prog.id}-title`} fallback={prog.title} />
                  </h3>

                  <div className="flex items-center gap-2 text-sm sm:text-base text-slate-600 font-medium">
                    <Calendar size={16} className="text-[#561291]/70 shrink-0" />
                    <span><CmsText slug={`admission-${prog.id}-duration`} fallback={prog.duration} /></span>
                  </div>

                  <div className="w-full h-[1px] bg-slate-100 my-4" />

                  <ul className="space-y-3">
                    {prog.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-base text-slate-700 leading-relaxed font-normal">
                        <Check className="stroke-[3] text-green-600 shrink-0 w-4 h-4 mt-1" />
                        <span><CmsText slug={`admission-${prog.id}-feat-${i + 1}`} fallback={feat} /></span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-end">
                  <div className="space-y-0.5">
                    <span className="text-xs uppercase font-bold text-slate-500 block">
                      <CmsText slug="admission-tuition-fee-label" fallback={language === 'en' ? "Total Tuition (Full Year)" : "Studieavgift (skoleår)"} />
                    </span>
                    <span className="font-sans text-xl font-extrabold text-[#561291]">
                      <CmsText slug={`admission-${prog.id}-price`} fallback={prog.priceYear} />
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      <SiteText fallback={language === 'en' ? "Pay monthly, semi-annually, or full" : "Mnd, halvår eller samlet betaling"} />
                    </span>
                  </div>
                  
                  <a 
                    href="#apply-form"
                    onClick={() => {
                      updateFieldValue('program', prog.id);
                      setCurrentStep(2);
                      saveDraft({ ...formData, program: prog.id }, 2);
                    }}
                    className="text-base font-bold text-[#561291] hover:text-[#3b0b66] flex items-center gap-1 font-sans transition-colors"
                  >
                    <span><CmsText slug="admission-select-btn" fallback={language === 'en' ? "Select" : "Velg linje"} /></span>
                    <ChevronRight size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: TUITION PAYMENT DETAILS */}
        <section className="bg-white border border-[#e2dce7]/70 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Payment Description */}
            <div className="space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#561291]/10 text-[#561291] font-bold text-xs uppercase tracking-wider select-none">
                <CreditCard size={14} />
                <CmsText slug="admission-payments-tag" fallback={language === 'en' ? "Flexible Payments and Tuition" : "Fleksibel betaling og priser"} />
              </span>

              <CmsText 
                slug="admission-payments-title" 
                fallback={language === 'en' ? "Invest in Your Future Without Financial Stress" : "Invester i din fremtid uten økonomisk stress"} 
                as="h2"
                className="font-sans text-2xl sm:text-3xl font-bold text-[#561291] leading-tight"
              />

              <CmsText 
                slug="admission-payments-desc" 
                fallback={language === 'en' ? "At His Kingdom Prophets, we want prophetic education to be accessible to all. We offer flexible and predictable payment options tailored to your situation: pay once a month, semi-annually (twice a year), or the entire fee at once." : "Hos His Kingdom Prophets ønsker vi at den profetiske utdanningen skal være tilgjengelig for alle. Vi tilbyr ryddige og forutsigbare betalingsordninger tilpasset din situasjon: betal en gang i måneden, en gang i halvåret, eller hele prisen på en gang."} 
                as="p"
                className="text-base text-slate-700 font-normal leading-relaxed"
              />

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-green-50 text-green-600 rounded-full shrink-0 mt-0.5">
                    <Check size={16} className="stroke-[3]" />
                  </div>
                  <div>
                    <CmsText slug="admission-payments-bullet1-title" fallback={language === 'en' ? "Flexible Payment Options" : "Fleksibel betaling"} as="h4" className="text-base font-bold text-[#561291]" />
                    <CmsText slug="admission-payments-bullet1-desc" fallback={language === 'en' ? "Tuition can be paid monthly (10 installments), semi-annually (twice a year), or as a single payment for the entire academic year." : "Studieavgiften kan betales en gang i måneden (10 terminer), en gang i halvåret (2 terminer), eller som et engangsbeløp for hele året."} as="p" className="text-base text-slate-600 mt-1 leading-relaxed font-normal" />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-green-50 text-green-600 rounded-full shrink-0 mt-0.5">
                    <Check size={16} className="stroke-[3]" />
                  </div>
                  <div>
                    <CmsText slug="admission-payments-bullet2-title" fallback={language === 'en' ? "All-Inclusive Tuition Fee" : "Alt inkludert i avgiften"} as="h4" className="text-base font-bold text-[#561291]" />
                    <CmsText slug="admission-payments-bullet2-desc" fallback={language === 'en' ? "The fee covers study workbooks, 1-on-1 mentoring, Zoom gatherings, full access to the student portal and the video archives." : "Studieavgiften dekker studiehefter, 1-til-1 samtaler, Zoom-møter, full tilgang til studentportalen og videoarkivet."} as="p" className="text-base text-slate-600 mt-1 leading-relaxed font-normal" />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-green-50 text-green-600 rounded-full shrink-0 mt-0.5">
                    <Check size={16} className="stroke-[3]" />
                  </div>
                  <div>
                    <CmsText slug="admission-payments-bullet3-title" fallback={language === 'en' ? "Scholarships & Partner Discounts" : "Stipend og partner-rabatter"} as="h4" className="text-base font-bold text-[#561291]" />
                    <CmsText slug="admission-payments-bullet3-desc" fallback={language === 'en' ? "Spouse discount, student discount, and special scholarship options for active church planters and missionary families." : "Ektepar-rabatt, studentrabatt og særskilte stipendordninger for aktive menighetsplantere og misjonærfamilier."} as="p" className="text-base text-slate-600 mt-1 leading-relaxed font-normal" />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Card Comparison */}
            <div className="bg-[#F8F7FA] border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-8 space-y-5 sm:space-y-6 shadow-sm">
              <div className="flex bg-white/90 p-1 sm:p-1.5 rounded-xl border border-slate-200/70 shadow-xs gap-1 sm:gap-1.5 select-none">
                <button
                  type="button"
                  onClick={() => setActivePlan('monthly')}
                  className={`flex-1 min-h-[44px] py-2 sm:py-2.5 px-2 text-xs sm:text-sm font-bold normal-case sm:uppercase tracking-normal sm:tracking-wider rounded-lg transition-all duration-200 flex items-center justify-center text-center ${
                    activePlan === 'monthly'
                      ? 'bg-[#561291] text-white shadow-sm shadow-[#561291]/25 font-extrabold'
                      : 'text-slate-600 hover:text-[#561291] hover:bg-slate-50'
                  }`}
                >
                  <CmsText slug="admission-price-plan-monthly" fallback={language === 'en' ? "Monthly" : "1 gang i mnd"} />
                </button>
                <button
                  type="button"
                  onClick={() => setActivePlan('biannual')}
                  className={`flex-1 min-h-[44px] py-2 sm:py-2.5 px-2 text-xs sm:text-sm font-bold normal-case sm:uppercase tracking-normal sm:tracking-wider rounded-lg transition-all duration-200 flex items-center justify-center text-center ${
                    activePlan === 'biannual'
                      ? 'bg-[#561291] text-white shadow-sm shadow-[#561291]/25 font-extrabold'
                      : 'text-slate-600 hover:text-[#561291] hover:bg-slate-50'
                  }`}
                >
                  <CmsText slug="admission-price-plan-biannual" fallback={language === 'en' ? "Semi-Annual" : "1 gang i halvåret"} />
                </button>
                <button
                  type="button"
                  onClick={() => setActivePlan('full')}
                  className={`flex-1 min-h-[44px] py-2 sm:py-2.5 px-2 text-xs sm:text-sm font-bold normal-case sm:uppercase tracking-normal sm:tracking-wider rounded-lg transition-all duration-200 flex items-center justify-center text-center ${
                    activePlan === 'full'
                      ? 'bg-[#561291] text-white shadow-sm shadow-[#561291]/25 font-extrabold'
                      : 'text-slate-600 hover:text-[#561291] hover:bg-slate-50'
                  }`}
                >
                  <CmsText slug="admission-price-plan-full" fallback={language === 'en' ? "Full Price" : "Hele prisen"} />
                </button>
              </div>

              <div className="text-center space-y-2 sm:space-y-3 pt-1">
                <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-widest block">
                  <SiteText fallback={activePlan === 'monthly' ? (
                    language === 'en' ? "Monthly installments (10 payments)" : "Månedlig delbetaling (10 terminer)"
                  ) : activePlan === 'biannual' ? (
                    language === 'en' ? "Semi-annual payment (2 installments)" : "Halvårlig betaling (2 terminer)"
                  ) : (
                    language === 'en' ? "Full academic year (single payment)" : "Fullt studieår (engangsbetaling)"
                  )} />
                </span>
                
                <div className="font-sans text-3xl sm:text-5xl font-extrabold text-[#561291] tracking-tight">
                  <SiteText fallback={language === 'en' ? (
                    activePlan === 'monthly' ? "$100 USD / mo" : activePlan === 'biannual' ? "$500 USD x 2" : "$1,000 USD"
                  ) : (
                    activePlan === 'monthly' ? "1 000,- / mnd" : activePlan === 'biannual' ? "5 000,- x 2" : "10 000,- NOK"
                  )} />
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  <SiteText fallback={activePlan === 'monthly'
                    ? (language === 'en' ? "10 installments of $100 USD (Total $1,000 USD)" : "10 månedlige innbetalinger à 1 000 kr (Totalt 10 000 kr)")
                    : activePlan === 'biannual'
                    ? (language === 'en' ? "2 installments of $500 USD (Total $1,000 USD)" : "2 innbetalinger à 5 000 kr (Totalt 10 000 kr)")
                    : (language === 'en' ? "Single upfront payment for entire year" : "Ett samlet oppgjør for hele skoleåret")} />
                </div>
                
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-sm mx-auto">
                  <SiteText fallback={language === 'en'
                    ? "*In addition: $50 USD admin/startup fee and $50 USD room & board for the kickoff weekend. (Self-chosen hotel during kickoff weekend is not covered by the school)."
                    : "*I tillegg: 500 kr i admin oppstart og 500 kr for kost og losji for kickoff-helgen. (Hvis man skal bo på egenvalgt hotell i kickoff-helgen dekker skolen ikke dette)."} />
                </p>
              </div>

              <div className="w-full h-[1px] bg-slate-200/70" />

              <div className="bg-white rounded-xl border border-slate-200/70 divide-y divide-slate-100 shadow-xs overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-3.5 py-3 text-xs sm:text-sm">
                  <span className="text-slate-700 font-medium leading-snug">
                    <CmsText slug="admission-price-row1-label" fallback={language === 'en' ? "Admin / Startup fee" : "Admin / oppstartsgebyr"} />
                  </span>
                  <span className="text-[#561291] font-bold whitespace-nowrap shrink-0 text-right">
                    <CmsText slug="admission-price-row1-val" fallback={language === 'en' ? "$50 USD" : "500,- NOK"} />
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 px-3.5 py-3 text-xs sm:text-sm">
                  <span className="text-slate-700 font-medium leading-snug">
                    <CmsText slug="admission-price-row2-label" fallback={language === 'en' ? "Kickoff weekend room & board" : "Kickoff-helg kost og losji"} />
                  </span>
                  <span className="text-[#561291] font-bold whitespace-nowrap shrink-0 text-right">
                    <CmsText slug="admission-price-row2-val" fallback={language === 'en' ? "$50 USD" : "500,- NOK"} />
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 px-3.5 py-3 text-xs sm:text-sm">
                  <span className="text-slate-700 font-medium leading-snug">
                    <CmsText slug="admission-price-row3-label" fallback={language === 'en' ? "Assigned personal mentor" : "Tildelt personlig mentor"} />
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full font-bold text-xs whitespace-nowrap shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <CmsText slug="admission-price-row3-val" fallback={language === 'en' ? "Included" : "Inkludert"} />
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 px-3.5 py-3 text-xs sm:text-sm">
                  <span className="text-slate-700 font-medium leading-snug">
                    <CmsText slug="admission-price-row4-label" fallback={language === 'en' ? "Digital Study Platform & Lectures" : "Digital studieportal & forelesninger"} />
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full font-bold text-xs whitespace-nowrap shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <CmsText slug="admission-price-row4-val" fallback={language === 'en' ? "Included" : "Inkludert"} />
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 px-3.5 py-3 text-xs sm:text-sm">
                  <span className="text-slate-700 font-medium leading-snug">
                    <CmsText slug="admission-price-row5-label" fallback={language === 'en' ? "Spouse / Family Discount" : "Ektefelle/familierabatt"} />
                  </span>
                  <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full font-bold text-xs whitespace-nowrap shrink-0">
                    <CmsText slug="admission-price-row5-val" fallback="-25%" />
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 3: STEP BY STEP APPLICATION PROCESS */}
        <section className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <CmsText 
              slug="admission-steps-title" 
              fallback={language === 'en' ? "How the Application Process Works" : "Slik fungerer søknadsprosessen"} 
              as="h2"
              className="font-sans text-2xl sm:text-3xl font-bold text-[#561291]"
            />
            <CmsText 
              slug="admission-steps-subtitle" 
              fallback={language === 'en' ? "Four simple steps from submitting your application to your approved study space and access." : "Fire enkle steg fra innsendt søknad til godkjent studieplass og tilgang."} 
              as="p"
              className="text-base text-slate-600 font-medium leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                slugNum: 'admission-step1-num',
                fallbackNum: '01',
                slugTitle: 'admission-step1-title',
                fallbackTitle: language === 'en' ? "Submit Form" : "Send søknad",
                slugDesc: 'admission-step1-desc',
                fallbackDesc: language === 'en' ? "Fill out the 4-step admission form below with your background and motivation." : "Fyll ut det 4-delte søknadsskjemaet nedenfor i ro og mak."
              },
              {
                slugNum: 'admission-step2-num',
                fallbackNum: '02',
                slugTitle: 'admission-step2-title',
                fallbackTitle: language === 'en' ? "Admission Interview" : "Søknadssamtale",
                slugDesc: 'admission-step2-desc',
                fallbackDesc: language === 'en' ? "We will schedule a brief Zoom or phone call to align callings and course goals." : "Vi tar en kort og uforpliktende samtale på telefon eller Zoom for å bli kjent."
              },
              {
                slugNum: 'admission-step3-num',
                fallbackNum: '03',
                slugTitle: 'admission-step3-title',
                fallbackTitle: language === 'en' ? "Tuition Setup" : "Betaling & Faktura",
                slugDesc: 'admission-step3-desc',
                fallbackDesc: language === 'en' ? "Select your preferred payment plan: monthly, semi-annually, or full. Spouses enjoy 25% off." : "Velg din foretrukne betalingsordning: månedlig, halvårlig eller engangsbetaling. Ektepar får 25 % rabatt."
              },
              {
                slugNum: 'admission-step4-num',
                fallbackNum: '04',
                slugTitle: 'admission-step4-title',
                fallbackTitle: language === 'en' ? "Instant Portal Access" : "Portal-tilgang",
                slugDesc: 'admission-step4-desc',
                fallbackDesc: language === 'en' ? "Get your login, workbook, study materials, and mobile portal active." : "Du får tilsendt brukerkonto og kan logge inn i portalen og starte studiet!"
              }
            ].map((stepObj, i) => (
              <div 
                key={i}
                className="bg-white border border-[#e2dce7]/70 p-6 rounded-2xl relative shadow-sm hover:shadow transition-all duration-200 space-y-3"
              >
                <span className="font-sans text-3xl font-extrabold text-[#D7B978]/30 block">
                  <CmsText slug={stepObj.slugNum} fallback={stepObj.fallbackNum} />
                </span>
                <h4 className="font-sans text-base sm:text-lg font-bold text-[#561291]">
                  <CmsText slug={stepObj.slugTitle} fallback={stepObj.fallbackTitle} />
                </h4>
                <p className="text-base text-slate-600 leading-relaxed font-normal">
                  <CmsText slug={stepObj.slugDesc} fallback={stepObj.fallbackDesc} />
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: INTERACTIVE 4-STEP APPLICATION FORM OR OPENING ANNOUNCEMENT */}
        <section id="apply-form" className="max-w-4xl mx-auto scroll-mt-24 space-y-4">
          {isAdmin && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#561291] text-white shadow-md border border-[#7924c7]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-3.5 h-3.5 rounded-full ${isFormManuallyOpen ? 'bg-green-400 shadow-sm shadow-green-400/80 animate-pulse' : 'bg-amber-400'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#D7B978]"><SiteText fallback={"Admin Styring"} /></span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/10 font-medium">
                      <SiteText fallback={isFormManuallyOpen ? 'Offentlig status: ÅPENT' : 'Offentlig status: LÅST (Planlagt 1. jan 2027)'} />
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
                    <SiteText fallback={isFormManuallyOpen
                      ? 'Søknadsskjemaet er nå direkte tilgjengelig for alle besøkende på nettsiden.'
                      : 'Skjemaet er låst for publikum fram til 1. januar 2027. Du ser det fordi du er logget inn som administrator.'} />
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <span className="text-xs font-bold text-white/90">
                  <SiteText fallback={isFormManuallyOpen ? 'Skjema er ÅPENT' : 'Skjema er LÅST'} />
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isFormManuallyOpen}
                  onClick={async () => {
                    const nextState = !isFormManuallyOpen;
                    await setAdmissionFormOpenState(nextState);
                    showToast(nextState ? "Søknadsskjemaet er nå ÅPENT for alle besøkende!" : "Søknadsskjemaet er nå LÅST for vanlige besøkende.");
                  }}
                  className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#D7B978] ${
                    isFormManuallyOpen ? 'bg-green-500 justify-end' : 'bg-white/20 justify-start'
                  }`}
                  title={isFormManuallyOpen ? "Klikk for å stenge/låse skjemaet" : "Klikk for å åpne skjemaet for alle"}
                >
                  <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="bg-white w-6 h-6 rounded-full shadow-md flex items-center justify-center text-[#561291]"
                  >
                    {isFormManuallyOpen ? <Check size={14} className="text-green-600 stroke-[3]" /> : <Lock size={12} className="text-slate-500" />}
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
                  <CmsText slug="admission-locked-title" fallback={language === 'en' ? "Applications Open January 1, 2027" : "Søknadsportalen åpner 1. januar 2027"} />
                </h3>
                
                <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
                  <CmsText 
                    slug="admission-locked-desc" 
                    fallback={language === 'en' 
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
                    <span><SiteText fallback={language === 'en' ? "Opening" : "Søknad åpner"} /></span>
                  </div>
                  <div className="font-bold text-slate-800 text-base"><SiteText fallback={"1. januar 2027"} /></div>
                  <p className="text-xs text-slate-500 font-normal"><SiteText fallback={language === 'en' ? "Digital form available" : "Digitalt skjema åpner"} /></p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#561291] text-xs font-bold uppercase tracking-wider">
                    <Clock size={14} />
                    <span><SiteText fallback={language === 'en' ? "Deadline" : "Søknadsfrist"} /></span>
                  </div>
                  <div className="font-bold text-slate-800 text-base"><SiteText fallback={"30. juni 2027"} /></div>
                  <p className="text-xs text-slate-500 font-normal"><SiteText fallback={language === 'en' ? "Continuous evaluation" : "Fortløpende opptak"} /></p>
                </div>

                <div className="p-4 rounded-2xl bg-[#561291]/5 border border-[#561291]/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#561291] text-xs font-bold uppercase tracking-wider">
                    <Sparkles size={14} className="text-[#D7B978]" />
                    <span><SiteText fallback={language === 'en' ? "Kickoff" : "Kickoff i Norge"} /></span>
                  </div>
                  <div className="font-bold text-[#561291] text-base"><SiteText fallback={language === 'en' ? "August 20–22, 2027" : "20.–22. august 2027"} /></div>
                  <p className="text-xs text-slate-600 font-normal"><SiteText fallback={language === 'en' ? "On-site weekend gathering" : "Fysisk helgesamling"} /></p>
                </div>
              </div>

              {/* Get Notified / Lead Capture Form */}
              <div className="max-w-lg mx-auto bg-gradient-to-br from-[#561291]/5 to-[#D7B978]/10 border border-[#561291]/15 rounded-2xl p-5 sm:p-8 space-y-4 relative z-10 text-center">
                <div className="space-y-1">
                  <div className="w-11 h-11 rounded-2xl bg-[#561291]/10 text-[#561291] flex items-center justify-center mx-auto mb-2 shadow-xs">
                    <Bell size={20} />
                  </div>
                  <h4 className="font-bold text-lg text-[#561291]">
                    <SiteText fallback={language === 'en' ? "Get Notified When Applications Open" : "Få påminnelse når søknaden åpner"} />
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                    <SiteText fallback={language === 'en'
                      ? "Leave your name and email to receive an instant reminder the moment the portal opens on January 1, 2027."
                      : "Legg igjen navn og e-post, så sender vi deg en påminnelse så snart søknadsskjemaet åpner 1. januar 2027."} />
                  </p>
                </div>

                {interestSubmitted ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm font-semibold flex items-center justify-center gap-2">
                    <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                    <span><SiteText fallback={language === 'en' ? "Thank you! We will notify you on January 1, 2027." : "Takk! Vi sender deg en påminnelse 1. januar 2027."} /></span>
                  </div>
                ) : (
                  <form onSubmit={handleInterestSubmit} className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                      <input
                        type="text"
                        placeholder={language === 'en' ? "Your Name" : "Ditt navn"}
                        value={interestName}
                        onChange={(e) => setInterestName(e.target.value)}
                        className="w-full min-h-[44px] px-4 py-2.5 bg-white border border-slate-200 focus:border-[#561291] rounded-xl text-base sm:text-sm focus:outline-none transition-colors"
                      />
                      <input
                        type="email"
                        required
                        placeholder={language === 'en' ? "Your Email *" : "Din e-post *"}
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
                      <span><SiteText fallback={isSubmittingInterest ? (language === 'en' ? "Saving..." : "Lagrer...") : (language === 'en' ? "Notify Me" : "Send meg påminnelse")} /></span>
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
                    url.searchParams.set('preview', 'true');
                    window.location.href = url.toString();
                  }}
                  className="text-xs text-slate-400 hover:text-[#561291] underline decoration-slate-300 transition-colors"
                >
                  <SiteText fallback={language === 'en' ? "Admin / Developer: Preview & test application form" : "Admin / Utvikler: Forhåndsvis og test søknadsskjema"} />
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE APPLICATION WIZARD (Opens Jan 1, 2027 or in ?preview=true mode) */
            <div className="bg-white border border-[#e2dce7]/70 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 shadow-lg">
              {isPreviewMode && !isAdmin && (
                <div className="mb-6 p-3 px-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold"><SiteText fallback={"⚠️ Forhåndsvisningsmodus aktiv (?preview=true):"} /></span>
                    <span><SiteText fallback={"Søknadsskjemaet er synlig for deg, men åpner offisielt for publikum 1. januar 2027."} /></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.delete('preview');
                      window.location.href = url.toString();
                    }}
                    className="font-bold underline text-amber-800 hover:text-amber-950"
                  ><SiteText fallback={"Avslutt forhåndsvisning"} /></button>
                </div>
              )}
              <AnimatePresence mode="wait">
                {paymentStep === 'form' ? (
                  <div key="form-container" className="space-y-8">
                
                {/* Header */}
                <div className="text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#561291]/10 text-[#561291] flex items-center justify-center mx-auto shadow-sm">
                    <FileText size={26} />
                  </div>
                  <CmsText 
                    slug="admission-form-title" 
                    fallback={language === 'en' ? "Application for Admission – HKPC" : "Søknad om opptak – His Kingdom Prophetic Community"} 
                    as="h3"
                    className="font-sans text-2xl sm:text-3xl font-bold text-[#561291]"
                  />
                  <CmsText 
                    slug="admission-form-subtitle" 
                    fallback={language === 'en' ? "Please complete all fields carefully. Applications are reviewed continuously by the leadership." : "Vennligst fyll ut feltene nedenfor. Alle søknader behandles konfidensielt og fortløpende av skolens ledelse."} 
                    as="p"
                    className="text-base text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto"
                  />
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#561291]/5 text-[#561291] font-semibold text-xs sm:text-sm tracking-wide border border-[#561291]/15">
                      <GraduationCap size={15} className="text-[#561291]" />
                      <SiteText fallback={language === 'en'
                        ? "No account required to apply – Login credentials are issued upon approved admission" 
                        : "Ingen forhåndskonto kreves – Brukerkonto tildeles av administrasjonen etter godkjent opptak"} />
                    </span>
                  </div>
                </div>

                {/* Progress Bar & Step Indicators */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
                    <span>
                      {language === 'en' ? `Step ${currentStep} of 4` : `Steg ${currentStep} av 4`}
                    </span>
                    <span className="text-[#561291]">
                      {currentStep === 1 && (language === 'en' ? "Personal Details" : "Personalia & Kontakt")}
                      {currentStep === 2 && (language === 'en' ? "Study Line & Payment" : "Studielinje & Betaling")}
                      {currentStep === 3 && (language === 'en' ? "Spiritual Background" : "Åndelig Bakgrunn & Kall")}
                      {currentStep === 4 && (language === 'en' ? "Reference & Submit" : "Referanse & Fullfør")}
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
                      { step: 1, title: language === 'en' ? "1. Details" : "1. Personalia", short: "1. Info" },
                      { step: 2, title: language === 'en' ? "2. Program" : "2. Studielinje", short: "2. Linje" },
                      { step: 3, title: language === 'en' ? "3. Background" : "3. Bakgrunn", short: "3. Tro" },
                      { step: 4, title: language === 'en' ? "4. Reference" : "4. Referanse", short: "4. Svar" }
                    ].map(item => (
                      <button
                        key={item.step}
                        type="button"
                        onClick={() => {
                          if (item.step < currentStep) {
                            setCurrentStep(item.step);
                          } else if (item.step === 2 && validateStep1()) {
                            setCurrentStep(2);
                          } else if (item.step === 3 && validateStep1() && validateStep2()) {
                            setCurrentStep(3);
                          } else if (item.step === 4 && validateStep1() && validateStep2() && validateStep3()) {
                            setCurrentStep(4);
                          }
                        }}
                        className={`min-h-[44px] py-2 px-1 text-center text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center ${
                          currentStep === item.step
                            ? 'bg-[#561291] text-white shadow-sm'
                            : currentStep > item.step
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-slate-50 text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <span className="hidden sm:inline"><SiteText fallback={item.title} /></span>
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
                          <SiteText fallback={language === 'en'
                            ? "Draft auto-saved on this device" 
                            : "Søknaden lagres automatisk på denne enheten"} />
                        </span>
                        {draftSavedAt && (
                          <span className="text-emerald-700/70 hidden sm:inline">
                            • <SiteText fallback={language === 'en' ? "Last saved" : "Sist lagret"} /> {draftSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={clearDraft}
                        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-red-600 font-semibold transition-colors underline decoration-slate-300 underline-offset-2 hover:decoration-red-400"
                      >
                        <RotateCcw size={13} />
                        <span><SiteText fallback={language === 'en' ? "Clear & start over" : "Nullstill skjema"} /></span>
                      </button>
                    </div>
                  )}
                </div>

                {/* FORM CONTENT PER STEP */}
                <form onSubmit={handleFormSubmit} className="space-y-6 pt-4">

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
                          <SiteText fallback={language === 'en' ? "1. Personal Information & Contact" : "1. Personalia & Kontaktinformasjon"} />
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
                            <SiteText fallback={language === 'en' ? "Full Name *" : "Fullt navn *"} />
                          </label>
                          <input
                            type="text"
                            name="name"
                            required
                            placeholder={language === 'en' ? "E.g. Thomas Knutsen" : "F.eks. Ola Nordmann"}
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all"
                          />
                        </div>

                        {/* Gender */}
                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
                            <SiteText fallback={language === 'en' ? "Gender *" : "Kjønn *"} />
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {['Mann', 'Kvinne'].map((g) => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => updateFieldValue('gender', g)}
                                className={`min-h-[44px] py-2.5 px-4 rounded-xl border text-sm sm:text-base font-bold transition-all duration-200 flex items-center justify-center ${
                                  formData.gender === g
                                    ? 'bg-[#561291]/10 border-[#561291] text-[#561291]'
                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
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
                            <span><SiteText fallback={language === 'en' ? "Date of Birth *" : "Fødselsdato *"} /></span>
                            <span className="text-[11px] font-semibold text-[#561291] bg-[#561291]/10 px-2 py-0.5 rounded-md normal-case">
                              <SiteText fallback={language === 'en' ? "Min. 18 years old" : "Min. 18 år"} />
                            </span>
                          </label>
                          <input
                            type="date"
                            name="birthDate"
                            required
                            max={getEighteenYearsAgoDateString()}
                            lang={language === 'en' ? "en-US" : "no"}
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
                                {language === 'en'
                                  ? `You must be at least 18 years old to apply (current age: ${calculateAge(formData.birthDate)}).`
                                  : `Du må være minst 18 år for å søke elevplass ved skolen (oppgitt alder: ${calculateAge(formData.birthDate)} år).`}
                              </span>
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-500 font-normal">
                              <SiteText fallback={language === 'en' ? "Format: MM/DD/YYYY (or pick from calendar)" : "Format: DD.MM.ÅÅÅÅ (eller velg i kalenderen)"} />
                            </p>
                          )}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
                            <SiteText fallback={language === 'en' ? "Email Address *" : "E-postadresse *"} />
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
                            <SiteText fallback={language === 'en' ? "Phone Number *" : "Mobiltelefon *"} />
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
                            <SiteText fallback={language === 'en' ? "Occupation / Education *" : "Yrke / utdannelse *"} />
                          </label>
                          <input
                            type="text"
                            name="occupation"
                            required
                            placeholder={language === 'en' ? "E.g. Teacher, Engineer, Student" : "F.eks. Lærer, Ingeniør, Student"}
                            value={formData.occupation}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all"
                          />
                        </div>
                      </div>

                      {/* Residential Address */}
                      <div className="space-y-1.5">
                        <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
                          <SiteText fallback={language === 'en' ? "Residential Address *" : "Bostedsadresse *"} />
                        </label>
                        <input
                          type="text"
                          name="address"
                          required
                          placeholder={language === 'en' ? "Street address, postal code, city, country" : "Adresse, postnummer, poststed, land"}
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all"
                        />
                      </div>

                      {/* Marital Status */}
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
                          <SiteText fallback={language === 'en' ? "Marital Status *" : "Sivilstatus *"} />
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {['Gift', 'Ugift', 'Forlovet', 'Separert / skilt', 'Enke / enkemann'].map((ms, idx) => (
                            <button
                              key={ms}
                              type="button"
                              onClick={() => updateFieldValue('maritalStatus', ms)}
                              className={`min-h-[44px] py-2.5 px-2 rounded-xl border text-xs sm:text-sm font-bold transition-all duration-200 text-center flex items-center justify-center ${
                                idx === 4 ? 'col-span-2 sm:col-span-1' : ''
                              } ${
                                formData.maritalStatus === ms
                                  ? 'bg-[#561291]/10 border-[#561291] text-[#561291]'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
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
                          onClick={() => {
                            saveDraft(formData, currentStep);
                            showToast(language === 'en' ? "Draft saved! You can resume anytime." : "Kladd lagret! Du kan lukke siden og fortsette senere.");
                          }}
                          className="w-full sm:w-auto min-h-[44px] px-4 py-3 text-slate-600 hover:text-[#561291] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-medium text-sm transition-all duration-200 inline-flex items-center justify-center gap-2"
                        >
                          <Save size={16} />
                          <span><SiteText fallback={language === 'en' ? "Save Draft & Continue Later" : "Lagre kladd & fortsett senere"} /></span>
                        </button>

                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="w-full sm:w-auto min-h-[44px] px-8 py-3.5 bg-[#D7B978] hover:bg-[#c4a565] text-[#561291] font-bold text-base uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2"
                        >
                          <span><SiteText fallback={language === 'en' ? "Next: Study Line & Payment" : "Neste: Studielinje & betaling"} /></span>
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
                          <SiteText fallback={language === 'en' ? "2. Program Track & Tuition Agreement" : "2. Studielinje & Betalingsordning"} />
                        </h4>
                      </div>

                      {/* Program Choice */}
                      <div className="space-y-3">
                        <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
                          <SiteText fallback={language === 'en' ? "Select Study Line *" : "Velg studielinje *"} />
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {programs.map(p => (
                            <label
                              key={p.id}
                              className={`border rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                                formData.program === p.id
                                  ? 'border-[#561291] bg-[#561291]/5 shadow-sm'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#561291]/10 text-[#561291] uppercase tracking-wider">
                                    {p.code}
                                  </span>
                                  <h5 className="font-bold text-base text-[#561291] pt-1"><SiteText fallback={p.title} /></h5>
                                  <p className="text-xs text-slate-500">{p.duration}</p>
                                </div>
                                <input
                                  type="radio"
                                  name="program"
                                  value={p.id}
                                  checked={formData.program === p.id}
                                  onChange={handleInputChange}
                                  className="accent-[#561291] w-4 h-4 mt-1"
                                />
                              </div>
                              <div className="pt-4 border-t border-slate-100 mt-4 flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-semibold"><SiteText fallback={language === 'en' ? "Total Tuition (Year):" : "Studieavgift (skoleår):"} /></span>
                                <span className="font-bold text-[#561291] text-sm">{p.priceYear || '10 000,-'}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Billing Plan */}
                      <div className="space-y-3">
                        <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
                          <SiteText fallback={language === 'en' ? "Preferred Payment Arrangement *" : "Foretrukket betalingsordning *"} />
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* 1. Månedlig */}
                          <label className={`border rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
                            formData.paymentPlan === 'monthly'
                              ? 'border-[#561291] bg-[#561291]/5 text-[#561291] shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1">
                                <span className="text-base font-bold block">
                                  <SiteText fallback={language === 'en' ? "Monthly Payment" : "Månedlig"} />
                                </span>
                                <span className="text-xs text-slate-600 block">
                                  <SiteText fallback={language === 'en' ? "$100 USD / month (10 months)" : "1 000,- per mnd (10 terminer)"} />
                                </span>
                              </div>
                              <input
                                type="radio"
                                name="paymentPlan"
                                value="monthly"
                                checked={formData.paymentPlan === 'monthly'}
                                onChange={handleInputChange}
                                className="accent-[#561291] w-4 h-4 mt-1 shrink-0"
                              />
                            </div>
                            <div className="mt-3 pt-2 border-t border-slate-200/50 text-[11px] text-slate-500 font-medium">
                              <SiteText fallback={language === 'en' ? "Total tuition $1,000 USD" : "Total studieavgift: 10 000,-"} />
                            </div>
                          </label>

                          {/* 2. Halvårlig */}
                          <label className={`border rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
                            formData.paymentPlan === 'biannual' || formData.paymentPlan === 'semester'
                              ? 'border-[#561291] bg-[#561291]/5 text-[#561291] shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1">
                                <span className="text-base font-bold block">
                                  <SiteText fallback={language === 'en' ? "Semi-Annual" : "En gang i halvåret"} />
                                </span>
                                <span className="text-xs text-slate-600 block">
                                  <SiteText fallback={language === 'en' ? "$500 USD twice a year (2 installments)" : "5 000,- per halvår (2 terminer)"} />
                                </span>
                              </div>
                              <input
                                type="radio"
                                name="paymentPlan"
                                value="biannual"
                                checked={formData.paymentPlan === 'biannual' || formData.paymentPlan === 'semester'}
                                onChange={handleInputChange}
                                className="accent-[#561291] w-4 h-4 mt-1 shrink-0"
                              />
                            </div>
                            <div className="mt-3 pt-2 border-t border-slate-200/50 text-[11px] text-slate-500 font-medium">
                              <SiteText fallback={language === 'en' ? "Total tuition $1,000 USD" : "Total studieavgift: 10 000,-"} />
                            </div>
                          </label>

                          {/* 3. Hele prisen på en gang */}
                          <label className={`border rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
                            formData.paymentPlan === 'full' || formData.paymentPlan === 'year'
                              ? 'border-[#561291] bg-[#561291]/5 text-[#561291] shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1">
                                <span className="text-base font-bold block">
                                  <SiteText fallback={language === 'en' ? "Full Price at Once" : "Hele prisen på en gang"} />
                                </span>
                                <span className="text-xs text-slate-600 block">
                                  <SiteText fallback={language === 'en' ? "$1,000 USD (one-time payment)" : "10 000,- NOK (engangsbetaling)"} />
                                </span>
                              </div>
                              <input
                                type="radio"
                                name="paymentPlan"
                                value="full"
                                checked={formData.paymentPlan === 'full' || formData.paymentPlan === 'year'}
                                onChange={handleInputChange}
                                className="accent-[#561291] w-4 h-4 mt-1 shrink-0"
                              />
                            </div>
                            <div className="mt-3 pt-2 border-t border-slate-200/50 text-[11px] text-slate-500 font-medium">
                              <SiteText fallback={language === 'en' ? "Settled upon enrollment" : "Oppgjøres ved studiestart"} />
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
                              <SiteText fallback={language === 'en' ? "Instruction Language & Kickoff Gathering Agreement *" : "Bekreftelse på undervisningsspråk & kickoff-samling *"} />
                            </span>
                            <SiteText fallback={language === 'en'
                              ? "I confirm that I understand all instruction and materials are conducted in English, with an on-site kickoff gathering in Norway on August 20–22, 2027."
                              : "Jeg bekrefter at jeg er innforstått med at all undervisning foregår på engelsk via nett, med en obligatorisk/anbefalt kickoff-samling i Norge 20.–22. august 2027."} />
                          </div>
                        </label>
                      </div>

                      {/* Track 2 Prerequisite Checkbox (if applicable) */}
                      {formData.program === 'prophets_advanced' && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                          <div className="flex gap-2.5 text-amber-900 text-sm">
                            <Lock size={16} className="shrink-0 mt-0.5" />
                            <p className="font-medium leading-relaxed">
                              <SiteText fallback={language === 'en'
                                ? "This program (Year 2) launches in 2028. To apply, you must confirm that you plan to complete or have completed Year 1 (His Kingdom Prophetic Community) first."
                                : "Dette studieløpet (2. år) starter ikke før i 2028. For å søke opptak, må du bekrefte at du har fullført eller planlegger å fullføre 1. år (His Kingdom Prophetic Community) først."} />
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
                              <SiteText fallback={language === 'en'
                                ? "I confirm that I plan to complete or have completed Year 1 first *"
                                : "Jeg bekrefter at jeg har fullført eller planlegger å fullføre 1. år først *"} />
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
                            <span><SiteText fallback={language === 'en' ? "Back" : "Tilbake"} /></span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              saveDraft(formData, currentStep);
                              showToast(language === 'en' ? "Draft saved! You can resume anytime." : "Kladd lagret! Du kan lukke siden og fortsette senere.");
                            }}
                            className="flex-1 sm:flex-initial min-h-[44px] px-4 py-3 text-slate-600 hover:text-[#561291] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-medium text-sm transition-all duration-200 inline-flex items-center justify-center gap-2"
                          >
                            <Save size={16} />
                            <span><SiteText fallback={language === 'en' ? "Save Draft" : "Lagre kladd"} /></span>
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="w-full sm:w-auto min-h-[44px] px-8 py-3.5 bg-[#D7B978] hover:bg-[#c4a565] text-[#561291] font-bold text-base uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2"
                        >
                          <span><SiteText fallback={language === 'en' ? "Next: Spiritual Background" : "Neste: Åndelig bakgrunn"} /></span>
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
                          <SiteText fallback={language === 'en' ? "3. Spiritual Walk, Calling & Motivation" : "3. Åndelig Bakgrunn, Vandring & Motivasjon"} />
                        </h4>
                      </div>

                      {/* Q1: whySeeking */}
                      <div className="space-y-1.5 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
                        <label className="text-sm font-bold text-[#561291] block">
                          <SiteText fallback={language === 'en' ? "Why are you applying to Bible school? *" : "Hvorfor søker du bibelskole? *"} />
                        </label>
                        <p className="text-xs text-slate-500 font-normal">
                          <SiteText fallback={language === 'en' ? "What inspires you to set aside this year to grow?" : "Hva motiverer deg til å sette av dette året til å vokse?"} />
                        </p>
                        <textarea
                          name="whySeeking"
                          required
                          rows={3}
                          value={formData.whySeeking}
                          onChange={handleInputChange}
                          placeholder={language === 'en' ? "Write your answer here..." : "Skriv ditt svar her..."}
                          className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all resize-y"
                        />
                      </div>

                      {/* Q2: expectations */}
                      <div className="space-y-1.5 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
                        <label className="text-sm font-bold text-[#561291] block">
                          <SiteText fallback={language === 'en' ? "What do you expect from the school year and community? *" : "Hva forventer du deg av skoleåret og fellesskapet? *"} />
                        </label>
                        <textarea
                          name="expectations"
                          required
                          rows={3}
                          value={formData.expectations}
                          onChange={handleInputChange}
                          placeholder={language === 'en' ? "Write your answer here..." : "Skriv ditt svar her..."}
                          className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all resize-y"
                        />
                      </div>

                      {/* Q3: howHeard */}
                      <div className="space-y-1.5 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
                        <label className="text-sm font-bold text-[#561291] block">
                          <SiteText fallback={language === 'en' ? "How did you hear about HKPC, and why are you applying here? *" : "Hvordan hørte du om His Kingdom Prophetic Community, og hvorfor søker du her? *"} />
                        </label>
                        <textarea
                          name="howHeard"
                          required
                          rows={3}
                          value={formData.howHeard}
                          onChange={handleInputChange}
                          placeholder={language === 'en' ? "Write your answer here..." : "Skriv ditt svar her..."}
                          className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all resize-y"
                        />
                      </div>

                      {/* Q4: testimony */}
                      <div className="space-y-1.5 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
                        <label className="text-sm font-bold text-[#561291] block">
                          <SiteText fallback={language === 'en' ? "Share a bit about your experience with Jesus *" : "Skriv litt om din erfaring og vandring med Jesus *"} />
                        </label>
                        <p className="text-xs text-slate-500 font-normal">
                          <SiteText fallback={language === 'en' ? "Your salvation testimony and how your daily relationship with God looks like." : "Din frelsesopplevelse og hvordan hverdagen din med Jesus ser ut."} />
                        </p>
                        <textarea
                          name="testimony"
                          required
                          rows={3}
                          value={formData.testimony}
                          onChange={handleInputChange}
                          placeholder={language === 'en' ? "Write your answer here..." : "Skriv ditt svar her..."}
                          className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all resize-y"
                        />
                      </div>

                      {/* Q5: churchCommunity */}
                      <div className="space-y-1.5 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
                        <label className="text-sm font-bold text-[#561291] block">
                          <SiteText fallback={language === 'en' ? "Do you belong to a local church / community? If yes, which one? *" : "Tilhører du en menighet? Hvis ja, hvilken? *"} />
                        </label>
                        <p className="text-xs text-slate-500 font-normal">
                          <SiteText fallback={language === 'en' ? "Church name, location, and optionally pastor/leader name." : "Navn på menighet/fellesskap, sted og eventuelt pastor/leder."} />
                        </p>
                        <input
                          type="text"
                          name="churchCommunity"
                          required
                          value={formData.churchCommunity}
                          onChange={handleInputChange}
                          placeholder={language === 'en' ? "E.g. Filadelfia Oslo, Pastor..." : "F.eks. Filadelfia Oslo, Pastor..."}
                          className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all"
                        />
                      </div>

                      {/* Q6: currentMinistry */}
                      <div className="space-y-1.5 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
                        <label className="text-sm font-bold text-[#561291] block">
                          <SiteText fallback={language === 'en' ? "Are you in any form of ministry or volunteer work? If yes, please describe *" : "Er du i en form for tjeneste eller frivillig arbeid? Hvis ja, skriv litt om det *"} />
                        </label>
                        <textarea
                          name="currentMinistry"
                          required
                          rows={3}
                          value={formData.currentMinistry}
                          onChange={handleInputChange}
                          placeholder={language === 'en' ? "E.g. worship team, hospitality, prayer group, youth work..." : "F.eks. lovsang, vertskap, forbønn, lederansvar, barne-/ungdomsarbeid..."}
                          className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all resize-y"
                        />
                      </div>

                      {/* Q7: ministryCalling */}
                      <div className="space-y-1.5 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
                        <label className="text-sm font-bold text-[#561291] block">
                          <SiteText fallback={language === 'en' ? "What ministry or spiritual gift do you feel called to grow in? *" : "Hvilken tjeneste kunne du tenke deg å være i / nådegave å vokse i? *"} />
                        </label>
                        <textarea
                          name="ministryCalling"
                          required
                          rows={3}
                          value={formData.ministryCalling}
                          onChange={handleInputChange}
                          placeholder={language === 'en' ? "Write your answer here..." : "Skriv ditt svar her..."}
                          className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all resize-y"
                        />
                      </div>

                      {/* Q8: dreamsVision */}
                      <div className="space-y-1.5 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
                        <label className="text-sm font-bold text-[#561291] block">
                          <SiteText fallback={language === 'en' ? "Tell us a bit about your dreams and visions *" : "Si litt om dine drømmer og visjoner *"} />
                        </label>
                        <p className="text-xs text-slate-500 font-normal">
                          <SiteText fallback={language === 'en' ? "What has God placed on your heart for His kingdom and people?" : "Hva har Gud lagt på hjertet ditt for Hans rike og mennesker rundt deg?"} />
                        </p>
                        <textarea
                          name="dreamsVision"
                          required
                          rows={3}
                          value={formData.dreamsVision}
                          onChange={handleInputChange}
                          placeholder={language === 'en' ? "Write your answer here..." : "Skriv ditt svar her..."}
                          className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all resize-y"
                        />
                      </div>

                      {/* Q9: hobbies */}
                      <div className="space-y-1.5 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
                        <label className="text-sm font-bold text-[#561291] block">
                          <SiteText fallback={language === 'en' ? "What do you like to do? (Hobbies and leisure interests) *" : "Hva liker du å gjøre? (hobbyer / fritidsinteresser) *"} />
                        </label>
                        <textarea
                          name="hobbies"
                          required
                          rows={2}
                          value={formData.hobbies}
                          onChange={handleInputChange}
                          placeholder={language === 'en' ? "E.g. music, outdoors, sports, reading, crafting..." : "F.eks. musikk, friluftsliv, trening, lesing, baking, kunst..."}
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
                            <span><SiteText fallback={language === 'en' ? "Back" : "Tilbake"} /></span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              saveDraft(formData, currentStep);
                              showToast(language === 'en' ? "Draft saved! You can resume anytime." : "Kladd lagret! Du kan lukke siden og fortsette senere.");
                            }}
                            className="flex-1 sm:flex-initial min-h-[44px] px-4 py-3 text-slate-600 hover:text-[#561291] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-medium text-sm transition-all duration-200 inline-flex items-center justify-center gap-2"
                          >
                            <Save size={16} />
                            <span><SiteText fallback={language === 'en' ? "Save Draft" : "Lagre kladd"} /></span>
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="w-full sm:w-auto min-h-[44px] px-8 py-3.5 bg-[#D7B978] hover:bg-[#c4a565] text-[#561291] font-bold text-base uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2"
                        >
                          <span><SiteText fallback={language === 'en' ? "Next: Reference & Final Review" : "Neste: Referanse & fullfør"} /></span>
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
                          <SiteText fallback={language === 'en' ? "4. Reference & Final Submission" : "4. Referanse & Innsending"} />
                        </h4>
                      </div>

                      {/* Reference */}
                      <div className="space-y-1.5 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
                        <label className="text-sm font-bold text-[#561291] block">
                          <SiteText fallback={language === 'en' ? "Reference (Pastor, leader, or trusted mature Christian) *" : "Referanse (Pastor, leder eller annen betrodd person) *"} />
                        </label>
                        <p className="text-xs text-slate-500 font-normal">
                          <SiteText fallback={language === 'en'
                            ? "Please include: Full Name, Relationship/Title, Phone number, and Email address." 
                            : "Vennligst oppgi: Fullt navn, relasjon/rolle, telefonnummer og e-postadresse."} />
                        </p>
                        <textarea
                          name="reference"
                          required
                          rows={3}
                          value={formData.reference}
                          onChange={handleInputChange}
                          placeholder={language === 'en' 
                            ? "E.g. Pastor John Doe, Cornerstone Church, Phone: +47 900 00 000, Email: pastor@church.com" 
                            : "F.eks. Pastor Ola Hansen, Salemkirken, Tlf: +47 900 00 000, E-post: pastor@salem.no"}
                          className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all resize-y"
                        />
                      </div>

                      {/* Optional Notes */}
                      <div className="space-y-1.5 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
                        <label className="text-sm font-bold text-slate-700 block">
                          <SiteText fallback={language === 'en' ? "Other notes or health considerations (Optional)" : "Annet du ønsker at vi skal vite om deg (Valgfritt)"} />
                        </label>
                        <p className="text-xs text-slate-500 font-normal">
                          <SiteText fallback={language === 'en'
                            ? "Health conditions, special needs, or any additional context you wish to share." 
                            : "Eventuelle helsemessige hensyn, spesielle behov, eller andre opplysninger du vil dele med ledelsen."} />
                        </p>
                        <textarea
                          name="additionalNotes"
                          rows={3}
                          value={formData.additionalNotes}
                          onChange={handleInputChange}
                          placeholder={language === 'en' ? "Any optional info..." : "Skriv eventuelle tilleggsopplysninger her..."}
                          className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all resize-y"
                        />
                      </div>

                      {/* Summary Review Card */}
                      <div className="bg-[#561291]/5 border border-[#561291]/20 rounded-2xl p-5 space-y-3">
                        <h5 className="font-bold text-[#561291] text-sm uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 size={16} className="text-[#561291]" />
                          <span><SiteText fallback={language === 'en' ? "Application Summary" : "Oppsummering av søknaden"} /></span>
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-slate-500 block text-xs uppercase font-semibold"><SiteText fallback={language === 'en' ? "Applicant" : "Søker"} /></span>
                            <span className="font-bold text-slate-800">{formData.name || '-'} ({formData.gender || '-'})</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs uppercase font-semibold"><SiteText fallback={language === 'en' ? "Email / Phone" : "E-post & telefon"} /></span>
                            <span className="font-bold text-slate-800">{formData.email} • {formData.phone}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs uppercase font-semibold"><SiteText fallback={language === 'en' ? "Study Line" : "Studielinje"} /></span>
                            <span className="font-bold text-[#561291]"><SiteText fallback={selectedProg.title} /></span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs uppercase font-semibold"><SiteText fallback={language === 'en' ? "Billing Plan" : "Betalingsordning"} /></span>
                            <span className="font-bold text-[#561291]">
                              <SiteText fallback={formData.paymentPlan === 'monthly'
                                ? (language === 'en' ? "Monthly installment (10 payments)" : "Månedlig delbetaling (10 terminer)")
                                : (formData.paymentPlan === 'biannual' || formData.paymentPlan === 'semester')
                                ? (language === 'en' ? "Semi-annual (2 installments)" : "Halvårlig betaling (2 terminer)")
                                : (language === 'en' ? "Full price at once" : "Hele prisen på en gang")} />
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
                            <span><SiteText fallback={language === 'en' ? "Back" : "Tilbake"} /></span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              saveDraft(formData, currentStep);
                              showToast(language === 'en' ? "Draft saved! You can resume anytime." : "Kladd lagret! Du kan lukke siden og fortsette senere.");
                            }}
                            className="flex-1 sm:flex-initial min-h-[44px] px-4 py-3 text-slate-600 hover:text-[#561291] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-medium text-sm transition-all duration-200 inline-flex items-center justify-center gap-2"
                          >
                            <Save size={16} />
                            <span><SiteText fallback={language === 'en' ? "Save Draft" : "Lagre kladd"} /></span>
                          </button>
                        </div>
                        
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full sm:w-auto min-h-[48px] px-10 py-4 bg-[#D7B978] hover:bg-[#c4a565] text-[#561291] font-bold text-base font-sans uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2.5 disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-5 h-5 rounded-full border-2 border-[#561291]/30 border-t-[#561291] animate-spin" />
                              <span><SiteText fallback={language === 'en' ? "Submitting Application..." : "Sender inn søknad..."} /></span>
                            </>
                          ) : (
                            <>
                              <Send size={18} />
                              <span><SiteText fallback={language === 'en' ? "Submit Application" : "Send Inn Min Søknad"} /></span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}

                </form>

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
                    <SiteText fallback={language === 'en' ? "Application Received" : "Søknad registrert"} />
                  </span>
                  <CmsText 
                    slug="admission-success-title" 
                    fallback={language === 'en' ? "Application Successfully Submitted!" : "Søknad om opptak er mottatt!"} 
                    as="h3"
                    className="font-sans text-2xl sm:text-3xl font-bold text-[#561291]"
                  />
                  <p className="text-base text-slate-700 font-normal max-w-md mx-auto leading-relaxed">
                    {language === 'en'
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
                        <SiteText fallback={language === 'en' ? "Next Steps: Review & Account Assignment" : "Veien videre: opptaksbehandling & tildeling av konto"} />
                      </h4>
                      <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                        <SiteText fallback={language === 'en'
                          ? "We review all applications continuously and will contact you for a brief conversation. Upon approved admission, your personal user account and portal login credentials will be issued directly by the school administration."
                          : "Vi behandler søknader fortløpende og kontakter deg for en kort samtale. Når opptaket er godkjent, vil din personlige brukerkonto og innloggingsdetaljer til portalen bli opprettet og tildelt direkte av skolens administrasjon."} />
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[#e2dce7]/40 pt-3.5 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500 text-xs uppercase font-bold block"><SiteText fallback={language === 'en' ? "Program" : "Studielinje"} /></span>
                      <span className="font-bold text-[#561291]">{programs.find(p => p.id === formData.program)?.code}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase font-bold block"><SiteText fallback={language === 'en' ? "Kickoff" : "Kickoff"} /></span>
                      <span className="font-bold text-[#561291]"><SiteText fallback={language === 'en' ? "Aug 20–22, 2027 (Norway)" : "20.–22. aug 2027 (Norge)"} /></span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3.5 bg-[#D7B978] hover:bg-[#c4a565] text-[#561291] font-bold text-base uppercase tracking-wider rounded-xl transition-all duration-200 shadow-sm active:scale-95"
                  >
                    <CmsText slug="admission-success-home-btn" fallback={language === 'en' ? "Back to Home" : "Gå til forsiden"} />
                  </button>
                  <button
                    onClick={() => navigate('/support')}
                    className="px-6 py-3.5 bg-slate-50 hover:bg-slate-100 text-[#561291] text-base font-bold uppercase tracking-wider rounded-xl transition-all duration-200 active:scale-95 border border-slate-200 font-sans"
                  >
                    <CmsText slug="admission-success-contact-btn" fallback={language === 'en' ? "Contact Administration" : "Kontakt administrasjonen"} />
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
