import SiteText from '@/components/SiteText';
import React from 'react';
import { motion } from 'framer-motion';
import { MonitorPlay, MapPin } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { fadeInUp, staggerContainer } from './animations';

// Datoliste i samme stil som arrangementslister: dato-boks til venstre, tittel og detaljer til høyre.
function DateBox({ from, to, monthFrom, monthTo }) {
  return (
    <div className="u-datebox" aria-hidden="true">
      <span className="u-datebox-days">{from}{to ? <> – {to}</> : null}</span>
      <span className="u-datebox-months">
        <span>{monthFrom}</span>
        {monthTo ? <span>{monthTo}</span> : null}
      </span>
    </div>
  );
}

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

      <ul className="u-event-list">
        <motion.li variants={fadeInUp}>
          <DateBox from="1" to="30" monthFrom={no ? 'jan.' : 'Jan'} monthTo={no ? 'jun.' : 'Jun'} />
          <div className="u-event-body">
            <strong><SiteText fallback={no ? 'Søknadsperiode' : 'Application period'} /></strong>
            <small><SiteText fallback={no ? '1. januar – 30. juni 2027' : '1 January – 30 June 2027'} /></small>
          </div>
        </motion.li>
        <motion.li variants={fadeInUp}>
          <DateBox from="20" to="22" monthFrom={no ? 'aug.' : 'Aug'} monthTo={no ? 'aug.' : 'Aug'} />
          <div className="u-event-body">
            <strong><SiteText fallback={no ? 'Oppstartssamling i Norge' : 'Opening gathering in Norway'} /></strong>
            <small><MapPin size={15} aria-hidden="true" /><SiteText fallback={no ? '20.–22. august 2027' : 'August 20–22, 2027'} /></small>
          </div>
        </motion.li>
        <motion.li variants={fadeInUp}>
          <div className="u-datebox u-datebox-icon" aria-hidden="true"><MonitorPlay size={26} /></div>
          <div className="u-event-body">
            <strong><SiteText fallback={no ? 'Undervisning' : 'Instruction'} /></strong>
            <small><SiteText fallback={no ? 'Nettbasert · på engelsk' : 'Online · in English'} /></small>
          </div>
        </motion.li>
      </ul>
    </motion.section>
  );
}
