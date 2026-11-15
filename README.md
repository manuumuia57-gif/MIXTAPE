# Campus Exam Vault — Institutional Digital Examination Library

> *"Every Past Paper. Every Resource. Better Exam Preparation."*  
> *"Prepare Smart. Practice More. Excel."*

Campus Exam Vault is a full-stack academic examination resource management system built with React, TypeScript, Tailwind CSS, Express, `pdf-lib`, `pdfjs-dist`, Recharts, and optional Gemini AI integration.

## Architecture & Project Structure

- `server.ts` — Express server serving Vite middleware in development, static production bundles, HMAC-signed role-based authentication (`/api/auth/*`), `multer` multipart file uploads with server-side magic-byte validation (`%PDF-`, OOXML ZIP), SHA-256 duplicate detection, moderation workflow, PDF streaming/download tracking, admin analytics & CSV export, and optional Gemini AI practice question generation (`/api/ai/study-assistant`).
- `server/vaultStore.ts` — Persistent JSON/WAL repository (`data/vault-db.json`) with `crypto.scryptSync` password hashing, audit logging, and notification delivery.
- `server/pdfGenerator.ts` — Generates real, multi-page demonstration PDF past papers, revision guides, and marking schemes using `pdf-lib`.
- `db/schema.sql` — Complete 22-table PostgreSQL / Supabase relational schema with indexes, constraints, and Row-Level Security (RLS) policies.
- `src/types/vault.ts` — Strongly typed data models for institutions, campuses, faculties, departments, programmes, courses, documents, moderation approvals, collections, exam prep plans, and RBAC roles.
- `src/data/vaultSeedData.ts` — Realistic fictional demonstration content (10 departments, 30 courses, 50 past papers, 15 revision materials, 10 marking schemes, 2 pending queue items, 10 institutional announcements, 10 student accounts, 5 lecturer accounts, 1 moderator account, 1 administrator account).
- `src/components/` — Modular UI views for the Landing Page, Personalized Dashboard, Past Papers Library, Courses & Departments Directory, Marking Schemes & Solutions, Document Upload Center, Integrated PDF Reader (`PdfViewerModal.tsx`), Bookmarks & Collections, Exam Prep Center, Contributor Profile, Moderation Queue, Administrator Console, and Announcements & Support Center.

## Demonstration Role Credentials

All 4 RBAC roles can be accessed directly via one-click sign-in inside the **Login / Register** modal:

- **Student**: `maya.lin@northbridge.edu` / `StudentVault2026!`
- **Lecturer**: `a.pendelton@northbridge.edu` / `LecturerVault2026!`
- **Moderator**: `moderator@northbridge.edu` / `ModeratorVault2026!`
- **Administrator**: `admin@northbridge.edu` / `AdminVault2026!`

## Environment Variables

Copy `.env.example` to `.env`:

- `AUTH_SECRET` — HMAC secret for session token signing.
- `MAX_UPLOAD_SIZE_MB` — Default upload size cap (25 MB; configurable in Admin Settings).
- `GEMINI_API_KEY` — Optional server-side key for live AI practice question generation. When omitted, the assistant operates in a clearly labeled **Demo Mode**.
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `PGHOST`, `PGDATABASE` — Optional PostgreSQL / Supabase credentials when deploying `db/schema.sql` to a cloud database.

## Installation & Development

```bash
npm install
npm run dev
```

The server listens on `http://localhost:3000`.

## Build & Production Deployment

```bash
npm run lint
npm run build
npm start
```

1. Apply `db/schema.sql` to PostgreSQL 15+ or Supabase SQL Editor for multi-instance cloud persistence, and configure an S3/Supabase Storage bucket for uploaded files (`storage_key`).
2. Set `NODE_ENV=production` and run `npm run build && npm start`.
