/**
 * CampusConnect Registration Service
 * Handles event registrations, duplicate checks, ticket generation, waitlist, and cancellations.
 */

import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storage.js';
import { generateId, generateTicketCode } from '../utils/helpers.js';

export const registrationService = {
  /**
   * Get all registrations
   */
  async getAllRegistrations() {
    return getFromStorage(STORAGE_KEYS.REGISTRATIONS, []);
  },

  /**
   * Get registrations for a specific student
   */
  async getRegistrationsByStudent(studentId) {
    const registrations = getFromStorage(STORAGE_KEYS.REGISTRATIONS, []);
    const events = getFromStorage(STORAGE_KEYS.EVENTS, []);

    // Join with event details
    return registrations
      .filter((r) => r.studentId === studentId)
      .map((r) => {
        const event = events.find((e) => e.id === r.eventId);
        return {
          ...r,
          event: event || {
            title: 'Unknown Event',
            category: 'General',
            venue: 'TBA',
            startDate: new Date().toISOString(),
          },
        };
      })
      .sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
  },

  /**
   * Get registrations for a specific event (for organizers & admin)
   */
  async getRegistrationsByEvent(eventId) {
    const registrations = getFromStorage(STORAGE_KEYS.REGISTRATIONS, []);
    return registrations.filter((r) => r.eventId === eventId);
  },

  /**
   * Check if student is registered for event
   */
  async isStudentRegistered(eventId, studentId) {
    const registrations = getFromStorage(STORAGE_KEYS.REGISTRATIONS, []);
    return registrations.some(
      (r) => r.eventId === eventId && r.studentId === studentId && r.status === 'confirmed'
    );
  },

  /**
   * Register a student for an event
   */
  async registerForEvent(eventId, studentUser) {
    await new Promise((res) => setTimeout(res, 250));

    if (!studentUser) {
      throw new Error('You must be logged in as a student to register.');
    }

    const events = getFromStorage(STORAGE_KEYS.EVENTS, []);
    const eventIndex = events.findIndex((e) => e.id === eventId);

    if (eventIndex === -1) {
      throw new Error('Event not found.');
    }

    const event = events[eventIndex];

    // Business Rules Verification
    if (event.status !== 'published') {
      throw new Error(`Cannot register for an event that is ${event.status}.`);
    }

    // Check registration deadline
    if (event.registrationDeadline && new Date(event.registrationDeadline) < new Date()) {
      throw new Error('Registration for this event has already closed.');
    }

    // Prevent duplicate registrations
    const registrations = getFromStorage(STORAGE_KEYS.REGISTRATIONS, []);
    const existing = registrations.find(
      (r) => r.eventId === eventId && r.studentId === studentUser.id && r.status === 'confirmed'
    );

    if (existing) {
      throw new Error('You have already registered for this event. Check your digital ticket wallet.');
    }

    // Capacity verification
    if (event.registeredCount >= event.capacity) {
      throw new Error('This event is completely full. You can join the waitlist instead.');
    }

    // Generate verified ticket
    const ticketCode = generateTicketCode();
    const newRegistration = {
      id: generateId('reg'),
      eventId: event.id,
      studentId: studentUser.id,
      studentName: studentUser.name,
      studentEmail: studentUser.email,
      collegeStudentId: studentUser.studentId || 'STU-DEMO',
      department: studentUser.department || 'Undergraduate',
      registrationDate: new Date().toISOString(),
      status: 'confirmed',
      attendanceStatus: 'registered', // registered | attended | absent
      ticketCode,
      attendedAt: null,
    };

    registrations.push(newRegistration);
    saveToStorage(STORAGE_KEYS.REGISTRATIONS, registrations);

    // Increment event registered count
    events[eventIndex].registeredCount = (events[eventIndex].registeredCount || 0) + 1;
    saveToStorage(STORAGE_KEYS.EVENTS, events);

    // Create automatic confirmation notification for student
    const notifs = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    notifs.unshift({
      id: generateId('notif'),
      userId: studentUser.id,
      title: 'Registration Confirmed 🎟️',
      message: `You are confirmed for "${event.title}". Ticket: ${ticketCode}.`,
      type: 'success',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);

    return newRegistration;
  },

  /**
   * Cancel an existing registration
   */
  async cancelRegistration(registrationId, studentId) {
    await new Promise((res) => setTimeout(res, 200));

    const registrations = getFromStorage(STORAGE_KEYS.REGISTRATIONS, []);
    const regIndex = registrations.findIndex((r) => r.id === registrationId);

    if (regIndex === -1) {
      throw new Error('Registration record not found.');
    }

    const reg = registrations[regIndex];
    if (reg.studentId !== studentId) {
      throw new Error('Unauthorized to cancel this registration.');
    }

    if (reg.status === 'cancelled') {
      throw new Error('Registration is already cancelled.');
    }

    // Update status to cancelled
    registrations[regIndex].status = 'cancelled';
    saveToStorage(STORAGE_KEYS.REGISTRATIONS, registrations);

    // Decrement event registered count
    const events = getFromStorage(STORAGE_KEYS.EVENTS, []);
    const eventIndex = events.findIndex((e) => e.id === reg.eventId);
    if (eventIndex !== -1 && events[eventIndex].registeredCount > 0) {
      events[eventIndex].registeredCount -= 1;
      saveToStorage(STORAGE_KEYS.EVENTS, events);
    }

    return registrations[regIndex];
  },

  /**
   * Join Waitlist for full events
   */
  async joinWaitlist(eventId, studentUser) {
    await new Promise((res) => setTimeout(res, 200));

    if (!studentUser) {
      throw new Error('You must be logged in to join the waitlist.');
    }

    const waitlist = getFromStorage(STORAGE_KEYS.WAITLIST, []);
    const existing = waitlist.find(
      (w) => w.eventId === eventId && w.studentId === studentUser.id && w.status === 'waiting'
    );

    if (existing) {
      throw new Error(`You are already on the waitlist at position #${existing.position}.`);
    }

    const currentWaitlistForEvent = waitlist.filter((w) => w.eventId === eventId && w.status === 'waiting');
    const newEntry = {
      id: generateId('wt'),
      eventId,
      studentId: studentUser.id,
      studentName: studentUser.name,
      position: currentWaitlistForEvent.length + 1,
      status: 'waiting',
      createdAt: new Date().toISOString(),
    };

    waitlist.push(newEntry);
    saveToStorage(STORAGE_KEYS.WAITLIST, waitlist);
    return newEntry;
  },

  /**
   * Get student waitlist entry for an event
   */
  async getStudentWaitlistStatus(eventId, studentId) {
    const waitlist = getFromStorage(STORAGE_KEYS.WAITLIST, []);
    return waitlist.find(
      (w) => w.eventId === eventId && w.studentId === studentId && w.status === 'waiting'
    ) || null;
  },

  /**
   * Find ticket by code
   */
  async getRegistrationByTicketCode(ticketCode) {
    const registrations = getFromStorage(STORAGE_KEYS.REGISTRATIONS, []);
    return registrations.find(
      (r) => r.ticketCode?.toUpperCase() === ticketCode?.trim().toUpperCase()
    ) || null;
  },
};

export default registrationService;
