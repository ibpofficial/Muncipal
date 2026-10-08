import React, { useState, useEffect } from 'react';
import { Activity, UserCheck, HelpCircle } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  onOpenHelp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRole = 'OFFICER', onRoleChange, onOpenHelp }) => {
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
    <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center space-x-3">
        {/* MFO Official Transparent Logo */}
        <img src="/logo.svg" alt="MFO Logo" className="h-10 w-10 object-contain shrink-0" />
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base md:text-lg font-black font-mono tracking-wider text-slate-900">
              MUNICIPAL FIELD OPERATIONS
            </h1>
            <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-mono uppercase bg-blue-50 text-blue-700 border border-blue-200 rounded font-bold">
              Control Center
            </span>
          </div>
          <p className="text-xs text-slate-600 font-sans hidden sm:block">
            Decision intelligence for municipal road repair operations & daily crew scheduling
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-3">
        {/* How to Use App Uiverse Slide Arrow Button */}
        {onOpenHelp && (
          <button
            onClick={onOpenHelp}
            className="uiverse-slide-btn shadow-sm !py-2 !px-3 text-xs"
          >
            <span>HOW TO USE APP</span>
          </button>
        )}

        {/* Role Switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <UserCheck className="w-3.5 h-3.5 text-slate-500 ml-1" />
          <span className="text-[10px] font-bold text-slate-500 uppercase mr-1 hidden sm:inline">Role:</span>
          {(['OFFICER', 'SUPERVISOR', 'FIELD_CREW'] as UserRole[]).map((role) => (
            <button
              key={role}
              onClick={() => onRoleChange?.(role)}
              className={`px-2 py-1 text-[11px] font-bold rounded transition-colors ${
                currentRole === role
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {role === 'FIELD_CREW' ? 'FIELD' : role}
            </button>
          ))}
        </div>

        {/* System Status Indicator */}
        <div className="hidden lg:flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
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
      </div>
    </header>
  );
};
