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
    focus-visible:ring-teal/40 focus-visible:ring-offset-1
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary:   'bg-teal text-ivory hover:bg-teal-dark shadow-soft hover:shadow-card active:scale-[0.98]',
    secondary: 'bg-ivory-dark text-charcoal hover:bg-sage/40 border border-sage/50 hover:border-teal/30 active:scale-[0.98]',
    outline:   'bg-transparent border border-sage/50 text-charcoal hover:bg-mint hover:border-teal/40 active:scale-[0.98]',
    ghost:     'bg-transparent text-charcoal-light hover:text-teal hover:bg-mint/60 active:scale-[0.98]',
    danger:    'bg-coral-dark text-white hover:bg-coral-dark/80 shadow-soft active:scale-[0.98]',
    aqua:      'bg-aqua-dark text-charcoal hover:bg-sage/50 border border-sage/40 active:scale-[0.98]',
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
