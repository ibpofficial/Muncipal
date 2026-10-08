import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: number | string;
  subtext?: string;
  icon: LucideIcon;
  color?: string;
  accentBorder?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  color = '#1E3A8A',
  accentBorder = false,
}) => {
  return (
    <div
      className={`bg-white border rounded-xl p-4 flex items-center justify-between transition-all duration-200 hover:shadow-md ${
        accentBorder
          ? 'border-red-300 bg-red-50/20 shadow-sm'
          : 'border-slate-200 shadow-sm'
      }`}
    >
      <div className="space-y-1">
        <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500 block">
          {label}
        </span>
        <div className="text-2xl font-extrabold font-mono text-slate-900" style={{ color }}>
          {value}
        </div>
        {subtext && <p className="text-[11px] text-slate-500 font-sans">{subtext}</p>}
      </div>

      <div
        className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 shadow-inner"
        style={{ color }}
      >
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};
