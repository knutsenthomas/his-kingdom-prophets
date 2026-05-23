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
  deleteDoc
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
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
      'nav.settings.account-en': 'Account Settings'
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
            'nav.settings.account-en': 'Account Settings'
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
        const userEmail = firebaseUser.email?.toLowerCase();
        
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          let userSnap = await getDoc(userDocRef);
          let userData = null;

          if (userSnap.exists()) {
            userData = userSnap.data();
          } else {
            // Check if there is an existing pre-created profile in the "users" collection matching this email
            const querySnapshot = await getDocs(collection(db, "users"));
            let matchedDoc = null;
            querySnapshot.forEach(docSnap => {
              const data = docSnap.data();
              if (data.email?.toLowerCase() === userEmail) {
                matchedDoc = { id: docSnap.id, data };
              }
            });

            if (matchedDoc) {
              // Found a pre-created profile! Let's migrate it to their actual UID!
              userData = {
                ...matchedDoc.data,
                uid: firebaseUser.uid // Set to their actual firebase UID
              };
              await setDoc(userDocRef, userData);
              
              // Clean up the temporary pre-created usr- document
              if (matchedDoc.id !== firebaseUser.uid) {
                try {
                  await deleteDoc(doc(db, "users", matchedDoc.id));
                } catch (delErr) {
                  console.warn("Could not delete temporary pre-created user doc:", delErr);
                }
              }
            } else if (userEmail === 'knutsenthomas@gmail.com') {
              // Owner doesn't have a profile yet, initialize it!
              userData = {
                uid: firebaseUser.uid,
                name: 'Thomas Knutsen',
                email: firebaseUser.email,
                role: 'superadmin',
                avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
                phone: "+47 900 00 000",
                location: "Kristiansand, Norge",
                birthYear: "1995",
                bio: "",
                ministry: "",
                socialInstagram: "",
                socialFacebook: ""
              };
              await setDoc(userDocRef, userData);
            }
          }

          if (userData) {
            let needsUpdate = false;

            // Automatically upgrade superadmins in Firestore if role is different
            if (userEmail === 'knutsenthomas@gmail.com') {
              if (userData.role !== 'superadmin' || userData.name !== 'Thomas Knutsen') {
                userData.role = 'superadmin';
                userData.name = 'Thomas Knutsen';
                needsUpdate = true;
              }
            }

            // Reset mock avatars to default student/user avatar
            const mockAvatars = [
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"
            ];
            if (mockAvatars.includes(userData.avatar)) {
              userData.avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120";
              needsUpdate = true;
            }

            if (needsUpdate) {
              try {
                await setDoc(userDocRef, { 
                  role: userData.role, 
                  name: userData.name, 
                  avatar: userData.avatar 
                }, { merge: true });
              } catch (fsErr) {
                console.warn("Firestore profile sync blocked by rules, upgraded state locally:", fsErr);
              }
            }

            setUser(userData);
            setIsLoggedIn(true);
          } else {
            // Unauthorized user (not knutsenthomas@gmail.com AND not in the pre-created admin list)
            console.warn("Unauthorized user tried to log in:", userEmail);
            setUser(null);
            setIsLoggedIn(false);
            await signOut(auth);
            showToast("Tilgang nektet: Din e-postadresse er ikke registrert i systemet.");
          }
        } catch (err) {
          console.error("Feil ved lasting av brukerprofil fra Firestore:", err);
        }
      } else {
        // Clear user session when logged out
        setUser(null);
        setIsLoggedIn(false);
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
          const querySnapshot = await getDocs(collection(db, "users"));
          let invitedDoc = null;
          querySnapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (data.email?.toLowerCase() === cleanEmail) {
              invitedDoc = { id: docSnap.id, data };
            }
          });

          if (invitedDoc) {
            // Yes! The user is pre-created by the admin in Firestore, but doesn't exist in Firebase Auth.
            // Let's automatically register/create them in Firebase Auth on the fly!
            showToast("Oppretter sikker innlogging for din inviterte e-post...");
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
        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach(docSnap => {
          const data = docSnap.data();
          if (data.email?.toLowerCase() === checkEmail) {
            isInvited = true;
            invitedProfile = data;
            docId = docSnap.id;
          }
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
              <h2 style="color: #1B4965; border-bottom: 2px solid #1B4965; padding-bottom: 10px; margin-top: 0;">Ny support-henvendelse</h2>
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
      submitSupportTicket,
      showToast,
      cmsContent,
      updateCmsContent,
      isAdminEditing,
      setIsAdminEditing,
      language,
      toggleLanguage
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
