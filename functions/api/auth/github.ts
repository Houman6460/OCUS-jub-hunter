export const onRequestGet = async (context: any) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  
  try {
    // Fetch auth settings from database
    const authQuery = `SELECT * FROM auth_settings WHERE id = 1`;
    const authSettings = await env.DB.prepare(authQuery).first();
    
    if (!authSettings || !authSettings.github_enabled) {
      return new Response('GitHub login is not enabled', { status: 400 });
    }

    if (!code) {
      // Redirect to GitHub OAuth
      const clientId = authSettings.github_client_id;
      const redirectUri = `${url.origin}/api/auth/github`;
      const scope = 'user:email';
      
      const githubAuthUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=${encodeURIComponent(clientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `state=${encodeURIComponent(state || 'default')}`;
      
      return Response.redirect(githubAuthUrl, 302);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: authSettings.github_client_id,
        client_secret: authSettings.github_client_secret,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      throw new Error(`GitHub OAuth error: ${tokenData.error_description}`);
    }

    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'OCUS-Job-Hunter',
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userData = await userResponse.json();

    // Get user email if not public
    let email = userData.email;
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'OCUS-Job-Hunter',
        },
      });

      if (emailResponse.ok) {
        const emails = await emailResponse.json();
        const primaryEmail = emails.find((e: any) => e.primary);
        email = primaryEmail ? primaryEmail.email : emails[0]?.email;
      }
    }

    if (!email) {
      throw new Error('Email not available from GitHub');
    }

    // Check if user exists in database
    const userQuery = `SELECT * FROM users WHERE email = ?`;
    let user = await env.DB.prepare(userQuery).bind(email).first();

    if (!user) {
      // Create new user
      const insertQuery = `
        INSERT INTO users (email, name, provider, provider_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const now = new Date().toISOString();
      
      await env.DB.prepare(insertQuery)
        .bind(email, userData.name || userData.login, 'github', userData.id.toString(), now, now)
        .run();
      
      // Fetch the newly created user
      user = await env.DB.prepare(userQuery).bind(email).first();
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
    console.error('GitHub OAuth error:', error);
    const errorUrl = `${url.origin}/login?error=oauth_failed&provider=github`;
    return Response.redirect(errorUrl, 302);
  }
};
