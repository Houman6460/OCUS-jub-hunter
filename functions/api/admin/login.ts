export const onRequestPost = async ({ request }: any) => {
  try {
    const { username, password, recaptchaToken } = await request.json();
    
    // Demo authentication - replace with real authentication logic
    if (username === 'admin' && password === 'admin123') {
      return new Response(JSON.stringify({
        success: true,
        user: {
          id: 1,
          username: 'admin',
          role: 'admin'
        },
        token: 'demo-admin-jwt-token'
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
