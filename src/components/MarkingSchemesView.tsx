import { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { VaultDocument, VerificationLevel } from '../types/vault';
import { DocumentCard } from './DocumentCard';

interface MarkingSchemesViewProps {
  documents: VaultDocument[];
  bookmarkedIds: string[];
  onOpenDocDetail: (doc: VaultDocument) => void;
  onPreviewPdf: (doc: VaultDocument) => void;
  onDownload: (doc: VaultDocument) => void;
  onToggleBookmark: (docId: string) => void;
}

const VERIFICATION_FILTERS: { id: 'all' | VerificationLevel; label: string }[] = [
  { id: 'all', label: 'All Solutions' },
  { id: 'official_marking_scheme', label: 'Official Marking Schemes' },
  { id: 'lecturer_verified', label: 'Lecturer-Provided' },
  { id: 'student_revision_notes', label: 'Student Revision Answers' },
  { id: 'unverified_community', label: 'Unverified Community' },
];

export function MarkingSchemesView({
  documents,
  bookmarkedIds,
  onOpenDocDetail,
  onPreviewPdf,
  onDownload,
  onToggleBookmark,
}: MarkingSchemesViewProps) {
  const [selectedLevel, setSelectedLevel] = useState<'all' | VerificationLevel>('all');
  const [courseSearch, setCourseSearch] = useState('');

  const solutionDocs = useMemo(() => {
    const q = courseSearch.trim().toLowerCase();
    return documents.filter((d) => {
      const isSolution =
        d.category === 'Marking Schemes' ||
        d.verificationLevel === 'official_marking_scheme' ||
        d.verificationLevel === 'unverified_community';
      if (!isSolution) return false;
      if (selectedLevel !== 'all' && d.verificationLevel !== selectedLevel) return false;
      if (q && !`${d.courseCode} ${d.courseName} ${d.title} ${d.academicYear}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [documents, selectedLevel, courseSearch]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#14213D] dark:text-white">
              Marking Schemes & Answer Resources
            </h1>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Every solution document displays its provenance tier. Official Marking Schemes and Lecturer-Provided Solutions are strictly separated from student-created or unverified community answers.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-[#F4F7FB] px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
            <span>Provenance-Verified Catalog</span>
          </div>
        </div>

        {/* Provenance Distinction Banner */}
        <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 text-xs dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <p className="inline-flex items-center gap-1.5 font-bold text-[#16A34A]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Official Marking Scheme</span>
            </p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Published directly by examination office or department rubric (Demo).
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <p className="font-bold text-[#2563EB]">Lecturer-Provided Solution</p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Worked solutions authored and verified by course faculty.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <p className="font-bold text-amber-700 dark:text-amber-400">Student Revision Answers</p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Moderator-reviewed study group solutions; cross-check against syllabus.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <p className="inline-flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-400">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Unverified Community</span>
            </p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Never an official answer key; provided purely for peer comparison.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-900">
            {VERIFICATION_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedLevel(f.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  selectedLevel === f.id
                    ? 'bg-white text-[#14213D] shadow-sm dark:bg-[#1E293B] dark:text-white'
                    : 'text-slate-600 hover:text-[#14213D] dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={courseSearch}
            onChange={(e) => setCourseSearch(e.target.value)}
            placeholder="Filter by course code or year..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 sm:w-64 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </section>

      {solutionDocs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-[#162033] dark:text-slate-400">
          No marking schemes or answer keys match the selected verification tier.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {solutionDocs.map((doc) => (
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
    </div>
  );
}
