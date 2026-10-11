import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Heart, ArrowRight, Tag } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { formatDate, formatTime } from '../../utils/helpers';
import { eventService } from '../../services/eventService';
import { useToast } from '../../contexts/ToastContext';

export function EventCard({
  event,
  viewMode = 'grid',
  isFavorite = false,
  onToggleFavorite,
}) {
  const { showToast } = useToast();
  const [imgError, setImgError] = useState(false);
  const [favoriteState, setFavoriteState] = useState(isFavorite);

  if (!event) return null;

  const fallbackPoster = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';

  const isFull = event.registeredCount >= event.capacity;
  const spotsLeft = Math.max(0, event.capacity - event.registeredCount);
  const percentFilled = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await eventService.toggleFavorite(event.id);
      const nextState = !favoriteState;
      setFavoriteState(nextState);
      if (onToggleFavorite) onToggleFavorite(event.id, nextState);
      showToast(nextState ? `Saved "${event.title}" to favorites` : `Removed from favorites`, 'info', 2000);
    } catch {
      // ignore
    }
  };

  // Category badge colors
  const categoryColors = {
    Technical: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Cultural: 'bg-violet-50 text-violet-700 border-violet-200',
    Sports: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Workshops: 'bg-amber-50 text-amber-700 border-amber-200',
    Seminars: 'bg-blue-50 text-blue-700 border-blue-200',
    Competitions: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const catStyle = categoryColors[event.category] || 'bg-slate-100 text-slate-700 border-slate-200';

  // LIST VIEW LAYOUT
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden flex flex-col md:flex-row group">
        {/* Poster */}
        <div className="md:w-64 h-48 md:h-auto shrink-0 relative overflow-hidden bg-slate-100">
          <img
            src={imgError ? fallbackPoster : event.posterUrl || fallbackPoster}
            alt={event.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-xs text-slate-600 hover:text-rose-500 shadow-sm transition-colors"
            aria-label="Save event"
          >
            <Heart className={`w-4 h-4 ${favoriteState ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${catStyle}`}>
                {event.category}
              </span>
              <StatusBadge status={isFull ? 'full' : event.status} />
            </div>

            <Link to={`/events/${event.id}`}>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                {event.title}
              </h3>
            </Link>

            <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 mt-1 mb-4 leading-relaxed">
              {event.description}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-brand-600" />
                {formatDate(event.startDate)} • {formatTime(event.startDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {event.venue}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {isFull ? (
                  <span className="text-purple-600 font-semibold">Capacity Full</span>
                ) : (
                  <span>{spotsLeft} seats left</span>
                )}
              </span>
            </div>

            <Link
              to={`/events/${event.id}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800 transition-colors"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // GRID VIEW LAYOUT (DEFAULT)
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden flex flex-col group h-full">
      {/* Poster Image */}
      <div className="relative h-48 overflow-hidden bg-slate-100 shrink-0">
        <img
          src={imgError ? fallbackPoster : event.posterUrl || fallbackPoster}
          alt={event.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-xs border ${catStyle}`}>
            {event.category}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-xs text-slate-600 hover:text-rose-500 shadow-sm transition-colors"
          aria-label="Save event"
        >
          <Heart className={`w-4 h-4 ${favoriteState ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Date Overlay Badge */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-brand-300" />
          <span>{formatDate(event.startDate)}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs text-slate-400 font-medium truncate">
              By {event.organizerName || 'Campus Committee'}
            </span>
            <StatusBadge status={isFull ? 'full' : event.status} />
          </div>

          <Link to={`/events/${event.id}`}>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
              {event.title}
            </h3>
          </Link>

          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Card Footer */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1 truncate max-w-[160px]" title={event.venue}>
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {isFull ? (
                <span className="text-purple-600 font-semibold">Full</span>
              ) : (
                <span>{spotsLeft} left</span>
              )}
            </span>
          </div>

          {/* Capacity Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isFull ? 'bg-purple-500' : percentFilled > 80 ? 'bg-amber-500' : 'bg-brand-500'
              }`}
              style={{ width: `${percentFilled}%` }}
            />
          </div>

          <Link
            to={`/events/${event.id}`}
            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-brand-600 text-slate-700 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 group-hover:bg-brand-600 group-hover:text-white shadow-xs"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EventCard;
