import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { 
  Hash, Send, Pin, Users, MessageSquare, Smile, Paperclip, 
  ChevronLeft, ChevronRight, User, Bell, Search, ShieldAlert,
  GraduationCap, BookOpen, Volume2, Globe, Heart, Award, FileText, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommunityChatView() {
  const navigate = useNavigate();
  const { user, showToast, courses, language } = useApp();
  
  // Responsive sidebar toggles for mobile view
  const [showSidebar, setShowSidebar] = useState(true);
  const [showDeltakere, setShowDeltakere] = useState(false);

  // Filter courses so students only see what they have paid for
  const studentCourses = courses.filter(course => {
    if (!user || user.role !== 'student') return true;
    
    const paidList = user.paidCourses || user.purchasedCourses || user.enrolledCourses || [];
    if (Array.isArray(paidList) && paidList.includes(course.id)) return true;
    if (user.courseId && user.courseId === course.id) return true;
    
    const hasAnyCourseField = 'paidCourses' in user || 'purchasedCourses' in user || 'enrolledCourses' in user || 'courseId' in user;
    if (!hasAnyCourseField) {
      return course.id === 'prop101'; // Default onboarding course
    }
    
    return false;
  });

  // Selected chat context state
  // Can be a channel object (type: 'channel') or classmate object (type: 'dm')
  const [activeChat, setActiveChat] = useState({
    id: 'general',
    name: 'generelt-fellesskap',
    type: 'channel',
    topic: 'Generell teologisk og profetisk samtale for alle portal-deltakere',
    courseId: null,
    pinned: {
      author: 'Apostel David Hansen (Mentor)',
      text: 'Velkommen til fellesskapet! Husk å holde en oppbyggelig, oppmuntrende og kjærlig tone i alt dere deler her inne.',
      time: '2 dager siden'
    }
  });

  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  
  // Search state inside chat sidebar
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');

  // Emoji picker & attachment popups (placeholders/feedback)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  // Chat refs for scroll locking (Chrome Jitter Fix & Offset Context)
  const chatBodyRef = useRef(null);

  // Classmate / Mentor Directory
  const participants = [
    { id: 'u_ja', name: 'Profet Jon Arild', role: 'Mentor', initials: 'JA', status: 'Aktiv nå', statusColor: 'bg-green-500', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100' },
    { id: 'u_sk', name: 'Pastor Siri Knutsen', role: 'Mentor', initials: 'SK', status: 'Aktiv nå', statusColor: 'bg-green-500', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100' },
    { id: 'u_dh', name: 'Apostel David Hansen', role: 'Mentor', initials: 'DH', status: 'Pålogget', statusColor: 'bg-green-500', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100' },
    { id: 'u_ab', name: 'Anders Berg', role: 'Student', initials: 'AB', status: 'Pålogget', statusColor: 'bg-green-500', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100' },
    { id: 'u_in', name: 'Ingrid Nilsen', role: 'Student', initials: 'IN', status: 'Borte', statusColor: 'bg-amber-400', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100' },
    { id: 'u_sj', name: 'Sarah J.', role: 'Student', initials: 'SJ', status: 'Borte', statusColor: 'bg-amber-400', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100' },
    { id: 'u_mh', name: 'Marius Holm', role: 'Student', initials: 'MH', status: 'Frakoblet', statusColor: 'bg-slate-300', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100' }
  ];

  // Dynamic state store for all message threads
  const [threads, setThreads] = useState({
    // Group Channel threads
    'general': [
      { id: 1, sender: 'Anders Berg', text: 'Hei alle sammen! Håper dere har en velsignet uke. Er det noen som skal på Zoom-samlingen i kveld?', time: '09:12', role: 'Student', initials: 'AB' },
      { id: 2, sender: 'Ingrid Nilsen', text: 'Ja, Anders! Gleder meg veldig. Skal bli spennende å høre mer om paktsteologi og få dele bønnebegjær.', time: '09:24', role: 'Student', initials: 'IN' },
      { id: 3, sender: 'Sarah J.', text: 'Jeg er også med! Fint om vi kan be sammen i gruppen her i forkant av undervisningen.', time: '09:31', role: 'Student', initials: 'SJ' }
    ],
    'prop101': [
      { id: 1, sender: 'Marius Holm', text: 'Hei! Hvordan synes dere modulen om å høre Guds stemme (Modul 2) har vært? Jeg opplevde et veldig sterkt bønnesvar i går under stilletiden min.', time: 'I går 16:15', role: 'Student', initials: 'MH' },
      { id: 2, sender: 'Anders Berg', text: 'Marius, det er så oppmuntrende! Jeg synes spesielt undervisningen om å skjelne mellom egne tanker og Åndens hvisken var utrolig frigjørende.', time: 'I går 17:02', role: 'Student', initials: 'AB' },
      { id: 3, sender: 'Ingrid Nilsen', text: 'Enig! Guds stemme er ofte så mild og rolig, akkurat som Eliashistorien viser oss. Vi må virkelig lære å stille sinnet.', time: 'I går 17:15', role: 'Student', initials: 'IN' }
    ],
    'bible301': [
      { id: 1, sender: 'Sarah J.', text: 'Er det noen som har begynt på eksegese-oppgaven om Johannes\' åpenbaring kapittel 5? Synes det symbolske språket kan være litt utfordrende å strukturere.', time: 'I dag 08:15', role: 'Student', initials: 'SJ' },
      { id: 2, sender: 'Anders Berg', text: 'Ja, Sarah! Jeg har funnet mye hjelp i den nye studieguiden om apokalyptisk symbolspråk. Det å koble symbolene til de gammeltestamentlige allusjonene løser opp veldig mye!', time: 'I dag 08:32', role: 'Student', initials: 'AB' },
      { id: 3, sender: 'Profet Jon Arild', text: 'Veldig godt observert, Anders. Husk at Åpenbaringsboken har over 400 allusjoner til Det gamle testamentet. Å tolke det i lys av de bibelske paktene er den absolutte nøkkelen.', time: 'I dag 08:45', role: 'Mentor', initials: 'JA', isInstructor: true }
    ],
    'min201': [
      { id: 1, sender: 'Ingrid Nilsen', text: 'Modul 1 om indre helbredelse traff meg utrolig dypt. Det er fantastisk å se hvordan pastoral sjelesorg kombinerer bibelsk sannhet med emosjonell gjenopprettelse.', time: 'I går 11:20', role: 'Student', initials: 'IN' },
      { id: 2, sender: 'Anders Berg', text: 'Absolutt Ingrid! Pastor Siri Knutsen formidler dette med en utrolig varme og åndelig klokskap. Det gir utrolig gode verktøy for disippelskap.', time: 'I går 12:05', role: 'Student', initials: 'AB' }
    ],
    
    // DM threads
    'u_ja': [
      { id: 1, sender: 'Profet Jon Arild', text: 'Hei Thomas! Takk for dine reflekterte bidrag i Hermeneutikk-studiegruppen. Hvordan går det med forberedelsene til din egen moduloppgave? Si ifra om du vil sparre.', time: 'I går 14:10', role: 'Mentor', initials: 'JA', isInstructor: true }
    ],
    'u_sk': [
      { id: 1, sender: 'Pastor Siri Knutsen', text: 'Velsignet dag, Thomas! Jeg ber spesielt for studiene dine og din åndelige vekst i dag. Ta gjerne kontakt om du vil samtale rundt sjelesorg-modulene eller har personlige bønnetemaer.', time: 'I går 09:30', role: 'Mentor', initials: 'SK', isInstructor: true }
    ],
    'u_dh': [
      { id: 1, sender: 'Apostel David Hansen', text: 'Hei Thomas! Håper du gjør gode fremskritt. Husk å se forelesningen om de femfoldige tjenestegavene i Modul 7. Det er et viktig grunnlag for din tjenesteutrustning.', time: '2 dager siden', role: 'Mentor', initials: 'DH', isInstructor: true }
    ],
    'u_ab': [
      { id: 1, sender: 'Anders Berg', text: 'Hei Thomas! Har du lyst til å ta en kaffe og studere sammen på tirsdag formiddag? Vi kan se på Modul 3 i Profetisk Tjeneste sammen, tyde drømmer er jo kjempespennende!', time: 'I går 18:40', role: 'Student', initials: 'AB' }
    ],
    'u_in': [
      { id: 1, sender: 'Ingrid Nilsen', text: 'Hei Thomas! Lurte på om du tilfeldigvis hadde noen notater fra mandagens forelesning? Jeg mistet de første ti minuttene på grunn av dårlig nett.', time: 'I går 12:15', role: 'Student', initials: 'IN' }
    ],
    'u_sj': [],
    'u_mh': []
  });

  // Dynamic simulated replies engine based on context
  const simulatedResponses = {
    // Channel-based responses
    'general': [
      { sender: 'Anders Berg', role: 'Student', initials: 'AB', text: 'Det var en utrolig fin og oppbyggelig betraktning! Bønn utgjør virkelig ryggraden i hele studieforløpet vårt.' },
      { sender: 'Ingrid Nilsen', role: 'Student', initials: 'IN', text: 'Så spennende! Jeg tror virkelig Herren kaller oss som fellesskap til en dypere intimitet med Hans ord i denne sesongen.' },
      { sender: 'Sarah J.', role: 'Student', initials: 'SJ', text: 'Takk for oppmuntringen! La oss stå sammen i tro og fortsette å løfte opp hverandre og menigheten i bønn.' }
    ],
    'prop101': [
      { sender: 'Ingrid Nilsen', role: 'Student', initials: 'IN', text: 'Helt enig med deg der! Modul 2 åpner opp så mange praktiske og åndelige hemmeligheter om å gjenkjenne Guds stemme.' },
      { sender: 'Marius Holm', role: 'Student', initials: 'MH', text: 'Takk for at du deler! Drømmetydning i Modul 3 har vært en skikkelig øyeåpner for meg også. Det krever stor skjelneevne.' },
      { sender: 'Apostel David Hansen', role: 'Mentor', initials: 'DH', text: 'Godt reflektert. Husk at den nytestamentlige profetien har som formål å oppbygge, formane og trøste. Hold alltid hjertet rent og test alt mot Skriften.' }
    ],
    'bible301': [
      { sender: 'Anders Berg', role: 'Student', initials: 'AB', text: 'Virkelig et fantastisk poeng! Johannes\' åpenbaring kapittel 5 er et av mine absolutte favorittkapitler i Bibelen.' },
      { sender: 'Sarah J.', role: 'Student', initials: 'SJ', text: 'Det å grave i grunnteksten og studere paktene gir så ufattelig stor uttelling når vi analyserer disse vanskelige versene!' },
      { sender: 'Profet Jon Arild', role: 'Mentor', initials: 'JA', text: 'Utmerket. Husk også å studere tempelsymbolikken i GT. Det gir en helt annen dybde til lammet som står foran tronen.' }
    ],
    'min201': [
      { sender: 'Ingrid Nilsen', role: 'Student', initials: 'IN', text: 'Sjelesorg handler virkelig om å bringe Jesu helbredende kraft inn i knuste hjerter. Det er så privilegert å få studere dette.' },
      { sender: 'Anders Berg', role: 'Student', initials: 'AB', text: 'Ja, Modul 1 om indre helbredelse har betydd enormt mye for min personlige disippelreise. Det er så praktisk lagt opp!' },
      { sender: 'Pastor Siri Knutsen', role: 'Mentor', initials: 'SK', text: 'Velsignede studenter. Sjelesorg krever dyp ydmykhet og aktiv lytting under Den Hellige Ånd. Dere gjør en kjempejobb med modulene.' }
    ],

    // DM personal responses
    'u_ja': {
      sender: 'Profet Jon Arild', role: 'Mentor', initials: 'JA', isInstructor: true,
      text: 'Takk for meldingen, Thomas! Det er en veldig spennende teologisk problemstilling. La oss absolutt ta et dypdykk på neste livesamling på Zoom, eller du kan sende meg et utkast til eksegesen din på epost for tilbakemelding.'
    },
    'u_sk': {
      sender: 'Pastor Siri Knutsen', role: 'Mentor', initials: 'SK', isInstructor: true,
      text: 'Velsignet dag, Thomas! Det gleder mitt pastorale hjerte å høre hvordan du vokser i troen og tilegner deg kunnskapen. Sjelesorg krever stor varsomhet, og du viser en kjempefin karakter. Jeg ber for studiene dine i dag!'
    },
    'u_dh': {
      sender: 'Apostel David Hansen', role: 'Mentor', initials: 'DH', isInstructor: true,
      text: 'Hei Thomas! Fortsett det gode arbeidet. Husk at den profetiske tjenesten må hvile på en stødig, gudfryktig karakter og dyp fortrolighet med Guds skrevne ord. Jeg heier på deg og din tjenesteutrustning.'
    },
    'u_ab': {
      sender: 'Anders Berg', role: 'Student', initials: 'AB',
      text: 'Hei Thomas! Det høres kjempebra ut med kaffe og felles studietid på biblioteket. Skal vi si tirsdag kl. 10:00? Jeg tar med notatboken min og noen spørsmål om drømmetydning-modulen!'
    },
    'u_in': {
      sender: 'Ingrid Nilsen', role: 'Student', initials: 'IN',
      text: 'Å, tusen hjertelig takk, Thomas! Du redder meg virkelig der. Notatene dine er alltid så strukturerte og enkle å følge. Gleder meg til å sparre mer om hermeneutikk-forelesningene!'
    },
    'u_sj': {
      sender: 'Sarah J.', role: 'Student', initials: 'SJ',
      text: 'Hei Thomas! Takk for meldingen din. Ja, jeg vil utrolig gjerne være med på studiegruppen på fredag! Skal vi avtale å møtes på bønnerommet eller på Zoom kl. 18:00?'
    },
    'u_mh': {
      sender: 'Marius Holm', role: 'Student', initials: 'MH',
      text: 'Hei Thomas! Takk for meldingen. Jeg har vært litt offline på grunn av jobb, men skal prøve å logge på fredag kveld for felles bønn. Takk for at du spør!'
    }
  };

  // Autoscroll logic adhering to Chrome Jitter Fix rules
  const scrollToNewMessage = () => {
    if (chatBodyRef.current) {
      setTimeout(() => {
        const messages = chatBodyRef.current.querySelectorAll('.chat-message-item:not(.typing)');
        if (messages.length > 0) {
          const lastMsg = messages[messages.length - 1];
          chatBodyRef.current.scrollTo({
            top: lastMsg.offsetTop - 10,
            behavior: 'smooth'
          });
        } else {
          chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  // Scroll to bottom on initial thread mount or new message
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [activeChat.id]);

  // Handle lesson notes text if redirected from classroom notes
  useEffect(() => {
    const pendingMsg = localStorage.getItem('hkm-pending-chat-message');
    if (pendingMsg) {
      setMessageText(pendingMsg);
      localStorage.removeItem('hkm-pending-chat-message');
      showToast("Ditt leksjonsnotat er lagt inn i tekstfeltet!");
    }
  }, [showToast]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const currentMessageText = messageText;
    const timestamp = new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' });
    const userInitials = user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'TK';

    const newMsg = {
      id: Date.now(),
      sender: user?.name || 'Thomas Knutsen',
      text: currentMessageText,
      time: timestamp,
      role: user?.role === 'teacher' ? 'Mentor' : (user?.role === 'admin' ? 'Admin' : 'Student'),
      initials: userInitials
    };

    // Append to current thread
    setThreads(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMsg]
    }));

    setMessageText('');
    scrollToNewMessage();

    // Trigger AI Simulated response to keep community alive
    const chatId = activeChat.id;
    const chatType = activeChat.type;

    setTimeout(() => {
      // Determine typing actor
      let replierName = '';
      if (chatType === 'dm') {
        replierName = activeChat.name;
      } else {
        // Pick a random participant online that is not the user
        const channelRepliers = simulatedResponses[chatId] || simulatedResponses['general'];
        const randomReplier = channelRepliers[Math.floor(Math.random() * channelRepliers.length)];
        replierName = randomReplier.sender;
      }

      setIsTyping(true);
      setTypingUser(replierName);
      scrollToNewMessage();

      // Final response delivery
      setTimeout(() => {
        let replyMsgObj = {};
        const replyTimestamp = new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' });

        if (chatType === 'dm') {
          const response = simulatedResponses[chatId];
          if (response) {
            replyMsgObj = {
              id: Date.now() + 1,
              sender: response.sender,
              text: response.text,
              time: replyTimestamp,
              role: response.role,
              initials: response.initials,
              isInstructor: response.isInstructor
            };
          }
        } else {
          const responses = simulatedResponses[chatId] || simulatedResponses['general'];
          const picked = responses[Math.floor(Math.random() * responses.length)];
          replyMsgObj = {
            id: Date.now() + 1,
            sender: picked.sender,
            text: picked.text,
            time: replyTimestamp,
            role: picked.role,
            initials: picked.initials,
            isInstructor: picked.role === 'Mentor'
          };
        }

        setThreads(prev => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), replyMsgObj]
        }));

        setIsTyping(false);
        setTypingUser('');
        scrollToNewMessage();
      }, 2000);

    }, 1000);
  };

  const handleSelectChannel = (chId, name, topic, courseId = null, pinned = null) => {
    setActiveChat({
      id: chId,
      name: name,
      type: 'channel',
      topic: topic,
      courseId: courseId,
      pinned: pinned
    });
    // On mobile, close sidebar dynamically on choice to focus on chat screen
    if (window.innerWidth < 1024) {
      setShowSidebar(false);
    }
  };

  const handleSelectDm = (p) => {
    setActiveChat({
      id: p.id,
      name: p.name,
      type: 'dm',
      topic: `${p.role} - Status: ${p.status}`,
      courseId: null,
      pinned: null
    });
    if (window.innerWidth < 1024) {
      setShowSidebar(false);
    }
  };

  // Compile active channel study groups based on paid courses list
  const activeStudyGroups = [
    {
      id: 'general',
      name: 'generelt-fellesskap',
      fallbackName: 'Generelt Fellesskap',
      desc: 'Hovedsamtale for alle',
      topic: 'Generell teologisk og profetisk samtale for alle portal-deltakere',
      pinned: {
        author: 'Apostel David Hansen (Mentor)',
        text: 'Velkommen til fellesskapet! Husk å holde en oppbyggelig, oppmuntrende og kjærlig tone i alt dere deler her inne.',
        time: '2 dager siden'
      }
    }
  ];

  studentCourses.forEach(c => {
    let pinnedText = '';
    let authorName = c.instructor;
    
    if (c.id === 'prop101') {
      pinnedText = 'Husk å se gjennom leksjonsmodulene i Profetisk Tjeneste (PROP 101) før Zoom-samlingen på torsdag kl 10:00.';
    } else if (c.id === 'bible301') {
      pinnedText = 'Johannes åpenbaring krever grundig eksegetisk lesing. Bruk gjerne tabellene for paktsteologi som støtte under arbeidet.';
    } else if (c.id === 'min201') {
      pinnedText = 'Sjelesorg handler om å lytte. Sørg for at dere har gått grundig gjennom disippelskap-verktøyene i modul 3.';
    }

    activeStudyGroups.push({
      id: c.id,
      name: `${c.code.toLowerCase().replace(' ', '')}-studiegruppe`,
      fallbackName: `${c.code} Studiegruppe`,
      desc: c.title,
      topic: `Faglig dialog og bønnefellesskap for kurset ${c.title}`,
      pinned: pinnedText ? {
        author: `${authorName} (Emneansvarlig)`,
        text: pinnedText,
        time: 'I går'
      } : null
    });
  });

  // Filter channels and classmates lists based on search bar queries
  const filteredStudyGroups = activeStudyGroups.filter(g => 
    g.fallbackName.toLowerCase().includes(sidebarSearchQuery.toLowerCase()) ||
    g.desc.toLowerCase().includes(sidebarSearchQuery.toLowerCase())
  );

  const filteredDMs = participants.filter(p => 
    p.name.toLowerCase().includes(sidebarSearchQuery.toLowerCase())
  );

  return (
    <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-10 flex flex-col font-sans">
      
      {/* Dynamic Style tags for isolating layers on PC/Mac Chrome for visual stability */}
      <style dangerouslySetInnerHTML={{__html: `
        .hkm-chat-panel, .hkm-chat-input-field {
          transform: translateZ(0) !important;
          backface-visibility: hidden !important;
        }
        .hkm-chat-body {
          position: relative !important;
          scroll-behavior: smooth;
        }
        .hkm-typing-dots span {
          animation: hkm-bounce 1.4s infinite ease-in-out both;
        }
        @keyframes hkm-bounce {
          0%, 80%, 100% { transform: scale(0.2); opacity: 0.4; }
          40% { transform: scale(1.0); opacity: 1; }
        }
      `}} />

      {/* Header Bar */}
      <div className="flex justify-between items-center bg-white border border-outline-variant/30 rounded-2xl p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/5 text-primary rounded-xl shrink-0">
            <Users size={22} className="animate-pulse" />
          </div>
          <div>
            <h1 className="font-serif text-lg sm:text-2.5xl font-extrabold text-primary leading-tight">
              Studiegrupper & Samtaler
            </h1>
            <p className="text-xs text-on-surface-variant font-semibold mt-0.5 hidden sm:block">
              Fullverdig samhandlingsplattform for bønnefellesskap, felles faggrupper og private direktemeldinger.
            </p>
          </div>
        </div>

        {/* Action controls for layouts toggling */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-2.5 rounded-xl border transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold ${
              showSidebar 
                ? 'bg-primary text-white border-primary shadow-sm' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Vis/skjul kanalliste"
          >
            <MessageSquare size={16} />
            <span className="hidden sm:inline">Navigasjon</span>
          </button>
          
          <button
            onClick={() => setShowDeltakere(!showDeltakere)}
            className={`p-2.5 rounded-xl border transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold ${
              showDeltakere 
                ? 'bg-primary text-white border-primary shadow-sm' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Vis/skjul deltakere"
          >
            <Users size={16} />
            <span className="hidden sm:inline">Deltakere</span>
          </button>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-210px)] min-h-[580px] max-h-[850px] items-stretch">
        
        {/* LEFT COLUMN: Sidebar Navigation */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="col-span-1 lg:col-span-3 h-full flex flex-col shrink-0 overflow-hidden"
            >
              <div className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-sm h-full flex flex-col justify-between overflow-hidden">
                <div className="space-y-5 overflow-hidden flex flex-col h-full">
                  
                  {/* Search in sidebar */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline shrink-0" size={16} />
                    <input
                      type="text"
                      placeholder={language === 'en' ? "Search chat..." : "Søk i samtaler..."}
                      value={sidebarSearchQuery}
                      onChange={(e) => setSidebarSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-xs rounded-xl focus:outline-none placeholder:text-outline font-medium transition-all"
                    />
                  </div>

                  {/* Scrollable list content */}
                  <div className="flex-grow overflow-y-auto space-y-5 pr-1 scrollbar-none">
                    
                    {/* Section 1: Study Groups */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-[#8253b8] uppercase tracking-widest px-2.5 mb-1.5 flex items-center gap-1.5">
                        <GraduationCap size={12} />
                        <span>Studiegrupper & Kurs</span>
                      </p>
                      
                      {filteredStudyGroups.length === 0 ? (
                        <p className="text-[11px] text-outline italic px-3 py-1 font-medium">Ingen grupper funnet</p>
                      ) : (
                        filteredStudyGroups.map((g) => {
                          const isActive = activeChat.id === g.id && activeChat.type === 'channel';
                          return (
                            <button
                              key={g.id}
                              onClick={() => handleSelectChannel(g.id, g.name, g.topic, g.id !== 'general' ? g.id : null, g.pinned)}
                              className={`w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 active:scale-[0.98] ${
                                isActive 
                                  ? 'bg-[#561291] text-white shadow-md ring-1 ring-[#561291]/20 font-bold' 
                                  : 'bg-transparent hover:bg-slate-50 text-slate-700 hover:text-[#561291]'
                              }`}
                            >
                              <Hash size={16} className={isActive ? 'text-white' : 'text-outline'} />
                              <div className="min-w-0">
                                <p className="text-xs font-bold truncate leading-snug">{g.fallbackName}</p>
                                <p className={`text-[10px] truncate font-medium ${isActive ? 'text-purple-200' : 'text-outline'}`}>
                                  {g.desc}
                                </p>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>

                    {/* Section 2: Direct Messages */}
                    <div className="space-y-1.5 pt-2">
                      <p className="text-[10px] font-bold text-[#8253b8] uppercase tracking-widest px-2.5 mb-1.5 flex items-center gap-1.5">
                        <MessageSquare size={12} />
                        <span>Direktemeldinger (DM)</span>
                      </p>

                      {filteredDMs.length === 0 ? (
                        <p className="text-[11px] text-outline italic px-3 py-1 font-medium">Ingen kontakter funnet</p>
                      ) : (
                        filteredDMs.map((p) => {
                          const isActive = activeChat.id === p.id && activeChat.type === 'dm';
                          return (
                            <button
                              key={p.id}
                              onClick={() => handleSelectDm(p)}
                              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-200 active:scale-[0.98] ${
                                isActive 
                                  ? 'bg-[#561291] text-white shadow-md ring-1 ring-[#561291]/20 font-bold' 
                                  : 'bg-transparent hover:bg-slate-50 text-slate-700 hover:text-[#561291]'
                              }`}
                            >
                              <div className="relative shrink-0">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/10">
                                  {p.initials}
                                </div>
                                <span className={`absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${p.statusColor}`} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold truncate leading-snug">{p.name}</p>
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[8px] px-1 py-0.2 rounded font-bold uppercase tracking-wider ${
                                    isActive ? 'bg-white/20 text-white' : 'bg-primary/5 text-primary border border-primary/10'
                                  }`}>
                                    {p.role === 'Mentor' ? 'Mentor' : 'Elev'}
                                  </span>
                                  <span className={`text-[9px] font-semibold truncate ${isActive ? 'text-purple-200' : 'text-outline'}`}>
                                    {p.status}
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>

                  </div>
                </div>

                {/* Sidebar footer showing active profile */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={user?.avatar}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full border border-primary/20 object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">{user?.name}</p>
                      <p className="text-[9px] text-outline font-semibold uppercase tracking-wider">Aktiv profil</p>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white inline-block shadow-sm" />
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MIDDLE COLUMN: Chat Feed Area */}
        <div className={`h-full flex flex-col justify-between overflow-hidden ${
          showSidebar && showDeltakere ? 'lg:col-span-6 col-span-12' :
          showSidebar || showDeltakere ? 'lg:col-span-9 col-span-12' : 'col-span-12'
        }`}>
          <div className="bg-white border border-outline-variant/30 rounded-2xl shadow-sm h-full flex flex-col justify-between overflow-hidden hkm-chat-panel relative">
            
            {/* Header section */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                {/* Back button on mobile to view channels catalog */}
                {!showSidebar && (
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg text-[#561291] transition-colors active:scale-90 shrink-0"
                    title="Vis kanalliste"
                  >
                    <ChevronRight size={20} className="rotate-180" />
                  </button>
                )}
                <div className="min-w-0">
                  <h2 className="font-serif text-sm sm:text-base font-extrabold text-primary flex items-center gap-1.5 leading-snug">
                    {activeChat.type === 'channel' ? (
                      <Hash size={18} className="text-[#8253b8] shrink-0" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block shadow-sm shrink-0" />
                    )} 
                    <span className="truncate">{activeChat.type === 'channel' ? activeChat.name : activeChat.name}</span>
                  </h2>
                  <p className="text-[11px] text-on-surface-variant font-semibold mt-0.5 truncate max-w-[280px] sm:max-w-md">
                    {activeChat.topic}
                  </p>
                </div>
              </div>
            </div>

            {/* Main scrollable body for streaming messages */}
            <div 
              ref={chatBodyRef} 
              className="flex-grow p-5 overflow-y-auto space-y-5 hkm-chat-body bg-slate-50/20"
            >
              
              {/* Optional Pinned Announcement in group chats */}
              {activeChat.pinned && (
                <div className="bg-purple-50/55 border border-[#dec2ef]/40 p-4 rounded-2xl flex items-start gap-3 shadow-inner">
                  <Pin size={16} className="text-[#561291] mt-1 shrink-0" />
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#561291]">Nålfestet beskjed fra {activeChat.pinned.author}</span>
                      <span className="text-[10px] text-outline font-medium">{activeChat.pinned.time}</span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-serif font-medium">
                      "{activeChat.pinned.text}"
                    </p>
                  </div>
                </div>
              )}

              {/* Conversation Stream */}
              <div className="space-y-5">
                {(threads[activeChat.id] || []).length === 0 ? (
                  <div className="text-center py-20 text-outline text-xs font-semibold italic max-w-sm mx-auto space-y-2.5 flex flex-col items-center">
                    <MessageSquare size={36} className="text-[#561291]/20 animate-bounce" />
                    <div>
                      <p>Ingen meldinger i denne samtalen ennå.</p>
                      <p className="text-[10px] mt-0.5">Send en velsignet melding under for å starte bønnegruppen!</p>
                    </div>
                  </div>
                ) : (
                  (threads[activeChat.id] || []).map((msg) => {
                    const isCurrentUser = msg.sender === (user?.name || 'Thomas Knutsen');
                    return (
                      <div key={msg.id} className={`flex gap-3 items-start text-xs leading-relaxed chat-message-item ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                        
                        {/* Avatar */}
                        {!isCurrentUser && (
                          <div className="w-9 h-9 rounded-full bg-[#f3e8ff] text-[#561291] flex items-center justify-center font-extrabold text-[12px] shrink-0 border border-[#dec2ef]/40 shadow-sm font-mono">
                            {msg.initials}
                          </div>
                        )}

                        {/* Content block */}
                        <div className={`space-y-1 max-w-[70%] ${isCurrentUser ? 'text-right' : ''}`}>
                          <div className={`flex items-center gap-2 flex-wrap ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            <span className="font-extrabold text-slate-800">{msg.sender}</span>
                            {msg.isInstructor && (
                              <span className="bg-[#561291] text-white text-[8px] font-bold px-1.5 py-0.5 rounded tracking-wide">MENTOR</span>
                            )}
                            <span className="text-[10px] text-outline font-medium">{msg.time}</span>
                          </div>
                          <div className={`p-3 rounded-2xl text-[12px] font-medium leading-relaxed shadow-sm border ${
                            isCurrentUser 
                              ? 'bg-gradient-to-r from-primary to-[#3c096c] text-white rounded-tr-none text-left border-primary/20' 
                              : 'bg-white text-slate-800 rounded-tl-none border-slate-100'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Animated Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-3 items-start text-xs leading-relaxed chat-message-item typing">
                    <div className="w-9 h-9 rounded-full bg-[#f3e8ff] text-[#561291] flex items-center justify-center font-extrabold text-[12px] shrink-0 border border-[#dec2ef]/40 shadow-sm animate-pulse">
                      ...
                    </div>
                    <div className="space-y-1">
                      <span className="font-extrabold text-slate-800">{typingUser}</span>
                      <div className="p-3 bg-white border border-slate-100 rounded-2xl rounded-tl-none flex items-center gap-2.5 shadow-sm min-w-[100px]">
                        <span className="text-xs text-outline font-semibold italic shrink-0">skriver</span>
                        <div className="hkm-typing-dots flex gap-1 items-center pl-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#561291]" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#561291]" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#561291]" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Input Send Area with display:block to ensure Chrome layout stability */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-slate-50/50 block shrink-0">
              <div className="relative w-full hkm-chat-input-field">
                
                {/* Actions row above input */}
                <div className="flex items-center gap-1.5 mb-2 px-1">
                  <button 
                    type="button" 
                    onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowAttachmentMenu(false); }}
                    className={`p-1.5 rounded-lg text-outline hover:text-primary transition-colors flex items-center justify-center hover:bg-slate-100 ${
                      showEmojiPicker ? 'bg-slate-100 text-primary' : ''
                    }`}
                    title="Legg til emoji"
                  >
                    <Smile size={16} />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setShowAttachmentMenu(!showAttachmentMenu); setShowEmojiPicker(false); }}
                    className={`p-1.5 rounded-lg text-outline hover:text-primary transition-colors flex items-center justify-center hover:bg-slate-100 ${
                      showAttachmentMenu ? 'bg-slate-100 text-primary' : ''
                    }`}
                    title="Legg til vedlegg"
                  >
                    <Paperclip size={16} />
                  </button>
                  
                  {/* Active Popups overlays */}
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-16 left-0 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl z-30 grid grid-cols-6 gap-2 w-56 text-center"
                      >
                        {['🙏', '🙌', '🔥', '👑', '📖', '🕊️', '❤️', '💡', '✝️', '🛡️', '⚔️', '✨'].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              setMessageText(prev => prev + emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-base active:scale-90 transition-all"
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}

                    {showAttachmentMenu && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-16 left-0 bg-white border border-slate-200 rounded-2xl p-3 shadow-xl z-30 flex flex-col gap-1 w-52 text-left"
                      >
                        {[
                          { label: 'Del studiehefte (PDF)', type: 'pdf' },
                          { label: 'Del bibelnotat', type: 'note' },
                          { label: 'Last opp bilde', type: 'image' }
                        ].map((opt) => (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => {
                              showToast(`Vedleggstype "${opt.label}" klar for opplasting.`);
                              setShowAttachmentMenu(false);
                            }}
                            className="w-full px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-[#f3e8ff]/40 hover:text-primary rounded-xl text-left transition-colors"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative">
                  <textarea 
                    placeholder={
                      activeChat.type === 'channel' 
                        ? `Skriv en melding til #${activeChat.name}...` 
                        : `Send en privat direktemelding til ${activeChat.name.split(' ')[0]}...`
                    }
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={2}
                    className="w-full bg-white border border-outline-variant/30 rounded-2xl pl-4 pr-14 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium text-on-surface resize-none shadow-inner hkm-chat-input-field"
                  />
                  <button 
                    type="submit"
                    disabled={!messageText.trim()}
                    className="absolute right-3.5 bottom-3.5 p-2 bg-[#561291] text-white rounded-xl hover:bg-[#3c096c] disabled:opacity-40 transition-colors shadow"
                  >
                    <Send size={14} />
                  </button>
                </div>

              </div>
            </form>

          </div>
        </div>

        {/* RIGHT COLUMN: Deltakere / Detail Info directory */}
        <AnimatePresence>
          {showDeltakere && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="col-span-1 lg:col-span-3 h-full flex flex-col shrink-0 overflow-hidden"
            >
              <div className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-sm h-full flex flex-col justify-between overflow-y-auto">
                <div className="space-y-6">
                  
                  {/* Section Title */}
                  <div>
                    <h3 className="font-serif text-sm font-extrabold text-primary flex items-center gap-2">
                      <Users size={16} />
                      <span>Gruppe-deltakere</span>
                    </h3>
                    <p className="text-[10px] text-outline font-semibold uppercase mt-0.5 tracking-wider">
                      Studiegruppens medlemmer ({participants.length})
                    </p>
                  </div>

                  {/* Active channels summary */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2">
                    <p className="text-[10px] font-extrabold text-[#561291] uppercase tracking-wider">Aktivt emne:</p>
                    <h4 className="text-xs font-extrabold text-slate-800">
                      {activeChat.type === 'channel' ? activeChat.name : `Direkte DM med ${activeChat.name}`}
                    </h4>
                    <p className="text-[10px] text-outline font-semibold leading-relaxed">
                      Lærere og studenter har tilgang til denne studiekanalen for løpende samhandling.
                    </p>
                  </div>

                  {/* Classmate list directory with clickable triggers */}
                  <div className="space-y-3">
                    <p className="text-[10px] text-outline font-bold uppercase tracking-wider">
                      Klikk for å sende direktemelding:
                    </p>
                    <div className="space-y-2.5">
                      {participants.map((p) => {
                        const isOnline = p.status !== 'Frakoblet';
                        return (
                          <button
                            key={p.id}
                            onClick={() => handleSelectDm(p)}
                            className="w-full text-left p-2 border border-slate-100 hover:border-[#561291]/35 hover:bg-[#f3e8ff]/10 rounded-xl transition-all flex gap-3.5 items-center group active:scale-[0.98]"
                          >
                            <div className="relative shrink-0">
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-[11px]">
                                {p.initials}
                              </div>
                              <span className={`absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${p.statusColor}`} />
                            </div>
                            <div className="min-w-0 flex-grow">
                              <div className="flex items-center justify-between gap-1.5">
                                <h4 className="text-xs font-bold text-slate-800 truncate leading-tight group-hover:text-primary transition-colors">
                                  {p.name}
                                </h4>
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[8px] font-bold px-1 rounded uppercase tracking-wider ${
                                  p.role === 'Mentor' ? 'bg-primary/5 text-primary border border-primary/10' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {p.role === 'Mentor' ? 'Lærer' : 'Student'}
                                </span>
                                <span className="text-[9px] text-[#72787e] font-semibold truncate">
                                  {p.status}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </main>
  );
}
