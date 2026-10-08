import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  PlusCircle,
  Truck,
  Building2,
  MapPin,
  HelpCircle,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    {
      path: '/dashboard',
      label: 'Command Center',
      icon: LayoutDashboard,
      badge: 'LIVE',
    },
    {
      path: '/work-orders',
      label: 'Work Orders Queue',
      icon: ClipboardList,
    },
    {
      path: '/complaints',
      label: 'Citizen Complaints',
      icon: FileText,
    },
    {
      path: '/report',
      label: 'Report Road Issue',
      icon: PlusCircle,
      accent: true,
    },
    {
      path: '/crews',
      label: 'Repair Crews',
      icon: Truck,
    },
  ];

  return (
    <aside className="w-64 bg-[#0D1117] border-r border-[#262D38] flex flex-col justify-between shrink-0 min-h-[calc(100vh-61px)]">
      <div className="p-4 space-y-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#6B7280] uppercase px-3">
            OPERATIONS NAVIGATION
          </span>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[#11151D] text-[#F5B800] border-l-2 border-[#F5B800] shadow-sm'
                        : item.accent
                        ? 'text-[#F5B800] hover:bg-[#11151D]/60 hover:text-[#F5B800]'
                        : 'text-[#A8B0BE] hover:bg-[#11151D] hover:text-[#F8FAFC]'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-mono bg-[#F5B800]/20 text-[#F5B800] border border-[#F5B800]/40 rounded font-bold">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Demographics / Ward Quick Reference */}
        <div className="p-3 bg-[#11151D] rounded-md border border-[#262D38] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-[#A8B0BE] uppercase flex items-center">
              <Building2 className="w-3 h-3 mr-1 text-[#F5B800]" /> Active Wards
            </span>
            <span className="text-[10px] font-mono text-[#6B7280]">3 Zones</span>
          </div>
          <div className="space-y-1 text-[11px] font-mono text-[#A8B0BE]">
            <div className="flex justify-between border-b border-[#262D38]/50 pb-1">
              <span>Ward 12 (North)</span>
              <span className="text-emerald-400">18 Incidents</span>
            </div>
            <div className="flex justify-between border-b border-[#262D38]/50 pb-1">
              <span>Ward 18 (East)</span>
              <span className="text-emerald-400">17 Incidents</span>
            </div>
            <div className="flex justify-between">
              <span>Ward 24 (South)</span>
              <span className="text-emerald-400">15 Incidents</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#262D38] text-[11px] text-[#6B7280] space-y-2">
        <div className="flex items-center justify-between text-mono">
          <span>Engine Model:</span>
          <span className="text-[#F8FAFC]">Rule-Based v1.0</span>
        </div>
        <div className="flex items-center justify-between text-mono">
          <span>Formula:</span>
          <span className="text-[#F5B800]">40S+25E+20T+10A+5C</span>
        </div>
      </div>
    </aside>
  );
};
