'use client';

import React, { useRef } from 'react';
import { Search, X, Command } from 'lucide-react';

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
  placeholder = 'Search by subject code, title, exam year, or author...',
  className = '',
  suggestions = ['Data Structures PYQs', 'Operating Systems', 'DBMS Manual', 'Computer Networks', 'Discrete Mathematics'],
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
        <div className="absolute left-3.5 pointer-events-none text-[#71717a] group-focus-within:text-[#1d3b64] transition-colors">
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-2.5 bg-white border border-[#e5e2db] rounded-md text-[#18181b] placeholder-[#a1a1aa] text-xs sm:text-sm font-normal shadow-2xs hover:border-[#c9c4b8] focus:border-[#1d3b64] focus:ring-1 focus:ring-[#1d3b64] transition-all outline-none"
        />

        {value ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-1 text-[#71717a] hover:text-[#18181b] hover:bg-[#f4f2ee] rounded transition-colors cursor-pointer"
            title="Clear search query"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="hidden sm:flex absolute right-3 items-center gap-1 text-[10px] font-mono text-[#71717a] bg-[#f4f2ee] px-1.5 py-0.5 rounded border border-[#e5e2db]">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        )}
      </div>

      {/* Suggested Academic Topics */}
      {suggestions && suggestions.length > 0 && !value && (
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 text-xs text-[#71717a] scrollbar-none">
          <span className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-[#71717a] mr-1">
            Common Searches:
          </span>
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                if (onSelectSuggestion) onSelectSuggestion(item);
                else onChange(item);
              }}
              className="shrink-0 px-2.5 py-0.5 bg-[#f4f2ee] hover:bg-white hover:text-[#1d3b64] hover:border-[#c9c4b8] border border-[#e5e2db] rounded text-[#52525b] font-medium transition-colors cursor-pointer text-xs"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
