import React, { useEffect, useState } from 'react';
import { fetchDashboardSummary, fetchWorkOrders, fetchMapWorkOrders } from '../services/api';
import { DashboardSummaryResponse, WorkOrder, MapWorkOrder, RoadAsset, Crew } from '../types';
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
  BarChart2,
  PieChart as PieChartIcon,
  RefreshCw,
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
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [mapWorkOrders, setMapWorkOrders] = useState<MapWorkOrder[]>([]);
  const [roadAssets, setRoadAssets] = useState<RoadAsset[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [sumData, woData, mapData] = await Promise.all([
        fetchDashboardSummary(),
        fetchWorkOrders(),
        fetchMapWorkOrders(),
      ]);
      setSummary(sumData);
      setWorkOrders(woData);
      setMapWorkOrders(mapData.workOrders);
      setRoadAssets(mapData.assets);
      setCrews(mapData.crews);
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
      {/* Page Title & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-mono font-bold text-[#F8FAFC]">MUNICIPAL COMMAND CENTER</h1>
          <p className="text-xs text-[#A8B0BE]">
            Real-time road repair prioritization queue & geographic intelligence
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          className="px-3 py-1.5 bg-[#11151D] hover:bg-[#181E29] text-[#A8B0BE] hover:text-[#F5B800] border border-[#262D38] rounded-md font-mono text-xs flex items-center space-x-2 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH QUEUE</span>
        </button>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="TOTAL COMPLAINTS"
          value={summary?.kpis.totalComplaints ?? 0}
          subtext="Seeded & reported issues"
          icon={Layers}
          color="#F8FAFC"
        />
        <KpiCard
          label="CRITICAL PRIORITY"
          value={summary?.kpis.critical ?? 0}
          subtext="Immediate repair needed"
          icon={AlertTriangle}
          color="#EF4444"
          accentBorder={true}
        />
        <KpiCard
          label="HIGH PRIORITY"
          value={summary?.kpis.high ?? 0}
          subtext="24-48h target window"
          icon={Flame}
          color="#F97316"
        />
        <KpiCard
          label="PENDING DISPATCH"
          value={summary?.kpis.pending ?? 0}
          subtext="Awaiting officer approval"
          icon={Clock}
          color="#EAB308"
        />
        <KpiCard
          label="ACTIVE CREWS"
          value={summary?.kpis.activeCrews ?? 0}
          subtext="Available repair units"
          icon={Truck}
          color="#22C55E"
        />
      </div>

      {/* MAIN DASHBOARD LAYOUT: MAP LEFT, QUEUE RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[620px]">
        {/* LEFT: MAP */}
        <div className="lg:col-span-8 h-full flex flex-col bg-[#11151D] border border-[#262D38] rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 bg-[#0D1117] border-b border-[#262D38] flex items-center justify-between text-xs font-mono">
            <span className="text-[#F8FAFC] font-bold uppercase tracking-wider flex items-center">
              <span className="w-2 h-2 rounded-full bg-[#F5B800] mr-2 animate-pulse" />
              GEOGRAPHIC COMMAND MAP
            </span>
            <div className="flex items-center space-x-3 text-[11px] text-[#A8B0BE]">
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1" /> Critical</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-orange-500 mr-1" /> High</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-yellow-500 mr-1" /> Medium</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1" /> Low</span>
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
        <div className="bg-[#11151D] border border-[#262D38] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#262D38] pb-2">
            <h3 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase flex items-center">
              <BarChart2 className="w-4 h-4 text-[#F5B800] mr-1.5" />
              COMPLAINTS BY PRIORITY BAND
            </h3>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.charts.byPriority ?? []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#6B7280" tick={{ fill: '#A8B0BE', fontSize: 11 }} />
                <YAxis stroke="#6B7280" tick={{ fill: '#A8B0BE', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#11151D', borderColor: '#262D38', borderRadius: '6px', color: '#F8FAFC' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {(summary?.charts.byPriority ?? []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Complaints by Ward */}
        <div className="bg-[#11151D] border border-[#262D38] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#262D38] pb-2">
            <h3 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase flex items-center">
              <Layers className="w-4 h-4 text-blue-400 mr-1.5" />
              COMPLAINTS BY MUNICIPAL WARD
            </h3>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.charts.byWard ?? []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="wardName" stroke="#6B7280" tick={{ fill: '#A8B0BE', fontSize: 11 }} />
                <YAxis stroke="#6B7280" tick={{ fill: '#A8B0BE', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#11151D', borderColor: '#262D38', borderRadius: '6px', color: '#F8FAFC' }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Work-Order Status */}
        <div className="bg-[#11151D] border border-[#262D38] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#262D38] pb-2">
            <h3 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase flex items-center">
              <PieChartIcon className="w-4 h-4 text-emerald-400 mr-1.5" />
              WORK ORDER OPERATION STATUS
            </h3>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary?.charts.byStatus ?? []}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  innerRadius={35}
                  paddingAngle={4}
                  label={({ name, count }) => `${name}: ${count}`}
                  labelLine={false}
                >
                  {(summary?.charts.byStatus ?? []).map((entry, index) => {
                    const colors = ['#EAB308', '#3B82F6', '#F97316', '#22C55E'];
                    return <Cell key={`pie-cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#11151D', borderColor: '#262D38', borderRadius: '6px', color: '#F8FAFC' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* EXPLAINABLE WORK ORDER DETAIL SLIDE-OVER MODAL */}
      <WorkOrderDetailModal
        workOrderId={selectedWorkOrderId}
        onClose={() => setSelectedWorkOrderId(null)}
      />
    </div>
  );
};
