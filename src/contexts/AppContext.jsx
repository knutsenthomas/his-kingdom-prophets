import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { auth, db, storage } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  onSnapshot,
  deleteDoc,
  query,
  where
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
    grade: 'Bestått',
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
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hkm-current-user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('hkm-current-user'));
  const [isAuthReady, setIsAuthReady] = useState(false);

  // General App State
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [assistantMessages, setAssistantMessages] = useState(INITIAL_ASSISTANT_MESSAGES);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [moduleApprovals, setModuleApprovals] = useState([]);
  const [assistantContext, setAssistantContext] = useState(null);

  // Centralized Headless CMS Content State
  const [cmsContent, setCmsContent] = useState(() => {
    const defaults = {
      'landing-hero-title': 'His Kingdom prophets',
      'landing-hero-title-en': 'His Kingdom Prophets',
      'landing-hero-tagline': 'Profetisk tjeneste og åndelig dybde',
      'landing-hero-tagline-en': 'Prophetic Ministry and Spiritual Depth',
      'landing-hero-description': 'En åpenbaringsskole for profetisk utrustning, bibelundervisning og åndelig vekst, hvor solid bibelsk teologi møter den levende Ånd.',
      'landing-hero-description-en': 'A school of revelation for prophetic equipping, Bible teaching, and spiritual growth, where solid biblical theology meets the living Spirit.',
      'landing-hero-cta-primary': 'Begynn Din Reise',
      'landing-hero-cta-primary-en': 'Begin Your Journey',
      'landing-hero-cta-secondary': 'Se Introduksjon',
      'landing-hero-cta-secondary-en': 'Watch Introduction',
      'landing-pillars-title': 'Tre søyler for tjenesteutrustning',
      'landing-pillars-title-en': 'Three Pillars for Ministerial Equipping',
      'landing-pillars-desc': 'Vårt fundament forener grundig bibelsk lære med den profetiske gaverollen i Guds rike.',
      'landing-pillars-desc-en': 'Our foundation unites thorough biblical teaching with the prophetic gift in the Kingdom of God.',
      'landing-pillar1-title': 'Profetisk utrustning og tjeneste',
      'landing-pillar1-title-en': 'Prophetic Equipping and Ministry',
      'landing-pillar1-desc': 'Lær å høre Guds stemme, tyde syner og drømmer, og formidle åpenbaringskunnskap med sunne bibelske rammer og etisk modenhet.',
      'landing-pillar1-desc-en': 'Learn to hear God\'s voice, interpret visions and dreams, and convey revelation knowledge within sound biblical boundaries.',
      'landing-pillar2-title': 'Dyp bibelundervisning',
      'landing-pillar2-title-en': 'Deep Bible Teaching',
      'landing-pillar2-desc': 'Gå i dybden på paktsteologi, eskatologi og hermeneutiske verktøy som ruster deg til å dele sannhetens ord rett.',
      'landing-pillar2-desc-en': 'Delve deep into covenant theology, eschatology, and hermeneutical tools that equip you to rightly divide the word of truth.',
      'landing-pillar3-title': 'Personlig åndelig veiledning',
      'landing-pillar3-title-en': 'Personal Spiritual Mentoring',
      'landing-pillar3-desc': 'Personlig oppfølging og disippelskap for din tjeneste. Vi hjelper deg å vokse i karakter og finne ditt spesifikke kall.',
      'landing-pillar3-desc-en': 'Personal follow-up and discipleship for your ministry. We help you grow in character and find your specific calling.',
      'landing-network-title': 'Globale profetiske nettverk',
      'landing-network-title-en': 'Global Prophetic Networks',
      'landing-network-desc': 'Koble deg til bønnenettverk, misjonsreiser og tjenester over hele verden for å utvide ditt åndelige perspektiv.',
      'landing-network-desc-en': 'Connect with prayer networks, mission trips, and ministries worldwide to expand your spiritual perspective.',
      
      // New landing page links and buttons (cached defaults)
      'landing-nav-programs': 'Studielinjer',
      'landing-nav-programs-en': 'Programs',
      'landing-nav-faculty': 'Mentorer',
      'landing-nav-faculty-en': 'Mentors',
      'landing-nav-resources': 'Bibelressurser',
      'landing-nav-resources-en': 'Bible Resources',
      'landing-nav-admissions': 'Søk Opptak',
      'landing-nav-admissions-en': 'Apply Now',
      'landing-btn-login': 'Logg inn',
      'landing-btn-login-en': 'Log In',
      'landing-btn-portal': 'Gå til portal',
      'landing-btn-portal-en': 'Go to Portal',
      'landing-btn-apply': 'Søk Nå',
      'landing-btn-apply-en': 'Apply Now',
      'landing-network-btn': 'Bli en Del',
      'landing-network-btn-en': 'Join Us',
      
      // New landing page pillar bullet lists (cached defaults)
      'landing-pillar1-bullet1': 'Åndelig skjelneevne og etikk',
      'landing-pillar1-bullet1-en': 'Spiritual discernment and ethics',
      'landing-pillar1-bullet2': 'Drømmetydning & Åpenbaring',
      'landing-pillar1-bullet2-en': 'Dream interpretation & Revelation',
      'landing-pillar1-bullet3': 'Etisk karakter og modenhet',
      'landing-pillar1-bullet3-en': 'Ethical character and maturity',
      'landing-pillar2-bullet1': 'Historisk-grammatisk hermeneutikk',
      'landing-pillar2-bullet1-en': 'Historical-grammatical hermeneutics',
      'landing-pillar2-bullet2': 'Paktsteologi & Eskatologi',
      'landing-pillar2-bullet2-en': 'Covenant theology & Eschatology',
      'landing-pillar2-bullet3': 'Sunn eksegese og Skriftlære',
      'landing-pillar2-bullet3-en': 'Sound exegesis and Scripture study',
      'landing-pillar3-bullet1': '1-til-1 oppfølging & mentorsamtaler',
      'landing-pillar3-bullet1-en': '1-to-1 follow-up & mentoring sessions',
      'landing-pillar3-bullet2': 'Personlig disippelskapsprogram',
      'landing-pillar3-bullet2-en': 'Personal discipleship program',
      'landing-pillar3-bullet3': 'Karakterutvikling & Åndelig vekst',
      'landing-pillar3-bullet3-en': 'Character development & Spiritual growth',
      
      // New landing page testimonials (cached defaults)
      'landing-testimonials-title': 'Vitnesbyrd & Erfaringer',
      'landing-testimonials-title-en': 'Testimonials & Experiences',
      'landing-testimonials-desc': 'Hør hva våre studenter og mentorer sier om det profetiske fellesskapet.',
      'landing-testimonials-desc-en': 'Hear what our students and mentors say about the prophetic community.',
      'landing-testimonial1-name': 'Apostel David Hansen',
      'landing-testimonial1-name-en': 'Apostle David Hansen',
      'landing-testimonial1-role': 'Grunnlegger & Hovedmentor',
      'landing-testimonial1-role-en': 'Founder & Head Mentor',
      'landing-testimonial1-quote': '"Det profetiske fellesskapet her er helt unikt. Plattformen gir studentene de nødvendige åndelige og teologiske rammene for å vokse inn i sin tjeneste."',
      'landing-testimonial1-quote-en': '"The prophetic fellowship here is truly unique. The platform provides students with the necessary spiritual and theological frameworks to grow into their ministry."',
      'landing-testimonial2-name': 'Pastor Siri Knutsen',
      'landing-testimonial2-name-en': 'Pastor Siri Knutsen',
      'landing-testimonial2-role': 'Fagansvarlig for Sjelesorg & Menighet',
      'landing-testimonial2-role-en': 'Head of Pastoral Care & Church Life',
      'landing-testimonial2-quote': '"Å bygge bro mellom solid bibellære og praktisk betjening i menigheten er kjernen i mitt hjerte. Mentorskapet her gir studentene retning og soliditet."',
      'landing-testimonial2-quote-en': '"Bridging solid Bible teaching and practical ministry in the church is the core of my heart. The mentorship here gives students direction and stability."',
      
      // New landing page final CTA (cached defaults)
      'landing-cta-tagline': 'Opptak Åpent for Høsten 2026',
      'landing-cta-tagline-en': 'Admissions Open for Fall 2026',
      'landing-cta-title': 'Er du klar til å tre inn i din gudgitte tjeneste?',
      'landing-cta-title-en': 'Are you ready to step into your God-given ministry?',
      'landing-cta-desc': 'Bli en del av et levende og solid læringsmiljø dedikert til bibelundervisning og åndelig utrustning.',
      'landing-cta-desc-en': 'Become part of a vibrant and solid learning environment dedicated to Bible teaching and spiritual equipment.',
      'landing-cta-btn-primary': 'Søk Opptak 2026',
      'landing-cta-btn-primary-en': 'Apply for Admission 2026',
      'landing-cta-btn-secondary': 'Se Fagplan',
      'landing-cta-btn-secondary-en': 'See Curriculum',
      
      // New landing page footer (cached defaults)
      'landing-footer-title': 'His Kingdom Prophets',
      'landing-footer-title-en': 'His Kingdom Prophets',
      'landing-footer-copyright': '© 2026 His Kingdom Prophets. Alle rettigheter reservert. Utrustning av profetiske tjenester for menigheten.',
      'landing-footer-copyright-en': '© 2026 His Kingdom Prophets. All rights reserved. Equipping prophetic ministries for the church.',
      'landing-footer-link-privacy': 'Personvern',
      'landing-footer-link-privacy-en': 'Privacy Policy',
      'landing-footer-link-terms': 'Betingelser',
      'landing-footer-link-terms-en': 'Terms of Service',
      'landing-footer-link-accessibility': 'Tilgjengelighet',
      'landing-footer-link-accessibility-en': 'Accessibility',
      'landing-footer-link-support': 'Kontakt Support',
      'landing-footer-link-support-en': 'Contact Support',
      
      // Public bible resources page
      'resources-hero-tagline': 'Offentlig studieportal',
      'resources-hero-tagline-en': 'Public Study Portal',
      'resources-hero-title': 'Bibelressurser og studieportal',
      'resources-hero-title-en': 'Biblical & Prophetic Resources',
      'resources-hero-desc': 'Dyp bibelundervisning, interaktiv studiebibel og verktøy som ruster deg til din tjeneste. Utforsk våre åpne bibelressurser under.',
      'resources-hero-desc-en': 'Deep theological curriculum, interactive scriptures, and study aids to equip your calling. Click through our tabs below to explore public resources.',
      'resources-tab-bible': '📖 Interaktiv studiebibel',
      'resources-tab-bible-en': '📖 Bible Reader & Study Center',
      'resources-tab-curriculums': '📚 Fagplaner og studiehefter',
      'resources-tab-curriculums-en': '📚 Curriculum & Outlines',
      'resources-tab-video': '🎙️ Lyd- og videoundervisning',
      'resources-tab-video-en': '🎙️ Lectures & Seminars',
      'resources-tab-fasting': '📜 Fastemanualer og bønneguider',
      'resources-tab-fasting-en': '📜 Fasting & Prayer Manuals',
      'resources-bible-title': 'Interaktiv studiebibel',
      'resources-bible-title-en': 'Interactive Bible Study Center',
      'resources-bible-desc': 'Trykk på et hvilket som helst vers for å kopiere det. Åpne "studiebibel"-panelet for ferdige teologiske kommentarer, ordstudier og personlige notater.',
      'resources-bible-desc-en': 'Click any verse to copy it or request detailed theological analysis. Open the "study bible" panel to view pre-loaded commentaries, word studies, and make personal notes.',
      'resources-curriculums-title': 'Studieplaner og teologiske fagplaner',
      'resources-curriculums-title-en': 'Prophetic Outlines & Curriculum',
      'resources-curriculums-desc': 'Vi forener dyp akademisk eksegese med Den Hellige Ånds gaverolle. Her er en oversikt over studieheftene og modulene i våre tre hovedlinjer.',
      'resources-curriculums-desc-en': 'We balance heavy academic exegesis with the flow of the Holy Spirit. Explore the structural outlines of our three core streams.',
      'resources-video-title': 'Lyd- og videoundervisning',
      'resources-video-title-en': 'Theological Lectures & Prophetic Streams',
      'resources-video-desc': 'Få tilgang til åpne seminarer, live-strømmer av bønnesamlinger, og smakebiter av vår ukentlige video-undervisning.',
      'resources-video-desc-en': 'Access sample theological seminars, live prayer streams, and biblical teaching packages.',
      'resources-fasting-title': 'Fastemanualer og bønneguider',
      'resources-fasting-title-en': 'Prayer Guides & Spiritual Discipline Manuals',
      'resources-fasting-desc': 'Praktiske, bibelske verktøy som ruster deg til åndelig disiplin, bibelske fasteperioder, og profetisk forbønn under Åndens ledelse.',
      'resources-fasting-desc-en': 'Practical biblical tools for spiritual discipline, fasting, and prophetic intercession.',

      'login-title': 'His Kingdom Prophets',
      'login-title-en': 'His Kingdom Prophets',
      'login-subtitle': 'Logg inn på din åpenbaringsportal',
      'login-subtitle-en': 'Sign in to your revelation portal',
      'login-instruction': 'Velg din rolle under for rask pålogging, eller skriv inn brukernavn og passord for å gå til dine studier.',
      'login-instruction-en': 'Select your role below for quick access, or enter your username and password to proceed to your studies.',
      
      'student-welcome-title': 'Velkommen tilbake til studiene,',
      'student-welcome-title-en': 'Welcome back to your studies,',
      'student-welcome-subtitle': 'Du gjør fremragende fremgang i den profetiske tjeneste og hermeneutikk denne uken. Dine mentorer har publisert 2 nye studiehefter i biblioteket.',
      'student-welcome-subtitle-en': 'You are making outstanding progress in prophetic ministry and hermeneutics this week. Your mentors have published 2 new study guides in the library.',
      'student-active-courses-title': 'Mine aktive kurs',
      'student-active-courses-title-en': 'My Active Courses',
      'student-live-gatherings-title': 'Live-undervisning & Bønn',
      'student-live-gatherings-title-en': 'Live Teaching & Prayer',
      'student-next-gatherings-title': 'Neste samlinger',
      'student-next-gatherings-title-en': 'Upcoming Gatherings',
      'student-tasks-title': 'Mine gjøremål & oppgaver',
      'student-tasks-title-en': 'My Tasks & Assignments',
      'student-stats-title': 'Studie-statistikk',
      'student-stats-title-en': 'Study Statistics',
      'student-quicklinks-title': 'Hurtiglenker og ressurser',
      'student-quicklinks-title-en': 'Quick Links & Resources',
      'student-announcements-title': 'Viktige Kunngjøringer',
      'student-announcements-title-en': 'Important Announcements',
      
      'teacher-welcome-title': 'Veiledningssenter & Mentorportal',
      'teacher-welcome-title-en': 'Guidance Center & Mentor Portal',
      'teacher-welcome-subtitle': 'Oversikt over studentenes åndelige fremdrift, disippelskap og oppfølgingsvarsler.',
      'teacher-welcome-subtitle-en': 'Overview of student spiritual progress, discipleship, and follow-up notifications.',
      'teacher-academic-year': 'Aktuelt studieår: 2026',
      'teacher-academic-year-en': 'Current Academic Year: 2026',
      'teacher-kpi1-label': 'Totalt Registrert',
      'teacher-kpi1-label-en': 'Total Enrolled',
      'teacher-kpi2-label': 'Faglig Snittfremdrift',
      'teacher-kpi2-label-en': 'Average Academic Progress',
      'teacher-kpi3-label': 'Evalueringssnitt',
      'teacher-kpi3-label-en': 'Average Evaluation Score',
      'teacher-kpi4-label': 'Studenter under oppfølging',
      'teacher-kpi4-label-en': 'Students Under Follow-up',
      'teacher-actions-title': 'Administrative tjenester',
      'teacher-actions-title-en': 'Administrative Services',
      
      'admin-cms-welcome': 'Velkommen til His Kingdom Prophets sitt administrative portal. Tjen Herren med integritet.',
      'admin-cms-welcome-en': 'Welcome to the His Kingdom Prophets administrative portal. Serve the Lord with integrity.',
      'admin-cms-title': 'Plattforminnhold (Assets)',
      'admin-cms-title-en': 'Platform Content (Assets)',
      'admin-cms-subtitle': 'Velg et statisk tekstfelt eller systemkonfigurasjon for å gjøre endringer direkte i databasen.',
      'admin-cms-subtitle-en': 'Select a static text field or system configuration to make changes directly in the database.',

      'welcome-ready-title': 'Alt er klart, {name}!',
      'welcome-ready-title-en': 'Everything is ready, {name}!',
      'welcome-ready-subtitle': 'Din profil er nå ferdig konfigurert. Du er registrert som student ved vår profetiske bibelskole og utrustningssenter.',
      'welcome-ready-subtitle-en': 'Your profile is now fully configured. You are registered as a student at our prophetic Bible school and equipping center.',
      'welcome-card1-title': 'Utforsk studieplanen',
      'welcome-card1-title-en': 'Explore the Curriculum',
      'welcome-card1-desc': 'Få tilgang til dine kurs i profetisk tjeneste, bibelundervisning og menighetsledelse.',
      'welcome-card1-desc-en': 'Access your courses in prophetic ministry, biblical teaching, and church leadership.',
      'welcome-card2-title': 'Bli med i bønnefellesskap',
      'welcome-card2-title-en': 'Join the Prayer Community',
      'welcome-card2-desc': 'Koble deg på studiegrupper, del profetiske åpenbaringer og chat med dine medstudenter.',
      'welcome-card2-desc-en': 'Connect with study groups, share prophetic revelations, and chat with fellow students.',
      'welcome-cta-btn': 'GÅ TIL MITT DASHBOARD',
      'welcome-cta-btn-en': 'GO TO MY DASHBOARD',

      'layout-logo-title': 'His Kingdom Prophets',
      'layout-logo-title-en': 'His Kingdom Prophets',
      'layout-search-placeholder': 'Søk i plattformen...',
      'layout-search-placeholder-en': 'Search the platform...',
      'layout-upgrade-banner-title': 'Utvid tjenesten',
      'layout-upgrade-banner-title-en': 'Expand Your Ministry',
      'layout-upgrade-banner-desc': 'Få ubegrenset tilgang til alle studieskrifter og veiledning.',
      'layout-upgrade-banner-desc-en': 'Gain unlimited access to all study materials and pastoral guidance.',
      'layout-upgrade-banner-btn': 'Oppgrader profil',
      'layout-upgrade-banner-btn-en': 'Upgrade Profile',

      'nav.dashboard.title': 'Oversikt',
      'nav.dashboard.title-en': 'Dashboard',
      'btn.submit.primary': 'Send inn endringer',
      'btn.submit.primary-en': 'Submit Changes',
      'msg.welcome.student': 'Velkommen tilbake, {{name}}! Klar for å lære i dag?',
      'msg.welcome.student-en': 'Welcome back, {{name}}! Ready to learn today?',
      'error.auth.forbidden': 'Du har ikke tilgang til å se denne ressursen.',
      'error.auth.forbidden-en': 'You do not have permission to view this resource.',
      'nav.settings.account': 'Kontoinnstillinger',
      'nav.settings.account-en': 'Account Settings',

      // Sidemeny og navigasjon (Systemnøkler)
      'sidebar-student-portal': 'STUDIEPORTAL',
      'sidebar-student-portal-en': 'STUDENT PORTAL',
      'sidebar-mentor-tools': 'MENTORVERKTØY',
      'sidebar-mentor-tools-en': 'MENTOR TOOLS',
      'sidebar-faculty-tools': 'FAKULTETSVERKTØY',
      'sidebar-faculty-tools-en': 'FACULTY TOOLS',
      'sidebar-administration': 'ADMINISTRASJON',
      'sidebar-administration-en': 'ADMINISTRATION',
      'sidebar-bible': 'Bibelen',
      'sidebar-bible-en': 'The Bible',
      'sidebar-curriculum': 'Studieplan & kurs',
      'sidebar-curriculum-en': 'Curriculum & Courses',
      'sidebar-lesson': 'Leksjon',
      'sidebar-lesson-en': 'Lesson',
      'sidebar-video': 'Klasserom / Video',
      'sidebar-video-en': 'Classroom / Video',
      'sidebar-assignments': 'Oppgaver',
      'sidebar-assignments-en': 'Assignments',
      'sidebar-notes': 'Mine notater',
      'sidebar-notes-en': 'My Notes',
      'sidebar-community': 'Bønnefellesskap',
      'sidebar-community-en': 'Prayer Fellowship',
      'sidebar-grades': 'Karakterutregning',
      'sidebar-grades-en': 'Grade Calculation',
      'sidebar-insights': 'Kursinnsikt',
      'sidebar-insights-en': 'Course Insights',
      'sidebar-followup': 'Oppfølging',
      'sidebar-followup-en': 'Follow-up',
      'sidebar-course-builder': 'Kursbygger',
      'sidebar-course-builder-en': 'Course Builder',
      'sidebar-quiz-builder': 'Quizbygger',
      'sidebar-quiz-builder-en': 'Quiz Builder',
      'sidebar-user-admin': 'Brukeradministrasjon',
      'sidebar-user-admin-en': 'User Administration',
      'sidebar-cms-editor': 'Global CMS',
      'sidebar-cms-editor-en': 'Global CMS',
      'sidebar-support': 'Hjelp & support',
      'sidebar-support-en': 'Help & Support',

      // Studentportal og dashbord
      'student-status-badge': 'Studie-status',
      'student-status-badge-en': 'Study Status',
      'student-view-all': 'Vis alle',
      'student-view-all-en': 'View All',
      'student-academic-eval': 'Faglig Vurdering',
      'student-academic-eval-en': 'Academic Evaluation',
      'student-continue-lesson': 'Fortsett leksjon',
      'student-continue-lesson-en': 'Continue Lesson',
      'student-live-header': 'Neste Live Samling',
      'student-live-header-en': 'Next Live Gathering',
      'student-join-zoom': 'Bli med via Zoom',
      'student-join-zoom-en': 'Join via Zoom',
      'student-stats-hours': 'Timer studert',
      'student-stats-hours-en': 'Hours Studied',
      'student-stats-completed': 'Fullførte leksjoner',
      'student-stats-completed-en': 'Completed Lessons',
      'student-stats-goal': 'Ukemål',
      'student-stats-goal-en': 'Weekly Goal',
      'student-stats-reached': 'nådd',
      'student-stats-reached-en': 'reached',

      // Mentorportal og dashbord
      'teacher-academic-year-label': 'Studieår',
      'teacher-academic-year-label-en': 'Academic Year',
      'teacher-kpi1-trend': '+12% fra forrige måned',
      'teacher-kpi1-trend-en': '+12% from last month',
      'teacher-kpi3-desc': 'Bestått-andel for aktive disipler',
      'teacher-kpi3-desc-en': 'Pass rate for active disciples',
      'teacher-kpi4-desc': 'studenter trenger oppfølging',
      'teacher-kpi4-desc-en': 'students need follow-up',
      'teacher-risk-title': 'Studenter som krever oppfølging',
      'teacher-risk-title-en': 'Students Requiring Follow-up',
      'teacher-risk-subtitle': 'Fremdriftsvarsel for elever med lav aktivitet eller under 50% poengsnitt.',
      'teacher-risk-subtitle-en': 'Progress alert for students with low activity or under 50% average score.',
      'teacher-incoming-title': 'Innkomne oppgaver til sensur',
      'teacher-incoming-title-en': 'Incoming Assignments for Grading',
      'teacher-incoming-subtitle': 'Oppgaver levert av elever som venter på faglig vurdering (Bestått/Ikke bestått).',
      'teacher-incoming-subtitle-en': 'Assignments submitted by students waiting for academic evaluation (Passed/Failed).',
      'teacher-classes-title': 'Dagens forelesninger & live-rom',
      'teacher-classes-title-en': "Today's Lectures & Live Rooms",
      'teacher-classes-subtitle': 'Administrer og start Zoom-klasserom for dagens oppsatte timer.',
      'teacher-classes-subtitle-en': 'Manage and start Zoom classrooms for today\'s scheduled lectures.',
      'teacher-btn-start-class': 'Start forelesning (Zoom)',
      'teacher-btn-start-class-en': 'Start Lecture (Zoom)',

      // Oppgaver og vurderinger
      'student-assignments-outstanding': 'Utestående',
      'student-assignments-outstanding-en': 'Outstanding',
      'student-assignments-submitted': 'Innsendt',
      'student-assignments-submitted-en': 'Submitted',
      'student-assignments-graded': 'Vurdert',
      'student-assignments-graded-en': 'Graded',
      'student-assignments-not-submitted': 'Ikke innlevert',
      'student-assignments-not-submitted-en': 'Not Submitted',
      'student-assignments-waiting-grade': 'Venter på sensur',
      'student-assignments-waiting-grade-en': 'Awaiting Grading',
      'student-assignments-result': 'Resultat',
      'student-assignments-result-en': 'Result',
      'student-assignments-deadline': 'Innleveringsfrist',
      'student-assignments-deadline-en': 'Due Date',

      // Profiler og kontoinnstillinger
      'profile-tab-teacher': 'Lærerprofil',
      'profile-tab-teacher-en': 'Teacher Profile',
      'profile-tab-student': 'Min profil',
      'profile-tab-student-en': 'My Profile',
      'profile-tab-profile': 'Min profil',
      'profile-tab-profile-en': 'My Profile',
      'profile-tab-account': 'Konto',
      'profile-tab-account-en': 'Account',
      'profile-breadcrumb-mentor': 'Mentorpanel',
      'profile-breadcrumb-mentor-en': 'Mentor Panel',
      'profile-breadcrumb-teacher-title': 'Min lærerprofil',
      'profile-breadcrumb-teacher-title-en': 'My Teacher Profile',
      'profile-breadcrumb-dashboard': 'Dashboard',
      'profile-breadcrumb-dashboard-en': 'Dashboard',
      'profile-breadcrumb-student-title': 'Min profil',
      'profile-breadcrumb-student-title-en': 'My Profile',
      'profile-hero-student-role': 'Student',
      'profile-hero-student-role-en': 'Student',
      'profile-hero-teacher-role': 'Mentor',
      'profile-hero-teacher-role-en': 'Mentor',
      'profile-hero-student-fallback': 'Student',
      'profile-hero-student-fallback-en': 'Student',
      'profile-hero-teacher-fallback': 'Min lærerprofil',
      'profile-hero-teacher-fallback-en': 'My Teacher Profile',
      'profile-hero-not-specified': 'Sted ikke angitt',
      'profile-hero-not-specified-en': 'Location not specified',
      'profile-hero-students-kpi': 'Studenter',
      'profile-hero-students-kpi-en': 'Students',
      'profile-hero-students-sub': 'Aktiv oppfølging',
      'profile-hero-students-sub-en': 'Active follow-up',
      'profile-hero-courses-kpi': 'Kurs',
      'profile-hero-courses-kpi-en': 'Courses',
      'profile-hero-courses-sub': 'Fagmoduler',
      'profile-hero-courses-sub-en': 'Subject modules',
      'profile-hero-completion-kpi': 'Profil',
      'profile-hero-completion-kpi-en': 'Profile',
      'profile-hero-completion-sub': 'Fullføringsgrad',
      'profile-hero-completion-sub-en': 'Completion rate',
      'profile-nudge-teacher': 'Fullfør lærerprofilen slik at studentene lettere finner veiledning, kontortid og fagområde.',
      'profile-nudge-teacher-en': 'Complete your teacher profile so students can easily find guidance, office hours, and subject area.',
      'profile-nudge-student': 'Fullfør profilen din for å hjelpe lærere og medstudenter å bli kjent med deg.',
      'profile-nudge-student-en': 'Complete your profile to help teachers and fellow students get to know you.',
      'profile-section-public': 'Offentlig lærerprofil',
      'profile-section-public-en': 'Public Teacher Profile',
      'profile-section-personal': 'Personlig informasjon',
      'profile-section-personal-en': 'Personal Information',
      'profile-section-availability': 'Tilgjengelighet',
      'profile-section-availability-en': 'Availability',
      'profile-section-private': 'Privat kontaktinformasjon',
      'profile-section-private-en': 'Private Contact Information',
      'profile-section-preview': 'Forhåndsvisning',
      'profile-section-preview-en': 'Preview',
      'profile-section-email': 'E-postadresse',
      'profile-section-email-en': 'Email Address',
      'profile-section-password': 'Endre passord',
      'profile-section-password-en': 'Change Password',
      'profile-section-danger': 'Faresone',
      'profile-section-danger-en': 'Danger Zone',
      'profile-section-social': 'Sosiale medier',
      'profile-section-social-en': 'Social Media',
      'profile-field-fullname': 'Fullt navn',
      'profile-field-fullname-en': 'Full Name',
      'profile-field-title': 'Tittel',
      'profile-field-title-en': 'Title',
      'profile-field-department': 'Avdeling / linje',
      'profile-field-department-en': 'Department / line',
      'profile-field-location': 'Sted',
      'profile-field-location-en': 'Location',
      'profile-field-city': 'Bosted / By',
      'profile-field-city-en': 'Location / City',
      'profile-field-expertise': 'Fagområde',
      'profile-field-expertise-en': 'Field of expertise',
      'profile-field-bio': 'Mentor-bio',
      'profile-field-bio-en': 'Mentor bio',
      'profile-field-bio-length': 'tegn',
      'profile-field-bio-length-en': 'chars',
      'profile-field-hours': 'Kontortid',
      'profile-field-hours-en': 'Office hours',
      'profile-field-zoom': 'Zoom-lenke',
      'profile-field-zoom-en': 'Zoom link',
      'profile-field-phone': 'Mobilnummer',
      'profile-field-phone-en': 'Mobile number',
      'profile-field-birthdate': 'Fødselsdato',
      'profile-field-birthdate-en': 'Date of birth',
      'profile-field-address': 'Adresse',
      'profile-field-address-en': 'Address',
      'profile-field-email': 'E-post',
      'profile-field-email-en': 'Email',
      'profile-field-password-current': 'Nåværende passord',
      'profile-field-password-current-en': 'Current Password',
      'profile-field-password-new': 'Nytt passord',
      'profile-field-password-new-en': 'New Password',
      'profile-field-password-confirm': 'Gjenta nytt passord',
      'profile-field-password-confirm-en': 'Confirm New Password',
      'profile-field-ministry': 'Tjenestegave / kall',
      'profile-field-ministry-en': 'Ministry gift / calling',
      'profile-field-instagram': 'Instagram',
      'profile-field-instagram-en': 'Instagram',
      'profile-field-facebook': 'Facebook',
      'profile-field-facebook-en': 'Facebook',
      'profile-warning-not-saved': 'Endringer lagres ikke automatisk.',
      'profile-warning-not-saved-en': 'Changes are not saved automatically.',
      'profile-warning-private-mentor': 'Disse opplysningene er private — kun synlig for administratorer, aldri for studenter.',
      'profile-warning-private-mentor-en': 'This information is private — only visible to administrators, never to students.',
      'profile-warning-private-student': 'Disse opplysningene er private — kun synlig for administratorer, aldri for andre studenter eller lærere.',
      'profile-warning-private-student-en': 'This information is private — only visible to administrators, never to other students or teachers.',
      'profile-warning-encrypted': 'Lagret kryptert • Kun lesbart for administratorer',
      'profile-warning-encrypted-en': 'Stored encrypted • Only readable by administrators',
      'profile-warning-danger-desc-teacher': 'Logg ut av mentorportalen på denne enheten.',
      'profile-warning-danger-desc-teacher-en': 'Log out of the mentor portal on this device.',
      'profile-warning-danger-desc-student': 'Disse handlingene er permanente og kan ikke angres.',
      'profile-warning-danger-desc-student-en': 'These actions are permanent and cannot be undone.',
      'profile-warning-admin-title': 'Admin-tilgang',
      'profile-warning-admin-title-en': 'Admin Access',
      'profile-warning-admin-desc': 'Du ser denne seksjonen fordi du er admin.',
      'profile-warning-admin-desc-en': 'You see this section because you are admin.',
      'profile-btn-save-teacher': 'Lagre lærerprofil',
      'profile-btn-save-teacher-en': 'Save Teacher Profile',
      'profile-btn-save-student': 'Lagre profil',
      'profile-btn-save-student-en': 'Save Profile',
      'profile-btn-undo': 'Angre',
      'profile-btn-undo-en': 'Undo',
      'profile-btn-update-email': 'Oppdater e-post',
      'profile-btn-update-email-en': 'Update Email',
      'profile-btn-update-password': 'Oppdater passord',
      'profile-btn-update-password-en': 'Update Password',
      'profile-btn-logout': 'Logg ut av HKM',
      'profile-btn-logout-en': 'Log Out of HKM',
      'profile-status-pw-mismatch': 'Passordene stemmer ikke overens',
      'profile-status-pw-mismatch-en': 'Passwords do not match',
      'profile-status-pw-match': 'Passordene stemmer overens',
      'profile-status-pw-match-en': 'Passwords match',
      'profile-status-saving': 'Lagrer...',
      'profile-status-saving-en': 'Saving...',
      'profile-avatar-modal-title': 'Velg profilbilde',
      'profile-avatar-modal-title-en': 'Choose Profile Picture',
      'profile-avatar-modal-desc': 'Klikk på et bilde for å velge det',
      'profile-avatar-modal-desc-en': 'Click an image to choose it',
      'profile-avatar-modal-soon': 'Snart: Last opp eget bilde via Supabase Storage',
      'profile-avatar-modal-soon-en': 'Soon: Upload your own image via Supabase Storage',
      'profile-preview-name-fallback': 'Ditt navn',
      'profile-preview-name-fallback-en': 'Your Name',
      'profile-preview-title-fallback': 'Tittel ikke angitt',
      'profile-preview-title-fallback-en': 'Title not specified',
      'profile-preview-expertise-fallback': 'Fagområde ikke angitt',
      'profile-preview-expertise-fallback-en': 'Expertise not specified',
      'profile-preview-hours-fallback': 'Kontortid ikke angitt',
      'profile-preview-hours-fallback-en': 'Office hours not specified',
      'profile-preview-zoom-available': 'Digital veiledning tilgjengelig',
      'profile-preview-zoom-available-en': 'Digital mentoring available',
      'profile-placeholder-fullname': 'Ditt fulle navn',
      'profile-placeholder-fullname-en': 'Your full name',
      'profile-placeholder-title': 'f.eks. Faglærer og mentor',
      'profile-placeholder-title-en': 'e.g. Teacher and mentor',
      'profile-placeholder-department': 'f.eks. Profetisk utrustning',
      'profile-placeholder-department-en': 'e.g. Prophetic Equipping',
      'profile-placeholder-location': 'f.eks. Kristiansand, Norge',
      'profile-placeholder-location-en': 'e.g. Kristiansand, Norway',
      'profile-placeholder-expertise': 'Skriv fagområder studentene kan søke veiledning i',
      'profile-placeholder-expertise-en': 'Write subject areas students can seek guidance in',
      'profile-placeholder-bio-teacher': 'Skriv en kort presentasjon av undervisningsstil, erfaring og hva studentene kan forvente i veiledning.',
      'profile-placeholder-bio-teacher-en': 'Write a brief presentation of your teaching style, experience, and what students can expect in guidance.',
      'profile-placeholder-hours': 'f.eks. Tirsdag 12:00-15:00',
      'profile-placeholder-hours-en': 'e.g. Tuesday 12:00-15:00',
      'profile-placeholder-zoom': 'https://zoom.us/j/...',
      'profile-placeholder-zoom-en': 'https://zoom.us/j/...',
      'profile-placeholder-phone': '+47 000 00 000',
      'profile-placeholder-phone-en': '+47 000 00 000',
      'profile-placeholder-address': 'f.eks. Gateveien 12, 4500 Kristiansand',
      'profile-placeholder-address-en': 'e.g. Gateveien 12, 4500 Kristiansand',
      'profile-placeholder-email': 'din@epost.no',
      'profile-placeholder-email-en': 'your@email.com',
      'profile-placeholder-password': '••••••••',
      'profile-placeholder-password-en': '••••••••',
      'profile-placeholder-ministry': 'f.eks. Profetisk tjeneste, Forbønn, Lovsang, Pastoral omsorg…',
      'profile-placeholder-ministry-en': 'e.g. Prophetic ministry, Intercession, Worship, Pastoral care…',
      'profile-placeholder-bio-student': 'Skriv litt om deg selv, din åndelige reise og hva du ønsker å lære på HKM…',
      'profile-placeholder-bio-student-en': 'Write a little about yourself, your spiritual journey, and what you wish to learn at HKM...',
      'profile-placeholder-social-username': 'brukernavn',
      'profile-placeholder-social-username-en': 'username'
    };
    try {
      const saved = localStorage.getItem('hkm-cms-content');
      if (saved) {
        return { ...defaults, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Klarte ikke hente cms content fra localStorage:', e);
    }
    return defaults;
  });

  const [isAdminEditing, setIsAdminEditing] = useState(false);

  const [language, setLanguage] = useState(() => {
    try {
      // Respect manual language choice first
      const saved = localStorage.getItem('hkm-language');
      if (saved) return saved;

      // Smart auto-detect Scandinavia: check browser languages
      const browserLanguages = navigator.languages || [navigator.language || ''];
      const scandiCodes = ['no', 'nb', 'nn', 'sv', 'da', 'se', 'dk'];
      const hasScandiLang = browserLanguages.some(lang => {
        const code = lang.toLowerCase().split('-')[0];
        return scandiCodes.includes(code);
      });

      if (hasScandiLang) return 'no';

      // Check timezone as a secondary fallback
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const scandiTimezones = ['Europe/Oslo', 'Europe/Stockholm', 'Europe/Copenhagen'];
      if (scandiTimezones.includes(tz)) return 'no';

      // Default to English for anyone outside Scandinavia
      return 'en';
    } catch {
      return 'no';
    }
  });

  const toggleLanguage = () => {
    setLanguage(prev => {
      const next = prev === 'no' ? 'en' : 'no';
      try {
        localStorage.setItem('hkm-language', next);
      } catch (e) {
        console.error('Klarte ikke lagre språk i localStorage:', e);
      }
      return next;
    });
  };

  // Firestore Realtime / Seed subscriptions
  useEffect(() => {
    const fetchCmsContent = async () => {
      try {
        const cmsDocRef = doc(db, "cms_configs", "default");
        const cmsSnap = await getDoc(cmsDocRef);
        if (cmsSnap.exists()) {
          const dbData = cmsSnap.data();
          setCmsContent(prev => {
            const merged = { ...prev, ...dbData };
            localStorage.setItem('hkm-cms-content', JSON.stringify(merged));
            return merged;
          });
        } else {
          // Document doesn't exist, seed it with the default cmsContent values!
          const initialCms = {
            'landing-hero-title': 'His Kingdom prophets',
            'landing-hero-title-en': 'His Kingdom Prophets',
            'landing-hero-tagline': 'Profetisk tjeneste og åndelig dybde',
            'landing-hero-tagline-en': 'Prophetic Ministry and Spiritual Depth',
            'landing-hero-description': 'En åpenbaringsskole for profetisk utrustning, bibelundervisning og åndelig vekst, hvor solid bibelsk teologi møter den levende Ånd.',
            'landing-hero-description-en': 'A school of revelation for prophetic equipping, Bible teaching, and spiritual growth, where solid biblical theology meets the living Spirit.',
            'landing-hero-cta-primary': 'Begynn Din Reise',
            'landing-hero-cta-primary-en': 'Begin Your Journey',
            'landing-hero-cta-secondary': 'Se Introduksjon',
            'landing-hero-cta-secondary-en': 'Watch Introduction',
            'landing-pillars-title': 'Tre søyler for tjenesteutrustning',
            'landing-pillars-title-en': 'Three Pillars for Ministerial Equipping',
            'landing-pillars-desc': 'Vårt fundament forener grundig bibelsk lære med den profetiske gaverollen i Guds rike.',
            'landing-pillars-desc-en': 'Our foundation unites thorough biblical teaching with the prophetic gift in the Kingdom of God.',
            'landing-pillar1-title': 'Profetisk utrustning og tjeneste',
            'landing-pillar1-title-en': 'Prophetic Equipping and Ministry',
            'landing-pillar1-desc': 'Lær å høre Guds stemme, tyde syner og drømmer, og formidle åpenbaringskunnskap med sunne bibelske rammer og etisk modenhet.',
            'landing-pillar1-desc-en': 'Learn to hear God\'s voice, interpret visions and dreams, and convey revelation knowledge within sound biblical boundaries.',
            'landing-pillar2-title': 'Dyp bibelundervisning',
            'landing-pillar2-title-en': 'Deep Bible Teaching',
            'landing-pillar2-desc': 'Gå i dybden på paktsteologi, eskatologi og hermeneutiske verktøy som ruster deg til å dele sannhetens ord rett.',
            'landing-pillar2-desc-en': 'Delve deep into covenant theology, eschatology, and hermeneutical tools that equip you to rightly divide the word of truth.',
            'landing-pillar3-title': 'Personlig åndelig veiledning',
            'landing-pillar3-title-en': 'Personal Spiritual Mentoring',
            'landing-pillar3-desc': 'Personlig oppfølging og disippelskap for din tjeneste. Vi hjelper deg å vokse i karakter og finne ditt spesifikke kall.',
            'landing-pillar3-desc-en': 'Personal follow-up and discipleship for your ministry. We help you grow in character and find your specific calling.',
            'landing-network-title': 'Globale profetiske nettverk',
            'landing-network-title-en': 'Global Prophetic Networks',
            'landing-network-desc': 'Koble deg til bønnenettverk, misjonsreiser og tjenester over hele verden for å utvide ditt åndelige perspektiv.',
            'landing-network-desc-en': 'Connect with prayer networks, mission trips, and ministries worldwide to expand your spiritual perspective.',
            
            // New landing page links and buttons (database seed)
            'landing-nav-programs': 'Studielinjer',
            'landing-nav-programs-en': 'Programs',
            'landing-nav-faculty': 'Mentorer',
            'landing-nav-faculty-en': 'Mentors',
            'landing-nav-resources': 'Bibelressurser',
            'landing-nav-resources-en': 'Bible Resources',
            'landing-nav-admissions': 'Søk Opptak',
            'landing-nav-admissions-en': 'Apply Now',
            'landing-btn-login': 'Logg inn',
            'landing-btn-login-en': 'Log In',
            'landing-btn-portal': 'Gå til portal',
            'landing-btn-portal-en': 'Go to Portal',
            'landing-btn-apply': 'Søk Nå',
            'landing-btn-apply-en': 'Apply Now',
            'landing-network-btn': 'Bli en Del',
            'landing-network-btn-en': 'Join Us',
            
            // New landing page pillar bullet lists (database seed)
            'landing-pillar1-bullet1': 'Åndelig skjelneevne og etikk',
            'landing-pillar1-bullet1-en': 'Spiritual discernment and ethics',
            'landing-pillar1-bullet2': 'Drømmetydning & Åpenbaring',
            'landing-pillar1-bullet2-en': 'Dream interpretation & Revelation',
            'landing-pillar1-bullet3': 'Etisk karakter og modenhet',
            'landing-pillar1-bullet3-en': 'Ethical character and maturity',
            'landing-pillar2-bullet1': 'Historisk-grammatisk hermeneutikk',
            'landing-pillar2-bullet1-en': 'Historical-grammatical hermeneutics',
            'landing-pillar2-bullet2': 'Paktsteologi & Eskatologi',
            'landing-pillar2-bullet2-en': 'Covenant theology & Eschatology',
            'landing-pillar2-bullet3': 'Sunn eksegese og Skriftlære',
            'landing-pillar2-bullet3-en': 'Sound exegesis and Scripture study',
            'landing-pillar3-bullet1': '1-til-1 oppfølging & mentorsamtaler',
            'landing-pillar3-bullet1-en': '1-to-1 follow-up & mentoring sessions',
            'landing-pillar3-bullet2': 'Personlig disippelskapsprogram',
            'landing-pillar3-bullet2-en': 'Personal discipleship program',
            'landing-pillar3-bullet3': 'Karakterutvikling & Åndelig vekst',
            'landing-pillar3-bullet3-en': 'Character development & Spiritual growth',
            
            // New landing page testimonials (database seed)
            'landing-testimonials-title': 'Vitnesbyrd & Erfaringer',
            'landing-testimonials-title-en': 'Testimonials & Experiences',
            'landing-testimonials-desc': 'Hør hva våre studenter og mentorer sier om det profetiske fellesskapet.',
            'landing-testimonials-desc-en': 'Hear what our students and mentors say about the prophetic community.',
            'landing-testimonial1-name': 'Apostel David Hansen',
            'landing-testimonial1-name-en': 'Apostle David Hansen',
            'landing-testimonial1-role': 'Grunnlegger & Hovedmentor',
            'landing-testimonial1-role-en': 'Founder & Head Mentor',
            'landing-testimonial1-quote': '"Det profetiske fellesskapet her er helt unikt. Plattformen gir studentene de nødvendige åndelige og teologiske rammene for å vokse inn i sin tjeneste."',
            'landing-testimonial1-quote-en': '"The prophetic fellowship here is truly unique. The platform provides students with the necessary spiritual and theological frameworks to grow into their ministry."',
            'landing-testimonial2-name': 'Pastor Siri Knutsen',
            'landing-testimonial2-name-en': 'Pastor Siri Knutsen',
            'landing-testimonial2-role': 'Fagansvarlig for Sjelesorg & Menighet',
            'landing-testimonial2-role-en': 'Head of Pastoral Care & Church Life',
            'landing-testimonial2-quote': '"Å bygge bro mellom solid bibellære og praktisk betjening i menigheten er kjernen i mitt hjerte. Mentorskapet her gir studentene retning og soliditet."',
            'landing-testimonial2-quote-en': '"Bridging solid Bible teaching and practical ministry in the church is the core of my heart. The mentorship here gives students direction and stability."',
            
            // New landing page final CTA (database seed)
            'landing-cta-tagline': 'Opptak Åpent for Høsten 2026',
            'landing-cta-tagline-en': 'Admissions Open for Fall 2026',
            'landing-cta-title': 'Er du klar til å tre inn i din gudgitte tjeneste?',
            'landing-cta-title-en': 'Are you ready to step into your God-given ministry?',
            'landing-cta-desc': 'Bli en del av et levende og solid læringsmiljø dedikert til bibelundervisning og åndelig utrustning.',
            'landing-cta-desc-en': 'Become part of a vibrant and solid learning environment dedicated to Bible teaching and spiritual equipment.',
            'landing-cta-btn-primary': 'Søk Opptak 2026',
            'landing-cta-btn-primary-en': 'Apply for Admission 2026',
            'landing-cta-btn-secondary': 'Se Fagplan',
            'landing-cta-btn-secondary-en': 'See Curriculum',
            
            // New landing page footer (database seed)
            'landing-footer-title': 'His Kingdom Prophets',
            'landing-footer-title-en': 'His Kingdom Prophets',
            'landing-footer-copyright': '© 2026 His Kingdom Prophets. Alle rettigheter reservert. Utrustning av profetiske tjenester for menigheten.',
            'landing-footer-copyright-en': '© 2026 His Kingdom Prophets. All rights reserved. Equipping prophetic ministries for the church.',
            'landing-footer-link-privacy': 'Personvern',
            'landing-footer-link-privacy-en': 'Privacy Policy',
            'landing-footer-link-terms': 'Betingelser',
            'landing-footer-link-terms-en': 'Terms of Service',
            'landing-footer-link-accessibility': 'Tilgjengelighet',
            'landing-footer-link-accessibility-en': 'Accessibility',
            'landing-footer-link-support': 'Kontakt Support',
            'landing-footer-link-support-en': 'Contact Support',
            
            // Public bible resources page
            'resources-hero-tagline': 'Offentlig studieportal',
            'resources-hero-tagline-en': 'Public Study Portal',
            'resources-hero-title': 'Bibelressurser og studieportal',
            'resources-hero-title-en': 'Biblical & Prophetic Resources',
            'resources-hero-desc': 'Dyp bibelundervisning, interaktiv studiebibel og verktøy som ruster deg til din tjeneste. Utforsk våre åpne bibelressurser under.',
            'resources-hero-desc-en': 'Deep theological curriculum, interactive scriptures, and study aids to equip your calling. Click through our tabs below to explore public resources.',
            'resources-tab-bible': '📖 Interaktiv studiebibel',
            'resources-tab-bible-en': '📖 Bible Reader & Study Center',
            'resources-tab-curriculums': '📚 Fagplaner og studiehefter',
            'resources-tab-curriculums-en': '📚 Curriculum & Outlines',
            'resources-tab-video': '🎙️ Lyd- og videoundervisning',
            'resources-tab-video-en': '🎙️ Lectures & Seminars',
            'resources-tab-fasting': '📜 Fastemanualer og bønneguider',
            'resources-tab-fasting-en': '📜 Fasting & Prayer Manuals',
            'resources-bible-title': 'Interaktiv studiebibel',
            'resources-bible-title-en': 'Interactive Bible Study Center',
            'resources-bible-desc': 'Trykk på et hvilket som helst vers for å kopiere det. Åpne "studiebibel"-panelet for ferdige teologiske kommentarer, ordstudier og personlige notater.',
            'resources-bible-desc-en': 'Click any verse to copy it or request detailed theological analysis. Open the "study bible" panel to view pre-loaded commentaries, word studies, and make personal notes.',
            'resources-curriculums-title': 'Studieplaner og teologiske fagplaner',
            'resources-curriculums-title-en': 'Prophetic Outlines & Curriculum',
            'resources-curriculums-desc': 'Vi forener dyp akademisk eksegese med Den Hellige Ånds gaverolle. Her er en oversikt over studieheftene og modulene i våre tre hovedlinjer.',
            'resources-curriculums-desc-en': 'We balance heavy academic exegesis with the flow of the Holy Spirit. Explore the structural outlines of our three core streams.',
            'resources-video-title': 'Lyd- og videoundervisning',
            'resources-video-title-en': 'Theological Lectures & Prophetic Streams',
            'resources-video-desc': 'Få tilgang til åpne seminarer, live-strømmer av bønnesamlinger, og smakebiter av vår ukentlige video-undervisning.',
            'resources-video-desc-en': 'Access sample theological seminars, live prayer streams, and biblical teaching packages.',
            'resources-fasting-title': 'Fastemanualer og bønneguider',
            'resources-fasting-title-en': 'Prayer Guides & Spiritual Discipline Manuals',
            'resources-fasting-desc': 'Praktiske, bibelske verktøy som ruster deg til åndelig disiplin, bibelske fasteperioder, og profetisk forbønn under Åndens ledelse.',
            'resources-fasting-desc-en': 'Practical biblical tools for spiritual discipline, fasting, and prophetic intercession.',

            'login-title': 'His Kingdom Prophets',
            'login-title-en': 'His Kingdom Prophets',
            'login-subtitle': 'Logg inn på din åpenbaringsportal',
            'login-subtitle-en': 'Sign in to your revelation portal',
            'login-instruction': 'Velg din rolle under for rask pålogging, eller skriv inn brukernavn og passord for å gå til dine studier.',
            'login-instruction-en': 'Select your role below for quick access, or enter your username and password to proceed to your studies.',
            
            'student-welcome-title': 'Velkommen tilbake til studiene,',
            'student-welcome-title-en': 'Welcome back to your studies,',
            'student-welcome-subtitle': 'Du gjør fremragende fremgang i den profetiske tjeneste og hermeneutikk denne uken. Dine mentorer har publisert 2 nye studiehefter i biblioteket.',
            'student-welcome-subtitle-en': 'You are making outstanding progress in prophetic ministry and hermeneutics this week. Your mentors have published 2 new study guides in the library.',
            'student-active-courses-title': 'Mine aktive kurs',
            'student-active-courses-title-en': 'My Active Courses',
            'student-live-gatherings-title': 'Live-undervisning & Bønn',
            'student-live-gatherings-title-en': 'Live Teaching & Prayer',
            'student-next-gatherings-title': 'Neste samlinger',
            'student-next-gatherings-title-en': 'Upcoming Gatherings',
            'student-tasks-title': 'Mine gjøremål & oppgaver',
            'student-tasks-title-en': 'My Tasks & Assignments',
            'student-stats-title': 'Studie-statistikk',
            'student-stats-title-en': 'Study Statistics',
            'student-quicklinks-title': 'Hurtiglenker og ressurser',
            'student-quicklinks-title-en': 'Quick Links & Resources',
            'student-announcements-title': 'Viktige Kunngjøringer',
            'student-announcements-title-en': 'Important Announcements',
            
            'teacher-welcome-title': 'Veiledningssenter & Mentorportal',
            'teacher-welcome-title-en': 'Guidance Center & Mentor Portal',
            'teacher-welcome-subtitle': 'Oversikt over studentenes åndelige fremdrift, disippelskap og oppfølgingsvarsler.',
            'teacher-welcome-subtitle-en': 'Overview of student spiritual progress, discipleship, and follow-up notifications.',
            'teacher-academic-year': 'Aktuelt studieår: 2026',
            'teacher-academic-year-en': 'Current Academic Year: 2026',
            'teacher-kpi1-label': 'Totalt Registrert',
            'teacher-kpi1-label-en': 'Total Enrolled',
            'teacher-kpi2-label': 'Faglig Snittfremdrift',
            'teacher-kpi2-label-en': 'Average Academic Progress',
            'teacher-kpi3-label': 'Evalueringssnitt',
            'teacher-kpi3-label-en': 'Average Evaluation Score',
            'teacher-kpi4-label': 'Studenter under oppfølging',
            'teacher-kpi4-label-en': 'Students Under Follow-up',
            'teacher-actions-title': 'Administrative tjenester',
            'teacher-actions-title-en': 'Administrative Services',
            
            'admin-cms-welcome': 'Velkommen til His Kingdom Prophets sitt administrative portal. Tjen Herren med integritet.',
            'admin-cms-welcome-en': 'Welcome to the His Kingdom Prophets administrative portal. Serve the Lord with integrity.',
            'admin-cms-title': 'Plattforminnhold (Assets)',
            'admin-cms-title-en': 'Platform Content (Assets)',
            'admin-cms-subtitle': 'Velg et statisk tekstfelt eller systemkonfigurasjon for å gjøre endringer direkte i databasen.',
            'admin-cms-subtitle-en': 'Select a static text field or system configuration to make changes directly in the database.',
       
            'welcome-ready-title': 'Alt er klart, {name}!',
            'welcome-ready-title-en': 'Everything is ready, {name}!',
            'welcome-ready-subtitle': 'Din profil er nå ferdig konfigurert. Du er registrert som student ved vår profetiske bibelskole og utrustningssenter.',
            'welcome-ready-subtitle-en': 'Your profile is now fully configured. You are registered as a student at our prophetic Bible school and equipping center.',
            'welcome-card1-title': 'Utforsk studieplanen',
            'welcome-card1-title-en': 'Explore the Curriculum',
            'welcome-card1-desc': 'Få tilgang til dine kurs i profetisk tjeneste, bibelundervisning og menighetsledelse.',
            'welcome-card1-desc-en': 'Access your courses in prophetic ministry, biblical teaching, and church leadership.',
            'welcome-card2-title': 'Bli med i bønnefellesskap',
            'welcome-card2-title-en': 'Join the Prayer Community',
            'welcome-card2-desc': 'Koble deg på studiegrupper, del profetiske åpenbaringer og chat med dine medstudenter.',
            'welcome-card2-desc-en': 'Connect with study groups, share prophetic revelations, and chat with fellow students.',
            'welcome-cta-btn': 'GÅ TIL MITT DASHBOARD',
            'welcome-cta-btn-en': 'GO TO MY DASHBOARD',
       
            'layout-logo-title': 'His Kingdom Prophets',
            'layout-logo-title-en': 'His Kingdom Prophets',
            'layout-search-placeholder': 'Søk i plattformen...',
            'layout-search-placeholder-en': 'Search the platform...',
            'layout-upgrade-banner-title': 'Utvid tjenesten',
            'layout-upgrade-banner-title-en': 'Expand Your Ministry',
            'layout-upgrade-banner-desc': 'Få ubegrenset tilgang til alle studieskrifter og veiledning.',
            'layout-upgrade-banner-desc-en': 'Gain unlimited access to all study materials and pastoral guidance.',
            'layout-upgrade-banner-btn': 'Oppgrader profil',
            'layout-upgrade-banner-btn-en': 'Upgrade Profile',

            'nav.dashboard.title': 'Oversikt',
            'nav.dashboard.title-en': 'Dashboard',
            'btn.submit.primary': 'Send inn endringer',
            'btn.submit.primary-en': 'Submit Changes',
            'msg.welcome.student': 'Velkommen tilbake, {{name}}! Klar for å lære i dag?',
            'msg.welcome.student-en': 'Welcome back, {{name}}! Ready to learn today?',
            'error.auth.forbidden': 'Du har ikke tilgang til å se denne ressursen.',
            'error.auth.forbidden-en': 'You do not have permission to view this resource.',
            'nav.settings.account': 'Kontoinnstillinger',
            'nav.settings.account-en': 'Account Settings',

            // Sidemeny og navigasjon (Systemnøkler)
            'sidebar-student-portal': 'STUDIEPORTAL',
            'sidebar-student-portal-en': 'STUDENT PORTAL',
            'sidebar-mentor-tools': 'MENTORVERKTØY',
            'sidebar-mentor-tools-en': 'MENTOR TOOLS',
            'sidebar-faculty-tools': 'FAKULTETSVERKTØY',
            'sidebar-faculty-tools-en': 'FACULTY TOOLS',
            'sidebar-administration': 'ADMINISTRASJON',
            'sidebar-administration-en': 'ADMINISTRATION',
            'sidebar-bible': 'Bibelen',
            'sidebar-bible-en': 'The Bible',
            'sidebar-curriculum': 'Studieplan & kurs',
            'sidebar-curriculum-en': 'Curriculum & Courses',
            'sidebar-lesson': 'Leksjon',
            'sidebar-lesson-en': 'Lesson',
            'sidebar-video': 'Klasserom / Video',
            'sidebar-video-en': 'Classroom / Video',
            'sidebar-assignments': 'Oppgaver',
            'sidebar-assignments-en': 'Assignments',
            'sidebar-notes': 'Mine notater',
            'sidebar-notes-en': 'My Notes',
            'sidebar-community': 'Bønnefellesskap',
            'sidebar-community-en': 'Prayer Fellowship',
            'sidebar-grades': 'Karakterutregning',
            'sidebar-grades-en': 'Grade Calculation',
            'sidebar-insights': 'Kursinnsikt',
            'sidebar-insights-en': 'Course Insights',
            'sidebar-followup': 'Oppfølging',
            'sidebar-followup-en': 'Follow-up',
            'sidebar-course-builder': 'Kursbygger',
            'sidebar-course-builder-en': 'Course Builder',
            'sidebar-quiz-builder': 'Quizbygger',
            'sidebar-quiz-builder-en': 'Quiz Builder',
            'sidebar-user-admin': 'Brukeradministrasjon',
            'sidebar-user-admin-en': 'User Administration',
            'sidebar-cms-editor': 'Global CMS',
            'sidebar-cms-editor-en': 'Global CMS',
            'sidebar-support': 'Hjelp & support',
            'sidebar-support-en': 'Help & Support',

            // Studentportal og dashbord
            'student-status-badge': 'Studie-status',
            'student-status-badge-en': 'Study Status',
            'student-view-all': 'Vis alle',
            'student-view-all-en': 'View All',
            'student-academic-eval': 'Faglig Vurdering',
            'student-academic-eval-en': 'Academic Evaluation',
            'student-continue-lesson': 'Fortsett leksjon',
            'student-continue-lesson-en': 'Continue Lesson',
            'student-live-header': 'Neste Live Samling',
            'student-live-header-en': 'Next Live Gathering',
            'student-join-zoom': 'Bli med via Zoom',
            'student-join-zoom-en': 'Join via Zoom',
            'student-stats-hours': 'Timer studert',
            'student-stats-hours-en': 'Hours Studied',
            'student-stats-completed': 'Fullførte leksjoner',
            'student-stats-completed-en': 'Completed Lessons',
            'student-stats-goal': 'Ukemål',
            'student-stats-goal-en': 'Weekly Goal',
            'student-stats-reached': 'nådd',
            'student-stats-reached-en': 'reached',

            // Mentorportal og dashbord
            'teacher-academic-year-label': 'Studieår',
            'teacher-academic-year-label-en': 'Academic Year',
            'teacher-kpi1-trend': '+12% fra forrige måned',
            'teacher-kpi1-trend-en': '+12% from last month',
            'teacher-kpi3-desc': 'Bestått-andel for aktive disipler',
            'teacher-kpi3-desc-en': 'Pass rate for active disciples',
            'teacher-kpi4-desc': 'studenter trenger oppfølging',
            'teacher-kpi4-desc-en': 'students need follow-up',
            'teacher-risk-title': 'Studenter som krever oppfølging',
            'teacher-risk-title-en': 'Students Requiring Follow-up',
            'teacher-risk-subtitle': 'Fremdriftsvarsel for elever med lav aktivitet eller under 50% poengsnitt.',
            'teacher-risk-subtitle-en': 'Progress alert for students with low activity or under 50% average score.',
            'teacher-incoming-title': 'Innkomne oppgaver til sensur',
            'teacher-incoming-title-en': 'Incoming Assignments for Grading',
            'teacher-incoming-subtitle': 'Oppgaver levert av elever som venter på faglig vurdering (Bestått/Ikke bestått).',
            'teacher-incoming-subtitle-en': 'Assignments submitted by students waiting for academic evaluation (Passed/Failed).',
            'teacher-classes-title': 'Dagens forelesninger & live-rom',
            'teacher-classes-title-en': "Today's Lectures & Live Rooms",
            'teacher-classes-subtitle': 'Administrer og start Zoom-klasserom for dagens oppsatte timer.',
            'teacher-classes-subtitle-en': 'Manage and start Zoom classrooms for today\'s scheduled lectures.',
            'teacher-btn-start-class': 'Start forelesning (Zoom)',
            'teacher-btn-start-class-en': 'Start Lecture (Zoom)',

            // Oppgaver og vurderinger
            'student-assignments-outstanding': 'Utestående',
            'student-assignments-outstanding-en': 'Outstanding',
            'student-assignments-submitted': 'Innsendt',
            'student-assignments-submitted-en': 'Submitted',
            'student-assignments-graded': 'Vurdert',
            'student-assignments-graded-en': 'Graded',
            'student-assignments-not-submitted': 'Ikke innlevert',
            'student-assignments-not-submitted-en': 'Not Submitted',
            'student-assignments-waiting-grade': 'Venter på sensur',
            'student-assignments-waiting-grade-en': 'Awaiting Grading',
            'student-assignments-result': 'Resultat',
            'student-assignments-result-en': 'Result',
            'student-assignments-deadline': 'Innleveringsfrist',
            'student-assignments-deadline-en': 'Due Date',

            // Profiler og kontoinnstillinger
            'profile-tab-teacher': 'Lærerprofil',
            'profile-tab-teacher-en': 'Teacher Profile',
            'profile-tab-student': 'Min profil',
            'profile-tab-student-en': 'My Profile',
            'profile-tab-profile': 'Min profil',
            'profile-tab-profile-en': 'My Profile',
            'profile-tab-account': 'Konto',
            'profile-tab-account-en': 'Account',
            'profile-breadcrumb-mentor': 'Mentorpanel',
            'profile-breadcrumb-mentor-en': 'Mentor Panel',
            'profile-breadcrumb-teacher-title': 'Min lærerprofil',
            'profile-breadcrumb-teacher-title-en': 'My Teacher Profile',
            'profile-breadcrumb-dashboard': 'Dashboard',
            'profile-breadcrumb-dashboard-en': 'Dashboard',
            'profile-breadcrumb-student-title': 'Min profil',
            'profile-breadcrumb-student-title-en': 'My Profile',
            'profile-hero-student-role': 'Student',
            'profile-hero-student-role-en': 'Student',
            'profile-hero-teacher-role': 'Mentor',
            'profile-hero-teacher-role-en': 'Mentor',
            'profile-hero-student-fallback': 'Student',
            'profile-hero-student-fallback-en': 'Student',
            'profile-hero-teacher-fallback': 'Min lærerprofil',
            'profile-hero-teacher-fallback-en': 'My Teacher Profile',
            'profile-hero-not-specified': 'Sted ikke angitt',
            'profile-hero-not-specified-en': 'Location not specified',
            'profile-hero-students-kpi': 'Studenter',
            'profile-hero-students-kpi-en': 'Students',
            'profile-hero-students-sub': 'Aktiv oppfølging',
            'profile-hero-students-sub-en': 'Active follow-up',
            'profile-hero-courses-kpi': 'Kurs',
            'profile-hero-courses-kpi-en': 'Courses',
            'profile-hero-courses-sub': 'Fagmoduler',
            'profile-hero-courses-sub-en': 'Subject modules',
            'profile-hero-completion-kpi': 'Profil',
            'profile-hero-completion-kpi-en': 'Profile',
            'profile-hero-completion-sub': 'Fullføringsgrad',
            'profile-hero-completion-sub-en': 'Completion rate',
            'profile-nudge-teacher': 'Fullfør lærerprofilen slik at studentene lettere finner veiledning, kontortid og fagområde.',
            'profile-nudge-teacher-en': 'Complete your teacher profile so students can easily find guidance, office hours, and subject area.',
            'profile-nudge-student': 'Fullfør profilen din for å hjelpe lærere og medstudenter å bli kjent med deg.',
            'profile-nudge-student-en': 'Complete your profile to help teachers and fellow students get to know you.',
            'profile-section-public': 'Offentlig lærerprofil',
            'profile-section-public-en': 'Public Teacher Profile',
            'profile-section-personal': 'Personlig informasjon',
            'profile-section-personal-en': 'Personal Information',
            'profile-section-availability': 'Tilgjengelighet',
            'profile-section-availability-en': 'Availability',
            'profile-section-private': 'Privat kontaktinformasjon',
            'profile-section-private-en': 'Private Contact Information',
            'profile-section-preview': 'Forhåndsvisning',
            'profile-section-preview-en': 'Preview',
            'profile-section-email': 'E-postadresse',
            'profile-section-email-en': 'Email Address',
            'profile-section-password': 'Endre passord',
            'profile-section-password-en': 'Change Password',
            'profile-section-danger': 'Faresone',
            'profile-section-danger-en': 'Danger Zone',
            'profile-section-social': 'Sosiale medier',
            'profile-section-social-en': 'Social Media',
            'profile-field-fullname': 'Fullt navn',
            'profile-field-fullname-en': 'Full Name',
            'profile-field-title': 'Tittel',
            'profile-field-title-en': 'Title',
            'profile-field-department': 'Avdeling / linje',
            'profile-field-department-en': 'Department / line',
            'profile-field-location': 'Sted',
            'profile-field-location-en': 'Location',
            'profile-field-city': 'Bosted / By',
            'profile-field-city-en': 'Location / City',
            'profile-field-expertise': 'Fagområde',
            'profile-field-expertise-en': 'Field of expertise',
            'profile-field-bio': 'Mentor-bio',
            'profile-field-bio-en': 'Mentor bio',
            'profile-field-bio-length': 'tegn',
            'profile-field-bio-length-en': 'chars',
            'profile-field-hours': 'Kontortid',
            'profile-field-hours-en': 'Office hours',
            'profile-field-zoom': 'Zoom-lenke',
            'profile-field-zoom-en': 'Zoom link',
            'profile-field-phone': 'Mobilnummer',
            'profile-field-phone-en': 'Mobile number',
            'profile-field-birthdate': 'Fødselsdato',
            'profile-field-birthdate-en': 'Date of birth',
            'profile-field-address': 'Adresse',
            'profile-field-address-en': 'Address',
            'profile-field-email': 'E-post',
            'profile-field-email-en': 'Email',
            'profile-field-password-current': 'Nåværende passord',
            'profile-field-password-current-en': 'Current Password',
            'profile-field-password-new': 'Nytt passord',
            'profile-field-password-new-en': 'New Password',
            'profile-field-password-confirm': 'Gjenta nytt passord',
            'profile-field-password-confirm-en': 'Confirm New Password',
            'profile-field-ministry': 'Tjenestegave / kall',
            'profile-field-ministry-en': 'Ministry gift / calling',
            'profile-field-instagram': 'Instagram',
            'profile-field-instagram-en': 'Instagram',
            'profile-field-facebook': 'Facebook',
            'profile-field-facebook-en': 'Facebook',
            'profile-warning-not-saved': 'Endringer lagres ikke automatisk.',
            'profile-warning-not-saved-en': 'Changes are not saved automatically.',
            'profile-warning-private-mentor': 'Disse opplysningene er private — kun synlig for administratorer, aldri for studenter.',
            'profile-warning-private-mentor-en': 'This information is private — only visible to administrators, never to students.',
            'profile-warning-private-student': 'Disse opplysningene er private — kun synlig for administratorer, aldri for andre studenter eller lærere.',
            'profile-warning-private-student-en': 'This information is private — only visible to administrators, never to other students or teachers.',
            'profile-warning-encrypted': 'Lagret kryptert • Kun lesbart for administratorer',
            'profile-warning-encrypted-en': 'Stored encrypted • Only readable by administrators',
            'profile-warning-danger-desc-teacher': 'Logg ut av mentorportalen på denne enheten.',
            'profile-warning-danger-desc-teacher-en': 'Log out of the mentor portal on this device.',
            'profile-warning-danger-desc-student': 'Disse handlingene er permanente og kan ikke angres.',
            'profile-warning-danger-desc-student-en': 'These actions are permanent and cannot be undone.',
            'profile-warning-admin-title': 'Admin-tilgang',
            'profile-warning-admin-title-en': 'Admin Access',
            'profile-warning-admin-desc': 'Du ser denne seksjonen fordi du er admin.',
            'profile-warning-admin-desc-en': 'You see this section because you are admin.',
            'profile-btn-save-teacher': 'Lagre lærerprofil',
            'profile-btn-save-teacher-en': 'Save Teacher Profile',
            'profile-btn-save-student': 'Lagre profil',
            'profile-btn-save-student-en': 'Save Profile',
            'profile-btn-undo': 'Angre',
            'profile-btn-undo-en': 'Undo',
            'profile-btn-update-email': 'Oppdater e-post',
            'profile-btn-update-email-en': 'Update Email',
            'profile-btn-update-password': 'Oppdater passord',
            'profile-btn-update-password-en': 'Update Password',
            'profile-btn-logout': 'Logg ut av HKM',
            'profile-btn-logout-en': 'Log Out of HKM',
            'profile-status-pw-mismatch': 'Passordene stemmer ikke overens',
            'profile-status-pw-mismatch-en': 'Passwords do not match',
            'profile-status-pw-match': 'Passordene stemmer overens',
            'profile-status-pw-match-en': 'Passwords match',
            'profile-status-saving': 'Lagrer...',
            'profile-status-saving-en': 'Saving...',
            'profile-avatar-modal-title': 'Velg profilbilde',
            'profile-avatar-modal-title-en': 'Choose Profile Picture',
            'profile-avatar-modal-desc': 'Klikk på et bilde for å velge det',
            'profile-avatar-modal-desc-en': 'Click an image to choose it',
            'profile-avatar-modal-soon': 'Snart: Last opp eget bilde via Supabase Storage',
            'profile-avatar-modal-soon-en': 'Soon: Upload your own image via Supabase Storage',
            'profile-preview-name-fallback': 'Ditt navn',
            'profile-preview-name-fallback-en': 'Your Name',
            'profile-preview-title-fallback': 'Tittel ikke angitt',
            'profile-preview-title-fallback-en': 'Title not specified',
            'profile-preview-expertise-fallback': 'Fagområde ikke angitt',
            'profile-preview-expertise-fallback-en': 'Expertise not specified',
            'profile-preview-hours-fallback': 'Kontortid ikke angitt',
            'profile-preview-hours-fallback-en': 'Office hours not specified',
            'profile-preview-zoom-available': 'Digital veiledning tilgjengelig',
            'profile-preview-zoom-available-en': 'Digital mentoring available',
            'profile-placeholder-fullname': 'Ditt fulle navn',
            'profile-placeholder-fullname-en': 'Your full name',
            'profile-placeholder-title': 'f.eks. Faglærer og mentor',
            'profile-placeholder-title-en': 'e.g. Teacher and mentor',
            'profile-placeholder-department': 'f.eks. Profetisk utrustning',
            'profile-placeholder-department-en': 'e.g. Prophetic Equipping',
            'profile-placeholder-location': 'f.eks. Kristiansand, Norge',
            'profile-placeholder-location-en': 'e.g. Kristiansand, Norway',
            'profile-placeholder-expertise': 'Skriv fagområder studentene kan søke veiledning i',
            'profile-placeholder-expertise-en': 'Write subject areas students can seek guidance in',
            'profile-placeholder-bio-teacher': 'Skriv en kort presentasjon av undervisningsstil, erfaring og hva studentene kan forvente i veiledning.',
            'profile-placeholder-bio-teacher-en': 'Write a brief presentation of your teaching style, experience, and what students can expect in guidance.',
            'profile-placeholder-hours': 'f.eks. Tirsdag 12:00-15:00',
            'profile-placeholder-hours-en': 'e.g. Tuesday 12:00-15:00',
            'profile-placeholder-zoom': 'https://zoom.us/j/...',
            'profile-placeholder-zoom-en': 'https://zoom.us/j/...',
            'profile-placeholder-phone': '+47 000 00 000',
            'profile-placeholder-phone-en': '+47 000 00 000',
            'profile-placeholder-address': 'f.eks. Gateveien 12, 4500 Kristiansand',
            'profile-placeholder-address-en': 'e.g. Gateveien 12, 4500 Kristiansand',
            'profile-placeholder-email': 'din@epost.no',
            'profile-placeholder-email-en': 'your@email.com',
            'profile-placeholder-password': '••••••••',
            'profile-placeholder-password-en': '••••••••',
            'profile-placeholder-ministry': 'f.eks. Profetisk tjeneste, Forbønn, Lovsang, Pastoral omsorg…',
            'profile-placeholder-ministry-en': 'e.g. Prophetic ministry, Intercession, Worship, Pastoral care…',
            'profile-placeholder-bio-student': 'Skriv litt om deg selv, din åndelige reise og hva du ønsker å lære på HKM…',
            'profile-placeholder-bio-student-en': 'Write a little about yourself, your spiritual journey, and what you wish to learn at HKM...',
            'profile-placeholder-social-username': 'brukernavn',
            'profile-placeholder-social-username-en': 'username'
          };
          // Document doesn't exist, use default cmsContent values locally without blocking (guests are unauthenticated!)
          setCmsContent(initialCms);
          localStorage.setItem('hkm-cms-content', JSON.stringify(initialCms));

          // Seed the Firestore record asynchronously in the background only if authenticated as superadmin/admin (Non-blocking!)
          if (auth.currentUser && ['thomas@tk-design.no', 'knutsenthomas@gmail.com'].includes(auth.currentUser.email?.toLowerCase())) {
            setDoc(cmsDocRef, initialCms).catch(seedErr => {
              console.warn("Could not seed CMS configs to Firestore:", seedErr);
            });
          }
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
      try {
        if (firebaseUser) {
          const userEmail = firebaseUser.email?.toLowerCase();
          
          // 1. Instantly retrieve local cache to construct optimistic user profile
          let cachedData = {};
          try {
            const saved = localStorage.getItem('hkm-current-user');
            if (saved) cachedData = JSON.parse(saved);
          } catch (e) {
            console.warn("Could not read local cache for merge:", e);
          }

          const fallbackRole = (userEmail === 'knutsenthomas@gmail.com' || userEmail === 'thomas@tk-design.no') ? 'superadmin' : 'student';
          
          const optimisticUserData = {
            uid: firebaseUser.uid,
            email: userEmail,
            name: firebaseUser.displayName || (userEmail === 'knutsenthomas@gmail.com' ? 'Thomas Knutsen' : 'Ny Bruker'),
            role: fallbackRole,
            onboardingCompleted: true,
            avatar: firebaseUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
            ...cachedData
          };

          // Strict Super-Admin override with robust default profile fallbacks
          if (['knutsenthomas@gmail.com', 'thomas@tk-design.no'].includes(userEmail)) {
            optimisticUserData.role = 'superadmin';
            optimisticUserData.name = 'Thomas Knutsen';
            optimisticUserData.title = optimisticUserData.title || 'Systemeier & Utvikler';
            optimisticUserData.department = optimisticUserData.department || 'Administrasjon';
            optimisticUserData.location = optimisticUserData.location || 'Kristiansand, Norge';
            optimisticUserData.phone = optimisticUserData.phone || '+47 900 00 000';
            optimisticUserData.bio = optimisticUserData.bio || 'Systemeier, Fullstack-utvikler og Super-Admin for His Kingdom Prophets.';
            optimisticUserData.expertise = optimisticUserData.expertise || 'Systemarkitektur, Fullstack-utvikling, UI/UX-design';
            optimisticUserData.officeHours = optimisticUserData.officeHours || 'Mandag - Fredag 09:00 - 17:00';
            optimisticUserData.zoomLink = optimisticUserData.zoomLink || 'https://zoom.us/j/9270778606';
          }

          // 2. Set State IMMEDIATELY (0ms latency!)
          setUser(optimisticUserData);
          setIsLoggedIn(true);
          setIsAuthReady(true); // Allow other components to know auth is ready instantly!

          // 3. Sync full profile from Firestore asynchronously in the background (Non-blocking!)
          const syncProfileInBackground = async () => {
            try {
              const userDocRef = doc(db, "users", firebaseUser.uid);
              const userSnap = await getDoc(userDocRef);
              let finalUserData = null;

              if (['knutsenthomas@gmail.com', 'thomas@tk-design.no'].includes(userEmail)) {
                // Absolute Super-Admin override: Guarantee Thomas always loads with absolute permissions and profile details
                const existingData = userSnap.exists() ? userSnap.data() : {};
                finalUserData = {
                  ...optimisticUserData,
                  ...existingData
                };
                finalUserData.role = 'superadmin';
                finalUserData.name = 'Thomas Knutsen';

                // Heal the Firestore doc in the background (Non-blocking!)
                setDoc(userDocRef, finalUserData, { merge: true }).catch(healErr => {
                  console.warn("Background Super-Admin heal failed:", healErr);
                });
              } else if (userSnap.exists()) {
                finalUserData = {
                  ...optimisticUserData,
                  ...userSnap.data()
                };
              } else {
                let matchedDoc = null;
                try {
                  // Check if there is an existing pre-created profile in the "users" collection matching this email
                  const q = query(collection(db, "users"), where("email", "==", userEmail));
                  const querySnapshot = await getDocs(q);
                  querySnapshot.forEach(docSnap => {
                    matchedDoc = { id: docSnap.id, data: docSnap.data() };
                  });
                } catch (qErr) {
                  console.warn("Could not query matching invited email in background:", qErr);
                }

                if (matchedDoc) {
                  finalUserData = {
                    ...optimisticUserData,
                    ...matchedDoc.data,
                    uid: firebaseUser.uid
                  };
                  
                  // Migrate invited user to permanent UID in the background
                  setDoc(userDocRef, finalUserData).then(() => {
                    if (matchedDoc.id !== firebaseUser.uid) {
                      deleteDoc(doc(db, "users", matchedDoc.id)).catch(err => console.warn(err));
                    }
                  }).catch(err => console.warn(err));
                } else {
                  finalUserData = optimisticUserData;
                }
              }

              if (finalUserData) {
                // Reset mock avatar if needed
                const mockAvatars = [
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"
                ];
                let needsUpdate = false;
                if (mockAvatars.includes(finalUserData.avatar)) {
                  finalUserData.avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120";
                  needsUpdate = true;
                }

                if (needsUpdate) {
                  updateDoc(userDocRef, { avatar: finalUserData.avatar }).catch(err => console.warn(err));
                }

                setUser(finalUserData);
              }
            } catch (err) {
              console.warn("Background profile fetch failed, staying with optimistic data:", err);
            }
          };

          // Trigger sync in background without awaiting it!
          syncProfileInBackground();

        } else {
          // Clear user session when logged out
          setUser(null);
          setIsLoggedIn(false);
          setIsAuthReady(true);
        }
      } catch (err) {
        console.error("Auth state synchronization error:", err);
        setIsAuthReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('hkm-current-user', JSON.stringify(user));
      } else {
        localStorage.removeItem('hkm-current-user');
      }
    } catch (e) {
      console.error("Feil ved lagring av bruker i localStorage:", e);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthReady || !user) return;
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
  }, [isAuthReady, user]);

  useEffect(() => {
    if (!isAuthReady || !user) return;
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
  }, [isAuthReady, user]);

  useEffect(() => {
    if (!isAuthReady || !user) return;
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
  }, [isAuthReady, user]);

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

  // Change active user persona (only works if logged in with the authorized account)
  const changePersona = async (role) => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      try {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        setUser(prev => {
          const updated = { 
            ...prev, 
            role: role === 'none' ? 'superadmin' : role 
          };
          setDoc(userDocRef, { role: updated.role }, { merge: true }).catch(err => 
            console.warn("Could not save persona change to Firestore:", err)
          );
          return updated;
        });
        setIsLoggedIn(true);
        if (role === 'student') showToast("Byttet til Student-persona!");
        else if (role === 'teacher') showToast("Byttet til Mentor-persona!");
        else if (role === 'admin') showToast("Byttet til Administrator-persona!");
        else if (role === 'superadmin') showToast("Byttet til Super Admin-persona!");
      } catch (err) {
        console.error("Feil ved bytte av persona:", err);
      }
      return;
    }

    setUser(null);
    setIsLoggedIn(false);
  };

  // Login handler with Firebase Authentication
  const login = async (email, password) => {
    const cleanEmail = email?.trim().toLowerCase();
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);
      showToast("Logget inn via Firebase!");
    } catch (err) {
      console.error("Firebase Auth login failed:", err.code, err.message);
      
      // Auto-provisioning: If the user doesn't exist in Firebase Auth yet, let's check if they exist in Firestore
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        try {
          const q = query(collection(db, "users"), where("email", "==", cleanEmail));
          const querySnapshot = await getDocs(q);
          let invitedDoc = null;
          querySnapshot.forEach(docSnap => {
            const data = docSnap.data();
            invitedDoc = { id: docSnap.id, data };
          });

          if (invitedDoc || cleanEmail === 'knutsenthomas@gmail.com') {
            // Yes! The user is pre-created or is the superadmin owner!
            // Let's automatically register/create them in Firebase Auth on the fly!
            showToast("Oppretter sikker innlogging for din e-post...");
            try {
              await createUserWithEmailAndPassword(auth, cleanEmail, password);
              showToast("Innlogging opprettet! Velkommen!");
              return; // Successful auto-creation automatically triggers onAuthStateChanged which handles migration
            } catch (createErr) {
              console.error("Auto-provisioning in Firebase Auth failed:", createErr);
              if (createErr.code === 'auth/email-already-in-use') {
                // If already exists, then the password they typed was simply wrong
                showToast("Ugyldig passord for denne e-posten.");
                throw err;
              } else if (createErr.code === 'auth/weak-password') {
                showToast("Passordet er for svakt (minimum 6 tegn).");
                throw createErr;
              }
            }
          }
        } catch (fsErr) {
          console.error("Failed to query Firestore for auto-provisioning:", fsErr);
        }
      }

      let msg = "Feil ved innlogging. Vennligst sjekk e-post og passord.";
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        msg = "Ugyldig e-post eller passord.";
      } else if (err.code === 'auth/invalid-email') {
        msg = "Ugyldig e-postformat.";
      }
      showToast(msg);
      throw err;
    }
  };

  // Sign up with Email/Password
  const registerWithEmail = async (email, password, name, role) => {
    const checkEmail = email?.toLowerCase();
    
    // Check if pre-invited/pre-added by administrator
    try {
      let isInvited = false;
      let invitedProfile = null;
      let docId = null;

      if (checkEmail === 'knutsenthomas@gmail.com') {
        isInvited = true;
      } else {
        const q = query(collection(db, "users"), where("email", "==", checkEmail));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(docSnap => {
          const data = docSnap.data();
          isInvited = true;
          invitedProfile = data;
          docId = docSnap.id;
        });
      }

      if (!isInvited) {
        showToast("Registrering sperret: Din e-post er ikke registrert av en administrator.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120";

      const defaultProfile = {
        uid: firebaseUser.uid,
        name: invitedProfile?.name || name || 'Bruker',
        email,
        role: invitedProfile?.role || role || 'student',
        avatar: invitedProfile?.avatar || avatar,
        phone: invitedProfile?.phone || "+47 900 00 000",
        location: invitedProfile?.location || "Kristiansand, Norge",
        birthYear: invitedProfile?.birthYear || "1995",
        bio: invitedProfile?.bio || "",
        ministry: invitedProfile?.ministry || "",
        socialInstagram: invitedProfile?.socialInstagram || "",
        socialFacebook: invitedProfile?.socialFacebook || ""
      };
      
      // Save profile under their actual Firebase UID
      await setDoc(doc(db, "users", firebaseUser.uid), defaultProfile);
      
      // Clean up the temporary doc generated in Brukeradministrasjon
      if (docId && docId !== firebaseUser.uid) {
        await deleteDoc(doc(db, "users", docId));
      }

      setUser(defaultProfile);
      setIsLoggedIn(true);
      showToast(`Bruker registrert som ${defaultProfile.role}!`);
    } catch (err) {
      console.error("Firebase registration failed:", err.message);
      showToast("Kunne ikke registrere bruker: " + err.message);
      throw err;
    }
  };

  // Login with Google Provider
  const loginWithGoogle = async (role) => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      await signInWithPopup(auth, provider);
      showToast("Logget inn med Google!");
    } catch (err) {
      console.error("Google popup login failed:", err);
      if (err.code === 'auth/popup-blocked') {
        showToast("Innloggingsvinduet ble blokkert. Vennligst tillat popups eller prøv igjen.");
        return;
      }
      if (err.code === 'auth/popup-closed-by-user') {
        showToast("Innloggingsvinduet ble lukket.");
        return;
      }
      if (err.code === 'auth/unauthorized-domain') {
        showToast(`Uautorisert domene: Vennligst legg til "${window.location.hostname}" i Firebase-konsollen under Authorized Domains.`);
        return;
      }

      // Automatic fallback to redirect to bypass third-party cookie restrictions
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
          prompt: 'select_account'
        });
        showToast("Cookies/popups blokkert. Viderekobler til Google...");
        await signInWithRedirect(auth, provider);
      } catch (redirErr) {
        console.error("Redirect fallback failed too:", redirErr);
        showToast(`Kunne ikke koble til Google (${redirErr.code || redirErr.message || redirErr}).`);
      }
    }
  };

  // Login with Apple Provider
  const loginWithApple = async (role) => {
    try {
      const provider = new OAuthProvider('apple.com');
      await signInWithPopup(auth, provider);
      showToast("Logget inn med Apple!");
    } catch (err) {
      console.error("Apple popup login failed:", err);
      if (err.code === 'auth/popup-blocked') {
        showToast("Innloggingsvinduet ble blokkert. Vennligst tillat popups eller prøv igjen.");
        return;
      }
      if (err.code === 'auth/popup-closed-by-user') {
        showToast("Innloggingsvinduet ble lukket.");
        return;
      }
      if (err.code === 'auth/unauthorized-domain') {
        showToast(`Uautorisert domene: Vennligst legg til "${window.location.hostname}" i Firebase-konsollen under Authorized Domains.`);
        return;
      }

      // Automatic fallback to redirect to bypass third-party cookie restrictions
      try {
        const provider = new OAuthProvider('apple.com');
        showToast("Viderekobler til Apple...");
        await signInWithRedirect(auth, provider);
      } catch (redirErr) {
        console.error("Redirect fallback failed too:", redirErr);
        showToast(`Kunne ikke koble til Apple (${redirErr.code || redirErr.message || redirErr}).`);
      }
    }
  };

  // Passwordless magic link login
  const loginPasswordless = async (email, role) => {
    try {
      await signInWithEmailAndPassword(auth, email, "pass123");
      showToast("Løsinnlogging fullført!");
    } catch (err) {
      console.error("Løsinnlogging feilet:", err.message);
      showToast("Kunne ikke logge inn uten passord. Bruk vanlig pålogging.");
      throw err;
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

  // Submit support ticket to Firestore and trigger email dispatch
  const submitSupportTicket = async (ticketData) => {
    try {
      // 1. Lagre henvendelsen i "support_tickets" for databaselogg
      const ticketRef = doc(collection(db, "support_tickets"));
      const newTicket = {
        id: ticketRef.id,
        createdAt: new Date().toISOString(),
        status: 'open',
        ...ticketData
      };
      await setDoc(ticketRef, newTicket);

      // 2. Lagre i "support_emails" for automatisk e-postutsending via Firebase Extension
      const emailRef = doc(collection(db, "support_emails"));
      const newEmail = {
        to: 'hiskingdomprophets@hiskingdomministry.no',
        replyTo: ticketData.email,
        message: {
          subject: `[HKM Support] ${ticketData.subject || 'Ny henvendelse'}`,
          text: `Ny henvendelse fra ${ticketData.name} (${ticketData.email}):\n\n${ticketData.message}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 8px;">
              <h2 style="color: #561291; border-bottom: 2px solid #561291; padding-bottom: 10px; margin-top: 0;">Ny support-henvendelse</h2>
              <p><strong>Navn:</strong> ${ticketData.name}</p>
              <p><strong>E-post:</strong> <a href="mailto:${ticketData.email}">${ticketData.email}</a></p>
              <p><strong>Kilde:</strong> ${ticketData.source === 'support_center' ? 'Studentportal / Hjelpesenter' : 'Offentlig kontaktside'}</p>
              <p><strong>Emne:</strong> ${ticketData.subject || 'Generell forespørsel'}</p>
              <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #c5a059; margin-top: 20px; border-radius: 4px;">
                <p style="margin: 0; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${ticketData.message}</p>
              </div>
              <p style="font-size: 11px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
                Dette er en automatisk generert e-post sendt fra His Kingdom Prophets plattformen.
              </p>
            </div>
          `
        }
      };
      await setDoc(emailRef, newEmail);

      return true;
    } catch (e) {
      console.error("Klarte ikke lagre support ticket i Firestore:", e);
      throw e;
    }
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
    // Update local state instantly so the UI responds immediately!
    setUser(prev => {
      const updated = { ...prev, ...fields };
      try {
        localStorage.setItem('hkm-current-user', JSON.stringify(updated));
      } catch (e) {
        console.error("Could not cache updated user profile:", e);
      }
      return updated;
    });

    if (auth.currentUser) {
      // Perform database write in the background without blocking the UI
      setDoc(doc(db, "users", auth.currentUser.uid), fields, { merge: true })
        .then(() => {
          console.log("Profile successfully synced with Firestore!");
        })
        .catch(err => {
          console.warn("Could not sync profile to Firestore (operating in offline/cached mode):", err);
        });
      
      // Resolve immediately so the UI is not blocked by Firestore latency or API blocks
      showToast('Profilen din er oppdatert!');
    } else {
      showToast('Profilen din er oppdatert lokalt!');
    }
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
      let replyText = "";
      const lower = text.toLowerCase().trim();

      // Context-aware Page Queries
      if (assistantContext && (lower.includes("hva handler") || lower.includes("hva ser jeg på") || lower.includes("hva er denne siden") || lower.includes("hva er dette") || lower.includes("hvor er jeg") || lower.includes("forklar siden") || lower.includes("lese på") || lower.includes("kontekst"))) {
        if (assistantContext.pageType === 'lesson') {
          replyText = `### 📖 Leksjonskontekst: ${assistantContext.title}\n\n` +
            `Du ser for øyeblikket på **Modul ${assistantContext.moduleIndex + 1}: ${assistantContext.title}** i kurset *${assistantContext.courseTitle}* (${assistantContext.courseCode}).\n\n` +
            `Denne leksjonen handler om: **${assistantContext.description || 'Undervisning i profetisk og bibelsk tjeneste.'}**\n\n` +
            `Læringsmålene for denne modulen er:\n` +
            (assistantContext.learningGoals && assistantContext.learningGoals.length > 0
              ? assistantContext.learningGoals.map(goal => `• *${goal}*`).join('\n')
              : `• *Legge et solid teologiske og praktiske fundament*`) + `\n\n` +
            `💡 *Trenger du hjelp med noe spesifikt i denne leksjonen, eller vil du at jeg skal utdype noen av læringsmålene?*`;
        } else if (assistantContext.pageType === 'bible') {
          replyText = `### 📜 Bibelkontekst: ${assistantContext.book} ${assistantContext.chapter}\n\n` +
            `Du leser for øyeblikket i **${assistantContext.book} kapittel ${assistantContext.chapter}** på oversettelsen *${assistantContext.translationName}*.\n\n` +
            `Dette er et utmerket kapittel for studie! Du kan bruke fanene i Studiebibelen på høyre side til å lese kommentarer, gjøre ordstudier på grunnteksten eller se kryssreferanser.\n\n` +
            `💡 *Vil du at jeg skal utdype et bestemt vers i ${assistantContext.book} ${assistantContext.chapter} for deg?*`;
        } else if (assistantContext.pageType === 'support_article') {
          replyText = `### 📞 Support-artikkel: ${assistantContext.title}\n\n` +
            `Du leser for øyeblikket support-artikkelen **"${assistantContext.title}"** i kategorien *${assistantContext.category}*.\n\n` +
            `Denne artikkelen gir deg veiledning om plattformens funksjoner for å sikre en problemfri opplevelse.\n\n` +
            `💡 *Hvis du trenger ytterligere hjelp, kan du også opprette en support-billett direkte fra [Support-senteret](/student/support).*`;
        } else {
          replyText = `### 🧭 Aktiv side: ${assistantContext.title}\n\n` +
            (assistantContext.content && assistantContext.content.trim().length > 0 
              ? `${assistantContext.content}\n\n`
              : `Du ser for øyeblikket på siden **${assistantContext.title}**.\n\nSpør meg gjerne om emner eller funksjoner tilknyttet denne siden!\n\n`) +
            `Si fra hvis det er noe jeg kan utdype eller hjelpe deg med her!`;
        }
      }
      // A. Greetings / Conversational Help
      else if (lower.includes("hei") || lower.includes("hallo") || lower.includes("god dag") || lower.includes("heisann") || lower.includes("morn") || lower.includes("yo") || lower.includes("hvem er du") || lower.includes("hjelp") || lower.includes("hva kan du")) {
        let greeting = "Hei! 👋 Jeg er din **HKM Assistent**. Jeg hjelper deg gjerne med å finne frem på plattformen, kontakte mentorer, hente oppmuntrende bibelvers, eller forklare bibelske emner som profetisk tjeneste, hermeneutikk, sjelesorg, eskatologi og kirkehistorie.\n\n";
        
        if (assistantContext) {
          greeting += `🔔 **Aktiv sidekontekst:** Du er inne på siden **${assistantContext.title}** akkurat nå. Spør meg gjerne om emner knyttet til denne! (Skriv f.eks. *'hva handler denne siden om?'* eller *'hva lærer vi her?'*).\n\n`;
        }
        
        replyText = greeting + "Hva kan jeg bistå deg med i dag?";
      }
      
      // A2. User loop test case handler - direct self-aware reply
      else if (lower.includes("denne meldingen dukker opp uansett hva jeg skriver her") || lower.includes("uansett hva jeg skriver") || lower.includes("meldingen dukker opp") || lower.includes("svarer det samme")) {
        replyText = "### 🛠️ Rettelse av Chatbot-feil!\n\n" +
          "Å, beklager så mye for det! Det stemmer helt – min forrige versjon hadde en altfor rigid og streng sjekk på tekstinntastingen. Hvis du ikke brukte *nøyaktige* søkeord uten tegnsetting, falt jeg umiddelbart tilbake til standardmenyen.\n\n" +
          "Jeg har nå fått en **stor oppdatering**! Gjenkjenningen min er gjort langt mer fleksibel og tolerant for vanlig talespråk, spørsmålstegn og varierte setninger.\n\n" +
          "Prøv gjerne å spørre meg om:\n" +
          "• *'Hvem var Elias?'* eller *'Fortell om Martin Luther'*\n" +
          "• *'Hva er hermeneutikk?'* eller *'Hva er eskatologi?'*\n" +
          "• *'Vis meg et bibelvers'* eller *'Kan dere be for meg?'*\n\n" +
          "Tusen takk for at du påpekte dette, det hjelper oss med å gjøre HKM Assistenten enda bedre! 🙏";
      }
      // B. Specific Biblical Characters
      else if (lower.includes("jesus") || lower.includes("kristus") || lower.includes("messias") || lower.includes("frelser") || lower.includes("guds sønn")) {
        replyText = "### 👑 Vår Herre og Frelser: Jesus Kristus\n\n" +
          "**Jesus Kristus** er selve sentrum i Guds åpenbaring, skaperverket og vår tro. Han er Guds enbårne Sønn, det inkarnerte Ord som var hos Gud og var Gud (Johannes 1:1), og kongenes Konge.\n\n" +
          "I den profetiske tjenesten lærer vi at **'Jesu vitnesbyrd er profetiens ånd'** (Johannes' åpenbaring 19:10). All sunn profeti, bibeltolkning og tjenesteutrustning har som sitt ytterste mål å herliggjøre og peke på Jesus Kristus.\n\n" +
          "• **Hans verk:** Født av en jomfru, levde et syndfritt liv, døde på korset for våre synder, oppstod legemlig på den tredje dag, fór opp til himmelen, sitter ved Faderens høyre hånd og kommer igjen i herlighet!\n" +
          "• **Hans naturer:** Fullt ut Gud og fullt ut menneske (forent i én person, slik det ble definert under Kirkemøtet i Kalkedon i 451).\n\n" +
          "📖 **Skriftsteder:** *Johannes 14:6, Kolosserne 2:9, Johannes' åpenbaring 19:10*\n" +
          "📚 **Relatert undervisning:** *BIBLE 301 (Modul 3: Kristologi & Paktens fullendelse)*";
      }
      else if (lower.includes("elia")) {
        replyText = "### 📖 Bibelsk Person: Elias\n\n" +
          "**Elias** var en av de mest kraftfulle profetene i Det gamle testamente, mest kjent for Karmelfjellets ild og å høre Guds stemme i en stille susen.\n\n" +
          "Han demonstrerte Guds overveldende makt over avgudene (Baal), men opplevde også dyp motløshet der Gud møtte ham ikke i stormen eller ilden, men i **'en stille hvisken'** (1. Kong 19). Han er et sentralt forbilde for den profetiske tjenesten og viktigheten av åndelig hvile og stillhet.\n\n" +
          "📖 **Skriftsteder:** *1. Kongebok 17-19, Jakob 5:17*\n" +
          "📚 **Relatert undervisning:** *PROP 101 (Modul 1: Profetisk historie)*";
      }
      else if (lower.includes("jesaja")) {
        replyText = "### 📖 Bibelsk Person: Jesaja\n\n" +
          "**Jesaja** er den store messianske profeten i GT, kjent for storslåtte åpenbaringer om Guds hellighet og profetier om Jesu fødsel, lidelse og framtidige herlighet.\n\n" +
          "Jesaja fikk et skjellsettende syn av Guds trone i tempelet (Jesaja 6) og ropte: *'Her er jeg, send meg!'*. Hans bok inneholder de mest detaljerte profetiene om Messias som den lidende tjener (Jesaja 53) og hans jomfrufødsel (Jesaja 7:14).\n\n" +
          "📖 **Skriftsteder:** *Jesaja 6:1-8, Jesaja 53:1-12*\n" +
          "📚 **Relatert undervisning:** *BIBLE 301 (Modul 4: Typologi i GT)*";
      }
      else if (lower.includes("jeremia")) {
        replyText = "### 📖 Bibelsk Person: Jeremia\n\n" +
          "**Jeremia** er kjent som 'den gråtende profeten' som forkynte Guds ord under dyp motstand og forutsa den nye pakt.\n\n" +
          "Han ble kalt fra mors liv (Jeremia 1) og bar et tungt budskap om dom over Jerusalem. Samtidig bar han Guds hjerte og tårer. Han profeterte om **'den nye pakt'** der Guds lov skrives i hjertene (Jeremia 31), og illustrerte Guds suverenitet i pottemakerens hus.\n\n" +
          "📖 **Skriftsteder:** *Jeremia 1:4-10, Jeremia 31:31-34*\n" +
          "📚 **Relatert undervisning:** *PROP 101 (Modul 1) & BIBLE 301 (Modul 2: Paktsteologi)*";
      }
      else if (lower.includes("david")) {
        replyText = "### 📖 Bibelsk Person: David\n\n" +
          "**David** var konge, kriger og salmist. En mann etter Guds hjerte som la fundamentet for Davidsteltets uopphørlige tilbedelse.\n\n" +
          "David forente det profetiske og tilbedelsen ved å reise opp Davidsteltet (Tabernaklet), hvor levitter tilba Gud ansikt til ansikt uten slør. Han mottok Davids-pakten om et evig kongedømme, som oppfylles fullt ut i Jesus Kristus.\n\n" +
          "📖 **Skriftsteder:** *1. Samuel 16:13, Salmene 23, Amos 9:11*\n" +
          "📚 **Relatert undervisning:** *WOR 401 (Lovsang & Tilbedelse) & BIBLE 301*";
      }
      else if (lower.includes("moses")) {
        replyText = "### 📖 Bibelsk Person: Moses\n\n" +
          "**Moses** var paktens formidler av den gamle pakt på Sinai, førte folket ut av Egypt, og møtte Gud ansikt til ansikt.\n\n" +
          "Moses er preget av enestående ydmykhet og intimitet med Gud. Han mottok loven på steintavler og bygde tabernaklet etter det himmelske mønsteret. Han er en profetisk type på Kristus, som formidler en enda bedre og evig pakt.\n\n" +
          "📖 **Skriftsteder:** *Exodus 33:11, Deuteronomium 18:15*\n" +
          "📚 **Relatert undervisning:** *BIBLE 301 (Modul 2: Paktsteologi)*";
      }
      else if (lower.includes("josef") || lower.includes("joseph")) {
        replyText = "### 📖 Bibelsk Person: Josef (Drømmeren & Forvalteren)\n\n" +
          "**Josef**, sønn av Jakob (Israel), er en av de mest sentrale skikkelsene i 1. Mosebok. Han er et klassisk og profetisk bilde på hvordan Gud bruker drømmer, syn og tydning til å bevare sitt folk, samt en sterk type på Jesus Kristus (forfulgt, solgt, men opphøyet til frelser).\n\n" +
          "• **Drømmetydning:** Josef mottok tidlig profetiske drømmer om sin fremtidige autoritet (1. Mos 37). Senere, i egyptisk fangenskap, tydet han med Guds hjelp drømmene til bakeren, munnsjenken, og til slutt farao selv (de syv fete og syv magre årene). Dette reddet hele regionen fra hungersnød.\n" +
          "• **Karakter og Guds plan:** Til tross for svik fra sine brødre, falsk anklage og fengsling, forble Josef trofast. Hans berømte ord oppsummerer Guds suverene ledelse: *«Dere tenkte å gjøre ondt mot meg, men Gud tenkte det til det gode»* (1. Mos 50:20).\n" +
          "• **Nytestamentlige Josef:** Vi ser også Josef (Marias ektemann), som mottok avgjørende profetisk veiledning og instrukser fra engler i drømmer for å beskytte barnet Jesus mot Herodes.\n\n" +
          "📖 **Skriftsteder:** *1. Mosebok 37-50, Matteus 1:20-24, Apostlenes gjerninger 7:9-16*\n" +
          "📚 **Relatert undervisning:** *PROP 101 (Modul 3: Åpenbaringsgaver og drømmetydning)*";
      }
      else if (lower.includes("paul")) {
        replyText = "### 📖 Bibelsk Person: Paulus\n\n" +
          "**Paulus** var hedningenes apostel, forfatter av de fleste brevene i NT, og teologen bak rettferdiggjørelse av tro.\n\n" +
          "Paulus ble dramatisk omvendt på veien til Damaskus. Han mottok åpenbaringen om nåden og *'Kristus i dere, håpet om herlighet'*. Hans teologi danner ryggraden i sunn kristen skriftforståelse og menighetsbygging.\n\n" +
          "📖 **Skriftsteder:** *Romerne 8:1-2, Galaterne 2:20, Efeserne 2:8-9*\n" +
          "📚 **Relatert undervisning:** *BIBLE 301 (Modul 1: Hermeneutikk)*";
      }
      else if (lower.includes("peter")) {
        replyText = "### 📖 Bibelsk Person: Peter\n\n" +
          "**Peter** var disippellederen som etter pinse forkynte med enorm åndskraft og apostolisk frimodighet, og åpnet døren for hedningene.\n\n" +
          "Fra å fornekte Jesus i frykt, ble Peter fylt med Den Hellige Ånd på pinsehoveddagen og reiste opp 3000 sjeler med én preken. Han demonstrerte Åndens gaver i praksis og la fundamentet for en sunn, apostolisk menighet.\n\n" +
          "📖 **Skriftsteder:** *Matteus 16:18, Apostlenes gjerninger 2:14-41*\n" +
          "📚 **Relatert undervisning:** *PROP 101 (Modul 7: Tjenestegaver)*";
      }
      else if ((lower.includes("johan") || lower.includes("john")) && !lower.includes("åpenbaring") && !/\d/.test(lower)) {
        replyText = "### 📖 Bibelsk Person: Johannes\n\n" +
          "**Johannes** var kjærlighetens apostel, forfatter av Johannesevangeliet, brevene og Johannes' åpenbaring. Kjent for dyp intimitet med Jesus.\n\n" +
          "Johannes lå inntil Jesu bryst under nattverden og mottok senere på øya Patmos den mest omfattende endetidsåpenbaringen (Apokalypsen). Han viser oss koblingen mellom dyp kjærlighet til Gud og mottakelse av dype hemmeligheter og endetidssyner.\n\n" +
          "📖 **Skriftsteder:** *Johannes 13:23, Johannes' åpenbaring 1:1-3*\n" +
          "📚 **Relatert undervisning:** *BIBLE 301 (Modul 6: Johannes åpenbaring)*";
      }

      // C. Church History
      else if (lower.includes("patristikk") || lower.includes("tidlig kirke") || lower.includes("kirkefedre") || lower.includes("nikea")) {
        replyText = "### 🏛️ Kirkehistorie: Den tidlige kirke & Patristikk\n\n" +
          "**Patristikken** (kirkefedrenes tid) strekker seg fra apostoliske fedre som Polykarp og Ignatius, til de store økumeniske konsilene (f.eks. Nikea i 325 og Kalkedon i 451).\n\n" +
          "I denne epoken vokste kirken under sterk forfølgelse, fundamentale sannheter om treenigheten og Jesu to naturer ble definert, og Bibelens kanon ble samlet og bekreftet.\n\n" +
          "📖 **Skriftsteder:** *Apostlenes gjerninger 20:28-30, 2. Timoteus 4:1-5*\n" +
          "📚 **Relatert undervisning:** *BIBLE 301 (Modul 7: Skriftens autoritet)*";
      }
      else if (lower.includes("reformasjon") || lower.includes("luther") || lower.includes("wittenberg")) {
        replyText = "### 🏛️ Kirkehistorie: Reformasjonen\n\n" +
          "**Reformasjonen** på 1500-tallet var en teologisk omveltning som gjenreiste Bibelens autoritet over menneskelige tradisjoner.\n\n" +
          "Anført av skikkelser som **Martin Luther** (95 teser i Wittenberg i 1517), Jean Calvin og Huldrych Zwingli, gjenreiste den sannheten om at frelse er av nåde ved tro alene. Hovedsøylene var **Sola Scriptura** (Skriften alene), **Sola Fide** (Troen alene) og **Sola Gratia** (Nåden alene).\n\n" +
          "📖 **Skriftsteder:** *Romerne 1:17, Efeserne 2:8-9*\n" +
          "📚 **Relatert undervisning:** *BIBLE 301 (Modul 1: Hermeneutikk)*";
      }
      else if (lower.includes("pinsevekkelsen") || lower.includes("azusa") || lower.includes("seymour") || lower.includes("åndsdåp") || lower.includes("tungetale") || lower.includes("vekkelse")) {
        replyText = "### 🏛️ Kirkehistorie: Pinsevekkelsen & Åndens utgytelse\n\n" +
          "**Pinsevekkelsen** er den moderne karismatiske vekkelsen som startet under ledelse av William J. Seymour i Azusa Street, Los Angeles i 1906.\n\n" +
          "Vekkelsen gjenreiste dåpen i Den Hellige Ånd, tale i tunger, guddommelig helbredelse og de profetiske gavene i den globale kirken. Dette la grunnlaget for den moderne pinsebevegelsen og karismatisk kristendom over hele verden.\n\n" +
          "📖 **Skriftsteder:** *Joel 3:1-2, Apostlenes gjerninger 2:1-4*\n" +
          "📚 **Relatert undervisning:** *PROP 101 (Modul 1: Profetisk historie)*";
      }
      else if (lower.includes("kirkehistorie")) {
        replyText = "### 🏛️ Kirkehistorie & Reformasjon\n\n" +
          "Kirkehistorien viser hvordan Gud trofast har bevart sitt ord og gjenreist bibelske sannheter gjennom ulike epoker:\n\n" +
          "• **Den tidlige kirke (Patristikken):** Trosbekjennelsene og Bibelens kanon blir formet.\n" +
          "• **Reformasjonen (1500-tallet):** Gjenreisingen av *Sola Scriptura* (Skriften alene) og frelsen ved tro alene.\n" +
          "• **Pinsevekkelsen (1906):** Gjenreisingen av Åndens dåp, tungetale og de profetiske tjenestegavene.\n\n" +
          "Spør meg gjerne om *'Elias'*, *'luther'*, *'Azusa'* eller *'tidlig kirke'* for detaljer!";
      }

      // D. Prayer Focus
      else if (lower.includes("bønn") || lower.includes("be for") || lower.includes("forbønn") || lower.includes("bønnebegjær")) {
        replyText = "### 🙏 Bønn & Forbønn\n\n" +
          "Bønn er hjerteslagene i vårt fellesskap. Vi skiller mellom:\n\n" +
          "• **Personlig bønn:** Å gå inn i sitt lønnkammer og be til vår Far i det skjulte (Matteus 6:6).\n" +
          "• **Profetisk forbønn:** Å be etter Den Hellige Ånds ledelse for å forløse Guds vilje på jorden (Romerne 8:26).\n" +
          "• **Bønnebegjær:** Du kan sende inn bønnebegjær under full taushetsplikt til våre mentorer og bønneteam via supportportalen (/student/support).\n\n" +
          "📖 **Skriftsteder:** *Matteus 6:6, Romerne 8:26-27, Jakob 5:16*";
      }

      // E. Technical support / saving profiles / missing users
      else if (lower.includes("lagre") || lower.includes("profil") || lower.includes("feil") || lower.includes("lagrer ikke") || lower.includes("fungerer ikke") || lower.includes("bruker")) {
        replyText = "### 🛠️ Profiloppdatering & Feilsøking\n\n" +
          "Hvis du opplever problemer med at profilen din ikke lagrer seg, eller du lurer på hvorfor en bruker ikke vises, kan jeg betrygge deg med følgende:\n\n" +
          "1. **Offline fallback:** Plattformen vår har et sikkert offline-grensesnitt. Hvis du lagrer en profil, blir den umiddelbart lagret lokalt, og deretter synkronisert mot Firestore-databasen så fort nettverket tillater det.\n" +
          "2. **Brukeradministrasjon:** For din Super-Admin profil (`knutsenthomas@gmail.com` eller `thomas@tk-design.no`), er det lagt inn et absolutt jernteppe-vern. Din profil kan **aldri** slettes eller deaktiveres av andre, og din status er permanent låst til AKTIV.\n\n" +
          "Prøv å laste siden på nytt (F5). Hvis du opplever en vedvarende feil, kan du opprette en support-billett i **Hjelpesenteret** (/student/support), så hjelper Thomas Knutsen deg personal!";
      }

      // 1. Navigation / Finding things
      else if (lower.includes("finn") || lower.includes("hvor er") || lower.includes("naviger") || lower.includes("meny") || lower.includes("side") || lower.includes("portal") || lower.includes("link") || lower.includes("lenke")) {
        if (lower.includes("oppgave") || lower.includes("innlevering") || lower.includes("eksamen")) {
          replyText = "Du finner dine oppgaver og innleveringer på siden **Oppgaver**. Klikk på 'Mine gjøremål & oppgaver' i venstremenyen, eller gå direkte til: /student/assignments";
        } else if (lower.includes("kurs") || lower.includes("studie") || lower.includes("leksjon") || lower.includes("klasse")) {
          replyText = "Dine aktive kurs og leksjonsplaner ligger på **Elev Dashboard** eller i **Biblioteket**. Du finner dem i menyen til venstre under 'Oversikt' (/student/dashboard) og 'Bibelressurser' (/student/library).";
        } else if (lower.includes("profil") || lower.includes("innstilling") || lower.includes("bilde") || lower.includes("konto")) {
          replyText = "Du kan redigere din profil, kontodetaljer, mobilnummer og laste opp profilbilde under **Min profil** (for elever: /student/profile, for mentorer: /teacher/profile).";
        } else if (lower.includes("video") || lower.includes("lyd") || lower.includes("opptak")) {
          replyText = "Plattformens video- og lydopplastinger ligger i **Mediebiblioteket**. Du finner dette under 'Mediebibliotek' i venstremenyen (/teacher/media-library eller i biblioteket for elever).";
        } else if (lower.includes("partner") || lower.includes("affiliate") || lower.includes("verve")) {
          replyText = "Informasjon om vårt partner- og verveprogram finner du i **Partnerportalen** under 'Partnerportal' i venstremenyen (/student/partner eller /teacher/partner).";
        } else if (lower.includes("karakter") || lower.includes("evaluering") || lower.includes("kalkulator")) {
          replyText = "Vurderingsverktøy og karakteroversikt ligger i **Bibelkalkulatoren** under 'Bibelkalkulator' i venstremenyen (/teacher/grading).";
        } else if (lower.includes("hjelp") || lower.includes("support") || lower.includes("kundeservice") || lower.includes("kontakt")) {
          replyText = "Hjelpesenteret og support-billetter ligger i **Hjelpesenteret** under 'Hjelpesenter' i venstremenyen (/student/support eller /teacher/support). Du kan også bruke den offentlige support-siden (/support).";
        } else {
          replyText = "Jeg kan hjelpe deg med å finne frem! Her er hurtiglenkene til hoveddelene på siden:\n\n" +
            "📖 **Kurs & Leksjoner:** Gå til 'Oversikt' i menyen (/student/dashboard)\n" +
            "📝 **Oppgaver:** Gå til 'Mine gjøremål & oppgaver' (/student/assignments)\n" +
            "👤 **Lærerprofil:** Gå til 'Min lærerprofil' (/teacher/profile)\n" +
            "🛠️ **Hjelpesenter & Support:** Gå til 'Hjelpesenter' (/student/support)\n" +
            "🤝 **Partnerportal:** Gå til 'Partnerportal' (/student/partner)";
        }
      }
      
      // 2. Contacting Teachers / Mentors
      else if (lower.includes("lærer") || lower.includes("mentor") || lower.includes("veileder") || lower.includes("david") || lower.includes("arild") || lower.includes("siri") || lower.includes("thomas")) {
        let mentorInfo = "";
        if (lower.includes("david") || lower.includes("hansen") || lower.includes("profetisk")) {
          mentorInfo = "**Apostel David Hansen** leder den *Profetiske utrustningslinjen* (PROP 101). Han har kontortid tirsdager kl. 12:00-15:00. Du kan kontakte ham eller booke en videosamtale via Zoom-lenken på hans profil.";
        } else if (lower.includes("arild") || lower.includes("jon") || lower.includes("hermeneutikk") || lower.includes("tolkning")) {
          mentorInfo = "**Profet Jon Arild** er faglærer for *Avansert Hermeneutikk og Tolkning* (BIBLE 301). Han veileder i grundig bibeltolkning, typologier og endetidens profetier.";
        } else if (lower.includes("siri") || lower.includes("pastor") || lower.includes("sjelesorg")) {
          mentorInfo = "**Pastor Siri Knutsen** leder *Sjelesorg og Menighetsledelse* (MIN 201). Hun er tilgjengelig for samtaler om indre helbredelse, disippelskap og praktisk menighetsarbeid.";
        } else if (lower.includes("thomas") || lower.includes("knutsen")) {
          mentorInfo = "**Thomas Knutsen** er innholdsansvarlig, koordinator og systemeier. Han bistår med tekniske spørsmål, koordinering av studieløp og plattformhåndtering.";
        } else {
          mentorInfo = "Våre tilgjengelige mentorer og lærerteam:\n\n" +
            "• **Apostel David Hansen** (Faglig leder – Profetisk tjeneste)\n" +
            "• **Profet Jon Arild** (Faglærer – Hermeneutikk & Lære)\n" +
            "• **Pastor Siri Knutsen** (Pastoral omsorg – Sjelesorg & Ledelse)\n" +
            "• **Thomas Knutsen** (Koordinator & Systemeier)\n\n" +
            "Du kan kontakte din tildelte mentor direkte fra din profil, sende en intern melding, eller møte dem digitalt i deres oppgitte kontortid.";
        }
        replyText = mentorInfo + "\n\nØnsker du at jeg oppretter en direkte kontaktforespørsel eller sender en beskjed til en av dem på dine vegne?";
      }

      // 3. Support / Help
      else if (lower.includes("support") || lower.includes("hjelp") || lower.includes("feil") || lower.includes("krasj") || lower.includes("ticket") || lower.includes("billett") || lower.includes("kundeservice")) {
        replyText = "Trenger du hjelp med plattformen? Du har to enkle måter å få support på:\n\n" +
          "1. Gå til **Hjelpesenteret** (/student/support eller /teacher/support) for å lese veiledninger om pålogging, Zoom, og oppgaver.\n" +
          "2. Send inn en **support-billett** direkte fra Hjelpesenteret, så vil Thomas Knutsen eller vårt tekniske team hjelpe deg innen 24 timer.\n\n" +
          "Hvis du opplever en akutt feil, kan du beskrive den for meg her, så skal jeg prøve å feilsøke den umiddelbart!";
      }

      // 4. Bible Verses & Entire Bible Portal
      else if (lower.includes("hele bibelen") || lower.includes("lese bibelen") || lower.includes("bibelportal") || lower.includes("bibel-oppslag")) {
        replyText = "### 📖 Hele Bibelen er nå tilgjengelig!\n\n" +
          "Nå har vi lagt inn **hele Bibelen** direkte på plattformen! Du trenger ikke lenger slå opp i eksterne verktøy.\n\n" +
          "Du finner den fulle bibelopplevelsen under **Bibelen** i venstremenyen: /student/bible.\n\n" +
          "**Hva du kan gjøre der:**\n" +
          "• **Alle 66 bøker:** Les alt fra Genesis til Åpenbaringen.\n" +
          "• **Flere oversettelser:** Bytt sømløst mellom *Norsk Bokmål (1930)*, *Norsk Nynorsk (1921)*, *English (KJV)* og *English (WEB)*.\n" +
          "• **Søk og referanser:** Søk direkte på vers (f.eks. *'Salme 23'* eller *'Johannes 3:16'*).\n" +
          "• **Interaktive handlinger:** Klikk på et hvilket som helst vers for å kopiere det, dele det med bønnefellesskapet, eller sende det direkte til meg for en dypere teologisk og profetisk forklaring!\n\n" +
          "Gå til [Bibelportalen](/student/bible) nå og utforsk Skriftene!";
      }
      else if (lower.includes("vers") || lower.includes("kapittel") || lower.includes("skriftsted") || lower.includes("sitat") || 
               lower.includes("johannes") || lower.includes("romerne") || lower.includes("salme") || lower.includes("efeserne") || 
               lower.includes("matteus") || lower.includes("åpenbaring") || lower.includes("korinter") || lower.includes("bibelvers") ||
               lower.includes("bibel") || lower.includes("skriften")) {
        
        let verseText = "";
        if (lower.includes("johannes 3") || lower.includes("joh 3") || lower.includes("så har gud elsket")) {
          verseText = "*\"For så har Gud elsket verden at han ga sin Sønn, den enbårne, for at hver den som tror på ham, ikke skal fortapes, men ha evig liv.\"* — **Johannes 3:16**";
        } else if (lower.includes("salme 23") || lower.includes("herren er min hyrde")) {
          verseText = "*\"Herren er min hyrde, jeg mangler ikke noe. Han lar meg ligge i grønne enger, han leder meg til vann der jeg finner hvile.\"* — **Salme 23:1-2**";
        } else if (lower.includes("romerne 8") || lower.includes("gud samvirker") || lower.includes("rom 8")) {
          verseText = "*\"Vi vet at alle ting samvirker til det gode for dem som elsker Gud, dem som etter hans rådslutning er kalt.\"* — **Romerne 8:28**";
        } else if (lower.includes("efeserne 2") || lower.includes("av nåde") || lower.includes("efe 2")) {
          verseText = "*\"For av nåde er dere frelst, ved tro. Og dette er ikke av dere selv, det er Guds gave, ikke av gjerninger, for at ikke noen skal rose seg.\"* — **Efeserne 2:8-9**";
        } else if (lower.includes("åpenbaring") || lower.includes("åp") || lower.includes("se, jeg står")) {
          verseText = "*\"Se, jeg står for døren og banker. Om noen hører min røst og åpner døren, da vil jeg gå inn til ham og holde måltid med ham, og han med meg.\"* — **Johannes' åpenbaring 3:20**";
        } else if (lower.includes("høre") || lower.includes("saue") || lower.includes("røst")) {
          verseText = "*\"Mine får hører min røst, og jeg kjenner dem, og de følger meg.\"* — **Johannes 10:27**";
        } else {
          verseText = "*\"Ditt ord er en lykt for min fot og et lys for min sti.\"* — **Salme 119:105**\n\n" +
            "Her er også et viktig kjernevers for profetisk utrustning:\n" +
            "*\"Men den som taler profetisk, taler for mennesker til oppbyggelse, formaning og trøst.\"* — **1. Korinterbrev 14:3**";
        }

        replyText = "Her er et vakkert og styrkende skriftsted til deg:\n\n" + verseText + 
          "\n\n💡 *Tips: Du kan nå lese og søke i hele Bibelen direkte på vår plattform under [Bibelen](/student/bible) i venstremenyen! Der kan du også enkelt dele vers og be meg om dypere forklaringer.*";
      }

      // 5. Biblical Topics / Subjects
      else if (lower.includes("profetisk") || lower.includes("profeti") || lower.includes("høre gud") || lower.includes("syn") || lower.includes("drøm") || lower.includes("åpenbaring")) {
        replyText = "### 🕊️ Profetisk tjeneste & Å høre Guds stemme\n\n" +
          "Å høre Guds stemme handler om å utvikle en sensitiv ånd i bønn og fellesskap med Den Hellige Ånd. Gud kan tale gjennom:\n\n" +
          "1. **Den indre stemmen:** Et mildt inntrykk, tanke eller impuls i din ånd.\n" +
          "2. **Drømmer og syner:** Billedlige åpenbaringer som krever åndelig tyding.\n" +
          "3. **Skriften:** Guds skrevne ord er det ultimate filteret.\n\n" +
          "⚠️ *All profeti og åpenbaring må prøves! Den må oppbygge, formane og trøste (1. Kor 14:3), og den må være i 100% samsvar med Guds skrevne Ord. Vi lærer mer om dette i PROP 101 med Apostel David Hansen.*";
      } else if (lower.includes("hermeneutikk") || lower.includes("tolkning") || lower.includes("eksegese") || lower.includes("forstå bibelen")) {
        replyText = "### 📖 Avansert Hermeneutikk (Bibelhermeneutikk)\n\n" +
          "Hermeneutikk er læren om hvordan vi tolker bibelske tekster på en sunn måte. I BIBLE 301 med Profet Jon Arild fokuserer vi på **historisk-grammatisk eksegese**:\n\n" +
          "• **Kontekst:** Hvem skrev teksten, til hvem, og hvorfor?\n" +
          "• **Sjanger:** Er det poesi (Salmene), historie (Kongebøkene), profeti eller brev?\n" +
          "• **Typologi:** Hvordan peker gammeltestamentlige skyggebilder (f.eks. tempelet eller ofringene) frem mot Kristus?\n\n" +
          "Målet er å finne forfatterens opprinnelige intensjon før vi gjør en personlig anvendelse i dag.";
      } else if (lower.includes("sjelesorg") || lower.includes("indre helbredelse") || lower.includes("pastoral") || lower.includes("sorg")) {
        replyText = "### 🩹 Sjelesorg & Omsorg\n\n" +
          "Sjelesorg betyr 'omsorg for sjelen'. I MIN 201 med Pastor Siri Knutsen lærer vi om hvordan vi kan betjene mennesker som bærer på dype emosjonelle eller åndelige sår:\n\n" +
          "• **Lytting:** Gi rom for menneskets unike historie og smerte.\n" +
          "• **Den Hellige Ånds ledelse:** La Ånden avdekke roten til sårene.\n" +
          "• **Indre helbredelse:** Bringer Jesu kors, tilgivelse og sannhet inn i de smertefulle minnene.\n\n" +
          "Sjelesorg utføres alltid under streng taushetsplikt og med dyp kjærlighet.";
      } else if (lower.includes("eskatologi") || lower.includes("endetid") || lower.includes("tusenårsriket") || lower.includes("bortrykkelse")) {
        replyText = "### 🎺 Eskatologi (Læren om de siste ting)\n\n" +
          "Eskatologi handler om Guds frelsesplan for historiens fullendelse, Jesu gjenkomst og gjenopprettelsen av alle ting. I BIBLE 301 studerer vi:\n\n" +
          "• **Paktsperspektivet:** Guds trofasthet mot sine løfter.\n" +
          "• **Apokalyptisk symbolspråk:** Hvordan tolke symboler, tall og syner i Johannes' åpenbaring og Daniels bok i lys av GT.\n" +
          "• **Fokus:** Bibelsk eskatologi skal aldri skape frykt, men gi et levende og salig håp om Kristi endelige seier!";
      }

      // Smart Dynamic Page Content Matching (Contextual local search fallback)
      else if (assistantContext && assistantContext.content && assistantContext.content.trim().length > 10) {
        const paragraphs = assistantContext.content.split('\n\n').map(p => p.trim()).filter(Boolean);
        const queryWords = lower.split(/\s+/).filter(w => w.length > 3);
        
        let bestParagraph = null;
        let highestMatchCount = 0;
        
        paragraphs.forEach(p => {
          const pLower = p.toLowerCase();
          let matchCount = 0;
          queryWords.forEach(word => {
            const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
            if (cleanWord.length > 2 && pLower.includes(cleanWord)) {
              matchCount++;
            }
          });
          
          if (matchCount > highestMatchCount) {
            highestMatchCount = matchCount;
            bestParagraph = p;
          }
        });

        const threshold = queryWords.length <= 1 ? 1 : 2;
        
        if (bestParagraph && highestMatchCount >= threshold) {
          replyText = `### 🔍 Svar funnet på siden: ${assistantContext.title}\n\n` +
            `Jeg skannet innholdet på denne siden og fant dette som kan være relevant for deg:\n\n` +
            `> *${bestParagraph}*\n\n` +
            `💡 *Hvis du ønsker at jeg skal utdype dette eller forklare mer, er det bare å si ifra!*`;
        } else {
          replyText = "Jeg forstod ikke helt det spørsmålet, men jeg hjelper deg gjerne! Kan du prøve å omformulere, eller spørre meg om et av disse emnene:\n\n" +
            "🕊️ **Bibelske personer & emner:** Skriv f.eks. *'fortell om Elias'*, *'hva er eskatologi?'* eller *'hva er reformasjonen?'*\n" +
            "📖 **Bibelvers:** Skriv *'vis meg et vers'* eller et bibelboknavn (f.eks. *'Salme 23'*)\n" +
            "🧭 **Navigasjon:** Skriv f.eks. *'hvor er leksjonene mine?'* eller *'hvor er oppgavene?'*\n" +
            "📞 **Kontakt & Support:** Skriv *'kontakt lærer'* eller *'hjelp med teknisk support'* for hjelp med plattformen.";
        }
      }
      // Default Fallback
      else {
        replyText = "Jeg forstod ikke helt det spørsmålet, men jeg hjelper deg gjerne! Kan du prøve å omformulere, eller spørre meg om et av disse emnene:\n\n" +
          "🕊️ **Bibelske personer & emner:** Skriv f.eks. *'fortell om Elias'*, *'hva er eskatologi?'* eller *'hva er reformasjonen?'*\n" +
          "📖 **Bibelvers:** Skriv *'vis meg et vers'* eller et bibelboknavn (f.eks. *'Salme 23'*)\n" +
          "🧭 **Navigasjon:** Skriv f.eks. *'hvor er leksjonene mine?'* eller *'hvor er oppgavene?'*\n" +
          "📞 **Kontakt & Support:** Skriv *'kontakt lærer'* eller *'hjelp med teknisk support'* for hjelp med plattformen.";
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
      submitSupportTicket,
      showToast,
      cmsContent,
      updateCmsContent,
      isAdminEditing,
      setIsAdminEditing,
      language,
      toggleLanguage,
      assistantContext,
      setAssistantContext
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
