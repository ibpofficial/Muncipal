import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Truck,
  Building2,
  Lightbulb,
  MapPin,
  ArrowUpRight,
} from 'lucide-react';
import {
  fetchOperationalAnalytics,
  fetchCrewAnalytics,
  fetchWardAnalytics,
  fetchHotspots,
} from '../services/api';
import {
  OperationalAnalyticsData,
  CrewAnalyticsItem,
  WardAnalyticsItem,
  RoadHotspot,
} from '../types';
import { KpiCard } from '../components/KpiCard';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'OPERATIONS' | 'CREWS' | 'WARDS' | 'HOTSPOTS'>('OPERATIONS');
  
  const [opsData, setOpsData] = useState<OperationalAnalyticsData | null>(null);
  const [crewsData, setCrewsData] = useState<CrewAnalyticsItem[]>([]);
  const [wardsData, setWardsData] = useState<WardAnalyticsItem[]>([]);
  const [hotspotsData, setHotspotsData] = useState<RoadHotspot[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const [ops, crews, wards, hotspots] = await Promise.all([
          fetchOperationalAnalytics(),
          fetchCrewAnalytics(),
          fetchWardAnalytics(),
          fetchHotspots(),
        ]);
        setOpsData(ops);
        setCrewsData(crews);
        setWardsData(wards);
        setHotspotsData(hotspots);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600 font-medium">Generating municipal operational analytics...</span>
      </div>
    );
  }

  const summary = opsData?.summary;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">OPERATIONAL ANALYTICS</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              REAL DB METRICS
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Performance metrics, repair duration variance, crew utilization, and ward hotspots
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          {(['OPERATIONS', 'CREWS', 'WARDS', 'HOTSPOTS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-white text-blue-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="COMPLETED JOBS"
          value={summary?.completedJobs ?? 0}
          subtext={`Out of ${summary?.totalWorkOrders ?? 0} total work orders`}
          icon={CheckCircle2}
          color="#059669"
        />
        <KpiCard
          label="AVG REPAIR TIME"
          value={`${summary?.avgActualDuration ?? 0} min`}
          subtext={`Estimated: ${summary?.avgEstimatedDuration ?? 0} min`}
          icon={Clock}
          color="#D97706"
        />
        <KpiCard
          label="AVG TRAVEL DISTANCE"
          value={`${summary?.avgTravelDistanceKm ?? 0} km`}
          subtext={`Total: ${summary?.totalTravelDistanceKm ?? 0} km across routes`}
          icon={Truck}
          color="#2563EB"
        />
        <KpiCard
          label="RECURRING HOTSPOTS"
          value={summary?.hotspotCount ?? 0}
          subtext="Clustered road-problem areas"
          icon={Flame}
          color="#E11D48"
        />
      </div>

      {/* TAB CONTENT 1: OPERATIONS */}
      {activeTab === 'OPERATIONS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Estimated vs Actual Duration Card */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  REPAIR DURATION ACCURACY (ESTIMATED VS ACTUAL)
                </h3>
                <p className="text-xs text-slate-500">Comparison of planned work duration against field duration</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div>
                <div className="text-xs font-semibold text-slate-500">AVERAGE ESTIMATED</div>
                <div className="text-2xl font-black text-slate-800">{summary?.avgEstimatedDuration} min</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">AVERAGE ACTUAL</div>
                <div className="text-2xl font-black text-blue-600">{summary?.avgActualDuration} min</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">DIFFERENCE</div>
                <div className={`text-2xl font-black ${(summary?.durationDifference ?? 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {(summary?.durationDifference ?? 0) > 0 ? `+${summary?.durationDifference}` : summary?.durationDifference} min
                </div>
              </div>
            </div>

            {/* Visual Bar Comparison */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Planned Estimate</span>
                  <span>{summary?.avgEstimatedDuration} minutes</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-3"
                    style={{ width: `${Math.min(100, ((summary?.avgEstimatedDuration || 90) / 150) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Actual Field Time</span>
                  <span>{summary?.avgActualDuration} minutes</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-3"
                    style={{ width: `${Math.min(100, ((summary?.avgActualDuration || 108) / 150) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Insights Box */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 text-amber-400">
              <Lightbulb className="h-5 w-5" />
              <h3 className="text-base font-bold tracking-wide uppercase">DYNAMIC OPERATIONAL INSIGHTS</h3>
            </div>

            <p className="text-xs text-slate-400">
              System-generated insights derived directly from database execution metrics:
            </p>

            <div className="space-y-3">
              {opsData?.insights.map((insight, idx) => (
                <div key={idx} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs text-slate-200 leading-relaxed flex items-start space-x-2">
                  <span className="text-blue-400 font-bold mt-0.5">•</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: CREWS */}
      {activeTab === 'CREWS' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <Truck className="h-4 w-4 mr-2 text-blue-600" />
              CREW PERFORMANCE & CAPACITY UTILIZATION
            </h3>
            <span className="text-xs text-slate-500 font-medium">Real-time workload balancing stats</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/80 text-xs uppercase font-bold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Crew Name</th>
                  <th className="py-3 px-4">Specialization</th>
                  <th className="py-3 px-4">Assigned / Capacity</th>
                  <th className="py-3 px-4">Completed</th>
                  <th className="py-3 px-4">Completion Rate</th>
                  <th className="py-3 px-4">Avg Repair Time</th>
                  <th className="py-3 px-4">Avg Travel</th>
                  <th className="py-3 px-4">Capacity Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {crewsData.map((crew) => (
                  <tr key={crew.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{crew.name}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">{crew.specialization}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {crew.jobsAssigned} / {crew.dailyCapacity} jobs
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">{crew.jobsCompleted}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{crew.completionRate}%</td>
                    <td className="py-3.5 px-4 text-slate-700">{crew.avgRepairDuration} min</td>
                    <td className="py-3.5 px-4 text-slate-700">{crew.avgTravelKm} km</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-2 ${crew.capacityUtilization >= 100 ? 'bg-rose-500' : 'bg-blue-600'}`}
                            style={{ width: `${crew.capacityUtilization}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-slate-700">{crew.capacityUtilization}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: WARDS */}
      {activeTab === 'WARDS' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <Building2 className="h-4 w-4 mr-2 text-blue-600" />
              WARD ROAD DAMAGE & PRIORITY METRICS
            </h3>
            <span className="text-xs text-slate-500 font-medium">Comparison across municipal administrative wards</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/80 text-xs uppercase font-bold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ward Name</th>
                  <th className="py-3 px-4">Zone</th>
                  <th className="py-3 px-4">Population</th>
                  <th className="py-3 px-4">Total Complaints</th>
                  <th className="py-3 px-4">Critical / High</th>
                  <th className="py-3 px-4">Completed / Pending</th>
                  <th className="py-3 px-4">Avg Priority</th>
                  <th className="py-3 px-4">Hotspots</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {wardsData.map((ward) => (
                  <tr key={ward.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{ward.name}</td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">{ward.zone}</td>
                    <td className="py-3.5 px-4 text-slate-700">{ward.population.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-black text-blue-900">{ward.totalComplaints}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-rose-600 font-bold">{ward.criticalCount} Critical</span> /{' '}
                      <span className="text-amber-600 font-bold">{ward.highCount} High</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-emerald-600 font-bold">{ward.completed} Done</span> /{' '}
                      <span className="text-slate-600">{ward.pending} Pending</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{ward.avgPriority} / 100</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                        {ward.hotspotCount} Hotspots
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: HOTSPOTS SUMMARY */}
      {activeTab === 'HOTSPOTS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hotspotsData.map((hotspot) => (
              <div key={hotspot.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
                      <Flame className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{hotspot.name}</h4>
                      <p className="text-xs text-slate-500">
                        Radius: {hotspot.radius}m • Ward: {hotspot.ward?.name}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-500 text-white">
                    {hotspot.complaintCount} COMPLAINTS
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-500 font-medium">Average Severity:</span>
                    <div className="font-bold text-rose-600">{hotspot.averageSeverity}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Highest Priority:</span>
                    <div className="font-bold text-slate-900">{hotspot.highestPriority} / 100</div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                  <span className="font-bold">MUNICIPAL RECOMMENDATION:</span> Investigate structural road foundation damage at this recurring location.
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
