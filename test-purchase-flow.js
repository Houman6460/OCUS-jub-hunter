// Test the complete purchase flow to identify where premium activation fails
const testPurchaseFlow = async () => {
  const baseUrl = 'https://8abbe9eb.ocus-job-hunter.pages.dev';
  const testEmail = `purchasetest${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  const testName = 'Purchase Test User';
  
  console.log('=== Testing Complete Purchase Flow ===');
  console.log('Test email:', testEmail);
  
  // 1. Register new user
  console.log('1. Registering new user...');
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
  if (!registerResult.success) {
    console.error('❌ Registration failed:', registerResult.message);
    return;
  }
  console.log('✅ Registration successful');
  
  // 2. Login
  console.log('2. Logging in...');
  const loginResponse = await fetch(`${baseUrl}/api/customer/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword
    })
  });
  
  const loginResult = await loginResponse.json();
  if (!loginResult.success) {
    console.error('❌ Login failed:', loginResult.message);
    return;
  }
  const token = loginResult.token;
  console.log('✅ Login successful');
  
  // 3. Check initial premium status
  console.log('3. Checking initial premium status...');
  const initialMeResponse = await fetch(`${baseUrl}/api/me`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const initialMeResult = await initialMeResponse.json();
  console.log('Initial premium status:', initialMeResult.isPremium);
  console.log('Initial extension activated:', initialMeResult.extensionActivated);
  
  // 4. Create Stripe payment intent
  console.log('4. Creating Stripe payment intent...');
  const paymentIntentResponse = await fetch(`${baseUrl}/api/create-user-payment-intent`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: 100, // 1 EUR in cents
      currency: 'eur',
      customerEmail: testEmail,
      customerName: testName
    })
  });
  
  const paymentIntentResult = await paymentIntentResponse.json();
  console.log('Payment intent result:', paymentIntentResult);
  
  if (!paymentIntentResult.clientSecret) {
    console.error('❌ Failed to create payment intent');
    return;
  }
  
  const paymentIntentId = paymentIntentResult.clientSecret.split('_secret_')[0];
  console.log('✅ Payment intent created:', paymentIntentId);
  
  // 5. Simulate successful payment completion
  console.log('5. Simulating payment completion...');
  const completePaymentResponse = await fetch(`${baseUrl}/api/complete-stripe-payment`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      paymentIntentId: paymentIntentId,
      customerEmail: testEmail,
      customerName: testName,
      amount: 100,
      currency: 'eur'
    })
  });
  
  const completePaymentResult = await completePaymentResponse.json();
  console.log('Payment completion result:', completePaymentResult);
  
  if (!completePaymentResult.success) {
    console.error('❌ Payment completion failed:', completePaymentResult.message);
    return;
  }
  console.log('✅ Payment completion API called successfully');
  
  // 6. Check premium status after payment
  console.log('6. Checking premium status after payment...');
  const finalMeResponse = await fetch(`${baseUrl}/api/me`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const finalMeResult = await finalMeResponse.json();
  console.log('Final premium status:', finalMeResult.isPremium);
  console.log('Final extension activated:', finalMeResult.extensionActivated);
  
  // 7. Check orders
  console.log('7. Checking orders...');
  const ordersResponse = await fetch(`${baseUrl}/api/me/orders`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const ordersResult = await ordersResponse.json();
  console.log('Orders count:', ordersResult.length);
  if (ordersResult.length > 0) {
    console.log('Latest order:', ordersResult[0]);
  }
  
  // Summary
  console.log('\n=== PURCHASE FLOW SUMMARY ===');
  console.log('Registration:', '✅');
  console.log('Login:', '✅');
  console.log('Payment Intent:', paymentIntentResult.clientSecret ? '✅' : '❌');
  console.log('Payment Completion:', completePaymentResult.success ? '✅' : '❌');
  console.log('Premium Activated:', finalMeResult.isPremium ? '✅' : '❌');
  console.log('Extension Activated:', finalMeResult.extensionActivated ? '✅' : '❌');
  console.log('Orders Created:', ordersResult.length > 0 ? '✅' : '❌');
};

testPurchaseFlow().catch(console.error);
