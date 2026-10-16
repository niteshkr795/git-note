'use client';

import React, { useState, useEffect } from 'react';
import { Resource } from '@/types';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useResources } from '@/context/ResourceContext';
import { useAuth } from '@/context/AuthContext';
import { DeleteResourceModal } from '@/components/DeleteResourceModal';
import { PdfViewer } from '@/components/PdfViewer';
import { getResourceFileUrl, FileUrlResult } from '@/lib/pdfHelper';
import {
  Download,
  Bookmark,
  Share2,
  ExternalLink,
  Trash2,
  Loader2,
  AlertTriangle,
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
  const { user } = useAuth();
  const { toggleBookmark, isBookmarked, mockDownload, addToast, userProfile } = useResources();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(true);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Load actual file URL from Supabase Storage when opened
  useEffect(() => {
    if (!isOpen || !resource) {
      setFileUrl(null);
      setIsLoadingUrl(false);
      setUrlError(null);
      return;
    }

    let isSubscribed = true;
    let cleanupFn: (() => void) | undefined;

    async function loadUrl() {
      setIsLoadingUrl(true);
      setUrlError(null);

      const res: FileUrlResult = await getResourceFileUrl(resource!);
      if (!isSubscribed) return;

      if (res.url) {
        setFileUrl(res.url);
        cleanupFn = res.cleanUp;
      } else {
        setUrlError(res.error || 'Failed to load document file.');
      }
      setIsLoadingUrl(false);
    }

    loadUrl();

    return () => {
      isSubscribed = false;
      if (cleanupFn) cleanupFn();
    };
  }, [isOpen, resource]);

  if (!resource) return null;

  const isOwner = Boolean(
    (user && (resource.uploader.id === user.id || resource.uploader.name === (user.user_metadata?.full_name || user.email?.split('@')[0]))) ||
    (!user && (resource.uploader.id === userProfile.id || resource.uploader.name === userProfile.name))
  );

  const bookmarked = isBookmarked(resource.id);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.origin + `/resources/${resource.id}`);
      addToast('info', 'Link Copied', 'Resource link copied to your clipboard!');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="5xl">
      <div className="space-y-4 -m-2">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <Badge resourceType={resource.resourceType}>
                {resource.resourceType}
              </Badge>
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                {resource.semester}
              </span>
              <span className="text-xs text-[#4338ca] bg-[#eef2ff] px-2.5 py-0.5 rounded-full font-semibold border border-[#e0e7ff] truncate max-w-[200px]">
                {resource.subject}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#0f172a] line-clamp-1 tracking-tight">
              {resource.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
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
              type="button"
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
              Download ({resource.fileSize})
            </Button>

            {isOwner && (
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
                title="Delete this document"
                aria-label="Delete this document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Real PDF / Document Viewer */}
        <div className="min-h-[440px] flex flex-col justify-center">
          {isLoadingUrl ? (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 flex flex-col items-center justify-center text-center text-slate-400 min-h-[440px] space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-sm font-medium">Resolving document from storage...</p>
            </div>
          ) : urlError ? (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 sm:p-12 text-center text-slate-300 min-h-[440px] flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="max-w-md">
                <h3 className="text-base font-bold text-white">Preview Currently Unavailable</h3>
                <p className="text-xs text-slate-400 mt-1">{urlError}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Download className="w-4 h-4" />}
                  onClick={() => mockDownload(resource)}
                >
                  Download {resource.fileFormat} ({resource.fileSize})
                </Button>
              </div>
            </div>
          ) : (
            <PdfViewer
              url={fileUrl}
              title={resource.title}
              fileFormat={resource.fileFormat}
              fileSize={resource.fileSize}
              onDownload={() => mockDownload(resource)}
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between text-xs">
          <Link
            href={`/resources/${resource.id}`}
            className="text-[#4f46e5] hover:text-[#4338ca] font-semibold flex items-center gap-1"
            onClick={onClose}
          >
            <span>Open Dedicated Document Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <Button variant="outline" size="sm" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteResourceModal
        resource={resource}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDeleted={() => {
          setIsDeleteModalOpen(false);
          onClose();
        }}
      />
    </Modal>
  );
};
