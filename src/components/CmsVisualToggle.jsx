import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Check, Settings, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function CmsVisualToggle() {
  const { user, isAdminEditing, setIsAdminEditing, showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const isNotesPage = location.pathname === '/student/notes';
  const [isMinimized, setIsMinimized] = React.useState(() => {
    return localStorage.getItem('hkm-cms-minimized') === 'true';
  });
  const [editableCount, setEditableCount] = React.useState(0);

  // Check admin status from AppContext user, localStorage, and query parameters
  const ADMIN_EMAILS = ['knutsenthomas@gmail.com', 'thomas@tk-design.no'];
  const cleanEmail = user?.email?.toLowerCase();

  // Parse localStorage user safely for public-page detection
  const localStorageUser = (() => {
    try {
      const raw = localStorage.getItem('hkm-current-user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  const localEmail = localStorageUser?.email?.toLowerCase();
  const localRole = localStorageUser?.role;
  const isAuthorizedStorage = localStorage.getItem('hkm-cms-authorized') === 'true';

  // Check URL params (?edit=1, ?cms=1, ?admin=1)
  const isUrlAdmin = React.useMemo(() => {
    try {
      const params = new URLSearchParams(location.search);
      return params.get('edit') === '1' || params.get('edit') === 'true' ||
             params.get('cms') === '1' || params.get('cms') === 'true' ||
             params.get('admin') === '1';
    } catch {
      return false;
    }
  }, [location.search]);

  // If opened with ?edit=1 or ?cms=1, save authorized flag permanently
  React.useEffect(() => {
    if (isUrlAdmin) {
      localStorage.setItem('hkm-cms-authorized', 'true');
      setIsAdminEditing(true);
      showToast("Visuell redigeringsmodus aktivert via URL!");
    }
  }, [isUrlAdmin, setIsAdminEditing, showToast]);

  const isAdminUser = 
    isUrlAdmin ||
    isAuthorizedStorage ||
    user?.role === 'admin' || 
    user?.role === 'superadmin' || 
    ADMIN_EMAILS.includes(cleanEmail) ||
    localRole === 'admin' ||
    localRole === 'superadmin' ||
    ADMIN_EMAILS.includes(localEmail);

  // Keyboard shortcut (Cmd/Ctrl + Shift + E) & custom event listener
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
        e.preventDefault();
        localStorage.setItem('hkm-cms-authorized', 'true');
        setIsAdminEditing(prev => {
          const next = !prev;
          showToast(next ? "Visuell CMS-redigering aktivert (Snarvei)!" : "Visuell redigering avsluttet.");
          return next;
        });
      }
    };

    const handleCustomToggle = () => {
      localStorage.setItem('hkm-cms-authorized', 'true');
      setIsAdminEditing(prev => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hkm-toggle-cms', handleCustomToggle);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hkm-toggle-cms', handleCustomToggle);
    };
  }, [setIsAdminEditing, showToast]);

  // Dynamically count editable fields on current page
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const count = document.querySelectorAll('[data-cms-slug]').length;
      setEditableCount(count);
    }, 500);
    return () => clearTimeout(timer);
  }, [location.pathname, isAdminEditing]);

  if (!isAdminUser) {
    return null;
  }

  const handleToggle = () => {
    const nextState = !isAdminEditing;
    setIsAdminEditing(nextState);
    if (nextState) {
      showToast("Visuell CMS-redigering aktivert! Klikk på en hvilken som helst tekst for å redigere.");
    } else {
      showToast("Visuell redigering avsluttet. Alle endringer er lagret.");
    }
  };

  return (
    <div className={`cms-visual-toggle-container fixed ${isNotesPage ? 'bottom-[160px]' : 'bottom-[88px]'} right-3 sm:right-4 z-[90] font-sans pointer-events-auto`}>
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
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">CMS Editor</span>
                {editableCount > 0 && (
                  <span className="text-[9px] font-mono font-bold text-burnt-orange bg-burnt-orange/10 px-1 rounded">
                    {editableCount} felt
                  </span>
                )}
              </div>
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
