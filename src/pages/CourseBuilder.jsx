import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { SYSTEM_REVIEWERS } from '@/contexts/AppContext';
import ModuleContentEditor from '@/components/ModuleContentEditor';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, PlusCircle, Layers, Trash2, Eye, GripVertical,
  AlertCircle, Video as MediaIcon, PlayCircle, FileText,
  Image as ImageIcon, Music, X, Link, Search, ChevronDown,
  ChevronRight, ChevronUp, Sparkles, Lock, Check, Pencil,
  ArrowUp, ArrowDown, CheckCircle2, Circle, Save, XCircle,
  BookOpen, User, Hash, Send, Clock, ShieldCheck, ShieldX, ShieldAlert, LayoutList
} from 'lucide-react';

// ─── Static media assets ──────────────────────────────────────────────────
const MEDIA_ASSETS = [
  { id: 'a1', name: 'Undervisning_Guds_Rost_PROP101.mp4', type: 'video', size: '42 MB', thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=200' },
  { id: 'a2', name: 'Studieguide_Profetisk_Karakter.pdf', type: 'pdf', size: '1.2 MB', thumbnail: null },
  { id: 'a3', name: 'Tabernakel_Skisse_Bibelstudier.jpg', type: 'image', size: '8.4 MB', thumbnail: 'https://images.unsplash.com/photo-1544856890-7fdb96f30a99?auto=format&fit=crop&q=80&w=200' },
  { id: 'a4', name: 'Lovsang_og_Inspirasjon_Samling.mp3', type: 'audio', size: '18 MB', thumbnail: null },
  { id: 'a5', name: 'Johannes_Apenbaring_Eskatologi_Tegning.pdf', type: 'pdf', size: '4.1 MB', thumbnail: null },
  { id: 'a6', name: 'Apostolisk_Fellesskap_Seminar.mp4', type: 'video', size: '120 MB', thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=200' },
];

const PROGRESSION_RULES = [
  { id: 'sequential', name: 'Sekvensiell', desc: 'Elever fullfører én modul før neste låses opp.' },
  { id: 'free',       name: 'Fri rekkefølge', desc: 'Elever velger moduler i valgfri rekkefølge.' },
  { id: 'date',       name: 'Dato-publisering', desc: 'Moduler frigis automatisk på fastsatte datoer.' },
  { id: 'gated',      name: 'Oppgave-avlåst', desc: 'Neste modul låses opp etter godkjent innlevering.' },
];

function FileIcon({ type, size = 16 }) {
  switch (type) {
    case 'video': return <PlayCircle size={size} className="text-[#1B4965]" />;
    case 'pdf':   return <FileText   size={size} className="text-red-500" />;
    case 'image': return <ImageIcon  size={size} className="text-emerald-600" />;
    case 'audio': return <Music      size={size} className="text-amber-600" />;
    default:      return <FileText   size={size} className="text-outline" />;
  }
}

// Approval status badge
function ApprovalBadge({ status }) {
  if (!status || status === 'none') return null;
  const map = {
    pending:  { label: 'Til godkjenning', cls: 'bg-amber-50 text-amber-700 border-amber-200', Icon: Clock },
    approved: { label: 'Godkjent',        cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: ShieldCheck },
    rejected: { label: 'Avvist',          cls: 'bg-red-50 text-red-600 border-red-200', Icon: ShieldX },
  };
  const { label, cls, Icon } = map[status] || {};
  return (
    <span className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>
      <Icon size={10} />{label}
    </span>
  );
}

// ─── Inline editable text field ───────────────────────────────────────────
function InlineField({ value, onSave, placeholder = '', className = '', inputClassName = '' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);
  useEffect(() => { setDraft(value); }, [value]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    setEditing(false);
  };
  const cancel = () => { setDraft(value); setEditing(false); };
  const onKey  = (e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); };

  if (editing) return (
    <div className="flex items-center gap-1.5 w-full">
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={commit}
        placeholder={placeholder}
        className={`flex-grow px-2.5 py-1.5 border-2 border-primary rounded-lg text-xs font-semibold focus:outline-none bg-white shadow-sm ${inputClassName}`}
        style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
      />
      <button onClick={commit} className="text-emerald-600 hover:text-emerald-700 p-1 shrink-0"><Save size={14} /></button>
      <button onClick={cancel} className="text-outline hover:text-red-500 p-1 shrink-0"><XCircle size={14} /></button>
    </div>
  );

  return (
    <button onClick={() => setEditing(true)} className={`group flex items-center gap-1.5 text-left w-full hover:text-primary transition-colors ${className}`} title="Klikk for å redigere">
      <span className="flex-grow">{value || <span className="italic text-outline-variant">{placeholder}</span>}</span>
      <Pencil size={11} className="opacity-0 group-hover:opacity-60 transition-opacity shrink-0 text-primary" />
    </button>
  );
}

// ─── Approval modal ────────────────────────────────────────────────────────
function ApprovalModal({ mod, courseId, onClose }) {
  const { sendModuleForApproval } = useApp();
  const [selectedReviewerId, setSelectedReviewerId] = useState('');
  const [senderNote, setSenderNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedReviewerId) return;
    sendModuleForApproval(courseId, mod.id, selectedReviewerId, senderNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 16 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden"
        style={{ transform: 'translateZ(0) !important', backfaceVisibility: 'hidden !important' }}
      >
        {/* Header */}
        <div className="bg-[#1B4965] text-white px-6 py-5 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert size={18} className="text-[#c5a059]" />
              <h3 className="font-serif text-lg font-bold">Send til godkjenning</h3>
            </div>
            <p className="text-[11px] text-white/65 font-medium leading-relaxed">
              Velg hvem som skal gjennomgå og godkjenne modulen.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors shrink-0 mt-0.5">
            <X size={18} />
          </button>
        </div>

        {/* Module context */}
        <div className="px-6 pt-5 pb-1">
          <div className="bg-slate-50 border border-outline-variant/20 rounded-xl p-3.5 flex flex-col gap-1">
            <p className="text-[9px] font-bold uppercase tracking-widest text-outline">Modul som sendes</p>
            <p className="text-sm font-bold text-primary font-serif leading-snug">{mod.title}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 flex flex-col gap-4">
          {/* Reviewer picker */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-outline block">Velg godkjenner</label>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {SYSTEM_REVIEWERS.map(rev => (
                <button
                  key={rev.id}
                  type="button"
                  onClick={() => setSelectedReviewerId(rev.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    selectedReviewerId === rev.id
                      ? 'border-primary bg-primary/5'
                      : 'border-outline-variant/20 hover:border-outline-variant/50 hover:bg-slate-50'
                  }`}
                >
                  <img src={rev.avatar} alt={rev.name} className="w-9 h-9 rounded-full object-cover border border-outline-variant/20 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-primary truncate">{rev.name}</p>
                    <p className="text-[10px] text-on-surface-variant font-medium truncate">{rev.role}</p>
                  </div>
                  {selectedReviewerId === rev.id && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Check size={11} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Optional note */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-outline block">Notat til godkjenner (valgfritt)</label>
            <textarea
              value={senderNote}
              onChange={e => setSenderNote(e.target.value)}
              placeholder="Legg til kommentarer, spørsmål eller særlige hensyn for godkjenner…"
              rows={3}
              className="w-full px-3.5 py-3 border-2 border-outline-variant/30 rounded-xl text-xs font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none leading-relaxed shadow-sm transition-colors"
              style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-outline-variant/30 text-xs font-bold uppercase text-on-surface-variant hover:border-outline-variant transition-all active:scale-95"
            >Avbryt</button>
            <button
              type="submit"
              disabled={!selectedReviewerId}
              className="flex-1 py-3 rounded-xl bg-primary text-white text-xs font-bold uppercase shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send size={13} /> Send til godkjenning
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Module row ────────────────────────────────────────────────────────────
function ModuleRow({ mod, index, total, courseId, linkedAssets, onOpenMediaDrawer }) {
  const { updateModule, deleteModule, reorderModule, toggleModuleCompleted } = useApp();
  const [expanded, setExpanded]           = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showContentEditor, setShowContentEditor] = useState(false);

  const linked = linkedAssets[mod.id] || [];

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -12 }}
        className={`rounded-xl border-2 overflow-hidden transition-colors duration-150 ${
          expanded ? 'border-primary/30 shadow-md' : 'border-outline-variant/20 hover:border-outline-variant/40'
        }`}
      >
        {/* ── Row header ── */}
        <div className="flex items-center gap-2.5 p-3.5 bg-slate-50/70">
          <span className="text-outline cursor-grab shrink-0 touch-none select-none"><GripVertical size={16} /></span>

          {/* Index */}
          <span className="w-6 h-6 rounded-md bg-primary/8 border border-primary/15 text-primary font-bold text-[10px] flex items-center justify-center font-mono shrink-0">
            {index + 1}
          </span>

          {/* Inline title */}
          <div className="flex-grow min-w-0">
            <InlineField
              value={mod.title}
              placeholder="Skriv modulens tittel…"
              onSave={val => updateModule(courseId, mod.id, { title: val })}
              className="text-xs font-semibold text-primary truncate"
            />
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {linked.length > 0 && (
                <span className="text-[9px] font-bold text-[#c5a059]">
                  {linked.length} ressurs{linked.length !== 1 ? 'er' : ''} koblet
                </span>
              )}
              <ApprovalBadge status={mod.approvalStatus} />
            </div>
          </div>

          {/* Publish toggle */}
          <button
            onClick={() => toggleModuleCompleted(courseId, mod.id)}
            title={mod.completed ? 'Sett som utkast' : 'Sett som publisert'}
            className={`hidden sm:flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all shrink-0 ${
              mod.completed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {mod.completed ? <><CheckCircle2 size={11} /> Publisert</> : <><Circle size={11} /> Utkast</>}
          </button>

          {/* Move up/down */}
          <div className="flex flex-col gap-0.5 shrink-0">
            <button disabled={index === 0} onClick={() => reorderModule(courseId, mod.id, 'up')}
              className="p-1 hover:bg-primary/10 rounded text-outline hover:text-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              title="Flytt opp"><ArrowUp size={12} /></button>
            <button disabled={index === total - 1} onClick={() => reorderModule(courseId, mod.id, 'down')}
              className="p-1 hover:bg-primary/10 rounded text-outline hover:text-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              title="Flytt ned"><ArrowDown size={12} /></button>
          </div>

          {/* Expand */}
          <button onClick={() => setExpanded(p => !p)}
            className="p-1.5 hover:bg-slate-200 rounded-lg text-outline hover:text-primary transition-colors shrink-0">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* ── Expanded actions panel ── */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="border-t border-outline-variant/20 bg-white px-5 py-4 flex flex-col gap-4">

                {/* Publish toggle (mobile) */}
                <button
                  onClick={() => toggleModuleCompleted(courseId, mod.id)}
                  className={`sm:hidden flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-lg border self-start transition-all ${
                    mod.completed
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-slate-100 border-slate-200 text-slate-500'
                  }`}
                >
                  {mod.completed ? <><CheckCircle2 size={13} /> Publisert</> : <><Circle size={13} /> Utkast</>}
                </button>

                {/* Linked asset chips */}
                <div className="flex flex-wrap gap-2">
                  {linked.length === 0
                    ? <span className="text-[11px] text-outline-variant font-semibold italic">Ingen ressurser koblet ennå.</span>
                    : linked.map(assetId => {
                        const asset = MEDIA_ASSETS.find(a => a.id === assetId);
                        if (!asset) return null;
                        return (
                          <span key={assetId} className="flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/5 border border-primary/20 px-2.5 py-1 rounded-full">
                            <FileIcon type={asset.type} size={11} />
                            <span className="max-w-[130px] truncate">{asset.name}</span>
                          </span>
                        );
                      })
                  }
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setShowContentEditor(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 border border-outline-variant/30 text-primary text-xs font-bold uppercase rounded-lg hover:bg-primary/10 hover:border-primary/40 transition-all active:scale-95"
                  >
                    <LayoutList size={13} /> Rediger innhold
                  </button>

                  <button
                    onClick={() => onOpenMediaDrawer(mod.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-primary text-white text-xs font-bold uppercase rounded-lg hover:bg-primary/90 shadow-sm transition-all active:scale-95"
                  >
                    <MediaIcon size={13} /> Koble ressurser
                  </button>

                  <button
                    onClick={() => setShowApprovalModal(true)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase rounded-lg border-2 transition-all active:scale-95 ${
                      mod.approvalStatus === 'pending'
                        ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                        : mod.approvalStatus === 'approved'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-white border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary'
                    }`}
                  >
                    <ShieldAlert size={13} />
                    {mod.approvalStatus === 'pending'  ? 'Send på nytt' :
                     mod.approvalStatus === 'approved' ? 'Godkjent ✓'  :
                     mod.approvalStatus === 'rejected' ? 'Send på nytt' :
                     'Send til godkjenning'}
                  </button>

                  {/* Delete with confirm */}
                  {confirmDelete ? (
                    <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
                      <span className="text-[10px] font-bold text-red-600">Slett modulen?</span>
                      <button onClick={() => deleteModule(courseId, mod.id)} className="text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded">Ja</button>
                      <button onClick={() => setConfirmDelete(false)} className="text-[10px] font-bold text-outline hover:text-primary">Nei</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(true)}
                      className="p-2 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg text-outline hover:text-red-500 transition-colors ml-auto"
                      title="Slett modul"><Trash2 size={15} /></button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Approval modal */}
      <AnimatePresence>
        {showApprovalModal && (
          <ApprovalModal mod={mod} courseId={courseId} onClose={() => setShowApprovalModal(false)} />
        )}
      </AnimatePresence>

      {/* Content editor */}
      <AnimatePresence>
        {showContentEditor && (
          <ModuleContentEditor
            courseId={courseId}
            mod={mod}
            onClose={() => setShowContentEditor(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function CourseBuilder() {
  const navigate = useNavigate();
  const { courses, addCourseModule, updateCourse, showToast } = useApp();

  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || 'prop101');
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [selectedProgressionRule, setSelectedProgressionRule] = useState('sequential');
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [courseEditDraft, setCourseEditDraft] = useState({});

  // Media drawer
  const [isMediaDrawerOpen, setIsMediaDrawerOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [mediaSearch, setMediaSearch] = useState('');
  const [mediaFilter, setMediaFilter] = useState('all');
  const [linkedAssets, setLinkedAssets] = useState({});
  const [pendingAssetIds, setPendingAssetIds] = useState([]);

  const activeCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  const startEditCourse = () => {
    setCourseEditDraft({ title: activeCourse.title, code: activeCourse.code, instructor: activeCourse.instructor });
    setIsEditingCourse(true);
  };

  const saveCourseEdit = () => {
    const { title, code, instructor } = courseEditDraft;
    if (!title?.trim()) { showToast('Kurstittel kan ikke være tom.'); return; }
    updateCourse(activeCourse.id, { title: title.trim(), code: code?.trim(), instructor: instructor?.trim() });
    setIsEditingCourse(false);
  };

  const handleAddModule = (e) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) { showToast('Vennligst oppgi en modultittel.'); return; }
    addCourseModule(selectedCourseId, newModuleTitle);
    setNewModuleTitle('');
  };

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

  const confirmMediaLink = () => {
    if (!activeModuleId) return;
    setLinkedAssets(prev => ({ ...prev, [activeModuleId]: pendingAssetIds }));
    showToast(`${pendingAssetIds.length} ressurser koblet til modulen!`);
    closeMediaDrawer();
  };

  const filteredMedia = MEDIA_ASSETS.filter(a =>
    a.name.toLowerCase().includes(mediaSearch.toLowerCase()) &&
    (mediaFilter === 'all' || a.type === mediaFilter)
  );

  return (
    <>
      <div className="w-full px-4 sm:px-6 md:px-10 py-6 md:py-10 flex flex-col gap-6 md:gap-8 font-sans overflow-x-hidden">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-outline">
          <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/teacher/dashboard')}>Dashboard</span>
          <ChevronRight size={12} />
          <span className="text-primary font-bold">Kursbygger</span>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 md:gap-8">

          {/* ─── LEFT column ─── */}
          <div className="w-full xl:w-[320px] flex flex-col gap-5 shrink-0">

            {/* Course selector */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-primary mb-1 flex items-center gap-2">
                <Layers size={18} className="text-[#c5a059] shrink-0" /> Studielinjer
              </h2>
              <p className="text-[11px] text-on-surface-variant mb-4 font-medium leading-relaxed">
                Velg kurs for å redigere struktur og innhold.
              </p>
              <div className="space-y-2.5">
                {courses.map(course => {
                  const isActive = course.id === selectedCourseId;
                  return (
                    <button key={course.id}
                      onClick={() => { setSelectedCourseId(course.id); setIsEditingCourse(false); }}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 active:scale-[0.99] ${
                        isActive ? 'bg-primary border-primary text-white shadow-sm' : 'bg-white border-outline-variant/25 hover:border-primary/40 hover:bg-slate-50 text-on-surface-variant'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-surface-container text-primary'}`}>{course.code}</span>
                        <span className={`text-[10px] font-semibold ${isActive ? 'text-white/70' : 'text-outline'}`}>{course.totalModules} moduler</span>
                      </div>
                      <h3 className={`font-serif text-sm font-bold leading-tight ${isActive ? 'text-white' : 'text-primary'}`}>{course.title}</h3>
                      <p className={`text-[10px] mt-1 font-medium ${isActive ? 'text-white/65' : 'text-outline'}`}>{course.instructor}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Progression rules */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
              <h2 className="font-serif text-base font-bold text-primary mb-1 flex items-center gap-2">
                <Lock size={15} className="text-[#c5a059] shrink-0" /> Progresjonsregler
              </h2>
              <p className="text-[11px] text-on-surface-variant mb-4 font-medium">Styr tilgang og låsing av moduler.</p>
              <div className="space-y-2">
                {PROGRESSION_RULES.map(rule => (
                  <button key={rule.id}
                    onClick={() => { setSelectedProgressionRule(rule.id); showToast(`Progresjonsregel: "${rule.name}"`); }}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all flex items-start gap-2.5 ${
                      selectedProgressionRule === rule.id ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/20 hover:border-outline-variant/40 text-on-surface-variant hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${selectedProgressionRule === rule.id ? 'border-primary bg-primary' : 'border-outline-variant/50'}`}>
                      {selectedProgressionRule === rule.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold leading-snug">{rule.name}</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5 leading-relaxed font-medium">{rule.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ─── RIGHT column ─── */}
          <div className="w-full flex flex-col gap-5 min-w-0">
            {activeCourse ? (
              <motion.div key={activeCourse.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">

                {/* Course header */}
                <div className="p-6 sm:p-8 border-b border-outline-variant/20 bg-gradient-to-r from-white to-primary/[0.025]">
                  {isEditingCourse ? (
                    <div className="flex flex-col gap-4">
                      <span className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 bg-primary text-white rounded-full font-mono self-start">Rediger kursinfo</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-outline"><BookOpen size={11} /> Kurstittel</label>
                          <input value={courseEditDraft.title || ''} onChange={e => setCourseEditDraft(p => ({ ...p, title: e.target.value }))}
                            placeholder="Kurstittel…" className="w-full px-3.5 py-2.5 border-2 border-primary/30 focus:border-primary rounded-lg text-sm font-bold text-primary focus:outline-none shadow-sm font-serif transition-colors"
                            style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }} />
                        </div>
                        <div className="space-y-1">
                          <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-outline"><Hash size={11} /> Kurskode</label>
                          <input value={courseEditDraft.code || ''} onChange={e => setCourseEditDraft(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                            placeholder="PROP 101" className="w-full px-3 py-2 border-2 border-outline-variant/40 focus:border-primary rounded-lg text-xs font-bold font-mono text-primary focus:outline-none shadow-sm transition-colors"
                            style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }} />
                        </div>
                        <div className="space-y-1">
                          <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-outline"><User size={11} /> Ansvarlig mentor</label>
                          <input value={courseEditDraft.instructor || ''} onChange={e => setCourseEditDraft(p => ({ ...p, instructor: e.target.value }))}
                            placeholder="Navn på mentor" className="w-full px-3 py-2 border-2 border-outline-variant/40 focus:border-primary rounded-lg text-xs font-semibold text-primary focus:outline-none shadow-sm transition-colors"
                            style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pt-1">
                        <button onClick={saveCourseEdit} className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase rounded-lg shadow-md hover:bg-primary/90 transition-all active:scale-95"><Save size={13} /> Lagre</button>
                        <button onClick={() => setIsEditingCourse(false)} className="flex items-center gap-1.5 px-4 py-2.5 border border-outline-variant rounded-lg text-xs font-bold uppercase text-on-surface-variant hover:text-primary hover:border-primary transition-all active:scale-95"><XCircle size={13} /> Avbryt</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 bg-primary text-white rounded-full font-mono">Studieplan & Moduler</span>
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary mt-3 leading-tight">{activeCourse.title}</h2>
                        <p className="text-xs text-on-surface-variant mt-1.5 font-semibold flex flex-wrap items-center gap-2">
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-primary text-[10px]">{activeCourse.code}</span>
                          <span>· {activeCourse.instructor}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <button onClick={startEditCourse} className="py-2 px-4 rounded-lg border border-outline-variant hover:border-primary text-xs font-bold uppercase flex items-center gap-1.5 hover:text-primary transition-all active:scale-95 shadow-sm"><Pencil size={13} /> Rediger kurs</button>
                        <button onClick={() => navigate('/student/library')} className="py-2 px-4 rounded-lg border border-outline-variant hover:border-primary text-xs font-bold uppercase flex items-center gap-1.5 hover:text-primary transition-all active:scale-95 shadow-sm"><Eye size={13} /> Studentvisning</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modules list */}
                <div className="p-5 sm:p-8 flex flex-col gap-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-serif text-lg font-bold text-primary">Modulrekkefølge</h3>
                    <span className="text-[10px] font-bold text-outline uppercase tracking-wider bg-slate-50 px-2.5 py-1 rounded-full font-mono">{activeCourse.modules.length} moduler</span>
                  </div>

                  <AnimatePresence mode="popLayout">
                    {activeCourse.modules.map((mod, index) => (
                      <ModuleRow
                        key={mod.id}
                        mod={mod}
                        index={index}
                        total={activeCourse.modules.length}
                        courseId={activeCourse.id}
                        linkedAssets={linkedAssets}
                        onOpenMediaDrawer={openMediaDrawer}
                      />
                    ))}
                  </AnimatePresence>

                  {activeCourse.modules.length === 0 && (
                    <div className="py-12 text-center text-outline-variant text-sm font-semibold border-2 border-dashed border-outline-variant/20 rounded-xl">
                      Ingen moduler ennå. Legg til den første nedenfor.
                    </div>
                  )}
                </div>

                {/* Add module form */}
                <form onSubmit={handleAddModule} className="border-t border-outline-variant/20 px-5 sm:px-8 py-6 flex flex-col gap-4 bg-slate-50/50">
                  <h3 className="font-serif text-base font-bold text-primary flex items-center gap-2">
                    <PlusCircle size={16} className="text-[#c5a059] shrink-0" /> Legg til ny modul
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-grow space-y-1.5 w-full">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-outline block">Modultittel</label>
                      <input type="text" value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)}
                        placeholder="Eks: Modul 9 – Profetisk modning og prøving…"
                        className="w-full p-3.5 border-2 border-outline-variant/30 rounded-lg text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 font-medium shadow-sm transition-all"
                        style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }} />
                    </div>
                    <button type="submit" className="bg-primary text-white font-bold py-3.5 px-6 rounded-lg hover:bg-primary/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 w-full sm:w-auto shadow-md whitespace-nowrap shrink-0">
                      <Plus size={15} /> Legg til
                    </button>
                  </div>
                  <div className="bg-white border border-outline-variant/20 p-3.5 rounded-xl flex gap-2.5 items-start">
                    <AlertCircle size={14} className="text-secondary mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-on-surface-variant leading-relaxed font-semibold">
                      <strong>CMS Sanntidsoppdatering:</strong> Ny modul er umiddelbart synlig for studenter.
                    </p>
                  </div>
                </form>
              </motion.div>
            ) : (
              <div className="bg-white border border-outline-variant/30 rounded-xl p-16 text-center text-outline shadow-sm font-medium">
                Velg et studie fra venstre for å bygge læreplanen.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════ MEDIA SELECTOR DRAWER ══════ */}
      <AnimatePresence>
        {isMediaDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110]" onClick={closeMediaDrawer} />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[120] flex flex-col"
              style={{ transform: 'translateZ(0) !important', backfaceVisibility: 'hidden !important' }}
            >
              <div className="flex items-center justify-between p-5 border-b border-outline-variant/20 bg-[#1B4965] text-white shrink-0">
                <div>
                  <div className="flex items-center gap-2"><MediaIcon size={17} className="text-[#c5a059]" /><h3 className="font-serif text-lg font-bold">Koble Medieressurser</h3></div>
                  <p className="text-[11px] text-white/65 font-medium mt-0.5">Velg filer å knytte til modulen</p>
                </div>
                <button onClick={closeMediaDrawer} className="p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-90"><X size={20} /></button>
              </div>

              <div className="p-4 border-b border-outline-variant/10 space-y-3 bg-slate-50 shrink-0">
                <div className="relative">
                  <Search size={14} className="absolute inset-y-0 left-3 my-auto text-outline" />
                  <input type="text" value={mediaSearch} onChange={e => setMediaSearch(e.target.value)}
                    placeholder="Søk i mediebiblioteket…"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-outline-variant/30 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary shadow-sm"
                    style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['all', 'video', 'pdf', 'image', 'audio'].map(f => (
                    <button key={f} onClick={() => setMediaFilter(f)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all border ${mediaFilter === f ? 'bg-primary text-white border-primary' : 'bg-white text-outline border-outline-variant/30 hover:border-primary/40'}`}>
                      {f === 'all' ? 'Alle' : f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/10 p-2">
                {filteredMedia.length > 0 ? filteredMedia.map(asset => {
                  const isSelected = pendingAssetIds.includes(asset.id);
                  return (
                    <button key={asset.id}
                      onClick={() => setPendingAssetIds(prev => prev.includes(asset.id) ? prev.filter(id => id !== asset.id) : [...prev, asset.id])}
                      className={`w-full text-left flex items-center gap-3.5 p-3.5 rounded-xl transition-all group ${isSelected ? 'ring-2 ring-inset ring-primary bg-primary/[0.04]' : 'hover:bg-slate-50'}`}
                    >
                      <div className="w-11 h-11 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center border border-outline-variant/20">
                        {asset.thumbnail ? <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" /> : <FileIcon type={asset.type} size={18} />}
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="text-xs font-bold text-primary truncate">{asset.name}</h4>
                        <p className="text-[10px] text-outline font-semibold uppercase tracking-wide mt-0.5">{asset.type} · {asset.size}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? 'border-primary bg-primary' : 'border-outline-variant/40 group-hover:border-primary/40'}`}>
                        {isSelected && <Check size={11} className="text-white" />}
                      </div>
                    </button>
                  );
                }) : (
                  <div className="flex flex-col items-center justify-center h-40 gap-2">
                    <Search size={22} className="text-outline-variant" />
                    <p className="text-xs font-semibold text-on-surface-variant">Ingen filer matcher søket.</p>
                  </div>
                )}
              </div>

              <div className="border-t border-outline-variant/20 p-5 bg-white shrink-0">
                {pendingAssetIds.length > 0 && (
                  <div className="flex items-center gap-2 mb-3.5 p-3 bg-primary/5 border border-primary/15 rounded-lg">
                    <Sparkles size={13} className="text-[#c5a059] shrink-0" />
                    <p className="text-xs font-bold text-primary">{pendingAssetIds.length} ressurs{pendingAssetIds.length !== 1 ? 'er' : ''} valgt</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={closeMediaDrawer} className="flex-1 py-3 rounded-xl border-2 border-outline-variant/30 hover:border-outline-variant text-xs font-bold uppercase text-on-surface-variant transition-all active:scale-95">Avbryt</button>
                  <button onClick={confirmMediaLink} disabled={pendingAssetIds.length === 0}
                    className="flex-1 py-3 rounded-xl bg-primary text-white text-xs font-bold uppercase shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 flex items-center justify-center gap-2">
                    <Link size={13} /> Bekreft kobling
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
