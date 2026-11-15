import { useState } from 'react';
import { Bookmark, BookOpen, Search, X } from 'lucide-react';
import { LIBRARY_BANNER_IMAGE, SEED_RESOURCES } from '../data/seedData';
import { ResourceArticle } from '../types/campus';

interface ResourcesSectionProps {
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
}

const RESOURCE_CATEGORIES = [
  'All',
  'Study Techniques',
  'Time Management',
  'Note-Taking Methods',
  'Examination Preparation',
  'Research Skills',
  'Academic Writing',
  'Memory Improvement',
  'Concentration Techniques',
  'Stress Management',
  'Career Development',
  'Digital Learning Tools',
];

export function ResourcesSection({
  bookmarkedIds,
  onToggleBookmark,
}: ResourcesSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [tab, setTab] = useState<'all' | 'featured' | 'popular' | 'bookmarked'>('all');
  const [readingArticle, setReadingArticle] = useState<ResourceArticle | null>(null);
  const [bannerError, setBannerError] = useState(false);

  const filtered = SEED_RESOURCES.filter((art) => {
    if (tab === 'featured' && !art.featured) return false;
    if (tab === 'bookmarked' && !bookmarkedIds.includes(art.id)) return false;
    if (category !== 'All' && art.category !== category) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return (
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q)
      );
    }
    return true;
  }).sort((a, b) => (tab === 'popular' ? b.popularScore - a.popularScore : 0));

  return (
    <div className="space-y-6">
      {/* Editorial Header Banner */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="p-6 sm:p-8 lg:col-span-7">
            <p className="text-xs font-semibold text-[#3867F4]">Student Resource Library</p>
            <h1 className="mt-2 font-display text-2xl font-bold text-[#101B35] dark:text-white">
              Evidence-Based Guides for Better Concentration &amp; Academic Craft
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              12 complete study guides across active recall, time-blocking, note systems, exam prep, research synthesis, and wellness.
            </p>
          </div>
          <div className="relative h-48 bg-slate-100 dark:bg-slate-900 lg:col-span-5 lg:h-auto">
            {!bannerError ? (
              <img
                src={LIBRARY_BANNER_IMAGE}
                alt="Study textbooks and notebook on an oak desk"
                referrerPolicy="no-referrer"
                onError={() => setBannerError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <BookOpen className="h-10 w-10 text-slate-400" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              {(
                [
                  ['all', 'All Guides (12)'],
                  ['featured', 'Featured'],
                  ['popular', 'Most Popular'],
                  ['bookmarked', `Bookmarked (${bookmarkedIds.length})`],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    tab === id
                      ? 'bg-white text-[#101B35] shadow-xs dark:bg-[#0F172A] dark:text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  aria-label="Search resource library"
                  className="w-56 rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Filter by resource category"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                {RESOURCE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No guides match your filter.</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((article) => {
              const bookmarked = bookmarkedIds.includes(article.id);
              return (
                <article
                  key={article.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-[#101B35]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-[#3867F4] dark:text-indigo-300">
                        {article.category} · {article.readMinutes} min read
                      </p>
                      <button
                        type="button"
                        onClick={() => onToggleBookmark(article.id)}
                        aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark article'}
                        className="text-slate-400 hover:text-[#3867F4]"
                      >
                        <Bookmark
                          className={`h-4 w-4 ${bookmarked ? 'fill-[#3867F4] text-[#3867F4]' : ''}`}
                        />
                      </button>
                    </div>
                    <h2 className="mt-2 font-display text-base font-bold text-[#101B35] dark:text-white">
                      {article.title}
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {article.summary}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-200/70 pt-3 text-xs dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">{article.author}</span>
                    <button
                      type="button"
                      onClick={() => setReadingArticle(article)}
                      className="font-semibold text-[#3867F4] hover:underline"
                    >
                      Read Guide
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Reader Modal */}
      {readingArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#0F172A] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#3867F4]">
                  {readingArticle.category} · {readingArticle.readMinutes} min read · {readingArticle.publishedAt}
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-[#101B35] dark:text-white">
                  {readingArticle.title}
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  By {readingArticle.author}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReadingArticle(null)}
                aria-label="Close guide reader"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {readingArticle.content.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
