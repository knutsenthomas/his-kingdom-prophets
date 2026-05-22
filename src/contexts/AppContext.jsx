import React, { createContext, useState, useEffect, useContext } from 'react';

// Context API Sikkerhetsnett: Initialiser med tom brakett for å unngå "White screen of death"
export const AppContext = createContext({});

const INITIAL_COURSES = [
  {
    id: "ped101",
    title: "Innføring i Pedagogikk",
    code: "PED 101",
    progress: 25,
    modulesCompleted: 2,
    totalModules: 8,
    instructor: "Dr. Julian Vance",
    zoomLink: "https://zoom.us/j/9270778606",
    modules: [
      { id: "m1", title: "Modul 1: Pedagogisk historie og grunnlag", completed: true },
      { id: "m2", title: "Modul 2: Læringsteorier og kognitiv utvikling", completed: true },
      { id: "m3", title: "Modul 3: Didaktikk og undervisningsmetoder", completed: false },
      { id: "m4", title: "Modul 4: Klasseromsledelse og relasjonsbygging", completed: false },
      { id: "m5", title: "Modul 5: Tilpasset opplæring og spesialpedagogikk", completed: false },
      { id: "m6", title: "Modul 6: Vurdering for læring og eksamen", completed: false },
      { id: "m7", title: "Modul 7: Det flerkulturelle klasserommet", completed: false },
      { id: "m8", title: "Modul 8: Profesjonsetikk og lærerrollen", completed: false }
    ]
  },
  {
    id: "phys301",
    title: "Advanced Theoretical Physics",
    code: "PHYS 301",
    progress: 75,
    modulesCompleted: 6,
    totalModules: 8,
    instructor: "Dr. Alistair Thorne",
    zoomLink: "https://zoom.us/j/9270778607",
    modules: [
      { id: "p1", title: "Modul 1: Classical Mechanics Review", completed: true },
      { id: "p2", title: "Modul 2: Quantum Mechanics Foundations", completed: true },
      { id: "p3", title: "Modul 3: The Schrödinger Equation & Solvable Systems", completed: true },
      { id: "p4", title: "Modul 4: Angular Momentum & Spin", completed: true },
      { id: "p5", title: "Modul 5: Quantum Mechanics in Three Dimensions", completed: true },
      { id: "p6", title: "Modul 6: Identical Particles & Helium Atom", completed: true },
      { id: "p7", title: "Modul 7: Time-Independent Perturbation Theory", completed: false },
      { id: "p8", title: "Modul 8: Relativistic Quantum Mechanics Intro", completed: false }
    ]
  },
  {
    id: "write201",
    title: "Akademisk Skriving",
    code: "WRIT 201",
    progress: 50,
    modulesCompleted: 4,
    totalModules: 8,
    instructor: "Elena Rodriguez",
    zoomLink: "https://zoom.us/j/9270778608",
    modules: [
      { id: "w1", title: "Modul 1: Problemstilling og disposisjon", completed: true },
      { id: "w2", title: "Modul 2: Kildekritikk og litteratursøk", completed: true },
      { id: "w3", title: "Modul 3: Argumentasjon og akademisk sjanger", completed: true },
      { id: "w4", title: "Modul 4: Referansestiler og plagiering", completed: true },
      { id: "w5", title: "Modul 5: Skriveprosessen: fra utkast til manus", completed: false },
      { id: "w6", title: "Modul 6: Revisjon, respons og fagfellevurdering", completed: false },
      { id: "w7", title: "Modul 7: Formidling og vitenskapelig publisering", completed: false },
      { id: "w8", title: "Modul 8: Sluttredigering og innlevering", completed: false }
    ]
  }
];

const INITIAL_STUDENTS = [
  {
    id: "s1",
    name: "Anders Berg",
    courseId: "ped101",
    courseName: "Pedagogikk 101",
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
    courseId: "write201",
    courseName: "Akademisk Skriving",
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
    courseId: "ped101",
    courseName: "Innføring i Pedagogikk",
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
    text: "Hei! Jeg er din HKM Assistent. Hvordan kan jeg hjelpe deg med dine studier eller administrative oppgaver i dag?",
    time: "11:58"
  }
];

export const AppProvider = ({ children }) => {
  // Simulated Authentication Persona State
  const [user, setUser] = useState({
    name: "Thomas Knutsen",
    email: "student@scholastic.com",
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
        email: "student@scholastic.com",
        role: "student",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"
      });
      setIsLoggedIn(true);
      showToast("Byttet til Student-persona!");
    } else if (role === 'teacher') {
      setUser({
        name: "Dr. Julian Vance",
        email: "teacher@scholastic.com",
        role: "teacher",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120"
      });
      setIsLoggedIn(true);
      showToast("Byttet til Lærer-persona!");
    } else if (role === 'admin') {
      setUser({
        name: "Admin Thor",
        email: "admin@scholastic.com",
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120"
      });
      setIsLoggedIn(true);
      showToast("Byttet til Admin-persona!");
    } else {
      setUser(null);
      setIsLoggedIn(false);
      showToast("Logget ut av plattformen!");
    }
  };

  // Login handler
  const login = (email, password) => {
    if (email.includes('teacher')) {
      changePersona('teacher');
    } else if (email.includes('admin')) {
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
    showToast(`Støttemelding sendt til ${studentName}!`);
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
      let replyText = "Det høres spennende ut! Som din akademiske assistent kan jeg hjelpe deg med å strukturere leseplanen din, sette opp varsler for zoom-forelesninger, eller forklare kjernebegreper i pedagogikk eller teoretisk fysikk.";
      
      const lower = text.toLowerCase();
      if (lower.includes("fysikk") || lower.includes("physics") || lower.includes("schr")) {
        replyText = "Fysikkmodulen vår, ledet av Dr. Alistair Thorne, dekker Schrödinger-ligningen i kapittel 3. Ønsker du at jeg skal hente fram leksjonsmaterialet eller sende deg Zoom-lenken til neste live-undervisning?";
      } else if (lower.includes("pedagogikk") || lower.includes("læring")) {
        replyText = "Innføring i Pedagogikk (PED 101) ledes av Dr. Julian Vance. Du har fullført 2 av 8 moduler. Den neste modulen handler om Didaktikk og undervisningsmetoder. Vil du starte leksjonen nå?";
      } else if (lower.includes("skriving") || lower.includes("essay") || lower.includes("oppgave")) {
        replyText = "Akademisk Skriving (WRIT 201) dekker problemstillinger, kildekritikk og argumentasjon. Hvis du jobber med Modul 5 (Skriveprosessen), kan jeg gi deg noen gode disposisjonsmaler.";
      } else if (lower.includes("hjelp") || lower.includes("admin") || lower.includes("kontakt")) {
        replyText = "Dersom du har tekniske problemer eller trenger særskilt oppfølging, kan jeg sette deg i kontakt med Dr. Vance eller administrasjonen. Ønsker du at jeg oppretter en oppfølgingssak?";
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
