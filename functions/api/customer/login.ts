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
      console.log('Querying users table for email:', email);
      
      // First check if user exists with email only
      const emailOnlyResult = await env.DB.prepare(`
        SELECT id, email, name, role, created_at, password
        FROM users WHERE email = ?
      `).bind(email).first();
      
      if (emailOnlyResult) {
        console.log('User found with email:', email);
        console.log('Stored password starts with:', emailOnlyResult.password?.substring(0, 10));
        console.log('Input password:', password);
        
        // Check if password is hashed (bcrypt starts with $2b$)
        if (emailOnlyResult.password?.startsWith('$2b$')) {
          console.log('Password is hashed, implementing bcrypt comparison');
          try {
            // Import bcrypt for password comparison
            const bcrypt = await import('bcryptjs');
            const isMatch = await bcrypt.compare(password, emailOnlyResult.password);
            if (isMatch) {
              user = emailOnlyResult as any;
              console.log('Bcrypt password match for user:', user.email);
            } else {
              console.log('Bcrypt password mismatch');
            }
          } catch (bcryptError) {
            console.log('Bcrypt comparison failed:', bcryptError);
          }
        } else {
          // Plain text password comparison (for demo users)
          if (emailOnlyResult.password === password) {
            user = emailOnlyResult as any;
            console.log('Plain text password match for user:', user.email);
          } else {
            console.log('Plain text password mismatch');
          }
        }
      } else {
        console.log('No user found with this email in users table');
      }
    } catch (e) {
      console.log('Users table query failed:', e);
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
