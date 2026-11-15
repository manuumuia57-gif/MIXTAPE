import { useCallback, useEffect, useState } from 'react';
import { Check, Edit3, Eye, ShieldCheck, XCircle } from 'lucide-react';
import { DocumentReport, UserAccount, VaultDocument, VerificationLevel } from '../types/vault';
import { formatBytes, formatShortDate, getStatusLabel } from './DocumentFormatUtils';

interface ModerationViewProps {
  user: UserAccount | null;
  authToken: string | null;
  onPreviewPdf: (doc: VaultDocument) => void;
  onModerationChanged: () => Promise<void>;
  onNotify: (msg: string, tone?: 'info' | 'success' | 'warning') => void;
}

export function ModerationView({
  user,
  authToken,
  onPreviewPdf,
  onModerationChanged,
  onNotify,
}: ModerationViewProps) {
  const [queueDocs, setQueueDocs] = useState<VaultDocument[]>([]);
  const [reports, setReports] = useState<DocumentReport[]>([]);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'rejected' | 'approved'>('pending');
  const [editingDoc, setEditingDoc] = useState<VaultDocument | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editVerif, setEditVerif] = useState<VerificationLevel>('lecturer_verified');
  const [rejectReasonById, setRejectReasonById] = useState<Record<string, string>>({});

  const loadQueue = useCallback(async () => {
    if (!authToken) return;
    const [docsRes, repRes] = await Promise.all([
      fetch(`/api/documents?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      }),
      fetch('/api/reports', {
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    ]);
    if (docsRes.ok) {
      const data = await docsRes.json();
      setQueueDocs(data.documents || []);
    }
    if (repRes.ok) {
      const rData = await repRes.json();
      setReports(rData.reports || []);
    }
  }, [authToken, statusFilter]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  if (!user || !['lecturer', 'moderator', 'admin'].includes(user.role)) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#162033]">
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
          Access Restricted: Lecturer, Moderator, or Administrator credentials required.
        </p>
      </div>
    );
  }

  const handleModerate = async (docId: string, action: 'approve' | 'reject' | 'archive') => {
    if (!authToken) return;
    const reason = rejectReasonById[docId] || '';
    const res = await fetch(`/api/documents/${docId}/moderate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ action, reason }),
    });
    const data = await res.json();
    if (!res.ok) {
      onNotify(data.error || 'Moderation update failed.', 'warning');
      return;
    }
    onNotify(`Document ${action === 'approve' ? 'approved and published' : action === 'reject' ? 'rejected with note' : 'archived'}.`, 'success');
    await loadQueue();
    await onModerationChanged();
  };

  const handleSaveMetadata = async () => {
    if (!editingDoc || !authToken) return;
    const res = await fetch(`/api/documents/${editingDoc.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title: editTitle,
        academicYear: editYear,
        verificationLevel: editVerif,
      }),
    });
    if (res.ok) {
      onNotify('Document metadata updated.', 'success');
      setEditingDoc(null);
      await loadQueue();
      await onModerationChanged();
    }
  };

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    if (!authToken) return;
    const res = await fetch(`/api/reports/${reportId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      onNotify(`Report marked ${status}.`, 'success');
      await loadQueue();
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-[#14213D] dark:text-white">
              <ShieldCheck className="h-6 w-6 text-[#2563EB]" />
              <span>Upload Approval & Moderation Queue</span>
            </h1>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Preview pending files, verify academic metadata, approve quality uploads, or request corrections with audit logging.
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-900">
            {(['pending', 'approved', 'rejected'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize ${
                  statusFilter === st
                    ? 'bg-white text-[#14213D] shadow-sm dark:bg-[#1E293B] dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Edit Metadata Inline Panel */}
      {editingDoc && (
        <section className="rounded-2xl border border-[#2563EB] bg-white p-5 dark:bg-[#162033]">
          <h2 className="text-sm font-bold text-[#14213D] dark:text-white">
            Edit Metadata: {editingDoc.accessionNumber}
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs sm:col-span-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <input
              type="text"
              value={editYear}
              onChange={(e) => setEditYear(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <select
              value={editVerif}
              onChange={(e) => setEditVerif(e.target.value as VerificationLevel)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs sm:col-span-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="official_marking_scheme">Official Marking Scheme</option>
              <option value="lecturer_verified">Lecturer-Verified Resource</option>
              <option value="student_revision_notes">Student-Created Revision Material</option>
              <option value="unverified_community">Unverified Community Solution</option>
            </select>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveMetadata}
                className="flex-1 rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white"
              >
                Save Metadata
              </button>
              <button
                type="button"
                onClick={() => setEditingDoc(null)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold dark:border-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Documents List */}
      <div className="space-y-4">
        {queueDocs.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-[#162033]">
            No documents currently in the "{statusFilter}" queue.
          </div>
        ) : (
          queueDocs.slice(0, 20).map((doc) => {
            const st = getStatusLabel(doc.status);
            return (
              <article
                key={doc.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#162033]"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono font-bold text-[#2563EB]">{doc.courseCode}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{doc.accessionNumber}</span>
                      <span aria-hidden="true">·</span>
                      <span className={`font-semibold ${st.colorClass}`}>{st.label}</span>
                      <span aria-hidden="true">·</span>
                      <span>Uploaded by {doc.uploadedByName} ({doc.uploadedByRole})</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{formatBytes(doc.fileSizeBytes)}</span>
                    </div>
                    <h2 className="mt-1 font-display text-lg font-bold text-[#14213D] dark:text-white">
                      {doc.title}
                    </h2>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      {doc.departmentName} · {doc.academicYear} · {doc.semester} · {doc.category}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onPreviewPdf(doc)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#14213D] hover:border-[#2563EB] dark:border-slate-700 dark:text-white"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Preview</span>
                    </button>

                    {(user.role === 'moderator' || user.role === 'admin') && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDoc(doc);
                          setEditTitle(doc.title);
                          setEditYear(doc.academicYear);
                          setEditVerif(doc.verificationLevel);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-[#2563EB] dark:border-slate-700 dark:text-slate-200"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                    )}

                    {doc.status !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleModerate(doc.id, 'approve')}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#16A34A] px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {doc.status !== 'rejected' && (
                      <button
                        type="button"
                        onClick={() => handleModerate(doc.id, 'reject')}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>
                </div>

                {doc.status !== 'rejected' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={rejectReasonById[doc.id] || ''}
                      onChange={(e) =>
                        setRejectReasonById((prev) => ({ ...prev, [doc.id]: e.target.value }))
                      }
                      placeholder="Optional rejection / correction note for contributor..."
                      className="w-full rounded-lg border border-slate-200 bg-[#F4F7FB] px-3 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    />
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Reported Document Issues */}
      {(user.role === 'moderator' || user.role === 'admin') && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
          <h2 className="font-display text-lg font-bold text-[#14213D] dark:text-white">
            Flagged Documents & Metadata Reports ({reports.length})
          </h2>
          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {reports.map((rep) => (
              <div key={rep.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs">
                <div>
                  <p className="font-semibold text-[#14213D] dark:text-white">
                    {rep.courseCode || 'General'} · {rep.documentTitle || 'Archive Report'} ·{' '}
                    <span className="uppercase text-[#2563EB]">{rep.status}</span>
                  </p>
                  <p className="mt-0.5 text-slate-600 dark:text-slate-300">{rep.details}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Reported by {rep.reporterName} on {formatShortDate(rep.createdAt)}
                  </p>
                </div>
                {rep.status === 'open' && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleResolveReport(rep.id, 'resolved')}
                      className="rounded-lg bg-[#16A34A] px-3 py-1.5 font-semibold text-white"
                    >
                      Mark Resolved
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolveReport(rep.id, 'dismissed')}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold dark:border-slate-700"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
