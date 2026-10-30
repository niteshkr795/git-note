'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Library } from 'lucide-react';
import { InstallButton } from '@/components/pwa/InstallButton';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#f4f2ee] text-[#52525b] border-t border-[#e5e2db] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded border border-[#e5e2db] bg-white p-1 flex items-center justify-center shrink-0">
                <Image
                  src="/logo.png"
                  alt="GitNote Logo"
                  width={24}
                  height={24}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-editorial text-lg font-semibold text-[#18181b]">
                Git<span className="text-[#1d3b64]">Note</span>
              </span>
            </div>
            <p className="text-xs text-[#71717a] leading-relaxed">
              An open academic resource exchange prioritizing university examination readiness, syllabus indexing, and student collaboration.
            </p>
            <p className="text-[11px] font-mono text-[#1d3b64]">
              Institutional Courseware Archive
            </p>
          </div>

          {/* Academic Categories */}
          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#18181b] mb-3">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-[#52525b]">
              <li>
                <Link href="/search?type=PYQs" className="hover:text-[#18181b] transition-colors">
                  Previous Year Papers (PYQ)
                </Link>
              </li>
              <li>
                <Link href="/search?type=Notes" className="hover:text-[#18181b] transition-colors">
                  Course & Lecture Notes
                </Link>
              </li>
              <li>
                <Link href="/search?type=Lab+Manuals" className="hover:text-[#18181b] transition-colors">
                  Lab Manuals & Practical Files
                </Link>
              </li>
              <li>
                <Link href="/search?type=Assignments" className="hover:text-[#18181b] transition-colors">
                  Tutorial Sheets & Solutions
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#18181b] mb-3">
              Repository Index
            </h4>
            <ul className="space-y-2 text-xs text-[#52525b]">
              <li>
                <Link href="/search" className="hover:text-[#18181b] transition-colors">
                  Library Catalog
                </Link>
              </li>
              <li>
                <Link href="/upload" className="hover:text-[#18181b] transition-colors">
                  Deposit Course Materials
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-[#18181b] transition-colors">
                  Student Contributor Dossier
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#18181b] transition-colors">
                  Student Sign In
                </Link>
              </li>
              <li className="pt-0.5">
                <InstallButton className="!p-0 !bg-transparent text-[#52525b] hover:text-[#18181b]" />
              </li>
            </ul>
          </div>

          {/* Governance & Safety */}
          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#18181b] mb-3">
              Academic Standards
            </h4>
            <p className="text-xs text-[#71717a] leading-relaxed mb-3">
              Curated for college students to foster peer learning. Uploaded materials adhere to verified university course syllabi.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#166534]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#166534]" />
              <span className="font-medium">Peer-Curated Academic Network</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#e5e2db] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#71717a]">
          <p>© 2026 GitNote. Dedicated to Academic Resource Sharing.</p>
          <div className="flex items-center gap-1 text-[#71717a] font-mono text-[11px]">
            <span>SRMCEM & University Network</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
