'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useResources } from '@/context/ResourceContext';
import { ResourceGrid } from '@/components/ResourceGrid';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/ui/Button';
import {
  UploadCloud,
  Bookmark,
  Download,
  Calendar,
  GraduationCap,
  ShieldCheck,
  Edit3,
  CheckCircle2,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'bookmarks' ? 'bookmarks' : 'uploads';

  const { user, signOut } = useAuth();
  const { resources, userProfile, addToast, refreshResources } = useResources();
  const [activeTab, setActiveTab] = useState<'uploads' | 'bookmarks'>(initialTab);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    refreshResources();
  }, [refreshResources]);

  // Authenticated user display details
  const displayName = user
    ? user.user_metadata?.full_name || user.email?.split('@')[0] || userProfile.name
    : userProfile.name;
  const displayCollege = user?.user_metadata?.college || userProfile.college;
  const displayBranch = user?.user_metadata?.branch || userProfile.branch;
  const displaySemester = user?.user_metadata?.semester || userProfile.semester;

  // Edit profile modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [bioInput, setBioInput] = useState(userProfile.bio);
  const [collegeInput, setCollegeInput] = useState(displayCollege);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      addToast('info', 'Signed Out', 'You have been signed out.');
      router.push('/');
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'bookmarks') setActiveTab('bookmarks');
  }, [searchParams]);

  // Compute uploaded resources (uploaded by current user)
  const uploadedResources = resources.filter(
    (r) => r.uploader.name === displayName || (user && r.uploader.id === user.id)
  );

  // Compute bookmarked resources
  const bookmarkedResources = resources.filter((r) => r.isBookmarked);

  // Compute actual dynamic statistics
  const totalDownloads = uploadedResources.reduce((acc, curr) => acc + (curr.downloadCount || 0), 0);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditModalOpen(false);
    addToast('success', 'Profile Updated', 'Your student details were saved successfully.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 bg-[#faf8ff]">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#f1f5f9]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#4f46e5] via-[#7c3aed] to-[#38bdf8] flex items-center justify-center text-2xl font-black text-white shadow-sm ring-4 ring-indigo-50 overflow-hidden">
                {userProfile.avatar ? (
                  <img src={userProfile.avatar} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  displayName.charAt(0)
                )}
              </div>
              <div
                className="absolute -bottom-1 -right-1 bg-[#10b981] text-white p-1 rounded-lg shadow-sm"
                title="Verified Student"
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] tracking-tight">
                  {displayName}
                </h1>
                <span className="text-xs font-semibold bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                  Verified Student
                </span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-[#4338ca] flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-[#4f46e5] shrink-0" />
                <span>{displayBranch} • {displaySemester}</span>
              </p>

              <p className="text-xs text-[#475569]">
                {displayCollege}
              </p>

              <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Member since {userProfile.joinedDate}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              className="flex-1 sm:flex-none"
            >
              Edit Profile
            </Button>
            <Link href="/upload" className="flex-1 sm:flex-none">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
                className="w-full"
              >
                Upload Resource
              </Button>
            </Link>
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                isLoading={isSigningOut}
                leftIcon={<LogOut className="w-3.5 h-3.5 text-rose-500" />}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200"
              >
                Sign Out
              </Button>
            )}
          </div>
        </div>

        {/* Bio Text */}
        <div className="pt-4 pb-2">
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-3xl">
            {bioInput}
          </p>
        </div>

        {/* Profile Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-6 border-t border-[#f1f5f9]">
          <div className="bg-[#faf8ff] rounded-xl p-4 border border-[#e2e8f0]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">Resources Uploaded</span>
              <UploadCloud className="w-4 h-4 text-[#4f46e5]" />
            </div>
            <span className="block text-2xl font-black text-[#0f172a] mt-2 font-mono">
              {uploadedResources.length}
            </span>
            <span className="text-[10px] text-[#047857] font-semibold">Contributed to campus</span>
          </div>

          <div className="bg-[#faf8ff] rounded-xl p-4 border border-[#e2e8f0]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">Total Downloads</span>
              <Download className="w-4 h-4 text-[#7c3aed]" />
            </div>
            <span className="block text-2xl font-black text-[#0f172a] mt-2 font-mono">
              {totalDownloads}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Classmates assisted</span>
          </div>

          <div className="bg-[#faf8ff] rounded-xl p-4 border border-[#e2e8f0]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">Saved Bookmarks</span>
              <Bookmark className="w-4 h-4 text-[#f59e0b]" />
            </div>
            <span className="block text-2xl font-black text-[#0f172a] mt-2 font-mono">
              {bookmarkedResources.length}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Study queue</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#e2e8f0] pb-2">
        <button
          onClick={() => setActiveTab('uploads')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'uploads'
              ? 'bg-[#4f46e5] text-white shadow-xs'
              : 'text-slate-600 hover:text-[#0f172a] hover:bg-white'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Contributed Resources ({uploadedResources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'bookmarks'
              ? 'bg-[#4f46e5] text-white shadow-xs'
              : 'text-slate-600 hover:text-[#0f172a] hover:bg-white'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>My Bookmarks ({bookmarkedResources.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'uploads' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0f172a] tracking-tight">
              Documents Uploaded by You
            </h3>
            <Link
              href="/upload"
              className="text-xs font-semibold text-[#4f46e5] hover:text-[#4338ca] flex items-center gap-1"
            >
              + Upload New Resource
            </Link>
          </div>

          <ResourceGrid
            resources={uploadedResources}
            emptyType="uploads"
          />
        </div>
      )}

      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0f172a] tracking-tight">
              Your Bookmarked Study Materials
            </h3>
            <span className="text-xs text-slate-500">
              Saved for quick access during semester exams
            </span>
          </div>

          <ResourceGrid
            resources={bookmarkedResources}
            emptyType="bookmarks"
          />
        </div>
      )}

      {/* Edit Profile Dialog Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Student Profile"
        maxWidth="md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              College Name
            </label>
            <input
              type="text"
              value={collegeInput}
              onChange={(e) => setCollegeInput(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-[#cbd5e1] bg-white outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Bio & Academic Interests
            </label>
            <textarea
              rows={4}
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-[#cbd5e1] bg-white outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100 resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400 font-medium">
          Loading student profile...
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
