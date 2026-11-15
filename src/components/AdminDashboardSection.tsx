import { useEffect, useState } from 'react';
import { Check, Lock, Shield, Trash2, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CommunityPost, UserProfile } from '../types/campus';
import { SEED_RESOURCES } from '../data/seedData';

interface AdminDashboardSectionProps {
  profile: UserProfile;
  authToken: string | null;
  communityPosts: CommunityPost[];
  onModeratePost: (id: string, action: 'approved' | 'removed') => void;
  onOpenAuth: () => void;
  onNotify: (text: string, tone?: 'info' | 'success' | 'warning') => void;
}

interface ServerUserSummary {
  id: string;
  fullName: string;
  role: string;
  institution: string;
  course: string;
}

export function AdminDashboardSection({
  profile,
  authToken,
  communityPosts,
  onModeratePost,
  onOpenAuth,
  onNotify,
}: AdminDashboardSectionProps) {
  const [serverUsers, setServerUsers] = useState<ServerUserSummary[]>([]);
  const [authError, setAuthError] = useState('');
  const [userStatuses, setUserStatuses] = useState<Record<string, 'Active' | 'Suspended'>>({});

  const isAdmin = profile.role === 'admin';

  useEffect(() => {
    if (!isAdmin || !authToken) return;
    fetch('/api/admin/overview', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setAuthError(data.error || 'Admin verification required.');
        } else {
          setServerUsers(data.users || []);
          setAuthError('');
        }
      })
      .catch(() => setAuthError('Could not load admin overview.'));
  }, [isAdmin, authToken]);

  if (!isAdmin) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-[#0F172A]">
        <Lock className="mx-auto h-10 w-10 text-red-500" />
        <h1 className="mt-4 font-display text-xl font-bold text-[#101B35] dark:text-white">
          Administrator Access Required
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-300">
          Ordinary student accounts do not have permission to view platform administration or moderation tools.
          Sign in with an Administrator account to test this module.
        </p>
        <button
          type="button"
          onClick={onOpenAuth}
          className="mt-5 rounded-xl bg-[#3867F4] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2952d6]"
        >
          Sign In as Administrator
        </button>
      </section>
    );
  }

  const flaggedPosts = communityPosts.filter((p) => p.reported || p.moderationStatus === 'flagged');

  const engagementData = [
    { metric: 'Active Tasks', count: 20 },
    { metric: 'Study Plans', count: 10 },
    { metric: 'Resource Guides', count: SEED_RESOURCES.length },
    { metric: 'Community Posts', count: communityPosts.length },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A] sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-[#7856FF]" />
          <div>
            <h1 className="font-display text-xl font-bold text-[#101B35] dark:text-white">
              FocusCampus Administrator Dashboard
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Role-verified operations console for user oversight, moderation, and resource telemetry.
            </p>
          </div>
        </div>
        {authError && <p className="text-xs font-medium text-amber-600">{authError}</p>}
      </section>

      {/* Platform KPIs */}
      <section className="grid grid-cols-1 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-[#0F172A] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <p className="text-xs text-slate-500">Registered Accounts</p>
          <p className="mt-2 font-mono text-2xl font-bold text-[#3867F4] tabular-nums">
            {Math.max(2, serverUsers.length)}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs text-slate-500">Flagged Posts Queue</p>
          <p className="mt-2 font-mono text-2xl font-bold text-amber-600 tabular-nums">
            {flaggedPosts.length}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs text-slate-500">Published Guides</p>
          <p className="mt-2 font-mono text-2xl font-bold text-[#22C55E] tabular-nums">
            {SEED_RESOURCES.length}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs text-slate-500">Community Threads</p>
          <p className="mt-2 font-mono text-2xl font-bold text-[#7856FF] tabular-nums">
            {communityPosts.length}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* User Management */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Users className="h-4 w-4 text-[#3867F4]" />
            <h2 className="font-display text-base font-bold text-[#101B35] dark:text-white">
              Account Management
            </h2>
          </div>

          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {(serverUsers.length > 0
              ? serverUsers
              : [
                  {
                    id: 'usr-student-demo',
                    fullName: 'Maya Lin',
                    role: 'student',
                    institution: 'Northbridge University',
                    course: 'Computer Science',
                  },
                  {
                    id: 'usr-admin-demo',
                    fullName: 'Dr. Julian Vance',
                    role: 'admin',
                    institution: 'FocusCampus Operations',
                    course: 'Administration',
                  },
                ]
            ).map((u) => {
              const status = userStatuses[u.id] || 'Active';
              return (
                <li key={u.id} className="flex items-center justify-between gap-3 py-3 text-xs">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{u.fullName}</p>
                    <p className="text-slate-500">
                      {u.role.toUpperCase()} · {u.institution} · {status}
                    </p>
                  </div>
                  {u.role !== 'admin' && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = status === 'Active' ? 'Suspended' : 'Active';
                        setUserStatuses((prev) => ({ ...prev, [u.id]: next }));
                        onNotify(`Account status set to ${next}.`, 'info');
                      }}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 font-medium hover:bg-slate-50 dark:border-slate-700"
                    >
                      {status === 'Active' ? 'Suspend' : 'Restore'}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Platform Content Chart */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]">
          <h2 className="font-display text-base font-bold text-[#101B35] dark:text-white">
            Content &amp; Module Distribution
          </h2>
          <div className="mt-4 h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.35} />
                <XAxis dataKey="metric" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="count" fill="#7856FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Community Moderation Queue */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]">
        <h2 className="font-display text-base font-bold text-[#101B35] dark:text-white">
          Community Moderation Queue
        </h2>
        {flaggedPosts.length === 0 ? (
          <p className="py-6 text-sm text-slate-500">
            No flagged community posts awaiting moderation.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {flaggedPosts.map((post) => (
              <li key={post.id} className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{post.title}</p>
                  <p className="text-xs text-slate-500">
                    {post.authorName} · {post.category} · Reported for review
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onModeratePost(post.id, 'approved');
                      onNotify('Post approved.', 'success');
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#22C55E] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onModeratePost(post.id, 'removed');
                      onNotify('Post removed by moderator.', 'warning');
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
