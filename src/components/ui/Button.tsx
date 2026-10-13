'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'emerald' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  // Academic Precision buttons: 8px/rounded-xl, micro-scaling on hover, clean borders
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants = {
    // Primary: Background #4f46e5, hover #4338ca, active #3730a3
    primary: 'bg-[#4f46e5] text-white hover:bg-[#4338ca] active:bg-[#3730a3] focus:ring-[#4f46e5] hover:scale-[1.01] shadow-sm',
    // Secondary Discovery: Background #f5f3ff, border 1px solid #ddd6fe, text #7c3aed, hover #ede9fe
    secondary: 'bg-[#f5f3ff] text-[#7c3aed] border border-[#ddd6fe] hover:bg-[#ede9fe] focus:ring-[#7c3aed]',
    // Outline / Neutral: Background #ffffff, border 1px solid #e2e8f0, text #0f172a, hover border #cbd5e1, hover bg #f8fafc
    outline: 'border border-[#e2e8f0] text-[#0f172a] hover:border-[#cbd5e1] hover:bg-[#f8fafc] focus:ring-slate-300 bg-white shadow-xs',
    // Ghost
    ghost: 'text-[#475569] hover:bg-slate-100 hover:text-[#0f172a] focus:ring-slate-300',
    // Emerald / Verified
    emerald: 'bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0] hover:bg-[#d1fae5] focus:ring-[#10b981]',
    // Danger
    danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 focus:ring-rose-500',
  };

  const sizes = {
    sm: 'text-xs h-9 px-3 gap-1.5',
    md: 'text-sm h-11 px-4 gap-2',
    lg: 'text-base h-12 px-6 gap-2.5 font-semibold',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {rightIcon && !isLoading ? <span className="shrink-0">{rightIcon}</span> : null}
    </button>
  );
};
