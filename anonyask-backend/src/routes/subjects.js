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

export default router;
