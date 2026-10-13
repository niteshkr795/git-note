'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  FileQuestion,
  FileText,
  FlaskConical,
  BookMarked,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  Bookmark,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { ResourceType } from '@/types';

interface SidebarProps {
  activeTypeFilter?: string;
  onSelectType?: (type: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTypeFilter,
  onSelectType,
}) => {
  const pathname = usePathname();

  const mainNav = [
    { label: 'All Resources', type: '', icon: Compass },
    { label: 'PYQ Question Papers', type: 'PYQ', icon: FileQuestion },
    { label: 'Class & Lecture Notes', type: 'Notes', icon: FileText },
    { label: 'Lab Manuals & Code', type: 'Lab Manual', icon: FlaskConical },
    { label: 'Assignments & Solutions', type: 'Assignment', icon: BookMarked },
    { label: 'Handbooks & Study Material', type: 'Study Material', icon: Sparkles },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block space-y-6">
      {/* Navigation Category Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Academic Library
        </h4>
        <nav className="space-y-1">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTypeFilter === item.type;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onSelectType && onSelectType(item.type)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0a1128] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isSelected ? 'text-teal-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Actions Card */}
      <div className="bg-gradient-to-br from-[#0a1128] to-[#15224a] rounded-2xl p-4.5 text-white shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
          <UploadCloud className="w-4 h-4" />
          <span>Contribute</span>
        </div>
        <div>
          <h4 className="font-bold text-sm text-white">Share Your Notes</h4>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            Help your college peers prepare for semester exams. Upload past papers, class notes, or lab sheets.
          </p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center justify-center w-full py-2 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
        >
          Upload Document
        </Link>
      </div>

      {/* Peer Community Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-900">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Peer Verified</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          All study materials are student-sourced and categorized by university semester syllabus guidelines.
        </p>
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>SRMCEM Network</span>
          <span className="text-emerald-600 font-medium">● 100% Free</span>
        </div>
      </div>
    </aside>
  );
};
