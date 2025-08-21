import { Env } from '../../lib/context';

// Type definitions
interface AuthSettings {
  google_enabled: number;
  google_client_id: string;
  google_client_secret: string;
}

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface GoogleUserResponse {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  try {
    // 1. Fetch auth settings from the database
    const authSettings = await env.DB.prepare(
      'SELECT google_enabled, google_client_id, google_client_secret FROM auth_settings WHERE id = 1'
    ).first<AuthSettings>();

    if (!authSettings?.google_enabled) {
      return new Response('Google login is not enabled.', { status: 400 });
    }

    const { google_client_id, google_client_secret } = authSettings;
    const redirectUri = `${url.origin}/api/auth/google`;

    // 2. If no code is present, redirect to Google for authentication
    if (!code) {
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', google_client_id);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'openid email profile');
      return Response.redirect(authUrl.toString(), 302);
    }

    // 3. Exchange the authorization code for an access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: google_client_id,
        client_secret: google_client_secret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Failed to get access token: ${errorText}`);
    }

    const tokenData = await tokenResponse.json() as GoogleTokenResponse;

    // 4. Use the access token to fetch user details from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data from Google.');
    }

    const userData = await userResponse.json() as GoogleUserResponse;

    if (!userData.email || !userData.verified_email) {
      return new Response('A verified email is required from Google.', { status: 400 });
    }

    // 5. Check if the user exists in the database or create a new one
    let user = await env.DB.prepare('SELECT id, name, email FROM users WHERE email = ?').bind(userData.email).first<User>();

    if (!user) {
      const now = new Date().toISOString();
      await env.DB.prepare(
        'INSERT INTO users (email, name, provider, provider_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(userData.email, userData.name, 'google', userData.id, now, now).run();

      user = await env.DB.prepare('SELECT id, name, email FROM users WHERE email = ?').bind(userData.email).first<User>();
    }

    if (!user) {
      return new Response('Could not create or find user.', { status: 500 });
    }

    // 6. Redirect to the dashboard, passing user info in the URL
    const redirectURL = new URL('/dashboard', url.origin);
    redirectURL.searchParams.set('userId', user.id.toString());
    redirectURL.searchParams.set('name', user.name);
    redirectURL.searchParams.set('email', user.email);

    return Response.redirect(redirectURL.toString(), 302);

  } catch (error) {
    console.error('Google OAuth Error:', error);
    const errorUrl = new URL('/login', url.origin);
    errorUrl.searchParams.set('error', 'oauth_failed');
    errorUrl.searchParams.set('provider', 'google');
    return Response.redirect(errorUrl.toString(), 302);
  }
};
