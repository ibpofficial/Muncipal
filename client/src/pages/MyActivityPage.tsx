import React, { useState, useEffect } from 'react';
import { Activity, Clock, Shield } from 'lucide-react';
import { fetchMyActivityApi } from '../services/api';
import { AuditLog } from '../types';
import { useAuth } from '../context/AuthContext';

export default function MyActivityPage() {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivity() {
      try {
        setLoading(true);
        const data = await fetchMyActivityApi();
        setActivities(data);
      } catch (err) {
        console.error('Failed to load activity:', err);
      } finally {
        setLoading(false);
      }
    }
    loadActivity();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-700" />
            <h1 className="text-lg font-mono font-bold text-slate-900 uppercase">MY ACTIVITY HISTORY</h1>
          </div>
          <p className="text-xs text-slate-500">Personal action log for account {currentUser?.publicId}</p>
        </div>
        <div className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl font-mono text-xs font-bold">
          {activities.length} LOGGED ACTIONS
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        {loading ? (
          <p className="text-xs font-mono text-slate-400 text-center py-8">Loading your activity history...</p>
        ) : activities.length === 0 ? (
          <p className="text-xs font-mono text-slate-400 text-center py-8">No personal actions recorded yet.</p>
        ) : (
          <div className="space-y-3 font-mono">
            {activities.map((act) => (
              <div key={act.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 bg-blue-100 text-blue-900 px-2 py-0.5 rounded text-[10px]">
                      {act.action}
                    </span>
                    {act.entityType && (
                      <span className="text-[10px] text-slate-500">
                        {act.entityType} #{act.entityId || ''}
                      </span>
                    )}
                  </div>
                  {act.metadata && (
                    <div className="text-[11px] text-slate-600 truncate max-w-md">
                      {act.metadata}
                    </div>
                  )}
                </div>

                <div className="text-right text-[10px] text-slate-400 shrink-0">
                  {new Date(act.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
