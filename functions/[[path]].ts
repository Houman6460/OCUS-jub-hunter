export const onRequest = async ({ request, env }: any) => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Handle API endpoints
  if (pathname === '/health') {
    return new Response(JSON.stringify({ 
      status: 'ok', 
      timestamp: Date.now(),
      message: 'OCUS Job Hunter is running'
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (pathname === '/debug') {
    return new Response(`<!DOCTYPE html>
<html><head><title>Debug</title></head>
<body><h1>Debug Info</h1>
<p>Status: OK</p>
<p>Time: ${new Date().toISOString()}</p>
</body></html>`, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Handle static assets
  if (pathname.includes('.') && !pathname.endsWith('/')) {
    return env.ASSETS.fetch(request);
  }

  // For all other routes (including root), serve the SPA
  const indexUrl = new URL('/index.html', url.origin);
  const indexRequest = new Request(indexUrl, {
    method: request.method,
    headers: request.headers,
  });
  
  return env.ASSETS.fetch(indexRequest);
};
