import React, { useEffect, useState } from 'react';
import { fetchWorkOrders } from '../services/api';
import { WorkOrder } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';
import { WorkOrderDetailModal } from '../components/WorkOrderDetailModal';
import { Search, Eye, ClipboardList } from 'lucide-react';

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
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-mono font-bold text-slate-900 flex items-center">
            <ClipboardList className="w-5 h-5 text-navy-800 mr-2" />
            MUNICIPAL WORK ORDERS QUEUE
          </h1>
          <p className="text-xs text-slate-600">
            Complete ranked queue of calculated road repair decisions
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search Work Order # or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <select
            value={selectedBand}
            onChange={(e) => setSelectedBand(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 font-medium"
          >
            <option value="ALL">All Priority Bands</option>
            <option value="CRITICAL">Critical Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 font-medium"
          >
            <option value="ALL">All Operations Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 font-medium"
          >
            <option value="ALL">All Wards</option>
            <option value="WARD-12">Ward 12 (North)</option>
            <option value="WARD-18">Ward 18 (East)</option>
            <option value="WARD-24">Ward 24 (South)</option>
          </select>
        </div>
      </div>

      {/* WORK ORDERS TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono text-slate-500 uppercase font-bold">
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
            <tbody className="divide-y divide-slate-200 text-xs font-sans text-slate-900">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-mono">
                    Loading municipal work orders...
                  </td>
                </tr>
              ) : workOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-mono">
                    No work orders found matching criteria.
                  </td>
                </tr>
              ) : (
                workOrders.map((wo) => (
                  <tr
                    key={wo.id}
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                    onClick={() => setInspectWoId(wo.workOrderNumber)}
                  >
                    <td className="p-3.5 font-mono font-bold text-slate-900 group-hover:text-blue-700">
                      {wo.workOrderNumber}
                    </td>

                    <td className="p-3.5 max-w-sm">
                      <p className="font-semibold text-slate-900 line-clamp-1">
                        {wo.complaint.description}
                      </p>
                      <span className="text-[11px] font-mono text-slate-500">
                        {wo.complaint.roadType} Road • Ticket #{wo.complaint.ticketNumber}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-slate-600 font-medium">
                      {wo.complaint.ward?.name.split('-')[0].trim()}
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-slate-100 border border-slate-300 text-slate-700 rounded font-semibold">
                        {wo.severity}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center space-x-2">
                        <PriorityBadge band={wo.priorityBand} size="sm" />
                        <span className="font-mono font-bold text-sm text-navy-900">
                          {wo.priorityScore}
                        </span>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-slate-700">
                      {wo.assignedCrew ? (
                        <span className="text-blue-700 font-bold">{wo.assignedCrew.name.split(' ')[0]}</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="p-3.5 font-mono">
                      <span className="px-2 py-0.5 text-[10px] uppercase rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-bold">
                        {wo.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-right font-mono">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectWoId(wo.workOrderNumber);
                        }}
                        className="px-3 py-1 bg-navy-900 hover:bg-navy-800 text-white rounded-md transition-colors text-[11px] font-bold flex items-center justify-end space-x-1 ml-auto shadow-sm"
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
