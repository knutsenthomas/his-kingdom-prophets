import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import HkmChatWidget from '@/components/HkmChatWidget';

// Definition of all CMS strings with labels, categories, and explanatory descriptions
const assetDefinitions = [
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
  { slug: 'nav.settings.account', title: 'Kontoinnstillinger Link', section: 'System', type: 'text', description: 'Lenke til brukerprofil og kontopreferanser.' }
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
  const [selectedCategory, setSelectedCategory] = useState('all');
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
      desc: 'Innholdet er nå oppdatert i Supabase og synkronisert til produksjons-CDNs.'
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
      { id: 'all', title: 'General Strings', section: 'System', icon: 'public', count: assetDefinitions.length },
      { id: 'landing', title: 'Landing Page', section: 'Hjemmeside', icon: 'web', count: assetDefinitions.filter(d => d.section === 'Hjemmeside').length },
      { id: 'auth', title: 'Auth Flow', section: 'Innlogging', icon: 'login', count: assetDefinitions.filter(d => d.section === 'Innlogging').length },
      { id: 'student', title: 'Student Portal', section: 'Studentportal', icon: 'school', count: assetDefinitions.filter(d => d.section === 'Studentportal').length },
      { id: 'teacher', title: 'Teacher Portal', section: 'Mentorportal', icon: 'assignment_ind', count: assetDefinitions.filter(d => d.section === 'Mentorportal').length },
      { id: 'onboarding', title: 'Onboarding Flow', section: 'Onboarding', icon: 'rocket_launch', count: assetDefinitions.filter(d => d.section === 'Onboarding').length }
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
          system: 'System'
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
    { id: 1, date: '20. Mai - 10:00', author: 'System (Initialisering)', action: 'Opprettet database tabeller og importerte standard språknøkler' }
  ];

  return (
    <div className="bg-background text-on-background font-body-md text-body-md overflow-hidden h-screen flex relative">
      
      {/* 1. Portal Navigation Sidebar Panel (Left Side - Desktop style) */}
      <aside className={`fixed left-0 top-0 h-full w-[280px] bg-surface-container border-r border-outline-variant flex flex-col py-4 z-50 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Sidebar Header */}
        <div className="px-6 py-8 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <span className="material-symbols-outlined text-white text-2xl">shield</span>
            </div>
            <h1 className="font-headline-sm text-headline-sm font-bold text-primary">Admin Portal</h1>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant">Institutional Access</p>
        </div>

        {/* Navigation Routes */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-hide">
          <button 
            onClick={() => navigate('/teacher/dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 text-on-secondary-container hover:bg-surface-container-high transition-all rounded text-left"
          >
            <span className="material-symbols-outlined text-outline">dashboard</span>
            <span className="font-label-md text-label-md">Dashboard</span>
          </button>
          
          <button 
            onClick={() => navigate('/teacher/course-builder')}
            className="w-full flex items-center gap-3 px-4 py-3 text-on-secondary-container hover:bg-surface-container-high transition-all rounded text-left"
          >
            <span className="material-symbols-outlined text-outline">architecture</span>
            <span className="font-label-md text-label-md">Course Builder</span>
          </button>
          
          <button 
            onClick={() => navigate('/teacher/media-library')}
            className="w-full flex items-center gap-3 px-4 py-3 text-on-secondary-container hover:bg-surface-container-high transition-all rounded text-left"
          >
            <span className="material-symbols-outlined text-outline">video_library</span>
            <span className="font-label-md text-label-md">Media Library</span>
          </button>
          
          <button 
            onClick={() => navigate('/teacher/follow-up')}
            className="w-full flex items-center gap-3 px-4 py-3 text-on-secondary-container hover:bg-surface-container-high transition-all rounded text-left"
          >
            <span className="material-symbols-outlined text-outline">group</span>
            <span className="font-label-md text-label-md">Student Management</span>
          </button>
          
          {/* Active Navigation: CMS Text Management */}
          <button 
            onClick={() => navigate('/admin/cms')}
            className="w-full flex items-center gap-3 px-4 py-3 text-primary dark:text-primary-fixed font-bold bg-surface-bright border-l-4 border-primary translate-x-1 transition-transform duration-200 rounded-r text-left shadow-sm"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>translate</span>
            <span className="font-label-md text-label-md">Text Management</span>
          </button>
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="px-3 border-t border-outline-variant pt-4 pb-4">
          <button 
            onClick={() => navigate('/teacher/profile')}
            className="w-full flex items-center gap-3 px-4 py-3 text-on-secondary-container hover:bg-surface-container-high transition-all rounded text-left"
          >
            <span className="material-symbols-outlined text-outline">settings</span>
            <span className="font-label-md text-label-md">Settings</span>
          </button>
          
          <button 
            onClick={() => navigate('/teacher/notifications')}
            className="w-full flex items-center gap-3 px-4 py-3 text-on-secondary-container hover:bg-surface-container-high transition-all rounded text-left"
          >
            <span className="material-symbols-outlined text-outline">contact_support</span>
            <span className="font-label-md text-label-md">Support</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* 2. Main Workspace Canvas */}
      <main className="flex-1 lg:ml-[280px] h-full flex flex-col relative bg-surface-container-low overflow-hidden">
        
        {/* 2a. TopAppBar Header Component */}
        <header className="h-16 flex justify-between items-center px-8 bg-surface-container-lowest border-b border-outline-variant z-40 sticky top-0 shrink-0 select-none">
          <div className="flex items-center gap-4">
            {/* Hamburger menu for small screens */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-on-surface-variant hover:bg-surface-container rounded-lg"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            <span className="font-headline-md text-headline-md font-bold text-primary">His Kingdom Prophets</span>
            <div className="h-8 w-px bg-outline-variant hidden sm:block"></div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface hidden sm:block">Global Text Management</h2>
          </div>

          {/* Search and Profile Controls */}
          <div className="flex items-center gap-4">
            <div className="relative flex items-center bg-surface-container px-3 py-2 rounded-lg w-96 border border-transparent focus-within:border-primary transition-all">
              <span className="material-symbols-outlined text-outline text-body-md">search</span>
              <input 
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none focus:ring-0 text-body-sm w-full ml-2 text-on-surface placeholder:text-outline/70" 
                placeholder="Search keys or strings..." 
                type="text"
              />
              <span className="text-xs text-outline font-mono-sm select-none">⌘K</span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/teacher/notifications')}
                className="p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full relative"
              >
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
              </button>
              
              <button className="p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full hidden sm:block">
                <span className="material-symbols-outlined">help</span>
              </button>

              <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant shrink-0 ml-2">
                <img 
                  alt={user?.name || "Administrator profile"} 
                  src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuDnJX1ZfjeM1N_YJdkzoYf_gcO0Ky5k2RPUu8-II-cQ9cgz_CV-jDSFGQVU91zQ2kjux7jN3Kc0TvIUN8HPvA1kUIPvkFCM00uHZMTlnjo5QH-b3SMB-iQjp1WUu1-fjTZ0CsudBYVkQvoErcJQqHh76P3zwgpsehqA9fOStb1RLl3JYM0y0rvVuwy9agWBtBUY_ncDWMgyCO8z43jlPoTric8DXL1cVgE6nuqEYLiUZHiuPDI8ad4W8sjyHZ8z4WE9hAdSmEIqCd4"} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Sub-Layout: Categories and Table */}
        <div className="flex-grow flex overflow-hidden">
          
          {/* 2b. Category Selector (Left Rail) */}
          <div className="w-64 bg-surface-container-lowest border-r border-outline-variant flex flex-col p-6 shrink-0 hidden md:flex select-none">
            <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-4">View Categories</h3>
            <ul className="space-y-1 flex-grow overflow-y-auto scrollbar-hide">
              {categories.map(tab => {
                const isActive = selectedCategory === tab.id;
                return (
                  <li key={tab.id}>
                    <button 
                      onClick={() => setSelectedCategory(tab.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${
                        isActive 
                          ? 'bg-primary-fixed text-on-primary-fixed font-bold' 
                          : 'text-on-surface-variant hover:bg-surface-container-low group'
                      }`}
                    >
                      <span className="flex items-center gap-2 font-label-md text-label-md">
                        <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-on-primary-fixed' : 'text-outline group-hover:text-primary transition-colors'}`}>
                          {tab.icon}
                        </span>
                        {tab.title}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-label-md ${
                        isActive ? 'bg-primary text-white' : 'text-outline bg-surface-container'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Export and Import Actions Panel */}
            <div className="mt-10 pt-6 border-t border-outline-variant shrink-0">
              <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-4">Export / Import</h3>
              
              <button 
                onClick={handleExportJSON}
                className="w-full flex items-center gap-2 px-3 py-2 text-primary border border-primary hover:bg-primary-fixed transition-colors rounded-lg mb-2 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span className="font-label-md">Export JSON</span>
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
                className="w-full flex items-center gap-2 px-3 py-2 text-on-surface-variant border border-outline-variant hover:bg-surface-container-low transition-colors rounded-lg active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[18px]">upload</span>
                <span className="font-label-md">Import CSV / JSON</span>
              </button>
            </div>
          </div>

          {/* 2c. Content Area: String Editor */}
          <div className="flex-1 overflow-y-auto p-8 relative scroll-smooth h-full">
            <div className="max-w-6xl mx-auto flex flex-col gap-6">

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
                      <span className="material-symbols-outlined text-amber-600 text-[24px]">warning</span>
                      <div className="text-xs">
                        <span className="font-bold">Ulagrede endringer i utkast!</span>
                        <p className="text-amber-800 mt-0.5">Du har endret {unsavedCount} tekstfelt som ikke er publisert til databasen ennå.</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleDiscardChanges}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <span className="material-symbols-outlined text-[16px]">restart_alt</span> Forkast endringer
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Page Header Controls */}
              <div className="flex justify-between items-end mb-4 select-none">
                <div>
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <span className="material-symbols-outlined">public</span>
                    <span className="font-label-md uppercase tracking-widest">Global Resources</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    {selectedCategory === 'all' ? 'General Strings' : categories.find(c => c.id === selectedCategory)?.title}
                  </h3>
                  <p className="text-on-surface-variant mt-1">
                    Manage common navigation labels, button text, and system messages across all modules.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsHistoryOpen(true)}
                    className="px-6 py-2.5 rounded-full border border-outline text-on-surface font-label-md hover:bg-surface-container-high transition-all flex items-center gap-2 active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[20px]">history</span>
                    View Revision History
                  </button>
                  <button 
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="px-8 py-2.5 rounded-full bg-primary text-on-primary font-bold font-label-md shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-100 transition-all flex items-center gap-2 disabled:opacity-60"
                  >
                    {isPublishing ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Publishing...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">publish</span>
                        Publish Changes
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Toolbar Filters */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 mb-2 flex flex-wrap items-center justify-between gap-6 select-none shadow-sm">
                <div className="flex flex-wrap items-center gap-6">
                  {/* Category selector on mobile only */}
                  <div className="flex items-center gap-3 md:hidden">
                    <span className="font-label-md text-on-surface-variant">Seksjon:</span>
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-surface-container-low border-none rounded-lg text-body-sm focus:ring-primary py-1.5 px-4 pr-10"
                    >
                      <option value="all">General Strings</option>
                      <option value="landing">Landing Page</option>
                      <option value="auth">Auth Flow</option>
                      <option value="student">Student Portal</option>
                      <option value="teacher">Teacher Portal</option>
                      <option value="onboarding">Onboarding Flow</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-label-md text-on-surface-variant">Filter by:</span>
                    <select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-surface-container-low border-none rounded-lg text-body-sm focus:ring-primary py-1.5 px-4 pr-10"
                    >
                      <option>All Statuses</option>
                      <option>Draft</option>
                      <option>Published</option>
                      <option>Missing Translation</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="font-label-md text-on-surface-variant">Sort:</span>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-surface-container-low border-none rounded-lg text-body-sm focus:ring-primary py-1.5 px-4 pr-10"
                    >
                      <option>Newest First</option>
                      <option>Alphabetical (Key)</option>
                      <option>Recently Modified</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant">
                    Showing {totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, totalItems)} of {totalItems} strings
                  </span>
                </div>
              </div>

              {/* String Grid */}
              <div className="space-y-4">
                
                {/* Header for grid columns */}
                <div className="grid grid-cols-12 gap-6 px-6 py-2 text-on-surface-variant font-label-md uppercase tracking-wider select-none border-b border-outline-variant/35">
                  <div className="col-span-3">Key / Identifier</div>
                  <div className="col-span-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">flag</span>
                    Norwegian (NB)
                  </div>
                  <div className="col-span-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">public</span>
                    English (EN)
                  </div>
                  <div className="col-span-1 text-center">Status</div>
                </div>

                {/* Empty State */}
                {paginatedAssets.length === 0 && (
                  <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-2xl p-16 text-center text-outline select-none">
                    <span className="material-symbols-outlined text-[48px] text-outline-variant mb-3">info</span>
                    <p className="font-headline-sm text-headline-sm">Ingen treff</p>
                    <p className="text-body-sm mt-1 text-on-surface-variant">
                      Ingen språknøkler matcher valgte søk eller filterkriterier.
                    </p>
                  </div>
                )}

                {/* String Rows */}
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
                  const noTextareaClass = `w-full bg-surface-container-low border border-transparent rounded-lg text-body-sm focus:ring-1 focus:ring-primary py-2 px-3 resize-none writing-surface ${
                    isMissing && !valNo.trim() 
                      ? 'bg-error-container/20 border-dashed border-error/50 focus:ring-error placeholder:text-error/50' 
                      : (valNo !== baseNo) 
                        ? 'border-2 border-primary/20 bg-surface-container-lowest' 
                        : ''
                  }`;

                  const enTextareaClass = `w-full bg-surface-container-low border border-transparent rounded-lg text-body-sm focus:ring-1 focus:ring-primary py-2 px-3 resize-none writing-surface ${
                    isMissing && !valEn.trim() 
                      ? 'bg-error-container/20 border-dashed border-error/50 focus:ring-error placeholder:text-error/50' 
                      : (valEn !== baseEn) 
                        ? 'border-2 border-primary/20 bg-surface-container-lowest' 
                        : ''
                  }`;

                  const isMenuOpen = activeMenuRow === slug;

                  return (
                    <div 
                      key={slug}
                      className={`group bg-surface-container-lowest border transition-all p-4 rounded-xl flex flex-col gap-4 ${
                        isMissing 
                          ? 'border-dashed border-error/50 hover:border-error' 
                          : 'border-outline-variant hover:border-primary'
                      }`}
                    >
                      <div className="grid grid-cols-12 gap-6 items-start">
                        {/* Key Info Column */}
                        <div className="col-span-3 pt-2 select-none">
                          <code className={`font-mono-sm text-[13px] px-2 py-1 rounded break-all ${
                            isMissing ? 'text-error bg-error-container/30' : 'text-primary bg-primary-fixed/30'
                          }`}>
                            {slug}
                          </code>
                          <p className="text-[11px] text-outline mt-2 leading-tight">
                            {asset.description || 'System strings configuration parameter.'}
                          </p>
                        </div>

                        {/* Norwegian Textarea Column */}
                        <div className="col-span-4 block-form-fix">
                          <textarea 
                            style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                            className={noTextareaClass}
                            value={valNo}
                            onChange={(e) => handleTextChange(slug, e.target.value, 'no')}
                            placeholder={isMissing && !valNo.trim() ? "Missing Norwegian translation..." : ""}
                            rows={asset.type === 'textarea' ? 3 : 2}
                          />
                        </div>

                        {/* English Textarea Column */}
                        <div className="col-span-4 block-form-fix">
                          <textarea 
                            style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                            className={enTextareaClass}
                            value={valEn}
                            onChange={(e) => handleTextChange(slug, e.target.value, 'en')}
                            placeholder={isMissing && !valEn.trim() ? "Missing English translation..." : ""}
                            rows={asset.type === 'textarea' ? 3 : 2}
                          />
                        </div>

                        {/* Status Column */}
                        <div className="col-span-1 flex flex-col items-center gap-2 pt-2 relative">
                          {isMissing ? (
                            <span className="material-symbols-outlined text-error text-[20px]" title="Missing translation">warning</span>
                          ) : (
                            <span 
                              className={`w-2.5 h-2.5 rounded-full cursor-help shadow-sm border border-white ${isDraft ? 'bg-amber-500' : 'bg-green-500'}`} 
                              title={isDraft ? 'Draft - Unsaved' : 'Published'} 
                            />
                          )}
                          
                          {/* Inline Menu Trigger */}
                          <div className="relative">
                            <button 
                              onClick={() => setActiveMenuRow(isMenuOpen ? null : slug)}
                              className="p-1 text-outline hover:text-primary transition-colors hover:bg-surface-container rounded-lg"
                            >
                              <span className="material-symbols-outlined text-[20px]">more_vert</span>
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
                                    className="absolute right-0 mt-2 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl w-48 py-1.5 z-20 select-none text-left"
                                  >
                                    <button 
                                      onClick={() => {
                                        navigator.clipboard.writeText(slug);
                                        setToastMessage({ title: 'Kopiert!', desc: `Nøkkelen "${slug}" ble kopiert til utklippstavlen.` });
                                        setShowToast(true);
                                        setTimeout(() => setShowToast(false), 2000);
                                        setActiveMenuRow(null);
                                      }}
                                      className="w-full text-left px-4 py-2 hover:bg-surface-container-low text-xs font-label-md text-on-surface flex items-center gap-2"
                                    >
                                      <span className="material-symbols-outlined text-[16px] text-outline">content_copy</span> Kopier nøkkelnavn
                                    </button>
                                    <button 
                                      onClick={() => {
                                        handleTextChange(slug, defaultNo, 'no');
                                        handleTextChange(slug, defaultEn, 'en');
                                        setActiveMenuRow(null);
                                      }}
                                      className="w-full text-left px-4 py-2 hover:bg-surface-container-low text-xs font-label-md text-on-surface flex items-center gap-2"
                                    >
                                      <span className="material-symbols-outlined text-[16px] text-amber-500">restart_alt</span> Nullstill til standard
                                    </button>
                                    <button 
                                      onClick={() => {
                                        handleTextChange(slug, '', 'no');
                                        handleTextChange(slug, '', 'en');
                                        setActiveMenuRow(null);
                                      }}
                                      className="w-full text-left px-4 py-2 hover:bg-surface-container-low text-xs font-label-md text-error flex items-center gap-2 border-t border-outline-variant/35 mt-1 pt-1.5"
                                    >
                                      <span className="material-symbols-outlined text-[16px] text-error">delete</span> Tøm feltene
                                    </button>
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-between items-center bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm select-none">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }).map((_, i) => {
                        const page = i + 1;
                        const isCurrent = currentPage === page;
                        return (
                          <button 
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg font-label-md text-xs font-bold transition-all ${
                              isCurrent 
                                ? 'bg-primary text-on-primary shadow-sm shadow-primary/20' 
                                : 'hover:bg-surface-container text-on-surface'
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
                      className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-body-sm text-on-surface-variant">Rows per page:</span>
                    <select 
                      value={rowsPerPage}
                      onChange={(e) => setRowsPerPage(Number(e.target.value))}
                      className="bg-surface-container-low border-none rounded-lg text-body-sm py-1 px-4 focus:ring-primary"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Footer Buffer */}
              <div className="h-24"></div>
            </div>
          </div>
        </div>

        {/* 3. Slide-Over Revision History Drawer Panel */}
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
                className="fixed right-0 top-0 h-full w-[450px] max-w-full bg-surface-container-lowest shadow-2xl z-[110] border-l border-outline-variant flex flex-col p-6 overflow-hidden select-none"
              >
                <div className="flex justify-between items-center pb-4 border-b border-outline-variant shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[24px]">history</span>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-primary">Revisjonshistorikk</h3>
                  </div>
                  <button 
                    onClick={() => setIsHistoryOpen(false)} 
                    className="p-2 hover:bg-surface-container-low rounded-full text-outline hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                {/* History Timeline Content */}
                <div className="flex-grow overflow-y-auto py-6 space-y-6 scrollbar-hide">
                  <p className="text-body-sm text-on-surface-variant leading-relaxed">
                    Nedenfor vises revisjonsloggen for endringer gjort i CMS-systemet. Du kan rulle tilbake eller spore hvem som oppdaterte spesifikke strenger.
                  </p>
                  
                  <div className="relative border-l border-outline-variant/65 ml-3 pl-6 space-y-8 mt-4">
                    {mockRevisions.map((rev, index) => (
                      <div key={rev.id} className="relative">
                        {/* Timeline dot styling */}
                        <span className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow flex items-center justify-center ${index === 0 ? 'bg-primary ring-4 ring-primary/20' : 'bg-outline-variant'}`} />
                        
                        <span className="text-[10px] text-outline font-bold block">{rev.date}</span>
                        <span className="text-xs font-bold text-primary mt-1 block">{rev.author}</span>
                        <p className="text-[11px] text-on-surface-variant mt-1.5 leading-normal bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/30 font-medium">
                          {rev.action}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Revision Reversion Action Button */}
                <div className="pt-4 border-t border-outline-variant shrink-0">
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
                    className="w-full py-3 bg-primary-container hover:bg-primary text-white text-xs font-bold rounded-xl shadow active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">refresh</span> Gjenopprett forrige revisjon (#3)
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 4. Elegant Custom Floating System Toast Notification (Bottom-Right) */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-8 right-8 z-[200] flex items-center gap-4 bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded-xl shadow-2xl border border-outline/10 max-w-md cursor-pointer select-none"
              onClick={() => setShowToast(false)}
            >
              <span className="material-symbols-outlined text-green-400 text-[24px]">check_circle</span>
              <div className="flex flex-col">
                <span className="font-bold font-label-md text-white leading-tight">{toastMessage.title}</span>
                <span className="text-xs opacity-80 mt-1 leading-normal">{toastMessage.desc}</span>
              </div>
              <button 
                className="ml-4 text-slate-400 hover:text-white transition-opacity shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowToast(false);
                }}
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating HKM Chat Widget */}
        <HkmChatWidget />
      </main>
    </div>
  );
}
