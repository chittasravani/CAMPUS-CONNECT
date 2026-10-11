/**
 * CampusConnect User Service
 * Handles user management for Admin and student/organizer profiles.
 */

import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storage.js';

export const userService = {
  /**
   * Get all users
   */
  async getAllUsers() {
    return getFromStorage(STORAGE_KEYS.USERS, []);
  },

  /**
   * Get user by ID
   */
  async getUserById(id) {
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    return users.find((u) => u.id === id) || null;
  },

  /**
   * Toggle user active/inactive status (Admin action)
   */
  async toggleUserStatus(id) {
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      throw new Error('User not found.');
    }

    const currentStatus = users[index].status;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    users[index] = { ...users[index], status: newStatus };

    saveToStorage(STORAGE_KEYS.USERS, users);
    return users[index];
  },

  /**
   * Filter users by role and search query
   */
  async filterUsers({ role = 'all', search = '', status = 'all' }) {
    let users = getFromStorage(STORAGE_KEYS.USERS, []);

    if (role && role !== 'all') {
      users = users.filter((u) => u.role === role);
    }

    if (status && status !== 'all') {
      users = users.filter((u) => u.status === status);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.studentId && u.studentId.toLowerCase().includes(q)) ||
          (u.department && u.department.toLowerCase().includes(q))
      );
    }

    return users;
  },
};

export default userService;
