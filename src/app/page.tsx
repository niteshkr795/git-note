'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useResources } from '@/context/ResourceContext';
import { FilterState } from '@/types';
import { SearchBar } from '@/components/SearchBar';
import { FilterControls } from '@/components/FilterControls';
import { ResourceGrid } from '@/components/ResourceGrid';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import {
  BookOpen,
  UploadCloud,
  FileText,
  FileQuestion,
  FlaskConical,
  Award,
  Sparkles,
  Search,
  CheckCircle,
  GraduationCap,
  ArrowRight,
  Flame,
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

  // Featured high-impact items for hero showcase
  const topDownloaded = useMemo(() => {
    return [...resources].sort((a, b) => b.downloadCount - a.downloadCount).slice(0, 3);
  }, [resources]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#0a1128] via-[#0e1738] to-[#14214d] text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Academic Resource Exchange for College Students</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Learn. Share. <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-blue-300 to-indigo-200">Discover.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Stop hunting through scattered WhatsApp groups and disorganized cloud drives.
              Find university previous year papers (PYQs), verified lecture notes, and lab manuals in one central hub.
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

          {/* Quick Stats Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto mt-10 pt-8 border-t border-white/10 text-center">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="block text-xl sm:text-2xl font-black text-teal-400 font-mono">10+</span>
              <span className="text-xs text-slate-300 font-medium">Subjects Covered</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="block text-xl sm:text-2xl font-black text-blue-300 font-mono">8 Sem</span>
              <span className="text-xs text-slate-300 font-medium">Full Curriculum</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="block text-xl sm:text-2xl font-black text-amber-300 font-mono">100%</span>
              <span className="text-xs text-slate-300 font-medium">Free Student Access</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="block text-xl sm:text-2xl font-black text-emerald-300 font-mono">Verified</span>
              <span className="text-xs text-slate-300 font-medium">Peer Solutions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Section Highlight (Only if not currently searching with filters) */}
        {!filters.searchQuery && !filters.resourceType && !filters.subject && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                  <Flame className="w-5 h-5 fill-amber-500" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    High-Yield Exam Favorites
                  </h2>
                  <p className="text-xs text-slate-500">
                    Most downloaded resources among university students this week
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topDownloaded.map((res) => (
                <div
                  key={res.id}
                  className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-4 border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {res.resourceType}
                      </span>
                      <span className="text-slate-500 font-medium">
                        {res.downloadCount} downloads
                      </span>
                    </div>
                    <Link href={`/resources/${res.id}`} className="hover:text-blue-600 transition-colors">
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-2 mb-1">
                        {res.title}
                      </h4>
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {res.subject} • {res.semester}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">By {res.uploader.name}</span>
                    <Link
                      href={`/resources/${res.id}`}
                      className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                    >
                      View <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Layout with Sidebar and Resource Grid */}
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
