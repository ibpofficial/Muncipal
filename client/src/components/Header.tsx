import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity } from 'lucide-react';

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
          })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-navy-900 border border-navy-700 flex items-center justify-center text-white shadow-md">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold font-mono tracking-wider text-slate-900">
              MUNICIPAL FIELD OPERATIONS
            </h1>
            <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-mono uppercase bg-blue-50 text-blue-700 border border-blue-200 rounded font-bold">
              Prioritizer & Crew-Scheduler
            </span>
          </div>
          <p className="text-xs text-slate-600 font-sans">
            Decision intelligence for municipal road repair operations & daily crew scheduling
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* System Status Indicator */}
        <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-mono text-slate-400 leading-none uppercase">Status</span>
            <span className="text-xs font-mono font-bold text-emerald-700 leading-tight">
              OPERATIONS ONLINE
            </span>
          </div>
        </div>

        {/* Live Clock Ticker */}
        <div className="hidden lg:flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 text-xs font-mono text-slate-600">
          <Activity className="w-3.5 h-3.5 text-blue-600" />
          <span>{timeStr || 'SYSTEM ACTIVE'}</span>
        </div>
      </div>
    </header>
  );
};
