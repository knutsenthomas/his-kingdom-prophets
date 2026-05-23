import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Check, Settings, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CmsVisualToggle() {
  const { user, isAdminEditing, setIsAdminEditing, showToast } = useApp();
  const navigate = useNavigate();
  const [isMinimized, setIsMinimized] = React.useState(() => {
    return localStorage.getItem('hkm-cms-minimized') === 'true';
  });

  // Only display this floating control bar if logged in user is an Administrator or Superadmin
  const cleanEmail = user?.email?.toLowerCase();
  const isAdminUser = 
    user?.role === 'admin' || 
    user?.role === 'superadmin' || 
    ['knutsenthomas@gmail.com', 'thomas@tk-design.no'].includes(cleanEmail) ||
    localStorage.getItem('hkm-current-user')?.includes('admin') ||
    localStorage.getItem('hkm-current-user')?.includes('knutsenthomas@gmail.com') ||
    localStorage.getItem('hkm-current-user')?.includes('thomas@tk-design.no');

  if (!isAdminUser) {
    return null;
  }

  const handleToggle = () => {
    const nextState = !isAdminEditing;
    setIsAdminEditing(nextState);
    if (nextState) {
      showToast("Visuell CMS-redigering aktivert! Klikk på en tekst for å redigere.");
    } else {
      showToast("Visuell redigering avsluttet. Alle endringer er lagret.");
    }
  };

  return (
    <div className="fixed bottom-[88px] right-6 z-[90] font-sans pointer-events-auto">
      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.button
            key="minimized"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => {
              setIsMinimized(false);
              localStorage.setItem('hkm-cms-minimized', 'false');
            }}
            className="relative flex items-center justify-center h-12 w-12 rounded-full bg-primary/95 dark:bg-[#561291]/95 hover:bg-primary dark:hover:bg-[#561291] text-white border border-white/20 shadow-xl hover:shadow-2xl transition-all active:scale-[0.94] group"
            title="Vis CMS Editor"
            style={{ transform: 'translateZ(0)' }}
          >
            <Edit3 size={20} className="group-hover:rotate-12 transition-transform" />
            {isAdminEditing && (
              <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-burnt-orange opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-burnt-orange border border-white dark:border-slate-900"></span>
              </span>
            )}
          </motion.button>
        ) : (
          <motion.div 
            key="expanded"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="flex items-center gap-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/30 dark:border-slate-800/40 p-2.5 rounded-2xl shadow-xl hover:shadow-2xl transition-all"
            style={{ transform: 'translateZ(0)' }}
          >
            {/* State indicator circle */}
            <div className="relative flex h-3 w-3 pl-2">
              {isAdminEditing ? (
                <>
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-burnt-orange opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-burnt-orange"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-300 dark:bg-slate-700"></span>
              )}
            </div>

            <div className="flex flex-col text-left pr-1 min-w-[120px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">CMS Editor</span>
              <span className="text-xs font-bold text-primary dark:text-white leading-tight mt-0.5">
                {isAdminEditing ? 'Visuell Modus: PÅ' : 'Visuell Modus: AV'}
              </span>
            </div>

            {/* Toggle switch button */}
            <button
              onClick={handleToggle}
              className={`px-3 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-[0.96] ${
                isAdminEditing
                  ? 'bg-burnt-orange text-white hover:bg-burnt-orange-dark shadow-burnt-orange/25'
                  : 'bg-primary text-white hover:bg-[#153a51]'
              }`}
            >
              {isAdminEditing ? (
                <>
                  <Check size={13} />
                  <span>Fullfør</span>
                </>
              ) : (
                <>
                  <Edit3 size={13} />
                  <span>Rediger</span>
                </>
              )}
            </button>

            {/* Shortcut to full CMS dashboard */}
            <button
              onClick={() => {
                navigate('/admin/cms');
                showToast("Åpner CMS-panelet...");
              }}
              className="p-1.5 text-slate-400 hover:text-primary dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              title="Åpne avansert CMS Dashboard"
            >
              <Settings size={15} className="animate-spin-slow" />
            </button>

            {/* Minimize button */}
            <button
              onClick={() => {
                setIsMinimized(true);
                localStorage.setItem('hkm-cms-minimized', 'true');
                showToast("CMS Editor minimert. Klikk på ikonet for å maksimere igjen.");
              }}
              className="p-1.5 text-slate-400 hover:text-burnt-orange dark:hover:text-burnt-orange hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              title="Minimer CMS-panelet"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
