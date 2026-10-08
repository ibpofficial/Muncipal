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
      <div className="bg-[#11151D] border border-[#262D38] rounded-lg p-4 h-full flex flex-col space-y-3">
        <div className="h-6 bg-[#262D38] rounded animate-pulse w-1/3" />
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="h-20 bg-[#0D1117] rounded border border-[#262D38] animate-pulse p-3 space-y-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-[#11151D] border border-[#262D38] rounded-lg p-4 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#262D38] pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-[#F5B800]" />
          <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-[#F8FAFC]">
            PRIORITY QUEUE
          </h2>
        </div>
        <span className="text-[11px] font-mono text-[#6B7280]">
          {workOrders.length} WORK ORDERS
        </span>
      </div>

      {/* Queue Items List */}
      <div className="space-y-2 overflow-y-auto pr-1 flex-1">
        {workOrders.length === 0 ? (
          <div className="text-center py-10 text-[#6B7280] font-mono text-xs">
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
                className={`p-3 rounded-md border transition-all duration-150 cursor-pointer group flex flex-col space-y-2 ${isSelected
                    ? 'bg-[#181E29] border-[#F5B800] shadow-[0_0_12px_rgba(245,184,0,0.12)]'
                    : 'bg-[#0D1117] border-[#262D38] hover:border-[#3E4756] hover:bg-[#11151D]'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-[#F8FAFC] group-hover:text-[#F5B800] transition-colors">
                      {wo.workOrderNumber}
                    </span>
                    <PriorityBadge band={wo.priorityBand} size="sm" />
                  </div>

                  <div className="flex items-center space-x-1.5 font-mono">
                    <span className="text-[10px] text-[#6B7280]">SCORE</span>
                    <span className="text-sm font-bold text-[#F5B800]">
                      {wo.priorityScore}
                    </span>
                  </div>
                </div>

                {/* Complaint Summary Description */}
                <p className="text-xs text-[#A8B0BE] line-clamp-1 font-sans">
                  {wo.complaint.description}
                </p>

                {/* Metadata Row */}
                <div className="flex items-center justify-between text-[11px] font-mono text-[#6B7280] pt-1 border-t border-[#262D38]/50">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-[#F5B800]" />
                    <span className="truncate max-w-[120px]">
                      {wo.complaint.ward?.name.split('-')[0].trim()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-[#A8B0BE]" />
                      <span>{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</span>
                    </div>

                    <ArrowUpRight className="w-3.5 h-3.5 text-[#6B7280] group-hover:text-[#F5B800] transition-colors" />
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
