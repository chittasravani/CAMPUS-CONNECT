/**
 * CampusConnect Auth Service
 * Connected to Express + MongoDB backend (/api/auth)
 */

import { apiRequest, setAuthToken, setStoredUser, getStoredUser } from './apiClient.js';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storage.js';

export const authService = {
  /**
   * Get currently active authenticated user
   */
  async getCurrentUser() {
    const user = getStoredUser();
    if (user) {
      return {
        ...user,
        id: user.id || user._id,
      };
    }
    return getFromStorage(STORAGE_KEYS.CURRENT_USER, null);
  },

  /**
   * Login with email and password via backend API
   */
  async login({ email, password }) {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const token = res.token;
    const rawUser = res.data?.user;

    if (!token || !rawUser) {
      throw new Error('Invalid response received from authentication server');
    }

    setAuthToken(token);

    const user = {
      ...rawUser,
      id: rawUser.id || rawUser._id,
      role: rawUser.role, // strictly role from backend
      avatar: `https://images.unsplash.com/photo-1534528741775?auto=format&fit=crop&w=256&q=80`,
      department: rawUser.department || 'Computer Science & Engineering',
      year: rawUser.year || '1st Year',
    };

    setStoredUser(user);
    saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  },

  /**
   * Register a new student account via backend API
   */
  async register(data) {
    // 1. Call backend signup endpoint
    await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    });

    // 2. Automatically log in to get signed JWT token
    const user = await this.login({
      email: data.email,
      password: data.password,
    });

    // Augment with student metadata if provided
    if (data.studentId || data.department || data.year) {
      const augmentedUser = {
        ...user,
        studentId: data.studentId || user.studentId,
        department: data.department || user.department,
        year: data.year || user.year,
      };
      setStoredUser(augmentedUser);
      saveToStorage(STORAGE_KEYS.CURRENT_USER, augmentedUser);
      return augmentedUser;
    }

    return user;
  },

  /**
   * Logout user and clear tokens
   */
  async logout() {
    setAuthToken(null);
    setStoredUser(null);
    saveToStorage(STORAGE_KEYS.CURRENT_USER, null);
    return true;
  },

  /**
   * Switch role in frontend demo state
   */
  async switchRole(role) {
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    let targetUser = users.find((u) => u.role === role);
    if (!targetUser) {
      targetUser = users[0];
    }
    setStoredUser(targetUser);
    saveToStorage(STORAGE_KEYS.CURRENT_USER, targetUser);
    return targetUser;
  },

  /**
   * Switch user in frontend demo state
   */
  async switchUser(userId) {
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      setStoredUser(targetUser);
      saveToStorage(STORAGE_KEYS.CURRENT_USER, targetUser);
      return targetUser;
    }
    return null;
  },

  /**
   * Update profile info
   */
  async updateProfile(userId, profileData) {
    const current = getStoredUser() || getFromStorage(STORAGE_KEYS.CURRENT_USER);
    const updatedUser = { ...current, ...profileData, id: userId };
    setStoredUser(updatedUser);
    saveToStorage(STORAGE_KEYS.CURRENT_USER, updatedUser);
    return updatedUser;
  },

  /**
   * Forgot Password
   */
  async forgotPassword(email) {
    await new Promise((res) => setTimeout(res, 250));
    return {
      success: true,
      message: `Password reset simulation: In a real system, a reset link would be sent to ${email}.`,
      resetToken: 'demo-token-xyz-123',
    };
  },

  /**
   * Reset Password
   */
  async resetPassword(token, newPassword) {
    await new Promise((res) => setTimeout(res, 250));
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    return {
      success: true,
      message: 'Password reset successful. You may now login.',
    };
  },
};

export default authService;
