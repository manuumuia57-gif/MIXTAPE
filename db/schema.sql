-- DeKUT Past Papers Library — Dedan Kimathi University of Technology
-- PostgreSQL / Supabase Database Schema
-- Public students can read published academic resources without signing in.
-- Only the authenticated Administrator can upload, edit, replace, or delete records.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Private Administrator Account (No public registration)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT 'DeKUT Library Administrator',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Academic Departments & Schools/Faculties
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  school TEXT NOT NULL DEFAULT 'School of Computer Science & IT',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Courses (assigned to a Department)
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department_id);

-- 4. Academic Years
CREATE TABLE IF NOT EXISTS academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Uploaded Documents (Metadata + Object Storage Key)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  school TEXT NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  course_code TEXT NOT NULL,
  course_name TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  semester TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'Past Examination Papers',
    'CAT Papers',
    'Revision Materials',
    'Lecture Notes',
    'Assignments',
    'Practical Papers',
    'Other Study Materials'
  )),
  examination_type TEXT NOT NULL DEFAULT 'End of Semester Examination',
  description TEXT DEFAULT '',
  file_format TEXT NOT NULL CHECK (file_format IN ('PDF', 'DOCX', 'PPTX')),
  file_size_bytes BIGINT NOT NULL,
  storage_key TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  downloads_count INTEGER NOT NULL DEFAULT 0,
  is_example_sample BOOLEAN NOT NULL DEFAULT FALSE,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_documents_dept ON documents(department_id);
CREATE INDEX IF NOT EXISTS idx_documents_course ON documents(course_id);
CREATE INDEX IF NOT EXISTS idx_documents_year ON documents(academic_year);

-- 6. Website Settings
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_name TEXT NOT NULL DEFAULT 'DeKUT Past Papers Library',
  institution_name TEXT NOT NULL DEFAULT 'Dedan Kimathi University of Technology',
  tagline TEXT NOT NULL DEFAULT 'Access. Revise. Prepare. Succeed.',
  contact_email TEXT NOT NULL DEFAULT 'library@dkut-papers.ac.ke',
  contact_phone TEXT NOT NULL DEFAULT '+254 (0) 61 205 0000',
  about_text TEXT NOT NULL DEFAULT '',
  copyright_text TEXT NOT NULL DEFAULT '© 2026 Dedan Kimathi University of Technology — DeKUT Past Papers Library.'
);

-- 7. Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Supabase Row-Level Security Policies
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Public read courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Public read academic years" ON academic_years FOR SELECT USING (true);
CREATE POLICY "Public read documents" ON documents FOR SELECT USING (true);
