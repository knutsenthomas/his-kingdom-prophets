import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Check, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CmsVisualToggle() {
  const { user, isAdminEditing, setIsAdminEditing, showToast } = useApp();
  const navigate = useNavigate();

  // Only display this floating control bar if logged in user is an Administrator
  if (user?.role !== 'admin') {
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
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
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
      </motion.div>
    </div>
  );
}
