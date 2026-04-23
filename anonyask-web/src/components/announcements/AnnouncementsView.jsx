import React, { useState } from 'react';
import { useAuthStore, useAnnouncementStore, useUIStore } from '../../store/index.js';
import { USERS, CLASSES } from '../../data/mockData.js';
import { Avatar, PriorityTag, Timestamp, EmptyState } from '../ui/index.jsx';
import { Plus, Pin, X, Send, Megaphone } from 'lucide-react';

// ─── Announcement Card ────────────────────────────────────────────────────────
function AnnouncementCard({ ann }) {
  const [expanded, setExpanded] = useState(false);
  const poster  = USERS[ann.postedBy];
  const cls     = CLASSES.find((c) => c.id === ann.classId);

  const priorityBorder = {
    urgent:    'announcement-urgent',
    important: 'announcement-important',
    general:   'announcement-general',
  };

  return (
    <div className={`glass-card rounded-2xl p-5 transition-all duration-200 hover:shadow-card-hover animate-slide-up ${priorityBorder[ann.priority]}`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar initials={poster?.initials || '?'} size="md" role={poster?.role} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-text-primary text-sm">{poster?.name}</span>
            <PriorityTag priority={ann.priority} />
            {ann.pinned && (
              <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                <Pin size={11} /> Pinned
              </span>
            )}
            {cls && (
              <span className="text-xs text-text-muted bg-bg-elevated border border-border-subtle px-2 py-0.5 rounded-full">
                📌 {cls.name}
              </span>
            )}
            {!ann.classId && (
              <span className="text-xs text-text-muted bg-bg-elevated border border-border-subtle px-2 py-0.5 rounded-full">
                🏫 School-wide
              </span>
            )}
          </div>
          <Timestamp date={ann.createdAt} />
        </div>
      </div>

      {/* Title */}
      <h3 className="font-bold text-text-primary text-base mb-2">{ann.title}</h3>

      {/* Content */}
      <div className={`text-text-secondary text-sm leading-relaxed whitespace-pre-line ${!expanded && 'line-clamp-3'}`}>
        {ann.content}
      </div>

      {ann.content.length > 150 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-accent-blue-light text-xs hover:text-accent-blue-light/80 transition-colors"
        >
          {expanded ? 'Show less ↑' : 'Read more ↓'}
        </button>
      )}
    </div>
  );
}

// ─── Compose Modal ────────────────────────────────────────────────────────────
function ComposeModal({ onClose, onSubmit, selectedClassId }) {
  const [title,       setTitle]       = useState('');
  const [content,     setContent]     = useState('');
  const [priority,    setPriority]    = useState('general');
  const [classTarget, setClassTarget] = useState(selectedClassId || '');
  const [loading,     setLoading]     = useState(false);
  const submittingRef = React.useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    try {
      await onSubmit(classTarget || null, title.trim(), content.trim(), priority);
      onClose();
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-card rounded-2xl w-full max-w-lg shadow-card-hover animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-border-subtle">
          <h2 className="font-bold text-text-primary flex items-center gap-2">
            <Megaphone size={18} className="text-accent-blue" />
            New Announcement
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">Priority</label>
            <div className="flex gap-2">
              {['general', 'important', 'urgent'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    priority === p
                      ? p === 'urgent'   ? 'bg-danger/20 border-danger text-danger'
                      : p === 'important' ? 'bg-warning/20 border-warning text-warning'
                      : 'bg-success/20 border-success text-success'
                      : 'bg-bg-elevated border-border-default text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {p === 'urgent' ? '🔴' : p === 'important' ? '🟡' : '🟢'} {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">Target</label>
            <select
              value={classTarget}
              onChange={(e) => setClassTarget(e.target.value)}
              className="input-field text-sm"
            >
              <option value="">🏫 School-wide (all classes)</option>
              {CLASSES.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement title..."
              className="input-field text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your announcement..."
              className="input-field text-sm resize-none min-h-[140px]"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading || !title.trim() || !content.trim()} className="btn-primary flex-1 justify-center">
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Send size={14} /> Post Announcement</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Announcements View ──────────────────────────────────────────────────
export default function AnnouncementsView() {
  const currentUser   = useAuthStore((s) => s.currentUser);
  const { selectedClassId } = useUIStore();
  const { announcements, addAnnouncement } = useAnnouncementStore();
  const [composing, setComposing] = useState(false);

  const canPost = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

  const filtered = announcements
    .filter((ann) => {
      if (!ann.classId) return true;
      return ann.classId === selectedClassId;
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return b.pinned - a.pinned;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle bg-bg-secondary flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-xl flex-shrink-0">
            📢
          </div>
          <div>
            <h2 className="font-bold text-text-primary text-lg">Announcements</h2>
            <p className="text-text-muted text-xs">{filtered.length} announcement{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          {canPost && (
            <button
              id="new-announcement-btn"
              onClick={() => setComposing(true)}
              className="ml-auto btn-primary text-sm py-2"
            >
              <Plus size={16} /> New
            </button>
          )}
        </div>

      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {filtered.length === 0 ? (
          <EmptyState
            icon="📢"
            title="No announcements"
            description="Nothing posted yet. Check back later!"
          />
        ) : (
          filtered.map((ann) => <AnnouncementCard key={ann.id} ann={ann} />)
        )}
      </div>

      {/* Compose Modal */}
      {composing && (
        <ComposeModal
          onClose={() => setComposing(false)}
          onSubmit={(classId, title, content, priority) =>
            addAnnouncement(classId, title, content, priority, currentUser?.id)
          }
          selectedClassId={selectedClassId}
        />
      )}
    </div>
  );
}
