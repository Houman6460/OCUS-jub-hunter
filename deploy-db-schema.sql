-- URGENT: Execute this SQL in Cloudflare D1 Console to fix missing tables
-- Go to: Cloudflare Dashboard > D1 > ocus-tickets > Console
-- Copy and paste this SQL to create missing tables

-- Auth Settings Table (CRITICAL FOR LOGIN FUNCTIONALITY)
CREATE TABLE IF NOT EXISTS auth_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  google_enabled INTEGER DEFAULT 0,
  google_client_id TEXT,
  google_client_secret TEXT,
  facebook_enabled INTEGER DEFAULT 0,
  facebook_app_id TEXT,
  facebook_app_secret TEXT,
  github_enabled INTEGER DEFAULT 0,
  github_client_id TEXT,
  github_client_secret TEXT,
  recaptcha_enabled INTEGER DEFAULT 0,
  recaptcha_site_key TEXT,
  recaptcha_secret_key TEXT,
  recaptcha_mode TEXT DEFAULT 'v2',
  recaptcha_customer_enabled INTEGER DEFAULT 0,
  recaptcha_admin_enabled INTEGER DEFAULT 0,
  jwt_secret TEXT DEFAULT 'demo-jwt-secret',
  session_timeout INTEGER DEFAULT 3600,
  stripe_enabled INTEGER DEFAULT 0,
  stripe_public_key TEXT,
  stripe_secret_key TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Insert default auth settings
INSERT OR IGNORE INTO auth_settings (id, google_enabled, facebook_enabled, github_enabled) 
VALUES (1, 1, 1, 1);

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
