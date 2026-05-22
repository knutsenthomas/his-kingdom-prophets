import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Users, AlertTriangle, ClipboardList, BookOpen, 
  Award, Bell, Power, Menu, ChevronLeft, Sliders, Video, User,
  Languages, BarChart3
} from 'lucide-react';
import HkmChatWidget from '@/components/HkmChatWidget';
import CmsText from '@/components/CmsText';

export default function TeacherLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, showToast, students, changePersona } = useApp();

  // Attention status filters for KPI tracking in sidebar
  const atRiskCount = students?.filter(s => s.status === 'Kritisk' || s.status === 'Forsinket').length || 0;
  
  // Collapse state initialized from localStorage for persistence
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('hkm-teacher-sidebar-collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('hkm-teacher-sidebar-collapsed', isCollapsed);
  }, [isCollapsed]);

  useEffect(() => {
    if (user?.role && user.role !== 'teacher' && user.role !== 'admin') {
      changePersona('teacher');
    }
  }, [user?.role, changePersona]);

  const handleLogOut = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Lærer Dashboard', path: '/teacher/dashboard', icon: Compass },
    { name: 'Tjenesteoppfølging', path: '/teacher/follow-up', icon: AlertTriangle, badge: atRiskCount },
    { name: 'Kursbygger', path: '/teacher/course-builder', icon: Sliders },
    { name: 'Mediebibliotek', path: '/teacher/media-library', icon: Video },
    { name: 'Bibelkalkulator', path: '/teacher/grading', icon: Award },
    { name: 'Varslingssenter', path: '/teacher/notifications', icon: Bell },
    { name: 'Min lærerprofil', path: '/teacher/profile', icon: User }
  ];

  if (user?.role === 'admin' || user?.role === 'teacher') {
    navItems.push({ name: 'Global CMS Styring', path: '/admin/cms', icon: Languages });
  }
  if (user?.role === 'admin') {
    navItems.push({ name: 'Analytics Dashboard', path: '/admin/analytics', icon: BarChart3 });
  }

  return (
    <div className="bg-background min-h-screen flex flex-col font-sans text-on-surface">
      {/* Dynamic Mentor Header */}
      <header className="bg-white border-b border-outline-variant/30 sticky top-0 z-40 shadow-sm">
        <div className="flex justify-between items-center w-full px-4 sm:px-6 md:px-12 max-w-[1440px] mx-auto h-20">
          
          {/* Logo & Toggle Trigger */}
          <div className="flex items-center gap-3 mr-2 truncate">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-surface-container rounded-lg transition-colors active:scale-[0.97] text-primary shrink-0"
              title={isCollapsed ? "Åpne mentormeny" : "Lukk mentormeny"}
            >
              <Menu size={22} />
            </button>
            <div 
              className="font-serif text-lg sm:text-2xl font-bold text-primary flex items-center gap-1.5 sm:gap-2 cursor-pointer truncate" 
              onClick={() => navigate('/teacher/dashboard')}
            >
              <span className="truncate"><CmsText slug="layout-logo-title" fallback="His Kingdom Prophets" /></span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 sm:px-3 py-1 rounded-full shrink-0">
                {user?.role === 'admin' ? 'Admin' : 'Mentor'}
              </span>
            </div>
          </div>

          {/* User profile, badges and logout */}
          <div className="flex items-center gap-4 text-primary shrink-0">
            <div className="flex items-center gap-3 sm:gap-4 text-primary pl-2 border-l border-outline-variant/30">
              <Link
                to="/teacher/profile"
                className="group flex items-center gap-2.5 rounded-xl px-1.5 py-1 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all active:scale-[0.98]"
                title="Åpne min lærerprofil"
                aria-label="Åpne min lærerprofil"
              >
                <span className="text-right hidden sm:block min-w-0">
                  <span className="block text-xs font-bold text-primary group-hover:underline whitespace-nowrap md:max-w-none">
                    {user?.name}
                  </span>
                  <span className="block text-[9px] text-outline font-semibold uppercase tracking-wide whitespace-nowrap md:max-w-none">{user?.email}</span>
                </span>
                <span className="relative shrink-0">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-primary/20 shadow object-cover cursor-pointer transition-all group-hover:ring-2 group-hover:ring-primary/30 group-hover:ring-offset-2"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary text-white border-2 border-white flex items-center justify-center shadow-sm">
                    <User size={9} />
                  </span>
                </span>
              </Link>
              <button 
                onClick={handleLogOut} 
                className="hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors" 
                title="Logg ut"
              >
                <Power size={18} />
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Main Content Layout with Sidebar */}
      <div className="flex flex-1 w-full max-w-[1440px] mx-auto relative min-h-[calc(100vh-80px)]">
        
        {/* Collapsible Left Sidebar for Mentor portal */}
        <aside 
          className="bg-white border-r border-outline-variant/20 sticky top-20 hidden md:flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out overflow-hidden z-30"
          style={{ 
            width: isCollapsed ? '0px' : '288px',
            opacity: isCollapsed ? 0 : 1,
            transform: 'translateZ(0) !important',
            backfaceVisibility: 'hidden !important'
          }}
        >
          <div className="py-8 px-6 space-y-8 w-72 shrink-0">
            {/* Mentor status details */}
            <button
              onClick={() => navigate('/teacher/profile')}
              className="px-2 text-left w-full rounded-xl hover:bg-surface-container-low transition-colors active:scale-[0.99]"
              title="Åpne min lærerprofil"
            >
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Mentorveiledning</p>
              <div className="bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/30 space-y-2">
                <div className="flex justify-between items-center text-[11px] font-bold text-on-surface-variant">
                  <span>Studentoppfølging</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${atRiskCount > 0 ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-green-100 text-green-700'}`}>
                    {atRiskCount} kritiske
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[65%]"></div>
                </div>
              </div>
            </button>

            {/* Side Navigation Menu */}
            <nav className="space-y-1.5">
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                const IconComponent = item.icon;
                return (
                  <button 
                    key={item.path}
                    onClick={() => navigate(item.path)} 
                    className={`flex items-center justify-between w-full px-4 py-3 text-sm transition-all rounded-lg font-medium text-left ${
                      isActive 
                        ? 'text-primary bg-primary/5 border-l-4 border-primary font-bold shadow-sm' 
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent size={18} className={isActive ? 'text-primary' : 'text-on-surface-variant'} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-amber-500 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar footer collapse option */}
          <div className="p-6 w-72 shrink-0">
            <button
              onClick={() => setIsCollapsed(true)}
              className="flex items-center justify-center gap-1.5 w-full py-2 border-t border-slate-100 text-[10px] uppercase font-bold tracking-widest text-on-surface-variant hover:text-primary transition-all"
            >
              <ChevronLeft size={14} />
              <span>Skjul mentormeny</span>
            </button>
          </div>
        </aside>

        {/* Main Content View Container */}
        <main className="flex-grow flex flex-col min-w-0 transition-all duration-300 relative">
          
          <div className="flex-grow">
            <Outlet />
          </div>
        </main>

      </div>

      {/* Global HKM Assistent Chat Widget rendered once at layout level */}
      <HkmChatWidget />
    </div>
  );
}
