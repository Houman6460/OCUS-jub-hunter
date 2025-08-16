export const onRequest = async ({ request, env }: any) => {
  const url = new URL(request.url);

  // Handle health check
  if (url.pathname === '/health') {
    return new Response(JSON.stringify({ 
      status: 'ok', 
      timestamp: Date.now(),
      message: 'OCUS Job Hunter is running on Cloudflare Pages'
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Let real assets pass through
  const last = url.pathname.split('/').pop() || '';
  const hasExt = last.includes('.');
  if (hasExt || url.pathname.startsWith('/assets/')) {
    return env.ASSETS.fetch(request);
  }

  // Serve SPA index.html for all other routes
  url.pathname = '/index.html';
  return env.ASSETS.fetch(new Request(url.toString(), request));
};
