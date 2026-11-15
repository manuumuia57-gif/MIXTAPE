import { FormEvent, useState } from 'react';
import { ArrowRight, Download, Eye, FileText, Search } from 'lucide-react';
import heroCampusImg from '../assets/images/hero_campus_library_1794745517077.jpg';
import { LibraryDocument, LibraryOverview, PublicPage } from '../types/vault';
import { formatBytes, formatShortDate } from './DocumentFormatUtils';

interface PublicHomePageProps {
  overview: LibraryOverview;
  onNavigate: (
    page: PublicPage,
    preset?: { q?: string; school?: string; departmentId?: string; courseId?: string; academicYear?: string }
  ) => void;
  onPreviewDoc: (doc: LibraryDocument) => void;
  onDownloadDoc: (doc: LibraryDocument) => void;
}

export function SimpleDocumentCard({
  doc,
  onPreviewDoc,
  onDownloadDoc,
}: {
  doc: LibraryDocument;
  onPreviewDoc: (doc: LibraryDocument) => void;
  onDownloadDoc: (doc: LibraryDocument) => void;
}) {
  return (
    <article className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-[#2563EB]/60 dark:border-slate-800 dark:bg-[#162033]">
      <div>
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-mono font-bold text-[#2563EB]">{doc.courseCode}</span>
          <span className="font-mono tabular-nums">
            {doc.academicYear} · {doc.semester}
          </span>
        </div>

        <h3 className="mt-2 font-display text-base font-bold leading-snug text-[#14213D] dark:text-white">
          {doc.title}
        </h3>

        <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300">
          {doc.courseName} · {doc.documentType}
        </p>

        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
          {doc.school} · {doc.examinationType}
        </p>

        {doc.description && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {doc.description}
          </p>
        )}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3.5 dark:border-slate-800">
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Uploaded {formatShortDate(doc.uploadedAt)}</span>
          <span className="font-mono tabular-nums">
            {doc.fileFormat} · {formatBytes(doc.fileSizeBytes)} · {doc.downloadsCount} dl
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPreviewDoc(doc)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8] whitespace-nowrap"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{doc.fileFormat === 'PDF' ? 'View PDF' : 'View File'}</span>
          </button>
          <button
            type="button"
            onClick={() => onDownloadDoc(doc)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#14213D] hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800 whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function EmptyDocumentsState({ onOpenContact }: { onOpenContact: () => void }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#162033]">
      <FileText className="mx-auto h-9 w-9 text-[#2563EB]" />
      <p className="mt-3 font-display text-base font-bold text-[#14213D] dark:text-white">
        No academic documents uploaded yet
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Once the DeKUT library administrator uploads past papers or lecture notes, they will appear here automatically.
      </p>
      <button
        type="button"
        onClick={onOpenContact}
        className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-[#14213D] hover:border-[#2563EB] dark:border-slate-700 dark:text-white"
      >
        Request a Past Paper
      </button>
    </div>
  );
}

export function PublicHomePage({
  overview,
  onNavigate,
  onPreviewDoc,
  onDownloadDoc,
}: PublicHomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    onNavigate('past-papers', { q: searchQuery.trim() });
  };

  const recentlyUploaded = overview.documents.slice(0, 6);
  const popularPapers = [...overview.documents]
    .sort((a, b) => b.downloadsCount - a.downloadsCount)
    .slice(0, 6);

  return (
    <div className="space-y-12 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid items-stretch gap-8 lg:grid-cols-12">
          <div className="flex flex-col justify-center lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#2563EB]">
              {overview.settings.institutionName} · {overview.settings.tagline}
            </p>
            <h1 className="mt-2.5 font-display text-3xl font-bold tracking-tight text-[#14213D] dark:text-white sm:text-5xl sm:leading-[1.12]">
              Welcome to DeKUT Past Papers Library
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
              Your central academic resource library for accessing past examination papers, CATs, lecture notes, revision materials, and other learning resources at Dedan Kimathi University of Technology.
            </p>

            {/* Large Search Bar */}
            <form onSubmit={handleSearch} className="mt-6">
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-[#162033] sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by course name, course code, or academic year..."
                    className="w-full bg-transparent py-2.5 pl-10 pr-3 text-sm text-[#14213D] placeholder:text-slate-400 focus:outline-none dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] whitespace-nowrap shrink-0"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Three Main Buttons */}
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('past-papers')}
                className="rounded-lg bg-[#14213D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1f3159] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] whitespace-nowrap"
              >
                Browse Past Papers
              </button>
              <button
                type="button"
                onClick={() => onNavigate('study-materials')}
                className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] whitespace-nowrap"
              >
                Browse Study Materials
              </button>
              <button
                type="button"
                onClick={() => onNavigate('courses')}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-[#14213D] hover:border-[#2563EB] dark:border-slate-700 dark:bg-[#162033] dark:text-white whitespace-nowrap"
              >
                Search Courses
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative h-full min-h-[270px] overflow-hidden rounded-2xl border border-slate-200 bg-[#14213D] dark:border-slate-800">
              <img
                src={heroCampusImg}
                alt="Students revising past examination papers in the DeKUT campus library"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101827]/85 via-[#101827]/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="font-mono text-xs font-semibold text-blue-200 tabular-nums">
                  {overview.stats.totalDocuments} Resources · {overview.stats.totalCourses} Courses · {overview.stats.totalDepartments} Departments
                </p>
                <p className="mt-1 font-display text-lg font-bold">
                  Dedan Kimathi University of Technology
                </p>
                <p className="mt-0.5 text-xs text-slate-200">
                  Open student access to past papers, CATs & lecture notes — no login required.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Uploaded Papers */}
      <section className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex items-end justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#14213D] dark:text-white">
              Recently Uploaded Papers
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Latest examination papers, CATs, and study resources published for DeKUT students.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('past-papers')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline whitespace-nowrap"
          >
            <span>View all</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-5">
          {recentlyUploaded.length === 0 ? (
            <EmptyDocumentsState onOpenContact={() => onNavigate('contact')} />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {recentlyUploaded.map((doc) => (
                <SimpleDocumentCard
                  key={doc.id}
                  doc={doc}
                  onPreviewDoc={onPreviewDoc}
                  onDownloadDoc={onDownloadDoc}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Past Papers */}
      {popularPapers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="flex items-end justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#14213D] dark:text-white">
                Popular Past Papers
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Most downloaded university examination papers and revision guides.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {popularPapers.map((doc) => (
              <SimpleDocumentCard
                key={doc.id}
                doc={doc}
                onPreviewDoc={onPreviewDoc}
                onDownloadDoc={onDownloadDoc}
              />
            ))}
          </div>
        </section>
      )}

      {/* Browse by Department, Course & Academic Year */}
      <section className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="font-display text-xl font-bold text-[#14213D] dark:text-white">
              Browse by Department
            </h2>
            <div className="mt-4 space-y-2.5">
              {overview.departments.length === 0 ? (
                <p className="text-xs text-slate-500">No departments configured yet.</p>
              ) : (
                overview.departments.map((dept) => {
                  const count = overview.documents.filter((d) => d.departmentId === dept.id).length;
                  return (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => onNavigate('past-papers', { departmentId: dept.id })}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-[#2563EB] dark:border-slate-800 dark:bg-[#162033]"
                    >
                      <div className="min-w-0 pr-3">
                        <span className="font-mono text-xs font-bold text-[#2563EB]">
                          {dept.code} · {dept.school}
                        </span>
                        <p className="truncate text-sm font-semibold text-[#14213D] dark:text-white">
                          {dept.name}
                        </p>
                      </div>
                      <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                        {count} files
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-[#14213D] dark:text-white">
                Browse by Course
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('courses')}
                className="text-xs font-semibold text-[#2563EB] hover:underline"
              >
                All courses
              </button>
            </div>
            <div className="mt-4 space-y-2.5">
              {overview.courses.length === 0 ? (
                <p className="text-xs text-slate-500">No courses added yet.</p>
              ) : (
                overview.courses.slice(0, 7).map((course) => {
                  const count = overview.documents.filter((d) => d.courseId === course.id).length;
                  return (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => onNavigate('past-papers', { courseId: course.id })}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-[#2563EB] dark:border-slate-800 dark:bg-[#162033]"
                    >
                      <div className="min-w-0 pr-3">
                        <span className="font-mono text-xs font-bold text-[#2563EB]">{course.code}</span>
                        <p className="truncate text-sm font-semibold text-[#14213D] dark:text-white">
                          {course.name}
                        </p>
                      </div>
                      <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                        {count}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <h2 className="font-display text-xl font-bold text-[#14213D] dark:text-white">
              Browse by Academic Year
            </h2>
            <div className="mt-4 space-y-2.5">
              {overview.academicYears.map((yr) => {
                const count = overview.documents.filter((d) => d.academicYear === yr).length;
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => onNavigate('past-papers', { academicYear: yr })}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-[#2563EB] dark:border-slate-800 dark:bg-[#162033]"
                  >
                    <span className="font-mono text-sm font-bold tabular-nums text-[#14213D] dark:text-white">
                      {yr}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
