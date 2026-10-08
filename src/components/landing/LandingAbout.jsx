import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import CmsText from '@/components/CmsText';
import { fadeInUp, staggerContainer } from './animations';

export default function LandingAbout() {
  const { language } = useApp();

  return (
    <section className="about section" id="about">
      <div className="wrap about-layout">
        <motion.div
          className="portraits"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
        >
          <motion.figure variants={fadeInUp} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
            <div className="landing-portrait-frame portrait-hilde"><img
              src="/assets/hilde.jpg"
              alt="Hilde Karin Knutsen"
              width="400"
              height="400"
              loading="lazy"
              decoding="async"
            /></div>
            <figcaption>
              Hilde Karin Knutsen
              <small><CmsText slug="landing-about-role-hilde" fallback={language === 'no' ? 'Rektor og underviser' : 'Principal & Teacher'} /></small>
            </figcaption>
          </motion.figure>
          <motion.figure variants={fadeInUp} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
            <div className="landing-portrait-frame portrait-thomas"><img
              src="/assets/thomas.jpeg"
              alt="Thomas Knutsen"
              width="400"
              height="400"
              loading="lazy"
              decoding="async"
            /></div>
            <figcaption>
              Thomas Knutsen
              <small><CmsText slug="landing-about-role-thomas" fallback={language === 'no' ? 'Administrator og faglærer' : 'Administrator & Teacher'} /></small>
            </figcaption>
          </motion.figure>
        </motion.div>

        <motion.div
          className="about-copy"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="eyebrow"><CmsText slug="landing-about-eyebrow-full" fallback={language === 'no' ? 'HJERTENE BAK HIS KINGDOM PROPHETIC COMMUNITY' : 'THE HEARTS BEHIND HIS KINGDOM PROPHETIC COMMUNITY'} /></p>
          <h2>
            <CmsText
              slug="landing-about-title"
              multiline
              fallback={language === 'no' ? 'Et liv overgitt.\nEt hjerte for Guds folk.' : 'A life surrendered.\nA heart for God’s people.'}
            />
          </h2>
          <p>
            <CmsText
              slug="landing-about-p1"
              fallback={language === 'no'
                ? 'Hilde Karin og Thomas Knutsen leder His Kingdom Ministry med et hjerte for misjon, disippelskap og utrustning.'
                : 'Hilde Karin and Thomas Knutsen lead His Kingdom Ministry with a heart for mission, discipleship, and equipping believers.'}
            />
          </p>

          <Link to="/about" className="about-page-link">{language === 'no' ? 'Mer om oss' : 'More about us'}<span aria-hidden="true"> →</span></Link>

        </motion.div>
      </div>
    </section>
  );
}
