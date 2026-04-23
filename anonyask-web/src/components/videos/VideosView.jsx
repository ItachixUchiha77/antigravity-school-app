import React, { useState } from 'react';
import { useAuthStore, useUIStore, useVideoStore } from '../../store/index.js';
import { USERS, SUBJECTS } from '../../data/mockData.js';
import { Avatar, Timestamp, EmptyState } from '../ui/index.jsx';
import { Play, Upload, X, Video, ExternalLink } from 'lucide-react';

// Preset emojis for video thumbnails
const THUMB_EMOJIS = ['📐', '🔬', '📖', '🏛️', '💻', '🗣️', '🌍', '🧪', '🎨', '🏃', '🎵', '🧮', '📚', '🌱', '⚗️', '🔭', '📊', '🗺️', '🎬', '📹'];

// ─── Video Card ───────────────────────────────────────────────────────────────
function VideoCard({ video }) {
  const uploader = USERS[video.uploadedBy];
  const subject  = SUBJECTS.find((s) => s.id === video.subjectId);

  return (
    <div className="glass-card rounded-2xl overflow-hidden hover:shadow-card-hover transition-all duration-200 animate-slide-up flex flex-col">
      {/* Thumbnail */}
      <div
        className="flex items-center justify-center h-36 text-5xl flex-shrink-0"
        style={{ backgroundColor: subject ? `${subject.color}18` : '#1e283000', borderBottom: `1px solid ${subject?.color ?? '#fff'}22` }}
      >
        {video.thumbnail}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start gap-2 mb-2">
          <p className="text-text-primary font-semibold text-sm leading-snug flex-1">{video.title}</p>
          {video.duration && (
            <span className="text-[10px] text-text-muted bg-bg-elevated border border-border-default px-1.5 py-0.5 rounded-md flex-shrink-0">
              {video.duration}
            </span>
          )}
        </div>

        <p className="text-text-muted text-xs leading-relaxed mb-3 line-clamp-2">{video.description}</p>

        <div className="flex items-center gap-2 mt-auto">
          <Avatar initials={uploader?.initials || '?'} size="xs" role={uploader?.role} />
          <span className="text-xs text-text-muted truncate flex-1">{uploader?.name}</span>
          {subject && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: `${subject.color}20`, color: subject.color, border: `1px solid ${subject.color}40` }}
            >
              {subject.emoji} {subject.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-subtle">
          <Timestamp date={video.createdAt} />
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary ml-auto text-xs py-1.5 px-3"
          >
            <Play size={12} /> Watch <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Upload Modal (teachers only) ─────────────────────────────────────────────
function UploadModal({ onClose, onSubmit, selectedClassId }) {
  const [title,     setTitle]     = useState('');
  const [desc,      setDesc]      = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [thumb,     setThumb]     = useState('🎬');
  const [url,       setUrl]       = useState('');
  const [duration,  setDuration]  = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim() || !subjectId) return;
    onSubmit(selectedClassId, subjectId, title.trim(), desc.trim(), thumb, url.trim(), duration.trim() || '0:00');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-card rounded-2xl w-full max-w-md shadow-card-hover animate-slide-up max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border-subtle flex-shrink-0">
          <h2 className="font-bold text-text-primary flex items-center gap-2">
            <Upload size={16} className="text-accent-blue-light" /> Add Video
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Video title…" className="input-field text-sm" required autoFocus />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">Subject *</label>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="input-field text-sm" required>
              <option value="">Select subject…</option>
              {SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What will students learn from this video?" className="input-field text-sm resize-none min-h-[80px]" />
          </div>

          {/* Thumbnail emoji */}
          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">Thumbnail Icon</label>
            <div className="flex flex-wrap gap-2">
              {THUMB_EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setThumb(em)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border-2 transition-all ${
                    thumb === em
                      ? 'border-accent-blue bg-accent-blue/15'
                      : 'border-border-default hover:border-accent-blue/40 bg-bg-elevated'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* URL */}
          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">Video URL *</label>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtu.be/… or Google Drive link" className="input-field text-sm" required />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">Duration (e.g. 18:32)</label>
            <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="mm:ss" className="input-field text-sm" />
          </div>
        </form>

        <div className="p-5 border-t border-border-subtle flex-shrink-0 flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center text-sm">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !url.trim() || !subjectId}
            className="btn-primary flex-1 justify-center text-sm"
          >
            <Upload size={14} /> Add Video
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Videos View ─────────────────────────────────────────────────────────
export default function VideosView() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const { selectedClassId } = useUIStore();
  const { videos, addVideo } = useVideoStore();

  const [filterSubject, setFilterSubject] = useState('all');
  const [uploading,     setUploading]     = useState(false);

  const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

  const filtered = videos
    .filter((v) => v.classId === selectedClassId)
    .filter((v) => filterSubject === 'all' || v.subjectId === filterSubject)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle bg-bg-secondary flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center text-xl flex-shrink-0">
            🎬
          </div>
          <div>
            <h2 className="font-bold text-text-primary text-lg">Videos</h2>
            <p className="text-text-muted text-xs">{filtered.length} video{filtered.length !== 1 ? 's' : ''}</p>
          </div>

          {/* Teacher: upload button */}
          {isTeacher && (
            <button
              onClick={() => setUploading(true)}
              className="ml-auto btn-primary text-sm py-2"
            >
              <Upload size={15} /> Add Video
            </button>
          )}
        </div>

        {/* Subject filter tabs */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterSubject('all')}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              filterSubject === 'all'
                ? 'bg-accent-blue/20 border-accent-blue/40 text-accent-blue-light'
                : 'border-border-default text-text-muted hover:text-text-secondary hover:border-border-subtle bg-bg-elevated'
            }`}
          >
            All Subjects
          </button>
          {SUBJECTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setFilterSubject(s.id)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                filterSubject === s.id
                  ? 'border-opacity-60 text-white'
                  : 'border-border-default text-text-muted hover:text-text-secondary bg-bg-elevated'
              }`}
              style={filterSubject === s.id ? { backgroundColor: `${s.color}30`, borderColor: `${s.color}60`, color: s.color } : {}}
            >
              {s.emoji} {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Videos grid */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {filtered.length === 0 ? (
          <EmptyState
            icon="🎬"
            title="No videos yet"
            description={isTeacher ? 'Upload a video using the "Add Video" button to get started.' : 'No videos have been uploaded yet. Check back later!'}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((v) => <VideoCard key={v.id} video={v} />)}
          </div>
        )}
      </div>

      {/* Upload modal */}
      {uploading && (
        <UploadModal
          onClose={() => setUploading(false)}
          onSubmit={(classId, subjectId, title, desc, thumb, url, duration) =>
            addVideo(classId, subjectId, title, desc, thumb, url, duration, currentUser.id)
          }
          selectedClassId={selectedClassId}
        />
      )}
    </div>
  );
}
