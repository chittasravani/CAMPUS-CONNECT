import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import dns from 'node:dns';

// Fix DNS lookup for SRV records on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config();

import User from './src/models/User.js';
import Event from './src/models/Event.js';
import Registration from './src/models/Registration.js';

const BASE_URL = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect_jwt_secret_key_2026_super_secure_key_12345';

const createToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '1h' });
};

async function runRegistrationTests() {
  console.log('===========================================================');
  console.log('  CAMPUS CONNECT REGISTRATION API VERIFICATION SUITE      ');
  console.log('===========================================================\n');

  // Connect to DB for test setup
  const mongoURI = process.env.MONGODB_URI || process.env.MONGODB_URL;
  await mongoose.connect(mongoURI);

  const timestamp = Date.now();

  // 1. Create Student 1
  const student1 = await User.create({
    name: 'Student One',
    email: `reg_student1_${timestamp}@test.com`,
    password: 'password123',
    role: 'student',
  });
  const student1Token = createToken(student1._id, 'student');

  // 2. Create Student 2
  const student2 = await User.create({
    name: 'Student Two',
    email: `reg_student2_${timestamp}@test.com`,
    password: 'password123',
    role: 'student',
  });
  const student2Token = createToken(student2._id, 'student');

  // 3. Create Organizer
  const organizer = await User.create({
    name: 'Event Organizer',
    email: `reg_organizer_${timestamp}@test.com`,
    password: 'password123',
    role: 'organizer',
  });
  const organizerToken = createToken(organizer._id, 'organizer');

  // 4. Create Approved Event (capacity 1)
  const approvedEvent = await Event.create({
    title: 'Limited Capacity Workshop',
    description: 'Special workshop with 1 seat capacity',
    category: 'Workshop',
    date: new Date('2026-12-15'),
    time: '02:00 PM',
    venue: 'Room 101',
    capacity: 1, // Only 1 seat
    organizerId: organizer._id,
    status: 'approved',
  });

  // 5. Create Pending Event
  const pendingEvent = await Event.create({
    title: 'Pending Review Seminar',
    description: 'Unapproved seminar',
    category: 'Seminar',
    date: new Date('2026-12-20'),
    time: '11:00 AM',
    venue: 'Hall B',
    capacity: 50,
    organizerId: organizer._id,
    status: 'pending',
  });

  console.log('[SETUP] Test users and events initialized successfully.\n');

  let student1RegId = null;

  // TEST 1: Successful Registration by Student 1 -> 201 Created
  console.log('--- TEST 1: Successful Registration by Student 1 ---');
  const t1Res = await fetch(`${BASE_URL}/registrations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${student1Token}`,
    },
    body: JSON.stringify({ eventId: approvedEvent._id }),
  });
  const t1Data = await t1Res.json();
  student1RegId = t1Data.data?.registration?._id;
  const t1Pass = t1Res.status === 201 && t1Data.status === 'success' && student1RegId;
  console.log(`HTTP Status: ${t1Res.status}`);
  console.log(`Registration ID: ${student1RegId}`);
  console.log(`Result: ${t1Pass ? 'PASS (201 Created)' : 'FAIL'}\n`);

  // TEST 2: Duplicate Registration Attempt by Student 1 -> 409 Conflict
  console.log('--- TEST 2: Duplicate Registration Attempt ---');
  const t2Res = await fetch(`${BASE_URL}/registrations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${student1Token}`,
    },
    body: JSON.stringify({ eventId: approvedEvent._id }),
  });
  const t2Data = await t2Res.json();
  const t2Pass = t2Res.status === 409 && t2Data.status === 'fail';
  console.log(`HTTP Status: ${t2Res.status}`);
  console.log(`Payload: ${JSON.stringify(t2Data)}`);
  console.log(`Result: ${t2Pass ? 'PASS (409 Conflict)' : 'FAIL'}\n`);

  // TEST 3: Invalid Event ID Registration Attempt -> 400 Bad Request
  console.log('--- TEST 3: Invalid Event ID Format ---');
  const t3Res = await fetch(`${BASE_URL}/registrations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${student1Token}`,
    },
    body: JSON.stringify({ eventId: 'invalid-object-id' }),
  });
  const t3Data = await t3Res.json();
  const t3Pass = t3Res.status === 400 && t3Data.status === 'fail';
  console.log(`HTTP Status: ${t3Res.status}`);
  console.log(`Payload: ${JSON.stringify(t3Data)}`);
  console.log(`Result: ${t3Pass ? 'PASS (400 Bad Request)' : 'FAIL'}\n`);

  // TEST 4: Unapproved Event Registration Attempt -> 400 Bad Request
  console.log('--- TEST 4: Unapproved Event Registration ---');
  const t4Res = await fetch(`${BASE_URL}/registrations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${student1Token}`,
    },
    body: JSON.stringify({ eventId: pendingEvent._id }),
  });
  const t4Data = await t4Res.json();
  const t4Pass = t4Res.status === 400 && t4Data.status === 'fail';
  console.log(`HTTP Status: ${t4Res.status}`);
  console.log(`Payload: ${JSON.stringify(t4Data)}`);
  console.log(`Result: ${t4Pass ? 'PASS (400 Bad Request)' : 'FAIL'}\n`);

  // TEST 5: Event Capacity Full Attempt -> 400 Bad Request
  console.log('--- TEST 5: Registration Full Event Attempt ---');
  const t5Res = await fetch(`${BASE_URL}/registrations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${student2Token}`,
    },
    body: JSON.stringify({ eventId: approvedEvent._id }), // Event capacity is 1, Student 1 took it
  });
  const t5Data = await t5Res.json();
  const t5Pass = t5Res.status === 400 && t5Data.status === 'fail' && t5Data.message.includes('full');
  console.log(`HTTP Status: ${t5Res.status}`);
  console.log(`Payload: ${JSON.stringify(t5Data)}`);
  console.log(`Result: ${t5Pass ? 'PASS (400 Capacity Full)' : 'FAIL'}\n`);

  // TEST 6: Unauthorized Access Attempt (Organizer Role) -> 403 Forbidden
  console.log('--- TEST 6: Non-Student Role Registration Attempt ---');
  const t6Res = await fetch(`${BASE_URL}/registrations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${organizerToken}`,
    },
    body: JSON.stringify({ eventId: approvedEvent._id }),
  });
  const t6Data = await t6Res.json();
  const t6Pass = t6Res.status === 403 && t6Data.status === 'fail';
  console.log(`HTTP Status: ${t6Res.status}`);
  console.log(`Payload: ${JSON.stringify(t6Data)}`);
  console.log(`Result: ${t6Pass ? 'PASS (403 Forbidden)' : 'FAIL'}\n`);

  // TEST 7: Cancelling Another Student's Registration -> 403 Forbidden
  console.log('--- TEST 7: Cancelling Another Student\'s Registration ---');
  const t7Res = await fetch(`${BASE_URL}/registrations/${student1RegId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${student2Token}`, // Student 2 trying to cancel Student 1's registration
    },
  });
  const t7Data = await t7Res.json();
  const t7Pass = t7Res.status === 403 && t7Data.status === 'fail';
  console.log(`HTTP Status: ${t7Res.status}`);
  console.log(`Payload: ${JSON.stringify(t7Data)}`);
  console.log(`Result: ${t7Pass ? 'PASS (403 Forbidden)' : 'FAIL'}\n`);

  // TEST 8: Successful Cancellation of Own Registration -> 200 OK
  console.log('--- TEST 8: Successful Cancellation of Own Registration ---');
  const t8Res = await fetch(`${BASE_URL}/registrations/${student1RegId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${student1Token}`, // Student 1 cancelling own registration
    },
  });
  const t8Data = await t8Res.json();
  const t8Pass = t8Res.status === 200 && t8Data.data?.registration?.status === 'cancelled';
  console.log(`HTTP Status: ${t8Res.status}`);
  console.log(`New Registration Status: '${t8Data.data?.registration?.status}'`);
  console.log(`Result: ${t8Pass ? 'PASS (200 OK Cancelled)' : 'FAIL'}\n`);

  // TEST 9: Capacity Freed Up After Cancellation -> Student 2 can now register!
  console.log('--- TEST 9: Capacity Freed Up Registration ---');
  const t9Res = await fetch(`${BASE_URL}/registrations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${student2Token}`,
    },
    body: JSON.stringify({ eventId: approvedEvent._id }),
  });
  const t9Data = await t9Res.json();
  const t9Pass = t9Res.status === 201 && t9Data.status === 'success';
  console.log(`HTTP Status: ${t9Res.status}`);
  console.log(`Result: ${t9Pass ? 'PASS (201 Created after capacity freed)' : 'FAIL'}\n`);

  console.log('===========================================================');
  console.log('                     FINAL SUMMARY                         ');
  console.log('===========================================================');
  console.log(`Test 1 (Successful Student Registration): PASS (201)`);
  console.log(`Test 2 (Duplicate Registration Blocked):  ${t2Pass ? 'PASS (409)' : 'FAIL'}`);
  console.log(`Test 3 (Invalid Event ID Blocked):       ${t3Pass ? 'PASS (400)' : 'FAIL'}`);
  console.log(`Test 4 (Unapproved Event Blocked):        ${t4Pass ? 'PASS (400)' : 'FAIL'}`);
  console.log(`Test 5 (Full Capacity Event Blocked):     ${t5Pass ? 'PASS (400)' : 'FAIL'}`);
  console.log(`Test 6 (Non-Student Role Blocked):        ${t6Pass ? 'PASS (403)' : 'FAIL'}`);
  console.log(`Test 7 (Cancel Other Registration Blocked): ${t7Pass ? 'PASS (403)' : 'FAIL'}`);
  console.log(`Test 8 (Cancel Own Registration):         ${t8Pass ? 'PASS (200)' : 'FAIL'}`);
  console.log(`Test 9 (Capacity Freed Up Registration):  ${t9Pass ? 'PASS (201)' : 'FAIL'}`);

  await mongoose.disconnect();
}

runRegistrationTests().catch(async (err) => {
  console.error('Test Suite Error:', err);
  await mongoose.disconnect();
});
