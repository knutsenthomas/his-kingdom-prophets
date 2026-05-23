import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { auth, db, storage } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  onSnapshot 
} from 'firebase/firestore';

// Context API Sikkerhetsnett: Initialiser med tom brakett for å unngå "White screen of death"
export const AppContext = createContext({});

const defaultModuleContent = (extra = {}) => ({
  description: '',
  learningGoals: [],
  lessons: [],
  transcript: [],
  studyGuides: [],
  assignments: [],
  assignment: { description: '', dueDate: '', type: 'essay' },
  ...extra,
});

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
      { id: "m1", title: "Modul 1: Profetisk historie og bibelsk grunnlag", completed: true,
        ...defaultModuleContent({ description: 'En grundig gjennomgang av profetiens røtter fra Det gamle testamentet til nytestamentlig praksis. Vi ser på profeter som Elias, Jesaja og Jeremia som forbilder.', learningGoals: ['Forstå profetiens historiske utvikling', 'Identifisere nøkkelprofeter i Bibelen', 'Legge et solid teologisk grunnlag'], lessons: [{ id: 'l1', title: 'Profetene i GT: Oversikt og kontekst', description: 'Fra kallet til Elias til Malakis avslutning.', duration: '45 min', videoUrl: '' }, { id: 'l2', title: 'NT-profetiens karakter og funksjon', description: 'Profetisk tjeneste i den tidlige kirken.', duration: '35 min', videoUrl: '' }], transcript: [{ id: 't1', time: '00:15', text: 'Velkommen til vår første modul om profetiens bibelske røtter og hvordan Herren reiste opp profeter for å kalle sitt folk tilbake til pakten.' }, { id: 't2', time: '08:40', text: 'Når vi leser profetene, må vi se både dom, trøst og gjenopprettelse som deler av Guds kjærlige formaning.' }], studyGuides: [{ id: 'sg1', title: 'Studieguide: Profetisk historie', description: 'Nøkkeltekster, refleksjonsspørsmål og en enkel tidslinje fra Moses til Johannes Døperen.', type: 'PDF', fileUrl: '' }], assignments: [{ id: 'a-prop-m1', title: 'Refleksjonsessay om en GT-profet', description: 'Skriv et 2-siders refleksjonsessay om en GT-profet og trekk paralleller til din egen åndelige reise.', dueDate: '2026-06-15', dueTime: '23:59', type: 'essay', weight: '30% av modulvurdering' }], assignment: { description: 'Skriv et 2-siders refleksjonsessay om en GT-profet og trekk paralleller til din egen åndelige reise.', dueDate: '2026-06-15', type: 'essay' } }) },
      { id: "m2", title: "Modul 2: Å høre Guds stemme og skjelne ånder", completed: true, ...defaultModuleContent({ description: 'Praktiske og åndelige verktøy for å lære å gjenkjenne Guds stemme. Tema inkluderer bønn, stillhet, drømmer og åpenbaringer.', learningGoals: ['Utvikle en sensitiv ånd for Guds ledelse', 'Forstå de ulike måtene Gud taler på', 'Lære å skjelne mellom åndelige kilder'] }) },
      { id: "m3", title: "Modul 3: Åpenbaringsgaver og drømmetydning", completed: false, ...defaultModuleContent() },
      { id: "m4", title: "Modul 4: Profetisk karakter og etiske retningslinjer", completed: false, ...defaultModuleContent() },
      { id: "m5", title: "Modul 5: Betjening og formidling av profetiske budskap", completed: false, ...defaultModuleContent() },
      { id: "m6", title: "Modul 6: Profetisk forbønn og åndelig krigføring", completed: false, ...defaultModuleContent() },
      { id: "m7", title: "Modul 7: Tjenestegavenes samspill i menigheten", completed: false, ...defaultModuleContent() },
      { id: "m8", title: "Modul 8: Prøving og bedømmelse av profeti", completed: false, ...defaultModuleContent() }
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
      { id: "p1", title: "Modul 1: Historisk-grammatisk eksegese", completed: true, ...defaultModuleContent({ description: 'Grundige metoder for bibeltolkning med fokus på den opprinnelige historiske og grammatiske konteksten.', learningGoals: ['Beherske historisk-grammatisk metode', 'Bruke greske og hebraiske verktøy', 'Unngå vanlige tolkningsfeil'] }) },
      { id: "p2", title: "Modul 2: Paktsteologi og Guds frelsesplan", completed: true, ...defaultModuleContent() },
      { id: "p3", title: "Modul 3: Eskatologi og endetidens profetier", completed: true, ...defaultModuleContent() },
      { id: "p4", title: "Modul 4: Typologier og skyggebilder i GT", completed: true, ...defaultModuleContent() },
      { id: "p5", title: "Modul 5: Hebraiske røtter og kulturell kontekst", completed: true, ...defaultModuleContent() },
      { id: "p6", title: "Modul 6: Johannes' åpenbaring og symbolspråk", completed: true, ...defaultModuleContent({ transcript: [{ id: 't-b6-1', time: '00:15', text: 'I vår utforskning av bibelhermeneutikk må vi først innse at skriften må tolkes i lys av seg selv.' }, { id: 't-b6-2', time: '02:45', text: 'Paktsteologien viser Guds overordnede plan, og de profetiske mønstrene blir tydelige når vi analyserer typologi i Det gamle testamente.' }, { id: 't-b6-3', time: '05:12', text: 'Apokalyptisk symbolspråk må leses med respekt for sjanger, historisk kontekst og gammeltestamentlige referanser.' }], studyGuides: [{ id: 'sg-b6-1', title: 'Apokalyptisk symbolspråk', description: 'Forklarer nøkler til symboler, tall, bilder og gammeltestamentlige allusjoner i Johannes åpenbaring.', type: 'PDF', fileUrl: '' }, { id: 'sg-b6-2', title: 'Tidslinje for Åpenbaringen', description: 'Oversikt over hovedstrukturer og ulike tolkningsmodeller brukt i kristen tradisjon.', type: 'Notat', fileUrl: '' }], assignments: [{ id: 'a-b6-1', title: 'Eksegese av Johannes åpenbaring 5', description: 'Foreta en grundig eksegetisk analyse av Johannes åpenbaring kapittel 5. Utled de eskatologiske typologiene og diskuter lammet som åpner seglene.', dueDate: '2026-06-12', dueTime: '12:00', type: 'essay', weight: '40% av totalkarakter' }] }) },
      { id: "p7", title: "Modul 7: Skriftens inspirasjon og autoritet", completed: false, ...defaultModuleContent() },
      { id: "p8", title: "Modul 8: Praktisk anvendelse av bibelsk teologi", completed: false, ...defaultModuleContent() }
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
      { id: "w1", title: "Modul 1: Sjelesorg og indre helbredelse", completed: true, ...defaultModuleContent({ description: 'En innføring i kristen sjelesorg med fokus på helbredelse av dype emosjonelle og åndelige sår.', learningGoals: ['Forstå sjelesorgens teologiske grunnlag', 'Lære praktiske sjelesorgmodeller', 'Identifisere tegn på åndelig og emosjonell skade'] }) },
      { id: "w2", title: "Modul 2: Lederskap etter Guds hjerte", completed: true, ...defaultModuleContent() },
      { id: "w3", title: "Modul 3: Åndelig veiledning og disippelskap", completed: true, ...defaultModuleContent() },
      { id: "w4", title: "Modul 4: Håndtering av åndelig krise og konflikt", completed: true, ...defaultModuleContent() },
      { id: "w5", title: "Modul 5: Menighetens administrasjon og struktur", completed: false, ...defaultModuleContent() },
      { id: "w6", title: "Modul 6: De praktiske nådegaver i menighetslivet", completed: false, ...defaultModuleContent() },
      { id: "w7", title: "Modul 7: Tverrkulturell sjelesorg og misjon", completed: false, ...defaultModuleContent() },
      { id: "w8", title: "Modul 8: Pastoral etikk og integritet", completed: false, ...defaultModuleContent() }
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

const DEFAULT_RUBRIC = [
  { criterion: 'Bibelforståelse & faglig presisjon', points: 40 },
  { criterion: 'Refleksjon og anvendelse', points: 40 },
  { criterion: 'Struktur og formidling', points: 20 }
];

const INITIAL_STANDALONE_ASSIGNMENTS = [
  {
    id: 'ass-1',
    title: 'Det profetiske embete i GT vs NT',
    courseCode: 'PROP 101',
    courseName: 'Innføring i den Profetiske Tjeneste',
    dueDate: '2026-06-05',
    dueTime: '23:59',
    status: 'pending',
    description: 'Skriv et essay på 1500-2000 ord der du drøfter didaktiske og åndelige forskjeller mellom det gammeltestamentlige og det nytestamentlige profetembetet. Gi konkrete bibelske eksempler og diskuter hvordan profetens rolle endrer seg etter pinseedagen.',
    weight: '30% av totalkarakter',
    gradingRubric: [
      { criterion: 'Bibelforståelse & Hermeneutikk', points: 40 },
      { criterion: 'Åndelig refleksjon & karakter', points: 40 },
      { criterion: 'Struktur og formidling', points: 20 }
    ],
    submission: null,
    grade: null,
    feedback: null,
    source: 'standalone'
  },
  {
    id: 'ass-2',
    title: 'Eksegese av Johannes\' åpenbaring',
    courseCode: 'BIBLE 301',
    courseName: 'Avansert Hermeneutikk og Tolkning',
    dueDate: '2026-06-12',
    dueTime: '12:00',
    status: 'pending',
    description: 'Foreta en grundig eksegetisk analyse av Johannes\' åpenbaring kapittel 5. Utled de eskatologiske typologiene og diskuter lammet som åpner seglene. Alle tolkninger og kildehenvisninger må dokumenteres grundig i PDF-format.',
    weight: '40% av totalkarakter',
    gradingRubric: [
      { criterion: 'Hermeneutisk stringens', points: 50 },
      { criterion: 'Teologisk tolkning', points: 30 },
      { criterion: 'Formatering & ryddighet', points: 20 }
    ],
    submission: null,
    grade: null,
    feedback: null,
    source: 'standalone'
  },
  {
    id: 'ass-3',
    title: 'Sjelesorgstudie i Kristiansand',
    courseCode: 'MIN 201',
    courseName: 'Sjelesorg og Menighetsledelse',
    dueDate: '2026-05-18',
    dueTime: '23:59',
    status: 'submitted',
    description: 'Velg tre sjelesorgs-modeller eller case-studier innenfor kristen veiledning og foreta en komparativ analyse. Vurder modellsikkerhet, bibelsk forankring og pastoral relevans.',
    weight: '25% av totalkarakter',
    gradingRubric: [
      { criterion: 'Sjelesorgmodeller', points: 30 },
      { criterion: 'Sjelesorgfaglig evaluering', points: 50 },
      { criterion: 'Referering & Etikk', points: 20 }
    ],
    submission: {
      text: 'Dette essayet sammenligner tre sjelesorgsmodeller i en menighetskontekst med fokus på helbredelse av indre sår...',
      fileName: 'sjelesorg_analyse_knutsen.pdf',
      submittedAt: '2026-05-17 19:42'
    },
    grade: null,
    feedback: null,
    source: 'standalone'
  },
  {
    id: 'ass-4',
    title: 'Problemstilling & Etablering av bønnesenter',
    courseCode: 'MIN 201',
    courseName: 'Sjelesorg og Menighetsledelse',
    dueDate: '2026-04-20',
    dueTime: '23:59',
    status: 'graded',
    description: 'Utarbeid en strukturert prosjektskisse for etablering av et bønne- og sjelesorgs-senter i Kristiansand, inkludert åndelig rammeverk og praktisk menighetsledelse.',
    weight: '15% av totalkarakter',
    gradingRubric: [
      { criterion: 'Skissens teologiske dybde', points: 40 },
      { criterion: 'Faglig & pastoral relevans', points: 35 },
      { criterion: 'Formidlingspresisjon', points: 25 }
    ],
    submission: {
      text: 'Jeg ønsker å utarbeide en skisse for et bønnesenter i Kristiansand menighet med fokus på kontinuerlig forbønn, opplæring i nådegaver, og sjelesorg...',
      fileName: 'prosjektskisse_bønnesenter_v1.pdf',
      submittedAt: '2026-04-18 11:15'
    },
    grade: 'A',
    feedback: 'En fremragende prosjektskisse med et solid teologisk fundament. Veldig godt spisset, og du viser stor åndelig og praktisk modenhet i din tilnærming. Fortsett det utmerkede arbeidet!',
    score: '96/100',
    source: 'standalone'
  }
];

const buildModuleAssignments = (courses) => courses.flatMap(course =>
  course.modules.flatMap(mod => {
    const moduleAssignments = mod.assignments?.length
      ? mod.assignments
      : mod.assignment?.description
        ? [{ id: `${mod.id}-assignment`, title: mod.title, ...mod.assignment }]
        : [];

    return moduleAssignments.map(assignment => ({
      id: `classroom-${course.id}-${mod.id}-${assignment.id}`,
      title: assignment.title || mod.title,
      courseCode: course.code,
      courseName: course.title,
      moduleId: mod.id,
      moduleTitle: mod.title,
      dueDate: assignment.dueDate || '2026-06-20',
      dueTime: assignment.dueTime || '23:59',
      status: 'pending',
      description: assignment.description || '',
      weight: assignment.weight || 'Modulvurdering',
      gradingRubric: assignment.gradingRubric || DEFAULT_RUBRIC,
      submission: null,
      grade: null,
      feedback: null,
      source: 'module'
    }));
  })
);

const mergeAssignmentActivity = (assignment, activity) => ({
  ...assignment,
  ...(activity || {}),
  submission: activity?.submission ?? assignment.submission,
  grade: activity?.grade ?? assignment.grade,
  feedback: activity?.feedback ?? assignment.feedback,
  score: activity?.score ?? assignment.score,
  status: activity?.status ?? assignment.status
});

// Personnel who can receive module approval requests
export const SYSTEM_REVIEWERS = [
  {
    id: 'rev-1',
    name: 'Apostel David Hansen',
    role: 'Faglig leder – Profetisk linje',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'rev-2',
    name: 'Profet Jon Arild',
    role: 'Faglærer – Bibeltolkning',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'rev-3',
    name: 'Pastor Siri Knutsen',
    role: 'Administrasjon & Sjelesorg',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'rev-4',
    name: 'Thomas Knutsen',
    role: 'Innholdsansvarlig & Koordinator',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
  }
];

export const AppProvider = ({ children }) => {
  // Simulated Authentication Persona State
  const [user, setUser] = useState({
    name: "Thomas Knutsen",
    email: "student@hiskingdomprophets.com",
    role: "student",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
    phone: "+47 900 00 000",
    location: "Kristiansand, Norge",
    birthYear: "1995",
    bio: "",
    ministry: "",
    socialInstagram: "",
    socialFacebook: ""
  });
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // General App State
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [assistantMessages, setAssistantMessages] = useState(INITIAL_ASSISTANT_MESSAGES);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [moduleApprovals, setModuleApprovals] = useState([]);

  // Centralized Headless CMS Content State
  const [cmsContent, setCmsContent] = useState(() => {
    try {
      const saved = localStorage.getItem('hkm-cms-content');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Klarte ikke hente cms content fra localStorage:', e);
    }
    return {
      'landing-hero-title': 'His Kingdom prophets',
      'landing-hero-tagline': 'Profetisk Tjeneste og Åndelig Dybde',
      'landing-hero-description': 'En åpenbaringsskole for profetisk utrustning, bibelundervisning og åndelig vekst, hvor solid bibelsk teologi møter den levende Ånd.',
      'landing-hero-cta-primary': 'Begynn Din Reise',
      'landing-hero-cta-secondary': 'Se Introduksjon',
      'landing-pillars-title': 'Tre Søyler for Tjenesteutrustning',
      'landing-pillars-desc': 'Vårt fundament forener grundig bibelsk lære med den profetiske gaverollen i Guds rike.',
      'landing-pillar1-title': 'Profetisk Utrustning og Tjeneste',
      'landing-pillar1-desc': 'Lær å høre Guds stemme, tyde syner og drømmer, og formidle åpenbaringskunnskap med sunne bibelske rammer og etisk modenhet.',
      'landing-pillar2-title': 'Dyp Bibelundervisning',
      'landing-pillar2-desc': 'Gå i dybden på paktsteologi, eskatologi og hermeneutiske verktøy som ruster deg til å dele sannhetens ord rett.',
      'landing-pillar3-title': 'Personlig Åndelig Veiledning',
      'landing-pillar3-desc': 'Personlig oppfølging og disippelskap for din tjeneste. Vi hjelper deg å vokse i karakter og finne ditt spesifikke kall.',
      'landing-network-title': 'Globale Profetiske Nettverk',
      'landing-network-desc': 'Koble deg til bønnenettverk, misjonsreiser og tjenester over hele verden for å utvide ditt åndelige perspektiv.',
      
      'login-title': 'His Kingdom Prophets',
      'login-subtitle': 'Logg inn på din åpenbaringsportal',
      'login-instruction': 'Velg din rolle under for rask pålogging, eller skriv inn brukernavn og passord for å gå til dine studier.',
      
      'student-welcome-title': 'Velkommen tilbake til studiene,',
      'student-welcome-subtitle': 'Du gjør fremragende fremgang i den profetiske tjeneste og hermeneutikk denne uken. Dine mentorer har publisert 2 nye studiehefter i biblioteket.',
      'student-active-courses-title': 'Mine aktive kurs',
      'student-live-gatherings-title': 'Live-undervisning & Bønn',
      'student-next-gatherings-title': 'Neste samlinger',
      'student-tasks-title': 'Mine gjøremål & oppgaver',
      'student-stats-title': 'Studie-statistikk',
      'student-quicklinks-title': 'Hurtiglenker og ressurser',
      'student-announcements-title': 'Viktige Kunngjøringer',
      
      'teacher-welcome-title': 'Veiledningssenter & Mentorportal',
      'teacher-welcome-subtitle': 'Oversikt over studentenes åndelige fremdrift, disippelskap og oppfølgingsvarsler.',
      'teacher-academic-year': 'Aktuelt studieår: 2026',
      'teacher-kpi1-label': 'Totalt Registrert',
      'teacher-kpi2-label': 'Faglig Snittfremdrift',
      'teacher-kpi3-label': 'Evalueringssnitt',
      'teacher-kpi4-label': 'Studenter under oppfølging',
      'teacher-actions-title': 'Administrative tjenester',
      
      'admin-cms-welcome': 'Velkommen til His Kingdom Prophets sitt administrative portal. Tjen Herren med integritet.',
      'admin-cms-title': 'Plattforminnhold (Assets)',
      'admin-cms-subtitle': 'Velg et statisk tekstfelt eller systemkonfigurasjon for å gjøre endringer direkte i databasen.',

      'welcome-ready-title': 'Alt er klart, {name}!',
      'welcome-ready-subtitle': 'Din profil er nå ferdig konfigurert. Du er registrert som student ved vår profetiske bibelskole og utrustningssenter.',
      'welcome-card1-title': 'Utforsk studieplanen',
      'welcome-card1-desc': 'Få tilgang til dine kurs i profetisk tjeneste, bibelundervisning og menighetsledelse.',
      'welcome-card2-title': 'Bli med i bønnefellesskap',
      'welcome-card2-desc': 'Koble deg på studiegrupper, del profetiske åpenbaringer og chat med dine medstudenter.',
      'welcome-cta-btn': 'GÅ TIL MITT DASHBOARD',

      'layout-logo-title': 'His Kingdom Prophets',
      'layout-search-placeholder': 'Søk i plattformen...',
      'layout-upgrade-banner-title': 'Utvid tjenesten',
      'layout-upgrade-banner-desc': 'Få ubegrenset tilgang til alle studieskrifter og veiledning.',
      'layout-upgrade-banner-btn': 'Oppgrader profil'
    };
  });

  const [isAdminEditing, setIsAdminEditing] = useState(false);

  // Firestore Realtime / Seed subscriptions
  useEffect(() => {
    const fetchCmsContent = async () => {
      try {
        const cmsDocRef = doc(db, "cms_configs", "default");
        const cmsSnap = await getDoc(cmsDocRef);
        if (cmsSnap.exists()) {
          setCmsContent(cmsSnap.data());
          localStorage.setItem('hkm-cms-content', JSON.stringify(cmsSnap.data()));
        } else {
          // Document doesn't exist, seed it with the default cmsContent values!
          const initialCms = {
            'landing-hero-title': 'His Kingdom prophets',
            'landing-hero-tagline': 'Profetisk Tjeneste og Åndelig Dybde',
            'landing-hero-description': 'En åpenbaringsskole for profetisk utrustning, bibelundervisning og åndelig vekst, hvor solid bibelsk teologi møter den levende Ånd.',
            'landing-hero-cta-primary': 'Begynn Din Reise',
            'landing-hero-cta-secondary': 'Se Introduksjon',
            'landing-pillars-title': 'Tre Søyler for Tjenesteutrustning',
            'landing-pillars-desc': 'Vårt fundament forener grundig bibelsk lære med den profetiske gaverollen i Guds rike.',
            'landing-pillar1-title': 'Profetisk Utrustning og Tjeneste',
            'landing-pillar1-desc': 'Lær å høre Guds stemme, tyde syner og drømmer, og formidle åpenbaringskunnskap med sunne bibelske rammer og etisk modenhet.',
            'landing-pillar2-title': 'Dyp Bibelundervisning',
            'landing-pillar2-desc': 'Gå i dybden på paktsteologi, eskatologi og hermeneutiske verktøy som ruster deg til å dele sannhetens ord rett.',
            'landing-pillar3-title': 'Personlig Åndelig Veiledning',
            'landing-pillar3-desc': 'Personlig oppfølging og disippelskap for din tjeneste. Vi hjelper deg å vokse i karakter og finne ditt spesifikke kall.',
            'landing-network-title': 'Globale Profetiske Nettverk',
            'landing-network-desc': 'Koble deg til bønnenettverk, misjonsreiser og tjenester over hele verden for å utvide ditt åndelige perspektiv.',
            
            'login-title': 'His Kingdom Prophets',
            'login-subtitle': 'Logg inn på din åpenbaringsportal',
            'login-instruction': 'Velg din rolle under for rask pålogging, eller skriv inn brukernavn og passord for å gå til dine studier.',
            
            'student-welcome-title': 'Velkommen tilbake til studiene,',
            'student-welcome-subtitle': 'Du gjør fremragende fremgang i den profetiske tjeneste og hermeneutikk denne uken. Dine mentorer har publisert 2 nye studiehefter i biblioteket.',
            'student-active-courses-title': 'Mine aktive kurs',
            'student-live-gatherings-title': 'Live-undervisning & Bønn',
            'student-next-gatherings-title': 'Neste samlinger',
            'student-tasks-title': 'Mine gjøremål & oppgaver',
            'student-stats-title': 'Studie-statistikk',
            'student-quicklinks-title': 'Hurtiglenker og ressurser',
            'student-announcements-title': 'Viktige Kunngjøringer',
            
            'teacher-welcome-title': 'Veiledningssenter & Mentorportal',
            'teacher-welcome-subtitle': 'Oversikt over studentenes åndelige fremdrift, disippelskap og oppfølgingsvarsler.',
            'teacher-academic-year': 'Aktuelt studieår: 2026',
            'teacher-kpi1-label': 'Totalt Registrert',
            'teacher-kpi2-label': 'Faglig Snittfremdrift',
            'teacher-kpi3-label': 'Evalueringssnitt',
            'teacher-kpi4-label': 'Studenter under oppfølging',
            'teacher-actions-title': 'Administrative tjenester',
            
            'admin-cms-welcome': 'Velkommen til His Kingdom Prophets sitt administrative portal. Tjen Herren med integritet.',
            'admin-cms-title': 'Plattforminnhold (Assets)',
            'admin-cms-subtitle': 'Velg et statisk tekstfelt eller systemkonfigurasjon for å gjøre endringer direkte i databasen.',
       
            'welcome-ready-title': 'Alt er klart, {name}!',
            'welcome-ready-subtitle': 'Din profil er nå ferdig konfigurert. Du er registrert som student ved vår profetiske bibelskole og utrustningssenter.',
            'welcome-card1-title': 'Utforsk studieplanen',
            'welcome-card1-desc': 'Få tilgang til dine kurs i profetisk tjeneste, bibelundervisning og menighetsledelse.',
            'welcome-card2-title': 'Bli med i bønnefellesskap',
            'welcome-card2-desc': 'Koble deg på studiegrupper, del profetiske åpenbaringer og chat med dine medstudenter.',
            'welcome-cta-btn': 'GÅ TIL MITT DASHBOARD',
       
            'layout-logo-title': 'His Kingdom Prophets',
            'layout-search-placeholder': 'Søk i plattformen...',
            'layout-upgrade-banner-title': 'Utvid tjenesten',
            'layout-upgrade-banner-desc': 'Få ubegrenset tilgang til alle studieskrifter og veiledning.',
            'layout-upgrade-banner-btn': 'Oppgrader profil'
          };
          await setDoc(cmsDocRef, initialCms);
          setCmsContent(initialCms);
          localStorage.setItem('hkm-cms-content', JSON.stringify(initialCms));
        }
      } catch (err) {
        console.warn("Klarte ikke koble til Firestore for CMS-innhold. Bruker localStorage eller fallback:", err);
      }
    };
    fetchCmsContent();
  }, []);

  useEffect(() => {
    // Sync Firebase Auth status and user profile
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            // Automatically upgrade thomas@tk-design.no to superadmin in Firestore if role is different
            if (userData.email?.toLowerCase() === 'thomas@tk-design.no' && userData.role !== 'superadmin') {
              userData.role = 'superadmin';
              userData.name = 'Thomas Knutsen';
              try {
                await setDoc(userDocRef, { role: 'superadmin', name: 'Thomas Knutsen' }, { merge: true });
              } catch (fsErr) {
                console.warn("Firestore role sync blocked by rules, upgraded state locally:", fsErr);
              }
            }
            setUser(userData);
          } else {
            const email = firebaseUser.email;
            let role = 'student';
            let name = email.split('@')[0];
            name = name.charAt(0).toUpperCase() + name.slice(1);
            let avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120";

            if (email === 'thomas@tk-design.no') {
              role = 'superadmin';
              name = 'Thomas Knutsen';
              avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120";
            } else if (email.includes('teacher') || email.includes('david')) {
              role = 'teacher';
              name = 'Apostel David Hansen';
              avatar = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120";
            } else if (email.includes('super') || email.includes('superadmin')) {
              role = 'superadmin';
              name = 'Super Administrator';
              avatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120";
            } else if (email.includes('admin') || email.includes('siri')) {
              role = 'admin';
              name = 'Pastor Siri Knutsen';
              avatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120";
            }

            const defaultProfile = {
              uid: firebaseUser.uid,
              name,
              email,
              role,
              avatar,
              phone: role === 'teacher' ? "+47 900 11 222" : "+47 900 00 000",
              location: "Kristiansand, Norge",
              birthYear: "1995",
              bio: "",
              ministry: "",
              socialInstagram: "",
              socialFacebook: ""
            };
            await setDoc(userDocRef, defaultProfile);
            setUser(defaultProfile);
          }
          setIsLoggedIn(true);
        } catch (err) {
          console.error("Feil ved lasting av brukerprofil fra Firestore:", err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Sync courses from Firestore or seed if empty
    const syncCourses = async () => {
      try {
        const coursesColRef = collection(db, "courses");
        const snapshot = await getDocs(coursesColRef);
        if (snapshot.empty) {
          for (const course of INITIAL_COURSES) {
            await setDoc(doc(db, "courses", course.id), course);
          }
          setCourses(INITIAL_COURSES);
        } else {
          const loadedCourses = snapshot.docs.map(d => d.data());
          setCourses(loadedCourses);
        }
      } catch (err) {
        console.warn("Klarte ikke synkronisere kurs fra Firestore, bruker standard:", err);
      }
    };
    syncCourses();
  }, []);

  useEffect(() => {
    // Sync students from Firestore or seed if empty
    const syncStudents = async () => {
      try {
        const studentsColRef = collection(db, "students");
        const snapshot = await getDocs(studentsColRef);
        if (snapshot.empty) {
          for (const student of INITIAL_STUDENTS) {
            await setDoc(doc(db, "students", student.id), student);
          }
          setStudents(INITIAL_STUDENTS);
        } else {
          const loadedStudents = snapshot.docs.map(d => d.data());
          setStudents(loadedStudents);
        }
      } catch (err) {
        console.warn("Klarte ikke synkronisere studenter fra Firestore, bruker standard:", err);
      }
    };
    syncStudents();
  }, []);

  useEffect(() => {
    // Sync module approvals in realtime
    try {
      const approvalsColRef = collection(db, "module_approvals");
      const unsubscribe = onSnapshot(approvalsColRef, (snapshot) => {
        const approvalsList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setModuleApprovals(approvalsList);
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn("Klarte ikke lytte på godkjenninger i Firestore:", err);
    }
  }, []);

  useEffect(() => {
    // Sync assignment activity
    const syncAssignmentActivity = async () => {
      if (!user?.email) return;
      try {
        const activityDocRef = doc(db, "assignment_activity", user.email.replace(/[^a-zA-Z0-9]/g, "_"));
        const snap = await getDoc(activityDocRef);
        if (snap.exists()) {
          setAssignmentActivity(snap.data());
        }
      } catch (err) {
        console.warn("Klarte ikke synkronisere oppgaveaktivitet fra Firestore:", err);
      }
    };
    syncAssignmentActivity();
  }, [user?.email]);

  const updateCmsContent = async (slug, value) => {
    setCmsContent(prev => {
      const updated = { ...prev, [slug]: value };
      try {
        localStorage.setItem('hkm-cms-content', JSON.stringify(updated));
      } catch (e) {
        console.error('Klarte ikke lagre cms content i localStorage:', e);
      }
      return updated;
    });

    try {
      const cmsDocRef = doc(db, "cms_configs", "default");
      await setDoc(cmsDocRef, { [slug]: value }, { merge: true });
    } catch (err) {
      console.error("Feil ved oppdatering av CMS-innhold i Firestore:", err);
    }
  };

  const [assignmentActivity, setAssignmentActivity] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hkm-assignment-activity') || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('hkm-assignment-activity', JSON.stringify(assignmentActivity));
  }, [assignmentActivity]);

  const assignments = useMemo(() => {
    const moduleAssignments = buildModuleAssignments(courses);
    const combined = [...moduleAssignments, ...INITIAL_STANDALONE_ASSIGNMENTS];
    return combined
      .filter((assignment, index, all) =>
        index === all.findIndex(candidate => candidate.title === assignment.title && candidate.courseCode === assignment.courseCode)
      )
      .map(assignment => mergeAssignmentActivity(assignment, assignmentActivity[assignment.id]));
  }, [courses, assignmentActivity]);

  // Trigger Toast Notification Helper
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Change active user persona (offline mode / local fallback state trigger)
  const changePersona = (role) => {
    if (role === 'student') {
      setUser({
        name: "Thomas Knutsen",
        email: "student@hiskingdomprophets.com",
        role: "student",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
        phone: "+47 900 00 000",
        location: "Kristiansand, Norge",
        birthYear: "1995",
        bio: "",
        ministry: "",
        socialInstagram: "",
        socialFacebook: ""
      });
      setIsLoggedIn(true);
      showToast("Byttet til Student-persona!");
    } else if (role === 'teacher') {
      setUser({
        name: "Apostel David Hansen",
        email: "david@hiskingdomprophets.com",
        role: "teacher",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120",
        title: "Faglig leder og mentor",
        department: "Profetisk linje",
        expertise: "Profetisk tjeneste, åndelig dømmekraft og bibelsk veiledning",
        officeHours: "Tirsdag og torsdag 12:00-15:00",
        zoomLink: "https://zoom.us/j/9270778606",
        location: "Kristiansand, Norge",
        bio: "Veileder studenter i profetisk modenhet, karakterbygging og trygg praktisk betjening."
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
    } else if (role === 'superadmin') {
      setUser({
        name: "Super Administrator",
        email: "superadmin@hiskingdomprophets.com",
        role: "superadmin",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120",
        phone: "+47 900 99 999",
        location: "Kristiansand, Norge",
        birthYear: "1990",
        bio: "Overordnet systemansvarlig for His Kingdom Prophets plattformen."
      });
      setIsLoggedIn(true);
      showToast("Byttet til Super Admin-persona!");
    } else {
      setUser(null);
      setIsLoggedIn(false);
      showToast("Logget ut av plattformen!");
    }
  };

  // Login handler with Firebase Authentication & seed profile setup
  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password || "pass123");
      showToast("Logget inn via Firebase!");
    } catch (err) {
      console.warn("Firebase Auth login failed, checking/creating demo account or offline fallback:", err.message);
      const isDemo = email.includes('student@hiskingdomprophets.com') ||
                      email.includes('david@hiskingdomprophets.com') ||
                      email.includes('siri@hiskingdomprophets.com') ||
                      email.includes('superadmin@hiskingdomprophets.com');
      
      if (isDemo) {
        try {
          await createUserWithEmailAndPassword(auth, email, password || "pass123");
          showToast("Demo-bruker opprettet og logget inn!");
          return;
        } catch (regErr) {
          console.warn("Could not create user (probably already exists), doing offline fallback");
        }
      }

      if (email === 'thomas@tk-design.no') {
        changePersona('superadmin');
      } else if (email.includes('teacher') || email.includes('david')) {
        changePersona('teacher');
      } else if (email.includes('super') || email.includes('superadmin')) {
        changePersona('superadmin');
      } else if (email.includes('admin') || email.includes('siri')) {
        changePersona('admin');
      } else {
        changePersona('student');
      }
    }
  };

  // Sign up with Email/Password & set role
  const registerWithEmail = async (email, password, name, role) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const avatar = role === 'teacher' ? "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120" :
                     role === 'superadmin' ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120" :
                     role === 'admin' ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120" :
                     "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120";

      const defaultProfile = {
        uid: firebaseUser.uid,
        name,
        email,
        role,
        avatar,
        phone: "+47 900 00 000",
        location: "Kristiansand, Norge",
        birthYear: "1995",
        bio: "",
        ministry: "",
        socialInstagram: "",
        socialFacebook: ""
      };
      
      await setDoc(doc(db, "users", firebaseUser.uid), defaultProfile);
      setUser(defaultProfile);
      setIsLoggedIn(true);
      showToast(`Bruker opprettet som ${role}!`);
    } catch (err) {
      console.warn("Firebase registration failed, doing offline fallback:", err.message);
      const avatar = role === 'teacher' ? "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120" :
                     role === 'superadmin' ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120" :
                     role === 'admin' ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120" :
                     "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120";
      
      const localProfile = {
        uid: "local-" + Date.now(),
        name,
        email,
        role,
        avatar,
        phone: "+47 900 00 000",
        location: "Kristiansand, Norge",
        birthYear: "1995"
      };
      setUser(localProfile);
      setIsLoggedIn(true);
      showToast(`Offline fallback: Innlogget som ${role}!`);
    }
  };

  // Login with Google Provider
  const loginWithGoogle = async (role) => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) {
        const email = firebaseUser.email;
        const isThomas = email === 'thomas@tk-design.no';
        const defaultProfile = {
          uid: firebaseUser.uid,
          name: isThomas ? 'Thomas Knutsen' : (firebaseUser.displayName || firebaseUser.email.split('@')[0]),
          email: firebaseUser.email,
          role: isThomas ? 'superadmin' : (role || 'student'),
          avatar: firebaseUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
          phone: "+47 900 00 000",
          location: "Kristiansand, Norge",
          birthYear: "1995"
        };
        await setDoc(userDocRef, defaultProfile);
        setUser(defaultProfile);
      } else {
        const userData = userSnap.data();
        if (userData.email === 'thomas@tk-design.no' && userData.role !== 'superadmin') {
          userData.role = 'superadmin';
          userData.name = 'Thomas Knutsen';
          await setDoc(userDocRef, { role: 'superadmin', name: 'Thomas Knutsen' }, { merge: true });
        }
        setUser(userData);
      }
      setIsLoggedIn(true);
      showToast("Logget inn med Google!");
    } catch (err) {
      console.warn("Google login failed, doing offline fallback:", err.message);
      changePersona(role || 'student');
      showToast("Offline Google pålogging fullført!");
    }
  };

  // Login with Apple Provider
  const loginWithApple = async (role) => {
    try {
      const provider = new OAuthProvider('apple.com');
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) {
        const email = firebaseUser.email;
        const isThomas = email === 'thomas@tk-design.no';
        const defaultProfile = {
          uid: firebaseUser.uid,
          name: isThomas ? 'Thomas Knutsen' : (firebaseUser.displayName || firebaseUser.email.split('@')[0]),
          email: firebaseUser.email,
          role: isThomas ? 'superadmin' : (role || 'student'),
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
          phone: "+47 900 00 000",
          location: "Kristiansand, Norge",
          birthYear: "1995"
        };
        await setDoc(userDocRef, defaultProfile);
        setUser(defaultProfile);
      } else {
        const userData = userSnap.data();
        if (userData.email === 'thomas@tk-design.no' && userData.role !== 'superadmin') {
          userData.role = 'superadmin';
          userData.name = 'Thomas Knutsen';
          await setDoc(userDocRef, { role: 'superadmin', name: 'Thomas Knutsen' }, { merge: true });
        }
        setUser(userData);
      }
      setIsLoggedIn(true);
      showToast("Logget inn med Apple!");
    } catch (err) {
      console.warn("Apple login failed, doing offline fallback:", err.message);
      changePersona(role || 'student');
      showToast("Offline Apple pålogging fullført!");
    }
  };

  // Passwordless magic link login
  const loginPasswordless = async (email, role) => {
    try {
      await signInWithEmailAndPassword(auth, email, "pass123");
      showToast("Løsinnlogging fullført!");
    } catch (err) {
      console.warn("Passwordless login failed or needs registration, fallback active:", err.message);
      if (email === 'thomas@tk-design.no') {
        changePersona('superadmin');
      } else if (email.includes('teacher') || email.includes('david')) {
        changePersona('teacher');
      } else if (email.includes('super') || email.includes('superadmin')) {
        changePersona('superadmin');
      } else if (email.includes('admin') || email.includes('siri')) {
        changePersona('admin');
      } else {
        changePersona(role || 'student');
      }
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Feil under utlogging:", err);
    }
    changePersona('none');
  };

  // Add course module (Course Builder action)
  const addCourseModule = async (courseId, moduleTitle) => {
    let updatedCourse = null;
    setCourses(prevCourses => {
      return prevCourses.map(course => {
        if (course.id === courseId) {
          const newModule = {
            id: `new-${Date.now()}`,
            title: moduleTitle,
            completed: false,
            ...defaultModuleContent()
          };
          updatedCourse = {
            ...course,
            totalModules: course.totalModules + 1,
            modules: [...course.modules, newModule]
          };
          return updatedCourse;
        }
        return course;
      });
    });

    if (updatedCourse) {
      try {
        await setDoc(doc(db, "courses", courseId), updatedCourse);
      } catch (err) {
        console.error("Klarte ikke lagre ny modul til Firestore:", err);
      }
    }
    showToast(`Modulen "${moduleTitle}" ble lagt til i kurset!`);
  };

  // Toggle module completed state
  const toggleModuleCompleted = async (courseId, moduleId) => {
    let updatedCourse = null;
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
          updatedCourse = {
            ...course,
            modulesCompleted: completedCount,
            progress: progressPercent,
            modules: updatedModules
          };
          return updatedCourse;
        }
        return course;
      });
    });

    if (updatedCourse) {
      try {
        await setDoc(doc(db, "courses", courseId), updatedCourse);
      } catch (err) {
        console.error("Klarte ikke lagre fullført-status til Firestore:", err);
      }
    }
  };

  // Update top-level course metadata (title, code, instructor)
  const updateCourse = async (courseId, fields) => {
    let updatedCourse = null;
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        updatedCourse = { ...c, ...fields };
        return updatedCourse;
      }
      return c;
    }));

    if (updatedCourse) {
      try {
        await setDoc(doc(db, "courses", courseId), updatedCourse);
      } catch (err) {
        console.error("Klarte ikke lagre kursendringer til Firestore:", err);
      }
    }
    showToast('Kursinfo ble oppdatert!');
  };

  // Update a single module's title
  const updateModule = async (courseId, moduleId, fields) => {
    let updatedCourse = null;
    setCourses(prev => prev.map(course => {
      if (course.id !== courseId) return course;
      const updatedModules = course.modules.map(m =>
        m.id === moduleId ? { ...m, ...fields } : m
      );
      updatedCourse = { ...course, modules: updatedModules };
      return updatedCourse;
    }));

    if (updatedCourse) {
      try {
        await setDoc(doc(db, "courses", courseId), updatedCourse);
      } catch (err) {
        console.error("Klarte ikke lagre modulendringer til Firestore:", err);
      }
    }
  };

  // Delete a module and recalculate progress
  const deleteModule = async (courseId, moduleId) => {
    let updatedCourse = null;
    setCourses(prev => prev.map(course => {
      if (course.id !== courseId) return course;
      const remaining = course.modules.filter(m => m.id !== moduleId);
      const completedCount = remaining.filter(m => m.completed).length;
      const progressPercent = remaining.length
        ? Math.round((completedCount / remaining.length) * 100)
        : 0;
      updatedCourse = {
        ...course,
        modules: remaining,
        totalModules: remaining.length,
        modulesCompleted: completedCount,
        progress: progressPercent
      };
      return updatedCourse;
    }));

    if (updatedCourse) {
      try {
        await setDoc(doc(db, "courses", courseId), updatedCourse);
      } catch (err) {
        console.error("Klarte ikke slette modul i Firestore:", err);
      }
    }
    showToast('Modulen ble slettet fra studieplanen.');
  };

  // Move a module one step up or down in the list
  const reorderModule = async (courseId, moduleId, direction) => {
    let updatedCourse = null;
    setCourses(prev => prev.map(course => {
      if (course.id !== courseId) return course;
      const mods = [...course.modules];
      const idx = mods.findIndex(m => m.id === moduleId);
      if (idx < 0) return course;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= mods.length) return course;
      [mods[idx], mods[swapIdx]] = [mods[swapIdx], mods[idx]];
      updatedCourse = { ...course, modules: mods };
      return updatedCourse;
    }));

    if (updatedCourse) {
      try {
        await setDoc(doc(db, "courses", courseId), updatedCourse);
      } catch (err) {
        console.error("Klarte ikke lagre rekkefølge i Firestore:", err);
      }
    }
  };

  // Send a module for approval to a reviewer
  const sendModuleForApproval = async (courseId, moduleId, reviewerId, senderNote) => {
    const course = courses.find(c => c.id === courseId);
    const mod = course?.modules.find(m => m.id === moduleId);
    if (!mod || !course) return;

    const approvalDocId = `appr-${courseId}-${moduleId}`;
    const approvalPayload = {
      id: approvalDocId,
      courseId,
      moduleId,
      courseTitle: course.title,
      courseCode: course.code,
      moduleTitle: mod.title,
      reviewerId,
      senderNote: senderNote || '',
      status: 'pending', // pending | approved | rejected
      reviewerNote: '',
      submittedAt: new Date().toLocaleString('no-NO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      reviewedAt: null
    };

    try {
      await setDoc(doc(db, "module_approvals", approvalDocId), approvalPayload);
    } catch (err) {
      console.error("Klarte ikke lagre godkjenning i Firestore:", err);
    }

    // Also set module status to pending on course
    let updatedCourse = null;
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      updatedCourse = {
        ...c,
        modules: c.modules.map(m =>
          m.id === moduleId ? { ...m, approvalStatus: 'pending' } : m
        )
      };
      return updatedCourse;
    }));

    if (updatedCourse) {
      try {
        await setDoc(doc(db, "courses", courseId), updatedCourse);
      } catch (err) {
        console.error("Klarte ikke oppdatere modulstatus i Firestore:", err);
      }
    }

    showToast(`Modulen er sendt til godkjenning!`);
  };

  // Approve or reject a module approval request
  const reviewModuleApproval = async (approvalId, action, reviewerNote) => {
    let approval = moduleApprovals.find(a => a.id === approvalId);
    if (!approval) {
      const parts = approvalId.split('-');
      if (parts.length >= 3) {
        const matching = moduleApprovals.find(a => a.courseId === parts[1] && a.moduleId === parts[2]);
        if (matching) approval = matching;
      }
    }
    
    const payload = {
      status: action, // 'approved' | 'rejected'
      reviewerNote: reviewerNote || '',
      reviewedAt: new Date().toLocaleString('no-NO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    };

    try {
      const docId = approval?.id || approvalId;
      await updateDoc(doc(db, "module_approvals", docId), payload);
    } catch (err) {
      console.error("Klarte ikke oppdatere godkjenning i Firestore:", err);
    }

    if (approval) {
      let updatedCourse = null;
      setCourses(prev => prev.map(c => {
        if (c.id !== approval.courseId) return c;
        updatedCourse = {
          ...c,
          modules: c.modules.map(m =>
            m.id === approval.moduleId
              ? { ...m, approvalStatus: action, completed: action === 'approved' ? true : m.completed }
              : m
          )
        };
        return updatedCourse;
      }));

      if (updatedCourse) {
        try {
          await setDoc(doc(db, "courses", approval.courseId), updatedCourse);
        } catch (err) {
          console.error("Klarte ikke oppdatere kurs i Firestore:", err);
        }
      }
    }

    const label = action === 'approved' ? 'godkjent ✓' : 'avvist ✗';
    showToast(`Modulen ble ${label}.`);
  };

  // Send support email/alert (Teacher action)
  const sendSupportMessage = (studentName, text) => {
    showToast(`Veiledningsmelding sendt til ${studentName}!`);
  };

  const submitAssignment = async (assignmentId, submission) => {
    const newActivity = {
      ...assignmentActivity,
      [assignmentId]: {
        ...(assignmentActivity[assignmentId] || {}),
        status: 'submitted',
        submission,
        grade: null,
        score: null,
        feedback: null
      }
    };
    setAssignmentActivity(newActivity);

    if (user?.email) {
      try {
        const docId = user.email.replace(/[^a-zA-Z0-9]/g, "_");
        await setDoc(doc(db, "assignment_activity", docId), newActivity);
      } catch (err) {
        console.error("Klarte ikke lagre oppgavebesvarelse i Firestore:", err);
      }
    }
    showToast('Oppgave besvart og sendt til vurdering!');
  };

  const gradeAssignment = async (assignmentId, gradeData) => {
    const newActivity = {
      ...assignmentActivity,
      [assignmentId]: {
        ...(assignmentActivity[assignmentId] || {}),
        status: 'graded',
        grade: gradeData.grade,
        score: gradeData.score,
        feedback: gradeData.feedback,
        gradedAt: new Date().toLocaleString('no-NO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
        gradedBy: user?.name || 'Lærer'
      }
    };
    setAssignmentActivity(newActivity);

    if (user?.email) {
      try {
        const docId = user.email.replace(/[^a-zA-Z0-9]/g, "_");
        await setDoc(doc(db, "assignment_activity", docId), newActivity);
      } catch (err) {
        console.error("Klarte ikke lagre oppgavekarakter i Firestore:", err);
      }
    }
    showToast('Vurderingen er lagret og synlig for eleven.');
  };

  // Update user profile fields
  const updateUserProfile = async (fields) => {
    setUser(prev => ({ ...prev, ...fields }));

    if (auth.currentUser) {
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userDocRef, fields, { merge: true });
      } catch (err) {
        console.error("Feil ved lagring av profil til Firestore:", err);
      }
    }
    showToast('Profilen din er oppdatert!');
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
      setUser,
      role: user?.role || 'student',
      isLoggedIn,
      selectedInterests,
      setSelectedInterests,
      courses,
      setCourses,
      students,
      assignments,
      submitAssignment,
      gradeAssignment,
      assistantMessages,
      isAssistantTyping,
      toastMessage,
      login,
      logout,
      changePersona,
      registerWithEmail,
      loginWithGoogle,
      loginWithApple,
      loginPasswordless,
      updateUserProfile,
      addCourseModule,
      toggleModuleCompleted,
      updateCourse,
      updateModule,
      deleteModule,
      reorderModule,
      moduleApprovals,
      sendModuleForApproval,
      reviewModuleApproval,
      sendSupportMessage,
      sendAssistantMessage,
      showToast,
      cmsContent,
      updateCmsContent,
      isAdminEditing,
      setIsAdminEditing
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
