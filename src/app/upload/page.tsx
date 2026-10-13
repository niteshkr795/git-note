import React from 'react';
import { UploadForm } from '@/components/UploadForm';
import { CheckCircle2, ShieldCheck, Sparkles, UploadCloud } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Upload Academic Resource | GitNote',
  description: 'Contribute exam solutions, class notes, or lab manuals to the student community.',
};

export default function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-[#faf8ff]">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#4f46e5] uppercase tracking-wider mb-2">
          <UploadCloud className="w-4 h-4" />
          <span>Student Contributor Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
          Upload Academic Resource
        </h1>
        <p className="text-sm text-[#475569] mt-1.5 leading-relaxed">
          Provide syllabus metadata, semester, and subject classification so classmates can effortlessly discover your notes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Upload Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e2e8f0] p-6 sm:p-8 shadow-xs">
          <UploadForm />
        </div>

        {/* Side Tips & Guidelines Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-[#0f172a] text-sm flex items-center gap-2 tracking-tight">
              <Sparkles className="w-4 h-4 text-[#7c3aed]" />
              Academic Quality Checklist
            </h3>

            <ul className="space-y-3 text-xs text-[#475569]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#0f172a]">Legible Scans:</strong> Ensure handwriting or printed text is clear with good lighting and upright orientation.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#0f172a]">Descriptive Title:</strong> Mention specific topics (e.g., &quot;AVL Trees & Dijkstra PYQ Solutions&quot; instead of just &quot;Notes&quot;).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#0f172a]">Accurate Semester:</strong> Tag the exact university semester to assist juniors in search.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#0f172a]">Supported Formats:</strong> PDF documents are strongly recommended for seamless browser reading.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] text-white rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#34d399]" />
              <span>Community Trust & Accolades</span>
            </div>
            <h4 className="font-bold text-sm text-white">Earn Karma & Contributor Badges</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every verified contribution adds 50 points to your student profile and unlocks prestigious contributor badges.
            </p>
            <div className="pt-2">
              <Link
                href="/profile"
                className="text-xs text-indigo-300 hover:text-white font-semibold underline underline-offset-4"
              >
                View Your Contributor Profile →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
