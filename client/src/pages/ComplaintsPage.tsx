import React, { useEffect, useState } from 'react';
import { fetchComplaints } from '../services/api';
import { Complaint } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';
import { WorkOrderDetailModal } from '../components/WorkOrderDetailModal';
import { FileText, Search, MapPin, Calendar, Eye } from 'lucide-react';

export const ComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [inspectWoId, setInspectWoId] = useState<string | null>(null);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const data = await fetchComplaints({
        wardId: selectedWard,
        status: selectedStatus,
        search,
      });
      setComplaints(data);
    } catch (err) {
      console.error('Error loading complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [selectedWard, selectedStatus, search]);

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-mono font-bold text-[#F8FAFC] flex items-center">
            <FileText className="w-5 h-5 text-[#F5B800] mr-2" />
            CITIZEN ROAD COMPLAINTS
          </h1>
          <p className="text-xs text-[#A8B0BE]">
            Raw complaint logs automatically converted into structured prioritized work orders
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#11151D] border border-[#262D38] p-4 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search Ticket # or issue description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0D1117] border border-[#262D38] rounded-md pl-9 pr-4 py-2 text-xs text-[#F8FAFC] placeholder-[#6B7280] focus:outline-none focus:border-[#F5B800]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
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

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#0D1117] border border-[#262D38] text-[#F8FAFC] rounded-md px-3 py-2 focus:outline-none focus:border-[#F5B800]"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* COMPLAINTS TABLE */}
      <div className="bg-[#11151D] border border-[#262D38] rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0D1117] border-b border-[#262D38] text-[11px] font-mono text-[#6B7280] uppercase">
                <th className="p-3.5">TICKET #</th>
                <th className="p-3.5">DESCRIPTION & ROAD TYPE</th>
                <th className="p-3.5">WARD</th>
                <th className="p-3.5">PRIORITY BAND</th>
                <th className="p-3.5">PRIORITY SCORE</th>
                <th className="p-3.5">REPORTED AT</th>
                <th className="p-3.5">STATUS</th>
                <th className="p-3.5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262D38]/50 text-xs font-sans text-[#F8FAFC]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#6B7280] font-mono">
                    Loading complaints...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#6B7280] font-mono">
                    No complaints found.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-[#181E29] transition-colors cursor-pointer group"
                    onClick={() => c.workOrder && setInspectWoId(c.workOrder.workOrderNumber)}
                  >
                    <td className="p-3.5 font-mono font-bold text-[#F8FAFC] group-hover:text-[#F5B800]">
                      {c.ticketNumber}
                    </td>

                    <td className="p-3.5 max-w-sm">
                      <p className="font-semibold text-[#F8FAFC] line-clamp-1">
                        {c.description}
                      </p>
                      <span className="text-[11px] font-mono text-[#6B7280]">
                        Road Type: {c.roadType}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-[#A8B0BE]">
                      {c.ward?.name.split('-')[0].trim()}
                    </td>

                    <td className="p-3.5">
                      {c.workOrder ? (
                        <PriorityBadge band={c.workOrder.priorityBand} size="sm" />
                      ) : (
                        <span className="text-[#6B7280] italic">Uncalculated</span>
                      )}
                    </td>

                    <td className="p-3.5 font-mono font-bold text-[#F5B800]">
                      {c.workOrder ? `${c.workOrder.priorityScore} / 100` : 'N/A'}
                    </td>

                    <td className="p-3.5 font-mono text-[#6B7280] text-[11px]">
                      {new Date(c.reportedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="p-3.5 font-mono">
                      <span className="px-2 py-0.5 text-[10px] uppercase rounded bg-[#0D1117] text-emerald-400 border border-[#262D38]">
                        {c.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-right font-mono">
                      {c.workOrder && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectWoId(c.workOrder!.workOrderNumber);
                          }}
                          className="px-2.5 py-1 bg-[#0D1117] hover:bg-[#F5B800] text-[#A8B0BE] hover:text-[#090B10] border border-[#262D38] rounded transition-colors text-[11px] flex items-center justify-end space-x-1 ml-auto"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Decision</span>
                        </button>
                      )}
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
