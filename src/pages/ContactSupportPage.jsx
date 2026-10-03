import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Globe, Send, User, HelpCircle, Phone, MapPin, Sparkles } from 'lucide-react';
import logo from '@/assets/logo.png';
import CmsText from '@/components/CmsText';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import SeoHead from '@/components/SeoHead';

export default function ContactSupportPage() {
  const navigate = useNavigate();
  const { user, showToast, language, toggleLanguage, submitSupportTicket } = useApp();

  const isEn = language === 'en';

  const [form, setForm] = useState({
    name: '',
    email: user?.email || '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim() || !form.subject.trim()) {
      showToast(isEn ? 'Please fill out all fields.' : 'Vennligst fyll ut alle feltene.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await submitSupportTicket({
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
        source: 'contact_page'
      });
      showToast(isEn ? 'Support ticket created successfully!' : 'Støttehenvendelse opprettet!');
      setSuccess(true);
    } catch (err) {
      showToast(isEn ? 'Failed to submit ticket. Please try again.' : 'Klarte ikke å sende henvendelse. Vennligst prøv igjen.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F6F4F8] min-h-screen flex flex-col font-sans text-slate-800">
      <SeoHead
        title={isEn ? "Contact & Support | His Kingdom Prophetic Community" : "Kontakt & Støtte | His Kingdom Prophetic Community"}
        description={isEn 
          ? "Get in touch with the team at His Kingdom Prophetic Community (HKPC). We are here to answer questions about admissions, studies, and programs."
          : "Ta kontakt med oss i His Kingdom Prophetic Community (HKPC). Vi svarer gjerne på spørsmål om opptak, studieløp og undervisning."}
        canonicalPath="/support"
        keywords="kontakt HKPC, support bibelskole, henvendelser, His Kingdom Ministry, spørsmål opptak"
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "ContactPage",
              "@id": "https://hkpc.no/support#webpage",
              "url": "https://hkpc.no/support",
              "name": isEn ? "Contact HKPC" : "Kontakt HKPC",
              "description": "Kontaktinformasjon og kontaktskjema for His Kingdom Prophetic Community."
            },
            {
              "@type": "BreadcrumbList",
              "@id": "https://hkpc.no/support#breadcrumb",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Hjem",
                  "item": "https://hkpc.no/"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": isEn ? "Contact & Support" : "Kontakt & Støtte",
                  "item": "https://hkpc.no/support"
                }
              ]
            }
          ]
        }}
      />
      
      {/* Site Header */}
      <SiteHeader />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* Left Column - Contact Details */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8 flex flex-col justify-center">
            <div className="space-y-4">
              <span className="px-3.5 py-1 rounded-full bg-[#561291]/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-[#561291]/20">
                <CmsText slug="support-hero-tag" fallback={isEn ? 'Direct Support' : 'Brukerstøtte'} />
              </span>
              <h1 className="font-sans text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#561291] leading-tight break-words">
                <CmsText slug="support-hero-title" fallback={isEn ? 'Get in Touch with Us' : 'Kontakt Kundestøtte'} />
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                <CmsText slug="support-hero-desc" fallback={isEn ? 'Have theological questions, need help with assignments, or experiencing technical glitches? We are here to support your prophetic journey.' : 'Har du teologiske spørsmål, trenger hjelp med oppgaver eller opplever tekniske problemer? Vi er klare til å hjelpe deg videre i din tjeneste.'} />
              </p>
            </div>

            {/* Quick Contact Details */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200/50 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wide">
                    <CmsText slug="support-email-title" fallback={isEn ? 'Email Support' : 'E-post support'} />
                  </h4>
                  <p className="text-xs font-semibold text-slate-700 mt-1">
                    <CmsText slug="support-email-address" fallback="school@hiskingdomministry.no" />
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                    <CmsText slug="support-email-time" fallback={isEn ? 'Response time: Within 24 hours' : 'Svarstid: Innen 24 timer'} />
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200/50 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wide">
                    <CmsText slug="support-office-title" fallback={isEn ? 'Organization' : 'Organisasjon'} />
                  </h4>
                  <p className="text-xs font-semibold text-slate-700 mt-1">
                    <CmsText slug="support-office-name" fallback="His Kingdom Ministry" />
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                    <CmsText slug="support-office-location" fallback="Norge" />
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Interactive Form */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.div 
                  key="contact-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white border border-slate-200/60 rounded-2xl p-5 sm:p-8 md:p-10 shadow-md space-y-6"
                >
                  <h3 className="font-sans text-xl sm:text-2xl font-bold text-primary border-b border-slate-100 pb-4 flex items-center gap-2">
                    <Mail size={20} className="text-[#D7B978]" /> 
                    <CmsText slug="support-form-title" fallback={isEn ? 'Send us a Message' : 'Send oss en henvendelse'} />
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">
                          <CmsText slug="support-form-label-name" fallback={isEn ? 'Your Name' : 'Ditt navn'} />
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder={isEn ? 'Your name...' : 'Ditt navn...'}
                            className="w-full min-h-[44px] px-4 py-3 bg-slate-50 border border-outline-variant/35 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl text-base sm:text-sm font-semibold outline-none transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">
                          <CmsText slug="support-form-label-email" fallback={isEn ? 'Email Address' : 'E-postadresse'} />
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder={isEn ? 'Email address...' : 'E-postadresse...'}
                            className="w-full min-h-[44px] px-4 py-3 bg-slate-50 border border-outline-variant/35 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl text-base sm:text-sm font-semibold outline-none transition-all"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">
                        <CmsText slug="support-form-label-subject" fallback={isEn ? 'Subject' : 'Hva gjelder henvendelsen?'} />
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={form.subject}
                          onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder={isEn ? 'Subject...' : 'Hva gjelder henvendelsen?...'}
                          className="w-full min-h-[44px] px-4 py-3 bg-slate-50 border border-outline-variant/35 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl text-base sm:text-sm font-semibold outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">
                        <CmsText slug="support-form-label-message" fallback={isEn ? 'Detailed Message' : 'Utdypende beskrivelse'} />
                      </label>
                      <textarea
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                        placeholder={isEn ? 'Describe your request here...' : 'Skriv din henvendelse her...'}
                        className="w-full p-4 bg-slate-50 border border-outline-variant/35 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl text-base sm:text-sm font-medium outline-none transition-all resize-none leading-relaxed"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full min-h-[44px] py-3.5 bg-primary hover:bg-[#0f344c] text-white text-sm font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span><CmsText slug="support-form-submitting" fallback={isEn ? 'Submitting...' : 'Sender henvendelse...'} /></span>
                      ) : (
                        <>
                          <Send size={14} />
                          <span><CmsText slug="support-form-submit" fallback={isEn ? 'Send Message' : 'Send Henvendelse'} /></span>
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div 
                  key="contact-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-slate-200/60 rounded-2xl p-8 sm:p-12 shadow-md text-center space-y-6"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center mx-auto text-xl shadow-inner">
                    <Sparkles size={28} className="animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-sans text-2xl font-bold text-primary">
                      <CmsText slug="support-success-title" fallback={isEn ? 'Thank you!' : 'Tusen takk!'} />
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
                      <CmsText slug="support-success-desc" fallback={isEn ? 'Your ticket has been registered. One of our mentors or faglærere will reply to your email shortly.' : 'Din henvendelse er registrert. En av våre faglærere eller mentorer vil svare deg på e-post innen kort tid.'} />
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setForm({ name: '', email: user?.email || '', subject: '', message: '' });
                      setSuccess(false);
                    }}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-primary text-xs font-bold rounded-lg transition-all active:scale-95"
                  >
                    <CmsText slug="support-success-new-btn" fallback={isEn ? 'Send another message' : 'Send en ny henvendelse'} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
