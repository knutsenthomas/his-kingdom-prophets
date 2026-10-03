import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import CmsText from '@/components/CmsText';
import { fadeInUp, staggerContainer } from './animations';

export default function LandingPrograms() {
  const { language } = useApp();

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="school section" id="school">
      <div className="wrap">
        <motion.div 
          className="section-head"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp}>
            <p className="eyebrow purple">
              <CmsText slug="landing-school-eyebrow" fallback={language === 'no' ? 'SKOLE & STUDIEFORLØP' : 'SCHOOL & STUDY TRACKS'} />
            </p>
            <h2>
              <CmsText 
                slug="landing-school-title" 
                multiline 
                fallback={language === 'no' ? 'Rom for å vokse.\nRetning for ditt kall.' : 'Room to grow.\nDirection for your calling.'} 
              />
            </h2>
          </motion.div>
          <motion.p variants={fadeInUp}>
            <CmsText 
              slug="landing-school-desc" 
              fallback={language === 'no'
                ? 'Studer i eget tempo, og bli en del av et fellesskap med ukentlige Zoom-kvelder og personlig veiledning.'
                : 'Study at your own pace, and become part of a community with weekly live Zoom gatherings and personal mentoring.'} 
            />
          </motion.p>
        </motion.div>

        <motion.div 
          className="programs"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
        >
          <motion.article 
            className="program primary"
            variants={fadeInUp}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="program-top">
              <span><CmsText slug="landing-p1-tag" fallback={language === 'no' ? '01 / FØRSTE ÅR' : '01 / FIRST YEAR'} /></span>
              <span className="pill"><CmsText slug="landing-p1-pill" fallback={language === 'no' ? 'Oppstart 2027' : 'Starts 2027'} /></span>
            </div>
            <h3>
              <CmsText slug="landing-p1-title" multiline fallback={"His Kingdom\nProphetic Community"} />
            </h3>
            <p>
              <CmsText 
                slug="landing-p1-desc" 
                fallback={language === 'no'
                  ? 'Et bibelsk fundament og praktisk utrustning i Åndens gaver. For alle som ønsker å vokse med Jesus.'
                  : 'A biblical foundation and practical equipping in the gifts of the Spirit. For anyone desiring to grow with Jesus.'} 
              />
            </p>
            <ul>
              <li><CmsText slug="landing-p1-b1" fallback={language === 'no' ? 'Hør Guds stemme og modnes i de profetiske gavene' : 'Hear God’s voice and mature in the prophetic gifts'} /></li>
              <li><CmsText slug="landing-p1-b2" fallback={language === 'no' ? 'Fellesskap, bønn og praktisk trening' : 'Fellowship, prayer, and practical activation'} /></li>
              <li><CmsText slug="landing-p1-b3" fallback={language === 'no' ? 'Nye temaer hvert år — kan tas flere ganger' : 'New themes every year — can be taken multiple times'} /></li>
            </ul>
            <div className="program-bottom">
              <span>
                <b><CmsText slug="landing-p1-price" fallback="5 000 kr" /></b> <CmsText slug="landing-p1-period" fallback={language === 'no' ? '/ semester' : '/ semester'} />
                <small><CmsText slug="landing-p1-note" fallback={language === 'no' ? '+ oppstart og kickoff' : '+ registration & kickoff'} /></small>
              </span>
              <a href="#curriculum" onClick={(e) => handleNavClick(e, 'curriculum')}>
                <CmsText slug="landing-p1-cta" fallback={language === 'no' ? 'Utforsk førsteåret' : 'Explore Year 1'} />
              </a>
            </div>
          </motion.article>

          <motion.article 
            className="program secondary"
            variants={fadeInUp}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="program-top">
              <span><CmsText slug="landing-p2-tag" fallback={language === 'no' ? '02 / ANDRE ÅR' : '02 / SECOND YEAR'} /></span>
              <span className="pill"><CmsText slug="landing-p2-pill" fallback={language === 'no' ? 'Oppstart 2028' : 'Starts 2028'} /></span>
            </div>
            <h3>
              <CmsText slug="landing-p2-title" multiline fallback={"His Kingdom\nProphets"} />
            </h3>
            <p>
              <CmsText 
                slug="landing-p2-desc" 
                fallback={language === 'no'
                  ? 'Videre utrustning for deg som vet at du er kalt til tjenesten som profet.'
                  : 'Advanced equipping for those who know they are called to the office of the prophet.'} 
              />
            </p>
            <ul>
              <li><CmsText slug="landing-p2-b1" fallback={language === 'no' ? 'Bygger videre på fullført førsteår' : 'Builds upon completed first year'} /></li>
              <li><CmsText slug="landing-p2-b2" fallback={language === 'no' ? 'Ny søknad, pensum og skriftlig oppgave' : 'New application, curriculum, and written assignment'} /></li>
              <li><CmsText slug="landing-p2-b3" fallback={language === 'no' ? 'Fysisk samling på 1–2 uker' : 'In-person intensive gathering for 1–2 weeks'} /></li>
            </ul>
            <div className="program-bottom">
              <span>
                <CmsText slug="landing-p2-step" fallback={language === 'no' ? 'Et videre steg' : 'A further step'} />
                <small><CmsText slug="landing-p2-note" fallback={language === 'no' ? 'Forankret i fellesskap og tjeneste' : 'Rooted in community and ministry'} /></small>
              </span>
              <a href="#requirements" onClick={(e) => handleNavClick(e, 'requirements')}>
                <CmsText slug="landing-p2-cta" fallback={language === 'no' ? 'Se opptakskrav' : 'View requirements'} />
              </a>
            </div>
          </motion.article>
        </motion.div>

        <motion.div 
          className="format"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} whileHover={{ y: -3, transition: { duration: 0.2 } }}>
            <span className="format-num">01</span>
            <h4><CmsText slug="landing-format-1-title" fallback={language === 'no' ? 'Fleksibelt i hverdagen' : 'Flexible in everyday life'} /></h4>
            <p><CmsText slug="landing-format-1-desc" fallback={language === 'no' ? 'Videoer og oppgaver i ditt eget tempo.' : 'Video lectures and assignments at your own pace.'} /></p>
          </motion.div>
          <motion.div variants={fadeInUp} whileHover={{ y: -3, transition: { duration: 0.2 } }}>
            <span className="format-num">02</span>
            <h4><CmsText slug="landing-format-2-title" fallback={language === 'no' ? 'Sammen hver uke' : 'Together every week'} /></h4>
            <p><CmsText slug="landing-format-2-desc" fallback={language === 'no' ? 'Zoom-kvelder med bønn og fagdrøfting.' : 'Live Zoom gatherings with prayer and curriculum discussions.'} /></p>
          </motion.div>
          <motion.div variants={fadeInUp} whileHover={{ y: -3, transition: { duration: 0.2 } }}>
            <span className="format-num">03</span>
            <h4><CmsText slug="landing-format-3-title" fallback={language === 'no' ? 'Fra ord til praksis' : 'From word to practice'} /></h4>
            <p><CmsText slug="landing-format-3-desc" fallback={language === 'no' ? 'Profetisk trening i et trygt fellesskap.' : 'Prophetic activation in a supportive environment.'} /></p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
