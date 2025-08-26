export const onRequestPost = async ({ request, env }: any) => {
  try {
    const { email, password, recaptchaToken } = await request.json();
    
    console.log('Login attempt for email:', email);
    
    // Fallback to demo credentials first
    if (email === 'demo@example.com' && password === 'demo123') {
      return new Response(JSON.stringify({
        success: true,
        user: {
          id: 1,
          email: 'demo@example.com',
          name: 'Demo User',
          role: 'customer'
        },
        token: 'demo-jwt-token'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    if (!env.DB) {
      console.error('Database not available');
      return new Response(JSON.stringify({
        success: false,
        message: 'Database not available'
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Check for user in users table (for registered customers)
    let user = null;
    try {
      const userResult = await env.DB.prepare(`
        SELECT id, email, name, role, created_at 
        FROM users WHERE email = ? AND password = ?
      `).bind(email, password).first();
      
      if (userResult) {
        user = userResult as any;
        console.log('User found in users table with password match');
      }
    } catch (e) {
      console.log('Users table query failed:', e);
    }
    
    // If not found in users table, try customers table (for legacy customers)
    if (!user) {
      try {
        const customerResult = await env.DB.prepare(`
          SELECT id, email, name, 'customer' as role, createdAt as created_at
          FROM customers WHERE email = ?
        `).bind(email).first();
        
        if (customerResult) {
          // For customers table, we don't have password validation yet
          // This is for legacy customers who might not have passwords set
          console.log('Customer found in customers table');
        }
      } catch (e) {
        console.log('Customers table query failed:', e);
      }
    }
    
    if (user) {
      return new Response(JSON.stringify({
        success: true,
        user,
        token: `jwt-token-${user.id}-${Date.now()}`
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Add more detailed logging for debugging
    console.log('User found:', user ? 'Yes' : 'No');
    console.log('Email check:', email);
    console.log('Password length:', password ? password.length : 0);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Invalid credentials'
    }), {
      status: 401,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Login failed'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
