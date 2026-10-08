import React from 'react';
import { PriorityBand } from '../types';

interface PriorityBadgeProps {
  band: PriorityBand;
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ band, size = 'md' }) => {
  const bandStyles: Record<PriorityBand, { bg: string; text: string; border: string }> = {
    CRITICAL: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300',
    },
    HIGH: {
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      border: 'border-orange-300',
    },
    MEDIUM: {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      border: 'border-amber-300',
    },
    LOW: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      border: 'border-emerald-300',
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
      className={`inline-flex items-center justify-center rounded-md border font-semibold uppercase shadow-sm ${style.bg} ${style.text} ${style.border} ${sizeClasses[size]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current" />
      {band}
    </span>
  );
};
