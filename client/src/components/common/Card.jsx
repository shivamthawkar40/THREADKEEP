import React from 'react';

const Card = ({ children, className = '', hover = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-[#242729] text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-white/10 shadow-card p-5
        ${hover ? 'hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;



