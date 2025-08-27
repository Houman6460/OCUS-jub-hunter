// Cloudflare Pages Function: /api/admin/update-premium-status
// Updates existing purchase records to reflect premium status

import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../../lib/context';

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    if (!env.DB) {
      return json({ success: false, message: 'Database not available' }, 500);
    }

    const now = new Date().toISOString();
    let updatedRecords = 0;

    // Find all completed orders that should have premium status
    const completedOrders = await env.DB.prepare(`
      SELECT DISTINCT customer_id, customer_email, customer_name, final_amount
      FROM orders 
      WHERE status = 'completed' AND final_amount > 0
    `).all();

    console.log('Found completed orders:', completedOrders.results?.length);

    if (completedOrders.results && completedOrders.results.length > 0) {
      for (const order of completedOrders.results) {
        const orderData = order as any;
        
        // Update customers table
        if (orderData.customer_id) {
          const customerUpdate = await env.DB.prepare(`
            UPDATE customers 
            SET is_premium = 1, 
                extension_activated = 1,
                total_spent = COALESCE(total_spent, 0) + ?,
                total_orders = COALESCE(total_orders, 0) + 1,
                updated_at = ?
            WHERE id = ? AND (is_premium != 1 OR extension_activated != 1)
          `).bind(orderData.final_amount, now, orderData.customer_id).run();
          
          if (customerUpdate.meta?.changes && customerUpdate.meta.changes > 0) {
            updatedRecords++;
            console.log('Updated customer:', orderData.customer_id);
          }
        }

        // Update users table by email
        if (orderData.customer_email) {
          const userUpdate = await env.DB.prepare(`
            UPDATE users 
            SET is_premium = 1, 
                extension_activated = 1,
                premium_activated_at = ?,
                total_spent = COALESCE(total_spent, 0) + ?,
                total_orders = COALESCE(total_orders, 0) + 1
            WHERE email = ? AND (is_premium != 1 OR extension_activated != 1)
          `).bind(now, orderData.final_amount, orderData.customer_email).run();
          
          if (userUpdate.meta?.changes && userUpdate.meta.changes > 0) {
            updatedRecords++;
            console.log('Updated user:', orderData.customer_email);
          }
        }
      }
    }

    // Also check for any customers/users with orders but missing premium flags
    const missingPremiumCustomers = await env.DB.prepare(`
      SELECT c.id, c.email, c.name
      FROM customers c
      WHERE c.id IN (
        SELECT DISTINCT customer_id 
        FROM orders 
        WHERE status = 'completed' AND final_amount > 0
      ) AND (c.is_premium != 1 OR c.extension_activated != 1)
    `).all();

    if (missingPremiumCustomers.results && missingPremiumCustomers.results.length > 0) {
      for (const customer of missingPremiumCustomers.results) {
        const customerData = customer as any;
        
        await env.DB.prepare(`
          UPDATE customers 
          SET is_premium = 1, extension_activated = 1, updated_at = ?
          WHERE id = ?
        `).bind(now, customerData.id).run();
        
        updatedRecords++;
        console.log('Fixed missing premium status for customer:', customerData.id);
      }
    }

    return json({
      success: true,
      message: `Updated ${updatedRecords} records with premium status`,
      updatedRecords
    });

  } catch (error: any) {
    console.error('Error fixing existing purchases:', error);
    return json({
      success: false,
      message: 'Failed to fix existing purchases',
      error: error.message
    }, 500);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
