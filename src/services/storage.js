/**
 * CampusConnect Storage Management
 * Handles persistent browser local storage for the mock layer.
 * All mutations persist across page reloads.
 */

import {
  SEED_USERS,
  SEED_EVENTS,
  SEED_REGISTRATIONS,
  SEED_WAITLIST,
  SEED_NOTIFICATIONS,
  SEED_FEEDBACK,
  SEED_FAVORITES,
} from '../data/seedData.js';

const STORAGE_KEYS = {
  USERS: 'campus_connect_users',
  EVENTS: 'campus_connect_events',
  REGISTRATIONS: 'campus_connect_registrations',
  WAITLIST: 'campus_connect_waitlist',
  NOTIFICATIONS: 'campus_connect_notifications',
  FEEDBACK: 'campus_connect_feedback',
  FAVORITES: 'campus_connect_favorites',
  CURRENT_USER: 'campus_connect_current_user',
  INITIALIZED: 'campus_connect_initialized_v1',
};

// Ensure localStorage is seeded on first load
export function initStorage() {
  if (typeof window === 'undefined') return;

  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (!isInitialized) {
    resetToSeedData();
  }
}

// Reset all mock storage back to initial seed data
export function resetToSeedData() {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(SEED_EVENTS));
  localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(SEED_REGISTRATIONS));
  localStorage.setItem(STORAGE_KEYS.WAITLIST, JSON.stringify(SEED_WAITLIST));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
  localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(SEED_FEEDBACK));
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(SEED_FAVORITES));
  // Default logged in user is student Alex Rivera
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_USERS[0]));
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}

// Helper methods
export function getFromStorage(key, defaultValue = []) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

export { STORAGE_KEYS };
