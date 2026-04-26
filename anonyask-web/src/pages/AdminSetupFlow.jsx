import { useState, useRef, useEffect } from 'react';
import {
  Building2, Mail, Phone, Globe, GraduationCap,
  Layers, CheckCircle, ChevronDown, Plus, Users,
  Trash2, Upload, FileSpreadsheet, GraduationCap as StudentIcon,
} from 'lucide-react';
import { useAuthStore } from '../store/index.js';
import * as XLSX from 'xlsx';

// ─── Constants ────────────────────────────────────────────────────────────────
const CLASS_NUMS = Array.from({ length: 12 }, (_, i) => i + 1);

const SECTIONS_OPTIONS = [
  { value: 'A only',           letters: ['A'] },
  { value: 'A & B',            letters: ['A', 'B'] },
  { value: 'A, B & C',         letters: ['A', 'B', 'C'] },
  { value: 'A, B, C & D',      letters: ['A', 'B', 'C', 'D'] },
  { value: 'A–E (5 sections)', letters: ['A', 'B', 'C', 'D', 'E'] },
];

const DEFAULT_SUBJECTS = [
  { name: 'Social',  emoji: '🌍', color: '#A855F7' },
  { name: 'Science', emoji: '🔬', color: '#22C55E' },
  { name: 'Maths',   emoji: '📐', color: '#3B82F6' },
  { name: 'English', emoji: '📖', color: '#F59E0B' },
];

const CUSTOM_COLORS = ['#EC4899', '#14B8A6', '#EF4444', '#F97316', '#6366F1', '#84CC16'];

const STEPS = [
  { id: 1, label: 'School Details' },
  { id: 2, label: 'Classes' },
  { id: 3, label: 'Subjects' },
  { id: 4, label: 'Teachers' },
  { id: 5, label: 'Students' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildClassMap(from, to, existing = {}) {
  const map = {};
  for (let g = from; g <= to; g++) map[g] = existing[g] ?? 'A only';
  return map;
}

function Field({ label, icon: Icon, children, required }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-text-secondary text-sm font-medium mb-2">
        <Icon size={13} className="text-accent-blue" />
        {label}
        {required && <span className="text-danger">*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Subject multi-select dropdown ───────────────────────────────────────────
function SubjectDropdown({ selected, available, onChange, onAddSubject }) {
  const [open,        setOpen]        = useState(false);
  const [customMode,  setCustomMode]  = useState(false);
  const [customName,  setCustomName]  = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setCustomMode(false); setCustomName(''); } };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (name) => {
    const next = new Set(selected);
    next.has(name) ? next.delete(name) : next.add(name);
    onChange(next);
  };

  const commitCustom = () => {
    const trimmed = customName.trim();
    if (!trimmed) return;
    onAddSubject(trimmed);
    onChange(new Set([...selected, trimmed]));
    setCustomName('');
    setCustomMode(false);
  };

  const label = selected.size === 0
    ? 'Select subjects…'
    : selected.size === available.length
      ? 'All subjects'
      : [...selected].join(', ');

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input-field w-full text-left flex items-center justify-between gap-2 text-sm py-2"
      >
        <span className="truncate text-text-primary">{label}</span>
        <ChevronDown size={14} className={`shrink-0 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-bg-secondary border border-border-default rounded-xl shadow-card-hover z-50">
          <div
            className="overflow-y-auto"
            style={{ maxHeight: '11rem', scrollbarWidth: 'thin', scrollbarColor: 'var(--border-default) transparent' }}
          >
            {available.map((subj, idx) => {
              const checked = selected.has(subj.name);
              return (
                <button
                  key={subj.name}
                  type="button"
                  onClick={() => toggle(subj.name)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 hover:bg-bg-elevated cursor-pointer transition-colors text-left ${idx === 0 ? 'rounded-t-xl' : ''}`}
                >
                  {/* Custom circular checkbox */}
                  <span
                    className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 border transition-all duration-200"
                    style={checked ? {
                      background: `linear-gradient(135deg, ${subj.color}, ${subj.color}aa)`,
                      borderColor: subj.color,
                      boxShadow: `0 0 8px ${subj.color}55`,
                    } : {
                      borderColor: 'var(--border-default)',
                      background: 'var(--bg-elevated)',
                    }}
                  >
                    {checked && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  <span
                    className="w-6 h-6 rounded-md flex items-center justify-center text-sm shrink-0"
                    style={{ backgroundColor: `${subj.color}20`, border: `1px solid ${subj.color}40` }}
                  >
                    {subj.emoji}
                  </span>
                  <span className="text-sm text-text-primary">{subj.name}</span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-border-subtle">
            {customMode ? (
              <div className="flex items-center gap-2 px-3 py-2">
                <input
                  autoFocus
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') commitCustom(); if (e.key === 'Escape') { setCustomMode(false); setCustomName(''); } }}
                  placeholder="Subject name…"
                  className="flex-1 bg-transparent text-sm outline-none text-text-primary placeholder:text-text-muted"
                />
                <button
                  type="button"
                  onClick={commitCustom}
                  className="text-accent-blue text-xs font-semibold hover:text-accent-blue-light transition-colors"
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCustomMode(true)}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-text-muted hover:text-accent-blue hover:bg-bg-elevated transition-colors"
              >
                <Plus size={14} /> Other
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 1 — School Details ──────────────────────────────────────────────────
function StepSchool({ onDone }) {
  const saveSchool = useAuthStore((s) => s.saveSchool);
  const [form,   setForm]   = useState({ schoolName: '', officialEmail: '', phone: '', website: '' });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const canSubmit = form.schoolName.trim() && form.officialEmail.trim() && form.phone.trim();

  const handleSubmit = async () => {
    if (!canSubmit) { setError('Please fill in all required fields.'); return; }
    setSaving(true); setError('');
    try { await saveSchool(form); onDone(); }
    catch { setError('Failed to save. Please try again.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <Field label="School Name" icon={Building2} required>
        <input type="text" value={form.schoolName} onChange={(e) => upd('schoolName', e.target.value)} placeholder="e.g. St. Xavier's High School" className="input-field" />
      </Field>
      <Field label="Official Email" icon={Mail} required>
        <input type="email" value={form.officialEmail} onChange={(e) => upd('officialEmail', e.target.value)} placeholder="principal@school.edu.in" className="input-field" />
      </Field>
      <Field label="Contact Phone" icon={Phone} required>
        <input type="tel" value={form.phone} onChange={(e) => upd('phone', e.target.value)} placeholder="+91 98765 43210" className="input-field" />
      </Field>
      <Field label="Website" icon={Globe}>
        <input type="url" value={form.website} onChange={(e) => upd('website', e.target.value)} placeholder="https://school.edu.in" className="input-field" />
      </Field>
      {error && <p className="text-sm text-danger text-center">{error}</p>}
      <button type="button" onClick={handleSubmit} disabled={saving || !canSubmit}
        className="btn-primary w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
        {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</> : <>Save & Continue <CheckCircle size={16} /></>}
      </button>
    </div>
  );
}

// ─── Step 2 — Configure Classes ───────────────────────────────────────────────
function StepClasses({ onDone }) {
  const setupClasses = useAuthStore((s) => s.setupClasses);
  const [classFrom, setClassFrom] = useState(1);
  const [classTo,   setClassTo]   = useState(10);
  const [classMap,  setClassMap]  = useState(() => buildClassMap(1, 10));
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  const updateFrom = (v) => {
    const from = Number(v), to = Math.max(Number(v), classTo);
    setClassFrom(from); setClassTo(to);
    setClassMap((m) => buildClassMap(from, to, m));
  };
  const updateTo = (v) => {
    const to = Number(v);
    setClassTo(to);
    setClassMap((m) => buildClassMap(classFrom, to, m));
  };

  const grades = Array.from({ length: classTo - classFrom + 1 }, (_, i) => classFrom + i);

  const allNames = [];
  for (let g = classFrom; g <= classTo; g++) {
    const letters = SECTIONS_OPTIONS.find((s) => s.value === classMap[g])?.letters ?? ['A'];
    for (const s of letters) allNames.push(`Class ${g}${s}`);
  }
  const totalClasses = allNames.length;
  const preview = totalClasses <= 8 ? allNames : [...allNames.slice(0, 4), '…', ...allNames.slice(-3)];

  const handleSubmit = async () => {
    setSaving(true); setError('');
    try {
      await setupClasses(classFrom, classTo, classMap);
      onDone();
    } catch {
      setError('Failed to create classes. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="From Class" icon={GraduationCap} required>
          <select value={classFrom} onChange={(e) => updateFrom(e.target.value)} className="input-field">
            {CLASS_NUMS.map((n) => <option key={n} value={n}>Class {n}</option>)}
          </select>
        </Field>
        <Field label="To Class" icon={GraduationCap} required>
          <select value={classTo} onChange={(e) => updateTo(e.target.value)} className="input-field">
            {CLASS_NUMS.filter((n) => n >= classFrom).map((n) => <option key={n} value={n}>Class {n}</option>)}
          </select>
        </Field>
      </div>

      <div className="border border-border-default rounded-xl">
        <div className="flex items-center justify-between px-4 py-2.5 bg-bg-elevated border-b border-border-subtle rounded-t-xl">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Class</span>
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Sections</span>
        </div>
        <div className="divide-y divide-border-subtle max-h-52 overflow-y-auto rounded-b-xl">
          {grades.map((g) => (
            <div key={g} className="flex items-center justify-between px-4 py-2.5 gap-4">
              <span className="text-sm font-medium text-text-primary whitespace-nowrap">Class {g}</span>
              <select value={classMap[g] ?? 'A only'} onChange={(e) => setClassMap((m) => ({ ...m, [g]: e.target.value }))}
                className="input-field py-1.5 text-sm max-w-[160px]">
                {SECTIONS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-accent-blue/8 border border-accent-blue/20 rounded-xl p-4 space-y-2">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Preview — {totalClasses} {totalClasses === 1 ? 'class' : 'classes'}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {preview.map((name, i) =>
            name === '…'
              ? <span key="ellipsis" className="text-text-muted text-sm px-1">…</span>
              : <span key={i} className="px-2.5 py-0.5 rounded-lg bg-accent-blue/15 border border-accent-blue/25 text-accent-blue text-xs font-medium">{name}</span>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-danger text-center">{error}</p>}

      <button type="button" onClick={handleSubmit} disabled={saving}
        className="btn-primary w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
        {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating…</> : <>Continue <CheckCircle size={16} /></>}
      </button>
    </div>
  );
}

// ─── Step 3 — Configure Subjects ─────────────────────────────────────────────
function StepSubjects({ onDone }) {
  const setupSubjects = useAuthStore((s) => s.setupSubjects);
  const classes       = useAuthStore((s) => s.classes);

  // Unique grades from configured classes
  const grades = [...new Set(classes.map((c) => c.grade))].sort((a, b) => a - b);

  const [available,  setAvailable]  = useState([...DEFAULT_SUBJECTS]);
  const [selections, setSelections] = useState(() => {
    const m = {};
    grades.forEach((g) => { m[g] = new Set(DEFAULT_SUBJECTS.map((s) => s.name)); });
    return m;
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const addSubject = (name) => {
    if (available.find((s) => s.name.toLowerCase() === name.toLowerCase())) return;
    const color = CUSTOM_COLORS[available.length % CUSTOM_COLORS.length];
    const newSubj = { name, emoji: '📚', color };
    setAvailable((prev) => [...prev, newSubj]);
    // Auto-select the new subject for all grades
    setSelections((prev) => {
      const next = { ...prev };
      grades.forEach((g) => { next[g] = new Set([...next[g], name]); });
      return next;
    });
  };

  const handleSubmit = async () => {
    setSaving(true); setError('');
    try {
      const usedNames = new Set(Object.values(selections).flatMap((s) => [...s]));
      const subjectsToCreate = available.filter((s) => usedNames.has(s.name));
      await setupSubjects(subjectsToCreate);
      onDone();
    } catch {
      setError('Failed to save subjects. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="border border-border-default rounded-xl">
        <div className="flex items-center justify-between px-4 py-2.5 bg-bg-elevated border-b border-border-subtle rounded-t-xl">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Class</span>
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Subjects</span>
        </div>
        <div className="divide-y divide-border-subtle">
          {grades.map((g, i) => (
            <div key={g} className={`flex items-center gap-4 px-4 py-3 ${i === grades.length - 1 ? 'rounded-b-xl' : ''}`}>
              <span className="text-sm font-medium text-text-primary whitespace-nowrap w-16 shrink-0">
                Class {g}
              </span>
              <div className="flex-1 min-w-0">
                <SubjectDropdown
                  selected={selections[g] ?? new Set()}
                  available={available}
                  onChange={(val) => setSelections((prev) => ({ ...prev, [g]: val }))}
                  onAddSubject={addSubject}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-danger text-center">{error}</p>}

      <button type="button" onClick={handleSubmit} disabled={saving}
        className="btn-primary w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
        {saving
          ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Setting up…</>
          : <>Continue <CheckCircle size={16} /></>}
      </button>
    </div>
  );
}

// ─── Class multi-select for teacher assignment ────────────────────────────────
function ClassSelector({ selected, classes, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const toggle = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    onChange(next);
  };

  const label = selected.size === 0
    ? 'Assign classes…'
    : classes.filter((c) => selected.has(c.id)).map((c) => c.name).join(', ');

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="input-field w-full text-left flex items-center justify-between gap-2 text-sm py-2">
        <span className="truncate text-text-primary">{label}</span>
        <ChevronDown size={14} className={`shrink-0 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-bg-secondary border border-border-default rounded-xl shadow-card-hover z-50">
          <div className="overflow-y-auto" style={{ maxHeight: '10rem', scrollbarWidth: 'thin', scrollbarColor: 'var(--border-default) transparent' }}>
            {classes.map((cls, idx) => {
              const checked = selected.has(cls.id);
              return (
                <button key={cls.id} type="button" onClick={() => toggle(cls.id)}
                  className={`flex items-center gap-3 w-full px-3 py-2 hover:bg-bg-elevated transition-colors text-left ${idx === 0 ? 'rounded-t-xl' : ''}`}>
                  <span className={`w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 border transition-all duration-150 ${
                    checked ? 'bg-accent-blue border-accent-blue' : 'border-border-default bg-bg-elevated'
                  }`}>
                    {checked && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </span>
                  <span className="text-sm text-text-primary">{cls.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 4 — Configure Teachers ─────────────────────────────────────────────
const EMPTY_TEACHER = { name: '', email: '', phone: '', classIds: new Set() };

function StepTeachers({ onDone }) {
  const setupTeachers = useAuthStore((s) => s.setupTeachers);
  const classes       = useAuthStore((s) => s.classes);

  const [mode,     setMode]     = useState('manual');
  const [teachers, setTeachers] = useState([]);
  const [form,     setForm]     = useState({ ...EMPTY_TEACHER, classIds: new Set() });
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const canAdd = form.name.trim() && form.email.trim();

  const addTeacher = () => {
    if (!canAdd) return;
    setTeachers((prev) => [...prev, { ...form, classIds: new Set(form.classIds) }]);
    setForm({ name: '', email: '', phone: '', classIds: new Set() });
  };

  const removeTeacher = (i) => setTeachers((prev) => prev.filter((_, idx) => idx !== i));

  const parseFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb   = XLSX.read(e.target.result, { type: 'array' });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
        const parsed = rows.map((r) => ({
          name:     String(r['Teacher Name'] ?? r['Name'] ?? r['name'] ?? '').trim(),
          email:    String(r['Email'] ?? r['email'] ?? '').trim().toLowerCase(),
          phone:    String(r['Phone'] ?? r['phone'] ?? '').trim(),
          classes:  String(r['Classes'] ?? r['Assigned Classes'] ?? r['classes'] ?? '').trim(),
          classIds: new Set(),
        })).filter((r) => r.name && r.email);
        setTeachers(parsed);
        setMode('manual');
      } catch {
        setError('Could not parse file. Please use the correct format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Teacher Name', 'Email', 'Phone', 'Classes'],
      ['Mr. Sharma',   'sharma@school.edu', '+91 98765 43210', 'Class 9A, Class 10A'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Teachers');
    XLSX.writeFile(wb, 'teachers_template.xlsx');
  };

  const handleSubmit = async () => {
    setSaving(true); setError('');
    try {
      const payload = teachers.map((t) => ({
        name:     t.name,
        email:    t.email,
        phone:    t.phone,
        classIds: [...(t.classIds ?? new Set())],
      }));
      await setupTeachers(payload);
      onDone();
    } catch {
      setError('Failed to save teachers. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Mode tabs */}
      <div className="flex gap-1 p-1 bg-bg-elevated rounded-xl border border-border-subtle">
        {[
          { id: 'manual', icon: Plus,            label: 'Add Manually' },
          { id: 'upload', icon: FileSpreadsheet,  label: 'Upload File'  },
        ].map(({ id, icon: Icon, label }) => (
          <button key={id} type="button" onClick={() => setMode(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === id
                ? 'bg-accent-blue text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {mode === 'manual' && (
        <>
          {/* Form */}
          <div className="space-y-3 p-4 rounded-xl border border-border-default bg-bg-elevated/40">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Name *</label>
                <input value={form.name} onChange={(e) => upd('name', e.target.value)}
                  placeholder="Mr. Sharma" className="input-field text-sm py-2" />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Email *</label>
                <input type="email" value={form.email} onChange={(e) => upd('email', e.target.value)}
                  placeholder="teacher@school.edu" className="input-field text-sm py-2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => upd('phone', e.target.value)}
                  placeholder="+91 98765 43210" className="input-field text-sm py-2" />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Assigned Classes</label>
                <ClassSelector selected={form.classIds} classes={classes}
                  onChange={(val) => upd('classIds', val)} />
              </div>
            </div>
            <button type="button" onClick={addTeacher} disabled={!canAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-blue/15 border border-accent-blue/30 text-accent-blue text-sm font-medium hover:bg-accent-blue/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <Plus size={14} /> Add Teacher
            </button>
          </div>

          {/* Added teachers list */}
          {teachers.length > 0 && (
            <div className="border border-border-default rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-bg-elevated border-b border-border-subtle">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  {teachers.length} Teacher{teachers.length !== 1 ? 's' : ''} Added
                </span>
              </div>
              <div className="divide-y divide-border-subtle max-h-48 overflow-y-auto"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border-default) transparent' }}>
                {teachers.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="w-8 h-8 rounded-full bg-accent-purple/20 border border-accent-purple/30 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-accent-purple">
                        {t.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{t.name}</p>
                      <p className="text-xs text-text-muted truncate">{t.email}</p>
                    </div>
                    {t.classIds?.size > 0 && (
                      <span className="text-xs text-text-muted shrink-0">
                        {t.classIds.size} class{t.classIds.size !== 1 ? 'es' : ''}
                      </span>
                    )}
                    {t.classes && (
                      <span className="text-xs text-text-muted shrink-0 max-w-[80px] truncate">{t.classes}</span>
                    )}
                    <button type="button" onClick={() => removeTeacher(i)}
                      className="p-1 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {mode === 'upload' && (
        <div className="space-y-3">
          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-accent-blue bg-accent-blue/8 scale-[1.01]'
                : 'border-border-default hover:border-accent-blue/50 hover:bg-bg-elevated'
            }`}
          >
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
              onChange={(e) => { if (e.target.files[0]) parseFile(e.target.files[0]); }} />
            <FileSpreadsheet size={32} className="mx-auto mb-3 text-text-muted" />
            <p className="text-sm font-medium text-text-primary mb-1">Drop your Excel or CSV file here</p>
            <p className="text-xs text-text-muted">or click to browse · .xlsx, .xls, .csv</p>
          </div>

          {/* Template download */}
          <button type="button" onClick={downloadTemplate}
            className="flex items-center gap-2 text-sm text-accent-blue hover:text-accent-blue-light transition-colors mx-auto">
            <Upload size={14} /> Download template (.xlsx)
          </button>

          {/* Expected columns */}
          <div className="bg-bg-elevated rounded-xl border border-border-subtle p-3 text-xs text-text-muted space-y-1">
            <p className="font-semibold text-text-secondary">Expected columns:</p>
            <p><span className="font-medium text-text-primary">Teacher Name</span> · <span className="font-medium text-text-primary">Email</span> · <span className="font-medium text-text-primary">Phone</span> · <span className="font-medium text-text-primary">Classes</span></p>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-danger text-center">{error}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={handleSubmit} disabled={saving || teachers.length === 0}
          className="btn-primary flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
          {saving
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
            : <>Continue <CheckCircle size={16} /></>}
        </button>
        <button type="button" onClick={onDone}
          className="px-4 py-3 rounded-xl text-sm font-medium text-text-muted border border-border-default hover:text-text-primary transition-colors">
          Skip
        </button>
      </div>
    </div>
  );
}

// ─── Step 5 — Configure Students ─────────────────────────────────────────────
const EMPTY_STUDENT = { name: '', email: '', phone: '', classId: '' };

function StepStudents() {
  const setupStudents = useAuthStore((s) => s.setupStudents);
  const classes       = useAuthStore((s) => s.classes);

  const [mode,     setMode]     = useState('manual');
  const [students, setStudents] = useState([]);
  const [form,     setForm]     = useState({ ...EMPTY_STUDENT });
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const upd    = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const canAdd = form.name.trim() && form.email.trim();

  const addStudent = () => {
    if (!canAdd) return;
    setStudents((prev) => [...prev, { ...form }]);
    setForm({ ...EMPTY_STUDENT });
  };

  const removeStudent = (i) => setStudents((prev) => prev.filter((_, idx) => idx !== i));

  const parseFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb   = XLSX.read(e.target.result, { type: 'array' });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
        const parsed = rows.map((r) => ({
          name:    String(r['Student Name'] ?? r['Name']  ?? r['name']  ?? '').trim(),
          email:   String(r['Email']        ?? r['email'] ?? '').trim().toLowerCase(),
          phone:   String(r['Phone']        ?? r['phone'] ?? '').trim(),
          classId: '',
          classes: String(r['Class']        ?? r['class'] ?? '').trim(),
        })).filter((r) => r.name && r.email);
        setStudents(parsed);
        setMode('manual');
      } catch {
        setError('Could not parse file. Please use the correct format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Student Name', 'Email', 'Phone', 'Class'],
      ['Rahul Kumar',  'rahul@school.edu', '+91 98765 43210', 'Class 9A'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'students_template.xlsx');
  };

  const handleSubmit = async () => {
    setSaving(true); setError('');
    try {
      await setupStudents(students);
    } catch {
      setError('Failed to save students. Please try again.');
      setSaving(false);
    }
  };

  const className = (id) => classes.find((c) => c.id === id)?.name ?? '—';

  return (
    <div className="space-y-5">
      {/* Mode tabs */}
      <div className="flex gap-1 p-1 bg-bg-elevated rounded-xl border border-border-subtle">
        {[
          { id: 'manual', icon: Plus,           label: 'Add Manually' },
          { id: 'upload', icon: FileSpreadsheet, label: 'Upload File'  },
        ].map(({ id, icon: Icon, label }) => (
          <button key={id} type="button" onClick={() => setMode(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === id ? 'bg-accent-blue text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
            }`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {mode === 'manual' && (
        <>
          <div className="space-y-3 p-4 rounded-xl border border-border-default bg-bg-elevated/40">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Name *</label>
                <input value={form.name} onChange={(e) => upd('name', e.target.value)}
                  placeholder="Rahul Kumar" className="input-field text-sm py-2" />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Email *</label>
                <input type="email" value={form.email} onChange={(e) => upd('email', e.target.value)}
                  placeholder="rahul@school.edu" className="input-field text-sm py-2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => upd('phone', e.target.value)}
                  placeholder="+91 98765 43210" className="input-field text-sm py-2" />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Class & Section</label>
                <select value={form.classId} onChange={(e) => upd('classId', e.target.value)}
                  className="input-field text-sm py-2">
                  <option value="">Select class…</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="button" onClick={addStudent} disabled={!canAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-blue/15 border border-accent-blue/30 text-accent-blue text-sm font-medium hover:bg-accent-blue/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <Plus size={14} /> Add Student
            </button>
          </div>

          {students.length > 0 && (
            <div className="border border-border-default rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-bg-elevated border-b border-border-subtle">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  {students.length} Student{students.length !== 1 ? 's' : ''} Added
                </span>
              </div>
              <div className="divide-y divide-border-subtle max-h-48 overflow-y-auto"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border-default) transparent' }}>
                {students.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="w-8 h-8 rounded-full bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-accent-blue">
                        {s.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{s.name}</p>
                      <p className="text-xs text-text-muted truncate">{s.email}</p>
                    </div>
                    <span className="text-xs font-medium text-accent-blue bg-accent-blue/10 border border-accent-blue/20 px-2 py-0.5 rounded-lg shrink-0">
                      {s.classId ? className(s.classId) : s.classes || '—'}
                    </span>
                    <button type="button" onClick={() => removeStudent(i)}
                      className="p-1 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {mode === 'upload' && (
        <div className="space-y-3">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) parseFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragOver ? 'border-accent-blue bg-accent-blue/8 scale-[1.01]' : 'border-border-default hover:border-accent-blue/50 hover:bg-bg-elevated'
            }`}
          >
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
              onChange={(e) => { if (e.target.files[0]) parseFile(e.target.files[0]); }} />
            <FileSpreadsheet size={32} className="mx-auto mb-3 text-text-muted" />
            <p className="text-sm font-medium text-text-primary mb-1">Drop your Excel or CSV file here</p>
            <p className="text-xs text-text-muted">or click to browse · .xlsx, .xls, .csv</p>
          </div>
          <button type="button" onClick={downloadTemplate}
            className="flex items-center gap-2 text-sm text-accent-blue hover:text-accent-blue-light transition-colors mx-auto">
            <Upload size={14} /> Download template (.xlsx)
          </button>
          <div className="bg-bg-elevated rounded-xl border border-border-subtle p-3 text-xs text-text-muted space-y-1">
            <p className="font-semibold text-text-secondary">Expected columns:</p>
            <p>
              <span className="font-medium text-text-primary">Student Name</span> ·{' '}
              <span className="font-medium text-text-primary">Email</span> ·{' '}
              <span className="font-medium text-text-primary">Phone</span> ·{' '}
              <span className="font-medium text-text-primary">Class</span>
            </p>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-danger text-center">{error}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={handleSubmit} disabled={saving || students.length === 0}
          className="btn-primary flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
          {saving
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
            : <><CheckCircle size={16} /> Confirm & Enter App</>}
        </button>
        <button type="button" onClick={() => useAuthStore.getState().setupStudents([])}
          className="px-4 py-3 rounded-xl text-sm font-medium text-text-muted border border-border-default hover:text-text-primary transition-colors">
          Skip
        </button>
      </div>
    </div>
  );
}

// ─── Main Setup Flow ──────────────────────────────────────────────────────────
export default function AdminSetupFlow() {
  const [step, setStep] = useState(2);

  const stepIcons = [Building2, GraduationCap, Layers, Users, StudentIcon];

  return (
    <div className="fixed inset-0 bg-bg-primary bg-mesh overflow-y-auto">
      <div className="flex items-center justify-center p-4 min-h-full relative">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-blue/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-purple/8 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-danger to-accent-purple mb-3 shadow-glow-purple animate-pulse-glow">
              <span className="text-3xl">🛡️</span>
            </div>
            <h1 className="text-2xl font-black text-gradient mb-1 tracking-tight">Admin Setup</h1>
            <p className="text-text-muted text-sm">Complete the setup before entering the platform.</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {STEPS.map((s, i) => {
              const done   = step > s.id;
              const active = step === s.id;
              const Icon   = stepIcons[i];
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      done   ? 'bg-success/20 border border-success/40 text-success' :
                      active ? 'bg-accent-blue/20 border border-accent-blue/60 text-accent-blue shadow-glow-sm' :
                               'bg-bg-elevated border border-border-subtle text-text-muted'
                    }`}>
                      {done ? <CheckCircle size={16} /> : <Icon size={16} />}
                    </div>
                    <span className={`text-xs font-medium text-center leading-tight max-w-[64px] ${active ? 'text-accent-blue' : done ? 'text-success' : 'text-text-muted'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`h-px w-8 mb-4 transition-colors duration-300 ${step > s.id ? 'bg-success/40' : 'bg-border-subtle'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Card */}
          <div className="glass-card rounded-2xl p-7 shadow-card">
            <h2 className="text-base font-bold text-text-primary mb-5">
              Step {step} — {STEPS[step - 1].label}
            </h2>
            {step === 1 && <StepSchool   onDone={() => setStep(2)} />}
            {step === 2 && <StepClasses  onDone={() => setStep(3)} />}
            {step === 3 && <StepSubjects onDone={() => setStep(4)} />}
            {step === 4 && <StepTeachers onDone={() => setStep(5)} />}
            {step === 5 && <StepStudents />}
          </div>

          <p className="text-center text-xs text-text-muted mt-5">
            This configures your school's DoubtFix platform.
          </p>
        </div>
      </div>
    </div>
  );
}
