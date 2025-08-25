import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../lib/db';

// Helper to return a JSON response
function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// This function will add the customer_id column to the tickets table.
// It's designed to be run once.
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.DB) {
    return json({ success: false, message: 'Database not available' }, 500);
  }

  try {
    // Add customer_id to tickets table
    const alterStmt = `ALTER TABLE tickets ADD COLUMN customer_id INTEGER;`;
    await env.DB.prepare(alterStmt).run();

    // Backfill customer_id for existing tickets from the customers table
    const backfillStmt = `
      UPDATE tickets
      SET customer_id = (SELECT id FROM customers WHERE email = tickets.customer_email)
      WHERE customer_id IS NULL;
    `;
    const backfillResult = await env.DB.prepare(backfillStmt).run();

    return json({
      success: true,
      message: 'Database migration successful: customer_id added and backfilled.',
      backfillDetails: backfillResult.meta,
    });
  } catch (e: any) {
    // If the column already exists, the error is expected. We can ignore it.
    if (e.message.includes('duplicate column name')) {
      return json({
        success: true,
        message: 'Migration not needed: customer_id column already exists.',
      });
    }
    console.error('Migration failed:', e);
    return json({ success: false, message: e.message }, 500);
  }
};

// OPTIONS handler for CORS preflight requests
export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
