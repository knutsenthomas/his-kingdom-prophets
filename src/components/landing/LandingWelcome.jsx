import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import CmsText from '@/components/CmsText';
import { fadeInUp, staggerContainer } from './animations';

export default function LandingWelcome() {
  const { language } = useApp();

  return (
    <motion.section 
      className="section wrap welcome" 
      id="introduction"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={staggerContainer}
    >
      <motion.div variants={fadeInUp}>
        <p className="eyebrow purple">
          <CmsText slug="landing-welcome-eyebrow" fallback={language === 'no' ? 'FELLESSKAP & UTRUSTNING' : 'COMMUNITY & EQUIPPING'} />
        </p>
        <h2>
          <CmsText slug="landing-welcome-title" fallback={language === 'no' ? 'En dypere tro. Et levende fellesskap.' : 'A deeper faith. A living fellowship.'} />
        </h2>
      </motion.div>
      <motion.div variants={fadeInUp}>
        <h3><CmsText slug="landing-welcome-sub" fallback={language === 'no' ? 'Alle er velkomne.' : 'All are welcome.'} /></h3>
        <p>
          <CmsText slug="landing-welcome-p1" fallback={language === 'no'
            ? 'Du trenger ikke å være kalt til profetembetet for å vokse i de profetiske gavene. HKPC er for deg som lengter etter et nærere forhold til Jesus og et trygt sted å bli utrustet.'
            : 'You do not need to be called to the fivefold prophetic office to grow in the prophetic gifts. HKPC is for anyone who longs for a closer relationship with Jesus and a safe place to be equipped.'} />
        </p>
        <p>
          <CmsText slug="landing-welcome-p2" fallback={language === 'no'
            ? 'Vi forener bibelundervisning, bønn og praktisk trening — med rom for å lære, spørre og vokse sammen.'
            : 'We unite Bible teaching, prayer, and hands-on activation — with room to learn, ask questions, and grow together.'} />
        </p>
        <div className="signature">
          <CmsText slug="landing-welcome-signature" fallback={language === 'no' ? 'Guds ord som fundament. Jesus i sentrum.' : 'God’s word as our foundation. Jesus at the center.'} />
        </div>
      </motion.div>
    </motion.section>
  );
}
