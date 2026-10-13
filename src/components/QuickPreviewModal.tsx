'use client';

import React, { useState } from 'react';
import { Resource } from '@/types';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useResources } from '@/context/ResourceContext';
import {
  FileText,
  Download,
  Bookmark,
  Share2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface QuickPreviewModalProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickPreviewModal: React.FC<QuickPreviewModalProps> = ({
  resource,
  isOpen,
  onClose,
}) => {
  const { toggleBookmark, isBookmarked, mockDownload, addToast } = useResources();
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);

  if (!resource) return null;

  const totalPages = resource.pageCount || 12;
  const bookmarked = isBookmarked(resource.id);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.origin + `/resources/${resource.id}`);
      addToast('info', 'Link Copied', 'Resource link copied to your clipboard!');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      <div className="space-y-4 -m-2">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge resourceType={resource.resourceType}>
                {resource.resourceType}
              </Badge>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                {resource.semester}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {resource.subject}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">
              {resource.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleBookmark(resource.id)}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                bookmarked
                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                  : 'text-slate-500 hover:bg-slate-100 border border-slate-200'
              }`}
              title="Bookmark"
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => mockDownload(resource)}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Download ({resource.fileSize})
            </Button>
          </div>
        </div>

        {/* PDF Viewer Mock Canvas */}
        <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex flex-col">
          {/* Viewer Toolbar */}
          <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-400" />
              <span className="font-mono text-slate-400 truncate max-w-[200px]">
                {resource.title.replace(/\s+/g, '_')}.pdf
              </span>
            </div>

            {/* Page navigation controls */}
            <div className="flex items-center gap-3">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 rounded hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom controls */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                className="p-1 rounded hover:bg-slate-800 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] text-slate-400 w-10 text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                className="p-1 rounded hover:bg-slate-800 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Document Page View */}
          <div className="p-4 sm:p-8 bg-slate-800/60 overflow-y-auto max-h-[460px] flex justify-center">
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-xl w-full text-slate-800 border border-slate-200 min-h-[420px] transition-transform duration-150"
            >
              {/* Document Header Stamp */}
              <div className="border-b-2 border-slate-800 pb-3 mb-5 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block">
                    GitNote Academic Archive • Verified Solution
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{resource.subject}</h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {resource.semester} • {resource.academicYear}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300">
                    Doc ID: {resource.id}
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-1">Sheet #{currentPage}</span>
                </div>
              </div>

              {/* Sample Document Body Content */}
              <div className="space-y-4 text-xs font-serif leading-relaxed text-slate-700">
                <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-100 text-[11px] font-sans">
                  <strong className="text-blue-900 flex items-center gap-1 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Chapter Synopsis & Key Concepts:
                  </strong>
                  <p className="text-slate-600 mt-1">{resource.previewContent?.summary}</p>
                </div>

                <div className="font-sans">
                  <span className="font-bold text-slate-900 text-xs block mb-1">
                    Exam High-Frequency Topics:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {resource.previewContent?.keyTopics.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded border border-slate-200"
                      >
                        • {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Simulated Handwritten / Typed Transcript */}
                <div className="pt-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                    Document Excerpt (Page {currentPage})
                  </span>
                  <pre className="font-mono text-[11px] bg-slate-50 p-4 rounded-xl border border-slate-200/90 whitespace-pre-wrap text-slate-800 leading-normal">
                    {resource.previewContent?.sampleText}
                  </pre>
                </div>

                {resource.previewContent?.diagramType && (
                  <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-slate-500 font-sans text-xs">
                    <Layers className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                    <span className="font-semibold text-slate-700">
                      [Technical Schematic]: {resource.previewContent.diagramType}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Vector preview rendered for high-DPI displays
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href={`/resources/${resource.id}`}
            onClick={onClose}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Open Full Resource Page <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </div>
    </Modal>
  );
};
