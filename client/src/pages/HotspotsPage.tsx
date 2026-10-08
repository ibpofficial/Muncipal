import React, { useState, useEffect } from 'react';
import {
  Flame,
  RotateCw,
  MapPin,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  Clock,
  Layers,
} from 'lucide-react';
import { fetchHotspots, recalculateHotspotsApi } from '../services/api';
import { RoadHotspot } from '../types';

export default function HotspotsPage() {
  const [hotspots, setHotspots] = useState<RoadHotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHotspots = async () => {
    try {
      setLoading(true);
      const data = await fetchHotspots();
      setHotspots(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load hotspots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotspots();
  }, []);

  const handleRecalculate = async () => {
    try {
      setIsRecalculating(true);
      const updated = await recalculateHotspotsApi();
      setHotspots(updated);
      alert('Geospatial hotspot detection re-executed across database!');
    } catch (err: any) {
      alert(err.message || 'Failed to recalculate hotspots');
    } finally {
      setIsRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-600"></div>
        <span className="ml-3 text-slate-600 font-medium">Clustering geographic road hotspots...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">RECURRING ROAD HOTSPOTS</h1>
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 flex items-center">
              <Flame className="h-3.5 w-3.5 mr-1" />
              DETERMINISTIC CLUSTERING
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Geographic areas with multiple complaint reports within a 150-metre radius
          </p>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={isRecalculating}
          className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center space-x-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
        >
          <RotateCw className={`h-4 w-4 ${isRecalculating ? 'animate-spin' : ''}`} />
          <span>{isRecalculating ? 'Clustering...' : 'RECALCULATE HOTSPOTS'}</span>
        </button>
      </div>

      {/* Concept Disclaimer Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-800 flex items-start space-x-3">
        <ShieldAlert className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-amber-300">EXPLAINABLE HOTSPOT RULE:</span> A hotspot is detected when 2 or more separate citizen complaints occur within a 150-metre geographic radius over recent months. No black-box machine learning is used. Recommendations alert officers to potential underlying road infrastructure failures.
        </div>
      </div>

      {/* Hotspots List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {hotspots.map((hotspot) => (
          <div
            key={hotspot.id}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                  <Flame className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-mono text-slate-400 font-bold">{hotspot.id}</span>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">{hotspot.name}</h3>
                  <div className="flex items-center text-xs text-slate-500 mt-1">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400" />
                    {hotspot.ward?.name} (Radius: {hotspot.radius}m)
                  </div>
                </div>
              </div>

              <div className="bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-sm">
                {hotspot.complaintCount} COMPLAINTS
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Average Severity</span>
                <div className="font-extrabold text-rose-600 text-sm mt-0.5">{hotspot.averageSeverity}</div>
              </div>

              <div>
                <span className="text-slate-500 font-medium">Highest Priority Score</span>
                <div className="font-extrabold text-slate-900 text-sm mt-0.5">{hotspot.highestPriority} / 100</div>
              </div>
            </div>

            {/* Municipal Recommendation */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
              <div className="font-bold text-amber-900 flex items-center">
                <AlertTriangle className="h-3.5 w-3.5 mr-1 text-amber-600" />
                SYSTEM RECOMMENDATION
              </div>
              <p className="text-amber-800 leading-relaxed">
                Investigate recurring road damage at this location. High complaint concentration indicates possible sub-surface pipe leak or base foundation instability.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
