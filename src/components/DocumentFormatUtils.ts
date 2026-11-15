import { DocumentStatus, VerificationLevel } from '../types/vault';

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso.slice(0, 10);
  }
}

export function getVerificationMeta(level: VerificationLevel): {
  label: string;
  shortLabel: string;
  toneClass: string;
} {
  switch (level) {
    case 'official_marking_scheme':
      return {
        label: 'Official Marking Scheme (Demo)',
        shortLabel: 'Official Marking Scheme',
        toneClass: 'text-[#16A34A] dark:text-emerald-400',
      };
    case 'lecturer_verified':
      return {
        label: 'Lecturer-Verified Resource',
        shortLabel: 'Lecturer-Verified',
        toneClass: 'text-[#2563EB] dark:text-blue-400',
      };
    case 'student_revision_notes':
      return {
        label: 'Student-Created Revision Material',
        shortLabel: 'Student Revision',
        toneClass: 'text-amber-700 dark:text-amber-400',
      };
    case 'ai_practice_material':
      return {
        label: 'AI-Generated Practice (Non-Official)',
        shortLabel: 'AI Practice',
        toneClass: 'text-slate-600 dark:text-slate-400',
      };
    case 'unverified_community':
      return {
        label: 'Unverified Community Solution',
        shortLabel: 'Unverified Community',
        toneClass: 'text-rose-700 dark:text-rose-400',
      };
    default:
      return {
        label: 'Demonstration Sample Record',
        shortLabel: 'Demo Sample',
        toneClass: 'text-slate-600 dark:text-slate-400',
      };
  }
}

export function getStatusLabel(status: DocumentStatus): { label: string; colorClass: string } {
  switch (status) {
    case 'approved':
      return { label: 'Approved', colorClass: 'text-[#16A34A] dark:text-emerald-400' };
    case 'pending':
      return { label: 'Pending Review', colorClass: 'text-amber-700 dark:text-amber-400' };
    case 'rejected':
      return { label: 'Rejected / Needs Edit', colorClass: 'text-red-700 dark:text-red-400' };
    case 'archived':
      return { label: 'Archived', colorClass: 'text-slate-500 dark:text-slate-400' };
  }
}
