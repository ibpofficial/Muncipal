import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { sendPasswordReset, mapFirebaseAuthError } from '../firebase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      await sendPasswordReset(email);
      setSuccess('Password reset link sent! Please check your email inbox.');
      setEmail('');
    } catch (err: any) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090B10] text-[#F8FAFC] font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#11151D] border border-[#262D38] rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-4 bg-[#161C26] border border-[#262D38] rounded-2xl text-[#F5B800]">
            <KeyRound className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-wider text-white">RESET YOUR PASSWORD</h1>
          <p className="text-xs text-[#A8B0BE]">
            Enter your municipal account email to receive a password reset link.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-950/40 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-[#A8B0BE] uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-[#6B7280]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="registered@municipal.gov"
                className="w-full pl-10 pr-4 py-2.5 bg-[#090B10] border border-[#262D38] rounded-xl text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5B800]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#F5B800] hover:bg-[#d9a300] text-[#090B10] font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? 'SENDING RESET LINK...' : 'SEND RESET LINK'}
          </button>
        </form>

        <div className="pt-4 border-t border-[#262D38] text-center">
          <Link
            to="/auth?mode=login"
            className="text-xs font-mono font-bold text-[#A8B0BE] hover:text-[#F5B800] transition-colors inline-flex items-center space-x-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>RETURN TO SIGN IN</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
