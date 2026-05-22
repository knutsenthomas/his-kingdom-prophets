import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, BookOpen, Video, CheckSquare, Users, 
  Menu, Bell, Power, Search, Award, GraduationCap, ChevronLeft, User
} from 'lucide-react';
import HkmChatWidget from '@/components/HkmChatWidget';

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, showToast, changePersona } = useApp();
  
  // Collapse state initialized from localStorage for persistence
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('hkm-student-sidebar-collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('hkm-student-sidebar-collapsed', isCollapsed);
  }, [isCollapsed]);

  useEffect(() => {
    if (user?.role && user.role !== 'student') {
      changePersona('student');
    }
  }, [user?.role, changePersona]);

  const handleLogOut = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: Compass },
    { name: 'Studieplan & Kurs', path: '/student/library', icon: BookOpen },
    { name: 'Leksjon', path: '/student/lesson', icon: GraduationCap },
    { name: 'Klasserom / Video', path: '/student/video', icon: Video },
    { name: 'Oppgaver', path: '/student/assignments', icon: CheckSquare },
    { name: 'Bønnefellesskap', path: '/student/chat', icon: Users },
    { name: 'Min profil', path: '/student/profile', icon: User },
  ];

  return (
    <div className="bg-background min-h-screen flex flex-col font-sans text-on-surface">
      {/* Dynamic Header */}
      <header className="bg-white border-b border-outline-variant/30 sticky top-0 z-40 shadow-sm">
        <div className="flex justify-between items-center w-full px-4 sm:px-6 md:px-12 max-w-[1440px] mx-auto h-20">
          
          {/* Logo & Toggle Trigger */}
          <div className="flex items-center gap-3 mr-2 truncate">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-surface-container rounded-lg transition-colors active:scale-[0.97] text-primary shrink-0"
              title={isCollapsed ? "Åpne venstremeny" : "Lukk venstremeny"}
            >
              <Menu size={22} />
            </button>
            <div 
              className="font-serif text-lg sm:text-2xl font-bold text-primary flex items-center gap-1.5 sm:gap-2 cursor-pointer truncate" 
              onClick={() => navigate('/student/dashboard')}
            >
              <GraduationCap className="text-primary shrink-0 animate-pulse" size={24} />
              <span className="truncate">His Kingdom Prophets</span>
            </div>
          </div>

          {/* Search bar, notifications, avatar and logout */}
          <div className="flex items-center gap-4 text-primary shrink-0">
            <div className="hidden xl:flex items-center bg-surface-container-low rounded-lg px-4 border border-outline-variant/30 py-2 w-60">
              <Search className="text-on-surface-variant mr-2" size={16} />
              <input 
                className="bg-transparent border-none focus:ring-0 text-xs w-full outline-none" 
                placeholder="Søk i plattformen..." 
                type="text"
                onChange={(e) => {
                  if (e.target.value.length > 3) {
                    showToast(`Søker etter "${e.target.value}"...`);
                  }
                }}
              />
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4 text-primary">
              <button 
                className="relative hover:opacity-80 transition-all p-1.5 hover:bg-surface-container rounded-full shrink-0"
                onClick={() => showToast("Ingen nye varsler")}
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-burnt-orange rounded-full" style={{ borderRadius: '9999px' }}></span>
              </button>
              
              <div className="flex items-center gap-2 sm:gap-2.5 pl-2 border-l border-outline-variant/30 shrink-0">
                <Link
                  to="/student/profile"
                  className="group flex items-center gap-2 sm:gap-2.5 rounded-xl px-1.5 py-1 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all active:scale-[0.98]"
                  title="Åpne min profil"
                  aria-label="Åpne min profil"
                >
                  <span className="relative shrink-0">
                    <img
                      src={user?.avatar}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full object-cover border border-primary/20 cursor-pointer transition-all group-hover:ring-2 group-hover:ring-primary/30 group-hover:ring-offset-2"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary text-white border-2 border-white flex items-center justify-center shadow-sm">
                      <User size={9} />
                    </span>
                  </span>
                  <span className="hidden md:flex flex-col text-left min-w-0">
                    <span className="text-xs font-bold text-on-surface whitespace-nowrap md:max-w-none group-hover:text-primary transition-colors">
                      {user?.name}
                    </span>
                    <span className="text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Student</span>
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

        </div>
      </header>

      {/* Main Content Layout with Sidebar */}
      <div className="flex flex-1 w-full max-w-[1440px] mx-auto relative min-h-[calc(100vh-80px)]">
        
        {/* Collapsible Left Sidebar */}
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
            {/* Student profile summary card */}
            <button
              onClick={() => navigate('/student/profile')}
              className="px-2 text-left w-full rounded-xl hover:bg-surface-container-low transition-colors active:scale-[0.99]"
              title="Åpne min profil"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="text-primary animate-pulse" size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface uppercase tracking-wider">{user?.name}</p>
                  <p className="text-[11px] text-on-surface-variant font-medium">Aktiv Utrustningsprofil</p>
                </div>
              </div>
              <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[45%]" style={{ transition: 'width 0.8s ease-in-out' }}></div>
              </div>
              <p className="text-[10px] text-on-surface-variant font-semibold mt-2">45% Total fullføringsgrad</p>
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
                    className={`flex items-center gap-3 w-full px-4 py-3 text-sm transition-all rounded-lg font-medium text-left ${
                      isActive 
                        ? 'text-primary bg-primary/5 border-l-4 border-primary font-bold shadow-sm' 
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                    }`}
                  >
                    <IconComponent size={18} className={isActive ? 'text-primary' : 'text-on-surface-variant'} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Premium banner at bottom of sidebar */}
          <div className="p-6 w-72 shrink-0">
            <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 text-center shadow-sm">
              <p className="text-xs font-bold text-primary mb-2 uppercase tracking-wide">Utvid tjenesten</p>
              <p className="text-[11px] text-on-surface-variant mb-3 leading-relaxed">Få ubegrenset tilgang til alle studieskrifter og veiledning.</p>
              <button 
                onClick={() => showToast("Oppgradering sendt til behandling!")} 
                className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-sm hover:bg-primary-container transition-all active:scale-[0.97]"
              >
                Oppgrader profil
              </button>
            </div>
            
            {/* Small minimize trigger button inside sidebar footer */}
            <button
              onClick={() => setIsCollapsed(true)}
              className="mt-4 flex items-center justify-center gap-1.5 w-full py-1.5 text-[10px] uppercase font-bold tracking-widest text-on-surface-variant hover:text-primary transition-all"
            >
              <ChevronLeft size={14} />
              <span>Skjul meny</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area rendering the child Route components */}
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
