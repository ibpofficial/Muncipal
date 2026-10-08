import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Filter, Calendar } from 'lucide-react';
import { fetchAuditLogApi } from '../services/api';
import { AuditLog } from '../types';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await fetchAuditLogApi({
        search: search || undefined,
        role: roleFilter || undefined,
      });
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [search, roleFilter]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            <h1 className="text-lg font-mono font-bold text-slate-900 uppercase">SYSTEM AUDIT LOG & COMPLIANCE</h1>
          </div>
          <p className="text-xs text-[#6B7280]">Complete historical record of municipal actions, user authentication, and work order operations</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="AUTHORITY">AUTHORITY</option>
            <option value="WORKER">WORKER</option>
            <option value="PROFESSIONAL">PROFESSIONAL</option>
            <option value="USER">USER</option>
          </select>

          <div className="relative w-48">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search log..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-xs font-mono text-slate-400 text-center py-12">Loading system audit records...</p>
        ) : logs.length === 0 ? (
          <p className="text-xs font-mono text-slate-400 text-center py-12">No audit log entries matching filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[11px] text-slate-500 uppercase">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User & Public ID</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Entity Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-[#6B7280] text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{log.user?.name || 'System / Unauth'}</span>
                      <span className="text-[10px] text-blue-700">{log.publicId || log.userId || '—'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-slate-100 text-slate-800 uppercase border border-slate-200">
                        {log.role || 'PUBLIC'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 px-2 py-0.5 bg-blue-50 text-blue-800 rounded border border-blue-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-600 max-w-xs truncate">
                      {log.metadata || '—'}
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
