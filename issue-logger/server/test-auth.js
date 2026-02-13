/**
 * Test script for authentication system
 * Run with: node test-auth.js
 */

const API_BASE_URL = 'http://localhost:5000';

// Helper function for API calls
async function apiCall(endpoint, method = 'GET', body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error('API call failed:', error);
    return { status: 500, data: { error: error.message } };
  }
}

// Test functions
async function testRegister() {
  console.log('\n📝 Testing User Registration...');
  const result = await apiCall('/api/auth/register', 'POST', {
    email: 'testuser@example.com',
    password: 'password123',
    full_name: 'Test User'
  });
  
  if (result.status === 201) {
    console.log('✅ Registration successful:', result.data.user);
  } else {
    console.log('❌ Registration failed:', result.data);
  }
  return result;
}

async function testRegisterAdmin() {
  console.log('\n📝 Testing Admin Registration...');
  const result = await apiCall('/api/auth/register', 'POST', {
    email: 'admin@example.com',
    password: 'admin123',
    full_name: 'Admin User',
    role: 'admin'
  });
  
  if (result.status === 201) {
    console.log('✅ Admin registration successful:', result.data.user);
  } else {
    console.log('❌ Admin registration failed:', result.data);
  }
  return result;
}

async function testLogin(email, password) {
  console.log(`\n🔐 Testing Login for ${email}...`);
  const result = await apiCall('/api/auth/login', 'POST', { email, password });
  
  if (result.status === 200) {
    console.log('✅ Login successful');
    console.log('   User:', result.data.user);
    console.log('   Access Token:', result.data.accessToken.substring(0, 20) + '...');
  } else {
    console.log('❌ Login failed:', result.data);
  }
  return result;
}

async function testGetProfile(token) {
  console.log('\n👤 Testing Get Profile...');
  const result = await apiCall('/api/auth/profile', 'GET', null, token);
  
  if (result.status === 200) {
    console.log('✅ Profile retrieved:', result.data.user);
  } else {
    console.log('❌ Get profile failed:', result.data);
  }
  return result;
}

async function testCreateIssue(token, issueText) {
  console.log('\n📋 Testing Create Issue...');
  const result = await apiCall('/api/issues', 'POST', { issue_text: issueText }, token);
  
  if (result.status === 201) {
    console.log('✅ Issue created:', result.data.issue);
  } else {
    console.log('❌ Create issue failed:', result.data);
  }
  return result;
}

async function testGetIssues() {
  console.log('\n📋 Testing Get All Issues...');
  const result = await apiCall('/api/issues', 'GET');
  
  if (result.status === 200) {
    console.log(`✅ Retrieved ${result.data.length} issues`);
    result.data.forEach((issue, index) => {
      console.log(`   ${index + 1}. [ID: ${issue.id}] ${issue.issue_text} - by ${issue.user_name || 'Unknown'}`);
    });
  } else {
    console.log('❌ Get issues failed:', result.data);
  }
  return result;
}

async function testUpdateIssue(token, issueId, newText) {
  console.log(`\n✏️  Testing Update Issue #${issueId}...`);
  const result = await apiCall(`/api/issues/${issueId}`, 'PUT', { issue_text: newText }, token);
  
  if (result.status === 200) {
    console.log('✅ Issue updated:', result.data.issue);
  } else {
    console.log('❌ Update issue failed:', result.data);
  }
  return result;
}

async function testDeleteIssue(token, issueId) {
  console.log(`\n🗑️  Testing Delete Issue #${issueId}...`);
  const result = await apiCall(`/api/issues/${issueId}`, 'DELETE', null, token);
  
  if (result.status === 200) {
    console.log('✅ Issue deleted:', result.data.message);
  } else {
    console.log('❌ Delete issue failed:', result.data);
  }
  return result;
}

async function testUnauthorizedAccess() {
  console.log('\n🚫 Testing Unauthorized Access...');
  const result = await apiCall('/api/issues', 'POST', { issue_text: 'Should fail' });
  
  if (result.status === 401) {
    console.log('✅ Correctly blocked unauthorized access');
  } else {
    console.log('❌ Security issue: Unauthorized access allowed!');
  }
  return result;
}

async function testLogout(token) {
  console.log('\n🚪 Testing Logout...');
  const result = await apiCall('/api/auth/logout', 'POST', null, token);
  
  if (result.status === 200) {
    console.log('✅ Logout successful');
  } else {
    console.log('❌ Logout failed:', result.data);
  }
  return result;
}

// Main test suite
async function runTests() {
  console.log('🚀 Starting Authentication System Tests...');
  console.log('=' .repeat(50));

  try {
    // 1. Test registration
    await testRegister();
    await testRegisterAdmin();

    // 2. Test login
    const userLogin = await testLogin('testuser@example.com', 'password123');
    const adminLogin = await testLogin('admin@example.com', 'admin123');

    if (!userLogin.data.accessToken || !adminLogin.data.accessToken) {
      console.log('\n❌ Cannot continue tests without valid tokens');
      return;
    }

    const userToken = userLogin.data.accessToken;
    const adminToken = adminLogin.data.accessToken;

    // 3. Test profile
    await testGetProfile(userToken);

    // 4. Test unauthorized access
    await testUnauthorizedAccess();

    // 5. Test create issue (user)
    const userIssue = await testCreateIssue(userToken, 'User created issue');
    const userIssueId = userIssue.data?.issue?.id;

    // 6. Test create issue (admin)
    const adminIssue = await testCreateIssue(adminToken, 'Admin created issue');
    const adminIssueId = adminIssue.data?.issue?.id;

    // 7. Test get all issues
    await testGetIssues();

    // 8. Test update own issue (user)
    if (userIssueId) {
      await testUpdateIssue(userToken, userIssueId, 'User updated their issue');
    }

    // 9. Test update someone else's issue (should fail for user)
    if (adminIssueId) {
      console.log('\n🔒 Testing User Cannot Update Admin Issue...');
      const result = await testUpdateIssue(userToken, adminIssueId, 'User trying to update admin issue');
      if (result.status === 403) {
        console.log('✅ Correctly blocked user from updating admin issue');
      } else {
        console.log('❌ Security issue: User can update admin issue!');
      }
    }

    // 10. Test admin can update any issue
    if (userIssueId) {
      console.log('\n👑 Testing Admin Can Update User Issue...');
      await testUpdateIssue(adminToken, userIssueId, 'Admin updated user issue');
    }

    // 11. Test delete (user deletes own)
    if (userIssueId) {
      await testDeleteIssue(userToken, userIssueId);
    }

    // 12. Test admin can delete any issue
    if (adminIssueId) {
      await testDeleteIssue(adminToken, adminIssueId);
    }

    // 13. Test logout
    await testLogout(userToken);

    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests completed!');
    console.log('=' .repeat(50));

  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
  }
}

// Run the tests
runTests();
