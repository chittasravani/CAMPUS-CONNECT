import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { eventService } from '../../services/eventService';
import FormInput from '../../components/ui/FormInput';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Image,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { EVENT_CATEGORIES } from '../../data/seedData';
import { getRelativeDate } from '../../utils/helpers';

export function EventFormPage() {
  const { eventId } = useParams();
  const isEditing = !!eventId;
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    posterUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    startDate: getRelativeDate(5, 10, 0).slice(0, 16),
    endDate: getRelativeDate(5, 17, 0).slice(0, 16),
    venue: '',
    registrationDeadline: getRelativeDate(4, 23, 59).slice(0, 16),
    capacity: 100,
    eligibility: 'Open to all registered undergraduate and graduate students',
    contactEmail: currentUser?.email || 'events@campus.edu',
    status: 'pending', // 'pending', 'published', or 'draft'
  });

  const [errors, setErrors] = useState({});

  // Preset Poster Banners for fast creation
  const posterPresets = [
    { label: 'Coding / Tech', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Music / Festival', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Sports / Turf', url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Design / Workshop', url: 'https://images.unsplash.com/photo-1581291518655-9523c932694b?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Auditorium / Seminar', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80' },
  ];

  // Load existing event data if editing
  useEffect(() => {
    if (isEditing) {
      eventService
        .getEventById(eventId)
        .then((evt) => {
          setFormData({
            title: evt.title || '',
            description: evt.description || '',
            category: evt.category || 'Technical',
            posterUrl: evt.posterUrl || '',
            startDate: evt.startDate ? evt.startDate.slice(0, 16) : '',
            endDate: evt.endDate ? evt.endDate.slice(0, 16) : '',
            venue: evt.venue || '',
            registrationDeadline: evt.registrationDeadline
              ? evt.registrationDeadline.slice(0, 16)
              : '',
            capacity: evt.capacity || 100,
            eligibility: evt.eligibility || '',
            contactEmail: evt.contactEmail || currentUser?.email || '',
            status: evt.status || 'published',
          });
        })
        .catch((err) => {
          showToast(err.message, 'error');
          navigate('/organizer/events');
        })
        .finally(() => setLoading(false));
    }
  }, [eventId, isEditing]);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Event title is required';
    if (!formData.venue.trim()) errs.venue = 'Venue location is required';
    if (!formData.startDate) errs.startDate = 'Start date and time is required';
    if (!formData.endDate) errs.endDate = 'End date and time is required';

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        errs.endDate = 'End time must be strictly after the start time';
      }
    }

    if (formData.registrationDeadline && formData.startDate) {
      if (new Date(formData.registrationDeadline) > new Date(formData.startDate)) {
        errs.registrationDeadline = 'Registration deadline must be before or at event start';
      }
    }

    if (!formData.capacity || Number(formData.capacity) <= 0) {
      errs.capacity = 'Capacity must be a positive number greater than 0';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please correct the highlighted form errors', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await eventService.updateEvent(eventId, formData);
        showToast(`Event "${formData.title}" updated successfully!`, 'success');
      } else {
        await eventService.createEvent(formData, currentUser);
        showToast(`Event "${formData.title}" created successfully!`, 'success');
      }
      navigate('/organizer/events');
    } catch (err) {
      showToast(err.message || 'Error saving event', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading event editor..." className="py-20" />;
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/organizer/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Manage Events</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
          {isEditing ? 'Edit Campus Event' : 'Create New Campus Event'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {isEditing
            ? 'Update schedule, venue, capacity, or publishing status for this event.'
            : 'Fill in event details to publish to the campus calendar or save as a draft.'}
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Basic Details
            </h3>

            <FormInput
              label="Event Title"
              id="evt-title"
              required
              placeholder="e.g. HackCampus 2026: National AI Hackathon"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={errors.title}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="evt-cat" className="text-sm font-semibold text-slate-700 block mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  id="evt-cat"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
                >
                  {EVENT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="evt-status" className="text-sm font-semibold text-slate-700 block mb-1.5">
                  Publishing Status
                </label>
                <select
                  id="evt-status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
                >
                  <option value="pending">Submit for Admin Approval (Pending)</option>
                  <option value="published">Published / Approved</option>
                  <option value="draft">Draft (Private)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="evt-desc" className="text-sm font-semibold text-slate-700 block mb-1.5">
                Description & Agenda
              </label>
              <textarea
                id="evt-desc"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the event format, schedule, rules, speakers, and what students will gain..."
                className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
              />
            </div>
          </div>

          {/* Section 2: Poster Image */}
          <div className="border-t border-slate-100 pt-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Event Banner Poster
            </h3>

            <FormInput
              label="Poster Image URL"
              id="evt-poster"
              placeholder="https://images.unsplash.com/..."
              value={formData.posterUrl}
              onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
              helperText="Paste any image URL or click a pre-curated campus stock banner below"
            />

            <div>
              <span className="text-xs text-slate-500 block mb-1.5 font-medium">Quick Presets:</span>
              <div className="flex flex-wrap gap-2">
                {posterPresets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, posterUrl: p.url })}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      formData.posterUrl === p.url
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {formData.posterUrl && (
              <div className="mt-2 rounded-2xl overflow-hidden max-h-40 border border-slate-200">
                <img
                  src={formData.posterUrl}
                  alt="Poster Preview"
                  className="w-full h-40 object-cover"
                />
              </div>
            )}
          </div>

          {/* Section 3: Schedule & Venue */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Schedule & Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Start Date & Time"
                id="evt-start"
                type="datetime-local"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                error={errors.startDate}
              />

              <FormInput
                label="End Date & Time"
                id="evt-end"
                type="datetime-local"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                error={errors.endDate}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Venue / Room"
                id="evt-venue"
                required
                placeholder="e.g. Central Auditorium / Design Studio Lab 3"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                error={errors.venue}
              />

              <FormInput
                label="Registration Deadline"
                id="evt-deadline"
                type="datetime-local"
                value={formData.registrationDeadline}
                onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                error={errors.registrationDeadline}
                helperText="Registrations automatically close after this time"
              />
            </div>
          </div>

          {/* Section 4: Capacity & Participation Rules */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Capacity & Rules
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Maximum Participant Capacity"
                id="evt-capacity"
                type="number"
                min="1"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                error={errors.capacity}
                helperText="When reached, waitlist mode triggers automatically"
              />

              <FormInput
                label="Contact Email"
                id="evt-contact"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>

            <FormInput
              label="Eligibility & Requirements"
              id="evt-eligibility"
              value={formData.eligibility}
              onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
              placeholder="e.g. Laptops required with free Figma account installed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <Link
              to="/organizer/events"
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
            >
              {submitting
                ? 'Saving Event...'
                : isEditing
                ? 'Update Event'
                : 'Publish Event to Campus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventFormPage;
