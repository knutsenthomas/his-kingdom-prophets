import SiteText from '@/components/SiteText';
import React from 'react';
import { motion } from 'framer-motion';
import { MonitorPlay, MapPin, CalendarDays } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { fadeInUp, staggerContainer } from './animations';

export default function LandingIntake() {
  const { language } = useApp();
  const no = language === 'no';

  return (
    <motion.section
      className="u-events wrap"
      aria-label={no ? 'Praktisk informasjon' : 'Practical information'}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={staggerContainer}
    >
      <motion.div className="u-section-title" variants={fadeInUp}>
        <span className="u-kicker"><SiteText fallback={no ? 'NESTE SKOLEÅR' : 'NEXT ACADEMIC YEAR'} /></span>
        <h2><SiteText fallback={no ? 'Din reise starter her.' : 'Your journey starts here.'} /></h2>
      </motion.div>

      <ul className="u-facts">
        <motion.li variants={fadeInUp}>
          <span className="u-fact-icon" aria-hidden="true"><CalendarDays size={24} strokeWidth={1.8} /></span>
          <span className="u-fact-label"><SiteText fallback={no ? 'Søknadsperiode' : 'Application period'} /></span>
          <strong className="u-fact-value"><SiteText fallback={no ? '1. januar – 30. juni 2027' : '1 January – 30 June 2027'} /></strong>
        </motion.li>
        <motion.li variants={fadeInUp}>
          <span className="u-fact-icon" aria-hidden="true"><MapPin size={24} strokeWidth={1.8} /></span>
          <span className="u-fact-label"><SiteText fallback={no ? 'Oppstartssamling i Norge' : 'Opening gathering in Norway'} /></span>
          <strong className="u-fact-value"><SiteText fallback={no ? '20.–22. august 2027' : 'August 20–22, 2027'} /></strong>
        </motion.li>
        <motion.li variants={fadeInUp}>
          <span className="u-fact-icon" aria-hidden="true"><MonitorPlay size={24} strokeWidth={1.8} /></span>
          <span className="u-fact-label"><SiteText fallback={no ? 'Undervisning' : 'Instruction'} /></span>
          <strong className="u-fact-value"><SiteText fallback={no ? 'Nettbasert · på engelsk' : 'Online · in English'} /></strong>
        </motion.li>
      </ul>
    </motion.section>
  );
}
