import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../../lib/context';

// Type definitions for GitHub OAuth flow
interface GitHubTokenResponse {
  access_token: string;
  error?: string;
  error_description?: string;
}

interface GitHubUserResponse {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
}

interface GitHubEmailResponse {
    email: string;
    primary: boolean;
    verified: boolean;
    visibility: string | null;
}

// Type definition for database records
interface AuthSettings {
  github_enabled: 0 | 1;
  github_client_id: string;
  github_client_secret: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  try {
    // 1. Fetch auth settings from the database
    const authSettings = await env.DB.prepare('SELECT github_enabled, github_client_id, github_client_secret FROM auth_settings WHERE id = 1').first<AuthSettings>();

    if (!authSettings?.github_enabled) {
      return new Response('GitHub login is not enabled.', { status: 400 });
    }

    if (!authSettings.github_client_id || !authSettings.github_client_secret) {
      return new Response('GitHub client ID or secret is not configured.', { status: 500 });
    }

    // 2. If no code is present, redirect to GitHub to authorize
    if (!code) {
      const authUrl = new URL('https://github.com/login/oauth/authorize');
      authUrl.searchParams.set('client_id', authSettings.github_client_id);
      authUrl.searchParams.set('redirect_uri', `${url.origin}/api/auth/github`);
      authUrl.searchParams.set('scope', 'user:email');
      authUrl.searchParams.set('state', state || crypto.randomUUID());
      return Response.redirect(authUrl.toString(), 302);
    }

    // 3. Exchange the authorization code for an access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: authSettings.github_client_id,
        client_secret: authSettings.github_client_secret,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json() as GitHubTokenResponse;
    if (tokenData.error || !tokenData.access_token) {
      throw new Error(`Failed to get access token: ${tokenData.error_description || 'No token returned'}`);
    }

    // 4. Use the access token to fetch user details from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'User-Agent': 'OCUS-Job-Hunter',
      },
    });
    const userData = await userResponse.json() as GitHubUserResponse;

    // 5. Fetch user's primary email if not included in the main user response
    let userEmail = userData.email;
    if (!userEmail) {
        const emailResponse = await fetch('https://api.github.com/user/emails', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'User-Agent': 'OCUS-Job-Hunter',
            },
        });
        const emails = await emailResponse.json() as GitHubEmailResponse[];
        const primaryEmail = emails.find((e: GitHubEmailResponse) => e.primary && e.verified);
        userEmail = primaryEmail?.email || null;
    }

    if (!userEmail) {
        return new Response('Could not retrieve a verified primary email from GitHub.', { status: 400 });
    }

    // 6. Check if the user exists in the database
    let user = await env.DB.prepare('SELECT id, name, email FROM users WHERE github_id = ?').bind(userData.id).first<User>();

    // 7. If user does not exist, create a new user record
    if (!user) {
        const name = userData.name || userData.login;
        const now = new Date().toISOString();
        await env.DB.prepare(
            'INSERT INTO users (email, name, provider, provider_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(userEmail, name, 'github', userData.id, now, now).run();

        // Retrieve the newly created user
        user = await env.DB.prepare('SELECT id, name, email FROM users WHERE github_id = ?').bind(userData.id).first<User>();
    }

    if (!user) {
        return new Response('Failed to create or find user.', { status: 500 });
    }

    // 8. User is now authenticated. Redirect to the dashboard.
    // (In a real app, you would create a session/JWT here)
    const redirectUrl = new URL(`${url.origin}/dashboard`);
    redirectUrl.searchParams.set('status', 'loggedIn');
    redirectUrl.searchParams.set('userId', user.id.toString());
    redirectUrl.searchParams.set('name', user.name);
    redirectUrl.searchParams.set('email', user.email);

    return Response.redirect(redirectUrl.toString(), 302);

  } catch (error) {
    console.error('GitHub OAuth Error:', error);
    const errorUrl = new URL(`${url.origin}/login`);
    errorUrl.searchParams.set('error', 'github_oauth_failed');
    return Response.redirect(errorUrl.toString(), 302);
  }
};
