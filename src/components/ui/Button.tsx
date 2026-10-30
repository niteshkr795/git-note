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
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d3b64] disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants = {
    primary:
      'bg-[#1d3b64] text-white hover:bg-[#152b49] active:bg-[#0f1f35] border border-[#152b49] shadow-2xs',
    secondary:
      'bg-[#f4f2ee] text-[#18181b] border border-[#e5e2db] hover:bg-[#eae7e0] active:bg-[#e2ded6]',
    outline:
      'bg-white text-[#18181b] border border-[#e5e2db] hover:border-[#c9c4b8] hover:bg-[#faf9f7] active:bg-[#f4f2ee] shadow-2xs',
    ghost:
      'bg-transparent text-[#52525b] hover:bg-[#f4f2ee] hover:text-[#18181b]',
    emerald:
      'bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] hover:bg-[#dcfce7]',
    danger:
      'bg-[#fef2f2] text-[#991b1b] border border-[#fecaca] hover:bg-[#fee2e2]',
  };

  const sizes = {
    sm: 'text-xs h-8 px-2.5 gap-1.5',
    md: 'text-xs sm:text-sm h-9 px-3.5 gap-2',
    lg: 'text-sm h-11 px-5 gap-2.5 font-medium',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-3.5 w-3.5 mr-1.5" viewBox="0 0 24 24" fill="none">
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
