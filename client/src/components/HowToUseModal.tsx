import React, { useState } from 'react';
import { HelpCircle, Shield, Truck, FileText, CheckCircle2, MapPin, Flame, ArrowRight, X, Sparkles, ThumbsUp } from 'lucide-react';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToUseModal: React.FC<HowToUseModalProps> = ({ isOpen, onClose }) => {
  const [activeRoleTab, setActiveRoleTab] = useState<'CITIZEN' | 'OFFICER' | 'FIELD_CREW'>('OFFICER');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">HOW TO USE ROAD OPERATIONS PLATFORM</h2>
              <p className="text-xs text-slate-400">Guide & Operational Workflow for Users & Officers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role Tabs */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex space-x-2">
          {(['OFFICER', 'FIELD_CREW', 'CITIZEN'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveRoleTab(tab)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 ${
                activeRoleTab === tab
                  ? 'bg-blue-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {tab === 'OFFICER' && <Shield className="h-3.5 w-3.5" />}
              {tab === 'FIELD_CREW' && <Truck className="h-3.5 w-3.5" />}
              {tab === 'CITIZEN' && <FileText className="h-3.5 w-3.5" />}
              <span>{tab.replace('_', ' ')} GUIDE</span>
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto font-sans text-slate-800 text-sm">
          {activeRoleTab === 'OFFICER' && (
            <div className="space-y-4">
              <div className="cookie-card bg-blue-50/50 border border-blue-200 p-4 rounded-xl">
                <div className="title text-blue-900 font-bold text-base flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
                  MUNICIPAL COMMAND CENTER OPERATIONAL STEPS
                </div>
                <div className="description text-xs text-slate-600 mt-1">
                  Assists municipal officers to prioritize road complaints, generate optimized daily work plans, and monitor field repair execution.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 text-xs flex items-center">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] mr-2">1</span>
                    Review Priority Queue
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Check calculated priority scores (0–100) based on Severity (40%), Exposure (25%), Traffic (20%), Age (10%), and Crew Proximity (5%).
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 text-xs flex items-center">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] mr-2">2</span>
                    Generate Daily Work Plan
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Navigate to <b>/daily-plan</b> and click <i>Generate Today's Plan</i> to run greedy suitability matching for active crews.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 text-xs flex items-center">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] mr-2">3</span>
                    Review Field Evidence
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Inspect side-by-side Before/After photos uploaded by field crews and compare Estimated vs Actual repair duration.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 text-xs flex items-center">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] mr-2">4</span>
                    Monitor Recurring Hotspots
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Open <b>/hotspots</b> to inspect 150m spatial clusters identifying underlying structural road foundation failures.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeRoleTab === 'FIELD_CREW' && (
            <div className="space-y-4">
              <div className="cookie-card bg-amber-50/50 border border-amber-200 p-4 rounded-xl">
                <div className="title text-amber-900 font-bold text-base flex items-center">
                  <Truck className="h-4 w-4 mr-2 text-amber-600" />
                  FIELD CREW REPAIR WORKFLOW
                </div>
                <div className="description text-xs text-slate-600 mt-1">
                  Mobile-first execution interface designed for repair crews on site.
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Access Today's Route (/field)</div>
                    <p className="text-xs text-slate-600">Open mobile workspace to view scheduled stops, addresses, and estimated travel distances.</p>
                  </div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Press START JOB</div>
                    <p className="text-xs text-slate-600">When arriving at site, click START JOB. The system automatically records the actual start timestamp.</p>
                  </div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Upload Photo & Completion Notes</div>
                    <p className="text-xs text-slate-600">Capture or upload AFTER photo evidence stored securely on Firebase Cloud Storage and add repair notes.</p>
                  </div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">4</span>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Press MARK REPAIR COMPLETE</div>
                    <p className="text-xs text-slate-600">Saves the work order as COMPLETED, calculates actual repair duration, and advances to the next stop.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeRoleTab === 'CITIZEN' && (
            <div className="space-y-4">
              <div className="cookie-card bg-emerald-50/50 border border-emerald-200 p-4 rounded-xl">
                <div className="title text-emerald-900 font-bold text-base flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-2 text-emerald-600" />
                  CITIZEN REPORTING & SOCIAL FEED
                </div>
                <div className="description text-xs text-slate-600 mt-1">
                  Empowers citizens to report road hazards, view community posts, and upvote urgent issues.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 text-xs flex items-center">
                    <FileText className="h-4 w-4 mr-1 text-emerald-600" />
                    1. Submit Road Complaint (/report)
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Select location on map, pick road type, enter description, and submit. Instant priority score calculated immediately.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 text-xs flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-1 text-blue-600" />
                    2. Upvote Community Issues (/feed)
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Explore the public social feed. Upvote complaints reported by neighbors to boost priority urgency for city repair crews.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 flex items-center justify-between border-t border-slate-200 text-xs font-mono">
          <span className="text-slate-500">MUNICIPAL ROAD OPERATIONS ENGINE</span>
          <button
            onClick={onClose}
            className="accept hover:bg-slate-800"
          >
            <span>GOT IT, LET'S START</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
