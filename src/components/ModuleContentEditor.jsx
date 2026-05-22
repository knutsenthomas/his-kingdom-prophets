import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Save, Plus, Trash2, BookOpen, Target, PlaySquare,
  ClipboardList, ChevronUp, ChevronDown, GripVertical,
  Check, AlertCircle, Link as LinkIcon, Clock, FileText,
  Pencil, CheckCircle2, Eye
} from 'lucide-react';

// ─── Tab config ─────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',      label: 'Oversikt',           Icon: BookOpen },
  { id: 'goals',         label: 'Læringsmål',          Icon: Target },
  { id: 'lessons',       label: 'Undervisningstimer',  Icon: PlaySquare },
  { id: 'assignment',    label: 'Innlevering',         Icon: ClipboardList },
];

const ASSIGNMENT_TYPES = [
  { id: 'essay',       label: 'Essay / Tekst' },
  { id: 'reflection',  label: 'Refleksjonslogg' },
  { id: 'practical',   label: 'Praktisk øvelse' },
  { id: 'quiz',        label: 'Spørsmål / Quiz' },
  { id: 'discussion',  label: 'Diskusjonsforum' },
];

// ─── Auto-growing textarea ───────────────────────────────────────────────────
function AutoTextarea({ value, onChange, placeholder, className, minRows = 3 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={minRows}
      className={className}
      style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden', resize: 'none', overflow: 'hidden' }}
    />
  );
}

// ─── Main editor component ───────────────────────────────────────────────────
export default function ModuleContentEditor({ courseId, mod, onClose }) {
  const { updateModule, showToast } = useApp();

  // Work with a local draft so we save explicitly
  const [draft, setDraft] = useState({
    description:  mod.description  || '',
    learningGoals: [...(mod.learningGoals || [])],
    lessons:       (mod.lessons || []).map(l => ({ ...l })),
    assignment: {
      description: mod.assignment?.description || '',
      dueDate:     mod.assignment?.dueDate     || '',
      type:        mod.assignment?.type        || 'essay',
    },
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [saved, setSaved] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');

  // ── Helpers ──
  const set = (field, value) => setDraft(p => ({ ...p, [field]: value }));
  const setAssignment = (field, value) => setDraft(p => ({ ...p, assignment: { ...p.assignment, [field]: value } }));

  // Goals
  const addGoal = () => {
    if (!newGoalText.trim()) return;
    set('learningGoals', [...draft.learningGoals, newGoalText.trim()]);
    setNewGoalText('');
  };
  const removeGoal = (i) => set('learningGoals', draft.learningGoals.filter((_, idx) => idx !== i));
  const updateGoal = (i, val) => set('learningGoals', draft.learningGoals.map((g, idx) => idx === i ? val : g));
  const moveGoal = (i, dir) => {
    const arr = [...draft.learningGoals];
    const to = dir === 'up' ? i - 1 : i + 1;
    if (to < 0 || to >= arr.length) return;
    [arr[i], arr[to]] = [arr[to], arr[i]];
    set('learningGoals', arr);
  };

  // Lessons
  const addLesson = () => set('lessons', [
    ...draft.lessons,
    { id: `l-${Date.now()}`, title: '', description: '', duration: '', videoUrl: '' }
  ]);
  const removeLesson = (i) => set('lessons', draft.lessons.filter((_, idx) => idx !== i));
  const updateLesson = (i, field, val) => set('lessons', draft.lessons.map((l, idx) => idx === i ? { ...l, [field]: val } : l));
  const moveLesson = (i, dir) => {
    const arr = [...draft.lessons];
    const to = dir === 'up' ? i - 1 : i + 1;
    if (to < 0 || to >= arr.length) return;
    [arr[i], arr[to]] = [arr[to], arr[i]];
    set('lessons', arr);
  };

  // Save to AppContext
  const handleSave = () => {
    updateModule(courseId, mod.id, {
      description:   draft.description,
      learningGoals: draft.learningGoals,
      lessons:       draft.lessons,
      assignment:    draft.assignment,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    showToast('Modulinnhold lagret!');
  };

  // Has content in tab (used for indicator dots)
  const hasContent = {
    overview:   !!draft.description.trim(),
    goals:      draft.learningGoals.length > 0,
    lessons:    draft.lessons.length > 0,
    assignment: !!draft.assignment.description.trim(),
  };

  return (
    <div className="fixed inset-0 z-[130] flex">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel – slides in from right, takes ~70% on desktop, full on mobile */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className="absolute top-0 right-0 h-full w-full md:w-[72%] xl:w-[60%] bg-white shadow-2xl flex flex-col z-10 overflow-hidden"
        style={{ transform: 'translateZ(0) !important', backfaceVisibility: 'hidden !important' }}
      >

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="bg-[#1B4965] text-white px-6 py-5 flex items-start justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-1">Innholdsredigerer</p>
            <h2 className="font-serif text-lg md:text-xl font-bold leading-snug truncate">{mod.title}</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Save indicator */}
            <AnimatePresence>
              {saved && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-[10px] font-bold bg-emerald-500 px-3 py-1.5 rounded-lg"
                >
                  <Check size={12} /> Lagret
                </motion.span>
              )}
            </AnimatePresence>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#c5a059] hover:bg-[#b8904a] text-white text-xs font-bold uppercase rounded-lg transition-all active:scale-95 shadow-sm"
            >
              <Save size={13} /> Lagre
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-90">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Tab bar ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-0.5 px-4 pt-3 pb-0 border-b border-outline-variant/20 bg-white shrink-0 overflow-x-auto">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.Icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 -mb-px ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-primary hover:border-primary/30'
                }`}
              >
                <Icon size={14} />
                {tab.label}
                {hasContent[tab.id] && (
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-primary' : 'bg-[#c5a059]'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Tab content ────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="p-6 md:p-8 flex flex-col gap-6"
            >

              {/* ══ OVERVIEW ══ */}
              {activeTab === 'overview' && (
                <>
                  <div>
                    <h3 className="font-serif text-base font-bold text-primary mb-1 flex items-center gap-2">
                      <BookOpen size={16} className="text-[#c5a059]" /> Modulbeskrivelse
                    </h3>
                    <p className="text-[11px] text-on-surface-variant font-medium mb-3">
                      Skriv en introduksjon og oversikt over hva modulen inneholder. Vises for studenter øverst i modulen.
                    </p>
                    <AutoTextarea
                      value={draft.description}
                      onChange={e => set('description', e.target.value)}
                      placeholder="Beskriv modulens innhold, formål og hva studenten kan forvente å lære…"
                      minRows={6}
                      className="w-full px-4 py-3.5 border-2 border-outline-variant/30 rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 leading-relaxed shadow-sm transition-colors text-on-surface"
                    />
                    <p className="text-[10px] text-outline mt-2 font-semibold text-right">{draft.description.length} tegn</p>
                  </div>

                  {/* Summary cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Læringsmål', value: draft.learningGoals.length, icon: Target, tab: 'goals' },
                      { label: 'Undervisningstimer', value: draft.lessons.length, icon: PlaySquare, tab: 'lessons' },
                      { label: 'Innlevering', value: draft.assignment.description ? '✓' : '–', icon: ClipboardList, tab: 'assignment' },
                    ].map(card => {
                      const Icon = card.icon;
                      return (
                        <button
                          key={card.tab}
                          onClick={() => setActiveTab(card.tab)}
                          className="flex flex-col items-center gap-2 p-4 bg-slate-50 border border-outline-variant/20 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all group"
                        >
                          <Icon size={18} className="text-[#c5a059] group-hover:text-primary transition-colors" />
                          <span className="font-serif text-2xl font-bold text-primary">{card.value}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-outline text-center">{card.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* ══ LEARNING GOALS ══ */}
              {activeTab === 'goals' && (
                <>
                  <div>
                    <h3 className="font-serif text-base font-bold text-primary mb-1 flex items-center gap-2">
                      <Target size={16} className="text-[#c5a059]" /> Læringsmål
                    </h3>
                    <p className="text-[11px] text-on-surface-variant font-medium mb-4">
                      Klargjør hva studenten skal forstå, kunne og erfare etter fullført modul.
                    </p>

                    {/* Existing goals */}
                    <div className="space-y-2.5 mb-4">
                      <AnimatePresence mode="popLayout">
                        {draft.learningGoals.map((goal, i) => (
                          <motion.div
                            key={i}
                            layout
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -12 }}
                            className="flex items-center gap-2.5 group"
                          >
                            {/* Move */}
                            <div className="flex flex-col gap-0.5 shrink-0">
                              <button onClick={() => moveGoal(i, 'up')} disabled={i === 0} className="p-0.5 text-outline hover:text-primary disabled:opacity-20 transition-colors"><ChevronUp size={13} /></button>
                              <button onClick={() => moveGoal(i, 'down')} disabled={i === draft.learningGoals.length - 1} className="p-0.5 text-outline hover:text-primary disabled:opacity-20 transition-colors"><ChevronDown size={13} /></button>
                            </div>

                            {/* Goal number */}
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 font-mono">{i + 1}</span>

                            {/* Inline editable goal */}
                            <input
                              value={goal}
                              onChange={e => updateGoal(i, e.target.value)}
                              placeholder="Beskriv læringsmålet…"
                              className="flex-grow px-3 py-2 border border-outline-variant/30 rounded-lg text-xs font-semibold text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white shadow-sm transition-colors"
                              style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                            />

                            <button onClick={() => removeGoal(i)} className="p-1.5 text-outline hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 rounded-lg shrink-0"><Trash2 size={13} /></button>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {draft.learningGoals.length === 0 && (
                        <div className="py-8 text-center border-2 border-dashed border-outline-variant/20 rounded-xl">
                          <Target size={24} className="text-outline-variant mx-auto mb-2" />
                          <p className="text-xs font-semibold text-on-surface-variant">Ingen læringsmål ennå. Legg til ditt første nedenfor.</p>
                        </div>
                      )}
                    </div>

                    {/* Add goal input */}
                    <div className="flex gap-2.5">
                      <input
                        value={newGoalText}
                        onChange={e => setNewGoalText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addGoal()}
                        placeholder="Nytt læringsmål – trykk Enter eller klikk +"
                        className="flex-grow px-3.5 py-3 border-2 border-outline-variant/30 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-sm transition-colors"
                        style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                      />
                      <button onClick={addGoal} className="px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all active:scale-95 shadow-sm shrink-0">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ══ LESSONS ══ */}
              {activeTab === 'lessons' && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-base font-bold text-primary flex items-center gap-2">
                        <PlaySquare size={16} className="text-[#c5a059]" /> Undervisningstimer
                      </h3>
                      <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                        Del modulen inn i enkeltleksjoner med tittel, beskrivelse, varighet og eventuell videolenke.
                      </p>
                    </div>
                    <button
                      onClick={addLesson}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold uppercase rounded-lg hover:bg-primary/90 transition-all active:scale-95 shadow-sm shrink-0"
                    >
                      <Plus size={13} /> Ny time
                    </button>
                  </div>

                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {draft.lessons.length === 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="py-12 text-center border-2 border-dashed border-outline-variant/20 rounded-xl">
                          <PlaySquare size={28} className="text-outline-variant mx-auto mb-2" />
                          <p className="text-xs font-semibold text-on-surface-variant mb-3">Ingen undervisningstimer ennå.</p>
                          <button onClick={addLesson} className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase rounded-lg shadow-sm hover:bg-primary/90 transition-all active:scale-95 inline-flex items-center gap-1.5">
                            <Plus size={13} /> Legg til første time
                          </button>
                        </motion.div>
                      )}

                      {draft.lessons.map((lesson, i) => (
                        <motion.div key={lesson.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -12 }}
                          className="bg-white border-2 border-outline-variant/20 rounded-xl overflow-hidden hover:border-primary/20 transition-colors shadow-sm"
                        >
                          {/* Lesson header */}
                          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/80 border-b border-outline-variant/10">
                            <GripVertical size={15} className="text-outline cursor-grab shrink-0" />
                            <span className="w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0 font-mono">{i + 1}</span>
                            <span className="flex-grow text-xs font-bold text-primary truncate">{lesson.title || <span className="text-outline-variant italic font-normal">Ny time uten tittel</span>}</span>

                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={() => moveLesson(i, 'up')} disabled={i === 0} className="p-1 text-outline hover:text-primary disabled:opacity-20 transition-colors"><ChevronUp size={13} /></button>
                              <button onClick={() => moveLesson(i, 'down')} disabled={i === draft.lessons.length - 1} className="p-1 text-outline hover:text-primary disabled:opacity-20 transition-colors"><ChevronDown size={13} /></button>
                              <button onClick={() => removeLesson(i)} className="p-1 text-outline hover:text-red-500 transition-colors hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                            </div>
                          </div>

                          {/* Lesson fields */}
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Title */}
                            <div className="sm:col-span-2 space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-wider text-outline">Tittel</label>
                              <input value={lesson.title} onChange={e => updateLesson(i, 'title', e.target.value)}
                                placeholder="Tittel på undervisningstimen"
                                className="w-full px-3 py-2.5 border border-outline-variant/30 rounded-lg text-xs font-bold text-primary focus:outline-none focus:border-primary shadow-sm transition-colors"
                                style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }} />
                            </div>

                            {/* Description */}
                            <div className="sm:col-span-2 space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-wider text-outline">Beskrivelse</label>
                              <AutoTextarea value={lesson.description} onChange={e => updateLesson(i, 'description', e.target.value)}
                                placeholder="Kort beskrivelse av hva denne timen dekker…" minRows={2}
                                className="w-full px-3 py-2.5 border border-outline-variant/30 rounded-lg text-xs font-medium text-on-surface focus:outline-none focus:border-primary shadow-sm leading-relaxed transition-colors" />
                            </div>

                            {/* Duration */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-wider text-outline flex items-center gap-1"><Clock size={10} /> Varighet</label>
                              <input value={lesson.duration} onChange={e => updateLesson(i, 'duration', e.target.value)}
                                placeholder="f.eks. 45 min"
                                className="w-full px-3 py-2.5 border border-outline-variant/30 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary shadow-sm transition-colors"
                                style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }} />
                            </div>

                            {/* Video URL */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-wider text-outline flex items-center gap-1"><LinkIcon size={10} /> Videolenke (valgfritt)</label>
                              <input value={lesson.videoUrl} onChange={e => updateLesson(i, 'videoUrl', e.target.value)}
                                placeholder="https://youtube.com/…"
                                className="w-full px-3 py-2.5 border border-outline-variant/30 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary shadow-sm transition-colors"
                                style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }} />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </>
              )}

              {/* ══ ASSIGNMENT ══ */}
              {activeTab === 'assignment' && (
                <>
                  <div>
                    <h3 className="font-serif text-base font-bold text-primary mb-1 flex items-center gap-2">
                      <ClipboardList size={16} className="text-[#c5a059]" /> Innlevering / Oppgave
                    </h3>
                    <p className="text-[11px] text-on-surface-variant font-medium mb-5">
                      Beskriv oppgaven studenten skal innlevere etter fullført modul.
                    </p>

                    {/* Assignment type */}
                    <div className="space-y-2 mb-5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-outline block">Type oppgave</label>
                      <div className="flex flex-wrap gap-2">
                        {ASSIGNMENT_TYPES.map(type => (
                          <button
                            key={type.id}
                            onClick={() => setAssignment('type', type.id)}
                            className={`px-3.5 py-2 rounded-lg border-2 text-xs font-bold transition-all ${
                              draft.assignment.type === type.id
                                ? 'bg-primary border-primary text-white shadow-sm'
                                : 'bg-white border-outline-variant/30 text-on-surface-variant hover:border-primary/40 hover:text-primary'
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Assignment description */}
                    <div className="space-y-2 mb-5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-outline block">Oppgavetekst</label>
                      <AutoTextarea
                        value={draft.assignment.description}
                        onChange={e => setAssignment('description', e.target.value)}
                        placeholder="Beskriv oppgaven studenten skal utføre og innlevere. Inkluder krav til omfang, format og eventuelle referanser…"
                        minRows={6}
                        className="w-full px-4 py-3.5 border-2 border-outline-variant/30 rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 leading-relaxed shadow-sm transition-colors text-on-surface"
                      />
                    </div>

                    {/* Due date */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-outline block flex items-center gap-1.5"><Clock size={11} /> Innleveringsfrist</label>
                      <input
                        type="date"
                        value={draft.assignment.dueDate}
                        onChange={e => setAssignment('dueDate', e.target.value)}
                        className="px-3.5 py-2.5 border-2 border-outline-variant/30 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary shadow-sm transition-colors text-primary"
                        style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                      />
                    </div>

                    {/* Preview card */}
                    {draft.assignment.description && (
                      <div className="mt-6 bg-slate-50 border border-outline-variant/20 rounded-xl p-5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-outline mb-3 flex items-center gap-1.5"><Eye size={11} /> Slik ser studenten oppgaven</p>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary text-white uppercase">
                            {ASSIGNMENT_TYPES.find(t => t.id === draft.assignment.type)?.label}
                          </span>
                          {draft.assignment.dueDate && (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1">
                              <Clock size={10} /> Frist: {new Date(draft.assignment.dueDate).toLocaleDateString('no-NO', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed font-medium">{draft.assignment.description}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Sticky footer save bar ──────────────────────────────────────── */}
        <div className="border-t border-outline-variant/20 px-6 py-4 bg-white flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-on-surface-variant font-semibold">
            <AlertCircle size={13} className="text-secondary shrink-0" />
            Endringer lagres ikke automatisk – klikk Lagre for å bekrefte.
          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={onClose} className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-bold uppercase hover:border-primary hover:text-primary transition-all active:scale-95">Lukk</button>
            <button onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 bg-primary text-white text-xs font-bold uppercase rounded-lg shadow-md hover:bg-primary/90 transition-all active:scale-95">
              <Save size={13} /> Lagre innhold
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
