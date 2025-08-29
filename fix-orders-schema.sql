-- Align orders table to Drizzle ORM schema (snake_case cols, TEXT monetary types, proper defaults)
-- This script rebuilds the orders table to match shared/schema.ts and backfills data from legacy columns.
-- Safe to run ONCE. Always backup before running in production.

PRAGMA foreign_keys=off;
BEGIN TRANSACTION;

-- 1) Create the new canonical orders table
CREATE TABLE IF NOT EXISTS orders_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  original_amount TEXT NOT NULL,
  final_amount TEXT NOT NULL,
  discount_amount TEXT DEFAULT '0',
  coupon_code TEXT,
  referral_code TEXT,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL,
  payment_intent_id TEXT,
  paypal_order_id TEXT,
  download_token TEXT NOT NULL,
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 3,
  activation_code TEXT,
  invoice_url TEXT,
  created_at INTEGER DEFAULT (strftime('%s','now')*1000),
  completed_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 2) Backfill from existing orders if present
-- Map legacy camelCase/mixed columns to new snake_case ones
INSERT INTO orders_new (
  id,
  user_id,
  customer_email,
  customer_name,
  original_amount,
  final_amount,
  discount_amount,
  coupon_code,
  referral_code,
  currency,
  status,
  payment_method,
  payment_intent_id,
  paypal_order_id,
  download_token,
  download_count,
  max_downloads,
  activation_code,
  invoice_url,
  created_at,
  completed_at
)
SELECT
  o.id,
  NULL AS user_id,
  COALESCE(o.customer_email, '') AS customer_email,
  COALESCE(o.customer_name, '') AS customer_name,
  -- original_amount may be REAL or TEXT; cast to TEXT with 2 decimals where possible
  CASE
    WHEN typeof(o.original_amount) IN ('real','integer') THEN printf('%.2f', o.original_amount)
    WHEN o.original_amount IS NOT NULL THEN CAST(o.original_amount AS TEXT)
    ELSE '0.00'
  END AS original_amount,
  CASE
    WHEN typeof(o.finalAmount) IN ('real','integer') THEN printf('%.2f', o.finalAmount)
    WHEN o.finalAmount IS NOT NULL THEN CAST(o.finalAmount AS TEXT)
    ELSE '0.00'
  END AS final_amount,
  '0' AS discount_amount,
  NULL AS coupon_code,
  NULL AS referral_code,
  LOWER(COALESCE(o.currency, 'usd')) AS currency,
  COALESCE(o.status, 'pending') AS status,
  COALESCE(o.paymentMethod, 'stripe') AS payment_method,
  o.paymentIntentId AS payment_intent_id,
  NULL AS paypal_order_id,
  COALESCE(o.downloadToken, 'download_' || strftime('%s','now')) AS download_token,
  COALESCE(o.downloadCount, 0) AS download_count,
  COALESCE(o.maxDownloads, 3) AS max_downloads,
  o.activationCode AS activation_code,
  NULL AS invoice_url,
  CASE WHEN o.createdAt IS NOT NULL THEN (strftime('%s', o.createdAt) * 1000) ELSE (strftime('%s','now')*1000) END AS created_at,
  CASE WHEN o.completedAt IS NOT NULL THEN (strftime('%s', o.completedAt) * 1000) ELSE NULL END AS completed_at
FROM orders o
-- If the legacy orders table doesn't exist, this INSERT will fail; ignore in dev if empty
;

-- 3) Replace old orders table
DROP TABLE IF EXISTS orders;
ALTER TABLE orders_new RENAME TO orders;

-- 4) Helpful indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id ON orders(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_download_token ON orders(download_token);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

COMMIT;
PRAGMA foreign_keys=on;
