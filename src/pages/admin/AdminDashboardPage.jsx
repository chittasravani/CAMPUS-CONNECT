import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { eventService } from '../../services/eventService';
import { registrationService } from '../../services/registrationService';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  Shield,
  Users,
  Calendar,
  Ticket,
  CheckCircle,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  Server,
  Activity,
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export function AdminDashboardPage() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      userService.getAllUsers(),
      eventService.getAllEvents(),
      registrationService.getAllRegistrations(),
    ])
      .then(([allUsers, allEvents, allRegs]) => {
        setUsers(allUsers);
        setEvents(allEvents);
        setRegistrations(allRegs);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading administration control panel..." className="py-20" />;
  }

  const attendedCount = registrations.filter((r) => r.attendanceStatus === 'attended').length;
  const attendanceRate =
    registrations.length > 0 ? Math.round((attendedCount / registrations.length) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Top Admin Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold mb-1">
            <Shield className="w-4 h-4 text-brand-400" />
            <span>Campus Administrative Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif">
            Welcome, {currentUser?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Office of Student Affairs & Dean of Student Life • Full Platform Privileges
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/events"
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            <span>Review Submissions</span>
          </Link>
          <Link
            to="/admin/users"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            <span>Manage Users</span>
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Users"
          value={users.length}
          icon={Users}
          color="brand"
          trend={18}
        />
        <StatCard
          title="Campus Events"
          value={events.length}
          icon={Calendar}
          color="violet"
          trend={14}
        />
        <StatCard
          title="Total Registrations"
          value={registrations.length}
          icon={Ticket}
          color="blue"
          trend={32}
        />
        <StatCard
          title="Overall Attendance"
          value={`${attendanceRate}%`}
          icon={CheckCircle}
          color="emerald"
          trend={6}
        />
      </div>

      {/* Main Grid: Events Queue (Left) + Recent Users & System Health (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Event Submissions Queue */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">
                  Platform Events Roster
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Overview of all department and club events
                </p>
              </div>
              <Link
                to="/admin/events"
                className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
              >
                <span>Full List ({events.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 space-y-3">
              {events.slice(0, 5).map((evt) => (
                <div
                  key={evt.id}
                  className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={evt.posterUrl}
                      alt={evt.title}
                      className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200"
                    />
                    <div className="min-w-0">
                      <Link to={`/events/${evt.id}`}>
                        <div className="font-bold text-slate-900 hover:text-brand-600 truncate max-w-xs">
                          {evt.title}
                        </div>
                      </Link>
                      <div className="text-[11px] text-slate-500">
                        By {evt.organizerName} • {formatDate(evt.startDate)}
                      </div>
                    </div>
                  </div>

                  <StatusBadge status={evt.status} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): System Health & User Quick Link */}
        <div className="lg:col-span-5 space-y-6">
          {/* Architecture Status */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-600" />
                <span>Architecture Health</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Operational
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Frontend Framework</span>
                <strong className="text-slate-800">React 19 + Vite</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Service Layer</span>
                <strong className="text-slate-800">Centralized Mock Service Layer</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Target Backend</span>
                <strong className="text-slate-800">Node / Express.js / MongoDB</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>QR Verification</span>
                <strong className="text-slate-800">SVG Engine + Duplication Check</strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span>State Persistence</span>
                <strong className="text-slate-800">LocalStorage Demo Engine</strong>
              </div>
            </div>
          </div>

          {/* Quick User Management card */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 font-serif">User Administration</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Review registered students and club organizers, view profile records, and manage account statuses.
            </p>
            <Link
              to="/admin/users"
              className="w-full inline-block text-center py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
            >
              Manage Users Directory →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
