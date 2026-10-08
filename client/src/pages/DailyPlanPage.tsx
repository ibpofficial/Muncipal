import React, { useEffect, useState } from 'react';
import { fetchDailyPlan, generateDailyPlanApi, fetchCrews } from '../services/api';
import { DailyPlanResponse, CrewPlan, ScheduledJobItem, UnscheduledItem, Crew } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';
import { CommandMap } from '../components/MapContainer';
import { WorkOrderDetailModal } from '../components/WorkOrderDetailModal';
import {
  CalendarCheck,
  RefreshCw,
  Truck,
  Clock,
  Navigation,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export const DailyPlanPage: React.FC = () => {
  const [planData, setPlanData] = useState<DailyPlanResponse['data'] | null>(null);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [selectedCrewRoute, setSelectedCrewRoute] = useState<ScheduledJobItem[]>([]);
  const [activeCrewId, setActiveCrewId] = useState<string | null>(null);
  const [inspectWoId, setInspectWoId] = useState<string | null>(null);
  const [showPlanWhyModal, setShowPlanWhyModal] = useState<boolean>(false);

  const loadPlanData = async () => {
    setLoading(true);
    try {
      const [res, crewData] = await Promise.all([fetchDailyPlan(), fetchCrews()]);
      setPlanData(res.data);
      setCrews(crewData);
      if (res.data.crewPlans.length > 0) {
        setSelectedCrewRoute(res.data.crewPlans[0].jobs);
        setActiveCrewId(res.data.crewPlans[0].crewId);
      }
    } catch (err) {
      console.error('Error loading daily plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      const res = await generateDailyPlanApi();
      setPlanData(res.data);
      if (res.data.crewPlans.length > 0) {
        setSelectedCrewRoute(res.data.crewPlans[0].jobs);
        setActiveCrewId(res.data.crewPlans[0].crewId);
      }
    } catch (err) {
      console.error('Error generating daily plan:', err);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    loadPlanData();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-mono font-bold text-slate-900 flex items-center">
              <CalendarCheck className="w-5 h-5 text-navy-800 mr-2" />
              TODAY'S FIELD PLAN
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-blue-100 text-blue-800 border border-blue-300 rounded font-bold uppercase">
              Phase 2 Scheduler
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Recommended crew assignment, sequence, and daily work plan for municipal road operations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker Control */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-700">
            <button className="p-1 hover:bg-white rounded transition-colors text-slate-500">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 flex items-center">
              <Calendar className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
              {planData?.date || '08 OCT 2026'}
            </span>
            <button className="p-1 hover:bg-white rounded transition-colors text-slate-500">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowPlanWhyModal(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>WHY THIS PLAN?</span>
          </button>

          <button
            onClick={handleGeneratePlan}
            disabled={generating}
            className="uiverse-slide-btn shadow-md disabled:opacity-50"
          >
            <span>{generating ? 'GENERATING PLAN...' : 'GENERATE PLAN'}</span>
          </button>
        </div>
      </div>

      {/* TOP SUMMARY METRICS BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">JOBS PLANNED</span>
          <div className="text-2xl font-extrabold font-mono text-navy-900">
            {planData?.summary.totalJobsPlanned ?? 0}
          </div>
          <p className="text-[11px] text-slate-500">Targeted for today's shift</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">ACTIVE CREWS</span>
          <div className="text-2xl font-extrabold font-mono text-blue-700">
            {planData?.summary.crewsUsed ?? 0}
          </div>
          <p className="text-[11px] text-slate-500">Deployment units</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">EST. TOTAL TRAVEL</span>
          <div className="text-2xl font-extrabold font-mono text-slate-900">
            {planData?.summary.totalTravelKm ?? 0} <span className="text-xs font-normal text-slate-500">km</span>
          </div>
          <p className="text-[11px] text-slate-500">Geographic route travel</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">EST. FIELD TIME</span>
          <div className="text-2xl font-extrabold font-mono text-slate-900">
            {planData?.summary.totalFieldTimeFormatted ?? '0h 0m'}
          </div>
          <p className="text-[11px] text-slate-500">Work + travel time</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">CAPACITY UTILIZATION</span>
          <div className="text-2xl font-extrabold font-mono text-emerald-700">
            {planData?.summary.capacityUtilizationPercent ?? 0}%
          </div>
          <p className="text-[11px] text-slate-500">Shift capacity used</p>
        </div>
      </div>

      {/* MAIN CONTENT GRID: CREW PLAN CARDS LEFT, ROUTE MAP RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: CREW PLAN CARDS & TIMELINES */}
        <div className="lg:col-span-7 space-y-6">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-64 bg-white rounded-xl border border-slate-200" />
              <div className="h-64 bg-white rounded-xl border border-slate-200" />
            </div>
          ) : (
            planData?.crewPlans.map((crewPlan) => {
              const isSelectedRoute = activeCrewId === crewPlan.crewId;

              return (
                <div
                  key={crewPlan.crewId}
                  className={`bg-white rounded-xl border transition-all duration-200 shadow-sm overflow-hidden ${
                    isSelectedRoute ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200'
                  }`}
                >
                  {/* Crew Card Header */}
                  <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h2 className="text-lg font-mono font-bold text-slate-900">
                          {crewPlan.crewName}
                        </h2>
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1" />
                          {crewPlan.availabilityStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-mono mt-0.5">
                        {crewPlan.specialization}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 text-xs font-mono">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block uppercase">CAPACITY</span>
                        <span className="font-bold text-blue-700">
                          {crewPlan.assignedCount} / {crewPlan.dailyCapacity} JOBS ({crewPlan.capacityUtilizationPercent}%)
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCrewRoute(crewPlan.jobs);
                          setActiveCrewId(crewPlan.crewId);
                        }}
                        className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                          isSelectedRoute
                            ? 'bg-navy-900 text-white shadow-sm'
                            : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
                        }`}
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>{isSelectedRoute ? 'Route Active' : 'View Route'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Scheduled Jobs Timeline List */}
                  <div className="p-5 space-y-3">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                      SCHEDULED WORK SEQUENCE ({crewPlan.jobs.length} STOPS)
                    </span>

                    {crewPlan.jobs.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 font-mono text-xs italic">
                        No jobs scheduled for this crew today.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {crewPlan.jobs.map((job, idx) => (
                          <React.Fragment key={job.workOrderId}>
                            <div
                              onClick={() => setInspectWoId(job.workOrderNumber)}
                              className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-lg transition-all cursor-pointer flex items-start justify-between gap-3 group"
                            >
                              <div className="flex items-start space-x-3">
                                {/* Sequence badge */}
                                <div className="w-7 h-7 rounded-lg bg-navy-900 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                                  {job.sequence}
                                </div>

                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-blue-700">
                                      {job.workOrderNumber}
                                    </span>
                                    <PriorityBadge band={job.priorityBand} size="sm" />
                                    <span className="text-[11px] font-mono text-slate-500">
                                      Score: {job.priorityScore}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-700 line-clamp-1 font-sans">
                                    {job.description}
                                  </p>
                                  <span className="text-[10px] font-mono text-slate-500 block">
                                    {job.wardName} • Travel: {job.travelDistanceKm} km ({job.travelTimeMin} mins)
                                  </span>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="font-mono text-xs font-bold text-navy-900 block">
                                  {job.scheduledStart} - {job.scheduledEnd}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  Est. {job.estimatedDuration} mins
                                </span>
                              </div>
                            </div>

                            {/* Insert lunch break indicator at 13:00 */}
                            {idx === 1 && crewPlan.jobs.length > 2 && (
                              <div className="px-4 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-mono flex items-center justify-between">
                                <span className="font-bold flex items-center">
                                  <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                                  13:00 - 13:30 LUNCH BREAK & CREW REST
                                </span>
                                <span className="text-[10px]">30 mins</span>
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT: ROUTE MAP & UNSCHEDULED QUEUE */}
        <div className="lg:col-span-5 space-y-6">
          {/* Interactive Route Map */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-[400px] flex flex-col">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-slate-900 uppercase flex items-center">
                <Navigation className="w-4 h-4 text-blue-700 mr-2" />
                DAILY ROUTE MAP ({activeCrewId || 'CREW-01'})
              </span>
              <span className="text-[10px] text-slate-500 italic">
                Demo route — estimated using geographic distance
              </span>
            </div>
            <div className="flex-1">
              <CommandMap
                workOrders={[]}
                routeJobs={selectedCrewRoute}
                selectedWorkOrderId={null}
              />
            </div>
          </div>

          {/* REMAINING UNSCHEDULED QUEUE SECTION */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                  REMAINING UNSCHEDULED QUEUE
                </h3>
              </div>
              <span className="px-2 py-0.5 text-xs font-mono font-bold bg-amber-100 text-amber-800 rounded">
                {planData?.remainingQueue.length ?? 0} UNSCHEDULED
              </span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {planData?.remainingQueue.length === 0 ? (
                <div className="p-4 text-center text-slate-400 font-mono text-xs">
                  All work orders successfully scheduled in today's field plan!
                </div>
              ) : (
                planData?.remainingQueue.map((item) => (
                  <div
                    key={item.workOrderId}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{item.workOrderNumber}</span>
                        <PriorityBadge band={item.priorityBand} size="sm" />
                      </div>
                      <span className="text-blue-700 font-bold">Score: {item.priorityScore}</span>
                    </div>
                    <p className="text-slate-700 font-sans line-clamp-1">{item.description}</p>
                    <span className="text-[10px] text-amber-800 font-bold block pt-1 border-t border-slate-200/60">
                      Reason: {item.reason}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PLAN LOGIC MODAL ("WHY THIS PLAN?") */}
      {showPlanWhyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-mono font-bold text-slate-900 flex items-center">
                <Sparkles className="w-5 h-5 text-blue-700 mr-2" />
                EXPLAINABLE PLAN GENERATION LOGIC
              </h2>
              <button
                onClick={() => setShowPlanWhyModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              {planData?.planReasons.map((reason, idx) => (
                <div key={idx} className="flex items-start space-x-2 bg-slate-50 p-3 rounded-lg border border-slate-200 font-sans">
                  <span className="text-emerald-600 font-bold font-mono">✓</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowPlanWhyModal(false)}
                className="w-full py-2 bg-navy-900 hover:bg-navy-800 text-white font-mono text-xs font-bold rounded-lg transition-colors"
              >
                CLOSE EXPLANATION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WORK ORDER DETAIL INSPECTOR */}
      <WorkOrderDetailModal
        workOrderId={inspectWoId}
        onClose={() => setInspectWoId(null)}
      />
    </div>
  );
};
