import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'node:dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

async function runAccountWorkflowTests() {
  console.log('================================================================');
  console.log('   CAMPUS CONNECT ACCOUNT MANAGEMENT & RBAC TEST SUITE          ');
  console.log('================================================================\n');

  const timestamp = Date.now();
  const results = [];

  const recordResult = (name, status, expectedCode, actualCode, details) => {
    const passed = (actualCode === expectedCode) && status;
    results.push({ name, expectedCode, actualCode, passed, details });
    console.log(`[TEST] ${name}`);
    console.log(`  Expected HTTP: ${expectedCode} | Actual HTTP: ${actualCode} | Status: ${passed ? 'PASS' : 'FAIL'}`);
    if (details) console.log(`  Details: ${details}`);
    console.log('');
  };

  // 1. Admin Login
  console.log('>>> 1. Admin Login <<<');
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@campus.edu', password: 'Admin@Campus2026!' }),
  });
  const adminLoginData = await adminLoginRes.json();
  const adminToken = adminLoginData.token;
  const adminRole = adminLoginData.data?.user?.role;
  recordResult('Admin Login', adminLoginRes.status === 200 && adminRole === 'admin', 200, adminLoginRes.status, `Logged in as role: '${adminRole}'`);

  // 2. Student Signup with Role Escalation Attempt
  console.log('>>> 2. Student Signup & Privilege Escalation Attempt <<<');
  const studentEmail = `student_rbac_${timestamp}@test.com`;
  const studentSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'RBAC Test Student',
      email: studentEmail,
      password: 'password123',
      role: 'admin', // Malicious client payload
    }),
  });
  const studentSignupData = await studentSignupRes.json();
  const assignedRole = studentSignupData.data?.user?.role;
  recordResult('Student Signup Role Lock', studentSignupRes.status === 201 && assignedRole === 'student', 201, studentSignupRes.status, `Requested: 'admin' | Assigned: '${assignedRole}'`);

  // 3. Student Login
  console.log('>>> 3. Student Login <<<');
  const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: studentEmail, password: 'password123' }),
  });
  const studentLoginData = await studentLoginRes.json();
  const studentToken = studentLoginData.token;
  recordResult('Student Login', studentLoginRes.status === 200 && studentLoginData.data?.user?.role === 'student', 200, studentLoginRes.status, `Token issued: ${!!studentToken}`);

  // 4. Student Attempt to Create Organizer (Must be Blocked)
  console.log('>>> 4. Student Attempt to Create Organizer <<<');
  const studentOrgAttemptRes = await fetch(`${BASE_URL}/users/organizer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${studentToken}` },
    body: JSON.stringify({
      name: 'Fake Organizer',
      email: `fake_org_${timestamp}@campus.edu`,
      password: 'Password123!',
    }),
  });
  const studentOrgAttemptData = await studentOrgAttemptRes.json();
  recordResult('Student Blocked from Creating Organizer', studentOrgAttemptRes.status === 403, 403, studentOrgAttemptRes.status, studentOrgAttemptData.message);

  // 5. Student Attempt to View All Users (Must be Blocked)
  console.log('>>> 5. Student Attempt to Access Users Directory <<<');
  const studentGetUsersRes = await fetch(`${BASE_URL}/users`, {
    headers: { 'Authorization': `Bearer ${studentToken}` },
  });
  const studentGetUsersData = await studentGetUsersRes.json();
  recordResult('Student Blocked from User Directory', studentGetUsersRes.status === 403, 403, studentGetUsersRes.status, studentGetUsersData.message);

  // 6. Admin Creates Official Organizer Account
  console.log('>>> 6. Admin Creates Official Organizer Account <<<');
  const orgEmail = `prof_turing_${timestamp}@campus.edu`;
  const adminCreateOrgRes = await fetch(`${BASE_URL}/users/organizer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: 'Prof. Alan Turing',
      email: orgEmail,
      password: 'OrganizerPassword2026!',
      department: 'Computer Science Department',
      organizationName: 'ACM Student Chapter',
    }),
  });
  const adminCreateOrgData = await adminCreateOrgRes.json();
  const createdOrgRole = adminCreateOrgData.data?.user?.role;
  recordResult('Admin Creates Organizer Account', adminCreateOrgRes.status === 201 && createdOrgRole === 'organizer', 201, adminCreateOrgRes.status, `Organizer created: ${adminCreateOrgData.data?.user?.email} (Role: '${createdOrgRole}')`);

  // 7. Duplicate Organizer Account Creation Prevention
  console.log('>>> 7. Duplicate Organizer Creation Prevention <<<');
  const dupOrgRes = await fetch(`${BASE_URL}/users/organizer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: 'Duplicate Alan Turing',
      email: orgEmail,
      password: 'OrganizerPassword2026!',
    }),
  });
  const dupOrgData = await dupOrgRes.json();
  recordResult('Duplicate Organizer Prevention', dupOrgRes.status === 409, 409, dupOrgRes.status, dupOrgData.message);

  // 8. Organizer Login
  console.log('>>> 8. Organizer Login <<<');
  const orgLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: orgEmail, password: 'OrganizerPassword2026!' }),
  });
  const orgLoginData = await orgLoginRes.json();
  const orgToken = orgLoginData.token;
  const orgRole = orgLoginData.data?.user?.role;
  recordResult('Organizer Login', orgLoginRes.status === 200 && orgRole === 'organizer', 200, orgLoginRes.status, `Logged in successfully with role: '${orgRole}'`);

  // 9. Organizer Authorization Enforcement
  console.log('>>> 9. Organizer Authorization Enforcement <<<');
  // 9a. Organizer CAN create events
  const orgCreateEventRes = await fetch(`${BASE_URL}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` },
    body: JSON.stringify({
      title: 'Turing Lecture 2026',
      description: 'Annual computing theory lecture',
      category: 'Technical',
      date: '2026-11-20',
      time: '02:00 PM',
      venue: 'Turing Hall',
      capacity: 150,
    }),
  });
  const orgCreateEventData = await orgCreateEventRes.json();
  recordResult('Organizer Can Create Events', orgCreateEventRes.status === 201, 201, orgCreateEventRes.status, `Event created (Status: '${orgCreateEventData.data?.event?.status}')`);

  // 9b. Organizer CANNOT create other organizers
  const orgCreateOrgRes = await fetch(`${BASE_URL}/users/organizer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` },
    body: JSON.stringify({
      name: 'Another Organizer',
      email: `another_${timestamp}@campus.edu`,
      password: 'Password123!',
    }),
  });
  const orgCreateOrgData = await orgCreateOrgRes.json();
  recordResult('Organizer Cannot Create Organizers', orgCreateOrgRes.status === 403, 403, orgCreateOrgRes.status, orgCreateOrgData.message);

  // 10. Admin Lists All Users
  console.log('>>> 10. Admin Lists All Users Directory <<<');
  const adminUsersListRes = await fetch(`${BASE_URL}/users`, {
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  const adminUsersListData = await adminUsersListRes.json();
  const totalUsers = adminUsersListData.results || 0;
  recordResult('Admin Lists All Users', adminUsersListRes.status === 200 && totalUsers > 0, 200, adminUsersListRes.status, `Total users retrieved: ${totalUsers}`);

  console.log('================================================================');
  console.log('                 ACCOUNT WORKFLOW TEST SUMMARY                  ');
  console.log('================================================================\n');

  let passedCount = 0;
  results.forEach((r, idx) => {
    if (r.passed) passedCount++;
    console.log(`${idx + 1}. ${r.name}: ${r.passed ? 'PASS' : 'FAIL'} (HTTP ${r.actualCode})`);
  });

  console.log(`\nTOTAL: ${passedCount} / ${results.length} PASSED`);
}

runAccountWorkflowTests().catch(console.error);
