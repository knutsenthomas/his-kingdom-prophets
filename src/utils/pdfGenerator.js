import { jsPDF } from 'jspdf';

export function generateFastingPdf(cmsContent, language) {
  const isEn = language === 'en';

  const getCmsValue = (key, fallback) => {
    if (isEn) {
      return cmsContent?.[`${key}-en`] || cmsContent?.[key] || fallback;
    }
    return cmsContent?.[key] || fallback;
  };
  
  // Custom CMS keys with default fallback text values
  const title = getCmsValue('pdf_fasting_title', isEn ? "Biblical Fasting & Spiritual Discipline" : "Bibelsk Faste og Åndelig Disiplin");
  const subtitle = getCmsValue('pdf_fasting_subtitle', isEn ? "A practical and theological guide to fasting, prayer, and revelation" : "En praktisk og teologisk guide til fasting, bønn og åpenbaring");
  const intro = getCmsValue('pdf_fasting_intro', isEn 
    ? "Welcome to the study booklet on Biblical Fasting. Fasting is not a method to force God's hand, but a spiritual discipline that aligns our hearts, clears away noise, and makes us more receptive to the Holy Spirit's guidance. Throughout history, fasting has been the key to prophetic breakthrough, deeper revelation, and personal sanctification." 
    : "Velkommen til studieheftet for Bibelsk Faste. Faste er ikke en metode for å tvinge Guds hånd, men en åndelig disiplin som innstiller våre hjerter, rydder bort støy og gjør oss mer mottakelige for Den Hellige Ånds ledelse. Gjennom historien har faste vært nøkkelen til profetisk gjennombrudd, dypere åpenbaring og personlig helliggjørelse.");
  const sec1Title = getCmsValue('pdf_fasting_sec1_title', isEn ? "1. The Biblical Foundation of Fasting" : "1. Det bibelske fundamentet for faste");
  const sec1Text = getCmsValue('pdf_fasting_sec1_text', isEn 
    ? "In Matthew 6:16, Jesus says: 'When you fast...'. He assumes that fasting is a natural part of a disciple's life. Fasting is about abstaining from physical nourishment to seek spiritual satisfaction. In Isaiah 58, we see the kind of fast that pleases God — a fast that looses the bonds of wickedness and sets the oppressed free." 
    : "I Matteus 6,16 sier Jesus: 'Når dere faster...'. Han forutsetter at faste er en naturlig del av en disippels liv. Faste handler om å avstå fra fysisk næring for å søke åndelig metthet. I Jesaja 58 ser vi hva slags faste Gud har behag i — en faste som løser ugudelighets bånd og setter de undertrykte fri.");
  const sec2Title = getCmsValue('pdf_fasting_sec2_title', isEn ? "2. Practical Guidelines for Fasting" : "2. Praktiske retningslinjer for faste");
  const sec2Text = getCmsValue('pdf_fasting_sec2_text', isEn 
    ? "Hydration: Drink plenty of water during the fast. The body eliminates waste products, and sufficient fluid content prevents headaches and lethargy. Preparation: Taper off coffee, sugar, and heavy food a couple of days before a longer fast to avoid severe withdrawals. Time with God: Fasting without prayer is just a diet. Set aside the time you would normally spend on meals and cooking for Bible reading, quiet listening, and prayer." 
    : "Hydrering: Drikk rikelig med vann under fasten. Kroppen skiller ut avfallsstoffer, og tilstrekkelig væskeinnhold forhindrer hodepine og sløvhet. Forberedelse: Trapp ned på kaffe, sukker og tung mat et par dager før en lengre faste for å unngå kraftige abstinenser. Tid med Gud: Faste uten bønn er kun en diett. Sett av den tiden du vanligvis ville brukt på måltider og matlaging til bibellesning, stille lytting og bønn.");
  const prayerTitle = getCmsValue('pdf_fasting_prayer_title', isEn ? "Prayer Proclamation for the Fast:" : "Bønne-proklamasjon for fasten:");
  const prayerText = getCmsValue('pdf_fasting_prayer_text', isEn 
    ? "'Lord, I consecrate my body and mind to You during this fast. Let my flesh recede, and let Your Holy Spirit fill me anew. I pray for clarity, revelation, and strength to walk in the prepared ministry You have for my life. In Jesus' name, Amen.'" 
    : "'Herre, jeg innvier mitt legeme og mitt sinn til Deg under denne fasten. La mitt kjød vike, og la Din Hellige Ånd fylle meg på ny. Jeg ber om klarsyn, åpenbaring og styrke til å gå i den ferdiglagte tjenesten Du har for mitt liv. I Jesu navn, Amen.'");

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  // A4 size: 595.28 x 841.89 points
  const startX = 54;
  const endX = 541;
  const printWidth = 487;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor('#3c096c');
  doc.text(isEn ? "HIS KINGDOM PROPHETS — STUDY RESOURCES" : "HIS KINGDOM PROPHETS — STUDIERESSURSER", startX, 52);
  doc.setDrawColor('#dec2ef');
  doc.setLineWidth(0.75);
  doc.line(startX, 58, endX, 58);

  const tableData = isEn ? [
    ["Fasting Type", "Scripture", "Purpose & Result"],
    ["Moses' fast (40 days)", "Exo 34:28", "Receive God's law, intimate fellowship with God."],
    ["Daniel's fast (Partial)", "Dan 10:2-3", "Seek understanding, humble oneself before God."],
    ["Esther's fast (3 days)", "Est 4:16", "Crisis prayer, protection, and breakthrough."],
    ["Jesus' fast (40 days)", "Luke 4:1-2", "Empowerment before ministry, victory over temptation."]
  ] : [
    ["Faste-type", "Skriftsted", "Hensikt & Resultat"],
    ["Moses' faste (40 dager)", "2. Mos 34,28", "Motta Guds lov, intimt samfunn med Gud."],
    ["Daniels faste (Delvis faste)", "Dan 10,2-3", "Søke forståelse, ydmyke seg for Gud."],
    ["Esters faste (3 dager)", "Est 4,16", "Krisebønn, beskyttelse og gjennombrudd."],
    ["Jesu faste (40 dager)", "Luk 4,1-2", "Utrustning før tjenestestart, seier over fristelse."]
  ];

  const colWidths = [125, 83, 279]; // sum = 487 pt

  // Define layout items for visual flex layout engine
  const layoutItems = [];
  layoutItems.push({ type: 'text', text: title, fontSize: 22, fontStyle: 'bold', color: '#3c096c', leading: 26, weightAfter: 0.4 });
  layoutItems.push({ type: 'text', text: subtitle, fontSize: 11.5, fontStyle: 'bold', color: '#c5a059', leading: 15, weightAfter: 0.6 });
  layoutItems.push({ type: 'divider', height: 1.25, weightAfter: 0.8 });
  layoutItems.push({ type: 'text', text: intro, fontSize: 10.5, leading: 17, weightAfter: 1.4 });
  layoutItems.push({ type: 'text', text: sec1Title, fontSize: 13, fontStyle: 'bold', color: '#3c096c', leading: 18, weightAfter: 0.5 });
  layoutItems.push({ type: 'text', text: sec1Text, fontSize: 10.5, leading: 17, weightAfter: 1.2 });
  layoutItems.push({ type: 'table', tableData, colWidths, weightAfter: 1.4 });
  layoutItems.push({ type: 'text', text: sec2Title, fontSize: 13, fontStyle: 'bold', color: '#3c096c', leading: 18, weightAfter: 0.5 });

  const sec2Paragraphs = sec2Text.split(/<br\s*\/?>/i);
  sec2Paragraphs.forEach((pText, pIndex) => {
    const cleanText = pText.replace(/<\/?b>/gi, "").trim();
    if (!cleanText) return;
    const isLast = pIndex === sec2Paragraphs.length - 1;
    layoutItems.push({ 
      type: 'text', 
      text: cleanText, 
      fontSize: 10.5, 
      leading: 17, 
      weightAfter: isLast ? 1.2 : 0.8 
    });
  });

  layoutItems.push({ type: 'text', text: prayerTitle, fontSize: 10.5, fontStyle: 'bold', leading: 15, weightAfter: 0.5 });
  layoutItems.push({ type: 'text', text: prayerText, fontSize: 10.5, fontStyle: 'italic', color: '#555555', leading: 17, weightAfter: 0 });

  // 1. Calculate heights
  let totalItemsHeight = 0;
  layoutItems.forEach(item => {
    if (item.type === 'text') {
      doc.setFont('helvetica', item.fontStyle || 'normal');
      doc.setFontSize(item.fontSize);
      const lines = doc.splitTextToSize(item.text, printWidth);
      item.computedHeight = lines.length * item.leading;
    } else if (item.type === 'divider') {
      item.computedHeight = item.height;
    } else if (item.type === 'table') {
      let tableH = 0;
      item.tableData.forEach((row, rowIndex) => {
        const isHeader = rowIndex === 0;
        let maxLines = 1;
        item.colWidths.forEach((w, colIndex) => {
          doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
          doc.setFontSize(isHeader ? 9 : 8.5);
          const lines = doc.splitTextToSize(row[colIndex], w - 12);
          if (lines.length > maxLines) maxLines = lines.length;
        });
        tableH += isHeader ? 22 : (maxLines * 13 + 11);
      });
      item.computedHeight = tableH;
    }
    totalItemsHeight += item.computedHeight;
  });

  // 2. Flex distribution
  const startY = 100;
  const endY = 780;
  const availableHeight = endY - startY;
  const remainingSpace = Math.max(0, availableHeight - totalItemsHeight);

  let totalWeight = 0;
  layoutItems.forEach(item => {
    if (item.weightAfter > 0) {
      totalWeight += item.weightAfter;
    }
  });

  const gapUnit = totalWeight > 0 ? (remainingSpace / totalWeight) : 0;

  // 3. Render
  let currentY = startY;
  layoutItems.forEach(item => {
    if (item.type === 'text') {
      doc.setFont('helvetica', item.fontStyle || 'normal');
      doc.setFontSize(item.fontSize);
      doc.setTextColor(item.color || '#333333');
      
      const lines = doc.splitTextToSize(item.text, printWidth);
      lines.forEach(line => {
        // Vertical baseline adjustment
        doc.text(line, startX, currentY + item.fontSize * 0.85);
        currentY += item.leading;
      });
    } else if (item.type === 'divider') {
      doc.setDrawColor('#c5a059');
      doc.setLineWidth(item.computedHeight);
      doc.line(startX, currentY, endX, currentY);
      currentY += item.computedHeight;
    } else if (item.type === 'table') {
      let tableY = currentY;
      item.tableData.forEach((row, rowIndex) => {
        const isHeader = rowIndex === 0;
        let colX = startX;
        
        let maxLines = 1;
        item.colWidths.forEach((w, colIndex) => {
          doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
          doc.setFontSize(isHeader ? 9 : 8.5);
          const lines = doc.splitTextToSize(row[colIndex], w - 12);
          if (lines.length > maxLines) maxLines = lines.length;
        });
        
        const rowHeight = isHeader ? 22 : (maxLines * 13 + 11);
        
        item.colWidths.forEach((w, colIndex) => {
          doc.setFillColor(isHeader ? '#3c096c' : '#fdfbf7');
          doc.rect(colX, tableY, w, rowHeight, 'F');
          
          doc.setDrawColor('#dec2ef');
          doc.setLineWidth(0.5);
          doc.rect(colX, tableY, w, rowHeight, 'D');
          
          doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
          doc.setFontSize(isHeader ? 9 : 8.5);
          doc.setTextColor(isHeader ? '#ffffff' : '#333333');
          
          const lines = doc.splitTextToSize(row[colIndex], w - 12);
          lines.forEach((line, lineIndex) => {
            const textY = tableY + (isHeader ? 14 : 12.5) + (lineIndex * 13);
            doc.text(line, colX + 6, textY);
          });
          
          colX += w;
        });
        tableY += rowHeight;
      });
      currentY += item.computedHeight;
    }

    if (item.weightAfter > 0) {
      currentY += gapUnit * item.weightAfter;
    }
  });

  // Draw Footer Page Number at bottom of A4
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor('#666666');
  doc.text(isEn ? "© 2026 His Kingdom Prophets. All rights reserved." : "© 2026 His Kingdom Prophets. Alle rettigheter reservert.", startX, 805);
  doc.text(isEn ? "Page 1 of 1" : "Side 1 av 1", endX, 805, { align: 'right' });

  // Save the PDF
  doc.save(`${title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
}

export function generateIntercessionPdf(cmsContent, language) {
  const isEn = language === 'en';

  const getCmsValue = (key, fallback) => {
    if (isEn) {
      return cmsContent?.[`${key}-en`] || cmsContent?.[key] || fallback;
    }
    return cmsContent?.[key] || fallback;
  };
  
  // Custom CMS keys with default fallback text values
  const title = getCmsValue('pdf_intercession_title', isEn ? "Prophetic Intercession & Prayer Shield" : "Profetisk Forbønn og Bønneskjold");
  const subtitle = getCmsValue('pdf_intercession_subtitle', isEn ? "Praying strategically under Holy Spirit inspiration and raising a prayer shield" : "Å be strategisk under Helligåndens inspirasjon og reise et bønnevern");
  const intro = getCmsValue('pdf_intercession_intro', isEn 
    ? "Prophetic intercession is about listening to God's heart before we pray, so that our prayers align with His will in heaven. When we pray what God reveals, a tremendous spiritual authority is released. This study booklet provides you with the biblical foundation to build a personal and ministry-based prayer shield."
    : "Profetisk forbønn handler om å lytte til Guds hjerte før vi ber, slik at våre bønner samstemmer med Hans vilje i himmelen. Når vi ber det Gud viser oss, utløses en enorm åndelig autoritet. Dette studieheftet gir deg det bibelske grunnlaget for å bygge et personlig og menighetsbasert bønneskjold.");
  const sec1Title = getCmsValue('pdf_intercession_sec1_title', isEn ? "1. What is Prophetic Intercession?" : "1. Hva er profetisk forbønn?");
  const sec1Text = getCmsValue('pdf_intercession_sec1_text', isEn 
    ? "Usual prayer starts with human needs and is lifted up to God. Prophetic intercession starts with God, who reveals His purposes to the intercessor through a word, a vision, an inner burden, or a scripture. The intercessor then speaks and prays this out on earth. It is praying 'thy will be done, on earth as it is in heaven' with deep precision." 
    : "Vanlig bønn starter med menneskets behov og løftes opp til Gud. Profetisk forbønn starter hos Gud, som åpenbarer sine hensikter til forbederen gjennom et ord, et syn, en indre byrde eller et skriftsted. Forbederen taler og ber deretter dette ut på jorden. Det er å be 'skje Din vilje, som i himmelen, så også på jorden' med dyp presisjon.");
  const sec2Title = getCmsValue('pdf_intercession_sec2_title', isEn ? "2. Establishing a Prayer Shield" : "2. Å etablere et bønneskjold");
  const sec2Text = getCmsValue('pdf_intercession_sec2_text', isEn 
    ? "Every prophetic ministry and local church needs a prayer shield to stand against spiritual counterattacks and preserve an open heaven over the work. A prayer shield consists of dedicated intercessors who stand in continuous watch. Paul repeatedly asked churches to strive together with him in prayer (Rom 15:30). Without an active prayer shield, leaders and ministries become vulnerable to weariness and opposition." 
    : "Enhver profetisk tjeneste og lokal menighet trenger et bønneskjold for å stå imot åndelige motangrep og bevare en åpen himmel over arbeidet. Et bønneskjold består av dedikerte forbedere som står i kontinuerlig vakt. Paulus ba gjentatte ganger menighetene om å kjempe sammen med ham i bønn (Rom 15,30). Uten et aktivt bønneskjold blir ledere og tjenester sårbare for tretthet og motstand.");
  const prayerTitle = getCmsValue('pdf_intercession_prayer_title', isEn ? "Prayer to Raise a Prayer Shield:" : "Bønn for å reise et bønneskjold:");
  const prayerText = getCmsValue('pdf_intercession_prayer_text', isEn 
    ? "'Lord, I pray that You raise up alert watchmen on the walls in our day. Give us a burning heart for intercession, and teach us to pray in accordance with Your heart. We establish a prayer shield over our homes, our church leaders, and the prophetic ministry. May Your glory rest upon us. In Jesus' name, Amen.'" 
    : "'Herre, jeg ber om at Du reiser opp våkne vektere på murene i vår tid. Gi oss et brennende hjerte for forbønn, og lær oss å be i overensstemmelse med Ditt hjerte. Vi setter opp et bønneskjold over våre hjem, våre menighetsledere og den profetiske tjenesten. Må Din herlighet hvile over oss. I Jesu navn, Amen.'");

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  // A4 size: 595.28 x 841.89 points
  const startX = 54;
  const endX = 541;
  const printWidth = 487;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor('#3c096c');
  doc.text(isEn ? "HIS KINGDOM PROPHETS — STUDY RESOURCES" : "HIS KINGDOM PROPHETS — STUDIERESSURSER", startX, 52);
  doc.setDrawColor('#dec2ef');
  doc.setLineWidth(0.75);
  doc.line(startX, 58, endX, 58);

  const tableData = isEn ? [
    ["Step", "Activity", "Scripture", "Description"],
    ["1", "Quiet listening", "Psalm 46:10", "Be still and know that the Lord is God. Wait for the Spirit's impulse."],
    ["2", "Testing", "1 Thess 5:21", "Test impressions against God's word. Sound theology is always the filter."],
    ["3", "Proclamation", "Job 22:28", "Speak out what the Lord has shown you with boldness and authority."],
    ["4", "Thanks & Praise", "Phil 4:6", "Complete the prayer with worship, believing that God has heard."]
  ] : [
    ["Steg", "Aktivitet", "Skriftsted", "Beskrivelse"],
    ["1", "Stille lytting", "Salme 46,11", "Vær stille og erkjenn at Herren er Gud. Vent på Åndens impuls."],
    ["2", "Prøving", "1. Tess 5,21", "Prøv inntrykkene mot Guds ord. Sunn teologi er alltid filteret."],
    ["3", "Proklamasjon", "Job 22,28", "Tal ut det Herren har vist deg med frimodighet og autoritet."],
    ["4", "Takk & Lovpris", "Fil 4,6", "Fullfør bønnen med tilbedelse, i tro på at Gud har hørt."]
  ];

  const colWidths = [35, 90, 83, 279]; // sum = 487 pt

  // Define layout items for visual flex layout engine
  const layoutItems = [];
  layoutItems.push({ type: 'text', text: title, fontSize: 22, fontStyle: 'bold', color: '#3c096c', leading: 26, weightAfter: 0.4 });
  layoutItems.push({ type: 'text', text: subtitle, fontSize: 11.5, fontStyle: 'bold', color: '#c5a059', leading: 15, weightAfter: 0.6 });
  layoutItems.push({ type: 'divider', height: 1.25, weightAfter: 0.8 });
  layoutItems.push({ type: 'text', text: intro, fontSize: 10.5, leading: 17, weightAfter: 1.4 });
  layoutItems.push({ type: 'text', text: sec1Title, fontSize: 13, fontStyle: 'bold', color: '#3c096c', leading: 18, weightAfter: 0.5 });
  layoutItems.push({ type: 'text', text: sec1Text, fontSize: 10.5, leading: 17, weightAfter: 1.2 });
  layoutItems.push({ type: 'table', tableData, colWidths, weightAfter: 1.4 });
  layoutItems.push({ type: 'text', text: sec2Title, fontSize: 13, fontStyle: 'bold', color: '#3c096c', leading: 18, weightAfter: 0.5 });

  const sec2Paragraphs = sec2Text.split(/<br\s*\/?>/i);
  sec2Paragraphs.forEach((pText, pIndex) => {
    const cleanText = pText.replace(/<\/?b>/gi, "").trim();
    if (!cleanText) return;
    const isLast = pIndex === sec2Paragraphs.length - 1;
    layoutItems.push({ 
      type: 'text', 
      text: cleanText, 
      fontSize: 10.5, 
      leading: 17, 
      weightAfter: isLast ? 1.2 : 0.8 
    });
  });

  layoutItems.push({ type: 'text', text: prayerTitle, fontSize: 10.5, fontStyle: 'bold', leading: 15, weightAfter: 0.5 });
  layoutItems.push({ type: 'text', text: prayerText, fontSize: 10.5, fontStyle: 'italic', color: '#555555', leading: 17, weightAfter: 0 });

  // 1. Calculate heights
  let totalItemsHeight = 0;
  layoutItems.forEach(item => {
    if (item.type === 'text') {
      doc.setFont('helvetica', item.fontStyle || 'normal');
      doc.setFontSize(item.fontSize);
      const lines = doc.splitTextToSize(item.text, printWidth);
      item.computedHeight = lines.length * item.leading;
    } else if (item.type === 'divider') {
      item.computedHeight = item.height;
    } else if (item.type === 'table') {
      let tableH = 0;
      item.tableData.forEach((row, rowIndex) => {
        const isHeader = rowIndex === 0;
        let maxLines = 1;
        item.colWidths.forEach((w, colIndex) => {
          doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
          doc.setFontSize(isHeader ? 9 : 8.5);
          const lines = doc.splitTextToSize(row[colIndex], w - 12);
          if (lines.length > maxLines) maxLines = lines.length;
        });
        tableH += isHeader ? 22 : (maxLines * 13 + 11);
      });
      item.computedHeight = tableH;
    }
    totalItemsHeight += item.computedHeight;
  });

  // 2. Flex distribution
  const startY = 100;
  const endY = 780;
  const availableHeight = endY - startY;
  const remainingSpace = Math.max(0, availableHeight - totalItemsHeight);

  let totalWeight = 0;
  layoutItems.forEach(item => {
    if (item.weightAfter > 0) {
      totalWeight += item.weightAfter;
    }
  });

  const gapUnit = totalWeight > 0 ? (remainingSpace / totalWeight) : 0;

  // 3. Render
  let currentY = startY;
  layoutItems.forEach(item => {
    if (item.type === 'text') {
      doc.setFont('helvetica', item.fontStyle || 'normal');
      doc.setFontSize(item.fontSize);
      doc.setTextColor(item.color || '#333333');
      
      const lines = doc.splitTextToSize(item.text, printWidth);
      lines.forEach(line => {
        doc.text(line, startX, currentY + item.fontSize * 0.85);
        currentY += item.leading;
      });
    } else if (item.type === 'divider') {
      doc.setDrawColor('#c5a059');
      doc.setLineWidth(item.computedHeight);
      doc.line(startX, currentY, endX, currentY);
      currentY += item.computedHeight;
    } else if (item.type === 'table') {
      let tableY = currentY;
      item.tableData.forEach((row, rowIndex) => {
        const isHeader = rowIndex === 0;
        let colX = startX;
        
        let maxLines = 1;
        item.colWidths.forEach((w, colIndex) => {
          doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
          doc.setFontSize(isHeader ? 9 : 8.5);
          const lines = doc.splitTextToSize(row[colIndex], w - 12);
          if (lines.length > maxLines) maxLines = lines.length;
        });
        
        const rowHeight = isHeader ? 22 : (maxLines * 13 + 11);
        
        item.colWidths.forEach((w, colIndex) => {
          doc.setFillColor(isHeader ? '#3c096c' : '#fdfbf7');
          doc.rect(colX, tableY, w, rowHeight, 'F');
          
          doc.setDrawColor('#dec2ef');
          doc.setLineWidth(0.5);
          doc.rect(colX, tableY, w, rowHeight, 'D');
          
          doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
          doc.setFontSize(isHeader ? 9 : 8.5);
          doc.setTextColor(isHeader ? '#ffffff' : '#333333');
          
          const lines = doc.splitTextToSize(row[colIndex], w - 12);
          lines.forEach((line, lineIndex) => {
            const textY = tableY + (isHeader ? 14 : 12.5) + (lineIndex * 13);
            doc.text(line, colX + 6, textY);
          });
          
          colX += w;
        });
        tableY += rowHeight;
      });
      currentY += item.computedHeight;
    }

    if (item.weightAfter > 0) {
      currentY += gapUnit * item.weightAfter;
    }
  });

  // Draw Footer Page Number at bottom of A4
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor('#666666');
  doc.text(isEn ? "© 2026 His Kingdom Prophets. All rights reserved." : "© 2026 His Kingdom Prophets. Alle rettigheter reservert.", startX, 805);
  doc.text(isEn ? "Page 1 of 1" : "Side 1 av 1", endX, 805, { align: 'right' });

  // Save the PDF
  doc.save(`${title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
}
