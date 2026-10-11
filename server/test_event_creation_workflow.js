/**
 * Comprehensive verification of the Event Creation & Approval Workflow:
 * 1. Admin login
 * 2. Admin creates Organizer 1 and Organizer 2
 * 3. Organizer 1 logs in
 * 4. Organizer 1 creates an event (verifies saved in MongoDB with status: 'pending', organizerId assigned by backend)
 * 5. Organizer 1 fetches /api/events/my -> event is present with status: 'pending'
 * 6. Organizer 2 logs in and fetches /api/events/my -> event is NOT present (isolation check)
 * 7. Organizer 2 attempts to modify or delete Organizer 1's event -> returns 403 Forbidden
 * 8. Student logs in and fetches /api/events -> pending event is NOT present in student feed
 * 9. Admin fetches /api/events/all -> pending event is present
 * 10. Admin approves the event via PUT /api/events/:id
 * 11. Student fetches /api/events -> approved event is now visible in student feed
 * 12. Organizer 1 fetches /api/events/my -> event now shows status: 'approved'
 */

const BASE_URL = 'http://localhost:5000/api';

async function req(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runTests() {
  console.log('--- STARTING WORKFLOW VERIFICATION ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Admin Login
  console.log('\nStep 1: Admin Login');
  const adminLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@campus.edu', password: 'Admin@Campus2026!' }),
  });
  assert(adminLogin.status === 200 && adminLogin.data.token, 'Admin logged in successfully (HTTP 200)');
  const adminToken = adminLogin.data.token;

  // 2. Admin creates Organizer 1 and Organizer 2
  console.log('\nStep 2: Admin creates Organizers');
  const timestamp = Date.now();
  const org1Email = `org1_${timestamp}@campus.edu`;
  const org2Email = `org2_${timestamp}@campus.edu`;

  const createOrg1 = await req('/users/organizer', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: 'Organizer Alpha',
      email: org1Email,
      password: 'Password123!',
      organizationName: 'AI Club',
      department: 'Computer Science',
    }),
  });
  assert(createOrg1.status === 201 && (createOrg1.data.data?.user?._id || createOrg1.data.data?.user?.id), 'Admin created Organizer Alpha (HTTP 201)');
  const org1Id = createOrg1.data.data?.user?._id || createOrg1.data.data?.user?.id;

  const createOrg2 = await req('/users/organizer', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: 'Organizer Beta',
      email: org2Email,
      password: 'Password123!',
      organizationName: 'Robotics Club',
      department: 'Mechanical',
    }),
  });
  assert(createOrg2.status === 201 && (createOrg2.data.data?.user?._id || createOrg2.data.data?.user?.id), 'Admin created Organizer Beta (HTTP 201)');
  const org2Id = createOrg2.data.data?.user?._id || createOrg2.data.data?.user?.id;

  // 3. Organizer 1 logs in
  console.log('\nStep 3: Organizer 1 logs in');
  const org1Login = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: org1Email, password: 'Password123!' }),
  });
  assert(org1Login.status === 200 && org1Login.data.token, 'Organizer 1 logged in successfully (HTTP 200)');
  const org1Token = org1Login.data.token;

  // 4. Organizer 1 creates an event
  console.log('\nStep 4: Organizer 1 creates an event');
  const createEvt = await req('/events', {
    method: 'POST',
    headers: { Authorization: `Bearer ${org1Token}` },
    body: JSON.stringify({
      title: `AI Hackathon ${timestamp}`,
      description: 'Annual National AI Hackathon for university students',
      category: 'Technical',
      date: new Date(Date.now() + 86400000 * 5).toISOString(),
      time: '09:00 AM',
      venue: 'Auditorium Complex Hall A',
      capacity: 120,
      posterUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
      organizerId: 'spoofed_org_id_attempt', // should be ignored by backend!
    }),
  });
  assert(createEvt.status === 201, 'Organizer 1 created event (HTTP 201)');
  const eventDoc = createEvt.data.data?.event;
  assert(eventDoc && eventDoc._id, 'Event document created and returned with ID');
  assert(eventDoc.status === 'pending', 'Event initial status is "pending"');
  const actualOrgId = eventDoc.organizerId?._id || eventDoc.organizerId;
  assert(String(actualOrgId) === String(org1Id), 'Backend securely assigned authenticated Organizer ID (ignored spoofed ID)');
  const eventId = eventDoc._id;

  // 5. Organizer 1 fetches their own events (/api/events/my)
  console.log('\nStep 5: Organizer 1 fetches /api/events/my');
  const org1Events = await req('/events/my', {
    headers: { Authorization: `Bearer ${org1Token}` },
  });
  assert(org1Events.status === 200, 'Organizer 1 fetched /events/my (HTTP 200)');
  const foundInOrg1 = org1Events.data.data?.events?.some((e) => String(e._id) === String(eventId));
  assert(foundInOrg1, 'Newly created pending event appears in Organizer 1 events list');

  // 6. Organizer 2 logs in and fetches /api/events/my
  console.log('\nStep 6: Organizer 2 checks isolation');
  const org2Login = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: org2Email, password: 'Password123!' }),
  });
  assert(org2Login.status === 200 && org2Login.data.token, 'Organizer 2 logged in successfully (HTTP 200)');
  const org2Token = org2Login.data.token;

  const org2Events = await req('/events/my', {
    headers: { Authorization: `Bearer ${org2Token}` },
  });
  assert(org2Events.status === 200, 'Organizer 2 fetched /events/my (HTTP 200)');
  const foundInOrg2 = org2Events.data.data?.events?.some((e) => String(e._id) === String(eventId));
  assert(!foundInOrg2, 'Organizer 2 cannot see Organizer 1 events in /events/my');

  // 7. Organizer 2 attempts to update and delete Organizer 1 event
  console.log('\nStep 7: Organizer 2 unauthorized modification attempts');
  const unauthUpdate = await req(`/events/${eventId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${org2Token}` },
    body: JSON.stringify({ title: 'Hacked Title' }),
  });
  assert(unauthUpdate.status === 403, 'Organizer 2 update on unowned event rejected (HTTP 403)');

  const unauthDelete = await req(`/events/${eventId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${org2Token}` },
  });
  assert(unauthDelete.status === 403, 'Organizer 2 delete on unowned event rejected (HTTP 403)');

  // 8. Public / Student feed should NOT show pending event
  console.log('\nStep 8: Public student event feed check (pending event hidden)');
  const studentFeed1 = await req('/events');
  assert(studentFeed1.status === 200, 'Student feed fetched (HTTP 200)');
  const inFeedBeforeApproval = studentFeed1.data.data?.events?.some((e) => String(e._id) === String(eventId));
  assert(!inFeedBeforeApproval, 'Pending event is NOT visible in public student event feed');

  // 9. Admin fetches all events (/api/events/all)
  console.log('\nStep 9: Admin fetches /api/events/all');
  const adminEvents = await req('/events/all', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(adminEvents.status === 200, 'Admin fetched /events/all (HTTP 200)');
  const foundInAdmin = adminEvents.data.data?.events?.some((e) => String(e._id) === String(eventId));
  assert(foundInAdmin, 'Admin can see the pending event for review');

  // 10. Admin approves the event
  console.log('\nStep 10: Admin approves the event');
  const approveEvt = await req(`/events/${eventId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'approved' }),
  });
  assert(approveEvt.status === 200, 'Admin approved the event (HTTP 200)');
  assert(approveEvt.data.data?.event?.status === 'approved', 'Event status updated to "approved"');

  // 11. Student feed now includes the approved event
  console.log('\nStep 11: Public student event feed check (approved event visible)');
  const studentFeed2 = await req('/events');
  assert(studentFeed2.status === 200, 'Student feed fetched (HTTP 200)');
  const inFeedAfterApproval = studentFeed2.data.data?.events?.some((e) => String(e._id) === String(eventId));
  assert(inFeedAfterApproval, 'Approved event IS now visible in public student event feed');

  // 12. Organizer 1 dashboard shows event with status: 'approved'
  console.log('\nStep 12: Organizer 1 verifies updated status');
  const org1EventsUpdated = await req('/events/my', {
    headers: { Authorization: `Bearer ${org1Token}` },
  });
  const org1EventUpdated = org1EventsUpdated.data.data?.events?.find((e) => String(e._id) === String(eventId));
  assert(org1EventUpdated && org1EventUpdated.status === 'approved', 'Organizer 1 sees event status updated to "approved"');

  console.log('\n========================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('========================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
