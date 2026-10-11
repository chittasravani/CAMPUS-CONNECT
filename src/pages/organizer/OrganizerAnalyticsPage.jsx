import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { eventService } from '../../services/eventService';
import { registrationService } from '../../services/registrationService';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { BarChart3, TrendingUp, Users, CheckCircle, PieChart, Sparkles } from 'lucide-react';

export function OrganizerAnalyticsPage() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.id) return;
    Promise.all([
      eventService.getEventsByOrganizer(currentUser.id),
      registrationService.getAllRegistrations(),
    ])
      .then(([orgEvents, allRegs]) => {
        setEvents(orgEvents);
        const eventIds = new Set(orgEvents.map((e) => e.id));
        setRegistrations(allRegs.filter((r) => eventIds.has(r.eventId)));
      })
      .finally(() => setLoading(false));
  }, [currentUser?.id]);

  if (loading) {
    return <LoadingSpinner message="Calculating organizer analytics..." className="py-20" />;
  }

  const totalCapacity = events.reduce((acc, curr) => acc + curr.capacity, 0);
  const totalRegistrations = registrations.filter((r) => r.status === 'confirmed').length;
  const attendedCount = registrations.filter((r) => r.attendanceStatus === 'attended').length;
  const overallUtilization = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;
  const overallAttendanceRate = totalRegistrations > 0 ? Math.round((attendedCount / totalRegistrations) * 100) : 0;

  // Category counts
  const categoryCounts = events.reduce((acc, evt) => {
    acc[evt.category] = (acc[evt.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
          Organizer Analytics & Metrics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Detailed breakdown of registrations, venue capacity utilization, and attendance conversions.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Host Capacity"
          value={totalCapacity}
          icon={Users}
          color="brand"
        />
        <StatCard
          title="Total Registrations"
          value={totalRegistrations}
          icon={TrendingUp}
          color="violet"
        />
        <StatCard
          title="Capacity Fill Rate"
          value={`${overallUtilization}%`}
          icon={BarChart3}
          color="blue"
        />
        <StatCard
          title="Turnout / Attendance"
          value={`${overallAttendanceRate}%`}
          icon={CheckCircle}
          color="emerald"
        />
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Event Capacity Utilization Bars */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif">
                Capacity Fill by Event
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Ratio of registered seats vs room limit</p>
            </div>
            <BarChart3 className="w-5 h-5 text-brand-600" />
          </div>

          <div className="space-y-4">
            {events.map((evt) => {
              const pct = Math.min(100, Math.round((evt.registeredCount / evt.capacity) * 100));
              return (
                <div key={evt.id} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-800 truncate max-w-[240px] sm:max-w-xs">{evt.title}</span>
                    <span className="text-slate-600 font-mono">
                      {evt.registeredCount} / {evt.capacity} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 100 ? 'bg-purple-600' : pct > 75 ? 'bg-brand-600' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Category Distribution & Insights */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-serif">
                Category Distribution
              </h3>
              <PieChart className="w-5 h-5 text-accent-600" />
            </div>

            <div className="space-y-3">
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const pct = Math.round((count / events.length) * 100);
                return (
                  <div key={cat} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{cat}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{count} events</span>
                      <span className="font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizerAnalyticsPage;
