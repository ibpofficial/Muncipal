import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, RefreshCw, LogOut, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const { firebaseUser, currentUser, sendVerificationEmail, refreshUser, logout, isEmailVerified } = useAuth();

  const [cooldown, setCooldown] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isEmailVerified) {
      if (currentUser?.role === 'AUTHORITY') navigate('/authority');
      else if (currentUser?.role === 'WORKER') navigate('/worker');
      else if (currentUser?.role === 'PROFESSIONAL') navigate('/professional');
      else navigate('/user');
    }
  }, [isEmailVerified, currentUser, navigate]);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError(null);
    setMessage(null);
    try {
      setLoading(true);
      await sendVerificationEmail();
      setMessage('A new verification email has been sent to your inbox.');
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerified = async () => {
    setError(null);
    setMessage(null);
    try {
      setLoading(true);
      const updatedUser = await refreshUser();
      if (updatedUser?.emailVerified) {
        setMessage('Email verified! Redirecting to dashboard...');
        setTimeout(() => {
          switch (updatedUser.role) {
            case 'AUTHORITY':
              navigate('/authority');
              break;
            case 'WORKER':
              navigate('/worker');
              break;
            case 'PROFESSIONAL':
              navigate('/professional');
              break;
            case 'USER':
            default:
              navigate('/user');
              break;
          }
        }, 1000);
      } else {
        setError("Your email hasn't been verified yet. Please check your inbox or click link in email.");
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify email status.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#090B10] text-[#F8FAFC] font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#11151D] border border-[#262D38] rounded-2xl p-8 shadow-2xl space-y-6 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-[#161C26] border border-[#262D38] rounded-2xl text-[#F5B800]">
          <Mail className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-black uppercase tracking-wider text-white">VERIFY YOUR EMAIL</h1>
          <p className="text-xs text-[#A8B0BE]">
            We sent a verification email to:
          </p>
          <div className="py-2 px-3 bg-[#090B10] border border-[#262D38] rounded-xl font-mono text-xs text-[#F5B800] truncate font-bold">
            {firebaseUser?.email || currentUser?.email || 'Your Registered Email'}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-center justify-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-center justify-center space-x-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{message}</span>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleCheckVerified}
            disabled={loading}
            className="w-full py-3 px-4 bg-[#F5B800] hover:bg-[#d9a300] text-[#090B10] font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg"
          >
            <span>{loading ? 'CHECKING...' : "I'VE VERIFIED"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || loading}
            className="w-full py-2.5 px-4 bg-[#090B10] hover:bg-[#161C26] border border-[#262D38] text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{cooldown > 0 ? `RESEND EMAIL (${cooldown}s)` : 'RESEND VERIFICATION EMAIL'}</span>
          </button>
        </div>

        <div className="pt-4 border-t border-[#262D38] flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleLogout}
            className="text-[#6B7280] hover:text-white font-mono flex items-center space-x-1"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign out / Change email</span>
          </button>
        </div>
      </div>
    </div>
  );
}
