-- Create orders table for purchase tracking
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  product_id TEXT NOT NULL DEFAULT 'ocus-extension',
  original_amount DECIMAL(10,2) NOT NULL,
  final_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT NOT NULL DEFAULT 'stripe' CHECK (payment_method IN ('stripe', 'paypal')),
  payment_intent_id TEXT,
  download_token TEXT UNIQUE,
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 5,
  activation_code TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  FOREIGN KEY (customer_id) REFERENCES users(id)
);

-- Create invoices table for receipt tracking
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id INTEGER NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  tax_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
  invoice_date TEXT DEFAULT (datetime('now')),
  due_date TEXT,
  paid_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (customer_id) REFERENCES users(id)
);

-- Add premium user fields to users table
ALTER TABLE users ADD COLUMN is_premium INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN premium_activated_at TEXT;
ALTER TABLE users ADD COLUMN total_spent DECIMAL(10,2) DEFAULT 0;
ALTER TABLE users ADD COLUMN total_orders INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN extension_activated INTEGER DEFAULT 0;

-- Create user_downloads table for tracking extension downloads
CREATE TABLE IF NOT EXISTS user_downloads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  order_id INTEGER,
  download_type TEXT NOT NULL CHECK (download_type IN ('premium', 'trial', 'update')),
  version TEXT NOT NULL DEFAULT 'v2.1.9',
  download_token TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Insert sample data for testing
INSERT OR IGNORE INTO orders (
  customer_id, customer_email, customer_name, product_id,
  original_amount, final_amount, currency, status, payment_method,
  download_token, activation_code, created_at, completed_at
) VALUES 
(1, 'user@example.com', 'Test User', 'ocus-extension',
 39.99, 39.99, 'eur', 'completed', 'stripe',
 'dl_' || hex(randomblob(16)), 'OCUS-' || hex(randomblob(8)),
 datetime('now', '-7 days'), datetime('now', '-7 days'));

-- Update user premium status based on completed orders
UPDATE users SET 
  is_premium = 1,
  premium_activated_at = datetime('now', '-7 days'),
  total_spent = (SELECT COALESCE(SUM(final_amount), 0) FROM orders WHERE customer_id = users.id AND status = 'completed'),
  total_orders = (SELECT COUNT(*) FROM orders WHERE customer_id = users.id AND status = 'completed'),
  extension_activated = 1
WHERE id IN (SELECT DISTINCT customer_id FROM orders WHERE status = 'completed');

-- Create invoice for the sample order
INSERT OR IGNORE INTO invoices (
  order_id, invoice_number, customer_id, customer_email, customer_name,
  amount, currency, status, invoice_date, paid_at
) VALUES (
  1, 'INV-' || strftime('%Y%m%d', 'now') || '-001',
  1, 'user@example.com', 'Test User',
  39.99, 'eur', 'paid', datetime('now', '-7 days'), datetime('now', '-7 days')
);
