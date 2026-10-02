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
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[13px] text-slate-500 pt-2">
            <Link to="/privacy" className="min-h-[44px] inline-flex items-center hover:text-[#561291] transition-colors">
              {language === 'no' ? 'Personvern' : 'Privacy Policy'}
            </Link>
            <Link to="/terms" className="min-h-[44px] inline-flex items-center hover:text-[#561291] transition-colors">
              {language === 'no' ? 'Brukervilkår' : 'Terms of Service'}
            </Link>
            <Link to="/accessibility" className="min-h-[44px] inline-flex items-center hover:text-[#561291] transition-colors">
              {language === 'no' ? 'Tilgjengelighet' : 'Accessibility'}
            </Link>
            <Link to="/support" className="min-h-[44px] inline-flex items-center hover:text-[#561291] transition-colors">
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
