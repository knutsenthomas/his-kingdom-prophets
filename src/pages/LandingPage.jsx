import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import '@/styles/hkpc-redesign.css';

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
      <header className="wrap">
        <a className="brand" href="#" onClick={handleLogoClick}>
          <img src="/assets/logo.png" alt="HKPC logo" />
          <span>
            HKPC
            <small>His Kingdom Prophetic Community</small>
          </span>
        </a>

        <nav aria-label="Hovedmeny" className={isMobileMenuOpen ? 'open' : ''}>
          <a href="#school" onClick={(e) => handleNavClick(e, 'school')}>
            {language === 'no' ? 'Utdanning' : 'Programs'}
          </a>
          <a href="#curriculum" onClick={(e) => handleNavClick(e, 'curriculum')}>
            {language === 'no' ? 'Fagplan' : 'Curriculum'}
          </a>
          <a href="#about" onClick={(e) => handleNavClick(e, 'about')}>
            {language === 'no' ? 'Om oss' : 'About'}
          </a>
          <a href="#resources" onClick={(e) => handleNavClick(e, 'resources')}>
            {language === 'no' ? 'Ressurser' : 'Resources'}
          </a>

          {/* Mobile only action items */}
          <div className="mobile-nav-actions">
            <button onClick={toggleLanguage} className="mobile-action-btn">
              {language === 'no' ? '🌐 Switch to English' : '🌐 Bytt til Norsk'}
            </button>
            <button 
              onClick={() => { setIsMobileMenuOpen(false); navigate(user ? portalPath : '/login'); }} 
              className="mobile-action-btn"
            >
              {user 
                ? (language === 'no' ? 'Min side (Portal)' : 'My Portal') 
                : (language === 'no' ? 'Logg inn' : 'Log in')}
            </button>
            <button 
              onClick={() => { setIsMobileMenuOpen(false); navigate('/admission'); }} 
              className="mobile-cta-btn"
            >
              {language === 'no' ? 'Opptak 2027' : 'Admissions 2027'}
            </button>
          </div>
        </nav>

        {/* Desktop actions */}
        <div className="header-actions">
          <button 
            onClick={toggleLanguage} 
            className="lang-toggle-btn" 
            title={language === 'no' ? 'Bytt språk til engelsk' : 'Switch language to Norwegian'}
          >
            {language === 'no' ? 'NO' : 'EN'}
          </button>
          <button 
            onClick={() => navigate(user ? portalPath : '/login')} 
            className="login-btn"
          >
            {user 
              ? (language === 'no' ? 'Min side' : 'Portal') 
              : (language === 'no' ? 'Logg inn' : 'Log in')}
          </button>
          <button className="headerlink" onClick={() => navigate('/admission')}>
            {language === 'no' ? 'Opptak 2027' : 'Admissions 2027'}
          </button>
        </div>

        <button 
          className="menu" 
          aria-expanded={isMobileMenuOpen} 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          aria-label="Åpne meny"
        >
          {isMobileMenuOpen ? (language === 'no' ? 'Lukk' : 'Close') : (language === 'no' ? 'Meny' : 'Menu')}
        </button>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-inner wrap">
            <div className="hero-copy">
              <p className="eyebrow">
                {language === 'no' ? 'BIBELSKOLE & PROFETISK UTRUSTNING' : 'BIBLE SCHOOL & PROPHETIC EQUIPPING'}
              </p>
              <h1>
                {language === 'no' ? (
                  <>
                    Nærmere Jesus.<br />
                    Tryggere i<br />
                    <em>ditt kall.</em>
                  </>
                ) : (
                  <>
                    Closer to Jesus.<br />
                    Confident in<br />
                    <em>your calling.</em>
                  </>
                )}
              </h1>
              <p className="lead">
                {language === 'no' ? (
                  <>
                    Voks i Guds ord og Åndens gaver.<br />
                    I et fellesskap der du kan høre til.
                  </>
                ) : (
                  <>
                    Grow in God's word and the gifts of the Spirit.<br />
                    In a community where you belong.
                  </>
                )}
              </p>
              <div className="actions">
                <button className="button gold" onClick={() => navigate('/admission')}>
                  {language === 'no' ? 'Begynn din reise' : 'Begin your journey'}
                </button>
                <a 
                  className="intro" 
                  href="#introduction" 
                  onClick={(e) => handleNavClick(e, 'introduction')}
                >
                  <span className="play">▷</span> {language === 'no' ? 'Se introduksjon' : 'See introduction'}
                </a>
              </div>
            </div>

            <div className="hero-image">
              <img 
                src="/assets/students.jpg" 
                alt={language === 'no' ? 'To mennesker leser og samtaler sammen' : 'Two students studying and conversing together'} 
              />
              <div className="image-caption">
                <span>{language === 'no' ? 'FELLESSKAP. TRO. UTRUSTNING.' : 'COMMUNITY. FAITH. EQUIPPING.'}</span>
                <small>{language === 'no' ? 'Et sted å vokse sammen.' : 'A place to grow together.'}</small>
              </div>
            </div>
          </div>

          <div className="hero-base wrap">
            <span>{language === 'no' ? 'Forankret i Skriften.' : 'Grounded in Scripture.'}</span>
            <span>{language === 'no' ? 'Ledet av Den Hellige Ånd.' : 'Led by the Holy Spirit.'}</span>
            <span>{language === 'no' ? 'Levd ut i hverdagen.' : 'Lived out in daily life.'}</span>
          </div>
        </section>

        {/* Practical Intake Section */}
        <section className="intake wrap" aria-label="Praktisk informasjon">
          <div>
            <span className="eyebrow">{language === 'no' ? 'NESTE SKOLEÅR' : 'NEXT ACADEMIC YEAR'}</span>
            <strong>{language === 'no' ? 'Din reise starter her.' : 'Your journey starts here.'}</strong>
          </div>
          <div>
            <small>{language === 'no' ? 'Søknadsperiode' : 'Application period'}</small>
            <strong>{language === 'no' ? '1. jan – 30. juni 2027' : 'Jan 1 – June 30, 2027'}</strong>
          </div>
          <div>
            <small>{language === 'no' ? 'Kickoff i Norge' : 'Kickoff in Norway'}</small>
            <strong>{language === 'no' ? '27. august 2027' : 'August 27, 2027'}</strong>
          </div>
          <div>
            <small>{language === 'no' ? 'Undervisning' : 'Instruction'}</small>
            <strong>{language === 'no' ? 'Nettbasert · på engelsk' : 'Online · in English'}</strong>
          </div>
        </section>

        {/* Introduction / Welcome Section */}
        <section className="section wrap welcome" id="introduction">
          <div>
            <p className="eyebrow purple">
              {language === 'no' ? 'FELLESSKAP & UTRUSTNING' : 'COMMUNITY & EQUIPPING'}
            </p>
            <h2>
              {language === 'no' ? (
                <>
                  En dypere tro.<br />
                  Et levende fellesskap.
                </>
              ) : (
                <>
                  A deeper faith.<br />
                  A living fellowship.
                </>
              )}
            </h2>
          </div>
          <div>
            <h3>{language === 'no' ? 'Alle er velkomne.' : 'All are welcome.'}</h3>
            <p>
              {language === 'no'
                ? 'Du trenger ikke å være kalt til profetembetet for å vokse i de profetiske gavene. HKPC er for deg som lengter etter et nærere forhold til Jesus og et trygt sted å bli utrustet.'
                : 'You do not need to be called to the fivefold prophetic office to grow in the prophetic gifts. HKPC is for anyone who longs for a closer relationship with Jesus and a safe place to be equipped.'}
            </p>
            <p>
              {language === 'no'
                ? 'Vi forener bibelundervisning, bønn og praktisk trening — med rom for å lære, spørre og vokse sammen.'
                : 'We unite Bible teaching, prayer, and hands-on activation — with room to learn, ask questions, and grow together.'}
            </p>
            <div className="signature">
              {language === 'no' ? 'Guds ord som fundament. Jesus i sentrum.' : 'God’s word as our foundation. Jesus at the center.'}
            </div>
          </div>
        </section>

        {/* School & Programs Section */}
        <section className="school section" id="school">
          <div className="wrap">
            <div className="section-head">
              <div>
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
              </div>
              <p>
                {language === 'no'
                  ? 'Studer i eget tempo, og bli en del av et fellesskap med ukentlige Zoom-kvelder og personlig veiledning.'
                  : 'Study at your own pace, and become part of a community with weekly live Zoom gatherings and personal mentoring.'}
              </p>
            </div>

            <div className="programs">
              <article className="program primary">
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
              </article>

              <article className="program secondary">
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
              </article>
            </div>

            <div className="format">
              <div>
                <span>01</span>
                <h4>{language === 'no' ? 'Fleksibelt i hverdagen' : 'Flexible in everyday life'}</h4>
                <p>{language === 'no' ? 'Videoer og oppgaver i ditt eget tempo.' : 'Video lectures and assignments at your own pace.'}</p>
              </div>
              <div>
                <span>02</span>
                <h4>{language === 'no' ? 'Sammen hver uke' : 'Together every week'}</h4>
                <p>{language === 'no' ? 'Zoom-kvelder med bønn og fagdrøfting.' : 'Live Zoom gatherings with prayer and curriculum discussions.'}</p>
              </div>
              <div>
                <span>03</span>
                <h4>{language === 'no' ? 'Fra ord til praksis' : 'From word to practice'}</h4>
                <p>{language === 'no' ? 'Profetisk trening i et trygt fellesskap.' : 'Prophetic activation in a supportive environment.'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Curriculum Section */}
        <section className="section wrap curriculum" id="curriculum">
          <div className="section-head">
            <div>
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
            </div>
            <p>
              {language === 'no'
                ? 'Sunn teologi, personlig relasjon til Jesus og praktisk åpenbaring. Fire områder som henger sammen.'
                : 'Sound theology, personal intimacy with Jesus, and practical revelation. Four connected core areas.'}
            </p>
          </div>

          <div className="topics">
            <article>
              <span>01</span>
              <h3>{language === 'no' ? 'Fundament & relasjon' : 'Foundation & Intimacy'}</h3>
              <p>{language === 'no' ? 'Bønn, identitet i Kristus og å høre Guds røst.' : 'Prayer, identity in Christ, and hearing God’s voice.'}</p>
            </article>
            <article>
              <span>02</span>
              <h3>{language === 'no' ? 'Profetisk utrustning & gaver' : 'Prophetic Equipping & Gifts'}</h3>
              <p>{language === 'no' ? 'Åndens gaver, personlig profeti og sunn praksis.' : 'Gifts of the Spirit, personal prophecy, and sound biblical practice.'}</p>
            </article>
            <article>
              <span>03</span>
              <h3>{language === 'no' ? 'Indre helbredelse & utfrielse' : 'Inner Healing & Deliverance'}</h3>
              <p>{language === 'no' ? 'Undervisning om frihet, omvendelse og helbredelse.' : 'Teaching on freedom, repentance, and emotional healing.'}</p>
            </article>
            <article>
              <span>04</span>
              <h3>{language === 'no' ? 'Kristenliv & tjeneste' : 'Christian Living & Ministry'}</h3>
              <p>{language === 'no' ? 'Tro i hverdagen, forvaltning, smågrupper og misjon.' : 'Faith in daily life, stewardship, small groups, and mission.'}</p>
            </article>
          </div>

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
            <div className="portraits">
              <figure>
                <img 
                  src="/assets/hilde.jpg" 
                  alt="Hilde Karin Knutsen" 
                />
                <figcaption>
                  Hilde Karin Knutsen
                  <small>{language === 'no' ? 'Rektor og underviser' : 'Principal & Teacher'}</small>
                </figcaption>
              </figure>
              <figure>
                <img 
                  src="/assets/thomas.jpeg" 
                  alt="Thomas Knutsen" 
                />
                <figcaption>
                  Thomas Knutsen
                  <small>{language === 'no' ? 'Administrator og faglærer' : 'Administrator & Teacher'}</small>
                </figcaption>
              </figure>
            </div>

            <div className="about-copy">
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
            </div>
          </div>
        </section>

        {/* Resources Section */}
        <section className="section wrap resources" id="resources">
          <p className="eyebrow purple">
            {language === 'no' ? 'RESSURSER FOR REISEN' : 'RESOURCES FOR THE JOURNEY'}
          </p>
          <div className="section-head">
            <h2>{language === 'no' ? 'Ta læringen med deg.' : 'Take your learning further.'}</h2>
            <p>
              {language === 'no'
                ? 'Fordyp deg videre med undervisning, bøker og læremidler fra His Kingdom.'
                : 'Deepen your walk with teachings, books, and study materials from His Kingdom.'}
            </p>
          </div>
          <div className="resource-grid">
            <article>
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
            </article>
            <article>
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
            </article>
          </div>
        </section>

        {/* Admissions Section */}
        <section className="admissions" id="admissions">
          <div className="wrap">
            <p className="eyebrow purple">{language === 'no' ? 'DITT NESTE STEG' : 'YOUR NEXT STEP'}</p>
            <h2>{language === 'no' ? 'Begynn din reise.' : 'Begin your journey.'}</h2>
            <p>
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
            </p>

            <div className="admission-box">
              <div>
                <b>{language === 'no' ? 'Opptak til skoleåret 2027' : 'Admissions for Academic Year 2027'}</b>
                <span>
                  {language === 'no'
                    ? 'Søknadsperiode 1. januar – 30. juni · Kickoff 27. august'
                    : 'Application period Jan 1 – June 30 · Kickoff August 27'}
                </span>
              </div>
              <button className="button purple-button" onClick={() => navigate('/admission')}>
                {language === 'no' ? 'Søk nå' : 'Apply now'}
              </button>
            </div>

            <details id="requirements">
              <summary>
                {language === 'no' ? 'Praktisk informasjon og opptakskrav' : 'Practical info & admission criteria'}
              </summary>
              <p>
                {language === 'no'
                  ? 'Førsteår: 10 000 kr for fullt år, pluss 500 kr i oppstart/administrasjon og 500 kr for kickoff kost/losji. Andreår starter i 2028 og krever fullført førsteår og ny søknad. Undervisningen foregår på engelsk.'
                  : 'First year: 10,000 NOK for full academic year, plus 500 NOK in administration/registration and 500 NOK for kickoff meals and lodging. Second year begins in 2028 and requires completed first year and separate application. All instruction is in English.'}
              </p>
            </details>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="wrap">
          <a className="brand" href="#" onClick={handleLogoClick}>
            <img src="/assets/logo.png" alt="HKPC logo" />
            <span>
              HKPC
              <small>His Kingdom Prophetic Community</small>
            </span>
          </a>
          <p>{language === 'no' ? 'Forankret i Skriften. Utrustet til tjeneste.' : 'Grounded in Scripture. Equipped for ministry.'}</p>
          
          <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--muted)', flexWrap: 'wrap' }}>
            <Link to="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>
              {language === 'no' ? 'Personvern' : 'Privacy Policy'}
            </Link>
            <Link to="/terms" style={{ textDecoration: 'none', color: 'inherit' }}>
              {language === 'no' ? 'Brukervilkår' : 'Terms of Service'}
            </Link>
            <Link to="/accessibility" style={{ textDecoration: 'none', color: 'inherit' }}>
              {language === 'no' ? 'Tilgjengelighet' : 'Accessibility'}
            </Link>
          </div>

          <small>
            {language === 'no'
              ? '© 2027 His Kingdom Prophetic Community. All rights reserved.'
              : '© 2027 His Kingdom Prophetic Community. All rights reserved.'}
          </small>
        </div>
      </footer>
    </div>
  );
}
