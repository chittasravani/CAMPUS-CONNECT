import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { eventService } from '../../services/eventService';
import { registrationService } from '../../services/registrationService';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  Users,
  Download,
  Search,
  CheckCircle,
  Clock,
  Eye,
  FileSpreadsheet,
  Calendar,
} from 'lucide-react';
import { formatDate, formatDateTime, exportToCSV } from '../../utils/helpers';

export function ParticipantManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialEventId = searchParams.get('eventId') || '';

  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Participant detail view modal
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  // Load organizer events
  useEffect(() => {
    if (!currentUser?.id) return;
    eventService
      .getEventsByOrganizer(currentUser.id)
      .then((orgEvents) => {
        setEvents(orgEvents);
        if (!selectedEventId && orgEvents.length > 0) {
          setSelectedEventId(orgEvents[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, [currentUser?.id]);

  // Load participants whenever selected event changes
  useEffect(() => {
    if (!selectedEventId) {
      setParticipants([]);
      return;
    }
    registrationService
      .getRegistrationsByEvent(selectedEventId)
      .then(setParticipants);
  }, [selectedEventId]);

  // Real CSV Export
  const handleExportCSV = () => {
    if (participants.length === 0) {
      showToast('No participants to export for this event.', 'warning');
      return;
    }

    const currentEvent = events.find((e) => e.id === selectedEventId);
    const eventName = currentEvent ? currentEvent.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30) : 'Participants';

    const headers = [
      { key: 'studentName', label: 'Student Name' },
      { key: 'studentEmail', label: 'Email Address' },
      { key: 'collegeStudentId', label: 'Student ID' },
      { key: 'department', label: 'Department' },
      { key: 'ticketCode', label: 'Ticket Code' },
      { key: 'status', label: 'Registration Status' },
      { key: 'attendanceStatus', label: 'Attendance Status' },
      { key: 'registrationDate', label: 'Registration Date' },
      { key: 'attendedAt', label: 'Check-in Time' },
    ];

    exportToCSV(`CampusConnect_${eventName}_Roster`, participants, headers);
    showToast(`Participant CSV roster downloaded!`, 'success');
  };

  // Filter participants
  const filteredParticipants = participants.filter((p) => {
    if (statusFilter !== 'all' && p.attendanceStatus !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return (
        p.studentName?.toLowerCase().includes(q) ||
        p.studentEmail?.toLowerCase().includes(q) ||
        p.collegeStudentId?.toLowerCase().includes(q) ||
        p.ticketCode?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const attendedCount = participants.filter((p) => p.attendanceStatus === 'attended').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
            Participant Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage registered attendees, view ticket identifiers, and download official rosters.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={participants.length === 0}
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Roster to CSV</span>
        </button>
      </div>

      {/* Event Selector & Stats Strip */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex-1 max-w-md">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Select Managed Event
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              setSearchParams({ eventId: e.target.value });
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title} ({evt.registeredCount} / {evt.capacity})
              </option>
            ))}
          </select>
        </div>

        {selectedEvent && (
          <div className="flex items-center gap-6 text-xs border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6">
            <div>
              <span className="text-slate-400 font-medium block">Total Registered</span>
              <span className="text-base font-extrabold text-slate-900">
                {participants.length} / {selectedEvent.capacity}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Verified Attended</span>
              <span className="text-base font-extrabold text-emerald-600">
                {attendedCount}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Pending Check-in</span>
              <span className="text-base font-extrabold text-amber-600">
                {participants.length - attendedCount}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student name, email, ID, or ticket..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium mr-1">Status:</span>
          {['all', 'registered', 'attended'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Participants Table */}
      {loading ? (
        <LoadingSpinner message="Loading participant list..." />
      ) : filteredParticipants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No participant records found"
          description="There are no students registered under this filter criteria."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Student Details</th>
                  <th className="py-3.5 px-4">Ticket Pass Code</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4">Attendance</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredParticipants.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{p.studentName}</div>
                      <div className="text-[11px] text-slate-500">{p.studentEmail}</div>
                      <div className="text-[10px] font-mono text-slate-400">{p.collegeStudentId}</div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        {p.ticketCode}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      {p.department || 'Undergraduate'}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-slate-500">
                      {formatDate(p.registrationDate)}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={p.attendanceStatus} />
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedParticipant(p)}
                        className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition-colors font-medium text-xs flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Participant Details Inspection Modal */}
      <Modal
        isOpen={!!selectedParticipant}
        onClose={() => setSelectedParticipant(null)}
        title="Participant Record"
      >
        {selectedParticipant && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Student Name</span>
                <span className="font-bold text-slate-900">{selectedParticipant.studentName}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">College Email</span>
                <span className="font-medium text-slate-800">{selectedParticipant.studentEmail}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Student ID / Roll</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedParticipant.collegeStudentId}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Department</span>
                <span className="font-medium text-slate-800">{selectedParticipant.department}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Ticket Pass Code</span>
                <span className="font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  {selectedParticipant.ticketCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Attendance Status</span>
                <StatusBadge status={selectedParticipant.attendanceStatus} />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedParticipant(null)}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ParticipantManagementPage;
