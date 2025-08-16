// Simple API handler for Cloudflare Pages Functions
export const onRequest = async (context: any) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Basic API responses for demo
  const path = url.pathname;
  
  if (path === '/api/health') {
    return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (path === '/api/products') {
    return new Response(JSON.stringify([
      {
        id: 1,
        name: 'OCUS Job Hunter Extension',
        price: 29.99,
        currency: 'USD',
        description: 'Premium Chrome extension for job hunting',
        features: ['AI-powered job matching', 'Auto-apply functionality', 'Resume optimization']
      }
    ]), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Default response for unhandled routes
  return new Response(JSON.stringify({ 
    error: 'API endpoint not implemented',
    path: path,
    message: 'This is a demo deployment. Full server functionality requires a complete backend setup.'
  }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
};
