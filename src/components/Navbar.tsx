'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useResources } from '@/context/ResourceContext';
import {
  UploadCloud,
  Bookmark,
  User,
  Menu,
  X,
  Home,
  LogOut,
  Search,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { userProfile, addToast } = useResources();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const displayName = user
    ? user.user_metadata?.full_name || user.email?.split('@')[0] || userProfile.name
    : userProfile.name;
  const displayInitial = (displayName || 'S').charAt(0).toUpperCase();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      addToast('info', 'Signed Out', 'You have been signed out of GitNote.');
      router.push('/');
      router.refresh();
    } finally {
      setIsSigningOut(false);
      setMobileMenuOpen(false);
    }
  };

  interface NavLinkItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    highlight?: boolean;
  }

  const navLinks: NavLinkItem[] = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/upload', label: 'Upload', icon: UploadCloud, highlight: true },
    { href: '/profile?tab=bookmarks', label: 'Bookmarks', icon: Bookmark },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path === '/search' && (pathname === '/search' || pathname.startsWith('/search/'))) return true;
    if (path !== '/' && path !== '/search' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/10 text-white transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white shadow-md border border-white/20 group-hover:scale-105 transition-transform flex items-center justify-center p-0.5">
                <Image
                  src="/logo.png"
                  alt="GitNote Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain rounded-lg"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-white font-mono">
                    Git<span className="text-[#818cf8]">Note</span>
                  </span>
                  <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    Academic
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
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      active
                        ? 'bg-white/10 text-white shadow-inner border border-white/10'
                        : link.highlight
                        ? 'text-indigo-300 hover:text-white hover:bg-indigo-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Section */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/upload"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#4f46e5] text-white hover:bg-[#4338ca] hover:scale-[1.01] active:bg-[#3730a3] transition-all shadow-sm"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Share Notes</span>
                </Link>

                {/* User Profile Mini Pill */}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white shadow-2xs overflow-hidden">
                    {displayInitial}
                  </div>
                  <span className="text-xs font-medium text-slate-200 group-hover:text-white max-w-[120px] truncate">
                    {displayName.split(' ')[0]}
                  </span>
                </Link>

                {/* Sign Out Button */}
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  title="Sign Out"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#4f46e5] text-white hover:bg-[#4338ca] hover:scale-[1.01] active:bg-[#3730a3] transition-all shadow-sm"
                >
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu hamburger toggle */}
          <div className="flex md:hidden items-center gap-1.5">
            <Link
              href="/search"
              className={`p-2 rounded-xl transition-colors ${
                isActive('/search')
                  ? 'bg-white/10 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              aria-label="Search Resources"
            >
              <Search className="w-5 h-5" />
            </Link>
            <Link
              href="/upload"
              className="p-2 text-indigo-400 hover:text-white hover:bg-white/10 rounded-xl"
              aria-label="Upload"
            >
              <UploadCloud className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0f172a] border-b border-white/10 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-white/10 text-white'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            {user ? (
              <>
                <div className="flex items-center justify-between text-xs text-slate-400 px-3 py-1">
                  <span>Signed in as:</span>
                  <span className="font-semibold text-white truncate max-w-[180px]">{displayName}</span>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold bg-white/10 text-white rounded-xl hover:bg-white/15"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold bg-[#4f46e5] text-white rounded-xl hover:bg-[#4338ca]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
