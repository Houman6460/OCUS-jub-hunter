// /functions/api/download-extension.ts
import type { PagesFunction } from '@cloudflare/workers-types';
import { Env, getCustomer, getD1, getUser } from '../lib/context';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const version = url.searchParams.get('version');

  if (version !== 'trial' && version !== 'premium') {
    return new Response('Invalid version specified.', { status: 400 });
  }

  const R2_BUCKET = env.R2_BUCKET;
  if (!R2_BUCKET) {
    console.error('R2_BUCKET is not defined in environment variables.');
    return new Response('Server configuration error.', { status: 500 });
  }

  const objectName = version === 'trial'
    ? 'extensions/ocus-job-hunter-trial-v1.0.0.zip'
    : 'extensions/ocus-job-hunter-premium-v1.0.0.zip';

  // For the trial version, allow direct download without authentication
  if (version === 'trial') {
    const object = await R2_BUCKET.get(objectName);
    if (object === null) {
      return new Response('Trial extension file not found.', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('Content-Disposition', `attachment; filename="ocus-job-hunter-trial-v1.0.0.zip"`);
    headers.set('etag', object.httpEtag);

    return new Response(object.body, { headers });
  }

  // For the premium version, require authentication and verification
  if (version === 'premium') {
    try {
      const user = await getUser(request, env);
      if (!user) {
        return new Response('Unauthorized: You must be logged in to download the premium version.', { status: 401 });
      }

      const db = getD1(env);
      const customer = await getCustomer(db, user.id);

      if (!customer || !customer.is_premium || !customer.extension_activated) {
        return new Response('Access Denied: You do not have premium access.', { status: 403 });
      }

      const object = await R2_BUCKET.get(objectName);
      if (object === null) {
        return new Response('Premium extension file not found.', { status: 404 });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('Content-Disposition', `attachment; filename="ocus-job-hunter-premium-v1.0.0.zip"`);
      headers.set('etag', object.httpEtag);

      return new Response(object.body, { headers });

    } catch (error: any) {
      console.error('Error during premium download:', error);
      return new Response(`An error occurred: ${error.message}`, { status: 500 });
    }
  }

  // Fallback for invalid version, though already handled above
  return new Response('Not Found', { status: 404 });
};
