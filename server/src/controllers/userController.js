import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Create an Organizer account (Admin only)
 * POST /api/users/organizer
 */
export const createOrganizer = async (req, res) => {
  try {
    const { name, email, password, department, organizationName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Name, email, and password are required',
      });
    }

    const trimmedName = String(name).trim();
    const trimmedEmail = String(email).trim().toLowerCase();

    if (!trimmedName) {
      return res.status(400).json({
        status: 'fail',
        message: 'Name cannot be empty',
      });
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid email address',
      });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password must be at least 8 characters long',
      });
    }

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(409).json({
        status: 'fail',
        message: 'An account with this email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newOrganizer = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
      role: 'organizer', // Strictly organizer role
      department: department ? String(department).trim() : 'Event Management',
      organizationName: organizationName ? String(organizationName).trim() : '',
      status: 'active',
    });

    return res.status(201).json({
      status: 'success',
      message: 'Organizer account created successfully',
      data: {
        user: {
          id: newOrganizer._id,
          _id: newOrganizer._id,
          name: newOrganizer.name,
          email: newOrganizer.email,
          role: newOrganizer.role,
          department: newOrganizer.department,
          organizationName: newOrganizer.organizationName,
          status: newOrganizer.status,
          createdAt: newOrganizer.createdAt,
        },
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        status: 'fail',
        message: 'An account with this email already exists',
      });
    }
    console.error('Create Organizer Error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while creating organizer account',
    });
  }
};

/**
 * Get all users from MongoDB (Admin only)
 * GET /api/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users },
    });
  } catch (error) {
    console.error('Get Users Error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching users',
    });
  }
};

/**
 * Toggle user active/inactive status (Admin only)
 * PATCH /api/users/:id/status
 */
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    return res.status(200).json({
      status: 'success',
      message: `User status changed to ${user.status}`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      },
    });
  } catch (error) {
    console.error('Toggle Status Error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while toggling user status',
    });
  }
};
