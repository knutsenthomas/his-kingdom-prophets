import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { SYSTEM_REVIEWERS } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Megaphone, Send, Clock, Trash2, CheckCircle2,
  AlertCircle, ShieldCheck, ShieldX, ShieldAlert,
  ChevronRight, MessageSquare, User, X, Check
} from 'lucide-react';

export default function NotificationCenter() {
  const navigate = useNavigate();
  const { user, showToast, moduleApprovals, reviewModuleApproval } = useApp();

  const [activeTab, setActiveTab] = useState('broadcast'); // broadcast | approvals

  // Broadcast state
  const [notifications, setNotifications] = useState([
    { id: 'not-1', title: 'Plattformoppdatering fullført', body: 'Vi har rullet ut versjon 2.4 med forbedret rendering og raskere scrolling.', category: 'system', sentBy: 'System Admin', time: '2 timer siden' },
    { id: 'not-2', title: 'Ny studieoppgave publisert', body: 'Modul 5: Sjelesorg og Menighetsledelse (MIN 201) essayoppgave er nå åpen. Frist 5. juni.', category: 'broadcast', sentBy: 'Pastor Siri Knutsen', time: 'I går' },
    { id: 'not-3', title: 'Vedlikeholdsvarsel på server', body: 'Supabase-databasen vil gjennomgå vedlikehold søndag kl. 02:00–04:00. Noe nedetid kan forekomme.', category: 'warning', sentBy: 'IT-Drift Mandal', time: '3 dager siden' },
  ]);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('alle');

  // Inline review state: { [approvalId]: { note: '', open: bool } }
  const [reviewState, setReviewState] = useState({});

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) { showToast('Vennligst fyll ut emne og melding.'); return; }
    const audMap = { alle: 'Alle studenter', prop101: 'PROP 101', bible301: 'BIBLE 301', min201: 'MIN 201' };
    setNotifications(prev => [{
      id: `not-${Date.now()}`, title: subject, body: message,
      category: 'broadcast', sentBy: user?.name || 'Apostel David Hansen', time: 'Akkurat nå'
    }, ...prev]);
    showToast(`Kunngjøring sendt til ${audMap[targetAudience]}!`);
    setSubject(''); setMessage('');
  };

  const handleDelete = (id) => { setNotifications(prev => prev.filter(n => n.id !== id)); showToast('Varsel slettet.'); };

  const getReviewer = (reviewerId) => SYSTEM_REVIEWERS.find(r => r.id === reviewerId);

  const pendingApprovals = moduleApprovals.filter(a => a.status === 'pending');
  const reviewedApprovals = moduleApprovals.filter(a => a.status !== 'pending');

  const handleReview = (approvalId, action) => {
    const note = reviewState[approvalId]?.note || '';
    reviewModuleApproval(approvalId, action, note);
    setReviewState(prev => { const n = { ...prev }; delete n[approvalId]; return n; });
  };

  const TABS = [
    { id: 'broadcast', label: 'Kunngjøringer', Icon: Megaphone },
    { id: 'approvals', label: 'Til godkjenning', Icon: ShieldAlert, badge: pendingApprovals.length },
  ];

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 py-6 md:py-10 flex flex-col gap-6 md:gap-8 font-sans">

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-outline">
        <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/teacher/dashboard')}>Dashboard</span>
        <ChevronRight size={12} />
        <span className="text-primary font-bold">Varslingssenter</span>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-white border border-outline-variant/30 rounded-xl p-1.5 shadow-sm self-start">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.Icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                isActive ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary hover:bg-slate-50'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-0.5 ${
                  isActive ? 'bg-white/20 text-white' : 'bg-amber-500 text-white animate-pulse'
                }`}>{tab.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ══ BROADCAST TAB ══ */}
      <AnimatePresence mode="wait">
        {activeTab === 'broadcast' && (
          <motion.div key="broadcast" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex flex-col lg:flex-row gap-8">

            {/* Compose form */}
            <div className="w-full lg:w-7/12">
              <div className="bg-white border border-outline-variant/30 rounded-xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
                <div className="border-b border-outline-variant/20 pb-5">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary flex items-center gap-2">
                    <Megaphone size={22} className="text-[#c5a059] shrink-0" /> Send Kunngjøring
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-1 font-medium">Opprett og send systemvarsel til valgte klasseromsgrupper.</p>
                </div>

                <form onSubmit={handleBroadcast} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-outline block">Målgruppe</label>
                    <select value={targetAudience} onChange={e => setTargetAudience(e.target.value)}
                      className="w-full p-3 border border-outline-variant rounded-lg text-xs focus:outline-none focus:border-primary shadow-sm bg-white font-medium cursor-pointer">
                      <option value="alle">Alle studenter på plattformen</option>
                      <option value="prop101">PROP 101 – Profetisk Tjeneste</option>
                      <option value="bible301">BIBLE 301 – Hermeneutikk og Tolkning</option>
                      <option value="min201">MIN 201 – Sjelesorg og Menighetsledelse</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-outline block">Emne / Tittel</label>
                    <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Kort overskrift for varselet…"
                      className="w-full p-3.5 border border-outline-variant rounded-lg text-xs focus:outline-none focus:border-primary shadow-sm transition-all font-medium"
                      style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-outline block">Meldingstekst</label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Skriv meldingen her…" rows={6}
                      className="w-full p-4 border border-outline-variant rounded-lg text-xs focus:outline-none focus:border-primary shadow-sm transition-all resize-none leading-relaxed font-medium"
                      style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }} />
                  </div>

                  <button type="submit" className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 w-full sm:w-auto sm:self-end shadow-md">
                    <Send size={15} /> SEND KUNNGJØRING
                  </button>
                </form>
              </div>
            </div>

            {/* History log */}
            <div className="w-full lg:w-5/12">
              <div className="bg-white border border-outline-variant/30 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col gap-5">
                <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2 border-b border-outline-variant/20 pb-4">
                  <Bell size={18} className="shrink-0 text-primary" /> Historikk
                </h3>

                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  <AnimatePresence mode="popLayout">
                    {notifications.length === 0 ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="py-12 text-center text-outline text-xs flex flex-col items-center gap-2 font-medium">
                        <CheckCircle2 size={32} className="text-secondary/50" /> Ingen varsler i historikken.
                      </motion.div>
                    ) : notifications.map(not => (
                      <motion.div key={not.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-slate-50 border border-outline-variant/20 rounded-xl flex flex-col gap-2 hover:border-primary/30 transition-all group">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2 flex-wrap">
                            {not.category === 'system' && <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary text-white">System</span>}
                            {not.category === 'broadcast' && <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#c5a059] text-white">Kunngjøring</span>}
                            {not.category === 'warning' && <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-500 text-white">Varsel</span>}
                            <span className="text-[9px] text-outline font-semibold">{not.sentBy}</span>
                          </div>
                          <button onClick={() => handleDelete(not.id)} className="p-1 hover:bg-red-50 rounded text-outline hover:text-red-500 transition-colors md:opacity-0 md:group-hover:opacity-100">
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-primary leading-snug">{not.title}</h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed font-medium">{not.body}</p>
                        <div className="flex items-center gap-1.5 text-[9px] text-outline mt-1 font-semibold">
                          <Clock size={10} /><span>{not.time}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══ APPROVALS TAB ══ */}
        {activeTab === 'approvals' && (
          <motion.div key="approvals" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex flex-col lg:flex-row gap-8">

            {/* Pending approvals */}
            <div className="w-full lg:w-7/12 flex flex-col gap-5">
              <div className="bg-white border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-outline-variant/20 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0 border border-amber-200">
                    <ShieldAlert size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-primary">Venter på din godkjenning</h2>
                    <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                      {pendingApprovals.length === 0
                        ? 'Ingen moduler venter på godkjenning.'
                        : `${pendingApprovals.length} modul${pendingApprovals.length !== 1 ? 'er' : ''} venter på gjennomgang.`}
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-outline-variant/10">
                  <AnimatePresence mode="popLayout">
                    {pendingApprovals.length === 0 ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="py-16 flex flex-col items-center gap-3 text-outline-variant">
                        <ShieldCheck size={40} className="text-emerald-300" />
                        <p className="text-sm font-semibold text-on-surface-variant">Alt er godkjent – ingen ventende forespørsler!</p>
                      </motion.div>
                    ) : (
                      pendingApprovals.map(appr => {
                        const reviewer = getReviewer(appr.reviewerId);
                        const rs = reviewState[appr.id] || {};
                        return (
                          <motion.div key={appr.id}
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -16 }}
                            className="p-5 flex flex-col gap-4"
                          >
                            {/* Module info */}
                            <div className="flex items-start gap-3">
                              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1.5 shrink-0 animate-pulse" />
                              <div className="min-w-0 flex-grow">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono">{appr.courseCode}</span>
                                  <span className="text-[9px] text-outline font-semibold">{appr.submittedAt}</span>
                                </div>
                                <h4 className="font-serif text-base font-bold text-primary leading-snug">{appr.moduleTitle}</h4>
                                <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">{appr.courseTitle}</p>
                              </div>
                            </div>

                            {/* Sender note */}
                            {appr.senderNote && (
                              <div className="bg-slate-50 border border-outline-variant/20 rounded-xl p-3.5 flex gap-2.5">
                                <MessageSquare size={14} className="text-outline shrink-0 mt-0.5" />
                                <p className="text-[11px] text-on-surface-variant leading-relaxed font-medium">{appr.senderNote}</p>
                              </div>
                            )}

                            {/* Reviewer note field + actions */}
                            <div className="flex flex-col gap-2.5">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-outline">Ditt svar / tilbakemelding (valgfritt)</label>
                              <textarea
                                value={rs.note || ''}
                                onChange={e => setReviewState(prev => ({ ...prev, [appr.id]: { ...prev[appr.id], note: e.target.value } }))}
                                placeholder="Legg til kommentarer for avsender…"
                                rows={2}
                                className="w-full px-3.5 py-2.5 border-2 border-outline-variant/30 rounded-xl text-xs font-medium focus:outline-none focus:border-primary resize-none leading-relaxed shadow-sm transition-colors"
                                style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                              />

                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleReview(appr.id, 'approved')}
                                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white text-xs font-bold uppercase rounded-xl hover:bg-emerald-700 shadow-sm transition-all active:scale-95"
                                >
                                  <ShieldCheck size={14} /> Godkjenn
                                </button>
                                <button
                                  onClick={() => handleReview(appr.id, 'rejected')}
                                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 border-2 border-red-200 text-xs font-bold uppercase rounded-xl hover:bg-red-100 transition-all active:scale-95"
                                >
                                  <ShieldX size={14} /> Avvis
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Review history */}
            <div className="w-full lg:w-5/12 flex flex-col gap-5">
              <div className="bg-white border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-outline-variant/20">
                  <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                    <Clock size={16} className="shrink-0" /> Gjennomgått
                  </h3>
                </div>

                <div className="divide-y divide-outline-variant/10 max-h-[480px] overflow-y-auto">
                  {reviewedApprovals.length === 0 ? (
                    <div className="py-14 flex flex-col items-center gap-2 text-outline-variant">
                      <Clock size={28} className="text-outline-variant/50" />
                      <p className="text-xs font-semibold text-on-surface-variant">Ingen godkjenningshistorikk ennå.</p>
                    </div>
                  ) : (
                    reviewedApprovals.map(appr => {
                      const isApproved = appr.status === 'approved';
                      return (
                        <div key={appr.id} className="p-4 flex flex-col gap-2">
                          <div className="flex items-start gap-2.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isApproved ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
                              {isApproved ? <ShieldCheck size={14} /> : <ShieldX size={14} />}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono">{appr.courseCode}</span>
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                  {isApproved ? 'Godkjent' : 'Avvist'}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-primary leading-snug truncate">{appr.moduleTitle}</p>
                              {appr.reviewerNote && (
                                <p className="text-[10px] text-on-surface-variant font-medium mt-1 leading-relaxed italic">«{appr.reviewerNote}»</p>
                              )}
                              <p className="text-[9px] text-outline mt-1 font-semibold">{appr.reviewedAt}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
