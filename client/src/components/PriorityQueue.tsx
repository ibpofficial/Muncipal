import React, { useState } from 'react';
import { WorkOrder } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { MapPin, Clock, ArrowUpRight, AlertTriangle, Search, Filter, Layers } from 'lucide-react';

interface PriorityQueueProps {
  workOrders: WorkOrder[];
  selectedWorkOrderId?: string | null;
  onSelectWorkOrder: (workOrderId: string) => void;
  isLoading?: boolean;
}

export const PriorityQueue: React.FC<PriorityQueueProps> = ({
  workOrders,
  selectedWorkOrderId,
  onSelectWorkOrder,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeBandFilter, setActiveBandFilter] = useState<string>('ALL');

  const filteredOrders = workOrders.filter((wo) => {
    const matchesBand = activeBandFilter === 'ALL' || wo.priorityBand === activeBandFilter;
    const matchesSearch =
      !searchTerm.trim() ||
      wo.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.complaint.ward?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBand && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 h-full flex flex-col space-y-3 shadow-sm">
        <div className="h-6 bg-slate-200 rounded animate-pulse w-1/3" />
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="h-20 bg-slate-50 rounded-lg border border-slate-200 animate-pulse p-3 space-y-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col h-full overflow-hidden shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 pb-3 mb-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-900">
              PRIORITY WORK ORDER QUEUE
            </h2>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded">
            {filteredOrders.length} / {workOrders.length} JOBS
          </span>
        </div>

        {/* Search & Band Filter Pills */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search WO#, street, or ward..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center space-x-1 font-mono text-[10px] overflow-x-auto pb-1">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((band) => (
              <button
                key={band}
                onClick={() => setActiveBandFilter(band)}
                className={`px-2 py-0.5 rounded font-bold transition-all shrink-0 ${
                  activeBandFilter === band
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {band}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Queue Items List */}
      <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-mono text-xs space-y-1">
            <Layers className="w-8 h-8 mx-auto text-slate-300" />
            <p>No work orders match filter criteria</p>
          </div>
        ) : (
          filteredOrders.map((wo) => {
            const isSelected = selectedWorkOrderId === wo.workOrderNumber;
            const daysAgo = Math.floor(
              (new Date().getTime() - new Date(wo.complaint.reportedAt).getTime()) /
              (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={wo.id}
                onClick={() => onSelectWorkOrder(wo.workOrderNumber)}
                className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer group flex flex-col space-y-2 ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-600 shadow-md ring-1 ring-blue-500'
                    : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-slate-50/90 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {wo.workOrderNumber}
                    </span>
                    <PriorityBadge band={wo.priorityBand} size="sm" />
                  </div>

                  <div className="flex items-center space-x-1 font-mono">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">SCORE</span>
                    <span className="text-sm font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      {wo.priorityScore}
                    </span>
                  </div>
                </div>

                {/* Complaint Summary Description */}
                <p className="text-xs text-slate-700 line-clamp-2 font-sans leading-snug">
                  "{wo.complaint.description}"
                </p>

                {/* Metadata Row */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center space-x-1 font-semibold text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate max-w-[130px]">
                      {wo.complaint.ward?.name.split('-')[0].trim()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</span>
                    </div>

                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 transition-colors" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
