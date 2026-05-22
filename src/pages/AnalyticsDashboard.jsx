import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, BarChart3, TrendingUp, Download, Calendar, 
  Clock, ShieldAlert, Award, FileText, CheckCircle2, RefreshCw
} from 'lucide-react';
import HkmChatWidget from '@/components/HkmChatWidget';

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const { user, showToast } = useApp();

  const handleDownload = (format, reportName) => {
    showToast(`Kompilerer ${format}-rapport for "${reportName}"... Nedlastingen starter strax!`);
  };

  return (
    <div className="bg-background min-h-screen flex flex-col font-sans text-on-background">
      {/* Header */}
      <header className="bg-white border-b border-outline-variant sticky top-0 z-40 shadow-sm">
        <div className="flex justify-between items-center px-6 md:px-12 h-20 w-full max-w-[1440px] mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/teacher/dashboard')}
              className="p-2 hover:bg-surface-container rounded-full transition-colors active:scale-95 text-on-surface-variant hover:text-primary"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="font-serif text-2xl font-bold text-primary">Scholastic Premium</div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary px-3 py-1 bg-surface-container rounded-full flex items-center gap-1">
              <BarChart3 size={12} /> Analytics & Reports
            </span>
            <img 
              src={user?.avatar} 
              alt={user?.name} 
              className="w-10 h-10 rounded-full border-2 border-primary-container shadow"
            />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-6 md:px-12 py-12 flex flex-col gap-8">
        
        {/* Intro */}
        {/* Intro */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2 flex-wrap">
              <BarChart3 size={28} className="text-secondary shrink-0" /> Administrativ Analyse & Rapportering
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Sanntidsvisning av studentaktivitet, seminar-oppmøte og eksamens-resultater på tvers av fakultetene.
            </p>
          </div>
          
          <span className="text-xs text-outline font-semibold uppercase bg-surface-container-high px-3 py-1.5 rounded-full shrink-0">
            Oppdatert: Akkurat nå
          </span>
        </div>

        {/* Analytics KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* KPI 1 */}
          <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-outline">Daglige Aktive Studenter</p>
              <h3 className="text-3xl font-bold font-serif text-primary">142</h3>
              <p className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
                <TrendingUp size={12} className="shrink-0" /> +18% økning siste uke
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center text-primary shrink-0">
              <TrendingUp size={22} />
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-outline">Oppmøte på Zoom-seminar</p>
              <h3 className="text-3xl font-bold font-serif text-primary">94.6%</h3>
              <p className="text-[10px] text-outline font-semibold">Gjennomsnitt alle 3 hovedfag</p>
            </div>
            <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center text-primary shrink-0">
              <Clock size={22} />
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-outline">Modul-fullføringsgrad</p>
              <h3 className="text-3xl font-bold font-serif text-primary">78%</h3>
              <p className="text-[10px] text-outline font-semibold">Totalt fullførte leksjoner</p>
            </div>
            <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center text-primary shrink-0">
              <CheckCircle2 size={22} />
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-outline">Plattform-engasjement</p>
              <h3 className="text-3xl font-bold font-serif text-primary">8.4 / 10</h3>
              <p className="text-[10px] text-green-600 font-semibold">Utmerket bruksindeks</p>
            </div>
            <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center text-primary shrink-0">
              <Award size={22} />
            </div>
          </div>
        </div>

        {/* Master details: Reports list and activity feeds */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Downloadable Reports: Left (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white border border-outline-variant rounded-xl p-5 sm:p-6 shadow-sm flex flex-col gap-6">
              <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-4">
                <FileText size={18} className="shrink-0" /> Rapportsenter / PDF & CSV Eksport
              </h3>

              <div className="space-y-4">
                
                {/* Report Item 1 */}
                <div className="p-4 bg-surface-container-low border border-outline-variant rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary transition-all">
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-sm font-bold text-primary leading-tight">Studentprogresjon for semesteret (Fullstendig)</h4>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">Inkluderer fullførte leksjonsmoduler, tidsbruk, og quiz-resultater for alle 48 aktive studenter.</p>
                  </div>
                  
                  <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                    <button 
                      onClick={() => handleDownload('CSV', 'Studentprogresjon')}
                      className="py-2 px-3 flex-grow sm:flex-grow-0 justify-center bg-white border border-outline-variant hover:border-primary text-[10px] font-bold uppercase rounded flex items-center gap-1 hover:text-primary transition-all active:scale-95"
                    >
                      <Download size={12} className="shrink-0" /> CSV
                    </button>
                    <button 
                      onClick={() => handleDownload('PDF', 'Studentprogresjon')}
                      className="py-2 px-3 flex-grow sm:flex-grow-0 justify-center bg-white border border-outline-variant hover:border-primary text-[10px] font-bold uppercase rounded flex items-center gap-1 hover:text-primary transition-all active:scale-95"
                    >
                      <Download size={12} className="shrink-0" /> PDF
                    </button>
                  </div>
                </div>

                {/* Report Item 2 */}
                <div className="p-4 bg-surface-container-low border border-outline-variant rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary transition-all">
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-sm font-bold text-primary leading-tight">Klasseroms-fremdrift & Sensuroversikt</h4>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">Inneholder alle innleverte besvarelser og karakterstatistikk.</p>
                  </div>
                  
                  <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                    <button 
                      onClick={() => handleDownload('CSV', 'Klasseromsfremdrift')}
                      className="py-2 px-3 flex-grow sm:flex-grow-0 justify-center bg-white border border-outline-variant hover:border-primary text-[10px] font-bold uppercase rounded flex items-center gap-1 hover:text-primary transition-all active:scale-95"
                    >
                      <Download size={12} className="shrink-0" /> CSV
                    </button>
                    <button 
                      onClick={() => handleDownload('PDF', 'Klasseromsfremdrift')}
                      className="py-2 px-3 flex-grow sm:flex-grow-0 justify-center bg-white border border-outline-variant hover:border-primary text-[10px] font-bold uppercase rounded flex items-center gap-1 hover:text-primary transition-all active:scale-95"
                    >
                      <Download size={12} className="shrink-0" /> PDF
                    </button>
                  </div>
                </div>

                {/* Report Item 3 */}
                <div className="p-4 bg-surface-container-low border border-outline-variant rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary transition-all">
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-sm font-bold text-primary leading-tight">Zoom Seminar Oppmøte-historikk</h4>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">Detaljerte loggfiler som viser ankomst- og avreisetidspunkter under live-forelesningene.</p>
                  </div>
                  
                  <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                    <button 
                      onClick={() => handleDownload('CSV', 'Zoom Seminar Oppmøte')}
                      className="py-2 px-3 flex-grow sm:flex-grow-0 justify-center bg-white border border-outline-variant hover:border-primary text-[10px] font-bold uppercase rounded flex items-center gap-1 hover:text-primary transition-all active:scale-95 w-full sm:w-auto"
                    >
                      <Download size={12} className="shrink-0" /> CSV
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Activity Log: Right (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col gap-6">
              <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-4">
                <RefreshCw size={18} /> Aktivitetslogg
              </h3>

              <div className="space-y-4">
                {[
                  { title: 'PED 101: 8 nye moduler fullført', desc: 'Studenter fullførte kognitive teorier-leksjonen i dag.', time: '10 min siden' },
                  { title: 'Zoom-seminar fullført', desc: 'Advanced Physics (PHYS 301) gjennomførte forelesning med 92% oppmøte.', time: '2 timer siden' },
                  { title: 'Karakter lagret for Anders Berg', desc: 'Dr. Vance lagret endelig foreløpig karakter for didaktikk-oppgaven.', time: '3 timer siden' },
                  { title: 'IT-Drift: Systemoppdatering 2.4', desc: 'Ny plattform-oppdatering rullet ut for alle brukere.', time: '5 timer siden' }
                ].map((act, idx) => (
                  <div key={idx} className="flex gap-3 text-xs items-start">
                    <div className="w-2.5 h-2.5 rounded-full bg-secondary mt-1 flex-shrink-0" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-primary">{act.title}</p>
                      <p className="text-on-surface-variant text-[11px] leading-relaxed">{act.desc}</p>
                      <p className="text-[10px] text-outline pt-1">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Floating HKM Chat Widget */}
      <HkmChatWidget />
    </div>
  );
}
