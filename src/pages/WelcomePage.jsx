import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { BookOpen, Users, Check, ArrowRight, Award } from 'lucide-react';
import CmsText from '@/components/CmsText';
import logo from '@/assets/logo.png';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { user, cmsContent } = useApp();

  // Navigation Guard: Redirect administrators, teachers or superadmins
  useEffect(() => {
    if (user && user.email) {
      const email = user.email.toLowerCase();
      if (['thomas@tk-design.no', 'knutsenthomas@gmail.com'].includes(email) || user.role === 'superadmin') {
        navigate('/admin/portal');
      } else if (user.role === 'teacher' || email.includes('teacher') || email.includes('david')) {
        navigate('/teacher/dashboard');
      } else if (user.role === 'admin' || email.includes('admin') || email.includes('siri')) {
        navigate('/admin/cms');
      }
    }
  }, [user, navigate]);

  const handleDashboardRedirect = () => {
    navigate('/student/dashboard');
  };

  return (
    <div className="bg-background min-h-screen flex flex-col font-sans text-on-background">
      {/* Header */}
      <header className="bg-white border-b border-outline-variant sticky top-0 z-40 shadow-sm">
        <div className="flex justify-between items-center px-6 md:px-12 h-20 w-full max-w-[1440px] mx-auto">
          <div className="font-serif text-2xl font-bold text-primary flex items-center gap-2">
            <img 
              src={logo} 
              alt="His Kingdom Prophets Logo" 
              className="w-8 h-8 object-contain shrink-0" 
            />
            <CmsText slug="layout-logo-title" fallback="His Kingdom Prophets" />
          </div>
          <nav className="flex gap-4">
            <button onClick={handleDashboardRedirect} className="text-on-surface-variant font-semibold text-xs tracking-wider uppercase hover:text-primary transition-colors">
              Hopp over
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow w-full max-w-[1140px] mx-auto px-6 md:px-12 py-12 flex flex-col items-center justify-center">
        
        {/* Linear Academic Stepper */}
        <div className="w-full max-w-2xl mb-12">
          <div className="flex justify-between items-center mb-2 text-xs font-semibold uppercase tracking-wider">
            <span className="text-primary">Steg 5 av 5: Fullført</span>
            <span className="text-primary">100% Fullført</span>
          </div>
          <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary w-full transition-all duration-1000 ease-out"></div>
          </div>
        </div>

        {/* Success Message Section */}
        <div className="max-w-3xl w-full text-center space-y-8">
          
          {/* Avatar / Academic Circle */}
          <div className="relative inline-block">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-32 h-32 md:w-36 md:h-36 bg-surface-container-low rounded-full flex items-center justify-center mx-auto shadow-md"
            >
              <Award size={64} className="text-primary" />
            </motion.div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute -bottom-2 right-1/2 translate-x-12 w-10 h-10 bg-secondary rounded-full flex items-center justify-center border-4 border-white shadow-md text-white font-bold"
            >
              <Check size={18} />
            </motion.div>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-serif text-3xl md:text-5xl text-on-surface font-bold tracking-tight"
            >
              <CmsText 
                slug="welcome-ready-title" 
                fallback="Alt er klart, {name}!" 
                replaceObj={{ '{name}': user?.name?.split(' ')[0] || '' }}
              />
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed"
            >
              <CmsText 
                slug="welcome-ready-subtitle" 
                fallback="Din profil er nå ferdig konfigurert. Du er registrert som student ved vår profetiske bibelskole og utrustningssenter." 
              />
            </motion.p>
          </div>

          {/* Onboarding Next Steps Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 text-left"
          >
            {/* Option Card 1 */}
            <button 
              onClick={() => navigate('/student/library')}
              className="bg-white border border-outline-variant p-6 md:p-8 rounded-xl shadow-sm hover:border-primary hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-start group active:scale-[0.99]"
            >
              <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <BookOpen size={20} />
              </div>
              <CmsText 
                slug="welcome-card1-title" 
                fallback="Utforsk studieplanen" 
                as="h3" 
                className="font-serif text-lg font-bold text-primary mb-2" 
              />
              <CmsText 
                slug="welcome-card1-desc" 
                fallback="Få tilgang til dine kurs i profetisk tjeneste, bibelundervisning og menighetsledelse." 
                as="p" 
                className="text-sm text-on-surface-variant leading-relaxed" 
              />
            </button>

            {/* Option Card 2 */}
            <button 
              onClick={() => navigate('/student/chat')}
              className="bg-white border border-outline-variant p-6 md:p-8 rounded-xl shadow-sm hover:border-primary hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-start group active:scale-[0.99]"
            >
              <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Users size={20} />
              </div>
              <CmsText 
                slug="welcome-card2-title" 
                fallback="Bli med i bønnefellesskap" 
                as="h3" 
                className="font-serif text-lg font-bold text-primary mb-2" 
              />
              <CmsText 
                slug="welcome-card2-desc" 
                fallback="Koble deg på studiegrupper, del profetiske åpenbaringer og chat med dine medstudenter." 
                as="p" 
                className="text-sm text-on-surface-variant leading-relaxed" 
              />
            </button>
          </motion.div>

          {/* Primary Action */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-8"
          >
            <button 
              onClick={handleDashboardRedirect}
              className="bg-primary text-white font-bold py-4 px-12 rounded-lg hover:bg-primary-container transition-all shadow-lg shadow-primary-container/20 flex items-center gap-2 mx-auto active:scale-[0.98] duration-150"
            >
              <CmsText slug="welcome-cta-btn" fallback="GÅ TIL MITT DASHBOARD" />
              <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-outline-variant py-8">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 w-full max-w-[1440px] mx-auto text-xs text-on-surface-variant">
          <div className="font-serif text-lg font-bold text-primary mb-4 md:mb-0 font-serif">His Kingdom Prophets</div>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <nav className="flex gap-4">
              <a className="hover:underline transition-all" href="#privacy">Personvern</a>
              <a className="hover:underline transition-all" href="#terms">Vilkår</a>
              <a className="hover:underline transition-all" href="#help">Hjelpesenter</a>
            </nav>
            <p className="text-secondary mt-2 md:mt-0">© 2026 His Kingdom Prophets. Profetisk utrustning og dyp bibelundervisning.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
