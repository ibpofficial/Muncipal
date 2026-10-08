import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: number | string;
  subtext?: string;
  icon: LucideIcon;
  color?: string; // Hex or Tailwind color class
  accentBorder?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  color = '#F5B800',
  accentBorder = false,
}) => {
  return (
    <div
      className={`bg-[#11151D] border p-4 rounded-lg flex items-center justify-between transition-all duration-200 hover:border-[#3E4756] ${
        accentBorder ? 'border-[#F5B800]/50 shadow-[0_0_15px_rgba(245,184,0,0.08)]' : 'border-[#262D38]'
      }`}
    >
      <div className="space-y-1">
        <span className="text-[11px] font-mono tracking-wider uppercase text-[#A8B0BE] block">
          {label}
        </span>
        <div className="text-2xl font-bold font-mono text-[#F8FAFC]" style={{ color }}>
          {value}
        </div>
        {subtext && <p className="text-[10px] text-[#6B7280] font-sans">{subtext}</p>}
      </div>

      <div
        className="w-10 h-10 rounded-md bg-[#0D1117] border border-[#262D38] flex items-center justify-center shrink-0"
        style={{ color }}
      >
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};
