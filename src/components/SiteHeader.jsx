import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ExternalLink, ShieldCheck, GraduationCap, Sparkles, X, ArrowRight, Globe, Check } from 'lucide-react';
import '@/styles/hkpc-redesign.css';

export default function SiteHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, selectLanguage, toggleLanguage, user } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const loginMenuRef = useRef(null);
  const langMenuRef = useRef(null);

  const ADMIN_EMAILS = ['knutsenthomas@gmail.com', 'thomas@tk-design.no', 'thomas@hiskingdomministry.no'];
  const cleanEmail = user?.email?.toLowerCase();
  const isAdmin = Boolean(user && (user.role === 'admin' || user.role === 'superadmin' || ADMIN_EMAILS.includes(cleanEmail)));
  const isTeacherOrAdmin = Boolean(user && (user.role === 'teacher' || user.role === 'admin' || user.role === 'superadmin' || ADMIN_EMAILS.includes(cleanEmail)));

  const handlePortalNavigation = () => {
    if (isTeacherOrAdmin) {
      navigate('/teacher/dashboard');
    } else {
      window.open('https://app.hkpc.no', '_blank', 'noopener,noreferrer');
    }
  };

  // Close dropdowns on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (loginMenuRef.current && !loginMenuRef.current.contains(event.target)) {
        setIsLoginMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setIsLangMenuOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsLoginMenuOpen(false);
        setIsLangMenuOpen(false);
      }
    };
    if (isLoginMenuOpen || isLangMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoginMenuOpen, isLangMenuOpen]);

  const handleLogoClick = (e) => {
    e.preventDefault();
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount === 3) {
      setLogoClicks(0);
      window.dispatchEvent(new CustomEvent('OPEN_CMS_MODAL'));
    }
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    setIsLoginMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${targetId}`);
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="hkpc-landing site-header-wrapper">
      <header className="wrap">
        <a className="brand" href="/" onClick={handleLogoClick}>
          <img src="/assets/logo.png" alt="HKPC logo" />
          <span>
            HKPC
            <small>His Kingdom Prophetic Community</small>
          </span>
        </a>

        <nav aria-label="Hovedmeny" className={isMobileMenuOpen ? 'open' : ''}>
          <a href="/#school" onClick={(e) => handleNavClick(e, 'school')}>
            {language === 'no' ? 'Utdanning' : 'Programs'}
          </a>
          <a href="/#curriculum" onClick={(e) => handleNavClick(e, 'curriculum')}>
            {language === 'no' ? 'Fagplan' : 'Curriculum'}
          </a>
          <a href="/#about" onClick={(e) => handleNavClick(e, 'about')}>
            {language === 'no' ? 'Om oss' : 'About'}
          </a>
          <a href="/#resources" onClick={(e) => handleNavClick(e, 'resources')}>
            {language === 'no' ? 'Ressurser' : 'Resources'}
          </a>

          {/* Mobile only action items */}
          <div className="mobile-nav-actions">
            <button onClick={toggleLanguage} className="mobile-action-btn">
              {language === 'no' ? '🌐 Switch to English' : '🌐 Bytt til Norsk'}
            </button>
            {user ? (
              <button 
                onClick={() => { 
                  setIsMobileMenuOpen(false); 
                  if (isAdmin) {
                    localStorage.setItem('hkm-cms-authorized', 'true');
                    navigate('/teacher/dashboard');
                  } else {
                    handlePortalNavigation(); 
                  }
                }} 
                className="mobile-action-btn"
                style={isAdmin ? { fontWeight: 700, color: 'var(--violet)' } : {}}
              >
                {isAdmin ? '⚙️ Admin Dashbord' : (language === 'no' ? 'Min side (Portal)' : 'My Portal')}
              </button>
            ) : (
              /* 2 Choices for Mobile */
              <div className="mobile-login-box">
                <span className="mobile-login-title">
                  {language === 'no' ? 'Logg inn:' : 'Log in:'}
                </span>

                {/* Valg 1: Appen (1. Prioritet) */}
                <a
                  href="https://app.hkpc.no"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mobile-choice-btn primary"
                >
                  <span className="flex items-center gap-2">
                    <GraduationCap size={18} />
                    <span>HKP Community App</span>
                  </span>
                  <span className="text-[11px] opacity-90 flex items-center gap-1">
                    app.hkpc.no <ExternalLink size={12} />
                  </span>
                </a>

                {/* Valg 2: Admin */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate(isAdmin ? '/admin/cms' : '/admin/login');
                  }}
                  className="mobile-choice-btn secondary"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck size={18} />
                    <span>{language === 'no' ? 'Nettside Admin' : 'Website Admin'}</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    hkpc.no/admin &rarr;
                  </span>
                </button>
              </div>
            )}

            <button 
              onClick={() => { setIsMobileMenuOpen(false); navigate('/admission'); }} 
              className="mobile-cta-btn"
            >
              {language === 'no' ? 'Opptak 2027' : 'Admissions 2027'}
            </button>
          </div>
        </nav>

        {/* Header controls: Globe language selector (outside mobile menu), Desktop actions, Mobile menu button */}
        <div className="header-controls">
          {/* Globe Language Selector - Matches media_1791038711517.png */}
          <div className="lang-dropdown-wrapper" ref={langMenuRef}>
            <button 
              type="button"
              onClick={() => setIsLangMenuOpen(prev => !prev)} 
              className={`lang-globe-btn ${isLangMenuOpen ? 'open' : ''}`}
              aria-expanded={isLangMenuOpen}
              aria-haspopup="listbox"
              aria-label={language === 'no' ? 'Velg språk' : 'Select language'}
              title={language === 'no' ? 'Språk: Norsk (trykk for å endre)' : 'Language: English (click to change)'}
            >
              <Globe size={16} className="lang-globe-icon" />
              <span className="lang-code-text">{language === 'no' ? 'NO' : 'EN'}</span>
              <ChevronDown 
                size={12} 
                className={`lang-chevron ${isLangMenuOpen ? 'open' : ''}`} 
              />
            </button>

            <AnimatePresence>
              {isLangMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="lang-dropdown-menu"
                  role="listbox"
                  aria-label="Språkliste"
                >
                  <div className="lang-dropdown-header">
                    <span>{language === 'no' ? 'Velg språk' : 'Select language'}</span>
                  </div>

                  <div className="lang-dropdown-list">
                    {/* Norsk Option */}
                    <button
                      type="button"
                      onClick={() => {
                        selectLanguage('no');
                        setIsLangMenuOpen(false);
                      }}
                      className={`lang-item ${language === 'no' ? 'active' : ''}`}
                      role="option"
                      aria-selected={language === 'no'}
                    >
                      <div className="lang-item-content">
                        <span className="lang-flag" aria-hidden="true">🇳🇴</span>
                        <div className="lang-item-text">
                          <span className="lang-title">Norsk</span>
                          <span className="lang-detail">Bokmål</span>
                        </div>
                      </div>
                      {language === 'no' && (
                        <Check size={16} className="lang-check-icon" />
                      )}
                    </button>

                    {/* English Option */}
                    <button
                      type="button"
                      onClick={() => {
                        selectLanguage('en');
                        setIsLangMenuOpen(false);
                      }}
                      className={`lang-item ${language === 'en' ? 'active' : ''}`}
                      role="option"
                      aria-selected={language === 'en'}
                    >
                      <div className="lang-item-content">
                        <span className="lang-flag" aria-hidden="true">🇬🇧</span>
                        <div className="lang-item-text">
                          <span className="lang-title">English</span>
                          <span className="lang-detail">International</span>
                        </div>
                      </div>
                      {language === 'en' && (
                        <Check size={16} className="lang-check-icon" />
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop actions */}
          <div className="header-actions">
            {user ? (
              isAdmin ? (
                <button 
                  onClick={() => {
                    localStorage.setItem('hkm-cms-authorized', 'true');
                    navigate('/teacher/dashboard');
                  }} 
                  className="admin-badge-btn"
                  title="Åpne Admin Dashbord"
                >
                  <ShieldCheck size={14} />
                  <span>Admin</span>
                </button>
              ) : (
                <button 
                  onClick={handlePortalNavigation} 
                  className="login-btn"
                  title={language === 'no' ? 'Min side' : 'Portal'}
                >
                  <span>{language === 'no' ? 'Min side' : 'Portal'}</span>
                </button>
              )
            ) : (
              /* 2-Choice Login Container for Desktop */
              <div className="login-dropdown-container" ref={loginMenuRef}>
                <button 
                  onClick={() => setIsLoginMenuOpen(prev => !prev)} 
                  className={`login-btn ${isLoginMenuOpen ? 'active' : ''}`}
                  aria-expanded={isLoginMenuOpen}
                  aria-haspopup="true"
                >
                  <span>{language === 'no' ? 'Logg inn' : 'Log in'}</span>
                  <ChevronDown 
                    size={14} 
                    style={{ 
                      marginLeft: 4, 
                      transition: 'transform 0.2s', 
                      transform: isLoginMenuOpen ? 'rotate(180deg)' : 'none' 
                    }} 
                  />
                </button>

                <AnimatePresence>
                  {isLoginMenuOpen && (
                    <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="login-dropdown-menu"
                  >
                    <div className="login-dropdown-header">
                      <span className="login-dropdown-badge">
                        {language === 'no' ? 'Velg innlogging' : 'Select login'}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setIsLoginMenuOpen(false)}
                        className="login-dropdown-close"
                        aria-label="Lukk"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    <div className="login-dropdown-options">
                      {/* Valg 1: HKP Community App (1. Prioritet) */}
                      <a
                        href="https://app.hkpc.no"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsLoginMenuOpen(false)}
                        className="login-choice-card primary-choice"
                      >
                        <div className="choice-badge-row">
                          <span className="choice-priority-badge">
                            <Sparkles size={11} />
                            <span>{language === 'no' ? 'Elever og lærere' : 'Students & Teachers'}</span>
                          </span>
                          <ExternalLink size={13} className="choice-arrow" />
                        </div>

                        <div className="choice-body">
                          <div className="choice-icon-wrap primary-icon">
                            <GraduationCap size={20} />
                          </div>
                          <div className="choice-text">
                            <h4>HKP Community App</h4>
                            <p>
                              {language === 'no' 
                                ? 'For studenter og elever. Se kurs, oppgaver, profetisk trening og fellesskap.' 
                                : 'For students and community. Access courses, assignments, and prophetic equipping.'}
                            </p>
                            <span className="choice-action-link">
                              {language === 'no' ? 'Gå til app.hkpc.no →' : 'Go to app.hkpc.no →'}
                            </span>
                          </div>
                        </div>
                      </a>

                      {/* Valg 2: Nettside Admin */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsLoginMenuOpen(false);
                          navigate(isAdmin ? '/admin/cms' : '/admin/login');
                        }}
                        className="login-choice-card secondary-choice"
                      >
                        <div className="choice-badge-row">
                          <span className="choice-admin-badge">
                            {language === 'no' ? 'Kun Administrator' : 'Admin Only'}
                          </span>
                          <ArrowRight size={13} className="choice-arrow" />
                        </div>

                        <div className="choice-body">
                          <div className="choice-icon-wrap secondary-icon">
                            <ShieldCheck size={20} />
                          </div>
                          <div className="choice-text">
                            <h4>{language === 'no' ? 'Nettside Admin' : 'Website Admin'}</h4>
                            <span className="choice-action-link secondary-link">
                              {isAdmin 
                                ? (language === 'no' ? 'Åpne CMS Dashboard →' : 'Open CMS Dashboard →') 
                                : (language === 'no' ? 'Logg inn som Admin →' : 'Log in as Admin →')}
                            </span>
                          </div>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            )}

            <button className="headerlink" onClick={() => navigate('/admission')}>
              {language === 'no' ? 'Opptak 2027' : 'Admissions 2027'}
            </button>
          </div>

          <button 
            className="menu" 
            aria-expanded={isMobileMenuOpen} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            aria-label="Åpne meny"
          >
            {isMobileMenuOpen ? (language === 'no' ? 'Lukk' : 'Close') : (language === 'no' ? 'Meny' : 'Menu')}
          </button>
        </div>
      </header>
    </div>
  );
}
