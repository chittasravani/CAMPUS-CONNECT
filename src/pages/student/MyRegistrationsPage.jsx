import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { registrationService } from '../../services/registrationService';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import QrTicketModal from '../../components/ui/QrTicketModal';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  Calendar,
  Ticket,
  MapPin,
  Clock,
  XCircle,
  Eye,
  CalendarX,
} from 'lucide-react';
import { formatDate, formatTime } from '../../utils/helpers';

export function MyRegistrationsPage() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [registrations, setRegistrations] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'completed', 'cancelled'
  const [loading, setLoading] = useState(true);

  // Modals & Action dialogs
  const [activeTicketReg, setActiveTicketReg] = useState(null);
  const [cancellingReg, setCancellingReg] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    if (!currentUser?.id) return;
    try {
      const list = await registrationService.getRegistrationsByStudent(currentUser.id);
      setRegistrations(list);
    } catch (err) {
      showToast(err.message || 'Error loading registrations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.id]);

  const handleCancelConfirm = async () => {
    if (!cancellingReg) return;
    setActionLoading(true);
    try {
      await registrationService.cancelRegistration(cancellingReg.id, currentUser.id);
      showToast('Registration successfully cancelled', 'info');
      setCancellingReg(null);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter registrations
  const now = new Date();
  const filteredList = registrations.filter((reg) => {
    if (filter === 'all') return true;
    if (filter === 'cancelled') return reg.status === 'cancelled';
    if (reg.status === 'cancelled') return false;
    const isUpcoming = new Date(reg.event?.startDate) >= now;
    if (filter === 'upcoming') return isUpcoming;
    if (filter === 'completed') return !isUpcoming || reg.event?.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
            My Registrations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View your event participation history, cancel registrations, and download tickets.
          </p>
        </div>

        <Link
          to="/events"
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors shadow-xs"
        >
          Explore More Events
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-brand-50 text-brand-700 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All ({registrations.length})
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors ${
            filter === 'upcoming'
              ? 'bg-brand-50 text-brand-700 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Upcoming (
          {
            registrations.filter(
              (r) => r.status === 'confirmed' && new Date(r.event?.startDate) >= now
            ).length
          }
          )
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors ${
            filter === 'completed'
              ? 'bg-brand-50 text-brand-700 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Completed (
          {
            registrations.filter(
              (r) =>
                r.status === 'confirmed' &&
                (new Date(r.event?.endDate) < now || r.event?.status === 'completed')
            ).length
          }
          )
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors ${
            filter === 'cancelled'
              ? 'bg-brand-50 text-brand-700 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Cancelled ({registrations.filter((r) => r.status === 'cancelled').length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner message="Loading registration records..." />
      ) : filteredList.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="No registrations found"
          description={`You do not have any ${filter !== 'all' ? filter : ''} event registrations.`}
          actionText="Browse Available Events"
          onAction={() => (window.location.href = '/events')}
        />
      ) : (
        <div className="space-y-4">
          {filteredList.map((reg) => {
            const isCancelled = reg.status === 'cancelled';
            const isAttended = reg.attendanceStatus === 'attended';
            const isUpcoming = !isCancelled && new Date(reg.event?.startDate) >= now;

            return (
              <div
                key={reg.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Event info */}
                <div className="flex items-start gap-4">
                  <img
                    src={reg.event?.posterUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=256&q=80'}
                    alt={reg.event?.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-slate-200"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                        {reg.event?.category}
                      </span>
                      <StatusBadge status={isCancelled ? 'cancelled' : reg.attendanceStatus} />
                    </div>

                    <Link to={`/events/${reg.eventId}`}>
                      <h3 className="text-base font-bold text-slate-900 hover:text-brand-600 transition-colors line-clamp-1">
                        {reg.event?.title}
                      </h3>
                    </Link>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(reg.event?.startDate)} at {formatTime(reg.event?.startDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {reg.event?.venue}
                      </span>
                      <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        Pass: {reg.ticketCode}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                  {/* View Ticket Pass */}
                  {!isCancelled && (
                    <button
                      onClick={() => setActiveTicketReg(reg)}
                      className="px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold border border-brand-200 transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>View Pass</span>
                    </button>
                  )}

                  {/* Cancel Button if upcoming */}
                  {isUpcoming && (
                    <button
                      onClick={() => setCancellingReg(reg)}
                      className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Modal */}
      <QrTicketModal
        isOpen={!!activeTicketReg}
        onClose={() => setActiveTicketReg(null)}
        registration={activeTicketReg}
      />

      {/* Cancellation Confirmation */}
      <ConfirmDialog
        isOpen={!!cancellingReg}
        onClose={() => setCancellingReg(null)}
        onConfirm={handleCancelConfirm}
        title="Cancel Registration?"
        message={`Are you sure you want to cancel your pass for "${cancellingReg?.event?.title}"? This cannot be undone.`}
        confirmText="Confirm Cancellation"
        isDestructive={true}
        loading={actionLoading}
      />
    </div>
  );
}

export default MyRegistrationsPage;
