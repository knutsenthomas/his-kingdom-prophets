import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { 
  LayoutDashboard, Edit3, GraduationCap, Users, ExternalLink, 
  Globe, Power, Menu, X
} from 'lucide-react';

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

  // Clean, focused admin navigation
  const adminNavGroups = [
    {
      group: 'ADMINISTRASJON',
      items: [
        { id: 'dashboard', label: 'Oversikt & Status', path: '/teacher/dashboard', icon: LayoutDashboard },
        { id: 'admissions', label: 'Opptak & Søknader', path: '/admin/portal?tab=admissions', icon: GraduationCap },
        { id: 'cms', label: 'Innhold & Tekster (CMS)', path: '/admin/cms', icon: Edit3 },
        { id: 'users', label: 'Elever & Brukere', path: '/admin/portal?tab=users', icon: Users },
      ]
    },
    {
      group: 'SNARVEIER',
      items: [
        { id: 'communityApp', label: 'Åpne Community App', path: 'https://app.hkpc.no', icon: ExternalLink, isExternal: true },
        { id: 'publicWeb', label: 'Se nettsiden (hkpc.no)', path: '/', icon: Globe, isExternal: true },
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
    <div className="admin-app-theme relative font-sans antialiased text-on-surface bg-background min-h-screen lg:pl-72 overflow-x-clip">
      
      {/* ========================================================
          1. DESKTOP SIDEBAR
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
              <div className="relative">
                <img 
                  src="/hkp-logo.png" 
                  alt="HKP Admin Logo" 
                  className="w-10 h-10 rounded-full object-contain shadow-xs shrink-0 select-none group-hover:scale-105 transition-transform" 
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-base font-extrabold text-primary tracking-tight leading-none group-hover:text-primary/90 transition-colors">
                  HKP Admin
                </span>
                <span className="block text-[11px] font-medium text-slate-500 mt-1 truncate">
                  hkpc.no kontrollpanel
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-6">
            {adminNavGroups.map((grp, gIdx) => (
              <div key={gIdx} className="space-y-1.5">
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest select-none">
                  {grp.group}
                </p>
                <div className="space-y-0.5">
                  {grp.items.map((item) => {
                    const Icon = item.icon;
                    const active = checkActive(item.path);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleItemClick(item)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                          active
                            ? 'bg-primary text-white shadow-sm font-bold'
                            : 'text-on-surface hover:bg-primary/5 hover:text-primary'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={17} className={active ? 'text-white' : 'text-slate-400'} />
                          <span>{item.label}</span>
                        </div>
                        {item.isExternal && (
                          <ExternalLink size={12} className={active ? 'text-white/80' : 'text-slate-400'} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer User Profile & Logout */}
        <div className="p-3.5 border-t border-outline-variant/20 bg-surface-container-lowest/60 space-y-2">
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

          <button 
            onClick={handleLogOut} 
            className="w-full py-2 px-3 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:scale-[0.98]"
          >
            <Power size={13} />
            <span>Logg ut</span>
          </button>
        </div>
      </aside>

      {/* ========================================================
          2. MOBILE HEADER
         ======================================================== */}
      <header 
        className="lg:hidden sticky top-0 z-40 bg-surface/95 backdrop-blur-xl border-b border-outline-variant/20 px-4 py-3 transition-colors shadow-xs"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)' }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
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

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary select-none whitespace-nowrap">
              Admin
            </span>
            
            <button 
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Åpne administratormeny"
              className="p-2.5 rounded-xl border border-outline-variant/30 text-on-surface hover:bg-primary/5 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================
          3. MOBILE DRAWER
         ======================================================== */}
      <div 
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
        />

        <aside 
          className={`absolute top-0 right-0 w-[84%] max-w-xs h-full bg-surface shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ 
            paddingTop: 'env(safe-area-inset-top, 16px)',
            paddingBottom: 'env(safe-area-inset-bottom, 16px)'
          }}
        >
          <div>
            <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between">
              <span className="font-extrabold text-primary text-base">HKP Admin</span>
              <button 
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-on-surface-variant hover:text-on-surface rounded-xl hover:bg-surface-container transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Lukk meny"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-220px)]">
              {adminNavGroups.map((grp, gIdx) => (
                <div key={gIdx} className="space-y-1">
                  <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest select-none">
                    {grp.group}
                  </p>
                  <div className="space-y-0.5">
                    {grp.items.map((item) => {
                      const Icon = item.icon;
                      const active = checkActive(item.path);

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleItemClick(item)}
                          className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left min-h-[44px] ${
                            active
                              ? 'bg-primary text-white shadow-sm font-bold'
                              : 'text-on-surface hover:bg-primary/5 hover:text-primary'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={18} className={active ? 'text-white' : 'text-slate-400'} />
                            <span>{item.label}</span>
                          </div>
                          {item.isExternal && (
                            <ExternalLink size={14} className={active ? 'text-white/80' : 'text-slate-400'} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-outline-variant/20 bg-surface-container-lowest/60 space-y-2">
            <button 
              onClick={handleLogOut} 
              className="w-full py-2.5 px-3 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors min-h-[44px]"
            >
              <Power size={14} />
              <span>Logg ut</span>
            </button>
          </div>
        </aside>
      </div>

      {/* ========================================================
          4. MAIN CONTENT CONTAINER
         ======================================================== */}
      <main className="flex-grow min-w-0 transition-all duration-300 relative">
        <Outlet />
      </main>
    </div>
  );
}
