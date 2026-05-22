import React, { createContext, useState, useEffect, useContext } from 'react';

// Context API Sikkerhetsnett: Initialiser med tom brakett for å unngå "White screen of death"
export const AppContext = createContext({});

const INITIAL_COURSES = [
  {
    id: "prop101",
    title: "Innføring i den Profetiske Tjeneste",
    code: "PROP 101",
    progress: 25,
    modulesCompleted: 2,
    totalModules: 8,
    instructor: "Apostel David Hansen",
    zoomLink: "https://zoom.us/j/9270778606",
    modules: [
      { id: "m1", title: "Modul 1: Profetisk historie og bibelsk grunnlag", completed: true },
      { id: "m2", title: "Modul 2: Å høre Guds stemme og skjelne ånder", completed: true },
      { id: "m3", title: "Modul 3: Åpenbaringsgaver og drømmetydning", completed: false },
      { id: "m4", title: "Modul 4: Profetisk karakter og etiske retningslinjer", completed: false },
      { id: "m5", title: "Modul 5: Betjening og formidling av profetiske budskap", completed: false },
      { id: "m6", title: "Modul 6: Profetisk forbønn og åndelig krigføring", completed: false },
      { id: "m7", title: "Modul 7: Tjenestegavenes samspill i menigheten", completed: false },
      { id: "m8", title: "Modul 8: Prøving og bedømmelse av profeti", completed: false }
    ]
  },
  {
    id: "bible301",
    title: "Avansert Hermeneutikk og Tolkning",
    code: "BIBLE 301",
    progress: 75,
    modulesCompleted: 6,
    totalModules: 8,
    instructor: "Profet Jon Arild",
    zoomLink: "https://zoom.us/j/9270778607",
    modules: [
      { id: "p1", title: "Modul 1: Historisk-grammatisk eksegese", completed: true },
      { id: "p2", title: "Modul 2: Paktsteologi og Guds frelsesplan", completed: true },
      { id: "p3", title: "Modul 3: Eskatologi og endetidens profetier", completed: true },
      { id: "p4", title: "Modul 4: Typologier og skyggebilder i GT", completed: true },
      { id: "p5", title: "Modul 5: Hebraiske røtter og kulturell kontekst", completed: true },
      { id: "p6", title: "Modul 6: Johannes' åpenbaring og symbolspråk", completed: true },
      { id: "p7", title: "Modul 7: Skriftens inspirasjon og autoritet", completed: false },
      { id: "p8", title: "Modul 8: Praktisk anvendelse av bibelsk teologi", completed: false }
    ]
  },
  {
    id: "min201",
    title: "Sjelesorg og Menighetsledelse",
    code: "MIN 201",
    progress: 50,
    modulesCompleted: 4,
    totalModules: 8,
    instructor: "Pastor Siri Knutsen",
    zoomLink: "https://zoom.us/j/9270778608",
    modules: [
      { id: "w1", title: "Modul 1: Sjelesorg og indre helbredelse", completed: true },
      { id: "w2", title: "Modul 2: Lederskap etter Guds hjerte", completed: true },
      { id: "w3", title: "Modul 3: Åndelig veiledning og disippelskap", completed: true },
      { id: "w4", title: "Modul 4: Håndtering av åndelig krise og konflikt", completed: true },
      { id: "w5", title: "Modul 5: Menighetens administrasjon og struktur", completed: false },
      { id: "w6", title: "Modul 6: De praktiske nådegaver i menighetslivet", completed: false },
      { id: "w7", title: "Modul 7: Tverrkulturell sjelesorg og misjon", completed: false },
      { id: "w8", title: "Modul 8: Pastoral etikk og integritet", completed: false }
    ]
  }
];

const INITIAL_STUDENTS = [
  {
    id: "s1",
    name: "Anders Berg",
    courseId: "prop101",
    courseName: "Profetisk Tjeneste 101",
    status: "Kritisk",
    statusColor: "text-error bg-error-container/10",
    progress: 25,
    modulesCompleted: 2,
    totalModules: 8,
    lastActivity: "12 dager siden",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120"
  },
  {
    id: "s2",
    name: "Ingrid Nilsen",
    courseId: "min201",
    courseName: "Sjelesorg & Ledelse",
    status: "Forsinket",
    statusColor: "text-on-secondary-container bg-secondary-container/20",
    progress: 50,
    modulesCompleted: 4,
    totalModules: 8,
    lastActivity: "4 dager siden",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
  },
  {
    id: "s3",
    name: "Marius Holm",
    courseId: "prop101",
    courseName: "Innføring i den Profetiske Tjeneste",
    status: "Forsinket",
    statusColor: "text-on-secondary-container bg-secondary-container/20",
    progress: 12,
    modulesCompleted: 1,
    totalModules: 8,
    lastActivity: "6 dager siden",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
  }
];

const INITIAL_ASSISTANT_MESSAGES = [
  {
    id: "am1",
    sender: "assistant",
    text: "Hei! Jeg er din HKM Assistent. Hvordan kan jeg hjelpe deg med din bibelundervisning, profetiske utrustning eller administrative oppgaver i dag?",
    time: "11:58"
  }
];

export const AppProvider = ({ children }) => {
  // Simulated Authentication Persona State
  const [user, setUser] = useState({
    name: "Thomas Knutsen",
    email: "student@hiskingdomprophets.com",
    role: "student",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"
  });
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // General App State
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [assistantMessages, setAssistantMessages] = useState(INITIAL_ASSISTANT_MESSAGES);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Trigger Toast Notification Helper
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Change active user persona
  const changePersona = (role) => {
    if (role === 'student') {
      setUser({
        name: "Thomas Knutsen",
        email: "student@hiskingdomprophets.com",
        role: "student",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"
      });
      setIsLoggedIn(true);
      showToast("Byttet til Student-persona!");
    } else if (role === 'teacher') {
      setUser({
        name: "Apostel David Hansen",
        email: "david@hiskingdomprophets.com",
        role: "teacher",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120"
      });
      setIsLoggedIn(true);
      showToast("Byttet til Mentor-persona!");
    } else if (role === 'admin') {
      setUser({
        name: "Pastor Siri Knutsen",
        email: "siri@hiskingdomprophets.com",
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
      });
      setIsLoggedIn(true);
      showToast("Byttet til Administrator-persona!");
    } else {
      setUser(null);
      setIsLoggedIn(false);
      showToast("Logget ut av plattformen!");
    }
  };

  // Login handler
  const login = (email, password) => {
    if (email.includes('teacher') || email.includes('david')) {
      changePersona('teacher');
    } else if (email.includes('admin') || email.includes('siri')) {
      changePersona('admin');
    } else {
      changePersona('student');
    }
  };

  // Add course module (Course Builder action)
  const addCourseModule = (courseId, moduleTitle) => {
    setCourses(prevCourses => {
      return prevCourses.map(course => {
        if (course.id === courseId) {
          const newModule = {
            id: `new-${Date.now()}`,
            title: moduleTitle,
            completed: false
          };
          return {
            ...course,
            totalModules: course.totalModules + 1,
            modules: [...course.modules, newModule]
          };
        }
        return course;
      });
    });
    showToast(`Modulen "${moduleTitle}" ble lagt til i kurset!`);
  };

  // Toggle module completed state
  const toggleModuleCompleted = (courseId, moduleId) => {
    setCourses(prevCourses => {
      return prevCourses.map(course => {
        if (course.id === courseId) {
          const updatedModules = course.modules.map(mod => {
            if (mod.id === moduleId) {
              return { ...mod, completed: !mod.completed };
            }
            return mod;
          });
          const completedCount = updatedModules.filter(m => m.completed).length;
          const progressPercent = Math.round((completedCount / updatedModules.length) * 100);
          return {
            ...course,
            modulesCompleted: completedCount,
            progress: progressPercent,
            modules: updatedModules
          };
        }
        return course;
      });
    });
  };

  // Send support email/alert (Teacher action)
  const sendSupportMessage = (studentName, text) => {
    showToast(`Veiledningsmelding sendt til ${studentName}!`);
  };

  // Send message in HKM Assistant widget
  const sendAssistantMessage = (text) => {
    const newMsg = {
      id: `m-${Date.now()}`,
      sender: "user",
      text,
      time: new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })
    };
    setAssistantMessages(prev => [...prev, newMsg]);
    setIsAssistantTyping(true);

    // Auto-respond simulating the HKM Assistent with customized answers based on keyword
    setTimeout(() => {
      let replyText = "Det høres spennende ut! Som din HKM-assistent kan jeg hjelpe deg med å strukturere din profetiske studieplan, sette opp varsler for zoom-forelesninger, eller forklare kjernebegreper i bibeltolking, sjelesorg eller profetisk tjeneste.";
      
      const lower = text.toLowerCase();
      if (lower.includes("profet") || lower.includes("syn") || lower.includes("stemme") || lower.includes("prop")) {
        replyText = "Vår profetiske utrustningslinje ledes av Apostel David Hansen. Du jobber for øyeblikket med PROP 101. Ønsker du at jeg henter fram leksjonsmaterialet om å høre Guds stemme, eller vil du se over de profetiske retningslinjene?";
      } else if (lower.includes("bibel") || lower.includes("hermeneutikk") || lower.includes("skrift") || lower.includes("tolkning")) {
        replyText = "Avansert Hermeneutikk og Tolkning (BIBLE 301) ledes av Profet Jon Arild. Du har god fremgang her! Modulen om eskatologi og endetidens profetier er spesielt populær. Skal jeg åpne leseplanen din?";
      } else if (lower.includes("sjelesorg") || lower.includes("ledelse") || lower.includes("pastor") || lower.includes("min")) {
        replyText = "Sjelesorg og Menighetsledelse (MIN 201) ledes av Pastor Siri Knutsen. Dette kurset gir dyp innsikt i indre helbredelse og åndelig veiledning. Trenger du en disposisjon eller mal for sjelesorgs-oppgaven din?";
      } else if (lower.includes("hjelp") || lower.includes("admin") || lower.includes("kontakt")) {
        replyText = "Dersom du har administrative spørsmål eller trenger spesiell oppfølging, kan jeg sette deg i kontakt med Apostel David Hansen eller Pastor Siri Knutsen. Ønsker du at jeg oppretter en henvendelse?";
      }

      const responseMsg = {
        id: `m-res-${Date.now()}`,
        sender: "assistant",
        text: replyText,
        time: new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })
      };
      setAssistantMessages(prev => [...prev, responseMsg]);
      setIsAssistantTyping(false);
    }, 1200);
  };

  return (
    <AppContext.Provider value={{
      user,
      role: user?.role || 'student',
      isLoggedIn,
      selectedInterests,
      setSelectedInterests,
      courses,
      setCourses,
      students,
      assistantMessages,
      isAssistantTyping,
      toastMessage,
      login,
      logout: () => changePersona('none'),
      changePersona,
      addCourseModule,
      toggleModuleCompleted,
      sendSupportMessage,
      sendAssistantMessage,
      showToast
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
