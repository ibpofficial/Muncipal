import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Play,
  CheckCircle2,
  MapPin,
  Clock,
  Navigation,
  AlertTriangle,
  Camera,
  Truck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchFieldTodayJobs, startWorkOrderApi, completeWorkOrderApi, uploadEvidenceApi } from '../../services/api';
import { FieldJob } from '../../types';
import { PriorityBadge } from '../../components/PriorityBadge';

export default function WorkerDashboard() {
  const { currentUser } = useAuth();
  const [data, setData] = useState<{
    crewName: string;
    totalJobs: number;
    completedJobs: number;
    remainingJobs: number;
    nextJob: FieldJob | null;
    jobs: FieldJob[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<FieldJob | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Completion form state
  const [completionNotes, setCompletionNotes] = useState('Damaged road resurfaced and sealed with asphalt emulsion.');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState('https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3');
  const [beforePhotoUrl, setBeforePhotoUrl] = useState('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchFieldTodayJobs();
      setData({
        crewName: res.crew?.name || 'Assigned Crew',
        totalJobs: res.totalJobs,
        completedJobs: res.completedJobs,
        remainingJobs: res.remainingJobs,
        nextJob: res.nextJob,
        jobs: res.jobs,
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load worker field jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartJob = async (job: FieldJob) => {
    try {
      setIsStarting(true);
      const updated = await startWorkOrderApi(job.workOrder.id);
      await loadData();
      if (selectedJob && selectedJob.workOrder.id === job.workOrder.id) {
        setSelectedJob({
          ...selectedJob,
          workOrder: updated,
        });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to start job');
    } finally {
      setIsStarting(false);
    }
  };

  const handleCompleteJob = async (job: FieldJob) => {
    try {
      setIsCompleting(true);
      const updated = await completeWorkOrderApi(
        job.workOrder.id,
        completionNotes,
        afterPhotoUrl
      );
      await loadData();
      setSelectedJob(null);
      alert(`Job #${job.workOrder.workOrderNumber} COMPLETED successfully!`);
    } catch (err: any) {
      alert(err.message || 'Failed to complete job');
    } finally {
      setIsCompleting(false);
    }
  };

  if (!currentUser?.crewId && !data?.crewName) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="inline-flex p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl">
          <Truck className="h-10 w-10" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-black uppercase text-slate-900 font-mono">AWAITING CREW ASSIGNMENT</h2>
          <p className="text-xs text-slate-600">
            Your worker account is active, but you have not been assigned to a repair crew yet. Please contact a municipal authority dispatcher.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600 text-xs font-mono">LOADING ASSIGNED FIELD JOBS...</span>
      </div>
    );
  }

  const nextJob = data?.nextJob;

  return (
    <div className="max-w-md mx-auto space-y-4 pb-16">
      {/* Field Crew Top Bar */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 rounded-xl">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold text-blue-400 tracking-wider uppercase">FIELD WORKSPACE</div>
              <div className="font-extrabold text-base leading-tight">{data?.crewName}</div>
              <div className="text-[10px] font-mono text-slate-400">Lead: {currentUser?.name}</div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">TODAY'S WORK PLAN</span>
          <span className="font-bold text-blue-400">
            {data?.completedJobs} / {data?.totalJobs} COMPLETED
          </span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full mt-1.5 overflow-hidden">
          <div
            className="bg-blue-500 h-2 transition-all duration-500"
            style={{
              width: `${data?.totalJobs ? Math.round((data.completedJobs / data.totalJobs) * 100) : 0}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Next Job Hero Banner */}
      {nextJob && (
        <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 text-white p-5 rounded-2xl shadow-xl border border-blue-800/50 space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-black bg-blue-600 text-white uppercase tracking-wider">
              NEXT JOB • STOP #{nextJob.sequence}
            </span>
            <PriorityBadge band={nextJob.workOrder.priorityBand} />
          </div>

          <div>
            <div className="text-xs text-blue-300 font-mono font-bold">{nextJob.workOrder.workOrderNumber}</div>
            <h2 className="text-lg font-bold text-white mt-1 leading-snug">
              {nextJob.workOrder.complaint?.description}
            </h2>
            <div className="flex flex-wrap items-center text-xs text-slate-300 mt-2 gap-3">
              <span className="flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1 text-blue-400" />
                {nextJob.workOrder.complaint?.ward?.name.split('-')[0]}
              </span>
              <span className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1 text-blue-400" />
                {nextJob.scheduledStart} ({nextJob.estimatedDuration} min)
              </span>
              <span className="flex items-center">
                <Navigation className="h-3.5 w-3.5 mr-1 text-blue-400" />
                {nextJob.travelDistanceKm} km
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center space-x-2">
            {nextJob.workOrder.status === 'SCHEDULED' || nextJob.workOrder.status === 'ASSIGNED' ? (
              <button
                onClick={() => handleStartJob(nextJob)}
                disabled={isStarting}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-transform active:scale-95 text-xs uppercase"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>START JOB</span>
              </button>
            ) : nextJob.workOrder.status === 'IN_PROGRESS' ? (
              <button
                onClick={() => setSelectedJob(nextJob)}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-transform active:scale-95 text-xs uppercase"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>COMPLETE JOB & EVIDENCE</span>
              </button>
            ) : (
              <div className="w-full text-center text-xs text-emerald-400 font-bold bg-emerald-950/60 py-2.5 rounded-lg border border-emerald-800/50">
                ✓ JOB COMPLETED
              </div>
            )}

            <button
              onClick={() => setSelectedJob(nextJob)}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs border border-slate-700"
            >
              Details
            </button>
          </div>
        </div>
      )}

      {/* Today's Jobs List */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-mono font-bold text-slate-500 tracking-wider uppercase px-1">
          TODAY'S SCHEDULED ROUTE ({data?.jobs.length} JOBS)
        </h3>

        {data?.jobs.map((job) => {
          const isCompleted = job.workOrder.status === 'COMPLETED';
          const isInProgress = job.workOrder.status === 'IN_PROGRESS';

          return (
            <div
              key={job.planItemId}
              onClick={() => setSelectedJob(job)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white shadow-sm hover:shadow-md ${
                isInProgress
                  ? 'border-amber-400 ring-2 ring-amber-400/20'
                  : isCompleted
                  ? 'border-emerald-200 bg-emerald-50/20 opacity-80'
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-black ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : isInProgress
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {job.sequence}
                  </div>
                  <div>
                    <div className="text-xs font-mono text-slate-500">{job.workOrder.workOrderNumber}</div>
                    <div className="font-bold text-slate-900 text-xs line-clamp-1">
                      {job.workOrder.complaint?.description}
                    </div>
                  </div>
                </div>

                <PriorityBadge band={job.workOrder.priorityBand} />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center font-mono text-[11px]">
                  <Clock className="h-3.5 w-3.5 mr-1 text-slate-400" />
                  {job.scheduledStart} ({job.estimatedDuration}m)
                </span>

                <span
                  className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded uppercase ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : isInProgress
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {job.workOrder.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal View for Execution & Evidence */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto p-5 space-y-4 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono text-slate-400">STOP #{selectedJob.sequence}</span>
                <h3 className="text-base font-bold text-slate-900">{selectedJob.workOrder.workOrderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200">
              <div>
                <div className="text-[10px] font-mono text-slate-500">PRIORITY SCORE</div>
                <div className="text-lg font-black text-slate-900">{selectedJob.workOrder.priorityScore} / 100</div>
              </div>
              <PriorityBadge band={selectedJob.workOrder.priorityBand} />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono font-bold text-slate-500 uppercase">Problem Description</label>
              <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800">
                {selectedJob.workOrder.complaint?.description}
              </div>
            </div>

            {selectedJob.workOrder.status === 'SCHEDULED' || selectedJob.workOrder.status === 'ASSIGNED' ? (
              <button
                onClick={() => handleStartJob(selectedJob)}
                disabled={isStarting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-xl flex items-center justify-center space-x-2 text-xs uppercase"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>START JOB</span>
              </button>
            ) : selectedJob.workOrder.status === 'IN_PROGRESS' ? (
              <div className="space-y-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center text-amber-800 font-bold text-xs font-mono">
                  <Sparkles className="h-4 w-4 mr-1.5 text-amber-600" />
                  JOB IN PROGRESS — SUBMIT EVIDENCE
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-semibold text-slate-700">Completion Notes</label>
                  <textarea
                    rows={2}
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="Describe repair work completed..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-semibold text-slate-700">After Photo Evidence URL</label>
                  <input
                    type="text"
                    value={afterPhotoUrl}
                    onChange={(e) => setAfterPhotoUrl(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => handleCompleteJob(selectedJob)}
                  disabled={isCompleting}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-3 rounded-xl flex items-center justify-center space-x-2 text-xs uppercase"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isCompleting ? 'SAVING...' : 'MARK REPAIR COMPLETE'}</span>
                </button>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 space-y-1 text-xs">
                <div className="flex items-center font-bold">
                  <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-600" />
                  REPAIR WORK COMPLETED
                </div>
                {selectedJob.workOrder.completionNotes && (
                  <p className="text-slate-600 italic">"{selectedJob.workOrder.completionNotes}"</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
