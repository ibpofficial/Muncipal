import React, { useState, useEffect } from 'react';
import { UserCheck, XCircle, CheckCircle2, AlertCircle, Clock, Shield } from 'lucide-react';
import { fetchApprovalsApi, updateApprovalApi } from '../services/api';
import { User, UserRole } from '../types';

export default function ApprovalsPage() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const data = await fetchApprovalsApi();
      setPendingUsers(data);
    } catch (err: any) {
      console.error('Failed to load pending approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleDecision = async (userId: string, status: 'APPROVED' | 'REJECTED', approvedRole?: UserRole) => {
    try {
      setActionLoading(userId);
      await updateApprovalApi(userId, status, approvedRole);
      await loadApprovals();
      alert(`User ${status.toLowerCase()} successfully`);
    } catch (err: any) {
      alert(err.message || 'Failed to update user approval status');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5 text-amber-600" />
            <h1 className="text-lg font-mono font-bold text-slate-900 uppercase">MUNICIPAL ROLE APPROVALS</h1>
          </div>
          <p className="text-xs text-slate-500">Review authority requests and elevated role permissions</p>
        </div>
        <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl font-mono text-xs font-bold">
          {pendingUsers.length} PENDING REVIEW
        </div>
      </div>

      {loading ? (
        <p className="text-xs font-mono text-slate-400 text-center py-12">Loading pending approvals...</p>
      ) : pendingUsers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
          <h3 className="font-mono font-bold text-sm text-slate-900 uppercase">No Pending Role Approvals</h3>
          <p className="text-xs text-slate-500">All authority registration requests have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingUsers.map((u) => (
            <div key={u.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">{u.name}</span>
                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-amber-100 text-amber-800 uppercase">
                      {u.requestedRole || u.role} REQUESTED
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono block">{u.email}</span>
                </div>

                <div className="text-right font-mono text-xs">
                  <span className="text-slate-400 block text-[10px]">Status:</span>
                  <span className="font-bold text-amber-600">{u.accountStatus}</span>
                </div>
              </div>

              {/* Profile Details */}
              {u.authorityProfile && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div><span className="text-slate-400 block">Department:</span> <span className="font-bold text-slate-800">{u.authorityProfile.department || 'N/A'}</span></div>
                  <div><span className="text-slate-400 block">Designation:</span> <span className="font-bold text-slate-800">{u.authorityProfile.designation || 'N/A'}</span></div>
                  <div><span className="text-slate-400 block">Employee ID:</span> <span className="font-bold text-slate-800">{u.authorityProfile.employeeId || 'N/A'}</span></div>
                  <div><span className="text-slate-400 block">Public ID:</span> <span className="font-bold text-blue-700">{u.publicId}</span></div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => handleDecision(u.id, 'REJECTED')}
                  disabled={actionLoading === u.id}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-mono font-bold rounded-xl border border-rose-200 text-xs transition-colors"
                >
                  Reject Request
                </button>

                <button
                  onClick={() => handleDecision(u.id, 'APPROVED', (u.requestedRole || u.role) as UserRole)}
                  disabled={actionLoading === u.id}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold rounded-xl text-xs shadow-md transition-colors"
                >
                  Approve Authority Role
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
