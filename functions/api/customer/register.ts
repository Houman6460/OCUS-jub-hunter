import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../../lib/context';

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  recaptchaToken?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { email, password, name, recaptchaToken } = await request.json() as RegisterRequest;
    
    if (!email || !password || !name) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Missing required fields'
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Check if D1 database is available
    if (!env.DB) {
      console.error('D1 database not available');
      return new Response(JSON.stringify({
        success: false,
        message: 'Database not available'
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Create users table if it doesn't exist
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'customer',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // Create customers table if it doesn't exist
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_premium BOOLEAN DEFAULT 0,
        extension_activated BOOLEAN DEFAULT 0,
        total_spent DECIMAL(10,2) DEFAULT 0,
        total_orders INTEGER DEFAULT 0
      )
    `).run();

    const now = new Date().toISOString();

    console.log('Registering user:', email, 'with password length:', password.length);

    // Check if user already exists
    const existingUser = await env.DB.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(email).first();

    if (existingUser) {
      return new Response(JSON.stringify({
        success: false,
        message: 'User already exists'
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Insert user into users table
    const userResult = await env.DB.prepare(`
      INSERT INTO users (email, password, name, role, created_at)
      VALUES (?, ?, ?, 'customer', ?)
    `).bind(email, password, name, now).run();

    console.log('User inserted with ID:', userResult.meta.last_row_id);

    // Insert customer into customers table
    const customerResult = await env.DB.prepare(`
      INSERT INTO customers (email, name, created_at)
      VALUES (?, ?, ?)
    `).bind(email, name, now).run();

    console.log('Customer inserted with ID:', customerResult.meta.last_row_id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Registration successful',
      user: {
        id: userResult.meta.last_row_id,
        email,
        name,
        role: 'customer'
      }
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error: any) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Registration failed: ' + error.message
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
