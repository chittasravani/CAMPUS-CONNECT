import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  Users,
  CheckCircle,
  BarChart3,
  Bell,
  Settings,
  Ticket,
  Heart,
  User,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';

export function Sidebar({ role = 'organizer', className = '' }) {
  const getLinks = () => {
    if (role === 'organizer') {
      return [
        { to: '/organizer/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
        { to: '/organizer/events', label: 'My Events', icon: Calendar },
        { to: '/organizer/events/new', label: 'Create Event', icon: PlusCircle },
        { to: '/organizer/registrations', label: 'Participant Roster', icon: Users },
        { to: '/organizer/attendance', label: 'Mark Attendance', icon: CheckCircle },
      ];
    }

    if (role === 'admin') {
      return [
        { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
        { to: '/admin/users', label: 'User Management', icon: Users },
        { to: '/admin/events', label: 'Event Approvals', icon: Shield },
      ];
    }

    // Student Links
    return [
      { to: '/student/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/student/registrations', label: 'My Registrations', icon: Calendar },
      { to: '/events', label: 'Browse Events', icon: Ticket },
    ];
  };

  const links = getLinks();

  return (
    <aside className={`w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between ${className}`}>
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {role.toUpperCase()} PORTAL
          </div>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700 block">CampusConnect v1.0</span>
          <span>Role-based UI active</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
