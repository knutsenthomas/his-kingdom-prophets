import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, BookOpen, CreditCard, ChevronRight, Check, 
  HelpCircle, ArrowLeft, Send, Award, Calendar, FileText, CheckCircle2, Globe, Lock, GraduationCap
} from 'lucide-react';
import logo from '@/assets/logo.png';
import CmsText from '@/components/CmsText';

export default function AdmissionPage() {
  const navigate = useNavigate();
  const { language, toggleLanguage, showToast, user } = useApp();

  const stripePublicKey = "pk_live_51Pab8rAL393JGrO9bTUitYflDKlHGpLiqZCCBp0dCzBEV3ZFxARFfK6MgWraehq7i79tJHPIEzlpMwPiT2K3HsiZ00gJ1TQ71Y";

  // Multi-step Application Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    program: 'prophetic_community',
    paymentPlan: 'semester',
    motivation: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePlan, setActivePlan] = useState('semester'); // semester, monthly
  const [confirmYear1, setConfirmYear1] = useState(false);
  
  const [stripeElements, setStripeElements] = useState(null);
  const [stripeInstance, setStripeInstance] = useState(null);
  const [paymentStep, setPaymentStep] = useState('form'); // 'form', 'payment', 'success'
  const [clientSecret, setClientSecret] = useState('');
  const [paymentError, setPaymentError] = useState('');

  // Dynamically load Stripe JS
  useEffect(() => {
    if (!window.Stripe) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = () => {
        console.log('Stripe SDK loaded');
      };
      document.body.appendChild(script);
    }
  }, []);

  // Prepopulate form if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
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
          // Update user role to student
          await setDoc(doc(db, "users", user.uid), { role: 'student' }, { merge: true });
          
          // Sync local storage cache
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

  // Mount Stripe elements when entering 'payment' step
  useEffect(() => {
    if (paymentStep === 'payment' && clientSecret && window.Stripe && !stripeElements) {
      const stripe = window.Stripe(stripePublicKey);
      setStripeInstance(stripe);

      const appearance = {
        theme: 'stripe',
        variables: {
          colorPrimary: '#3c096c',
          colorBackground: '#ffffff',
          colorText: '#30313d',
          colorDanger: '#df1b41',
          fontFamily: 'Inter, system-ui, sans-serif',
          spacingUnit: '4px',
          borderRadius: '12px',
        },
      };

      const elementsOptions = {
        appearance,
        clientSecret,
      };

      const els = stripe.elements(elementsOptions);
      setStripeElements(els);

      const paymentElementOptions = {
        layout: "tabs",
      };

      const paymentElement = els.create("payment", paymentElementOptions);
      
      // Wait for DOM layout to stabilize, then mount
      setTimeout(() => {
        const container = document.getElementById("hkm-stripe-element");
        if (container) {
          paymentElement.mount("#hkm-stripe-element");
        }
      }, 150);
    }
  }, [paymentStep, clientSecret, stripeElements]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.email?.trim() || !formData.phone?.trim()) {
      showToast(language === 'en' ? "Please fill out all required fields." : "Vennligst fyll ut alle påkrevde felt.");
      return;
    }

    if (formData.program === 'prophets_advanced' && !confirmYear1) {
      showToast(language === 'en' ? "Please confirm that you plan to complete Track 1 first." : "Vennligst bekreft at du har fullført eller planlegger å fullføre 1. år først.");
      return;
    }

    setIsSubmitting(true);
    setPaymentError('');

    try {
      const { db } = await import('@/firebase');
      const { collection, addDoc, serverTimestamp, doc, setDoc } = await import('firebase/firestore');

      const prog = programs.find(p => p.id === formData.program) || programs[0];

      // 1. Lagre søknad i Firestore 'applications' for administrasjonens opptaksbehandling
      await addDoc(collection(db, "applications"), {
        userId: user?.uid || null,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        programId: formData.program,
        programTitle: prog.title,
        programCode: prog.code,
        paymentPlan: formData.paymentPlan,
        motivation: formData.motivation ? formData.motivation.trim() : '',
        status: "pending_review",
        createdAt: serverTimestamp()
      });

      // 2. Send e-postvarsel til administrasjonen via 'support_emails'
      try {
        const emailRef = doc(collection(db, "support_emails"));
        await setDoc(emailRef, {
          to: 'hiskingdomprophets@hiskingdomministry.no',
          replyTo: formData.email.trim(),
          message: {
            subject: `[HKM Opptak] Ny søknad: ${formData.name.trim()} (${prog.code})`,
            text: `Ny søknad om opptak ved His Kingdom Prophetic Community:\n\nNavn: ${formData.name.trim()}\nE-post: ${formData.email.trim()}\nTelefon: ${formData.phone.trim()}\nStudielinje: ${prog.title} (${prog.code})\nBetalingsplan: ${formData.paymentPlan === 'year' ? 'Fullt studieår' : 'Semesterfaktura'}\n\nMotivasjon / Bakgrunn:\n${formData.motivation?.trim() || 'Ikke oppgitt'}`,
            html: `
              <div style="font-family: sans-serif; padding: 24px; color: #240046; max-width: 600px; border: 1px solid #dec2ef; border-radius: 12px;">
                <h2 style="color: #3c096c; border-bottom: 2px solid #561291; padding-bottom: 8px; margin-top: 0;">Ny søknad om opptak</h2>
                <p><strong>Navn:</strong> ${formData.name.trim()}</p>
                <p><strong>E-post:</strong> <a href="mailto:${formData.email.trim()}">${formData.email.trim()}</a></p>
                <p><strong>Telefon:</strong> ${formData.phone.trim()}</p>
                <p><strong>Studielinje:</strong> ${prog.title} (${prog.code})</p>
                <p><strong>Betalingsordning:</strong> ${formData.paymentPlan === 'year' ? 'Fullt studieår' : 'Semesterfaktura'}</p>
                <div style="background-color: #fbf8fe; padding: 16px; border-left: 4px solid #c5a059; margin-top: 16px; border-radius: 6px;">
                  <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 13px; color: #3c096c;">Motivasjon / Åndelig bakgrunn:</p>
                  <p style="margin: 0; white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #333;">${formData.motivation?.trim() || 'Ingen utfyllende tekst oppgitt.'}</p>
                </div>
                <p style="font-size: 11px; color: #888; margin-top: 24px; border-top: 1px solid #eee; padding-top: 8px;">
                  Registrert via www.hkpc.no/admission. Behandles av skolens administrasjon.
                </p>
              </div>
            `
          }
        });
      } catch (emailErr) {
        console.warn("Kunne ikke sende e-postvarsel, men søknaden er lagret i Firestore:", emailErr);
      }

      setPaymentStep('success');
      showToast(language === 'en' ? "Application submitted successfully!" : "Søknaden er sendt inn!");
    } catch (err) {
      console.error("Submission failed:", err);
      showToast(language === 'en' ? "Failed to submit application: " + err.message : "Kunne ikke sende søknad: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStripePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!stripeInstance || !stripeElements) return;

    setIsSubmitting(true);
    setPaymentError('');

    try {
      // Save pending application details to firestore
      const { db } = await import('@/firebase');
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      await addDoc(collection(db, "applications"), {
        userId: user.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        program: formData.program,
        paymentPlan: formData.paymentPlan,
        motivation: formData.motivation,
        status: "pending_payment",
        createdAt: serverTimestamp()
      });

      const { error } = await stripeInstance.confirmPayment({
        elements: stripeElements,
        confirmParams: {
          return_url: window.location.href.split('?')[0],
        },
      });

      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
          setPaymentError(error.message);
        } else {
          setPaymentError("En uventet feil oppstod: " + error.message);
        }
      }
    } catch (err) {
      console.error("Payment confirmation failed:", err);
      setPaymentError("Betalingsbekreftelsen feilet. Prøv igjen.");
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
    <div className="bg-[#faf7fc] text-[#240046] font-sans min-h-screen">
      
      {/* Mini Brand Header Navigation */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-[#dec2ef] px-6 py-4 shadow-sm select-none">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2.5 font-serif font-extrabold text-primary text-base transition-all active:scale-95"
          >
            <img src={logo} alt="Logo" className="w-8 h-8 object-contain shrink-0" />
            <span className="hidden sm:inline"><CmsText slug="layout-logo-title" fallback="His Kingdom Prophetic Community" /></span>
            <span className="inline sm:hidden"><CmsText slug="layout-logo-mobile-title" fallback="HKP" /></span>
          </button>
          
          <div className="flex items-center gap-3">
            {/* Language Switcher Toggle */}
            <button 
              onClick={toggleLanguage}
              className="px-3 py-1.5 border border-[#561291]/20 hover:border-primary text-xs font-bold uppercase rounded-lg text-primary bg-[#561291]/5 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm shrink-0"
              title={language === 'no' ? 'Bytt til engelsk (Switch to English)' : 'Bytt til norsk (Switch to Norwegian)'}
            >
              <Globe size={13} />
              <span>{language === 'no' ? 'NO' : 'EN'}</span>
            </button>

            <button 
              onClick={() => navigate('/')} 
              className="px-4 py-2 hover:bg-[#dec2ef]/20 rounded-xl text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1 transition-all"
            >
              <ArrowLeft size={14} />
              <span>{language === 'en' ? "Back to Home" : "Gå tilbake"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-[#561291] to-[#240046] text-white py-16 px-6 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6 sm:space-y-8">
          <div className="inline-block">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-on-primary-container font-semibold text-xs sm:text-sm uppercase tracking-widest border border-white/20 shadow-sm">
              <Award size={15} className="text-secondary-fixed-dim" />
              <CmsText slug="admission-hero-tagline" fallback={language === 'en' ? "Application Period: January 1 – June 30, 2027" : "Søkeperiode: 1. januar – 30. juni 2027"} />
            </span>
          </div>

          <CmsText 
            slug="admission-hero-title" 
            fallback={language === 'en' ? "Be Equipped for Your God-Given Ministry" : "Bli utrustet til din gudgitte tjeneste"} 
            as="h1"
            className="font-serif text-3xl sm:text-5xl font-extrabold leading-snug sm:leading-[1.25] tracking-normal max-w-3xl mx-auto text-white"
          />

          <CmsText 
            slug="admission-hero-subtitle" 
            fallback={language === 'en' ? "Application period: January 1 – June 30, 2027. On-site kickoff in Norway August 27, 2027. All teaching is conducted in English." : "Søkeperioden er fra 1. januar til 30. juni 2027, med on-site kickoff i Norge 27. august 2027. All undervisning foregår på engelsk."} 
            as="p"
            className="text-base sm:text-lg text-[#e0aaff] font-medium max-w-2xl mx-auto leading-relaxed pt-1"
          />

          <div className="pt-4">
            <a 
              href="#apply-form"
              className="px-8 py-3.5 bg-[#c5a059] hover:bg-[#b08e4f] text-white text-sm sm:text-base font-serif font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 inline-flex items-center gap-2"
            >
              <span><CmsText slug="admission-hero-cta" fallback={language === 'en' ? "Apply Now" : "Send Søknad Nå"} /></span>
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
              className="font-serif text-2xl sm:text-3xl font-bold text-primary"
            />
            <CmsText 
              slug="admission-programs-subtitle" 
              fallback={language === 'en' ? "Each course consists of 8 step-by-step modules integrating thorough theology with personal mentoring." : "Hvert fag består av 8 trinnvise moduler som integrerer grundig teologi med personlig mentorskap."} 
              as="p"
              className="text-base text-on-surface-variant font-medium leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {programs.map(prog => (
              <div 
                key={prog.id}
                className={`bg-white border rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden ${
                  prog.isLocked 
                    ? 'border-amber-200 hover:border-amber-300' 
                    : 'border-[#dec2ef]/55 hover:border-primary/20'
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
                        : 'bg-primary/5 text-primary border border-primary/10'
                    }`}>
                      <CmsText slug={`admission-${prog.id}-code`} fallback={prog.code} />
                    </span>
                    <span className="text-xs font-bold text-[#c5a059] uppercase tracking-wider">
                      <CmsText slug={`admission-${prog.id}-credits`} fallback={prog.credits} />
                    </span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-primary leading-snug">
                    <CmsText slug={`admission-${prog.id}-title`} fallback={prog.title} />
                  </h3>

                  <div className="flex items-center gap-2 text-sm sm:text-base text-slate-600 font-medium">
                    <Calendar size={16} className="text-primary/70 shrink-0" />
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
                    <span className="text-xs uppercase font-bold text-outline block">
                      <CmsText slug="admission-tuition-fee-label" fallback={language === 'en' ? "Tuition Fee" : "Semesteravgift"} />
                    </span>
                    <span className="font-serif text-xl font-extrabold text-primary">
                      <CmsText slug={`admission-${prog.id}-price`} fallback={prog.priceSemester} />
                    </span>
                  </div>
                  
                  <a 
                    href="#apply-form"
                    onClick={() => setFormData(prev => ({ ...prev, program: prog.id }))}
                    className="text-base font-bold text-primary hover:text-secondary flex items-center gap-1 font-sans"
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
        <section className="bg-white border border-[#dec2ef]/55 rounded-3xl p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Payment Description */}
            <div className="space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-secondary-container text-primary font-bold text-xs uppercase tracking-wider select-none">
                <CreditCard size={14} />
                <CmsText slug="admission-payments-tag" fallback={language === 'en' ? "Flexible Payments and Tuition" : "Fleksibel Betaling og Priser"} />
              </span>

              <CmsText 
                slug="admission-payments-title" 
                fallback={language === 'en' ? "Invest in Your Future Without Financial Stress" : "Invester i din fremtid uten økonomisk stress"} 
                as="h2"
                className="font-serif text-2xl sm:text-3xl font-bold text-primary leading-tight"
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
                    <CmsText slug="admission-payments-bullet1-title" fallback={language === 'en' ? "100% Interest-Free Installments" : "100 % rentefri delbetaling"} as="h4" className="text-base font-bold text-primary" />
                    <CmsText slug="admission-payments-bullet1-desc" fallback={language === 'en' ? "The semester fee can be distributed over 5 monthly installments throughout the semester." : "Semesteravgiften kan fordeles over 5 månedlige rater gjennom semesteret."} as="p" className="text-base text-slate-600 mt-1 leading-relaxed font-normal" />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-green-50 text-green-600 rounded-full shrink-0 mt-0.5">
                    <Check size={16} className="stroke-[3]" />
                  </div>
                  <div>
                    <CmsText slug="admission-payments-bullet2-title" fallback={language === 'en' ? "All-Inclusive Tuition Fee" : "Alt inkludert i avgiften"} as="h4" className="text-base font-bold text-primary" />
                    <CmsText slug="admission-payments-bullet2-desc" fallback={language === 'en' ? "The fee covers study workbooks, 1-on-1 mentoring, Zoom gatherings, full access to the student portal and the video archives." : "Semesteravgiften dekker studiehefter, 1-til-1 samtaler, Zoom-møter, full tilgang til studentportalen og videoarkivet."} as="p" className="text-base text-slate-600 mt-1 leading-relaxed font-normal" />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-green-50 text-green-600 rounded-full shrink-0 mt-0.5">
                    <Check size={16} className="stroke-[3]" />
                  </div>
                  <div>
                    <CmsText slug="admission-payments-bullet3-title" fallback={language === 'en' ? "Scholarships & Partner Discounts" : "Stipend og partner-rabatter"} as="h4" className="text-base font-bold text-primary" />
                    <CmsText slug="admission-payments-bullet3-desc" fallback={language === 'en' ? "Spouse discount, student discount, and special scholarship options for active church planters and missionary families." : "Ektepar-rabatt, studentrabatt og særskilte stipendordninger for aktive menighetsplantere og misjonærfamilier."} as="p" className="text-base text-slate-600 mt-1 leading-relaxed font-normal" />
                  </div>
                </div>
              </div>
            </div>

            {/* Symmetrical Pricing Card Comparison */}
            <div className="bg-[#faf7fc] border border-slate-200/60 rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-500">
              <div className="flex bg-white p-1 rounded-xl shadow-sm select-none border border-slate-100">
                <button
                  onClick={() => setActivePlan('semester')}
                  className={`flex-1 py-2.5 text-sm sm:text-base font-bold uppercase tracking-wider rounded-lg transition-all ${
                    activePlan === 'semester'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-outline hover:text-primary'
                  }`}
                >
                  <CmsText slug="admission-price-plan-semester" fallback={language === 'en' ? "Semester Fee" : "Semesteravgift"} />
                </button>
                <button
                  onClick={() => setActivePlan('year')}
                  className={`flex-1 py-2.5 text-sm sm:text-base font-bold uppercase tracking-wider rounded-lg transition-all ${
                    activePlan === 'year'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-outline hover:text-primary'
                  }`}
                >
                  <CmsText slug="admission-price-plan-year" fallback={language === 'en' ? "Full Academic Year" : "Fullt studieår"} />
                </button>
              </div>

              <div className="text-center space-y-3">
                <span className="text-xs sm:text-sm font-bold text-outline uppercase tracking-widest block">
                  {activePlan === 'semester' ? (
                    <CmsText slug="admission-price-subhead-semester" fallback={language === 'en' ? "Tuition per semester" : "Studieavgift per semester"} />
                  ) : (
                    <CmsText slug="admission-price-subhead-year" fallback={language === 'en' ? "Full academic year (2 semesters)" : "Fullt studieår (2 semestre)"} />
                  )}
                </span>
                
                <div className="font-serif text-3xl sm:text-5xl font-extrabold text-primary">
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

              <div className="w-full h-[1px] bg-slate-200/50" />

              <div className="space-y-3 text-base text-slate-700 font-medium font-sans">
                <div className="flex justify-between items-center">
                  <span><CmsText slug="admission-price-row1-label" fallback={language === 'en' ? "Admin / Startup fee" : "Admin / oppstartsgebyr"} /></span>
                  <span className="text-primary font-bold"><CmsText slug="admission-price-row1-val" fallback={language === 'en' ? "$50 USD" : "500,- NOK"} /></span>
                </div>
                <div className="flex justify-between items-center">
                  <span><CmsText slug="admission-price-row2-label" fallback={language === 'en' ? "Kickoff weekend room & board" : "Kickoff-helg kost og losji"} /></span>
                  <span className="text-primary font-bold"><CmsText slug="admission-price-row2-val" fallback={language === 'en' ? "$50 USD" : "500,- NOK"} /></span>
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
                  <span className="text-secondary font-bold"><CmsText slug="admission-price-row5-val" fallback="-25%" /></span>
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
              className="font-serif text-2xl sm:text-3xl font-bold text-primary"
            />
            <CmsText 
              slug="admission-steps-subtitle" 
              fallback={language === 'en' ? "Four simple steps from submitting your application to your approved study space and access." : "Fire enkle steg fra innsendt søknad til godkjent studieplass og tilgang."} 
              as="p"
              className="text-base text-on-surface-variant font-medium leading-relaxed"
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
                fallbackDesc: language === 'en' ? "Fill out the admission form below with your motivation and contact info." : "Fyll ut det enkle søknadsskjemaet nedenfor på under 3 minutter."
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
                fallbackDesc: language === 'en' ? "Get your login, workbook, study materials, and PWA mobile portal active instantly." : "Du får tilsendt brukerkonto og kan umiddelbart logge inn i portalen og starte studiet!"
              }
            ].map((stepObj, i) => (
              <div 
                key={i}
                className="bg-white border border-[#dec2ef]/45 p-6 rounded-2xl relative shadow-sm hover:shadow transition-all space-y-3"
              >
                <span className="font-serif text-3xl font-extrabold text-[#c5a059]/25 block">
                  <CmsText slug={stepObj.slugNum} fallback={stepObj.fallbackNum} />
                </span>
                <h4 className="font-serif text-base sm:text-lg font-bold text-primary font-sans">
                  <CmsText slug={stepObj.slugTitle} fallback={stepObj.fallbackTitle} />
                </h4>
                <p className="text-base text-slate-600 leading-relaxed font-normal">
                  <CmsText slug={stepObj.slugDesc} fallback={stepObj.fallbackDesc} />
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: INTERACTIVE APPLICATION FORM */}
        <section id="apply-form" className="bg-white border border-[#dec2ef]/65 rounded-3xl p-8 shadow-md max-w-2xl mx-auto scroll-mt-24">
          <AnimatePresence mode="wait">
            {paymentStep === 'form' ? (
              <motion.form 
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleFormSubmit}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                    <FileText size={22} />
                  </div>
                  <CmsText 
                    slug="admission-form-title" 
                    fallback={language === 'en' ? "Application for Admission" : "Søknad om opptak"} 
                    as="h3"
                    className="font-serif text-2xl font-bold text-primary"
                  />
                  <CmsText 
                    slug="admission-form-subtitle" 
                    fallback={language === 'en' ? "Fill in your details below. We process your application within 24 hours." : "Fyll inn opplysningene dine under. Vi behandler søknaden din innen 24 timer."} 
                    as="p"
                    className="text-base text-slate-600 font-normal leading-relaxed"
                  />
                  <div className="pt-1.5">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-secondary-container/70 text-primary font-semibold text-xs sm:text-sm uppercase tracking-wider border border-secondary/20">
                      <GraduationCap size={15} className="text-primary" />
                      {language === 'en' 
                        ? "No account needed to apply – Credentials assigned by administration upon admission" 
                        : "Ingen konto kreves for å søke – Brukerkonto tildeles av administrasjonen etter godkjent opptak"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-outline block">
                      <CmsText slug="admission-form-name-label" fallback={language === 'en' ? "Full Name *" : "Fullt navn *"} />
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder={language === 'en' ? "E.g. Thomas Knutsen" : "F.eks. Thomas Knutsen"}
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-base rounded-xl focus:outline-none placeholder:text-outline font-normal transition-all font-sans"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-outline block">
                      <CmsText slug="admission-form-email-label" fallback={language === 'en' ? "Email Address *" : "E-postadresse *"} />
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder={language === 'en' ? "thomas@example.com" : "thomas@eksempel.no"}
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-base rounded-xl focus:outline-none placeholder:text-outline font-normal transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-outline block">
                      <CmsText slug="admission-form-phone-label" fallback={language === 'en' ? "Phone Number *" : "Mobiltelefon *"} />
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder={language === 'en' ? "8-digit phone number" : "8-sifret mobilnummer"}
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-base rounded-xl focus:outline-none placeholder:text-outline font-normal transition-all font-sans"
                    />
                  </div>

                  {/* Program Select */}
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-outline block">
                      <CmsText slug="admission-form-program-label" fallback={language === 'en' ? "Choose Study Line" : "Velg studielinje"} />
                    </label>
                    <select
                      name="program"
                      value={formData.program}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-base rounded-xl focus:outline-none font-normal transition-all font-sans"
                    >
                      {programs.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.code} - {p.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Billing Plan Segment */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-outline block">
                    <CmsText slug="admission-form-billing-label" fallback={language === 'en' ? "Select Billing Plan" : "Foretrukket betalingsplan"} />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`border rounded-xl p-4 flex flex-col justify-center items-center cursor-pointer transition-all active:scale-[0.98] ${
                      formData.paymentPlan === 'semester'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-200 hover:border-primary/30 text-on-surface-variant'
                    }`}>
                      <input
                        type="radio"
                        name="paymentPlan"
                        value="semester"
                        checked={formData.paymentPlan === 'semester'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span className="text-base font-bold block">
                        <CmsText slug="admission-form-billing-semester-title" fallback={language === 'en' ? "Semester Invoice" : "Semesterfaktura"} />
                      </span>
                      <span className="text-xs sm:text-sm text-outline mt-1 font-medium">
                        {language === 'en' ? `${selectedProg.priceSemester} per semester` : `${selectedProg.priceSemester} per semester`}
                      </span>
                    </label>

                    <label className={`border rounded-xl p-4 flex flex-col justify-center items-center cursor-pointer transition-all active:scale-[0.98] ${
                      formData.paymentPlan === 'year'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-200 hover:border-primary/30 text-on-surface-variant'
                    }`}>
                      <input
                        type="radio"
                        name="paymentPlan"
                        value="year"
                        checked={formData.paymentPlan === 'year'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span className="text-base font-bold block">
                        <CmsText slug="admission-form-billing-year-title" fallback={language === 'en' ? "Full Academic Year" : "Fullt studieår"} />
                      </span>
                      <span className="text-xs sm:text-sm text-outline mt-1 font-medium">
                        {language === 'en' ? `${selectedProg.priceYear || '10 000,-'} full year` : `${selectedProg.priceYear || '10 000,-'} for hele året`}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Confirm Year 1 Checkbox for Track 2 */}
                {formData.program === 'prophets_advanced' && (
                  <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                    <div className="flex gap-2.5 text-amber-900 text-base">
                      <Lock size={18} className="shrink-0 mt-0.5" />
                      <p className="font-medium leading-relaxed">
                        <CmsText 
                          slug="admission-form-track2-alert" 
                          fallback={language === 'en'
                            ? "This program (Track 2) does not start until 2028. To apply, you must confirm that you plan to complete or have completed Track 1 (His Kingdom Prophetic Community) first."
                            : "Dette studieløpet (Track 2) starter ikke før i 2028. For å søke opptak, må du bekrefte at du har fullført eller planlegger å fullføre 1. år (His Kingdom Prophetic Community) først."} 
                        />
                      </p>
                    </div>
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        required
                        checked={confirmYear1}
                        onChange={(e) => setConfirmYear1(e.target.checked)}
                        className="mt-1 accent-amber-600 rounded border-amber-300 focus:ring-amber-500 text-amber-600 w-4 h-4"
                      />
                      <span className="text-sm sm:text-base text-amber-950 font-bold leading-normal">
                        <CmsText 
                          slug="admission-form-track2-confirm" 
                          fallback={language === 'en'
                            ? "I confirm that I plan to complete or have completed Track 1 first *"
                            : "Jeg bekrefter at jeg har fullført eller planlegger å fullføre 1. år først *"} 
                        />
                      </span>
                    </label>
                  </div>
                )}

                {/* Motivation Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-outline block">
                    <CmsText slug="admission-form-motivation-label" fallback={language === 'en' ? "Motivation / Vision (Optional)" : "Kort om din motivasjon eller ditt kall (Valgfritt)"} />
                  </label>
                  <textarea
                    name="motivation"
                    rows={4}
                    placeholder={language === 'en' ? "Briefly share your heart or what you hope to receive..." : "Skriv kort om hva du håper å få ut av studiet, eller din bakgrunn..."}
                    value={formData.motivation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-base rounded-xl focus:outline-none placeholder:text-outline font-normal transition-all resize-none font-sans"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#c5a059] hover:bg-[#b08e4f] text-white text-base font-serif font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      <span>{language === 'en' ? "Submitting..." : "Sender søknad..."}</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span><CmsText slug="admission-form-submit-btn" fallback={language === 'en' ? "Submit Application" : "Send Inn Min Søknad"} /></span>
                    </>
                  )}
                </button>
              </motion.form>
            ) : paymentStep === 'payment' ? (
              <motion.div 
                key="payment"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2">
                    <CreditCard size={22} className="animate-pulse" />
                  </div>
                  <CmsText 
                    slug="admission-payment-title" 
                    fallback={language === 'en' ? "Complete Your Enrollment Payment" : "Fullfør din studieavgift"} 
                    as="h3"
                    className="font-serif text-2xl font-bold text-primary"
                  />
                  <p className="text-base text-on-surface-variant font-medium">
                    {language === 'en' 
                      ? `Program: ${programs.find(p => p.id === formData.program)?.title} (${formData.paymentPlan === 'year' ? 'Full academic year' : 'Semester'})`
                      : `Valgt studielinje: ${programs.find(p => p.id === formData.program)?.title} (${formData.paymentPlan === 'year' ? 'Fullt studieår' : 'Semesterfaktura'})`}
                  </p>
                  <p className="text-lg font-bold text-primary">
                    {language === 'en' ? "Amount: " : "Beløp å betale: "} 
                    {formData.paymentPlan === 'year' 
                      ? (programs.find(p => p.id === formData.program)?.priceYear || '10 000,- NOK')
                      : (programs.find(p => p.id === formData.program)?.priceSemester || '5 000,- NOK')}
                  </p>
                </div>

                <div id="hkm-stripe-element" className="bg-slate-50 p-4 border border-slate-200 rounded-2xl min-h-[150px]">
                  {/* Stripe Payment Element mounts here */}
                </div>

                {paymentError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-base font-medium p-4 rounded-xl text-center">
                    {paymentError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setPaymentStep('form')}
                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-base font-bold uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] text-center font-sans border border-slate-200"
                  >
                    <CmsText slug="admission-payment-back" fallback={language === 'en' ? "Back" : "Tilbake"} />
                  </button>
                  <button
                    onClick={handleStripePaymentSubmit}
                    disabled={isSubmitting}
                    className="flex-[2] py-4 bg-primary hover:bg-primary-container text-white text-base font-serif font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                        <span>{language === 'en' ? "Processing..." : "Behandler betaling..."}</span>
                      </>
                    ) : (
                      <span><CmsText slug="admission-payment-confirm-btn" fallback={language === 'en' ? "Pay and Enroll" : "Betal og fullfør"} /></span>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
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
                    className="font-serif text-2xl sm:text-3xl font-bold text-primary"
                  />
                  <p className="text-base text-slate-700 font-normal max-w-md mx-auto leading-relaxed">
                    {language === 'en'
                      ? `Thank you, ${formData.name}! Your application has been submitted to the administration at His Kingdom Prophetic Community.`
                      : `Takk for din søknad, ${formData.name}! Søknaden din er nå oversendt til administrasjonen ved His Kingdom Prophetic Community.`}
                  </p>
                </div>

                {/* Information Card about Next Steps and Account Assignment */}
                <div className="bg-[#fbf8fe] border border-[#dec2ef]/60 rounded-2xl p-6 text-left max-w-lg mx-auto space-y-3.5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                      <GraduationCap size={22} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-primary">
                        {language === 'en' ? "Next Steps: Review & Account Assignment" : "Veien videre: Opptaksbehandling & tildeling av konto"}
                      </h4>
                      <p className="text-base text-slate-600 leading-relaxed font-normal">
                        {language === 'en'
                          ? "We review all applications continuously and will contact you for a brief conversation. Upon approved admission, your personal user account and portal login credentials will be issued directly by the school administration."
                          : "Vi behandler søknader fortløpende og kontakter deg for en kort samtale. Når opptaket er godkjent, vil din personlige brukerkonto og innloggingsdetaljer til portalen bli opprettet og tildelt direkte av skolens administrasjon."}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[#dec2ef]/40 pt-3.5 grid grid-cols-2 gap-3 text-base">
                    <div>
                      <span className="text-outline text-xs uppercase font-bold block">{language === 'en' ? "Program" : "Studielinje"}</span>
                      <span className="font-bold text-primary">{programs.find(p => p.id === formData.program)?.code}</span>
                    </div>
                    <div>
                      <span className="text-outline text-xs uppercase font-bold block">{language === 'en' ? "Kickoff" : "Kickoff"}</span>
                      <span className="font-bold text-primary">27. aug 2027 (Norge)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3.5 bg-[#c5a059] hover:bg-[#b08e4f] text-white text-base font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    <CmsText slug="admission-success-home-btn" fallback={language === 'en' ? "Back to Home" : "Gå til forsiden"} />
                  </button>
                  <button
                    onClick={() => navigate('/support')}
                    className="px-6 py-3.5 bg-slate-50 hover:bg-slate-100 text-primary text-base font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95 border border-slate-200 font-sans"
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
      <footer className="w-full py-12 px-6 flex flex-col md:flex-row justify-between items-center gap-6 bg-[#240046] text-white">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <div className="font-serif text-xl font-bold text-[#e0aaff]">His Kingdom Prophets</div>
          <p className="text-sm text-slate-300 opacity-80 max-w-md">
            {language === 'en'
              ? "© 2026 His Kingdom Prophets. All rights reserved. Equipping prophetic ministries for the church."
              : "© 2026 His Kingdom Prophets. Alle rettigheter reservert. Utrustning av profetiske tjenester for menigheten."}
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-6 text-sm font-semibold">
          <button onClick={() => navigate('/privacy')} className="text-[#e0aaff] hover:text-white transition-opacity">
            {language === 'en' ? "Privacy Policy" : "Personvern"}
          </button>
          <button onClick={() => navigate('/terms')} className="text-[#e0aaff] hover:text-white transition-opacity">
            {language === 'en' ? "Terms of Service" : "Betingelser"}
          </button>
          <button onClick={() => navigate('/accessibility')} className="text-[#e0aaff] hover:text-white transition-opacity">
            {language === 'en' ? "Accessibility" : "Tilgjengelighet"}
          </button>
          <button onClick={() => navigate('/support')} className="text-[#e0aaff] hover:text-white transition-opacity">
            {language === 'en' ? "Contact Support" : "Kontakt Support"}
          </button>
        </nav>
      </footer>

    </div>
  );
}
