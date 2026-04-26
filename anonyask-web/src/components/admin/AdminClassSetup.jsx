import { useState } from 'react';
import { GraduationCap, Layers, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/index.js';

const CLASS_NUMS = Array.from({ length: 12 }, (_, i) => i + 1);

const SECTIONS_OPTIONS = [
  { value: 'A only',           label: 'A only',           letters: ['A'] },
  { value: 'A & B',            label: 'A & B',            letters: ['A', 'B'] },
  { value: 'A, B & C',         label: 'A, B & C',         letters: ['A', 'B', 'C'] },
  { value: 'A, B, C & D',      label: 'A, B, C & D',      letters: ['A', 'B', 'C', 'D'] },
  { value: 'A–E (5 sections)', label: 'A–E (5 sections)', letters: ['A', 'B', 'C', 'D', 'E'] },
];

export default function AdminClassSetup() {
  const setupClasses = useAuthStore((s) => s.setupClasses);

  const [classFrom, setClassFrom] = useState(1);
  const [classTo,   setClassTo]   = useState(10);
  const [sections,  setSections]  = useState('A only');
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  const sectionLetters = SECTIONS_OPTIONS.find((s) => s.value === sections)?.letters ?? ['A'];
  const totalClasses   = (classTo - classFrom + 1) * sectionLetters.length;

  // Preview: first few + last few class names
  const allNames = [];
  for (let g = classFrom; g <= classTo; g++) {
    for (const s of sectionLetters) allNames.push(`Class ${g}${s}`);
  }
  const preview = allNames.length <= 6
    ? allNames
    : [...allNames.slice(0, 3), '…', ...allNames.slice(-2)];

  const handleSubmit = async () => {
    if (classFrom > classTo) { setError('From class must be ≤ To class.'); return; }
    setSaving(true);
    setError('');
    try {
      await setupClasses(classFrom, classTo, sections);
    } catch (err) {
      setError('Failed to create classes. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-bg-primary bg-mesh z-50 flex items-center justify-center p-4">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-blue/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-purple/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple mb-3 shadow-glow-blue animate-pulse-glow">
            <GraduationCap size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-gradient mb-1 tracking-tight">Configure Classes</h1>
          <p className="text-text-muted text-sm">Set the class range your school offers.</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-7 shadow-card space-y-6">

          {/* From / To */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-text-secondary text-sm font-medium mb-2">
                <GraduationCap size={13} className="text-accent-blue" />
                From Class <span className="text-danger">*</span>
              </label>
              <select
                value={classFrom}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setClassFrom(v);
                  if (v > classTo) setClassTo(v);
                }}
                className="input-field"
              >
                {CLASS_NUMS.map((n) => (
                  <option key={n} value={n}>Class {n}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-text-secondary text-sm font-medium mb-2">
                <GraduationCap size={13} className="text-accent-blue" />
                To Class <span className="text-danger">*</span>
              </label>
              <select
                value={classTo}
                onChange={(e) => setClassTo(Number(e.target.value))}
                className="input-field"
              >
                {CLASS_NUMS.filter((n) => n >= classFrom).map((n) => (
                  <option key={n} value={n}>Class {n}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sections */}
          <div>
            <label className="flex items-center gap-1.5 text-text-secondary text-sm font-medium mb-2">
              <Layers size={13} className="text-accent-blue" />
              Sections per Class <span className="text-danger">*</span>
            </label>
            <select
              value={sections}
              onChange={(e) => setSections(e.target.value)}
              className="input-field"
            >
              {SECTIONS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Preview */}
          <div className="bg-accent-blue/8 border border-accent-blue/20 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Preview — {totalClasses} {totalClasses === 1 ? 'class' : 'classes'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {preview.map((name, i) => (
                name === '…'
                  ? <span key="ellipsis" className="text-text-muted text-sm px-1">…</span>
                  : (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-lg bg-accent-blue/15 border border-accent-blue/25 text-accent-blue text-xs font-medium"
                    >
                      {name}
                    </span>
                  )
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-danger text-center">{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="btn-primary w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating Classes…</>
            ) : (
              <><CheckCircle size={16} /> Confirm & Continue</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
