import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Maximize2,
  Minimize2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { LibraryDocument } from '../types/vault';
import { formatBytes } from './DocumentFormatUtils';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface PdfViewerModalProps {
  document: LibraryDocument | null;
  onClose: () => void;
  onDownload: (doc: LibraryDocument) => void;
}

export function PdfViewerModal({
  document: doc,
  onClose,
  onDownload,
}: PdfViewerModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pdfProxy, setPdfProxy] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(1);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.15);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string>('');

  useEffect(() => {
    if (!doc) return;
    setPageNumber(1);
    setLoadError('');
    setPdfProxy(null);

    if (doc.fileFormat !== 'PDF') return;

    let cancelled = false;
    setLoading(true);
    const task = pdfjsLib.getDocument({ url: `/api/documents/${doc.id}/file` });

    task.promise
      .then((loaded) => {
        if (cancelled) return;
        setPdfProxy(loaded);
        setNumPages(loaded.numPages);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError('Inline preview could not be rendered on this device. Click Download to open the PDF directly.');
        setLoading(false);
      });

    return () => {
      cancelled = true;
      task.destroy().catch(() => {});
    };
  }, [doc]);

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

  if (!doc) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#101827]/80 p-2 backdrop-blur-sm sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`PDF Viewer: ${doc.title}`}
    >
      <div
        className={`flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#101827] ${
          fullscreen ? 'h-full w-full' : 'h-[92vh] w-full max-w-5xl'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-[#162033]">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono font-semibold text-[#2563EB]">{doc.courseCode}</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span className="tabular-nums">{doc.academicYear}</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>{doc.semester}</span>
            </p>
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
                    {pageNumber} / {numPages}
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
                    onClick={() => setScale((s) => Math.max(0.65, Number((s - 0.15).toFixed(2))))}
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
              </>
            )}

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

        <div className="flex-1 overflow-auto bg-slate-200/80 p-4 dark:bg-[#0A0F1A] sm:p-6">
          {doc.fileFormat !== 'PDF' ? (
            <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#162033]">
              <FileText className="mx-auto h-12 w-12 text-[#2563EB]" />
              <h4 className="mt-4 font-display text-lg font-bold text-[#14213D] dark:text-white">
                {doc.fileFormat} File ({formatBytes(doc.fileSizeBytes)})
              </h4>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Download this {doc.fileFormat} academic resource to open it on your phone or computer.
              </p>
              <button
                type="button"
                onClick={() => onDownload(doc)}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white"
              >
                <Download className="h-4 w-4" />
                <span>Download {doc.originalFilename}</span>
              </button>
            </div>
          ) : loading ? (
            <div className="flex h-64 items-center justify-center text-sm font-medium text-slate-600 dark:text-slate-300">
              Loading PDF preview...
            </div>
          ) : loadError ? (
            <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#162033]">
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
            <div className="flex justify-center">
              <div className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-lg dark:border-slate-700">
                <canvas ref={canvasRef} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
