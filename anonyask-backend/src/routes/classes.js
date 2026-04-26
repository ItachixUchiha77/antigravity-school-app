import { Router } from 'express';
import db from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

const SECTIONS_MAP = {
  'A only':            ['A'],
  'A & B':             ['A', 'B'],
  'A, B & C':          ['A', 'B', 'C'],
  'A, B, C & D':       ['A', 'B', 'C', 'D'],
  'A–E (5 sections)':  ['A', 'B', 'C', 'D', 'E'],
};

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

// POST /api/classes/bulk  — admin only, creates all classes for a grade range + sections
router.post('/bulk', verifyToken, async (req, res) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const { classFrom, classTo, classMap = {} } = req.body;
  const from = Number(classFrom);
  const to   = Number(classTo);

  if (!from || !to || from > to || from < 1 || to > 12) {
    return res.status(400).json({ error: 'Invalid class range' });
  }

  const created = [];

  try {
    for (let grade = from; grade <= to; grade++) {
      const sectionLetters = SECTIONS_MAP[classMap[grade]] ?? ['A'];
      for (const sec of sectionLetters) {
        const { rows } = await db.query(
          `INSERT INTO classes (name, grade, section)
           VALUES ($1, $2, $3)
           ON CONFLICT DO NOTHING
           RETURNING id, name, grade, section`,
          [`Class ${grade}${sec}`, grade, sec]
        );
        if (rows[0]) created.push(rows[0]);
      }
    }
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
