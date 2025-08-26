// Cloudflare Pages Function: /api/download-premium
// Handles premium extension download access validation

import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../lib/context';

interface DownloadRequest {
  customerId?: number;
  customerEmail?: string;
  activationCode?: string;
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json() as DownloadRequest;
    const { customerId, customerEmail, activationCode } = body;

    if (!customerId && !customerEmail && !activationCode) {
      return json({ success: false, message: 'Customer identification required' }, 400);
    }

    // Check if D1 database is available
    if (!env.DB) {
      console.error('D1 database not available');
      return json({ success: false, message: 'Database not available' }, 500);
    }

    try {
      let customer: any = null;

      // Initialize tables if they don't exist
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS activation_codes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT UNIQUE NOT NULL,
          customer_id INTEGER,
          order_id INTEGER,
          user_id INTEGER,
          is_active BOOLEAN DEFAULT 1 NOT NULL,
          created_at TEXT NOT NULL
        )
      `).run();

      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS extension_downloads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_id INTEGER NOT NULL,
          download_token TEXT UNIQUE NOT NULL,
          download_type TEXT DEFAULT 'premium' NOT NULL,
          downloaded_at TEXT NOT NULL,
          ip_address TEXT,
          user_agent TEXT,
          created_at TEXT NOT NULL
        )
      `).run();

      // Find customer by different methods
      if (customerId) {
        try {
          customer = await env.DB.prepare(`
            SELECT id, email, name, is_premium, extension_activated, total_spent 
            FROM customers WHERE id = ?
          `).bind(customerId).first();
        } catch (e) {
          console.log('Customer query failed, trying fallback');
        }
      } else if (customerEmail) {
        try {
          customer = await env.DB.prepare(`
            SELECT id, email, name, is_premium, extension_activated, total_spent 
            FROM customers WHERE email = ?
          `).bind(customerEmail).first();
        } catch (e) {
          console.log('Customer email query failed, trying fallback');
        }
      } else if (activationCode) {
        // Find customer by activation code
        try {
          const codeResult = await env.DB.prepare(`
            SELECT c.id, c.email, c.name, c.is_premium, c.extension_activated, c.total_spent
            FROM customers c
            JOIN activation_codes ac ON c.id = ac.customer_id
            WHERE ac.code = ? AND ac.is_active = 1
          `).bind(activationCode).first();
          customer = codeResult;
        } catch (e) {
          console.log('Activation code query failed:', e);
        }
      }

      if (!customer) {
        return json({ 
          success: false, 
          message: 'Customer not found or invalid credentials' 
        }, 404);
      }

      // Check if customer has premium access AND valid paid orders
      const hasBasicAccess = customer.is_premium && customer.extension_activated;

      if (!hasBasicAccess) {
        return json({
          success: false,
          message: 'Premium access not activated. Please complete your purchase first.',
          customerStatus: {
            isPremium: customer.is_premium,
            extensionActivated: customer.extension_activated,
            totalSpent: customer.total_spent
          }
        }, 403);
      }

      // CRITICAL: Verify customer has completed orders with actual payment
      let hasValidOrders = false;
      try {
        const orderCheck = await env.DB.prepare(`
          SELECT COUNT(*) as orderCount, SUM(final_amount) as totalPaid
          FROM orders 
          WHERE user_id = ? AND status = 'completed' AND final_amount > 0
        `).bind(customer.id).first();
        
        hasValidOrders = (orderCheck as any)?.orderCount > 0 && 
                        parseFloat((orderCheck as any)?.totalPaid || '0') > 0;
      } catch (e) {
        console.log('Order check failed - denying access for security');
        hasValidOrders = false; // Fail secure - no fallback for premium access
      }

      if (!hasValidOrders) {
        return json({
          success: false,
          message: 'No valid premium purchases found. Premium download requires completed payment.',
          customerStatus: {
            isPremium: customer.is_premium,
            extensionActivated: customer.extension_activated,
            totalSpent: customer.total_spent,
            requiresPayment: true
          }
        }, 403);
      }

      // Generate download token and log download attempt
      const downloadToken = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      // Log the download
      try {
        await env.DB.prepare(`
          INSERT INTO extension_downloads (
            customer_id, download_token, download_type, downloaded_at, 
            ip_address, user_agent, created_at
          ) VALUES (?, ?, 'premium', ?, ?, ?, ?)
        `).bind(
          customer.id,
          downloadToken,
          now,
          request.headers.get('CF-Connecting-IP') || 'unknown',
          request.headers.get('User-Agent') || 'unknown',
          now
        ).run();
      } catch (e) {
        console.log('Failed to log download, continuing anyway:', e);
      }

      // Get activation code for the customer
      let customerActivationCode = null;
      try {
        const activationResult = await env.DB.prepare(`
          SELECT code FROM activation_codes 
          WHERE customer_id = ? AND is_active = 1 
          ORDER BY created_at DESC LIMIT 1
        `).bind(customer.id).first();
        customerActivationCode = (activationResult as any)?.code;
      } catch (e) {
        console.log('Failed to get activation code:', e);
        // Generate a temporary activation code if none exists
        customerActivationCode = `TEMP_${Date.now()}_${customer.id}`;
      }

      return json({
        success: true,
        message: 'Download access granted',
        downloadEnabled: true,
        downloadToken,
        activationCode: customerActivationCode,
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          subscriptionStatus: customer.subscription_status
        }
      });

    } catch (dbError: any) {
      console.error('Database error during download validation:', dbError);
      return json({
        success: false,
        message: 'Failed to validate download access',
        error: dbError.message
      }, 500);
    }

  } catch (error: any) {
    console.error('Download validation error:', error);
    return json({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, 500);
  }
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const customerId = url.searchParams.get('customerId');
  const customerEmail = url.searchParams.get('customerEmail');

  if (!customerId && !customerEmail) {
    return json({ success: false, message: 'Customer identification required' }, 400);
  }

  // Check if D1 database is available
  if (!env.DB) {
    return json({ success: false, message: 'Database not available' }, 500);
  }

  try {
    let customer: any = null;

    if (customerId) {
      customer = await env.DB.prepare(`
        SELECT id, email, name, is_premium, extension_activated, total_spent 
        FROM customers WHERE id = ?
      `).bind(parseInt(customerId)).first();
    } else if (customerEmail) {
      customer = await env.DB.prepare(`
        SELECT id, email, name, is_premium, extension_activated, total_spent 
        FROM customers WHERE email = ?
      `).bind(customerEmail).first();
    }

    if (!customer) {
      return json({ success: false, downloadEnabled: false, message: 'Customer not found' });
    }

    const hasAccess = customer.is_premium && 
                     customer.extension_activated;

    return json({
      success: true,
      downloadEnabled: hasAccess,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        totalSpent: customer.total_spent,
        isPremium: customer.is_premium,
        extensionActivated: customer.extension_activated
      }
    });

  } catch (error: any) {
    console.error('Download status check error:', error);
    return json({ success: false, downloadEnabled: false, error: error.message }, 500);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
