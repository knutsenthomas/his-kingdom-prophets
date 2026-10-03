import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import CmsText from '@/components/CmsText';
import '@/styles/hkpc-redesign.css';

const fadeInUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

const imageFadeIn = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } 
  }
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, language, toggleLanguage } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logoClicksRef = useRef(0);
  const handleLogoClick = (e) => {
    e.preventDefault();
    logoClicksRef.current += 1;
    if (logoClicksRef.current >= 3) {
      logoClicksRef.current = 0;
      window.dispatchEvent(new CustomEvent('hkm-toggle-cms'));
    }
    setTimeout(() => { logoClicksRef.current = 0; }, 1500);
  };

  const portalPath = user?.role === 'teacher' || user?.role === 'admin' || user?.role === 'superadmin' 
    ? '/teacher/dashboard' 
    : '/student/dashboard';

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="hkpc-landing min-h-screen">
      {/* Header */}
      <SiteHeader />

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-inner wrap">
            <motion.div 
              className="hero-copy"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.p className="eyebrow" variants={fadeInUp}>
                <CmsText slug="landing-hero-tagline" fallback={language === 'no' ? 'BIBELSKOLE & PROFETISK UTRUSTNING' : 'BIBLE SCHOOL & PROPHETIC EQUIPPING'} />
              </motion.p>
              <motion.h1 variants={fadeInUp}>
                <CmsText 
                  slug="landing-hero-title" 
                  fallback={language === 'no' ? 'Nærmere Jesus. Tryggere i ditt kall.' : 'Closer to Jesus. Confident in your calling.'} 
                />
              </motion.h1>
              <motion.p className="lead" variants={fadeInUp}>
                <CmsText 
                  slug="landing-hero-description" 
                  fallback={language === 'no' ? 'Voks i Guds ord og Åndens gaver. I et fellesskap der du kan høre til.' : "Grow in God's word and the gifts of the Spirit. In a community where you belong."} 
                />
              </motion.p>
              <motion.div className="actions" variants={fadeInUp}>
                <motion.button 
                  className="button gold" 
                  onClick={() => navigate('/admission')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CmsText slug="landing-hero-cta-primary" fallback={language === 'no' ? 'Begynn din reise' : 'Begin your journey'} />
                </motion.button>
                <motion.a 
                  className="intro" 
                  href="#introduction" 
                  onClick={(e) => handleNavClick(e, 'introduction')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="play" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="6 3 20 12 6 21 6 3" />
                    </svg>
                  </span>
                  <span><CmsText slug="landing-hero-cta-secondary" fallback={language === 'no' ? 'Se introduksjon' : 'See introduction'} /></span>
                </motion.a>
              </motion.div>
            </motion.div>

            <motion.div 
              className="hero-image"
              initial="hidden"
              animate="visible"
              variants={imageFadeIn}
            >
              <img 
                src="/assets/students.jpg" 
                alt={language === 'no' ? 'To mennesker leser og samtaler sammen' : 'Two students studying and conversing together'} 
              />
              <div className="image-caption">
                <span>{language === 'no' ? 'FELLESSKAP. TRO. UTRUSTNING.' : 'COMMUNITY. FAITH. EQUIPPING.'}</span>
                <small>{language === 'no' ? 'Et sted å vokse sammen.' : 'A place to grow together.'}</small>
              </div>
            </motion.div>
          </div>

          <motion.div 
            className="hero-base wrap"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <span><CmsText slug="landing-hero-base1" fallback={language === 'no' ? 'Forankret i Skriften.' : 'Grounded in Scripture.'} /></span>
            <span><CmsText slug="landing-hero-base2" fallback={language === 'no' ? 'Ledet av Den Hellige Ånd.' : 'Led by the Holy Spirit.'} /></span>
            <span><CmsText slug="landing-hero-base3" fallback={language === 'no' ? 'Levd ut i hverdagen.' : 'Lived out in daily life.'} /></span>
          </motion.div>
        </section>

        {/* Practical Intake Section */}
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
            <strong>{language === 'no' ? '1. jan – 30. juni 2027' : 'Jan 1 – June 30, 2027'}</strong>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <small>{language === 'no' ? 'Kickoff i Norge' : 'Kickoff in Norway'}</small>
            <strong>{language === 'no' ? '20.–22. august 2027' : 'August 20–22, 2027'}</strong>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <small>{language === 'no' ? 'Undervisning' : 'Instruction'}</small>
            <strong>{language === 'no' ? 'Nettbasert · på engelsk' : 'Online · in English'}</strong>
          </motion.div>
        </motion.section>

        {/* Introduction / Welcome Section */}
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

        {/* School & Programs Section */}
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
                  {language === 'no' ? 'SKOLE & STUDIEFORLØP' : 'SCHOOL & STUDY TRACKS'}
                </p>
                <h2>
                  {language === 'no' ? (
                    <>
                      Rom for å vokse.<br />
                      Retning for ditt kall.
                    </>
                  ) : (
                    <>
                      Room to grow.<br />
                      Direction for your calling.
                    </>
                  )}
                </h2>
              </motion.div>
              <motion.p variants={fadeInUp}>
                {language === 'no'
                  ? 'Studer i eget tempo, og bli en del av et fellesskap med ukentlige Zoom-kvelder og personlig veiledning.'
                  : 'Study at your own pace, and become part of a community with weekly live Zoom gatherings and personal mentoring.'}
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
                  <span>{language === 'no' ? '01 / FØRSTE ÅR' : '01 / FIRST YEAR'}</span>
                  <span className="pill">{language === 'no' ? 'Oppstart 2027' : 'Starts 2027'}</span>
                </div>
                <h3>
                  His Kingdom<br />
                  Prophetic Community
                </h3>
                <p>
                  {language === 'no'
                    ? 'Et bibelsk fundament og praktisk utrustning i Åndens gaver. For alle som ønsker å vokse med Jesus.'
                    : 'A biblical foundation and practical equipping in the gifts of the Spirit. For anyone desiring to grow with Jesus.'}
                </p>
                <ul>
                  <li>{language === 'no' ? 'Hør Guds stemme og modnes i de profetiske gavene' : 'Hear God’s voice and mature in the prophetic gifts'}</li>
                  <li>{language === 'no' ? 'Fellesskap, bønn og praktisk trening' : 'Fellowship, prayer, and practical activation'}</li>
                  <li>{language === 'no' ? 'Nye temaer hvert år — kan tas flere ganger' : 'New themes every year — can be taken multiple times'}</li>
                </ul>
                <div className="program-bottom">
                  <span>
                    <b>5 000 kr</b> {language === 'no' ? '/ semester' : '/ semester'}
                    <small>{language === 'no' ? '+ oppstart og kickoff' : '+ registration & kickoff'}</small>
                  </span>
                  <a href="#curriculum" onClick={(e) => handleNavClick(e, 'curriculum')}>
                    {language === 'no' ? 'Utforsk førsteåret' : 'Explore Year 1'}
                  </a>
                </div>
              </motion.article>

              <motion.article 
                className="program secondary"
                variants={fadeInUp}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="program-top">
                  <span>{language === 'no' ? '02 / ANDRE ÅR' : '02 / SECOND YEAR'}</span>
                  <span className="pill">{language === 'no' ? 'Oppstart 2028' : 'Starts 2028'}</span>
                </div>
                <h3>
                  His Kingdom<br />
                  Prophets
                </h3>
                <p>
                  {language === 'no'
                    ? 'Videre utrustning for deg som vet at du er kalt til tjenesten som profet.'
                    : 'Advanced equipping for those who know they are called to the office of the prophet.'}
                </p>
                <ul>
                  <li>{language === 'no' ? 'Bygger videre på fullført førsteår' : 'Builds upon completed first year'}</li>
                  <li>{language === 'no' ? 'Ny søknad, pensum og skriftlig oppgave' : 'New application, curriculum, and written assignment'}</li>
                  <li>{language === 'no' ? 'Fysisk samling på 1–2 uker' : 'In-person intensive gathering for 1–2 weeks'}</li>
                </ul>
                <div className="program-bottom">
                  <span>
                    {language === 'no' ? 'Et videre steg' : 'A further step'}
                    <small>{language === 'no' ? 'Forankret i fellesskap og tjeneste' : 'Rooted in community and ministry'}</small>
                  </span>
                  <a href="#requirements" onClick={(e) => handleNavClick(e, 'requirements')}>
                    {language === 'no' ? 'Se opptakskrav' : 'View requirements'}
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
                <span>01</span>
                <h4>{language === 'no' ? 'Fleksibelt i hverdagen' : 'Flexible in everyday life'}</h4>
                <p>{language === 'no' ? 'Videoer og oppgaver i ditt eget tempo.' : 'Video lectures and assignments at your own pace.'}</p>
              </motion.div>
              <motion.div variants={fadeInUp} whileHover={{ y: -3, transition: { duration: 0.2 } }}>
                <span>02</span>
                <h4>{language === 'no' ? 'Sammen hver uke' : 'Together every week'}</h4>
                <p>{language === 'no' ? 'Zoom-kvelder med bønn og fagdrøfting.' : 'Live Zoom gatherings with prayer and curriculum discussions.'}</p>
              </motion.div>
              <motion.div variants={fadeInUp} whileHover={{ y: -3, transition: { duration: 0.2 } }}>
                <span>03</span>
                <h4>{language === 'no' ? 'Fra ord til praksis' : 'From word to practice'}</h4>
                <p>{language === 'no' ? 'Profetisk trening i et trygt fellesskap.' : 'Prophetic activation in a supportive environment.'}</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Curriculum Section */}
        <section className="section wrap curriculum" id="curriculum">
          <motion.div 
            className="section-head"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <p className="eyebrow purple">
                {language === 'no' ? 'FAGPLAN · FØRSTE ÅR' : 'CURRICULUM · FIRST YEAR'}
              </p>
              <h2>
                {language === 'no' ? (
                  <>
                    Tro som får røtter.<br />
                    Gaver som får vokse.
                  </>
                ) : (
                  <>
                    Faith that takes root.<br />
                    Gifts that flourish.
                  </>
                )}
              </h2>
            </motion.div>
            <motion.p variants={fadeInUp}>
              {language === 'no'
                ? 'Sunn teologi, personlig relasjon til Jesus og praktisk åpenbaring. Fire områder som henger sammen.'
                : 'Sound theology, personal intimacy with Jesus, and practical revelation. Four connected core areas.'}
            </motion.p>
          </motion.div>

          <motion.div 
            className="topics"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
          >
            <motion.article variants={fadeInUp} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <span>01</span>
              <h3>{language === 'no' ? 'Fundament & relasjon' : 'Foundation & Intimacy'}</h3>
              <p>{language === 'no' ? 'Bønn, identitet i Kristus og å høre Guds røst.' : 'Prayer, identity in Christ, and hearing God’s voice.'}</p>
            </motion.article>
            <motion.article variants={fadeInUp} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <span>02</span>
              <h3>{language === 'no' ? 'Profetisk utrustning & gaver' : 'Prophetic Equipping & Gifts'}</h3>
              <p>{language === 'no' ? 'Åndens gaver, personlig profeti og sunn praksis.' : 'Gifts of the Spirit, personal prophecy, and sound biblical practice.'}</p>
            </motion.article>
            <motion.article variants={fadeInUp} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <span>03</span>
              <h3>{language === 'no' ? 'Indre helbredelse & utfrielse' : 'Inner Healing & Deliverance'}</h3>
              <p>{language === 'no' ? 'Undervisning om frihet, omvendelse og helbredelse.' : 'Teaching on freedom, repentance, and emotional healing.'}</p>
            </motion.article>
            <motion.article variants={fadeInUp} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <span>04</span>
              <h3>{language === 'no' ? 'Kristenliv & tjeneste' : 'Christian Living & Ministry'}</h3>
              <p>{language === 'no' ? 'Tro i hverdagen, forvaltning, smågrupper og misjon.' : 'Faith in daily life, stewardship, small groups, and mission.'}</p>
            </motion.article>
          </motion.div>

          <details>
            <summary>{language === 'no' ? 'Se mer om fagene' : 'Read more about the courses'}</summary>
            <p>
              {language === 'no'
                ? 'Førsteåret omfatter blant annet Profeti 101, å høre Guds stemme, gave versus tjeneste, bønn og faste, gudsfrykt, nådegaver og praktisk kristenliv. Fagområdene er hentet fra dagens HKPC-side.'
                : 'The first year covers Prophecy 101, hearing God’s voice, spiritual gift versus office, prayer and fasting, the fear of the Lord, spiritual gifts, and practical Christian discipleship.'}
            </p>
          </details>
        </section>

        {/* About Section */}
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
                />
                <figcaption>
                  Hilde Karin Knutsen
                  <small>{language === 'no' ? 'Rektor og underviser' : 'Principal & Teacher'}</small>
                </figcaption>
              </motion.figure>
              <motion.figure variants={fadeInUp} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                <img 
                  src="/assets/thomas.jpeg" 
                  alt="Thomas Knutsen" 
                />
                <figcaption>
                  Thomas Knutsen
                  <small>{language === 'no' ? 'Administrator og faglærer' : 'Administrator & Teacher'}</small>
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
              <p className="eyebrow">{language === 'no' ? 'HJERTENE BAK HKPC' : 'THE HEARTS BEHIND HKPC'}</p>
              <h2>
                {language === 'no' ? (
                  <>
                    Et liv overgitt.<br />
                    Et hjerte for<br />
                    <em>Guds folk.</em>
                  </>
                ) : (
                  <>
                    A life surrendered.<br />
                    A heart for<br />
                    <em>God’s people.</em>
                  </>
                )}
              </h2>
              <p>
                {language === 'no'
                  ? 'Hilde Karin og Thomas Knutsen leder His Kingdom Ministry med et hjerte for misjon, disippelskap og utrustning.'
                  : 'Hilde Karin and Thomas Knutsen lead His Kingdom Ministry with a heart for mission, discipleship, and equipping believers.'}
              </p>
              <p>
                {language === 'no'
                  ? 'Gjennom bønn, bibelundervisning og tjeneste ønsker de å hjelpe mennesker til å vokse i fortrolighet med Gud og virksom tro i hverdagen.'
                  : 'Through prayer, Bible teaching, and ministry, they desire to help people grow in intimacy with God and active faith in everyday life.'}
              </p>
              <details>
                <summary>{language === 'no' ? 'Les historien bak' : 'Read the story behind'}</summary>
                <p>
                  {language === 'no'
                    ? 'Arbeidet har røtter i His Kingdom Foundation, grunnlagt i 2008. Etter at Hilde Karin og Thomas giftet seg i 2023, ble tjenesten videreført og utvidet som His Kingdom Ministry.'
                    : 'The ministry has roots in His Kingdom Foundation, established in 2008. After Hilde Karin and Thomas married in 2023, the work was continued and expanded as His Kingdom Ministry.'}
                </p>
              </details>
            </motion.div>
          </div>
        </section>

        {/* Resources Section */}
        <section className="section wrap resources" id="resources">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
          >
            <motion.p className="eyebrow purple" variants={fadeInUp}>
              {language === 'no' ? 'RESSURSER FOR REISEN' : 'RESOURCES FOR THE JOURNEY'}
            </motion.p>
            <motion.div className="section-head" variants={fadeInUp}>
              <h2>{language === 'no' ? 'Ta læringen med deg.' : 'Take your learning further.'}</h2>
              <p>
                {language === 'no'
                  ? 'Fordyp deg videre med undervisning, bøker og læremidler fra His Kingdom.'
                  : 'Deepen your walk with teachings, books, and study materials from His Kingdom.'}
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
              <small>{language === 'no' ? 'UNDERVISNING & INSPIRASJON' : 'TEACHING & INSPIRATION'}</small>
              <h3>His Kingdom Ministry</h3>
              <p>{language === 'no' ? 'Blogg, YouTube, podcast og bibelverktøy.' : 'Blog, YouTube, podcast, and biblical study tools.'}</p>
              <a 
                href="https://hiskingdomministry.no/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {language === 'no' ? 'Besøk hovedsiden' : 'Visit ministry site'}
              </a>
            </motion.article>
            <motion.article variants={fadeInUp} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <small>{language === 'no' ? 'BØKER & STUDIEMATERIELL' : 'BOOKS & STUDY MATERIALS'}</small>
              <h3>His Kingdom Designs</h3>
              <p>{language === 'no' ? 'Fysiske og digitale læremidler. En butikk som også støtter misjonsprosjekter.' : 'Physical and digital educational products. A store that also directly supports mission work.'}</p>
              <a 
                href="https://hiskingdomdesigns.no/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {language === 'no' ? 'Utforsk nettbutikken' : 'Explore online store'}
              </a>
            </motion.article>
          </motion.div>
        </section>

        {/* Admissions Section */}
        <motion.section 
          className="admissions" 
          id="admissions"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
        >
          <div className="wrap">
            <motion.p className="eyebrow purple" variants={fadeInUp}>{language === 'no' ? 'DITT NESTE STEG' : 'YOUR NEXT STEP'}</motion.p>
            <motion.h2 variants={fadeInUp}>{language === 'no' ? 'Begynn din reise.' : 'Begin your journey.'}</motion.h2>
            <motion.p variants={fadeInUp}>
              {language === 'no' ? (
                <>
                  Et nærere forhold til Jesus. Et fellesskap å vokse i.<br />
                  En tro du kan leve ut.
                </>
              ) : (
                <>
                  A closer walk with Jesus. A community to grow in.<br />
                  A faith you can live out.
                </>
              )}
            </motion.p>

            <motion.div className="admission-box" variants={fadeInUp}>
              <div>
                <b>{language === 'no' ? 'Opptak til skoleåret 2027' : 'Admissions for Academic Year 2027'}</b>
                <span>
                  {language === 'no'
                    ? 'Søknadsperiode 1. januar – 30. juni · Kickoff 20.–22. august · Min. 18 år'
                    : 'Application period Jan 1 – June 30 · Kickoff August 20–22 · Min. 18 yrs'}
                </span>
              </div>
              <motion.button 
                className="button purple-button" 
                onClick={() => navigate('/admission')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {language === 'no' ? 'Søk nå' : 'Apply now'}
              </motion.button>
            </motion.div>

            <details id="requirements">
              <summary>
                {language === 'no' ? 'Praktisk informasjon og opptakskrav' : 'Practical info & admission criteria'}
              </summary>
              <p>
                {language === 'no'
                  ? 'Opptakskrav: Du må være fylt 18 år. Førsteår: 10 000 kr for fullt år, pluss 500 kr i oppstart/administrasjon og 500 kr for kickoff kost/losji. Andreår starter i 2028 og krever fullført førsteår og ny søknad. Undervisningen foregår på engelsk.'
                  : 'Admission requirement: You must be at least 18 years old. First year: 10,000 NOK for full academic year, plus 500 NOK in administration/registration and 500 NOK for kickoff meals and lodging. Second year begins in 2028 and requires completed first year and separate application. All instruction is in English.'}
              </p>
            </details>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
