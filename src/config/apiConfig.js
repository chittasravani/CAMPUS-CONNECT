/**
 * CampusConnect API Configuration
 * 
 * Central configuration for API endpoints and base URL.
 * In this frontend-only mock phase, services use the mock data layer.
 * When the Express/MongoDB backend is ready, set VITE_USE_MOCK_API=false
 * and point VITE_API_BASE_URL to your Express server (e.g. http://localhost:5000/api).
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  USE_MOCK: import.meta.env.VITE_USE_MOCK_API !== 'false', // Default to true in frontend demo
  TIMEOUT_MS: 10000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },
    EVENTS: {
      BASE: '/events',
      DETAIL: (id) => `/events/${id}`,
      FEATURED: '/events/featured',
      CATEGORIES: '/events/categories',
      ORGANIZER_EVENTS: (orgId) => `/events/organizer/${orgId}`,
    },
    REGISTRATIONS: {
      BASE: '/registrations',
      REGISTER: '/registrations',
      STUDENT: (studentId) => `/registrations/student/${studentId}`,
      EVENT: (eventId) => `/registrations/event/${eventId}`,
      CANCEL: (id) => `/registrations/${id}/cancel`,
      TICKET: (ticketCode) => `/registrations/ticket/${ticketCode}`,
    },
    ATTENDANCE: {
      VERIFY: '/attendance/verify',
      MARK: '/attendance/mark',
      EVENT_STATS: (eventId) => `/attendance/event/${eventId}/stats`,
    },
    USERS: {
      BASE: '/users',
      PROFILE: '/users/profile',
      TOGGLE_STATUS: (id) => `/users/${id}/status`,
    },
    NOTIFICATIONS: {
      BASE: '/notifications',
      MARK_READ: (id) => `/notifications/${id}/read`,
      MARK_ALL_READ: '/notifications/mark-all-read',
    },
    FEEDBACK: {
      BASE: '/feedback',
      EVENT: (eventId) => `/feedback/event/${eventId}`,
    },
    WAITLIST: {
      JOIN: '/waitlist/join',
      LEAVE: '/waitlist/leave',
      STATUS: (eventId, studentId) => `/waitlist/event/${eventId}/student/${studentId}`,
    }
  }
};

export default API_CONFIG;
