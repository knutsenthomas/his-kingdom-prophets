import SiteText from '@/components/SiteText';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import CmsText from '@/components/CmsText';
import { fadeInUp, staggerContainer, imageFadeIn } from './animations';

export default function LandingHero() {
  const navigate = useNavigate();
  const { language } = useApp();

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero">
      <div className="hero-inner wrap">
        <motion.div 
          className="hero-copy"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.p className="eyebrow" variants={fadeInUp}>
            <CmsText slug="landing-hero-tagline" fallback={language === 'no' ? 'BIBELSKOLE & PROFETISK UTRUSTNING' : 'BIBLE SCHOOL & PROPHETIC EQUIPPING'} />
          </motion.p>
          <motion.h1 variants={fadeInUp}>
            <CmsText 
              slug="landing-hero-title" 
              fallback={language === 'no' ? 'Nærmere Jesus. Tryggere i ditt kall.' : 'Closer to Jesus. Confident in your calling.'} 
            />
          </motion.h1>
          <motion.p className="lead" variants={fadeInUp}>
            <CmsText 
              slug="landing-hero-description" 
              fallback={language === 'no' ? 'Voks i Guds ord og Åndens gaver. I et fellesskap der du kan høre til.' : "Grow in God's word and the gifts of the Spirit. In a community where you belong."} 
            />
          </motion.p>
          <motion.div className="actions" variants={fadeInUp}>
            <motion.button 
              className="button gold" 
              onClick={() => navigate('/admission')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <CmsText slug="landing-hero-apply-place" fallback={language === 'no' ? 'Søk skoleplass' : 'Apply for a place'} />
            </motion.button>
            <motion.a 
              className="intro" 
              href="#introduction" 
              onClick={(e) => handleNavClick(e, 'introduction')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="play" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
              </span>
              <span><CmsText slug="landing-hero-cta-secondary" fallback={language === 'no' ? 'Se introduksjon' : 'See introduction'} /></span>
            </motion.a>
          </motion.div>
          {Date.now() < Date.parse('2027-01-01T00:00:00+01:00') && <p className="hero-opening-note"><SiteText fallback={language === 'no' ? 'Søknadsperioden åpner 1. januar 2027.' : 'Applications open on 1 January 2027.'} /></p>}
        </motion.div>

        <motion.div 
          className="hero-image"
          initial="hidden"
          animate="visible"
          variants={imageFadeIn}
        >
          <img 
            src="/assets/students.jpg" 
            alt={language === 'no' ? 'To mennesker leser og samtaler sammen' : 'Two students studying and conversing together'} 
            width="640"
            height="427"
            fetchpriority="high"
            loading="eager"
          />
          <div className="image-caption">
            <span><SiteText fallback={language === 'no' ? 'FELLESSKAP. TRO. UTRUSTNING.' : 'COMMUNITY. FAITH. EQUIPPING.'} /></span>
            <small><SiteText fallback={language === 'no' ? 'Et sted å vokse sammen.' : 'A place to grow together.'} /></small>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="hero-base wrap"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="hero-base-item">
          <CmsText slug="landing-hero-base1" fallback={language === 'no' ? 'Forankret i Skriften.' : 'Grounded in Scripture.'} />
        </div>
        <div className="hero-base-item">
          <CmsText slug="landing-hero-base2" fallback={language === 'no' ? 'Ledet av Den Hellige Ånd.' : 'Led by the Holy Spirit.'} />
        </div>
        <div className="hero-base-item">
          <CmsText slug="landing-hero-base3" fallback={language === 'no' ? 'Levd ut i hverdagen.' : 'Lived out in daily life.'} />
        </div>
      </motion.div>
    </section>
  );
}
