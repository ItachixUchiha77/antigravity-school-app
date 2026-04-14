import { create } from 'zustand';
import { USERS, QUESTIONS, ANNOUNCEMENTS, PRIVATE_MESSAGES, GROUP_MESSAGES, NOTIFICATIONS } from '../data/mockData';

// ─── Auth Store ───────────────────────────────────────────────────────────────
export const useAuthStore = create((set) => ({
  currentUser: null,
  isAuthenticated: false,

  login: (userId) => {
    const user = USERS[userId];
    if (user) set({ currentUser: user, isAuthenticated: true });
  },

  logout: () => set({ currentUser: null, isAuthenticated: false }),
}));

// ─── UI Store ─────────────────────────────────────────────────────────────────
export const useUIStore = create((set) => ({
  selectedClassId: 'cls-10a',
  selectedSubjectId: 'math',
  activeView: 'qna', // 'qna' | 'group-chat' | 'announcements' | 'private-chat'
  selectedConvId: null,
  notificationPanelOpen: false,

  setSelectedClass: (classId) => set({ selectedClassId: classId, activeView: 'qna', selectedSubjectId: 'math' }),
  setSelectedSubject: (subjectId) => set({ selectedSubjectId: subjectId, activeView: 'qna' }),
  setActiveView: (view) => set({ activeView: view }),
  setSelectedConv: (convId) => set({ selectedConvId: convId, activeView: 'private-chat' }),
  toggleNotificationPanel: () => set((state) => ({ notificationPanelOpen: !state.notificationPanelOpen })),
  closeNotificationPanel: () => set({ notificationPanelOpen: false }),
}));

// ─── Q&A Store ────────────────────────────────────────────────────────────────
export const useQAStore = create((set) => ({
  questions: QUESTIONS,

  addQuestion: (classId, subjectId, text, userId) => set((state) => ({
    questions: [
      {
        id: `q-${Date.now()}`,
        classId,
        subjectId,
        text,
        upvotes: 0,
        upvotedBy: [],
        answered: false,
        answer: null,
        answeredBy: null,
        answeredAt: null,
        createdAt: new Date().toISOString(),
      },
      ...state.questions,
    ]
  })),

  upvoteQuestion: (questionId, userId) => set((state) => ({
    questions: state.questions.map((q) => {
      if (q.id !== questionId) return q;
      const alreadyVoted = q.upvotedBy.includes(userId);
      return {
        ...q,
        upvotes: alreadyVoted ? q.upvotes - 1 : q.upvotes + 1,
        upvotedBy: alreadyVoted
          ? q.upvotedBy.filter((id) => id !== userId)
          : [...q.upvotedBy, userId],
      };
    })
  })),

  answerQuestion: (questionId, answerText, teacherId) => set((state) => ({
    questions: state.questions.map((q) =>
      q.id === questionId
        ? { ...q, answer: answerText, answeredBy: teacherId, answeredAt: new Date().toISOString(), answered: true }
        : q
    )
  })),

  markAnswered: (questionId) => set((state) => ({
    questions: state.questions.map((q) =>
      q.id === questionId ? { ...q, answered: true } : q
    )
  })),
}));

// ─── Announcements Store ──────────────────────────────────────────────────────
export const useAnnouncementStore = create((set) => ({
  announcements: ANNOUNCEMENTS,

  addAnnouncement: (classId, title, content, priority, userId) => set((state) => ({
    announcements: [
      {
        id: `ann-${Date.now()}`,
        classId,
        title,
        content,
        priority,
        postedBy: userId,
        createdAt: new Date().toISOString(),
        pinned: false,
      },
      ...state.announcements,
    ]
  })),
}));

// ─── Chat Store ───────────────────────────────────────────────────────────────
export const useChatStore = create((set) => ({
  privateMessages: PRIVATE_MESSAGES,
  groupMessages: GROUP_MESSAGES,

  sendPrivateMessage: (convId, text, senderId) => set((state) => {
    const conv = state.privateMessages[convId] || { participants: [], messages: [] };
    return {
      privateMessages: {
        ...state.privateMessages,
        [convId]: {
          ...conv,
          messages: [
            ...conv.messages,
            { id: `m-${Date.now()}`, senderId, text, createdAt: new Date().toISOString(), read: false }
          ]
        }
      }
    };
  }),

  sendGroupMessage: (classId, text, senderId) => set((state) => ({
    groupMessages: {
      ...state.groupMessages,
      [classId]: [
        ...(state.groupMessages[classId] || []),
        { id: `gm-${Date.now()}`, senderId, text, createdAt: new Date().toISOString() }
      ]
    }
  })),
}));

// ─── Notification Store ───────────────────────────────────────────────────────
export const useNotificationStore = create((set) => ({
  notifications: NOTIFICATIONS,

  markAllRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true }))
  })),

  unreadCount: () => NOTIFICATIONS.filter((n) => !n.read).length,
}));
