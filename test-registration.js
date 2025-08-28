// Test registration and login flow
const testRegistrationFlow = async () => {
  const baseUrl = 'https://d962addc.ocus-job-hunter.pages.dev';
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  const testName = 'Test User';
  
  console.log('=== Testing Registration & Login Flow ===');
  console.log('Test email:', testEmail);
  
  // 1. Test registration
  console.log('1. Testing registration...');
  const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      name: testName
    })
  });
  
  const registerResult = await registerResponse.json();
  console.log('Registration result:', registerResult);
  
  if (!registerResult.success) {
    console.error('❌ Registration failed:', registerResult.message);
    return;
  }
  
  console.log('✅ Registration successful');
  
  // 2. Test login with new account
  console.log('2. Testing login with new account...');
  const loginResponse = await fetch(`${baseUrl}/api/customer/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword
    })
  });
  
  const loginResult = await loginResponse.json();
  console.log('Login result:', loginResult);
  
  if (!loginResult.success) {
    console.error('❌ Login failed:', loginResult.message);
    return;
  }
  
  const token = loginResult.token;
  console.log('✅ Login successful, token:', token);
  
  // 3. Test /api/me with new user
  console.log('3. Testing /api/me with new user...');
  const meResponse = await fetch(`${baseUrl}/api/me`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const meResult = await meResponse.json();
  console.log('Me result:', meResult);
  
  if (meResult.error) {
    console.error('❌ /api/me failed:', meResult.error);
  } else {
    console.log('✅ /api/me successful');
    console.log('User info:', {
      email: meResult.email,
      name: meResult.name,
      isPremium: meResult.isPremium,
      extensionActivated: meResult.extensionActivated
    });
  }
};

// Run the test
testRegistrationFlow().catch(console.error);
