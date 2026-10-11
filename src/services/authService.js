/**
 * CampusConnect Auth Service
 * Ready for backend API integration (JWT / Session).
 */

import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storage.js';
import { generateId } from '../utils/helpers.js';

export const authService = {
  /**
   * Get currently active demo user
   */
  async getCurrentUser() {
    return getFromStorage(STORAGE_KEYS.CURRENT_USER, null);
  },

  /**
   * Mock login
   */
  async login({ email, password }) {
    await new Promise((res) => setTimeout(res, 200)); // Simulate async latency
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('No account found with this email address.');
    }

    if (user.status === 'inactive') {
      throw new Error('This account has been deactivated by administrator.');
    }

    saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  },

  /**
   * Mock registration (student signup)
   */
  async register(data) {
    await new Promise((res) => setTimeout(res, 300));
    const users = getFromStorage(STORAGE_KEYS.USERS, []);

    // Check email uniqueness
    const exists = users.some((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) {
      throw new Error('An account with this college email already exists.');
    }

    const newUser = {
      id: generateId('user_student'),
      name: data.name,
      email: data.email,
      role: 'student',
      studentId: data.studentId || `STU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      department: data.department || 'General Engineering',
      year: data.year || '1st Year',
      phone: data.phone || '',
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&w=256&q=80`,
      status: 'active',
      bio: data.bio || 'New CampusConnect student member.',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users);
    saveToStorage(STORAGE_KEYS.CURRENT_USER, newUser);
    return newUser;
  },

  /**
   * Mock logout
   */
  async logout() {
    saveToStorage(STORAGE_KEYS.CURRENT_USER, null);
    return true;
  },

  /**
   * Switch role easily in demo mode
   */
  async switchRole(role) {
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    let targetUser = users.find((u) => u.role === role);
    if (!targetUser) {
      targetUser = users[0];
    }
    saveToStorage(STORAGE_KEYS.CURRENT_USER, targetUser);
    return targetUser;
  },

  /**
   * Switch to a specific demo user ID
   */
  async switchUser(userId) {
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      saveToStorage(STORAGE_KEYS.CURRENT_USER, targetUser);
      return targetUser;
    }
    return null;
  },

  /**
   * Update profile info
   */
  async updateProfile(userId, profileData) {
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    const index = users.findIndex((u) => u.id === userId);

    if (index === -1) {
      throw new Error('User not found');
    }

    const updatedUser = { ...users[index], ...profileData };
    users[index] = updatedUser;
    saveToStorage(STORAGE_KEYS.USERS, users);

    // If current logged-in user, update current user too
    const current = getFromStorage(STORAGE_KEYS.CURRENT_USER);
    if (current && current.id === userId) {
      saveToStorage(STORAGE_KEYS.CURRENT_USER, updatedUser);
    }

    return updatedUser;
  },

  /**
   * Mock Forgot Password
   */
  async forgotPassword(email) {
    await new Promise((res) => setTimeout(res, 250));
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('No user registered with this email.');
    }

    // In a real backend, an email with a secure token would be dispatched
    return {
      success: true,
      message: `Password reset simulation: In a real system, a reset link would be sent to ${email}.`,
      resetToken: 'demo-token-xyz-123',
    };
  },

  /**
   * Mock Reset Password
   */
  async resetPassword(token, newPassword) {
    await new Promise((res) => setTimeout(res, 250));
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }
    return {
      success: true,
      message: 'Password reset successful. You may now login.',
    };
  },
};

export default authService;
