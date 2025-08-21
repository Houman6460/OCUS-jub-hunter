import { Env } from '../../lib/context';

// Type definitions
interface AuthSettings {
  facebook_enabled: number;
  facebook_app_id: string;
  facebook_app_secret: string;
}

interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface FacebookUserResponse {
  id: string;
  name: string;
  email: string;
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
      'SELECT facebook_enabled, facebook_app_id, facebook_app_secret FROM auth_settings WHERE id = 1'
    ).first<AuthSettings>();

    if (!authSettings?.facebook_enabled) {
      return new Response('Facebook login is not enabled.', { status: 400 });
    }

    const { facebook_app_id, facebook_app_secret } = authSettings;
    const redirectUri = `${url.origin}/api/auth/facebook`;

    // 2. If no code is present, redirect to Facebook for authentication
    if (!code) {
      const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
      authUrl.searchParams.set('client_id', facebook_app_id);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'email,public_profile');
      return Response.redirect(authUrl.toString(), 302);
    }

    // 3. Exchange the authorization code for an access token
    const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: facebook_app_id,
        client_secret: facebook_app_secret,
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Failed to get access token: ${errorText}`);
    }

    const tokenData = await tokenResponse.json() as FacebookTokenResponse;

    // 4. Use the access token to fetch user details from Facebook
    const userResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${tokenData.access_token}`);

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data from Facebook.');
    }

    const userData = await userResponse.json() as FacebookUserResponse;

    if (!userData.email) {
      return new Response('Email not provided by Facebook.', { status: 400 });
    }

    // 5. Check if the user exists in the database or create a new one
    let user = await env.DB.prepare('SELECT id, name, email FROM users WHERE email = ?').bind(userData.email).first<User>();

    if (!user) {
      const now = new Date().toISOString();
      await env.DB.prepare(
        'INSERT INTO users (email, name, provider, provider_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(userData.email, userData.name, 'facebook', userData.id, now, now).run();

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
    console.error('Facebook OAuth Error:', error);
    const errorUrl = new URL('/login', url.origin);
    errorUrl.searchParams.set('error', 'oauth_failed');
    errorUrl.searchParams.set('provider', 'facebook');
    return Response.redirect(errorUrl.toString(), 302);
  }
};
