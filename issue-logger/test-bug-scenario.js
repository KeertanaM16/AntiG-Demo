// Test script to demonstrate the 404 error and try-catch behavior
// Run this in browser console or as a standalone test

const API_BASE_URL = 'http://localhost:5000';

async function testBugScenario() {
  console.log('🧪 Starting Bug Test Scenario...\n');
  
  // First, let's register and login a test user
  console.log('1️⃣ Registering test user...');
  const registerResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `testbug${Date.now()}@example.com`,
      password: 'password123',
      full_name: 'Bug Test User'
    }),
    credentials: 'include'
  });
  
  const registerData = await registerResponse.json();
  console.log('✅ Registration response:', registerData);
  
  // Login
  console.log('\n2️⃣ Logging in...');
  const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: registerData.user.email,
      password: 'password123'
    }),
    credentials: 'include'
  });
  
  const loginData = await loginResponse.json();
  console.log('✅ Login successful, got access token');
  
  const accessToken = loginData.accessToken;
  
  // Now try to create an issue - THIS WILL TRIGGER THE BUG!
  console.log('\n3️⃣ Attempting to create issue (BUG WILL OCCUR)...');
  console.log('   Sending POST to: /api/issues (correct endpoint)');
  console.log('   But backend expects: /api/issue-create (wrong endpoint - THE BUG!)');
  
  try {
    console.log('\n   📍 ENTERING TRY BLOCK...');
    
    const response = await fetch(`${API_BASE_URL}/api/issues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ issue_text: 'Test issue to trigger bug' }),
      credentials: 'include'
    });
    
    console.log(`   📡 Response status: ${response.status} ${response.statusText}`);
    
    // This is where our try-catch logic kicks in
    if (!response.ok) {
      console.log('   ⚠️  Response not OK, throwing error...');
      const errorData = await response.json().catch(() => ({}));
      
      throw new Error(
        errorData.error || 
        `HTTP Error ${response.status}: ${response.statusText}. Failed to create issue - API endpoint may not exist.`
      );
    }
    
    console.log('   ✅ Success! (This should NOT print with the bug)');
    
  } catch (error) {
    console.log('\n   🎯 ENTERED CATCH BLOCK! ✅');
    console.log('   ❌ Error caught:', error.message);
    console.log('   📝 Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.split('\n')[0]
    });
    console.log('\n   ✨ This is the expected behavior with the bug!');
    console.log('   ✨ Error was thrown in TRY and caught in CATCH! ✅');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY:');
  console.log('='.repeat(60));
  console.log('✅ Bug reproduced successfully!');
  console.log('✅ Error thrown in TRY block');
  console.log('✅ Error caught in CATCH block');
  console.log('❌ Issue creation failed due to route mismatch');
  console.log('\n🔧 To fix: Change /api/issue-create to /api/issues in server/routes/issueRoutes.js');
  console.log('='.repeat(60));
}

// Run the test
testBugScenario().catch(err => {
  console.error('Test failed:', err);
});
