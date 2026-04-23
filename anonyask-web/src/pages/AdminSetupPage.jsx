import { useState } from 'react';
import { api } from '../api/client.js';
import { useNavigate } from 'react-router-dom';
import {
  School, MapPin, Phone, BookOpen, CheckCircle,
  ChevronRight, ChevronLeft, Building2, GraduationCap,
  Mail, Globe, Hash, Calendar, Layers, Upload, X,
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'School Identity', icon: School },
  { id: 2, label: 'Location & Contact', icon: MapPin },
  { id: 3, label: 'Academic Setup', icon: BookOpen },
  { id: 4, label: 'Review & Confirm', icon: CheckCircle },
];

const BOARDS = ['CBSE', 'ICSE', 'IGCSE', 'State Board (Maharashtra)', 'State Board (UP)', 'State Board (Karnataka)', 'State Board (Tamil Nadu)', 'Other'];
const SCHOOL_TYPES = ['Primary (Class 1–5)', 'Middle School (Class 6–8)', 'Secondary (Class 1–10)', 'Senior Secondary (Class 1–12)', 'Junior College (Class 11–12)'];
const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand',
  'West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry','Chandigarh',
];
const CLASS_NUMS = Array.from({ length: 12 }, (_, i) => i + 1);
const SECTIONS = ['A only', 'A & B', 'A, B & C', 'A, B, C & D', 'A–E (5 sections)'];
const CURRENT_YEAR = new Date().getFullYear();
const ACADEMIC_YEARS = [`${CURRENT_YEAR - 1}–${String(CURRENT_YEAR).slice(2)}`, `${CURRENT_YEAR}–${String(CURRENT_YEAR + 1).slice(2)}`, `${CURRENT_YEAR + 1}–${String(CURRENT_YEAR + 2).slice(2)}`];

const EMPTY = {
  schoolName: '', motto: '', board: '', schoolType: '', logoDataUrl: '',
  address: '', city: '', state: '', pinCode: '', phone: '', officialEmail: '', website: '',
  academicYear: ACADEMIC_YEARS[1], classFrom: 1, classTo: 12, sections: 'A, B & C',
};

function Field({ label, icon: Icon, children, required }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-text-secondary text-sm font-medium mb-2">
        {Icon && <Icon size={14} className="text-accent-blue" />}
        {label}
        {required && <span className="text-danger">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', ...rest }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="input-field"
      {...rest}
    />
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-field"
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((o) => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
  );
}

// ─── Logo Upload ──────────────────────────────────────────────────────────────
function LogoUpload({ value, onChange }) {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-4">
      {value ? (
        <div className="relative shrink-0">
          <img src={value} alt="School logo" className="w-20 h-20 rounded-xl object-contain bg-bg-elevated border border-border-default p-1" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-danger flex items-center justify-center shadow"
          >
            <X size={11} className="text-white" />
          </button>
        </div>
      ) : (
        <div className="w-20 h-20 rounded-xl bg-bg-elevated border-2 border-dashed border-border-default flex items-center justify-center shrink-0 text-text-muted">
          <School size={28} />
        </div>
      )}
      <div className="flex-1">
        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-default bg-bg-elevated hover:border-accent-blue hover:text-accent-blue text-text-secondary text-sm font-medium transition-colors">
          <Upload size={15} />
          {value ? 'Change Logo' : 'Upload Logo'}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
        <p className="text-xs text-text-muted mt-2">PNG, JPG or SVG · Recommended 256×256 px</p>
      </div>
    </div>
  );
}

// ─── Step 1: School Identity ──────────────────────────────────────────────────
function StepIdentity({ data, update }) {
  return (
    <div className="space-y-5">
      <Field label="School Logo" icon={Upload}>
        <LogoUpload value={data.logoDataUrl} onChange={(v) => update('logoDataUrl', v)} />
      </Field>
      <Field label="School Name" icon={Building2} required>
        <Input value={data.schoolName} onChange={(v) => update('schoolName', v)} placeholder="e.g. St. Xavier's High School" />
      </Field>
      <Field label="School Motto / Tagline" icon={GraduationCap}>
        <Input value={data.motto} onChange={(v) => update('motto', v)} placeholder="e.g. Knowledge is Power" />
      </Field>
      <Field label="Education Board" icon={BookOpen} required>
        <Select value={data.board} onChange={(v) => update('board', v)} options={BOARDS} placeholder="Select board…" />
      </Field>
      <Field label="School Type" icon={Layers} required>
        <Select value={data.schoolType} onChange={(v) => update('schoolType', v)} options={SCHOOL_TYPES} placeholder="Select school type…" />
      </Field>
    </div>
  );
}

// ─── Step 2: Location & Contact ───────────────────────────────────────────────
function StepContact({ data, update }) {
  return (
    <div className="space-y-5">
      <Field label="Street / Building Address" icon={MapPin} required>
        <textarea
          value={data.address}
          onChange={(e) => update('address', e.target.value)}
          placeholder="e.g. Plot 14, Sector 9, Dwarka"
          rows={2}
          className="input-field resize-none"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="City" required>
          <Input value={data.city} onChange={(v) => update('city', v)} placeholder="e.g. New Delhi" />
        </Field>
        <Field label="PIN Code" icon={Hash}>
          <Input value={data.pinCode} onChange={(v) => update('pinCode', v)} placeholder="e.g. 110001" type="text" maxLength={6} />
        </Field>
      </div>
      <Field label="State" icon={MapPin} required>
        <Select value={data.state} onChange={(v) => update('state', v)} options={INDIAN_STATES} placeholder="Select state…" />
      </Field>
      <Field label="Phone Number" icon={Phone} required>
        <Input value={data.phone} onChange={(v) => update('phone', v)} placeholder="e.g. +91 98765 43210" type="tel" />
      </Field>
      <Field label="Official Email" icon={Mail} required>
        <Input value={data.officialEmail} onChange={(v) => update('officialEmail', v)} placeholder="e.g. principal@school.edu.in" type="email" />
      </Field>
      <Field label="Website (optional)" icon={Globe}>
        <Input value={data.website} onChange={(v) => update('website', v)} placeholder="e.g. https://stxaviers.edu.in" />
      </Field>
    </div>
  );
}

// ─── Step 3: Academic Setup ───────────────────────────────────────────────────
function StepAcademic({ data, update }) {
  return (
    <div className="space-y-5">
      <Field label="Academic Year" icon={Calendar} required>
        <Select value={data.academicYear} onChange={(v) => update('academicYear', v)} options={ACADEMIC_YEARS} placeholder="Select year…" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Classes From" icon={GraduationCap} required>
          <Select
            value={data.classFrom}
            onChange={(v) => update('classFrom', Number(v))}
            options={CLASS_NUMS.map((n) => ({ value: n, label: `Class ${n}` }))}
            placeholder="From…"
          />
        </Field>
        <Field label="Classes To" icon={GraduationCap} required>
          <Select
            value={data.classTo}
            onChange={(v) => update('classTo', Number(v))}
            options={CLASS_NUMS.filter((n) => n >= data.classFrom).map((n) => ({ value: n, label: `Class ${n}` }))}
            placeholder="To…"
          />
        </Field>
      </div>
      <Field label="Sections per Class" icon={Layers} required>
        <Select value={data.sections} onChange={(v) => update('sections', v)} options={SECTIONS} placeholder="Select sections…" />
      </Field>
      <div className="bg-accent-blue/8 border border-accent-blue/20 rounded-xl p-4 text-sm text-text-secondary">
        <p className="font-medium text-text-primary mb-1">What this means</p>
        <p>
          The app will create subject channels for <strong className="text-accent-blue">Class {data.classFrom} to Class {data.classTo}</strong> with sections <strong className="text-accent-blue">{data.sections}</strong> for academic year <strong className="text-accent-blue">{data.academicYear}</strong>.
        </p>
      </div>
    </div>
  );
}

// ─── Step 4: Review ───────────────────────────────────────────────────────────
function StepReview({ data }) {
  const rows = [
    { label: 'School Name', value: data.schoolName },
    { label: 'Logo', value: data.logoDataUrl ? '__logo__' : 'Not uploaded' },
    { label: 'Motto', value: data.motto || '—' },
    { label: 'Board', value: data.board },
    { label: 'School Type', value: data.schoolType },
    { label: 'Address', value: `${data.address}, ${data.city}, ${data.state} – ${data.pinCode}` },
    { label: 'Phone', value: data.phone },
    { label: 'Email', value: data.officialEmail },
    { label: 'Website', value: data.website || '—' },
    { label: 'Academic Year', value: data.academicYear },
    { label: 'Classes', value: `Class ${data.classFrom} to Class ${data.classTo}` },
    { label: 'Sections', value: data.sections },
  ];

  return (
    <div className="space-y-3">
      <p className="text-text-muted text-sm mb-4">Review the information below before activating the platform.</p>
      {rows.map(({ label, value }) => (
        <div key={label} className="flex items-center justify-between gap-4 py-2.5 border-b border-border-subtle last:border-0">
          <span className="text-text-muted text-sm shrink-0">{label}</span>
          {value === '__logo__' ? (
            <img src={data.logoDataUrl} alt="logo" className="w-10 h-10 rounded-lg object-contain bg-bg-elevated border border-border-subtle p-0.5" />
          ) : (
            <span className="text-text-primary text-sm text-right font-medium">{value}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(step, data) {
  if (step === 1) return data.schoolName.trim() && data.board && data.schoolType;
  if (step === 2) return data.address.trim() && data.city.trim() && data.state && data.phone.trim() && data.officialEmail.trim();
  if (step === 3) return data.academicYear && data.classFrom && data.classTo && data.sections && data.classFrom <= data.classTo;
  return true;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminSetupPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const update = (key, val) => setData((d) => ({ ...d, [key]: val }));
  const canNext = validate(step, data);

  const handleNext = () => { if (canNext && step < 4) setStep((s) => s + 1); };
  const handleBack = () => { if (step > 1) setStep((s) => s - 1); };

  const handleActivate = async () => {
    setSaving(true);
    try {
      await api('/school', { method: 'POST', body: data });
      navigate('/app');
    } catch (err) {
      console.error('Setup failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const StepContent = [null, StepIdentity, StepContact, StepAcademic, StepReview][step];

  return (
    <div className="fixed inset-0 bg-bg-primary bg-mesh overflow-y-auto">
      <div className="flex items-start justify-center p-4 py-12 min-h-full relative">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-blue/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-purple/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-danger to-accent-purple mb-4 shadow-glow-purple animate-pulse-glow">
            <span className="text-4xl">🛡️</span>
          </div>
          <h1 className="text-3xl font-black text-gradient mb-1 tracking-tight">School Setup</h1>
          <p className="text-text-muted text-sm">Configure your school before activating DoubtFix</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between mb-6 px-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`flex flex-col items-center gap-1`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    done    ? 'bg-success/20 border border-success/40 text-success' :
                    active  ? 'bg-accent-blue/20 border border-accent-blue/60 text-accent-blue shadow-glow-sm' :
                              'bg-bg-elevated border border-border-subtle text-text-muted'
                  }`}>
                    {done ? <CheckCircle size={16} /> : <Icon size={16} />}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${active ? 'text-accent-blue' : done ? 'text-success' : 'text-text-muted'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px flex-1 mx-1 mb-4 transition-colors duration-300 ${step > s.id ? 'bg-success/40' : 'bg-border-subtle'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 shadow-card">
          <h2 className="text-lg font-bold text-text-primary mb-6">
            Step {step} — {STEPS[step - 1].label}
          </h2>

          <StepContent data={data} update={update} />

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-subtle">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} /> Back
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canNext}
                className="btn-primary px-6 py-2.5 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleActivate}
                disabled={saving}
                className="btn-primary px-6 py-2.5 rounded-xl text-sm"
              >
                {saving ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Activating…</>
                ) : (
                  <><CheckCircle size={16} /> Activate Platform</>
                )}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          This information is saved to the database and used to configure your school's DoubtFix platform.
        </p>
      </div>
    </div>
    </div>
  );
}
