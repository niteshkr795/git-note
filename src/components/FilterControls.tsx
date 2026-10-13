'use client';

import React from 'react';
import { FilterState } from '@/types';
import { SUBJECTS, SEMESTERS, RESOURCE_TYPES, ACADEMIC_YEARS } from '@/data/mockData';
import { SlidersHorizontal, RotateCcw, ArrowUpDown, Filter } from 'lucide-react';

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
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Header Row with Active Counts and Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#eef2ff] text-[#4f46e5] rounded-lg">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <span className="font-bold text-[#0f172a] text-sm tracking-tight">Academic Filter</span>
          <span className="text-xs bg-[#eef2ff] text-[#4338ca] font-semibold px-2.5 py-0.5 rounded-full border border-[#e0e7ff] font-mono">
            {totalResults} {totalResults === 1 ? 'item' : 'items'}
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

      {/* Primary Pill Bar: Resource Type */}
      <div>
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Format Category
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ resourceType: '' })}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              filters.resourceType === ''
                ? 'bg-[#4f46e5] text-white shadow-xs'
                : 'bg-white hover:bg-[#f8fafc] text-slate-700 border border-[#e2e8f0]'
            }`}
          >
            All Formats
          </button>
          {RESOURCE_TYPES.map((type) => {
            const isSelected = filters.resourceType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => onChange({ resourceType: isSelected ? '' : type })}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#4f46e5] text-white shadow-xs'
                    : 'bg-white hover:bg-[#eef2ff] hover:text-[#4338ca] text-slate-700 border border-[#e2e8f0]'
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
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Semester
          </label>
          <select
            value={filters.semester}
            onChange={(e) => onChange({ semester: e.target.value })}
            className="w-full h-10 px-3 bg-white border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] font-medium focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100 outline-none transition-all cursor-pointer"
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
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Course Subject
          </label>
          <select
            value={filters.subject}
            onChange={(e) => onChange({ subject: e.target.value })}
            className="w-full h-10 px-3 bg-white border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] font-medium focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100 outline-none transition-all cursor-pointer"
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
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Academic Year
          </label>
          <select
            value={filters.academicYear}
            onChange={(e) => onChange({ academicYear: e.target.value })}
            className="w-full h-10 px-3 bg-white border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] font-medium focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100 outline-none transition-all cursor-pointer"
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
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Sort Order
          </label>
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => onChange({ sortBy: e.target.value as FilterState['sortBy'] })}
              className="w-full h-10 pl-3 pr-8 bg-white border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] font-medium focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100 outline-none transition-all cursor-pointer"
            >
              <option value="recent">Most Recent</option>
              <option value="downloads">Most Downloaded</option>
              <option value="rating">Highest Rated</option>
              <option value="title">Title (A to Z)</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-3 text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
