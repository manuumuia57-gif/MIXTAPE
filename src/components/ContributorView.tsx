import { Award, CheckCircle2, UploadCloud } from 'lucide-react';
import { UserAccount, VaultDocument, VaultSection } from '../types/vault';
import { formatShortDate, getStatusLabel } from './DocumentFormatUtils';

interface ContributorViewProps {
  user: UserAccount | null;
  myUploads: VaultDocument[];
  onOpenAuth: (tab: 'login' | 'register') => void;
  onNavigate: (sec: VaultSection) => void;
}

export function ContributorView({
  user,
  myUploads,
  onOpenAuth,
  onNavigate,
}: ContributorViewProps) {
  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#162033]">
        <Award className="mx-auto h-10 w-10 text-[#F4B400]" />
        <h2 className="mt-3 font-display text-2xl font-bold text-[#14213D] dark:text-white">
          Sign in to view your Contributor Profile
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Track approved uploads, earn quality-verified contributor badges, and view moderation feedback.
        </p>
        <button
          type="button"
          onClick={() => onOpenAuth('login')}
          className="mt-5 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Sign In
        </button>
      </div>
    );
  }

  const approvedCount = myUploads.filter((u) => u.status === 'approved').length;
  const pendingCount = myUploads.filter((u) => u.status === 'pending').length;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
              Academic Contributor Profile
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-[#14213D] dark:text-white">
              {user.fullName}
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Reputation points are awarded strictly for moderator-approved, high-utility uploads (+35 pts per verified paper), never quantity alone.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('upload')}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Submit New Resource</span>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 dark:border-slate-800 sm:grid-cols-4">
          <div>
            <p className="font-mono text-2xl font-bold tabular-nums text-[#14213D] dark:text-white">
              {user.approvedUploadsCount}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Approved Uploads</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold tabular-nums text-[#14213D] dark:text-white">
              {myUploads.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Submissions Tracked</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
              {pendingCount}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pending Verification</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold tabular-nums text-[#2563EB]">
              {user.contributionPoints}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Quality Reputation Points</p>
          </div>
        </div>
      </section>

      {/* Achievement Badges */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
        <h2 className="font-display text-lg font-bold text-[#14213D] dark:text-white">
          Earned Academic Badges
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {user.badges.map((b) => (
            <div
              key={b}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-[#F4F7FB] p-4 dark:border-slate-800 dark:bg-slate-900/50"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[#F4B400]" />
              <div>
                <p className="text-xs font-bold text-[#14213D] dark:text-white">{b}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Verified contribution milestone
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upload History & Actions */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-[#14213D] dark:text-white">
            Submission Audit & History ({approvedCount} approved)
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('support')}
            className="text-xs font-semibold text-[#2563EB] hover:underline"
          >
            Recommend New Course / Report Missing Paper
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="py-2 pr-4 font-semibold">Accession</th>
                <th className="py-2 pr-4 font-semibold">Document</th>
                <th className="py-2 pr-4 font-semibold">Category</th>
                <th className="py-2 pr-4 font-semibold">Status</th>
                <th className="py-2 text-right font-semibold">Downloads</th>
                <th className="py-2 text-right font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {myUploads.map((doc) => {
                const st = getStatusLabel(doc.status);
                return (
                  <tr key={doc.id}>
                    <td className="py-3 pr-4 font-mono text-slate-500">{doc.accessionNumber}</td>
                    <td className="py-3 pr-4 font-semibold text-[#14213D] dark:text-white">
                      {doc.title}
                    </td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{doc.category}</td>
                    <td className={`py-3 pr-4 font-semibold ${st.colorClass}`}>{st.label}</td>
                    <td className="py-3 pr-4 text-right font-mono tabular-nums">{doc.downloadsCount}</td>
                    <td className="py-3 text-right tabular-nums text-slate-500">
                      {formatShortDate(doc.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
