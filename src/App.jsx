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

// Admin Pages
import CMSDashboard from '@/pages/CMSDashboard';
import AnalyticsDashboard from '@/pages/AnalyticsDashboard';
import AdminPortal from '@/pages/AdminPortal';

// Email Previews
import EmailPreviews from '@/pages/EmailPreviews';

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
    <div className="min-h-screen bg-slate-900 flex flex-col overflow-x-hidden font-sans">
      
      {/* Dynamic Showcase Navigator Shell */}
      <ShowcaseShell viewportSize={viewportSize} setViewportSize={setViewportSize} />

      {/* Frame Renderer depending on showcase size selection */}
      <div className="flex-grow flex items-center justify-center p-4 md:p-8 bg-slate-900">
        
        <div className="w-full h-full flex justify-center items-center">
          <AnimatePresence mode="wait">
            {viewportSize === 'desktop' ? (
              // Desktop: Render normally at full screen
              <motion.div 
                key="desktop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full min-h-[85vh] bg-background shadow-2xl rounded-xl overflow-hidden border border-slate-700"
              >
                <AppRoutes />
              </motion.div>
            ) : viewportSize === 'tablet' ? (
              // Tablet Mockup Bezel Frame
              <motion.div 
                key="tablet"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-[768px] h-[1024px] bg-slate-950 border-[24px] border-slate-950 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col outline outline-2 outline-slate-800"
              >
                {/* Speaker Grill Mockup */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-slate-800 rounded-full" />
                
                {/* Screen area */}
                <div className="flex-grow bg-background overflow-hidden rounded-[1rem] relative h-full w-full">
                  <iframe 
                    src={location.pathname} 
                    className="w-full h-full border-none bg-background overflow-y-auto"
                    title="His Kingdom Prophets Tablet View"
                  />
                </div>

                {/* Home indicator Mockup */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-800 rounded-full" />
              </motion.div>
            ) : (
              // Mobile Mockup Bezel Frame (iPhone style)
              <motion.div 
                key="mobile"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-[390px] h-[844px] bg-slate-950 border-[16px] border-slate-950 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col outline outline-2 outline-slate-800"
              >
                {/* Dynamic Island Notch */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-950 rounded-full z-50 flex items-center justify-end px-3">
                  <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
                </div>
                
                {/* Screen area */}
                <div className="flex-grow bg-background overflow-hidden rounded-[2rem] relative h-full w-full">
                  <iframe 
                    src={location.pathname} 
                    className="w-full h-full border-none bg-background overflow-y-auto"
                    title="His Kingdom Prophets Mobile View"
                  />
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-800 rounded-full" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

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
      </Route>

      {/* Teacher / Faculty Portal */}
      <Route element={<TeacherLayout />}>
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/follow-up" element={<StudentFollowUp />} />
        <Route path="/teacher/handle-requests" element={<StudentFollowUp />} />
        <Route path="/teacher/course-builder" element={<CourseBuilder />} />
        <Route path="/teacher/media-library" element={<MediaLibrary />} />
        <Route path="/teacher/grading" element={<GradesCalculator />} />
        <Route path="/teacher/grades-calc" element={<GradesCalculator />} />
        <Route path="/teacher/notifications" element={<NotificationCenter />} />
        <Route path="/teacher/profile" element={<TeacherProfile />} />
        
        {/* Admin Portal */}
        <Route path="/admin/cms" element={<CMSDashboard />} />
        <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
        <Route path="/admin/portal" element={<AdminPortal />} />
      </Route>

      {/* Email Previews */}
      <Route path="/email/previews" element={<EmailPreviews />} />
    </Routes>
  );
}
