import React from 'react';
import { Search, FolderOpen, BookOpen, RotateCcw } from 'lucide-react';
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
      icon: Search,
      defaultTitle: 'No Matching Academic Records Found',
      defaultDesc: 'Try adjusting your subject terms, broadening the semester filter, or clearing keyword constraints.',
      defaultAction: 'Reset Filters',
    },
    bookmarks: {
      icon: BookOpen,
      defaultTitle: 'No Saved Materials in Your Archive',
      defaultDesc: 'Bookmark exam question papers, verified lecture notes, or lab manuals while browsing to review them later.',
      defaultAction: 'Browse Library Catalog',
    },
    uploads: {
      icon: FolderOpen,
      defaultTitle: 'No Documents Deposited Yet',
      defaultDesc: 'Share your solved previous year question papers, typed summaries, or lab manuals to help your academic peers.',
      defaultAction: 'Deposit First Resource',
    },
    generic: {
      icon: Search,
      defaultTitle: 'No Records to Display',
      defaultDesc: 'This collection currently has no cataloged entries.',
      defaultAction: 'Return to Library',
    },
  };

  const current = configs[type] || configs.generic;
  const Icon = current.icon;

  return (
    <div className="bg-white border border-[#e5e2db] rounded-lg p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-6 shadow-2xs">
      <div className="w-12 h-12 rounded bg-[#f4f2ee] border border-[#e5e2db] flex items-center justify-center text-[#1d3b64] mb-3.5">
        <Icon className="w-5 h-5 stroke-[1.75]" />
      </div>

      <h3 className="font-editorial text-base sm:text-lg font-semibold text-[#18181b] mb-1.5 tracking-tight">
        {title || current.defaultTitle}
      </h3>

      <p className="text-xs sm:text-sm text-[#71717a] max-w-sm mb-5 leading-relaxed">
        {description || current.defaultDesc}
      </p>

      {onAction && (
        <Button
          onClick={onAction}
          variant="secondary"
          size="sm"
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          {actionText || current.defaultAction}
        </Button>
      )}
    </div>
  );
};
