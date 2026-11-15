import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Loader2, Lock, Menu, Moon, RefreshCw, Sun, X } from 'lucide-react';
import {
  AdminUser,
  LibraryDocument,
  LibraryOverview,
  PublicPage,
  ToastMessage,
} from './types/vault';
import { VaultBrandLogo } from './components/VaultBrandLogo';
import { PublicHomePage } from './components/PublicHomePage';
import { BrowseFilters, PublicBrowsePage } from './components/PublicBrowsePage';
import { PdfViewerModal } from './components/PdfViewerModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboardApp } from './components/AdminDashboardApp';
import { OfflineIndicator, PWAInstallButton } from './components/PWAInstallButton';

const ADMIN_TOKEN_KEY = 'dekut_admin_token';
const THEME_KEY = 'dekut_theme';

const EMPTY_FILTERS: BrowseFilters = {
  q: '',
  school: '',
  departmentId: '',
  courseId: '',
  academicYear: '',
  semester: '',
  documentType: '',
  examinationType: '',
};

export function App() {
  const [overview, setOverview] = useState<LibraryOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [publicPage, setPublicPage] = useState<PublicPage>('home');
  const [browseFilters, setBrowseFilters] = useState<BrowseFilters>(EMPTY_FILTERS);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [previewDoc, setPreviewDoc] = useState<LibraryDocument | null>(null);

  const [adminToken, setAdminToken] = useState<string | null>(() =>
    localStorage.getItem(ADMIN_TOKEN_KEY)
  );
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [inAdminMode, setInAdminMode] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'dark' ? 'dark' : 'light';
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback((text: string, tone: ToastMessage['tone'] = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-2), { id, text, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const fetchOverview = useCallback(async () => {
    setLoadError(null);
    if (!overview) {
      setLoading(true);
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch('/api/library/overview', {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok) {
        let message = `Unable to load library catalog (HTTP ${res.status}).`;
        if (contentType.includes('application/json')) {
          const errBody = await res.json().catch(() => null);
          if (errBody?.error) message = errBody.error;
        }
        throw new Error(message);
      }

      if (!contentType.includes('application/json')) {
        throw new Error('The library server returned an unexpected response instead of catalog data.');
      }

      const data = (await res.json()) as LibraryOverview;
      if (!data || !Array.isArray(data.documents) || !data.settings) {
        throw new Error('Library catalog response was incomplete.');
      }

      setOverview(data);
      setLoadError(null);
    } catch (err) {
      const isAbort = err instanceof DOMException && err.name === 'AbortError';
      const msg = isAbort
        ? 'The connection to the DeKUT library server timed out. Please check your internet connection and try again.'
        : err instanceof Error
        ? err.message
        : 'Unable to connect to the DeKUT library server.';
      if (!overview) {
        setLoadError(msg);
      } else {
        pushToast(msg, 'warning');
      }
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [overview, pushToast]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    if (!adminToken) {
      setAdminUser(null);
      setInAdminMode(false);
      return;
    }
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8000);

    fetch('/api/auth/me', {
      signal: controller.signal,
      headers: { Authorization: `Bearer ${adminToken}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.admin) {
          setAdminUser(data.admin);
        } else {
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          setAdminToken(null);
          setAdminUser(null);
          setInAdminMode(false);
        }
      })
      .catch(() => {})
      .finally(() => {
        window.clearTimeout(timeoutId);
      });
  }, [adminToken]);

  const handleNavigate = (page: PublicPage, preset?: Partial<BrowseFilters>) => {
    setPublicPage(page);
    if (preset) {
      setBrowseFilters({ ...EMPTY_FILTERS, ...preset });
    } else if (page !== 'past-papers' && page !== 'study-materials') {
      setBrowseFilters(EMPTY_FILTERS);
    }
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadDoc = (doc: LibraryDocument) => {
    const link = document.createElement('a');
    link.href = `/api/documents/${doc.id}/download`;
    link.download = doc.originalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    pushToast(`Downloading ${doc.originalFilename}`, 'success');
    setTimeout(() => {
      fetchOverview();
    }, 700);
  };

  const handleAdminLoginSuccess = (token: string, admin: AdminUser) => {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    setAdminToken(token);
    setAdminUser(admin);
    setAdminLoginOpen(false);
    setInAdminMode(true);
    pushToast(`Signed in as ${admin.displayName}`, 'success');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdminToken(null);
    setAdminUser(null);
    setInAdminMode(false);
    setPublicPage('home');
    pushToast('Signed out of DeKUT Admin Dashboard.', 'info');
  };

  if (loading && !overview) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F4F7FB] px-4 text-center text-[#14213D] dark:bg-[#101827] dark:text-slate-200">
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700">
          <img
            src="/dekut-crest.png"
            alt="Dedan Kimathi University of Technology"
            className="h-12 w-auto object-contain"
          />
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" />
          <span>Loading DeKUT Past Papers Library...</span>
        </div>
      </div>
    );
  }

  if (loadError && !overview) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4F7FB] px-4 text-[#14213D] dark:bg-[#101827] dark:text-slate-100">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-lg dark:border-slate-800 dark:bg-[#162033]">
          <div className="mx-auto inline-flex rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700">
            <img
              src="/dekut-crest.png"
              alt="Dedan Kimathi University of Technology"
              className="h-11 w-auto object-contain"
            />
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            <h1 className="font-display text-lg font-bold text-[#14213D] dark:text-white">
              Unable to Load Library Catalog
            </h1>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {loadError}
          </p>
          <button
            type="button"
            onClick={() => fetchOverview()}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  if (!overview) {
    return null;
  }

  return (
    <>
      {inAdminMode && adminUser && adminToken ? (
        <AdminDashboardApp
          overview={overview}
          admin={adminUser}
          token={adminToken}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          onRefreshOverview={fetchOverview}
          onUpdateAdmin={setAdminUser}
          onPreviewDoc={setPreviewDoc}
          onDownloadDoc={handleDownloadDoc}
          onExitToPublic={() => setInAdminMode(false)}
          onLogout={handleAdminLogout}
          onToast={pushToast}
        />
      ) : (
        <div className="flex min-h-screen flex-col bg-[#F4F7FB] text-[#14213D] dark:bg-[#101827] dark:text-slate-100">
          {/* Top Navigation Bar */}
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-[#162033]/95">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
              <button
                type="button"
                onClick={() => handleNavigate('home')}
                className="text-left focus:outline-none min-w-0"
              >
                <VaultBrandLogo
                  siteName={overview.settings.siteName}
                  subtitle={overview.settings.institutionName}
                />
              </button>

              <nav className="hidden items-center gap-5 xl:gap-6 lg:flex" aria-label="Primary Navigation">
                {(
                  [
                    { id: 'home', label: 'Home' },
                    { id: 'past-papers', label: 'Past Papers' },
                    { id: 'study-materials', label: 'Study Materials' },
                    { id: 'courses', label: 'Courses' },
                    { id: 'about', label: 'About' },
                    { id: 'contact', label: 'Contact' },
                  ] as { id: PublicPage; label: string }[]
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    className={`text-sm font-medium transition-colors whitespace-nowrap ${
                      publicPage === item.id
                        ? 'font-semibold text-[#2563EB]'
                        : 'text-slate-600 hover:text-[#14213D] dark:text-slate-300 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-2 shrink-0">
                <PWAInstallButton />

                <button
                  type="button"
                  onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                  aria-label="Toggle light or dark mode"
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>

                {adminUser ? (
                  <button
                    type="button"
                    onClick={() => setInAdminMode(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8] whitespace-nowrap"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Admin Dashboard</span>
                    <span className="sm:hidden">Admin</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAdminLoginOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-[#14213D] hover:border-[#2563EB] dark:border-slate-700 dark:bg-slate-900 dark:text-white whitespace-nowrap"
                  >
                    <Lock className="h-3.5 w-3.5 text-[#2563EB]" />
                    <span className="hidden sm:inline">Admin Login</span>
                    <span className="sm:hidden">Login</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setMobileNavOpen((o) => !o)}
                  aria-label="Toggle navigation menu"
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 dark:border-slate-700 dark:text-slate-300 lg:hidden"
                >
                  {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mobileNavOpen && (
              <nav className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-[#162033] lg:hidden">
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: 'home', label: 'Home' },
                      { id: 'past-papers', label: 'Past Papers' },
                      { id: 'study-materials', label: 'Study Materials' },
                      { id: 'courses', label: 'Courses' },
                      { id: 'about', label: 'About' },
                      { id: 'contact', label: 'Contact' },
                    ] as { id: PublicPage; label: string }[]
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigate(item.id)}
                      className={`rounded-lg px-3 py-2 text-left text-xs font-semibold ${
                        publicPage === item.id
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-[#F4F7FB] text-[#14213D] dark:bg-slate-900 dark:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </nav>
            )}
          </header>

          {/* Main Student Content */}
          <main className="flex-1">
            {publicPage === 'home' ? (
              <PublicHomePage
                overview={overview}
                onNavigate={handleNavigate}
                onPreviewDoc={setPreviewDoc}
                onDownloadDoc={handleDownloadDoc}
              />
            ) : (
              <PublicBrowsePage
                page={publicPage}
                overview={overview}
                filters={browseFilters}
                onChangeFilters={setBrowseFilters}
                onNavigate={handleNavigate}
                onPreviewDoc={setPreviewDoc}
                onDownloadDoc={handleDownloadDoc}
              />
            )}
          </main>

          {/* University Footer */}
          <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-600 dark:border-slate-800 dark:bg-[#162033] dark:text-slate-400">
            <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-12 sm:px-8">
              <div className="sm:col-span-6">
                <p className="font-display text-sm font-bold text-[#14213D] dark:text-white">
                  {overview.settings.institutionName} — {overview.settings.siteName}
                </p>
                <p className="mt-1.5 max-w-xl leading-relaxed text-slate-500 dark:text-slate-400">
                  {overview.settings.aboutText}
                </p>
              </div>
              <div className="sm:col-span-3">
                <p className="font-semibold text-[#14213D] dark:text-white">Contact Information</p>
                <p className="mt-1.5">{overview.settings.contactEmail}</p>
                <p className="mt-1">{overview.settings.contactPhone}</p>
              </div>
              <div className="sm:col-span-3">
                <p className="font-semibold text-[#14213D] dark:text-white">Quick Links</p>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                  <button type="button" onClick={() => handleNavigate('past-papers')} className="hover:text-[#2563EB]">
                    Past Papers
                  </button>
                  <button type="button" onClick={() => handleNavigate('study-materials')} className="hover:text-[#2563EB]">
                    Study Materials
                  </button>
                  <button type="button" onClick={() => handleNavigate('courses')} className="hover:text-[#2563EB]">
                    Courses
                  </button>
                  <button type="button" onClick={() => handleNavigate('about')} className="hover:text-[#2563EB]">
                    About
                  </button>
                  <button type="button" onClick={() => handleNavigate('contact')} className="hover:text-[#2563EB]">
                    Contact
                  </button>
                </div>
              </div>
            </div>
            <div className="mx-auto mt-6 max-w-7xl border-t border-slate-100 px-4 pt-4 text-[11px] text-slate-500 dark:border-slate-800 sm:px-8">
              {overview.settings.copyrightText}
            </div>
          </footer>
        </div>
      )}

      {/* Document Inline PDF Viewer Modal */}
      <PdfViewerModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
        onDownload={handleDownloadDoc}
      />

      {/* Private Administrator Login Modal */}
      <AdminLoginModal
        open={adminLoginOpen}
        onClose={() => setAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`rounded-xl border px-4 py-2.5 text-xs font-semibold shadow-lg ${
                t.tone === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950 dark:text-emerald-200'
                  : t.tone === 'warning'
                  ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950 dark:text-red-200'
                  : 'border-slate-200 bg-white text-[#14213D] dark:border-slate-700 dark:bg-[#162033] dark:text-white'
              }`}
            >
              {t.text}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
export default App;
