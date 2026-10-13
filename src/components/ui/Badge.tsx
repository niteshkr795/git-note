import React from 'react';
import { ResourceType } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'teal' | 'amber' | 'purple' | 'rose' | 'slate';
  resourceType?: ResourceType;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  resourceType,
  size = 'md',
  className = '',
}) => {
  // If resourceType is provided, automatically select tailored styling
  let resolvedVariant = variant;
  if (resourceType) {
    switch (resourceType) {
      case 'PYQ':
        resolvedVariant = 'amber';
        break;
      case 'Notes':
        resolvedVariant = 'primary';
        break;
      case 'Lab Manual':
        resolvedVariant = 'teal';
        break;
      case 'Assignment':
        resolvedVariant = 'purple';
        break;
      case 'Study Material':
        resolvedVariant = 'rose';
        break;
    }
  }

  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200/80',
    primary: 'bg-blue-50 text-blue-700 border-blue-200/80',
    teal: 'bg-teal-50 text-teal-800 border-teal-200/80',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/80',
    purple: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
    slate: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  const sizes = {
    sm: 'text-[11px] font-medium px-2 py-0.5 rounded-md border',
    md: 'text-xs font-semibold px-2.5 py-1 rounded-lg border',
  };

  return (
    <span className={`inline-flex items-center gap-1 font-medium tracking-tight ${variants[resolvedVariant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};
