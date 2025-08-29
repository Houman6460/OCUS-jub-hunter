-- Fix invoices table to match API expectations
-- Align invoices schema to Drizzle snake_case columns and TEXT monetary types
-- 1) Add missing columns (will error if already present; run once)
ALTER TABLE invoices ADD COLUMN customer_email TEXT;
ALTER TABLE invoices ADD COLUMN subtotal TEXT DEFAULT '0.00';
ALTER TABLE invoices ADD COLUMN discount_amount TEXT DEFAULT '0.00';
ALTER TABLE invoices ADD COLUMN total_amount TEXT DEFAULT '0.00';

-- 2) Backfill customer_email from related orders
UPDATE invoices
SET customer_email = (
  SELECT orders.customer_email
  FROM orders
  WHERE orders.id = invoices.order_id
)
WHERE customer_email IS NULL;

-- 3) Ensure invoice_items table exists with canonical schema
CREATE TABLE IF NOT EXISTS invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price TEXT NOT NULL,
  total_price TEXT NOT NULL,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- 4) Ensure activation_keys table exists (used by webhook)
CREATE TABLE IF NOT EXISTS activation_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  activation_key TEXT NOT NULL UNIQUE,
  is_active INTEGER DEFAULT 1,
  order_id INTEGER,
  user_id INTEGER,
  installation_id TEXT,
  used_at INTEGER,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 5) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_invoices_customer_email ON invoices(customer_email);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_activation_keys_key ON activation_keys(activation_key);
