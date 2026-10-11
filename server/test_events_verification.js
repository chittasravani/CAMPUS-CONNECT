import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import dns from 'node:dns';

// Ensure DNS resolution for SRV records on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config();

import User from './src/models/User.js';
import Event from './src/models/Event.js';

const BASE_URL = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect_jwt_secret_key_2026_super_secure_key_12345';

// Helper function to sign JWT
const createToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '1h' });
};

async function runEventTests() {
  console.log('====================================================');
  console.log('    CAMPUS CONNECT EVENTS API VERIFICATION SUITE   ');
  console.log('====================================================\n');

  // Connect to DB for test setup
  const mongoURI = process.env.MONGODB_URI || process.env.MONGODB_URL;
  await mongoose.connect(mongoURI);

  // Clean test user data or create test accounts
  const timestamp = Date.now();
  
  // 1. Create Student User
  const studentUser = await User.create({
    name: 'Test Student',
    email: `student_${timestamp}@test.com`,
    password: 'password123',
    role: 'student',
  });
  const studentToken = createToken(studentUser._id, 'student');

  // 2. Create Organizer 1 User
  const organizer1User = await User.create({
    name: 'Test Organizer 1',
    email: `organizer1_${timestamp}@test.com`,
    password: 'password123',
    role: 'organizer',
  });
  const organizer1Token = createToken(organizer1User._id, 'organizer');

  // 3. Create Organizer 2 User
  const organizer2User = await User.create({
    name: 'Test Organizer 2',
    email: `organizer2_${timestamp}@test.com`,
    password: 'password123',
    role: 'organizer',
  });
  const organizer2Token = createToken(organizer2User._id, 'organizer');

  // 4. Create Admin User
  const adminUser = await User.create({
    name: 'Test Admin',
    email: `admin_${timestamp}@test.com`,
    password: 'password123',
    role: 'admin',
  });
  const adminToken = createToken(adminUser._id, 'admin');

  console.log('[SETUP] Test users initialized (Student, Organizer 1, Organizer 2, Admin)\n');

  let createdEventId = null;

  // TEST 1: Student attempt to create event -> 403 Forbidden
  console.log('--- TEST 1: Student Attempt to Create Event ---');
  const t1Res = await fetch(`${BASE_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`,
    },
    body: JSON.stringify({
      title: 'Hackathon 2026',
      description: 'Campus Hackathon',
      category: 'Technical',
      date: '2026-11-15',
      time: '10:00 AM',
      venue: 'Main Auditorium',
      capacity: 100,
    }),
  });
  const t1Data = await t1Res.json();
  const t1Pass = t1Res.status === 403 && t1Data.status === 'fail';
  console.log(`HTTP Status: ${t1Res.status}`);
  console.log(`Payload: ${JSON.stringify(t1Data)}`);
  console.log(`Result: ${t1Pass ? 'PASS (403 Forbidden)' : 'FAIL'}\n`);

  // TEST 2: Event Creation with Invalid Data -> 400 Bad Request
  console.log('--- TEST 2: Event Creation with Invalid Data ---');
  const t2Res = await fetch(`${BASE_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${organizer1Token}`,
    },
    body: JSON.stringify({
      title: '', // Missing title
      description: 'Test Description',
      category: 'Tech',
      date: '2026-11-15',
      time: '10:00 AM',
      venue: 'Lab 1',
      capacity: -5, // Invalid capacity
    }),
  });
  const t2Data = await t2Res.json();
  const t2Pass = t2Res.status === 400 && t2Data.status === 'fail';
  console.log(`HTTP Status: ${t2Res.status}`);
  console.log(`Payload: ${JSON.stringify(t2Data)}`);
  console.log(`Result: ${t2Pass ? 'PASS (400 Bad Request)' : 'FAIL'}\n`);

  // TEST 3: Valid Event Creation by Organizer 1 -> 201 Created (status: pending)
  console.log('--- TEST 3: Valid Event Creation by Organizer 1 ---');
  const t3Res = await fetch(`${BASE_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${organizer1Token}`,
    },
    body: JSON.stringify({
      title: 'Campus Tech Symposium',
      description: 'Annual technical symposium for all engineering students.',
      category: 'Technology',
      date: '2026-12-01',
      time: '09:30 AM',
      venue: 'Auditorium Hall A',
      capacity: 250,
    }),
  });
  const t3Data = await t3Res.json();
  const eventObj = t3Data.data?.event;
  createdEventId = eventObj?._id;
  const t3Pass = t3Res.status === 201 && eventObj?.status === 'pending';
  console.log(`HTTP Status: ${t3Res.status}`);
  console.log(`Created Event Status: '${eventObj?.status}' (Pending approval)`);
  console.log(`Event ID: ${createdEventId}`);
  console.log(`Result: ${t3Pass ? 'PASS (201 Created & Pending Status)' : 'FAIL'}\n`);

  // TEST 4: Listing Approved Events before Admin Approval -> Should NOT contain pending event
  console.log('--- TEST 4: Student Listing Events (Pending Event Filter Check) ---');
  const t4Res = await fetch(`${BASE_URL}/events`);
  const t4Data = await t4Res.json();
  const pendingEventFound = (t4Data.data?.events || []).some(e => e._id === createdEventId);
  const t4Pass = t4Res.status === 200 && !pendingEventFound;
  console.log(`HTTP Status: ${t4Res.status}`);
  console.log(`Approved Events Count: ${t4Data.results}`);
  console.log(`Pending Event Visible to Students: ${pendingEventFound}`);
  console.log(`Result: ${t4Pass ? 'PASS (Pending Event Hidden)' : 'FAIL'}\n`);

  // TEST 5: Admin Approving the Event -> 200 OK
  console.log('--- TEST 5: Admin Approving Event ---');
  const t5Res = await fetch(`${BASE_URL}/events/${createdEventId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'approved' }),
  });
  const t5Data = await t5Res.json();
  const t5Pass = t5Res.status === 200 && t5Data.data?.event?.status === 'approved';
  console.log(`HTTP Status: ${t5Res.status}`);
  console.log(`New Event Status: '${t5Data.data?.event?.status}'`);
  console.log(`Result: ${t5Pass ? 'PASS (Event Approved by Admin)' : 'FAIL'}\n`);

  // TEST 6: Student Listing Events after Admin Approval -> Should contain approved event
  console.log('--- TEST 6: Student Listing Events (After Approval) ---');
  const t6Res = await fetch(`${BASE_URL}/events`);
  const t6Data = await t6Res.json();
  const approvedEventFound = (t6Data.data?.events || []).some(e => e._id === createdEventId);
  const t6Pass = t6Res.status === 200 && approvedEventFound;
  console.log(`HTTP Status: ${t6Res.status}`);
  console.log(`Approved Event Included: ${approvedEventFound}`);
  console.log(`Result: ${t6Pass ? 'PASS (Approved Event Visible)' : 'FAIL'}\n`);

  // TEST 7: Unauthorized Update by Organizer 2 (Non-owner) -> 403 Forbidden
  console.log('--- TEST 7: Unauthorized Update by Non-owner Organizer ---');
  const t7Res = await fetch(`${BASE_URL}/events/${createdEventId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${organizer2Token}`,
    },
    body: JSON.stringify({ title: 'Hijacked Event Title' }),
  });
  const t7Data = await t7Res.json();
  const t7Pass = t7Res.status === 403 && t7Data.status === 'fail';
  console.log(`HTTP Status: ${t7Res.status}`);
  console.log(`Payload: ${JSON.stringify(t7Data)}`);
  console.log(`Result: ${t7Pass ? 'PASS (403 Forbidden)' : 'FAIL'}\n`);

  // TEST 8: Valid Update by Event Organizer 1 -> 200 OK
  console.log('--- TEST 8: Valid Update by Event Organizer 1 ---');
  const t8Res = await fetch(`${BASE_URL}/events/${createdEventId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${organizer1Token}`,
    },
    body: JSON.stringify({ title: 'Campus Tech Symposium 2026 (Updated)', capacity: 300 }),
  });
  const t8Data = await t8Res.json();
  const t8Pass = t8Res.status === 200 && t8Data.data?.event?.title.includes('Updated');
  console.log(`HTTP Status: ${t8Res.status}`);
  console.log(`Updated Title: '${t8Data.data?.event?.title}'`);
  console.log(`Result: ${t8Pass ? 'PASS (200 OK Updated)' : 'FAIL'}\n`);

  // TEST 9: Unauthorized Delete by Organizer 2 (Non-owner) -> 403 Forbidden
  console.log('--- TEST 9: Unauthorized Delete by Non-owner Organizer ---');
  const t9Res = await fetch(`${BASE_URL}/events/${createdEventId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${organizer2Token}`,
    },
  });
  const t9Data = await t9Res.json();
  const t9Pass = t9Res.status === 403 && t9Data.status === 'fail';
  console.log(`HTTP Status: ${t9Res.status}`);
  console.log(`Payload: ${JSON.stringify(t9Data)}`);
  console.log(`Result: ${t9Pass ? 'PASS (403 Forbidden)' : 'FAIL'}\n`);

  // TEST 10: Valid Delete by Event Organizer 1 -> 200 OK
  console.log('--- TEST 10: Valid Delete by Event Organizer 1 ---');
  const t10Res = await fetch(`${BASE_URL}/events/${createdEventId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${organizer1Token}`,
    },
  });
  const t10Data = await t10Res.json();
  const t10Pass = t10Res.status === 200 && t10Data.status === 'success';
  console.log(`HTTP Status: ${t10Res.status}`);
  console.log(`Payload: ${JSON.stringify(t10Data)}`);
  console.log(`Result: ${t10Pass ? 'PASS (200 OK Deleted)' : 'FAIL'}\n`);

  console.log('====================================================');
  console.log('                  FINAL SUMMARY                     ');
  console.log('====================================================');
  console.log(`Test 1 (Student Create Blocked):   ${t1Pass ? 'PASS (403)' : 'FAIL'}`);
  console.log(`Test 2 (Invalid Input Blocked):    ${t2Pass ? 'PASS (400)' : 'FAIL'}`);
  console.log(`Test 3 (Organizer Event Creation): ${t3Pass ? 'PASS (201)' : 'FAIL'}`);
  console.log(`Test 4 (Pending Event Hidden):     ${t4Pass ? 'PASS (200)' : 'FAIL'}`);
  console.log(`Test 5 (Admin Approval):           ${t5Pass ? 'PASS (200)' : 'FAIL'}`);
  console.log(`Test 6 (Approved Event Visible):   ${t6Pass ? 'PASS (200)' : 'FAIL'}`);
  console.log(`Test 7 (Non-owner Update Blocked): ${t7Pass ? 'PASS (403)' : 'FAIL'}`);
  console.log(`Test 8 (Organizer Event Update):   ${t8Pass ? 'PASS (200)' : 'FAIL'}`);
  console.log(`Test 9 (Non-owner Delete Blocked): ${t9Pass ? 'PASS (403)' : 'FAIL'}`);
  console.log(`Test 10 (Organizer Event Delete):  ${t10Pass ? 'PASS (200)' : 'FAIL'}`);

  await mongoose.disconnect();
}

runEventTests().catch(async (err) => {
  console.error('Test Suite Error:', err);
  await mongoose.disconnect();
});
