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
  UserCheck,
  Users,
  ShieldAlert,
  Activity,
  User,
  Home,
  Briefcase,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

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
  const { role } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getRoleNavSections = (userRole?: UserRole | null): NavSection[] => {
    switch (userRole) {
      case 'USER':
        return [
          {
            title: 'CITIZEN PORTAL',
            items: [
              { path: '/user', label: 'My Dashboard', icon: Home },
              { path: '/my-reports', label: 'My Complaints', icon: FileText, badge: 'REPORTS' },
              { path: '/report', label: 'Report Road Issue', icon: PlusCircle, accent: true },
              { path: '/public-complaints', label: 'Public Issue Feed', icon: Share2 },
            ],
          },
          {
            title: 'ACCOUNT',
            items: [
              { path: '/my-activity', label: 'My Activity', icon: Activity },
              { path: '/profile', label: 'My Profile', icon: User },
            ],
          },
        ];

      case 'PROFESSIONAL':
        return [
          {
            title: 'PROFESSIONAL WORKSPACE',
            items: [
              { path: '/professional', label: 'Work Dashboard', icon: Briefcase },
              { path: '/public-complaints', label: 'Public Reports', icon: Share2 },
            ],
          },
          {
            title: 'ACCOUNT & COMPLIANCE',
            items: [
              { path: '/my-activity', label: 'Activity History', icon: Activity },
              { path: '/profile', label: 'Professional Profile', icon: User },
            ],
          },
        ];

      case 'WORKER':
        return [
          {
            title: 'FIELD REPAIR WORKSPACE',
            items: [
              { path: '/worker', label: "Today's Field Plan", icon: Wrench, badge: 'JOBS' },
              { path: '/worker?tab=route', label: 'Route Guidance', icon: MapPin },
            ],
          },
          {
            title: 'WORKER ACCOUNT',
            items: [
              { path: '/my-activity', label: 'Shift History', icon: Activity },
              { path: '/profile', label: 'Worker Profile', icon: User },
            ],
          },
        ];

      case 'AUTHORITY':
      default:
        return [
          {
            title: 'COMMAND CENTER',
            items: [
              { path: '/authority', label: 'Operations Overview', icon: LayoutDashboard },
              { path: '/feed', label: 'Civic Social Feed', icon: Share2, badge: 'LIVE' },
            ],
          },
          {
            title: 'OPERATIONS & PLANNING',
            items: [
              { path: '/daily-plan', label: 'Daily Work Plan', icon: CalendarCheck, badge: 'PLANNER' },
              { path: '/work-orders', label: 'Priority Queue', icon: ClipboardList },
              { path: '/analytics', label: 'Operational Analytics', icon: BarChart3 },
              { path: '/hotspots', label: 'Recurring Hotspots', icon: Flame, badge: 'HOTSPOT' },
              { path: '/crews', label: 'Repair Crews', icon: Truck },
              { path: '/complaints', label: 'All Complaints', icon: FileText },
            ],
          },
          {
            title: 'ADMIN & AUDIT LOGS',
            items: [
              { path: '/approvals', label: 'Role Approvals', icon: UserCheck, badge: 'PENDING' },
              { path: '/users', label: 'User & Crew Admin', icon: Users },
              { path: '/audit-log', label: 'System Audit Log', icon: ShieldAlert },
              { path: '/profile', label: 'Authority Profile', icon: User },
            ],
          },
        ];
    }
  };

  const navSections = getRoleNavSections(role);

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
        {/* MFO Logo Header */}
        <div className={`flex items-center space-x-3 px-1 py-2 ${isCollapsed ? 'justify-center' : ''}`}>
          <img src="/logo.svg" alt="MFO Logo" className="h-9 w-9 object-contain shrink-0" />
          {!isCollapsed && (
            <div>
              <div className="font-black text-xs tracking-wider text-slate-900 leading-tight">MUNICIPAL PORTAL</div>
              <div className="text-[10px] text-slate-500 font-mono font-bold uppercase">{role || 'GUEST'} WORKSPACE</div>
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
                          <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                          {!isCollapsed && (
                            <span className="transition-all group-hover:translate-x-1">{item.label}</span>
                          )}
                        </div>

                        {!isCollapsed && item.badge && (
                          <span className="px-1.5 py-0.5 text-[9px] font-mono bg-blue-600 text-white rounded font-bold uppercase">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}

        {/* How to Use App guide */}
        {onOpenHelp && (
          <button
            onClick={onOpenHelp}
            title="How To Use App Guide"
            className={`uiverse-slide-btn w-full shadow-sm text-xs ${isCollapsed ? '!p-2 text-[10px]' : ''}`}
          >
            <span>{isCollapsed ? 'GUIDE' : 'HOW TO USE APP GUIDE'}</span>
          </button>
        )}
      </div>

      {/* Footer Info */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-200 text-[10px] text-slate-500 space-y-0.5 bg-slate-50/50 font-mono">
          <div className="flex items-center justify-between">
            <span>Priority Algorithm:</span>
            <span className="text-slate-900 font-bold">5-FACTOR (40/25/20/10/5)</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Civic Upvote Boost:</span>
            <span className="text-blue-700 font-bold">+2 pts</span>
          </div>
        </div>
      )}
    </aside>
  );
};
