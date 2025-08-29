// Cloudflare Pages Function: /api/download-extension/premium
// Handles premium extension download

import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../../lib/context';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Check if user has premium access
        // Handle demo user separately
    if (token === 'demo-jwt-token') {
      // Return a mock ZIP file for demo purposes
      const mockZipContent = new Uint8Array([
        0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x50, 0x4B, 0x05, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00
      ]);
      
      return new Response(mockZipContent, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': 'attachment; filename="ocus-job-hunter-premium-v2.1.8-STABLE.zip"',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // For real users, verify premium access from the database
    if (token.startsWith('jwt-token-')) {
      const parts = token.split('-');
      if (parts.length < 3) {
        return new Response('Invalid token format', { status: 401 });
      }

      const userEmail = parts[2]; // Token format: jwt-token-{email}-{timestamp}

      if (!env.DB) {
        return new Response('Database not available', { status: 500 });
      }

      // Check both customer status AND actual completed orders
      const customer = await env.DB.prepare(
        'SELECT id, extension_activated, total_spent FROM customers WHERE email = ?'
      ).bind(userEmail).first<{ id: number; extension_activated: number; total_spent: string }>();

      if (!customer) {
        return new Response('Customer not found', { status: 404 });
      }

      // Verify customer has completed orders with payment (orders keyed by customer_email)
      const orderCheck = await env.DB.prepare(`
        SELECT COUNT(*) as orderCount, SUM(final_amount) as totalPaid
        FROM orders 
        WHERE customer_email = ? AND status = 'completed' AND final_amount > 0
      `).bind(userEmail).first<{ orderCount: number; totalPaid: string }>();

      const hasValidPurchase = Boolean(customer.extension_activated) && 
                              orderCheck !== null && 
                              Number(orderCheck.orderCount || 0) > 0 && 
                              parseFloat(String(orderCheck.totalPaid || '0')) > 0;

      if (hasValidPurchase) {
        // Log the download attempt for security tracking
        try {
          const downloadToken = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const now = new Date().toISOString();
          
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
          console.log('Failed to log download:', e);
        }

        // User has premium access, return the mock ZIP file
        const mockZipContent = new Uint8Array([
          0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
          0x50, 0x4B, 0x05, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x00, 0x00
        ]);
        
        return new Response(mockZipContent, {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': 'attachment; filename="ocus-job-hunter-premium-v2.1.8-STABLE.zip"',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }
    
    return new Response('Premium access required', { status: 403 });
    
  } catch (error: any) {
    return new Response('Download failed', { status: 500 });
  }
};

