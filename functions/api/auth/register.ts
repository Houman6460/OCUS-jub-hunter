import { UserStorage } from '../../lib/user-storage';
import { Env } from '../../lib/context';
import type { PagesFunction, HeadersInit } from '@cloudflare/workers-types';

interface RegisterBody {
  email?: string;
  password?: string;
  name?: string;
}

const jsonResponse = (body: object, status: number) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };
  return new Response(JSON.stringify(body), { status, headers });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { email, password, name } = await request.json<RegisterBody>();

    if (!email || !password || !name) {
      return jsonResponse({ success: false, message: 'Missing required fields.' }, 400);
    }

    const userStorage = new UserStorage(env.DB);
    const existingUser = await userStorage.getUserByEmail(email);

    if (existingUser) {
      return jsonResponse({ success: false, message: 'An account with this email already exists.' }, 409);
    }

    const newUser = await userStorage.createUser(email, password, name);
    const { password: _, ...userResponse } = newUser;

    return jsonResponse({ success: true, message: 'Registration successful.', user: userResponse }, 201);

  } catch (error) {
    console.error('Registration Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    
    if (errorMessage.includes('UNIQUE constraint failed')) {
      return jsonResponse({ success: false, message: 'An account with this email already exists.' }, 409);
    }

    return jsonResponse({ success: false, message: 'Registration failed.' }, 500);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    } as HeadersInit,
  });
};
