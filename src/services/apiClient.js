import { API_CONFIG } from '../config/apiConfig.js';

export const TOKEN_STORAGE_KEY = 'campusconnect_auth_token';
export const USER_STORAGE_KEY = 'campusconnect_auth_user';

export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
};

/**
 * Centralized HTTP request client with Bearer token authentication & error handling
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      // Clear token on 401 Unauthorized
      if (res.status === 401) {
        setAuthToken(null);
        setStoredUser(null);
      }
      const message = data?.message || data?.error || `Request failed with status ${res.status}`;
      const err = new Error(message);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.toLowerCase().includes('fetch')) {
      throw new Error('Unable to connect to backend server. Please verify the server is running on port 5000.');
    }
    throw err;
  }
}
