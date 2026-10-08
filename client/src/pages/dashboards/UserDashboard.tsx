import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, FileText, Clock, CheckCircle2, AlertTriangle, MapPin, ArrowRight, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchComplaints, fetchPublicComplaintsApi } from '../../services/api';
import { Complaint } from '../../types';

export default function UserDashboard() {
  const { currentUser } = useAuth();
  const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);
  const [publicComplaints, setPublicComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [myRes, pubRes] = await Promise.all([
          fetchComplaints(),
          fetchPublicComplaintsApi(),
        ]);
        setMyComplaints(myRes);
        setPublicComplaints(pubRes.slice(0, 6));
      } catch (err) {
        console.error('Failed to load citizen complaints:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const pendingCount = myComplaints.filter((c) => c.status === 'PENDING').length;
  const inProgressCount = myComplaints.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED' || c.status === 'SCHEDULED').length;
  const resolvedCount = myComplaints.filter((c) => c.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-md uppercase">
              CITIZEN PORTAL
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono text-slate-300 bg-slate-800 rounded border border-slate-700">
              ID: {currentUser?.publicId}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            WELCOME BACK, {currentUser?.name?.toUpperCase()}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-[#600px]">
            Report road hazards, monitor municipal repair timelines, and track your active requests.
          </p>
        </div>

        <Link
          to="/report"
          className="uiverse-glow-btn text-xs font-black uppercase tracking-wider py-3 px-6 shrink-0 self-start md:self-center"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          <span>REPORT A ROAD ISSUE</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">My Total Reports</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{myComplaints.length}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
            <FileText className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">Pending Review</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">In Progress / Scheduled</p>
            <p className="text-2xl font-black text-blue-600 mt-1">{inProgressCount}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">Repairs Completed</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{resolvedCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* My Reports Timeline & List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-mono font-bold text-sm text-slate-900 uppercase">My Submitted Reports</h3>
              <p className="text-xs text-slate-500">Live ticket updates & repair progress timeline</p>
            </div>
            <Link to="/my-reports" className="text-xs font-mono font-bold text-blue-700 hover:underline">
              View All
            </Link>
          </div>

          {loading ? (
            <p className="text-xs font-mono text-slate-400 py-8 text-center">Loading your civic reports...</p>
          ) : myComplaints.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <FileText className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">You haven't submitted any road complaints yet.</p>
              <Link to="/report" className="inline-flex items-center text-xs font-bold text-blue-700 hover:underline">
                <span>Submit your first complaint</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myComplaints.slice(0, 5).map((comp) => (
                <div key={comp.id} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-slate-900">{comp.ticketNumber}</span>
                      <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase ${
                        comp.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        comp.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {comp.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium line-clamp-1">{comp.description}</p>
                    <div className="flex items-center space-x-3 text-[10px] text-slate-500 font-mono">
                      <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" />{comp.ward?.name || comp.wardId}</span>
                      <span>•</span>
                      <span>{new Date(comp.reportedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Link
                    to={`/my-reports?id=${comp.id}`}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 rounded-lg text-xs font-bold text-slate-800 text-center shrink-0"
                  >
                    Track Status
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Public Activity Feed Near Me */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-mono font-bold text-sm text-slate-900 uppercase">Recent Public Reports</h3>
              <p className="text-xs text-slate-500">Sanitized civic feed</p>
            </div>
            <Link to="/public-complaints" className="text-xs font-mono font-bold text-blue-700 hover:underline">
              Explore
            </Link>
          </div>

          <div className="space-y-3">
            {publicComplaints.map((pub) => (
              <div key={pub.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[11px] text-slate-900">{pub.ticketNumber}</span>
                  <span className="text-[10px] font-mono text-slate-500">{pub.roadType}</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{pub.description}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                  <span>Upvotes: {pub.upvoteCount || 0}</span>
                  <span>{new Date(pub.reportedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
