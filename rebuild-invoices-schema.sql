-- Rebuild invoices table to match Drizzle ORM schema in shared/schema.ts
-- Uses snake_case names and TEXT monetary amounts. Converts existing data.

PRAGMA foreign_keys=off;
BEGIN TRANSACTION;

-- 1) Create canonical invoices_new table
CREATE TABLE IF NOT EXISTS invoices_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT NOT NULL UNIQUE,
  order_id INTEGER,
  customer_id INTEGER,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_address TEXT,
  billing_address TEXT,
  invoice_date INTEGER NOT NULL DEFAULT (strftime('%s','now')*1000),
  due_date INTEGER NOT NULL,
  subtotal TEXT NOT NULL,
  tax_amount TEXT DEFAULT '0.00',
  discount_amount TEXT DEFAULT '0.00',
  total_amount TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'issued',
  paid_at INTEGER,
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')*1000),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now')*1000),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- 2) Copy/backfill from legacy invoices if it exists
INSERT INTO invoices_new (
  id,
  invoice_number,
  order_id,
  customer_id,
  customer_name,
  customer_email,
  customer_address,
  billing_address,
  invoice_date,
  due_date,
  subtotal,
  tax_amount,
  discount_amount,
  total_amount,
  currency,
  status,
  paid_at,
  notes,
  created_at,
  updated_at
)
SELECT
  inv.id,
  COALESCE(inv.invoice_number, 'INV-' || inv.id) AS invoice_number,
  inv.order_id,
  inv.customer_id,
  COALESCE(inv.customer_name, 'Unknown') AS customer_name,
  COALESCE(inv.customer_email, '') AS customer_email,
  NULL AS customer_address,
  NULL AS billing_address,
  -- Convert TEXT datetime to epoch ms if possible; if already integer-like, try casting
  CASE 
    WHEN inv.invoice_date IS NULL THEN (strftime('%s','now')*1000)
    WHEN typeof(inv.invoice_date) IN ('integer','real') THEN CAST(inv.invoice_date AS INTEGER)
    ELSE (strftime('%s', inv.invoice_date) * 1000)
  END AS invoice_date,
  CASE 
    WHEN inv.due_date IS NULL THEN (
      CASE 
        WHEN inv.invoice_date IS NULL THEN (strftime('%s','now')*1000)
        WHEN typeof(inv.invoice_date) IN ('integer','real') THEN CAST(inv.invoice_date AS INTEGER)
        ELSE (strftime('%s', inv.invoice_date) * 1000)
      END
    )
    WHEN typeof(inv.due_date) IN ('integer','real') THEN CAST(inv.due_date AS INTEGER)
    ELSE (strftime('%s', inv.due_date) * 1000)
  END AS due_date,
  -- Monetary conversions to TEXT(2)
  CASE 
    WHEN typeof(inv.subtotal) IN ('real','integer') THEN printf('%.2f', inv.subtotal)
    WHEN inv.subtotal IS NOT NULL THEN CAST(inv.subtotal AS TEXT)
    ELSE '0.00'
  END AS subtotal,
  CASE 
    WHEN typeof(inv.tax_amount) IN ('real','integer') THEN printf('%.2f', inv.tax_amount)
    WHEN inv.tax_amount IS NOT NULL THEN CAST(inv.tax_amount AS TEXT)
    ELSE '0.00'
  END AS tax_amount,
  CASE 
    WHEN typeof(inv.discount_amount) IN ('real','integer') THEN printf('%.2f', inv.discount_amount)
    WHEN inv.discount_amount IS NOT NULL THEN CAST(inv.discount_amount AS TEXT)
    ELSE '0.00'
  END AS discount_amount,
  CASE 
    WHEN typeof(inv.total_amount) IN ('real','integer') THEN printf('%.2f', inv.total_amount)
    WHEN inv.total_amount IS NOT NULL THEN CAST(inv.total_amount AS TEXT)
    ELSE '0.00'
  END AS total_amount,
  UPPER(COALESCE(inv.currency, 'USD')) AS currency,
  COALESCE(inv.status, 'issued') AS status,
  CASE 
    WHEN inv.paid_at IS NULL THEN NULL
    WHEN typeof(inv.paid_at) IN ('integer','real') THEN CAST(inv.paid_at AS INTEGER)
    ELSE (strftime('%s', inv.paid_at) * 1000)
  END AS paid_at,
  NULL AS notes,
  CASE 
    WHEN inv.created_at IS NULL THEN (strftime('%s','now')*1000)
    WHEN typeof(inv.created_at) IN ('integer','real') THEN CAST(inv.created_at AS INTEGER)
    ELSE (strftime('%s', inv.created_at) * 1000)
  END AS created_at,
  CASE 
    WHEN inv.updated_at IS NULL THEN (
      CASE 
        WHEN inv.created_at IS NULL THEN (strftime('%s','now')*1000)
        WHEN typeof(inv.created_at) IN ('integer','real') THEN CAST(inv.created_at AS INTEGER)
        ELSE (strftime('%s', inv.created_at) * 1000)
      END
    )
    WHEN typeof(inv.updated_at) IN ('integer','real') THEN CAST(inv.updated_at AS INTEGER)
    ELSE (strftime('%s', inv.updated_at) * 1000)
  END AS updated_at
FROM invoices AS inv
-- If invoices table does not exist or columns differ, this may fail; safe in environments where invoices exists.
;

-- 3) Replace old invoices table
DROP TABLE IF EXISTS invoices;
ALTER TABLE invoices_new RENAME TO invoices;

-- 4) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_invoices_customer_email ON invoices(customer_email);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);

COMMIT;
PRAGMA foreign_keys=on;
