// New user profile endpoint to bypass caching issues
export async function onRequestGet(context: any) {
  const { request } = context;
  
  try {
    // Check authorization header first for demo token
    const authHeader = request.headers.get('Authorization');
    
    // PRIORITY: Always return demo customer data for demo-jwt-token
    if (authHeader?.includes('demo-jwt-token')) {
      return new Response(JSON.stringify({
        id: 1,
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'customer',
        createdAt: new Date().toISOString(),
        isPremium: true,
        extensionActivated: true,
        totalSpent: 29.99,
        totalOrders: 1,
        isAuthenticated: true
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    // For other tokens, return fallback
    return new Response(JSON.stringify({
      id: 1,
      email: 'fallback@example.com',
      name: 'Fallback User',
      role: 'customer',
      createdAt: new Date().toISOString(),
      isAuthenticated: false
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
    
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
