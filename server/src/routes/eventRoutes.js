import express from 'express';
import {
  getApprovedEvents,
  getOrganizerEvents,
  getAllAdminEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';
import { protect, restrictTo, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/events - List approved events for students
router.get('/', getApprovedEvents);

// GET /api/events/my - List all events created by logged-in organizer
router.get('/my', protect, restrictTo('organizer', 'admin'), getOrganizerEvents);

// GET /api/events/all - List all events across all organizers for Admin review
router.get('/all', protect, restrictTo('admin'), getAllAdminEvents);

// GET /api/events/:id - Get details of a single event
router.get('/:id', optionalAuth, getEventById);

// POST /api/events - Create a new event (organizer/admin only)
router.post('/', protect, restrictTo('organizer', 'admin'), createEvent);

// PUT /api/events/:id - Update an event (event organizer or admin only)
router.put('/:id', protect, restrictTo('organizer', 'admin'), updateEvent);

// DELETE /api/events/:id - Delete an event (event organizer or admin only)
router.delete('/:id', protect, restrictTo('organizer', 'admin'), deleteEvent);

export default router;
