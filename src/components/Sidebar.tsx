'use client';

import React from 'react';
import Link from 'next/link';
import { useResources } from '@/context/ResourceContext';
import {
  BookOpen,
  FileQuestion,
  FileText,
  FlaskConical,
  BookMarked,
  UploadCloud,
  Library,
} from 'lucide-react';

interface SidebarProps {
  activeTypeFilter?: string;
  onSelectType?: (type: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTypeFilter,
  onSelectType,
}) => {
  const { resources } = useResources();

  const getCount = (type: string) => {
    if (!type) return resources.length;
    return resources.filter((r) => r.resourceType === type).length;
  };

  const mainNav = [
    { label: 'All Cataloged Records', type: '', icon: Library, count: getCount('') },
    { label: 'Previous Year Papers (PYQs)', type: 'PYQ', icon: FileQuestion, count: getCount('PYQ') },
    { label: 'Lecture & Class Notes', type: 'Notes', icon: FileText, count: getCount('Notes') },
    { label: 'Lab Manuals & Practical', type: 'Lab Manual', icon: FlaskConical, count: getCount('Lab Manual') },
    { label: 'Tutorials & Assignments', type: 'Assignment', icon: BookMarked, count: getCount('Assignment') },
    { label: 'Syllabus & Study Guides', type: 'Study Material', icon: BookOpen, count: getCount('Study Material') },
  ];

  return (
    <aside className="w-68 shrink-0 hidden lg:block space-y-4">
      {/* Navigation Category Card */}
      <div className="bg-white border border-[#e5e2db] rounded-md p-3.5 shadow-2xs">
        <div className="flex items-center justify-between px-2.5 pb-2.5 mb-1 border-b border-[#eeece6]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#71717a]">
            Collections
          </span>
          <span className="text-[10px] font-mono text-[#52525b] bg-[#f4f2ee] px-1.5 py-0.5 rounded border border-[#e5e2db]">
            Indexed
          </span>
        </div>

        <nav className="space-y-0.5">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTypeFilter === item.type;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onSelectType && onSelectType(item.type)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#1d3b64] text-white border border-[#152b49]'
                    : 'text-[#52525b] hover:bg-[#f4f2ee] hover:text-[#18181b]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? 'text-white' : 'text-[#71717a]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                <span
                  className={`text-[10px] font-mono shrink-0 ml-1.5 ${
                    isSelected ? 'text-white/80' : 'text-[#a1a1aa]'
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contributor Card: Practical Academic Archiving */}
      <div className="bg-[#fbfaf8] border border-[#e5e2db] rounded-md p-4 text-[#18181b] shadow-2xs space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#1d3b64]">
          <Library className="w-3.5 h-3.5" />
          <span>Academic Deposit</span>
        </div>

        <p className="text-xs text-[#52525b] leading-relaxed">
          Help build a peer-reviewed repository by depositing lecture notes, semester exams, and practical solutions.
        </p>

        <Link
          href="/upload"
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-medium bg-[#1d3b64] text-white hover:bg-[#152b49] transition-colors border border-[#152b49] shadow-2xs"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Contribute Material</span>
        </Link>
      </div>
    </aside>
  );
};
