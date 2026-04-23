import { create } from 'zustand';
import { api, setToken, clearToken } from '../api/client.js';
import { connectSocket, disconnectSocket, getSocket } from '../api/socket.js';
import { USERS, CLASSES, SUBJECTS } from '../data/mockData.js';

const _loadedClasses = new Set();

// ─── Auth Store ───────────────────────────────────────────────────────────────
export const useAuthStore = create((set, get) => ({
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  initializing: true,   // true until restoreSession completes
  error: null,
  school: null,

  loginWithCredentials: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await api('/auth/login', { method: 'POST', body: { email, password } });
      setToken(token);
      set({ currentUser: user, isAuthenticated: true, loading: false });
      await get()._initApp(user);
      const socket = connectSocket(token);
      bindSocketEvents(socket);
      return true;
    } catch (err) {
      set({ loading: false, error: err.message });
      return false;
    }
  },

  restoreSession: async () => {
    const token = localStorage.getItem('doubtfix_token');
    if (!token) { set({ initializing: false }); return; }
    try {
      const user = await api('/auth/me');
      set({ currentUser: user, isAuthenticated: true });
      await get()._initApp(user);
      const socket = connectSocket(token);
      bindSocketEvents(socket);
    } catch {
      clearToken();
    } finally {
      set({ initializing: false });
    }
  },

  _initApp: async (user) => {
    try {
      // Fetch users and classes in parallel, then subject-specific data
      const [users, classes, subjects, announcements, convs, notifications, school] = await Promise.all([
        api('/users'),
        api('/classes'),
        api('/subjects'),
        api('/announcements'),
        api('/conversations'),
        api('/notifications'),
        api('/school').catch(() => null),
      ]);

      set({ school });

      // Augment USERS lookup so components using USERS[id] see real data
      users.forEach((u) => { USERS[u.id] = u; });
      USERS[user.id] = user; // include self

      // Augment CLASSES lookup
      classes.forEach((c) => { CLASSES[c.id] = c; });

      // Augment SUBJECTS array
      subjects.forEach((s) => {
        if (!SUBJECTS.find((ex) => ex.id === s.id)) SUBJECTS.push(s);
      });

      // Update stores
      useSubjectStore.getState()._set(subjects);
      useAnnouncementStore.getState()._set(announcements);
      useNotificationStore.getState()._set(notifications);
      useChatStore.getState()._setConversations(convs, user.id);

      // Determine classId to fetch class-specific data
      const classId = user.classId || classes[0]?.id;
      if (classId) {
        const [questions, groupMsgs, videos] = await Promise.all([
          api(`/questions?classId=${classId}`),
          api(`/group-messages/${classId}`),
          api(`/videos?classId=${classId}`),
        ]);

        useQAStore.getState()._set(questions);
        useChatStore.getState()._setGroupMessages(classId, groupMsgs);
        useVideoStore.getState()._set(videos);
        _loadedClasses.add(classId);

        // Set initial class/subject selection to real IDs
        useUIStore.getState().setSelectedClass(classId);
        if (subjects[0]) useUIStore.setState({ selectedSubjectId: subjects[0].id });
      }
    } catch (err) {
      console.error('initApp failed:', err);
    }
  },

  logout: () => {
    clearToken();
    disconnectSocket();
    set({ currentUser: null, isAuthenticated: false, error: null });
  },
}));

// ─── UI Store ─────────────────────────────────────────────────────────────────
export const useUIStore = create((set) => ({
  selectedClassId: null,
  selectedSubjectId: null,
  activeView: 'qna',
  selectedConvId: null,
  notificationPanelOpen: false,
  theme: 'dark',

  setSelectedClass: (classId) => {
    set({ selectedClassId: classId, activeView: 'qna' });
    getSocket()?.emit('join:class', classId);
  },
  setSelectedSubject: (subjectId) => set({ selectedSubjectId: subjectId, activeView: 'qna' }),
  setActiveView: (view) => set({ activeView: view }),
  setSelectedConv: (convId) => set({ selectedConvId: convId, activeView: 'private-chat' }),
  toggleNotificationPanel: () => set((state) => ({ notificationPanelOpen: !state.notificationPanelOpen })),
  closeNotificationPanel: () => set({ notificationPanelOpen: false }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
}));

// ─── Q&A Store ────────────────────────────────────────────────────────────────
export const useQAStore = create((set) => ({
  questions: [],

  _set: (qs) => set({ questions: qs }),
  _merge: (qs) => set((s) => {
    const ids = new Set(s.questions.map((q) => q.id));
    const fresh = qs.filter((q) => !ids.has(q.id));
    return fresh.length ? { questions: [...s.questions, ...fresh] } : s;
  }),
  _add: (q) => set((s) => {
    if (s.questions.some((x) => x.id === q.id)) return s;
    return { questions: [q, ...s.questions] };
  }),
  _update: (q) => set((s) => ({ questions: s.questions.map((x) => (x.id === q.id ? q : x)) })),

  addQuestion: async (classId, subjectId, text) => {
    try {
      const q = await api('/questions', { method: 'POST', body: { classId, subjectId, text } });
      get()._add(q);
    } catch (err) {
      console.error('addQuestion failed:', err);
    }
  },

  upvoteQuestion: async (questionId) => {
    try {
      const updated = await api(`/questions/${questionId}/upvote`, { method: 'POST' });
      set((s) => ({ questions: s.questions.map((q) => (q.id === questionId ? updated : q)) }));
    } catch (err) {
      console.error('upvoteQuestion failed:', err);
    }
  },

  answerQuestion: async (questionId, answerText) => {
    try {
      const updated = await api(`/questions/${questionId}/answer`, { method: 'PATCH', body: { answer: answerText } });
      set((s) => ({ questions: s.questions.map((q) => (q.id === questionId ? updated : q)) }));
    } catch (err) {
      console.error('answerQuestion failed:', err);
    }
  },

  markAnswered: async (questionId) => {
    try {
      const updated = await api(`/questions/${questionId}/mark-answered`, { method: 'PATCH' });
      set((s) => ({ questions: s.questions.map((q) => (q.id === questionId ? updated : q)) }));
    } catch (err) {
      console.error('markAnswered failed:', err);
    }
  },
}));

// ─── Announcements Store ──────────────────────────────────────────────────────
export const useAnnouncementStore = create((set) => ({
  announcements: [],

  _set: (anns) => set({ announcements: anns }),
  _add: (ann) => set((s) => {
    if (s.announcements.some((a) => a.id === ann.id)) return s;
    return { announcements: [ann, ...s.announcements] };
  }),

  addAnnouncement: async (classId, title, content, priority) => {
    const ann = await api('/announcements', { method: 'POST', body: { classId: classId || null, title, content, priority } });
    set((s) => {
      if (s.announcements.some((a) => a.id === ann.id)) return s;
      return { announcements: [ann, ...s.announcements] };
    });
    return ann;
  },
}));

// ─── Chat Store ───────────────────────────────────────────────────────────────
export const useChatStore = create((set, get) => ({
  // { [convId]: { participants: [id, id], messages: [], loaded: false } }
  privateMessages: {},
  // { [classId]: [...messages] }
  groupMessages: {},

  _setConversations: (convs, myId) => {
    const pm = {};
    convs.forEach((c) => {
      // Populate USERS with the other person's data
      USERS[c.other.id] = c.other;
      pm[c.convId] = {
        participants: [myId, c.other.id],
        messages: c.lastMessage ? [] : [],
        loaded: false,
      };
    });
    set({ privateMessages: pm });
  },

  _setGroupMessages: (classId, msgs) => set((s) => ({
    groupMessages: { ...s.groupMessages, [classId]: msgs },
  })),

  _addMessage: (msg) => set((s) => {
    const conv = s.privateMessages[msg.convId];
    if (!conv) return s;
    if (conv.messages.some((m) => m.id === msg.id)) return s;
    return {
      privateMessages: {
        ...s.privateMessages,
        [msg.convId]: { ...conv, messages: [...conv.messages, msg] },
      },
    };
  }),

  _addGroupMessage: (msg) => set((s) => {
    const existing = s.groupMessages[msg.classId] || [];
    if (existing.some((m) => m.id === msg.id)) return s;
    return {
      groupMessages: {
        ...s.groupMessages,
        [msg.classId]: [...existing, msg],
      },
    };
  }),

  loadGroupMessages: async (classId) => {
    if (!classId) return;
    try {
      const msgs = await api(`/group-messages/${classId}`);
      get()._setGroupMessages(classId, msgs);
    } catch (err) {
      console.error('loadGroupMessages failed:', err);
    }
  },

  loadConversationMessages: async (convId) => {
    const { privateMessages } = get();
    if (!convId || privateMessages[convId]?.loaded) return;
    try {
      const messages = await api(`/conversations/${convId}/messages`);
      set((s) => ({
        privateMessages: {
          ...s.privateMessages,
          [convId]: { ...s.privateMessages[convId], messages, loaded: true },
        },
      }));
    } catch (err) {
      console.error('loadConversationMessages failed:', err);
    }
  },

  createConversation: async (userId1, userId2) => {
    // userId1 is the current user (ignored — comes from JWT), userId2 is the other
    const otherId = userId2 || userId1;
    try {
      const { convId } = await api('/conversations', { method: 'POST', body: { userId: otherId } });
      const myId = useAuthStore.getState().currentUser?.id;
      set((s) => {
        if (s.privateMessages[convId]) return s;
        return {
          privateMessages: {
            ...s.privateMessages,
            [convId]: { participants: [myId, otherId], messages: [], loaded: true },
          },
        };
      });
      return convId;
    } catch (err) {
      console.error('createConversation failed:', err);
      return null;
    }
  },

  sendPrivateMessage: async (convId, text) => {
    const myId = useAuthStore.getState().currentUser?.id;
    const tempId = `pending_${Date.now()}`;
    // Add optimistically so the message appears instantly
    set((s) => {
      const conv = s.privateMessages[convId];
      if (!conv) return s;
      return {
        privateMessages: {
          ...s.privateMessages,
          [convId]: { ...conv, messages: [...conv.messages, { id: tempId, convId, senderId: myId, type: 'text', text, createdAt: new Date().toISOString(), read: false }] },
        },
      };
    });
    try {
      const msg = await api(`/conversations/${convId}/messages`, { method: 'POST', body: { type: 'text', text } });
      set((s) => {
        const conv = s.privateMessages[convId];
        if (!conv) return s;
        const msgs = conv.messages;
        // Socket may have already added the real message — just drop the temp
        const updated = msgs.some((m) => m.id === msg.id)
          ? msgs.filter((m) => m.id !== tempId)
          : msgs.map((m) => m.id === tempId ? msg : m);
        return { privateMessages: { ...s.privateMessages, [convId]: { ...conv, messages: updated } } };
      });
    } catch (err) {
      set((s) => {
        const conv = s.privateMessages[convId];
        if (!conv) return s;
        return { privateMessages: { ...s.privateMessages, [convId]: { ...conv, messages: conv.messages.filter((m) => m.id !== tempId) } } };
      });
      console.error('sendPrivateMessage failed:', err);
    }
  },

  sendPrivateImage: async (convId, imageUrl) => {
    const myId = useAuthStore.getState().currentUser?.id;
    const tempId = `pending_${Date.now()}`;
    set((s) => {
      const conv = s.privateMessages[convId];
      if (!conv) return s;
      return {
        privateMessages: {
          ...s.privateMessages,
          [convId]: { ...conv, messages: [...conv.messages, { id: tempId, convId, senderId: myId, type: 'image', imageUrl, createdAt: new Date().toISOString(), read: false }] },
        },
      };
    });
    try {
      const msg = await api(`/conversations/${convId}/messages`, { method: 'POST', body: { type: 'image', imageUrl } });
      set((s) => {
        const conv = s.privateMessages[convId];
        if (!conv) return s;
        const msgs = conv.messages;
        const updated = msgs.some((m) => m.id === msg.id)
          ? msgs.filter((m) => m.id !== tempId)
          : msgs.map((m) => m.id === tempId ? msg : m);
        return { privateMessages: { ...s.privateMessages, [convId]: { ...conv, messages: updated } } };
      });
    } catch (err) {
      set((s) => {
        const conv = s.privateMessages[convId];
        if (!conv) return s;
        return { privateMessages: { ...s.privateMessages, [convId]: { ...conv, messages: conv.messages.filter((m) => m.id !== tempId) } } };
      });
      console.error('sendPrivateImage failed:', err);
    }
  },

  sendPrivateVoice: async (convId, audioUrl, duration) => {
    const myId = useAuthStore.getState().currentUser?.id;
    const tempId = `pending_${Date.now()}`;
    set((s) => {
      const conv = s.privateMessages[convId];
      if (!conv) return s;
      return {
        privateMessages: {
          ...s.privateMessages,
          [convId]: { ...conv, messages: [...conv.messages, { id: tempId, convId, senderId: myId, type: 'voice', audioUrl, duration, createdAt: new Date().toISOString(), read: false }] },
        },
      };
    });
    try {
      const msg = await api(`/conversations/${convId}/messages`, { method: 'POST', body: { type: 'voice', audioUrl, duration } });
      set((s) => {
        const conv = s.privateMessages[convId];
        if (!conv) return s;
        const msgs = conv.messages;
        const updated = msgs.some((m) => m.id === msg.id)
          ? msgs.filter((m) => m.id !== tempId)
          : msgs.map((m) => m.id === tempId ? msg : m);
        return { privateMessages: { ...s.privateMessages, [convId]: { ...conv, messages: updated } } };
      });
    } catch (err) {
      set((s) => {
        const conv = s.privateMessages[convId];
        if (!conv) return s;
        return { privateMessages: { ...s.privateMessages, [convId]: { ...conv, messages: conv.messages.filter((m) => m.id !== tempId) } } };
      });
      console.error('sendPrivateVoice failed:', err);
    }
  },

  sendGroupMessage: async (classId, text) => {
    const myId = useAuthStore.getState().currentUser?.id;
    const tempId = `pending_${Date.now()}`;
    set((s) => ({
      groupMessages: {
        ...s.groupMessages,
        [classId]: [...(s.groupMessages[classId] || []), { id: tempId, classId, senderId: myId, type: 'text', text, createdAt: new Date().toISOString() }],
      },
    }));
    try {
      const msg = await api(`/group-messages/${classId}`, { method: 'POST', body: { type: 'text', text } });
      set((s) => {
        const msgs = s.groupMessages[classId] || [];
        const updated = msgs.some((m) => m.id === msg.id)
          ? msgs.filter((m) => m.id !== tempId)
          : msgs.map((m) => m.id === tempId ? msg : m);
        return { groupMessages: { ...s.groupMessages, [classId]: updated } };
      });
    } catch (err) {
      set((s) => ({ groupMessages: { ...s.groupMessages, [classId]: (s.groupMessages[classId] || []).filter((m) => m.id !== tempId) } }));
      console.error('sendGroupMessage failed:', err);
    }
  },

  sendGroupImage: async (classId, imageUrl) => {
    const myId = useAuthStore.getState().currentUser?.id;
    const tempId = `pending_${Date.now()}`;
    set((s) => ({
      groupMessages: {
        ...s.groupMessages,
        [classId]: [...(s.groupMessages[classId] || []), { id: tempId, classId, senderId: myId, type: 'image', imageUrl, createdAt: new Date().toISOString() }],
      },
    }));
    try {
      const msg = await api(`/group-messages/${classId}`, { method: 'POST', body: { type: 'image', imageUrl } });
      set((s) => {
        const msgs = s.groupMessages[classId] || [];
        const updated = msgs.some((m) => m.id === msg.id)
          ? msgs.filter((m) => m.id !== tempId)
          : msgs.map((m) => m.id === tempId ? msg : m);
        return { groupMessages: { ...s.groupMessages, [classId]: updated } };
      });
    } catch (err) {
      set((s) => ({ groupMessages: { ...s.groupMessages, [classId]: (s.groupMessages[classId] || []).filter((m) => m.id !== tempId) } }));
      console.error('sendGroupImage failed:', err);
    }
  },

  sendGroupVoice: async (classId, audioUrl, duration) => {
    const myId = useAuthStore.getState().currentUser?.id;
    const tempId = `pending_${Date.now()}`;
    set((s) => ({
      groupMessages: {
        ...s.groupMessages,
        [classId]: [...(s.groupMessages[classId] || []), { id: tempId, classId, senderId: myId, type: 'voice', audioUrl, duration, createdAt: new Date().toISOString() }],
      },
    }));
    try {
      const msg = await api(`/group-messages/${classId}`, { method: 'POST', body: { type: 'voice', audioUrl, duration } });
      set((s) => {
        const msgs = s.groupMessages[classId] || [];
        const updated = msgs.some((m) => m.id === msg.id)
          ? msgs.filter((m) => m.id !== tempId)
          : msgs.map((m) => m.id === tempId ? msg : m);
        return { groupMessages: { ...s.groupMessages, [classId]: updated } };
      });
    } catch (err) {
      set((s) => ({ groupMessages: { ...s.groupMessages, [classId]: (s.groupMessages[classId] || []).filter((m) => m.id !== tempId) } }));
      console.error('sendGroupVoice failed:', err);
    }
  },
}));

// ─── Subject Store ─────────────────────────────────────────────────────────────
export const useSubjectStore = create((set) => ({
  subjects: [...SUBJECTS],

  _set: (subjects) => set({ subjects }),

  addSubject: async (name, emoji, color) => {
    try {
      const s = await api('/subjects', { method: 'POST', body: { name, emoji, color } });
      set((state) => ({ subjects: [...state.subjects, s] }));
    } catch (err) {
      console.error('addSubject failed:', err);
    }
  },
}));

// ─── Content Store ────────────────────────────────────────────────────────────
export const useContentStore = create((set) => ({
  polls: [],
  quizzes: [],
  assignments: [],

  _set: (polls, quizzes, assignments) => set({ polls, quizzes, assignments }),
  _merge: (polls, quizzes, assignments) => set((s) => {
    const pollIds = new Set(s.polls.map((p) => p.id));
    const quizIds = new Set(s.quizzes.map((q) => q.id));
    const asnIds  = new Set(s.assignments.map((a) => a.id));
    return {
      polls:       [...s.polls,       ...polls.filter((p) => !pollIds.has(p.id))],
      quizzes:     [...s.quizzes,     ...quizzes.filter((q) => !quizIds.has(q.id))],
      assignments: [...s.assignments, ...assignments.filter((a) => !asnIds.has(a.id))],
    };
  }),
  _addPoll: (p) => set((s) => ({ polls: [p, ...s.polls] })),
  _updatePoll: (p) => set((s) => ({ polls: s.polls.map((x) => (x.id === p.id ? p : x)) })),
  _addQuiz: (q) => set((s) => ({ quizzes: [q, ...s.quizzes] })),
  _addAssignment: (a) => set((s) => ({ assignments: [a, ...s.assignments] })),

  addPoll: async (classId, subjectId, question, options) => {
    try {
      const poll = await api('/polls', { method: 'POST', body: { classId, subjectId, question, options } });
      set((s) => ({ polls: [poll, ...s.polls] }));
    } catch (err) {
      console.error('addPoll failed:', err);
    }
  },

  voteOnPoll: async (pollId, optionId) => {
    try {
      const updated = await api(`/polls/${pollId}/vote`, { method: 'POST', body: { optionId } });
      set((s) => ({ polls: s.polls.map((p) => (p.id === pollId ? updated : p)) }));
    } catch (err) {
      console.error('voteOnPoll failed:', err);
    }
  },

  addQuiz: async (classId, subjectId, title, questions) => {
    try {
      const quiz = await api('/quizzes', { method: 'POST', body: { classId, subjectId, title, questions } });
      set((s) => ({ quizzes: [quiz, ...s.quizzes] }));
    } catch (err) {
      console.error('addQuiz failed:', err);
    }
  },

  submitQuiz: async (quizId, answersOrUserId, legacyAnswers) => {
    // Handle both new call (quizId, answers[]) and legacy call (quizId, userId, answers[])
    const ansArr = Array.isArray(answersOrUserId) ? answersOrUserId : legacyAnswers;
    try {
      const result = await api(`/quizzes/${quizId}/submit`, { method: 'POST', body: { answers: ansArr } });
      const myId = useAuthStore.getState().currentUser?.id;
      set((s) => ({
        quizzes: s.quizzes.map((q) => {
          if (q.id !== quizId) return q;
          return {
            ...q,
            submissions: {
              ...q.submissions,
              [myId]: { answers: ansArr, score: result.score, submittedAt: new Date().toISOString() },
            },
          };
        }),
      }));
      return result;
    } catch (err) {
      console.error('submitQuiz failed:', err);
      return { score: 0, total: ansArr?.length || 0 };
    }
  },

  addAssignment: async (classId, subjectId, title, description, dueDate) => {
    try {
      const asn = await api('/assignments', { method: 'POST', body: { classId, subjectId, title, description, dueDate } });
      set((s) => ({ assignments: [asn, ...s.assignments] }));
    } catch (err) {
      console.error('addAssignment failed:', err);
    }
  },

  submitAssignment: async (assignmentId, userId, note) => {
    // userId may be passed (legacy) — ignore it
    const actualNote = typeof note === 'string' ? note : (typeof userId === 'string' && userId.length < 50 ? '' : userId);
    try {
      await api(`/assignments/${assignmentId}/submit`, { method: 'POST', body: { note: actualNote || null } });
      const myId = useAuthStore.getState().currentUser?.id;
      set((s) => ({
        assignments: s.assignments.map((a) => {
          if (a.id !== assignmentId) return a;
          if (a.submissions.some((sub) => sub.userId === myId)) return a;
          return { ...a, submissions: [...a.submissions, { userId: myId, note: actualNote, submittedAt: new Date().toISOString() }] };
        }),
      }));
    } catch (err) {
      console.error('submitAssignment failed:', err);
    }
  },
}));

// ─── Video Store ──────────────────────────────────────────────────────────────
export const useVideoStore = create((set) => ({
  videos: [],

  _set: (videos) => set({ videos }),
  _merge: (videos) => set((s) => {
    const ids = new Set(s.videos.map((v) => v.id));
    const fresh = videos.filter((v) => !ids.has(v.id));
    return fresh.length ? { videos: [...s.videos, ...fresh] } : s;
  }),

  addVideo: async (classId, subjectId, title, description, thumbnail, url, duration) => {
    try {
      const v = await api('/videos', { method: 'POST', body: { classId, subjectId, title, description, thumbnail, url, duration } });
      set((s) => ({ videos: [v, ...s.videos] }));
    } catch (err) {
      console.error('addVideo failed:', err);
    }
  },
}));

// ─── Profile Store ────────────────────────────────────────────────────────────
export const useProfileStore = create((set) => ({
  avatars: {},

  setAvatar: async (userId, emoji, color) => {
    try {
      await api(`/users/${userId}/avatar`, { method: 'PATCH', body: { emoji, color } });
      set((s) => ({ avatars: { ...s.avatars, [userId]: { emoji, color } } }));
    } catch (err) {
      console.error('setAvatar failed:', err);
    }
  },
}));

// ─── Notification read-state persistence ──────────────────────────────────────
const LS_READ_KEY = 'doubtfix_read_notifs';

function loadReadIds() {
  try {
    const raw = localStorage.getItem(LS_READ_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set();
}

function persistReadId(id) {
  try {
    const ids = loadReadIds();
    ids.add(id);
    localStorage.setItem(LS_READ_KEY, JSON.stringify([...ids]));
  } catch { /* ignore */ }
}

// ─── Notification Store ───────────────────────────────────────────────────────
export const useNotificationStore = create((set, get) => ({
  notifications: [],

  _set: (notifications) => {
    const readIds = loadReadIds();
    set({ notifications: notifications.map((n) => readIds.has(n.id) ? { ...n, read: true } : n) });
  },
  _add: (n) => set((s) => ({ notifications: [n, ...s.notifications] })),

  markRead: async (id) => {
    persistReadId(id);
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  },

  markAllRead: async () => {
    try {
      await api('/notifications/read-all', { method: 'PATCH' });
      set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
    } catch (err) {
      console.error('markAllRead failed:', err);
    }
  },

  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));

// ─── Lazy class data loader ───────────────────────────────────────────────────
export async function loadClassData(classId) {
  if (!classId || _loadedClasses.has(classId)) return;
  _loadedClasses.add(classId);
  try {
    const [questions, groupMsgs, videos] = await Promise.all([
      api(`/questions?classId=${classId}`),
      api(`/group-messages/${classId}`),
      api(`/videos?classId=${classId}`),
    ]);
    useQAStore.getState()._merge(questions);
    useChatStore.getState()._setGroupMessages(classId, groupMsgs);
    useVideoStore.getState()._merge(videos);
  } catch (err) {
    _loadedClasses.delete(classId);
    console.error(`loadClassData(${classId}) failed:`, err);
  }
}

// ─── Socket event binding (called after login) ────────────────────────────────
export function bindSocketEvents(socket) {
  socket.on('question:new',       (q)   => useQAStore.getState()._add(q));
  socket.on('question:answered',  (q)   => useQAStore.getState()._update(q));
  socket.on('announcement:new',   (ann) => useAnnouncementStore.getState()._add(ann));
  socket.on('message:new',        (msg) => useChatStore.getState()._addMessage(msg));
  socket.on('group_message:new',  (msg) => useChatStore.getState()._addGroupMessage(msg));
  socket.on('notification:new',   (n)   => useNotificationStore.getState()._add(n));
}
