/**
 * CampusConnect User Service
 * Connected to Express + MongoDB backend (/api/users)
 */

import { apiRequest } from './apiClient.js';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storage.js';

const normalizeUser = (u) => {
  if (!u) return null;
  return {
    ...u,
    id: u._id || u.id,
    _id: u._id || u.id,
    status: u.status || 'active',
    department: u.department || (u.role === 'organizer' ? 'Event Management' : 'General'),
  };
};

export const userService = {
  /**
   * Get all users from backend (Admin only)
   */
  async getAllUsers() {
    try {
      const res = await apiRequest('/users');
      if (res?.data?.users) {
        return res.data.users.map(normalizeUser);
      }
    } catch (err) {
      console.warn('Backend users fetch fallback to storage:', err.message);
    }
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    return users.map(normalizeUser);
  },

  /**
   * Get user by ID
   */
  async getUserById(id) {
    const users = await this.getAllUsers();
    return users.find((u) => u.id === id || u._id === id) || null;
  },

  /**
   * Create an Organizer account (Admin only)
   */
  async createOrganizer(organizerData) {
    const res = await apiRequest('/users/organizer', {
      method: 'POST',
      body: JSON.stringify({
        name: organizerData.name,
        email: organizerData.email,
        password: organizerData.password,
        department: organizerData.department || 'Event Management',
        organizationName: organizerData.organizationName || '',
      }),
    });

    if (res?.data?.user) {
      return normalizeUser(res.data.user);
    }
    throw new Error('Failed to create organizer account');
  },

  /**
   * Toggle user active/inactive status (Admin action)
   */
  async toggleUserStatus(id) {
    try {
      const res = await apiRequest(`/users/${id}/status`, {
        method: 'PATCH',
      });
      if (res?.data?.user) {
        return normalizeUser(res.data.user);
      }
    } catch (err) {
      console.warn('Backend toggle status fallback to storage:', err.message);
    }

    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    const index = users.findIndex((u) => u.id === id || u._id === id);

    if (index === -1) {
      throw new Error('User not found.');
    }

    const currentStatus = users[index].status || 'active';
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    users[index] = { ...users[index], status: newStatus };

    saveToStorage(STORAGE_KEYS.USERS, users);
    return normalizeUser(users[index]);
  },

  /**
   * Filter users by role and search query
   */
  async filterUsers({ role = 'all', search = '', status = 'all' }) {
    let users = await this.getAllUsers();

    if (role && role !== 'all') {
      users = users.filter((u) => u.role === role);
    }

    if (status && status !== 'all') {
      users = users.filter((u) => (u.status || 'active') === status);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.department && u.department.toLowerCase().includes(q))
      );
    }

    return users;
  },
};

export default userService;
