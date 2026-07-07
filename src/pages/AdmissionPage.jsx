import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, BookOpen, CreditCard, ChevronRight, Check, 
  HelpCircle, ArrowLeft, Send, Award, Calendar, FileText, CheckCircle2, Globe, Lock
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
    if (!formData.name || !formData.email || !formData.phone) {
      showToast(language === 'en' ? "Please fill out all required fields." : "Vennligst fyll ut alle påkrevde felt.");
      return;
    }

    if (!user) {
      showToast(language === 'en' ? "Please log in to continue." : "Vennligst logg inn for å fortsette.");
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    setPaymentError('');

    try {
      const selectedProgram = programs.find(p => p.id === formData.program);
      const amount = formData.paymentPlan === 'semester' 
        ? parseFloat(selectedProgram.priceSemester.replace(/\s/g, '').replace(',-', '')) 
        : parseFloat(selectedProgram.priceMonthly.replace(/\s/g, '').replace(',-', ''));

      const isRecurring = formData.paymentPlan === 'monthly';
      const targetUrl = isRecurring 
        ? "https://createstripesubscription-42bhgdjkcq-uc.a.run.app" 
        : "https://createpaymentintent-42bhgdjkcq-uc.a.run.app";

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount,
          currency: "nok",
          customerDetails: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            message: `Program: ${selectedProgram.code} (${formData.paymentPlan})`,
            fund: "prophets_tuition",
            userId: user.uid
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to initialize payment");
      }

      const { clientSecret: secret } = await response.json();
      setClientSecret(secret);
      setPaymentStep('payment');
    } catch (err) {
      console.error("Failed to initialize payment:", err);
      showToast("Kunne ikke starte betaling: " + err.message, "error");
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
      duration: language === 'en' ? "1 Year (Self-paced / Classes)" : "1 År (Fleksibelt / Klasser)",
      credits: "1. År / Year 1",
      priceSemester: "3 990,-",
      priceMonthly: "790,-",
      isLocked: false,
      features: language === 'en' ? [
        "Grow in relationship with Jesus & gifts of the Spirit",
        "Prophecy 101, How to Hear God, Gift vs Office",
        "Intercession Core Team joins classes for FREE",
        "Join year after year (different subjects yearly)"
      ] : [
        "Vokse i relasjon med Jesus og Åndens gaver",
        "Profeti 101, Å høre Guds stemme, Gave vs Tjeneste",
        "Kjerne-forbønnsteam blir med helt GRATIS",
        "Kan tas år etter år med nye temaer hvert år"
      ]
    },
    {
      id: "prophets_advanced",
      code: "TRACK 2 (YEAR 2)",
      title: "His Kingdom Prophets (Oppstart 2028)",
      duration: language === 'en' ? "Starts in 2028 (Requires Track 1)" : "Starter i 2028 (Krever 1. År)",
      credits: "2. År / Year 2",
      priceSemester: "4 490,-",
      priceMonthly: "890,-",
      isLocked: true,
      features: language === 'en' ? [
        "Specifically for those called to the office of a prophet",
        "Requires separate reapplication & prayer evaluation",
        "Reading list, paper writing & physical SUPER CHARGE",
        "PREREQUISITE: Must complete Track 1 (1st Year) first"
      ] : [
        "Spesifikt for de kalt til embetet som profet",
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

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-on-primary-container font-semibold text-[10px] sm:text-xs uppercase tracking-widest border border-white/20">
            <Award size={13} className="text-secondary-fixed-dim" />
            <CmsText slug="landing-cta-tagline" fallback={language === 'en' ? "Application and Admission Fall 2027" : "Søknad og Opptak Høst 2027"} />
          </span>

          <CmsText 
            slug="admission-hero-title" 
            fallback={language === 'en' ? "Be Equipped for Your God-Given Ministry" : "Bli utrustet til din gudgitte tjeneste"} 
            as="h1"
            className="font-serif text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight max-w-2xl mx-auto text-white"
          />

          <CmsText 
            slug="admission-hero-subtitle" 
            fallback={language === 'en' ? "Choose your study line, select a financial plan that fits your needs, and apply today. Experience a modern, solid theological education." : "Velg din studielinje, velg en finansieringsplan som passer deg, og send inn søknad i dag. Opplev et moderne og solid teologisk utdanningsforløp."} 
            as="p"
            className="text-xs sm:text-sm text-[#e0aaff] font-semibold max-w-xl mx-auto leading-relaxed"
          />

          <div className="pt-4">
            <a 
              href="#apply-form"
              className="px-6 py-3 bg-[#c5a059] hover:bg-[#b08e4f] text-white text-xs font-serif font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 inline-flex items-center gap-2"
            >
              <span><CmsText slug="admission-hero-cta" fallback={language === 'en' ? "Apply Now" : "Send Søknad Nå"} /></span>
              <ChevronRight size={14} />
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
              className="font-serif text-2xl font-bold text-primary"
            />
            <CmsText 
              slug="admission-programs-subtitle" 
              fallback={language === 'en' ? "Each course consists of 8 step-by-step modules integrating thorough theology with personal mentoring." : "Hvert fag består av 8 trinnvise moduler som integrerer grundig teologi med personlig mentorskap."} 
              as="p"
              className="text-xs text-on-surface-variant font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {programs.map(prog => (
              <div 
                key={prog.id}
                className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden ${
                  prog.isLocked 
                    ? 'border-amber-200 hover:border-amber-300' 
                    : 'border-[#dec2ef]/55 hover:border-primary/20'
                }`}
              >
                {prog.isLocked && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl-lg flex items-center gap-1">
                    <Lock size={10} />
                    <span>2028</span>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      prog.isLocked 
                        ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                        : 'bg-primary/5 text-primary border border-primary/10'
                    }`}>
                      {prog.code}
                    </span>
                    <span className="text-[10px] font-bold text-[#c5a059] uppercase tracking-wider">
                      {prog.credits}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-primary leading-snug">
                    {prog.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-semibold">
                    <Calendar size={14} className="text-primary/70" />
                    <span>{prog.duration}</span>
                  </div>

                  <div className="w-full h-[1px] bg-slate-100 my-4" />

                  <ul className="space-y-2.5">
                    {prog.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-on-surface-variant leading-relaxed">
                        <Check className="stroke-[3] text-green-600 shrink-0 w-3.5 h-3.5 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-end">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-outline block">
                      {language === 'en' ? "Tuition Fee" : "Semesteravgift"}
                    </span>
                    <span className="font-serif text-lg font-extrabold text-primary">
                      {prog.priceSemester}
                    </span>
                  </div>
                  
                  <a 
                    href="#apply-form"
                    onClick={() => setFormData(prev => ({ ...prev, program: prog.id }))}
                    className="text-xs font-bold text-primary hover:text-secondary flex items-center gap-0.5 font-sans"
                  >
                    <span>{language === 'en' ? "Select" : "Velg linje"}</span>
                    <ChevronRight size={13} />
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-primary font-bold text-[10px] uppercase tracking-wider select-none">
                <CreditCard size={12} />
                <CmsText slug="admission-payments-tag" fallback={language === 'en' ? "Flexible Payments and Tuition" : "Fleksibel Betaling og Priser"} />
              </span>

              <CmsText 
                slug="admission-payments-title" 
                fallback={language === 'en' ? "Invest in Your Future Without Financial Stress" : "Invester i din fremtid uten økonomisk stress"} 
                as="h2"
                className="font-serif text-2xl font-bold text-primary leading-tight"
              />

              <CmsText 
                slug="admission-payments-desc" 
                fallback={language === 'en' ? "At His Kingdom Prophets, we want prophetic education to be accessible to all. We offer transparent and predictable payment arrangements tailored to your situation. You can pay the full semester fee at once or distribute it over interest-free monthly installments." : "Hos His Kingdom Prophets ønsker vi at den profetiske utdanningen skal være tilgjengelig for alle. Vi tilbyr ryddige og forutsigbare betalingsordninger tilpasset din situasjon. Du kan betale hele semesteravgiften under ett, eller fordele den over rentefrie månedlige rater."} 
                as="p"
                className="text-xs text-on-surface-variant font-semibold leading-relaxed"
              />

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-green-50 text-green-600 rounded-full shrink-0 mt-0.5">
                    <Check size={14} className="stroke-[3]" />
                  </div>
                  <div>
                    <CmsText slug="admission-payments-bullet1-title" fallback={language === 'en' ? "100% Interest-Free Installments" : "100 % rentefri delbetaling"} as="h4" className="text-xs font-bold text-primary" />
                    <CmsText slug="admission-payments-bullet1-desc" fallback={language === 'en' ? "The semester fee can be distributed over 5 monthly installments throughout the semester." : "Semesteravgiften kan fordeles over 5 månedlige rater gjennom semesteret."} as="p" className="text-[11px] text-outline mt-0.5" />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 bg-green-50 text-green-600 rounded-full shrink-0 mt-0.5">
                    <Check size={14} className="stroke-[3]" />
                  </div>
                  <div>
                    <CmsText slug="admission-payments-bullet2-title" fallback={language === 'en' ? "All-Inclusive Tuition Fee" : "Alt inkludert i avgiften"} as="h4" className="text-xs font-bold text-primary" />
                    <CmsText slug="admission-payments-bullet2-desc" fallback={language === 'en' ? "The fee covers study workbooks, 1-on-1 mentoring, Zoom gatherings, full access to the student portal and the video archives." : "Semesteravgiften dekker studiehefter, 1-til-1 samtaler, Zoom-møter, full tilgang til studentportalen og videoarkivet."} as="p" className="text-[11px] text-outline mt-0.5" />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 bg-green-50 text-green-600 rounded-full shrink-0 mt-0.5">
                    <Check size={14} className="stroke-[3]" />
                  </div>
                  <div>
                    <CmsText slug="admission-payments-bullet3-title" fallback={language === 'en' ? "Scholarships & Partner Discounts" : "Stipend og partner-rabatter"} as="h4" className="text-xs font-bold text-primary" />
                    <CmsText slug="admission-payments-bullet3-desc" fallback={language === 'en' ? "Spouse discount, student discount, and special scholarship options for active church planters and missionary families." : "Ektepar-rabatt, studentrabatt og særskilte stipendordninger for aktive menighetsplantere og misjonærfamilier."} as="p" className="text-[11px] text-outline mt-0.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Symmetrical Pricing Card Comparison */}
            <div className="bg-[#faf7fc] border border-slate-200/60 rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-500">
              <div className="flex bg-white p-1 rounded-xl shadow-sm select-none border border-slate-100">
                <button
                  onClick={() => setActivePlan('semester')}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    activePlan === 'semester'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-outline hover:text-primary'
                  }`}
                >
                  {language === 'en' ? "Semester Fee" : "Semesteravgift"}
                </button>
                <button
                  onClick={() => setActivePlan('monthly')}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    activePlan === 'monthly'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-outline hover:text-primary'
                  }`}
                >
                  {language === 'en' ? "Monthly Split" : "Månedsbetaling"}
                </button>
              </div>

              <div className="text-center space-y-3">
                <span className="text-[10px] font-bold text-outline uppercase tracking-widest block">
                  {activePlan === 'semester' ? (language === 'en' ? "One-time payment per semester" : "Enkeltfaktura per semester") : (language === 'en' ? "Interest-free rate / month" : "Rentefri delbetaling / måned")}
                </span>
                
                <div className="font-serif text-3xl sm:text-5xl font-extrabold text-primary">
                  {activePlan === 'semester' ? "3 990,- NOK" : "790,- NOK"}
                </div>
                
                <p className="text-[11px] text-on-surface-variant font-semibold">
                  {activePlan === 'semester'
                    ? (language === 'en' ? "*Price for PROP 101 / LEAD 201. BIBLE 301 is 4 490,- NOK" : "*Gjelder PROP 101 og LEAD 201. BIBLE 301 koster 4 490,-")
                    : (language === 'en' ? "*5 monthly rates per semester. Zero hidden credit fees." : "*5 månedlige avdrag per semester. Ingen etableringsgebyr eller renter.")
                  }
                </p>
              </div>

              <div className="w-full h-[1px] bg-slate-200/50" />

              <div className="space-y-2.5 text-xs text-on-surface-variant font-semibold font-sans">
                <div className="flex justify-between items-center">
                  <span>{language === 'en' ? "Enrollment & Digital Access" : "Innmeldingsavgift & portal"}</span>
                  <span className="text-green-600 font-bold">0,- NOK</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{language === 'en' ? "Assigned Mentor Coach" : "Tildelt Personlig Mentor"}</span>
                  <span className="text-primary font-bold">{language === 'en' ? "Included" : "Inkludert"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{language === 'en' ? "100% Digital Portals" : "100 % Digitalt studiehefte"}</span>
                  <span className="text-primary font-bold">{language === 'en' ? "Included" : "Inkludert"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{language === 'en' ? "Spouse Partner Discount" : "Ektefelle/Familierabatt"}</span>
                  <span className="text-secondary font-bold">-25%</span>
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
              className="font-serif text-2xl font-bold text-primary"
            />
            <CmsText 
              slug="admission-steps-subtitle" 
              fallback={language === 'en' ? "Four simple steps from submitting your application to your approved study space and access." : "Fire enkle steg fra innsendt søknad til godkjent studieplass og tilgang."} 
              as="p"
              className="text-xs text-on-surface-variant font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: language === 'en' ? "Submit Form" : "Send søknad",
                desc: language === 'en' ? "Fill out the admission form below with your motivation and contact info." : "Fyll ut det enkle søknadsskjemaet nedenfor på under 3 minutter."
              },
              {
                step: "02",
                title: language === 'en' ? "Admission Interview" : "Søknadssamtale",
                desc: language === 'en' ? "We will schedule a brief Zoom or phone call to align callings and course goals." : "Vi tar en kort og uforpliktende samtale på telefon eller Zoom for å bli kjent."
              },
              {
                step: "03",
                title: language === 'en' ? "Tuition Setup" : "Betaling & Faktura",
                desc: language === 'en' ? "Select your standard billing plan. Spouses enjoy automatic 25% off." : "Velg din foretrukne betalingsordning (semester eller månedlig delbetaling)."
              },
              {
                step: "04",
                title: language === 'en' ? "Instant Portal Access" : "Portal-tilgang",
                desc: language === 'en' ? "Get your login, workbook, study materials, and PWA mobile portal active instantly." : "Du får tilsendt brukerkonto og kan umiddelbart logge inn i portalen og starte studiet!"
              }
            ].map((stepObj, i) => (
              <div 
                key={i}
                className="bg-white border border-[#dec2ef]/45 p-6 rounded-2xl relative shadow-sm hover:shadow transition-all space-y-3"
              >
                <span className="font-serif text-3xl font-extrabold text-[#c5a059]/15 block">
                  {stepObj.step}
                </span>
                <h4 className="font-serif text-sm font-bold text-primary font-sans">
                  {stepObj.title}
                </h4>
                <p className="text-[11px] text-outline leading-relaxed font-semibold">
                  {stepObj.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: INTERACTIVE APPLICATION FORM */}
        <section id="apply-form" className="bg-white border border-[#dec2ef]/65 rounded-3xl p-8 shadow-md max-w-2xl mx-auto scroll-mt-24">
          <AnimatePresence mode="wait">
            {!user ? (
              <motion.div 
                key="login-prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 space-y-6"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <BookOpen size={28} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-bold text-primary">
                    {language === 'en' ? "Log In to Enroll" : "Logg inn for å melde deg på"}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-semibold max-w-sm mx-auto leading-relaxed">
                    {language === 'en'
                      ? "To apply and pay for courses at His Kingdom Prophets, you must first log in with your HKM account or register."
                      : "For å søke om opptak og betale for kurs ved His Kingdom Prophets, må du logge inn med din HKM-brukerkonto."}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full sm:w-auto px-6 py-3.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-primary text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    {language === 'en' ? "Log In" : "Logg inn"}
                  </button>
                  <button
                    onClick={() => navigate('/login?mode=register')}
                    className="w-full sm:w-auto px-6 py-3.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    {language === 'en' ? "Create Account" : "Opprett brukerkonto"}
                  </button>
                </div>
              </motion.div>
            ) : paymentStep === 'form' ? (
              <motion.form 
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleFormSubmit}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                    <FileText size={18} />
                  </div>
                  <CmsText 
                    slug="admission-form-title" 
                    fallback={language === 'en' ? "Application for Admission" : "Søknad om opptak"} 
                    as="h3"
                    className="font-serif text-xl font-bold text-primary"
                  />
                  <CmsText 
                    slug="admission-form-subtitle" 
                    fallback={language === 'en' ? "Fill in your details below. We process your application within 24 hours." : "Fyll inn opplysningene dine under. Vi behandler søknaden din innen 24 timer."} 
                    as="p"
                    className="text-[11px] text-on-surface-variant font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-outline">
                      {language === 'en' ? "Full Name *" : "Fullt navn *"}
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder={language === 'en' ? "E.g. Thomas Knutsen" : "F.eks. Thomas Knutsen"}
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-xs rounded-xl focus:outline-none placeholder:text-outline font-semibold transition-all font-sans"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-outline">
                      {language === 'en' ? "Email Address *" : "E-postadresse *"}
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder={language === 'en' ? "thomas@example.com" : "thomas@eksempel.no"}
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-xs rounded-xl focus:outline-none placeholder:text-outline font-semibold transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-outline">
                      {language === 'en' ? "Phone Number *" : "Mobiltelefon *"}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder={language === 'en' ? "8-digit phone number" : "8-sifret mobilnummer"}
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-xs rounded-xl focus:outline-none placeholder:text-outline font-semibold transition-all font-sans"
                    />
                  </div>

                  {/* Program Select */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-outline">
                      {language === 'en' ? "Choose Study Line" : "Velg studielinje"}
                    </label>
                    <select
                      name="program"
                      value={formData.program}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-xs rounded-xl focus:outline-none font-semibold transition-all font-sans"
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
                  <label className="text-[10px] font-bold uppercase tracking-wider text-outline block">
                    {language === 'en' ? "Select Billing Plan" : "Foretrukket betalingsplan"}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`border rounded-xl p-3 flex flex-col justify-center items-center cursor-pointer transition-all active:scale-[0.98] ${
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
                      <span className="text-xs font-bold block">{language === 'en' ? "Semester Invoice" : "Semesterfaktura"}</span>
                      <span className="text-[10px] text-outline mt-0.5">
                        {language === 'en' ? `${selectedProg.priceSemester} per semester` : `${selectedProg.priceSemester} per semester`}
                      </span>
                    </label>

                    <label className={`border rounded-xl p-3 flex flex-col justify-center items-center cursor-pointer transition-all active:scale-[0.98] ${
                      formData.paymentPlan === 'monthly'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-200 hover:border-primary/30 text-on-surface-variant'
                    }`}>
                      <input
                        type="radio"
                        name="paymentPlan"
                        value="monthly"
                        checked={formData.paymentPlan === 'monthly'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span className="text-xs font-bold block">{language === 'en' ? "Monthly Split" : "Månedsbetaling"}</span>
                      <span className="text-[10px] text-outline mt-0.5">
                        {language === 'en' ? `${selectedProg.priceMonthly} per month` : `${selectedProg.priceMonthly} pr. måned`}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Confirm Year 1 Checkbox for Track 2 */}
                {formData.program === 'prophets_advanced' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                    <div className="flex gap-2 text-amber-800 text-xs">
                      <Lock size={16} className="shrink-0 mt-0.5" />
                      <p className="font-semibold leading-relaxed">
                        {language === 'en'
                          ? "This program (Track 2) does not start until 2028. To apply, you must confirm that you plan to complete or have completed Track 1 (His Kingdom Prophetic Community) first."
                          : "Dette studieløpet (Track 2) starter ikke før i 2028. For å søke opptak, må du bekrefte at du har fullført eller planlegger å fullføre 1. år (His Kingdom Prophetic Community) først."}
                      </p>
                    </div>
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        required
                        checked={confirmYear1}
                        onChange={(e) => setConfirmYear1(e.target.checked)}
                        className="mt-1 accent-amber-600 rounded border-amber-300 focus:ring-amber-500 text-amber-600 w-4 h-4"
                      />
                      <span className="text-[11px] text-amber-900 font-bold leading-normal">
                        {language === 'en'
                          ? "I confirm that I plan to complete or have completed Track 1 first *"
                          : "Jeg bekrefter at jeg har fullført eller planlegger å fullføre 1. år først *"}
                      </span>
                    </label>
                  </div>
                )}

                {/* Motivation Textarea */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-outline">
                    {language === 'en' ? "Motivation / Vision (Optional)" : "Kort om din motivasjon eller ditt kall (Valgfritt)"}
                  </label>
                  <textarea
                    name="motivation"
                    rows={4}
                    placeholder={language === 'en' ? "Briefly share your heart or what you hope to receive..." : "Skriv kort om hva du håper å få ut av studiet, eller din bakgrunn..."}
                    value={formData.motivation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-xs rounded-xl focus:outline-none placeholder:text-outline font-semibold transition-all resize-none font-sans"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#c5a059] hover:bg-[#b08e4f] text-white text-xs font-serif font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      <span>{language === 'en' ? "Submitting..." : "Sender søknad..."}</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>{language === 'en' ? "Submit Application" : "Send Inn Min Søknad"}</span>
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
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2">
                    <CreditCard size={18} className="animate-pulse" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-primary">
                    {language === 'en' ? "Complete Your Enrollment Payment" : "Fullfør din studieavgift"}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-semibold">
                    {language === 'en' 
                      ? `Program: ${programs.find(p => p.id === formData.program)?.title} (${formData.paymentPlan === 'semester' ? 'One-time semester' : 'Monthly split'})`
                      : `Valgt studielinje: ${programs.find(p => p.id === formData.program)?.title} (${formData.paymentPlan === 'semester' ? 'Hele semesteret' : 'Månedlig delbetaling'})`}
                  </p>
                  <p className="text-sm font-bold text-primary">
                    {language === 'en' ? "Amount: " : "Beløp å betale: "} 
                    {formData.paymentPlan === 'semester' 
                      ? programs.find(p => p.id === formData.program)?.priceSemester 
                      : programs.find(p => p.id === formData.program)?.priceMonthly}
                  </p>
                </div>

                <div id="hkm-stripe-element" className="bg-slate-50 p-4 border border-slate-200 rounded-2xl min-h-[150px]">
                  {/* Stripe Payment Element mounts here */}
                </div>

                {paymentError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-xl text-center">
                    {paymentError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setPaymentStep('form')}
                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] text-center font-sans border border-slate-200"
                  >
                    {language === 'en' ? "Back" : "Tilbake"}
                  </button>
                  <button
                    onClick={handleStripePaymentSubmit}
                    disabled={isSubmitting}
                    className="flex-[2] py-4 bg-primary hover:bg-primary-container text-white text-xs font-serif font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                        <span>{language === 'en' ? "Processing..." : "Behandler betaling..."}</span>
                      </>
                    ) : (
                      <span>{language === 'en' ? "Pay and Enroll" : "Betal og fullfør"}</span>
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
                <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 border border-green-200 flex items-center justify-center mx-auto shadow-sm animate-bounce">
                  <CheckCircle2 size={32} />
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-bold text-primary">
                    {language === 'en' ? "Admission Successful!" : "Opptak fullført!"}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-semibold max-w-sm mx-auto leading-relaxed">
                    {language === 'en'
                      ? `Thank you, ${formData.name}! Your payment has been processed and you are now fully enrolled in the ${programs.find(p => p.id === formData.program)?.code} course. You have been granted instant access to the study portal.`
                      : `Takk, ${formData.name}! Din betaling er registrert og du er nå tatt opp som student på programmet ${programs.find(p => p.id === formData.program)?.code}. Du har nå umiddelbar tilgang til studieportalen.`}
                  </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-[#c5a059] hover:bg-[#b08e4f] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    {language === 'en' ? "Go to Home" : "Gå til forsiden"}
                  </button>
                  <button
                    onClick={() => navigate('/student/dashboard')}
                    className="px-6 py-3 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95 border border-slate-200 font-sans"
                  >
                    {language === 'en' ? "Open Study Portal" : "Åpne studieportal"}
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
          <div className="font-serif text-lg font-bold text-[#e0aaff]">His Kingdom Prophets</div>
          <p className="text-[10px] text-slate-300 opacity-80 max-w-md">
            {language === 'en'
              ? "© 2026 His Kingdom Prophets. All rights reserved. Equipping prophetic ministries for the church."
              : "© 2026 His Kingdom Prophets. Alle rettigheter reservert. Utrustning av profetiske tjenester for menigheten."}
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-6 text-xs font-semibold">
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
