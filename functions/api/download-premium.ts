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

      // Find customer by different methods
      if (customerId) {
        customer = await env.DB.prepare(`
          SELECT id, email, name, is_activated, extension_activated, subscription_status 
          FROM customers WHERE id = ?
        `).bind(customerId).first();
      } else if (customerEmail) {
        customer = await env.DB.prepare(`
          SELECT id, email, name, is_activated, extension_activated, subscription_status 
          FROM customers WHERE email = ?
        `).bind(customerEmail).first();
      } else if (activationCode) {
        // Find customer by activation code
        const codeResult = await env.DB.prepare(`
          SELECT c.id, c.email, c.name, c.is_activated, c.extension_activated, c.subscription_status
          FROM customers c
          JOIN activation_codes ac ON c.id = ac.customer_id
          WHERE ac.code = ? AND ac.is_active = true
        `).bind(activationCode).first();
        customer = codeResult;
      }

      if (!customer) {
        return json({ 
          success: false, 
          message: 'Customer not found or invalid credentials' 
        }, 404);
      }

      // Check if customer has premium access
      const hasAccess = customer.is_activated && 
                       customer.extension_activated && 
                       customer.subscription_status === 'active';

      if (!hasAccess) {
        return json({
          success: false,
          message: 'Premium access not activated. Please complete your purchase first.',
          customerStatus: {
            isActivated: customer.is_activated,
            extensionActivated: customer.extension_activated,
            subscriptionStatus: customer.subscription_status
          }
        }, 403);
      }

      // Check if customer has valid orders
      const orderCheck = await env.DB.prepare(`
        SELECT COUNT(*) as orderCount 
        FROM orders 
        WHERE user_id = ? AND status = 'completed'
      `).bind(customer.id).first();

      const hasValidOrders = (orderCheck as any)?.orderCount > 0;

      if (!hasValidOrders) {
        return json({
          success: false,
          message: 'No valid premium purchases found'
        }, 403);
      }

      // Generate download token and log download attempt
      const downloadToken = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      // Log the download
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

      // Get activation code for the customer
      const activationResult = await env.DB.prepare(`
        SELECT code FROM activation_codes 
        WHERE customer_id = ? AND is_active = true 
        ORDER BY created_at DESC LIMIT 1
      `).bind(customer.id).first();

      const customerActivationCode = (activationResult as any)?.code;

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
        SELECT id, email, name, is_activated, extension_activated, subscription_status 
        FROM customers WHERE id = ?
      `).bind(parseInt(customerId)).first();
    } else if (customerEmail) {
      customer = await env.DB.prepare(`
        SELECT id, email, name, is_activated, extension_activated, subscription_status 
        FROM customers WHERE email = ?
      `).bind(customerEmail).first();
    }

    if (!customer) {
      return json({ success: false, downloadEnabled: false, message: 'Customer not found' });
    }

    const hasAccess = customer.is_activated && 
                     customer.extension_activated && 
                     customer.subscription_status === 'active';

    return json({
      success: true,
      downloadEnabled: hasAccess,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        subscriptionStatus: customer.subscription_status,
        isActivated: customer.is_activated,
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
