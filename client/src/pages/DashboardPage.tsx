import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardSummary, fetchWorkOrders, fetchMapWorkOrders, fetchDailyPlan } from '../services/api';
import { DashboardSummaryResponse, WorkOrder, MapWorkOrder, RoadAsset, Crew, DailyPlanResponse } from '../types';
import { KpiCard } from '../components/KpiCard';
import { CommandMap } from '../components/MapContainer';
import { PriorityQueue } from '../components/PriorityQueue';
import { WorkOrderDetailModal } from '../components/WorkOrderDetailModal';
import {
  AlertTriangle,
  Flame,
  Clock,
  Truck,
  Layers,
  CalendarCheck,
  ArrowRight,
  RefreshCw,
  Sparkles,
  BarChart2,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [mapWorkOrders, setMapWorkOrders] = useState<MapWorkOrder[]>([]);
  const [roadAssets, setRoadAssets] = useState<RoadAsset[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [dailyPlan, setDailyPlan] = useState<DailyPlanResponse['data'] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [sumData, woData, mapData, planRes] = await Promise.all([
        fetchDashboardSummary(),
        fetchWorkOrders(),
        fetchMapWorkOrders(),
        fetchDailyPlan(),
      ]);
      setSummary(sumData);
      setWorkOrders(woData);
      setMapWorkOrders(mapData.workOrders);
      setRoadAssets(mapData.assets);
      setCrews(mapData.crews);
      setDailyPlan(planRes.data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Top Banner & PLAN TODAY Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-mono font-bold text-slate-900">MUNICIPAL COMMAND CENTER</h1>
          <p className="text-xs text-slate-600">
            Real-time road repair prioritization & daily crew deployment intelligence
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadDashboardData}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg font-mono text-xs font-bold flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>REFRESH</span>
          </button>

          <button
            onClick={() => navigate('/daily-plan')}
            className="px-5 py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-mono text-xs font-bold rounded-lg flex items-center space-x-2 transition-all shadow-md"
          >
            <CalendarCheck className="w-4 h-4 text-blue-300" />
            <span>PLAN TODAY</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TOP KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="TOTAL COMPLAINTS"
          value={summary?.kpis.totalComplaints ?? 0}
          subtext="Seeded & citizen reports"
          icon={Layers}
          color="#0F172A"
        />
        <KpiCard
          label="CRITICAL PRIORITY"
          value={summary?.kpis.critical ?? 0}
          subtext="Immediate repair required"
          icon={AlertTriangle}
          color="#DC2626"
          accentBorder={true}
        />
        <KpiCard
          label="HIGH PRIORITY"
          value={summary?.kpis.high ?? 0}
          subtext="24-48h target window"
          icon={Flame}
          color="#EA580C"
        />
        <KpiCard
          label="PENDING DISPATCH"
          value={summary?.kpis.pending ?? 0}
          subtext="Awaiting crew assignment"
          icon={Clock}
          color="#D97706"
        />
        <KpiCard
          label="ACTIVE CREWS"
          value={summary?.kpis.activeCrews ?? 0}
          subtext="Available repair units"
          icon={Truck}
          color="#059669"
        />
      </div>

      {/* ACTION REQUIRED & TODAY'S FIELD PLAN CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Action Required Alert Banner */}
        <div className="bg-red-50/60 border border-red-200 rounded-xl p-5 space-y-3 shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-red-700 uppercase tracking-wider flex items-center">
              <AlertTriangle className="w-4 h-4 text-red-600 mr-1.5" />
              ACTION REQUIRED
            </span>
            <h2 className="text-base font-mono font-bold text-slate-900">
              {summary?.kpis.critical ?? 0} Critical work orders require officer attention
            </h2>
            <p className="text-xs text-slate-600">
              High severity hazards near school zones and medical corridors detected in current queue.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/work-orders?priorityBand=CRITICAL')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
            >
              <span>REVIEW CRITICAL JOBS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Today's Field Plan Summary Card */}
        <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-5 space-y-3 shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-blue-800 uppercase tracking-wider flex items-center">
              <CalendarCheck className="w-4 h-4 text-blue-600 mr-1.5" />
              TODAY'S FIELD DEPLOYMENT PLAN
            </span>
            <div className="flex items-center space-x-4 font-mono text-xs font-bold text-slate-900 pt-1">
              <span>{dailyPlan?.summary.totalJobsPlanned ?? 0} Jobs Planned</span>
              <span>•</span>
              <span>{dailyPlan?.summary.crewsUsed ?? 2} Active Crews</span>
              <span>•</span>
              <span className="text-blue-700">{dailyPlan?.summary.totalTravelKm ?? 0} km Est. Travel</span>
            </div>
            <p className="text-xs text-slate-600 font-sans pt-1">
              Automated route sequence and workload balancing active for 08:30–17:00 shift.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/daily-plan')}
              className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white font-mono text-xs font-bold rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
            >
              <span>OPEN DAILY PLAN</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN DASHBOARD LAYOUT: MAP LEFT, QUEUE RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[620px]">
        {/* LEFT: MAP */}
        <div className="lg:col-span-8 h-full flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-900 font-bold uppercase tracking-wider flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-600 mr-2 animate-pulse" />
              OPERATIONAL MAP
            </span>
            <div className="flex items-center space-x-3 text-[11px] text-slate-600">
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-600 mr-1" /> Critical</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-orange-600 mr-1" /> High</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-600 mr-1" /> Medium</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-600 mr-1" /> Low</span>
            </div>
          </div>
          <div className="flex-1">
            <CommandMap
              workOrders={mapWorkOrders}
              assets={roadAssets}
              crews={crews}
              selectedWorkOrderId={selectedWorkOrderId}
              onSelectWorkOrder={(id) => setSelectedWorkOrderId(id)}
            />
          </div>
        </div>

        {/* RIGHT: PRIORITY QUEUE */}
        <div className="lg:col-span-4 h-full">
          <PriorityQueue
            workOrders={workOrders}
            selectedWorkOrderId={selectedWorkOrderId}
            onSelectWorkOrder={(id) => setSelectedWorkOrderId(id)}
            isLoading={loading}
          />
        </div>
      </div>

      {/* BOTTOM ANALYTICS & CHARTS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chart 1: Complaints by Priority */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-900 uppercase flex items-center">
                <BarChart2 className="w-4 h-4 text-red-600 mr-1.5" />
                COMPLAINTS BY PRIORITY BAND
              </h3>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5">Automated scoring distribution (0–100)</p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
              {summary?.kpis.totalComplaints ?? 50} Total
            </span>
          </div>

          {/* Graphical Recharts & Data Bars Split */}
          <div className="space-y-3">
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={140}>
                <BarChart data={summary?.charts.byPriority ?? [
                  { name: 'Critical', count: 14, color: '#EF4444' },
                  { name: 'High', count: 15, color: '#F97316' },
                  { name: 'Medium', count: 14, color: '#EAB308' },
                  { name: 'Low', count: 7, color: '#22C55E' },
                ]} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748B" tick={{ fill: '#475569', fontSize: 10 }} />
                  <YAxis stroke="#64748B" tick={{ fill: '#475569', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {(summary?.charts.byPriority ?? []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Data Breakdown List */}
            <div className="space-y-2 pt-2 border-t border-slate-100 font-mono text-xs">
              {[
                { band: 'CRITICAL', label: 'Critical Priority', count: summary?.kpis.critical ?? 14, color: 'bg-red-600', textColor: 'text-red-700', pct: 28 },
                { band: 'HIGH', label: 'High Urgency', count: summary?.kpis.high ?? 15, color: 'bg-orange-500', textColor: 'text-orange-700', pct: 30 },
                { band: 'MEDIUM', label: 'Medium Window', count: summary?.kpis.medium ?? 14, color: 'bg-amber-500', textColor: 'text-amber-700', pct: 28 },
                { band: 'LOW', label: 'Low Routine', count: summary?.kpis.low ?? 7, color: 'bg-emerald-600', textColor: 'text-emerald-700', pct: 14 },
              ].map((item) => (
                <div
                  key={item.band}
                  onClick={() => navigate(`/work-orders?priorityBand=${item.band}`)}
                  className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-all space-y-1 group"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className={`font-bold ${item.textColor} flex items-center`}>
                      <span className={`w-2 h-2 rounded-full ${item.color} mr-1.5`} />
                      {item.label}
                    </span>
                    <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {item.count} jobs ({item.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 2: Complaints by Ward */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-900 uppercase flex items-center">
                <Layers className="w-4 h-4 text-blue-700 mr-1.5" />
                COMPLAINTS BY MUNICIPAL WARD
              </h3>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5">Jaipur zone administrative breakdown</p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-blue-50 text-blue-800 rounded border border-blue-200">
              3 Wards
            </span>
          </div>

          <div className="space-y-3">
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={140}>
                <BarChart data={summary?.charts.byWard ?? [
                  { wardId: 'WARD-12', wardName: 'Ward 12', fullTitle: 'Ward 12 - Pink City', count: 18 },
                  { wardId: 'WARD-18', wardName: 'Ward 18', fullTitle: 'Ward 18 - Vaishali', count: 17 },
                  { wardId: 'WARD-24', wardName: 'Ward 24', fullTitle: 'Ward 24 - Malviya', count: 15 },
                ]} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="wardName" stroke="#64748B" tick={{ fill: '#475569', fontSize: 10 }} />
                  <YAxis stroke="#64748B" tick={{ fill: '#475569', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Ward List Breakdown */}
            <div className="space-y-2 pt-2 border-t border-slate-100 font-mono text-xs">
              {(summary?.charts.byWard ?? [
                { wardId: 'WARD-12', wardName: 'Ward 12', fullTitle: 'Ward 12 - Pink City & Heritage Corridor', count: 18 },
                { wardId: 'WARD-18', wardName: 'Ward 18', fullTitle: 'Ward 18 - Vaishali & Chitrakoot Zone', count: 17 },
                { wardId: 'WARD-24', wardName: 'Ward 24', fullTitle: 'Ward 24 - Malviya Nagar & Apex Hub', count: 15 },
              ]).map((ward) => {
                const total = summary?.kpis.totalComplaints || 50;
                const pct = Math.round((ward.count / total) * 100);
                return (
                  <div
                    key={ward.wardId}
                    onClick={() => navigate(`/work-orders?wardId=${ward.wardId}`)}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-all space-y-1 group"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors truncate max-w-[200px]">
                        {ward.fullTitle}
                      </span>
                      <span className="font-bold text-blue-900 shrink-0 ml-2">
                        {ward.count} Reports ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chart 3: Work-Order Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-900 uppercase flex items-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 mr-1.5" />
                WORK ORDER OPERATION STATUS
              </h3>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5">Live lifecycle dispatch pipeline</p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
              Active Sync
            </span>
          </div>

          <div className="space-y-3">
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={140}>
                <PieChart>
                  <Pie
                    data={summary?.charts.byStatus ?? [
                      { name: 'Pending', count: 35 },
                      { name: 'Assigned', count: 4 },
                      { name: 'In Progress', count: 3 },
                      { name: 'Completed', count: 8 },
                    ]}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={55}
                    innerRadius={28}
                    paddingAngle={3}
                  >
                    {(summary?.charts.byStatus ?? []).map((entry, index) => {
                      const colors = ['#D97706', '#2563EB', '#EA580C', '#059669'];
                      return <Cell key={`pie-cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Status Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 font-mono text-xs">
              {[
                { status: 'PENDING', label: 'Pending Dispatch', count: summary?.kpis.pending ?? 35, color: 'bg-amber-500', textColor: 'text-amber-700' },
                { status: 'ASSIGNED', label: 'Crew Assigned', count: 4, color: 'bg-blue-600', textColor: 'text-blue-700' },
                { status: 'IN_PROGRESS', label: 'In Execution', count: 3, color: 'bg-orange-500', textColor: 'text-orange-700' },
                { status: 'COMPLETED', label: 'Completed Repairs', count: 8, color: 'bg-emerald-600', textColor: 'text-emerald-700' },
              ].map((st) => (
                <div
                  key={st.status}
                  onClick={() => navigate(`/work-orders?status=${st.status}`)}
                  className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-all space-y-0.5 group"
                >
                  <div className="flex items-center space-x-1 text-[10px] font-bold text-slate-600 truncate">
                    <span className={`w-2 h-2 rounded-full ${st.color} shrink-0`} />
                    <span>{st.label}</span>
                  </div>
                  <div className="text-base font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                    {st.count} <span className="text-[10px] text-slate-500 font-normal">units</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* EXPLAINABLE WORK ORDER DETAIL MODAL */}
      <WorkOrderDetailModal
        workOrderId={selectedWorkOrderId}
        onClose={() => setSelectedWorkOrderId(null)}
      />
    </div>
  );
};
