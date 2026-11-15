import { FormEvent, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Building2,
  ChevronDown,
  FileCheck2,
  Megaphone,
  Moon,
  Search,
  ShieldCheck,
  Sun,
  UploadCloud,
} from 'lucide-react';
import { LANDING_FAQS } from '../data/vaultSeedData';
import {
  CatalogResponse,
  UserAccount,
  VaultDocument,
  VaultSection,
} from '../types/vault';
import { VaultBrandLogo } from './VaultBrandLogo';
import { DocumentCard, DocumentCompactRow } from './DocumentCard';
import { formatShortDate } from './DocumentFormatUtils';

interface LandingPageProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  user: UserAccount | null;
  catalog: CatalogResponse | null;
  documents: VaultDocument[];
  bookmarkedIds: string[];
  onNavigateSection: (section: VaultSection, filterPreset?: { q?: string; departmentId?: string; academicYear?: string; category?: string; courseId?: string }) => void;
  onOpenAuth: (tab: 'login' | 'register') => void;
  onOpenDocDetail: (doc: VaultDocument) => void;
  onPreviewPdf: (doc: VaultDocument) => void;
  onDownload: (doc: VaultDocument) => void;
  onToggleBookmark: (docId: string) => void;
}

export function LandingPage({
  theme,
  onToggleTheme,
  user,
  catalog,
  documents,
  bookmarkedIds,
  onNavigateSection,
  onOpenAuth,
  onOpenDocDetail,
  onPreviewPdf,
  onDownload,
  onToggleBookmark,
}: LandingPageProps) {
  const [heroSearch, setHeroSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleHeroSearch = (e: FormEvent) => {
    e.preventDefault();
    onNavigateSection('library', { q: heroSearch });
  };

  const recentPapers = documents
    .filter((d) => d.category !== 'Revision Materials' && d.category !== 'Lecture Notes')
    .slice(0, 6);
  const latestStudyMaterials = documents
    .filter((d) => ['Revision Materials', 'Lecture Notes', 'Study Guides', 'Marking Schemes'].includes(d.category))
    .slice(0, 5);
  const popularCourses = (catalog?.courses || []).slice(0, 6);
  const departments = catalog?.departments || [];
  const years = catalog?.academicYears || [];
  const announcements = (catalog?.announcements || []).slice(0, 4);
  const stats = catalog?.stats;

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#14213D] dark:bg-[#101827] dark:text-slate-100">
      {/* 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-[#101827]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-8">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-left focus-visible:outline-none"
          >
            <VaultBrandLogo />
          </button>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 lg:flex">
            <button
              type="button"
              onClick={() => onNavigateSection('library')}
              className="hover:text-[#14213D] hover:underline underline-offset-4 dark:hover:text-white whitespace-nowrap shrink-0"
            >
              Past Papers
            </button>
            <button
              type="button"
              onClick={() => onNavigateSection('courses')}
              className="hover:text-[#14213D] hover:underline underline-offset-4 dark:hover:text-white whitespace-nowrap shrink-0"
            >
              Courses
            </button>
            <button
              type="button"
              onClick={() => onNavigateSection('marking-schemes')}
              className="hover:text-[#14213D] hover:underline underline-offset-4 dark:hover:text-white whitespace-nowrap shrink-0"
            >
              Marking Schemes
            </button>
            <button
              type="button"
              onClick={() => onNavigateSection('upload')}
              className="hover:text-[#14213D] hover:underline underline-offset-4 dark:hover:text-white whitespace-nowrap shrink-0"
            >
              Upload Materials
            </button>
            <button
              type="button"
              onClick={() => onNavigateSection('support')}
              className="hover:text-[#14213D] hover:underline underline-offset-4 dark:hover:text-white whitespace-nowrap shrink-0"
            >
              Contact & FAQ
            </button>
          </nav>

          <div className="shrink-0">
            {user ? (
              <button
                type="button"
                onClick={() => onNavigateSection('dashboard')}
                className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8] whitespace-nowrap shrink-0"
              >
                Open Portal ({user.fullName.split(' ')[0]})
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="rounded-lg bg-[#14213D] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1f3159] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] whitespace-nowrap shrink-0"
              >
                Login / Register
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Operational Institutional Utility Ribbon (Below Header) */}
      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-[#162033]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs text-slate-600 dark:text-slate-300 sm:px-8">
          <p className="truncate">
            Northbridge University & St. Jude Polytechnic Demonstration Archive · Prepare Smart. Practice More. Excel.
          </p>
          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateSection('library')}
              className="font-semibold text-[#2563EB] hover:underline whitespace-nowrap"
            >
              Browse Full Catalog
            </button>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap"
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-[#F4B400]" /> : <Moon className="h-3.5 w-3.5 text-[#14213D]" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8 lg:py-14">
        <div className="grid items-stretch gap-8 lg:grid-cols-12">
          <div className="flex flex-col justify-center lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#2563EB]">
              Institutional Examination Resource Center
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-[#14213D] dark:text-white sm:text-5xl sm:leading-[1.12]">
              Your Campus Examination Library – All Academic Resources in One Place.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
              Access previous examination papers, revision materials, lecture notes, marking schemes, practical examinations, and other academic resources. Prepare better with organized learning materials from your institution.
            </p>

            {/* Prominent Search Bar */}
            <form onSubmit={handleHeroSearch} className="mt-6">
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-[#162033] sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search course code, course name, examination year, semester, or document type..."
                    className="w-full bg-transparent py-2.5 pl-10 pr-3 text-sm text-[#14213D] placeholder:text-slate-400 focus:outline-none dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] whitespace-nowrap shrink-0"
                >
                  Search Archive
                </button>
              </div>
            </form>

            {/* Primary & Secondary Action Buttons */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigateSection('library')}
                className="inline-flex items-center gap-2 rounded-lg bg-[#14213D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1f3159] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] whitespace-nowrap"
              >
                <BookOpen className="h-4 w-4" />
                <span>Browse Past Papers</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateSection('library', { category: 'Revision Materials' })}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-[#14213D] hover:border-[#2563EB] dark:border-slate-700 dark:bg-[#162033] dark:text-white whitespace-nowrap"
              >
                <span>Explore Study Materials</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateSection('upload')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-[#14213D] hover:border-[#2563EB] dark:border-slate-700 dark:bg-[#162033] dark:text-white whitespace-nowrap"
              >
                <UploadCloud className="h-4 w-4 text-[#2563EB]" />
                <span>Upload a Resource</span>
              </button>
            </div>
          </div>

          {/* Right Column Editorial Library Visual */}
          <div className="lg:col-span-5">
            <div className="relative h-full min-h-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-[#14213D] dark:border-slate-800">
              <img
                src="/src/assets/images/hero_campus_library_1794745517077.jpg"
                alt="University main examination library reading hall"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover lg:h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101827]/85 via-[#101827]/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#F4B400]">
                  Every Past Paper. Every Resource.
                </p>
                <p className="mt-1 font-display text-lg font-bold">
                  Structured by Faculty, Department, Programme, and Academic Year
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width Live Institutional Metrics Strip */}
        <div className="mt-10 grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033] sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: 'Total Past Papers', value: stats?.totalPastPapers ?? 50 },
            { label: 'Available Courses', value: stats?.availableCourses ?? 30 },
            { label: 'Academic Departments', value: stats?.academicDepartments ?? 10 },
            { label: 'Registered Students', value: stats?.registeredStudents ?? 10 },
            { label: 'Approved Resources', value: stats?.uploadedResources ?? 75 },
          ].map((stat) => (
            <div key={stat.label} className="border-slate-200 dark:border-slate-800">
              <p className="font-mono text-2xl font-bold tabular-nums text-[#14213D] dark:text-white sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Recently Uploaded Papers */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#14213D] dark:text-white">
              Recently Uploaded Papers
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Verified examination papers indexed for immediate PDF reading and download.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateSection('library')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:underline whitespace-nowrap"
          >
            <span>View all papers</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {recentPapers.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              isBookmarked={bookmarkedIds.includes(doc.id)}
              onOpenDetail={onOpenDocDetail}
              onPreviewPdf={onPreviewPdf}
              onDownload={onDownload}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      </section>

      {/* Popular Courses + Official Announcements */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex items-end justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#14213D] dark:text-white">
                  Popular Courses
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Direct course hubs with past papers, lecture notes, and marking schemes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateSection('courses')}
                className="text-sm font-semibold text-[#2563EB] hover:underline whitespace-nowrap"
              >
                All {catalog?.courses.length ?? 30} courses
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {popularCourses.map((course) => {
                const count = documents.filter((d) => d.courseId === course.id).length;
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => onNavigateSection('courses', { courseId: course.id })}
                    className="rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-[#2563EB] dark:border-slate-800 dark:bg-[#162033]"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-[#2563EB]">{course.code}</span>
                      <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        {count} resources
                      </span>
                    </div>
                    <h3 className="mt-1.5 font-display text-base font-bold text-[#14213D] dark:text-white">
                      {course.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {course.departmentName} · Year {course.yearOfStudy}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Official Institutional Announcements */}
          <div className="lg:col-span-5">
            <div className="flex items-end justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-[#2563EB]" />
                <h2 className="font-display text-2xl font-bold text-[#14213D] dark:text-white">
                  Official Noticeboard
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigateSection('support')}
                className="text-xs font-semibold text-[#2563EB] hover:underline whitespace-nowrap"
              >
                View all notices
              </button>
            </div>
            <div className="mt-5 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white px-5 dark:divide-slate-800 dark:border-slate-800 dark:bg-[#162033]">
              {announcements.map((ann) => (
                <div key={ann.id} className="py-4">
                  <p className="text-[11px] font-semibold text-[#2563EB]">
                    Official Institutional Notice · {ann.category} · {formatShortDate(ann.publishedAt)}
                  </p>
                  <h3 className="mt-1 text-sm font-bold text-[#14213D] dark:text-white">
                    {ann.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {ann.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Latest Examination Materials & Marking Schemes */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033] sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#14213D] dark:text-white">
                Latest Revision Materials & Marking Schemes
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Study guides, lecture summaries, and clearly labeled verification rubrics.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateSection('marking-schemes')}
              className="text-sm font-semibold text-[#2563EB] hover:underline whitespace-nowrap"
            >
              Open Marking Schemes Hub
            </button>
          </div>
          <div className="mt-2">
            {latestStudyMaterials.map((doc) => (
              <DocumentCompactRow
                key={doc.id}
                doc={doc}
                onOpenDetail={onOpenDocDetail}
                onPreviewPdf={onPreviewPdf}
                onDownload={onDownload}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Department & Academic Year */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h2 className="font-display text-2xl font-bold text-[#14213D] dark:text-white">
              Browse by Academic Department
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Select any faculty department to filter its courses and archived papers.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {departments.map((dept) => {
                const count = documents.filter((d) => d.departmentId === dept.id).length;
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => onNavigateSection('library', { departmentId: dept.id })}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-left transition-colors hover:border-[#2563EB] dark:border-slate-800 dark:bg-[#162033]"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="font-mono text-xs font-bold text-[#2563EB]">{dept.code}</p>
                      <p className="truncate text-sm font-semibold text-[#14213D] dark:text-white">
                        {dept.name}
                      </p>
                    </div>
                    <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                      {count} docs
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-4">
            <h2 className="font-display text-2xl font-bold text-[#14213D] dark:text-white">
              Browse by Academic Year
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Jump directly to examination sittings across recent academic cycles.
            </p>
            <div className="mt-5 space-y-2.5">
              {years.map((yr) => {
                const count = documents.filter((d) => d.academicYear === yr).length;
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => onNavigateSection('library', { academicYear: yr })}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-left transition-colors hover:border-[#2563EB] dark:border-slate-800 dark:bg-[#162033]"
                  >
                    <span className="font-mono text-sm font-bold tabular-nums text-[#14213D] dark:text-white">
                      {yr} Academic Year
                    </span>
                    <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                      {count} records
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How the Platform Works + Why Students Use Campus Exam Vault */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        <div className="grid items-stretch gap-8 lg:grid-cols-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033] sm:p-8 lg:col-span-7">
            <h2 className="font-display text-2xl font-bold text-[#14213D] dark:text-white">
              How Campus Exam Vault Works
            </h2>
            <div className="mt-6 space-y-6">
              {[
                {
                  step: '01. Locate Your Academic Unit',
                  body: 'Drill down by Institution, Campus, Faculty, Department, Programme, Course Code, and Academic Year—or search directly inside indexed examination PDFs.',
                },
                {
                  step: '02. Preview, Verify & Bookmark',
                  body: 'Inspect past papers in the integrated PDF reader before downloading. Distinguish official marking schemes from student revision answers at a glance.',
                },
                {
                  step: '03. Organize Revision & Contribute',
                  body: 'Save papers into custom exam collections, track course revision checklists, and upload missing papers through a magic-byte validated moderation queue.',
                },
              ].map((item) => (
                <div key={item.step} className="border-b border-slate-100 pb-5 last:border-b-0 last:pb-0 dark:border-slate-800">
                  <h3 className="font-display text-lg font-bold text-[#14213D] dark:text-white">
                    {item.step}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 border-t border-slate-200 pt-6 dark:border-slate-800 sm:grid-cols-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#16A34A]" />
                <div className="text-xs">
                  <p className="font-bold text-[#14213D] dark:text-white">Verified Moderation</p>
                  <p className="mt-0.5 text-slate-500 dark:text-slate-400">Audit-logged review before publication.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <FileCheck2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#2563EB]" />
                <div className="text-xs">
                  <p className="font-bold text-[#14213D] dark:text-white">SHA-256 Deduplication</p>
                  <p className="mt-0.5 text-slate-500 dark:text-slate-400">Magic-byte & hash checks block spoofed files.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Building2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#F4B400]" />
                <div className="text-xs">
                  <p className="font-bold text-[#14213D] dark:text-white">Multi-Campus Ready</p>
                  <p className="mt-0.5 text-slate-500 dark:text-slate-400">Structured for thousands of academic files.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative h-full min-h-[300px] overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#162033]">
              <img
                src="/src/assets/images/archive_exam_desk_1794745517563.jpg"
                alt="Organized examination archive folders and study notebooks"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101827]/85 via-[#101827]/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#F4B400]">
                  Why Students Rely on Campus Exam Vault
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-100">
                  No scattered messaging group links or dead drives. Find every unit’s past papers, marking rubrics, and revision schedules in seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-8">
        <h2 className="text-center font-display text-2xl font-bold text-[#14213D] dark:text-white sm:text-3xl">
          Frequently Asked Questions
        </h2>
        <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-6 dark:divide-slate-800 dark:border-slate-800 dark:bg-[#162033]">
          {LANDING_FAQS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={item.q} className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <span className="text-sm font-bold text-[#14213D] dark:text-white">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Quiet Institutional Footer */}
      <footer className="mt-10 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-[#162033]">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 py-10 sm:px-8 md:flex-row md:items-center">
          <div>
            <VaultBrandLogo />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Prepare Smart. Practice More. Excel. · Fictional Institutional Demonstration Archive.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-slate-600 dark:text-slate-300">
            <button type="button" onClick={() => onNavigateSection('library')} className="hover:underline">
              Past Papers Library
            </button>
            <button type="button" onClick={() => onNavigateSection('courses')} className="hover:underline">
              Courses & Departments
            </button>
            <button type="button" onClick={() => onNavigateSection('marking-schemes')} className="hover:underline">
              Marking Schemes
            </button>
            <button type="button" onClick={() => onNavigateSection('support')} className="hover:underline">
              Contact & Support
            </button>
            <button type="button" onClick={() => onOpenAuth('register')} className="hover:underline">
              Register Student Account
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
