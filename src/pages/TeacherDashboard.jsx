import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { 
  Globe, ExternalLink, Edit3, GraduationCap, Users, 
  Download, ArrowRight, Sparkles, ToggleLeft, ToggleRight,
  Clock, CheckCircle2, ChevronRight
} from 'lucide-react';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { 
    user, 
    showToast,
    admissionFormOpen,
    setAdmissionFormOpenState
  } = useApp();

  const [applications, setApplications] = useState([]);
  const [leadsCount, setLeadsCount] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isTogglingAdmission, setIsTogglingAdmission] = useState(false);

  // Fetch real applications and leads from Firestore
  useEffect(() => {
    let isMounted = true;
    const loadOverviewData = async () => {
      try {
        const appSnap = await getDocs(collection(db, "applications"));
        const apps = appSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        apps.sort((a, b) => {
          const dateA = a.submittedAt?.toDate?.() || new Date(a.date || 0);
          const dateB = b.submittedAt?.toDate?.() || new Date(b.date || 0);
          return dateB - dateA;
        });
        
        const leadSnap = await getDocs(collection(db, "admission_leads"));
        
        if (isMounted) {
          setApplications(apps);
          setLeadsCount(leadSnap.size);
        }
      } catch (err) {
        console.warn("Kunne ikke laste søknader fra Firestore:", err);
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    };

    loadOverviewData();
    return () => { isMounted = false; };
  }, []);

  const handleToggleAdmission = async () => {
    if (isTogglingAdmission) return;
    setIsTogglingAdmission(true);
    try {
      const next = !admissionFormOpen;
      await setAdmissionFormOpenState(next);
      showToast(next ? "Søknadsskjemaet er nå ÅPENT på nettsiden!" : "Søknadsskjemaet er nå LÅST (interesseliste aktiv).");
    } catch (err) {
      showToast("Feil ved endring av opptaksstatus: " + err.message);
    } finally {
      setIsTogglingAdmission(false);
    }
  };

  const exportApplicationsCsv = () => {
    if (!applications.length) {
      showToast("Ingen søknader å eksportere.");
      return;
    }
    const headers = ["Navn", "E-post", "Telefon", "Studielinje", "Betalingsplan", "Status", "Dato"];
    const rows = applications.map(a => [
      `"${(a.name || '').replace(/"/g, '""')}"`,
      `"${(a.email || '').replace(/"/g, '""')}"`,
      `"${(a.phone || '').replace(/"/g, '""')}"`,
      `"${(a.program || '').replace(/"/g, '""')}"`,
      `"${(a.paymentPlan || '').replace(/"/g, '""')}"`,
      `"${(a.status || 'Mottatt').replace(/"/g, '""')}"`,
      `"${(a.submittedAt?.toDate?.() ? a.submittedAt.toDate().toLocaleDateString('no-NO') : a.date || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(r => r.join(";"))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `HKPC_Soknader_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Søknader eksportert til CSV (UTF-8 BOM).");
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 pb-20 space-y-8">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/15 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Hei, {user?.name?.split(' ')[0] || 'Thomas'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Administrasjon og opptak for <strong>hkpc.no</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-primary hover:border-primary/40 text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Globe size={14} className="text-slate-400" />
            <span>Se nettsiden</span>
            <ExternalLink size={12} className="opacity-60" />
          </a>
          <a
            href="https://app.hkpc.no"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
          >
            <span>Åpne Community App</span>
            <ExternalLink size={12} className="opacity-80" />
          </a>
        </div>
      </div>

      {/* 2. Key Status Indicators (3 Clean Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Card 1: Søknader */}
        <div 
          onClick={() => navigate('/admin/portal?tab=admissions')}
          className="bg-white border border-outline-variant/20 rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Søknader & Opptak</span>
            <div className="p-2 rounded-xl bg-purple-50 text-primary group-hover:scale-105 transition-transform">
              <GraduationCap size={18} />
            </div>
          </div>
          <div className="mt-4">
            <strong className="text-3xl font-extrabold text-on-surface">
              {isLoadingData ? '—' : applications.length}
            </strong>
            <p className="text-xs text-slate-500 mt-1">
              {leadsCount} registrert på interesselisten
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-primary">
            <span>Behandle søknader</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 2: Opptaksbryter */}
        <div className="bg-white border border-outline-variant/20 rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Opptak på nettsiden</span>
            <button
              type="button"
              onClick={handleToggleAdmission}
              disabled={isTogglingAdmission}
              className="cursor-pointer focus:outline-none"
              title={admissionFormOpen ? "Lås søknadsskjema" : "Åpne søknadsskjema"}
            >
              {admissionFormOpen ? (
                <ToggleRight size={28} className="text-emerald-600" />
              ) : (
                <ToggleLeft size={28} className="text-slate-400 hover:text-slate-500" />
              )}
            </button>
          </div>
          <div className="mt-4">
            <strong className={`text-3xl font-extrabold ${admissionFormOpen ? 'text-emerald-700' : 'text-slate-700'}`}>
              {admissionFormOpen ? 'Åpent' : 'Låst'}
            </strong>
            <p className="text-xs text-slate-500 mt-1">
              {admissionFormOpen ? 'Søknadsskjemaet er tilgjengelig for alle' : 'Interesseliste vises for skoleåret 2027'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Klikk bryter for å {admissionFormOpen ? 'låse' : 'åpne'}</span>
          </div>
        </div>

        {/* Card 3: Innholdsstatus */}
        <div 
          onClick={() => navigate('/admin/cms')}
          className="bg-white border border-outline-variant/20 rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Nettside & Innhold</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-105 transition-transform">
              <Globe size={18} />
            </div>
          </div>
          <div className="mt-4">
            <strong className="text-3xl font-extrabold text-emerald-700 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live</span>
            </strong>
            <p className="text-xs text-slate-500 mt-1">
              SEO, tospråklig synk og CMS aktivt
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-primary">
            <span>Åpne CMS Dashboard</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

      </div>

      {/* 3. Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Søknadsoversikt */}
        <div className="lg:col-span-2 bg-white border border-outline-variant/20 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <GraduationCap size={18} className="text-primary" />
                <span>Nylige søknader</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kandidater som har søkt opptak til HKPC
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportApplicationsCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                title="Last ned som regneark"
              >
                <Download size={13} />
                <span className="hidden sm:inline">Eksporter CSV</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/portal?tab=admissions')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition cursor-pointer"
              >
                <span>Se alle ({applications.length})</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {applications.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {applications.slice(0, 5).map((app, idx) => {
                const dateStr = app.submittedAt?.toDate?.() 
                  ? app.submittedAt.toDate().toLocaleDateString('no-NO') 
                  : (app.date || 'Nylig');

                return (
                  <div 
                    key={app.id || idx}
                    onClick={() => navigate('/admin/portal?tab=admissions')}
                    className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-xl transition cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-on-surface truncate">{app.name || 'Uten navn'}</p>
                      <p className="text-xs text-slate-500 truncate">{app.email} · {app.phone || 'Ikke oppgitt'}</p>
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-primary">
                        {app.program === 'prophetic_community' ? 'PROP 101' : (app.program || 'Første år')}
                      </span>
                      <span className="text-xs text-slate-400 hidden sm:inline">{dateStr}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Clock size={20} />
              </div>
              <p className="text-sm font-semibold text-slate-700">Ingen søknader mottatt ennå</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Søknadene som sendes inn via nettsiden dukker opp her. Neste ordinære opptaksperiode åpner 1. januar 2027.
              </p>
            </div>
          )}
        </div>

        {/* Right Column (1 col): Hurtigverktøy */}
        <div className="bg-white border border-outline-variant/20 rounded-2xl p-6 space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-on-surface">Redigering & Verktøy</h2>
            <p className="text-xs text-slate-500 mt-0.5">Hurtighandlinger for nettsiden</p>
          </div>

          <div className="space-y-3">
            {/* Visual Editor shortcut */}
            <div 
              onClick={() => window.open('/?cms=1', '_blank')}
              className="p-4 rounded-xl border border-outline-variant/20 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors flex items-center gap-2">
                  <Sparkles size={15} className="text-burnt-orange" />
                  <span>Visuell redigering</span>
                </span>
                <ExternalLink size={13} className="text-slate-400 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Åpne forsiden og rediger tekster direkte i visningen med blyanten.
              </p>
            </div>

            {/* CMS Dashboard */}
            <div 
              onClick={() => navigate('/admin/cms')}
              className="p-4 rounded-xl border border-outline-variant/20 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors flex items-center gap-2">
                  <Edit3 size={15} className="text-primary" />
                  <span>Tekster & CMS</span>
                </span>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Fullstendig oversikt over alle tekster, oversettelser og dokumenter.
              </p>
            </div>

            {/* User Directory */}
            <div 
              onClick={() => navigate('/admin/portal?tab=users')}
              className="p-4 rounded-xl border border-outline-variant/20 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors flex items-center gap-2">
                  <Users size={15} className="text-primary" />
                  <span>Elever & Brukere</span>
                </span>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Se registrerte brukerkontoer og administrer rettigheter.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
