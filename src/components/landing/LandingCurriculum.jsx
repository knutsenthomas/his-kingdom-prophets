import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import CmsText from '@/components/CmsText';
import { fadeInUp, staggerContainer } from './animations';

export default function LandingCurriculum() {
  const { language } = useApp();

  return (
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
            <CmsText slug="landing-curriculum-eyebrow" fallback={language === 'no' ? 'FAGPLAN · FØRSTE ÅR' : 'CURRICULUM · FIRST YEAR'} />
          </p>
          <h2>
            <CmsText
              slug="landing-curriculum-title"
              multiline
              fallback={language === 'no' ? 'Tro som får røtter.\nGaver som får vokse.' : 'Faith that takes root.\nGifts that flourish.'}
            />
          </h2>
        </motion.div>
        <motion.p variants={fadeInUp}>
          <CmsText
            slug="landing-curriculum-desc"
            fallback={language === 'no'
              ? 'Sunn teologi, personlig relasjon til Jesus og praktisk åpenbaring. Fire områder som henger sammen.'
              : 'Sound theology, personal intimacy with Jesus, and practical revelation. Four connected core areas.'}
          />
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
          <span className="topic-num">01</span>
          <h3><CmsText slug="landing-topic-1-title" fallback={language === 'no' ? 'Fundament & relasjon' : 'Foundation & Intimacy'} /></h3>
          <p><CmsText slug="landing-topic-1-desc" fallback={language === 'no' ? 'Bønn, identitet i Kristus og å høre Guds røst.' : 'Prayer, identity in Christ, and hearing God’s voice.'} /></p>
        </motion.article>
        <motion.article variants={fadeInUp} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
          <span className="topic-num">02</span>
          <h3><CmsText slug="landing-topic-2-title" fallback={language === 'no' ? 'Profetisk utrustning & gaver' : 'Prophetic Equipping & Gifts'} /></h3>
          <p><CmsText slug="landing-topic-2-desc" fallback={language === 'no' ? 'Åndens gaver, personlig profeti og sunn praksis.' : 'Gifts of the Spirit, personal prophecy, and sound biblical practice.'} /></p>
        </motion.article>
        <motion.article variants={fadeInUp} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
          <span className="topic-num">03</span>
          <h3><CmsText slug="landing-topic-3-title" fallback={language === 'no' ? 'Indre helbredelse & utfrielse' : 'Inner Healing & Deliverance'} /></h3>
          <p><CmsText slug="landing-topic-3-desc" fallback={language === 'no' ? 'Undervisning om frihet, omvendelse og helbredelse.' : 'Teaching on freedom, repentance, and emotional healing.'} /></p>
        </motion.article>
        <motion.article variants={fadeInUp} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
          <span className="topic-num">04</span>
          <h3><CmsText slug="landing-topic-4-title" fallback={language === 'no' ? 'Kristenliv & tjeneste' : 'Christian Living & Ministry'} /></h3>
          <p><CmsText slug="landing-topic-4-desc" fallback={language === 'no' ? 'Tro i hverdagen, forvaltning, smågrupper og misjon.' : 'Faith in daily life, stewardship, small groups, and mission.'} /></p>
        </motion.article>
      </motion.div>

      <details>
        <summary><CmsText slug="landing-curriculum-summary" fallback={language === 'no' ? 'Se mer om fagene' : 'Read more about the courses'} /></summary>
        <p>
          <CmsText
            slug="landing-curriculum-course-overview"
            fallback={language === 'no'
              ? 'Førsteåret gir undervisning i blant annet Profeti 101, å høre Guds stemme, gaver og tjeneste, bønn og faste, gudsfrykt, nådegaver og praktisk kristenliv.'
              : 'The first year includes teaching on Prophecy 101, hearing God’s voice, gifts and ministry, prayer and fasting, the fear of the Lord, spiritual gifts and everyday Christian life.'}
          />
        </p>
      </details>
    </section>
  );
}
