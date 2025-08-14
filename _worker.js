export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Let asset files (with an extension) pass through normally
    const hasExtension = url.pathname.split('/').pop()?.includes('.') ?? false;

    // If it looks like an API or asset request, try to serve it directly first
    // This preserves normal behavior for real files
    try {
      if (hasExtension || url.pathname.startsWith('/assets/') || url.pathname.startsWith('/api/')) {
        const res = await env.ASSETS.fetch(request);
        // If the asset exists, return it; otherwise fall through to SPA below
        if (res.status !== 404) return res;
      }
    } catch (_) {
      // Ignore and fall back to SPA below
    }

    // SPA fallback: always serve index.html for non-asset routes
    url.pathname = '/index.html';
    return env.ASSETS.fetch(new Request(url, request));
  }
};
