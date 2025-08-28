import { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../../lib/context';
import { DatabaseStorage } from '../../../server/storage';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../../../shared/schema';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const url = new URL(request.url);
    const customerEmail = url.searchParams.get('email');
    const userId = url.searchParams.get('userId'); // Support both email and userId

    if (!customerEmail && !userId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email or userId parameter is required' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (!env.DB) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Database not available' 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Initialize database connection and storage
    const db = drizzle(env.DB, { schema });
    const storage = new DatabaseStorage(db);

    let orders = [];
    let customer = null;

    try {
      if (customerEmail) {
        // Get customer by email
        customer = await storage.getCustomerByEmail(customerEmail);
        if (customer) {
          // Get orders for this customer
          orders = await storage.getCustomerOrders(customer.id.toString());
        }
        
        // Also check if there's a user account with this email
        const user = await storage.getUserByEmail(customerEmail);
        if (user) {
          const userOrders = await storage.getUserOrders(user.id);
          // Merge and deduplicate orders
          const allOrders = [...orders, ...userOrders];
          const uniqueOrders = allOrders.filter((order, index, self) => 
            index === self.findIndex(o => o.id === order.id)
          );
          orders = uniqueOrders;
        }
      } else if (userId) {
        // Get orders by user ID
        orders = await storage.getUserOrders(parseInt(userId));
      }

      // Sort orders by creation date (most recent first)
      orders.sort((a, b) => {
        const dateA = a.completedAt || a.createdAt || 0;
        const dateB = b.completedAt || b.createdAt || 0;
        return dateB - dateA;
      });

      console.log(`Found ${orders.length} orders for ${customerEmail || userId}`);

      return new Response(JSON.stringify({
        success: true,
        orders: orders,
        customer: customer ? {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          subscriptionStatus: customer.subscriptionStatus,
          extensionActivated: customer.extensionActivated
        } : null
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });

    } catch (dbError) {
      console.error('Database error in user-orders:', dbError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Database query failed',
        details: String(dbError)
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

  } catch (error) {
    console.error('Error fetching user orders:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch orders',
      details: String(error)
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
};
