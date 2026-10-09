import SiteText from '@/components/SiteText';
import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { fadeInUp, staggerContainer } from './animations';

export default function LandingIntake() {
  const { language } = useApp();

  return (
    <motion.section 
      className="intake wrap" 
      aria-label="Praktisk informasjon"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={staggerContainer}
    >
      <motion.div variants={fadeInUp}>
        <span className="eyebrow"><SiteText fallback={language === 'no' ? 'NESTE SKOLEÅR' : 'NEXT ACADEMIC YEAR'} /></span>
        <strong><SiteText fallback={language === 'no' ? 'Din reise starter her.' : 'Your journey starts here.'} /></strong>
      </motion.div>
      <motion.div variants={fadeInUp}>
        <small><SiteText fallback={language === 'no' ? 'Søknadsperiode' : 'Application period'} /></small>
        <strong><SiteText fallback={language === 'no' ? '1. januar – 30. juni 2027' : '1 January – 30 June 2027'} /></strong>
      </motion.div>
      <motion.div variants={fadeInUp}>
        <small><SiteText fallback={language === 'no' ? 'Oppstartssamling i Norge' : 'Opening gathering in Norway'} /></small>
        <strong><SiteText fallback={language === 'no' ? '20.–22. august 2027' : 'August 20–22, 2027'} /></strong>
      </motion.div>
      <motion.div variants={fadeInUp}>
        <small><SiteText fallback={language === 'no' ? 'Undervisning' : 'Instruction'} /></small>
        <strong><SiteText fallback={language === 'no' ? 'Nettbasert · på engelsk' : 'Online · in English'} /></strong>
      </motion.div>
    </motion.section>
  );
}
