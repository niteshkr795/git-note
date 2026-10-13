import React from 'react';
import { UploadForm } from '@/components/UploadForm';
import { BookOpen, CheckCircle, FileCheck, Shield, Sparkles, UploadCloud } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Upload Academic Resource | GitNote',
  description: 'Contribute exam solutions, class notes, or lab manuals to the student community.',
};

export default function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
          <UploadCloud className="w-4 h-4" />
          <span>Student Contributor Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Upload Academic Resource
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
          Provide syllabus metadata, semester, and subject classification so classmates can effortlessly discover your notes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Upload Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
          <UploadForm />
        </div>

        {/* Side Tips & Guidelines Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-500" />
              Quality Contribution Checklist
            </h3>

            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Legible Scans:</strong> Ensure handwriting or printed text is clear with good lighting and upright orientation.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Descriptive Title:</strong> Mention specific topics (e.g., &quot;AVL Trees & Dijkstra PYQ Solutions&quot; instead of just &quot;Notes&quot;).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Accurate Semester:</strong> Tag the exact university semester to assist juniors in search.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Supported Formats:</strong> PDF documents are strongly recommended for seamless browser reading.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-[#0a1128] text-white rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>Community Trust</span>
            </div>
            <h4 className="font-bold text-sm text-white">Earn Karma & Badges</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every verified contribution adds 50 points to your student profile and unlocks contributor accolades.
            </p>
            <div className="pt-2">
              <Link
                href="/profile"
                className="text-xs text-teal-300 hover:text-teal-200 font-semibold underline underline-offset-4"
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
