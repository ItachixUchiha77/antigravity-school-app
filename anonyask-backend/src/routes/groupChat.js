import { Router } from 'express';
import db from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

function fmt(m) {
  return {
    id: m.id,
    classId: m.class_id,
    senderId: m.sender_id,
    type: m.type,
    text: m.text,
    audioUrl: m.audio_url,
    imageUrl: m.image_url,
    duration: m.duration,
    createdAt: m.created_at,
  };
}

// GET /api/group-messages/:classId
router.get('/:classId', verifyToken, async (req, res) => {
  const params = [req.params.classId];

  try {
    const { rows } = await db.query(
      `SELECT * FROM group_messages WHERE class_id = $1 ORDER BY created_at ASC`,
      params
    );
    res.json(rows.map(fmt));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/group-messages/:classId
router.post('/:classId', verifyToken, async (req, res) => {
  const { type = 'text', text, audioUrl, imageUrl, duration } = req.body;
  if (type === 'text'  && !text?.trim()) return res.status(400).json({ error: 'text is required' });
  if (type === 'voice' && !audioUrl)     return res.status(400).json({ error: 'audioUrl is required' });
  if (type === 'image' && !imageUrl)     return res.status(400).json({ error: 'imageUrl is required' });

  try {
    const { rows } = await db.query(
      `INSERT INTO group_messages (class_id, sender_id, type, text, audio_url, image_url, duration)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.params.classId, req.user.id, type, text?.trim() || null, audioUrl || null, imageUrl || null, duration || null]
    );
    const msg = fmt(rows[0]);
    req.app.get('io').to(`class:${req.params.classId}`).emit('group_message:new', msg);
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
