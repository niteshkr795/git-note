'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Resource, UserProfile } from '@/types';
import { INITIAL_RESOURCES, MOCK_USER_PROFILE } from '@/data/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatFileSize } from '@/lib/formatters';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface ResourceContextType {
  resources: Resource[];
  isLoading: boolean;
  refreshResources: () => Promise<void>;
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  toggleBookmark: (resourceId: string) => Promise<void>;
  isBookmarked: (resourceId: string) => boolean;
  addResource: (newResource: Omit<Resource, 'id' | 'createdAt' | 'downloadCount' | 'viewCount' | 'rating' | 'uploader'>) => Resource;
  deleteResource: (resourceId: string) => Promise<{ success: boolean; error?: string }>;
  reportResource: (resourceId: string, reason: string, details: string) => Promise<void>;
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
  mockDownload: (resource: Resource) => Promise<void>;
}

const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

export const ResourceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_USER_PROFILE);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast notification management
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastMessage['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const mapDbResourceToModel = (item: any, bookmarkedSet?: Set<string>): Resource => {
    const uploaderData = Array.isArray(item.uploader) ? item.uploader[0] : item.uploader;
    return {
      id: item.id,
      title: item.title,
      description: item.description || '',
      subject: item.subject_name || item.subject || 'General Engineering',
      semester: (item.semester || 'Semester 1') as any,
      resourceType: (item.resource_type || 'Notes') as any,
      academicYear: (item.academic_year || '2024-25') as any,
      fileFormat: (item.file_format || 'PDF') as any,
      fileSize: formatFileSize(item.file_size_bytes, item.file_size),
      fileSizeBytes: item.file_size_bytes || undefined,
      storagePath: item.storage_path || undefined,
      pageCount: item.page_count || 12,
      downloadCount: item.download_count ?? 0,
      viewCount: item.view_count ?? 0,
      rating: Number(item.rating) || 5.0,
      createdAt: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : '',
      tags: Array.isArray(item.tags) ? item.tags : [],
      isBookmarked: bookmarkedSet ? bookmarkedSet.has(item.id) : false,
      isVerified: Boolean(item.is_verified),
      uploader: {
        id: uploaderData?.id || item.uploader_id || item.owner_id || 'contributor',
        name: uploaderData?.full_name || 'Student Contributor',
        avatar: uploaderData?.avatar_url || '',
        college: uploaderData?.college || 'SRMCEM Lucknow',
        branch: uploaderData?.branch || 'Computer Science & Engineering',
        semester: uploaderData?.semester || item.semester || 'Semester 4',
        verified: Boolean(uploaderData?.is_verified ?? item.is_verified),
      },
      previewContent: {
        summary: (item.description || item.title).slice(0, 160) + '...',
        keyTopics: Array.isArray(item.tags) && item.tags.length > 0 ? item.tags : ['Unit Overview', 'Important Questions', 'Concepts'],
        sampleText: `Title: ${item.title}\nSubject: ${item.subject_name}\nSemester: ${item.semester}\nAcademic Year: ${item.academic_year}\n\nDescription:\n${item.description || 'Verified study resource on GitNote.'}`,
      },
    };
  };

  const fetchResources = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Fetch user's bookmarks if authenticated
      let bookmarkedSet = new Set<string>();
      if (user) {
        const { data: bookmarkData } = await supabase
          .from('bookmarks')
          .select('resource_id')
          .eq('user_id', user.id);
        if (bookmarkData) {
          bookmarkedSet = new Set(bookmarkData.map((b) => b.resource_id));
        }
      }

      // Fetch all resources with uploader profile
      const { data: initialData, error } = await supabase
        .from('resources')
        .select(`
          id,
          title,
          description,
          resource_type,
          subject_name,
          semester,
          academic_year,
          file_format,
          file_size,
          file_size_bytes,
          storage_path,
          page_count,
          download_count,
          view_count,
          rating,
          tags,
          is_verified,
          uploader_id,
          created_at,
          uploader:profiles!uploader_id (
            id,
            full_name,
            college,
            branch,
            semester,
            avatar_url,
            is_verified
          )
        `)
        .order('created_at', { ascending: false });

      let data = initialData;

      if (error) {
        // Resilient fallback: fetch all available columns without foreign key join
        const fallbackRes = await supabase
          .from('resources')
          .select('*')
          .order('created_at', { ascending: false });
        if (!fallbackRes.error && fallbackRes.data) {
          data = fallbackRes.data;
        } else {
          console.warn('[GitNote] Failed to fetch resources from Supabase:', error.message);
          return;
        }
      }

      if (data) {
        const mapped = data.map((item) => mapDbResourceToModel(item, bookmarkedSet));
        setResources(mapped);
      }
    } catch (err) {
      console.error('[GitNote] Error in fetchResources:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Synchronize authenticated user profile with Supabase and localStorage
  useEffect(() => {
    const loadProfile = async () => {
      // 1. Try Supabase if authenticated
      if (user && isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (data && !error) {
            setUserProfile((prev) => ({
              ...prev,
              id: user.id,
              name: data.full_name || user.user_metadata?.full_name || prev.name,
              email: user.email || prev.email,
              avatar: data.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.avatar || prev.avatar,
              college: data.college || user.user_metadata?.college || prev.college,
              branch: data.branch || user.user_metadata?.branch || prev.branch,
              semester: (data.semester || user.user_metadata?.semester || prev.semester) as any,
              bio: data.bio || prev.bio,
            }));
            return;
          }
        } catch (e) {
          console.warn('[GitNote] Could not fetch profile from Supabase:', e);
        }
      }

      // Auto-cleanup: If auth metadata contains an oversized base64 data URL, wipe it so cookies don't balloon!
      if (user && (user.user_metadata?.avatar_url?.startsWith('data:') || user.user_metadata?.avatar?.startsWith('data:'))) {
        try {
          await supabase.auth.updateUser({
            data: { avatar_url: null, avatar: null },
          });
        } catch {
          // ignore
        }
      }

      // 2. Fallback to auth metadata if logged in
      if (user) {
        setUserProfile((prev) => ({
          ...prev,
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || prev.name,
          email: user.email || prev.email,
          avatar: user.user_metadata?.avatar_url || user.user_metadata?.avatar || prev.avatar,
          college: user.user_metadata?.college || prev.college,
          branch: user.user_metadata?.branch || prev.branch,
          semester: (user.user_metadata?.semester || prev.semester) as any,
        }));
      } else {
        // 3. Fallback to localStorage in guest/demo mode
        try {
          const saved = typeof window !== 'undefined' ? localStorage.getItem('gitnote_user_profile') : null;
          if (saved) {
            const parsed = JSON.parse(saved);
            setUserProfile((prev) => ({ ...prev, ...parsed }));
          }
        } catch {
          // ignore
        }
      }
    };

    loadProfile();
  }, [user]);

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. Update React state immediately
      setUserProfile((prev) => {
        const next = { ...prev, ...updates };
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('gitnote_user_profile', JSON.stringify(next));
          }
        } catch {}
        return next;
      });

      // 2. Synchronize resources uploaded by this user so changes reflect everywhere
      setResources((prev) =>
        prev.map((r) => {
          const isUserUploader =
            (user && r.uploader.id === user.id) ||
            r.uploader.name === userProfile.name ||
            (user?.user_metadata?.full_name && r.uploader.name === user.user_metadata.full_name);

          if (isUserUploader) {
            return {
              ...r,
              uploader: {
                ...r.uploader,
                ...(updates.avatar !== undefined ? { avatar: updates.avatar } : {}),
                ...(updates.name ? { name: updates.name } : {}),
                ...(updates.college ? { college: updates.college } : {}),
                ...(updates.branch ? { branch: updates.branch } : {}),
                ...(updates.semester ? { semester: updates.semester } : {}),
              },
            };
          }
          return r;
        })
      );

      // 3. Persist to Supabase if logged in
      if (user && isSupabaseConfigured) {
        const dbUpdates: Record<string, any> = {};
        if (updates.name !== undefined) dbUpdates.full_name = updates.name;
        if (updates.college !== undefined) dbUpdates.college = updates.college;
        if (updates.branch !== undefined) dbUpdates.branch = updates.branch;
        if (updates.semester !== undefined) dbUpdates.semester = updates.semester;
        if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
        if (updates.avatar !== undefined) dbUpdates.avatar_url = updates.avatar;

        const { error: dbError } = await supabase
          .from('profiles')
          .update(dbUpdates)
          .eq('id', user.id);

        if (dbError) {
          console.warn('[GitNote] Failed to update profiles table:', dbError.message);
        }

        // Also update Supabase auth user_metadata SAFELY without bloated base64 data URLs
        try {
          // CRITICAL: NEVER store base64 data URLs in auth metadata!
          // Supabase SSR encodes user_metadata directly into the JWT session cookie.
          // Base64 strings exceed the 16KB cookie header limit and cause HTTP 494 REQUEST_HEADER_TOO_LARGE!
          const isSafeUrl = typeof updates.avatar === 'string' && (updates.avatar.startsWith('http://') || updates.avatar.startsWith('https://'));
          const safeAvatar = isSafeUrl ? updates.avatar : (updates.avatar === '' ? '' : null);

          await supabase.auth.updateUser({
            data: {
              ...(updates.name ? { full_name: updates.name } : {}),
              ...(updates.college ? { college: updates.college } : {}),
              ...(updates.branch ? { branch: updates.branch } : {}),
              ...(updates.semester ? { semester: updates.semester } : {}),
              ...(updates.avatar !== undefined ? { avatar_url: safeAvatar, avatar: safeAvatar } : {}),
            },
          });
        } catch (metaErr) {
          console.warn('[GitNote] Could not update auth metadata:', metaErr);
        }
      }

      return { success: true };
    } catch (err: any) {
      console.error('[GitNote] Error updating profile:', err);
      return { success: false, error: err?.message || 'Failed to update profile' };
    }
  };

  const toggleBookmark = async (resourceId: string) => {
    const target = resources.find((r) => r.id === resourceId);
    if (!target) return;

    const willBeBookmarked = !target.isBookmarked;

    // Optimistic state update
    setResources((prev) =>
      prev.map((r) => (r.id === resourceId ? { ...r, isBookmarked: willBeBookmarked } : r))
    );

    setUserProfile((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        totalBookmarks: Math.max(0, prev.stats.totalBookmarks + (willBeBookmarked ? 1 : -1)),
      },
    }));

    if (willBeBookmarked) {
      addToast('success', 'Resource Bookmarked', `"${target.title}" saved to your bookmarks.`);
    } else {
      addToast('info', 'Bookmark Removed', `"${target.title}" removed from your bookmarks.`);
    }

    // Persist to Supabase if authenticated
    if (user && isSupabaseConfigured) {
      try {
        if (willBeBookmarked) {
          await supabase.from('bookmarks').insert({
            user_id: user.id,
            resource_id: resourceId,
          });
        } else {
          await supabase
            .from('bookmarks')
            .delete()
            .eq('user_id', user.id)
            .eq('resource_id', resourceId);
        }
      } catch (err) {
        console.error('[GitNote] Error persisting bookmark:', err);
      }
    }
  };

  const isBookmarked = (resourceId: string) => {
    const target = resources.find((r) => r.id === resourceId);
    return !!target?.isBookmarked;
  };

  const addResource = (resourceData: Omit<Resource, 'id' | 'createdAt' | 'downloadCount' | 'viewCount' | 'rating' | 'uploader'>): Resource => {
    const newId = `res-${Date.now()}`;
    const newResource: Resource = {
      ...resourceData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
      downloadCount: 0,
      viewCount: 1,
      rating: 5.0,
      isBookmarked: false,
      uploader: {
        id: user?.id || userProfile.id,
        name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || userProfile.name,
        avatar: userProfile.avatar,
        college: user?.user_metadata?.college || userProfile.college,
        branch: user?.user_metadata?.branch || userProfile.branch,
        semester: user?.user_metadata?.semester || userProfile.semester,
        verified: true,
      },
      previewContent: {
        summary: resourceData.description.slice(0, 160) + '...',
        keyTopics: resourceData.tags.length > 0 ? resourceData.tags : ['Unit Overview', 'Important Concepts', 'Worked Examples'],
        sampleText: `Title: ${resourceData.title}\nSubject: ${resourceData.subject}\nAcademic Year: ${resourceData.academicYear}\n\nDocument uploaded and verified on GitNote academic network.\n\nDescription:\n${resourceData.description}`,
      },
    };

    setResources((prev) => [newResource, ...prev]);

    setUserProfile((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        totalUploads: prev.stats.totalUploads + 1,
      },
    }));

    addToast('success', 'Resource Published', `"${newResource.title}" is now available in Explore!`);
    return newResource;
  };

  const deleteResource = async (resourceId: string): Promise<{ success: boolean; error?: string }> => {
    const target = resources.find((r) => r.id === resourceId);
    const targetTitle = target?.title || 'Resource';

    try {
      // 1. Delete associated file from Supabase Storage bucket if present
      if (target?.storagePath && isSupabaseConfigured) {
        try {
          await supabase.storage.from('academic-resources').remove([target.storagePath]);
          await supabase.storage.from('study-resources').remove([target.storagePath]);
        } catch (storageErr) {
          console.warn('[GitNote] Storage remove error:', storageErr);
        }
      }

      // 2. Delete database record from Supabase 'resources' table
      if (isSupabaseConfigured && user) {
        const { error: dbError } = await supabase
          .from('resources')
          .delete()
          .eq('id', resourceId);

        if (dbError) {
          console.error('[GitNote] Database delete error:', dbError);
          addToast('error', 'Delete Failed', dbError.message || 'Could not delete resource from database.');
          return { success: false, error: dbError.message };
        }
      }

      // 3. Remove resource from local memory state
      setResources((prev) => prev.filter((r) => r.id !== resourceId));

      // 4. Update user profile counter
      setUserProfile((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          totalUploads: Math.max(0, prev.stats.totalUploads - 1),
        },
      }));

      addToast('success', 'Document Deleted', `"${targetTitle}" was removed successfully.`);
      return { success: true };
    } catch (err: any) {
      console.error('[GitNote] Unexpected error deleting resource:', err);
      const errorMsg = err?.message || 'An unexpected error occurred while deleting.';
      addToast('error', 'Delete Error', errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const reportResource = async (resourceId: string, reason: string, details: string) => {
    if (user && isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('reports').insert({
          resource_id: resourceId,
          reporter_id: user.id,
          reason,
          details,
          status: 'pending',
        });
        if (error) {
          console.warn('[GitNote] Failed to submit report to Supabase:', error.message);
        }
      } catch (err) {
        console.warn('[GitNote] Report submission exception:', err);
      }
    }
    addToast('info', 'Report Received', 'Thank you. Academic moderators will review this document within 24 hours.');
  };

  const mockDownload = async (resource: Resource) => {
    // Increment download count locally
    setResources((prev) =>
      prev.map((r) => (r.id === resource.id ? { ...r, downloadCount: r.downloadCount + 1 } : r))
    );

    addToast('success', 'Download Started', `Downloading "${resource.title}" (${resource.fileSize})...`);

    // Increment in Supabase if configured
    if (isSupabaseConfigured) {
      try {
        await supabase.rpc('increment_resource_downloads', {
          resource_id_param: resource.id,
          user_id_param: user?.id || null,
        });
      } catch {
        try {
          await supabase
            .from('resources')
            .update({ download_count: resource.downloadCount + 1 })
            .eq('id', resource.id);
        } catch {
          // ignore
        }
      }
    }

    let storagePath = resource.storagePath;
    let fileFormat = resource.fileFormat || 'PDF';

    // If storagePath is not directly present, query Supabase
    if (!storagePath && isSupabaseConfigured && resource.id && !resource.id.startsWith('res-')) {
      try {
        const { data: dbItem } = await supabase
          .from('resources')
          .select('storage_path, file_format')
          .eq('id', resource.id)
          .maybeSingle();
        if (dbItem?.storage_path) {
          storagePath = dbItem.storage_path;
        }
        if (dbItem?.file_format) {
          fileFormat = dbItem.file_format as any;
        }
      } catch {
        // ignore
      }
    }

    // Attempt real file download from Supabase Storage
    if (storagePath && isSupabaseConfigured) {
      const ext = (fileFormat || 'PDF').toLowerCase();
      const filename = `${resource.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 48)}.${ext}`;

      try {
        // 1. Direct blob download (study-resources then academic-resources)
        let dl = await supabase.storage.from('study-resources').download(storagePath);
        if (dl.error) {
          dl = await supabase.storage.from('academic-resources').download(storagePath);
        }

        if (dl.data && !dl.error) {
          const url = URL.createObjectURL(dl.data);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          return;
        }

        // 2. Fallback: Signed URL
        let signed = await supabase.storage.from('study-resources').createSignedUrl(storagePath, 300);
        if (signed.error) {
          signed = await supabase.storage.from('academic-resources').createSignedUrl(storagePath, 300);
        }

        if (signed.data?.signedUrl) {
          const resp = await fetch(signed.data.signedUrl);
          if (resp.ok) {
            const blob = await resp.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return;
          }
        }
      } catch (err) {
        console.warn('[GitNote] Storage download error:', err);
      }

      // If storage download failed for a real stored document
      if (!user) {
        addToast(
          'warning',
          'Sign in Required',
          'Please sign in to your student account to download verified files.'
        );
      } else {
        addToast(
          'error',
          'File Unavailable',
          'This file could not be retrieved from storage. It may need to be re-uploaded.'
        );
      }
      return;
    }

    // For demo/sample catalog items without Supabase storagePath
    addToast(
      'info',
      'Demo Resource',
      'This is a sample catalog item. Upload a new document to download real PDF files.'
    );
  };

  return (
    <ResourceContext.Provider
      value={{
        resources,
        isLoading,
        refreshResources: fetchResources,
        userProfile,
        updateUserProfile,
        toggleBookmark,
        isBookmarked,
        addResource,
        deleteResource,
        reportResource,
        toasts,
        addToast,
        removeToast,
        mockDownload,
      }}
    >
      {children}
    </ResourceContext.Provider>
  );
};

export const useResources = () => {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error('useResources must be used within a ResourceProvider');
  }
  return context;
};
