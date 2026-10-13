'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Resource, UserProfile } from '@/types';
import { INITIAL_RESOURCES, MOCK_USER_PROFILE } from '@/data/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

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
  toggleBookmark: (resourceId: string) => Promise<void>;
  isBookmarked: (resourceId: string) => boolean;
  addResource: (newResource: Omit<Resource, 'id' | 'createdAt' | 'downloadCount' | 'viewCount' | 'rating' | 'uploader'>) => Resource;
  reportResource: (resourceId: string, reason: string, details: string) => void;
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
  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const mapDbResourceToModel = (item: any, bookmarkedSet?: Set<string>): Resource => {
    const uploaderData = Array.isArray(item.uploader) ? item.uploader[0] : item.uploader;
    return {
      id: item.id,
      title: item.title,
      description: item.description || '',
      subject: item.subject_name || 'General Engineering',
      semester: (item.semester || 'Semester 1') as any,
      resourceType: (item.resource_type || 'Notes') as any,
      academicYear: (item.academic_year || '2024-25') as any,
      fileFormat: (item.file_format || 'PDF') as any,
      fileSize: item.file_size || '1.0 MB',
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
        id: uploaderData?.id || item.uploader_id || 'contributor',
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
      const { data, error } = await supabase
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

      if (error) {
        console.warn('[GitNote] Failed to fetch resources from Supabase:', error.message);
        return;
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

  const reportResource = (resourceId: string, reason: string, details: string) => {
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
      } catch (err) {
        // Fallback update if RPC is missing
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

    // Try downloading actual file from Supabase storage if storagePath exists
    if (resource.storagePath && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.storage
          .from('study-resources')
          .download(resource.storagePath);

        if (data && !error) {
          const url = URL.createObjectURL(data);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${resource.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 32)}.${resource.fileFormat.toLowerCase()}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          return;
        }
      } catch (err) {
        console.warn('[GitNote] Storage download fallback:', err);
      }
    }

    // Fallback simulated document text file download
    const mockContent = `GitNote Academic Resource
====================================
Title: ${resource.title}
Subject: ${resource.subject} (${resource.semester})
Type: ${resource.resourceType}
Academic Year: ${resource.academicYear}
Uploaded By: ${resource.uploader.name} (${resource.uploader.college})
Verified Rating: ${resource.rating} / 5.0

Description:
${resource.description}

Key Topics:
${resource.previewContent?.keyTopics.map((t) => `- ${t}`).join('\n') || 'N/A'}

Preview Sample:
${resource.previewContent?.sampleText || 'No sample text available.'}

------------------------------------
Downloaded via GitNote - Learn. Share. Discover.
`;

    const blob = new Blob([mockContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resource.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 32)}.${resource.fileFormat.toLowerCase() === 'pdf' ? 'txt' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <ResourceContext.Provider
      value={{
        resources,
        isLoading,
        refreshResources: fetchResources,
        userProfile,
        toggleBookmark,
        isBookmarked,
        addResource,
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
