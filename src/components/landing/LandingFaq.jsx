import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Edit3, Check, ExternalLink, Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import CmsText from '@/components/CmsText';
import { faqItems } from '@/data/landingFaq';
import { fadeInUp, staggerContainer } from './animations';

export default function LandingFaq() {
  const navigate = useNavigate();
  const { user, language, isAdminEditing, setIsAdminEditing } = useApp();
  const [openFaqIndexes, setOpenFaqIndexes] = useState([]);

  // Check if current user is an authorized admin or teacher
  const ADMIN_EMAILS = ['knutsenthomas@gmail.com', 'thomas@tk-design.no', 'thomas@hiskingdomministry.no'];
  const userEmail = user?.email?.toLowerCase();
  const isAdminUser = Boolean(
    user?.role === 'admin' || 
    user?.role === 'superadmin' || 
    user?.role === 'teacher' || 
    ADMIN_EMAILS.includes(userEmail)
  );

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

  // When admin editing mode is enabled, auto-expand all FAQs so questions and answers are visible and directly editable
  useEffect(() => {
    if (isAdminEditing) {
      setOpenFaqIndexes(faqItems.map((_, i) => i));
    }
  }, [isAdminEditing]);

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

      {/* Prominent FAQ Admin Toolbar for authorized teachers/admins */}
      {isAdminUser && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-3.5 bg-purple-50/90 border border-purple-200/90 rounded-2xl shadow-sm max-w-[860px] mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#561291] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Spørsmål & Svar (FAQ) Administrasjon</p>
              <p className="text-[11px] text-slate-500">
                {isAdminEditing 
                  ? 'Visuell redigering er aktiv: Klikk direkte på et spørsmål eller svar under for å skrive.' 
                  : 'Du kan redigere spørsmål og svar direkte på siden, eller administrere i CMS-panelet.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                const next = !isAdminEditing;
                setIsAdminEditing(next);
                if (next) openAllFaqs();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                isAdminEditing 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                  : 'bg-[#561291] text-white hover:bg-[#561291]/90'
              }`}
            >
              {isAdminEditing ? (
                <>
                  <Check size={14} />
                  <span>Fullfør redigering</span>
                </>
              ) : (
                <>
                  <Edit3 size={14} />
                  <span>Rediger FAQ direkte</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/cms?category=faq')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Åpne CMS-styring for FAQ"
            >
              <ExternalLink size={13} />
              <span>Åpne i CMS</span>
            </button>
            {isAdminEditing && (
              <>
                <button
                  type="button"
                  onClick={openAllFaqs}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-purple-700 bg-purple-100/70 hover:bg-purple-100 transition cursor-pointer"
                  title="Åpne alle spørsmål"
                >
                  Åpne alle
                </button>
                <button
                  type="button"
                  onClick={closeAllFaqs}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                  title="Lukk alle spørsmål"
                >
                  Lukk alle
                </button>
              </>
            )}
          </div>
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
                onClick={() => {
                  if (!isAdminEditing) {
                    toggleFaq(idx);
                  } else if (!isOpen) {
                    toggleFaq(idx);
                  }
                }}
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
                <span 
                  className="faq-icon-wrapper" 
                  aria-hidden="true"
                  onClick={(e) => {
                    if (isAdminEditing) {
                      e.stopPropagation();
                      toggleFaq(idx);
                    }
                  }}
                >
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
                    <div className="faq-answer-inner text-[#4b4353] text-[15px] leading-relaxed">
                      <CmsText 
                        as="div"
                        slug={`landing-faq-a-${idx}`} 
                        fallback={aFallback} 
                      />
                    </div>
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
