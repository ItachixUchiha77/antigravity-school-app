import React, { useState } from 'react';
import { useAuthStore, useUIStore, useNotificationStore, useSubjectStore, useProfileStore } from '../../store/index.js';
import { CLASSES, USERS } from '../../data/mockData.js';
import { Avatar, RoleBadge } from '../ui/index.jsx';
import ProfileModal from '../profile/ProfileModal.jsx';
import {
  Hash, ChevronDown, ChevronRight,
  Bell, LogOut, Menu, X, Sun, Moon, Plus, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';

// ─── Preset colours admins can pick from ─────────────────────────────────────
const PRESET_COLORS = [
  '#3B82F6', '#22C55E', '#F59E0B', '#A855F7',
  '#EC4899', '#14B8A6', '#EF4444', '#F97316',
];

// ─── Preset emojis for channel icons ─────────────────────────────────────────
const PRESET_EMOJIS = ['📐', '🔬', '📖', '🏛️', '💻', '🗣️', '🌍', '🧪', '🎨', '🏃', '🎵', '🧮', '📚', '🌱', '⚗️', '🔭', '📊', '🗺️'];

// ─── Create Channel Modal (admin only) ───────────────────────────────────────
function CreateChannelModal({ onClose, onSubmit }) {
  const [name,  setName]  = useState('');
  const [emoji, setEmoji] = useState('📚');
  const [color, setColor] = useState('#3B82F6');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim(), emoji, color);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-card rounded-2xl w-full max-w-sm shadow-card-hover animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-subtle">
          <h2 className="font-bold text-text-primary flex items-center gap-2">
            <Hash size={16} className="text-accent-blue-light" />
            New Subject Channel
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Channel Name */}
          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">Channel name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chemistry, Geography…"
              className="input-field text-sm"
              autoFocus
              required
            />
          </div>

          {/* Emoji picker */}
          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border-2 transition-all ${
                    emoji === em
                      ? 'border-accent-blue bg-accent-blue/15'
                      : 'border-border-default hover:border-accent-blue/40 bg-bg-elevated'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">Colour</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c ? 'border-white scale-110' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-elevated border border-border-default">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
            >
              {emoji}
            </div>
            <span className="text-text-primary text-sm font-medium">{name || 'Channel name'}</span>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="btn-primary flex-1 justify-center text-sm disabled:opacity-50"
            >
              <Plus size={14} /> Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const currentUser      = useAuthStore((s) => s.currentUser);
  const logout           = useAuthStore((s) => s.logout);
  const { selectedClassId, selectedSubjectId, activeView,
          setSelectedClass, setSelectedSubject, setActiveView,
          toggleNotificationPanel, theme, toggleTheme } = useUIStore();
  const notifications    = useNotificationStore((s) => s.notifications);
  const visibleNotifs    = currentUser?.role === 'admin'
    ? notifications.filter((n) => {
        if (n.type === 'announcement') return true;
        if (n.type === 'message' && n.convId) {
          const conv = PRIVATE_MESSAGES[n.convId];
          if (!conv) return false;
          const otherId = conv.participants.find((p) => p !== currentUser.id);
          return USERS[otherId]?.role === 'teacher';
        }
        return false;
      })
    : notifications;
  const unreadCount      = visibleNotifs.filter((n) => !n.read).length;
  const { subjects, addSubject } = useSubjectStore();

  const avatars = useProfileStore((s) => s.avatars);
  const [classExpanded,   setClassExpanded]   = useState(true);
  const [mobileOpen,      setMobileOpen]      = useState(false);
  const [desktopOpen,     setDesktopOpen]     = useState(true);
  const [creatingChannel, setCreatingChannel] = useState(false);
  const [showProfile,     setShowProfile]     = useState(false);

  const myAv = avatars[currentUser?.id];

  const selectedClass = CLASSES[selectedClassId] || CLASSES.find((c) => c.id === selectedClassId);
  const isAdmin = currentUser?.role === 'admin';

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-border-subtle flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shadow-glow-sm flex-shrink-0">
            <span className="text-xl">🎭</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-black text-text-primary text-lg leading-none">DoubtFix</h1>
            <p className="text-text-muted text-[10px] mt-0.5">School Q&A Platform</p>
          </div>
          {/* Desktop collapse toggle */}
          <button
            onClick={() => setDesktopOpen(false)}
            className="hidden md:flex p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors flex-shrink-0"
            title="Close sidebar"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">

        {/* Class Selector — admins/teachers only */}
        {currentUser?.role !== 'student' && (
          <div className="px-2 mb-3">
            <select
              id="class-selector"
              value={selectedClassId}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-bg-elevated border border-border-default text-text-primary text-sm rounded-lg px-3 py-2 outline-none focus:border-accent-blue/60 cursor-pointer"
            >
              {CLASSES.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Channels Section */}
        <div className="flex items-center justify-between px-2 py-1">
          <button
            className="flex items-center gap-1 text-text-muted hover:text-text-secondary transition-colors text-xs font-semibold uppercase tracking-wider"
            onClick={() => setClassExpanded(!classExpanded)}
          >
            {classExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            Subjects — {selectedClass?.name}
          </button>
          {/* Admin-only: add channel */}
          {isAdmin && (
            <button
              id="add-channel-btn"
              onClick={() => setCreatingChannel(true)}
              title="Create new subject channel"
              className="p-1 rounded-md text-text-muted hover:text-accent-blue-light hover:bg-accent-blue/10 transition-colors"
            >
              <Plus size={14} />
            </button>
          )}
        </div>

        {classExpanded && (
          <div className="space-y-0.5 animate-fade-in">
            {subjects.map((subj) => (
              <button
                key={subj.id}
                id={`subject-${subj.id}`}
                onClick={() => { setSelectedSubject(subj.id); setMobileOpen(false); }}
                className={`channel-item w-full text-left ${activeView === 'qna' && selectedSubjectId === subj.id ? 'active' : ''}`}
              >
                <span className="text-base">{subj.emoji}</span>
                <span className="truncate">{subj.name}</span>
              </button>
            ))}
          </div>
        )}

      </div>

      {/* Bottom user section */}
      <div className="p-3 border-t border-border-subtle flex-shrink-0 bg-bg-secondary">
        <div className="flex items-center gap-3">
          {/* Clicking own avatar/name opens profile */}
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity text-left"
            title="View your profile"
          >
            <Avatar
              initials={currentUser?.initials || '?'}
              size="sm"
              role={currentUser?.role}
              emoji={myAv?.emoji ?? null}
              bgColor={myAv?.color ?? null}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-text-primary truncate">{currentUser?.name}</div>
              <RoleBadge role={currentUser?.role} />
            </div>
          </button>
          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {/* Notifications */}
            <button
              id="notification-bell"
              onClick={toggleNotificationPanel}
              className="relative p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
              title="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="notification-dot">{unreadCount}</span>
              )}
            </button>
            {/* Logout */}
            <button
              id="logout-btn"
              onClick={logout}
              className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-bg-secondary border-r border-border-subtle h-screen flex-shrink-0 transition-all duration-300 overflow-hidden ${
          desktopOpen ? 'w-64' : 'w-0 border-r-0'
        }`}
      >
        <div className="w-64 flex flex-col h-full">
          {sidebarContent}
        </div>
      </aside>

      {/* Desktop re-open button (visible when sidebar is closed) */}
      <button
        onClick={() => setDesktopOpen(true)}
        className={`hidden md:flex fixed top-3 left-3 z-40 p-2 bg-bg-secondary border border-border-default rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-elevated shadow-card transition-all duration-900 ${
          desktopOpen ? 'opacity-0 pointer-events-none -translate-x-1' : 'opacity-100 pointer-events-auto translate-x-0'
        }`}
        title="Open sidebar"
      >
        <PanelLeftOpen size={18} />
      </button>

      {/* Mobile: hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-bg-secondary border border-border-default rounded-xl text-text-primary"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} />
      </button>

      {/* Mobile: overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-72 bg-bg-secondary h-full flex flex-col shadow-xl">
            <div className="absolute top-4 right-4">
              <button onClick={() => setMobileOpen(false)} className="text-text-muted hover:text-text-primary">
                <X size={20} />
              </button>
            </div>
            {sidebarContent}
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Admin: create channel modal */}
      {creatingChannel && (
        <CreateChannelModal
          onClose={() => setCreatingChannel(false)}
          onSubmit={addSubject}
        />
      )}

      {/* Own profile modal */}
      {showProfile && currentUser && (
        <ProfileModal
          userId={currentUser.id}
          onClose={() => setShowProfile(false)}
          onMessage={(convId) => setSelectedConv(convId)}
        />
      )}
    </>
  );
}
