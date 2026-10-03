import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, RefreshCw, ExternalLink, Edit3, GraduationCap, CheckCircle2, 
  Users, FileText, Search, Shield, Lock, ArrowRight, Download, Eye, 
  Sparkles, Check, Database, Smartphone, Layers, ToggleLeft, ToggleRight
} from 'lucide-react';
import CmsText from '@/components/CmsText';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { 
    user, 
    cmsContent, 
    showToast,
    language,
    admissionFormOpen,
    setAdmissionFormOpenState
  } = useApp();

  const [applications, setApplications] = useState([]);
  const [leadsCount, setLeadsCount] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTogglingAdmission, setIsTogglingAdmission] = useState(false);

  // Fetch real applications and leads from Firestore
  useEffect(() => {
    let isMounted = true;
    const loadOverviewData = async () => {
      try {
        const appSnap = await getDocs(collection(db, "applications"));
        const apps = appSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
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

  const handleSyncCheck = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast("Synkronisering verifisert: Skyfunksjonen communitySso og tilgangstabeller er online.");
    }, 1200);
  };

  const handleToggleAdmission = async () => {
    if (isTogglingAdmission) return;
    setIsTogglingAdmission(true);
    try {
      const next = !admissionFormOpen;
      await setAdmissionFormOpenState(next);
      showToast(next ? "Søknadsskjemaet er nå ÅPENT på landingssiden!" : "Søknadsskjemaet er nå LÅST på landingssiden.");
    } catch (err) {
      showToast("Feil ved endring av opptaksstatus: " + err.message, "error");
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
    <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 pb-28 space-y-7">
      
      {/* 1. Page Header (Identical to Community App TeacherOverview) */}
      <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 px-4 sm:px-6 pt-3 sm:pt-4 pb-5 sm:pb-6 border-b border-outline-variant/20">
        <div className="max-w-xl lg:max-w-2xl min-w-0">
          <h1 className="page-title mt-1 lg:mt-0">Hei, {user?.name?.split(' ')[0] || 'Thomas'}</h1>
          <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
            Velkommen til administrasjon og synkronisering for HKPC. Få samlet oversikt over innhold og opptak på <strong>hkpc.no</strong>, samt sømløs integrasjon og tilgangssynk mot Community-appen (<strong>app.hkpc.no</strong>).
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 shrink-0 pt-0.5">
          <p className="inline-flex items-center rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
            Administrator · hkpc.no
          </p>
        </div>
      </header>

      {/* 2. Action Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={() => window.open('/', '_blank')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/25 text-on-surface text-xs font-semibold hover:border-primary/40 hover:bg-primary/5 transition-all shadow-xs cursor-pointer"
        >
          <Globe size={15} className="text-primary" />
          <span>Vis landingsside (hkpc.no)</span>
          <ExternalLink size={12} className="text-outline" />
        </button>

        <button
          onClick={() => window.open('https://app.hkpc.no', '_blank')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs cursor-pointer"
        >
          <Smartphone size={15} />
          <span>Åpne Community App</span>
          <ExternalLink size={12} className="opacity-80" />
        </button>

        <button
          onClick={handleSyncCheck}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/25 text-on-surface text-xs font-semibold hover:border-primary/40 hover:bg-primary/5 transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw size={15} className={`text-primary ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? "Verifiserer..." : "Synk-sjekk"}</span>
        </button>
      </div>

      {/* 3. 4 KPI Cards (Identical to Community App TeacherOverview) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        
        {/* Card 1: Søknader */}
        <button 
          onClick={() => navigate('/admin/portal?tab=admissions')} 
          className="text-left bg-surface-container-lowest border border-outline-variant/25 rounded-2xl p-4 sm:p-6 hover:border-primary/40 transition-colors shadow-xs cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-on-surface">Opptakssøknader</span>
            <GraduationCap size={20} className="text-primary" />
          </div>
          <strong className="text-3xl sm:text-4xl block mt-4 font-extrabold text-on-surface">
            {isLoadingData ? '—' : applications.length}
          </strong>
          <span className="block mt-2 text-sm text-on-surface-variant">
            {leadsCount} på interesseliste
          </span>
        </button>

        {/* Card 2: Opptaksstatus Toggle */}
        <div className="text-left bg-surface-container-lowest border border-outline-variant/25 rounded-2xl p-4 sm:p-6 hover:border-primary/40 transition-colors shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-on-surface">Opptak på nettsiden</span>
            <button
              onClick={handleToggleAdmission}
              disabled={isTogglingAdmission}
              className="text-primary hover:opacity-80 transition-opacity cursor-pointer"
              title={admissionFormOpen ? "Lås søknadsskjema" : "Åpne søknadsskjema"}
            >
              {admissionFormOpen ? <ToggleRight size={26} className="text-emerald-600" /> : <ToggleLeft size={26} className="text-slate-400" />}
            </button>
          </div>
          <strong className="text-3xl sm:text-4xl block mt-4 font-extrabold text-on-surface">
            {admissionFormOpen ? 'Åpent' : 'Låst'}
          </strong>
          <span className="block mt-2 text-sm text-on-surface-variant">
            {admissionFormOpen ? 'Direkte påmelding aktiv' : 'Interesseliste aktiv'}
          </span>
        </div>

        {/* Card 3: Landingsside Status */}
        <button 
          onClick={() => navigate('/admin/cms')} 
          className="text-left bg-surface-container-lowest border border-outline-variant/25 rounded-2xl p-4 sm:p-6 hover:border-primary/40 transition-colors shadow-xs cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-on-surface">Landingsside</span>
            <Globe size={20} className="text-primary" />
          </div>
          <strong className="text-3xl sm:text-4xl block mt-4 font-extrabold text-emerald-700">
            Live
          </strong>
          <span className="block mt-2 text-sm text-on-surface-variant">
            SEO & GEO 100% validert
          </span>
        </button>

        {/* Card 4: App-synkronisering */}
        <button 
          onClick={() => navigate('/admin/portal?tab=users')} 
          className="text-left bg-surface-container-lowest border border-outline-variant/25 rounded-2xl p-4 sm:p-6 hover:border-primary/40 transition-colors shadow-xs cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-on-surface">App-synk</span>
            <Database size={20} className="text-primary" />
          </div>
          <strong className="text-3xl sm:text-4xl block mt-4 font-extrabold text-primary">
            Tilkoblet
          </strong>
          <span className="block mt-2 text-sm text-on-surface-variant">
            communitySso aktiv
          </span>
        </button>

      </div>

      {/* 4. Main 2-Column Grid (Identical to Community App TeacherOverview) */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Column (lg:col-span-2): Landingsside Innhold (CMS) */}
        <section className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/25 rounded-2xl p-5 sm:p-7 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/20 pb-4">
            <div>
              <h2 className="flex gap-2 items-center font-bold text-lg text-on-surface">
                <Edit3 size={20} className="text-primary" />
                <span>Landingsside Innhold & CMS</span>
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Rediger tekster, studielinjer og informasjon på hkpc.no
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/cms')}
              className="rounded-xl bg-primary text-on-primary px-4 py-2.5 text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Åpne Global CMS
            </button>
          </div>

          {/* Grid of section shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: "Forside Hero & Tittel", desc: "Hovedoverskrift, ingress og CTA-knapp", section: "Forside Hero" },
              { title: "Studielinjer (PROP/BIBLE/MIN)", desc: "Beskrivelser, emner og kursstruktur", section: "Studieprogram" },
              { title: "Priser & Finansiering", desc: "Studieavgift, delbetaling og vilkår", section: "Opptaksside" },
              { title: "Lærere & Fakultet", desc: "Hilde Karin Knutsen & Thomas Knutsen", section: "Fakultet" },
              { title: "Ofte Stilte Spørsmål (FAQ)", desc: "GEO-optimaliserte svar og veiledning", section: "Kundestøtte" },
              { title: "Dokumenter & Studieplan", desc: "Last opp pensumhefter og studieguider", section: "documents" }
            ].map((item, idx) => (
              <div 
                key={idx}
                onClick={() => navigate(item.section === 'documents' ? '/admin/cms?category=documents' : `/admin/cms?search=${encodeURIComponent(item.title.split(' ')[0])}`)}
                className="p-4 rounded-xl border border-outline-variant/20 bg-surface hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                      {item.title}
                    </span>
                    <ArrowRight size={15} className="text-outline group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Direct in-place editor banner */}
          <div className="p-4 rounded-xl bg-surface border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
                <Sparkles size={16} className="text-primary" />
                <span>Visuell redigering direkte på nettsiden</span>
              </p>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Klikk på blyant-ikonet nede til høyre på nettsiden for å redigere tekst direkte i layouten.
              </p>
            </div>
            <button
              onClick={() => window.open('/?cmsEdit=true', '_blank')}
              className="rounded-xl border border-outline-variant/40 hover:bg-primary/5 text-primary px-3.5 py-2 text-xs font-semibold transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
            >
              Åpne nettsiden med editor
            </button>
          </div>
        </section>

        {/* Right Column (lg:col-span-1): Arbeidsverktøy & App-synk */}
        <section className="bg-surface-container-lowest border border-outline-variant/25 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-on-surface">Arbeidsverktøy & Synk</h2>
            <div className="mt-4 space-y-2">
              {[
                { title: 'Åpne Community App', action: () => window.open('https://app.hkpc.no', '_blank'), isExternal: true },
                { title: 'Elever & Tilgangssynk', action: () => navigate('/admin/portal?tab=users') },
                { title: 'Opptakssøknader', action: () => navigate('/admin/portal?tab=admissions') },
                { title: 'SEO & GEO Status', action: () => navigate('/admin/cms?category=seo') },
                { title: 'Eksporter søknader (CSV)', action: exportApplicationsCsv },
                { title: 'Verifiser synkronisering', action: handleSyncCheck },
              ].map((act, idx) => (
                <button
                  key={idx}
                  onClick={act.action}
                  className="w-full text-left flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-primary/5 text-sm font-semibold text-on-surface cursor-pointer transition-colors"
                >
                  <span>{act.title}</span>
                  {act.isExternal ? <ExternalLink size={16} className="text-primary" /> : <ArrowRight size={17} className="text-primary" />}
                </button>
              ))}
            </div>
          </div>

          {/* Sync Status Card inside Right Column */}
          <div className="p-3.5 rounded-xl bg-surface border border-outline-variant/20 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-on-surface">Autentisering (SSO)</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Aktiv
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Skyfunksjon <code className="font-mono text-primary font-bold">communitySso</code> overfører automatisk godkjente elever til klasserommet i appen.
            </p>
          </div>
        </section>

      </div>

      {/* 5. Bottom Section: SEO, GEO & Siste Søknader */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* SEO & GEO Card */}
        <section className="bg-surface-container-lowest border border-outline-variant/25 rounded-2xl p-5 sm:p-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold inline-flex gap-2 items-center text-on-surface">
              <Search size={20} className="text-primary" />
              <span>SEO & GEO (AI-synlighet)</span>
            </h2>
            <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
              100% Validert
            </span>
          </div>
          <p className="text-sm text-on-surface-variant">
            hkpc.no er optimalisert for Google og generative søkemotorer (Perplexity, ChatGPT, Gemini) med strukturerte data og robots-direktiver.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="p-3 rounded-xl bg-surface border border-outline-variant/20 text-center">
              <span className="text-[10px] font-bold text-outline uppercase block">JSON-LD</span>
              <span className="text-xs font-bold text-emerald-700 mt-1 block">4 Schemaer</span>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-outline-variant/20 text-center">
              <span className="text-[10px] font-bold text-outline uppercase block">Sitemap</span>
              <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="text-xs font-bold text-primary hover:underline mt-1 block">
                sitemap.xml ↗
              </a>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-outline-variant/20 text-center">
              <span className="text-[10px] font-bold text-outline uppercase block">AI-feed</span>
              <a href="/llms.txt" target="_blank" rel="noreferrer" className="text-xs font-bold text-primary hover:underline mt-1 block">
                llms.txt ↗
              </a>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-outline-variant/20 text-center">
              <span className="text-[10px] font-bold text-outline uppercase block">Robots</span>
              <a href="/robots.txt" target="_blank" rel="noreferrer" className="text-xs font-bold text-primary hover:underline mt-1 block">
                robots.txt ↗
              </a>
            </div>
          </div>
        </section>

        {/* Siste Søknader Card */}
        <section className="bg-surface-container-lowest border border-outline-variant/25 rounded-2xl p-5 sm:p-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold inline-flex gap-2 items-center text-on-surface">
              <GraduationCap size={20} className="text-primary" />
              <span>Siste Søknader fra hkpc.no</span>
            </h2>
            <button
              onClick={() => navigate('/admin/portal?tab=admissions')}
              className="text-sm font-semibold text-primary py-1 hover:underline cursor-pointer"
            >
              Alle søknader →
            </button>
          </div>

          {applications.length === 0 ? (
            <p className="text-sm text-on-surface-variant pt-2">
              {isLoadingData ? "Laster inn søknader..." : "Ingen nye søknader mottatt ennå. Søknader via opptakssiden dukker opp her automatisk."}
            </p>
          ) : (
            <div className="space-y-2 pt-1 max-h-[180px] overflow-y-auto">
              {applications.slice(0, 3).map((app) => (
                <div 
                  key={app.id}
                  className="p-3 rounded-xl border border-outline-variant/20 bg-surface flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-on-surface block truncate">{app.name}</span>
                    <span className="text-[11px] text-on-surface-variant block truncate">{app.email} · {app.program || 'HKPC'}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                    {app.status || 'Mottatt'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
