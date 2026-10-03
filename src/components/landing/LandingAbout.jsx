import React from 'react';
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
            <img 
              src="/assets/hilde.jpg" 
              alt="Hilde Karin Knutsen" 
              width="400"
              height="400"
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              Hilde Karin Knutsen
              <small><CmsText slug="landing-about-role-hilde" fallback={language === 'no' ? 'Rektor og underviser' : 'Principal & Teacher'} /></small>
            </figcaption>
          </motion.figure>
          <motion.figure variants={fadeInUp} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
            <img 
              src="/assets/thomas.jpeg" 
              alt="Thomas Knutsen" 
              width="400"
              height="400"
              loading="lazy"
              decoding="async"
            />
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
          <p className="eyebrow"><CmsText slug="landing-about-eyebrow" fallback={language === 'no' ? 'HJERTENE BAK HKPC' : 'THE HEARTS BEHIND HKPC'} /></p>
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
          <p>
            <CmsText 
              slug="landing-about-p2" 
              fallback={language === 'no'
                ? 'Gjennom bønn, bibelundervisning og tjeneste ønsker de å hjelpe mennesker til å vokse i fortrolighet med Gud og virksom tro i hverdagen.'
                : 'Through prayer, Bible teaching, and ministry, they desire to help people grow in intimacy with God and active faith in everyday life.'} 
            />
          </p>
          <details>
            <summary><CmsText slug="landing-about-history-summary" fallback={language === 'no' ? 'Les historien bak' : 'Read the story behind'} /></summary>
            <p>
              <CmsText 
                slug="landing-about-history-detail" 
                fallback={language === 'no'
                  ? 'Arbeidet har røtter i His Kingdom Foundation, grunnlagt i 2008. Etter at Hilde Karin og Thomas giftet seg i 2023, ble tjenesten videreført og utvidet som His Kingdom Ministry.'
                  : 'The ministry has roots in His Kingdom Foundation, established in 2008. After Hilde Karin and Thomas married in 2023, the work was continued and expanded as His Kingdom Ministry.'} 
              />
            </p>
          </details>
        </motion.div>
      </div>
    </section>
  );
}
