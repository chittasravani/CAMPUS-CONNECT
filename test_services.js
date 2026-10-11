/**
 * Automated Verification Script for CampusConnect Services & Business Logic
 */

// Mock browser localStorage for Node.js environment
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};
global.window = {};

import { initStorage, resetToSeedData, getFromStorage, STORAGE_KEYS } from './src/services/storage.js';
import { eventService } from './src/services/eventService.js';
import { authService } from './src/services/authService.js';
import { registrationService } from './src/services/registrationService.js';
import { attendanceService } from './src/services/attendanceService.js';
import { userService } from './src/services/userService.js';
import { feedbackService } from './src/services/feedbackService.js';

async function runTests() {
  console.log('--- 🧪 STARTING CAMPUSCONNECT VERIFICATION SUITE ---');

  // Test 1: Storage Initialization
  initStorage();
  const users = getFromStorage(STORAGE_KEYS.USERS);
  const events = getFromStorage(STORAGE_KEYS.EVENTS);
  const registrations = getFromStorage(STORAGE_KEYS.REGISTRATIONS);
  console.log(`✅ [1/8] Storage Seeded: ${users.length} users, ${events.length} events, ${registrations.length} registrations.`);
  if (users.length < 8) throw new Error('Expected at least 8 users');
  if (events.length < 12) throw new Error('Expected at least 12 events');

  // Test 2: Event Filters & Search
  const techEvents = await eventService.filterEvents({ category: 'Technical' });
  console.log(`✅ [2/8] Filter by Category (Technical): found ${techEvents.length} events.`);
  if (techEvents.length === 0) throw new Error('Failed to filter technical events');

  const searchResults = await eventService.filterEvents({ search: 'hackathon' });
  console.log(`✅ [2/8] Search Query ('hackathon'): found ${searchResults.length} events.`);
  if (searchResults.length === 0) throw new Error('Failed to search events');

  // Test 3: Auth & Role Switching
  const studentUser = await authService.switchRole('student');
  console.log(`✅ [3/8] Switch to Student role: ${studentUser.name} (${studentUser.email})`);
  if (studentUser.role !== 'student') throw new Error('Expected student role');

  const orgUser = await authService.switchRole('organizer');
  console.log(`✅ [3/8] Switch to Organizer role: ${orgUser.name} (${orgUser.email})`);
  if (orgUser.role !== 'organizer') throw new Error('Expected organizer role');

  // Test 4: Registration & Duplicate Prevention
  const targetEvent = events.find(e => e.status === 'published' && e.registeredCount < e.capacity && e.id !== 'evt_hackcampus_2026');
  console.log(`Testing registration on event: "${targetEvent.title}"`);
  
  // Clean registration
  const newReg = await registrationService.registerForEvent(targetEvent.id, studentUser);
  console.log(`✅ [4/8] Successfully registered student. Ticket: ${newReg.ticketCode}`);

  // Duplicate registration test (should throw)
  let duplicatePrevented = false;
  try {
    await registrationService.registerForEvent(targetEvent.id, studentUser);
  } catch (err) {
    duplicatePrevented = true;
    console.log(`✅ [4/8] Duplicate Registration Successfully Blocked: "${err.message}"`);
  }
  if (!duplicatePrevented) throw new Error('Failed to block duplicate registration!');

  // Test 5: Attendance Check-in & Duplicate Scan Check
  const scanResult1 = await attendanceService.verifyAndMarkAttendance(targetEvent.id, newReg.ticketCode);
  console.log(`✅ [5/8] Attendance Verified: status=${scanResult1.status}, msg="${scanResult1.message}"`);
  if (!scanResult1.success) throw new Error('Expected successful attendance verification');

  // Repeated scan (should detect duplicate scan)
  const scanResult2 = await attendanceService.verifyAndMarkAttendance(targetEvent.id, newReg.ticketCode);
  console.log(`✅ [5/8] Duplicate Scan Check: status=${scanResult2.status}, msg="${scanResult2.message}"`);
  if (scanResult2.status !== 'already_attended') throw new Error('Expected already_attended status on duplicate scan');

  // Wrong event scan
  const otherEvent = events.find(e => e.id !== targetEvent.id);
  const scanResultWrong = await attendanceService.verifyAndMarkAttendance(otherEvent.id, newReg.ticketCode);
  console.log(`✅ [5/8] Wrong Event Check: status=${scanResultWrong.status}, msg="${scanResultWrong.message}"`);
  if (scanResultWrong.status !== 'wrong_event') throw new Error('Expected wrong_event status');

  // Test 6: Registration Cancellation
  await registrationService.cancelRegistration(newReg.id, studentUser.id);
  const isRegisteredAfterCancel = await registrationService.isStudentRegistered(targetEvent.id, studentUser.id);
  console.log(`✅ [6/8] Registration Cancelled: isRegistered=${isRegisteredAfterCancel}`);
  if (isRegisteredAfterCancel) throw new Error('Expected student to no longer be registered');

  // Test 7: User Status Toggle (Admin)
  const toggledUser = await userService.toggleUserStatus(studentUser.id);
  console.log(`✅ [7/8] User Status Toggled: ${toggledUser.name} is now ${toggledUser.status}`);
  await userService.toggleUserStatus(studentUser.id); // restore

  // Test 8: Feedback Submission & Duplicate Prevention
  const pastEvent = events.find(e => e.status === 'completed');
  if (pastEvent) {
    // Alex already has feedback, so this must throw
    let feedbackBlocked = false;
    try {
      await feedbackService.submitFeedback(pastEvent.id, studentUser, {
        rating: 5,
        comment: 'Superb event!'
      });
    } catch (err) {
      feedbackBlocked = true;
      console.log(`✅ [8/8] Duplicate Feedback Blocked: "${err.message}"`);
    }
    if (!feedbackBlocked) throw new Error('Failed to block duplicate feedback');

    // Priya Sharma hasn't submitted feedback yet
    const priyaUser = users.find(u => u.id === 'user_student_2');
    const newFeedback = await feedbackService.submitFeedback(pastEvent.id, priyaUser, {
      rating: 5,
      comment: 'Fantastic speakers and engaging panels!'
    });
    console.log(`✅ [8/8] First Feedback Submitted by Priya: rating=${newFeedback.rating}, id=${newFeedback.id}`);
  }

  console.log('--- 🎉 ALL CAMPUSCONNECT VERIFICATION CHECKS PASSED PERFECTLY! ---');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
