import { Router } from 'express';
import db from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

async function formatQuestion(q) {
  const { rows } = await db.query(
    'SELECT user_id FROM question_upvotes WHERE question_id = $1',
    [q.id]
  );
  return {
    id: q.id,
    classId: q.class_id,
    subjectId: q.subject_id,
    askedBy: q.asked_by, // used for stats only — never shown in UI
    text: q.text,
    upvotes: q.upvotes,
    upvotedBy: rows.map((r) => r.user_id),
    answered: q.answered,
    answer: q.answer,
    answeredBy: q.answered_by,
    answeredAt: q.answered_at,
    createdAt: q.created_at,
  };
}

// GET /api/questions?classId=&subjectId=
router.get('/', verifyToken, async (req, res) => {
  const { classId, subjectId } = req.query;
  const conditions = [];
  const params = [];

  if (classId)   { params.push(classId);   conditions.push(`class_id = $${params.length}`); }
  if (subjectId) { params.push(subjectId); conditions.push(`subject_id = $${params.length}`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  try {
    const { rows } = await db.query(
      `SELECT * FROM questions ${where} ORDER BY upvotes DESC, created_at DESC`,
      params
    );
    const formatted = await Promise.all(rows.map(formatQuestion));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/questions — students only
router.post('/', verifyToken, requireRole('student'), async (req, res) => {
  const { classId, subjectId, text } = req.body;
  if (!classId || !subjectId || !text?.trim()) {
    return res.status(400).json({ error: 'classId, subjectId, and text are required' });
  }
  try {
    const { rows } = await db.query(
      `INSERT INTO questions (class_id, subject_id, asked_by, text)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [classId, subjectId, req.user.id, text.trim()]
    );
    const question = await formatQuestion(rows[0]);
    req.app.get('io').to(`class:${classId}`).emit('question:new', question);
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/questions/:id/upvote — toggle upvote
router.post('/:id/upvote', verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const { rowCount } = await db.query(
      'SELECT 1 FROM question_upvotes WHERE question_id=$1 AND user_id=$2',
      [id, userId]
    );
    if (rowCount > 0) {
      await db.query('DELETE FROM question_upvotes WHERE question_id=$1 AND user_id=$2', [id, userId]);
      await db.query('UPDATE questions SET upvotes = upvotes - 1 WHERE id=$1', [id]);
    } else {
      await db.query('INSERT INTO question_upvotes (question_id, user_id) VALUES ($1,$2)', [id, userId]);
      await db.query('UPDATE questions SET upvotes = upvotes + 1 WHERE id=$1', [id]);
    }
    const { rows } = await db.query('SELECT * FROM questions WHERE id=$1', [id]);
    res.json(await formatQuestion(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/questions/:id/answer — teacher or admin
router.patch('/:id/answer', verifyToken, requireRole('teacher', 'admin'), async (req, res) => {
  const { answer } = req.body;
  if (!answer?.trim()) return res.status(400).json({ error: 'answer is required' });

  try {
    const { rows } = await db.query(
      `UPDATE questions
       SET answer=$1, answered_by=$2, answered_at=NOW(), answered=TRUE
       WHERE id=$3 RETURNING *`,
      [answer.trim(), req.user.id, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Question not found' });

    const question = await formatQuestion(rows[0]);
    const io = req.app.get('io');

    // Broadcast to class
    io.to(`class:${question.classId}`).emit('question:answered', question);

    // Notify the asker
    if (question.askedBy) {
      const { rows: sRows } = await db.query(
        'SELECT name FROM users WHERE id=$1', [req.user.id]
      );
      const notifText = `${sRows[0]?.name} answered your question`;
      const { rows: nRows } = await db.query(
        `INSERT INTO notifications (user_id, type, text, subject_id, class_id)
         VALUES ($1,'answer',$2,$3,$4) RETURNING *`,
        [question.askedBy, notifText, question.subjectId, question.classId]
      );
      io.to(`user:${question.askedBy}`).emit('notification:new', nRows[0]);
    }

    res.json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
