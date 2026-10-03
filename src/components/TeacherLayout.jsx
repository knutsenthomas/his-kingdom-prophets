import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { 
  LayoutDashboard, Edit3, GraduationCap, Search, BarChart3, 
  FileText, Users, ExternalLink, Globe, Power, Menu, X, Smartphone
} from 'lucide-react';
import HkmChatWidget from '@/components/HkmChatWidget';

export default function TeacherLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, showToast, language } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  // Authorization check for admin views
  useEffect(() => {
    const allowedRoles = ['teacher', 'admin', 'superadmin'];
    const email = user?.email?.toLowerCase();
    const isSpecialAdmin = ['knutsenthomas@gmail.com', 'thomas@tk-design.no', 'thomas@hiskingdomministry.no'].includes(email);
    const hasAccess = Boolean(user && (allowedRoles.includes(user?.role) || isSpecialAdmin));

    if (!user) {
      showToast(language === 'en' ? 'Please log in with your admin account.' : 'Vennligst logg inn med din admin-konto.');
      navigate('/admin/login?redirect=' + encodeURIComponent(location.pathname + location.search));
    } else if (!hasAccess) {
      showToast(language === 'en' ? 'Access denied. Administrator account required.' : 'Tilgang avslått. Krever admin-konto.');
      navigate('/');
    }
  }, [user, navigate, language, showToast, location.pathname, location.search]);

  const handleLogOut = () => {
    logout();
    navigate('/');
  };

  // Structured navigation groups mirroring the HKP Community App layout
  const adminNavGroups = [
    {
      group: 'HOVEDSTYRING',
      items: [
        { id: 'dashboard', label: 'Oversikt (Synk & Status)', path: '/teacher/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      group: 'LANDINGSSIDE (HKPC.NO)',
      items: [
        { id: 'cms', label: 'Innhold & Tekster', path: '/admin/cms', icon: Edit3 },
        { id: 'admissions', label: 'Opptak & Søknader', path: '/admin/portal?tab=admissions', icon: GraduationCap },
        { id: 'seo', label: 'SEO & Søkemotorer', path: '/admin/cms?category=seo', icon: Search },
        { id: 'analytics', label: 'Besøksstatistikk', path: '/admin/analytics', icon: BarChart3 },
        { id: 'documents', label: 'PDF & Dokumenter', path: '/admin/cms?category=documents', icon: FileText },
      ]
    },
    {
      group: 'APP-SYNKRONISERING',
      items: [
        { id: 'users', label: 'Elever & Tilgangssynk', path: '/admin/portal?tab=users', icon: Users },
        { id: 'communityApp', label: 'Åpne Community App', path: 'https://app.hkpc.no', icon: ExternalLink, isExternal: true },
      ]
    }
  ];

  const checkActive = (itemPath) => {
    if (!itemPath || itemPath.startsWith('http')) return false;
    if (itemPath.includes('?')) {
      return (location.pathname + location.search) === itemPath;
    }
    return location.pathname === itemPath;
  };

  const handleItemClick = (item) => {
    if (item.isExternal) {
      window.open(item.path, '_blank', 'noopener,noreferrer');
    } else {
      navigate(item.path);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="relative font-sans antialiased text-on-surface bg-background min-h-screen lg:pl-72 overflow-x-clip">
      
      {/* ========================================================
          1. DESKTOP SIDEBAR (Identical to HKP Community App DesktopSidebar)
         ======================================================== */}
      <aside className="hidden lg:flex flex-col w-72 h-screen fixed left-0 top-0 border-r border-outline-variant/20 bg-surface/95 backdrop-blur-lg z-50 overflow-y-auto justify-between">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-outline-variant/15">
            <button 
              type="button"
              onClick={() => navigate('/teacher/dashboard')}
              title="Gå til oversikt"
              aria-label="HKP Admin - Gå til oversikt"
              className="flex items-center gap-3 text-left group cursor-pointer transition-all active:scale-[0.98] w-full"
            >
              <img 
                src="/hkp-logo.png" 
                alt="HKP Admin Logo" 
                className="w-10 h-10 rounded-full object-contain shadow-xs shrink-0 select-none group-hover:scale-105 transition-transform duration-200" 
              />
              <div className="min-w-0 flex-1">
                <span className="text-xl font-extrabold text-primary tracking-tight block truncate">
                  HKP Admin
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                  Landingsside & Synk
                </span>
              </div>
            </button>
          </div>

          {/* Grouped Nav Items */}
          <nav className="px-3 py-2 space-y-3">
            {adminNavGroups.map((section, sIdx) => (
              <div key={sIdx} className="space-y-0.5">
                <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider pt-1.5 pb-0.5">
                  {section.group}
                </p>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = checkActive(item.path);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`w-full flex items-center text-left gap-3 px-3 py-2 rounded-xl transition-all text-sm font-semibold cursor-pointer group ${
                        isActive 
                          ? 'bg-primary text-on-primary shadow-xs' 
                          : 'text-slate-800 hover:bg-slate-100 hover:text-purple-950'
                      }`}
                    >
                      <Icon size={18} className={`shrink-0 ${isActive ? 'text-on-primary' : 'text-slate-600 group-hover:text-purple-900'}`} />
                      <span className="text-left flex-1 text-[13.5px] font-semibold">{item.label}</span>
                      {item.isExternal && (
                        <span className="text-[10px] bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white px-2 py-0.5 rounded-full font-mono font-bold transition-colors">
                          app.hkpc.no
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* System Status in Sidebar */}
          <div className="mx-3 my-2 p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-1.5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Systemstatus</p>
            <div className="flex justify-between items-center text-[11px] font-semibold">
              <span className="text-on-surface-variant">Landingsside (hkpc.no)</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-semibold pt-1 border-t border-outline-variant/20">
              <span className="text-on-surface-variant">App-synk (app.hkpc.no)</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Tilkoblet
              </span>
            </div>
          </div>
        </div>

        {/* Footer User & Teacher Authentication Status */}
        <div className="p-3 border-t border-outline-variant/20 bg-surface-container-lowest/60 space-y-1.5">
          {/* User Profile Info */}
          <div className="flex items-center gap-2.5 px-1 py-1 rounded-xl">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt="Profilbilde" 
                className="w-9 h-9 rounded-full object-cover ring-1 ring-outline-variant/30 shrink-0" 
              />
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 bg-primary text-on-primary">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'TK'}
              </div>
            )}
            <div className="text-left flex-1 min-w-0">
              <p className="text-sm font-bold text-on-surface truncate">
                {user?.name || 'Thomas Knutsen'}
              </p>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                Administrator · hkpc.no
              </p>
            </div>
          </div>

          {/* Quick Action: Open Community App */}
          <a
            href="https://app.hkpc.no"
            target="_blank"
            rel="noreferrer"
            className="w-full py-1.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/60 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
          >
            <Smartphone size={13} />
            <span>Åpne Community App</span>
            <ExternalLink size={11} className="opacity-70" />
          </a>

          {/* Quick Action: View Public Website */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="w-full py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Globe size={13} />
            <span>Se nettsiden (hkpc.no)</span>
          </a>

          {/* Log out */}
          <button 
            onClick={handleLogOut} 
            className="w-full py-1.5 px-3 text-on-surface-variant hover:bg-surface-container rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:scale-[0.98]"
          >
            <Power size={13} />
            <span>Logg ut</span>
          </button>
        </div>
      </aside>

      {/* ========================================================
          2. MOBILE HEADER (Identical to HKP Community App MobileHeader)
         ======================================================== */}
      <header 
        className="lg:hidden sticky top-0 z-40 bg-surface/95 backdrop-blur-xl border-b border-outline-variant/20 px-4 py-3 transition-colors shadow-xs"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)' }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <button 
            type="button"
            onClick={() => navigate('/teacher/dashboard')}
            className="flex items-center gap-2.5 text-left cursor-pointer group active:scale-[0.98] transition-transform min-h-[44px]"
            aria-label="HKP Admin - Gå til oversikt"
          >
            <img 
              src="/hkp-logo.png" 
              alt="HKP Admin Logo" 
              className="w-9 h-9 rounded-full object-contain shadow-xs shrink-0 select-none group-hover:scale-105 transition-transform" 
            />
            <span className="text-[17px] sm:text-lg font-extrabold text-primary tracking-tight leading-none select-none">
              HKP Admin
            </span>
          </button>

          {/* Right actions: Role pill & menu trigger button */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary select-none whitespace-nowrap">
              Admin
            </span>
            
            <button 
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Åpne administratormeny"
              title="Meny"
              className="w-11 h-11 rounded-xl border border-outline-variant/25 bg-surface-container-low/60 hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-all flex items-center justify-center cursor-pointer active:scale-95"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================
          3. MOBILE SLIDING DRAWER MENU
         ======================================================== */}
      <div 
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop overlay */}
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className={`absolute inset-0 bg-slate-900/60 transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Sliding Menu Panel */}
        <aside
          className={`absolute top-0 bottom-0 left-0 w-72 bg-white flex flex-col justify-between shadow-2xl border-r border-outline-variant/20 overflow-y-auto h-full transition-transform duration-300 ease-out transform ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col justify-between h-full">
            <div>
              {/* Header in Drawer */}
              <div className="p-4 border-b border-outline-variant/15 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img 
                    src="/hkp-logo.png" 
                    alt="HKP Admin Logo" 
                    className="w-8 h-8 rounded-full object-contain shadow-xs shrink-0 select-none" 
                  />
                  <div>
                    <span className="text-base font-extrabold text-primary tracking-tight block leading-tight">
                      HKP Admin
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                      Landingsside & Synk
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-surface-container rounded-lg text-primary"
                  aria-label="Lukk meny"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Grouped Nav Items */}
              <nav className="px-3 py-3 space-y-4">
                {adminNavGroups.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-1">
                    <p className="px-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider pt-2 pb-0.5">
                      {section.group}
                    </p>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = checkActive(item.path);
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          className={`w-full flex items-center text-left gap-3.5 px-3.5 py-2.5 rounded-xl transition-all text-[15px] font-semibold cursor-pointer group ${
                            isActive 
                              ? 'bg-primary text-on-primary shadow-xs' 
                              : 'text-slate-800 hover:bg-slate-100 hover:text-purple-950'
                          }`}
                        >
                          <Icon size={20} className={`shrink-0 ${isActive ? 'text-on-primary' : 'text-slate-600 group-hover:text-purple-900'}`} />
                          <span className="text-left flex-1 text-[14px] font-semibold">{item.label}</span>
                          {item.isExternal && (
                            <span className="text-[10px] bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white px-2 py-0.5 rounded-full font-mono font-bold transition-colors">
                              app.hkpc.no
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </nav>

              {/* System status */}
              <div className="mx-3.5 my-2 p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Systemstatus</p>
                <div className="flex justify-between items-center text-[11px] font-semibold">
                  <span className="text-on-surface-variant">Landingsside (hkpc.no)</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-semibold pt-1 border-t border-outline-variant/20">
                  <span className="text-on-surface-variant">App-synk (app.hkpc.no)</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Tilkoblet
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="p-3.5 border-t border-outline-variant/20 bg-surface-container-lowest/60 space-y-2">
              <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="Profilbilde" 
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-outline-variant/30 shrink-0" 
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 bg-primary text-on-primary">
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'TK'}
                  </div>
                )}
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">
                    {user?.name || 'Thomas Knutsen'}
                  </p>
                  <p className="text-xs text-slate-600 font-medium truncate">
                    Administrator · hkpc.no
                  </p>
                </div>
              </div>

              <a
                href="https://app.hkpc.no"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/60 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
              >
                <Smartphone size={14} />
                <span>Åpne Community App</span>
                <ExternalLink size={12} className="opacity-70" />
              </a>

              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="w-full py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Globe size={13} />
                <span>Se nettsiden (hkpc.no)</span>
              </a>

              <button 
                onClick={handleLogOut} 
                className="w-full py-2 px-3 text-on-surface-variant hover:bg-surface-container rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-[0.98]"
              >
                <Power size={14} />
                <span>Logg ut</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ========================================================
          4. MAIN CONTENT CONTAINER
         ======================================================== */}
      <main className="flex-grow min-w-0 transition-all duration-300 relative">
        <Outlet />
      </main>

      {/* Global HKM Assistent Chat Widget rendered once at layout level */}
      <HkmChatWidget />
    </div>
  );
}
