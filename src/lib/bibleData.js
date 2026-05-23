export const BIBLE_BOOKS = [
  // Det gamle testamentet (GT)
  { id: 'gen', nor: '1. Mosebok', eng: 'Genesis', chapters: 50, testament: 'GT' },
  { id: 'exo', nor: '2. Mosebok', eng: 'Exodus', chapters: 40, testament: 'GT' },
  { id: 'lev', nor: '3. Mosebok', eng: 'Leviticus', chapters: 27, testament: 'GT' },
  { id: 'num', nor: '4. Mosebok', eng: 'Numbers', chapters: 36, testament: 'GT' },
  { id: 'deu', nor: '5. Mosebok', eng: 'Deuteronomy', chapters: 34, testament: 'GT' },
  { id: 'jos', nor: 'Josva', eng: 'Joshua', chapters: 24, testament: 'GT' },
  { id: 'jdg', nor: 'Dommerne', eng: 'Judges', chapters: 21, testament: 'GT' },
  { id: 'rut', nor: 'Rut', eng: 'Ruth', chapters: 4, testament: 'GT' },
  { id: '1sa', nor: '1. Samuelsbok', eng: '1 Samuel', chapters: 31, testament: 'GT' },
  { id: '2sa', nor: '2. Samuelsbok', eng: '2 Samuel', chapters: 24, testament: 'GT' },
  { id: '1ki', nor: '1. Kongebok', eng: '1 Kings', chapters: 22, testament: 'GT' },
  { id: '2ki', nor: '2. Kongebok', eng: '2 Kings', chapters: 25, testament: 'GT' },
  { id: '1ch', nor: '1. Krønikerbok', eng: '1 Chronicles', chapters: 29, testament: 'GT' },
  { id: '2ch', nor: '2. Krønikerbok', eng: '2 Chronicles', chapters: 36, testament: 'GT' },
  { id: 'ezr', nor: 'Esra', eng: 'Ezra', chapters: 10, testament: 'GT' },
  { id: 'neh', nor: 'Nehemia', eng: 'Nehemiah', chapters: 13, testament: 'GT' },
  { id: 'est', nor: 'Ester', eng: 'Esther', chapters: 10, testament: 'GT' },
  { id: 'job', nor: 'Job', eng: 'Job', chapters: 42, testament: 'GT' },
  { id: 'psa', nor: 'Salmene', eng: 'Psalms', chapters: 150, testament: 'GT' },
  { id: 'pro', nor: 'Ordspråkene', eng: 'Proverbs', chapters: 31, testament: 'GT' },
  { id: 'ecc', nor: 'Forkynneren', eng: 'Ecclesiastes', chapters: 12, testament: 'GT' },
  { id: 'sng', nor: 'Høysangen', eng: 'Song of Solomon', chapters: 8, testament: 'GT' },
  { id: 'isa', nor: 'Jesaja', eng: 'Isaiah', chapters: 66, testament: 'GT' },
  { id: 'jer', nor: 'Jeremia', eng: 'Jeremiah', chapters: 52, testament: 'GT' },
  { id: 'lam', nor: 'Klagesangene', eng: 'Lamentations', chapters: 5, testament: 'GT' },
  { id: 'eze', nor: 'Esekiel', eng: 'Ezekiel', chapters: 48, testament: 'GT' },
  { id: 'dan', nor: 'Daniel', eng: 'Daniel', chapters: 12, testament: 'GT' },
  { id: 'hos', nor: 'Hosea', eng: 'Hosea', chapters: 14, testament: 'GT' },
  { id: 'joe', nor: 'Joel', eng: 'Joel', chapters: 3, testament: 'GT' },
  { id: 'amo', nor: 'Amos', eng: 'Amos', chapters: 9, testament: 'GT' },
  { id: 'oba', nor: 'Obadja', eng: 'Obadiah', chapters: 1, testament: 'GT' },
  { id: 'jon', nor: 'Jona', eng: 'Jonah', chapters: 4, testament: 'GT' },
  { id: 'mic', nor: 'Mika', eng: 'Micah', chapters: 7, testament: 'GT' },
  { id: 'nam', nor: 'Nahum', eng: 'Nahum', chapters: 3, testament: 'GT' },
  { id: 'hab', nor: 'Habakkuk', eng: 'Habakkuk', chapters: 3, testament: 'GT' },
  { id: 'zep', nor: 'Sefanja', eng: 'Zephaniah', chapters: 3, testament: 'GT' },
  { id: 'hag', nor: 'Haggai', eng: 'Haggai', chapters: 2, testament: 'GT' },
  { id: 'zec', nor: 'Sakarja', eng: 'Zechariah', chapters: 14, testament: 'GT' },
  { id: 'mal', nor: 'Malaki', eng: 'Malachi', chapters: 4, testament: 'GT' },

  // Det nye testamentet (NT)
  { id: 'mat', nor: 'Matteus', eng: 'Matthew', chapters: 28, testament: 'NT' },
  { id: 'mrk', nor: 'Markus', eng: 'Mark', chapters: 16, testament: 'NT' },
  { id: 'luk', nor: 'Lukas', eng: 'Luke', chapters: 24, testament: 'NT' },
  { id: 'joh', nor: 'Johannes', eng: 'John', chapters: 21, testament: 'NT' },
  { id: 'act', nor: 'Apostlenes gjerninger', eng: 'Acts', chapters: 28, testament: 'NT' },
  { id: 'rom', nor: 'Romerne', eng: 'Romans', chapters: 16, testament: 'NT' },
  { id: '1co', nor: '1. Korinter', eng: '1 Corinthians', chapters: 16, testament: 'NT' },
  { id: '2co', nor: '2. Korinter', eng: '2 Corinthians', chapters: 13, testament: 'NT' },
  { id: 'gal', nor: 'Galaterne', eng: 'Galatians', chapters: 6, testament: 'NT' },
  { id: 'eph', nor: 'Efeserne', eng: 'Ephesians', chapters: 6, testament: 'NT' },
  { id: 'php', nor: 'Filipperne', eng: 'Philippians', chapters: 4, testament: 'NT' },
  { id: 'col', nor: 'Kolosserne', eng: 'Colossians', chapters: 4, testament: 'NT' },
  { id: '1th', nor: '1. Tessaloniker', eng: '1 Thessalonians', chapters: 5, testament: 'NT' },
  { id: '2th', nor: '2. Tessaloniker', eng: '2 Thessalonians', chapters: 3, testament: 'NT' },
  { id: '1ti', nor: '1. Timoteus', eng: '1 Timothy', chapters: 6, testament: 'NT' },
  { id: '2ti', nor: '2. Timoteus', eng: '2 Timothy', chapters: 4, testament: 'NT' },
  { id: 'tit', nor: 'Titus', eng: 'Titus', chapters: 3, testament: 'NT' },
  { id: 'phm', nor: 'Filemon', eng: 'Philemon', chapters: 1, testament: 'NT' },
  { id: 'heb', nor: 'Hebreerne', eng: 'Hebrews', chapters: 13, testament: 'NT' },
  { id: 'jas', nor: 'Jakob', eng: 'James', chapters: 5, testament: 'NT' },
  { id: '1pe', nor: '1. Peter', eng: '1 Peter', chapters: 5, testament: 'NT' },
  { id: '2pe', nor: '2. Peter', eng: '2 Peter', chapters: 3, testament: 'NT' },
  { id: '1jo', nor: '1. Johannes', eng: '1 John', chapters: 5, testament: 'NT' },
  { id: '2jo', nor: '2. Johannes', eng: '2 John', chapters: 1, testament: 'NT' },
  { id: '3jo', nor: '3. Johannes', eng: '3 John', chapters: 1, testament: 'NT' },
  { id: 'jud', nor: 'Judas', eng: 'Jude', chapters: 1, testament: 'NT' },
  { id: 'rev', nor: 'Åpenbaringen', eng: 'Revelation', chapters: 22, testament: 'NT' },
];

export const TRANSLATIONS = [
  { id: 'bibelselskap', name: 'Norsk Bokmål (1930)' },
  { id: 'norsmb', name: 'Norsk Nynorsk (1921)' },
  { id: 'web', name: 'English (World English Bible)' },
  { id: 'kjv', name: 'English (King James Version)' },
];

export const STUDY_BIBLE_DATA = {
  joh_3: {
    overview: {
      title: "Johannes 3: Den nye fødsel og Guds grenseløse kjærlighet",
      context: "Dette kapittelet er et av de mest sentrale i det nye testamentet. Jesus samtaler med Nikodemus, en hemmelig disippel og leder blant jødene, og forklarer overgangen fra en ytre lovisk religion til et indre, åndelig liv født ovenfra.",
      themes: [
        "Den nye fødsel (født av vann og Ånd)",
        "Guds kjærlighet som frelsens drivkraft (Joh 3:16)",
        "Kontrasten mellom lys og mørke",
        "Johannes Døperens ydmykhet ('Han skal vokse, jeg skal avta')"
      ],
      outline: "1-15: Samtalen med Nikodemus om den nye fødsel\n16-21: Guds kjærlighet, troen og dommen\n22-36: Johannes Døperens siste vitnesbyrd om brudgommen"
    },
    commentary: [
      {
        verses: "1-3",
        title: "Nikodemus og kravet om gjenfødelse",
        text: "Nikodemus kommer om natten, sannsynligvis av frykt for sine kolleger i Sanhedrin (Rådet). Han anerkjenner Jesus som en lærer fra Gud på grunn av tegnene Han gjør. Men Jesus går rett til kjernen: Ytre respekt for tegn er ikke nok; man må bli 'født på ny' (gresk: anothen, som kan bety både 'på ny' og 'ovenfra') for å se Guds rike. Dette utfordrer jødisk nasjonal stolthet som trodde biologisk ættelinje sikret inngang."
      },
      {
        verses: "4-8",
        title: "Født av vann og Ånd",
        text: "Nikodemus tar ordene bokstavelig og spør om man kan gå inn i sin mors liv igjen. Jesus utdyper: Fødselen er åndelig, 'født av vann og Ånd'. Vannet kan referere til både Johannes' omvendelsesdåp og det rensende ordet (Esek 36:25-27). Ånden refererer til Helligåndens suverene og uforutsigbare verk, sammenlignet med vinden som blåser dit den vil. Du hører lyden, men vet ikke hvor den kommer fra."
      },
      {
        verses: "14-16",
        title: "Kobberslangen og Guds største gave",
        text: "Jesus viser til 4. Mosebok 21, der israelittene ble helbredet ved å se på kobberslangen som Moses reiste i ørkenen. Slik må Menneskesønnen opphøyes på korset, slik at alle som tror på Ham skal ha evig liv. Vers 16 er 'den lille bibel': Frelsens kilde er Guds suverene agape-kjærlighet til en opprørsk verden. Han gav sin enbårne Sønn for at vi skal reddes fra fortapelse."
      },
      {
        verses: "17-21",
        title: "Troen, dommen og lyset",
        text: "Gud sendte ikke sin Sønn for å dømme verden, men for å frelse den. Men dommen skjer automatisk basert på menneskets reaksjon til lyset: De som gjør det onde hater lyset, fordi deres gjerninger blir avslørt. De som lever i sannheten søker lyset, for at det skal bli klart at deres gjerninger er gjort i Gud."
      }
    ],
    wordStudies: [
      {
        word: "Anothen (ἄνωθεν)",
        language: "Gresk (vers 3)",
        meaning: "Betyr både 'ovenfra' (fra himmelen) og 'på nytt'. Jesus bruker bevisst ordet med begge betydninger: gjenfødelsen er en ny fødsel som har sitt opphav direkte fra Gud i himmelen."
      },
      {
        word: "Monogenes (μονογενής)",
        language: "Gresk (vers 16)",
        meaning: "Ofte oversatt med 'enbårne', men betyr mer presist 'eneste i sitt slag' eller 'helt unik'. Det understreker Jesu unike vesen som Guds sanne Sønn, ulikt troende som blir Guds barn ved adopsjon."
      }
    ],
    crossReferences: [
      { ref: "Esekiel 36:25-27", desc: "Profetien om det rensende vannet og den nye ånden Gud vil gi sitt folk." },
      { ref: "4. Mosebok 21:8-9", desc: "Historien om kobberslangen som reises i ørkenen for helbredelse." },
      { ref: "Romerne 8:14-17", desc: "Ånden som gir oss barnekår og vitner om at vi er Guds barn." }
    ]
  },
  psa_23: {
    overview: {
      title: "Salme 23: Herren er min hyrde",
      context: "Dette er kanskje verdens mest elskede salme. Skrevet av David, som selv var hyrde før han ble konge, uttrykker den en dyp og personlig tillit to Guds omsorg, beskyttelse og ledelse gjennom livets lyseste og mørkeste daler.",
      themes: [
        "Herren som den nære og personlige forsørgeren ('min hyrde')",
        "Åndelig og sjelelig hvile i grønne enger",
        "Beskyttelse i kriser og dødsskyggens dal",
        "Det evige fellesskapet i Herrens hus"
      ],
      outline: "1-3: Hyrdens omsorg, hvile og ledelse\n4: Beskyttelse og trøst i mørket\n5: Verten som dekker bord og salver hodet\n6: Guds godhet og det evige hjemmet"
    },
    commentary: [
      {
        verses: "1-3",
        title: "Forsørgelse og sjelelig fornyelse",
        text: "David begynner med det personlige 'min hyrde'. Han mangler ingenting fordi Hyrden leder ham til 'grønne enger' (næring) og 'hvilens vann' (forfriskning og fred). Hyrden fornyer sjelen og leder ham på 'rettferdighets stier' for sitt navns ære. Dette viser at Guds ledelse ikke bare handler om vår komfort, men om Hans karakter og hellighet."
      },
      {
        verses: "4",
        title: "Dødsskyggens dal",
        text: "Hyrden leder oss ikke utenom prøvelser, men igjennom dem. Selv i 'dødsskyggens dal' (hebraisk: tsalmaveth, en bekmørk dal av ekstrem fare) frykter David ikke noe ondt. Årsaken er enkel: 'Du er med meg'. Hyrdestaven (for å forsvare mot rovdyr) og kjeppen (for å styre og telle sauene) gir trygghet og trøst i krisen."
      },
      {
        verses: "5-6",
        title: "Bordet dekket i fienders påsyn",
        text: "Metaforen skifter fra en hyrde til en sjenerøs vert. Gud dekker et festbord for oss, ikke i sikkerhet, men 'rett foran mine fiender'. Han salver hodet med olje (æresgjest, lindring for sår) og begeret renner over av velsignelse. Salmen avslutter med en triumferende visshet: Guds godhet og miskunnhet (hebraisk: chesed, paktstro kjærlighet) skal følge ham alle dager, og han skal bo i Herrens hus til evig tid."
      }
    ],
    wordStudies: [
      {
        word: "Chesed (חֶסֶד)",
        language: "Hebraisk (vers 6)",
        meaning: "Oversatt med 'miskunnhet' eller 'kjærlighet'. Det betegner Guds dype, urokkelige og paktstro kjærlighet som aldri svikter, uansett omstendigheter."
      },
      {
        word: "Shub (שׁוּב)",
        language: "Hebraisk (vers 3)",
        meaning: "Betyr 'å bringe tilbake', 'omvende' eller 'fornye'. Når Hyrden 'fornyer' sjelen, betyr det at han bringer den fortapte eller trette sauen tilbake til vitalt og levende liv."
      }
    ],
    crossReferences: [
      { ref: "Johannes 10:11-14", desc: "Jesus erklærer at Han er 'den gode hyrde' som gir sitt liv for sauene." },
      { ref: "Lukas 15:4-7", desc: "Lignelsen om den tapte sauen som hyrden leter etter til han finner den." },
      { ref: "Åpenbaringen 7:17", desc: "Lammet midt på tronen skal være deres hyrde og lede dem til kilder med livets vann." }
    ]
  },
  rom_8: {
    overview: {
      title: "Romerne 8: Livet i Ånden og Guds uovervinnelige kjærlighet",
      context: "Romerne 8 regnes av mange teologer som 'kronjuvelen' i Det nye testamentet. Etter kapittel 7s kamp mot synden, viser Paulus her den triumferende virkeligheten for den troende: frigjøring ved Helligånden, adopsjon til Guds barn, fremtidig herlighet og en kjærlighet fra Gud som ingenting kan skille oss fra.",
      themes: [
        "Ingen fordømmelse i Kristus Jesus (vers 1)",
        "Åndens iboende liv kontra kjødets strev",
        "Barnekår og Åndens indre vitnesbyrd ('Abba, Far!')",
        "Skaperverkets lengsel etter forløsning",
        "Guds evige plan og kjærlighetens uovervinnelige seier"
      ],
      outline: "1-11: Livet i Helligånden og frihet fra fordømmelse\n12-17: Barnekår og arv med Kristus\n18-30: Fremtidig herlighet, Åndens forbønn og Guds rådslutning\n31-39: Mer enn seierherrer i Guds kjærlighet"
    },
    commentary: [
      {
        verses: "1-4",
        title: "Ingen fordømmelse i Kristus",
        text: "Paulus erklærer at det ikke er noen fordømmelse (gresk: katakrima, rettslig skyld og straff) for dem som er i Kristus Jesus. Lovens krav ble oppfylt da Gud sendte sin egen Sønn som syndoffer. Livets Ånds lov har frigjort oss fra syndens og dødens lov."
      },
      {
        verses: "14-17",
        title: "Barnekår og Åndens vitnesbyrd",
        text: "De som drives av Guds Ånd er Guds barn. Vi har ikke fått trelldommens ånd så vi igjen må frykte, men vi har fått Ånden som gir oss barnekår (gresk: huiothesia, adopsjon til fullverdige sønner). Helligånden vitner sammen med vår ånd at vi er Guds barn og medarvinger med Kristus."
      },
      {
        verses: "26-28",
        title: "Åndens forbønn og Guds gode plan",
        text: "I vår svakhet vet vi ikke hva vi skal be om, men Ånden selv går i forbønn for oss med usigelige sukk. Og vi vet at alle ting samvirker til det gode for dem som elsker Gud, dem som etter Hans rådslutning er kalt."
      },
      {
        verses: "31-39",
        title: "Mer enn seierherrer",
        text: "Hvis Gud er for oss, hvem kan da være mot oss? Paulus avslutter med en mektig lovsang: Hvem kan anklage Guds utvalgte? Hvem kan skille oss fra Kristi kjærlighet? Hverken trengsel, angst, forfølgelse, død eller liv kan skille oss fra Guds kjærlighet i Kristus Jesus, vår Herre. Vi er 'mer enn seierherrer'."
      }
    ],
    wordStudies: [
      {
        word: "Katakrima (κατάκριμα)",
        language: "Gresk (vers 1)",
        meaning: "Rettslig dom eller straffeutmåling. At det ikke finnes noen 'katakrima' betyr at rettssaken er avsluttet, og den troende er frikjent for all evighet på grunn av Kristi fullbrakte verk."
      },
      {
        word: "Abba (אַבָּא)",
        language: "Aramaisk (vers 15)",
        meaning: "Et intimt, men respektfullt aramaisk ord for far, brukt av jødiske barn. Det uttrykker den ekstreme nærheten og tilliten vi nå har til Skaperen av universet."
      }
    ],
    crossReferences: [
      { ref: "Galaterne 4:4-7", desc: "Gud sendte sin Sønn for at vi skulle få barnekår og rope 'Abba, Far'." },
      { ref: "Efeserne 1:4-5", desc: "Utvalgt i Kristus før verdens grunnvoll ble lagt, forutbestemt til adopsjon." },
      { ref: "Johannes 10:28-29", desc: "Ingen skal rive Kristi sauer ut av Hans eller Faderens hånd." }
    ]
  }
};

export const generateDynamicCommentary = (book, chapter) => {
  const bookName = book.nor;
  
  let author = "Ukjent/Tradisjonell";
  let background = "Dette skriftstedet bærer preg av guddommelig inspirasjon og dyp historisk relevans.";
  
  if (['mat', 'mrk', 'luk', 'joh'].includes(book.id)) {
    author = book.id === 'mat' ? 'Matteus (Apostel)' : book.id === 'mrk' ? 'Markus (Johannes Markus)' : book.id === 'luk' ? 'Lukas (Legen)' : 'Johannes (Apostelen)';
    background = `Dette kapittelet i ${bookName} gir et historisk og øyenvitne-basert blikk på Jesu liv, Hans forkynnelse og frelsesverk, nedskrevet for at leseren skal komme til tro på Kristus.`;
  } else if (['rom', '1co', '2co', 'gal', 'eph', 'php', 'col', '1th', '2th', '1ti', '2ti', 'tit', 'phm'].includes(book.id)) {
    author = "Paulus (Apostelen)";
    background = `Dette brevet ble skrevet av apostelen Paulus for å rettlede, styrke og undervise de tidlige kristne menighetene i sunn teologi, rettferdiggjørelse ved tro og praktisk kristenliv.`;
  } else if (book.id === 'psa') {
    author = "David og andre salmister";
    background = "Salmenes bok er Israels hellige sang- og bønnebok, som uttrykker hele registeret av menneskelige følelser stilt fremfor Gud i tilbedelse, klage og tillit.";
  } else if (book.id === 'rev') {
    author = "Johannes (på øya Patmos)";
    background = "Åpenbaringsboken er et apokalyptisk skrift fylt med profetiske syner, gitt for å trøste forfulgte kristne med vissheten om Kristi endelige og kosmiske seier.";
  }

  return {
    overview: {
      title: `${bookName} ${chapter}: Teologisk utlegning`,
      context: background,
      themes: [
        "Guds suverene vilje og karakter i fokus",
        "Praktisk anvendelse av sannheten for disippellivet",
        "Tilknytning til den store frelseshistoriske fortellingen"
      ],
      outline: `1-5: Introduksjon og setting av kapittelets kjerne\n6-15: Utdypning av de sentrale teologiske sannhetene\n16-${chapter * 2}: Praktisk formaning og avslutning`
    },
    commentary: [
      {
        verses: "Kapittelkontekst",
        title: "Historisk-teologisk oversikt",
        text: `Når vi studerer ${bookName} kapittel ${chapter}, ser vi et tydelig mønster av Guds åpenbaring. Forfatteren ${author} formidler her tidløse sannheter under Helligåndens ledelse, som kaller oss til lydighet, refleksjon og omvendelse. Teksten belyser hvordan den gamle pakt oppfylles i den nye.`
      }
    ],
    wordStudies: [
      {
        word: "Pneuma (πνεῦμα) / Ruach (רוּחַ)",
        language: "Gresk / Hebraisk",
        meaning: "Betyr vind, pust eller ånd. Brukes i skriftene for å beskrive Helligåndens nærvær, Hans utrustning av de profetiske tjenestene, og Hans fornyende arbeid i menneskets hjerte."
      }
    ],
    crossReferences: [
      { ref: "2. Timoteus 3:16-17", desc: "Hele Skriften er innblåst av Gud og nyttig til opplæring og utrustning." },
      { ref: "Salmene 119:105", desc: "Ditt ord er en lykt for min fot og et lys på min sti." }
    ]
  };
};

export const parseBibleReference = (query) => {
  if (!query) return null;
  const clean = query.trim();
  const match = clean.match(/^([1-3]?\s*\.?\s*[a-zA-Z\u00C0-\u00FF]+(?:\s*[a-zA-Z\u00C0-\u00FF]+)*)\s+(\d+)(?:[\s:,v\.\-]+(\d+))?/i);
  if (!match) return null;
  
  return {
    bookStr: match[1].trim(),
    chapter: parseInt(match[2], 10),
    verse: match[3] ? parseInt(match[3], 10) : null
  };
};

export const findBibleBook = (bookStr) => {
  if (!bookStr) return null;
  const cleanStr = bookStr.toLowerCase().replace(/[\.\s]/g, '');
  
  let found = BIBLE_BOOKS.find(b => 
    b.nor.toLowerCase().replace(/[\.\s]/g, '') === cleanStr ||
    b.eng.toLowerCase().replace(/[\.\s]/g, '') === cleanStr ||
    b.id.toLowerCase() === cleanStr
  );
  if (found) return found;

  found = BIBLE_BOOKS.find(b => 
    b.nor.toLowerCase().replace(/[\.\s]/g, '').startsWith(cleanStr) ||
    b.eng.toLowerCase().replace(/[\.\s]/g, '').startsWith(cleanStr)
  );
  if (found) return found;

  found = BIBLE_BOOKS.find(b => 
    b.nor.toLowerCase().replace(/[\.\s]/g, '').includes(cleanStr) ||
    b.eng.toLowerCase().replace(/[\.\s]/g, '').includes(cleanStr)
  );
  return found;
};
