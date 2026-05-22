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
  const { user, showToast } = useApp();
  const [selectedAssetId, setSelectedAssetId] = useState('cms-1');

  // Simulated CMS Platform Assets
  const [assets, setAssets] = useState([
    {
      id: 'cms-1',
      title: 'Hovedoverskrift Forside',
      slug: 'landing-hero-title',
      value: 'Scholastic Premium',
      section: 'Hjemmeside',
      lastUpdated: 'Vennligst lagre endringer for å oppdatere',
      type: 'text'
    },
    {
      id: 'cms-2',
      title: 'Undertekst Registrering',
      slug: 'register-subtitle',
      value: 'Ta del i et globalt akademi basert på nysgjerrighet, stringens og akademisk dyktighet.',
      section: 'Onboarding',
      lastUpdated: '2 dager siden av Admin Thor',
      type: 'textarea'
    },
    {
      id: 'cms-3',
      title: 'Akademiske Interesser Tag-liste',
      slug: 'interests-tags',
      value: 'Pedagogikk, Teoretisk Fysikk, Akademisk Skriving, Sosiologi, Filosofi, Astrofysikk',
      section: 'Onboarding',
      lastUpdated: '1 uke siden',
      type: 'text'
    },
    {
      id: 'cms-4',
      title: 'Systemets Retningslinjer (Plattform)',
      slug: 'platform-terms',
      value: 'Velkommen til Mandal Regnskapskontor sitt utdannings-CMS. Ta hensyn til fagfeller...',
      section: 'System',
      lastUpdated: '12 dager siden',
      type: 'textarea'
    }
  ]);

  const activeAsset = assets.find(a => a.id === selectedAssetId) || assets[0];
  const [editValue, setEditValue] = useState(activeAsset?.value || '');

  // Sync editor when asset selection changes
  React.useEffect(() => {
    if (activeAsset) {
      setEditValue(activeAsset.value);
    }
  }, [selectedAssetId]);

  const handleSave = (e) => {
    e.preventDefault();
    setAssets(prev => prev.map(a => {
      if (a.id === selectedAssetId) {
        return {
          ...a,
          value: editValue,
          lastUpdated: 'Akkurat nå av deg'
        };
      }
      return a;
    }));
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
            <div className="font-serif text-2xl font-bold text-primary">Scholastic Premium</div>
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
          <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-primary mb-2 flex items-center gap-2">
              <Layout size={20} className="text-secondary" /> Plattforminnhold (Assets)
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
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isActive ? 'bg-primary-container text-white' : 'bg-surface-container text-primary'
                      }`}>
                        {asset.section}
                      </span>
                      <span className={`text-[10px] ${isActive ? 'text-on-primary-container' : 'text-outline'} font-mono`}>
                        {asset.slug}
                      </span>
                    </div>
                    <h3 className="font-serif text-sm font-bold mt-1 group-hover:text-primary-container transition-colors">
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
              className="bg-white border border-outline-variant rounded-xl p-8 shadow-sm flex flex-col gap-6"
            >
              {/* Asset Header Info */}
              <div className="border-b border-outline-variant pb-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-surface-container text-primary rounded-full">
                      Seksjon: {activeAsset.section}
                    </span>
                    <span className="text-xs font-semibold text-secondary font-mono">{activeAsset.slug}</span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-primary mt-2">
                    Rediger: {activeAsset.title}
                  </h2>
                </div>
                
                <button 
                  onClick={() => navigate('/')}
                  className="p-2 hover:bg-surface-container rounded-full text-outline hover:text-primary transition-colors"
                >
                  <Eye size={18} />
                </button>
              </div>

              {/* Editing Form */}
              <form onSubmit={handleSave} className="space-y-6 form-field-stable">
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

                <div className="flex justify-between items-center text-xs text-outline pt-2 border-t border-outline-variant/30">
                  <span>Sist oppdatert: <strong>{activeAsset.lastUpdated}</strong></span>
                  
                  <button
                    type="submit"
                    className="bg-primary text-white font-bold py-3.5 px-8 rounded-lg hover:bg-primary-container transition-all active:scale-[0.98] shadow-md flex items-center gap-2"
                  >
                    <Save size={16} /> LAGRE I SUPABASE
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
