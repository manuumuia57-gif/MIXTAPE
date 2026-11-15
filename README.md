# FocusCampus — Student Productivity & Academic Success Platform

Focus better, study smarter, and achieve more with an integrated academic command center built with React, TypeScript, Tailwind CSS, Recharts, Express, and optional Gemini AI integration.

## Project Structure

- `server.ts` — Express server serving Vite middleware in development, static production bundles, authentication endpoints (`/api/auth/*`), and the server-side Gemini AI Study Assistant (`/api/ai/study-assistant`).
- `db/schema.sql` — PostgreSQL / Supabase relational schema with Row-Level Security policies for cloud production deployment.
- `src/types/campus.ts` — Strongly typed data models across all FocusCampus modules.
- `src/data/seedData.ts` — Realistic academic sample content (tasks, study sessions, flashcards, quizzes, resource articles, community posts, quotes, badges, and goals).
- `src/hooks/useFocusCampusStore.ts` — Persistent workspace state stored in browser `localStorage` (`fc_*` keys) with demo/user state separation.
- `src/components/` — Modular UI pages for the Landing Page, Dashboard, Smart Task Manager, Study Planner, Focus Timer, Notes Hub, Goals & Gamification, Exam Center, Resource Library, Community, AI Study Assistant, Flashcards & Quizzes, Profile/Settings, and Role-Protected Admin Dashboard.

## Environment Variables

Copy `.env.example` to `.env` for local or production setup:

- `GEMINI_API_KEY` — Optional server-side API key for live AI Study Assistant responses. When omitted, the assistant operates in a clearly labeled **Demo Mode**.
- `AUTH_SECRET` — HMAC secret for server session tokens.
- `SUPABASE_URL` / `PGHOST` — Optional external PostgreSQL/Supabase credentials when deploying beyond local browser storage.

## Installation & Development

```bash
npm install
npm run dev
```

The server listens on `http://localhost:3000`.

## Build & Production

```bash
npm run lint
npm run build
npm start
```

## Demo Mode vs. External Backend Integration

- **Browser Persistence Active**: Tasks, study schedules, focus timer history, notes, goals, exam countdowns, flashcards, community interactions, and settings persist automatically in `localStorage`.
- **Authentication & Role Access**: Server routes (`/api/auth/login`, `/api/auth/register`, `/api/auth/recover`) hash passwords using Node `crypto.scryptSync`. Demo credentials are provided on the login screen for both **Student** and **Administrator** roles.
- **Database Upgrade Path**: Apply `db/schema.sql` to PostgreSQL or Supabase to migrate browser storage to multi-device cloud persistence.
