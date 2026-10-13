import React from 'react';
import { ResourceType } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'teal' | 'amber' | 'purple' | 'rose' | 'emerald';
  resourceType?: ResourceType;
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  resourceType,
  size = 'md',
  className = '',
  icon,
}) => {
  // If resourceType is provided, automatically select Stitch Academic Precision styling
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
        resolvedVariant = 'emerald';
        break;
      case 'Assignment':
        resolvedVariant = 'purple';
        break;
      case 'Study Material':
        resolvedVariant = 'rose';
        break;
    }
  }

  // Academic Precision palette: Pill-shaped with fine 1px border and tracking
  const variants = {
    default: 'bg-slate-100/80 text-slate-700 border-slate-200/90',
    primary: 'bg-[#eef2ff] text-[#4338ca] border-[#e0e7ff]',
    purple: 'bg-[#f5f3ff] text-[#7c3aed] border-[#ddd6fe]',
    emerald: 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]',
    teal: 'bg-[#f0fdfa] text-[#0f766e] border-[#ccfbf1]',
    amber: 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]',
    rose: 'bg-[#fff1f2] text-[#be123c] border-[#fecdd3]',
  };

  const sizes = {
    sm: 'text-[11px] font-semibold px-2.5 py-0.5 rounded-full border tracking-[0.02em]',
    md: 'text-xs font-semibold px-3 py-1 rounded-full border tracking-[0.02em]',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 transition-colors select-none ${variants[resolvedVariant]} ${sizes[size]} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
