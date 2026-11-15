-- FocusCampus PostgreSQL / Supabase Database Schema
-- Run this schema on PostgreSQL 15+ or Supabase SQL Editor for production cloud persistence.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users & Roles
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  institution TEXT DEFAULT '',
  course TEXT DEFAULT '',
  academic_year TEXT DEFAULT '',
  study_interests TEXT[] DEFAULT '{}',
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'campus')),
  study_points INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Academic Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL CHECK (category IN (
    'Assignments', 'Examinations', 'Research', 'Reading',
    'Projects', 'Personal Development', 'Group Work'
  )),
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  due_date DATE,
  reminder_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Study Planner Sessions
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT DEFAULT '',
  objective TEXT DEFAULT '',
  break_minutes INTEGER NOT NULL DEFAULT 5,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Focus Timer Logs
CREATE TABLE IF NOT EXISTS focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('pomodoro', 'short_break', 'long_break', 'custom')),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  subject TEXT DEFAULT 'General Focus',
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Digital Notes & Knowledge Hub
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  subject_folder TEXT NOT NULL DEFAULT 'Other Subjects',
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Academic Goals
CREATE TABLE IF NOT EXISTS academic_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  timeframe TEXT NOT NULL CHECK (timeframe IN ('Daily', 'Weekly', 'Monthly', 'Semester', 'Long-Term')),
  target_value INTEGER NOT NULL DEFAULT 100,
  current_value INTEGER NOT NULL DEFAULT 0,
  unit TEXT DEFAULT '%',
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Examinations & Academic Deadlines
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_code TEXT NOT NULL,
  title TEXT NOT NULL,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('Examination', 'Assignment', 'Project')),
  exam_date TIMESTAMPTZ NOT NULL,
  location TEXT DEFAULT '',
  submitted BOOLEAN NOT NULL DEFAULT FALSE,
  revision_progress INTEGER NOT NULL DEFAULT 0
);

-- Flashcards
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  mastered BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Community Discussions
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_display_name TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  is_reported BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_display_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row-Level Security (Supabase)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own study sessions" ON study_sessions
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notes" ON notes
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE academic_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own goals" ON academic_goals
  FOR ALL USING (auth.uid() = user_id);
