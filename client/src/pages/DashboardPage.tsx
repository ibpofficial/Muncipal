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

      {/* BOTTOM ANALYTICS & CHARTS SECTION - NK2552003 UIVERSE CARD SYSTEM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: COMPLAINTS BY PRIORITY BAND */}
        <div className="nk-card flex flex-col justify-between">
          <div>
            <div className="nk-header">
              <span className="nk-title flex items-center">
                <BarChart2 className="w-4 h-4 text-red-600 mr-1.5" />
                PRIORITY BAND
              </span>
              <button onClick={() => navigate('/analytics')} className="nk-full-stats-btn">
                Full Analytics »
              </button>
            </div>

            <div className="nk-range flex items-baseline">
              <span className="nk-range-value">{summary?.kpis.totalComplaints ?? 50}</span>
              <span className="nk-range-unit">Jobs</span>
            </div>
            <div className="nk-date-range font-mono text-[10px] text-slate-500">
              Jaipur Municipal Region • Prioritized Distribution
            </div>

            {/* Custom Bar Chart Container with Average Line & Top/Bottom Dots */}
            <div className="nk-chart-container">
              <div className="nk-avg-line" />
              <div className="nk-avg-label">AVG 12.5</div>

              <div className="nk-chart">
                {[
                  { band: 'CRITICAL', label: 'CRIT', count: summary?.kpis.critical ?? 3, class: 'nk-bar-critical', height: '65px' },
                  { band: 'HIGH', label: 'HIGH', count: summary?.kpis.high ?? 16, class: 'nk-bar-high', height: '85px' },
                  { band: 'MEDIUM', label: 'MED', count: summary?.kpis.medium ?? 23, class: 'nk-bar-medium', height: '90px' },
                  { band: 'LOW', label: 'LOW', count: summary?.kpis.low ?? 8, class: 'nk-bar-low', height: '40px' },
                ].map((item) => (
                  <div key={item.band} className="nk-bar-wrapper">
                    <div className="nk-bar-container">
                      <div
                        onClick={() => navigate(`/work-orders?priorityBand=${item.band}`)}
                        className={`nk-bar ${item.class}`}
                        style={{ height: item.height }}
                        title={`${item.label}: ${item.count} work orders`}
                      >
                        <div className="nk-dot nk-dot-top" />
                        <div className="nk-dot nk-dot-bottom" />
                      </div>
                    </div>
                    <span className="nk-day-label">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Readings Breakdown */}
          <div className="nk-readings">
            {[
              { label: 'Critical Priority (0-24h Window)', val: `${summary?.kpis.critical ?? 3} jobs` },
              { label: 'High Urgency (24-48h Window)', val: `${summary?.kpis.high ?? 16} jobs` },
              { label: 'Medium Patch Schedule', val: `${summary?.kpis.medium ?? 23} jobs` },
              { label: 'Low Routine Monitoring', val: `${summary?.kpis.low ?? 8} jobs` },
            ].map((r, i) => (
              <div key={i} className="nk-reading">
                <span className="nk-reading-time">{r.label}</span>
                <span className="nk-reading-value">{r.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: COMPLAINTS BY MUNICIPAL WARD */}
        <div className="nk-card flex flex-col justify-between">
          <div>
            <div className="nk-header">
              <span className="nk-title flex items-center">
                <Layers className="w-4 h-4 text-blue-700 mr-1.5" />
                MUNICIPAL WARD
              </span>
              <button onClick={() => navigate('/analytics')} className="nk-full-stats-btn">
                Ward Details »
              </button>
            </div>

            <div className="nk-range flex items-baseline">
              <span className="nk-range-value">3</span>
              <span className="nk-range-unit">Wards</span>
            </div>
            <div className="nk-date-range font-mono text-[10px] text-slate-500">
              Pink City • Vaishali • Malviya Nagar Sectors
            </div>

            {/* Custom Bar Chart Container */}
            <div className="nk-chart-container">
              <div className="nk-avg-line" />
              <div className="nk-avg-label">AVG 16.6</div>

              <div className="nk-chart">
                {[
                  { wardId: 'WARD-12', label: 'W-12', title: 'Pink City', count: 18, height: '90px' },
                  { wardId: 'WARD-18', label: 'W-18', title: 'Vaishali', count: 17, height: '82px' },
                  { wardId: 'WARD-24', label: 'W-24', title: 'Malviya', count: 15, height: '72px' },
                ].map((item) => (
                  <div key={item.wardId} className="nk-bar-wrapper">
                    <div className="nk-bar-container">
                      <div
                        onClick={() => navigate(`/work-orders?wardId=${item.wardId}`)}
                        className="nk-bar"
                        style={{ height: item.height }}
                        title={`${item.title}: ${item.count} complaints`}
                      >
                        <div className="nk-dot nk-dot-top" />
                        <div className="nk-dot nk-dot-bottom" />
                      </div>
                    </div>
                    <span className="nk-day-label">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Readings Breakdown */}
          <div className="nk-readings">
            {[
              { label: 'Ward 12 (Pink City Corridor)', val: '18 Reports (36%)' },
              { label: 'Ward 18 (Vaishali & Chitrakoot)', val: '17 Reports (34%)' },
              { label: 'Ward 24 (Malviya & Apex Hub)', val: '15 Reports (30%)' },
            ].map((r, i) => (
              <div key={i} className="nk-reading">
                <span className="nk-reading-time">{r.label}</span>
                <span className="nk-reading-value">{r.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: WORK ORDER OPERATION STATUS */}
        <div className="nk-card flex flex-col justify-between">
          <div>
            <div className="nk-header">
              <span className="nk-title flex items-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5" />
                OPERATION STATUS
              </span>
              <button onClick={() => navigate('/work-orders')} className="nk-full-stats-btn">
                Live Status »
              </button>
            </div>

            <div className="nk-range flex items-baseline">
              <span className="nk-range-value">8</span>
              <span className="nk-range-unit">Done</span>
            </div>
            <div className="nk-date-range font-mono text-[10px] text-slate-500">
              Live lifecycle dispatch pipeline • Jaipur Division
            </div>

            {/* Custom Bar Chart Container */}
            <div className="nk-chart-container">
              <div className="nk-avg-line" />
              <div className="nk-avg-label">SYNC 100%</div>

              <div className="nk-chart">
                {[
                  { status: 'PENDING', label: 'PEND', count: summary?.kpis.pending ?? 28, class: 'nk-bar-medium', height: '90px' },
                  { status: 'ASSIGNED', label: 'ASGN', count: 4, class: 'nk-bar', height: '35px' },
                  { status: 'IN_PROGRESS', label: 'PROG', count: 3, class: 'nk-bar-high', height: '30px' },
                  { status: 'COMPLETED', label: 'DONE', count: 8, class: 'nk-bar-low', height: '55px' },
                ].map((item) => (
                  <div key={item.status} className="nk-bar-wrapper">
                    <div className="nk-bar-container">
                      <div
                        onClick={() => navigate(`/work-orders?status=${item.status}`)}
                        className={`nk-bar ${item.class}`}
                        style={{ height: item.height }}
                        title={`${item.label}: ${item.count} work orders`}
                      >
                        <div className="nk-dot nk-dot-top" />
                        <div className="nk-dot nk-dot-bottom" />
                      </div>
                    </div>
                    <span className="nk-day-label">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Readings Breakdown */}
          <div className="nk-readings">
            {[
              { label: 'Pending Dispatch Queue', val: `${summary?.kpis.pending ?? 28} units` },
              { label: 'Assigned to Crew (01 & 02)', val: '4 units' },
              { label: 'In Field Execution', val: '3 units' },
              { label: 'Completed & Verified', val: '8 units (16%)' },
            ].map((r, i) => (
              <div key={i} className="nk-reading">
                <span className="nk-reading-time">{r.label}</span>
                <span className="nk-reading-value">{r.val}</span>
              </div>
            ))}
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
