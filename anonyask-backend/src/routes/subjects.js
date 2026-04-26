import { Router } from 'express';
import db from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// GET /api/subjects
router.get('/', verifyToken, async (_req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, emoji, color FROM subjects ORDER BY name'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/subjects — admin only
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  const { name, emoji, color } = req.body;
  if (!name?.trim() || !emoji || !color) {
    return res.status(400).json({ error: 'name, emoji, and color are required' });
  }
  try {
    const { rows } = await db.query(
      'INSERT INTO subjects (name, emoji, color, created_by) VALUES ($1,$2,$3,$4) RETURNING id, name, emoji, color',
      [name.trim(), emoji, color, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/subjects/bulk — admin setup
router.post('/bulk', verifyToken, async (req, res) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { subjects } = req.body;
  if (!Array.isArray(subjects) || subjects.length === 0)
    return res.status(400).json({ error: 'subjects array required' });
  const created = [];
  try {
    for (const s of subjects) {
      const { rows } = await db.query(
        `INSERT INTO subjects (name, emoji, color, created_by)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT DO NOTHING
         RETURNING id, name, emoji, color`,
        [s.name.trim(), s.emoji, s.color, req.user.id]
      );
      if (rows[0]) created.push(rows[0]);
    }
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
