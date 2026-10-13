'use client';

import React from 'react';
import Link from 'next/link';
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
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface SidebarProps {
  activeTypeFilter?: string;
  onSelectType?: (type: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTypeFilter,
  onSelectType,
}) => {
  const mainNav = [
    { label: 'All Collections', type: '', icon: Compass, count: '48+' },
    { label: 'Past Papers (PYQs)', type: 'PYQ', icon: FileQuestion, count: '18' },
    { label: 'Verified Class Notes', type: 'Notes', icon: FileText, count: '14' },
    { label: 'Lab Manuals & Code', type: 'Lab Manual', icon: FlaskConical, count: '8' },
    { label: 'Assignments & Solns', type: 'Assignment', icon: BookMarked, count: '5' },
    { label: 'Revision Cheat Sheets', type: 'Study Material', icon: Sparkles, count: '3' },
  ];

  return (
    <aside className="w-72 shrink-0 hidden lg:block space-y-5">
      {/* Navigation Category Card */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between px-3 mb-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Academic Library
          </span>
          <span className="text-[10px] font-semibold text-[#4338ca] bg-[#eef2ff] px-2 py-0.5 rounded-full border border-[#e0e7ff]">
            Indexed
          </span>
        </div>

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
                    ? 'bg-[#4f46e5] text-white shadow-sm'
                    : 'text-[#334155] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isSelected ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isSelected ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-200" />
                ) : (
                  <span className="text-[10px] font-mono text-slate-400 font-normal">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Actions Contributor Card */}
      <div className="bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] rounded-2xl p-5 text-white shadow-sm space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#7c3aed]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
          <UploadCloud className="w-4 h-4" />
          <span>Contribute & Earn Karma</span>
        </div>
        <div>
          <h4 className="font-bold text-sm text-white">Share Your Lecture Notes</h4>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            Help peer students ace semester exams. Upload past exam papers, handwritten notes, or verified lab exercises.
          </p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center justify-center w-full py-2.5 px-3 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold text-xs transition-all shadow-sm hover:scale-[1.01]"
        >
          Upload Academic PDF
        </Link>
      </div>

      {/* Peer Review & Academic Standards */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-xs text-xs text-slate-600 space-y-3">
        <div className="flex items-center gap-2 font-bold text-[#0f172a]">
          <ShieldCheck className="w-4 h-4 text-[#10b981]" />
          <span>Curated Syllabus Match</span>
        </div>
        <p className="text-[11px] text-[#475569] leading-relaxed">
          Every uploaded resource is verified against current university course syllabi to ensure exam relevance and accuracy.
        </p>
        <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between text-[11px] text-slate-400">
          <span>Active Semester: <strong>Even 2026</strong></span>
          <span className="text-[#047857] font-semibold bg-[#ecfdf5] px-1.5 py-0.5 rounded-full border border-[#a7f3d0]">Live</span>
        </div>
      </div>
    </aside>
  );
};
