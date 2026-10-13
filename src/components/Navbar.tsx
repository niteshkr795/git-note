'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useResources } from '@/context/ResourceContext';
import {
  BookOpen,
  UploadCloud,
  Bookmark,
  User,
  Menu,
  X,
  Sparkles,
  Compass,
  LogIn,
  Search,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { userProfile } = useResources();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Explore', icon: Compass },
    { href: '/upload', label: 'Upload Resource', icon: UploadCloud, highlight: true },
    { href: '/profile?tab=bookmarks', label: 'Bookmarks', icon: Bookmark },
    { href: '/profile', label: 'My Profile', icon: User },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a1128]/95 backdrop-blur-md border-b border-slate-800 text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-400 p-[2px] shadow-md group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#0a1128] rounded-[10px] flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-teal-400 group-hover:rotate-6 transition-transform" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-white font-mono">
                    Git<span className="text-teal-400">Note</span>
                  </span>
                  <span className="text-[10px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 px-1.5 py-0.2 rounded uppercase tracking-wider">
                    v1.0
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Learn. Share. Discover.
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 ml-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-white/10 text-white font-semibold shadow-inner'
                        : link.highlight
                        ? 'text-teal-300 hover:text-white hover:bg-teal-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-teal-400' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Section */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              Sign In
            </Link>

            <Link
              href="/signup"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm"
            >
              Register
            </Link>

            {/* User Profile Mini Badge */}
            <div className="h-6 w-px bg-slate-800 mx-1" />

            <Link
              href="/profile"
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-white/10 transition-colors group"
            >
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-500/50 group-hover:ring-teal-400"
              />
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-white leading-tight">
                  {userProfile.name}
                </span>
                <span className="text-[10px] text-teal-400 leading-tight">
                  {userProfile.semester}
                </span>
              </div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/profile"
              className="flex items-center p-1 rounded-full hover:bg-white/10"
            >
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-teal-400"
              />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0a1128] px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top duration-200">
          <div className="pb-2 mb-2 border-b border-slate-800/80">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold px-2 mb-1">
              Navigation
            </div>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    active
                      ? 'bg-blue-600/30 text-teal-300 font-semibold'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 text-teal-400" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex gap-2 pt-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 py-2 rounded-xl text-center text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/20 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 py-2 rounded-xl text-center text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
