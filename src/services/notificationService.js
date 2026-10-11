/**
 * CampusConnect Notification Service
 */

import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storage.js';
import { generateId } from '../utils/helpers.js';

export const notificationService = {
  /**
   * Get notifications for a user
   */
  async getNotifications(userId) {
    const notifs = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    return notifs
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId) {
    const notifs = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    const index = notifs.findIndex((n) => n.id === notificationId);

    if (index !== -1) {
      notifs[index].isRead = true;
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
      return notifs[index];
    }
    return null;
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    const notifs = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    const updated = notifs.map((n) =>
      n.userId === userId ? { ...n, isRead: true } : n
    );
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
    return true;
  },

  /**
   * Clear all notifications for a user
   */
  async clearAll(userId) {
    const notifs = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    const filtered = notifs.filter((n) => n.userId !== userId);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, filtered);
    return true;
  },

  /**
   * Send a new notification
   */
  async sendNotification({ userId, title, message, type = 'info' }) {
    const notifs = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    const newNotif = {
      id: generateId('notif'),
      userId,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    notifs.unshift(newNotif);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
    return newNotif;
  },
};

export default notificationService;
