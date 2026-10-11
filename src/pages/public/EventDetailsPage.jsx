import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { eventService } from '../../services/eventService';
import { registrationService } from '../../services/registrationService';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Modal from '../../components/ui/Modal';
import QrTicketModal from '../../components/ui/QrTicketModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EventCard from '../../components/events/EventCard';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Mail,
  ShieldCheck,
  Share2,
  Ticket,
  AlertTriangle,
  CheckCircle2,
  Hourglass,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { formatDate, formatDateTime, formatTime, getRelativeTime } from '../../utils/helpers';

export function EventDetailsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, isStudent } = useAuth();
  const { showToast } = useToast();

  const [event, setEvent] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Registration & User state for this event
  const [isRegistered, setIsRegistered] = useState(false);
  const [studentRegistration, setStudentRegistration] = useState(null);

  // Dialog & Modal states
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadEventData = async () => {
    try {
      const evt = await eventService.getEventById(eventId);
      setEvent(evt);

      // Load related events
      const all = await eventService.getAllEvents();
      const related = all.filter((e) => e.category === evt.category && e.id !== evt.id).slice(0, 3);
      setRelatedEvents(related);

      // If user is student, check registration status
      if (currentUser?.id) {
        const studentRegs = await registrationService.getRegistrationsByStudent(currentUser.id);
        const matchReg = studentRegs.find((r) => r.eventId === eventId && r.status === 'confirmed');
        setIsRegistered(!!matchReg);
        setStudentRegistration(matchReg || null);
      }
    } catch (err) {
      showToast(err.message || 'Error loading event', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadEventData();
  }, [eventId, currentUser?.id]);

  if (loading) {
    return <LoadingSpinner message="Loading event information..." className="py-20" />;
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Event Not Found</h2>
        <p className="text-slate-500 mt-2">The event you are looking for does not exist or has been removed.</p>
        <Link to="/events" className="mt-4 inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold">
          Back to Events
        </Link>
      </div>
    );
  }

  const isFull = event.registeredCount >= event.capacity;
  const spotsLeft = Math.max(0, event.capacity - event.registeredCount);
  const percentFilled = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));
  const isPast = new Date(event.endDate) < new Date() || event.status === 'completed';
  const isDeadlinePassed = event.registrationDeadline && new Date(event.registrationDeadline) < new Date();

  // Registration handler
  const handleRegister = async () => {
    if (!isAuthenticated) {
      showToast('Please log in as a student to register.', 'warning');
      navigate('/login');
      return;
    }

    if (!isStudent) {
      showToast('Only student accounts can register for campus events. Switch role above.', 'warning');
      return;
    }

    setActionLoading(true);
    try {
      const newReg = await registrationService.registerForEvent(event.id, currentUser);
      showToast(`Registration confirmed! Digital pass ${newReg.ticketCode} issued.`, 'success');
      await loadEventData();
      setShowTicketModal(true);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel registration handler
  const handleCancelRegistration = async () => {
    if (!studentRegistration) return;
    setActionLoading(true);
    try {
      await registrationService.cancelRegistration(studentRegistration.id, currentUser.id);
      showToast('Your registration has been cancelled.', 'info');
      setShowCancelConfirm(false);
      await loadEventData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Event link copied to clipboard!', 'success');
    setShowShareModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Back button */}
      <div>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>
      </div>

      {/* Main Grid: Details (Left) + Registration Action Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column (8 cols): Poster + Detailed Overview */}
        <div className="lg:col-span-8 space-y-8">
          {/* Large Hero Poster */}
          <div className="relative rounded-3xl overflow-hidden shadow-card border border-slate-200/80 max-h-[460px] bg-slate-900">
            <img
              src={event.posterUrl}
              alt={event.title}
              className="w-full h-full object-cover max-h-[460px]"
            />
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-brand-700 shadow-sm border border-slate-200">
                {event.category}
              </span>
              <StatusBadge status={isFull ? 'full' : event.status} className="shadow-sm" />
            </div>

            <button
              onClick={() => setShowShareModal(true)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-xs text-slate-700 hover:text-brand-600 shadow-sm transition-colors"
              title="Share Event"
              aria-label="Share Event"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Event Header Information */}
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-serif leading-tight">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600">
              <span className="flex items-center gap-1.5 font-medium text-slate-800">
                <Users className="w-4 h-4 text-brand-600" />
                Organized by {event.organizerName}
              </span>
              <span>•</span>
              <span className="text-slate-500">Contact: {event.contactEmail}</span>
            </div>
          </div>

          {/* Key Schedule and Location Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Date & Time</div>
                <div className="text-sm font-bold text-slate-800 mt-0.5">
                  {formatDate(event.startDate)}
                </div>
                <div className="text-xs text-slate-500">
                  {formatTime(event.startDate)} - {formatTime(event.endDate)}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-violet-50 text-accent-600 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Venue Location</div>
                <div className="text-sm font-bold text-slate-800 mt-0.5">{event.venue}</div>
                <div className="text-xs text-slate-500">Main Campus Grounds</div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
            <h3 className="text-lg font-bold text-slate-900">About This Event</h3>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3 whitespace-pre-line">
              <p>{event.description}</p>
              <p>
                All participants are requested to arrive at least 15 minutes before the scheduled start time. Ensure you have your digital QR ticket ready on your mobile device or printed for seamless check-in at the entrance.
              </p>
            </div>

            {/* Eligibility & Guidelines */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Eligibility & Rules
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {event.eligibility || 'Open to all registered undergraduate and graduate students with active ID.'}
              </p>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Registration Card & Status Controls */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Participation Pass
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {event.status === 'cancelled'
                  ? 'Event Cancelled'
                  : isPast
                  ? 'Event Concluded'
                  : 'Free Student Entry'}
              </div>
            </div>

            {/* Capacity Meter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">Reserved Spots</span>
                <span className="text-slate-900">
                  {event.registeredCount} / {event.capacity}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isFull ? 'bg-purple-600' : percentFilled > 80 ? 'bg-amber-500' : 'bg-brand-600'
                  }`}
                  style={{ width: `${percentFilled}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{isFull ? '0 spots remaining' : `${spotsLeft} seats remaining`}</span>
                <span>{percentFilled}% full</span>
              </div>
            </div>

            {/* Deadline Banner */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
              <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Hourglass className="w-3.5 h-3.5 text-brand-600" />
                <span>Registration Deadline</span>
              </div>
              <div className="text-slate-500">
                {formatDateTime(event.registrationDeadline)} ({getRelativeTime(event.registrationDeadline)})
              </div>
            </div>

            {/* Interactive Registration States */}
            <div className="space-y-3">
              {/* State 1: Already Registered */}
              {isRegistered ? (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>You are registered for this event!</span>
                  </div>

                  <button
                    onClick={() => setShowTicketModal(true)}
                    className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>View Digital Ticket (QR)</span>
                  </button>

                  {!isPast && (
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="w-full py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      Cancel Registration
                    </button>
                  )}
                </div>
              ) : event.status === 'cancelled' ? (
                /* State 2: Cancelled */
                <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-semibold text-center">
                  This event has been cancelled by the organizer.
                </div>
              ) : isPast ? (
                /* State 3: Concluded */
                <div className="p-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold text-center">
                  This event has concluded.
                </div>
              ) : isDeadlinePassed ? (
                /* State 4: Deadline Passed */
                <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold text-center">
                  Registration deadline has passed.
                </div>
              ) : isFull ? (
                /* State 5: Full */
                <div className="p-3 bg-purple-50 text-purple-800 border border-purple-200 rounded-xl text-xs font-semibold text-center">
                  Event is currently at maximum capacity.
                </div>
              ) : (
                /* State 6: Open for Registration */
                <button
                  onClick={handleRegister}
                  disabled={actionLoading}
                  className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 hover:shadow-brand-500/35 transition-all flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{actionLoading ? 'Reserving...' : 'Register for Event'}</span>
                </button>
              )}
            </div>

            {/* Quick Share action */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowShareModal(true)}
                className="w-full py-2 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share with Classmates</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Events Section */}
      {relatedEvents.length > 0 && (
        <section className="pt-8 border-t border-slate-200/80 space-y-6">
          <h3 className="text-xl font-bold text-slate-900 font-serif">
            More Events in {event.category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedEvents.map((rel) => (
              <EventCard key={rel.id} event={rel} />
            ))}
          </div>
        </section>
      )}

      {/* MODALS */}
      {/* 1. Cancellation Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancelRegistration}
        title="Cancel Event Registration?"
        message={`Are you sure you want to cancel your registration for "${event.title}"? Your reserved seat will be released.`}
        confirmText="Yes, Cancel Registration"
        isDestructive={true}
        loading={actionLoading}
      />

      {/* 2. QR Digital Ticket Modal */}
      <QrTicketModal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        registration={
          studentRegistration
            ? { ...studentRegistration, event }
            : null
        }
      />

      {/* 3. Share Event Modal */}
      <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Share Event">
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Share this link with your classmates, clubs, and department groups:
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={window.location.href}
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shrink-0"
            >
              Copy Link
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default EventDetailsPage;
