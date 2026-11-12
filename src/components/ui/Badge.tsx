import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'sky' | 'red' | 'purple' | 'slate';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'emerald',
  className = '',
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    sky: 'bg-sky-50 text-sky-800 border-sky-200',
    red: 'bg-red-50 text-red-800 border-red-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shadow-sm ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
};
