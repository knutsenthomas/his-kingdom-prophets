import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { ShieldCheck } from 'lucide-react';
import CmsText from '@/components/CmsText';
import '@/styles/hkpc-redesign.css';

export default function SiteFooter() {
  const navigate = useNavigate();
  const { language, user } = useApp();
  const [logoClicks, setLogoClicks] = useState(0);
  const currentYear = new Date().getFullYear();

  const ADMIN_EMAILS = ['knutsenthomas@gmail.com', 'thomas@tk-design.no', 'thomas@hiskingdomministry.no'];
  const cleanEmail = user?.email?.toLowerCase();
  const isAdmin = Boolean(user && (user.role === 'admin' || user.role === 'superadmin' || ADMIN_EMAILS.includes(cleanEmail)));

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
      <footer className="site-footer">
        <div className="wrap">
          {/* Main Row: Brand & Tagline on Left, Navigation on Right */}
          <div className="footer-main-row">
            <div className="footer-brand-col">
              <a className="brand" href="/" onClick={handleLogoClick}>
                <img width="40" height="40" src="/assets/logo.png" alt="His Kingdom Prophetic Community" />
                <div className="brand-text-col">
                  <span className="brand-name">
                    <CmsText slug="landing-footer-title" fallback="His Kingdom Prophetic Community" />
                  </span>
                  <p className="footer-tagline">
                    <CmsText 
                      slug="landing-footer-tagline" 
                      fallback={language === 'no' ? 'Forankret i Skriften. Utrustet til tjeneste.' : 'Grounded in Scripture. Equipped for ministry.'} 
                    />
                  </p>
                </div>
              </a>
            </div>

            <div className="footer-links-col">
              <nav className="footer-nav" aria-label="Bunnmeny">
                <Link to="/betaling" className="footer-link">{language === 'no' ? 'Betal skoleavgift' : 'Pay school fees'}</Link>
                <Link to="/gi-gave" className="footer-link">{language === 'no' ? 'Gi en gave' : 'Give a gift'}</Link>
                <Link to="/privacy" className="footer-link">
                  <CmsText slug="landing-footer-link-privacy" fallback={language === 'no' ? 'Personvern' : 'Privacy Policy'} />
                </Link>
                <Link to="/terms" className="footer-link">
                  <CmsText slug="landing-footer-link-terms" fallback={language === 'no' ? 'Brukervilkår' : 'Terms of Service'} />
                </Link>
                <Link to="/accessibility" className="footer-link">
                  <CmsText slug="landing-footer-link-accessibility" fallback={language === 'no' ? 'Tilgjengelighet' : 'Accessibility'} />
                </Link>
                <Link to="/support" className="footer-link">
                  <CmsText slug="landing-footer-contact-support" fallback={language === 'no' ? 'Kontakt support' : 'Support'} />
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin/cms" 
                    className="footer-admin-link"
                    title={language === 'no' ? 'Åpne CMS Dashboard' : 'Open CMS Dashboard'}
                  >
                    <ShieldCheck size={13} />
                    <span>Admin CMS</span>
                  </Link>
                )}
              </nav>
            </div>
          </div>

          {/* Bottom Bar: Copyright */}
          <div className="footer-bottom-bar">
            <p className="copyright-text">
              <CmsText 
                slug="landing-footer-copyright" 
                replaceObj={{ 
                  '{year}': currentYear.toString(),
                  '2026': currentYear.toString(),
                  '2027': currentYear.toString()
                }}
                fallback={language === 'no' 
                  ? `© ${currentYear} His Kingdom Prophetic Community. Alle rettigheter reservert. Utrustning av profetiske tjenester for menigheten.` 
                  : `© ${currentYear} His Kingdom Prophetic Community. All rights reserved. Equipping prophetic ministries for the church.`} 
              />
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
