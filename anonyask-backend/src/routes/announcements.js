import { Router } from 'express';
import db from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

function fmt(a) {
  return {
    id: a.id,
    classId: a.class_id,
    title: a.title,
    content: a.content,
    priority: a.priority,
    postedBy: a.posted_by,
    pinned: a.pinned,
    createdAt: a.created_at,
  };
}

// GET /api/announcements?classId=
router.get('/', verifyToken, async (req, res) => {
  const { classId } = req.query;
  const params = [classId || null];
  const conditions = ['(class_id = $1 OR class_id IS NULL)'];

  try {
    const { rows } = await db.query(
      `SELECT * FROM announcements WHERE ${conditions.join(' AND ')}
       ORDER BY pinned DESC, created_at DESC`,
      params
    );
    res.json(rows.map(fmt));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/announcements — teacher or admin
router.post('/', verifyToken, requireRole('teacher', 'admin'), async (req, res) => {
  const { classId, title, content, priority } = req.body;
  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ error: 'title and content are required' });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO announcements (class_id, title, content, priority, posted_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [classId || null, title.trim(), content.trim(), priority || 'general', req.user.id]
    );
    const ann = fmt(rows[0]);
    const io = req.app.get('io');

    // Broadcast
    if (classId) {
      io.to(`class:${classId}`).emit('announcement:new', ann);
    } else {
      io.emit('announcement:new', ann); // school-wide
    }

    // Create notifications for all relevant users
    const { rows: users } = await db.query(
      classId
        ? 'SELECT id FROM users WHERE class_id = $1 AND id != $2'
        : 'SELECT id FROM users WHERE id != $1',
      classId ? [classId, req.user.id] : [req.user.id]
    );

    const notifText = `New ${ann.priority} announcement: ${ann.title}`;
    const notifInserts = users.map((u) =>
      db.query(
        `INSERT INTO notifications (user_id, type, text, class_id) VALUES ($1,'announcement',$2,$3) RETURNING *`,
        [u.id, notifText, classId || null]
      )
    );
    const notifResults = await Promise.all(notifInserts);
    notifResults.forEach((r, i) => {
      io.to(`user:${users[i].id}`).emit('notification:new', r.rows[0]);
    });

    res.status(201).json(ann);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
