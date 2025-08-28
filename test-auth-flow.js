// Test authentication flow for user@example.com
// This will help debug why premium status isn't showing

const testAuthFlow = async () => {
  const baseUrl = 'https://0647ec2b.ocus-job-hunter.pages.dev';
  
  console.log('=== Testing Authentication Flow ===');
  
  // 1. Test login
  console.log('1. Testing login...');
  const loginResponse = await fetch(`${baseUrl}/api/customer/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'password123'
    })
  });
  
  const loginResult = await loginResponse.json();
  console.log('Login result:', loginResult);
  
  if (!loginResult.success) {
    console.error('❌ Login failed');
    return;
  }
  
  const token = loginResult.token;
  console.log('✅ Login successful, token:', token);
  
  // 2. Test /api/me with the token
  console.log('2. Testing /api/me...');
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
    console.log('Premium status:', meResult.isPremium);
    console.log('Extension activated:', meResult.extensionActivated);
  }
  
  // 3. Test orders API
  console.log('3. Testing /api/me/orders...');
  const ordersResponse = await fetch(`${baseUrl}/api/me/orders`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const ordersResult = await ordersResponse.json();
  console.log('Orders result:', ordersResult);
};

// Run the test
testAuthFlow().catch(console.error);
