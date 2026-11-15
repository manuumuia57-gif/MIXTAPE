import { FormEvent, useMemo, useState } from 'react';
import { CheckCircle2, Mail, Phone, RotateCcw, Search } from 'lucide-react';
import { LibraryDocument, LibraryOverview, PublicPage } from '../types/vault';
import { SimpleDocumentCard } from './PublicHomePage';

export interface BrowseFilters {
  q: string;
  school: string;
  departmentId: string;
  courseId: string;
  academicYear: string;
  semester: string;
  documentType: string;
  examinationType: string;
}

interface PublicBrowsePageProps {
  page: Exclude<PublicPage, 'home'>;
  overview: LibraryOverview;
  filters: BrowseFilters;
  onChangeFilters: (next: BrowseFilters) => void;
  onNavigate: (page: PublicPage, preset?: Partial<BrowseFilters>) => void;
  onPreviewDoc: (doc: LibraryDocument) => void;
  onDownloadDoc: (doc: LibraryDocument) => void;
}

const STUDY_MATERIAL_TYPES = new Set([
  'Revision Materials',
  'Lecture Notes',
  'Assignments',
  'Practical Papers',
  'Other Study Materials',
]);

export function PublicBrowsePage({
  page,
  overview,
  filters,
  onChangeFilters,
  onNavigate,
  onPreviewDoc,
  onDownloadDoc,
}: PublicBrowsePageProps) {
  const [courseSearch, setCourseSearch] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');

  const filteredDocuments = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return overview.documents.filter((doc) => {
      if (page === 'study-materials' && !filters.documentType) {
        if (!STUDY_MATERIAL_TYPES.has(doc.documentType)) return false;
      }
      if (filters.school && doc.school !== filters.school) return false;
      if (filters.departmentId && doc.departmentId !== filters.departmentId) return false;
      if (filters.courseId && doc.courseId !== filters.courseId) return false;
      if (filters.academicYear && doc.academicYear !== filters.academicYear) return false;
      if (filters.semester && doc.semester !== filters.semester) return false;
      if (filters.documentType && doc.documentType !== filters.documentType) return false;
      if (filters.examinationType && doc.examinationType !== filters.examinationType) return false;
      if (q) {
        const hay = `${doc.title} ${doc.courseCode} ${doc.courseName} ${doc.departmentName} ${doc.school} ${doc.academicYear} ${doc.documentType} ${doc.examinationType} ${doc.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [overview.documents, page, filters]);

  const schoolDepartments = overview.departments.filter(
    (d) => !filters.school || d.school === filters.school
  );

  const deptCourses = overview.courses.filter(
    (c) =>
      (!filters.school || c.school === filters.school) &&
      (!filters.departmentId || c.departmentId === filters.departmentId)
  );

  const resetFilters = () => {
    onChangeFilters({
      q: '',
      school: '',
      departmentId: '',
      courseId: '',
      academicYear: '',
      semester: '',
      documentType: '',
      examinationType: '',
    });
  };

  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setContactError('');
    setContactSuccess(false);
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderName: contactName,
        senderEmail: contactEmail,
        subject: contactSubject,
        message: contactMessage,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setContactError(data.error || 'Could not send message.');
      return;
    }
    setContactSuccess(true);
    setContactName('');
    setContactEmail('');
    setContactSubject('');
    setContactMessage('');
  };

  if (page === 'courses') {
    const q = courseSearch.trim().toLowerCase();
    const visibleCourses = overview.courses.filter((c) => {
      if (!q) return true;
      return `${c.code} ${c.name} ${c.departmentName} ${c.school} ${c.description}`
        .toLowerCase()
        .includes(q);
    });

    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
          <h1 className="font-display text-2xl font-bold text-[#14213D] dark:text-white">
            DeKUT Courses & Departments
          </h1>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Search or select any Dedan Kimathi University of Technology course unit to view its past papers, CATs, and lecture notes.
          </p>
          <div className="relative mt-4 max-w-xl">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
              placeholder="Search course code, course name, school, or department..."
              className="w-full rounded-xl border border-slate-200 bg-[#F4F7FB] py-2.5 pl-10 pr-4 text-sm text-[#14213D] focus:border-[#2563EB] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleCourses.map((course) => {
            const count = overview.documents.filter((d) => d.courseId === course.id).length;
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => onNavigate('past-papers', { courseId: course.id })}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-left transition-colors hover:border-[#2563EB] dark:border-slate-800 dark:bg-[#162033]"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#2563EB]">{course.code}</span>
                    <span className="font-mono tabular-nums text-slate-500">{count} documents</span>
                  </div>
                  <h2 className="mt-1.5 font-display text-lg font-bold text-[#14213D] dark:text-white">
                    {course.name}
                  </h2>
                  <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {course.school} · {course.departmentName}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                    {course.description}
                  </p>
                </div>
                <span className="mt-4 text-xs font-semibold text-[#2563EB]">
                  Browse Course Resources →
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (page === 'about') {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-[#162033]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
            About {overview.settings.siteName}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-[#14213D] dark:text-white">
            {overview.settings.institutionName}
          </h1>
          <p className="mt-1 text-sm font-semibold text-[#2563EB]">{overview.settings.tagline}</p>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {overview.settings.aboutText}
          </p>
          <div className="mt-8 grid gap-4 border-t border-slate-100 pt-6 dark:border-slate-800 sm:grid-cols-3">
            <div>
              <p className="font-mono text-2xl font-bold tabular-nums text-[#14213D] dark:text-white">
                {overview.stats.totalDocuments}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Published Academic Files</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-bold tabular-nums text-[#14213D] dark:text-white">
                {overview.stats.totalCourses}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Indexed Course Units</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-bold tabular-nums text-[#14213D] dark:text-white">
                {overview.stats.totalDepartments}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">University Departments</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (page === 'contact') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-8">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033] md:col-span-5">
            <h1 className="font-display text-2xl font-bold text-[#14213D] dark:text-white">
              Contact DeKUT Library Admin
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Need a missing Dedan Kimathi University of Technology past paper uploaded or notice an incorrect course code? Send a note to the library administrator.
            </p>
            <div className="mt-6 space-y-3 text-xs text-slate-700 dark:text-slate-200">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#2563EB]" />
                <span>{overview.settings.contactEmail}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#2563EB]" />
                <span>{overview.settings.contactPhone}</span>
              </p>
            </div>
          </div>

          <form
            onSubmit={handleContactSubmit}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033] md:col-span-7"
          >
            <h2 className="font-display text-lg font-bold text-[#14213D] dark:text-white">
              Send a Message
            </h2>
            {contactSuccess && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Message received! The DeKUT library administrator will review it shortly.</span>
              </div>
            )}
            {contactError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {contactError}
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Your full name"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
              />
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Your email address"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <input
              type="text"
              required
              value={contactSubject}
              onChange={(e) => setContactSubject(e.target.value)}
              placeholder="Subject (e.g. Request CCS 3104 2024 Past Paper)"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
            />
            <textarea
              rows={4}
              required
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Write your message..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
            />
            <button
              type="submit"
              className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Past Papers or Study Materials Browse View
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#14213D] dark:text-white">
              {page === 'study-materials'
                ? 'DeKUT Study Materials & Lecture Notes'
                : 'DeKUT Past Examination Papers & Resources'}
            </h1>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              {page === 'study-materials'
                ? 'Browse lecture notes, revision notes, assignments, practical sheets, and study guides.'
                : 'Organize and filter by School or Faculty, Department, Course, Academic Year, Semester, and Examination Type.'}
            </p>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:underline"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.q}
            onChange={(e) => onChangeFilters({ ...filters, q: e.target.value })}
            placeholder="Search by course name, course code, academic year, or document title..."
            className="w-full rounded-xl border border-slate-200 bg-[#F4F7FB] py-2.5 pl-10 pr-4 text-sm text-[#14213D] focus:border-[#2563EB] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            aria-label="Filter by School or Faculty"
            value={filters.school}
            onChange={(e) =>
              onChangeFilters({ ...filters, school: e.target.value, departmentId: '', courseId: '' })
            }
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="">All Schools / Faculties</option>
            {overview.schools.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            aria-label="Filter by Department"
            value={filters.departmentId}
            onChange={(e) => onChangeFilters({ ...filters, departmentId: e.target.value, courseId: '' })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="">All Departments</option>
            {schoolDepartments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} — {d.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by Course"
            value={filters.courseId}
            onChange={(e) => onChangeFilters({ ...filters, courseId: e.target.value })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="">All Courses</option>
            {deptCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by Academic Year"
            value={filters.academicYear}
            onChange={(e) => onChangeFilters({ ...filters, academicYear: e.target.value })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="">All Academic Years</option>
            {overview.academicYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select
            aria-label="Filter by Semester"
            value={filters.semester}
            onChange={(e) => onChangeFilters({ ...filters, semester: e.target.value })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="">All Semesters</option>
            {overview.semesters.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            aria-label="Filter by Document Category"
            value={filters.documentType}
            onChange={(e) => onChangeFilters({ ...filters, documentType: e.target.value })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="">
              {page === 'study-materials' ? 'All Study Material Categories' : 'All Document Categories'}
            </option>
            {overview.documentTypes
              .filter((t) => page !== 'study-materials' || STUDY_MATERIAL_TYPES.has(t))
              .map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
          </select>

          <select
            aria-label="Filter by Examination Type"
            value={filters.examinationType}
            onChange={(e) => onChangeFilters({ ...filters, examinationType: e.target.value })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs sm:col-span-2 dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="">All Examination / Resource Types</option>
            {overview.examinationTypes.map((et) => (
              <option key={et} value={et}>{et}</option>
            ))}
          </select>
        </div>
      </section>

      <p className="font-mono text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-400">
        Showing {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'}
      </p>

      {filteredDocuments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-[#162033]">
          <p className="font-display text-lg font-bold text-[#14213D] dark:text-white">
            No matching documents found
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Try clearing one of the filters or searching another DeKUT course code.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc) => (
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
  );
}
