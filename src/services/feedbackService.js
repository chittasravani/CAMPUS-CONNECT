/**
 * CampusConnect Feedback & Ratings Service
 */

import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storage.js';
import { generateId } from '../utils/helpers.js';

export const feedbackService = {
  /**
   * Get feedback for an event
   */
  async getFeedbackByEvent(eventId) {
    const feedbackList = getFromStorage(STORAGE_KEYS.FEEDBACK, []);
    return feedbackList
      .filter((f) => f.eventId === eventId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  /**
   * Submit feedback & rating
   */
  async submitFeedback(eventId, studentUser, { rating, comment }) {
    await new Promise((res) => setTimeout(res, 200));

    if (!studentUser) throw new Error('Must be logged in to submit feedback');
    if (!rating || rating < 1 || rating > 5) throw new Error('Please select a rating between 1 and 5 stars');
    if (!comment || !comment.trim()) throw new Error('Please enter a review comment');

    const feedbackList = getFromStorage(STORAGE_KEYS.FEEDBACK, []);

    // Prevent duplicate feedback
    const existing = feedbackList.find(
      (f) => f.eventId === eventId && f.studentId === studentUser.id
    );

    if (existing) {
      throw new Error('You have already submitted a review for this event.');
    }

    const newFeedback = {
      id: generateId('fb'),
      eventId,
      studentId: studentUser.id,
      studentName: studentUser.name,
      avatar: studentUser.avatar || '',
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    feedbackList.unshift(newFeedback);
    saveToStorage(STORAGE_KEYS.FEEDBACK, feedbackList);
    return newFeedback;
  },

  /**
   * Check if student already gave feedback
   */
  async hasStudentGivenFeedback(eventId, studentId) {
    const feedbackList = getFromStorage(STORAGE_KEYS.FEEDBACK, []);
    return feedbackList.some(
      (f) => f.eventId === eventId && f.studentId === studentId
    );
  },
};

export default feedbackService;
