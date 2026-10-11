const BASE_URL = 'http://localhost:5000/api/auth';

async function runVerificationTests() {
  console.log('==================================================');
  console.log('   CAMPUS CONNECT LOGIN API VERIFICATION SUITE   ');
  console.log('==================================================\n');

  // 0. Setup: Register a fresh student user
  const testEmail = `verify_student_${Date.now()}@campusconnect.edu`;
  const testPassword = 'Password123!';

  console.log(`[SETUP] Registering test user: ${testEmail}`);
  const signupRes = await fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Verification Student',
      email: testEmail,
      password: testPassword,
    }),
  });
  const signupData = await signupRes.json();
  console.log(`[SETUP] Signup status: ${signupRes.status} (${signupData.status})\n`);

  // Test 1: Missing login fields -> 400 Bad Request
  console.log('--- TEST 1: Missing Login Fields ---');
  const test1Res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail }), // missing password
  });
  const test1Data = await test1Res.json();
  const test1Pass = test1Res.status === 400 && test1Data.status === 'fail';
  console.log(`HTTP Status: ${test1Res.status}`);
  console.log(`Response Payload: ${JSON.stringify(test1Data)}`);
  console.log(`Result: ${test1Pass ? 'PASS' : 'FAIL'}\n`);

  // Test 2: Incorrect Password -> 401 Unauthorized
  console.log('--- TEST 2: Incorrect Password ---');
  const test2Res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'WrongPassword999' }),
  });
  const test2Data = await test2Res.json();
  const test2Pass = test2Res.status === 401 && test2Data.status === 'fail' && test2Data.message === 'Invalid email or password';
  console.log(`HTTP Status: ${test2Res.status}`);
  console.log(`Response Payload: ${JSON.stringify(test2Data)}`);
  console.log(`Result: ${test2Pass ? 'PASS' : 'FAIL'}\n`);

  // Test 3: Nonexistent Email -> Safe Error (401 Unauthorized)
  console.log('--- TEST 3: Nonexistent Email ---');
  const test3Res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'fakeuser9999999@campusconnect.edu', password: 'SomePassword123' }),
  });
  const test3Data = await test3Res.json();
  const test3Pass = test3Res.status === 401 && test3Data.status === 'fail' && test3Data.message === 'Invalid email or password';
  console.log(`HTTP Status: ${test3Res.status}`);
  console.log(`Response Payload: ${JSON.stringify(test3Data)}`);
  console.log(`Safe Response Verified (No account leak): ${test3Data.message === 'Invalid email or password'}`);
  console.log(`Result: ${test3Pass ? 'PASS' : 'FAIL'}\n`);

  // Test 4: Successful Login & JWT Generation -> 200 OK
  console.log('--- TEST 4: Successful Login & JWT Generation ---');
  const test4Res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });
  const test4Data = await test4Res.json();
  const hasToken = typeof test4Data.token === 'string' && test4Data.token.startsWith('eyJ');
  const noPasswordInUser = test4Data.data?.user && !('password' in test4Data.data.user);
  const test4Pass = test4Res.status === 200 && test4Data.status === 'success' && hasToken && noPasswordInUser;
  console.log(`HTTP Status: ${test4Res.status}`);
  console.log(`Response Payload: ${JSON.stringify(test4Data, null, 2)}`);
  console.log(`JWT Token Present & Valid: ${hasToken}`);
  console.log(`Password / Hash Omitted: ${noPasswordInUser}`);
  console.log(`Result: ${test4Pass ? 'PASS' : 'FAIL'}\n`);

  // Test 5: Role Override Attempt -> Must NOT grant Admin privileges
  console.log('--- TEST 5: Student Role Override Attempt ---');
  const test5Res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword, role: 'admin' }),
  });
  const test5Data = await test5Res.json();
  const roleFromDB = test5Data.data?.user?.role;
  const test5Pass = test5Res.status === 200 && roleFromDB === 'student';
  console.log(`HTTP Status: ${test5Res.status}`);
  console.log(`Client requested role: 'admin'`);
  console.log(`Returned user role from DB: '${roleFromDB}'`);
  console.log(`Role Override Blocked (Preserves DB role 'student'): ${roleFromDB === 'student'}`);
  console.log(`Result: ${test5Pass ? 'PASS' : 'FAIL'}\n`);

  console.log('==================================================');
  console.log('                   SUMMARY                        ');
  console.log('==================================================');
  console.log(`Test 1 (Missing Fields):          ${test1Pass ? 'PASS (400 Bad Request)' : 'FAIL'}`);
  console.log(`Test 2 (Incorrect Password):      ${test2Pass ? 'PASS (401 Unauthorized)' : 'FAIL'}`);
  console.log(`Test 3 (Nonexistent Email):       ${test3Pass ? 'PASS (401 Unauthorized)' : 'FAIL'}`);
  console.log(`Test 4 (Successful Login & JWT):  ${test4Pass ? 'PASS (200 OK)' : 'FAIL'}`);
  console.log(`Test 5 (Role Override Blocked):   ${test5Pass ? 'PASS (200 OK)' : 'FAIL'}`);
}

runVerificationTests().catch(console.error);
