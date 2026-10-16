'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useResources } from '@/context/ResourceContext';
import { useAuth } from '@/context/AuthContext';
import { Resource } from '@/types';
import { supabase } from '@/lib/supabase';
import { formatFileSize } from '@/lib/formatters';
import { normalizeSemester } from '@/data/mockData';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ReportModal } from '@/components/ReportModal';
import { DeleteResourceModal } from '@/components/DeleteResourceModal';
import { QuickPreviewModal } from '@/components/QuickPreviewModal';
import { PdfViewer } from '@/components/PdfViewer';
import { getResourceFileUrl } from '@/lib/pdfHelper';
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
          file_size_bytes,
          storage_path,
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
        .then(async ({ data, error }) => {
          let resourceData = data;
          if (error) {
            const fallback = await supabase
              .from('resources')
              .select('*')
              .eq('id', resourceId)
              .maybeSingle();
            if (!fallback.error && fallback.data) {
              resourceData = fallback.data as any;
            }
          }

          if (resourceData) {
            const uploaderData = Array.isArray(resourceData.uploader) ? resourceData.uploader[0] : resourceData.uploader;
            const resourceSem = normalizeSemester(
              resourceData.semester,
              normalizeSemester((uploaderData as any)?.semester, 'Semester 1')
            );

            setDbResource({
              id: resourceData.id,
              title: resourceData.title,
              description: resourceData.description || 'No description provided.',
              subject: resourceData.subject_name || (resourceData as any).subject || 'General Engineering',
              semester: resourceSem as any,
              resourceType: resourceData.resource_type as any,
              academicYear: resourceData.academic_year as any,
              fileFormat: (resourceData.file_format || 'PDF') as any,
              fileSize: formatFileSize(resourceData.file_size_bytes, resourceData.file_size),
              fileSizeBytes: resourceData.file_size_bytes || undefined,
              storagePath: resourceData.storage_path || undefined,
              pageCount: resourceData.page_count || 12,
              downloadCount: resourceData.download_count ?? 0,
              viewCount: resourceData.view_count ?? 0,
              rating: Number(resourceData.rating) || 5.0,
              createdAt: resourceData.created_at ? new Date(resourceData.created_at).toISOString().split('T')[0] : '',
              tags: resourceData.tags || [],
              uploader: {
                id: (uploaderData as any)?.id || 'contributor',
                name: (uploaderData as any)?.full_name || 'Student Contributor',
                avatar: (uploaderData as any)?.avatar_url || '',
                college: (uploaderData as any)?.college || 'SRMCEM Lucknow',
                branch: (uploaderData as any)?.branch || 'Computer Science & Engineering',
                semester: normalizeSemester((uploaderData as any)?.semester, resourceSem),
                verified: Boolean((uploaderData as any)?.is_verified ?? resourceData.is_verified),
              },
              isVerified: Boolean(resourceData.is_verified),
              previewContent: {
                summary: (resourceData.description || resourceData.title).slice(0, 160) + '...',
                keyTopics: resourceData.tags && resourceData.tags.length > 0 ? resourceData.tags : ['Unit Overview', 'Important Concepts'],
                sampleText: `Title: ${resourceData.title}\nSubject: ${resourceData.subject_name || (resourceData as any).subject || 'General'}\n\nDocument cataloged in GitNote academic repository.`,
              },
            });
          }
          setLoadingDb(false);
        });
    }
  }, [resourceId, resources]);

  const resource = resources.find((r) => r.id === resourceId) || dbResource;

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  useEffect(() => {
    if (!resource) return;

    let isSubscribed = true;
    let cleanupFn: (() => void) | undefined;

    async function loadFileUrl() {
      if (!resource) return;
      const res = await getResourceFileUrl(resource);
      if (!isSubscribed) return;
      if (res.url) {
        setFileUrl(res.url);
        cleanupFn = res.cleanUp;
      }
    }

    loadFileUrl();

    return () => {
      isSubscribed = false;
      if (cleanupFn) cleanupFn();
    };
  }, [resource?.id, resource?.storagePath]);

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
          <div className="flex flex-col gap-2.5 shrink-0 min-w-[220px]">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsPreviewModalOpen(true)}
              leftIcon={<Eye className="w-5 h-5" />}
              className="w-full shadow-sm bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 font-semibold"
            >
              Preview Document
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => mockDownload(resource)}
              leftIcon={<Download className="w-5 h-5 text-indigo-600" />}
              className="w-full shadow-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-semibold"
            >
              Download ({resource.fileSize})
            </Button>

            <div className="grid grid-cols-2 gap-2 w-full mt-1">
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
        {/* Left Column (8-col approx): Real Interactive PDF Viewer & Summary */}
        <div className="lg:col-span-2 space-y-6">
          <PdfViewer
            url={fileUrl}
            title={resource.title}
            fileFormat={resource.fileFormat}
            fileSize={resource.fileSize}
            onDownload={() => mockDownload(resource)}
          />

          {/* Academic Synopsis & Exam Topics Card */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 sm:p-8 space-y-5 shadow-xs">
            <h3 className="text-base font-bold text-[#0f172a] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4f46e5]" />
              <span>Syllabus Topics & Document Synopsis</span>
            </h3>

            <div className="bg-[#faf8ff] p-4 rounded-xl border border-[#e0e7ff] text-xs leading-relaxed text-[#475569]">
              <strong className="block text-[#0f172a] mb-1 font-semibold">Description & Scope:</strong>
              <p>{resource.description || 'Verified academic syllabus material for semester studies.'}</p>
            </div>

            {resource.previewContent?.keyTopics && resource.previewContent.keyTopics.length > 0 && (
              <div>
                <span className="font-bold text-[#0f172a] text-xs block mb-2">
                  Key Examination Units Covered:
                </span>
                <div className="flex flex-wrap gap-2">
                  {resource.previewContent.keyTopics.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-slate-100 text-slate-700 font-medium px-3 py-1 rounded-full border border-slate-200"
                    >
                      • {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
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

      {/* Fullscreen Document Preview Modal */}
      <QuickPreviewModal
        resource={resource}
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
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
