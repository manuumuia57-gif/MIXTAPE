# Campus Past Papers Library

> "Find Your Past Papers. Prepare for Your Exams. Achieve More."

A clean, modern institutional digital library for publishing and accessing university past examination papers, CAT papers, revision materials, lecture notes, assignments, and practical papers.

## Architecture
- **Public Student Website (No Login Required)**: Students browse, search, filter by department, course, course code, academic year, semester, or document type, preview PDFs inline, and download resources directly.
- **Private Administrator Panel**: Single-administrator control center protected by email/username + password login (no public registration). Supports drag-and-drop file upload with progress tracking, metadata editing, file replacement, deletion with confirmation, course/department/year management, website settings, credential updates, and student contact message review.
- **Persistence**: Express backend (`server.ts`) backed by `data/library-db.json` and `uploads/` binary storage with magic-byte validation for PDF, DOCX, and PPTX files. Includes PostgreSQL / Supabase schema in `db/schema.sql`.

## Default Administrator Access (Demo)
- **Email / Username**: `admin@campuslibrary.edu` or `admin`
- **Password**: `AdminLibrary2026!`
*(Change credentials anytime inside Website Settings in the Admin Panel.)*

## Scripts
- `npm run dev` — Start full-stack Express + Vite server on port 3000
- `npm run lint` — TypeScript check (`tsc --noEmit`)
- `npm run build` — Production Vite bundle
