import { Router } from 'express';
import db from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

function fmt(n) {
  return {
    id: n.id,
    type: n.type,
    text: n.text,
    read: n.read,
    subjectId: n.subject_id,
    classId: n.class_id,
    convId: n.conv_id,
    createdAt: n.created_at,
  };
}

// GET /api/notifications — with admin role filter applied
router.get('/', verifyToken, async (req, res) => {
  try {
    let { rows } = await db.query(
      'SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );

    // Admin sees only: announcements + messages from teachers
    if (req.user.role === 'admin') {
      const msgConvIds = rows.filter((n) => n.type === 'message' && n.conv_id).map((n) => n.conv_id);

      let teacherConvSet = new Set();
      if (msgConvIds.length > 0) {
        const { rows: tConvs } = await db.query(
          `SELECT DISTINCT cp.conv_id FROM conversation_participants cp
           JOIN users u ON u.id = cp.user_id AND u.role = 'teacher'
           WHERE cp.conv_id = ANY($1)`,
          [msgConvIds]
        );
        teacherConvSet = new Set(tConvs.map((r) => r.conv_id));
      }

      rows = rows.filter((n) => {
        if (n.type === 'announcement') return true;
        if (n.type === 'message')      return teacherConvSet.has(n.conv_id);
        return false;
      });
    }

    res.json(rows.map(fmt));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', verifyToken, async (req, res) => {
  try {
    await db.query('UPDATE notifications SET read=TRUE WHERE user_id=$1', [req.user.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
