import React, { useState } from 'react';
import { User as UserIcon, Shield, CheckCircle2, Lock, Mail, Phone, MapPin, Building2, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.userProfile?.phone || currentUser?.workerProfile?.phone || '');
  const [preferredWard, setPreferredWard] = useState(currentUser?.userProfile?.preferredWard || 'WARD-12');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <UserIcon className="h-5 w-5 text-blue-700" />
            <h1 className="text-lg font-mono font-bold text-slate-900 uppercase">MY PROFILE & IDENTITY</h1>
          </div>
          <p className="text-xs text-slate-500">Manage account information & role credentials</p>
        </div>

        <div className="px-3 py-1 bg-slate-900 text-white rounded-xl font-mono text-xs font-bold">
          {currentUser?.publicId}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Identity Overview */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px]">Role:</span>
            <span className="font-bold text-slate-900">{currentUser?.role}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Account Status:</span>
            <span className="font-bold text-emerald-600">{currentUser?.accountStatus}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Email Verified:</span>
            <span className="font-bold text-blue-600">{currentUser?.emailVerified ? 'VERIFIED' : 'PENDING'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Auth Provider:</span>
            <span className="font-bold text-purple-700 uppercase">{currentUser?.authProvider || 'password'}</span>
          </div>
        </div>

        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-slate-500 uppercase">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-slate-500 uppercase">Email Address (Read Only)</label>
            <input
              type="email"
              value={currentUser?.email}
              disabled
              className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold text-slate-500 uppercase">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold text-slate-500 uppercase">Preferred Ward</label>
              <select
                value={preferredWard}
                onChange={(e) => setPreferredWard(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600"
              >
                <option value="WARD-12">Ward 12 - Pink City Corridor</option>
                <option value="WARD-18">Ward 18 - Vaishali Zone</option>
                <option value="WARD-24">Ward 24 - Malviya Nagar Hub</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              {loading ? 'SAVING...' : 'SAVE PROFILE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
