'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useResources } from '@/context/ResourceContext';
import { ResourceGrid } from '@/components/ResourceGrid';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/ui/Button';
import {
  UploadCloud,
  Bookmark,
  Award,
  Download,
  Calendar,
  GraduationCap,
  ShieldCheck,
  Edit3,
  Trophy,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

function ProfileContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'bookmarks' ? 'bookmarks' : 'uploads';

  const { resources, userProfile, addToast } = useResources();
  const [activeTab, setActiveTab] = useState<'uploads' | 'bookmarks' | 'badges'>(initialTab);

  // Edit profile modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [bioInput, setBioInput] = useState(userProfile.bio);
  const [collegeInput, setCollegeInput] = useState(userProfile.college);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'bookmarks') setActiveTab('bookmarks');
    else if (tabParam === 'badges') setActiveTab('badges');
  }, [searchParams]);

  // Compute uploaded resources (uploaded by current user)
  const uploadedResources = resources.filter(
    (r) => r.uploader.name === userProfile.name || r.uploader.id === userProfile.id
  );

  // Compute bookmarked resources
  const bookmarkedResources = resources.filter((r) => r.isBookmarked);

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
                  <img src={userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover" />
                ) : (
                  userProfile.name.charAt(0)
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
                  {userProfile.name}
                </h1>
                <span className="text-xs font-semibold bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                  Verified Student
                </span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-[#4338ca] flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-[#4f46e5] shrink-0" />
                <span>{userProfile.branch} • {userProfile.semester}</span>
              </p>

              <p className="text-xs text-[#475569]">
                {userProfile.college}
              </p>

              <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Member since {userProfile.joinedDate}
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
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
          </div>
        </div>

        {/* Bio Text */}
        <div className="pt-4 pb-2">
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-3xl">
            {bioInput}
          </p>
        </div>

        {/* Profile Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-6 border-t border-[#f1f5f9]">
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
              {userProfile.stats.totalDownloads}
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

          <div className="bg-[#faf8ff] rounded-xl p-4 border border-[#e2e8f0]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">Karma Reputation</span>
              <Trophy className="w-4 h-4 text-[#4f46e5]" />
            </div>
            <span className="block text-2xl font-black text-[#4f46e5] mt-2 font-mono">
              {userProfile.stats.reputationPoints}
            </span>
            <span className="text-[10px] text-[#4f46e5] font-semibold">Top 5% Contributor</span>
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

        <button
          onClick={() => setActiveTab('badges')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'badges'
              ? 'bg-[#4f46e5] text-white shadow-xs'
              : 'text-slate-600 hover:text-[#0f172a] hover:bg-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Badges & Accolades</span>
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

      {activeTab === 'badges' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userProfile.badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-white rounded-2xl border border-[#e2e8f0] p-5 flex items-start gap-4 shadow-xs"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#f59e0b] to-[#d97706] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Trophy className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#0f172a] text-sm tracking-tight">{badge.name}</h4>
                    <span className="text-[10px] font-mono text-[#047857] bg-[#ecfdf5] px-2 py-0.5 rounded-full border border-[#a7f3d0]">
                      Unlocked {badge.unlockedAt}
                    </span>
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Karma Milestone Progress Card */}
          <div className="bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] text-white rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-indigo-300 block mb-1">
                  Academic Reputation Level
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">Tier 3 Contributor: Academic Mentor</h3>
              </div>
              <span className="text-xl font-bold font-mono text-indigo-200">
                {userProfile.stats.reputationPoints} / 1,000 PTS
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#38bdf8] rounded-full transition-all duration-300"
                style={{ width: `${(userProfile.stats.reputationPoints / 1000) * 100}%` }}
              />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Earn 80 more points by uploading verified PYQs or lecture summaries to reach Tier 4: Campus Valedictorian.
            </p>
          </div>
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
