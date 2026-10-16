'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useResources } from '@/context/ResourceContext';
import { ResourceGrid } from '@/components/ResourceGrid';
import { Modal } from '@/components/Modal';
import { EditAvatarModal } from '@/components/EditAvatarModal';
import { Button } from '@/components/ui/Button';
import { SEMESTERS, normalizeSemester } from '@/data/mockData';
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
  Camera,
} from 'lucide-react';
import Link from 'next/link';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'bookmarks' ? 'bookmarks' : 'uploads';

  const { user, signOut } = useAuth();
  const { resources, userProfile, addToast, refreshResources, updateUserProfile } = useResources();
  const [activeTab, setActiveTab] = useState<'uploads' | 'bookmarks'>(initialTab);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    refreshResources();
  }, [refreshResources]);

  // Authenticated user display details
  const displayName = userProfile.name || (user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student Contributor');
  const displayCollege = userProfile.college || user?.user_metadata?.college || 'SRMCEM Lucknow';
  const displayBranch = userProfile.branch || user?.user_metadata?.branch || 'Computer Science & Engineering';
  const displaySemester = normalizeSemester(userProfile.semester || user?.user_metadata?.semester, 'Semester 1');
  const displayAvatar = userProfile.avatar || user?.user_metadata?.avatar_url || user?.user_metadata?.avatar || '';

  // Avatar Modal State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Edit Profile Details Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState(displayName);
  const [collegeInput, setCollegeInput] = useState(displayCollege);
  const [branchInput, setBranchInput] = useState(displayBranch);
  const [semesterInput, setSemesterInput] = useState(displaySemester);
  const [bioInput, setBioInput] = useState(userProfile.bio);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Keep inputs synchronized with profile data
  useEffect(() => {
    if (isEditModalOpen) {
      setNameInput(displayName);
      setCollegeInput(displayCollege);
      setBranchInput(displayBranch);
      setSemesterInput(displaySemester);
      setBioInput(userProfile.bio);
    }
  }, [isEditModalOpen, displayName, displayCollege, displayBranch, displaySemester, userProfile.bio]);

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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await updateUserProfile({
        name: nameInput.trim() || displayName,
        college: collegeInput.trim() || displayCollege,
        branch: branchInput.trim() || displayBranch,
        semester: semesterInput as any,
        bio: bioInput.trim() || userProfile.bio,
      });

      if (res.success) {
        setIsEditModalOpen(false);
        addToast('success', 'Profile Updated', 'Your student details were saved successfully.');
      } else {
        addToast('error', 'Update Failed', res.error || 'Failed to save changes.');
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveAvatar = async (newAvatarUrl: string) => {
    const res = await updateUserProfile({ avatar: newAvatarUrl });
    if (res.success) {
      addToast('success', 'Profile Photo Updated', 'Your student profile photo has been updated.');
    } else {
      addToast('error', 'Update Failed', res.error || 'Failed to update profile photo.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 bg-[#faf8ff]">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#f1f5f9]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Interactive Profile Avatar Container */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#4f46e5] via-[#7c3aed] to-[#38bdf8] flex items-center justify-center text-2xl font-black text-white shadow-sm ring-4 ring-indigo-50 overflow-hidden relative cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all active:scale-95 text-left"
                title="Click to edit profile picture"
                aria-label="Click to edit profile picture"
              >
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={displayName}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200"
                  />
                ) : (
                  <span>{(displayName || 'S').charAt(0).toUpperCase()}</span>
                )}

                {/* Dark Hover Overlay with Camera Icon */}
                <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-white transition-opacity duration-200">
                  <Camera className="w-5 h-5 text-white" />
                  <span className="text-[10px] font-bold tracking-wider uppercase">Edit</span>
                </div>
              </button>

              {/* Verified Student Badge on bottom-right */}
              <div
                className="absolute -bottom-1 -right-1 bg-[#10b981] text-white p-1 rounded-lg shadow-sm pointer-events-none"
                title="Verified Student"
              >
                <ShieldCheck className="w-4 h-4" />
              </div>

              {/* Camera Edit Pill Button at top-right */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAvatarModalOpen(true);
                }}
                className="absolute -top-1.5 -right-1.5 bg-white hover:bg-indigo-50 text-[#4f46e5] p-1.5 rounded-full shadow-md border border-slate-200 hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
                title="Change Profile Picture"
                aria-label="Change Profile Picture"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
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
            {userProfile.bio}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#0f172a] tracking-tight">
                Documents Uploaded by You
              </h3>
              <p className="text-xs text-slate-500">
                Manage, preview, or remove your contributed PDFs and study notes from the platform.
              </p>
            </div>
            <Link
              href="/upload"
              className="text-xs font-semibold text-[#4f46e5] hover:text-[#4338ca] flex items-center gap-1 shrink-0"
            >
              + Upload New Resource
            </Link>
          </div>

          <ResourceGrid
            resources={uploadedResources}
            emptyType="uploads"
            canDelete={true}
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
          {/* Quick Profile Picture Edit Preview */}
          <div className="bg-[#faf8ff] p-3.5 rounded-2xl border border-[#e2e8f0] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#4f46e5] to-[#7c3aed] flex items-center justify-center text-lg font-bold text-white shadow-2xs overflow-hidden shrink-0">
                {displayAvatar ? (
                  <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span>{(displayName || 'S').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <span className="block text-xs font-bold text-[#0f172a]">Profile Photo</span>
                <span className="text-[11px] text-slate-500">Upload or choose a student avatar</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Camera className="w-3.5 h-3.5 text-[#4f46e5]" />}
              onClick={() => {
                setIsEditModalOpen(false);
                setIsAvatarModalOpen(true);
              }}
            >
              Change Photo
            </Button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Nitesh Kumar"
              className="w-full text-xs p-3 rounded-xl border border-[#cbd5e1] bg-white outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              College Name
            </label>
            <input
              type="text"
              value={collegeInput}
              onChange={(e) => setCollegeInput(e.target.value)}
              placeholder="e.g. SRMCEM Lucknow"
              className="w-full text-xs p-3 rounded-xl border border-[#cbd5e1] bg-white outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Branch / Specialization
              </label>
              <input
                type="text"
                value={branchInput}
                onChange={(e) => setBranchInput(e.target.value)}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full text-xs p-3 rounded-xl border border-[#cbd5e1] bg-white outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Semester
              </label>
              <select
                value={semesterInput}
                onChange={(e) => setSemesterInput(e.target.value as any)}
                className="w-full text-xs p-3 rounded-xl border border-[#cbd5e1] bg-white outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100 cursor-pointer"
              >
                {SEMESTERS.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Bio & Academic Interests
            </label>
            <textarea
              rows={3}
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value)}
              placeholder="Share your academic interests, subject strengths, and study goals..."
              className="w-full text-xs p-3 rounded-xl border border-[#cbd5e1] bg-white outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100 resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSavingProfile}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSavingProfile}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Dedicated Edit Profile Image Modal */}
      <EditAvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={displayAvatar}
        displayName={displayName}
        onSaveAvatar={handleSaveAvatar}
      />
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
