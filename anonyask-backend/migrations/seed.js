// Dev seed script — populates the DB with test data matching the frontend mock
// Run: npm run seed
// Password for all accounts: password123

import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;
const isLocal = process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1');
const db = new Pool({ connectionString: process.env.DATABASE_URL, ssl: isLocal ? false : { rejectUnauthorized: false } });

const HASH = await bcrypt.hash('password123', 10);

async function seed() {
  console.log('Seeding database...');

  // ── Classes ────────────────────────────────────────────────────────────────
  const { rows: classes } = await db.query(`
    INSERT INTO classes (name, grade, section) VALUES
      ('Class 10A', 10, 'A'),
      ('Class 10B', 10, 'B'),
      ('Class 9A',   9, 'A'),
      ('Class 11A', 11, 'A')
    RETURNING id, name
  `);
  const cls = Object.fromEntries(classes.map((c) => [c.name, c.id]));
  console.log('Classes:', Object.keys(cls));

  // ── Subjects ───────────────────────────────────────────────────────────────
  const { rows: subjects } = await db.query(`
    INSERT INTO subjects (name, emoji, color) VALUES
      ('Mathematics',     '📐', '#3B82F6'),
      ('Science',         '🔬', '#22C55E'),
      ('English',         '📖', '#F59E0B'),
      ('History',         '🏛️', '#A855F7'),
      ('Computer Science','💻', '#EC4899'),
      ('Hindi',           '🗣️', '#14B8A6')
    RETURNING id, name
  `);
  const subj = Object.fromEntries(subjects.map((s) => [s.name, s.id]));
  console.log('Subjects:', Object.keys(subj));

  // ── Users ──────────────────────────────────────────────────────────────────
  const { rows: users } = await db.query(`
    INSERT INTO users (name, email, password_hash, role, class_id, initials) VALUES
      ('You (Student)',    's001@school.com',    $1, 'student', $2, 'YS'),
      ('Aisha Sharma',    's002@school.com',    $1, 'student', $2, 'AS'),
      ('Rohan Verma',     's003@school.com',    $1, 'student', $2, 'RV'),
      ('Priya Singh',     's004@school.com',    $1, 'student', $2, 'PS'),
      ('Arjun Mehta',     's005@school.com',    $1, 'student', $3, 'AM'),
      ('Mr. Kapoor',      't001@school.com',    $1, 'teacher', NULL, 'MK'),
      ('Ms. Sharma',      't002@school.com',    $1, 'teacher', NULL, 'SS'),
      ('Mr. Patel',       't003@school.com',    $1, 'teacher', NULL, 'MP'),
      ('Ms. Gupta',       't004@school.com',    $1, 'teacher', NULL, 'MG'),
      ('Mr. Khan',        't005@school.com',    $1, 'teacher', NULL, 'MK'),
      ('Principal Nair',  'admin@school.com',   $1, 'admin',   NULL, 'PN')
    RETURNING id, name, role
  `, [HASH, cls['Class 10A'], cls['Class 10B']]);

  const u = Object.fromEntries(users.map((u) => [u.name, u.id]));
  console.log('Users:', Object.keys(u));

  // ── Teacher ↔ Subjects ─────────────────────────────────────────────────────
  await db.query(`
    INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES
      ($1, $6), ($2, $7), ($3, $8), ($4, $9), ($5, $10)
  `, [
    u['Mr. Kapoor'], u['Ms. Sharma'], u['Mr. Patel'], u['Ms. Gupta'], u['Mr. Khan'],
    subj['Mathematics'], subj['Science'], subj['English'], subj['History'], subj['Computer Science'],
  ]);

  // ── Questions ──────────────────────────────────────────────────────────────
  const cls10a = cls['Class 10A'];
  await db.query(`
    INSERT INTO questions (class_id, subject_id, asked_by, text, upvotes, answered, answer, answered_by, answered_at, created_at) VALUES
    ($1, $2, $3, 'Ma''am, I still don''t understand when to use sin vs cos. Can you explain again?',
      14, TRUE,
      'Great question! Remember SOH-CAH-TOA:
- Sin = Opposite / Hypotenuse
- Cos = Adjacent / Hypotenuse
- Tan = Opposite / Adjacent',
      $7, '2026-04-12T08:30:00Z', '2026-04-11T14:20:00Z'),
    ($1, $2, $4, 'What is the difference between permutation and combination?',
      9, FALSE, NULL, NULL, NULL, '2026-04-12T07:10:00Z'),
    ($1, $5, $4, 'What exactly happens during the S phase of mitosis?',
      11, TRUE,
      'During the S phase (Synthesis phase):
DNA replicates — so you go from 2 chromatids to 4.
These become sister chromatids joined at the centromere.',
      $8, '2026-04-11T15:00:00Z', '2026-04-11T12:30:00Z'),
    ($1, $5, $6, 'In Ohm''s law, if resistance increases and voltage is constant, how does the circuit ''know'' to decrease current?',
      17, FALSE, NULL, NULL, NULL, '2026-04-12T10:15:00Z'),
    ($1, $9, $3, 'What is the difference between == and === in JavaScript?',
      8, FALSE, NULL, NULL, NULL, '2026-04-12T11:20:00Z')
  `, [
    cls10a,
    subj['Mathematics'], u['You (Student)'], u['Aisha Sharma'],
    subj['Science'],
    u['Rohan Verma'],
    u['Mr. Kapoor'], u['Ms. Sharma'],
    subj['Computer Science'],
  ]);
  console.log('Questions seeded');

  // ── Announcements ──────────────────────────────────────────────────────────
  await db.query(`
    INSERT INTO announcements (class_id, title, content, priority, posted_by, pinned, created_at) VALUES
    (NULL, '📅 Annual Sports Day — Registration Open!',
      'Registrations for Annual Sports Day 2026 are now open! Event: April 25th, 2026.',
      'important', $1, TRUE, '2026-04-12T09:00:00Z'),
    ($2, '📝 Class 10A — Mathematics Unit Test',
      'Mathematics Unit Test on April 16th. Syllabus: Trigonometry (Ch 8 & 9) and Statistics (Ch 14).',
      'urgent', $3, FALSE, '2026-04-11T16:00:00Z'),
    (NULL, '🏖️ Summer Vacation Notice',
      'School closed for Summer Vacation from May 5th to June 15th, 2026.',
      'general', $1, FALSE, '2026-04-10T10:00:00Z')
  `, [u['Principal Nair'], cls10a, u['Mr. Kapoor']]);
  console.log('Announcements seeded');

  // ── Conversations + Messages ───────────────────────────────────────────────
  const { rows: [conv1] } = await db.query('INSERT INTO conversations DEFAULT VALUES RETURNING id');
  await db.query('INSERT INTO conversation_participants (conv_id, user_id) VALUES ($1,$2),($1,$3)',
    [conv1.id, u['You (Student)'], u['Mr. Kapoor']]);
  await db.query(`
    INSERT INTO messages (conv_id, sender_id, type, text, read, created_at) VALUES
    ($1, $2, 'text', 'Sir, will coordinate geometry be in the unit test?', TRUE, '2026-04-11T17:30:00Z'),
    ($1, $3, 'text', 'No, focus only on Trigonometry (Ch 8 & 9) and Statistics (Ch 14).', TRUE, '2026-04-11T18:05:00Z'),
    ($1, $2, 'text', 'Thank you sir! Should we study proofs for trigonometric identities?', TRUE, '2026-04-11T18:10:00Z'),
    ($1, $3, 'text', 'Yes — sin²θ + cos²θ = 1, 1 + tan²θ = sec²θ, 1 + cot²θ = cosec²θ.', TRUE, '2026-04-11T18:15:00Z'),
    ($1, $2, 'text', 'Perfect, understood! Thank you so much sir 🙏', TRUE, '2026-04-11T18:17:00Z')
  `, [conv1.id, u['You (Student)'], u['Mr. Kapoor']]);

  // ── Group Messages ─────────────────────────────────────────────────────────
  await db.query(`
    INSERT INTO group_messages (class_id, sender_id, type, text, created_at) VALUES
    ($1, $2, 'text', 'Has anyone finished the History assignment? I''m stuck on question 5 😭', '2026-04-12T15:00:00Z'),
    ($1, $3, 'text', 'Which question 5? The partition one or Industrial Revolution?', '2026-04-12T15:02:00Z'),
    ($1, $4, 'text', 'Hi everyone! For question 5, check NCERT pages 134–138.', '2026-04-12T15:10:00Z'),
    ($1, $5, 'text', 'Thank you ma''am!! 🙏🙏', '2026-04-12T15:11:00Z'),
    ($1, $2, 'text', 'Also does anyone have the formula sheet for the math test?', '2026-04-12T17:00:00Z')
  `, [cls10a, u['Aisha Sharma'], u['Rohan Verma'], u['Ms. Gupta'], u['Priya Singh']]);
  console.log('Messages seeded');

  // ── Poll ───────────────────────────────────────────────────────────────────
  const { rows: [poll] } = await db.query(
    'INSERT INTO polls (class_id, subject_id, created_by, question, created_at) VALUES ($1,$2,$3,$4,$5) RETURNING id',
    [cls10a, subj['Mathematics'], u['Mr. Kapoor'],
     'Which topic do you find most challenging this semester?', '2026-04-12T09:30:00Z']
  );
  const { rows: options } = await db.query(`
    INSERT INTO poll_options (poll_id, text, display_order) VALUES
    ($1,'Trigonometry',0), ($1,'Statistics',1), ($1,'Probability',2), ($1,'Coordinate Geometry',3)
    RETURNING id, text
  `, [poll.id]);
  // Seed some votes
  await db.query('INSERT INTO poll_votes (poll_id, option_id, user_id) VALUES ($1,$2,$3),($1,$2,$4)',
    [poll.id, options[0].id, u['Aisha Sharma'], u['Rohan Verma']]);
  console.log('Poll seeded');

  // ── Quiz ───────────────────────────────────────────────────────────────────
  const { rows: [quiz] } = await db.query(
    'INSERT INTO quizzes (class_id, subject_id, created_by, title, created_at) VALUES ($1,$2,$3,$4,$5) RETURNING id',
    [cls10a, subj['Mathematics'], u['Mr. Kapoor'], 'Trigonometry Quick Check', '2026-04-11T14:00:00Z']
  );
  await db.query(`
    INSERT INTO quiz_questions (quiz_id, text, options, correct_index, display_order) VALUES
    ($1, 'What is sin(90°)?',        ARRAY['0','1','−1','1/√2'], 1, 0),
    ($1, 'sin²θ + cos²θ = ?',        ARRAY['0','2','1','tan θ'], 2, 1),
    ($1, 'What is tan(45°)?',        ARRAY['0','√3','1/√3','1'], 3, 2)
  `, [quiz.id]);
  console.log('Quiz seeded');

  // ── Assignment ─────────────────────────────────────────────────────────────
  await db.query(
    `INSERT INTO assignments (class_id, subject_id, created_by, title, description, due_date, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [cls10a, subj['Mathematics'], u['Mr. Kapoor'],
     'Trigonometry Problem Set — Ex 8.1 & 8.2',
     'Complete all problems from Exercise 8.1 and 8.2. Show all working steps.',
     '2026-04-20T23:59:00Z', '2026-04-11T09:00:00Z']
  );
  console.log('Assignment seeded');

  // ── Videos ─────────────────────────────────────────────────────────────────
  await db.query(`
    INSERT INTO videos (class_id, subject_id, uploaded_by, title, description, thumbnail, url, duration, created_at) VALUES
    ($1, $2, $3, 'Introduction to Trigonometry — SOH-CAH-TOA',
      'Learn SOH-CAH-TOA with worked examples from Chapter 8.',
      '📐', 'https://youtu.be/F21S9Wpi0y8', '18:32', '2026-04-10T08:00:00Z'),
    ($1, $4, $5, 'Cell Division — Mitosis & Meiosis Explained',
      'Visual walkthrough of cell division phases.',
      '🔬', 'https://youtu.be/qCLmR9-YY7o', '22:15', '2026-04-09T10:00:00Z'),
    ($1, $6, $7, 'The Hack Driver — Analysis & Summary',
      'In-depth analysis of the short story.',
      '📖', 'https://youtu.be/SzU2kxkFqLk', '14:08', '2026-04-08T12:00:00Z')
  `, [
    cls10a,
    subj['Mathematics'], u['Mr. Kapoor'],
    subj['Science'],     u['Ms. Sharma'],
    subj['English'],     u['Mr. Patel'],
  ]);
  console.log('Videos seeded');

  // ── Notifications ──────────────────────────────────────────────────────────
  const studentId = u['You (Student)'];
  await db.query(`
    INSERT INTO notifications (user_id, type, text, subject_id, read, created_at) VALUES
    ($1, 'answer', 'Mr. Kapoor answered your question in Mathematics', $2, FALSE, '2026-04-12T08:32:00Z'),
    ($1, 'announcement', 'New urgent announcement: Mathematics Unit Test', NULL, FALSE, '2026-04-11T16:01:00Z'),
    ($1, 'message', 'Mr. Kapoor sent you a message', NULL, TRUE, '2026-04-11T18:20:00Z')
  `, [studentId, subj['Mathematics']]);
  console.log('Notifications seeded');

  console.log('\n✅ Seed complete!');
  console.log('\nDemo login credentials (password: password123):');
  console.log('  Student : s001@school.com');
  console.log('  Teacher : t001@school.com');
  console.log('  Admin   : admin@school.com');

  await db.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
