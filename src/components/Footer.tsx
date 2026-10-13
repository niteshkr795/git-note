'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, ShieldCheck, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0f172a] text-slate-300 border-t border-white/10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white p-0.5 flex items-center justify-center shadow-md overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="GitNote Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <span className="font-bold text-lg text-white font-mono">
                Git<span className="text-[#818cf8]">Note</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A modern academic resource exchange prioritizing university exam readiness, verified syllabus alignment, and student collaboration.
            </p>
            <p className="text-[11px] font-mono text-[#818cf8]">
              Academic Precision • Learn. Share. Discover.
            </p>
          </div>

          {/* Academic Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Academic Library
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/search?type=PYQs" className="hover:text-white transition-colors">
                  Previous Year Papers (PYQ)
                </Link>
              </li>
              <li>
                <Link href="/search?type=Notes" className="hover:text-white transition-colors">
                  Handwritten Class Notes
                </Link>
              </li>
              <li>
                <Link href="/search?type=Lab+Manuals" className="hover:text-white transition-colors">
                  Lab Manuals & Practical Code
                </Link>
              </li>
              <li>
                <Link href="/search?type=Assignments" className="hover:text-white transition-colors">
                  Assignment Solutions
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Platform Hub
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/search" className="hover:text-white transition-colors">
                  Explore Resources
                </Link>
              </li>
              <li>
                <Link href="/upload" className="hover:text-white transition-colors">
                  Upload Notes & Solns
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition-colors">
                  Student Profile
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Account Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Safety */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Academic Integrity
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Curated for college students to foster peer learning. Uploaded materials adhere to university course syllabi.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#34d399]">
              <ShieldCheck className="w-4 h-4 text-[#10b981]" />
              <span>Verified Student Network</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 GitNote. Designed with Academic Precision.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted for collegiate success</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
