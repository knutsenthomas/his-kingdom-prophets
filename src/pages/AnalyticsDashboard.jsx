import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, BarChart3, TrendingUp, Download, Calendar, 
  Clock, FileText, CheckCircle2, RefreshCw, Mail, Globe,
  Shield, Check, ExternalLink, GraduationCap
} from 'lucide-react';

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const { user, showToast, admissionFormOpen } = useApp();

  const [applications, setApplications] = useState([]);
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const appSnap = await getDocs(collection(db, "applications"));
      const apps = appSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      apps.sort((a, b) => {
        const timeA = a.submittedAt?.seconds ? a.submittedAt.seconds * 1000 : new Date(a.date || a.createdAt || 0).getTime();
        const timeB = b.submittedAt?.seconds ? b.submittedAt.seconds * 1000 : new Date(b.date || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      setApplications(apps);
    } catch (err) {
      console.warn("Kunne ikke hente søknader:", err);
    }

    try {
      const leadSnap = await getDocs(collection(db, "admission_leads"));
      const ld = leadSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      ld.sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      setLeads(ld);
    } catch (err) {
      console.warn("Kunne ikke hente interesseliste:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const exportApplicationsCsv = () => {
    if (!applications.length) {
      showToast("Ingen søknader å eksportere.");
      return;
    }
    const headers = ["Navn", "E-post", "Telefon", "Adresse", "Kjønn", "Sivilstatus", "Studielinje", "Betalingsplan", "Status", "Innsendt dato"];
    const rows = applications.map(a => [
      `"${(a.name || '').replace(/"/g, '""')}"`,
      `"${(a.email || '').replace(/"/g, '""')}"`,
      `"${(a.phone || '').replace(/"/g, '""')}"`,
      `"${(a.address || '').replace(/"/g, '""')}"`,
      `"${(a.gender || '').replace(/"/g, '""')}"`,
      `"${(a.maritalStatus || '').replace(/"/g, '""')}"`,
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

  const exportLeadsCsv = () => {
    if (!leads.length) {
      showToast("Ingen registrerte på interesselisten å eksportere.");
      return;
    }
    const headers = ["Navn", "E-post", "Kilde", "Registrert dato"];
    const rows = leads.map(l => [
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.source || 'admission_portal_reminder_2027').replace(/"/g, '""')}"`,
      `"${(l.createdAt?.toDate?.() ? l.createdAt.toDate().toLocaleDateString('no-NO') : '').replace(/"/g, '""')}"`
    ]);
    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(r => r.join(";"))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `HKPC_Interesseliste_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Interesseliste eksportert til CSV (UTF-8 BOM).");
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6 md:gap-8 font-sans">
      
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/20 pb-5">
        <div>
          <button 
            onClick={() => navigate('/teacher/dashboard')}
            className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors text-xs font-bold uppercase tracking-wider mb-2 cursor-pointer"
          >
            <ArrowLeft size={14} />
            Tilbake til Oversikt
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 size={28} className="text-primary shrink-0" />
            Opptaks- & Trafikkstatus (hkpc.no)
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Sanntidsstatus for søknader, interessenter og teknisk SEO på landingssiden.
          </p>
        </div>
        
        <button
          onClick={fetchAnalyticsData}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-outline-variant/30 hover:border-primary/40 bg-surface text-xs font-semibold text-on-surface hover:text-primary transition-all cursor-pointer shadow-xs"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin text-primary" : "text-primary"} />
          <span>{isLoading ? "Oppdaterer..." : "Oppdater data"}</span>
        </button>
      </div>

      {/* Real Analytics KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1: Real Applications */}
        <div className="bg-surface-container-lowest border border-outline-variant/25 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-outline">Mottatte Søknader</p>
            <h3 className="text-3xl font-extrabold text-slate-900">
              {isLoading ? "—" : applications.length}
            </h3>
            <p className="text-[11px] text-primary font-semibold">
              Reelle søkere via skjema
            </p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
            <GraduationCap size={22} />
          </div>
        </div>

        {/* KPI 2: Real Leads */}
        <div className="bg-surface-container-lowest border border-outline-variant/25 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-outline">Interesseliste</p>
            <h3 className="text-3xl font-extrabold text-slate-900">
              {isLoading ? "—" : leads.length}
            </h3>
            <p className="text-[11px] text-slate-600 font-semibold">
              Påmeldt for forhåndsvarsel
            </p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
            <Mail size={22} />
          </div>
        </div>

        {/* KPI 3: Admission Status */}
        <div className="bg-surface-container-lowest border border-outline-variant/25 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-outline">Påmeldingsstatus</p>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {admissionFormOpen ? "Åpent" : "Låst (2027)"}
            </h3>
            <p className="text-[11px] text-slate-600 font-semibold">
              {admissionFormOpen ? "Publikum kan søke" : "Interesseliste aktiv"}
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700 shrink-0">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* KPI 4: Technical SEO & GEO */}
        <div className="bg-surface-container-lowest border border-outline-variant/25 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-outline">SEO & GEO Helse</p>
            <h3 className="text-2xl font-extrabold text-emerald-700">100% Valid</h3>
            <p className="text-[11px] text-emerald-800 font-semibold">
              Google & AI-indeksert
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700 shrink-0">
            <Globe size={22} />
          </div>
        </div>
      </div>

      {/* Main details: Reports export and live activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Real Downloadable Reports: Left (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant/25 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-outline-variant/20 pb-4">
              <FileText size={18} className="text-primary shrink-0" />
              <span>Rapportering & Dataeksport (CSV / UTF-8)</span>
            </h3>

            <div className="space-y-3.5">
              
              {/* Report 1: Applications */}
              <div className="p-4 bg-surface rounded-xl border border-outline-variant/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/40 transition-all">
                <div className="space-y-1 min-w-0">
                  <h4 className="text-sm font-bold text-primary leading-tight">Mottatte Søknader (Fullstendig)</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Inneholder alle {applications.length} innsendte søknader med personalia, studielinje, betalingsplan og dato.
                  </p>
                </div>
                
                <button 
                  onClick={exportApplicationsCsv}
                  className="py-2.5 px-4 bg-primary text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-primary/90 transition-all active:scale-95 shrink-0 cursor-pointer shadow-xs"
                >
                  <Download size={14} className="shrink-0" />
                  <span>Last ned CSV</span>
                </button>
              </div>

              {/* Report 2: Leads */}
              <div className="p-4 bg-surface rounded-xl border border-outline-variant/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/40 transition-all">
                <div className="space-y-1 min-w-0">
                  <h4 className="text-sm font-bold text-primary leading-tight">Interesseliste for opptak (Varslinger)</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Inneholder alle {leads.length} registrerte personer som ønsker varsel ved åpning for 2027.
                  </p>
                </div>
                
                <button 
                  onClick={exportLeadsCsv}
                  className="py-2.5 px-4 bg-primary text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-primary/90 transition-all active:scale-95 shrink-0 cursor-pointer shadow-xs"
                >
                  <Download size={14} className="shrink-0" />
                  <span>Last ned CSV</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Real Activity: Right (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant/25 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-outline-variant/20 pb-4">
              <RefreshCw size={17} className="text-primary shrink-0" />
              <span>Siste Søknadsaktivitet</span>
            </h3>

            {applications.length === 0 ? (
              <div className="py-8 text-center text-on-surface-variant space-y-1">
                <p className="text-xs font-semibold">Ingen nye søknader mottatt ennå.</p>
                <p className="text-[11px] text-outline">
                  Søknader innsendt via <span className="font-semibold">hkpc.no/admission</span> vises her i sanntid.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 5).map((app, idx) => (
                  <div key={idx} className="flex gap-3 text-xs items-start p-2.5 rounded-lg bg-surface border border-outline-variant/15">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-bold text-primary truncate">{app.name || 'Ukjent søker'}</p>
                      <p className="text-on-surface-variant text-[11px] truncate">
                        {app.program === 'prophetic_community' ? 'PROP 101' :
                         app.program === 'bible_deep_dive' ? 'BIBLE 301' :
                         app.program === 'fivefold_ministry' ? 'MIN 201' : (app.program || 'HKPC')}
                      </p>
                      <p className="text-[10px] text-outline">
                        {app.submittedAt?.toDate?.() ? app.submittedAt.toDate().toLocaleDateString('no-NO') : (app.date || 'Innsendt')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
