import { Router } from 'express';
import db from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

function fmt(v) {
  return {
    id: v.id,
    classId: v.class_id,
    subjectId: v.subject_id,
    uploadedBy: v.uploaded_by,
    title: v.title,
    description: v.description,
    thumbnail: v.thumbnail,
    url: v.url,
    duration: v.duration,
    createdAt: v.created_at,
  };
}

// GET /api/videos?classId=&subjectId=
router.get('/', verifyToken, async (req, res) => {
  const { classId, subjectId } = req.query;
  const conditions = [];
  const params = [];

  if (classId)   { params.push(classId);   conditions.push(`class_id = $${params.length}`); }
  if (subjectId) { params.push(subjectId); conditions.push(`subject_id = $${params.length}`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  try {
    const { rows } = await db.query(
      `SELECT * FROM videos ${where} ORDER BY created_at DESC`, params
    );
    res.json(rows.map(fmt));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/videos — teacher or admin
router.post('/', verifyToken, requireRole('teacher', 'admin'), async (req, res) => {
  const { classId, subjectId, title, description, thumbnail, url, duration } = req.body;
  if (!title?.trim() || !url?.trim()) {
    return res.status(400).json({ error: 'title and url are required' });
  }
  try {
    const { rows } = await db.query(
      `INSERT INTO videos (class_id, subject_id, uploaded_by, title, description, thumbnail, url, duration)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [classId || null, subjectId || null, req.user.id,
       title.trim(), description || null, thumbnail || '📹', url.trim(), duration || null]
    );
    res.status(201).json(fmt(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
