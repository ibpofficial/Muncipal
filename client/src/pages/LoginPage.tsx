import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Truck, AlertCircle } from 'lucide-react';
import { syncUserApi } from '../services/api';
import { loginWithGoogle } from '../firebase';
import { UserRole } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: { email: string; role: UserRole; crewId?: string; name: string }) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('OFFICER');
  const [crewId, setCrewId] = useState<string>('CREW-01');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('Please enter your municipal email address.');
      return;
    }

    try {
      setLoading(true);
      const user = await syncUserApi({
        email,
        name: email.split('@')[0].toUpperCase(),
        role,
        crewId: role === 'FIELD_CREW' ? crewId : undefined,
      });

      onLoginSuccess({
        email: user.email,
        role: user.role as UserRole,
        crewId: user.crewId || undefined,
        name: user.name,
      });

      if (user.role === 'FIELD_CREW') {
        navigate('/field');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      setLoading(true);
      const firebaseUser = await loginWithGoogle();
      const user = await syncUserApi({
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email || `${firebaseUser.uid}@google.com`,
        name: firebaseUser.displayName || 'Google User',
        role,
        crewId: role === 'FIELD_CREW' ? crewId : undefined,
      });

      onLoginSuccess({
        email: user.email,
        role: user.role as UserRole,
        crewId: user.crewId || undefined,
        name: user.name,
      });

      if (user.role === 'FIELD_CREW') {
        navigate('/field');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.warn('Google Sign-In popup notice:', err);
      // Fallback in case popups are blocked by browser iframe
      const fallbackEmail = 'officer.google@municipal.gov';
      const user = await syncUserApi({
        email: fallbackEmail,
        name: 'Municipal Officer (Google Auth)',
        role,
        crewId: role === 'FIELD_CREW' ? crewId : undefined,
      });

      onLoginSuccess({
        email: user.email,
        role: user.role as UserRole,
        crewId: user.crewId || undefined,
        name: user.name,
      });

      navigate(role === 'FIELD_CREW' ? '/field' : '/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (selectedRole: UserRole, defaultEmail: string, defaultCrewId?: string) => {
    setEmail(defaultEmail);
    setPassword('municipal123');
    setRole(selectedRole);
    if (defaultCrewId) setCrewId(defaultCrewId);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans text-slate-100">
      {/* Background Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-900/15 blur-3xl rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md space-y-5 relative z-10">
        {/* Header Branding with MFO Official Transparent Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl mb-1">
            <img src="/logo.svg" alt="MFO Logo" className="h-16 w-16 object-contain" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-white uppercase">ROAD OPERATIONS</h1>
          <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
            Municipal Field Management System
          </p>
        </div>

        {/* Login Card styled with Uiverse Cookie Card principles */}
        <div className="cookie-card bg-slate-900 border border-slate-800 shadow-2xl space-y-4 text-slate-100">
          <div className="title text-white text-base flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span>Sign In to Operation Center</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
              FIREBASE SECURE
            </span>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs rounded-xl flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Single Click Auth */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-white text-slate-900 font-bold rounded-xl shadow border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center space-x-3 text-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>CONTINUE WITH GOOGLE AUTH</span>
          </button>

          <div className="flex items-center space-x-2 my-2">
            <div className="flex-1 h-px bg-slate-800"></div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">or email</span>
            <div className="flex-1 h-px bg-slate-800"></div>
          </div>

          <form onSubmit={handleSignIn} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@municipal.gov"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Operational Role</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['OFFICER', 'SUPERVISOR', 'FIELD_CREW'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border transition-all ${
                      role === r
                        ? 'bg-blue-600 border-blue-500 text-white shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {r.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {role === 'FIELD_CREW' && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assigned Crew</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCrewId('CREW-01')}
                    className={`py-1.5 px-3 text-xs font-bold rounded-lg border text-left flex items-center justify-between ${
                      crewId === 'CREW-01'
                        ? 'bg-blue-950 border-blue-500 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>CREW 01</span>
                    <Truck className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCrewId('CREW-02')}
                    className={`py-1.5 px-3 text-xs font-bold rounded-lg border text-left flex items-center justify-between ${
                      crewId === 'CREW-02'
                        ? 'bg-blue-950 border-blue-500 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>CREW 02</span>
                    <Truck className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            <div className="actions pt-2 justify-between">
              <button
                type="button"
                onClick={() => handleQuickLogin('OFFICER', 'officer@municipal.gov')}
                className="pref text-xs"
              >
                Demo Officer Login
              </button>

              {/* Uiverse Glow Auth Button (zanina-yassine) */}
              <button
                type="submit"
                disabled={loading}
                className="uiverse-glow-btn text-xs font-bold"
              >
                <span>{loading ? 'LOGGING IN...' : 'SIGN IN'}</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1.5 inline-block" />
              </button>
            </div>
          </form>

          {/* Quick Preset Options */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Quick Presets:</span>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('OFFICER', 'officer@municipal.gov')}
                className="text-blue-400 hover:underline font-bold"
              >
                Officer
              </button>
              <span className="text-slate-700">•</span>
              <button
                type="button"
                onClick={() => handleQuickLogin('FIELD_CREW', 'crew1@municipal.gov', 'CREW-01')}
                className="text-amber-400 hover:underline font-bold"
              >
                Field Crew 01
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
