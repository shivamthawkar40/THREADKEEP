import React from 'react';

const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 dark:bg-slate-700/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-white/10',
    teal:    'bg-sky-100 dark:bg-sky-900/40 text-sky-900 dark:text-sky-200 border border-sky-200 dark:border-sky-800',
    sage:    'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600',
    coral:   'bg-slate-800 dark:bg-slate-600 text-white border border-slate-700 dark:border-slate-500',
    gold:    'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800',
    aqua:    'bg-sky-100 dark:bg-sky-900/40 text-sky-900 dark:text-sky-200 border border-sky-200 dark:border-sky-800',
    success: 'bg-sky-100 dark:bg-sky-900/40 text-sky-900 dark:text-sky-200 border border-sky-200 dark:border-sky-800',
    warning: 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800',
    error:   'bg-slate-800 dark:bg-slate-600 text-white border border-slate-700 dark:border-slate-500',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-md font-semibold
        ${variants[variant] || variants.default}
        ${sizes[size] || sizes.sm}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;



