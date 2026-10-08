import React, { useEffect, useState } from 'react';
import { WorkOrder } from '../types';
import { fetchWorkOrderById } from '../services/api';
import { PriorityBadge } from './PriorityBadge';
import {
  X,
  CheckCircle2,
  MapPin,
  Clock,
  ShieldAlert,
  Building,
  Navigation,
  Wrench,
  Sparkles,
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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workOrderId) {
      setDetail(null);
      return;
    }

    const loadDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWorkOrderById(workOrderId);
        setDetail(data);
      } catch (err: any) {
        console.error('Error fetching work order detail:', err);
        setError(err.message || 'Failed to load work order details');
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [workOrderId]);

  if (!workOrderId) return null;

  const factorsList = detail
    ? [
        { label: 'Severity', score: detail.factors.severity, weight: '40% weight', color: 'bg-red-500' },
        { label: 'Exposure', score: detail.factors.exposure, weight: '25% weight', color: 'bg-amber-500' },
        { label: 'Traffic', score: detail.factors.traffic, weight: '20% weight', color: 'bg-[#F5B800]' },
        { label: 'Age', score: detail.factors.age, weight: '10% weight', color: 'bg-blue-500' },
        { label: 'Crew Proximity', score: detail.factors.crewProximity, weight: '5% weight', color: 'bg-emerald-500' },
      ]
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end transition-opacity animate-fadeIn">
      <div className="w-full max-w-xl bg-[#0D1117] border-l border-[#262D38] h-full overflow-y-auto flex flex-col shadow-2xl">
        {/* Top Header Bar */}
        <div className="p-4 bg-[#11151D] border-b border-[#262D38] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono font-bold tracking-wider text-[#A8B0BE]">
              DECISION ENGINE INSPECTOR
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#F5B800]/10 text-[#F5B800] border border-[#F5B800]/30 rounded">
              Explainable AI-Free Logic
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[#262D38] text-[#A8B0BE] hover:text-[#F8FAFC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 space-y-6 animate-pulse">
            <div className="h-8 bg-[#262D38] rounded w-1/2" />
            <div className="h-24 bg-[#11151D] rounded border border-[#262D38]" />
            <div className="h-40 bg-[#11151D] rounded border border-[#262D38]" />
          </div>
        ) : error || !detail ? (
          <div className="p-8 text-center text-red-400 font-mono text-sm space-y-3">
            <ShieldAlert className="w-10 h-10 mx-auto" />
            <p>{error || 'Work order record not found'}</p>
          </div>
        ) : (
          <div className="p-6 space-y-6 flex-1 text-[#F8FAFC]">
            {/* Main Work Order Header Card */}
            <div className="bg-[#11151D] border border-[#262D38] rounded-lg p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold font-mono text-[#F8FAFC]">
                      {detail.workOrderNumber}
                    </h2>
                    <PriorityBadge band={detail.priorityBand} size="lg" />
                  </div>
                  <p className="text-xs text-[#A8B0BE] mt-1 flex items-center font-sans">
                    <MapPin className="w-3.5 h-3.5 text-[#F5B800] mr-1 shrink-0" />
                    <span>{detail.complaint.ward?.name}</span>
                  </p>
                </div>

                {/* Big Score Box */}
                <div className="text-right bg-[#0D1117] px-4 py-2 rounded-md border border-[#262D38]">
                  <span className="text-[10px] font-mono text-[#6B7280] block uppercase">PRIORITY SCORE</span>
                  <div className="text-3xl font-mono font-extrabold text-[#F5B800]">
                    {detail.priorityScore}
                    <span className="text-sm text-[#A8B0BE] font-normal"> / 100</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-[#0D1117] p-3 rounded border border-[#262D38]/60 text-xs text-[#A8B0BE] italic">
                "{detail.complaint.description}"
              </div>

              {/* Status & Road Type Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2 border-t border-[#262D38]">
                <div>
                  <span className="text-[#6B7280] block text-[10px]">ROAD TYPE</span>
                  <span className="text-[#F8FAFC] font-semibold">{detail.complaint.roadType} Road</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block text-[10px]">REPORTED STATUS</span>
                  <span className="text-emerald-400 font-semibold">{detail.status}</span>
                </div>
              </div>
            </div>

            {/* FACTOR BREAKDOWN */}
            <div className="bg-[#11151D] border border-[#262D38] rounded-lg p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#A8B0BE] flex items-center">
                <Sparkles className="w-4 h-4 text-[#F5B800] mr-2" />
                FACTOR BREAKDOWN SCORING
              </h3>

              <div className="space-y-3">
                {factorsList.map((factor) => (
                  <div key={factor.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center space-x-2">
                        <span className="text-[#F8FAFC] font-medium">{factor.label}</span>
                        <span className="text-[10px] text-[#6B7280]">({factor.weight})</span>
                      </div>
                      <span className="font-bold text-[#F5B800]">{factor.score} / 100</span>
                    </div>

                    <div className="w-full h-2 bg-[#0D1117] rounded-full overflow-hidden border border-[#262D38]">
                      <div
                        className={`h-full ${factor.color} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(100, Math.max(0, factor.score))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WHY THIS WAS PRIORITIZED */}
            <div className="bg-[#11151D] border border-[#262D38] rounded-lg p-5 space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F8FAFC] flex items-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2" />
                WHY THIS WAS PRIORITIZED
              </h3>

              <div className="space-y-2">
                {detail.reasons.map((reason, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-2.5 text-xs text-[#A8B0BE] bg-[#0D1117] p-2.5 rounded border border-[#262D38]/50"
                  >
                    <span className="text-emerald-400 font-bold font-mono">✓</span>
                    <span className="font-sans leading-snug">{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* LOCATION CONTEXT & NEARBY ASSETS */}
            {detail.nearbyAssets && detail.nearbyAssets.length > 0 && (
              <div className="bg-[#11151D] border border-[#262D38] rounded-lg p-5 space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#A8B0BE] flex items-center">
                  <Building className="w-4 h-4 text-blue-400 mr-2" />
                  LOCATION CONTEXT & NEARBY PUBLIC ASSETS
                </h3>

                <div className="space-y-2">
                  {detail.nearbyAssets.map(({ asset, distanceMeters }) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between text-xs font-mono bg-[#0D1117] p-2.5 rounded border border-[#262D38]"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="px-1.5 py-0.5 text-[9px] bg-blue-950 text-blue-400 rounded border border-blue-800">
                          {asset.type}
                        </span>
                        <span className="text-[#F8FAFC]">{asset.name}</span>
                      </div>
                      <span className="text-[#F5B800] font-bold">{distanceMeters}m away</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RECOMMENDED ACTION */}
            <div className="bg-amber-950/20 border border-[#F5B800]/50 rounded-lg p-4 space-y-2">
              <span className="text-[10px] font-mono text-[#F5B800] uppercase font-bold tracking-wider flex items-center">
                <Wrench className="w-3.5 h-3.5 mr-1" /> RECOMMENDED MUNICIPAL ACTION
              </span>
              <p className="text-sm font-mono font-bold text-[#F8FAFC] uppercase">
                "{detail.recommendation}"
              </p>
              <p className="text-[11px] text-[#A8B0BE] font-sans">
                Note: Decision support recommendation provided for municipal officer dispatch approval.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
