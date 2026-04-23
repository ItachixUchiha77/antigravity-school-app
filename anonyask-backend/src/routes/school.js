import { Router } from 'express';
import db from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// GET /api/school — any authenticated user
router.get('/', verifyToken, async (_req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM school_settings LIMIT 1');
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/school — admin only, singleton upsert
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  const {
    schoolName, motto, board, schoolType, logoDataUrl,
    address, city, state, pinCode, phone, officialEmail,
    website, academicYear, classFrom, classTo, sections,
  } = req.body;
  try {
    await db.query('DELETE FROM school_settings');
    const { rows } = await db.query(
      `INSERT INTO school_settings
        (name, motto, board, school_type, logo_data_url, address, city, state,
         pin_code, phone, official_email, website, academic_year, class_from, class_to, sections)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [schoolName, motto, board, schoolType, logoDataUrl,
       address, city, state, pinCode, phone, officialEmail,
       website, academicYear, classFrom, classTo, sections],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
