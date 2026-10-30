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
  Compass,
  LogOut,
  BookOpen,
} from 'lucide-react';
import { InstallButton } from '@/components/pwa/InstallButton';

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
  const displayAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.avatar || userProfile.avatar;
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
  }

  const navLinks: NavLinkItem[] = [
    { href: '/search', label: 'Library Catalog', icon: BookOpen },
    { href: '/upload', label: 'Deposit Material', icon: UploadCloud },
    { href: '/profile?tab=bookmarks', label: 'Saved Papers', icon: Bookmark },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path === '/search' && (pathname === '/search' || pathname.startsWith('/search/'))) return true;
    if (path !== '/' && path !== '/search' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xs border-b border-[#e5e2db] text-[#18181b] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Brand Logo & Editorial Wordmark */}
          <div className="flex items-center gap-7">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded border border-[#e5e2db] bg-[#fbfaf8] p-1 flex items-center justify-center shrink-0">
                <Image
                  src="/logo.png"
                  alt="GitNote Logo"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-editorial text-xl font-semibold tracking-tight text-[#18181b]">
                  Git<span className="text-[#1d3b64]">Note</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-wider text-[#71717a] border border-[#e5e2db] bg-[#f4f2ee] px-1.5 py-0.5 rounded">
                  Archive
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      active
                        ? 'bg-[#f4f2ee] text-[#18181b] font-semibold border border-[#e5e2db]'
                        : 'text-[#52525b] hover:text-[#18181b] hover:bg-[#faf9f7]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#1d3b64]' : 'text-[#71717a]'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Navigation & Student Account */}
          <div className="hidden sm:flex items-center gap-3">
            <InstallButton className="text-xs text-[#52525b] hover:text-[#18181b]" />

            <Link
              href="/upload"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#1d3b64] text-white hover:bg-[#152b49] transition-colors border border-[#152b49] shadow-2xs"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Contribute</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[#e5e2db]">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-md border border-[#e5e2db] hover:border-[#c9c4b8] bg-[#fbfaf8] hover:bg-white transition-colors group"
                >
                  <div className="w-6 h-6 rounded bg-[#1d3b64] text-white flex items-center justify-center text-[11px] font-semibold font-mono shrink-0 overflow-hidden">
                    {displayAvatar ? (
                      <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      displayInitial
                    )}
                  </div>
                  <span className="text-xs font-medium text-[#18181b] truncate max-w-[120px]">
                    {displayName.split(' ')[0]}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  title="Sign out"
                  className="p-1.5 text-[#71717a] hover:text-[#18181b] hover:bg-[#f4f2ee] rounded-md transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-[#e5e2db]">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-[#52525b] hover:text-[#18181b] hover:bg-[#f4f2ee] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-1.5 rounded-md text-xs font-medium border border-[#e5e2db] hover:border-[#c9c4b8] bg-white text-[#18181b] transition-colors shadow-2xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-[#52525b] hover:text-[#18181b] hover:bg-[#f4f2ee] transition-colors border border-[#e5e2db]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[#e5e2db] bg-[#fbfaf8] px-4 pt-3 pb-5 space-y-3">
          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium ${
                pathname === '/' ? 'bg-[#f4f2ee] text-[#18181b] font-semibold border border-[#e5e2db]' : 'text-[#52525b]'
              }`}
            >
              <Compass className="w-4 h-4 text-[#71717a]" />
              <span>Library Home</span>
            </Link>

            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium ${
                    active ? 'bg-[#f4f2ee] text-[#18181b] font-semibold border border-[#e5e2db]' : 'text-[#52525b]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#71717a]" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#e5e2db] space-y-2">
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-[#18181b] bg-white border border-[#e5e2db]"
                >
                  <User className="w-4 h-4 text-[#1d3b64]" />
                  <span>Student Profile ({displayName})</span>
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-[#991b1b] hover:bg-[#fef2f2] transition-colors"
                >
                  <LogOut className="w-4 h-4 text-[#991b1b]" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center px-3 py-2 rounded-md text-xs font-medium border border-[#e5e2db] bg-white text-[#18181b]"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center px-3 py-2 rounded-md text-xs font-medium bg-[#1d3b64] text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
