import express from 'express';
import {
  createOrganizer,
  getAllUsers,
  toggleUserStatus,
} from '../controllers/userController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// All user management routes require authenticated Admin
router.use(protect);
router.use(restrictTo('admin'));

// POST /api/users/organizer - Create an Organizer account
router.post('/organizer', createOrganizer);

// GET /api/users - List all users in MongoDB
router.get('/', getAllUsers);

// PATCH /api/users/:id/status - Toggle user active status
router.patch('/:id/status', toggleUserStatus);

export default router;
