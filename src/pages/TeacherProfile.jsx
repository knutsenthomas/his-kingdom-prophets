import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import CmsText from '@/components/CmsText';
import {
  AlertCircle, Award, BookOpen, Briefcase, Calendar, Camera, CheckCircle2,
  ChevronRight, Eye, EyeOff, Home, Link as LinkIcon, Lock, LogOut,
  Mail, MapPin, Phone, Save, ShieldCheck, Sparkles, User, Video, XCircle
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
  const { user, updateUserProfile, logout, showToast, students, courses, cmsContent, language } = useApp();

  const getPlaceholder = (slug, fallback) => {
    if (language === 'en') {
      return cmsContent?.[slug + '-en'] || cmsContent?.[slug] || fallback;
    }
    return cmsContent?.[slug] || fallback;
  };

  const [activeTab, setActiveTab] = useState('profile');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [emailDraft, setEmailDraft] = useState(user?.email || '');
  const [pwDraft, setPwDraft] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [draft, setDraft] = useState({
    name: user?.name || '',
    title: user?.title || '',
    department: user?.department || '',
    expertise: user?.expertise || '',
    officeHours: user?.officeHours || '',
    zoomLink: user?.zoomLink || '',
    location: user?.location || '',
    phone: user?.phone || '',
    address: user?.address || '',
    birthDate: user?.birthDate || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const dropdownRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch address suggestions from Nominatim (OpenStreetMap) with Photon as fallback!
  const fetchAddressSuggestions = async (query) => {
    if (!query || query.trim().length < 3) {
      setAddressSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'HisKingdomProphets/1.0 (thomas@tk-design.no)'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const suggestions = data.map(item => {
            const addr = item.address;
            if (!addr) return item.display_name;

            const street = addr.road || addr.pedestrian || addr.suburb || addr.path || addr.construction || '';
            const houseNumber = addr.house_number || '';
            const postcode = addr.postcode || '';
            const city = addr.city || addr.town || addr.village || addr.municipality || '';
            const country = addr.country || '';

            const streetPart = houseNumber ? `${street} ${houseNumber}` : street;
            const cityPart = postcode ? `${postcode} ${city}` : city;

            const parts = [
              streetPart.trim(),
              cityPart.trim(),
              country.trim()
            ].filter(Boolean);

            return parts.length >= 2 ? parts.join(', ') : item.display_name;
          });
          setAddressSuggestions(suggestions);
          setLoadingSuggestions(false);
          return;
        }
      }
      
      const fallbackUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`;
      const fallbackResponse = await fetch(fallbackUrl);
      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json();
        if (data && data.features && data.features.length > 0) {
          const suggestions = data.features.map(f => {
            const props = f.properties;
            const streetPart = props.street ? `${props.street} ${props.housenumber || ''}`.trim() : '';
            const cityPart = props.postcode ? `${props.postcode} ${props.city || props.town || props.village || ''}`.trim() : (props.city || props.town || props.village || '');
            const countryPart = props.country || '';

            const parts = [
              streetPart,
              cityPart,
              countryPart
            ].filter(Boolean);
            return parts.join(', ');
          }).filter(Boolean);
          setAddressSuggestions(suggestions);
        }
      }
    } catch (error) {
      console.warn("Could not fetch address suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Debounce query input to avoid spamming the APIs
  useEffect(() => {
    if (!draft.address || draft.address.trim().length < 3) {
      setAddressSuggestions([]);
      return;
    }

    if (!showSuggestions) return;

    const delayDebounce = setTimeout(() => {
      fetchAddressSuggestions(draft.address);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [draft.address]);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const set = (field, value) => setDraft(prev => ({ ...prev, [field]: value }));
  const mentorStudents = students?.length || 0;
  const activeCourses = courses?.filter(course => course.instructor === user?.name).length || courses?.length || 0;
  const completionFields = [draft.name, draft.title, draft.department, draft.expertise, draft.officeHours, draft.bio];
  const completionPct = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  useEffect(() => {
    setDraft({
      name: user?.name || '',
      title: user?.title || '',
      department: user?.department || '',
      expertise: user?.expertise || '',
      officeHours: user?.officeHours || '',
      zoomLink: user?.zoomLink || '',
      location: user?.location || '',
      phone: user?.phone || '',
      address: user?.address || '',
      birthDate: user?.birthDate || '',
      bio: user?.bio || '',
      avatar: user?.avatar || '',
    });
    setEmailDraft(user?.email || '');
  }, [user]);

  const handleSaveProfile = async (event) => {
    event?.preventDefault();
    if (!draft.name.trim()) {
      showToast('Navn kan ikke være tomt.');
      return;
    }
    setSaving(true);
    try {
      if (updateUserProfile) {
        await updateUserProfile({ ...draft });
      }
    } catch (err) {
      console.error("Feil ved lagring av lærerprofil:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAccount = async (event) => {
    event?.preventDefault();
    if (pwDraft.next && pwDraft.next !== pwDraft.confirm) {
      showToast('Passordene stemmer ikke overens.');
      return;
    }
    setSaving(true);
    try {
      if (updateUserProfile) {
        await updateUserProfile({ email: emailDraft });
      }
      setPwDraft({ current: '', next: '', confirm: '' });
    } catch (err) {
      console.error("Feil ved lagring av lærer-konto:", err);
    } finally {
      setSaving(false);
    }
  };

  const resetDraft = () => {
    setDraft({
      name: user?.name || '',
      title: user?.title || '',
      department: user?.department || '',
      expertise: user?.expertise || '',
      officeHours: user?.officeHours || '',
      zoomLink: user?.zoomLink || '',
      location: user?.location || '',
      phone: user?.phone || '',
      address: user?.address || '',
      birthDate: user?.birthDate || '',
      bio: user?.bio || '',
      avatar: user?.avatar || '',
    });
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 py-6 md:py-10 flex flex-col gap-6 md:gap-8 font-sans max-w-7xl mx-auto">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-outline">
        <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/teacher/dashboard')}><CmsText slug="profile-breadcrumb-mentor" fallback="Mentorpanel" /></span>
        <ChevronRight size={12} />
        <span className="text-primary font-bold"><CmsText slug="profile-breadcrumb-teacher-title" fallback="Min lærerprofil" /></span>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-md overflow-hidden" data-purpose="profile-header">
        {/* Cover strip – Majestic deep lilla gradient banner with shimmers */}
        <section className="h-[85px] relative overflow-hidden bg-gradient-to-br from-[#3c096c] via-[#561291] to-[#7b2cbf]" data-purpose="hero-banner">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-[#c5a059]/10 rounded-full blur-2xl pointer-events-none" />
        </section>

        <div className="px-6 md:px-8 pb-6 pt-0 relative z-10" data-purpose="profile-details-section">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6 min-w-0">
              {/* Circular Avatar with minimal white border & drop shadow */}
              <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0 -mt-12 md:-mt-16 z-10" data-purpose="image-wrapper">
                {draft.avatar ? (
                  <img
                    src={draft.avatar}
                    alt={draft.name || 'Min lærerprofil'}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-xl object-cover bg-gray-200 cursor-pointer hover:opacity-95 transition-all hover:scale-[1.01]"
                    style={{ objectPosition: 'top center' }}
                    onClick={() => setShowAvatarPicker(true)}
                  />
                ) : (
                  <div
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-xl bg-primary/10 text-primary flex items-center justify-center cursor-pointer hover:opacity-95 transition-all"
                    onClick={() => setShowAvatarPicker(true)}
                  >
                    <User size={40} />
                  </div>
                )}
                <button
                  onClick={() => setShowAvatarPicker(true)}
                  className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-[#c5a059] text-white flex items-center justify-center shadow-lg hover:bg-[#b8904a] transition-all hover:scale-105 active:scale-95"
                  title="Endre profilbilde"
                >
                  <Camera size={14} />
                </button>
              </div>

              <div className="min-w-0 pt-2 md:pt-0" data-purpose="badge-container">
                <h1 className="font-serif text-2xl md:text-3.5xl font-extrabold text-[#561291] leading-tight break-words tracking-tight" id="teacher-name">
                  {draft.name || <CmsText slug="profile-hero-teacher-fallback" fallback="Min lærerprofil" />}
                </h1>
                
                {/* Premium layout badges under name with breathing room */}
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <span className="px-3 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#561291]/5 text-[#561291] border border-[#561291]/15">
                    <CmsText slug="profile-hero-teacher-role" fallback="Mentor" />
                  </span>
                  {draft.department && (
                    <span className="px-3 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#c5a059]/5 text-[#c5a059] border border-[#c5a059]/20 shadow-sm">
                      {draft.department}
                    </span>
                  )}
                  <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1 ml-1">
                    <MapPin size={13} className="text-outline shrink-0" />
                    {draft.location || <CmsText slug="profile-hero-not-specified" fallback="Sted ikke angitt" />}
                  </span>
                </div>
              </div>
            </div>

            {/* Teacher statistics cards layout */}
            <div className="flex flex-row gap-3 mt-2 md:mt-0 overflow-x-auto pb-1 md:pb-0 no-scrollbar" data-purpose="stats-overview">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[95px] lg:min-w-[105px] shadow-sm">
                <span className="text-2xl font-serif font-bold text-[#561291]">{mentorStudents}</span>
                <span className="text-[9px] font-bold tracking-wider text-[#561291]/80 uppercase mt-0.5"><CmsText slug="profile-hero-students-kpi" fallback="Studenter" /></span>
                <span className="text-[8px] font-semibold text-outline text-center mt-1"><CmsText slug="profile-hero-students-sub" fallback="Aktiv oppfølging" /></span>
              </div>
              
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[95px] lg:min-w-[105px] shadow-sm">
                <span className="text-2xl font-serif font-bold text-[#561291]">{activeCourses}</span>
                <span className="text-[9px] font-bold tracking-wider text-[#561291]/80 uppercase mt-0.5"><CmsText slug="profile-hero-courses-kpi" fallback="Kurs" /></span>
                <span className="text-[8px] font-semibold text-outline text-center mt-1"><CmsText slug="profile-hero-courses-sub" fallback="Fagmoduler" /></span>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[95px] lg:min-w-[105px] shadow-sm">
                <span className="text-2xl font-serif font-bold text-[#561291]">{completionPct}%</span>
                <span className="text-[9px] font-bold tracking-wider text-[#561291]/80 uppercase mt-0.5"><CmsText slug="profile-hero-completion-kpi" fallback="Profil" /></span>
                <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden min-w-[50px]">
                  <div className="bg-[#c5a059] h-full" style={{ width: `${completionPct}%`, transition: 'width 0.4s ease' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {!isAdmin && completionPct < 100 && (
          <div className="mx-4 mb-3 flex items-center gap-2.5 px-4 py-2 bg-amber-50/50 border border-amber-200/50 rounded-xl">
            <Sparkles size={12} className="text-amber-600 shrink-0" />
            <p className="text-[10px] font-semibold text-amber-800">
              <CmsText slug="profile-nudge-teacher" fallback="Fullfør lærerprofilen slik at studentene lettere finner veiledning, kontortid og fagområde." />
            </p>
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
              <Icon size={14} /><CmsText slug={`profile-tab-${tab.id}`} fallback={tab.label} />
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
                  <User size={16} className="text-[#c5a059]" /> <CmsText slug="profile-section-public" fallback="Offentlig lærerprofil" />
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={<CmsText slug="profile-field-fullname" fallback="Fullt navn" />} icon={<User size={13} />} required>
                    <input value={draft.name} onChange={e => set('name', e.target.value)} className="field-input" placeholder={getPlaceholder('profile-placeholder-fullname', 'Ditt fulle navn')} />
                  </Field>
                  <Field label={<CmsText slug="profile-field-title" fallback="Tittel" />} icon={<Award size={13} />}>
                    <input value={draft.title} onChange={e => set('title', e.target.value)} className="field-input" placeholder={getPlaceholder('profile-placeholder-title', 'f.eks. Faglærer og mentor')} />
                  </Field>
                  <Field label={<CmsText slug="profile-field-department" fallback="Avdeling / linje" />} icon={<Briefcase size={13} />}>
                    <input value={draft.department} onChange={e => set('department', e.target.value)} className="field-input" placeholder={getPlaceholder('profile-placeholder-department', 'f.eks. Profetisk utrustning')} />
                  </Field>
                  <Field label={<CmsText slug="profile-field-location" fallback="Sted" />} icon={<MapPin size={13} />}>
                    <input value={draft.location} onChange={e => set('location', e.target.value)} className="field-input" placeholder={getPlaceholder('profile-placeholder-location', 'f.eks. Kristiansand, Norge')} />
                  </Field>
                  <Field label={<CmsText slug="profile-field-expertise" fallback="Fagområde" />} icon={<BookOpen size={13} />} className="sm:col-span-2">
                    <input value={draft.expertise} onChange={e => set('expertise', e.target.value)} className="field-input" placeholder={getPlaceholder('profile-placeholder-expertise', 'Skriv fagområder studentene kan søke veiledning i')} />
                  </Field>
                  <Field label={<CmsText slug="profile-field-bio" fallback="Mentor-bio" />} icon={<Sparkles size={13} />} className="sm:col-span-2">
                    <textarea value={draft.bio} onChange={e => set('bio', e.target.value)} rows={5} className="field-input resize-none leading-relaxed" placeholder={getPlaceholder('profile-placeholder-bio-teacher', 'Skriv en kort presentasjon av undervisningsstil, erfaring og hva studentene kan forvente i veiledning.')} />
                    <p className="text-[10px] text-outline text-right mt-1 font-semibold">{draft.bio.length}/500 <CmsText slug="profile-field-bio-length" fallback="tegn" /></p>
                  </Field>
                </div>
              </section>

              <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-base font-bold text-primary mb-5 flex items-center gap-2">
                  <Video size={16} className="text-[#c5a059]" /> <CmsText slug="profile-section-availability" fallback="Tilgjengelighet" />
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={<CmsText slug="profile-field-hours" fallback="Kontortid" />} icon={<ShieldCheck size={13} />}>
                    <input value={draft.officeHours} onChange={e => set('officeHours', e.target.value)} className="field-input" placeholder={getPlaceholder('profile-placeholder-hours', 'f.eks. Tirsdag 12:00-15:00')} />
                  </Field>
                  <Field label={<CmsText slug="profile-field-zoom" fallback="Zoom-lenke" />} icon={<LinkIcon size={13} />}>
                    <input value={draft.zoomLink} onChange={e => set('zoomLink', e.target.value)} className="field-input" placeholder={getPlaceholder('profile-placeholder-zoom', 'https://zoom.us/j/...')} />
                  </Field>
                </div>
              </section>

              {/* ── Kontaktdetaljer ── Synlig for alle, kun lest av admin/superadmin ── */}
              <motion.section
                key="contact-section-teacher"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border-2 border-[#561291]/15"
              >
                {isAdmin ? (
                  <div className="flex items-center gap-3 px-6 py-3 bg-[#561291] text-white">
                    <ShieldCheck size={15} className="shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest"><CmsText slug="profile-warning-admin-title" fallback="Admin-tilgang" /></p>
                      <p className="text-[10px] text-white/65 font-medium"><CmsText slug="profile-warning-admin-desc" fallback="Du ser denne seksjonen fordi du er admin." replaceObj={{ 'admin': user?.role }} /></p>
                    </div>
                    <span className="ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/15 uppercase tracking-wider">{user?.role}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-5 py-2.5 bg-[#561291]/05 border-b border-[#561291]/10">
                    <Lock size={13} className="text-[#561291]/50 shrink-0" />
                    <p className="text-[10px] font-semibold text-[#561291]/70">
                      <CmsText slug="profile-warning-private-mentor" fallback="Disse opplysningene er private — kun synlig for administratorer, aldri for studenter." />
                    </p>
                  </div>
                )}

                <div className="p-6">
                  <h2 className="font-serif text-base font-bold text-[#561291] mb-5 flex items-center gap-2">
                    <Lock size={16} className="text-[#c5a059]" /> <CmsText slug="profile-section-private" fallback="Privat kontaktinformasjon" />
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label={<CmsText slug="profile-field-phone" fallback="Mobilnummer" />} icon={<Phone size={13} />}>
                      <input
                        value={draft.phone}
                        onChange={e => set('phone', e.target.value)}
                        placeholder={getPlaceholder('profile-placeholder-phone', '+47 000 00 000')}
                        type="tel"
                        className="field-input"
                      />
                    </Field>

                    <Field label={<CmsText slug="profile-field-birthdate" fallback="Fødselsdato" />} icon={<Calendar size={13} />}>
                      <input
                        value={draft.birthDate}
                        onChange={e => set('birthDate', e.target.value)}
                        type="date"
                        className="field-input"
                      />
                    </Field>

                    <Field label={<CmsText slug="profile-field-address" fallback="Adresse" />} icon={<Home size={13} />} className="sm:col-span-2">
                      <div className="relative w-full" ref={dropdownRef}>
                        <input
                          value={draft.address}
                          onChange={e => {
                            set('address', e.target.value);
                            setShowSuggestions(true);
                          }}
                          onFocus={() => setShowSuggestions(true)}
                          placeholder={getPlaceholder('profile-placeholder-address', 'f.eks. Gateveien 12, 4500 Kristiansand')}
                          className="field-input w-full pr-10"
                        />
                        {loadingSuggestions && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                          </div>
                        )}
                        
                        {showSuggestions && addressSuggestions.length > 0 && (
                          <ul className="absolute left-0 right-0 z-50 top-full mt-1.5 bg-white border border-outline-variant/40 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100 animate-fade-in">
                            {addressSuggestions.map((item, idx) => (
                              <li 
                                key={idx} 
                                onClick={() => {
                                  set('address', item);
                                  setShowSuggestions(false);
                                }}
                                className="px-4 py-3 text-xs text-slate-700 hover:bg-[#f3e8ff] hover:text-[#561291] cursor-pointer transition-colors leading-relaxed"
                              >
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </Field>
                  </div>
                  <p className="mt-4 text-[10px] text-[#561291]/50 font-semibold flex items-center gap-1.5">
                    <Lock size={10} />
                    <CmsText slug="profile-warning-encrypted" fallback="Lagret kryptert • Kun lesbart for administratorer" />
                  </p>
                </div>
              </motion.section>
            </div>

            <aside className="xl:col-span-4 flex flex-col gap-5">
              <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-base font-bold text-primary mb-4"><CmsText slug="profile-section-preview" fallback="Forhåndsvisning" /></h2>
                <div className="border border-outline-variant/40 rounded-xl p-4 bg-surface-container-lowest">
                  <div className="flex items-center gap-3">
                    {draft.avatar ? (
                      <img src={draft.avatar} alt={draft.name} className="w-14 h-14 rounded-xl object-cover border border-outline-variant/40 animate-fade-in" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-outline-variant/40">
                        <User size={24} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-serif font-bold text-primary truncate">{draft.name || <CmsText slug="profile-preview-name-fallback" fallback="Ditt navn" />}</p>
                      <p className="text-[11px] text-on-surface-variant font-semibold truncate">{draft.title || <CmsText slug="profile-preview-title-fallback" fallback="Tittel ikke angitt" />}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-[11px] font-semibold text-on-surface-variant">
                    <p className="flex items-center gap-2"><BookOpen size={12} className="text-primary" /> {draft.expertise || <CmsText slug="profile-preview-expertise-fallback" fallback="Fagområde ikke angitt" />}</p>
                    <p className="flex items-center gap-2"><ShieldCheck size={12} className="text-primary" /> {draft.officeHours || <CmsText slug="profile-preview-hours-fallback" fallback="Kontortid ikke angitt" />}</p>
                    <p className="flex items-center gap-2"><Video size={12} className="text-primary" /> <CmsText slug="profile-preview-zoom-available" fallback="Digital veiledning tilgjengelig" /></p>
                  </div>
                </div>
              </section>

              <section className="bg-white border border-outline-variant/30 rounded-2xl px-6 py-5 shadow-sm">
                <div className="flex items-center gap-2 text-[11px] text-on-surface-variant font-semibold mb-4">
                  <AlertCircle size={13} className="text-secondary shrink-0" />
                  <CmsText slug="profile-warning-not-saved" fallback="Endringer lagres ikke automatisk." />
                </div>
                <div className="flex flex-col gap-3">
                  <button type="submit" disabled={saving} className="flex items-center justify-center gap-1.5 px-6 py-3 bg-primary text-white text-xs font-bold uppercase rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60">
                    {saving ? <><span className="animate-spin">↻</span> <CmsText slug="profile-status-saving" fallback="Lagrer..." /></> : <><Save size={13} /> <CmsText slug="profile-btn-save-teacher" fallback="Lagre lærerprofil" /></>}
                  </button>
                  <button type="button" onClick={resetDraft} className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-outline-variant rounded-xl text-xs font-bold uppercase hover:border-primary hover:text-primary transition-all active:scale-95">
                    <XCircle size={13} /> <CmsText slug="profile-btn-undo" fallback="Angre" />
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
                <Mail size={16} className="text-[#c5a059]" /> <CmsText slug="profile-section-email" fallback="E-postadresse" />
              </h2>
              <Field label={<CmsText slug="profile-field-email" fallback="E-post" />} icon={<Mail size={13} />}>
                <input value={emailDraft} onChange={e => setEmailDraft(e.target.value)} type="email" className="field-input" placeholder={getPlaceholder('profile-placeholder-email', 'din@epost.no')} />
              </Field>
              <div className="mt-4 flex justify-end">
                <button onClick={handleSaveAccount} className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-95">
                  <Save size={13} /> <CmsText slug="profile-btn-update-email" fallback="Oppdater e-post" />
                </button>
              </div>
            </section>

            <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif text-base font-bold text-primary mb-5 flex items-center gap-2">
                <Lock size={16} className="text-[#c5a059]" /> <CmsText slug="profile-section-password" fallback="Endre passord" />
              </h2>
              <div className="flex flex-col gap-4">
                {[
                  { key: 'current', label: 'Nåværende passord', slug: 'profile-field-password-current' },
                  { key: 'next', label: 'Nytt passord', slug: 'profile-field-password-new' },
                  { key: 'confirm', label: 'Gjenta nytt passord', slug: 'profile-field-password-confirm' },
                ].map(({ key, label, slug }) => (
                  <Field key={key} label={<CmsText slug={slug} fallback={label} />} icon={<Lock size={13} />}>
                    <div className="relative">
                      <input type={showPw[key] ? 'text' : 'password'} value={pwDraft[key]} onChange={e => setPwDraft(prev => ({ ...prev, [key]: e.target.value }))} className="field-input pr-10" placeholder={getPlaceholder('profile-placeholder-password', '••••••••')} />
                      <button type="button" onClick={() => setShowPw(prev => ({ ...prev, [key]: !prev[key] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors">
                        {showPw[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </Field>
                ))}

                {pwDraft.next && pwDraft.confirm && pwDraft.next !== pwDraft.confirm && (
                  <p className="text-[11px] text-red-600 font-bold flex items-center gap-1.5"><AlertCircle size={12} /> <CmsText slug="profile-status-pw-mismatch" fallback="Passordene stemmer ikke overens" /></p>
                )}
                {pwDraft.next && pwDraft.confirm && pwDraft.next === pwDraft.confirm && (
                  <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1.5"><CheckCircle2 size={12} /> <CmsText slug="profile-status-pw-match" fallback="Passordene stemmer overens" /></p>
                )}

                <div className="flex justify-end pt-1">
                  <button onClick={handleSaveAccount} disabled={!!pwDraft.next && pwDraft.next !== pwDraft.confirm} className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                    <Save size={13} /> <CmsText slug="profile-btn-update-password" fallback="Oppdater passord" />
                  </button>
                </div>
              </div>
            </section>

            <section className="bg-white border border-red-100 rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif text-base font-bold text-red-600 mb-1 flex items-center gap-2">
                <AlertCircle size={16} /> <CmsText slug="profile-section-danger" fallback="Faresone" />
              </h2>
              <p className="text-[11px] text-on-surface-variant font-medium mb-4"><CmsText slug="profile-warning-danger-desc-teacher" fallback="Logg ut av mentorportalen på denne enheten." /></p>
              <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 px-5 py-2.5 bg-red-50 border-2 border-red-200 text-red-600 text-xs font-bold uppercase rounded-xl hover:bg-red-100 transition-all active:scale-95">
                <LogOut size={14} /> <CmsText slug="profile-btn-logout" fallback="Logg ut av HKM" />
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
                  <h3 className="font-serif text-lg font-bold"><CmsText slug="profile-avatar-modal-title" fallback="Velg profilbilde" /></h3>
                  <p className="text-[11px] text-white/65 font-medium mt-0.5"><CmsText slug="profile-avatar-modal-desc" fallback="Klikk på et bilde for å velge det" /></p>
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
              <div className="px-5 pb-5">
                <p className="text-[10px] text-outline font-semibold text-center">
                  <CmsText slug="profile-avatar-modal-soon" fallback="Snart: Last opp eget bilde via Supabase Storage" />
                </p>
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
