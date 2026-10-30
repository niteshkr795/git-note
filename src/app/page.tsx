'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatFileSize } from '@/lib/formatters';
import { normalizeSemester } from '@/data/mockData';
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
  CheckCircle2,
  Library,
  Layers,
  ShieldCheck,
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
    title: 'Previous Year Papers',
    code: 'PYQs',
    description: 'Past semester university question papers and answer keys',
    href: '/search?type=PYQs',
    icon: GraduationCap,
    badge: 'Exam Prep',
  },
  {
    title: 'Lecture Notes',
    code: 'Notes',
    description: 'Course lecture summaries, typed unit notes, and derivations',
    href: '/search?type=Notes',
    icon: FileText,
    badge: 'Study Notes',
  },
  {
    title: 'Lab Manuals & Practical',
    code: 'Lab Manuals',
    description: 'Experiment procedures, viva questions, and verified code',
    href: '/search?type=Lab+Manuals',
    icon: FlaskConical,
    badge: 'Laboratory',
  },
  {
    title: 'Assignments & Solns',
    code: 'Assignments',
    description: 'Tutorial sheets, weekly problem sets, and homework solutions',
    href: '/search?type=Assignments',
    icon: ClipboardList,
    badge: 'Tutorials',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
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
            file_size_bytes,
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

        let resData = data;
        if (error) {
          const fallback = await supabase
            .from('resources')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(6);
          if (!fallback.error && fallback.data) {
            resData = fallback.data as any;
          }
        }

        if (resData) {
          const mapped = resData.map((item: any) => ({
            ...item,
            file_size: formatFileSize(item.file_size_bytes, item.file_size),
            subject_name: item.subject_name || item.subject || 'General Engineering',
            semester: normalizeSemester(item.semester, 'Semester 1'),
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

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/search');
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf8] flex flex-col justify-between">
      <div>
        {/* Editorial Hero Section */}
        <section className="bg-white border-b border-[#e5e2db] py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Academic Archive Marker */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#f4f2ee] border border-[#e5e2db] text-[#52525b] text-xs font-mono mb-6">
              <Library className="w-3.5 h-3.5 text-[#1d3b64]" />
              <span>Institutional Course Repository</span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-5xl font-semibold tracking-tight text-[#18181b] leading-[1.15]">
              Curated Academic Courseware <br className="hidden sm:inline" />
              and Exam Archives.
            </h1>

            <p className="mt-4 text-sm sm:text-base text-[#52525b] max-w-2xl mx-auto leading-relaxed">
              An open, peer-curated repository of previous year university question papers, verified lecture notes, lab manuals, and tutorial solutions.
            </p>

            {/* Quick Hero Catalog Search */}
            <form onSubmit={handleHeroSearch} className="mt-8 max-w-2xl mx-auto">
              <div className="relative flex items-center shadow-2xs">
                <div className="absolute left-3.5 pointer-events-none text-[#71717a]">
                  <Search className="w-4 h-4 text-[#1d3b64]" />
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by course name, PYQ year, subject code, or topic..."
                  className="w-full pl-10 pr-28 sm:pr-32 py-3 bg-[#fbfaf8] hover:bg-white text-[#18181b] placeholder-[#a1a1aa] text-xs sm:text-sm font-normal rounded-md border border-[#e5e2db] focus:bg-white focus:border-[#1d3b64] focus:ring-1 focus:ring-[#1d3b64] outline-none transition-all"
                />

                <div className="absolute right-1.5 flex items-center">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-[#1d3b64] hover:bg-[#152b49] text-white text-xs font-medium rounded transition-colors border border-[#152b49] shadow-2xs cursor-pointer"
                  >
                    Search Library
                  </button>
                </div>
              </div>
            </form>

            {/* Action Links */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/search"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#1d3b64] text-white text-xs font-medium hover:bg-[#152b49] transition-colors border border-[#152b49] shadow-2xs"
              >
                <span>Browse Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/upload"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-[#e5e2db] bg-white text-[#18181b] text-xs font-medium hover:bg-[#f4f2ee] hover:border-[#c9c4b8] transition-colors shadow-2xs"
              >
                <UploadCloud className="w-3.5 h-3.5 text-[#52525b]" />
                <span>Deposit Course Material</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Primary Collections */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6 pb-3 border-b border-[#eeece6]">
            <div>
              <h2 className="font-editorial text-lg sm:text-xl font-semibold text-[#18181b] tracking-tight">
                Academic Library Collections
              </h2>
              <p className="text-xs text-[#71717a] mt-0.5">Organized by document format and examination utility</p>
            </div>
            <Link
              href="/search"
              className="text-xs font-medium text-[#1d3b64] hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Explore all collections</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.title}
                  href={cat.href}
                  className="group bg-white rounded-md border border-[#e5e2db] p-4 sm:p-5 hover:border-[#c9c4b8] hover:shadow-xs transition-all flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded bg-[#f4f2ee] border border-[#e5e2db] flex items-center justify-center text-[#1d3b64]">
                        <Icon className="w-4 h-4 stroke-[1.75]" />
                      </div>
                      <span className="text-[10px] font-mono text-[#71717a] bg-[#fbfaf8] px-1.5 py-0.5 rounded border border-[#e5e2db]">
                        {cat.badge}
                      </span>
                    </div>

                    <h3 className="font-editorial text-base font-semibold text-[#18181b] group-hover:text-[#1d3b64] transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-[#71717a] mt-1.5 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#f4f2ee] flex items-center text-xs font-medium text-[#52525b] group-hover:text-[#1d3b64]">
                    <span>Browse collection</span>
                    <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Recently Added Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6 pb-3 border-b border-[#eeece6]">
            <div>
              <h2 className="font-editorial text-lg sm:text-xl font-semibold text-[#18181b] tracking-tight">
                Recently Cataloged Documents
              </h2>
              <p className="text-xs text-[#71717a] mt-0.5">Latest uploads indexed by university students</p>
            </div>
            {recentResources.length > 0 && (
              <Link
                href="/search"
                className="text-xs font-medium text-[#1d3b64] hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
              >
                <span>View catalog index</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-md border border-[#e5e2db] p-4 space-y-3 animate-pulse"
                >
                  <div className="h-4 w-20 bg-[#eeece6] rounded" />
                  <div className="h-5 w-3/4 bg-[#e5e2db] rounded" />
                  <div className="h-3 w-1/2 bg-[#eeece6] rounded" />
                  <div className="pt-3 border-t border-[#eeece6] h-4 w-full bg-[#faf9f7] rounded" />
                </div>
              ))}
            </div>
          ) : recentResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentResources.map((res) => (
                <Link
                  key={res.id}
                  href={`/resources/${res.id}`}
                  className="group bg-white rounded-md border border-[#e5e2db] p-4 sm:p-5 hover:border-[#c9c4b8] hover:shadow-xs transition-all flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-mono text-[11px] font-medium text-[#1d3b64] bg-[#eef3f8] px-2 py-0.5 rounded border border-[#cfdbe8]">
                        {res.resource_type}
                      </span>
                      <span className="text-[#71717a] font-mono text-[11px] bg-[#f4f2ee] px-1.5 py-0.5 rounded border border-[#e5e2db]">
                        {res.semester}
                      </span>
                    </div>

                    <h3 className="font-editorial text-sm font-semibold text-[#18181b] leading-snug group-hover:text-[#1d3b64] transition-colors line-clamp-2">
                      {res.title}
                    </h3>

                    <p className="text-xs text-[#52525b] mt-1.5 line-clamp-1">
                      {res.subject_name} • {res.academic_year}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#f4f2ee] flex items-center justify-between text-[11px] text-[#71717a]">
                    <span className="truncate max-w-[160px]">
                      {res.uploader?.full_name || 'Student Contributor'}
                    </span>
                    <span className="font-mono text-[#52525b]">{res.file_format || 'PDF'}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#e5e2db] rounded-md p-8 sm:p-12 text-center max-w-md mx-auto shadow-2xs">
              <div className="w-10 h-10 rounded bg-[#f4f2ee] border border-[#e5e2db] text-[#1d3b64] flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-editorial text-base font-semibold text-[#18181b]">No Documents Cataloged Yet</h3>
              <p className="text-xs text-[#71717a] mt-1.5 leading-relaxed">
                Be the first to deposit lecture notes, previous question papers, or practical files for your courses.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1d3b64] text-white text-xs font-medium hover:bg-[#152b49] transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Deposit Material</span>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Archival Quality Standards / Core Values */}
        <section className="bg-white border-y border-[#e5e2db] py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#1d3b64]">
                <ShieldCheck className="w-4 h-4" />
                <span>Syllabus Verification</span>
              </div>
              <h4 className="font-editorial font-semibold text-sm text-[#18181b]">
                Accredited Course Alignment
              </h4>
              <p className="text-xs text-[#71717a] leading-relaxed">
                Materials are classified by university syllabus, academic year, and course code to ensure immediate exam relevance.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#1d3b64]">
                <Layers className="w-4 h-4" />
                <span>Structured Indexing</span>
              </div>
              <h4 className="font-editorial font-semibold text-sm text-[#18181b]">
                Semester-by-Semester Taxonomy
              </h4>
              <p className="text-xs text-[#71717a] leading-relaxed">
                Easily filter between PYQs, revision summaries, and lab files without navigating through unstructured cloud drives.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#1d3b64]">
                <Library className="w-4 h-4" />
                <span>Open Student Access</span>
              </div>
              <h4 className="font-editorial font-semibold text-sm text-[#18181b]">
                Zero Paywalls or Barriers
              </h4>
              <p className="text-xs text-[#71717a] leading-relaxed">
                Built by students, for students. Completely free access to read in-browser or download for offline exam prep.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
