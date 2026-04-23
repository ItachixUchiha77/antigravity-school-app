import { Router } from 'express';
import db from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

function fmtMsg(m) {
  return {
    id: m.id,
    convId: m.conv_id,
    senderId: m.sender_id,
    type: m.type,
    text: m.text,
    audioUrl: m.audio_url,
    imageUrl: m.image_url,
    duration: m.duration,
    read: m.read,
    createdAt: m.created_at,
  };
}

// GET /api/conversations — my conversations
router.get('/', verifyToken, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT
         c.id AS conv_id,
         cp2.user_id AS other_id,
         u.name, u.role, u.initials, u.class_id,
         u.avatar_emoji, u.avatar_color,
         (SELECT row_to_json(m)
          FROM (SELECT text, type, sender_id, created_at
                FROM messages WHERE conv_id = c.id
                ORDER BY created_at DESC LIMIT 1) m
         ) AS last_message
       FROM conversations c
       JOIN conversation_participants cp1 ON cp1.conv_id = c.id AND cp1.user_id = $1
       JOIN conversation_participants cp2 ON cp2.conv_id = c.id AND cp2.user_id != $1
       JOIN users u ON u.id = cp2.user_id
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json(rows.map((r) => ({
      convId: r.conv_id,
      other: {
        id: r.other_id,
        name: r.name,
        role: r.role,
        classId: r.class_id,
        initials: r.initials,
        avatarEmoji: r.avatar_emoji,
        avatarColor: r.avatar_color,
      },
      lastMessage: r.last_message,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/conversations — find or create DM with another user
router.post('/', verifyToken, async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  if (userId === req.user.id) return res.status(400).json({ error: 'Cannot message yourself' });

  try {
    // Check if conversation already exists
    const { rows: existing } = await db.query(
      `SELECT c.id FROM conversations c
       JOIN conversation_participants cp1 ON cp1.conv_id = c.id AND cp1.user_id = $1
       JOIN conversation_participants cp2 ON cp2.conv_id = c.id AND cp2.user_id = $2`,
      [req.user.id, userId]
    );
    if (existing.length > 0) return res.json({ convId: existing[0].id });

    // Create new conversation
    const { rows } = await db.query('INSERT INTO conversations DEFAULT VALUES RETURNING id');
    const convId = rows[0].id;
    await db.query(
      'INSERT INTO conversation_participants (conv_id, user_id) VALUES ($1,$2),($1,$3)',
      [convId, req.user.id, userId]
    );
    res.status(201).json({ convId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/conversations/:id/messages
router.get('/:id/messages', verifyToken, async (req, res) => {
  try {
    const { rowCount } = await db.query(
      'SELECT 1 FROM conversation_participants WHERE conv_id=$1 AND user_id=$2',
      [req.params.id, req.user.id]
    );
    if (!rowCount) return res.status(403).json({ error: 'Not a participant' });

    const { rows } = await db.query(
      'SELECT * FROM messages WHERE conv_id=$1 ORDER BY created_at ASC',
      [req.params.id]
    );

    // Mark received messages as read
    await db.query(
      'UPDATE messages SET read=TRUE WHERE conv_id=$1 AND sender_id!=$2 AND read=FALSE',
      [req.params.id, req.user.id]
    );

    res.json(rows.map(fmtMsg));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/conversations/:id/messages — send a message
router.post('/:id/messages', verifyToken, async (req, res) => {
  try {
    const { rows: participants } = await db.query(
      'SELECT user_id FROM conversation_participants WHERE conv_id=$1',
      [req.params.id]
    );
    if (!participants.find((p) => p.user_id === req.user.id)) {
      return res.status(403).json({ error: 'Not a participant' });
    }

    const recipientId = participants.find((p) => p.user_id !== req.user.id)?.user_id;

    // Rule: students cannot send to admin; only admin can initiate with students
    if (recipientId) {
      const { rows: rRows } = await db.query('SELECT role FROM users WHERE id=$1', [recipientId]);
      const recipientRole = rRows[0]?.role;
      if (req.user.role === 'student' && recipientRole === 'admin') {
        return res.status(403).json({ error: 'Only the Principal can send messages in this conversation.' });
      }
    }

    const { type = 'text', text, audioUrl, imageUrl, duration } = req.body;
    if (type === 'text'  && !text?.trim()) return res.status(400).json({ error: 'text is required' });
    if (type === 'voice' && !audioUrl)     return res.status(400).json({ error: 'audioUrl is required' });
    if (type === 'image' && !imageUrl)     return res.status(400).json({ error: 'imageUrl is required' });

    const { rows } = await db.query(
      `INSERT INTO messages (conv_id, sender_id, type, text, audio_url, image_url, duration)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.params.id, req.user.id, type, text?.trim() || null, audioUrl || null, imageUrl || null, duration || null]
    );
    const msg = fmtMsg(rows[0]);
    const io = req.app.get('io');

    // Deliver to recipient
    io.to(`user:${recipientId}`).emit('message:new', msg);

    // Notify recipient
    const { rows: sRows } = await db.query('SELECT name FROM users WHERE id=$1', [req.user.id]);
    const { rows: nRows } = await db.query(
      `INSERT INTO notifications (user_id, type, text, conv_id) VALUES ($1,'message',$2,$3) RETURNING *`,
      [recipientId, `${sRows[0]?.name} sent you a message`, req.params.id]
    );
    io.to(`user:${recipientId}`).emit('notification:new', nRows[0]);

    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
