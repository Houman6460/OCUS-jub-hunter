export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Let asset files (with an extension) pass through normally
    const hasExtension = url.pathname.split('/').pop()?.includes('.') ?? false;

    // If it looks like an API or asset request, try to serve it directly first
    // This preserves normal behavior for real files
    try {
      if (hasExtension || url.pathname.startsWith('/assets/')) {
        const res = await env.ASSETS.fetch(request);
        // If the asset exists, return it; otherwise fall through to SPA below
        if (res.status !== 404) return res;
      }
    } catch (_) {
      // Ignore and fall back to SPA below
    }

    // API proxy: forward /api/* to external backend if configured
    if (url.pathname.startsWith('/api/')) {
      // Handle CORS preflight at the edge to avoid upstream 405s
      if (request.method === 'OPTIONS') {
        const reqHeaders = request.headers;
        const acrMethod = reqHeaders.get('Access-Control-Request-Method') || 'POST, GET, OPTIONS, PUT, DELETE';
        const acrHeaders = reqHeaders.get('Access-Control-Request-Headers') || 'Content-Type, Authorization';
        const origin = reqHeaders.get('Origin') || url.origin;
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Methods': acrMethod,
            'Access-Control-Allow-Headers': acrHeaders,
            'Access-Control-Max-Age': '86400',
          },
        });
      }

      const apiBase = env.API_BASE; // configure this in Cloudflare Pages Project Settings -> Environment Variables
      if (apiBase) {
        const target = new URL(apiBase.replace(/\/$/, '') + url.pathname + url.search);
        const reqInit = {
          method: request.method,
          headers: new Headers(request.headers),
          body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.clone().arrayBuffer(),
          redirect: 'follow'
        };
        // Remove CF-specific headers that may cause CORS issues upstream
        reqInit.headers.delete('cf-connecting-ip');
        reqInit.headers.delete('cf-ray');
        reqInit.headers.delete('cf-ipcountry');
        reqInit.headers.delete('cf-ew-via');
        // Keep original content-type and auth headers intact
        const proxied = await fetch(target.toString(), reqInit);
        // Pass-through response, but normalize CORS to this origin
        const resp = new Response(proxied.body, {
          status: proxied.status,
          statusText: proxied.statusText,
          headers: proxied.headers
        });
        resp.headers.set('Access-Control-Allow-Origin', url.origin);
        resp.headers.set('Access-Control-Allow-Credentials', 'true');
        resp.headers.set('Access-Control-Expose-Headers', '*, Authorization');
        return resp;
      }

      return new Response(
        JSON.stringify({
          error: 'API backend not configured',
          message: 'Set API_BASE in Cloudflare Pages env to your Express server URL (e.g., https://api.example.com).',
        }),
        {
          status: 501,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // SPA fallback: always serve index.html for non-asset routes
    url.pathname = '/index.html';
    return env.ASSETS.fetch(new Request(url, request));
  }
};
