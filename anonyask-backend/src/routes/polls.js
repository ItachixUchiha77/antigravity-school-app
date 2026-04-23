import { Router } from 'express';
import db from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

async function formatPoll(poll) {
  const { rows: options } = await db.query(
    `SELECT po.id, po.text,
            array_agg(pv.user_id) FILTER (WHERE pv.user_id IS NOT NULL) AS votes
     FROM poll_options po
     LEFT JOIN poll_votes pv ON pv.option_id = po.id
     WHERE po.poll_id = $1
     GROUP BY po.id, po.display_order
     ORDER BY po.display_order`,
    [poll.id]
  );
  return {
    id: poll.id,
    classId: poll.class_id,
    subjectId: poll.subject_id,
    createdBy: poll.created_by,
    question: poll.question,
    options: options.map((o) => ({ id: o.id, text: o.text, votes: o.votes ?? [] })),
    createdAt: poll.created_at,
  };
}

// GET /api/polls?classId=&subjectId=
router.get('/', verifyToken, async (req, res) => {
  const { classId, subjectId } = req.query;
  const conditions = [];
  const params = [];
  if (classId)   { params.push(classId);   conditions.push(`class_id = $${params.length}`); }
  if (subjectId) { params.push(subjectId); conditions.push(`subject_id = $${params.length}`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  try {
    const { rows } = await db.query(`SELECT * FROM polls ${where} ORDER BY created_at DESC`, params);
    res.json(await Promise.all(rows.map(formatPoll)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/polls — teacher only
router.post('/', verifyToken, requireRole('teacher'), async (req, res) => {
  const { classId, subjectId, question, options } = req.body;
  if (!question?.trim() || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: 'question and at least 2 options are required' });
  }
  try {
    const { rows } = await db.query(
      'INSERT INTO polls (class_id, subject_id, created_by, question) VALUES ($1,$2,$3,$4) RETURNING *',
      [classId || null, subjectId || null, req.user.id, question.trim()]
    );
    const poll = rows[0];
    for (let i = 0; i < options.length; i++) {
      await db.query(
        'INSERT INTO poll_options (poll_id, text, display_order) VALUES ($1,$2,$3)',
        [poll.id, options[i].trim(), i]
      );
    }
    const formatted = await formatPoll(poll);
    if (classId) req.app.get('io').to(`class:${classId}`).emit('poll:new', formatted);
    res.status(201).json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/polls/:id/vote
router.post('/:id/vote', verifyToken, async (req, res) => {
  const { optionId } = req.body;
  if (!optionId) return res.status(400).json({ error: 'optionId is required' });
  try {
    await db.query('DELETE FROM poll_votes WHERE poll_id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    await db.query(
      'INSERT INTO poll_votes (poll_id, option_id, user_id) VALUES ($1,$2,$3)',
      [req.params.id, optionId, req.user.id]
    );
    const { rows } = await db.query('SELECT * FROM polls WHERE id=$1', [req.params.id]);
    const formatted = await formatPoll(rows[0]);
    if (formatted.classId) {
      req.app.get('io').to(`class:${formatted.classId}`).emit('poll:updated', formatted);
    }
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
