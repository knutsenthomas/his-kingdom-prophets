import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Bell, Megaphone, Send, Clock, 
  Trash2, ShieldAlert, CheckCircle2, Layers, AlertCircle
} from 'lucide-react';
import HkmChatWidget from '@/components/HkmChatWidget';

export default function NotificationCenter() {
  const navigate = useNavigate();
  const { user, showToast } = useApp();
  
  // Notification history list state
  const [notifications, setNotifications] = useState([
    {
      id: 'not-1',
      title: 'Plattformoppdatering fullført',
      body: 'Vi har rullet ut versjon 2.4 med forbedret rendering og raskere scrolling i nettleseren din.',
      category: 'system', // system, broadcast, warning
      sentBy: 'System Admin',
      time: '2 timer siden'
    },
    {
      id: 'not-2',
      title: 'Ny studieoppgave publisert',
      body: 'Modul 5: Sjelesorg og Menighetsledelse (MIN 201) essayoppgave er nå åpen for innlevering. Frist 5. juni.',
      category: 'broadcast',
      sentBy: 'Pastor Siri Knutsen',
      time: 'I går'
    },
    {
      id: 'not-3',
      title: 'Vedlikeholdsvarsel på server',
      body: 'Supabase-databasen vil gjennomgå rutinemessig vedlikehold på søndag kl. 02:00 til 04:00. Noe nedetid kan forekomme.',
      category: 'warning',
      sentBy: 'IT-Drift Mandal',
      time: '3 dager siden'
    }
  ]);

  // Form states
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('alle'); // alle, prop101, bible301, min201

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      showToast("Vennligst fyll ut emne og meldingstekst.");
      return;
    }

    const audMap = {
      alle: 'Alle studenter',
      prop101: 'PROP 101 Studentene',
      bible301: 'BIBLE 301 Studentene',
      min201: 'MIN 201 Studentene'
    };

    const newNotification = {
      id: `not-${Date.now()}`,
      title: subject,
      body: message,
      category: 'broadcast',
      sentBy: user?.name || 'Apostel David Hansen',
      time: 'Akkurat nå'
    };

    setNotifications(prev => [newNotification, ...prev]);
    showToast(`Kunngjøring ble sendt ut til ${audMap[targetAudience]}!`);
    setSubject('');
    setMessage('');
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    showToast("Varsel slettet fra historikken.");
  };

  return (
    <div className="bg-background min-h-screen flex flex-col font-sans text-on-background">
      {/* Header */}
      <header className="bg-white border-b border-outline-variant sticky top-0 z-40 shadow-sm">
        <div className="flex justify-between items-center px-4 sm:px-6 md:px-12 h-20 w-full max-w-[1440px] mx-auto">
          <div className="flex items-center gap-2 sm:gap-4 truncate mr-2">
            <button 
              onClick={() => navigate('/teacher/dashboard')}
              className="p-2 hover:bg-surface-container rounded-full transition-colors active:scale-95 text-on-surface-variant hover:text-primary shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="font-serif text-lg sm:text-2xl font-bold text-primary truncate">His Kingdom Prophets</div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-secondary px-3 py-1 bg-surface-container rounded-full">
              Varslingssenter
            </span>
            <img 
              src={user?.avatar} 
              alt={user?.name} 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-primary-container shadow object-cover shrink-0"
            />
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-6 md:px-12 py-12 flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Broadcast Composed Form (7 cols) */}
        <div className="w-full lg:w-7/12">
          <div className="bg-white border border-outline-variant rounded-xl p-5 sm:p-8 shadow-sm flex flex-col gap-6">
            <div className="border-b border-outline-variant pb-4">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary flex items-center gap-2 flex-wrap">
                <Megaphone size={24} className="text-secondary shrink-0" /> Send Kunngjøring / Broadcast
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Opprett og send et systemvarsel eller e-post-varsel til valgte klasseromsgrupper.
              </p>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4 flex flex-col form-field-stable">
              
              {/* Audience Dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-outline block">Målgruppe</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full p-3 border border-outline-variant rounded-lg font-sans text-xs focus:outline-none focus:border-primary shadow-sm bg-white"
                >
                  <option value="alle">Alle studenter på plattformen</option>
                  <option value="prop101">Studenter i Innføring i den Profetiske Tjeneste (PROP 101)</option>
                  <option value="bible301">Studenter i Avansert Hermeneutikk og Tolkning (BIBLE 301)</option>
                  <option value="min201">Studenter i Sjelesorg og Menighetsledelse (MIN 201)</option>
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-outline block">Emne / Tittel</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Skriv inn en kort overskrift for varselet..."
                  className="w-full p-3.5 border border-outline-variant rounded-lg font-sans text-xs focus:outline-none focus:border-primary shadow-sm transition-all"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-outline block">Meldingstekst</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Skriv inn innholdet på kunngjøringen din her..."
                  rows={6}
                  className="w-full p-4 border border-outline-variant rounded-lg font-sans text-sm focus:outline-none focus:border-primary shadow-sm transition-all focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Actions */}
              <button
                type="submit"
                className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-container transition-all active:scale-[0.98] flex items-center justify-center gap-2 w-full md:w-auto md:self-end shadow-md shrink-0"
              >
                <Send size={16} className="shrink-0" /> SEND KUNNGJØRING
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Historical Log (5 cols) */}
        <div className="w-full lg:w-5/12 flex flex-col gap-6">
          <div className="bg-white border border-outline-variant rounded-xl p-5 sm:p-6 shadow-sm flex flex-col gap-6">
            <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-4">
              <Bell size={18} className="shrink-0" /> Historikk
            </h3>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {notifications.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-12 text-center text-outline text-xs flex flex-col items-center gap-2"
                  >
                    <CheckCircle2 size={32} className="text-secondary/50" />
                    Ingen varsler i historikken.
                  </motion.div>
                ) : (
                  notifications.map(not => (
                    <motion.div
                      key={not.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-surface-container-low border border-outline-variant rounded-lg flex flex-col gap-2 hover:border-primary/30 transition-all relative group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {not.category === 'system' && (
                            <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary text-white">System</span>
                          )}
                          {not.category === 'broadcast' && (
                            <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-secondary text-white">Kunngjøring</span>
                          )}
                          {not.category === 'warning' && (
                            <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-error-container text-error">Varsel</span>
                          )}
                          <span className="text-[9px] text-outline font-semibold">{not.sentBy}</span>
                        </div>
                        
                        <button
                          onClick={() => handleDelete(not.id)}
                          className="p-1 hover:bg-error-container/30 rounded text-outline hover:text-error transition-colors md:opacity-0 md:group-hover:opacity-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <h4 className="font-serif font-bold text-sm text-primary leading-snug">
                        {not.title}
                      </h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {not.body}
                      </p>

                      <div className="flex items-center gap-1.5 text-[9px] text-outline mt-1 font-semibold">
                        <Clock size={10} />
                        <span>Sendt: {not.time}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </main>

      {/* Floating HKM Chat Widget */}
      <HkmChatWidget />
    </div>
  );
}
