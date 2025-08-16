export const onRequest = async ({ request, env }: any) => {
  const url = new URL(request.url);

  // Handle health check
  if (url.pathname === '/health') {
    return new Response(JSON.stringify({ 
      status: 'ok', 
      timestamp: Date.now(),
      message: 'OCUS Job Hunter is running on Cloudflare Pages',
      url: url.href,
      method: request.method
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  }

  // Handle debug endpoint with inline HTML
  if (url.pathname === '/debug') {
    const debugHtml = `<!DOCTYPE html>
<html><head><title>Debug</title><style>body{font-family:Arial;margin:20px;}</style></head>
<body><h1>🔍 OCUS Debug</h1>
<div>Status: Cloudflare Pages Active</div>
<div>URL: ${url.href}</div>
<div>Time: ${new Date().toISOString()}</div>
<script>
console.log('Debug page loaded');
fetch('/health').then(r=>r.json()).then(d=>console.log('Health:', d));
</script></body></html>`;
    return new Response(debugHtml, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Let real assets and files with extensions pass through first
  const pathname = url.pathname;
  const hasExtension = pathname.includes('.') && !pathname.endsWith('/');
  
  if (hasExtension || pathname.startsWith('/assets/')) {
    try {
      return await env.ASSETS.fetch(request);
    } catch (error) {
      // If asset not found, continue to SPA routing
    }
  }

  // For root path, serve index.html directly
  if (pathname === '/') {
    try {
      const indexRequest = new Request(new URL('/index.html', url.origin), request);
      return await env.ASSETS.fetch(indexRequest);
    } catch (error) {
      return new Response('Index not found', { status: 404 });
    }
  }

  // For all other routes, serve SPA index.html
  try {
    const indexRequest = new Request(new URL('/index.html', url.origin), request);
    return await env.ASSETS.fetch(indexRequest);
  } catch (error) {
    return new Response('Application not found', { status: 404 });
  }
};
