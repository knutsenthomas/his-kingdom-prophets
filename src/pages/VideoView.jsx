import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { 
  Play, Pause, SkipForward, Volume2, MessageSquare, Download, 
  Send, Calendar, Clock, FileText, ClipboardList, BookOpen, ExternalLink,
  Maximize, Minimize
} from 'lucide-react';

export default function VideoView() {
  const navigate = useNavigate();
  const { user, showToast, courses } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("15:20");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    
    if (!document.fullscreenElement) {
      const req = playerRef.current.requestFullscreen || playerRef.current.webkitRequestFullscreen || playerRef.current.msRequestFullscreen;
      if (req) {
        req.call(playerRef.current).then(() => {
          setIsFullscreen(true);
        }).catch(err => {
          console.warn("Fullscreen request failed:", err);
        });
      }
    } else {
      const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
      if (exit) {
        exit.call(document).then(() => {
          setIsFullscreen(false);
        });
      }
    }
  };
  const [activeClassroomTab, setActiveClassroomTab] = useState('transcript');
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

  const classroomCourse = courses.find(course => course.id === 'bible301') || courses[0];
  const classroomModule = classroomCourse?.modules.find(mod => mod.id === 'p6') || classroomCourse?.modules[0];
  const transcript = classroomModule?.transcript?.length ? classroomModule.transcript : [
    { id: 'fallback-1', time: '00:15', text: 'I vår utforskning av bibelhermeneutikk må vi først innse at skriften må tolkes i lys av seg selv.' },
    { id: 'fallback-2', time: '02:45', text: 'Betrakt paktsteologien som representerer Guds overordnede plan og de profetiske mønstrene i Det gamle testamente.' },
    { id: 'fallback-3', time: '05:12', text: 'Tolkningen fortsetter ved å skille mellom bokstavelig og symbolsk språk i apokalyptisk litteratur.' },
  ];
  const studyGuides = classroomModule?.studyGuides || [];
  const assignments = classroomModule?.assignments?.length
    ? classroomModule.assignments
    : classroomModule?.assignment?.description
      ? [{ id: `${classroomModule.id}-assignment`, title: 'Moduloppgave', ...classroomModule.assignment }]
      : [];

  const classroomTabs = [
    { id: 'transcript', label: 'Transkript & notater', Icon: FileText, count: transcript.length },
    { id: 'guides', label: 'Studieguider', Icon: BookOpen, count: studyGuides.length },
    { id: 'assignments', label: 'Oppgaver', Icon: ClipboardList, count: assignments.length },
  ];

  return (
    <main className="flex-grow p-4 sm:p-6 md:p-10 space-y-6 md:space-y-8 overflow-x-hidden">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-outline">
        <span className="hover:underline cursor-pointer text-on-surface-variant hover:text-primary" onClick={() => navigate('/student/library')}>Kurs</span>
        <span>/</span>
        <span className="hover:underline cursor-pointer text-on-surface-variant hover:text-primary" onClick={() => navigate('/student/lesson', { state: { courseId: 'bible301' } })}>Bibelstudier</span>
        <span>/</span>
        <span className="text-primary font-bold">{classroomModule?.title || 'Klasserom'}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Primary Video player column */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Cinematic Video Player */}
          <div ref={playerRef} className="relative bg-black rounded-2xl overflow-hidden aspect-video shadow-xl group border border-outline-variant/10">
            {/* Thumbnail / Video Stream Mock */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-slate-950 via-[#240046] to-[#561291]">
              <div className="text-center bg-[#240046]/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md space-y-3.5 relative z-20 mx-4 shadow-2xl animate-fade-in">
                <p className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-[#dec2ef]">{classroomCourse?.title}</p>
                <h3 className="font-serif text-lg sm:text-2.5xl font-extrabold text-white leading-snug tracking-tight">{classroomModule?.title}</h3>
                <p className="text-xs text-white/80 font-semibold">Foreleser: {classroomCourse?.instructor}</p>
              </div>
              {/* Glowing background scripture elements - extremely subtle watermark */}
              <div className="absolute inset-0 opacity-[0.03] font-serif text-white flex items-center justify-center text-3xl md:text-4xl whitespace-pre-wrap select-none p-12 pointer-events-none z-10">
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
                <button 
                  onClick={toggleFullscreen} 
                  className="p-1.5 px-3 rounded bg-white/10 hover:bg-white/20 transition-all flex items-center gap-1.5 active:scale-95 font-sans text-xs text-white"
                >
                  {isFullscreen ? (
                    <>
                      <Minimize size={13} />
                      <span>Normal</span>
                    </>
                  ) : (
                    <>
                      <Maximize size={13} />
                      <span>Fullskjerm</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Central Play button */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity z-10">
              <button onClick={() => setIsPlaying(!isPlaying)} className="h-16 w-16 bg-primary/95 text-white rounded-full flex items-center justify-center backdrop-blur-sm pointer-events-auto shadow-lg">
                {isPlaying ? <Pause size={28} /> : <Play size={28} className="translate-x-0.5" />}
              </button>
            </div>
          </div>

          {/* Classroom resource tabs */}
          <div className="bg-white border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex border-b border-slate-100 text-xs font-bold overflow-x-auto">
              {classroomTabs.map(tab => {
                const Icon = tab.Icon;
                const isActive = activeClassroomTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveClassroomTab(tab.id)}
                    className={`px-5 sm:px-6 py-4 transition-colors flex items-center gap-2 whitespace-nowrap border-b-2 -mb-px ${
                      isActive
                        ? 'text-primary border-primary bg-primary/5'
                        : 'text-on-surface-variant border-transparent hover:text-primary'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label.toUpperCase()}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-primary text-white' : 'bg-slate-100 text-outline'}`}>{tab.count}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {activeClassroomTab === 'transcript' && (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-primary text-lg">Forelesningstranskript</h3>
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-outline flex items-center gap-1 text-xs font-bold" onClick={() => showToast("Nedlasting startet...")}>
                      <Download size={14} />
                      <span>Last ned PDF</span>
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {transcript.map(line => (
                      <div key={line.id} onClick={() => handleJumpTime(line.time || '00:00')} className="flex gap-4 p-2 rounded hover:bg-slate-50 cursor-pointer transition-colors">
                        <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded h-fit">{line.time || '00:00'}</span>
                        <p className="text-sm font-serif font-medium text-on-surface leading-relaxed">"{line.text}"</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeClassroomTab === 'guides' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif font-bold text-primary text-lg">Studieguider</h3>
                    <p className="text-xs text-on-surface-variant font-semibold mt-1">Ressurser lagt til av lærer for denne forelesningen.</p>
                  </div>
                  {studyGuides.length === 0 ? (
                    <div className="py-10 text-center border-2 border-dashed border-outline-variant/20 rounded-xl">
                      <BookOpen size={28} className="mx-auto text-outline-variant mb-2" />
                      <p className="text-xs font-semibold text-on-surface-variant">Ingen studieguider er lagt til ennå.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {studyGuides.map(guide => (
                        <div key={guide.id} className="p-4 border border-outline-variant/30 rounded-xl bg-surface-container-lowest hover:border-primary/40 transition-colors">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-[#8a682d] bg-[#c5a059]/15 px-2 py-0.5 rounded-full">{guide.type || 'Guide'}</span>
                              <h4 className="font-serif text-sm font-bold text-primary mt-2">{guide.title || 'Studieguide'}</h4>
                            </div>
                            <FileText size={18} className="text-primary shrink-0" />
                          </div>
                          <p className="text-xs text-on-surface-variant leading-relaxed mt-2">{guide.description}</p>
                          <button onClick={() => guide.fileUrl ? window.open(guide.fileUrl, '_blank') : showToast('Studieguide åpnet.')} className="mt-4 text-xs font-bold text-primary inline-flex items-center gap-1 hover:underline">
                            Åpne ressurs <ExternalLink size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeClassroomTab === 'assignments' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-serif font-bold text-primary text-lg">Oppgaver</h3>
                      <p className="text-xs text-on-surface-variant font-semibold mt-1">Oppgaver knyttet til denne forelesningen.</p>
                    </div>
                    <button onClick={() => navigate('/student/assignments')} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-container transition-all active:scale-95">
                      Åpne oppgavemeny
                    </button>
                  </div>

                  {assignments.length === 0 ? (
                    <div className="py-10 text-center border-2 border-dashed border-outline-variant/20 rounded-xl">
                      <ClipboardList size={28} className="mx-auto text-outline-variant mb-2" />
                      <p className="text-xs font-semibold text-on-surface-variant">Ingen oppgaver er lagt til denne forelesningen ennå.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {assignments.map(assignment => (
                        <div key={assignment.id} className="p-4 border border-outline-variant/30 rounded-xl bg-surface-container-lowest">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-primary text-white">{assignment.type || 'oppgave'}</span>
                            {assignment.dueDate && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">Frist: {assignment.dueDate} kl {assignment.dueTime || '23:59'}</span>}
                            {assignment.weight && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-primary">{assignment.weight}</span>}
                          </div>
                          <h4 className="font-serif text-base font-bold text-primary">{assignment.title || 'Moduloppgave'}</h4>
                          <p className="text-xs text-on-surface-variant leading-relaxed mt-2">{assignment.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
  );
}
