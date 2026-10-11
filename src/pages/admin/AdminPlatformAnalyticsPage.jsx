import React, { useState, useEffect } from 'react';
import { eventService } from '../../services/eventService';
import { userService } from '../../services/userService';
import { registrationService } from '../../services/registrationService';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle,
  PieChart,
  Calendar,
  Sparkles,
} from 'lucide-react';

export function AdminPlatformAnalyticsPage() {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      eventService.getAllEvents(),
      userService.getAllUsers(),
      registrationService.getAllRegistrations(),
    ])
      .then(([allEvts, allUsrs, allRegs]) => {
        setEvents(allEvts);
        setUsers(allUsrs);
        setRegistrations(allRegs);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating platform intelligence..." className="py-20" />;
  }

  // Calculate metrics
  const totalRegistrations = registrations.filter((r) => r.status === 'confirmed').length;
  const attendedCount = registrations.filter((r) => r.attendanceStatus === 'attended').length;
  const attendanceRate = totalRegistrations > 0 ? Math.round((attendedCount / totalRegistrations) * 100) : 0;
  const studentUsers = users.filter((u) => u.role === 'student').length;
  const organizerUsers = users.filter((u) => u.role === 'organizer').length;

  // Category Distribution
  const categoryStats = events.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {});

  // Monthly Simulation (Last 5 Months)
  const monthlyMetrics = [
    { month: 'June', registrations: 120, events: 14 },
    { month: 'July', registrations: 240, events: 22 },
    { month: 'August', registrations: 380, events: 35 },
    { month: 'September', registrations: 510, events: 48 },
    { month: 'October (Current)', registrations: 620, events: events.length },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
          Platform-Wide Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Student participation growth, category popularity, and institutional engagement metrics.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Student Population"
          value={studentUsers}
          icon={Users}
          color="brand"
          trend={22}
        />
        <StatCard
          title="Campus Organizers"
          value={organizerUsers}
          icon={Calendar}
          color="violet"
          trend={10}
        />
        <StatCard
          title="Event Registrations"
          value={totalRegistrations}
          icon={TrendingUp}
          color="blue"
          trend={35}
        />
        <StatCard
          title="Overall Attendance"
          value={`${attendanceRate}%`}
          icon={CheckCircle}
          color="emerald"
          trend={4}
        />
      </div>

      {/* Analytics Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Monthly Growth Trend */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif">
                Monthly Participation Trajectory
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Semester registrations comparison</p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="space-y-4">
            {monthlyMetrics.map((item) => {
              const maxReg = 700;
              const pct = Math.round((item.registrations / maxReg) * 100);
              return (
                <div key={item.month} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-800">{item.month}</span>
                    <span className="text-slate-600 font-mono">
                      {item.registrations} registrations • {item.events} events
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-brand-600 to-accent-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Popular Categories Breakdown */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif">
                Popular Categories
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Distribution across college activities</p>
            </div>
            <PieChart className="w-5 h-5 text-accent-600" />
          </div>

          <div className="space-y-3">
            {Object.entries(categoryStats).map(([cat, count]) => {
              const pct = Math.round((count / events.length) * 100);
              return (
                <div
                  key={cat}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-slate-800">{cat}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{count} events</span>
                    <span className="font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
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
  );
}

export default AdminPlatformAnalyticsPage;
