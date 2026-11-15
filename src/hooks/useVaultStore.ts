import { useCallback, useEffect, useState } from 'react';
import {
  Announcement,
  BookmarkCollection,
  CatalogResponse,
  DocumentReport,
  ExamPrepPlan,
  SupportRequest,
  UserAccount,
  VaultDocument,
  VaultNotification,
} from '../types/vault';

const TOKEN_KEY = 'cev_auth_token';
const THEME_KEY = 'cev_theme';
const SEARCH_HIST_KEY = 'cev_recent_searches';

export function useVaultStore() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = window.localStorage.getItem(THEME_KEY);
    return saved === 'dark' ? 'dark' : 'light';
  });

  const [authToken, setAuthTokenState] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(TOKEN_KEY);
  });

  const [user, setUser] = useState<UserAccount | null>(null);
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState<boolean>(true);

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [recentViewIds, setRecentViewIds] = useState<string[]>([]);
  const [recentDownloadIds, setRecentDownloadIds] = useState<string[]>([]);
  const [collections, setCollections] = useState<BookmarkCollection[]>([]);
  const [myUploads, setMyUploads] = useState<VaultDocument[]>([]);
  const [notifications, setNotifications] = useState<VaultNotification[]>([]);
  const [examPlans, setExamPlans] = useState<ExamPrepPlan[]>([]);
  const [mySupportRequests, setMySupportRequests] = useState<SupportRequest[]>([]);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const raw = window.localStorage.getItem(SEARCH_HIST_KEY);
      return raw ? (JSON.parse(raw) as string[]) : ['CSC 204', 'Database Systems', '2024/2025', 'Marking Schemes'];
    } catch {
      return ['CSC 204', 'Database Systems', '2024/2025'];
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setAuthSession = useCallback((token: string | null, nextUser: UserAccount | null) => {
    setAuthTokenState(token);
    setUser(nextUser);
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  }, []);

  const apiFetch = useCallback(
    async (url: string, init: RequestInit = {}) => {
      const headers = new Headers(init.headers || {});
      if (authToken && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${authToken}`);
      }
      return fetch(url, { ...init, headers });
    },
    [authToken]
  );

  const refreshCatalogAndDocs = useCallback(async () => {
    setLoadingCatalog(true);
    try {
      const [catRes, docsRes] = await Promise.all([
        fetch('/api/catalog'),
        fetch('/api/documents?status=approved'),
      ]);
      if (catRes.ok) {
        const catData = (await catRes.json()) as CatalogResponse;
        setCatalog(catData);
      }
      if (docsRes.ok) {
        const docsData = (await docsRes.json()) as { documents: VaultDocument[] };
        setDocuments(docsData.documents);
      }
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  const refreshUserActivity = useCallback(async () => {
    if (!authToken) {
      setBookmarkedIds([]);
      setRecentViewIds([]);
      setRecentDownloadIds([]);
      setCollections([]);
      setMyUploads([]);
      setNotifications([]);
      setExamPlans([]);
      setMySupportRequests([]);
      return;
    }

    const [meRes, actRes] = await Promise.all([
      apiFetch('/api/auth/me'),
      apiFetch('/api/user/activity'),
    ]);

    if (meRes.status === 401) {
      setAuthSession(null, null);
      return;
    }

    if (meRes.ok) {
      const meData = (await meRes.json()) as { user: UserAccount };
      setUser(meData.user);
    }

    if (actRes.ok) {
      const act = await actRes.json();
      setBookmarkedIds(act.bookmarkedIds || []);
      setRecentViewIds(act.recentViewIds || []);
      setRecentDownloadIds(act.recentDownloadIds || []);
      setCollections(act.collections || []);
      setMyUploads(act.myUploads || []);
      setNotifications(act.notifications || []);
      setExamPlans(act.examPlans || []);
      setMySupportRequests(act.mySupportRequests || []);
    }
  }, [authToken, apiFetch, setAuthSession]);

  useEffect(() => {
    refreshCatalogAndDocs();
  }, [refreshCatalogAndDocs]);

  useEffect(() => {
    refreshUserActivity();
  }, [refreshUserActivity]);

  const recordSearchTerm = useCallback((term: string) => {
    const clean = term.trim();
    if (!clean || clean.length < 2) return;
    setRecentSearches((prev) => {
      const next = [clean, ...prev.filter((t) => t.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
      window.localStorage.setItem(SEARCH_HIST_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    window.localStorage.removeItem(SEARCH_HIST_KEY);
  }, []);

  const toggleBookmark = useCallback(
    async (documentId: string): Promise<{ ok: boolean; bookmarked?: boolean; error?: string }> => {
      if (!authToken) {
        return { ok: false, error: 'Please sign in to bookmark papers into your personal vault.' };
      }
      const res = await apiFetch('/api/bookmarks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error || 'Failed to update bookmark.' };
      setBookmarkedIds(data.bookmarkedIds || []);
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === documentId
            ? { ...d, bookmarksCount: Math.max(0, d.bookmarksCount + (data.bookmarked ? 1 : -1)) }
            : d
        )
      );
      return { ok: true, bookmarked: data.bookmarked };
    },
    [authToken, apiFetch]
  );

  const recordDocumentView = useCallback(
    async (documentId: string): Promise<VaultDocument | null> => {
      const res = await apiFetch(`/api/documents/${documentId}`);
      if (!res.ok) return null;
      const data = (await res.json()) as { document: VaultDocument };
      setDocuments((prev) => prev.map((d) => (d.id === documentId ? data.document : d)));
      if (authToken) {
        setRecentViewIds((prev) => [documentId, ...prev.filter((id) => id !== documentId)].slice(0, 12));
      }
      return data.document;
    },
    [apiFetch, authToken]
  );

  const triggerDownload = useCallback(
    (doc: VaultDocument) => {
      const tokenParam = authToken ? `?token=${encodeURIComponent(authToken)}` : '';
      const url = `/api/documents/${doc.id}/download${tokenParam}`;
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.originalFilename || `${doc.courseCode}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, downloadsCount: d.downloadsCount + 1 } : d))
      );
      if (authToken) {
        setRecentDownloadIds((prev) => [doc.id, ...prev.filter((id) => id !== doc.id)].slice(0, 15));
      }
    },
    [authToken]
  );

  const markAllNotificationsRead = useCallback(async () => {
    if (!authToken) return;
    await apiFetch('/api/notifications/read-all', { method: 'POST' });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [authToken, apiFetch]);

  const logout = useCallback(() => {
    setAuthSession(null, null);
  }, [setAuthSession]);

  return {
    theme,
    toggleTheme,
    authToken,
    user,
    setUser,
    setAuthSession,
    logout,
    catalog,
    documents,
    setDocuments,
    loadingCatalog,
    refreshCatalogAndDocs,
    refreshUserActivity,
    bookmarkedIds,
    recentViewIds,
    recentDownloadIds,
    collections,
    setCollections,
    myUploads,
    notifications,
    examPlans,
    setExamPlans,
    mySupportRequests,
    setMySupportRequests,
    recentSearches,
    recordSearchTerm,
    clearRecentSearches,
    toggleBookmark,
    recordDocumentView,
    triggerDownload,
    markAllNotificationsRead,
    apiFetch,
  };
}

export type VaultStoreType = ReturnType<typeof useVaultStore>;

export type { Announcement, DocumentReport };
