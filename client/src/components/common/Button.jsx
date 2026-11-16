import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  title,
}) => {
  const base = `
    inline-flex items-center justify-center gap-2 font-semibold rounded-xl
    transition-all duration-200 select-none focus:outline-none focus-visible:ring-2
    focus-visible:ring-slate/40 focus-visible:ring-offset-1
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary:   'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-white shadow-soft hover:shadow-card active:scale-[0.98]',
    dark:      'bg-[#111111] text-white hover:bg-[#292929] shadow-soft hover:shadow-card active:scale-[0.98]',
    secondary: 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600 border border-[#B7C5CC] active:scale-[0.98]',
    outline:   'bg-transparent border border-slate-300 dark:border-white/15 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 active:scale-[0.98]',
    ghost:     'bg-transparent text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 active:scale-[0.98]',
    danger:    'bg-rose-700 dark:bg-rose-600 text-white hover:bg-rose-800 dark:hover:bg-rose-500 shadow-soft active:scale-[0.98]',
    aqua:      'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600 border border-[#B7C5CC] active:scale-[0.98]',
  };

  const sizes = {
    xs:  'px-2.5 py-1.5 text-[11px] gap-1.5',
    sm:  'px-3.5 py-2 text-xs',
    md:  'px-5 py-2.5 text-sm',
    lg:  'px-7 py-3.5 text-sm',
  };

  const iconSizes = {
    xs:  'w-3 h-3',
    sm:  'w-3.5 h-3.5',
    md:  'w-4 h-4',
    lg:  'w-5 h-5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      title={title}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
    >
      {loading ? (
        <>
          <span className={`spinner inline-block ${iconSizes[size] || iconSizes.md}`} />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className={iconSizes[size] || iconSizes.md} />}
          {children && <span>{children}</span>}
          {Icon && iconPosition === 'right' && <Icon className={iconSizes[size] || iconSizes.md} />}
        </>
      )}
    </button>
  );
};

export default Button;



