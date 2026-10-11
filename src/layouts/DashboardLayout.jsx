import React, { useState } from 'react';
import { Outlet, useLocation, Navigate, Link } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Menu, X, ShieldAlert, AlertCircle } from 'lucide-react';

export function DashboardLayout({ expectedRole = 'student' }) {
  const { currentUser, isAuthenticated, loading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Show loading spinner while determining auth state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24 bg-slate-50">
        <LoadingSpinner message="Verifying session..." />
      </div>
    );
  }

  // 1. Unauthenticated users cannot access any dashboard
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role Enforcement:
  // Admin can access any panel; others must strictly match expectedRole
  const hasAccess = currentUser.role === expectedRole || currentUser.role === 'admin';

  if (!hasAccess) {
    if (currentUser.role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    } else if (currentUser.role === 'organizer') {
      return <Navigate to="/organizer/dashboard" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  const isRoleMismatch = currentUser.role !== expectedRole;

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Informational banner when an Admin is previewing an Organizer or Student panel */}
      {isRoleMismatch && currentUser.role === 'admin' && (
        <div className="bg-purple-50 border-b border-purple-200 px-4 py-2 text-xs text-purple-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-purple-600 shrink-0" />
          <span>
            <strong>Administrator Mode:</strong> You are viewing the {expectedRole.toUpperCase()} workspace with full administrative privileges.
          </span>
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
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl z-50">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm capitalize">
                  {expectedRole} Menu
                </span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar
                  role={expectedRole}
                  onItemClick={() => setMobileSidebarOpen(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Workspace Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
