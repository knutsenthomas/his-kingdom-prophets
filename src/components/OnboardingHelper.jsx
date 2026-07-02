import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Compass, GraduationCap, Users, 
  MessageSquare, ChevronRight, ChevronLeft, X, CheckCircle 
} from 'lucide-react';
import logo from '@/assets/logo.png';

export default function OnboardingHelper() {
  const { user } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (user && user.uid) {
      const isCompleted = localStorage.getItem(`hkm-onboarding-completed-${user.uid}`);
      if (!isCompleted) {
        // Trigger onboarding for new users after a small delay for page load
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  if (!user || !isOpen) return null;

  const steps = [
    {
      title: "Velkommen til His Kingdom Prophets!",
      desc: "Plattformen er designet for din åndelige vekst og utrustning. La oss ta en rask 1-minutters introduksjon for å hjelpe deg i gang.",
      icon: Sparkles,
      color: "from-amber-500 to-[#d17d39]",
      highlight: "Plattformen tilpasser seg din studiehastighet og gir deg personlig mentorveiledning underveis."
    },
    {
      title: "Intuitiv Navigasjon",
      desc: "Bruk venstremenyen til å hoppe mellom de ulike modulene. Her finner du dine leksjoner, oppgaver, bibelkalkulator og din personlige profil.",
      icon: Compass,
      color: "from-blue-500 to-indigo-600",
      highlight: "Under 'Studieplan & kurs' kan du starte nye emner og følge din generelle progresjon."
    },
    {
      title: "Din AI-assistent (HKM Assistent)",
      desc: "Se den sirkulære oransje knappen nederst til høyre? Dette er din HKM Assistent. Den drives av en avansert AI og hjelper deg med teologiske spørsmål live.",
      icon: MessageSquare,
      color: "from-[#d17d39] to-[#bd4f2a]",
      highlight: "Chatten er alltid tilgjengelig og tilpasset His Kingdom Prophets' høye byråstandard."
    },
    {
      title: "Utrustning og fellesskap",
      desc: "Ta leksjoner, send inn besvarelser og diskuter i bønnefellesskapet. Mentorene står klare til å gi deg personlige og oppmuntrende tilbakemeldinger.",
      icon: GraduationCap,
      color: "from-emerald-500 to-teal-600",
      highlight: "Du er nå klar! Trykk på fullfør for å starte din reise i dag."
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(`hkm-onboarding-completed-${user.uid}`, 'true');
    setIsOpen(false);
  };

  const ActiveIcon = steps[currentStep].icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        {/* Dark blurred background overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleComplete}
          className="absolute inset-0 bg-[#3c096c]/80 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="bg-white rounded-3xl border border-outline-variant/30 max-w-lg w-full overflow-hidden shadow-2xl relative z-10 text-on-surface"
        >
          {/* Header Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 flex">
            {steps.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-full flex-grow transition-all duration-300 ${
                  idx <= currentStep ? 'bg-[#3c096c]' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Close trigger */}
          <button 
            onClick={handleComplete}
            className="absolute top-4 right-4 p-2 text-outline hover:text-[#3c096c] hover:bg-[#eaeef2] transition-colors rounded-full"
            title="Lukk introduksjon"
          >
            <X size={18} />
          </button>

          {/* Content Body */}
          <div className="p-8 flex flex-col items-center text-center space-y-6">
            {/* Visual Icon Badge */}
            <motion.div 
              key={currentStep}
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className={`w-20 h-20 bg-gradient-to-tr ${
                currentStep === 0 
                  ? 'from-blue-50 to-indigo-100/50 border border-indigo-200/50' 
                  : steps[currentStep].color
              } rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3`}
            >
              {currentStep === 0 ? (
                <img src={logo} alt="His Kingdom Prophets Logo" className="w-14 h-14 object-contain" />
              ) : (
                <ActiveIcon size={38} className="animate-pulse" />
              )}
            </motion.div>

            {/* Step Content */}
            <div className="space-y-3">
              <h3 className="font-serif text-2xl font-bold text-[#3c096c] tracking-tight px-4">
                {steps[currentStep].title}
              </h3>
              <p className="text-sm text-on-surface-variant font-medium leading-relaxed max-w-sm mx-auto">
                {steps[currentStep].desc}
              </p>
            </div>

            {/* Highlight Alert Box */}
            <div className="w-full bg-background border-l-4 border-[#3c096c] p-4 rounded-r-xl text-left text-xs font-semibold text-on-surface-variant leading-relaxed">
              {steps[currentStep].highlight}
            </div>
          </div>

          {/* Control Footer */}
          <div className="bg-surface-container-low/60 px-8 py-5 flex items-center justify-between border-t border-outline-variant/30">
            {/* Skip Option */}
            <button 
              onClick={handleComplete}
              className="text-xs font-bold text-outline hover:text-[#3c096c] uppercase tracking-wider transition-colors active:scale-95"
            >
              Hopp over
            </button>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-4 py-2 border border-outline-variant rounded-xl text-xs font-bold text-on-surface-variant hover:bg-white transition-all active:scale-[0.97]"
                >
                  <ChevronLeft size={14} />
                  Forrige
                </button>
              )}

              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-5 py-2.5 bg-[#3c096c] hover:opacity-95 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-[0.97]"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    Fullfør
                    <CheckCircle size={14} className="ml-1" />
                  </>
                ) : (
                  <>
                    Neste
                    <ChevronRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
