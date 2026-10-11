/**
 * CampusConnect Event Service
 * Connected to Express + MongoDB backend (/api/events)
 */

import { apiRequest } from './apiClient.js';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storage.js';

const normalizeEvent = (e) => {
  if (!e) return null;
  return {
    ...e,
    id: e._id || e.id,
    _id: e._id || e.id,
    startDate: e.startDate || e.date,
    endDate: e.endDate || e.date,
    date: e.date || e.startDate,
    time: e.time || '10:00 AM',
    posterUrl: e.posterUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    registeredCount: e.registeredCount || 0,
    capacity: e.capacity || 50,
    status: e.status || 'pending',
    eligibility: e.eligibility || 'Open to all registered undergraduate and graduate students',
    contactEmail: e.contactEmail || (e.organizerId?.email || 'events@campus.edu'),
    organizerName: e.organizerName || e.organizerId?.organizationName || e.organizerId?.name || 'Campus Organizer',
  };
};

export const eventService = {
  /**
   * Get all approved events from backend
   */
  async getAllEvents() {
    try {
      const res = await apiRequest('/events');
      if (res?.data?.events && res.data.events.length > 0) {
        return res.data.events.map(normalizeEvent);
      }
    } catch (err) {
      console.warn('Backend events fetch fallback to storage:', err.message);
    }
    // Fallback to storage mock events if backend has no events yet
    const storageEvents = getFromStorage(STORAGE_KEYS.EVENTS, []);
    return storageEvents.map(normalizeEvent);
  },

  /**
   * Get event by ID from backend
   */
  async getEventById(id) {
    try {
      const res = await apiRequest(`/events/${id}`);
      if (res?.data?.event) {
        return normalizeEvent(res.data.event);
      }
    } catch (err) {
      console.warn('Backend event details fetch fallback to storage:', err.message);
    }

    // Fallback to local storage if legacy ID or network offline
    const events = getFromStorage(STORAGE_KEYS.EVENTS, []);
    const event = events.find((e) => e.id === id || e._id === id);
    if (!event) {
      throw new Error(`Event with ID "${id}" not found.`);
    }
    return normalizeEvent(event);
  },

  /**
   * Get featured events for homepage
   */
  async getFeaturedEvents(limit = 6) {
    const events = await this.getAllEvents();
    return events.slice(0, limit);
  },

  /**
   * Get events created by specific organizer from backend API
   */
  async getEventsByOrganizer(organizerId) {
    try {
      const res = await apiRequest('/events/my');
      if (res?.data?.events) {
        return res.data.events.map(normalizeEvent);
      }
    } catch (err) {
      console.warn('Backend /events/my fetch fallback:', err.message);
    }

    // Fallback if not authenticated or offline
    const all = await this.getAllEvents();
    return all.filter(
      (e) => e.organizerId === organizerId || e.organizerId?._id === organizerId || e.organizerId?.id === organizerId
    );
  },

  /**
   * Get all events across all organizers for Admin review (including pending/rejected)
   */
  async getAllAdminEvents() {
    try {
      const res = await apiRequest('/events/all');
      if (res?.data?.events) {
        return res.data.events.map(normalizeEvent);
      }
    } catch (err) {
      console.warn('Backend /events/all fetch fallback:', err.message);
    }

    return this.getAllEvents();
  },

  /**
   * Create new event via backend API
   */
  async createEvent(eventData, currentUser) {
    if (!eventData.title?.trim()) throw new Error('Event title is required');
    if (!eventData.category) throw new Error('Category is required');
    if (!eventData.venue?.trim()) throw new Error('Venue is required');
    if (!eventData.startDate && !eventData.date) throw new Error('Date is required');

    let timeStr = eventData.time;
    if (!timeStr && eventData.startDate) {
      try {
        const d = new Date(eventData.startDate);
        timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        timeStr = '10:00 AM';
      }
    }

    const payload = {
      title: eventData.title.trim(),
      description: eventData.description || eventData.title,
      category: eventData.category,
      date: eventData.startDate || eventData.date,
      time: timeStr || '10:00 AM',
      venue: eventData.venue.trim(),
      capacity: Number(eventData.capacity) || 50,
      posterUrl: eventData.posterUrl,
      endDate: eventData.endDate,
      eligibility: eventData.eligibility,
      contactEmail: eventData.contactEmail,
    };

    try {
      const res = await apiRequest('/events', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res?.data?.event) {
        return normalizeEvent(res.data.event);
      }
    } catch (err) {
      // If backend reports an error, rethrow directly
      throw err;
    }

    throw new Error('Failed to create event on server');
  },

  /**
   * Update existing event via backend API
   */
  async updateEvent(id, updatedData) {
    const payload = {
      ...(updatedData.title ? { title: updatedData.title.trim() } : {}),
      ...(updatedData.description ? { description: updatedData.description } : {}),
      ...(updatedData.category ? { category: updatedData.category } : {}),
      ...(updatedData.startDate || updatedData.date ? { date: updatedData.startDate || updatedData.date } : {}),
      ...(updatedData.time ? { time: updatedData.time } : {}),
      ...(updatedData.venue ? { venue: updatedData.venue.trim() } : {}),
      ...(updatedData.capacity ? { capacity: Number(updatedData.capacity) } : {}),
      ...(updatedData.status ? { status: updatedData.status } : {}),
      ...(updatedData.posterUrl ? { posterUrl: updatedData.posterUrl } : {}),
      ...(updatedData.endDate ? { endDate: updatedData.endDate } : {}),
      ...(updatedData.eligibility ? { eligibility: updatedData.eligibility } : {}),
      ...(updatedData.contactEmail ? { contactEmail: updatedData.contactEmail } : {}),
    };

    try {
      const res = await apiRequest(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (res?.data?.event) {
        return normalizeEvent(res.data.event);
      }
    } catch (err) {
      throw err;
    }

    throw new Error('Failed to update event on server');
  },

  /**
   * Publish a draft event
   */
  async publishEvent(id) {
    return this.updateEvent(id, { status: 'approved' });
  },

  /**
   * Cancel an event
   */
  async cancelEvent(id) {
    return this.updateEvent(id, { status: 'rejected' });
  },

  /**
   * Delete event via backend API
   */
  async deleteEvent(id) {
    try {
      await apiRequest(`/events/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (err) {
      throw err;
    }
  },

  /**
   * Delete draft
   */
  async deleteDraft(id) {
    return this.deleteEvent(id);
  },

  /**
   * Search and filter events
   */
  async filterEvents({
    search = '',
    category = 'All',
    status = 'All',
    dateFilter = 'all',
    sortBy = 'date_asc',
  }) {
    let list = await this.getAllEvents();

    // Text search
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (category && category !== 'All') {
      list = list.filter((e) => e.category.toLowerCase() === category.toLowerCase());
    }

    // Status filter
    if (status && status !== 'All') {
      if (status === 'open') {
        list = list.filter((e) => e.registeredCount < e.capacity);
      } else if (status === 'full') {
        list = list.filter((e) => e.registeredCount >= e.capacity);
      }
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'today') {
      list = list.filter((e) => {
        const d = new Date(e.startDate || e.date);
        return d.toDateString() === now.toDateString();
      });
    } else if (dateFilter === 'this_week') {
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);
      list = list.filter((e) => {
        const d = new Date(e.startDate || e.date);
        return d >= now && d <= nextWeek;
      });
    } else if (dateFilter === 'upcoming') {
      list = list.filter((e) => new Date(e.startDate || e.date) >= now);
    } else if (dateFilter === 'past') {
      list = list.filter((e) => new Date(e.startDate || e.date) < now);
    }

    // Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === 'date_asc') {
        return new Date(a.startDate || a.date) - new Date(b.startDate || b.date);
      }
      if (sortBy === 'date_desc') {
        return new Date(b.startDate || b.date) - new Date(a.startDate || a.date);
      }
      if (sortBy === 'popularity') {
        return (b.registeredCount || 0) - (a.registeredCount || 0);
      }
      if (sortBy === 'capacity') {
        return (b.capacity || 0) - (a.capacity || 0);
      }
      return 0;
    });

    return list;
  },

  /**
   * Favorites management
   */
  async getFavorites() {
    return getFromStorage(STORAGE_KEYS.FAVORITES, []);
  },

  async toggleFavorite(eventId) {
    const favs = getFromStorage(STORAGE_KEYS.FAVORITES, []);
    let updated;
    if (favs.includes(eventId)) {
      updated = favs.filter((id) => id !== eventId);
    } else {
      updated = [...favs, eventId];
    }
    saveToStorage(STORAGE_KEYS.FAVORITES, updated);
    return updated;
  },
};

export default eventService;
