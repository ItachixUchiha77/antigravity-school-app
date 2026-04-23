import { Router } from 'express';
import db from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

async function formatAssignment(a) {
  const { rows: subs } = await db.query(
    'SELECT user_id, note, submitted_at FROM assignment_submissions WHERE assignment_id=$1',
    [a.id]
  );
  return {
    id: a.id,
    classId: a.class_id,
    subjectId: a.subject_id,
    createdBy: a.created_by,
    title: a.title,
    description: a.description,
    dueDate: a.due_date,
    submissions: subs.map((s) => ({ userId: s.user_id, note: s.note, submittedAt: s.submitted_at })),
    createdAt: a.created_at,
  };
}

// GET /api/assignments?classId=&subjectId=
router.get('/', verifyToken, async (req, res) => {
  const { classId, subjectId } = req.query;
  const conditions = [];
  const params = [];
  if (classId)   { params.push(classId);   conditions.push(`class_id = $${params.length}`); }
  if (subjectId) { params.push(subjectId); conditions.push(`subject_id = $${params.length}`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  try {
    const { rows } = await db.query(
      `SELECT * FROM assignments ${where} ORDER BY created_at DESC`, params
    );
    res.json(await Promise.all(rows.map(formatAssignment)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/assignments — teacher only
router.post('/', verifyToken, requireRole('teacher'), async (req, res) => {
  const { classId, subjectId, title, description, dueDate } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'title is required' });
  try {
    const { rows } = await db.query(
      `INSERT INTO assignments (class_id, subject_id, created_by, title, description, due_date)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [classId || null, subjectId || null, req.user.id, title.trim(), description || null, dueDate || null]
    );
    const formatted = await formatAssignment(rows[0]);
    if (classId) req.app.get('io').to(`class:${classId}`).emit('assignment:new', formatted);
    res.status(201).json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/assignments/:id/submit — student only
router.post('/:id/submit', verifyToken, requireRole('student'), async (req, res) => {
  const { note } = req.body;
  try {
    await db.query(
      `INSERT INTO assignment_submissions (assignment_id, user_id, note)
       VALUES ($1,$2,$3)
       ON CONFLICT (assignment_id, user_id) DO NOTHING`,
      [req.params.id, req.user.id, note || null]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
