import React from 'react';
import { SearchX, FolderPlus, BookOpen, RotateCcw } from 'lucide-react';
import { Button } from './ui/Button';

interface EmptyStateProps {
  type?: 'search' | 'bookmarks' | 'uploads' | 'generic';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'search',
  title,
  description,
  actionText,
  onAction,
}) => {
  const configs = {
    search: {
      icon: SearchX,
      defaultTitle: 'No Matching Academic Resources Found',
      defaultDesc: 'Try adjusting your search terms, changing the semester filter, or clearing selected tags.',
      defaultAction: 'Reset Filters',
    },
    bookmarks: {
      icon: BookOpen,
      defaultTitle: 'No Bookmarked Resources Yet',
      defaultDesc: 'Save high-yield PYQs, lecture notes, and lab manuals while browsing to quickly revisit them during exams.',
      defaultAction: 'Explore Resources',
    },
    uploads: {
      icon: FolderPlus,
      defaultTitle: 'You Haven’t Contributed Any Resources Yet',
      defaultDesc: 'Help fellow students by uploading your solved question papers, notes, or lab manuals.',
      defaultAction: 'Upload Your First Resource',
    },
    generic: {
      icon: SearchX,
      defaultTitle: 'Nothing Here Right Now',
      defaultDesc: 'Check back soon or explore other academic subjects.',
      defaultAction: 'Back to Home',
    },
  };

  const current = configs[type] || configs.generic;
  const Icon = current.icon;

  return (
    <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-6">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 shadow-sm">
        <Icon className="w-8 h-8 stroke-[1.75]" />
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-1.5">
        {title || current.defaultTitle}
      </h3>

      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
        {description || current.defaultDesc}
      </p>

      {onAction && (
        <Button
          variant="secondary"
          size="md"
          onClick={onAction}
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          {actionText || current.defaultAction}
        </Button>
      )}
    </div>
  );
};
