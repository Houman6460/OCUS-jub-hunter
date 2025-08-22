-- URGENT: Execute this SQL in Cloudflare D1 Console to fix missing tables
-- Go to: Cloudflare Dashboard > D1 > ocus-tickets > Console
-- Copy and paste this SQL to create missing tables

-- Orders/Purchases Table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customerEmail TEXT NOT NULL,
  customerName TEXT NOT NULL,
  productId INTEGER NOT NULL,
  productName TEXT NOT NULL,
  originalAmount REAL NOT NULL,
  finalAmount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'pending',
  paymentMethod TEXT NOT NULL DEFAULT 'stripe',
  paymentIntentId TEXT,
  downloadToken TEXT UNIQUE,
  downloadCount INTEGER DEFAULT 0,
  maxDownloads INTEGER DEFAULT 5,
  activationCode TEXT,
  invoiceNumber TEXT UNIQUE,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  completedAt TEXT,
  FOREIGN KEY (productId) REFERENCES products(id)
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  hashedPassword TEXT,
  isActive BOOLEAN DEFAULT 1,
  isPremium BOOLEAN DEFAULT 0,
  registrationDate TEXT NOT NULL DEFAULT (datetime('now')),
  lastLoginAt TEXT,
  activationToken TEXT,
  passwordResetToken TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customerEmail);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(createdAt);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(isActive);

-- Verify tables were created
SELECT name FROM sqlite_master WHERE type='table' AND name IN ('orders', 'users');
