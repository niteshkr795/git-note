'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Resource } from '@/types';
import { formatFileSize } from '@/lib/formatters';
import {
  SUBJECTS,
  SEMESTERS,
  ACADEMIC_YEARS,
  normalizeSemester,
  getSemesterVariants,
} from '@/data/mockData';
import { ResourceCard } from '@/components/ResourceCard';
import { QuickPreviewModal } from '@/components/QuickPreviewModal';
import { EmptyState } from '@/components/EmptyState';
import {
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
  ArrowUpDown,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
  BookOpen,
  GraduationCap,
  Building2,
  Layers,
  Calendar,
  Loader2,
  LayoutGrid,
  List,
} from 'lucide-react';

const UNIVERSITIES = [
  'All Universities / Colleges',
  'SRMCEM Lucknow',
  'Dr. A.P.J. Abdul Kalam Technical University (AKTU)',
  'Other Institutions',
];

const UI_RESOURCE_TYPES = [
  { label: 'All Formats', value: '' },
  { label: 'Notes', value: 'Notes', dbValue: 'Notes' },
  { label: 'Past Papers (PYQs)', value: 'PYQs', dbValue: 'PYQ' },
  { label: 'Assignments', value: 'Assignments', dbValue: 'Assignment' },
  { label: 'Lab Manuals', value: 'Lab Manuals', dbValue: 'Lab Manual' },
  { label: 'Books & Guides', value: 'Books', dbValue: 'Study Material' },
];

const PAGE_SIZE = 12;

interface SearchFilters {
  query: string;
  university: string;
  semester: string;
  subject: string;
  resourceType: string;
  academicYear: string;
  sortBy: 'recent' | 'downloads' | 'relevant';
}

function mapDbRowToResource(dbRes: any): Resource {
  const uploaderData = Array.isArray(dbRes.uploader) ? dbRes.uploader[0] : dbRes.uploader;
  const resourceSemester = normalizeSemester(
    dbRes.semester,
    normalizeSemester(uploaderData?.semester, 'Semester 1')
  );

  return {
    id: dbRes.id,
    title: dbRes.title,
    description: dbRes.description || 'No description provided.',
    subject: dbRes.subject_name || dbRes.subject || 'General Engineering',
    semester: resourceSemester as any,
    resourceType: (dbRes.resource_type === 'PYQ' ? 'PYQ' : dbRes.resource_type) as any,
    academicYear: dbRes.academic_year as any,
    fileFormat: (dbRes.file_format || 'PDF') as any,
    fileSize: formatFileSize(dbRes.file_size_bytes, dbRes.file_size),
    fileSizeBytes: dbRes.file_size_bytes || undefined,
    storagePath: dbRes.storage_path || undefined,
    pageCount: dbRes.page_count || 12,
    downloadCount: dbRes.download_count ?? 0,
    viewCount: dbRes.view_count ?? 0,
    rating: Number(dbRes.rating) || 5.0,
    createdAt: dbRes.created_at ? new Date(dbRes.created_at).toISOString().split('T')[0] : '',
    tags: Array.isArray(dbRes.tags) ? dbRes.tags : [],
    uploader: {
      id: uploaderData?.id || dbRes.uploader_id || dbRes.owner_id || 'contributor',
      name: uploaderData?.full_name || 'Student Contributor',
      avatar: uploaderData?.avatar_url || '',
      college: uploaderData?.college || 'SRMCEM Lucknow',
      branch: uploaderData?.branch || 'Computer Science & Engineering',
      semester: normalizeSemester(uploaderData?.semester, resourceSemester),
      verified: Boolean(uploaderData?.is_verified ?? dbRes.is_verified),
    },
    isVerified: Boolean(dbRes.is_verified),
    previewContent: {
      summary: (dbRes.description || dbRes.title).slice(0, 160) + '...',
      keyTopics: Array.isArray(dbRes.tags) && dbRes.tags.length > 0 ? dbRes.tags : ['Course Overview', 'Exam Problems', 'Formula Sheet'],
      sampleText: `Title: ${dbRes.title}\nSubject: ${dbRes.subject_name || dbRes.subject || 'General'}\nAcademic Year: ${dbRes.academic_year}\n\nDocument cataloged in GitNote academic repository.\n\nDescription:\n${dbRes.description || 'Verified course syllabus material.'}`,
    },
  };
}

function SearchPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL query params initialization with normalized semester
  const initialQuery = searchParams.get('q') || '';
  const initialUniv = searchParams.get('univ') || '';
  const initialSem = normalizeSemester(searchParams.get('sem') || '');
  const initialSub = searchParams.get('sub') || '';
  const initialType = searchParams.get('type') || '';
  const initialYear = searchParams.get('year') || '';
  const initialSort = (searchParams.get('sort') as SearchFilters['sortBy']) || 'recent';

  // Layout View mode: grid vs compact list
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter form state (controlled inputs)
  const [formFilters, setFormFilters] = useState<SearchFilters>({
    query: initialQuery,
    university: initialUniv,
    semester: initialSem,
    subject: initialSub,
    resourceType: initialType,
    academicYear: initialYear,
    sortBy: initialSort,
  });

  // Active committed filters that trigger data fetching
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({
    query: initialQuery,
    university: initialUniv,
    semester: initialSem,
    subject: initialSub,
    resourceType: initialType,
    academicYear: initialYear,
    sortBy: initialSort,
  });

  // Data fetching states
  const [resources, setResources] = useState<Resource[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Available subjects loaded from Supabase `subjects` table
  const [dbSubjects, setDbSubjects] = useState<string[]>(SUBJECTS);

  // Mobile filter collapse toggle
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  // Quick preview modal state
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);

  // Load actual subjects dynamically from Supabase
  useEffect(() => {
    supabase
      .from('subjects')
      .select('name')
      .order('name')
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const names = Array.from(new Set(data.map((s) => s.name)));
          setDbSubjects(names);
        }
      });
  }, []);

  // Synchronize state when URL changes externally
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const univ = searchParams.get('univ') || '';
    const sem = normalizeSemester(searchParams.get('sem') || '');
    const sub = searchParams.get('sub') || '';
    const type = searchParams.get('type') || '';
    const year = searchParams.get('year') || '';
    const sort = (searchParams.get('sort') as SearchFilters['sortBy']) || 'recent';

    const synced: SearchFilters = {
      query: q,
      university: univ,
      semester: sem,
      subject: sub,
      resourceType: type,
      academicYear: year,
      sortBy: sort,
    };

    setFormFilters(synced);
    setActiveFilters(synced);
    setCurrentPage(1);
  }, [searchParams]);

  // Synchronize URL with active filters
  const pushFiltersToUrl = useCallback(
    (newFilters: SearchFilters) => {
      const params = new URLSearchParams();
      if (newFilters.query.trim()) params.set('q', newFilters.query.trim());
      if (newFilters.university) params.set('univ', newFilters.university);
      if (newFilters.semester) params.set('sem', newFilters.semester);
      if (newFilters.subject) params.set('sub', newFilters.subject);
      if (newFilters.resourceType) params.set('type', newFilters.resourceType);
      if (newFilters.academicYear) params.set('year', newFilters.academicYear);
      if (newFilters.sortBy && newFilters.sortBy !== 'recent') params.set('sort', newFilters.sortBy);

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(targetUrl, { scroll: false });
    },
    [pathname, router]
  );

  // Fetch real resources from Supabase
  const fetchResources = useCallback(
    async (pageToLoad: number, append: boolean = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setFetchError(null);

      try {
        const from = (pageToLoad - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const hasUnivFilter =
          activeFilters.university &&
          activeFilters.university !== 'All Universities / Colleges';

        const selectQuery = hasUnivFilter
          ? `
            id,
            title,
            description,
            resource_type,
            subject_id,
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
            uploader:profiles!inner(
              id,
              full_name,
              college,
              branch,
              semester,
              avatar_url,
              is_verified
            )
          `
          : `
            id,
            title,
            description,
            resource_type,
            subject_id,
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
            uploader:profiles!uploader_id(
              id,
              full_name,
              college,
              branch,
              semester,
              avatar_url,
              is_verified
            )
          `;

        let query = supabase.from('resources').select(selectQuery, { count: 'exact' });

        if (hasUnivFilter) {
          query = query.eq('uploader.college', activeFilters.university);
        }

        if (activeFilters.semester) {
          const variants = getSemesterVariants(activeFilters.semester);
          query = query.in('semester', variants);
        }

        if (activeFilters.subject) {
          query = query.eq('subject_name', activeFilters.subject);
        }

        if (activeFilters.resourceType) {
          const typeMapping = UI_RESOURCE_TYPES.find(
            (t) => t.value === activeFilters.resourceType || t.label === activeFilters.resourceType
          );
          const dbType = typeMapping?.dbValue || activeFilters.resourceType;
          query = query.eq('resource_type', dbType);
        }

        if (activeFilters.academicYear) {
          query = query.eq('academic_year', activeFilters.academicYear);
        }

        if (activeFilters.query.trim()) {
          const sanitized = activeFilters.query.trim().replace(/[%_(),]/g, '');
          if (sanitized) {
            query = query.or(
              `title.ilike.%${sanitized}%,description.ilike.%${sanitized}%,subject_name.ilike.%${sanitized}%`
            );
          }
        }

        if (activeFilters.sortBy === 'downloads') {
          query = query.order('download_count', { ascending: false });
        } else if (activeFilters.sortBy === 'relevant') {
          query = query.order('rating', { ascending: false }).order('download_count', { ascending: false });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        query = query.range(from, to);

        let { data, count, error } = await query;

        if (error) {
          let fallbackQuery = supabase
            .from('resources')
            .select('*', { count: 'exact' });

          if (activeFilters.semester) {
            const variants = getSemesterVariants(activeFilters.semester);
            fallbackQuery = fallbackQuery.in('semester', variants);
          }

          if (activeFilters.subject) {
            fallbackQuery = fallbackQuery.eq('subject_name', activeFilters.subject);
          }

          if (activeFilters.resourceType) {
            const typeMapping = UI_RESOURCE_TYPES.find(
              (t) => t.value === activeFilters.resourceType || t.label === activeFilters.resourceType
            );
            const dbType = typeMapping?.dbValue || activeFilters.resourceType;
            fallbackQuery = fallbackQuery.eq('resource_type', dbType);
          }

          if (activeFilters.academicYear) {
            fallbackQuery = fallbackQuery.eq('academic_year', activeFilters.academicYear);
          }

          if (activeFilters.query.trim()) {
            const sanitized = activeFilters.query.trim().replace(/[%_(),]/g, '');
            if (sanitized) {
              fallbackQuery = fallbackQuery.or(
                `title.ilike.%${sanitized}%,description.ilike.%${sanitized}%,subject_name.ilike.%${sanitized}%`
              );
            }
          }

          if (activeFilters.sortBy === 'downloads') {
            fallbackQuery = fallbackQuery.order('download_count', { ascending: false });
          } else if (activeFilters.sortBy === 'relevant') {
            fallbackQuery = fallbackQuery
              .order('rating', { ascending: false })
              .order('download_count', { ascending: false });
          } else {
            fallbackQuery = fallbackQuery.order('created_at', { ascending: false });
          }

          fallbackQuery = fallbackQuery.range(from, to);

          const fallbackRes = await fallbackQuery;
          if (!fallbackRes.error) {
            data = fallbackRes.data;
            count = fallbackRes.count;
            error = null;
          } else {
            throw error;
          }
        }

        const mapped = (data || []).map(mapDbRowToResource);

        if (append) {
          setResources((prev) => [...prev, ...mapped]);
        } else {
          setResources(mapped);
        }
        setTotalCount(count ?? 0);
      } catch (err: any) {
        console.error('[GitNote Search] Supabase fetch error:', err);
        setFetchError(err?.message || 'Failed to retrieve academic resources from the database.');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [activeFilters]
  );

  useEffect(() => {
    fetchResources(1, false);
  }, [fetchResources]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated = { ...formFilters };
    setActiveFilters(updated);
    pushFiltersToUrl(updated);
    setCurrentPage(1);
  };

  const updateFilter = (filterKey: keyof SearchFilters, val: string) => {
    const updated = {
      ...formFilters,
      [filterKey]: val,
    };
    setFormFilters(updated);
    setActiveFilters(updated);
    pushFiltersToUrl(updated);
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    const updated = { ...formFilters };
    setActiveFilters(updated);
    pushFiltersToUrl(updated);
    setCurrentPage(1);
    setMobileFiltersOpen(false);
  };

  const handleResetFilters = () => {
    const resetState: SearchFilters = {
      query: '',
      university: '',
      semester: '',
      subject: '',
      resourceType: '',
      academicYear: '',
      sortBy: 'recent',
    };
    setFormFilters(resetState);
    setActiveFilters(resetState);
    pushFiltersToUrl(resetState);
    setCurrentPage(1);
  };

  const handleRemoveFilter = (filterKey: keyof SearchFilters) => {
    const updated = {
      ...formFilters,
      [filterKey]: filterKey === 'sortBy' ? 'recent' : '',
    };
    setFormFilters(updated);
    setActiveFilters(updated);
    pushFiltersToUrl(updated);
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchResources(nextPage, true);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (formFilters.university && formFilters.university !== 'All Universities / Colleges') count++;
    if (formFilters.semester) count++;
    if (formFilters.subject) count++;
    if (formFilters.resourceType) count++;
    if (formFilters.academicYear) count++;
    if (formFilters.sortBy !== 'recent') count++;
    return count;
  }, [formFilters]);

  const hasAnyActiveFilter = Boolean(
    activeFilters.query ||
      (activeFilters.university && activeFilters.university !== 'All Universities / Colleges') ||
      activeFilters.semester ||
      activeFilters.subject ||
      activeFilters.resourceType ||
      activeFilters.academicYear ||
      activeFilters.sortBy !== 'recent'
  );

  const commonKeywords = [
    'Data Structures',
    'Operating Systems',
    'Database Systems',
    'Computer Networks',
    'Theory of Computation',
  ];

  return (
    <div className="min-h-screen bg-[#fbfaf8]">
      {/* Header: Editorial Catalog Presentation */}
      <section className="bg-white border-b border-[#e5e2db] pt-8 pb-7 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-[#71717a] mb-2 font-mono">
            <Link href="/" className="hover:text-[#18181b] transition-colors">
              Repository
            </Link>
            <span>/</span>
            <span className="text-[#18181b] font-medium">Library Catalog</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="font-editorial text-2xl sm:text-3xl font-semibold tracking-tight text-[#18181b]">
                Academic Resource Catalog
              </h1>
              <p className="text-xs sm:text-sm text-[#71717a] mt-1 max-w-2xl leading-relaxed">
                Indexed collection of syllabus-aligned previous year exam papers, lecture notes, lab manuals, and assignments.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono text-[#52525b] bg-[#f4f2ee] px-2.5 py-1 rounded border border-[#e5e2db]">
                {totalCount} Total Cataloged Records
              </span>
            </div>
          </div>

          {/* Catalog Search Input */}
          <div className="max-w-4xl">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <div className="absolute left-3.5 pointer-events-none text-[#71717a]">
                <Search className="w-4 h-4 text-[#1d3b64]" />
              </div>

              <input
                type="text"
                value={formFilters.query}
                onChange={(e) => setFormFilters((prev) => ({ ...prev, query: e.target.value }))}
                placeholder="Search by course code, document title, exam year, or syllabus topic..."
                className="w-full pl-10 pr-24 sm:pr-28 py-2.5 bg-[#fbfaf8] hover:bg-white text-[#18181b] placeholder-[#a1a1aa] text-xs sm:text-sm font-normal rounded-md border border-[#e5e2db] focus:bg-white focus:border-[#1d3b64] focus:ring-1 focus:ring-[#1d3b64] outline-none transition-all shadow-2xs"
              />

              <div className="absolute right-1.5 flex items-center gap-1">
                {formFilters.query && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormFilters((prev) => ({ ...prev, query: '' }));
                      setActiveFilters((prev) => ({ ...prev, query: '' }));
                      pushFiltersToUrl({ ...formFilters, query: '' });
                    }}
                    className="p-1 text-[#71717a] hover:text-[#18181b] rounded transition-colors cursor-pointer"
                    title="Clear query"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#1d3b64] hover:bg-[#152b49] text-white text-xs font-medium rounded transition-colors border border-[#152b49] shadow-2xs cursor-pointer"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Keyword Chips */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 text-xs text-[#71717a] scrollbar-none">
              <span className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-[#71717a]">
                Browse Subjects:
              </span>
              {commonKeywords.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => {
                    const updated = { ...formFilters, query: kw };
                    setFormFilters(updated);
                    setActiveFilters(updated);
                    pushFiltersToUrl(updated);
                  }}
                  className="shrink-0 px-2 py-0.5 bg-[#f4f2ee] hover:bg-[#e5e2db] text-[#52525b] border border-[#e5e2db] rounded text-xs transition-colors cursor-pointer"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex items-center justify-between gap-3 bg-white p-3 rounded-md border border-[#e5e2db] shadow-2xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#1d3b64]" />
            <span className="text-xs font-semibold text-[#18181b]">Filter Catalog</span>
            {activeFilterCount > 0 && (
              <span className="text-[10px] font-mono bg-[#eef3f8] text-[#1d3b64] px-1.5 py-0.2 rounded border border-[#cfdbe8]">
                {activeFilterCount}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="flex items-center gap-1 text-xs font-medium text-[#1d3b64] bg-[#f4f2ee] px-2.5 py-1 rounded border border-[#e5e2db] transition-colors cursor-pointer"
          >
            <span>{mobileFiltersOpen ? 'Hide' : 'Refine'}</span>
            {mobileFiltersOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Filter Toolbar (Desktop: Always Visible | Mobile: Collapsible) */}
        <div
          className={`${
            mobileFiltersOpen ? 'block' : 'hidden md:block'
          } bg-white border border-[#e5e2db] rounded-md p-4 shadow-2xs space-y-4`}
        >
          {/* Format Selection Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#71717a]">
                Document Category
              </span>
              {hasAnyActiveFilter && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-[11px] font-medium text-[#991b1b] hover:text-[#7f1d1d] hover:bg-[#fef2f2] px-2 py-0.5 rounded transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear all filters</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {UI_RESOURCE_TYPES.map((type) => {
                const isSelected = formFilters.resourceType === type.value;
                return (
                  <button
                    key={type.label}
                    type="button"
                    onClick={() => updateFilter('resourceType', isSelected ? '' : type.value)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#1d3b64] text-white border border-[#152b49]'
                        : 'bg-[#f4f2ee] hover:bg-[#eae7e0] text-[#52525b] border border-[#e5e2db]'
                    }`}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Criteria Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1 border-t border-[#eeece6]">
            {/* University Filter */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717a] mb-1">
                Institution
              </label>
              <select
                value={formFilters.university}
                onChange={(e) => updateFilter('university', e.target.value)}
                className="w-full h-8 px-2 bg-white border border-[#e5e2db] rounded text-xs text-[#18181b] font-medium focus:border-[#1d3b64] focus:ring-1 focus:ring-[#1d3b64] outline-none transition-colors cursor-pointer"
              >
                {UNIVERSITIES.map((univ) => (
                  <option key={univ} value={univ === 'All Universities / Colleges' ? '' : univ}>
                    {univ}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester Filter */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717a] mb-1">
                Semester
              </label>
              <select
                value={formFilters.semester}
                onChange={(e) => updateFilter('semester', e.target.value)}
                className="w-full h-8 px-2 bg-white border border-[#e5e2db] rounded text-xs text-[#18181b] font-medium focus:border-[#1d3b64] focus:ring-1 focus:ring-[#1d3b64] outline-none transition-colors cursor-pointer"
              >
                <option value="">All Semesters</option>
                {SEMESTERS.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717a] mb-1">
                Course Subject
              </label>
              <select
                value={formFilters.subject}
                onChange={(e) => updateFilter('subject', e.target.value)}
                className="w-full h-8 px-2 bg-white border border-[#e5e2db] rounded text-xs text-[#18181b] font-medium focus:border-[#1d3b64] focus:ring-1 focus:ring-[#1d3b64] outline-none transition-colors cursor-pointer"
              >
                <option value="">All Subjects</option>
                {dbSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Year Filter */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717a] mb-1">
                Academic Year
              </label>
              <select
                value={formFilters.academicYear}
                onChange={(e) => updateFilter('academicYear', e.target.value)}
                className="w-full h-8 px-2 bg-white border border-[#e5e2db] rounded text-xs text-[#18181b] font-medium focus:border-[#1d3b64] focus:ring-1 focus:ring-[#1d3b64] outline-none transition-colors cursor-pointer"
              >
                <option value="">All Academic Years</option>
                {ACADEMIC_YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717a] mb-1">
                Sort By
              </label>
              <select
                value={formFilters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="w-full h-8 px-2 bg-white border border-[#e5e2db] rounded text-xs text-[#18181b] font-medium focus:border-[#1d3b64] focus:ring-1 focus:ring-[#1d3b64] outline-none transition-colors cursor-pointer"
              >
                <option value="recent">Most Recent Date</option>
                <option value="downloads">Most Downloaded</option>
                <option value="relevant">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Metadata Bar: Count, Active Filter Tags, and View Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-editorial text-base font-semibold text-[#18181b]">
              Catalog Records
            </span>
            <span className="text-xs font-mono text-[#52525b] bg-[#f4f2ee] px-2 py-0.5 rounded border border-[#e5e2db]">
              {totalCount} {totalCount === 1 ? 'entry' : 'entries'} found
            </span>

            {/* Active Filter Badges */}
            {hasAnyActiveFilter && (
              <div className="flex flex-wrap items-center gap-1.5 ml-1">
                {activeFilters.query && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white text-[#18181b] rounded border border-[#e5e2db] text-xs">
                    <span>&quot;{activeFilters.query}&quot;</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFilter('query')}
                      className="text-[#71717a] hover:text-[#991b1b] cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {activeFilters.semester && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f4f2ee] text-[#18181b] rounded border border-[#e5e2db] text-xs font-mono">
                    <span>{activeFilters.semester}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFilter('semester')}
                      className="text-[#71717a] hover:text-[#991b1b] cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {activeFilters.subject && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f4f2ee] text-[#18181b] rounded border border-[#e5e2db] text-xs">
                    <span>{activeFilters.subject}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFilter('subject')}
                      className="text-[#71717a] hover:text-[#991b1b] cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {activeFilters.resourceType && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f4f2ee] text-[#18181b] rounded border border-[#e5e2db] text-xs">
                    <span>{activeFilters.resourceType}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFilter('resourceType')}
                      className="text-[#71717a] hover:text-[#991b1b] cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* View Mode Toggle: Grid Cards vs List Table */}
          <div className="flex items-center gap-1 self-end sm:self-auto">
            <span className="text-[11px] font-mono text-[#71717a] mr-1 hidden sm:inline">View:</span>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Card view"
              className={`p-1.5 rounded border transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#1d3b64] text-white border-[#152b49]'
                  : 'bg-white text-[#71717a] hover:text-[#18181b] border-[#e5e2db]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              title="List view"
              className={`p-1.5 rounded border transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#1d3b64] text-white border-[#152b49]'
                  : 'bg-white text-[#71717a] hover:text-[#18181b] border-[#e5e2db]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Loading State: Clean Bone Skeletons */}
        {isLoading && (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-2'
            }
          >
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-md border border-[#e5e2db] p-4 space-y-3 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 w-16 bg-[#eeece6] rounded" />
                  <div className="h-4 w-14 bg-[#eeece6] rounded" />
                </div>
                <div className="h-5 w-3/4 bg-[#e5e2db] rounded" />
                <div className="h-3 w-1/2 bg-[#eeece6] rounded" />
                <div className="pt-3 border-t border-[#eeece6] flex items-center justify-between">
                  <div className="h-4 w-20 bg-[#eeece6] rounded" />
                  <div className="h-4 w-16 bg-[#eeece6] rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && fetchError && (
          <div className="bg-[#fef2f2] border border-[#fecaca] rounded-md p-6 text-center max-w-md mx-auto space-y-3">
            <AlertCircle className="w-8 h-8 text-[#991b1b] mx-auto" />
            <h3 className="text-sm font-semibold text-[#991b1b]">Database Connection Issue</h3>
            <p className="text-xs text-[#7f1d1d] leading-relaxed">{fetchError}</p>
            <button
              type="button"
              onClick={() => fetchResources(1, false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#991b1b] hover:bg-[#7f1d1d] text-white text-xs font-medium rounded transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry Search</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !fetchError && resources.length === 0 && (
          <EmptyState
            type="search"
            title="No Matching Records in the Academic Archive"
            description={
              hasAnyActiveFilter
                ? 'No documents matched your specific filter combination. Try clearing some filters or searching with broader keywords.'
                : 'The library catalog is currently empty for this view. Upload your notes or exam papers to seed this section.'
            }
            actionText="Reset All Filters"
            onAction={handleResetFilters}
          />
        )}

        {/* Results: Grid or List View */}
        {!isLoading && !fetchError && resources.length > 0 && (
          <>
            {viewMode === 'list' ? (
              <div className="space-y-2">
                {resources.map((res) => (
                  <ResourceCard
                    key={res.id}
                    resource={res}
                    layout="list"
                    onQuickPreview={(target) => setPreviewResource(target)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.map((res) => (
                  <ResourceCard
                    key={res.id}
                    resource={res}
                    layout="grid"
                    onQuickPreview={(target) => setPreviewResource(target)}
                  />
                ))}
              </div>
            )}

            {/* Pagination / Load More Button */}
            {resources.length < totalCount && (
              <div className="pt-6 text-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-5 py-2 bg-white hover:bg-[#f4f2ee] text-[#18181b] border border-[#e5e2db] hover:border-[#c9c4b8] text-xs font-medium rounded-md shadow-2xs transition-colors inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1d3b64]" />
                      <span>Retrieving more records...</span>
                    </>
                  ) : (
                    <span>
                      Load More Records ({resources.length} of {totalCount} displayed)
                    </span>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick Preview Modal for Document Inspection */}
      <QuickPreviewModal
        resource={previewResource}
        isOpen={Boolean(previewResource)}
        onClose={() => setPreviewResource(null)}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-2 border-[#1d3b64]/20 border-t-[#1d3b64] rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-[#71717a]">Loading Academic Library Catalog...</p>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
