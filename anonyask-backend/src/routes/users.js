import { Router } from 'express';
import db from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

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

export default router;
