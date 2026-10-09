import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ExternalLink } from 'lucide-react';

// Layouts & Helpers
import WebsiteInlineEditor from '@/components/WebsiteInlineEditor';
import OnboardingHelper from '@/components/OnboardingHelper';

// Public & Onboarding Pages
import LandingPage from '@/pages/LandingPage';
import InterestsPage from '@/pages/InterestsPage';
import CompleteProfilePage from '@/pages/CompleteProfilePage';
import WelcomePage from '@/pages/WelcomePage';
import AdmissionPage from '@/pages/AdmissionPage';
import AboutPage from '@/pages/AboutPage';
import SchoolPaymentPage from '@/pages/SchoolPaymentPage';
import HkmAboutPage from '@/pages/HkmAboutPage';

// Teacher & Admin Pages

// Legal & Support Pages
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import TermsOfServicePage from '@/pages/TermsOfServicePage';
import AccessibilityPage from '@/pages/AccessibilityPage';
import ContactSupportPage from '@/pages/ContactSupportPage';
import EmailPreviews from '@/pages/EmailPreviews';

// Support Articles
import ArtikkelLoggInn from '@/pages/support-articles/ArtikkelLoggInn';
import ArtikkelChat from '@/pages/support-articles/ArtikkelChat';
import ArtikkelBibelkalkulator from '@/pages/support-articles/ArtikkelBibelkalkulator';
import ArtikkelZoom from '@/pages/support-articles/ArtikkelZoom';
import ArtikkelVeiledning from '@/pages/support-articles/ArtikkelVeiledning';
import ArtikkelTjenestegaver from '@/pages/support-articles/ArtikkelTjenestegaver';

export default function App() {
  const { toastMessage } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    setIsEmbedded(window.self !== window.top);
  }, []);

  // Post messages from iframe to parent window for routing sync
  useEffect(() => {
    if (isEmbedded) {
      window.top.postMessage({ type: 'NAVIGATE', path: location.pathname }, '*');
    }
  }, [location.pathname, isEmbedded]);

  // Scroll to top of window and reset all layout scroll containers on route changes
  useEffect(() => {
    window.scrollTo(0, 0);
    const scrollContainers = document.querySelectorAll('.overflow-y-auto, main, aside, section');
    scrollContainers.forEach(container => {
      container.scrollTop = 0;
    });
  }, [location.pathname]);

  // Handle messages in parent window from the iframe
  useEffect(() => {
    if (!isEmbedded) {
      const handleMessage = (e) => {
        if (e.data && e.data.type === 'NAVIGATE') {
          if (window.location.pathname !== e.data.path) {
            navigate(e.data.path);
          }
        }
      };
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [isEmbedded, navigate]);

  if (isEmbedded) {
    return (
      <div className="min-h-screen bg-background text-on-background w-full">
        <AppRoutes />
        <WebsiteInlineEditor />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background w-full font-sans relative">
      <AppRoutes />
        <WebsiteInlineEditor />

      {/* Global Branded Toast Manager */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-8 z-[200] bg-[#561291] text-white border-b-4 border-[#D7B978] px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3.5 max-w-sm"
          >
            <div className="p-1.5 bg-[#D7B978]/20 text-[#D7B978] rounded-full shrink-0">
              <Sparkles size={16} />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#D7B978]">Systemvarsel</p>
              <p className="text-xs font-semibold text-slate-100">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StudentRedirect() {
  useEffect(() => {
    window.location.replace('https://app.hkpc.no');
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-outline-variant/30 space-y-5">
        <img 
          src="/hkp-logo.png" 
          alt="HKP Community Logo" 
          className="w-16 h-16 rounded-full mx-auto object-contain shadow-xs animate-pulse" 
        />
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-primary font-serif">Videresender til HKP Community App...</h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Studieportalen, leksjoner, oppgaver og bønnefellesskapet er samlet i vår offisielle app på <strong>app.hkpc.no</strong>.
          </p>
        </div>
        <a 
          href="https://app.hkpc.no"
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gold hover:bg-[#c9ab68] text-primary font-bold text-sm shadow-sm transition-all"
        >
          <span>Åpne Community App nå</span>
          <ExternalLink size={16} />
        </a>
      </div>
    </div>
  );
}

// Router wiring
function AppRoutes() {
  return (
    <>
      <OnboardingHelper />
      <Routes>
        {/* Onboarding & Auth */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing/tablet" element={<LandingPage />} />
        <Route path="/landing/mobile" element={<LandingPage />} />
        <Route path="/login" element={<StudentRedirect />} />
        <Route path="/register" element={<StudentRedirect />} />
        <Route path="/interests" element={<InterestsPage />} />
        <Route path="/complete-profile" element={<CompleteProfilePage />} />
        <Route path="/onboarding-welcome" element={<WelcomePage />} />

        {/* Student Portal - Routed directly to HKP Community App */}
        <Route path="/student/*" element={<StudentRedirect />} />
        <Route path="/support/artikkel-logginn" element={<ArtikkelLoggInn />} />
        <Route path="/support/artikkel-chat" element={<ArtikkelChat />} />
        <Route path="/support/artikkel-bibelkalkulator" element={<ArtikkelBibelkalkulator />} />
        <Route path="/support/artikkel-zoom" element={<ArtikkelZoom />} />
        <Route path="/support/artikkel-veiledning" element={<ArtikkelVeiledning />} />
        <Route path="/support/artikkel-tjenestegaver" element={<ArtikkelTjenestegaver />} />

        {/* Email Previews */}
        <Route path="/email/previews" element={<EmailPreviews />} />

        {/* Legal & Public Support Pages */}
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/personvern" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/accessibility" element={<AccessibilityPage />} />
        <Route path="/support" element={<ContactSupportPage />} />
        <Route path="/bible-resources" element={<Navigate to="/" replace />} />
        <Route path="/admission" element={<AdmissionPage />} />
        <Route path="/opptak" element={<AdmissionPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/betaling" element={<SchoolPaymentPage key="school" />} />
        <Route path="/gi-gave" element={<SchoolPaymentPage key="gift" gift />} />
        <Route path="/hkm" element={<HkmAboutPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function NotFound() {
  return <main className="min-h-screen bg-background flex items-center justify-center p-6"><div className="rounded-2xl bg-white border border-outline-variant/30 p-8 max-w-lg space-y-4"><p className="font-bold text-primary">404</p><h1 className="text-3xl font-bold">Siden finnes ikke</h1><a className="inline-block rounded-xl bg-primary text-white px-5 py-3 font-semibold" href="/">Tilbake til forsiden</a></div></main>;
}
