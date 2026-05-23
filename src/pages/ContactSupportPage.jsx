import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Globe, Send, User, HelpCircle, Phone, MapPin, Sparkles } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function ContactSupportPage() {
  const navigate = useNavigate();
  const { user, showToast, language, toggleLanguage, submitSupportTicket } = useApp();

  const isEn = language === 'en';

  const [form, setForm] = useState({
    name: user?.name || '',
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
    <div className="bg-[#f8fafc] min-h-screen flex flex-col font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-sm">
        <div className="flex justify-between items-center w-full px-4 sm:px-6 md:px-12 h-20 max-w-[1440px] mx-auto">
          <div className="font-serif text-xl sm:text-2xl text-primary font-bold cursor-pointer flex items-center gap-2.5" onClick={() => navigate('/')}>
            <img src={logo} alt="His Kingdom Prophets Logo" className="w-8 h-8 object-contain shrink-0" />
            <span>His Kingdom Prophets</span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="px-3 py-1.5 border border-[#561291]/20 hover:border-primary text-xs font-bold uppercase rounded-lg text-primary bg-[#561291]/5 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
              title={isEn ? 'Bytt til norsk (Switch to Norwegian)' : 'Bytt til engelsk (Switch to English)'}
            >
              <Globe size={13} />
              <span>{isEn ? 'EN' : 'NO'}</span>
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:text-primary-container transition-colors"
            >
              <ArrowLeft size={16} />
              <span>{isEn ? 'Back' : 'Tilbake'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* Left Column - Contact Details */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8 flex flex-col justify-center">
            <div className="space-y-4">
              <span className="px-3.5 py-1 rounded-full bg-[#561291]/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-[#561291]/20">
                {isEn ? 'Direct Support' : 'Brukerstøtte'}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#561291] leading-tight">
                {isEn ? 'Get in Touch with Us' : 'Kontakt Kundestøtte'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                {isEn 
                  ? 'Have theological questions, need help with assignments, or experiencing technical glitches? We are here to support your prophetic journey.' 
                  : 'Har du teologiske spørsmål, trenger hjelp med oppgaver eller opplever tekniske problemer? Vi er klare til å hjelpe deg videre i din tjeneste.'}
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
                    {isEn ? 'Email Support' : 'E-post support'}
                  </h4>
                  <p className="text-xs font-semibold text-slate-700 mt-1">support@hiskingdomprophets.org</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                    {isEn ? 'Response time: Within 24 hours' : 'Svarstid: Innen 24 timer'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200/50 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wide">
                    {isEn ? 'Mentor Hotline' : 'Mentor kriselinje'}
                  </h4>
                  <p className="text-xs font-semibold text-slate-700 mt-1">+47 38 26 80 00</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                    {isEn ? 'Mon - Fri, 09:00 - 15:00 CET' : 'Man - Fre, 09:00 - 15:00'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200/50 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wide">
                    {isEn ? 'Administration Office' : 'Administrasjon'}
                  </h4>
                  <p className="text-xs font-semibold text-slate-700 mt-1">Mandal, Norge</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                    {isEn ? 'Mandal Regnskapskontor Building' : 'Mandal Regnskapskontor bygget'}
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
                  className="bg-white border border-slate-200/60 rounded-2xl p-6 sm:p-10 shadow-md space-y-6"
                >
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-primary border-b border-slate-100 pb-4 flex items-center gap-2">
                    <Mail size={20} className="text-[#c5a059]" /> 
                    {isEn ? 'Send us a Message' : 'Send oss en henvendelse'}
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">
                          {isEn ? 'Your Name' : 'Ditt navn'}
                        </label>
                        <div className="relative flex items-center">
                          <User size={14} className="absolute left-3 text-slate-400" />
                          <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-outline-variant/35 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl text-xs sm:text-sm font-semibold outline-none transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">
                          {isEn ? 'Email Address' : 'E-postadresse'}
                        </label>
                        <div className="relative flex items-center">
                          <Mail size={14} className="absolute left-3 text-slate-400" />
                          <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-outline-variant/35 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl text-xs sm:text-sm font-semibold outline-none transition-all"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">
                        {isEn ? 'Subject' : 'Hva gjelder henvendelsen?'}
                      </label>
                      <div className="relative flex items-center">
                        <HelpCircle size={14} className="absolute left-3 text-slate-400" />
                        <input
                          type="text"
                          value={form.subject}
                          onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder={isEn ? 'e.g., Assignment evaluation, Video error' : 'F.eks. Oppgavelink, Zoom feilmelding'}
                          className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-outline-variant/35 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl text-xs sm:text-sm font-semibold outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">
                        {isEn ? 'Detailed Message' : 'Utdypende beskrivelse'}
                      </label>
                      <textarea
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                        placeholder={isEn ? 'Describe your request here...' : 'Skriv din henvendelse her...'}
                        className="w-full p-4 bg-slate-50 border border-outline-variant/35 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl text-xs sm:text-sm font-medium outline-none transition-all resize-none leading-relaxed"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-primary hover:bg-[#0f344c] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span>{isEn ? 'Submitting...' : 'Sender henvendelse...'}</span>
                      ) : (
                        <>
                          <Send size={14} />
                          <span>{isEn ? 'Send Message' : 'Send Henvendelse'}</span>
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
                    <h3 className="font-serif text-2xl font-bold text-primary">
                      {isEn ? 'Thank you!' : 'Tusen takk!'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
                      {isEn 
                        ? 'Your ticket has been registered. One of our mentors or faglærere will reply to your email shortly.' 
                        : 'Din henvendelse er registrert. En av våre faglærere eller mentorer vil svare deg på e-post innen kort tid.'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setForm({ name: user?.name || '', email: user?.email || '', subject: '', message: '' });
                      setSuccess(false);
                    }}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-primary text-xs font-bold rounded-lg transition-all active:scale-95"
                  >
                    {isEn ? 'Send another message' : 'Send en ny henvendelse'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 bg-[#561291] text-white/80 text-center text-xs mt-12 border-t border-slate-700/30 font-medium">
        <p>© 2026 His Kingdom Prophets. All rights reserved.</p>
      </footer>
    </div>
  );
}
