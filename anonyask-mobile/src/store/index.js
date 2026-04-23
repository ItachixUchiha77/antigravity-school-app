import { create } from 'zustand';
import { api, setToken, clearToken, getToken } from '../api/client.js';

// ── Auth ─────────────────────────────────────────────────────────────────────
export const useAuthStore = create((set) => ({
  currentUser: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await api('/auth/login', { method: 'POST', body: { email, password } });
      await setToken(token);
      set({ currentUser: user, loading: false });
    } catch (e) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  logout: async () => {
    await clearToken();
    set({ currentUser: null });
  },

  restoreSession: async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const user = await api('/auth/me');
      set({ currentUser: user });
    } catch {
      await clearToken();
    }
  },
}));

// ── Q&A ──────────────────────────────────────────────────────────────────────
export const useQAStore = create((set, get) => ({
  questions: [],
  loading: false,

  fetchQuestions: async (classId) => {
    set({ loading: true });
    try {
      const questions = await api(`/questions?classId=${classId}`);
      set({ questions, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  askQuestion: async (classId, subjectId, text) => {
    const q = await api('/questions', { method: 'POST', body: { classId, subjectId, text } });
    set((s) => ({ questions: [q, ...s.questions] }));
    return q;
  },

  upvote: async (questionId) => {
    const q = await api(`/questions/${questionId}/upvote`, { method: 'POST' });
    set((s) => ({ questions: s.questions.map((x) => x.id === q.id ? q : x) }));
  },

  answerQuestion: async (questionId, answer) => {
    const q = await api(`/questions/${questionId}/answer`, { method: 'PATCH', body: { answer } });
    set((s) => ({ questions: s.questions.map((x) => x.id === q.id ? q : x) }));
  },
}));

// ── Announcements ─────────────────────────────────────────────────────────────
export const useAnnouncementStore = create((set) => ({
  announcements: [],
  loading: false,

  fetchAnnouncements: async () => {
    set({ loading: true });
    try {
      const announcements = await api('/announcements');
      set({ announcements, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  postAnnouncement: async (data) => {
    const a = await api('/announcements', { method: 'POST', body: data });
    set((s) => ({ announcements: [a, ...s.announcements] }));
  },
}));

// ── Notifications ─────────────────────────────────────────────────────────────
export const useNotificationStore = create((set) => ({
  notifications: [],

  fetchNotifications: async () => {
    try {
      const notifications = await api('/notifications');
      set({ notifications });
    } catch { /* silent */ }
  },

  markRead: (id) => set((s) => ({
    notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
  })),

  markAllRead: async () => {
    await api('/notifications/read-all', { method: 'PATCH' });
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
  },
}));

// ── Chat ──────────────────────────────────────────────────────────────────────
export const useChatStore = create((set) => ({
  conversations: [],
  messages: {},

  fetchConversations: async () => {
    try {
      const conversations = await api('/conversations');
      set({ conversations });
    } catch { /* silent */ }
  },

  fetchMessages: async (convId) => {
    const msgs = await api(`/conversations/${convId}/messages`);
    set((s) => ({ messages: { ...s.messages, [convId]: msgs } }));
  },

  sendMessage: async (convId, text) => {
    const msg = await api(`/conversations/${convId}/messages`, {
      method: 'POST', body: { type: 'text', text },
    });
    set((s) => ({
      messages: { ...s.messages, [convId]: [...(s.messages[convId] || []), msg] },
    }));
  },

  startConversation: async (userId) => {
    const { convId } = await api('/conversations', { method: 'POST', body: { userId } });
    return convId;
  },
}));

// ── Subject store ─────────────────────────────────────────────────────────────
export const useSubjectStore = create((set) => ({
  subjects: [],

  fetchSubjects: async () => {
    try {
      const subjects = await api('/subjects');
      set({ subjects });
    } catch { /* silent */ }
  },
}));
