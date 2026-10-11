import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS for local Vite frontend
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions));

// Configure Express JSON request parsing middleware
app.use(express.json());

// GET /api/health endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'CampusConnect API is running',
    timestamp: new Date().toISOString(),
  });
});

// Auth API routes
app.use('/api/auth', authRoutes);

// Event API routes
app.use('/api/events', eventRoutes);

// Registration API routes
app.use('/api/registrations', registrationRoutes);

// User Management API routes (Admin only)
app.use('/api/users', userRoutes);

// Connect to database before starting the Express server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
