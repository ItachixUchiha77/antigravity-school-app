import { Router } from 'express';
import db from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// GET /api/classes
router.get('/', verifyToken, async (_req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, grade, section FROM classes ORDER BY grade, section'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
