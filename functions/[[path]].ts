export const onRequest = async ({ request, env }: any) => {
  const url = new URL(request.url);

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
