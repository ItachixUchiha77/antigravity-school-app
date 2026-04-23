import 'dotenv/config';
import express          from 'express';
import { createServer } from 'http';
import { Server }       from 'socket.io';
import cors             from 'cors';

import authRoutes         from './routes/auth.js';
import userRoutes         from './routes/users.js';
import classRoutes        from './routes/classes.js';
import subjectRoutes      from './routes/subjects.js';
import questionRoutes     from './routes/questions.js';
import announcementRoutes from './routes/announcements.js';
import conversationRoutes from './routes/conversations.js';
import groupChatRoutes    from './routes/groupChat.js';
import videoRoutes        from './routes/videos.js';
import pollRoutes         from './routes/polls.js';
import quizRoutes         from './routes/quizzes.js';
import assignmentRoutes   from './routes/assignments.js';
import notificationRoutes from './routes/notifications.js';
import schoolRoutes       from './routes/school.js';
import { initSocket }     from './socket/index.js';

const app        = express();
const httpServer = createServer(app);

const corsOrigin = process.env.NODE_ENV === 'development'
  ? (_origin, cb) => cb(null, true)
  : process.env.CLIENT_URL || '*';

const io = new Server(httpServer, {
  cors: { origin: corsOrigin, credentials: true },
});

// Make io available inside route handlers via req.app.get('io')
app.set('io', io);

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',           authRoutes);
app.use('/api/users',          userRoutes);
app.use('/api/classes',        classRoutes);
app.use('/api/subjects',       subjectRoutes);
app.use('/api/questions',      questionRoutes);
app.use('/api/announcements',  announcementRoutes);
app.use('/api/conversations',  conversationRoutes);
app.use('/api/group-messages', groupChatRoutes);
app.use('/api/videos',         videoRoutes);
app.use('/api/polls',          pollRoutes);
app.use('/api/quizzes',        quizRoutes);
app.use('/api/assignments',    assignmentRoutes);
app.use('/api/notifications',  notificationRoutes);
app.use('/api/school',         schoolRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ─── Socket.io ────────────────────────────────────────────────────────────────
initSocket(io);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`AnonyASK API running on http://localhost:${PORT}`);
});
