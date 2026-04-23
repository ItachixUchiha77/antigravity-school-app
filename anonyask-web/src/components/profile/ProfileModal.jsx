import React, { useState } from 'react';
import {
  useAuthStore, useQAStore, useAnnouncementStore, useProfileStore, useChatStore,
} from '../../store/index.js';
import { USERS, SUBJECTS } from '../../data/mockData.js';
import { Avatar, RoleBadge } from '../ui/index.jsx';
import { X, Pencil, Check, MessageSquare } from 'lucide-react';

// ─── Config ───────────────────────────────────────────────────────────────────
const AVATAR_EMOJIS = [
  '😊', '🎓', '📚', '🌟', '🎨', '⚡', '🔥', '🌸',
  '🎯', '🦁', '🦊', '🐯', '🦋', '🌈', '🎵', '🏆',
  '💡', '🚀', '🌙', '☀️',
];

const AVATAR_COLORS = [
  '#3B82F6', '#22C55E', '#F59E0B', '#A855F7',
  '#EC4899', '#14B8A6', '#EF4444', '#F97316',
  '#8B5CF6', '#06B6D4',
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ value, label }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1 p-3 rounded-xl bg-bg-elevated border border-border-default">
      <span className="text-2xl font-black text-text-primary">{value}</span>
      <span className="text-[10px] text-text-muted text-center leading-tight">{label}</span>
    </div>
  );
}

// ─── Profile Modal ────────────────────────────────────────────────────────────
export default function ProfileModal({ userId, onClose, onMessage }) {
  const currentUser  = useAuthStore((s) => s.currentUser);
  const { avatars, setAvatar } = useProfileStore();
  const { questions }          = useQAStore();
  const { announcements }      = useAnnouncementStore();
  const { privateMessages, createConversation } = useChatStore();

  const user    = USERS[userId];
  const isOwn   = userId === currentUser?.id;
  const viewer  = currentUser;
  const savedAv = avatars[userId];

  // Local avatar edit state
  const [editingAv,  setEditingAv]  = useState(false);
  const [selEmoji,   setSelEmoji]   = useState(savedAv?.emoji  ?? null);
  const [selColor,   setSelColor]   = useState(savedAv?.color  ?? AVATAR_COLORS[0]);
  const [useEmoji,   setUseEmoji]   = useState(!!savedAv?.emoji);

  if (!user) return null;

  // ── Stats ──────────────────────────────────────────────────────────────────
  const myQuestions     = questions.filter((q) => q.askedBy === userId);
  const answeredByMe    = questions.filter((q) => q.answeredBy === userId);
  const myAnnouncements = announcements.filter((a) => a.postedBy === userId);
  const upvotesReceived = myQuestions.reduce((s, q) => s + q.upvotes, 0);
  const answersReceived = myQuestions.filter((q) => q.answered).length;

  // Visibility: other students cannot see "questions asked"
  const canSeeQuestionsAsked =
    isOwn || viewer?.role === 'teacher' || viewer?.role === 'admin';

  const stats = [];
  if (user.role === 'student') {
    if (canSeeQuestionsAsked) stats.push({ value: myQuestions.length,  label: 'Questions\nAsked' });
    stats.push({ value: upvotesReceived, label: 'Upvotes\nReceived' });
    stats.push({ value: answersReceived, label: 'Answers\nReceived' });
  } else if (user.role === 'teacher') {
    stats.push({ value: answeredByMe.length,    label: 'Questions\nAnswered' });
    stats.push({ value: myAnnouncements.length, label: 'Announcements\nPosted' });
  } else {
    stats.push({ value: myAnnouncements.length, label: 'Announcements\nPosted' });
  }

  // ── DM link ────────────────────────────────────────────────────────────────
  const convId = !isOwn
    ? Object.entries(privateMessages).find(
        ([, conv]) =>
          conv.participants.includes(currentUser?.id) &&
          conv.participants.includes(userId)
      )?.[0] ?? null
    : null;

  const handleMessage = async () => {
    const id = convId ?? await createConversation(currentUser.id, userId);
    if (id) { onMessage(id); onClose(); }
  };

  // ── Avatar save ────────────────────────────────────────────────────────────
  const handleSaveAvatar = () => {
    setAvatar(userId, useEmoji ? selEmoji : null, selColor);
    setEditingAv(false);
  };

  const handleCancelAvatar = () => {
    setSelEmoji(savedAv?.emoji ?? null);
    setSelColor(savedAv?.color ?? AVATAR_COLORS[0]);
    setUseEmoji(!!savedAv?.emoji);
    setEditingAv(false);
  };

  // Current resolved avatar props
  const avEmoji   = savedAv?.emoji  ?? null;
  const avColor   = savedAv?.color  ?? null;

  // Subject chips for teachers
  const teacherSubjects = user.role === 'teacher'
    ? (user.subjects || []).map((sid) => SUBJECTS.find((s) => s.id === sid)).filter(Boolean)
    : [];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-card rounded-2xl w-full max-w-sm shadow-card-hover animate-slide-up overflow-hidden">

        {/* Close */}
        <div className="flex justify-end p-4 pb-0">
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {/* Avatar + name */}
        <div className="flex flex-col items-center px-6 pb-5 gap-3">
          <div className="relative">
            <Avatar
              initials={user.initials}
              size="xl"
              role={user.role}
              emoji={avEmoji}
              bgColor={avColor}
            />
            {isOwn && !editingAv && (
              <button
                onClick={() => setEditingAv(true)}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent-blue border-2 border-bg-secondary flex items-center justify-center text-white hover:bg-accent-blue-light transition-colors"
                title="Edit avatar"
              >
                <Pencil size={10} />
              </button>
            )}
          </div>

          <div className="text-center">
            <h2 className="font-black text-text-primary text-lg leading-tight">{user.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
              <RoleBadge role={user.role} />
              {user.role === 'student' && user.classId && (
                <span className="text-xs text-text-muted bg-bg-elevated border border-border-default px-2 py-0.5 rounded-full">
                  📌 Class {user.classId.replace('cls-', '').toUpperCase()}
                </span>
              )}
              {teacherSubjects.map((s) => (
                <span
                  key={s.id}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${s.color}20`, color: s.color, border: `1px solid ${s.color}40` }}
                >
                  {s.emoji} {s.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Avatar editor (own profile only) */}
        {editingAv && (
          <div className="mx-4 mb-4 p-4 rounded-xl bg-bg-elevated border border-border-default space-y-3 animate-slide-up">
            {/* Use emoji toggle */}
            <button
              type="button"
              onClick={() => setUseEmoji((v) => !v)}
              className="flex items-center gap-3 group"
            >
              {/* Toggle track */}
              <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${
                useEmoji ? 'bg-accent-blue' : 'bg-bg-card border border-border-default'
              }`}>
                {/* Toggle thumb */}
                <div className={`absolute top-0.5 w-4 h-4 rounded-full shadow transition-all duration-200 ${
                  useEmoji
                    ? 'left-[18px] bg-white'
                    : 'left-0.5 bg-text-muted'
                }`} />
              </div>
              <span className="text-sm text-text-secondary select-none group-hover:text-text-primary transition-colors">
                Use emoji avatar
              </span>
            </button>

            {/* Emoji picker */}
            {useEmoji && (
              <div>
                <p className="text-xs text-text-muted mb-2">Pick emoji</p>
                <div className="flex flex-wrap gap-1.5">
                  {AVATAR_EMOJIS.map((em) => (
                    <button
                      key={em}
                      onClick={() => setSelEmoji(em)}
                      className={`w-8 h-8 rounded-lg text-base flex items-center justify-center border-2 transition-all ${
                        selEmoji === em
                          ? 'border-accent-blue bg-accent-blue/15'
                          : 'border-border-default hover:border-accent-blue/40 bg-bg-card'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color picker */}
            <div>
              <p className="text-xs text-text-muted mb-2">{useEmoji ? 'Background colour' : 'Avatar colour'}</p>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      selColor === c ? 'border-white scale-110' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="flex items-center gap-3">
              <Avatar
                initials={user.initials}
                size="md"
                role={user.role}
                emoji={useEmoji ? selEmoji : null}
                bgColor={selColor}
              />
              <span className="text-xs text-text-muted">Preview</span>
            </div>

            {/* Save / Cancel */}
            <div className="flex gap-2">
              <button onClick={handleCancelAvatar} className="btn-secondary flex-1 justify-center text-xs py-1.5">
                Cancel
              </button>
              <button
                onClick={handleSaveAvatar}
                disabled={useEmoji && !selEmoji}
                className="btn-primary flex-1 justify-center text-xs py-1.5"
              >
                <Check size={13} /> Save
              </button>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="mx-4 border-t border-border-subtle" />

        {/* Stats */}
        <div className="p-4">
          <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mb-3">Stats</p>
          <div className="flex gap-2">
            {stats.map((s, i) => <StatCard key={i} value={s.value} label={s.label} />)}
          </div>
        </div>

        {/* Message button — always shown for other users' profiles */}
        {!isOwn && (
          <div className="px-4 pb-4">
            <button
              onClick={handleMessage}
              className="btn-primary w-full justify-center text-sm"
            >
              <MessageSquare size={15} /> Message {user.name.split(' ')[0]}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
