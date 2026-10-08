import React from 'react';
import { WorkOrder } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { MapPin, Clock, ArrowUpRight, AlertTriangle } from 'lucide-react';

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
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 h-full flex flex-col space-y-3 shadow-sm">
        <div className="h-6 bg-slate-200 rounded animate-pulse w-1/3" />
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="h-20 bg-slate-100 rounded-lg border border-slate-200 animate-pulse p-3 space-y-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col h-full overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-navy-800" />
          <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-900">
            PRIORITY QUEUE
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-500 font-bold">
          {workOrders.length} WORK ORDERS
        </span>
      </div>

      {/* Queue Items List */}
      <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
        {workOrders.length === 0 ? (
          <div className="text-center py-10 text-slate-400 font-mono text-xs">
            No work orders matching filters
          </div>
        ) : (
          workOrders.map((wo) => {
            const isSelected = selectedWorkOrderId === wo.workOrderNumber;
            const daysAgo = Math.floor(
              (new Date().getTime() - new Date(wo.complaint.reportedAt).getTime()) /
                (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={wo.id}
                onClick={() => onSelectWorkOrder(wo.workOrderNumber)}
                className={`p-3 rounded-lg border transition-all duration-150 cursor-pointer group flex flex-col space-y-2 ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-600 shadow-md ring-1 ring-blue-500'
                    : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-slate-50 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {wo.workOrderNumber}
                    </span>
                    <PriorityBadge band={wo.priorityBand} size="sm" />
                  </div>

                  <div className="flex items-center space-x-1.5 font-mono">
                    <span className="text-[10px] text-slate-400 font-semibold">SCORE</span>
                    <span className="text-sm font-extrabold text-navy-900">
                      {wo.priorityScore}
                    </span>
                  </div>
                </div>

                {/* Complaint Summary Description */}
                <p className="text-xs text-slate-700 line-clamp-1 font-sans font-medium">
                  {wo.complaint.description}
                </p>

                {/* Metadata Row */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1.5 border-t border-slate-100">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-blue-600" />
                    <span className="truncate max-w-[120px]">
                      {wo.complaint.ward?.name.split('-')[0].trim()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</span>
                    </div>

                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-700 transition-colors" />
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
