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
        if (err?.name !== 'RenderingCancelledException') {
          console.error('[GitNote PDF Viewer] Error rendering page:', err);
        }
        setIsRenderingPage(false);
      }
    },
    [scale, rotation]
  );

  // Trigger page render when page, scale, or rotation changes
  useEffect(() => {
    if (!isLoadingDoc && pdfDocRef.current && currentPage > 0) {
      renderPage(currentPage);
      setPageInput(String(currentPage));
    }
  }, [currentPage, scale, rotation, isLoadingDoc, renderPage]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (currentPage < numPages) {
          e.preventDefault();
          setCurrentPage((p) => p + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (currentPage > 1) {
          e.preventDefault();
          setCurrentPage((p) => p - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, numPages]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (currentPage < numPages) setCurrentPage((p) => p + 1);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= numPages) {
      setCurrentPage(parsed);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const zoomIn = () => setScale((s) => Math.min(2.5, +(s + 0.2).toFixed(1)));
  const zoomOut = () => setScale((s) => Math.max(0.6, +(s - 0.2).toFixed(1)));
  const rotate = () => setRotation((r) => (r + 90) % 360);

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
        className={`bg-[#18181b] rounded-md border border-[#27272a] p-8 sm:p-12 text-center text-white flex flex-col items-center justify-center min-h-[380px] ${className}`}
      >
        <div className="w-12 h-12 rounded bg-[#27272a] border border-[#3f3f46] flex items-center justify-center text-[#d4d4d8] mb-3">
          {fileFormat.toUpperCase() === 'ZIP' ? (
            <FolderArchive className="w-6 h-6" />
          ) : fileFormat.toUpperCase() === 'DOCX' ? (
            <FileText className="w-6 h-6" />
          ) : (
            <FileCode className="w-6 h-6" />
          )}
        </div>
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#a1a1aa] bg-[#27272a] px-2.5 py-0.5 rounded border border-[#3f3f46] mb-2">
          {fileFormat.toUpperCase()} Document
        </span>
        <h3 className="font-editorial text-lg font-medium text-white max-w-md line-clamp-2">{title}</h3>
        <p className="text-xs text-[#a1a1aa] mt-1.5 max-w-sm leading-relaxed">
          In-browser preview is optimized for PDF documents. Download this file ({fileSize}) to open it in your desktop office editor.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          {onDownload && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-[#d4d4d8] hover:text-white bg-[#27272a] hover:bg-[#3f3f46] transition-colors border border-[#3f3f46]"
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
      className={`bg-[#18181b] rounded-md border border-[#27272a] flex flex-col overflow-hidden shadow-sm relative select-none ${className}`}
    >
      {/* Viewer Top Toolbar */}
      <div className="bg-[#202023] px-3 sm:px-4 py-2 border-b border-[#2e2e32] flex flex-wrap items-center justify-between gap-2.5 text-xs text-[#d4d4d8] z-10">
        {/* Document Title / Status */}
        <div className="flex items-center gap-2 min-w-0 max-w-[200px] sm:max-w-xs">
          <span className="font-medium text-white truncate text-xs" title={title}>
            {title}
          </span>
        </div>

        {/* Page Navigation Controls */}
        <div className="flex items-center gap-1 bg-[#18181b] px-1.5 py-0.5 rounded border border-[#2e2e32]">
          <button
            type="button"
            disabled={currentPage <= 1 || isLoadingDoc}
            onClick={handlePrevPage}
            className="p-1 rounded hover:bg-[#27272a] text-[#a1a1aa] hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
            title="Previous Page (←)"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
            <input
              type="text"
              value={pageInput}
              disabled={isLoadingDoc || numPages === 0}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={() => setPageInput(String(currentPage))}
              className="w-7 text-center bg-[#27272a] border border-[#3f3f46] rounded text-[11px] font-mono text-white py-0.5 focus:outline-none focus:border-[#1d3b64]"
            />
            <span className="text-[#a1a1aa] font-mono text-[11px]">/ {numPages || 1}</span>
          </form>

          <button
            type="button"
            disabled={currentPage >= numPages || isLoadingDoc}
            onClick={handleNextPage}
            className="p-1 rounded hover:bg-[#27272a] text-[#a1a1aa] hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
            title="Next Page (→)"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={zoomOut}
            disabled={isLoadingDoc || scale <= 0.6}
            className="p-1 rounded hover:bg-[#27272a] text-[#a1a1aa] hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="font-mono text-[11px] text-[#a1a1aa] min-w-[36px] text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            type="button"
            onClick={zoomIn}
            disabled={isLoadingDoc || scale >= 2.5}
            className="p-1 rounded hover:bg-[#27272a] text-[#a1a1aa] hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={rotate}
            disabled={isLoadingDoc}
            className="p-1 rounded hover:bg-[#27272a] text-[#a1a1aa] hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
            title="Rotate"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1 rounded hover:bg-[#27272a] text-[#a1a1aa] hover:text-white transition-colors cursor-pointer hidden sm:inline-flex"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:bg-[#27272a] text-[#a1a1aa] hover:text-white transition-colors"
              title="Open in Native Browser Tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              className="ml-1 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#27272a] hover:bg-[#3f3f46] text-white text-xs font-medium transition-colors border border-[#3f3f46] cursor-pointer"
              title="Download PDF Document"
            >
              <Download className="w-3 h-3" />
              <span>Download</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas Scroll Viewport */}
      <div className="flex-1 overflow-auto bg-[#121214] p-4 sm:p-6 flex items-center justify-center min-h-[440px] max-h-[72vh]">
        {isLoadingDoc ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-[#a1a1aa] space-y-2.5">
            <Loader2 className="w-6 h-6 text-[#1d3b64] animate-spin" />
            <p className="text-xs font-mono">Initializing document reader...</p>
          </div>
        ) : error ? (
          <div className="bg-[#18181b] border border-[#3f3f46] rounded-md p-6 max-w-sm text-center space-y-3">
            <div className="w-10 h-10 rounded bg-[#fef2f2]/10 border border-[#fecaca]/20 text-[#f87171] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-white">Preview Unavailable</h4>
              <p className="text-xs text-[#a1a1aa] mt-1">{error}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setIsLoadingDoc(true);
                }}
                className="px-2.5 py-1 rounded bg-[#27272a] hover:bg-[#3f3f46] text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-[#3f3f46]"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
              {onDownload && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Download className="w-3 h-3" />}
                  onClick={onDownload}
                >
                  Download File
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="relative shadow-md rounded overflow-hidden">
            {isRenderingPage && (
              <div className="absolute inset-0 bg-[#18181b]/50 backdrop-blur-xs flex items-center justify-center text-white text-xs z-10">
                <Loader2 className="w-4 h-4 text-white animate-spin mr-1.5" />
                <span>Rendering page {currentPage}...</span>
              </div>
            )}
            <canvas ref={canvasRef} className="block bg-white mx-auto shadow" />
          </div>
        )}
      </div>

      {/* Viewer Bottom Info Bar */}
      <div className="bg-[#202023] px-3 sm:px-4 py-1.5 border-t border-[#2e2e32] flex items-center justify-between text-[11px] text-[#a1a1aa]">
        <span className="font-mono">
          Page {currentPage} of {numPages || 1} • {fileFormat} • {fileSize}
        </span>
        <span className="text-[#71717a] hidden sm:inline">
          Use ← / → keys to flip pages
        </span>
      </div>
    </div>
  );
};
