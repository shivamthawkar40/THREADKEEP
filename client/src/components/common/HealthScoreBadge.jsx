import React from 'react';

const HealthScoreBadge = ({ score = 0, size = 'md', showDetails = false }) => {
  const numScore = Number(score) || 0;

  const getColor = (s) => {
    if (s >= 80) return { ring: '#525354', text: '#181818', bg: '#DEE5E8', label: 'Excellent' };
    if (s >= 65) return { ring: '#737F85', text: '#2B2C2C', bg: '#B8C8D7', label: 'Good' };
    if (s >= 45) return { ring: '#95A1A6', text: '#525354', bg: '#DEE5E8', label: 'Fair' };
    return { ring: '#525354', text: '#181818', bg: '#B7C5CC', label: 'At Risk' };
  };

  const colors = getColor(numScore);
  const radius = size === 'lg' ? 40 : size === 'md' ? 24 : 16;
  const stroke = size === 'lg' ? 5 : size === 'md' ? 3.5 : 3;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (numScore / 100) * circumference;

  if (size === 'sm') {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border"
        style={{ backgroundColor: colors.bg, color: colors.text, borderColor: `${colors.ring}40` }}
        title={`Knowledge Health: ${numScore}%`}
      >
        {numScore}%
      </span>
    );
  }

  const svgSize = (radius + stroke + 2) * 2;

  return (
    <div className="flex items-center gap-4">
      {/* Circular Progress */}
      <div className="relative flex-shrink-0">
        <svg width={svgSize} height={svgSize} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="#B7C5CC"
            strokeWidth={stroke}
          />
          {/* Progress */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke={colors.ring}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        {/* Score text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ transform: 'rotate(0deg)' }}
        >
          <span className="text-lg font-black leading-none" style={{ color: colors.text }}>
            {numScore}
          </span>
          <span className="text-[9px] font-bold" style={{ color: colors.ring }}>
            %
          </span>
        </div>
      </div>

      {showDetails && (
        <div className="space-y-1">
          <div className="text-sm font-black" style={{ color: colors.text }}>
            {colors.label}
          </div>
          <div className="text-xs text-charcoal-light">Knowledge Health Score</div>
          {/* Score bar */}
          <div className="w-32 h-1.5 rounded-full bg-ivory-dark overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${numScore}%`, backgroundColor: colors.ring }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthScoreBadge;

