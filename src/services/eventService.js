/**
 * CampusConnect Event Service
 * Handles event CRUD, search, filtering, and organizer management.
 */

import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storage.js';
import { generateId } from '../utils/helpers.js';

export const eventService = {
  /**
   * Get all events
   */
  async getAllEvents() {
    return getFromStorage(STORAGE_KEYS.EVENTS, []);
  },

  /**
   * Get event by ID
   */
  async getEventById(id) {
    const events = getFromStorage(STORAGE_KEYS.EVENTS, []);
    const event = events.find((e) => e.id === id);
    if (!event) {
      throw new Error(`Event with ID "${id}" not found.`);
    }
    return event;
  },

  /**
   * Get featured events for homepage
   */
  async getFeaturedEvents(limit = 6) {
    const events = getFromStorage(STORAGE_KEYS.EVENTS, []);
    return events
      .filter((e) => e.status === 'published')
      .slice(0, limit);
  },

  /**
   * Get events created by specific organizer
   */
  async getEventsByOrganizer(organizerId) {
    const events = getFromStorage(STORAGE_KEYS.EVENTS, []);
    return events.filter((e) => e.organizerId === organizerId);
  },

  /**
   * Create new event
   */
  async createEvent(eventData, currentUser) {
    await new Promise((res) => setTimeout(res, 200));
    const events = getFromStorage(STORAGE_KEYS.EVENTS, []);

    // Validation
    if (!eventData.title?.trim()) throw new Error('Event title is required');
    if (!eventData.category) throw new Error('Category is required');
    if (!eventData.venue?.trim()) throw new Error('Venue is required');
    if (!eventData.startDate) throw new Error('Start date is required');
    if (!eventData.endDate) throw new Error('End date is required');
    if (new Date(eventData.endDate) <= new Date(eventData.startDate)) {
      throw new Error('End date/time must be strictly after the start date/time');
    }
    if (Number(eventData.capacity) <= 0) {
      throw new Error('Capacity must be a positive number');
    }

    const newEvent = {
      id: generateId('evt'),
      title: eventData.title.trim(),
      description: eventData.description || '',
      category: eventData.category,
      posterUrl: eventData.posterUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      organizerId: currentUser ? currentUser.id : 'user_org_1',
      organizerName: currentUser ? (currentUser.organizationName || currentUser.name) : 'Campus Organizer',
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      venue: eventData.venue.trim(),
      registrationDeadline: eventData.registrationDeadline || eventData.startDate,
      capacity: Number(eventData.capacity) || 100,
      registeredCount: 0,
      status: eventData.status || 'draft', // 'draft' or 'published'
      eligibility: eventData.eligibility || 'Open to all students',
      contactEmail: eventData.contactEmail || (currentUser ? currentUser.email : 'contact@campus.edu'),
      tags: eventData.tags || [eventData.category],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    events.unshift(newEvent);
    saveToStorage(STORAGE_KEYS.EVENTS, events);
    return newEvent;
  },

  /**
   * Update existing event
   */
  async updateEvent(id, updatedData) {
    await new Promise((res) => setTimeout(res, 200));
    const events = getFromStorage(STORAGE_KEYS.EVENTS, []);
    const index = events.findIndex((e) => e.id === id);

    if (index === -1) {
      throw new Error(`Event not found`);
    }

    if (updatedData.startDate && updatedData.endDate) {
      if (new Date(updatedData.endDate) <= new Date(updatedData.startDate)) {
        throw new Error('End date must be after start date');
      }
    }

    const updatedEvent = {
      ...events[index],
      ...updatedData,
      capacity: updatedData.capacity ? Number(updatedData.capacity) : events[index].capacity,
      updatedAt: new Date().toISOString(),
    };

    events[index] = updatedEvent;
    saveToStorage(STORAGE_KEYS.EVENTS, events);
    return updatedEvent;
  },

  /**
   * Publish a draft event
   */
  async publishEvent(id) {
    return this.updateEvent(id, { status: 'published' });
  },

  /**
   * Cancel an event
   */
  async cancelEvent(id) {
    return this.updateEvent(id, { status: 'cancelled' });
  },

  /**
   * Delete an unpublished draft event
   */
  async deleteDraft(id) {
    const events = getFromStorage(STORAGE_KEYS.EVENTS, []);
    const event = events.find((e) => e.id === id);
    if (!event) throw new Error('Event not found');
    if (event.status !== 'draft') {
      throw new Error('Only draft events can be deleted permanently');
    }

    const filtered = events.filter((e) => e.id !== id);
    saveToStorage(STORAGE_KEYS.EVENTS, filtered);
    return true;
  },

  /**
   * Delete any event (for organizer / admin event deletion)
   */
  async deleteEvent(id) {
    const events = getFromStorage(STORAGE_KEYS.EVENTS, []);
    const event = events.find((e) => e.id === id);
    if (!event) throw new Error('Event not found');

    const filtered = events.filter((e) => e.id !== id);
    saveToStorage(STORAGE_KEYS.EVENTS, filtered);
    return true;
  },

  /**
   * Search and filter events with multiple parameters
   */
  async filterEvents({
    search = '',
    category = 'All',
    status = 'All',
    dateFilter = 'all', // 'all', 'today', 'this_week', 'this_month', 'upcoming'
    sortBy = 'date_asc', // 'date_asc', 'date_desc', 'popularity', 'capacity'
  }) {
    let list = getFromStorage(STORAGE_KEYS.EVENTS, []);

    // Text search in title, description, venue, tags
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          (e.tags && e.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Category filter
    if (category && category !== 'All') {
      list = list.filter((e) => e.category.toLowerCase() === category.toLowerCase());
    }

    // Status filter
    if (status && status !== 'All') {
      if (status === 'open') {
        list = list.filter(
          (e) => e.status === 'published' && e.registeredCount < e.capacity
        );
      } else if (status === 'full') {
        list = list.filter(
          (e) => e.status === 'published' && e.registeredCount >= e.capacity
        );
      } else {
        list = list.filter((e) => e.status === status);
      }
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'today') {
      list = list.filter((e) => {
        const d = new Date(e.startDate);
        return d.toDateString() === now.toDateString();
      });
    } else if (dateFilter === 'this_week') {
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);
      list = list.filter((e) => {
        const d = new Date(e.startDate);
        return d >= now && d <= nextWeek;
      });
    } else if (dateFilter === 'upcoming') {
      list = list.filter((e) => new Date(e.startDate) >= now);
    } else if (dateFilter === 'past') {
      list = list.filter((e) => new Date(e.endDate) < now);
    }

    // Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === 'date_asc') {
        return new Date(a.startDate) - new Date(b.startDate);
      }
      if (sortBy === 'date_desc') {
        return new Date(b.startDate) - new Date(a.startDate);
      }
      if (sortBy === 'popularity') {
        return b.registeredCount - a.registeredCount;
      }
      if (sortBy === 'capacity') {
        return b.capacity - a.capacity;
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
