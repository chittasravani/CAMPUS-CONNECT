/**
 * CampusConnect API Configuration
 * 
 * Central configuration for API endpoints and base URL.
 * Reads VITE_API_BASE_URL with fallback to 'http://localhost:5000/api'.
 */

const getResolvedBaseUrl = () => {
  const envUrl =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
    (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL);

  const rawUrl =
    envUrl && typeof envUrl === 'string' && envUrl.trim()
      ? envUrl.trim()
      : 'http://localhost:5000/api';

  // Strip trailing slashes
  const cleanUrl = rawUrl.replace(/\/+$/, '');

  // Ensure base URL ends with /api to match backend mount points
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

export const API_CONFIG = {
  BASE_URL: getResolvedBaseUrl(),
  TIMEOUT_MS: 10000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      SIGNUP: '/auth/signup',
      REGISTER: '/auth/signup',
    },
    EVENTS: {
      BASE: '/events',
      MY: '/events/my',
      ALL: '/events/all',
      DETAIL: (id) => `/events/${id}`,
    },
    REGISTRATIONS: {
      BASE: '/registrations',
      MY: '/registrations/my',
      CANCEL: (id) => `/registrations/${id}`,
    },
    USERS: {
      BASE: '/users',
      ORGANIZER: '/users/organizer',
      STATUS: (id) => `/users/${id}/status`,
    },
  },
};

export default API_CONFIG;
