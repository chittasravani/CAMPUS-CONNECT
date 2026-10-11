import React, { useState, useEffect } from 'react';
import { eventService } from '../../services/eventService';
import { userService } from '../../services/userService';
import { registrationService } from '../../services/registrationService';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { FileSpreadsheet, Download, Calendar, Users, CheckCircle2, Shield } from 'lucide-react';
import { exportToCSV, formatDate } from '../../utils/helpers';

export function AdminReportsPage() {
  const { showToast } = useToast();

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

  // 1. Export Events Report
  const handleExportEvents = () => {
    const headers = [
      { key: 'id', label: 'Event ID' },
      { key: 'title', label: 'Event Title' },
      { key: 'category', label: 'Category' },
      { key: 'organizerName', label: 'Organizer' },
      { key: 'venue', label: 'Venue' },
      { key: 'startDate', label: 'Start Date & Time' },
      { key: 'capacity', label: 'Maximum Capacity' },
      { key: 'registeredCount', label: 'Registered Participants' },
      { key: 'status', label: 'Status' },
      { key: 'contactEmail', label: 'Contact Email' },
    ];
    exportToCSV('CampusConnect_Platform_Events_Report', events, headers);
    showToast('Platform Events CSV report exported!', 'success');
  };

  // 2. Export Users Directory Report
  const handleExportUsers = () => {
    const headers = [
      { key: 'id', label: 'User ID' },
      { key: 'name', label: 'Full Name' },
      { key: 'email', label: 'College Email' },
      { key: 'role', label: 'Role' },
      { key: 'studentId', label: 'Student / Faculty ID' },
      { key: 'department', label: 'Department' },
      { key: 'year', label: 'Class / Title' },
      { key: 'phone', label: 'Phone' },
      { key: 'status', label: 'Account Status' },
      { key: 'createdAt', label: 'Joined Date' },
    ];
    exportToCSV('CampusConnect_User_Directory_Report', users, headers);
    showToast('User Directory CSV report exported!', 'success');
  };

  // 3. Export Attendance Log Report
  const handleExportAttendance = () => {
    const enriched = registrations.map((r) => {
      const evt = events.find((e) => e.id === r.eventId);
      return {
        ...r,
        eventTitle: evt ? evt.title : 'Unknown Event',
        eventCategory: evt ? evt.category : 'General',
        venue: evt ? evt.venue : 'TBA',
      };
    });

    const headers = [
      { key: 'id', label: 'Registration ID' },
      { key: 'eventTitle', label: 'Event Title' },
      { key: 'eventCategory', label: 'Category' },
      { key: 'studentName', label: 'Student Name' },
      { key: 'studentEmail', label: 'Email' },
      { key: 'collegeStudentId', label: 'Student ID' },
      { key: 'department', label: 'Department' },
      { key: 'ticketCode', label: 'Ticket Code' },
      { key: 'attendanceStatus', label: 'Attendance Status' },
      { key: 'attendedAt', label: 'Check-in Timestamp' },
      { key: 'registrationDate', label: 'Registration Date' },
    ];
    exportToCSV('CampusConnect_Attendance_Log_Report', enriched, headers);
    showToast('Attendance Log CSV report exported!', 'success');
  };

  if (loading) {
    return <LoadingSpinner message="Loading reporting center..." className="py-20" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
          Official Reports & Data Exports
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Generate and export real downloadable CSV datasets for academic audits, student affairs, and safety oversight.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Report Card 1: Events */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-brand-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-serif">
              Platform Events Catalog
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Complete inventory of all {events.length} campus events across categories, capacity limits, dates, and publishing statuses.
            </p>
          </div>
          <button
            onClick={handleExportEvents}
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download Events CSV</span>
          </button>
        </div>

        {/* Report Card 2: Users */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-accent-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-serif">
              User Directory & Rosters
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Full directory of {users.length} enrolled student profiles, faculty coordinators, departments, and moderation statuses.
            </p>
          </div>
          <button
            onClick={handleExportUsers}
            className="w-full py-2.5 rounded-xl bg-accent-600 hover:bg-accent-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download Users CSV</span>
          </button>
        </div>

        {/* Report Card 3: Attendance */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-serif">
              Attendance & Ticket Logs
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Auditable log of {registrations.length} student registrations, unique ticket codes, and timestamped QR attendance check-ins.
            </p>
          </div>
          <button
            onClick={handleExportAttendance}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download Attendance CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminReportsPage;
