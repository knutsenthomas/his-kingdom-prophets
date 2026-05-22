import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { 
  GraduationCap, Search, Bell, Power, Compass, BookOpen, CheckSquare, Users, 
  ArrowLeft, Play, Pause, SkipForward, Volume2, MessageSquare, Download, 
  Send, Calendar, Clock, Smile, Award
} from 'lucide-react';
import HkmChatWidget from '@/components/HkmChatWidget';

export default function VideoView() {
  const navigate = useNavigate();
  const { user, logout, showToast } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("15:20");
  const [discussionList, setDiscussionList] = useState([
    {
      id: 1,
      sender: "Profet Jon Arild",
      text: "Flott spørsmål, Thomas. Tolkningen forutsetter at vi forstår den historiske konteksten i Efesos på Johannes' tid. Jeg har lagt til en teologisk studieguide om apokalyptisk symbolspråk under ressursfanen.",
      time: "1 time siden",
      isInstructor: true,
      initials: "JA"
    },
    {
      id: 2,
      sender: "Thomas Knutsen",
      text: "Kan noen avklare tolkningen av de syv lysestakene ved 12:45? @JonArild",
      time: "2 timer siden",
      isInstructor: false,
      initials: "TK"
    },
    {
      id: 3,
      sender: "Sarah J.",
      text: "08:15-merket binder virkelig alt vi diskuterte i modul 2 om endetiden sammen. Fantastisk dybde.",
      time: "5 timer siden",
      isInstructor: false,
      initials: "SJ"
    }
  ]);
  const [newComment, setNewComment] = useState("");

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      sender: user?.name || "Student",
      text: newComment,
      time: "Akkurat nå",
      isInstructor: false,
      initials: user?.name ? user.name.split(' ').map(n => n[0]).join('') : "ST"
    };

    setDiscussionList(prev => [...prev, comment]);
    setNewComment("");
    showToast("Kommentar lagt til i diskusjonen!");
  };

  const handleJumpTime = (time) => {
    setCurrentTime(time);
    setIsPlaying(true);
    showToast(`Hoppet til ${time} i videoen.`);
  };

  const handleLogOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="bg-background min-h-screen flex flex-col font-sans text-on-surface pb-20 md:pb-0">
      {/* Top Navbar */}
      <header className="bg-white border-b border-outline-variant/30 sticky top-0 z-40 shadow-sm">
        <div className="flex justify-between items-center w-full px-4 sm:px-6 md:px-12 max-w-[1440px] mx-auto h-20">
          <div className="font-serif text-lg sm:text-2xl font-bold text-primary flex items-center gap-1.5 sm:gap-2 cursor-pointer truncate mr-2" onClick={() => navigate('/student/dashboard')}>
            <GraduationCap className="text-primary shrink-0" size={24} />
            <span className="truncate">His Kingdom Prophets</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('/student/dashboard')} className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">Dashboard</button>
            <button onClick={() => navigate('/student/library')} className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">Kursbibliotek</button>
            <button onClick={() => navigate('/student/assignments')} className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">Oppgaver</button>
            <button onClick={() => navigate('/student/chat')} className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">Fellesskap</button>
          </nav>

          <div className="flex items-center gap-4 text-primary shrink-0">
            <div className="hidden lg:flex items-center bg-surface-container-low rounded-lg px-4 border border-outline-variant/30 py-2 w-64">
              <Search className="text-on-surface-variant mr-2" size={16} />
              <input className="bg-transparent border-none focus:ring-0 text-xs w-full outline-none" placeholder="Søk i plattformen..." type="text"/>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4 text-primary">
              <button className="relative hover:opacity-80 transition-all p-1 shrink-0">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-burnt-orange rounded-full"></span>
              </button>
              <div className="flex items-center gap-2 sm:gap-2.5 pl-2 border-l border-outline-variant/30 shrink-0">
                <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full object-cover border border-primary/20 shrink-0" />
                <span className="hidden sm:inline text-xs font-semibold text-on-surface">{user?.name}</span>
                <button onClick={handleLogOut} className="hover:text-red-500 transition-colors p-1" title="Logg ut">
                  <Power size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 w-full max-w-[1440px] mx-auto">
        
        {/* Sidebar */}
        <aside className="bg-white border-r border-outline-variant/20 w-72 h-[calc(100vh-80px)] sticky top-20 hidden md:flex flex-col py-8 px-6 justify-between shrink-0">
          <div className="space-y-8">
            <div className="px-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="text-primary" size={20} />
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
            </div>

            <nav className="space-y-1.5">
              <button onClick={() => navigate('/student/dashboard')} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-all rounded-lg font-medium text-left">
                <Compass size={18} />
                <span>Dashboard</span>
              </button>
              <button onClick={() => navigate('/student/library')} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-all rounded-lg font-medium text-left">
                <BookOpen size={18} />
                <span>Mine Kurs</span>
              </button>
              <button onClick={() => navigate('/student/assignments')} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-all rounded-lg font-medium text-left">
                <CheckSquare size={18} />
                <span>Oppgaver</span>
              </button>
              <button onClick={() => navigate('/student/chat')} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-all rounded-lg font-medium text-left">
                <Users size={18} />
                <span>Fellesskap</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Canvas */}
        <main className="flex-grow p-4 sm:p-6 md:p-10 space-y-6 md:space-y-8 overflow-x-hidden">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-outline">
            <span className="hover:underline cursor-pointer" onClick={() => navigate('/student/library')}>Kurs</span>
            <span>/</span>
            <span className="hover:underline cursor-pointer" onClick={() => navigate('/student/lesson', { state: { courseId: 'bible301' } })}>Bibelstudier</span>
            <span>/</span>
            <span className="text-primary font-bold">Modul 6: Johannes' åpenbaring og symbolspråk</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Primary Video player column */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Cinematic Video Player */}
              <div className="relative bg-black rounded-2xl overflow-hidden aspect-video shadow-xl group border border-outline-variant/10">
                {/* Thumbnail / Video Stream Mock */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-slate-900 via-slate-800 to-primary">
                  <div className="text-center text-white/40 font-mono space-y-3 relative z-10 px-4">
                    <p className="text-xs uppercase tracking-widest font-bold">Bibelstudier & Avansert Hermeneutikk</p>
                    <h3 className="font-serif text-lg md:text-xl font-bold text-white/80">Johannes' åpenbaring og eskatologisk symbolspråk</h3>
                    <p className="text-[10px] text-white/60">Foreleser: Profet Jon Arild</p>
                  </div>
                  {/* Glowing background scripture elements */}
                  <div className="absolute inset-0 opacity-10 bg-cover font-serif text-white flex items-center justify-center text-2xl whitespace-pre-wrap select-none p-12">
                    {"Apostlenes gjerninger 2:17\nÅpenbaringen 1:1\n1. Kor 14"}
                  </div>
                </div>

                {/* Video controls overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                  <div className="w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer relative">
                    <div className="absolute h-full w-[35%] bg-primary rounded-full"></div>
                    <div className="absolute left-[35%] -top-1.5 h-4 w-4 bg-primary rounded-full shadow-lg"></div>
                  </div>
                  <div className="flex items-center justify-between text-white text-xs font-bold">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setIsPlaying(!isPlaying)} className="p-1 rounded hover:bg-white/10 transition-colors">
                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                      </button>
                      <button className="p-1 rounded hover:bg-white/10 transition-colors">
                        <SkipForward size={18} />
                      </button>
                      <span className="font-mono">{currentTime} / 45:00</span>
                      <Volume2 size={16} />
                    </div>
                    <button className="p-1 rounded hover:bg-white/10 transition-colors">Fullskjerm</button>
                  </div>
                </div>

                {/* Central Play button */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity z-10">
                  <button onClick={() => setIsPlaying(!isPlaying)} className="h-16 w-16 bg-primary/95 text-white rounded-full flex items-center justify-center backdrop-blur-sm pointer-events-auto shadow-lg">
                    {isPlaying ? <Pause size={28} /> : <Play size={28} className="translate-x-0.5" />}
                  </button>
                </div>
              </div>

              {/* Transcript & tabs card */}
              <div className="bg-white border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex border-b border-slate-100 text-xs font-bold">
                  <button className="px-6 py-4 text-primary border-b-2 border-primary bg-primary/5">TRANSKRIPT & NOTATER</button>
                  <button onClick={() => showToast("Laster ned teologiske studieguider...")} className="px-6 py-4 text-on-surface-variant hover:text-primary transition-colors">STUDIEGUIDER</button>
                  <button onClick={() => navigate('/student/assignments')} className="px-6 py-4 text-on-surface-variant hover:text-primary transition-colors">OPPGAVER</button>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-primary text-lg">Forelesningstranskript</h3>
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-outline flex items-center gap-1 text-xs font-bold" onClick={() => showToast("Nedlasting startet...")}>
                      <Download size={14} />
                      <span>Last ned PDF</span>
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    <div 
                      onClick={() => handleJumpTime("00:15")}
                      className="flex gap-4 p-2 rounded hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded h-fit">00:15</span>
                      <p className="text-sm font-serif font-medium text-on-surface leading-relaxed italic">
                        "I vår utforskning av bibelhermeneutikk må vi først innse det fundamentale postulatet at skriften må tolkes i lys av seg selv. Dette leder oss direkte til det historisk-grammatiske tolkningsprinsippet."
                      </p>
                    </div>

                    <div 
                      onClick={() => handleJumpTime("02:45")}
                      className="flex gap-4 p-2 rounded hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded h-fit">02:45</span>
                      <p className="text-sm font-serif font-medium text-on-surface leading-relaxed">
                        "Betrakt paktsteologien som representerer Guds overordnede plan. Vi utleder de profetiske mønstrene ved å analysere skyggebildene og typologiene i Det Gamle Testamente..."
                      </p>
                    </div>

                    <div 
                      onClick={() => handleJumpTime("05:12")}
                      className="flex gap-4 p-2 rounded hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded h-fit">05:12</span>
                      <p className="text-sm font-serif font-medium text-on-surface leading-relaxed">
                        "Tolkningen fortsetter ved å skille mellom bokstavelig og symbolsk språk i apokalyptisk litteratur. Ved å sammenligne symbolene med gammeltestamentlige referanser, finner vi den dype åpenbaringen..."
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right sidebar column: Discussion & interactions */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Discussion Box */}
              <div className="bg-white border border-outline-variant/30 rounded-2xl flex flex-col h-[480px] shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-1.5 text-primary">
                    <MessageSquare size={16} />
                    <span>Leksjonsdiskusjon</span>
                    <span className="bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">{discussionList.length}</span>
                  </div>
                  <span className="text-outline">Siste først</span>
                </div>

                {/* Comments Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {discussionList.map((disc) => (
                    <div key={disc.id} className="flex gap-2.5 items-start text-xs leading-relaxed">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-mono text-[11px] shrink-0 border border-primary/10">
                        {disc.initials}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-on-surface">{disc.sender}</span>
                          {disc.isInstructor && (
                            <span className="bg-primary text-white text-[8px] font-bold px-1 py-0.5 rounded">LÆRER</span>
                          )}
                          <span className="text-[10px] text-outline">{disc.time}</span>
                        </div>
                        <p className="text-on-surface-variant font-medium">{disc.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input area */}
                <form onSubmit={handlePostComment} className="p-3 border-t border-slate-100 bg-slate-50 block">
                  <div className="relative w-full">
                    <textarea 
                      placeholder="Still et åndelig eller teologisk spørsmål..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={2}
                      className="w-full bg-white border border-outline-variant/30 rounded-xl pl-4 pr-12 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium text-on-surface resize-none"
                    />
                    <button 
                      type="submit"
                      disabled={!newComment.trim()}
                      className="absolute right-2.5 bottom-2.5 p-2 bg-primary text-white rounded-lg hover:bg-primary-container disabled:opacity-40 transition-colors"
                    >
                      <Send size={12} />
                    </button>
                  </div>
                </form>
              </div>

              {/* Upcoming live theological calendar inside Sidebar */}
              <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
                <h3 className="font-serif font-bold text-primary text-base mb-4 flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Kommende seminarer</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex gap-3 items-start hover:bg-slate-50 p-2 rounded">
                    <div className="bg-primary/5 text-primary p-2 rounded font-bold text-center font-mono shrink-0">
                      24. mai
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">Profetisk Utrustning Live</p>
                      <p className="text-[10px] text-outline flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        Torsdag, kl. 10:00
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start hover:bg-slate-50 p-2 rounded">
                    <div className="bg-primary/5 text-primary p-2 rounded font-bold text-center font-mono shrink-0">
                      27. mai
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">Avansert Hermeneutikk Seminar</p>
                      <p className="text-[10px] text-outline flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        Søndag, kl. 14:00
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant/30 z-40 flex justify-around py-3 shadow-lg">
        <button onClick={() => navigate('/student/dashboard')} className="flex flex-col items-center gap-0.5 text-xs text-on-surface-variant hover:text-primary transition-colors">
          <Compass size={18} />
          <span>Dashboard</span>
        </button>
        <button onClick={() => navigate('/student/library')} className="flex flex-col items-center gap-0.5 text-xs text-primary font-bold">
          <BookOpen size={18} />
          <span>Kurs</span>
        </button>
        <button onClick={() => navigate('/student/assignments')} className="flex flex-col items-center gap-0.5 text-xs text-on-surface-variant hover:text-primary transition-colors">
          <CheckSquare size={18} />
          <span>Oppgaver</span>
        </button>
        <button onClick={() => navigate('/student/chat')} className="flex flex-col items-center gap-0.5 text-xs text-on-surface-variant hover:text-primary transition-colors">
          <Users size={18} />
          <span>Fellesskap</span>
        </button>
      </div>

      <HkmChatWidget />
    </div>
  );
}
