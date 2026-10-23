const generateDynamicCommentary = (book, chapter) => {
  const bookId = book.id;
  const bookName = book.nor;

  let author = "Ukjent/Tradisjonell";
  let theme = "Guds trofasthet og frelseshistorie";
  let contextText = `Dette kapittelet er en viktig del av ${bookName}, og viser Guds åpenbaring til Hans folk.`;
  let outline = `1-10: Kapitlets innledning og teologiske premiss\n11-20: Praktisk og åndelig utdypning\n21+: Konklusjon og fremtidig anvendelse`;
  let themes = [
    "Guds suverene ledelse og omsorg",
    "Troens lydighet i møte med utfordringer",
    "Åpenbaringen av Jesu Kristi frelsesverk",
  ];
  let keyWord = "Emunah (אֱמוּנָה)";
  let keyWordLang = "Hebraisk";
  let keyWordMeaning =
    "Betyr fasthet, trofasthet eller tro. Uttrykker den dype tilliten og lojaliteten mellom Gud og Hans folk.";

  if (bookId === "gen") {
    author = "Moses";
    theme = "Begynnelser, Guds skapelse, pakt og utvelgelse";
    contextText = `1. Mosebok (Genesis) legger grunnlaget for hele Bibelen. Kapittel ${chapter} er en integrert del av urhistorien eller patriarkhistorien, der Gud etablerer sin orden eller kaller sine tjenere.`;
    keyWord = "Bereshit (בְּרֵאשִׁית)";
    keyWordLang = "Hebraisk";
    keyWordMeaning =
      "I begynnelsen. Bokens hebraiske navn og første ord, som setter tonen for Guds suverene skaperakt ut av intet (ex nihilo).";
    themes = [
      "Guds skaperkraft og orden",
      "Menneskets unike posisjon",
      "Pakten som frelsens rammeverk",
    ];
  } else if (bookId === "exo") {
    author = "Moses";
    theme = "Utgang, forløsning, loven og tabernaklet";
    contextText = `2. Mosebok (Exodus) beskriver hvordan Gud frir sitt folk ut av trelldommen. I kapittel ${chapter} ser vi Hans mektige gjerninger, Hans ledelse i sky- og ildsøylen, eller Hans hellige lov gitt på Sinai.`;
    keyWord = "Pesach (פֶּסַח)";
    keyWordLang = "Hebraisk";
    keyWordMeaning =
      "Påske/forbigang. Viser til Guds nåde som går forbi de dører som er strøket med lammes blod, et profetisk bilde på Kristus.";
  } else if (bookId === "psa") {
    author = "David m.fl.";
    theme = "Bønn, lovsang, klage og profetiske messianske syner";
    contextText = `Salmenes bok er israelittenes bønne- og sangbok. Salme ${chapter} er et dypt personlig og profetisk uttrykk for sjelen som søker Gud midt i prøvelser eller priser Hans hellighet.`;
    keyWord = "Tehillim (תְּהִλִּים)";
    keyWordLang = "Hebraisk";
    keyWordMeaning =
      "Lovsanger. Det hebraiske navnet på Salmenes bok, som viser at selv i klagen er målet alltid å reise opp Guds pris.";
  } else if (bookId === "isa") {
    author = "Jesaja";
    theme = "Messias-profetier, dom, trøst og gjenopprettelse";
    contextText = `Profeten Jesaja taler med ekstrem klarsyn om både Guds rettferdige dom over folkeslagene og Hans ufattelige nåde gjennom den kommende Messias. Kapittel ${chapter} inneholder profetiske syner som peker mot evigheten.`;
    keyWord = "Kadosh (קָדוֹשׁ)";
    keyWordLang = "Hebraisk";
    keyWordMeaning =
      "Hellig. Jesajas yndlingsbetegnelse på Gud er 'Israels Hellige', som understreker Guds absolutte renhet og opphøydhet.";
  } else if (bookId === "joh") {
    author = "Apostelen Johannes";
    theme = "Jesus som Guds Sønn, det evige Ordet, Åndens liv og kjærlighet";
    contextText = `Johannesevangeliet tegner et usedvanlig dypt bilde av Jesu guddommelighet og Hans intime relasjon til Faderen. Kapittel ${chapter} inviterer oss inn i dype åpenbaringer om troen, Ånden og evig liv.`;
    keyWord = "Logos (λόγος)";
    keyWordLang = "Gresk";
    keyWordMeaning =
      "Ordet. Johannes bruker dette filosofiske og teologiske uttrykket for å beskrive Jesus som Guds preeksistente og skapende selvåpenbaring.";
    themes = [
      "Jesus som livets kilde",
      "Fellesskapet med Faderen",
      "Troen som nøkkel to frelse",
    ];
  } else if (bookId === "rom") {
    author = "Apostelen Paulus";
    theme =
      "Rettferdiggjørelse av tro, Guds suverene nåde, helliggjørelse og misjon";
    contextText = `Romerbrevet er Paulus' teologiske mesterverk. I kapittel ${chapter} forklarer han med stor presisjon hvordan Guds rettferdighet opererer i den troendes liv gjennom troen på Kristus.`;
    keyWord = "Dikaiosyne (δικαιοσύνη)";
    keyWordLang = "Gresk";
    keyWordMeaning =
      "Rettferdighet. Viser til Guds egen rettferdige karakter og den rettferdige statusen Han tilregner syndere ved tro av bare nåde.";
  } else if (bookId === "eph") {
    author = "Apostelen Paulus";
    theme =
      "Menigheten som Kristi kropp, de himmelske velsignelser, åndelig modenhet og kamp";
    contextText = `Efeserne viser oss Guds kosmiske plan for menigheten. I kapittel ${chapter} oppfordres vi til å forstå vår posisjon 'i Kristus' og leve ut vårt sanne kall som Hans hellige legeme.`;
    keyWord = "Charis (χάρις)";
    keyWordLang = "Gresk";
    keyWordMeaning =
      "Nåde. Paulus understreker at vi er frelst av nåde, ikke av egne gjerninger, for at ingen skal rose seg.";
  } else if (bookId === "rev") {
    author = "Apostelen Johannes";
    theme =
      "Jesu Kristi åpenbaring, seieren over det onde, dommen og den nye skapningen";
    contextText = `Johannes' åpenbaring er Bibelens store klimaks. Kapittel ${chapter} avduker de apokalyptiske hendelsene, den himmelske tilbedelsen og Lammets endelige seier over dragen og mørkets makter.`;
    keyWord = "Apokalypse (ἀποκάλυψις)";
    keyWordLang = "Gresk";
    keyWordMeaning =
      "Åpenbaring/avsløring. Å dra til side et slør for å vise den åndelige virkeligheten bak historiens gang og Jesu endelige herredømme.";
  }

  const commentarySections = [
    {
      verses: "1-10",
      title: `Åpenbaring og teologisk fundament i ${bookName} ${chapter}`,
      text: `Innledningen av dette kapittelet setter en klar retning. Her ser vi hvordan Gud tar initiativet til å tale, rettlede eller gripe inn i historien. Det teologiske fundamentet understreker Guds absolutte autoritet og trofasthet mot sine løfter. For den troende er dette en invitasjon til å lytte med et ydmykt og mottakelig hjerte.`,
    },
    {
      verses: "11-20",
      title: "Åndelig dybde og personlig overgivelse",
      text: `Midtpartiet utfordrer oss til praktisk anvendelse. Teksten viser ofte konflikten mellom kjødelig fornuft og åndelig tillit. Gjennom historiske eksempler eller læremessige utredninger blir vi minnet om at Guds tanker er høyere enn våre tanker, og at troen krever aktiv handling og lydighet i hverdagen.`,
    },
    {
      verses: "21-28",
      title: "Seier, gjenopprettelse og fremtidig håp",
      text: `Kapitlets avslutning peker fremover mot Guds hellige og fullendte plan. Enten det handler om Israels redning, den troendes trygghet i Kristus, eller Kirkens eskatologiske seier, etterlater dette kapittelet oss med en dyp visshet om at Herren har full kontroll og vil fullføre det gode verket Han har begynt.`,
    },
  ];

  return {
    overview: {
      title: `Studiekommentar: ${bookName} kapittel ${chapter}`,
      context: contextText,
      themes: themes,
      outline: outline,
    },
    commentary: commentarySections,
    wordStudies: [
      {
        word: keyWord,
        language: keyWordLang,
        meaning: keyWordMeaning,
      },
      {
        word: "Koinonia (κοινωνία)",
        language: "Gresk",
        meaning:
          "Betyr fellesskap, delaktighet eller samfunn. Beskriver det intime åndelige fellesskapet troende har med Faderen, Sønnen og Helligånden.",
      },
    ],
    crossReferences: [
      {
        ref: "Hebreerne 11:1-6",
        desc: "Beskriver troens vesen og hvordan de gamle fikk godt vitnesbyrd ved tro.",
      },
      {
        ref: "2. Timoteus 3:16-17",
        desc: "Slår fast at hele Skriften er innåndet av Gud og nyttig til lærdom og opptuktelse.",
      },
      {
        ref: "Apostlenes gjerninger 17:11",
        desc: "Berea-jødene som gransket skriftene daglig for å se om alt stemte.",
      },
    ],
  };
};

export { generateDynamicCommentary };
