import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, ThumbsUp, MessageSquare, AlertCircle, Shield, ArrowRight } from 'lucide-react';
import { fetchPublicComplaintsApi, upvoteComplaintApi } from '../services/api';
import { Complaint } from '../types';
import { useAuth } from '../context/AuthContext';

export default function PublicComplaintsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPublic() {
      try {
        setLoading(true);
        const data = await fetchPublicComplaintsApi();
        setComplaints(data);
      } catch (err) {
        console.error('Failed to load public complaints:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPublic();
  }, []);

  const handleUpvote = async (id: string) => {
    if (!isAuthenticated) {
      navigate(`/auth?mode=login&redirect=${encodeURIComponent('/public-complaints')}`);
      return;
    }
    try {
      await upvoteComplaintApi(id);
      const data = await fetchPublicComplaintsApi();
      setComplaints(data);
    } catch (err: any) {
      alert(err.message || 'Failed to upvote');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-[#0D1117] border border-[#262D38] text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-[#F5B800]/20 text-[#F5B800] border border-[#F5B800]/30 rounded-md uppercase">
            PUBLIC CIVIC FEED
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
            JAIPUR PUBLIC ROAD REPAIR FEED
          </h1>
          <p className="text-xs text-[#A8B0BE] max-w-xl">
            Sanitized civic complaint log for public inspection. Upvote critical issues or sign in to submit a report.
          </p>
        </div>

        <Link
          to="/report"
          className="uiverse-glow-btn text-xs font-black uppercase tracking-wider py-3 px-6 shrink-0 self-start md:self-center"
        >
          <span>REPORT A ROAD ISSUE</span>
        </Link>
      </div>

      {loading ? (
        <p className="text-xs font-mono text-slate-400 text-center py-12">Loading public complaint feed...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {complaints.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-slate-900">{c.ticketNumber}</span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                    c.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                    c.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {c.status}
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-medium line-clamp-3">{c.description}</p>

                <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500 pt-1">
                  <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{c.ward?.name || c.wardId} • {c.roadType}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleUpvote(c.id)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono font-bold rounded-lg transition-colors"
                >
                  <ThumbsUp className="h-3.5 w-3.5 text-blue-600" />
                  <span>{c.upvoteCount || 0} Upvotes</span>
                </button>

                <span className="text-[10px] font-mono text-slate-400">
                  {new Date(c.reportedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
