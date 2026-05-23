import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import CmsVisualToggle from '@/components/CmsVisualToggle';

// Components & Shells
import ShowcaseShell from '@/components/ShowcaseShell';
import StudentLayout from '@/components/StudentLayout';
import TeacherLayout from '@/components/TeacherLayout';

// Onboarding Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import InterestsPage from '@/pages/InterestsPage';
import CompleteProfilePage from '@/pages/CompleteProfilePage';
import WelcomePage from '@/pages/WelcomePage';

// Student Pages
import StudentDashboard from '@/pages/StudentDashboard';
import LessonView from '@/pages/LessonView';
import VideoView from '@/pages/VideoView';
import LibraryView from '@/pages/LibraryView';
import AssignmentsPage from '@/pages/AssignmentsPage';
import CommunityChatView from '@/pages/CommunityChatView';
import StudentProfile from '@/pages/StudentProfile';

// Teacher Pages
import TeacherDashboard from '@/pages/TeacherDashboard';
import StudentFollowUp from '@/pages/StudentFollowUp';
import CourseBuilder from '@/pages/CourseBuilder';
import MediaLibrary from '@/pages/MediaLibrary';
import GradesCalculator from '@/pages/GradesCalculator';
import NotificationCenter from '@/pages/NotificationCenter';
import TeacherProfile from '@/pages/TeacherProfile';
import MarketingGrowth from '@/pages/MarketingGrowth';
import QuizBuilder from '@/pages/QuizBuilder';
import OnboardingHelper from '@/components/OnboardingHelper';

// Admin Pages
import CMSDashboard from '@/pages/CMSDashboard';
import AnalyticsDashboard from '@/pages/AnalyticsDashboard';
import AdminPortal from '@/pages/AdminPortal';

// Legal & Support Pages
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import TermsOfServicePage from '@/pages/TermsOfServicePage';
import AccessibilityPage from '@/pages/AccessibilityPage';
import ContactSupportPage from '@/pages/ContactSupportPage';

// Email Previews
import EmailPreviews from '@/pages/EmailPreviews';

// Premium Additions (Support Center, Affiliate Portal, Course Insights)
import SupportCenter from '@/pages/SupportCenter';
import AffiliatePortal from '@/pages/AffiliatePortal';
import CourseInsights from '@/pages/CourseInsights';
import ArtikkelLoggInn from '@/pages/support-articles/ArtikkelLoggInn';
import ArtikkelChat from '@/pages/support-articles/ArtikkelChat';
import ArtikkelBibelkalkulator from '@/pages/support-articles/ArtikkelBibelkalkulator';
import ArtikkelZoom from '@/pages/support-articles/ArtikkelZoom';
import ArtikkelVeiledning from '@/pages/support-articles/ArtikkelVeiledning';
import ArtikkelTjenestegaver from '@/pages/support-articles/ArtikkelTjenestegaver';
import SupportArticleCMS from '@/pages/SupportArticleCMS';

export default function App() {
  const { toastMessage } = useApp();
  const [viewportSize, setViewportSize] = useState('desktop'); // desktop, tablet, mobile
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

  // Reset viewport size or adjust based on specific paths if necessary
  useEffect(() => {
    if (location.pathname === '/landing/tablet') {
      setViewportSize('tablet');
    } else if (location.pathname === '/landing/mobile') {
      setViewportSize('mobile');
    }
  }, [location.pathname]);

  if (isEmbedded) {
    return (
      <div className="min-h-screen bg-background text-on-background w-full">
        <AppRoutes />
        <CmsVisualToggle />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background w-full font-sans relative">
      
      <AppRoutes />
      <CmsVisualToggle />

      {/* Global Branded Toast Manager */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-8 z-[200] bg-[#00324b] text-white border-b-4 border-[#c5a059] px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3.5 max-w-sm"
          >
            <div className="p-1.5 bg-[#c5a059]/20 text-[#c5a059] rounded-full shrink-0">
              <Sparkles size={16} />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#c5a059]">Systemvarsel</p>
              <p className="text-xs font-semibold text-slate-100">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Router wiring for all 42 views / sub-paths
function AppRoutes() {
  return (
    <>
      <OnboardingHelper />
      <Routes>
        {/* Onboarding & Auth */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing/tablet" element={<LandingPage />} />
        <Route path="/landing/mobile" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />
        <Route path="/interests" element={<InterestsPage />} />
        <Route path="/complete-profile" element={<CompleteProfilePage />} />
        <Route path="/onboarding-welcome" element={<WelcomePage />} />

        {/* Student Portal */}
        <Route element={<StudentLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/lesson" element={<LessonView />} />
          <Route path="/student/video" element={<VideoView />} />
          <Route path="/student/library" element={<LibraryView />} />
          <Route path="/student/assignments" element={<AssignmentsPage />} />
          <Route path="/student/chat" element={<CommunityChatView />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/partner" element={<AffiliatePortal />} />
          <Route path="/student/support" element={<SupportCenter />} />
          <Route path="/support/artikkel-logginn" element={<ArtikkelLoggInn />} />
          <Route path="/support/artikkel-chat" element={<ArtikkelChat />} />
          <Route path="/support/artikkel-bibelkalkulator" element={<ArtikkelBibelkalkulator />} />
          <Route path="/support/artikkel-zoom" element={<ArtikkelZoom />} />
          <Route path="/support/artikkel-veiledning" element={<ArtikkelVeiledning />} />
          <Route path="/support/artikkel-tjenestegaver" element={<ArtikkelTjenestegaver />} />
        </Route>

        {/* Teacher / Faculty Portal */}
        <Route element={<TeacherLayout />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/follow-up" element={<StudentFollowUp />} />
          <Route path="/teacher/handle-requests" element={<StudentFollowUp />} />
          <Route path="/teacher/course-builder" element={<CourseBuilder />} />
          <Route path="/teacher/quiz-builder" element={<QuizBuilder />} />
          <Route path="/teacher/marketing" element={<MarketingGrowth />} />
          <Route path="/teacher/media-library" element={<MediaLibrary />} />
          <Route path="/teacher/grading" element={<GradesCalculator />} />
          <Route path="/teacher/grades-calc" element={<GradesCalculator />} />
          <Route path="/teacher/notifications" element={<NotificationCenter />} />
          <Route path="/teacher/profile" element={<TeacherProfile />} />
          <Route path="/teacher/insights" element={<CourseInsights />} />
          <Route path="/teacher/partner" element={<AffiliatePortal />} />
          <Route path="/teacher/support" element={<SupportCenter />} />
          
          {/* Admin Portal */}
          <Route path="/admin/cms" element={<CMSDashboard />} />
          <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
          <Route path="/admin/portal" element={<AdminPortal />} />
        </Route>

        {/* Email Previews */}
        <Route path="/email/previews" element={<EmailPreviews />} />

        {/* Support Article CMS */}
        <Route path="/admin/support-cms" element={<SupportArticleCMS />} />

        {/* Legal & Public Support Pages */}
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/accessibility" element={<AccessibilityPage />} />
        <Route path="/support" element={<ContactSupportPage />} />
      </Routes>
    </>
  );
}
