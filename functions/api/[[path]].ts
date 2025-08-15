export const onRequest = async (context: any) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // CORS preflight
  if (request.method === 'OPTIONS') {
    const reqHeaders = request.headers;
    const acrMethod = reqHeaders.get('Access-Control-Request-Method') || 'GET, POST, PUT, DELETE, OPTIONS';
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

  const apiBase = env.API_BASE;
  if (!apiBase) {
    return new Response(
      JSON.stringify({ error: 'API_BASE not configured', hint: 'Set API_BASE env var in Cloudflare Pages' }),
      { status: 501, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Build target URL
  const target = new URL(apiBase.replace(/\/$/, '') + url.pathname + url.search);

  // Clone request preserving headers/body
  const headers = new Headers(request.headers);
  // Drop CF-specific headers that may upset origin
  headers.delete('cf-connecting-ip');
  headers.delete('cf-ray');
  headers.delete('cf-ipcountry');
  headers.delete('cf-ew-via');

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'follow',
  };
  if (!['GET', 'HEAD'].includes(request.method)) {
    init.body = await request.arrayBuffer();
  }

  const resp = await fetch(target.toString(), init);

  // Normalize CORS to current origin
  const out = new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers: resp.headers,
  });
  out.headers.set('Access-Control-Allow-Origin', url.origin);
  out.headers.set('Access-Control-Allow-Credentials', 'true');
  out.headers.set('Access-Control-Expose-Headers', '*, Authorization');
  return out;
};
