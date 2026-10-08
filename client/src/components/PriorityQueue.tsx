import React, { useState } from 'react';
import { WorkOrder } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { MapPin, Clock, ArrowUpRight, AlertTriangle, Search, Layers, Flame } from 'lucide-react';

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

  const criticalCount = workOrders.filter((w) => w.priorityBand === 'CRITICAL').length;
  const highCount = workOrders.filter((w) => w.priorityBand === 'HIGH').length;
  const mediumCount = workOrders.filter((w) => w.priorityBand === 'MEDIUM').length;
  const lowCount = workOrders.filter((w) => w.priorityBand === 'LOW').length;

  if (isLoading) {
    return (
      <div className="nk-card h-full flex flex-col space-y-3">
        <div className="h-6 bg-slate-200 rounded animate-pulse w-1/3" />
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-20 bg-slate-50 rounded-lg border border-slate-200 animate-pulse p-3 space-y-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="nk-card flex flex-col h-full overflow-hidden justify-between">
      {/* Header & Range Section */}
      <div>
        <div className="nk-header">
          <span className="nk-title flex items-center">
            <Flame className="w-4 h-4 text-amber-500 mr-1.5" />
            PRIORITY QUEUE
          </span>
          <button onClick={() => setActiveBandFilter('ALL')} className="nk-full-stats-btn">
            Filter All »
          </button>
        </div>

        <div className="nk-range flex items-baseline">
          <span className="nk-range-value">{filteredOrders.length}</span>
          <span className="nk-range-unit">Jobs</span>
        </div>
        <div className="nk-date-range font-mono text-[10px] text-slate-500">
          Jaipur Division • Multi-Factor Prioritization Queue
        </div>

        {/* Search & Band Pills */}
        <div className="space-y-2 mb-3">
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

        {/* Custom Bar Chart Header Summary */}
        <div className="nk-chart-container">
          <div className="nk-avg-line" />
          <div className="nk-avg-label">SCORE AVG 68.5</div>

          <div className="nk-chart">
            {[
              { band: 'CRITICAL', label: 'CRIT', count: criticalCount, class: 'nk-bar-critical', height: '60px' },
              { band: 'HIGH', label: 'HIGH', count: highCount, class: 'nk-bar-high', height: '85px' },
              { band: 'MEDIUM', label: 'MED', count: mediumCount, class: 'nk-bar-medium', height: '90px' },
              { band: 'LOW', label: 'LOW', count: lowCount, class: 'nk-bar-low', height: '40px' },
            ].map((item) => (
              <div key={item.band} className="nk-bar-wrapper">
                <div className="nk-bar-container">
                  <div
                    onClick={() => setActiveBandFilter(item.band)}
                    className={`nk-bar ${item.class}`}
                    style={{ height: item.height }}
                    title={`${item.label}: ${item.count} work orders`}
                  >
                    <div className="nk-dot nk-dot-top" />
                    <div className="nk-dot nk-dot-bottom" />
                  </div>
                </div>
                <span className="nk-day-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Queue Items List (NK Readings System) */}
      <div className="nk-readings flex-1 overflow-y-auto pr-1">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-10 text-slate-500 font-mono text-xs space-y-1">
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
                className={`nk-reading cursor-pointer group transition-all p-2 rounded-lg ${
                  isSelected
                    ? 'bg-blue-50 border border-blue-500 shadow-sm'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="space-y-0.5 max-w-[210px]">
                  <div className="flex items-center space-x-1.5 font-mono">
                    <span className="font-bold text-xs text-slate-900 group-hover:text-blue-700 transition-colors">
                      {wo.workOrderNumber}
                    </span>
                    <PriorityBadge band={wo.priorityBand} size="sm" />
                  </div>
                  <div className="nk-reading-time line-clamp-1 italic text-[11px]">
                    "{wo.complaint.description}"
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 text-blue-600 mr-0.5" />
                      {wo.complaint.ward?.name.split('-')[0].trim()}
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 text-slate-400 mr-0.5" />
                      {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 font-mono">
                  <span className="nk-reading-value text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded text-xs font-bold">
                    {wo.priorityScore}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-700 transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
