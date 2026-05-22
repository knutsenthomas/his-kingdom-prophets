import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, Award, BookOpen, Briefcase, Camera, CheckCircle2,
  ChevronRight, Eye, EyeOff, Link as LinkIcon, Lock, LogOut,
  Mail, MapPin, Save, ShieldCheck, Sparkles, User, Video, XCircle
} from 'lucide-react';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
];

const SECTION_TABS = [
  { id: 'profile', label: 'Lærerprofil', Icon: User },
  { id: 'account', label: 'Konto', Icon: ShieldCheck },
];

export default function TeacherProfile() {
  const navigate = useNavigate();
  const { user, updateUserProfile, logout, showToast, students, courses } = useApp();

  const [activeTab, setActiveTab] = useState('profile');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [emailDraft, setEmailDraft] = useState(user?.email || '');
  const [pwDraft, setPwDraft] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [draft, setDraft] = useState({
    name: user?.name || '',
    title: user?.title || 'Faglærer og mentor',
    department: user?.department || 'Profetisk utrustning',
    expertise: user?.expertise || 'Profetisk tjeneste, bibelsk veiledning og disippelskap',
    officeHours: user?.officeHours || 'Tirsdag og torsdag 12:00-15:00',
    zoomLink: user?.zoomLink || 'https://zoom.us/j/9270778606',
    location: user?.location || 'Kristiansand, Norge',
    bio: user?.bio || '',
    avatar: user?.avatar || AVATAR_OPTIONS[0],
  });

  const set = (field, value) => setDraft(prev => ({ ...prev, [field]: value }));
  const mentorStudents = students?.length || 0;
  const activeCourses = courses?.filter(course => course.instructor === user?.name).length || courses?.length || 0;
  const completionFields = [draft.name, draft.title, draft.department, draft.expertise, draft.officeHours, draft.zoomLink, draft.bio];
  const completionPct = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  useEffect(() => {
    if (user?.role !== 'teacher') return;
    setDraft({
      name: user?.name || '',
      title: user?.title || 'Faglærer og mentor',
      department: user?.department || 'Profetisk utrustning',
      expertise: user?.expertise || 'Profetisk tjeneste, bibelsk veiledning og disippelskap',
      officeHours: user?.officeHours || 'Tirsdag og torsdag 12:00-15:00',
      zoomLink: user?.zoomLink || 'https://zoom.us/j/9270778606',
      location: user?.location || 'Kristiansand, Norge',
      bio: user?.bio || '',
      avatar: user?.avatar || AVATAR_OPTIONS[0],
    });
    setEmailDraft(user?.email || '');
  }, [user]);

  const handleSaveProfile = (event) => {
    event?.preventDefault();
    if (!draft.name.trim()) {
      showToast('Navn kan ikke være tomt.');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      updateUserProfile({ ...draft });
      setSaving(false);
    }, 400);
  };

  const handleSaveAccount = (event) => {
    event?.preventDefault();
    if (pwDraft.next && pwDraft.next !== pwDraft.confirm) {
      showToast('Passordene stemmer ikke overens.');
      return;
    }
    updateUserProfile({ email: emailDraft });
    setPwDraft({ current: '', next: '', confirm: '' });
  };

  const resetDraft = () => {
    setDraft({
      name: user?.name || '',
      title: user?.title || 'Faglærer og mentor',
      department: user?.department || 'Profetisk utrustning',
      expertise: user?.expertise || 'Profetisk tjeneste, bibelsk veiledning og disippelskap',
      officeHours: user?.officeHours || 'Tirsdag og torsdag 12:00-15:00',
      zoomLink: user?.zoomLink || 'https://zoom.us/j/9270778606',
      location: user?.location || 'Kristiansand, Norge',
      bio: user?.bio || '',
      avatar: user?.avatar || AVATAR_OPTIONS[0],
    });
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 py-6 md:py-10 flex flex-col gap-6 md:gap-8 font-sans max-w-5xl">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-outline">
        <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/teacher/dashboard')}>Mentorpanel</span>
        <ChevronRight size={12} />
        <span className="text-primary font-bold">Min lærerprofil</span>
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-[#1B4965] via-[#1B4965]/90 to-[#1B4965]/70 relative">
          <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(197, 160, 89, 0.45), transparent 70%)' }} />
        </div>

        <div className="px-6 md:px-8 pb-7 flex flex-col xl:flex-row items-start xl:items-end gap-5 relative z-10">
          <div className="relative w-24 h-24 shrink-0 -mt-12 z-10">
            <img
              src={draft.avatar}
              alt={draft.name || 'Lærer'}
              className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover bg-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setShowAvatarPicker(true)}
            />
            <button
              onClick={() => setShowAvatarPicker(true)}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#c5a059] text-white flex items-center justify-center shadow-md hover:bg-[#b8904a] transition-colors"
              title="Endre profilbilde"
            >
              <Camera size={14} />
            </button>
          </div>

          <div className="flex-grow pt-0 xl:pb-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">Mentor</span>
              <span className="px-2.5 py-1 rounded-full bg-[#c5a059]/15 text-[#8a682d] text-[10px] font-bold uppercase tracking-wider">{draft.department}</span>
            </div>
            <h1 className="font-serif text-2xl xl:text-3xl font-bold text-primary leading-tight">{draft.name || 'Lærer'}</h1>
            <p className="text-xs text-on-surface-variant font-semibold mt-1">{draft.title} - {draft.location}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full xl:w-auto xl:ml-auto xl:pb-2">
            <StatCard label="Studenter" value={mentorStudents} />
            <StatCard label="Kurs" value={activeCourses} />
            <StatCard label="Profil" value={`${completionPct}%`} />
          </div>
        </div>

        {completionPct < 100 && (
          <div className="mx-6 mb-5 flex items-center gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
            <Sparkles size={14} className="text-amber-600 shrink-0" />
            <p className="text-[11px] font-semibold text-amber-800">Fullfør lærerprofilen slik at studentene lettere finner veiledning, kontortid og fagområde.</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 bg-white border border-outline-variant/30 rounded-xl p-1.5 shadow-sm self-start">
        {SECTION_TABS.map(tab => {
          const Icon = tab.Icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                isActive ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary hover:bg-slate-50'
              }`}
            >
              <Icon size={14} />{tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.form
            key="profile"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSaveProfile}
            className="grid grid-cols-1 xl:grid-cols-12 gap-5"
          >
            <div className="xl:col-span-8 flex flex-col gap-5">
              <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-base font-bold text-primary mb-5 flex items-center gap-2">
                  <User size={16} className="text-[#c5a059]" /> Offentlig lærerprofil
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Fullt navn" icon={<User size={13} />} required>
                    <input value={draft.name} onChange={e => set('name', e.target.value)} className="field-input" placeholder="Ditt fulle navn" />
                  </Field>
                  <Field label="Tittel" icon={<Award size={13} />}>
                    <input value={draft.title} onChange={e => set('title', e.target.value)} className="field-input" placeholder="f.eks. Faglærer og mentor" />
                  </Field>
                  <Field label="Avdeling / linje" icon={<Briefcase size={13} />}>
                    <input value={draft.department} onChange={e => set('department', e.target.value)} className="field-input" placeholder="f.eks. Profetisk utrustning" />
                  </Field>
                  <Field label="Sted" icon={<MapPin size={13} />}>
                    <input value={draft.location} onChange={e => set('location', e.target.value)} className="field-input" placeholder="f.eks. Kristiansand, Norge" />
                  </Field>
                  <Field label="Fagområde" icon={<BookOpen size={13} />} className="sm:col-span-2">
                    <input value={draft.expertise} onChange={e => set('expertise', e.target.value)} className="field-input" placeholder="Skriv fagområder studentene kan søke veiledning i" />
                  </Field>
                  <Field label="Mentor-bio" icon={<Sparkles size={13} />} className="sm:col-span-2">
                    <textarea value={draft.bio} onChange={e => set('bio', e.target.value)} rows={5} className="field-input resize-none leading-relaxed" placeholder="Skriv en kort presentasjon av undervisningsstil, erfaring og hva studentene kan forvente i veiledning." />
                    <p className="text-[10px] text-outline text-right mt-1 font-semibold">{draft.bio.length}/500 tegn</p>
                  </Field>
                </div>
              </section>

              <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-base font-bold text-primary mb-5 flex items-center gap-2">
                  <Video size={16} className="text-[#c5a059]" /> Tilgjengelighet
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Kontortid" icon={<ShieldCheck size={13} />}>
                    <input value={draft.officeHours} onChange={e => set('officeHours', e.target.value)} className="field-input" placeholder="f.eks. Tirsdag 12:00-15:00" />
                  </Field>
                  <Field label="Zoom-lenke" icon={<LinkIcon size={13} />}>
                    <input value={draft.zoomLink} onChange={e => set('zoomLink', e.target.value)} className="field-input" placeholder="https://zoom.us/j/..." />
                  </Field>
                </div>
              </section>
            </div>

            <aside className="xl:col-span-4 flex flex-col gap-5">
              <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-base font-bold text-primary mb-4">Forhåndsvisning</h2>
                <div className="border border-outline-variant/40 rounded-xl p-4 bg-surface-container-lowest">
                  <div className="flex items-center gap-3">
                    <img src={draft.avatar} alt={draft.name} className="w-14 h-14 rounded-xl object-cover border border-outline-variant/40" />
                    <div className="min-w-0">
                      <p className="font-serif font-bold text-primary truncate">{draft.name || 'Lærer'}</p>
                      <p className="text-[11px] text-on-surface-variant font-semibold truncate">{draft.title}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-[11px] font-semibold text-on-surface-variant">
                    <p className="flex items-center gap-2"><BookOpen size={12} className="text-primary" /> {draft.expertise || 'Fagområde ikke angitt'}</p>
                    <p className="flex items-center gap-2"><ShieldCheck size={12} className="text-primary" /> {draft.officeHours || 'Kontortid ikke angitt'}</p>
                    <p className="flex items-center gap-2"><Video size={12} className="text-primary" /> Digital veiledning tilgjengelig</p>
                  </div>
                </div>
              </section>

              <section className="bg-white border border-outline-variant/30 rounded-2xl px-6 py-5 shadow-sm">
                <div className="flex items-center gap-2 text-[11px] text-on-surface-variant font-semibold mb-4">
                  <AlertCircle size={13} className="text-secondary shrink-0" />
                  Endringer lagres ikke automatisk.
                </div>
                <div className="flex flex-col gap-3">
                  <button type="submit" disabled={saving} className="flex items-center justify-center gap-1.5 px-6 py-3 bg-primary text-white text-xs font-bold uppercase rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60">
                    {saving ? <><span className="animate-spin">↻</span> Lagrer...</> : <><Save size={13} /> Lagre lærerprofil</>}
                  </button>
                  <button type="button" onClick={resetDraft} className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-outline-variant rounded-xl text-xs font-bold uppercase hover:border-primary hover:text-primary transition-all active:scale-95">
                    <XCircle size={13} /> Angre
                  </button>
                </div>
              </section>
            </aside>
          </motion.form>
        )}

        {activeTab === 'account' && (
          <motion.div key="account" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-5 max-w-3xl">
            <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif text-base font-bold text-primary mb-5 flex items-center gap-2">
                <Mail size={16} className="text-[#c5a059]" /> E-postadresse
              </h2>
              <Field label="E-post" icon={<Mail size={13} />}>
                <input value={emailDraft} onChange={e => setEmailDraft(e.target.value)} type="email" className="field-input" placeholder="din@epost.no" />
              </Field>
              <div className="mt-4 flex justify-end">
                <button onClick={handleSaveAccount} className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-95">
                  <Save size={13} /> Oppdater e-post
                </button>
              </div>
            </section>

            <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif text-base font-bold text-primary mb-5 flex items-center gap-2">
                <Lock size={16} className="text-[#c5a059]" /> Endre passord
              </h2>
              <div className="flex flex-col gap-4">
                {[
                  { key: 'current', label: 'Nåværende passord' },
                  { key: 'next', label: 'Nytt passord' },
                  { key: 'confirm', label: 'Gjenta nytt passord' },
                ].map(({ key, label }) => (
                  <Field key={key} label={label} icon={<Lock size={13} />}>
                    <div className="relative">
                      <input type={showPw[key] ? 'text' : 'password'} value={pwDraft[key]} onChange={e => setPwDraft(prev => ({ ...prev, [key]: e.target.value }))} className="field-input pr-10" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPw(prev => ({ ...prev, [key]: !prev[key] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors">
                        {showPw[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </Field>
                ))}

                {pwDraft.next && pwDraft.confirm && pwDraft.next !== pwDraft.confirm && (
                  <p className="text-[11px] text-red-600 font-bold flex items-center gap-1.5"><AlertCircle size={12} /> Passordene stemmer ikke overens</p>
                )}
                {pwDraft.next && pwDraft.confirm && pwDraft.next === pwDraft.confirm && (
                  <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1.5"><CheckCircle2 size={12} /> Passordene stemmer overens</p>
                )}

                <div className="flex justify-end pt-1">
                  <button onClick={handleSaveAccount} disabled={!!pwDraft.next && pwDraft.next !== pwDraft.confirm} className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                    <Save size={13} /> Oppdater passord
                  </button>
                </div>
              </div>
            </section>

            <section className="bg-white border border-red-100 rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif text-base font-bold text-red-600 mb-1 flex items-center gap-2">
                <AlertCircle size={16} /> Faresone
              </h2>
              <p className="text-[11px] text-on-surface-variant font-medium mb-4">Logg ut av mentorportalen på denne enheten.</p>
              <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 px-5 py-2.5 bg-red-50 border-2 border-red-200 text-red-600 text-xs font-bold uppercase rounded-xl hover:bg-red-100 transition-all active:scale-95">
                <LogOut size={14} /> Logg ut av HKM
              </button>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAvatarPicker && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAvatarPicker(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 overflow-hidden">
              <div className="bg-primary text-white px-6 py-5 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold">Velg profilbilde</h3>
                  <p className="text-[11px] text-white/65 font-medium mt-0.5">Klikk på et bilde for å velge det</p>
                </div>
                <button onClick={() => setShowAvatarPicker(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><XCircle size={18} /></button>
              </div>
              <div className="p-5 grid grid-cols-4 gap-3">
                {AVATAR_OPTIONS.map(url => (
                  <button key={url} onClick={() => { set('avatar', url); setShowAvatarPicker(false); }} className={`relative rounded-xl overflow-hidden border-4 transition-all hover:scale-105 ${draft.avatar === url ? 'border-primary shadow-md' : 'border-transparent'}`}>
                    <img src={url} alt="avatar option" className="w-full h-full aspect-square object-cover" />
                    {draft.avatar === url && <div className="absolute inset-0 bg-primary/20 flex items-center justify-center"><CheckCircle2 size={20} className="text-white drop-shadow" /></div>}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, icon, children, required = false, className = '' }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-outline">
        {icon}{label}{required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-center min-w-0">
      <p className="text-lg font-serif font-bold text-primary truncate">{value}</p>
      <p className="text-[9px] font-bold uppercase tracking-wider text-outline truncate">{label}</p>
    </div>
  );
}
