import React from 'react';
import { PriorityBand } from '../types';

interface PriorityBadgeProps {
  band: PriorityBand;
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ band, size = 'md' }) => {
  const bandStyles: Record<PriorityBand, { bg: string; text: string; border: string; glow: string }> = {
    CRITICAL: {
      bg: 'bg-red-950/70',
      text: 'text-red-400',
      border: 'border-red-600/60',
      glow: 'shadow-[0_0_10px_rgba(239,68,68,0.25)]',
    },
    HIGH: {
      bg: 'bg-orange-950/70',
      text: 'text-orange-400',
      border: 'border-orange-600/60',
      glow: 'shadow-[0_0_10px_rgba(249,115,22,0.25)]',
    },
    MEDIUM: {
      bg: 'bg-yellow-950/70',
      text: 'text-yellow-400',
      border: 'border-yellow-600/60',
      glow: 'shadow-[0_0_10px_rgba(234,179,8,0.25)]',
    },
    LOW: {
      bg: 'bg-emerald-950/70',
      text: 'text-emerald-400',
      border: 'border-emerald-600/60',
      glow: 'shadow-[0_0_10px_rgba(34,197,94,0.25)]',
    },
  };

  const style = bandStyles[band] || bandStyles.LOW;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] font-mono tracking-wider',
    md: 'px-2.5 py-1 text-xs font-mono tracking-wider',
    lg: 'px-3 py-1.5 text-sm font-mono tracking-widest font-bold',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded border font-semibold uppercase ${style.bg} ${style.text} ${style.border} ${style.glow} ${sizeClasses[size]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse-subtle bg-current" />
      {band}
    </span>
  );
};
