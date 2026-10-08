import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Heart, Users, ChevronDown } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import CmsText from '@/components/CmsText';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import SeoHead from '@/components/SeoHead';
import '@/styles/hkpc-redesign.css';

export default function AboutPage() {
  const { language } = useApp();
  const no = language === 'no';
  const [showPrayerTeam, setShowPrayerTeam] = useState(false);
  const text = (norwegian, english) => no ? norwegian : english;
  const pillars = [
    { icon: BookOpen, title: text('Forankret i Skriften', 'Grounded in Scripture'), description: text('Bibelen er fundamentet for undervisningen. Vi ønsker å forene solid bibelsk teologi med et levende forhold til Jesus.', 'The Bible is the foundation of our teaching. We seek to unite sound biblical theology with a living relationship with Jesus.') },
    { icon: Heart, title: text('Tro i hverdagen', 'Faith in everyday life'), description: text('Bønn, karakter og disippelskap hører sammen. Det vi lærer, skal få vokse til virksom tro og tjeneste i hverdagen.', 'Prayer, character and discipleship belong together. What we learn should grow into active faith and ministry in everyday life.') },
    { icon: Users, title: text('Et fellesskap å vokse i', 'A community to grow in'), description: text('Gjennom undervisning, samtaler og praktisk trening gir vi rom for å lære, spørre og vokse sammen.', 'Through teaching, conversations and practical training, we make room to learn, ask questions and grow together.') },
  ];
  const prayerTeam = ['Amanda Umorey', 'Barbara H Nuckolls', 'Caterina Wassner', 'Darryl Nash', 'Donald Forrest', 'Elisabeth Hamm', 'Erin Schuurs', 'Estelle Hollis', 'Hazel Shane Nercessian', 'Jennifer Olaribigbe', 'Juana Särg-Raani', 'Kevin Hamm', 'Linni Weishaar', 'Na-Kesah Ceasar', 'Ruben Florido', 'Victoria Thoresen'];
  return (
    <div className="hkpc-landing about-page min-h-screen">
      <SeoHead title={text('Om oss | His Kingdom Prophetic Community', 'About us | His Kingdom Prophetic Community')} description={text('Bli kjent med HKPC, vårt bibelske fundament og staben: Hilde Karin og Thomas Knutsen.', 'Get to know HKPC, our biblical foundation and our team: Hilde Karin and Thomas Knutsen.')} canonicalPath="/about" />
      <SiteHeader />
      <main>
        <section className="about-page-hero">
          <div className="wrap">
            <Link to="/" className="about-back"><ArrowLeft size={18} />{text('Tilbake til forsiden', 'Back to home')}</Link>
            <p className="eyebrow">{text('OM OSS', 'ABOUT US')}</p>
            <h1>{text('Et fellesskap med Jesus i sentrum.', 'A community with Jesus at the centre.')}</h1>
            <p className="about-page-intro"><CmsText slug="about-page-intro" fallback={text('His Kingdom Prophetic Community er en åpenbaringsskole for profetisk utrustning, bibelundervisning og åndelig vekst. Vi ønsker å hjelpe mennesker til å vokse i fortrolighet med Gud og leve ut troen i hverdagen.', 'His Kingdom Prophetic Community is a school for prophetic equipping, Bible teaching and spiritual growth. We seek to help people grow in intimacy with God and live out their faith in everyday life.')} /></p>
            <nav className="about-section-nav" aria-label={text('På denne siden', 'On this page')}>
              <a href="#foundation">{text('Vårt fundament', 'Our foundation')}</a>
              <a href="#team">{text('Ledelse og stab', 'Leadership and team')}</a>
              <a href="#history">{text('Historien bak', 'Our story')}</a>
            </nav>
          </div>
        </section>
        <section className="section wrap" id="foundation">
          <p className="eyebrow">{text('DET VI BYGGER PÅ', 'WHAT WE BUILD ON')}</p>
          <h2>{text('Forankret i Skriften. Levd ut i fellesskap.', 'Grounded in Scripture. Lived out in community.')}</h2>
          <div className="about-values-grid">
            {pillars.map(({ icon: Icon, title, description }, index) => <article className="about-value-card" key={index}><Icon size={26} aria-hidden="true" /><h3>{title}</h3><p>{description}</p></article>)}
          </div>
        </section>
        <section className="about-team-section section" id="team">
          <div className="wrap">
            <p className="eyebrow">{text('MENNESKENE BAK HIS KINGDOM PROPHETIC COMMUNITY', 'THE PEOPLE BEHIND HIS KINGDOM PROPHETIC COMMUNITY')}</p>
            <h2>{text('Mennesker med et felles hjerte.', 'People with a shared heart.')}</h2>
            <p className="about-section-intro"><CmsText slug="about-page-team-intro" fallback={text('Hilde Karin og Thomas Knutsen leder His Kingdom Ministry med et hjerte for misjon, disippelskap og utrustning.', 'Hilde Karin and Thomas Knutsen lead His Kingdom Ministry with a heart for mission, discipleship and equipping believers.')} /></p>
            <div className="about-team-grid">
              <article className="about-team-card"><img src="/assets/hilde.jpg" alt="Hilde Karin Knutsen" width="400" height="400" loading="lazy" /><div><h3>Hilde Karin Knutsen</h3><p className="about-team-role"><CmsText slug="landing-about-role-hilde" fallback={text('Rektor og underviser', 'Principal and teacher')} /></p><p><CmsText slug="about-page-hilde-bio" fallback={text('Hilde Karin er rektor og underviser og leder His Kingdom Ministry sammen med Thomas. Hun har et hjerte for bønn, disippelskap og profetisk utrustning.', 'Hilde Karin is the principal and a teacher and leads His Kingdom Ministry together with Thomas. She has a heart for prayer, discipleship and prophetic equipping.')} /></p></div></article>
              <article className="about-team-card"><img src="/assets/thomas.jpeg" alt="Thomas Knutsen" width="400" height="400" loading="lazy" /><div><h3>Thomas Knutsen</h3><p className="about-team-role"><CmsText slug="landing-about-role-thomas" fallback={text('Administrator og faglærer', 'Administrator and teacher')} /></p><p><CmsText slug="about-page-thomas-bio" fallback={text('Thomas er administrator og faglærer og leder His Kingdom Ministry sammen med Hilde Karin. Han kombinerer skolens administrative arbeid med et hjerte for bibelundervisning og disippelskap.', 'Thomas is an administrator and teacher and leads His Kingdom Ministry together with Hilde Karin. He combines the school’s administrative work with a heart for Bible teaching and discipleship.')} /></p></div></article>
              <article className="about-team-card"><span className="about-profile-initials" aria-hidden="true">AT</span><div><h3>Anne-Linn Torgersen</h3><p className="about-team-role">{text('Medieansvarlig', 'Media coordinator')}</p><p><CmsText slug="about-page-anne-linn-bio" fallback={text('Anne-Linn er en del av staben og har ansvaret for media. Rollen hennes knytter sammen skolens innhold og måten det formidles på, slik at flere kan bli kjent med undervisningen og fellesskapet.', 'Anne-Linn is part of the staff and is responsible for media. Her role connects the school’s content with how it is shared, helping more people get to know the teaching and community.')} /></p></div></article>
            </div>
            <section className="about-additional-team about-prayer-panel" aria-labelledby="prayer-team-heading">
              <div className="about-prayer-header">
                <div className="about-prayer-heading"><span className="about-team-symbol" aria-hidden="true"><Heart size={26} /></span><div><p className="eyebrow">{text('SAMMEN I BØNN', 'TOGETHER IN PRAYER')}</p><h3 id="prayer-team-heading">{text('HKM-bønneteam', 'HKM prayer team')}</h3><p className="about-team-count">{new Set(prayerTeam).size} {text('medlemmer', 'members')}</p></div></div>
                <button type="button" className="about-team-toggle" aria-expanded={showPrayerTeam} aria-controls="prayer-team-members" onClick={() => setShowPrayerTeam(value => !value)}>{text(showPrayerTeam ? 'Skjul teamet' : 'Vis teamet', showPrayerTeam ? 'Hide team' : 'Show team')}<ChevronDown size={18} className={showPrayerTeam ? 'is-open' : ''} /></button>
              </div>
              <ul id="prayer-team-members" className="about-name-grid" hidden={!showPrayerTeam}>{[...new Set(prayerTeam)].map(name => <li key={name}><span className="about-member-initials" aria-hidden="true">{name.split(/\s+/).filter(Boolean).map(part => part[0]).slice(0, 2).join('')}</span><span className="about-member-name">{name}</span><span className="about-member-role">{text('Bønneteam', 'Prayer team')}</span></li>)}</ul>
            </section>
          </div>
        </section>
        <section className="section wrap about-history-section" id="history">
          <div><p className="eyebrow">{text('HISTORIEN BAK', 'OUR STORY')}</p><h2>{text('Et hjerte for Guds folk.', 'A heart for God’s people.')}</h2></div>
          <div><p><CmsText slug="landing-about-history-detail" fallback={text('Arbeidet har røtter i His Kingdom Foundation, grunnlagt i 2008. Etter at Hilde Karin og Thomas giftet seg i 2023, ble tjenesten videreført og utvidet som His Kingdom Ministry.', 'The ministry has roots in His Kingdom Foundation, established in 2008. After Hilde Karin and Thomas married in 2023, the work was continued and expanded as His Kingdom Ministry.')} /></p><p><CmsText slug="landing-about-p2" fallback={text('Gjennom bønn, bibelundervisning og tjeneste ønsker de å hjelpe mennesker til å vokse i fortrolighet med Gud og virksom tro i hverdagen.', 'Through prayer, Bible teaching and ministry, they desire to help people grow in intimacy with God and active faith in everyday life.')} /></p><a href="https://hiskingdomministry.no" target="_blank" rel="noopener noreferrer">{text('Bli kjent med His Kingdom Ministry', 'Get to know His Kingdom Ministry')} <ArrowRight size={16} /><span className="sr-only">{text('(åpnes i ny fane)', '(opens in a new tab)')}</span></a></div>
        </section>
        <section className="about-contact section"><div className="wrap"><h2>{text('Vil du bli bedre kjent med oss?', 'Would you like to get to know us?')}</h2><p>{text('Ta kontakt med spørsmål om skolen, undervisningen eller studiehverdagen.', 'Contact us with questions about the school, teaching or student life.')}</p><Link to="/support">{text('Kontakt oss', 'Contact us')} <ArrowRight size={18} /></Link></div></section>
      </main>
      <SiteFooter />
    </div>
  );
}
