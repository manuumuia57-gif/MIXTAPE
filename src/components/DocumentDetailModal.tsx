import { useState } from 'react';
import {
  AlertTriangle,
  Bookmark,
  Download,
  Eye,
  FolderPlus,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';
import { BookmarkCollection, VaultDocument } from '../types/vault';
import { formatBytes, formatShortDate, getVerificationMeta } from './DocumentFormatUtils';

interface DocumentDetailModalProps {
  document: VaultDocument | null;
  relatedDocuments: VaultDocument[];
  isBookmarked: boolean;
  collections: BookmarkCollection[];
  isSignedIn: boolean;
  onClose: () => void;
  onPreviewPdf: (doc: VaultDocument) => void;
  onDownload: (doc: VaultDocument) => void;
  onToggleBookmark: (docId: string) => void;
  onToggleCollectionItem: (collectionId: string, docId: string) => void;
  onSelectRelated: (doc: VaultDocument) => void;
  onSubmitReport: (doc: VaultDocument, reportType: string, details: string) => Promise<void>;
  onNotify: (msg: string, tone?: 'info' | 'success' | 'warning') => void;
}

export function DocumentDetailModal({
  document: doc,
  relatedDocuments,
  isBookmarked,
  collections,
  isSignedIn,
  onClose,
  onPreviewPdf,
  onDownload,
  onToggleBookmark,
  onToggleCollectionItem,
  onSelectRelated,
  onSubmitReport,
  onNotify,
}: DocumentDetailModalProps) {
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportType, setReportType] = useState('incorrect_metadata');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const [aiPracticeOutput, setAiPracticeOutput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  if (!doc) return null;

  const verif = getVerificationMeta(doc.verificationLevel);

  const handleShare = async () => {
    const shareText = `${doc.courseCode} — ${doc.title} (${doc.academicYear}) · Campus Exam Vault [${doc.accessionNumber}]`;
    try {
      await navigator.clipboard.writeText(shareText);
      onNotify('Document citation & reference copied to clipboard.', 'success');
    } catch {
      onNotify(shareText, 'info');
    }
  };

  const handleGeneratePractice = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/study-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate 3 original university exam practice questions (with mark allocations) inspired by the syllabus topics of ${doc.courseCode} ${doc.courseName}: ${doc.description}`,
          contextSummary: `${doc.courseCode} ${doc.courseName} (${doc.departmentName})`,
        }),
      });
      const data = await res.json();
      setAiPracticeOutput(data.reply || 'Unable to generate practice questions.');
    } catch {
      setAiPracticeOutput('Practice question generator is temporarily unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleReportSubmit = async () => {
    if (!reportDetails.trim()) return;
    setSubmittingReport(true);
    await onSubmitReport(doc, reportType, reportDetails);
    setSubmittingReport(false);
    setReportDetails('');
    setShowReportForm(false);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#101827]/70 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-detail-title"
    >
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#162033] sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close document details"
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Institutional Hierarchy Breadcrumb */}
        <p className="pr-10 text-xs text-slate-500 dark:text-slate-400">
          {doc.institutionName} <span aria-hidden="true">/</span> {doc.facultyName}{' '}
          <span aria-hidden="true">/</span> {doc.departmentName} <span aria-hidden="true">/</span>{' '}
          <span className="font-mono font-semibold text-[#2563EB]">{doc.courseCode}</span>
        </p>

        <h2
          id="doc-detail-title"
          className="mt-2 pr-8 font-display text-2xl font-bold text-[#14213D] dark:text-white"
        >
          {doc.title}
        </h2>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className={`font-semibold ${verif.toneClass}`}>{verif.label}</span>
          <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">·</span>
          <span className="font-mono text-slate-500 dark:text-slate-400">{doc.accessionNumber}</span>
          <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">·</span>
          <span className="text-slate-600 dark:text-slate-300">{doc.category}</span>
          {doc.isDemoSample && (
            <>
              <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">·</span>
              <span className="text-slate-500 dark:text-slate-400">Fictional Demonstration Record</span>
            </>
          )}
        </div>

        {/* Primary Action Bar */}
        <div className="mt-5 flex flex-wrap items-center gap-2.5 border-y border-slate-200 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onPreviewPdf(doc)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
          >
            <Eye className="h-4 w-4" />
            <span>View PDF</span>
          </button>

          <button
            type="button"
            onClick={() => onDownload(doc)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-[#14213D] hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
          >
            <Download className="h-4 w-4" />
            <span>Download ({formatBytes(doc.fileSizeBytes)})</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleBookmark(doc.id)}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-semibold transition-colors ${
              isBookmarked
                ? 'border-[#F4B400] bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Bookmark className="h-4 w-4" />
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={() => setShowReportForm((s) => !s)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Report Issue</span>
          </button>
        </div>

        {/* Metadata Definition Grid */}
        <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 border-b border-slate-200 pb-6 text-sm dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Course Unit</dt>
            <dd className="mt-0.5 font-semibold text-[#14213D] dark:text-white">
              {doc.courseCode} — {doc.courseName}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Programme</dt>
            <dd className="mt-0.5 text-slate-800 dark:text-slate-200">{doc.programmeName}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Academic Year & Semester</dt>
            <dd className="mt-0.5 tabular-nums text-slate-800 dark:text-slate-200">
              {doc.academicYear} · {doc.semester}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Examination Type</dt>
            <dd className="mt-0.5 text-slate-800 dark:text-slate-200">{doc.examType}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Lecturer / Contributor</dt>
            <dd className="mt-0.5 text-slate-800 dark:text-slate-200">
              {doc.lecturerName} (Uploaded by {doc.uploadedByName})
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">File & Usage Metrics</dt>
            <dd className="mt-0.5 font-mono text-xs tabular-nums text-slate-700 dark:text-slate-300">
              {doc.fileFormat} · {formatBytes(doc.fileSizeBytes)} · {doc.downloadsCount} downloads · {doc.viewsCount} views
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Upload Date</dt>
            <dd className="mt-0.5 tabular-nums text-slate-800 dark:text-slate-200">{formatShortDate(doc.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Campus</dt>
            <dd className="mt-0.5 text-slate-800 dark:text-slate-200">{doc.campusName}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">SHA-256 Digest</dt>
            <dd className="mt-0.5 truncate font-mono text-xs text-slate-500 dark:text-slate-400">{doc.fileHash}</dd>
          </div>
        </dl>

        {/* Description */}
        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Resource Description
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {doc.description}
          </p>
        </div>

        {/* Save into Custom Collection */}
        {isSignedIn && collections.length > 0 && (
          <div className="mt-5 rounded-xl border border-slate-200 bg-[#F4F7FB] p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#14213D] dark:text-white">
              <FolderPlus className="h-4 w-4 text-[#2563EB]" />
              <span>Save to Personal Revision Collection</span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {collections.map((col) => {
                const inCol = col.documentIds.includes(doc.id);
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => onToggleCollectionItem(col.id, doc.id)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      inCol
                        ? 'border-[#2563EB] bg-[#2563EB] text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-[#2563EB] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {inCol ? `In "${col.name}"` : `+ ${col.name}`}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Practice Questions Helper (Explicitly Labeled Non-Official) */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-[#F4F7FB] p-4 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#14213D] dark:text-white">
                AI-Assisted Practice Question Generator
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generates sample revision prompts from course topics. Clearly labeled as non-official practice material.
              </p>
            </div>
            <button
              type="button"
              onClick={handleGeneratePractice}
              disabled={aiLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#14213D] hover:border-[#2563EB] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#F4B400]" />
              <span>{aiLoading ? 'Generating...' : 'Generate Practice Questions'}</span>
            </button>
          </div>
          {aiPracticeOutput && (
            <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-3.5 font-sans text-xs leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-[#101827] dark:text-slate-200">
              {aiPracticeOutput}
            </pre>
          )}
        </div>

        {/* Report Incorrect Info Form */}
        {showReportForm && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
            <h4 className="text-xs font-bold text-[#14213D] dark:text-white">
              Report Incorrect Information or File Issue
            </h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="incorrect_metadata">Incorrect Course / Year / Metadata</option>
                <option value="broken_file">Corrupted or Unreadable Pages</option>
                <option value="wrong_course">Filed Under Wrong Course</option>
                <option value="duplicate">Duplicate Document</option>
                <option value="inappropriate">Inappropriate Content</option>
              </select>
              <input
                type="text"
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Describe what needs correction..."
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 sm:col-span-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReportForm(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingReport || !reportDetails.trim()}
                onClick={handleReportSubmit}
                className="rounded-lg bg-[#14213D] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1e325c] disabled:opacity-50"
              >
                {submittingReport ? 'Submitting...' : 'Submit Report to Moderators'}
              </button>
            </div>
          </div>
        )}

        {/* Related Papers */}
        {relatedDocuments.length > 0 && (
          <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Related Course & Department Resources
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {relatedDocuments.map((rel) => (
                <button
                  key={rel.id}
                  type="button"
                  onClick={() => onSelectRelated(rel)}
                  className="rounded-xl border border-slate-200 p-3 text-left transition-colors hover:border-[#2563EB] dark:border-slate-800 dark:hover:border-[#2563EB]"
                >
                  <p className="font-mono text-[11px] font-semibold text-[#2563EB]">
                    {rel.courseCode} · {rel.academicYear} · {rel.category}
                  </p>
                  <p className="mt-1 truncate text-xs font-semibold text-[#14213D] dark:text-white">
                    {rel.title}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
