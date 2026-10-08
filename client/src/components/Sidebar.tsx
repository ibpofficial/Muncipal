import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  ClipboardList,
  FileText,
  PlusCircle,
  Truck,
  Building2,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navSections = [
    {
      title: 'COMMAND CENTER',
      items: [
        {
          path: '/dashboard',
          label: 'Command Center',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        {
          path: '/daily-plan',
          label: 'Daily Work Plan',
          icon: CalendarCheck,
          badge: 'PLANNER',
          accent: true,
        },
        {
          path: '/work-orders',
          label: 'Priority Queue',
          icon: ClipboardList,
        },
      ],
    },
    {
      title: 'FIELD & COMPLAINTS',
      items: [
        {
          path: '/crews',
          label: 'Field Crews',
          icon: Truck,
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
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-[calc(100vh-61px)] shadow-sm">
      <div className="p-4 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx}>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase px-3 font-semibold">
              {section.title}
            </span>
            <nav className="mt-2 space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-navy-900 text-white shadow-md border-l-4 border-blue-400'
                          : item.accent
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono bg-blue-600 text-white rounded font-bold uppercase">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}

        {/* Active Wards Quick Reference */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-700 uppercase flex items-center">
              <Building2 className="w-3.5 h-3.5 mr-1 text-navy-800" /> Active Zones
            </span>
            <span className="text-[10px] font-mono text-slate-500 font-bold">3 Wards</span>
          </div>
          <div className="space-y-1 text-[11px] font-mono text-slate-600">
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span>Ward 12 (North)</span>
              <span className="font-bold text-blue-700">18 Jobs</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span>Ward 18 (East)</span>
              <span className="font-bold text-blue-700">17 Jobs</span>
            </div>
            <div className="flex justify-between">
              <span>Ward 24 (South)</span>
              <span className="font-bold text-blue-700">15 Jobs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-1 bg-slate-50/50 font-mono">
        <div className="flex items-center justify-between">
          <span>Priority Model:</span>
          <span className="text-slate-900 font-bold">40S+25E+20T+10A+5C</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Crew Engine:</span>
          <span className="text-blue-700 font-bold">Greedy Suitability</span>
        </div>
      </div>
    </aside>
  );
};
