'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Resource, UserProfile } from '@/types';
import { INITIAL_RESOURCES, MOCK_USER_PROFILE } from '@/data/mockData';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface ResourceContextType {
  resources: Resource[];
  userProfile: UserProfile;
  toggleBookmark: (resourceId: string) => void;
  isBookmarked: (resourceId: string) => boolean;
  addResource: (newResource: Omit<Resource, 'id' | 'createdAt' | 'downloadCount' | 'viewCount' | 'rating' | 'uploader'>) => Resource;
  reportResource: (resourceId: string, reason: string, details: string) => void;
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
  mockDownload: (resource: Resource) => void;
}

const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

export const ResourceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_USER_PROFILE);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast notification management
  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleBookmark = (resourceId: string) => {
    setResources((prev) =>
      prev.map((r) => {
        if (r.id === resourceId) {
          const nextBookmarked = !r.isBookmarked;
          if (nextBookmarked) {
            addToast('success', 'Resource Bookmarked', `"${r.title}" saved to your study library.`);
          } else {
            addToast('info', 'Bookmark Removed', `"${r.title}" removed from your bookmarks.`);
          }
          return { ...r, isBookmarked: nextBookmarked };
        }
        return r;
      })
    );

    // Also update user profile bookmarks count
    setUserProfile((prev) => {
      const isCurrentlyBookmarked = resources.find((r) => r.id === resourceId)?.isBookmarked;
      return {
        ...prev,
        stats: {
          ...prev.stats,
          totalBookmarks: Math.max(0, prev.stats.totalBookmarks + (isCurrentlyBookmarked ? -1 : 1)),
        },
      };
    });
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
        id: userProfile.id,
        name: userProfile.name,
        avatar: userProfile.avatar,
        college: userProfile.college,
        branch: userProfile.branch,
        semester: userProfile.semester,
        verified: true,
      },
      previewContent: {
        summary: resourceData.description.slice(0, 160) + '...',
        keyTopics: resourceData.tags.length > 0 ? resourceData.tags : ['Unit 1 Overview', 'Important Concepts', 'Worked Examples'],
        sampleText: `Title: ${resourceData.title}\nSubject: ${resourceData.subject}\nAcademic Year: ${resourceData.academicYear}\n\nDocument uploaded and verified on GitNote academic network.\n\nDescription:\n${resourceData.description}`,
      },
    };

    setResources((prev) => [newResource, ...prev]);

    // Update profile stats
    setUserProfile((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        totalUploads: prev.stats.totalUploads + 1,
        reputationPoints: prev.stats.reputationPoints + 50,
      },
    }));

    addToast('success', 'Resource Published', `"${newResource.title}" is now available in Explore!`);
    return newResource;
  };

  const reportResource = (resourceId: string, reason: string, details: string) => {
    addToast('info', 'Report Received', 'Thank you. Academic moderators will review this document within 24 hours.');
  };

  const mockDownload = (resource: Resource) => {
    // Increment download count locally
    setResources((prev) =>
      prev.map((r) => (r.id === resource.id ? { ...r, downloadCount: r.downloadCount + 1 } : r))
    );

    addToast('success', 'Download Started', `Downloading "${resource.title}" (${resource.fileSize})...`);

    // Create a mock text file download to simulate realistic file saving
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
${resource.previewContent?.keyTopics.map(t => `- ${t}`).join('\n') || 'N/A'}

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
