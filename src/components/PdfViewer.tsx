'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Download,
  ExternalLink,
  FileText,
  AlertTriangle,
  Loader2,
  RefreshCw,
  FolderArchive,
  FileCode,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PdfViewerProps {
  url: string | null;
  title: string;
  fileFormat?: string;
  fileSize?: string;
  onDownload?: () => void;
  className?: string;
  initialPage?: number;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  url,
  title,
  fileFormat = 'PDF',
  fileSize = '1.0 MB',
  onDownload,
  className = '',
  initialPage = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [pageInput, setPageInput] = useState<string>(String(initialPage));
  const [scale, setScale] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoadingDoc, setIsLoadingDoc] = useState<boolean>(true);
  const [isRenderingPage, setIsRenderingPage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Cached PDF.js document instance
  const pdfDocRef = useRef<any>(null);

  const isPdf = fileFormat.toUpperCase() === 'PDF';

  // 1. Load PDF document
  useEffect(() => {
    if (!url || !isPdf) {
      setIsLoadingDoc(false);
      return;
    }

    let isMounted = true;
    setIsLoadingDoc(true);
    setError(null);

    async function loadPdf() {
      try {
        const pdfjs = await import('pdfjs-dist');

        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        }

        const loadingTask = pdfjs.getDocument({
          url: url as string,
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (!isMounted) return;

        pdfDocRef.current = doc;
        setNumPages(doc.numPages);
        setCurrentPage((prev) => Math.min(Math.max(1, prev), doc.numPages));
        setIsLoadingDoc(false);
      } catch (err: any) {
        if (!isMounted) return;
        console.error('[GitNote PDF Viewer] Failed to load PDF document:', err);
        setError(
          err?.message?.includes('Invalid PDF structure')
            ? 'The file appears to be corrupted or is not a valid PDF document.'
            : 'Unable to render this PDF. The storage link may have expired or access was denied.'
        );
        setIsLoadingDoc(false);
      }
    }

    loadPdf();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [url, isPdf]);

  // 2. Render Page on Canvas
  const renderPage = useCallback(
    async (pageNumber: number) => {
      if (!pdfDocRef.current || !canvasRef.current) return;

      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore cancellation
        }
      }

      try {
        setIsRenderingPage(true);
        const page = await pdfDocRef.current.getPage(pageNumber);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
        const viewport = page.getViewport({ scale: scale * dpr, rotation });

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
        canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        // White background for transparent pages
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const renderContext = {
          canvasContext: ctx,
          viewport,
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;
        await task.promise;
        setIsRenderingPage(false);
      } catch (err: any) {
        if (err?.name === 'RenderingCancelledException') {
          // Expected when rapidly switching pages/zoom
          return;
        }
        console.error('[GitNote PDF Viewer] Page render error:', err);
        setIsRenderingPage(false);
      }
    },
    [scale, rotation]
  );

  useEffect(() => {
    if (!isLoadingDoc && !error && pdfDocRef.current) {
      renderPage(currentPage);
      setPageInput(String(currentPage));
    }
  }, [currentPage, renderPage, isLoadingDoc, error]);

  // Navigation handlers
  const handlePrevPage = () => {
    setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((p) => Math.min(numPages || 1, p + 1));
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(pageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= (numPages || 1)) {
      setCurrentPage(p);
    } else {
      setPageInput(String(currentPage));
    }
  };

  // Zoom handlers
  const zoomIn = () => setScale((s) => Math.min(2.5, +(s + 0.2).toFixed(1)));
  const zoomOut = () => setScale((s) => Math.max(0.6, +(s - 0.2).toFixed(1)));
  const rotate = () => setRotation((r) => (r + 90) % 360);

  // Fullscreen handlers
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Non-PDF Fallback Display
  if (!isPdf) {
    return (
      <div
        className={`bg-slate-900 rounded-2xl border border-slate-800 p-8 sm:p-12 text-center text-white flex flex-col items-center justify-center min-h-[420px] ${className}`}
      >
        <div className="w-16 h-16 rounded-2xl bg-[#4f46e5]/10 border border-[#4f46e5]/20 flex items-center justify-center text-[#818cf8] mb-4 shadow-inner">
          {fileFormat.toUpperCase() === 'ZIP' ? (
            <FolderArchive className="w-8 h-8" />
          ) : fileFormat.toUpperCase() === 'DOCX' ? (
            <FileText className="w-8 h-8" />
          ) : (
            <FileCode className="w-8 h-8" />
          )}
        </div>
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 mb-2">
          {fileFormat.toUpperCase()} Document
        </span>
        <h3 className="text-xl font-bold text-white max-w-md line-clamp-2">{title}</h3>
        <p className="text-xs text-slate-400 mt-2 max-w-sm">
          In-browser rendering is optimized for PDFs. Download this file ({fileSize}) to open it in
          your native office editor.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onDownload && (
            <Button
              variant="primary"
              size="md"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={onDownload}
            >
              Download {fileFormat.toUpperCase()} ({fileSize})
            </Button>
          )}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Direct Link</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`bg-slate-950 rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl relative select-none ${className}`}
    >
      {/* Viewer Top Toolbar */}
      <div className="bg-slate-900/90 backdrop-blur-md px-3 sm:px-5 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 z-10">
        {/* Document Title / Status */}
        <div className="flex items-center gap-2 min-w-0 max-w-[200px] sm:max-w-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-[#4f46e5] shrink-0 animate-pulse" />
          <span className="font-medium text-slate-200 truncate" title={title}>
            {title}
          </span>
        </div>

        {/* Page Navigation Controls */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-700">
          <button
            type="button"
            disabled={currentPage <= 1 || isLoadingDoc}
            onClick={handlePrevPage}
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Previous Page (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
            <input
              type="text"
              value={pageInput}
              disabled={isLoadingDoc || numPages === 0}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={() => setPageInput(String(currentPage))}
              className="w-8 text-center bg-slate-900 border border-slate-700 rounded text-xs font-mono text-white py-0.5 focus:outline-none focus:border-indigo-500"
            />
            <span className="text-slate-400 font-mono text-xs">/ {numPages || 1}</span>
          </form>

          <button
            type="button"
            disabled={currentPage >= numPages || isLoadingDoc}
            onClick={handleNextPage}
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Next Page (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Zoom Out */}
          <button
            type="button"
            onClick={zoomOut}
            disabled={isLoadingDoc || scale <= 0.6}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Zoom Label / Preset */}
          <span className="font-mono text-xs text-slate-300 min-w-[42px] text-center">
            {Math.round(scale * 100)}%
          </span>

          {/* Zoom In */}
          <button
            type="button"
            onClick={zoomIn}
            disabled={isLoadingDoc || scale >= 2.5}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Rotate */}
          <button
            type="button"
            onClick={rotate}
            disabled={isLoadingDoc}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
            title="Rotate Clockwise"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer hidden sm:inline-flex"
            title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* External Tab View */}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Open in Browser Native Tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {/* Separate Direct Download Button */}
          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              className="ml-1 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
              title="Download Original PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Download</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas Scroll Viewport */}
      <div className="flex-1 overflow-auto bg-slate-900/60 p-4 sm:p-8 flex items-center justify-center min-h-[460px] max-h-[75vh]">
        {isLoadingDoc ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-xs font-medium">Decrypting and loading PDF document...</p>
          </div>
        ) : error ? (
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 sm:p-8 max-w-md text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Preview Unavailable</h4>
              <p className="text-xs text-slate-400 mt-1">{error}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setIsLoadingDoc(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
              {onDownload && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  onClick={onDownload}
                >
                  Download File Directly
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="relative shadow-2xl rounded-lg overflow-hidden transition-all duration-150">
            {isRenderingPage && (
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center text-white text-xs font-medium z-10">
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin mr-2" />
                <span>Rendering Page {currentPage}...</span>
              </div>
            )}
            <canvas ref={canvasRef} className="block bg-white mx-auto shadow-md" />
          </div>
        )}
      </div>

      {/* Viewer Bottom Info Bar */}
      <div className="bg-slate-900/90 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span className="font-mono">
          Page {currentPage} of {numPages || 1} • {fileFormat} • {fileSize}
        </span>
        <span className="text-slate-500 hidden sm:inline">
          Use ← / → arrow keys or zoom controls to inspect document
        </span>
      </div>
    </div>
  );
};
