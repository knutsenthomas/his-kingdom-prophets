import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import '@/styles/hkpc-redesign.css';

export default function SiteHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, toggleLanguage, user } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);

  const portalPath = user?.role === 'teacher' || user?.role === 'admin' 
    ? '/teacher/dashboard' 
    : '/student/dashboard';

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
            <button 
              onClick={() => { setIsMobileMenuOpen(false); navigate(user ? portalPath : '/login'); }} 
              className="mobile-action-btn"
            >
              {user 
                ? (language === 'no' ? 'Min side (Portal)' : 'My Portal') 
                : (language === 'no' ? 'Logg inn' : 'Log in')}
            </button>
            <button 
              onClick={() => { setIsMobileMenuOpen(false); navigate('/admission'); }} 
              className="mobile-cta-btn"
            >
              {language === 'no' ? 'Opptak 2027' : 'Admissions 2027'}
            </button>
          </div>
        </nav>

        {/* Desktop actions */}
        <div className="header-actions">
          <button 
            onClick={toggleLanguage} 
            className="lang-toggle-btn" 
            title={language === 'no' ? 'Bytt språk til engelsk' : 'Switch language to Norwegian'}
          >
            {language === 'no' ? 'NO' : 'EN'}
          </button>
          <button 
            onClick={() => navigate(user ? portalPath : '/login')} 
            className="login-btn"
          >
            {user 
              ? (language === 'no' ? 'Min side' : 'Portal') 
              : (language === 'no' ? 'Logg inn' : 'Log in')}
          </button>
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
      </header>
    </div>
  );
}
