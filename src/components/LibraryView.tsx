import { useMemo, useState } from 'react';
import { LayoutGrid, List, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { CatalogResponse, VaultDocument } from '../types/vault';
import { DocumentCard } from './DocumentCard';
import { formatBytes, formatShortDate, getVerificationMeta } from './DocumentFormatUtils';

export interface LibraryFilters {
  q: string;
  institutionId: string;
  campusId: string;
  facultyId: string;
  departmentId: string;
  programmeId: string;
  courseId: string;
  academicYear: string;
  semester: string;
  category: string;
  fileFormat: string;
  sort: 'newest' | 'popular' | 'alpha';
}

interface LibraryViewProps {
  catalog: CatalogResponse | null;
  documents: VaultDocument[];
  bookmarkedIds: string[];
  recentSearches: string[];
  filters: LibraryFilters;
  onChangeFilters: (next: LibraryFilters) => void;
  onRecordSearch: (term: string) => void;
  onClearRecentSearches: () => void;
  onOpenDocDetail: (doc: VaultDocument) => void;
  onPreviewPdf: (doc: VaultDocument) => void;
  onDownload: (doc: VaultDocument) => void;
  onToggleBookmark: (docId: string) => void;
}

const POPULAR_SEARCHES = ['CSC 204', 'Database Systems', '2024/2025', 'Marking Schemes', 'EEE 210', 'CAT Papers'];

export function LibraryView({
  catalog,
  documents,
  bookmarkedIds,
  recentSearches,
  filters,
  onChangeFilters,
  onRecordSearch,
  onClearRecentSearches,
  onOpenDocDetail,
  onPreviewPdf,
  onDownload,
  onToggleBookmark,
}: LibraryViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const institutions = catalog?.institutions || [];
  const campuses = (catalog?.campuses || []).filter(
    (c) => !filters.institutionId || c.institutionId === filters.institutionId
  );
  const faculties = catalog?.faculties || [];
  const departments = (catalog?.departments || []).filter(
    (d) => !filters.facultyId || d.facultyId === filters.facultyId
  );
  const programmes = (catalog?.programmes || []).filter(
    (p) => !filters.departmentId || p.departmentId === filters.departmentId
  );
  const courses = (catalog?.courses || []).filter(
    (c) => !filters.departmentId || c.departmentId === filters.departmentId
  );

  // Instant search suggestions from course codes, course names, and document titles
  const suggestions = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    const courseMatches = (catalog?.courses || [])
      .filter((c) => `${c.code} ${c.name}`.toLowerCase().includes(q))
      .slice(0, 4)
      .map((c) => `${c.code} ${c.name}`);
    const docMatches = documents
      .filter((d) => d.title.toLowerCase().includes(q) || d.lecturerName.toLowerCase().includes(q))
      .slice(0, 3)
      .map((d) => d.title);
    return Array.from(new Set([...courseMatches, ...docMatches])).slice(0, 6);
  }, [filters.q, catalog, documents]);

  const filteredDocs = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    let list = documents.filter((d) => {
      if (filters.institutionId && d.institutionId !== filters.institutionId) return false;
      if (filters.campusId && d.campusId !== filters.campusId) return false;
      if (filters.facultyId && d.facultyId !== filters.facultyId) return false;
      if (filters.departmentId && d.departmentId !== filters.departmentId) return false;
      if (filters.programmeId && d.programmeId !== filters.programmeId) return false;
      if (filters.courseId && d.courseId !== filters.courseId) return false;
      if (filters.academicYear && d.academicYear !== filters.academicYear) return false;
      if (filters.semester && d.semester !== filters.semester) return false;
      if (filters.category && d.category !== filters.category) return false;
      if (filters.fileFormat && d.fileFormat !== filters.fileFormat) return false;
      if (q) {
        const haystack = [
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
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    if (filters.sort === 'popular') {
      list = [...list].sort((a, b) => b.downloadsCount - a.downloadsCount);
    } else if (filters.sort === 'alpha') {
      list = [...list].sort((a, b) => a.courseCode.localeCompare(b.courseCode) || a.title.localeCompare(b.title));
    } else {
      list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return list;
  }, [documents, filters]);

  const resetAllFilters = () => {
    onChangeFilters({
      q: '',
      institutionId: '',
      campusId: '',
      facultyId: '',
      departmentId: '',
      programmeId: '',
      courseId: '',
      academicYear: '',
      semester: '',
      category: '',
      fileFormat: '',
      sort: 'newest',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Search Engine */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#14213D] dark:text-white">
              Past Papers & Examination Library
            </h1>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Browse by Institution, Campus, School/Faculty, Department, Programme, Course Unit, Year, Semester, and Exam Type.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg bg-slate-100 p-1 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#14213D] shadow-sm dark:bg-[#1E293B] dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
                  viewMode === 'table'
                    ? 'bg-white text-[#14213D] shadow-sm dark:bg-[#1E293B] dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span>Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Instant Search Input with Suggestions */}
        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.q}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
            onChange={(e) => onChangeFilters({ ...filters, q: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filters.q.trim()) {
                onRecordSearch(filters.q);
                setShowSuggestions(false);
              }
            }}
            placeholder="Instant search: course code (CSC 204), course name, lecturer, academic year, exam type, or indexed PDF text..."
            className="w-full rounded-xl border border-slate-200 bg-[#F4F7FB] py-3 pl-10 pr-28 text-sm text-[#14213D] placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          {filters.q && (
            <button
              type="button"
              onClick={() => onChangeFilters({ ...filters, q: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Clear
            </button>
          )}

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 z-20 mt-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-[#162033]">
              <p className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Matching Suggestions
              </p>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={() => {
                    onChangeFilters({ ...filters, q: s });
                    onRecordSearch(s);
                    setShowSuggestions(false);
                  }}
                  className="block w-full rounded-lg px-2.5 py-2 text-left text-xs font-medium text-[#14213D] hover:bg-[#F4F7FB] dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Popular & Recent Searches */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Popular:</span>
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  onChangeFilters({ ...filters, q: term });
                  onRecordSearch(term);
                }}
                className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-[#2563EB] hover:text-[#2563EB] dark:border-slate-700 dark:text-slate-300"
              >
                {term}
              </button>
            ))}
          </div>
          {recentSearches.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Recent:</span>
              {recentSearches.slice(0, 4).map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => onChangeFilters({ ...filters, q: term })}
                  className="text-xs font-medium text-[#2563EB] hover:underline"
                >
                  {term}
                </button>
              ))}
              <button
                type="button"
                onClick={onClearRecentSearches}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear history
              </button>
            </div>
          )}
        </div>

        {/* Hierarchical & Faceted Filter Grid */}
        <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#14213D] dark:text-slate-200">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#2563EB]" />
              <span>Academic Hierarchy & Attribute Filters</span>
            </div>
            <button
              type="button"
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#2563EB] dark:text-slate-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <select
              aria-label="Filter by Institution"
              value={filters.institutionId}
              onChange={(e) => onChangeFilters({ ...filters, institutionId: e.target.value, campusId: '' })}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">All Institutions</option>
              {institutions.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>

            <select
              aria-label="Filter by Campus"
              value={filters.campusId}
              onChange={(e) => onChangeFilters({ ...filters, campusId: e.target.value })}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">All Campuses</option>
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              aria-label="Filter by Faculty or School"
              value={filters.facultyId}
              onChange={(e) =>
                onChangeFilters({ ...filters, facultyId: e.target.value, departmentId: '', programmeId: '', courseId: '' })
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">All Schools / Faculties</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>

            <select
              aria-label="Filter by Department"
              value={filters.departmentId}
              onChange={(e) =>
                onChangeFilters({ ...filters, departmentId: e.target.value, programmeId: '', courseId: '' })
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.code} — {d.name}</option>
              ))}
            </select>

            <select
              aria-label="Filter by Programme"
              value={filters.programmeId}
              onChange={(e) => onChangeFilters({ ...filters, programmeId: e.target.value })}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">All Programmes</option>
              {programmes.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <select
              aria-label="Filter by Course"
              value={filters.courseId}
              onChange={(e) => onChangeFilters({ ...filters, courseId: e.target.value })}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
              ))}
            </select>

            <select
              aria-label="Filter by Academic Year"
              value={filters.academicYear}
              onChange={(e) => onChangeFilters({ ...filters, academicYear: e.target.value })}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">All Academic Years</option>
              {(catalog?.academicYears || []).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <select
              aria-label="Filter by Semester"
              value={filters.semester}
              onChange={(e) => onChangeFilters({ ...filters, semester: e.target.value })}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">All Semesters</option>
              {(catalog?.semesters || []).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              aria-label="Filter by Category"
              value={filters.category}
              onChange={(e) => onChangeFilters({ ...filters, category: e.target.value })}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">All Document Categories</option>
              {(catalog?.categories || []).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <select
                aria-label="Filter by File Format"
                value={filters.fileFormat}
                onChange={(e) => onChangeFilters({ ...filters, fileFormat: e.target.value })}
                className="w-1/2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">Format</option>
                <option value="PDF">PDF</option>
                <option value="DOCX">DOCX</option>
                <option value="PPTX">PPTX</option>
              </select>
              <select
                aria-label="Sort results"
                value={filters.sort}
                onChange={(e) => onChangeFilters({ ...filters, sort: e.target.value as LibraryFilters['sort'] })}
                className="w-1/2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="newest">Newest</option>
                <option value="popular">Most Downloaded</option>
                <option value="alpha">A–Z Course</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <span className="font-mono tabular-nums font-semibold">
          Showing {filteredDocs.length} approved {filteredDocs.length === 1 ? 'document' : 'documents'}
        </span>
      </div>

      {/* Results View */}
      {filteredDocs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-[#162033]">
          <p className="font-display text-lg font-bold text-[#14213D] dark:text-white">
            No matching examination documents found
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Try clearing a semester or year filter, or search by course code.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="mt-4 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocs.map((doc) => (
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
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#162033]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-[#F4F7FB] text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Document Title</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Year · Sem</th>
                <th className="px-4 py-3 font-semibold">Verification</th>
                <th className="px-4 py-3 font-semibold text-right">Size</th>
                <th className="px-4 py-3 font-semibold text-right">Downloads</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDocs.map((doc) => {
                const verif = getVerificationMeta(doc.verificationLevel);
                return (
                  <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono font-bold text-[#2563EB] whitespace-nowrap">
                      {doc.courseCode}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onOpenDocDetail(doc)}
                        className="font-semibold text-[#14213D] hover:text-[#2563EB] hover:underline dark:text-white text-left"
                      >
                        {doc.title}
                      </button>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {doc.departmentName} · Uploaded {formatShortDate(doc.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {doc.category}
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {doc.academicYear} · {doc.semester.replace('Semester ', 'S')}
                    </td>
                    <td className={`px-4 py-3 font-semibold whitespace-nowrap ${verif.toneClass}`}>
                      {verif.shortLabel}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {formatBytes(doc.fileSizeBytes)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      {doc.downloadsCount}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onPreviewPdf(doc)}
                          className="rounded border border-slate-200 px-2.5 py-1 font-semibold text-[#14213D] hover:border-[#2563EB] dark:border-slate-700 dark:text-white"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => onDownload(doc)}
                          className="rounded bg-[#2563EB] px-2.5 py-1 font-semibold text-white hover:bg-[#1D4ED8]"
                        >
                          Download
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
