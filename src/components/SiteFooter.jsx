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
          <div className="footer-layout">
            <div className="footer-content">
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

              <div className="footer-description">{language === 'no' ? 'En åpenbaringsskole for profetisk utrustning, bibelundervisning og åndelig vekst.' : 'A school for prophetic equipping, Bible teaching and spiritual growth.'}</div>
              <div className="footer-link-groups">
                <nav aria-label={language === 'no' ? 'Om skolen' : 'About the school'}><h2>{language === 'no' ? 'Om skolen' : 'About the school'}</h2><Link to="/">{language === 'no' ? 'Forsiden' : 'Home'}</Link><Link to="/about">{language === 'no' ? 'Om oss' : 'About us'}</Link><Link to="/hkm">His Kingdom Ministry</Link></nav>
                <nav aria-label={language === 'no' ? 'Studier' : 'Studies'}><h2>{language === 'no' ? 'Studier' : 'Studies'}</h2><Link to="/admission">{language === 'no' ? 'Opptak og søknad' : 'Admissions'}</Link><a href="https://app.hkpc.no">{language === 'no' ? 'Elev- og lærerportal' : 'Student and teacher portal'}</a><Link to="/betaling">{language === 'no' ? 'Betal skoleavgift' : 'Pay school fees'}</Link><Link to="/gi-gave">{language === 'no' ? 'Gi en gave' : 'Give a gift'}</Link></nav>
                <nav aria-label={language === 'no' ? 'Informasjon' : 'Information'}><h2>{language === 'no' ? 'Informasjon' : 'Information'}</h2><Link to="/personvern"><CmsText slug="landing-footer-link-privacy" fallback={language === 'no' ? 'Personvern' : 'Privacy Policy'}/></Link><Link to="/terms"><CmsText slug="landing-footer-link-terms" fallback={language === 'no' ? 'Brukervilkår' : 'Terms of Service'}/></Link><Link to="/accessibility"><CmsText slug="landing-footer-link-accessibility" fallback={language === 'no' ? 'Tilgjengelighet' : 'Accessibility'}/></Link>{isAdmin && <a href="https://app.hkpc.no/admin" className="footer-admin-link"><ShieldCheck size={15}/>{language === 'no' ? 'Administrasjon' : 'Administration'}</a>}</nav>
              </div>
            </div>
            <aside className="footer-contact-card"><h2>{language === 'no' ? 'Kontakt skolen' : 'Contact the school'}</h2><p>{language === 'no' ? 'Har du spørsmål om skolen, opptak eller betaling? Vi hjelper deg gjerne.' : 'Questions about the school, admissions or payments? We are happy to help.'}</p><Link className="footer-contact-button" to="/support"><CmsText slug="landing-footer-contact-support" fallback={language === 'no' ? 'Kontakt support' : 'Contact support'}/></Link><h3>{language === 'no' ? 'E-post' : 'Email'}</h3><a href="mailto:school@hiskingdomministry.no">school@hiskingdomministry.no</a></aside>
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
