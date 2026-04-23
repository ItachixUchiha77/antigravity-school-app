import { Router } from 'express';
import db from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

async function formatQuiz(quiz, showAnswers = false) {
  const { rows: questions } = await db.query(
    'SELECT * FROM quiz_questions WHERE quiz_id=$1 ORDER BY display_order',
    [quiz.id]
  );
  const { rows: subs } = await db.query(
    'SELECT * FROM quiz_submissions WHERE quiz_id=$1',
    [quiz.id]
  );
  return {
    id: quiz.id,
    classId: quiz.class_id,
    subjectId: quiz.subject_id,
    createdBy: quiz.created_by,
    title: quiz.title,
    questions: questions.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options,
      ...(showAnswers ? { correctIndex: q.correct_index } : {}),
    })),
    submissions: Object.fromEntries(
      subs.map((s) => [s.user_id, { answers: s.answers, score: s.score, submittedAt: s.submitted_at }])
    ),
    createdAt: quiz.created_at,
  };
}

// GET /api/quizzes?classId=&subjectId=
router.get('/', verifyToken, async (req, res) => {
  const { classId, subjectId } = req.query;
  const conditions = [];
  const params = [];
  if (classId)   { params.push(classId);   conditions.push(`class_id = $${params.length}`); }
  if (subjectId) { params.push(subjectId); conditions.push(`subject_id = $${params.length}`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const showAnswers = ['teacher', 'admin'].includes(req.user.role);
  try {
    const { rows } = await db.query(`SELECT * FROM quizzes ${where} ORDER BY created_at DESC`, params);
    res.json(await Promise.all(rows.map((q) => formatQuiz(q, showAnswers))));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quizzes — teacher only
router.post('/', verifyToken, requireRole('teacher'), async (req, res) => {
  const { classId, subjectId, title, questions } = req.body;
  if (!title?.trim() || !Array.isArray(questions) || !questions.length) {
    return res.status(400).json({ error: 'title and questions are required' });
  }
  try {
    const { rows } = await db.query(
      'INSERT INTO quizzes (class_id, subject_id, created_by, title) VALUES ($1,$2,$3,$4) RETURNING *',
      [classId || null, subjectId || null, req.user.id, title.trim()]
    );
    const quiz = rows[0];
    for (let i = 0; i < questions.length; i++) {
      const { text, options, correctIndex } = questions[i];
      await db.query(
        'INSERT INTO quiz_questions (quiz_id, text, options, correct_index, display_order) VALUES ($1,$2,$3,$4,$5)',
        [quiz.id, text, options, correctIndex, i]
      );
    }
    const formatted = await formatQuiz(quiz, true);
    if (classId) req.app.get('io').to(`class:${classId}`).emit('quiz:new', formatted);
    res.status(201).json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quizzes/:id/submit — student only
router.post('/:id/submit', verifyToken, requireRole('student'), async (req, res) => {
  const { answers } = req.body;
  if (!Array.isArray(answers)) return res.status(400).json({ error: 'answers array is required' });
  try {
    const { rows: qs } = await db.query(
      'SELECT correct_index FROM quiz_questions WHERE quiz_id=$1 ORDER BY display_order',
      [req.params.id]
    );
    const score = answers.filter((a, i) => a === qs[i]?.correct_index).length;
    await db.query(
      `INSERT INTO quiz_submissions (quiz_id, user_id, answers, score)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (quiz_id, user_id) DO UPDATE SET answers=$3, score=$4, submitted_at=NOW()`,
      [req.params.id, req.user.id, answers, score]
    );
    res.json({ score, total: qs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
