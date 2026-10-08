import React, { useEffect, useState } from 'react';
import { WorkOrder, Crew } from '../types';
import { fetchWorkOrderById, fetchCrews, assignWorkOrderManualApi, updateWorkOrderStatusApi } from '../services/api';
import { PriorityBadge } from './PriorityBadge';
import {
  X,
  CheckCircle2,
  MapPin,
  Clock,
  ShieldAlert,
  Building,
  Wrench,
  Sparkles,
  UserCheck,
  CheckCircle,
} from 'lucide-react';

interface WorkOrderDetailModalProps {
  workOrderId: string | null;
  onClose: () => void;
}

export const WorkOrderDetailModal: React.FC<WorkOrderDetailModalProps> = ({
  workOrderId,
  onClose,
}) => {
  const [detail, setDetail] = useState<WorkOrder | null>(null);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Manual Assignment Override state
  const [showAssignDialog, setShowAssignDialog] = useState<boolean>(false);
  const [selectedCrewId, setSelectedCrewId] = useState<string>('CREW-01');
  const [overrideReason, setOverrideReason] = useState<string>('Crew already working nearby');
  const [updating, setUpdating] = useState<boolean>(false);

  const loadDetail = async () => {
    if (!workOrderId) {
      setDetail(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [data, crewList] = await Promise.all([
        fetchWorkOrderById(workOrderId),
        fetchCrews(),
      ]);
      setDetail(data);
      setCrews(crewList);
    } catch (err: any) {
      console.error('Error fetching work order detail:', err);
      setError(err.message || 'Failed to load work order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [workOrderId]);

  const handleManualAssign = async () => {
    if (!detail) return;
    setUpdating(true);
    try {
      await assignWorkOrderManualApi(detail.id, selectedCrewId, overrideReason);
      setShowAssignDialog(false);
      await loadDetail();
    } catch (err) {
      console.error('Error assigning crew:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!detail) return;
    if (!window.confirm(`Mark ${detail.workOrderNumber} as COMPLETED?`)) return;

    setUpdating(true);
    try {
      await updateWorkOrderStatusApi(detail.id, 'COMPLETED');
      await loadDetail();
    } catch (err) {
      console.error('Error completing work order:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (!workOrderId) return null;

  const factorsList = detail
    ? [
        { label: 'Severity', score: detail.factors.severity, weight: '40% weight', color: 'bg-red-600' },
        { label: 'Exposure', score: detail.factors.exposure, weight: '25% weight', color: 'bg-amber-600' },
        { label: 'Traffic', score: detail.factors.traffic, weight: '20% weight', color: 'bg-blue-600' },
        { label: 'Age', score: detail.factors.age, weight: '10% weight', color: 'bg-blue-500' },
        { label: 'Crew Proximity', score: detail.factors.crewProximity, weight: '5% weight', color: 'bg-emerald-600' },
      ]
    : [];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex justify-end transition-opacity animate-fadeIn">
      <div className="w-full max-w-2xl bg-white border-l border-slate-200 h-full overflow-y-auto flex flex-col shadow-2xl">
        {/* Top Header Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono font-bold tracking-wider text-slate-900">
              DECISION & SCHEDULING INSPECTOR
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-blue-100 text-blue-800 border border-blue-300 rounded font-bold">
              Explainable Decision Model
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 space-y-6 animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/2" />
            <div className="h-24 bg-slate-100 rounded-lg border border-slate-200" />
            <div className="h-40 bg-slate-100 rounded-lg border border-slate-200" />
          </div>
        ) : error || !detail ? (
          <div className="p-8 text-center text-red-600 font-mono text-sm space-y-3">
            <ShieldAlert className="w-10 h-10 mx-auto" />
            <p>{error || 'Work order record not found'}</p>
          </div>
        ) : (
          <div className="p-6 space-y-6 flex-1 text-slate-900">
            {/* Header Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold font-mono text-slate-900">
                      {detail.workOrderNumber}
                    </h2>
                    <PriorityBadge band={detail.priorityBand} size="lg" />
                  </div>
                  <p className="text-xs text-slate-600 mt-1 flex items-center font-sans">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 mr-1 shrink-0" />
                    <span>{detail.complaint.ward?.name}</span>
                  </p>
                </div>

                {/* Score Box */}
                <div className="text-right bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">PRIORITY SCORE</span>
                  <div className="text-3xl font-mono font-extrabold text-navy-900">
                    {detail.priorityScore}
                    <span className="text-sm text-slate-500 font-normal"> / 100</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                <div className="flex items-center space-x-2 text-xs font-mono">
                  <span className="text-slate-500">Status:</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 border border-blue-300 rounded font-bold uppercase">
                    {detail.status}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowAssignDialog(true)}
                    className="px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white font-mono text-xs font-bold rounded-md flex items-center space-x-1 transition-colors shadow-sm"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Reassign Crew</span>
                  </button>

                  {detail.status !== 'COMPLETED' && (
                    <button
                      onClick={handleMarkComplete}
                      disabled={updating}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold rounded-md flex items-center space-x-1 transition-colors shadow-sm disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Mark Complete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 6-QUESTION STRUCTURED LAYOUT */}
            <div className="space-y-4">
              {/* 1. WHAT IS THE PROBLEM? */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5 shadow-sm">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                  1. WHAT IS THE PROBLEM?
                </span>
                <p className="text-xs text-slate-800 font-sans font-medium italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  "{detail.complaint.description}"
                </p>
                <div className="text-[11px] font-mono text-slate-500 pt-1">
                  Road Classification: <span className="font-bold text-slate-900">{detail.complaint.roadType} Road</span>
                </div>
              </div>

              {/* 2. HOW URGENT IS IT? */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-sm">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                  2. HOW URGENT IS IT?
                </span>
                <div className="flex items-center space-x-3 font-mono text-xs">
                  <PriorityBadge band={detail.priorityBand} size="md" />
                  <span className="font-bold text-navy-900 text-sm">
                    Priority Score: {detail.priorityScore} / 100
                  </span>
                </div>
              </div>

              {/* 3. WHY? */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center">
                  <Sparkles className="w-3.5 h-3.5 text-blue-700 mr-1.5" />
                  3. WHY THIS PRIORITY SCORE? (FACTOR BREAKDOWN)
                </span>

                <div className="space-y-2">
                  {factorsList.map((factor) => (
                    <div key={factor.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-800 font-medium">{factor.label} <span className="text-[10px] text-slate-400">({factor.weight})</span></span>
                        <span className="font-bold text-navy-900">{factor.score} / 100</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className={`h-full ${factor.color} rounded-full`}
                          style={{ width: `${Math.min(100, Math.max(0, factor.score))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  {detail.reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="text-emerald-600 font-bold font-mono">✓</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. WHO SHOULD HANDLE IT? */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-sm">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                  4. WHO SHOULD HANDLE IT?
                </span>
                <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-900">
                      {detail.assignedCrew ? detail.assignedCrew.name : 'CREW-01 (Rapid Asphalt Alpha)'}
                    </span>
                    <span className="text-[10px] font-mono text-blue-700 block mt-0.5">
                      Specialization: {detail.assignedCrew?.specialization || 'Asphalt & surface repair'}
                    </span>
                  </div>
                  <span className="px-2 py-1 bg-blue-600 text-white font-mono text-[10px] font-bold rounded">
                    RECOMMENDED CREW
                  </span>
                </div>
              </div>

              {/* 5. WHEN & WHERE? */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-sm font-mono text-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">5. WHEN?</span>
                  <span className="font-bold text-navy-900">Today's Shift</span>
                  <span className="text-[11px] text-slate-500 block">Est. Duration: {detail.estimatedDuration} mins</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-sm font-mono text-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">6. WHERE?</span>
                  <span className="font-bold text-slate-900 truncate block">{detail.complaint.ward?.name}</span>
                  <span className="text-[11px] text-slate-500 block">Lat: {detail.complaint.latitude} • Lng: {detail.complaint.longitude}</span>
                </div>
              </div>

              {/* NEARBY ASSETS */}
              {detail.nearbyAssets && detail.nearbyAssets.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-sm">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase flex items-center">
                    <Building className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                    NEARBY PUBLIC ASSETS
                  </span>
                  <div className="space-y-1.5">
                    {detail.nearbyAssets.map(({ asset, distanceMeters }) => (
                      <div
                        key={asset.id}
                        className="flex items-center justify-between text-xs font-mono bg-slate-50 p-2 rounded-lg border border-slate-200"
                      >
                        <span className="text-slate-900 font-medium">[{asset.type}] {asset.name}</span>
                        <span className="text-blue-700 font-bold">{distanceMeters}m away</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MANUAL ASSIGNMENT OVERRIDE MODAL */}
        {showAssignDialog && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <h3 className="text-sm font-mono font-bold text-slate-900 uppercase">
                MANUAL CREW REASSIGNMENT OVERRIDE
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-slate-600 uppercase block">
                  SELECT FIELD CREW
                </label>
                <select
                  value={selectedCrewId}
                  onChange={(e) => setSelectedCrewId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  {crews.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-slate-600 uppercase block">
                  REASON FOR OVERRIDING AUTOMATIC RECOMMENDATION
                </label>
                <select
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="Crew already working nearby">Crew already working nearby</option>
                  <option value="Crew specialization required">Crew specialization required</option>
                  <option value="Emergency priority override">Emergency priority override</option>
                  <option value="Operational decision">Operational decision</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setShowAssignDialog(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold rounded-lg transition-colors border border-slate-300"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleManualAssign}
                  disabled={updating}
                  className="flex-1 py-2 bg-navy-900 hover:bg-navy-800 text-white font-mono text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  SAVE OVERRIDE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
