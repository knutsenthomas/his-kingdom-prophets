import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Search, ArrowLeft, ArrowRight, Share2, Copy, Send, Check, RefreshCw, Sparkles, BookMarked, X,
  Trash2, Save, Loader2
} from 'lucide-react';
import { db } from '@/firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

const BIBLE_BOOKS = [
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

const TRANSLATIONS = [
  { id: 'bibelselskap', name: 'Norsk Bokmål (1930)' },
  { id: 'norsmb', name: 'Norsk Nynorsk (1921)' },
  { id: 'web', name: 'English (World English Bible)' },
  { id: 'kjv', name: 'English (King James Version)' },
];

const STUDY_BIBLE_DATA = {
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
      context: "Dette er kanskje verdens mest elskede salme. Skrevet av David, som selv var hyrde før han ble konge, uttrykker den en dyp og personlig tillit til Guds omsorg, beskyttelse og ledelse gjennom livets lyseste og mørkeste daler.",
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
    "Åpenbaringen av Jesu Kristi frelsesverk"
  ];
  let keyWord = "Emunah (אֱמוּנָה)";
  let keyWordLang = "Hebraisk";
  let keyWordMeaning = "Betyr fasthet, trofasthet eller tro. Uttrykker den dype tilliten og lojaliteten mellom Gud og Hans folk.";
  
  if (bookId === 'gen') {
    author = "Moses";
    theme = "Begynnelser, Guds skapelse, pakt og utvelgelse";
    contextText = `1. Mosebok (Genesis) legger grunnlaget for hele Bibelen. Kapittel ${chapter} er en integrert del av urhistorien eller patriarkhistorien, der Gud etablerer sin orden eller kaller sine tjenere.`;
    keyWord = "Bereshit (בְּרֵאשִׁית)";
    keyWordLang = "Hebraisk";
    keyWordMeaning = "I begynnelsen. Bokens hebraiske navn og første ord, som setter tonen for Guds suverene skaperakt ut av intet (ex nihilo).";
    themes = ["Guds skaperkraft og orden", "Menneskets unike posisjon", "Pakten som frelsens rammeverk"];
  } else if (bookId === 'exo') {
    author = "Moses";
    theme = "Utgang, forløsning, loven og tabernaklet";
    contextText = `2. Mosebok (Exodus) beskriver hvordan Gud frir sitt folk ut av trelldommen. I kapittel ${chapter} ser vi Hans mektige gjerninger, Hans ledelse i sky- og ildsøylen, eller Hans hellige lov gitt på Sinai.`;
    keyWord = "Pesach (פֶּסַח)";
    keyWordLang = "Hebraisk";
    keyWordMeaning = "Påske/forbigang. Viser til Guds nåde som går forbi de dører som er strøket med lammes blod, et profetisk bilde på Kristus.";
  } else if (bookId === 'psa') {
    author = "David m.fl.";
    theme = "Bønn, lovsang, klage og profetiske messianske syner";
    contextText = `Salmenes bok er israelittenes bønne- og sangbok. Salme ${chapter} er et dypt personlig og profetisk uttrykk for sjelen som søker Gud midt i prøvelser eller priser Hans hellighet.`;
    keyWord = "Tehillim (תְּהִλִּים)";
    keyWordLang = "Hebraisk";
    keyWordMeaning = "Lovsanger. Det hebraiske navnet på Salmenes bok, som viser at selv i klagen er målet alltid å reise opp Guds pris.";
  } else if (bookId === 'isa') {
    author = "Jesaja";
    theme = "Messias-profetier, dom, trøst og gjenopprettelse";
    contextText = `Profeten Jesaja taler med ekstrem klarsyn om både Guds rettferdige dom over folkeslagene og Hans ufattelige nåde gjennom den kommende Messias. Kapittel ${chapter} inneholder profetiske syner som peker mot evigheten.`;
    keyWord = "Kadosh (קָדוֹשׁ)";
    keyWordLang = "Hebraisk";
    keyWordMeaning = "Hellig. Jesajas yndlingsbetegnelse på Gud er 'Israels Hellige', som understreker Guds absolutte renhet og opphøydhet.";
  } else if (bookId === 'joh') {
    author = "Apostelen Johannes";
    theme = "Jesus som Guds Sønn, det evige Ordet, Åndens liv og kjærlighet";
    contextText = `Johannesevangeliet tegner et usedvanlig dypt bilde av Jesu guddommelighet og Hans intime relasjon til Faderen. Kapittel ${chapter} inviterer oss inn i dype åpenbaringer om troen, Ånden og evig liv.`;
    keyWord = "Logos (λόγος)";
    keyWordLang = "Gresk";
    keyWordMeaning = "Ordet. Johannes bruker dette filosofiske og teologiske uttrykket for å beskrive Jesus som Guds preeksistente og skapende selvåpenbaring.";
    themes = ["Jesus som livets kilde", "Fellesskapet med Faderen", "Troen som nøkkel to frelse"];
  } else if (bookId === 'rom') {
    author = "Apostelen Paulus";
    theme = "Rettferdiggjørelse av tro, Guds suverene nåde, helliggjørelse og misjon";
    contextText = `Romerbrevet er Paulus' teologiske mesterverk. I kapittel ${chapter} forklarer han med stor presisjon hvordan Guds rettferdighet opererer i den troendes liv gjennom troen på Kristus.`;
    keyWord = "Dikaiosyne (δικαιοσύνη)";
    keyWordLang = "Gresk";
    keyWordMeaning = "Rettferdighet. Viser til Guds egen rettferdige karakter og den rettferdige statusen Han tilregner syndere ved tro av bare nåde.";
  } else if (bookId === 'eph') {
    author = "Apostelen Paulus";
    theme = "Menigheten som Kristi kropp, de himmelske velsignelser, åndelig modenhet og kamp";
    contextText = `Efeserne viser oss Guds kosmiske plan for menigheten. I kapittel ${chapter} oppfordres vi til å forstå vår posisjon 'i Kristus' og leve ut vårt sanne kall som Hans hellige legeme.`;
    keyWord = "Charis (χάρις)";
    keyWordLang = "Gresk";
    keyWordMeaning = "Nåde. Paulus understreker at vi er frelst av nåde, ikke av egne gjerninger, for at ingen skal rose seg.";
  } else if (bookId === 'rev') {
    author = "Apostelen Johannes";
    theme = "Jesu Kristi åpenbaring, seieren over det onde, dommen og den nye skapningen";
    contextText = `Johannes' åpenbaring er Bibelens store klimaks. Kapittel ${chapter} avduker de apokalyptiske hendelsene, den himmelske tilbedelsen og Lammets endelige seier over dragen og mørkets makter.`;
    keyWord = "Apokalypse (ἀποκάλυψις)";
    keyWordLang = "Gresk";
    keyWordMeaning = "Åpenbaring/avsløring. Å dra til side et slør for å vise den åndelige virkeligheten bak historiens gang og Jesu endelige herredømme.";
  }
  
  const commentarySections = [
    {
      verses: "1-10",
      title: `Åpenbaring og teologisk fundament i ${bookName} ${chapter}`,
      text: `Innledningen av dette kapittelet setter en klar retning. Her ser vi hvordan Gud tar initiativet til å tale, rettlede eller gripe inn i historien. Det teologiske fundamentet understreker Guds absolutte autoritet og trofasthet mot sine løfter. For den troende er dette en invitasjon til å lytte med et ydmykt og mottakelig hjerte.`
    },
    {
      verses: "11-20",
      title: "Åndelig dybde og personlig overgivelse",
      text: `Midtpartiet utfordrer oss til praktisk anvendelse. Teksten viser ofte konflikten mellom kjødelig fornuft og åndelig tillit. Gjennom historiske eksempler eller læremessige utredninger blir vi minnet om at Guds tanker er høyere enn våre tanker, og at troen krever aktiv handling og lydighet i hverdagen.`
    },
    {
      verses: "21-28",
      title: "Seier, gjenopprettelse og fremtidig håp",
      text: `Kapitlets avslutning peker fremover mot Guds hellige og fullendte plan. Enten det handler om Israels redning, den troendes trygghet i Kristus, eller Kirkens eskatologiske seier, etterlater dette kapittelet oss med en dyp visshet om at Herren har full kontroll og vil fullføre det gode verket Han har begynt.`
    }
  ];

  return {
    overview: {
      title: `Studiekommentar: ${bookName} kapittel ${chapter}`,
      context: contextText,
      themes: themes,
      outline: outline
    },
    commentary: commentarySections,
    wordStudies: [
      {
        word: keyWord,
        language: keyWordLang,
        meaning: keyWordMeaning
      },
      {
        word: "Koinonia (κοινωνία)",
        language: "Gresk",
        meaning: "Betyr fellesskap, delaktighet eller samfunn. Beskriver det intime åndelige fellesskapet troende har med Faderen, Sønnen og Helligånden."
      }
    ],
    crossReferences: [
      { ref: "Hebreerne 11:1-6", desc: "Beskriver troens vesen og hvordan de gamle fikk godt vitnesbyrd ved tro." },
      { ref: "2. Timoteus 3:16-17", desc: "Slår fast at hele Skriften er innåndet av Gud og nyttig til lærdom og opptuktelse." },
      { ref: "Apostlenes gjerninger 17:11", desc: "Berea-jødene som gransket skriftene daglig for å se om alt stemte." }
    ]
  };
};

// Robust helpers to parse Bible references (e.g., "1. Joh 5:7", "Johannes 3,16", "Johannes 3 16", "Joh 3")
const parseBibleReference = (query) => {
  if (!query) return null;
  const clean = query.trim();
  // Match: (Optional Book number with space/dot) (Book name letters/dots) (whitespace) (Chapter number) (optional separators and verse number)
  // Matches "1. Joh 3:16", "1.Joh 3,16", "Johannes 3 16", "Joh 3"
  const match = clean.match(/^([1-3]?\s*\.?\s*[a-zA-Z\u00C0-\u00FF]+(?:\s*[a-zA-Z\u00C0-\u00FF]+)*)\s+(\d+)(?:[\s:,v\.\-]+(\d+))?/i);
  if (!match) return null;
  
  return {
    bookStr: match[1].trim(),
    chapter: parseInt(match[2], 10),
    verse: match[3] ? parseInt(match[3], 10) : null
  };
};

const findBibleBook = (bookStr) => {
  if (!bookStr) return null;
  const cleanStr = bookStr.toLowerCase().replace(/[\.\s]/g, ''); // "1.joh" -> "1joh", "joh" -> "joh"
  
  // 1. Exact match (ignoring dots and spaces)
  let found = BIBLE_BOOKS.find(b => 
    b.nor.toLowerCase().replace(/[\.\s]/g, '') === cleanStr ||
    b.eng.toLowerCase().replace(/[\.\s]/g, '') === cleanStr ||
    b.id.toLowerCase() === cleanStr
  );
  if (found) return found;

  // 2. Prefix match
  found = BIBLE_BOOKS.find(b => 
    b.nor.toLowerCase().replace(/[\.\s]/g, '').startsWith(cleanStr) ||
    b.eng.toLowerCase().replace(/[\.\s]/g, '').startsWith(cleanStr)
  );
  if (found) return found;

  // 3. Contains match
  found = BIBLE_BOOKS.find(b => 
    b.nor.toLowerCase().replace(/[\.\s]/g, '').includes(cleanStr) ||
    b.eng.toLowerCase().replace(/[\.\s]/g, '').includes(cleanStr)
  );
  return found;
};

export default function BibleView() {
  const navigate = useNavigate();
  const { showToast, sendAssistantMessage, user } = useApp();
  const [selectedBook, setSelectedBook] = useState(BIBLE_BOOKS.find(b => b.id === 'joh'));
  const [selectedChapter, setSelectedChapter] = useState(3);
  const [selectedTranslation, setSelectedTranslation] = useState('bibelselskap');
  const [searchQuery, setSearchQuery] = useState('');
  const [verses, setVerses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [highlightedVerse, setHighlightedVerse] = useState(null);
  const [testamentFilter, setTestamentFilter] = useState('all'); // all, GT, NT
  const topRef = useRef(null);

  // Study Bible & Commentary States
  const [showStudyPanel, setShowStudyPanel] = useState(false);
  const [studyTab, setStudyTab] = useState('overview'); // overview, commentary, cross, notes
  const [isGeneratingCommentary, setIsGeneratingCommentary] = useState(false);
  const [generatedCommentaries, setGeneratedCommentaries] = useState({});
  const [generationStep, setGenerationStep] = useState(0);

  // Multi-verse Selection States
  const [selectedVerses, setSelectedVerses] = useState([]);

  // Personal Study Notes States
  const [noteText, setNoteText] = useState('');
  const [noteSaveStatus, setNoteSaveStatus] = useState('idle'); // idle, loading, saving, saved, error
  const saveTimeoutRef = useRef(null);

  // Load notes for current book and chapter
  useEffect(() => {
    const loadNote = async () => {
      if (!selectedBook) return;
      const refKey = `${selectedBook.id}_${selectedChapter}`;
      const cacheKey = `hkm-bible-note-${user?.uid || 'guest'}-${refKey}`;
      
      // Try local cache first for instant loading
      const cached = localStorage.getItem(cacheKey);
      setNoteText(cached || '');
      setNoteSaveStatus('idle');
      
      if (!user?.uid) return;
      
      try {
        setNoteSaveStatus('loading');
        const docRef = doc(db, "bible_notes", `${user.uid}_${refKey}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const content = data.content || '';
          setNoteText(content);
          localStorage.setItem(cacheKey, content);
          setNoteSaveStatus('saved');
        } else {
          setNoteSaveStatus('idle');
        }
      } catch (err) {
        console.error("Feil ved lasting av notater:", err);
        setNoteSaveStatus('error');
      }
    };

    loadNote();
    
    // Clear any pending auto-saves when switching chapters
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  }, [selectedBook, selectedChapter, user]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleSaveNote = async (textToSave = noteText) => {
    if (!selectedBook) return;
    const refKey = `${selectedBook.id}_${selectedChapter}`;
    const cacheKey = `hkm-bible-note-${user?.uid || 'guest'}-${refKey}`;
    
    // Always save to localStorage immediately
    localStorage.setItem(cacheKey, textToSave);
    setNoteSaveStatus('saving');
    
    if (!user?.uid) {
      // For guests, we only have local storage
      setTimeout(() => {
        setNoteSaveStatus('saved');
      }, 500);
      return;
    }
    
    try {
      const docRef = doc(db, "bible_notes", `${user.uid}_${refKey}`);
      await setDoc(docRef, {
        userId: user.uid,
        userName: user.name || '',
        bookId: selectedBook.id,
        bookName: selectedBook.nor,
        chapter: selectedChapter,
        content: textToSave,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setNoteSaveStatus('saved');
    } catch (err) {
      console.error("Feil ved lagring av notater:", err);
      setNoteSaveStatus('error');
      showToast("Kunne ikke synkronisere notatene til skyen. De er lagret lokalt.");
    }
  };

  const handleNoteChange = (e) => {
    const text = e.target.value;
    setNoteText(text);
    setNoteSaveStatus('idle');
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      handleSaveNote(text);
    }, 1500);
  };

  const handleSendNoteToAssistant = () => {
    if (!noteText.trim()) {
      showToast("Skriv et notat først!");
      return;
    }
    const assistantPrompt = `Jeg studerer ${selectedBook.nor} ${selectedChapter} og har skrevet følgende notater og refleksjoner:\n\n"${noteText}"\n\nKan du hjelpe meg å utdype disse refleksjonene ut fra et teologisk og historisk perspektiv?`;
    sendAssistantMessage(assistantPrompt);
    showToast('Sendt til HKM Assistent! Åpne chatten nede til høyre.');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('hkm-open-chat'));
    }, 500);
  };

  const handleShareNoteToChat = () => {
    if (!noteText.trim()) {
      showToast("Skriv et notat først!");
      return;
    }
    const shareMessage = `Hei alle sammen! 📖 Her er mine studie-notater og refleksjoner fra **${selectedBook.nor} ${selectedChapter}** i dag:\n\n"${noteText}"`;
    localStorage.setItem('hkm-pending-chat-message', shareMessage);
    showToast('Deling klargjort! Sender deg til bønnefellesskapet...');
    setTimeout(() => {
      navigate('/student/chat');
    }, 1200);
  };

  const handleClearNote = async () => {
    if (!window.confirm("Er du sikker på at du vil slette notatet for dette kapittelet? Dette kan ikke angres.")) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    const refKey = `${selectedBook.id}_${selectedChapter}`;
    const cacheKey = `hkm-bible-note-${user?.uid || 'guest'}-${refKey}`;
    localStorage.removeItem(cacheKey);
    setNoteText('');
    setNoteSaveStatus('idle');
    
    if (!user?.uid) {
      showToast("Notatet er slettet.");
      return;
    }
    
    try {
      const docRef = doc(db, "bible_notes", `${user.uid}_${refKey}`);
      await deleteDoc(docRef);
      showToast("Notatet er slettet.");
    } catch (err) {
      console.error("Feil ved sletting av notater:", err);
      showToast("Kunne ikke slette notatet fra skyen, men det er fjernet lokalt.");
    }
  };

  // Reset verse selection when book or chapter changes
  useEffect(() => {
    setSelectedVerses([]);
  }, [selectedBook, selectedChapter]);

  const toggleVerseSelection = (verseNum) => {
    setSelectedVerses(prev => {
      if (prev.includes(verseNum)) {
        return prev.filter(num => num !== verseNum);
      } else {
        return [...prev, verseNum].sort((a, b) => a - b);
      }
    });
  };

  const handleBulkCopy = () => {
    if (selectedVerses.length === 0) return;
    const sortedVerses = [...selectedVerses].sort((a, b) => a - b);
    const targets = sortedVerses.map(num => verses.find(v => v.verse === num)).filter(Boolean);
    const combinedText = targets.map(v => `[${v.verse}] ${v.text.trim()}`).join(' ');
    const verseRange = sortedVerses.length === 1 ? `${sortedVerses[0]}` : `${sortedVerses[0]}-${sortedVerses[sortedVerses.length - 1]}`;
    const translationName = TRANSLATIONS.find(t => t.id === selectedTranslation)?.name || selectedTranslation.toUpperCase();
    
    const textToCopy = `"${combinedText}" — ${selectedBook.nor} ${selectedChapter}:${verseRange} (${translationName})`;
    navigator.clipboard.writeText(textToCopy);
    showToast(`${selectedVerses.length} vers kopiert til utklippstavlen!`);
    setSelectedVerses([]);
  };

  const handleBulkSendToAssistant = () => {
    if (selectedVerses.length === 0) return;
    const sortedVerses = [...selectedVerses].sort((a, b) => a - b);
    const targets = sortedVerses.map(num => verses.find(v => v.verse === num)).filter(Boolean);
    const combinedText = targets.map(v => `[${v.verse}] ${v.text.trim()}`).join(' ');
    const verseRange = sortedVerses.length === 1 ? `${sortedVerses[0]}` : `${sortedVerses[0]}-${sortedVerses[sortedVerses.length - 1]}`;
    
    const assistantPrompt = `Jeg studerer akkurat ${selectedBook.nor} ${selectedChapter}:${verseRange} som lyder:\n\n"${combinedText}"\n\nKan du gi meg en dypere teologisk, historisk og profetisk kommentar av disse versene og hvordan de henger sammen?`;
    sendAssistantMessage(assistantPrompt);
    showToast('Sendt til HKM Assistent! Åpne chatten nede til høyre.');
    setSelectedVerses([]);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('hkm-open-chat'));
    }, 500);
  };

  const handleBulkShareToChat = () => {
    if (selectedVerses.length === 0) return;
    const sortedVerses = [...selectedVerses].sort((a, b) => a - b);
    const targets = sortedVerses.map(num => verses.find(v => v.verse === num)).filter(Boolean);
    const combinedText = targets.map(v => `[${v.verse}] ${v.text.trim()}`).join(' ');
    const verseRange = sortedVerses.length === 1 ? `${sortedVerses[0]}` : `${sortedVerses[0]}-${sortedVerses[sortedVerses.length - 1]}`;
    const translationName = TRANSLATIONS.find(t => t.id === selectedTranslation)?.name || selectedTranslation.toUpperCase();
    
    const shareMessage = `Hei alle sammen! 📖 Her er et avsnitt fra bibelstudiet mitt i dag:\n\n*"${combinedText}"*\n— **${selectedBook.nor} ${selectedChapter}:${verseRange}** (${translationName})`;
    localStorage.setItem('hkm-pending-chat-message', shareMessage);
    showToast('Deling klargjort! Sender deg til bønnefellesskapet...');
    setSelectedVerses([]);
    setTimeout(() => {
      navigate('/student/chat');
    }, 1200);
  };

  const handleGenerateCommentary = () => {
    setIsGeneratingCommentary(true);
    setGenerationStep(0);
    
    const steps = [
      "Søker i de hellige skrifter...",
      "Analyserer teologisk kontekst...",
      "Slår opp gresk og hebraisk grunntekst...",
      "Utarbeider eksegetisk kommentar...",
      "Ferdigstiller studiekommentar..."
    ];
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setGenerationStep(currentStep);
      } else {
        clearInterval(interval);
        const refKey = `${selectedBook.id}_${selectedChapter}`;
        const computed = generateDynamicCommentary(selectedBook, selectedChapter);
        setGeneratedCommentaries(prev => ({
          ...prev,
          [refKey]: computed
        }));
        setIsGeneratingCommentary(false);
        setStudyTab('overview');
        showToast(`Teologisk kommentar for ${selectedBook.nor} ${selectedChapter} er klar!`);
      }
    }, 600);
  };

  // Load verses when book, chapter, or translation changes
  useEffect(() => {
    fetchBibleChapter();
  }, [selectedBook, selectedChapter, selectedTranslation]);

  // Handle smooth scroll to highlighted verse when verses finish loading
  useEffect(() => {
    if (highlightedVerse && verses.length > 0) {
      setTimeout(() => {
        const el = document.getElementById(`v-${highlightedVerse}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 400);
    }
  }, [highlightedVerse, verses]);

  const fetchBibleChapter = async () => {
    setIsLoading(true);
    setVerses([]);
    try {
      const bookIndex = BIBLE_BOOKS.findIndex(b => b.id === selectedBook.id);
      const bookNumber = bookIndex + 1;
      const url = `https://api.getbible.net/v2/${selectedTranslation}/${bookNumber}/${selectedChapter}.json`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Kunne ikke hente bibeldata');
      }

      const data = await response.json();
      setVerses(data.verses || []);
    } catch (err) {
      console.error(err);
      showToast('Klarte ikke å laste bibelkapittelet. Sjekk internettforbindelsen.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // 1. Try parsing as a specific Bible reference (e.g. "Johannes 3:16" or "1. Joh 5:7")
    const parsedRef = parseBibleReference(searchQuery);
    if (parsedRef) {
      const foundBook = findBibleBook(parsedRef.bookStr);
      if (foundBook) {
        setSelectedBook(foundBook);
        const clampedChapter = Math.max(1, Math.min(parsedRef.chapter, foundBook.chapters));
        setSelectedChapter(clampedChapter);
        
        if (parsedRef.verse) {
          setHighlightedVerse(parsedRef.verse);
          showToast(`Viser ${foundBook.nor} ${clampedChapter} med vers ${parsedRef.verse} uthevet for kontekst!`);
        } else {
          setHighlightedVerse(null);
          showToast(`Viser ${foundBook.nor} ${clampedChapter}!`);
        }
        setSearchQuery('');
        return;
      }
    }

    // 2. Fallback to API-based keyword or complex query search
    setIsLoading(true);
    setVerses([]);
    try {
      let cleanQuery = searchQuery.trim();
      // Replace norwegian book names with english for the API
      BIBLE_BOOKS.forEach(book => {
        const norLower = book.nor.toLowerCase();
        if (cleanQuery.toLowerCase().startsWith(norLower)) {
          cleanQuery = cleanQuery.replace(new RegExp(book.nor, 'i'), book.eng);
        }
      });

      const url = `https://query.getbible.net/v2/${selectedTranslation}/${encodeURIComponent(cleanQuery)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Kunne ikke finne skriftstedet');
      }

      const data = await response.json();
      const keys = Object.keys(data);
      if (keys.length > 0) {
        const resultVerses = [];
        let detectedBook = null;
        let detectedChapter = 1;

        keys.forEach(key => {
          const item = data[key];
          if (item.verses) {
            resultVerses.push(...item.verses);
          }
          if (!detectedBook && item.book_name) {
            const found = BIBLE_BOOKS.find(b => 
              b.eng.toLowerCase() === item.book_name.toLowerCase() || 
              b.nor.toLowerCase() === item.book_name.toLowerCase()
            );
            if (found) {
              detectedBook = found;
              detectedChapter = item.chapter || 1;
            }
          }
        });

        if (resultVerses.length > 0) {
          // If we got verses, let's check if the search query looks like a specific verse query that the API returned
          // If we detected a single book and chapter, and the user's query contains a number (likely a chapter/verse),
          // let's load the entire chapter instead of showing only a single verse! This is a wonderful UX fail-safe!
          const hasNumbers = /\d+/.test(searchQuery);
          if (detectedBook && hasNumbers && resultVerses.length === 1) {
            setSelectedBook(detectedBook);
            setSelectedChapter(detectedChapter);
            setHighlightedVerse(resultVerses[0].verse);
            showToast(`Viser hele ${detectedBook.nor} ${detectedChapter} med vers ${resultVerses[0].verse} uthevet!`);
            setSearchQuery('');
            return;
          }

          setVerses(resultVerses);
          if (detectedBook) {
            setSelectedBook(detectedBook);
            setSelectedChapter(detectedChapter);
          }
          showToast('Søk fullført!');
        } else {
          showToast('Ingen vers funnet for dette søket.');
        }
      } else {
        showToast('Fant ikke skriftstedet. Prøv f.eks. "Johannes 3:16" eller "Salme 23".');
      }
    } catch (err) {
      console.error(err);
      showToast('Fant ikke skriftstedet. Sjekk stavelsen og formatet (f.eks. "Johannes 3:16").');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (verse) => {
    const textToCopy = `"${verse.text.trim()}" — ${selectedBook.nor} ${verse.chapter}:${verse.verse} (${TRANSLATIONS.find(t => t.id === selectedTranslation)?.name})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(verse.verse);
    showToast('Kopiert til utklippstavle!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareToChat = (verse) => {
    const shareMessage = `Her er et kraftfullt skriftsted jeg leste i Bibelen:\n\n*"${verse.text.trim()}"*\n— **${selectedBook.nor} ${verse.chapter}:${verse.verse}** (${TRANSLATIONS.find(t => t.id === selectedTranslation)?.name})`;
    localStorage.setItem('hkm-pending-chat-message', shareMessage);
    showToast('Klar til å deles! Sender deg til bønnefellesskapet...');
    setTimeout(() => {
      navigate('/student/chat');
    }, 1200);
  };

  const handleSendToAssistant = (verse) => {
    const assistantPrompt = `Jeg leste akkurat ${selectedBook.nor} ${verse.chapter}:${verse.verse} som sier: "${verse.text.trim()}". Kan du gi meg en dypere teologisk og profetisk forklaring av dette skriftstedet og hva det betyr for oss i dag?`;
    sendAssistantMessage(assistantPrompt);
    showToast('Sendt til HKM Assistent! Åpne chatten nede til høyre.');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('hkm-open-chat'));
    }, 500);
  };

  const navigateChapter = (direction) => {
    setHighlightedVerse(null); // Reset highlight when navigating chapters
    if (direction === 'prev') {
      if (selectedChapter > 1) {
        setSelectedChapter(prev => prev - 1);
      } else {
        const currentIndex = BIBLE_BOOKS.findIndex(b => b.id === selectedBook.id);
        if (currentIndex > 0) {
          const prevBook = BIBLE_BOOKS[currentIndex - 1];
          setSelectedBook(prevBook);
          setSelectedChapter(prevBook.chapters);
        }
      }
    } else {
      if (selectedChapter < selectedBook.chapters) {
        setSelectedChapter(prev => prev + 1);
      } else {
        const currentIndex = BIBLE_BOOKS.findIndex(b => b.id === selectedBook.id);
        if (currentIndex < BIBLE_BOOKS.length - 1) {
          const nextBook = BIBLE_BOOKS[currentIndex + 1];
          setSelectedBook(nextBook);
          setSelectedChapter(1);
        }
      }
    }
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredBooks = BIBLE_BOOKS.filter(book => {
    if (testamentFilter === 'all') return true;
    return book.testament === testamentFilter;
  });

  return (
    <main className="flex-grow p-4 md:p-10 space-y-8 overflow-x-hidden" ref={topRef}>
      
      {/* Header and navigation */}
      <section className="space-y-3">
        <nav className="flex items-center gap-2 text-xs font-semibold text-outline">
          <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/student/dashboard')}>Hjem</span>
          <span>/</span>
          <span className="text-primary font-bold">Bibelen</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary flex items-center gap-2.5">
              <BookOpen className="text-primary" size={28} />
              Den Hellige Skrift
            </h1>
            <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
              Utforsk, les og studer Guds ord i ulike oversettelser. Klikk på vers for å dele dem med bønnefellesskapet, kopiere eller be HKM Assistenten om en dypere teologisk utredning.
            </p>
          </div>

          {/* Quick search input */}
          <form onSubmit={handleSearch} className="w-full md:w-80 shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Søk f.eks. 'Johannes 3:16'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-outline-variant/60 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium shadow-sm"
              />
               <button
                type="submit"
                className="absolute left-1.5 top-0 bottom-0 my-auto h-8 w-8 flex items-center justify-center text-primary hover:text-primary-container hover:bg-slate-100/60 rounded-lg transition-colors m-0 p-0 border-none outline-none cursor-pointer"
              >
                <Search size={18} />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Main interactive grid layout */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Book and chapter selection pane */}
        <div className={`${showStudyPanel ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-6`}>
          <div className="bg-white border border-outline-variant/20 rounded-2xl p-5 shadow-sm space-y-5">
            <h2 className="font-serif font-bold text-base text-primary flex items-center gap-2 border-b border-slate-100 pb-3">
              <BookMarked size={18} />
              Bok- og kapittelvelger
            </h2>

            {/* Translation Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">Oversettelse</label>
              <select
                value={selectedTranslation}
                onChange={(e) => setSelectedTranslation(e.target.value)}
                className="w-full bg-slate-50 border border-outline-variant rounded-xl px-3 py-2.5 text-sm font-semibold text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {TRANSLATIONS.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Testament Filter Toggles */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-xl">
              <button
                onClick={() => setTestamentFilter('all')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  testamentFilter === 'all' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Alle
              </button>
              <button
                onClick={() => setTestamentFilter('GT')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  testamentFilter === 'GT' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                GT
              </button>
              <button
                onClick={() => setTestamentFilter('NT')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  testamentFilter === 'NT' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                NT
              </button>
            </div>

            {/* Books List (scrollable) */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">Bibelbok</label>
              <div className="h-60 overflow-y-auto border border-outline-variant/40 rounded-xl bg-slate-50/50 p-2 space-y-1 scrollbar-thin">
                {filteredBooks.map(book => (
                  <button
                    key={book.id}
                    onClick={() => {
                      setSelectedBook(book);
                      setSelectedChapter(1);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex justify-between items-center transition-all ${
                      selectedBook.id === book.id 
                        ? 'bg-primary/5 text-primary border border-primary/20 shadow-sm font-bold' 
                        : 'text-on-surface-variant hover:bg-slate-100 hover:text-primary'
                    }`}
                  >
                    <span>{book.nor}</span>
                    <span className="text-[10px] opacity-60 font-mono">{book.testament}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Chapters Grid */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">
                Velg Kapittel (1 - {selectedBook.chapters})
              </label>
              <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1 scrollbar-thin">
                {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(chap => (
                  <button
                    key={chap}
                    onClick={() => setSelectedChapter(chap)}
                    className={`h-9 w-full rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                      selectedChapter === chap 
                        ? 'bg-primary text-white shadow-md font-extrabold' 
                        : 'bg-slate-50 text-on-surface-variant border border-outline-variant/30 hover:bg-slate-100 hover:text-primary'
                    }`}
                  >
                    {chap}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Middle Column: Bible reading pane */}
        <div className={`${showStudyPanel ? 'lg:col-span-5' : 'lg:col-span-8'} space-y-6`}>
          <div className="bg-white border border-outline-variant/20 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between min-h-[500px]">
            
            {/* Reading header with next/prev buttons and study panel toggle */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <button 
                onClick={() => navigateChapter('prev')}
                className="p-2 bg-slate-50 text-primary border border-outline-variant/40 rounded-xl hover:bg-slate-100 hover:text-primary-container active:scale-[0.97] transition-all cursor-pointer"
                title="Forrige kapittel"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="text-center flex flex-col items-center">
                <h2 className="font-serif font-extrabold text-xl md:text-2xl text-primary leading-tight">
                  {selectedBook.nor} {selectedChapter}
                </h2>
                <span className="text-[10px] font-bold text-outline tracking-wider uppercase font-mono mt-1 block">
                  {TRANSLATIONS.find(t => t.id === selectedTranslation)?.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowStudyPanel(!showStudyPanel)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all active:scale-[0.97] cursor-pointer ${
                    showStudyPanel 
                      ? 'bg-burnt-orange text-white border-burnt-orange shadow-md shadow-burnt-orange/15' 
                      : 'bg-slate-50 text-primary border-outline-variant/40 hover:bg-slate-100'
                  }`}
                  title="Åpne studiebibel og kommentarer"
                >
                  <Sparkles size={14} className={showStudyPanel ? 'animate-pulse' : ''} />
                  <span className="hidden sm:inline">{showStudyPanel ? "Lukk studie" : "Studiebibel"}</span>
                </button>

                <button 
                  onClick={() => navigateChapter('next')}
                  className="p-2 bg-slate-50 text-primary border border-outline-variant/40 rounded-xl hover:bg-slate-100 hover:text-primary-container active:scale-[0.97] transition-all cursor-pointer"
                  title="Neste kapittel"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Reading body */}
            <div className="flex-grow relative">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center space-y-4"
                  >
                    <RefreshCw className="text-primary animate-spin" size={32} />
                    <p className="text-xs text-outline font-bold uppercase tracking-wider">Henter skriftsteder...</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2 text-justify select-text font-serif leading-loose"
                  >
                    {verses.length > 0 ? (
                      verses.map((verse) => (
                        <div 
                          id={`v-${verse.verse}`}
                          key={`${verse.chapter}-${verse.verse}`}
                          onClick={() => toggleVerseSelection(verse.verse)}
                          className={`group py-1.5 px-3 rounded-xl transition-all cursor-pointer relative border ${
                            selectedVerses.includes(verse.verse) || highlightedVerse === verse.verse 
                              ? 'bg-primary/5 border-primary/20 shadow-sm shadow-primary/5' 
                              : 'hover:bg-slate-50/80 border-transparent'
                          }`}
                        >
                          <p className="text-sm md:text-base text-on-surface leading-relaxed pr-24">
                            <span className="font-sans font-bold text-primary select-none mr-2.5 text-xs inline-block text-center w-5 h-5 leading-5 rounded bg-slate-100/80 group-hover:bg-primary group-hover:text-white transition-colors">
                              {verse.verse}
                            </span>
                            {verse.text}
                          </p>

                          {/* Quick Actions (only visible on hover or click) */}
                          <div className={`absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white border border-outline-variant/40 p-1 rounded-lg shadow-sm transition-all duration-200 ${
                            highlightedVerse === verse.verse ? 'opacity-100 animate-fade-in' : 'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto'
                          }`}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(verse);
                              }}
                              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-primary rounded-md transition-colors cursor-pointer"
                              title="Kopier vers"
                            >
                              {copiedId === verse.verse ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendToAssistant(verse);
                              }}
                              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-burnt-orange rounded-md transition-colors cursor-pointer"
                              title="Spør HKM Assistent"
                            >
                              <Sparkles size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShareToChat(verse);
                              }}
                              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-primary rounded-md transition-colors cursor-pointer"
                              title="Del med Bønnefellesskap"
                            >
                              <Send size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-outline font-medium text-sm">
                        Ingen vers tilgjengelig. Prøv å laste på nytt.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Floating helper note */}
            <div className="mt-8 border-t border-slate-100 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-outline font-medium">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Share2 size={13} />
                Klikk på et vers for å dele det, få forklaring eller krysslese kommentarer.
              </span>
              <span className="italic">
                Husk å undersøke skriftene selv for å hente full åpenbaring!
              </span>
            </div>

            {/* Floating control bar for multi-verse selection */}
            <AnimatePresence>
              {selectedVerses.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-[#561291]/95 backdrop-blur border border-[#561291]/20 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-white shadow-xl mt-6 font-sans pointer-events-auto shrink-0"
                  style={{ transform: 'translateZ(0)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-burnt-orange animate-pulse" />
                    <span className="text-xs font-bold">
                      {selectedVerses.length} {selectedVerses.length === 1 ? 'vers' : 'vers'} valgt
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <button 
                      onClick={handleBulkCopy}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 active:scale-[0.96] rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Copy size={13} />
                      <span>Kopier</span>
                    </button>
                    <button 
                      onClick={handleBulkSendToAssistant}
                      className="px-3 py-1.5 bg-burnt-orange hover:bg-burnt-orange-dark active:scale-[0.96] rounded-xl font-bold transition-all flex items-center gap-1 shadow-sm shadow-burnt-orange/20 cursor-pointer"
                    >
                      <Sparkles size={13} />
                      <span>Spør HKM</span>
                    </button>
                    <button 
                      onClick={handleBulkShareToChat}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 active:scale-[0.96] rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Send size={13} />
                      <span>Del i chat</span>
                    </button>
                    <button 
                      onClick={() => setSelectedVerses([])}
                      className="px-2.5 py-1.5 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer font-bold"
                    >
                      Nullstill
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* Right Column: Study Bible & Commentary Panel */}
        {showStudyPanel && (
          <div className="lg:col-span-4 space-y-6 animate-fade-in">
            <div className="bg-white border border-outline-variant/20 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col min-h-[500px]">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-burnt-orange uppercase tracking-wider block">Studiebibel & Kommentar</span>
                  <h3 className="font-serif font-extrabold text-base text-primary">
                    {selectedBook.nor} {selectedChapter}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowStudyPanel(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-all cursor-pointer"
                  title="Lukk studiepanel"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Loader or Content */}
              {isGeneratingCommentary ? (
                <div className="flex-grow flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <RefreshCw className="text-burnt-orange animate-spin" size={28} />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-primary uppercase tracking-wide">Analyserer skriftene...</p>
                    <p className="text-[11px] text-outline font-medium animate-pulse">
                      {
                        generationStep === 0 ? "Søker i de hellige skrifter..." :
                        generationStep === 1 ? "Analyserer teologisk kontekst..." :
                        generationStep === 2 ? "Slår opp gresk og hebraisk grunntekst..." :
                        generationStep === 3 ? "Utarbeider eksegetisk kommentar..." :
                        "Ferdigstiller studiekommentar..."
                      }
                    </p>
                  </div>
                </div>
              ) : (
                (() => {
                  const refKey = `${selectedBook.id}_${selectedChapter}`;
                  const studyData = STUDY_BIBLE_DATA[refKey] || generatedCommentaries[refKey];

                  if (!studyData) {
                    return (
                      <div className="flex-grow flex flex-col items-center justify-center py-12 px-4 text-center space-y-5">
                        <div className="h-12 w-12 rounded-full bg-burnt-orange/5 flex items-center justify-center text-burnt-orange">
                          <Sparkles size={22} className="animate-pulse" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-serif font-bold text-sm text-primary">Ingen studiekommentar lastet inn</h4>
                          <p className="text-xs text-on-surface-variant leading-relaxed">
                            Vil du at HKM teologiske AI-assistent skal utarbeide en eksegetisk og profetisk kommentar av dette kapittelet?
                          </p>
                        </div>
                        <button
                          onClick={handleGenerateCommentary}
                          className="w-full py-2.5 bg-burnt-orange text-white rounded-xl text-xs font-bold hover:bg-burnt-orange-dark shadow-sm active:scale-[0.97] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles size={13} />
                          <span>Generer studiekommentar</span>
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="flex-grow flex flex-col min-h-0 space-y-4">
                      
                      {/* Tabs */}
                      <div className="flex bg-slate-50 p-1 rounded-xl text-[10px] font-bold shrink-0">
                        <button 
                          onClick={() => setStudyTab('overview')}
                          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${studyTab === 'overview' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
                        >
                          Oversikt
                        </button>
                        <button 
                          onClick={() => setStudyTab('commentary')}
                          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${studyTab === 'commentary' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
                        >
                          Kommentar
                        </button>
                        <button 
                          onClick={() => setStudyTab('cross')}
                          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${studyTab === 'cross' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
                        >
                          Ord & Ref
                        </button>
                        <button 
                          onClick={() => setStudyTab('notes')}
                          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${studyTab === 'notes' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
                        >
                          Notater
                        </button>
                      </div>

                      {/* Tab Content */}
                      <div className="flex-grow overflow-y-auto max-h-[480px] pr-1 space-y-4 scrollbar-thin text-xs">
                        
                        {studyTab === 'overview' && (
                          <div className="space-y-4 animate-fade-in">
                            <div className="bg-slate-50 border border-outline-variant/30 p-3.5 rounded-xl space-y-2">
                              <h5 className="font-serif font-bold text-primary text-xs flex items-center gap-1.5">
                                <BookOpen size={12} className="text-burnt-orange" />
                                Teologisk sammendrag
                              </h5>
                              <p className="text-on-surface-variant leading-relaxed">{studyData.overview.context}</p>
                            </div>

                            <div className="space-y-2">
                              <h5 className="font-bold text-primary text-[10px] uppercase tracking-wider block">Sentralt åndelig tema</h5>
                              <ul className="space-y-1.5">
                                {studyData.overview.themes.map((theme, i) => (
                                  <li key={i} className="flex gap-2 text-on-surface-variant leading-relaxed items-start">
                                    <span className="h-1.5 w-1.5 rounded-full bg-burnt-orange mt-1.5 shrink-0" />
                                    <span>{theme}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="space-y-2 pt-2 border-t">
                              <h5 className="font-bold text-primary text-[10px] uppercase tracking-wider block">Strukturell disposisjon</h5>
                              <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100 font-mono text-[10px] text-on-surface-variant whitespace-pre-line leading-relaxed">
                                {studyData.overview.outline}
                              </div>
                            </div>
                          </div>
                        )}

                        {studyTab === 'commentary' && (
                          <div className="space-y-4 animate-fade-in leading-relaxed text-justify">
                            {studyData.commentary.map((section, idx) => (
                              <div key={idx} className="border-b border-slate-100 pb-3 last:border-b-0 space-y-1.5">
                                <div className="flex justify-between items-center bg-slate-50 px-2.5 py-1 rounded-lg">
                                  <span className="font-bold text-primary text-[10px] uppercase tracking-wider">Vers {section.verses}</span>
                                  <span className="font-serif font-bold text-[11px] text-burnt-orange">{section.title}</span>
                                </div>
                                <p className="text-on-surface-variant leading-relaxed text-xs pl-1">
                                  {section.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {studyTab === 'cross' && (
                          <div className="space-y-4 animate-fade-in">
                            <div className="space-y-2.5">
                              <h5 className="font-bold text-primary text-[10px] uppercase tracking-wider block">Nøkkelord på grunnteksten</h5>
                              <div className="space-y-3">
                                {studyData.wordStudies.map((word, idx) => (
                                  <div key={idx} className="bg-primary/5 border border-primary/10 p-3 rounded-xl space-y-1">
                                    <div className="flex justify-between items-center">
                                      <span className="font-bold text-primary text-xs">{word.word}</span>
                                      <span className="text-[10px] text-outline font-semibold font-sans">{word.language}</span>
                                    </div>
                                    <p className="text-on-surface-variant text-[11px] leading-relaxed">
                                      {word.meaning}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2.5 pt-3 border-t">
                              <h5 className="font-bold text-primary text-[10px] uppercase tracking-wider block">Teologiske Kryssreferanser</h5>
                              <div className="space-y-2">
                                {studyData.crossReferences.map((cross, idx) => (
                                  <div 
                                    key={idx} 
                                    onClick={() => {
                                      setSearchQuery(cross.ref);
                                      showToast(`Søker opp kryssreferanse: ${cross.ref}`);
                                    }}
                                    className="p-2.5 bg-slate-50 border hover:bg-slate-100 hover:border-primary/20 rounded-xl cursor-pointer transition-all flex flex-col space-y-0.5 group"
                                  >
                                    <span className="font-bold text-primary group-hover:text-burnt-orange transition-colors flex items-center gap-1 text-[11px]">
                                      <BookOpen size={10} />
                                      {cross.ref}
                                    </span>
                                    <span className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
                                      {cross.desc}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {studyTab === 'notes' && (
                          <div className="space-y-4 animate-fade-in flex flex-col h-full pb-2">
                            <div className="flex justify-between items-center bg-slate-50 px-2.5 py-1.5 rounded-lg">
                              <span className="font-bold text-primary text-[10px] uppercase tracking-wider">Personlige notater</span>
                              <div className="flex items-center gap-1.5 font-sans">
                                {noteSaveStatus === 'loading' && (
                                  <span className="text-[10px] text-outline flex items-center gap-1">
                                    <Loader2 className="animate-spin text-primary" size={10} />
                                    Laster...
                                  </span>
                                )}
                                {noteSaveStatus === 'saving' && (
                                  <span className="text-[10px] text-burnt-orange flex items-center gap-1 font-bold">
                                    <Loader2 className="animate-spin text-burnt-orange" size={10} />
                                    Lagrer...
                                  </span>
                                )}
                                {noteSaveStatus === 'saved' && (
                                  <span className="text-[10px] text-green-600 flex items-center gap-1 font-bold">
                                    <Check size={10} className="stroke-[3]" />
                                    Lagret i skyen
                                  </span>
                                )}
                                {noteSaveStatus === 'error' && (
                                  <span className="text-[10px] text-rose-500 font-bold">
                                    Kun lagret lokalt
                                  </span>
                                )}
                                {noteSaveStatus === 'idle' && noteText && (
                                  <span className="text-[10px] text-outline font-medium italic">
                                    Endret...
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="relative flex-grow">
                              <textarea
                                value={noteText}
                                onChange={handleNoteChange}
                                placeholder="Skriv ned dine personlige notater, åpenbaringer, tanker og bønner for dette kapittelet her... Endringer lagres automatisk."
                                className="w-full h-[220px] bg-slate-50/50 border border-outline-variant/35 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all leading-relaxed font-sans placeholder:italic resize-none scrollbar-thin text-on-surface"
                              />
                            </div>

                            {/* Utility and Action Row */}
                            <div className="grid grid-cols-2 gap-2 shrink-0 font-sans">
                              <button
                                onClick={handleSendNoteToAssistant}
                                disabled={!noteText.trim()}
                                className="py-2 px-3 bg-burnt-orange disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-[10px] font-bold hover:bg-burnt-orange-dark shadow-sm active:scale-[0.97] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Sparkles size={11} />
                                <span>Spør HKM</span>
                              </button>
                              <button
                                onClick={handleShareNoteToChat}
                                disabled={!noteText.trim()}
                                className="py-2 px-3 bg-[#561291]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-[10px] font-bold hover:bg-[#561291] shadow-sm active:scale-[0.97] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Send size={11} />
                                <span>Del i chat</span>
                              </button>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t text-[10px] shrink-0 font-sans">
                              <button
                                onClick={() => handleSaveNote(noteText)}
                                className="text-primary hover:text-primary-container font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Save size={12} />
                                <span>Lagre nå</span>
                              </button>
                              <button
                                onClick={handleClearNote}
                                className="text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 size={12} />
                                <span>Slett notat</span>
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })()
              )}

            </div>
          </div>
        )}

      </section>

    </main>
  );
}
