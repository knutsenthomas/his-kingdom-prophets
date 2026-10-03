import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import CmsText from '@/components/CmsText';
import { fadeInUp, staggerContainer } from './animations';

export default function LandingAdmissions() {
  const navigate = useNavigate();
  const { language } = useApp();

  return (
    <motion.section 
      className="admissions" 
      id="admissions"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={staggerContainer}
    >
      <div className="wrap">
        <motion.p className="eyebrow purple" variants={fadeInUp}>
          <CmsText slug="landing-adm-eyebrow" fallback={language === 'no' ? 'DITT NESTE STEG' : 'YOUR NEXT STEP'} />
        </motion.p>
        <motion.h2 variants={fadeInUp}>
          <CmsText slug="landing-adm-title" fallback={language === 'no' ? 'Begynn din reise.' : 'Begin your journey.'} />
        </motion.h2>
        <motion.p variants={fadeInUp}>
          <CmsText 
            slug="landing-adm-subtitle" 
            multiline 
            fallback={language === 'no' 
              ? 'Et nærere forhold til Jesus. Et fellesskap å vokse i.\nEn tro du kan leve ut.' 
              : 'A closer walk with Jesus. A community to grow in.\nA faith you can live out.'} 
          />
        </motion.p>

        <motion.div className="admission-box" variants={fadeInUp}>
          <div>
            <b><CmsText slug="landing-adm-box-title" fallback={language === 'no' ? 'Opptak til skoleåret 2027' : 'Admissions for Academic Year 2027'} /></b>
            <span className="admission-box-meta">
              <CmsText 
                slug="landing-adm-box-meta" 
                fallback={language === 'no'
                  ? 'Søknadsperiode 1. januar – 30. juni · Kickoff 20.–22. august · Min. 18 år'
                  : 'Application period Jan 1 – June 30 · Kickoff August 20–22 · Min. 18 yrs'} 
              />
            </span>
          </div>
          <motion.button 
            className="button purple-button" 
            onClick={() => navigate('/admission')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <CmsText slug="landing-adm-cta-btn" fallback={language === 'no' ? 'Søk nå' : 'Apply now'} />
          </motion.button>
        </motion.div>

        <details id="requirements">
          <summary>
            <CmsText slug="landing-adm-req-summary" fallback={language === 'no' ? 'Praktisk informasjon og opptakskrav' : 'Practical info & admission criteria'} />
          </summary>
          <p>
            <CmsText 
              slug="landing-adm-req-desc" 
              fallback={language === 'no'
                ? 'Opptakskrav: Du må være fylt 18 år. Førsteår: 10 000 kr for fullt år, pluss 500 kr i oppstart/administrasjon og 500 kr for kickoff kost/losji. Andreår starter i 2028 og krever fullført førsteår og ny søknad. Undervisningen foregår på engelsk.'
                : 'Admission requirement: You must be at least 18 years old. First year: 10,000 NOK for full academic year, plus 500 NOK in administration/registration and 500 NOK for kickoff meals and lodging. Second year begins in 2028 and requires completed first year and separate application. All instruction is in English.'} 
            />
          </p>
        </details>
      </div>
    </motion.section>
  );
}
