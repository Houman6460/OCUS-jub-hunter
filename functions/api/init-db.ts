import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../lib/context';

export const onRequestPost: PagesFunction<Env> = async ({ env }) => {
  try {
    if (!env.DB) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Database not available'
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Create all tables
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'customer',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_premium BOOLEAN DEFAULT 0,
        extension_activated BOOLEAN DEFAULT 0,
        total_spent DECIMAL(10,2) DEFAULT 0,
        total_orders INTEGER DEFAULT 0
      )
    `).run();

    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT UNIQUE NOT NULL,
        customer_id INTEGER NOT NULL,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        invoice_date TEXT NOT NULL,
        due_date TEXT NOT NULL,
        subtotal TEXT NOT NULL,
        total_amount TEXT NOT NULL,
        currency TEXT DEFAULT 'USD',
        status TEXT DEFAULT 'pending',
        paid_at DATETIME,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'completed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // Insert demo data
    const now = new Date().toISOString();
    
    // Demo user
    await env.DB.prepare(`
      INSERT OR REPLACE INTO users (id, email, password, name, role, created_at)
      VALUES (1, 'demo@example.com', 'demo123', 'Demo User', 'customer', ?)
    `).bind(now).run();

    // Demo customer
    await env.DB.prepare(`
      INSERT OR REPLACE INTO customers (id, email, name, created_at, is_premium, extension_activated, total_spent, total_orders)
      VALUES (1, 'demo@example.com', 'Demo User', ?, 1, 1, 29.99, 1)
    `).bind(now).run();

    // Demo invoice
    await env.DB.prepare(`
      INSERT OR REPLACE INTO invoices (id, invoice_number, customer_id, customer_name, customer_email, invoice_date, due_date, subtotal, total_amount, currency, status, paid_at, notes, created_at)
      VALUES (1, 'INV-2025-000001', 1, 'Demo User', 'demo@example.com', '2025-08-25', '2025-08-25', '29.99', '29.99', 'USD', 'paid', ?, 'Premium extension purchase', ?)
    `).bind(now, now).run();

    // Demo order
    await env.DB.prepare(`
      INSERT OR REPLACE INTO orders (id, customer_id, product_name, amount, status, created_at)
      VALUES (1, 1, 'Premium Extension', 29.99, 'completed', ?)
    `).bind(now).run();

    // Verify data
    const userCount = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
    const customerCount = await env.DB.prepare('SELECT COUNT(*) as count FROM customers').first();
    const invoiceCount = await env.DB.prepare('SELECT COUNT(*) as count FROM invoices').first();
    const orderCount = await env.DB.prepare('SELECT COUNT(*) as count FROM orders').first();

    return new Response(JSON.stringify({
      success: true,
      message: 'Database initialized successfully',
      tables: {
        users: userCount?.count || 0,
        customers: customerCount?.count || 0,
        invoices: invoiceCount?.count || 0,
        orders: orderCount?.count || 0
      }
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error: any) {
    console.error('Database initialization error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Database initialization failed: ' + error.message
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
};
