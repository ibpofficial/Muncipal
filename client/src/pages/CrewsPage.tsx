import React, { useEffect, useState } from 'react';
import { fetchCrews } from '../services/api';
import { Crew } from '../types';
import { Truck, MapPin, CheckCircle, Users, Wrench, Calendar } from 'lucide-react';

export const CrewsPage: React.FC = () => {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadCrewsData = async () => {
      setLoading(true);
      try {
        const data = await fetchCrews();
        setCrews(data);
      } catch (err) {
        console.error('Error loading crews:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCrewsData();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-mono font-bold text-[#F8FAFC] flex items-center">
          <Truck className="w-5 h-5 text-[#F5B800] mr-2" />
          MUNICIPAL REPAIR CREWS
        </h1>
        <p className="text-xs text-[#A8B0BE]">
          Active operational repair units and daily capacity allocation
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          <div className="h-64 bg-[#11151D] border border-[#262D38] rounded-lg" />
          <div className="h-64 bg-[#11151D] border border-[#262D38] rounded-lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {crews.map((crew) => (
            <div
              key={crew.id}
              className="bg-[#11151D] border border-[#262D38] rounded-lg p-6 space-y-5 hover:border-[#3E4756] transition-all"
            >
              {/* Crew Card Header */}
              <div className="flex items-center justify-between border-b border-[#262D38] pb-4">
                <div>
                  <h2 className="text-lg font-mono font-bold text-[#F8FAFC]">
                    {crew.name}
                  </h2>
                  <p className="text-xs text-[#F5B800] font-mono flex items-center mt-0.5">
                    <Wrench className="w-3.5 h-3.5 mr-1" />
                    {crew.specialization}
                  </p>
                </div>

                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-700 rounded-full flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                  {crew.availability}
                </span>
              </div>

              {/* Specs & Capacity Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-[#0D1117] p-3 rounded border border-[#262D38]">
                  <span className="text-[#6B7280] block text-[10px]">CREW MEMBERS</span>
                  <div className="flex items-center space-x-1.5 text-[#F8FAFC] font-bold mt-1">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>{crew.members} Specialist Technicians</span>
                  </div>
                </div>

                <div className="bg-[#0D1117] p-3 rounded border border-[#262D38]">
                  <span className="text-[#6B7280] block text-[10px]">CURRENT LOCATION ZONE</span>
                  <div className="flex items-center space-x-1.5 text-[#F8FAFC] font-bold mt-1">
                    <MapPin className="w-4 h-4 text-[#F5B800]" />
                    <span>Lat: {crew.currentLatitude} • Lng: {crew.currentLongitude}</span>
                  </div>
                </div>

                <div className="bg-[#0D1117] p-3 rounded border border-[#262D38]">
                  <span className="text-[#6B7280] block text-[10px]">DAILY REPAIR CAPACITY</span>
                  <div className="text-lg text-[#F8FAFC] font-bold mt-1">
                    {crew.dailyCapacity} <span className="text-xs text-[#A8B0BE] font-normal">jobs / day</span>
                  </div>
                </div>

                <div className="bg-[#0D1117] p-3 rounded border border-[#262D38]">
                  <span className="text-[#6B7280] block text-[10px]">TODAY'S ASSIGNED JOBS</span>
                  <div className="text-lg text-[#F5B800] font-bold mt-1">
                    {crew.todayAssignedJobs} <span className="text-xs text-[#A8B0BE] font-normal">assigned</span>
                  </div>
                </div>
              </div>

              {/* Informational Note */}
              <p className="text-[11px] text-[#6B7280] italic pt-2 border-t border-[#262D38]/50">
                Phase 1 Crew Proximity score calculates distance from work order locations to crew duty zone coordinates.
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
