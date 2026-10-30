import React from 'react';
import { UploadForm } from '@/components/UploadForm';
import { CheckCircle2, ShieldCheck, BookOpen, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Deposit Academic Resource | GitNote',
  description: 'Contribute exam solutions, class lecture notes, or laboratory manuals to the institutional repository.',
};

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Page Header */}
        <div className="mb-10 pb-8 border-b border-[var(--color-paper-border)]">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--color-muted)] mb-2">
            <span>Archival Intake</span>
            <span>/</span>
            <span>Digital Repository</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[var(--color-foreground)] font-normal tracking-tight">
            Deposit Academic Resource
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-2 max-w-2xl leading-relaxed">
            Submit course materials, solved question papers, and laboratory journals. Accurate metadata ensures discovery across departments and semesters.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Upload Form */}
          <div className="lg:col-span-8 bg-white rounded-lg border border-[var(--color-paper-border)] p-6 sm:p-8 shadow-xs">
            <UploadForm />
          </div>

          {/* Side Editorial Guidelines Dossier */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-lg border border-[var(--color-paper-border)] p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[var(--color-paper-border)]">
                <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />
                <h3 className="font-serif text-sm font-semibold text-[var(--color-foreground)] tracking-tight">
                  Archival Deposit Criteria
                </h3>
              </div>

              <ul className="space-y-3.5 text-xs text-[var(--color-foreground)]/80 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-medium text-[var(--color-foreground)]">Legible Scans:</strong> Ensure handwriting or printed text has sharp contrast and proper upright page orientation.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-medium text-[var(--color-foreground)]">Descriptive Title:</strong> State course module and topic explicitly (e.g. <em>&quot;Unit 3: AVL Trees &amp; Dijkstra PYQ Solutions&quot;</em>).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-medium text-[var(--color-foreground)]">Classification:</strong> Accurately assign semester and subject code for targeted filtering.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-medium text-[var(--color-foreground)]">PDF Standard:</strong> Standard searchable PDFs are favored for universal browser rendering.
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-[var(--color-paper-accent)] rounded-lg border border-[var(--color-paper-border)] p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--color-accent)]">
                <ShieldCheck className="w-4 h-4" />
                <span>Open Scholarly Access</span>
              </div>
              <h4 className="font-serif font-semibold text-sm text-[var(--color-foreground)]">
                Campus Contributor Registry
              </h4>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                Submissions are indexed with your student author profile to establish academic provenance and assist peer learning.
              </p>
              <div className="pt-1">
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline font-medium"
                >
                  <span>Review your cataloged deposits</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
