'use client';

import React from 'react';
import { FilterState } from '@/types';
import { SUBJECTS, SEMESTERS, RESOURCE_TYPES, ACADEMIC_YEARS } from '@/data/mockData';
import { SlidersHorizontal, RotateCcw, Check, Sparkles } from 'lucide-react';

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
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-800 text-sm">Filter Resources</span>
          <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full">
            {totalResults} {totalResults === 1 ? 'result' : 'results'} found
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset all
          </button>
        )}
      </div>

      {/* Primary Quick Filter Pills: Resource Type */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Resource Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ resourceType: '' })}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              filters.resourceType === ''
                ? 'bg-[#0a1128] text-white shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
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
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Select Dropdowns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {/* Semester Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Semester
          </label>
          <select
            value={filters.semester}
            onChange={(e) => onChange({ semester: e.target.value })}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer"
          >
            <option value="">All Semesters (1 - 8)</option>
            {SEMESTERS.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Subject
          </label>
          <select
            value={filters.subject}
            onChange={(e) => onChange({ subject: e.target.value })}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer"
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
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Academic Year
          </label>
          <select
            value={filters.academicYear}
            onChange={(e) => onChange({ academicYear: e.target.value })}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer"
          >
            <option value="">All Academic Years</option>
            {ACADEMIC_YEARS.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Sort Order
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ sortBy: e.target.value as FilterState['sortBy'] })}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer"
          >
            <option value="recent">Most Recent First</option>
            <option value="downloads">Most Downloaded</option>
            <option value="rating">Highest Rated (★)</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
