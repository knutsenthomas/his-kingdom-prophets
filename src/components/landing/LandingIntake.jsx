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
        <span className="eyebrow">{language === 'no' ? 'NESTE SKOLEÅR' : 'NEXT ACADEMIC YEAR'}</span>
        <strong>{language === 'no' ? 'Din reise starter her.' : 'Your journey starts here.'}</strong>
      </motion.div>
      <motion.div variants={fadeInUp}>
        <small>{language === 'no' ? 'Søknadsperiode' : 'Application period'}</small>
        <strong>{language === 'no' ? '1. januar – 30. juni 2027' : '1 January – 30 June 2027'}</strong>
      </motion.div>
      <motion.div variants={fadeInUp}>
        <small>{language === 'no' ? 'Oppstartssamling i Norge' : 'Opening gathering in Norway'}</small>
        <strong>{language === 'no' ? '20.–22. august 2027' : 'August 20–22, 2027'}</strong>
      </motion.div>
      <motion.div variants={fadeInUp}>
        <small>{language === 'no' ? 'Undervisning' : 'Instruction'}</small>
        <strong>{language === 'no' ? 'Nettbasert · på engelsk' : 'Online · in English'}</strong>
      </motion.div>
    </motion.section>
  );
}
