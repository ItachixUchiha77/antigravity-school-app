import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/index.js';
import { BookOpen, MessageCircle, Megaphone, Users, Eye, EyeOff } from 'lucide-react';

const DEMO = [
  { role: 'student', label: 'Student',   email: 's001@school.com', description: 'Ask questions anonymously, chat with teachers' },
  { role: 'teacher', label: 'Teacher',   email: 't001@school.com', description: 'Answer questions, post announcements & quizzes' },
  { role: 'admin',   label: 'Principal', email: 'admin@school.com', description: 'Manage the school, view all activity' },
];

const ROLE_COLORS = {
  student: 'border-accent-blue/40 hover:border-accent-blue bg-accent-blue/5',
  teacher: 'border-amber-500/40 hover:border-amber-400 bg-amber-500/5',
  admin:   'border-danger/40 hover:border-danger bg-danger/5',
};
const ROLE_ACTIVE = {
  student: 'border-accent-blue bg-accent-blue/15 shadow-glow-blue',
  teacher: 'border-amber-400 bg-amber-500/15',
  admin:   'border-danger bg-danger/15',
};
const ROLE_ICONS = { student: '🎓', teacher: '📚', admin: '🛡️' };

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPass,     setShowPass]     = useState(false);

  const { loginWithCredentials, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const pickRole = (role) => {
    const demo = DEMO.find((d) => d.role === role);
    setSelectedRole(role);
    setEmail(demo.email);
    setPassword('password123');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    const ok = await loginWithCredentials(email.trim(), password);
    if (ok) navigate('/app');
  };

  return (
    <div className="min-h-screen bg-bg-primary bg-mesh flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-blue/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-purple/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-accent-blue/4 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple mb-4 shadow-glow-blue animate-pulse-glow">
            <span className="text-4xl">🎭</span>
          </div>
          <h1 className="text-4xl font-black text-gradient mb-2 tracking-tight">DoubtFix</h1>
          <p className="text-text-muted text-sm">Ask anything. Learn everything. Fear nothing.</p>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-card">
          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {[
              { icon: <MessageCircle size={12} />, text: 'Anonymous Q&A' },
              { icon: <Megaphone size={12} />, text: 'Announcements' },
              { icon: <Users size={12} />, text: 'Private Chat' },
            ].map((f) => (
              <span key={f.text} className="flex items-center gap-1.5 text-xs text-text-muted bg-bg-elevated px-3 py-1.5 rounded-full border border-border-subtle">
                {f.icon} {f.text}
              </span>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Role quick-select */}
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-3">
                Quick demo — pick a role
              </label>
              <div className="grid grid-cols-3 gap-3">
                {DEMO.map((d) => (
                  <button
                    key={d.role}
                    type="button"
                    onClick={() => pickRole(d.role)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      selectedRole === d.role ? ROLE_ACTIVE[d.role] : ROLE_COLORS[d.role]
                    }`}
                  >
                    <span className="text-2xl">{ROLE_ICONS[d.role]}</span>
                    <span className="text-xs font-semibold text-text-primary">{d.label}</span>
                  </button>
                ))}
              </div>
              {selectedRole && (
                <p className="mt-2 text-xs text-text-muted animate-fade-in">
                  {DEMO.find((d) => d.role === selectedRole)?.description}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-text-secondary text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="text"
                className="input-field"
                placeholder="yourname@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-text-secondary text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-danger/10 border border-danger/30 text-danger text-sm px-4 py-3 rounded-xl animate-fade-in">
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="login-btn"
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="btn-primary w-full justify-center text-base py-3 rounded-xl"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <BookOpen size={18} />
                  Sign In to DoubtFix
                </>
              )}
            </button>

            <p className="text-center text-xs text-text-muted">
              Pick a role above to auto-fill demo credentials, or enter your own.
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          DoubtFix © 2026 · Built for Indian Schools · Privacy First 🔒
        </p>
      </div>
    </div>
  );
}
