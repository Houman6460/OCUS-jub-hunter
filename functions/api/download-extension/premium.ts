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
      const userId = parseInt(token.split('-')[2], 10);
      if (isNaN(userId)) {
        return new Response('Invalid token format', { status: 401 });
      }

      if (!env.DB) {
        return new Response('Database not available', { status: 500 });
      }

      const customer = await env.DB.prepare(
        'SELECT extension_activated FROM customers WHERE id = ?'
      ).bind(userId).first<{ extension_activated: number }>();

      if (customer && customer.extension_activated) {
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
