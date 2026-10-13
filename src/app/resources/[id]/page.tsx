'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useResources } from '@/context/ResourceContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ReportModal } from '@/components/ReportModal';
import { ResourceCard } from '@/components/ResourceCard';
import {
  FileText,
  Download,
  Bookmark,
  Share2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Calendar,
  Layers,
  GraduationCap,
  Star,
  Eye,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';

function ResourceDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const resourceId = params?.id as string;
  const { resources, toggleBookmark, isBookmarked, mockDownload, addToast } = useResources();

  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const resource = resources.find((r) => r.id === resourceId);

  if (!resource) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Resource Not Found</h2>
        <p className="text-slate-500 mb-6 text-sm">
          The requested academic document could not be located or may have been updated.
        </p>
        <Link href="/">
          <Button variant="primary">Return to Explore</Button>
        </Link>
      </div>
    );
  }

  const bookmarked = isBookmarked(resource.id);
  const totalPages = resource.pageCount || 16;

  // Find related resources in the same subject or semester
  const relatedResources = resources
    .filter((r) => r.id !== resource.id && (r.subject === resource.subject || r.semester === resource.semester))
    .slice(0, 3);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      addToast('info', 'Link Copied', 'Resource URL copied to your clipboard!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 hover:text-slate-900 font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        <span>/</span>
        <Link href="/" className="hover:text-slate-900 transition-colors">
          Explore
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-semibold truncate max-w-xs">
          {resource.subject}
        </span>
      </div>

      {/* Resource Title & Primary Actions Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            {/* Badges Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge resourceType={resource.resourceType} size="md">
                {resource.resourceType}
              </Badge>
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                {resource.semester}
              </span>
              <span className="text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {resource.academicYear}
              </span>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified Syllabus
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {resource.title}
            </h1>

            {/* Subject */}
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 bg-blue-50/70 px-3 py-1.5 rounded-xl w-fit border border-blue-100">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>{resource.subject}</span>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <FileText className="w-4 h-4 text-rose-500" />
                {resource.fileFormat} • {resource.fileSize} • {totalPages} Pages
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Download className="w-4 h-4 text-slate-400" />
                {resource.downloadCount} downloads
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-slate-400" />
                {resource.viewCount} views
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {resource.rating.toFixed(1)} / 5.0
              </span>
            </div>
          </div>

          {/* Action Buttons Box */}
          <div className="flex flex-wrap sm:flex-col gap-2.5 shrink-0 min-w-[200px]">
            <Button
              variant="primary"
              size="lg"
              onClick={() => mockDownload(resource)}
              leftIcon={<Download className="w-5 h-5" />}
              className="w-full shadow-md"
            >
              Download PDF ({resource.fileSize})
            </Button>

            <div className="grid grid-cols-2 gap-2 w-full">
              <Button
                variant={bookmarked ? 'teal' : 'outline'}
                size="md"
                onClick={() => toggleBookmark(resource.id)}
                leftIcon={
                  <Bookmark
                    className={`w-4 h-4 ${bookmarked ? 'fill-white text-white' : ''}`}
                  />
                }
              >
                {bookmarked ? 'Saved' : 'Bookmark'}
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={handleShare}
                leftIcon={<Share2 className="w-4 h-4" />}
              >
                Share
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setIsReportOpen(true)}
              className="w-full text-center text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Report Resource</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Document Preview & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Interactive PDF Viewer Canvas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-xl flex flex-col">
            {/* Viewer Control Bar */}
            <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="font-mono text-slate-300 font-semibold truncate max-w-[220px]">
                  {resource.title.slice(0, 36)}...pdf
                </span>
              </div>

              {/* Page Selector */}
              <div className="flex items-center gap-3">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer text-slate-300"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs text-slate-300">
                  Page <strong className="text-white">{currentPage}</strong> of {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer text-slate-300"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-mono text-[11px] text-slate-400 w-10 text-center">
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Render Area */}
            <div className="p-4 sm:p-10 bg-slate-800/80 overflow-y-auto max-h-[620px] flex justify-center">
              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 max-w-2xl w-full text-slate-800 border border-slate-200 min-h-[560px] transition-transform duration-150 flex flex-col justify-between"
              >
                <div>
                  {/* Academic Document Header */}
                  <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block">
                        GitNote Academic Archive • Verified Solution
                      </span>
                      <h2 className="font-bold text-slate-900 text-base">{resource.subject}</h2>
                      <span className="text-xs text-slate-500 font-medium">
                        {resource.semester} • Session {resource.academicYear}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300 font-mono">
                        DOC: {resource.id.toUpperCase()}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-1">Page {currentPage}</span>
                    </div>
                  </div>

                  {/* Document Body Sample */}
                  <div className="space-y-4 text-xs font-serif leading-relaxed text-slate-700">
                    <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 text-xs font-sans">
                      <strong className="text-blue-900 flex items-center gap-1.5 font-semibold">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        Executive Summary & Examination Weightage:
                      </strong>
                      <p className="text-slate-600 mt-1 leading-relaxed">
                        {resource.previewContent?.summary}
                      </p>
                    </div>

                    <div className="font-sans pt-1">
                      <span className="font-bold text-slate-900 text-xs block mb-1.5">
                        Key Exam Questions Covered in this Sheet:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {resource.previewContent?.keyTopics.map((item, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200"
                          >
                            • {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 font-mono">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                        Transcript Preview (Page {currentPage})
                      </span>
                      <pre className="text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/90 whitespace-pre-wrap text-slate-800 leading-relaxed font-mono">
                        {resource.previewContent?.sampleText}
                      </pre>
                    </div>

                    {resource.previewContent?.diagramType && (
                      <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-slate-600 font-sans text-xs">
                        <Layers className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                        <span className="font-bold text-slate-800">
                          [Technical Figure]: {resource.previewContent.diagramType}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          High-resolution vector schematic available in full download
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Stamp on Page */}
                <div className="border-t border-slate-200 pt-4 mt-8 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>GitNote Verified Academic Material</span>
                  <span>Uploader: {resource.uploader.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Detailed Information Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Resource Description</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {resource.description}
            </p>

            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Topic Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Uploader Info & Related Resources */}
        <div className="space-y-6">
          {/* Uploader Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Contributed By
            </h3>

            <div className="flex items-center gap-3">
              <img
                src={resource.uploader.avatar}
                alt={resource.uploader.name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-500/20"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900 text-sm">
                    {resource.uploader.name}
                  </h4>
                  {resource.uploader.verified && (
                    <span title="Verified College Student">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-50" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{resource.uploader.branch}</p>
                <p className="text-[11px] text-slate-400">{resource.uploader.college}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Student Semester:</span>
              <span className="font-semibold text-slate-800">{resource.uploader.semester}</span>
            </div>

            <Link
              href="/profile"
              className="inline-flex items-center justify-center w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
            >
              View Contributor Profile
            </Link>
          </div>

          {/* Related Resources */}
          {relatedResources.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Related Study Materials
              </h3>

              <div className="space-y-3">
                {relatedResources.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/resources/${rel.id}`}
                    className="block p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Badge resourceType={rel.resourceType} size="sm">
                        {rel.resourceType}
                      </Badge>
                      <span className="text-[10px] text-slate-500">{rel.semester}</span>
                    </div>
                    <h5 className="font-bold text-xs text-slate-800 line-clamp-1">
                      {rel.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {rel.downloadCount} downloads • ★ {rel.rating.toFixed(1)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Resource Dialog */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        resourceId={resource.id}
        resourceTitle={resource.title}
      />
    </div>
  );
}

export default function ResourceDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400 font-medium">
          Loading academic document...
        </div>
      }
    >
      <ResourceDetailsContent />
    </Suspense>
  );
}

