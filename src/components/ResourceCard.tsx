'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Resource } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { useResources } from '@/context/ResourceContext';
import { useAuth } from '@/context/AuthContext';
import { DeleteResourceModal } from '@/components/DeleteResourceModal';
import { QuickPreviewModal } from '@/components/QuickPreviewModal';
import {
  Bookmark,
  Download,
  Eye,
  Calendar,
  GraduationCap,
  CheckCircle2,
  Trash2,
  FileText,
} from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  onQuickPreview?: (resource: Resource) => void;
  canDelete?: boolean;
  onDelete?: (resource: Resource) => void;
  layout?: 'grid' | 'list';
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onQuickPreview,
  canDelete,
  onDelete,
  layout = 'grid',
}) => {
  const { user } = useAuth();
  const { toggleBookmark, isBookmarked, mockDownload, userProfile } = useResources();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInternalPreviewOpen, setIsInternalPreviewOpen] = useState(false);
  const bookmarked = isBookmarked(resource.id);

  const isOwner = Boolean(
    canDelete ||
      (user && (resource.uploader.id === user.id || resource.uploader.name === (user.user_metadata?.full_name || user.email?.split('@')[0]))) ||
      (!user && (resource.uploader.id === userProfile.id || resource.uploader.name === userProfile.name))
  );

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    mockDownload(resource);
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickPreview) {
      onQuickPreview(resource);
    } else {
      setIsInternalPreviewOpen(true);
    }
  };

  // Compact List/Table Row Layout
  if (layout === 'list') {
    return (
      <div className="group bg-white border border-[#e5e2db] hover:border-[#c9c4b8] rounded-md p-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:shadow-xs">
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded bg-[#f4f2ee] border border-[#e5e2db] flex items-center justify-center shrink-0 text-[#1d3b64]">
            <FileText className="w-4 h-4 stroke-[1.75]" />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge resourceType={resource.resourceType} size="sm">
                {resource.resourceType}
              </Badge>
              <span className="text-[11px] font-mono text-[#71717a] bg-[#f4f2ee] px-1.5 py-0.5 rounded border border-[#e5e2db]">
                {resource.semester}
              </span>
              <span className="text-xs text-[#52525b] font-medium truncate max-w-[180px]">
                {resource.subject}
              </span>
            </div>

            <Link href={`/resources/${resource.id}`} className="block">
              <h3 className="font-editorial text-sm font-semibold text-[#18181b] group-hover:text-[#1d3b64] transition-colors truncate">
                {resource.title}
              </h3>
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 text-xs text-[#71717a] pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f4f2ee]">
          <span className="text-[11px] font-mono text-[#71717a]">{resource.fileFormat} • {resource.fileSize}</span>

          <span className="hidden md:inline-block text-[11px] text-[#52525b] truncate max-w-[120px]">
            {resource.uploader.name}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePreviewClick}
              title="Quick preview"
              className="p-1.5 rounded text-[#71717a] hover:text-[#18181b] hover:bg-[#f4f2ee] transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleDownloadClick}
              title="Download file"
              className="p-1.5 rounded text-[#71717a] hover:text-[#1d3b64] hover:bg-[#eef3f8] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleBookmark(resource.id);
              }}
              title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
              className={`p-1.5 rounded transition-colors ${
                bookmarked ? 'text-[#b45309] bg-[#fef3c7]' : 'text-[#71717a] hover:text-[#18181b] hover:bg-[#f4f2ee]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-[#b45309]' : ''}`} />
            </button>

            {isOwner && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDeleteModalOpen(true);
                }}
                title="Delete resource"
                className="p-1.5 rounded text-[#991b1b] hover:bg-[#fef2f2] transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {isDeleteModalOpen && (
          <DeleteResourceModal
            resource={resource}
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onDeleted={(deleted) => {
              setIsDeleteModalOpen(false);
              if (onDelete) onDelete(deleted);
            }}
          />
        )}
      </div>
    );
  }

  // Standard Editorial Catalog Card Layout
  return (
    <div className="group bg-white border border-[#e5e2db] hover:border-[#c9c4b8] rounded-md transition-all duration-150 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-xs">
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Top Header: Metadata Badges & Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge resourceType={resource.resourceType} size="sm">
              {resource.resourceType}
            </Badge>

            <span className="text-[11px] font-mono text-[#52525b] bg-[#f4f2ee] px-2 py-0.5 rounded border border-[#e5e2db]">
              {resource.semester}
            </span>

            {resource.uploader.verified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#166534] bg-[#f0fdf4] border border-[#bbf7d0] px-1.5 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3 text-[#166534]" />
                <span>Verified</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleBookmark(resource.id);
            }}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this resource'}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              bookmarked
                ? 'bg-[#fef9ee] text-[#b45309] border border-[#fde68a]'
                : 'text-[#71717a] hover:text-[#18181b] hover:bg-[#f4f2ee] border border-transparent'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-[#b45309] text-[#b45309]' : ''}`} />
          </button>
        </div>

        {/* Resource Title */}
        <Link href={`/resources/${resource.id}`} className="block mb-2 group/title">
          <h3 className="font-editorial text-[15px] font-semibold text-[#18181b] leading-snug group-hover/title:text-[#1d3b64] transition-colors line-clamp-2">
            {resource.title}
          </h3>
        </Link>

        {/* Subject Label */}
        <div className="flex items-center gap-1.5 text-xs text-[#52525b] mb-2.5">
          <GraduationCap className="w-3.5 h-3.5 text-[#71717a] shrink-0" />
          <span className="font-medium truncate max-w-[240px]">{resource.subject}</span>
        </div>

        {/* Description Snippet */}
        <p className="text-xs text-[#71717a] line-clamp-2 leading-relaxed mb-4 flex-1">
          {resource.description}
        </p>

        {/* Tags & Academic Year */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2 text-[11px] text-[#71717a]">
          {resource.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] text-[#52525b] bg-[#faf9f7] px-1.5 py-0.5 rounded border border-[#e5e2db]"
            >
              #{tag}
            </span>
          ))}

          {resource.academicYear && (
            <span className="font-mono text-[10px] text-[#71717a] ml-auto flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#a1a1aa]" />
              {resource.academicYear}
            </span>
          )}
        </div>
      </div>

      {/* Hairline Divider & Footer Content */}
      <div className="border-t border-[#eeece6] px-4 sm:px-5 py-2.5 bg-[#fbfaf8] flex items-center justify-between gap-3 text-xs">
        {/* Contributor Byline */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded bg-[#1d3b64] text-white flex items-center justify-center text-[10px] font-mono font-medium shrink-0 overflow-hidden">
            {resource.uploader.avatar ? (
              <img
                src={resource.uploader.avatar}
                alt={resource.uploader.name}
                className="w-full h-full object-cover"
              />
            ) : (
              resource.uploader.name.charAt(0).toUpperCase()
            )}
          </div>
          <span className="text-[11px] font-medium text-[#52525b] truncate max-w-[130px]">
            {resource.uploader.name}
          </span>
        </div>

        {/* Actions & File Metadata */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] font-mono text-[#71717a] mr-1">
            {resource.fileFormat} • {resource.fileSize}
          </span>

          <button
            type="button"
            onClick={handlePreviewClick}
            title="Quick preview"
            className="p-1 rounded text-[#71717a] hover:text-[#18181b] hover:bg-[#f4f2ee] transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleDownloadClick}
            title="Download document"
            className="p-1 rounded text-[#71717a] hover:text-[#1d3b64] hover:bg-[#eef3f8] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {isOwner && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDeleteModalOpen(true);
              }}
              title="Delete resource"
              className="p-1 rounded text-[#991b1b] hover:bg-[#fef2f2] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {isInternalPreviewOpen && (
        <QuickPreviewModal
          resource={resource}
          isOpen={isInternalPreviewOpen}
          onClose={() => setIsInternalPreviewOpen(false)}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteResourceModal
          resource={resource}
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDeleted={(deleted) => {
            setIsDeleteModalOpen(false);
            if (onDelete) onDelete(deleted);
          }}
        />
      )}
    </div>
  );
};
