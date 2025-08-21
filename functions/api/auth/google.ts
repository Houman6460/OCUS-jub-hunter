import { PagesFunctionEnv } from '../../lib/context';

export const onRequestGet: PagesFunction<PagesFunctionEnv> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  
  try {
    // Fetch auth settings from database
    const authQuery = `SELECT * FROM auth_settings WHERE id = 1`;
    const authSettings = await env.DB.prepare(authQuery).first();
    
    if (!authSettings || !authSettings.google_enabled) {
      return new Response('Google login is not enabled', { status: 400 });
    }

    if (!code) {
      // Redirect to Google OAuth
      const clientId = authSettings.google_client_id;
      const redirectUri = `${url.origin}/api/auth/google`;
      const scope = 'openid email profile';
      
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(clientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `state=${encodeURIComponent(state || 'default')}`;
      
      return Response.redirect(googleAuthUrl, 302);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: authSettings.google_client_id,
        client_secret: authSettings.google_client_secret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: `${url.origin}/api/auth/google`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    
    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userData = await userResponse.json();

    // Check if user exists in database
    const userQuery = `SELECT * FROM users WHERE email = ?`;
    let user = await env.DB.prepare(userQuery).bind(userData.email).first();

    if (!user) {
      // Create new user
      const insertQuery = `
        INSERT INTO users (email, name, provider, provider_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const now = new Date().toISOString();
      
      await env.DB.prepare(insertQuery)
        .bind(userData.email, userData.name, 'google', userData.id, now, now)
        .run();
      
      // Fetch the newly created user
      user = await env.DB.prepare(userQuery).bind(userData.email).first();
    }

    // Generate JWT token (simplified for demo)
    const token = btoa(JSON.stringify({
      userId: user.id,
      email: user.email,
      name: user.name,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }));

    // Redirect to frontend with token
    const redirectUrl = `${url.origin}/dashboard?token=${token}`;
    return Response.redirect(redirectUrl, 302);

  } catch (error: any) {
    console.error('Google OAuth error:', error);
    const errorUrl = `${url.origin}/login?error=oauth_failed&provider=google`;
    return Response.redirect(errorUrl, 302);
  }
};
