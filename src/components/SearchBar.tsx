'use client';

import React, { useRef } from 'react';
import { Search, X, Sparkles } from 'lucide-react';

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
  placeholder = 'Search notes, PYQs, subjects...',
  className = '',
  suggestions = ['DSA PYQ', 'Operating Systems', 'Lab Manual', 'Engineering Math', 'DBMS'],
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
        <div className="absolute left-4 pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
          <Search className="w-5 h-5" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-11 py-3.5 bg-white border border-slate-200/90 rounded-2xl text-slate-900 placeholder-slate-400 text-sm md:text-base font-normal shadow-sm hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
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
          <div className="hidden sm:flex absolute right-4 items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            <span>ESC to clear</span>
          </div>
        )}
      </div>

      {/* Quick Search Chips */}
      {suggestions && suggestions.length > 0 && !value && (
        <div className="flex items-center gap-2 mt-2.5 overflow-x-auto pb-1 text-xs text-slate-500">
          <span className="flex items-center gap-1 shrink-0 font-medium text-slate-400 text-[11px]">
            <Sparkles className="w-3 h-3 text-teal-500" />
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
              className="shrink-0 px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200/80 rounded-lg text-slate-600 font-medium transition-colors cursor-pointer text-xs"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
