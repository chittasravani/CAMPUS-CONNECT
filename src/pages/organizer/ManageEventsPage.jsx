import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { eventService } from '../../services/eventService';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  Calendar,
  PlusCircle,
  Search,
  Edit3,
  Users,
  Eye,
  Trash2,
  XCircle,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { formatDate, formatTime } from '../../utils/helpers';

export function ManageEventsPage() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Confirm dialogs
  const [cancelTarget, setCancelTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadEvents = async () => {
    const orgId = currentUser?.id || currentUser?._id;
    if (!orgId) return;
    try {
      const list = await eventService.getEventsByOrganizer(orgId);
      setEvents(list);
    } catch (err) {
      showToast(err.message || 'Error loading events', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [currentUser?.id, currentUser?._id]);

  const handlePublish = async (id, title) => {
    try {
      await eventService.publishEvent(id);
      showToast(`"${title}" published to campus feed!`, 'success');
      await loadEvents();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setActionLoading(true);
    try {
      await eventService.cancelEvent(cancelTarget.id);
      showToast(`Event "${cancelTarget.title}" has been cancelled.`, 'info');
      setCancelTarget(null);
      await loadEvents();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await eventService.deleteEvent(deleteTarget.id);
      showToast('Event permanently deleted.', 'info');
      setDeleteTarget(null);
      await loadEvents();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter events
  const filteredEvents = events.filter((e) => {
    if (filter === 'pending' && !(e.status === 'pending' || e.status === 'draft')) return false;
    if (filter === 'published' && !(e.status === 'published' || e.status === 'approved')) return false;
    if (filter === 'draft' && !(e.status === 'draft' || e.status === 'pending')) return false;
    if (filter === 'cancelled' && !(e.status === 'cancelled' || e.status === 'rejected')) return false;
    if (filter !== 'all' && filter !== 'pending' && filter !== 'published' && filter !== 'draft' && filter !== 'cancelled' && e.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return (
        e.title.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
            Manage Events
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create, edit, publish, and monitor events organized by your department or club.
          </p>
        </div>

        <Link
          to="/organizer/events/new"
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Event</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by event title, category, or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-brand-50 text-brand-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({events.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'pending'
                ? 'bg-brand-50 text-brand-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({events.filter((e) => e.status === 'pending' || e.status === 'draft').length})
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'published'
                ? 'bg-brand-50 text-brand-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Approved ({events.filter((e) => e.status === 'published' || e.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'cancelled'
                ? 'bg-brand-50 text-brand-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rejected ({events.filter((e) => e.status === 'cancelled' || e.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Events List Table */}
      {loading ? (
        <LoadingSpinner message="Loading events..." />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events found"
          description="You do not have any events matching your selected status and filter."
          actionText="Create New Event"
          onAction={() => navigate('/organizer/events/new')}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Event Details</th>
                  <th className="py-3.5 px-4">Date & Venue</th>
                  <th className="py-3.5 px-4">Capacity Meter</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((evt) => {
                  const percent = Math.min(
                    100,
                    Math.round((evt.registeredCount / evt.capacity) * 100)
                  );
                  return (
                    <tr key={evt.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Event Details */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={evt.posterUrl}
                            alt={evt.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-brand-600 uppercase">
                              {evt.category}
                            </span>
                            <div className="font-bold text-slate-900 truncate max-w-xs sm:max-w-sm">
                              {evt.title}
                            </div>
                            <span className="text-[11px] text-slate-400">ID: {evt.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Date & Venue */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">
                          {formatDate(evt.startDate)}
                        </div>
                        <div className="text-slate-500 text-[11px] truncate max-w-[150px]">
                          {evt.venue}
                        </div>
                      </td>

                      {/* Capacity */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 mb-1">
                          {evt.registeredCount} / {evt.capacity} ({percent}%)
                        </div>
                        <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-brand-600 h-full rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={evt.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details */}
                          <Link
                            to={`/events/${evt.id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                            title="Public Event Page"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* Registrations roster */}
                          <Link
                            to={`/organizer/registrations?eventId=${evt.id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                            title="Attendee Roster"
                          >
                            <Users className="w-4 h-4" />
                          </Link>

                          {/* Edit */}
                          <Link
                            to={`/organizer/events/${evt.id}/edit`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                            title="Edit Event"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          {/* Publish Draft */}
                          {evt.status === 'draft' && (
                            <button
                              onClick={() => handlePublish(evt.id, evt.title)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors"
                              title="Publish Draft to Feed"
                            >
                              Publish
                            </button>
                          )}

                          {/* Cancel Published or Pending Event */}
                          {(evt.status === 'published' || evt.status === 'approved' || evt.status === 'pending') && (
                            <button
                              onClick={() => setCancelTarget(evt)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Cancel / Withdraw Event"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Event */}
                          <button
                            onClick={() => setDeleteTarget(evt)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
        title="Cancel This Event?"
        message={`Are you sure you want to cancel "${cancelTarget?.title}"? Registered participants will receive a notification.`}
        confirmText="Confirm Cancellation"
        isDestructive={true}
        loading={actionLoading}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Permanently Delete Event?"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This action cannot be reversed.`}
        confirmText="Delete Event"
        isDestructive={true}
        loading={actionLoading}
      />
    </div>
  );
}

export default ManageEventsPage;
