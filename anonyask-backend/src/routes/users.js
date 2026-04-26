import { Router } from 'express';
import db from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';
import { sendTeacherCredentials } from '../config/mailer.js';

const router = Router();

function formatUser(u) {
  return {
    id: u.id,
    name: u.name,
    role: u.role,
    classId: u.class_id,
    initials: u.initials,
    avatarEmoji: u.avatar_emoji,
    avatarColor: u.avatar_color,
    subjects: u.subjects?.filter(Boolean) ?? [],
  };
}

// GET /api/users — role-filtered user list
router.get('/', verifyToken, async (req, res) => {
  const me = req.user;

  const conditions = ['u.id != $1'];
  const params = [me.id];

  // Students: see teachers + same-class students, NOT admin
  if (me.role === 'student') {
    conditions.push(`u.role != 'admin'`);
    params.push(me.classId);
    conditions.push(`(u.role = 'teacher' OR (u.role = 'student' AND u.class_id = $${params.length}))`);
  }
  // Teachers & admins: see everyone

  try {
    const { rows } = await db.query(
      `SELECT u.*, array_agg(ts.subject_id) FILTER (WHERE ts.subject_id IS NOT NULL) AS subjects
       FROM users u
       LEFT JOIN teacher_subjects ts ON ts.teacher_id = u.id
       WHERE ${conditions.join(' AND ')}
       GROUP BY u.id
       ORDER BY u.name`,
      params
    );
    res.json(rows.map(formatUser));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:id — profile + stats
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT u.*, array_agg(ts.subject_id) FILTER (WHERE ts.subject_id IS NOT NULL) AS subjects
       FROM users u
       LEFT JOIN teacher_subjects ts ON ts.teacher_id = u.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });

    const user = formatUser(rows[0]);
    const viewer = req.user;
    const isOwn = viewer.id === req.params.id;
    const canSeeQuestionsAsked = isOwn || viewer.role === 'teacher' || viewer.role === 'admin';

    const [qAsked, answeredBy, postedAnn, upvotes, answersReceived] = await Promise.all([
      db.query('SELECT COUNT(*) FROM questions WHERE asked_by = $1', [req.params.id]),
      db.query('SELECT COUNT(*) FROM questions WHERE answered_by = $1', [req.params.id]),
      db.query('SELECT COUNT(*) FROM announcements WHERE posted_by = $1', [req.params.id]),
      db.query('SELECT COALESCE(SUM(upvotes), 0) FROM questions WHERE asked_by = $1', [req.params.id]),
      db.query('SELECT COUNT(*) FROM questions WHERE asked_by = $1 AND answered = TRUE', [req.params.id]),
    ]);

    res.json({
      ...user,
      stats: {
        questionsAsked:     canSeeQuestionsAsked ? parseInt(qAsked.rows[0].count) : null,
        questionsAnswered:  parseInt(answeredBy.rows[0].count),
        announcementsPosted: parseInt(postedAnn.rows[0].count),
        upvotesReceived:    parseInt(upvotes.rows[0].coalesce),
        answersReceived:    parseInt(answersReceived.rows[0].count),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/:id/avatar — own profile only
router.patch('/:id/avatar', verifyToken, async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ error: 'Can only edit your own avatar' });
  }
  const { emoji, color } = req.body;
  try {
    await db.query(
      'UPDATE users SET avatar_emoji = $1, avatar_color = $2 WHERE id = $3',
      [emoji || null, color || null, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/teachers/bulk — admin setup: create teacher accounts + email credentials
router.post('/teachers/bulk', verifyToken, async (req, res) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const { teachers } = req.body;
  if (!Array.isArray(teachers) || teachers.length === 0)
    return res.status(400).json({ error: 'teachers array required' });

  const bcrypt  = await import('bcryptjs');
  const loginUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const created  = [];
  const failed   = [];

  for (const t of teachers) {
    if (!t.name?.trim() || !t.email?.trim()) continue;

    // Generate a unique password: Name initials + 4-digit random
    const initials = t.name.trim().split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    const password = `${initials}@${Math.floor(1000 + Math.random() * 9000)}`;
    const hash     = await bcrypt.default.hash(password, 10);

    try {
      const { rows } = await db.query(
        `INSERT INTO users (name, email, password_hash, role, initials)
         VALUES ($1, $2, $3, 'teacher', $4)
         ON CONFLICT (email) DO NOTHING
         RETURNING id, name, email, role, initials`,
        [t.name.trim(), t.email.trim().toLowerCase(), hash, initials]
      );

      if (!rows[0]) continue; // email already exists — skip
      created.push(rows[0]);

      // Send credentials email (non-blocking — don't fail the request if email fails)
      sendTeacherCredentials({
        to:       rows[0].email,
        name:     rows[0].name,
        password,
        loginUrl,
      }).catch((err) => {
        console.warn(`Email failed for ${rows[0].email}:`, err.message);
        failed.push(rows[0].email);
      });

    } catch (err) {
      console.error(`Failed to create teacher ${t.email}:`, err.message);
    }
  }

  res.json({ created, failedEmails: failed });
});

// POST /api/users/students/bulk — admin setup: create student accounts + email credentials
router.post('/students/bulk', verifyToken, async (req, res) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const { students } = req.body;
  if (!Array.isArray(students) || students.length === 0)
    return res.status(400).json({ error: 'students array required' });

  const bcrypt   = await import('bcryptjs');
  const loginUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const created  = [];
  const failed   = [];

  for (const s of students) {
    if (!s.name?.trim() || !s.email?.trim()) continue;

    const initials = s.name.trim().split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    const password = `${initials}@${Math.floor(1000 + Math.random() * 9000)}`;
    const hash     = await bcrypt.default.hash(password, 10);

    try {
      const { rows } = await db.query(
        `INSERT INTO users (name, email, password_hash, role, initials, class_id)
         VALUES ($1, $2, $3, 'student', $4, $5)
         ON CONFLICT (email) DO NOTHING
         RETURNING id, name, email, role, initials, class_id`,
        [s.name.trim(), s.email.trim().toLowerCase(), hash, initials, s.classId || null]
      );

      if (!rows[0]) continue;
      created.push(rows[0]);

      sendTeacherCredentials({
        to:       rows[0].email,
        name:     rows[0].name,
        password,
        loginUrl,
      }).catch((err) => {
        console.warn(`Email failed for ${rows[0].email}:`, err.message);
        failed.push(rows[0].email);
      });

    } catch (err) {
      console.error(`Failed to create student ${s.email}:`, err.message);
    }
  }

  res.json({ created, failedEmails: failed });
});

export default router;
