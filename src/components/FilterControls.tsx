'use client';

import React from 'react';
import { FilterState } from '@/types';
import { SUBJECTS, SEMESTERS, RESOURCE_TYPES, ACADEMIC_YEARS } from '@/data/mockData';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

interface FilterControlsProps {
  filters: FilterState;
  onChange: (updatedFilters: Partial<FilterState>) => void;
  onReset: () => void;
  totalResults: number;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onChange,
  onReset,
  totalResults,
}) => {
  const hasActiveFilters = Boolean(
    filters.semester ||
    filters.subject ||
    filters.resourceType ||
    filters.academicYear ||
    filters.searchQuery ||
    filters.sortBy !== 'recent'
  );

  return (
    <div className="bg-white border border-[#e5e2db] rounded-md p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Top Header Row with Active Counts and Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#eeece6]">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-[#f4f2ee] text-[#1d3b64] rounded border border-[#e5e2db]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <span className="font-editorial text-sm font-semibold text-[#18181b]">
            Catalog Filters
          </span>
          <span className="text-xs font-mono bg-[#f4f2ee] text-[#52525b] px-2 py-0.5 rounded border border-[#e5e2db]">
            {totalResults} {totalResults === 1 ? 'record' : 'records'}
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-medium text-[#991b1b] hover:text-[#7f1d1d] hover:bg-[#fef2f2] px-2 py-1 rounded transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset all filters</span>
          </button>
        )}
      </div>

      {/* Primary Format Filter Segmented Bar */}
      <div>
        <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717a] mb-2">
          Document Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ resourceType: '' })}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              filters.resourceType === ''
                ? 'bg-[#1d3b64] text-white border border-[#152b49] shadow-2xs'
                : 'bg-[#f4f2ee] hover:bg-[#eae7e0] text-[#52525b] border border-[#e5e2db]'
            }`}
          >
            All Types
          </button>
          {RESOURCE_TYPES.map((type) => {
            const isSelected = filters.resourceType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => onChange({ resourceType: isSelected ? '' : type })}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#1d3b64] text-white border border-[#152b49] shadow-2xs'
                    : 'bg-[#f4f2ee] hover:bg-[#eae7e0] text-[#52525b] border border-[#e5e2db]'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Multi-Criteria Dropdowns: Semester, Subject, Academic Year, Sort By */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
        {/* Semester Select */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717a] mb-1">
            Semester
          </label>
          <select
            value={filters.semester}
            onChange={(e) => onChange({ semester: e.target.value })}
            className="w-full h-9 px-2.5 bg-white border border-[#e5e2db] rounded text-xs text-[#18181b] font-medium focus:border-[#1d3b64] focus:ring-1 focus:ring-[#1d3b64] outline-none transition-colors cursor-pointer"
          >
            <option value="">All Semesters</option>
            {SEMESTERS.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Select */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717a] mb-1">
            Course Subject
          </label>
          <select
            value={filters.subject}
            onChange={(e) => onChange({ subject: e.target.value })}
            className="w-full h-9 px-2.5 bg-white border border-[#e5e2db] rounded text-xs text-[#18181b] font-medium focus:border-[#1d3b64] focus:ring-1 focus:ring-[#1d3b64] outline-none transition-colors cursor-pointer"
          >
            <option value="">All Subjects</option>
            {SUBJECTS.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        {/* Academic Year Select */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717a] mb-1">
            Academic Year
          </label>
          <select
            value={filters.academicYear}
            onChange={(e) => onChange({ academicYear: e.target.value })}
            className="w-full h-9 px-2.5 bg-white border border-[#e5e2db] rounded text-xs text-[#18181b] font-medium focus:border-[#1d3b64] focus:ring-1 focus:ring-[#1d3b64] outline-none transition-colors cursor-pointer"
          >
            <option value="">All Years</option>
            {ACADEMIC_YEARS.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By Select */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717a] mb-1">
            Sort Order
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ sortBy: e.target.value as any })}
            className="w-full h-9 px-2.5 bg-white border border-[#e5e2db] rounded text-xs text-[#18181b] font-medium focus:border-[#1d3b64] focus:ring-1 focus:ring-[#1d3b64] outline-none transition-colors cursor-pointer"
          >
            <option value="recent">Most Recent First</option>
            <option value="downloads">Most Downloaded</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>
    </div>
  );
};
