import {
  AlertTriangle,
  Award,
  Bookmark,
  BookOpen,
  FileUp,
  FolderKanban,
  Megaphone,
  Search,
  UploadCloud,
} from 'lucide-react';
import {
  Announcement,
  UserAccount,
  VaultDocument,
  VaultSection,
} from '../types/vault';
import { DocumentCompactRow } from './DocumentCard';
import { formatShortDate } from './DocumentFormatUtils';

interface DashboardViewProps {
  user: UserAccount | null;
  documents: VaultDocument[];
  bookmarkedIds: string[];
  recentViewIds: string[];
  recentDownloadIds: string[];
  myUploads: VaultDocument[];
  announcements: Announcement[];
  onNavigate: (sec: VaultSection, filter?: { departmentId?: string; category?: string }) => void;
  onOpenAuth: (tab: 'login' | 'register') => void;
  onOpenDocDetail: (doc: VaultDocument) => void;
  onPreviewPdf: (doc: VaultDocument) => void;
  onDownload: (doc: VaultDocument) => void;
}

export function DashboardView({
  user,
  documents,
  bookmarkedIds,
  recentViewIds,
  recentDownloadIds,
  myUploads,
  announcements,
  onNavigate,
  onOpenAuth,
  onOpenDocDetail,
  onPreviewPdf,
  onDownload,
}: DashboardViewProps) {
  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#162033]">
        <h2 className="font-display text-2xl font-bold text-[#14213D] dark:text-white">
          Sign in for your personalized Campus Exam Vault Dashboard
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-300">
          Access recently viewed papers, download history, custom bookmark collections, exam countdown checklists, and departmental recommendations.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => onOpenAuth('login')}
            className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
          >
            Sign In (or Try Demo Roles)
          </button>
          <button
            type="button"
            onClick={() => onNavigate('library')}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-[#14213D] hover:border-[#2563EB] dark:border-slate-700 dark:text-white"
          >
            Continue Browsing Library
          </button>
        </div>
      </div>
    );
  }

  const byId = new Map(documents.map((d) => [d.id, d]));
  const recentViewedDocs = recentViewIds.map((id) => byId.get(id)).filter(Boolean) as VaultDocument[];
  const recentDownloadedDocs = recentDownloadIds.map((id) => byId.get(id)).filter(Boolean) as VaultDocument[];
  const bookmarkedDocs = bookmarkedIds.map((id) => byId.get(id)).filter(Boolean) as VaultDocument[];
  const recommendedDocs = documents
    .filter((d) => d.departmentId === user.departmentId || ['Revision Materials', 'Marking Schemes'].includes(d.category))
    .slice(0, 4);
  const popularDocs = [...documents].sort((a, b) => b.downloadsCount - a.downloadsCount).slice(0, 4);
  const latestDocs = documents.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Student / Staff Welcome Header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
              <img
                src={user.avatarUrl}
                alt={`${user.fullName} portrait`}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
                Welcome back · {user.role.toUpperCase()} Portal
              </p>
              <h1 className="mt-0.5 truncate font-display text-2xl font-bold text-[#14213D] dark:text-white">
                {user.fullName}
              </h1>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                {user.institutionName} · {user.departmentName} · {user.programmeName} · {user.academicYear}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 border-t border-slate-100 pt-4 md:border-t-0 md:pt-0 dark:border-slate-800">
            <div>
              <p className="font-mono text-xl font-bold tabular-nums text-[#14213D] dark:text-white">
                {bookmarkedDocs.length}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Saved Papers</p>
            </div>
            <div>
              <p className="font-mono text-xl font-bold tabular-nums text-[#14213D] dark:text-white">
                {myUploads.length}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">My Uploads</p>
            </div>
            <div>
              <p className="font-mono text-xl font-bold tabular-nums text-[#2563EB]">
                {user.contributionPoints} pts
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Contribution Score</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex flex-wrap gap-2.5 border-t border-slate-100 pt-5 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onNavigate('library')}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search Past Papers</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('courses')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-[#14213D] hover:border-[#2563EB] dark:border-slate-700 dark:text-white"
          >
            <FolderKanban className="h-3.5 w-3.5" />
            <span>Browse Courses</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('upload')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-[#14213D] hover:border-[#2563EB] dark:border-slate-700 dark:text-white"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>Upload Material</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('bookmarks')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-[#14213D] hover:border-[#2563EB] dark:border-slate-700 dark:text-white"
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>View Bookmarks</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('contributor')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-[#14213D] hover:border-[#2563EB] dark:border-slate-700 dark:text-white"
          >
            <Award className="h-3.5 w-3.5" />
            <span>My Uploads</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('support')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:border-[#2563EB] dark:border-slate-700 dark:text-slate-300"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Report a Problem</span>
          </button>
        </div>
      </section>

      {/* Main Widget Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          {/* Recommended for Department */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h2 className="font-display text-lg font-bold text-[#14213D] dark:text-white">
                  Recommended for {user.departmentName}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Past papers, revision guides, and marking schemes aligned with your department.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('library', { departmentId: user.departmentId })}
                className="text-xs font-semibold text-[#2563EB] hover:underline whitespace-nowrap"
              >
                See department papers
              </button>
            </div>
            <div className="mt-2">
              {recommendedDocs.map((doc) => (
                <DocumentCompactRow
                  key={doc.id}
                  doc={doc}
                  onOpenDetail={onOpenDocDetail}
                  onPreviewPdf={onPreviewPdf}
                  onDownload={onDownload}
                />
              ))}
            </div>
          </section>

          {/* Recently Viewed & Downloaded */}
          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#162033]">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-[#14213D] dark:text-white">
                <BookOpen className="h-4 w-4 text-[#2563EB]" />
                <span>Recently Viewed Papers</span>
              </h3>
              {recentViewedDocs.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  Documents you open or preview will appear here for quick resumption.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                  {recentViewedDocs.slice(0, 4).map((doc) => (
                    <li key={doc.id} className="py-2.5">
                      <button
                        type="button"
                        onClick={() => onOpenDocDetail(doc)}
                        className="block w-full text-left"
                      >
                        <p className="font-mono text-[11px] font-semibold text-[#2563EB]">{doc.courseCode}</p>
                        <p className="truncate text-xs font-semibold text-[#14213D] hover:underline dark:text-white">
                          {doc.title}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#162033]">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-[#14213D] dark:text-white">
                <FileUp className="h-4 w-4 text-[#16A34A]" />
                <span>Recently Downloaded</span>
              </h3>
              {recentDownloadedDocs.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  Files you download from the examination vault will appear here.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                  {recentDownloadedDocs.slice(0, 4).map((doc) => (
                    <li key={doc.id} className="py-2.5">
                      <button
                        type="button"
                        onClick={() => onOpenDocDetail(doc)}
                        className="block w-full text-left"
                      >
                        <p className="font-mono text-[11px] font-semibold text-[#16A34A]">
                          {doc.courseCode} · {doc.fileFormat}
                        </p>
                        <p className="truncate text-xs font-semibold text-[#14213D] hover:underline dark:text-white">
                          {doc.title}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Popular Papers & Latest Resources */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
            <h3 className="font-display text-lg font-bold text-[#14213D] dark:text-white">
              Most Downloaded Across Campus
            </h3>
            <div className="mt-2">
              {popularDocs.map((doc) => (
                <DocumentCompactRow
                  key={doc.id}
                  doc={doc}
                  onOpenDetail={onOpenDocDetail}
                  onPreviewPdf={onPreviewPdf}
                  onDownload={onDownload}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Right Rail: Bookmarks, Latest Uploads, Announcements */}
        <div className="space-y-6 lg:col-span-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#162033]">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[#14213D] dark:text-white">
                Bookmarked Papers
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('bookmarks')}
                className="text-xs font-semibold text-[#2563EB] hover:underline"
              >
                Manage
              </button>
            </div>
            {bookmarkedDocs.length === 0 ? (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Bookmark any past paper or marking scheme to build your personal revision library.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                {bookmarkedDocs.slice(0, 4).map((doc) => (
                  <li key={doc.id} className="py-2.5">
                    <button
                      type="button"
                      onClick={() => onPreviewPdf(doc)}
                      className="block w-full text-left"
                    >
                      <p className="font-mono text-[11px] font-semibold text-[#2563EB]">
                        {doc.courseCode} · {doc.academicYear}
                      </p>
                      <p className="truncate text-xs font-semibold text-[#14213D] hover:underline dark:text-white">
                        {doc.title}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#162033]">
            <h3 className="font-display text-base font-bold text-[#14213D] dark:text-white">
              Latest Vault Additions
            </h3>
            <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
              {latestDocs.map((doc) => (
                <li key={doc.id} className="py-2.5">
                  <button
                    type="button"
                    onClick={() => onOpenDocDetail(doc)}
                    className="block w-full text-left"
                  >
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-mono font-semibold text-[#2563EB]">{doc.courseCode}</span> · {formatShortDate(doc.createdAt)}
                    </p>
                    <p className="truncate text-xs font-semibold text-[#14213D] hover:underline dark:text-white">
                      {doc.title}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#162033]">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-[#2563EB]" />
              <h3 className="font-display text-base font-bold text-[#14213D] dark:text-white">
                Institutional Announcements
              </h3>
            </div>
            <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
              {announcements.slice(0, 3).map((ann) => (
                <div key={ann.id} className="py-2.5">
                  <p className="text-[11px] font-semibold text-[#2563EB]">
                    Official Notice · {ann.category}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-[#14213D] dark:text-white">
                    {ann.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">
                    {ann.body}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
