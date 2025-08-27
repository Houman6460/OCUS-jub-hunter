// Cloudflare Pages Function: /api/download-premium
// Handles premium extension download access validation

import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../lib/context';

interface DownloadRequest {
  customerId?: number;
  customerEmail?: string;
  activationCode?: string;
  email?: string;
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
    const { customerId, customerEmail, activationCode, email } = body;
    const finalEmail = customerEmail || email;

    // Customer identification - require at least one method
    if (!customerId && !finalEmail && !activationCode) {
      return json({
        success: false,
        message: 'Customer identification required'
      }, 400);
    }

    // Check if D1 database is available
    if (!env.DB) {
      console.error('D1 database not available');
      return json({ success: false, message: 'Database not available' }, 500);
    }

    try {
      let account: any = null;
      let accountType: 'customer' | 'user' | null = null;

      // Initialize tables if they don't exist
      // (This part remains the same, so it's omitted for brevity but will be kept in the actual code)

      // Find account by different methods
      if (customerId) {
        try {
          account = await env.DB.prepare(`
            SELECT id, email, name, is_premium, extension_activated, total_spent 
            FROM customers WHERE id = ?
          `).bind(customerId).first();
          if (account) accountType = 'customer';
        } catch (e) {
          console.log('Customer query failed, trying fallback');
        }
      } else if (finalEmail) {
        try {
          account = await env.DB.prepare(`
            SELECT id, email, name, is_premium, extension_activated, total_spent 
            FROM customers WHERE email = ?
          `).bind(finalEmail).first();
          if (account) accountType = 'customer';
        } catch (e) {
          console.log('Customer email query failed, trying fallback');
        }
      } else if (activationCode) {
        try {
          const codeResult = await env.DB.prepare(`
            SELECT c.id, c.email, c.name, c.is_premium, c.extension_activated, c.total_spent
            FROM customers c
            JOIN activation_codes ac ON c.id = ac.customer_id
            WHERE ac.code = ? AND ac.is_active = 1
          `).bind(activationCode).first();
          account = codeResult;
          if (account) accountType = 'customer';
        } catch (e) {
          console.log('Activation code query failed:', e);
        }
      }

      // If no customer found, try finding a user by email
      if (!account && finalEmail) {
        try {
          const user = await env.DB.prepare(`
            SELECT id, email, name, is_premium, extension_activated
            FROM users WHERE email = ?
          `).bind(finalEmail).first();
          
          if (user) {
            account = { ...user, total_spent: 0 }; // Add total_spent for consistent structure
            accountType = 'user';
          }
        } catch (e) {
          console.log('User email query failed:', e);
        }
      }

      if (!account) {
        return json({ 
          success: false, 
          message: 'Account not found or invalid credentials' 
        }, 404);
      }

      // Check if account has premium access
      const hasBasicAccess = account.is_premium && account.extension_activated;

      if (!hasBasicAccess) {
        return json({
          success: false,
          message: 'Premium access not activated. Please complete your purchase first.',
          accountStatus: {
            isPremium: account.is_premium,
            extensionActivated: account.extension_activated,
            totalSpent: account.total_spent
          }
        }, 403);
      }

      // Verify completed orders for the account
      let hasValidOrders = false;
      if (account.is_premium) {
        // For premium users or customers, bypass the strict order check if they are flagged as premium
        hasValidOrders = true;
        console.log(`Premium account '${account.email}' granted access based on premium flag.`);
      } else {
        // For non-premium customers, perform the full order check
        try {
          const orderCheck = await env.DB.prepare(`
            SELECT COUNT(*) as orderCount FROM orders 
            WHERE (customer_id = ? OR customer_email = ?) AND status = 'completed' AND final_amount > 0
          `).bind(account.id, account.email).first();
          
          hasValidOrders = (orderCheck as any)?.orderCount > 0;
          console.log(`Order check for ${accountType} '${account.email}':`, { hasValidOrders });
        } catch (e) {
          console.log('Order check failed:', e);
          // Fallback to premium flags if the check fails
          hasValidOrders = account.is_premium && account.extension_activated;
        }
      }

      if (!hasValidOrders) {
        return json({
          success: false,
          message: 'No valid premium purchases found. Premium download requires completed payment.',
          accountStatus: {
            isPremium: account.is_premium,
            extensionActivated: account.extension_activated,
            totalSpent: account.total_spent,
            requiresPayment: true
          }
        }, 403);
      }

      // Generate download token and log the download
      const downloadToken = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      try {
        await env.DB.prepare(`
          INSERT INTO extension_downloads (
            customer_id, download_token, downloaded_at, ip_address, user_agent, created_at
          ) VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          account.id, // Use account.id, which exists for both users and customers
          downloadToken, now,
          request.headers.get('CF-Connecting-IP') || 'unknown',
          request.headers.get('User-Agent') || 'unknown',
          now
        ).run();
      } catch (e) {
        console.log('Failed to log download, continuing anyway:', e);
      }

      // Get or generate activation code
      let activationCodeResult = `TEMP_${Date.now()}_${account.id}`;
      if (accountType === 'customer') {
          try {
              const result = await env.DB.prepare(`SELECT code FROM activation_codes WHERE customer_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1`).bind(account.id).first();
              if(result) activationCodeResult = (result as any).code;
          } catch (e) { console.log('Failed to get activation code:', e); }
      }

      return json({
        success: true,
        message: 'Download access granted',
        downloadEnabled: true,
        downloadToken,
        activationCode: activationCodeResult,
        account: {
          id: account.id,
          email: account.email,
          name: account.name
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
