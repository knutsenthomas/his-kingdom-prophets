import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Calendar, BookOpen,
  Instagram, Facebook, Camera, Save, XCircle, Pencil,
  ChevronRight, ShieldCheck, Eye, EyeOff, Lock, LogOut,
  CheckCircle2, Sparkles, AlertCircle, ExternalLink
} from 'lucide-react';

// Predefined avatar options
const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
];

const SECTION_TABS = [
  { id: 'profile',   label: 'Min profil',   Icon: User },
  { id: 'account',   label: 'Konto',        Icon: ShieldCheck },
];

export default function StudentProfile() {
  const navigate = useNavigate();
  const { user, updateUserProfile, logout, showToast } = useApp();

  const [activeTab, setActiveTab]         = useState('profile');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Draft state – profile tab
  const [draft, setDraft] = useState({
    name:            user?.name            || '',
    phone:           user?.phone           || '',
    location:        user?.location        || '',
    birthYear:       user?.birthYear       || '',
    bio:             user?.bio             || '',
    ministry:        user?.ministry        || '',
    socialInstagram: user?.socialInstagram || '',
    socialFacebook:  user?.socialFacebook  || '',
    avatar:          user?.avatar          || AVATAR_OPTIONS[0],
  });

  // Draft state – account tab
  const [emailDraft, setEmailDraft]     = useState(user?.email || '');
  const [pwDraft, setPwDraft]           = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw]             = useState({ current: false, next: false, confirm: false });
  const [saving, setSaving]             = useState(false);

  const set = (field, value) => setDraft(p => ({ ...p, [field]: value }));

  useEffect(() => {
    if (user?.role !== 'student') return;
    setDraft({
      name:            user?.name            || '',
      phone:           user?.phone           || '',
      location:        user?.location        || '',
      birthYear:       user?.birthYear       || '',
      bio:             user?.bio             || '',
      ministry:        user?.ministry        || '',
      socialInstagram: user?.socialInstagram || '',
      socialFacebook:  user?.socialFacebook  || '',
      avatar:          user?.avatar          || AVATAR_OPTIONS[0],
    });
    setEmailDraft(user?.email || '');
  }, [user]);

  // ── Save profile ──
  const handleSaveProfile = (e) => {
    e?.preventDefault();
    if (!draft.name.trim()) { showToast('Navn kan ikke være tomt.'); return; }
    setSaving(true);
    setTimeout(() => {
      updateUserProfile({ ...draft });
      setSaving(false);
    }, 400);
  };

  // ── Save account ──
  const handleSaveAccount = (e) => {
    e?.preventDefault();
    if (pwDraft.next && pwDraft.next !== pwDraft.confirm) {
      showToast('Passordene stemmer ikke overens.'); return;
    }
    updateUserProfile({ email: emailDraft });
    setPwDraft({ current: '', next: '', confirm: '' });
  };

  const completionFields = [
    !!draft.name, !!draft.phone, !!draft.location,
    !!draft.bio, !!draft.ministry,
  ];
  const completionPct = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 py-6 md:py-10 flex flex-col gap-6 md:gap-8 font-sans max-w-4xl">

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-outline">
        <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/student/dashboard')}>Dashboard</span>
        <ChevronRight size={12} />
        <span className="text-primary font-bold">Min profil</span>
      </div>

      {/* ── Profile hero card ── */}
      <div className="bg-white border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        {/* Cover strip */}
        <div className="h-20 bg-gradient-to-r from-[#1B4965] via-[#1B4965]/90 to-[#1B4965]/70 relative">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #c5a059 0%, transparent 60%), radial-gradient(circle at 80% 20%, white 0%, transparent 50%)' }} />
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-white" />
          <div className="absolute -bottom-6 left-0 right-0 h-12 bg-white rounded-t-[2rem]" />
        </div>

        <div className="px-6 md:px-8 pb-7 -mt-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 min-w-0">
              {/* Avatar with click-to-change */}
              <div className="relative shrink-0">
                <img
                  src={draft.avatar}
                  alt={draft.name}
                  className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg object-cover bg-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setShowAvatarPicker(true)}
                />
                <button
                  onClick={() => setShowAvatarPicker(true)}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#c5a059] text-white flex items-center justify-center shadow-md hover:bg-[#b8904a] transition-colors"
                  title="Endre profilbilde"
                >
                  <Camera size={13} />
                </button>
              </div>

              <div className="min-w-0 sm:pb-1">
                <h1 className="font-serif text-2xl lg:text-3xl font-bold text-primary leading-tight break-words">
                  {draft.name || 'Student'}
                </h1>
                <p className="text-sm text-on-surface-variant font-semibold mt-1 leading-snug">
                  {draft.ministry || 'Tjenestegave ikke angitt'} · {draft.location || 'Sted ikke angitt'}
                </p>
              </div>
            </div>

            {/* Profile completion ring */}
            <div className="shrink-0 flex flex-row lg:flex-col items-center gap-2 lg:gap-1 self-start lg:self-end lg:pb-1">
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                <circle cx="28" cy="28" r="24" fill="none" stroke="#1B4965" strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - completionPct / 100)}`}
                  strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-primary">{completionPct}%</span>
            </div>
            <span className="text-[9px] font-bold text-outline uppercase tracking-wider text-center">Profil</span>
            </div>
          </div>
        </div>

        {/* Completion nudge */}
        {completionPct < 100 && (
          <div className="mx-6 mb-4 flex items-center gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
            <Sparkles size={14} className="text-amber-600 shrink-0" />
            <p className="text-[11px] font-semibold text-amber-800">
              Fullfør profilen din for å hjelpe lærere og medstudenter å bli kjent med deg.
            </p>
          </div>
        )}
      </div>

      {/* ── Tab bar ── */}
      <div className="flex items-center gap-1 bg-white border border-outline-variant/30 rounded-xl p-1.5 shadow-sm self-start">
        {SECTION_TABS.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.Icon;
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

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">

        {/* ══ PROFILE TAB ══ */}
        {activeTab === 'profile' && (
          <motion.form
            key="profile"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSaveProfile}
            className="flex flex-col gap-5"
          >

            {/* Personal info */}
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif text-base font-bold text-primary mb-5 flex items-center gap-2">
                <User size={16} className="text-[#c5a059]" /> Personlig informasjon
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Full name */}
                <Field label="Fullt navn" icon={<User size={13} />} required>
                  <input
                    value={draft.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Ditt fulle navn"
                    className="field-input"
                    style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                  />
                </Field>

                {/* Phone */}
                <Field label="Mobilnummer" icon={<Phone size={13} />}>
                  <input
                    value={draft.phone}
                    onChange={e => set('phone', e.target.value)}
                    placeholder="+47 000 00 000"
                    type="tel"
                    className="field-input"
                    style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                  />
                </Field>

                {/* Location */}
                <Field label="Bosted / By" icon={<MapPin size={13} />}>
                  <input
                    value={draft.location}
                    onChange={e => set('location', e.target.value)}
                    placeholder="f.eks. Mandal, Norge"
                    className="field-input"
                    style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                  />
                </Field>

                {/* Birth year */}
                <Field label="Fødselsår" icon={<Calendar size={13} />}>
                  <input
                    value={draft.birthYear}
                    onChange={e => set('birthYear', e.target.value)}
                    placeholder="f.eks. 1990"
                    maxLength={4}
                    className="field-input"
                    style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                  />
                </Field>

                {/* Ministry */}
                <Field label="Tjenestegave / Kall" icon={<Sparkles size={13} />} className="sm:col-span-2">
                  <input
                    value={draft.ministry}
                    onChange={e => set('ministry', e.target.value)}
                    placeholder="f.eks. Profetisk tjeneste, Forbønn, Lovsang, Pastoral omsorg…"
                    className="field-input"
                    style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                  />
                </Field>

                {/* Bio */}
                <Field label="Om meg" icon={<BookOpen size={13} />} className="sm:col-span-2">
                  <textarea
                    value={draft.bio}
                    onChange={e => set('bio', e.target.value)}
                    placeholder="Skriv litt om deg selv, din åndelige reise og hva du ønsker å lære på HKM…"
                    rows={4}
                    className="field-input resize-none leading-relaxed"
                    style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                  />
                  <p className="text-[10px] text-outline text-right mt-1 font-semibold">{draft.bio.length}/300 tegn</p>
                </Field>
              </div>
            </div>

            {/* Social links */}
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif text-base font-bold text-primary mb-5 flex items-center gap-2">
                <ExternalLink size={16} className="text-[#c5a059]" /> Sosiale medier
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Instagram" icon={<Instagram size={13} />}>
                  <div className="flex items-center border-2 border-outline-variant/30 rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all shadow-sm">
                    <span className="px-3 text-[11px] font-bold text-outline bg-slate-50 h-full flex items-center py-3 border-r border-outline-variant/20">instagram.com/</span>
                    <input
                      value={draft.socialInstagram}
                      onChange={e => set('socialInstagram', e.target.value)}
                      placeholder="brukernavn"
                      className="flex-grow px-3 py-3 text-xs font-semibold bg-white focus:outline-none text-on-surface"
                      style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                    />
                  </div>
                </Field>
                <Field label="Facebook" icon={<Facebook size={13} />}>
                  <div className="flex items-center border-2 border-outline-variant/30 rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all shadow-sm">
                    <span className="px-3 text-[11px] font-bold text-outline bg-slate-50 h-full flex items-center py-3 border-r border-outline-variant/20">facebook.com/</span>
                    <input
                      value={draft.socialFacebook}
                      onChange={e => set('socialFacebook', e.target.value)}
                      placeholder="brukernavn"
                      className="flex-grow px-3 py-3 text-xs font-semibold bg-white focus:outline-none text-on-surface"
                      style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                    />
                  </div>
                </Field>
              </div>
            </div>

            {/* Save bar */}
            <div className="flex items-center justify-between gap-4 bg-white border border-outline-variant/30 rounded-2xl px-6 py-4 shadow-sm">
              <div className="flex items-center gap-2 text-[11px] text-on-surface-variant font-semibold">
                <AlertCircle size={13} className="text-secondary shrink-0" />
                Endringer lagres ikke automatisk.
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDraft({ name: user?.name||'', phone: user?.phone||'', location: user?.location||'', birthYear: user?.birthYear||'', bio: user?.bio||'', ministry: user?.ministry||'', socialInstagram: user?.socialInstagram||'', socialFacebook: user?.socialFacebook||'', avatar: user?.avatar||AVATAR_OPTIONS[0] })}
                  className="px-4 py-2.5 border border-outline-variant rounded-xl text-xs font-bold uppercase hover:border-primary hover:text-primary transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <XCircle size={13} /> Angre
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60"
                >
                  {saving ? <><span className="animate-spin">↻</span> Lagrer…</> : <><Save size={13} /> Lagre profil</>}
                </button>
              </div>
            </div>
          </motion.form>
        )}

        {/* ══ ACCOUNT TAB ══ */}
        {activeTab === 'account' && (
          <motion.div
            key="account"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-5"
          >

            {/* Email */}
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif text-base font-bold text-primary mb-5 flex items-center gap-2">
                <Mail size={16} className="text-[#c5a059]" /> E-postadresse
              </h2>
              <Field label="E-post" icon={<Mail size={13} />}>
                <input
                  value={emailDraft}
                  onChange={e => setEmailDraft(e.target.value)}
                  type="email"
                  placeholder="din@epost.no"
                  className="field-input"
                  style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                />
              </Field>
              <div className="mt-4 flex justify-end">
                <button onClick={handleSaveAccount}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-95">
                  <Save size={13} /> Oppdater e-post
                </button>
              </div>
            </div>

            {/* Password change */}
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif text-base font-bold text-primary mb-5 flex items-center gap-2">
                <Lock size={16} className="text-[#c5a059]" /> Endre passord
              </h2>
              <div className="flex flex-col gap-4">
                {[
                  { key: 'current',  label: 'Nåværende passord' },
                  { key: 'next',     label: 'Nytt passord' },
                  { key: 'confirm',  label: 'Gjenta nytt passord' },
                ].map(({ key, label }) => (
                  <Field key={key} label={label} icon={<Lock size={13} />}>
                    <div className="relative">
                      <input
                        type={showPw[key] ? 'text' : 'password'}
                        value={pwDraft[key]}
                        onChange={e => setPwDraft(p => ({ ...p, [key]: e.target.value }))}
                        placeholder="••••••••"
                        className="field-input pr-10"
                        style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                      >
                        {showPw[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </Field>
                ))}

                {pwDraft.next && pwDraft.confirm && pwDraft.next !== pwDraft.confirm && (
                  <p className="text-[11px] text-red-600 font-bold flex items-center gap-1.5">
                    <AlertCircle size={12} /> Passordene stemmer ikke overens
                  </p>
                )}
                {pwDraft.next && pwDraft.confirm && pwDraft.next === pwDraft.confirm && (
                  <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={12} /> Passordene stemmer overens
                  </p>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleSaveAccount}
                    disabled={!!pwDraft.next && pwDraft.next !== pwDraft.confirm}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Save size={13} /> Oppdater passord
                  </button>
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div className="bg-white border border-red-100 rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif text-base font-bold text-red-600 mb-1 flex items-center gap-2">
                <AlertCircle size={16} /> Faresone
              </h2>
              <p className="text-[11px] text-on-surface-variant font-medium mb-4">Disse handlingene er permanente og kan ikke angres.</p>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-50 border-2 border-red-200 text-red-600 text-xs font-bold uppercase rounded-xl hover:bg-red-100 transition-all active:scale-95"
              >
                <LogOut size={14} /> Logg ut av HKM
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Avatar picker modal ── */}
      <AnimatePresence>
        {showAvatarPicker && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAvatarPicker(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 overflow-hidden"
              style={{ transform: 'translateZ(0) !important', backfaceVisibility: 'hidden !important' }}
            >
              <div className="bg-[#1B4965] text-white px-6 py-5 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold">Velg profilbilde</h3>
                  <p className="text-[11px] text-white/65 font-medium mt-0.5">Klikk på et bilde for å velge det</p>
                </div>
                <button onClick={() => setShowAvatarPicker(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><XCircle size={18} /></button>
              </div>

              <div className="p-5 grid grid-cols-4 gap-3">
                {AVATAR_OPTIONS.map(url => (
                  <button
                    key={url}
                    onClick={() => { set('avatar', url); setShowAvatarPicker(false); }}
                    className={`relative rounded-xl overflow-hidden border-4 transition-all hover:scale-105 ${
                      draft.avatar === url ? 'border-primary shadow-md' : 'border-transparent'
                    }`}
                  >
                    <img src={url} alt="avatar option" className="w-full h-full aspect-square object-cover" />
                    {draft.avatar === url && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <CheckCircle2 size={20} className="text-white drop-shadow" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="px-5 pb-5">
                <p className="text-[10px] text-outline font-semibold text-center">
                  Snart: Last opp eget bilde via Supabase Storage
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Reusable field wrapper ─────────────────────────────────────────────────
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
