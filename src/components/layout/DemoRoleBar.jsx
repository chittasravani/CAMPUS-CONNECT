import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, CalendarCheck, GraduationCap, ArrowRight } from 'lucide-react';
import { getAuthToken } from '../../services/apiClient';

export function DemoRoleBar() {
  const { currentUser, isAuthenticated } = useAuth();
  const hasRealToken = !!getAuthToken();

  // If user is logged in with real backend JWT credentials
  if (hasRealToken && isAuthenticated && currentUser) {
    const roleColors = {
      admin: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      organizer: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      student: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    }[currentUser.role] || 'bg-brand-500/20 text-brand-300 border-brand-500/30';

    const dashboardPath =
      currentUser.role === 'admin'
        ? '/admin/dashboard'
        : currentUser.role === 'organizer'
        ? '/organizer/dashboard'
        : '/student/dashboard';

    return (
      <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs no-print relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full font-semibold border ${roleColors}`}>
              Authenticated Session
            </span>
            <span className="text-slate-300">
              Signed in as: <strong className="text-white font-medium">{currentUser.name}</strong> (
              <span className="capitalize font-semibold text-brand-300">{currentUser.role}</span>)
            </span>
          </div>
          <Link
            to={dashboardPath}
            className="flex items-center gap-1 text-[11px] font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            <span>Go to {currentUser.role.toUpperCase()} Workspace</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  }

  // If visitor is unauthenticated
  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs no-print relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold border border-slate-700">
            <Sparkles className="w-3 h-3 text-brand-400" /> CampusConnect
          </span>
          <span className="text-slate-400">
            Welcome to the centralized campus event management portal.
          </span>
        </div>
        <Link
          to="/login"
          className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default DemoRoleBar;
