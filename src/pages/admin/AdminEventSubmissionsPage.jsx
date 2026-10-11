import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { useToast } from '../../contexts/ToastContext';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  ShieldAlert,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import { formatDate, formatTime } from '../../utils/helpers';

export function AdminEventSubmissionsPage() {
  const { showToast } = useToast();

  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Action states
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [inspectEvent, setInspectEvent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadEvents = async () => {
    try {
      const list = await eventService.getAllAdminEvents();
      setEvents(list);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleApprove = async () => {
    if (!approveTarget) return;
    setActionLoading(true);
    try {
      await eventService.publishEvent(approveTarget.id);
      showToast(`Event "${approveTarget.title}" approved & published!`, 'success');
      setApproveTarget(null);
      await loadEvents();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectTarget) return;
    setActionLoading(true);
    try {
      await eventService.cancelEvent(rejectTarget.id);
      showToast(`Event "${rejectTarget.title}" rejected and marked cancelled.`, 'info');
      setRejectTarget(null);
      setRejectReason('');
      await loadEvents();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    if (filter === 'pending' && !(e.status === 'pending' || e.status === 'draft')) return false;
    if (filter === 'approved' && !(e.status === 'approved' || e.status === 'published')) return false;
    if (filter === 'rejected' && !(e.status === 'rejected' || e.status === 'cancelled')) return false;
    if (filter !== 'all' && filter !== 'pending' && filter !== 'approved' && filter !== 'rejected' && e.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const orgName = e.organizerName || e.organizerId?.name || e.organizerId?.organizationName || '';
      return (
        e.title.toLowerCase().includes(q) ||
        orgName.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
          Event Approvals & Catalog
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Review, approve, or moderate all submissions across student clubs and academic departments.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, organizer, category, or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          {[
            { id: 'all', label: `All (${events.length})` },
            { id: 'pending', label: `Pending Review (${events.filter((e) => e.status === 'pending' || e.status === 'draft').length})` },
            { id: 'approved', label: `Approved (${events.filter((e) => e.status === 'approved' || e.status === 'published').length})` },
            { id: 'rejected', label: `Rejected (${events.filter((e) => e.status === 'rejected' || e.status === 'cancelled').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                filter === tab.id
                  ? 'bg-brand-50 text-brand-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table */}
      {loading ? (
        <LoadingSpinner message="Loading events..." />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events match filter"
          description="There are no events in this status queue."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Event & Organizer</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Date & Location</th>
                  <th className="py-3.5 px-4">Registered</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Event & Organizer */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={evt.posterUrl}
                          alt={evt.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate max-w-xs">
                            {evt.title}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">
                            By {evt.organizerName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-700">{evt.category}</span>
                    </td>

                    {/* Date & Location */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">
                        {formatDate(evt.startDate)}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                        {evt.venue}
                      </div>
                    </td>

                    {/* Registered count */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">
                        {evt.registeredCount} / {evt.capacity}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={evt.status} />
                    </td>

                    {/* Moderation Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectEvent(evt)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100"
                          title="Inspect Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {(evt.status === 'pending' || evt.status === 'draft') && (
                          <button
                            onClick={() => setApproveTarget(evt)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors"
                          >
                            Approve
                          </button>
                        )}

                        {(evt.status === 'pending' || evt.status === 'draft' || evt.status === 'published' || evt.status === 'approved') && (
                          <button
                            onClick={() => setRejectTarget(evt)}
                            className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold transition-colors"
                          >
                            Reject / Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approve Confirmation */}
      <ConfirmDialog
        isOpen={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        onConfirm={handleApprove}
        title="Approve Event Submission?"
        message={`Are you sure you want to approve "${approveTarget?.title}"? It will immediately appear in the campus event catalog.`}
        confirmText="Approve & Publish"
        loading={actionLoading}
      />

      {/* Reject / Cancel Modal with Reason */}
      <Modal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Reject or Cancel Event"
      >
        <form onSubmit={handleReject} className="space-y-4 text-xs">
          <p className="text-slate-600">
            Please provide a feedback reason for cancelling "<strong>{rejectTarget?.title}</strong>":
          </p>
          <textarea
            required
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Venue scheduling conflict or safety guidelines require revision..."
            className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRejectTarget(null)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl"
            >
              {actionLoading ? 'Cancelling...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Inspect Event Modal */}
      <Modal
        isOpen={!!inspectEvent}
        onClose={() => setInspectEvent(null)}
        title="Event Submission Overview"
      >
        {inspectEvent && (
          <div className="space-y-4 text-xs">
            <img
              src={inspectEvent.posterUrl}
              alt={inspectEvent.title}
              className="w-full h-36 rounded-2xl object-cover border border-slate-200"
            />
            <div>
              <span className="text-[10px] font-bold uppercase text-brand-600">
                {inspectEvent.category}
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">{inspectEvent.title}</h4>
              <p className="text-slate-600 mt-2 leading-relaxed">{inspectEvent.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Venue</span>
                <strong className="text-slate-800">{inspectEvent.venue}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Capacity</span>
                <strong className="text-slate-800">
                  {inspectEvent.registeredCount} / {inspectEvent.capacity}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Date</span>
                <strong className="text-slate-800">{formatDate(inspectEvent.startDate)}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Organizer</span>
                <strong className="text-slate-800">{inspectEvent.organizerName}</strong>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectEvent(null)}
                className="px-5 py-2 bg-brand-600 text-white rounded-xl font-semibold"
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

export default AdminEventSubmissionsPage;
