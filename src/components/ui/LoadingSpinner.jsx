import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({
  size = 'md',
  message = 'Loading...',
  className = '',
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 gap-3 text-slate-500 ${className}`}>
      <Loader2 className={`animate-spin text-brand-600 ${sizeClasses[size] || sizeClasses.md}`} />
      {message && <p className="text-sm font-medium">{message}</p>}
    </div>
  );
}

export default LoadingSpinner;
