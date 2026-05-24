import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { 
  Compass, Users, AlertTriangle, ClipboardList, BookOpen, 
  Award, Bell, Power, Menu, ChevronLeft, Sliders, Video, User,
  Languages, BarChart3, TrendingUp, Gift, HelpCircle, X, GraduationCap, Globe,
  Book, CheckSquare, FileText
} from 'lucide-react';
import HkmChatWidget from '@/components/HkmChatWidget';
import CmsText from '@/components/CmsText';
import logo from '@/assets/logo.png';

export default function TeacherLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, logout, showToast, students, changePersona, language, toggleLanguage, cmsContent } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    const handleToggle = (e) => {
      if (e.detail !== undefined) {
        setIsCollapsed(e.detail);
      } else {
        setIsCollapsed(prev => !prev);
      }
    };
    window.addEventListener('hkm-toggle-teacher-sidebar', handleToggle);
    return () => window.removeEventListener('hkm-toggle-teacher-sidebar', handleToggle);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  useEffect(() => {
    if (user?.role && user.role !== 'teacher' && user.role !== 'admin' && user.role !== 'superadmin') {
      changePersona('teacher');
    }
  }, [user?.role, changePersona]);



  const handleLogOut = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { isHeader: true, slug: 'sidebar-mentor-tools', fallback: 'Mentorverktøy' },
    { slug: 'nav.dashboard.title', fallback: 'Lærer Dashboard', path: '/teacher/dashboard', icon: Compass },
    { slug: 'sidebar-followup', fallback: 'Tjenesteoppfølging', path: '/teacher/follow-up', icon: AlertTriangle, badge: atRiskCount },
    { slug: 'sidebar-course-builder', fallback: 'Kursbygger', path: '/teacher/course-builder', icon: Sliders },
    { slug: 'sidebar-quiz-builder', fallback: 'Prøvebygger', path: '/teacher/quiz-builder', icon: ClipboardList },
    { slug: 'sidebar-insights', fallback: 'Kursinnsikt', path: '/teacher/insights', icon: BarChart3 },
    { slug: 'sidebar-marketing', fallback: 'Markedsføring', path: '/teacher/marketing', icon: TrendingUp },
    
    // Elev- og studieressurser (Studieportal)
    { isHeader: true, slug: 'sidebar-student-portal', fallback: 'Studieportal' },
    { slug: 'sidebar-bible', fallback: 'Bibelen', path: '/student/bible', icon: Book },
    { slug: 'sidebar-curriculum', fallback: 'Studieplan & kurs', path: '/student/library', icon: BookOpen },
    { slug: 'sidebar-lesson', fallback: 'Leksjon', path: '/student/lesson', icon: GraduationCap },
    { slug: 'sidebar-video', fallback: 'Klasserom / Video', path: '/student/video', icon: Video },
    { slug: 'sidebar-assignments', fallback: 'Oppgaver', path: '/student/assignments', icon: CheckSquare },
    { slug: 'sidebar-notes', fallback: 'Mine notater', path: '/student/notes', icon: FileText },
    { slug: 'sidebar-community', fallback: 'Bønnefellesskap', path: '/student/chat', icon: Users },
    
    // Fakultetsverktøy
    { isHeader: true, slug: 'sidebar-faculty-tools', fallback: 'Fakultetsverktøy' },
    { slug: 'sidebar-media-library', fallback: 'Mediebibliotek', path: '/teacher/media-library', icon: Video },
    { slug: 'sidebar-grading', fallback: 'Bibelkalkulator', path: '/teacher/grading', icon: Award },
    { slug: 'sidebar-partner', fallback: 'Partnerportal', path: '/teacher/partner', icon: Gift },
    { slug: 'sidebar-support', fallback: 'Hjelp & support', path: '/teacher/support', icon: HelpCircle },
    { slug: 'sidebar-notifications', fallback: 'Varslingssenter', path: '/teacher/notifications', icon: Bell },
    { slug: 'sidebar-teacher-profile', fallback: 'Min lærerprofil', path: '/teacher/profile', icon: User }
  ];

  if (user?.role === 'admin' || user?.role === 'superadmin') {
    navItems.push({ isHeader: true, slug: 'sidebar-administration', fallback: 'Administrasjon' });
    navItems.push({ slug: 'sidebar-cms-editor', fallback: 'Global CMS Styring', path: '/admin/cms', icon: Languages });
    navItems.push({ slug: 'sidebar-document-admin', fallback: 'Dokumentbehandling', path: '/admin/cms?category=documents', icon: FileText });
    navItems.push({ slug: 'sidebar-analytics', fallback: 'Analytics Dashboard', path: '/admin/analytics', icon: BarChart3 });
    navItems.push({ slug: 'sidebar-user-admin', fallback: 'Brukerhåndtering', path: '/admin/portal', icon: Users });
  } else if (user?.role === 'teacher') {
    navItems.push({ isHeader: true, slug: 'sidebar-administration', fallback: 'Administrasjon' });
    navItems.push({ slug: 'sidebar-cms-editor', fallback: 'Global CMS Styring', path: '/admin/cms', icon: Languages });
    navItems.push({ slug: 'sidebar-document-admin', fallback: 'Dokumentbehandling', path: '/admin/cms?category=documents', icon: FileText });
  }
  
  navItems.push({ isHeader: true, slug: 'sidebar-exit', fallback: 'Avslutt' });
  navItems.push({ slug: 'profile-btn-logout', fallback: 'Logg ut', path: '', icon: Power, isLogout: true });

  return (
    <div className="bg-background min-h-screen flex flex-col font-sans text-on-surface pt-20">
      {/* Dynamic Mentor Header */}
      <header className="bg-white border-b border-outline-variant/30 fixed top-0 left-0 right-0 z-40 shadow-sm">
        <div className="flex justify-between items-center w-full px-4 sm:px-6 md:px-12 max-w-[1440px] mx-auto h-20">
          
          {/* Logo & Toggle Trigger */}
          <div className="flex items-center gap-3 mr-2 truncate">
            <button 
              onClick={toggleMenu}
              className="p-2 hover:bg-surface-container rounded-lg transition-colors active:scale-[0.97] text-primary shrink-0"
              title={isCollapsed ? "Åpne mentormeny" : "Lukk mentormeny"}
            >
              <Menu size={22} />
            </button>
            <div 
              className="font-serif text-lg sm:text-2xl font-bold text-primary flex items-center gap-2 cursor-pointer truncate" 
              onClick={() => navigate('/teacher/dashboard')}
            >
              <img 
                src={logo} 
                alt="His Kingdom Prophets Logo" 
                className="w-8 h-8 object-contain shrink-0" 
              />
              <span className="hidden sm:inline truncate"><CmsText slug="layout-logo-title" fallback="His Kingdom Prophets" /></span>
              <span className="inline sm:hidden truncate"><CmsText slug="layout-logo-mobile-title" fallback="HKP" /></span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 sm:px-3 py-1 rounded-full shrink-0">
                {user?.role === 'admin' ? 'Admin' : 'Mentor'}
              </span>
            </div>
          </div>

          {/* User profile, badges and logout */}
          <div className="flex items-center gap-4 text-primary shrink-0">
            
            {/* Superadmin System View Switcher */}
            {(['thomas@tk-design.no', 'knutsenthomas@gmail.com'].includes(user?.email?.toLowerCase()) || user?.email?.includes('superadmin')) && (
              <div className="hidden md:flex items-center gap-1 bg-[#561291]/5 p-1 rounded-xl border border-[#561291]/20 shrink-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#561291] px-2">Visning:</span>
                {[
                  { role: 'student', label: 'Elev', path: '/student/dashboard' },
                  { role: 'teacher', label: 'Mentor', path: '/teacher/dashboard' },
                  { role: 'superadmin', label: 'Superadmin', path: '/admin/portal' }
                ].map(opt => {
                  const isCurrent = user?.role === opt.role;
                  return (
                    <button
                      key={opt.role}
                      onClick={() => {
                        setUser(prev => ({ ...prev, role: opt.role }));
                        navigate(opt.path);
                        showToast(`Visning endret til ${opt.label}`);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                        isCurrent 
                          ? 'bg-[#561291] text-white shadow-sm font-bold' 
                          : 'text-[#46617b] hover:bg-[#561291]/10 hover:text-[#561291]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-3 sm:gap-4 text-primary pl-2 border-l border-outline-variant/30">
              <button 
                onClick={toggleLanguage}
                className="p-1.5 hover:bg-surface-container rounded-full shrink-0 text-primary transition-all active:scale-95 flex items-center justify-center"
                title={language === 'no' ? 'Bytt til engelsk (Switch to English)' : 'Bytt til norsk (Switch to Norwegian)'}
              >
                <Globe size={20} />
              </button>

              <button 
                onClick={() => navigate('/student/chat')}
                className="relative hover:opacity-80 transition-all p-1.5 hover:bg-surface-container rounded-full shrink-0 flex items-center justify-center text-primary"
                title={language === 'en' ? "Messages / Prayer Community" : "Meldinger / Bønnefellesskap"}
              >
                <Bell size={20} />
              </button>
              
              <Link
                to="/teacher/profile"
                className="group flex items-center gap-2.5 rounded-xl px-1.5 py-1 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all active:scale-[0.98]"
                title={language === 'en' ? "Open my mentor profile" : "Åpne min lærerprofil"}
                aria-label={language === 'en' ? "Open my mentor profile" : "Åpne min lærerprofil"}
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
            </div>
          </div>

        </div>
      </header>

      {/* Main Content Layout with Sidebar */}
      <div className="flex flex-1 w-full max-w-[1440px] mx-auto relative min-h-[calc(100vh-80px)]">
        
        {/* Collapsible Left Sidebar for Mentor portal */}
        <aside 
          className="bg-white border-r border-outline-variant/20 sticky top-20 hidden md:flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden z-30 h-[calc(100vh-80px)] self-start"
          style={{ 
            width: isCollapsed ? '0px' : '288px',
            opacity: isCollapsed ? 0 : 1,
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
          }}
        >
          <div className="py-8 px-6 flex flex-col justify-between h-full w-72 shrink-0 overflow-y-auto">
            <div className="space-y-6">
              {/* Mentor status details */}
              <button
                onClick={() => navigate('/teacher/profile')}
                className="px-2 text-left w-full rounded-xl hover:bg-surface-container-low transition-colors active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                {navItems.map((item, idx) => {
                  if (item.isHeader) {
                    return (
                      <div 
                        key={item.slug + '-' + idx} 
                        className="text-[10px] font-bold text-primary uppercase tracking-wider pt-4 pb-1 px-4 select-none"
                      >
                        <CmsText slug={item.slug} fallback={item.fallback} />
                      </div>
                    );
                  }
                  const isActive = !item.isLogout && (item.path.includes('?') 
                    ? (location.pathname + location.search) === item.path
                    : location.pathname === item.path);
                  const IconComponent = item.icon;
                  const onClickAction = item.isLogout 
                    ? handleLogOut 
                    : () => navigate(item.path);
                  return (
                    <button 
                      key={item.isLogout ? 'logout' : item.path}
                      onClick={onClickAction} 
                      className={`flex items-center justify-between w-full px-4 py-3 text-sm transition-all rounded-lg font-medium text-left ${
                        isActive 
                          ? 'text-primary bg-primary/5 border-l-4 border-primary font-bold shadow-sm' 
                          : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent size={18} className={isActive ? 'text-primary' : 'text-on-surface-variant'} />
                        <span><CmsText slug={item.slug} fallback={item.fallback} /></span>
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

            <button
              onClick={() => setIsCollapsed(true)}
              className="flex items-center justify-center gap-1.5 w-full py-2 border-t border-slate-100 text-[10px] uppercase font-bold tracking-widest text-on-surface-variant hover:text-primary transition-all mt-6"
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

      {/* Mobile Navigation Drawer */}
      <div 
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ease-in-out ${
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
          <div className="py-6 px-6 space-y-6">
            {/* Header in Drawer */}
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
              <div className="font-serif text-lg font-bold text-primary flex items-center gap-2 cursor-pointer" onClick={() => { navigate('/teacher/dashboard'); setIsMobileMenuOpen(false); }}>
                <GraduationCap className="text-primary shrink-0 animate-pulse" size={20} />
                <span className="hidden sm:inline"><CmsText slug="layout-logo-title" fallback="His Kingdom Prophets" /></span>
                <span className="inline sm:hidden"><CmsText slug="layout-logo-mobile-title" fallback="HKP" /></span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 hover:bg-surface-container rounded-lg text-primary"
              >
                <X size={20} />
              </button>
            </div>

            {/* Superadmin System View Switcher for Mobile Drawer */}
            {(['thomas@tk-design.no', 'knutsenthomas@gmail.com'].includes(user?.email?.toLowerCase()) || user?.email?.includes('superadmin')) && (
              <div className="flex flex-col gap-2 p-3 bg-[#561291]/5 rounded-xl border border-[#561291]/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#561291] px-1">Endre Visningsrolle</span>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { role: 'student', label: 'Elev', path: '/student/dashboard' },
                    { role: 'teacher', label: 'Mentor', path: '/teacher/dashboard' },
                    { role: 'superadmin', label: 'Superadmin', path: '/admin/portal' }
                  ].map(opt => {
                    const isCurrent = user?.role === opt.role;
                    return (
                      <button
                        key={opt.role}
                        onClick={() => {
                          setUser(prev => ({ ...prev, role: opt.role }));
                          navigate(opt.path);
                          setIsMobileMenuOpen(false);
                          showToast(`Visning endret til ${opt.label}`);
                        }}
                        className={`py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider text-center transition-all ${
                          isCurrent 
                            ? 'bg-[#561291] text-white shadow-sm font-bold' 
                            : 'bg-white/60 text-[#46617b] hover:bg-[#561291]/10 hover:text-[#561291]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mentor status details */}
            <button
              onClick={() => {
                navigate('/teacher/profile');
                setIsMobileMenuOpen(false);
              }}
              className="px-2 text-left w-full rounded-xl hover:bg-surface-container-low transition-colors active:scale-[0.99]"
              title="Åpne min lærerprofil"
            >
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Mentorveiledning</p>
              <div className="bg-surface-container-low rounded-xl p-3 border border-outline-variant/30 space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant">
                  <span>Studentoppfølging</span>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${atRiskCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {atRiskCount} kritiske
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[65%]"></div>
                </div>
              </div>
            </button>

            {/* Nav Items */}
            <nav className="space-y-1">
              {navItems.map((item, idx) => {
                if (item.isHeader) {
                  return (
                    <div 
                      key={item.slug + '-' + idx} 
                      className="text-[10px] font-bold text-primary uppercase tracking-wider pt-4 pb-1 px-4 select-none"
                    >
                      <CmsText slug={item.slug} fallback={item.fallback} />
                    </div>
                  );
                }
                const isActive = !item.isLogout && (item.path.includes('?') 
                  ? (location.pathname + location.search) === item.path
                  : location.pathname === item.path);
                const IconComponent = item.icon;
                const onClickAction = item.isLogout 
                  ? handleLogOut 
                  : () => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    };
                return (
                  <button 
                    key={item.isLogout ? 'logout' : item.path}
                    onClick={onClickAction} 
                    className={`flex items-center justify-between w-full px-4 py-3 text-sm transition-all rounded-lg font-medium text-left ${
                      isActive 
                        ? 'text-primary bg-primary/5 border-l-4 border-primary font-bold shadow-sm' 
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent size={18} className={isActive ? 'text-primary' : 'text-on-surface-variant'} />
                      <span><CmsText slug={item.slug} fallback={item.fallback} /></span>
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
        </aside>
      </div>

      {/* Global HKM Assistent Chat Widget rendered once at layout level */}
      <HkmChatWidget />
    </div>
  );
}
