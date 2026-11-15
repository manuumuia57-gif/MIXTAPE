import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Maximize2,
  Minimize2,
  Printer,
  Search,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { VaultDocument } from '../types/vault';
import { formatBytes, getVerificationMeta } from './DocumentFormatUtils';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface PdfViewerModalProps {
  document: VaultDocument | null;
  authToken: string | null;
  isBookmarked: boolean;
  onClose: () => void;
  onDownload: (doc: VaultDocument) => void;
  onToggleBookmark: (docId: string) => void;
}

interface SearchHit {
  page: number;
  snippet: string;
}

export function PdfViewerModal({
  document: doc,
  authToken,
  isBookmarked,
  onClose,
  onDownload,
  onToggleBookmark,
}: PdfViewerModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pdfProxy, setPdfProxy] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(1);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchHits, setSearchHits] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState<boolean>(false);

  useEffect(() => {
    if (!doc) return;
    setPageNumber(1);
    setSearchQuery('');
    setSearchHits([]);
    setLoadError('');
    setPdfProxy(null);

    if (doc.fileFormat !== 'PDF') {
      return;
    }

    let cancelled = false;
    setLoading(true);
    const tokenParam = authToken ? `?token=${encodeURIComponent(authToken)}` : '';
    const url = `/api/documents/${doc.id}/file${tokenParam}`;

    const task = pdfjsLib.getDocument({ url });
    task.promise
      .then((loaded) => {
        if (cancelled) return;
        setPdfProxy(loaded);
        setNumPages(loaded.numPages);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('PDF load failed:', err);
        setLoadError('Unable to render inline PDF preview in this browser. Use Download below to open locally.');
        setLoading(false);
      });

    return () => {
      cancelled = true;
      task.destroy().catch(() => {});
    };
  }, [doc, authToken]);

  useEffect(() => {
    if (!pdfProxy || !canvasRef.current) return;
    let cancelled = false;
    let renderTask: pdfjsLib.RenderTask | null = null;

    pdfProxy.getPage(pageNumber).then((page) => {
      if (cancelled || !canvasRef.current) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderTask = page.render({ canvasContext: context, viewport, canvas });
      renderTask.promise.catch(() => {});
    });

    return () => {
      cancelled = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [pdfProxy, pageNumber, scale]);

  const handleSearchInPdf = async () => {
    if (!pdfProxy || !searchQuery.trim()) {
      setSearchHits([]);
      return;
    }
    setSearching(true);
    const q = searchQuery.trim().toLowerCase();
    const hits: SearchHit[] = [];
    for (let p = 1; p <= pdfProxy.numPages; p++) {
      const page = await pdfProxy.getPage(p);
      const textContent = await page.getTextContent();
      const fullText = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');
      const idx = fullText.toLowerCase().indexOf(q);
      if (idx !== -1) {
        const start = Math.max(0, idx - 40);
        const end = Math.min(fullText.length, idx + q.length + 70);
        hits.push({
          page: p,
          snippet: `${start > 0 ? '...' : ''}${fullText.slice(start, end)}${end < fullText.length ? '...' : ''}`,
        });
      }
    }
    setSearchHits(hits);
    if (hits.length > 0) {
      setPageNumber(hits[0].page);
    }
    setSearching(false);
  };

  const handlePrint = () => {
    if (!doc) return;
    const tokenParam = authToken ? `?token=${encodeURIComponent(authToken)}` : '';
    const win = window.open(`/api/documents/${doc.id}/file${tokenParam}`, '_blank', 'noopener,noreferrer');
    if (win) {
      win.addEventListener('load', () => {
        win.print();
      });
    }
  };

  if (!doc) return null;
  const verif = getVerificationMeta(doc.verificationLevel);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#101827]/80 p-2 backdrop-blur-sm sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`PDF Reader: ${doc.title}`}
    >
      <div
        className={`flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#101827] ${
          fullscreen ? 'h-full w-full' : 'h-[92vh] w-full max-w-6xl'
        }`}
      >
        {/* Reader Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-[#162033]">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono font-semibold text-[#2563EB]">{doc.courseCode}</span>
              <span aria-hidden="true">·</span>
              <span className={verif.toneClass}>{verif.shortLabel}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{doc.academicYear}</span>
            </div>
            <h3 className="truncate font-display text-sm font-bold text-[#14213D] dark:text-white sm:text-base">
              {doc.title}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {doc.fileFormat === 'PDF' && (
              <>
                <div className="flex items-center rounded-lg border border-slate-200 bg-[#F4F7FB] dark:border-slate-700 dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                    disabled={pageNumber <= 1}
                    aria-label="Previous page"
                    className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-40 dark:text-slate-300"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-2 font-mono text-xs font-medium text-slate-700 dark:text-slate-200 tabular-nums whitespace-nowrap">
                    Page {pageNumber} / {numPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                    disabled={pageNumber >= numPages}
                    aria-label="Next page"
                    className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-40 dark:text-slate-300"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center rounded-lg border border-slate-200 bg-[#F4F7FB] dark:border-slate-700 dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => setScale((s) => Math.max(0.7, Number((s - 0.15).toFixed(2))))}
                    aria-label="Zoom out"
                    className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="px-1.5 font-mono text-xs font-medium text-slate-700 dark:text-slate-200 tabular-nums">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setScale((s) => Math.min(2.2, Number((s + 0.15).toFixed(2))))}
                    aria-label="Zoom in"
                    className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handlePrint}
                  aria-label="Print document"
                  className="hidden rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:inline-flex"
                >
                  <Printer className="h-4 w-4" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => onToggleBookmark(doc.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                isBookmarked
                  ? 'border-[#F4B400] bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Bookmark'}</span>
            </button>

            <button
              type="button"
              onClick={() => onDownload(doc)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8] whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>

            <button
              type="button"
              onClick={() => setFullscreen((f) => !f)}
              aria-label={fullscreen ? 'Exit full screen' : 'Enter full screen'}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close document viewer"
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search Inside PDF Bar */}
        {doc.fileFormat === 'PDF' && (
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-[#F4F7FB] px-4 py-2 dark:border-slate-800 dark:bg-[#0B1221]">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearchInPdf();
                }}
                placeholder="Search keywords inside this PDF..."
                className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-[#2563EB] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <button
              type="button"
              onClick={handleSearchInPdf}
              disabled={searching || !pdfProxy}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {searching ? 'Scanning...' : 'Find in PDF'}
            </button>
            {searchHits.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-[#16A34A]">
                  {searchHits.length} matching {searchHits.length === 1 ? 'page' : 'pages'}:
                </span>
                {searchHits.map((hit) => (
                  <button
                    key={hit.page}
                    type="button"
                    onClick={() => setPageNumber(hit.page)}
                    className={`rounded px-2 py-0.5 font-mono text-[11px] ${
                      pageNumber === hit.page
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-white text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Pg {hit.page}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Viewport */}
        <div className="flex-1 overflow-auto bg-slate-200/80 p-4 dark:bg-[#0A0F1A] sm:p-6">
          {doc.fileFormat !== 'PDF' ? (
            <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#162033]">
              <FileText className="mx-auto h-12 w-12 text-[#2563EB]" />
              <h4 className="mt-4 font-display text-lg font-bold text-[#14213D] dark:text-white">
                {doc.fileFormat} Document Preview Unavailable Inline
              </h4>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                This academic resource is archived in {doc.fileFormat} format ({formatBytes(doc.fileSizeBytes)}). Download the verified file to open it in your document suite.
              </p>
              <button
                type="button"
                onClick={() => onDownload(doc)}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
              >
                <Download className="h-4 w-4" />
                <span>Download {doc.originalFilename}</span>
              </button>
            </div>
          ) : loading ? (
            <div className="flex h-64 items-center justify-center text-sm font-medium text-slate-600 dark:text-slate-300">
              Loading PDF pages...
            </div>
          ) : loadError ? (
            <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#162033]">
              <p className="text-sm text-slate-700 dark:text-slate-300">{loadError}</p>
              <button
                type="button"
                onClick={() => onDownload(doc)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-lg dark:border-slate-700">
                <canvas ref={canvasRef} />
              </div>
              {searchHits.length > 0 && (
                <div className="mt-4 w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-4 text-xs dark:border-slate-800 dark:bg-[#162033]">
                  <p className="font-semibold text-[#14213D] dark:text-white">Matched Excerpts</p>
                  <div className="mt-2 space-y-2">
                    {searchHits.map((h) => (
                      <button
                        key={h.page}
                        type="button"
                        onClick={() => setPageNumber(h.page)}
                        className="block w-full rounded-lg border border-slate-100 p-2 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                      >
                        <span className="font-mono font-semibold text-[#2563EB]">Page {h.page}: </span>
                        <span className="text-slate-600 dark:text-slate-300">{h.snippet}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
