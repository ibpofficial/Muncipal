import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Clock, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090B10] flex items-center justify-center text-[#F5B800] font-mono text-xs">
        <span>AUTHENTICATING OPERATIONAL SESSION...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectParam = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?redirect=${redirectParam}`} replace />;
  }

  return <>{children}</>;
};

export const VerifiedEmailRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isEmailVerified, currentUser, loading } = useAuth();

  if (loading) return null;

  // Google users are automatically verified
  if (!isEmailVerified && currentUser?.authProvider === 'password') {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
};

export const RoleRoute: React.FC<{ allowedRoles: UserRole[]; children: ReactNode }> = ({ allowedRoles, children }) => {
  const { role, loading } = useAuth();

  if (loading) return null;

  if (!role || !allowedRoles.includes(role)) {
    // Redirect wrong-role visit to user's default dashboard
    if (role === 'AUTHORITY') return <Navigate to="/authority" replace />;
    if (role === 'WORKER') return <Navigate to="/worker" replace />;
    if (role === 'PROFESSIONAL') return <Navigate to="/professional" replace />;
    return <Navigate to="/user" replace />;
  }

  return <>{children}</>;
};

export const AccountStatusGate: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { accountStatus, loading, logout } = useAuth();

  if (loading) return null;

  if (accountStatus === 'PENDING_APPROVAL') {
    return (
      <div className="min-h-screen bg-[#090B10] text-[#F8FAFC] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#11151D] border border-[#262D38] rounded-2xl p-8 shadow-2xl text-center space-y-6">
          <div className="inline-flex items-center justify-center p-4 bg-[#161C26] border border-[#262D38] rounded-2xl text-[#EAB308]">
            <Clock className="h-10 w-10 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black uppercase tracking-wider text-white">ACCOUNT AWAITING AUTHORIZATION</h1>
            <p className="text-xs text-[#A8B0BE] leading-relaxed">
              Your municipal authority account has been registered and is currently under review by an official administrator.
            </p>
          </div>
          <div className="p-3 bg-[#090B10] border border-[#262D38] rounded-xl text-[11px] text-[#6B7280] font-mono">
            Status: PENDING_APPROVAL
          </div>
          <button
            onClick={() => logout()}
            className="w-full py-2.5 px-4 bg-[#090B10] hover:bg-[#161C26] border border-[#262D38] text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  if (accountStatus === 'SUSPENDED') {
    return (
      <div className="min-h-screen bg-[#090B10] text-[#F8FAFC] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#11151D] border border-red-900/50 rounded-2xl p-8 shadow-2xl text-center space-y-6">
          <div className="inline-flex items-center justify-center p-4 bg-red-950 border border-red-800 rounded-2xl text-red-400">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black uppercase tracking-wider text-white">ACCOUNT SUSPENDED</h1>
            <p className="text-xs text-[#A8B0BE] leading-relaxed">
              Your platform access has been suspended by municipal operations control.
            </p>
          </div>
          <div className="p-3 bg-red-950/20 border border-red-800/40 rounded-xl text-[11px] text-red-300 font-mono">
            Contact Support: support@municipal.gov
          </div>
          <button
            onClick={() => logout()}
            className="w-full py-2.5 px-4 bg-[#090B10] hover:bg-[#161C26] border border-[#262D38] text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
