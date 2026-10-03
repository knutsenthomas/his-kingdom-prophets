import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import CmsText from '@/components/CmsText';
import { fadeInUp, staggerContainer } from './animations';

export default function LandingResources() {
  const { language } = useApp();

  return (
    <section className="section wrap resources" id="resources">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={staggerContainer}
      >
        <motion.p className="eyebrow purple" variants={fadeInUp}>
          <CmsText slug="landing-resources-eyebrow" fallback={language === 'no' ? 'RESSURSER FOR REISEN' : 'RESOURCES FOR THE JOURNEY'} />
        </motion.p>
        <motion.div className="section-head" variants={fadeInUp}>
          <h2><CmsText slug="landing-resources-title" fallback={language === 'no' ? 'Ta læringen med deg.' : 'Take your learning further.'} /></h2>
          <p>
            <CmsText 
              slug="landing-resources-desc" 
              fallback={language === 'no'
                ? 'Fordyp deg videre med undervisning, bøker og læremidler fra His Kingdom.'
                : 'Deepen your walk with teachings, books, and study materials from His Kingdom.'} 
            />
          </p>
        </motion.div>
      </motion.div>

      <motion.div 
        className="resource-grid"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={staggerContainer}
      >
        <motion.article variants={fadeInUp} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
          <small><CmsText slug="landing-res-ministry-tag" fallback={language === 'no' ? 'UNDERVISNING & INSPIRASJON' : 'TEACHING & INSPIRATION'} /></small>
          <h3><CmsText slug="landing-res-ministry-title" fallback="His Kingdom Ministry" /></h3>
          <p><CmsText slug="landing-res-ministry-desc" fallback={language === 'no' ? 'Blogg, YouTube, podcast og bibelverktøy.' : 'Blog, YouTube, podcast, and biblical study tools.'} /></p>
          <a 
            href="https://hiskingdomministry.no/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <CmsText slug="landing-res-ministry-cta" fallback={language === 'no' ? 'Besøk hovedsiden' : 'Visit ministry site'} />
          </a>
        </motion.article>
        <motion.article variants={fadeInUp} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
          <small><CmsText slug="landing-res-designs-tag" fallback={language === 'no' ? 'BØKER & STUDIEMATERIELL' : 'BOOKS & STUDY MATERIALS'} /></small>
          <h3><CmsText slug="landing-res-designs-title" fallback="His Kingdom Designs" /></h3>
          <p><CmsText slug="landing-res-designs-desc" fallback={language === 'no' ? 'Fysiske og digitale læremidler. En butikk som også støtter misjonsprosjekter.' : 'Physical and digital educational products. A store that also directly supports mission work.'} /></p>
          <a 
            href="https://hiskingdomdesigns.no/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <CmsText slug="landing-res-designs-cta" fallback={language === 'no' ? 'Utforsk nettbutikken' : 'Explore online store'} />
          </a>
        </motion.article>
      </motion.div>
    </section>
  );
}
