/**
 * Mock API — in-memory backend for demo/development.
 * Mirrors the real REST contract so swapping to a real server
 * only requires changing client.js.
 */
import {
  CLASSES, SUBJECTS, USERS,
  QUESTIONS, ANNOUNCEMENTS, NOTIFICATIONS,
  PRIVATE_MESSAGES, GROUP_MESSAGES,
  POLLS, QUIZZES, ASSIGNMENTS, VIDEOS,
} from '../data/mockData.js';

// ─── Email → userId mapping for demo login ─────────────────────────────────
const EMAIL_MAP = {
  's001@school.com':   's-001',
  't001@school.com':   't-001',
  'admin@school.com':  'a-001',
};
const DEMO_PASSWORD = 'password123';

// ─── LocalStorage persistence for conversations ────────────────────────────
const LS_KEY = 'doubtfix_private_convs';

function loadConvs() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function saveConvs(convs) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(convs));
  } catch { /* ignore */ }
}

// ─── In-memory school settings (null until admin saves) ────────────────────
let mockSchool = null;

// ─── Mutable in-memory state (seeded from mockData) ────────────────────────
const state = {
  classes:       JSON.parse(JSON.stringify(CLASSES)),
  subjects:      JSON.parse(JSON.stringify(SUBJECTS)),
  users:         JSON.parse(JSON.stringify(Object.values(USERS))),
  questions:     JSON.parse(JSON.stringify(QUESTIONS)),
  announcements: JSON.parse(JSON.stringify(ANNOUNCEMENTS)),
  notifications: JSON.parse(JSON.stringify(NOTIFICATIONS)),
  privateConvs:  loadConvs() ?? JSON.parse(JSON.stringify(PRIVATE_MESSAGES)),
  groupMsgs:     JSON.parse(JSON.stringify(GROUP_MESSAGES)),
  polls:         JSON.parse(JSON.stringify(POLLS)),
  quizzes:       JSON.parse(JSON.stringify(QUIZZES)),
  assignments:   JSON.parse(JSON.stringify(ASSIGNMENTS)),
  videos:        JSON.parse(JSON.stringify(VIDEOS)),
  // per-user notifications — for simplicity we use one global list
};

// ─── Helpers ────────────────────────────────────────────────────────────────
let _seq = Date.now();
const uid = (prefix = 'id') => `${prefix}-${(++_seq).toString(36)}`;
const now = () => new Date().toISOString();
const ok  = (data) => data;
const err = (msg, status = 400) => { const e = new Error(msg); e.status = status; throw e; };

function getUser(id) {
  return state.users.find((u) => u.id === id) || Object.values(USERS).find((u) => u.id === id);
}

function tokenUserId(token) {
  // token format: "mock_<userId>"
  if (!token?.startsWith('mock_')) return null;
  return token.slice(5);
}

// ─── Route handler ──────────────────────────────────────────────────────────
export async function mockApi(path, { method = 'GET', body, token } = {}) {
  // tiny artificial delay so the UI feels real
  await new Promise((r) => setTimeout(r, 60));

  const myId = tokenUserId(token);
  const url  = new URL(`http://x${path}`);
  const seg  = url.pathname.split('/').filter(Boolean); // ['auth','login']

  // ── Auth ──────────────────────────────────────────────────────────────────
  if (seg[0] === 'auth') {
    if (seg[1] === 'login' && method === 'POST') {
      const userId = EMAIL_MAP[body?.email?.toLowerCase()];
      if (!userId || body?.password !== DEMO_PASSWORD) err('Invalid email or password', 401);
      const user = getUser(userId);
      if (!user) err('User not found', 404);
      return ok({ token: `mock_${userId}`, user });
    }
    if (seg[1] === 'me' && method === 'GET') {
      if (!myId) err('Unauthorized', 401);
      const user = getUser(myId);
      if (!user) err('User not found', 404);
      return ok(user);
    }
  }

  // ── Users ─────────────────────────────────────────────────────────────────
  if (seg[0] === 'users') {
    if (!seg[1] && method === 'GET') return ok(state.users);

    // PATCH /users/:id/avatar
    if (seg[2] === 'avatar' && method === 'PATCH') {
      const u = state.users.find((u) => u.id === seg[1]);
      if (u) { u.avatarEmoji = body?.emoji; u.avatarColor = body?.color; }
      // also update USERS lookup
      if (USERS[seg[1]]) { USERS[seg[1]].avatarEmoji = body?.emoji; USERS[seg[1]].avatarColor = body?.color; }
      return ok({});
    }
  }

  // ── Classes ───────────────────────────────────────────────────────────────
  if (seg[0] === 'classes' && method === 'GET') return ok(state.classes);

  // ── Subjects ──────────────────────────────────────────────────────────────
  if (seg[0] === 'subjects') {
    if (method === 'GET') return ok(state.subjects);
    if (method === 'POST') {
      const s = { id: uid('subj'), name: body.name, emoji: body.emoji, color: body.color };
      state.subjects.push(s);
      return ok(s);
    }
  }

  // ── Announcements ─────────────────────────────────────────────────────────
  if (seg[0] === 'announcements') {
    if (method === 'GET') return ok(state.announcements);
    if (method === 'POST') {
      const a = {
        id: uid('ann'),
        classId:   body.classId ?? null,
        title:     body.title,
        content:   body.content,
        priority:  body.priority || 'general',
        postedBy:  myId,
        createdAt: now(),
        pinned:    false,
      };
      state.announcements.unshift(a);
      return ok(a);
    }
  }

  // ── Questions ─────────────────────────────────────────────────────────────
  if (seg[0] === 'questions') {
    if (!seg[1] && method === 'GET') {
      const classId = url.searchParams.get('classId');
      return ok(classId ? state.questions.filter((q) => q.classId === classId) : state.questions);
    }
    if (!seg[1] && method === 'POST') {
      const q = {
        id:         uid('q'),
        classId:    body.classId,
        subjectId:  body.subjectId,
        askedBy:    myId,
        text:       body.text,
        upvotes:    0,
        upvotedBy:  [],
        answered:   false,
        answer:     null,
        answeredBy: null,
        answeredAt: null,
        createdAt:  now(),
      };
      state.questions.unshift(q);
      return ok(q);
    }
    // POST /questions/:id/upvote
    if (seg[2] === 'upvote' && method === 'POST') {
      const q = state.questions.find((q) => q.id === seg[1]);
      if (!q) err('Not found', 404);
      if (q.upvotedBy.includes(myId)) {
        q.upvotedBy = q.upvotedBy.filter((u) => u !== myId);
        q.upvotes   = Math.max(0, q.upvotes - 1);
      } else {
        q.upvotedBy.push(myId);
        q.upvotes++;
      }
      return ok(q);
    }
    // PATCH /questions/:id/mark-answered
    if (seg[2] === 'mark-answered' && method === 'PATCH') {
      const q = state.questions.find((q) => q.id === seg[1]);
      if (!q) err('Not found', 404);
      q.answered = true;
      if (!q.answeredBy) { q.answeredBy = myId; q.answeredAt = now(); }
      return ok(q);
    }
    // PATCH /questions/:id/answer
    if (seg[2] === 'answer' && method === 'PATCH') {
      const q = state.questions.find((q) => q.id === seg[1]);
      if (!q) err('Not found', 404);
      q.answer     = body.answer;
      q.answered   = true;
      q.answeredBy = myId;
      q.answeredAt = now();
      return ok(q);
    }
  }

  // ── Conversations (private DMs) ───────────────────────────────────────────
  if (seg[0] === 'conversations') {
    // GET /conversations — list for current user
    if (!seg[1] && method === 'GET') {
      const result = Object.entries(state.privateConvs)
        .filter(([, conv]) => conv.participants.includes(myId))
        .map(([convId, conv]) => {
          const otherId = conv.participants.find((p) => p !== myId);
          const other   = getUser(otherId);
          const msgs    = conv.messages;
          return { convId, other, lastMessage: msgs[msgs.length - 1] ?? null };
        });
      return ok(result);
    }

    // POST /conversations — create or get existing DM
    if (!seg[1] && method === 'POST') {
      const otherId = body.userId;
      // find existing
      const existing = Object.entries(state.privateConvs)
        .find(([, c]) => c.participants.includes(myId) && c.participants.includes(otherId));
      if (existing) return ok({ convId: existing[0] });
      const convId = `conv-${myId.replace(/-/g,'')}-${otherId.replace(/-/g,'')}`;
      state.privateConvs[convId] = { participants: [myId, otherId], messages: [] };
      saveConvs(state.privateConvs);
      return ok({ convId });
    }

    // GET /conversations/:id/messages
    if (seg[2] === 'messages' && method === 'GET') {
      const conv = state.privateConvs[seg[1]];
      if (!conv) err('Not found', 404);
      return ok(conv.messages);
    }

    // POST /conversations/:id/messages
    if (seg[2] === 'messages' && method === 'POST') {
      const conv = state.privateConvs[seg[1]];
      if (!conv) err('Not found', 404);
      const msg = {
        id:        uid('msg'),
        convId:    seg[1],
        senderId:  myId,
        type:      body.type || 'text',
        text:      body.text ?? null,
        imageUrl:  body.imageUrl ?? null,
        audioUrl:  body.audioUrl ?? null,
        duration:  body.duration ?? null,
        createdAt: now(),
        read:      false,
      };
      conv.messages.push(msg);
      saveConvs(state.privateConvs);
      return ok(msg);
    }
  }

  // ── Group messages ────────────────────────────────────────────────────────
  if (seg[0] === 'group-messages') {
    const classId = seg[1];
    if (method === 'GET') {
      return ok(state.groupMsgs[classId] || []);
    }
    if (method === 'POST') {
      if (!state.groupMsgs[classId]) state.groupMsgs[classId] = [];
      const msg = {
        id:        uid('gm'),
        classId,
        senderId:  myId,
        type:      body.type || 'text',
        text:      body.text ?? null,
        imageUrl:  body.imageUrl ?? null,
        audioUrl:  body.audioUrl ?? null,
        duration:  body.duration ?? null,
        createdAt: now(),
      };
      state.groupMsgs[classId].push(msg);
      return ok(msg);
    }
  }

  // ── Notifications ─────────────────────────────────────────────────────────
  if (seg[0] === 'notifications') {
    if (!seg[1] && method === 'GET') {
      // Only return notifications for the logged-in user (or global ones without a userId)
      return ok(state.notifications.filter((n) => !n.userId || n.userId === myId));
    }
    if (seg[1] === 'read-all' && method === 'PATCH') {
      state.notifications
        .filter((n) => !n.userId || n.userId === myId)
        .forEach((n) => { n.read = true; });
      return ok({});
    }
  }

  // ── Polls ─────────────────────────────────────────────────────────────────
  if (seg[0] === 'polls') {
    if (!seg[1] && method === 'GET') {
      const classId = url.searchParams.get('classId');
      return ok(classId ? state.polls.filter((p) => p.classId === classId) : state.polls);
    }
    if (!seg[1] && method === 'POST') {
      const poll = {
        id:        uid('poll'),
        classId:   body.classId,
        subjectId: body.subjectId,
        createdBy: myId,
        question:  body.question,
        options:   (body.options || []).map((text, i) => ({ id: `o${i+1}`, text, votes: [] })),
        createdAt: now(),
      };
      state.polls.unshift(poll);
      return ok(poll);
    }
    // POST /polls/:id/vote
    if (seg[2] === 'vote' && method === 'POST') {
      const poll = state.polls.find((p) => p.id === seg[1]);
      if (!poll) err('Not found', 404);
      // remove existing vote first
      poll.options.forEach((o) => { o.votes = o.votes.filter((v) => v !== myId); });
      const opt = poll.options.find((o) => o.id === body.optionId);
      if (opt) opt.votes.push(myId);
      return ok(poll);
    }
  }

  // ── Quizzes ───────────────────────────────────────────────────────────────
  if (seg[0] === 'quizzes') {
    if (!seg[1] && method === 'GET') {
      const classId = url.searchParams.get('classId');
      return ok(classId ? state.quizzes.filter((q) => q.classId === classId) : state.quizzes);
    }
    if (!seg[1] && method === 'POST') {
      const quiz = {
        id:         uid('quiz'),
        classId:    body.classId,
        subjectId:  body.subjectId,
        createdBy:  myId,
        title:      body.title,
        questions:  (body.questions || []).map((q, i) => ({
          id:           `qs-${uid()}`,
          text:         q.text,
          options:      q.options,
          correctIndex: q.correctIndex ?? 0,
        })),
        submissions: {},
        createdAt:  now(),
      };
      state.quizzes.unshift(quiz);
      return ok(quiz);
    }
    // POST /quizzes/:id/submit
    if (seg[2] === 'submit' && method === 'POST') {
      const quiz = state.quizzes.find((q) => q.id === seg[1]);
      if (!quiz) err('Not found', 404);
      const answers = body.answers || [];
      const score   = answers.filter((a, i) => a === quiz.questions[i]?.correctIndex).length;
      quiz.submissions[myId] = { answers, score, submittedAt: now() };
      return ok({ score, total: quiz.questions.length });
    }
  }

  // ── Assignments ───────────────────────────────────────────────────────────
  if (seg[0] === 'assignments') {
    if (!seg[1] && method === 'GET') {
      const classId = url.searchParams.get('classId');
      return ok(classId ? state.assignments.filter((a) => a.classId === classId) : state.assignments);
    }
    if (!seg[1] && method === 'POST') {
      const asn = {
        id:          uid('asn'),
        classId:     body.classId,
        subjectId:   body.subjectId,
        createdBy:   myId,
        title:       body.title,
        description: body.description || '',
        dueDate:     body.dueDate,
        submissions: [],
        createdAt:   now(),
      };
      state.assignments.unshift(asn);
      return ok(asn);
    }
    // POST /assignments/:id/submit
    if (seg[2] === 'submit' && method === 'POST') {
      const asn = state.assignments.find((a) => a.id === seg[1]);
      if (!asn) err('Not found', 404);
      if (!asn.submissions.find((s) => s.userId === myId)) {
        asn.submissions.push({ userId: myId, note: body.note ?? null, submittedAt: now() });
      }
      return ok({});
    }
  }

  // ── Videos ────────────────────────────────────────────────────────────────
  if (seg[0] === 'videos') {
    if (!seg[1] && method === 'GET') {
      const classId = url.searchParams.get('classId');
      return ok(classId ? state.videos.filter((v) => v.classId === classId) : state.videos);
    }
    if (!seg[1] && method === 'POST') {
      const v = {
        id:          uid('vid'),
        classId:     body.classId,
        subjectId:   body.subjectId,
        uploadedBy:  myId,
        title:       body.title,
        description: body.description || '',
        thumbnail:   body.thumbnail || '🎬',
        url:         body.url,
        duration:    body.duration || '0:00',
        createdAt:   now(),
      };
      state.videos.unshift(v);
      return ok(v);
    }
  }

  // ── School settings ────────────────────────────────────────────────────────
  if (seg[0] === 'school') {
    if (method === 'GET') return ok(mockSchool);
    if (method === 'POST') {
      mockSchool = { id: uid('school'), ...body, completedAt: now() };
      return ok(mockSchool);
    }
  }

  err(`No mock handler for ${method} ${path}`, 501);
}
