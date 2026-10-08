import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Play,
  CheckCircle2,
  MapPin,
  Clock,
  Navigation,
  Upload,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  Camera,
  FileText,
  Truck,
  Sparkles,
} from 'lucide-react';
import { fetchFieldTodayJobs, startWorkOrderApi, completeWorkOrderApi, uploadEvidenceApi } from '../services/api';
import { FieldJob, WorkOrder } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';

export default function FieldPage() {
  const [crewId, setCrewId] = useState<string>('CREW-01');
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
  const [completionNotes, setCompletionNotes] = useState('Damaged asphalt resurfaced, leveled, and sealed with asphalt emulsion.');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState('https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3');
  const [beforePhotoUrl, setBeforePhotoUrl] = useState('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3');
  const [evidenceType, setEvidenceType] = useState<'BEFORE' | 'AFTER'>('AFTER');
  const [evidenceUrlInput, setEvidenceUrlInput] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchFieldTodayJobs(crewId);
      setData({
        crewName: res.crew.name,
        totalJobs: res.totalJobs,
        completedJobs: res.completedJobs,
        remainingJobs: res.remainingJobs,
        nextJob: res.nextJob,
        jobs: res.jobs,
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load field jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [crewId]);

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
      alert(`Job ${job.workOrder.workOrderNumber} marked COMPLETED!`);
    } catch (err: any) {
      alert(err.message || 'Failed to complete job');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleAddEvidence = async () => {
    if (!selectedJob || !evidenceUrlInput) return;
    try {
      setIsUploadingPhoto(true);
      await uploadEvidenceApi(selectedJob.workOrder.id, evidenceType, evidenceUrlInput);
      setEvidenceUrlInput('');
      await loadData();
      alert(`Photo uploaded as ${evidenceType} evidence`);
    } catch (err: any) {
      alert(err.message || 'Failed to upload photo evidence');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600 font-medium">Loading field jobs...</span>
      </div>
    );
  }

  const nextJob = data?.nextJob;

  return (
    <div className="max-w-md mx-auto space-y-4 pb-12">
      {/* Field Crew Top Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-xs font-semibold text-blue-400 tracking-wider uppercase">FIELD WORKSPACE</div>
              <div className="font-bold text-lg leading-none">{data?.crewName || 'CREW 01'}</div>
            </div>
          </div>

          <div className="flex items-center space-x-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => setCrewId('CREW-01')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                crewId === 'CREW-01' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              CREW 01
            </button>
            <button
              onClick={() => setCrewId('CREW-02')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                crewId === 'CREW-02' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              CREW 02
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
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
        <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-5 rounded-2xl shadow-xl border border-blue-800/50 space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-blue-500 text-white uppercase tracking-wider">
              NEXT UP • STOP #{nextJob.sequence}
            </span>
            <PriorityBadge band={nextJob.workOrder.priorityBand} />
          </div>

          <div>
            <div className="text-xs text-blue-200 font-mono">{nextJob.workOrder.workOrderNumber}</div>
            <h2 className="text-xl font-bold text-white mt-0.5 leading-tight">
              {nextJob.workOrder.complaint?.description}
            </h2>
            <div className="flex items-center text-xs text-slate-300 mt-2 space-x-3">
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
                {nextJob.travelDistanceKm} km away
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center space-x-2">
            {nextJob.workOrder.status === 'SCHEDULED' || nextJob.workOrder.status === 'ASSIGNED' ? (
              <button
                onClick={() => handleStartJob(nextJob)}
                disabled={isStarting}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-transform active:scale-98"
              >
                <Play className="h-5 w-5 fill-current" />
                <span>START JOB</span>
              </button>
            ) : nextJob.workOrder.status === 'IN_PROGRESS' ? (
              <button
                onClick={() => setSelectedJob(nextJob)}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-transform active:scale-98"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>COMPLETE JOB & EVIDENCE</span>
              </button>
            ) : (
              <div className="w-full text-center text-xs text-emerald-400 font-bold bg-emerald-950/60 py-2.5 rounded-lg border border-emerald-800/50">
                ✓ JOB COMPLETED
              </div>
            )}

            <button
              onClick={() => setSelectedJob(nextJob)}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center border border-slate-700"
            >
              Details
            </button>
          </div>
        </div>
      )}

      {/* Today's Jobs List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase px-1">
          TODAY'S SCHEDULED ROUTE ({data?.jobs.length} JOBS)
        </h3>

        {data?.jobs.map((job) => {
          const isCompleted = job.workOrder.status === 'COMPLETED';
          const isInProgress = job.workOrder.status === 'IN_PROGRESS';

          return (
            <div
              key={job.planItemId}
              onClick={() => setSelectedJob(job)}
              className={`p-4 rounded-xl border transition-all cursor-pointer bg-white shadow-sm hover:shadow-md ${
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
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
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
                    <div className="font-semibold text-slate-900 line-clamp-1">
                      {job.workOrder.complaint?.description}
                    </div>
                  </div>
                </div>

                <PriorityBadge band={job.workOrder.priorityBand} />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1 text-slate-400" />
                  {job.scheduledStart} ({job.estimatedDuration}m)
                </span>

                <span
                  className={`font-semibold px-2 py-0.5 rounded ${
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

      {/* Field Job Detail & Evidence Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto p-5 space-y-4 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono text-slate-400">STOP #{selectedJob.sequence}</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedJob.workOrder.workOrderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>

            {/* Status & Urgency */}
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200">
              <div>
                <div className="text-xs text-slate-500 font-medium">PRIORITY SCORE</div>
                <div className="text-xl font-black text-slate-900">{selectedJob.workOrder.priorityScore} / 100</div>
              </div>
              <PriorityBadge band={selectedJob.workOrder.priorityBand} />
            </div>

            {/* Problem Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Problem Description</label>
              <div className="p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800">
                {selectedJob.workOrder.complaint?.description}
              </div>
            </div>

            {/* Location & Context */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location & Road</label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 text-slate-700">
                <div className="flex items-center font-semibold text-slate-900">
                  <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                  {selectedJob.workOrder.complaint?.ward?.name}
                </div>
                <div>Road Type: <span className="font-semibold">{selectedJob.workOrder.complaint?.roadType}</span></div>
                <div>Coordinates: {selectedJob.workOrder.complaint?.latitude.toFixed(4)}, {selectedJob.workOrder.complaint?.longitude.toFixed(4)}</div>
              </div>
            </div>

            {/* Execution / Start / Complete Button */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              {selectedJob.workOrder.status === 'SCHEDULED' || selectedJob.workOrder.status === 'ASSIGNED' ? (
                <button
                  onClick={() => handleStartJob(selectedJob)}
                  disabled={isStarting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 shadow-md"
                >
                  <Play className="h-5 w-5 fill-current" />
                  <span>START JOB</span>
                </button>
              ) : selectedJob.workOrder.status === 'IN_PROGRESS' ? (
                <div className="space-y-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center text-amber-800 font-bold text-sm">
                    <Sparkles className="h-4 w-4 mr-1.5 text-amber-600" />
                    JOB IN PROGRESS — REQUIRED FIELD EVIDENCE
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">Completion Notes</label>
                    <textarea
                      rows={2}
                      value={completionNotes}
                      onChange={(e) => setCompletionNotes(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      placeholder="Describe work completed..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">After Photo Evidence URL</label>
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
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 shadow-md"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    <span>{isCompleting ? 'Saving Completion...' : 'MARK REPAIR COMPLETE'}</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 space-y-2">
                  <div className="flex items-center font-bold text-sm">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-600" />
                    JOB COMPLETED
                  </div>
                  {selectedJob.workOrder.actualDuration && (
                    <div className="text-xs font-medium text-emerald-700">
                      Actual Duration: <span className="font-bold">{selectedJob.workOrder.actualDuration} min</span> (Est: {selectedJob.workOrder.estimatedDuration} min)
                    </div>
                  )}
                  {selectedJob.workOrder.completionNotes && (
                    <div className="text-xs text-slate-600 italic bg-white p-2 rounded border border-emerald-100">
                      "{selectedJob.workOrder.completionNotes}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Evidence Photos Gallery */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                  <Camera className="h-3.5 w-3.5 mr-1 text-slate-400" />
                  PHOTO EVIDENCE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-100">
                  <div className="text-[10px] font-bold bg-slate-800 text-white px-2 py-0.5">BEFORE</div>
                  <img
                    src={beforePhotoUrl}
                    alt="Before"
                    className="w-full h-24 object-cover"
                  />
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-100">
                  <div className="text-[10px] font-bold bg-emerald-700 text-white px-2 py-0.5">AFTER</div>
                  <img
                    src={afterPhotoUrl}
                    alt="After"
                    className="w-full h-24 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
