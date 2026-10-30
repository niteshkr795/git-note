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
import { ResourceComments } from '@/components/ResourceComments';
import { getResourceFileUrl } from '@/lib/pdfHelper';
import {
  FileText,
  Download,
  Bookmark,
  Share2,
  AlertTriangle,
  Calendar,
  GraduationCap,
  Star,
  Eye,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  BookOpen,
  Trash2,
  MessageSquare,
  Layers,
} from 'lucide-react';

function ResourceDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const resourceId = params?.id as string;
  const { user } = useAuth();
  const { resources, toggleBookmark, isBookmarked, mockDownload, addToast, userProfile } = useResources();

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [dbResource, setDbResource] = useState<Resource | null>(null);
  const [loadingDb, setLoadingDb] = useState(false);
  const [commentCount, setCommentCount] = useState<number>(0);

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
        <div className="w-8 h-8 border-2 border-[#1d3b64]/20 border-t-[#1d3b64] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-mono text-[#71717a]">Loading record from academic archive...</p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="font-editorial text-2xl font-semibold text-[#18181b] mb-2 tracking-tight">Record Not Found</h2>
        <p className="text-[#52525b] mb-5 text-xs sm:text-sm">
          The requested document could not be located in the catalog index.
        </p>
        <Link href="/search">
          <Button variant="primary" size="sm">Return to Catalog</Button>
        </Link>
      </div>
    );
  }

  const bookmarked = isBookmarked(resource.id);
  const totalPages = resource.pageCount || 16;

  const isOwner = Boolean(
    (user && (resource.uploader.id === user.id || resource.uploader.name === (user.user_metadata?.full_name || user.email?.split('@')[0]))) ||
    (!user && (resource.uploader.id === userProfile.id || resource.uploader.name === userProfile.name))
  );

  const relatedResources = resources
    .filter((r) => r.id !== resource.id && (r.subject === resource.subject || r.semester === resource.semester))
    .slice(0, 3);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      addToast('info', 'Link Copied', 'Document citation URL copied to clipboard.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 bg-[#fbfaf8]">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#71717a] font-mono">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 hover:text-[#18181b] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        <span>/</span>
        <Link href="/search" className="hover:text-[#18181b] transition-colors">
          Library Catalog
        </Link>
        <span>/</span>
        <span className="text-[#52525b] truncate max-w-xs">
          {resource.subject}
        </span>
      </div>

      {/* Resource Title & Primary Dossier Header */}
      <div className="bg-white rounded-md border border-[#e5e2db] p-5 sm:p-7 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            {/* Classification Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge resourceType={resource.resourceType} size="sm">
                {resource.resourceType}
              </Badge>
              <span className="text-[11px] font-mono text-[#52525b] bg-[#f4f2ee] px-2 py-0.5 rounded border border-[#e5e2db]">
                {resource.semester}
              </span>
              <span className="text-[11px] font-mono text-[#71717a] bg-[#faf9f7] px-2 py-0.5 rounded border border-[#e5e2db] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#a1a1aa]" />
                {resource.academicYear}
              </span>
              <span className="text-[11px] font-medium text-[#166534] bg-[#f0fdf4] px-2 py-0.5 rounded border border-[#bbf7d0] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#166534]" />
                Syllabus Verified
              </span>
            </div>

            {/* Document Title */}
            <h1 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#18181b] tracking-tight leading-snug">
              {resource.title}
            </h1>

            {/* Course Subject Byline */}
            <div className="flex items-center gap-1.5 text-xs text-[#52525b]">
              <GraduationCap className="w-4 h-4 text-[#71717a]" />
              <span className="font-medium">{resource.subject}</span>
            </div>

            {/* Document Metrics */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#71717a] pt-2 border-t border-[#eeece6] font-mono">
              <span className="text-[#18181b] font-medium">
                {resource.fileFormat} • {resource.fileSize} • {totalPages} Pages
              </span>
              <span>•</span>
              <span>{resource.downloadCount} downloads</span>
              <span>•</span>
              <span>{resource.viewCount} views</span>
              <span>•</span>
              <span className="text-[#92400e] font-medium">★ {resource.rating.toFixed(1)}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
              </span>
            </div>
          </div>

          {/* Primary Action Button Column */}
          <div className="flex flex-col gap-2 shrink-0 min-w-[200px]">
            <Button
              variant="primary"
              size="md"
              onClick={() => mockDownload(resource)}
              leftIcon={<Download className="w-4 h-4" />}
              className="w-full"
            >
              Download ({resource.fileSize})
            </Button>

            <div className="grid grid-cols-2 gap-2 w-full">
              <Button
                variant={bookmarked ? 'emerald' : 'outline'}
                size="sm"
                onClick={() => toggleBookmark(resource.id)}
                leftIcon={
                  <Bookmark
                    className={`w-3.5 h-3.5 ${bookmarked ? 'fill-[#166534] text-[#166534]' : ''}`}
                  />
                }
              >
                {bookmarked ? 'Saved' : 'Bookmark'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                leftIcon={<Share2 className="w-3.5 h-3.5" />}
              >
                Share
              </Button>
            </div>

            {isOwner && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                className="w-full"
              >
                Delete Document
              </Button>
            )}

            <button
              type="button"
              onClick={() => setIsReportOpen(true)}
              className="w-full text-center text-[11px] text-[#71717a] hover:text-[#991b1b] p-1 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Report this document</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Document Reader & Context Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Interactive Reader & Syllabus Notes */}
        <div className="lg:col-span-2 space-y-5">
          <PdfViewer
            url={fileUrl}
            title={resource.title}
            fileFormat={resource.fileFormat}
            fileSize={resource.fileSize}
            onDownload={() => mockDownload(resource)}
          />

          {/* Scope and Examination Units */}
          <div className="bg-white rounded-md border border-[#e5e2db] p-5 sm:p-6 space-y-4 shadow-2xs">
            <h3 className="font-editorial text-base font-semibold text-[#18181b] pb-2 border-b border-[#eeece6]">
              Document Scope & Syllabus Alignment
            </h3>

            <div className="text-xs sm:text-sm text-[#52525b] leading-relaxed">
              <p>{resource.description || 'Verified academic syllabus material cataloged for student examination preparation.'}</p>
            </div>

            {resource.previewContent?.keyTopics && resource.previewContent.keyTopics.length > 0 && (
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#71717a] block mb-2">
                  Key Units Covered:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {resource.previewContent.keyTopics.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-mono bg-[#f4f2ee] text-[#52525b] px-2.5 py-1 rounded border border-[#e5e2db]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="pt-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#71717a] block mb-1.5">
                  Indexed Subject Tags:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {resource.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-mono text-[#52525b] bg-[#faf9f7] px-2 py-0.5 rounded border border-[#e5e2db]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments & Discussion Section */}
          <ResourceComments
            resourceId={resource.id}
            resourceTitle={resource.title}
            onCommentCountChange={setCommentCount}
          />
        </div>

        {/* Right Column: Contributor & Institutional Metadata */}
        <div className="space-y-4">
          {/* Contributor Card */}
          <div className="bg-white rounded-md border border-[#e5e2db] p-5 shadow-2xs space-y-3">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#71717a] block pb-2 border-b border-[#eeece6]">
              Contributor Record
            </span>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#1d3b64] text-white flex items-center justify-center text-xs font-mono font-bold shrink-0 overflow-hidden">
                {resource.uploader.avatar ? (
                  <img src={resource.uploader.avatar} alt={resource.uploader.name} className="w-full h-full object-cover" />
                ) : (
                  resource.uploader.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-semibold text-xs sm:text-sm text-[#18181b] truncate">
                    {resource.uploader.name}
                  </h4>
                  {resource.uploader.verified && (
                    <span title="Verified Contributor"><CheckCircle2 className="w-3.5 h-3.5 text-[#166534] shrink-0" /></span>
                  )}
                </div>
                <p className="text-xs text-[#52525b] truncate">{resource.uploader.branch}</p>
                <p className="text-[11px] text-[#71717a] truncate">{resource.uploader.college}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#eeece6] flex items-center justify-between text-xs text-[#71717a]">
              <span>Class Semester:</span>
              <span className="font-mono text-[#18181b]">{resource.uploader.semester}</span>
            </div>

            <Link
              href="/profile"
              className="inline-flex items-center justify-center w-full py-1.5 px-3 rounded bg-[#f4f2ee] hover:bg-[#eae7e0] text-[#18181b] text-xs font-medium border border-[#e5e2db] transition-colors"
            >
              View Contributor Profile
            </Link>
          </div>

          {/* Related Curriculum Materials */}
          {relatedResources.length > 0 && (
            <div className="bg-white rounded-md border border-[#e5e2db] p-5 shadow-2xs space-y-3">
              <h3 className="font-editorial text-sm font-semibold text-[#18181b] pb-2 border-b border-[#eeece6] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#1d3b64]" />
                <span>Related Course Materials</span>
              </h3>

              <div className="space-y-2">
                {relatedResources.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/resources/${rel.id}`}
                    className="block p-2.5 rounded border border-[#e5e2db] hover:border-[#c9c4b8] hover:bg-[#fbfaf8] transition-colors"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Badge resourceType={rel.resourceType} size="sm">
                        {rel.resourceType}
                      </Badge>
                      <span className="text-[10px] font-mono text-[#71717a]">{rel.semester}</span>
                    </div>
                    <h5 className="font-medium text-xs text-[#18181b] line-clamp-1">
                      {rel.title}
                    </h5>
                    <p className="text-[10px] font-mono text-[#71717a] mt-0.5">
                      {rel.fileFormat} • {rel.downloadCount} downloads
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        resourceId={resource.id}
        resourceTitle={resource.title}
      />

      {/* Delete Confirmation Modal */}
      <DeleteResourceModal
        resource={resource}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDeleted={() => {
          router.push('/profile?tab=uploads');
        }}
      />

      {/* Fullscreen Preview Modal */}
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
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-[#71717a] text-xs font-mono">
          Loading academic document...
        </div>
      }
    >
      <ResourceDetailsContent />
    </Suspense>
  );
}
