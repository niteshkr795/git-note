'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Resource } from '@/types';
import { SUBJECTS, SEMESTERS, ACADEMIC_YEARS } from '@/data/mockData';
import { ResourceCard } from '@/components/ResourceCard';
import { QuickPreviewModal } from '@/components/QuickPreviewModal';
import { EmptyState } from '@/components/EmptyState';
import {
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Filter,
  CheckCircle2,
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
  { label: 'Previous Year Question Papers (PYQs)', value: 'PYQs', dbValue: 'PYQ' },
  { label: 'Assignments', value: 'Assignments', dbValue: 'Assignment' },
  { label: 'Lab Manuals', value: 'Lab Manuals', dbValue: 'Lab Manual' },
  { label: 'Books', value: 'Books', dbValue: 'Study Material' },
  { label: 'Other', value: 'Other', dbValue: 'Study Material' },
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
  return {
    id: dbRes.id,
    title: dbRes.title,
    description: dbRes.description || 'No description provided.',
    subject: dbRes.subject_name || 'General',
    semester: dbRes.semester as any,
    resourceType: (dbRes.resource_type === 'PYQ' ? 'PYQ' : dbRes.resource_type) as any,
    academicYear: dbRes.academic_year as any,
    fileFormat: (dbRes.file_format || 'PDF') as any,
    fileSize: dbRes.file_size || '1.0 MB',
    pageCount: dbRes.page_count || 12,
    downloadCount: dbRes.download_count ?? 0,
    viewCount: dbRes.view_count ?? 0,
    rating: Number(dbRes.rating) || 5.0,
    createdAt: dbRes.created_at ? new Date(dbRes.created_at).toISOString().split('T')[0] : '',
    tags: Array.isArray(dbRes.tags) ? dbRes.tags : [],
    uploader: {
      id: uploaderData?.id || dbRes.uploader_id || 'contributor',
      name: uploaderData?.full_name || 'Student Contributor',
      avatar: uploaderData?.avatar_url || '',
      college: uploaderData?.college || 'SRMCEM Lucknow',
      branch: uploaderData?.branch || 'Computer Science & Engineering',
      semester: uploaderData?.semester || dbRes.semester || 'Semester 4',
      verified: Boolean(uploaderData?.is_verified ?? dbRes.is_verified),
    },
    isVerified: Boolean(dbRes.is_verified),
    previewContent: {
      summary: (dbRes.description || dbRes.title).slice(0, 160) + '...',
      keyTopics: Array.isArray(dbRes.tags) && dbRes.tags.length > 0 ? dbRes.tags : ['Unit Overview', 'Solved Problems', 'Revision Notes'],
      sampleText: `Title: ${dbRes.title}\nSubject: ${dbRes.subject_name}\nAcademic Year: ${dbRes.academic_year}\n\nDocument cataloged in GitNote academic repository.\n\nDescription:\n${dbRes.description || 'Verified academic syllabus material.'}`,
    },
  };
}

function SearchPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL query params initialization
  const initialQuery = searchParams.get('q') || '';
  const initialUniv = searchParams.get('univ') || '';
  const initialSem = searchParams.get('sem') || '';
  const initialSub = searchParams.get('sub') || '';
  const initialType = searchParams.get('type') || '';
  const initialYear = searchParams.get('year') || '';
  const initialSort = (searchParams.get('sort') as SearchFilters['sortBy']) || 'recent';

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

  // Load actual subjects dynamically from Supabase `public.subjects`
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

  // Synchronize state when URL changes externally (e.g., browser back/forward)
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const univ = searchParams.get('univ') || '';
    const sem = searchParams.get('sem') || '';
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

        // Select resource fields and uploader profile join
        // If university filter is applied, perform inner join on uploader to filter by college
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

        // University / college filter
        if (hasUnivFilter) {
          query = query.eq('uploader.college', activeFilters.university);
        }

        // Semester filter
        if (activeFilters.semester) {
          query = query.eq('semester', activeFilters.semester);
        }

        // Subject filter
        if (activeFilters.subject) {
          query = query.eq('subject_name', activeFilters.subject);
        }

        // Resource Type filter (mapping UI type to actual DB column values)
        if (activeFilters.resourceType) {
          const typeMapping = UI_RESOURCE_TYPES.find(
            (t) => t.value === activeFilters.resourceType || t.label === activeFilters.resourceType
          );
          const dbType = typeMapping?.dbValue || activeFilters.resourceType;
          query = query.eq('resource_type', dbType);
        }

        // Academic Year filter
        if (activeFilters.academicYear) {
          query = query.eq('academic_year', activeFilters.academicYear);
        }

        // Text search: matches title, description, and subject_name
        if (activeFilters.query.trim()) {
          const sanitized = activeFilters.query.trim().replace(/[%_(),]/g, '');
          if (sanitized) {
            query = query.or(
              `title.ilike.%${sanitized}%,description.ilike.%${sanitized}%,subject_name.ilike.%${sanitized}%`
            );
          }
        }

        // Sort By
        if (activeFilters.sortBy === 'downloads') {
          query = query.order('download_count', { ascending: false });
        } else if (activeFilters.sortBy === 'relevant') {
          query = query.order('rating', { ascending: false }).order('download_count', { ascending: false });
        } else {
          // 'recent'
          query = query.order('created_at', { ascending: false });
        }

        // Pagination range
        query = query.range(from, to);

        const { data, count, error } = await query;

        if (error) {
          throw error;
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

  // Trigger query on activeFilters change or initial load
  useEffect(() => {
    fetchResources(1, false);
  }, [fetchResources]);

  // Handle Search Submission
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated = { ...formFilters };
    setActiveFilters(updated);
    pushFiltersToUrl(updated);
    setCurrentPage(1);
  };

  // Handle Applying Filters
  const handleApplyFilters = () => {
    const updated = { ...formFilters };
    setActiveFilters(updated);
    pushFiltersToUrl(updated);
    setCurrentPage(1);
    setMobileFiltersOpen(false);
  };

  // Handle Resetting Filters
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

  // Handle Single Filter Removal
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

  // Handle "Load More" pagination
  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchResources(nextPage, true);
  };

  // Count active filters (excluding query and default sort)
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

  const trendingSuggestions = [
    'Data Structures',
    'Operating Systems',
    'DBMS',
    'Mathematics III',
    'Machine Learning',
  ];

  return (
    <div className="min-h-screen bg-[#faf8ff]">
      {/* Search Header Banner */}
      <section className="bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#2e1065] text-white pt-10 pb-12 px-4 sm:px-6 lg:px-8 border-b border-white/10 relative overflow-hidden">
        {/* Glow ambient background orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#4f46e5]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#7c3aed]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-indigo-200/80 mb-4 font-medium">
            <Link href="/" className="hover:text-white transition-colors">
              Explore Hub
            </Link>
            <span>/</span>
            <span className="text-white font-semibold">Academic Search</span>
          </div>

          <div className="text-center max-w-3xl mx-auto space-y-3 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#818cf8]" />
              <span>Real-Time Academic Repository Search</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Search Notes, PYQs & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-violet-300 to-sky-300">Exam Papers</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Find syllabus-verified resources, previous year university question papers, lab manuals, and handwritten lecture notes.
            </p>
          </div>

          {/* Prominent Search Bar Form */}
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-lg">
              <div className="absolute left-4 pointer-events-none text-slate-400">
                <Search className="w-5 h-5 text-indigo-400" />
              </div>

              <input
                type="text"
                value={formFilters.query}
                onChange={(e) => setFormFilters((prev) => ({ ...prev, query: e.target.value }))}
                placeholder="Search notes, PYQs, assignments..."
                className="w-full pl-12 pr-28 sm:pr-32 py-4 bg-white text-[#0f172a] placeholder-slate-400 text-sm sm:text-base font-normal rounded-2xl border-2 border-white/20 focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all"
              />

              {/* Action buttons inside search bar: Clear & Search */}
              <div className="absolute right-2 flex items-center gap-1.5">
                {formFilters.query && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormFilters((prev) => ({ ...prev, query: '' }));
                      setActiveFilters((prev) => ({ ...prev, query: '' }));
                      pushFiltersToUrl({ ...formFilters, query: '' });
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title="Clear search query"
                    aria-label="Clear search input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="submit"
                  className="px-4 sm:px-5 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </form>

            {/* Quick Trending Keyword Suggestions */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 text-xs text-indigo-200 scrollbar-none">
              <span className="shrink-0 font-semibold text-indigo-300/80 text-[11px] tracking-wide uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#a78bfa]" />
                Trending:
              </span>
              {trendingSuggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => {
                    const updated = { ...formFilters, query: sug };
                    setFormFilters(updated);
                    setActiveFilters(updated);
                    pushFiltersToUrl(updated);
                  }}
                  className="shrink-0 px-3 py-1 bg-white/10 hover:bg-white/20 hover:text-white border border-white/15 rounded-full text-indigo-100 text-xs transition-all cursor-pointer backdrop-blur-xs"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Mobile Filter Toggle Button */}
        <div className="md:hidden flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#e2e8f0] shadow-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#4f46e5]" />
            <span className="text-xs font-bold text-[#0f172a]">Filter Resources</span>
            {activeFilterCount > 0 && (
              <span className="text-[10px] bg-[#eef2ff] text-[#4f46e5] font-bold px-2 py-0.5 rounded-full border border-[#e0e7ff]">
                {activeFilterCount} active
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="flex items-center gap-1 text-xs font-semibold text-[#4f46e5] hover:text-[#4338ca] bg-[#eef2ff] px-3 py-1.5 rounded-xl border border-[#e0e7ff] transition-all cursor-pointer"
          >
            <span>{mobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}</span>
            {mobileFiltersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Filter Panel (Desktop: Always Visible below search bar | Mobile: Collapsible) */}
        <div
          className={`${
            mobileFiltersOpen ? 'block' : 'hidden md:block'
          } bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs space-y-5 transition-all`}
        >
          {/* Filter Panel Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-[#eef2ff] text-[#4f46e5] rounded-xl border border-[#e0e7ff]">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <span className="font-bold text-[#0f172a] text-sm tracking-tight">Academic Filters</span>
              <span className="text-xs text-slate-400 font-medium">
                Refine by university, semester, subject, format, and year
              </span>
            </div>

            <div className="flex items-center gap-2">
              {hasAnyActiveFilter && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleApplyFilters}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#4f46e5] hover:bg-[#4338ca] px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>

          {/* Quick Format Pill Selectors: Resource Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Resource Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {UI_RESOURCE_TYPES.map((type) => {
                const isSelected = formFilters.resourceType === type.value;
                return (
                  <button
                    key={type.label}
                    type="button"
                    onClick={() => {
                      setFormFilters((prev) => ({
                        ...prev,
                        resourceType: isSelected ? '' : type.value,
                      }));
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#4f46e5] text-white shadow-xs'
                        : 'bg-white hover:bg-[#eef2ff] hover:text-[#4338ca] text-slate-700 border border-[#e2e8f0]'
                    }`}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Criteria Dropdowns: University, Semester, Subject, Academic Year, Sort By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
            {/* University Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-[#4f46e5]" />
                <span>University</span>
              </label>
              <select
                value={formFilters.university}
                onChange={(e) => setFormFilters((prev) => ({ ...prev, university: e.target.value }))}
                className="w-full h-10 px-3 bg-white border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] font-medium focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100 outline-none transition-all cursor-pointer"
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
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#4f46e5]" />
                <span>Semester</span>
              </label>
              <select
                value={formFilters.semester}
                onChange={(e) => setFormFilters((prev) => ({ ...prev, semester: e.target.value }))}
                className="w-full h-10 px-3 bg-white border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] font-medium focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100 outline-none transition-all cursor-pointer"
              >
                <option value="">All Semesters (1–8)</option>
                {SEMESTERS.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-[#4f46e5]" />
                <span>Subject</span>
              </label>
              <select
                value={formFilters.subject}
                onChange={(e) => setFormFilters((prev) => ({ ...prev, subject: e.target.value }))}
                className="w-full h-10 px-3 bg-white border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] font-medium focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100 outline-none transition-all cursor-pointer"
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
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#4f46e5]" />
                <span>Academic Year</span>
              </label>
              <select
                value={formFilters.academicYear}
                onChange={(e) => setFormFilters((prev) => ({ ...prev, academicYear: e.target.value }))}
                className="w-full h-10 px-3 bg-white border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] font-medium focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100 outline-none transition-all cursor-pointer"
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
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3 text-[#4f46e5]" />
                <span>Sort By</span>
              </label>
              <div className="relative">
                <select
                  value={formFilters.sortBy}
                  onChange={(e) =>
                    setFormFilters((prev) => ({
                      ...prev,
                      sortBy: e.target.value as SearchFilters['sortBy'],
                    }))
                  }
                  className="w-full h-10 pl-3 pr-8 bg-white border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] font-medium focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100 outline-none transition-all cursor-pointer"
                >
                  <option value="recent">Latest Uploads</option>
                  <option value="downloads">Most Downloaded</option>
                  <option value="relevant">Most Relevant</option>
                </select>
                <div className="pointer-events-none absolute right-2.5 top-3 text-slate-400">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Metadata Bar: Count & Active Filter Tags */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-bold text-[#0f172a] tracking-tight">
              Search Results
            </h2>
            <span className="text-xs bg-[#eef2ff] text-[#4338ca] font-semibold px-2.5 py-0.5 rounded-full border border-[#e0e7ff] font-mono">
              {totalCount} {totalCount === 1 ? 'matching resource' : 'matching resources'}
            </span>
          </div>

          {/* Active Filter Badges */}
          {hasAnyActiveFilter && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium text-[11px]">Filters:</span>

              {activeFilters.query && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-slate-700 rounded-full border border-[#e2e8f0] text-xs font-medium">
                  <span>&quot;{activeFilters.query}&quot;</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter('query')}
                    className="hover:text-rose-500 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {activeFilters.university && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#eef2ff] text-[#4338ca] rounded-full border border-[#e0e7ff] text-xs font-medium">
                  <span>{activeFilters.university}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter('university')}
                    className="hover:text-rose-500 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {activeFilters.semester && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#eef2ff] text-[#4338ca] rounded-full border border-[#e0e7ff] text-xs font-medium">
                  <span>{activeFilters.semester}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter('semester')}
                    className="hover:text-rose-500 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {activeFilters.subject && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#eef2ff] text-[#4338ca] rounded-full border border-[#e0e7ff] text-xs font-medium">
                  <span>{activeFilters.subject}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter('subject')}
                    className="hover:text-rose-500 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {activeFilters.resourceType && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#eef2ff] text-[#4338ca] rounded-full border border-[#e0e7ff] text-xs font-medium">
                  <span>{activeFilters.resourceType}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter('resourceType')}
                    className="hover:text-rose-500 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {activeFilters.academicYear && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#eef2ff] text-[#4338ca] rounded-full border border-[#e0e7ff] text-xs font-medium">
                  <span>{activeFilters.academicYear}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter('academicYear')}
                    className="hover:text-rose-500 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 underline ml-1 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Loading State: Skeleton Cards */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#e2e8f0] p-6 space-y-4 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="h-5 w-20 bg-slate-200 rounded-full" />
                  <div className="h-5 w-16 bg-slate-200 rounded-full" />
                </div>
                <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />
                <div className="h-4 w-1/2 bg-slate-100 rounded-lg" />
                <div className="space-y-2 pt-2">
                  <div className="h-3 w-full bg-slate-100 rounded" />
                  <div className="h-3 w-5/6 bg-slate-100 rounded" />
                </div>
                <div className="pt-4 border-t border-[#f1f5f9] flex items-center justify-between">
                  <div className="h-6 w-24 bg-slate-200 rounded-full" />
                  <div className="h-8 w-20 bg-slate-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && fetchError && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-xl mx-auto space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-rose-900">Database Connection Error</h3>
            <p className="text-xs text-rose-700 leading-relaxed">{fetchError}</p>
            <button
              type="button"
              onClick={() => fetchResources(1, false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Search</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !fetchError && resources.length === 0 && (
          <EmptyState
            type="search"
            title="No Matching Academic Resources Found"
            description={
              hasAnyActiveFilter
                ? 'No documents matched your specific query or filter combination in the Supabase repository. Try adjusting your search keywords, broadening the semester, or resetting the filters.'
                : 'The academic repository currently has no indexed resources matching this view. Check back soon or upload verified notes.'
            }
            actionText="Reset All Filters"
            onAction={handleResetFilters}
          />
        )}

        {/* Results Grid */}
        {!isLoading && !fetchError && resources.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((res) => (
                <ResourceCard
                  key={res.id}
                  resource={res}
                  onQuickPreview={(target) => setPreviewResource(target)}
                />
              ))}
            </div>

            {/* Pagination / Load More Button */}
            {resources.length < totalCount && (
              <div className="pt-8 text-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-6 py-3 bg-white hover:bg-[#eef2ff] text-[#4f46e5] hover:text-[#4338ca] border border-[#cbd5e1] hover:border-[#4f46e5] text-xs font-bold rounded-2xl shadow-xs transition-all flex items-center gap-2 mx-auto disabled:opacity-50 cursor-pointer"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#4f46e5]" />
                      <span>Loading More Resources...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        Load More Resources ({resources.length} of {totalCount} shown)
                      </span>
                    </>
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
        <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#4f46e5]/20 border-t-[#4f46e5] rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Initializing Academic Search Engine...</p>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
