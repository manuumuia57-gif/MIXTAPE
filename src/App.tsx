import { useCallback, useEffect, useState } from 'react';
import { Bell, LogOut, Menu, Moon, Sun, UserCheck, X } from 'lucide-react';
import { useVaultStore } from './hooks/useVaultStore';
import { ExamPrepPlan, ToastMessage, VaultDocument, VaultSection } from './types/vault';
import { LandingPage } from './components/LandingPage';
import { VaultSidebar } from './components/VaultSidebar';
import { VaultAuthModal } from './components/VaultAuthModal';
import { DocumentDetailModal } from './components/DocumentDetailModal';
import { PdfViewerModal } from './components/PdfViewerModal';
import { DashboardView } from './components/DashboardView';
import { LibraryFilters, LibraryView } from './components/LibraryView';
import { CoursesView } from './components/CoursesView';
import { MarkingSchemesView } from './components/MarkingSchemesView';
import { UploadCenterView } from './components/UploadCenterView';
import { BookmarksView } from './components/BookmarksView';
import { ExamPrepView } from './components/ExamPrepView';
import { ContributorView } from './components/ContributorView';
import { ModerationView } from './components/ModerationView';
import { AdminPanelView } from './components/AdminPanelView';
import { SupportView } from './components/SupportView';

const SECTION_TITLES: Record<VaultSection, string> = {
  home: 'Homepage',
  dashboard: 'Personalized Dashboard',
  library: 'Past Papers & Resource Library',
  courses: 'Courses & Departments',
  'marking-schemes': 'Marking Schemes & Solutions',
  upload: 'Document Upload Center',
  bookmarks: 'Bookmarks & Personal Library',
  'exam-prep': 'Examination Preparation Center',
  contributor: 'Contributor Profile',
  moderation: 'Moderation & Approval Queue',
  admin: 'Administrator Console',
  support: 'Announcements & Support Center',
};

const INITIAL_FILTERS: LibraryFilters = {
  q: '',
  institutionId: '',
  campusId: '',
  facultyId: '',
  departmentId: '',
  programmeId: '',
  courseId: '',
  academicYear: '',
  semester: '',
  category: '',
  fileFormat: '',
  sort: 'newest',
};

export default function App() {
  const store = useVaultStore();

  const [activeSection, setActiveSection] = useState<VaultSection>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  const [filters, setFilters] = useState<LibraryFilters>(INITIAL_FILTERS);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const [detailDoc, setDetailDoc] = useState<VaultDocument | null>(null);
  const [pdfViewerDoc, setPdfViewerDoc] = useState<VaultDocument | null>(null);
  const [pendingModCount, setPendingModCount] = useState<number>(2);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const notify = useCallback((text: string, tone: 'info' | 'success' | 'warning' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-2), { id, text, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  // Load pending count for moderators/admins/lecturers
  useEffect(() => {
    if (!store.authToken || !store.user || !['lecturer', 'moderator', 'admin'].includes(store.user.role)) {
      setPendingModCount(0);
      return;
    }
    fetch('/api/documents?status=pending', {
      headers: { Authorization: `Bearer ${store.authToken}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && Array.isArray(d.documents)) setPendingModCount(d.documents.length);
      })
      .catch(() => {});
  }, [store.authToken, store.user, store.documents]);

  const navigateToSection = (
    section: VaultSection,
    preset?: { q?: string; departmentId?: string; academicYear?: string; category?: string; courseId?: string }
  ) => {
    if (preset) {
      if (section === 'courses' && preset.courseId) {
        setSelectedCourseId(preset.courseId);
      } else {
        setFilters({
          ...INITIAL_FILTERS,
          q: preset.q || '',
          departmentId: preset.departmentId || '',
          academicYear: preset.academicYear || '',
          category: preset.category || '',
          courseId: preset.courseId || '',
        });
        if (preset.q) store.recordSearchTerm(preset.q);
      }
    }
    setActiveSection(section);
    setNotifOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDocDetail = async (doc: VaultDocument) => {
    setDetailDoc(doc);
    const updated = await store.recordDocumentView(doc.id);
    if (updated) setDetailDoc(updated);
  };

  const handlePreviewPdf = async (doc: VaultDocument) => {
    setPdfViewerDoc(doc);
    await store.recordDocumentView(doc.id);
  };

  const handleToggleBookmark = async (docId: string) => {
    const result = await store.toggleBookmark(docId);
    if (!result.ok) {
      notify(result.error || 'Sign in required.', 'warning');
      setAuthTab('login');
      setAuthModalOpen(true);
      return;
    }
    notify(result.bookmarked ? 'Saved to your Bookmarks.' : 'Removed from Bookmarks.', 'success');
  };

  const handleToggleCollectionItem = async (collectionId: string, docId: string) => {
    const res = await store.apiFetch(`/api/collections/${collectionId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: docId }),
    });
    if (res.ok) {
      const data = await res.json();
      store.setCollections((prev) => prev.map((c) => (c.id === collectionId ? data.collection : c)));
      notify('Updated collection items.', 'success');
    }
  };

  const handleSubmitReport = async (doc: VaultDocument, reportType: string, details: string) => {
    if (!store.authToken) {
      notify('Please sign in to report an issue.', 'warning');
      setAuthModalOpen(true);
      return;
    }
    const res = await store.apiFetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: doc.id, reportType, details }),
    });
    if (res.ok) {
      notify('Report submitted to Academic Moderators.', 'success');
    } else {
      const d = await res.json();
      notify(d.error || 'Unable to submit report.', 'warning');
    }
  };

  const handleCreateCollection = async (name: string, description: string) => {
    const res = await store.apiFetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    if (res.ok) {
      const data = await res.json();
      store.setCollections((prev) => [data.collection, ...prev]);
      notify(`Created collection "${name}".`, 'success');
    }
  };

  const handleDeleteCollection = async (id: string) => {
    const res = await store.apiFetch(`/api/collections/${id}`, { method: 'DELETE' });
    if (res.ok) {
      store.setCollections((prev) => prev.filter((c) => c.id !== id));
      notify('Collection deleted.', 'info');
    }
  };

  const handleCreateExamPlan = async (payload: {
    courseCode: string;
    courseName: string;
    examTitle: string;
    examDate: string;
    venue: string;
    checklist: string[];
  }) => {
    const res = await store.apiFetch('/api/exam-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      store.setExamPlans((prev) => [data.plan, ...prev]);
      notify(`Added revision plan for ${payload.courseCode}.`, 'success');
    }
  };

  const handleToggleChecklistItem = async (plan: ExamPrepPlan, itemId: string) => {
    const nextChecklist = plan.checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    const res = await store.apiFetch(`/api/exam-plans/${plan.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checklist: nextChecklist }),
    });
    if (res.ok) {
      const data = await res.json();
      store.setExamPlans((prev) => prev.map((p) => (p.id === plan.id ? data.plan : p)));
    }
  };

  const handleAddChecklistItem = async (plan: ExamPrepPlan, label: string) => {
    const nextChecklist = [
      ...plan.checklist,
      { id: `chk-${Date.now()}`, label, completed: false },
    ];
    const res = await store.apiFetch(`/api/exam-plans/${plan.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checklist: nextChecklist }),
    });
    if (res.ok) {
      const data = await res.json();
      store.setExamPlans((prev) => prev.map((p) => (p.id === plan.id ? data.plan : p)));
    }
  };

  const handleDeleteExamPlan = async (planId: string) => {
    const res = await store.apiFetch(`/api/exam-plans/${planId}`, { method: 'DELETE' });
    if (res.ok) {
      store.setExamPlans((prev) => prev.filter((p) => p.id !== planId));
      notify('Revision plan removed.', 'info');
    }
  };

  const handleSubmitSupport = async (payload: {
    senderName: string;
    senderEmail: string;
    requestType: string;
    subject: string;
    message: string;
  }) => {
    const res = await store.apiFetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      store.setMySupportRequests((prev) => [data.ticket, ...prev]);
      notify('Support request submitted.', 'success');
      return true;
    }
    const err = await res.json();
    notify(err.error || 'Failed to submit support request.', 'warning');
    return false;
  };

  const unreadNotifs = store.notifications.filter((n) => !n.read).length;
  const relatedForDetail = detailDoc
    ? store.documents
        .filter((d) => d.id !== detailDoc.id && (d.courseId === detailDoc.courseId || d.departmentId === detailDoc.departmentId))
        .slice(0, 4)
    : [];

  return (
    <>
      {activeSection === 'home' ? (
        <LandingPage
          theme={store.theme}
          onToggleTheme={store.toggleTheme}
          user={store.user}
          catalog={store.catalog}
          documents={store.documents}
          bookmarkedIds={store.bookmarkedIds}
          onNavigateSection={navigateToSection}
          onOpenAuth={(tab) => {
            setAuthTab(tab);
            setAuthModalOpen(true);
          }}
          onOpenDocDetail={handleOpenDocDetail}
          onPreviewPdf={handlePreviewPdf}
          onDownload={store.triggerDownload}
          onToggleBookmark={handleToggleBookmark}
        />
      ) : (
        <div className="flex min-h-screen bg-[#F4F7FB] text-[#14213D] dark:bg-[#101827] dark:text-slate-100">
          <VaultSidebar
            activeSection={activeSection}
            userRole={store.user?.role || null}
            pendingModerationCount={pendingModCount}
            mobileOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
            onSelectSection={(sec) => navigateToSection(sec)}
            onGoHome={() => setActiveSection('home')}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            {/* Workspace Header */}
            <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-[#162033]/95 sm:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open navigation menu"
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 lg:hidden"
                >
                  <Menu className="h-4.5 w-4.5" />
                </button>
                <div className="flex min-w-0 items-center gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => setActiveSection('home')}
                    className="hidden font-medium text-slate-500 hover:text-[#2563EB] sm:inline whitespace-nowrap"
                  >
                    Campus Exam Vault
                  </button>
                  <span className="hidden text-slate-300 dark:text-slate-600 sm:inline" aria-hidden="true">
                    /
                  </span>
                  <span className="truncate font-display font-bold text-[#14213D] dark:text-white">
                    {SECTION_TITLES[activeSection]}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={store.toggleTheme}
                  aria-label={store.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {store.theme === 'dark' ? <Sun className="h-4 w-4 text-[#F4B400]" /> : <Moon className="h-4 w-4" />}
                </button>

                {store.user && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setNotifOpen((o) => !o)}
                      aria-label="Notifications"
                      className="relative rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <Bell className="h-4 w-4" />
                      {unreadNotifs > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2563EB] px-1 font-mono text-[10px] font-bold text-white tabular-nums">
                          {unreadNotifs}
                        </span>
                      )}
                    </button>

                    {notifOpen && (
                      <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-[#162033]">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                          <h3 className="font-display text-sm font-bold text-[#14213D] dark:text-white">
                            Notifications ({unreadNotifs} unread)
                          </h3>
                          <button
                            type="button"
                            onClick={store.markAllNotificationsRead}
                            className="text-xs font-semibold text-[#2563EB] hover:underline"
                          >
                            Mark all read
                          </button>
                        </div>
                        <div className="mt-2 max-h-72 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
                          {store.notifications.length === 0 ? (
                            <p className="py-4 text-center text-xs text-slate-500">No notifications yet.</p>
                          ) : (
                            store.notifications.map((n) => (
                              <div key={n.id} className={`py-2.5 ${n.read ? 'opacity-65' : ''}`}>
                                <p className="text-[11px] font-semibold text-[#2563EB]">{n.category}</p>
                                <p className="text-xs font-semibold text-[#14213D] dark:text-white">{n.title}</p>
                                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{n.message}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {store.user ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab('login');
                        setAuthModalOpen(true);
                      }}
                      className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#14213D] hover:border-[#2563EB] dark:border-slate-700 dark:text-white sm:inline-flex whitespace-nowrap"
                    >
                      <UserCheck className="h-3.5 w-3.5 text-[#2563EB]" />
                      <span>{store.user.fullName.split(' ')[0]} ({store.user.role})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        store.logout();
                        notify('Signed out.', 'info');
                      }}
                      aria-label="Sign out"
                      className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('login');
                      setAuthModalOpen(true);
                    }}
                    className="rounded-lg bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8] whitespace-nowrap"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </header>

            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-8 sm:py-8">
              {activeSection === 'dashboard' && (
                <DashboardView
                  user={store.user}
                  documents={store.documents}
                  bookmarkedIds={store.bookmarkedIds}
                  recentViewIds={store.recentViewIds}
                  recentDownloadIds={store.recentDownloadIds}
                  myUploads={store.myUploads}
                  announcements={store.catalog?.announcements || []}
                  onNavigate={navigateToSection}
                  onOpenAuth={(tab) => {
                    setAuthTab(tab);
                    setAuthModalOpen(true);
                  }}
                  onOpenDocDetail={handleOpenDocDetail}
                  onPreviewPdf={handlePreviewPdf}
                  onDownload={store.triggerDownload}
                />
              )}

              {activeSection === 'library' && (
                <LibraryView
                  catalog={store.catalog}
                  documents={store.documents}
                  bookmarkedIds={store.bookmarkedIds}
                  recentSearches={store.recentSearches}
                  filters={filters}
                  onChangeFilters={setFilters}
                  onRecordSearch={store.recordSearchTerm}
                  onClearRecentSearches={store.clearRecentSearches}
                  onOpenDocDetail={handleOpenDocDetail}
                  onPreviewPdf={handlePreviewPdf}
                  onDownload={store.triggerDownload}
                  onToggleBookmark={handleToggleBookmark}
                />
              )}

              {activeSection === 'courses' && (
                <CoursesView
                  catalog={store.catalog}
                  documents={store.documents}
                  bookmarkedIds={store.bookmarkedIds}
                  selectedCourseId={selectedCourseId}
                  onSelectCourse={setSelectedCourseId}
                  onOpenDocDetail={handleOpenDocDetail}
                  onPreviewPdf={handlePreviewPdf}
                  onDownload={store.triggerDownload}
                  onToggleBookmark={handleToggleBookmark}
                />
              )}

              {activeSection === 'marking-schemes' && (
                <MarkingSchemesView
                  documents={store.documents}
                  bookmarkedIds={store.bookmarkedIds}
                  onOpenDocDetail={handleOpenDocDetail}
                  onPreviewPdf={handlePreviewPdf}
                  onDownload={store.triggerDownload}
                  onToggleBookmark={handleToggleBookmark}
                />
              )}

              {activeSection === 'upload' && (
                <UploadCenterView
                  user={store.user}
                  authToken={store.authToken}
                  catalog={store.catalog}
                  myUploads={store.myUploads}
                  onOpenAuth={(tab) => {
                    setAuthTab(tab);
                    setAuthModalOpen(true);
                  }}
                  onUploadComplete={async () => {
                    await Promise.all([store.refreshCatalogAndDocs(), store.refreshUserActivity()]);
                  }}
                  onNotify={notify}
                />
              )}

              {activeSection === 'bookmarks' && (
                <BookmarksView
                  user={store.user}
                  documents={store.documents}
                  bookmarkedIds={store.bookmarkedIds}
                  recentViewIds={store.recentViewIds}
                  recentDownloadIds={store.recentDownloadIds}
                  collections={store.collections}
                  onOpenAuth={(tab) => {
                    setAuthTab(tab);
                    setAuthModalOpen(true);
                  }}
                  onCreateCollection={handleCreateCollection}
                  onDeleteCollection={handleDeleteCollection}
                  onOpenDocDetail={handleOpenDocDetail}
                  onPreviewPdf={handlePreviewPdf}
                  onDownload={store.triggerDownload}
                  onToggleBookmark={handleToggleBookmark}
                />
              )}

              {activeSection === 'exam-prep' && (
                <ExamPrepView
                  user={store.user}
                  courses={store.catalog?.courses || []}
                  documents={store.documents}
                  examPlans={store.examPlans}
                  onOpenAuth={(tab) => {
                    setAuthTab(tab);
                    setAuthModalOpen(true);
                  }}
                  onCreatePlan={handleCreateExamPlan}
                  onToggleChecklistItem={handleToggleChecklistItem}
                  onAddChecklistItem={handleAddChecklistItem}
                  onDeletePlan={handleDeleteExamPlan}
                  onPreviewPdf={handlePreviewPdf}
                />
              )}

              {activeSection === 'contributor' && (
                <ContributorView
                  user={store.user}
                  myUploads={store.myUploads}
                  onOpenAuth={(tab) => {
                    setAuthTab(tab);
                    setAuthModalOpen(true);
                  }}
                  onNavigate={navigateToSection}
                />
              )}

              {activeSection === 'moderation' && (
                <ModerationView
                  user={store.user}
                  authToken={store.authToken}
                  onPreviewPdf={handlePreviewPdf}
                  onModerationChanged={async () => {
                    await Promise.all([store.refreshCatalogAndDocs(), store.refreshUserActivity()]);
                  }}
                  onNotify={notify}
                />
              )}

              {activeSection === 'admin' && (
                <AdminPanelView
                  user={store.user}
                  authToken={store.authToken}
                  catalog={store.catalog}
                  onRefreshCatalog={store.refreshCatalogAndDocs}
                  onNotify={notify}
                />
              )}

              {activeSection === 'support' && (
                <SupportView
                  user={store.user}
                  announcements={store.catalog?.announcements || []}
                  mySupportRequests={store.mySupportRequests}
                  onSubmitSupport={handleSubmitSupport}
                />
              )}
            </main>

            <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-[#162033] sm:px-8">
              <span>Campus Exam Vault</span>
              <span className="mx-2" aria-hidden="true">·</span>
              <span>Every Past Paper. Every Resource. Better Exam Preparation.</span>
            </footer>
          </div>
        </div>
      )}

      {/* Document Info Modal */}
      <DocumentDetailModal
        document={detailDoc}
        relatedDocuments={relatedForDetail}
        isBookmarked={detailDoc ? store.bookmarkedIds.includes(detailDoc.id) : false}
        collections={store.collections}
        isSignedIn={Boolean(store.user)}
        onClose={() => setDetailDoc(null)}
        onPreviewPdf={(doc) => {
          setDetailDoc(null);
          handlePreviewPdf(doc);
        }}
        onDownload={store.triggerDownload}
        onToggleBookmark={handleToggleBookmark}
        onToggleCollectionItem={handleToggleCollectionItem}
        onSelectRelated={(rel) => handleOpenDocDetail(rel)}
        onSubmitReport={handleSubmitReport}
        onNotify={notify}
      />

      {/* Integrated PDF Reader Modal */}
      <PdfViewerModal
        document={pdfViewerDoc}
        authToken={store.authToken}
        isBookmarked={pdfViewerDoc ? store.bookmarkedIds.includes(pdfViewerDoc.id) : false}
        onClose={() => setPdfViewerDoc(null)}
        onDownload={store.triggerDownload}
        onToggleBookmark={handleToggleBookmark}
      />

      {/* Authentication Modal */}
      <VaultAuthModal
        open={authModalOpen}
        initialTab={authTab}
        departments={store.catalog?.departments || []}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(signedUser, token) => {
          store.setAuthSession(token, signedUser);
          if (signedUser.role === 'admin') setActiveSection('admin');
          else if (signedUser.role === 'moderator') setActiveSection('moderation');
          else setActiveSection('dashboard');
          notify(`Signed in as ${signedUser.fullName} (${signedUser.role}).`, 'success');
        }}
      />

      {/* Toast Feedback */}
      {toasts.length > 0 && (
        <div aria-live="polite" className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-[#14213D] px-4 py-3 text-xs font-medium text-white shadow-xl"
            >
              <span>{toast.text}</span>
              <button
                type="button"
                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))}
                aria-label="Dismiss notification"
                className="text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
