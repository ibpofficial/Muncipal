import React, { useEffect, useState } from 'react';
import { fetchCrews } from '../services/api';
import { Crew } from '../types';
import { Truck, MapPin, Users, Wrench, Clock, CheckCircle } from 'lucide-react';

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
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-mono font-bold text-slate-900 flex items-center">
          <Truck className="w-5 h-5 text-navy-800 mr-2" />
          MUNICIPAL FIELD CREWS
        </h1>
        <p className="text-xs text-slate-600">
          Active operational repair units and daily capacity allocation
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          <div className="h-64 bg-white border border-slate-200 rounded-xl" />
          <div className="h-64 bg-white border border-slate-200 rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {crews.map((crew) => (
            <div
              key={crew.id}
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-sm hover:shadow-md transition-all"
            >
              {/* Crew Card Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-lg font-mono font-bold text-slate-900">
                    {crew.name}
                  </h2>
                  <p className="text-xs text-blue-700 font-mono font-bold flex items-center mt-0.5">
                    <Wrench className="w-3.5 h-3.5 mr-1" />
                    {crew.specialization}
                  </p>
                </div>

                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 animate-pulse" />
                  {crew.availabilityStatus}
                </span>
              </div>

              {/* Specs & Capacity Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">CREW MEMBERS</span>
                  <div className="flex items-center space-x-1.5 text-slate-900 font-bold mt-1">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>{crew.members} Specialist Technicians</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">SHIFT WORKING HOURS</span>
                  <div className="flex items-center space-x-1.5 text-slate-900 font-bold mt-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>{crew.workingStart} - {crew.workingEnd}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">CURRENT DISPATCH HUB</span>
                  <div className="flex items-center space-x-1.5 text-slate-900 font-bold mt-1">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>Lat: {crew.currentLatitude} • Lng: {crew.currentLongitude}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">DAILY REPAIR CAPACITY</span>
                  <div className="text-lg text-navy-900 font-bold mt-1">
                    {crew.dailyCapacity} <span className="text-xs text-slate-500 font-normal">jobs / day</span>
                  </div>
                </div>
              </div>

              {/* Informational Note */}
              <p className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-100">
                Phase 2 Crew Assignment Engine matches job urgency, distance efficiency, and specialization.
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
