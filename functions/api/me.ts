// Cloudflare Pages Function: /api/me
// Handles user profile retrieval

import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../lib/context';

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
  });
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    // Check authorization header for token
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return json({ 
        error: 'Unauthorized' 
      }, 401);
    }

    const token = authHeader.substring(7);
    
    // Handle demo-jwt-token
    if (token === 'demo-jwt-token') {
      return json({
        id: 1,
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'customer',
        createdAt: new Date().toISOString(),
        isPremium: true,
        extensionActivated: true,
        totalSpent: 29.99,
        totalOrders: 1,
        isAuthenticated: true
      });
    }
    
    // Handle jwt-token-{userId}-{timestamp} format
    if (token.startsWith('jwt-token-')) {
      const parts = token.split('-');
      if (parts.length >= 3) {
        const userId = parts[2];
        console.log('Parsed userId from token:', userId, 'from token:', token);
        
        // Check database for real user data
        if (!env.DB) {
          return json({ error: 'Database not available' }, 500);
        }

        try {
          // Use D1 Sessions API for consistent reads
          const session = env.DB.withSession('first-primary');
          
          // The token format is jwt-token-{email}-{timestamp}, not userId
          // Extract email from token instead of treating as userId
          console.log('Token parts:', parts);
          const userEmail = parts[2]; // This is actually the email
          
          // First try users table (for registered users) - search by email
          const user = await session.prepare(`
            SELECT id, email, name, role, created_at, is_premium, extension_activated, 
                   premium_activated_at, total_spent, total_orders
            FROM users WHERE email = ?
          `).bind(userEmail).first();

          console.log('User lookup result:', user);

          if (user) {
            return json({
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role || 'customer',
              createdAt: user.created_at,
              isPremium: Boolean(user.is_premium),
              extensionActivated: Boolean(user.extension_activated),
              premiumActivatedAt: user.premium_activated_at,
              totalSpent: parseFloat(String(user.total_spent || '0')),
              totalOrders: parseInt(String(user.total_orders || '0')),
              isAuthenticated: true
            });
          }

          // Fallback to customers table (for legacy users) - search by email
          const customer = await session.prepare(`
            SELECT id, email, name, is_premium, extension_activated, created_at,
                   total_spent, total_orders
            FROM customers WHERE email = ?
          `).bind(userEmail).first();

          console.log('Customer lookup result:', customer);

          if (customer) {
            return json({
              id: customer.id,
              email: customer.email,
              name: customer.name,
              role: 'customer',
              createdAt: customer.created_at,
              isPremium: Boolean(customer.is_premium),
              extensionActivated: Boolean(customer.extension_activated),
              totalSpent: parseFloat(String(customer.total_spent || '0')),
              totalOrders: parseInt(String(customer.total_orders || '0')),
              isAuthenticated: true
            });
          }

          // Fallback to settings table (for purchases made when users table was missing)
          const userSettingsKey = `user_${userEmail.replace('@', '_at_').replace('.', '_dot_')}`;
          const userSetting = await session.prepare(`
            SELECT value FROM settings WHERE key = ?
          `).bind(userSettingsKey).first();

          console.log('User setting lookup result:', userSetting);

          if (userSetting && typeof userSetting.value === 'string') {
            try {
              const userData = JSON.parse(userSetting.value);
              if (userData.isPremium) {
                return json({
                  id: userData.id || userEmail, // Fallback id
                  email: userData.email,
                  name: userData.name,
                  role: 'customer',
                  createdAt: userData.updatedAt, // Use updatedAt as a proxy for creation
                  isPremium: true,
                  extensionActivated: true, // Assume activated if premium
                  totalSpent: 0, // Not tracked in this fallback
                  totalOrders: 0, // Not tracked in this fallback
                  isAuthenticated: true
                });
              }
            } catch (parseError) {
              console.error('Failed to parse user data from settings:', parseError);
            }
          }
        } catch (dbError) {
          console.error('Database error in /api/me:', dbError);
        }
      }
    }
    
    // For any other token, return unauthorized
    return json({ 
      error: 'Invalid token' 
    }, 401);
    
  } catch (error: any) {
    return json({ 
      error: error.message 
    }, 500);
  }
};
