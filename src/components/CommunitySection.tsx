import React, { useState } from 'react';
import { Flag, MessageSquare, Plus, Search, ThumbsUp, Users } from 'lucide-react';
import { CommunityPost, StudyGroup } from '../types/campus';

interface CommunitySectionProps {
  posts: CommunityPost[];
  studyGroups: StudyGroup[];
  onAddPost: (category: string, title: string, body: string, resourceLink?: string) => void;
  onToggleLike: (id: string) => void;
  onAddComment: (postId: string, body: string) => void;
  onReportPost: (id: string) => void;
  onToggleJoinGroup: (groupId: string) => void;
  onNotify: (text: string, tone?: 'info' | 'success' | 'warning') => void;
}

const COMMUNITY_CATEGORIES = [
  'All',
  'Mathematics',
  'Technology',
  'Business',
  'Engineering',
  'Science',
  'Research',
  'General Academic Discussions',
];

export function CommunitySection({
  posts,
  studyGroups,
  onAddPost,
  onToggleLike,
  onAddComment,
  onReportPost,
  onToggleJoinGroup,
  onNotify,
}: CommunitySectionProps) {
  const [tab, setTab] = useState<'forum' | 'groups'>('forum');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [newCategory, setNewCategory] = useState('Technology');
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;
    onAddPost(newCategory, newTitle, newBody);
    setNewTitle('');
    setNewBody('');
    onNotify('Discussion published to Student Community.', 'success');
  };

  const visiblePosts = posts
    .filter((p) => p.moderationStatus !== 'removed')
    .filter((p) => categoryFilter === 'All' || p.category === categoryFilter)
    .filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      return p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q);
    });

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A] sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-xl font-bold text-[#101B35] dark:text-white">
            Student Community &amp; Study Groups
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Ask subject questions, find accountability partners, and share study resources safely (private emails are never exposed).
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 self-start dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setTab('forum')}
            className={`rounded-md px-3.5 py-2 text-xs font-semibold ${
              tab === 'forum'
                ? 'bg-white text-[#101B35] shadow-xs dark:bg-[#0F172A] dark:text-white'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Discussion Forum ({visiblePosts.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('groups')}
            className={`rounded-md px-3.5 py-2 text-xs font-semibold ${
              tab === 'groups'
                ? 'bg-white text-[#101B35] shadow-xs dark:bg-[#0F172A] dark:text-white'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Study Groups ({studyGroups.length})
          </button>
        </div>
      </section>

      {tab === 'forum' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Post Composer */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A] lg:col-span-4 lg:self-start">
            <h2 className="font-display text-base font-bold text-[#101B35] dark:text-white">
              Start a Discussion
            </h2>
            <form onSubmit={handleCreatePost} className="mt-4 space-y-3">
              <div>
                <label htmlFor="cm-cat" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Community Category
                </label>
                <select
                  id="cm-cat"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {COMMUNITY_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="cm-title" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Question or Topic Title
                </label>
                <input
                  id="cm-title"
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Best way to revise Linear Algebra proofs?"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="cm-body" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Details
                </label>
                <textarea
                  id="cm-body"
                  rows={4}
                  required
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Share context, study tips, or questions..."
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#3867F4] py-2.5 text-sm font-semibold text-white hover:bg-[#2952d6]"
              >
                <Plus className="h-4 w-4" />
                <span>Publish Post</span>
              </button>
            </form>
          </section>

          {/* Feed */}
          <section className="space-y-4 lg:col-span-8">
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#0F172A] sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student discussions..."
                  aria-label="Search community discussions"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter community by category"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                {COMMUNITY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {visiblePosts.map((post) => (
              <article
                key={post.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-[#3867F4] dark:text-indigo-300">
                      {post.category} · {post.createdAt}
                      {post.isDemo ? ' · Sample Discussion' : ''}
                    </p>
                    <h3 className="mt-1 font-display text-base font-bold text-[#101B35] dark:text-white">
                      {post.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {post.authorName} · {post.authorMajor}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onReportPost(post.id);
                      onNotify('Post flagged for administrator moderation review.', 'warning');
                    }}
                    disabled={post.reported}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:text-red-600 disabled:opacity-50 dark:border-slate-700"
                  >
                    <Flag className="h-3 w-3" />
                    <span>{post.reported ? 'Reported' : 'Report'}</span>
                  </button>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {post.body}
                </p>

                <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => onToggleLike(post.id)}
                    className={`inline-flex items-center gap-1.5 font-semibold ${
                      post.likedByMe ? 'text-[#3867F4]' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span className="font-mono tabular-nums">{post.likes}</span>
                  </button>
                  <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span className="font-mono tabular-nums">{post.comments.length} replies</span>
                  </span>
                </div>

                {post.comments.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                    {post.comments.map((cmt) => (
                      <div key={cmt.id} className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-[#101B35]">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {cmt.authorName}{' '}
                          <span className="font-normal text-slate-500">
                            · {cmt.authorMajor} · {cmt.createdAt}
                          </span>
                        </p>
                        <p className="mt-1 text-slate-700 dark:text-slate-300">{cmt.body}</p>
                      </div>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const draft = commentDrafts[post.id] || '';
                    if (!draft.trim()) return;
                    onAddComment(post.id, draft);
                    setCommentDrafts((prev) => ({ ...prev, [post.id]: '' }));
                  }}
                  className="mt-3 flex gap-2"
                >
                  <input
                    type="text"
                    value={commentDrafts[post.id] || ''}
                    onChange={(e) =>
                      setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))
                    }
                    placeholder="Write a helpful reply..."
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-[#3867F4] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2952d6]"
                  >
                    Reply
                  </button>
                </form>
              </article>
            ))}
          </section>
        </div>
      ) : (
        /* Study Groups & Partner Discovery */
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {studyGroups.map((group) => (
            <div
              key={group.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-[#3867F4]">{group.subject}</span>
                  <span className="font-mono tabular-nums">{group.membersCount} members</span>
                </div>
                <h2 className="mt-2 font-display text-lg font-bold text-[#101B35] dark:text-white">
                  {group.name}
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {group.description}
                </p>
                <p className="mt-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                  Schedule: {group.schedule}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onToggleJoinGroup(group.id);
                  onNotify(
                    group.joined ? `Left ${group.name}.` : `Joined ${group.name}!`,
                    group.joined ? 'info' : 'success'
                  );
                }}
                className={`mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors ${
                  group.joined
                    ? 'border border-[#22C55E] bg-[#22C55E]/10 text-[#16A34A] dark:text-[#22C55E]'
                    : 'bg-[#3867F4] text-white hover:bg-[#2952d6]'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>{group.joined ? 'Joined Group (Click to Leave)' : 'Join Study Group'}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
