import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, BookOpen, Plus, PlusCircle, CheckCircle2, 
  Settings, Layers, Trash2, Eye, GripVertical, AlertCircle,
  Video as ImagePlay, PlayCircle, FileText, Image as ImageIcon, Music,
  X, Link, Search, ChevronDown, ChevronRight, ChevronUp, 
  Sparkles, Lock, Unlock, MoreVertical, Check
} from 'lucide-react';

const MEDIA_ASSETS = [
  { id: 'a1', name: 'Undervisning_Guds_Rost_PROP101.mp4', type: 'video', size: '42 MB', thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=200' },
  { id: 'a2', name: 'Studieguide_Profetisk_Karakter.pdf', type: 'pdf', size: '1.2 MB', thumbnail: null },
  { id: 'a3', name: 'Tabernakel_Skisse_Bibelstudier.jpg', type: 'image', size: '8.4 MB', thumbnail: 'https://images.unsplash.com/photo-1544856890-7fdb96f30a99?auto=format&fit=crop&q=80&w=200' },
  { id: 'a4', name: 'Lovsang_og_Inspirasjon_Samling.mp3', type: 'audio', size: '18 MB', thumbnail: null },
  { id: 'a5', name: 'Johannes_Apenbaring_Eskatologi_Tegning.pdf', type: 'pdf', size: '4.1 MB', thumbnail: null },
  { id: 'a6', name: 'Apostolisk_Fellesskap_Seminar.mp4', type: 'video', size: '120 MB', thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=200' },
];

const PROGRESSION_RULES = [
  { id: 'sequential', name: 'Sekvensiell (modul for modul)', desc: 'Elever må fullføre én modul før de låser opp neste.' },
  { id: 'free', name: 'Fri rekkefølge', desc: 'Elever kan velge moduler fritt i valgfri rekkefølge.' },
  { id: 'date', name: 'Dato-basert publisering', desc: 'Moduler frigis automatisk på fastsatte datoer.' },
  { id: 'gated', name: 'Oppgave-avlåst', desc: 'Neste modul låses opp etter godkjent innlevering.' },
];

function getFileIcon(type, size = 16) {
  switch (type) {
    case 'video': return <PlayCircle size={size} className="text-[#1B4965]" />;
    case 'pdf': return <FileText size={size} className="text-red-500" />;
    case 'image': return <ImageIcon size={size} className="text-emerald-600" />;
    case 'audio': return <Music size={size} className="text-amber-600" />;
    default: return <FileText size={size} className="text-outline" />;
  }
}

export default function CourseBuilder() {
  const navigate = useNavigate();
  const { courses, addCourseModule, showToast } = useApp();
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || 'prop101');
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [selectedProgressionRule, setSelectedProgressionRule] = useState('sequential');
  const [isProgressionOpen, setIsProgressionOpen] = useState(false);

  // Media drawer state
  const [isMediaDrawerOpen, setIsMediaDrawerOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [mediaSearch, setMediaSearch] = useState('');
  const [mediaFilter, setMediaFilter] = useState('all');
  const [linkedAssets, setLinkedAssets] = useState({}); // { moduleId: [assetIds] }
  const [pendingAssetIds, setPendingAssetIds] = useState([]);

  // Collapsible modules
  const [expandedModuleId, setExpandedModuleId] = useState(null);

  const activeCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  const handleAddModule = (e) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) {
      showToast("Vennligst oppgi en modultittel.");
      return;
    }
    addCourseModule(selectedCourseId, newModuleTitle);
    setNewModuleTitle('');
  };

  // Open the media drawer for a specific module
  const openMediaDrawer = (moduleId) => {
    setActiveModuleId(moduleId);
    setPendingAssetIds([...(linkedAssets[moduleId] || [])]);
    setIsMediaDrawerOpen(true);
  };

  const closeMediaDrawer = () => {
    setIsMediaDrawerOpen(false);
    setMediaSearch('');
    setMediaFilter('all');
    setTimeout(() => setActiveModuleId(null), 350);
  };

  const togglePendingAsset = (assetId) => {
    setPendingAssetIds(prev =>
      prev.includes(assetId) ? prev.filter(id => id !== assetId) : [...prev, assetId]
    );
  };

  const confirmMediaLink = () => {
    if (!activeModuleId) return;
    setLinkedAssets(prev => ({
      ...prev,
      [activeModuleId]: pendingAssetIds
    }));
    showToast(`${pendingAssetIds.length} ressurser koblet til modulen!`);
    closeMediaDrawer();
  };

  const filteredMediaAssets = MEDIA_ASSETS.filter(asset => {
    const matchSearch = asset.name.toLowerCase().includes(mediaSearch.toLowerCase());
    const matchFilter = mediaFilter === 'all' || asset.type === mediaFilter;
    return matchSearch && matchFilter;
  });

  const activeProgression = PROGRESSION_RULES.find(r => r.id === selectedProgressionRule);

  return (
    <>
      <div className="w-full px-4 sm:px-6 md:px-10 py-6 md:py-10 flex flex-col gap-6 md:gap-8 font-sans overflow-x-hidden">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-outline">
          <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/teacher/dashboard')}>Dashboard</span>
          <ChevronRight size={12} />
          <span className="text-primary font-bold">Kursbygger</span>
        </div>

        {/* Grid Layout */}
        <div className="flex flex-col xl:flex-row gap-6 md:gap-8">
          
          {/* Left Column: Course Selector + Progression Settings */}
          <div className="w-full xl:w-[340px] flex flex-col gap-5 shrink-0">
            
            {/* Course Selector Card */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
              <h2 className="font-serif text-xl font-bold text-primary mb-1.5 flex items-center gap-2">
                <Layers size={20} className="text-[#c5a059] shrink-0" />
                Velg Studie
              </h2>
              <p className="text-xs text-on-surface-variant mb-5 font-medium leading-relaxed">
                Velg studielinjen du vil redigere læringsstruktur for.
              </p>

              <div className="space-y-3">
                {courses.map(course => {
                  const isActive = course.id === selectedCourseId;
                  return (
                    <button
                      key={course.id}
                      onClick={() => setSelectedCourseId(course.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 active:scale-[0.99] group ${
                        isActive 
                          ? 'bg-primary border-primary text-white shadow-sm' 
                          : 'bg-white border-outline-variant/30 hover:border-primary/40 hover:bg-slate-50 text-on-surface-variant'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-mono ${
                          isActive ? 'bg-white/20 text-white' : 'bg-surface-container text-primary'
                        }`}>
                          {course.code}
                        </span>
                        <span className={`text-[10px] font-semibold ${isActive ? 'text-white/80' : 'text-outline'}`}>
                          {course.totalModules} moduler
                        </span>
                      </div>
                      <h3 className={`font-serif text-sm font-bold leading-tight ${isActive ? 'text-white' : 'text-primary'}`}>
                        {course.title}
                      </h3>
                      <p className={`text-[10px] mt-1.5 font-medium ${isActive ? 'text-white/70' : 'text-outline'}`}>
                        {course.instructor}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Progression Rule Selector */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-primary mb-1.5 flex items-center gap-2">
                <Lock size={16} className="text-[#c5a059] shrink-0" />
                Progresjonsregler
              </h2>
              <p className="text-xs text-on-surface-variant mb-4 font-medium">
                Styr tilgang og rekkefølge på moduler for elever.
              </p>

              <div className="space-y-2">
                {PROGRESSION_RULES.map(rule => (
                  <button
                    key={rule.id}
                    onClick={() => { setSelectedProgressionRule(rule.id); showToast(`Progresjonsregel satt til: "${rule.name}"`); }}
                    className={`w-full text-left p-3.5 rounded-lg border-2 transition-all flex items-start gap-3 ${
                      selectedProgressionRule === rule.id
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-outline-variant/20 hover:border-outline-variant/40 text-on-surface-variant hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                      selectedProgressionRule === rule.id ? 'border-primary bg-primary' : 'border-outline-variant/50'
                    }`}>
                      {selectedProgressionRule === rule.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-snug">{rule.name}</p>
                      <p className="text-[10px] font-medium text-on-surface-variant mt-0.5 leading-relaxed">{rule.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Module Editor */}
          <div className="w-full flex flex-col gap-5 min-w-0">
            {activeCourse ? (
              <motion.div
                key={activeCourse.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden"
              >
                {/* Course Header */}
                <div className="p-6 sm:p-8 border-b border-outline-variant/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-white to-primary/[0.02]">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 bg-primary text-white rounded-full font-mono">
                      Studieplan & Moduler
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary mt-3 leading-tight">
                      {activeCourse.title}
                    </h2>
                    <p className="text-xs text-on-surface-variant mt-1.5 font-semibold">
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-primary">{activeCourse.code}</span>
                      {' '}• Ansvarlig: <span className="text-primary">{activeCourse.instructor}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => navigate('/student/library')}
                    className="py-2.5 px-5 rounded-lg border border-outline-variant hover:border-primary text-xs font-bold uppercase flex items-center gap-2 hover:text-primary transition-all active:scale-95 shrink-0 shadow-sm"
                  >
                    <Eye size={14} />
                    Studentvisning
                  </button>
                </div>

                {/* Modules List */}
                <div className="p-6 sm:p-8 flex flex-col gap-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-serif text-lg font-bold text-primary">Modulrekkefølge</h3>
                    <span className="text-[10px] font-bold text-outline uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-full">
                      {activeCourse.modules.length} moduler totalt
                    </span>
                  </div>

                  <AnimatePresence mode="popLayout">
                    {activeCourse.modules.map((mod, index) => {
                      const isExpanded = expandedModuleId === mod.id;
                      const moduleLinkedAssets = linkedAssets[mod.id] || [];

                      return (
                        <motion.div
                          key={mod.id}
                          layout
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className={`rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                            isExpanded 
                              ? 'border-primary/30 shadow-md' 
                              : 'border-outline-variant/20 hover:border-outline-variant/40'
                          }`}
                        >
                          {/* Module Row Header */}
                          <button
                            className="w-full flex items-center gap-3 p-4 text-left bg-slate-50/60 hover:bg-slate-100/60 transition-colors"
                            onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                          >
                            <div className="text-outline cursor-grab shrink-0 touch-none">
                              <GripVertical size={16} />
                            </div>

                            <div className="w-7 h-7 rounded-lg bg-primary/5 text-primary font-bold text-xs flex items-center justify-center border border-primary/10 shrink-0 font-mono">
                              {index + 1}
                            </div>

                            <div className="flex-grow min-w-0">
                              <h4 className="text-xs sm:text-sm font-semibold text-primary leading-tight truncate">
                                {mod.title}
                              </h4>
                              {moduleLinkedAssets.length > 0 && (
                                <p className="text-[10px] font-bold text-[#c5a059] mt-0.5">
                                  {moduleLinkedAssets.length} ressurs{moduleLinkedAssets.length !== 1 ? 'er' : ''} koblet
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                mod.completed 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : 'bg-slate-200 text-slate-500'
                              }`}>
                                {mod.completed ? 'Publisert' : 'Utkast'}
                              </span>
                              {isExpanded ? (
                                <ChevronUp size={14} className="text-outline" />
                              ) : (
                                <ChevronDown size={14} className="text-outline" />
                              )}
                            </div>
                          </button>

                          {/* Expanded Module Actions Panel */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                className="overflow-hidden"
                              >
                                <div className="border-t border-outline-variant/20 p-4 sm:p-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white">
                                  {/* Linked assets badge */}
                                  {moduleLinkedAssets.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {moduleLinkedAssets.map(assetId => {
                                        const asset = MEDIA_ASSETS.find(a => a.id === assetId);
                                        if (!asset) return null;
                                        return (
                                          <span key={assetId} className="flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/5 border border-primary/20 px-2.5 py-1 rounded-full">
                                            {getFileIcon(asset.type, 12)}
                                            <span className="max-w-[140px] truncate">{asset.name}</span>
                                          </span>
                                        );
                                      })}
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2.5 sm:ml-auto shrink-0 flex-wrap">
                                    <button
                                      onClick={() => openMediaDrawer(mod.id)}
                                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold uppercase rounded-lg hover:bg-primary/90 shadow-sm transition-all active:scale-95"
                                    >
                                      <ImagePlay size={14} />
                                      Koble Ressurser
                                    </button>
                                    <button className="p-2 hover:bg-red-50 rounded-lg text-outline hover:text-red-500 transition-colors">
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Add New Module Form */}
                <form onSubmit={handleAddModule} className="border-t border-outline-variant/20 px-6 sm:px-8 py-6 flex flex-col gap-4">
                  <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                    <PlusCircle size={18} className="text-[#c5a059] shrink-0" />
                    Legg til ny undervisningsmodul
                  </h3>

                  <div className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-grow space-y-1.5 w-full">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-outline block">Modulens Tittel</label>
                      <input
                        type="text"
                        value={newModuleTitle}
                        onChange={(e) => setNewModuleTitle(e.target.value)}
                        placeholder="Eks: Modul 9: Profetisk modning og prøving..."
                        className="w-full p-3.5 border-2 border-outline-variant/30 rounded-lg font-sans text-xs focus:outline-none focus:border-primary shadow-sm transition-all focus:ring-1 focus:ring-primary/30 font-medium"
                        style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-primary text-white font-bold py-3.5 px-6 rounded-lg hover:bg-primary/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 w-full sm:w-auto shadow-md whitespace-nowrap shrink-0"
                    >
                      <Plus size={16} />
                      Legg til
                    </button>
                  </div>

                  <div className="bg-slate-50 border border-outline-variant/20 p-4 rounded-xl flex gap-3 items-start">
                    <AlertCircle size={15} className="text-secondary mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-on-surface-variant leading-relaxed font-semibold">
                      <strong>CMS Sanntidsoppdatering:</strong> Ny modul integreres umiddelbart i studieplanen og er synlig for studenter i sanntid.
                    </p>
                  </div>
                </form>
              </motion.div>
            ) : (
              <div className="bg-white border border-outline-variant/30 rounded-xl p-16 text-center text-outline shadow-sm font-medium">
                Velg et studie fra venstre kolonne for å bygge læreplanen.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== MEDIA SELECTOR DRAWER (SLIDE-IN FROM RIGHT) ===== */}
      <AnimatePresence>
        {isMediaDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110]"
              onClick={closeMediaDrawer}
            />

            {/* Drawer Panel */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[120] flex flex-col"
              style={{
                transform: 'translateZ(0) !important',
                backfaceVisibility: 'hidden !important'
              }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-5 border-b border-outline-variant/20 bg-gradient-to-r from-[#1B4965] to-[#1B4965]/90 text-white shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <ImagePlay size={18} className="text-[#c5a059]" />
                    <h3 className="font-serif text-lg font-bold">Koble Medieressurser</h3>
                  </div>
                  <p className="text-[11px] text-white/70 font-medium mt-0.5">
                    Velg filer fra mediebiblioteket å knytte til modulen
                  </p>
                </div>
                <button
                  onClick={closeMediaDrawer}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-90 shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search & Filter */}
              <div className="p-4 border-b border-outline-variant/10 space-y-3 bg-slate-50 shrink-0">
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-outline">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    value={mediaSearch}
                    onChange={(e) => setMediaSearch(e.target.value)}
                    placeholder="Søk i mediebiblioteket..."
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-outline-variant/30 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary shadow-sm"
                    style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                  />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {['all', 'video', 'pdf', 'image', 'audio'].map(f => (
                    <button
                      key={f}
                      onClick={() => setMediaFilter(f)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all border ${
                        mediaFilter === f
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-outline border-outline-variant/30 hover:border-primary/40'
                      }`}
                    >
                      {f === 'all' ? 'Alle' : f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Media Assets List */}
              <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/10 p-2">
                {filteredMediaAssets.length > 0 ? (
                  filteredMediaAssets.map(asset => {
                    const isSelected = pendingAssetIds.includes(asset.id);
                    return (
                      <motion.button
                        key={asset.id}
                        layout
                        onClick={() => togglePendingAsset(asset.id)}
                        whileHover={{ backgroundColor: 'rgba(27,73,101,0.04)' }}
                        className={`w-full text-left flex items-center gap-4 p-3.5 rounded-xl transition-all group ${
                          isSelected ? 'ring-2 ring-inset ring-primary bg-primary/[0.04]' : 'hover:bg-slate-50'
                        }`}
                      >
                        {/* Thumbnail / Icon */}
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center border border-outline-variant/20">
                          {asset.thumbnail ? (
                            <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" />
                          ) : (
                            getFileIcon(asset.type, 20)
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-grow min-w-0 text-left">
                          <h4 className="text-xs font-bold text-primary truncate leading-snug">
                            {asset.name}
                          </h4>
                          <p className="text-[10px] text-outline font-semibold uppercase tracking-wide mt-0.5">
                            {asset.type} · {asset.size}
                          </p>
                        </div>

                        {/* Check indicator */}
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'border-primary bg-primary'
                            : 'border-outline-variant/40 group-hover:border-primary/40'
                        }`}>
                          {isSelected && <Check size={12} className="text-white" />}
                        </div>
                      </motion.button>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-outline gap-2">
                    <Search size={24} className="text-outline-variant" />
                    <p className="text-xs font-semibold text-on-surface-variant">Ingen filer matcher søket.</p>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="border-t border-outline-variant/20 p-5 bg-white shrink-0">
                {pendingAssetIds.length > 0 && (
                  <div className="flex items-center gap-2 mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <Sparkles size={14} className="text-[#c5a059] shrink-0" />
                    <p className="text-xs font-bold text-primary">
                      {pendingAssetIds.length} ressurs{pendingAssetIds.length !== 1 ? 'er' : ''} valgt for kobling
                    </p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={closeMediaDrawer}
                    className="flex-1 py-3 rounded-xl border-2 border-outline-variant/30 hover:border-outline-variant text-xs font-bold uppercase text-on-surface-variant transition-all active:scale-95"
                  >
                    Avbryt
                  </button>
                  <button
                    onClick={confirmMediaLink}
                    disabled={pendingAssetIds.length === 0}
                    className="flex-1 py-3 rounded-xl bg-primary text-white text-xs font-bold uppercase shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 flex items-center justify-center gap-2"
                  >
                    <Link size={14} />
                    Bekreft Kobling
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
