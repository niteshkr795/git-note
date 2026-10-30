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
        setUrlError(res.error || 'Failed to resolve document file link.');
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
      addToast('info', 'Link Copied', 'Resource citation link copied to clipboard.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="5xl">
      <div className="space-y-4">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#eeece6]">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <Badge resourceType={resource.resourceType} size="sm">
                {resource.resourceType}
              </Badge>
              <span className="text-[11px] font-mono text-[#52525b] bg-[#f4f2ee] px-2 py-0.5 rounded border border-[#e5e2db]">
                {resource.semester}
              </span>
              <span className="text-xs text-[#52525b] truncate max-w-[200px]">
                {resource.subject}
              </span>
            </div>
            <h2 className="font-editorial text-base sm:text-lg font-semibold text-[#18181b] line-clamp-1 tracking-tight">
              {resource.title}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => toggleBookmark(resource.id)}
              className={`p-1.5 rounded transition-colors cursor-pointer border ${
                bookmarked
                  ? 'bg-[#fef9ee] text-[#b45309] border-[#fde68a]'
                  : 'text-[#71717a] hover:bg-[#f4f2ee] border-[#e5e2db]'
              }`}
              title={bookmarked ? 'Saved to Bookmarks' : 'Bookmark'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-[#b45309] text-[#b45309]' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 rounded text-[#71717a] hover:bg-[#f4f2ee] border border-[#e5e2db] transition-colors cursor-pointer"
              title="Copy citation link"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={() => mockDownload(resource)}
            >
              Download ({resource.fileSize})
            </Button>

            {isOwner && (
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-1.5 rounded text-[#991b1b] hover:bg-[#fef2f2] border border-[#fecaca] transition-colors cursor-pointer"
                title="Delete document"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="min-h-[420px] flex flex-col justify-center">
          {isLoadingUrl ? (
            <div className="bg-[#18181b] rounded-md border border-[#27272a] p-12 flex flex-col items-center justify-center text-center text-[#a1a1aa] min-h-[420px] space-y-2.5">
              <Loader2 className="w-6 h-6 text-[#1d3b64] animate-spin" />
              <p className="text-xs font-mono">Resolving document from repository...</p>
            </div>
          ) : urlError ? (
            <div className="bg-[#18181b] border border-[#3f3f46] rounded-md p-8 text-center text-[#d4d4d8] min-h-[420px] flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 rounded bg-[#fef2f2]/10 border border-[#fecaca]/20 text-[#f87171] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="max-w-sm">
                <h3 className="text-sm font-medium text-white">Preview Currently Unavailable</h3>
                <p className="text-xs text-[#a1a1aa] mt-1">{urlError}</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Download className="w-3.5 h-3.5" />}
                onClick={() => mockDownload(resource)}
              >
                Download Directly
              </Button>
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
        <div className="pt-2 border-t border-[#eeece6] flex items-center justify-between text-xs">
          <Link
            href={`/resources/${resource.id}`}
            className="text-[#1d3b64] hover:underline font-medium flex items-center gap-1"
            onClick={onClose}
          >
            <span>Open Dedicated Document Record</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {isDeleteModalOpen && (
        <DeleteResourceModal
          resource={resource}
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDeleted={() => {
            setIsDeleteModalOpen(false);
            onClose();
          }}
        />
      )}
    </Modal>
  );
};
