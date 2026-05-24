import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, History, Download, Upload, Search, Settings, AlertTriangle, 
  ChevronLeft, ChevronRight, MoreVertical, X, CheckCircle2, Trash2, 
  Copy, PlusCircle, Languages, Info, RotateCcw, Layout, UserCheck, 
  BookOpen, Users, Rocket, Flag, UploadCloud, FileText
} from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase';

// Definition of all CMS strings with labels, categories, and explanatory descriptions
const assetDefinitions = [
  // Opptaksside (Admission Page)
  { slug: 'admission-hero-title', title: 'Opptak Hero Tittel', section: 'Opptaksside', type: 'text', description: 'Hovedoverskrift på opptakssiden.' },
  { slug: 'admission-hero-subtitle', title: 'Opptak Hero Undertittel', section: 'Opptaksside', type: 'textarea', description: 'Beskrivelse under hero-tittelen på opptakssiden.' },
  { slug: 'admission-hero-cta', title: 'Opptak Hero Knapp', section: 'Opptaksside', type: 'text', description: 'Knappetekst for å navigere til søknadsskjemaet.' },
  { slug: 'admission-programs-title', title: 'Opptak Studielinjer Tittel', section: 'Opptaksside', type: 'text', description: 'Hovedoverskrift for oversikten over studielinjer.' },
  { slug: 'admission-programs-subtitle', title: 'Opptak Studielinjer Undertittel', section: 'Opptaksside', type: 'textarea', description: 'Beskrivende tekst under studielinjetittelen.' },
  { slug: 'admission-payments-tag', title: 'Opptak Priser Merkelapp', section: 'Opptaksside', type: 'text', description: 'Liten tag øverst i prismatrisen.' },
  { slug: 'admission-payments-title', title: 'Opptak Priser Overskrift', section: 'Opptaksside', type: 'text', description: 'Hovedtittel for finansierings- og prisseksjonen.' },
  { slug: 'admission-payments-desc', title: 'Opptak Priser Beskrivelse', section: 'Opptaksside', type: 'textarea', description: 'Beskrivende avsnitt under pris-overskriften.' },
  { slug: 'admission-payments-bullet1-title', title: 'Pris Fordel 1 Tittel', section: 'Opptaksside', type: 'text', description: 'Tittel for første pris-fordel (f.eks. Rentefri delbetaling).' },
  { slug: 'admission-payments-bullet1-desc', title: 'Pris Fordel 1 Beskrivelse', section: 'Opptaksside', type: 'textarea', description: 'Utdypende tekst om første pris-fordel.' },
  { slug: 'admission-payments-bullet2-title', title: 'Pris Fordel 2 Tittel', section: 'Opptaksside', type: 'text', description: 'Tittel for andre pris-fordel (f.eks. Alt inkludert).' },
  { slug: 'admission-payments-bullet2-desc', title: 'Pris Fordel 2 Beskrivelse', section: 'Opptaksside', type: 'textarea', description: 'Utdypende tekst om andre pris-fordel.' },
  { slug: 'admission-payments-bullet3-title', title: 'Pris Fordel 3 Tittel', section: 'Opptaksside', type: 'text', description: 'Tittel for tredje pris-fordel (f.eks. Stipendordninger).' },
  { slug: 'admission-payments-bullet3-desc', title: 'Pris Fordel 3 Beskrivelse', section: 'Opptaksside', type: 'textarea', description: 'Utdypende tekst om tredje pris-fordel.' },
  { slug: 'admission-steps-title', title: 'Opptak Søknadsprosess Tittel', section: 'Opptaksside', type: 'text', description: 'Overskrift for beskrivelsen av stegene i opptaket.' },
  { slug: 'admission-steps-subtitle', title: 'Opptak Søknadsprosess Undertittel', section: 'Opptaksside', type: 'textarea', description: 'Beskrivelse under søknadsprosess-overskriften.' },
  { slug: 'admission-form-title', title: 'Opptak Skjema Tittel', section: 'Opptaksside', type: 'text', description: 'Tittel øverst på søknadsskjemaet.' },
  { slug: 'admission-form-subtitle', title: 'Opptak Skjema Undertittel', section: 'Opptaksside', type: 'textarea', description: 'Hjelpetekst under tittel på søknadsskjemaet.' },

  // Hjemmeside (Landing Page)
  { slug: 'landing-hero-title', title: 'Hero Hovedoverskrift', section: 'Hjemmeside', type: 'text', description: 'Hovedoverskriften i hero-seksjonen på landingssiden.' },
  { slug: 'landing-hero-tagline', title: 'Hero Tagline', section: 'Hjemmeside', type: 'text', description: 'Undertekst / tagline under hovedoverskriften på landingssiden.' },
  { slug: 'landing-hero-description', title: 'Hero Beskrivelse', section: 'Hjemmeside', type: 'textarea', description: 'Beskrivende avsnitt i hero-seksjonen på landingssiden.' },
  { slug: 'landing-hero-cta-primary', title: 'Hero Hovedknapp', section: 'Hjemmeside', type: 'text', description: 'Tekst på primær handlingsknapp i hero-seksjonen.' },
  { slug: 'landing-hero-cta-secondary', title: 'Hero Sekundærknapp', section: 'Hjemmeside', type: 'text', description: 'Tekst på sekundær handlingsknapp i hero-seksjonen.' },
  { slug: 'landing-pillars-title', title: 'Tre Søyler Hovedtittel', section: 'Hjemmeside', type: 'text', description: 'Overskrift for seksjonen med tre faglige søyler.' },
  { slug: 'landing-pillars-desc', title: 'Tre Søyler Undertekst', section: 'Hjemmeside', type: 'textarea', description: 'Introduksjonstekst for de tre faglige søylene.' },
  { slug: 'landing-pillar1-title', title: 'Søyle 1 Tittel', section: 'Hjemmeside', type: 'text', description: 'Tittel på første søyle (Profetisk Utrustning).' },
  { slug: 'landing-pillar1-desc', title: 'Søyle 1 Beskrivelse', section: 'Hjemmeside', type: 'textarea', description: 'Utdypende beskrivelse av første søyle.' },
  { slug: 'landing-pillar2-title', title: 'Søyle 2 Tittel', section: 'Hjemmeside', type: 'text', description: 'Tittel på andre søyle (Bibelundervisning).' },
  { slug: 'landing-pillar2-desc', title: 'Søyle 2 Beskrivelse', section: 'Hjemmeside', type: 'textarea', description: 'Utdypende beskrivelse av andre søyle.' },
  { slug: 'landing-pillar3-title', title: 'Søyle 3 Tittel', section: 'Hjemmeside', type: 'text', description: 'Tittel på tredje søyle (Åndelig Veiledning).' },
  { slug: 'landing-pillar3-desc', title: 'Søyle 3 Beskrivelse', section: 'Hjemmeside', type: 'textarea', description: 'Utdypende beskrivelse av tredje søyle.' },
  { slug: 'landing-network-title', title: 'Nettverk Tittel', section: 'Hjemmeside', type: 'text', description: 'Tittel for nettverksseksjonen nederst på landingssiden.' },
  { slug: 'landing-network-desc', title: 'Nettverk Beskrivelse', section: 'Hjemmeside', type: 'textarea', description: 'Beskrivelse av det globale profetiske nettverket.' },
  
  // Hjemmeside Lenker & Knapper
  { slug: 'landing-nav-programs', title: 'Navigasjonslenke Studielinjer', section: 'Hjemmeside', type: 'text', description: 'Tekst på menylenken for studielinjer.' },
  { slug: 'landing-nav-faculty', title: 'Navigasjonslenke Mentorer', section: 'Hjemmeside', type: 'text', description: 'Tekst på menylenken for mentorer.' },
  { slug: 'landing-nav-resources', title: 'Navigasjonslenke Bibelressurser', section: 'Hjemmeside', type: 'text', description: 'Tekst på menylenken for bibelressurser.' },
  { slug: 'landing-nav-admissions', title: 'Navigasjonslenke Søk Opptak', section: 'Hjemmeside', type: 'text', description: 'Tekst på menylenken for søknad.' },
  { slug: 'landing-btn-login', title: 'Knappetekst Logg Inn', section: 'Hjemmeside', type: 'text', description: 'Tekst på logg-inn knappen i topplinjen.' },
  { slug: 'landing-btn-portal', title: 'Knappetekst Gå til Portal', section: 'Hjemmeside', type: 'text', description: 'Tekst på portal-knappen som vises når man er pålogget.' },
  { slug: 'landing-btn-apply', title: 'Knappetekst Søk Nå', section: 'Hjemmeside', type: 'text', description: 'Tekst på søknadsknappen i topplinjen.' },
  { slug: 'landing-network-btn', title: 'Nettverk Handlingsknapp', section: 'Hjemmeside', type: 'text', description: 'Tekst på knappen i det globale nettverksbanneret.' },
  
  // Hjemmeside Kulepunkter (Søyler)
  { slug: 'landing-pillar1-bullet1', title: 'Søyle 1 Kulepunkt 1', section: 'Hjemmeside', type: 'text', description: 'Første kulepunkt under søyle 1 (Profetisk Utrustning).' },
  { slug: 'landing-pillar1-bullet2', title: 'Søyle 1 Kulepunkt 2', section: 'Hjemmeside', type: 'text', description: 'Andre kulepunkt under søyle 1 (Profetisk Utrustning).' },
  { slug: 'landing-pillar1-bullet3', title: 'Søyle 1 Kulepunkt 3', section: 'Hjemmeside', type: 'text', description: 'Tredje kulepunkt under søyle 1 (Profetisk Utrustning).' },
  
  { slug: 'landing-pillar2-bullet1', title: 'Søyle 2 Kulepunkt 1', section: 'Hjemmeside', type: 'text', description: 'Første kulepunkt under søyle 2 (Bibelundervisning).' },
  { slug: 'landing-pillar2-bullet2', title: 'Søyle 2 Kulepunkt 2', section: 'Hjemmeside', type: 'text', description: 'Andre kulepunkt under søyle 2 (Bibelundervisning).' },
  { slug: 'landing-pillar2-bullet3', title: 'Søyle 2 Kulepunkt 3', section: 'Hjemmeside', type: 'text', description: 'Tredje kulepunkt under søyle 2 (Bibelundervisning).' },
  
  { slug: 'landing-pillar3-bullet1', title: 'Søyle 3 Kulepunkt 1', section: 'Hjemmeside', type: 'text', description: 'Første kulepunkt under søyle 3 (Åndelig Veiledning).' },
  { slug: 'landing-pillar3-bullet2', title: 'Søyle 3 Kulepunkt 2', section: 'Hjemmeside', type: 'text', description: 'Andre kulepunkt under søyle 3 (Åndelig Veiledning).' },
  { slug: 'landing-pillar3-bullet3', title: 'Søyle 3 Kulepunkt 3', section: 'Hjemmeside', type: 'text', description: 'Tredje kulepunkt under søyle 3 (Åndelig Veiledning).' },
  
  // Hjemmeside Vitnesbyrd
  { slug: 'landing-testimonials-title', title: 'Vitnesbyrd Seksjonstittel', section: 'Hjemmeside', type: 'text', description: 'Hovedtittel for vitnesbyrd- og referanseseksjonen.' },
  { slug: 'landing-testimonials-desc', title: 'Vitnesbyrd Seksjonsbeskrivelse', section: 'Hjemmeside', type: 'textarea', description: 'Introduksjonstekst under tittel på vitnesbyrdseksjonen.' },
  { slug: 'landing-testimonial1-name', title: 'Vitnesbyrd 1 Navn', section: 'Hjemmeside', type: 'text', description: 'Navn på den første personen i vitnesbyrdene.' },
  { slug: 'landing-testimonial1-role', title: 'Vitnesbyrd 1 Rolle/Tittel', section: 'Hjemmeside', type: 'text', description: 'Stilling/rolle for den første personen.' },
  { slug: 'landing-testimonial1-quote', title: 'Vitnesbyrd 1 Sitat', section: 'Hjemmeside', type: 'textarea', description: 'Det fullstendige sitatet / vitnesbyrdet til person 1.' },
  
  { slug: 'landing-testimonial2-name', title: 'Vitnesbyrd 2 Navn', section: 'Hjemmeside', type: 'text', description: 'Navn på den andre personen i vitnesbyrdene.' },
  { slug: 'landing-testimonial2-role', title: 'Vitnesbyrd 2 Rolle/Tittel', section: 'Hjemmeside', type: 'text', description: 'Stilling/rolle for den andre personen.' },
  { slug: 'landing-testimonial2-quote', title: 'Vitnesbyrd 2 Sitat', section: 'Hjemmeside', type: 'textarea', description: 'Det fullstendige sitatet / vitnesbyrdet til person 2.' },
  
  // Hjemmeside Siste CTA
  { slug: 'landing-cta-tagline', title: 'CTA Seksjon Tagline', section: 'Hjemmeside', type: 'text', description: 'Liten tekst øverst i siste handlingsseksjon (f.eks. Opptak Åpent...).' },
  { slug: 'landing-cta-title', title: 'CTA Seksjon Tittel', section: 'Hjemmeside', type: 'text', description: 'Hovedoverskrift for den avsluttende handlingsseksjonen.' },
  { slug: 'landing-cta-desc', title: 'CTA Seksjon Beskrivelse', section: 'Hjemmeside', type: 'textarea', description: 'Beskrivende avsnitt under overskrift i siste handlingsseksjon.' },
  { slug: 'landing-cta-btn-primary', title: 'CTA Seksjon Primærknapp', section: 'Hjemmeside', type: 'text', description: 'Tekst på primærknappen for opptak.' },
  { slug: 'landing-cta-btn-secondary', title: 'CTA Seksjon Sekundærknapp', section: 'Hjemmeside', type: 'text', description: 'Tekst på sekundærknappen for fagplan.' },
  
  // Hjemmeside Footer
  { slug: 'landing-footer-title', title: 'Footer Hovedoverskrift', section: 'Hjemmeside', type: 'text', description: 'Logo/tittel nederst i footeren på landingssiden.' },
  { slug: 'landing-footer-copyright', title: 'Footer Copyright-paragraf', section: 'Hjemmeside', type: 'textarea', description: 'Copyright og generell systemrettighets-paragraf.' },
  { slug: 'landing-footer-link-privacy', title: 'Footer Lenke Personvern', section: 'Hjemmeside', type: 'text', description: 'Tekst på lenken for personvern.' },
  { slug: 'landing-footer-link-terms', title: 'Footer Lenke Betingelser', section: 'Hjemmeside', type: 'text', description: 'Tekst på lenken for vilkår/betingelser.' },
  { slug: 'landing-footer-link-accessibility', title: 'Footer Lenke Tilgjengelighet', section: 'Hjemmeside', type: 'text', description: 'Tekst på lenken for universell utforming.' },
  { slug: 'landing-footer-link-support', title: 'Footer Lenke Kontakt', section: 'Hjemmeside', type: 'text', description: 'Tekst på lenken for kundestøtte/support.' },
  
  // Innlogging (Auth Flow)
  { slug: 'login-title', title: 'Tittel (Innlogging)', section: 'Innlogging', type: 'text', description: 'Hovedtittel som vises på innloggingsskjermen.' },
  { slug: 'login-subtitle', title: 'Undertittel (Innlogging)', section: 'Innlogging', type: 'text', description: 'Undertittel som vises på innloggingsskjermen.' },
  { slug: 'login-instruction', title: 'Rolle-instruksjoner (Innlogging)', section: 'Innlogging', type: 'textarea', description: 'Hjelpetekst og instruksjoner for valg av rolle på innloggingssiden.' },
  
  // Studentportal (Student Portal)
  { slug: 'student-welcome-title', title: 'Velkomsthilsen Tittel (Student)', section: 'Studentportal', type: 'text', description: 'Velkomsttittel på studentens dashbord.' },
  { slug: 'student-welcome-subtitle', title: 'Velkomsthilsen Undertekst (Student)', section: 'Studentportal', type: 'textarea', description: 'Ukentlig hilsen og oppdateringstekst på studentens dashbord.' },
  { slug: 'student-active-courses-title', title: 'Mine aktive kurs Tittel', section: 'Studentportal', type: 'text', description: 'Overskrift for listen over studentens aktive kurs.' },
  { slug: 'student-live-gatherings-title', title: 'Live Samlinger Tittel', section: 'Studentportal', type: 'text', description: 'Tittel for seksjonen med live-undervisning og samlinger.' },
  { slug: 'student-next-gatherings-title', title: 'Neste Samlinger Tittel', section: 'Studentportal', type: 'text', description: 'Overskrift for oversikten over kommende samlinger.' },
  { slug: 'student-tasks-title', title: 'Gjøremål Seksjonstittel', section: 'Studentportal', type: 'text', description: 'Tittel for studentens gjøremåls- og oppgaveliste.' },
  { slug: 'student-stats-title', title: 'Studie-statistikk', section: 'Studentportal', type: 'text', description: 'Tittel for studentens studie-statistikk og fremdrift.' },
  { slug: 'student-quicklinks-title', title: 'Hurtiglenker Tittel (Student)', section: 'Studentportal', type: 'text', description: 'Overskrift for hurtiglenker og ekstra ressurser.' },
  { slug: 'student-announcements-title', title: 'Kunngjøringer Tittel (Student)', section: 'Studentportal', type: 'text', description: 'Overskrift for kunngjøringer og viktige beskjeder.' },
  
  // Mentorportal (Teacher Portal)
  { slug: 'teacher-welcome-title', title: 'Velkomsthilsen Tittel (Mentor)', section: 'Mentorportal', type: 'text', description: 'Velkomsttittel på mentorens/lærerens dashbord.' },
  { slug: 'teacher-welcome-subtitle', title: 'Velkomsthilsen Undertekst (Mentor)', section: 'Mentorportal', type: 'textarea', description: 'Undertittel og beskrivelse av oppgaver på mentorens dashbord.' },
  { slug: 'teacher-academic-year', title: 'Studieår Undertekst', section: 'Mentorportal', type: 'text', description: 'Tekst som viser det gjeldende studieåret i mentorportalen.' },
  { slug: 'teacher-kpi1-label', title: 'KPI 1 (Totalt Registrert)', section: 'Mentorportal', type: 'text', description: 'KPI-etikett for totalt antall registrerte studenter.' },
  { slug: 'teacher-kpi2-label', title: 'KPI 2 (Snittfremdrift)', section: 'Mentorportal', type: 'text', description: 'KPI-etikett for gjennomsnittlig faglig fremdrift.' },
  { slug: 'teacher-kpi3-label', title: 'KPI 3 (Evalueringssnitt)', section: 'Mentorportal', type: 'text', description: 'KPI-etikett for gjennomsnittlig evaluering og karakter.' },
  { slug: 'teacher-kpi4-label', title: 'KPI 4 (Under oppfølging)', section: 'Mentorportal', type: 'text', description: 'KPI-etikett for antall studenter som trenger oppfølging.' },
  { slug: 'teacher-actions-title', title: 'Administrative tjenester Overskrift', section: 'Mentorportal', type: 'text', description: 'Overskrift for listen over administrative tjenester.' },
  
  // Onboarding (Onboarding Flow)
  { slug: 'welcome-ready-title', title: 'Velkomsttittel (Suksess)', section: 'Onboarding', type: 'text', description: 'Tittel på velkomstkortet etter fullført registrering.' },
  { slug: 'welcome-ready-subtitle', title: 'Undertittel (Suksess)', section: 'Onboarding', type: 'textarea', description: 'Gratulasjonstekst og fullført-beskjed etter profilkonfigurasjon.' },
  { slug: 'welcome-card1-title', title: 'Kort 1 Tittel (Studieplan)', section: 'Onboarding', type: 'text', description: 'Tittel på første velkomstkort (Studieplan).' },
  { slug: 'welcome-card1-desc', title: 'Kort 1 Beskrivelse', section: 'Onboarding', type: 'textarea', description: 'Kort beskrivelse av studieplanen på velkomstsiden.' },
  { slug: 'welcome-card2-title', title: 'Kort 2 Tittel (Fellesskap)', section: 'Onboarding', type: 'text', description: 'Tittel på andre velkomstkort (Fellesskap).' },
  { slug: 'welcome-card2-desc', title: 'Kort 2 Beskrivelse', section: 'Onboarding', type: 'textarea', description: 'Kort beskrivelse av bønnefellesskapet på velkomstsiden.' },
  { slug: 'welcome-cta-btn', title: 'Knappetekst (Dashboard)', section: 'Onboarding', type: 'text', description: 'Knappetekst på CTA-knappen for å gå videre til dashbordet.' },

  // System (General Strings)
  { slug: 'admin-cms-welcome', title: 'Systemets Retningslinjer (Plattform)', section: 'System', type: 'textarea', description: 'Velkomstmelding og retningslinjer øverst på CMS-styringssiden.' },
  { slug: 'admin-cms-title', title: 'CMS Seksjonstittel (Admin)', section: 'System', type: 'text', description: 'Tittel på administrasjonspanelet for innhold.' },
  { slug: 'admin-cms-subtitle', title: 'CMS Hjelpetekst (Admin)', section: 'System', type: 'textarea', description: 'Forklarende hjelpetekst for bruk av CMS-systemet.' },
  { slug: 'layout-logo-title', title: 'Plattform Logotittel', section: 'System', type: 'text', description: 'Systemnavn og logo-tekst i sidepanelet på plattformen.' },
  { slug: 'layout-search-placeholder', title: 'Søkefelt Hjelpetekst', section: 'System', type: 'text', description: 'Standard hjelpetekst / placeholder i søkefeltet i topplinjen.' },
  { slug: 'layout-upgrade-banner-title', title: 'Sidebar Oppgrader Tittel', section: 'System', type: 'text', description: 'Tittel på oppgraderingsbanneret i sidepanelet.' },
  { slug: 'layout-upgrade-banner-desc', title: 'Sidebar Oppgrader Beskrivelse', section: 'System', type: 'textarea', description: 'Beskrivelse av fordeler ved profilutvidelse i banneret.' },
  { slug: 'layout-upgrade-banner-btn', title: 'Sidebar Oppgrader Knapp', section: 'System', type: 'text', description: 'Tekst på knappen i oppgraderingsbanneret.' },

  // Mockup Specific Rows for exact template visual mapping
  { slug: 'nav.dashboard.title', title: 'Dashboard Link Tittel', section: 'System', type: 'text', description: 'Vises i hovedsidemenyen og som sidetittel.' },
  { slug: 'btn.submit.primary', title: 'Send endringer action-knapp', section: 'System', type: 'text', description: 'Primær handlingsknapp som brukes i skjema-modaler.' },
  { slug: 'msg.welcome.student', title: 'Student Hovedhilsen', section: 'Studentportal', type: 'textarea', description: 'Velkomsthilsen som vises ved innlogging for studenter.' },
  { slug: 'error.auth.forbidden', title: 'Ingen Tilgang Feilmelding', section: 'System', type: 'textarea', description: 'Feilmelding som vises når en bruker prøver å åpne sperrede ressurser.' },
  { slug: 'nav.settings.account', title: 'Kontoinnstillinger Link', section: 'System', type: 'text', description: 'Lenke til brukerprofil og kontopreferanser.' },

  // Sidemeny og navigasjon (Systemnøkler)
  { slug: 'sidebar-student-portal', title: 'Sidemeny Elevportal Overskrift', section: 'System', type: 'text', description: 'Overskrift for elev-seksjonen i sidepanelet.' },
  { slug: 'sidebar-mentor-tools', title: 'Sidemeny Mentorverktøy Overskrift', section: 'System', type: 'text', description: 'Overskrift for mentorverktøy i sidepanelet.' },
  { slug: 'sidebar-faculty-tools', title: 'Sidemeny Fakultetsverktøy Overskrift', section: 'System', type: 'text', description: 'Overskrift for fakultetsverktøy i sidepanelet.' },
  { slug: 'sidebar-administration', title: 'Sidemeny Administrasjon Overskrift', section: 'System', type: 'text', description: 'Overskrift for administrasjon i sidepanelet.' },
  { slug: 'sidebar-bible', title: 'Sidemeny Bibel Lenke', section: 'System', type: 'text', description: 'Navigasjonslenke til Bibelen i sidepanelet.' },
  { slug: 'sidebar-curriculum', title: 'Sidemeny Studieplan Lenke', section: 'System', type: 'text', description: 'Navigasjonslenke til studieplanen i sidepanelet.' },
  { slug: 'sidebar-lesson', title: 'Sidemeny Leksjon Lenke', section: 'System', type: 'text', description: 'Navigasjonslenke til gjeldende leksjon.' },
  { slug: 'sidebar-video', title: 'Sidemeny Klasserom Lenke', section: 'System', type: 'text', description: 'Navigasjonslenke til videoklasserommet.' },
  { slug: 'sidebar-assignments', title: 'Sidemeny Oppgaver Lenke', section: 'System', type: 'text', description: 'Navigasjonslenke til oppgavesiden.' },
  { slug: 'sidebar-notes', title: 'Sidemeny Notater Lenke', section: 'System', type: 'text', description: 'Navigasjonslenke til notatsiden.' },
  { slug: 'sidebar-community', title: 'Sidemeny Fellesskap Lenke', section: 'System', type: 'text', description: 'Navigasjonslenke til bønnefellesskapet.' },
  { slug: 'sidebar-grades', title: 'Sidemeny Karakterutregning Lenke', section: 'System', type: 'text', description: 'Navigasjonslenke til karakterkalkulatoren.' },
  { slug: 'sidebar-insights', title: 'Sidemeny Kursinnsikt Lenke', section: 'System', type: 'text', description: 'Navigasjonslenke til kursinnsikt.' },
  { slug: 'sidebar-followup', title: 'Sidemeny Oppfølging Lenke', section: 'System', type: 'text', description: 'Navigasjonslenke til oppfølgingssiden.' },
  { slug: 'sidebar-course-builder', title: 'Sidemeny Kursbygger Lenke', section: 'System', type: 'text', description: 'Navigasjonslenke til kursbyggeren.' },
  { slug: 'sidebar-quiz-builder', title: 'Sidemeny Quizbygger Lenke', section: 'System', type: 'text', description: 'Navigasjonslenke til quizbyggeren.' },
  { slug: 'sidebar-user-admin', title: 'Sidemeny Brukeradm Lenke', section: 'System', type: 'text', description: 'Navigasjonslenke til brukeradministrasjon.' },
  { slug: 'sidebar-cms-editor', title: 'Sidemeny CMS Lenke', section: 'System', type: 'text', description: 'Navigasjonslenke til CMS-editoren.' },
  { slug: 'sidebar-support', title: 'Sidemeny Support Lenke', section: 'System', type: 'text', description: 'Navigasjonslenke til support og hjelpesenter.' },

  // Studentportal og dashbord
  { slug: 'student-status-badge', title: 'Studie-status merkelapp', section: 'Studentportal', type: 'text', description: 'Liten status-etikett over velkomsthilsen.' },
  { slug: 'student-view-all', title: 'Vis alle knapp', section: 'Studentportal', type: 'text', description: 'Knapp for å vise alle aktive kurs.' },
  { slug: 'student-academic-eval', title: 'Faglig vurdering label', section: 'Studentportal', type: 'text', description: 'Etikett for elevens karakter/evalueringsstatus.' },
  { slug: 'student-continue-lesson', title: 'Fortsett leksjon knapp', section: 'Studentportal', type: 'text', description: 'Knapp for å fortsette påbegynt leksjon.' },
  { slug: 'student-live-header', title: 'Neste Live Samling tittel', section: 'Studentportal', type: 'text', description: 'Header for Zoom live-samlinger.' },
  { slug: 'student-join-zoom', title: 'Bli med via Zoom lenke', section: 'Studentportal', type: 'text', description: 'Zoom-handlingsknapp i dashbordet.' },
  { slug: 'student-stats-hours', title: 'Timer studert etikett', section: 'Studentportal', type: 'text', description: 'Statistikk-label på dashbordet.' },
  { slug: 'student-stats-completed', title: 'Fullførte leksjoner etikett', section: 'Studentportal', type: 'text', description: 'Statistikk-label på dashbordet.' },
  { slug: 'student-stats-goal', title: 'Ukemål fremdriftslabel', section: 'Studentportal', type: 'text', description: 'Fremdriftslinje-label på dashbordet.' },
  { slug: 'student-stats-reached', title: 'Nådd prosentetikett', section: 'Studentportal', type: 'text', description: 'Tekst-label for fullført prosentandel.' },

  // Mentorportal og dashbord
  { slug: 'teacher-academic-year-label', title: 'Studieår etikett', section: 'Mentorportal', type: 'text', description: 'Studieår-etikett øverst i mentorportalen.' },
  { slug: 'teacher-kpi1-trend', title: 'KPI 1 Trendlinje', section: 'Mentorportal', type: 'text', description: 'Trend/økning-tekst for aktive studenter.' },
  { slug: 'teacher-kpi3-desc', title: 'KPI 3 Evalueringsbeskrivelse', section: 'Mentorportal', type: 'text', description: 'Tekst under gjennomføringsrate KPI.' },
  { slug: 'teacher-kpi4-desc', title: 'KPI 4 Oppfølgingsvarsel', section: 'Mentorportal', type: 'text', description: 'Hjelpetekst under oppfølging KPI.' },
  { slug: 'teacher-risk-title', title: 'Studenter til oppfølging Tittel', section: 'Mentorportal', type: 'text', description: 'Header for risikostudenter-listen.' },
  { slug: 'teacher-risk-subtitle', title: 'Studenter til oppfølging Beskrivelse', section: 'Mentorportal', type: 'textarea', description: 'Undertekst for risikostudenter-listen.' },
  { slug: 'teacher-incoming-title', title: 'Innkomne oppgaver Tittel', section: 'Mentorportal', type: 'text', description: 'Overskrift for listen over oppgaver til sensur.' },
  { slug: 'teacher-incoming-subtitle', title: 'Innkomne oppgaver Beskrivelse', section: 'Mentorportal', type: 'textarea', description: 'Undertekst for oppgaver til sensur.' },
  { slug: 'teacher-classes-title', title: 'Dagens forelesninger Tittel', section: 'Mentorportal', type: 'text', description: 'Header for dagens Zoom-klasser.' },
  { slug: 'teacher-classes-subtitle', title: 'Dagens forelesninger Beskrivelse', section: 'Mentorportal', type: 'textarea', description: 'Undertekst for dagens Zoom-klasser.' },
  { slug: 'teacher-btn-start-class', title: 'Start Zoom-klasse knapp', section: 'Mentorportal', type: 'text', description: 'Handlingsknapp for å starte Zoom-klasse.' },

  // Oppgaver og vurderinger
  { slug: 'student-assignments-outstanding', title: 'Utestående oppgaver fane', section: 'Studentportal', type: 'text', description: 'Etikett på fanen for utestående oppgaver.' },
  { slug: 'student-assignments-submitted', title: 'Innsendte oppgaver fane', section: 'Studentportal', type: 'text', description: 'Etikett på fanen for leverte oppgaver.' },
  { slug: 'student-assignments-graded', title: 'Vurderte oppgaver fane', section: 'Studentportal', type: 'text', description: 'Etikett på fanen for vurderte oppgaver.' },
  { slug: 'student-assignments-not-submitted', title: 'Ikke innlevert statusbadge', section: 'Studentportal', type: 'text', description: 'Status-tekst for ikke-leverte oppgaver.' },
  { slug: 'student-assignments-waiting-grade', title: 'Venter på sensur statusbadge', section: 'Studentportal', type: 'text', description: 'Status-tekst for oppgaver til sensur.' },
  { slug: 'student-assignments-result', title: 'Resultat rubrikklabel', section: 'Studentportal', type: 'text', description: 'Tekst-label for vurderingsresultat.' },
  { slug: 'student-assignments-deadline', title: 'Innleveringsfrist rubrikklabel', section: 'Studentportal', type: 'text', description: 'Tekst-label for frister.' },

  // Bibelressurser (Public Bible Resources Page)
  { slug: 'resources-hero-tagline', title: 'Ressurser Hero Tagline', section: 'Bibelressurser', type: 'text', description: 'Undertekst / tagline i lilla banner på bibelressursersiden.' },
  { slug: 'resources-hero-title', title: 'Ressurser Hero Tittel', section: 'Bibelressurser', type: 'text', description: 'Hovedoverskriften i det lilla banneret på bibelressursersiden.' },
  { slug: 'resources-hero-desc', title: 'Ressurser Hero Beskrivelse', section: 'Bibelressurser', type: 'textarea', description: 'Beskrivende avsnitt under hovedtittelen på bibelressursersiden.' },
  { slug: 'resources-tab-bible', title: 'Tab 1: Studiebibel', section: 'Bibelressurser', type: 'text', description: 'Tittel på første fane (Interaktiv studiebibel).' },
  { slug: 'resources-tab-curriculums', title: 'Tab 2: Fagplaner', section: 'Bibelressurser', type: 'text', description: 'Tittel på andre fane (Fagplaner og studiehefter).' },
  { slug: 'resources-tab-video', title: 'Tab 3: Videoundervisning', section: 'Bibelressurser', type: 'text', description: 'Tittel på tredje fane (Lyd- og videoundervisning).' },
  { slug: 'resources-tab-fasting', title: 'Tab 4: Fastemanualer', section: 'Bibelressurser', type: 'text', description: 'Tittel på fjerde fane (Fastemanualer og bønneguider).' },
  { slug: 'resources-bible-title', title: 'Studiebibel Innholdstittel', section: 'Bibelressurser', type: 'text', description: 'Overskrift inni den interaktive studiebibel-fanen.' },
  { slug: 'resources-bible-desc', title: 'Studiebibel Innholdsbeskrivelse', section: 'Bibelressurser', type: 'textarea', description: 'Instruksjonsbeskrivelse inni studiebibel-fanen.' },
  { slug: 'resources-curriculums-title', title: 'Fagplaner Innholdstittel', section: 'Bibelressurser', type: 'text', description: 'Overskrift inni fagplaner-fanen.' },
  { slug: 'resources-curriculums-desc', title: 'Fagplaner Innholdsbeskrivelse', section: 'Bibelressurser', type: 'textarea', description: 'Beskrivelse inni fagplaner-fanen.' },
  { slug: 'resources-video-title', title: 'Video Innholdstittel', section: 'Bibelressurser', type: 'text', description: 'Overskrift inni video-fanen.' },
  { slug: 'resources-video-desc', title: 'Video Innholdsbeskrivelse', section: 'Bibelressurser', type: 'textarea', description: 'Beskrivelse inni video-fanen.' },
  { slug: 'resources-fasting-title', title: 'Faste Innholdstittel', section: 'Bibelressurser', type: 'text', description: 'Overskrift inni faste/bønn-fanen.' },
  { slug: 'resources-fasting-desc', title: 'Faste Innholdsbeskrivelse', section: 'Bibelressurser', type: 'textarea', description: 'Beskrivelse inni faste/bønn-fanen.' },

  // Profiler og kontoinnstillinger
  { slug: 'profile-tab-teacher', title: 'Fane: Lærerprofil', section: 'Profil', type: 'text', description: 'Tekst på mentorens profil-fane.' },
  { slug: 'profile-tab-student', title: 'Fane: Studentprofil', section: 'Profil', type: 'text', description: 'Tekst på elevens profil-fane.' },
  { slug: 'profile-tab-profile', title: 'Fane: Min profil', section: 'Profil', type: 'text', description: 'Tekst på Min Profil-fanen.' },
  { slug: 'profile-tab-account', title: 'Fane: Konto', section: 'Profil', type: 'text', description: 'Tekst på Konto-fanen.' },
  { slug: 'profile-breadcrumb-mentor', title: 'Brødsmule: Mentorpanel', section: 'Profil', type: 'text', description: 'Lenke til dashbordet øverst i lærerprofilen.' },
  { slug: 'profile-breadcrumb-teacher-title', title: 'Brødsmule: Min lærerprofil', section: 'Profil', type: 'text', description: 'Aktiv tittel i lærerprofilens brødsmuler.' },
  { slug: 'profile-breadcrumb-dashboard', title: 'Brødsmule: Dashboard', section: 'Profil', type: 'text', description: 'Lenke til dashbordet øverst i studentprofilen.' },
  { slug: 'profile-breadcrumb-student-title', title: 'Brødsmule: Min profil', section: 'Profil', type: 'text', description: 'Aktiv tittel i studentprofilens brødsmuler.' },
  { slug: 'profile-hero-student-role', title: 'Hero: Rolle-merkelapp (Student)', section: 'Profil', type: 'text', description: 'Rolle-tag under elevens navn i profilen.' },
  { slug: 'profile-hero-teacher-role', title: 'Hero: Rolle-merkelapp (Mentor)', section: 'Profil', type: 'text', description: 'Rolle-tag under mentorens navn i profilen.' },
  { slug: 'profile-hero-student-fallback', title: 'Hero: Navn-fallback (Student)', section: 'Profil', type: 'text', description: 'Navn som vises hvis eleven ikke har skrevet inn navn.' },
  { slug: 'profile-hero-teacher-fallback', title: 'Hero: Navn-fallback (Mentor)', section: 'Profil', type: 'text', description: 'Navn som vises hvis mentoren ikke har skrevet inn navn.' },
  { slug: 'profile-hero-not-specified', title: 'Hero: Sted ikke angitt', section: 'Profil', type: 'text', description: 'Fallback-tekst hvis bosted er tomt.' },
  { slug: 'profile-hero-students-kpi', title: 'KPI-etikett: Studenter', section: 'Profil', type: 'text', description: 'KPI-overskrift for antall studenter i lærerprofilen.' },
  { slug: 'profile-hero-students-sub', title: 'KPI-undertekst: Aktiv oppfølging', section: 'Profil', type: 'text', description: 'KPI-forklaring for studenter.' },
  { slug: 'profile-hero-courses-kpi', title: 'KPI-etikett: Kurs', section: 'Profil', type: 'text', description: 'KPI-overskrift for antall fagmoduler i lærerprofilen.' },
  { slug: 'profile-hero-courses-sub', title: 'KPI-undertekst: Fagmoduler', section: 'Profil', type: 'text', description: 'KPI-forklaring for fagmoduler.' },
  { slug: 'profile-hero-completion-kpi', title: 'KPI-etikett: Profil', section: 'Profil', type: 'text', description: 'KPI-overskrift for profilfullføring.' },
  { slug: 'profile-hero-completion-sub', title: 'KPI-undertekst: Fullføringsgrad', section: 'Profil', type: 'text', description: 'KPI-forklaring for fullføringsgrad.' },
  { slug: 'profile-nudge-teacher', title: 'Fullføringsadvarsel (Mentor)', section: 'Profil', type: 'textarea', description: 'Gul boks med påminnelse om å fylle ut lærerprofilen.' },
  { slug: 'profile-nudge-student', title: 'Fullføringsadvarsel (Student)', section: 'Profil', type: 'textarea', description: 'Gul boks med påminnelse om å fylle ut elevprofilen.' },
  { slug: 'profile-section-public', title: 'Seksjonsoverskrift: Offentlig profil', section: 'Profil', type: 'text', description: 'Tittel på den offentlige profilseksjonen.' },
  { slug: 'profile-section-personal', title: 'Seksjonsoverskrift: Personlig info', section: 'Profil', type: 'text', description: 'Tittel på den personlige profilseksjonen.' },
  { slug: 'profile-section-availability', title: 'Seksjonsoverskrift: Tilgjengelighet', section: 'Profil', type: 'text', description: 'Tittel på tilgjengelighetsseksjonen.' },
  { slug: 'profile-section-private', title: 'Seksjonsoverskrift: Privat kontakt', section: 'Profil', type: 'text', description: 'Tittel på privat kontaktinformasjon-seksjonen.' },
  { slug: 'profile-section-preview', title: 'Seksjonsoverskrift: Forhåndsvisning', section: 'Profil', type: 'text', description: 'Tittel på forhåndsvisningskortet.' },
  { slug: 'profile-section-email', title: 'Seksjonsoverskrift: E-postadresse', section: 'Profil', type: 'text', description: 'Tittel på e-postadresse-seksjonen.' },
  { slug: 'profile-section-password', title: 'Seksjonsoverskrift: Endre passord', section: 'Profil', type: 'text', description: 'Tittel på endre passord-seksjonen.' },
  { slug: 'profile-section-danger', title: 'Seksjonsoverskrift: Faresone', section: 'Profil', type: 'text', description: 'Tittel på faresone-seksjonen.' },
  { slug: 'profile-section-social', title: 'Seksjonsoverskrift: Sosiale medier', section: 'Profil', type: 'text', description: 'Tittel på sosiale medier-seksjonen.' },
  { slug: 'profile-field-fullname', title: 'Feltetikett: Fullt navn', section: 'Profil', type: 'text', description: 'Feltnavn for fullt navn i profilskjemaet.' },
  { slug: 'profile-field-title', title: 'Feltetikett: Tittel', section: 'Profil', type: 'text', description: 'Feltnavn for tittel i profilskjemaet.' },
  { slug: 'profile-field-department', title: 'Feltetikett: Avdeling / linje', section: 'Profil', type: 'text', description: 'Feltnavn for avdeling/linje i profilskjemaet.' },
  { slug: 'profile-field-location', title: 'Feltetikett: Sted', section: 'Profil', type: 'text', description: 'Feltnavn for sted/location.' },
  { slug: 'profile-field-city', title: 'Feltetikett: Bosted / By', section: 'Profil', type: 'text', description: 'Feltnavn for bosted/by.' },
  { slug: 'profile-field-expertise', title: 'Feltetikett: Fagområde', section: 'Profil', type: 'text', description: 'Feltnavn for fagområde.' },
  { slug: 'profile-field-bio', title: 'Feltetikett: Bio', section: 'Profil', type: 'text', description: 'Feltnavn for biografi.' },
  { slug: 'profile-field-bio-length', title: 'Etikett: Bio tegnantall', section: 'Profil', type: 'text', description: 'Tegn-telling etikett under bio.' },
  { slug: 'profile-field-hours', title: 'Feltetikett: Kontortid', section: 'Profil', type: 'text', description: 'Feltnavn for kontortid.' },
  { slug: 'profile-field-zoom', title: 'Feltetikett: Zoom-lenke', section: 'Profil', type: 'text', description: 'Feltnavn for Zoom-lenke.' },
  { slug: 'profile-field-phone', title: 'Feltetikett: Mobilnummer', section: 'Profil', type: 'text', description: 'Feltnavn for privat mobilnummer.' },
  { slug: 'profile-field-birthdate', title: 'Feltetikett: Fødselsdato', section: 'Profil', type: 'text', description: 'Feltnavn for privat fødselsdato.' },
  { slug: 'profile-field-address', title: 'Feltetikett: Adresse', section: 'Profil', type: 'text', description: 'Feltnavn for privat adresse.' },
  { slug: 'profile-field-email', title: 'Feltetikett: E-post', section: 'Profil', type: 'text', description: 'Feltnavn for e-post.' },
  { slug: 'profile-field-password-current', title: 'Feltetikett: Nåværende passord', section: 'Profil', type: 'text', description: 'Feltnavn for nåværende passord.' },
  { slug: 'profile-field-password-new', title: 'Feltetikett: Nytt passord', section: 'Profil', type: 'text', description: 'Feltnavn for nytt passord.' },
  { slug: 'profile-field-password-confirm', title: 'Feltetikett: Gjenta passord', section: 'Profil', type: 'text', description: 'Feltnavn for bekreftelse av passord.' },
  { slug: 'profile-field-ministry', title: 'Feltetikett: Tjenestegave', section: 'Profil', type: 'text', description: 'Feltnavn for tjenestegave/kall.' },
  { slug: 'profile-field-instagram', title: 'Feltetikett: Instagram', section: 'Profil', type: 'text', description: 'Feltnavn for Instagram.' },
  { slug: 'profile-field-facebook', title: 'Feltetikett: Facebook', section: 'Profil', type: 'text', description: 'Feltnavn for Facebook.' },
  { slug: 'profile-warning-not-saved', title: 'Advarsel: Ikke lagret automatisk', section: 'Profil', type: 'text', description: 'Hjelpetekst ved siden av lagreknappene.' },
  { slug: 'profile-warning-private-mentor', title: 'Advarsel: Private opplysninger (Mentor)', section: 'Profil', type: 'textarea', description: 'Advarselsbanner i privat seksjon for lærere.' },
  { slug: 'profile-warning-private-student', title: 'Advarsel: Private opplysninger (Student)', section: 'Profil', type: 'textarea', description: 'Advarselsbanner i privat seksjon for studenter.' },
  { slug: 'profile-warning-encrypted', title: 'Advarsel: Lagret kryptert', section: 'Profil', type: 'text', description: 'Kryptert-etikett nederst i privat seksjon.' },
  { slug: 'profile-warning-danger-desc-teacher', title: 'Advarsel: Faresone (Mentor)', section: 'Profil', type: 'text', description: 'Hjelpetekst under faresone for lærere.' },
  { slug: 'profile-warning-danger-desc-student', title: 'Advarsel: Faresone (Student)', section: 'Profil', type: 'text', description: 'Hjelpetekst under faresone for studenter.' },
  { slug: 'profile-warning-admin-title', title: 'Etikett: Admin-tilgang tittel', section: 'Profil', type: 'text', description: 'Tittel på lilla banner i privat seksjon for administratorer.' },
  { slug: 'profile-warning-admin-desc', title: 'Etikett: Admin-tilgang beskrivelse', section: 'Profil', type: 'text', description: 'Undertekst på lilla banner i privat seksjon for administratorer.' },
  { slug: 'profile-btn-save-teacher', title: 'Knapp: Lagre lærerprofil', section: 'Profil', type: 'text', description: 'Tekst på lagre-knappen for lærere.' },
  { slug: 'profile-btn-save-student', title: 'Knapp: Lagre profil (Student)', section: 'Profil', type: 'text', description: 'Tekst på lagre-knappen for studenter.' },
  { slug: 'profile-btn-undo', title: 'Knapp: Angre', section: 'Profil', type: 'text', description: 'Tekst på angre-knappen.' },
  { slug: 'profile-btn-update-email', title: 'Knapp: Oppdater e-post', section: 'Profil', type: 'text', description: 'Tekst på e-post oppdateringsknappen.' },
  { slug: 'profile-btn-update-password', title: 'Knapp: Oppdater passord', section: 'Profil', type: 'text', description: 'Tekst på passord oppdateringsknappen.' },
  { slug: 'profile-btn-logout', title: 'Knapp: Logg ut', section: 'Profil', type: 'text', description: 'Tekst på logg-ut knappen i faresonen.' },
  { slug: 'profile-status-pw-mismatch', title: 'Status: Passord ulikt', section: 'Profil', type: 'text', description: 'Feilmelding ved ulikt gjentatt passord.' },
  { slug: 'profile-status-pw-match', title: 'Status: Passord likt', section: 'Profil', type: 'text', description: 'Suksessmelding ved likt gjentatt passord.' },
  { slug: 'profile-status-saving', title: 'Status: Lagrer...', section: 'Profil', type: 'text', description: 'Spinner-tekst under lagring.' },
  { slug: 'profile-avatar-modal-title', title: 'Avatar: Modal tittel', section: 'Profil', type: 'text', description: 'Tittel på dialogboksen for profilbilde.' },
  { slug: 'profile-avatar-modal-desc', title: 'Avatar: Modal undertekst', section: 'Profil', type: 'text', description: 'Veiledningstekst i dialogboksen.' },
  { slug: 'profile-avatar-modal-soon', title: 'Avatar: Opplasting kommer snart', section: 'Profil', type: 'text', description: 'Undertekst om filopplasting i dialogboksen.' },
  { slug: 'profile-preview-name-fallback', title: 'Forhåndsvisning: Navn-fallback', section: 'Profil', type: 'text', description: 'Navn som vises på forhåndsvisningskortet om det er tomt.' },
  { slug: 'profile-preview-title-fallback', title: 'Forhåndsvisning: Tittel-fallback', section: 'Profil', type: 'text', description: 'Tittel som vises på forhåndsvisningskortet om det er tomt.' },
  { slug: 'profile-preview-expertise-fallback', title: 'Forhåndsvisning: Fagområde-fallback', section: 'Profil', type: 'text', description: 'Fagområde som vises på forhåndsvisningskortet om det er tomt.' },
  { slug: 'profile-preview-hours-fallback', title: 'Forhåndsvisning: Kontortid-fallback', section: 'Profil', type: 'text', description: 'Kontortid som vises på forhåndsvisningskortet om det er tomt.' },
  { slug: 'profile-preview-zoom-available', title: 'Forhåndsvisning: Veiledning tilgjengelig', section: 'Profil', type: 'text', description: 'Grønn digital veiledningstekst i forhåndsvisningen.' },
  { slug: 'profile-placeholder-fullname', title: 'Plassholder: Fullt navn', section: 'Profil', type: 'text', description: 'Hjelpetekst inni inputfeltet for fullt navn.' },
  { slug: 'profile-placeholder-title', title: 'Plassholder: Tittel', section: 'Profil', type: 'text', description: 'Hjelpetekst inni inputfeltet for tittel.' },
  { slug: 'profile-placeholder-department', title: 'Plassholder: Avdeling / linje', section: 'Profil', type: 'text', description: 'Hjelpetekst inni inputfeltet for avdeling/linje.' },
  { slug: 'profile-placeholder-location', title: 'Plassholder: Sted', section: 'Profil', type: 'text', description: 'Hjelpetekst inni inputfeltet for sted.' },
  { slug: 'profile-placeholder-expertise', title: 'Plassholder: Fagområde', section: 'Profil', type: 'text', description: 'Hjelpetekst inni inputfeltet for fagområde.' },
  { slug: 'profile-placeholder-bio-teacher', title: 'Plassholder: Bio (Mentor)', section: 'Profil', type: 'textarea', description: 'Hjelpetekst inni textareafeltet for lærers bio.' },
  { slug: 'profile-placeholder-hours', title: 'Plassholder: Kontortid', section: 'Profil', type: 'text', description: 'Hjelpetekst inni inputfeltet for kontortid.' },
  { slug: 'profile-placeholder-zoom', title: 'Plassholder: Zoom-lenke', section: 'Profil', type: 'text', description: 'Hjelpetekst inni inputfeltet for Zoom.' },
  { slug: 'profile-placeholder-phone', title: 'Plassholder: Mobilnummer', section: 'Profil', type: 'text', description: 'Hjelpetekst inni inputfeltet for mobil.' },
  { slug: 'profile-placeholder-address', title: 'Plassholder: Adresse', section: 'Profil', type: 'text', description: 'Hjelpetekst inni inputfeltet for adresse.' },
  { slug: 'profile-placeholder-email', title: 'Plassholder: E-post', section: 'Profil', type: 'text', description: 'Hjelpetekst inni inputfeltet for e-post.' },
  { slug: 'profile-placeholder-password', title: 'Plassholder: Passord', section: 'Profil', type: 'text', description: 'Prikker/stjerner plassholder inni passordfelt.' },
  { slug: 'profile-placeholder-ministry', title: 'Plassholder: Tjenestegave', section: 'Profil', type: 'text', description: 'Hjelpetekst inni inputfeltet for kall/tjeneste.' },
  { slug: 'profile-placeholder-bio-student', title: 'Plassholder: Bio (Student)', section: 'Profil', type: 'textarea', description: 'Hjelpetekst inni textareafeltet for students bio.' },
  { slug: 'profile-placeholder-social-username', title: 'Plassholder: Sosiale medier brukernavn', section: 'Profil', type: 'text', description: 'Hjelpetekst inni inputfeltet for instagram/facebook.' }
];

export default function CMSDashboard() {
  const navigate = useNavigate();
  const { user, cmsContent, updateCmsContent } = useApp();
  
  // Ref for global hotkey focusing of search input
  const searchInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Core Editor States
  const [draftContent, setDraftContent] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('category') || 'all';
  });
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [sortBy, setSortBy] = useState('Newest First');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Interactive Panel & Toast States
  const [isPublishing, setIsPublishing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', desc: '' });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeMenuRow, setActiveMenuRow] = useState(null);

  // Initialize draftContent as a clean local copy of global cmsContent state
  useEffect(() => {
    if (cmsContent) {
      const copy = { ...cmsContent };
      // Pre-fill mockup keys in local drafts if not already present
      if (!copy['nav.dashboard.title']) copy['nav.dashboard.title'] = 'Oversikt';
      if (!copy['nav.dashboard.title-en']) copy['nav.dashboard.title-en'] = 'Dashboard';
      if (!copy['btn.submit.primary']) copy['btn.submit.primary'] = 'Send inn endringer';
      if (!copy['btn.submit.primary-en']) copy['btn.submit.primary-en'] = 'Submit Changes';
      if (!copy['msg.welcome.student']) copy['msg.welcome.student'] = 'Velkommen tilbake, {{name}}! Klar for å lære i dag?';
      if (!copy['msg.welcome.student-en']) copy['msg.welcome.student-en'] = 'Welcome back, {{name}}! Ready to learn today?';
      if (!copy['error.auth.forbidden-en']) copy['error.auth.forbidden-en'] = 'You do not have permission to view this resource.';
      if (!copy['nav.settings.account']) copy['nav.settings.account'] = 'Kontoinnstillinger';
      if (!copy['nav.settings.account-en']) copy['nav.settings.account-en'] = 'Account Settings';
      
      setDraftContent(copy);
    }
  }, [cmsContent]);

  // Global hotkey listener: ⌘K or Ctrl+K focuses the search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset pagination to page 1 whenever search, categories, or limits change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, filterStatus, rowsPerPage]);

  // Handler for text input changes in draft state
  const handleTextChange = (slug, value, lang) => {
    const keyName = lang === 'no' ? slug : `${slug}-en`;
    setDraftContent(prev => ({
      ...prev,
      [keyName]: value
    }));
  };

  // Compute live unsaved modifications count
  const unsavedCount = useMemo(() => {
    let count = 0;
    assetDefinitions.forEach(asset => {
      const slug = asset.slug;
      const savedNo = cmsContent[slug] || '';
      const savedEn = cmsContent[slug + '-en'] || '';
      
      // Fallback prefilled keys for mockup consistency
      const defaultNo = slug === 'nav.dashboard.title' ? 'Oversikt' :
                        slug === 'btn.submit.primary' ? 'Send inn endringer' :
                        slug === 'msg.welcome.student' ? 'Velkommen tilbake, {{name}}! Klar for å lære i dag?' :
                        slug === 'nav.settings.account' ? 'Kontoinnstillinger' : '';
      
      const defaultEn = slug === 'nav.dashboard.title' ? 'Dashboard' :
                        slug === 'btn.submit.primary' ? 'Submit Changes' :
                        slug === 'msg.welcome.student' ? 'Welcome back, {{name}}! Ready to learn today?' :
                        slug === 'error.auth.forbidden' ? 'You do not have permission to view this resource.' :
                        slug === 'nav.settings.account' ? 'Account Settings' : '';

      const baseNo = savedNo || defaultNo;
      const baseEn = savedEn || defaultEn;

      const draftNo = draftContent[slug] || '';
      const draftEn = draftContent[slug + '-en'] || '';

      if (draftNo !== baseNo || draftEn !== baseEn) {
        count++;
      }
    });
    return count;
  }, [draftContent, cmsContent]);

  // Handle full batch publish action (simulated spinner -> save state)
  const handlePublish = async () => {
    setIsPublishing(true);
    // Simulate compilation / CDN propagation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Save all local drafts into the global App context
    Object.keys(draftContent).forEach(key => {
      if (draftContent[key] !== cmsContent[key]) {
        updateCmsContent(key, draftContent[key]);
      }
    });

    setIsPublishing(false);
    setToastMessage({
      title: 'Endringene ble publisert!',
      desc: 'Innholdet er nå oppdatert i databasen og synkronisert på tvers av plattformen.'
    });
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  // Discard all local draft modifications
  const handleDiscardChanges = () => {
    if (window.confirm('Er du sikker på at du vil forkaste alle ulagrede endringer?')) {
      const copy = { ...cmsContent };
      setDraftContent(copy);
      setToastMessage({
        title: 'Endringer forkastet',
        desc: 'Alle lokale utkast ble tilbakestilt til de lagrede verdiene.'
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Category Tabs metadata and live count computations
  const categories = useMemo(() => {
    return [
      { id: 'all', title: 'Systemnøkler', section: 'System', icon: Globe, count: assetDefinitions.length },
      { id: 'landing', title: 'Landingsside', section: 'Hjemmeside', icon: Layout, count: assetDefinitions.filter(d => d.section === 'Hjemmeside').length },
      { id: 'auth', title: 'Innloggingsflyt', section: 'Innlogging', icon: UserCheck, count: assetDefinitions.filter(d => d.section === 'Innlogging').length },
      { id: 'student', title: 'Studentportal', section: 'Studentportal', icon: BookOpen, count: assetDefinitions.filter(d => d.section === 'Studentportal').length },
      { id: 'teacher', title: 'Mentorportal', section: 'Mentorportal', icon: Users, count: assetDefinitions.filter(d => d.section === 'Mentorportal').length },
      { id: 'onboarding', title: 'Onboardingflyt', section: 'Onboarding', icon: Rocket, count: assetDefinitions.filter(d => d.section === 'Onboarding').length },
      { id: 'resources', title: 'Bibelressurser', section: 'Bibelressurser', icon: BookOpen, count: assetDefinitions.filter(d => d.section === 'Bibelressurser').length },
      { id: 'documents', title: 'Dokumenter (PDF)', section: 'Dokumenter', icon: FileText, count: 2 }
    ];
  }, []);

  // Filter keys depending on selected rail, toolbar filters, and searches
  const filteredAssets = useMemo(() => {
    return assetDefinitions.filter(asset => {
      // 1. Filter by category
      if (selectedCategory !== 'all') {
        const mapping = {
          landing: 'Hjemmeside',
          auth: 'Innlogging',
          student: 'Studentportal',
          teacher: 'Mentorportal',
          onboarding: 'Onboarding',
          resources: 'Bibelressurser',
          system: 'System',
          documents: 'Dokumenter'
        };
        if (asset.section !== mapping[selectedCategory]) {
          return false;
        }
      }

      // 2. Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const slug = asset.slug.toLowerCase();
        const title = asset.title.toLowerCase();
        const desc = (asset.description || '').toLowerCase();
        const valNo = (draftContent[asset.slug] || '').toLowerCase();
        const valEn = (draftContent[asset.slug + '-en'] || '').toLowerCase();

        if (!slug.includes(q) && !title.includes(q) && !desc.includes(q) && !valNo.includes(q) && !valEn.includes(q)) {
          return false;
        }
      }

      // 3. Filter by translation status
      const isMissing = !draftContent[asset.slug]?.trim() || !draftContent[asset.slug + '-en']?.trim();
      
      const savedNo = cmsContent[asset.slug] || '';
      const savedEn = cmsContent[asset.slug + '-en'] || '';
      
      // Prefilled fallbacks checking
      const defaultNo = asset.slug === 'nav.dashboard.title' ? 'Oversikt' :
                        asset.slug === 'btn.submit.primary' ? 'Send inn endringer' :
                        asset.slug === 'msg.welcome.student' ? 'Velkommen tilbake, {{name}}! Klar for å lære i dag?' :
                        asset.slug === 'nav.settings.account' ? 'Kontoinnstillinger' : '';
      
      const defaultEn = asset.slug === 'nav.dashboard.title' ? 'Dashboard' :
                        asset.slug === 'btn.submit.primary' ? 'Submit Changes' :
                        asset.slug === 'msg.welcome.student' ? 'Welcome back, {{name}}! Ready to learn today?' :
                        asset.slug === 'error.auth.forbidden' ? 'You do not have permission to view this resource.' :
                        asset.slug === 'nav.settings.account' ? 'Account Settings' : '';

      const baseNo = savedNo || defaultNo;
      const baseEn = savedEn || defaultEn;

      const isDraft = (draftContent[asset.slug] || '') !== baseNo || (draftContent[asset.slug + '-en'] || '') !== baseEn;

      if (filterStatus === 'Draft' && !isDraft) return false;
      if (filterStatus === 'Published' && (isDraft || isMissing)) return false;
      if (filterStatus === 'Missing Translation' && !isMissing) return false;

      return true;
    });
  }, [selectedCategory, searchQuery, filterStatus, draftContent, cmsContent]);

  // Sort matched keys
  const sortedAssets = useMemo(() => {
    const list = [...filteredAssets];
    if (sortBy === 'Alphabetical (Key)') {
      list.sort((a, b) => a.slug.localeCompare(b.slug));
    } else if (sortBy === 'Recently Modified') {
      list.sort((a, b) => {
        const savedANo = cmsContent[a.slug] || '';
        const savedBNo = cmsContent[b.slug] || '';
        const draftANo = draftContent[a.slug] || '';
        const draftBNo = draftContent[b.slug] || '';
        
        const aDiff = draftANo !== savedANo;
        const bDiff = draftBNo !== savedBNo;
        if (aDiff && !bDiff) return -1;
        if (!aDiff && bDiff) return 1;
        return 0;
      });
    }
    return list;
  }, [filteredAssets, sortBy, draftContent, cmsContent]);

  // Slice list for pagination
  const totalItems = sortedAssets.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedAssets.slice(start, end);
  }, [sortedAssets, currentPage, rowsPerPage]);

  // Working JSON File Exporter
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(draftContent, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "hkm-cms-content.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    
    setToastMessage({
      title: 'Eksportert JSON',
      desc: 'En fullstendig kopi av språknøklene er lastet ned til maskinen din.'
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Working File Importer (accepts JSON and merges into local drafts)
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          setDraftContent(prev => ({
            ...prev,
            ...parsed
          }));
          setToastMessage({
            title: 'Import Vellykket!',
            desc: `Importerte og slo sammen ${Object.keys(parsed).length} språknøkler i utkast.`
          });
          setShowToast(true);
          setTimeout(() => setShowToast(false), 4000);
        } else {
          // Fallback parsing simple CSV
          const lines = text.split('\n');
          let count = 0;
          const imported = {};
          lines.forEach(line => {
            const parts = line.split(',');
            if (parts.length >= 2) {
              const slug = parts[0].trim();
              const val = parts[1].trim();
              if (slug) {
                imported[slug] = val;
                count++;
              }
              if (parts[2]) {
                imported[`${slug}-en`] = parts[2].trim();
              }
            }
          });
          setDraftContent(prev => ({ ...prev, ...imported }));
          setToastMessage({
            title: 'Import Vellykket!',
            desc: `Importerte og slo sammen ${count} nøkler fra CSV.`
          });
          setShowToast(true);
          setTimeout(() => setShowToast(false), 4000);
        }
      } catch (err) {
        alert('Klarte ikke å parse filen. Sjekk at JSON/CSV-formatet er korrekt.');
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Clear input
  };

  // Timeline Mock Revision entries
  const mockRevisions = [
    { id: 4, date: 'I dag - 17:45', author: 'Siri Hansen (Administrator)', action: 'Oppdaterte landing-hero-title til "His Kingdom prophets"' },
    { id: 3, date: 'I dag - 14:20', author: 'Siri Hansen (Administrator)', action: 'La inn engelske oversettelser for student-welcome-subtitle' },
    { id: 2, date: 'I går - 09:15', author: 'Thomas Knutsen (Utvikler)', action: 'Konfigurerte onboarding felt-strings for nye studentprofiler' },
    { id: 1, date: '20. Mai - 10:00', author: 'System (Initialisering)', action: 'Etablerte CMS-språkbase med 75 nøkler' }
  ];

  // DocumentCMSPanel subcomponent for custom PDF uploads via Firebase Storage
  const DocumentCMSPanel = () => {
    const [uploadingFasting, setUploadingFasting] = useState(false);
    const [progressFasting, setProgressFasting] = useState(0);
    const [uploadingIntercession, setUploadingIntercession] = useState(false);
    const [progressIntercession, setProgressIntercession] = useState(0);

    const handleUpload = (e, type) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.type !== 'application/pdf') {
        setToastMessage({
          title: 'Feil filtype',
          desc: 'Kun PDF-filer er tillatt.'
        });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setToastMessage({
          title: 'Filen er for stor',
          desc: 'Maksimal filstørrelse er 10MB.'
        });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }

      const isFasting = type === 'fasting';
      if (isFasting) {
        setUploadingFasting(true);
        setProgressFasting(0);
      } else {
        setUploadingIntercession(true);
        setProgressIntercession(0);
      }

      const timestamp = Date.now();
      const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const storageRef = ref(storage, `pdfs/${type}_${timestamp}_${cleanName}`);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          if (isFasting) setProgressFasting(progress);
          else setProgressIntercession(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          if (isFasting) setUploadingFasting(false);
          else setUploadingIntercession(false);
          setToastMessage({
            title: 'Opplasting feilet',
            desc: 'Kunne ikke laste opp filen. Prøv igjen.'
          });
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const slug = isFasting ? 'pdf_fasting_url' : 'pdf_intercession_url';
            await updateCmsContent(slug, downloadURL);

            if (isFasting) {
              setUploadingFasting(false);
              setProgressFasting(100);
            } else {
              setUploadingIntercession(false);
              setProgressIntercession(100);
            }

            setToastMessage({
              title: 'Dokument oppdatert',
              desc: `${file.name} ble lastet opp og satt som aktiv manual.`
            });
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
          } catch (err) {
            console.error("Url retrieval error:", err);
            if (isFasting) setUploadingFasting(false);
            else setUploadingIntercession(false);
          }
        }
      );
    };

    const handleReset = async (type) => {
      const isFasting = type === 'fasting';
      const slug = isFasting ? 'pdf_fasting_url' : 'pdf_intercession_url';
      try {
        await updateCmsContent(slug, '');
        setToastMessage({
          title: 'Tilbakestilt til standard',
          desc: 'Dokumentet bruker nå den systemgenererte standarden.'
        });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (err) {
        console.error("Reset error:", err);
      }
    };

    const docs = [
      {
        id: 'fasting',
        title: 'Bibelsk Faste og Åndelig Disiplin',
        desc: 'Studiemanual for fasting, bønn og teologiske retningslinjer.',
        slug: 'pdf_fasting_url',
        defaultUrl: '/Bibelsk_Faste_og_Aandelig_Disiplin.pdf',
        uploading: uploadingFasting,
        progress: progressFasting
      },
      {
        id: 'intercession',
        title: 'Profetisk Forbønn og Bønneskjold',
        desc: 'Studiemanual for forbønn og etablering av et aktivt bønneskjold.',
        slug: 'pdf_intercession_url',
        defaultUrl: '/Profetisk_Forboenn_og_Boenneskjold.pdf',
        uploading: uploadingIntercession,
        progress: progressIntercession
      }
    ];

    return (
      <div className="flex flex-col gap-6">
        <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-primary mb-1">Dokumentbehandling</h2>
          <p className="text-xs text-outline font-medium">
            Her kan du laste opp dine egne PDF-dokumenter for studieheftene. Studentene vil laste ned dine tilpassede PDF-filer i stedet for de systemgenererte standardene. Du kan når som helst nullstille tilbake til systemets 1-sides standard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {docs.map((doc) => {
            const customUrl = cmsContent?.[doc.slug];
            const isActiveCustom = !!customUrl;
            const currentUrl = customUrl || doc.defaultUrl;

            return (
              <div key={doc.id} className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col justify-between hover:shadow transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-3 select-none">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isActiveCustom 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {isActiveCustom ? 'Egendefinert' : 'Systemstandard'}
                    </span>
                    <a 
                      href={currentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <Info size={12} /> Se aktiv PDF
                    </a>
                  </div>

                  <h3 className="font-serif text-base font-bold text-primary mb-1">{doc.title}</h3>
                  <p className="text-xs text-on-surface-variant font-medium mb-6">{doc.desc}</p>
                </div>

                <div className="space-y-4">
                  {doc.uploading ? (
                    <div className="bg-slate-50 border border-outline-variant/20 rounded-xl p-4">
                      <div className="flex items-center justify-between text-xs font-bold text-primary mb-2 select-none">
                        <span>Laster opp til server...</span>
                        <span>{doc.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full transition-all duration-300 rounded-full" 
                          style={{ width: `${doc.progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <label className="w-full border border-dashed border-outline-variant/50 hover:border-primary hover:bg-primary/5 transition-all rounded-xl p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-2 select-none group">
                        <UploadCloud size={28} className="text-outline group-hover:text-primary transition-colors" />
                        <span className="text-xs font-bold text-on-surface">Klikk eller dra for å laste opp</span>
                        <span className="text-[10px] text-outline font-semibold">PDF-format, maks 10MB</span>
                        <input 
                          type="file" 
                          accept=".pdf" 
                          onChange={(e) => handleUpload(e, doc.id)}
                          className="hidden" 
                        />
                      </label>

                      {isActiveCustom && (
                        <button
                          onClick={() => handleReset(doc.id)}
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 transition-all rounded-xl active:scale-[0.98] bg-white shadow-sm font-sans"
                        >
                          <RotateCcw size={14} /> Nullstill til systemstandard
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-12 py-6 md:py-12 flex flex-col gap-6 md:gap-8 font-sans">
      
      {/* Dynamic Notification Bar for unsaved modifications */}
      <AnimatePresence>
        {unsavedCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-amber-500/10 border border-amber-500/30 text-amber-900 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm select-none"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-amber-600 shrink-0" size={24} />
              <div className="text-xs">
                <span className="font-bold">Ulagrede endringer i utkast!</span>
                <p className="text-amber-800 mt-0.5 font-medium">Du har endret {unsavedCount} tekstfelt som ikke er publisert til databasen ennå.</p>
              </div>
            </div>
            <button 
              onClick={handleDiscardChanges}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow transition-all flex items-center gap-1.5 shrink-0 active:scale-[0.98]"
            >
              <RotateCcw size={14} /> Forkast endringer
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header and Main Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-4xl font-bold text-primary flex items-center gap-2">
            <Languages className="text-primary shrink-0" size={32} /> Global CMS Styring
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 font-medium">
            Administrer og rediger all tekst på alle sider i His Kingdom Prophets-plattformen.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="px-4 py-2 border border-outline-variant hover:border-primary text-xs font-bold uppercase rounded-lg bg-white flex items-center gap-1.5 hover:text-primary transition-all active:scale-95 shadow-sm"
          >
            <History size={16} /> Revisjonshistorikk
          </button>
          <button 
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-6 py-2 bg-[#561291] hover:bg-[#561291]/90 text-white text-xs font-bold uppercase rounded-lg shadow-sm flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-60 shrink-0"
          >
            {isPublishing ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Publiserer...
              </>
            ) : (
              <>
                <UploadCloud size={16} /> Publiser endringer
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Left side category tabs & Right side editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Categories Rail (Left 3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-6 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <div>
            <h3 className="font-serif text-base font-bold text-primary border-b border-outline-variant/30 pb-3 mb-4 flex items-center gap-2">
              <Settings className="text-primary" size={20} /> Kategori
            </h3>
            <ul className="space-y-1.5">
              {categories.map(tab => {
                const isActive = selectedCategory === tab.id;
                const IconComponent = tab.icon;
                return (
                  <li key={tab.id}>
                    <button 
                      onClick={() => setSelectedCategory(tab.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left text-xs font-semibold ${
                        isActive 
                          ? 'bg-primary/5 text-primary border-l-4 border-primary shadow-sm font-bold' 
                          : 'text-on-surface-variant hover:bg-slate-50 hover:text-primary'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <IconComponent size={16} className={isActive ? 'text-primary' : 'text-on-surface-variant'} />
                        {tab.title}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        isActive ? 'bg-primary text-white' : 'text-outline bg-slate-100'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Export / Import Panel */}
          <div className="border-t border-outline-variant/30 pt-5">
            <h3 className="font-serif text-base font-bold text-primary mb-3">Eksporter / Importer</h3>
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleExportJSON}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-primary border border-primary/20 hover:border-primary hover:bg-primary/5 transition-all rounded-lg active:scale-95 bg-white shadow-sm"
              >
                <Download size={14} /> Eksporter JSON
              </button>

              <input 
                ref={fileInputRef}
                type="file" 
                accept=".json,.csv" 
                onChange={handleFileChange} 
                className="hidden" 
              />
              <button 
                onClick={handleImportClick}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-on-surface border border-outline-variant/30 hover:border-primary hover:bg-slate-50 transition-all rounded-lg active:scale-95 bg-white shadow-sm"
              >
                <Upload size={14} /> Importer CSV / JSON
              </button>
            </div>
          </div>
        </div>

        {/* Editor Area (Right 9 cols) */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          
          {selectedCategory === 'documents' ? (
            <DocumentCMSPanel />
          ) : (
            <>
              {/* Filters Card */}
              <div className="bg-white border border-outline-variant/30 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              
              {/* Search input in toolbar */}
              <div className="relative flex items-center bg-slate-50 border border-outline-variant/40 rounded-lg px-3 py-1.5 w-full sm:w-64 md:w-80 focus-within:border-primary transition-all">
                <Search className="text-outline shrink-0" size={18} />
                <input 
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none focus:ring-0 text-xs w-full ml-2 text-on-surface placeholder:text-outline/70" 
                  placeholder="Søk i språknøkler..." 
                  type="text"
                />
                <span className="text-[10px] text-outline font-mono select-none shrink-0 ml-2">⌘K</span>
              </div>

              {/* Seksjon selector for small screens */}
              <div className="flex items-center gap-2 md:hidden">
                <span className="text-xs font-bold text-on-surface-variant">Seksjon:</span>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-50 border border-outline-variant/30 rounded-lg text-xs py-1.5 pl-3 pr-8 focus:ring-primary focus:border-primary font-medium"
                >
                  <option value="all">Systemnøkler</option>
                  <option value="landing">Landingsside</option>
                  <option value="auth">Innloggingsflyt</option>
                  <option value="student">Studentportal</option>
                  <option value="teacher">Mentorportal</option>
                  <option value="onboarding">Onboardingflyt</option>
                  <option value="resources">Bibelressurser</option>
                  <option value="documents">Dokumenter (PDF)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-on-surface-variant">Filter:</span>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-50 border border-outline-variant/30 rounded-lg text-xs py-1.5 pl-3 pr-8 focus:ring-primary focus:border-primary font-medium"
                >
                  <option value="All Statuses">Alle statuser</option>
                  <option value="Draft">Ulagret kladd</option>
                  <option value="Published">Publisert</option>
                  <option value="Missing Translation">Mangler engelsk oversettelse</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-on-surface-variant">Sortering:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-outline-variant/30 rounded-lg text-xs py-1.5 pl-3 pr-8 focus:ring-primary focus:border-primary font-medium"
                >
                  <option value="Newest First">Nyeste først</option>
                  <option value="Alphabetical (Key)">Alfabetisk (Nøkkel)</option>
                  <option value="Recently Modified">Nylig endret</option>
                </select>
              </div>
            </div>

            <div className="text-xs font-semibold text-outline shrink-0 ml-auto sm:ml-0">
              Viser {totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, totalItems)} av {totalItems} strenger
            </div>
          </div>

          {/* Grid Container */}
          <div className="space-y-4">
            
            {/* Columns Header (large screen only) */}
            <div className="hidden md:grid grid-cols-12 gap-6 px-6 py-2 text-outline font-bold uppercase tracking-wider select-none border-b border-outline-variant/20 text-[10px]">
              <div className="col-span-3">Nøkkel / ID</div>
              <div className="col-span-4 flex items-center gap-1.5">
                <Flag size={14} className="text-outline" /> Norsk (NB)
              </div>
              <div className="col-span-4 flex items-center gap-1.5">
                <Globe size={14} className="text-outline" /> Engelsk (EN)
              </div>
              <div className="col-span-1 text-center">Status</div>
            </div>

            {/* Empty State */}
            {paginatedAssets.length === 0 && (
              <div className="bg-white border border-dashed border-outline-variant/50 rounded-2xl p-16 text-center text-outline select-none shadow-sm">
                <Info className="text-outline-variant mx-auto mb-3" size={48} />
                <p className="font-serif text-lg font-bold text-primary">Ingen treff</p>
                <p className="text-xs mt-1 text-on-surface-variant font-medium">
                  Ingen språknøkler matcher valgte søk eller filterkriterier.
                </p>
              </div>
            )}

            {/* Content Rows */}
            {paginatedAssets.map(asset => {
              const slug = asset.slug;
              const valNo = draftContent[slug] || '';
              const valEn = draftContent[slug + '-en'] || '';

              // Compute status dynamically
              const isMissing = !valNo.trim() || !valEn.trim();
              
              const savedNo = cmsContent[slug] || '';
              const savedEn = cmsContent[slug + '-en'] || '';
              
              // Prefilled fallbacks checking
              const defaultNo = slug === 'nav.dashboard.title' ? 'Oversikt' :
                                slug === 'btn.submit.primary' ? 'Send inn endringer' :
                                slug === 'msg.welcome.student' ? 'Velkommen tilbake, {{name}}! Klar for å lære i dag?' :
                                slug === 'nav.settings.account' ? 'Kontoinnstillinger' : '';
              
              const defaultEn = slug === 'nav.dashboard.title' ? 'Dashboard' :
                                slug === 'btn.submit.primary' ? 'Submit Changes' :
                                slug === 'msg.welcome.student' ? 'Welcome back, {{name}}! Ready to learn today?' :
                                slug === 'error.auth.forbidden' ? 'You do not have permission to view this resource.' :
                                slug === 'nav.settings.account' ? 'Account Settings' : '';

              const baseNo = savedNo || defaultNo;
              const baseEn = savedEn || defaultEn;

              const isDraft = valNo !== baseNo || valEn !== baseEn;

              // CSS classes for textareas
              const noTextareaClass = `w-full bg-slate-50 border border-outline-variant/30 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary py-2 px-3 resize-none ${
                isMissing && !valNo.trim() 
                  ? 'bg-red-50/50 border-dashed border-red-300 focus:ring-red-500 focus:border-red-500 placeholder:text-red-400' 
                  : (valNo !== baseNo) 
                    ? 'border-2 border-primary/30 bg-white' 
                    : 'hover:border-outline-variant/60'
              }`;

              const enTextareaClass = `w-full bg-slate-50 border border-outline-variant/30 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary py-2 px-3 resize-none ${
                isMissing && !valEn.trim() 
                  ? 'bg-red-50/50 border-dashed border-red-300 focus:ring-red-500 focus:border-red-500 placeholder:text-red-400' 
                  : (valEn !== baseEn) 
                    ? 'border-2 border-primary/30 bg-white' 
                    : 'hover:border-outline-variant/60'
              }`;

              const isMenuOpen = activeMenuRow === slug;

              return (
                <div 
                  key={slug}
                  className={`group bg-white border transition-all p-5 rounded-xl flex flex-col gap-4 shadow-sm hover:shadow ${
                    isMissing 
                      ? 'border-dashed border-red-300 hover:border-red-500' 
                      : 'border-outline-variant/30 hover:border-[#561291]'
                  }`}
                >
                  <div className="grid grid-cols-1 grid-flow-row md:grid-cols-12 gap-4 items-start" style={{ display: 'block' }}>
                    <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-start">
                      {/* Key Info Column */}
                      <div className="md:col-span-3 pt-1 select-none w-full">
                        <code className={`font-mono text-[11px] px-2 py-1 rounded break-all font-bold ${
                          isMissing ? 'text-red-600 bg-red-50' : 'text-primary bg-primary/5'
                        }`}>
                          {slug}
                        </code>
                        <p className="text-[11px] text-outline mt-2 leading-tight font-medium">
                          {asset.description || 'Systemkonfigurasjon for tekstnøkkel.'}
                        </p>
                      </div>

                      {/* Norwegian Textarea Column */}
                      <div className="md:col-span-4 block w-full">
                        <div className="flex items-center gap-1 mb-1 md:hidden select-none">
                          <Flag size={12} className="text-outline" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Norsk (NB)</span>
                        </div>
                        <textarea 
                          style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                          className={noTextareaClass}
                          value={valNo}
                          onChange={(e) => handleTextChange(slug, e.target.value, 'no')}
                          placeholder={isMissing && !valNo.trim() ? "Mangler norsk oversettelse..." : ""}
                          rows={asset.type === 'textarea' ? 3 : 2}
                        />
                      </div>

                      {/* English Textarea Column */}
                      <div className="md:col-span-4 block w-full">
                        <div className="flex items-center gap-1 mb-1 md:hidden select-none">
                          <Globe size={12} className="text-outline" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Engelsk (EN)</span>
                        </div>
                        <textarea 
                          style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                          className={enTextareaClass}
                          value={valEn}
                          onChange={(e) => handleTextChange(slug, e.target.value, 'en')}
                          placeholder={isMissing && !valEn.trim() ? "Mangler engelsk oversettelse..." : ""}
                          rows={asset.type === 'textarea' ? 3 : 2}
                        />
                      </div>

                      {/* Status Column */}
                      <div className="md:col-span-1 flex md:flex-col items-center justify-between md:justify-start gap-3 md:gap-2 pt-1.5 relative w-full md:w-auto">
                        <span className="md:hidden text-[10px] font-bold uppercase text-outline select-none">Status:</span>
                        
                        <div className="flex items-center gap-2">
                          {isMissing ? (
                            <AlertTriangle className="text-red-500 cursor-help" size={20} title="Mangler oversettelse" />
                          ) : (
                            <span 
                              className={`w-2.5 h-2.5 rounded-full cursor-help shadow-sm border border-white ${isDraft ? 'bg-amber-500' : 'bg-green-500'}`} 
                              title={isDraft ? 'Utkast - Ulagret' : 'Publisert'} 
                            />
                          )}
                          
                          {/* Inline Menu Trigger */}
                          <div className="relative">
                            <button 
                              onClick={() => setActiveMenuRow(isMenuOpen ? null : slug)}
                              className="p-1 text-outline hover:text-primary transition-colors hover:bg-slate-100 rounded-lg"
                            >
                              <MoreVertical size={20} />
                            </button>

                            <AnimatePresence>
                              {isMenuOpen && (
                                <>
                                  <div 
                                    className="fixed inset-0 z-10" 
                                    onClick={() => setActiveMenuRow(null)}
                                  />
                                  <motion.div 
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute right-0 mt-2 bg-white border border-outline-variant/30 rounded-xl shadow-xl w-48 py-1.5 z-20 select-none text-left"
                                  >
                                    <button 
                                      onClick={() => {
                                        navigator.clipboard.writeText(slug);
                                        setToastMessage({ title: 'Kopiert!', desc: `Nøkkelen "${slug}" ble kopiert til utklippstavlen.` });
                                        setShowToast(true);
                                        setTimeout(() => setShowToast(false), 2000);
                                        setActiveMenuRow(null);
                                      }}
                                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-semibold text-on-surface flex items-center gap-2"
                                    >
                                      <Copy className="text-outline" size={14} /> Kopier nøkkelnavn
                                    </button>
                                    <button 
                                      onClick={() => {
                                        handleTextChange(slug, defaultNo, 'no');
                                        handleTextChange(slug, defaultEn, 'en');
                                        setActiveMenuRow(null);
                                      }}
                                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-semibold text-on-surface flex items-center gap-2"
                                    >
                                      <RotateCcw className="text-amber-500" size={14} /> Nullstill til standard
                                    </button>
                                    <button 
                                      onClick={() => {
                                        handleTextChange(slug, '', 'no');
                                        handleTextChange(slug, '', 'en');
                                        setActiveMenuRow(null);
                                      }}
                                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-xs font-semibold text-red-600 flex items-center gap-2 border-t border-outline-variant/30 mt-1 pt-1.5"
                                    >
                                      <Trash2 className="text-red-600" size={14} /> Tøm feltene
                                    </button>
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white border border-outline-variant/30 p-4 rounded-xl shadow-sm gap-4 select-none">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-outline-variant/30 rounded-lg hover:bg-slate-50 hover:border-primary transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    const isCurrent = currentPage === page;
                    return (
                      <button 
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                          isCurrent 
                            ? 'bg-[#561291] text-white shadow-sm' 
                            : 'hover:bg-slate-50 text-on-surface'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 border border-outline-variant/30 rounded-lg hover:bg-slate-50 hover:border-primary transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-on-surface-variant">Rader per side:</span>
                <select 
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="bg-slate-50 border border-outline-variant/30 rounded-lg text-xs py-1 px-3 focus:ring-primary focus:border-primary font-medium"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          )}
            </>
          )}

        </div>
      </div>

      {/* Slide-Over Revision History Drawer Panel */}
      <AnimatePresence>
        {isHistoryOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="fixed inset-0 bg-black z-[100]"
            />

            {/* Revision Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[450px] max-w-full bg-white shadow-2xl z-[110] border-l border-outline-variant/30 flex flex-col p-6 overflow-hidden select-none"
            >
              <div className="flex justify-between items-center pb-4 border-b border-outline-variant/30 shrink-0">
                <div className="flex items-center gap-2">
                  <History className="text-primary" size={24} />
                  <h3 className="font-serif text-lg font-bold text-primary">Revisjonshistorikk</h3>
                </div>
                <button 
                  onClick={() => setIsHistoryOpen(false)} 
                  className="p-2 hover:bg-slate-100 rounded-full text-outline hover:text-on-surface transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* History Timeline Content */}
              <div className="flex-grow overflow-y-auto py-6 space-y-6">
                <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                  Nedenfor vises revisjonsloggen for endringer gjort i CMS-systemet. Du kan rulle tilbake eller spore hvem som oppdaterte spesifikke strenger.
                </p>
                
                <div className="relative border-l border-outline-variant/40 ml-3 pl-6 space-y-8 mt-4">
                  {mockRevisions.map((rev, index) => (
                    <div key={rev.id} className="relative">
                      {/* Timeline dot styling */}
                      <span className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow flex items-center justify-center ${index === 0 ? 'bg-primary ring-4 ring-primary/20' : 'bg-outline-variant'}`} />
                      
                      <span className="text-[10px] text-outline font-bold block">{rev.date}</span>
                      <span className="text-xs font-bold text-primary mt-1 block">{rev.author}</span>
                      <p className="text-[11px] text-on-surface-variant mt-1.5 leading-normal bg-slate-50 p-2.5 rounded-lg border border-outline-variant/30 font-medium">
                        {rev.action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revision Reversion Action Button */}
              <div className="pt-4 border-t border-outline-variant/30 shrink-0">
                <button 
                  onClick={() => {
                    if (window.confirm('Vil du hente den forrige revisjonen (Revisjon 3)? Dette vil overskrive dine nåværende utkast.')) {
                      setDraftContent(prev => ({
                        ...prev,
                        'landing-hero-title': 'His Kingdom prophets',
                        'student-welcome-subtitle-en': 'You are making exceptional progress in prophetic ministry and hermeneutics this week. Your mentors have published 2 new study books in the library.'
                      }));
                      setIsHistoryOpen(false);
                      setToastMessage({
                        title: 'Historikk gjenopprettet',
                        desc: 'Innholdet fra Revisjon 3 er lagt inn i redigeringsfeltet ditt.'
                      });
                      setShowToast(true);
                      setTimeout(() => setShowToast(false), 3000);
                    }
                  }}
                  className="w-full py-3 bg-[#561291] hover:bg-[#561291]/90 text-white text-xs font-bold uppercase rounded-lg shadow active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={16} /> Gjenopprett forrige revisjon (#3)
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Elegant Custom Floating Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-[200] flex items-center gap-4 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl border border-outline/10 max-w-md cursor-pointer select-none"
            onClick={() => setShowToast(false)}
          >
            <CheckCircle2 className="text-green-400 shrink-0" size={24} />
            <div className="flex flex-col">
              <span className="font-bold text-white text-xs leading-tight">{toastMessage.title}</span>
              <span className="text-[11px] opacity-80 mt-1 leading-normal font-medium">{toastMessage.desc}</span>
            </div>
            <button 
              className="ml-4 text-slate-400 hover:text-white transition-opacity shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                setShowToast(false);
              }}
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
