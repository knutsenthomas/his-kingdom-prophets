import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Mail, ShieldAlert, Award, Calendar, 
  BookOpen, Eye, ArrowRight, Smartphone, Laptop, Sparkles
} from 'lucide-react';
import HkmChatWidget from '@/components/HkmChatWidget';

export default function EmailPreviews() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [selectedTemplate, setSelectedTemplate] = useState('enroll'); // enroll, progress, zoom, alert
  const [previewSize, setPreviewSize] = useState('desktop'); // desktop, mobile

  return (
    <div className="bg-background min-h-screen flex flex-col font-sans text-on-background">
      {/* Header */}
      <header className="bg-white border-b border-outline-variant sticky top-0 z-40 shadow-sm">
        <div className="flex justify-between items-center px-6 md:px-12 h-20 w-full max-w-[1440px] mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/student/dashboard')}
              className="p-2 hover:bg-surface-container rounded-full transition-colors active:scale-95 text-on-surface-variant hover:text-primary"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="font-serif text-2xl font-bold text-primary">His Kingdom Prophets</div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary px-3 py-1 bg-surface-container rounded-full flex items-center gap-1">
              <Mail size={12} /> Email Gallery
            </span>
            <img 
              src={user?.avatar} 
              alt={user?.name} 
              className="w-10 h-10 rounded-full border-2 border-primary-container shadow"
            />
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-6 md:px-12 py-12 flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Template selector & sizing (4 cols) */}
        <div className="w-full lg:w-4/12 flex flex-col gap-6">
          
          {/* Template Card Selector */}
          <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-primary mb-2 flex items-center gap-2">
              <Mail size={18} /> E-postmaler
            </h3>
            <p className="text-xs text-on-surface-variant mb-6">
              Velg en varslingsmal for å forhåndsvise den responsive HTML-layouten.
            </p>

            <div className="space-y-3">
              {[
                { id: 'enroll', title: 'Bekreftelse: Studieplass bekreftet', desc: 'Sendes automatisk når disippel melder seg på et studiespor.', icon: Sparkles },
                { id: 'progress', title: 'Ukentlig åndelig rapport', desc: 'Personlig framdriftsoversending basert på leksjoner.', icon: Award },
                { id: 'zoom', title: 'Kommende live bønneseminar', desc: 'Varsling med direktelenke til live bønnesamling.', icon: Calendar },
                { id: 'alert', title: 'Pastoral oppfølging / Støtte', desc: 'Manuelt sendt oppmuntring og støttemelding fra din mentor.', icon: ShieldAlert }
              ].map(tmp => {
                const isActive = selectedTemplate === tmp.id;
                const Icon = tmp.icon;
                return (
                  <button
                    key={tmp.id}
                    onClick={() => setSelectedTemplate(tmp.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 active:scale-[0.99] group ${
                      isActive 
                        ? 'bg-primary border-primary text-white shadow-sm' 
                        : 'bg-white border-outline-variant hover:border-primary-container/40 hover:bg-surface-container-low text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    <div className="flex gap-3 items-start">
                      <div className={`p-1.5 rounded ${isActive ? 'bg-primary-container text-white' : 'bg-surface-container text-primary'}`}>
                        <Icon size={14} />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-serif text-sm font-bold leading-tight">{tmp.title}</h4>
                        <p className={`text-[10px] ${isActive ? 'text-on-primary-container/85' : 'text-outline'}`}>
                          {tmp.desc}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Viewport Sizer Card */}
          <div className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-outline">Simuler enhet</h4>
            
            <div className="flex bg-surface-container p-1 rounded-lg border border-outline-variant">
              <button
                onClick={() => setPreviewSize('desktop')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-1.5 transition-all ${
                  previewSize === 'desktop' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <Laptop size={14} /> Desktop (600px)
              </button>
              <button
                onClick={() => setPreviewSize('mobile')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-1.5 transition-all ${
                  previewSize === 'mobile' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <Smartphone size={14} /> Mobil (390px)
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Responsive Simulated Email Frame (8 cols) */}
        <div className="w-full lg:w-8/12 flex justify-center">
          <div 
            className={`bg-white border border-outline-variant rounded-xl shadow-lg transition-all duration-300 w-full overflow-hidden flex flex-col`}
            style={{ maxWidth: previewSize === 'desktop' ? '640px' : '410px' }}
          >
            {/* Mock Mail App Header */}
            <div className="p-4 bg-surface-container-low border-b border-outline-variant flex items-center gap-3 text-xs text-on-surface-variant">
              <div className="w-3.5 h-3.5 bg-red-400 rounded-full" />
              <div className="w-3.5 h-3.5 bg-yellow-400 rounded-full" />
              <div className="w-3.5 h-3.5 bg-green-400 rounded-full" />
              
              <div className="bg-white border border-outline-variant rounded px-3 py-1 flex-grow font-mono text-[10px] text-center truncate">
                {selectedTemplate === 'enroll' && 'Subject: Velkommen til His Kingdom Prophets – Studieplass bekreftet'}
                {selectedTemplate === 'progress' && 'Subject: Din ukentlige åndelige fremdriftsrapport'}
                {selectedTemplate === 'zoom' && 'Subject: Invitasjon til live bønneseminar og samling'}
                {selectedTemplate === 'alert' && `Subject: Pastoral hilsen fra Apostel David Hansen`}
              </div>
            </div>

            {/* Email Canvas Pane */}
            <div className="p-6 bg-slate-100 flex justify-center overflow-y-auto max-h-[600px]">
              
              {/* HTML Simulated Email Wrapper */}
              <div className="bg-white w-full max-w-[600px] border border-outline-variant shadow-sm rounded flex flex-col">
                
                {/* Brand Banner */}
                <div className="bg-[#00324b] text-white p-8 text-center border-b-4 border-[#c5a059]">
                  <h1 className="font-serif text-2xl font-bold tracking-wider">His Kingdom Prophets</h1>
                  <p className="text-[10px] tracking-widest uppercase font-semibold text-slate-300 mt-1">
                    Profetisk Utrustning & Dyp Bibelundervisning
                  </p>
                </div>

                {/* Email Body */}
                <div className="p-8 space-y-6 text-sm text-slate-700 leading-relaxed font-sans">
                  
                  {/* Active HTML content based on state */}
                  {selectedTemplate === 'enroll' && (
                    <>
                       <h2 className="font-serif text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
                        Studieplass bekreftet, {user?.name.split(' ')[0]}!
                      </h2>
                      <p>
                        Vi har gleden av å bekrefte din studieplass hos <strong>His Kingdom Prophets</strong> – skolen for profetisk utrustning for dette semesteret.
                      </p>
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded text-xs space-y-2 text-slate-600">
                        <p><strong>Disippelkonto:</strong> {user?.email}</p>
                        <p><strong>Aktive studiespor:</strong> Innføring i den Profetiske Tjeneste (PROP 101), Avansert Hermeneutikk (BIBLE 301)</p>
                      </div>
                      <p>
                        Ditt personlige dashboard er konfigurert med dine åndelige gaver og interesser. Du har nå full tilgang til leksjonsbiblioteket, bønne-chatten og bibelkalkulatoren.
                      </p>
                      
                      <button className="bg-[#00324b] hover:bg-[#1b4965] text-white font-bold py-3 px-6 rounded text-xs uppercase tracking-wider text-center block w-full transition-all">
                        ÅPNE MITT DASHBOARD
                      </button>
                    </>
                  )}

                  {selectedTemplate === 'progress' && (
                    <>
                      <h2 className="font-serif text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 flex justify-between items-center">
                        <span>Ukentlig fremgang</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">75% fullført</span>
                      </h2>
                      <p>
                        Her er din ukentlige oppdatering av din faglige aktivitet på plattformen. Du gjør fremragende fremskritt!
                      </p>
                      
                      {/* Interactive Progress Indicators */}
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-600">Innføring i den Profetiske Tjeneste (PROP 101)</span>
                            <span className="text-slate-900">25% (2 av 8 moduler)</span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#00324b] w-[25%]" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-600">Avansert Hermeneutikk og Tolkning (BIBLE 301)</span>
                            <span className="text-slate-900">75% (6 av 8 moduler)</span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#00324b] w-[75%]" />
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 italic">
                        Neste anbefalte leksjon er "Modul 7: Johannes Åpenbaring og eskatologiske typologier" i bibelstudiet.
                      </p>

                      <button className="bg-[#00324b] hover:bg-[#1b4965] text-white font-bold py-3 px-6 rounded text-xs uppercase tracking-wider text-center block w-full transition-all">
                        FORTSETT LÆRINGSLØPET
                      </button>
                    </>
                  )}

                  {selectedTemplate === 'zoom' && (
                    <>
                      <h2 className="font-serif text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
                        Invitasjon: Live bønneseminar om det profetiske
                      </h2>
                      <p>
                        Du er herved invitert til det ukentlige live-bønneseminaret i <strong>Innføring i den Profetiske Tjeneste (PROP 101)</strong> med Apostel David Hansen.
                      </p>
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded text-xs space-y-2 text-slate-600">
                        <p><strong>Tema:</strong> Å høre Guds stemme og tyde profetiske syner</p>
                        <p><strong>Tidspunkt:</strong> I morgen kl. 18:00 - 19:30 (Oslo-tid)</p>
                        <p><strong>Plattform:</strong> Live video-samling på nett</p>
                      </div>
                      <p>
                        Vi anbefaler at du logger inn 5 minutter før for å teste lyd og bilde. Ha notatblokk og leksjonsmaterialet for Modul 3 klart til diskusjonen.
                      </p>

                      <button className="bg-[#c5a059] hover:bg-[#b08b47] text-white font-bold py-3 px-6 rounded text-xs uppercase tracking-wider text-center block w-full transition-all flex items-center justify-center gap-1.5">
                        BLI MED I ZOOM-MØTET <ArrowRight size={14} />
                      </button>
                    </>
                  )}

                  {selectedTemplate === 'alert' && (
                    <>
                      <h2 className="font-serif text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
                        Pastoral hilsen fra Apostel David Hansen
                      </h2>
                      <p>
                        Hei {user?.name.split(' ')[0]},
                      </p>
                      <div className="bg-slate-50 border-l-4 border-[#00324b] p-4 rounded-r text-xs italic text-slate-600 leading-relaxed font-serif">
                        "Jeg legger merke til at du har hatt en litt roligere periode i Innføring i den Profetiske Tjeneste i det siste. Jeg vil gjerne forsikre meg om at alt går bra med din åndelige vandring og studiene. Si gjerne ifra om det er områder av utrustningen du opplever utfordrende, eller om du ønsker bønneoppfølging."
                      </div>
                      <p>
                        Du kan svare på denne oppfølgingen direkte ved å logge inn på plattformen og sende en melding i studiechatten eller ta kontakt på neste seminar.
                      </p>

                      <button className="bg-[#00324b] hover:bg-[#1b4965] text-white font-bold py-3 px-6 rounded text-xs uppercase tracking-wider text-center block w-full transition-all">
                        ÅPNE STUDIECHAT
                      </button>
                    </>
                  )}

                  <p className="text-[11px] text-slate-500 text-center border-t border-slate-200 pt-6">
                    Trenger du hjelp? Kontakt <a className="text-[#00324b] underline" href="#help">support@hiskingdomprophets.com</a> eller logg inn på plattformen.
                  </p>
                </div>

                {/* Email Footer */}
                <div className="bg-slate-50 p-6 text-center text-[10px] text-slate-400 border-t border-slate-200">
                  <p>© 2026 His Kingdom Prophets. Alle rettigheter reservert.</p>
                  <p className="mt-1">Levert i samarbeid med Mandal Regnskapskontor Headless CMS og e-postvarslingstjeneste.</p>
                </div>

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
