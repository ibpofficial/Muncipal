import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, User as UserIcon, LogOut, HelpCircle, Activity, ChevronDown, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenHelp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenHelp }) => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/');
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'AUTHORITY':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'WORKER':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'PROFESSIONAL':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'USER':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-2.5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <Link to="/" className="flex items-center space-x-3 group">
        <img src="/logo.svg" alt="MFO Logo" className="h-10 w-10 object-contain shrink-0" />
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base md:text-lg font-black font-mono tracking-wider text-slate-900 group-hover:text-blue-900 transition-colors">
              MUNICIPAL ROAD OPERATIONS
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-sans hidden sm:block">
            Infrastructure operations, daily repair scheduling & civic feedback
          </p>
        </div>
      </Link>

      <div className="flex items-center space-x-3">
        {onOpenHelp && (
          <button
            onClick={onOpenHelp}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs border border-slate-300 transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Guide</span>
          </button>
        )}

        {!isAuthenticated ? (
          <Link to="/auth?mode=login" className="uiverse-glow-btn text-xs font-bold">
            <span>Login / Sign up</span>
          </Link>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2.5 p-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all focus:outline-none"
            >
              {currentUser?.photoUrl ? (
                <img
                  src={currentUser.photoUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-300"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center border border-slate-800">
                  {currentUser?.name?.substring(0, 2).toUpperCase() || 'US'}
                </div>
              )}

              <div className="text-left hidden md:block">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-slate-900 leading-none">{currentUser?.name}</span>
                  <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded border uppercase ${getRoleBadgeColor(currentUser?.role)}`}>
                    {currentUser?.role}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 block leading-tight">
                  {currentUser?.publicId || 'ID PENDING'}
                </span>
              </div>

              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-slate-800">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono truncate">{currentUser?.email}</p>
                  <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Public ID:</span>
                    <span className="font-bold text-blue-600">{currentUser?.publicId}</span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Account:</span>
                    <span className="font-bold text-emerald-600 flex items-center">
                      <CheckCircle2 className="h-3 w-3 mr-0.5" />
                      {currentUser?.accountStatus}
                    </span>
                  </div>
                </div>

                <div className="py-1 text-xs font-medium">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-50 text-slate-700"
                  >
                    <UserIcon className="h-4 w-4 text-slate-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/my-activity"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-50 text-slate-700"
                  >
                    <Activity className="h-4 w-4 text-slate-400" />
                    <span>My Activity</span>
                  </Link>
                  {onOpenHelp && (
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenHelp();
                      }}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-50 text-slate-700 w-full text-left"
                    >
                      <HelpCircle className="h-4 w-4 text-slate-400" />
                      <span>How to Use App</span>
                    </button>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-1 text-xs">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-rose-50 text-rose-600 w-full text-left font-bold"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
