/**
 * CampusConnect Attendance Service
 * Handles QR ticket verification, attendance marking, duplicate scan prevention, and statistics.
 */

import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storage.js';

export const attendanceService = {
  /**
   * Scan / verify ticket code for a specific event
   */
  async verifyAndMarkAttendance(selectedEventId, ticketCodeOrRegId) {
    await new Promise((res) => setTimeout(res, 250));

    if (!selectedEventId) {
      throw new Error('Please select an event before scanning or searching tickets.');
    }

    if (!ticketCodeOrRegId || !ticketCodeOrRegId.trim()) {
      throw new Error('Please provide a valid ticket code or registration ID.');
    }

    const code = ticketCodeOrRegId.trim().toUpperCase();
    const registrations = getFromStorage(STORAGE_KEYS.REGISTRATIONS, []);
    const events = getFromStorage(STORAGE_KEYS.EVENTS, []);

    // Find registration matching either ticketCode or registration id
    const regIndex = registrations.findIndex(
      (r) => r.ticketCode?.toUpperCase() === code || r.id?.toUpperCase() === code
    );

    if (regIndex === -1) {
      return {
        success: false,
        status: 'not_found',
        message: `Ticket "${code}" not found in CampusConnect system.`,
      };
    }

    const registration = registrations[regIndex];

    // Verify it belongs to the selected event
    if (registration.eventId !== selectedEventId) {
      const ticketEvent = events.find((e) => e.id === registration.eventId);
      return {
        success: false,
        status: 'wrong_event',
        message: `Invalid Event! This ticket belongs to "${ticketEvent ? ticketEvent.title : 'another event'}", not the selected event.`,
        participant: registration,
      };
    }

    // Check if registration was cancelled
    if (registration.status === 'cancelled') {
      return {
        success: false,
        status: 'cancelled_registration',
        message: 'This registration has been cancelled by the student.',
        participant: registration,
      };
    }

    // Check if already attended
    if (registration.attendanceStatus === 'attended') {
      return {
        success: false,
        status: 'already_attended',
        message: `Duplicate Scan! Attendance was already recorded at ${new Date(registration.attendedAt).toLocaleTimeString()}.`,
        participant: registration,
      };
    }

    // Mark attendance
    const now = new Date().toISOString();
    registrations[regIndex] = {
      ...registration,
      attendanceStatus: 'attended',
      attendedAt: now,
    };
    saveToStorage(STORAGE_KEYS.REGISTRATIONS, registrations);

    return {
      success: true,
      status: 'verified',
      message: `Verified! Attendance confirmed for ${registration.studentName} (${registration.collegeStudentId}).`,
      participant: registrations[regIndex],
    };
  },

  /**
   * Manually toggle or set attendance status for a participant
   */
  async updateAttendanceStatus(registrationId, newStatus) {
    const registrations = getFromStorage(STORAGE_KEYS.REGISTRATIONS, []);
    const index = registrations.findIndex((r) => r.id === registrationId);

    if (index === -1) {
      throw new Error('Registration record not found.');
    }

    const now = newStatus === 'attended' ? new Date().toISOString() : null;
    registrations[index] = {
      ...registrations[index],
      attendanceStatus: newStatus,
      attendedAt: now,
    };

    saveToStorage(STORAGE_KEYS.REGISTRATIONS, registrations);
    return registrations[index];
  },

  /**
   * Get attendance statistics for an event
   */
  async getEventAttendanceStats(eventId) {
    const registrations = getFromStorage(STORAGE_KEYS.REGISTRATIONS, []);
    const eventRegs = registrations.filter(
      (r) => r.eventId === eventId && r.status === 'confirmed'
    );

    const total = eventRegs.length;
    const attended = eventRegs.filter((r) => r.attendanceStatus === 'attended').length;
    const pending = total - attended;
    const rate = total > 0 ? Math.round((attended / total) * 100) : 0;

    return {
      total,
      attended,
      pending,
      rate,
      participants: eventRegs,
    };
  },
};

export default attendanceService;
