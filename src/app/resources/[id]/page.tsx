'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useResources } from '@/context/ResourceContext';
import { useAuth } from '@/context/AuthContext';
import { Resource } from '@/types';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ReportModal } from '@/components/ReportModal';
import { DeleteResourceModal } from '@/components/DeleteResourceModal';
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
  Trash2,
} from 'lucide-react';

function ResourceDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const resourceId = params?.id as string;
  const { user } = useAuth();
  const { resources, toggleBookmark, isBookmarked, mockDownload, addToast, userProfile } = useResources();

  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [dbResource, setDbResource] = useState<Resource | null>(null);
  const [loadingDb, setLoadingDb] = useState(false);

  useEffect(() => {
    const existing = resources.find((r) => r.id === resourceId);
    if (!existing && resourceId) {
      setLoadingDb(true);
      supabase
        .from('resources')
        .select(`
          id,
          title,
          description,
          resource_type,
          subject_name,
          semester,
          academic_year,
          file_format,
          file_size,
          page_count,
          download_count,
          view_count,
          rating,
          tags,
          is_verified,
          created_at,
          uploader:profiles!uploader_id (
            id,
            full_name,
            college,
            branch,
            semester,
            avatar_url,
            is_verified
          )
        `)
        .eq('id', resourceId)
        .maybeSingle()
        .then(({ data, error }) => {
          if (data && !error) {
            const uploaderData = Array.isArray(data.uploader) ? data.uploader[0] : data.uploader;
            setDbResource({
              id: data.id,
              title: data.title,
              description: data.description || 'No description provided.',
              subject: data.subject_name,
              semester: data.semester as any,
              resourceType: data.resource_type as any,
              academicYear: data.academic_year as any,
              fileFormat: (data.file_format || 'PDF') as any,
              fileSize: data.file_size || '1.0 MB',
              pageCount: data.page_count || 12,
              downloadCount: data.download_count ?? 0,
              viewCount: data.view_count ?? 0,
              rating: Number(data.rating) || 5.0,
              createdAt: data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : '',
              tags: data.tags || [],
              uploader: {
                id: (uploaderData as any)?.id || 'contributor',
                name: (uploaderData as any)?.full_name || 'Student Contributor',
                avatar: (uploaderData as any)?.avatar_url || '',
                college: (uploaderData as any)?.college || 'SRMCEM Lucknow',
                branch: (uploaderData as any)?.branch || 'Computer Science & Engineering',
                semester: (uploaderData as any)?.semester || data.semester || 'Semester 4',
                verified: Boolean((uploaderData as any)?.is_verified ?? data.is_verified),
              },
              isVerified: Boolean(data.is_verified),
              previewContent: {
                summary: (data.description || data.title).slice(0, 160) + '...',
                keyTopics: data.tags && data.tags.length > 0 ? data.tags : ['Unit Overview', 'Important Concepts'],
                sampleText: `Title: ${data.title}\nSubject: ${data.subject_name}\n\nDocument cataloged in GitNote academic repository.`,
              },
            });
          }
          setLoadingDb(false);
        });
    }
  }, [resourceId, resources]);

  const resource = resources.find((r) => r.id === resourceId) || dbResource;

  if (loadingDb) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-[#4f46e5]/20 border-t-[#4f46e5] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-medium text-sm">Loading academic document from repository...</p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-[#0f172a] mb-2 tracking-tight">Resource Not Found</h2>
        <p className="text-[#475569] mb-6 text-sm">
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

  // Determine if the currently signed-in user uploaded this document
  const isOwner = Boolean(
    (user && (resource.uploader.id === user.id || resource.uploader.name === (user.user_metadata?.full_name || user.email?.split('@')[0]))) ||
    (!user && (resource.uploader.id === userProfile.id || resource.uploader.name === userProfile.name))
  );

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 bg-[#faf8ff]">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 hover:text-[#0f172a] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        <span>/</span>
        <Link href="/" className="hover:text-[#0f172a] transition-colors">
          Explore Library
        </Link>
        <span>/</span>
        <span className="text-[#4338ca] bg-[#eef2ff] px-2 py-0.5 rounded-full font-semibold border border-[#e0e7ff] truncate max-w-xs">
          {resource.subject}
        </span>
      </div>

      {/* Resource Title & Primary Actions Header */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            {/* Badges Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge resourceType={resource.resourceType} size="md">
                {resource.resourceType}
              </Badge>
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {resource.semester}
              </span>
              <span className="text-xs text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200/80 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {resource.academicYear}
              </span>
              <span className="text-xs text-[#047857] bg-[#ecfdf5] px-3 py-1 rounded-full border border-[#a7f3d0] flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
                Verified Syllabus
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight leading-snug">
              {resource.title}
            </h1>

            {/* Subject */}
            <div className="flex items-center gap-2 text-xs font-semibold text-[#4338ca] bg-[#eef2ff] px-3 py-1.5 rounded-full w-fit border border-[#e0e7ff]">
              <GraduationCap className="w-4 h-4 text-[#4f46e5]" />
              <span>{resource.subject}</span>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#475569] pt-2 border-t border-[#f1f5f9]">
              <span className="flex items-center gap-1 font-semibold text-[#0f172a]">
                <FileText className="w-4 h-4 text-[#4f46e5]" />
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
              <span className="flex items-center gap-1 text-[#b45309] font-bold bg-[#fffbeb] px-2 py-0.5 rounded-full border border-[#fde68a]">
                <Star className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b]" />
                {resource.rating.toFixed(1)} / 5.0
              </span>
            </div>
          </div>

          {/* Action Buttons Box */}
          <div className="flex flex-wrap sm:flex-col gap-2.5 shrink-0 min-w-[220px]">
            <Button
              variant="primary"
              size="lg"
              onClick={() => mockDownload(resource)}
              leftIcon={<Download className="w-5 h-5" />}
              className="w-full shadow-sm"
            >
              Download PDF ({resource.fileSize})
            </Button>

            <div className="grid grid-cols-2 gap-2 w-full">
              <Button
                variant={bookmarked ? 'emerald' : 'outline'}
                size="md"
                onClick={() => toggleBookmark(resource.id)}
                leftIcon={
                  <Bookmark
                    className={`w-4 h-4 ${bookmarked ? 'fill-[#047857] text-[#047857]' : ''}`}
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

            {isOwner && (
              <Button
                variant="danger"
                size="md"
                onClick={() => setIsDeleteModalOpen(true)}
                leftIcon={<Trash2 className="w-4 h-4" />}
                className="w-full shadow-xs font-semibold"
              >
                Delete Document
              </Button>
            )}

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

      {/* Main 12-Column Grid: Document Preview & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (8-col approx): Interactive PDF Viewer Canvas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0f172a] rounded-2xl overflow-hidden border border-white/10 shadow-xl flex flex-col">
            {/* Viewer Control Bar */}
            <div className="bg-[#0b0f19] px-5 py-3 border-b border-white/10 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#4f46e5]" />
                <span className="font-mono text-slate-300 font-semibold truncate max-w-[220px]">
                  {resource.title.slice(0, 36)}...pdf
                </span>
              </div>

              {/* Page Selector */}
              <div className="flex items-center gap-3">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-40 transition-colors cursor-pointer text-slate-300"
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
                  className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-40 transition-colors cursor-pointer text-slate-300"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-mono text-[11px] text-slate-400 w-10 text-center">
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Render Area */}
            <div className="p-4 sm:p-10 bg-[#1e293b]/70 overflow-y-auto max-h-[620px] flex justify-center">
              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className="bg-white rounded-xl shadow-xl p-8 sm:p-12 max-w-2xl w-full text-slate-800 border border-[#e2e8f0] min-h-[560px] transition-transform duration-150 flex flex-col justify-between"
              >
                <div>
                  {/* Academic Document Header */}
                  <div className="border-b-2 border-[#0f172a] pb-4 mb-6 flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#4f46e5] block">
                        GitNote Academic Repository • Verified Syllabus
                      </span>
                      <h2 className="font-bold text-[#0f172a] text-base">{resource.subject}</h2>
                      <span className="text-xs text-slate-500 font-medium">
                        {resource.semester} • Academic Session {resource.academicYear}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold bg-[#eef2ff] text-[#4338ca] px-2 py-0.5 rounded-full border border-[#e0e7ff] font-mono">
                        DOC: {resource.id.toUpperCase()}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-1">Page {currentPage}</span>
                    </div>
                  </div>

                  {/* Document Body Sample */}
                  <div className="space-y-4 text-xs font-serif leading-relaxed text-slate-700">
                    <div className="bg-[#eef2ff]/70 p-3.5 rounded-xl border border-[#e0e7ff] text-xs font-sans">
                      <strong className="text-[#312e81] flex items-center gap-1.5 font-semibold">
                        <Sparkles className="w-4 h-4 text-[#4f46e5]" />
                        Executive Summary & Exam Weightage:
                      </strong>
                      <p className="text-[#475569] mt-1 leading-relaxed">
                        {resource.previewContent?.summary}
                      </p>
                    </div>

                    <div className="font-sans pt-1">
                      <span className="font-bold text-[#0f172a] text-xs block mb-1.5">
                        Key Exam Questions Covered in this Sheet:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {resource.previewContent?.keyTopics.map((item, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-full border border-slate-200"
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
                      <pre className="text-xs bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0] whitespace-pre-wrap text-[#0f172a] leading-relaxed font-mono">
                        {resource.previewContent?.sampleText}
                      </pre>
                    </div>

                    {resource.previewContent?.diagramType && (
                      <div className="p-4 bg-[#faf8ff] border border-dashed border-[#cbd5e1] rounded-xl text-center text-slate-600 font-sans text-xs">
                        <Layers className="w-6 h-6 mx-auto mb-1 text-[#4f46e5]" />
                        <span className="font-bold text-[#0f172a]">
                          [Technical Figure]: {resource.previewContent.diagramType}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          High-resolution schematic available in complete downloaded PDF
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Stamp on Page */}
                <div className="border-t border-[#f1f5f9] pt-4 mt-8 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>GitNote Academic Repository</span>
                  <span>Uploader: {resource.uploader.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Detailed Information Card */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-[#0f172a] tracking-tight">Resource Description</h3>
            <p className="text-sm text-[#475569] leading-relaxed">
              {resource.description}
            </p>

            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Topic Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-mono text-slate-600 bg-[#f8fafc] px-3 py-1 rounded-full border border-[#e2e8f0]"
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
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Contributed By
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#4f46e5] to-[#7c3aed] flex items-center justify-center text-sm font-bold text-white shadow-xs">
                {resource.uploader.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-[#0f172a] text-sm">
                    {resource.uploader.name}
                  </h4>
                  {resource.uploader.verified && (
                    <span title="Verified College Student">
                      <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#475569]">{resource.uploader.branch}</p>
                <p className="text-[11px] text-slate-400">{resource.uploader.college}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-xs">
              <span className="text-[#475569]">Student Semester:</span>
              <span className="font-semibold text-[#0f172a]">{resource.uploader.semester}</span>
            </div>

            <Link
              href="/profile"
              className="inline-flex items-center justify-center w-full py-2.5 px-3 rounded-xl bg-[#f8fafc] hover:bg-slate-100 text-[#0f172a] font-semibold text-xs border border-[#e2e8f0] transition-colors"
            >
              View Contributor Profile
            </Link>
          </div>

          {/* Related Resources */}
          {relatedResources.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#4f46e5]" />
                Related Curriculum Materials
              </h3>

              <div className="space-y-3">
                {relatedResources.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/resources/${rel.id}`}
                    className="block p-3 rounded-xl border border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-[#faf8ff] transition-all"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Badge resourceType={rel.resourceType} size="sm">
                        {rel.resourceType}
                      </Badge>
                      <span className="text-[10px] text-slate-500">{rel.semester}</span>
                    </div>
                    <h5 className="font-bold text-xs text-[#0f172a] line-clamp-1">
                      {rel.title}
                    </h5>
                    <p className="text-[11px] text-[#475569] mt-0.5">
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

      {/* Delete Resource Confirmation Dialog */}
      <DeleteResourceModal
        resource={resource}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDeleted={() => {
          router.push('/profile?tab=uploads');
        }}
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
