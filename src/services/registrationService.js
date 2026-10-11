/**
 * CampusConnect Registration Service
 * Connected to Express + MongoDB backend (/api/registrations)
 */

import { apiRequest } from './apiClient.js';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storage.js';
import { generateTicketCode } from '../utils/helpers.js';

const normalizeRegistration = (r) => {
  if (!r) return null;
  const evt = r.eventId && typeof r.eventId === 'object' ? r.eventId : null;

  const eventObj = evt
    ? {
        ...evt,
        id: evt._id || evt.id,
        _id: evt._id || evt.id,
        startDate: evt.date || evt.startDate,
        endDate: evt.date || evt.endDate,
        date: evt.date || evt.startDate,
        time: evt.time || '10:00 AM',
        posterUrl:
          evt.posterUrl ||
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
        capacity: evt.capacity || 50,
        registeredCount: evt.registeredCount || 0,
      }
    : {
        id: typeof r.eventId === 'string' ? r.eventId : 'unknown',
        title: 'Campus Event',
        category: 'General',
        venue: 'Campus Venue',
        startDate: new Date().toISOString(),
        posterUrl:
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
      };

  const regId = r._id || r.id;
  const ticketCode =
    r.ticketCode || `CC-TKT-${String(regId).slice(-6).toUpperCase()}`;

  return {
    ...r,
    id: regId,
    _id: regId,
    eventId: evt ? (evt._id || evt.id) : r.eventId,
    status: r.status === 'registered' ? 'confirmed' : r.status,
    rawStatus: r.status,
    registrationDate: r.registrationDate || r.createdAt || new Date().toISOString(),
    ticketCode,
    event: eventObj,
  };
};

export const registrationService = {
  /**
   * Get registrations for a specific student from backend
   */
  async getRegistrationsByStudent(studentId) {
    try {
      const res = await apiRequest('/registrations/my');
      if (res?.data?.registrations) {
        return res.data.registrations.map(normalizeRegistration);
      }
    } catch (err) {
      console.warn('Backend registrations fetch fallback to storage:', err.message);
    }

    // Fallback to storage for demo mock registrations
    const registrations = getFromStorage(STORAGE_KEYS.REGISTRATIONS, []);
    const events = getFromStorage(STORAGE_KEYS.EVENTS, []);

    return registrations
      .filter((r) => r.studentId === studentId)
      .map((r) => {
        const event = events.find((e) => e.id === r.eventId || e._id === r.eventId);
        return {
          ...r,
          event: event || {
            title: 'Campus Event',
            category: 'General',
            venue: 'Main Campus',
            startDate: new Date().toISOString(),
          },
        };
      })
      .map(normalizeRegistration)
      .sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
  },

  /**
   * Check if student is registered for event
   */
  async isStudentRegistered(eventId, studentId) {
    const registrations = await this.getRegistrationsByStudent(studentId);
    return registrations.some(
      (r) =>
        (r.eventId === eventId || r.event?.id === eventId || r.event?._id === eventId) &&
        (r.status === 'confirmed' || r.status === 'registered')
    );
  },

  /**
   * Register a student for an event via backend API
   */
  async registerForEvent(eventId, studentUser) {
    if (!studentUser) {
      throw new Error('You must be logged in as a student to register.');
    }

    try {
      const res = await apiRequest('/registrations', {
        method: 'POST',
        body: JSON.stringify({ eventId }),
      });

      if (res?.data?.registration) {
        const normalized = normalizeRegistration(res.data.registration);

        // Also add a local notification for the student
        const notifs = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
        notifs.unshift({
          id: `notif_${Date.now()}`,
          userId: studentUser.id || studentUser._id,
          title: 'Registration Confirmed 🎟️',
          message: `You are registered for event. Ticket: ${normalized.ticketCode}.`,
          type: 'success',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
        saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);

        return normalized;
      }
    } catch (err) {
      throw err;
    }

    throw new Error('Failed to register for event');
  },

  /**
   * Cancel an existing registration via backend API
   */
  async cancelRegistration(registrationId, studentId) {
    try {
      const res = await apiRequest(`/registrations/${registrationId}`, {
        method: 'DELETE',
      });
      return true;
    } catch (err) {
      throw err;
    }
  },

  /**
   * Get all registrations (organizers / admin)
   */
  async getAllRegistrations() {
    return getFromStorage(STORAGE_KEYS.REGISTRATIONS, []);
  },

  /**
   * Get registrations for a specific event
   */
  async getRegistrationsByEvent(eventId) {
    const registrations = getFromStorage(STORAGE_KEYS.REGISTRATIONS, []);
    return registrations.filter((r) => r.eventId === eventId);
  },

  /**
   * Get single registration by ticket code
   */
  async getRegistrationByTicketCode(ticketCode) {
    const registrations = getFromStorage(STORAGE_KEYS.REGISTRATIONS, []);
    return registrations.find((r) => r.ticketCode === ticketCode) || null;
  },

  /**
   * Verify and mark attendance by ticket code
   */
  async verifyAndMarkAttendance(ticketCode, eventId) {
    const registrations = getFromStorage(STORAGE_KEYS.REGISTRATIONS, []);
    const index = registrations.findIndex((r) => r.ticketCode === ticketCode);

    if (index === -1) {
      return { success: false, message: 'Invalid ticket code. Pass not found.' };
    }

    const reg = registrations[index];
    if (eventId && reg.eventId !== eventId) {
      return { success: false, message: 'This pass belongs to a different event.' };
    }

    if (reg.attendanceStatus === 'attended') {
      return {
        success: false,
        message: 'This pass has already been used and verified.',
        registration: reg,
      };
    }

    reg.attendanceStatus = 'attended';
    reg.attendedAt = new Date().toISOString();
    registrations[index] = reg;
    saveToStorage(STORAGE_KEYS.REGISTRATIONS, registrations);

    return {
      success: true,
      message: 'Attendance verified successfully!',
      registration: reg,
    };
  },
};

export default registrationService;
