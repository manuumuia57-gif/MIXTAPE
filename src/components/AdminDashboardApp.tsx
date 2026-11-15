import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Moon,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sun,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  AdminMenuSection,
  AdminUser,
  ContactMessage,
  Course,
  Department,
  DocumentType,
  LibraryDocument,
  LibraryOverview,
} from '../types/vault';
import { formatBytes, formatShortDate } from './DocumentFormatUtils';
import { VaultBrandLogo } from './VaultBrandLogo';

interface AdminDashboardAppProps {
  overview: LibraryOverview;
  admin: AdminUser;
  token: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onRefreshOverview: () => Promise<void>;
  onUpdateAdmin: (admin: AdminUser) => void;
  onPreviewDoc: (doc: LibraryDocument) => void;
  onDownloadDoc: (doc: LibraryDocument) => void;
  onExitToPublic: () => void;
  onLogout: () => void;
  onToast: (text: string, tone?: 'info' | 'success' | 'warning') => void;
}

interface ConfirmDeleteState {
  type: 'document' | 'course' | 'department' | 'year';
  id: string;
  title: string;
  detail: string;
}

export function AdminDashboardApp({
  overview,
  admin,
  token,
  theme,
  onToggleTheme,
  onRefreshOverview,
  onUpdateAdmin,
  onPreviewDoc,
  onDownloadDoc,
  onExitToPublic,
  onLogout,
  onToast,
}: AdminDashboardAppProps) {
  const [section, setSection] = useState<AdminMenuSection>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Contact messages
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Upload form state
  const [upTitle, setUpTitle] = useState('');
  const [upDeptId, setUpDeptId] = useState(overview.departments[0]?.id || '');
  const [upCourseMode, setUpCourseMode] = useState<'existing' | 'custom'>('existing');
  const [upCourseId, setUpCourseId] = useState(overview.courses[0]?.id || '');
  const [upCustomCode, setUpCustomCode] = useState('');
  const [upCustomName, setUpCustomName] = useState('');
  const [upYear, setUpYear] = useState(overview.academicYears[0] || '2025/2026');
  const [upSemester, setUpSemester] = useState(overview.semesters[0] || 'Semester 1');
  const [upDocType, setUpDocType] = useState<DocumentType>(overview.documentTypes[0]);
  const [upDesc, setUpDesc] = useState('');
  const [upFile, setUpFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Manage Past Papers & Uploads state
  const [docSearch, setDocSearch] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('');
  const [editingDoc, setEditingDoc] = useState<LibraryDocument | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCourseId, setEditCourseId] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editSemester, setEditSemester] = useState('');
  const [editDocType, setEditDocType] = useState<DocumentType>('Past Examination Papers');
  const [editDesc, setEditDesc] = useState('');
  const [savingDocEdit, setSavingDocEdit] = useState(false);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const [replacingDocId, setReplacingDocId] = useState<string | null>(null);

  // Courses CRUD state
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDeptId, setNewCourseDeptId] = useState(overview.departments[0]?.id || '');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Departments CRUD state
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  // Academic Years CRUD state
  const [newYearLabel, setNewYearLabel] = useState('');

  // Website Settings state
  const [siteName, setSiteName] = useState(overview.settings.siteName);
  const [institutionName, setInstitutionName] = useState(overview.settings.institutionName);
  const [contactEmail, setContactEmail] = useState(overview.settings.contactEmail);
  const [contactPhone, setContactPhone] = useState(overview.settings.contactPhone);
  const [aboutText, setAboutText] = useState(overview.settings.aboutText);
  const [copyrightText, setCopyrightText] = useState(overview.settings.copyrightText);
  const [savingSettings, setSavingSettings] = useState(false);

  // Admin Credentials state
  const [credDisplayName, setCredDisplayName] = useState(admin.displayName);
  const [credUsername, setCredUsername] = useState(admin.username);
  const [credEmail, setCredEmail] = useState(admin.email);
  const [credCurrentPassword, setCredCurrentPassword] = useState('');
  const [credNewPassword, setCredNewPassword] = useState('');
  const [savingCreds, setSavingCreds] = useState(false);
  const [credError, setCredError] = useState('');

  // Shared delete confirmation modal
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteState | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setSiteName(overview.settings.siteName);
    setInstitutionName(overview.settings.institutionName);
    setContactEmail(overview.settings.contactEmail);
    setContactPhone(overview.settings.contactPhone);
    setAboutText(overview.settings.aboutText);
    setCopyrightText(overview.settings.copyrightText);
  }, [overview.settings]);

  const deptCoursesForUpload = useMemo(
    () => overview.courses.filter((c) => !upDeptId || c.departmentId === upDeptId),
    [overview.courses, upDeptId]
  );

  useEffect(() => {
    if (deptCoursesForUpload.length > 0 && !deptCoursesForUpload.some((c) => c.id === upCourseId)) {
      setUpCourseId(deptCoursesForUpload[0].id);
    }
  }, [deptCoursesForUpload, upCourseId]);

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await fetch('/api/admin/messages', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (section === 'dashboard' || section === 'settings') {
      fetchMessages();
    }
  }, [section]);

  const filteredDocs = useMemo(() => {
    const q = docSearch.trim().toLowerCase();
    return overview.documents.filter((d) => {
      if (docTypeFilter && d.documentType !== docTypeFilter) return false;
      if (!q) return true;
      return `${d.title} ${d.courseCode} ${d.courseName} ${d.departmentName} ${d.academicYear} ${d.documentType} ${d.originalFilename}`
        .toLowerCase()
        .includes(q);
    });
  }, [overview.documents, docSearch, docTypeFilter]);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // --- Upload Handler using XMLHttpRequest for real upload progress ---
  const handleFileSelect = (file: File | undefined) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['pdf', 'docx', 'pptx'].includes(ext)) {
      setUploadError('Only PDF, DOCX, and PPTX documents are supported.');
      return;
    }
    setUploadError('');
    setUploadSuccess('');
    setUpFile(file);
    if (!upTitle.trim()) {
      setUpTitle(file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '));
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files?.[0]);
  };

  const handleUploadSubmit = (e: FormEvent) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');

    if (!upFile) {
      setUploadError('Please select or drag a PDF, DOCX, or PPTX file first.');
      return;
    }
    if (!upTitle.trim()) {
      setUploadError('Document title is required.');
      return;
    }
    if (upCourseMode === 'custom' && (!upCustomCode.trim() || !upCustomName.trim())) {
      setUploadError('Enter both a Course Code and Course Name, or choose an existing course.');
      return;
    }

    const formData = new FormData();
    formData.append('file', upFile);
    formData.append('title', upTitle.trim());
    formData.append('departmentId', upDeptId);
    if (upCourseMode === 'existing') {
      formData.append('courseId', upCourseId);
    } else {
      formData.append('courseCode', upCustomCode.trim().toUpperCase());
      formData.append('courseName', upCustomName.trim());
    }
    formData.append('academicYear', upYear);
    formData.append('semester', upSemester);
    formData.append('documentType', upDocType);
    formData.append('description', upDesc.trim());

    setUploading(true);
    setUploadProgress(5);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/upload');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    };

    xhr.onload = async () => {
      setUploading(false);
      try {
        const res = JSON.parse(xhr.responseText || '{}');
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadProgress(100);
          setUploadSuccess(`"${res.document?.title || upTitle}" is now live on the student website.`);
          setUpTitle('');
          setUpDesc('');
          setUpCustomCode('');
          setUpCustomName('');
          setUpFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          await onRefreshOverview();
          onToast('New material uploaded and published.', 'success');
        } else {
          setUploadError(res.error || 'Upload failed.');
        }
      } catch {
        setUploadError('Unexpected response during upload.');
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setUploadError('Network error while uploading file.');
    };

    xhr.send(formData);
  };

  // --- Document Edit & File Replace ---
  const openEditModal = (doc: LibraryDocument) => {
    setEditingDoc(doc);
    setEditTitle(doc.title);
    setEditCourseId(doc.courseId);
    setEditYear(doc.academicYear);
    setEditSemester(doc.semester);
    setEditDocType(doc.documentType);
    setEditDesc(doc.description);
  };

  const handleSaveDocEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;
    setSavingDocEdit(true);
    try {
      const res = await fetch(`/api/admin/documents/${editingDoc.id}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({
          title: editTitle,
          courseId: editCourseId,
          academicYear: editYear,
          semester: editSemester,
          documentType: editDocType,
          description: editDesc,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onToast(data.error || 'Could not update document.', 'warning');
      } else {
        setEditingDoc(null);
        await onRefreshOverview();
        onToast('Document details updated.', 'success');
      }
    } finally {
      setSavingDocEdit(false);
    }
  };

  const triggerReplaceFile = (docId: string) => {
    setReplacingDocId(docId);
    replaceInputRef.current?.click();
  };

  const handleReplaceFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetId = replacingDocId;
    e.target.value = '';
    setReplacingDocId(null);
    if (!file || !targetId) return;

    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`/api/admin/documents/${targetId}/replace`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      onToast(data.error || 'Could not replace file.', 'warning');
      return;
    }
    await onRefreshOverview();
    onToast('Uploaded file replaced successfully.', 'success');
  };

  // --- Courses CRUD ---
  const handleSaveCourse = async (e: FormEvent) => {
    e.preventDefault();
    const url = editingCourse ? `/api/admin/courses/${editingCourse.id}` : '/api/admin/courses';
    const method = editingCourse ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: authHeaders,
      body: JSON.stringify({
        code: newCourseCode,
        name: newCourseName,
        departmentId: newCourseDeptId,
        description: newCourseDesc,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      onToast(data.error || 'Failed to save course.', 'warning');
      return;
    }
    setEditingCourse(null);
    setNewCourseCode('');
    setNewCourseName('');
    setNewCourseDesc('');
    await onRefreshOverview();
    onToast(editingCourse ? 'Course updated.' : 'Course added.', 'success');
  };

  const startEditCourse = (c: Course) => {
    setEditingCourse(c);
    setNewCourseCode(c.code);
    setNewCourseName(c.name);
    setNewCourseDeptId(c.departmentId);
    setNewCourseDesc(c.description);
  };

  // --- Departments CRUD ---
  const handleSaveDepartment = async (e: FormEvent) => {
    e.preventDefault();
    const url = editingDept ? `/api/admin/departments/${editingDept.id}` : '/api/admin/departments';
    const method = editingDept ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: authHeaders,
      body: JSON.stringify({
        code: newDeptCode,
        name: newDeptName,
        description: newDeptDesc,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      onToast(data.error || 'Failed to save department.', 'warning');
      return;
    }
    setEditingDept(null);
    setNewDeptCode('');
    setNewDeptName('');
    setNewDeptDesc('');
    await onRefreshOverview();
    onToast(editingDept ? 'Department updated.' : 'Department added.', 'success');
  };

  const startEditDepartment = (d: Department) => {
    setEditingDept(d);
    setNewDeptCode(d.code);
    setNewDeptName(d.name);
    setNewDeptDesc(d.description);
  };

  // --- Academic Years CRUD ---
  const handleAddYear = async (e: FormEvent) => {
    e.preventDefault();
    if (!newYearLabel.trim()) return;
    const res = await fetch('/api/admin/academic-years', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ label: newYearLabel.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      onToast(data.error || 'Could not add academic year.', 'warning');
      return;
    }
    setNewYearLabel('');
    await onRefreshOverview();
    onToast('Academic year added.', 'success');
  };

  // --- Confirm Delete Execution ---
  const executeConfirmedDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      let url = '';
      if (confirmDelete.type === 'document') url = `/api/admin/documents/${confirmDelete.id}`;
      if (confirmDelete.type === 'course') url = `/api/admin/courses/${confirmDelete.id}`;
      if (confirmDelete.type === 'department') url = `/api/admin/departments/${confirmDelete.id}`;
      if (confirmDelete.type === 'year') {
        url = `/api/admin/academic-years/${encodeURIComponent(confirmDelete.id)}`;
      }
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        onToast(d.error || 'Delete failed.', 'warning');
      } else {
        await onRefreshOverview();
        onToast(`${confirmDelete.title} deleted.`, 'info');
      }
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  // --- Website Settings & Admin Credentials ---
  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({
          siteName,
          institutionName,
          contactEmail,
          contactPhone,
          aboutText,
          copyrightText,
        }),
      });
      if (!res.ok) {
        onToast('Could not update website settings.', 'warning');
      } else {
        await onRefreshOverview();
        onToast('Website settings saved.', 'success');
      }
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveCredentials = async (e: FormEvent) => {
    e.preventDefault();
    setCredError('');
    setSavingCreds(true);
    try {
      const res = await fetch('/api/admin/credentials', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          displayName: credDisplayName,
          username: credUsername,
          email: credEmail,
          currentPassword: credCurrentPassword,
          newPassword: credNewPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCredError(data.error || 'Could not update credentials.');
      } else {
        onUpdateAdmin(data.admin);
        setCredCurrentPassword('');
        setCredNewPassword('');
        onToast('Administrator login credentials updated.', 'success');
      }
    } finally {
      setSavingCreds(false);
    }
  };

  const menuItems: { id: AdminMenuSection; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload New Material', icon: Upload },
    { id: 'manage-papers', label: 'Manage Past Papers', icon: FileText },
    { id: 'manage-courses', label: 'Manage Courses', icon: BookOpen },
    { id: 'manage-departments', label: 'Manage Departments', icon: Building2 },
    { id: 'manage-years', label: 'Manage Academic Years', icon: Calendar },
    { id: 'manage-uploads', label: 'Manage Uploads', icon: FolderOpen },
    { id: 'settings', label: 'Website Settings', icon: Settings },
  ];

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-800">
          <VaultBrandLogo siteName={overview.settings.siteName} />
          <p className="mt-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Administrator Control Panel
          </p>
        </div>

        <nav className="space-y-1 p-3" aria-label="Admin Navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSection(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-[#2563EB] text-white'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <div className="mb-2 px-2">
          <p className="truncate text-xs font-semibold text-[#14213D] dark:text-white">
            {admin.displayName}
          </p>
          <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
            {admin.email}
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F4F7FB] text-[#14213D] dark:bg-[#101827] dark:text-slate-100">
      {/* Hidden input for replacing any existing document file */}
      <input
        ref={replaceInputRef}
        type="file"
        accept=".pdf,.docx,.pptx"
        onChange={handleReplaceFileChange}
        className="hidden"
      />

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[#162033] lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">{renderSidebarContent()}</div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-[#101827]/70"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-68 max-w-[85vw] bg-white shadow-2xl dark:bg-[#162033]">
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Admin Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-[#162033]/95 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open admin menu"
              className="rounded-lg border border-slate-200 p-2 text-slate-600 dark:border-slate-700 dark:text-slate-300 lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <h1 className="font-display text-lg font-bold text-[#14213D] dark:text-white">
              {menuItems.find((m) => m.id === section)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Toggle light or dark mode"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <button
              type="button"
              onClick={() => setSection('upload')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1D4ED8] whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Upload Material</span>
            </button>
            <button
              type="button"
              onClick={onExitToPublic}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#14213D] hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800 whitespace-nowrap"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Student Site</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* 1. DASHBOARD */}
          {section === 'dashboard' && (
            <div className="mx-auto max-w-6xl space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  { label: 'Total Past Papers', value: overview.stats.totalPapers },
                  { label: 'Total Study Materials', value: overview.stats.totalStudyMaterials },
                  { label: 'Total Courses', value: overview.stats.totalCourses },
                  { label: 'Total Departments', value: overview.stats.totalDepartments },
                  { label: 'Total Downloads', value: overview.stats.totalDownloads },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#162033]"
                  >
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {kpi.label}
                    </p>
                    <p className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-[#14213D] dark:text-white">
                      {kpi.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-12">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#162033] lg:col-span-7">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <h2 className="font-display text-base font-bold text-[#14213D] dark:text-white">
                      Recent Documents
                    </h2>
                    <button
                      type="button"
                      onClick={() => setSection('manage-papers')}
                      className="text-xs font-semibold text-[#2563EB] hover:underline"
                    >
                      Manage all
                    </button>
                  </div>
                  <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                    {overview.documents.slice(0, 6).map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#14213D] dark:text-white">
                            {doc.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-mono font-semibold text-[#2563EB]">{doc.courseCode}</span>
                            <span className="mx-1.5">·</span>
                            <span>{doc.documentType}</span>
                            <span className="mx-1.5">·</span>
                            <span className="tabular-nums">{doc.academicYear}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => onPreviewDoc(doc)}
                            aria-label={`View ${doc.title}`}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:border-[#2563EB] hover:text-[#2563EB] dark:border-slate-700 dark:text-slate-300"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(doc)}
                            aria-label={`Edit ${doc.title}`}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:border-[#2563EB] hover:text-[#2563EB] dark:border-slate-700 dark:text-slate-300"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#162033] lg:col-span-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#2563EB]" />
                      <h2 className="font-display text-base font-bold text-[#14213D] dark:text-white">
                        Student Contact Messages
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={fetchMessages}
                      className="text-xs font-semibold text-[#2563EB] hover:underline"
                    >
                      Refresh
                    </button>
                  </div>
                  <div className="mt-3 space-y-3">
                    {loadingMessages ? (
                      <p className="text-xs text-slate-500">Loading messages...</p>
                    ) : messages.length === 0 ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        No contact messages received yet. Student submissions from the Contact page appear here.
                      </p>
                    ) : (
                      messages.slice(0, 5).map((msg) => (
                        <div
                          key={msg.id}
                          className="rounded-xl border border-slate-200 bg-[#F4F7FB] p-3 text-xs dark:border-slate-800 dark:bg-slate-900/60"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-[#14213D] dark:text-white">
                              {msg.subject}
                            </p>
                            <span className="text-[11px] text-slate-500 tabular-nums">
                              {formatShortDate(msg.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1 text-slate-600 dark:text-slate-300">{msg.message}</p>
                          <p className="mt-1.5 text-[11px] text-slate-500">
                            From {msg.senderName} ({msg.senderEmail})
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* 2. UPLOAD NEW MATERIAL */}
          {section === 'upload' && (
            <div className="mx-auto max-w-3xl">
              <form
                onSubmit={handleUploadSubmit}
                className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]"
              >
                <div>
                  <h2 className="font-display text-xl font-bold text-[#14213D] dark:text-white">
                    Upload Past Paper or Study Material
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Uploaded files appear immediately on the public student website. Supported formats: PDF, DOCX, PPTX (max 30 MB).
                  </p>
                </div>

                {uploadSuccess && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{uploadSuccess}</span>
                  </div>
                )}

                {uploadError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                    {uploadError}
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold">Document Title *</label>
                  <input
                    type="text"
                    required
                    value={upTitle}
                    onChange={(e) => setUpTitle(e.target.value)}
                    placeholder="e.g. CSC 204 Data Structures End of Semester Examination"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold">Department *</label>
                    <select
                      value={upDeptId}
                      onChange={(e) => setUpDeptId(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      {overview.departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.code} — {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold">Document Type *</label>
                    <select
                      value={upDocType}
                      onChange={(e) => setUpDocType(e.target.value as DocumentType)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      {overview.documentTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Course Selection or Quick Custom Course */}
                <div className="rounded-xl border border-slate-200 bg-[#F4F7FB] p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold">Course Selection *</span>
                    <div className="flex gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setUpCourseMode('existing')}
                        className={`rounded-md px-2.5 py-1 font-semibold ${
                          upCourseMode === 'existing'
                            ? 'bg-[#2563EB] text-white'
                            : 'bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        Existing Course
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpCourseMode('custom')}
                        className={`rounded-md px-2.5 py-1 font-semibold ${
                          upCourseMode === 'custom'
                            ? 'bg-[#2563EB] text-white'
                            : 'bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        New Course Code & Name
                      </button>
                    </div>
                  </div>

                  {upCourseMode === 'existing' ? (
                    <select
                      value={upCourseId}
                      onChange={(e) => setUpCourseId(e.target.value)}
                      className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      {deptCoursesForUpload.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} — {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <input
                        type="text"
                        value={upCustomCode}
                        onChange={(e) => setUpCustomCode(e.target.value)}
                        placeholder="Course Code (e.g. CSC 315)"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm uppercase dark:border-slate-700 dark:bg-slate-900"
                      />
                      <input
                        type="text"
                        value={upCustomName}
                        onChange={(e) => setUpCustomName(e.target.value)}
                        placeholder="Course Name (e.g. Compiler Construction)"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm sm:col-span-2 dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold">Academic Year *</label>
                    <select
                      value={upYear}
                      onChange={(e) => setUpYear(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      {overview.academicYears.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold">Semester *</label>
                    <select
                      value={upSemester}
                      onChange={(e) => setUpSemester(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      {overview.semesters.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold">Short Description</label>
                  <textarea
                    rows={3}
                    value={upDesc}
                    onChange={(e) => setUpDesc(e.target.value)}
                    placeholder="Optional notes for students (e.g. Section A multiple choice and Section B essay questions)..."
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm focus:border-[#2563EB] focus:outline-none dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>

                {/* Drag-and-drop Upload Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                    dragActive
                      ? 'border-[#2563EB] bg-blue-50/70 dark:bg-blue-950/20'
                      : 'border-slate-300 bg-[#F4F7FB] dark:border-slate-700 dark:bg-slate-900/50'
                  }`}
                >
                  <Upload className="mx-auto h-8 w-8 text-[#2563EB]" />
                  {upFile ? (
                    <div className="mt-2">
                      <p className="text-sm font-semibold text-[#14213D] dark:text-white">
                        {upFile.name}
                      </p>
                      <p className="font-mono text-xs text-slate-500 tabular-nums">
                        {formatBytes(upFile.size)}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="text-sm font-semibold text-[#14213D] dark:text-white">
                        Drag and drop your PDF, DOCX, or PPTX file here
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Works directly from phone storage or computer files
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.pptx"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-[#14213D] hover:border-[#2563EB] dark:border-slate-700 dark:bg-[#162033] dark:text-white"
                  >
                    Browse Files
                  </button>
                </div>

                {uploading && (
                  <div>
                    <div className="mb-1 flex justify-between text-xs font-medium">
                      <span>Uploading document...</span>
                      <span className="font-mono tabular-nums">{uploadProgress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full bg-[#2563EB] transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-60"
                  >
                    <Upload className="h-4 w-4" />
                    <span>{uploading ? 'Uploading...' : 'Upload & Publish Material'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 3. MANAGE PAST PAPERS & 7. MANAGE UPLOADS */}
          {(section === 'manage-papers' || section === 'manage-uploads') && (
            <div className="mx-auto max-w-6xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#162033]">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    placeholder="Search documents by title, course code, year, or filename..."
                    className="w-full rounded-lg border border-slate-200 bg-[#F4F7FB] py-2 pl-9 pr-3 text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <select
                  value={docTypeFilter}
                  onChange={(e) => setDocTypeFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="">All Categories</option>
                  {overview.documentTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#162033]">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-[#F4F7FB] text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Document</th>
                      <th className="px-4 py-3 font-semibold">Course</th>
                      <th className="px-4 py-3 font-semibold">Year & Semester</th>
                      <th className="px-4 py-3 font-semibold">Category</th>
                      <th className="px-4 py-3 font-semibold">File</th>
                      <th className="px-4 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#14213D] dark:text-white">{doc.title}</p>
                          {section === 'manage-uploads' && (
                            <p className="font-mono text-[11px] text-slate-500">{doc.originalFilename}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono font-semibold text-[#2563EB]">{doc.courseCode}</span>
                          <p className="text-[11px] text-slate-500">{doc.courseName}</p>
                        </td>
                        <td className="px-4 py-3 font-mono tabular-nums">
                          {doc.academicYear} · {doc.semester}
                        </td>
                        <td className="px-4 py-3">{doc.documentType}</td>
                        <td className="px-4 py-3 font-mono tabular-nums text-slate-600 dark:text-slate-300">
                          {doc.fileFormat} · {formatBytes(doc.fileSizeBytes)} · {doc.downloadsCount} dl
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onPreviewDoc(doc)}
                              title="View"
                              className="rounded-lg border border-slate-200 p-1.5 hover:border-[#2563EB] hover:text-[#2563EB] dark:border-slate-700"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDownloadDoc(doc)}
                              title="Download"
                              className="rounded-lg border border-slate-200 p-1.5 hover:border-[#2563EB] hover:text-[#2563EB] dark:border-slate-700"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(doc)}
                              title="Edit details"
                              className="rounded-lg border border-slate-200 p-1.5 hover:border-[#2563EB] hover:text-[#2563EB] dark:border-slate-700"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => triggerReplaceFile(doc.id)}
                              title="Replace uploaded file"
                              className="rounded-lg border border-slate-200 p-1.5 hover:border-[#2563EB] hover:text-[#2563EB] dark:border-slate-700"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmDelete({
                                  type: 'document',
                                  id: doc.id,
                                  title: doc.title,
                                  detail: 'This permanently removes the document and its file from the student library.',
                                })
                              }
                              title="Delete document"
                              className="rounded-lg border border-slate-200 p-1.5 text-red-600 hover:border-red-500 hover:bg-red-50 dark:border-slate-700 dark:text-red-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. MANAGE COURSES */}
          {section === 'manage-courses' && (
            <div className="mx-auto max-w-5xl space-y-6">
              <form
                onSubmit={handleSaveCourse}
                className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#162033]"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold">
                    {editingCourse ? `Edit Course: ${editingCourse.code}` : 'Add New Course'}
                  </h2>
                  {editingCourse && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCourse(null);
                        setNewCourseCode('');
                        setNewCourseName('');
                        setNewCourseDesc('');
                      }}
                      className="text-xs font-semibold text-slate-500 hover:underline"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    type="text"
                    required
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    placeholder="Course Code (e.g. CSC 301)"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs uppercase dark:border-slate-700 dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    required
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    placeholder="Course Name"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                  <select
                    value={newCourseDeptId}
                    onChange={(e) => setNewCourseDeptId(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                  >
                    {overview.departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} — {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    value={newCourseDesc}
                    onChange={(e) => setNewCourseDesc(e.target.value)}
                    placeholder="Short course description (optional)"
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-[#2563EB] px-5 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
                  >
                    {editingCourse ? 'Save Course Changes' : 'Add Course'}
                  </button>
                </div>
              </form>

              <div className="grid gap-4 md:grid-cols-2">
                {overview.courses.map((course) => {
                  const docCount = overview.documents.filter((d) => d.courseId === course.id).length;
                  return (
                    <div
                      key={course.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#162033]"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-bold text-[#2563EB]">
                          {course.code} · {course.departmentCode}
                        </p>
                        <h3 className="mt-0.5 text-sm font-bold text-[#14213D] dark:text-white">
                          {course.name}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">{course.departmentName}</p>
                        <p className="mt-1 font-mono text-[11px] tabular-nums text-slate-500">
                          {docCount} uploaded files
                        </p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditCourse(course)}
                          className="rounded-lg border border-slate-200 p-1.5 hover:border-[#2563EB] dark:border-slate-700"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmDelete({
                              type: 'course',
                              id: course.id,
                              title: `${course.code} — ${course.name}`,
                              detail: `Deleting this course will also remove its ${docCount} associated document(s).`,
                            })
                          }
                          className="rounded-lg border border-slate-200 p-1.5 text-red-600 hover:border-red-500 dark:border-slate-700 dark:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. MANAGE DEPARTMENTS */}
          {section === 'manage-departments' && (
            <div className="mx-auto max-w-4xl space-y-6">
              <form
                onSubmit={handleSaveDepartment}
                className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#162033]"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold">
                    {editingDept ? `Edit Department: ${editingDept.code}` : 'Add New Department'}
                  </h2>
                  {editingDept && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDept(null);
                        setNewDeptCode('');
                        setNewDeptName('');
                        setNewDeptDesc('');
                      }}
                      className="text-xs font-semibold text-slate-500 hover:underline"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    type="text"
                    required
                    value={newDeptCode}
                    onChange={(e) => setNewDeptCode(e.target.value)}
                    placeholder="Dept Code (e.g. LAW)"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs uppercase dark:border-slate-700 dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    required
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    placeholder="Department Name"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs sm:col-span-2 dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    value={newDeptDesc}
                    onChange={(e) => setNewDeptDesc(e.target.value)}
                    placeholder="Department overview (optional)"
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-[#2563EB] px-5 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
                  >
                    {editingDept ? 'Save Department' : 'Add Department'}
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                {overview.departments.map((dept) => {
                  const courseCount = overview.courses.filter((c) => c.departmentId === dept.id).length;
                  const docCount = overview.documents.filter((d) => d.departmentId === dept.id).length;
                  return (
                    <div
                      key={dept.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#162033]"
                    >
                      <div>
                        <p className="font-mono text-xs font-bold text-[#2563EB]">{dept.code}</p>
                        <h3 className="text-sm font-bold text-[#14213D] dark:text-white">{dept.name}</h3>
                        <p className="mt-0.5 text-xs text-slate-500">{dept.description}</p>
                        <p className="mt-1 font-mono text-[11px] tabular-nums text-slate-500">
                          {courseCount} courses · {docCount} documents
                        </p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditDepartment(dept)}
                          className="rounded-lg border border-slate-200 p-1.5 hover:border-[#2563EB] dark:border-slate-700"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmDelete({
                              type: 'department',
                              id: dept.id,
                              title: `${dept.code} — ${dept.name}`,
                              detail: `Deleting this department removes its ${courseCount} course(s) and ${docCount} document(s).`,
                            })
                          }
                          className="rounded-lg border border-slate-200 p-1.5 text-red-600 hover:border-red-500 dark:border-slate-700 dark:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. MANAGE ACADEMIC YEARS */}
          {section === 'manage-years' && (
            <div className="mx-auto max-w-2xl space-y-6">
              <form
                onSubmit={handleAddYear}
                className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#162033]"
              >
                <input
                  type="text"
                  required
                  value={newYearLabel}
                  onChange={(e) => setNewYearLabel(e.target.value)}
                  placeholder="Add academic year (e.g. 2026/2027)"
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-[#2563EB] px-5 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
                >
                  Add Year
                </button>
              </form>

              <div className="space-y-2.5">
                {overview.academicYears.map((yr) => {
                  const count = overview.documents.filter((d) => d.academicYear === yr).length;
                  return (
                    <div
                      key={yr}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-[#162033]"
                    >
                      <div>
                        <p className="font-mono text-sm font-bold tabular-nums">{yr}</p>
                        <p className="font-mono text-xs tabular-nums text-slate-500">{count} documents</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmDelete({
                            type: 'year',
                            id: yr,
                            title: `Academic Year ${yr}`,
                            detail: 'Removes this academic year from dropdown selectors.',
                          })
                        }
                        className="rounded-lg border border-slate-200 p-1.5 text-red-600 hover:border-red-500 dark:border-slate-700 dark:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 8. WEBSITE SETTINGS & CREDENTIALS */}
          {section === 'settings' && (
            <div className="mx-auto max-w-4xl space-y-6">
              <form
                onSubmit={handleSaveSettings}
                className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]"
              >
                <h2 className="font-display text-lg font-bold">Website Information & Contact Details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold">Website Name</label>
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold">Institution Name</label>
                    <input
                      type="text"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold">Contact Email</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold">Contact Phone</label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold">About Page Description</label>
                  <textarea
                    rows={3}
                    value={aboutText}
                    onChange={(e) => setAboutText(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold">Footer Copyright Notice</label>
                  <input
                    type="text"
                    value={copyrightText}
                    onChange={(e) => setCopyrightText(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-60"
                >
                  {savingSettings ? 'Saving...' : 'Save Website Settings'}
                </button>
              </form>

              <form
                onSubmit={handleSaveCredentials}
                className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]"
              >
                <h2 className="font-display text-lg font-bold">Change Administrator Credentials</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Only you can access the Admin Panel. Enter your current password to update login details.
                </p>
                {credError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {credError}
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold">Display Name</label>
                    <input
                      type="text"
                      value={credDisplayName}
                      onChange={(e) => setCredDisplayName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold">Username</label>
                    <input
                      type="text"
                      value={credUsername}
                      onChange={(e) => setCredUsername(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold">Email</label>
                    <input
                      type="email"
                      value={credEmail}
                      onChange={(e) => setCredEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold">Current Password *</label>
                    <input
                      type="password"
                      required
                      value={credCurrentPassword}
                      onChange={(e) => setCredCurrentPassword(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold">New Password (min 8 chars, optional)</label>
                    <input
                      type="password"
                      value={credNewPassword}
                      onChange={(e) => setCredNewPassword(e.target.value)}
                      placeholder="Leave blank to keep current password"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={savingCreds}
                  className="rounded-lg bg-[#14213D] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#1e325c] dark:bg-[#2563EB] disabled:opacity-60"
                >
                  {savingCreds ? 'Updating...' : 'Update Admin Login'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Edit Document Modal */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101827]/75 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSaveDocEdit}
            className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#162033]"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <h3 className="font-display text-lg font-bold">Edit Document Details</h3>
              <button type="button" onClick={() => setEditingDoc(null)} className="p-1 text-slate-500">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold">Document Title</label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold">Course</label>
                <select
                  value={editCourseId}
                  onChange={(e) => setEditCourseId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                >
                  {overview.courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Category</label>
                <select
                  value={editDocType}
                  onChange={(e) => setEditDocType(e.target.value as DocumentType)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                >
                  {overview.documentTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Academic Year</label>
                <select
                  value={editYear}
                  onChange={(e) => setEditYear(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                >
                  {overview.academicYears.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Semester</label>
                <select
                  value={editSemester}
                  onChange={(e) => setEditSemester(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                >
                  {overview.semesters.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold">Description</label>
              <textarea
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingDoc(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingDocEdit}
                className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white"
              >
                {savingDocEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#101827]/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#162033]">
            <h3 className="font-display text-lg font-bold text-[#14213D] dark:text-white">
              Confirm Deletion
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete <span className="font-semibold">{confirmDelete.title}</span>?
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{confirmDelete.detail}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={executeConfirmedDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
