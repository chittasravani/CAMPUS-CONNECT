import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Basic email regex format check
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Generate a JWT token for authenticated user
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Student signup controller
 * POST /api/auth/signup
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate required fields
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

    // 2. Validate email format
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid email address',
      });
    }

    // 3. Validate password length (minimum 8 characters)
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password must be at least 8 characters long',
      });
    }

    // 4. Check if email already exists
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(409).json({
        status: 'fail',
        message: 'An account with this email already exists',
      });
    }

    // 5. Hash password using bcryptjs
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 6. Create student user (enforcing role as 'student' regardless of request payload)
    const newUser = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
      role: 'student',
    });

    // 7. Return success response (excluding password)
    return res.status(201).json({
      status: 'success',
      message: 'Student account registered successfully',
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          createdAt: newUser.createdAt,
        },
      },
    });
  } catch (error) {
    // Handle MongoDB duplicate key error (code 11000)
    if (error.code === 11000) {
      return res.status(409).json({
        status: 'fail',
        message: 'An account with this email already exists',
      });
    }

    console.error('Signup Error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error during signup',
    });
  }
};

/**
 * User login controller
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email and password are required',
      });
    }

    const trimmedEmail = String(email).trim().toLowerCase();

    // 2. Find user in database with password explicitly selected
    const user = await User.findOne({ email: trimmedEmail }).select('+password');

    // 3. Verify user exists and password matches
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password',
      });
    }

    // 4. Generate signed JWT token using role from database (not from client payload)
    const token = generateToken(user._id, user.role);

    // 5. Return success response with token and safe user info
    return res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error during login',
    });
  }
};
