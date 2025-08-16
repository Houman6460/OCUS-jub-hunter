export const onRequestPost = async ({ request }: any) => {
  try {
    const { email, password, name, recaptchaToken } = await request.json();
    
    // Demo registration - replace with real registration logic
    if (email && password && name) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Registration successful',
        user: {
          id: Date.now(),
          email,
          name,
          role: 'customer'
        }
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Missing required fields'
    }), {
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Registration failed'
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
