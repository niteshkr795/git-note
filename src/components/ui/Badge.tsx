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
        resolvedVariant = 'default';
        break;
    }
  }

  const variants = {
    default: 'bg-[#f4f2ee] text-[#3f3f46] border-[#e5e2db]',
    primary: 'bg-[#eef3f8] text-[#1d3b64] border-[#cfdbe8]',
    purple: 'bg-[#faf5ff] text-[#6b21a8] border-[#e9d5ff]',
    emerald: 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]',
    teal: 'bg-[#f0fdfa] text-[#0f766e] border-[#ccfbf1]',
    amber: 'bg-[#fef9ee] text-[#92400e] border-[#fde68a]',
    rose: 'bg-[#fff1f2] text-[#9f1239] border-[#fecdd3]',
  };

  const sizes = {
    sm: 'text-[11px] font-medium px-2 py-0.5 rounded border tracking-tight',
    md: 'text-xs font-medium px-2.5 py-0.5 rounded border tracking-tight',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 select-none font-mono ${variants[resolvedVariant]} ${sizes[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
