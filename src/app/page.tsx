'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useResources } from '@/context/ResourceContext';
import { FilterState } from '@/types';
import { SearchBar } from '@/components/SearchBar';
import { FilterControls } from '@/components/FilterControls';
import { ResourceGrid } from '@/components/ResourceGrid';
import { Sidebar } from '@/components/Sidebar';
import {
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Layers,
  Award,
} from 'lucide-react';

export default function HomePage() {
  const { resources } = useResources();

  // Search & Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    semester: '',
    subject: '',
    resourceType: '',
    academicYear: '',
    sortBy: 'recent',
  });

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      semester: '',
      subject: '',
      resourceType: '',
      academicYear: '',
      sortBy: 'recent',
    });
  };

  // Filter & Search processing
  const filteredResources = useMemo(() => {
    return resources
      .filter((resource) => {
        // Search text matching (title, subject, tags, description, uploader)
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase().trim();
          const matchesTitle = resource.title.toLowerCase().includes(query);
          const matchesSubject = resource.subject.toLowerCase().includes(query);
          const matchesDesc = resource.description.toLowerCase().includes(query);
          const matchesUploader = resource.uploader.name.toLowerCase().includes(query);
          const matchesTags = resource.tags.some((t) => t.toLowerCase().includes(query));
          const matchesType = resource.resourceType.toLowerCase().includes(query);

          if (!matchesTitle && !matchesSubject && !matchesDesc && !matchesUploader && !matchesTags && !matchesType) {
            return false;
          }
        }

        // Semester filter
        if (filters.semester && resource.semester !== filters.semester) {
          return false;
        }

        // Subject filter
        if (filters.subject && resource.subject !== filters.subject) {
          return false;
        }

        // Resource Type filter
        if (filters.resourceType && resource.resourceType !== filters.resourceType) {
          return false;
        }

        // Academic Year filter
        if (filters.academicYear && resource.academicYear !== filters.academicYear) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'downloads') {
          return b.downloadCount - a.downloadCount;
        }
        if (filters.sortBy === 'rating') {
          return b.rating - a.rating;
        }
        if (filters.sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        // default: 'recent'
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [resources, filters]);

  // High-yield items for showcase
  const topDownloaded = useMemo(() => {
    return [...resources].sort((a, b) => b.downloadCount - a.downloadCount).slice(0, 3);
  }, [resources]);

  return (
    <div className="min-h-screen bg-[#faf8ff]">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#2e1065] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-white/10 relative overflow-hidden">
        {/* Subtle decorative background glowing meshes */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#4f46e5]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#7c3aed]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-indigo-300 text-xs font-semibold backdrop-blur-md shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#818cf8]" />
              <span>Academic Precision & Resource Exchange</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-[-0.03em] text-white leading-tight">
              Learn. Share. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-violet-300 to-sky-300">Discover.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Centralized Previous Year Papers (PYQs), professor-approved lecture notes, and lab manuals designed for collegiate academic momentum.
            </p>

            {/* Hero Search Input */}
            <div className="pt-2 max-w-2xl mx-auto">
              <SearchBar
                value={filters.searchQuery}
                onChange={(val) => handleFilterChange({ searchQuery: val })}
                onClear={() => handleFilterChange({ searchQuery: '' })}
                onSelectSuggestion={(sug) => handleFilterChange({ searchQuery: sug })}
              />
            </div>
          </div>

          {/* Academic Precision Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto mt-12 pt-8 border-t border-white/10 text-center">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-colors">
              <span className="block text-2xl sm:text-3xl font-black text-[#818cf8] font-mono tracking-tight">12+</span>
              <span className="text-xs text-slate-300 font-medium">B.Tech Subjects</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-colors">
              <span className="block text-2xl sm:text-3xl font-black text-[#a78bfa] font-mono tracking-tight">8 Sem</span>
              <span className="text-xs text-slate-300 font-medium">Curriculum Coverage</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-colors">
              <span className="block text-2xl sm:text-3xl font-black text-[#fbbf24] font-mono tracking-tight">100%</span>
              <span className="text-xs text-slate-300 font-medium">Open Student Access</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-colors">
              <span className="block text-2xl sm:text-3xl font-black text-[#34d399] font-mono tracking-tight">Verified</span>
              <span className="text-xs text-slate-300 font-medium">Peer Solutions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* High-Yield Exam Favorites Highlight (Shown when no search/filters are active) */}
        {!filters.searchQuery && !filters.resourceType && !filters.subject && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#fffbeb] text-[#b45309] rounded-xl border border-[#fde68a]">
                  <Flame className="w-5 h-5 fill-[#f59e0b]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#0f172a] tracking-tight">
                    High-Yield Exam Favorites
                  </h2>
                  <p className="text-xs text-[#475569]">
                    Top-downloaded study material and previous question papers this semester
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topDownloaded.map((res) => (
                <div
                  key={res.id}
                  className="bg-white rounded-2xl p-5 border border-[#e2e8f0] hover:border-[#cbd5e1] hover:shadow-[0_10px_20px_-3px_rgba(79,70,229,0.08)] transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2.5">
                      <span className="font-semibold text-[#b45309] bg-[#fffbeb] border border-[#fde68a] px-2.5 py-0.5 rounded-full text-[11px]">
                        {res.resourceType}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {res.downloadCount} downloads
                      </span>
                    </div>

                    <Link href={`/resources/${res.id}`} className="group-hover:text-[#4f46e5] transition-colors">
                      <h4 className="font-bold text-[#0f172a] text-sm line-clamp-2 mb-1.5 tracking-tight">
                        {res.title}
                      </h4>
                    </Link>

                    <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed">
                      {res.subject} • {res.semester}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">By {res.uploader.name}</span>
                    <Link
                      href={`/resources/${res.id}`}
                      className="text-[#4f46e5] hover:text-[#4338ca] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-all"
                    >
                      <span>Study Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 12-Column Layout: Sidebar & Resource Grid */}
        <div className="flex gap-8 items-start">
          {/* Desktop Category Sidebar */}
          <Sidebar
            activeTypeFilter={filters.resourceType}
            onSelectType={(type) => handleFilterChange({ resourceType: type })}
          />

          {/* Right Main Grid Container */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Filter Controls Bar */}
            <FilterControls
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              totalResults={filteredResources.length}
            />

            {/* Results Grid */}
            <ResourceGrid
              resources={filteredResources}
              onResetFilters={handleResetFilters}
              emptyType="search"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
