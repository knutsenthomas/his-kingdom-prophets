import SiteText from '@/components/SiteText';
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

        {Date.now() < Date.parse('2027-01-01T00:00:00+01:00') && <p className="admission-opening-note"><SiteText fallback={language === 'no' ? 'Søknadsperioden åpner 1. januar 2027.' : 'Applications open on 1 January 2027.'} /></p>}
        <motion.div className="admission-box" variants={fadeInUp}>
          <div>
            <b><CmsText slug="landing-adm-box-title" fallback={language === 'no' ? 'Opptak til skoleåret 2027' : 'Admissions for Academic Year 2027'} /></b>
            <dl className="admission-facts">
              <div><dt><SiteText fallback={language === 'no' ? 'Søknadsperiode' : 'Application period'} /></dt><dd><CmsText slug="landing-adm-application-dates" fallback={language === 'no' ? '1. januar – 30. juni 2027' : '1 January – 30 June 2027'} /></dd></div>
              <div><dt><SiteText fallback={language === 'no' ? 'Oppstartssamling i Norge' : 'Opening gathering in Norway'} /></dt><dd><CmsText slug="landing-adm-kickoff-dates" fallback={language === 'no' ? '20.–22. august 2027' : '20–22 August 2027'} /></dd></div>
              <div><dt><SiteText fallback={language === 'no' ? 'Aldersgrense' : 'Minimum age'} /></dt><dd><SiteText fallback={language === 'no' ? '18 år' : '18 years'} /></dd></div>
            </dl>
          </div>
          <motion.button
            className="button purple-button"
            onClick={() => navigate('/admission')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <CmsText slug="landing-adm-apply-place" fallback={language === 'no' ? 'Søk skoleplass' : 'Apply for a place'} />
          </motion.button>
        </motion.div>

        <details id="requirements">
          <summary>
            <CmsText slug="landing-adm-requirements-summary" fallback={language === 'no' ? 'Se opptakskrav og praktisk informasjon' : 'View admission requirements and practical information'} />
          </summary>
          <p>
            <CmsText
              slug="landing-adm-req-desc"
              fallback={language === 'no'
                ? 'Opptakskrav: Du må være fylt 18 år. Førsteår: 10 000 kr for fullt år, pluss 500 kr i oppstart/administrasjon og 500 kr for kost og losji på oppstartssamlingen. Andreår starter i 2028 og krever fullført førsteår og ny søknad. Undervisningen foregår på engelsk.'
                : 'Admission requirement: You must be at least 18 years old. First year: 10,000 NOK for full academic year, plus 500 NOK in administration/registration and 500 NOK for meals and lodging at the opening gathering. Second year begins in 2028 and requires completed first year and separate application. All instruction is in English.'}
            />
          </p>
        </details>
      </div>
    </motion.section>
  );
}
