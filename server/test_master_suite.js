import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import dns from 'node:dns';

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

async function runMasterTestSuite() {
  console.log('================================================================');
  console.log('       CAMPUS CONNECT MASTER VERIFICATION TEST SUITE           ');
  console.log('================================================================\n');

  const mongoURI = process.env.MONGODB_URI || process.env.MONGODB_URL;
  await mongoose.connect(mongoURI);

  const timestamp = Date.now();
  const results = [];

  const recordResult = (suite, name, status, expectedCode, actualCode, details) => {
    const passed = (actualCode === expectedCode) && status;
    results.push({ suite, name, expectedCode, actualCode, passed, details });
    console.log(`[${suite}] ${name}`);
    console.log(`  Expected HTTP: ${expectedCode} | Actual HTTP: ${actualCode} | Status: ${passed ? 'PASS' : 'FAIL'}`);
    if (details) console.log(`  Details: ${details}`);
    console.log('');
  };

  // -------------------------------------------------------------
  // SUITE 1: AUTHENTICATION & SECURITY TESTS
  // -------------------------------------------------------------
  console.log('>>> SECTION 1: AUTHENTICATION & SECURITY TESTS <<<\n');

  // Test 1.1: Missing Login Fields -> 400
  const auth1Res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com' }),
  });
  const auth1Data = await auth1Res.json();
  recordResult('AUTH', 'Missing Login Fields', auth1Data.status === 'fail', 400, auth1Res.status, auth1Data.message);

  // Test 1.2: Incorrect Password -> 401
  const auth2Res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nonexistent@example.com', password: 'wrong' }),
  });
  const auth2Data = await auth2Res.json();
  recordResult('AUTH', 'Incorrect Password / Nonexistent Email', auth2Data.status === 'fail', 401, auth2Res.status, auth2Data.message);

  // Test 1.3: Valid Student Signup -> 201
  const authStudentEmail = `master_student_${timestamp}@test.com`;
  const auth3Res = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Auth Student', email: authStudentEmail, password: 'password123', role: 'admin' }),
  });
  const auth3Data = await auth3Res.json();
  const authStudentRole = auth3Data.data?.user?.role;
  recordResult('AUTH', 'Student Signup & Role Override Protection', auth3Data.status === 'success' && authStudentRole === 'student', 201, auth3Res.status, `Role assigned: '${authStudentRole}' (Requested 'admin')`);

  // Test 1.4: Duplicate Signup -> 409
  const auth4Res = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Duplicate Student', email: authStudentEmail, password: 'password123' }),
  });
  const auth4Data = await auth4Res.json();
  recordResult('AUTH', 'Duplicate Email Signup Prevention', auth4Data.status === 'fail', 409, auth4Res.status, auth4Data.message);

  // Test 1.5: Valid Student Login & JWT Generation -> 200
  const auth5Res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: authStudentEmail, password: 'password123' }),
  });
  const auth5Data = await auth5Res.json();
  const hasToken = typeof auth5Data.token === 'string' && auth5Data.token.startsWith('eyJ');
  recordResult('AUTH', 'Valid Login & JWT Generation', auth5Data.status === 'success' && hasToken, 200, auth5Res.status, `JWT Token issued: ${hasToken}`);

  // -------------------------------------------------------------
  // SUITE 2: EVENTS API TESTS
  // -------------------------------------------------------------
  console.log('>>> SECTION 2: EVENTS API TESTS <<<\n');

  // Setup Users for Events
  const organizerUser = await User.create({ name: 'Event Org', email: `master_org_${timestamp}@test.com`, password: 'password123', role: 'organizer' });
  const organizerToken = createToken(organizerUser._id, 'organizer');
  const adminUser = await User.create({ name: 'Event Admin', email: `master_admin_${timestamp}@test.com`, password: 'password123', role: 'admin' });
  const adminToken = createToken(adminUser._id, 'admin');
  const studentToken = createToken(auth3Data.data.user.id, 'student');

  // Test 2.1: Student Create Event Attempt -> 403
  const ev1Res = await fetch(`${BASE_URL}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${studentToken}` },
    body: JSON.stringify({ title: 'Student Event', description: 'Desc', category: 'Cat', date: '2026-12-01', time: '10:00 AM', venue: 'Hall', capacity: 50 }),
  });
  const ev1Data = await ev1Res.json();
  recordResult('EVENTS', 'Student Event Creation Blocked', ev1Data.status === 'fail', 403, ev1Res.status, ev1Data.message);

  // Test 2.2: Valid Event Creation by Organizer -> 201 (Status: pending)
  const ev2Res = await fetch(`${BASE_URL}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${organizerToken}` },
    body: JSON.stringify({ title: 'Master Tech Summit', description: 'Annual Tech Summit', category: 'Technology', date: '2026-12-10', time: '09:00 AM', venue: 'Main Auditorium', capacity: 2 }),
  });
  const ev2Data = await ev2Res.json();
  const createdEventId = ev2Data.data?.event?._id;
  const createdEventStatus = ev2Data.data?.event?.status;
  recordResult('EVENTS', 'Organizer Event Creation (Pending Status)', ev2Data.status === 'success' && createdEventStatus === 'pending', 201, ev2Res.status, `Event Status: '${createdEventStatus}'`);

  // Test 2.3: Student Listing excludes pending events -> 200
  const ev3Res = await fetch(`${BASE_URL}/events`);
  const ev3Data = await ev3Res.json();
  const isPendingVisible = (ev3Data.data?.events || []).some(e => e._id === createdEventId);
  recordResult('EVENTS', 'Pending Event Excluded from Student List', !isPendingVisible, 200, ev3Res.status, `Pending Event Visible: ${isPendingVisible}`);

  // Test 2.4: Admin Approve Event -> 200
  const ev4Res = await fetch(`${BASE_URL}/events/${createdEventId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'approved' }),
  });
  const ev4Data = await ev4Res.json();
  recordResult('EVENTS', 'Admin Event Approval', ev4Data.data?.event?.status === 'approved', 200, ev4Res.status, `Updated Status: '${ev4Data.data?.event?.status}'`);

  // Test 2.5: Student Listing includes approved event -> 200
  const ev5Res = await fetch(`${BASE_URL}/events`);
  const ev5Data = await ev5Res.json();
  const isApprovedVisible = (ev5Data.data?.events || []).some(e => e._id === createdEventId);
  recordResult('EVENTS', 'Approved Event Visible to Students', isApprovedVisible, 200, ev5Res.status, `Approved Event Included: ${isApprovedVisible}`);

  // -------------------------------------------------------------
  // SUITE 3: EVENT REGISTRATION API & CONCURRENCY TESTS
  // -------------------------------------------------------------
  console.log('>>> SECTION 3: EVENT REGISTRATION API & CONCURRENCY TESTS <<<\n');

  // Setup Students for Registration Tests
  const regStudent1 = await User.create({ name: 'Reg Student 1', email: `reg_s1_${timestamp}@test.com`, password: 'password123', role: 'student' });
  const regStudent1Token = createToken(regStudent1._id, 'student');

  const regStudent2 = await User.create({ name: 'Reg Student 2', email: `reg_s2_${timestamp}@test.com`, password: 'password123', role: 'student' });
  const regStudent2Token = createToken(regStudent2._id, 'student');

  const regStudent3 = await User.create({ name: 'Reg Student 3', email: `reg_s3_${timestamp}@test.com`, password: 'password123', role: 'student' });
  const regStudent3Token = createToken(regStudent3._id, 'student');

  // Create an Approved Event with capacity = 1
  const limitedEvent = await Event.create({
    title: 'High Demand Masterclass',
    description: 'Exclusive 1 seat masterclass',
    category: 'Masterclass',
    date: new Date('2026-12-25'),
    time: '04:00 PM',
    venue: 'Executive Lab',
    capacity: 1, // Capacity strictly 1
    organizerId: organizerUser._id,
    status: 'approved',
  });

  // Test 3.1: Student 1 Successful Registration -> 201
  const reg1Res = await fetch(`${BASE_URL}/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${regStudent1Token}` },
    body: JSON.stringify({ eventId: limitedEvent._id }),
  });
  const reg1Data = await reg1Res.json();
  const reg1Id = reg1Data.data?.registration?._id;
  recordResult('REGISTRATION', 'Successful Student Registration', reg1Data.status === 'success' && reg1Id, 201, reg1Res.status, `Registration ID: ${reg1Id}`);

  // Test 3.2: Duplicate Registration Attempt by Student 1 -> 409
  const reg2Res = await fetch(`${BASE_URL}/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${regStudent1Token}` },
    body: JSON.stringify({ eventId: limitedEvent._id }),
  });
  const reg2Data = await reg2Res.json();
  recordResult('REGISTRATION', 'Duplicate Registration Prevention', reg2Data.status === 'fail', 409, reg2Res.status, reg2Data.message);

  // Test 3.3: Capacity Full Rejection -> 400
  const reg3Res = await fetch(`${BASE_URL}/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${regStudent2Token}` },
    body: JSON.stringify({ eventId: limitedEvent._id }),
  });
  const reg3Data = await reg3Res.json();
  recordResult('REGISTRATION', 'Event Capacity Full Rejection', reg3Data.status === 'fail', 400, reg3Res.status, reg3Data.message);

  // Test 3.4: Student Ownership Check on Cancellation -> 403
  const reg4Res = await fetch(`${BASE_URL}/registrations/${reg1Id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${regStudent2Token}` }, // Student 2 trying to cancel Student 1's registration
  });
  const reg4Data = await reg4Res.json();
  recordResult('REGISTRATION', 'Student Ownership Check on Cancel (Blocked)', reg4Data.status === 'fail', 403, reg4Res.status, reg4Data.message);

  // Test 3.5: Successful Cancellation of Own Registration -> 200
  const reg5Res = await fetch(`${BASE_URL}/registrations/${reg1Id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${regStudent1Token}` }, // Student 1 cancelling own registration
  });
  const reg5Data = await reg5Res.json();
  recordResult('REGISTRATION', 'Successful Self Cancellation', reg5Data.data?.registration?.status === 'cancelled', 200, reg5Res.status, `Status: '${reg5Data.data?.registration?.status}'`);

  // Test 3.6: Concurrent Registration Capacity Test (2 students competing for 1 seat)
  // Create another single-seat approved event
  const concurrentEvent = await Event.create({
    title: 'Flash Workshop',
    description: 'Single seat event for concurrency testing',
    category: 'Workshop',
    date: new Date('2026-12-30'),
    time: '05:00 PM',
    venue: 'Lab 2',
    capacity: 1,
    organizerId: organizerUser._id,
    status: 'approved',
  });

  console.log('[CONCURRENCY TEST] Dispatching 2 concurrent registration requests for 1 seat...');
  const [reqA, reqB] = await Promise.all([
    fetch(`${BASE_URL}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${regStudent1Token}` },
      body: JSON.stringify({ eventId: concurrentEvent._id }),
    }),
    fetch(`${BASE_URL}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${regStudent2Token}` },
      body: JSON.stringify({ eventId: concurrentEvent._id }),
    }),
  ]);

  const [dataA, dataB] = await Promise.all([reqA.json(), reqB.json()]);
  const statuses = [reqA.status, reqB.status].sort();
  const concurrencyPassed = (statuses[0] === 201 && statuses[1] === 400);

  recordResult('REGISTRATION', 'Concurrent Registration Capacity Test', concurrencyPassed, 201, statuses[0], `Request A: HTTP ${reqA.status} | Request B: HTTP ${reqB.status}`);

  console.log('================================================================');
  console.log('                     MASTER TEST SUMMARY                        ');
  console.log('================================================================\n');

  let totalPassed = 0;
  results.forEach((r, idx) => {
    if (r.passed) totalPassed++;
    console.log(`${idx + 1}. [${r.suite}] ${r.name}: ${r.passed ? 'PASS' : 'FAIL'} (Expected: ${r.expectedCode}, Actual: ${r.actualCode})`);
  });

  console.log(`\nTOTAL: ${totalPassed} / ${results.length} PASSED`);

  await mongoose.disconnect();
}

runMasterTestSuite().catch(async (err) => {
  console.error('Master Test Suite Error:', err);
  await mongoose.disconnect();
});
