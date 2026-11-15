import { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Download, ShieldAlert } from 'lucide-react';
import {
  AuditLogEntry,
  CatalogResponse,
  PlatformSettings,
  SupportRequest,
  UserAccount,
  UserRole,
} from '../types/vault';
import { formatShortDate } from './DocumentFormatUtils';

interface AdminPanelViewProps {
  user: UserAccount | null;
  authToken: string | null;
  catalog: CatalogResponse | null;
  onRefreshCatalog: () => Promise<void>;
  onNotify: (msg: string, tone?: 'info' | 'success' | 'warning') => void;
}

interface AdminOverviewPayload {
  users: UserAccount[];
  documentsCount: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    archived: number;
  };
  storageUsedMb: number;
  deptActivity: { department: string; name: string; documents: number; downloads: number; views: number }[];
  supportRequests: SupportRequest[];
  auditLogs: AuditLogEntry[];
  settings: PlatformSettings;
}

export function AdminPanelView({
  user,
  authToken,
  catalog,
  onRefreshCatalog,
  onNotify,
}: AdminPanelViewProps) {
  const [tab, setTab] = useState<'analytics' | 'users' | 'academics' | 'announcements' | 'settings' | 'audit'>('analytics');
  const [data, setData] = useState<AdminOverviewPayload | null>(null);
  const [userSearch, setUserSearch] = useState('');

  // Academic creation states
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDeptId, setNewCourseDeptId] = useState(catalog?.departments[0]?.id || 'dept-csc');

  // Announcement creation states
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annCategory, setAnnCategory] = useState('Examination Notice');

  // Settings form state
  const [maxUploadMb, setMaxUploadMb] = useState(25);
  const [modEnabled, setModEnabled] = useState(true);
  const [reqLecturerVerif, setReqLecturerVerif] = useState(false);
  const [allowStudentUploads, setAllowStudentUploads] = useState(true);

  const loadOverview = useCallback(async () => {
    if (!authToken) return;
    const res = await fetch('/api/admin/overview', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (res.ok) {
      const payload = (await res.json()) as AdminOverviewPayload;
      setData(payload);
      setMaxUploadMb(payload.settings.maxUploadSizeMb);
      setModEnabled(payload.settings.moderationEnabled);
      setReqLecturerVerif(payload.settings.requireLecturerVerification);
      setAllowStudentUploads(payload.settings.allowStudentUploads);
    }
  }, [authToken]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#162033]">
        <ShieldAlert className="mx-auto h-10 w-10 text-red-600" />
        <h2 className="mt-3 font-display text-xl font-bold text-[#14213D] dark:text-white">
          Administrator Role Required
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          All administrative operations are enforced server-side. Sign in with Administrator credentials to access system controls.
        </p>
      </div>
    );
  }

  const handleUpdateUser = async (targetId: string, patch: { status?: 'active' | 'suspended'; role?: UserRole }) => {
    if (!authToken) return;
    const res = await fetch(`/api/admin/users/${targetId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      onNotify('User account updated.', 'success');
      await loadOverview();
    }
  };

  const handleCreateDept = async (e: FormEvent) => {
    e.preventDefault();
    if (!authToken) return;
    const res = await fetch('/api/academic/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ code: newDeptCode, name: newDeptName }),
    });
    const out = await res.json();
    if (!res.ok) {
      onNotify(out.error || 'Failed to create department.', 'warning');
      return;
    }
    setNewDeptCode('');
    setNewDeptName('');
    onNotify('Department created.', 'success');
    await Promise.all([loadOverview(), onRefreshCatalog()]);
  };

  const handleCreateCourse = async (e: FormEvent) => {
    e.preventDefault();
    if (!authToken) return;
    const res = await fetch('/api/academic/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        code: newCourseCode,
        name: newCourseName,
        departmentId: newCourseDeptId,
      }),
    });
    const out = await res.json();
    if (!res.ok) {
      onNotify(out.error || 'Failed to create course.', 'warning');
      return;
    }
    setNewCourseCode('');
    setNewCourseName('');
    onNotify('Course created.', 'success');
    await Promise.all([loadOverview(), onRefreshCatalog()]);
  };

  const handlePublishAnnouncement = async (e: FormEvent) => {
    e.preventDefault();
    if (!authToken) return;
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ title: annTitle, body: annBody, category: annCategory }),
    });
    if (res.ok) {
      setAnnTitle('');
      setAnnBody('');
      onNotify('Official announcement published.', 'success');
      await Promise.all([loadOverview(), onRefreshCatalog()]);
    }
  };

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    if (!authToken) return;
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        maxUploadSizeMb: Number(maxUploadMb),
        moderationEnabled: modEnabled,
        requireLecturerVerification: reqLecturerVerif,
        allowStudentUploads,
      }),
    });
    if (res.ok) {
      onNotify('Platform settings updated.', 'success');
      await Promise.all([loadOverview(), onRefreshCatalog()]);
    }
  };

  const handleExportCsv = () => {
    if (!authToken) return;
    window.open(`/api/admin/export-analytics?token=${encodeURIComponent(authToken)}`, '_blank', 'noopener,noreferrer');
  };

  const filteredUsers = (data?.users || []).filter(
    (u) => !userSearch.trim() || `${u.fullName} ${u.email} ${u.role} ${u.departmentName}`.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#14213D] dark:text-white">
              Administrator Governance Console
            </h1>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Manage platform analytics, users & roles, departments & courses, announcements, and upload security policies.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-[#14213D] hover:border-[#2563EB] dark:border-slate-700 dark:text-white"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV Report</span>
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-900">
          {[
            { id: 'analytics', label: 'Analytics' },
            { id: 'users', label: 'Users & Roles' },
            { id: 'academics', label: 'Departments & Courses' },
            { id: 'announcements', label: 'Announcements & Support' },
            { id: 'settings', label: 'Platform Settings' },
            { id: 'audit', label: 'Audit Trail' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id as any)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                tab === t.id
                  ? 'bg-white text-[#14213D] shadow-sm dark:bg-[#1E293B] dark:text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {tab === 'analytics' && data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: 'Total Documents', val: data.documentsCount.total },
              { label: 'Approved', val: data.documentsCount.approved },
              { label: 'Pending Review', val: data.documentsCount.pending },
              { label: 'Rejected', val: data.documentsCount.rejected },
              { label: 'Registered Users', val: data.users.length },
              { label: 'Storage (MB)', val: data.storageUsedMb },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#162033]"
              >
                <p className="font-mono text-2xl font-bold tabular-nums text-[#14213D] dark:text-white">
                  {kpi.val}
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {kpi.label}
                </p>
              </div>
            ))}
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
            <h2 className="font-display text-lg font-bold text-[#14213D] dark:text-white">
              Downloads & Document Distribution by Department
            </h2>
            <div className="mt-4 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.deptActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.35} />
                  <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="downloads" name="Total Downloads" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="documents" name="Approved Papers" fill="#F4B400" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      )}

      {tab === 'users' && data && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-[#14213D] dark:text-white">
              Registered Users ({filteredUsers.length})
            </h2>
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search user name, email, or role..."
              className="w-full max-w-xs rounded-lg border border-slate-200 bg-[#F4F7FB] px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="py-2 pr-4 font-semibold">User</th>
                  <th className="py-2 pr-4 font-semibold">Department</th>
                  <th className="py-2 pr-4 font-semibold">Role</th>
                  <th className="py-2 pr-4 font-semibold">Status</th>
                  <th className="py-2 text-right font-semibold">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="py-2.5 pr-4">
                      <p className="font-semibold text-[#14213D] dark:text-white">{u.fullName}</p>
                      <p className="font-mono text-[11px] text-slate-500">{u.email}</p>
                    </td>
                    <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-300">{u.departmentName}</td>
                    <td className="py-2.5 pr-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateUser(u.id, { role: e.target.value as UserRole })}
                        className="rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
                      >
                        <option value="student">Student</option>
                        <option value="lecturer">Lecturer</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                    <td className="py-2.5 pr-4 font-semibold">
                      <span className={u.status === 'active' ? 'text-[#16A34A]' : 'text-red-600'}>
                        {u.status === 'active' ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateUser(u.id, {
                            status: u.status === 'active' ? 'suspended' : 'active',
                          })
                        }
                        className="rounded border border-slate-200 px-2.5 py-1 font-semibold hover:border-[#2563EB] dark:border-slate-700"
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'academics' && (
        <div className="grid gap-6 md:grid-cols-2">
          <form
            onSubmit={handleCreateDept}
            className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]"
          >
            <h2 className="font-display text-lg font-bold text-[#14213D] dark:text-white">
              Add Academic Department
            </h2>
            <div className="mt-4 space-y-3">
              <input
                type="text"
                required
                value={newDeptCode}
                onChange={(e) => setNewDeptCode(e.target.value)}
                placeholder="Department Code (e.g. LAW)"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
              />
              <input
                type="text"
                required
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                placeholder="Department Name (e.g. Commercial & Public Law)"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
              />
              <button type="submit" className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white">
                Create Department
              </button>
            </div>
          </form>

          <form
            onSubmit={handleCreateCourse}
            className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]"
          >
            <h2 className="font-display text-lg font-bold text-[#14213D] dark:text-white">
              Add Course Unit
            </h2>
            <div className="mt-4 space-y-3">
              <select
                value={newCourseDeptId}
                onChange={(e) => setNewCourseDeptId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
              >
                {(catalog?.departments || []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} — {d.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                required
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                placeholder="Course Code (e.g. CSC 415)"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
              />
              <input
                type="text"
                required
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                placeholder="Course Title (e.g. Distributed Cloud Computing)"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
              />
              <button type="submit" className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white">
                Create Course
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === 'announcements' && data && (
        <div className="grid gap-6 lg:grid-cols-2">
          <form
            onSubmit={handlePublishAnnouncement}
            className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]"
          >
            <h2 className="font-display text-lg font-bold text-[#14213D] dark:text-white">
              Publish Official Institutional Announcement
            </h2>
            <div className="mt-4 space-y-3">
              <select
                value={annCategory}
                onChange={(e) => setAnnCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
              >
                <option value="Examination Notice">Examination Notice</option>
                <option value="Revision Schedule">Revision Schedule</option>
                <option value="Academic Calendar">Academic Calendar</option>
                <option value="Department Notice">Department Notice</option>
                <option value="Platform Update">Platform Update</option>
              </select>
              <input
                type="text"
                required
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="Announcement headline"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
              />
              <textarea
                rows={4}
                required
                value={annBody}
                onChange={(e) => setAnnBody(e.target.value)}
                placeholder="Official institutional notice details..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
              />
              <button type="submit" className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white">
                Publish Announcement
              </button>
            </div>
          </form>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
            <h2 className="font-display text-lg font-bold text-[#14213D] dark:text-white">
              Support Requests Inbox ({data.supportRequests.length})
            </h2>
            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {data.supportRequests.map((req) => (
                <div key={req.id} className="py-3 text-xs">
                  <p className="font-bold text-[#14213D] dark:text-white">
                    {req.subject} · <span className="text-[#2563EB] uppercase">{req.status}</span>
                  </p>
                  <p className="mt-0.5 text-slate-600 dark:text-slate-300">{req.message}</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    From {req.senderName} ({req.senderEmail}) · {formatShortDate(req.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {tab === 'settings' && (
        <form
          onSubmit={handleSaveSettings}
          className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]"
        >
          <h2 className="font-display text-lg font-bold text-[#14213D] dark:text-white">
            Platform Upload & Moderation Policy Settings
          </h2>
          <div className="mt-4 max-w-xl space-y-4 text-xs">
            <div>
              <label className="mb-1 block font-semibold">Maximum Upload File Size (MB)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={maxUploadMb}
                onChange={(e) => setMaxUploadMb(Number(e.target.value))}
                className="w-36 rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={modEnabled}
                onChange={(e) => setModEnabled(e.target.checked)}
              />
              <span>Require Moderator approval for student document uploads</span>
            </label>
            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={reqLecturerVerif}
                onChange={(e) => setReqLecturerVerif(e.target.checked)}
              />
              <span>Require additional verification for Lecturer uploads</span>
            </label>
            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={allowStudentUploads}
                onChange={(e) => setAllowStudentUploads(e.target.checked)}
              />
              <span>Allow student contributors to submit past papers & study guides</span>
            </label>
            <button type="submit" className="rounded-lg bg-[#2563EB] px-5 py-2 font-semibold text-white">
              Save Institutional Policies
            </button>
          </div>
        </form>
      )}

      {tab === 'audit' && data && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
          <h2 className="font-display text-lg font-bold text-[#14213D] dark:text-white">
            Security & Moderation Audit Log
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="py-2 pr-4 font-semibold">Timestamp</th>
                  <th className="py-2 pr-4 font-semibold">Actor</th>
                  <th className="py-2 pr-4 font-semibold">Action</th>
                  <th className="py-2 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-2.5 pr-4 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                      {formatShortDate(log.createdAt)}
                    </td>
                    <td className="py-2.5 pr-4 font-semibold text-[#14213D] dark:text-white whitespace-nowrap">
                      {log.actorName} ({log.actorRole})
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-[#2563EB] whitespace-nowrap">{log.action}</td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-300">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
