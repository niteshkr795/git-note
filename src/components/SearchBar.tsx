'use client';

import React, { useRef } from 'react';
import { Search, X, Sparkles, Command } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  suggestions?: string[];
  onSelectSuggestion?: (item: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search by subject, PYQ year, topic, or professor...',
  className = '',
  suggestions = ['DSA PYQ 2024', 'Operating Systems Notes', 'DBMS Lab Manual', 'Computer Networks', 'Discrete Math'],
  onSelectSuggestion,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange('');
    if (onClear) onClear();
    inputRef.current?.focus();
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="relative flex items-center group">
        <div className="absolute left-4 pointer-events-none text-slate-400 group-focus-within:text-[#4f46e5] transition-colors">
          <Search className="w-5 h-5" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3.5 bg-white border border-[#cbd5e1] rounded-2xl text-[#0f172a] placeholder-slate-400 text-sm md:text-base font-normal shadow-xs hover:border-slate-400 focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
        />

        {value ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="hidden sm:flex absolute right-4 items-center gap-1 text-[11px] font-mono text-slate-400 bg-[#f8fafc] px-2 py-0.5 rounded-md border border-[#e2e8f0]">
            <Command className="w-3 h-3 text-slate-400" />
            <span>K</span>
          </div>
        )}
      </div>

      {/* Trending Search Chips */}
      {suggestions && suggestions.length > 0 && !value && (
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 text-xs text-slate-500 scrollbar-none">
          <span className="flex items-center gap-1 shrink-0 font-semibold text-slate-400 text-[11px] tracking-wide uppercase">
            <Sparkles className="w-3 h-3 text-[#7c3aed]" />
            Trending:
          </span>
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                if (onSelectSuggestion) onSelectSuggestion(item);
                else onChange(item);
              }}
              className="shrink-0 px-3 py-1 bg-white hover:bg-[#eef2ff] hover:text-[#4338ca] hover:border-[#c7d2fe] border border-[#e2e8f0] rounded-full text-slate-600 font-medium transition-all cursor-pointer text-xs shadow-2xs"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
