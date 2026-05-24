import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#3c096c")) # Royal Purple primary
        
        # Header - Top of page
        self.drawString(54, 750, "HIS KINGDOM PROPHETS — STUDIERESSURSER")
        self.setStrokeColor(colors.HexColor("#dec2ef"))
        self.setLineWidth(0.5)
        self.line(54, 742, 558, 742)
        
        # Footer
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#666666"))
        self.drawString(54, 45, "© 2026 His Kingdom Prophets. Alle rettigheter reservert.")
        page_text = f"Side {self._pageNumber} av {page_count}"
        self.drawRightString(558, 45, page_text)
        self.restoreState()

def create_fasting_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Premium large typography filling the page beautifully
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#3c096c"),
        spaceAfter=3
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor("#c5a059"),
        spaceAfter=4
    )

    h1_style = ParagraphStyle(
        'Heading1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#3c096c"),
        spaceBefore=5,
        spaceAfter=2
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#333333"),
        spaceAfter=4
    )

    italic_style = ParagraphStyle(
        'ItalicText',
        parent=body_style,
        fontName='Helvetica-Oblique',
        textColor=colors.HexColor("#555555"),
        spaceAfter=0
    )

    story = []
    
    story.append(Paragraph("Bibelsk Faste og Åndelig Disiplin", title_style))
    story.append(Paragraph("En praktisk og teologisk guide til fasting, bønn og åpenbaring", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#c5a059"), spaceAfter=5))

    # Intro Section
    intro_text = (
        "Velkommen til studieheftet for Bibelsk Faste. Faste er ikke en metode for å tvinge Guds "
        "hånd, men en åndelig disiplin som innstiller våre hjerter, rydder bort støy og gjør oss "
        "mer mottakelige for Den Hellige Ånds ledelse. Gjennom historien har faste vært nøkkelen til "
        "profetisk gjennombrudd, dypere åpenbaring og personlig helliggjørelse."
    )
    story.append(Paragraph(intro_text, body_style))

    # Section 1
    story.append(Paragraph("1. Det bibelske fundamentet for faste", h1_style))
    sec1_text = (
        "I Matteus 6,16 sier Jesus: <i>'Når dere faster...'</i>. Han forutsetter at faste er en naturlig del av "
        "en disippels liv. Faste handler om å avstå fra fysisk næring for å søke åndelig metthet. I Jesaja 58 ser "
        "vi hva slags faste Gud har behag i — en faste som løser ugudelighets bånd og setter de undertrykte fri."
    )
    story.append(Paragraph(sec1_text, body_style))

    # Table of Biblical Fasts with full width layout (504 pt total)
    data = [
        ["Faste-type", "Skriftsted", "Hensikt & Resultat"],
        ["Moses' faste (40 dager)", "2. Mos 34,28", "Motta Guds lov, intimt samfunn med Gud."],
        ["Daniels faste (Delvis faste)", "Dan 10,2-3", "Søke forståelse, ydmyke seg for Gud."],
        ["Esters faste (3 dager)", "Est 4,16", "Krisebønn, beskyttelse og gjennombrudd."],
        ["Jesu faste (40 dager)", "Luk 4,1-2", "Utrustning før tjenestestart, seier over fristelse."]
    ]
    t = Table(data, colWidths=[1.8*inch, 1.2*inch, 4.0*inch]) # 1.8 + 1.2 + 4.0 = 7.0 inches = 504 points
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#3c096c")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8.5),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#fdfbf7")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#dec2ef")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 8),
    ]))
    story.append(t)
    story.append(Spacer(1, 2))

    # Section 2
    story.append(Paragraph("2. Praktiske retningslinjer for faste", h1_style))
    sec2_text = (
        "<b>Hydrering:</b> Drikk rikelig med vann under fasten. Kroppen skiller ut avfallsstoffer, og tilstrekkelig "
        "væskeinnhold forhindrer hodepine og sløvhet.<br/>"
        "<b>Forberedelse:</b> Trapp ned på kaffe, sukker og tung mat et par dager før en lengre faste for å unngå "
        "kraftige abstinenser.<br/>"
        "<b>Tid med Gud:</b> Faste uten bønn er kun en diett. Sett av den tiden du vanligvis ville brukt på måltider "
        "og matlaging til bibellesning, stille lytting og bønn."
    )
    story.append(Paragraph(sec2_text, body_style))
    
    # Conclusion / Proclamation
    story.append(Spacer(1, 2))
    story.append(Paragraph("<b>Bønne-proklamasjon for fasten:</b>", body_style))
    proc_text = (
        "<i>'Herre, jeg innvier mitt legeme og mitt sinn til Deg under denne fasten. La mitt kjød vike, og la Din "
        "Hellige Ånd fylle meg på ny. Jeg ber om klarsyn, åpenbaring og styrke til å gå i den ferdiglagte tjenesten "
        "Du har for mitt liv. I Jesu navn, Amen.'</i>"
    )
    story.append(Paragraph(proc_text, italic_style))

    doc.build(story, canvasmaker=NumberedCanvas)

def create_intercession_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Premium large typography filling the page beautifully
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#3c096c"),
        spaceAfter=3
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor("#c5a059"),
        spaceAfter=4
    )

    h1_style = ParagraphStyle(
        'Heading1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#3c096c"),
        spaceBefore=5,
        spaceAfter=2
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#333333"),
        spaceAfter=4
    )

    italic_style = ParagraphStyle(
        'ItalicText',
        parent=body_style,
        fontName='Helvetica-Oblique',
        textColor=colors.HexColor("#555555"),
        spaceAfter=0
    )

    story = []
    
    story.append(Paragraph("Profetisk Forbønn og Bønneskjold", title_style))
    story.append(Paragraph("Å be strategisk under Helligåndens inspirasjon og reise et bønnevern", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#c5a059"), spaceAfter=5))

    # Intro Section
    intro_text = (
        "Profetisk forbønn handler om å lytte til Guds hjerte før vi ber, slik at våre bønner samstemmer "
        "med Hans vilje i himmelen. Når vi ber det Gud viser oss, utløses en enorm åndelig autoritet. "
        "Dette studieheftet gir deg det bibelske grunnlaget for å bygge et personlig og menighetsbasert "
        "bønneskjold."
    )
    story.append(Paragraph(intro_text, body_style))

    # Section 1
    story.append(Paragraph("1. Hva er profetisk forbønn?", h1_style))
    sec1_text = (
        "Vanlig bønn starter med menneskets behov og løftes opp til Gud. Profetisk forbønn starter hos Gud, "
        "som åpenbarer sine hensikter til forbederen gjennom et ord, et syn, en indre byrde eller et skriftsted. "
        "Forbederen taler og ber deretter dette ut på jorden. Det er å be <i>'skje Din vilje, som i himmelen, så "
        "også på jorden'</i> med dyp presisjon."
    )
    story.append(Paragraph(sec1_text, body_style))

    # Core elements of intercession with full width layout (504 pt total)
    data = [
        ["Steg", "Aktivitet", "Skriftsted", "Beskrivelse"],
        ["1", "Stille lytting", "Salme 46,11", "Vær stille og erkjenn at Herren er Gud. Vent på Åndens impuls."],
        ["2", "Prøving", "1. Tess 5,21", "Prøv inntrykkene mot Guds ord. Sunn teologi er alltid filteret."],
        ["3", "Proklamasjon", "Job 22,28", "Tal ut det Herren har vist deg med frimodighet og autoritet."],
        ["4", "Takk & Lovpris", "Fil 4,6", "Fullfør bønnen med tilbedelse, i tro på at Gud har hørt."]
    ]
    t = Table(data, colWidths=[0.5*inch, 1.3*inch, 1.2*inch, 4.0*inch]) # 0.5 + 1.3 + 1.2 + 4.0 = 7.0 inches = 504 points
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#3c096c")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8.5),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#fdfbf7")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#dec2ef")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 8),
    ]))
    story.append(t)
    story.append(Spacer(1, 2))

    # Section 2
    story.append(Paragraph("2. Å etablere et bønneskjold", h1_style))
    sec2_text = (
        "Enhver profetisk tjeneste og lokal menighet trenger et bønneskjold for å stå imot åndelige motangrep "
        "og bevare en åpen himmel over arbeidet. Et bønneskjold består av dedikerte forbedere som står i "
        "kontinuerlig vakt. Paulus ba gjentatte ganger menighetene om å kjempe sammen med ham i bønn "
        "(Rom 15,30). Uten et aktivt bønneskjold blir ledere og tjenester sårbare for tretthet og motstand."
    )
    story.append(Paragraph(sec2_text, body_style))
    
    # Prayer
    story.append(Spacer(1, 2))
    story.append(Paragraph("<b>Bønn for å reise et bønneskjold:</b>", body_style))
    proc_text = (
        "<i>'Herre, jeg ber om at Du reiser opp våkne vektere på murene i vår tid. Gi oss et brennende hjerte for "
        "forbønn, og lær oss å be i overensstemmelse med Ditt hjerte. Vi setter opp et bønneskjold over våre hjem, "
        "våre menighetsledere og den profetiske tjenesten. Må Din herlighet hvile over oss. I Jesu navn, Amen.'</i>"
    )
    story.append(Paragraph(proc_text, italic_style))

    doc.build(story, canvasmaker=NumberedCanvas)

if __name__ == "__main__":
    os.makedirs("public", exist_ok=True)
    create_fasting_pdf("public/Bibelsk_Faste_og_Aandelig_Disiplin.pdf")
    create_intercession_pdf("public/Profetisk_Forboenn_og_Boenneskjold.pdf")
    print("PDF-filer generert vellykket i public/ mappen!")
