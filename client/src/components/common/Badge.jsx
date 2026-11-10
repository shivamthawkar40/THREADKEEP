import React from 'react';

const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variants = {
    default: 'bg-ivory-dark text-charcoal border border-sage/40',
    teal:    'bg-teal/15 text-teal-dark border border-teal/25',
    sage:    'bg-sage/20 text-charcoal-light border border-sage/40',
    coral:   'bg-coral/15 text-coral-dark border border-coral/25',
    gold:    'bg-gold/15 text-gold-dark border border-gold/25',
    aqua:    'bg-aqua-dark/30 text-charcoal border border-sage/30',
    success: 'bg-teal/15 text-teal-dark border border-teal/25',
    warning: 'bg-gold/15 text-gold-dark border border-gold/25',
    error:   'bg-coral/15 text-coral-dark border border-coral/25',
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
