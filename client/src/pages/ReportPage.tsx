import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createComplaintApi } from '../services/api';
import { PriorityBadge } from '../components/PriorityBadge';
import {
  PlusCircle,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const DEMO_LOCATION_PRESETS = [
  { name: 'Ward 12 - Near St. Xavier School (School Zone)', lat: 12.9732, lng: 77.5942, wardId: 'WARD-12', roadType: 'Arterial' },
  { name: 'Ward 18 - Near Victoria Apex Hospital (Medical Corridor)', lat: 12.9862, lng: 77.6142, wardId: 'WARD-18', roadType: 'Arterial' },
  { name: 'Ward 24 - Ring Road Circle (Expressway Interchange)', lat: 12.9552, lng: 77.5802, wardId: 'WARD-24', roadType: 'Arterial' },
  { name: 'Ward 12 - Quiet Residential Street (Sector 4)', lat: 12.9690, lng: 77.5880, wardId: 'WARD-12', roadType: 'Residential' },
];

export const ReportPage: React.FC = () => {
  const navigate = useNavigate();

  const [description, setDescription] = useState<string>('Deep pothole near school entrance causing danger to two-wheelers.');
  const [roadType, setRoadType] = useState<string>('Arterial');
  const [wardId, setWardId] = useState<string>('WARD-12');
  const [latitude, setLatitude] = useState<number>(12.9732);
  const [longitude, setLongitude] = useState<number>(77.5942);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [resultDecision, setResultDecision] = useState<any | null>(null);

  const handleSelectPreset = (preset: typeof DEMO_LOCATION_PRESETS[0]) => {
    setLatitude(preset.lat);
    setLongitude(preset.lng);
    setWardId(preset.wardId);
    setRoadType(preset.roadType);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a detailed description of the road damage.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await createComplaintApi({
        description,
        latitude,
        longitude,
        roadType,
        wardId,
        photoUrl: photoUrl || undefined,
      });

      setResultDecision(response);
    } catch (err: any) {
      console.error('Error submitting complaint:', err);
      setError(err.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-mono font-bold text-slate-900 flex items-center">
          <PlusCircle className="w-5 h-5 text-navy-800 mr-2" />
          REPORT ROAD ISSUE
        </h1>
        <p className="text-xs text-slate-600">
          Submit road damage reports into the municipal priority decision pipeline
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 p-4 rounded-xl text-red-700 text-xs font-mono flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* FORM CONTAINER */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-6 rounded-xl space-y-6 shadow-sm">
        {/* Preset Locations Quick Selector */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-slate-700 uppercase flex items-center">
            <MapPin className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
            QUICK DEMO LOCATION PRESETS
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DEMO_LOCATION_PRESETS.map((preset, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-lg text-left border text-xs font-mono transition-all ${
                  latitude === preset.lat && longitude === preset.lng
                    ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-slate-900">{preset.name}</div>
                <div className="text-[10px] text-slate-500">
                  Lat: {preset.lat} • Lng: {preset.lng}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Complaint Description */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-slate-700 uppercase block">
            ISSUE DESCRIPTION (KEYWORD & HAZARD SIGNALS ANALYZED)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe road defect (e.g. Deep pothole near school entrance causing crash hazard)..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-sans"
          />
        </div>

        {/* Grid Fields: Road Type & Ward */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-slate-700 uppercase block">
              ROAD CLASSIFICATION TYPE
            </label>
            <select
              value={roadType}
              onChange={(e) => setRoadType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-2.5 text-xs font-mono focus:outline-none focus:border-blue-600 font-medium"
            >
              <option value="Arterial">Arterial Road (Score: 90)</option>
              <option value="Collector">Collector Road (Score: 70)</option>
              <option value="Local">Local Street (Score: 45)</option>
              <option value="Residential">Residential Lane (Score: 30)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-slate-700 uppercase block">
              MUNICIPAL WARD ZONE
            </label>
            <select
              value={wardId}
              onChange={(e) => setWardId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-2.5 text-xs font-mono focus:outline-none focus:border-blue-600 font-medium"
            >
              <option value="WARD-12">Ward 12 - Civic & Educational Hub</option>
              <option value="WARD-18">Ward 18 - Medical & Commercial Belt</option>
              <option value="WARD-24">Ward 24 - Metro Residential Sector</option>
            </select>
          </div>
        </div>

        {/* Latitude & Longitude Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-500 font-bold">LATITUDE COORDINATE</label>
            <input
              type="number"
              step="0.0001"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-500 font-bold">LONGITUDE COORDINATE</label>
            <input
              type="number"
              step="0.0001"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-navy-900 hover:bg-navy-800 text-white font-mono font-bold text-sm uppercase rounded-lg flex items-center justify-center space-x-2 transition-all shadow-md disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span>{submitting ? 'CALCULATING PRIORITY SCORE...' : 'SUBMIT COMPLAINT & RUN DECISION ENGINE'}</span>
          </button>
        </div>
      </form>

      {/* INSTANT DECISION FEEDBACK MODAL */}
      {resultDecision && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-navy-900 rounded-xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-mono font-bold text-slate-900">
                    COMPLAINT RECEIVED
                  </h2>
                  <p className="text-xs font-mono text-blue-700 font-bold">
                    {resultDecision.complaint.ticketNumber} • {resultDecision.decision.id}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">DETECTED SEVERITY</span>
                <span className="text-sm font-mono font-bold text-red-700">
                  {resultDecision.decision.severity}
                </span>
                <span className="text-[11px] text-slate-600 block mt-1">
                  Status: Awaiting municipal scheduling
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">PRIORITY SCORE</span>
                <div className="flex items-center space-x-2">
                  <PriorityBadge band={resultDecision.decision.priorityBand} size="md" />
                  <span className="text-2xl font-mono font-bold text-navy-900">
                    {resultDecision.decision.priorityScore} / 100
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-slate-700 uppercase block">
                EXPLAINABLE DECISION REASONS:
              </span>
              <div className="space-y-1.5 text-xs text-slate-700 font-sans">
                {resultDecision.decision.reasons.map((reason: string, idx: number) => (
                  <div key={idx} className="flex items-start space-x-2 bg-slate-50 p-2 rounded-md border border-slate-200">
                    <span className="text-emerald-600 font-bold font-mono">✓</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-mono font-bold text-xs rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-md"
              >
                <span>RETURN TO COMMAND CENTER QUEUE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
