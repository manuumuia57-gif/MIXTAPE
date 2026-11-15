import { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, FolderKanban } from 'lucide-react';
import { CatalogResponse, VaultDocument } from '../types/vault';
import { DocumentCard } from './DocumentCard';

interface CoursesViewProps {
  catalog: CatalogResponse | null;
  documents: VaultDocument[];
  bookmarkedIds: string[];
  selectedCourseId: string | null;
  onSelectCourse: (courseId: string | null) => void;
  onOpenDocDetail: (doc: VaultDocument) => void;
  onPreviewPdf: (doc: VaultDocument) => void;
  onDownload: (doc: VaultDocument) => void;
  onToggleBookmark: (docId: string) => void;
}

export function CoursesView({
  catalog,
  documents,
  bookmarkedIds,
  selectedCourseId,
  onSelectCourse,
  onOpenDocDetail,
  onPreviewPdf,
  onDownload,
  onToggleBookmark,
}: CoursesViewProps) {
  const [deptFilter, setDeptFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const departments = catalog?.departments || [];
  const courses = catalog?.courses || [];

  const activeCourse = courses.find((c) => c.id === selectedCourseId) || null;

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter((c) => {
      if (deptFilter && c.departmentId !== deptFilter) return false;
      if (q && !`${c.code} ${c.name} ${c.departmentName} ${c.description}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [courses, deptFilter, search]);

  if (activeCourse) {
    const courseDocs = documents.filter((d) => d.courseId === activeCourse.id);
    const pastPapers = courseDocs.filter((d) =>
      [
        'Past Examination Papers',
        'CAT Papers',
        'Mid-Semester Examinations',
        'End-of-Semester Examinations',
        'Supplementary Examinations',
        'Special Examinations',
        'Practical Examinations',
      ].includes(d.category)
    );
    const markingSchemes = courseDocs.filter((d) => d.category === 'Marking Schemes');
    const studyResources = courseDocs.filter(
      (d) => !pastPapers.includes(d) && !markingSchemes.includes(d)
    );

    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => onSelectCourse(null)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Courses & Departments</span>
        </button>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
          <p className="font-mono text-xs font-bold text-[#2563EB]">
            {activeCourse.code} · {activeCourse.departmentName} · Year {activeCourse.yearOfStudy} · {activeCourse.creditUnits} Credits
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-[#14213D] dark:text-white sm:text-3xl">
            {activeCourse.name}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {activeCourse.programmeName}
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {activeCourse.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-6 border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
            <div>
              <span className="font-mono text-lg font-bold tabular-nums text-[#14213D] dark:text-white">
                {pastPapers.length}
              </span>{' '}
              <span className="text-slate-500 dark:text-slate-400">Past Papers</span>
            </div>
            <div>
              <span className="font-mono text-lg font-bold tabular-nums text-[#16A34A]">
                {markingSchemes.length}
              </span>{' '}
              <span className="text-slate-500 dark:text-slate-400">Marking Schemes</span>
            </div>
            <div>
              <span className="font-mono text-lg font-bold tabular-nums text-[#2563EB]">
                {studyResources.length}
              </span>{' '}
              <span className="text-slate-500 dark:text-slate-400">Notes & Revision Guides</span>
            </div>
          </div>
        </section>

        {[
          { title: 'Past Examination Papers', items: pastPapers },
          { title: 'Marking Schemes & Solutions', items: markingSchemes },
          { title: 'Revision Materials, Lecture Notes & Lab Manuals', items: studyResources },
        ].map((group) => (
          <section key={group.title} className="space-y-4">
            <h2 className="font-display text-xl font-bold text-[#14213D] dark:text-white">
              {group.title} ({group.items.length})
            </h2>
            {group.items.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-xs text-slate-500 dark:border-slate-800 dark:bg-[#162033] dark:text-slate-400">
                No documents archived in this category for {activeCourse.code} yet. Use the Upload Center to contribute resources.
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {group.items.map((doc) => (
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
            )}
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
        <h1 className="font-display text-2xl font-bold text-[#14213D] dark:text-white">
          Academic Departments & Course Catalog
        </h1>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          Explore {departments.length} departments and {courses.length} course units. Select any course to view its dedicated examination repository.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter courses by code or title..."
            className="rounded-lg border border-slate-200 bg-[#F4F7FB] px-3.5 py-2.5 text-xs text-[#14213D] focus:border-[#2563EB] focus:bg-white focus:outline-none sm:col-span-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">All Departments ({departments.length})</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} — {d.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Department Overview Strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {departments.map((dept) => {
          const active = deptFilter === dept.id;
          return (
            <button
              key={dept.id}
              type="button"
              onClick={() => setDeptFilter(active ? '' : dept.id)}
              className={`rounded-xl border p-3.5 text-left transition-colors ${
                active
                  ? 'border-[#2563EB] bg-blue-50/60 dark:bg-blue-950/30'
                  : 'border-slate-200 bg-white hover:border-[#2563EB] dark:border-slate-800 dark:bg-[#162033]'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-[#2563EB]">{dept.code}</span>
                <FolderKanban className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <p className="mt-1 truncate text-xs font-bold text-[#14213D] dark:text-white">
                {dept.name}
              </p>
            </button>
          );
        })}
      </div>

      {/* Course Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => {
          const count = documents.filter((d) => d.courseId === course.id).length;
          return (
            <button
              key={course.id}
              type="button"
              onClick={() => onSelectCourse(course.id)}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-left transition-colors hover:border-[#2563EB] dark:border-slate-800 dark:bg-[#162033]"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[#2563EB]">{course.code}</span>
                  <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    Year {course.yearOfStudy} · {course.creditUnits} CU
                  </span>
                </div>
                <h2 className="mt-1.5 font-display text-lg font-bold text-[#14213D] dark:text-white">
                  {course.name}
                </h2>
                <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {course.departmentName}
                </p>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {course.description}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-[#14213D] dark:border-slate-800 dark:text-slate-200">
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-[#2563EB]" />
                  <span className="tabular-nums">{count} available resources</span>
                </span>
                <span className="text-[#2563EB]">Open Course</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
