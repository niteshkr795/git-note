'use client';

import React, { useState } from 'react';
import { Resource } from '@/types';
import { ResourceCard } from './ResourceCard';
import { EmptyState } from './EmptyState';
import { QuickPreviewModal } from './QuickPreviewModal';

interface ResourceGridProps {
  resources: Resource[];
  onResetFilters?: () => void;
  emptyType?: 'search' | 'bookmarks' | 'uploads' | 'generic';
  canDelete?: boolean;
  onDelete?: (resource: Resource) => void;
}

export const ResourceGrid: React.FC<ResourceGridProps> = ({
  resources,
  onResetFilters,
  emptyType = 'search',
  canDelete,
  onDelete,
}) => {
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);

  if (resources.length === 0) {
    return <EmptyState type={emptyType} onAction={onResetFilters} />;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            canDelete={canDelete || emptyType === 'uploads'}
            onDelete={onDelete}
            onQuickPreview={(res) => setPreviewResource(res)}
          />
        ))}
      </div>

      <QuickPreviewModal
        resource={previewResource}
        isOpen={Boolean(previewResource)}
        onClose={() => setPreviewResource(null)}
      />
    </>
  );
};
