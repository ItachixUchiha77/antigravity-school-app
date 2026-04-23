-- AnonyASK Database Schema
-- Run: psql -U postgres -d anonyask -f migrations/001_schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Classes ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS classes (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name    VARCHAR(100) NOT NULL,
  grade   INT          NOT NULL,
  section VARCHAR(10)  NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  class_id      UUID REFERENCES classes(id) ON DELETE SET NULL,
  initials      VARCHAR(10)  NOT NULL,
  avatar_emoji  VARCHAR(10),
  avatar_color  VARCHAR(10),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Subjects ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subjects (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL,
  emoji      VARCHAR(10)  NOT NULL,
  color      VARCHAR(10)  NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Teacher ↔ Subjects (many-to-many) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS teacher_subjects (
  teacher_id UUID REFERENCES users(id)    ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  PRIMARY KEY (teacher_id, subject_id)
);

-- ─── Anonymous Questions ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id    UUID REFERENCES classes(id)  ON DELETE CASCADE,
  subject_id  UUID REFERENCES subjects(id) ON DELETE CASCADE,
  asked_by    UUID REFERENCES users(id)    ON DELETE SET NULL,
  text        TEXT NOT NULL,
  upvotes     INT  DEFAULT 0,
  answered    BOOLEAN DEFAULT FALSE,
  answer      TEXT,
  answered_by UUID REFERENCES users(id)    ON DELETE SET NULL,
  answered_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS question_upvotes (
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id)     ON DELETE CASCADE,
  PRIMARY KEY (question_id, user_id)
);

-- ─── Announcements ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id   UUID REFERENCES classes(id) ON DELETE CASCADE, -- NULL = school-wide
  title      VARCHAR(255) NOT NULL,
  content    TEXT         NOT NULL,
  priority   VARCHAR(20)  DEFAULT 'general' CHECK (priority IN ('general', 'important', 'urgent')),
  posted_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  pinned     BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Private Conversations ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_participants (
  conv_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id)         ON DELETE CASCADE,
  PRIMARY KEY (conv_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conv_id    UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id  UUID REFERENCES users(id)         ON DELETE SET NULL,
  type       VARCHAR(10) DEFAULT 'text' CHECK (type IN ('text', 'voice')),
  text       TEXT,
  audio_url  TEXT,
  duration   INT,  -- seconds
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Group Chat ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS group_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id   UUID REFERENCES classes(id) ON DELETE CASCADE,
  sender_id  UUID REFERENCES users(id)   ON DELETE SET NULL,
  type       VARCHAR(10) DEFAULT 'text' CHECK (type IN ('text', 'voice')),
  text       TEXT,
  audio_url  TEXT,
  duration   INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Videos ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS videos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id    UUID REFERENCES classes(id)  ON DELETE CASCADE,
  subject_id  UUID REFERENCES subjects(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id)    ON DELETE SET NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail   VARCHAR(20),
  url         TEXT NOT NULL,
  duration    VARCHAR(10),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Polls ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS polls (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id   UUID REFERENCES classes(id)  ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id)    ON DELETE SET NULL,
  question   TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS poll_options (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id       UUID REFERENCES polls(id) ON DELETE CASCADE,
  text          VARCHAR(255) NOT NULL,
  display_order INT NOT NULL
);

CREATE TABLE IF NOT EXISTS poll_votes (
  poll_id   UUID REFERENCES polls(id)        ON DELETE CASCADE,
  option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES users(id)        ON DELETE CASCADE,
  PRIMARY KEY (poll_id, user_id)
);

-- ─── Quizzes ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quizzes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id   UUID REFERENCES classes(id)  ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id)    ON DELETE SET NULL,
  title      VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id       UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  text          TEXT     NOT NULL,
  options       TEXT[]   NOT NULL,
  correct_index INT      NOT NULL,
  display_order INT      NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_submissions (
  quiz_id      UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES users(id)   ON DELETE CASCADE,
  answers      INT[],
  score        INT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (quiz_id, user_id)
);

-- ─── Assignments ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assignments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id    UUID REFERENCES classes(id)  ON DELETE CASCADE,
  subject_id  UUID REFERENCES subjects(id) ON DELETE CASCADE,
  created_by  UUID REFERENCES users(id)    ON DELETE SET NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  due_date    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id)       ON DELETE CASCADE,
  note          TEXT,
  submitted_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (assignment_id, user_id)
);

-- ─── Notifications ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id)         ON DELETE CASCADE,
  type       VARCHAR(30) NOT NULL,
  text       TEXT        NOT NULL,
  read       BOOLEAN DEFAULT FALSE,
  subject_id UUID REFERENCES subjects(id)      ON DELETE SET NULL,
  class_id   UUID REFERENCES classes(id)       ON DELETE SET NULL,
  conv_id    UUID REFERENCES conversations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_questions_class_subject  ON questions(class_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv            ON messages(conv_id, created_at);
CREATE INDEX IF NOT EXISTS idx_group_messages_class     ON group_messages(class_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user       ON notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_class      ON announcements(class_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_polls_class_subject      ON polls(class_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_videos_class_subject     ON videos(class_id, subject_id);
