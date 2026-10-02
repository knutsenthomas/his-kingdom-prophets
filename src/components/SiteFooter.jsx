import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import '@/styles/hkpc-redesign.css';

export default function SiteFooter() {
  const navigate = useNavigate();
  const { language } = useApp();
  const [logoClicks, setLogoClicks] = useState(0);

  const handleLogoClick = (e) => {
    e.preventDefault();
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount === 3) {
      setLogoClicks(0);
      window.dispatchEvent(new CustomEvent('OPEN_CMS_MODAL'));
    }
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="hkpc-landing site-footer-wrapper">
      <footer>
        <div className="wrap">
          <a className="brand" href="/" onClick={handleLogoClick}>
            <img src="/assets/logo.png" alt="HKPC logo" />
            <span>
              HKPC
              <small>His Kingdom Prophetic Community</small>
            </span>
          </a>
          <p>{language === 'no' ? 'Forankret i Skriften. Utrustet til tjeneste.' : 'Grounded in Scripture. Equipped for ministry.'}</p>
          
          <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--muted)', flexWrap: 'wrap' }}>
            <Link to="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>
              {language === 'no' ? 'Personvern' : 'Privacy Policy'}
            </Link>
            <Link to="/terms" style={{ textDecoration: 'none', color: 'inherit' }}>
              {language === 'no' ? 'Brukervilkår' : 'Terms of Service'}
            </Link>
            <Link to="/accessibility" style={{ textDecoration: 'none', color: 'inherit' }}>
              {language === 'no' ? 'Tilgjengelighet' : 'Accessibility'}
            </Link>
            <Link to="/support" style={{ textDecoration: 'none', color: 'inherit' }}>
              {language === 'no' ? 'Kontakt support' : 'Support'}
            </Link>
          </div>

          <small>
            © 2027 His Kingdom Prophetic Community. All rights reserved.
          </small>
        </div>
      </footer>
    </div>
  );
}
