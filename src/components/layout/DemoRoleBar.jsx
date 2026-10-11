import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, User, RefreshCw, ChevronDown, ChevronUp, Shield, CalendarCheck, GraduationCap } from 'lucide-react';
import ConfirmDialog from '../ui/ConfirmDialog';

export function DemoRoleBar() {
  const { currentUser, switchRole, resetData } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleRoleSwitch = async (role, targetPath) => {
    try {
      const user = await switchRole(role);
      showToast(`Switched to ${role.toUpperCase()} mode as ${user.name}`, 'info');
      if (targetPath) {
        navigate(targetPath);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReset = () => {
    resetData();
    setShowResetConfirm(false);
    showToast('Mock database reset to original sample state successfully!', 'success');
  };

  return (
    <>
      <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs no-print relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
          {/* Left: Active Role Indicator */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-semibold border border-brand-500/30">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Demo Sandbox
            </span>
            <span className="hidden sm:inline text-slate-400">
              Logged in as: <strong className="text-white font-medium">{currentUser?.name || 'Guest'}</strong> (
              <span className="capitalize text-brand-300">{currentUser?.role || 'Visitor'}</span>)
            </span>
          </div>

          {/* Right: Quick Role Switchers */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="hidden md:inline text-slate-400 text-[11px] font-medium mr-1">
              Quick Switch Role:
            </span>

            <button
              onClick={() => handleRoleSwitch('student', '/student/dashboard')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                currentUser?.role === 'student'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Switch to Student account"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>

            <button
              onClick={() => handleRoleSwitch('organizer', '/organizer/dashboard')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                currentUser?.role === 'organizer'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Switch to Organizer account"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Organizer</span>
            </button>

            <button
              onClick={() => handleRoleSwitch('admin', '/admin/dashboard')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                currentUser?.role === 'admin'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Switch to Administrator account"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1"></div>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 transition-colors"
              title="Reset sample data back to default state"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden lg:inline">Reset Data</span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        title="Reset Demo Data?"
        message="This will re-seed all events, registrations, tickets, notifications, and users back to their initial sample state."
        confirmText="Reset Now"
        isDestructive={true}
      />
    </>
  );
}

export default DemoRoleBar;
