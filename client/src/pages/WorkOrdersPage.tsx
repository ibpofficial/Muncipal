import React, { useEffect, useState } from 'react';
import { fetchWorkOrders } from '../services/api';
import { WorkOrder, PriorityBand } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';
import { WorkOrderDetailModal } from '../components/WorkOrderDetailModal';
import { Search, Filter, Eye, ArrowUpDown, ClipboardList } from 'lucide-react';

export const WorkOrdersPage: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBand, setSelectedBand] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [inspectWoId, setInspectWoId] = useState<string | null>(null);

  const loadWorkOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchWorkOrders({
        priorityBand: selectedBand,
        status: selectedStatus,
        wardId: selectedWard,
        search,
      });
      setWorkOrders(data);
    } catch (err) {
      console.error('Error loading work orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkOrders();
  }, [selectedBand, selectedStatus, selectedWard, search]);

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-mono font-bold text-[#F8FAFC] flex items-center">
            <ClipboardList className="w-5 h-5 text-[#F5B800] mr-2" />
            MUNICIPAL WORK ORDERS
          </h1>
          <p className="text-xs text-[#A8B0BE]">
            Complete ranked queue of calculated road repair decisions
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#11151D] border border-[#262D38] p-4 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search Work Order # or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0D1117] border border-[#262D38] rounded-md pl-9 pr-4 py-2 text-xs text-[#F8FAFC] placeholder-[#6B7280] focus:outline-none focus:border-[#F5B800]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          {/* Priority Band Filter */}
          <select
            value={selectedBand}
            onChange={(e) => setSelectedBand(e.target.value)}
            className="bg-[#0D1117] border border-[#262D38] text-[#F8FAFC] rounded-md px-3 py-2 focus:outline-none focus:border-[#F5B800]"
          >
            <option value="ALL">All Priority Bands</option>
            <option value="CRITICAL">Critical Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#0D1117] border border-[#262D38] text-[#F8FAFC] rounded-md px-3 py-2 focus:outline-none focus:border-[#F5B800]"
          >
            <option value="ALL">All Operations Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Ward Filter */}
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="bg-[#0D1117] border border-[#262D38] text-[#F8FAFC] rounded-md px-3 py-2 focus:outline-none focus:border-[#F5B800]"
          >
            <option value="ALL">All Wards</option>
            <option value="WARD-12">Ward 12 (North)</option>
            <option value="WARD-18">Ward 18 (East)</option>
            <option value="WARD-24">Ward 24 (South)</option>
          </select>
        </div>
      </div>

      {/* WORK ORDERS TABLE */}
      <div className="bg-[#11151D] border border-[#262D38] rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0D1117] border-b border-[#262D38] text-[11px] font-mono text-[#6B7280] uppercase">
                <th className="p-3.5">WORK ORDER</th>
                <th className="p-3.5">COMPLAINT & LOCATION</th>
                <th className="p-3.5">WARD</th>
                <th className="p-3.5">SEVERITY</th>
                <th className="p-3.5">PRIORITY SCORE</th>
                <th className="p-3.5">ASSIGNED CREW</th>
                <th className="p-3.5">STATUS</th>
                <th className="p-3.5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262D38]/50 text-xs font-sans text-[#F8FAFC]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#6B7280] font-mono">
                    Loading municipal work orders...
                  </td>
                </tr>
              ) : workOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#6B7280] font-mono">
                    No work orders found matching criteria.
                  </td>
                </tr>
              ) : (
                workOrders.map((wo) => (
                  <tr
                    key={wo.id}
                    className="hover:bg-[#181E29] transition-colors cursor-pointer group"
                    onClick={() => setInspectWoId(wo.workOrderNumber)}
                  >
                    <td className="p-3.5 font-mono font-bold text-[#F8FAFC] group-hover:text-[#F5B800]">
                      {wo.workOrderNumber}
                    </td>

                    <td className="p-3.5 max-w-sm">
                      <p className="font-semibold text-[#F8FAFC] line-clamp-1">
                        {wo.complaint.description}
                      </p>
                      <span className="text-[11px] font-mono text-[#6B7280]">
                        {wo.complaint.roadType} Road • Ticket #{wo.complaint.ticketNumber}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-[#A8B0BE]">
                      {wo.complaint.ward?.name.split('-')[0].trim()}
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#0D1117] border border-[#262D38] text-[#A8B0BE] rounded">
                        {wo.severity}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center space-x-2">
                        <PriorityBadge band={wo.priorityBand} size="sm" />
                        <span className="font-mono font-bold text-sm text-[#F5B800]">
                          {wo.priorityScore}
                        </span>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-[#A8B0BE]">
                      {wo.assignedCrew ? (
                        <span className="text-emerald-400">{wo.assignedCrew.name.split(' ')[0]}</span>
                      ) : (
                        <span className="text-[#6B7280] italic">Unassigned</span>
                      )}
                    </td>

                    <td className="p-3.5 font-mono">
                      <span className="px-2 py-0.5 text-[10px] uppercase rounded bg-[#0D1117] text-emerald-400 border border-[#262D38]">
                        {wo.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-right font-mono">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectWoId(wo.workOrderNumber);
                        }}
                        className="px-2.5 py-1 bg-[#0D1117] hover:bg-[#F5B800] text-[#A8B0BE] hover:text-[#090B10] border border-[#262D38] rounded transition-colors text-[11px] flex items-center justify-end space-x-1 ml-auto"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EXPLAINABLE WORK ORDER DETAIL MODAL */}
      <WorkOrderDetailModal
        workOrderId={inspectWoId}
        onClose={() => setInspectWoId(null)}
      />
    </div>
  );
};
