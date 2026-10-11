import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { eventService } from '../../services/eventService';
import { registrationService } from '../../services/registrationService';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  Calendar,
  Users,
  CheckCircle,
  PlusCircle,
  BarChart3,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { formatDate, formatTime } from '../../utils/helpers';

export function OrganizerDashboardPage() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orgId = currentUser?.id || currentUser?._id;
    if (!orgId) return;

    Promise.all([
      eventService.getEventsByOrganizer(orgId),
      registrationService.getAllRegistrations(),
    ])
      .then(([orgEvents, allRegs]) => {
        setEvents(orgEvents);
        // Find registrations for events belonging to this organizer
        const eventIds = new Set(orgEvents.map((e) => e.id || e._id));
        const orgRegs = allRegs.filter((r) => eventIds.has(r.eventId));
        setRegistrations(orgRegs);
      })
      .finally(() => setLoading(false));
  }, [currentUser?.id, currentUser?._id]);

  if (loading) {
    return <LoadingSpinner message="Loading organizer dashboard..." className="py-16" />;
  }

  // Calculate metrics
  const totalEvents = events.length;
  const publishedEvents = events.filter((e) => e.status === 'published' || e.status === 'approved').length;
  const pendingEvents = events.filter((e) => e.status === 'pending' || e.status === 'draft').length;
  const totalRegistrations = registrations.filter((r) => r.status === 'confirmed').length;
  const attendedCount = registrations.filter((r) => r.attendanceStatus === 'attended').length;
  const attendanceRate =
    totalRegistrations > 0 ? Math.round((attendedCount / totalRegistrations) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-brand-300 text-xs font-semibold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Organizer Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif">
            Welcome, {currentUser?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {currentUser?.organizationName || 'Campus Faculty / Student Organization'} • Active Organizer
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/organizer/events/new"
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/30 transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Event</span>
          </Link>
          <Link
            to="/organizer/attendance"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Open QR Scanner</span>
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Events"
          value={totalEvents}
          icon={Calendar}
          color="brand"
          trend={12}
        />
        <StatCard
          title="Published Events"
          value={publishedEvents}
          icon={BarChart3}
          color="violet"
          trend={8}
        />
        <StatCard
          title="Total Registrations"
          value={totalRegistrations}
          icon={Users}
          color="blue"
          trend={24}
        />
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon={CheckCircle}
          color="emerald"
          trend={5}
        />
      </div>

      {/* Main Grid: My Active Events (Left) + Quick Participant Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left (8 cols): Event Management Preview */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">
                  My Managed Events
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Track capacity, status, and registrations
                </p>
              </div>
              <Link
                to="/organizer/events"
                className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
              >
                <span>Manage All ({events.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {events.length === 0 ? (
              <div className="text-center py-10">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No events created yet</h4>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Publish your first workshop, hackathon, or cultural show.
                </p>
                <Link
                  to="/organizer/events/new"
                  className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
                >
                  Create Event
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 space-y-4">
                {events.slice(0, 4).map((evt) => {
                  const percent = Math.min(
                    100,
                    Math.round((evt.registeredCount / evt.capacity) * 100)
                  );
                  return (
                    <div
                      key={evt.id}
                      className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <img
                          src={evt.posterUrl}
                          alt={evt.title}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase text-brand-600">
                              {evt.category}
                            </span>
                            <StatusBadge status={evt.status} />
                          </div>
                          <Link to={`/events/${evt.id}`}>
                            <h4 className="text-sm font-bold text-slate-900 hover:text-brand-600 transition-colors line-clamp-1">
                              {evt.title}
                            </h4>
                          </Link>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {formatDate(evt.startDate)} • {evt.venue}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                        <div className="text-xs font-semibold text-slate-700">
                          {evt.registeredCount} / {evt.capacity} registered ({percent}%)
                        </div>
                        <div className="w-32 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-brand-600 h-full rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Link
                            to={`/organizer/events/${evt.id}/edit`}
                            className="text-xs font-semibold text-brand-600 hover:text-brand-800"
                          >
                            Edit
                          </Link>
                          <span className="text-slate-300">•</span>
                          <Link
                            to={`/organizer/registrations?eventId=${evt.id}`}
                            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                          >
                            Roster
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right (4 cols): Recent Attendee Registrations */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-serif">
                Recent Sign-Ups
              </h3>
              <Link
                to="/organizer/registrations"
                className="text-xs font-semibold text-brand-600 hover:text-brand-800"
              >
                Full list
              </Link>
            </div>

            {registrations.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No registrations recorded yet
              </p>
            ) : (
              <div className="space-y-3">
                {registrations.slice(0, 5).map((reg) => (
                  <div
                    key={reg.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{reg.studentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {reg.ticketCode} • {reg.collegeStudentId}
                      </div>
                    </div>
                    <StatusBadge status={reg.attendanceStatus} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-brand-50/60 border border-brand-100 rounded-3xl p-6 space-y-3">
            <h4 className="text-sm font-bold text-brand-900 font-serif">
              Organizer Checklist
            </h4>
            <ul className="text-xs text-brand-800 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verify venue reservation with student affairs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Download attendee CSV for security clearance</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Test QR camera scanner before gate opens</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizerDashboardPage;
