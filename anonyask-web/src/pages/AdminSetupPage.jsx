import { useState } from 'react';
import { api } from '../api/client.js';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Globe, Phone, CheckCircle } from 'lucide-react';

const EMPTY = { schoolName: '', officialEmail: '', website: '', phone: '' };

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

export default function AdminSetupPage() {
  const [data, setData] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const update = (key, val) => setData((d) => ({ ...d, [key]: val }));
  const canSubmit = data.schoolName.trim() && data.officialEmail.trim() && data.phone.trim();

  const handleActivate = async () => {
    if (!canSubmit) { setError('Please fill in all required fields.'); return; }
    setSaving(true);
    setError('');
    try {
      await api('/school', { method: 'POST', body: data });
      navigate('/app');
    } catch (err) {
      setError('Setup failed. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

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
            <h1 className="text-2xl font-black text-gradient mb-1 tracking-tight">School Setup</h1>
            <p className="text-text-muted text-sm">Enter your school's details to activate DoubtFix.</p>
          </div>

          {/* Card */}
          <div className="glass-card rounded-2xl p-7 shadow-card space-y-5">
            <Field label="School Name" icon={Building2} required>
              <input
                type="text"
                value={data.schoolName}
                onChange={(e) => update('schoolName', e.target.value)}
                placeholder="e.g. St. Xavier's High School"
                className="input-field"
              />
            </Field>

            <Field label="Official Email" icon={Mail} required>
              <input
                type="email"
                value={data.officialEmail}
                onChange={(e) => update('officialEmail', e.target.value)}
                placeholder="principal@school.edu.in"
                className="input-field"
              />
            </Field>

            <Field label="Contact Phone" icon={Phone} required>
              <input
                type="tel"
                value={data.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className="input-field"
              />
            </Field>

            <Field label="Website" icon={Globe}>
              <input
                type="url"
                value={data.website}
                onChange={(e) => update('website', e.target.value)}
                placeholder="https://school.edu.in"
                className="input-field"
              />
            </Field>

            {error && <p className="text-sm text-danger text-center">{error}</p>}

            <button
              type="button"
              onClick={handleActivate}
              disabled={saving || !canSubmit}
              className="btn-primary w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Activating…</>
              ) : (
                <><CheckCircle size={16} /> Activate Platform</>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-text-muted mt-5">
            This information configures your school's DoubtFix platform.
          </p>
        </div>
      </div>
    </div>
  );
}
