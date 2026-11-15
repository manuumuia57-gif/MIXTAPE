import 'dotenv/config';
import crypto from 'node:crypto';
import path from 'node:path';
import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const PORT = 3000;
const AUTH_SECRET = process.env.AUTH_SECRET || 'focuscampus-local-dev-secret-2026';

interface ServerUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: 'student' | 'admin';
  institution: string;
  course: string;
  academicYear: string;
}

function hashPassword(password: string, salt?: string): string {
  const usedSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, usedSalt, 64).toString('hex');
  return `${usedSalt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(key, 'hex');
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

function signToken(payload: { id: string; email: string; role: 'student' | 'admin' }): string {
  const data = Buffer.from(
    JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifyToken(token: string): { id: string; email: string; role: 'student' | 'admin' } | null {
  const [data, sig] = token.split('.');
  if (!data || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');
  if (sig.length !== expectedSig.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (typeof parsed.exp === 'number' && parsed.exp < Date.now()) return null;
    return { id: parsed.id, email: parsed.email, role: parsed.role };
  } catch {
    return null;
  }
}

const serverUsers = new Map<string, ServerUser>();

function seedDefaultAccounts() {
  const studentEmail = 'student@focuscampus.edu';
  const adminEmail = 'admin@focuscampus.edu';
  serverUsers.set(studentEmail, {
    id: 'usr-student-demo',
    email: studentEmail,
    passwordHash: hashPassword('Focus2026!'),
    fullName: 'Maya Lin',
    role: 'student',
    institution: 'Northbridge University',
    course: 'B.S. Computer Science & Cognitive Psychology',
    academicYear: 'Junior (Year 3)',
  });
  serverUsers.set(adminEmail, {
    id: 'usr-admin-demo',
    email: adminEmail,
    passwordHash: hashPassword('AdminCampus2026!'),
    fullName: 'Dr. Julian Vance',
    role: 'admin',
    institution: 'FocusCampus Academic Operations',
    course: 'Platform Administration',
    academicYear: 'Staff',
  });
}

seedDefaultAccounts();

function buildDemoAiReply(prompt: string, contextSummary?: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes('study plan') || lower.includes('schedule') || lower.includes('revision')) {
    return [
      'Here is a structured 4-day study plan tailored for high retention:',
      '',
      'Day 1 — Core Foundations (90 mins)',
      '• 25m Focus Block: Review lecture outlines and flag unfamiliar terminology.',
      '• 5m Break: Step away from screens and hydrate.',
      '• 25m Focus Block: Summarize key concepts in your own words without looking at slides.',
      '• 35m Practice: Solve 5 foundational problems.',
      '',
      'Day 2 — Active Recall & Application (90 mins)',
      '• Create 10–15 flashcards for core definitions and formulas.',
      '• Complete medium-difficulty problem sets under timed conditions.',
      '',
      'Day 3 — Past Paper Simulation (100 mins)',
      '• Simulate exam timing for one full section without notes.',
      '• Log every missed question in an error notebook.',
      '',
      'Day 4 — Targeted Weak-Spot Review (60 mins)',
      '• Re-test only the items missed on Day 3.',
      '• Finish with a calm 15-minute high-level summary review before rest.',
    ].join('\n');
  }

  if (lower.includes('flashcard') || lower.includes('quiz') || lower.includes('question')) {
    return [
      'Sample Active-Recall Revision Set:',
      '',
      '1. Concept Check: What is the core difference between passive rereading and active recall?',
      'Answer: Passive rereading creates fluency illusions, whereas active recall forces memory retrieval, strengthening neural pathways.',
      '',
      '2. Practice Prompt: Explain the Feynman Technique in 3 steps.',
      'Answer: (1) Teach the concept simply, (2) Identify gaps where explanation breaks down, (3) Return to source material and refine.',
      '',
      '3. Self-Test Question: How should you space revision before an exam in 14 days?',
      'Answer: Review at increasing intervals (Day 1, Day 3, Day 7, Day 12) rather than cramming on Day 13.',
    ].join('\n');
  }

  if (lower.includes('summarize') || lower.includes('note')) {
    return [
      'Structured Summary Framework (Cornell Method):',
      '',
      'Key Themes:',
      '• Main Thesis: Identify the central question or model the lecture solves.',
      '• Supporting Mechanisms: Group formulas, evidence, or case studies under 3 clear headings.',
      '• Open Questions: List 2 concepts to clarify during office hours or study group.',
      contextSummary ? `\nContext referenced: ${contextSummary.slice(0, 140)}...` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }

  return [
    `Study Guidance for: "${prompt.slice(0, 120)}"`,
    '',
    'Recommended 3-Step Approach:',
    '1. Clarify the Objective: Break the topic into 2–3 concrete sub-questions you need to answer.',
    '2. Deep Focus Block: Run a 25-minute Pomodoro timer with notifications muted and work on one sub-question at a time.',
    '3. Verify Understanding: Close your notes and write a 4-sentence explanation or solve 2 practice problems from memory.',
    '',
    'Tip: Ask me to "Generate a study plan", "Create revision questions", or "Summarize my notes" to test specific workflows.',
  ].join('\n');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    const hasLiveGemini =
      Boolean(process.env.GEMINI_API_KEY) &&
      process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';
    res.json({ ok: true, aiMode: hasLiveGemini ? 'live' : 'demo' });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const fullName = String(req.body?.fullName || '').trim();
    const institution = String(req.body?.institution || 'University Campus').trim();
    const course = String(req.body?.course || 'Undergraduate Studies').trim();

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    if (!fullName) {
      return res.status(400).json({ error: 'Full name is required.' });
    }
    if (serverUsers.has(email)) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const user: ServerUser = {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      email,
      passwordHash: hashPassword(password),
      fullName,
      role: 'student',
      institution,
      course,
      academicYear: 'Year 1',
    };
    serverUsers.set(email, user);

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        institution: user.institution,
        course: user.course,
        academicYear: user.academicYear,
      },
    });
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const user = serverUsers.get(email);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        institution: user.institution,
        course: user.course,
        academicYear: user.academicYear,
      },
    });
  });

  app.post('/api/auth/recover', (req: Request, res: Response) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    return res.json({
      message:
        'If an account matches that email, password reset instructions have been queued (Demo Mode: no outbound email server connected).',
    });
  });

  app.post('/api/auth/change-password', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const decoded = token ? verifyToken(token) : null;
    if (!decoded) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const currentPassword = String(req.body?.currentPassword || '');
    const newPassword = String(req.body?.newPassword || '');
    const user = serverUsers.get(decoded.email);
    if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }
    user.passwordHash = hashPassword(newPassword);
    return res.json({ message: 'Password updated successfully.' });
  });

  app.get('/api/admin/overview', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const decoded = token ? verifyToken(token) : null;
    if (!decoded) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Administrator role required.' });
    }
    return res.json({
      registeredCount: serverUsers.size,
      users: Array.from(serverUsers.values()).map((u) => ({
        id: u.id,
        fullName: u.fullName,
        role: u.role,
        institution: u.institution,
        course: u.course,
      })),
    });
  });

  app.post('/api/ai/study-assistant', async (req: Request, res: Response) => {
    const prompt = String(req.body?.prompt || '').trim();
    const contextSummary = String(req.body?.contextSummary || '').trim();

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const hasValidKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');

    if (!hasValidKey) {
      return res.json({
        mode: 'demo',
        reply: buildDemoAiReply(prompt, contextSummary),
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = [
        'You are the FocusCampus AI Study Assistant.',
        'Help university and college students organize study plans, explain concepts clearly, summarize notes, generate active-recall revision questions/flashcards, and manage time.',
        'Keep responses structured, practical, concise (under 350 words unless a detailed study schedule is requested), and encouraging.',
        contextSummary ? `Student context: ${contextSummary}` : '',
      ]
        .filter(Boolean)
        .join(' ');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      const text = response.text?.trim();
      if (!text) {
        return res.json({
          mode: 'demo',
          reply: buildDemoAiReply(prompt, contextSummary),
        });
      }

      return res.json({
        mode: 'live',
        reply: text,
      });
    } catch (error) {
      console.error('Gemini study assistant fallback triggered:', error);
      return res.json({
        mode: 'demo',
        reply: buildDemoAiReply(prompt, contextSummary),
      });
    }
  });

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
    res.status(500).json({ error: 'Internal server error' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FocusCampus server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
