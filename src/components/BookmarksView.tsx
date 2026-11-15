import { FormEvent, useMemo, useState } from 'react';
import { Bookmark, FolderPlus, Trash2 } from 'lucide-react';
import { BookmarkCollection, UserAccount, VaultDocument } from '../types/vault';
import { DocumentCard } from './DocumentCard';

interface BookmarksViewProps {
  user: UserAccount | null;
  documents: VaultDocument[];
  bookmarkedIds: string[];
  recentViewIds: string[];
  recentDownloadIds: string[];
  collections: BookmarkCollection[];
  onOpenAuth: (tab: 'login' | 'register') => void;
  onCreateCollection: (name: string, description: string) => Promise<void>;
  onDeleteCollection: (id: string) => Promise<void>;
  onOpenDocDetail: (doc: VaultDocument) => void;
  onPreviewPdf: (doc: VaultDocument) => void;
  onDownload: (doc: VaultDocument) => void;
  onToggleBookmark: (docId: string) => void;
}

export function BookmarksView({
  user,
  documents,
  bookmarkedIds,
  recentViewIds,
  recentDownloadIds,
  collections,
  onOpenAuth,
  onCreateCollection,
  onDeleteCollection,
  onOpenDocDetail,
  onPreviewPdf,
  onDownload,
  onToggleBookmark,
}: BookmarksViewProps) {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'collections' | 'history'>('bookmarks');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');

  const byId = useMemo(() => new Map(documents.map((d) => [d.id, d])), [documents]);
  const bookmarkedDocs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookmarkedIds
      .map((id) => byId.get(id))
      .filter((d): d is VaultDocument => Boolean(d))
      .filter((d) => !q || `${d.courseCode} ${d.title} ${d.departmentName}`.toLowerCase().includes(q));
  }, [bookmarkedIds, byId, search]);

  const activeCollection = collections.find((c) => c.id === selectedCollectionId) || collections[0];
  const collectionDocs = useMemo(() => {
    if (!activeCollection) return [];
    return activeCollection.documentIds
      .map((id) => byId.get(id))
      .filter((d): d is VaultDocument => Boolean(d));
  }, [activeCollection, byId]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    await onCreateCollection(newColName.trim(), newColDesc.trim());
    setNewColName('');
    setNewColDesc('');
  };

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#162033]">
        <Bookmark className="mx-auto h-10 w-10 text-[#F4B400]" />
        <h2 className="mt-3 font-display text-2xl font-bold text-[#14213D] dark:text-white">
          Sign in to access your Personal Exam Library
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Save past papers, build custom revision collections, and track your download history across sessions.
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

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#14213D] dark:text-white">
              Bookmarks & Personal Library
            </h1>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Organize saved past papers into custom revision collections and revisit opened documents.
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-900">
            {[
              { id: 'bookmarks', label: `Saved Papers (${bookmarkedDocs.length})` },
              { id: 'collections', label: `Collections (${collections.length})` },
              { id: 'history', label: 'Views & Downloads' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                  activeTab === t.id
                    ? 'bg-white text-[#14213D] shadow-sm dark:bg-[#1E293B] dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your saved resources..."
            className="w-full max-w-md rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-[#162033] dark:text-white"
          />
          {bookmarkedDocs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-[#162033] dark:text-slate-400">
              No saved bookmarks found. Click the Bookmark icon on any past paper or marking scheme to save it here.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {bookmarkedDocs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  isBookmarked={true}
                  onOpenDetail={onOpenDocDetail}
                  onPreviewPdf={onPreviewPdf}
                  onDownload={onDownload}
                  onToggleBookmark={onToggleBookmark}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'collections' && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <form
              onSubmit={handleCreate}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#162033]"
            >
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-[#14213D] dark:text-white">
                <FolderPlus className="h-4 w-4 text-[#2563EB]" />
                <span>New Revision Collection</span>
              </h2>
              <div className="mt-3 space-y-3">
                <input
                  type="text"
                  required
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="e.g. CAT Revision or Final Exam Prep"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  placeholder="Short description (optional)"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
                >
                  Create Collection
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {collections.map((col) => {
                const isSelected = activeCollection?.id === col.id;
                return (
                  <div
                    key={col.id}
                    className={`flex items-center justify-between rounded-xl border p-3.5 ${
                      isSelected
                        ? 'border-[#2563EB] bg-blue-50/50 dark:bg-blue-950/30'
                        : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-[#162033]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedCollectionId(col.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate text-xs font-bold text-[#14213D] dark:text-white">{col.name}</p>
                      <p className="mt-0.5 font-mono text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
                        {col.documentIds.length} documents
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCollection(col.id)}
                      aria-label={`Delete collection ${col.name}`}
                      className="rounded p-1.5 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-8">
            {activeCollection ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#162033]">
                  <h3 className="font-display text-lg font-bold text-[#14213D] dark:text-white">
                    {activeCollection.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {activeCollection.description} · Open any document’s Details view to add or remove it from this collection.
                  </p>
                </div>
                {collectionDocs.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-[#162033]">
                    This collection is empty. Open any document details modal to assign papers here.
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {collectionDocs.map((doc) => (
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
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-[#162033]">
                Create your first custom collection on the left.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
            <h2 className="font-display text-lg font-bold text-[#14213D] dark:text-white">
              Recently Opened Documents ({recentViewIds.length})
            </h2>
            <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {recentViewIds.map((id) => {
                const doc = byId.get(id);
                if (!doc) return null;
                return (
                  <li key={id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] font-semibold text-[#2563EB]">{doc.courseCode}</p>
                      <p className="truncate text-xs font-semibold text-[#14213D] dark:text-white">{doc.title}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onPreviewPdf(doc)}
                      className="rounded border border-slate-200 px-3 py-1 text-xs font-semibold text-[#14213D] dark:border-slate-700 dark:text-white shrink-0"
                    >
                      Reopen
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
            <h2 className="font-display text-lg font-bold text-[#14213D] dark:text-white">
              Download History ({recentDownloadIds.length})
            </h2>
            <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {recentDownloadIds.map((id) => {
                const doc = byId.get(id);
                if (!doc) return null;
                return (
                  <li key={id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] font-semibold text-[#16A34A]">
                        {doc.courseCode} · {doc.fileFormat}
                      </p>
                      <p className="truncate text-xs font-semibold text-[#14213D] dark:text-white">{doc.title}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDownload(doc)}
                      className="rounded bg-[#2563EB] px-3 py-1 text-xs font-semibold text-white shrink-0"
                    >
                      Download Again
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
