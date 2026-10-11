import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';

export function DashboardLayout({ expectedRole = 'student' }) {
  const { currentUser, isAuthenticated, switchRole } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const isRoleMismatch = currentUser?.role !== expectedRole;

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Role Mismatch Warning Banner if user is on another role's dashboard */}
      {isRoleMismatch && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              You are currently browsing the <strong>{expectedRole.toUpperCase()}</strong> dashboard while signed in as a{' '}
              <strong>{currentUser?.role || 'Guest'}</strong>.
            </span>
          </div>
          <button
            onClick={() => switchRole(expectedRole)}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs"
          >
            Switch to {expectedRole.charAt(0).toUpperCase() + expectedRole.slice(1)} account
          </button>
        </div>
      )}

      {/* Mobile Sidebar Toggle Bar */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {expectedRole} Navigation
          </span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 text-xs font-semibold"
        >
          {mobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>Menu</span>
        </button>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Desktop Sidebar */}
        <Sidebar role={expectedRole} className="hidden md:flex shrink-0" />

        {/* Mobile Slide-in Sidebar */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative z-50 w-64 bg-white h-full shadow-2xl animate-fade-in">
              <div className="p-4 flex items-center justify-between border-b border-slate-100">
                <span className="font-bold text-sm text-slate-800 capitalize">
                  {expectedRole} Menu
                </span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <Sidebar role={expectedRole} className="border-none w-full" />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
