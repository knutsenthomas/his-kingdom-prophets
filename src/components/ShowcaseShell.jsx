import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Monitor, Tablet, Smartphone, ChevronUp, ChevronDown, User, Shield, GraduationCap, Eye } from 'lucide-react';

export default function ShowcaseShell({ viewportSize, setViewportSize }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, changePersona } = useApp();

  const SCREENS = [
    {
      group: "Landingssider & Onboarding",
      items: [
        { name: "Desktop Landingsside", path: "/" },
        { name: "Tablet Landingsside", path: "/landing/tablet" },
        { name: "Mobil Landingsside", path: "/landing/mobile" },
        { name: "Innlogging", path: "/login" },
        { name: "Opprett Profil", path: "/register" },
        { name: "Velg Interessent", path: "/interests" },
        { name: "Fullfør Profil", path: "/complete-profile" },
        { name: "Velkommen om bord", path: "/onboarding-welcome" }
      ]
    },
    {
      group: "Studentportal",
      items: [
        { name: "Mitt Dashboard", path: "/student/dashboard" },
        { name: "Kursleksjon (Optimalisert)", path: "/student/lesson" },
        { name: "Videovisning / Live Klasse", path: "/student/video" },
        { name: "Bibliotek", path: "/student/library" },
        { name: "Oppgaveoversikt", path: "/student/assignments" },
        { name: "Fellesskapschat", path: "/student/chat" }
      ]
    },
    {
      group: "Lærerportal",
      items: [
        { name: "Lærer Dashboard", path: "/teacher/dashboard" },
        { name: "Behov for Oppfølging", path: "/teacher/follow-up" },
        { name: "Håndtering av Oppfølging", path: "/teacher/handle-requests" },
        { name: "Rettingsvisning / Karakterer", path: "/teacher/grading" },
        { name: "Kursbygger", path: "/teacher/course-builder" },
        { name: "Mediebibliotek", path: "/teacher/media-library" },
        { name: "Karakterutregning", path: "/teacher/grades-calc" },
        { name: "Varslingssenter", path: "/teacher/notifications" }
      ]
    },
    {
      group: "Administrator / CMS",
      items: [
        { name: "Global CMS Styring", path: "/admin/cms" },
        { name: "Analytics Dashboard", path: "/admin/analytics" }
      ]
    },
    {
      group: "Responsive E-postmaler",
      items: [
        { name: "E-post Galleri", path: "/email/previews" }
      ]
    }
  ];

  return (
    <div className="sticky top-0 z-[100] w-full bg-primary border-b border-on-primary-container text-white select-none shadow-md transition-all duration-300">
      {/* Tiny toggle bar */}
      <div className="flex justify-between items-center px-4 py-1.5 bg-primary-container text-[11px] text-on-primary-container font-mono">
        <div className="flex items-center gap-1">
          <Eye size={12} className="text-on-primary-container" />
          <span>HIS KINGDOM PROPHETS SHOWCASE HUB</span>
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1 hover:text-white px-2 py-0.5 rounded transition-all bg-primary/20"
        >
          {isCollapsed ? (
            <><span>Vis Meny</span><ChevronDown size={12} /></>
          ) : (
            <><span>Skjul Meny</span><ChevronUp size={12} /></>
          )}
        </button>
      </div>

      {/* Main Controls Panel */}
      {!isCollapsed && (
        <div className="px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 max-w-[1440px] mx-auto animate-in fade-in duration-300">
          
          {/* Quick jump dropdown */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-primary-container shrink-0">Hopp til skjerm:</label>
            <select
              value={location.pathname}
              onChange={(e) => navigate(e.target.value)}
              className="bg-primary-container text-white border border-on-primary-container/30 px-3 py-2 rounded-lg text-sm w-full md:w-[280px] focus:ring-1 focus:ring-on-primary-container"
            >
              {SCREENS.map(group => (
                <optgroup label={group.group} key={group.group} className="text-primary bg-white">
                  {group.items.map(screen => (
                    <option value={screen.path} key={screen.path} className="text-primary bg-white">
                      {screen.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Viewport resizing toggles */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-primary-container mr-2">Forhåndsvisning:</span>
            
            <button
              onClick={() => setViewportSize('desktop')}
              className={`p-2 rounded-lg transition-all flex items-center gap-1.5 text-xs ${
                viewportSize === 'desktop' ? 'bg-white text-primary font-bold shadow' : 'bg-primary-container text-on-primary-container hover:text-white'
              }`}
              title="Desktop (100% bredde)"
            >
              <Monitor size={14} />
              <span className="hidden sm:inline">Desktop</span>
            </button>

            <button
              onClick={() => setViewportSize('tablet')}
              className={`p-2 rounded-lg transition-all flex items-center gap-1.5 text-xs ${
                viewportSize === 'tablet' ? 'bg-white text-primary font-bold shadow' : 'bg-primary-container text-on-primary-container hover:text-white'
              }`}
              title="Tablet (768px bredde)"
            >
              <Tablet size={14} />
              <span className="hidden sm:inline">Tablet</span>
            </button>

            <button
              onClick={() => setViewportSize('mobile')}
              className={`p-2 rounded-lg transition-all flex items-center gap-1.5 text-xs ${
                viewportSize === 'mobile' ? 'bg-white text-primary font-bold shadow' : 'bg-primary-container text-on-primary-container hover:text-white'
              }`}
              title="Mobil (390px bredde)"
            >
              <Smartphone size={14} />
              <span className="hidden sm:inline">Mobil</span>
            </button>
          </div>

          {/* Persona role switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-primary-container mr-2">Persona:</span>
            
            <button
              onClick={() => changePersona('student')}
              className={`px-3 py-1.5 rounded-lg transition-all text-xs flex items-center gap-1 ${
                user?.role === 'student' ? 'bg-secondary-container text-primary font-bold' : 'bg-primary-container text-on-primary-container hover:text-white'
              }`}
            >
              <GraduationCap size={14} />
              <span>Student</span>
            </button>

            <button
              onClick={() => changePersona('teacher')}
              className={`px-3 py-1.5 rounded-lg transition-all text-xs flex items-center gap-1 ${
                user?.role === 'teacher' ? 'bg-secondary-container text-primary font-bold' : 'bg-primary-container text-on-primary-container hover:text-white'
              }`}
            >
              <User size={14} />
              <span>Lærer</span>
            </button>

            <button
              onClick={() => changePersona('admin')}
              className={`px-3 py-1.5 rounded-lg transition-all text-xs flex items-center gap-1 ${
                user?.role === 'admin' ? 'bg-secondary-container text-primary font-bold' : 'bg-primary-container text-on-primary-container hover:text-white'
              }`}
            >
              <Shield size={14} />
              <span>Admin</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
