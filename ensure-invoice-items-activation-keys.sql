-- Create invoice_items and activation_keys tables if missing, plus indexes

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

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_activation_keys_key ON activation_keys(activation_key);
