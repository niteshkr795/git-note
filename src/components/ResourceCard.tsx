'use client';

import React from 'react';
import Link from 'next/link';
import { Resource } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { useResources } from '@/context/ResourceContext';
import {
  Bookmark,
  Download,
  Eye,
  Star,
  Calendar,
  GraduationCap,
  CheckCircle2,
} from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  onQuickPreview?: (resource: Resource) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onQuickPreview,
}) => {
  const { toggleBookmark, isBookmarked, mockDownload } = useResources();
  const bookmarked = isBookmarked(resource.id);

  return (
    <div className="group bg-white rounded-2xl border border-[#e2e8f0] hover:border-[#cbd5e1] hover:shadow-[0_10px_20px_-3px_rgba(79,70,229,0.08),0_4px_6px_-4px_rgba(15,23,42,0.04)] transition-all duration-200 flex flex-col justify-between overflow-hidden relative">
      {/* Top Hairline Indigo Accent Indicator */}
      <div className="h-1 w-full bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#38bdf8] opacity-75 group-hover:opacity-100 group-hover:h-1.5 transition-all" />

      <div className="p-5 flex-1 flex flex-col">
        {/* Header: Resource Type Pill, Semester Pill & Verified Indicator */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge resourceType={resource.resourceType}>
              {resource.resourceType}
            </Badge>

            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100/90 px-2.5 py-0.5 rounded-full border border-slate-200">
              {resource.semester}
            </span>

            {resource.uploader.verified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#047857] bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-[#10b981]" />
                <span>Verified</span>
              </span>
            )}
          </div>

          {/* Bookmark Toggle Action */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleBookmark(resource.id);
            }}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this resource'}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              bookmarked
                ? 'bg-[#fffbeb] text-[#b45309] border border-[#fde68a] hover:bg-[#fef3c7] shadow-xs'
                : 'text-slate-400 hover:text-[#4f46e5] hover:bg-[#eef2ff] border border-transparent'
            }`}
          >
            <Bookmark
              className={`w-4 h-4 ${bookmarked ? 'fill-[#f59e0b] text-[#f59e0b]' : ''}`}
            />
          </button>
        </div>

        {/* Resource Title */}
        <Link href={`/resources/${resource.id}`} className="group/title block mb-2">
          <h3 className="font-bold text-[#0f172a] text-base leading-snug tracking-tight group-hover/title:text-[#4f46e5] transition-colors line-clamp-2">
            {resource.title}
          </h3>
        </Link>

        {/* Subject Label Tag */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4338ca] bg-[#eef2ff] px-2.5 py-1 rounded-full w-fit mb-3 border border-[#e0e7ff]">
          <GraduationCap className="w-3.5 h-3.5 text-[#4f46e5] shrink-0" />
          <span className="truncate max-w-[200px]">{resource.subject}</span>
        </div>

        {/* Description Snippet */}
        <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed mb-4 flex-1">
          {resource.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {resource.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium text-slate-500 bg-[#f8fafc] hover:bg-slate-100 px-2 py-0.5 rounded-full border border-[#e2e8f0]"
            >
              #{tag}
            </span>
          ))}
          {resource.academicYear && (
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 px-1.5 py-0.5 ml-auto">
              <Calendar className="w-3 h-3 text-slate-400" />
              {resource.academicYear}
            </span>
          )}
        </div>
      </div>

      {/* Hairline Divider & Footer Content */}
      <div className="border-t border-[#f1f5f9] px-5 py-3 bg-[#faf8ff]/50 flex items-center justify-between gap-3 text-xs">
        {/* Contributor & Rating */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#4f46e5] to-[#7c3aed] flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-2xs">
            {resource.uploader.avatar ? (
              <img
                src={resource.uploader.avatar}
                alt={resource.uploader.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              resource.uploader.name.charAt(0)
            )}
          </div>
          <div className="truncate">
            <span className="block text-[11px] font-semibold text-[#0f172a] truncate">
              {resource.uploader.name}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-[#b45309] font-semibold">
              <Star className="w-3 h-3 fill-[#f59e0b] text-[#f59e0b]" />
              <span className="font-mono">{resource.rating.toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({resource.downloadCount} dl)</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Quick Preview & Direct Download */}
        <div className="flex items-center gap-1 shrink-0">
          {onQuickPreview && (
            <button
              type="button"
              onClick={() => onQuickPreview(resource)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-[#4f46e5] hover:bg-[#eef2ff] transition-colors cursor-pointer"
              title="Quick Preview Document"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => mockDownload(resource)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#f5f3ff] hover:bg-[#ede9fe] text-[#7c3aed] font-semibold text-xs border border-[#ddd6fe] transition-colors cursor-pointer"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
