import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';

dotenv.config();

async function initAdmin() {
  console.log('--- CampusConnect Admin Setup ---');

  await connectDB();

  const name = process.env.ADMIN_NAME || 'Platform Administrator';
  const email = (process.env.ADMIN_EMAIL || 'admin@campus.edu').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || 'Admin@Campus2026!';

  if (password.length < 8) {
    console.error('Error: Admin password must be at least 8 characters long.');
    process.exit(1);
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    if (existingUser.role === 'admin') {
      console.log(`Admin account (${email}) already exists in MongoDB.`);
    } else {
      existingUser.role = 'admin';
      await existingUser.save();
      console.log(`Existing user (${email}) has been elevated to Admin role.`);
    }
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      department: 'Administration',
    });
    console.log(`Admin account created successfully in MongoDB Atlas.`);
    console.log(`Email: ${newAdmin.email}`);
    console.log(`Role:  ${newAdmin.role}`);
  }

  await mongoose.disconnect();
  console.log('Admin setup complete.\n');
  process.exit(0);
}

initAdmin().catch(async (err) => {
  console.error('Failed to initialize admin:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
