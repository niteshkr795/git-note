import React from 'react';
import Link from 'next/link';
import { BookOpen, Heart, Shield, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0a1128] text-slate-300 border-t border-slate-800/80 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white font-mono">
                Git<span className="text-teal-400">Note</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A centralized, student-driven platform making academic resources easier to discover, access, and share.
            </p>
            <p className="text-[11px] font-mono text-teal-400">
              Learn. Share. Discover.
            </p>
          </div>

          {/* Academic Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Resource Hub
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-teal-300 transition-colors">
                  Previous Year Papers (PYQ)
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-teal-300 transition-colors">
                  Handwritten Class Notes
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-teal-300 transition-colors">
                  Lab Manuals & Code
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-teal-300 transition-colors">
                  Assignment Solutions
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-teal-300 transition-colors">
                  Explore Library
                </Link>
              </li>
              <li>
                <Link href="/upload" className="hover:text-teal-300 transition-colors">
                  Upload Material
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-teal-300 transition-colors">
                  Student Profile
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-teal-300 transition-colors">
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
              Built for college students to foster peer learning. Uploaded materials are monitored by community guidelines.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield className="w-4 h-4 text-teal-400" />
              <span>Verified Student Network</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2025 GitNote. Academic Resource-Sharing Platform • Phase 1 MVP.</p>
          <p className="flex items-center gap-1">
            Built for college students with Next.js & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
};
