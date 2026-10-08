import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Cpu } from 'lucide-react';

export const Header: React.FC = () => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }) +
          ' | ' +
          now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }) +
          ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-[#090B10] border-b border-[#262D38] px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-md bg-[#11151D] border border-[#F5B800]/40 flex items-center justify-center text-[#F5B800] shadow-[0_0_15px_rgba(245,184,0,0.15)]">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold font-mono tracking-wider text-[#F8FAFC]">
              MUNICIPAL COMMAND CENTER
            </h1>
            <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-mono uppercase bg-[#F5B800]/10 text-[#F5B800] border border-[#F5B800]/30 rounded">
              Phase 1 Prototype
            </span>
          </div>
          <p className="text-xs text-[#A8B0BE] font-sans">
            Decision intelligence for municipal road operations • Turning complaints into explainable repair decisions
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* System Status Indicator */}
        <div className="flex items-center space-x-2 bg-[#11151D] px-3 py-1.5 rounded-md border border-[#262D38]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-mono text-[#6B7280] leading-none uppercase">Status</span>
            <span className="text-xs font-mono font-semibold text-emerald-400 leading-tight">
              ROAD OPERATIONS ONLINE
            </span>
          </div>
        </div>

        {/* Live Clock Ticker */}
        <div className="hidden lg:flex items-center space-x-2 bg-[#11151D] px-3 py-1.5 rounded-md border border-[#262D38] text-xs font-mono text-[#A8B0BE]">
          <Activity className="w-3.5 h-3.5 text-[#F5B800]" />
          <span>{timeStr || 'SYSTEM ACTIVE'}</span>
        </div>
      </div>
    </header>
  );
};
