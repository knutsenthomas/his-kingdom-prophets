import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import CmsText from '@/components/CmsText';
import { faqItems } from '@/data/landingFaq';
import { fadeInUp, staggerContainer } from './animations';

export default function LandingFaq() {
  const navigate = useNavigate();
  const { language, isAdminEditing } = useApp();
  const [openFaqIndexes, setOpenFaqIndexes] = useState([]);

  const toggleFaq = (index) => {
    setOpenFaqIndexes(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const openAllFaqs = () => {
    setOpenFaqIndexes(faqItems.map((_, i) => i));
  };

  const closeAllFaqs = () => {
    setOpenFaqIndexes([]);
  };

  return (
    <section className="section wrap faq-section" id="faq" aria-labelledby="faq-heading">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={staggerContainer}
        className="faq-header"
      >
        <motion.p className="eyebrow purple" variants={fadeInUp}>
          <CmsText slug="landing-faq-eyebrow" fallback={language === 'no' ? 'SPØRSMÅL & SVAR' : 'FREQUENTLY ASKED QUESTIONS'} />
        </motion.p>
        <motion.h2 id="faq-heading" variants={fadeInUp}>
          <CmsText slug="landing-faq-title" fallback={language === 'no' ? 'Alt du lurer på om HKPC' : 'Everything you need to know about HKPC'} />
        </motion.h2>
        <motion.p className="faq-subtitle" variants={fadeInUp}>
          <CmsText 
            slug="landing-faq-desc" 
            fallback={language === 'no'
              ? 'Her finner du svar på de vanligste spørsmålene om undervisning, opptak, priser og studiehverdagen.'
              : 'Here you will find answers to the most common questions regarding teaching, admissions, tuition, and student life.'} 
          />
        </motion.p>
      </motion.div>

      {isAdminEditing && (
        <div className="flex items-center justify-end gap-2 mb-3 max-w-[860px] mx-auto px-2">
          <button 
            type="button" 
            onClick={openAllFaqs} 
            className="text-xs px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium transition cursor-pointer border border-purple-200"
          >
            📂 {language === 'no' ? 'Åpne alle spørsmål for redigering' : 'Open all questions for editing'}
          </button>
          <button 
            type="button" 
            onClick={closeAllFaqs} 
            className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition cursor-pointer border border-gray-200"
          >
            📁 {language === 'no' ? 'Lukk alle' : 'Close all'}
          </button>
        </div>
      )}

      <div className="faq-container">
        {faqItems.map((item, idx) => {
          const isOpen = openFaqIndexes.includes(idx);
          const qFallback = language === 'no' ? item.q_no : item.q_en;
          const aFallback = language === 'no' ? item.a_no : item.a_en;

          return (
            <div key={idx} className={`faq-item ${isOpen ? 'is-open' : ''}`}>
              <div
                role="button"
                tabIndex={0}
                className="faq-trigger"
                onClick={() => toggleFaq(idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleFaq(idx);
                  }
                }}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${idx}`}
              >
                <span className="faq-trigger-text">
                  <CmsText 
                    slug={`landing-faq-q-${idx}`} 
                    fallback={qFallback} 
                  />
                </span>
                <span className="faq-icon-wrapper" aria-hidden="true">
                  <ChevronDown size={18} />
                </span>
              </div>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-answer-${idx}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ 
                      height: { duration: 0.18, ease: [0.04, 0.62, 0.23, 0.98] },
                      opacity: { duration: 0.14, ease: "easeOut" }
                    }}
                    className="faq-answer"
                  >
                    <p>
                      <CmsText 
                        slug={`landing-faq-a-${idx}`} 
                        fallback={aFallback} 
                      />
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="faq-cta-box">
        <div>
          <strong className="block text-base text-[#271f30] font-bold">
            <CmsText 
              slug="landing-faq-cta-title" 
              fallback={language === 'no' ? 'Fant du ikke det du lette etter?' : 'Didn’t find what you were looking for?'} 
            />
          </strong>
          <small className="block text-sm text-[#6d6575] mt-1">
            <CmsText 
              slug="landing-faq-cta-desc" 
              fallback={language === 'no' 
                ? 'Vi hjelper deg gjerne! Ta kontakt med oss via vår kontaktside.' 
                : 'We are here to help! Reach out to us via our support page.'} 
            />
          </small>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!isAdminEditing) navigate('/support');
          }}
          className="faq-cta-btn"
        >
          <HelpCircle size={16} />
          <span>
            <CmsText 
              slug="landing-faq-cta-btn" 
              fallback={language === 'no' ? 'Kontakt oss' : 'Contact Support'} 
            />
          </span>
        </button>
      </div>
    </section>
  );
}
