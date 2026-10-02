import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, BookOpen, CreditCard, ChevronRight, Check, 
  HelpCircle, ArrowLeft, ArrowRight, Send, Award, Calendar, FileText, CheckCircle2, Globe, Lock, GraduationCap,
  User, Mail, Phone, MapPin, Heart, Church, Save, RotateCcw
} from 'lucide-react';
import CmsText from '@/components/CmsText';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const DRAFT_KEY = 'hkpc_application_draft_v1';
const DRAFT_STEP_KEY = 'hkpc_application_draft_step';

export default function AdmissionPage() {
  const navigate = useNavigate();
  const { language, toggleLanguage, showToast, user } = useApp();

  const stripePublicKey = "pk_live_51Pab8rAL393JGrO9bTUitYflDKlHGpLiqZCCBp0dCzBEV3ZFxARFfK6MgWraehq7i79tJHPIEzlpMwPiT2K3HsiZ00gJ1TQ71Y";

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
    paymentPlan: 'semester',
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
  const [activePlan, setActivePlan] = useState('semester'); // semester, year
  
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
        paymentPlan: 'semester',
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
        const emailRef = doc(collection(db, "support_emails"));
        await setDoc(emailRef, {
          to: 'school@hiskingdomministry.no',
          replyTo: formData.email.trim(),
          message: {
            subject: `[HKM Opptak] Ny søknad: ${formData.name.trim()} (${prog.code})`,
            text: `Ny søknad om opptak ved His Kingdom Prophetic Community:\n\nNavn: ${formData.name.trim()}\nKjønn: ${formData.gender}\nFødselsdato: ${formData.birthDate}\nE-post: ${formData.email.trim()}\nTelefon: ${formData.phone.trim()}\nAdresse: ${formData.address.trim()}\nSivilstatus: ${formData.maritalStatus}\nYrke/utdannelse: ${formData.occupation.trim()}\n\nStudielinje: ${prog.title} (${prog.code})\nBetalingsplan: ${formData.paymentPlan === 'year' ? 'Fullt studieår' : 'Semesterfaktura'}\n\nHvorfor bibelskole:\n${formData.whySeeking.trim()}\n\nForventninger:\n${formData.expectations.trim()}\n\nHvordan hørt om HKPC:\n${formData.howHeard.trim()}\n\nErfaring med Jesus:\n${formData.testimony.trim()}\n\nMenighet:\n${formData.churchCommunity.trim()}\n\nTjeneste i dag:\n${formData.currentMinistry.trim()}\n\nKall / tjenesteønske:\n${formData.ministryCalling.trim()}\n\nDrømmer og visjoner:\n${formData.dreamsVision.trim()}\n\nHobbyer:\n${formData.hobbies.trim()}\n\nReferanse:\n${formData.reference.trim()}\n\nAnnet:\n${formData.additionalNotes?.trim() || 'Ingen'}`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 24px; color: #271f30; max-width: 680px; border: 1px solid #e2dce7; border-radius: 16px; background: #ffffff;">
                <div style="background: #561291; padding: 18px 24px; border-radius: 12px 12px 0 0; color: #ffffff;">
                  <h2 style="margin: 0; font-size: 20px;">Ny søknad om opptak</h2>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #D7B978;">His Kingdom Prophetic Community</p>
                </div>
                <div style="padding: 20px 8px;">
                  <h3 style="color: #561291; border-bottom: 2px solid #561291; padding-bottom: 6px;">1. Personalia & kontakt</h3>
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr><td style="padding: 6px 0; width: 180px; font-weight: bold;">Fullt navn:</td><td>${formData.name.trim()}</td></tr>
                    <tr><td style="padding: 6px 0; font-weight: bold;">Kjønn:</td><td>${formData.gender}</td></tr>
                    <tr><td style="padding: 6px 0; font-weight: bold;">Fødselsdato:</td><td>${formData.birthDate}</td></tr>
                    <tr><td style="padding: 6px 0; font-weight: bold;">E-post:</td><td><a href="mailto:${formData.email.trim()}">${formData.email.trim()}</a></td></tr>
                    <tr><td style="padding: 6px 0; font-weight: bold;">Telefon:</td><td>${formData.phone.trim()}</td></tr>
                    <tr><td style="padding: 6px 0; font-weight: bold;">Adresse:</td><td>${formData.address.trim()}</td></tr>
                    <tr><td style="padding: 6px 0; font-weight: bold;">Sivilstatus:</td><td>${formData.maritalStatus}</td></tr>
                    <tr><td style="padding: 6px 0; font-weight: bold;">Yrke / utdannelse:</td><td>${formData.occupation.trim()}</td></tr>
                  </table>

                  <h3 style="color: #561291; border-bottom: 2px solid #561291; padding-bottom: 6px; margin-top: 24px;">2. Studielinje & rammer</h3>
                  <p style="margin: 6px 0; font-size: 14px;"><strong>Valgt linje:</strong> ${prog.title} (${prog.code})</p>
                  <p style="margin: 6px 0; font-size: 14px;"><strong>Betalingsordning:</strong> ${formData.paymentPlan === 'year' ? 'Fullt studieår' : 'Semesterfaktura'}</p>
                  <p style="margin: 6px 0; font-size: 14px;"><strong>Språk & kickoff:</strong> Godtatt (Engelsk undervisning + Kickoff 27. aug 2027 i Norge)</p>

                  <h3 style="color: #561291; border-bottom: 2px solid #561291; padding-bottom: 6px; margin-top: 24px;">3. Åndelig bakgrunn & kall</h3>
                  <div style="font-size: 14px; line-height: 1.6;">
                    <p><strong>Hvorfor søker du bibelskole:</strong><br/>${formData.whySeeking.trim()}</p>
                    <p><strong>Forventninger til skoleåret:</strong><br/>${formData.expectations.trim()}</p>
                    <p><strong>Hvordan hørte du om HKPC:</strong><br/>${formData.howHeard.trim()}</p>
                    <p><strong>Erfaring og vandring med Jesus:</strong><br/>${formData.testimony.trim()}</p>
                    <p><strong>Menighetstilhørighet:</strong><br/>${formData.churchCommunity.trim()}</p>
                    <p><strong>Nåværende tjeneste/frivillig arbeid:</strong><br/>${formData.currentMinistry.trim()}</p>
                    <p><strong>Tjeneste/nådegave som ønskes å vokse i:</strong><br/>${formData.ministryCalling.trim()}</p>
                    <p><strong>Drømmer og visjoner:</strong><br/>${formData.dreamsVision.trim()}</p>
                    <p><strong>Hobbyer og fritidsinteresser:</strong><br/>${formData.hobbies.trim()}</p>
                  </div>

                  <h3 style="color: #561291; border-bottom: 2px solid #561291; padding-bottom: 6px; margin-top: 24px;">4. Referanse & tilleggsopplysninger</h3>
                  <div style="font-size: 14px; line-height: 1.6;">
                    <p><strong>Referanse:</strong><br/>${formData.reference.trim()}</p>
                    <p><strong>Annet:</strong><br/>${formData.additionalNotes?.trim() || 'Ingen'}</p>
                  </div>
                </div>
                <div style="font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 12px; margin-top: 16px;">
                  Søknads-ID: ${docRef.id} • Registrert via www.hkpc.no/admission
                </div>
              </div>
            `
          }
        });
      } catch (emailErr) {
        console.warn("Kunne ikke sende e-postvarsel, men søknaden er lagret i Firestore:", emailErr);
      }

      // 3. Webhook til Google Sheets (miljøvariabel med fallback til aktiv implementering)
      const sheetsWebhook = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbwxK3zY_Rwt532uyH1G37saGVH5mS3Iq_7palJufHOUOKaEK_mKle9k9ojvM_GKwSHBwA/exec';
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
      code: "TRACK 1 (YEAR 1)",
      title: "His Kingdom Prophetic Community",
      duration: language === 'en' ? "1 Year • English • On-site Kickoff Aug 27" : "1 År • Engelsk • Kickoff i Norge 27. aug",
      credits: "1. År / Year 1",
      priceSemester: language === 'en' ? "$500 USD" : "5 000,-",
      priceYear: language === 'en' ? "$1,000 USD" : "10 000,-",
      isLocked: false,
      features: language === 'en' ? [
        "All instruction & teaching conducted in English",
        "On-site kickoff gathering in Norway August 27, 2027",
        "Tuition: $500 USD / semester ($1,000 USD full year)",
        "Admin startup fee: $50 USD",
        "Kickoff room & board: $50 USD (own hotel not covered)",
        "Grow in relationship with Jesus & gifts of the Spirit",
        "Prophecy 101, How to Hear God, Gift vs Office",
        "Join year after year (different subjects yearly)"
      ] : [
        "All undervisning og veiledning foregår på engelsk",
        "On-site kickoff-samling i Norge 27. august 2027",
        "Studieavgift: 5 000,- per semester (10 000,- fullt år)",
        "Admin oppstartsgebyr: 500,-",
        "Kost og losji for kickoff-helgen: 500,- (egenvalgt hotell dekkes ikke)",
        "Vokse i relasjon med Jesus og Åndens gaver",
        "Profeti 101, Å høre Guds stemme, Gave vs Tjeneste",
        "Kan tas år etter år med nye temaer hvert år"
      ]
    },
    {
      id: "prophets_advanced",
      code: "TRACK 2 (YEAR 2)",
      title: "His Kingdom Prophets (Oppstart 2028)",
      duration: language === 'en' ? "Starts in 2028 (Requires Track 1)" : "Starter i 2028 (Krever 1. År)",
      credits: "2. År / Year 2",
      priceSemester: language === 'en' ? "$500 USD" : "5 000,-",
      priceYear: language === 'en' ? "$1,000 USD" : "10 000,-",
      isLocked: true,
      features: language === 'en' ? [
        "Specifically for those called to the office of a prophet (Launches 2028)",
        "Tuition: $500 USD / semester ($1,000 USD full year)",
        "Requires separate reapplication & prayer evaluation",
        "Reading list, paper writing & physical SUPER CHARGE",
        "PREREQUISITE: Must complete Track 1 (1st Year) first"
      ] : [
        "Spesifikt for de kalt til embetet som profet (Oppstart 2028)",
        "Studieavgift: 5 000,- per semester (10 000,- fullt år)",
        "Krever ny søknad, pensumliste og skriftlig oppgave",
        "Krav om deltakelse på 1-2 ukers fysisk samling",
        "FORKUNNSKAP: Må ha fullført 1. år (Track 1) først"
      ]
    }
  ];

  const selectedProg = programs.find(p => p.id === formData.program) || programs[0];

  return (
    <div className="bg-[#F6F4F8] text-[#271f30] font-sans min-h-screen">
      
      {/* Site Header */}
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#561291] to-[#3b0b66] text-white py-16 px-6 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-[#D7B978]/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6 sm:space-y-8">
          <div className="inline-block">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-white font-semibold text-xs sm:text-sm uppercase tracking-widest border border-white/20 shadow-sm">
              <Award size={15} className="text-[#D7B978]" />
              <CmsText slug="admission-hero-tagline" fallback={language === 'en' ? "Application Period: January 1 – June 30, 2027" : "Søkeperiode: 1. januar – 30. juni 2027"} />
            </span>
          </div>

          <CmsText 
            slug="admission-hero-title" 
            fallback={language === 'en' ? "Be Equipped for Your God-Given Ministry" : "Bli utrustet til din gudgitte tjeneste"} 
            as="h1"
            className="font-sans text-3xl sm:text-5xl font-extrabold leading-snug sm:leading-[1.25] tracking-normal max-w-3xl mx-auto text-white"
          />

          <CmsText 
            slug="admission-hero-subtitle" 
            fallback={language === 'en' ? "Application period: January 1 – June 30, 2027. On-site kickoff in Norway August 27, 2027. All teaching is conducted in English." : "Søkeperioden er fra 1. januar til 30. juni 2027, med on-site kickoff i Norge 27. august 2027. All undervisning foregår på engelsk."} 
            as="p"
            className="text-base sm:text-lg text-[#E5DDED] font-medium max-w-2xl mx-auto leading-relaxed pt-1"
          />

          <div className="pt-4">
            <a 
              href="#apply-form"
              className="px-8 py-3.5 bg-[#D7B978] hover:bg-[#c4a565] text-[#561291] font-bold text-sm sm:text-base font-sans uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
            >
              <span><CmsText slug="admission-hero-cta" fallback={language === 'en' ? "Fill Out Application Form" : "Gå til søknadsskjema"} /></span>
              <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        
        {/* SECTION 1: PROGRAMS GRID */}
        <section className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <CmsText 
              slug="admission-programs-title" 
              fallback={language === 'en' ? "Our Study Lines and Courses" : "Våre Studielinjer og Fag"} 
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
                    <span className="text-xs font-bold text-[#b58c38] uppercase tracking-wider">
                      <CmsText slug={`admission-${prog.id}-credits`} fallback={prog.credits} />
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
                      <CmsText slug="admission-tuition-fee-label" fallback={language === 'en' ? "Tuition Fee" : "Semesteravgift"} />
                    </span>
                    <span className="font-sans text-xl font-extrabold text-[#561291]">
                      <CmsText slug={`admission-${prog.id}-price`} fallback={prog.priceSemester} />
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
        <section className="bg-white border border-[#e2dce7]/70 rounded-3xl p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Payment Description */}
            <div className="space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#561291]/10 text-[#561291] font-bold text-xs uppercase tracking-wider select-none">
                <CreditCard size={14} />
                <CmsText slug="admission-payments-tag" fallback={language === 'en' ? "Flexible Payments and Tuition" : "Fleksibel Betaling og Priser"} />
              </span>

              <CmsText 
                slug="admission-payments-title" 
                fallback={language === 'en' ? "Invest in Your Future Without Financial Stress" : "Invester i din fremtid uten økonomisk stress"} 
                as="h2"
                className="font-sans text-2xl sm:text-3xl font-bold text-[#561291] leading-tight"
              />

              <CmsText 
                slug="admission-payments-desc" 
                fallback={language === 'en' ? "At His Kingdom Prophets, we want prophetic education to be accessible to all. We offer transparent and predictable payment arrangements tailored to your situation. You can pay the full semester fee at once or distribute it over interest-free monthly installments." : "Hos His Kingdom Prophets ønsker vi at den profetiske utdanningen skal være tilgjengelig for alle. Vi tilbyr ryddige og forutsigbare betalingsordninger tilpasset din situasjon. Du kan betale hele semesteravgiften under ett, eller fordele den over rentefrie månedlige rater."} 
                as="p"
                className="text-base text-slate-700 font-normal leading-relaxed"
              />

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-green-50 text-green-600 rounded-full shrink-0 mt-0.5">
                    <Check size={16} className="stroke-[3]" />
                  </div>
                  <div>
                    <CmsText slug="admission-payments-bullet1-title" fallback={language === 'en' ? "100% Interest-Free Installments" : "100 % rentefri delbetaling"} as="h4" className="text-base font-bold text-[#561291]" />
                    <CmsText slug="admission-payments-bullet1-desc" fallback={language === 'en' ? "The semester fee can be distributed over 5 monthly installments throughout the semester." : "Semesteravgiften kan fordeles over 5 månedlige rater gjennom semesteret."} as="p" className="text-base text-slate-600 mt-1 leading-relaxed font-normal" />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-green-50 text-green-600 rounded-full shrink-0 mt-0.5">
                    <Check size={16} className="stroke-[3]" />
                  </div>
                  <div>
                    <CmsText slug="admission-payments-bullet2-title" fallback={language === 'en' ? "All-Inclusive Tuition Fee" : "Alt inkludert i avgiften"} as="h4" className="text-base font-bold text-[#561291]" />
                    <CmsText slug="admission-payments-bullet2-desc" fallback={language === 'en' ? "The fee covers study workbooks, 1-on-1 mentoring, Zoom gatherings, full access to the student portal and the video archives." : "Semesteravgiften dekker studiehefter, 1-til-1 samtaler, Zoom-møter, full tilgang til studentportalen og videoarkivet."} as="p" className="text-base text-slate-600 mt-1 leading-relaxed font-normal" />
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
            <div className="bg-[#F6F4F8] border border-slate-200/70 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex bg-white p-1 rounded-xl shadow-sm select-none border border-slate-200/50">
                <button
                  onClick={() => setActivePlan('semester')}
                  className={`flex-1 py-2.5 text-sm sm:text-base font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                    activePlan === 'semester'
                      ? 'bg-[#561291] text-white shadow-sm'
                      : 'text-slate-600 hover:text-[#561291]'
                  }`}
                >
                  <CmsText slug="admission-price-plan-semester" fallback={language === 'en' ? "Semester Fee" : "Semesteravgift"} />
                </button>
                <button
                  onClick={() => setActivePlan('year')}
                  className={`flex-1 py-2.5 text-sm sm:text-base font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                    activePlan === 'year'
                      ? 'bg-[#561291] text-white shadow-sm'
                      : 'text-slate-600 hover:text-[#561291]'
                  }`}
                >
                  <CmsText slug="admission-price-plan-year" fallback={language === 'en' ? "Full Academic Year" : "Fullt studieår"} />
                </button>
              </div>

              <div className="text-center space-y-3">
                <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-widest block">
                  {activePlan === 'semester' ? (
                    <CmsText slug="admission-price-subhead-semester" fallback={language === 'en' ? "Tuition per semester" : "Studieavgift per semester"} />
                  ) : (
                    <CmsText slug="admission-price-subhead-year" fallback={language === 'en' ? "Full academic year (2 semesters)" : "Fullt studieår (2 semestre)"} />
                  )}
                </span>
                
                <div className="font-sans text-3xl sm:text-5xl font-extrabold text-[#561291]">
                  {language === 'en' ? (
                    activePlan === 'semester' ? "$500 USD" : "$1,000 USD"
                  ) : (
                    activePlan === 'semester' ? (
                      <CmsText slug="admission-price-amount-semester" fallback="5 000,- NOK" />
                    ) : (
                      <CmsText slug="admission-price-amount-year" fallback="10 000,- NOK" />
                    )
                  )}
                </div>
                
                <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed max-w-sm mx-auto">
                  {language === 'en'
                    ? "*In addition: $50 USD admin/startup fee and $50 USD room & board for the kickoff weekend. (Self-chosen hotel during kickoff weekend is not covered by the school)."
                    : "*I tillegg: 500 kr i admin oppstart og 500 kr for kost og losji for kickoff-helgen. (Hvis man skal bo på egenvalgt hotell i kickoff-helgen dekker skolen ikke dette)."}
                </p>
              </div>

              <div className="w-full h-[1px] bg-slate-200/70" />

              <div className="space-y-3 text-base text-slate-700 font-medium font-sans">
                <div className="flex justify-between items-center">
                  <span><CmsText slug="admission-price-row1-label" fallback={language === 'en' ? "Admin / Startup fee" : "Admin / oppstartsgebyr"} /></span>
                  <span className="text-[#561291] font-bold"><CmsText slug="admission-price-row1-val" fallback={language === 'en' ? "$50 USD" : "500,- NOK"} /></span>
                </div>
                <div className="flex justify-between items-center">
                  <span><CmsText slug="admission-price-row2-label" fallback={language === 'en' ? "Kickoff weekend room & board" : "Kickoff-helg kost og losji"} /></span>
                  <span className="text-[#561291] font-bold"><CmsText slug="admission-price-row2-val" fallback={language === 'en' ? "$50 USD" : "500,- NOK"} /></span>
                </div>
                <div className="flex justify-between items-center">
                  <span><CmsText slug="admission-price-row3-label" fallback={language === 'en' ? "Assigned Personal Mentor" : "Tildelt Personlig Mentor"} /></span>
                  <span className="text-green-600 font-bold"><CmsText slug="admission-price-row3-val" fallback={language === 'en' ? "Included" : "Inkludert"} /></span>
                </div>
                <div className="flex justify-between items-center">
                  <span><CmsText slug="admission-price-row4-label" fallback={language === 'en' ? "Digital Study Platform & Lectures" : "Digital studieportal & forelesninger"} /></span>
                  <span className="text-green-600 font-bold"><CmsText slug="admission-price-row4-val" fallback={language === 'en' ? "Included" : "Inkludert"} /></span>
                </div>
                <div className="flex justify-between items-center">
                  <span><CmsText slug="admission-price-row5-label" fallback={language === 'en' ? "Spouse Partner Discount" : "Ektefelle/Familierabatt"} /></span>
                  <span className="text-[#b58c38] font-bold"><CmsText slug="admission-price-row5-val" fallback="-25%" /></span>
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
                fallbackDesc: language === 'en' ? "Select your standard billing plan. Spouses enjoy automatic 25% off." : "Velg din foretrukne betalingsordning (semester eller månedlig delbetaling)."
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

        {/* SECTION 4: INTERACTIVE 4-STEP APPLICATION FORM */}
        <section id="apply-form" className="bg-white border border-[#e2dce7]/70 rounded-3xl p-6 sm:p-10 shadow-lg max-w-4xl mx-auto scroll-mt-24">
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
                      {language === 'en' 
                        ? "No account required to apply – Login credentials are issued upon approved admission" 
                        : "Ingen forhåndskonto kreves – Brukerkonto tildeles av administrasjonen etter godkjent opptak"}
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
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {[
                      { step: 1, title: language === 'en' ? "1. Details" : "1. Personalia" },
                      { step: 2, title: language === 'en' ? "2. Program" : "2. Studielinje" },
                      { step: 3, title: language === 'en' ? "3. Background" : "3. Bakgrunn" },
                      { step: 4, title: language === 'en' ? "4. Reference" : "4. Referanse" }
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
                        className={`py-2 px-2 text-center text-xs font-bold rounded-xl transition-all duration-200 ${
                          currentStep === item.step
                            ? 'bg-[#561291] text-white shadow-sm'
                            : currentStep > item.step
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-slate-50 text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>

                  {/* Draft Auto-Saved Indicator & Reset Option */}
                  {hasDraft && (
                    <div className="flex flex-wrap items-center justify-between gap-2 p-3 px-4 bg-emerald-50/90 border border-emerald-200/80 rounded-2xl text-xs text-emerald-900 shadow-xs">
                      <div className="flex items-center gap-2 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>
                          {language === 'en' 
                            ? "Draft auto-saved on this device" 
                            : "Søknaden lagres automatisk på denne enheten"}
                        </span>
                        {draftSavedAt && (
                          <span className="text-emerald-700/70 hidden sm:inline">
                            • {language === 'en' ? "Last saved" : "Sist lagret"} {draftSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={clearDraft}
                        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-red-600 font-semibold transition-colors underline decoration-slate-300 underline-offset-2 hover:decoration-red-400"
                      >
                        <RotateCcw size={13} />
                        <span>{language === 'en' ? "Clear & start over" : "Nullstill skjema"}</span>
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
                          {language === 'en' ? "1. Personal Information & Contact" : "1. Personalia & Kontaktinformasjon"}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
                            {language === 'en' ? "Full Name *" : "Fullt navn *"}
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
                            {language === 'en' ? "Gender *" : "Kjønn *"}
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {['Mann', 'Kvinne'].map((g) => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => updateFieldValue('gender', g)}
                                className={`py-3 px-4 rounded-xl border text-sm sm:text-base font-bold transition-all duration-200 ${
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
                          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
                            {language === 'en' ? "Date of Birth *" : "Fødselsdato *"}
                          </label>
                          <input
                            type="date"
                            name="birthDate"
                            required
                            lang={language === 'en' ? "en-US" : "no"}
                            value={formData.birthDate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#561291]/60 focus:ring-2 focus:ring-[#561291]/15 text-base rounded-xl focus:outline-none placeholder:text-slate-400 font-normal transition-all"
                          />
                          <p className="text-[11px] text-slate-500 font-normal">
                            {language === 'en' ? "Format: MM/DD/YYYY (or pick from calendar)" : "Format: DD.MM.ÅÅÅÅ (eller velg i kalenderen)"}
                          </p>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
                            {language === 'en' ? "Email Address *" : "E-postadresse *"}
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
                            {language === 'en' ? "Phone Number *" : "Mobiltelefon *"}
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
                            {language === 'en' ? "Occupation / Education *" : "Yrke / utdannelse *"}
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
                          {language === 'en' ? "Residential Address *" : "Bostedsadresse *"}
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
                          {language === 'en' ? "Marital Status *" : "Sivilstatus *"}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {['Gift', 'Ugift', 'Forlovet', 'Separert / skilt', 'Enke / enkemann'].map((ms) => (
                            <button
                              key={ms}
                              type="button"
                              onClick={() => updateFieldValue('maritalStatus', ms)}
                              className={`py-2.5 px-2 rounded-xl border text-xs sm:text-sm font-bold transition-all duration-200 text-center ${
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
                          className="w-full sm:w-auto px-4 py-3 text-slate-600 hover:text-[#561291] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-medium text-sm transition-all duration-200 inline-flex items-center justify-center gap-2"
                        >
                          <Save size={16} />
                          <span>{language === 'en' ? "Save Draft & Continue Later" : "Lagre kladd & fortsett senere"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="w-full sm:w-auto px-8 py-3.5 bg-[#D7B978] hover:bg-[#c4a565] text-[#561291] font-bold text-base uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2"
                        >
                          <span>{language === 'en' ? "Next: Study Line & Payment" : "Neste: Studielinje & betaling"}</span>
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
                          {language === 'en' ? "2. Program Track & Tuition Agreement" : "2. Studielinje & Betalingsordning"}
                        </h4>
                      </div>

                      {/* Program Choice */}
                      <div className="space-y-3">
                        <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
                          {language === 'en' ? "Select Study Line *" : "Velg studielinje *"}
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
                                  <h5 className="font-bold text-base text-[#561291] pt-1">{p.title}</h5>
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
                                <span className="text-slate-500 font-semibold">{language === 'en' ? "Semester Tuition:" : "Semesteravgift:"}</span>
                                <span className="font-bold text-[#561291] text-sm">{p.priceSemester}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Billing Plan */}
                      <div className="space-y-3">
                        <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
                          {language === 'en' ? "Preferred Billing Plan *" : "Foretrukket betalingsplan *"}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <label className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                            formData.paymentPlan === 'semester'
                              ? 'border-[#561291] bg-[#561291]/5 text-[#561291]'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}>
                            <div className="space-y-0.5">
                              <span className="text-base font-bold block">
                                {language === 'en' ? "Semester Invoice" : "Semesterfaktura"}
                              </span>
                              <span className="text-xs text-slate-500">
                                {selectedProg.priceSemester} per semester
                              </span>
                            </div>
                            <input
                              type="radio"
                              name="paymentPlan"
                              value="semester"
                              checked={formData.paymentPlan === 'semester'}
                              onChange={handleInputChange}
                              className="accent-[#561291] w-4 h-4"
                            />
                          </label>

                          <label className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                            formData.paymentPlan === 'year'
                              ? 'border-[#561291] bg-[#561291]/5 text-[#561291]'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}>
                            <div className="space-y-0.5">
                              <span className="text-base font-bold block">
                                {language === 'en' ? "Full Academic Year" : "Fullt studieår"}
                              </span>
                              <span className="text-xs text-slate-500">
                                {selectedProg.priceYear || '10 000,- NOK'} for hele året
                              </span>
                            </div>
                            <input
                              type="radio"
                              name="paymentPlan"
                              value="year"
                              checked={formData.paymentPlan === 'year'}
                              onChange={handleInputChange}
                              className="accent-[#561291] w-4 h-4"
                            />
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
                              {language === 'en' ? "Instruction Language & Kickoff Gathering Agreement *" : "Bekreftelse på undervisningsspråk & kickoff-samling *"}
                            </span>
                            {language === 'en'
                              ? "I confirm that I understand all instruction and materials are conducted in English, with an on-site kickoff gathering in Norway on August 27, 2027."
                              : "Jeg bekrefter at jeg er innforstått med at all undervisning foregår på engelsk via nett, med en obligatorisk/anbefalt kickoff-samling i Norge 27. august 2027."}
                          </div>
                        </label>
                      </div>

                      {/* Track 2 Prerequisite Checkbox (if applicable) */}
                      {formData.program === 'prophets_advanced' && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                          <div className="flex gap-2.5 text-amber-900 text-sm">
                            <Lock size={16} className="shrink-0 mt-0.5" />
                            <p className="font-medium leading-relaxed">
                              {language === 'en'
                                ? "This program (Track 2) launches in 2028. To apply, you must confirm that you plan to complete or have completed Track 1 (His Kingdom Prophetic Community) first."
                                : "Dette studieløpet (Track 2) starter ikke før i 2028. For å søke opptak, må du bekrefte at du har fullført eller planlegger å fullføre 1. år (Track 1) først."}
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
                              {language === 'en'
                                ? "I confirm that I plan to complete or have completed Track 1 first *"
                                : "Jeg bekrefter at jeg har fullført eller planlegger å fullføre 1. år først *"}
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
                            className="flex-1 sm:flex-initial px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base uppercase tracking-wider rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2"
                          >
                            <ArrowLeft size={18} />
                            <span>{language === 'en' ? "Back" : "Tilbake"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              saveDraft(formData, currentStep);
                              showToast(language === 'en' ? "Draft saved! You can resume anytime." : "Kladd lagret! Du kan lukke siden og fortsette senere.");
                            }}
                            className="flex-1 sm:flex-initial px-4 py-3 text-slate-600 hover:text-[#561291] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-medium text-sm transition-all duration-200 inline-flex items-center justify-center gap-2"
                          >
                            <Save size={16} />
                            <span>{language === 'en' ? "Save Draft" : "Lagre kladd"}</span>
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="w-full sm:w-auto px-8 py-3.5 bg-[#D7B978] hover:bg-[#c4a565] text-[#561291] font-bold text-base uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2"
                        >
                          <span>{language === 'en' ? "Next: Spiritual Background" : "Neste: Åndelig bakgrunn"}</span>
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
                          {language === 'en' ? "3. Spiritual Walk, Calling & Motivation" : "3. Åndelig Bakgrunn, Vandring & Motivasjon"}
                        </h4>
                      </div>

                      {/* Q1: whySeeking */}
                      <div className="space-y-1.5 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
                        <label className="text-sm font-bold text-[#561291] block">
                          {language === 'en' ? "Why are you applying to Bible school? *" : "Hvorfor søker du bibelskole? *"}
                        </label>
                        <p className="text-xs text-slate-500 font-normal">
                          {language === 'en' ? "What inspires you to set aside this year to grow?" : "Hva motiverer deg til å sette av dette året til å vokse?"}
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
                          {language === 'en' ? "What do you expect from the school year and community? *" : "Hva forventer du deg av skoleåret og fellesskapet? *"}
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
                          {language === 'en' ? "How did you hear about HKPC, and why are you applying here? *" : "Hvordan hørte du om His Kingdom Prophetic Community, og hvorfor søker du her? *"}
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
                          {language === 'en' ? "Share a bit about your experience with Jesus *" : "Skriv litt om din erfaring og vandring med Jesus *"}
                        </label>
                        <p className="text-xs text-slate-500 font-normal">
                          {language === 'en' ? "Your salvation testimony and how your daily relationship with God looks like." : "Din frelsesopplevelse og hvordan hverdagen din med Jesus ser ut."}
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
                          {language === 'en' ? "Do you belong to a local church / community? If yes, which one? *" : "Tilhører du en menighet? Hvis ja, hvilken? *"}
                        </label>
                        <p className="text-xs text-slate-500 font-normal">
                          {language === 'en' ? "Church name, location, and optionally pastor/leader name." : "Navn på menighet/fellesskap, sted og eventuelt pastor/leder."}
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
                          {language === 'en' ? "Are you in any form of ministry or volunteer work? If yes, please describe *" : "Er du i en form for tjeneste eller frivillig arbeid? Hvis ja, skriv litt om det *"}
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
                          {language === 'en' ? "What ministry or spiritual gift do you feel called to grow in? *" : "Hvilken tjeneste kunne du tenke deg å være i / nådegave å vokse i? *"}
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
                          {language === 'en' ? "Tell us a bit about your dreams and visions *" : "Si litt om dine drømmer og visjoner *"}
                        </label>
                        <p className="text-xs text-slate-500 font-normal">
                          {language === 'en' ? "What has God placed on your heart for His kingdom and people?" : "Hva har Gud lagt på hjertet ditt for Hans rike og mennesker rundt deg?"}
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
                          {language === 'en' ? "What do you like to do? (Hobbies and leisure interests) *" : "Hva liker du å gjøre? (hobbyer / fritidsinteresser) *"}
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
                            className="flex-1 sm:flex-initial px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base uppercase tracking-wider rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2"
                          >
                            <ArrowLeft size={18} />
                            <span>{language === 'en' ? "Back" : "Tilbake"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              saveDraft(formData, currentStep);
                              showToast(language === 'en' ? "Draft saved! You can resume anytime." : "Kladd lagret! Du kan lukke siden og fortsette senere.");
                            }}
                            className="flex-1 sm:flex-initial px-4 py-3 text-slate-600 hover:text-[#561291] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-medium text-sm transition-all duration-200 inline-flex items-center justify-center gap-2"
                          >
                            <Save size={16} />
                            <span>{language === 'en' ? "Save Draft" : "Lagre kladd"}</span>
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="w-full sm:w-auto px-8 py-3.5 bg-[#D7B978] hover:bg-[#c4a565] text-[#561291] font-bold text-base uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2"
                        >
                          <span>{language === 'en' ? "Next: Reference & Final Review" : "Neste: Referanse & fullfør"}</span>
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
                          {language === 'en' ? "4. Reference & Final Submission" : "4. Referanse & Innsending"}
                        </h4>
                      </div>

                      {/* Reference */}
                      <div className="space-y-1.5 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
                        <label className="text-sm font-bold text-[#561291] block">
                          {language === 'en' ? "Reference (Pastor, leader, or trusted mature Christian) *" : "Referanse (Pastor, leder eller annen betrodd person) *"}
                        </label>
                        <p className="text-xs text-slate-500 font-normal">
                          {language === 'en' 
                            ? "Please include: Full Name, Relationship/Title, Phone number, and Email address." 
                            : "Vennligst oppgi: Fullt navn, relasjon/rolle, telefonnummer og e-postadresse."}
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
                          {language === 'en' ? "Other notes or health considerations (Optional)" : "Annet du ønsker at vi skal vite om deg (Valgfritt)"}
                        </label>
                        <p className="text-xs text-slate-500 font-normal">
                          {language === 'en' 
                            ? "Health conditions, special needs, or any additional context you wish to share." 
                            : "Eventuelle helsemessige hensyn, spesielle behov, eller andre opplysninger du vil dele med ledelsen."}
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
                          <span>{language === 'en' ? "Application Summary" : "Oppsummering av søknaden"}</span>
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-slate-500 block text-xs uppercase font-semibold">{language === 'en' ? "Applicant" : "Søker"}</span>
                            <span className="font-bold text-slate-800">{formData.name || '-'} ({formData.gender || '-'})</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs uppercase font-semibold">{language === 'en' ? "Email / Phone" : "E-post & telefon"}</span>
                            <span className="font-bold text-slate-800">{formData.email} • {formData.phone}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs uppercase font-semibold">{language === 'en' ? "Study Line" : "Studielinje"}</span>
                            <span className="font-bold text-[#561291]">{selectedProg.title}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs uppercase font-semibold">{language === 'en' ? "Billing Plan" : "Betalingsordning"}</span>
                            <span className="font-bold text-[#561291]">
                              {formData.paymentPlan === 'year' ? "Fullt studieår" : "Semesterfaktura"}
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
                            className="flex-1 sm:flex-initial px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base uppercase tracking-wider rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2"
                          >
                            <ArrowLeft size={18} />
                            <span>{language === 'en' ? "Back" : "Tilbake"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              saveDraft(formData, currentStep);
                              showToast(language === 'en' ? "Draft saved! You can resume anytime." : "Kladd lagret! Du kan lukke siden og fortsette senere.");
                            }}
                            className="flex-1 sm:flex-initial px-4 py-3 text-slate-600 hover:text-[#561291] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-medium text-sm transition-all duration-200 inline-flex items-center justify-center gap-2"
                          >
                            <Save size={16} />
                            <span>{language === 'en' ? "Save Draft" : "Lagre kladd"}</span>
                          </button>
                        </div>
                        
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full sm:w-auto px-10 py-4 bg-[#D7B978] hover:bg-[#c4a565] text-[#561291] font-bold text-base font-sans uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2.5 disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-5 h-5 rounded-full border-2 border-[#561291]/30 border-t-[#561291] animate-spin" />
                              <span>{language === 'en' ? "Submitting Application..." : "Sender inn søknad..."}</span>
                            </>
                          ) : (
                            <>
                              <Send size={18} />
                              <span>{language === 'en' ? "Submit Application" : "Send Inn Min Søknad"}</span>
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
                    {language === 'en' ? "Application Received" : "Søknad registrert"}
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
                        {language === 'en' ? "Next Steps: Review & Account Assignment" : "Veien videre: Opptaksbehandling & tildeling av konto"}
                      </h4>
                      <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                        {language === 'en'
                          ? "We review all applications continuously and will contact you for a brief conversation. Upon approved admission, your personal user account and portal login credentials will be issued directly by the school administration."
                          : "Vi behandler søknader fortløpende og kontakter deg for en kort samtale. Når opptaket er godkjent, vil din personlige brukerkonto og innloggingsdetaljer til portalen bli opprettet og tildelt direkte av skolens administrasjon."}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[#e2dce7]/40 pt-3.5 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500 text-xs uppercase font-bold block">{language === 'en' ? "Program" : "Studielinje"}</span>
                      <span className="font-bold text-[#561291]">{programs.find(p => p.id === formData.program)?.code}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase font-bold block">{language === 'en' ? "Kickoff" : "Kickoff"}</span>
                      <span className="font-bold text-[#561291]">27. aug 2027 (Norge)</span>
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
        </section>

      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
