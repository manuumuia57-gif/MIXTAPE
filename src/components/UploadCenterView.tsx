import { DragEvent, FormEvent, useRef, useState } from 'react';
import {
  CheckCircle2,
  FileText,
  ShieldAlert,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import {
  CatalogResponse,
  DocumentCategory,
  UserAccount,
  VaultDocument,
} from '../types/vault';
import { formatBytes, formatShortDate, getStatusLabel } from './DocumentFormatUtils';

interface UploadCenterViewProps {
  user: UserAccount | null;
  authToken: string | null;
  catalog: CatalogResponse | null;
  myUploads: VaultDocument[];
  onOpenAuth: (tab: 'login' | 'register') => void;
  onUploadComplete: () => Promise<void>;
  onNotify: (msg: string, tone?: 'info' | 'success' | 'warning') => void;
}

const EXAM_TYPES = [
  'End-of-Semester Examination',
  'Mid-Semester Examination',
  'CAT Paper',
  'Supplementary Examination',
  'Special Examination',
  'Practical Examination',
  'Revision Material / Notes',
  'Marking Scheme',
];

export function UploadCenterView({
  user,
  authToken,
  catalog,
  myUploads,
  onOpenAuth,
  onUploadComplete,
  onNotify,
}: UploadCenterViewProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const courses = catalog?.courses || [];
  const departments = catalog?.departments || [];
  const categories = catalog?.categories || [];
  const academicYears = catalog?.academicYears || [];
  const semesters = catalog?.semesters || [];
  const maxMb = catalog?.settings?.maxUploadSizeMb ?? 25;

  const [selectedDeptId, setSelectedDeptId] = useState(departments[0]?.id || 'dept-csc');
  const [courseId, setCourseId] = useState(courses[0]?.id || 'crs-1');
  const [title, setTitle] = useState('');
  const [academicYear, setAcademicYear] = useState(academicYears[0] || '2025/2026');
  const [semester, setSemester] = useState(semesters[0] || 'Semester 1');
  const [examType, setExamType] = useState(EXAM_TYPES[0]);
  const [category, setCategory] = useState<DocumentCategory>('Past Examination Papers');
  const [lecturerName, setLecturerName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const deptCourses = courses.filter((c) => !selectedDeptId || c.departmentId === selectedDeptId);
  const activeCourse = courses.find((c) => c.id === courseId) || deptCourses[0];
  const activeDept = departments.find((d) => d.id === (activeCourse?.departmentId || selectedDeptId));

  const validateAndAttachFile = (candidate: File) => {
    setErrorMsg('');
    setSuccessMsg('');
    const ext = candidate.name.split('.').pop()?.toLowerCase();
    if (!ext || !['pdf', 'docx', 'pptx'].includes(ext)) {
      setErrorMsg('Unsupported file format. Only PDF, DOCX, and PPTX academic documents are allowed.');
      return;
    }
    if (candidate.size > maxMb * 1024 * 1024) {
      setErrorMsg(`File size exceeds institutional limit of ${maxMb} MB.`);
      return;
    }
    setFile(candidate);
    if (!title.trim() && activeCourse) {
      const baseName = candidate.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
      setTitle(`${activeCourse.code} ${baseName}`);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      validateAndAttachFile(e.dataTransfer.files[0]);
    }
  };

  const handleAutoSuggestMetadata = () => {
    if (!activeCourse) return;
    const yearShort = academicYear.split('/')[0];
    setTitle(`${activeCourse.code} ${examType} (${yearShort} ${semester})`);
    if (!description.trim()) {
      setDescription(
        `Academic resource for ${activeCourse.code} (${activeCourse.name}) covering ${activeCourse.description}`
      );
    }
    onNotify('Metadata fields populated from course catalog.', 'info');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!user || !authToken) {
      onOpenAuth('login');
      return;
    }
    if (!file) {
      setErrorMsg('Please select or drop a PDF, DOCX, or PPTX file to upload.');
      return;
    }
    if (!title.trim() || !courseId) {
      setErrorMsg('Document title and course unit are required.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim());
    formData.append('courseId', courseId);
    formData.append('academicYear', academicYear);
    formData.append('semester', semester);
    formData.append('examType', examType);
    formData.append('category', category);
    formData.append('lecturerName', lecturerName.trim());
    formData.append('description', description.trim());

    setUploading(true);
    setProgress(5);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/documents/upload');
    xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        setProgress(Math.round((evt.loaded / evt.total) * 95));
      }
    };

    xhr.onload = async () => {
      setUploading(false);
      setProgress(100);
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          const uploadedDoc = res.document as VaultDocument;
          setSuccessMsg(
            uploadedDoc.status === 'approved'
              ? `Published directly to library (${uploadedDoc.accessionNumber}).`
              : `Submitted to moderation queue (${uploadedDoc.accessionNumber}). A moderator will verify metadata before public listing.`
          );
          setFile(null);
          setTitle('');
          setDescription('');
          onNotify('Document uploaded and validated successfully.', 'success');
          await onUploadComplete();
        } else {
          setErrorMsg(res.error || 'Upload rejected by server security checks.');
        }
      } catch {
        setErrorMsg('Unexpected server response during upload.');
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setErrorMsg('Network error while uploading file.');
    };

    xhr.send(formData);
  };

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#162033]">
        <ShieldAlert className="mx-auto h-10 w-10 text-[#F4B400]" />
        <h2 className="mt-3 font-display text-2xl font-bold text-[#14213D] dark:text-white">
          Authorized Sign-In Required for Uploads
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 dark:text-slate-300">
          Unauthorized users cannot upload directly into the public library. Sign in as a Student, Lecturer, Moderator, or Administrator to submit resources.
        </p>
        <button
          type="button"
          onClick={() => onOpenAuth('login')}
          className="mt-5 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
        >
          Sign In to Upload
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#14213D] dark:text-white">
              Document Upload Center
            </h1>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              All uploads undergo server-side magic-byte inspection, SHA-256 duplicate detection, and size verification (max {maxMb} MB).
            </p>
          </div>
          <button
            type="button"
            onClick={handleAutoSuggestMetadata}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-[#14213D] hover:border-[#2563EB] dark:border-slate-700 dark:text-white"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#F4B400]" />
            <span>Auto-Suggest Metadata</span>
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-[#F4F7FB] px-4 py-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
          <span className="font-bold text-[#14213D] dark:text-white">Workflow Policy ({user.role.toUpperCase()}): </span>
          {user.role === 'student'
            ? 'Student submissions enter the Moderation Approval Queue and are hidden from the public library until verified by a Moderator or Administrator.'
            : user.role === 'lecturer'
            ? catalog?.settings?.requireLecturerVerification
              ? 'Institutional setting currently requires moderator verification for lecturer uploads.'
              : 'Lecturer uploads are verified and published directly with faculty provenance.'
            : 'Moderator and Administrator uploads are published directly with full audit trail logging.'}
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Drag & Drop File Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
              dragOver
                ? 'border-[#2563EB] bg-blue-50/60 dark:bg-blue-950/30'
                : 'border-slate-300 bg-[#F4F7FB] hover:border-[#2563EB] dark:border-slate-700 dark:bg-slate-900/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.pptx"
              onChange={(e) => {
                if (e.target.files?.[0]) validateAndAttachFile(e.target.files[0]);
              }}
              className="hidden"
            />
            <UploadCloud className="mx-auto h-9 w-9 text-[#2563EB]" />
            {file ? (
              <div className="mt-3">
                <p className="inline-flex items-center gap-2 text-sm font-bold text-[#14213D] dark:text-white">
                  <FileText className="h-4 w-4 text-[#16A34A]" />
                  <span>{file.name}</span>
                </p>
                <p className="mt-1 font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                  {formatBytes(file.size)} · Ready for magic-byte & SHA-256 verification
                </p>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-sm font-semibold text-[#14213D] dark:text-white">
                  Drag and drop your academic document here, or click to browse
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Supported formats: PDF (preferred), DOCX, PPTX · Maximum size {maxMb} MB
                </p>
              </div>
            )}
          </div>

          {uploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                <span>Uploading and validating file signature...</span>
                <span className="font-mono tabular-nums">{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="h-full bg-[#2563EB] transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* 12 Upload Metadata Fields */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                1. Document Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. CSC 204 End-of-Semester Examination (2025 Semester 1)"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                2. Department *
              </label>
              <select
                value={selectedDeptId}
                onChange={(e) => {
                  const nextDept = e.target.value;
                  setSelectedDeptId(nextDept);
                  const firstCourse = courses.find((c) => c.departmentId === nextDept);
                  if (firstCourse) setCourseId(firstCourse.id);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} — {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                3. Course Code & Name *
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                {deptCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                4. School / Faculty
              </label>
              <input
                type="text"
                readOnly
                value={activeDept?.facultyName || 'School of Computing and Informatics'}
                className="w-full rounded-lg border border-slate-200 bg-[#F4F7FB] px-3 py-2.5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                5. Programme
              </label>
              <input
                type="text"
                readOnly
                value={activeCourse?.programmeName || 'Undergraduate Programme'}
                className="w-full rounded-lg border border-slate-200 bg-[#F4F7FB] px-3 py-2.5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                6. Academic Year *
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                {academicYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                7. Semester *
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                {semesters.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                8. Examination Type *
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                {EXAM_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                9. Document Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                10. Course Lecturer / Author (Optional)
              </label>
              <input
                type="text"
                value={lecturerName}
                onChange={(e) => setLecturerName(e.target.value)}
                placeholder="e.g. Prof. Arthur Pendelton"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                11. Description & Topics Covered
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Summarize key topics, exam sections, or notes included in this file..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading}
              className="rounded-lg bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-60"
            >
              {uploading ? 'Validating & Uploading...' : 'Submit Academic Resource'}
            </button>
          </div>
        </form>
      </section>

      {/* Personal Upload History */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
        <h2 className="font-display text-lg font-bold text-[#14213D] dark:text-white">
          My Upload History ({myUploads.length})
        </h2>
        {myUploads.length === 0 ? (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Resources you submit will appear here with real-time moderation status.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="py-2 pr-4 font-semibold">Accession</th>
                  <th className="py-2 pr-4 font-semibold">Title</th>
                  <th className="py-2 pr-4 font-semibold">Course</th>
                  <th className="py-2 pr-4 font-semibold">Status</th>
                  <th className="py-2 font-semibold">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {myUploads.map((u) => {
                  const st = getStatusLabel(u.status);
                  return (
                    <tr key={u.id}>
                      <td className="py-2.5 pr-4 font-mono text-slate-500">{u.accessionNumber}</td>
                      <td className="py-2.5 pr-4 font-semibold text-[#14213D] dark:text-white">
                        {u.title}
                        {u.rejectionReason && (
                          <p className="mt-0.5 text-[11px] font-normal text-red-600 dark:text-red-400">
                            Reviewer note: {u.rejectionReason}
                          </p>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-[#2563EB]">{u.courseCode}</td>
                      <td className={`py-2.5 pr-4 font-semibold ${st.colorClass}`}>{st.label}</td>
                      <td className="py-2.5 tabular-nums text-slate-500">{formatShortDate(u.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
