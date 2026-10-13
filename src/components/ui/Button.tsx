'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'teal' | 'danger';
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
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none cursor-pointer';

  const variants = {
    primary: 'bg-[#0a1128] text-white hover:bg-[#15224a] focus:ring-[#0a1128] shadow-sm hover:shadow',
    secondary: 'bg-blue-50 text-blue-700 hover:bg-blue-100 focus:ring-blue-500 border border-blue-200/60',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400 bg-white',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-300',
    teal: 'bg-[#0d9488] text-white hover:bg-[#0f766e] focus:ring-[#0d9488] shadow-sm hover:shadow',
    danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 focus:ring-rose-500',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5 font-semibold',
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
        <span>{leftIcon}</span>
      ) : null}
      {children}
      {rightIcon && !isLoading ? <span>{rightIcon}</span> : null}
    </button>
  );
};
