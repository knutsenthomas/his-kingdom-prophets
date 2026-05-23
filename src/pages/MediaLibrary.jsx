import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, FolderPlus, Upload, Grid, List, ChevronRight, 
  FolderOpen, Folder, PlayCircle, FileText, Image as ImageIcon, 
  Music, MoreVertical, Trash2, Link, Download, CheckSquare, 
  Square, X, Plus, AlertCircle, Sparkles, Filter, CheckCircle2
} from 'lucide-react';

const INITIAL_FOLDERS = [
  { id: 'f1', name: 'Module 1: Profetisk Tjeneste', count: 4 },
  { id: 'f2', name: 'Studieveiledning & Pensum', count: 2 },
  { id: 'f3', name: 'Tjenestegrupper & Illustrasjoner', count: 3 }
];

const INITIAL_FILES = [
  { 
    id: 'm1', 
    name: 'Undervisning_Guds_Rost_PROP101.mp4', 
    type: 'video', 
    size: '42 MB', 
    date: '12. okt 2026', 
    folderId: 'f1',
    thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: 'm2', 
    name: 'Studieguide_Profetisk_Karakter.pdf', 
    type: 'pdf', 
    size: '1.2 MB', 
    date: '30. sep 2026', 
    folderId: 'f2',
    thumbnail: null 
  },
  { 
    id: 'm3', 
    name: 'Tabernakel_Skisse_Bibelstudier.jpg', 
    type: 'image', 
    size: '8.4 MB', 
    date: '10. okt 2026', 
    folderId: 'f3',
    thumbnail: 'https://images.unsplash.com/photo-1544856890-7fdb96f30a99?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: 'm4', 
    name: 'Lovsang_og_Inspirasjon_Samling.mp3', 
    type: 'audio', 
    size: '18 MB', 
    date: '02. nov 2026', 
    folderId: 'f1',
    thumbnail: null 
  },
  { 
    id: 'm5', 
    name: 'Johannes_Apenbaring_Eskatologi_Tegning.pdf', 
    type: 'pdf', 
    size: '4.1 MB', 
    date: '15. nov 2026', 
    folderId: 'f3',
    thumbnail: null 
  },
  { 
    id: 'm6', 
    name: 'Apostolisk_Fellesskap_Seminar.mp4', 
    type: 'video', 
    size: '120 MB', 
    date: '01. des 2026', 
    folderId: 'f1',
    thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400' 
  }
];

export default function MediaLibrary() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  
  const [folders, setFolders] = useState(INITIAL_FOLDERS);
  const [files, setFiles] = useState(INITIAL_FILES);
  const [selectedFolderId, setSelectedFolderId] = useState('All');
  
  // UI States
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, video, pdf, image, audio
  
  // Modals & Popovers
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isUploadDropdownOpen, setIsUploadDropdownOpen] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState([]);
  
  // Simulated File Upload
  const handleSimulatedUpload = (type) => {
    setIsUploadDropdownOpen(false);
    
    let simulatedFile = {};
    const timestamp = Date.now();
    const dateStr = new Date().toLocaleDateString('no-NO', { day: '2-digit', month: 'short', year: 'numeric' });
    
    if (type === 'computer') {
      simulatedFile = {
        id: `upload-${timestamp}`,
        name: `Lokal_Bibelstudie_Opptak_${timestamp.toString().slice(-4)}.mp4`,
        type: 'video',
        size: '28.5 MB',
        date: dateStr,
        folderId: selectedFolderId === 'All' ? 'f1' : selectedFolderId,
        thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400'
      };
    } else if (type === 'url') {
      simulatedFile = {
        id: `upload-${timestamp}`,
        name: `YouTube_Ekstern_Lovsang_Illustrasjon.mp4`,
        type: 'video',
        size: 'Link',
        date: dateStr,
        folderId: selectedFolderId === 'All' ? 'f3' : selectedFolderId,
        thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&q=80&w=400'
      };
    } else {
      simulatedFile = {
        id: `upload-${timestamp}`,
        name: `Tilleggsressurs_Kommentar_${timestamp.toString().slice(-4)}.pdf`,
        type: 'pdf',
        size: '520 KB',
        date: dateStr,
        folderId: selectedFolderId === 'All' ? 'f2' : selectedFolderId,
        thumbnail: null
      };
    }
    
    setFiles(prev => [simulatedFile, ...prev]);
    showToast(`Filen "${simulatedFile.name}" ble lastet opp til mediebiblioteket!`);
  };

  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      showToast("Vennligst oppgi et mappenavn");
      return;
    }
    
    const newFolder = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      count: 0
    };
    
    setFolders(prev => [...prev, newFolder]);
    setNewFolderName('');
    setIsCreateFolderOpen(false);
    showToast(`Mappen "${newFolder.name}" ble opprettet!`);
  };

  // Bulk Actions
  const handleSelectFile = (fileId) => {
    setSelectedFileIds(prev => 
      prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    const currentFilteredFiles = filteredFiles.map(f => f.id);
    const allSelected = currentFilteredFiles.every(id => selectedFileIds.includes(id));
    
    if (allSelected) {
      // Unselect all of the current view
      setSelectedFileIds(prev => prev.filter(id => !currentFilteredFiles.includes(id)));
    } else {
      // Select all of the current view
      setSelectedFileIds(prev => [...new Set([...prev, ...currentFilteredFiles])]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedFileIds.length === 0) return;
    setFiles(prev => prev.filter(f => !selectedFileIds.includes(f.id)));
    showToast(`${selectedFileIds.length} filer ble slettet permanent.`);
    setSelectedFileIds([]);
  };

  const handleCopyLinks = () => {
    showToast(`Kopierte ${selectedFileIds.length} direktelenker til utklippstavlen!`);
    setSelectedFileIds([]);
  };

  // Filtering Logic
  const filteredFiles = files.filter(file => {
    // Search query filter
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Folder filter
    const matchesFolder = selectedFolderId === 'All' || file.folderId === selectedFolderId;
    
    // Type filter
    const matchesType = activeFilter === 'all' || file.type === activeFilter;
    
    return matchesSearch && matchesFolder && matchesType;
  });

  const getFileIcon = (type) => {
    switch (type) {
      case 'video': return <PlayCircle size={20} className="text-[#561291]" />;
      case 'pdf': return <FileText size={20} className="text-red-500" />;
      case 'image': return <ImageIcon size={20} className="text-emerald-600" />;
      case 'audio': return <Music size={20} className="text-amber-600" />;
      default: return <FileText size={20} className="text-outline" />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 font-sans text-on-surface p-4 sm:p-6 md:p-10 flex flex-col gap-6 md:gap-8 relative select-none">
      
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-outline mb-1.5">
            <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/teacher/dashboard')}>Mentor Dashboard</span>
            <ChevronRight size={12} className="text-outline-variant" />
            <span className="text-primary font-bold">Mediebibliotek</span>
          </nav>
          <h1 className="font-serif text-3xl font-bold text-primary">Mediebibliotek</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-1">
            Administrer og organiser institusjonens medie-ressurser for bibelundervisning og studieplaner.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 relative">
          <button 
            onClick={() => setIsCreateFolderOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-outline-variant hover:border-primary text-xs font-bold uppercase rounded-lg shadow-sm hover:text-primary transition-all active:scale-95 shrink-0 flex-grow sm:flex-grow-0"
          >
            <FolderPlus size={16} className="text-[#c5a059]" />
            Opprett Mappe
          </button>
          
          <div className="relative flex-grow sm:flex-grow-0">
            <button 
              onClick={() => setIsUploadDropdownOpen(!isUploadDropdownOpen)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase rounded-lg hover:bg-primary/95 shadow-md transition-all active:scale-95 w-full whitespace-nowrap"
            >
              <Upload size={16} />
              Last Opp Ressurs
            </button>

            {/* Dropdown Options */}
            <AnimatePresence>
              {isUploadDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsUploadDropdownOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-white border border-outline-variant/30 rounded-xl shadow-xl z-50 p-1.5 origin-top-right overflow-hidden"
                  >
                    <button 
                      onClick={() => handleSimulatedUpload('computer')}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 rounded-lg flex items-center gap-3 text-xs font-bold text-on-surface transition-colors"
                    >
                      <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-primary"><Upload size={14} /></span>
                      Fra datamaskin
                    </button>
                    <button 
                      onClick={() => handleSimulatedUpload('url')}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 rounded-lg flex items-center gap-3 text-xs font-bold text-on-surface transition-colors"
                    >
                      <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-primary"><Link size={14} /></span>
                      Ekstern YouTube URL
                    </button>
                    <button 
                      onClick={() => handleSimulatedUpload('document')}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 rounded-lg flex items-center gap-3 text-xs font-bold text-on-surface transition-colors"
                    >
                      <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-primary"><FileText size={14} /></span>
                      Tilleggsdokument
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Folder Tree Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-outline mb-4">Bibliotekmapper</h3>
            
            <div className="space-y-1.5">
              <button 
                onClick={() => setSelectedFolderId('All')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  selectedFolderId === 'All' 
                    ? 'bg-primary/5 text-primary' 
                    : 'text-on-surface-variant hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FolderOpen size={16} className={selectedFolderId === 'All' ? 'text-primary' : 'text-outline'} />
                  <span>Alle filer</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 font-mono text-outline-variant">{files.length}</span>
              </button>

              {folders.map(f => {
                const isActive = selectedFolderId === f.id;
                const folderFileCount = files.filter(file => file.folderId === f.id).length;
                return (
                  <button 
                    key={f.id}
                    onClick={() => setSelectedFolderId(f.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-primary/5 text-primary' 
                        : 'text-on-surface-variant hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Folder size={16} className={isActive ? 'text-primary' : 'text-outline'} />
                      <span className="truncate pr-1">{f.name}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 font-mono text-outline-variant">{folderFileCount}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Bento Files Display & Toolbar */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          
          {/* Controls toolbar */}
          <div className="bg-white border border-outline-variant/30 p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-3 flex items-center text-outline">
                <Search size={16} />
              </span>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Søk i filer og dokumenter..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-outline-variant/20 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary shadow-inner"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-3 flex items-center text-outline hover:text-primary"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Type Filters */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto py-1">
              {[
                { id: 'all', name: 'Alle filer', icon: Filter },
                { id: 'video', name: 'Videoer', icon: PlayCircle },
                { id: 'pdf', name: 'Dokumenter', icon: FileText },
                { id: 'image', name: 'Illustrasjoner', icon: ImageIcon }
              ].map(f => {
                const isActive = activeFilter === f.id;
                const Icon = f.icon;
                return (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 shadow-sm border ${
                      isActive 
                        ? 'bg-primary text-white border-primary' 
                        : 'bg-white text-on-surface-variant border-outline-variant/20 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={12} />
                    <span>{f.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Toggle view mode */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 shrink-0 self-end md:self-auto">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-outline hover:text-primary'}`}
                title="Rutenett"
              >
                <Grid size={16} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-outline hover:text-primary'}`}
                title="Listevisning"
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Select all & Breadcrumb metadata */}
          <div className="flex justify-between items-center bg-white border border-outline-variant/20 px-4 py-3 rounded-lg shadow-sm">
            <button 
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-xs font-bold text-primary active:scale-[0.98] transition-all"
            >
              {filteredFiles.length > 0 && filteredFiles.every(f => selectedFileIds.includes(f.id)) ? (
                <CheckSquare size={16} className="text-primary" />
              ) : (
                <Square size={16} className="text-outline" />
              )}
              <span className="uppercase tracking-wider">Velg alle i gjeldende visning ({filteredFiles.length})</span>
            </button>

            <span className="text-[10px] font-bold text-outline-variant tracking-wider uppercase font-mono">
              {selectedFolderId === 'All' ? 'Alle Mapper' : folders.find(f => f.id === selectedFolderId)?.name}
            </span>
          </div>

          {/* Files Container */}
          {filteredFiles.length > 0 ? (
            viewMode === 'grid' ? (
              // Grid View
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {filteredFiles.map(file => {
                  const isChecked = selectedFileIds.includes(file.id);
                  return (
                    <motion.div
                      layout
                      key={file.id}
                      onClick={() => handleSelectFile(file.id)}
                      className={`group bg-white rounded-xl border overflow-hidden hover:shadow-md transition-all cursor-pointer relative ${
                        isChecked 
                          ? 'border-primary ring-2 ring-primary bg-primary/[0.01]' 
                          : 'border-outline-variant/30 hover:border-primary/45'
                      }`}
                    >
                      {/* Checkbox badge top-left */}
                      <div className="absolute top-2.5 left-2.5 z-10">
                        {isChecked ? (
                          <div className="bg-primary text-white p-0.5 rounded shadow-sm">
                            <CheckSquare size={16} />
                          </div>
                        ) : (
                          <div className="bg-white/80 backdrop-blur-sm text-outline p-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity border border-outline-variant/30">
                            <Square size={16} />
                          </div>
                        )}
                      </div>

                      {/* Thumbnail frame */}
                      <div className="h-36 bg-slate-100 relative flex items-center justify-center overflow-hidden border-b border-slate-100">
                        {file.thumbnail ? (
                          <img 
                            src={file.thumbnail} 
                            alt={file.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
                            {getFileIcon(file.type)}
                          </div>
                        )}
                        
                        {/* Hover overlay indicator */}
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* File Details */}
                      <div className="p-4 flex flex-col gap-1 text-left">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-primary truncate leading-snug w-full" title={file.name}>
                            {file.name}
                          </h4>
                          <span className="shrink-0">{getFileIcon(file.type)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-50 text-[10px] font-semibold text-outline-variant font-mono">
                          <span>{file.size}</span>
                          <span>{file.date}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              // List View
              <div className="bg-white border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden divide-y divide-slate-100">
                {filteredFiles.map(file => {
                  const isChecked = selectedFileIds.includes(file.id);
                  return (
                    <div 
                      key={file.id}
                      onClick={() => handleSelectFile(file.id)}
                      className={`flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50/50 transition-colors ${
                        isChecked ? 'bg-primary/[0.02]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <button className="text-primary shrink-0">
                          {isChecked ? (
                            <CheckSquare size={18} className="text-primary" />
                          ) : (
                            <Square size={18} className="text-outline-variant" />
                          )}
                        </button>

                        <div className="w-8 h-8 rounded bg-primary/5 flex items-center justify-center text-primary shrink-0">
                          {getFileIcon(file.type)}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-primary truncate" title={file.name}>
                            {file.name}
                          </h4>
                          <p className="text-[10px] text-outline font-semibold uppercase tracking-wider mt-0.5">
                            {file.type}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-[10px] font-mono font-semibold text-outline-variant shrink-0">
                        <span className="hidden sm:inline w-20 text-right">{file.size}</span>
                        <span className="w-24 text-right">{file.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="bg-white border border-outline-variant/30 rounded-xl p-16 text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-outline mb-4">
                <Search size={24} />
              </div>
              <h3 className="font-serif text-lg font-bold text-primary mb-1">Ingen mediefiler funnet</h3>
              <p className="text-xs text-on-surface-variant font-semibold max-w-sm mx-auto leading-relaxed">
                Vi fant ingen filer som matchet filtrene eller søkekriteriene dine. Prøv å justere søket eller last opp nye filer.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bulk actions sliding bottom bar */}
      <AnimatePresence>
        {selectedFileIds.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-primary border-b-4 border-[#c5a059] px-6 py-4 rounded-xl shadow-2xl flex flex-col sm:flex-row items-center gap-4 justify-between w-[90%] max-w-xl text-white origin-bottom"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#c5a059] shrink-0" />
              <p className="text-xs font-bold">
                Markerte filer: <span className="font-mono text-sm bg-white/10 px-2 py-0.5 rounded">{selectedFileIds.length}</span>
              </p>
            </div>

            <div className="flex items-center gap-3.5">
              <button 
                onClick={handleCopyLinks}
                className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <Link size={12} />
                <span>Kopier Lenker</span>
              </button>
              
              <button 
                onClick={handleDeleteSelected}
                className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-red-600/90 hover:bg-red-600 px-3 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 size={12} />
                <span>Slett</span>
              </button>

              <button 
                onClick={() => setSelectedFileIds([])}
                className="text-white/60 hover:text-white shrink-0 p-1"
                title="Lukk panel"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE FOLDER MODAL */}
      <AnimatePresence>
        {isCreateFolderOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setIsCreateFolderOpen(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white border border-outline-variant/30 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md z-10 flex flex-col gap-5 text-left relative overflow-hidden"
              style={{
                transform: 'translateZ(0) !important',
                backfaceVisibility: 'hidden !important'
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-xl font-bold text-primary">Opprett ny bibliotekmappe</h3>
                  <p className="text-[11px] text-on-surface-variant font-medium mt-1">
                    Hold orden i studieplan-illustrasjoner og videoarkiver ved å gruppere dem i mapper.
                  </p>
                </div>
                <button 
                  onClick={() => setIsCreateFolderOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded text-outline-variant hover:text-primary transition-all shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateFolder} className="flex flex-col gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-outline block">Mappenavn / Tittel</label>
                  <input 
                    type="text"
                    required
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="f.eks. Modul 2: Disiplin og Lærdom..."
                    className="w-full p-3 bg-slate-50 border border-outline-variant rounded-lg text-xs font-semibold focus:outline-none focus:border-primary shadow-sm focus:ring-1 focus:ring-primary"
                    style={{
                      transform: 'translateZ(0) !important',
                      backfaceVisibility: 'hidden !important'
                    }}
                  />
                </div>

                <div className="flex items-center gap-3 mt-2 justify-end">
                  <button 
                    type="button"
                    onClick={() => setIsCreateFolderOpen(false)}
                    className="px-4 py-2.5 rounded-lg border border-outline-variant hover:bg-slate-50 text-xs font-bold uppercase cursor-pointer"
                  >
                    Avbryt
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/95 text-xs font-bold uppercase shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    Opprett Mappe
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
