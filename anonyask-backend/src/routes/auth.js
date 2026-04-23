import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

function formatUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    classId: u.class_id,
    initials: u.initials,
    avatarEmoji: u.avatar_emoji,
    avatarColor: u.avatar_color,
    subjects: u.subjects?.filter(Boolean) ?? [],
  };
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const { rows } = await db.query(
      `SELECT u.*, array_agg(ts.subject_id) FILTER (WHERE ts.subject_id IS NOT NULL) AS subjects
       FROM users u
       LEFT JOIN teacher_subjects ts ON ts.teacher_id = u.id
       WHERE u.email = $1
       GROUP BY u.id`,
      [email.toLowerCase().trim()]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, classId: user.class_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT u.*, array_agg(ts.subject_id) FILTER (WHERE ts.subject_id IS NOT NULL) AS subjects
       FROM users u
       LEFT JOIN teacher_subjects ts ON ts.teacher_id = u.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(formatUser(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
