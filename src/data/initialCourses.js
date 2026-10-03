export const defaultModuleContent = (extra = {}) => ({
  description: '',
  learningGoals: [],
  lessons: [],
  transcript: [],
  studyGuides: [],
  assignments: [],
  assignment: { description: '', dueDate: '', type: 'essay' },
  ...extra,
});

export const INITIAL_COURSES = [
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

export const INITIAL_STUDENTS = [];

export const INITIAL_ASSISTANT_MESSAGES = [
  {
    id: "am1",
    sender: "assistant",
    text: "Hei! Jeg er din HKM Assistent. Hvordan kan jeg hjelpe deg med din bibelundervisning, profetiske utrustning eller administrative oppgaver i dag?",
    time: "11:58"
  }
];

export const DEFAULT_RUBRIC = [
  { criterion: 'Bibelforståelse & faglig presisjon', points: 40 },
  { criterion: 'Refleksjon og anvendelse', points: 40 },
  { criterion: 'Struktur og formidling', points: 20 }
];

export const INITIAL_STANDALONE_ASSIGNMENTS = [
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

export const buildModuleAssignments = (courses) => courses.flatMap(course =>
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

export const mergeAssignmentActivity = (assignment, activity) => ({
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
    initials: 'DH',
    avatar: ''
  },
  {
    id: 'rev-2',
    name: 'Profet Jon Arild',
    role: 'Faglærer – Bibeltolkning',
    initials: 'JA',
    avatar: ''
  },
  {
    id: 'rev-3',
    name: 'Pastor Siri Knutsen',
    role: 'Administrasjon & Sjelesorg',
    initials: 'SK',
    avatar: ''
  },
  {
    id: 'rev-4',
    name: 'Thomas Knutsen',
    role: 'Innholdsansvarlig & Koordinator',
    initials: 'TK',
    avatar: ''
  }
];
