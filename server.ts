import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  DocumentCategory,
  DocumentStatus,
  FileFormat,
  UserRole,
  VaultDocument,
  VerificationLevel,
} from './src/types/vault';
import {
  hashPassword,
  StoredUserRecord,
  UPLOADS_DIR,
  vaultStore,
  verifyPassword,
} from './server/vaultStore';
import { ensureDemoPdfFile } from './server/pdfGenerator';

const PORT = 3000;
const AUTH_SECRET = process.env.AUTH_SECRET || 'campus-exam-vault-dev-secret-2026';

interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  exp: number;
}

function signToken(payload: { id: string; email: string; role: UserRole }): string {
  const data = Buffer.from(
    JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifyToken(token: string): TokenPayload | null {
  const [data, sig] = token.split('.');
  if (!data || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');
  if (sig.length !== expectedSig.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as TokenPayload;
    if (typeof parsed.exp === 'number' && parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function getAuthenticatedUser(req: Request): StoredUserRecord | null {
  const authHeader = req.headers.authorization;
  const queryToken = typeof req.query.token === 'string' ? req.query.token : '';
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : queryToken;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  const user = vaultStore.getState().users.find((u) => u.id === decoded.id);
  if (!user || user.status === 'suspended') return null;
  return user;
}

// Simple sliding-window rate limiter per IP + route bucket
const rateBuckets = new Map<string, number[]>();
function rateLimit(bucket: string, maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'local';
    const key = `${bucket}:${ip}`;
    const now = Date.now();
    const recent = (rateBuckets.get(key) || []).filter((t) => now - t < windowMs);
    if (recent.length >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
    }
    recent.push(now);
    rateBuckets.set(key, recent);
    next();
  };
}

// Magic-byte validation to reject disguised executables or invalid uploads
function validateFileMagicBytes(buffer: Buffer, originalName: string): FileFormat | null {
  if (buffer.length < 8) return null;

  // Reject PE executables (MZ), ELF binaries, Mach-O, or shell scripts
  if (
    (buffer[0] === 0x4d && buffer[1] === 0x5a) ||
    (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) ||
    (buffer[0] === 0x23 && buffer[1] === 0x21)
  ) {
    return null;
  }

  const ext = path.extname(originalName).toLowerCase();
  const headerAscii = buffer.subarray(0, 1024).toString('latin1');

  // PDF magic bytes: %PDF-
  if (headerAscii.includes('%PDF-') && ext === '.pdf') {
    return 'PDF';
  }

  // OOXML (DOCX / PPTX) are ZIP containers starting with PK\x03\x04
  if (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
    const rawStr = buffer.toString('latin1');
    if (ext === '.docx' && (rawStr.includes('word/') || rawStr.includes('[Content_Types].xml'))) {
      return 'DOCX';
    }
    if (ext === '.pptx' && (rawStr.includes('ppt/') || rawStr.includes('[Content_Types].xml'))) {
      return 'PPTX';
    }
  }

  return null;
}

async function resolveDocumentFilePath(doc: VaultDocument): Promise<string | null> {
  const uploadedPath = path.join(UPLOADS_DIR, doc.storedFilename);
  if (fs.existsSync(uploadedPath)) {
    return uploadedPath;
  }
  if (doc.fileFormat === 'PDF') {
    return await ensureDemoPdfFile(doc);
  }
  return null;
}

function canViewDocument(doc: VaultDocument, user: StoredUserRecord | null): boolean {
  if (doc.status === 'approved') return true;
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'moderator') return true;
  if (doc.uploadedById === user.id) return true;
  if (user.role === 'lecturer' && user.departmentId === doc.departmentId && doc.status === 'pending') {
    return true;
  }
  return false;
}

function buildDemoAiPracticeReply(prompt: string, courseContext?: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes('suggest') || lower.includes('metadata') || lower.includes('categor')) {
    return [
      '[AI-Assisted Metadata Suggestion — Verify Before Saving]',
      '',
      '• Suggested Category: End-of-Semester Examinations',
      '• Recommended Keywords: Section A Compulsory, Analytical Derivations, Time Allowed 3 Hours',
      '• Verification Guidance: Student uploads require Moderator approval before entering the public library.',
    ].join('\n');
  }

  return [
    `[AI-Generated Practice Material — Not an Official Examination Paper]`,
    courseContext ? `Course Reference: ${courseContext}` : '',
    '',
    'Practice Question 1 (Foundational — 10 Marks)',
    'Define the core structural principles governing this topic and state two assumptions required for validity.',
    '',
    'Practice Question 2 (Analytical Application — 15 Marks)',
    'Walk through a concrete worked example demonstrating step-by-step derivation, boundary conditions, and error verification.',
    '',
    'Practice Question 3 (Design & Evaluation — 15 Marks)',
    'Compare two competing methodologies studied in this unit across scalability, reliability, and edge-case behavior.',
  ]
    .filter(Boolean)
    .join('\n');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  const uploadMiddleware = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
  });

  app.get('/api/health', (_req: Request, res: Response) => {
    const hasLiveGemini =
      Boolean(process.env.GEMINI_API_KEY) &&
      process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';
    res.json({ ok: true, service: 'Campus Exam Vault', aiMode: hasLiveGemini ? 'live' : 'demo' });
  });

  // -------------------------------------------------------------------------
  // AUTHENTICATION & USER ACCOUNT ROUTES
  // -------------------------------------------------------------------------
  app.post('/api/auth/register', rateLimit('auth', 20, 60_000), (req: Request, res: Response) => {
    const state = vaultStore.getState();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const fullName = String(req.body?.fullName || '').trim();
    const departmentId = String(req.body?.departmentId || 'dept-csc');
    const academicYear = String(req.body?.academicYear || 'Year 1');

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid institutional email address.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }
    if (!fullName) {
      return res.status(400).json({ error: 'Full name is required.' });
    }
    if (state.users.some((u) => u.email.toLowerCase() === email)) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const dept = state.departments.find((d) => d.id === departmentId) || state.departments[0];
    const prog = state.programmes.find((p) => p.departmentId === dept.id) || state.programmes[0];
    const campus = state.campuses[0];
    const inst = state.institutions[0];

    const newUser: StoredUserRecord = {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      email,
      passwordHash: hashPassword(password),
      fullName,
      role: 'student',
      status: 'active',
      institutionId: inst.id,
      institutionName: inst.name,
      campusId: campus.id,
      campusName: campus.name,
      departmentId: dept.id,
      departmentName: dept.name,
      programmeId: prog.id,
      programmeName: prog.name,
      academicYear,
      avatarUrl: '/src/assets/images/avatar_student_portal_1794745517683.jpg',
      contributionPoints: 0,
      approvedUploadsCount: 0,
      badges: ['Registered Scholar'],
      notificationPrefs: { newPapers: true, uploadApprovals: true, announcements: true },
      createdAt: new Date().toISOString(),
    };

    state.users.push(newUser);
    vaultStore.pushNotification(
      newUser.id,
      'Welcome',
      'Welcome to Campus Exam Vault',
      `Your student library profile for ${dept.name} is active. Start browsing past papers or build your revision collections.`
    );
    vaultStore.addAuditLog(newUser, 'USER_REGISTERED', 'user', newUser.id, `Registered student account ${email}`);
    vaultStore.persist();

    const token = signToken({ id: newUser.id, email: newUser.email, role: newUser.role });
    return res.status(201).json({ token, user: vaultStore.sanitizeUser(newUser) });
  });

  app.post('/api/auth/login', rateLimit('auth', 30, 60_000), (req: Request, res: Response) => {
    const state = vaultStore.getState();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    const user = state.users.find((u) => u.email.toLowerCase() === email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'This account has been suspended by an administrator.' });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return res.json({ token, user: vaultStore.sanitizeUser(user) });
  });

  app.post('/api/auth/recover', rateLimit('auth', 10, 60_000), (req: Request, res: Response) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid institutional email.' });
    }
    return res.json({
      message:
        'If an account matches that email, password reset instructions have been queued (Demo Mode: no outbound SMTP server connected).',
    });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    return res.json({ user: vaultStore.sanitizeUser(user) });
  });

  app.patch('/api/auth/preferences', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });

    const prefs = req.body?.notificationPrefs;
    if (prefs && typeof prefs === 'object') {
      user.notificationPrefs = {
        newPapers: Boolean(prefs.newPapers),
        uploadApprovals: Boolean(prefs.uploadApprovals),
        announcements: Boolean(prefs.announcements),
      };
    }
    if (typeof req.body?.academicYear === 'string' && req.body.academicYear.trim()) {
      user.academicYear = req.body.academicYear.trim();
    }
    if (typeof req.body?.departmentId === 'string') {
      const dept = vaultStore.getState().departments.find((d) => d.id === req.body.departmentId);
      if (dept) {
        user.departmentId = dept.id;
        user.departmentName = dept.name;
      }
    }
    vaultStore.persist();
    return res.json({ user: vaultStore.sanitizeUser(user) });
  });

  app.post('/api/auth/change-password', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    const currentPassword = String(req.body?.currentPassword || '');
    const newPassword = String(req.body?.newPassword || '');
    if (!verifyPassword(currentPassword, user.passwordHash)) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    }
    user.passwordHash = hashPassword(newPassword);
    vaultStore.persist();
    return res.json({ message: 'Password updated successfully.' });
  });

  // -------------------------------------------------------------------------
  // PUBLIC CATALOG & HIERARCHY
  // -------------------------------------------------------------------------
  app.get('/api/catalog', (_req: Request, res: Response) => {
    const state = vaultStore.getState();
    const approvedDocs = state.documents.filter((d) => d.status === 'approved');
    const pastPaperCategories = new Set([
      'Past Examination Papers',
      'CAT Papers',
      'Mid-Semester Examinations',
      'End-of-Semester Examinations',
      'Supplementary Examinations',
      'Special Examinations',
      'Practical Examinations',
    ]);
    const totalPastPapers = approvedDocs.filter((d) => pastPaperCategories.has(d.category)).length;
    const totalDownloads = approvedDocs.reduce((sum, d) => sum + d.downloadsCount, 0);

    return res.json({
      institutions: state.institutions,
      campuses: state.campuses,
      faculties: state.faculties,
      departments: state.departments,
      programmes: state.programmes,
      courses: state.courses,
      academicYears: state.academicYears,
      semesters: state.semesters,
      categories: state.categories,
      announcements: state.announcements,
      settings: state.settings,
      stats: {
        totalPastPapers,
        availableCourses: state.courses.length,
        academicDepartments: state.departments.length,
        registeredStudents: state.users.filter((u) => u.role === 'student').length,
        uploadedResources: approvedDocs.length,
        totalDownloads,
      },
    });
  });

  // -------------------------------------------------------------------------
  // DOCUMENTS SEARCH, VIEW, PREVIEW, DOWNLOAD, UPLOAD & MODERATION
  // -------------------------------------------------------------------------
  app.get('/api/documents', (req: Request, res: Response) => {
    const state = vaultStore.getState();
    const user = getAuthenticatedUser(req);

    const q = String(req.query.q || '').trim().toLowerCase();
    const institutionId = String(req.query.institutionId || '');
    const campusId = String(req.query.campusId || '');
    const facultyId = String(req.query.facultyId || '');
    const departmentId = String(req.query.departmentId || '');
    const programmeId = String(req.query.programmeId || '');
    const courseId = String(req.query.courseId || '');
    const academicYear = String(req.query.academicYear || '');
    const semester = String(req.query.semester || '');
    const category = String(req.query.category || '');
    const fileFormat = String(req.query.fileFormat || '');
    const verificationLevel = String(req.query.verificationLevel || '');
    const requestedStatus = String(req.query.status || 'approved') as DocumentStatus | 'all';
    const sort = String(req.query.sort || 'newest');

    let items = state.documents.filter((doc) => {
      if (requestedStatus === 'all') {
        if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
          return doc.status === 'approved' || (user ? doc.uploadedById === user.id : false);
        }
        return true;
      }
      if (requestedStatus !== 'approved') {
        return doc.status === requestedStatus && canViewDocument(doc, user);
      }
      return doc.status === 'approved';
    });

    if (institutionId) items = items.filter((d) => d.institutionId === institutionId);
    if (campusId) items = items.filter((d) => d.campusId === campusId);
    if (facultyId) items = items.filter((d) => d.facultyId === facultyId);
    if (departmentId) items = items.filter((d) => d.departmentId === departmentId);
    if (programmeId) items = items.filter((d) => d.programmeId === programmeId);
    if (courseId) items = items.filter((d) => d.courseId === courseId);
    if (academicYear) items = items.filter((d) => d.academicYear === academicYear);
    if (semester) items = items.filter((d) => d.semester === semester);
    if (category) items = items.filter((d) => d.category === category);
    if (fileFormat) items = items.filter((d) => d.fileFormat === fileFormat);
    if (verificationLevel) items = items.filter((d) => d.verificationLevel === verificationLevel);

    if (q) {
      items = items.filter((d) =>
        [
          d.title,
          d.courseCode,
          d.courseName,
          d.departmentName,
          d.facultyName,
          d.programmeName,
          d.academicYear,
          d.semester,
          d.examType,
          d.category,
          d.lecturerName,
          d.description,
          d.ocrText,
          d.accessionNumber,
        ]
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }

    if (sort === 'popular') {
      items.sort((a, b) => b.downloadsCount - a.downloadsCount);
    } else if (sort === 'alpha') {
      items.sort((a, b) => a.courseCode.localeCompare(b.courseCode) || a.title.localeCompare(b.title));
    } else {
      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    return res.json({ documents: items, total: items.length });
  });

  app.get('/api/documents/:id', (req: Request, res: Response) => {
    const state = vaultStore.getState();
    const user = getAuthenticatedUser(req);
    const doc = state.documents.find((d) => d.id === req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found.' });
    if (!canViewDocument(doc, user)) {
      return res.status(403).json({ error: 'You do not have permission to view this document.' });
    }

    if (doc.status === 'approved') {
      doc.viewsCount += 1;
      if (user) {
        const list = state.recentViewsByUser[user.id] || [];
        state.recentViewsByUser[user.id] = [doc.id, ...list.filter((x) => x !== doc.id)].slice(0, 12);
      }
      vaultStore.persist();
    }

    const related = state.documents
      .filter((d) => d.status === 'approved' && d.id !== doc.id && (d.courseId === doc.courseId || d.departmentId === doc.departmentId))
      .slice(0, 4);

    return res.json({ document: doc, related });
  });

  app.get('/api/documents/:id/file', async (req: Request, res: Response) => {
    const state = vaultStore.getState();
    const user = getAuthenticatedUser(req);
    const doc = state.documents.find((d) => d.id === req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found.' });
    if (!canViewDocument(doc, user)) {
      return res.status(403).json({ error: 'Unauthorized access to non-public document.' });
    }

    const filePath = await resolveDocumentFilePath(doc);
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Stored file unavailable for preview.' });
    }

    const contentType =
      doc.fileFormat === 'PDF'
        ? 'application/pdf'
        : doc.fileFormat === 'DOCX'
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${doc.originalFilename}"`);
    return res.sendFile(filePath);
  });

  app.get('/api/documents/:id/download', async (req: Request, res: Response) => {
    const state = vaultStore.getState();
    const user = getAuthenticatedUser(req);
    const doc = state.documents.find((d) => d.id === req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found.' });
    if (!canViewDocument(doc, user)) {
      return res.status(403).json({ error: 'Unauthorized download request.' });
    }

    const filePath = await resolveDocumentFilePath(doc);
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Stored file missing.' });
    }

    if (doc.status === 'approved') {
      doc.downloadsCount += 1;
      if (user) {
        const list = state.recentDownloadsByUser[user.id] || [];
        state.recentDownloadsByUser[user.id] = [doc.id, ...list.filter((x) => x !== doc.id)].slice(0, 15);
      }
      vaultStore.persist();
    }

    return res.download(filePath, doc.originalFilename);
  });

  app.post(
    '/api/documents/upload',
    rateLimit('upload', 15, 60_000),
    uploadMiddleware.single('file'),
    (req: Request, res: Response) => {
      const user = getAuthenticatedUser(req);
      if (!user) {
        return res.status(401).json({ error: 'Please sign in to upload academic materials.' });
      }

      const state = vaultStore.getState();
      if (user.role === 'student' && !state.settings.allowStudentUploads) {
        return res.status(403).json({ error: 'Student uploads are currently disabled by institutional policy.' });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'Please attach a valid PDF, DOCX, or PPTX file.' });
      }

      const maxBytes = state.settings.maxUploadSizeMb * 1024 * 1024;
      if (file.size > maxBytes) {
        return res.status(413).json({
          error: `File exceeds the configured maximum limit of ${state.settings.maxUploadSizeMb} MB.`,
        });
      }

      const detectedFormat = validateFileMagicBytes(file.buffer, file.originalname);
      if (!detectedFormat || !state.settings.allowedFormats.includes(detectedFormat)) {
        return res.status(400).json({
          error: 'Invalid or unsafe file content. Only genuine PDF, DOCX, or PPTX documents are accepted (magic-byte verified).',
        });
      }

      // Duplicate detection via SHA-256 hash
      const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
      const existingDup = state.documents.find((d) => d.fileHash === fileHash && d.status !== 'rejected');
      if (existingDup) {
        return res.status(409).json({
          error: `Duplicate document detected: "${existingDup.title}" (${existingDup.accessionNumber}) already matches this exact SHA-256 hash.`,
          duplicateDocumentId: existingDup.id,
        });
      }

      const title = String(req.body?.title || '').trim();
      const courseId = String(req.body?.courseId || '').trim();
      const academicYear = String(req.body?.academicYear || '2025/2026').trim();
      const semester = String(req.body?.semester || 'Semester 1').trim();
      const examType = String(req.body?.examType || 'End-of-Semester Examination').trim();
      const category = String(req.body?.category || 'Past Examination Papers') as DocumentCategory;
      const description = String(req.body?.description || '').trim();
      const lecturerName = String(req.body?.lecturerName || '').trim() || user.fullName;

      if (!title || !courseId) {
        return res.status(400).json({ error: 'Document title and course are required.' });
      }

      const course = state.courses.find((c) => c.id === courseId);
      if (!course) {
        return res.status(400).json({ error: 'Selected course does not exist.' });
      }

      const dept = state.departments.find((d) => d.id === course.departmentId) || state.departments[0];
      const faculty = state.faculties.find((f) => f.id === dept.facultyId) || state.faculties[0];
      const prog = state.programmes.find((p) => p.id === course.programmeId) || state.programmes[0];
      const inst = state.institutions[0];
      const campus = state.campuses[0];

      const storedFilename = `${crypto.randomUUID()}.${detectedFormat.toLowerCase()}`;
      fs.writeFileSync(path.join(UPLOADS_DIR, storedFilename), file.buffer);

      // Determine approval status based on role & institutional moderation policy
      let status: DocumentStatus = 'pending';
      if (!state.settings.moderationEnabled) {
        status = 'approved';
      } else if (user.role === 'admin' || user.role === 'moderator') {
        status = 'approved';
      } else if (user.role === 'lecturer' && !state.settings.requireLecturerVerification) {
        status = 'approved';
      }

      let verificationLevel: VerificationLevel = 'unverified_community';
      if (category === 'Marking Schemes') {
        verificationLevel =
          user.role === 'lecturer' || user.role === 'admin'
            ? 'official_marking_scheme'
            : 'student_revision_notes';
      } else if (user.role === 'lecturer') {
        verificationLevel = 'lecturer_verified';
      } else if (user.role === 'student') {
        verificationLevel = 'student_revision_notes';
      }

      const now = new Date().toISOString();
      const newDoc: VaultDocument = {
        id: `doc-${crypto.randomUUID().slice(0, 8)}`,
        accessionNumber: `CEV-2026-${String(state.documents.length + 1).padStart(4, '0')}`,
        title,
        courseId: course.id,
        courseCode: course.code,
        courseName: course.name,
        departmentId: dept.id,
        departmentCode: dept.code,
        departmentName: dept.name,
        facultyId: faculty.id,
        facultyName: faculty.name,
        programmeId: prog.id,
        programmeName: prog.name,
        campusId: campus.id,
        campusName: campus.name,
        institutionId: inst.id,
        institutionName: inst.name,
        academicYear,
        semester,
        examType,
        category,
        description: description || `${category} uploaded for ${course.code} (${course.name}).`,
        lecturerName,
        fileFormat: detectedFormat,
        fileSizeBytes: file.size,
        fileHash,
        storedFilename,
        originalFilename: file.originalname,
        ocrText: `${title} ${course.code} ${course.name} ${dept.name} ${academicYear} ${category} ${description}`,
        version: 1,
        status,
        verificationLevel,
        isDemoSample: false,
        uploadedById: user.id,
        uploadedByName: user.fullName,
        uploadedByRole: user.role,
        approvedByName: status === 'approved' ? user.fullName : undefined,
        approvedAt: status === 'approved' ? now : undefined,
        viewsCount: 0,
        downloadsCount: 0,
        bookmarksCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      state.documents.unshift(newDoc);

      if (status === 'approved') {
        user.approvedUploadsCount += 1;
        user.contributionPoints += 35;
      }

      vaultStore.addAuditLog(
        user,
        status === 'approved' ? 'DOCUMENT_UPLOADED_APPROVED' : 'DOCUMENT_UPLOADED_PENDING',
        'document',
        newDoc.id,
        `${user.fullName} (${user.role}) uploaded "${title}" [${detectedFormat}, ${file.size} bytes]`
      );

      if (status === 'pending') {
        state.users
          .filter((u) => u.role === 'moderator' || u.role === 'admin')
          .forEach((mod) => {
            vaultStore.pushNotification(
              mod.id,
              'Moderation Queue',
              `New Submission: ${course.code}`,
              `${user.fullName} submitted "${title}" for review.`,
              newDoc.id
            );
          });
      }

      vaultStore.persist();
      return res.status(201).json({ document: newDoc });
    }
  );

  app.post('/api/documents/:id/moderate', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    if (user.role !== 'moderator' && user.role !== 'admin' && user.role !== 'lecturer') {
      return res.status(403).json({ error: 'Forbidden: Moderator, Lecturer, or Administrator role required.' });
    }

    const state = vaultStore.getState();
    const doc = state.documents.find((d) => d.id === req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found.' });

    if (user.role === 'lecturer' && user.departmentId !== doc.departmentId) {
      return res.status(403).json({ error: 'Lecturers may only moderate documents within their department.' });
    }

    const action = String(req.body?.action || '');
    const reason = String(req.body?.reason || '').trim();
    const now = new Date().toISOString();

    if (action === 'approve') {
      doc.status = 'approved';
      doc.approvedByName = user.fullName;
      doc.approvedAt = now;
      doc.rejectionReason = undefined;
      if (req.body?.verificationLevel) {
        doc.verificationLevel = req.body.verificationLevel as VerificationLevel;
      }
      const uploader = state.users.find((u) => u.id === doc.uploadedById);
      if (uploader) {
        uploader.approvedUploadsCount += 1;
        uploader.contributionPoints += 35;
        if (uploader.approvedUploadsCount >= 5 && !uploader.badges.includes('Verified Contributor')) {
          uploader.badges.push('Verified Contributor');
        }
        vaultStore.pushNotification(
          uploader.id,
          'Approval',
          `Approved: ${doc.courseCode}`,
          `Your submission "${doc.title}" has been verified and published to Campus Exam Vault (+35 reputation points).`,
          doc.id
        );
      }
    } else if (action === 'reject' || action === 'request_correction') {
      doc.status = 'rejected';
      doc.rejectionReason = reason || 'Metadata or scan legibility correction required.';
      const uploader = state.users.find((u) => u.id === doc.uploadedById);
      if (uploader) {
        vaultStore.pushNotification(
          uploader.id,
          action === 'reject' ? 'Rejected' : 'Correction Requested',
          `Action Needed: ${doc.courseCode}`,
          `"${doc.title}" requires changes: ${doc.rejectionReason}`,
          doc.id
        );
      }
    } else if (action === 'archive') {
      doc.status = 'archived';
    } else {
      return res.status(400).json({ error: 'Invalid moderation action.' });
    }

    doc.updatedAt = now;
    vaultStore.addAuditLog(
      user,
      `MODERATION_${action.toUpperCase()}`,
      'document',
      doc.id,
      `${action} on "${doc.title}"${reason ? ` — ${reason}` : ''}`
    );
    vaultStore.persist();
    return res.json({ document: doc });
  });

  app.patch('/api/documents/:id', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    if (user.role !== 'moderator' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Moderator or Administrator role required.' });
    }

    const state = vaultStore.getState();
    const doc = state.documents.find((d) => d.id === req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found.' });

    if (typeof req.body?.title === 'string' && req.body.title.trim()) doc.title = req.body.title.trim();
    if (typeof req.body?.academicYear === 'string') doc.academicYear = req.body.academicYear;
    if (typeof req.body?.semester === 'string') doc.semester = req.body.semester;
    if (typeof req.body?.examType === 'string') doc.examType = req.body.examType;
    if (typeof req.body?.category === 'string') doc.category = req.body.category as DocumentCategory;
    if (typeof req.body?.description === 'string') doc.description = req.body.description;
    if (typeof req.body?.lecturerName === 'string') doc.lecturerName = req.body.lecturerName;
    if (typeof req.body?.verificationLevel === 'string') {
      doc.verificationLevel = req.body.verificationLevel as VerificationLevel;
    }

    doc.updatedAt = new Date().toISOString();
    vaultStore.addAuditLog(user, 'DOCUMENT_METADATA_EDITED', 'document', doc.id, `Updated metadata for "${doc.title}"`);
    vaultStore.persist();
    return res.json({ document: doc });
  });

  app.delete('/api/documents/:id', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Administrator role required to permanently delete documents.' });
    }

    const state = vaultStore.getState();
    const idx = state.documents.findIndex((d) => d.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Document not found.' });
    const [removed] = state.documents.splice(idx, 1);

    vaultStore.addAuditLog(user, 'DOCUMENT_DELETED', 'document', removed.id, `Removed "${removed.title}"`);
    vaultStore.persist();
    return res.json({ ok: true });
  });

  // -------------------------------------------------------------------------
  // BOOKMARKS, PERSONAL COLLECTIONS, ACTIVITY & EXAM PREP PLANS
  // -------------------------------------------------------------------------
  app.get('/api/user/activity', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    const state = vaultStore.getState();

    const bookmarkedIds = state.bookmarkedIdsByUser[user.id] || [];
    const recentViewIds = state.recentViewsByUser[user.id] || [];
    const recentDownloadIds = state.recentDownloadsByUser[user.id] || [];
    const collections = state.collections.filter((c) => c.userId === user.id);
    const myUploads = state.documents.filter((d) => d.uploadedById === user.id);
    const notifications = state.notifications.filter((n) => n.userId === user.id);
    const examPlans = state.examPlans.filter((p) => p.userId === user.id);
    const mySupportRequests = state.supportRequests.filter((s) => s.userId === user.id || s.senderEmail === user.email);

    return res.json({
      bookmarkedIds,
      recentViewIds,
      recentDownloadIds,
      collections,
      myUploads,
      notifications,
      examPlans,
      mySupportRequests,
    });
  });

  app.post('/api/bookmarks/toggle', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Sign in to bookmark resources.' });
    const documentId = String(req.body?.documentId || '');
    const state = vaultStore.getState();
    const doc = state.documents.find((d) => d.id === documentId);
    if (!doc) return res.status(404).json({ error: 'Document not found.' });

    const list = state.bookmarkedIdsByUser[user.id] || [];
    let bookmarked = false;
    if (list.includes(documentId)) {
      state.bookmarkedIdsByUser[user.id] = list.filter((id) => id !== documentId);
      doc.bookmarksCount = Math.max(0, doc.bookmarksCount - 1);
    } else {
      state.bookmarkedIdsByUser[user.id] = [documentId, ...list];
      doc.bookmarksCount += 1;
      bookmarked = true;
    }

    vaultStore.persist();
    return res.json({ bookmarked, bookmarkedIds: state.bookmarkedIdsByUser[user.id] });
  });

  app.post('/api/collections', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    const name = String(req.body?.name || '').trim();
    const description = String(req.body?.description || '').trim();
    if (!name) return res.status(400).json({ error: 'Collection name is required.' });

    const state = vaultStore.getState();
    const col = {
      id: `col-${crypto.randomUUID().slice(0, 8)}`,
      userId: user.id,
      name,
      description: description || 'Custom exam preparation collection',
      documentIds: [],
      createdAt: new Date().toISOString(),
    };
    state.collections.unshift(col);
    vaultStore.persist();
    return res.status(201).json({ collection: col });
  });

  app.post('/api/collections/:id/items', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    const state = vaultStore.getState();
    const col = state.collections.find((c) => c.id === req.params.id && c.userId === user.id);
    if (!col) return res.status(404).json({ error: 'Collection not found.' });

    const documentId = String(req.body?.documentId || '');
    if (col.documentIds.includes(documentId)) {
      col.documentIds = col.documentIds.filter((id) => id !== documentId);
    } else {
      col.documentIds.unshift(documentId);
    }
    vaultStore.persist();
    return res.json({ collection: col });
  });

  app.delete('/api/collections/:id', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    const state = vaultStore.getState();
    state.collections = state.collections.filter((c) => !(c.id === req.params.id && c.userId === user.id));
    vaultStore.persist();
    return res.json({ ok: true });
  });

  app.post('/api/notifications/read-all', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    vaultStore
      .getState()
      .notifications.filter((n) => n.userId === user.id)
      .forEach((n) => {
        n.read = true;
      });
    vaultStore.persist();
    return res.json({ ok: true });
  });

  app.post('/api/exam-plans', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    const courseCode = String(req.body?.courseCode || '').trim();
    const courseName = String(req.body?.courseName || '').trim();
    const examTitle = String(req.body?.examTitle || 'Final Examination').trim();
    const examDate = String(req.body?.examDate || '').trim();
    const venue = String(req.body?.venue || 'Main Exam Hall').trim();
    const checklistLabels = Array.isArray(req.body?.checklist) ? req.body.checklist : [];

    if (!courseCode || !examDate) {
      return res.status(400).json({ error: 'Course code and exam date are required.' });
    }

    const plan = {
      id: `plan-${crypto.randomUUID().slice(0, 8)}`,
      userId: user.id,
      courseCode,
      courseName: courseName || courseCode,
      examTitle,
      examDate,
      venue,
      checklist: (checklistLabels.length > 0
        ? checklistLabels
        : [
            `Download latest ${courseCode} past paper`,
            `Complete timed practice attempt`,
            `Review marking scheme & weak topics`,
          ]
      ).map((label: string) => ({
        id: `chk-${crypto.randomUUID().slice(0, 6)}`,
        label: String(label),
        completed: false,
      })),
      createdAt: new Date().toISOString(),
    };

    vaultStore.getState().examPlans.unshift(plan);
    vaultStore.persist();
    return res.status(201).json({ plan });
  });

  app.patch('/api/exam-plans/:id', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    const plan = vaultStore.getState().examPlans.find((p) => p.id === req.params.id && p.userId === user.id);
    if (!plan) return res.status(404).json({ error: 'Exam plan not found.' });

    if (Array.isArray(req.body?.checklist)) {
      plan.checklist = req.body.checklist;
    }
    vaultStore.persist();
    return res.json({ plan });
  });

  app.delete('/api/exam-plans/:id', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    const state = vaultStore.getState();
    state.examPlans = state.examPlans.filter((p) => !(p.id === req.params.id && p.userId === user.id));
    vaultStore.persist();
    return res.json({ ok: true });
  });

  // -------------------------------------------------------------------------
  // REPORTS, SUPPORT & ANNOUNCEMENTS
  // -------------------------------------------------------------------------
  app.post('/api/reports', rateLimit('reports', 15, 60_000), (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Please sign in to submit a report.' });
    const state = vaultStore.getState();

    const documentId = req.body?.documentId ? String(req.body.documentId) : undefined;
    const doc = documentId ? state.documents.find((d) => d.id === documentId) : undefined;
    const reportType = String(req.body?.reportType || 'incorrect_metadata');
    const details = String(req.body?.details || '').trim();
    if (!details) return res.status(400).json({ error: 'Report details are required.' });

    const report = {
      id: `rep-${crypto.randomUUID().slice(0, 8)}`,
      documentId: doc?.id,
      documentTitle: doc?.title,
      courseCode: doc?.courseCode,
      reporterId: user.id,
      reporterName: user.fullName,
      reportType: reportType as any,
      details,
      status: 'open' as const,
      createdAt: new Date().toISOString(),
    };
    state.reports.unshift(report);
    vaultStore.addAuditLog(user, 'REPORT_FILED', 'report', report.id, `Filed ${reportType}: ${details.slice(0, 80)}`);
    vaultStore.persist();
    return res.status(201).json({ report });
  });

  app.get('/api/reports', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user || (user.role !== 'moderator' && user.role !== 'admin')) {
      return res.status(403).json({ error: 'Forbidden: Moderator or Administrator role required.' });
    }
    return res.json({ reports: vaultStore.getState().reports });
  });

  app.patch('/api/reports/:id', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user || (user.role !== 'moderator' && user.role !== 'admin')) {
      return res.status(403).json({ error: 'Forbidden.' });
    }
    const rep = vaultStore.getState().reports.find((r) => r.id === req.params.id);
    if (!rep) return res.status(404).json({ error: 'Report not found.' });
    if (req.body?.status) rep.status = req.body.status;
    if (typeof req.body?.resolutionNotes === 'string') rep.resolutionNotes = req.body.resolutionNotes;
    vaultStore.addAuditLog(user, 'REPORT_UPDATED', 'report', rep.id, `Marked report ${rep.status}`);
    vaultStore.persist();
    return res.json({ report: rep });
  });

  app.post('/api/support', rateLimit('support', 10, 60_000), (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    const senderName = String(req.body?.senderName || user?.fullName || '').trim();
    const senderEmail = String(req.body?.senderEmail || user?.email || '').trim();
    const requestType = String(req.body?.requestType || 'General Inquiry');
    const subject = String(req.body?.subject || '').trim();
    const message = String(req.body?.message || '').trim();

    if (!senderName || !senderEmail.includes('@') || !subject || !message) {
      return res.status(400).json({ error: 'Name, valid email, subject, and message are required.' });
    }

    const ticket = {
      id: `sup-${crypto.randomUUID().slice(0, 8)}`,
      userId: user?.id,
      senderName,
      senderEmail,
      requestType: requestType as any,
      subject,
      message,
      status: 'open' as const,
      createdAt: new Date().toISOString(),
    };
    vaultStore.getState().supportRequests.unshift(ticket);
    vaultStore.persist();
    return res.status(201).json({ ticket });
  });

  app.patch('/api/support/:id', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Administrator role required.' });
    }
    const ticket = vaultStore.getState().supportRequests.find((s) => s.id === req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Support ticket not found.' });
    if (req.body?.status) ticket.status = req.body.status;
    if (typeof req.body?.adminResponse === 'string') ticket.adminResponse = req.body.adminResponse;
    vaultStore.persist();
    return res.json({ ticket });
  });

  app.post('/api/announcements', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Administrator role required.' });
    }
    const title = String(req.body?.title || '').trim();
    const body = String(req.body?.body || '').trim();
    const category = String(req.body?.category || 'Examination Notice');
    if (!title || !body) return res.status(400).json({ error: 'Title and announcement body are required.' });

    const announcement = {
      id: `ann-${crypto.randomUUID().slice(0, 8)}`,
      title,
      body,
      category: category as any,
      isOfficial: true,
      publishedBy: user.fullName,
      publishedAt: new Date().toISOString(),
    };
    vaultStore.getState().announcements.unshift(announcement);
    vaultStore.addAuditLog(user, 'ANNOUNCEMENT_PUBLISHED', 'announcement', announcement.id, title);
    vaultStore.persist();
    return res.status(201).json({ announcement });
  });

  app.delete('/api/announcements/:id', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Forbidden.' });
    const state = vaultStore.getState();
    state.announcements = state.announcements.filter((a) => a.id !== req.params.id);
    vaultStore.persist();
    return res.json({ ok: true });
  });

  // -------------------------------------------------------------------------
  // ACADEMIC STRUCTURE & ADMIN MANAGEMENT (STRICTLY ADMIN-ONLY)
  // -------------------------------------------------------------------------
  app.post('/api/academic/departments', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Administrator access required.' });
    const state = vaultStore.getState();
    const name = String(req.body?.name || '').trim();
    const code = String(req.body?.code || '').trim().toUpperCase();
    const facultyId = String(req.body?.facultyId || state.faculties[0].id);
    const description = String(req.body?.description || '').trim();
    if (!name || !code) return res.status(400).json({ error: 'Department name and code are required.' });
    if (state.departments.some((d) => d.code === code)) {
      return res.status(409).json({ error: 'A department with this code already exists.' });
    }
    const faculty = state.faculties.find((f) => f.id === facultyId) || state.faculties[0];
    const dept = {
      id: `dept-${crypto.randomUUID().slice(0, 6)}`,
      facultyId: faculty.id,
      facultyName: faculty.name,
      name,
      code,
      description: description || `${name} academic unit.`,
    };
    state.departments.push(dept);
    vaultStore.addAuditLog(user, 'DEPARTMENT_CREATED', 'department', dept.id, `${code} - ${name}`);
    vaultStore.persist();
    return res.status(201).json({ department: dept });
  });

  app.post('/api/academic/courses', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Administrator access required.' });
    const state = vaultStore.getState();
    const code = String(req.body?.code || '').trim().toUpperCase();
    const name = String(req.body?.name || '').trim();
    const departmentId = String(req.body?.departmentId || '');
    const description = String(req.body?.description || '').trim();
    const creditUnits = Number(req.body?.creditUnits || 3);
    const yearOfStudy = Number(req.body?.yearOfStudy || 1);

    if (!code || !name || !departmentId) {
      return res.status(400).json({ error: 'Course code, name, and department are required.' });
    }
    if (state.courses.some((c) => c.code === code)) {
      return res.status(409).json({ error: 'A course with this code already exists.' });
    }
    const dept = state.departments.find((d) => d.id === departmentId);
    if (!dept) return res.status(404).json({ error: 'Department not found.' });
    const prog = state.programmes.find((p) => p.departmentId === dept.id) || state.programmes[0];

    const course = {
      id: `crs-${crypto.randomUUID().slice(0, 6)}`,
      departmentId: dept.id,
      departmentCode: dept.code,
      departmentName: dept.name,
      programmeId: prog.id,
      programmeName: prog.name,
      code,
      name,
      description: description || `${name} curriculum and examination archive.`,
      creditUnits,
      yearOfStudy,
    };
    state.courses.push(course);
    vaultStore.addAuditLog(user, 'COURSE_CREATED', 'course', course.id, `${code}: ${name}`);
    vaultStore.persist();
    return res.status(201).json({ course });
  });

  app.get('/api/admin/overview', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    if (user.role !== 'admin') return res.status(403).json({ error: 'Forbidden: Administrator role required.' });

    const state = vaultStore.getState();
    const totalBytes = state.documents.reduce((acc, d) => acc + d.fileSizeBytes, 0);
    const deptActivity = state.departments.map((dept) => {
      const deptDocs = state.documents.filter((d) => d.departmentId === dept.id && d.status === 'approved');
      return {
        department: dept.code,
        name: dept.name,
        documents: deptDocs.length,
        downloads: deptDocs.reduce((sum, d) => sum + d.downloadsCount, 0),
        views: deptDocs.reduce((sum, d) => sum + d.viewsCount, 0),
      };
    });

    return res.json({
      users: state.users.map((u) => vaultStore.sanitizeUser(u)),
      documentsCount: {
        total: state.documents.length,
        approved: state.documents.filter((d) => d.status === 'approved').length,
        pending: state.documents.filter((d) => d.status === 'pending').length,
        rejected: state.documents.filter((d) => d.status === 'rejected').length,
        archived: state.documents.filter((d) => d.status === 'archived').length,
      },
      storageUsedMb: Number((totalBytes / (1024 * 1024)).toFixed(2)),
      deptActivity,
      reports: state.reports,
      supportRequests: state.supportRequests,
      auditLogs: state.auditLogs.slice(0, 60),
      settings: state.settings,
    });
  });

  app.patch('/api/admin/users/:id', (req: Request, res: Response) => {
    const admin = getAuthenticatedUser(req);
    if (!admin || admin.role !== 'admin') return res.status(403).json({ error: 'Administrator access required.' });
    const state = vaultStore.getState();
    const target = state.users.find((u) => u.id === req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found.' });

    if (req.body?.status === 'active' || req.body?.status === 'suspended') {
      target.status = req.body.status;
    }
    if (['student', 'lecturer', 'moderator', 'admin'].includes(req.body?.role)) {
      target.role = req.body.role;
    }
    vaultStore.addAuditLog(
      admin,
      'USER_UPDATED',
      'user',
      target.id,
      `Updated ${target.email}: role=${target.role}, status=${target.status}`
    );
    vaultStore.persist();
    return res.json({ user: vaultStore.sanitizeUser(target) });
  });

  app.patch('/api/admin/settings', (req: Request, res: Response) => {
    const admin = getAuthenticatedUser(req);
    if (!admin || admin.role !== 'admin') return res.status(403).json({ error: 'Administrator access required.' });
    const state = vaultStore.getState();
    const s = state.settings;
    if (typeof req.body?.maxUploadSizeMb === 'number' && req.body.maxUploadSizeMb >= 1) {
      s.maxUploadSizeMb = Math.min(100, req.body.maxUploadSizeMb);
    }
    if (typeof req.body?.moderationEnabled === 'boolean') s.moderationEnabled = req.body.moderationEnabled;
    if (typeof req.body?.requireLecturerVerification === 'boolean') {
      s.requireLecturerVerification = req.body.requireLecturerVerification;
    }
    if (typeof req.body?.allowStudentUploads === 'boolean') s.allowStudentUploads = req.body.allowStudentUploads;
    vaultStore.addAuditLog(admin, 'SETTINGS_UPDATED', 'settings', 'platform', JSON.stringify(s));
    vaultStore.persist();
    return res.json({ settings: s });
  });

  app.get('/api/admin/export-analytics', (req: Request, res: Response) => {
    const admin = getAuthenticatedUser(req);
    if (!admin || admin.role !== 'admin') return res.status(403).json({ error: 'Administrator access required.' });
    const rows = [
      ['Accession', 'CourseCode', 'Title', 'Department', 'AcademicYear', 'Category', 'Status', 'Views', 'Downloads'],
      ...vaultStore.getState().documents.map((d) => [
        d.accessionNumber,
        d.courseCode,
        `"${d.title.replace(/"/g, '""')}"`,
        d.departmentName,
        d.academicYear,
        d.category,
        d.status,
        String(d.viewsCount),
        String(d.downloadsCount),
      ]),
    ];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="campus-exam-vault-analytics.csv"');
    return res.send(rows.map((r) => r.join(',')).join('\n'));
  });

  // -------------------------------------------------------------------------
  // OPTIONAL AI PRACTICE QUESTION & METADATA ASSISTANT
  // -------------------------------------------------------------------------
  app.post('/api/ai/study-assistant', async (req: Request, res: Response) => {
    const prompt = String(req.body?.prompt || '').trim();
    const contextSummary = String(req.body?.contextSummary || '').trim();
    if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });

    const apiKey = process.env.GEMINI_API_KEY;
    const hasValidKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');
    if (!hasValidKey) {
      return res.json({ mode: 'demo', reply: buildDemoAiPracticeReply(prompt, contextSummary) });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction: [
            'You are an academic revision assistant for Campus Exam Vault.',
            'Generate clear, rigorous university-level practice questions or metadata suggestions.',
            'Always preface practice questions with: "[AI-Generated Practice Material — Not an Official Examination Paper]".',
            contextSummary ? `Course context: ${contextSummary}` : '',
          ]
            .filter(Boolean)
            .join(' '),
        },
      });
      const text = response.text?.trim();
      if (!text) return res.json({ mode: 'demo', reply: buildDemoAiPracticeReply(prompt, contextSummary) });
      return res.json({ mode: 'live', reply: text });
    } catch {
      return res.json({ mode: 'demo', reply: buildDemoAiPracticeReply(prompt, contextSummary) });
    }
  });

  // Vite dev middleware / static prod bundle
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Campus Exam Vault server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
