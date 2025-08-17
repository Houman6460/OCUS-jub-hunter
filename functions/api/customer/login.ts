import { UserStorage } from '../../lib/user-storage';

export const onRequestPost = async ({ request, env }: any) => {
  try {
    const { email, password, recaptchaToken } = await request.json();
    
    console.log('Login attempt for email:', email);
    
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
    
    const userStorage = new UserStorage(env.DB);
    await userStorage.initializeUsers();
    
    // Try to validate user from database
    const user = await userStorage.validateUser(email, password);
    console.log('User validation result:', user ? 'found' : 'not found');
    
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
    
    // Fallback to demo credentials
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
