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
    setNameInput(displayName);
    setCollegeInput(displayCollege);
    setBranchInput(displayBranch);
    setSemesterInput(displaySemester);
    setBioInput(userProfile.bio);
  }, [displayName, displayCollege, displayBranch, displaySemester, userProfile.bio]);

  // Filter resources authored by this user
  const uploadedResources = resources.filter(
    (r) =>
      r.uploader?.id === user?.id ||
      r.uploader?.name === displayName ||
      r.uploader?.name === user?.user_metadata?.full_name ||
      r.uploader?.name === userProfile.name
  );

  // Filter user's bookmarked resources
  const bookmarkedResources = resources.filter((r) => r.isBookmarked);

  // Total downloads of user's materials
  const totalDownloads = uploadedResources.reduce((acc, curr) => acc + (curr.downloadCount || 0), 0);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      addToast('info', 'Signed Out', 'You have been signed out of your account.');
      router.push('/');
    } catch {
      addToast('error', 'Sign Out Failed', 'Could not sign out. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

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
      addToast('success', 'Avatar Updated', 'Your profile portrait has been updated.');
    } else {
      addToast('error', 'Update Failed', res.error || 'Failed to update profile avatar.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        {/* Profile Header Dossier */}
        <div className="bg-white rounded-lg border border-[var(--color-paper-border)] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[var(--color-paper-border)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Profile Avatar Container */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-[var(--color-paper-accent)] border border-[var(--color-paper-border)] flex items-center justify-center text-xl font-serif font-bold text-[var(--color-accent)] overflow-hidden relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all text-left"
                  title="Click to update portrait"
                  aria-label="Click to update portrait"
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

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-white transition-opacity duration-150">
                    <Camera className="w-4 h-4 text-white" />
                    <span className="text-[9px] font-mono uppercase tracking-wider">Edit</span>
                  </div>
                </button>

                <div
                  className="absolute -bottom-1 -right-1 bg-[var(--color-paper)] text-[var(--color-accent)] p-1 rounded-full border border-[var(--color-paper-border)] pointer-events-none"
                  title="Verified Student Identity"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-serif text-[var(--color-foreground)] font-normal tracking-tight">
                    {displayName}
                  </h1>
                  <span className="text-[11px] font-mono text-[var(--color-accent)] bg-[var(--color-paper-accent)] border border-[var(--color-paper-border)] px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[var(--color-accent)]" />
                    Verified Scholar
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-medium text-[var(--color-foreground)]/80 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                  <span>{displayBranch} • {displaySemester}</span>
                </p>

                <p className="text-xs text-[var(--color-muted)]">
                  {displayCollege}
                </p>

                <p className="text-[11px] text-[var(--color-muted)] flex items-center gap-1 pt-0.5 font-mono">
                  <Calendar className="w-3 h-3 text-[var(--color-muted)]" />
                  Catalog member since {userProfile.joinedDate}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                className="flex-1 sm:flex-none text-xs"
              >
                Edit Dossier
              </Button>
              <Link href="/upload" className="flex-1 sm:flex-none">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
                  className="w-full text-xs"
                >
                  Deposit Paper
                </Button>
              </Link>
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  isLoading={isSigningOut}
                  leftIcon={<LogOut className="w-3.5 h-3.5 text-rose-600" />}
                  className="text-rose-700 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 text-xs"
                >
                  Sign Out
                </Button>
              )}
            </div>
          </div>

          {/* Bio Text */}
          {userProfile.bio && (
            <div className="pt-4 pb-2">
              <p className="text-xs sm:text-sm text-[var(--color-foreground)]/80 leading-relaxed max-w-3xl">
                {userProfile.bio}
              </p>
            </div>
          )}

          {/* Profile Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-6 border-t border-[var(--color-paper-border)]">
            <div className="bg-[var(--color-paper)] rounded-md p-4 border border-[var(--color-paper-border)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-muted)]">Deposited Works</span>
                <UploadCloud className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              </div>
              <span className="block text-2xl font-serif text-[var(--color-foreground)] mt-2">
                {uploadedResources.length}
              </span>
              <span className="text-[11px] text-[var(--color-muted)]">Archived to campus repository</span>
            </div>

            <div className="bg-[var(--color-paper)] rounded-md p-4 border border-[var(--color-paper-border)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-muted)]">Total Circulations</span>
                <Download className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              </div>
              <span className="block text-2xl font-serif text-[var(--color-foreground)] mt-2">
                {totalDownloads}
              </span>
              <span className="text-[11px] text-[var(--color-muted)]">Peer downloads &amp; views</span>
            </div>

            <div className="bg-[var(--color-paper)] rounded-md p-4 border border-[var(--color-paper-border)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-muted)]">Saved References</span>
                <Bookmark className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              </div>
              <span className="block text-2xl font-serif text-[var(--color-foreground)] mt-2">
                {bookmarkedResources.length}
              </span>
              <span className="text-[11px] text-[var(--color-muted)]">Personal study reading queue</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-[var(--color-paper-border)] pb-2">
          <button
            onClick={() => setActiveTab('uploads')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'uploads'
                ? 'bg-[var(--color-foreground)] text-white'
                : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-white'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Deposited Resources ({uploadedResources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'bookmarks'
                ? 'bg-[var(--color-foreground)] text-white'
                : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Reading Queue ({bookmarkedResources.length})</span>
          </button>
        </div>

        {/* Tab Panels */}
        {activeTab === 'uploads' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
              <div>
                <h3 className="font-serif text-base font-semibold text-[var(--color-foreground)]">
                  Documents Contributed by You
                </h3>
                <p className="text-xs text-[var(--color-muted)]">
                  Manage, preview, or remove your contributed papers from the institutional repository.
                </p>
              </div>
              <Link
                href="/upload"
                className="text-xs font-medium text-[var(--color-accent)] hover:underline flex items-center gap-1 shrink-0"
              >
                + Deposit New Resource
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
            <div className="flex items-center justify-between pb-2">
              <div>
                <h3 className="font-serif text-base font-semibold text-[var(--color-foreground)]">
                  Personal Reading Queue
                </h3>
                <p className="text-xs text-[var(--color-muted)]">
                  Saved study materials for examination preparation and research.
                </p>
              </div>
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
          title="Edit Student Dossier"
          maxWidth="md"
        >
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="bg-[var(--color-paper)] p-3.5 rounded border border-[var(--color-paper-border)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white border border-[var(--color-paper-border)] flex items-center justify-center font-serif text-sm font-semibold text-[var(--color-accent)] overflow-hidden shrink-0">
                  {displayAvatar ? (
                    <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(displayName || 'S').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <span className="block text-xs font-medium text-[var(--color-foreground)]">Profile Portrait</span>
                  <span className="text-[11px] text-[var(--color-muted)]">Choose a student cartoon avatar</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<Camera className="w-3.5 h-3.5" />}
                onClick={() => {
                  setIsEditModalOpen(false);
                  setIsAvatarModalOpen(true);
                }}
                className="text-xs"
              >
                Change Avatar
              </Button>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Nitesh Kumar"
                className="w-full text-xs px-3.5 py-2.5 rounded-md border border-[var(--color-paper-border)] bg-white outline-none focus:border-[var(--color-accent)]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1.5">
                College Name
              </label>
              <input
                type="text"
                value={collegeInput}
                onChange={(e) => setCollegeInput(e.target.value)}
                placeholder="e.g. SRMCEM Lucknow"
                className="w-full text-xs px-3.5 py-2.5 rounded-md border border-[var(--color-paper-border)] bg-white outline-none focus:border-[var(--color-accent)]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1.5">
                  Branch / Specialization
                </label>
                <input
                  type="text"
                  value={branchInput}
                  onChange={(e) => setBranchInput(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full text-xs px-3.5 py-2.5 rounded-md border border-[var(--color-paper-border)] bg-white outline-none focus:border-[var(--color-accent)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1.5">
                  Current Semester
                </label>
                <select
                  value={semesterInput}
                  onChange={(e) => setSemesterInput(e.target.value as any)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-md border border-[var(--color-paper-border)] bg-white outline-none focus:border-[var(--color-accent)] cursor-pointer"
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
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1.5">
                Bio &amp; Academic Focus
              </label>
              <textarea
                rows={3}
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                placeholder="Academic interests, research areas, or coursework specializations..."
                className="w-full text-xs p-3 rounded-md border border-[var(--color-paper-border)] bg-white outline-none focus:border-[var(--color-accent)] resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--color-paper-border)]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSavingProfile}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSavingProfile}
                className="text-xs"
              >
                Save Dossier
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
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-paper)] flex items-center justify-center text-xs font-mono text-[var(--color-muted)]">
          Loading student dossier...
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
