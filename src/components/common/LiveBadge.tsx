import React from 'react';

export const LiveBadge: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => {
  return (
    <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-rose-600">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
      </span>
      <span className={size === 'sm' ? 'text-[11px]' : 'text-xs'}>LIVE</span>
    </span>
  );
};
