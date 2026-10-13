'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  FileText,
  GraduationCap,
  ClipboardList,
  FlaskConical,
  ArrowRight,
  UploadCloud,
  Search,
  BookOpen,
  Calendar,
  Download,
  CheckCircle2,
} from 'lucide-react';

interface RecentResource {
  id: string;
  title: string;
  description: string | null;
  resource_type: string;
  subject_name: string;
  semester: string;
  academic_year: string;
  file_format: string;
  file_size: string | null;
  download_count: number;
  created_at: string;
  uploader?: {
    id: string;
    full_name: string;
    college: string;
  } | null;
}

const CATEGORIES = [
  {
    title: 'Notes',
    description: 'Lecture notes, revision summaries, and unit formulas',
    href: '/search?type=Notes',
    icon: FileText,
    accent: 'text-indigo-600 bg-indigo-50 border-indigo-100',
  },
  {
    title: 'PYQs',
    description: 'Previous year semester examination question papers',
    href: '/search?type=PYQs',
    icon: GraduationCap,
    accent: 'text-amber-600 bg-amber-50 border-amber-100',
  },
  {
    title: 'Assignments',
    description: 'Solved tutorial sheets, problem sets, and questions',
    href: '/search?type=Assignments',
    icon: ClipboardList,
    accent: 'text-sky-600 bg-sky-50 border-sky-100',
  },
  {
    title: 'Lab Manuals',
    description: 'Practical files, experiment procedures, and code sheets',
    href: '/search?type=Lab+Manuals',
    icon: FlaskConical,
    accent: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  },
];

export default function HomePage() {
  const [recentResources, setRecentResources] = useState<RecentResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRecent() {
      try {
        const { data, error } = await supabase
          .from('resources')
          .select(`
            id,
            title,
            description,
            resource_type,
            subject_name,
            semester,
            academic_year,
            file_format,
            file_size,
            download_count,
            created_at,
            uploader:profiles!uploader_id(
              id,
              full_name,
              college
            )
          `)
          .order('created_at', { ascending: false })
          .limit(6);

        if (!error && data) {
          const mapped = data.map((item: any) => ({
            ...item,
            uploader: Array.isArray(item.uploader) ? item.uploader[0] : item.uploader,
          }));
          setRecentResources(mapped);
        }
      } catch (err) {
        console.error('Error fetching recent resources:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadRecent();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between">
      <div>
        {/* Hero Section */}
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Your Academic Resources, <br className="hidden sm:inline" />
              All in One Place.
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Discover and share notes, previous year question papers, assignments, and study materials
              with your academic community.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/search"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#4f46e5] text-white text-sm font-semibold hover:bg-[#4338ca] transition-colors shadow-xs"
              >
                <span>Explore Resources</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/upload"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <UploadCloud className="w-4 h-4 text-slate-500" />
                <span>Upload Resource</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Resource Categories Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Resource Categories</h2>
              <p className="text-xs text-slate-500">Browse materials organized by academic format</p>
            </div>
            <Link
              href="/search"
              className="text-xs font-semibold text-[#4f46e5] hover:text-[#4338ca] inline-flex items-center gap-1"
            >
              <span>View all in Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.title}
                  href={cat.href}
                  className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center border mb-3 ${cat.accent}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm group-hover:text-[#4f46e5] transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-medium text-slate-500 group-hover:text-[#4f46e5]">
                    <span>Browse {cat.title}</span>
                    <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Recently Added Resources Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recently Added</h2>
              <p className="text-xs text-slate-500">Latest academic uploads from verified students</p>
            </div>
            {recentResources.length > 0 && (
              <Link
                href="/search"
                className="text-xs font-semibold text-[#4f46e5] hover:text-[#4338ca] inline-flex items-center gap-1"
              >
                <span>Browse all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 animate-pulse"
                >
                  <div className="h-4 w-24 bg-slate-100 rounded" />
                  <div className="h-5 w-3/4 bg-slate-200 rounded" />
                  <div className="h-3 w-1/2 bg-slate-100 rounded" />
                  <div className="pt-3 border-t border-slate-100 h-4 w-full bg-slate-50 rounded" />
                </div>
              ))}
            </div>
          ) : recentResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentResources.map((res) => (
                <Link
                  key={res.id}
                  href={`/resources/${res.id}`}
                  className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-xs text-[#4f46e5] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {res.resource_type}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{res.semester}</span>
                    </div>

                    <h3 className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-[#4f46e5] transition-colors line-clamp-2">
                      {res.title}
                    </h3>

                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {res.subject_name} • {res.academic_year}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[160px]">
                      {res.uploader?.full_name || 'Student Contributor'}
                    </span>
                    <span className="font-medium text-slate-600">{res.file_format || 'PDF'}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Simple, clean, natural empty state */
            <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 text-center max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">No resources uploaded yet</h3>
              <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                Be the first to share lecture notes, previous question papers, or lab manuals with your
                classmates, or search existing course materials.
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#4f46e5] text-white text-xs font-semibold hover:bg-[#4338ca] transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Resource</span>
                </Link>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  <span>Explore Search</span>
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
