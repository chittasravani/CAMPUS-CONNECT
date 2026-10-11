import express from 'express';
import {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
} from '../controllers/registrationController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// All registration routes require authentication and student role
router.use(protect);
router.use(restrictTo('student'));

// POST /api/registrations - Register student for an approved event
router.post('/', registerForEvent);

// GET /api/registrations/my - Get logged-in student's registrations
router.get('/my', getMyRegistrations);

// DELETE /api/registrations/:id - Cancel student's registration
router.delete('/:id', cancelRegistration);

export default router;
