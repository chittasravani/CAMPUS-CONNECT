import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { registrationService } from '../../services/registrationService';
import { eventService } from '../../services/eventService';
import { notificationService } from '../../services/notificationService';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import QrTicketModal from '../../components/ui/QrTicketModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  Calendar,
  Ticket,
  CheckCircle2,
  Award,
  ArrowRight,
  Clock,
  Sparkles,
  MapPin,
  Bell,
} from 'lucide-react';
import { formatDate, formatTime } from '../../utils/helpers';

export function StudentDashboardPage() {
  const { currentUser } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedTicketReg, setSelectedTicketReg] = useState(null);

  useEffect(() => {
    if (!currentUser?.id) return;
    setLoading(true);

    Promise.all([
      registrationService.getRegistrationsByStudent(currentUser.id),
      eventService.getAllEvents(),
      notificationService.getNotifications(currentUser.id),
    ])
      .then(([regs, allEvents, notifs]) => {
        setRegistrations(regs);
        // Recommended events: upcoming published events that student hasn't registered for yet
        const registeredEventIds = new Set(regs.map((r) => r.eventId));
        const rec = allEvents
          .filter(
            (e) =>
              e.status === 'published' &&
              !registeredEventIds.has(e.id) &&
              new Date(e.startDate) >= new Date()
          )
          .slice(0, 3);
        setRecommendedEvents(rec);
        setNotifications(notifs.slice(0, 4));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentUser?.id]);

  if (loading) {
    return <LoadingSpinner message="Loading your student workspace..." className="py-16" />;
  }

  // Calculate statistics
  const confirmedRegs = registrations.filter((r) => r.status === 'confirmed');
  const now = new Date();
  const upcomingRegs = confirmedRegs.filter((r) => new Date(r.event?.startDate) >= now);
  const completedRegs = confirmedRegs.filter(
    (r) => new Date(r.event?.endDate) < now || r.event?.status === 'completed'
  );
  const attendedCount = registrations.filter((r) => r.attendanceStatus === 'attended').length;
  const attendanceRate =
    completedRegs.length > 0 ? Math.round((attendedCount / completedRegs.length) * 100) : 100;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-600 rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold mb-1">
            <Sparkles className="w-4 h-4 text-brand-300" />
            <span>Student Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif">
            Welcome, {currentUser?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-xl">
            {currentUser?.department} • {currentUser?.year} • ID: {currentUser?.studentId}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/student/registrations"
            className="px-4 py-2.5 rounded-xl bg-white text-brand-700 font-bold text-xs shadow-sm hover:bg-indigo-50 transition-colors flex items-center gap-1.5"
          >
            <Ticket className="w-4 h-4" />
            <span>My Registrations</span>
          </Link>
          <Link
            to="/events"
            className="px-4 py-2.5 rounded-xl bg-brand-800/80 text-white font-semibold text-xs border border-brand-400/40 hover:bg-brand-900 transition-colors"
          >
            Explore More Events
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Registrations"
          value={registrations.length}
          icon={Ticket}
          color="brand"
        />
        <StatCard
          title="Upcoming Events"
          value={upcomingRegs.length}
          icon={Calendar}
          color="violet"
        />
        <StatCard
          title="Completed Events"
          value={completedRegs.length}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Attendance Count"
          value={`${attendedCount} (${attendanceRate}%)`}
          icon={Award}
          color="amber"
        />
      </div>

      {/* Main Grid: Upcoming Events (Left) + Notifications & Recommendations (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Upcoming Registered Events */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">
                  Upcoming Registered Events
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Events you have reserved seats for
                </p>
              </div>
              <Link
                to="/student/registrations"
                className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
              >
                <span>View All ({registrations.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcomingRegs.length === 0 ? (
              <div className="text-center py-10 px-4">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No upcoming events reserved</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 mb-4">
                  Browse upcoming campus hackathons, sports leagues, and seminars to register.
                </p>
                <Link
                  to="/events"
                  className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Explore Events
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 space-y-3">
                {upcomingRegs.map((reg) => (
                  <div
                    key={reg.id}
                    className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <img
                        src={reg.event?.posterUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=256&q=80'}
                        alt={reg.event?.title}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                      />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                          {reg.event?.category}
                        </span>
                        <Link to={`/events/${reg.eventId}`}>
                          <h4 className="text-sm font-bold text-slate-900 hover:text-brand-600 transition-colors line-clamp-1">
                            {reg.event?.title}
                          </h4>
                        </Link>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(reg.event?.startDate)} at {formatTime(reg.event?.startDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {reg.event?.venue}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => setSelectedTicketReg(reg)}
                        className="px-3.5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold border border-brand-200 transition-colors flex items-center gap-1.5"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Pass</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Events */}
          {recommendedEvents.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 font-serif">
                  Recommended For You
                </h3>
                <Link
                  to="/events"
                  className="text-xs font-bold text-brand-600 hover:text-brand-800"
                >
                  Browse Catalog →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {recommendedEvents.map((evt) => (
                  <Link
                    key={evt.id}
                    to={`/events/${evt.id}`}
                    className="group p-3 rounded-2xl border border-slate-200/80 hover:border-brand-300 hover:shadow-card transition-all flex flex-col justify-between"
                  >
                    <div>
                      <img
                        src={evt.posterUrl}
                        alt={evt.title}
                        className="w-full h-24 rounded-xl object-cover mb-2.5 group-hover:scale-102 transition-transform"
                      />
                      <span className="text-[10px] font-bold text-brand-600 uppercase">
                        {evt.category}
                      </span>
                      <h5 className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5 group-hover:text-brand-600 transition-colors">
                        {evt.title}
                      </h5>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span>{formatDate(evt.startDate)}</span>
                      <span className="font-semibold text-brand-600">Register</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Notifications & Fast Links */}
        <div className="lg:col-span-4 space-y-6">
          {/* Notifications Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-600" />
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  Recent Alerts
                </h3>
              </div>
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No new notifications</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-xl border text-xs space-y-1 transition-all ${
                      notif.isRead
                        ? 'bg-slate-50 border-slate-200/60 opacity-75'
                        : 'bg-brand-50/50 border-brand-200'
                    }`}
                  >
                    <div className="font-bold text-slate-900">{notif.title}</div>
                    <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-3">
            <h4 className="text-sm font-bold text-slate-900 font-serif">Student Shortcuts</h4>
            <div className="space-y-2 text-xs">
              <Link
                to="/student/registrations"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-200/60 transition-colors font-medium text-slate-700"
              >
                <span className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-brand-600" /> My Registrations & Passes
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/events"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-200/60 transition-colors font-medium text-slate-700"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-violet-600" /> Browse Campus Events
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Modal */}
      <QrTicketModal
        isOpen={!!selectedTicketReg}
        onClose={() => setSelectedTicketReg(null)}
        registration={selectedTicketReg}
      />
    </div>
  );
}

export default StudentDashboardPage;
