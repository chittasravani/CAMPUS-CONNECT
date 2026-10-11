import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import EventCard from '../../components/events/EventCard';
import EventFilters from '../../components/events/EventFilters';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { CalendarSearch } from 'lucide-react';

export function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'All',
    status: searchParams.get('status') || 'All',
    dateFilter: searchParams.get('dateFilter') || 'all',
    sortBy: searchParams.get('sortBy') || 'date_asc',
  });

  const [viewMode, setViewMode] = useState('grid');
  const [events, setEvents] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state with URL params
  useEffect(() => {
    const cat = searchParams.get('category');
    const s = searchParams.get('search');
    if (cat || s) {
      setFilters((prev) => ({
        ...prev,
        category: cat || prev.category,
        search: s !== null ? s : prev.search,
      }));
    }
  }, [searchParams]);

  // Fetch filtered events whenever filters change
  useEffect(() => {
    setLoading(true);
    Promise.all([
      eventService.filterEvents(filters),
      eventService.getFavorites(),
    ])
      .then(([filteredList, favs]) => {
        setEvents(filteredList);
        setFavorites(favs);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      // Update URL search parameters
      const params = new URLSearchParams();
      if (next.search) params.set('search', next.search);
      if (next.category && next.category !== 'All') params.set('category', next.category);
      if (next.status && next.status !== 'All') params.set('status', next.status);
      if (next.dateFilter && next.dateFilter !== 'all') params.set('dateFilter', next.dateFilter);
      if (next.sortBy && next.sortBy !== 'date_asc') params.set('sortBy', next.sortBy);
      setSearchParams(params, { replace: true });
      return next;
    });
  };

  const handleResetFilters = () => {
    const initial = {
      search: '',
      category: 'All',
      status: 'All',
      dateFilter: 'all',
      sortBy: 'date_asc',
    };
    setFilters(initial);
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 flex-1">
      {/* Header Banner */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-serif">
          Discover Campus Events
        </h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1 max-w-2xl">
          Browse upcoming hackathons, athletic tournaments, symposia, and cultural fests. Filter by
          department or date and reserve your spot instantly.
        </p>
      </div>

      {/* Filter Component */}
      <EventFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalResults={events.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Events List or Grid */}
      {loading ? (
        <LoadingSpinner message="Filtering campus events..." />
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarSearch}
          title="No events match your criteria"
          description="Try broadening your search keywords, clearing category filters, or selecting 'Any Date'."
          actionText="Reset All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'
              : 'space-y-4'
          }
        >
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              viewMode={viewMode}
              isFavorite={favorites.includes(event.id)}
              onToggleFavorite={(id, state) => {
                setFavorites((prev) =>
                  state ? [...prev, id] : prev.filter((favId) => favId !== id)
                );
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default EventsPage;
