import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, CheckCircle2, Clock, ShieldCheck, AlertCircle, Building2, MapPin, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProfessionalDashboard() {
  const { currentUser } = useAuth();
  const proProfile = currentUser?.professionalProfile;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-purple-800/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-md uppercase">
              PROFESSIONAL WORKSPACE
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono text-slate-300 bg-slate-800 rounded border border-slate-700">
              ID: {currentUser?.publicId}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            WELCOME, {currentUser?.name?.toUpperCase()}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Enterprise infrastructure service portal, contractor bids, and municipal workflow participation.
          </p>
        </div>

        <button
          disabled
          className="px-6 py-3 bg-purple-900/60 text-purple-200 border border-purple-700/50 rounded-xl font-mono text-xs font-bold uppercase tracking-wider shrink-0 cursor-not-allowed opacity-80"
        >
          VIEW ACTIVE WORK (INTEGRATION COMING SOON)
        </button>
      </div>

      {/* Profile & Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Verification Status</span>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-amber-100 text-amber-800 border border-amber-200">
              {proProfile?.verificationStatus || 'PENDING'}
            </span>
          </div>
          <div className="text-sm font-bold text-slate-900">{proProfile?.businessName || 'Business Profile Pending'}</div>
          <p className="text-xs text-slate-500">{proProfile?.profession || 'Civil Contractor / Infrastructure Partner'}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Assigned Service Area</span>
            <MapPin className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-sm font-bold text-slate-900">{proProfile?.serviceArea || 'Jaipur Central Zone'}</div>
          <p className="text-xs text-slate-500">Contact: {proProfile?.phone || currentUser?.email}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Profile Completion</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-sm font-bold text-slate-900">100% Verified</div>
          <p className="text-xs text-slate-500">Authorized for municipal tender viewing</p>
        </div>
      </div>

      {/* Honest Empty State Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-4">
        <div className="inline-flex p-4 bg-slate-100 text-slate-600 rounded-2xl border border-slate-200">
          <Building2 className="h-10 w-10" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="font-mono font-bold text-base text-slate-900 uppercase">
            Municipal Professional Workflow Integration
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Professional bidding, external contractor dispatch, and automated quality assurance workflows are being integrated with Jaipur Municipal Corporation systems.
          </p>
        </div>
        <div className="inline-block px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 font-mono text-[11px] font-bold rounded-lg uppercase">
          MODULE IN DEVELOPMENT • COMING SOON
        </div>
      </div>
    </div>
  );
}
