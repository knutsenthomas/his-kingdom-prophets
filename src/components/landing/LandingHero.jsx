import SiteText from '@/components/SiteText';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
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
    <>
    <section className="u-hero">
      <div className="u-hero-inner wrap">
        <motion.div
          className="u-hero-copy"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.p className="u-hero-eyebrow" variants={fadeInUp}>
            <CmsText slug="landing-hero-tagline" fallback={language === 'no' ? 'BIBELSKOLE & PROFETISK UTRUSTNING' : 'BIBLE SCHOOL & PROPHETIC EQUIPPING'} />
          </motion.p>
          <motion.h1 variants={fadeInUp}>
            <CmsText
              slug="landing-hero-title"
              fallback={language === 'no' ? 'Nærmere Jesus. Tryggere i ditt kall.' : 'Closer to Jesus. Confident in your calling.'}
            />
          </motion.h1>
          <motion.p className="u-hero-lead" variants={fadeInUp}>
            <CmsText
              slug="landing-hero-description"
              fallback={language === 'no' ? 'Voks i Guds ord og Åndens gaver. I et fellesskap der du kan høre til.' : "Grow in God's word and the gifts of the Spirit. In a community where you belong."}
            />
          </motion.p>
          <motion.div className="u-hero-actions" variants={fadeInUp}>
            <button type="button" className="u-pill u-pill-white" onClick={() => navigate('/admission')}>
              <CmsText slug="landing-hero-apply-place" fallback={language === 'no' ? 'Søk skoleplass' : 'Apply for a place'} />
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            <a className="u-pill u-pill-ghost" href="#introduction" onClick={(e) => handleNavClick(e, 'introduction')}>
              <CmsText slug="landing-hero-cta-secondary" fallback={language === 'no' ? 'Se introduksjon' : 'See introduction'} />
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </motion.div>
          {Date.now() < Date.parse('2027-01-01T00:00:00+01:00') && <motion.p className="u-hero-note" variants={fadeInUp}><SiteText fallback={language === 'no' ? 'Søknadsperioden åpner 1. januar 2027.' : 'Applications open on 1 January 2027.'} /></motion.p>}
          <motion.ul className="u-hero-values" variants={fadeInUp}>
            <li><CmsText slug="landing-hero-base1" fallback={language === 'no' ? 'Forankret i Skriften.' : 'Grounded in Scripture.'} /></li>
            <li><CmsText slug="landing-hero-base2" fallback={language === 'no' ? 'Ledet av Den Hellige Ånd.' : 'Led by the Holy Spirit.'} /></li>
            <li><CmsText slug="landing-hero-base3" fallback={language === 'no' ? 'Levd ut i hverdagen.' : 'Lived out in daily life.'} /></li>
          </motion.ul>
        </motion.div>

        <motion.figure
          className="u-hero-image"
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
          <figcaption>
            <span><SiteText fallback={language === 'no' ? 'FELLESSKAP. TRO. UTRUSTNING.' : 'COMMUNITY. FAITH. EQUIPPING.'} /></span>
            <small><SiteText fallback={language === 'no' ? 'Et sted å vokse sammen.' : 'A place to grow together.'} /></small>
          </figcaption>
        </motion.figure>
      </div>
    </section>
      <div className="wrap">
        <figure className="u-scripture" lang={language === 'no' ? 'nb' : 'en'}>
          <blockquote>
            <p>{language === 'no'
              ? 'Da Du sa: «Søk Mitt ansikt», gjentok mitt hjerte for Deg: «Ditt ansikt, Herre, vil jeg søke.»'
              : '“You have said, Seek My face [inquire for and require My presence as your vital need]. My heart says to You, Your face (Your presence), Lord, will I seek, inquire for, and require [of necessity and on the authority of Your Word].”'}</p>
          </blockquote>
          <figcaption>{language === 'no' ? 'Salme 27:8' : <>Psalm 27:8 <span>AMPC</span></>}</figcaption>
        </figure>
      </div>
    </>
  );
}
