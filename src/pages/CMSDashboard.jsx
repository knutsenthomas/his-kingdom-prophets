import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Layout, Edit, Save, PlusCircle, Trash2, 
  Settings, Globe, Eye, Server, RefreshCw, CheckCircle2
} from 'lucide-react';
import HkmChatWidget from '@/components/HkmChatWidget';

export default function CMSDashboard() {
  const navigate = useNavigate();
  const { user, showToast, cmsContent, updateCmsContent } = useApp();
  const [selectedAssetId, setSelectedAssetId] = useState('landing-hero-title');

  const assetDefinitions = [
    // Hjemmeside
    { slug: 'landing-hero-title', title: 'Hero Hovedoverskrift', section: 'Hjemmeside', type: 'text' },
    { slug: 'landing-hero-tagline', title: 'Hero Tagline', section: 'Hjemmeside', type: 'text' },
    { slug: 'landing-hero-description', title: 'Hero Beskrivelse', section: 'Hjemmeside', type: 'textarea' },
    { slug: 'landing-hero-cta-primary', title: 'Hero Hovedknapp', section: 'Hjemmeside', type: 'text' },
    { slug: 'landing-hero-cta-secondary', title: 'Hero Sekundærknapp', section: 'Hjemmeside', type: 'text' },
    { slug: 'landing-pillars-title', title: 'Tre Søyler Hovedtittel', section: 'Hjemmeside', type: 'text' },
    { slug: 'landing-pillars-desc', title: 'Tre Søyler Undertekst', section: 'Hjemmeside', type: 'textarea' },
    { slug: 'landing-pillar1-title', title: 'Søyle 1 Tittel', section: 'Hjemmeside', type: 'text' },
    { slug: 'landing-pillar1-desc', title: 'Søyle 1 Beskrivelse', section: 'Hjemmeside', type: 'textarea' },
    { slug: 'landing-pillar2-title', title: 'Søyle 2 Tittel', section: 'Hjemmeside', type: 'text' },
    { slug: 'landing-pillar2-desc', title: 'Søyle 2 Beskrivelse', section: 'Hjemmeside', type: 'textarea' },
    { slug: 'landing-pillar3-title', title: 'Søyle 3 Tittel', section: 'Hjemmeside', type: 'text' },
    { slug: 'landing-pillar3-desc', title: 'Søyle 3 Beskrivelse', section: 'Hjemmeside', type: 'textarea' },
    { slug: 'landing-network-title', title: 'Nettverk Tittel', section: 'Hjemmeside', type: 'text' },
    { slug: 'landing-network-desc', title: 'Nettverk Beskrivelse', section: 'Hjemmeside', type: 'textarea' },
    
    // Innlogging
    { slug: 'login-title', title: 'Tittel (Innlogging)', section: 'Innlogging', type: 'text' },
    { slug: 'login-subtitle', title: 'Undertittel (Innlogging)', section: 'Innlogging', type: 'text' },
    { slug: 'login-instruction', title: 'Rolle-instruksjoner (Innlogging)', section: 'Innlogging', type: 'textarea' },
    
    // Studentportal
    { slug: 'student-welcome-title', title: 'Velkomsthilsen Tittel (Student)', section: 'Studentportal', type: 'text' },
    { slug: 'student-welcome-subtitle', title: 'Velkomsthilsen Undertekst (Student)', section: 'Studentportal', type: 'textarea' },
    { slug: 'student-active-courses-title', title: 'Mine aktive kurs Tittel', section: 'Studentportal', type: 'text' },
    { slug: 'student-live-gatherings-title', title: 'Live Samlinger Tittel', section: 'Studentportal', type: 'text' },
    { slug: 'student-next-gatherings-title', title: 'Neste Samlinger Tittel', section: 'Studentportal', type: 'text' },
    { slug: 'student-tasks-title', title: 'Gjøremål Seksjonstittel', section: 'Studentportal', type: 'text' },
    { slug: 'student-stats-title', title: 'Statistikk Seksjonstittel', section: 'Studentportal', type: 'text' },
    { slug: 'student-quicklinks-title', title: 'Hurtiglenker Tittel (Student)', section: 'Studentportal', type: 'text' },
    { slug: 'student-announcements-title', title: 'Kunngjøringer Tittel (Student)', section: 'Studentportal', type: 'text' },
    
    // Mentorportal / Lærer
    { slug: 'teacher-welcome-title', title: 'Velkomsthilsen Tittel (Mentor)', section: 'Mentorportal', type: 'text' },
    { slug: 'teacher-welcome-subtitle', title: 'Velkomsthilsen Undertekst (Mentor)', section: 'Mentorportal', type: 'textarea' },
    { slug: 'teacher-academic-year', title: 'Studieår Undertekst', section: 'Mentorportal', type: 'text' },
    { slug: 'teacher-kpi1-label', title: 'KPI 1 (Totalt Registrert)', section: 'Mentorportal', type: 'text' },
    { slug: 'teacher-kpi2-label', title: 'KPI 2 (Snittfremdrift)', section: 'Mentorportal', type: 'text' },
    { slug: 'teacher-kpi3-label', title: 'KPI 3 (Evalueringssnitt)', section: 'Mentorportal', type: 'text' },
    { slug: 'teacher-kpi4-label', title: 'KPI 4 (Under oppfølging)', section: 'Mentorportal', type: 'text' },
    { slug: 'teacher-actions-title', title: 'Administrative tjenester Overskrift', section: 'Mentorportal', type: 'text' },
    
    // Onboarding (Suksess-side)
    { slug: 'welcome-ready-title', title: 'Velkomsttittel (Suksess)', section: 'Onboarding', type: 'text' },
    { slug: 'welcome-ready-subtitle', title: 'Undertittel (Suksess)', section: 'Onboarding', type: 'textarea' },
    { slug: 'welcome-card1-title', title: 'Kort 1 Tittel (Studieplan)', section: 'Onboarding', type: 'text' },
    { slug: 'welcome-card1-desc', title: 'Kort 1 Beskrivelse', section: 'Onboarding', type: 'textarea' },
    { slug: 'welcome-card2-title', title: 'Kort 2 Tittel (Fellesskap)', section: 'Onboarding', type: 'text' },
    { slug: 'welcome-card2-desc', title: 'Kort 2 Beskrivelse', section: 'Onboarding', type: 'textarea' },
    { slug: 'welcome-cta-btn', title: 'Knappetekst (Dashboard)', section: 'Onboarding', type: 'text' },

    // System / Admin
    { slug: 'admin-cms-welcome', title: 'Systemets Retningslinjer (Plattform)', section: 'System', type: 'textarea' },
    { slug: 'admin-cms-title', title: 'CMS Seksjonstittel (Admin)', section: 'System', type: 'text' },
    { slug: 'admin-cms-subtitle', title: 'CMS Hjelpetekst (Admin)', section: 'System', type: 'textarea' },
    { slug: 'layout-logo-title', title: 'Plattform Logotittel', section: 'System', type: 'text' },
    { slug: 'layout-search-placeholder', title: 'Søkefelt Hjelpetekst', section: 'System', type: 'text' },
    { slug: 'layout-upgrade-banner-title', title: 'Sidebar Oppgrader Tittel', section: 'System', type: 'text' },
    { slug: 'layout-upgrade-banner-desc', title: 'Sidebar Oppgrader Beskrivelse', section: 'System', type: 'textarea' },
    { slug: 'layout-upgrade-banner-btn', title: 'Sidebar Oppgrader Knapp', section: 'System', type: 'text' }
  ];

  const assets = assetDefinitions.map(def => ({
    id: def.slug,
    slug: def.slug,
    title: def.title,
    section: def.section,
    type: def.type,
    value: cmsContent[def.slug] || '',
    lastUpdated: 'Lagret i Supabase'
  }));

  const activeAsset = assets.find(a => a.id === selectedAssetId) || assets[0];
  const [editValue, setEditValue] = useState(activeAsset?.value || '');

  // Sync editor when asset selection changes
  React.useEffect(() => {
    if (activeAsset) {
      setEditValue(activeAsset.value);
    }
  }, [selectedAssetId, cmsContent]);

  const handleSave = (e) => {
    e.preventDefault();
    updateCmsContent(activeAsset.slug, editValue);
    showToast(`CMS Asset "${activeAsset.title}" ble oppdatert og lagret i Supabase!`);
  };

  return (
    <div className="bg-background min-h-screen flex flex-col font-sans text-on-background">
      {/* Header */}
      <header className="bg-white border-b border-outline-variant sticky top-0 z-40 shadow-sm">
        <div className="flex justify-between items-center px-6 md:px-12 h-20 w-full max-w-[1440px] mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/teacher/dashboard')}
              className="p-2 hover:bg-surface-container rounded-full transition-colors active:scale-95 text-on-surface-variant hover:text-primary"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="font-serif text-2xl font-bold text-primary">His Kingdom Prophets</div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary px-3 py-1 bg-surface-container rounded-full flex items-center gap-1">
              <Server size={12} /> Headless CMS
            </span>
            <img 
              src={user?.avatar} 
              alt={user?.name} 
              className="w-10 h-10 rounded-full border-2 border-primary-container shadow"
            />
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-6 md:px-12 py-12 flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: CMS Items Navigator (5 cols) */}
        <div className="w-full lg:w-5/12 flex flex-col gap-6">
          <div className="bg-white border border-outline-variant rounded-xl p-5 sm:p-6 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-primary mb-2 flex items-center gap-2">
              <Layout size={20} className="text-secondary shrink-0" /> Plattforminnhold (Assets)
            </h2>
            <p className="text-xs text-on-surface-variant mb-6">
              Velg et statisk tekstfelt eller systemkonfigurasjon for å gjøre endringer direkte i databasen.
            </p>

            <div className="space-y-3">
              {assets.map(asset => {
                const isActive = asset.id === selectedAssetId;
                return (
                  <button
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 active:scale-[0.99] group ${
                      isActive 
                        ? 'bg-primary border-primary text-white shadow-sm' 
                        : 'bg-white border-outline-variant hover:border-primary-container/40 hover:bg-surface-container-low text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${
                        isActive ? 'bg-primary-container text-white' : 'bg-surface-container text-primary'
                      }`}>
                        {asset.section}
                      </span>
                      <span className={`text-[10px] ${isActive ? 'text-on-primary-container' : 'text-outline'} font-mono truncate`}>
                        {asset.slug}
                      </span>
                    </div>
                    <h3 className="font-serif text-sm font-bold mt-1 group-hover:text-primary-container transition-colors leading-tight">
                      {asset.title}
                    </h3>
                    <p className={`text-[10px] truncate max-w-[280px] mt-2 ${isActive ? 'text-on-primary-container/70' : 'text-outline'}`}>
                      Gjeldende verdi: "{asset.value}"
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Markdown/Text Editor Pane */}
        <div className="w-full lg:w-7/12 flex flex-col gap-6">
          {activeAsset ? (
            <motion.div 
              key={activeAsset.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border border-outline-variant rounded-xl p-5 sm:p-8 shadow-sm flex flex-col gap-6"
            >
              {/* Asset Header Info */}
              <div className="border-b border-outline-variant pb-4 flex flex-col-reverse sm:flex-row justify-between items-start gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-surface-container text-primary rounded-full shrink-0">
                      Seksjon: {activeAsset.section}
                    </span>
                    <span className="text-xs font-semibold text-secondary font-mono truncate">{activeAsset.slug}</span>
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary mt-2 leading-tight">
                    Rediger: {activeAsset.title}
                  </h2>
                </div>
                
                <button 
                  onClick={() => navigate('/')}
                  className="p-2 hover:bg-surface-container rounded-full text-outline hover:text-primary transition-colors shrink-0 self-end sm:self-start"
                  title="Forhåndsvis klientside"
                >
                  <Eye size={18} />
                </button>
              </div>

              {/* Editing Form */}
              <form onSubmit={handleSave} className="space-y-6 flex flex-col form-field-stable">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline block">Tekstverdi i Databasen</label>
                  {activeAsset.type === 'textarea' ? (
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={8}
                      className="w-full p-4 border border-outline-variant rounded-lg font-sans text-sm focus:outline-none focus:border-primary shadow-sm transition-all focus:ring-1 focus:ring-primary leading-relaxed"
                    />
                  ) : (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full p-3.5 border border-outline-variant rounded-lg font-sans text-xs focus:outline-none focus:border-primary shadow-sm transition-all"
                    />
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center text-xs text-outline pt-4 border-t border-outline-variant/30 shrink-0">
                  <span className="leading-relaxed">Sist oppdatert: <strong>{activeAsset.lastUpdated}</strong></span>
                  
                  <button
                    type="submit"
                    className="bg-primary text-white font-bold py-3 px-6 sm:py-3.5 sm:px-8 rounded-lg hover:bg-primary-container transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <Save size={16} className="shrink-0" /> LAGRE I SUPABASE
                  </button>
                </div>
              </form>

              {/* Headless DB Info */}
              <div className="bg-surface-container p-5 rounded-lg flex gap-3 items-start">
                <Globe size={18} className="text-secondary mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-primary">Headless Integrasjons-API</h4>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Dette innholdet hentes direkte av frontend-enhetene via vårt GraphQL/Supabase REST API. Endringene lagres i sanntid og oppdaterer klientsidene (f.eks. landingpage og onboarding) uten behov for ny applikasjonsbygning.
                  </p>
                </div>
              </div>

            </motion.div>
          ) : (
            <div className="bg-white border border-outline-variant rounded-xl p-12 text-center text-outline shadow-sm">
              Velg en CMS-asset fra listen for å redigere.
            </div>
          )}
        </div>
      </main>

      {/* Floating HKM Chat Widget */}
      <HkmChatWidget />
    </div>
  );
}
