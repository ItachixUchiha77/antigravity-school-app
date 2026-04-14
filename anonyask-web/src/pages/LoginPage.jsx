import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/index.js';
import { DEMO_ACCOUNTS } from '../data/mockData.js';
import { BookOpen, MessageCircle, Megaphone, Users, Shield, Eye, EyeOff } from 'lucide-react';

const ROLE_ICONS = { student: '🎓', teacher: '📚', admin: '🛡️' };
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

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const login    = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!selectedRole) { setError('Please select your role to continue.'); return; }
    setLoading(true);
    setError('');

    // Simulate network delay
    await new Promise((res) => setTimeout(res, 800));

    const account = DEMO_ACCOUNTS.find((a) => a.role === selectedRole);
    login(account.userId);
    navigate('/app');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg-primary bg-mesh flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-blue/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-purple/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-accent-blue/4 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple mb-4 shadow-glow-blue animate-pulse-glow">
            <span className="text-4xl">🎭</span>
          </div>
          <h1 className="text-4xl font-black text-gradient mb-2 tracking-tight">AnonyASK</h1>
          <p className="text-text-muted text-sm">Ask anything. Learn everything. Fear nothing.</p>
        </div>

        {/* Login Card */}
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
            {/* Role Selector */}
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-3">Select your role</label>
              <div className="grid grid-cols-3 gap-3">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.role}
                    type="button"
                    id={`role-${account.role}`}
                    onClick={() => { setSelectedRole(account.role); setError(''); }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                      ${selectedRole === account.role
                        ? ROLE_ACTIVE[account.role]
                        : ROLE_COLORS[account.role]
                      }`}
                  >
                    <span className="text-2xl">{ROLE_ICONS[account.role]}</span>
                    <span className="text-xs font-semibold text-text-primary">{account.label}</span>
                  </button>
                ))}
              </div>
              {selectedRole && (
                <p className="mt-2 text-xs text-text-muted animate-fade-in">
                  {DEMO_ACCOUNTS.find(a => a.role === selectedRole)?.description}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-text-secondary text-sm font-medium mb-2">
                Email / Student ID
              </label>
              <input
                id="email"
                type="text"
                className="input-field"
                placeholder="yourname@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
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
              disabled={loading}
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
                  Sign In to AnonyASK
                </>
              )}
            </button>

            {/* Demo note */}
            <p className="text-center text-xs text-text-muted">
              🚀 Demo mode — just pick a role and sign in. Any credentials work.
            </p>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted mt-6">
          AnonyASK © 2026 · Built for Indian Schools · Privacy First 🔒
        </p>
      </div>
    </div>
  );
}
