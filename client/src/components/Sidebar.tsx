import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  ClipboardList,
  FileText,
  PlusCircle,
  Truck,
  Building2,
  BarChart3,
  Flame,
  Wrench,
  Share2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

interface SidebarProps {
  onOpenHelp?: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: any;
  badge?: string;
  accent?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenHelp }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navSections: NavSection[] = [
    {
      title: 'COMMAND CENTER',
      items: [
        {
          path: '/dashboard',
          label: 'Command Center',
          icon: LayoutDashboard,
        },
        {
          path: '/feed',
          label: 'Civic Social Feed',
          icon: Share2,
          badge: 'UPVOTES',
          accent: true,
        },
      ],
    },
    {
      title: 'OPERATIONS & PLANNING',
      items: [
        {
          path: '/daily-plan',
          label: 'Daily Work Plan',
          icon: CalendarCheck,
          badge: 'PLANNER',
        },
        {
          path: '/work-orders',
          label: 'Priority Queue',
          icon: ClipboardList,
        },
        {
          path: '/analytics',
          label: 'Operational Analytics',
          icon: BarChart3,
        },
        {
          path: '/hotspots',
          label: 'Recurring Hotspots',
          icon: Flame,
          badge: 'HOTSPOT',
        },
      ],
    },
    {
      title: 'FIELD CREW & DISPATCH',
      items: [
        {
          path: '/field',
          label: 'Field Crew Workspace',
          icon: Wrench,
          badge: 'MOBILE',
        },
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
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-[calc(100vh-61px)] transition-all duration-300 shadow-sm relative ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Retractable Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        className="absolute -right-3 top-6 z-30 w-6 h-6 bg-slate-900 text-white rounded-full border border-slate-700 flex items-center justify-center hover:bg-blue-600 transition-colors shadow-md"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      <div className="p-3 space-y-4">
        {/* MFO Logo Header (Clean without background box container) */}
        <div className={`flex items-center space-x-3 px-1 py-2 ${isCollapsed ? 'justify-center' : ''}`}>
          <img src="/logo.svg" alt="MFO Logo" className="h-10 w-10 object-contain shrink-0" />
          {!isCollapsed && (
            <div>
              <div className="font-black text-sm tracking-wider text-slate-900 leading-tight">MFO CENTER</div>
              <div className="text-[10px] text-slate-500 font-mono font-bold">ROAD OPERATIONS</div>
            </div>
          )}
        </div>

        {navSections.map((section, idx) => (
          <div key={idx}>
            {!isCollapsed && (
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase px-2 font-bold block mb-1">
                {section.title}
              </span>
            )}
            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={isCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center ${
                        isCollapsed ? 'justify-center py-2.5 px-0' : 'justify-between px-3 py-2'
                      } rounded-xl text-xs font-bold transition-all group relative ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-md'
                          : item.accent
                          ? 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center space-x-2.5">
                          <Icon className="w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-110" />
                          {!isCollapsed && (
                            <span className="transition-all group-hover:translate-x-1">{item.label}</span>
                          )}
                        </div>

                        {!isCollapsed &&
                          (item.badge ? (
                            <span className="px-1.5 py-0.5 text-[9px] font-mono bg-blue-600 text-white rounded font-bold uppercase">
                              {item.badge}
                            </span>
                          ) : (
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 font-serif font-black">
                              »
                            </span>
                          ))}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}

        {/* How to Use App trigger button in Sidebar */}
        {onOpenHelp && (
          <button
            onClick={onOpenHelp}
            title="How To Use App Guide"
            className={`uiverse-slide-btn w-full shadow-sm text-xs ${isCollapsed ? '!p-2 text-[10px]' : ''}`}
          >
            <span>{isCollapsed ? 'GUIDE' : 'HOW TO USE APP GUIDE'}</span>
          </button>
        )}

        {/* Active Wards Quick Reference */}
        {!isCollapsed && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span className="flex items-center text-[10px]">
                <Building2 className="w-3.5 h-3.5 mr-1 text-blue-800" /> ACTIVE ZONES
              </span>
              <span className="text-[10px] text-slate-500">3 WARDS</span>
            </div>
            <div className="space-y-1 text-[10px] text-slate-600">
              <div className="flex justify-between border-b border-slate-200 pb-0.5">
                <span>Ward 12 (North)</span>
                <span className="font-bold text-blue-700">18 Jobs</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-0.5">
                <span>Ward 18 (East)</span>
                <span className="font-bold text-blue-700">17 Jobs</span>
              </div>
              <div className="flex justify-between">
                <span>Ward 24 (South)</span>
                <span className="font-bold text-blue-700">15 Jobs</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-200 text-[10px] text-slate-500 space-y-0.5 bg-slate-50/50 font-mono">
          <div className="flex items-center justify-between">
            <span>Priority Model:</span>
            <span className="text-slate-900 font-bold">40S+25E+20T+10A+5C</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Community Boost:</span>
            <span className="text-blue-700 font-bold">+2 per Upvote</span>
          </div>
        </div>
      )}
    </aside>
  );
};
