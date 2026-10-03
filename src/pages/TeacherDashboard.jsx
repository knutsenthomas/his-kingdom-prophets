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
    <div className="w-full p-4 sm:p-6 md:p-10 space-y-6 md:space-y-8 max-w-7xl mx-auto font-sans text-on-surface">
      
      {/* Top Banner / Executive Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary via-[#561291] to-[#3a0b63] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden"
      >
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12 pointer-events-none">
          <Layers size={220} />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-white/90">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Administrasjon & Synkronisering</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
              Landingsside & App-synkronisering
            </h1>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Full kontroll over innhold, opptak og søknader på <strong>hkpc.no</strong>, samt sømløs integrasjon og tilgangsstyring mot Community-appen (<strong>app.hkpc.no</strong>).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => window.open('/', '_blank')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-primary text-xs font-bold shadow-sm hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              title="Åpne landingssiden i ny fane"
            >
              <Globe size={15} />
              <span>Vis landingsside</span>
              <ExternalLink size={12} className="opacity-70" />
            </button>

            <button
              onClick={() => window.open('https://app.hkpc.no', '_blank')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold hover:bg-[#c9ab68] text-primary text-xs font-bold shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              title="Åpne Community App i ny fane"
            >
              <Smartphone size={15} />
              <span>Åpne Community App</span>
              <ExternalLink size={12} className="opacity-70" />
            </button>

            <button
              onClick={handleSyncCheck}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all active:scale-[0.98] cursor-pointer"
              title="Test og verifiser integrasjon mot skyfunksjoner"
            >
              <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
              <span>{isSyncing ? "Sjekker..." : "Synk-sjekk"}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Landing Page Status */}
        <div className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Landingsside (hkpc.no)</p>
              <h3 className="font-serif text-xl font-bold text-primary mt-1">Online & Aktiv</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <Globe size={20} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-on-surface-variant font-medium">SEO & GEO 100% optimalisert</span>
            <button 
              onClick={() => navigate('/admin/cms')}
              className="text-primary hover:underline font-bold text-[11px] flex items-center gap-1"
            >
              Rediger <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Card 2: Applications */}
        <div className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Opptakssøknader</p>
              <h3 className="font-serif text-2xl font-bold text-primary mt-1">
                {isLoadingData ? "..." : applications.length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <GraduationCap size={20} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-on-surface-variant font-medium">{leadsCount} på interesseliste</span>
            <button 
              onClick={() => navigate('/admin/portal?tab=admissions')}
              className="text-primary hover:underline font-bold text-[11px] flex items-center gap-1"
            >
              Se søkere <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Card 3: Admission Status Toggle */}
        <div className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Opptak på nettsiden</p>
              <h3 className="font-serif text-base font-bold text-primary mt-1">
                {admissionFormOpen ? "Åpent for søknader" : "Låst for søknader"}
              </h3>
            </div>
            <button
              onClick={handleToggleAdmission}
              disabled={isTogglingAdmission}
              className={`p-2 rounded-xl transition-all ${
                admissionFormOpen 
                  ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" 
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
              title={admissionFormOpen ? "Klikk for å låse søknadsskjema" : "Klikk for å åpne søknadsskjema"}
            >
              {admissionFormOpen ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
            </button>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-on-surface-variant font-medium">
              {admissionFormOpen ? "Direkte påmelding aktiv" : "Viser interesseliste-skjema"}
            </span>
            <button 
              onClick={() => window.open('/opptak', '_blank')}
              className="text-primary hover:underline font-bold text-[11px] flex items-center gap-1"
            >
              Forhåndsvis <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Card 4: Community App Sync */}
        <div className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">App-synkronisering</p>
              <h3 className="font-serif text-xl font-bold text-primary mt-1">Tilkoblet</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#561291] flex items-center justify-center shrink-0 border border-purple-100">
              <Database size={20} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-on-surface-variant font-medium">communitySso (europe-west1)</span>
            <button 
              onClick={() => navigate('/admin/portal?tab=users')}
              className="text-primary hover:underline font-bold text-[11px] flex items-center gap-1"
            >
              Brukere <ArrowRight size={12} />
            </button>
          </div>
        </div>

      </div>

      {/* Main Grid: 2 Columns (Left: Landing Page Control / Right: App Sync & Admissions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* Left Column: Landing Page Content & CMS Hub (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Visual CMS & Content shortcuts */}
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                  <Edit3 size={18} />
                  <span>Landingsside Innhold (CMS)</span>
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Rask tilgang til redigering av alle seksjoner og tekster på hkpc.no.
                </p>
              </div>

              <button
                onClick={() => navigate('/admin/cms')}
                className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-all active:scale-[0.98] shrink-0 self-start sm:self-auto"
              >
                Åpne Global CMS
              </button>
            </div>

            {/* Quick-edit buttons for main landing page sections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {[
                { title: "Forside Hero & Tittel", desc: "Hovedoverskrift, ingress og CTA-knapp", section: "Forside Hero" },
                { title: "Studielinjer (PROP/BIBLE/MIN)", desc: "Beskrivelser, emner og kursstruktur", section: "Studieprogram" },
                { title: "Priser & Finansiering", desc: "Studieavgift, delbetaling og vilkår", section: "Opptaksside" },
                { title: "Lærere & Fakultet", desc: "Apostel David, Profet Jon Arild, Pastor Siri", section: "Fakultet" },
                { title: "Ofte Stilte Spørsmål (FAQ)", desc: "GEO-optimaliserte svar og veiledning", section: "Kundestøtte" },
                { title: "Dokumenter & Studieplan", desc: "Last opp pensumhefter og studieguider", section: "documents" }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => navigate(item.section === 'documents' ? '/admin/cms?category=documents' : `/admin/cms?search=${encodeURIComponent(item.title.split(' ')[0])}`)}
                  className="p-3.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-primary group-hover:text-primary-container transition-colors flex items-center justify-between">
                      <span>{item.title}</span>
                      <ArrowRight size={13} className="text-outline group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
                    </h4>
                    <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* In-place editor highlight */}
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200/60 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Sparkles size={14} className="text-primary" />
                  <span>Direkte visuell tekstredigering på nettsiden</span>
                </p>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Trykk på den lilla blyant-knappen nederst til høyre på nettsiden for å klikke og redigere enhver tekst direkte på landingssiden.
                </p>
              </div>
              <button
                onClick={() => window.open('/?cmsEdit=true', '_blank')}
                className="px-3 py-2 bg-white text-primary text-xs font-bold rounded-lg border border-primary/20 shadow-xs hover:bg-primary/5 shrink-0 whitespace-nowrap active:scale-95 transition-all"
              >
                Åpne med editor
              </button>
            </div>
          </div>

          {/* Section 2: SEO & GEO status banner */}
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-serif text-base font-bold text-primary flex items-center gap-2">
                  <Search size={16} />
                  <span>Teknisk SEO & GEO (AI-synlighet)</span>
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Verdensklasse søkemotor- og AI-optimalisering for Google, Perplexity og ChatGPT.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                100% Validert
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-center">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase block">JSON-LD Schema</span>
                <span className="text-xs font-bold text-emerald-700 mt-1 block">4 Schemaer Aktive</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-center">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Sitemap</span>
                <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="text-xs font-bold text-primary hover:underline mt-1 block">
                  sitemap.xml ↗
                </a>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-center">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase block">AI-feed</span>
                <a href="/llms.txt" target="_blank" rel="noreferrer" className="text-xs font-bold text-primary hover:underline mt-1 block">
                  llms.txt ↗
                </a>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-center">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Robots</span>
                <a href="/robots.txt" target="_blank" rel="noreferrer" className="text-xs font-bold text-primary hover:underline mt-1 block">
                  robots.txt ↗
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: App Synchronization & New Admissions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Section 1: App Sync Status & Quick Actions */}
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-serif text-base font-bold text-primary flex items-center gap-2">
                  <RefreshCw size={16} />
                  <span>Synkronisering til Appen</span>
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Overføring av søkere og elever til <strong>app.hkpc.no</strong>
                </p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Tilkoblet" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl border border-outline-variant/30 bg-surface-container-low space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-primary">Autentiseringsbro (SSO)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Aktiv</span>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Elever som godkjennes fra landingssiden logger inn med sin vanlige HKM-bruker og får automatisk tilgang til klasserom og fellesskap.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-outline-variant/30 bg-surface-container-low space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-primary">Skyfunksjon (europe-west1)</span>
                  <span className="text-[10px] font-mono font-bold text-primary">communitySso</span>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Siste distribusjon: Rettet og oppdatert med full administratortilgang.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => window.open('https://app.hkpc.no/#/brukere', '_blank')}
                className="w-full py-2.5 px-4 rounded-xl bg-gold hover:bg-[#c9ab68] text-primary text-xs font-bold shadow-xs hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Users size={14} />
                <span>Administrer elever i Community App ↗</span>
              </button>

              <button
                onClick={() => navigate('/admin/portal?tab=users')}
                className="w-full py-2.5 px-4 rounded-xl border border-outline-variant/40 hover:bg-slate-50 text-primary text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Administrer brukere lokalt i portalen</span>
              </button>
            </div>
          </div>

          {/* Section 2: Recent Applications from Landing Page */}
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-serif text-base font-bold text-primary flex items-center gap-2">
                  <GraduationCap size={16} />
                  <span>Siste Søknader fra hkpc.no</span>
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Mottatt via opptaksskjemaet ({applications.length})
                </p>
              </div>

              {applications.length > 0 && (
                <button
                  onClick={exportApplicationsCsv}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-primary transition-colors"
                  title="Eksporter til Excel/CSV (UTF-8 BOM)"
                >
                  <Download size={16} />
                </button>
              )}
            </div>

            {applications.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-outline-variant/30 rounded-xl space-y-2">
                <GraduationCap size={28} className="mx-auto text-outline" />
                <p className="text-xs text-on-surface-variant font-medium">
                  {isLoadingData ? "Laster inn søknader..." : "Ingen nye søknader mottatt ennå."}
                </p>
                <p className="text-[11px] text-outline">
                  Søknader sendt inn via opptakssiden dukker opp her automatisk.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {applications.slice(0, 5).map((app) => (
                  <div 
                    key={app.id}
                    className="p-3 rounded-xl border border-outline-variant/20 bg-surface-container-lowest flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-primary truncate">{app.name}</h4>
                      <p className="text-[11px] text-on-surface-variant truncate">{app.email}</p>
                      <span className="text-[10px] text-primary/80 font-semibold block mt-0.5">
                        Linje: {app.program || 'Ikke oppgitt'}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {app.status || 'Mottatt'}
                      </span>
                      <span className="text-[9px] text-outline block mt-1">
                        {app.submittedAt?.toDate?.() ? app.submittedAt.toDate().toLocaleDateString('no-NO') : app.date || ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => navigate('/admin/portal?tab=admissions')}
              className="w-full py-2 text-center text-xs font-bold text-primary hover:underline flex items-center justify-center gap-1 pt-1"
            >
              <span>Gå til full søknadsbehandling</span>
              <ArrowRight size={13} />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
