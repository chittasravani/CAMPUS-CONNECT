import React from 'react';

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel = 'from last month',
  color = 'brand', // 'brand' | 'violet' | 'emerald' | 'amber' | 'blue'
  className = '',
}) {
  const colorMap = {
    brand: {
      bg: 'bg-indigo-50',
      text: 'text-brand-600',
      border: 'border-indigo-100',
    },
    violet: {
      bg: 'bg-violet-50',
      text: 'text-violet-600',
      border: 'border-violet-100',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
    },
    blue: {
      bg: 'bg-sky-50',
      text: 'text-sky-600',
      border: 'border-sky-100',
    },
  };

  const scheme = colorMap[color] || colorMap.brand;

  return (
    <div
      className={`bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {value}
          </div>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.bg} ${scheme.text} shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100 mt-2">
          <span
            className={`font-semibold ${
              trend >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trend >= 0 ? `+${trend}%` : `${trend}%`}
          </span>
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}

export default StatCard;
