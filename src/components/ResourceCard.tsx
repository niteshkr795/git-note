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
  FileText,
  Star,
  Calendar,
  Layers,
  GraduationCap,
  Sparkles,
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
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden relative">
      {/* Top Banner Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-teal-400 group-hover:h-2 transition-all" />

      <div className="p-5 flex-1 flex flex-col">
        {/* Badges Bar & Bookmark Button */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge resourceType={resource.resourceType}>
              {resource.resourceType}
            </Badge>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/70">
              {resource.semester}
            </span>
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {resource.academicYear}
            </span>
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
                ? 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 shadow-sm'
                : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent'
            }`}
          >
            <Bookmark
              className={`w-4 h-4 ${bookmarked ? 'fill-amber-500 text-amber-500' : ''}`}
            />
          </button>
        </div>

        {/* Resource Title */}
        <Link href={`/resources/${resource.id}`} className="group-hover:text-blue-600 transition-colors">
          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 mb-2">
            {resource.title}
          </h3>
        </Link>

        {/* Subject Label */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50/70 px-2.5 py-1 rounded-lg w-fit mb-3 border border-blue-100">
          <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate max-w-[220px]">{resource.subject}</span>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4 flex-1">
          {resource.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {resource.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-slate-500 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60 font-mono"
            >
              #{tag}
            </span>
          ))}
          {resource.tags.length > 3 && (
            <span className="text-[10px] text-slate-400 font-mono self-center">
              +{resource.tags.length - 3} more
            </span>
          )}
        </div>

        {/* File Metadata & Rating */}
        <div className="flex items-center justify-between text-xs text-slate-500 py-2.5 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
              <FileText className="w-3 h-3 text-red-500" />
              {resource.fileFormat} • {resource.fileSize}
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <Download className="w-3 h-3 text-slate-400" />
              {resource.downloadCount}
            </span>
          </div>

          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50/60 px-2 py-0.5 rounded border border-amber-100">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{resource.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Card Footer: Uploader & Primary Actions */}
      <div className="bg-slate-50/90 px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-3">
        {/* Uploader Info */}
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={resource.uploader.avatar}
            alt={resource.uploader.name}
            className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-300 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">
              {resource.uploader.name}
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              {resource.uploader.college.split(' ')[0]}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onQuickPreview && (
            <button
              type="button"
              onClick={() => onQuickPreview(resource)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              title="Quick Preview"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          <Link
            href={`/resources/${resource.id}`}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-white rounded-lg border border-slate-200/80 transition-colors"
          >
            Details
          </Link>

          <button
            type="button"
            onClick={() => mockDownload(resource)}
            className="flex items-center gap-1 px-3 py-1 bg-[#0a1128] hover:bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
            title="Download document"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Get</span>
          </button>
        </div>
      </div>
    </div>
  );
};
