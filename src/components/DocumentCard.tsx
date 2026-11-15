import { Bookmark, CheckCircle2, Download, Eye, FileText, Info } from 'lucide-react';
import { VaultDocument } from '../types/vault';
import { formatBytes, getVerificationMeta } from './DocumentFormatUtils';

interface DocumentCardProps {
  doc: VaultDocument;
  isBookmarked: boolean;
  onOpenDetail: (doc: VaultDocument) => void;
  onPreviewPdf: (doc: VaultDocument) => void;
  onDownload: (doc: VaultDocument) => void;
  onToggleBookmark: (docId: string) => void;
}

export function DocumentCard({
  doc,
  isBookmarked,
  onOpenDetail,
  onPreviewPdf,
  onDownload,
  onToggleBookmark,
}: DocumentCardProps) {
  const verif = getVerificationMeta(doc.verificationLevel);

  return (
    <article className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-[#2563EB]/60 dark:border-slate-800 dark:bg-[#162033] dark:hover:border-[#2563EB]/60">
      <div>
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex min-w-0 items-center gap-1.5 truncate">
            <span className="font-mono font-semibold text-[#2563EB]">{doc.courseCode}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{doc.academicYear}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{doc.semester}</span>
          </div>
          <button
            type="button"
            onClick={() => onToggleBookmark(doc.id)}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark document'}
            className={`rounded-md p-1.5 transition-colors shrink-0 ${
              isBookmarked
                ? 'text-[#F4B400]'
                : 'text-slate-400 hover:text-[#14213D] dark:hover:text-white'
            }`}
          >
            <Bookmark className="h-4 w-4" fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onOpenDetail(doc)}
          className="mt-2 block text-left"
        >
          <h3 className="font-display text-base font-bold leading-snug text-[#14213D] hover:text-[#2563EB] dark:text-white dark:hover:text-blue-400">
            {doc.title}
          </h3>
        </button>

        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
          {doc.courseName} · {doc.departmentName}
        </p>

        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {doc.description}
        </p>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3.5 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span className={`inline-flex items-center gap-1 font-semibold ${verif.toneClass}`}>
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span>{verif.shortLabel}</span>
          </span>
          <span className="font-mono tabular-nums">
            {doc.fileFormat} · {formatBytes(doc.fileSizeBytes)} · {doc.downloadsCount} dl
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPreviewPdf(doc)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8] whitespace-nowrap"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{doc.fileFormat === 'PDF' ? 'Preview PDF' : 'Inspect File'}</span>
          </button>
          <button
            type="button"
            onClick={() => onDownload(doc)}
            aria-label={`Download ${doc.title}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenDetail(doc)}
            aria-label={`View details for ${doc.title}`}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function DocumentCompactRow({
  doc,
  onOpenDetail,
  onPreviewPdf,
  onDownload,
}: {
  doc: VaultDocument;
  onOpenDetail: (doc: VaultDocument) => void;
  onPreviewPdf: (doc: VaultDocument) => void;
  onDownload: (doc: VaultDocument) => void;
}) {
  const verif = getVerificationMeta(doc.verificationLevel);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 py-3.5 last:border-b-0 dark:border-slate-800">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-mono font-semibold text-[#2563EB]">{doc.courseCode}</span>
          <span aria-hidden="true">·</span>
          <span>{doc.category}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{doc.academicYear}</span>
          <span aria-hidden="true">·</span>
          <span className={`font-medium ${verif.toneClass}`}>{verif.shortLabel}</span>
        </div>
        <button
          type="button"
          onClick={() => onOpenDetail(doc)}
          className="mt-1 block truncate text-left font-display text-sm font-semibold text-[#14213D] hover:text-[#2563EB] dark:text-white dark:hover:text-blue-400"
        >
          {doc.title}
        </button>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="hidden font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400 sm:inline">
          <FileText className="mr-1 inline h-3.5 w-3.5" />
          {doc.downloadsCount} downloads
        </span>
        <button
          type="button"
          onClick={() => onPreviewPdf(doc)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#14213D] hover:border-[#2563EB] dark:border-slate-700 dark:text-white"
        >
          Preview
        </button>
        <button
          type="button"
          onClick={() => onDownload(doc)}
          className="rounded-lg bg-[#14213D] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1f3159] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8]"
        >
          Download
        </button>
      </div>
    </div>
  );
}
