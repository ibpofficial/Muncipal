import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Truck,
  Building2,
  CalendarCheck,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  TrendingUp,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchDashboardSummary, fetchWorkOrders, fetchCrews, generateDailyPlanApi } from '../../services/api';
import { DashboardSummaryResponse, WorkOrder, Crew } from '../../types';
import { PriorityQueue } from '../../components/PriorityQueue';
import { CommandMap } from '../../components/MapContainer';

export default function AuthorityDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [criticalOrders, setCriticalOrders] = useState<WorkOrder[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [planningLoading, setPlanningLoading] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sumData, woData, crewData] = await Promise.all([
        fetchDashboardSummary(),
        fetchWorkOrders({ priorityBand: 'CRITICAL' }),
        fetchCrews(),
      ]);
      setSummary(sumData);
      setCriticalOrders(woData);
      setCrews(crewData);
    } catch (err) {
      console.error('Failed to load authority command center data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePlanToday = async () => {
    try {
      setPlanningLoading(true);
      await generateDailyPlanApi();
      navigate('/daily-plan');
    } catch (err: any) {
      alert(err.message || 'Failed to generate plan');
    } finally {
      setPlanningLoading(false);
    }
  };

  const kpis = summary?.kpis;
  const criticalCount = kpis?.critical || 0;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header Banner */}
      <div className="bg-[#0D1117] border border-[#262D38] text-white rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F5B800]/5 blur-3xl rounded-full pointer-events-none"></div>

        <div className="space-y-2 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-[#F5B800]/20 text-[#F5B800] border border-[#F5B800]/30 rounded-md uppercase">
              MUNICIPAL OPERATIONS CONTROL CENTER
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono text-[#A8B0BE] bg-[#11151D] rounded border border-[#262D38]">
              ID: {currentUser?.publicId}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
            GOOD MORNING, {currentUser?.name?.toUpperCase()}
          </h1>
          <div className="flex items-center space-x-3 text-xs font-mono text-[#A8B0BE]">
            <span className="text-[#EF4444] font-bold flex items-center">
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              {criticalCount} CRITICAL WORK ORDERS REQUIRE ATTENTION
            </span>
            <span>•</span>
            <span>JAIPUR MUNICIPAL CORPORATION</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={handlePlanToday}
            disabled={planningLoading}
            className="uiverse-glow-btn text-xs font-black uppercase tracking-wider py-3 px-5 shadow-lg"
          >
            <CalendarCheck className="h-4 w-4 mr-2" />
            <span>{planningLoading ? 'GENERATING...' : 'PLAN TODAY'}</span>
          </button>

          <Link
            to="/work-orders"
            className="px-4 py-3 bg-[#11151D] hover:bg-[#161C26] text-white font-mono font-bold rounded-xl border border-[#262D38] text-xs transition-colors"
          >
            Priority Queue
          </Link>
          <Link
            to="/crews"
            className="px-4 py-3 bg-[#11151D] hover:bg-[#161C26] text-white font-mono font-bold rounded-xl border border-[#262D38] text-xs transition-colors"
          >
            Crews
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-red-500">
          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">Critical Severity</p>
          <p className="text-2xl font-black text-red-600 mt-1">{kpis?.critical || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-orange-500">
          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">High Priority</p>
          <p className="text-2xl font-black text-orange-600 mt-1">{kpis?.high || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">Pending Review</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{kpis?.pending || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-blue-500">
          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">Total Complaints</p>
          <p className="text-2xl font-black text-blue-900 mt-1">{kpis?.totalComplaints || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">Crews Active</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{crews.length}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-purple-500">
          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">Algorithm Weight</p>
          <p className="text-xs font-mono font-bold text-purple-900 mt-2">40S+25E+20T+10A+5C</p>
        </div>
      </div>

      {/* Critical Attention Banner */}
      {criticalOrders.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-red-800 font-mono font-bold text-sm uppercase">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Critical Attention Immediate Dispatch Queue</span>
            </div>
            <Link to="/work-orders?priorityBand=CRITICAL" className="text-xs font-mono font-bold text-red-700 hover:underline">
              View All ({criticalOrders.length})
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {criticalOrders.slice(0, 3).map((wo) => (
              <div key={wo.id} className="p-3 bg-white rounded-xl border border-red-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-slate-900">{wo.workOrderNumber}</span>
                  <span className="text-red-600">Score: {wo.priorityScore.toFixed(1)}</span>
                </div>
                <p className="text-xs text-slate-700 line-clamp-2">{wo.complaint?.description}</p>
                <div className="text-[10px] font-mono text-slate-500 flex justify-between pt-1">
                  <span>{wo.complaint?.roadType} Road</span>
                  <span className="text-blue-700 font-bold">{wo.assignedCrewId || 'Unassigned'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Priority Queue Component + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <PriorityQueue />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 h-[550px] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <span className="font-mono font-bold text-xs text-slate-900 uppercase">Live Jaipur GIS Operations Map</span>
              <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ACTIVE
              </span>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden border border-slate-200">
              <CommandMap workOrders={[]} crews={crews} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
