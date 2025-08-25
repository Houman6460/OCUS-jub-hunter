// Cloudflare Pages Function: /api/invoices
// Handles invoice retrieval

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
      return json([]);
    }

    const token = authHeader.substring(7);
    
    // Handle demo-jwt-token
    if (token === 'demo-jwt-token') {
      const demoInvoice = {
        id: 1,
        invoiceNumber: 'INV-2025-000001',
        customerId: 1,
        customerName: 'Demo User',
        customerEmail: 'demo@example.com',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        subtotal: '29.99',
        totalAmount: '29.99',
        currency: 'USD',
        status: 'paid',
        paidAt: new Date().toISOString(),
        notes: 'Premium extension purchase'
      };
      
      return json([demoInvoice]);
    }
    
    // Handle jwt-token-{userId}-{timestamp} format
    if (token.startsWith('jwt-token-')) {
      const parts = token.split('-');
      if (parts.length >= 3) {
        const userId = parts[2];
        // For user ID 1, return demo invoice
        if (userId === '1') {
          const demoInvoice = {
            id: 1,
            invoiceNumber: 'INV-2025-000001',
            customerId: 1,
            customerName: 'Demo User',
            customerEmail: 'demo@example.com',
            invoiceDate: new Date().toISOString().split('T')[0],
            dueDate: new Date().toISOString().split('T')[0],
            subtotal: '29.99',
            totalAmount: '29.99',
            currency: 'USD',
            status: 'paid',
            paidAt: new Date().toISOString(),
            notes: 'Premium extension purchase'
          };
          
          return json([demoInvoice]);
        }
      }
    }
    
    // For any other case, return empty array
    return json([]);
    
  } catch (error: any) {
    return json({ 
      error: error.message 
    }, 500);
  }
};
