import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, UserCheck, Truck, Building, AlertCircle } from 'lucide-react';
import { syncUserApi } from '../services/api';
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

  const handleQuickLogin = (selectedRole: UserRole, defaultEmail: string, defaultCrewId?: string) => {
    setEmail(defaultEmail);
    setPassword('municipal123');
    setRole(selectedRole);
    if (defaultCrewId) setCrewId(defaultCrewId);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans text-slate-100">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-900/20 blur-3xl rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600/20 border border-blue-500/30 rounded-2xl text-blue-400 mb-2">
            <Shield className="h-8 w-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-white">ROAD OPERATIONS</h1>
          <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
            Municipal Field Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs rounded-xl flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@municipal.gov"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operational Role</label>
              <div className="grid grid-cols-3 gap-2">
                {(['OFFICER', 'SUPERVISOR', 'FIELD_CREW'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                      role === r
                        ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {r.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {role === 'FIELD_CREW' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Crew</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCrewId('CREW-01')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-left flex items-center justify-between ${
                      crewId === 'CREW-01'
                        ? 'bg-blue-900/50 border-blue-500 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>CREW 01</span>
                    <Truck className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCrewId('CREW-02')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-left flex items-center justify-between ${
                      crewId === 'CREW-02'
                        ? 'bg-blue-900/50 border-blue-500 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>CREW 02</span>
                    <Truck className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-98 flex items-center justify-center space-x-2 text-sm tracking-wider uppercase"
            >
              <span>{loading ? 'AUTHENTICATING...' : 'SIGN IN'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Access Presets */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center">
              DEMO PRESET LOGIN
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('OFFICER', 'officer@municipal.gov')}
                className="p-2 bg-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-xl text-left text-xs space-y-0.5"
              >
                <div className="font-bold text-slate-200 flex items-center">
                  <UserCheck className="h-3 w-3 mr-1 text-blue-400" />
                  Officer
                </div>
                <div className="text-[10px] text-slate-500 truncate">officer@municipal.gov</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('FIELD_CREW', 'crew1@municipal.gov', 'CREW-01')}
                className="p-2 bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left text-xs space-y-0.5"
              >
                <div className="font-bold text-slate-200 flex items-center">
                  <Truck className="h-3 w-3 mr-1 text-amber-400" />
                  Field Crew 01
                </div>
                <div className="text-[10px] text-slate-500 truncate">crew1@municipal.gov</div>
              </button>
            </div>
          </div>
        </div>

        {/* Environment Banner */}
        <div className="text-center text-[11px] font-mono text-slate-500">
          MUNICIPAL CONTROL CENTER • DEMO SECURE ENVIRONMENT
        </div>
      </div>
    </div>
  );
}
