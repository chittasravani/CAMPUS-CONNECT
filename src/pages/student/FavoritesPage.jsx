import React, { useState, useEffect } from 'react';
import { eventService } from '../../services/eventService';
import EventCard from '../../components/events/EventCard';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Heart, CalendarSearch } from 'lucide-react';

export function FavoritesPage() {
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    try {
      const [allEvents, favIds] = await Promise.all([
        eventService.getAllEvents(),
        eventService.getFavorites(),
      ]);
      const matched = allEvents.filter((e) => favIds.includes(e.id));
      setFavoriteEvents(matched);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleToggleFavorite = (eventId) => {
    setFavoriteEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
          Saved Events
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Events you bookmarked for later. Monitor ticket deadlines and reserve your spot.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading saved bookmarks..." />
      ) : favoriteEvents.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No saved events yet"
          description="Click the heart icon on any event card to save it to your bookmarks."
          actionText="Explore Campus Events"
          onAction={() => (window.location.href = '/events')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isFavorite={true}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoritesPage;
