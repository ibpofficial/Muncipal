import React, { useState, useEffect } from 'react';
import { Users, Shield, Truck, Search, CheckCircle2, Ban, RefreshCw } from 'lucide-react';
import { updateUserStatusApi, updateUserCrewApi, fetchCrews } from '../services/api';
import { User, Crew } from '../types';

export default function UsersAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const resCrews = await fetchCrews();
      setCrews(resCrews);
      
      const resUsers = await fetch('/api/audit-log').then((r) => r.json());
      // Fetch users list from backend or approvals
      const res = await fetch('/api/approvals').then((r) => r.json());
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to load user directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (user: any) => {
    const nextStatus = user.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await updateUserStatusApi(user.id, nextStatus);
      await loadData();
      alert(`User ${user.name} set to ${nextStatus}`);
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleAssignCrew = async (userId: string, crewId: string) => {
    try {
      await updateUserCrewApi(userId, crewId === 'NONE' ? null : crewId);
      await loadData();
      alert('Worker crew assignment updated');
    } catch (err: any) {
      alert(err.message || 'Failed to assign crew');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-800" />
            <h1 className="text-lg font-mono font-bold text-slate-900 uppercase">MUNICIPAL USER & CREW DIRECTORY</h1>
          </div>
          <p className="text-xs text-slate-500">Manage account authorization status & field worker crew assignments</p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or publicId..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-xs font-mono text-slate-400 text-center py-12">Loading user records...</p>
        ) : users.length === 0 ? (
          <p className="text-xs font-mono text-slate-400 text-center py-12">No user records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[11px] text-slate-500 uppercase">
                <tr>
                  <th className="py-3 px-4">Public ID</th>
                  <th className="py-3 px-4">Name & Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Crew</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{u.publicId}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase bg-slate-100 text-slate-800 border border-slate-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase ${
                        u.accountStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {u.accountStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {u.role === 'WORKER' ? (
                        <select
                          value={u.crewId || 'NONE'}
                          onChange={(e) => handleAssignCrew(u.id, e.target.value)}
                          className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none"
                        >
                          <option value="NONE">Unassigned</option>
                          <option value="CREW-01">CREW-01 (Alpha)</option>
                          <option value="CREW-02">CREW-02 (Beta)</option>
                        </select>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1 font-mono font-bold rounded text-[11px] transition-colors ${
                          u.accountStatus === 'ACTIVE'
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {u.accountStatus === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
