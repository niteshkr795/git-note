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
  Sparkles,
  ExternalLink,
  CheckCircle2,
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
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge resourceType={resource.resourceType}>
                {resource.resourceType}
              </Badge>
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                {resource.semester}
              </span>
              <span className="text-xs text-[#4338ca] bg-[#eef2ff] px-2.5 py-0.5 rounded-full font-semibold border border-[#e0e7ff]">
                {resource.subject}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#0f172a] line-clamp-1 tracking-tight">
              {resource.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleBookmark(resource.id)}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                bookmarked
                  ? 'bg-[#fffbeb] text-[#b45309] border border-[#fde68a]'
                  : 'text-slate-500 hover:bg-[#f8fafc] border border-[#e2e8f0]'
              }`}
              title={bookmarked ? 'Saved to Bookmarks' : 'Bookmark for Later'}
            >
              <Bookmark
                className={`w-4 h-4 ${bookmarked ? 'fill-[#f59e0b] text-[#f59e0b]' : ''}`}
              />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-500 hover:bg-[#f8fafc] border border-[#e2e8f0] transition-colors cursor-pointer"
              title="Copy share link"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={() => mockDownload(resource)}
            >
              Download PDF
            </Button>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="bg-[#f8fafc] rounded-xl px-4 py-2 border border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-[#cbd5e1] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed bg-white"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700" />
            </button>
            <span className="font-mono text-slate-600 font-medium">
              Page <strong>{currentPage}</strong> of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-[#cbd5e1] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed bg-white"
            >
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Zoom:</span>
            <button
              onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
              className="p-1.5 rounded-lg border border-[#cbd5e1] hover:bg-white bg-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5 text-slate-600" />
            </button>
            <span className="font-mono text-slate-700 font-semibold w-12 text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              className="p-1.5 rounded-lg border border-[#cbd5e1] hover:bg-white bg-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Document Simulation Canvas */}
        <div className="bg-[#f1f5f9] rounded-xl p-4 sm:p-6 border border-[#e2e8f0] min-h-[360px] flex items-center justify-center overflow-auto">
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-full max-w-2xl bg-white rounded-lg shadow-sm border border-[#e2e8f0] p-6 sm:p-8 space-y-4 text-slate-800 transition-transform duration-150"
          >
            {/* Mock Document Header */}
            <div className="border-b border-[#f1f5f9] pb-4 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#4f46e5] font-bold">
                  {resource.subject} • {resource.academicYear}
                </span>
                <h3 className="text-base font-bold text-[#0f172a] mt-1">{resource.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Author: {resource.uploader.name} ({resource.uploader.college})</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-[#047857] bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified</span>
              </div>
            </div>

            {/* Document Content Abstract */}
            <div className="space-y-3 text-xs leading-relaxed text-[#334155]">
              <div className="p-3 bg-[#faf8ff] rounded-lg border border-[#e2e8f0]">
                <strong className="block text-[#0f172a] mb-1 font-semibold">Synopsis Summary:</strong>
                <p className="text-[#475569]">{resource.description}</p>
              </div>

              <div>
                <strong className="text-[#0f172a]">Core Concepts Covered on Page {currentPage}:</strong>
                <ul className="list-disc pl-5 mt-1.5 space-y-1 text-slate-600">
                  <li>Theoretical foundation and algorithmic formulations</li>
                  <li>Common university semester examination questions with step-by-step proofs</li>
                  <li>Complexity bounds and benchmark comparisons</li>
                </ul>
              </div>

              <div className="p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] font-mono text-[11px] text-slate-700">
                // Sample Academic Transcription Preview<br />
                void executeOptimization(Node* root) &#123;<br />
                &nbsp;&nbsp;if (!root) return;<br />
                &nbsp;&nbsp;// Solved step according to university syllabus standard<br />
                &#125;
              </div>
            </div>

            <div className="pt-4 border-t border-[#f1f5f9] flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>GitNote Academic Repository</span>
              <span>Page {currentPage} of {totalPages}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between text-xs">
          <Link
            href={`/resources/${resource.id}`}
            className="text-[#4f46e5] hover:text-[#4338ca] font-semibold flex items-center gap-1"
            onClick={onClose}
          >
            <span>Open Dedicated Document Reader</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <Button variant="outline" size="sm" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </div>
    </Modal>
  );
};
